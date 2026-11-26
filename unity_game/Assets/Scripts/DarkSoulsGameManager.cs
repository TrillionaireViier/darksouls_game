using System;
using UnityEngine;

namespace DarkSouls
{
    public enum BossType
    {
        // Original 25 (V75)
        TaurusDemon, BellGargoyle, CapraDemon, GreatGreyWolfSif, LordGwyn,
        ManusFatherOfTheAbyss, SeathTheScaleless, ChampionGundyr, VelstadtRoyalAegis, LadyMaria,
        BlackDragonKalameet, LichdragonFortissax, TwinPrinces, CrossbreedPriscilla, IsshinSwordSaint,
        StarscourgeRadahn, FatherGascoigne, OrnsteinAndSmough, ThePursuer, GodrickTheGrafted,
        PontiffSulyvahn, MalikethBlackBlade, MorgottOmenKing, RennalaFullMoon, DemonOfHatred,

        // +100 New Bosses = 125 Total (5x Expansion, V76)
        AsylumDemon, StrayDemon, DemonFiresage, MoonlightButterfly, GapingDragon,
        ChaosWitchQuelaag, CeaselessDischarge, CentipedeDemon, BedOfChaos, Pinwheel,
        GravelordNito, DarkSunGwyndolin, IronGolem, FourKings, SanctuaryGuardian,
        KnightArtorias, LastGiant, Dragonrider, OldDragonslayer, FlexileSentry,
        RuinSentinels, LostSinner, BelfryGargoyles, SkeletonLords, ExecutionersChariot,
        CovetousDemon, MythaBanefulQueen, SmelterDemon, OldIronKing, ScorpionessNajka,
        RoyalRatAuthority, DukesDearFreja, LookingGlassKnight, DemonOfSong, GuardianDragon,
        AncientDragon, GiantLord, ThroneWatcher, Nashandra, AldiaScholar,
        FumeKnight, SirAlonne, BlueSmelterDemon, BurntIvoryKing, SinhSlumberingDragon,
        ElanaSqualidQueen, IudexGundyr, VordtOfBorealValley, CurseRottedGreatwood, CrystalSage,
        DeaconsOfTheDeep, AbyssWatchers, HighLordWolnir, OldDemonKing, YhormTheGiant,
        AldrichDevourer, DancerOfBorealValley, DragonslayerArmour, OceirosConsumedKing, NamelessKing,
        SoulOfCinder, SisterFriede, ChampionGravetender, DemonPrince, HalflightSpear,
        DarkeaterMidir, SlaveKnightGael, ClericBeast, BloodStarvedBeast, VicarAmelia,
        WitchOfHemwick, ShadowOfYharnam, RomVacuousSpider, OneReborn, MicolashHost,
        MergosWetNurse, MartyrLogarius, CelestialEmissary, EbrietasDaughter, GehrmanFirstHunter,
        MoonPresence, LudwigAccursed, LivingFailures, OrphanOfKos, LaurenceFirstVicar,
        GyoubuOniwa, LadyButterfly, GenichiroAshina, FoldingScreenMonkeys, GuardianApe,
        CorruptedMonk, DivineDragon, OwlFather, EmmaGentleBlade, MargitFellOmen,
        MohgLordOfBlood, MaleniaBladeOfMiquella, FireGiant, GodfreyFirstEldenLord, RadagonGoldenOrder,
        EldenBeast, AstelNaturalborn, DragonlordPlacidusax, RegalAncestorSpirit, MessmerTheImpaler,
        RellanaTwinMoon, DivineBeastDancingLion, RominaSaintOfBud, MidraLordOfFrenziedFlame, PromisedConsortRadahn
    }

    public class DarkSoulsGameManager : MonoBehaviour
    {
        public static DarkSoulsGameManager Instance { get; private set; }

        public DarkSoulsPlayer player;
        public Bonfire bonfire;
        public DarkSoulsHUD hud;
        public WorldChunkStreamer worldStreamer;
        public CovenantSystem covenantSystem;
        public ArsenalAndMagicSystem arsenalSystem;

        [Header("Legacy Boss Prefabs (Optional)")]
        public GameObject taurusPrefab;
        public GameObject gargoylePrefab;
        public GameObject capraPrefab;
        public GameObject sifPrefab;
        public GameObject gwynPrefab;

        public Transform bossSpawnPoint;
        public Vector3 lastSafeBonfirePosition = new Vector3(0f, 0f, 5f);

        private GameObject currentBossInstance;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);

            Application.targetFrameRate = 60;
            QualitySettings.vSyncCount = 0;
        }

        private void Start()
        {
            if (player == null) player = FindFirstObjectByType<DarkSoulsPlayer>();
            if (bonfire == null) bonfire = FindFirstObjectByType<Bonfire>();
            if (hud == null) hud = FindFirstObjectByType<DarkSoulsHUD>();
            if (worldStreamer == null) worldStreamer = FindFirstObjectByType<WorldChunkStreamer>();
            if (covenantSystem == null) covenantSystem = FindFirstObjectByType<CovenantSystem>();
            if (arsenalSystem == null) arsenalSystem = FindFirstObjectByType<ArsenalAndMagicSystem>();

            SpawnBoss(BossType.ManusFatherOfTheAbyss);
        }

        public void SpawnBoss(BossType type)
        {
            if (currentBossInstance != null) Destroy(currentBossInstance);

            Vector3 basePos = player != null ? player.transform.position + player.transform.forward * 28f : new Vector3(0f, 0f, 35f);
            basePos.y = 0f;
            Vector3 spawnPos = bossSpawnPoint != null ? bossSpawnPoint.position : basePos;
            Quaternion spawnRot = bossSpawnPoint != null ? bossSpawnPoint.rotation : Quaternion.Euler(0f, 180f, 0f);

            GameObject prefabToSpawn = type switch
            {
                BossType.TaurusDemon => taurusPrefab,
                BossType.BellGargoyle => gargoylePrefab,
                BossType.CapraDemon => capraPrefab,
                BossType.GreatGreyWolfSif => sifPrefab,
                BossType.LordGwyn => gwynPrefab,
                _ => null
            };

            if (prefabToSpawn != null)
            {
                currentBossInstance = Instantiate(prefabToSpawn, spawnPos, spawnRot);
            }
            else
            {
                currentBossInstance = new GameObject($"Boss_{type}");
                currentBossInstance.transform.position = spawnPos;
                currentBossInstance.transform.rotation = spawnRot;
                var apex = currentBossInstance.AddComponent<BossApex>();
                apex.Configure(type);
            }

            if (hud != null)
            {
                hud.ShowNotification($"CHALLENGE: {type}");
            }
        }

        public void WarpPlayerToLocation(WorldLocation loc)
        {
            if (player == null) return;
            var cc = player.GetComponent<CharacterController>();
            if (cc != null) cc.enabled = false;
            player.transform.position = new Vector3(loc.position.x, loc.position.y + 1.5f, loc.position.z);
            if (cc != null) cc.enabled = true;
            SetSafeCheckpoint(player.transform.position, false);
            if (hud != null) hud.ShowNotification($"WARPED TO: {loc.name.ToUpper()}");
        }

        public void WarpPlayerToArena()
        {
            if (player != null)
            {
                var cc = player.GetComponent<CharacterController>();
                if (cc != null) cc.enabled = false;
                player.transform.position = new Vector3(0f, 1f, -15f);
                if (cc != null) cc.enabled = true;
            }
        }

        public void SetSafeCheckpoint(Vector3 pos, bool isBossArena = false)
        {
            if (isBossArena) return;
            bool inColosseum = Mathf.Abs(pos.x) <= 17100f && pos.z >= 186300f && pos.z <= 567000f;
            if (!inColosseum)
            {
                lastSafeBonfirePosition = pos;
            }
        }

        public void RespawnPlayerSafely()
        {
            if (player == null) return;
            Vector3 safePos = lastSafeBonfirePosition;
            if (Mathf.Abs(safePos.x) <= 17100f && safePos.z >= 186300f && safePos.z <= 567000f)
            {
                safePos = new Vector3(0f, 0f, 5f);
            }
            var cc = player.GetComponent<CharacterController>();
            if (cc != null) cc.enabled = false;
            player.transform.position = safePos;
            if (cc != null) cc.enabled = true;
            player.RestAtBonfire(safePos);
        }
    }
}
