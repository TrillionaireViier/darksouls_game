// Copyright Dark Souls Game Project. All Rights Reserved. UE 4.22 - 4.24

#include "DarkSoulsGameMode.h"
#include "DarkSoulsCharacter.h"
#include "Kismet/GameplayStatics.h"

ADarkSoulsGameMode::ADarkSoulsGameMode()
{
	DefaultPawnClass = ADarkSoulsCharacter::StaticClass();
}

void ADarkSoulsGameMode::SpawnBoss(EBossType BossType, FVector Location, FRotator Rotation)
{
	FActorSpawnParameters SpawnParams;
	SpawnParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

	ADarkSoulsBoss* NewBoss = GetWorld()->SpawnActor<ADarkSoulsBoss>(ADarkSoulsBoss::StaticClass(), Location, Rotation, SpawnParams);
	if (NewBoss)
	{
		NewBoss->InitializeBoss(BossType);
	}
}

void ADarkSoulsGameMode::RestartAtLastBonfire()
{
	ADarkSoulsCharacter* Player = Cast<ADarkSoulsCharacter>(UGameplayStatics::GetPlayerCharacter(GetWorld(), 0));
	if (Player)
	{
		Player->RestAtBonfire();
	}
}
