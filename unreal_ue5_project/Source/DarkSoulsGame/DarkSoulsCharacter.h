// Copyright Dark Souls Game Project. All Rights Reserved. UE 5.8

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "InputActionValue.h"
#include "DarkSoulsCharacter.generated.h"

class UInputMappingContext;
class UInputAction;

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

UENUM(BlueprintType)
enum class ESacredCovenant : uint8
{
	None,
	WarriorsOfSunlight,
	Darkwraiths,
	ForestHunters,
	BladeOfTheDarkmoon,
	GravelordServant,
	ChaosServant
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

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera")
	TObjectPtr<class USpringArmComponent> CameraBoom;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera")
	TObjectPtr<class UCameraComponent> FollowCamera;

	// UE5 Enhanced Input Assets (optional Blueprint assignment; falls back cleanly to DefaultInput.ini bindings)
	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputMappingContext> DefaultMappingContext;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> MoveAction;

	UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Input")
	TObjectPtr<UInputAction> LookAction;

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

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dark Souls Stats")
	float MaxPoise;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Dark Souls Stats")
	float CurrentPoise;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dark Souls Stats")
	float PoiseRegenRate;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Dark Souls Stats")
	int32 Souls;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dark Souls Stats")
	int32 EstusFlasks;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dark Souls Stats")
	int32 MaxEstusFlasks;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dark Souls Covenants")
	ESacredCovenant ActiveCovenant;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Dark Souls Combat")
	EPlayerCombatState CombatState;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Dark Souls Combat")
	bool bIsInvulnerable;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Dark Souls Combat")
	bool bIsBlocking;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Dark Souls Combat")
	bool bIsParryActive;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Dark Souls Target")
	TObjectPtr<AActor> LockedTarget;

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

	UFUNCTION(BlueprintCallable, Category = "Dark Souls Covenants")
	void JoinCovenant(ESacredCovenant NewCovenant);

	UFUNCTION(BlueprintCallable, Category = "Dark Souls Bonfire")
	void RestAtBonfire();

	UFUNCTION(BlueprintCallable, Category = "Dark Souls Souls")
	void AddSouls(int32 Amount);

private:
	void MoveEnhanced(const FInputActionValue& Value);
	void LookEnhanced(const FInputActionValue& Value);
	void MoveForward(float Value);
	void MoveRight(float Value);
	void CheckAbyssRescue();

	FVector RollDirection;
	float StateTimer;
	float StaminaDelayTimer;
	float PoiseDelayTimer;
	int32 AttackComboCount;
};
