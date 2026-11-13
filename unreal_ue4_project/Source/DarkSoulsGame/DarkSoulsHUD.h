// Copyright Dark Souls Game Project. All Rights Reserved. UE 4.22 - 4.24

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/HUD.h"
#include "DarkSoulsHUD.generated.h"

UCLASS()
class DARKSOULSGAME_API ADarkSoulsHUD : public AHUD
{
	GENERATED_BODY()

public:
	ADarkSoulsHUD();

	virtual void DrawHUD() override;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dark Souls UI")
	bool bShowDeathScreen;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dark Souls UI")
	bool bShowVictoryScreen;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Dark Souls UI")
	FString NotificationText;

	UFUNCTION(BlueprintCallable, Category = "Dark Souls UI")
	void TriggerNotification(const FString& InText);
};
