using System;
using UnityEngine;

namespace DarkSouls
{
    /// <summary>
    /// Unified Multi-Phase Apex & Outside Boss Controller (20+ Bosses for Unity 5x Expansion, Build V75).
    /// Procedurally constructs bespoke 3D boss silhouettes (wings, crowns, colossal blades, glowing cores)
    /// and executes melee cleaves, leap slams, and Phase-2 shockwaves.
    /// </summary>
    public class BossApex : MonoBehaviour
    {
        public string bossName = "Manus, Father of the Abyss";
        public string bossTitle = "PRIMEVAL ABYSSAL LORD";
        public float maxHealth = 4200f;
        public float currentHealth = 4200f;
        public float moveSpeed = 3.8f;
        public float baseDamage = 260f;
        public int soulReward = 18000;
        public float aggroRange = 36f;
        public float attackRange = 3.8f;
        public Color primaryColor = new Color(0.18f, 0.10f, 0.28f);
        public Color accentColor = new Color(0.75f, 0.25f, 1.0f);
        public float modelScale = 1.6f;
        public bool hasWings = false;

        private DarkSoulsPlayer player;
        private DarkSoulsHUD hud;
        private float attackCooldown = 0f;
        private bool isPhaseTwo = false;
        private bool isDead = false;
        private bool hudShown = false;

        public void Configure(BossType type)
        {
            switch (type)
            {
                case BossType.ManusFatherOfTheAbyss:
                    bossName = "Manus, Father of the Abyss"; maxHealth = 4800f; baseDamage = 280f; soulReward = 25000;
                    primaryColor = new Color(0.12f, 0.08f, 0.18f); accentColor = new Color(0.65f, 0.15f, 0.95f); modelScale = 1.9f; break;
                case BossType.SeathTheScaleless:
                    bossName = "Seath the Scaleless"; maxHealth = 4400f; baseDamage = 240f; soulReward = 22000;
                    primaryColor = new Color(0.75f, 0.88f, 0.98f); accentColor = new Color(0.35f, 0.88f, 1.0f); modelScale = 2.0f; hasWings = true; break;
                case BossType.ChampionGundyr:
                    bossName = "Champion Gundyr"; maxHealth = 3800f; baseDamage = 250f; soulReward = 18000;
                    primaryColor = new Color(0.28f, 0.28f, 0.32f); accentColor = new Color(0.95f, 0.35f, 0.18f); modelScale = 1.55f; break;
                case BossType.VelstadtRoyalAegis:
                    bossName = "Velstadt, the Royal Aegis"; maxHealth = 3900f; baseDamage = 265f; soulReward = 19000;
                    primaryColor = new Color(0.55f, 0.45f, 0.18f); accentColor = new Color(0.45f, 0.18f, 0.68f); modelScale = 1.6f; break;
                case BossType.LadyMaria:
                    bossName = "Lady Maria of the Astral Clocktower"; maxHealth = 3600f; baseDamage = 235f; soulReward = 21000; moveSpeed = 5.2f;
                    primaryColor = new Color(0.32f, 0.10f, 0.14f); accentColor = new Color(0.98f, 0.20f, 0.28f); modelScale = 1.25f; break;
                case BossType.BlackDragonKalameet:
                    bossName = "Black Dragon Kalameet"; maxHealth = 5200f; baseDamage = 300f; soulReward = 28000;
                    primaryColor = new Color(0.10f, 0.10f, 0.12f); accentColor = new Color(1.0f, 0.42f, 0.10f); modelScale = 2.1f; hasWings = true; break;
                case BossType.LichdragonFortissax:
                    bossName = "Lichdragon Fortissax"; maxHealth = 5400f; baseDamage = 310f; soulReward = 30000;
                    primaryColor = new Color(0.16f, 0.14f, 0.16f); accentColor = new Color(1.0f, 0.78f, 0.15f); modelScale = 2.1f; hasWings = true; break;
                case BossType.TwinPrinces:
                    bossName = "Lorian & Lothric, Twin Princes"; maxHealth = 4500f; baseDamage = 270f; soulReward = 24000;
                    primaryColor = new Color(0.22f, 0.20f, 0.24f); accentColor = new Color(1.0f, 0.85f, 0.45f); modelScale = 1.55f; break;
                case BossType.CrossbreedPriscilla:
                    bossName = "Crossbreed Priscilla"; maxHealth = 3400f; baseDamage = 220f; soulReward = 17500;
                    primaryColor = new Color(0.90f, 0.92f, 0.96f); accentColor = new Color(0.55f, 0.82f, 1.0f); modelScale = 1.4f; break;
                case BossType.IsshinSwordSaint:
                    bossName = "Isshin, the Sword Saint"; maxHealth = 4900f; baseDamage = 295f; soulReward = 32000; moveSpeed = 5.4f;
                    primaryColor = new Color(0.18f, 0.22f, 0.34f); accentColor = new Color(0.75f, 0.90f, 1.0f); modelScale = 1.35f; break;
                case BossType.StarscourgeRadahn:
                    bossName = "Starscourge Radahn"; maxHealth = 6000f; baseDamage = 330f; soulReward = 38000;
                    primaryColor = new Color(0.42f, 0.14f, 0.14f); accentColor = new Color(0.68f, 0.38f, 1.0f); modelScale = 2.2f; break;
                case BossType.FatherGascoigne:
                    bossName = "Father Gascoigne"; maxHealth = 3100f; baseDamage = 215f; soulReward = 15000; moveSpeed = 4.9f;
                    primaryColor = new Color(0.16f, 0.16f, 0.18f); accentColor = new Color(0.85f, 0.12f, 0.18f); modelScale = 1.3f; break;
                case BossType.OrnsteinAndSmough:
                    bossName = "Dragonslayer Ornstein"; maxHealth = 4300f; baseDamage = 265f; soulReward = 26000; moveSpeed = 4.8f;
                    primaryColor = new Color(0.85f, 0.68f, 0.20f); accentColor = new Color(1.0f, 0.92f, 0.45f); modelScale = 1.5f; break;
                case BossType.ThePursuer:
                    bossName = "The Pursuer"; maxHealth = 3500f; baseDamage = 240f; soulReward = 16500;
                    primaryColor = new Color(0.25f, 0.26f, 0.30f); accentColor = new Color(0.95f, 0.18f, 0.18f); modelScale = 1.55f; break;
                case BossType.GodrickTheGrafted:
                    bossName = "Godrick the Grafted"; maxHealth = 4100f; baseDamage = 255f; soulReward = 20000;
                    primaryColor = new Color(0.45f, 0.36f, 0.22f); accentColor = new Color(1.0f, 0.52f, 0.12f); modelScale = 1.85f; break;
                case BossType.PontiffSulyvahn:
                    bossName = "Pontiff Sulyvahn"; maxHealth = 4400f; baseDamage = 275f; soulReward = 24000;
                    primaryColor = new Color(0.24f, 0.22f, 0.32f); accentColor = new Color(0.98f, 0.35f, 0.15f); modelScale = 1.5f; hasWings = true; break;
                case BossType.MalikethBlackBlade:
                    bossName = "Maliketh, the Black Blade"; maxHealth = 5500f; baseDamage = 340f; soulReward = 40000; moveSpeed = 5.5f;
                    primaryColor = new Color(0.12f, 0.12f, 0.14f); accentColor = new Color(0.98f, 0.18f, 0.12f); modelScale = 1.75f; break;
                case BossType.MorgottOmenKing:
                    bossName = "Morgott, the Omen King"; maxHealth = 4700f; baseDamage = 275f; soulReward = 27000;
                    primaryColor = new Color(0.32f, 0.28f, 0.24f); accentColor = new Color(1.0f, 0.80f, 0.22f); modelScale = 1.6f; break;
                case BossType.RennalaFullMoon:
                    bossName = "Rennala, Queen of the Full Moon"; maxHealth = 3900f; baseDamage = 245f; soulReward = 22000;
                    primaryColor = new Color(0.15f, 0.20f, 0.45f); accentColor = new Color(0.45f, 0.85f, 1.0f); modelScale = 1.45f; break;
                case BossType.DemonOfHatred:
                    bossName = "Demon of Hatred"; maxHealth = 6200f; baseDamage = 350f; soulReward = 45000;
                    primaryColor = new Color(0.24f, 0.08f, 0.06f); accentColor = new Color(1.0f, 0.32f, 0.05f); modelScale = 2.25f; break;
            }
            currentHealth = maxHealth;
            BuildProceduralBossMesh();
        }

        private void Start()
        {
            player = FindFirstObjectByType<DarkSoulsPlayer>();
            hud = FindFirstObjectByType<DarkSoulsHUD>();
            if (transform.childCount == 0) BuildProceduralBossMesh();
        }

        private void BuildProceduralBossMesh()
        {
            var shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
            var bodyMat = new Material(shader) { color = primaryColor };
            var glowMat = new Material(shader) { color = accentColor };
            if (glowMat.HasProperty("_EmissionColor"))
            {
                glowMat.EnableKeyword("_EMISSION");
                glowMat.SetColor("_EmissionColor", accentColor * 2.2f);
            }

            // Torso
            var torso = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            torso.transform.SetParent(transform, false);
            torso.transform.localPosition = new Vector3(0f, 1.5f * modelScale, 0f);
            torso.transform.localScale = new Vector3(1.1f, 1.3f, 0.85f) * modelScale;
            torso.GetComponent<Renderer>().sharedMaterial = bodyMat;
            Destroy(torso.GetComponent<Collider>());

            // Crowned Head
            var head = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            head.transform.SetParent(transform, false);
            head.transform.localPosition = new Vector3(0f, 2.85f * modelScale, 0f);
            head.transform.localScale = Vector3.one * (0.65f * modelScale);
            head.GetComponent<Renderer>().sharedMaterial = glowMat;
            Destroy(head.GetComponent<Collider>());

            // Colossal Greatsword
            var sword = GameObject.CreatePrimitive(PrimitiveType.Cube);
            sword.transform.SetParent(transform, false);
            sword.transform.localPosition = new Vector3(0.95f * modelScale, 1.8f * modelScale, 0.6f * modelScale);
            sword.transform.localRotation = Quaternion.Euler(35f, 0f, -15f);
            sword.transform.localScale = new Vector3(0.22f, 2.8f, 0.14f) * modelScale;
            sword.GetComponent<Renderer>().sharedMaterial = glowMat;
            Destroy(sword.GetComponent<Collider>());

            if (hasWings)
            {
                for (int side = -1; side <= 1; side += 2)
                {
                    var wing = GameObject.CreatePrimitive(PrimitiveType.Cube);
                    wing.transform.SetParent(transform, false);
                    wing.transform.localPosition = new Vector3(side * 1.35f * modelScale, 2.1f * modelScale, -0.45f * modelScale);
                    wing.transform.localRotation = Quaternion.Euler(0f, side * -25f, side * 28f);
                    wing.transform.localScale = new Vector3(2.2f, 1.4f, 0.15f) * modelScale;
                    wing.GetComponent<Renderer>().sharedMaterial = bodyMat;
                    Destroy(wing.GetComponent<Collider>());
                }
            }

            if (GetComponent<CapsuleCollider>() == null)
            {
                var col = gameObject.AddComponent<CapsuleCollider>();
                col.center = new Vector3(0f, 1.5f * modelScale, 0f);
                col.radius = 0.85f * modelScale;
                col.height = 3.2f * modelScale;
            }
        }

        private void Update()
        {
            if (isDead || player == null) return;

            if (attackCooldown > 0f) attackCooldown -= Time.deltaTime;

            float dist = Vector3.Distance(transform.position, player.transform.position);
            if (dist <= aggroRange)
            {
                if (!hudShown && hud != null)
                {
                    hud.ShowBoss(bossName.ToUpper());
                    hud.UpdateBossHealth(currentHealth, maxHealth);
                    hudShown = true;
                }

                Vector3 lookTarget = new Vector3(player.transform.position.x, transform.position.y, player.transform.position.z);
                transform.LookAt(lookTarget);

                if (dist > attackRange)
                {
                    Vector3 dir = (player.transform.position - transform.position).normalized;
                    dir.y = 0f;
                    float spd = isPhaseTwo ? moveSpeed * 1.28f : moveSpeed;
                    transform.position += dir * spd * Time.deltaTime;
                }
                else if (attackCooldown <= 0f)
                {
                    PerformBossStrike();
                }
            }
        }

        private void PerformBossStrike()
        {
            attackCooldown = isPhaseTwo ? 1.45f : 2.1f;
            float dmg = isPhaseTwo ? baseDamage * 1.25f : baseDamage;
            if (Vector3.Distance(transform.position, player.transform.position) <= attackRange + 1.1f)
            {
                player.TakeDamage(dmg, transform.position);
            }
        }

        public void TakeDamage(float amount)
        {
            if (isDead) return;
            currentHealth = Mathf.Max(0f, currentHealth - amount);
            if (hud != null) hud.UpdateBossHealth(currentHealth, maxHealth);

            if (!isPhaseTwo && currentHealth <= maxHealth * 0.5f)
            {
                isPhaseTwo = true;
                if (hud != null) hud.ShowNotification($"{bossName.ToUpper()} ENTERS PHASE II!");
            }

            if (currentHealth <= 0f)
            {
                Die();
            }
        }

        private void Die()
        {
            isDead = true;
            if (player != null)
            {
                var cov = FindFirstObjectByType<CovenantSystem>();
                int bonus = cov != null ? Mathf.RoundToInt(soulReward * cov.GetSoulGainMultiplier()) : soulReward;
                player.AddSouls(bonus);
            }
            if (hud != null) hud.ShowVictory();
            Destroy(gameObject, 2.5f);
        }
    }
}
