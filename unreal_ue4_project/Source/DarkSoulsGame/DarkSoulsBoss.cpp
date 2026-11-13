// Copyright Dark Souls Game Project. All Rights Reserved. UE 4.22 - 4.24

#include "DarkSoulsBoss.h"
#include "DarkSoulsCharacter.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Kismet/GameplayStatics.h"
#include "Kismet/KismetMathLibrary.h"

ADarkSoulsBoss::ADarkSoulsBoss()
{
	PrimaryActorTick.bCanEverTick = true;
	Tags.Add(FName("Enemy"));

	BossType = EBossType::TaurusDemon;
	AIState = EBossAIState::Dormant;
	bIsPhaseTwo = false;
	AttackCooldownTimer = 0.0f;
	StateTimer = 0.0f;

	GetCharacterMovement()->bOrientRotationToMovement = true;
	GetCharacterMovement()->RotationRate = FRotator(0.0f, 300.0f, 0.0f);
}

void ADarkSoulsBoss::BeginPlay()
{
	Super::BeginPlay();
	InitializeBoss(BossType);
	PlayerTarget = Cast<ADarkSoulsCharacter>(UGameplayStatics::GetPlayerCharacter(GetWorld(), 0));
}

void ADarkSoulsBoss::InitializeBoss(EBossType InBossType)
{
	BossType = InBossType;
	bIsPhaseTwo = false;

	switch (BossType)
	{
	case EBossType::TaurusDemon:
		BossDisplayName = TEXT("Taurus Demon");
		MaxHealth = 2400.0f;
		BaseDamage = 260.0f;
		SoulReward = 5000;
		GetCharacterMovement()->MaxWalkSpeed = 380.0f;
		break;

	case EBossType::BellGargoyle:
		BossDisplayName = TEXT("Bell Gargoyle");
		MaxHealth = 2100.0f;
		BaseDamage = 230.0f;
		SoulReward = 6500;
		GetCharacterMovement()->MaxWalkSpeed = 440.0f;
		break;

	case EBossType::CapraDemon:
		BossDisplayName = TEXT("Capra Demon");
		MaxHealth = 1900.0f;
		BaseDamage = 290.0f;
		SoulReward = 7500;
		GetCharacterMovement()->MaxWalkSpeed = 490.0f;
		break;

	case EBossType::GreatGreyWolfSif:
		BossDisplayName = TEXT("Great Grey Wolf Sif");
		MaxHealth = 2800.0f;
		BaseDamage = 270.0f;
		SoulReward = 12000;
		GetCharacterMovement()->MaxWalkSpeed = 530.0f;
		break;

	case EBossType::LordGwyn:
		BossDisplayName = TEXT("Gwyn, Lord of Cinder");
		MaxHealth = 3400.0f;
		BaseDamage = 320.0f;
		SoulReward = 20000;
		GetCharacterMovement()->MaxWalkSpeed = 520.0f;
		break;
	}

	CurrentHealth = MaxHealth;
	OnBossHealthChanged.Broadcast(BossType, CurrentHealth, MaxHealth);
	OnBossAwakened.Broadcast(BossDisplayName);
}

void ADarkSoulsBoss::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	if (AIState == EBossAIState::Defeated || !PlayerTarget) return;

	if (AttackCooldownTimer > 0.0f)
	{
		AttackCooldownTimer -= DeltaTime;
	}

	float DistToPlayer = FVector::Dist(GetActorLocation(), PlayerTarget->GetActorLocation());

	// Awaken if within range
	if (AIState == EBossAIState::Dormant)
	{
		if (DistToPlayer < 1800.0f)
		{
			AIState = EBossAIState::Chasing;
		}
		return;
	}

	// Phase 2 check (< 50% HP)
	if (!bIsPhaseTwo && CurrentHealth <= (MaxHealth * 0.5f))
	{
		bIsPhaseTwo = true;
		BaseDamage *= 1.25f;
		GetCharacterMovement()->MaxWalkSpeed *= 1.15f;
	}

	// Rotate towards player
	FRotator LookRot = UKismetMathLibrary::FindLookAtRotation(GetActorLocation(), PlayerTarget->GetActorLocation());
	LookRot.Pitch = 0.0f;
	LookRot.Roll = 0.0f;
	SetActorRotation(FMath::RInterpTo(GetActorRotation(), LookRot, DeltaTime, 5.0f));

	// Behavior
	if (DistToPlayer <= 320.0f && AttackCooldownTimer <= 0.0f)
	{
		ExecuteAttack();
	}
	else if (DistToPlayer > 300.0f)
	{
		FVector Direction = (PlayerTarget->GetActorLocation() - GetActorLocation()).GetSafeNormal2D();
		AddMovementInput(Direction, 1.0f);
	}
}

void ADarkSoulsBoss::ExecuteAttack()
{
	AIState = EBossAIState::Attacking;
	AttackCooldownTimer = bIsPhaseTwo ? 1.6f : 2.4f;

	if (PlayerTarget)
	{
		FVector HitDir = (PlayerTarget->GetActorLocation() - GetActorLocation()).GetSafeNormal();
		PlayerTarget->TakeDamageFromEnemy(BaseDamage, HitDir);
	}

	FTimerHandle ResetTimer;
	GetWorld()->GetTimerManager().SetTimer(ResetTimer, [this]() {
		if (AIState != EBossAIState::Defeated)
		{
			AIState = EBossAIState::Chasing;
		}
	}, 0.8f, false);
}

void ADarkSoulsBoss::TakeDamageFromPlayer(float DamageAmount)
{
	if (AIState == EBossAIState::Defeated) return;

	CurrentHealth = FMath::Clamp(CurrentHealth - DamageAmount, 0.0f, MaxHealth);
	OnBossHealthChanged.Broadcast(BossType, CurrentHealth, MaxHealth);

	if (CurrentHealth <= 0.0f)
	{
		AIState = EBossAIState::Defeated;
		if (PlayerTarget)
		{
			PlayerTarget->AddSouls(SoulReward);
		}
		OnBossDefeated.Broadcast(BossDisplayName, SoulReward);
	}
}
