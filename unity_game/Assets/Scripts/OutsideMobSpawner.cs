using System.Collections.Generic;
using UnityEngine;

namespace DarkSouls
{
    public enum MobArchetype
    {
        HollowSoldier,
        SilverKnight,
        BlackKnight,
        Darkwraith,
        CrystalGolem,
        MushroomParent,
        Mimic,
        StoneGuardian,
        LothricKnight,
        AbyssWatcher,
        CleanrotKnight,
        CrucibleKnight,
        WinterLantern,
        OkamiWarrior,
        LeyndellSentinel
    }

    /// <summary>
    /// Spawns 15 bespoke 3D enemy archetypes around the player's active world chunks (Build V75).
    /// </summary>
    public class OutsideMobSpawner : MonoBehaviour
    {
        public int maxActiveMobs = 18;
        public float spawnRadius = 55f;
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
            if (spawnTimer >= 4f && activeMobs.Count < maxActiveMobs)
            {
                spawnTimer = 0f;
                SpawnRandomMobNearPlayer();
            }
        }

        private void SpawnInitialWave()
        {
            for (int i = 0; i < 8; i++) SpawnRandomMobNearPlayer();
        }

        private void SpawnRandomMobNearPlayer()
        {
            if (player == null) return;
            float angle = Random.Range(0f, Mathf.PI * 2f);
            float dist = Random.Range(18f, spawnRadius);
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
            Color bodyColor = Color.gray;
            Color accentColor = Color.white;
            float scale = 1f;

            switch (type)
            {
                case MobArchetype.HollowSoldier: maxHealth = 280f; damage = 95f; soulReward = 150; bodyColor = new Color(0.45f, 0.38f, 0.32f); break;
                case MobArchetype.SilverKnight: maxHealth = 480f; damage = 140f; soulReward = 450; bodyColor = new Color(0.75f, 0.78f, 0.84f); accentColor = Color.cyan; scale = 1.15f; break;
                case MobArchetype.BlackKnight: maxHealth = 650f; damage = 185f; soulReward = 800; bodyColor = new Color(0.14f, 0.14f, 0.16f); accentColor = new Color(1f, 0.4f, 0.1f); scale = 1.25f; break;
                case MobArchetype.Darkwraith: maxHealth = 580f; damage = 175f; soulReward = 700; bodyColor = new Color(0.18f, 0.10f, 0.22f); accentColor = Color.red; scale = 1.12f; break;
                case MobArchetype.CrystalGolem: maxHealth = 720f; damage = 160f; soulReward = 650; bodyColor = new Color(0.35f, 0.78f, 0.95f); scale = 1.4f; break;
                case MobArchetype.MushroomParent: maxHealth = 900f; damage = 240f; soulReward = 900; bodyColor = new Color(0.85f, 0.78f, 0.65f); scale = 1.5f; break;
                case MobArchetype.Mimic: maxHealth = 820f; damage = 220f; soulReward = 1200; bodyColor = new Color(0.45f, 0.28f, 0.14f); accentColor = Color.yellow; scale = 1.2f; break;
                case MobArchetype.StoneGuardian: maxHealth = 700f; damage = 170f; soulReward = 600; bodyColor = new Color(0.38f, 0.42f, 0.38f); scale = 1.35f; break;
                case MobArchetype.LothricKnight: maxHealth = 620f; damage = 165f; soulReward = 750; bodyColor = new Color(0.55f, 0.15f, 0.15f); accentColor = Color.yellow; scale = 1.2f; break;
                case MobArchetype.AbyssWatcher: maxHealth = 680f; damage = 190f; soulReward = 950; bodyColor = new Color(0.22f, 0.24f, 0.28f); accentColor = new Color(1f, 0.45f, 0.15f); scale = 1.18f; break;
                case MobArchetype.CleanrotKnight: maxHealth = 640f; damage = 180f; soulReward = 850; bodyColor = new Color(0.72f, 0.56f, 0.24f); accentColor = new Color(0.85f, 0.25f, 0.25f); scale = 1.2f; break;
                case MobArchetype.CrucibleKnight: maxHealth = 880f; damage = 215f; soulReward = 1300; bodyColor = new Color(0.58f, 0.34f, 0.18f); accentColor = new Color(1f, 0.72f, 0.2f); scale = 1.35f; break;
                case MobArchetype.WinterLantern: maxHealth = 520f; damage = 195f; soulReward = 1000; bodyColor = new Color(0.28f, 0.12f, 0.28f); accentColor = Color.magenta; scale = 1.15f; break;
                case MobArchetype.OkamiWarrior: maxHealth = 540f; damage = 160f; soulReward = 780; bodyColor = new Color(0.25f, 0.45f, 0.55f); accentColor = Color.cyan; scale = 1.15f; break;
                case MobArchetype.LeyndellSentinel: maxHealth = 920f; damage = 230f; soulReward = 1450; bodyColor = new Color(0.88f, 0.74f, 0.28f); accentColor = Color.yellow; scale = 1.45f; break;
            }

            currentHealth = maxHealth;
            BuildMesh(bodyColor, accentColor, scale);
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
            if (dist <= 20f)
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
