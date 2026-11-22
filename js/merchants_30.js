// ====================================================
// DARK SOULS & SOULSBORNE: 30 ICONIC MERCHANTS COMPENDIUM
// 30 Unique 3D NPC Merchants across DS1, DS2, DS3, BB, Sekiro, Elden Ring & Sunken Liturgy
// Features bespoke 3D Procedural Sculpting, Dialogues, World Positions & Specialty Wares
// ====================================================

(function() {
    'use strict';

    window.DARK_SOULS_MERCHANTS_30 = [
        {
            id: 'merchant_undead_male',
            name: 'Undead Merchant (Male)',
            title: 'Lordran Undead Burg Peddler',
            game: 'DS1',
            zone: 'Undead Burg Courtyard',
            pos: [-8.5, 0, 3.5],
            rot: Math.PI / 4,
            icon: '🧙‍♂️',
            modelType: 'peddler',
            outfitColor: 0x5a4230,
            accentColor: 0x7c241c,
            hatStyle: 'pilgrim_hat',
            prop: 'weapons_crate',
            lightColor: 0xffa834,
            quote: 'Heh heh heh... Well, what have we here? An Undead with his wits intact! Steel and miracles are the only currency that buys tomorrow in Lordran.',
            wares: [
                { id: 'zweihander', name: 'Zweihander', icon: '🗡️', type: 'weapon', cost: 2500, desc: 'Colossal Ultra Greatsword • Extreme reach, crushes poise', stat: 'DMG: 260 / 490 • REACH: 4.4m' },
                { id: 'uchigatana', name: 'Uchigatana', icon: '🎌', type: 'weapon', cost: 3500, desc: 'Eastern Katana • Lacerating rapid slashes (1.35x speed)', stat: 'DMG: 175 / 320 • SPEED: 1.35x' },
                { id: 'torch_pitch', name: 'Flask of Torch Pitch', icon: '🪔', type: 'consumable', cost: 100, desc: 'Immediately refills Handheld Torch fuel to 100%', stat: 'TORCH REFUEL' },
                { id: 'charcoal_resin', name: 'Charcoal Pine Resin', icon: '🔥', type: 'consumable', cost: 500, desc: '+60 Fire Damage buff for right-hand weapon (45s)', stat: 'FLAME BUFF' },
                { id: 'homeward_bone', name: 'Homeward Bone', icon: '🦴', type: 'consumable', cost: 300, desc: 'Return safely to the Bonfire from anywhere in Lordran', stat: 'WARP TO BONFIRE' }
            ]
        },
        {
            id: 'merchant_undead_female',
            name: 'Undead Merchant (Female)',
            title: 'Lower Burg Aqueduct Herbalist',
            game: 'DS1',
            zone: 'Aqueduct Grate',
            pos: [-14.5, 0, 16.5],
            rot: -Math.PI / 6,
            icon: '🧕',
            modelType: 'aqueduct_crone',
            outfitColor: 0x2e3b2a,
            accentColor: 0x5c4228,
            hatStyle: 'moss_cowl',
            prop: 'iron_grate_bars',
            lightColor: 0x66ff88,
            quote: 'Ve-hee, ve-hee! Back again, dearie? Watch your step down there, the rats carry the bloat and the butcher has a sharp cleaver!',
            wares: [
                { id: 'bloodbite_ring', name: 'Bloodbite Ring', icon: '💍', type: 'ring', cost: 1800, desc: '+400% Bleed Resistance against lacerating fangs', stat: 'RESIST: BLEED x4' },
                { id: 'poisonbite_ring', name: 'Poisonbite Ring', icon: '💍', type: 'ring', cost: 1800, desc: '+400% Poison Resistance in swamps and mires', stat: 'RESIST: POISON x4' },
                { id: 'divine_blessing', name: 'Divine Blessing', icon: '🛡️', type: 'consumable', cost: 800, desc: 'Holy water of Gwynevere • Instantly restores 100% HP & Stamina', stat: 'FULL RESTORE' },
                { id: 'torch_pitch', name: 'Flask of Torch Pitch', icon: '🪔', type: 'consumable', cost: 100, desc: 'Essential pitch fuel for torchlight exploration', stat: 'TORCH REFUEL' }
            ]
        },
        {
            id: 'merchant_domhnall',
            name: 'Domhnall of Zena',
            title: 'Exotic Armor & Crystal Merchant',
            game: 'DS1',
            zone: 'Courtyard Aqueduct',
            pos: [-12.5, 0, 8.5],
            rot: Math.PI / 3,
            icon: '👑',
            modelType: 'horned_nobleman',
            outfitColor: 0x8a6a24,
            accentColor: 0x3388bb,
            hatStyle: 'horned_helm',
            prop: 'crystal_case',
            lightColor: 0x00e5ff,
            quote: 'Aye, siwmae! And good day to you! I am Domhnall of Zena. I trade in crystalline relics, royal suits of arms, and forgotten wisdom from far-off lands.',
            wares: [
                { id: 'moonlight', name: 'Moonlight Greatsword', icon: '✨', type: 'weapon', cost: 10000, desc: "Seath's Luminous Relic • Fires crescent moon magical beam", stat: 'DMG: 230 / 440 • BEAM: 260' },
                { id: 'dark_moon_greatsword', name: 'Dark Moon Greatsword', icon: '🌙', type: 'weapon', cost: 12000, desc: "Ranni's Moonlight Blade • Freezing waves of moonlight rime", stat: 'DMG: 280 / 520 • POISE: 2.4x' },
                { id: 'ring_favor', name: 'Ring of Favor & Protection', icon: '💍', type: 'ring', cost: 6000, desc: '+20% Maximum HP & +20% Maximum Stamina', stat: 'FAVOR OF GWYNEVERE' },
                { id: 'estus_shard', name: 'Estus Flask Shard', icon: '🧪', type: 'consumable', cost: 1500, desc: 'Permanently increases Max Estus Flask capacity (+1)', stat: 'PERMANENT UPGRADE' }
            ]
        },
        {
            id: 'merchant_andre',
            name: 'Blacksmith Andre of Astora',
            title: 'Master Weaponsmith of the Parish',
            game: 'DS1',
            zone: 'Parish Smithy Courtyard',
            pos: [11.5, 0, 6.0],
            rot: -Math.PI / 3,
            icon: '⚒️',
            modelType: 'blacksmith',
            outfitColor: 0x3e2c1e,
            accentColor: 0x8b3a1a,
            hatStyle: 'silver_beard',
            prop: 'anvil_hammer',
            lightColor: 0xff6622,
            quote: 'Prithee, be careful. I don’t want to see m’ work go to waste! Keep your blade sharp and your wits sharper, and you might just survive Lordran.',
            wares: [
                { id: 'halberd', name: 'Black Knight Halberd', icon: '🔱', type: 'weapon', cost: 5000, desc: 'Lordran Polearm • Colossal 4.8m attack reach strikes from safety', stat: 'DMG: 210 / 390 • REACH: 4.8m' },
                { id: 'dragontooth', name: 'Dragon Tooth', icon: '🦴', type: 'weapon', cost: 6500, desc: 'Everlasting Dragon Tooth • Ground shockwaves shatter poise', stat: 'DMG: 310 / 580 • POISE: 3.4x' },
                { id: 'estus_shard', name: 'Estus Flask Shard', icon: '🧪', type: 'consumable', cost: 1500, desc: 'Permanently reinforces Estus carrying capacity (+1)', stat: 'PERMANENT UPGRADE' },
                { id: 'charcoal_resin', name: 'Charcoal Pine Resin', icon: '🔥', type: 'consumable', cost: 500, desc: 'Weaponsmith resin coating for searing fire strikes', stat: 'FLAME BUFF' }
            ]
        },
        {
            id: 'merchant_giant_blacksmith',
            name: 'Giant Blacksmith',
            title: 'Gentle Artisan of Anor Londo',
            game: 'DS1',
            zone: 'High Ramparts Forge',
            pos: [18.0, 6.0, 45.0],
            rot: -Math.PI / 2,
            icon: '🗿',
            modelType: 'colossal_giant',
            outfitColor: 0x4a3b2c,
            accentColor: 0x224488,
            hatStyle: 'leather_hood',
            prop: 'colossal_anvil',
            lightColor: 0x66aaff,
            quote: 'Talk, ’tis no good. But, work, good! Strong weapon, smash enemies! Make shiny, make sharp!',
            wares: [
                { id: 'dragontooth', name: 'Dragon Tooth', icon: '🦴', type: 'weapon', cost: 6500, desc: 'Forged from the petrified fang of an ancient everlasting dragon', stat: 'DMG: 310 / 580 • POISE: 3.4x' },
                { id: 'zweihander', name: 'Giant-Forged Zweihander', icon: '🗡️', type: 'weapon', cost: 4000, desc: 'Reinforced ultra greatsword with massive knockdown force', stat: 'DMG: 290 / 530' },
                { id: 'divine_blessing', name: 'Divine Blessing', icon: '🛡️', type: 'consumable', cost: 800, desc: 'Holy holy water of the giant smithy', stat: 'FULL RESTORE' }
            ]
        },
        {
            id: 'merchant_shiva',
            name: 'Shiva of the East',
            title: 'Captain of the Forest Hunters',
            game: 'DS1',
            zone: 'Eastern Sentry Alcove',
            pos: [-15.0, 0, 25.0],
            rot: Math.PI / 6,
            icon: '🥷',
            modelType: 'samurai',
            outfitColor: 0x7c1a1a,
            accentColor: 0xd4af37,
            hatStyle: 'kabuto_crest',
            prop: 'murakumo_sheath',
            lightColor: 0xff3333,
            quote: 'A collector of rare blades, am I. If you seek exquisite Eastern steel that tastes of crimson blood, you have found the right merchant.',
            wares: [
                { id: 'uchigatana', name: 'Eastern Uchigatana', icon: '🎌', type: 'weapon', cost: 3500, desc: 'Razor-folded blade of the eastern clans', stat: 'DMG: 175 / 320' },
                { id: 'rivers_of_blood', name: 'Rivers of Blood', icon: '🩸', type: 'weapon', cost: 8000, desc: 'Cursed red katana with blood-flame slashes', stat: 'DMG: 215 / 395 • BLEED' },
                { id: 'charcoal_resin', name: 'Charcoal Pine Resin', icon: '🔥', type: 'consumable', cost: 500, desc: 'Imbue weapons with blazing fire resin', stat: 'FLAME BUFF' }
            ]
        },
        {
            id: 'merchant_rickert',
            name: 'Rickert of Vinheim',
            title: 'Imprisoned Magic Blacksmith',
            game: 'DS1',
            zone: 'Flooded Crypts Cell',
            pos: [-22.0, -4.92, 45.0],
            rot: Math.PI / 4,
            icon: '🧙‍♂️',
            modelType: 'cell_sorcerer',
            outfitColor: 0x1b2838,
            accentColor: 0x33ffee,
            hatStyle: 'cell_bars',
            prop: 'magic_catalyst',
            lightColor: 0x00ffee,
            quote: 'Leave me be, will you? I am quite content in this cell. The water is cool, and the ghosts outside make for peaceful company.',
            wares: [
                { id: 'moonlight', name: 'Moonlight Greatsword', icon: '✨', type: 'weapon', cost: 10000, desc: 'Pure magical sorcery wave sword', stat: 'BEAM: 260 MAGIC' },
                { id: 'divine_blessing', name: 'Divine Blessing', icon: '🛡️', type: 'consumable', cost: 800, desc: 'Restores all magical poise and stamina', stat: 'FULL RESTORE' },
                { id: 'homeward_bone', name: 'Homeward Bone', icon: '🦴', type: 'consumable', cost: 300, desc: 'Blink away from the dark waters', stat: 'WARP' }
            ]
        },
        {
            id: 'merchant_vamos',
            name: 'Blacksmith Vamos',
            title: 'Skeletal Fire Craftsman',
            game: 'DS1',
            zone: 'Catacombs Sarcophagus',
            pos: [-26.0, -5.5, 60.0],
            rot: 0,
            icon: '💀',
            modelType: 'skeleton_smith',
            outfitColor: 0x221a14,
            accentColor: 0xff4400,
            hatStyle: 'bone_beard',
            prop: 'fire_pickaxe',
            lightColor: 0xff5500,
            quote: 'You spoil my focus! Be quick about your business or return to dust where you belong! Fire and chaos are forged in bone.',
            wares: [
                { id: 'charcoal_resin', name: 'Charcoal Pine Resin (x5)', icon: '🔥', type: 'consumable', cost: 1800, desc: 'Fiery embers harvested from Vamos’s personal kiln', stat: 'FLAME BUFF x5' },
                { id: 'torch_pitch', name: 'Flask of Torch Pitch (x3)', icon: '🪔', type: 'consumable', cost: 250, desc: 'Purified catacomb pitch fuel', stat: 'TORCH REFUEL' },
                { id: 'dragontooth', name: 'Chaos Dragon Tooth', icon: '🦴', type: 'weapon', cost: 7500, desc: 'Heavy bone hammer infused with volcanic chaos', stat: 'DMG: 340 / 610' }
            ]
        },
        {
            id: 'merchant_laurentius',
            name: 'Laurentius of the Great Swamp',
            title: 'Pyromancy Mentor',
            game: 'DS1',
            zone: 'Sanctuary Firepit',
            pos: [-6.0, 0, 12.0],
            rot: -Math.PI / 4,
            icon: '🔥',
            modelType: 'pyromancer',
            outfitColor: 0x4a3622,
            accentColor: 0xd9531e,
            hatStyle: 'swamp_hood',
            prop: 'pyro_flame',
            lightColor: 0xff6600,
            quote: 'A pyromancer’s flame is a part of his very being. The flame is fierce, but warm. Treat it with respect, my friend, and it will never fail you.',
            wares: [
                { id: 'charcoal_resin', name: 'Great Swamp Charcoal Resin', icon: '🔥', type: 'consumable', cost: 450, desc: 'Secret Great Swamp tree sap that ignites on contact', stat: '+75 FIRE DMG' },
                { id: 'torch_pitch', name: 'Pitch Torch Refill', icon: '🪔', type: 'consumable', cost: 90, desc: 'Pure refined oil for keeping hollows at bay', stat: 'TORCH FUEL' },
                { id: 'estus_shard', name: 'Estus Flask Shard', icon: '🧪', type: 'consumable', cost: 1500, desc: 'Warm golden shard found in the Great Swamp', stat: 'ESTUS UPGRADE' }
            ]
        },
        {
            id: 'merchant_griggs',
            name: 'Griggs of Vinheim',
            title: 'Dragon School Academy Scholar',
            game: 'DS1',
            zone: 'Courtyard Library Corner',
            pos: [-9.5, 0, 16.0],
            rot: Math.PI / 2,
            icon: '📘',
            modelType: 'academy_scholar',
            outfitColor: 0x1d2c4d,
            accentColor: 0x88ccee,
            hatStyle: 'scholar_biretta',
            prop: 'grimoire_pedestal',
            lightColor: 0x44aaff,
            quote: 'Master Logan is the greatest sorcerer in all of Vinheim! If only I could find him in these forsaken castles... Take these spells for your journey.',
            wares: [
                { id: 'moonlight', name: 'Moonlight Greatsword', icon: '✨', type: 'weapon', cost: 10000, desc: 'The crystalline dream of the Dragon School', stat: 'DMG: 230 / 440' },
                { id: 'homeward_bone', name: 'Homeward Bone', icon: '🦴', type: 'consumable', cost: 300, desc: 'Spiritual warp back to sanctuary', stat: 'WARP' },
                { id: 'divine_blessing', name: 'Divine Blessing', icon: '🛡️', type: 'consumable', cost: 800, desc: 'Purified holy water', stat: 'FULL RESTORE' }
            ]
        },
        {
            id: 'merchant_big_hat_logan',
            name: 'Big Hat Logan',
            title: 'Grand Sorcerer of the Dragon School',
            game: 'DS1',
            zone: 'High Ramparts Observatory',
            pos: [16.0, 6.0, 35.0],
            rot: -Math.PI / 4,
            icon: '🎩',
            modelType: 'big_hat',
            outfitColor: 0x162238,
            accentColor: 0x00e5ff,
            hatStyle: 'massive_disc_hat',
            prop: 'crystal_staff',
            lightColor: 0x00e5ff,
            quote: 'Do you not see this hat? It covers my ears and blocks out the mindless babble of mortals so I can hear the crystal song of the stars.',
            wares: [
                { id: 'dark_moon_greatsword', name: 'Dark Moon Greatsword', icon: '🌙', type: 'weapon', cost: 12000, desc: 'Ranni’s celestial frost blade inscribed with crystal glintstones', stat: 'FREEZING RIME' },
                { id: 'moonlight', name: 'Moonlight Greatsword', icon: '✨', type: 'weapon', cost: 10000, desc: 'Direct manifestation of Seath’s sorcerous breath', stat: 'BEAM: 260' },
                { id: 'estus_shard', name: 'Estus Flask Shard', icon: '🧪', type: 'consumable', cost: 1500, desc: 'Reinforce your flask before venturing further', stat: 'ESTUS +1' }
            ]
        },
        {
            id: 'merchant_quelana',
            name: 'Quelana of Izalith',
            title: 'Mother of Pyromancy',
            game: 'DS1',
            zone: 'Blighttown Swamp Rock',
            pos: [-18.0, -4.92, 90.0],
            rot: Math.PI / 3,
            icon: '🥀',
            modelType: 'witch_floating',
            outfitColor: 0x111111,
            accentColor: 0xff7700,
            hatStyle: 'gold_hemmed_hood',
            prop: 'chaos_orb',
            lightColor: 0xff8800,
            quote: 'My mother was engulfed by the Flame of Chaos, and my sisters were mutated into horrors. Fear the fire, Undead, even as you wield it.',
            wares: [
                { id: 'charcoal_resin', name: 'Chaos Pine Resin', icon: '🔥', type: 'consumable', cost: 600, desc: 'Extract of primal chaos fire', stat: '+85 FIRE DMG' },
                { id: 'divine_blessing', name: 'Divine Blessing', icon: '🛡️', type: 'consumable', cost: 800, desc: 'Izalith healing draught', stat: 'FULL RESTORE' },
                { id: 'estus_shard', name: 'Estus Flask Shard', icon: '🧪', type: 'consumable', cost: 1500, desc: 'Shard salvaged from the Bed of Chaos', stat: 'ESTUS +1' }
            ]
        },
        {
            id: 'merchant_oswald',
            name: 'Oswald of Carim',
            title: 'Pardoner of the Goddess Velka',
            game: 'DS1',
            zone: 'Belfry Parapet Overlook',
            pos: [14.0, 6.0, 65.0],
            rot: 0,
            icon: '⚖️',
            modelType: 'pardoner',
            outfitColor: 0x0a0a0c,
            accentColor: 0xe0e0e0,
            hatStyle: 'inquisitor_cowl',
            prop: 'outstretched_arms',
            lightColor: 0xd8d8d8,
            quote: 'It is only human to commit a sin! Keh-heh-heh-heh! Forgiveness is yours, for a modest donation of souls to the Goddess of Sin.',
            wares: [
                { id: 'homeward_bone', name: 'Homeward Bone (x5)', icon: '🦴', type: 'consumable', cost: 1200, desc: 'Five sacred bones of penitence', stat: 'WARP x5' },
                { id: 'divine_blessing', name: 'Divine Absolution', icon: '🛡️', type: 'consumable', cost: 800, desc: 'Cleanses all sins, poisons, and curses', stat: 'FULL PURIFICATION' },
                { id: 'bloodbite_ring', name: 'Bloodbite Ring of Velka', icon: '💍', type: 'ring', cost: 2000, desc: 'Repels the fangs of bloodthirsty phantoms', stat: 'BLEED RESIST' }
            ]
        },
        {
            id: 'merchant_patches',
            name: 'Trusty Patches',
            title: 'The Hyena & Friendly Peddler',
            game: 'DS1',
            zone: 'Viaduct Approach Ledge',
            pos: [4.5, 0, 24.0],
            rot: -Math.PI / 2,
            icon: '😏',
            modelType: 'squatting_rogue',
            outfitColor: 0x42382e,
            accentColor: 0x8a7258,
            hatStyle: 'bald_shining',
            prop: 'eagle_shield',
            lightColor: 0xddbb66,
            quote: 'Well now, don’t look at me like that! I’m Trusty Patches, honest as the day is long. Say, see that glittering treasure down there near the cliff?',
            wares: [
                { id: 'halberd', name: 'Winged Spear', icon: '🔱', type: 'weapon', cost: 4500, desc: 'Trusty weapon with long piercing reach', stat: 'DMG: 200 / 370' },
                { id: 'homeward_bone', name: 'Homeward Bone', icon: '🦴', type: 'consumable', cost: 250, desc: 'Discount bone... don’t worry, it works!', stat: 'WARP' },
                { id: 'divine_blessing', name: 'Stolen Divine Blessing', icon: '🛡️', type: 'consumable', cost: 650, desc: 'Special discount blessing, freshly liberated', stat: 'FULL RESTORE' }
            ]
        },
        {
            id: 'merchant_crestfallen',
            name: 'Crestfallen Merchant',
            title: 'Brooding Balder Soldier',
            game: 'DS1',
            zone: 'Fortress Spire Alcove',
            pos: [22.0, 6.0, 85.0],
            rot: -Math.PI / 3,
            icon: '🛡️',
            modelType: 'brooding_knight',
            outfitColor: 0x3a3d42,
            accentColor: 0x7a808a,
            hatStyle: 'balder_helm',
            prop: 'iron_chest',
            lightColor: 0x8899aa,
            quote: 'What do you want? Don’t you see I’m waiting for the fortress to collapse? Go on, buy my gear if you think it’ll save you.',
            wares: [
                { id: 'zweihander', name: 'Balder Ultra Greatsword', icon: '🗡️', type: 'weapon', cost: 2800, desc: 'Heavily scarred knight blade', stat: 'DMG: 270 / 500' },
                { id: 'charcoal_resin', name: 'Charcoal Pine Resin', icon: '🔥', type: 'consumable', cost: 500, desc: 'Flame coating for weapons', stat: 'FIRE BUFF' },
                { id: 'torch_pitch', name: 'Flask of Torch Pitch', icon: '🪔', type: 'consumable', cost: 100, desc: 'Pitch fuel for exploring dark halls', stat: 'TORCH FUEL' }
            ]
        },
        {
            id: 'merchant_ingward',
            name: 'Ingward, Crimson Sealer',
            title: 'Guardian of the New Londo Floodgates',
            game: 'DS1',
            zone: 'New Londo Floodgate Roof',
            pos: [-28.0, -6.5, 75.0],
            rot: Math.PI / 4,
            icon: '🩸',
            modelType: 'crimson_sealer',
            outfitColor: 0x881818,
            accentColor: 0x331010,
            hatStyle: 'bronze_beak_mask',
            prop: 'sealer_staff',
            lightColor: 0xcc2222,
            quote: 'We flooded New Londo to drown the Darkwraiths and contain the Four Kings. If you possess the Key, the seal will be released.',
            wares: [
                { id: 'divine_blessing', name: 'Sealer’s Holy Water', icon: '🛡️', type: 'consumable', cost: 800, desc: 'Purified water that lifts all curses', stat: 'CURSE REMEDY' },
                { id: 'homeward_bone', name: 'Homeward Bone', icon: '🦴', type: 'consumable', cost: 300, desc: 'Return safely before the ghosts swarm', stat: 'WARP' },
                { id: 'bloodbite_ring', name: 'Ring of the Crimson Seal', icon: '💍', type: 'ring', cost: 2500, desc: 'Shields flesh from blood loss', stat: 'BLEED RESIST' }
            ]
        },
        {
            id: 'merchant_chloanne',
            name: 'Stone Trader Chloanne',
            title: 'Miner & Mineral Geologist',
            game: 'DS2',
            zone: 'Majula Seaside Terrace',
            pos: [8.5, 0, -4.5],
            rot: Math.PI / 6,
            icon: '💎',
            modelType: 'ore_miner',
            outfitColor: 0x6e5238,
            accentColor: 0x33aacc,
            hatStyle: 'straw_visor',
            prop: 'ore_baskets',
            lightColor: 0x44ddff,
            quote: 'I collect pretty rocks and strange titanite from the volcanic digs. If you have the souls, I’ve got stones that will make your blade sing!',
            wares: [
                { id: 'estus_shard', name: 'Titanite Glazed Shard', icon: '🧪', type: 'consumable', cost: 1500, desc: 'Rare mineral shard for flask capacity', stat: 'ESTUS +1' },
                { id: 'charcoal_resin', name: 'Volcanic Ore Resin', icon: '🔥', type: 'consumable', cost: 500, desc: 'Raw igneous stone dust', stat: '+60 FIRE' },
                { id: 'homeward_bone', name: 'Homeward Bone', icon: '🦴', type: 'consumable', cost: 300, desc: 'Carved from Majula limestone', stat: 'WARP' }
            ]
        },
        {
            id: 'merchant_shalquoir',
            name: 'Sweet Shalquoir',
            title: 'Enchanted Talking Feline',
            game: 'DS2',
            zone: 'Majula Cat Pillow Shrine',
            pos: [14.5, 0, -8.5],
            rot: -Math.PI / 3,
            icon: '🐱',
            modelType: 'lounging_cat',
            outfitColor: 0x223388,
            accentColor: 0x00ffcc,
            hatStyle: 'cat_ears',
            prop: 'velvet_cushion',
            lightColor: 0x00ffaa,
            quote: 'Purrrr... Welcome to Drangleic, little hollow! Don’t look so forlorn. What will you do when your memories fade away, like salt in the sea?',
            wares: [
                { id: 'ring_favor', name: 'Silvercat Ring of Grace', icon: '💍', type: 'ring', cost: 4500, desc: 'Completely eliminates all fall damage', stat: 'NO FALL DAMAGE' },
                { id: 'divine_blessing', name: 'Cream of Divine Nectar', icon: '🛡️', type: 'consumable', cost: 900, desc: 'Shalquoir’s favorite vintage potion', stat: 'FULL RESTORE' },
                { id: 'homeward_bone', name: 'Cat Whisker Bone', icon: '🦴', type: 'consumable', cost: 300, desc: 'Nine lives in a bone', stat: 'WARP' }
            ]
        },
        {
            id: 'merchant_gilligan',
            name: 'Laddersmith Gilligan',
            title: 'Carpenter of Vertiginous Descents',
            game: 'DS2',
            zone: 'Pit Descent Platform',
            pos: [-14.5, 0, -12.0],
            rot: Math.PI / 4,
            icon: '🪜',
            modelType: 'carpenter',
            outfitColor: 0x483a2a,
            accentColor: 0x82654a,
            hatStyle: 'scruffy_cap',
            prop: 'miniature_ladders',
            lightColor: 0xccaa66,
            quote: 'Need to get down into a terrifying black hole? Ladders are my specialty! It’ll cost you a pretty penny, but you can’t put a price on your spine.',
            wares: [
                { id: 'torch_pitch', name: 'Laddersmith Pitch Canister', icon: '🪔', type: 'consumable', cost: 100, desc: 'Essential fuel for deep pit descents', stat: 'TORCH FUEL' },
                { id: 'homeward_bone', name: 'Homeward Bone', icon: '🦴', type: 'consumable', cost: 300, desc: 'In case the ladder breaks!', stat: 'WARP' },
                { id: 'halberd', name: 'Scaffold Polearm', icon: '🔱', type: 'weapon', cost: 4800, desc: 'Long reach weapon made from ladder rungs', stat: 'DMG: 205 / 380' }
            ]
        },
        {
            id: 'merchant_maughlin',
            name: 'Maughlin the Armorer',
            title: 'Royal Outfitter of Volgen',
            game: 'DS2',
            zone: 'Majula Armor Atelier',
            pos: [6.0, 0, 10.0],
            rot: -Math.PI / 6,
            icon: '🦺',
            modelType: 'armorer',
            outfitColor: 0x1f3a52,
            accentColor: 0xd4af37,
            hatStyle: 'volgen_beret',
            prop: 'armor_stand',
            lightColor: 0xffd700,
            quote: 'I came from Volgen to make a fortune. With every suit of armor you buy, I feel richer and more important! Take a look at my finest wares!',
            wares: [
                { id: 'zweihander', name: 'Volgen Heavy Greatsword', icon: '🗡️', type: 'weapon', cost: 3000, desc: 'Gilded greatsword of the southern merchant guild', stat: 'DMG: 265 / 495' },
                { id: 'estus_shard', name: 'Reinforced Armor Shard', icon: '🧪', type: 'consumable', cost: 1500, desc: 'Hardened plate shard for flask expansion', stat: 'ESTUS +1' },
                { id: 'divine_blessing', name: 'Noble Volgen Wine', icon: '🛡️', type: 'consumable', cost: 850, desc: 'Vintage wine with healing properties', stat: 'FULL RESTORE' }
            ]
        },
        {
            id: 'merchant_shrine_handmaid',
            name: 'Shrine Handmaid',
            title: 'Ashen Keeper of the Firelink Coals',
            game: 'DS3',
            zone: 'Firelink Ashen Arch',
            pos: [-4.0, 0, -6.5],
            rot: Math.PI / 3,
            icon: '👵',
            modelType: 'ash_crone',
            outfitColor: 0x222224,
            accentColor: 0xd0d0d8,
            hatStyle: 'ashen_cowl',
            prop: 'burning_bowl',
            lightColor: 0xff4422,
            quote: 'Ashen One... Bring me ashes of the dead, and I shall furnish you with whatever your covetous heart desires. The bell tolls for thee.',
            wares: [
                { id: 'estus_shard', name: 'Ashen Estus Shard', icon: '🧪', type: 'consumable', cost: 1500, desc: 'Found among the graves of champions', stat: 'ESTUS +1' },
                { id: 'homeward_bone', name: 'Coiled Sword Fragment', icon: '🦴', type: 'consumable', cost: 300, desc: 'Returns user to firelink flame', stat: 'INFINITE WARP' },
                { id: 'divine_blessing', name: 'Divine Blessing', icon: '🛡️', type: 'consumable', cost: 800, desc: 'Water of the holy shrine', stat: 'FULL RESTORE' },
                { id: 'charcoal_resin', name: 'Charcoal Pine Resin', icon: '🔥', type: 'consumable', cost: 500, desc: 'Cinder flame buff for weapons', stat: 'FLAME BUFF' }
            ]
        },
        {
            id: 'merchant_greirat',
            name: 'Greirat of Undead Settlement',
            title: 'Master Scavenger & Thief',
            game: 'DS3',
            zone: 'Undead Settlement Gateway',
            pos: [-8.0, 0, -10.0],
            rot: Math.PI / 4,
            icon: '🎭',
            modelType: 'thief_thrall',
            outfitColor: 0x3a3028,
            accentColor: 0x5a5048,
            hatStyle: 'thrall_hood',
            prop: 'scavenger_sack',
            lightColor: 0x99aacc,
            quote: 'I’m a thief, nothing more. But you set me free, so I’ll steal for you until the bell stops tolling. I’ve scavenged some wondrous weapons!',
            wares: [
                { id: 'uchigatana', name: 'Scavenged Uchigatana', icon: '🎌', type: 'weapon', cost: 3200, desc: 'Looted from the master outside the shrine', stat: 'DMG: 175 / 320' },
                { id: 'halberd', name: 'Lucerne Halberd', icon: '🔱', type: 'weapon', cost: 4600, desc: 'Stolen from the high wall ramparts', stat: 'DMG: 205 / 385' },
                { id: 'torch_pitch', name: 'Flask of Torch Pitch', icon: '🪔', type: 'consumable', cost: 80, desc: 'Thief’s discount pitch oil', stat: 'TORCH FUEL' }
            ]
        },
        {
            id: 'merchant_karla',
            name: 'Karla the Dark Sorceress',
            title: 'Child of the Spurned Abyss',
            game: 'DS3',
            zone: 'Catacombs Sunken Nook',
            pos: [-16.0, -4.92, 130.0],
            rot: -Math.PI / 4,
            icon: '🧙‍♀️',
            modelType: 'dark_witch',
            outfitColor: 0x080608,
            accentColor: 0x662288,
            hatStyle: 'pointed_witch_hat',
            prop: 'abyssal_grimoire',
            lightColor: 0xa78bfa,
            quote: 'Ah, a creature of light... Do you not fear the black fire of the Abyss? I teach the forbidden sorceries of human longing and darkness.',
            wares: [
                { id: 'dark_moon_greatsword', name: 'Darkdrift Blade', icon: '🌙', type: 'weapon', cost: 11000, desc: 'Invisible abyssal edge that pierces through shields', stat: 'SHIELD PIERCE' },
                { id: 'divine_blessing', name: 'Dark Nectar of the Spurned', icon: '🛡️', type: 'consumable', cost: 800, desc: 'Forbidden draught that heals mind and flesh', stat: 'FULL RESTORE' },
                { id: 'homeward_bone', name: 'Homeward Bone', icon: '🦴', type: 'consumable', cost: 300, desc: 'Blink away from the dark abyss', stat: 'WARP' }
            ]
        },
        {
            id: 'merchant_yuria',
            name: 'Yuria of Londor',
            title: 'Sable Church Ordained Priestess',
            game: 'DS3',
            zone: 'Firelink Shadowed Ledge',
            pos: [10.5, 0, -6.0],
            rot: -Math.PI / 3,
            icon: '🕊️',
            modelType: 'sable_priestess',
            outfitColor: 0x141416,
            accentColor: 0x222226,
            hatStyle: 'beak_mask_veil',
            prop: 'darkdrift_katana',
            lightColor: 0x776688,
            quote: 'Our Lord of Hollows... We pledge our blades to you. Take the Dark Sigils and usurp the fading fire for the Age of Man.',
            wares: [
                { id: 'uchigatana', name: 'Darkdrift of Londor', icon: '🎌', type: 'weapon', cost: 4000, desc: 'Sable Church blade forged from unseen void', stat: 'DMG: 190 / 350' },
                { id: 'estus_shard', name: 'Hollowed Estus Shard', icon: '🧪', type: 'consumable', cost: 1500, desc: 'Reinforced with the resolve of Londor', stat: 'ESTUS +1' },
                { id: 'divine_blessing', name: 'Purging Blessing of Londor', icon: '🛡️', type: 'consumable', cost: 800, desc: 'Cleanse hollowed hallowing and wounds', stat: 'PURIFICATION' }
            ]
        },
        {
            id: 'merchant_bath_messengers',
            name: 'Bath Messengers',
            title: 'Inhabitants of the Hunter’s Dream',
            game: 'BB',
            zone: 'Dream Basin Birdbath',
            pos: [-14.0, 0, -4.0],
            rot: Math.PI / 4,
            icon: '🛁',
            modelType: 'messenger_basin',
            outfitColor: 0x707078,
            accentColor: 0xaaccff,
            hatStyle: 'pale_messengers',
            prop: 'stone_birdbath',
            lightColor: 0xaaccff,
            quote: 'The little creatures of the dream yearn to serve hunters. Hand them Blood Echoes, and their pale hands will reach up with trick weapons.',
            wares: [
                { id: 'rivers_of_blood', name: 'Chikage Blood Katana', icon: '🩸', type: 'weapon', cost: 8000, desc: 'Vileblood blade drawn in own blood for extreme laceration', stat: 'BLOOD RAPTURE' },
                { id: 'divine_blessing', name: 'Iosefka’s Blood Vial', icon: '🛡️', type: 'consumable', cost: 800, desc: 'Pure refined blood transfusion restores full vigor', stat: 'FULL VIGOR' },
                { id: 'homeward_bone', name: 'Bold Hunter’s Mark', icon: '🦴', type: 'consumable', cost: 300, desc: 'Awaken anew at the lamp of dreams', stat: 'DREAM WARP' }
            ]
        },
        {
            id: 'merchant_kale',
            name: 'Nomadic Merchant Kalé',
            title: 'Merchant of the Church of Elleh',
            game: 'ER',
            zone: 'Ruined Church of Elleh',
            pos: [-6.0, 0, -16.0],
            rot: -Math.PI / 6,
            icon: '🎪',
            modelType: 'nomad_kale',
            outfitColor: 0x9e2a2b,
            accentColor: 0x335c67,
            hatStyle: 'nomad_horned_hat',
            prop: 'acoustic_lute',
            lightColor: 0xffaa44,
            quote: 'I am of the nomadic tribe. We peddle wares by campfire light and play the finger lute to soothe the golden grace. What catches your eye, traveler?',
            wares: [
                { id: 'uchigatana', name: 'Land of Reeds Katana', icon: '🎌', type: 'weapon', cost: 3500, desc: 'Samurai starter blade from the reeds', stat: 'DMG: 175 / 320' },
                { id: 'torch_pitch', name: 'Crafting Pitch Resins', icon: '🪔', type: 'consumable', cost: 100, desc: 'Refill handheld torch to burn bright', stat: 'TORCH FUEL' },
                { id: 'estus_shard', name: 'Golden Seed Shard', icon: '🧪', type: 'consumable', cost: 1500, desc: 'Blessed tear from a minor Erdtree', stat: 'FLASK CAPACITY +1' },
                { id: 'charcoal_resin', name: 'Fire Coating Resin', icon: '🔥', type: 'consumable', cost: 500, desc: 'Nomadic red ember paste', stat: 'FLAME BUFF' }
            ]
        },
        {
            id: 'merchant_isolated_nomad',
            name: 'Isolated Merchant of Liurnia',
            title: 'Hermit of the Sunken Lake',
            game: 'ER',
            zone: 'Liurnia Lake Verge',
            pos: [-32.0, 0, 45.0],
            rot: Math.PI / 3,
            icon: '🛶',
            modelType: 'lake_nomad',
            outfitColor: 0x544030,
            accentColor: 0x4488aa,
            hatStyle: 'hood_lantern',
            prop: 'fishing_creel',
            lightColor: 0x66ccff,
            quote: 'The lake is deep and full of glintstone crustacean horrors. Keep your bellies full and your blades coated, or the bell towers will toll for you.',
            wares: [
                { id: 'halberd', name: 'Lucerne Polearm', icon: '🔱', type: 'weapon', cost: 5000, desc: 'Long steel beak punctures heavy armor', stat: 'DMG: 210 / 390' },
                { id: 'homeward_bone', name: 'Memory of Grace Bone', icon: '🦴', type: 'consumable', cost: 300, desc: 'Guided by lost golden grace', stat: 'WARP' },
                { id: 'divine_blessing', name: 'Dewkissed Herba Tear', icon: '🛡️', type: 'consumable', cost: 800, desc: 'Full restoration draught', stat: 'FULL RESTORE' }
            ]
        },
        {
            id: 'merchant_sorceress_sellen',
            name: 'Sorceress Sellen',
            title: 'Exiled Glintstone Witch of Raya Lucaria',
            game: 'ER',
            zone: 'Carian Observatory Cellar',
            pos: [-105.0, 3.5, -85.0],
            rot: 0,
            icon: '🔮',
            modelType: 'glintstone_witch',
            outfitColor: 0x1a2e40,
            accentColor: 0x00d4ff,
            hatStyle: 'stone_witch_crown',
            prop: 'glintstone_scroll',
            lightColor: 0x00d4ff,
            quote: 'My young apprentice... Glintstone is the amber of the cosmos, containing the primeval current. Study with me, and we shall rewrite the academy’s stars.',
            wares: [
                { id: 'dark_moon_greatsword', name: 'Carian Dark Moon Blade', icon: '🌙', type: 'weapon', cost: 12000, desc: 'Cold moonlight blade blessed by the full moon', stat: 'DMG: 280 / 520' },
                { id: 'moonlight', name: 'Azur’s Primeval Sword', icon: '✨', type: 'weapon', cost: 10000, desc: 'Sorcerous beam weapon channeler', stat: 'DMG: 230 / 440' },
                { id: 'estus_shard', name: 'Glintstone Estus Shard', icon: '🧪', type: 'consumable', cost: 1500, desc: 'Refined crystal shard for carrying capacity', stat: 'ESTUS +1' }
            ]
        },
        {
            id: 'merchant_war_counselor_iji',
            name: 'War Counselor Iji',
            title: 'Giant Blacksmith of the Carian Royals',
            game: 'ER',
            zone: 'Road to the Manor Spire',
            pos: [28.0, 0, 55.0],
            rot: -Math.PI / 4,
            icon: '🪞',
            modelType: 'mirror_giant',
            outfitColor: 0x3d352e,
            accentColor: 0xb0c4de,
            hatStyle: 'mirror_helm',
            prop: 'reading_tablet',
            lightColor: 0xb0e0e6,
            quote: 'I wear this mirror helm to ward off the Greater Will and its two fingers. Lady Ranni’s destiny is fraught with peril. Take these weapons, brave warrior.',
            wares: [
                { id: 'dragontooth', name: 'Carian Colossal Club', icon: '🦴', type: 'weapon', cost: 6500, desc: 'Giant smithing weapon of colossal poise stagger', stat: 'DMG: 310 / 580' },
                { id: 'zweihander', name: 'Troll Knight Greatsword', icon: '🗡️', type: 'weapon', cost: 3500, desc: 'Giant blade scaled down for tarnished hands', stat: 'DMG: 275 / 510' },
                { id: 'divine_blessing', name: 'Carian Royal Nectar', icon: '🛡️', type: 'consumable', cost: 800, desc: 'Blessed royal restoration', stat: 'FULL RESTORE' }
            ]
        },
        {
            id: 'merchant_high_auditor',
            name: 'High Auditor of the Ledger',
            title: 'Settlement Enforcer of the First Arbiters',
            game: 'LITURGY',
            zone: 'Grand Counting House of Arrears',
            pos: [-20.0, -4.92, 120.0],
            rot: Math.PI / 2,
            icon: '⚖️',
            modelType: 'iron_auditor',
            outfitColor: 0x11161d,
            accentColor: 0xd4af37,
            hatStyle: 'iron_mask_horns',
            prop: 'debt_scales',
            lightColor: 0xffaa00,
            quote: 'Every breath you draw in this realm is an unpaid loan. Balance the ledger with souls, or your collateral shall be claimed before the final audit.',
            wares: [
                { id: 'dark_moon_greatsword', name: 'Ledger-Breaker Claymore', icon: '📜', type: 'weapon', cost: 12000, desc: 'Shatters interest-burn penalties and cancels bonds', stat: 'DMG: 280 / 520 • AUDIT' },
                { id: 'rivers_of_blood', name: 'Arrears Execution Blade', icon: '🩸', type: 'weapon', cost: 8000, desc: 'Extracts interest directly from enemy veins', stat: 'DMG: 215 / 395 • BLEED' },
                { id: 'divine_blessing', name: 'Apocryphal Receipt of Settlement', icon: '🛡️', type: 'consumable', cost: 800, desc: 'Erases all accrued interest and clears status penalties', stat: 'FULL DEBT CLEAR' },
                { id: 'homeward_bone', name: 'Writ of Habeas Corpus', icon: '🦴', type: 'consumable', cost: 300, desc: 'Instant legal teleport back to Sanctuary Base', stat: 'SAFE ESCAPE' }
            ]
        }
    ];

    // Helper lookup
    window.getMerchantById = function(id) {
        return window.DARK_SOULS_MERCHANTS_30.find(m => m.id === id) || window.DARK_SOULS_MERCHANTS_30[0];
    };

    // ====================================================
    // PROCEDURAL 3D MODEL GENERATOR FOR 30 MERCHANTS
    // High-Fidelity Geometry, Rugs, Hats, Props, Wares & Lanterns
    // ====================================================
    window.createMerchant3DModel = function(m, worldMaterials = {}) {
        const root = new THREE.Group();
        root.position.set(m.pos[0], m.pos[1], m.pos[2]);
        root.rotation.y = m.rot || 0;

        const woodMat = worldMaterials.woodMat || new THREE.MeshStandardMaterial({ color: 0x4a3420, roughness: 0.85 });
        const ironMat = worldMaterials.ironMat || new THREE.MeshStandardMaterial({ color: 0x3a3c42, metalness: 0.7, roughness: 0.4 });
        const clothMat = new THREE.MeshStandardMaterial({ color: m.outfitColor || 0x4a3828, roughness: 0.88 });
        const accentMat = new THREE.MeshStandardMaterial({ color: m.accentColor || 0x7c241c, roughness: 0.85 });
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xb89a7a, roughness: 0.75 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 });
        const stoneMat = worldMaterials.stoneMat || new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.9 });

        // 1. CARPET / RUG UNDER THE MERCHANT
        const rugGeo = new THREE.PlaneGeometry(3.6, 3.6);
        const rugMat = new THREE.MeshStandardMaterial({
            color: m.accentColor || 0x4e2016,
            roughness: 0.95,
            metalness: 0.05
        });
        const rug = new THREE.Mesh(rugGeo, rugMat);
        rug.rotation.x = -Math.PI / 2;
        rug.position.y = 0.02;
        rug.receiveShadow = true;
        root.add(rug);

        // Rug decorative gold border fringe
        const borderGeo = new THREE.RingGeometry(1.6, 1.82, 4);
        const borderMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, side: THREE.DoubleSide });
        const border = new THREE.Mesh(borderGeo, borderMat);
        border.rotation.x = -Math.PI / 2;
        border.position.y = 0.025;
        root.add(border);

        // 2. STALL CRATES, PROPS & WARES
        const crate1 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.80, 0.85), woodMat);
        crate1.position.set(-1.15, 0.40, -0.6);
        crate1.rotation.y = 0.15;
        crate1.castShadow = true;
        crate1.receiveShadow = true;
        root.add(crate1);

        const crate2 = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.60, 0.70), woodMat);
        crate2.position.set(-1.05, 1.10, -0.5);
        crate2.rotation.y = -0.22;
        crate2.castShadow = true;
        root.add(crate2);

        // Display Weapons / Wares on the crate
        const displayBlade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.1, 0.20), ironMat);
        displayBlade.position.set(-0.65, 0.85, -0.2);
        displayBlade.rotation.z = -0.30;
        displayBlade.castShadow = true;
        root.add(displayBlade);

        const displaySpear = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.3, 8), ironMat);
        displaySpear.position.set(-0.50, 0.95, -0.35);
        displaySpear.rotation.z = -0.25;
        displaySpear.castShadow = true;
        root.add(displaySpear);

        // 3. GLOWING LANTERN / MAGICAL AURA
        const lanternLight = new THREE.PointLight(m.lightColor || 0xffa834, 2.4, 12, 1.5);
        lanternLight.position.set(-1.05, 1.55, -0.5);
        root.add(lanternLight);

        const lanternGlass = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.18),
            new THREE.MeshBasicMaterial({ color: m.lightColor || 0xffcc66 })
        );
        lanternGlass.position.set(-1.05, 1.55, -0.5);
        root.add(lanternGlass);

        // 4. BESPOKE NPC FIGURE
        const npcGroup = new THREE.Group();
        npcGroup.position.set(0.35, 0, 0);

        if (m.modelType === 'colossal_giant') {
            // Giant Blacksmith / War Counselor Iji (Scale x1.8)
            npcGroup.scale.set(1.7, 1.7, 1.7);
            const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.5, 10), stoneMat);
            stool.position.y = 0.25;
            npcGroup.add(stool);

            const giantTorso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.7), clothMat);
            giantTorso.position.y = 1.05;
            npcGroup.add(giantTorso);

            const giantHead = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), m.hatStyle === 'mirror_helm' ? goldMat : skinMat);
            giantHead.position.y = 1.85;
            npcGroup.add(giantHead);

            // Colossal Anvil
            const anvil = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.7), ironMat);
            anvil.position.set(0, 0.4, 1.2);
            npcGroup.add(anvil);

        } else if (m.modelType === 'lounging_cat') {
            // Sweet Shalquoir (Enchanted Blue Feline)
            const cushion = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.75, 0.35, 12), accentMat);
            cushion.position.y = 0.18;
            npcGroup.add(cushion);

            const catBodyGeo = (typeof THREE.CapsuleGeometry === 'function') 
                ? new THREE.CapsuleGeometry(0.22, 0.45, 8, 8) 
                : new THREE.CylinderGeometry(0.22, 0.22, 0.55, 8);
            const catBody = new THREE.Mesh(catBodyGeo, clothMat);
            catBody.rotation.z = Math.PI / 2.8;
            catBody.position.set(0, 0.48, 0);
            npcGroup.add(catBody);

            const catHead = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), clothMat);
            catHead.position.set(0.3, 0.62, 0);
            npcGroup.add(catHead);

            // Glowing green cat eyes
            const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
            eyeL.position.set(0.42, 0.65, 0.09);
            npcGroup.add(eyeL);
            const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
            eyeR.position.set(0.42, 0.65, -0.09);
            npcGroup.add(eyeR);

        } else if (m.modelType === 'messenger_basin') {
            // Bath Messengers (Stone birdbath with clutching hands)
            const basinBase = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 0.7, 10), stoneMat);
            basinBase.position.y = 0.35;
            npcGroup.add(basinBase);

            const basinBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.4, 0.45, 12), stoneMat);
            basinBowl.position.y = 0.85;
            npcGroup.add(basinBowl);

            // Water reflection
            const water = new THREE.Mesh(new THREE.CircleGeometry(0.78, 16), new THREE.MeshStandardMaterial({ color: 0x4466aa, roughness: 0.1, metalness: 0.8 }));
            water.rotation.x = -Math.PI / 2;
            water.position.y = 1.05;
            npcGroup.add(water);

            // Pale reaching messenger heads & arms
            for (let i = 0; i < 4; i++) {
                const ang = (i / 4) * Math.PI * 2;
                const mHead = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshStandardMaterial({ color: 0xd8d8d0 }));
                mHead.position.set(Math.cos(ang) * 0.45, 1.18, Math.sin(ang) * 0.45);
                npcGroup.add(mHead);

                const mArm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 4), new THREE.MeshStandardMaterial({ color: 0xd8d8d0 }));
                mArm.position.set(Math.cos(ang) * 0.55, 1.35, Math.sin(ang) * 0.55);
                mArm.rotation.z = Math.cos(ang) * 0.3;
                npcGroup.add(mArm);
            }

        } else if (m.modelType === 'witch_floating') {
            // Quelana of Izalith - Mother of Pyromancy
            // Lotus stone meditation dais
            const dais = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.28, 12), stoneMat);
            dais.position.y = 0.14;
            npcGroup.add(dais);

            // Flowing black silk robes with gold embroidery hem
            const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.52, 1.15, 12), clothMat);
            robe.position.y = 0.65;
            npcGroup.add(robe);

            const goldHem = new THREE.Mesh(new THREE.TorusGeometry(0.51, 0.025, 6, 16), goldMat);
            goldHem.position.y = 0.12;
            goldHem.rotation.x = Math.PI / 2;
            npcGroup.add(goldHem);

            // Gold-hemmed cowl mantle
            const mantle = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.38, 10), clothMat);
            mantle.position.y = 1.05;
            npcGroup.add(mantle);

            const mantleTrim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.02, 6, 14), goldMat);
            mantleTrim.position.y = 0.88;
            mantleTrim.rotation.x = Math.PI / 2;
            npcGroup.add(mantleTrim);

            // Shadowed Hood
            const hood = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.48, 10), clothMat);
            hood.position.set(0, 1.45, -0.04);
            hood.rotation.x = -0.12;
            npcGroup.add(hood);

            const hoodTrim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.022, 6, 14), goldMat);
            hoodTrim.position.set(0, 1.28, 0.06);
            hoodTrim.rotation.x = 0.35;
            npcGroup.add(hoodTrim);

            // Shadow face with twin amber eyes
            const faceDark = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.95 }));
            faceDark.position.set(0, 1.25, 0.04);
            npcGroup.add(faceDark);

            const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
            eyeL.position.set(-0.06, 1.27, 0.16);
            npcGroup.add(eyeL);
            const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
            eyeR.position.set(0.06, 1.27, 0.16);
            npcGroup.add(eyeR);

            // Arms: Left holds Izalith Catalyst, Right cups Dancing Primal Chaos Fire
            const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.52, 6), clothMat);
            armL.position.set(-0.35, 0.75, 0.15);
            armL.rotation.set(0.4, 0, 0.2);
            npcGroup.add(armL);

            const catalyst = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.022, 1.6, 6), woodMat);
            catalyst.position.set(-0.45, 0.75, 0.3);
            catalyst.rotation.x = 0.2;
            npcGroup.add(catalyst);
            const catHead = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 5), goldMat);
            catHead.position.set(-0.45, 1.5, 0.45);
            npcGroup.add(catHead);

            const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.52, 6), clothMat);
            armR.position.set(0.32, 0.75, 0.18);
            armR.rotation.set(0.6, 0, -0.3);
            npcGroup.add(armR);

            // Floating Primal Chaos Fire
            const fireLight = new THREE.PointLight(0xff6600, 3.2, 12, 1.4);
            fireLight.position.set(0.38, 0.95, 0.38);
            npcGroup.add(fireLight);

            const fireCore = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.12),
                new THREE.MeshBasicMaterial({ color: 0xff7700 })
            );
            fireCore.position.set(0.38, 0.95, 0.38);
            npcGroup.add(fireCore);

        } else if (m.modelType === 'squatting_rogue') {
            // Trusty Patches - Squatting rogue with Eagle Kite Shield & Winged Spear
            const thighL = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.10, 0.45, 6), clothMat);
            thighL.position.set(-0.25, 0.45, 0.15);
            thighL.rotation.x = 1.1;
            npcGroup.add(thighL);
            const calfL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.42, 6), new THREE.MeshStandardMaterial({ color: 0x221810 }));
            calfL.position.set(-0.25, 0.22, 0.28);
            calfL.rotation.x = -1.1;
            npcGroup.add(calfL);

            const thighR = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.10, 0.45, 6), clothMat);
            thighR.position.set(0.25, 0.45, 0.15);
            thighR.rotation.x = 1.1;
            npcGroup.add(thighR);
            const calfR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.42, 6), new THREE.MeshStandardMaterial({ color: 0x221810 }));
            calfR.position.set(0.25, 0.22, 0.28);
            calfR.rotation.x = -1.1;
            npcGroup.add(calfR);

            const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.55, 8), clothMat);
            torso.position.set(0, 0.52, -0.05);
            torso.rotation.x = 0.35;
            npcGroup.add(torso);

            // Bald shining head with smirk
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), skinMat);
            head.position.set(0, 0.88, 0.08);
            head.scale.set(0.9, 1.1, 0.95);
            npcGroup.add(head);

            // Eagle Kite Shield resting on ground
            const shield = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.1, 0.06), woodMat);
            shield.position.set(-0.52, 0.55, 0.25);
            shield.rotation.set(0.1, 0.4, 0.15);
            npcGroup.add(shield);
            const shieldBoss = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 8), ironMat);
            shieldBoss.position.set(-0.52, 0.65, 0.29);
            shieldBoss.rotation.x = Math.PI / 2;
            npcGroup.add(shieldBoss);

            // Winged Spear resting vertically
            const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.2, 6), ironMat);
            spear.position.set(0.55, 1.0, 0.15);
            spear.rotation.z = -0.15;
            npcGroup.add(spear);

        } else if (m.modelType === 'blacksmith') {
            // Master Blacksmith Andre of Astora
            const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.35, 10), woodMat);
            stool.position.y = 0.18;
            npcGroup.add(stool);

            const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.42, 8), clothMat);
            legs.position.set(0, 0.22, 0.12);
            npcGroup.add(legs);

            // Muscular Torso & Smithing Leather Apron
            const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.68, 8), skinMat);
            torso.position.y = 0.70;
            npcGroup.add(torso);

            const apron = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.62, 0.12), new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.85 }));
            apron.position.set(0, 0.65, 0.16);
            npcGroup.add(apron);

            // Sculpted Head & Long Braided Silver Beard
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), skinMat);
            head.position.y = 1.15;
            npcGroup.add(head);

            const beard = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.55, 6), new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.7 }));
            beard.position.set(0, 0.90, 0.18);
            beard.rotation.x = -0.15;
            npcGroup.add(beard);

            // Muscular Arms: Right holds Smithing Hammer
            const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.55, 6), skinMat);
            armR.position.set(0.42, 0.72, 0.15);
            armR.rotation.set(0.4, 0, -0.3);
            npcGroup.add(armR);

            const hammerHaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.65, 6), woodMat);
            hammerHaft.position.set(0.55, 0.68, 0.35);
            hammerHaft.rotation.x = Math.PI / 2;
            npcGroup.add(hammerHaft);
            const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.28), ironMat);
            hammerHead.position.set(0.55, 0.68, 0.65);
            npcGroup.add(hammerHead);

            // Massive Anvil with Glowing Hot Steel Bar
            const anvilStump = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.50, 0.55, 10), woodMat);
            anvilStump.position.set(0, 0.28, 0.85);
            npcGroup.add(anvilStump);

            const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.38, 0.42), ironMat);
            anvil.position.set(0, 0.70, 0.85);
            npcGroup.add(anvil);

            const hotSteel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.45), new THREE.MeshStandardMaterial({ color: 0xff3300, emissive: 0xff4400, emissiveIntensity: 1.2 }));
            hotSteel.position.set(0, 0.91, 0.85);
            npcGroup.add(hotSteel);

        } else {
            // Enhanced Organic Seated Humanoid Merchant (Flowing Cloth, Sculpted Anatomy)
            const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, 0.32, 10), woodMat);
            stool.position.y = 0.16;
            npcGroup.add(stool);

            // Seated Robe Drapery with flared hem
            const robeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.48, 0.48, 10), clothMat);
            robeBase.position.set(0, 0.26, 0.10);
            npcGroup.add(robeBase);

            // Torso with belt & layered tunic
            const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.65, 8), clothMat);
            torso.position.y = 0.72;
            torso.castShadow = true;
            npcGroup.add(torso);

            const belt = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.024, 6, 12), new THREE.MeshStandardMaterial({ color: 0x221810 }));
            belt.position.y = 0.46;
            belt.rotation.x = Math.PI / 2;
            npcGroup.add(belt);

            const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.06, 6, 12), accentMat);
            scarf.position.y = 1.02;
            scarf.rotation.x = Math.PI / 2;
            npcGroup.add(scarf);

            // Sculpted Head with cowl/hair
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), skinMat);
            head.position.y = 1.24;
            head.scale.set(0.9, 1.1, 0.95);
            head.castShadow = true;
            npcGroup.add(head);

            // Arms resting forward on knees
            const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.52, 6), clothMat);
            armL.position.set(-0.32, 0.62, 0.18);
            armL.rotation.x = 0.52;
            npcGroup.add(armL);

            const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.52, 6), clothMat);
            armR.position.set(0.32, 0.62, 0.18);
            armR.rotation.x = 0.52;
            npcGroup.add(armR);

            // Unique Hat Styles:
            if (m.hatStyle === 'pilgrim_hat') {
                const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.04, 14), clothMat);
                brim.position.y = 1.48;
                npcGroup.add(brim);
                const cone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.42, 10), clothMat);
                cone.position.y = 1.68;
                npcGroup.add(cone);

            } else if (m.hatStyle === 'massive_disc_hat') {
                // Big Hat Logan
                const discBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.04, 24), clothMat);
                discBrim.position.y = 1.48;
                npcGroup.add(discBrim);
                const discCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.28, 14), clothMat);
                discCrown.position.y = 1.62;
                npcGroup.add(discCrown);

            } else if (m.hatStyle === 'horned_helm') {
                // Domhnall of Zena
                const helm = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24), goldMat);
                helm.position.y = 1.45;
                npcGroup.add(helm);
                const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.45, 6), goldMat);
                hornL.position.set(-0.25, 1.62, 0);
                hornL.rotation.z = 0.65;
                npcGroup.add(hornL);
                const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.45, 6), goldMat);
                hornR.position.set(0.25, 1.62, 0);
                hornR.rotation.z = -0.65;
                npcGroup.add(hornR);

            } else if (m.hatStyle === 'silver_beard') {
                // Andre of Astora
                const beard = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.35, 0.16), new THREE.MeshStandardMaterial({ color: 0xd8d8d8 }));
                beard.position.set(0, 1.15, 0.18);
                npcGroup.add(beard);
                const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.45), ironMat);
                anvil.position.set(0, 0.25, 0.75);
                npcGroup.add(anvil);

            } else if (m.hatStyle === 'nomad_horned_hat') {
                // Nomadic Merchant Kalé
                const nBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.04, 14), accentMat);
                nBrim.position.y = 1.48;
                npcGroup.add(nBrim);
                const nCrown = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.38, 8), accentMat);
                nCrown.position.y = 1.65;
                npcGroup.add(nCrown);
                const lute = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.48, 0.12), woodMat);
                lute.position.set(-0.45, 0.55, 0.35);
                lute.rotation.z = 0.4;
                npcGroup.add(lute);

            } else if (m.hatStyle === 'pointed_witch_hat') {
                // Karla the Dark Sorceress
                const wBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.04, 16), clothMat);
                wBrim.position.y = 1.48;
                npcGroup.add(wBrim);
                const wCone = new THREE.Mesh(new THREE.ConeGeometry(0.30, 0.75, 10), clothMat);
                wCone.position.set(0, 1.82, -0.05);
                wCone.rotation.x = -0.15;
                npcGroup.add(wCone);

            } else if (m.hatStyle === 'iron_mask_horns') {
                // High Auditor of the Grand Ledger
                const mask = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.40, 0.34), goldMat);
                mask.position.y = 1.30;
                npcGroup.add(mask);
                // Scales of debt prop
                const scalePole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.95, 6), goldMat);
                scalePole.position.set(0.55, 0.8, 0.4);
                npcGroup.add(scalePole);
                const scaleBar = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.04, 0.04), goldMat);
                scaleBar.position.set(0.55, 1.25, 0.4);
                npcGroup.add(scaleBar);
            }
        }

        root.add(npcGroup);
        root.userData = {
            merchantDef: m,
            isMerchant: true
        };

        return root;
    };

})();
