// Copyright Dark Souls Game Project. All Rights Reserved. UE 4.22 - 4.24

#include "DarkSoulsCharacter.h"
#include "Camera/CameraComponent.h"
#include "GameFramework/SpringArmComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Kismet/KismetMathLibrary.h"
#include "Kismet/GameplayStatics.h"

ADarkSoulsCharacter::ADarkSoulsCharacter()
{
	PrimaryActorTick.bCanEverTick = true;

	MaxHealth = 1000.0f;
	CurrentHealth = MaxHealth;
	MaxStamina = 160.0f;
	CurrentStamina = MaxStamina;
	StaminaRegenRate = 45.0f;
	Souls = 0;
	EstusFlasks = 5;
	MaxEstusFlasks = 5;

	CombatState = EPlayerCombatState::Idle;
	bIsInvulnerable = false;
	bIsBlocking = false;
	bIsParryActive = false;
	LockedTarget = nullptr;

	StateTimer = 0.0f;
	StaminaDelayTimer = 0.0f;
	AttackComboCount = 0;

	// Camera setup
	CameraBoom = CreateDefaultSubobject<USpringArmComponent>(TEXT("CameraBoom"));
	CameraBoom->SetupAttachment(RootComponent);
	CameraBoom->TargetArmLength = 400.0f;
	CameraBoom->bUsePawnControlRotation = true;
	CameraBoom->SocketOffset = FVector(0.0f, 40.0f, 65.0f);

	FollowCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("FollowCamera"));
	FollowCamera->SetupAttachment(CameraBoom, USpringArmComponent::SocketName);
	FollowCamera->bUsePawnControlRotation = false;

	bUseControllerRotationPitch = false;
	bUseControllerRotationYaw = false;
	bUseControllerRotationRoll = false;

	GetCharacterMovement()->bOrientRotationToMovement = true;
	GetCharacterMovement()->RotationRate = FRotator(0.0f, 540.0f, 0.0f);
	GetCharacterMovement()->MaxWalkSpeed = 500.0f;
}

void ADarkSoulsCharacter::BeginPlay()
{
	Super::BeginPlay();
	OnHealthChanged.Broadcast(CurrentHealth, MaxHealth);
	OnStaminaChanged.Broadcast(CurrentStamina, MaxStamina);
	OnSoulsChanged.Broadcast(Souls);
	OnEstusChanged.Broadcast(EstusFlasks);
	OnNotification.Broadcast(TEXT("YOU HAVE ENTERED LORDRAN"));
}

void ADarkSoulsCharacter::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	// Stamina regeneration
	if (StaminaDelayTimer > 0.0f)
	{
		StaminaDelayTimer -= DeltaTime;
	}
	else if (CombatState != EPlayerCombatState::Rolling && CombatState != EPlayerCombatState::Attacking)
	{
		float RegenMultiplier = bIsBlocking ? 0.35f : 1.0f;
		CurrentStamina = FMath::Clamp(CurrentStamina + (StaminaRegenRate * RegenMultiplier * DeltaTime), 0.0f, MaxStamina);
		OnStaminaChanged.Broadcast(CurrentStamina, MaxStamina);
	}

	// Dodge Roll state machine with i-frames
	if (CombatState == EPlayerCombatState::Rolling)
	{
		StateTimer += DeltaTime;

		// Dark Souls i-frames window: 0.08s to 0.40s
		bIsInvulnerable = (StateTimer >= 0.08f && StateTimer <= 0.40f);

		// Roll movement momentum
		float RollProgress = FMath::Clamp(StateTimer / 0.58f, 0.0f, 1.0f);
		float Speed = FMath::Lerp(850.0f, 120.0f, RollProgress);
		AddMovementInput(RollDirection, Speed * DeltaTime);

		if (StateTimer >= 0.58f)
		{
			bIsInvulnerable = false;
			CombatState = EPlayerCombatState::Idle;
			StateTimer = 0.0f;
		}
	}
	else if (CombatState == EPlayerCombatState::Attacking)
	{
		StateTimer += DeltaTime;
		if (StateTimer >= 0.45f)
		{
			CombatState = EPlayerCombatState::Idle;
			StateTimer = 0.0f;
		}
	}
	else if (CombatState == EPlayerCombatState::Parrying)
	{
		StateTimer += DeltaTime;
		bIsParryActive = (StateTimer >= 0.10f && StateTimer <= 0.32f);
		if (StateTimer >= 0.50f)
		{
			bIsParryActive = false;
			CombatState = EPlayerCombatState::Idle;
			StateTimer = 0.0f;
		}
	}

	// Lock-on camera tracking
	if (LockedTarget)
	{
		FRotator TargetRotation = UKismetMathLibrary::FindLookAtRotation(GetActorLocation(), LockedTarget->GetActorLocation());
		TargetRotation.Pitch = FMath::Clamp(TargetRotation.Pitch, -20.0f, 25.0f);
		if (Controller)
		{
			Controller->SetControlRotation(FMath::RInterpTo(Controller->GetControlRotation(), TargetRotation, DeltaTime, 8.0f));
		}
	}
}

void ADarkSoulsCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
	Super::SetupPlayerInputComponent(PlayerInputComponent);

	PlayerInputComponent->BindAxis("MoveForward", this, &ADarkSoulsCharacter::MoveForward);
	PlayerInputComponent->BindAxis("MoveRight", this, &ADarkSoulsCharacter::MoveRight);
	PlayerInputComponent->BindAxis("Turn", this, &APawn::AddControllerYawInput);
	PlayerInputComponent->BindAxis("LookUp", this, &APawn::AddControllerPitchInput);

	PlayerInputComponent->BindAction("LightAttack", IE_Pressed, this, &ADarkSoulsCharacter::PerformLightAttack);
	PlayerInputComponent->BindAction("HeavyAttack", IE_Pressed, this, &ADarkSoulsCharacter::PerformHeavyAttack);
	PlayerInputComponent->BindAction("Block", IE_Pressed, this, &ADarkSoulsCharacter::StartBlock);
	PlayerInputComponent->BindAction("Block", IE_Released, this, &ADarkSoulsCharacter::StopBlock);
	PlayerInputComponent->BindAction("Parry", IE_Pressed, this, &ADarkSoulsCharacter::PerformParry);
	PlayerInputComponent->BindAction("DodgeRoll", IE_Pressed, this, &ADarkSoulsCharacter::PerformDodgeRoll);
	PlayerInputComponent->BindAction("EstusFlask", IE_Pressed, this, &ADarkSoulsCharacter::DrinkEstus);
	PlayerInputComponent->BindAction("LockOnTarget", IE_Pressed, this, &ADarkSoulsCharacter::ToggleLockOn);
	PlayerInputComponent->BindAction("Interact", IE_Pressed, this, &ADarkSoulsCharacter::RestAtBonfire);
}

void ADarkSoulsCharacter::MoveForward(float Value)
{
	if (CombatState != EPlayerCombatState::Rolling && Controller != nullptr && Value != 0.0f)
	{
		const FRotator Rotation = Controller->GetControlRotation();
		const FRotator YawRotation(0, Rotation.Yaw, 0);
		const FVector Direction = FRotationMatrix(YawRotation).GetUnitAxis(EAxis::X);
		AddMovementInput(Direction, Value);
	}
}

void ADarkSoulsCharacter::MoveRight(float Value)
{
	if (CombatState != EPlayerCombatState::Rolling && Controller != nullptr && Value != 0.0f)
	{
		const FRotator Rotation = Controller->GetControlRotation();
		const FRotator YawRotation(0, Rotation.Yaw, 0);
		const FVector Direction = FRotationMatrix(YawRotation).GetUnitAxis(EAxis::Y);
		AddMovementInput(Direction, Value);
	}
}

void ADarkSoulsCharacter::PerformDodgeRoll()
{
	if (CombatState == EPlayerCombatState::Dead || CurrentStamina < 24.0f) return;

	CurrentStamina = FMath::Max(0.0f, CurrentStamina - 24.0f);
	StaminaDelayTimer = 0.5f;
	OnStaminaChanged.Broadcast(CurrentStamina, MaxStamina);

	FVector InputVector = GetLastMovementInputVector();
	RollDirection = InputVector.IsNearlyZero() ? -GetActorForwardVector() : InputVector.GetSafeNormal();

	CombatState = EPlayerCombatState::Rolling;
	StateTimer = 0.0f;
	bIsInvulnerable = false;
	bIsBlocking = false;
}

void ADarkSoulsCharacter::PerformLightAttack()
{
	if (CombatState != EPlayerCombatState::Idle && CombatState != EPlayerCombatState::Locomotion) return;
	if (CurrentStamina < 22.0f) return;

	CurrentStamina = FMath::Max(0.0f, CurrentStamina - 22.0f);
	StaminaDelayTimer = 0.6f;
	OnStaminaChanged.Broadcast(CurrentStamina, MaxStamina);

	CombatState = EPlayerCombatState::Attacking;
	StateTimer = 0.0f;
	AttackComboCount = (AttackComboCount % 3) + 1;
}

void ADarkSoulsCharacter::PerformHeavyAttack()
{
	if (CombatState != EPlayerCombatState::Idle && CombatState != EPlayerCombatState::Locomotion) return;
	if (CurrentStamina < 40.0f) return;

	CurrentStamina = FMath::Max(0.0f, CurrentStamina - 40.0f);
	StaminaDelayTimer = 0.8f;
	OnStaminaChanged.Broadcast(CurrentStamina, MaxStamina);

	CombatState = EPlayerCombatState::Attacking;
	StateTimer = 0.0f;
}

void ADarkSoulsCharacter::StartBlock()
{
	if (CombatState == EPlayerCombatState::Idle || CombatState == EPlayerCombatState::Locomotion)
	{
		bIsBlocking = true;
		CombatState = EPlayerCombatState::Blocking;
	}
}

void ADarkSoulsCharacter::StopBlock()
{
	bIsBlocking = false;
	if (CombatState == EPlayerCombatState::Blocking)
	{
		CombatState = EPlayerCombatState::Idle;
	}
}

void ADarkSoulsCharacter::PerformParry()
{
	if (CombatState != EPlayerCombatState::Idle && CombatState != EPlayerCombatState::Blocking) return;
	if (CurrentStamina < 20.0f) return;

	CurrentStamina = FMath::Max(0.0f, CurrentStamina - 20.0f);
	StaminaDelayTimer = 0.7f;
	OnStaminaChanged.Broadcast(CurrentStamina, MaxStamina);

	CombatState = EPlayerCombatState::Parrying;
	StateTimer = 0.0f;
	bIsBlocking = false;
}

void ADarkSoulsCharacter::DrinkEstus()
{
	if (EstusFlasks <= 0 || CombatState != EPlayerCombatState::Idle) return;

	EstusFlasks--;
	CurrentHealth = FMath::Clamp(CurrentHealth + 450.0f, 0.0f, MaxHealth);
	OnHealthChanged.Broadcast(CurrentHealth, MaxHealth);
	OnEstusChanged.Broadcast(EstusFlasks);
	OnNotification.Broadcast(TEXT("ESTUS RECOVERED HEALTH"));
}

void ADarkSoulsCharacter::ToggleLockOn()
{
	if (LockedTarget)
	{
		LockedTarget = nullptr;
		OnNotification.Broadcast(TEXT("LOCK-ON RELEASED"));
	}
	else
	{
		// Find closest enemy actor within 20m
		TArray<AActor*> FoundEnemies;
		UGameplayStatics::GetAllActorsWithTag(GetWorld(), FName("Enemy"), FoundEnemies);
		float ClosestDist = 2000.0f; // 20m
		AActor* BestTarget = nullptr;

		for (AActor* Enemy : FoundEnemies)
		{
			float Dist = FVector::Dist(GetActorLocation(), Enemy->GetActorLocation());
			if (Dist < ClosestDist)
			{
				ClosestDist = Dist;
				BestTarget = Enemy;
			}
		}

		LockedTarget = BestTarget;
		if (LockedTarget)
		{
			OnNotification.Broadcast(TEXT("LOCKED ON TARGET"));
		}
	}
}

void ADarkSoulsCharacter::TakeDamageFromEnemy(float DamageAmount, FVector HitDirection)
{
	if (bIsInvulnerable || CombatState == EPlayerCombatState::Dead) return;

	if (bIsParryActive)
	{
		OnNotification.Broadcast(TEXT("PARRY SUCCESSFUL! RIPOSTE WINDOW OPEN!"));
		return;
	}

	if (bIsBlocking && CurrentStamina >= 25.0f)
	{
		CurrentStamina = FMath::Max(0.0f, CurrentStamina - (DamageAmount * 0.4f));
		StaminaDelayTimer = 0.6f;
		OnStaminaChanged.Broadcast(CurrentStamina, MaxStamina);
		OnNotification.Broadcast(TEXT("ATTACK BLOCKED"));
		return;
	}

	CurrentHealth = FMath::Clamp(CurrentHealth - DamageAmount, 0.0f, MaxHealth);
	OnHealthChanged.Broadcast(CurrentHealth, MaxHealth);

	if (CurrentHealth <= 0.0f)
	{
		CombatState = EPlayerCombatState::Dead;
		OnNotification.Broadcast(TEXT("YOU DIED"));
	}
}

void ADarkSoulsCharacter::RestAtBonfire()
{
	CurrentHealth = MaxHealth;
	CurrentStamina = MaxStamina;
	EstusFlasks = MaxEstusFlasks;
	OnHealthChanged.Broadcast(CurrentHealth, MaxHealth);
	OnStaminaChanged.Broadcast(CurrentStamina, MaxStamina);
	OnEstusChanged.Broadcast(EstusFlasks);
	OnNotification.Broadcast(TEXT("BONFIRE REST &bull; HP & ESTUS RESTORED"));
}

void ADarkSoulsCharacter::AddSouls(int32 Amount)
{
	Souls += Amount;
	OnSoulsChanged.Broadcast(Souls);
}
