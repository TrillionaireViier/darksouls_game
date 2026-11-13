// Copyright Dark Souls Game Project. All Rights Reserved. UE 4.22 - 4.24

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "DarkSoulsCharacter.generated.h"

UENUM(BlueprintType)
enum class EPlayerCombatState : uint8
{
	Idle,
	Locomotion,
	Rolling,
	Attacking,
	Blocking,
	Parrying,
	DrinkingEstus,
	Staggered,
	Dead
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnPlayerHealthChanged, float, CurrentHealth, float, MaxHealth);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnPlayerStaminaChanged, float, CurrentStamina, float, MaxStamina);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnPlayerSoulsChanged, int32, Souls);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnEstusFlaskCountChanged, int32, EstusCount);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnPlayerNotification, const FString&, Message);

UCLASS()
class DARKSOULSGAME_API ADarkSoulsCharacter : public ACharacter
{
	GENERATED_BODY()

public:
	ADarkSoulsCharacter();

	virtual void BeginPlay() override;
	virtual void Tick(float DeltaTime) override;
	virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;

	// Camera & Spring Arm
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera")
	class USpringArmComponent* CameraBoom;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera")
	class UCameraComponent* FollowCamera;

	// Stats
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dark Souls Stats")
	float MaxHealth;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Dark Souls Stats")
	float CurrentHealth;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dark Souls Stats")
	float MaxStamina;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Dark Souls Stats")
	float CurrentStamina;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dark Souls Stats")
	float StaminaRegenRate;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Dark Souls Stats")
	int32 Souls;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dark Souls Stats")
	int32 EstusFlasks;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dark Souls Stats")
	int32 MaxEstusFlasks;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Dark Souls Combat")
	EPlayerCombatState CombatState;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Dark Souls Combat")
	bool bIsInvulnerable;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Dark Souls Combat")
	bool bIsBlocking;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Dark Souls Combat")
	bool bIsParryActive;

	// Lock-on Target
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Dark Souls Target")
	AActor* LockedTarget;

	// Delegates
	UPROPERTY(BlueprintAssignable, Category = "Events")
	FOnPlayerHealthChanged OnHealthChanged;

	UPROPERTY(BlueprintAssignable, Category = "Events")
	FOnPlayerStaminaChanged OnStaminaChanged;

	UPROPERTY(BlueprintAssignable, Category = "Events")
	FOnPlayerSoulsChanged OnSoulsChanged;

	UPROPERTY(BlueprintAssignable, Category = "Events")
	FOnEstusFlaskCountChanged OnEstusChanged;

	UPROPERTY(BlueprintAssignable, Category = "Events")
	FOnPlayerNotification OnNotification;

	// Actions
	UFUNCTION(BlueprintCallable, Category = "Dark Souls Combat")
	void PerformLightAttack();

	UFUNCTION(BlueprintCallable, Category = "Dark Souls Combat")
	void PerformHeavyAttack();

	UFUNCTION(BlueprintCallable, Category = "Dark Souls Combat")
	void StartBlock();

	UFUNCTION(BlueprintCallable, Category = "Dark Souls Combat")
	void StopBlock();

	UFUNCTION(BlueprintCallable, Category = "Dark Souls Combat")
	void PerformParry();

	UFUNCTION(BlueprintCallable, Category = "Dark Souls Combat")
	void PerformDodgeRoll();

	UFUNCTION(BlueprintCallable, Category = "Dark Souls Combat")
	void DrinkEstus();

	UFUNCTION(BlueprintCallable, Category = "Dark Souls Combat")
	void ToggleLockOn();

	UFUNCTION(BlueprintCallable, Category = "Dark Souls Combat")
	void TakeDamageFromEnemy(float DamageAmount, FVector HitDirection);

	UFUNCTION(BlueprintCallable, Category = "Dark Souls Bonfire")
	void RestAtBonfire();

	UFUNCTION(BlueprintCallable, Category = "Dark Souls Souls")
	void AddSouls(int32 Amount);

private:
	void MoveForward(float Value);
	void MoveRight(float Value);
	void TurnAtRate(float Rate);
	void LookUpAtRate(float Rate);

	FVector RollDirection;
	float StateTimer;
	float StaminaDelayTimer;
	int32 AttackComboCount;
};
