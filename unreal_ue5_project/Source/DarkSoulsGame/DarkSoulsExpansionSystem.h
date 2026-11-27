#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "DarkSoulsExpansionSystem.generated.h"

USTRUCT(BlueprintType)
struct FDarkSoulsLocationData
{
    GENERATED_BODY()

    UPROPERTY(BlueprintReadOnly, Category = "DarkSouls|World")
    FString LocationName;

    UPROPERTY(BlueprintReadOnly, Category = "DarkSouls|World")
    FString ZoneName;

    UPROPERTY(BlueprintReadOnly, Category = "DarkSouls|World")
    FVector WorldPosition;

    UPROPERTY(BlueprintReadOnly, Category = "DarkSouls|World")
    FString BossName;

    UPROPERTY(BlueprintReadOnly, Category = "DarkSouls|World")
    int32 DangerTier = 1;
};

UCLASS()
class DARKSOULSGAME_API ADarkSoulsExpansionSystem : public AActor
{
    GENERATED_BODY()

public:
    ADarkSoulsExpansionSystem();

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "DarkSouls|World")
    float ChunkSizeMeters = 400.0f;

    UPROPERTY(BlueprintReadOnly, Category = "DarkSouls|Arsenal")
    int32 CurrentWeaponIndex = 0;

    UPROPERTY(BlueprintReadOnly, Category = "DarkSouls|Arsenal")
    int32 CurrentSpellIndex = 0;

    UPROPERTY(BlueprintReadOnly, Category = "DarkSouls|Arsenal")
    int32 CurrentRingIndex = 0;

    UPROPERTY(BlueprintReadOnly, Category = "DarkSouls|Covenant")
    int32 CurrentCovenantIndex = 0;

    UFUNCTION(BlueprintCallable, Category = "DarkSouls|World")
    int64 GetTotalLocationsCount() const { return 141303125LL; }

    UFUNCTION(BlueprintCallable, Category = "DarkSouls|World")
    FDarkSoulsLocationData GetLocationAtIndex(int64 Index) const;

    UFUNCTION(BlueprintCallable, Category = "DarkSouls|Arsenal")
    FString GetWeaponName(int32 Index) const;

    UFUNCTION(BlueprintCallable, Category = "DarkSouls|Arsenal")
    FString GetSpellName(int32 Index) const;

    UFUNCTION(BlueprintCallable, Category = "DarkSouls|Arsenal")
    FString GetRingName(int32 Index) const;

    UFUNCTION(BlueprintCallable, Category = "DarkSouls|Bosses")
    FString GetBossEncounterName(int32 BossIdx, int32 AscensionTier) const;

    UFUNCTION(BlueprintCallable, Category = "DarkSouls|Arsenal")
    void CycleWeapon() { CurrentWeaponIndex = (CurrentWeaponIndex + 1) % 1875; }

    UFUNCTION(BlueprintCallable, Category = "DarkSouls|Arsenal")
    void CycleSpell() { CurrentSpellIndex = (CurrentSpellIndex + 1) % 1250; }

    UFUNCTION(BlueprintCallable, Category = "DarkSouls|Arsenal")
    void CycleRing() { CurrentRingIndex = (CurrentRingIndex + 1) % 1250; }

    UFUNCTION(BlueprintCallable, Category = "DarkSouls|Covenant")
    void CycleCovenant() { CurrentCovenantIndex = (CurrentCovenantIndex + 1) % 300; }
};
