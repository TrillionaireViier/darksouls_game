// Copyright Dark Souls Game Project. All Rights Reserved. UE 4.22 - 4.24

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "DarkSoulsBoss.generated.h"

UENUM(BlueprintType)
enum class EBossType : uint8
{
	TaurusDemon,
	BellGargoyle,
	CapraDemon,
	GreatGreyWolfSif,
	LordGwyn
};

UENUM(BlueprintType)
enum class EBossAIState : uint8
{
	Dormant,
	Chasing,
	Attacking,
	SpecialMove,
	Staggered,
	Defeated
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(FOnBossHealthChanged, EBossType, BossType, float, CurrentHealth, float, MaxHealth);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnBossAwakened, const FString&, BossName);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnBossDefeated, const FString&, BossName, int32, SoulReward);

UCLASS()
class DARKSOULSGAME_API ADarkSoulsBoss : public ACharacter
{
	GENERATED_BODY()

public:
	ADarkSoulsBoss();

	virtual void BeginPlay() override;
	virtual void Tick(float DeltaTime) override;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss Configuration")
	EBossType BossType;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Boss Configuration")
	FString BossDisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss Stats")
	float MaxHealth;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Boss Stats")
	float CurrentHealth;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss Stats")
	float BaseDamage;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Boss Stats")
	int32 SoulReward;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Boss Stats")
	bool bIsPhaseTwo;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Boss AI")
	EBossAIState AIState;

	UPROPERTY(BlueprintAssignable, Category = "Events")
	FOnBossHealthChanged OnBossHealthChanged;

	UPROPERTY(BlueprintAssignable, Category = "Events")
	FOnBossAwakened OnBossAwakened;

	UPROPERTY(BlueprintAssignable, Category = "Events")
	FOnBossDefeated OnBossDefeated;

	UFUNCTION(BlueprintCallable, Category = "Boss Combat")
	void InitializeBoss(EBossType InBossType);

	UFUNCTION(BlueprintCallable, Category = "Boss Combat")
	void TakeDamageFromPlayer(float DamageAmount);

	UFUNCTION(BlueprintCallable, Category = "Boss Combat")
	void ExecuteAttack();

private:
	class ADarkSoulsCharacter* PlayerTarget;
	float AttackCooldownTimer;
	float StateTimer;
};
