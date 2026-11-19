// ============================================================================
// DARK SOULS INTERACTIVE INVENTORY & EQUIPMENT SYSTEM
// Weapons, Armor, Rings, Consumables & Lore Artifacts
// ============================================================================

class DarkSoulsInventory {
    constructor(game) {
        this.game = game;
        this.combat = game.combat;
        this.audio = window.dsAudio;

        this.activeCategory = 'weapons';
        this.selectedItemId = 'sword';

        // Equipped slots
        this.equippedWeapon = 'sword';
        this.equippedArmor = localStorage.getItem('darksouls_equipped_skin') || 'warrior';
        this.equippedRings = ['favor', 'cloranthy']; // 2 ring slots

        // Consumable quantities
        this.consumableCounts = {
            estus: 5,
            moss: 5,
            divine_blessing: 3,
            homeward_bone: 10,
            green_blossom: 10,
            humanity: 5,
            firebomb: 20,
            lloyd: 5
        };

        // Green Blossom stamina buff timer
        this.greenBlossomTimer = 0;

        // Restore saved inventory if available
        this.load();

        // Initialize comprehensive item compendium
        this.initItemDatabase();

        // Apply ring passives on startup
        this.applyRingBuffs();
    }

    initItemDatabase() {
        this.items = {
            // ----------------------------------------------------------------
            // 1. WEAPONS
            // ----------------------------------------------------------------
            sword: {
                id: 'sword',
                category: 'weapons',
                name: 'Astora Straight Sword',
                icon: '⚔️',
                type: 'Straight Sword',
                stats: { dmg: '150 / 280', stamina: '20', poise: '1.0x', speed: '1.0x' },
                desc: 'A divine straight sword forged in the ruined kingdom of Astora. Finely crafted with balanced slashes, light stamina drain and divine scaling.',
                action: 'EQUIP'
            },
            zweihander: {
                id: 'zweihander',
                category: 'weapons',
                name: 'Zweihander',
                icon: '🗡️',
                type: 'Ultra Greatsword',
                stats: { dmg: '260 / 490', stamina: '35', poise: '2.8x', speed: '0.8x' },
                desc: 'Colossal two-handed ultra greatsword. Devastating sweeps that flatten lesser hollows and shatter giant enemy poise with immense kinetic force.',
                action: 'EQUIP'
            },
            uchigatana: {
                id: 'uchigatana',
                category: 'weapons',
                name: 'Uchigatana',
                icon: '⚡',
                type: 'Eastern Katana',
                stats: { dmg: '175 / 310', stamina: '18', poise: '1.2x', speed: '1.15x' },
                desc: 'Curved single-edged blade from an eastern land. Lightning-fast slashes capable of severing limbs and piercing armored gaps.',
                action: 'EQUIP'
            },
            halberd: {
                id: 'halberd',
                category: 'weapons',
                name: 'Black Knight Halberd',
                icon: '🔱',
                type: 'Polearm',
                stats: { dmg: '240 / 420', stamina: '28', poise: '2.0x', speed: '0.95x' },
                desc: 'The halberd of the Black Knights who once fought the chaos demons. Incredible forward thrust range and wide overhead cleaves.',
                action: 'EQUIP'
            },
            dragontooth: {
                id: 'dragontooth',
                category: 'weapons',
                name: 'Dragon Tooth',
                icon: '🦴',
                type: 'Great Hammer',
                stats: { dmg: '310 / 580', stamina: '45', poise: '3.5x', speed: '0.7x' },
                desc: 'Created from an everlasting dragon fang. Heavy as stone and impervious to damage. Smashes shields and cracks subterranean bedrock.',
                action: 'EQUIP'
            },
            moonlight: {
                id: 'moonlight',
                category: 'weapons',
                name: 'Moonlight Greatsword',
                icon: '✨',
                type: 'Magic Greatsword',
                stats: { dmg: '220 / 440', stamina: '26', poise: '1.8x', speed: '1.0x' },
                desc: 'Legendary greatsword borne from the tail of Seath the Scaleless. Channels pure pale moonlight sorcery into sweeping arc waves.',
                action: 'EQUIP'
            },
            torch: {
                id: 'torch',
                category: 'weapons',
                name: 'Lordran Pitch Torch',
                icon: '🔥',
                type: 'Utility & Flame Weapon',
                stats: { dmg: '110 / 190', stamina: '14', poise: '0.8x', speed: '1.1x' },
                desc: 'Pitch-soaked wooden torch illuminating pitch-black catacombs, igniting spiderwebs and scorching creeping vermin with bright fire.',
                action: 'EQUIP'
            },
            rivers_of_blood: {
                id: 'rivers_of_blood',
                category: 'weapons',
                name: 'Rivers of Blood',
                icon: '🩸',
                type: 'Cursed Katana',
                stats: { dmg: '215 / 395', stamina: '16', poise: '1.4x', speed: '1.45x' },
                desc: 'Cursed red-metal katana of Okina. Rapid consecutive Corpse Piler blood slashes that cause massive hemorrhaging and ignite scarlet blood-flame.',
                action: 'EQUIP'
            },
            dark_moon_greatsword: {
                id: 'dark_moon_greatsword',
                category: 'weapons',
                name: 'Dark Moon Greatsword',
                icon: '🌙',
                type: 'Lunar Frost Greatsword',
                stats: { dmg: '280 / 520', stamina: '28', poise: '2.4x', speed: '1.0x' },
                desc: 'Lunar ceremonial greatsword gifted by Ranni the Witch. Heavy attacks unleash freezing waves of moonlight rime and shatter poise.',
                action: 'EQUIP'
            },

            // ----------------------------------------------------------------
            // 2. ARMOR SETS
            // ----------------------------------------------------------------
            warrior: {
                id: 'warrior',
                category: 'armor',
                name: 'Elite Knight Set',
                icon: '🛡️',
                type: 'Medium Armor',
                stats: { def: '180 Phys', poise: '42', magicDef: '95', weight: '14.0 kg' },
                desc: 'Iconic polished steel armor of an elite Astora knight. Offers superior balance between kinetic deflection and agile rolling.',
                action: 'EQUIP_ARMOR'
            },
            havel: {
                id: 'havel',
                category: 'armor',
                name: "Havel's Rock Plate",
                icon: '🗿',
                type: 'Super Heavy Armor',
                stats: { def: '320 Phys', poise: '110', magicDef: '160', weight: '38.0 kg' },
                desc: 'Hewn directly from solid granite boulders by Havel the Rock. Granting nearly unbreakable poise and impervious physical resistance.',
                action: 'EQUIP_ARMOR'
            },
            black_iron: {
                id: 'black_iron',
                category: 'armor',
                name: 'Black Iron Tarkus Set',
                icon: '⬛',
                type: 'Heavy Armor',
                stats: { def: '260 Phys', poise: '85', magicDef: '120', weight: '28.0 kg' },
                desc: 'Darkened pig-iron armor of Iron Tarkus. Renowned for withstanding crushing demon blows and dragon fire without yielding.',
                action: 'EQUIP_ARMOR'
            },
            pyromancer: {
                id: 'pyromancer',
                category: 'armor',
                name: 'Gold-Hemmed Black Robes',
                icon: '🔥',
                type: 'Light Robes',
                stats: { def: '85 Phys', poise: '12', magicDef: '240 (Fire 310)', weight: '4.5 kg' },
                desc: 'Ancient flame-resistant robes worn by the Daughters of Chaos in Lost Izalith. Extremely light, granting maximum ninja-roll speed.',
                action: 'EQUIP_ARMOR'
            },
            brass: {
                id: 'brass',
                category: 'armor',
                name: 'Brass Dragonslayer Armor',
                icon: '🪙',
                type: 'Gilded Medium-Heavy Armor',
                stats: { def: '215 Phys', poise: '58', magicDef: '175', weight: '18.5 kg' },
                desc: 'Ornate antique brass armor blessed by the sun god Gwyn. Features a sweeping crimson plume helm and lightning deflection.',
                action: 'EQUIP_ARMOR'
            },
            shadow: {
                id: 'shadow',
                category: 'armor',
                name: 'Shadow Shinobi Garb',
                icon: '🥷',
                type: 'Stealth Cloth',
                stats: { def: '95 Phys', poise: '18', magicDef: '130', weight: '6.0 kg' },
                desc: 'Pitch-black garbs worn by the spies of an Eastern clan. Completely silent footsteps and virtually weightless rolling.',
                action: 'EQUIP_ARMOR'
            },

            // ----------------------------------------------------------------
            // 3. RINGS (2 Slots)
            // ----------------------------------------------------------------
            favor: {
                id: 'favor',
                category: 'rings',
                name: 'Ring of Favor and Protection',
                icon: '💍',
                type: 'Goddess Fina Ring',
                stats: { effect: '+20% Maximum HP & +20% Stamina Pool' },
                desc: 'A ring symbolizing the favor of the goddess Fina. Boosts the bearer’s vitality and stamina endurance reserves substantially.',
                action: 'EQUIP_RING'
            },
            havel_ring: {
                id: 'havel_ring',
                category: 'rings',
                name: "Havel's Ring",
                icon: '💎',
                type: 'Titan Ring',
                stats: { effect: '+50% Equip Load Capacity (Fastest Roll Stride)' },
                desc: 'Named after Havel the Rock. Its warriors never yielded an inch, carrying colossal iron weapons with effortless stride.',
                action: 'EQUIP_RING'
            },
            cloranthy: {
                id: 'cloranthy',
                category: 'rings',
                name: 'Cloranthy Ring',
                icon: '🌿',
                type: 'Nature Ring',
                stats: { effect: '+25 Stamina Recovery Rate / Sec' },
                desc: 'Old ring depicting the green herb Cloranthy. Substantially accelerates stamina regeneration, keeping stamina bars full.',
                action: 'EQUIP_RING'
            },
            dark_wood: {
                id: 'dark_wood',
                category: 'rings',
                name: 'Dark Wood Grain Ring',
                icon: '🪵',
                type: 'Eastern Shinobi Ring',
                stats: { effect: 'Ninja Flip Acrobatic Rolls (+6 Invincibility Frames)' },
                desc: 'Special ring granted to the ninja bodyguards of Shiva of the East. Transforms ordinary dodges into acrobatic backflips.',
                action: 'EQUIP_RING'
            },
            wolf_ring: {
                id: 'wolf_ring',
                category: 'rings',
                name: 'Wolf Ring',
                icon: '🐺',
                type: 'Knight Artorias Ring',
                stats: { effect: '+40 Natural Poise (Resist Attack Interruption)' },
                desc: 'One of the special rings granted to the four knights of Gwyn. Matches the unwavering iron resolve of Knight Artorias.',
                action: 'EQUIP_RING'
            },
            red_tearstone: {
                id: 'red_tearstone',
                category: 'rings',
                name: 'Red Tearstone Ring',
                icon: '🔴',
                type: 'Carim Bloodstone Ring',
                stats: { effect: '+50% Attack Damage when HP is below 25%' },
                desc: 'Fitted with a rare tearstone gem from Carim. Senses impending demise, amplifying the bearer’s offensive power to maximum.',
                action: 'EQUIP_RING'
            },
            gold_serpent: {
                id: 'gold_serpent',
                category: 'rings',
                name: 'Covetous Gold Serpent Ring',
                icon: '🐍',
                type: 'Greed Ring',
                stats: { effect: '+200 Item & Remnant Discovery Rate' },
                desc: 'The serpent is an imperfect dragon and symbol of greed. Drastically increases the chance of rare titanite drops from mobs.',
                action: 'EQUIP_RING'
            },
            hornet_ring: {
                id: 'hornet_ring',
                category: 'rings',
                name: 'Hornet Ring',
                icon: '🐝',
                type: 'Lord’s Blade Ciaran Ring',
                stats: { effect: '+35% Critical Parry Riposte & Backstab Damage' },
                desc: 'Granted to the assassin Lord’s Blade Ciaran. Guarantees lethal devastating damage on successful parries and backstabs.',
                action: 'EQUIP_RING'
            },

            // ----------------------------------------------------------------
            // 4. CONSUMABLES
            // ----------------------------------------------------------------
            estus: {
                id: 'estus',
                category: 'consumables',
                name: 'Estus Flask',
                icon: '🧪',
                type: 'Sacred Healing Flask',
                stats: { effect: 'Restores +450 HP (Refills at Bonfires)' },
                desc: 'A green glass flask filled with bonfire embers. The Undead treasure these flasks, drinking them to heal grievous wounds.',
                action: 'USE'
            },
            moss: {
                id: 'moss',
                category: 'consumables',
                name: 'Blooming Purple Moss Clump',
                icon: '🌸',
                type: 'Subterranean Herb',
                stats: { effect: 'Instant Poison & Toxic Neutralization' },
                desc: 'Medicinal moss grown in the humid catacombs of Blighttown. Completely cleanses poison and venom buildup.',
                action: 'USE'
            },
            divine_blessing: {
                id: 'divine_blessing',
                category: 'consumables',
                name: 'Divine Blessing',
                icon: '🍶',
                type: 'Holy Water of Gwynevere',
                stats: { effect: 'Fully Restores 100% HP & Cures All Status Ailments' },
                desc: 'Holy water blessed by Gwynevere, Princess of Sunlight. Completely revitalizes all health and washes away every affliction.',
                action: 'USE'
            },
            homeward_bone: {
                id: 'homeward_bone',
                category: 'consumables',
                name: 'Homeward Bone',
                icon: '🦴',
                type: 'Bonfire Relic',
                stats: { effect: 'Instant Safe Fast-Travel Warp to Nearest Bonfire' },
                desc: 'Bone fragment of an undead pilgrim. Breaking it summons the warm embers of the bonfire, instantly warping the user to safety.',
                action: 'USE'
            },
            green_blossom: {
                id: 'green_blossom',
                category: 'consumables',
                name: 'Green Blossom',
                icon: '🥬',
                type: 'Herb of Endurance',
                stats: { effect: '+35 Stamina Recovery / Sec for 60 Seconds' },
                desc: 'A fragrant green herb with crisp water leaves. Chewing it invigorates the heart, granting a surge of stamina recovery.',
                action: 'USE'
            },
            humanity: {
                id: 'humanity',
                category: 'consumables',
                name: 'Humanity Sprite',
                icon: '🖤',
                type: 'Dark Soul Fragment',
                stats: { effect: 'Restores 100% Health & Grants +1,000 Souls' },
                desc: 'A tiny black sprite found on human corpses. Absorbing it cleanses hollowing, restores maximum health and grants primeval power.',
                action: 'USE'
            },
            firebomb: {
                id: 'firebomb',
                category: 'consumables',
                name: 'Black Firebomb',
                icon: '💣',
                type: 'Thrown Explosive',
                stats: { effect: 'Detonates for 380 Area Fire Blast Damage' },
                desc: 'Earthen pot filled with pitch and secret alchemical powder. Detonates in a roaring flash of fire upon impact.',
                action: 'USE'
            },
            lloyd: {
                id: 'lloyd',
                category: 'consumables',
                name: "Lloyd's Talisman",
                icon: '🧿',
                type: 'Allfather Holy Charm',
                stats: { effect: 'Neutralizes Monster Recovery & Calms Mimics' },
                desc: 'Talisman utilized by the Way of White clerics to hunt Undead. Emits a pale mist that suppresses recovery magic.',
                action: 'USE'
            },

            // ----------------------------------------------------------------
            // 5. LORE & KEY ARTIFACTS
            // ----------------------------------------------------------------
            lordvessel: {
                id: 'lordvessel',
                category: 'lore',
                name: 'The Lordvessel',
                icon: '🏆',
                type: 'Relic of the Gods',
                stats: { effect: 'Key to the Kiln of the First Flame & Universal Warp' },
                desc: 'A giant golden basin bestowed by Gwynevere. Capable of holding the magnificent souls of the Great Lords to kindle the First Flame.',
                action: 'EXAMINE'
            },
            rite_of_kindling: {
                id: 'rite_of_kindling',
                category: 'lore',
                name: 'Rite of Kindling',
                icon: '🔥',
                type: 'Ancient Secret Art',
                stats: { effect: 'Allows Bonfires to be Kindled up to 20 Estus' },
                desc: 'Sacred ritual stolen from Gravelord Nito by Pinwheel. Deepens the connection to the flame, empowering bonfires beyond normal limits.',
                action: 'EXAMINE'
            },
            crest_of_artorias: {
                id: 'crest_of_artorias',
                category: 'lore',
                name: 'Crest of Artorias',
                icon: '🗝️',
                type: 'Sealed Sanctum Key',
                stats: { effect: 'Unlocks the Sealed Stone Door in Darkroot Garden' },
                desc: 'Stone crest inscribed with the coat of arms of Artorias the Abysswalker. Opens the doorway to his sacred grave and great wolf Sif.',
                action: 'EXAMINE'
            },
            peculiar_doll: {
                id: 'peculiar_doll',
                category: 'lore',
                name: 'Peculiar Doll',
                icon: '🎎',
                type: 'Ariamis Canvas Key',
                stats: { effect: 'Grants Entry into the Painted World of Ariamis' },
                desc: 'A strange, soft doll dressed in antique clothes. When held by an undead traveler, the giant oil painting in Anor Londo draws them inside.',
                action: 'EXAMINE'
            },
            mystery_key: {
                id: 'mystery_key',
                category: 'lore',
                name: 'Mystery Key',
                icon: '🔑',
                type: 'Undead Burg Key',
                stats: { effect: 'Unlocks the Watchtower Cell where Knight Lautrec rests' },
                desc: 'Flimsy iron key found on a fallen soldier in the parish. Unlocks the hidden cell overlooking the sunlit gargoyle belfry.',
                action: 'EXAMINE'
            },
            depths_key: {
                id: 'depths_key',
                category: 'lore',
                name: 'Key to the Depths',
                icon: '🗝️',
                type: 'Sewer Passage Key',
                stats: { effect: 'Opens the Heavy Iron Door leading from Burg to Sewers' },
                desc: 'Heavily tarnished key dropped by the Capra Demon. Opens the dank grated doorway descending into the slimy sewers of the Depths.',
                action: 'EXAMINE'
            },
            fire_keeper_soul: {
                id: 'fire_keeper_soul',
                category: 'lore',
                name: 'Fire Keeper Soul',
                icon: '✨',
                type: 'Sacred Divine Soul',
                stats: { effect: 'Permanently Reinforces Estus Flask Potency (+25% Healing)' },
                desc: 'Each Fire Keeper is a corporeal manifestation of their bonfire. Offering this soul to the flame permanently deepens Estus potency.',
                action: 'EXAMINE'
            }
        };
    }

    // ------------------------------------------------------------------------
    // UI MODAL MANAGEMENT
    // ------------------------------------------------------------------------
    open() {
        const modal = document.getElementById('inventory-modal');
        if (!modal) return;
        modal.style.display = 'flex';
        this.renderUI();
        if (this.audio && this.audio.playRoll) this.audio.playRoll();
    }

    close() {
        const modal = document.getElementById('inventory-modal');
        if (modal) modal.style.display = 'none';
    }

    toggle() {
        const modal = document.getElementById('inventory-modal');
        if (modal && modal.style.display === 'flex') {
            this.close();
        } else {
            this.open();
        }
    }

    setCategory(cat) {
        this.activeCategory = cat;
        // Auto-select first item in category
        const catItems = Object.values(this.items).filter(i => i.category === cat);
        if (catItems.length > 0) {
            this.selectedItemId = catItems[0].id;
        }
        this.renderUI();
    }

    selectItem(itemId) {
        this.selectedItemId = itemId;
        this.renderUI();
        if (this.audio && this.audio.playFootstep) this.audio.playFootstep();
    }

    // ------------------------------------------------------------------------
    // ITEM ACTIONS (EQUIP / USE / EXAMINE)
    // ------------------------------------------------------------------------
    handleItemAction(itemId) {
        const item = this.items[itemId];
        if (!item) return;

        if (item.category === 'weapons') {
            this.equipWeapon(itemId);
        } else if (item.category === 'armor') {
            this.equipArmor(itemId);
        } else if (item.category === 'rings') {
            this.equipRing(itemId);
        } else if (item.category === 'consumables') {
            this.useConsumable(itemId);
        } else if (item.category === 'lore') {
            if (this.game && this.game.showNotification) {
                this.game.showNotification(`📜 EXAMINED: ${item.name.toUpperCase()}`);
            }
            if (this.audio && this.audio.playBellToll) this.audio.playBellToll();
        }
    }

    equipWeapon(weaponId) {
        this.equippedWeapon = weaponId;
        if (this.combat && this.combat.selectWeapon) {
            this.combat.selectWeapon(weaponId);
        } else if (this.game && this.game.selectWeapon) {
            this.game.selectWeapon(weaponId);
        }
        this.save();
        this.renderUI();
        if (this.game && this.game.showNotification) {
            this.game.showNotification(`⚔️ EQUIPPED WEAPON: ${this.items[weaponId].name.toUpperCase()}`);
        }
        if (this.audio && this.audio.playSwing) this.audio.playSwing();
    }

    equipArmor(armorId) {
        this.equippedArmor = armorId;
        if (this.game && this.game.selectSkin) {
            this.game.selectSkin(armorId);
        }
        this.save();
        this.renderUI();
        if (this.game && this.game.showNotification) {
            this.game.showNotification(`🛡️ EQUIPPED ARMOR: ${this.items[armorId].name.toUpperCase()}`);
        }
        if (this.audio && this.audio.playParry) this.audio.playParry();
    }

    equipRing(ringId) {
        // Toggle or assign to slot 1 or 2
        if (this.equippedRings.includes(ringId)) {
            // Already equipped, remove it
            this.equippedRings = this.equippedRings.filter(r => r !== ringId);
            if (this.game && this.game.showNotification) {
                this.game.showNotification(`💍 UNEQUIPPED: ${this.items[ringId].name.toUpperCase()}`);
            }
        } else {
            // Put in slot 1 (shift older ring to slot 2)
            if (this.equippedRings.length >= 2) {
                this.equippedRings[1] = this.equippedRings[0];
                this.equippedRings[0] = ringId;
            } else {
                this.equippedRings.push(ringId);
            }
            if (this.game && this.game.showNotification) {
                this.game.showNotification(`💍 EQUIPPED RING: ${this.items[ringId].name.toUpperCase()}`);
            }
        }
        this.applyRingBuffs();
        this.save();
        this.renderUI();
        if (this.audio && this.audio.playTorchIgnite) this.audio.playTorchIgnite();
    }

    useConsumable(itemId) {
        const count = this.consumableCounts[itemId] || 0;
        if (count <= 0) {
            if (this.game && this.game.showNotification) {
                this.game.showNotification(`⚠️ NO MORE ${this.items[itemId].name.toUpperCase()} REMAINING!`);
            }
            return;
        }

        let used = false;
        if (itemId === 'estus') {
            if (this.combat && this.combat.tryDrinkEstus) {
                used = this.combat.tryDrinkEstus();
            }
        } else if (itemId === 'moss') {
            if (this.combat && this.combat.tryDrinkAntidote) {
                this.combat.tryDrinkAntidote();
                used = true;
            }
        } else if (itemId === 'divine_blessing') {
            if (this.combat) {
                this.combat.hp = this.combat.maxHp;
                this.combat.isPoisoned = false;
                this.combat.poisonBuildup = 0;
                this.combat.isPetrified = false;
                if (this.game && this.game.updateHUD) this.game.updateHUD();
                if (this.game && this.game.showNotification) {
                    this.game.showNotification("🍶 DIVINE BLESSING: 100% HEALTH RESTORED & STATUS CURED!");
                }
                if (this.audio && this.audio.playBonfireIgnite) this.audio.playBonfireIgnite();
                used = true;
            }
        } else if (itemId === 'homeward_bone') {
            if (this.game && this.game.travelToLocation) {
                this.game.travelToLocation('royal_bridge_arena');
                if (this.combat) this.combat.restAtBonfire();
                if (this.game && this.game.showNotification) {
                    this.game.showNotification("🦴 HOMEWARD BONE: RETURNED TO SANCTUARY BONFIRE!");
                }
                if (this.audio && this.audio.playBellToll) this.audio.playBellToll();
                this.close();
                used = true;
            }
        } else if (itemId === 'green_blossom') {
            this.greenBlossomTimer = 60.0;
            if (this.combat) {
                this.combat.staminaRegenRate = 68; // +30 boost
            }
            if (this.game && this.game.showNotification) {
                this.game.showNotification("🥬 GREEN BLOSSOM: STAMINA RECOVERY SURGE (60s)!");
            }
            if (this.audio && this.audio.playRoll) this.audio.playRoll();
            used = true;
        } else if (itemId === 'humanity') {
            if (this.combat) {
                this.combat.hp = this.combat.maxHp;
                this.combat.souls += 1000;
                if (this.game && this.game.updateHUD) this.game.updateHUD();
                if (this.game && this.game.showNotification) {
                    this.game.showNotification("🖤 HUMANITY ABSORBED: +1,000 SOULS & MAX HEALTH!");
                }
                if (this.audio && this.audio.playVictory) this.audio.playVictory();
                used = true;
            }
        } else if (itemId === 'firebomb') {
            if (this.combat) {
                this.throwFirebomb();
                used = true;
            }
        } else if (itemId === 'lloyd') {
            if (this.game && this.game.showNotification) {
                this.game.showNotification("🧿 LLOYD'S TALISMAN: ENEMY RECOVERY NEUTRALIZED!");
            }
            if (this.audio && this.audio.playParry) this.audio.playParry();
            used = true;
        }

        if (used) {
            this.consumableCounts[itemId]--;
            this.save();
            this.renderUI();
        }
    }

    throwFirebomb() {
        if (!this.game || !this.game.playerMesh) return;
        const pPos = this.game.playerMesh.position;
        const forward = new THREE.Vector3(
            -Math.sin(this.game.playerMesh.rotation.y),
            0,
            -Math.cos(this.game.playerMesh.rotation.y)
        ).normalize();

        const blastCenter = pPos.clone().addScaledVector(forward, 6.0);
        blastCenter.y = (this.game.world && this.game.world.getGroundHeight) 
            ? this.game.world.getGroundHeight(blastCenter.x, blastCenter.z) 
            : pPos.y;

        // Visual Explosion & Shockwave
        if (this.game.world && this.game.world.spawnExplosion) {
            this.game.world.spawnExplosion(blastCenter);
        }

        // Damage Enemies in Radius
        if (this.combat && this.combat.enemies) {
            this.combat.enemies.forEach(e => {
                if (!e.isDead && e.mesh && e.mesh.position.distanceTo(blastCenter) < 5.5) {
                    e.hp -= 380;
                    e.isStaggered = true;
                    e.staggerTimer = 2.0;
                    if (this.game.showDamageNumber) this.game.showDamageNumber(e.mesh.position, 380, true);
                    if (e.hp <= 0 && this.combat.killEnemy) this.combat.killEnemy(e);
                }
            });
        }
        if (this.combat && this.combat.boss && !this.combat.boss.isDead && this.combat.boss.mesh) {
            if (this.combat.boss.mesh.position.distanceTo(blastCenter) < 6.5) {
                this.combat.boss.hp -= 380;
                if (this.game.showDamageNumber) this.game.showDamageNumber(this.combat.boss.mesh.position, 380, true);
                if (this.combat.boss.hp <= 0 && this.combat.killBoss) this.combat.killBoss();
            }
        }

        if (this.game.showNotification) this.game.showNotification("💣 BLACK FIREBOMB DETONATED (380 FIRE DMG)!");
        if (this.audio && this.audio.playTorchIgnite) this.audio.playTorchIgnite();
    }

    applyRingBuffs() {
        if (!this.combat) return;

        // Reset base modifiers
        let hpMultiplier = 1.0;
        let staminaRegenBonus = 0;
        let poiseBonus = 0;

        if (this.equippedRings.includes('favor')) {
            hpMultiplier += 0.20; // +20% HP
        }
        if (this.equippedRings.includes('cloranthy')) {
            staminaRegenBonus += 25; // +25 stam/s
        }
        if (this.equippedRings.includes('wolf_ring')) {
            poiseBonus += 40; // +40 poise
        }

        const baseMaxHp = 1000 + (this.combat.vigor - 10) * 100;
        this.combat.maxHp = Math.round(baseMaxHp * hpMultiplier);
        this.combat.hp = Math.min(this.combat.hp, this.combat.maxHp);
        this.combat.staminaRegenRate = 38 + staminaRegenBonus;
        this.combat.maxPoise = 100 + poiseBonus;
    }

    update(delta) {
        if (this.greenBlossomTimer > 0) {
            this.greenBlossomTimer -= delta;
            if (this.greenBlossomTimer <= 0) {
                this.applyRingBuffs(); // Revert back to normal
            }
        }
    }

    // ------------------------------------------------------------------------
    // RENDERING INVENTORY UI
    // ------------------------------------------------------------------------
    renderUI() {
        // 1. Update Category Tab Buttons
        const tabs = document.querySelectorAll('.inv-cat-tab');
        tabs.forEach(tab => {
            const cat = tab.getAttribute('data-cat');
            if (cat === this.activeCategory) {
                tab.style.background = 'linear-gradient(180deg, #664411 0%, #332205 100%)';
                tab.style.borderColor = '#ffd700';
                tab.style.color = '#fff3a8';
                tab.style.boxShadow = '0 0 10px rgba(255,215,0,0.4)';
            } else {
                tab.style.background = 'rgba(25, 20, 16, 0.7)';
                tab.style.borderColor = '#554433';
                tab.style.color = '#b8a896';
                tab.style.boxShadow = 'none';
            }
        });

        // 2. Render Left Column Items Grid
        const grid = document.getElementById('inv-items-grid');
        if (!grid) return;

        const catItems = Object.values(this.items).filter(i => i.category === this.activeCategory);

        grid.innerHTML = catItems.map(item => {
            const isSelected = item.id === this.selectedItemId;
            let equippedBadge = '';

            if (this.activeCategory === 'weapons' && this.equippedWeapon === item.id) {
                equippedBadge = '<span style="font-size: 0.65rem; color: #86efac; border: 1px solid #4ade80; padding: 2px 6px; border-radius: 9999px; background: rgba(34,197,94,0.2);">EQUIPPED</span>';
            } else if (this.activeCategory === 'armor' && this.equippedArmor === item.id) {
                equippedBadge = '<span style="font-size: 0.65rem; color: #86efac; border: 1px solid #4ade80; padding: 2px 6px; border-radius: 9999px; background: rgba(34,197,94,0.2);">WORN</span>';
            } else if (this.activeCategory === 'rings' && this.equippedRings.includes(item.id)) {
                equippedBadge = '<span style="font-size: 0.65rem; color: #86efac; border: 1px solid #4ade80; padding: 2px 6px; border-radius: 9999px; background: rgba(34,197,94,0.2);">EQUIPPED</span>';
            } else if (this.activeCategory === 'consumables') {
                const count = this.consumableCounts[item.id] || 0;
                equippedBadge = `<span style="font-size: 0.7rem; color: #ffd276; font-weight: 700;">x${count}</span>`;
            }

            const borderCol = isSelected ? '#ffd700' : (equippedBadge ? '#4ade80' : '#443528');
            const bgGradient = isSelected 
                ? 'linear-gradient(145deg, rgba(55, 42, 18, 0.95), rgba(30, 22, 12, 0.95))' 
                : 'linear-gradient(145deg, rgba(24, 18, 14, 0.85), rgba(15, 12, 10, 0.85))';

            return `
                <div class="inv-item-card" onclick="window.inventory.selectItem('${item.id}')" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border: 1.5px solid ${borderCol}; border-radius: 8px; background: ${bgGradient}; cursor: pointer; transition: all 0.15s ease;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 1.8rem;">${item.icon}</span>
                        <div>
                            <div style="font-size: 0.95rem; font-weight: 700; color: ${isSelected ? '#fff3a8' : '#e2e8f0'}; font-family: 'Cinzel', serif;">${item.name}</div>
                            <div style="font-size: 0.72rem; color: #94a3b8;">${item.type}</div>
                        </div>
                    </div>
                    <div>${equippedBadge}</div>
                </div>
            `;
        }).join('');

        // 3. Render Right Column Inspection Box
        const detailPanel = document.getElementById('inv-detail-panel');
        if (!detailPanel) return;

        const sel = this.items[this.selectedItemId] || catItems[0];
        if (!sel) return;

        let actionBtnText = '⚔️ EQUIP WEAPON';
        let actionBtnColor = '#ffd700';
        let actionBtnBg = 'linear-gradient(180deg, #664411 0%, #332205 100%)';
        let isActionDisabled = false;

        if (sel.category === 'weapons') {
            if (this.equippedWeapon === sel.id) {
                actionBtnText = '✅ ALREADY EQUIPPED';
                isActionDisabled = true;
            } else {
                actionBtnText = '⚔️ EQUIP THIS WEAPON';
            }
        } else if (sel.category === 'armor') {
            if (this.equippedArmor === sel.id) {
                actionBtnText = '✅ ALREADY WORN';
                isActionDisabled = true;
            } else {
                actionBtnText = '🛡️ WEAR THIS ARMOR SET';
            }
        } else if (sel.category === 'rings') {
            if (this.equippedRings.includes(sel.id)) {
                actionBtnText = '❌ UNEQUIP RING';
                actionBtnColor = '#f87171';
                actionBtnBg = 'linear-gradient(180deg, #5c1818 0%, #2e0808 100%)';
            } else {
                actionBtnText = '💍 EQUIP THIS RING';
            }
        } else if (sel.category === 'consumables') {
            const count = this.consumableCounts[sel.id] || 0;
            if (count > 0) {
                actionBtnText = `🧪 USE ITEM (Count: ${count})`;
                actionBtnColor = '#4ade80';
                actionBtnBg = 'linear-gradient(180deg, #14532d 0%, #052e16 100%)';
            } else {
                actionBtnText = '❌ DEPLETED (0 REMAINING)';
                isActionDisabled = true;
            }
        } else if (sel.category === 'lore') {
            actionBtnText = '📜 EXAMINE ARTIFACT LORE';
            actionBtnColor = '#38bdf8';
            actionBtnBg = 'linear-gradient(180deg, #0369a1 0%, #082f49 100%)';
        }

        // Stats rows
        const statsHtml = Object.entries(sel.stats || {}).map(([k, v]) => `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(168,121,50,0.2); padding: 5px 0; font-size: 0.8rem;">
                <span style="color: #94a3b8; text-transform: uppercase; font-size: 0.72rem; letter-spacing: 1px;">${k}</span>
                <span style="color: #fef08a; font-weight: 700;">${v}</span>
            </div>
        `).join('');

        detailPanel.innerHTML = `
            <div style="text-align: center; margin-bottom: 14px;">
                <div style="font-size: 3.5rem; margin-bottom: 6px;">${sel.icon}</div>
                <h3 style="margin: 0; color: #fff3a8; font-family: 'Cinzel', serif; font-size: 1.25rem; font-weight: 800;">${sel.name}</h3>
                <div style="font-size: 0.78rem; color: #ffd276; margin-top: 2px;">${sel.type}</div>
            </div>

            <div style="background: rgba(12, 10, 8, 0.7); border: 1px solid #443528; border-radius: 6px; padding: 10px 14px; margin-bottom: 14px;">
                ${statsHtml}
            </div>

            <p style="font-size: 0.82rem; line-height: 1.45; color: #cbd5e1; font-style: italic; margin-bottom: 18px; background: rgba(20, 16, 12, 0.6); border-left: 3px solid #a87932; padding: 8px 12px; border-radius: 0 4px 4px 0;">
                "${sel.desc}"
            </p>

            <button onclick="window.inventory.handleItemAction('${sel.id}')" ${isActionDisabled ? 'disabled' : ''} style="width: 100%; padding: 12px; font-weight: 800; font-family: 'Cinzel', serif; font-size: 0.95rem; border: 1.5px solid ${actionBtnColor}; color: #fff3a8; background: ${actionBtnBg}; border-radius: 6px; cursor: ${isActionDisabled ? 'not-allowed' : 'pointer'}; opacity: ${isActionDisabled ? '0.6' : '1.0'}; box-shadow: 0 0 15px rgba(255,215,0,0.3);">
                ${actionBtnText}
            </button>
        `;

        // 4. Update Footer Equipped Summary Bar
        const footerBar = document.getElementById('inv-equipped-summary');
        if (footerBar) {
            const wpn = this.items[this.equippedWeapon] || this.items.sword;
            const arm = this.items[this.equippedArmor] || this.items.warrior;
            const r1 = this.items[this.equippedRings[0]] || { name: 'Empty', icon: '💍' };
            const r2 = this.items[this.equippedRings[1]] || { name: 'Empty', icon: '💍' };

            footerBar.innerHTML = `
                <div style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; font-size: 0.78rem;">
                    <div><span style="color: #94a3b8;">WEAPON:</span> <strong style="color: #ffd778;">${wpn.icon} ${wpn.name}</strong></div>
                    <div><span style="color: #94a3b8;">ARMOR:</span> <strong style="color: #86efac;">${arm.icon} ${arm.name}</strong></div>
                    <div><span style="color: #94a3b8;">RING 1:</span> <strong style="color: #80d8ff;">${r1.icon} ${r1.name}</strong></div>
                    <div><span style="color: #94a3b8;">RING 2:</span> <strong style="color: #80d8ff;">${r2.icon} ${r2.name}</strong></div>
                </div>
            `;
        }
    }

    // ------------------------------------------------------------------------
    // PERSISTENCE (SAVE / LOAD)
    // ------------------------------------------------------------------------
    save() {
        const data = {
            equippedWeapon: this.equippedWeapon,
            equippedArmor: this.equippedArmor,
            equippedRings: this.equippedRings,
            consumableCounts: this.consumableCounts
        };
        try {
            localStorage.setItem('ds_inventory_v1', JSON.stringify(data));
        } catch (e) {}
    }

    load() {
        try {
            const raw = localStorage.getItem('ds_inventory_v1');
            if (raw) {
                const data = JSON.parse(raw);
                if (data.equippedWeapon) this.equippedWeapon = data.equippedWeapon;
                if (data.equippedArmor) this.equippedArmor = data.equippedArmor;
                if (Array.isArray(data.equippedRings)) this.equippedRings = data.equippedRings;
                if (data.consumableCounts) this.consumableCounts = Object.assign(this.consumableCounts, data.consumableCounts);
            }
        } catch (e) {}
    }
}

// Global exposure
if (typeof window !== 'undefined') {
    window.DarkSoulsInventory = DarkSoulsInventory;
}
