#include "DarkSoulsExpansionSystem.h"

ADarkSoulsExpansionSystem::ADarkSoulsExpansionSystem()
{
    PrimaryActorTick.bCanEverTick = false;
}

FDarkSoulsLocationData ADarkSoulsExpansionSystem::GetLocationAtIndex(int64 Index) const
{
    static const TCHAR* Zones[] = {
        TEXT("Firelink Citadel"), TEXT("Anor Londo"), TEXT("Darkroot Woods"), TEXT("Ash Lake"),
        TEXT("Kiln of the First Flame"), TEXT("Chasm of the Abyss"), TEXT("Crystal Cave Archive"),
        TEXT("Astral Clocktower"), TEXT("Lothric Castle Throne"), TEXT("Caelid Wailing Dunes"),
        TEXT("Leyndell Erdtree Sanctuary"), TEXT("Crumbling Farum Azula"), TEXT("Shadow Keep"),
        TEXT("Enir-Ilim"), TEXT("Archdragon Peak"), TEXT("Ringed City Inner Wall")
    };
    const int64 SafeIdx = FMath::Abs(Index) % GetTotalLocationsCount();
    const int32 Ring = (int32)(SafeIdx / 45217LL);
    const int32 Local = (int32)(SafeIdx % 45217LL);

    const float AngleRad = FMath::DegreesToRadians((float)((Local + Ring * 19) % 360));
    const float Dist = (350.0f + (Local % 64) * 580.0f * (1.0f + (Ring % 25) * 1.5f)) * 100.0f; // cm

    FDarkSoulsLocationData Out;
    Out.ZoneName = Zones[(Local + Ring * 3) % UE_ARRAY_COUNT(Zones)];
    Out.LocationName = FString::Printf(TEXT("%s Sector #%d [Ring %d | 400x400m]"), *Out.ZoneName, Local + 1, Ring + 1);
    Out.WorldPosition = FVector(FMath::Cos(AngleRad) * Dist, FMath::Sin(AngleRad) * Dist, 0.0f);
    Out.BossName = GetBossEncounterName((Local + Ring) % 125, Ring % 25);
    Out.DangerTier = ((Local + Ring) % 50) + 1;
    return Out;
}

FString ADarkSoulsExpansionSystem::GetWeaponName(int32 Index) const
{
    static const TCHAR* BaseWeapons[] = {
        TEXT("Astora Straight Sword"), TEXT("Claymore"), TEXT("Zweihander"), TEXT("Uchigatana"),
        TEXT("Moonlight Greatsword"), TEXT("Black Knight Halberd"), TEXT("Dragonslayer Spear"),
        TEXT("Rivers of Blood"), TEXT("Maliketh's Black Blade"), TEXT("Sacred Relic Sword")
    };
    static const TCHAR* Infusions[] = { TEXT(""), TEXT("Heavy +10 "), TEXT("Lightning "), TEXT("Abyssal "), TEXT("Primordial ") };
    const int32 Safe = FMath::Abs(Index) % 1875;
    return FString::Printf(TEXT("%s%s [+#%d]"), Infusions[(Safe / 75) % 5], BaseWeapons[Safe % UE_ARRAY_COUNT(BaseWeapons)], (Safe % 25) + 1);
}

FString ADarkSoulsExpansionSystem::GetSpellName(int32 Index) const
{
    static const TCHAR* BaseSpells[] = {
        TEXT("Soul Arrow"), TEXT("Sunlight Spear"), TEXT("Chaos Fireball"), TEXT("Dark Bead"),
        TEXT("Crystal Soul Spear"), TEXT("Comet Azur"), TEXT("Black Flame"), TEXT("Healing Grace")
    };
    static const TCHAR* Mastery[] = { TEXT(""), TEXT("Greater "), TEXT("Primeval "), TEXT("Calamitous "), TEXT("Transcendent ") };
    const int32 Safe = FMath::Abs(Index) % 1250;
    return FString::Printf(TEXT("%s%s"), Mastery[(Safe / 50) % 5], BaseSpells[Safe % UE_ARRAY_COUNT(BaseSpells)]);
}

FString ADarkSoulsExpansionSystem::GetRingName(int32 Index) const
{
    static const TCHAR* BaseRings[] = {
        TEXT("Ring of Favor & Protection"), TEXT("Chloranthy Ring"), TEXT("Wolf Ring"),
        TEXT("Hornet Ring"), TEXT("Havel's Ring"), TEXT("Red Tearstone Ring"),
        TEXT("Erdtree's Favor +2"), TEXT("Shard of Alexander")
    };
    const int32 Safe = FMath::Abs(Index) % 1250;
    return FString::Printf(TEXT("%s [Tier %d]"), BaseRings[Safe % UE_ARRAY_COUNT(BaseRings)], (Safe % 5) + 1);
}

FString ADarkSoulsExpansionSystem::GetBossEncounterName(int32 BossIdx, int32 AscensionTier) const
{
    static const TCHAR* Bosses[] = {
        TEXT("Taurus Demon"), TEXT("Manus, Father of the Abyss"), TEXT("Gwyn, Lord of Cinder"),
        TEXT("Lady Maria"), TEXT("Starscourge Radahn"), TEXT("Malenia, Blade of Miquella"),
        TEXT("Isshin, the Sword Saint"), TEXT("Darkeater Midir"), TEXT("Slave Knight Gael"),
        TEXT("Promised Consort Radahn")
    };
    static const TCHAR* Prefixes[] = { TEXT(""), TEXT("Abyssal "), TEXT("Cinderlord "), TEXT("Outer God "), TEXT("Primeval ") };
    const int32 SafeBoss = FMath::Abs(BossIdx) % UE_ARRAY_COUNT(Bosses);
    const int32 SafeTier = FMath::Clamp(AscensionTier, 0, 24);
    return FString::Printf(TEXT("%s%s (T%d)"), Prefixes[SafeTier % 5], Bosses[SafeBoss], SafeTier + 1);
}
