using System.Collections.Generic;
using UnityEngine;

namespace DarkSouls
{
    public enum MobArchetype
    {
        // Original 15 (V75)
        HollowSoldier, SilverKnight, BlackKnight, Darkwraith, CrystalGolem,
        MushroomParent, Mimic, StoneGuardian, LothricKnight, AbyssWatcher,
        CleanrotKnight, CrucibleKnight, WinterLantern, OkamiWarrior, LeyndellSentinel,

        // +60 New Archetypes = 75 Total (5x Expansion, V76)
        BalderKnight, BerenikeKnight, Channeler, GiantSentinel, BatWingDemon,
        BonewheelSkeleton, GiantSkeleton, ChaosEater, TitaniteDemon, CapraMinion,
        AlonneKnight, SyanKnight, HeideKnight, Drakekeeper, RuinSentinelMob,
        CathedralKnight, WingedKnight, PontiffKnight, FireWitch, OutriderKnight,
        HaraldLegionKnight, RingedKnight, Judicator, MillwoodKnight, CorvianKnight,
        ChurchServant, Executioner, Snatcher, BrainSucker, GardenOfEyes,
        YharnamHunter, BeastPatient, Silverbeast, SharkGiant, Bloodlicker,
        AshinaSamurai, InteriorMinistryNinja, NightjarNinja, LoneShadow, TaroTroop,
        GodrickKnight, KaidenSellsword, BanishedKnight, CuckooKnight, RedmaneKnight,
        HaligtreeKnight, MausoleumKnight, ZamorWarrior, BeastmanOfFarumAzula, OnyxLord,
        SanguineNoble, GodskinApostle, GodskinNoble, TreeSentinelMob, NightsCavalry,
        BellBearingHunter, FireKnight, HornedWarrior, Curseblade, MessmerSoldier
    }

    /// <summary>
    /// Spawns 75 bespoke 3D enemy archetypes around the player's active world chunks (Build V76).
    /// </summary>
    public class OutsideMobSpawner : MonoBehaviour
    {
        public int maxActiveMobs = 24;
        public float spawnRadius = 60f;
        private readonly List<OutsideMob> activeMobs = new List<OutsideMob>();
        private DarkSoulsPlayer player;
        private float spawnTimer = 0f;

        private void Start()
        {
            player = FindFirstObjectByType<DarkSoulsPlayer>();
            SpawnInitialWave();
        }

        private void Update()
        {
            if (player == null) return;
            activeMobs.RemoveAll(m => m == null);

            spawnTimer += Time.deltaTime;
            if (spawnTimer >= 3.2f && activeMobs.Count < maxActiveMobs)
            {
                spawnTimer = 0f;
                SpawnRandomMobNearPlayer();
            }
        }

        private void SpawnInitialWave()
        {
            for (int i = 0; i < 12; i++) SpawnRandomMobNearPlayer();
        }

        private void SpawnRandomMobNearPlayer()
        {
            if (player == null) return;
            float angle = Random.Range(0f, Mathf.PI * 2f);
            float dist = Random.Range(16f, spawnRadius);
            Vector3 pos = player.transform.position + new Vector3(Mathf.Cos(angle) * dist, 0f, Mathf.Sin(angle) * dist);
            pos.y = 0f;

            var archetype = (MobArchetype)Random.Range(0, System.Enum.GetValues(typeof(MobArchetype)).Length);
            var go = new GameObject($"Mob_{archetype}");
            go.transform.position = pos;
            var mob = go.AddComponent<OutsideMob>();
            mob.Init(archetype);
            activeMobs.Add(mob);
        }
    }

    public class OutsideMob : MonoBehaviour
    {
        public MobArchetype archetype;
        public float maxHealth = 350f;
        public float currentHealth = 350f;
        public float damage = 110f;
        public float moveSpeed = 2.8f;
        public int soulReward = 250;

        private DarkSoulsPlayer player;
        private float cooldown = 0f;
        private bool dead = false;

        public void Init(MobArchetype type)
        {
            archetype = type;
            int idx = (int)type;

            Color[] bodyColors = {
                new Color(0.45f, 0.38f, 0.32f), new Color(0.75f, 0.78f, 0.84f), new Color(0.14f, 0.14f, 0.16f),
                new Color(0.35f, 0.78f, 0.95f), new Color(0.55f, 0.15f, 0.15f), new Color(0.72f, 0.56f, 0.24f),
                new Color(0.28f, 0.12f, 0.28f), new Color(0.88f, 0.74f, 0.28f)
            };
            Color[] accentColors = {
                Color.white, Color.cyan, new Color(1f, 0.4f, 0.1f), Color.red, Color.yellow, Color.magenta
            };

            maxHealth = 280f + (idx % 12) * 65f;
            damage = 95f + (idx % 10) * 16f;
            soulReward = 150 + idx * 25;
            moveSpeed = 2.6f + (idx % 5) * 0.3f;

            float scale = 1.0f + (idx % 5) * 0.12f;
            currentHealth = maxHealth;
            BuildMesh(bodyColors[idx % bodyColors.Length], accentColors[idx % accentColors.Length], scale);
        }

        private void BuildMesh(Color bodyColor, Color accentColor, float scale)
        {
            var shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
            var bodyMat = new Material(shader) { color = bodyColor };
            var accMat = new Material(shader) { color = accentColor };

            var body = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            body.transform.SetParent(transform, false);
            body.transform.localPosition = new Vector3(0f, 1.0f * scale, 0f);
            body.transform.localScale = new Vector3(0.75f, 1.0f, 0.65f) * scale;
            body.GetComponent<Renderer>().sharedMaterial = bodyMat;
            Destroy(body.GetComponent<Collider>());

            var weapon = GameObject.CreatePrimitive(PrimitiveType.Cube);
            weapon.transform.SetParent(transform, false);
            weapon.transform.localPosition = new Vector3(0.55f * scale, 1.1f * scale, 0.35f * scale);
            weapon.transform.localRotation = Quaternion.Euler(25f, 0f, 0f);
            weapon.transform.localScale = new Vector3(0.12f, 1.4f, 0.10f) * scale;
            weapon.GetComponent<Renderer>().sharedMaterial = accMat;
            Destroy(weapon.GetComponent<Collider>());

            var col = gameObject.AddComponent<CapsuleCollider>();
            col.center = new Vector3(0f, 1.0f * scale, 0f);
            col.radius = 0.55f * scale;
            col.height = 2.0f * scale;
        }

        private void Start()
        {
            player = FindFirstObjectByType<DarkSoulsPlayer>();
        }

        private void Update()
        {
            if (dead || player == null) return;
            if (cooldown > 0f) cooldown -= Time.deltaTime;

            float dist = Vector3.Distance(transform.position, player.transform.position);
            if (dist <= 22f)
            {
                Vector3 look = new Vector3(player.transform.position.x, transform.position.y, player.transform.position.z);
                transform.LookAt(look);

                if (dist > 2.2f)
                {
                    Vector3 dir = (player.transform.position - transform.position).normalized;
                    dir.y = 0f;
                    transform.position += dir * moveSpeed * Time.deltaTime;
                }
                else if (cooldown <= 0f)
                {
                    cooldown = 1.75f;
                    player.TakeDamage(damage, transform.position);
                }
            }
        }

        public void TakeDamage(float dmg, Vector3 attackerPos)
        {
            if (dead) return;
            currentHealth = Mathf.Max(0f, currentHealth - dmg);
            if (currentHealth <= 0f)
            {
                dead = true;
                if (player != null) player.AddSouls(soulReward);
                Destroy(gameObject, 0.25f);
            }
        }
    }
}
