using System;
using System.Collections.Generic;
using UnityEngine;

namespace DarkSouls
{
    [Serializable]
    public struct WeaponDefinition
    {
        public string name;
        public string category;
        public float baseDamage;
        public float staminaCost;
        public float range;
        public float poiseDamage;
        public Color bladeTint;
    }

    [Serializable]
    public struct SpellDefinition
    {
        public string name;
        public string school;
        public float damage;
        public float staminaCost;
        public float range;
        public float cooldown;
        public Color projectileColor;
        public bool isHeal;
    }

    [Serializable]
    public struct RingDefinition
    {
        public string name;
        public string effectDescription;
        public float hpMult;
        public float staminaRegenMult;
        public float damageMult;
        public float poiseMult;
    }

    /// <summary>
    /// Unity 5x Arsenal & Magic System: 15 Weapons, 10 Spells/Miracles, and 10 Sacred Rings (Build V75).
    /// </summary>
    public class ArsenalAndMagicSystem : MonoBehaviour
    {
        public List<WeaponDefinition> Weapons { get; private set; } = new List<WeaponDefinition>();
        public List<SpellDefinition> Spells { get; private set; } = new List<SpellDefinition>();
        public List<RingDefinition> Rings { get; private set; } = new List<RingDefinition>();

        public int CurrentWeaponIndex { get; private set; } = 0;
        public int CurrentSpellIndex { get; private set; } = 0;
        public int CurrentRingIndex { get; private set; } = 0;

        public WeaponDefinition ActiveWeapon => Weapons[CurrentWeaponIndex];
        public SpellDefinition ActiveSpell => Spells[CurrentSpellIndex];
        public RingDefinition ActiveRing => Rings[CurrentRingIndex];

        private float spellCooldownTimer = 0f;
        private DarkSoulsPlayer player;

        public event Action<WeaponDefinition> OnWeaponChanged;
        public event Action<SpellDefinition> OnSpellChanged;
        public event Action<RingDefinition> OnRingChanged;

        private void Awake()
        {
            InitWeapons();
            InitSpells();
            InitRings();
        }

        private void Start()
        {
            player = FindFirstObjectByType<DarkSoulsPlayer>();
        }

        private void Update()
        {
            if (spellCooldownTimer > 0f) spellCooldownTimer -= Time.deltaTime;

            if (Input.GetKeyDown(KeyCode.Tab)) CycleWeapon(1);
            if (Input.GetKeyDown(KeyCode.R)) CycleSpell(1);
            if (Input.GetKeyDown(KeyCode.T)) CycleRing(1);
            if (Input.GetKeyDown(KeyCode.F)) CastActiveSpell();
        }

        private void InitWeapons()
        {
            Weapons = new List<WeaponDefinition>
            {
                new WeaponDefinition { name = "Astora Straight Sword", category = "Straight Sword", baseDamage = 145f, staminaCost = 20f, range = 3.0f, poiseDamage = 28f, bladeTint = new Color(0.85f, 0.88f, 0.95f) },
                new WeaponDefinition { name = "Claymore", category = "Greatsword", baseDamage = 210f, staminaCost = 28f, range = 3.6f, poiseDamage = 45f, bladeTint = new Color(0.75f, 0.78f, 0.82f) },
                new WeaponDefinition { name = "Zweihander", category = "Ultra Greatsword", baseDamage = 310f, staminaCost = 38f, range = 4.2f, poiseDamage = 75f, bladeTint = new Color(0.65f, 0.65f, 0.70f) },
                new WeaponDefinition { name = "Uchigatana", category = "Katana", baseDamage = 185f, staminaCost = 18f, range = 3.3f, poiseDamage = 30f, bladeTint = new Color(0.92f, 0.92f, 0.96f) },
                new WeaponDefinition { name = "Moonlight Greatsword", category = "Magic Greatsword", baseDamage = 265f, staminaCost = 26f, range = 3.9f, poiseDamage = 52f, bladeTint = new Color(0.35f, 0.85f, 1.0f) },
                new WeaponDefinition { name = "Black Knight Halberd", category = "Halberd", baseDamage = 285f, staminaCost = 32f, range = 4.5f, poiseDamage = 60f, bladeTint = new Color(0.25f, 0.25f, 0.28f) },
                new WeaponDefinition { name = "Dragonslayer Spear", category = "Spear", baseDamage = 230f, staminaCost = 24f, range = 4.8f, poiseDamage = 42f, bladeTint = new Color(0.95f, 0.78f, 0.28f) },
                new WeaponDefinition { name = "Quelaag's Furysword", category = "Curved Sword", baseDamage = 245f, staminaCost = 21f, range = 3.2f, poiseDamage = 36f, bladeTint = new Color(1.0f, 0.35f, 0.12f) },
                new WeaponDefinition { name = "Abyss Greatsword", category = "Abyssal Blade", baseDamage = 295f, staminaCost = 30f, range = 3.8f, poiseDamage = 65f, bladeTint = new Color(0.38f, 0.18f, 0.58f) },
                new WeaponDefinition { name = "Rivers of Blood", category = "Blood Katana", baseDamage = 275f, staminaCost = 20f, range = 3.8f, poiseDamage = 40f, bladeTint = new Color(0.85f, 0.08f, 0.14f) },
                new WeaponDefinition { name = "Dark Moon Greatsword", category = "Lunar Greatsword", baseDamage = 325f, staminaCost = 29f, range = 4.1f, poiseDamage = 68f, bladeTint = new Color(0.45f, 0.78f, 1.0f) },
                new WeaponDefinition { name = "Mortal Blade", category = "Odachi", baseDamage = 340f, staminaCost = 27f, range = 4.3f, poiseDamage = 58f, bladeTint = new Color(0.70f, 0.05f, 0.12f) },
                new WeaponDefinition { name = "Starscourge Greatsword", category = "Colossal Sword", baseDamage = 380f, staminaCost = 42f, range = 4.9f, poiseDamage = 90f, bladeTint = new Color(0.55f, 0.42f, 0.78f) },
                new WeaponDefinition { name = "Maliketh's Black Blade", category = "Destined Death", baseDamage = 410f, staminaCost = 40f, range = 4.7f, poiseDamage = 88f, bladeTint = new Color(0.95f, 0.22f, 0.15f) },
                new WeaponDefinition { name = "Sacred Relic Sword", category = "Golden Greatsword", baseDamage = 395f, staminaCost = 34f, range = 5.0f, poiseDamage = 72f, bladeTint = new Color(1.0f, 0.86f, 0.35f) }
            };
        }

        private void InitSpells()
        {
            Spells = new List<SpellDefinition>
            {
                new SpellDefinition { name = "Soul Arrow", school = "Sorcery", damage = 160f, staminaCost = 18f, range = 22f, cooldown = 0.8f, projectileColor = new Color(0.35f, 0.78f, 1.0f) },
                new SpellDefinition { name = "Great Heavy Soul Arrow", school = "Sorcery", damage = 260f, staminaCost = 25f, range = 25f, cooldown = 1.2f, projectileColor = new Color(0.25f, 0.65f, 1.0f) },
                new SpellDefinition { name = "Sunlight Spear", school = "Miracle", damage = 360f, staminaCost = 32f, range = 28f, cooldown = 1.5f, projectileColor = new Color(1.0f, 0.85f, 0.25f) },
                new SpellDefinition { name = "Chaos Fireball", school = "Pyromancy", damage = 320f, staminaCost = 28f, range = 20f, cooldown = 1.3f, projectileColor = new Color(1.0f, 0.35f, 0.05f) },
                new SpellDefinition { name = "Dark Bead", school = "Abyssal Sorcery", damage = 390f, staminaCost = 30f, range = 16f, cooldown = 1.4f, projectileColor = new Color(0.45f, 0.12f, 0.72f) },
                new SpellDefinition { name = "Wrath of the Gods", school = "Miracle", damage = 310f, staminaCost = 34f, range = 9f, cooldown = 1.6f, projectileColor = new Color(1.0f, 0.95f, 0.75f) },
                new SpellDefinition { name = "Crystal Soul Spear", school = "Sorcery", damage = 440f, staminaCost = 35f, range = 30f, cooldown = 1.7f, projectileColor = new Color(0.55f, 0.95f, 1.0f) },
                new SpellDefinition { name = "Comet Azur", school = "Primeval Sorcery", damage = 560f, staminaCost = 45f, range = 35f, cooldown = 2.4f, projectileColor = new Color(0.20f, 0.90f, 0.85f) },
                new SpellDefinition { name = "Black Flame", school = "Godskin Pyromancy", damage = 370f, staminaCost = 26f, range = 14f, cooldown = 1.2f, projectileColor = new Color(0.85f, 0.85f, 0.90f) },
                new SpellDefinition { name = "Healing Grace", school = "Miracle", damage = 380f, staminaCost = 30f, range = 0f, cooldown = 2.5f, projectileColor = new Color(1.0f, 0.92f, 0.45f), isHeal = true }
            };
        }

        private void InitRings()
        {
            Rings = new List<RingDefinition>
            {
                new RingDefinition { name = "Ring of Favor & Protection", effectDescription = "+20% HP & +15% Stamina Regen", hpMult = 1.20f, staminaRegenMult = 1.15f, damageMult = 1.0f, poiseMult = 1.05f },
                new RingDefinition { name = "Chloranthy Ring", effectDescription = "+45% Stamina Recovery", hpMult = 1.0f, staminaRegenMult = 1.45f, damageMult = 1.0f, poiseMult = 1.0f },
                new RingDefinition { name = "Wolf Ring", effectDescription = "+60% Poise Stability", hpMult = 1.0f, staminaRegenMult = 1.0f, damageMult = 1.0f, poiseMult = 1.60f },
                new RingDefinition { name = "Hornet Ring", effectDescription = "+25% Attack Damage", hpMult = 1.0f, staminaRegenMult = 1.0f, damageMult = 1.25f, poiseMult = 1.0f },
                new RingDefinition { name = "Bellowing Dragoncrest", effectDescription = "+30% Spell & Weapon Power", hpMult = 1.0f, staminaRegenMult = 1.05f, damageMult = 1.30f, poiseMult = 1.0f },
                new RingDefinition { name = "Havel's Ring", effectDescription = "+25% HP & +35% Poise", hpMult = 1.25f, staminaRegenMult = 1.0f, damageMult = 1.05f, poiseMult = 1.35f },
                new RingDefinition { name = "Red Tearstone Ring", effectDescription = "+40% Damage at Low HP", hpMult = 1.0f, staminaRegenMult = 1.10f, damageMult = 1.40f, poiseMult = 1.0f },
                new RingDefinition { name = "Lingering Dragoncrest", effectDescription = "+20% Stamina & +20% Damage", hpMult = 1.05f, staminaRegenMult = 1.20f, damageMult = 1.20f, poiseMult = 1.0f },
                new RingDefinition { name = "Silvercat Ring", effectDescription = "Abyssal Fall Protection +15% Regen", hpMult = 1.10f, staminaRegenMult = 1.15f, damageMult = 1.05f, poiseMult = 1.10f },
                new RingDefinition { name = "Darkmoon Seance Ring", effectDescription = "+35% Arcane Damage & +15% HP", hpMult = 1.15f, staminaRegenMult = 1.15f, damageMult = 1.35f, poiseMult = 1.10f }
            };
        }

        public void CycleWeapon(int dir)
        {
            CurrentWeaponIndex = (CurrentWeaponIndex + dir + Weapons.Count) % Weapons.Count;
            OnWeaponChanged?.Invoke(ActiveWeapon);
            var hud = FindFirstObjectByType<DarkSoulsHUD>();
            if (hud != null) hud.ShowNotification($"EQUIPPED WEAPON: {ActiveWeapon.name.ToUpper()} ({ActiveWeapon.baseDamage} DMG)");
        }

        public void CycleSpell(int dir)
        {
            CurrentSpellIndex = (CurrentSpellIndex + dir + Spells.Count) % Spells.Count;
            OnSpellChanged?.Invoke(ActiveSpell);
            var hud = FindFirstObjectByType<DarkSoulsHUD>();
            if (hud != null) hud.ShowNotification($"ATTUNED SPELL: {ActiveSpell.name.ToUpper()} ({ActiveSpell.school})");
        }

        public void CycleRing(int dir)
        {
            CurrentRingIndex = (CurrentRingIndex + dir + Rings.Count) % Rings.Count;
            OnRingChanged?.Invoke(ActiveRing);
            var hud = FindFirstObjectByType<DarkSoulsHUD>();
            if (hud != null) hud.ShowNotification($"EQUIPPED RING: {ActiveRing.name.ToUpper()} ({ActiveRing.effectDescription})");
        }

        public void CastActiveSpell()
        {
            if (player == null) player = FindFirstObjectByType<DarkSoulsPlayer>();
            if (player == null || spellCooldownTimer > 0f) return;

            var spell = ActiveSpell;
            if (player.currentStamina < spell.staminaCost) return;

            player.currentStamina = Mathf.Max(0f, player.currentStamina - spell.staminaCost);
            spellCooldownTimer = spell.cooldown;

            if (spell.isHeal)
            {
                player.currentHealth = Mathf.Min(player.maxHealth, player.currentHealth + spell.damage);
                var hud = FindFirstObjectByType<DarkSoulsHUD>();
                if (hud != null)
                {
                    hud.UpdateHealth(player.currentHealth, player.maxHealth);
                    hud.ShowNotification($"CAST {spell.name.ToUpper()} (+{(int)spell.damage} HP)");
                }
                return;
            }

            // Spawn visible glowing spell projectile
            Vector3 origin = player.transform.position + Vector3.up * 1.4f + player.transform.forward * 1.1f;
            var orb = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            orb.name = $"SpellOrb_{spell.name}";
            orb.transform.position = origin;
            orb.transform.localScale = Vector3.one * 0.55f;
            Destroy(orb.GetComponent<Collider>());

            var shader = Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard");
            var mat = new Material(shader) { color = spell.projectileColor };
            if (mat.HasProperty("_EmissionColor"))
            {
                mat.EnableKeyword("_EMISSION");
                mat.SetColor("_EmissionColor", spell.projectileColor * 2.5f);
            }
            orb.GetComponent<Renderer>().sharedMaterial = mat;

            var proj = orb.AddComponent<SpellProjectile>();
            proj.Init(player.transform.forward, 26f, spell.range, spell.damage * ActiveRing.damageMult, player.transform.position);
        }
    }

    public class SpellProjectile : MonoBehaviour
    {
        private Vector3 dir;
        private float speed;
        private float maxRange;
        private float damage;
        private Vector3 startPos;
        private bool hit = false;

        public void Init(Vector3 direction, float spd, float range, float dmg, Vector3 attackerOrigin)
        {
            dir = direction.normalized;
            speed = spd;
            maxRange = range;
            damage = dmg;
            startPos = attackerOrigin;
        }

        private void Update()
        {
            if (hit) return;
            transform.position += dir * speed * Time.deltaTime;

            var cols = Physics.OverlapSphere(transform.position, 1.3f);
            foreach (var c in cols)
            {
                if (c.GetComponent<DarkSoulsPlayer>() != null) continue;

                if (c.TryGetComponent<EnemyHollow>(out var hollow))
                {
                    hollow.TakeDamage(damage, startPos);
                    hit = true;
                    Destroy(gameObject);
                    return;
                }
                if (c.TryGetComponent<OutsideMob>(out var mob))
                {
                    mob.TakeDamage(damage, startPos);
                    hit = true;
                    Destroy(gameObject);
                    return;
                }
                if (c.TryGetComponent<BossApex>(out var apex))
                {
                    apex.TakeDamage(damage);
                    hit = true;
                    Destroy(gameObject);
                    return;
                }
                if (c.TryGetComponent<BossTaurus>(out var taurus))
                {
                    taurus.TakeDamage(damage, startPos);
                    hit = true;
                    Destroy(gameObject);
                    return;
                }
            }

            if (Vector3.Distance(startPos, transform.position) >= maxRange)
            {
                Destroy(gameObject);
            }
        }
    }
}
