// Copyright Dark Souls Game Project. All Rights Reserved. UE 4.22 - 4.24

#include "DarkSoulsHUD.h"
#include "Engine/Canvas.h"

ADarkSoulsHUD::ADarkSoulsHUD()
{
	bShowDeathScreen = false;
	bShowVictoryScreen = false;
}

void ADarkSoulsHUD::DrawHUD()
{
	Super::DrawHUD();

	if (!Canvas) return;

	if (bShowDeathScreen)
	{
		FCanvasTextItem TextItem(FVector2D(Canvas->SizeX * 0.5f - 120.0f, Canvas->SizeY * 0.45f), FText::FromString(TEXT("YOU DIED")), GEngine->GetLargeFont(), FLinearColor(0.85f, 0.05f, 0.05f));
		TextItem.Scale = FVector2D(1.8f, 1.8f);
		Canvas->DrawItem(TextItem);
	}
	else if (bShowVictoryScreen)
	{
		FCanvasTextItem TextItem(FVector2D(Canvas->SizeX * 0.5f - 180.0f, Canvas->SizeY * 0.45f), FText::FromString(TEXT("VICTORY ACHIEVED")), GEngine->GetLargeFont(), FLinearColor(1.0f, 0.85f, 0.3f));
		TextItem.Scale = FVector2D(1.8f, 1.8f);
		Canvas->DrawItem(TextItem);
	}
}

void ADarkSoulsHUD::TriggerNotification(const FString& InText)
{
	NotificationText = InText;
}
