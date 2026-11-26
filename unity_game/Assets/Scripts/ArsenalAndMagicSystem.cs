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
    /// Unity 625x Mega Arsenal & Magic System: 1,875 Weapons, 1,250 Spells/Miracles, and 1,250 Sacred Rings (Build V78).
    /// </summary>
    public class ArsenalAndMagicSystem : MonoBehaviour
    {
        public List<WeaponDefinition> Weapons { get; private set; } = new List<WeaponDefinition>(1875);
        public List<SpellDefinition> Spells { get; private set; } = new List<SpellDefinition>(1250);
        public List<RingDefinition> Rings { get; private set; } = new List<RingDefinition>(1250);

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
            InitWeapons75();
            InitSpells50();
            InitRings50();
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

        private void InitWeapons75()
        {
            string[] weaponNames = {
                "Astora Straight Sword", "Claymore", "Zweihander", "Uchigatana", "Moonlight Greatsword",
                "Black Knight Halberd", "Dragonslayer Spear", "Quelaag's Furysword", "Abyss Greatsword", "Rivers of Blood",
                "Dark Moon Greatsword", "Mortal Blade", "Starscourge Greatsword", "Maliketh's Black Blade", "Sacred Relic Sword",
                "Broadsword", "Longsword", "Balder Side Sword", "Sunlight Straight Sword", "Lothric Knight Sword",
                "Bastard Sword", "Flamberge", "Black Knight Sword", "Greatsword of Artorias", "Wolf Knight's Greatsword",
                "Hollowslayer Greatsword", "Twin Princes' Greatsword", "Firelink Greatsword", "Gael's Greatsword", "Blasphemous Blade",
                "Ordovis's Greatsword", "Helphen's Steeple", "Death's Poker", "Alabaster Lord's Sword", "Marais Executioner's Sword",
                "Greatsword (Guts)", "Fume Ultra Greatsword", "Cathedral Knight Greatsword", "Astora Greatsword", "Ringed Knight Paired Greatswords",
                "Ruins Greatsword", "Grafted Blade Greatsword", "Godslayer's Greatsword", "Ancient Meteoric Ore Greatsword", "Fire Knight's Greatsword",
                "Washing Pole", "Chaos Blade", "Onikiri and Ubadachi", "Frayed Blade", "Hand of Malenia",
                "Moonveil", "Nagakiba", "Dragonscale Blade", "Sword of Night", "Great Katana",
                "Scythe", "Great Scythe", "Lifehunt Scythe", "Pontiff Knight Great Scythe", "Friede's Great Scythe",
                "Winged Scythe", "Halo Scythe", "Obsidian Lamina", "Grave Scythe", "Burial Blade",
                "Dragon Tooth", "Smough's Great Hammer", "Ledo's Great Hammer", "Giant-Crusher", "Prelate's Inferno Crozier",
                "Mohgwyn's Sacred Spear", "Bolt of Gransax", "Cross-Naginata", "Serpent-Hunter", "Spear of the Impaler"
            };
            string[] categories = {
                "Straight Sword", "Greatsword", "Ultra Greatsword", "Katana", "Reaper", "Colossal", "Halberd", "Spear"
            };
            Color[] tints = {
                new Color(0.85f, 0.88f, 0.95f), new Color(0.35f, 0.85f, 1.0f), new Color(1.0f, 0.35f, 0.12f),
                new Color(0.45f, 0.18f, 0.78f), new Color(0.95f, 0.78f, 0.25f), new Color(0.88f, 0.12f, 0.18f)
            };

            string[] infusions = { "", "Heavy +10 ", "Lightning ", "Abyssal ", "Primordial " };
            string[] temperGrades = { "", " [+5]", " [+10]", " [+15]", " [+25 Maxed]" };
            Weapons.Clear();
            for (int grade = 0; grade < temperGrades.Length; grade++)
            {
                for (int tier = 0; tier < infusions.Length; tier++)
                {
                    for (int i = 0; i < weaponNames.Length; i++)
                    {
                        Weapons.Add(new WeaponDefinition
                        {
                            name = $"{infusions[tier]}{weaponNames[i]}{temperGrades[grade]}",
                            category = categories[i % categories.Length],
                            baseDamage = (145f + (i * 5.5f)) * (1f + tier * 0.18f) * (1f + grade * 0.14f),
                            staminaCost = 18f + (i % 6) * 4f,
                            range = 3.0f + (i % 5) * 0.45f + tier * 0.12f,
                            poiseDamage = (28f + (i % 7) * 10f) * (1f + tier * 0.12f),
                            bladeTint = tints[(i + tier + grade) % tints.Length]
                        });
                    }
                }
            }
        }

        private void InitSpells50()
        {
            string[] spellNames = {
                "Soul Arrow", "Great Heavy Soul Arrow", "Sunlight Spear", "Chaos Fireball", "Dark Bead",
                "Wrath of the Gods", "Crystal Soul Spear", "Comet Azur", "Black Flame", "Healing Grace",
                "Homing Soulmass", "Homing Crystal Soulmass", "White Dragon Breath", "Soul Stream", "Moonlight Vortex",
                "Ranni's Dark Moon", "Loretta's Mastery", "Stars of Ruin", "Rock Sling", "Meteorite of Astel",
                "Lightning Spear", "Great Lightning Spear", "Sunlight Blade", "Lightning Storm", "Ancient Dragons' Lightning Strike",
                "Fortissax's Lightning Spear", "Lansseax's Glaive", "Frozen Lightning Spear", "Death Lightning", "Honest Bolt",
                "Fireball", "Great Chaos Fire Orb", "Forbidden Sun", "Chaos Bed Vestiges", "Black Fire Orb",
                "Flame of the Fell God", "Giantsflame Take Thee", "Burn, O Flame!", "Black Flame Ritual", "Scouring Black Flame",
                "Pursuers", "Affinity", "Dark Orb", "Black Serpent", "Soul Dregs",
                "Swarm of Flies", "Bloodboon Ritual", "Scarlet Aeonia", "Erdtree Heal", "Lord's Heal"
            };
            string[] schools = { "Sorcery", "Miracle", "Pyromancy", "Abyssal Hex", "Primeval", "Bloodflame" };
            Color[] colors = {
                new Color(0.35f, 0.78f, 1.0f), new Color(1.0f, 0.85f, 0.25f), new Color(1.0f, 0.35f, 0.05f),
                new Color(0.45f, 0.12f, 0.72f), new Color(0.20f, 0.90f, 0.85f), new Color(0.88f, 0.12f, 0.18f)
            };

            string[] mastery = { "", "Greater ", "Primeval ", "Calamitous ", "Transcendent " };
            string[] castForms = { "", " [Charged]", " [Twin-Cast]", " [Echoing]", " [Astral]" };
            Spells.Clear();
            for (int form = 0; form < castForms.Length; form++)
            {
                for (int tier = 0; tier < mastery.Length; tier++)
                {
                    for (int i = 0; i < spellNames.Length; i++)
                    {
                        bool heal = spellNames[i].Contains("Heal") || spellNames[i].Contains("Grace");
                        Spells.Add(new SpellDefinition
                        {
                            name = $"{mastery[tier]}{spellNames[i]}{castForms[form]}",
                            school = schools[i % schools.Length],
                            damage = (160f + i * 9f) * (1f + tier * 0.22f) * (1f + form * 0.16f),
                            staminaCost = 18f + (i % 5) * 5f,
                            range = heal ? 0f : 18f + (i % 4) * 5f + tier * 2f + form * 1.5f,
                            cooldown = Mathf.Max(0.35f, (0.8f + (i % 4) * 0.35f) - tier * 0.06f),
                            projectileColor = colors[(i + tier + form) % colors.Length],
                            isHeal = heal
                        });
                    }
                }
            }
        }

        private void InitRings50()
        {
            string[] ringNames = {
                "Ring of Favor & Protection", "Chloranthy Ring", "Wolf Ring", "Hornet Ring", "Bellowing Dragoncrest",
                "Havel's Ring", "Red Tearstone Ring", "Lingering Dragoncrest", "Silvercat Ring", "Darkmoon Seance Ring",
                "Cloranthy Ring +3", "Ring of Steel Protection +3", "Prisoner's Chain", "Estus Ring", "Ashen Estus Ring",
                "Sun's First Born Ring", "Morne's Ring", "Witch's Ring", "Great Swamp Ring", "Sage Ring +2",
                "Young Dragon Ring", "Dark Clutch Ring", "Lightning Clutch Ring", "Fire Clutch Ring", "Magic Clutch Ring",
                "Pontiff's Right Eye", "Pontiff's Left Eye", "Carthus Milkring", "Carthus Bloodring", "Knight Slayer's Ring",
                "Leo Ring", "Hawk Ring", "Slumbering Dragoncrest", "Obscuring Ring", "Untrue Dark Ring",
                "Erdtree's Favor +2", "Crimson Amber Medallion +3", "Viridian Amber Medallion +3", "Green Turtle Talisman", "Bull-Goat's Talisman",
                "Shard of Alexander", "Rotten Winged Sword Insignia", "Millicent's Prosthesis", "Godfrey Icon", "Radagon Icon",
                "Graven-Mass Talisman", "Flock's Canvas Talisman", "Dragoncrest Greatshield", "Lord of Blood's Exultation", "Two-Handed Sword Talisman"
            };

            string[] ringTiers = { "", " [Ascended +1]", " [Ascended +2]", " [Ascended +3]", " [Primordial +4]" };
            string[] blessings = { "", " (Sunlit)", " (Moonlit)", " (Abyssal)", " (Erdtree)" };
            Rings.Clear();
            for (int bless = 0; bless < blessings.Length; bless++)
            {
                for (int tier = 0; tier < ringTiers.Length; tier++)
                {
                    for (int i = 0; i < ringNames.Length; i++)
                    {
                        float hp = 1.0f + ((i % 4 == 0) ? 0.25f : 0.08f) + tier * 0.06f + bless * 0.04f;
                        float stam = 1.0f + ((i % 3 == 0) ? 0.35f : 0.12f) + tier * 0.08f + bless * 0.05f;
                        float dmg = 1.0f + ((i % 2 == 0) ? 0.28f : 0.15f) + (i * 0.005f) + tier * 0.10f + bless * 0.06f;
                        float poise = 1.0f + ((i % 5 == 0) ? 0.50f : 0.10f) + tier * 0.10f;
                        Rings.Add(new RingDefinition
                        {
                            name = $"{ringNames[i]}{ringTiers[tier]}{blessings[bless]}",
                            effectDescription = $"+{Mathf.RoundToInt((hp - 1f) * 100)}% HP, +{Mathf.RoundToInt((dmg - 1f) * 100)}% DMG",
                            hpMult = hp,
                            staminaRegenMult = stam,
                            damageMult = dmg,
                            poiseMult = poise
                        });
                    }
                }
            }
        }

        public void SelectWeapon(int index)
        {
            if (Weapons.Count == 0) return;
            CurrentWeaponIndex = Mathf.Clamp(index, 0, Weapons.Count - 1);
            OnWeaponChanged?.Invoke(ActiveWeapon);
        }

        public void SelectSpell(int index)
        {
            if (Spells.Count == 0) return;
            CurrentSpellIndex = Mathf.Clamp(index, 0, Spells.Count - 1);
            OnSpellChanged?.Invoke(ActiveSpell);
        }

        public void SelectRing(int index)
        {
            if (Rings.Count == 0) return;
            CurrentRingIndex = Mathf.Clamp(index, 0, Rings.Count - 1);
            OnRingChanged?.Invoke(ActiveRing);
        }

        public void CycleWeapon(int dir)
        {
            CurrentWeaponIndex = (CurrentWeaponIndex + dir + Weapons.Count) % Weapons.Count;
            OnWeaponChanged?.Invoke(ActiveWeapon);
            var hud = FindFirstObjectByType<DarkSoulsHUD>();
            if (hud != null) hud.ShowNotification($"WEAPON [{CurrentWeaponIndex + 1}/{Weapons.Count}]: {ActiveWeapon.name.ToUpper()} ({ActiveWeapon.baseDamage:0} DMG)");
        }

        public void CycleSpell(int dir)
        {
            CurrentSpellIndex = (CurrentSpellIndex + dir + Spells.Count) % Spells.Count;
            OnSpellChanged?.Invoke(ActiveSpell);
            var hud = FindFirstObjectByType<DarkSoulsHUD>();
            if (hud != null) hud.ShowNotification($"SPELL [{CurrentSpellIndex + 1}/{Spells.Count}]: {ActiveSpell.name.ToUpper()} ({ActiveSpell.school})");
        }

        public void CycleRing(int dir)
        {
            CurrentRingIndex = (CurrentRingIndex + dir + Rings.Count) % Rings.Count;
            OnRingChanged?.Invoke(ActiveRing);
            var hud = FindFirstObjectByType<DarkSoulsHUD>();
            if (hud != null) hud.ShowNotification($"RING [{CurrentRingIndex + 1}/{Rings.Count}]: {ActiveRing.name.ToUpper()} ({ActiveRing.effectDescription})");
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
            proj.Init(player.transform.forward, 28f, spell.range, spell.damage * ActiveRing.damageMult, player.transform.position);
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

            var cols = Physics.OverlapSphere(transform.position, 1.35f);
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
