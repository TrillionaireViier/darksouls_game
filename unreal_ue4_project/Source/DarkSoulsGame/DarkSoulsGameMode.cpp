// Copyright Dark Souls Game Project. All Rights Reserved. UE 4.27

#include "DarkSoulsGameMode.h"
#include "DarkSoulsCharacter.h"
#include "Kismet/GameplayStatics.h"

ADarkSoulsGameMode::ADarkSoulsGameMode()
{
	DefaultPawnClass = ADarkSoulsCharacter::StaticClass();
	LastSafeBonfireLocation = FVector(0.0f, 500.0f, 90.0f);
	LocationCellSizeCm = 500000.0f; // 5000m spatial hash cell
	TotalLocationsCount = 0;
}

void ADarkSoulsGameMode::BeginPlay()
{
	Super::BeginPlay();
	BuildSpatialLocations5x();
}

FIntVector ADarkSoulsGameMode::ToGridCell(float XCm, float YCm, float CellSizeCm)
{
	return FIntVector(
		FMath::FloorToInt(XCm / CellSizeCm),
		FMath::FloorToInt(YCm / CellSizeCm),
		0
	);
}

void ADarkSoulsGameMode::BuildSpatialLocations5x()
{
	const TCHAR* Zones[] = {
		TEXT("Firelink Citadel"), TEXT("Anor Londo"), TEXT("Darkroot Woods"), TEXT("Ash Lake"),
		TEXT("Blighttown"), TEXT("Sunken Serpent Abyss"), TEXT("Altus Plateau"), TEXT("Carian Observatory"),
		TEXT("Leyndell Capital"), TEXT("Cainhurst Parapets"), TEXT("Ashina Castle"), TEXT("Fountainhead Palace")
	};
	const TCHAR* SectorTags[] = {
		TEXT("Core Realm"), TEXT("Outer Abyssal Rim"), TEXT("Astral Titan Expanse"),
		TEXT("Primordial Horizon"), TEXT("Eternal Eclipse Reach")
	};

	const int32 BaseSectors = 45217;
	AllLocations.Reserve(BaseSectors * 5);

	for (int32 S = 0; S < 5; S++)
	{
		const float Mult = 1.0f + S * 1.15f;
		const float SignX = (S % 2 == 0) ? 1.0f : -1.0f;
		const float SignY = (S < 3) ? 1.0f : -1.0f;

		for (int32 I = 0; I < BaseSectors; I++)
		{
			const float Angle = FMath::DegreesToRadians((float)(I % 360));
			const float DistCm = (350.0f + (I % 64) * 520.0f * Mult) * 100.0f;
			const float WX = FMath::Cos(Angle) * DistCm * SignX;
			const float WY = FMath::Sin(Angle) * DistCm * SignY;
			const float WZ = ((I % 5 == 0) ? -600.0f : ((I % 7 == 0) ? 1400.0f : 0.0f));

			FDarkSoulsLocationEntry Entry;
			Entry.Id = FString::Printf(TEXT("loc_5x_s%d_%d"), S, I);
			Entry.Zone = Zones[I % 12];
			Entry.Name = FString::Printf(TEXT("%s Sector #%d [%s]"), *Entry.Zone, I + 1, SectorTags[S]);
			Entry.WorldPositionCm = FVector(WX, WY, WZ);

			const int32 Idx = AllLocations.Add(MoveTemp(Entry));
			LocationIdLookup.Add(AllLocations[Idx].Id, Idx);
			LocationSpatialGrid.FindOrAdd(ToGridCell(WX, WY, LocationCellSizeCm)).Add(Idx);
		}
	}

	TotalLocationsCount = AllLocations.Num();
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
	RespawnPlayerSafely();
}

void ADarkSoulsGameMode::SetSafeBonfireCheckpoint(FVector Location, bool bIsBossArena)
{
	if (bIsBossArena) return;

	// Never save respawn coordinates inside Boss Arena Colosseum (z in [186300m, 567000m])
	const bool bInBossArena = FMath::Abs(Location.X) <= 1710000.0f && Location.Y >= 18630000.0f && Location.Y <= 56700000.0f;
	if (!bInBossArena)
	{
		LastSafeBonfireLocation = Location;
	}
}

void ADarkSoulsGameMode::RespawnPlayerSafely()
{
	ADarkSoulsCharacter* Player = Cast<ADarkSoulsCharacter>(UGameplayStatics::GetPlayerCharacter(GetWorld(), 0));
	if (!Player) return;

	FVector SafeLoc = LastSafeBonfireLocation;
	const bool bInBossArena = FMath::Abs(SafeLoc.X) <= 1710000.0f && SafeLoc.Y >= 18630000.0f && SafeLoc.Y <= 56700000.0f;
	if (bInBossArena)
	{
		SafeLoc = FVector(0.0f, 500.0f, 90.0f);
	}

	Player->SetActorLocation(SafeLoc);
	Player->RestAtBonfire();
}

float ADarkSoulsGameMode::GetGroundHeightAtLocation(float XCm, float YCm, float CurrentZCm) const
{
	// 5x Colossal Map Bounds (in cm): Courtyard [-20250m..20250m] x [-101250m..24300m]
	if (XCm >= -2025000.0f && XCm <= 2025000.0f && YCm >= -10125000.0f && YCm <= 2430000.0f)
	{
		if (XCm >= -2550.0f && XCm <= -1450.0f && YCm >= 2200.0f && YCm <= 27000.0f && CurrentZCm < -200.0f)
		{
			return -492.0f;
		}
		return 0.0f;
	}

	// O(1) Spatial Grid Query
	const FIntVector CenterCell = ToGridCell(XCm, YCm, LocationCellSizeCm);
	float BestDistSq = 120000.0f * 120000.0f; // 1200m
	float BestZ = 0.0f;
	bool bFound = false;

	for (int32 DX = -1; DX <= 1; DX++)
	{
		for (int32 DY = -1; DY <= 1; DY++)
		{
			const TArray<int32>* Bucket = LocationSpatialGrid.Find(FIntVector(CenterCell.X + DX, CenterCell.Y + DY, 0));
			if (!Bucket) continue;
			for (int32 Idx : *Bucket)
			{
				const FDarkSoulsLocationEntry& Loc = AllLocations[Idx];
				const float DistSq = FMath::Square(XCm - Loc.WorldPositionCm.X) + FMath::Square(YCm - Loc.WorldPositionCm.Y);
				if (DistSq < BestDistSq && FMath::Abs(CurrentZCm - Loc.WorldPositionCm.Z) < 2200.0f)
				{
					BestDistSq = DistSq;
					BestZ = Loc.WorldPositionCm.Z;
					bFound = true;
				}
			}
		}
	}

	if (bFound) return BestZ;
	if (XCm >= -72000000.0f && XCm <= 72000000.0f && YCm >= -37500000.0f && YCm <= 37500000.0f)
	{
		return 0.0f;
	}
	return -5000.0f;
}

bool ADarkSoulsGameMode::FastTravelToLocationById(const FString& LocationId, bool bIsBossArena)
{
	const int32* FoundIdx = LocationIdLookup.Find(LocationId);
	if (!FoundIdx) return false;

	ADarkSoulsCharacter* Player = Cast<ADarkSoulsCharacter>(UGameplayStatics::GetPlayerCharacter(GetWorld(), 0));
	if (!Player) return false;

	const FVector TargetLoc = AllLocations[*FoundIdx].WorldPositionCm + FVector(0.0f, 0.0f, 100.0f);
	Player->SetActorLocation(TargetLoc);
	SetSafeBonfireCheckpoint(TargetLoc, bIsBossArena);
	return true;
}
