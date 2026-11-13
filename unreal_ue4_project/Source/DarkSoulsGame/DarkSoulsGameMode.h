// Copyright Dark Souls Game Project. All Rights Reserved. UE 4.22 - 4.24

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "DarkSoulsBoss.h"
#include "DarkSoulsGameMode.generated.h"

UCLASS()
class DARKSOULSGAME_API ADarkSoulsGameMode : public AGameModeBase
{
	GENERATED_BODY()

public:
	ADarkSoulsGameMode();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dark Souls Game")
	TSubclassOf<class ADarkSoulsBoss> BossClass;

	UFUNCTION(BlueprintCallable, Category = "Dark Souls Game")
	void SpawnBoss(EBossType BossType, FVector Location, FRotator Rotation);

	UFUNCTION(BlueprintCallable, Category = "Dark Souls Game")
	void RestartAtLastBonfire();
};
