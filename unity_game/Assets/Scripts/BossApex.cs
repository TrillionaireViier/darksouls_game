using System;
using System.Text.RegularExpressions;
using UnityEngine;

namespace DarkSouls
{
    /// <summary>
    /// Unified Multi-Phase Apex & Outside Boss Controller (125 Bosses for Unity 5x-on-5x Expansion, Build V76).
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
        public float aggroRange = 38f;
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

        public void Configure(BossType type, int ascensionTier = 0)
        {
            int idx = (int)type;
            string raw = type.ToString();
            bossName = Regex.Replace(raw, "([a-z])([A-Z])", "$1 $2");

            Color[] primaries = {
                new Color(0.15f, 0.10f, 0.22f), new Color(0.55f, 0.45f, 0.20f), new Color(0.24f, 0.24f, 0.28f),
                new Color(0.36f, 0.12f, 0.14f), new Color(0.12f, 0.22f, 0.34f), new Color(0.75f, 0.85f, 0.95f)
            };
            Color[] accents = {
                new Color(0.75f, 0.25f, 1.0f), new Color(1.0f, 0.80f, 0.25f), new Color(1.0f, 0.32f, 0.10f),
                new Color(0.35f, 0.88f, 1.0f), new Color(0.95f, 0.18f, 0.22f), new Color(0.90f, 0.95f, 1.0f)
            };

            maxHealth = 3200f + (idx % 15) * 280f;
            baseDamage = 200f + (idx % 12) * 18f;
            soulReward = 12000 + idx * 450;
            moveSpeed = 3.6f + (idx % 5) * 0.45f;
            modelScale = 1.35f + (idx % 6) * 0.18f;
            hasWings = (idx % 3 == 1) || raw.Contains("Dragon") || raw.Contains("Gargoyle") || raw.Contains("Malenia") || raw.Contains("Nameless");
            primaryColor = primaries[idx % primaries.Length];
            accentColor = accents[idx % accents.Length];

            // Bespoke overrides for signature bosses
            switch (type)
            {
                case BossType.ManusFatherOfTheAbyss:
                    bossName = "Manus, Father of the Abyss"; maxHealth = 4800f; baseDamage = 280f; soulReward = 25000; modelScale = 1.9f; break;
                case BossType.StarscourgeRadahn:
                    bossName = "Starscourge Radahn"; maxHealth = 6000f; baseDamage = 330f; soulReward = 38000; modelScale = 2.2f; break;
                case BossType.MaleniaBladeOfMiquella:
                    bossName = "Malenia, Blade of Miquella"; maxHealth = 5800f; baseDamage = 345f; soulReward = 48000; moveSpeed = 5.6f; hasWings = true; break;
                case BossType.PromisedConsortRadahn:
                    bossName = "Promised Consort Radahn"; maxHealth = 7200f; baseDamage = 380f; soulReward = 65000; moveSpeed = 5.2f; modelScale = 2.15f; break;
                case BossType.MessmerTheImpaler:
                    bossName = "Messmer the Impaler"; maxHealth = 5600f; baseDamage = 335f; soulReward = 45000; moveSpeed = 5.3f; break;
                case BossType.DarkeaterMidir:
                    bossName = "Darkeater Midir"; maxHealth = 6800f; baseDamage = 350f; soulReward = 50000; modelScale = 2.4f; hasWings = true; break;
                case BossType.SlaveKnightGael:
                    bossName = "Slave Knight Gael"; maxHealth = 6200f; baseDamage = 335f; soulReward = 46000; moveSpeed = 5.4f; break;
                case BossType.IsshinSwordSaint:
                    bossName = "Isshin, the Sword Saint"; maxHealth = 4900f; baseDamage = 295f; soulReward = 32000; moveSpeed = 5.5f; break;
                case BossType.MalikethBlackBlade:
                    bossName = "Maliketh, the Black Blade"; maxHealth = 5500f; baseDamage = 340f; soulReward = 40000; moveSpeed = 5.5f; break;
            }

            string[] tierPrefixes = { "", "Abyssal ", "Cinderlord ", "Outer God ", "Primeval " };
            string[] cycleSuffixes = { "", " [NG+]", " [NG+2]", " [NG+3]", " [NG+4]" };
            int safeTier = Mathf.Clamp(ascensionTier, 0, 24);
            if (safeTier > 0)
            {
                int prefixIdx = safeTier % 5;
                int cycleIdx = safeTier / 5;
                bossName = $"{tierPrefixes[prefixIdx]}{bossName}{cycleSuffixes[cycleIdx]}";
                maxHealth *= (1f + safeTier * 0.25f);
                baseDamage *= (1f + safeTier * 0.14f);
                soulReward = Mathf.RoundToInt(soulReward * (1f + safeTier * 0.35f));
                modelScale *= (1f + Mathf.Min(safeTier, 8) * 0.05f);
                accentColor = accents[(idx + safeTier) % accents.Length];
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

            var torso = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            torso.transform.SetParent(transform, false);
            torso.transform.localPosition = new Vector3(0f, 1.5f * modelScale, 0f);
            torso.transform.localScale = new Vector3(1.1f, 1.3f, 0.85f) * modelScale;
            torso.GetComponent<Renderer>().sharedMaterial = bodyMat;
            Destroy(torso.GetComponent<Collider>());

            var head = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            head.transform.SetParent(transform, false);
            head.transform.localPosition = new Vector3(0f, 2.85f * modelScale, 0f);
            head.transform.localScale = Vector3.one * (0.65f * modelScale);
            head.GetComponent<Renderer>().sharedMaterial = glowMat;
            Destroy(head.GetComponent<Collider>());

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
