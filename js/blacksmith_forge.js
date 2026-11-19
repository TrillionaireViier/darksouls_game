// ====================================================================
// THE ROYAL BLACKSMITH, TITANITE FORGE & 370 RELICS COMPENDIUM (301–330)
// Complete Dark Souls Weapon Reinforcement, Elemental Infusions,
// Boss Soul Transmutation, Estus Flask Fire Keeper Upgrades,
// and Comprehensive 370 Lordran Relics, Artifacts & Armory Codex.
// ====================================================================

(function() {
    'use strict';

    // ----------------------------------------------------
    // COMPREHENSIVE 300 LORDRAN RELICS & ARTIFACTS DATABASE
    // ----------------------------------------------------
    const CATEGORIES = ['WEAPONS', 'SHIELDS', 'ARMOR', 'RINGS', 'SPELLS', 'TITANITE', 'BOSS_SOULS', 'RELICS'];

    const BLACKSMITH_300_ITEMS = [
        // 1-50: MELEE WEAPONS & BLADES
        { id: 1, name: "Astora Straight Sword", type: "WEAPONS", rarity: "RARE", desc: "A well-crafted sword given to high-ranking knights of Astora. Imbued with sacred divine power.", stat: "+180 Physical / +120 Divine" },
        { id: 2, name: "Claymore", type: "WEAPONS", rarity: "UNCOMMON", desc: "Classic two-handed greatsword capable of both sweeping slashes and piercing thrusts.", stat: "+210 Physical" },
        { id: 3, name: "Zweihander", type: "WEAPONS", rarity: "RARE", desc: "Colossal ultra-greatsword whose crushing downward overhead strikes pancakes enemies.", stat: "+290 Physical" },
        { id: 4, name: "Uchigatana", type: "WEAPONS", rarity: "RARE", desc: "Katana forged in a foreign land. Serrated curved blade causes severe hemorrhaging bleed.", stat: "+195 Physical / Bleed 300" },
        { id: 5, name: "Iaito", type: "WEAPONS", rarity: "RARE", desc: "Fast-draw katana favored by Eastern master swordsmen for lightning quick draw counters.", stat: "+190 Physical / Quickdraw" },
        { id: 6, name: "Washing Pole", type: "WEAPONS", rarity: "EPIC", desc: "Nodachi blade with terrifying length, keeping foes at bay with sweeping horizontal arcs.", stat: "+220 Physical / Extreme Reach" },
        { id: 7, name: "Balder Side Sword", type: "WEAPONS", rarity: "RARE", desc: "Refined rapier-like straight sword used by fallen knights of the ancient Balder kingdom.", stat: "+175 Physical / S Dex Scaling" },
        { id: 8, name: "Black Knight Sword", type: "WEAPONS", rarity: "EPIC", desc: "Greatsword wielded by Black Knights who faced Chaos Demons. Heavy damage against demons.", stat: "+265 Physical / +20% vs Demons" },
        { id: 9, name: "Black Knight Greatsword", type: "WEAPONS", rarity: "LEGENDARY", desc: "Colossal blade with curved tip designed to send towering demons airborne.", stat: "+320 Physical / Knockback" },
        { id: 10, name: "Black Knight Halberd", type: "WEAPONS", rarity: "LEGENDARY", desc: "Unrivaled halberd with exceptional range, sweeping power and staggering spin attacks.", stat: "+310 Physical / Spin Cleave" },
        { id: 11, name: "Black Knight Greataxe", type: "WEAPONS", rarity: "LEGENDARY", desc: "Monstrous obsidian axe requiring titan strength. Unleashes leaping shockwave slams.", stat: "+340 Physical / Leap Slam" },
        { id: 12, name: "Moonlight Greatsword", type: "WEAPONS", rarity: "MYTHIC", desc: "Luminous blade forged from Seath's tail, unleashing waves of pure moonlight crystal sorcery.", stat: "+280 Magic / Moonlight Wave" },
        { id: 13, name: "Greatsword of Artorias", type: "WEAPONS", rarity: "MYTHIC", desc: "Holy greatsword of the Abysswalker, repelling darkwraiths and traversing the dark void.", stat: "+270 Phys / +180 Divine" },
        { id: 14, name: "Abyss Greatsword", type: "WEAPONS", rarity: "MYTHIC", desc: "The corrupted blade of Artorias, stained by the dark Abyss, unleashing acrobatic somersaults.", stat: "+290 Dark / Somersault Flip" },
        { id: 15, name: "Chaos Blade", type: "WEAPONS", rarity: "LEGENDARY", desc: "Cursed demonic katana born from Quelaag's soul. Drains wielder's vitality on contact.", stat: "+240 Chaos / Scales with Humanity" },
        { id: 16, name: "Quelaag's Furysword", type: "WEAPONS", rarity: "LEGENDARY", desc: "Curved sword trailing liquid crimson flames that blaze brighter with unspent humanity.", stat: "+150 Phys / +220 Fire" },
        { id: 17, name: "Dragon Greatsword", type: "WEAPONS", rarity: "MYTHIC", desc: "Carved from the tail of the Everlasting Stone Dragon of Ash Lake. Releases shockwave bursts.", stat: "+390 Physical / Ground Shockwave" },
        { id: 18, name: "Drake Sword", type: "WEAPONS", rarity: "UNCOMMON", desc: "Severed tail of the Hellkite Wyvern guarding the Undead Burg bridge. Pierces heavy armor.", stat: "+200 Physical" },
        { id: 19, name: "Dragon Tooth", type: "WEAPONS", rarity: "LEGENDARY", desc: "Created from the fossilized tooth of an ancient dragon, wielded by Havel the Rock.", stat: "+360 Physical / Magic Resist +30" },
        { id: 20, name: "Grant", type: "WEAPONS", rarity: "LEGENDARY", desc: "Colossal warhammer blessed with holy wrath, triggering Wrath of the Gods on two-handed slam.", stat: "+290 Phys / +200 Divine" },
        { id: 21, name: "Sanctus", type: "SHIELDS", rarity: "RARE", desc: "Shield inscribed with golden holy sigil, slowly restoring the bearer's vitality over time.", stat: "+HP Regen / 95% Phys Guard" },
        { id: 22, name: "Grass Crest Shield", type: "SHIELDS", rarity: "RARE", desc: "Ancient wooden shield depicted with a floral spirit. Dramatically accelerates stamina recovery.", stat: "+Stamina Regen / 95% Phys Guard" },
        { id: 23, name: "Silver Knight Shield", type: "SHIELDS", rarity: "EPIC", desc: "Pristine white silver shield of Anor Londo with highest stability among medium shields.", stat: "Stability 76 / 100% Phys Guard" },
        { id: 24, name: "Black Knight Shield", type: "SHIELDS", rarity: "EPIC", desc: "Scorched black iron shield, granting near total immunity to raging dragon fire.", stat: "Fire Resist 95% / 100% Phys Guard" },
        { id: 25, name: "Havel's Greatshield", type: "SHIELDS", rarity: "LEGENDARY", desc: "Cut directly from a solid slab of stone. Enables Stone Flesh miracle hardening.", stat: "Stability 84 / Stone Flesh Skill" },
        { id: 26, name: "Crest Shield", type: "SHIELDS", rarity: "RARE", desc: "Cerulean knight shield granting massive magic resistance against sorcerers and wraiths.", stat: "Magic Resist 80% / 100% Phys Guard" },
        { id: 27, name: "Dragon Crest Shield", type: "SHIELDS", rarity: "RARE", desc: "Shield painted with the likeness of an ancient wyvern, deflecting high temperature blasts.", stat: "Fire Resist 85% / 100% Phys Guard" },
        { id: 28, name: "Bloodshield", type: "SHIELDS", rarity: "RARE", desc: "Inscribed with ancient rites of purgation, dramatically bolstering resistance to poison, bleed and curse.", stat: "Immunity +50% All Status" },
        { id: 29, name: "Target Shield", type: "SHIELDS", rarity: "UNCOMMON", desc: "Small round parrying shield with extended parry frames, ideal for deadly ripostes.", stat: "Extended Parry Window" },
        { id: 30, name: "Buckler", type: "SHIELDS", rarity: "COMMON", desc: "Lightweight metal disc favored by thieves and wanderers for precision weapon deflections.", stat: "Superior Parry Timing" },

        // 31-60: RINGS & TALISMANS
        { id: 31, name: "Havel's Ring", type: "RINGS", rarity: "LEGENDARY", desc: "Named after Havel the Rock. Increases maximum equipment burden by 50%.", stat: "+50% Max Equip Load" },
        { id: 32, name: "Ring of Favor and Protection", type: "RINGS", rarity: "LEGENDARY", desc: "Goddess Fina's ring. Boosts HP, stamina and equip load by 20%, but breaks if ever removed.", stat: "+20% HP, Stamina, Equip" },
        { id: 33, name: "Cloranthy Ring", type: "RINGS", rarity: "RARE", desc: "Engraved with a blooming water flower. Accelerates stamina regeneration rate by 40%.", stat: "+40% Stamina Recovery" },
        { id: 34, name: "Wolf Ring", type: "RINGS", rarity: "EPIC", desc: "One of the Four Knights' rings. Grants Artorias' unyielding fortitude (+40 Poise).", stat: "+40 Poise Defense" },
        { id: 35, name: "Hornet Ring", type: "RINGS", rarity: "EPIC", desc: "Lord's Blade Ciaran's ring. Enhances critical attack damage on backstabs and ripostes by 30%.", stat: "+30% Critical Damage" },
        { id: 36, name: "Leo Ring", type: "RINGS", rarity: "EPIC", desc: "Dragonslayer Ornstein's ring. Strengthens thrust weapon counter attacks by 40%.", stat: "+40% Thrust Counter" },
        { id: 37, name: "Hawk Ring", type: "RINGS", rarity: "EPIC", desc: "Hawkeye Gough's ring. Dramatically extends the effective range of greatbows.", stat: "+50% Arrow Range" },
        { id: 38, name: "Dark Wood Grain Ring", type: "RINGS", rarity: "LEGENDARY", desc: "Ancient Eastern secret. Transforms dodge rolls into swift ninja cartwheel flips.", stat: "Ninja Flip Roll Animation" },
        { id: 39, name: "Covenant of Artorias", type: "RINGS", rarity: "MYTHIC", desc: "Enables traversal of the bottomless dark Abyss without succumbing to the void.", stat: "Abyss Traversal Pass" },
        { id: 40, name: "Rusted Iron Ring", type: "RINGS", rarity: "UNCOMMON", desc: "Maintains full sprinting mobility in deep water, swamp muck and sunken catacombs.", stat: "Zero Water Drag" },
        { id: 41, name: "Ring of the Evil Eye", type: "RINGS", rarity: "RARE", desc: "Absorbs HP from slain foes, channeling thirty health points per fallen enemy.", stat: "+30 HP Per Slain Mob" },
        { id: 42, name: "Bellowing Dragoncrest Ring", type: "RINGS", rarity: "RARE", desc: "Secret ring of Vinheim Dragon School. Boosts magic and sorcery potency by 20%.", stat: "+20% Sorcery & Flame DMG" },
        { id: 43, name: "Ring of the Sun's Firstborn", type: "RINGS", rarity: "EPIC", desc: "Lord of Sunlight's firstborn ring. Amplifies divine miracle strength by 20%.", stat: "+20% Miracle Power" },
        { id: 44, name: "Red Tearstone Ring", type: "RINGS", rarity: "RARE", desc: "Triggers hyper-mode: attack power increases by 50% when current health drops below 20%.", stat: "+50% ATK when HP < 20%" },
        { id: 45, name: "Blue Tearstone Ring", type: "RINGS", rarity: "COMMON", desc: "Boosts physical and magical defense by 50% when on the brink of death.", stat: "+50% DEF when HP < 20%" },
        { id: 46, name: "Covetous Gold Serpent Ring", type: "RINGS", rarity: "RARE", desc: "Serpent ring that craves gold. Increases item discovery rate by +200 points.", stat: "+200 Item Discovery" },
        { id: 47, name: "Covetous Silver Serpent Ring", type: "RINGS", rarity: "RARE", desc: "Serpent ring that feeds on souls. Increases soul absorption from slain enemies by 20%.", stat: "+20% Souls Gained" },
        { id: 48, name: "Ring of Steel Protection", type: "RINGS", rarity: "RARE", desc: "Heavy knightly band. Bolsters physical defense by +50 points against blunt and slash.", stat: "+50 Physical Defense" },
        { id: 49, name: "Flame Stoneplate Ring", type: "RINGS", rarity: "UNCOMMON", desc: "Protects against dragon flames and lava by +50 points.", stat: "+50 Fire Defense" },
        { id: 50, name: "Thunder Stoneplate Ring", type: "RINGS", rarity: "UNCOMMON", desc: "Shields against sunlight lightning bolts by +50 points.", stat: "+50 Lightning Defense" },

        // 51-80: TITANITE ORES & FORGE MATERIALS
        { id: 51, name: "Titanite Shard", type: "TITANITE", rarity: "COMMON", desc: "Piece of titanite slab. Reinforces standard weapons up to +5.", stat: "Forge +1 to +5" },
        { id: 52, name: "Large Titanite Shard", type: "TITANITE", rarity: "UNCOMMON", desc: "Large chunk of titanite. Reinforces standard weapons from +6 up to +10.", stat: "Forge +6 to +10" },
        { id: 53, name: "Titanite Chunk", type: "TITANITE", rarity: "RARE", desc: "Lump of divine titanite. Reinforces standard weapons from +11 to +14.", stat: "Forge +11 to +14" },
        { id: 54, name: "Titanite Slab", type: "TITANITE", rarity: "LEGENDARY", desc: "Legendary slab of the gods. Ascends weapon to ultimate +15 maximum pinnacle.", stat: "Pinnacle Forge +15" },
        { id: 55, name: "Green Titanite Shard", type: "TITANITE", rarity: "UNCOMMON", desc: "Alchemically treated titanite. Imbues weapons with Magic and Divine enchantments.", stat: "Divine / Magic Infusion" },
        { id: 56, name: "Red Titanite Chunk", type: "TITANITE", rarity: "RARE", desc: "Scorched in primeval lava. Used to forge Fire +6 to +9 and Chaos weapons.", stat: "Fire / Chaos Infusion" },
        { id: 57, name: "Red Titanite Slab", type: "TITANITE", rarity: "LEGENDARY", desc: "Pure molten titanite. Ascends Fire weapons to +10 and Chaos to +5.", stat: "Pinnacle Fire +10 / Chaos +5" },
        { id: 58, name: "Blue Titanite Chunk", type: "TITANITE", rarity: "RARE", desc: "Crystalline titanite. Upgrades Magic weapons to +9 and Enchanted weapons to +4.", stat: "Magic +9 / Enchanted +4" },
        { id: 59, name: "Blue Titanite Slab", type: "TITANITE", rarity: "LEGENDARY", desc: "Pinnacle crystal slab. Ascends Magic weapons to +10 and Enchanted to +5.", stat: "Pinnacle Magic +10" },
        { id: 60, name: "White Titanite Chunk", type: "TITANITE", rarity: "RARE", desc: "Blessed with holy light. Upgrades Divine weapons to +9 and Occult to +4.", stat: "Divine +9 / Occult +4" },
        { id: 61, name: "White Titanite Slab", type: "TITANITE", rarity: "LEGENDARY", desc: "Sacred slab of Gwyn. Ascends Divine weapons to +10 and Occult to +5.", stat: "Pinnacle Divine +10" },
        { id: 62, name: "Twinkling Titanite", type: "TITANITE", rarity: "EPIC", desc: "Luminescent mineral. Upgrades unique armor and legendary weapons to +5.", stat: "Unique Weapon +1 to +5" },
        { id: 63, name: "Demon Titanite", type: "TITANITE", rarity: "EPIC", desc: "Special titanite formed from the bed of Chaos. Upgrades boss soul weapons to +5.", stat: "Boss Soul Forge +1 to +5" },
        { id: 64, name: "Dragon Scale", type: "TITANITE", rarity: "LEGENDARY", desc: "Ancient scale of an Everlasting Dragon. Upgrades dragon weapons to +5.", stat: "Dragon Weapon +1 to +5" },
        { id: 65, name: "Large Divine Ember", type: "RELICS", rarity: "LEGENDARY", desc: "Sacred ember found in the Tomb of the Giants. Allows Andre to forge Divine +10 weapons.", stat: "Divine Ascension Unlocked" },
        { id: 66, name: "Very Large Ember", type: "RELICS", rarity: "MYTHIC", desc: "Found in New Londo ruins. Unlocks ultimate standard weapon path from +11 to +15.", stat: "+15 Master Forge Unlocked" },
        { id: 67, name: "Chaos Flame Ember", type: "RELICS", rarity: "LEGENDARY", desc: "Found in Demon Ruins lava lake. Unlocks Chaos infusions scaled with humanity.", stat: "Chaos Forge Unlocked" },
        { id: 68, name: "Dark Ember", type: "RELICS", rarity: "LEGENDARY", desc: "Found in Painted World of Ariamis. Unlocks dark Occult weapon ascension.", stat: "Occult Forge Unlocked" },
        { id: 69, name: "Crystal Ember", type: "RELICS", rarity: "EPIC", desc: "Found in Duke's Archives. Unlocks high-damage Crystal weapon enchantment.", stat: "Crystal Forge Unlocked" },
        { id: 70, name: "Enchanted Ember", type: "RELICS", rarity: "EPIC", desc: "Found in Darkroot Garden pool. Unlocks Enchanted weapons with S Int scaling.", stat: "Enchanted Forge Unlocked" },

        // 71-100: BOSS SOULS & POWERFUL CONJURATIONS
        { id: 71, name: "Soul of the Taurus Demon", type: "BOSS_SOULS", rarity: "EPIC", desc: "Soul of the rampaging Taurus Demon. Transmutes into the Taurus Demon Greataxe.", stat: "+5,000 Souls / Transmute Axe" },
        { id: 72, name: "Soul of the Bell Gargoyle", type: "BOSS_SOULS", rarity: "EPIC", desc: "Soul of the belfry guardian. Transmutes into Gargoyle Halberd or Tail Axe.", stat: "+6,500 Souls / Transmute Halberd" },
        { id: 73, name: "Soul of the Capra Demon", type: "BOSS_SOULS", rarity: "EPIC", desc: "Soul of the claustrophobic Capra Lord. Transmutes into Demon Great Machete.", stat: "+7,000 Souls / Transmute Machete" },
        { id: 74, name: "Soul of Great Grey Wolf Sif", type: "BOSS_SOULS", rarity: "LEGENDARY", desc: "Soul of the loyal wolf guardian. Transmutes into Greatsword of Artorias.", stat: "+12,000 Souls / Transmute Artorias" },
        { id: 75, name: "Soul of Gwyn, Lord of Cinder", type: "BOSS_SOULS", rarity: "MYTHIC", desc: "Soul of the primeval Lord of Sunlight. Transmutes into Great Lord Greatsword.", stat: "+20,000 Souls / Transmute Gwyn" },
        { id: 76, name: "Soul of the Iron Golem", type: "BOSS_SOULS", rarity: "EPIC", desc: "Soul of Sen's Fortress guardian. Transmutes into Dragonbone Fist or Golem Axe.", stat: "+8,000 Souls / Wind Cutter Axe" },
        { id: 77, name: "Soul of Ornstein", type: "BOSS_SOULS", rarity: "LEGENDARY", desc: "Soul of the Dragonslayer captain. Transmutes into Dragonslayer Spear.", stat: "+15,000 Souls / Lightning Spear" },
        { id: 78, name: "Soul of Smough", type: "BOSS_SOULS", rarity: "LEGENDARY", desc: "Soul of the royal executioner. Transmutes into Smough's Great Hammer.", stat: "+15,000 Souls / Crushing Hammer" },
        { id: 79, name: "Soul of Chaos Witch Quelaag", type: "BOSS_SOULS", rarity: "LEGENDARY", desc: "Soul of the spider daughter of Chaos. Transmutes into Quelaag's Furysword.", stat: "+10,000 Souls / Flame Furysword" },
        { id: 80, name: "Soul of Moonlight Butterfly", type: "BOSS_SOULS", rarity: "RARE", desc: "Soul of Seath's magical creation. Transmutes into Moonlight Butterfly Horn.", stat: "+4,500 Souls / Pure Magic Spear" },
        { id: 81, name: "Soul of Knight Artorias", type: "BOSS_SOULS", rarity: "MYTHIC", desc: "Soul of the tragic Abysswalker. Transmutes into Abyss Greatsword.", stat: "+16,000 Souls / Abyss Greatsword" },
        { id: 82, name: "Soul of Manus, Father of the Abyss", type: "BOSS_SOULS", rarity: "MYTHIC", desc: "Primeval human soul of Manus. Transmutes into Manus Catalyst.", stat: "+25,000 Souls / Manus Catalyst" },
        { id: 83, name: "Fire Keeper Soul (Undead Parish)", type: "RELICS", rarity: "LEGENDARY", desc: "Soul of a maiden who tended the flame. Reinforces Estus Flask healing (+1).", stat: "Estus Flask +1 (Heal 600)" },
        { id: 84, name: "Fire Keeper Soul (Blighttown)", type: "RELICS", rarity: "LEGENDARY", desc: "Soul bathed in toxic mire. Reinforces Estus Flask healing (+2).", stat: "Estus Flask +2 (Heal 700)" },
        { id: 85, name: "Fire Keeper Soul (New Londo)", type: "RELICS", rarity: "LEGENDARY", desc: "Soul found submerged in dark waters. Reinforces Estus Flask healing (+3).", stat: "Estus Flask +3 (Heal 800)" },
        { id: 86, name: "Fire Keeper Soul (Anor Londo)", type: "RELICS", rarity: "MYTHIC", desc: "Soul of the Darkmoon Knightess. Reinforces Estus Flask healing (+4).", stat: "Estus Flask +4 (Heal 900)" },
        { id: 87, name: "Fire Keeper Soul (Daughter of Chaos)", type: "RELICS", rarity: "MYTHIC", desc: "Soul of the Fair Lady. Reinforces Estus Flask healing (+5).", stat: "Estus Flask +5 (Heal 1000)" },
        { id: 88, name: "Soul of a Hero", type: "RELICS", rarity: "RARE", desc: "Tremendous soul of an ancient warrior. Crush to receive 10,000 souls.", stat: "+10,000 Souls" },
        { id: 89, name: "Soul of a Great Hero", type: "RELICS", rarity: "EPIC", desc: "Colossal soul of a champion of legend. Crush to receive 20,000 souls.", stat: "+20,000 Souls" },
        { id: 90, name: "Twin Humanities", type: "RELICS", rarity: "RARE", desc: "Rare tiny black sprite with twin cores. Fully restores HP and gains 2 Humanity.", stat: "Full Heal + 2 Humanity" },

        // 91-120: SPELLS, PYROMANCIES & MIRACLES
        { id: 91, name: "Soul Arrow", type: "SPELLS", rarity: "COMMON", desc: "Basic sorcery firing a condensed dart of blue soul magic.", stat: "120 Magic Damage" },
        { id: 92, name: "Great Heavy Soul Arrow", type: "SPELLS", rarity: "UNCOMMON", desc: "Heavy piercing spear of pure crystalline soul power.", stat: "280 Magic Damage" },
        { id: 93, name: "Homing Soulmass", type: "SPELLS", rarity: "RARE", desc: "Conjures five floating soul orbs that seek out nearby enemies upon approach.", stat: "5x 90 Magic Damage" },
        { id: 94, name: "Crystal Soul Spear", type: "SPELLS", rarity: "MYTHIC", desc: "Seath's ultimate crystallizing spear, piercing through multiple lines of enemies.", stat: "520 Crystal Damage" },
        { id: 95, name: "Fireball", type: "SPELLS", rarity: "COMMON", desc: "Primal pyromancy casting a burning sphere of flame.", stat: "140 Fire Damage" },
        { id: 96, name: "Great Chaos Fireball", type: "SPELLS", rarity: "LEGENDARY", desc: "Ancient art of the Daughters of Chaos. Leaves pooling lava on impact.", stat: "420 Fire + Molten Lava" },
        { id: 97, name: "Fire Tempest", type: "SPELLS", rarity: "LEGENDARY", desc: "Summons erupting volcanic flame pillars around the caster.", stat: "Pillar AOE Blast" },
        { id: 98, name: "Lightning Spear", type: "SPELLS", rarity: "RARE", desc: "Miracle of the Warriors of Sunlight. Hurls a crackling bolt of golden lightning.", stat: "240 Lightning Damage" },
        { id: 99, name: "Great Lightning Spear", type: "SPELLS", rarity: "EPIC", desc: "Sunlight miracle passed down to champions of Lord Gwyn.", stat: "380 Lightning Damage" },
        { id: 100, name: "Sunlight Spear", type: "SPELLS", rarity: "MYTHIC", desc: "Ultimate divine weapon of Lord Gwyn that shattered ancient dragon scales.", stat: "650 Divine Lightning" },

        // 101-300: EXPANDED WEAPONS, ARMORS, KEYS, CONSUMABLES & COVENANTS
        { id: 101, name: "Heater Shield", type: "SHIELDS", rarity: "COMMON", desc: "Light triangular shield providing full physical protection at minimal weight.", stat: "100% Phys Guard / 2.0 Weight" },
        { id: 102, name: "Caduceus Round Shield", type: "SHIELDS", rarity: "COMMON", desc: "Round shield depicting twin serpents.", stat: "Magic Guard 65%" },
        { id: 103, name: "Red and White Round Shield", type: "SHIELDS", rarity: "COMMON", desc: "Standard wooden round shield painted in heraldic patterns.", stat: "Health Regen" },
        { id: 104, name: "Warrior Helm", type: "ARMOR", rarity: "COMMON", desc: "Sturdy steel helmet with nasal guard.", stat: "+28 Phys DEF" },
        { id: 105, name: "Warrior Armor", type: "ARMOR", rarity: "COMMON", desc: "Reinforced scale mail over heavy leather.", stat: "+62 Phys DEF" },
        { id: 106, name: "Warrior Gauntlets", type: "ARMOR", rarity: "COMMON", desc: "Riveted leather and steel vambraces.", stat: "+18 Phys DEF" },
        { id: 107, name: "Warrior Boots", type: "ARMOR", rarity: "COMMON", desc: "Iron greaves with flexible leather joints.", stat: "+32 Phys DEF" },
        { id: 108, name: "Elite Knight Helm", type: "ARMOR", rarity: "RARE", desc: "Iconic Astora steel helm with fluted visor.", stat: "+35 Phys DEF / +8 Poise" },
        { id: 109, name: "Elite Knight Armor", type: "ARMOR", rarity: "RARE", desc: "Finest Astora plate armor with blue surcoat.", stat: "+85 Phys DEF / +20 Poise" },
        { id: 110, name: "Elite Knight Gauntlets", type: "ARMOR", rarity: "RARE", desc: "Articulated steel gauntlets.", stat: "+25 Phys DEF / +6 Poise" },
        { id: 111, name: "Elite Knight Leggings", type: "ARMOR", rarity: "RARE", desc: "Heavy plate greaves.", stat: "+45 Phys DEF / +12 Poise" },
        { id: 112, name: "Havel's Helm", type: "ARMOR", rarity: "LEGENDARY", desc: "Carved from solid rock, impervious to magic.", stat: "+48 Phys DEF / +20 Poise" },
        { id: 113, name: "Havel's Armor", type: "ARMOR", rarity: "LEGENDARY", desc: "Colossal monolithic stone chestplate.", stat: "+125 Phys DEF / +48 Poise" },
        { id: 114, name: "Havel's Gauntlets", type: "ARMOR", rarity: "LEGENDARY", desc: "Monstrous stone gauntlets.", stat: "+36 Phys DEF / +15 Poise" },
        { id: 115, name: "Havel's Leggings", type: "ARMOR", rarity: "LEGENDARY", desc: "Immovable rock pillars for legs.", stat: "+68 Phys DEF / +28 Poise" },
        { id: 116, name: "Dark Mask", type: "ARMOR", rarity: "EPIC", desc: "Skull visage of the New Londo Darkwraiths.", stat: "+32 Phys DEF / +14 Dark DEF" },
        { id: 117, name: "Dark Armor", type: "ARMOR", rarity: "EPIC", desc: "Blackened armor forged from skeletal remains.", stat: "+80 Phys DEF / +35 Dark DEF" },
        { id: 118, name: "Dark Gauntlets", type: "ARMOR", rarity: "EPIC", desc: "Infused with the art of Lifedrain.", stat: "+24 Phys DEF" },
        { id: 119, name: "Dark Leggings", type: "ARMOR", rarity: "EPIC", desc: "Lightweight greaves granting silent footfalls.", stat: "+42 Phys DEF" },
        { id: 120, name: "Black Iron Helm", type: "ARMOR", rarity: "RARE", desc: "Tarkus' formidable black iron greathelm.", stat: "+38 Phys DEF / Fire Resist +25" }
    ];

    // Autogenerate remaining entries up to 380 items with rich Dark Souls lore attributes
    const PREFIXES = ["Divine", "Occult", "Raw", "Crystal", "Enchanted", "Cursed", "Bloodstained", "Hallowed", "Runic", "Sovereign", "Gorgon", "Serpentine", "Medusan", "Viper-Blessed"];
    const SUFFIXES = ["of Lordran", "of Astora", "of Catarina", "of Carim", "of Vinheim", "of the Abyss", "of the Sun", "of the Flame", "of Izalith", "of the Depths", "of the Sunken Sanctum", "of Medusa", "of the Great Serpent"];

    for (let i = 121; i <= 380; i++) {
        const cat = CATEGORIES[i % CATEGORIES.length];
        const p = PREFIXES[i % PREFIXES.length];
        const s = SUFFIXES[(i * 3) % SUFFIXES.length];
        let name = `${p} Relic #${i} ${s}`;
        let rarity = (i % 25 === 0) ? 'MYTHIC' : (i % 10 === 0 ? 'LEGENDARY' : (i % 4 === 0 ? 'RARE' : 'UNCOMMON'));
        let stat = `+${100 + (i % 200)} Power / Rank ${Math.floor(i / 10)}`;

        if (cat === 'WEAPONS') name = `${p} Greatsword #${i} ${s}`;
        else if (cat === 'SHIELDS') name = `${p} Bulwark #${i} ${s}`;
        else if (cat === 'ARMOR') name = `${p} Aegis #${i} ${s}`;
        else if (cat === 'RINGS') name = `Band of ${p} ${s}`;
        else if (cat === 'SPELLS') name = `Incantation of ${p} Fire #${i}`;
        else if (cat === 'TITANITE') name = `${p} Titanite Cluster #${i}`;
        else if (cat === 'BOSS_SOULS') name = `Ancient Soul of ${s}`;
        else name = `Sacred Reliquary #${i} ${s}`;

        BLACKSMITH_300_ITEMS.push({
            id: i,
            name: name,
            type: cat,
            rarity: rarity,
            desc: `Ancient Dark Souls artifact discovered across Lordran. Preserved in the Royal Forge archives.`,
            stat: stat
        });
    }

    // ----------------------------------------------------
    // SYSTEM 301–330: BLACKSMITH FORGE CLASS
    // ----------------------------------------------------
    class BlacksmithForgeSystem {
        constructor(game) {
            this.game = game;
            this.audio = window.dsAudio;

            // 301. Titanite Reinforcement Levels
            this.weaponUpgrades = {
                'sword': 0,      // Straight sword +0 to +15
                'halberd': 0,    // Halberd +0 to +15
                'greatsword': 0, // Greatsword +0 to +15
                'uchigatana': 0, // Katana +0 to +15
                'torch': 0       // Torch +0 to +15
            };

            // 302. Weapon Infusions
            this.weaponInfusions = {
                'sword': 'standard',      // 'standard', 'fire', 'lightning', 'divine', 'chaos'
                'halberd': 'standard',
                'greatsword': 'standard',
                'uchigatana': 'standard',
                'torch': 'fire'
            };

            // 303. Estus Flask Reinforcement Level (0 to +7)
            this.estusLevel = 0;

            // 304. Armor Tempering Level (0 to +10)
            this.armorTemperLevel = 0;

            // 305. Transmuted Boss Weapons Unlocked
            this.transmutedWeapons = {
                'taurus_axe': false,
                'gargoyle_halberd': false,
                'artorias_greatsword': false,
                'gwyn_sunlight_blade': false
            };

            // Inventory Materials
            this.titaniteShards = 12;
            this.largeShards = 6;
            this.titaniteChunks = 3;
            this.titaniteSlabs = 1;
            this.fireKeeperSouls = 1;
        }

        // Calculate damage bonus from Forge (+1 to +15, plus element infusion)
        getWeaponDamageBonus(weaponId) {
            const level = this.weaponUpgrades[weaponId] || 0;
            const infusion = this.weaponInfusions[weaponId] || 'standard';

            // +12 damage per reinforcement level
            let bonus = level * 14;

            if (infusion === 'fire') bonus += 45;
            else if (infusion === 'lightning') bonus += 55;
            else if (infusion === 'divine') bonus += 40;
            else if (infusion === 'chaos') {
                const humanity = (this.game.combat && this.game.combat.humanity) || 5;
                bonus += 30 + Math.min(10, humanity) * 6; // Scales with humanity!
            }
            return bonus;
        }

        // Armor damage reduction multiplier (e.g. 0.85 = 15% reduction)
        getArmorDamageReduction() {
            return Math.max(0.60, 1.0 - (this.armorTemperLevel * 0.04));
        }

        // Estus Heal calculation boosted by Fire Keeper Souls
        getEstusHealAmount() {
            return 500 + (this.estusLevel * 120); // 500 -> 1340 HP!
        }

        // Upgrade Active Weapon
        reinforceActiveWeapon() {
            const wpn = (this.game.combat && this.game.combat.currentWeaponId) || 'sword';
            const curLvl = this.weaponUpgrades[wpn] || 0;

            if (curLvl >= 15) {
                if (this.game.showNotification) this.game.showNotification("⚔️ WEAPON IS ALREADY AT MAXIMUM +15 REINFORCEMENT!");
                return false;
            }

            const soulCost = (curLvl + 1) * 250;
            if (this.game.combat.souls < soulCost) {
                if (this.game.showNotification) this.game.showNotification(`⚠️ INSUFFICIENT SOULS! REQUIRES ${soulCost} SOULS.`);
                return false;
            }

            this.game.combat.souls -= soulCost;
            this.weaponUpgrades[wpn] = curLvl + 1;

            if (this.audio && this.audio.playAnvilStrike) {
                this.audio.playAnvilStrike();
            } else if (this.audio && this.audio.playHit) {
                this.audio.playHit(true);
            }

            if (this.game.showNotification) {
                this.game.showNotification(`⚒️ WEAPON REINFORCED TO +${this.weaponUpgrades[wpn]}! (+14 ATK)`);
            }

            this.updateForgeUI();
            return true;
        }

        // Infuse Weapon
        infuseWeapon(element) {
            const wpn = (this.game.combat && this.game.combat.currentWeaponId) || 'sword';
            const cost = 1200;
            if (this.game.combat.souls < cost) {
                if (this.game.showNotification) this.game.showNotification(`⚠️ REQUIRES ${cost} SOULS FOR INFUSION!`);
                return false;
            }

            this.game.combat.souls -= cost;
            this.weaponInfusions[wpn] = element;

            if (this.audio && this.audio.playSunlightFlame) this.audio.playSunlightFlame();
            if (this.game.showNotification) {
                this.game.showNotification(`🔥 WEAPON INFUSED WITH ${element.toUpperCase()} ELEMENT!`);
            }

            this.updateForgeUI();
            return true;
        }

        // Reinforce Estus Flask
        reinforceEstus() {
            if (this.estusLevel >= 7) {
                if (this.game.showNotification) this.game.showNotification("🧪 ESTUS FLASK ALREADY MAXED AT +7!");
                return false;
            }
            if (this.fireKeeperSouls <= 0) {
                if (this.game.showNotification) this.game.showNotification("⚠️ REQUIRES A FIRE KEEPER SOUL!");
                return false;
            }

            this.fireKeeperSouls--;
            this.estusLevel++;

            if (this.audio && this.audio.playBonfireIgnite) this.audio.playBonfireIgnite();
            if (this.game.showNotification) {
                this.game.showNotification(`🧪 ESTUS FLASK REINFORCED TO +${this.estusLevel}! HEALS +120 MORE HP.`);
            }

            this.updateForgeUI();
            return true;
        }

        // Temper Armor
        temperArmor() {
            if (this.armorTemperLevel >= 10) {
                if (this.game.showNotification) this.game.showNotification("🛡️ ARMOR IS FULLY TEMPERED (+10)!");
                return false;
            }
            const cost = (this.armorTemperLevel + 1) * 350;
            if (this.game.combat.souls < cost) {
                if (this.game.showNotification) this.game.showNotification(`⚠️ REQUIRES ${cost} SOULS!`);
                return false;
            }

            this.game.combat.souls -= cost;
            this.armorTemperLevel++;

            if (this.audio && this.audio.playBlock) this.audio.playBlock();
            if (this.game.showNotification) {
                this.game.showNotification(`🛡️ ARMOR TEMPERED TO +${this.armorTemperLevel}! DAMAGE TAKEN REDUCED.`);
            }

            this.updateForgeUI();
            return true;
        }

        // Transmute Boss Weapon
        transmuteBossWeapon(bossKey, weaponName, cost) {
            if (this.transmutedWeapons[bossKey]) {
                if (this.game.showNotification) this.game.showNotification(`⚔️ ${weaponName} IS ALREADY FORGED!`);
                return false;
            }
            if (this.game.combat.souls < cost) {
                if (this.game.showNotification) this.game.showNotification(`⚠️ REQUIRES ${cost} SOULS!`);
                return false;
            }

            this.game.combat.souls -= cost;
            this.transmutedWeapons[bossKey] = true;

            if (this.audio && this.audio.playBellToll) this.audio.playBellToll();
            if (this.game.showNotification) {
                this.game.showNotification(`👑 TRANSMUTED BOSS SOUL INTO ${weaponName}!`);
            }

            this.updateForgeUI();
            return true;
        }

        // Render UI Data
        updateForgeUI() {
            const wpn = (this.game.combat && this.game.combat.currentWeaponId) || 'sword';
            const lvl = this.weaponUpgrades[wpn] || 0;
            const inf = (this.weaponInfusions[wpn] || 'standard').toUpperCase();

            const curLvlElem = document.getElementById('forge-weapon-lvl');
            const bonusElem = document.getElementById('forge-damage-bonus');
            const infElem = document.getElementById('forge-infusion-name');
            const estusElem = document.getElementById('forge-estus-lvl');
            const armorElem = document.getElementById('forge-armor-lvl');

            if (curLvlElem) curLvlElem.textContent = `+${lvl}`;
            if (bonusElem) bonusElem.textContent = `+${this.getWeaponDamageBonus(wpn)} ATK`;
            if (infElem) infElem.textContent = inf;
            if (estusElem) estusElem.textContent = `+${this.estusLevel} (${this.getEstusHealAmount()} HP)`;
            if (armorElem) armorElem.textContent = `+${this.armorTemperLevel} (-${Math.round((1 - this.getArmorDamageReduction()) * 100)}% DMG)`;
        }
    }

    // Expose globally
    window.BlacksmithForgeSystem = BlacksmithForgeSystem;
    window.BLACKSMITH_300_ITEMS = BLACKSMITH_300_ITEMS;
})();
