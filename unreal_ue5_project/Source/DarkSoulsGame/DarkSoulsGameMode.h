// Copyright Dark Souls Game Project. All Rights Reserved. UE 5.8

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "DarkSoulsBoss.h"
#include "DarkSoulsGameMode.generated.h"

USTRUCT(BlueprintType)
struct FDarkSoulsLocationEntry
{
	GENERATED_BODY()

	UPROPERTY(BlueprintReadOnly, Category = "World")
	FString Id;

	UPROPERTY(BlueprintReadOnly, Category = "World")
	FString Name;

	UPROPERTY(BlueprintReadOnly, Category = "World")
	FString Zone;

	UPROPERTY(BlueprintReadOnly, Category = "World")
	FVector WorldPositionCm = FVector::ZeroVector;
};

UCLASS()
class DARKSOULSGAME_API ADarkSoulsGameMode : public AGameModeBase
{
	GENERATED_BODY()

public:
	ADarkSoulsGameMode();

	virtual void BeginPlay() override;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dark Souls Game")
	TSubclassOf<class ADarkSoulsBoss> BossClass;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Dark Souls World")
	FVector LastSafeBonfireLocation;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Dark Souls World")
	int32 TotalLocationsCount;

	UFUNCTION(BlueprintCallable, Category = "Dark Souls Game")
	void SpawnBoss(EBossType BossType, FVector Location, FRotator Rotation);

	UFUNCTION(BlueprintCallable, Category = "Dark Souls Game")
	void RestartAtLastBonfire();

	UFUNCTION(BlueprintCallable, Category = "Dark Souls World")
	void RespawnPlayerSafely();

	UFUNCTION(BlueprintCallable, Category = "Dark Souls World")
	void SetSafeBonfireCheckpoint(FVector Location, bool bIsBossArena = false);

	UFUNCTION(BlueprintCallable, Category = "Dark Souls World")
	double GetGroundHeightAtLocation(double XCm, double YCm, double CurrentZCm) const;

	UFUNCTION(BlueprintCallable, Category = "Dark Souls World")
	bool FastTravelToLocationById(const FString& LocationId, bool bIsBossArena = false);

private:
	void BuildSpatialLocations5x();
	static FIntVector ToGridCell(double XCm, double YCm, double CellSizeCm);

	TArray<FDarkSoulsLocationEntry> AllLocations;
	TMap<FIntVector, TArray<int32>> LocationSpatialGrid;
	TMap<FString, int32> LocationIdLookup;
	double LocationCellSizeCm;
};
