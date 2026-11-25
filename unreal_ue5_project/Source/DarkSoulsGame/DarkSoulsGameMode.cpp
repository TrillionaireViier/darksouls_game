// Copyright Dark Souls Game Project. All Rights Reserved. UE 5.8

#include "DarkSoulsGameMode.h"
#include "DarkSoulsCharacter.h"
#include "Engine/World.h"
#include "Kismet/GameplayStatics.h"

ADarkSoulsGameMode::ADarkSoulsGameMode()
{
	DefaultPawnClass = ADarkSoulsCharacter::StaticClass();
	LastSafeBonfireLocation = FVector(0.0, 500.0, 90.0);
	LocationCellSizeCm = 500000.0; // 5000m spatial hash cell
	TotalLocationsCount = 0;
}

void ADarkSoulsGameMode::BeginPlay()
{
	Super::BeginPlay();
	BuildSpatialLocations5x();
}

FIntVector ADarkSoulsGameMode::ToGridCell(double XCm, double YCm, double CellSizeCm)
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
		const double Mult = 1.0 + S * 1.15;
		const double SignX = (S % 2 == 0) ? 1.0 : -1.0;
		const double SignY = (S < 3) ? 1.0 : -1.0;

		for (int32 I = 0; I < BaseSectors; I++)
		{
			const double Angle = FMath::DegreesToRadians((double)(I % 360));
			const double DistCm = (350.0 + (I % 64) * 520.0 * Mult) * 100.0;
			const double WX = FMath::Cos(Angle) * DistCm * SignX;
			const double WY = FMath::Sin(Angle) * DistCm * SignY;
			const double WZ = ((I % 5 == 0) ? -600.0 : ((I % 7 == 0) ? 1400.0 : 0.0));

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

	// Never save respawn coordinates inside Boss Arena Colosseum (Y in [186300m, 567000m])
	const bool bInBossArena = FMath::Abs(Location.X) <= 1710000.0 && Location.Y >= 18630000.0 && Location.Y <= 56700000.0;
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
	const bool bInBossArena = FMath::Abs(SafeLoc.X) <= 1710000.0 && SafeLoc.Y >= 18630000.0 && SafeLoc.Y <= 56700000.0;
	if (bInBossArena)
	{
		SafeLoc = FVector(0.0, 500.0, 90.0);
	}

	Player->SetActorLocation(SafeLoc);
	Player->RestAtBonfire();
}

double ADarkSoulsGameMode::GetGroundHeightAtLocation(double XCm, double YCm, double CurrentZCm) const
{
	// 5x Colossal Map Bounds (LWC double precision, in cm)
	if (XCm >= -2025000.0 && XCm <= 2025000.0 && YCm >= -10125000.0 && YCm <= 2430000.0)
	{
		if (XCm >= -2550.0 && XCm <= -1450.0 && YCm >= 2200.0 && YCm <= 27000.0 && CurrentZCm < -200.0)
		{
			return -492.0;
		}
		return 0.0;
	}

	const FIntVector CenterCell = ToGridCell(XCm, YCm, LocationCellSizeCm);
	double BestDistSq = 120000.0 * 120000.0;
	double BestZ = 0.0;
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
				const double DistSq = FMath::Square(XCm - Loc.WorldPositionCm.X) + FMath::Square(YCm - Loc.WorldPositionCm.Y);
				if (DistSq < BestDistSq && FMath::Abs(CurrentZCm - Loc.WorldPositionCm.Z) < 2200.0)
				{
					BestDistSq = DistSq;
					BestZ = Loc.WorldPositionCm.Z;
					bFound = true;
				}
			}
		}
	}

	if (bFound) return BestZ;
	if (XCm >= -72000000.0 && XCm <= 72000000.0 && YCm >= -37500000.0 && YCm <= 37500000.0)
	{
		return 0.0;
	}
	return -5000.0;
}

bool ADarkSoulsGameMode::FastTravelToLocationById(const FString& LocationId, bool bIsBossArena)
{
	const int32* FoundIdx = LocationIdLookup.Find(LocationId);
	if (!FoundIdx) return false;

	ADarkSoulsCharacter* Player = Cast<ADarkSoulsCharacter>(UGameplayStatics::GetPlayerCharacter(GetWorld(), 0));
	if (!Player) return false;

	const FVector TargetLoc = AllLocations[*FoundIdx].WorldPositionCm + FVector(0.0, 0.0, 100.0);
	Player->SetActorLocation(TargetLoc);
	SetSafeBonfireCheckpoint(TargetLoc, bIsBossArena);
	return true;
}
