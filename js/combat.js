// ==========================================
// DARK SOULS COMBAT & ENEMY AI ENGINE
// Precise soulslike stamina, i-frames, parry, riposte, boss phases
// ==========================================

class DarkSoulsCombat {
    constructor(game) {
        this.game = game;
        this.world = game.world;
        this.audio = window.dsAudio;

        // Player Core Attributes
        this.level = 1;
        this.vigor = 10;
        this.endurance = 10;
        this.strength = 10;

        this.maxHp = 1000;
        this.hp = 1000;
        this.maxStamina = 100;
        this.stamina = 100;
        this.staminaRegenRate = 38; // per second
        this.staminaDelay = 0;

        this.estusFlasks = 5;
        this.maxEstus = 5;
        this.souls = 0;
        this.bloodstain = null; // Stored souls on death

        // Combat Stances & States
        this.isAttacking = false;
        this.attackCombo = 0; // 0: none, 1: slash1, 2: slash2, 3: heavy
        this.attackTime = 0;
        this.isBlocking = false;
        this.isParrying = false;
        this.parryTime = 0;
        this.isRolling = false;
        this.isBackstep = false;
        this.rollTime = 0;
        this.rollDir = new THREE.Vector3();
        this.isInvincible = false;
        this.isDrinkingEstus = false;
        this.estusTime = 0;
        this.isStaggered = false;
        this.staggerTime = 0;
        this.isDead = false;
        this.isPlungingAttack = false;
        this.guardCounterWindow = 0;

        // Poise & Stagger System (15 pts/sec regen after 3s; 0 poise breaks guard for 2.2s)
        this.maxPoise = 100;
        this.poise = 100;
        this.poiseRegenDelay = 0;

        // Active Frames (Parry window = 4 frames; Roll i-frames = 12 frames)
        this.parryStartup = 2 / 60; // 2 frames startup (~0.0333s)
        this.parryActiveDuration = 4 / 60; // strictly 4 frames active window (~0.0667s)
        this.rollIFramesDuration = 12 / 60; // strictly 12 frames (0.20s)

        // Input Buffering (Queue 1 action up to 150ms before animation ends)
        this.inputBuffer = null;
        this.bufferTimer = 0;

        // Enemies & Boss Roster (5 Iconic Dark Souls Bosses)
        this.enemies = [];
        this.boss = null;
        this.lockedTarget = null;
        this.currentBossType = 'asylum';
        this.defeatedBosses = [];
        this.adminModeUnlocked = (localStorage.getItem('darksouls_admin_mode') === 'true');
        this.isGodMode = false;

        // Physical Ballistic Arrows & Articulated Ragdolls Engine
        this.arrows = [];
        this.ragdolls = [];

        // Poison, Toxic & Status Effect Engine
        this.isPoisoned = false;
        this.poisonTimer = 0;
        this.poisonTickTimer = 0;
        this.poisonBuildup = 0;
        this.maxPoisonBuildup = 100;
        this.isPetrified = false;

        // Weapon Arsenal System (6 Distinct Weapons)
        this.weapons = {
            sword: {
                id: 'sword',
                name: 'Astora Straight Sword',
                type: 'Straight Sword',
                icon: '⚔️',
                desc: 'Balanced divine straight sword. Fast responsive slashes with moderate stamina cost.',
                lightDmg: 150,
                heavyDmg: 280,
                reach: 2.8,
                bossReachBonus: 1.8,
                lightStamina: 20,
                heavyStamina: 34,
                speedMultiplier: 1.0,
                poiseBreak: 1.0,
                cost: 0,
                unlocked: true
            },
            zweihander: {
                id: 'zweihander',
                name: 'Zweihander',
                type: 'Ultra Greatsword',
                icon: '🗡️',
                desc: 'Colossal two-handed greatsword. Massive reach, obliterates enemy poise, and flattens hollows.',
                lightDmg: 260,
                heavyDmg: 490,
                reach: 4.4,
                bossReachBonus: 3.2,
                lightStamina: 35,
                heavyStamina: 52,
                speedMultiplier: 0.8,
                poiseBreak: 2.8,
                cost: 2500,
                unlocked: false
            },
            uchigatana: {
                id: 'uchigatana',
                name: 'Uchigatana',
                type: 'Katana',
                icon: '🎌',
                desc: 'Deft eastern curved blade. Ultra-swift lacerating slashes and high critical backstab damage.',
                lightDmg: 175,
                heavyDmg: 320,
                reach: 3.2,
                bossReachBonus: 2.2,
                lightStamina: 15,
                heavyStamina: 26,
                speedMultiplier: 1.35,
                poiseBreak: 0.9,
                cost: 3500,
                unlocked: false
            },
            halberd: {
                id: 'halberd',
                name: 'Black Knight Halberd',
                type: 'Polearm',
                icon: '🔱',
                desc: 'Demon-hunting halberd. Extreme striking reach lets you cleave enemies from safe distance.',
                lightDmg: 210,
                heavyDmg: 390,
                reach: 4.8,
                bossReachBonus: 3.8,
                lightStamina: 26,
                heavyStamina: 42,
                speedMultiplier: 0.95,
                poiseBreak: 1.8,
                cost: 5000,
                unlocked: false
            },
            dragontooth: {
                id: 'dragontooth',
                name: 'Dragon Tooth',
                type: 'Great Hammer',
                icon: '🦴',
                desc: 'Colossal prehistoric dragon tooth club. Crushing blunt impacts trigger ground shockwaves.',
                lightDmg: 310,
                heavyDmg: 580,
                reach: 3.9,
                bossReachBonus: 2.9,
                lightStamina: 44,
                heavyStamina: 62,
                speedMultiplier: 0.72,
                poiseBreak: 3.4,
                cost: 6500,
                unlocked: false
            },
            moonlight: {
                id: 'moonlight',
                name: 'Moonlight Greatsword',
                type: 'Sorcery Greatsword',
                icon: '✨',
                desc: 'Seath the Scaleless\'s luminous crystal relic. Heavy attack unleashes glowing crescent moonlight wave.',
                lightDmg: 230,
                heavyDmg: 440,
                reach: 4.0,
                bossReachBonus: 3.0,
                lightStamina: 24,
                heavyStamina: 38,
                speedMultiplier: 1.05,
                poiseBreak: 1.9,
                cost: 10000,
                unlocked: false
            },
            torch: {
                id: 'torch',
                name: 'Lordran Pitch Torch',
                type: 'Torch / Flame Weapon',
                icon: '🔥',
                desc: 'Pitch-soaked iron-bound torch. Illuminates darkness, inflicts 165+ fire damage, and sets targets ablaze with burning fire over time.',
                lightDmg: 165,
                heavyDmg: 310,
                reach: 2.8,
                bossReachBonus: 1.9,
                lightStamina: 16,
                heavyStamina: 28,
                speedMultiplier: 1.25,
                poiseBreak: 1.3,
                cost: 400,
                unlocked: true
            },
            quill_of_default: {
                id: 'quill_of_default',
                name: 'Quill of Default',
                type: 'Thrusting Rapier (The Sunken Liturgy)',
                icon: '✒️',
                desc: 'Needle-thin rapier forged from midnight steel and abyssal void ink by the Order of the Blank Page. Pierces all armor and writes default decay into Auditors.',
                lightDmg: 245,
                heavyDmg: 460,
                reach: 3.8,
                bossReachBonus: 2.6,
                lightStamina: 14,
                heavyStamina: 24,
                speedMultiplier: 1.45,
                poiseBreak: 1.3,
                cost: 0,
                unlocked: true
            },
            bailiff_gavel: {
                id: 'bailiff_gavel',
                name: "Bailiff's Gavel of Foreclosure",
                type: 'Great Hammer (The Sunken Liturgy)',
                icon: '🔨',
                desc: 'Colossal brass gavel stamped with the seal of arrears. Heavy strikes shatter poise and trigger ground shockwaves of compounding interest.',
                lightDmg: 340,
                heavyDmg: 640,
                reach: 4.2,
                bossReachBonus: 3.2,
                lightStamina: 38,
                heavyStamina: 56,
                speedMultiplier: 0.85,
                poiseBreak: 3.8,
                cost: 0,
                unlocked: true
            },
            scales_of_surety: {
                id: 'scales_of_surety',
                name: 'The Scales of Surety',
                type: 'Twin Balance Scythes (The Sunken Liturgy)',
                icon: '⚖️',
                desc: 'Linked curved balance blades forged from the scales of the First Arbiters. Equalizes damage dealt to all nearby enemies with high critical strike multipliers.',
                lightDmg: 230,
                heavyDmg: 430,
                reach: 3.6,
                bossReachBonus: 2.4,
                lightStamina: 16,
                heavyStamina: 28,
                speedMultiplier: 1.32,
                poiseBreak: 1.7,
                cost: 0,
                unlocked: true
            },
            rivers_of_blood: {
                id: 'rivers_of_blood',
                name: 'Rivers of Blood',
                type: 'Cursed Katana',
                icon: '🩸',
                desc: 'Cursed red-metal katana of Okina. Rapid consecutive Corpse Piler blood slashes that cause massive hemorrhaging and ignite scarlet blood-flame.',
                lightDmg: 215,
                heavyDmg: 395,
                reach: 3.6,
                bossReachBonus: 2.5,
                lightStamina: 16,
                heavyStamina: 28,
                speedMultiplier: 1.45,
                poiseBreak: 1.4,
                cost: 8000,
                unlocked: false
            },
            dark_moon_greatsword: {
                id: 'dark_moon_greatsword',
                name: 'Dark Moon Greatsword',
                type: 'Lunar Frost Greatsword',
                icon: '🌙',
                desc: 'Lunar ceremonial greatsword gifted by Ranni the Witch. Heavy attacks unleash freezing waves of moonlight rime and shatter poise.',
                lightDmg: 280,
                heavyDmg: 520,
                reach: 4.4,
                bossReachBonus: 3.2,
                lightStamina: 28,
                heavyStamina: 46,
                speedMultiplier: 1.0,
                poiseBreak: 2.4,
                cost: 12000,
                unlocked: false
            },
            moonveil: {
                id: 'moonveil',
                name: 'Moonveil Katana',
                type: 'Magic Katana',
                icon: '🌌',
                desc: 'Forged of glintstone ore. Transient Moonlight stance hurls blinding horizontal slashes of blue starlight.',
                lightDmg: 240,
                heavyDmg: 460,
                reach: 3.5,
                bossReachBonus: 2.6,
                lightStamina: 18,
                heavyStamina: 30,
                speedMultiplier: 1.4,
                poiseBreak: 1.8,
                cost: 9000,
                unlocked: false
            },
            blasphemous_blade: {
                id: 'blasphemous_blade',
                name: 'Blasphemous Blade',
                type: 'Magma Greatsword',
                icon: '🔥',
                desc: 'Sacred sword squirming with living writhing corpses. Taker\'s Flames unleashes a wave of golden red fire that steals life.',
                lightDmg: 290,
                heavyDmg: 540,
                reach: 4.2,
                bossReachBonus: 3.2,
                lightStamina: 28,
                heavyStamina: 48,
                speedMultiplier: 0.95,
                poiseBreak: 2.6,
                cost: 13500,
                unlocked: false
            },
            starscourge_greatswords: {
                id: 'starscourge_greatswords',
                name: 'Starscourge Greatswords',
                type: 'Colossal Gravity Blades',
                icon: '☄️',
                desc: 'Curved black iron greatswords wielded by General Radahn. Starcaller Cry pulls nearby enemies in with overwhelming gravitational force.',
                lightDmg: 330,
                heavyDmg: 620,
                reach: 4.5,
                bossReachBonus: 3.5,
                lightStamina: 38,
                heavyStamina: 58,
                speedMultiplier: 0.82,
                poiseBreak: 3.2,
                cost: 16000,
                unlocked: false
            },
            godslayer_greatsword: {
                id: 'godslayer_greatsword',
                name: 'Godslayer\'s Greatsword',
                type: 'Colossal Black Flame Sword',
                icon: '🖤',
                desc: 'Spiral colossal sword of the Gloam-Eyed Queen. Imbued with the God-Slaying Black Flame that sears away divine flesh.',
                lightDmg: 285,
                heavyDmg: 530,
                reach: 4.6,
                bossReachBonus: 3.4,
                lightStamina: 32,
                heavyStamina: 50,
                speedMultiplier: 0.92,
                poiseBreak: 2.7,
                cost: 14000,
                unlocked: false
            },
            bloodhounds_fang: {
                id: 'bloodhounds_fang',
                name: 'Bloodhound\'s Fang',
                type: 'Curved Greatsword',
                icon: '🐺',
                desc: 'Curved greatsword with gently undulating blade. Bloodhound\'s Finesse performs a vaulting upward slash and backward somersault.',
                lightDmg: 250,
                heavyDmg: 470,
                reach: 4.0,
                bossReachBonus: 2.8,
                lightStamina: 24,
                heavyStamina: 40,
                speedMultiplier: 1.12,
                poiseBreak: 2.2,
                cost: 8500,
                unlocked: false
            },
            mortal_blade: {
                id: 'mortal_blade',
                name: 'Mortal Blade (Gift of Tears)',
                type: 'Immortal Severing Odachi',
                icon: '👺',
                desc: 'Crimson odachi capable of severing the undying. Mortal Draw cuts the fabric of life itself with miasmic scarlet vapors.',
                lightDmg: 320,
                heavyDmg: 590,
                reach: 4.7,
                bossReachBonus: 3.6,
                lightStamina: 30,
                heavyStamina: 52,
                speedMultiplier: 1.05,
                poiseBreak: 3.0,
                cost: 18000,
                unlocked: false
            },
            kusabimaru: {
                id: 'kusabimaru',
                name: 'Kusabimaru',
                type: 'Shinobi Katana',
                icon: '🥷',
                desc: 'Passed down to the Wolf by Kuro. Built for rhythmic deflections, razor-fast posture damage, and instant deathblows.',
                lightDmg: 185,
                heavyDmg: 340,
                reach: 3.3,
                bossReachBonus: 2.3,
                lightStamina: 14,
                heavyStamina: 24,
                speedMultiplier: 1.5,
                poiseBreak: 2.0,
                cost: 6000,
                unlocked: false
            },
            chikage: {
                id: 'chikage',
                name: 'Chikage',
                type: 'Vileblood Katana',
                icon: '🩸',
                desc: 'Foreign blade wielded by the Royal Guards of Cainhurst. Sheathed in cursed blood that corrodes enemies upon drawing.',
                lightDmg: 235,
                heavyDmg: 430,
                reach: 3.4,
                bossReachBonus: 2.4,
                lightStamina: 16,
                heavyStamina: 28,
                speedMultiplier: 1.38,
                poiseBreak: 1.5,
                cost: 9500,
                unlocked: false
            },
            rakuyo: {
                id: 'rakuyo',
                name: 'Rakuyo',
                type: 'Twin Blades',
                icon: '🪶',
                desc: 'Trick sword wielded by Lady Maria of the Astral Clocktower. Splits into sabre and dagger with breathtaking acrobatic dancing spins.',
                lightDmg: 220,
                heavyDmg: 410,
                reach: 3.5,
                bossReachBonus: 2.5,
                lightStamina: 15,
                heavyStamina: 26,
                speedMultiplier: 1.45,
                poiseBreak: 1.3,
                cost: 11000,
                unlocked: false
            },
            whirligig_saw: {
                id: 'whirligig_saw',
                name: 'Whirligig Saw',
                type: 'Trick Serrated Saw',
                icon: '⚙️',
                desc: 'Workshop trick weapon mounting massive rotating circular saw blades. Shreds beast hides into ribbons with unending grinding teeth.',
                lightDmg: 275,
                heavyDmg: 510,
                reach: 3.8,
                bossReachBonus: 2.8,
                lightStamina: 26,
                heavyStamina: 44,
                speedMultiplier: 1.0,
                poiseBreak: 2.8,
                cost: 10500,
                unlocked: false
            },
            holy_moonlight_sword: {
                id: 'holy_moonlight_sword',
                name: 'Holy Moonlight Sword',
                type: 'Cosmic Greatsword',
                icon: '🌕',
                desc: 'Ludwig\'s guiding moonlight relic from the cosmos. Radiates eldritch blue light and releases concentrated shockwaves of abyss-cleansing radiance.',
                lightDmg: 295,
                heavyDmg: 550,
                reach: 4.3,
                bossReachBonus: 3.3,
                lightStamina: 27,
                heavyStamina: 46,
                speedMultiplier: 1.02,
                poiseBreak: 2.6,
                cost: 15000,
                unlocked: false
            },
            dragonslayer_greataxe: {
                id: 'dragonslayer_greataxe',
                name: 'Dragonslayer Greataxe',
                type: 'Heavy Greataxe',
                icon: '🪓',
                desc: 'Melted iron greataxe once wielded by the Dragonslayer Armour. Lightning Slam crashes down with violent electrical shockwaves.',
                lightDmg: 325,
                heavyDmg: 610,
                reach: 3.9,
                bossReachBonus: 3.0,
                lightStamina: 36,
                heavyStamina: 56,
                speedMultiplier: 0.85,
                poiseBreak: 3.3,
                cost: 13000,
                unlocked: false
            },
            black_knight_halberd: {
                id: 'black_knight_halberd',
                name: 'Black Knight Glaive',
                type: 'Heavy Polearm',
                icon: '⚔️',
                desc: 'Glaive of the Black Knights who burned facing the Chaos demons. Exceptional vertical chop and wide spin sweep.',
                lightDmg: 265,
                heavyDmg: 480,
                reach: 5.0,
                bossReachBonus: 4.0,
                lightStamina: 27,
                heavyStamina: 44,
                speedMultiplier: 0.98,
                poiseBreak: 2.4,
                cost: 11500,
                unlocked: false
            },
            chaos_blade: {
                id: 'chaos_blade',
                name: 'Chaos Blade',
                type: 'Demonic Katana',
                icon: '🥀',
                desc: 'Born from the soul of the Bed of Chaos. Feeds on the wielder\'s humanity and lifeblood to deliver blistering lacerating slashes.',
                lightDmg: 245,
                heavyDmg: 450,
                reach: 3.5,
                bossReachBonus: 2.5,
                lightStamina: 17,
                heavyStamina: 29,
                speedMultiplier: 1.35,
                poiseBreak: 1.6,
                cost: 10000,
                unlocked: false
            },
            fume_ultra_greatsword: {
                id: 'fume_ultra_greatsword',
                name: 'Fume Ultra Greatsword (FUGS)',
                type: 'Colossal Slab Greatsword',
                icon: '⬛',
                desc: 'Raime\'s colossal black stone slab. Doubles as an impenetrable tower shield while crushing enemies into the earth.',
                lightDmg: 340,
                heavyDmg: 640,
                reach: 4.6,
                bossReachBonus: 3.5,
                lightStamina: 42,
                heavyStamina: 64,
                speedMultiplier: 0.75,
                poiseBreak: 3.8,
                cost: 17500,
                unlocked: false
            },
            greatsword_of_artorias: {
                id: 'greatsword_of_artorias',
                name: 'Greatsword of Artorias',
                type: 'Abyssal Greatsword',
                icon: '🛡️',
                desc: 'Sword of the legendary Abysswalker. Blessed with divine power to vanquish creatures born of the dark abyss with front-flipping somersault slashes.',
                lightDmg: 270,
                heavyDmg: 500,
                reach: 4.1,
                bossReachBonus: 3.1,
                lightStamina: 25,
                heavyStamina: 42,
                speedMultiplier: 1.05,
                poiseBreak: 2.3,
                cost: 12500,
                unlocked: false
            },
            sunlight_straight_sword: {
                id: 'sunlight_straight_sword',
                name: 'Sunlight Straight Sword',
                type: 'Faith Straight Sword',
                icon: '☀️',
                desc: 'Solaire of Astora\'s personal sword. Imbued with the incandescent blessings of the Sun, boosting attack power and allies\' morale.',
                lightDmg: 195,
                heavyDmg: 360,
                reach: 3.0,
                bossReachBonus: 2.0,
                lightStamina: 18,
                heavyStamina: 30,
                speedMultiplier: 1.2,
                poiseBreak: 1.4,
                cost: 4500,
                unlocked: false
            },
            eleonoras_poleblade: {
                id: 'eleonoras_poleblade',
                name: 'Eleonora\'s Poleblade',
                type: 'Bloodflame Twinblade',
                icon: '🩸',
                desc: 'Curved twinned blades forged of scorched red steel. Bloodblade Dance launches into whirling multi-hit airborne twirls bathed in bloodflame.',
                lightDmg: 230,
                heavyDmg: 420,
                reach: 3.7,
                bossReachBonus: 2.7,
                lightStamina: 18,
                heavyStamina: 32,
                speedMultiplier: 1.4,
                poiseBreak: 1.7,
                cost: 9500,
                unlocked: false
            },
            bolt_of_gransax: {
                id: 'bolt_of_gransax',
                name: 'Bolt of Gransax',
                type: 'Ancient Dragon Spear',
                icon: '⚡',
                desc: 'Whittled from a colossal spear hurled by Gransax against Leyndell. Ancient Lightning Spear hurls crimson dragon lightning across the battlefield.',
                lightDmg: 260,
                heavyDmg: 490,
                reach: 5.2,
                bossReachBonus: 4.2,
                lightStamina: 26,
                heavyStamina: 44,
                speedMultiplier: 1.1,
                poiseBreak: 2.1,
                cost: 14500,
                unlocked: false
            },
            giant_crusher: {
                id: 'giant_crusher',
                name: 'Giant-Crusher',
                type: 'Colossal Boulder Hammer',
                icon: '🗿',
                desc: 'A massive chunk of pure solid bedrock shaped into an immense hammer. Pulverizes any foe\'s posture in a single seismic overhead strike.',
                lightDmg: 350,
                heavyDmg: 660,
                reach: 4.0,
                bossReachBonus: 3.0,
                lightStamina: 46,
                heavyStamina: 68,
                speedMultiplier: 0.7,
                poiseBreak: 4.0,
                cost: 15500,
                unlocked: false
            },
            claymore: {
                id: 'claymore',
                name: 'Baemore Claymore',
                type: 'Standard Greatsword',
                icon: '🗡️',
                desc: 'The timeless greatsword of champions. Renowned for its sweeping wide cleaves and deadly piercing thrust attacks with superior recovery.',
                lightDmg: 220,
                heavyDmg: 410,
                reach: 3.8,
                bossReachBonus: 2.8,
                lightStamina: 22,
                heavyStamina: 36,
                speedMultiplier: 1.1,
                poiseBreak: 2.0,
                cost: 2000,
                unlocked: false
            },
            hand_of_malenia: {
                id: 'hand_of_malenia',
                name: 'Hand of Malenia',
                type: 'Scarlet Valkyrie Katana',
                icon: '🌸',
                desc: 'Waterfowl Dance rapid aerial slashes that carve through enemy defense with blinding speed.',
                lightDmg: 290,
                heavyDmg: 540,
                reach: 4.1,
                bossReachBonus: 3.1,
                lightStamina: 18,
                heavyStamina: 30,
                speedMultiplier: 1.45,
                poiseBreak: 1.8,
                cost: 16500,
                unlocked: false
            },
            sacred_relic_sword: {
                id: 'sacred_relic_sword',
                name: 'Sacred Relic Sword',
                type: 'Golden Relic Greatsword',
                icon: '🌟',
                desc: 'Wave of Gold unleashes a monumental sweeping carpet of pure golden starlight across the arena.',
                lightDmg: 310,
                heavyDmg: 580,
                reach: 4.5,
                bossReachBonus: 3.5,
                lightStamina: 26,
                heavyStamina: 44,
                speedMultiplier: 1.05,
                poiseBreak: 2.8,
                cost: 18000,
                unlocked: false
            },
            moonlight_butterfly_horn: {
                id: 'moonlight_butterfly_horn',
                name: 'Moonlight Butterfly Horn',
                type: 'Pure Magic Spear',
                icon: '🦋',
                desc: 'Spiral translucent crystal horn piercing straight through physical armor with pure magic damage.',
                lightDmg: 230,
                heavyDmg: 430,
                reach: 4.9,
                bossReachBonus: 3.9,
                lightStamina: 20,
                heavyStamina: 34,
                speedMultiplier: 1.25,
                poiseBreak: 1.6,
                cost: 8000,
                unlocked: false
            },
            dragon_king_greataxe: {
                id: 'dragon_king_greataxe',
                name: 'Dragon King Greataxe',
                type: 'Prehistoric Greataxe',
                icon: '🪓',
                desc: 'Carved from the tail of the Gaping Dragon. Massive seismic earth shockwave on heavy strikes.',
                lightDmg: 340,
                heavyDmg: 630,
                reach: 4.0,
                bossReachBonus: 3.0,
                lightStamina: 42,
                heavyStamina: 62,
                speedMultiplier: 0.78,
                poiseBreak: 3.6,
                cost: 14000,
                unlocked: false
            },
            smoughs_great_hammer: {
                id: 'smoughs_great_hammer',
                name: "Smough's Great Hammer",
                type: 'Gilded Colossal Hammer',
                icon: '🔨',
                desc: 'Massive gilded executioner hammer. Pulverizes poise and restores health upon impact.',
                lightDmg: 360,
                heavyDmg: 680,
                reach: 4.2,
                bossReachBonus: 3.2,
                lightStamina: 48,
                heavyStamina: 70,
                speedMultiplier: 0.68,
                poiseBreak: 4.2,
                cost: 17000,
                unlocked: false
            },
            dragonslayer_spear: {
                id: 'dragonslayer_spear',
                name: "Ornstein's Dragonslayer Spear",
                type: 'Cross Spear / Lightning',
                icon: '🔱',
                desc: 'Cross-bladed lightning spear used by the Dragonslayer captain to impale airborne dragons.',
                lightDmg: 275,
                heavyDmg: 510,
                reach: 5.1,
                bossReachBonus: 4.1,
                lightStamina: 25,
                heavyStamina: 42,
                speedMultiplier: 1.15,
                poiseBreak: 2.2,
                cost: 13500,
                unlocked: false
            },
            lifehunt_scythe: {
                id: 'lifehunt_scythe',
                name: "Priscilla's Lifehunt Scythe",
                type: 'Occult Bleed Scythe',
                icon: '🌾',
                desc: 'Scythe of the Crossbreed that reaps the life of Gods. Inflicts devastating rapid hemorrhaging.',
                lightDmg: 285,
                heavyDmg: 530,
                reach: 4.3,
                bossReachBonus: 3.3,
                lightStamina: 24,
                heavyStamina: 40,
                speedMultiplier: 1.25,
                poiseBreak: 2.3,
                cost: 12000,
                unlocked: false
            },
            ringed_knight_paired: {
                id: 'ringed_knight_paired',
                name: 'Ringed Knight Paired Greatswords',
                type: 'Dual Blazing Colossal Swords',
                icon: '⚔️',
                desc: 'Twinned abyssal iron swords forged in the Abyss. Leaping dual thrusts ignited with black-red embers.',
                lightDmg: 350,
                heavyDmg: 660,
                reach: 4.6,
                bossReachBonus: 3.6,
                lightStamina: 44,
                heavyStamina: 66,
                speedMultiplier: 0.85,
                poiseBreak: 3.7,
                cost: 19000,
                unlocked: false
            },
            friedes_scythe: {
                id: 'friedes_scythe',
                name: "Sister Friede's Great Scythe",
                type: 'Frost & Blackflame Scythe',
                icon: '❄️',
                desc: 'Dual scythes unleashing chilling waves of frost rime and leaping blackflame slashes.',
                lightDmg: 270,
                heavyDmg: 495,
                reach: 4.2,
                bossReachBonus: 3.2,
                lightStamina: 20,
                heavyStamina: 36,
                speedMultiplier: 1.35,
                poiseBreak: 2.0,
                cost: 15000,
                unlocked: false
            },
            frayed_blade: {
                id: 'frayed_blade',
                name: "Midir's Frayed Blade",
                type: 'Abyssal Dragon Katana',
                icon: '🐉',
                desc: 'Born of the Darkeater Midir. Hold stance to fire shockwaves of black void lightning.',
                lightDmg: 280,
                heavyDmg: 520,
                reach: 3.8,
                bossReachBonus: 2.8,
                lightStamina: 18,
                heavyStamina: 30,
                speedMultiplier: 1.45,
                poiseBreak: 2.1,
                cost: 17500,
                unlocked: false
            },
            carian_knights_sword: {
                id: 'carian_knights_sword',
                name: "Carian Knight's Sword",
                type: 'Glintstone Straight Sword',
                icon: '🗡️',
                desc: 'Straight sword of the enchanted royal Carian knights. Imbued with luminous glintstone starlight sorcery.',
                lightDmg: 245,
                heavyDmg: 460,
                reach: 3.2,
                bossReachBonus: 2.2,
                lightStamina: 16,
                heavyStamina: 28,
                speedMultiplier: 1.32,
                poiseBreak: 1.7,
                cost: 11000,
                unlocked: false
            },
            wing_of_astel: {
                id: 'wing_of_astel',
                name: 'Wing of Astel',
                type: 'Cosmic Curved Sword',
                icon: '🦋',
                desc: 'Fashioned from the delicate wing of a voidborn malformed star. Emits Nebula cosmic starlight detonations.',
                lightDmg: 260,
                heavyDmg: 490,
                reach: 3.3,
                bossReachBonus: 2.3,
                lightStamina: 15,
                heavyStamina: 26,
                speedMultiplier: 1.48,
                poiseBreak: 1.8,
                cost: 13500,
                unlocked: false
            },
            reduvia: {
                id: 'reduvia',
                name: 'Reduvia Blood Dagger',
                type: 'Occult Dagger',
                icon: '🩸',
                desc: 'Jagged sacrificial dagger used by bloody fingers. Hurls razor-sharp projectiles of airborne cursed blood.',
                lightDmg: 210,
                heavyDmg: 390,
                reach: 2.6,
                bossReachBonus: 1.8,
                lightStamina: 10,
                heavyStamina: 18,
                speedMultiplier: 1.75,
                poiseBreak: 1.4,
                cost: 9500,
                unlocked: false
            },
            magma_wyrm_scalesword: {
                id: 'magma_wyrm_scalesword',
                name: "Magma Wyrm's Scalesword",
                type: 'Curved Greatsword',
                icon: '🌋',
                desc: 'Curved greatsword crafted from the molten jaw of a Magma Wyrm. Leaves pools of boiling incandescent magma.',
                lightDmg: 310,
                heavyDmg: 580,
                reach: 4.1,
                bossReachBonus: 3.0,
                lightStamina: 24,
                heavyStamina: 40,
                speedMultiplier: 1.14,
                poiseBreak: 2.6,
                cost: 15000,
                unlocked: false
            },
            profaned_greatsword: {
                id: 'profaned_greatsword',
                name: 'Profaned Greatsword of Sulyvahn',
                type: 'Colossal Flame Greatsword',
                icon: '🔥',
                desc: 'Greatsword wielded in the right hand of Pontiff Sulyvahn. Imbued with the eternal slumbering fire of the Profaned Flame.',
                lightDmg: 325,
                heavyDmg: 610,
                reach: 4.4,
                bossReachBonus: 3.2,
                lightStamina: 26,
                heavyStamina: 44,
                speedMultiplier: 1.10,
                poiseBreak: 2.8,
                cost: 16500,
                unlocked: false
            },
            greatsword_of_judgment: {
                id: 'greatsword_of_judgment',
                name: 'Greatsword of Judgment',
                type: 'Dark Sorcery Greatsword',
                icon: '⚖️',
                desc: 'Greatsword wielded in the left hand of Pontiff Sulyvahn. Reflects the dark magic of the moon in deeper, darker hues.',
                lightDmg: 315,
                heavyDmg: 590,
                reach: 4.3,
                bossReachBonus: 3.1,
                lightStamina: 25,
                heavyStamina: 42,
                speedMultiplier: 1.15,
                poiseBreak: 2.7,
                cost: 16000,
                unlocked: false
            },
            mornes_great_hammer: {
                id: 'mornes_great_hammer',
                name: "Morne's Great Hammer",
                type: 'Greathammer of Wrath',
                icon: '🔨',
                desc: 'Colossal greathammer bestowed upon the Knights of Carim. Unstoppable poise and devastating wrathful shockwaves.',
                lightDmg: 350,
                heavyDmg: 660,
                reach: 4.2,
                bossReachBonus: 3.2,
                lightStamina: 30,
                heavyStamina: 50,
                speedMultiplier: 0.98,
                poiseBreak: 3.3,
                cost: 18000,
                unlocked: false
            },
            paladin_grant: {
                id: 'paladin_grant',
                name: "Grant &bull; Paladin Leeroy's Hammer",
                type: 'Holy Great Hammer',
                icon: '⛪',
                desc: 'Legendary sanctified hammer of Paladin Leeroy of the Way of White. Infused with wrath of the gods holy shockwaves.',
                lightDmg: 340,
                heavyDmg: 640,
                reach: 4.1,
                bossReachBonus: 3.1,
                lightStamina: 28,
                heavyStamina: 48,
                speedMultiplier: 1.02,
                poiseBreak: 3.1,
                cost: 17000,
                unlocked: false
            },
            smouldering_demon_greataxe: {
                id: 'smouldering_demon_greataxe',
                name: "Demon's Greataxe",
                type: 'Chaos Greataxe',
                icon: '🪓',
                desc: 'Hefty stone greataxe born of the Demon Firesage. Highest physical strength requirement and crushing power in Lordran.',
                lightDmg: 360,
                heavyDmg: 680,
                reach: 4.0,
                bossReachBonus: 3.0,
                lightStamina: 32,
                heavyStamina: 52,
                speedMultiplier: 0.95,
                poiseBreak: 3.4,
                cost: 18500,
                unlocked: false
            },
            mohgwyn_sacred_spear: {
                id: 'mohgwyn_sacred_spear',
                name: "Mohgwyn's Sacred Spear",
                type: 'Blood Great Spear',
                icon: '🔱',
                desc: 'Trident of the Lord of Blood. Thrust into the Mother of Truth to cause torrential downpours of burning bloodflame.',
                lightDmg: 300,
                heavyDmg: 560,
                reach: 4.6,
                bossReachBonus: 3.5,
                lightStamina: 22,
                heavyStamina: 36,
                speedMultiplier: 1.22,
                poiseBreak: 2.4,
                cost: 19000,
                unlocked: false
            }
        };
        this.currentWeaponId = 'sword';
        this.unlockedWeapons = ['sword', 'torch', 'quill_of_default', 'bailiff_gavel', 'scales_of_surety'];
        this.charcoalResinTimer = 0;
        this.projectiles = [];

        // ----------------------------------------------------
        // SOULSBORNE MAGIC GRIMOIRE & SPELLCASTING SYSTEM (12 SPELLS)
        // ----------------------------------------------------
        this.currentSpellId = 'soul_arrow';
        this.unlockedSpells = [
            'soul_arrow',
            'heavy_soul_arrow',
            'crystal_homing',
            'soul_spear',
            'comet_azur',
            'sunlight_spear',
            'lightning_stake',
            'chaos_fireball',
            'firestorm',
            'black_flame',
            'wrath_of_gods',
            'bloodflame_talons',
            'stars_of_ruin',
            'cannon_of_haima',
            'fortissax_lightning',
            'giantsflame_take_thee',
            'flame_grant_strength',
            'dark_bead',
            'frenzied_burst',
            'elden_stars'
        ];
        // ----------------------------------------------------
        // SOULSBORNE RINGS & TALISMANS SYSTEM (4 SLOTS, 30 RINGS)
        // ----------------------------------------------------
        this.maxRingSlots = 4;
        this.equippedRings = ['ring_favor', 'cloranthy', 'havel', 'silver_serpent'];
        this.ringsDatabase = {
            ring_favor: { id: 'ring_favor', name: 'Ring of Favor & Protection', icon: '💍', type: 'Lordran Ring', desc: '+20% Maximum HP, +20% Maximum Stamina & +20% Equip Load.' },
            cloranthy: { id: 'cloranthy', name: 'Cloranthy Ring +3', icon: '🌿', type: 'Lordran Ring', desc: '+50% Stamina Recovery Regeneration Speed.' },
            havel: { id: 'havel', name: "Havel's Ring", icon: '🗿', type: 'Lordran Ring', desc: '+50% Poise and Heavy Armor carrying capacity.' },
            silver_serpent: { id: 'silver_serpent', name: 'Covetous Silver Serpent Ring', icon: '🐍', type: 'Lordran Ring', desc: '+50% More Souls reaped from all vanquished foes.' },
            wolf_ring: { id: 'wolf_ring', name: 'Wolf Ring of Artorias', icon: '🐺', type: 'Lordran Ring', desc: '+40 Flat Poise. Prevents stagger from light enemy blows.' },
            dark_wood_grain: { id: 'dark_wood_grain', name: 'Dark Wood Grain Ring (Ninja Flip)', icon: '🤸', type: 'Lordran Ring', desc: 'Grants acrobatic ninja flip somersault roll with extended invincibility frames.' },
            red_tearstone: { id: 'red_tearstone', name: 'Red Tearstone Ring', icon: '💎', type: 'Lordran Ring', desc: '+50% Attack Damage Boost when player HP drops below 25%.' },
            hornet_ring: { id: 'hornet_ring', name: 'Hornet Ring', icon: '🐝', type: 'Lordran Ring', desc: '+35% Critical Damage multiplier on Ripostes and Backstabs.' },
            ring_evil_eye: { id: 'ring_evil_eye', name: 'Ring of the Evil Eye', icon: '👁️', type: 'Lordran Ring', desc: 'Absorbs enemy life force, restoring 100 HP on every enemy kill.' },
            bellowing_dragon: { id: 'bellowing_dragon', name: 'Bellowing Dragoncrest Ring', icon: '🐉', type: 'Sorcery Ring', desc: '+25% Glintstone & Sorcery Spell Damage.' },
            firstborn_ring: { id: 'firstborn_ring', name: "Ring of the Sun's Firstborn", icon: '☀️', type: 'Faith Ring', desc: '+25% Miracle and Lightning Incantation Damage.' },
            witch_ring: { id: 'witch_ring', name: "Witch's Ring of Izalith", icon: '🔥', type: 'Pyromancy Ring', desc: '+25% Chaos and Pyromancy Flame Spell Damage.' },
            steel_protection: { id: 'steel_protection', name: 'Ring of Steel Protection', icon: '🛡️', type: 'Defense Ring', desc: '-20% Physical Damage received from enemy hits.' },
            flame_stoneplate: { id: 'flame_stoneplate', name: 'Flame Stoneplate Ring', icon: '🔥', type: 'Defense Ring', desc: '-35% Fire & Lava Damage received.' },
            thunder_stoneplate: { id: 'thunder_stoneplate', name: 'Thunder Stoneplate Ring', icon: '⚡', type: 'Defense Ring', desc: '-35% Lightning Damage received.' },
            speckled_stoneplate: { id: 'speckled_stoneplate', name: 'Speckled Stoneplate Ring', icon: '💠', type: 'Defense Ring', desc: '-25% Magic, Dark, Rot & Poison Damage received.' },
            rusted_iron: { id: 'rusted_iron', name: 'Rusted Iron Ring', icon: '⚙️', type: 'Movement Ring', desc: 'Allows effortless sprint and movement through swamps and deep sludge.' },
            cat_ring: { id: 'cat_ring', name: 'Cat Covenant Ring of Alvina', icon: '🐱', type: 'Covenant Ring', desc: 'Summoned golden phantoms and companions gain +35% aggressive attack cadence.' },
            slumbering_dragon: { id: 'slumbering_dragon', name: 'Slumbering Dragoncrest Ring', icon: '🤫', type: 'Stealth Ring', desc: 'Completely silences movement footsteps and roll sounds.' },
            fog_ring: { id: 'fog_ring', name: 'Ring of Fog', icon: '🌫️', type: 'Stealth Ring', desc: 'Semi-transparent phantom illusion; cuts enemy detection aggro range in half.' },
            radagon_soreseal: { id: 'radagon_soreseal', name: "Radagon's Soreseal", icon: '⚔️', type: 'Elden Talisman', desc: '+15% Vigor, Endurance & Strength attributes; +15% damage dealt.' },
            erdtree_favor: { id: 'erdtree_favor', name: "Erdtree's Favor +2", icon: '🌳', type: 'Elden Talisman', desc: '+15% Maximum HP, +15% Stamina and +15% Poise.' },
            shard_alexander: { id: 'shard_alexander', name: 'Shard of Alexander', icon: '🏺', type: 'Elden Talisman', desc: '+25% Weapon Heavy Attacks and Skill Damage.' },
            dragoncrest_greatshield: { id: 'dragoncrest_greatshield', name: 'Dragoncrest Greatshield Talisman', icon: '🛡️', type: 'Elden Talisman', desc: '-25% Physical damage taken from all sources.' },
            lord_of_blood: { id: 'lord_of_blood', name: "Lord of Blood's Exultation", icon: '🩸', type: 'Elden Talisman', desc: '+20% Attack Power when wielding blood weapons or inflicting bleed.' },
            godfrey_icon: { id: 'godfrey_icon', name: 'Godfrey Icon', icon: '🦁', type: 'Elden Talisman', desc: '+20% Spell and charged attack damage.' },
            graven_mass: { id: 'graven_mass', name: 'Graven-Mass Talisman', icon: '🔮', type: 'Elden Talisman', desc: '+20% Sorcery spell effectiveness.' },
            flock_canvas: { id: 'flock_canvas', name: "Flock's Canvas Talisman", icon: '📜', type: 'Elden Talisman', desc: '+20% Faith incantation and lightning spell damage.' },
            winged_sword: { id: 'winged_sword', name: 'Rotten Winged Sword Insignia', icon: '🗡️', type: 'Elden Talisman', desc: 'Consecutive successive weapon hits boost damage up to +30%.' },
            gold_scarab: { id: 'gold_scarab', name: 'Golden Scarab Talisman', icon: '🪲', type: 'Elden Talisman', desc: '+40% Bonus Souls reaped from all vanquished foes.' }
        };

        this.spells = {
            soul_arrow: {
                id: 'soul_arrow',
                name: 'Glintstone Soul Arrow',
                type: 'Sorcery',
                icon: '💠',
                damage: 220,
                staminaCost: 18,
                speed: 24,
                color: 0x44ddff,
                desc: 'Shoots a swift bolt of pure glintstone starlight.'
            },
            heavy_soul_arrow: {
                id: 'heavy_soul_arrow',
                name: 'Great Heavy Soul Arrow',
                type: 'Sorcery',
                icon: '💎',
                damage: 380,
                staminaCost: 28,
                speed: 20,
                color: 0x00aaff,
                desc: 'Hurls a massive dense crystal starlight bolt.'
            },
            crystal_homing: {
                id: 'crystal_homing',
                name: 'Homing Crystal Soulmass',
                type: 'Sorcery',
                icon: '✨',
                damage: 480,
                staminaCost: 32,
                speed: 22,
                color: 0x88ffff,
                desc: 'Surrounds caster with 5 crystalline darts that fly at foes.'
            },
            soul_spear: {
                id: 'soul_spear',
                name: 'Crystal Soul Spear',
                type: 'Sorcery',
                icon: '🔱',
                damage: 650,
                staminaCost: 38,
                speed: 28,
                color: 0x66ffff,
                desc: 'Pierces through all enemies in its trajectory with lethal force.'
            },
            comet_azur: {
                id: 'comet_azur',
                name: 'Comet Azur Torrent',
                type: 'Primeval Sorcery',
                icon: '🌌',
                damage: 850,
                staminaCost: 48,
                speed: 30,
                color: 0x00ffea,
                desc: 'Fires a titanic stream of primeval stellar magic.'
            },
            sunlight_spear: {
                id: 'sunlight_spear',
                name: 'Sunlight Spear of Gwyn',
                type: 'Miracle / Lightning',
                icon: '⚡',
                damage: 620,
                staminaCost: 34,
                speed: 30,
                color: 0xffea00,
                desc: 'Hurls the golden lightning of Lord Gwyn that shatters dragon scales.'
            },
            lightning_stake: {
                id: 'lightning_stake',
                name: 'Ancient Lightning Stake',
                type: 'Dragon Cult Incantation',
                icon: '🌩️',
                damage: 680,
                staminaCost: 40,
                speed: 22,
                color: 0xff3322,
                desc: 'Drives crimson dragon lightning into the earth, triggering shockwaves.'
            },
            chaos_fireball: {
                id: 'chaos_fireball',
                name: 'Great Chaos Fireball',
                type: 'Pyromancy',
                icon: '🔥',
                damage: 550,
                staminaCost: 30,
                speed: 20,
                color: 0xff5500,
                desc: 'Hurls a molten ball of chaotic fire leaving burning lava.'
            },
            firestorm: {
                id: 'firestorm',
                name: 'Chaos Firestorm',
                type: 'Pyromancy',
                icon: '🌋',
                damage: 720,
                staminaCost: 44,
                speed: 18,
                color: 0xff2200,
                desc: 'Summons violent pillars of chaos flame in a ring around the caster.'
            },
            black_flame: {
                id: 'black_flame',
                name: 'Black Flame Scourge',
                type: 'Godslayer Incantation',
                icon: '🖤',
                damage: 520,
                staminaCost: 26,
                speed: 24,
                color: 0x8844aa,
                desc: 'Unleashes the God-Slaying Black Flame that eats away target HP.'
            },
            wrath_of_gods: {
                id: 'wrath_of_gods',
                name: 'Wrath of the Gods',
                type: 'Miracle',
                icon: '☀️',
                damage: 420,
                staminaCost: 28,
                speed: 16,
                color: 0xffffff,
                desc: 'Emits a blinding 360-degree kinetic holy shockwave blast.'
            },
            bloodflame_talons: {
                id: 'bloodflame_talons',
                name: 'Bloodflame Talons',
                type: 'Blood Incantation',
                icon: '🩸',
                damage: 540,
                staminaCost: 28,
                speed: 22,
                color: 0xff0044,
                desc: 'Scratches the air with cursed talons that detonate in bloodflame.'
            },
            stars_of_ruin: {
                id: 'stars_of_ruin',
                name: 'Stars of Ruin',
                type: 'Primeval Sorcery',
                icon: '✨',
                damage: 780,
                staminaCost: 42,
                speed: 26,
                color: 0x4488ff,
                desc: 'Unleashes 12 dark starlight projectiles that track targets aggressively.'
            },
            cannon_of_haima: {
                id: 'cannon_of_haima',
                name: 'Cannon of Haima',
                type: 'Glintstone Sorcery',
                icon: '💣',
                damage: 720,
                staminaCost: 38,
                speed: 20,
                color: 0x0088cc,
                desc: 'Launches an explosive glintstone shell that obliterates enemy ranks.'
            },
            fortissax_lightning: {
                id: 'fortissax_lightning',
                name: "Fortissax's Lightning Spear",
                type: 'Ancient Dragon Incantation',
                icon: '⚡',
                damage: 790,
                staminaCost: 45,
                speed: 28,
                color: 0xff1122,
                desc: 'Strikes down with twin red death lightning spears.'
            },
            giantsflame_take_thee: {
                id: 'giantsflame_take_thee',
                name: 'Giantsflame Take Thee',
                type: 'Fire Giant Incantation',
                icon: '🌋',
                damage: 760,
                staminaCost: 40,
                speed: 22,
                color: 0xff4400,
                desc: 'Hurls a colossal sphere of rhapsodic fire from the Mountaintops.'
            },
            flame_grant_strength: {
                id: 'flame_grant_strength',
                name: 'Flame, Grant Me Strength',
                type: 'Pyromancy Buff',
                icon: '💪',
                damage: 400,
                staminaCost: 25,
                speed: 15,
                color: 0xff6600,
                desc: 'Ignites inner fury, boosting attack power and launching a burst of fire.'
            },
            dark_bead: {
                id: 'dark_bead',
                name: 'Dark Bead of the Abyss',
                type: 'Abyssal Sorcery',
                icon: '🖤',
                damage: 820,
                staminaCost: 35,
                speed: 25,
                color: 0x331144,
                desc: 'Manus’s ancient humanity beads shotgun blast of catastrophic dark damage.'
            },
            frenzied_burst: {
                id: 'frenzied_burst',
                name: 'Frenzied Burst',
                type: 'Frenzied Flame Incantation',
                icon: '👁️',
                damage: 740,
                staminaCost: 36,
                speed: 34,
                color: 0xffcc00,
                desc: 'High-velocity sniper stream of yellow flame from the caster’s eyes.'
            },
            elden_stars: {
                id: 'elden_stars',
                name: 'Elden Stars',
                type: 'Erdtree Incantation',
                icon: '🌟',
                damage: 880,
                staminaCost: 50,
                speed: 18,
                color: 0xffea55,
                desc: 'Fires a sacred star of the Greater Will trailing shooting starlight.'
            }
        };
        // ----------------------------------------------------
        // SOULSBORNE SPIRIT ASHES & CALLING BELL SYSTEM (20 SUMMONS)
        // ----------------------------------------------------
        this.currentSpiritAshId = 'mimic_tear';
        this.spiritSummonCooldown = 0;
        this.activeSpiritCompanion = null;
        this.spiritAshesDatabase = {
            mimic_tear: {
                id: 'mimic_tear',
                name: 'Mimic Tear Ashes',
                title: 'Silver Tear Phantom Twin',
                icon: '🪞',
                hp: 3400,
                maxHp: 3400,
                damage: 260,
                color: 0xc8d6e5,
                desc: "Summons phantom twin of the player. Possesses immense vitality and matches the player's weapon prowess.",
                cost: 3500
            },
            black_knife_tiche: {
                id: 'black_knife_tiche',
                name: 'Black Knife Tiche',
                title: 'Destined Death Assassin',
                icon: '🗡️',
                hp: 1900,
                maxHp: 1900,
                damage: 340,
                color: 0x4a4e69,
                desc: 'Alecto daughter who stole a fragment of Death. Acrobatic attacks deal percentage-based max HP burn.',
                cost: 4000
            },
            greatshield_soldiers: {
                id: 'greatshield_soldiers',
                name: 'Greatshield Soldiers',
                title: 'Nokron Shield Phalanx',
                icon: '🛡️',
                hp: 3100,
                maxHp: 3100,
                damage: 170,
                color: 0x90a4ae,
                desc: 'Fierce phalanx of phantom legionnaires who bang shields, taunting and absorbing boss strikes.',
                cost: 2500
            },
            solaire_of_astora: {
                id: 'solaire_of_astora',
                name: 'Knight Solaire of Astora',
                title: 'Warrior of Sunlight',
                icon: '☀️',
                hp: 2800,
                maxHp: 2800,
                damage: 310,
                color: 0xffd54f,
                desc: 'Jovial golden phantom of Solaire. Hurls Sunlight Spears and boosts summoner morale: Praise the Sun!',
                cost: 3000
            },
            siegmeyer_of_catarina: {
                id: 'siegmeyer_of_catarina',
                name: 'Siegmeyer of Catarina',
                title: 'Onion Knight of Catarina',
                icon: '🧅',
                hp: 3200,
                maxHp: 3200,
                damage: 280,
                color: 0xfff9c4,
                desc: 'Beloved Catarina knight. Swings a colossal Pierce Shield and Zweihander, laughing in the face of peril.',
                cost: 2800
            },
            knight_artorias: {
                id: 'knight_artorias',
                name: 'Knight Artorias the Abysswalker',
                title: 'Wolf Knight of Lordran',
                icon: '🐺',
                hp: 3000,
                maxHp: 3000,
                damage: 360,
                color: 0x3f51b5,
                desc: 'Legendary hero of Lordran. Unleashes graceful somersaulting Greatsword slams and abyssal spin attacks.',
                cost: 4500
            },
            iron_tarkus: {
                id: 'iron_tarkus',
                name: 'Black Iron Tarkus',
                title: 'Knight of Berenike',
                icon: '🗿',
                hp: 3700,
                maxHp: 3700,
                damage: 330,
                color: 0x37474f,
                desc: 'Unflinching giant clad in heavy black iron armor. Capable of staggering and knocking down massive bosses.',
                cost: 3800
            },
            blaidd_halfwolf: {
                id: 'blaidd_halfwolf',
                name: 'Blaidd the Half-Wolf',
                title: 'Shadow of Ranni',
                icon: '🐾',
                hp: 2900,
                maxHp: 2900,
                damage: 320,
                color: 0x78909c,
                desc: 'Loyal wolf warrior carrying the Royal Greatsword. Inflicts chilling frostbite and savage howling strikes.',
                cost: 3600
            },
            millicent_prosthesis: {
                id: 'millicent_prosthesis',
                name: 'Millicent, Needle Knight',
                title: 'Daughter of the Rot God',
                icon: '🪡',
                hp: 2200,
                maxHp: 2200,
                damage: 350,
                color: 0xffab91,
                desc: 'Armed with a golden needle prosthetic arm. Unleashes consecutive blitz strikes inspired by the Waterfowl Dance.',
                cost: 3700
            },
            dung_eater_puppet: {
                id: 'dung_eater_puppet',
                name: 'Dung Eater Puppet',
                title: 'The Loathsome Defiler',
                icon: '🔔',
                hp: 3300,
                maxHp: 3300,
                damage: 270,
                color: 0x8d6e63,
                desc: "Seluvis's cursed puppet. Shrieks defilement, reducing all enemy resistances by 20% in combat.",
                cost: 3200
            },
            latenna_albinauric: {
                id: 'latenna_albinauric',
                name: 'Latenna the Albinauric',
                title: 'First-Generation Albinauric Archer',
                icon: '🏹',
                hp: 1600,
                maxHp: 1600,
                damage: 290,
                color: 0x80deea,
                desc: 'Immobile sniper spirit. Unleashes a continuous rapid volley of homing magic arrows from afar.',
                cost: 2600
            },
            cleanrot_finlay: {
                id: 'cleanrot_finlay',
                name: 'Cleanrot Knight Finlay',
                title: 'Hero of Aeonia',
                icon: '⚜️',
                hp: 2600,
                maxHp: 2600,
                damage: 300,
                color: 0xffcc80,
                desc: 'Cleanrot hero who carried Malenia across the continent. Emits golden halo rings and scarlet rot mist.',
                cost: 3500
            },
            bloodhound_darriwil: {
                id: 'bloodhound_darriwil',
                name: 'Bloodhound Knight',
                title: 'Stalker of the Evergaol',
                icon: '🩸',
                hp: 2100,
                maxHp: 2100,
                damage: 330,
                color: 0xef9a9a,
                desc: "Feral canine swordsman with Bloodhound's Step. Vanishes into thin air to slice enemy flanks.",
                cost: 3100
            },
            banished_knight_oleg: {
                id: 'banished_knight_oleg',
                name: 'Banished Knight Oleg',
                title: 'Wings of the Storm',
                icon: '🌪️',
                hp: 2800,
                maxHp: 2800,
                damage: 300,
                color: 0xb0bec5,
                desc: 'Dual-wielding storm champion. Whirlwinds into enemy ranks with sweeping twin greatsword combos.',
                cost: 3300
            },
            banished_knight_engvall: {
                id: 'banished_knight_engvall',
                name: 'Banished Knight Engvall',
                title: 'Halberdier of Stormveil',
                icon: '🦅',
                hp: 2900,
                maxHp: 2900,
                damage: 290,
                color: 0x90a4ae,
                desc: 'Loyal storm knight wielding a two-handed halberd with devastating sweeping thrusts and leap slams.',
                cost: 3200
            },
            stormhawk_deenh: {
                id: 'stormhawk_deenh',
                name: 'Stormhawk Deenh',
                title: 'King of the Storms',
                icon: '🦅',
                hp: 1500,
                maxHp: 1500,
                damage: 190,
                color: 0xb0bec5,
                desc: 'Ancient bird of Stormveil. Emits screeching battle cries that grant summoner +25% attack boost.',
                cost: 2400
            },
            mad_pumpkin_head: {
                id: 'mad_pumpkin_head',
                name: 'Mad Pumpkin Head',
                title: 'Berserk Gladiator',
                icon: '🎃',
                hp: 3500,
                maxHp: 3500,
                damage: 280,
                color: 0xffb74d,
                desc: 'Wild gladiator wearing an impenetrable brass pumpkin helmet. Headbutts enemies, ignoring incoming flinching.',
                cost: 3000
            },
            omenkiller_rollo: {
                id: 'omenkiller_rollo',
                name: 'Omenkiller Rollo',
                title: 'First Omen Hunter',
                icon: '🔥',
                hp: 3000,
                maxHp: 3000,
                damage: 330,
                color: 0xff7043,
                desc: 'Cruel executioner drinking from aromatic concoctions. Spews incandescent firebreath and cleaves with dual cleavers.',
                cost: 3600
            },
            nepheli_loux: {
                id: 'nepheli_loux',
                name: 'Nepheli Loux, Warrior',
                title: 'Chieftess of the Badlands',
                icon: '⚡',
                hp: 2700,
                maxHp: 2700,
                damage: 310,
                color: 0x81d4fa,
                desc: 'Rightful Lady of Limgrave. Dual-wields Stormhawk Axes enveloped in crackling golden lightning.',
                cost: 3400
            },
            iron_fist_alexander: {
                id: 'iron_fist_alexander',
                name: 'Iron Fist Alexander',
                title: 'Warrior Jar of Caelid',
                icon: '🏺',
                hp: 3800,
                maxHp: 3800,
                damage: 320,
                color: 0xd7ccc8,
                desc: 'The mighty living jar. Spins like a flaming tempest, spewing molten lava and body-checking titan bosses.',
                cost: 4200
            }
        };
        this.unlockedSpiritAshes = Object.keys(this.spiritAshesDatabase);


        // Pre-allocated scratch vectors for zero-allocation 60 FPS animation/combat updates
        this._scratchToPlayer = new THREE.Vector3();
        this._scratchDir = new THREE.Vector3();
        this._scratchForward = new THREE.Vector3();

        // 16 LORDS OF LORDRAN: PROGRESSIVE BOSS ROSTER (Smooth Unlock Sequence)
        this.bossRoster = [
            {
                id: 'high_bailiff',
                name: 'HIGH BAILIFF OF ARREARS',
                title: 'The Sunken Liturgy &bull; First Adjudicator of the Grand Counting House, Gavel of Foreclosure & Compound Interest',
                unlockLocationId: 'liturgy_grand_counting_house',
                icon: '⚖️',
                maxHp: 6800,
                damage: 320,
                souls: 28000,
                radius: 3.2,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createHighBailiff(x, z)
            },
            {
                id: 'twins_surety',
                name: 'THE TWINS OF SURETY',
                title: 'The Sunken Liturgy &bull; Keepers of the Suspended Scales, Dual Balance Scythes & Linked Poise Equilibrium',
                unlockLocationId: 'liturgy_suspended_scales',
                icon: '⛓️',
                maxHp: 5800,
                damage: 290,
                souls: 26000,
                radius: 3.0,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createTwinsOfSurety(x, z)
            },
            {
                id: 'asylum',
                name: 'VANGUARD OF ASH: ASYLUM DEMON',
                title: 'Northern Undead Asylum &bull; Colossal Hammer of Torment & Ash Slam',
                unlockLocationId: 'undead_asylum',
                icon: '🧌',
                maxHp: 2000,
                damage: 230,
                souls: 4000,
                radius: 2.7,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createAsylumDemon(x, z)
            },
            {
                id: 'taurus',
                name: 'TAURUS DEMON, TITAN OF THE BURG',
                title: 'Undead Burg High Battlements &bull; Great Stone Greataxe & Parapet Cleave',
                unlockLocationId: 'undead_burg_bridge',
                icon: '🐂',
                maxHp: 2400,
                damage: 270,
                souls: 5000,
                radius: 2.5,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createTaurusDemon(x, z)
            },
            {
                id: 'gargoyle',
                name: 'TWIN BELFRY GARGOYLES, SENTINELS OF AWAKENING',
                title: 'Undead Parish Belfry &bull; Weathered Bronze Halberd, Stone Wings & Flame Surge',
                unlockLocationId: 'undead_parish_belfry',
                icon: '🗿',
                maxHp: 2600,
                damage: 260,
                souls: 7500,
                radius: 2.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createBellGargoyle(x, z)
            },
            {
                id: 'capra',
                name: 'CAPRA DEMON, BUTCHER OF THE LOWER BURG',
                title: 'Lower Undead Burg Alleys &bull; Twin Jagged Cleavers & Savage Hound Flank',
                unlockLocationId: 'undead_burg_aqueduct',
                icon: '🐐',
                maxHp: 2500,
                damage: 310,
                souls: 8000,
                radius: 2.4,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createCapraDemon(x, z)
            },
            {
                id: 'gaping',
                name: 'GAPING DRAGON, CORRUPTED MAW OF THE DEPTHS',
                title: 'Subterranean Sewers of Lordran &bull; Colossal Ribcage Maw & Toxic Bile',
                unlockLocationId: 'the_depths',
                icon: '🩻',
                maxHp: 3200,
                damage: 300,
                souls: 10000,
                radius: 3.5,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createGapingDragon(x, z)
            },
            {
                id: 'quelaag',
                name: 'CHAOS WITCH QUELAAG, DAUGHTER OF FLAME',
                title: 'Domain of Quelaag &bull; Molten Spider Carapace & Curved Furysword',
                unlockLocationId: 'quelaags_domain',
                icon: '🕷️',
                maxHp: 3100,
                damage: 310,
                souls: 12000,
                radius: 3.2,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createChaosWitchQuelaag(x, z)
            },
            {
                id: 'butterfly',
                name: 'MOONLIGHT BUTTERFLY, DREAM-WEAVER OF SEATH',
                title: 'Darkroot Moonlit Grove &bull; Crystalline Laser Beams & Lunar Homing Volleys',
                unlockLocationId: 'darkroot_garden',
                icon: '🦋',
                maxHp: 2700,
                damage: 270,
                souls: 9000,
                radius: 3.0,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createMoonlightButterfly(x, z)
            },
            {
                id: 'iron_golem',
                name: 'IRON GOLEM, BULWARK OF SEN\'S FORTRESS',
                title: 'Sen\'s Fortress Rooftop &bull; Core of Iron, Wind-Cutter Axe & Colossal Stomp',
                unlockLocationId: 'sens_fortress_roof',
                icon: '🤖',
                maxHp: 3400,
                damage: 340,
                souls: 14000,
                radius: 3.0,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createIronGolem(x, z)
            },
            {
                id: 'ornstein',
                name: 'DRAGONSLAYER ORNSTEIN, LION OF GWYN\'S FOUR',
                title: 'Anor Londo Grand Cathedral &bull; Cross-Spear of Sunlight Lightning & Lightning Thrust',
                unlockLocationId: 'anor_londo_courtyard',
                icon: '🦁',
                maxHp: 3000,
                damage: 330,
                souls: 16000,
                radius: 2.6,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createDragonslayerOrnstein(x, z)
            },
            {
                id: 'smough',
                name: 'EXECUTIONER SMOUGH, THE BRUTAL CANNIBAL',
                title: 'Anor Londo Hall of the Great Lord &bull; Colossal Golden Smough Hammer & Leaping Crush',
                unlockLocationId: 'anor_londo_hall',
                icon: '🔨',
                maxHp: 3800,
                damage: 360,
                souls: 16000,
                radius: 3.2,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createExecutionerSmough(x, z)
            },
            {
                id: 'sif',
                name: 'GREAT GREY WOLF SIF, LOYAL WARDEN OF THE GRAVE',
                title: 'Darkroot Basin &bull; Sweeping Greatsword of Artorias & Howling Moonlight Spin',
                unlockLocationId: 'darkroot_basin',
                icon: '🐺',
                maxHp: 3300,
                damage: 340,
                souls: 15000,
                radius: 3.4,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createWolfSif(x, z)
            },
            {
                id: 'artorias',
                name: 'KNIGHT ARTORIAS, THE CORRUPTED ABYSSWALKER',
                title: 'Oolacile Township Colosseum &bull; Greatsword of Artorias & Frenzied Somersault Flurry',
                unlockLocationId: 'oolacile_township',
                icon: '🗡️',
                maxHp: 3600,
                damage: 370,
                souls: 20000,
                radius: 2.7,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createKnightArtorias(x, z)
            },
            {
                id: 'manus',
                name: 'MANUS, PRIMEVAL FATHER OF THE ABYSS',
                title: 'Chasm of the Abyss &bull; Shadow Catalyst, Frenzied Dark Bead & Slam Rampage',
                unlockLocationId: 'chasm_of_the_abyss',
                icon: '👁️',
                maxHp: 4200,
                damage: 390,
                souls: 24000,
                radius: 3.5,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createManusFatherOfAbyss(x, z)
            },
            {
                id: 'kalameet',
                name: 'BLACK DRAGON KALAMEET, THE BRINGER OF CALAMITY',
                title: 'Royal Wood Gorge &bull; Calamity Eye Telekinesis, Obsidian Dive & Black Fire',
                unlockLocationId: 'royal_wood',
                icon: '🦇',
                maxHp: 4000,
                damage: 380,
                souls: 25000,
                radius: 3.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createBlackDragonKalameet(x, z)
            },
            {
                id: 'nito',
                name: 'GRAVELORD NITO, FIRST OF THE DEAD',
                title: 'Tomb of the Giants Altar &bull; Greatsword of Nito, Toxic Miasma & Skeleton Army',
                unlockLocationId: 'nitos_domain',
                icon: '💀',
                maxHp: 3800,
                damage: 360,
                souls: 22000,
                radius: 3.2,
                spawnPos: { x: -20, z: 122 },
                create: (cf, x, z) => cf.createGravelordNito(x, z)
            },
            {
                id: 'gwyn',
                name: 'GWYN, LORD OF CINDER, GUARDIAN OF THE FIRST FLAME',
                title: 'Kiln of the First Flame &bull; Flaming Sunlight Greatsword, Grab Explosion & Flame Slashes',
                unlockLocationId: 'kiln_of_first_flame',
                icon: '☀️',
                maxHp: 4500,
                damage: 410,
                souls: 35000,
                radius: 2.7,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createGwynLordOfCinder(x, z)
            },
            {
                id: 'stray_demon',
                name: 'STRAY DEMON, FORGOTTEN CELL WARDEN',
                title: 'Asylum Subterranean Vaults &bull; Explosive Fire Wave, Demon Great Hammer & Shockwaves',
                unlockLocationId: 'asylum_depths',
                icon: '💥',
                maxHp: 3200,
                damage: 290,
                souls: 12000,
                radius: 2.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createStrayDemon(x, z)
            },
            {
                id: 'demon_firesage',
                name: 'DEMON FIRESAGE, ARCH-MASTER OF LOST FLAME',
                title: 'Demon Ruins Sanctum &bull; Red Demon Catalyst & Ancient Flame Sorcery Bursts',
                unlockLocationId: 'demon_ruins',
                icon: '♨️',
                maxHp: 3400,
                damage: 310,
                souls: 14000,
                radius: 2.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createDemonFiresage(x, z)
            },
            {
                id: 'centipede',
                name: 'CENTIPEDE DEMON, SPAWN OF THE LAVA TIDES',
                title: 'Blighttown Lava Caverns &bull; Magma Tail Sweep, Stretching Limbs & Orange Charred Ring',
                unlockLocationId: 'blighttown_swamp',
                icon: '🐛',
                maxHp: 3600,
                damage: 320,
                souls: 16000,
                radius: 2.9,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createCentipedeDemon(x, z)
            },
            {
                id: 'bed_of_chaos',
                name: 'BED OF CHAOS, HEART OF THE CORRUPTED FLAME',
                title: 'Lost Izalith Abyss &bull; Sweeping Fire Scythes, Collapsing Ground & Fiery Tempest',
                unlockLocationId: 'lost_izalith',
                icon: '🌳',
                maxHp: 2800,
                damage: 340,
                souls: 20000,
                radius: 3.5,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createBedOfChaos(x, z)
            },
            {
                id: 'ceaseless',
                name: 'CEASELESS DISCHARGE, WEEPING SON OF CHAOS',
                title: 'Demon Ruins Magma Lake &bull; Colossal Molten Tentacle Slams & Fire Eruptions',
                unlockLocationId: 'demon_ruins_basin',
                icon: '🌋',
                maxHp: 4200,
                damage: 360,
                souls: 22000,
                radius: 3.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createCeaselessDischarge(x, z)
            },
            {
                id: 'seath',
                name: 'SEATH THE SCALELESS, BETRAYER OF DRAGONS',
                title: 'Crystal Cave Depths &bull; Primordial Crystal, White Dragon Breath & Curse Shards',
                unlockLocationId: 'crystal_cave',
                icon: '💎',
                maxHp: 4400,
                damage: 370,
                souls: 25000,
                radius: 3.5,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSeathTheScaleless(x, z)
            },
            {
                id: 'four_kings',
                name: 'THE FOUR KINGS, VOID LORDS OF NEW LONDO',
                title: 'The Abyss of New Londo &bull; Dark Magic Discs, Life Drain Grab & Void Swarm',
                unlockLocationId: 'the_abyss',
                icon: '👥',
                maxHp: 4600,
                damage: 380,
                souls: 28000,
                radius: 3.0,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createFourKings(x, z)
            },
            {
                id: 'priscilla',
                name: 'CROSSBREED PRISCILLA, EXILED OF ARIAMIS',
                title: 'Painted World Tower &bull; Lifehunt Scythe, Invisibility Veil & Flurry Blizzard',
                unlockLocationId: 'painted_world',
                icon: '🪶',
                maxHp: 3500,
                damage: 350,
                souls: 24000,
                radius: 2.2,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createCrossbreedPriscilla(x, z)
            },
            {
                id: 'gwyndolin',
                name: 'DARK SUN GWYNDOLIN, ILLUSIONIST OF ANOR LONDO',
                title: 'Darkmoon Tomb &bull; Endless Hallway, Soul Spears, Homing Arrows & Moonlight Miracles',
                unlockLocationId: 'darkmoon_tomb',
                icon: '🌙',
                maxHp: 3300,
                damage: 340,
                souls: 26000,
                radius: 2.3,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createDarkSunGwyndolin(x, z)
            },
            {
                id: 'pinwheel',
                name: 'PINWHEEL, GRAVEROBBER OF NITO\'S VAULT',
                title: 'The Catacombs Crypt &bull; Triple Lantern Masks, Fireball Projectiles & Illusion Clones',
                unlockLocationId: 'the_catacombs',
                icon: '🎭',
                maxHp: 2600,
                damage: 280,
                souls: 15000,
                radius: 2.0,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createPinwheel(x, z)
            },
            {
                id: 'sanctuary_guardian',
                name: 'SANCTUARY GUARDIAN, WHITE BEAST OF OOLACILE',
                title: 'Oolacile Sanctuary River &bull; Lightning Orbs, Sweeping Talons & Toxic Tail Lash',
                unlockLocationId: 'oolacile_sanctuary',
                icon: '🦅',
                maxHp: 4000,
                damage: 360,
                souls: 30000,
                radius: 2.9,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSanctuaryGuardian(x, z)
            },
            {
                id: 'pursuer',
                name: 'THE PURSUER, RELENTLESS CURSE-BEARER',
                title: 'Forest of Fallen Giants &bull; Floating Levitation, Blue Curse Impale & Tower Shield',
                unlockLocationId: 'fallen_giants',
                icon: '⚔️',
                maxHp: 4200,
                damage: 370,
                souls: 32000,
                radius: 2.4,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createThePursuer(x, z)
            },
            {
                id: 'mirror_knight',
                name: 'LOOKING GLASS KNIGHT, REFLECTOR OF SOULS',
                title: 'King\'s Passage &bull; Storm Greatsword, Thunder Calls & Mirror Shield Phantom Summons',
                unlockLocationId: 'kings_passage',
                icon: '🪞',
                maxHp: 4600,
                damage: 390,
                souls: 35000,
                radius: 2.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createLookingGlassKnight(x, z)
            },
            {
                id: 'fume_knight',
                name: 'FUME KNIGHT RAIME, REBEL OF THE HEAVY MIST',
                title: 'Brume Tower Summit &bull; Dual-Wield Fume Ultra Greatsword & Dark Fire Buff Phase',
                unlockLocationId: 'brume_tower',
                icon: '💨',
                maxHp: 5000,
                damage: 420,
                souls: 40000,
                radius: 2.7,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createFumeKnight(x, z)
            },
            {
                id: 'sir_alonne',
                name: 'SIR ALONNE, SWORD SAINT OF THE IRON KEEP',
                title: 'Memory of the Old Iron King &bull; Polished Katana Thrusts, Leaping Slashes & Honor',
                unlockLocationId: 'alonne_keep',
                icon: '🏯',
                maxHp: 4800,
                damage: 410,
                souls: 38000,
                radius: 2.3,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSirAlonne(x, z)
            },
            {
                id: 'nameless_king',
                name: 'THE NAMELESS KING, GOD OF WAR & STORMS',
                title: 'Archdragon Peak &bull; Storm Drake Mount, Swordspear of Lightning & Thunderstorms',
                unlockLocationId: 'archdragon_peak',
                icon: '⛈️',
                maxHp: 5200,
                damage: 440,
                souls: 45000,
                radius: 2.7,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createNamelessKing(x, z)
            },
            {
                id: 'abyss_watchers',
                name: 'ABYSS WATCHERS, LEGION OF FARRON',
                title: 'Farron Keep Mausoleum &bull; Greatsword & Dagger Acrobatics, Fire Trails & Blood Oath',
                unlockLocationId: 'farron_keep',
                icon: '🩸',
                maxHp: 4700,
                damage: 400,
                souls: 36000,
                radius: 2.3,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createAbyssWatchers(x, z)
            },
            {
                id: 'pontiff_sulyvahn',
                name: 'PONTIFF SULYVAHN, TYRANT OF BOREAL VALLEY',
                title: 'Irithyll Cathedral &bull; Greatsword of Judgement, Profaned Greatsword & Shadow Clone',
                unlockLocationId: 'irithyll_cathedral',
                icon: '🕯️',
                maxHp: 4900,
                damage: 415,
                souls: 39000,
                radius: 2.6,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createPontiffSulyvahn(x, z)
            },
            {
                id: 'slave_knight_gael',
                name: 'SLAVE KNIGHT GAEL, SEEKER OF THE DARK SOUL',
                title: 'End of the World &bull; Executioner Greatsword, Crimson Cape Flurry, Crossbow & Red Skulls',
                unlockLocationId: 'world_end',
                icon: '🧔',
                maxHp: 5600,
                damage: 460,
                souls: 50000,
                radius: 2.6,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSlaveKnightGael(x, z)
            },
            {
                id: 'soul_of_cinder',
                name: 'SOUL OF CINDER, AMALGAM OF ALL LORDS',
                title: 'Kiln of the First Flame Zenith &bull; All 4 Weapon Stances, Sunlight Spears & 5-Hit Juggler',
                unlockLocationId: 'first_flame_summit',
                icon: '🔥',
                maxHp: 6000,
                damage: 480,
                souls: 60000,
                radius: 2.7,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulOfCinder(x, z)
            },
            {
                id: 'gorgon_medusa',
                name: 'MEDUSA, GORGON MATRIARCH OF THE SUNKEN SANCTUM',
                title: 'Sunken Serpent Sanctum &bull; Petro-Gaze Beam, Dual Serpent Daggers & Viper Spawn',
                unlockLocationId: 'serpent_sanctum',
                icon: '🐍',
                maxHp: 3200,
                damage: 290,
                souls: 12000,
                radius: 2.4,
                spawnPos: { x: 0, z: -95 },
                create: (cf, x, z) => cf.createGorgonMedusa(x, z)
            },
            {
                id: 'malenia',
                name: 'MALENIA, BLADE OF MIQUELLA',
                title: 'Roots of the Haligtree &bull; Waterfowl Dance, Prosthetic Blade & Scarlet Aeonia',
                unlockLocationId: 'haligtree_roots',
                icon: '🪷',
                maxHp: 6400,
                damage: 520,
                souls: 120000,
                radius: 2.5,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createMalenia(x, z)
            },
            {
                id: 'radahn',
                name: 'GENERAL RADAHN, CONQUEROR OF THE STARS',
                title: 'Caelid Redmane Wastes &bull; Gravitational Starcall, Twin Starscourge Blades & Meteor Re-entry',
                unlockLocationId: 'caelid_redmane_castle',
                icon: '☄️',
                maxHp: 7200,
                damage: 560,
                souls: 150000,
                radius: 3.2,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createRadahn(x, z)
            },
            {
                id: 'king_allant',
                name: 'FALSE KING ALLANT, REGENT OF THE OLD ONE',
                title: 'Boletaria Throne Pinnacle &bull; Soul Drain Blast, Soulbrant Sonic Wave & Demonic Shockwave',
                unlockLocationId: 'boletaria_kings_tower',
                icon: '👑',
                maxHp: 8000,
                damage: 600,
                souls: 200000,
                radius: 2.6,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createKingAllant(x, z)
            },
            {
                id: 'ludwig',
                name: 'LUDWIG THE ACCURSED & HOLY BLADE',
                title: 'Underground Corpse Pile &bull; Moonlight Arcane Beams, Bestial Charge & Moonlight Greatsword',
                unlockLocationId: 'hunter_nightmare_pile',
                icon: '🐴',
                maxHp: 8500,
                damage: 620,
                souls: 220000,
                radius: 3.2,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createLudwig(x, z)
            },
            {
                id: 'lady_maria',
                name: 'LADY MARIA OF THE ASTRAL CLOCKTOWER',
                title: 'Astral Clocktower &bull; Rakuyo Dual-Blade Dance, Bloodflame Waves & Visceral Thrust',
                unlockLocationId: 'astral_clocktower',
                icon: '🍷',
                maxHp: 8800,
                damage: 640,
                souls: 240000,
                radius: 2.3,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createLadyMaria(x, z)
            },
            {
                id: 'orphan_of_kos',
                name: 'ORPHAN OF KOS, CHILD OF THE SEA',
                title: 'Coast of the Hunter Nightmare &bull; Placenta Blade Cleave, Oceanic Lightning Call & Aerial Smash',
                unlockLocationId: 'fishing_hamlet_coast',
                icon: '🌊',
                maxHp: 9200,
                damage: 660,
                souls: 260000,
                radius: 2.6,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createOrphanOfKos(x, z)
            },
            {
                id: 'father_gascoigne',
                name: 'FATHER GASCOIGNE, THE BEAST HUNTER',
                title: 'Oedon Tomb &bull; Beast Blunderbuss Scatter, Hunter Axe Extension & Bestial Claws',
                unlockLocationId: 'tomb_of_oedon',
                icon: '🪓',
                maxHp: 9500,
                damage: 680,
                souls: 280000,
                radius: 2.4,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createFatherGascoigne(x, z)
            },
            {
                id: 'darklurker',
                name: 'DARKLURKER, SHADOW OF THE PILGRIMS',
                title: 'Dark Chasm of Old &bull; Soul Greatsword, Shadow Teleportation & Dark Soul Clones',
                unlockLocationId: 'dark_chasm_of_old',
                icon: '🌑',
                maxHp: 9800,
                damage: 700,
                souls: 300000,
                radius: 2.5,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createDarklurker(x, z)
            },
            {
                id: 'velstadt',
                name: 'VELSTADT, THE ROYAL AEGIS',
                title: 'Undead Crypt Entrance &bull; Sacred Chime Hammer, Resonant Hex Wave & Dark Bell Toll',
                unlockLocationId: 'undead_crypt',
                icon: '🔔',
                maxHp: 10200,
                damage: 720,
                souls: 320000,
                radius: 2.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createVelstadt(x, z)
            },
            {
                id: 'burnt_ivory_king',
                name: 'THE BURNT IVORY KING',
                title: 'The Old Chaos &bull; Radiant Sunlight Blade, Chaos Portal Cleave & Flame Arc Sweep',
                unlockLocationId: 'the_old_chaos',
                icon: '❄️',
                maxHp: 10600,
                damage: 740,
                souls: 350000,
                radius: 2.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createIvoryKing(x, z)
            },
            {
                id: 'dragonrider',
                name: 'DRAGONRIDER OF HEIDE',
                title: 'Heide Tower of Flame &bull; Colossal Twin Halberd Cleave, Tower Shield Bash & Ground Stomp',
                unlockLocationId: 'heide_tower_of_flame',
                icon: '🛡️',
                maxHp: 11000,
                damage: 760,
                souls: 380000,
                radius: 2.7,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createDragonrider(x, z)
            },
            {
                id: 'twin_princes',
                name: 'LOTHRIC & LORIAN, TWIN PRINCES',
                title: 'Grand Archives Pinnacle &bull; Flame Greatsword Teleport, Holy Soul Barrage & Revival',
                unlockLocationId: 'lothric_throne_pinnacle',
                icon: '✨',
                maxHp: 11500,
                damage: 780,
                souls: 400000,
                radius: 2.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createTwinPrinces(x, z)
            },
            {
                id: 'dragonslayer_armour',
                name: 'DRAGONSLAYER ARMOUR',
                title: 'Lothric Castle Gate &bull; Lightning Greataxe Slam, Pilgrim Butterfly Volley & Shield Bash',
                unlockLocationId: 'lothric_castle_ramparts',
                icon: '⚡',
                maxHp: 12000,
                damage: 800,
                souls: 430000,
                radius: 2.9,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createDragonslayerArmour(x, z)
            },
            {
                id: 'sister_friede',
                name: 'SISTER FRIEDE & FATHER ARIANDEL',
                title: 'Painted World Chapel &bull; Blackflame Scythe Whirlwind, Frostbite Ice Wave & Great Bowl Slam',
                unlockLocationId: 'ariandel_chapel',
                icon: '❄️',
                maxHp: 12500,
                damage: 820,
                souls: 460000,
                radius: 2.4,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSisterFriede(x, z)
            },
            {
                id: 'champion_gundyr',
                name: 'CHAMPION GUNDYR, THE UNTENDED TITAN',
                title: 'Untended Graves &bull; Shoulder Charge, Martial Roundhouse Kick & Halberd Air Juggle',
                unlockLocationId: 'untended_graves',
                icon: '🥋',
                maxHp: 13000,
                damage: 850,
                souls: 500000,
                radius: 2.9,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createChampionGundyr(x, z)
            },
            {
                id: 'darkeater_midir',
                name: 'DARK-EATER MIDIR, ABYSSAL DRAGON',
                title: 'Ringed City Chasm &bull; Abyssal Laser Ray, Dark Flame Breath & Colossal Wing Slams',
                unlockLocationId: 'ringed_city_abyssal_chasm',
                icon: '🐲',
                maxHp: 14000,
                damage: 900,
                souls: 550000,
                radius: 3.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createDarkeaterMidir(x, z)
            },
            {
                id: 'godfrey',
                name: 'GODFREY, FIRST ELDEN LORD & HOARAH LOUX',
                title: 'Elden Throne Citadel &bull; Earthshaker Axe Shockwave, Fissure Stomp & Chieftain Grapple',
                unlockLocationId: 'elden_throne_sanctum',
                icon: '🦁',
                maxHp: 15000,
                damage: 930,
                souls: 600000,
                radius: 3.0,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createGodfrey(x, z)
            },
            {
                id: 'maliketh',
                name: 'MALIKETH, THE BLACK BLADE',
                title: 'Crumbling Farum Azula &bull; Destined Death Crimson Waves, Acrobatic Pillar Leaps & Black Blade',
                unlockLocationId: 'crumbling_farum_azula',
                icon: '🖤',
                maxHp: 16000,
                damage: 960,
                souls: 650000,
                radius: 2.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createMaliketh(x, z)
            },
            {
                id: 'mohg',
                name: 'MOHG, LORD OF BLOOD',
                title: 'Mohgwyn Palace Mausoleum &bull; Bloodboon Sacred Spear, NIHIL Curse & Bloodflame Spray',
                unlockLocationId: 'mohgwyn_palace',
                icon: '🔱',
                maxHp: 17000,
                damage: 990,
                souls: 700000,
                radius: 2.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createMohg(x, z)
            },
            {
                id: 'morgott',
                name: 'MORGOTT, THE OMEN KING',
                title: 'Leyndell Royal Capital Throne &bull; Cursed Blood Slice, Golden Dagger Rain & Holy Greathammer',
                unlockLocationId: 'leyndell_royal_capital',
                icon: '📿',
                maxHp: 18000,
                damage: 1020,
                souls: 750000,
                radius: 2.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createMorgott(x, z)
            },
            {
                id: 'rykard',
                name: 'RYKARD, LORD OF BLASPHEMY',
                title: 'Volcano Manor Temple &bull; Blasphemous Blade, Magma Geysers & Flaming Skull Rain',
                unlockLocationId: 'volcano_manor_magma_temple',
                icon: '👄',
                maxHp: 19000,
                damage: 1050,
                souls: 800000,
                radius: 3.5,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createRykard(x, z)
            },
            {
                id: 'isshin_sword_saint',
                name: 'SWORD SAINT ISSHIN, ASHINA LEGEND',
                title: 'Silvergrass Field &bull; Ashina Cross, Dragon Flash Wind Blades & Cross Spear Thrust',
                unlockLocationId: 'ashina_silvergrass_field',
                icon: '🥷',
                maxHp: 20000,
                damage: 1100,
                souls: 900000,
                radius: 2.5,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createIsshin(x, z)
            },
            {
                id: 'elden_beast',
                name: 'ELDEN BEAST, VASSAL OF THE GREATER WILL',
                title: 'Fractured Marika Erdtree Realm &bull; Sacred Relic Sword Golden Waves, Elden Stars & Nebula Wave',
                unlockLocationId: 'erdtree_fractured_core',
                icon: '🌌',
                maxHp: 22000,
                damage: 1200,
                souls: 1000000,
                radius: 3.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createEldenBeast(x, z)
            },
            {
                id: 'messmer_the_impaler',
                name: 'MESSMER THE IMPALER, LORD OF FLAMES',
                title: 'Shadow Keep Specimen Storehouse &bull; Spear of the Impaler, Winged Serpents & Blazing Fire Torrent',
                unlockLocationId: 'sote_shadow_keep',
                icon: '🐍',
                theme: 'flame',
                bossScale: 2.1,
                maxHp: 24000,
                damage: 1250,
                souls: 1100000,
                radius: 3.2,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createMessmerTheImpaler ? cf.createMessmerTheImpaler(x, z) : cf.createSoulsborneBoss({ id: 'messmer_the_impaler', theme: 'flame', bossScale: 2.1 }, x, z)
            },
            {
                id: 'radahn_consort',
                name: 'PROMISED CONSORT RADAHN & MIQUELLA',
                title: 'Enir-Ilim Gate of Divinity &bull; Light of Miquella, Twin Greatswords of Radahn & Divine Pillar of Light',
                unlockLocationId: 'sote_enir_ilim_gate',
                icon: '👑',
                theme: 'holy',
                bossScale: 2.2,
                maxHp: 28000,
                damage: 1400,
                souls: 1500000,
                radius: 3.4,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'radahn_consort', theme: 'holy', bossScale: 2.2 }, x, z)
            },
            {
                id: 'bayle_the_dread',
                name: 'BAYLE THE DREAD, APEX DRAGON OF DREAD',
                title: 'Jagged Peak Rest of the Dread &bull; Dread Lightning Torrent, Magma Breath & Broken Dragon Wings',
                unlockLocationId: 'sote_jagged_peak_summit',
                icon: '🐉',
                theme: 'flame',
                bossScale: 2.8,
                maxHp: 26000,
                damage: 1350,
                souls: 1250000,
                radius: 3.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createBayleTheDread ? cf.createBayleTheDread(x, z) : cf.createSoulsborneBoss({ id: 'bayle_the_dread', theme: 'flame', bossScale: 2.8 }, x, z)
            },
            {
                id: 'midra_frenzied_flame',
                name: 'MIDRA, LORD OF FRENZIED FLAME',
                title: "Midra's Manse Abyssal Woods &bull; Barbed Greatsword, Frenzied Flame Sun Head & Golden Flame Vortex",
                unlockLocationId: 'sote_midras_manse',
                icon: '👁️',
                theme: 'frenzy',
                bossScale: 2.0,
                maxHp: 23000,
                damage: 1200,
                souls: 1050000,
                radius: 3.0,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createMidraFrenziedFlame ? cf.createMidraFrenziedFlame(x, z) : cf.createSoulsborneBoss({ id: 'midra_frenzied_flame', theme: 'frenzy', bossScale: 2.0 }, x, z)
            },
            {
                id: 'rellana_twin_moon',
                name: 'RELLANA, TWIN MOON KNIGHT',
                title: 'Castle Ensis Moonrise Chamber &bull; Twin Moon Swords, Carian Starlight & Moon Blade Flurry',
                unlockLocationId: 'sote_castle_ensis',
                icon: '🌙',
                theme: 'magic',
                bossScale: 2.0,
                maxHp: 22500,
                damage: 1180,
                souls: 1000000,
                radius: 2.9,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'rellana_twin_moon', theme: 'magic', bossScale: 2.0 }, x, z)
            },
            {
                id: 'romina_saint_bud',
                name: 'ROMINA, SAINT OF THE BUD',
                title: 'Church of the Bud Ancient Ruins &bull; Halberd of the Bud, Scarlet Rot Butterflies & Centipede Stomp',
                unlockLocationId: 'sote_church_of_the_bud',
                icon: '🌺',
                theme: 'rot',
                bossScale: 2.4,
                maxHp: 24000,
                damage: 1220,
                souls: 1100000,
                radius: 3.3,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'romina_saint_bud', theme: 'rot', bossScale: 2.4 }, x, z)
            },
            {
                id: 'scadutree_avatar',
                name: 'SCADUTREE AVATAR, BLOOM OF THE SUNFLOWER',
                title: 'Scadutree Base Tree-Worship Sanctum &bull; Golden Flower Head Slam, Radiant Light Thorns & Rebirth Burst',
                unlockLocationId: 'sote_scadutree_base',
                icon: '🌻',
                theme: 'holy',
                bossScale: 2.6,
                maxHp: 25000,
                damage: 1280,
                souls: 1150000,
                radius: 3.5,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'scadutree_avatar', theme: 'holy', bossScale: 2.6 }, x, z)
            },
            {
                id: 'putrescent_knight',
                name: 'PUTRESCENT KNIGHT, HORSEMAN OF DEEP PURPLE',
                title: "Stone Coffin Fissure Garden of Deep Purple &bull; Putrescence Cleaver, Ghostflame Sludge & Phantom Steed Charge",
                unlockLocationId: 'sote_stone_coffin_fissure',
                icon: '🐴',
                theme: 'magic',
                bossScale: 2.3,
                maxHp: 23500,
                damage: 1240,
                souls: 1080000,
                radius: 3.2,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'putrescent_knight', theme: 'magic', bossScale: 2.3 }, x, z)
            },
            {
                id: 'metyr_mother_fingers',
                name: 'METYR, MOTHER OF FINGERS',
                title: 'Finger Ruins of Dheo &bull; Microcosm Beam, Crawling Finger Slams & Primordial Signal Burst',
                unlockLocationId: 'sote_finger_ruins_rhia',
                icon: '🖐️',
                theme: 'cosmic',
                bossScale: 2.7,
                maxHp: 25500,
                damage: 1300,
                souls: 1200000,
                radius: 3.6,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'metyr_mother_fingers', theme: 'cosmic', bossScale: 2.7 }, x, z)
            },
            {
                id: 'commander_gaius',
                name: 'COMMANDER GAIUS & ARMORED BOAR',
                title: 'Shadow Keep Back Gate Hinterland &bull; Gravity Lance Charge, Boar Tusk Trample & Gravitational Burst',
                unlockLocationId: 'sote_scaduview',
                icon: '🐗',
                theme: 'dark',
                bossScale: 2.4,
                maxHp: 24500,
                damage: 1260,
                souls: 1120000,
                radius: 3.3,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'commander_gaius', theme: 'dark', bossScale: 2.4 }, x, z)
            },
            {
                id: 'cleric_beast',
                name: 'CLERIC BEAST OF YHARNAM',
                title: 'Central Yharnam Great Bridge &bull; Deformed Beast Claws, Terrifying Shriek & Ground Shatter',
                unlockLocationId: 'bb_central_great_bridge',
                icon: '🐺',
                theme: 'beast',
                bossScale: 2.6,
                maxHp: 21000,
                damage: 1120,
                souls: 850000,
                radius: 3.4,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'cleric_beast', theme: 'beast', bossScale: 2.6 }, x, z)
            },
            {
                id: 'vicar_amelia',
                name: 'VICAR AMELIA, WHITE BEAST OF CATHEDRAL',
                title: 'Grand Cathedral Nave &bull; Gold Medallion Prayer, Praying Slash & Silver Fur Cleave',
                unlockLocationId: 'cathedral_ward',
                icon: '🐾',
                theme: 'beast',
                bossScale: 2.4,
                maxHp: 22000,
                damage: 1150,
                souls: 900000,
                radius: 3.2,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'vicar_amelia', theme: 'beast', bossScale: 2.4 }, x, z)
            },
            {
                id: 'blood_starved_beast',
                name: 'BLOOD-STARVED BEAST',
                title: 'Old Yharnam Church of the Good Chalice &bull; Flayed Hide Frenzy, Poison Cloud & Lacerating Claws',
                unlockLocationId: 'bb_old_yharnam_chapel',
                icon: '🩸',
                theme: 'blood',
                bossScale: 2.2,
                maxHp: 21500,
                damage: 1160,
                souls: 880000,
                radius: 2.9,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'blood_starved_beast', theme: 'blood', bossScale: 2.2 }, x, z)
            },
            {
                id: 'shadows_of_yharnam',
                name: 'SHADOWS OF YHARNAM, FORBIDDEN TRIO',
                title: 'Forbidden Woods Gravestone Plaza &bull; Katana Slash, Fireball Hurl, Giant Serpent Summons',
                unlockLocationId: 'forbidden_woods',
                icon: '👥',
                theme: 'dark',
                bossScale: 2.0,
                maxHp: 23000,
                damage: 1180,
                souls: 950000,
                radius: 3.0,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'shadows_of_yharnam', theme: 'dark', bossScale: 2.0 }, x, z)
            },
            {
                id: 'rom_vacuous_spider',
                name: 'ROM, THE VACUOUS SPIDER',
                title: 'Byrgenwerth Moonside Lake &bull; Arcane Meteor Shower, Stone Head Slam & Spider Brood',
                unlockLocationId: 'bb_byrgenwerth_moonside',
                icon: '🕷️',
                theme: 'magic',
                bossScale: 2.5,
                maxHp: 22800,
                damage: 1200,
                souls: 980000,
                radius: 3.5,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'rom_vacuous_spider', theme: 'magic', bossScale: 2.5 }, x, z)
            },
            {
                id: 'the_one_reborn',
                name: 'THE ONE REBORN',
                title: "Yahar'gul Advent Plaza &bull; Corpse Mass Torrent, Acid Sludge Pool & Corpse Bell Chime",
                unlockLocationId: 'bb_unseen_village_advent',
                icon: '🧟',
                theme: 'dark',
                bossScale: 2.9,
                maxHp: 24500,
                damage: 1240,
                souls: 1050000,
                radius: 3.9,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'the_one_reborn', theme: 'dark', bossScale: 2.9 }, x, z)
            },
            {
                id: 'ebrietas_daughter_cosmos',
                name: 'EBRIETAS, DAUGHTER OF THE COSMOS',
                title: 'Altar of Despair Beneath Grand Cathedral &bull; A Call Beyond Cosmic Lasers, Tentacle Swipe & Blood Spit',
                unlockLocationId: 'upper_cathedral_ward',
                icon: '🐙',
                theme: 'cosmic',
                bossScale: 2.7,
                maxHp: 25000,
                damage: 1280,
                souls: 1150000,
                radius: 3.6,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'ebrietas_daughter_cosmos', theme: 'cosmic', bossScale: 2.7 }, x, z)
            },
            {
                id: 'martyr_logarius',
                name: 'MARTYR LOGARIUS OF CAINHURST',
                title: 'Forsaken Castle Cainhurst Rooftops &bull; Executioner Scythe, Flying Skull Magic & Bloodied Rapier Storm',
                unlockLocationId: 'cainhurst_castle',
                icon: '👑',
                theme: 'frost',
                bossScale: 2.1,
                maxHp: 23500,
                damage: 1210,
                souls: 1020000,
                radius: 3.0,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'martyr_logarius', theme: 'frost', bossScale: 2.1 }, x, z)
            },
            {
                id: 'gehrman_first_hunter',
                name: 'GEHRMAN, THE FIRST HUNTER',
                title: "Hunter's Dream Burning Workshop &bull; Burial Blade Curved Scythe, Blunderbuss Riposte & Wind Slash",
                unlockLocationId: 'hunters_dream',
                icon: '🌾',
                theme: 'blood',
                bossScale: 2.0,
                maxHp: 26000,
                damage: 1320,
                souls: 1250000,
                radius: 2.9,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'gehrman_first_hunter', theme: 'blood', bossScale: 2.0 }, x, z)
            },
            {
                id: 'moon_presence',
                name: 'FLORA, THE MOON PRESENCE',
                title: "Hunter's Dream Red Moon Meadow &bull; Blood Gaze 1-HP Blast, Tendril Flurry & Cosmic Blood Mist",
                unlockLocationId: 'hunters_dream',
                icon: '🌕',
                theme: 'cosmic',
                bossScale: 2.5,
                maxHp: 27000,
                damage: 1360,
                souls: 1350000,
                radius: 3.4,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'moon_presence', theme: 'cosmic', bossScale: 2.5 }, x, z)
            },
            {
                id: 'gyoubu_masataka_oniwa',
                name: 'GYOUBU MASATAKA ONIWA',
                title: 'Ashina Castle Gate Fortress &bull; Oniwa Cross Spear, Demon Warhorse Charge & Spinning Rope Cleave',
                unlockLocationId: 'sekiro_ashina_castle_gate',
                icon: '🐎',
                theme: 'dark',
                bossScale: 2.4,
                maxHp: 22000,
                damage: 1140,
                souls: 900000,
                radius: 3.3,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'gyoubu_masataka_oniwa', theme: 'dark', bossScale: 2.4 }, x, z)
            },
            {
                id: 'genichiro_ashina',
                name: 'GENICHIRO ASHINA, WAY OF TOMOE',
                title: 'Ashina Castle Tenshu Dojo &bull; Floating Passage Combo, Greatbow Flurry & Lightning of Tomoe',
                unlockLocationId: 'ashina_castle',
                icon: '⚡',
                theme: 'dragon',
                bossScale: 2.0,
                maxHp: 23500,
                damage: 1200,
                souls: 1000000,
                radius: 2.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'genichiro_ashina', theme: 'dragon', bossScale: 2.0 }, x, z)
            },
            {
                id: 'guardian_ape',
                name: 'GUARDIAN APE OF SUNKEN VALLEY',
                title: 'Sunken Valley Bodhisattva Valley Apex &bull; Cleaver Slam, Toxic Fart Cloud & Severed Head Shriek',
                unlockLocationId: 'sekiro_bodhisattva_valley',
                icon: '🦍',
                theme: 'beast',
                bossScale: 2.7,
                maxHp: 24500,
                damage: 1240,
                souls: 1080000,
                radius: 3.5,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'guardian_ape', theme: 'beast', bossScale: 2.7 }, x, z)
            },
            {
                id: 'folding_screen_monkeys',
                name: 'FOLDING SCREEN MONKEYS',
                title: 'Senpou Temple Inner Sanctum &bull; Hearing, Seeing, Speaking & Invisible Illusory Apes',
                unlockLocationId: 'senpou_temple',
                icon: '🐒',
                theme: 'magic',
                bossScale: 1.8,
                maxHp: 20500,
                damage: 1080,
                souls: 820000,
                radius: 2.6,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'folding_screen_monkeys', theme: 'magic', bossScale: 1.8 }, x, z)
            },
            {
                id: 'corrupted_monk',
                name: 'TRUE CORRUPTED MONK OF FOUNTAINHEAD',
                title: 'Fountainhead Palace Vermilion Bridge &bull; Triple-Deathblow Naginata, Shadow Illusions & Centipede Vomit',
                unlockLocationId: 'sekiro_fountainhead_vermilion',
                icon: '🎭',
                theme: 'magic',
                bossScale: 2.3,
                maxHp: 25000,
                damage: 1260,
                souls: 1120000,
                radius: 3.2,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'corrupted_monk', theme: 'magic', bossScale: 2.3 }, x, z)
            },
            {
                id: 'great_shinobi_owl',
                name: 'GREAT SHINOBI OWL & OWL FATHER',
                title: 'Hirata Estate Hidden Temple &bull; Heavy Odachi Slash, Anti-Healing Charm & Firecracker Mist',
                unlockLocationId: 'hirata_estate',
                icon: '🦉',
                theme: 'dark',
                bossScale: 2.2,
                maxHp: 26500,
                damage: 1340,
                souls: 1280000,
                radius: 3.0,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'great_shinobi_owl', theme: 'dark', bossScale: 2.2 }, x, z)
            },
            {
                id: 'demon_of_hatred',
                name: 'DEMON OF HATRED',
                title: 'Ashina Outskirts Scorched Battlefield &bull; Blazing Claw Sweep, Fireball Volley & Flame Wave Stomp',
                unlockLocationId: 'sekiro_outskirts_wall_gate',
                icon: '👹',
                theme: 'flame',
                bossScale: 2.9,
                maxHp: 28500,
                damage: 1420,
                souls: 1450000,
                radius: 3.9,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'demon_of_hatred', theme: 'flame', bossScale: 2.9 }, x, z)
            },
            {
                id: 'divine_dragon',
                name: 'DIVINE DRAGON OF EVERLASTING JADE',
                title: 'Sanctuary Cloud Peak &bull; Seven-Branched Sword Wind Shockwaves & Celestial Lightning Parrying',
                unlockLocationId: 'fountainhead_palace',
                icon: '🐉',
                theme: 'dragon',
                bossScale: 3.0,
                maxHp: 27000,
                damage: 1360,
                souls: 1350000,
                radius: 4.0,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'divine_dragon', theme: 'dragon', bossScale: 3.0 }, x, z)
            },
            {
                id: 'iudex_gundyr',
                name: 'IUDEX GUNDYR, ASHEN ARBITER',
                title: 'Cemetery of Ash Untended Graves &bull; Coiled Sword Thrust, Shoulder Ram & Erupting Pus of Man',
                unlockLocationId: 'ds3_cemetery_of_ash',
                icon: '⚔️',
                theme: 'dark',
                bossScale: 2.2,
                maxHp: 22000,
                damage: 1150,
                souls: 880000,
                radius: 3.0,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'iudex_gundyr', theme: 'dark', bossScale: 2.2 }, x, z)
            },
            {
                id: 'vordt_boreal_valley',
                name: 'VORDT OF THE BOREAL VALLEY',
                title: 'High Wall of Lothric Grand Portcullis &bull; Frost Greathammer, Quadrupedal Charge & Frost Breath',
                unlockLocationId: 'high_wall_lothric',
                icon: '❄️',
                theme: 'frost',
                bossScale: 2.4,
                maxHp: 22500,
                damage: 1180,
                souls: 920000,
                radius: 3.2,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'vordt_boreal_valley', theme: 'frost', bossScale: 2.4 }, x, z)
            },
            {
                id: 'crystal_sage',
                name: 'CRYSTAL SAGE OF FARRON',
                title: 'Road of Sacrifices Crux Ruins &bull; Crystal Soul Spear, Homing Blue Hail & Teleportation Clones',
                unlockLocationId: 'road_of_sacrifices',
                icon: '🔮',
                theme: 'magic',
                bossScale: 2.0,
                maxHp: 21800,
                damage: 1140,
                souls: 890000,
                radius: 2.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'crystal_sage', theme: 'magic', bossScale: 2.0 }, x, z)
            },
            {
                id: 'deacons_of_the_deep',
                name: 'DEACONS OF THE DEEP',
                title: 'Cathedral of the Deep Core &bull; Archdeacon Royce, Fire Orbs, Deep Curse Fog & Red Soul Possession',
                unlockLocationId: 'cathedral_of_the_deep',
                icon: '🕯️',
                theme: 'holy',
                bossScale: 2.0,
                maxHp: 23000,
                damage: 1170,
                souls: 950000,
                radius: 3.0,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'deacons_of_the_deep', theme: 'holy', bossScale: 2.0 }, x, z)
            },
            {
                id: 'high_lord_wolnir',
                name: 'HIGH LORD WOLNIR, CARTHUS TYRANT',
                title: 'Catacombs of Carthus Dark Goblet &bull; Golden Holy Bracelets, Abyss Miasma & Colossal Holy Greatsword',
                unlockLocationId: 'catacombs_carthus',
                icon: '💀',
                theme: 'dark',
                bossScale: 2.8,
                maxHp: 25000,
                damage: 1270,
                souls: 1100000,
                radius: 3.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'high_lord_wolnir', theme: 'dark', bossScale: 2.8 }, x, z)
            },
            {
                id: 'old_demon_king',
                name: 'OLD DEMON KING, LAST PYRE',
                title: 'Smouldering Lake Molten Cavern &bull; Flaming Stone Club, Meteor Rain & Ring of Chaos Flame',
                unlockLocationId: 'smouldering_lake',
                icon: '🔥',
                theme: 'flame',
                bossScale: 2.6,
                maxHp: 24200,
                damage: 1230,
                souls: 1060000,
                radius: 3.5,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'old_demon_king', theme: 'flame', bossScale: 2.6 }, x, z)
            },
            {
                id: 'aldrich_devourer',
                name: 'ALDRICH, DEVOURER OF GODS',
                title: 'Anor Londo Cathedral of the Devourer &bull; Golden Darkmoon Arrow Rain, Lifehunt Scythe & Soul Stream',
                unlockLocationId: 'ds3_anor_londo_ds3',
                icon: '🏹',
                theme: 'magic',
                bossScale: 2.5,
                maxHp: 25800,
                damage: 1310,
                souls: 1200000,
                radius: 3.4,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'aldrich_devourer', theme: 'magic', bossScale: 2.5 }, x, z)
            },
            {
                id: 'yhorm_the_giant',
                name: 'YHORM THE GIANT, PROFANED RECLUSE',
                title: 'Profaned Capital Sunken Throne &bull; Great Machete Downward Slam, Burning Lava Stomp & Lord Rage',
                unlockLocationId: 'profaned_capital',
                icon: '🗿',
                theme: 'dark',
                bossScale: 2.8,
                maxHp: 27500,
                damage: 1380,
                souls: 1300000,
                radius: 3.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'yhorm_the_giant', theme: 'dark', bossScale: 2.8 }, x, z)
            },
            {
                id: 'dancer_boreal_valley',
                name: 'DANCER OF THE BOREAL VALLEY',
                title: 'High Wall of Lothric Cathedral of Emma &bull; Dual Curved Swords (Flame & Dark Magic) & Infinite Spin',
                unlockLocationId: 'high_wall_lothric',
                icon: '💃',
                theme: 'frost',
                bossScale: 2.3,
                maxHp: 26000,
                damage: 1320,
                souls: 1240000,
                radius: 3.1,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'dancer_boreal_valley', theme: 'frost', bossScale: 2.3 }, x, z)
            },
            {
                id: 'oceiros_consumed_king',
                name: 'OCEIROS, THE CONSUMED KING',
                title: "Consumed King's Garden Deep Grove &bull; Moonlight Dragon Scepter, Blind Frenzy Charge & Ocelotte Cry",
                unlockLocationId: 'consumed_kings_garden',
                icon: '🐉',
                theme: 'magic',
                bossScale: 2.5,
                maxHp: 25200,
                damage: 1290,
                souls: 1180000,
                radius: 3.4,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'oceiros_consumed_king', theme: 'magic', bossScale: 2.5 }, x, z)
            },
            {
                id: 'demon_prince',
                name: 'THE DEMON PRINCE, CHAOS SOVEREIGN',
                title: 'The Dreg Heap Earthen Peak Ruins &bull; Chaos Bed Vestiges Laser, Meteor Fall & Burning Magma Dive',
                unlockLocationId: 'dreg_heap',
                icon: '🦇',
                theme: 'flame',
                bossScale: 2.8,
                maxHp: 29000,
                damage: 1440,
                souls: 1550000,
                radius: 3.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'demon_prince', theme: 'flame', bossScale: 2.8 }, x, z)
            },
            {
                id: 'halflight_spear_church',
                name: 'HALFLIGHT, SPEAR OF THE CHURCH',
                title: 'Ringed City Church of Filianore &bull; Frayed Blade Bleed Stance, Ritual Spear Fragments & Guardian Orbs',
                unlockLocationId: 'ringed_city',
                icon: '⚖️',
                theme: 'holy',
                bossScale: 2.1,
                maxHp: 26500,
                damage: 1350,
                souls: 1350000,
                radius: 3.0,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'halflight_spear_church', theme: 'holy', bossScale: 2.1 }, x, z)
            },
            {
                id: 'godfrey_first_elden_lord',
                name: 'GODFREY, FIRST ELDEN LORD & HOARAH LOUX',
                title: 'Leyndell Throne &bull; Earthshaker Shockwave, Colossal Battleaxe Cleave & Lion Spirit Serosh',
                unlockLocationId: 'er_leyndell_erdtree_sanctuary',
                icon: '🪓',
                theme: 'holy',
                bossScale: 2.3,
                maxHp: 27500,
                damage: 1380,
                souls: 1400000,
                radius: 3.2,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'godfrey_first_elden_lord', theme: 'holy', bossScale: 2.3 }, x, z)
            },
            {
                id: 'morgott_omen_king',
                name: 'MORGOTT, THE OMEN KING',
                title: 'Erdtree Sanctuary Gates &bull; Cursed Blood Greatsword, Golden Daggers & Holy Hammer Rain',
                unlockLocationId: 'er_leyndell_erdtree_sanctuary',
                icon: '👑',
                theme: 'holy',
                bossScale: 2.1,
                maxHp: 26000,
                damage: 1320,
                souls: 1300000,
                radius: 3.0,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'morgott_omen_king', theme: 'holy', bossScale: 2.1 }, x, z)
            },
            {
                id: 'rennala_queen_full_moon',
                name: 'RENNALA, QUEEN OF THE FULL MOON',
                title: 'Raya Lucaria Academy &bull; Full Moon Lunar Blast, Starlight Volley & Giant Spirit Summons',
                unlockLocationId: 'er_academy_debate_parlor',
                icon: '🌕',
                theme: 'magic',
                bossScale: 2.0,
                maxHp: 24500,
                damage: 1250,
                souls: 1200000,
                radius: 2.9,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'rennala_queen_full_moon', theme: 'magic', bossScale: 2.0 }, x, z)
            },
            {
                id: 'rykard_lord_blasphemy',
                name: 'RYKARD, LORD OF BLASPHEMY',
                title: 'Volcano Manor Magma Cavern &bull; Blasphemous Serpent Jaws, Rotted Skulls & Magma Sea',
                unlockLocationId: 'er_volcano_manor_guest_hall',
                icon: '🐍',
                theme: 'flame',
                bossScale: 2.8,
                maxHp: 29500,
                damage: 1450,
                souls: 1600000,
                radius: 3.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'rykard_lord_blasphemy', theme: 'flame', bossScale: 2.8 }, x, z)
            },
            {
                id: 'mohg_lord_of_blood',
                name: 'MOHG, LORD OF BLOOD',
                title: 'Mohgwyn Dynasty Mausoleum &bull; Sacred Spear NIHIL Ritual, Bloodflame Spray & Bat Wings',
                unlockLocationId: 'er_mohgwyn_dynasty_mausoleum',
                icon: '🩸',
                theme: 'blood',
                bossScale: 2.3,
                maxHp: 28000,
                damage: 1400,
                souls: 1500000,
                radius: 3.3,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'mohg_lord_of_blood', theme: 'blood', bossScale: 2.3 }, x, z)
            },
            {
                id: 'dragonlord_placidusax',
                name: 'DRAGONLORD PLACIDUSAX',
                title: 'Crumbling Farum Azula &bull; Golden Breath Storm, Red Lightning Spears & Timeless Claw Slashes',
                unlockLocationId: 'er_placidusax_storm_heart',
                icon: '⚡',
                theme: 'dragon',
                bossScale: 2.9,
                maxHp: 30000,
                damage: 1480,
                souls: 1700000,
                radius: 4.0,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'dragonlord_placidusax', theme: 'dragon', bossScale: 2.9 }, x, z)
            },
            {
                id: 'astel_naturalborn_void',
                name: 'ASTEL, NATURALBORN OF THE VOID',
                title: 'Ainsel Grand Cloister &bull; Nebula Meteorite Shower, Cosmic Pinchers & Gravity Shockwaves',
                unlockLocationId: 'er_astel_naturalborn_void',
                icon: '🌌',
                theme: 'cosmic',
                bossScale: 2.7,
                maxHp: 27000,
                damage: 1360,
                souls: 1350000,
                radius: 3.6,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'astel_naturalborn_void', theme: 'cosmic', bossScale: 2.7 }, x, z)
            },
            {
                id: 'elden_beast_god',
                name: 'ELDEN BEAST, LIVING INCARNATION OF ORDER',
                title: 'Elden Throne Arena &bull; Golden Sword Wave Arc, Elden Stars & Radiant Nebula Explosion',
                unlockLocationId: 'er_leyndell_erdtree_sanctuary',
                icon: '🌟',
                theme: 'holy',
                bossScale: 2.8,
                maxHp: 31000,
                damage: 1500,
                souls: 1800000,
                radius: 3.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'elden_beast_god', theme: 'holy', bossScale: 2.8 }, x, z)
            },
            {
                id: 'sister_friede_ariandel',
                name: 'SISTER FRIEDE & FATHER ARIANDEL',
                title: 'Painted World Chapel &bull; Blackflame Great Scythe, Ariandel Boiling Blood Flail & Frost Tread',
                unlockLocationId: 'ds3_painted_corvian_settlement',
                icon: '❄️',
                theme: 'frost',
                bossScale: 2.0,
                maxHp: 26500,
                damage: 1340,
                souls: 1380000,
                radius: 2.9,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'sister_friede_ariandel', theme: 'frost', bossScale: 2.0 }, x, z)
            },
            {
                id: 'demon_in_pain_below',
                name: 'DEMONS IN PAIN & FROM BELOW',
                title: 'Dreg Heap Earthen Peak &bull; Chaos Poison Claw, Searing Magma Dive & Twin Demon Trample',
                unlockLocationId: 'ds3_dreg_heap_earthen_peak',
                icon: '🔥',
                theme: 'flame',
                bossScale: 2.6,
                maxHp: 27000,
                damage: 1350,
                souls: 1400000,
                radius: 3.5,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'demon_in_pain_below', theme: 'flame', bossScale: 2.6 }, x, z)
            },
            {
                id: 'lady_maria_clocktower',
                name: 'LADY MARIA OF THE ASTRAL CLOCKTOWER',
                title: 'Astral Clocktower Veranda &bull; Rakuyo Twin Sabers, Bloodflame Extended Thrust & Visceral Finish',
                unlockLocationId: 'bb_research_hall_clocktower',
                icon: '🕰️',
                theme: 'blood',
                bossScale: 2.0,
                maxHp: 26000,
                damage: 1320,
                souls: 1350000,
                radius: 2.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'lady_maria_clocktower', theme: 'blood', bossScale: 2.0 }, x, z)
            },
            {
                id: 'ludwig_holy_blade',
                name: 'LUDWIG, THE ACCURSED & THE HOLY BLADE',
                title: 'Hunter Nightmare Underground Corpse Pile &bull; Moonlight Greatsword Waves, Bestial Trample & Arcane Slam',
                unlockLocationId: 'bb_central_yharnam_fountain',
                icon: '🐴',
                theme: 'magic',
                bossScale: 2.7,
                maxHp: 29000,
                damage: 1440,
                souls: 1600000,
                radius: 3.7,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'ludwig_holy_blade', theme: 'magic', bossScale: 2.7 }, x, z)
            },
            {
                id: 'laurence_first_vicar',
                name: 'LAURENCE, THE FIRST VICAR',
                title: 'Nightmare Grand Cathedral &bull; Severed Beast Legs Lava Crawl, Flaming Cleave & Beast Shriek',
                unlockLocationId: 'bb_cathedral_ward_grand',
                icon: '🌋',
                theme: 'flame',
                bossScale: 2.7,
                maxHp: 29500,
                damage: 1460,
                souls: 1650000,
                radius: 3.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'laurence_first_vicar', theme: 'flame', bossScale: 2.7 }, x, z)
            },
            {
                id: 'emma_gentle_blade',
                name: 'EMMA, THE GENTLE BLADE',
                title: 'Ashina Castle Upper Tower &bull; Gentle Ashina Cross, Flowing Deflection & Fire Vortex',
                unlockLocationId: 'sekiro_ashina_castle_lookout',
                icon: '🌸',
                theme: 'frost',
                bossScale: 1.9,
                maxHp: 24000,
                damage: 1220,
                souls: 1150000,
                radius: 2.7,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'emma_gentle_blade', theme: 'frost', bossScale: 1.9 }, x, z)
            },
            {
                id: 'inner_genichiro',
                name: 'INNER GENICHIRO, WAY OF TOMOE',
                title: 'Ashina Castle Roof &bull; Sakura Dance Aerial Spin, Floating Passage & Lightning Arrow Rain',
                unlockLocationId: 'sekiro_ashina_castle_lookout',
                icon: '🏹',
                theme: 'dragon',
                bossScale: 2.0,
                maxHp: 26000,
                damage: 1330,
                souls: 1350000,
                radius: 2.9,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'inner_genichiro', theme: 'dragon', bossScale: 2.0 }, x, z)
            },
            {
                id: 'inner_father_owl',
                name: 'INNER FATHER, MIST RAVEN SHINOBI',
                title: 'Hirata Audience Chamber &bull; Mist Raven Feathers, Blazing Owl Projectile & Shadowrush Thrust',
                unlockLocationId: 'sekiro_hirata_estate_blaze',
                icon: '🦉',
                theme: 'dark',
                bossScale: 2.2,
                maxHp: 27500,
                damage: 1380,
                souls: 1450000,
                radius: 3.1,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'inner_father_owl', theme: 'dark', bossScale: 2.2 }, x, z)
            },
            {
                id: 'twin_dragonriders',
                name: 'TWIN DRAGONRIDERS OF DRANGLEIC',
                title: 'Drangleic Castle Throne &bull; Twin Red-Iron Halberds, Greatbow Sniper & Tower Shield Bash',
                unlockLocationId: 'ds2_dragon_aerie_sky',
                icon: '🛡️',
                theme: 'dark',
                bossScale: 2.3,
                maxHp: 26500,
                damage: 1340,
                souls: 1350000,
                radius: 3.2,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'twin_dragonriders', theme: 'dark', bossScale: 2.3 }, x, z)
            },
            {
                id: 'looking_glass_knight',
                name: 'LOOKING GLASS KNIGHT & MIRROR PHANTOM',
                title: 'King Passage Storm Terrace &bull; Mirror Greatshield, Thunderous Lightning Cleave & Summon Phantom',
                unlockLocationId: 'ds2_shrine_of_amana_waters',
                icon: '🪞',
                theme: 'holy',
                bossScale: 2.4,
                maxHp: 27000,
                damage: 1360,
                souls: 1400000,
                radius: 3.3,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'looking_glass_knight', theme: 'holy', bossScale: 2.4 }, x, z)
            },
            {
                id: 'velstadt_royal_aegis',
                name: 'VELSTADT, THE ROYAL AEGIS',
                title: 'Undead Crypt King Chamber &bull; Sacred Chime Greathammer, Dark Hex Shot & Iron Resolve',
                unlockLocationId: 'ds2_brume_tower_throne',
                icon: '🔔',
                theme: 'dark',
                bossScale: 2.3,
                maxHp: 27500,
                damage: 1380,
                souls: 1450000,
                radius: 3.2,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'velstadt_royal_aegis', theme: 'dark', bossScale: 2.3 }, x, z)
            },
            {
                id: 'sinh_slumbering_dragon',
                name: 'SINH, THE SLUMBERING DRAGON',
                title: 'Dragon Sanctum Cavern &bull; Corundum Scales, Toxic Firebreath & Spear-Pierced Flight',
                unlockLocationId: 'ds2_dragon_aerie_sky',
                icon: '🦎',
                theme: 'rot',
                bossScale: 2.8,
                maxHp: 28500,
                damage: 1410,
                souls: 1500000,
                radius: 3.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'sinh_slumbering_dragon', theme: 'rot', bossScale: 2.8 }, x, z)
            },
            {
                id: 'flamelurker_volcano',
                name: 'FLAMELURKER, PRIMAL ASH ARCHDEMON',
                title: 'Stonefang Tunnel Mine Cavern &bull; Explosive Lava Fists, Leaping Volcanic Stomp & Frenzy Charge',
                unlockLocationId: 'des_boletaria_king_tower',
                icon: '💥',
                theme: 'flame',
                bossScale: 2.5,
                maxHp: 28000,
                damage: 1390,
                souls: 1480000,
                radius: 3.4,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'flamelurker_volcano', theme: 'flame', bossScale: 2.5 }, x, z)
            },
            {
                id: 'dragon_god_archdemon',
                name: 'DRAGON GOD, TITAN OF STONEFANG',
                title: 'Stonefang Deep Molten Sanctum &bull; Colossal Stone Fists, Magma Roar & Rubble Sweep',
                unlockLocationId: 'des_boletaria_king_tower',
                icon: '🗿',
                theme: 'flame',
                bossScale: 3.0,
                maxHp: 31000,
                damage: 1510,
                souls: 1750000,
                radius: 4.2,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'dragon_god_archdemon', theme: 'flame', bossScale: 3.0 }, x, z)
            },
            {
                id: 'penetrator_metas',
                name: 'PENETRATOR, CHAMPION OF BOLETARIA',
                title: 'Boletaria Inner Courtyard &bull; Radiant Silver Rapier, Piercing Impalement & Blazing Lunges',
                unlockLocationId: 'des_boletaria_king_tower',
                icon: '🗡️',
                theme: 'holy',
                bossScale: 2.2,
                maxHp: 26500,
                damage: 1350,
                souls: 1380000,
                radius: 3.0,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'penetrator_metas', theme: 'holy', bossScale: 2.2 }, x, z)
            },
            {
                id: 'old_monk_golden_robe',
                name: 'OLD MONK, CORRUPTED GOLDEN ROBE',
                title: 'Latria Ivory Tower Sanctum &bull; Homing Soul Orbs, Golden Robe Claws & Parrying Claws',
                unlockLocationId: 'des_latria_ivory_tower',
                icon: '📿',
                theme: 'magic',
                bossScale: 2.0,
                maxHp: 25500,
                damage: 1300,
                souls: 1300000,
                radius: 2.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'old_monk_golden_robe', theme: 'magic', bossScale: 2.0 }, x, z)
            },
            {
                id: 'radahn_starscourge',
                name: 'STARCOURGE RADAHN, GENERAL OF REDMANE',
                title: 'Caelid Wastes &bull; Gravitational Curved Blades, Starfall Meteor Crash & Leonard Warhorse',
                unlockLocationId: 'outside_darkroot_expanse',
                icon: '🌠',
                theme: 'dark',
                bossScale: 2.8,
                maxHp: 32000,
                damage: 1480,
                souls: 2000000,
                radius: 3.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createStarscourgeRadahn(x, z)
            },
            {
                id: 'dancing_lion',
                name: 'DIVINE BEAST DANCING LION',
                title: 'Belurat Tower Settlement &bull; Storm Gale Cyclone, Frost Stomp & Lightning Roar',
                unlockLocationId: 'ashen_dune_wastes',
                icon: '🦁',
                theme: 'holy',
                bossScale: 2.6,
                maxHp: 30500,
                damage: 1440,
                souls: 1850000,
                radius: 3.4,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createDancingLion(x, z)
            },
            {
                id: 'outside_ancient_dragon_senessax',
                name: 'ANCIENT DRAGON SENESSAX',
                title: 'Wyrm Cliffside Plateau &bull; Red Lightning Tempest Storm, Gravel Stone Stomp & Ancient Dragon Magma',
                unlockLocationId: 'outside_sunken_dragon_crypt',
                icon: '⚡',
                theme: 'dragon',
                bossScale: 3.1,
                maxHp: 33500,
                damage: 1520,
                souls: 2200000,
                radius: 4.2,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'outside_ancient_dragon_senessax', theme: 'dragon', bossScale: 3.1 }, x, z)
            },
            {
                id: 'outside_death_rite_bird',
                name: 'DEATH RITE BIRD OF ASH',
                title: 'Ashen Dune Hollow &bull; Ghostflame Ignition, Explosive Death Fog & Skeletal Pecking Dive',
                unlockLocationId: 'outside_ancient_dolmen_colonnade',
                icon: '🦅',
                theme: 'dark',
                bossScale: 2.7,
                maxHp: 31000,
                damage: 1470,
                souls: 1950000,
                radius: 3.6,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createDeathRiteBird ? cf.createDeathRiteBird(x, z) : cf.createSoulsborneBoss({ id: 'outside_death_rite_bird', theme: 'dark', bossScale: 2.7 }, x, z)
            },
            {
                id: 'outside_fallingstar_beast',
                name: 'FULL-GROWN FALLINGSTAR BEAST',
                title: 'Astral Meteor Crater &bull; Gravitational Pulse Cataclysm, Cosmic Mandible Crush & Tail Spike Whip',
                unlockLocationId: 'outside_astral_meteor_crater',
                icon: '☄️',
                theme: 'cosmic',
                bossScale: 2.9,
                maxHp: 32500,
                damage: 1500,
                souls: 2100000,
                radius: 3.9,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createFallingstarBeast ? cf.createFallingstarBeast(x, z) : cf.createSoulsborneBoss({ id: 'outside_fallingstar_beast', theme: 'cosmic', bossScale: 2.9 }, x, z)
            },
            {
                id: 'outside_erdtree_avatar',
                name: 'PUTRID ERDTREE AVATAR',
                title: 'Primeval Mother Archtree &bull; Golden Landslam Shockwave, Scarlet Rot Spore Cloud & Holy Stars Volley',
                unlockLocationId: 'outside_rotten_grove_sanctum',
                icon: '🌳',
                theme: 'rot',
                bossScale: 2.6,
                maxHp: 30000,
                damage: 1440,
                souls: 1850000,
                radius: 3.5,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createErdtreeAvatar ? cf.createErdtreeAvatar(x, z) : cf.createSoulsborneBoss({ id: 'outside_erdtree_avatar', theme: 'rot', bossScale: 2.6 }, x, z)
            },
            {
                id: 'outside_grave_warden_black_knight',
                name: 'GRAVE WARDEN BLACK KNIGHT CHAMPION',
                title: 'Outside Realm: Darkroot Woods &bull; Colossal Black Knight Greataxe & Dark Flame Stance',
                unlockLocationId: 'outside_darkroot_bonfire',
                icon: '🪓',
                theme: 'dark',
                bossScale: 2.2,
                maxHp: 28000,
                damage: 1350,
                souls: 1400000,
                radius: 2.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'outside_grave_warden_black_knight', theme: 'dark', bossScale: 2.2 }, x, z)
            },
            {
                id: 'outside_ancient_dragon_lansseax',
                name: 'ANCIENT DRAGON LANSSEAX, PRIESTESS OF LIGHTNING',
                title: 'Outside Realm: Wyrm Ridge Altar &bull; Crimson Red Lightning Glaive & Draconic Roar',
                unlockLocationId: 'outside_wyrm_ridge_altar',
                icon: '⚡',
                theme: 'dragon',
                bossScale: 2.8,
                maxHp: 32000,
                damage: 1480,
                souls: 2000000,
                radius: 4.2,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createAncientDragonLansseax ? cf.createAncientDragonLansseax(x, z) : cf.createSoulsborneBoss({ id: 'outside_ancient_dragon_lansseax', theme: 'dragon', bossScale: 2.8 }, x, z)
            },
            {
                id: 'outside_sanctuary_stone_titan',
                name: 'SANCTUARY TITAN, GUARDIAN OF THE PRECIPICE',
                title: 'Outside Realm: Western Precipice &bull; Colossal Granite Greatsword & Earthquake Slam',
                unlockLocationId: 'outside_western_precipice',
                icon: '🗿',
                theme: 'holy',
                bossScale: 2.7,
                maxHp: 31000,
                damage: 1420,
                souls: 1900000,
                radius: 3.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSanctuaryStoneTitan ? cf.createSanctuaryStoneTitan(x, z) : cf.createSoulsborneBoss({ id: 'outside_sanctuary_stone_titan', theme: 'holy', bossScale: 2.7 }, x, z)
            },
            {
                id: 'er_bell_bearing_hunter',
                name: 'ELEMER OF THE BRIAR, BELL BEARING HUNTER',
                title: 'The Shaded Castle Inner Keep &bull; Marais Dancing Executioner Sword & Telekinetic Whirlwind',
                unlockLocationId: 'er_altus_windmill_village',
                icon: '🗡️',
                theme: 'blood',
                bossScale: 2.2,
                maxHp: 27000,
                damage: 1380,
                souls: 1500000,
                radius: 2.6,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'er_bell_bearing_hunter', theme: 'blood', bossScale: 2.2 }, x, z)
            },
            {
                id: 'er_draconic_tree_sentinel',
                name: 'DRACONIC TREE SENTINEL OF THE CAPITAL',
                title: 'Leyndell Outer Wall Ramparts &bull; Dragon Greatclaw, Malformed Shield & Red Lightning Smite',
                unlockLocationId: 'er_leyndell_outer_moat',
                icon: '🛡️',
                theme: 'gold',
                bossScale: 2.5,
                maxHp: 29000,
                damage: 1400,
                souls: 1650000,
                radius: 3.4,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createSoulsborneBoss({ id: 'er_draconic_tree_sentinel', theme: 'gold', bossScale: 2.5 }, x, z)
            },
            {
                id: 'maliketh_black_blade',
                name: 'MALIKETH, THE BLACK BLADE',
                title: 'Abyssal Eclipse Chasm &bull; Destined Death Greatsword, Bestial Incantations & Red Black Wave',
                unlockLocationId: 'outside_abyssal_eclipse_chasm',
                icon: '🗡️',
                theme: 'blood',
                bossScale: 2.6,
                maxHp: 36000,
                damage: 1580,
                souls: 2500000,
                radius: 3.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createMalikethBlackBlade ? cf.createMalikethBlackBlade(x, z) : cf.createSoulsborneBoss({ id: 'maliketh_black_blade', theme: 'blood', bossScale: 2.6 }, x, z)
            },
            {
                id: 'dragonlord_placidusax',
                name: 'DRAGONLORD PLACIDUSAX',
                title: 'Scorched Dragonbarrow &bull; Dual Heads Golden Ruin Breath, Red Lightning Claw & Tempest Storm',
                unlockLocationId: 'outside_scorched_dragonbarrow',
                icon: '🐉',
                theme: 'gold',
                bossScale: 3.5,
                maxHp: 42000,
                damage: 1650,
                souls: 3000000,
                radius: 4.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createDragonlordPlacidusax ? cf.createDragonlordPlacidusax(x, z) : cf.createSoulsborneBoss({ id: 'dragonlord_placidusax', theme: 'gold', bossScale: 3.5 }, x, z)
            },
            {
                id: 'lichdragon_fortissax',
                name: 'LICHDRAGON FORTISSAX',
                title: 'Forbidden Mistwood Ruins &bull; Twin Red Lightning Spears, Deathblight Fog & Corrupted Wings',
                unlockLocationId: 'outside_forbidden_mistwood',
                icon: '⚡',
                theme: 'dark',
                bossScale: 3.2,
                maxHp: 38000,
                damage: 1600,
                souls: 2750000,
                radius: 4.4,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createLichdragonFortissax ? cf.createLichdragonFortissax(x, z) : cf.createSoulsborneBoss({ id: 'lichdragon_fortissax', theme: 'dark', bossScale: 3.2 }, x, z)
            },
            {
                id: 'rennala_queen_full_moon',
                name: 'RENNALA, QUEEN OF THE FULL MOON',
                title: 'Carian Star Observatory &bull; Full Moon Sorcery, Carian Regal Scepter & Glintstone Comets',
                unlockLocationId: 'outside_carian_star_observatory',
                icon: '🌕',
                theme: 'magic',
                bossScale: 2.2,
                maxHp: 34000,
                damage: 1480,
                souls: 2200000,
                radius: 3.2,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createRennalaFullMoon ? cf.createRennalaFullMoon(x, z) : cf.createSoulsborneBoss({ id: 'rennala_queen_full_moon', theme: 'magic', bossScale: 2.2 }, x, z)
            },
            {
                id: 'borealis_freezing_fog',
                name: 'BOREALIS, THE FREEZING FOG',
                title: 'Frozen Wyrmpeak Precipice &bull; Piercing Glacial Roar, Blizzard Breath & Prismatic Icicles',
                unlockLocationId: 'outside_frozen_wyrmpeak_precipice',
                icon: '❄️',
                theme: 'frost',
                bossScale: 3.4,
                maxHp: 37000,
                damage: 1550,
                souls: 2600000,
                radius: 4.5,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createBorealisFreezingFog ? cf.createBorealisFreezingFog(x, z) : cf.createSoulsborneBoss({ id: 'borealis_freezing_fog', theme: 'frost', bossScale: 3.4 }, x, z)
            },
            {
                id: 'consort_radahn_miquella',
                name: 'PROMISED CONSORT RADAHN',
                title: 'Stormveil Cliffside Ramparts &bull; Twin Greatswords of Light, Miquella Golden Halo & Divine Pillar',
                unlockLocationId: 'outside_stormveil_cliffside_ramparts',
                icon: '👑',
                theme: 'holy',
                bossScale: 2.8,
                maxHp: 45000,
                damage: 1720,
                souls: 3500000,
                radius: 4.0,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createConsortRadahn ? cf.createConsortRadahn(x, z) : cf.createSoulsborneBoss({ id: 'consort_radahn_miquella', theme: 'holy', bossScale: 2.8 }, x, z)
            },
            {
                id: 'malenia_goddess_of_rot',
                name: 'MALENIA, GODDESS OF ROT',
                title: 'Caelid Rot Miasma Swamp &bull; Waterfowl Dance Katana, Aeonian Scarlet Wings & Flower Bloom',
                unlockLocationId: 'outside_rot_miasma_swamp',
                icon: '🌺',
                theme: 'rot',
                bossScale: 2.6,
                maxHp: 48000,
                damage: 1780,
                souls: 3800000,
                radius: 3.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createMaleniaGoddessOfRot ? cf.createMaleniaGoddessOfRot(x, z) : cf.createSoulsborneBoss({ id: 'malenia_goddess_of_rot', theme: 'rot', bossScale: 2.6 }, x, z)
            },
            {
                id: 'fire_giant_flame_peak',
                name: 'FIRE GIANT OF THE MOUNTAINTOPS',
                title: 'Mountaintops Flame Peak &bull; Fell God Chest Eye, Avalanching Bone Basin & Volcanic Slam',
                unlockLocationId: 'outside_flame_peak_cauldron',
                icon: '🔥',
                theme: 'fire',
                bossScale: 3.6,
                maxHp: 55000,
                damage: 1850,
                souls: 4200000,
                radius: 4.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createFireGiantFlamePeak ? cf.createFireGiantFlamePeak(x, z) : cf.createSoulsborneBoss({ id: 'fire_giant_flame_peak', theme: 'fire', bossScale: 3.6 }, x, z)
            },
            {
                id: 'astel_naturalborn_void',
                name: 'ASTEL, NATURALBORN OF THE VOID',
                title: 'Nokstella Eternal Moon Terrace &bull; Cosmic Gravity Pincers, Nebula Beam & Meteor Shower',
                unlockLocationId: 'outside_nokstella_moon_terrace',
                icon: '🌌',
                theme: 'cosmic',
                bossScale: 3.0,
                maxHp: 44000,
                damage: 1680,
                souls: 3400000,
                radius: 4.2,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createAstelNaturalbornVoid ? cf.createAstelNaturalbornVoid(x, z) : cf.createSoulsborneBoss({ id: 'astel_naturalborn_void', theme: 'cosmic', bossScale: 3.0 }, x, z)
            },
            {
                id: 'bayle_the_dread',
                name: 'BAYLE THE DREAD',
                title: 'Farum Azula Crumbling Tempest &bull; Dread Magma Horns, Severed Dragon Wings & Tempest Lightning',
                unlockLocationId: 'outside_farum_azula_tempest',
                icon: '🐉',
                theme: 'dragon',
                bossScale: 3.5,
                maxHp: 52000,
                damage: 1820,
                souls: 4000000,
                radius: 4.6,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createBayleTheDread ? cf.createBayleTheDread(x, z) : cf.createSoulsborneBoss({ id: 'bayle_the_dread', theme: 'dragon', bossScale: 3.5 }, x, z)
            },
            {
                id: 'godfrey_first_elden_lord',
                name: 'GODFREY, FIRST ELDEN LORD',
                title: 'Leyndell Erdtree Colosseum &bull; Axe of Godfrey, Beast Regent Serosh & Earthshaker Tremor',
                unlockLocationId: 'outside_golden_capital_colosseum',
                icon: '🏛️',
                theme: 'holy',
                bossScale: 2.7,
                maxHp: 47000,
                damage: 1750,
                souls: 3700000,
                radius: 3.9,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createGodfreyFirstEldenLord ? cf.createGodfreyFirstEldenLord(x, z) : cf.createSoulsborneBoss({ id: 'godfrey_first_elden_lord', theme: 'holy', bossScale: 2.7 }, x, z)
            },
            {
                id: 'ludwig_holy_blade',
                name: 'LUDWIG THE HOLY BLADE',
                title: 'Cathedral of the Deep &bull; Moonlight Greatsword, Accursed Beast Maw & Arcane Beam Waves',
                unlockLocationId: 'outside_drowned_abyssal_necropolis',
                icon: '🗡️',
                theme: 'magic',
                bossScale: 2.9,
                maxHp: 46000,
                damage: 1710,
                souls: 3600000,
                radius: 4.1,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createLudwigHolyBlade ? cf.createLudwigHolyBlade(x, z) : cf.createSoulsborneBoss({ id: 'ludwig_holy_blade', theme: 'magic', bossScale: 2.9 }, x, z)
            },
            {
                id: 'outside_bayle_the_dread',
                name: 'BAYLE THE DREAD, APEX DRAGON OF DREAD',
                title: 'Outside Realm: Jagged Peak Caldera &bull; Magma Breath, Severed Dragon Wings & Tempest Scarlet Lightning',
                unlockLocationId: 'outside_jagged_peak_caldera',
                icon: '🐉',
                theme: 'flame',
                bossScale: 3.5,
                maxHp: 56000,
                damage: 1850,
                souls: 4200000,
                radius: 4.6,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createBayleTheDread ? cf.createBayleTheDread(x, z) : cf.createSoulsborneBoss({ id: 'bayle_the_dread', theme: 'flame', bossScale: 3.5 }, x, z)
            },
            {
                id: 'outside_messmer_the_impaler',
                name: 'MESSMER THE IMPALER, LORD OF SHADOW KEEP',
                title: 'Outside Realm: Shadow Keep Ramparts &bull; Crimson Flame Spear, Coiled Abyssal Serpents & Impalement',
                unlockLocationId: 'outside_shadow_keep_ramparts',
                icon: '🐍',
                theme: 'flame',
                bossScale: 2.6,
                maxHp: 51000,
                damage: 1780,
                souls: 3900000,
                radius: 3.6,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createMessmerTheImpaler ? cf.createMessmerTheImpaler(x, z) : cf.createSoulsborneBoss({ id: 'messmer_the_impaler', theme: 'flame', bossScale: 2.6 }, x, z)
            },
            {
                id: 'outside_midra_frenzied_flame',
                name: 'MIDRA, LORD OF FRENZIED FLAME',
                title: 'Outside Realm: Frenzied Flame Abyss &bull; Barbed Greatsword of Damnation, Frenzied Burst & Searing Sun Head',
                unlockLocationId: 'outside_frenzied_flame_abyss',
                icon: '👁️',
                theme: 'frenzy',
                bossScale: 2.7,
                maxHp: 49000,
                damage: 1750,
                souls: 3800000,
                radius: 3.8,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createMidraFrenziedFlame ? cf.createMidraFrenziedFlame(x, z) : cf.createSoulsborneBoss({ id: 'midra_frenzied_flame', theme: 'frenzy', bossScale: 2.7 }, x, z)
            },
            {
                id: 'outside_bloodhound_darriwil',
                name: 'BLOODHOUND KNIGHT DARRIWIL',
                title: 'Outside Realm: Forlorn Bloodhound Evergaol &bull; Predatory Low-Slung Sweep, Bloodhound Step & Cold Fang Blade',
                unlockLocationId: 'outside_bloodhound_gaol',
                icon: '🐺',
                theme: 'frost',
                bossScale: 2.4,
                maxHp: 42000,
                damage: 1640,
                souls: 3200000,
                radius: 3.2,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createBloodhoundKnightMob ? cf.createBloodhoundKnightMob(x, z, 0, 0) : cf.createSoulsborneBoss({ id: 'bloodhound_knight', theme: 'frost', bossScale: 2.4 }, x, z)
            },
            {
                id: 'outside_crystalian_matrix_trio',
                name: 'CRYSTALIAN MATRIX HIGH TRIO',
                title: 'Outside Realm: Glintstone Crystalian Matrix &bull; Refractive Chakram Blades, Glintstone Ring Throw & Crystalline Armor',
                unlockLocationId: 'outside_crystalian_cavern_matrix',
                icon: '💎',
                theme: 'magic',
                bossScale: 2.5,
                maxHp: 47000,
                damage: 1690,
                souls: 3600000,
                radius: 3.5,
                spawnPos: { x: 0, z: 330 },
                create: (cf, x, z) => cf.createCrystalianBlademaiden ? cf.createCrystalianBlademaiden(x, z, 0, 0) : cf.createSoulsborneBoss({ id: 'crystalian_matrix', theme: 'magic', bossScale: 2.5 }, x, z)
            }
        ];
    }

    // Check sequential boss progression (override if admin mode active)
    isBossUnlocked(bossId) {
        if (this.adminModeUnlocked) return true;
        if (!bossId || bossId === this.bossRoster[0].id) return true;
        const idx = this.bossRoster.findIndex(b => b.id === bossId);
        if (idx <= 0) return true;
        const prevBoss = this.bossRoster[idx - 1];
        return this.defeatedBosses.includes(prevBoss.id);
    }

    initEnemies(charFactory) {
        this.charFactory = charFactory;
        this.spawnEnemies();
    }

    spawnBoss(bossId = this.currentBossType, x = null, z = null) {
        if (this.boss && this.boss.mesh) {
            this.game.scene.remove(this.boss.mesh);
        }

        const def = this.bossRoster.find(b => b.id === bossId) || this.bossRoster[0];
        this.currentBossType = def.id;

        const posX = (x !== null) ? x : (def.spawnPos ? def.spawnPos.x : 0);
        const posZ = (z !== null) ? z : (def.spawnPos ? def.spawnPos.z : 330);

        const bossMesh = def.create(this.charFactory, posX, posZ);
        this.boss = {
            id: def.id,
            type: 'boss',
            name: def.name,
            title: def.title,
            icon: def.icon,
            mesh: bossMesh,
            maxHp: (this.qaOneHpMobs || (window.qaSuite && window.qaSuite.qaOneHpMobsActive)) ? 1 : def.maxHp,
            hp: (this.qaOneHpMobs || (window.qaSuite && window.qaSuite.qaOneHpMobsActive)) ? 1 : def.maxHp,
            damage: def.damage,
            souls: def.souls,
            radius: def.radius,
            state: 'IDLE',
            stateTimer: 0,
            cooldown: 0,
            isPhase2: false,
            isDead: false,
            isAttacking: false,
            attackType: '',
            animTime: 0,
            comboStep: 0
        };

        if (this.game && this.game.ui && this.game.ui.bossName) {
            this.game.ui.bossName.textContent = def.name;
        }

        return this.boss;
    }

    switchBoss(bossId) {
        if (!this.isBossUnlocked(bossId)) {
            const idx = this.bossRoster.findIndex(b => b.id === bossId);
            const prevBoss = this.bossRoster[idx - 1];
            const prevName = prevBoss ? prevBoss.name : 'previous Lord';
            this.game.showNotification(`🔒 LOCKED: Defeat ${prevName} first!`);
            if (this.audio) this.audio.playRoll();
            return null;
        }

        const def = this.bossRoster.find(b => b.id === bossId) || this.bossRoster[0];
        const boss = this.spawnBoss(bossId);
        this.audio.playBellToll();
        this.game.showNotification(`CHALLENGE READY: ${boss.name}`);

        // Warp player to the entrance of the arena or catacombs mausoleum
        if (bossId === 'nito') {
            this.game.playerMesh.position.set(-20, -5.8, 98);
            this.game.playerMesh.rotation.y = 0;
            this.game.cameraYaw = 0;
            this.game.cameraPitch = 0.15;
            this.game.showNotification("WARPED TO CATACOMBS SANCTUM OF THE DEAD");
        } else {
            this.game.playerMesh.position.set(0, 0, 100);
            this.game.playerMesh.rotation.y = 0;
            this.game.cameraYaw = 0;
            this.game.cameraPitch = 0.15;
        }

        // If player enters arena, awaken boss immediately
        if (bossId === 'nito' && this.game.playerMesh.position.z > 96) {
            this.boss.state = 'CHASE';
            this.audio.setBossMusic(true);
            this.game.showBossHpBar(this.boss);
        } else if (this.game.playerMesh.position.z > 98) {
            this.boss.state = 'CHASE';
            this.audio.setBossMusic(true);
            this.game.showBossHpBar(this.boss);
        }
        return boss;
    }

    spawnEnemies() {
        // Clear any remaining enemies, arrows, and ragdolls
        this.enemies.forEach(e => {
            if (e.mesh) this.game.scene.remove(e.mesh);
        });
        this.enemies = [];

        if (this.arrows) {
            this.arrows.forEach(a => {
                if (a.mesh) this.game.scene.remove(a.mesh);
            });
            this.arrows = [];
        }
        if (this.ragdolls) {
            this.ragdolls.forEach(r => {
                if (r.mesh) this.game.scene.remove(r.mesh);
            });
            this.ragdolls = [];
        }

        // BALANCED MOBS SPAWNING ACROSS ALL AREAS (Bridge, Ramparts, Catacombs, Outskirts, Sanctum)
        const mobList = (window.DarkSoulsLore && window.DarkSoulsLore.mobs) || window.DARK_SOULS_MOBS || [];
        if (mobList.length > 0) {
            let starterZoneCount = 0;
            let meleeCount = 0;
            const spawnedCoords = [];

            mobList.forEach(mobDef => {
                const rawPos = mobDef.defaultPos;
                if (!rawPos || (rawPos[0] === 0 && rawPos[1] === 0 && rawPos[2] === 0)) return;

                let px = rawPos[0];
                let py = rawPos[1];
                let pz = rawPos[2];

                // Scale & distribute mobs across the paths:
                if (pz >= 20 && pz <= 95 && Math.abs(px) < 8.5) {
                    pz = 35 + ((pz - 20) / 75) * 230;
                } else if (pz >= 20 && pz <= 95 && px > 10.0) {
                    pz = 30 + ((pz - 20) / 75) * 235;
                } else if (pz >= 20 && pz <= 95 && px < -10.0) {
                    pz = 30 + ((pz - 20) / 75) * 235;
                } else if (pz > 95 && pz <= 150) {
                    pz = 150 + ((pz - 95) / 55) * 115;
                }

                const dist = Math.sqrt(px * px + pz * pz);

                // 1. Safe Sanctuary: Mobs are NOT close to starting bonfire / base (26m radius safe zone)
                if (dist < 26.0) return;

                // Boss Arena sanctuary
                if (px >= -22 && px <= 22 && pz >= 272 && pz <= 390) return;

                // 2. Twice less melee mobs: skip every 2nd melee mob
                const isMelee = !mobDef.isArcher && (mobDef.behaviorType !== 'Ranged');
                if (isMelee) {
                    meleeCount++;
                    if (meleeCount % 2 === 0) return;
                }

                // Starter Courtyard density: up to 6 distant sentries max
                if (dist < 36.0) {
                    if (starterZoneCount >= 6) return;
                    starterZoneCount++;
                }

                // Clean spacing threshold (8.5m² / ~2.9m) to prevent mob clumping
                const isTooClose = spawnedCoords.some(c => {
                    const dx = c[0] - px;
                    const dz = c[1] - pz;
                    return (dx * dx + dz * dz) < 8.5;
                });
                if (isTooClose) return;

                spawnedCoords.push([px, pz]);
                // Primary Mob
                this.createCustomMob(mobDef, px, pz, 0, py);

                // Flanker squads only for ranged/archers on ramparts & bridges (never duplicate melee swarms)
                if (!isMelee) {
                    const isBridge = (pz >= 35 && pz <= 265 && Math.abs(px) < 7.5);
                    const isRamparts = (pz >= 30 && pz <= 265 && px >= 13.0 && px <= 24.5);
                    if (isBridge || isRamparts) {
                        const fx1 = px + (isBridge ? 2.4 : 1.6);
                        const fz1 = pz + 2.8;
                        this.createCustomMob(mobDef, fx1, fz1, 0.2, py);
                    }
                }
            });
        }

        // 3X SERPENT SANCTUM MOBS (16 Mobs across descending halls featuring 30 Gorgon Medusa Variants)
        const sanctumPositions = [
            [-5.0, 0, -28.0], [5.0, 0, -28.0], [0, 0, -32.0],
            [-10.0, -2.5, -45.0], [10.0, -2.5, -45.0], [0, -2.5, -50.0],
            [-12.0, -2.5, -55.0], [12.0, -2.5, -55.0], [-6.0, -2.5, -62.0],
            [6.0, -2.5, -62.0], [0, -2.5, -70.0], [-10.0, -4.0, -78.0],
            [10.0, -4.0, -78.0], [-4.0, -4.0, -88.0], [4.0, -4.0, -88.0],
            [0, -4.0, -92.0]
        ];
        sanctumPositions.forEach((pos, idx) => {
            const isGorgon = (idx % 2 === 1) || (idx >= 8);
            const gVariants = DarkSoulsCharacters.GORGON_VARIANTS || [];
            const variantIdx = idx % (gVariants.length || 1);
            const variant = gVariants[variantIdx] || { id: 'medusa_petrified_queen', name: 'MEDUSA, PETRIFIED QUEEN' };
            const sMob = {
                id: isGorgon ? `gorgon_sanctum_${idx}` : `serpent_mob_${idx}`,
                name: isGorgon ? variant.name : 'MAN-SERPENT TEMPLE GUARD',
                variantIndex: variantIdx,
                variantId: variant.id,
                meshType: isGorgon ? 'gorgon_medusa' : 'man_serpent_warrior',
                hp: isGorgon ? (idx >= 13 ? 1600 : 1250) : 620,
                damage: isGorgon ? (idx >= 13 ? 180 : 145) : 110,
                souls: isGorgon ? (idx >= 13 ? 4200 : 3200) : 1600,
                speed: 2.7,
                attackReach: isGorgon ? 3.4 : 2.8,
                behaviorType: 'Heavy Tank'
            };
            this.createCustomMob(sMob, pos[0], pos[2], 0, pos[1]);
        });

        // 3X LORDRAN ARCHERS (18 Archers solidly grounded on ramparts & defenses)
        const archerPositions = [
            // East High Castle Ramparts (y = 6.0, battlements walkway)
            [18.0, 6.0, 36.0], [18.0, 6.0, 55.0], [18.0, 6.0, 75.0],
            [18.0, 6.0, 95.0], [18.0, 6.0, 120.0], [18.0, 6.0, 140.0],
            [18.0, 6.0, 165.0], [18.0, 6.0, 190.0], [21.0, 6.0, 215.0],
            [21.0, 6.0, 240.0], [21.0, 6.0, 268.0],
            // Royal Viaduct Bridge Parapets & Sentries (y = 0.0)
            [-7.5, 0.0, 45.0], [-7.5, 0.0, 75.0], [-7.5, 0.0, 110.0],
            [-7.5, 0.0, 150.0], [-7.5, 0.0, 210.0],
            // Courtyard Watch Sentries (firmly grounded at y = 0.0, z = 2.0 on solid courtyard paving)
            [-12.0, 0.0, 2.0], [12.0, 0.0, 2.0]
        ];
        archerPositions.forEach((pos, idx) => {
            const isRune = (idx % 2 === 1) || (idx >= 8 && idx <= 10);
            const aMob = {
                id: `undead_archer_${idx}`,
                name: isRune ? 'CARIAN GLINTSTONE RUNE ARCHER' : ((idx >= 15) ? 'ANOR LONDO GREATBOW ARCHER' : 'RAMPART HOLLOW SNIPER'),
                meshType: isRune ? 'rune_archer' : 'archer',
                isArcher: true,
                isRuneArcher: isRune,
                behaviorType: 'Ranged',
                aiType: 'Ranged',
                hp: isRune ? 380 : ((idx >= 15) ? 420 : 250),
                damage: isRune ? 32 : ((idx >= 15) ? 28 : 20),
                souls: isRune ? 550 : ((idx >= 15) ? 800 : 240),
                speed: 1.8,
                attackReach: 38.0
            };
            this.createCustomMob(aMob, pos[0], pos[2], 0, pos[1]);
        });

        // 3X OUTSIDE REALM MOBS (42 Mobs across outskirts, dragon chasm, darkroot & new expeditions)
        const outsidePositions = [
            [-50.0, -2.0, 8.0], [-54.0, -2.0, 14.0], [-62.0, -2.0, 20.0],
            [-56.0, -2.0, 28.0], [-68.0, -2.0, 12.0], [-65.0, -2.0, 32.0],
            [-60.0, 0, -32.0], [-68.0, 0, -25.0], [-105.0, 0, 15.0],
            [-95.0, 0, 22.0], [-85.0, 0, 40.0], [-90.0, 0, 32.0],
            [-125.0, 0, -35.0], [-120.0, 0, -25.0], [-135.0, 0, -18.0],
            [-148.0, 2.0, 38.0], [-155.0, 2.0, 44.0], [-168.0, 2.0, 55.0],
            [-175.0, 2.0, 62.0], [-182.0, 2.0, 48.0], [-140.0, 0, -10.0],
            [-110.0, 0, -42.0], [-78.0, 0, -15.0], [-52.0, -2.0, 22.0],
            // New Outside Expedition Patrols:
            [-105.0, 3.5, -80.0], [-108.0, 3.5, -90.0], [-98.0, 3.5, -85.0], // Carian Star Observatory
            [-205.0, 2.0, 55.0], [-215.0, 2.0, 65.0], [-210.0, 2.0, 50.0],   // Scorched Dragonbarrow
            [-62.0, 0.0, -70.0], [-68.0, 0.0, -80.0], [-72.0, 0.0, -74.0],   // Forbidden Mistwood Ruins
            [-220.0, -4.0, -32.0], [-228.0, -4.0, -38.0], [-225.0, -4.0, -42.0], // Abyssal Eclipse Chasm
            [-236.0, 6.0, 12.0], [-244.0, 6.0, 18.0], [-240.0, 6.0, 22.0],   // Frozen Wyrmpeak Precipice
            [-140.0, 4.0, -92.0], [-148.0, 4.0, -98.0], [-144.0, 4.0, -90.0],  // Stormveil Cliffside Ramparts
            // New Outside Expansion Patrols (Rot Miasma, Flame Peak, Nokstella, Farum Azula, Leyndell, Abyssal Necropolis)
            [-180.0, 0.0, -95.0], [-188.0, 0.0, -105.0], [-185.0, 0.0, -112.0], // Caelid Rot Miasma Swamp
            [-240.0, 8.0, -75.0], [-248.0, 8.0, -85.0], [-245.0, 8.0, -90.0],   // Mountaintops Flame Peak Cauldron
            [-120.0, -3.0, 100.0], [-128.0, -3.0, 110.0], [-125.0, -3.0, 115.0], // Nokstella Eternal Moon Terrace
            [-230.0, 7.0, -115.0], [-238.0, 7.0, -125.0], [-235.0, 7.0, -130.0], // Farum Azula Crumbling Tempest
            [-170.0, 5.0, 110.0], [-178.0, 5.0, 120.0], [-175.0, 5.0, 125.0],   // Leyndell Erdtree Colosseum
            [-90.0, -2.5, 120.0], [-98.0, -2.5, 130.0], [-95.0, -2.5, 135.0],    // Cathedral Drowned Necropolis
            // Outside Apex Expedition Patrols (Caldera, Shadow Keep, Frenzied Abyss, Haligtree, Archdragon, Evergaol, Crystal Matrix)
            [-260.0, 4.0, 75.0], [-268.0, 4.0, 82.0], [-254.0, 4.0, 68.0],        // Jagged Peak Caldera (Draconic Beastmen & Bayle)
            [-175.0, 4.0, -115.0], [-182.0, 4.0, -122.0], [-168.0, 4.0, -108.0],    // Shadow Keep Ramparts (Crucible Horned Sentinels)
            [-245.0, -4.0, -85.0], [-252.0, -4.0, -92.0], [-238.0, -4.0, -78.0],    // Frenzied Flame Abyss (Frenzied Flame Acolytes)
            [-95.0, 2.0, 95.0], [-102.0, 2.0, 102.0], [-88.0, 2.0, 88.0],           // Haligtree Canopy Roots (Crystalian Blademaidens)
            [-270.0, 7.0, -25.0], [-278.0, 7.0, -32.0], [-262.0, 7.0, -18.0],       // Archdragon Thunder Belfry (Onyx Meteor Lords)
            [-80.0, 0.0, -110.0], [-86.0, 0.0, -116.0], [-74.0, 0.0, -104.0],       // Forlorn Bloodhound Evergaol (Bloodhound Knights)
            [-120.0, -2.0, -110.0], [-128.0, -2.0, -118.0], [-112.0, -2.0, -102.0]  // Glintstone Crystalian Matrix (Crystalians)
        ];
        outsidePositions.forEach((pos, idx) => {
            const types = [
                'treant_guardian', 'cursed_basilisk', 'gorgon_medusa', 
                'crystal_drake_whelp', 'crucible_knight_sentinel', 'gorgon_medusa',
                'dire_shadow_wolf', 'abyssal_pus_beast', 'black_knife_assassin',
                'ancestral_horned_shaman', 'gorgon_medusa', 'magma_wyrm_hatchling',
                'cleanrot_knight', 'fire_monk_prelate', 'nox_swordstress',
                'farum_beastman', 'royal_perfumer', 'abyssal_grave_warden',
                'crucible_horned_sentinel', 'bloodhound_knight', 'frenzied_flame_acolyte',
                'crystalian_blademaiden', 'draconic_beastman', 'onyx_meteor_lord'
            ];
            const mType = types[idx % types.length];
            const isGorgon = (mType === 'gorgon_medusa');
            const gVariants = DarkSoulsCharacters.GORGON_VARIANTS || [];
            const variantIdx = (idx + 14) % (gVariants.length || 1);
            const variant = isGorgon ? (gVariants[variantIdx] || { name: 'GORGON MEDUSA', id: 'medusa_petrified_queen' }) : null;
            const oMob = {
                id: `outside_mob_${idx}`,
                name: isGorgon ? variant.name : mType.toUpperCase().replace(/_/g, ' '),
                variantIndex: isGorgon ? variantIdx : undefined,
                variantId: isGorgon ? variant.id : undefined,
                meshType: mType,
                hp: 1250 + (idx % 6) * 220,
                damage: 135 + (idx % 6) * 18,
                souls: 2800 + (idx % 6) * 550,
                speed: 2.65,
                attackReach: 3.2,
                behaviorType: (idx % 3 === 0) ? 'Heavy Tank' : ((idx % 3 === 1) ? 'Flanker' : 'Swarm')
            };
            this.createCustomMob(oMob, pos[0], pos[2], 0, pos[1]);
        });

        // 3X SUBTERRANEAN CATACOMBS SKELETON WARRIOR SQUADS (every 18m from z=32 to 260)
        for (let caz = 34; caz <= 260; caz += 18) {
            this.createSkeletonWarriorEnemy(-21.5, caz, 0, -4.92);
            this.createSkeletonWarriorEnemy(-18.5, caz + 4, Math.PI, -4.92);
        }

        // Boss
        if (!this.boss || this.boss.isDead) {
            this.spawnBoss(this.currentBossType || 'taurus');
        }
    }

    createCustomMob(mobDef, x, z, angle = 0, y = 0) {
        if (this.world && this.world.getGroundHeight) {
            y = this.world.getGroundHeight(x, z, y);
        }
        const mesh = this.charFactory.createMob(mobDef, x, z, angle, y);
        if (mesh) {
            mesh.position.y = y;
        }
        const isQaOneHp = (this.qaOneHpMobs || (window.qaSuite && window.qaSuite.qaOneHpMobsActive));
        const isQaOneHpDmg = (this.qaOneHpDamage || (window.qaSuite && window.qaSuite.qaOneHpDamageActive));
        const maxHp = isQaOneHp ? 1 : (mobDef.hp || 200);
        const isRangedOrArcher = (mobDef.behaviorType === 'Ranged' || mobDef.isArcher || mobDef.meshType === 'archer' || mobDef.aiType === 'Ranged');
        const rawDmg = mobDef.damage || 35;
        // Melee mobs deal 2.5x - 3.0x more damage, while archer / ranged damage is kept lower
        const damage = isQaOneHpDmg ? 1 : (isRangedOrArcher ? Math.max(14, Math.min(25, Math.round(rawDmg * 0.40))) : Math.round(rawDmg * 2.6));

        const behavior = mobDef.behaviorType || 'Swarm';
        let defaultRadius = 0.88;
        if (behavior === 'Heavy Tank') defaultRadius = 1.35;
        else if (behavior === 'Flanker') defaultRadius = 0.75;
        else if (behavior === 'Caster' || behavior === 'Ranged') defaultRadius = 0.82;

        // Determine Zone Tier for auto-leveling
        let zoneTier = 0;
        if (x <= -35) zoneTier = 4;                 // Outside Outskirts Dragon Chasm
        else if (y <= -4.0 && z > 20) zoneTier = 3; // Flooded Catacombs
        else if (z < -25) zoneTier = 3;             // Serpent Sanctum
        else if (y >= 5.0) zoneTier = 2;            // High Castle Ramparts
        else if (z > 175) zoneTier = 2;             // Deep Viaduct Boss Approach
        else if (z >= 30) zoneTier = 1;             // Royal Bridge

        const scale = this.getMobLevelScale(zoneTier);

        const enemy = {
            def: mobDef,
            id: mobDef.id,
            type: mobDef.meshType || 'mob',
            name: mobDef.name || 'Undead Mob',
            isArcher: !!mobDef.isArcher,
            isRuneArcher: !!(mobDef.isRuneArcher || (mobDef.meshType === 'rune_archer') || (mobDef.name && mobDef.name.includes('RUNE'))),
            loreId: mobDef.loreId,
            loreTitle: mobDef.loreTitle,
            loreCategory: mobDef.loreCategory,
            loreBonus: mobDef.loreBonus,
            mesh: mesh,
            startPos: new THREE.Vector3(x, y, z),
            maxHp: maxHp,
            hp: maxHp,
            damage: damage,
            speed: mobDef.speed || 2.4,
            attackReach: mobDef.attackReach || 2.2,
            souls: mobDef.souls || 150,
            behaviorType: behavior,
            attackPhase: 'IDLE',
            attackPhaseTimer: 0,
            flankDir: Math.random() < 0.5 ? -1 : 1,
            state: 'PATROL',
            stateTimer: 0,
            cooldown: 0,
            isDead: false,
            isRiposteable: false,
            riposteTimer: 0,
            isStaggered: false,
            staggerTimer: 0,
            radius: mobDef.radius || defaultRadius,
            animTime: Math.random() * 5,
            zoneTier: zoneTier,
            level: scale.level
        };
        enemy.baseMaxHp = maxHp;
        enemy.baseDamage = damage;
        enemy.baseSouls = enemy.souls || 150;

        enemy.maxHp = Math.round(enemy.baseMaxHp * scale.hpMult);
        enemy.hp = enemy.maxHp;
        enemy.damage = Math.round(enemy.baseDamage * scale.dmgMult);
        enemy.souls = Math.round(enemy.baseSouls * scale.soulsMult);

        this.enemies.push(enemy);
        return enemy;
    }

    createSkeletonWarriorEnemy(x, z, angle, y = -5.0) {
        const mesh = this.charFactory.createSkeletonWarrior(x, z, angle, y);
        const enemy = {
            type: 'skeleton',
            name: y <= -5.5 ? 'Tomb Skeleton Sentinel' : 'Catacombs Skeleton Warrior',
            mesh: mesh,
            startPos: new THREE.Vector3(x, y, z),
            maxHp: (this.qaOneHpMobs || (window.qaSuite && window.qaSuite.qaOneHpMobsActive)) ? 1 : 480,
            hp: (this.qaOneHpMobs || (window.qaSuite && window.qaSuite.qaOneHpMobsActive)) ? 1 : 480,
            damage: (this.qaOneHpDamage || (window.qaSuite && window.qaSuite.qaOneHpDamageActive)) ? 1 : 160,
            state: 'PATROL',
            stateTimer: 0,
            cooldown: 0,
            animTime: Math.random() * 10,
            isDead: false,
            isRiposteable: false,
            riposteTimer: 0,
            isStaggered: false,
            staggerTimer: 0,
            attackWindup: 0,
            patrolRadius: 6,
            aggroRadius: 13,
            attackReach: 2.4,
            souls: 350,
            behaviorType: 'Flanker',
            attackPhase: 'IDLE',
            flankDir: -1,
            radius: 0.85
        };
        enemy.zoneTier = 3;
        const scale = this.getMobLevelScale(3);
        enemy.level = scale.level;
        enemy.baseMaxHp = enemy.maxHp;
        enemy.baseDamage = enemy.damage;
        enemy.baseSouls = enemy.souls || 350;
        enemy.maxHp = Math.round(enemy.baseMaxHp * scale.hpMult);
        enemy.hp = enemy.maxHp;
        enemy.damage = Math.round(enemy.baseDamage * scale.dmgMult);
        enemy.souls = Math.round(enemy.baseSouls * scale.soulsMult);

        this.enemies.push(enemy);
        return enemy;
    }

    createHollowSoldier(x, z, angle, y = 0) {
        const mesh = this.charFactory.createHollow(x, z, angle, y);
        const enemy = {
            type: 'hollow',
            name: y >= 5 ? 'Rampart Hollow' : (y <= -3 ? 'Crypt Hollow' : 'Undead Hollow'),
            mesh: mesh,
            startPos: new THREE.Vector3(x, y, z),
            maxHp: (this.qaOneHpMobs || (window.qaSuite && window.qaSuite.qaOneHpMobsActive)) ? 1 : (y >= 5 ? 380 : (y <= -3 ? 420 : 320)),
            hp: (this.qaOneHpMobs || (window.qaSuite && window.qaSuite.qaOneHpMobsActive)) ? 1 : (y >= 5 ? 380 : (y <= -3 ? 420 : 320)),
            damage: (this.qaOneHpDamage || (window.qaSuite && window.qaSuite.qaOneHpDamageActive)) ? 1 : (y >= 5 ? 130 : (y <= -3 ? 145 : 115)),
            state: 'PATROL',
            stateTimer: 0,
            cooldown: 0,
            isDead: false,
            isRiposteable: false,
            riposteTimer: 0,
            isStaggered: false,
            staggerTimer: 0,
            radius: 0.8,
            behaviorType: 'Swarm',
            attackPhase: 'IDLE',
            flankDir: 1,
            animTime: Math.random() * 5
        };
        const zoneTier = (y >= 5 ? 2 : (y <= -3 ? 3 : 0));
        const scale = this.getMobLevelScale(zoneTier);
        enemy.zoneTier = zoneTier;
        enemy.level = scale.level;
        enemy.baseMaxHp = enemy.maxHp;
        enemy.baseDamage = enemy.damage;
        enemy.baseSouls = 120;
        enemy.maxHp = Math.round(enemy.baseMaxHp * scale.hpMult);
        enemy.hp = enemy.maxHp;
        enemy.damage = Math.round(enemy.baseDamage * scale.dmgMult);
        enemy.souls = Math.round(enemy.baseSouls * scale.soulsMult);

        this.enemies.push(enemy);
    }

    // ----------------------------------------------------
    // INPUT BUFFERING SYSTEM (150ms Queue Window)
    // ----------------------------------------------------
    bufferAction(actionName, payload = null) {
        let canBuffer = false;
        const windowSec = 0.150; // 150ms buffer window

        if (this.isAttacking) {
            const wpn = this.weapons[this.currentWeaponId] || this.weapons.sword;
            const totalDur = (this.attackCombo === 3 ? 0.70 : this.attackCombo >= 7 ? 0.60 : 0.45) / (wpn.speedMultiplier || 1.0);
            const remaining = totalDur - this.attackTime;
            if (remaining > 0 && remaining <= windowSec) canBuffer = true;
        } else if (this.isRolling) {
            const maxDuration = this.isBackstep ? 0.38 : 0.52;
            const remaining = maxDuration - this.rollTime;
            if (remaining > 0 && remaining <= windowSec) canBuffer = true;
        } else if (this.isDrinkingEstus) {
            const remaining = 1.25 - this.estusTime;
            if (remaining > 0 && remaining <= windowSec) canBuffer = true;
        } else if (this.isParrying) {
            const remaining = 0.5 - this.parryTime;
            if (remaining > 0 && remaining <= windowSec) canBuffer = true;
        }

        if (canBuffer) {
            this.inputBuffer = { action: actionName, payload: payload, time: performance.now() };
            this.bufferTimer = windowSec;
            return true;
        }
        return false;
    }

    executeBufferedAction(action, payload) {
        switch (action) {
            case 'LIGHT_ATTACK':
                this.tryLightAttack();
                break;
            case 'HEAVY_ATTACK':
                this.tryHeavyAttack();
                break;
            case 'ROLL':
                this.tryRoll(payload);
                break;
            case 'ESTUS':
                this.tryDrinkEstus();
                break;
            case 'PARRY':
                this.tryParry();
                break;
        }
    }

    // ----------------------------------------------------
    // LINE OF SIGHT & PATHFINDING HELPERS
    // ----------------------------------------------------
    checkLineOfSight(pos1, pos2) {
        if (!this.world || !this.world.colliders || this.world.colliders.length === 0) return true;
        // In close-quarters combat (within 7m), enemies always have line-of-sight
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        if (dx * dx + dy * dy + dz * dz < 49.0) return true;

        const colliders = this.world.colliders;
        for (let i = 1; i <= 4; i++) {
            const t = i / 5.0;
            const sx = pos1.x + (pos2.x - pos1.x) * t;
            const sy = (pos1.y + 0.9) + (pos2.y - pos1.y) * t;
            const sz = pos1.z + (pos2.z - pos1.z) * t;

            for (let c = 0; c < colliders.length; c++) {
                const box = colliders[c];
                // Ignore horizontal thin floor/terrace plates (<1.6m high) so rays aren't clipped by floor slabs
                if ((box.max.y - box.min.y) < 1.6) continue;
                if (sy >= box.min.y && sy <= box.max.y &&
                    sx >= box.min.x && sx <= box.max.x &&
                    sz >= box.min.z && sz <= box.max.z) {
                    return false; // Occluded by world collider!
                }
            }
        }
        return true;
    }

    teleportToNavMesh(e, playerPos) {
        if (!e || !e.mesh) return;
        const p = e.mesh.position;
        // Never jump or teleport towards the player; safely clamp vertical elevation to terrain
        p.y = this.world.getGroundHeight(p.x, p.z, p.y);
        if (this.game && this.game.collisionSystem) {
            this.game.collisionSystem.enforceBoundaries(p, e.radius || 0.85, p.y);
        }
        e.antiStuckTimer = 0;
        e._stuckChaseTimer = 0;
    }

    // ----------------------------------------------------
    // PLAYER ACTIONS
    // ----------------------------------------------------
    tryLightAttack() {
        if (this.bufferAction('LIGHT_ATTACK')) return;
        if (this.isDead || this.isRolling || this.isDrinkingEstus || this.isStaggered) return;
        const wpn = this.weapons[this.currentWeaponId] || this.weapons.sword;
        const stamCost = wpn.lightStamina || 20;
        if (this.stamina < stamCost) return;

        // 1. Airborne Plunging Attack from heights
        const pPos = this.game.playerMesh.position;
        const groundY = this.world.getGroundHeight(pPos.x, pPos.z);
        if ((pPos.y - groundY) > 1.2 || this.game.playerVelocity.y < -2.0) {
            this.executePlungingAttack();
            return;
        }

        // 2. Guard Counter immediately after blocking
        if (this.guardCounterWindow > 0) {
            this.executeGuardCounter();
            return;
        }

        // 3. Riposte (Visceral Stagger Strike)
        const riposteTarget = this.getRiposteTarget();
        if (riposteTarget) {
            this.executeRiposte(riposteTarget);
            return;
        }

        // 4. Backstab
        const backstabTarget = this.getBackstabTarget();
        if (backstabTarget) {
            this.executeBackstab(backstabTarget);
            return;
        }

        // 5. Running Leaping Jump Attack
        const isSprinting = (this.game.keys['ShiftLeft'] || this.game.keys['ShiftRight']) && this.stamina > 15;
        const isMoving = this.game.calculateMovementDirection().lengthSq() > 0.001;
        if (isSprinting && isMoving && !this.isAttacking) {
            this.executeJumpAttack();
            return;
        }

        // 6. Standard Combo Attack
        if (!this.isAttacking) {
            this.isAttacking = true;
            this.attackCombo = 1;
            this.attackTime = 0;
            this.stamina = Math.max(0, this.stamina - stamCost);
            this.staminaDelay = 0.45;
            this.audio.playSwing(false);
            this.checkAttackHits(wpn.lightDmg, wpn.poiseBreak, wpn.reach, wpn.bossReachBonus);
        } else if (this.attackTime > (0.22 / (wpn.speedMultiplier || 1.0)) && this.attackCombo === 1) {
            // Buffer combo 2
            this.attackCombo = 2;
            this.attackTime = 0;
            this.stamina = Math.max(0, this.stamina - Math.round(stamCost * 1.1));
            this.staminaDelay = 0.5;
            this.audio.playSwing(false);
            this.checkAttackHits(Math.round(wpn.lightDmg * 1.15), wpn.poiseBreak * 1.2, wpn.reach + 0.2, wpn.bossReachBonus + 0.2);
        } else if (this.attackTime > (0.20 / (wpn.speedMultiplier || 1.0)) && this.attackCombo === 2) {
            // Combo 3: Weapon-specific finisher (#23-30 depending on weapon)
            if (wpn.id === 'uchigatana') this.attackCombo = 13; // Iai Slash
            else if (wpn.id === 'zweihander') this.attackCombo = 12; // Leaping Spin
            else if (wpn.id === 'dragontooth') this.attackCombo = 14; // Ground Pound
            else if (wpn.id === 'halberd') this.attackCombo = 10; // Rising Uppercut
            else this.attackCombo = 7; // Spinning Slash
            this.attackTime = 0;
            this.stamina = Math.max(0, this.stamina - Math.round(stamCost * 1.3));
            this.staminaDelay = 0.6;
            this.audio.playSwing(true);
            this.checkAttackHits(Math.round(wpn.lightDmg * 1.4), wpn.poiseBreak * 1.5, wpn.reach + 0.4, wpn.bossReachBonus + 0.4);
        }
    }

    tryHeavyAttack() {
        if (this.bufferAction('HEAVY_ATTACK')) return;
        if (this.isDead || this.isRolling || this.isDrinkingEstus || this.isStaggered) return;
        const wpn = this.weapons[this.currentWeaponId] || this.weapons.sword;
        const stamCost = wpn.heavyStamina || 34;
        if (this.stamina < stamCost) return;

        // Airborne Plunging Attack
        const pPos = this.game.playerMesh.position;
        const groundY = this.world.getGroundHeight(pPos.x, pPos.z);
        if ((pPos.y - groundY) > 1.2 || this.game.playerVelocity.y < -2.0) {
            this.executePlungingAttack();
            return;
        }

        // Running Leaping Jump Attack
        const isSprinting = (this.game.keys['ShiftLeft'] || this.game.keys['ShiftRight']) && this.stamina > 15;
        const isMoving = this.game.calculateMovementDirection().lengthSq() > 0.001;
        if (isSprinting && isMoving && !this.isAttacking) {
            this.executeJumpAttack();
            return;
        }

        this.isAttacking = true;
        this.attackCombo = 3; // Heavy thrust / overhead
        this.attackTime = 0;
        this.stamina = Math.max(0, this.stamina - stamCost);
        this.staminaDelay = 0.65;
        this.audio.playSwing(true);
        this.checkAttackHits(wpn.heavyDmg, wpn.poiseBreak * 1.5, wpn.reach + 0.4, wpn.bossReachBonus + 0.4);

        if (this.currentWeaponId === 'moonlight') {
            this.fireMoonlightBeam();
        } else if (this.currentWeaponId === 'dragontooth') {
            this.triggerShockwave();
        }
    }

    executePlungingAttack() {
        const wpn = this.weapons[this.currentWeaponId] || this.weapons.sword;
        this.isPlungingAttack = true;
        this.isAttacking = true;
        this.attackCombo = 6; // Plunging downward strike
        this.attackTime = 0;
        this.stamina = Math.max(0, this.stamina - (wpn.heavyStamina || 34));
        this.staminaDelay = 0.6;
        this.game.playerVelocity.y = Math.min(this.game.playerVelocity.y, -16.0); // Dive downward blade-first
        this.audio.playSwing(true);
        this.game.showNotification("⚔️ PLUNGING ATTACK!");
    }

    executePlungingImpact(fallSpeed) {
        this.isPlungingAttack = false;
        this.isAttacking = false;
        this.attackCombo = 0;
        const wpn = this.weapons[this.currentWeaponId] || this.weapons.sword;
        const pPos = this.game.playerMesh.position;

        // Plunging: 3x damage if falling vertical speed exceeds 8 m/s
        const isMaxVelocity = Math.abs(fallSpeed) > 8.0;
        const speedMult = isMaxVelocity ? 3.0 : 1.5;
        const damage = Math.round(wpn.heavyDmg * speedMult);

        this.audio.playPlungingSlam();
        this.world.spawnPlungingShockwave(pPos);
        this.game.shakeCamera(0.35, 0.45);
        if (this.game.triggerHitstop) this.game.triggerHitstop(3);

        if (isMaxVelocity) {
            this.game.showNotification(`💥 MAXIMUM VELOCITY PLUNGING STRIKE (3x DMG: ${damage})!`);
        } else {
            this.game.showNotification(`⚔️ PLUNGING ATTACK • ${damage} DMG!`);
        }

        // Damage Boss if in radius
        if (this.boss && !this.boss.isDead) {
            const dist = pPos.distanceTo(this.boss.mesh.position);
            if (dist < (this.boss.radius || 2.5) + 3.8) {
                this.boss.hp -= damage;
                this.boss.isStaggered = true;
                this.boss.staggerTimer = 2.2;
                this.game.showDamageNumber(this.boss.mesh.position, damage, true);
                this.world.spawnHitSparks(this.boss.mesh.position, true);
                if (this.boss.hp <= 0) this.killBoss();
            }
        }

        // Damage any hollows in radius
        for (const e of this.enemies) {
            if (!e.isDead && pPos.distanceTo(e.mesh.position) < 5.5) {
                e.hp -= damage;
                e.isStaggered = true;
                e.staggerTimer = 2.5;
                this.game.showDamageNumber(e.mesh.position, damage, true);
                this.world.spawnHitSparks(e.mesh.position, true);
                if (e.hp <= 0) this.killEnemy(e);
            }
        }
    }

    executeJumpAttack() {
        const wpn = this.weapons[this.currentWeaponId] || this.weapons.sword;
        const stamCost = Math.round((wpn.heavyStamina || 34) * 1.15);
        this.isAttacking = true;
        this.attackCombo = 5; // Leaping jump attack
        this.attackTime = 0;
        this.stamina = Math.max(0, this.stamina - stamCost);
        this.staminaDelay = 0.6;

        // Forward leaping momentum
        this.game.playerVelocity.y = 5.2; // Upward leap
        const moveDir = this.game.calculateMovementDirection().normalize();
        this.game.playerMesh.position.addScaledVector(moveDir, 1.8);

        this.audio.playSwing(true);
        this.game.showNotification("⚡ LEAPING JUMP ATTACK!");
        const dmg = Math.round(wpn.heavyDmg * 1.6);
        this.checkAttackHits(dmg, wpn.poiseBreak * 2.4, wpn.reach + 0.8, wpn.bossReachBonus + 0.8);
    }

    executeGuardCounter() {
        this.guardCounterWindow = 0;
        const wpn = this.weapons[this.currentWeaponId] || this.weapons.sword;
        const stamCost = Math.round((wpn.lightStamina || 20) * 1.2);
        this.isAttacking = true;
        this.attackCombo = 4; // Sweeping retaliatory strike
        this.attackTime = 0;
        this.stamina = Math.max(0, this.stamina - stamCost);
        this.staminaDelay = 0.5;

        this.audio.playGuardCounter();
        this.game.showNotification("⭐ GUARD COUNTER!");
        this.game.shakeCamera(0.2, 0.25);

        const dmg = Math.round(wpn.heavyDmg * 1.9);
        this.checkAttackHits(dmg, wpn.poiseBreak * 2.8, wpn.reach + 0.6, wpn.bossReachBonus + 0.6);
    }

    tryBlock(isDown) {
        if (this.isDead || this.isRolling || this.isDrinkingEstus || this.isStaggered) {
            this.isBlocking = false;
            return;
        }
        if (isDown && this.game && this.game.isTorchActive) {
            this.game.toggleTorch(false);
        }
        this.isBlocking = isDown;
    }

    tryParry() {
        if (this.bufferAction('PARRY')) return;
        if (this.isDead || this.isRolling || this.isDrinkingEstus || this.isStaggered || this.isAttacking) return;
        if (this.stamina < 20) return;

        this.isParrying = true;
        this.parryTime = 0;
        this.stamina = Math.max(0, this.stamina - 18);
        this.staminaDelay = 0.6;
        this.audio.playRoll(); // Swish of shield
    }

    tryRoll(moveDir) {
        if (this.bufferAction('ROLL', moveDir)) return;
        if (this.isDead || this.isRolling || this.isDrinkingEstus) return;
        // Roll-escape: allow breaking out of minor stagger quickly (after 0.1s)!
        if (this.isStaggered && this.staggerTime > 0.20) return;
        // Roll-cancel during attack recovery frames
        if (this.isAttacking && this.attackTime < 0.16) return;
        if (this.stamina < 16) return;

        this.isStaggered = false; // Immediately breaks free from flinch/stunlock!
        this.isRolling = true;
        this.rollTime = 0;
        this.isInvincible = true;
        this.isAttacking = false;
        if (this.game) this.game._rollStyle = Math.floor(Math.random() * 6); // Randomize roll anim variant
        this.isBlocking = false;
        this.stamina = Math.max(0, this.stamina - 18);
        this.staminaDelay = 0.35;

        // Directional Roll or Dark Souls Backstep
        if (moveDir && moveDir.lengthSq() > 0.01) {
            this.rollDir.copy(moveDir).normalize();
            this.isBackstep = false;
        } else {
            // Neutral roll input = Authentic Dark Souls Backstep (быстрый отскок назад)
            const playerRot = this.game.playerMesh.rotation.y;
            this.rollDir.set(-Math.sin(playerRot), 0, -Math.cos(playerRot)).normalize();
            this.isBackstep = true;
        }

        this.audio.playRoll();
        this.game.spawnRollDust();
    }

    tryDrinkEstus() {
        if (this.bufferAction('ESTUS')) return;
        if (this.isDead || this.isRolling || this.isDrinkingEstus) return;
        if (this.isStaggered && this.staggerTime > 0.20) return;
        if (this.estusFlasks <= 0) {
            this.game.showNotification("NO ESTUS REMAINING");
            return;
        }
        if (this.hp >= this.maxHp && !this.isPoisoned) {
            this.game.showNotification("HEALTH ALREADY FULL");
            return;
        }

        this.isStaggered = false;
        this.isDrinkingEstus = true;
        this.estusTime = 0;
        this.isBlocking = false;
        this.isAttacking = false;
        this.estusFlasks--;
        this.audio.playEstusDrink();

        // Heal and cleanse toxins after drinking animation
        setTimeout(() => {
            if (!this.isDead) {
                const healAmt = Math.round(this.maxHp * 0.65);
                this.hp = Math.min(this.maxHp, this.hp + healAmt);
                this.world.spawnEstusParticles(this.game.playerMesh.position);
                this.game.showNotification(`+${healAmt} HP RESTORED`);
                if (this.isPoisoned) {
                    this.isPoisoned = false;
                    this.poisonTimer = 0;
                    this.game.showNotification("✨ ESTUS CLEANSED POISON & VENOM!");
                }
                if (this.isPetrified) this.isPetrified = false;

                // THE SUNKEN LITURGY — HIGH BAILIFF INTEREST-BURN MECHANIC
                if (this.boss && this.boss.id === 'high_bailiff' && !this.boss.isDead) {
                    const skinId = (this.game && this.game.currentCharacterSkin) || 'warrior';
                    if (skinId === 'forgotten_witness') {
                        this.game.showNotification("⚖️ FORGOTTEN WITNESS: ZERO-DEBT IMMUNITY DISCHARGES INTEREST-BURN!");
                    } else {
                        this.game.showNotification("🔥 DEFAULT PENALTY! HIGH BAILIFF INFLICTS COMPOUND INTEREST-BURN!");
                        this.applyInterestBurn(4);
                    }
                }

                if (this.game && this.game.triggerAutoSave) {
                    this.game.triggerAutoSave('ESTUS_DRINK');
                }
            }
        }, 550);
    }

    // ----------------------------------------------------
    // QUICK ANTIDOTE USE (Key T or HUD Button)
    // Instant purge of poison, toxic, and serpent venom
    // ----------------------------------------------------
    tryDrinkAntidote() {
        if (this.isDead || this.isRolling) return;

        const apoth = (this.game && this.game.apothecary) ? this.game.apothecary : null;
        let count = (apoth && apoth.craftedMeds) ? apoth.craftedMeds.venomAntidotes : 5;
        if (count <= 0) {
            this.game.showNotification("⚠️ NO ANTIDOTES LEFT IN POUCH!");
            return;
        }
        if (apoth && apoth.craftedMeds) {
            apoth.craftedMeds.venomAntidotes--;
            const antiEl = document.getElementById('antidote-count');
            if (antiEl) antiEl.textContent = `x ${apoth.craftedMeds.venomAntidotes}`;
        }

        this.isPoisoned = false;
        this.poisonTimer = 0;
        this.poisonBuildup = 0;
        this.isPetrified = false;
        this.isStaggered = false;
        if (this.audio && this.audio.playEstusDrink) this.audio.playEstusDrink();
        this.game.showNotification("🌿 SOVEREIGN ANTIDOTE: ALL POISONS & VENOM PURGED!");
        if (this.world && this.world.spawnHitSparks && this.game.playerMesh) {
            this.world.spawnHitSparks(this.game.playerMesh.position, true);
        }
        if (this.game && this.game.triggerAutoSave) {
            this.game.triggerAutoSave('ANTIDOTE_USE');
        }
    }

    // ----------------------------------------------------
    // THE SUNKEN LITURGY: COMPOUND INTEREST-BURN MECHANIC
    // Punishes potion chugging and defaults when facing Auditors
    // ----------------------------------------------------
    applyInterestBurn(ticks = 4) {
        if (this.isDead) return;
        if (this.interestBurnInterval) {
            clearInterval(this.interestBurnInterval);
            this.interestBurnInterval = null;
        }
        let remainingTicks = ticks;
        this.interestBurnInterval = setInterval(() => {
            if (this.isDead || remainingTicks <= 0) {
                clearInterval(this.interestBurnInterval);
                this.interestBurnInterval = null;
                return;
            }
            remainingTicks--;
            const burnDmg = 45;
            this.hp = Math.max(1, this.hp - burnDmg);
            if (this.game && this.game.showNotification) {
                this.game.showNotification(`⚖️ COMPOUND INTEREST: -${burnDmg} HP (DEFAULT BALANCE DUE)`);
            }
            if (this.world && this.world.spawnHitSparks && this.game && this.game.playerMesh) {
                this.world.spawnHitSparks(this.game.playerMesh.position, false);
            }
        }, 750);
    }

    // ----------------------------------------------------
    // DAMAGE, PARRY, RIPOSTE & BACKSTAB
    // ----------------------------------------------------
    getRiposteTarget() {
        const playerPos = this.game.playerMesh.position;
        for (const e of this.enemies) {
            if (!e.isDead && e.isRiposteable) {
                const dist = playerPos.distanceTo(e.mesh.position);
                if (dist < 2.5) return e;
            }
        }
        return null;
    }

    getBackstabTarget() {
        const playerPos = this.game.playerMesh.position;
        for (const e of this.enemies) {
            if (!e.isDead && !e.isRiposteable) {
                const dist = playerPos.distanceTo(e.mesh.position);
                if (dist < 2.0) {
                    // Check angle: player behind enemy
                    const enemyForward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), e.mesh.rotation.y);
                    const toPlayer = new THREE.Vector3().subVectors(playerPos, e.mesh.position).normalize();
                    const dot = enemyForward.dot(toPlayer);
                    if (dot < -0.5) { // Behind enemy cone
                        return e;
                    }
                }
            }
        }
        return null;
    }

    executeRiposte(target) {
        this.isAttacking = true;
        this.attackCombo = 4; // Riposte animation
        this.attackTime = 0;
        this.audio.playRiposte();
        this.world.spawnBlood(target.mesh.position);
        this.world.spawnHitSparks(target.mesh.position, true);
        this.game.shakeCamera(0.3, 0.4);

        const dmg = 650;
        target.hp -= dmg;
        this.game.showDamageNumber(target.mesh.position, dmg, true);

        if (target.hp <= 0) {
            this.killEnemy(target);
        } else {
            target.isRiposteable = false;
            target.isStaggered = true;
            target.staggerTimer = 1.0;
        }
    }

    executeBackstab(target) {
        this.isAttacking = true;
        this.attackCombo = 4;
        this.attackTime = 0;
        this.audio.playRiposte();
        this.world.spawnBlood(target.mesh.position);
        this.world.spawnHitSparks(target.mesh.position, true);
        this.game.shakeCamera(0.35, 0.45);

        const dmg = 520;
        target.hp -= dmg;
        this.game.showDamageNumber(target.mesh.position, dmg, true);

        if (target.hp <= 0) {
            this.killEnemy(target);
        } else {
            target.isStaggered = true;
            target.staggerTimer = 1.4;
        }
    }

    checkAttackHits(baseDamage, poiseDmg = 1.0, reach = 2.8, bossBonus = 1.8) {
        const playerPos = this.game.playerMesh.position;
        const playerRot = this.game.playerMesh.rotation.y;
        const forward = new THREE.Vector3(Math.sin(playerRot), 0, Math.cos(playerRot));

        // Damage boost from strength stat + optional pine resin fire buff
        let warcryMultiplier = (this._warcryBuffTimer > 0) ? 1.25 : 1.0;
        baseDamage = Math.round(baseDamage * warcryMultiplier);
        let totalDmg = Math.round(baseDamage * (1 + (this.strength - 10) * 0.12));
        if (this.charcoalResinTimer > 0) {
            totalDmg += 60; // Fire Pine Resin buff!
        }
        const hasTorchFire = this.currentWeaponId === 'torch' || (this.game && this.game.isTorchActive);
        if (hasTorchFire) {
            totalDmg += 45; // Burning Torch fire damage bonus
        }
        // Blacksmith Titanite Reinforcement & Infusion Buff (System 301-330)
        if (this.game && this.game.blacksmith) {
            totalDmg += this.game.blacksmith.getWeaponDamageBonus(this.currentWeaponId);
        }

        // 1. Check Hollow Soldiers
        for (const e of this.enemies) {
            if (e.isDead) continue;
            const toEnemy = new THREE.Vector3().subVectors(e.mesh.position, playerPos);
            const dist = toEnemy.length();
            if (dist < reach) {
                const angle = forward.dot(toEnemy.normalize());
                if (angle > 0.30) { // In front arc
                    e.hp -= totalDmg;
                    if (hasTorchFire) this.applyBurnEffect(e);
                    this.audio.playHit(this.attackCombo === 3);
                    this.world.spawnBlood(e.mesh.position);
                    this.world.spawnHitSparks(e.mesh.position, this.attackCombo === 3 || hasTorchFire);
                    this.game.showDamageNumber(e.mesh.position, totalDmg, this.currentWeaponId === 'uchigatana');
                    this.game.shakeCamera(0.12 * poiseDmg, 0.15);
                    if (this.game.triggerHitstop) this.game.triggerHitstop(3);

                    if (e.hp <= 0) {
                        this.killEnemy(e);
                    } else {
                        const currentWpn = this.weapons[this.currentWeaponId] || this.weapons.sword;
                        const wpnPoiseMult = (currentWpn && currentWpn.poiseBreak) || 1.0;
                        const behavior = e.behaviorType || 'Swarm';

                        // Poise & Stagger System: Small mobs stagger for 0.3s rarely, scaling with player level
                        const isHeavySlash = (this.attackCombo === 3 || this.attackCombo >= 5 || this.currentWeaponId === 'zweihander' || this.currentWeaponId === 'dragontooth');
                        const isSmallMob = (behavior === 'Swarm' || behavior === 'Flanker' || behavior === 'Ranged' || e.isArcher || e.type === 'hollow' || e.type === 'skeleton' || !e.type || e.type === 'mob' || (e.maxHp && e.maxHp < 900));

                        if (isSmallMob) {
                            // Small mobs stagger for strictly 0.30s; occurs rarely (20% on light hits, 75% on heavy)
                            const staggerChance = isHeavySlash ? 0.75 : 0.20;
                            const doesStagger = Math.random() < staggerChance;

                            if (doesStagger) {
                                e.poise = 0;
                                e.isStaggered = true;
                                e.staggerTimer = 0.30;
                                e.maxStaggerTimer = 0.30;
                                e.state = 'STAGGER';
                                e.attackPhase = 'IDLE';
                                e.isAttacking = false;
                                e._hitDir = (Math.random() > 0.5 ? 1 : -1) * (0.45 + Math.random() * 0.2);

                                // Physical knockback recoil: push back 0.55m so stagger is immediately felt!
                                const pushDir = new THREE.Vector3().subVectors(e.mesh.position, playerPos);
                                pushDir.y = 0;
                                if (pushDir.lengthSq() > 0.001) {
                                    pushDir.normalize();
                                    e.mesh.position.addScaledVector(pushDir, 0.55);
                                }
                            }
                        } else {
                            // Elite / Heavy mobs require poise break (or heavy attacks)
                            let baseMaxPoise = 75;
                            if (behavior === 'Heavy Tank') baseMaxPoise = 110;
                            else if (e.type && (e.type.includes('knight') || e.type.includes('serpent') || e.type.includes('gorgon'))) baseMaxPoise = 90;

                            if (e.maxPoise === undefined) {
                                e.maxPoise = (e.def && e.def.poise) || baseMaxPoise;
                                e.poise = e.maxPoise;
                            }

                            const basePoiseHit = isHeavySlash ? 55 : 28;
                            const totalPoiseHit = Math.round(basePoiseHit * wpnPoiseMult * poiseDmg);
                            e.poise -= totalPoiseHit;
                            e.poiseRegenTimer = 3.2;

                            if (e.poise <= 0 || isHeavySlash) {
                                e.poise = 0;
                                e.isStaggered = true;
                                e.staggerTimer = isHeavySlash ? 1.75 : 1.25;
                                e.maxStaggerTimer = e.staggerTimer;
                                e.state = 'STAGGER';
                                e.attackPhase = 'IDLE';
                                e.isAttacking = false;
                                e._hitDir = (Math.random() > 0.5 ? 1 : -1) * (0.50 + Math.random() * 0.3);
                            }
                        }
                    }
                }
            }
        }

        // 2. Check Boss (Taurus, Gargoyle, Capra, Sif, or Gwyn)
        if (this.boss && !this.boss.isDead) {
            const toBoss = new THREE.Vector3().subVectors(this.boss.mesh.position, playerPos);
            const dist = toBoss.length();
            const hitThreshold = (this.boss.radius || 2.4) + bossBonus;
            if (dist < hitThreshold) {
                const angle = forward.dot(toBoss.normalize());
                if (angle > 0.12) {
                    this.boss.hp -= totalDmg;
                    if (this.boss.state === 'IDLE') {
                        this.boss.state = 'CHASE';
                        this.audio.playBossRoar();
                        this.audio.setBossMusic(true);
                        this.game.showBossHpBar(this.boss);
                        this.game.showNotification(`${this.boss.name} AWAKENED!`);
                    }
                    if (hasTorchFire) this.applyBurnEffect(this.boss);
                    this.audio.playHit(true);
                    this.world.spawnHitSparks(this.boss.mesh.position, true);
                    this.world.spawnBlood(this.boss.mesh.position);
                    this.game.showDamageNumber(this.boss.mesh.position, totalDmg, false);
                    this.game.shakeCamera(0.18 * poiseDmg, 0.2);
                    if (this.game.triggerHitstop) this.game.triggerHitstop(3);

                    if (this.boss.hp <= this.boss.maxHp * 0.5 && !this.boss.isPhase2) {
                        this.triggerBossPhase2();
                    }

                    if (this.boss.hp <= 0) {
                        this.killBoss();
                    }
                }
            }
        }

        // 3. Check Spawned Compendium 3D Entities (Allow attacking / banishing any spawned 3D model)
        if (window.compendiumInstance && window.compendiumInstance.spawnedEntities && window.compendiumInstance.spawnedEntities.length > 0) {
            const spawned = window.compendiumInstance.spawnedEntities;
            for (let i = spawned.length - 1; i >= 0; i--) {
                const entMesh = spawned[i];
                if (!entMesh || !entMesh.parent) {
                    spawned.splice(i, 1);
                    continue;
                }
                const toEnt = new THREE.Vector3().subVectors(entMesh.position, playerPos);
                const dist = toEnt.length();
                if (dist < reach + 1.2) {
                    const angle = forward.dot(toEnt.normalize());
                    if (angle > 0.15) {
                        entMesh.userData.hp = (entMesh.userData.hp !== undefined ? entMesh.userData.hp : 100) - totalDmg;
                        this.audio.playHit(true);
                        this.world.spawnHitSparks(entMesh.position, true);
                        this.world.spawnBlood(entMesh.position);
                        this.game.showDamageNumber(entMesh.position, totalDmg, false);
                        
                        if (entMesh.userData.hp <= 0) {
                            const entryName = (entMesh.userData.entry && entMesh.userData.entry.name) || '3D Entity';
                            this.game.showNotification(`⚔️ ${entryName.toUpperCase()} BANISHED!`);
                            this.audio.playVictory();
                            this.souls += 100;
                            this.game.showSoulsGained(100);
                            
                            const sScale = entMesh.scale.clone();
                            let dissTimer = 0;
                            const dissInterval = setInterval(() => {
                                dissTimer += 0.05;
                                const factor = Math.max(0, 1.0 - dissTimer / 0.4);
                                entMesh.scale.set(sScale.x * factor, sScale.y * factor, sScale.z * factor);
                                if (factor <= 0) {
                                    clearInterval(dissInterval);
                                    if (entMesh.parent) entMesh.parent.remove(entMesh);
                                    else this.game.scene.remove(entMesh);
                                    const idx = spawned.indexOf(entMesh);
                                    if (idx >= 0) spawned.splice(idx, 1);
                                }
                            }, 30);
                        }
                    }
                }
            }
        }
    }

    // ----------------------------------------------------
    // WEAPONS ARSENAL MANAGEMENT & MERCHANT SHOP
    // ----------------------------------------------------
    
    // ----------------------------------------------------
    // SPIRIT ASHES CALLING BELL & AUTONOMOUS PHANTOM AI
    // ----------------------------------------------------
    trySummonSpiritAsh(ashId = this.currentSpiritAshId) {
        if (this.isDead) return false;
        const ash = this.spiritAshesDatabase[ashId];
        if (!ash) return false;

        // If companion is already active:
        if (this.activeSpiritCompanion) {
            if (this.activeSpiritCompanion.id === ashId) {
                this.dismissSpiritAsh();
                return true;
            } else {
                this.dismissSpiritAsh(false);
            }
        }

        if (this.spiritSummonCooldown > 0) {
            if (this.game && this.game.showNotification) {
                this.game.showNotification(`SPIRIT BELL COOLING DOWN (${Math.ceil(this.spiritSummonCooldown)}s)`);
            }
            return false;
        }

        // Stamina cost for summoning
        if (this.stamina < 30 && !this.isGodMode) {
            if (this.game && this.game.showNotification) {
                this.game.showNotification("INSUFFICIENT STAMINA TO RING SPIRIT BELL");
            }
            return false;
        }
        if (!this.isGodMode) {
            this.stamina -= 30;
            this.staminaDelay = 1.4;
        }

        this.currentSpiritAshId = ashId;
        this.spiritSummonCooldown = 5.0;

        if (this.audio && this.audio.playBellToll) {
            this.audio.playBellToll();
        }

        const playerPos = this.game.playerMesh.position;
        const playerRot = this.game.playerMesh.rotation.y;
        const sideOffset = new THREE.Vector3(-1.8, 0, 1.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRot);
        const spawnPos = playerPos.clone().add(sideOffset);
        spawnPos.y = playerPos.y;

        let companionMesh;
        if (this.game && this.game.charFactory && this.game.charFactory.createSpiritCompanionMesh) {
            companionMesh = this.game.charFactory.createSpiritCompanionMesh(ash);
        } else {
            companionMesh = new THREE.Group();
            const bodyMat = new THREE.MeshStandardMaterial({
                color: ash.color || 0x88ccff,
                transparent: true,
                opacity: 0.75,
                emissive: ash.color || 0x4488ff,
                emissiveIntensity: 0.35,
                roughness: 0.3
            });
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 1.6, 8), bodyMat);
            body.position.y = 0.8;
            companionMesh.add(body);
        }

        companionMesh.position.copy(spawnPos);
        companionMesh.rotation.y = playerRot;
        this.game.scene.add(companionMesh);

        this.activeSpiritCompanion = {
            id: ash.id,
            name: ash.name,
            title: ash.title,
            icon: ash.icon,
            mesh: companionMesh,
            hp: ash.hp,
            maxHp: ash.maxHp,
            damage: ash.damage,
            color: ash.color,
            attackTimer: 0,
            animTime: 0,
            target: null,
            attackAnimTimer: 0
        };

        if (this.world && this.world.spawnHitSparks) {
            this.world.spawnHitSparks(spawnPos, true);
        }

        if (this.game && this.game.showNotification) {
            this.game.showNotification(`🔔 SUMMONED: ${ash.name.toUpperCase()} (${ash.icon})`);
        }

        return true;
    }

    dismissSpiritAsh(notify = true) {
        if (!this.activeSpiritCompanion) return;
        const comp = this.activeSpiritCompanion;
        if (comp.mesh && comp.mesh.parent) {
            if (this.world && this.world.spawnHitSparks) {
                this.world.spawnHitSparks(comp.mesh.position, false);
            }
            comp.mesh.parent.remove(comp.mesh);
        }
        this.activeSpiritCompanion = null;
        if (notify && this.game && this.game.showNotification) {
            this.game.showNotification("✨ SPIRIT PHANTOM RETURNED TO ASHES");
        }
    }

    cycleSpiritAsh(dir = 1) {
        const keys = this.unlockedSpiritAshes || Object.keys(this.spiritAshesDatabase);
        if (!keys.length) return;
        let idx = keys.indexOf(this.currentSpiritAshId);
        if (idx === -1) idx = 0;
        idx = (idx + dir + keys.length) % keys.length;
        this.currentSpiritAshId = keys[idx];
        const ash = this.spiritAshesDatabase[this.currentSpiritAshId];
        if (this.game && this.game.showNotification && ash) {
            this.game.showNotification(`SPIRIT ASH: ${ash.name.toUpperCase()} (${ash.icon}) &bull; [N / 4] TO SUMMON`);
        }
        if (this.game && this.game.renderSpiritAshesUI) {
            this.game.renderSpiritAshesUI();
        }
    }

    updateSpiritCompanion(delta) {
        if (!this.activeSpiritCompanion) return;
        const comp = this.activeSpiritCompanion;
        if (this.spiritSummonCooldown > 0) {
            this.spiritSummonCooldown -= delta;
        }

        if (comp.hp <= 0 || !comp.mesh || !comp.mesh.parent) {
            this.dismissSpiritAsh(false);
            if (this.game && this.game.showNotification) {
                this.game.showNotification(`💀 ${comp.name.toUpperCase()} HAS FALLEN IN BATTLE`);
            }
            return;
        }

        comp.animTime += delta;
        if (comp.attackTimer > 0) comp.attackTimer -= delta;
        if (comp.attackAnimTimer > 0) comp.attackAnimTimer -= delta;

        // Rotate floor summon ring
        const ring = comp.mesh.getObjectByName('spiritRing');
        if (ring) ring.rotation.z += delta * 1.5;

        const compPos = comp.mesh.position;
        const playerPos = this.game.playerMesh.position;

        // Locate nearest active target (boss or hollow)
        let targetMesh = null;
        let targetDist = Infinity;
        let isBossTarget = false;

        if (this.boss && !this.boss.isDead && this.boss.state === 'CHASE') {
            const d = compPos.distanceTo(this.boss.mesh.position);
            if (d < 36.0) {
                targetMesh = this.boss.mesh;
                targetDist = d;
                isBossTarget = true;
            }
        }

        if (!targetMesh) {
            for (const e of this.enemies) {
                if (e.isDead || !e.mesh) continue;
                const d = compPos.distanceTo(e.mesh.position);
                if (d < targetDist && d < 28.0) {
                    targetDist = d;
                    targetMesh = e.mesh;
                    isBossTarget = false;
                }
            }
        }

        const isArcher = comp.id === 'latenna_albinauric';
        const attackRange = isArcher ? 14.0 : 3.0;

        if (targetMesh) {
            // Target tracking & face target
            const toTarget = new THREE.Vector3().subVectors(targetMesh.position, compPos);
            toTarget.y = 0;
            const dist = toTarget.length();
            if (dist > 0.001) {
                comp.mesh.rotation.y = Math.atan2(toTarget.x, toTarget.z);
            }

            if (dist > attackRange) {
                // Move towards target
                const moveSpeed = 4.2;
                toTarget.normalize();
                compPos.addScaledVector(toTarget, moveSpeed * delta);
                compPos.y = playerPos.y + Math.abs(Math.sin(comp.animTime * 8)) * 0.12;
            } else {
                // In range: perform attack!
                compPos.y = playerPos.y;
                if (comp.attackTimer <= 0) {
                    comp.attackTimer = 1.7;
                    comp.attackAnimTimer = 0.45;

                    // Play attack sound & animation
                    if (this.audio && this.audio.playHit) {
                        this.audio.playHit(false);
                    }

                    // Apply damage to target
                    const dmg = comp.damage;
                    if (isBossTarget && this.boss) {
                        this.boss.hp -= dmg;
                        if (this.world && this.world.spawnHitSparks) {
                            this.world.spawnHitSparks(this.boss.mesh.position, true);
                        }
                        if (this.game && this.game.showDamageNumber) {
                            this.game.showDamageNumber(this.boss.mesh.position, dmg, false);
                        }
                        if (this.boss.hp <= 0) this.killBoss();
                    } else if (targetMesh.userData && targetMesh.userData.enemyRef) {
                        const enemy = targetMesh.userData.enemyRef;
                        enemy.hp -= dmg;
                        if (this.world && this.world.spawnHitSparks) {
                            this.world.spawnHitSparks(enemy.mesh.position, false);
                        }
                        if (this.game && this.game.showDamageNumber) {
                            this.game.showDamageNumber(enemy.mesh.position, dmg, false);
                        }
                        if (enemy.hp <= 0) this.killEnemy(enemy);
                    }
                }
            }
        } else {
            // Follow player
            const toPlayer = new THREE.Vector3().subVectors(playerPos, compPos);
            toPlayer.y = 0;
            const dist = toPlayer.length();
            if (dist > 3.2) {
                toPlayer.normalize();
                comp.mesh.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
                const followSpeed = 4.8;
                compPos.addScaledVector(toPlayer, followSpeed * delta);
                compPos.y = playerPos.y + Math.abs(Math.sin(comp.animTime * 8)) * 0.12;
            } else {
                compPos.y = playerPos.y;
            }
        }

        // Swing arm/weapon if attacking
        const rArm = comp.mesh.getObjectByName('spiritRArm');
        if (rArm) {
            if (comp.attackAnimTimer > 0) {
                rArm.rotation.x = -1.2 + Math.sin(comp.animTime * 20) * 0.6;
            } else {
                rArm.rotation.x = 0;
            }
        }
    }

equipWeapon(weaponId) {
        if (!this.weapons[weaponId]) return false;
        if (!this.unlockedWeapons.includes(weaponId)) {
            this.game.showNotification("WEAPON LOCKED &bull; VISIT UNDEAD MERCHANT");
            return false;
        }

        this.currentWeaponId = weaponId;
        const wpn = this.weapons[weaponId];

        if (this.game && this.game.charFactory && this.game.playerMesh) {
            this.game.charFactory.attachWeaponToPlayer(this.game.playerMesh, weaponId);
        }

        if (this.game && this.game.updateWeaponHUD) {
            this.game.updateWeaponHUD(wpn);
        }

        this.audio.playRoll();
        this.game.showNotification(`EQUIPPED: ${wpn.name.toUpperCase()} (${wpn.icon})`);

        if (this.game && this.game.triggerAutoSave) {
            this.game.triggerAutoSave('WEAPON_EQUIP');
        } else if (this.game && this.game.saveGame) {
            this.game.saveGame(false);
        }
        return true;
    }

    buyWeapon(weaponId) {
        const wpn = this.weapons[weaponId];
        if (!wpn) return false;

        if (this.unlockedWeapons.includes(weaponId)) {
            // Already owned, just equip
            return this.equipWeapon(weaponId);
        }

        if (this.souls < wpn.cost) {
            this.game.showNotification("INSUFFICIENT SOULS TO PURCHASE");
            return false;
        }

        this.souls -= wpn.cost;
        this.unlockedWeapons.push(weaponId);
        this.audio.playBonfireIgnite();
        this.game.showNotification(`PURCHASED: ${wpn.name.toUpperCase()}`);
        this.equipWeapon(weaponId);

        if (this.game && this.game.updateMerchantUI) {
            this.game.updateMerchantUI();
        }
        return true;
    }

    buyItem(itemId) {
        if (itemId === 'estus_shard') {
            const cost = 1500;
            if (this.souls < cost) {
                this.game.showNotification("INSUFFICIENT SOULS");
                return false;
            }
            this.souls -= cost;
            this.maxEstus += 1;
            this.estusFlasks = this.maxEstus;
            this.audio.playBonfireIgnite();
            this.game.showNotification(`ESTUS SHARD REINFORCED &bull; MAX FLASKS: ${this.maxEstus}`);
        } else if (itemId === 'divine_blessing') {
            const cost = 800;
            if (this.souls < cost) {
                this.game.showNotification("INSUFFICIENT SOULS");
                return false;
            }
            this.souls -= cost;
            this.hp = this.maxHp;
            this.stamina = this.maxStamina;
            this.audio.playEstusDrink();
            this.game.showNotification("DIVINE BLESSING CONSUMED &bull; FULL HP & STAMINA RESTORED");
        } else if (itemId === 'charcoal_resin') {
            const cost = 500;
            if (this.souls < cost) {
                this.game.showNotification("INSUFFICIENT SOULS");
                return false;
            }
            this.souls -= cost;
            this.applyCharcoalResin();
        } else if (itemId === 'homeward_bone') {
            const cost = 300;
            if (this.souls < cost) {
                this.game.showNotification("INSUFFICIENT SOULS");
                return false;
            }
            this.souls -= cost;
            this.useHomewardBone();
        } else if (itemId === 'torch_pitch') {
            const cost = 100;
            if (this.souls < cost) {
                this.game.showNotification("INSUFFICIENT SOULS");
                return false;
            }
            this.souls -= cost;
            this.game.refuelTorch(100);
            this.game.showNotification("FLASK OF TORCH PITCH APPLIED &bull; 100% REFUEL");
        }

        if (this.game && this.game.updateHUD) {
            this.game.updateHUD();
        }
        if (this.game && this.game.updateMerchantUI) {
            this.game.updateMerchantUI();
        }
        if (this.game && this.game.saveGame) {
            this.game.saveGame(false);
        }
        return true;
    }

    applyCharcoalResin() {
        this.charcoalResinTimer = 45;
        this.audio.playBonfireIgnite();
        this.game.showNotification("CHARCOAL PINE RESIN APPLIED (+60 FIRE DMG FOR 45s)");
    }

    useHomewardBone() {
        this.audio.playBonfireIgnite();
        this.game.showNotification("HOMEWARD BONE: RETURNING TO BONFIRE");
        this.game.playerMesh.position.set(0, 0, 5);
        this.hp = this.maxHp;
        this.estusFlasks = this.maxEstus;
        this.stamina = this.maxStamina;
        this.spawnEnemies();
    }

    // ----------------------------------------------------
    // RINGS & TALISMANS LOGIC & BONUSES
    // ----------------------------------------------------
    hasRing(ringId) {
        return Boolean(this.equippedRings && this.equippedRings.includes(ringId));
    }

    equipRing(slotIndex, ringId) {
        if (slotIndex < 0 || slotIndex >= this.maxRingSlots) return;
        if (!this.ringsDatabase[ringId]) return;
        this.equippedRings[slotIndex] = ringId;
        this.applyRingBonuses();
        if (this.game && this.game.showNotification) {
            const r = this.ringsDatabase[ringId];
            this.game.showNotification(`💍 EQUIPPED: ${r.icon} ${r.name}`);
        }
        if (this.audio && this.audio.playRoll) this.audio.playRoll();
        if (this.game && this.game.updateRingsUI) this.game.updateRingsUI();
    }

    unequipRing(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.maxRingSlots) return;
        this.equippedRings[slotIndex] = null;
        this.applyRingBonuses();
        if (this.game && this.game.updateRingsUI) this.game.updateRingsUI();
    }

    applyRingBonuses() {
        let hpMult = 1.0;
        let staminaMult = 1.0;
        if (this.hasRing('ring_favor')) {
            hpMult += 0.2;
            staminaMult += 0.2;
        }
        if (this.hasRing('erdtree_favor')) {
            hpMult += 0.15;
            staminaMult += 0.15;
        }
        if (this.hasRing('radagon_soreseal')) {
            hpMult += 0.1;
            staminaMult += 0.1;
        }
        const baseHp = 1000 + (this.vigor - 10) * 45;
        this.maxHp = Math.round(baseHp * hpMult);
        this.hp = Math.min(this.hp, this.maxHp);

        const baseStam = 100 + (this.endurance - 10) * 5;
        this.maxStamina = Math.round(baseStam * staminaMult);
        this.stamina = Math.min(this.stamina, this.maxStamina);

        let regen = 38;
        if (this.hasRing('cloranthy')) regen = Math.round(regen * 1.5);
        this.staminaRegenRate = regen;

        let basePoise = 180 + (this.level - 1) * 12 + (this.endurance - 10) * 6;
        if (this.hasRing('havel')) basePoise = Math.round(basePoise * 1.5);
        if (this.hasRing('wolf_ring')) basePoise += 60;
        if (this.hasRing('erdtree_favor')) basePoise = Math.round(basePoise * 1.25);
        this.maxPoise = basePoise;
        this.poise = Math.min(this.poise, this.maxPoise);

        if (this.game && this.game.updateHUD) this.game.updateHUD();
    }

    // ----------------------------------------------------
    // SPELLCASTING METHODS (TRY CAST SPELL & CYCLE SPELLS)
    // ----------------------------------------------------
    tryCastSpell() {
        if (this.isDead || this.isRolling || this.isDrinkingEstus || this.isStaggered || this.isAttacking) return false;
        const spell = this.spells[this.currentSpellId] || this.spells.soul_arrow;
        const stamCost = spell.staminaCost || 25;
        if (this.stamina < stamCost) {
            if (this.game && this.game.showNotification) {
                this.game.showNotification("⚠️ NOT ENOUGH STAMINA FOR SPELL");
            }
            return false;
        }

        this.stamina = Math.max(0, this.stamina - stamCost);
        this.staminaDelay = 0.65;
        this.isAttacking = true;
        this.attackCombo = 1;
        this.attackTime = 0;

        // Spawn spell projectile
        const pPos = this.game.playerMesh.position.clone().add(new THREE.Vector3(0, 1.25, 0));
        const rot = this.game.playerMesh.rotation.y;
        const dir = new THREE.Vector3(Math.sin(rot), 0, Math.cos(rot)).normalize();

        const sGeo = new THREE.SphereGeometry(0.24, 8, 8);
        const sMat = new THREE.MeshBasicMaterial({ color: spell.color, transparent: true, opacity: 0.95 });
        const pMesh = new THREE.Mesh(sGeo, sMat);
        pMesh.position.copy(pPos).add(dir.clone().multiplyScalar(0.7));
        this.game.scene.add(pMesh);

        const pLight = new THREE.PointLight(spell.color, 3.0, 12);
        pMesh.add(pLight);

        this.projectiles.push({
            mesh: pMesh,
            dir: dir,
            speed: spell.speed || 24,
            life: 2.0,
            damage: spell.damage || 350
        });

        if (this.audio) {
            if (spell.type.includes('Lightning')) this.audio.playSunlightFlame();
            else if (spell.type.includes('Pyromancy')) this.audio.playBonfireIgnite();
            else this.audio.playSwing(false);
        }

        if (this.game && this.game.showNotification) {
            this.game.showNotification(`${spell.icon} CAST: ${spell.name} (${spell.damage} DMG)`);
        }

        if (this.game && this.game.shakeCamera) {
            this.game.shakeCamera(0.2, 0.2);
        }

        return true;
    }

    cycleSpell(dir = 1) {
        if (!this.unlockedSpells || this.unlockedSpells.length <= 1) return;
        const idx = this.unlockedSpells.indexOf(this.currentSpellId);
        const nextIdx = (idx + dir + this.unlockedSpells.length) % this.unlockedSpells.length;
        this.currentSpellId = this.unlockedSpells[nextIdx];
        const s = this.spells[this.currentSpellId];
        if (this.game && this.game.showNotification) {
            this.game.showNotification(`⚡ SPELL: ${s.icon} ${s.name} (${s.damage} DMG)`);
        }
        if (this.audio && this.audio.playRoll) this.audio.playRoll();
        this.updateSpellHUD();
    }

    updateSpellHUD() {
        const s = this.spells[this.currentSpellId];
        if (!s) return;
        const slotTop = document.querySelector('.eq-top .eq-icon');
        if (slotTop) {
            slotTop.textContent = s.icon;
        }
        const eqTop = document.querySelector('.eq-top');
        if (eqTop) {
            eqTop.setAttribute('title', `${s.name} [3] (Click to Cast)`);
        }
    }

    fireMoonlightBeam() {
        const playerPos = this.game.playerMesh.position.clone().add(new THREE.Vector3(0, 1.2, 0));
        const rot = this.game.playerMesh.rotation.y;
        const dir = new THREE.Vector3(Math.sin(rot), 0, Math.cos(rot)).normalize();

        // 3D Crescent Moon Wave Mesh
        const beamMat = new THREE.MeshBasicMaterial({ color: 0x55ffff, transparent: true, opacity: 0.9 });
        const beamGeo = new THREE.TorusGeometry(0.8, 0.08, 6, 16, Math.PI);
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.copy(playerPos).add(dir.clone().multiplyScalar(0.8));
        beam.rotation.y = rot - Math.PI / 2;
        beam.rotation.x = Math.PI / 2;
        this.game.scene.add(beam);

        const beamLight = new THREE.PointLight(0x00ffff, 2.5, 10);
        beam.add(beamLight);

        this.projectiles.push({
            mesh: beam,
            dir: dir,
            speed: 18,
            life: 1.6,
            damage: 260
        });

        this.audio.playSunlightFlame(); // Cosmic swish
    }

    triggerShockwave() {
        const pPos = this.game.playerMesh.position;
        this.game.shakeCamera(0.4, 0.35);

        // Ground dust ring
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const dust = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.2),
                new THREE.MeshBasicMaterial({ color: 0x6e5c46, transparent: true, opacity: 0.7 })
            );
            dust.position.set(pPos.x + Math.cos(angle) * 1.5, 0.2, pPos.z + Math.sin(angle) * 1.5);
            this.game.scene.add(dust);
            this.world.sparkParticles.push({
                mesh: dust,
                vel: new THREE.Vector3(Math.cos(angle) * 4, 1.2, Math.sin(angle) * 4),
                life: 0.45,
                maxLife: 0.45
            });
        }
    }

    damagePlayer(damage, attackerPos) {
        if (this.isDead || this.isInvincible || this.isGodMode) return;
        // Blacksmith Armor Tempering Reduction (System 301-330)
        if (this.game && this.game.blacksmith) {
            damage = Math.max(1, Math.round(damage * this.game.blacksmith.getArmorDamageReduction()));
        }

        // QA Test Mode Hook: Clamp incoming damage to 1 HP
        if (this.qaOneHpDamage || (window.qaSuite && window.qaSuite.qaOneHpDamageActive)) {
            damage = 1;
        }

        // Check if player is actively Parrying (Parry window = exactly 4 frames)
        const isParryActive = this.isParrying && 
                              this.parryTime >= this.parryStartup && 
                              this.parryTime <= (this.parryStartup + this.parryActiveDuration);
        if (isParryActive) {
            // SUCCESSFUL PARRY (4 active frames)!
            this.audio.playParry();
            this.world.spawnHitSparks(this.game.playerMesh.position, true);
            this.game.shakeCamera(0.25, 0.3);
            if (this.game.triggerHitstop) this.game.triggerHitstop(3);

            // Find attacker to stun
            for (const e of this.enemies) {
                if (!e.isDead && e.mesh && e.mesh.position.distanceTo(attackerPos) < 2.5) {
                    e.isRiposteable = true;
                    e.riposteTimer = 2.6; // Stunned for riposte
                    e.state = 'RIPOSTE';
                    this.game.showNotification("PARRY! RIPOSTE READY!");
                    break;
                }
            }
            return;
        }

        // Check if player is Blocking
        if (this.isBlocking && this.stamina > 15) {
            const playerRot = this.game.playerMesh.rotation.y;
            const forward = new THREE.Vector3(Math.sin(playerRot), 0, Math.cos(playerRot));
            const toAttacker = new THREE.Vector3().subVectors(attackerPos, this.game.playerMesh.position).normalize();

            if (forward.dot(toAttacker) > 0.2) {
                // Block absorbed attack!
                const stamCost = Math.round(damage * 0.35);
                this.stamina = Math.max(0, this.stamina - stamCost);
                this.staminaDelay = 0.8;
                this.audio.playBlock();
                this.world.spawnHitSparks(this.game.playerMesh.position, false);
                this.game.shakeCamera(0.15, 0.2);
                if (this.game.triggerHitstop) this.game.triggerHitstop(3);

                // Poise damage while blocking
                this.poise -= Math.round(damage * 0.25);
                this.poiseRegenDelay = 3.0;

                if (this.stamina <= 0 || this.poise <= 0) {
                    // Guard broken: player stun strictly 0.30s max, reduces further as player levels up
                    this.poise = 0;
                    this.isStaggered = true;
                    const playerStunDuration = Math.max(0.12, 0.30 - Math.min(0.15, (this.level - 1) * 0.005));
                    this.staggerTime = playerStunDuration;
                    this.maxStaggerTimer = playerStunDuration;
                    this.isBlocking = false;
                    this.guardCounterWindow = 0;
                    this.game.showNotification(`⚠️ GUARD BROKEN! STUNNED (${playerStunDuration.toFixed(2)}s)`);
                } else {
                    this.guardCounterWindow = 0.65;
                    this.game.showNotification("🛡️ BLOCKED • [LMB] GUARD COUNTER READY!");
                }
                return;
            }
        }

        // Direct hit taken
        this.hp = Math.max(0, this.hp - damage);
        this.audio.playHit(false);
        this.world.spawnBlood(this.game.playerMesh.position);
        this.game.shakeCamera(0.25, 0.35);
        this.game.flashDamageScreen();
        if (this.game.triggerHitstop) this.game.triggerHitstop(3);

        // Poise & Stagger: Minimal poise wear from small mobs, regenerates quickly
        const isBossHit = !!(this.boss && this.boss.isAttacking && !this.boss.isDead);
        const directPoiseDmg = isBossHit ? Math.max(8, Math.round(damage * 0.12)) : Math.max(1, Math.round(damage * 0.035));
        this.poise -= directPoiseDmg;
        this.poiseRegenDelay = 1.6;

        if (this.hp <= 0) {
            this.killPlayer();
        } else if (this.poise <= 0) {
            // Poise broken: rare player stun strictly 0.20s max, reduces down to 0.08s with level scaling
            this.poise = 0;
            this.isStaggered = true;
            const playerStunDuration = Math.max(0.08, 0.20 - Math.min(0.12, (this.level - 1) * 0.005));
            this.staggerTime = playerStunDuration;
            this.maxStaggerTimer = playerStunDuration;
            this.isAttacking = false;
            this.isBlocking = false;
            this.game.showNotification(`⚠️ POISE BROKEN! STUNNED (${playerStunDuration.toFixed(2)}s)`);
        } else {
            // Player still has poise! Small mobs NEVER stagger the player.
            // Only colossal boss hits (damage >= 180 from an attacking boss) cause a brief stagger.
            if (isBossHit && damage >= 180) {
                this.isStaggered = true;
                const playerStunDuration = Math.max(0.08, 0.15 - Math.min(0.07, (this.level - 1) * 0.003));
                this.staggerTime = playerStunDuration;
                this.maxStaggerTimer = playerStunDuration;
            } else {
                // Poise absorbs impact! Player retains 100% fluid movement, attack combos, and roll freedom!
                this.isStaggered = false;
            }
        }
    }

    killEnemy(enemy) {
        enemy.isDead = true;

        // === NEW: 6 Mob Death Animation Styles (Animations #1-6) ===
        enemy._deathStyle = Math.floor(Math.random() * 6);
        enemy._deathTimer = 0;
        enemy.state = 'DEAD';
        const soulReward = enemy.souls || 150;
        this.souls += soulReward;
        this.game.showSoulsGained(soulReward);

        // Dark Souls Lore Item Unlocking & Notification
        if (enemy.loreId && window.DarkSoulsLore) {
            const unlockResult = window.DarkSoulsLore.unlock(enemy.loreId);
            if (unlockResult && unlockResult.wasNew) {
                this.game.showNotification(`📜 LORE DISCOVERED: ${enemy.loreTitle || unlockResult.item.title}`);
                if (this.audio && this.audio.playBellToll) this.audio.playBellToll();
            }
        }

        // Spawn 3D glowing lore drop beacon at enemy position
        if (this.game && this.game.spawnLoreItemBeacon && enemy.mesh) {
            const dropPos = enemy.mesh.position.clone();
            this.game.spawnLoreItemBeacon(dropPos, enemy.loreId, enemy.loreTitle || enemy.name);
        }

        // Auto-save progress and gained souls
        if (this.game && this.game.triggerAutoSave) {
            this.game.triggerAutoSave('ENEMY_DEFEAT');
        }

        // Trigger realistic Dark Souls ragdoll collapse
        enemy.deathProgress = 0;
        enemy.isAttacking = false;
        enemy.isStaggered = false;

        // Guaranteed fallback removal: if ragdoll or entity mesh still exists after 2.8s, remove it
        if (enemy.mesh) {
            const enemyMesh = enemy.mesh;
            setTimeout(() => {
                if (enemyMesh && enemyMesh.parent) {
                    enemyMesh.parent.remove(enemyMesh);
                } else if (enemyMesh && this.game && this.game.scene) {
                    this.game.scene.remove(enemyMesh);
                }
            }, 2800);
        }

        // Launch Articulated 3D Ragdoll Physics
        const isHeavyWeapon = (this.attackCombo === 3 || this.currentWeapon === 'zweihander');
        this.initRagdoll(enemy, null, isHeavyWeapon);
    }

    triggerBossPhase2() {
        this.boss.isPhase2 = true;
        this.game.shakeCamera(0.45, 0.7);

        const id = this.boss.id;
        if (id === 'taurus') {
            this.audio.playBossRoar();
            this.game.showNotification("TAURUS DEMON ENRAGED!");
            if (this.boss.mesh.userData.weaponFlame) this.boss.mesh.userData.weaponFlame.intensity = 4.5;
            if (this.boss.mesh.userData.lavaCrack) this.boss.mesh.userData.lavaCrack.material.emissiveIntensity = 2.5;
        } else if (id === 'gargoyle') {
            this.audio.playBellToll();
            this.game.showNotification("BELL OF AWAKENING RINGS! GARGOYLE ENRAGED!");
            if (this.boss.mesh.userData.throatFlame) this.boss.mesh.userData.throatFlame.intensity = 3.5;
        } else if (id === 'capra') {
            this.audio.playBossRoar();
            this.game.showNotification("CAPRA DEMON BLOODLUST!");
        } else if (id === 'sif') {
            this.audio.playWolfHowl();
            this.game.showNotification("SIF FIGHTS FOR ARTORIAS!");
            if (this.boss.mesh.userData.swordGlow) this.boss.mesh.userData.swordGlow.intensity = 4.5;
        } else if (id === 'gwyn') {
            this.audio.playSunlightFlame();
            this.game.showNotification("GWYN CHANNELS THE FIRST FLAME!");
            if (this.boss.mesh.userData.weaponFlame) this.boss.mesh.userData.weaponFlame.intensity = 6.5;
        }
    }

    killBoss() {
        this.boss.isDead = true;
        this.boss.state = 'DEAD';
        if (!this.defeatedBosses.includes(this.boss.id)) {
            this.defeatedBosses.push(this.boss.id);
        }
        const soulReward = this.boss.souls || 5000;
        this.souls += soulReward;
        this.audio.playVictory();
        this.audio.setBossMusic(false);
        this.game.triggerVictoryBanner(this.boss.name);

        // Soul Dissipation: Dissolve boss 3D model into soul energy and remove from world
        const dyingMesh = this.boss.mesh;
        if (dyingMesh) {
            const startScale = dyingMesh.scale.clone();
            const startY = dyingMesh.position.y;
            const startTime = performance.now();
            const dissolveDur = 2500; // 2.5s authentic boss death dissolution
            
            const dissolveStep = () => {
                const elapsed = performance.now() - startTime;
                const progress = Math.min(1.0, elapsed / dissolveDur);
                const fade = Math.max(0, 1.0 - progress);
                
                if (dyingMesh && dyingMesh.parent) {
                    dyingMesh.scale.set(startScale.x * fade, startScale.y * fade, startScale.z * fade);
                    dyingMesh.position.y = startY - progress * 0.8;
                    
                    if (progress < 1.0) {
                        requestAnimationFrame(dissolveStep);
                    } else {
                        if (dyingMesh.parent) dyingMesh.parent.remove(dyingMesh);
                        else this.game.scene.remove(dyingMesh);
                    }
                }
            };
            requestAnimationFrame(dissolveStep);
            
            // Hard safety timeout fallback
            setTimeout(() => {
                if (dyingMesh && dyingMesh.parent) dyingMesh.parent.remove(dyingMesh);
                else if (dyingMesh && this.game && this.game.scene) this.game.scene.remove(dyingMesh);
            }, 3000);
        }

        // Unlock corresponding realm & spawn Waystone portal
        const def = this.bossRoster.find(b => b.id === this.boss.id);
        let unlockedLoc = null;
        if (def && def.unlockLocationId && this.game && this.game.unlockLocationForBoss) {
            unlockedLoc = this.game.unlockLocationForBoss(this.boss.id, def.unlockLocationId);
        }

        // Auto-save on boss victory
        if (this.game && this.game.saveGame) {
            this.game.saveGame(true, `VICTORY OVER ${this.boss.name}`);
        }
        if (this.game && this.game.updateBossRosterUI) {
            this.game.updateBossRosterUI();
        }

        // Notify and smoothly trigger next lord unlock transition
        const currentIdx = this.bossRoster.findIndex(b => b.id === this.boss.id);
        if (currentIdx >= 0 && currentIdx < this.bossRoster.length - 1) {
            const nextBoss = this.bossRoster[currentIdx + 1];
            setTimeout(() => {
                if (this.game && this.game.showNextLordUnlockedModal) {
                    this.game.showNextLordUnlockedModal(this.boss, nextBoss, unlockedLoc);
                } else {
                    this.game.showNotification(`⚔️ NEXT LORD UNLOCKED: ${nextBoss.name}!`);
                }
            }, 3600);
        } else {
            setTimeout(() => {
                this.game.showNotification(`👑 ALL ${this.bossRoster.length} LORDS OF LORDRAN SLAIN! YOU ARE THE LORD OF CINDER!`);
            }, 3600);
        }
    }

    killPlayer() {
        this.isDead = true;
        this.isAttacking = false;
        this.isBlocking = false;
        this.isRolling = false;
        this.isDrinkingEstus = false;
        if (this.interestBurnInterval) {
            clearInterval(this.interestBurnInterval);
            this.interestBurnInterval = null;
        }

        // Choose random comical LOL animation style
        const animNames = [
            "THE DRAMATIC HOLLYWOOD SPIN FLOP",
            "THE YEET / RAGDOLL CARTWHEEL LAUNCH",
            "THE MELODRAMATIC SHAKESPEAREAN KNEEL",
            "THE BREAKDANCE TURTLE SPIN",
            "THE MATRIX LIMBO BACKFALL",
            "THE SLAPSTICK BANANA PEEL SLIP"
        ];
        const styleIdx = Math.floor(Math.random() * animNames.length);
        if (this.game) {
            this.game.deathAnimStyle = styleIdx;
            this.game.deathAnimName = animNames[styleIdx];
            this.game.deathAnimTimer = 0;
            this.game.deathAnimVelY = (styleIdx === 1) ? 5.8 : (styleIdx === 5 ? 3.5 : 0);
        }

        // Store bloodstain with all current souls
        this.bloodstain = {
            souls: this.souls,
            pos: this.game.playerMesh.position.clone()
        };
        const droppedSouls = this.souls;
        this.souls = 0;

        // Spawn 3D Bloodstain & Lost Stuff Beacon in the world
        if (this.game && this.game.spawnBloodstainMarker) {
            this.game.spawnBloodstainMarker(this.bloodstain.pos, droppedSouls);
        }

        if (this.game && this.game.triggerAutoSave) {
            this.game.triggerAutoSave('PLAYER_DEATH');
        }

        this.audio.playYouDied();
        if (this.game && this.game.ui && this.game.ui.interactionPrompt) {
            this.game.ui.interactionPrompt.style.display = 'none';
        }
        this.game.triggerDeathScreen();
    }

    // ----------------------------------------------------
    // BONFIRE REST & LEVEL UP
    // ----------------------------------------------------
    restAtBonfire() {
        if (this.interestBurnInterval) {
            clearInterval(this.interestBurnInterval);
            this.interestBurnInterval = null;
        }
        this.hp = this.maxHp;
        this.estusFlasks = this.maxEstus;
        this.stamina = this.maxStamina;

        // Retrieve bloodstain if near bonfire
        if (this.bloodstain) {
            const dist = this.game.playerMesh.position.distanceTo(this.bloodstain.pos);
            if (dist < 10) {
                this.souls += this.bloodstain.souls;
                this.game.showNotification(`RETRIEVED ${this.bloodstain.souls} LOST SOULS`);
                this.bloodstain = null;
            }
        }

        // Cleanse status effects & replenish supplies
        this.poise = this.maxPoise;
        this.isPoisoned = false;
        this.poisonTimer = 0;
        this.poisonBuildup = 0;
        this.isPetrified = false;
        this.isStaggered = false;
        if (this.game && this.game.apothecary) {
            this.game.apothecary.craftedMeds.venomAntidotes = 5;
            const antiEl = document.getElementById('antidote-count');
            if (antiEl) antiEl.textContent = 'x 5';
        }

        // Resets regular hollow soldiers
        this.spawnEnemies();
        this.audio.playBonfireIgnite();
        this.game.triggerBonfireLitBanner();

        // Auto-save on bonfire rest
        if (this.game && this.game.saveGame) {
            this.game.saveGame(true, 'RESTED AT BONFIRE');
        }
    }

    getMobLevelScale(zoneBonus = 0) {
        const playerLvl = Math.max(1, this.level || 1);
        const mobLvl = Math.max(1, playerLvl + zoneBonus);
        return {
            level: mobLvl,
            hpMult: 1.0 + (mobLvl - 1) * 0.14,      // +14% HP per level
            dmgMult: 1.0 + (mobLvl - 1) * 0.09,     // +9% DMG per level
            soulsMult: 1.0 + (mobLvl - 1) * 0.18    // +18% souls per level
        };
    }

    scaleAllMobsToPlayerLevel() {
        for (let i = 0; i < this.enemies.length; i++) {
            const e = this.enemies[i];
            if (e && !e.isDead) {
                if (!e.baseMaxHp) e.baseMaxHp = e.maxHp;
                if (!e.baseDamage) e.baseDamage = e.damage;
                if (!e.baseSouls) e.baseSouls = e.souls || 150;

                const zoneTier = e.zoneTier || 0;
                const scale = this.getMobLevelScale(zoneTier);
                e.level = scale.level;
                const hpRatio = e.hp / Math.max(1, e.maxHp);
                e.maxHp = Math.round(e.baseMaxHp * scale.hpMult);
                e.hp = Math.max(1, Math.round(e.maxHp * hpRatio));
                e.damage = Math.round(e.baseDamage * scale.dmgMult);
                e.souls = Math.round(e.baseSouls * scale.soulsMult);
            }
        }

        if (this.boss && !this.boss.isDead) {
            const bossScale = this.getMobLevelScale(4); // Bosses get +4 apex tier levels
            if (!this.boss.baseMaxHp) this.boss.baseMaxHp = this.boss.maxHp;
            if (!this.boss.baseDamage) this.boss.baseDamage = this.boss.damage;

            const bossHpRatio = this.boss.hp / Math.max(1, this.boss.maxHp);
            this.boss.level = bossScale.level;
            this.boss.maxHp = Math.round(this.boss.baseMaxHp * bossScale.hpMult);
            this.boss.hp = Math.max(1, Math.round(this.boss.maxHp * bossHpRatio));
            this.boss.damage = Math.round(this.boss.baseDamage * bossScale.dmgMult);
        }

        if (this.game && this.game.showNotification) {
            this.game.showNotification(`⚔️ AUTO-LEVEL UP: ALL MOBS & BOSS AUTO-SCALED TO PLAYER LVL ${this.level}`);
        }
    }

    levelUpStat(stat) {
        const cost = this.level * 250;
        if (this.souls < cost) {
            this.game.showNotification("INSUFFICIENT SOULS");
            return false;
        }

        this.souls -= cost;
        this.level++;

        if (stat === 'vigor') {
            this.vigor++;
            this.maxHp += 100;
            this.hp = this.maxHp;
        } else if (stat === 'endurance') {
            this.endurance++;
            this.maxStamina += 15;
            this.stamina = this.maxStamina;
        } else if (stat === 'strength') {
            this.strength++;
        }

        this.audio.playEstusDrink();

        // Update player poise & stats scaling with level
        this.applyRingBonuses();

        // All mobs level up with player
        this.scaleAllMobsToPlayerLevel();

        // Auto-save on stat upgrade
        if (this.game && this.game.saveGame) {
            this.game.saveGame(false);
        }

        return true;
    }

    applyBurnEffect(target) {
        if (!target) return;
        target.isBurning = true;
        target.burnTimer = 3.6; // Burns for 3.6 seconds
        target.burnTickTimer = 0;
    }

    // ----------------------------------------------------
    // UPDATE TICK (COMBAT TIMERS & ENEMY AI)
    // ----------------------------------------------------
    update(delta) {
        // 0. Update Physics Entities (Articulated Ragdolls & Ballistic Projectiles)
        this.updateRagdolls(delta);
        this.updateArrows(delta);
        this.updateSpiritCompanion(delta);

        if (this._warcryBuffTimer > 0) {
            this._warcryBuffTimer -= delta;
        }

        if (this.isDead) return;

        // Admin God Mode: ensure infinite HP and stamina
        if (this.isGodMode) {
            this.hp = this.maxHp;
            this.stamina = this.maxStamina;
        }

        // Torch Fire Burn DoT Processing on Enemies & Boss (Zero-allocation)
        for (let i = 0; i < this.enemies.length; i++) {
            const t = this.enemies[i];
            if (t.isDead || !t.isBurning) continue;
            t.burnTimer -= delta;
            t.burnTickTimer = (t.burnTickTimer || 0) + delta;
            if (t.burnTickTimer >= 0.6) {
                t.burnTickTimer = 0;
                const burnDmg = 18;
                t.hp -= burnDmg;
                if (this.game && this.game.showDamageNumber && t.mesh) {
                    this.game.showDamageNumber(t.mesh.position, burnDmg, false);
                }
                if (this.world && this.world.spawnHitSparks && t.mesh) {
                    this.world.spawnHitSparks(t.mesh.position, false);
                }
                if (t.hp <= 0) this.killEnemy(t);
            }
            if (t.burnTimer <= 0) t.isBurning = false;
        }

        if (this.boss && !this.boss.isDead && this.boss.isBurning) {
            const b = this.boss;
            b.burnTimer -= delta;
            b.burnTickTimer = (b.burnTickTimer || 0) + delta;
            if (b.burnTickTimer >= 0.6) {
                b.burnTickTimer = 0;
                const burnDmg = 18;
                b.hp -= burnDmg;
                if (this.game && this.game.showDamageNumber && b.mesh) {
                    this.game.showDamageNumber(b.mesh.position, burnDmg, false);
                }
                if (this.world && this.world.spawnHitSparks && b.mesh) {
                    this.world.spawnHitSparks(b.mesh.position, false);
                }
                if (b.hp <= 0) this.killBoss();
            }
            if (b.burnTimer <= 0) b.isBurning = false;
        }

        // Poison & Toxic Status Tick Processing (Does NOT stagger player!)
        if (this.isPoisoned) {
            this.poisonTimer -= delta;
            this.poisonTickTimer = (this.poisonTickTimer || 0) + delta;
            if (this.poisonTickTimer >= 1.5) {
                this.poisonTickTimer = 0;
                const pDmg = 5;
                this.hp = Math.max(1, this.hp - pDmg);
                if (this.game && this.game.showDamageNumber && this.game.playerMesh) {
                    this.game.showDamageNumber(this.game.playerMesh.position, pDmg, false);
                }
                if (this.world && this.world.spawnHitSparks && this.game.playerMesh) {
                    this.world.spawnHitSparks(this.game.playerMesh.position, false);
                }
            }
            if (this.poisonTimer <= 0) {
                this.isPoisoned = false;
                if (this.game) this.game.showNotification("✨ POISON PURGED FROM BLOODSTREAM!");
            }
        }

        // Pine Resin Fire Buff Timer
        if (this.charcoalResinTimer > 0) {
            this.charcoalResinTimer -= delta;
        }

        // Guard Counter Window Timer
        if (this.guardCounterWindow > 0) {
            this.guardCounterWindow -= delta;
        }

        // Projectiles Update (Moonlight Beam waves)
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.life -= delta;
            p.mesh.position.addScaledVector(p.dir, p.speed * delta);

            // Check hit against boss
            if (this.boss && !this.boss.isDead) {
                const d = p.mesh.position.distanceTo(this.boss.mesh.position);
                if (d < (this.boss.radius || 2.4) + 1.2) {
                    this.boss.hp -= p.damage;
                    this.game.showDamageNumber(this.boss.mesh.position, p.damage, true);
                    this.world.spawnHitSparks(p.mesh.position, true);
                    this.game.scene.remove(p.mesh);
                    this.projectiles.splice(i, 1);
                    if (this.boss.hp <= 0) this.killBoss();
                    continue;
                }
            }

            // Check hit against hollows
            let hitHollow = false;
            for (const e of this.enemies) {
                if (!e.isDead && p.mesh.position.distanceTo(e.mesh.position) < 1.8) {
                    e.hp -= p.damage;
                    this.game.showDamageNumber(e.mesh.position, p.damage, true);
                    this.world.spawnHitSparks(e.mesh.position, true);
                    this.game.scene.remove(p.mesh);
                    this.projectiles.splice(i, 1);
                    if (e.hp <= 0) {
                        this.killEnemy(e);
                    } else {
                        const behavior = e.behaviorType || 'Swarm';
                        const isSmallMob = (behavior === 'Swarm' || behavior === 'Flanker' || behavior === 'Ranged' || e.isArcher || e.type === 'hollow' || e.type === 'skeleton' || !e.type || e.type === 'mob' || (e.maxHp && e.maxHp < 900));
                        if (isSmallMob) {
                            const doesStagger = Math.random() < 0.20;
                            if (doesStagger) {
                                e.isStaggered = true;
                                e.staggerTimer = 0.30;
                                e.maxStaggerTimer = 0.30;
                                e.state = 'STAGGER';
                                e.attackPhase = 'IDLE';
                                e.isAttacking = false;
                                const pushDir = new THREE.Vector3().subVectors(e.mesh.position, p.mesh.position);
                                pushDir.y = 0;
                                if (pushDir.lengthSq() > 0.001) {
                                    pushDir.normalize();
                                    e.mesh.position.addScaledVector(pushDir, 0.45);
                                }
                            }
                        }
                    }
                    hitHollow = true;
                    break;
                }
            }
            if (hitHollow) continue;

            if (p.life <= 0) {
                this.game.scene.remove(p.mesh);
                this.projectiles.splice(i, 1);
            }
        }

        // 1. Stamina Regeneration
        if (this.staminaDelay > 0) {
            this.staminaDelay -= delta;
        } else if (this.stamina < this.maxStamina) {
            const rate = this.isBlocking ? this.staminaRegenRate * 0.4 : this.staminaRegenRate;
            this.stamina = Math.min(this.maxStamina, this.stamina + rate * delta);
        }

        // 1b. Poise Regeneration (15 pts/sec after 3s delay)
        if (this.poiseRegenDelay > 0) {
            this.poiseRegenDelay -= delta;
        } else if (this.poise < this.maxPoise) {
            this.poise = Math.min(this.maxPoise, this.poise + 15 * delta);
        }

        // 2. Roll Timer & Invincibility Frames (strictly 12 frames = 0.20s)
        if (this.isRolling) {
            this.rollTime += delta;
            const maxDuration = this.isBackstep ? 0.38 : 0.52;
            const iFrameDuration = this.rollIFramesDuration || (12 / 60); // strictly 12 frames (0.20s)
            this.isInvincible = this.rollTime < iFrameDuration;

            // Move player in roll/backstep direction
            const rollSpeed = this.isBackstep ? 6.5 : 8.8;
            this.game.playerMesh.position.addScaledVector(this.rollDir, rollSpeed * delta);
            this.game.resolvePlayerCollisions();

            if (this.rollTime >= maxDuration) {
                this.isRolling = false;
                this.isInvincible = false;
                this.isBackstep = false;
            }
        }

        // 3. Attack Timers
        if (this.isAttacking) {
            this.attackTime += delta;
            const maxDuration = this.attackCombo === 3 ? 0.7 : (this.attackCombo === 4 ? 1.0 : 0.48);
            if (this.attackTime > maxDuration) {
                this.isAttacking = false;
                this.attackCombo = 0;
            }
        }

        // 4. Parry Timer
        if (this.isParrying) {
            this.parryTime += delta;
            if (this.parryTime > 0.5) {
                this.isParrying = false;
            }
        }

        // 5. Estus Drink Timer
        if (this.isDrinkingEstus) {
            this.estusTime += delta;
            if (this.estusTime > 1.2) {
                this.isDrinkingEstus = false;
            }
        }

        // 6. Input Buffering (Queue 1 action up to 150ms before animation ends)
        if (this.bufferTimer > 0) {
            this.bufferTimer -= delta;
            if (this.bufferTimer <= 0) this.inputBuffer = null;
        }
        if (this.inputBuffer && !this.isAttacking && !this.isRolling && !this.isDrinkingEstus && !this.isStaggered && !this.isParrying) {
            const buffered = this.inputBuffer;
            this.inputBuffer = null;
            this.bufferTimer = 0;
            this.executeBufferedAction(buffered.action, buffered.payload);
        }

        // 6. Stagger Timer
        if (this.isStaggered) {
            this.staggerTime -= delta;
            if (this.staggerTime <= 0) {
                this.isStaggered = false;
            }
        }

        // 7. Update Hollow Soldiers AI
        this.updateHollowAI(delta);

        // 8. Update Taurus Demon Boss AI
        this.updateBossAI(delta);
    }

    // ----------------------------------------------------
    // ARTICULATED 3D RAGDOLL PHYSICS ENGINE
    // Handles procedural joint tumbling, bounce restitution,
    // limb flailing, and soul dissipation upon death
    // ----------------------------------------------------
    initRagdoll(entity, hitImpulse = null, isHeavy = false) {
        if (!entity || !entity.mesh) return;
        const mesh = entity.mesh;
        const userData = mesh.userData || {};

        let vel;
        if (hitImpulse) {
            vel = hitImpulse.clone();
        } else {
            const playerRot = (this.game && this.game.playerMesh) ? this.game.playerMesh.rotation.y : 0;
            const playerPos = (this.game && this.game.playerMesh) ? this.game.playerMesh.position : new THREE.Vector3();
            const dir = mesh.position.clone().sub(playerPos).setY(0);
            if (dir.lengthSq() < 0.001) {
                dir.set(Math.sin(playerRot), 0, Math.cos(playerRot));
            } else {
                dir.normalize();
            }

            const horizPower = isHeavy ? (7.5 + Math.random() * 2.2) : (3.6 + Math.random() * 1.5);
            const vertPower = isHeavy ? (4.8 + Math.random() * 1.8) : (2.4 + Math.random() * 1.2);
            vel = dir.multiplyScalar(horizPower).add(new THREE.Vector3(0, vertPower, 0));
        }

        const angVel = new THREE.Vector3(
            (Math.random() - 0.5) * (isHeavy ? 12 : 7),
            (Math.random() - 0.5) * (isHeavy ? 9 : 5),
            (Math.random() - 0.5) * (isHeavy ? 12 : 7)
        );

        const ragdoll = {
            entity: entity,
            mesh: mesh,
            userData: userData,
            pos: mesh.position,
            vel: vel,
            rot: mesh.rotation,
            angVel: angVel,
            isHeavy: isHeavy,
            bounces: 0,
            maxBounces: 3,
            settled: false,
            settleTimer: 0,
            totalTime: 0
        };

        this.ragdolls.push(ragdoll);
    }

    updateRagdolls(delta) {
        if (!this.ragdolls || this.ragdolls.length === 0) return;

        for (let i = this.ragdolls.length - 1; i >= 0; i--) {
            const rd = this.ragdolls[i];
            rd.totalTime = (rd.totalTime || 0) + delta;

            // Safety timeout: If ragdoll has been airborne / falling for > 1.6s, force settle
            // Prevents any mob or archer from remaining frozen or stuck in an infinite tumble
            if (!rd.settled && rd.totalTime > 1.6) {
                rd.settled = true;
                rd.vel.set(0, 0, 0);
                rd.angVel.set(0, 0, 0);
                rd.settleTimer = 0;
            }

            if (!rd.settled) {
                // Gravity & Aerodynamic Drag
                rd.vel.y -= 19.6 * delta;
                const drag = Math.pow(0.96, delta * 60);
                rd.vel.x *= drag;
                rd.vel.z *= drag;

                // Position update
                rd.pos.x += rd.vel.x * delta;
                rd.pos.y += rd.vel.y * delta;
                rd.pos.z += rd.vel.z * delta;

                // Rotation tumble
                rd.rot.x += rd.angVel.x * delta;
                rd.rot.y += rd.angVel.y * delta;
                rd.rot.z += rd.angVel.z * delta;

                // Procedural limb flailing with inertia
                const u = rd.userData;
                const t = rd.totalTime;
                if (u.head) {
                    u.head.rotation.x = Math.sin(t * 15) * 0.45;
                    u.head.rotation.z = Math.cos(t * 12) * 0.35;
                }
                if (u.torso) {
                    u.torso.rotation.x = Math.sin(t * 10) * 0.3;
                    u.torso.rotation.z = Math.cos(t * 11) * 0.25;
                }
                if (u.rightShoulder) {
                    u.rightShoulder.rotation.x = Math.sin(t * 16) * 0.85;
                    u.rightShoulder.rotation.z = 1.2 + Math.cos(t * 12) * 0.5;
                }
                if (u.leftShoulder) {
                    u.leftShoulder.rotation.x = -Math.sin(t * 15) * 0.85;
                    u.leftShoulder.rotation.z = -1.2 + Math.sin(t * 13) * 0.5;
                }
                if (u.rightHip) {
                    u.rightHip.rotation.x = Math.sin(t * 13) * 0.7;
                    u.rightHip.rotation.z = 0.4;
                }
                if (u.leftHip) {
                    u.leftHip.rotation.x = -Math.cos(t * 12) * 0.7;
                    u.leftHip.rotation.z = -0.4;
                }

                // Ground Collision against terrain (pass rd.pos.y to resolve elevations accurately)
                const groundY = this.world.getGroundHeight(rd.pos.x, rd.pos.z, rd.pos.y) + 0.32;
                if (rd.pos.y <= groundY) {
                    rd.pos.y = groundY;
                    if (Math.abs(rd.vel.y) > 2.0 && rd.bounces < rd.maxBounces) {
                        // Elastic Bounce with restitution
                        rd.bounces++;
                        rd.vel.y = -rd.vel.y * 0.36;
                        rd.vel.x *= 0.62;
                        rd.vel.z *= 0.62;
                        rd.angVel.multiplyScalar(0.48);
                        if (this.audio && this.audio.playRagdollThud) this.audio.playRagdollThud();
                        if (this.world && this.world.spawnHitSparks) this.world.spawnHitSparks(rd.pos, false);
                    } else {
                        // Settled on ground
                        rd.vel.set(0, 0, 0);
                        rd.angVel.set(0, 0, 0);
                        rd.settled = true;
                        if (this.audio && this.audio.playRagdollThud) this.audio.playRagdollThud();
                        if (this.world && this.world.spawnHitSparks) this.world.spawnHitSparks(rd.pos, false);
                        
                        // Flatten body naturally onto ground
                        rd.rot.x = Math.PI / 2;
                        rd.rot.z = (Math.random() - 0.5) * 0.3;
                        if (u.bodyGroup) u.bodyGroup.position.y = 0.12;

                        // Relax limbs naturally onto ground
                        if (u.rightShoulder) u.rightShoulder.rotation.set(-0.1, 0, 0.15);
                        if (u.leftShoulder) u.leftShoulder.rotation.set(-0.1, 0, -0.15);
                        if (u.rightHip) u.rightHip.rotation.set(0.08, 0, 0.08);
                        if (u.leftHip) u.leftHip.rotation.set(0.08, 0, -0.08);
                        if (u.head) u.head.rotation.set(0.15, 0.2, 0);
                        if (u.notchedArrow) u.notchedArrow.visible = false;
                        if (u.bowGroup) {
                            u.bowGroup.position.set(0, -0.2, 0);
                            u.bowGroup.rotation.set(0, 0, 0);
                        }
                    }
                }
            } else {
                // Settled: smoothly dissolve into soul energy (authentic Dark Souls soul dissipation)
                rd.settleTimer = (rd.settleTimer || 0) + delta;
                if (rd.settleTimer > 0.6) {
                    const fade = Math.max(0, 1.0 - (rd.settleTimer - 0.6) / 0.8);
                    if (rd.mesh) rd.mesh.scale.setScalar(fade);
                    if (fade <= 0 || rd.settleTimer > 2.2) {
                        if (rd.mesh && rd.mesh.parent) {
                            rd.mesh.parent.remove(rd.mesh);
                        } else if (rd.mesh) {
                            this.game.scene.remove(rd.mesh);
                        }
                        this.ragdolls.splice(i, 1);
                    }
                }
            }
        }
    }

    // ----------------------------------------------------
    // BALLISTIC ARROW & PROJECTILE SYSTEM
    // Physics trajectory, shield deflections, and arrow impacts
    // ----------------------------------------------------
    spawnArrow(fromPos, targetPos, shooter) {
        if (!this.charFactory) return;
        const isMagic = !!(shooter && (shooter.isRuneArcher || (shooter.def && shooter.def.isRuneArcher) || (shooter.name && shooter.name.includes('RUNE'))));
        const arrowMesh = this.charFactory.createArrowMesh(isMagic);
        arrowMesh.position.copy(fromPos);

        // Aim towards player chest
        const target = targetPos.clone().add(new THREE.Vector3(0, 1.1, 0));
        const dist = fromPos.distanceTo(target);
        const arrowSpeed = isMagic ? 36.0 : 32.0;
        const flightTime = Math.max(0.1, dist / arrowSpeed);
        const upComp = 0.5 * (isMagic ? 6.5 : 9.8) * flightTime; // Ballistic parabolic curve compensation (magic arrows fly flatter)

        const dir = target.clone().sub(fromPos).normalize();
        const vel = dir.clone().multiplyScalar(arrowSpeed).add(new THREE.Vector3(0, upComp, 0));

        // Orient mesh along velocity vector
        arrowMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vel.clone().normalize());

        this.game.scene.add(arrowMesh);

        this.arrows.push({
            mesh: arrowMesh,
            pos: fromPos.clone(),
            vel: vel,
            shooter: shooter,
            isMagic: isMagic,
            damage: shooter ? Math.max(14, Math.min(32, (shooter.damage || 18) * (isMagic ? 1.25 : 1.0))) : 18,
            life: 4.0,
            stuck: false,
            stuckTimer: 0
        });
    }

    updateArrows(delta) {
        if (!this.arrows || this.arrows.length === 0) return;
        const playerPos = (this.game && this.game.playerMesh) ? this.game.playerMesh.position : null;

        for (let i = this.arrows.length - 1; i >= 0; i--) {
            const arr = this.arrows[i];
            arr.life -= delta;

            if (arr.stuck) {
                arr.stuckTimer += delta;
                // Subtle quiver vibration on impact
                if (arr.stuckTimer < 0.35) {
                    arr.mesh.rotation.z += Math.sin(arr.stuckTimer * 45) * 0.04 * (1 - arr.stuckTimer / 0.35);
                }
                if (arr.stuckTimer > 1.5 || arr.life <= 0) {
                    const fade = Math.max(0, 1.0 - (arr.stuckTimer - 3.0) / 0.8);
                    arr.mesh.scale.setScalar(fade);
                    if (fade <= 0 || arr.life <= 0) {
                        this.game.scene.remove(arr.mesh);
                        this.arrows.splice(i, 1);
                    }
                }
                continue;
            }

            // Ballistic flight with gravity
            arr.vel.y -= 9.8 * delta;
            arr.pos.x += arr.vel.x * delta;
            arr.pos.y += arr.vel.y * delta;
            arr.pos.z += arr.vel.z * delta;
            arr.mesh.position.copy(arr.pos);

            // Orient arrow to velocity vector
            const normVel = arr.vel.clone().normalize();
            if (normVel.lengthSq() > 0.001) {
                arr.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normVel);
            }

            // Check Player Collision
            if (playerPos && !this.isDead) {
                const chestPos = playerPos.clone().add(new THREE.Vector3(0, 1.1, 0));
                const distToPlayer = arr.pos.distanceTo(chestPos);

                if (distToPlayer < 0.95) {
                    // Check if player is blocking
                    if (this.isBlocking && this.stamina > 10) {
                        const playerRot = this.game.playerMesh.rotation.y;
                        const playerFacing = new THREE.Vector3(Math.sin(playerRot), 0, Math.cos(playerRot));
                        const incomingDir = arr.vel.clone().negate().setY(0).normalize();

                        if (playerFacing.dot(incomingDir) > 0.25) {
                            // BLOCKED WITH SHIELD!
                            if (arr.isMagic) {
                                if (this.audio && this.audio.playMagicArrowHit) this.audio.playMagicArrowHit(true);
                                if (this.world && this.world.spawnMagicRuneSparks) this.world.spawnMagicRuneSparks(arr.pos);
                            } else {
                                if (this.audio && this.audio.playArrowHit) this.audio.playArrowHit(true);
                                if (this.world && this.world.spawnHitSparks) this.world.spawnHitSparks(arr.pos, true);
                            }
                            if (this.game && this.game.shakeCamera) this.game.shakeCamera(0.18, 0.2);

                            this.stamina = Math.max(0, this.stamina - (arr.isMagic ? 24 : 18));
                            this.staminaDelay = 0.8;

                            // Deflect arrow away realistically
                            arr.vel.reflect(playerFacing).multiplyScalar(0.35);
                            arr.vel.y += 2.0;
                            arr.life = Math.min(arr.life, 1.5); // Quick despawn after deflect
                            continue;
                        }
                    }

                    // UNBLOCKED HIT!
                    if (!this.isRolling && !this.isInvincible) {
                        if (arr.isMagic) {
                            if (this.audio && this.audio.playMagicArrowHit) this.audio.playMagicArrowHit(false);
                            if (this.world && this.world.spawnMagicRuneSparks) this.world.spawnMagicRuneSparks(arr.pos);
                        } else {
                            if (this.audio && this.audio.playArrowHit) this.audio.playArrowHit(false);
                            if (this.world && this.world.spawnHitSparks) this.world.spawnHitSparks(arr.pos, false);
                        }
                        const attackerPos = arr.shooter ? (arr.shooter.mesh ? arr.shooter.mesh.position : arr.pos) : arr.pos;
                        this.damagePlayer(arr.damage, attackerPos);

                        // Cleanly remove arrow immediately on impact with player (no floating clipped arrows)
                        this.game.scene.remove(arr.mesh);
                        this.arrows.splice(i, 1);
                        continue;
                    }
                }
            }

            // Check Ground / Terrain Collision
            const groundY = this.world.getGroundHeight(arr.pos.x, arr.pos.z);
            if (arr.pos.y <= groundY + 0.15) {
                arr.pos.y = groundY + 0.1;
                arr.mesh.position.y = arr.pos.y;
                arr.stuck = true;
                if (arr.isMagic) {
                    if (this.audio && this.audio.playMagicArrowHit) this.audio.playMagicArrowHit(false);
                    if (this.world && this.world.spawnMagicRuneSparks) this.world.spawnMagicRuneSparks(arr.pos);
                } else {
                    if (this.audio && this.audio.playArrowHit) this.audio.playArrowHit(false);
                    if (this.world && this.world.spawnHitSparks) this.world.spawnHitSparks(arr.pos, false);
                }
                continue;
            }

            // Expire out of bounds
            if (arr.life <= 0 || arr.pos.y < -30) {
                this.game.scene.remove(arr.mesh);
                this.arrows.splice(i, 1);
            }
        }
    }

    updateHollowAI(delta) {
        const playerPos = this.game.playerMesh.position;
        if (!this._scratchMobVec) this._scratchMobVec = new THREE.Vector3();

        // Frustum Culling Matrix Setup
        if (!this._frustum) this._frustum = new THREE.Frustum();
        if (!this._projScreenMatrix) this._projScreenMatrix = new THREE.Matrix4();
        this._projScreenMatrix.multiplyMatrices(this.game.camera.projectionMatrix, this.game.camera.matrixWorldInverse);
        this._frustum.setFromProjectionMatrix(this._projScreenMatrix);

        // Group Coordination: 3+ mobs use flanking (1 flanks, 2 front)
        const chasingMobs = [];
        for (let k = 0; k < this.enemies.length; k++) {
            const mob = this.enemies[k];
            if (!mob.isDead && mob.mesh && (mob.state === 'CHASE' || mob.state === 'WINDUP' || mob.state === 'STRIKE' || mob.state === 'RECOVERY')) {
                const d = mob.mesh.position.distanceTo(playerPos);
                if (d < 35.0) chasingMobs.push({ mob, dist: d });
            }
        }
        if (chasingMobs.length >= 3) {
            chasingMobs.sort((a, b) => a.dist - b.dist);
            // 2 front
            chasingMobs[0].mob._groupFlankOffset = 0;
            chasingMobs[1].mob._groupFlankOffset = 0;
            // 1 flank
            chasingMobs[2].mob._groupFlankOffset = 0.85 * (chasingMobs[2].mob.flankDir || 1);
            for (let m = 3; m < chasingMobs.length; m++) {
                chasingMobs[m].mob._groupFlankOffset = (m % 2 === 0 ? 0.75 : -0.75);
            }
        } else {
            for (let k = 0; k < chasingMobs.length; k++) {
                chasingMobs[k].mob._groupFlankOffset = 0;
            }
        }

        // Active melee attacker throttle (prevent 5 mobs striking simultaneously)
        let activeMeleeStrikes = 0;
        for (let k = 0; k < chasingMobs.length; k++) {
            const m = chasingMobs[k].mob;
            if (m.isAttacking && m.behaviorType !== 'Ranged' && !m.isArcher) {
                activeMeleeStrikes++;
            }
        }

        for (let i = 0; i < this.enemies.length; i++) {
            const e = this.enemies[i];
            if (!e.mesh) continue;

            const u = e.mesh.userData;

            // Animate orbiting rune rings on Carian Glintstone Rune Archers
            if (u.runeRingUpper) u.runeRingUpper.rotation.z += 0.04;
            if (u.runeRingLower) u.runeRingLower.rotation.z -= 0.04;

            // 1. Articulated Ragdoll Physics handles deceased entities in updateRagdolls
            if (e.isDead || e.state === 'DEAD') {
                // === NEW: 6 Procedural Mob Death Animations (Animations #1-6) ===
                if (e._deathStyle !== undefined && e._deathTimer !== undefined && e.mesh && e.mesh.visible) {
                    e._deathTimer += delta;
                    const dt = e._deathTimer;
                    const mu = e.mesh.userData;
                    const gY = this.world.getGroundHeight(e.mesh.position.x, e.mesh.position.z);
                    
                    if (e._deathStyle === 0) {
                        // Death #1: "Crumbling Kneel" — falls to knees then face-plants
                        if (dt < 0.6) {
                            if (mu.rightHip) mu.rightHip.rotation.x = -dt * 2.2;
                            if (mu.leftHip) mu.leftHip.rotation.x = -dt * 2.2;
                            if (mu.torso) mu.torso.rotation.x = -dt * 0.8;
                            e.mesh.position.y = Math.max(gY - 0.3, e.mesh.position.y - delta * 1.5);
                        } else {
                            if (mu.torso) mu.torso.rotation.x = Math.min(1.4, mu.torso.rotation.x + delta * 3.5);
                            if (mu.head) mu.head.rotation.x = 0.6;
                            if (mu.rightShoulder) mu.rightShoulder.rotation.z = -0.9;
                            if (mu.leftShoulder) mu.leftShoulder.rotation.z = 0.9;
                        }
                    } else if (e._deathStyle === 1) {
                        // Death #2: "Spiral Collapse" — spins while falling sideways
                        e.mesh.rotation.y += delta * 8.0 * Math.max(0.1, 1.0 - dt / 1.5);
                        e.mesh.rotation.z = Math.min(Math.PI / 2, dt * 2.8);
                        e.mesh.position.y = Math.max(gY, e.mesh.position.y - delta * 2.0);
                        if (mu.rightShoulder) mu.rightShoulder.rotation.x = -1.2;
                        if (mu.leftShoulder) mu.leftShoulder.rotation.x = 1.4;
                    } else if (e._deathStyle === 2) {
                        // Death #3: "Stumble Back" — staggers backwards before collapsing
                        if (dt < 0.5) {
                            e.mesh.position.z -= delta * 2.5;
                            if (mu.torso) mu.torso.rotation.x = -dt * 1.5;
                            if (mu.rightShoulder) mu.rightShoulder.rotation.z = -dt * 2.0;
                            if (mu.leftShoulder) mu.leftShoulder.rotation.z = dt * 2.0;
                        } else {
                            e.mesh.rotation.x = -Math.min(Math.PI / 2, (dt - 0.5) * 3.5);
                            e.mesh.position.y = Math.max(gY, e.mesh.position.y - delta * 3.0);
                        }
                    } else if (e._deathStyle === 3) {
                        // Death #4: "Disembowel Clutch" — grabs stomach, doubles over
                        if (dt < 0.8) {
                            if (mu.torso) mu.torso.rotation.x = dt * 1.8;
                            if (mu.rightShoulder) mu.rightShoulder.rotation.x = 1.2 * dt;
                            if (mu.leftShoulder) mu.leftShoulder.rotation.x = 1.2 * dt;
                            if (mu.head) mu.head.rotation.x = dt * 0.8;
                        } else {
                            e.mesh.position.y = Math.max(gY, e.mesh.position.y - delta * 2.0);
                            if (mu.rightHip) mu.rightHip.rotation.x = -1.0;
                            if (mu.leftHip) mu.leftHip.rotation.x = -0.8;
                        }
                    } else if (e._deathStyle === 4) {
                        // Death #5: "Violent Knockback Launch" — launched backwards
                        if (dt < 0.3) {
                            e.mesh.position.y += delta * 4.0;
                            e.mesh.position.z -= delta * 5.0;
                            e.mesh.rotation.x -= delta * 8.0;
                        } else {
                            e.mesh.position.y = Math.max(gY, e.mesh.position.y - delta * 8.0);
                            if (mu.leftHip) mu.leftHip.rotation.x = Math.sin(dt * 12) * 0.6;
                            if (mu.rightHip) mu.rightHip.rotation.x = -Math.sin(dt * 12) * 0.6;
                        }
                    } else {
                        // Death #6: "Slow Timber Fall" — rigid body topple like a felled tree
                        e.mesh.rotation.x = -Math.min(Math.PI / 2, dt * 1.5);
                        e.mesh.position.y = Math.max(gY, e.mesh.position.y - delta * 1.0);
                        if (mu.rightShoulder) mu.rightShoulder.rotation.set(0, 0, -0.4);
                        if (mu.leftShoulder) mu.leftShoulder.rotation.set(0, 0, 0.4);
                    }
                    
                    // Fade out after 2.5s
                    if (dt > 2.5 && e.mesh.visible) {
                        e.mesh.traverse(c => { if (c.material) c.material.opacity = Math.max(0, 1.0 - (dt - 2.5) / 1.0); });
                        if (dt > 3.5) e.mesh.visible = false;
                    }
                }
                continue;
            }

            // Distance culling & frustum optimization:
            const dx = playerPos.x - e.mesh.position.x;
            const dz = playerPos.z - e.mesh.position.z;
            const distSq = dx * dx + dz * dz;

            // 1. Far distance culling (>28m): completely freeze AI & hide mesh
            if (distSq > 28 * 28) {
                if (e.mesh.visible) e.mesh.visible = false;
                continue;
            }

            // 2. Frustum Culling: hide mesh if off-screen and not right next to player
            const isVisibleInFrustum = this._frustum.containsPoint(e.mesh.position);
            e.mesh.visible = isVisibleInFrustum || (distSq < 9 * 9);

            // 3. Off-screen AI throttle: update off-screen enemies only once every 5 frames
            if (!e.mesh.visible && distSq > 10 * 10) {
                e._aiThrottle = (e._aiThrottle || 0) + 1;
                if (e._aiThrottle % 5 !== 0) continue;
            }

            e.animTime += delta;
            if (!e.idleSeed) e.idleSeed = e.animTime * 1.37;

            // 2. Riposte Stun Recovery
            if (e.isRiposteable) {
                e.riposteTimer -= delta;
                if (u.torso) u.torso.rotation.x = -0.4;
                if (u.head) u.head.rotation.x = -0.3;
                if (e.riposteTimer <= 0) {
                    e.isRiposteable = false;
                    if (u.torso) u.torso.rotation.x = 0;
                    if (u.head) u.head.rotation.set(0, 0, 0);
                }
                continue;
            }

            // 3. Stagger / Flinch Recoil Animation on Weapon Hit (0.30s)
            if (e.isStaggered) {
                e.staggerTimer -= delta;
                const maxStagger = e.maxStaggerTimer || 0.30;
                const progress = Math.max(0, e.staggerTimer / maxStagger);
                const hitDir = e._hitDir || 0.25;

                if (u && u.torso) {
                    u.torso.rotation.x = -0.55 * progress;
                    u.torso.rotation.z = hitDir * progress;
                }
                if (u && u.head) {
                    u.head.rotation.x = -0.45 * progress;
                    u.head.rotation.y = hitDir * 1.2 * progress;
                }
                if (u && u.rightShoulder) {
                    u.rightShoulder.rotation.x = -0.85 * progress;
                    u.rightShoulder.rotation.z = 0.55 * progress;
                }
                if (u && u.leftShoulder) {
                    u.leftShoulder.rotation.x = -0.6 * progress;
                    u.leftShoulder.rotation.z = -0.6 * progress;
                }
                // Fallback for non-segmented models: tilt root mesh so stagger is 100% visible on every mob type
                if (e.mesh && (!u || !u.torso)) {
                    e.mesh.rotation.x = -0.35 * progress;
                }

                if (e.staggerTimer <= 0) {
                    e.isStaggered = false;
                    e.poise = e.maxPoise || 50; // Full poise reset on recovery
                    if (u && u.torso) u.torso.rotation.set(0, 0, 0);
                    if (u && u.head) u.head.rotation.set(0, 0, 0);
                    if (e.mesh && (!u || !u.torso)) e.mesh.rotation.x = 0;
                }
                continue;
            }

            // Mob poise natural regeneration over time
            if (e.poise !== undefined && e.maxPoise !== undefined && e.poise < e.maxPoise && !e.isStaggered) {
                e.poiseRegenTimer = (e.poiseRegenTimer || 0) - delta;
                if (e.poiseRegenTimer <= 0) {
                    e.poise = Math.min(e.maxPoise, e.poise + delta * 25.0);
                }
            }

            // Solid ground anchoring: enforce ground height every frame so no mob ever floats in mid-air
            if (this.world && this.world.getGroundHeight && e.mesh) {
                const targetG = this.world.getGroundHeight(e.mesh.position.x, e.mesh.position.z, e.mesh.position.y);
                if (e.mesh.position.y > targetG + 0.05) {
                    e.mesh.position.y = Math.max(targetG, e.mesh.position.y - delta * 12.0);
                } else if (e.mesh.position.y < targetG - 0.05) {
                    e.mesh.position.y = targetG;
                }
            }

            // Continuously tick down mob cooldown every frame so attacks trigger promptly when in range
            e.cooldown = Math.max(0, (e.cooldown || 0) - delta);

            this._scratchMobVec.subVectors(playerPos, e.mesh.position);
            const dist = this._scratchMobVec.length();
            const heightDiff = Math.abs(playerPos.y - e.mesh.position.y);
            const reach = e.attackReach || 2.0;

            // Mob Matrix Behavior Configuration
            const behavior = e.behaviorType || 'Swarm';
            let windupEnd = 0.26;
            let strikeEnd = 0.44;
            let totalDur = 0.72;
            let aggroRange = 15;
            let speedMult = 1.05;
            let preferredDist = reach;

            if (behavior === 'Heavy Tank') {
                windupEnd = 0.65;
                strikeEnd = 0.92;
                totalDur = 1.65;
                aggroRange = 16;
                speedMult = 0.78;
                preferredDist = reach + 0.3;
            } else if (behavior === 'Flanker') {
                windupEnd = 0.28;
                strikeEnd = 0.48;
                totalDur = 0.78;
                aggroRange = 18;
                speedMult = 1.25;
                preferredDist = reach;
            } else if (behavior === 'Ranged' || e.isArcher) {
                // Aggressive Rapid-Fire Volley Timings: 0.30s draw, 0.42s release snap, 0.52s total cycle
                windupEnd = 0.30;
                strikeEnd = 0.42;
                totalDur = 0.52;
                aggroRange = 40;
                speedMult = 0.90;
                preferredDist = 16.0;
            } else if (behavior === 'Caster') {
                windupEnd = 0.75;
                strikeEnd = 0.95;
                totalDur = 1.45;
                aggroRange = 20;
                speedMult = 0.90;
                preferredDist = 7.0;
            }

            // 4. Attack Animation (Telegraphed Windup, Strike Impact & Recovery Phases)
            if (e.isAttacking) {
                e.attackTime += delta;

                if (e.attackTime < windupEnd) {
                    // Phase 1: High Windup & Coiling Torso (Telegraph window)
                    e.state = 'WINDUP';
                    e.attackPhase = 'WINDUP';
                    const t = e.attackTime / windupEnd;

                    if (behavior === 'Heavy Tank') {
                        // Crushing 2-handed raise
                        if (u.torso) { u.torso.rotation.x = -0.35 * t; u.torso.rotation.y = -0.3 * t; }
                        if (u.rightShoulder) { u.rightShoulder.rotation.x = -2.6 * t; u.rightShoulder.rotation.z = 0.6 * t; }
                        if (u.leftShoulder) { u.leftShoulder.rotation.x = -2.2 * t; u.leftShoulder.rotation.z = -0.5 * t; }
                    } else if (behavior === 'Caster') {
                        // Catalyst channeling glow & staff elevation
                        if (u.torso) { u.torso.rotation.x = -0.2 * t; }
                        if (u.rightShoulder) { u.rightShoulder.rotation.x = -1.8 * t; u.rightShoulder.rotation.z = 0.8 * t; }
                        if (u.leftShoulder) { u.leftShoulder.rotation.x = -1.5 * t; u.leftShoulder.rotation.z = -0.8 * t; }
                    } else if (behavior === 'Ranged' || e.isArcher) {
                        // Drawing bowstring / sighting line
                        if (u.torso) { u.torso.rotation.y = 0.65 * t; u.torso.rotation.x = -0.08 * t; }
                        if (u.leftShoulder) { 
                            u.leftShoulder.rotation.x = -1.55; 
                            u.leftShoulder.rotation.y = 0.15; 
                            u.leftShoulder.rotation.z = -0.05; 
                        }
                        if (u.rightShoulder) { 
                            u.rightShoulder.rotation.x = -1.50 * t; 
                            u.rightShoulder.rotation.y = -0.45 * t; 
                            u.rightShoulder.rotation.z = 0.35 * t; 
                        }
                        if (u.bowString) { u.bowString.position.z = -0.22 * t; }
                        if (u.notchedArrow) { u.notchedArrow.position.z = 0.02 - 0.26 * t; }
                        if (u.rightHip && u.leftHip) {
                            u.rightHip.rotation.x = -0.25;
                            u.leftHip.rotation.x = 0.25;
                        }
                    } else {
                        // Flanker / Swarm / default — 10 attack variant animations (#7-16)
                        if (!e._attackVariant) e._attackVariant = Math.floor(Math.random() * 10);
                        const av = e._attackVariant;
                        if (av === 0) {
                            // Variant #7: Classic overhead slash windup
                            if (u.torso) { u.torso.rotation.y = -0.65 * t; u.torso.rotation.x = -0.22 * t; }
                            if (u.rightShoulder) { u.rightShoulder.rotation.x = -2.1 * t; u.rightShoulder.rotation.z = 0.45 * t; }
                            if (u.leftShoulder) { u.leftShoulder.rotation.x = 0.35 * t; u.leftShoulder.rotation.z = -0.35 * t; }
                        } else if (av === 1) {
                            // Variant #8: Lateral sweeping cleave (wide arc from right)
                            if (u.torso) { u.torso.rotation.y = 0.75 * t; u.torso.rotation.x = -0.15 * t; }
                            if (u.rightShoulder) { u.rightShoulder.rotation.x = -0.8 * t; u.rightShoulder.rotation.y = -1.6 * t; u.rightShoulder.rotation.z = 0.6 * t; }
                            if (u.leftShoulder) { u.leftShoulder.rotation.z = -0.45 * t; }
                        } else if (av === 2) {
                            // Variant #9: Low thrust / spear jab
                            if (u.torso) { u.torso.rotation.x = 0.35 * t; u.torso.rotation.y = -0.2 * t; }
                            if (u.rightShoulder) { u.rightShoulder.rotation.x = 1.4 * t; u.rightShoulder.rotation.z = -0.15 * t; }
                            if (u.leftShoulder) { u.leftShoulder.rotation.x = 0.6 * t; }
                        } else if (av === 3) {
                            // Variant #10: Spin attack windup (full body rotation)
                            if (u.torso) { u.torso.rotation.y = -1.2 * t; u.torso.rotation.x = -0.1 * t; }
                            if (u.rightShoulder) { u.rightShoulder.rotation.x = -1.8 * t; u.rightShoulder.rotation.y = -0.9 * t; }
                            if (u.leftShoulder) { u.leftShoulder.rotation.x = -0.6 * t; u.leftShoulder.rotation.y = 0.5 * t; }
                        } else if (av === 4) {
                            // Variant #11: Uppercut rising slash
                            if (u.torso) { u.torso.rotation.x = 0.4 * t; }
                            if (u.rightShoulder) { u.rightShoulder.rotation.x = 0.8 * t; u.rightShoulder.rotation.z = 0.9 * t; }
                            if (u.leftShoulder) { u.leftShoulder.rotation.x = -0.3 * t; }
                        } else if (av === 5) {
                            // Variant #12: Shield bash / headbutt lunge
                            if (u.torso) { u.torso.rotation.x = 0.5 * t; u.torso.rotation.y = 0.2 * t; }
                            if (u.leftShoulder) { u.leftShoulder.rotation.x = -1.4 * t; u.leftShoulder.rotation.z = -0.8 * t; }
                            if (u.rightShoulder) { u.rightShoulder.rotation.x = -0.5 * t; }
                            if (u.head) { u.head.rotation.x = 0.4 * t; }
                        } else if (av === 6) {
                            // Variant #13: Double-hand overhead smash
                            if (u.torso) { u.torso.rotation.x = -0.3 * t; }
                            if (u.rightShoulder) { u.rightShoulder.rotation.x = -2.4 * t; u.rightShoulder.rotation.z = 0.3 * t; }
                            if (u.leftShoulder) { u.leftShoulder.rotation.x = -2.2 * t; u.leftShoulder.rotation.z = -0.3 * t; }
                        } else if (av === 7) {
                            // Variant #14: Backhand cross-body slash
                            if (u.torso) { u.torso.rotation.y = 0.9 * t; u.torso.rotation.x = -0.12 * t; }
                            if (u.rightShoulder) { u.rightShoulder.rotation.x = -1.5 * t; u.rightShoulder.rotation.y = 0.8 * t; }
                            if (u.leftShoulder) { u.leftShoulder.rotation.z = 0.5 * t; }
                        } else if (av === 8) {
                            // Variant #15: Leaping downward chop
                            if (u.torso) { u.torso.rotation.x = -0.5 * t; }
                            if (u.rightShoulder) { u.rightShoulder.rotation.x = -2.8 * t; }
                            if (u.leftShoulder) { u.leftShoulder.rotation.x = -1.0 * t; }
                            if (u.rightHip) { u.rightHip.rotation.x = -0.6 * t; }
                        } else {
                            // Variant #16: Grapple lunge (both arms reach forward)
                            if (u.torso) { u.torso.rotation.x = 0.3 * t; u.torso.rotation.y = -0.15 * t; }
                            if (u.rightShoulder) { u.rightShoulder.rotation.x = 1.6 * t; u.rightShoulder.rotation.z = -0.4 * t; }
                            if (u.leftShoulder) { u.leftShoulder.rotation.x = 1.6 * t; u.leftShoulder.rotation.z = 0.4 * t; }
                            if (u.head) { u.head.rotation.x = 0.3 * t; }
                        }
                        if (u.head && av < 5) { u.head.rotation.x = 0.15 * t; u.head.rotation.y = 0.25 * t; }
                    }
                    if (u.rightHip && u.leftHip) {
                        u.rightHip.rotation.x = -0.3 * t;
                        u.leftHip.rotation.x = 0.3 * t;
                    }
                } else if (e.attackTime < strikeEnd) {
                    // Phase 2: Explosive Forward Slash & Cleave (Damage frame)
                    e.state = 'STRIKE';
                    e.attackPhase = 'STRIKE';
                    const t = (e.attackTime - windupEnd) / (strikeEnd - windupEnd);

                    if (behavior === 'Heavy Tank') {
                        // Crushing 2-handed slam
                        if (u.torso) { u.torso.rotation.x = -0.35 + 0.95 * t; u.torso.rotation.y = -0.3 + 0.4 * t; }
                        if (u.rightShoulder) { u.rightShoulder.rotation.x = -2.6 + 4.2 * t; u.rightShoulder.rotation.z = 0.6 - 0.9 * t; }
                        if (u.leftShoulder) { u.leftShoulder.rotation.x = -2.2 + 3.8 * t; u.leftShoulder.rotation.z = -0.5 + 0.7 * t; }
                    } else if (behavior === 'Caster') {
                        // Cast blast
                        if (u.torso) { u.torso.rotation.x = -0.2 + 0.45 * t; }
                        if (u.rightShoulder) { u.rightShoulder.rotation.x = -1.8 + 2.5 * t; }
                        if (u.leftShoulder) { u.leftShoulder.rotation.x = -1.5 + 2.0 * t; }
                    } else if (behavior === 'Ranged' || e.isArcher) {
                        // Release shot & bowstring recoil
                        if (u.torso) { u.torso.rotation.y = 0.65 - 0.15 * t; }
                        if (u.rightShoulder) { u.rightShoulder.rotation.x = -1.50 + 0.25 * t; }
                        if (u.bowString) { u.bowString.position.z = 0.02; }
                        if (u.notchedArrow) { u.notchedArrow.position.z = 0.02; }
                    } else {
                        // Flanker / Swarm — variant strike animations (#7-16)
                        const av = e._attackVariant || 0;
                        if (av === 1) {
                            // Lateral sweeping cleave follow-through
                            if (u.torso) { u.torso.rotation.y = 0.75 - 1.8 * t; u.torso.rotation.x = 0.3 * t; }
                            if (u.rightShoulder) { u.rightShoulder.rotation.y = -1.6 + 2.4 * t; u.rightShoulder.rotation.x = -0.8 + 1.6 * t; }
                        } else if (av === 2) {
                            // Thrust strike
                            if (u.torso) { u.torso.rotation.x = 0.35 - 0.1 * t; }
                            if (u.rightShoulder) { u.rightShoulder.rotation.x = 1.4 + 0.3 * t; }
                        } else if (av === 3) {
                            // Spin attack release
                            if (u.torso) { u.torso.rotation.y = -1.2 + 2.8 * t; }
                            if (u.rightShoulder) { u.rightShoulder.rotation.x = -1.8 + 3.2 * t; u.rightShoulder.rotation.y = -0.9 + 1.8 * t; }
                        } else if (av === 4) {
                            // Uppercut rising release
                            if (u.rightShoulder) { u.rightShoulder.rotation.x = 0.8 - 2.0 * t; u.rightShoulder.rotation.z = 0.9 - 0.6 * t; }
                        } else if (av === 5) {
                            // Shield bash / headbutt follow-through
                            if (u.torso) { u.torso.rotation.x = 0.5 - 0.3 * t; }
                            if (u.leftShoulder) { u.leftShoulder.rotation.x = -1.4 + 2.0 * t; }
                            if (u.head) { u.head.rotation.x = 0.4 - 0.6 * t; }
                        } else if (av >= 6 && av <= 8) {
                            // Smash / chop / backhand follow-through
                            if (u.torso) { u.torso.rotation.x = -0.3 + 0.8 * t; u.torso.rotation.y = (av === 7 ? (0.9 - 1.5 * t) : 0); }
                            if (u.rightShoulder) { u.rightShoulder.rotation.x = -(av === 8 ? 2.8 : 2.4) + 4.0 * t; }
                            if (u.leftShoulder) { u.leftShoulder.rotation.x = -(av === 6 ? 2.2 : 1.0) + 3.0 * t; }
                        } else if (av === 9) {
                            // Grapple lunge thrust
                            if (u.rightShoulder) { u.rightShoulder.rotation.x = 1.6 + 0.5 * t; }
                            if (u.leftShoulder) { u.leftShoulder.rotation.x = 1.6 + 0.5 * t; }
                            if (u.torso) { u.torso.rotation.x = 0.3 + 0.2 * t; }
                        } else {
                            if (u.torso) { u.torso.rotation.y = -0.65 + 1.25 * t; u.torso.rotation.x = -0.22 + 0.65 * t; }
                        }
                        if (u.head && av !== 5) { u.head.rotation.x = 0.15 - 0.35 * t; u.head.rotation.y = 0.25 - 0.45 * t; }
                        if (u.rightShoulder) { u.rightShoulder.rotation.x = -2.1 + 3.45 * t; u.rightShoulder.rotation.z = 0.45 - 0.75 * t; }
                        if (u.leftShoulder) { u.leftShoulder.rotation.x = 0.35 - 0.7 * t; }
                    }

                    // Strike Impact Frame
                    const triggerT = (behavior === 'Ranged' || e.isArcher) ? 0.20 : 0.35;
                    if (!e._damageDelivered && t >= triggerT) {
                        e._damageDelivered = true;
                        if (behavior === 'Ranged' || e.isArcher) {
                            if (e.isRuneArcher && this.audio && this.audio.playMagicArrowRelease) {
                                this.audio.playMagicArrowRelease();
                            } else if (this.audio && this.audio.playArrowRelease) {
                                this.audio.playArrowRelease();
                            }
                            const arrowSpawn = e.mesh.position.clone();
                            arrowSpawn.y += 1.35; // Shoulder & bow height
                            this.spawnArrow(arrowSpawn, playerPos, e);
                        } else {
                            this.audio.playSwing(behavior === 'Heavy Tank');
                            const playerDist = this.game.playerMesh.position.distanceTo(e.mesh.position);
                            const effectiveReach = (behavior === 'Caster') ? preferredDist + 2.0 : (reach + (behavior === 'Heavy Tank' ? 1.1 : 0.7));

                            if (playerDist < effectiveReach && !this.isRolling && !this.isInvincible) {
                                const dmg = (this.qaOneHpDamage || (window.qaSuite && window.qaSuite.qaOneHpDamageActive)) ? 1 : (e.damage || 35);
                                this.damagePlayer(dmg, e.mesh.position);
                                if (this.world && this.world.spawnHitSparks) {
                                    this.world.spawnHitSparks(this.game.playerMesh.position, false);
                                }
                                if (behavior === 'Heavy Tank' && this.game.shakeCamera) {
                                    this.game.shakeCamera(0.3, 0.25);
                                }
                            }
                        }
                    }
                } else if (e.attackTime < totalDur) {
                    // Phase 3: Follow-through and recovery (Vulnerable counterattack window)
                    e.state = 'RECOVERY';
                    e.attackPhase = 'RECOVERY';
                    const t = (e.attackTime - strikeEnd) / (totalDur - strikeEnd);
                    const inv = 1 - t;
                    if (u.torso) {
                        u.torso.rotation.y = 0.6 * inv;
                        u.torso.rotation.x = 0.43 * inv;
                    }
                    if (u.rightShoulder) {
                        u.rightShoulder.rotation.x = THREE.MathUtils.lerp(1.35, -0.35, t);
                        u.rightShoulder.rotation.z = THREE.MathUtils.lerp(-0.3, 0.2, t);
                    }
                    if (u.leftShoulder) {
                        u.leftShoulder.rotation.x = THREE.MathUtils.lerp(-0.35, -0.15, t);
                    }
                } else {
                    if (behavior === 'Ranged' || e.isArcher) {
                        e._burstCount = (e._burstCount || 0) + 1;
                        if (e._burstCount < (e._burstTotal || 1)) {
                            // Aggressive Rapid-Fire Volley: Immediately trigger next shot in 3-4 burst!
                            e.attackTime = 0;
                            e._damageDelivered = false;
                            e.state = 'WINDUP';
                            e.attackPhase = 'WINDUP';
                            const toTarget = new THREE.Vector3().subVectors(playerPos, e.mesh.position);
                            e.mesh.rotation.y = Math.atan2(toTarget.x, toTarget.z);
                            if (e.isRuneArcher && this.audio && this.audio.playMagicBowDraw) {
                                this.audio.playMagicBowDraw();
                            } else if (this.audio && this.audio.playBowDraw) {
                                this.audio.playBowDraw();
                            }
                            continue;
                        }
                    } else if (behavior !== 'Boss' && behavior !== 'Caster') {
                        // Melee Mobs: Guaranteed 3-4 consecutive attacks in a row combo chain!
                        e._comboCount = (e._comboCount || 0) + 1;
                        if (e._comboCount < (e._comboTotal || 1)) {
                            e.attackTime = 0;
                            e._damageDelivered = false;
                            e._attackVariant = ((e._attackVariant || 0) + 1) % 10;
                            e.state = 'WINDUP';
                            e.attackPhase = 'WINDUP';
                            const toTarget = new THREE.Vector3().subVectors(playerPos, e.mesh.position);
                            e.mesh.rotation.y = Math.atan2(toTarget.x, toTarget.z);
                            continue;
                        }
                    }
                    e.isAttacking = false;
                    e._damageDelivered = false;
                    e._burstCount = 0;
                    e._burstTotal = 0;
                    e._comboCount = 0;
                    e._comboTotal = 0;
                    e.attackPhase = 'IDLE';
                    e.state = 'CHASE';
                    const baseCd = (behavior === 'Ranged' || e.isArcher) ? (1.0 + Math.random() * 0.3) : (behavior === 'Heavy Tank' ? 1.8 : (behavior === 'Flanker' ? 0.8 : 1.1));
                    e.cooldown = baseCd + Math.random() * 0.3;
                }
                continue;
            }

            // 5. Aggro & Locomotion Logic (Mob Matrix 5 Archetypes)
            if (dist < aggroRange && (heightDiff < 7.5 || dist < 8.0 || behavior === 'Ranged' || e.isArcher || behavior === 'Caster')) {
                // Line of Sight: Aggro drops if blocked by walls for >4s
                const hasLoS = this.checkLineOfSight(e.mesh.position, playerPos);
                if (!hasLoS && dist >= 7.0) {
                    e.losBlockedTimer = (e.losBlockedTimer || 0) + delta;
                    if (e.losBlockedTimer > 4.0) {
                        e.state = 'PATROL';
                        e.attackPhase = 'IDLE';
                        e.isAttacking = false;
                        e.losBlockedTimer = 0;
                        continue;
                    }
                } else {
                    e.losBlockedTimer = 0;
                }

                // Anti-Stuck: Intelligent lateral steering around obstacles / allies (NO TELEPORTATION)
                if (!e._lastChasePos) e._lastChasePos = e.mesh.position.clone();
                const chaseDisp = e.mesh.position.distanceTo(e._lastChasePos);
                if (chaseDisp < 0.08) {
                    e._stuckChaseTimer = (e._stuckChaseTimer || 0) + delta;
                    if (e._stuckChaseTimer >= 1.2) {
                        // Dynamically steer laterally around the obstruction with a random flank offset
                        e._groupFlankOffset = (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.6);
                        e._stuckChaseTimer = 0;
                        e._lastChasePos.copy(e.mesh.position);
                    }
                } else {
                    e._stuckChaseTimer = 0;
                    e._lastChasePos.copy(e.mesh.position);
                }

                e.state = 'CHASE';
                e.attackPhase = 'IDLE';

                let targetAngle = Math.atan2(this._scratchMobVec.x, this._scratchMobVec.z);

                // Group coordination angle or individual flanker
                if (e._groupFlankOffset) {
                    targetAngle += e._groupFlankOffset;
                } else if (behavior === 'Flanker') {
                    const flankOffset = (e.flankDir || 1) * 0.78;
                    targetAngle += flankOffset;
                }

                e.mesh.rotation.y = targetAngle;

                let shouldAdvance = false;
                let shouldRetreat = false;

                if (behavior === 'Ranged' || behavior === 'Caster') {
                    if (dist < 4.5 && dist > 1.8) {
                        shouldRetreat = true;
                    } else if (dist > preferredDist + 1.5) {
                        shouldAdvance = true;
                    }
                } else {
                    // Close distance aggressively to enter weapon reach
                    if (dist > Math.max(1.2, reach * 0.75)) {
                        shouldAdvance = true;
                    }
                }

                if (shouldAdvance) {
                    if (dist > (e.radius || 0.65) + 0.35) {
                        const moveSpeed = (e.speed || 2.4) * speedMult;
                        e.mesh.position.x += Math.sin(targetAngle) * moveSpeed * delta;
                        e.mesh.position.z += Math.cos(targetAngle) * moveSpeed * delta;
                    }
                    e.mesh.position.y = this.world.getGroundHeight(e.mesh.position.x, e.mesh.position.z, e.mesh.position.y);
                } else if (shouldRetreat) {
                    const moveSpeed = (e.speed || 2.4) * 0.85;
                    e.mesh.position.x -= Math.sin(targetAngle) * moveSpeed * delta;
                    e.mesh.position.z -= Math.cos(targetAngle) * moveSpeed * delta;
                    e.mesh.position.y = this.world.getGroundHeight(e.mesh.position.x, e.mesh.position.z, e.mesh.position.y);
                }

                // Pairwise Mob-to-Mob repulsion during active chase (prevents crowding inside each other)
                for (let j = i + 1; j < this.enemies.length; j++) {
                    const other = this.enemies[j];
                    if (!other.mesh || !other.mesh.visible || other.isDead) continue;
                    const sepDx = e.mesh.position.x - other.mesh.position.x;
                    const sepDz = e.mesh.position.z - other.mesh.position.z;
                    const sepDistSq = sepDx * sepDx + sepDz * sepDz;
                    const minSep = (e.radius || 0.65) + (other.radius || 0.65) + 0.1;
                    if (sepDistSq < minSep * minSep && sepDistSq > 0.0001) {
                        const sepDist = Math.sqrt(sepDistSq);
                        const push = (minSep - sepDist) * 0.5;
                        const pushX = (sepDx / sepDist) * push;
                        const pushZ = (sepDz / sepDist) * push;
                        e.mesh.position.x += pushX;
                        e.mesh.position.z += pushZ;
                        other.mesh.position.x -= pushX;
                        other.mesh.position.z -= pushZ;
                    }
                }

                // If in attack range, trigger attack when cooldown expires
                const attackReachThreshold = Math.max(2.65, (reach || 2.0) + 0.75);
                const canAttack = (behavior === 'Ranged' || behavior === 'Caster' || e.isArcher) ? 
                    (dist <= aggroRange) : 
                    (dist <= attackReachThreshold && activeMeleeStrikes < 6);
                if (canAttack) {
                    if ((e.cooldown || 0) <= 0 && !e.isAttacking) {
                        e.isAttacking = true;
                        e.attackTime = 0;
                        e._damageDelivered = false;
                        e.state = 'WINDUP';
                        e.attackPhase = 'WINDUP';
                        if (behavior === 'Ranged' || e.isArcher) {
                            e._burstTotal = Math.floor(Math.random() * 2) + 3; // Guaranteed 3 or 4 attacks in a row!
                            e._burstCount = 0;
                            if (e.isRuneArcher && this.audio && this.audio.playMagicBowDraw) {
                                this.audio.playMagicBowDraw();
                            } else if (this.audio && this.audio.playBowDraw) {
                                this.audio.playBowDraw();
                            }
                        } else {
                            // Melee mobs: Guaranteed 3 or 4 combo attacks in a row!
                            e._comboTotal = Math.floor(Math.random() * 2) + 3;
                            e._comboCount = 0;
                        }
                    }
                }

                if (behavior === 'Ranged' || e.isArcher) {
                    // Disciplined Bladed Archery Stance during chase / sighting
                    if (u.leftShoulder) { 
                        u.leftShoulder.rotation.x = -1.45; 
                        u.leftShoulder.rotation.y = 0.15; 
                        u.leftShoulder.rotation.z = -0.05; 
                    }
                    if (u.rightShoulder) { 
                        u.rightShoulder.rotation.x = -0.75; 
                        u.rightShoulder.rotation.y = -0.30; 
                        u.rightShoulder.rotation.z = 0.20; 
                    }
                    if (u.torso) { 
                        u.torso.rotation.y = 0.50; 
                        u.torso.rotation.x = 0.05; 
                    }
                    if (u.head) { 
                        u.head.rotation.y = -0.45; 
                        u.head.rotation.x = 0; 
                    }
                    if (u.rightHip && u.leftHip) {
                        const stride = e.animTime * 6.5;
                        u.rightHip.rotation.x = Math.sin(stride) * 0.45;
                        u.leftHip.rotation.x = -Math.sin(stride) * 0.45;
                    }
                    if (u.bowString) { u.bowString.position.z = 0.02; }
                    if (u.notchedArrow) { u.notchedArrow.position.z = 0.02; }
                } else {
                    // Shambling / locomotion animation kinetics
                    const freq = behavior === 'Heavy Tank' ? 4.8 : (behavior === 'Flanker' ? 9.5 : 7.2);
                    const stride = e.animTime * freq;
                    if (u.rightHip && u.leftHip) {
                        u.rightHip.rotation.x = Math.sin(stride) * 0.68;
                        u.leftHip.rotation.x = -Math.sin(stride) * 0.68;
                        u.rightHip.rotation.z = Math.sin(stride) * 0.06;
                        u.leftHip.rotation.z = -Math.sin(stride) * 0.06;
                    }
                    if (u.torso) {
                        u.torso.rotation.x = behavior === 'Heavy Tank' ? 0.35 : 0.25;
                        u.torso.rotation.z = Math.sin(stride) * 0.09;
                        u.torso.position.y = Math.abs(Math.sin(stride)) * 0.08;
                    }
                    if (u.leftShoulder) {
                        u.leftShoulder.rotation.x = Math.sin(stride) * 0.45;
                        u.leftShoulder.rotation.z = -0.25;
                    }
                    if (u.rightShoulder) {
                        u.rightShoulder.rotation.x = -0.38 + Math.cos(stride) * 0.25;
                        u.rightShoulder.rotation.z = 0.25;
                    }
                    if (u.head) {
                        u.head.rotation.x = 0.12 + Math.sin(stride * 2) * 0.06;
                        u.head.rotation.y = Math.sin(e.animTime * 2.2) * 0.12;
                    }
                }

                // Serpentine undulating slither kinetics
                if (u.isSerpent && u.segments) {
                    u.segments.forEach((seg, sIdx) => {
                        seg.position.x = Math.sin(e.animTime * 8.0 + sIdx * 0.75) * (0.22 + sIdx * 0.025);
                        seg.rotation.y = Math.cos(e.animTime * 8.0 + sIdx * 0.75) * 0.25;
                    });
                    if (u.tongue) {
                        u.tongue.scale.z = 1.0 + Math.sin(e.animTime * 14) * 0.45;
                    }
                } else if (u.isGorgon && u.tailSegments) {
                    const waveTime = e.animTime * 8.5;
                    u.tailSegments.forEach((seg, sIdx) => {
                        const base = (seg.userData && seg.userData.baseX) || 0;
                        const baseRot = (seg.userData && seg.userData.baseRotY) || 0;
                        seg.position.x = base + Math.sin(waveTime - sIdx * 0.55) * 0.32 * (1.0 + sIdx * 0.10);
                        seg.rotation.y = baseRot + Math.cos(waveTime - sIdx * 0.55) * 0.28;
                    });
                    if (u.snakeHair) {
                        u.snakeHair.forEach((sn, snIdx) => {
                            const bX = (sn.userData && sn.userData.baseRotX) || 0;
                            const bZ = (sn.userData && sn.userData.baseRotZ) || 0;
                            sn.rotation.x = bX + Math.sin(e.animTime * 6.5 + snIdx * 0.75) * 0.22;
                            sn.rotation.z = bZ + Math.cos(e.animTime * 7.2 + snIdx * 0.85) * 0.18;
                        });
                    }
                    if (u.tongue) {
                        u.tongue.scale.z = 1.0 + Math.sin(e.animTime * 15.0) * 0.55;
                    }
                }
            } else {
                // 6. Idle / Patrol Breathing & Scanning Animation — 6 Fidget Variants (#17-22)
                e.state = 'PATROL';
                e.attackPhase = 'IDLE';
                const breath = Math.sin(e.animTime * 2.2 + e.idleSeed);

                if (behavior === 'Ranged' || e.isArcher) {
                    // Disciplined Sentry Watchtower Idle: Bow held vertically at left side, watchful horizon scan
                    if (u.leftShoulder) { u.leftShoulder.rotation.x = -0.15; u.leftShoulder.rotation.y = 0.0; u.leftShoulder.rotation.z = -0.12; }
                    if (u.rightShoulder) { u.rightShoulder.rotation.x = -0.10; u.rightShoulder.rotation.y = 0.0; u.rightShoulder.rotation.z = 0.12; }
                    if (u.torso) { u.torso.rotation.y = 0.0; u.torso.rotation.x = Math.sin(e.animTime * 1.5) * 0.03; u.torso.position.y = breath * 0.02; }
                    if (u.head) { u.head.rotation.y = Math.sin(e.animTime * 0.8) * 0.25; u.head.rotation.x = 0; }
                    if (u.rightHip) u.rightHip.rotation.x = 0;
                    if (u.leftHip) u.leftHip.rotation.x = 0;
                    if (u.bowString) { u.bowString.position.z = 0.02; }
                    if (u.notchedArrow) { u.notchedArrow.position.z = 0.02; }
                } else {
                    if (!e._idleVariant) e._idleVariant = Math.floor(Math.random() * 6);
                    const iv = e._idleVariant;
                    
                    if (iv === 1) {
                        // Idle #18: Head scratch / neck rub
                        if (u.torso) { u.torso.position.y = breath * 0.03; u.torso.rotation.x = 0.1; u.torso.rotation.z = 0; }
                        if (u.head) { u.head.rotation.y = Math.sin(e.animTime * 1.2) * 0.15; u.head.rotation.x = -0.15 + Math.sin(e.animTime * 3.0) * 0.08; }
                        if (u.rightShoulder) { u.rightShoulder.rotation.x = -1.2 + Math.sin(e.animTime * 2.5) * 0.15; u.rightShoulder.rotation.z = 0.5; }
                    } else if (iv === 2) {
                        // Idle #19: Weight shifting (swaying side to side)
                        if (u.torso) { u.torso.position.y = breath * 0.04; u.torso.rotation.z = Math.sin(e.animTime * 1.5) * 0.12; u.torso.rotation.x = 0.08; }
                        if (u.rightHip) u.rightHip.rotation.z = Math.sin(e.animTime * 1.5) * 0.08;
                        if (u.leftHip) u.leftHip.rotation.z = -Math.sin(e.animTime * 1.5) * 0.08;
                        if (u.head) { u.head.rotation.y = Math.sin(e.animTime * 0.7) * 0.25; u.head.rotation.x = 0.05; }
                    } else if (iv === 3) {
                        // Idle #20: Aggressive posturing (taunting forward lean)
                        if (u.torso) { u.torso.position.y = breath * 0.025; u.torso.rotation.x = 0.25 + Math.sin(e.animTime * 3.0) * 0.08; u.torso.rotation.z = 0; }
                        if (u.head) { u.head.rotation.x = 0.2; u.head.rotation.y = Math.sin(e.animTime * 2.5 + e.idleSeed) * 0.4; }
                        if (u.rightShoulder) { u.rightShoulder.rotation.x = -0.6 + Math.sin(e.animTime * 1.8) * 0.15; u.rightShoulder.rotation.z = 0.3; }
                    } else if (iv === 4) {
                        // Idle #21: Weapon check / arm flex
                        const flex = Math.sin(e.animTime * 1.0 + e.idleSeed);
                        if (u.torso) { u.torso.position.y = breath * 0.03; u.torso.rotation.x = 0.08; u.torso.rotation.z = 0; }
                        if (u.rightShoulder) { u.rightShoulder.rotation.x = -0.5 + flex * 0.4; u.rightShoulder.rotation.z = 0.2 + Math.abs(flex) * 0.3; }
                        if (u.head) { u.head.rotation.y = flex * 0.2; u.head.rotation.x = -0.1 + Math.abs(flex) * 0.1; }
                    } else if (iv === 5) {
                        // Idle #22: Nervous trembling (scared low-tier mob)
                        const tremble = Math.sin(e.animTime * 18 + e.idleSeed) * 0.03;
                        if (u.torso) { u.torso.position.y = breath * 0.02; u.torso.rotation.x = 0.15 + tremble; u.torso.rotation.z = tremble * 2; }
                        if (u.head) { u.head.rotation.y = Math.sin(e.animTime * 1.0) * 0.4 + tremble; u.head.rotation.x = 0.1 + tremble; }
                        if (u.rightShoulder) { u.rightShoulder.rotation.x = -0.15 + tremble * 3; u.rightShoulder.rotation.z = 0.12 + tremble; }
                        if (u.leftShoulder) { u.leftShoulder.rotation.x = -0.1 + tremble * 3; u.leftShoulder.rotation.z = -0.12 - tremble; }
                    } else {
                        // Idle #17: Default breathing (original)
                        if (u.torso) { u.torso.position.y = breath * 0.035; u.torso.rotation.x = 0.12 + breath * 0.04; u.torso.rotation.z = 0; }
                        if (u.head) { u.head.rotation.y = Math.sin(e.animTime * 0.85 + e.idleSeed) * 0.32; u.head.rotation.x = 0.08 + Math.cos(e.animTime * 1.6) * 0.05; }
                    }
                    
                    if (iv === 0 || iv >= 3) {
                        if (u.rightShoulder && iv !== 3 && iv !== 4 && iv !== 5) {
                            u.rightShoulder.rotation.x = -0.28 + breath * 0.05;
                            u.rightShoulder.rotation.z = 0.18;
                        }
                    }
                    if (u.leftShoulder && iv !== 1 && iv !== 5) {
                        u.leftShoulder.rotation.x = -0.16 - breath * 0.04;
                        u.leftShoulder.rotation.z = -0.22;
                    }
                    if (u.rightHip) u.rightHip.rotation.x = 0;
                    if (u.leftHip) u.leftHip.rotation.x = 0;
                }

                // Idle Serpentine Breathing & Coiling kinetics
                if (u.isSerpent && u.segments) {
                    u.segments.forEach((seg, sIdx) => {
                        const idleWave = Math.sin(e.animTime * 1.8 + sIdx * 0.65 + e.idleSeed);
                        seg.position.x = Math.sin(sIdx * 0.72) * 0.35 + idleWave * 0.08;
                        seg.rotation.y = Math.cos(sIdx * 0.72) * 0.30 + idleWave * 0.06;
                    });
                    if (u.tongue) {
                        u.tongue.scale.z = 1.0 + Math.sin(e.animTime * 5.0) * 0.3;
                    }
                } else if (u.isGorgon && u.tailSegments) {
                    const idleTime = e.animTime * 2.2 + (e.idleSeed || 0);
                    u.tailSegments.forEach((seg, sIdx) => {
                        const base = (seg.userData && seg.userData.baseX) || 0;
                        const baseRot = (seg.userData && seg.userData.baseRotY) || 0;
                        seg.position.x = base + Math.sin(idleTime - sIdx * 0.45) * 0.12 * (1.0 + sIdx * 0.08);
                        seg.rotation.y = baseRot + Math.cos(idleTime - sIdx * 0.45) * 0.09;
                    });
                    if (u.snakeHair) {
                        u.snakeHair.forEach((sn, snIdx) => {
                            const bX = (sn.userData && sn.userData.baseRotX) || 0;
                            const bZ = (sn.userData && sn.userData.baseRotZ) || 0;
                            sn.rotation.x = bX + Math.sin(idleTime * 1.8 + snIdx * 0.8) * 0.12;
                            sn.rotation.z = bZ + Math.cos(idleTime * 2.1 + snIdx * 0.6) * 0.10;
                        });
                    }
                    if (u.tongue) {
                        u.tongue.scale.z = 1.0 + Math.sin(e.animTime * 6.0) * 0.35;
                    }
                }
            }
        }
    }

    updateBossAI(delta) {
        if (!this.boss || this.boss.isDead) return;

        const playerPos = this.game.playerMesh.position;
        this._scratchToPlayer.subVectors(playerPos, this.boss.mesh.position);
        const dist = this._scratchToPlayer.length();

        // Check if player entered Boss Arena (z > 98) or proximity aggro / damaged
        const inArena = playerPos.z > 275;
        const inProximity = dist < 24.0;
        const isDamaged = this.boss.hp < this.boss.maxHp;
        if ((inArena || inProximity || isDamaged) && this.boss.state === 'IDLE') {
            this.boss.state = 'CHASE';
            const id = this.boss.id;
            if (id === 'taurus' || id === 'asylum' || id === 'capra' || id === 'gaping' || id === 'manus') this.audio.playBossRoar();
            else if (id === 'gargoyle' || id === 'butterfly' || id === 'ornstein') { this.audio.playBellToll(); this.audio.playBossRoar(); }
            else if (id === 'sif') this.audio.playWolfHowl();
            else if (id === 'gwyn' || id === 'quelaag' || id === 'kalameet') this.audio.playSunlightFlame();

            this.audio.setBossMusic(true);
            this.game.showNotification(`${this.boss.name} AWAKENED`);
            this.game.showBossHpBar(this.boss);
        }

        if (this.boss.state === 'IDLE') return;

        this.boss.animTime += delta;

        // Smoothly face player with shortest angular distance (prevents 360 spin jitter)
        const targetAngle = Math.atan2(this._scratchToPlayer.x, this._scratchToPlayer.z);
        let angleDiff = (targetAngle - this.boss.mesh.rotation.y) % (Math.PI * 2);
        if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        this.boss.mesh.rotation.y += angleDiff * Math.min(1.0, delta * 6.0);

        this.boss.cooldown -= delta;

        // Dispatch to all 36 boss-specific AI behaviors
        const id = this.boss.id;
        if (id === 'asylum' || id === 'stray_demon' || id === 'demon_firesage') this.updateAsylumAI(delta, dist, targetAngle);
        else if (id === 'gargoyle' || id === 'sanctuary_guardian') this.updateGargoyleAI(delta, dist, targetAngle);
        else if (id === 'capra') this.updateCapraAI(delta, dist, targetAngle);
        else if (id === 'gaping' || id === 'centipede') this.updateGapingAI(delta, dist, targetAngle);
        else if (id === 'quelaag' || id === 'bed_of_chaos') this.updateQuelaagAI(delta, dist, targetAngle);
        else if (id === 'butterfly' || id === 'gwyndolin' || id === 'pinwheel') this.updateButterflyAI(delta, dist, targetAngle);
        else if (id === 'iron_golem' || id === 'ceaseless' || id === 'mirror_knight') this.updateIronGolemAI(delta, dist, targetAngle);
        else if (id === 'ornstein' || id === 'nameless_king') this.updateOrnsteinAI(delta, dist, targetAngle);
        else if (id === 'smough') this.updateSmoughAI(delta, dist, targetAngle);
        else if (id === 'sif') this.updateSifAI(delta, dist, targetAngle);
        else if (id === 'artorias' || id === 'abyss_watchers' || id === 'sir_alonne' || id === 'pursuer') this.updateArtoriasAI(delta, dist, targetAngle);
        else if (id === 'manus' || id === 'four_kings') this.updateManusAI(delta, dist, targetAngle);
        else if (id === 'kalameet' || id === 'seath') this.updateKalameetAI(delta, dist, targetAngle);
        else if (id === 'nito') this.updateNitoAI(delta, dist, targetAngle);
        else if (id === 'gwyn' || id === 'soul_of_cinder' || id === 'pontiff_sulyvahn' || id === 'fume_knight' || id === 'slave_knight_gael') this.updateGwynAI(delta, dist, targetAngle);
        else if (id === 'gorgon_medusa') this.updateGorgonMedusaAI(delta, dist, targetAngle);
        else if (id === 'malenia') this.updateMaleniaAI(delta, dist, targetAngle);
        else if (id === 'radahn') this.updateRadahnAI(delta, dist, targetAngle);
        else if (id === 'king_allant') this.updateKingAllantAI(delta, dist, targetAngle);
        else if (id === 'ludwig') this.updateLudwigAI(delta, dist, targetAngle);
        else if (id === 'lady_maria') this.updateLadyMariaAI(delta, dist, targetAngle);
        else if (id === 'orphan_of_kos') this.updateOrphanOfKosAI(delta, dist, targetAngle);
        else if (id === 'father_gascoigne') this.updateFatherGascoigneAI(delta, dist, targetAngle);
        else if (id === 'darklurker') this.updateDarklurkerAI(delta, dist, targetAngle);
        else if (id === 'velstadt') this.updateVelstadtAI(delta, dist, targetAngle);
        else if (id === 'burnt_ivory_king') this.updateIvoryKingAI(delta, dist, targetAngle);
        else if (id === 'dragonrider') this.updateDragonriderAI(delta, dist, targetAngle);
        else if (id === 'twin_princes') this.updateTwinPrincesAI(delta, dist, targetAngle);
        else if (id === 'dragonslayer_armour') this.updateDragonslayerArmourAI(delta, dist, targetAngle);
        else if (id === 'sister_friede') this.updateSisterFriedeAI(delta, dist, targetAngle);
        else if (id === 'champion_gundyr') this.updateChampionGundyrAI(delta, dist, targetAngle);
        else if (id === 'darkeater_midir') this.updateDarkeaterMidirAI(delta, dist, targetAngle);
        else if (id === 'godfrey') this.updateGodfreyAI(delta, dist, targetAngle);
        else if (id === 'maliketh') this.updateMalikethAI(delta, dist, targetAngle);
        else if (id === 'mohg') this.updateMohgAI(delta, dist, targetAngle);
        else if (id === 'morgott') this.updateMorgottAI(delta, dist, targetAngle);
        else if (id === 'rykard') this.updateRykardAI(delta, dist, targetAngle);
        else if (id === 'isshin_sword_saint') this.updateIsshinAI(delta, dist, targetAngle);
        else if (id === 'elden_beast') this.updateEldenBeastAI(delta, dist, targetAngle);
        else this.updateTaurusAI(delta, dist, targetAngle);
    }

    // ----------------------------------------------------
    // BOSS 37: MEDUSA, GORGON MATRIARCH AI
    // Petrifying Gaze, Writhing Snake Hair, Venomous Tail Sweep & Kris Flurry
    // ----------------------------------------------------
    updateGorgonMedusaAI(delta, dist, targetAngle) {
        const u = this.boss.mesh.userData;
        const time = this.boss.animTime;

        // 1. Serpentine Tail Slither Undulation
        if (u.tailSegments) {
            u.tailSegments.forEach((seg, idx) => {
                const base = (seg.userData && seg.userData.baseX) || 0;
                const baseRot = (seg.userData && seg.userData.baseRotY) || 0;
                seg.position.x = base + Math.sin(time * 6.5 - idx * 0.55) * 0.42 * (1.0 + idx * 0.10);
                seg.rotation.y = baseRot + Math.cos(time * 6.5 - idx * 0.55) * 0.32;
            });
        }

        // 2. Writhing Snake Hair Animation
        if (u.snakeHair) {
            u.snakeHair.forEach((sn, idx) => {
                const bX = (sn.userData && sn.userData.baseRotX) || 0;
                const bZ = (sn.userData && sn.userData.baseRotZ) || 0;
                sn.rotation.x = bX + Math.sin(time * 7.0 + idx * 0.75) * 0.24;
                sn.rotation.z = bZ + Math.cos(time * 6.5 + idx * 0.85) * 0.20;
            });
        }
        if (u.tongue) {
            u.tongue.scale.z = 1.0 + Math.sin(time * 15.0) * 0.55;
        }

        // 3. Movement towards player (slithering locomotion)
        if (dist > 3.2 && !this.boss.isAttacking) {
            const speed = 2.8;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;

            if (u.bodyGroup) {
                u.bodyGroup.position.y = 1.35 + Math.sin(time * 8) * 0.08;
            }
        }

        // 4. Attack Selection & Execution
        if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            if (dist < 4.5 && Math.random() < 0.4) {
                // Tail Sweep Attack
                this.boss.isAttacking = true;
                this.boss.attackType = 'TAIL_SWEEP';
                this.boss.attackTime = 0;
            } else if (dist < 22 && Math.random() < 0.65) {
                // Petrifying Gaze (Stone Stare)
                this.boss.isAttacking = true;
                this.boss.attackType = 'PETRIFYING_GAZE';
                this.boss.attackTime = 0;
            } else {
                // Venom Spit / Viper Strike
                this.boss.isAttacking = true;
                this.boss.attackType = 'VENOM_SPIT';
                this.boss.attackTime = 0;
            }
        }

        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            const aTime = this.boss.attackTime;

            if (this.boss.attackType === 'PETRIFYING_GAZE') {
                if (aTime < 0.9) {
                    // Windup: Rears upper torso up, head tilts back
                    const t = aTime / 0.9;
                    if (u.torso) u.torso.position.y = 0.2 + t * 0.4;
                    if (u.head) u.head.rotation.x = -0.45 * t;
                    if (u.gazeLight) u.gazeLight.intensity = 2.5 + t * 4.0;
                } else if (aTime < 2.0) {
                    // Strike Phase: Volumetric Jade Beam Fires!
                    if (u.gorgonGazeBeam) u.gorgonGazeBeam.visible = true;

                    if (!this.boss._hasGazed) {
                        this.boss._hasGazed = true;
                        this.audio.playPetrifyingGaze();

                        const pPos = this.game.playerMesh.position;
                        const bPos = this.boss.mesh.position;
                        const toBoss = new THREE.Vector3().subVectors(bPos, pPos).normalize();
                        const pForward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.game.playerMesh.rotation.y);
                        const isFacing = pForward.dot(toBoss) > 0.25;

                        if (dist < 22 && isFacing) {
                            // Player looked into Medusa's eyes! PETRIFICATION!
                            this.takeDamage(120, false);
                            this.stamina = Math.max(0, this.stamina - 65);
                            this.game.showDamageNumber(pPos, 120, true);
                            if (this.game.triggerPetrifiedEffect) {
                                this.game.triggerPetrifiedEffect();
                            }
                        }
                    }
                } else if (aTime < 2.6) {
                    // Recovery Phase
                    if (u.gorgonGazeBeam) u.gorgonGazeBeam.visible = false;
                    this.boss._hasGazed = false;
                    const t = (aTime - 2.0) / 0.6;
                    if (u.torso) u.torso.position.y = 0.6 - t * 0.4;
                    if (u.head) u.head.rotation.x = -0.45 * (1 - t);
                } else {
                    this.boss.isAttacking = false;
                    this.boss.cooldown = 2.4;
                }
            } else if (this.boss.attackType === 'TAIL_SWEEP') {
                if (aTime < 0.6) {
                    // Coil windup
                    const t = aTime / 0.6;
                    this.boss.mesh.rotation.y = targetAngle - t * 1.5;
                } else if (aTime < 1.0) {
                    // Explosive 360 lash
                    const t = (aTime - 0.6) / 0.4;
                    this.boss.mesh.rotation.y = targetAngle - 1.5 + t * Math.PI * 2;
                    if (!this.boss._hasSwept) {
                        this.boss._hasSwept = true;
                        this.audio.playTailSweep();
                        if (dist < 5.8) {
                            this.takeDamage(this.boss.damage * 0.9, false);
                            this.game.showDamageNumber(this.game.playerMesh.position, Math.round(this.boss.damage * 0.9), false);
                        }
                    }
                } else {
                    this.boss._hasSwept = false;
                    this.boss.isAttacking = false;
                    this.boss.cooldown = 1.8;
                }
            } else {
                // VENOM_SPIT
                if (aTime < 0.5) {
                    if (u.head) u.head.rotation.x = -0.3;
                } else if (aTime < 0.9) {
                    if (!this.boss._hasSpit) {
                        this.boss._hasSpit = true;
                        this.audio.playSnakeHiss();
                        this.audio.playVenomSpit();
                        // Launch 3 green venom projectiles
                        const bPos = this.boss.mesh.position.clone().add(new THREE.Vector3(0, 1.8, 0));
                        for (let p = -1; p <= 1; p++) {
                            const pDir = new THREE.Vector3().subVectors(this.game.playerMesh.position, bPos).normalize();
                            pDir.applyAxisAngle(new THREE.Vector3(0, 1, 0), p * 0.22);
                            const pGeo = new THREE.SphereGeometry(0.24, 6, 6);
                            const pMat = new THREE.MeshBasicMaterial({ color: 0x22ff55 });
                            const pMesh = new THREE.Mesh(pGeo, pMat);
                            pMesh.position.copy(bPos);
                            this.game.scene.add(pMesh);
                            this.projectiles.push({
                                mesh: pMesh,
                                dir: pDir,
                                speed: 18,
                                damage: 85,
                                life: 2.5
                            });
                        }
                    }
                } else {
                    this.boss._hasSpit = false;
                    this.boss.isAttacking = false;
                    this.boss.cooldown = 2.0;
                }
            }
        }
    }

    // ----------------------------------------------------
    // BOSS 38: MALENIA, BLADE OF MIQUELLA AI
    // Waterfowl Dance Flurry, Scarlet Aeonia Dive & Lifesteal
    // ----------------------------------------------------
    updateMaleniaAI(delta, dist, targetAngle) {
        const u = this.boss.mesh.userData;
        const speed = this.boss.isPhase2 ? 4.8 : 3.8;

        if (dist > 3.6 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
            if (u.headGroup) u.headGroup.rotation.y = Math.sin(this.boss.animTime * 6) * 0.15;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
            this.boss._hit2 = false;
            this.boss.attackType = Math.random() < 0.5 ? 'WATERFOWL_DANCE' : 'SCARLET_AEONIA';
        }

        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            const aTime = this.boss.attackTime;

            if (this.boss.attackType === 'WATERFOWL_DANCE') {
                if (aTime < 0.5) {
                    this.boss.mesh.position.y = (aTime / 0.5) * 2.2;
                } else if (aTime < 1.2) {
                    this.boss.mesh.position.y = Math.max(0, this.boss.mesh.position.y - delta * 4);
                    this.boss.mesh.position.x += Math.sin(targetAngle) * 6.5 * delta;
                    this.boss.mesh.position.z += Math.cos(targetAngle) * 6.5 * delta;
                    if (!this.boss._hit1) {
                        this.boss._hit1 = true;
                        this.audio.playSwing();
                        if (dist < 4.8) {
                            this.takeDamage(this.boss.damage * 0.75, false);
                            this.boss.hp = Math.min(this.boss.maxHp, this.boss.hp + 120);
                            this.world.spawnHitSparks(this.game.playerMesh.position, true);
                        }
                    }
                } else if (aTime < 1.9) {
                    if (!this.boss._hit2) {
                        this.boss._hit2 = true;
                        this.audio.playSwing();
                        this.game.shakeCamera(0.3, 0.4);
                        if (dist < 4.8) {
                            this.takeDamage(this.boss.damage * 0.85, false);
                            this.boss.hp = Math.min(this.boss.maxHp, this.boss.hp + 150);
                            this.world.spawnHitSparks(this.game.playerMesh.position, true);
                        }
                    }
                } else {
                    this.boss.isAttacking = false;
                    this.boss.mesh.position.y = 0;
                    this.boss.cooldown = 2.0;
                }
            } else {
                if (aTime < 0.7) {
                    this.boss.mesh.position.y = (aTime / 0.7) * 4.2;
                } else if (aTime < 1.1) {
                    this.boss.mesh.position.y = Math.max(0, this.boss.mesh.position.y - delta * 12);
                    if (!this.boss._hit1 && this.boss.mesh.position.y <= 0.2) {
                        this.boss._hit1 = true;
                        this.audio.playBossSlam();
                        this.game.shakeCamera(0.6, 0.7);
                        this.world.spawnSunlightBurst(this.boss.mesh.position);
                        if (dist < 6.5) {
                            this.takeDamage(this.boss.damage * 1.15, false);
                            this.isPoisoned = true;
                            this.poisonTimer = 8.0;
                        }
                    }
                } else {
                    this.boss.isAttacking = false;
                    this.boss.mesh.position.y = 0;
                    this.boss.cooldown = 2.6;
                }
            }
        }
    }

    // ----------------------------------------------------
    // BOSS 39: STARCOURGE RADAHN AI
    // Gravitational Starcall Pull & Meteor Slam
    // ----------------------------------------------------
    updateRadahnAI(delta, dist, targetAngle) {
        const u = this.boss.mesh.userData;
        const speed = 2.6;

        if (dist > 4.5 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
            this.boss.attackType = Math.random() < 0.5 ? 'STARCALL_GRAVITY' : 'METEOR_SLAM';
        }

        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            const aTime = this.boss.attackTime;

            if (this.boss.attackType === 'STARCALL_GRAVITY') {
                if (aTime < 0.8) {
                    const pullDir = new THREE.Vector3().subVectors(this.boss.mesh.position, this.game.playerMesh.position).normalize();
                    this.game.playerMesh.position.addScaledVector(pullDir, 4.5 * delta);
                } else if (aTime < 1.3) {
                    if (!this.boss._hit1) {
                        this.boss._hit1 = true;
                        this.audio.playBossRoar();
                        this.audio.playBossSlam();
                        this.game.shakeCamera(0.55, 0.6);
                        this.world.spawnHitSparks(this.boss.mesh.position, true);
                        if (dist < 5.8) {
                            this.takeDamage(this.boss.damage * 1.0, false);
                        }
                    }
                } else {
                    this.boss.isAttacking = false;
                    this.boss.cooldown = 2.4;
                }
            } else {
                if (aTime < 0.6) {
                    this.boss.mesh.position.y = (aTime / 0.6) * 5.0;
                } else if (aTime < 1.2) {
                    this.boss.mesh.position.y = Math.max(0, this.boss.mesh.position.y - delta * 10);
                    if (!this.boss._hit1 && this.boss.mesh.position.y <= 0.2) {
                        this.boss._hit1 = true;
                        this.audio.playBossSlam();
                        this.game.shakeCamera(0.7, 0.8);
                        this.world.spawnSunlightBurst(this.boss.mesh.position);
                        if (dist < 7.2) {
                            this.takeDamage(this.boss.damage * 1.25, false);
                        }
                    }
                } else {
                    this.boss.isAttacking = false;
                    this.boss.mesh.position.y = 0;
                    this.boss.cooldown = 2.8;
                }
            }
        }
    }

    // ----------------------------------------------------
    // BOSS 40: FALSE KING ALLANT AI
    // Soul Drain Energy & Soulbrant Sonic Wave
    // ----------------------------------------------------
    updateKingAllantAI(delta, dist, targetAngle) {
        const u = this.boss.mesh.userData;
        const speed = 3.6;

        if (dist > 4.0 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
            this.boss.attackType = Math.random() < 0.5 ? 'SOUL_DRAIN' : 'SOULBRANT_WAVE';
        }

        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            const aTime = this.boss.attackTime;

            if (this.boss.attackType === 'SOUL_DRAIN') {
                if (aTime < 0.7) {
                    if (u.leftShoulder) u.leftShoulder.rotation.x = -1.2;
                } else if (aTime < 1.2) {
                    if (!this.boss._hit1) {
                        this.boss._hit1 = true;
                        this.audio.playBellToll();
                        this.world.spawnSunlightBurst(this.boss.mesh.position);
                        if (dist < 4.2) {
                            this.takeDamage(this.boss.damage * 1.3, false);
                            this.souls = Math.max(0, this.souls - 500);
                            this.game.showNotification("⚠️ FALSE KING ALLANT DRAINED 500 SOULS!");
                        }
                    }
                } else {
                    this.boss.isAttacking = false;
                    this.boss.cooldown = 2.6;
                }
            } else {
                if (aTime < 0.5) {
                    if (u.rightShoulder) u.rightShoulder.rotation.x = 1.0;
                } else if (aTime < 1.0) {
                    if (!this.boss._hit1) {
                        this.boss._hit1 = true;
                        this.audio.playSwing();
                        this.game.shakeCamera(0.4, 0.5);
                        this.world.spawnHitSparks(this.boss.mesh.position, true);
                        if (dist < 6.5) {
                            this.takeDamage(this.boss.damage * 0.95, false);
                        }
                    }
                } else {
                    this.boss.isAttacking = false;
                    this.boss.cooldown = 2.2;
                }
            }
        }
    }

    // ----------------------------------------------------
    // BOSS 1: TAURUS DEMON AI
    // ----------------------------------------------------
    updateTaurusAI(delta, dist, targetAngle) {
        const u = this.boss.mesh.userData;

        // Locomotion & Heavy Stomp
        if (dist > 3.8 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 3.4 : 2.5;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;

            const stride = this.boss.animTime * (this.boss.isPhase2 ? 4.2 : 3.2);

            // Colossal heavy stomping locomotion
            if (u.rightHip && u.leftHip) {
                u.rightHip.rotation.x = Math.sin(stride) * 0.58;
                u.leftHip.rotation.x = -Math.sin(stride) * 0.58;
            }
            if (u.torso) {
                u.torso.rotation.z = Math.sin(stride) * 0.15;
                u.torso.rotation.x = 0.18;
                u.torso.position.y = Math.abs(Math.sin(stride)) * 0.18;
            }
            if (u.headGroup) {
                u.headGroup.rotation.x = Math.sin(stride) * 0.15;
                u.headGroup.rotation.y = Math.sin(this.boss.animTime * 1.8) * 0.14;
            }
            if (u.rightShoulder) {
                u.rightShoulder.rotation.x = -0.45 + Math.sin(stride) * 0.28;
            }
            if (u.leftShoulder) {
                u.leftShoulder.rotation.x = -Math.sin(stride) * 0.28;
            }

            if (Math.sin(stride) > 0.96) {
                if (!this.boss._lastStepTime || this.boss.animTime - this.boss._lastStepTime > 0.45) {
                    this.boss._lastStepTime = this.boss.animTime;
                }
            }
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss.cooldown = this.boss.isPhase2 ? 1.7 : 2.4;
            this.boss._slamDelivered = false;
            this.boss._cleaveDelivered = false;
            this.boss._stomp1Delivered = false;
            this.boss._stomp2Delivered = false;
            this.boss._chargeHitDelivered = false;
            this.boss._jumpTargetPos = (this.game && this.game.playerMesh) ? this.game.playerMesh.position.clone() : new THREE.Vector3();
            this.boss._jumpStartPos = this.boss.mesh.position.clone();

            const rand = Math.random();
            if (dist > 7.0) {
                // Long range: Meteor Jump Slam or Demonic Charge
                this.boss.attackType = rand < 0.65 ? 'JUMP_SLAM' : 'CHARGE_THRUST';
            } else {
                if (rand < 0.30) this.boss.attackType = 'SLAM';
                else if (rand < 0.58) this.boss.attackType = 'CLEAVE';
                else if (rand < 0.82) this.boss.attackType = 'BERSERK_STOMP';
                else this.boss.attackType = 'JUMP_SLAM';
            }

            if (this.boss.attackType === 'JUMP_SLAM') {
                this.audio.playBossRoar();
                this.game.showNotification("TAURUS DEMON METEOR JUMP SLAM!");
            } else if (this.boss.attackType === 'BERSERK_STOMP') {
                this.audio.playBossRoar();
                this.game.showNotification("TAURUS DEMON BERSERK GROUND STOMP!");
            } else if (this.boss.attackType === 'CHARGE_THRUST') {
                this.audio.playBossRoar();
                this.game.showNotification("TAURUS DEMON DEMONIC CHARGE!");
            } else if (this.boss.attackType === 'SLAM') {
                this.audio.playBossRoar();
            } else {
                this.audio.playSwing(true);
            }
        }

        // Active Taurus Demon Attack Animation Execution
        if (this.boss.isAttacking) {
            this.boss.attackTime = (this.boss.attackTime || 0) + delta;

            if (this.boss.attackType === 'JUMP_SLAM') {
                const windupEnd = 0.65;
                const jumpEnd = 1.35;
                const totalDur = 2.15;

                if (this.boss.attackTime < windupEnd) {
                    // Deep crouch and charge up
                    const t = this.boss.attackTime / windupEnd;
                    if (u.torso) {
                        u.torso.rotation.x = -0.55 * t;
                        u.torso.position.y = -0.65 * t;
                    }
                    if (u.rightHip && u.leftHip) {
                        u.rightHip.rotation.x = -0.75 * t;
                        u.leftHip.rotation.x = -0.75 * t;
                    }
                    if (u.rightShoulder) {
                        u.rightShoulder.rotation.x = -2.4 * t;
                        u.rightShoulder.rotation.z = 0.35 * t;
                    }
                    if (u.leftShoulder) {
                        u.leftShoulder.rotation.x = -2.2 * t;
                    }
                } else if (this.boss.attackTime < jumpEnd) {
                    // Airborne Leap & Meteor Descent
                    const jt = (this.boss.attackTime - windupEnd) / (jumpEnd - windupEnd);
                    const arcHeight = Math.sin(jt * Math.PI) * 4.6;

                    this.boss.mesh.position.x = THREE.MathUtils.lerp(this.boss._jumpStartPos.x, this.boss._jumpTargetPos.x, jt);
                    this.boss.mesh.position.z = THREE.MathUtils.lerp(this.boss._jumpStartPos.z, this.boss._jumpTargetPos.z, jt);
                    const baseGroundY = this.world.getGroundHeight(this.boss.mesh.position.x, this.boss.mesh.position.z);
                    this.boss.mesh.position.y = baseGroundY + arcHeight;

                    if (u.torso) {
                        u.torso.rotation.x = 0.45 * Math.sin(jt * Math.PI);
                        u.torso.position.y = 0;
                    }
                    if (u.rightShoulder) {
                        u.rightShoulder.rotation.x = -2.85;
                    }
                    if (u.leftShoulder) {
                        u.leftShoulder.rotation.x = -2.65;
                    }

                    // Impact frame near apex landing
                    if (!this.boss._slamDelivered && jt >= 0.95) {
                        this.boss._slamDelivered = true;
                        this.boss.mesh.position.y = baseGroundY;
                        if (this.audio && this.audio.playBossJumpSlam) this.audio.playBossJumpSlam();
                        else this.audio.playBossSlam();
                        this.game.shakeCamera(0.85, 0.95);
                        this.world.spawnHitSparks(this.boss.mesh.position, true);

                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 6.8 && !this.isRolling && !this.isInvincible) {
                            this.damagePlayer(Math.round(this.boss.damage * 1.35), this.boss.mesh.position);
                        }
                    }
                } else if (this.boss.attackTime < totalDur) {
                    // Heavy recovery from crater squash
                    const t = (this.boss.attackTime - jumpEnd) / (totalDur - jumpEnd);
                    if (u.torso) {
                        u.torso.rotation.x = THREE.MathUtils.lerp(0.65, 0.18, t);
                        u.torso.position.y = THREE.MathUtils.lerp(-0.4, 0, t);
                    }
                    if (u.rightHip && u.leftHip) {
                        u.rightHip.rotation.x = THREE.MathUtils.lerp(-0.4, 0, t);
                        u.leftHip.rotation.x = THREE.MathUtils.lerp(-0.4, 0, t);
                    }
                    if (u.rightShoulder) {
                        u.rightShoulder.rotation.x = THREE.MathUtils.lerp(1.4, -0.45, t);
                    }
                    if (u.leftShoulder) {
                        u.leftShoulder.rotation.x = THREE.MathUtils.lerp(1.1, 0, t);
                    }
                } else {
                    this.boss.isAttacking = false;
                    this.boss._slamDelivered = false;
                }
            } else if (this.boss.attackType === 'BERSERK_STOMP') {
                const totalDur = 1.95;
                const stomp1Time = 0.55;
                const stomp2Time = 1.15;

                if (this.boss.attackTime < stomp1Time) {
                    const t = this.boss.attackTime / stomp1Time;
                    if (u.leftHip) u.leftHip.rotation.x = -1.15 * t;
                    if (u.torso) { u.torso.rotation.x = -0.35 * t; u.torso.rotation.z = 0.25 * t; }
                } else if (this.boss.attackTime < stomp2Time) {
                    if (!this.boss._stomp1Delivered) {
                        this.boss._stomp1Delivered = true;
                        this.audio.playBossSlam();
                        this.game.shakeCamera(0.42, 0.38);
                        this.world.spawnHitSparks(this.boss.mesh.position, false);
                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 4.5 && !this.isRolling && !this.isInvincible) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.5), this.boss.mesh.position);
                        }
                    }
                    const t = (this.boss.attackTime - stomp1Time) / (stomp2Time - stomp1Time);
                    if (u.leftHip) u.leftHip.rotation.x = -1.15 * (1 - t);
                    if (u.rightHip) u.rightHip.rotation.x = -1.25 * t;
                    if (u.torso) { u.torso.rotation.x = -0.45 * t; u.torso.rotation.z = -0.3 * t; }
                    if (u.rightShoulder) u.rightShoulder.rotation.x = -2.2 * t;
                } else if (this.boss.attackTime < totalDur) {
                    if (!this.boss._stomp2Delivered) {
                        this.boss._stomp2Delivered = true;
                        if (this.audio && this.audio.playBossJumpSlam) this.audio.playBossJumpSlam();
                        else this.audio.playBossSlam();
                        this.game.shakeCamera(0.72, 0.65);
                        this.world.spawnHitSparks(this.boss.mesh.position, true);
                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 5.8 && !this.isRolling && !this.isInvincible) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.95), this.boss.mesh.position);
                        }
                    }
                    const t = (this.boss.attackTime - stomp2Time) / (totalDur - stomp2Time);
                    if (u.rightHip) u.rightHip.rotation.x = -1.25 * (1 - t);
                    if (u.torso) {
                        u.torso.rotation.x = THREE.MathUtils.lerp(0.5, 0.18, t);
                        u.torso.rotation.z = THREE.MathUtils.lerp(-0.3, 0, t);
                    }
                    if (u.rightShoulder) u.rightShoulder.rotation.x = THREE.MathUtils.lerp(1.2, -0.45, t);
                } else {
                    this.boss.isAttacking = false;
                    this.boss._stomp1Delivered = false;
                    this.boss._stomp2Delivered = false;
                }
            } else if (this.boss.attackType === 'CHARGE_THRUST') {
                const windupEnd = 0.35;
                const chargeEnd = 1.15;
                const totalDur = 1.65;

                if (this.boss.attackTime < windupEnd) {
                    const t = this.boss.attackTime / windupEnd;
                    if (u.torso) u.torso.rotation.x = 0.45 * t;
                    if (u.headGroup) u.headGroup.rotation.x = 0.65 * t;
                    if (u.rightShoulder) u.rightShoulder.rotation.x = -1.3 * t;
                } else if (this.boss.attackTime < chargeEnd) {
                    const chargeSpeed = 9.2;
                    this.boss.mesh.position.x += Math.sin(targetAngle) * chargeSpeed * delta;
                    this.boss.mesh.position.z += Math.cos(targetAngle) * chargeSpeed * delta;

                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 3.8 && !this.boss._chargeHitDelivered) {
                        this.boss._chargeHitDelivered = true;
                        this.audio.playBossSlam();
                        this.game.shakeCamera(0.55, 0.45);
                        this.world.spawnHitSparks(this.boss.mesh.position, true);
                        if (!this.isRolling && !this.isInvincible) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.85), this.boss.mesh.position);
                        }
                    }
                } else if (this.boss.attackTime < totalDur) {
                    const t = (this.boss.attackTime - chargeEnd) / (totalDur - chargeEnd);
                    if (u.torso) u.torso.rotation.x = THREE.MathUtils.lerp(0.45, 0.18, t);
                    if (u.headGroup) u.headGroup.rotation.x = THREE.MathUtils.lerp(0.65, 0, t);
                    if (u.rightShoulder) u.rightShoulder.rotation.x = THREE.MathUtils.lerp(-1.3, -0.45, t);
                } else {
                    this.boss.isAttacking = false;
                    this.boss._chargeHitDelivered = false;
                }
            } else if (this.boss.attackType === 'SLAM') {
                const windupEnd = 0.75;
                const strikeEnd = 0.95;
                const totalDur = 1.35;

                if (this.boss.attackTime < windupEnd) {
                    const t = this.boss.attackTime / windupEnd;
                    if (u.torso) {
                        u.torso.rotation.x = -0.58 * t;
                        u.torso.position.y = 0.32 * t;
                    }
                    if (u.headGroup) {
                        u.headGroup.rotation.x = -0.48 * t;
                    }
                    if (u.rightShoulder) {
                        u.rightShoulder.rotation.x = -2.35 * t;
                        u.rightShoulder.rotation.z = 0.3 * t;
                    }
                    if (u.leftShoulder) {
                        u.leftShoulder.rotation.x = -2.1 * t;
                    }
                } else if (this.boss.attackTime < strikeEnd) {
                    const t = (this.boss.attackTime - windupEnd) / (strikeEnd - windupEnd);
                    if (u.torso) {
                        u.torso.rotation.x = -0.58 + 1.12 * t;
                        u.torso.position.y = 0.32 - 0.52 * t;
                    }
                    if (u.headGroup) {
                        u.headGroup.rotation.x = -0.48 + 0.88 * t;
                    }
                    if (u.rightShoulder) {
                        u.rightShoulder.rotation.x = -2.35 + 3.9 * t;
                    }
                    if (u.leftShoulder) {
                        u.leftShoulder.rotation.x = -2.1 + 3.3 * t;
                    }

                    if (!this.boss._slamDelivered && t >= 0.5) {
                        this.boss._slamDelivered = true;
                        this.audio.playBossSlam();
                        this.game.shakeCamera(0.58, 0.75);
                        this.world.spawnHitSparks(this.boss.mesh.position, true);

                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 5.2 && !this.isRolling && !this.isInvincible) {
                            this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                        }
                    }
                } else if (this.boss.attackTime < totalDur) {
                    const t = (this.boss.attackTime - strikeEnd) / (totalDur - strikeEnd);
                    if (u.torso) {
                        u.torso.rotation.x = THREE.MathUtils.lerp(0.54, 0.18, t);
                        u.torso.position.y = THREE.MathUtils.lerp(-0.2, 0, t);
                    }
                    if (u.rightShoulder) {
                        u.rightShoulder.rotation.x = THREE.MathUtils.lerp(1.55, -0.45, t);
                    }
                    if (u.leftShoulder) {
                        u.leftShoulder.rotation.x = THREE.MathUtils.lerp(1.2, 0, t);
                    }
                } else {
                    this.boss.isAttacking = false;
                    this.boss._slamDelivered = false;
                }
            } else {
                const windupEnd = 0.55;
                const strikeEnd = 0.75;
                const totalDur = 1.15;

                if (this.boss.attackTime < windupEnd) {
                    const t = this.boss.attackTime / windupEnd;
                    if (u.torso) {
                        u.torso.rotation.y = -0.88 * t;
                        u.torso.rotation.x = 0.1 * t;
                    }
                    if (u.rightShoulder) {
                        u.rightShoulder.rotation.x = -0.6 * t;
                        u.rightShoulder.rotation.y = -0.92 * t;
                    }
                } else if (this.boss.attackTime < strikeEnd) {
                    const t = (this.boss.attackTime - windupEnd) / (strikeEnd - windupEnd);
                    if (u.torso) {
                        u.torso.rotation.y = -0.88 + 1.92 * t;
                    }
                    if (u.rightShoulder) {
                        u.rightShoulder.rotation.y = -0.92 + 1.85 * t;
                        u.rightShoulder.rotation.x = -0.6 + 0.95 * t;
                    }

                    if (!this.boss._cleaveDelivered && t >= 0.5) {
                        this.boss._cleaveDelivered = true;
                        this.game.shakeCamera(0.38, 0.48);
                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 4.5 && !this.isRolling && !this.isInvincible) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.8), this.boss.mesh.position);
                        }
                    }
                } else if (this.boss.attackTime < totalDur) {
                    const t = (this.boss.attackTime - strikeEnd) / (totalDur - strikeEnd);
                    if (u.torso) {
                        u.torso.rotation.y = THREE.MathUtils.lerp(1.04, 0, t);
                    }
                    if (u.rightShoulder) {
                        u.rightShoulder.rotation.y = THREE.MathUtils.lerp(0.93, 0, t);
                        u.rightShoulder.rotation.x = THREE.MathUtils.lerp(0.35, -0.45, t);
                    }
                } else {
                    this.boss.isAttacking = false;
                    this.boss._cleaveDelivered = false;
                }
            }
        }
    }

    // ----------------------------------------------------
    // BOSS 2: BELL GARGOYLE AI (Wings, Halberd & Fire Breath)
    // ----------------------------------------------------
    updateGargoyleAI(delta, dist, targetAngle) {
        const u = this.boss.mesh.userData;
        if (u.leftWingGroup && u.rightWingGroup) {
            const flapSpeed = this.boss.isPhase2 ? 8 : 5;
            u.leftWingGroup.rotation.y = Math.sin(this.boss.animTime * flapSpeed) * 0.4;
            u.rightWingGroup.rotation.y = -Math.sin(this.boss.animTime * flapSpeed) * 0.4;
        }
        if (u.tailGroup) {
            u.tailGroup.rotation.y = Math.sin(this.boss.animTime * 3) * 0.4;
        }

        if (dist > 4.2 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 3.8 : 2.8;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
            this.boss._chargeDir = new THREE.Vector3(Math.sin(targetAngle), 0, Math.cos(targetAngle));
            this.boss.cooldown = this.boss.isPhase2 ? 2.0 : 2.8;

            const roll = Math.random();
            if (roll < 0.45) {
                this.boss.attackType = 'HALBERD_LUNGE';
                this.audio.playSwing(false);
            } else if (roll < 0.8) {
                this.boss.attackType = 'FIRE_BREATH';
                this.audio.playFireBreath();
                if (u.throatFlame) u.throatFlame.intensity = 4.0;
            } else {
                this.boss.attackType = 'TAIL_SWEEP';
                this.audio.playSwing(true);
            }
        }

        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackType === 'HALBERD_LUNGE') {
                if (this.boss.attackTime < 0.45) {
                    this.boss.mesh.position.addScaledVector(this.boss._chargeDir, 4.0 * delta);
                }
                if (this.boss.attackTime >= 0.45 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.game.shakeCamera(0.25, 0.35);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 5.2) {
                        this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                    }
                }
                if (this.boss.attackTime >= 0.9) this.boss.isAttacking = false;
            } else if (this.boss.attackType === 'FIRE_BREATH') {
                const headPos = this.boss.mesh.position.clone().add(new THREE.Vector3(0, 2.5, 0));
                const fireDir = new THREE.Vector3(Math.sin(targetAngle), -0.15, Math.cos(targetAngle)).normalize();
                if (Math.floor(this.boss.attackTime * 8) !== Math.floor((this.boss.attackTime - delta) * 8)) {
                    this.world.spawnFlameBreath(headPos, fireDir);
                }
                if (this.boss.attackTime >= 1.0 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    if (u.throatFlame) u.throatFlame.intensity = 0;
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    const toPlayer = new THREE.Vector3().subVectors(this.game.playerMesh.position, this.boss.mesh.position).normalize();
                    const forward = new THREE.Vector3(Math.sin(targetAngle), 0, Math.cos(targetAngle));
                    if (hitDist < 6.8 && forward.dot(toPlayer) > 0.3) {
                        this.damagePlayer(Math.round(this.boss.damage * 0.9), this.boss.mesh.position);
                    }
                }
                if (this.boss.attackTime >= 1.2) {
                    if (u.throatFlame) u.throatFlame.intensity = 0;
                    this.boss.isAttacking = false;
                }
            } else {
                if (u.tailGroup) u.tailGroup.rotation.y = Math.sin(this.boss.attackTime * 10) * 1.2;
                if (this.boss.attackTime >= 0.5 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.game.shakeCamera(0.3, 0.4);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 4.2) {
                        this.damagePlayer(Math.round(this.boss.damage * 0.75), this.boss.mesh.position);
                    }
                }
                if (this.boss.attackTime >= 0.95) this.boss.isAttacking = false;
            }
        }
    }

    updateCapraAI(delta, dist, targetAngle) {
        if (dist > 3.6 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 4.6 : 3.4;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
            this.boss._hit2 = false;
            this.boss._chargeDir = new THREE.Vector3(Math.sin(targetAngle), 0, Math.cos(targetAngle));
            this.boss.cooldown = this.boss.isPhase2 ? 1.6 : 2.4;

            const roll = Math.random();
            if (roll < 0.55) {
                this.boss.attackType = 'JUMP_CHOP';
                this.audio.playBossRoar();
            } else {
                this.boss.attackType = 'FLURRY';
                this.audio.playSwing(false);
            }
        }

        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackType === 'JUMP_CHOP') {
                if (this.boss.attackTime < 0.58) {
                    this.boss.mesh.position.addScaledVector(this.boss._chargeDir, 3.8 * delta);
                    this.boss.mesh.position.y = Math.sin((this.boss.attackTime / 0.58) * Math.PI) * 1.8;
                }
                if (this.boss.attackTime >= 0.58 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.boss.mesh.position.y = 0;
                    this.audio.playBossSlam();
                    this.game.shakeCamera(0.45, 0.55);
                    this.world.spawnHitSparks(this.boss.mesh.position, true);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 4.5) {
                        this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                    }
                }
                if (this.boss.attackTime >= 1.0) this.boss.isAttacking = false;
            } else {
                if (this.boss.attackTime >= 0.22 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 3.8) {
                        this.damagePlayer(Math.round(this.boss.damage * 0.5), this.boss.mesh.position);
                    }
                }
                if (this.boss.attackTime >= 0.48 && !this.boss._hit2) {
                    this.boss._hit2 = true;
                    this.audio.playSwing(true);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 4.0) {
                        this.damagePlayer(Math.round(this.boss.damage * 0.65), this.boss.mesh.position);
                    }
                }
                if (this.boss.attackTime >= 0.85) this.boss.isAttacking = false;
            }
        }
    }

    updateSifAI(delta, dist, targetAngle) {
        const u = this.boss.mesh.userData;
        if (u.frontLeft && u.frontRight && u.rearLeft && u.rearRight) {
            const runSpeed = 10;
            u.frontLeft.rotation.x = Math.sin(this.boss.animTime * runSpeed) * 0.45;
            u.frontRight.rotation.x = -Math.sin(this.boss.animTime * runSpeed) * 0.45;
            u.rearLeft.rotation.x = -Math.sin(this.boss.animTime * runSpeed) * 0.45;
            u.rearRight.rotation.x = Math.sin(this.boss.animTime * runSpeed) * 0.45;
        }
        if (u.tailGroup) {
            u.tailGroup.rotation.y = Math.sin(this.boss.animTime * 4) * 0.4;
        }

        if (dist > 4.8 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 4.6 : 3.6;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
            this.boss._hit2 = false;
            this.boss._chargeDir = new THREE.Vector3(Math.sin(targetAngle), 0, Math.cos(targetAngle));
            this.boss.cooldown = this.boss.isPhase2 ? 2.2 : 3.0;

            const roll = Math.random();
            if (roll < 0.6) {
                this.boss.attackType = 'WHIRLWIND';
                this.audio.playWolfHowl();
            } else {
                this.boss.attackType = 'POUNCE';
                this.audio.playSwing(false);
            }
        }

        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackType === 'WHIRLWIND') {
                this.boss.mesh.rotation.y += delta * 12;
                if (this.boss.attackTime >= 0.4 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.audio.playSwing(true);
                    this.game.shakeCamera(0.35, 0.45);
                    this.world.spawnHitSparks(this.boss.mesh.position, true);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 5.8) {
                        this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                    }
                }
                if (this.boss.isPhase2 && this.boss.attackTime >= 0.85 && !this.boss._hit2) {
                    this.boss._hit2 = true;
                    this.audio.playSwing(true);
                    this.game.shakeCamera(0.35, 0.45);
                    const hitDist2 = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist2 < 5.8) {
                        this.damagePlayer(Math.round(this.boss.damage * 0.8), this.boss.mesh.position);
                    }
                }
                const maxDur = this.boss.isPhase2 ? 1.3 : 0.8;
                if (this.boss.attackTime >= maxDur) this.boss.isAttacking = false;
            } else {
                if (this.boss.attackTime < 0.42) {
                    this.boss.mesh.position.addScaledVector(this.boss._chargeDir, 5.5 * delta);
                    this.boss.mesh.position.y = Math.sin((this.boss.attackTime / 0.42) * Math.PI) * 1.5;
                }
                if (this.boss.attackTime >= 0.42 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.boss.mesh.position.y = 0;
                    this.audio.playBossSlam();
                    this.game.shakeCamera(0.35, 0.45);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 4.8) {
                        this.damagePlayer(Math.round(this.boss.damage * 0.9), this.boss.mesh.position);
                    }
                }
                if (this.boss.attackTime >= 0.8) this.boss.isAttacking = false;
            }
        }
    }

    updateGwynAI(delta, dist, targetAngle) {
        if (dist > 3.8 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 4.8 : 3.8;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
            this.boss._hit2 = false;
            this.boss._hit3 = false;
            this.boss._chargeDir = new THREE.Vector3(Math.sin(targetAngle), 0, Math.cos(targetAngle));
            this.boss.cooldown = this.boss.isPhase2 ? 1.5 : 2.2;

            const roll = Math.random();
            if (roll < 0.5) {
                this.boss.attackType = 'SUNLIGHT_COMBO';
                this.audio.playSwing(false);
            } else if (roll < 0.8) {
                this.boss.attackType = 'SUNLIGHT_BURST';
                this.audio.playSunlightFlame();
            } else {
                this.boss.attackType = 'FLAME_THRUST';
                this.audio.playSwing(true);
            }
        }

        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackType === 'SUNLIGHT_COMBO') {
                if (this.boss.attackTime >= 0.20 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 4.0) this.damagePlayer(Math.round(this.boss.damage * 0.4), this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 0.44 && !this.boss._hit2) {
                    this.boss._hit2 = true;
                    this.audio.playSwing(false);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 4.0) this.damagePlayer(Math.round(this.boss.damage * 0.4), this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 0.72 && !this.boss._hit3) {
                    this.boss._hit3 = true;
                    this.audio.playSunlightFlame();
                    this.game.shakeCamera(0.4, 0.5);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 4.5) this.damagePlayer(Math.round(this.boss.damage * 0.7), this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 1.05) this.boss.isAttacking = false;
            } else if (this.boss.attackType === 'SUNLIGHT_BURST') {
                if (this.boss.attackTime >= 0.45 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.game.shakeCamera(0.4, 0.55);
                    this.world.spawnSunlightBurst(this.boss.mesh.position);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 5.5) this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 0.85) this.boss.isAttacking = false;
            } else {
                if (this.boss.attackTime < 0.35) {
                    this.boss.mesh.position.addScaledVector(this.boss._chargeDir, 6.0 * delta);
                }
                if (this.boss.attackTime >= 0.35 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.game.shakeCamera(0.3, 0.4);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 4.2) this.damagePlayer(Math.round(this.boss.damage * 0.85), this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 0.7) this.boss.isAttacking = false;
            }
        }
    }

    updateNitoAI(delta, dist, targetAngle) {
        const u = this.boss.mesh.userData;
        if (u.maskFather) u.maskFather.rotation.y = Math.sin(this.boss.animTime * 2.0) * 0.25;
        if (u.maskMother) u.maskMother.rotation.y = Math.cos(this.boss.animTime * 1.8) * 0.25;
        if (u.maskChild) u.maskChild.rotation.y = -Math.sin(this.boss.animTime * 2.2) * 0.25;

        if (dist > 4.2 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 3.2 : 2.2;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
            this.boss.cooldown = this.boss.isPhase2 ? 1.6 : 2.4;

            const roll = Math.random();
            if (roll < 0.45) {
                this.boss.attackType = 'CLEAVE';
                if (u.rightShoulder) {
                    u.rightShoulder.rotation.x = -0.8;
                    u.rightShoulder.rotation.y = 0.5;
                }
                this.audio.playSwing(true);
            } else if (roll < 0.75) {
                this.boss.attackType = 'SWORD_DANCE';
                this.audio.playBossRoar();
                this.game.showNotification("GRAVELORD SWORD DANCE ERUPTION!");
                this.boss._targetPos = this.game.playerMesh.position.clone();
            } else {
                this.boss.attackType = 'MIASMA_NOVA';
                this.game.showNotification("MIASMA DEATH NOVA!");
            }
        }

        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackType === 'CLEAVE') {
                if (this.boss.attackTime >= 0.65 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    if (u.rightShoulder) {
                        u.rightShoulder.rotation.x = 1.2;
                        u.rightShoulder.rotation.y = -0.6;
                    }
                    this.game.shakeCamera(0.35, 0.45);
                    this.world.spawnHitSparks(this.boss.mesh.position, true);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 5.2) this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 0.95) {
                    if (u.rightShoulder) u.rightShoulder.rotation.set(0, 0, 0);
                    this.boss.isAttacking = false;
                }
            } else if (this.boss.attackType === 'SWORD_DANCE') {
                if (this.boss.attackTime >= 0.85 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.audio.playBossSlam();
                    this.game.shakeCamera(0.4, 0.55);
                    const target = this.boss._targetPos || this.boss.mesh.position;
                    this.world.spawnSunlightBurst(target);
                    const hitDist = this.game.playerMesh.position.distanceTo(target);
                    if (hitDist < 3.2) this.damagePlayer(Math.round(this.boss.damage * 0.9), target);
                }
                if (this.boss.attackTime >= 1.2) this.boss.isAttacking = false;
            } else {
                if (this.boss.attackTime >= 0.9 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.game.shakeCamera(0.5, 0.65);
                    this.world.spawnHitSparks(this.boss.mesh.position, true);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 6.2) this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 1.35) this.boss.isAttacking = false;
            }
        }
    }

    updateAsylumAI(delta, dist, targetAngle) {
        const u = this.boss.mesh.userData;
        if (u.leftWingGroup && u.rightWingGroup) {
            u.leftWingGroup.rotation.y = Math.sin(this.boss.animTime * 4) * 0.3;
            u.rightWingGroup.rotation.y = -Math.sin(this.boss.animTime * 4) * 0.3;
        }

        if (dist > 4.0 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 3.4 : 2.4;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
            this.boss.cooldown = this.boss.isPhase2 ? 1.8 : 2.5;

            const roll = Math.random();
            if (roll < 0.55) {
                this.boss.attackType = 'HAMMER_SMASH';
                this.audio.playBossRoar();
            } else {
                this.boss.attackType = 'JUMP_STOMP';
                this.audio.playBossRoar();
                this.game.showNotification("ASYLUM DEMON JUMP STOMP!");
            }
        }

        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackType === 'HAMMER_SMASH') {
                if (this.boss.attackTime >= 0.68 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.audio.playBossSlam();
                    this.game.shakeCamera(0.45, 0.55);
                    this.world.spawnHitSparks(this.boss.mesh.position, true);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 4.8) this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 1.1) this.boss.isAttacking = false;
            } else {
                if (this.boss.attackTime < 0.75) {
                    this.boss.mesh.position.y = Math.sin((this.boss.attackTime / 0.75) * Math.PI) * 3.0;
                }
                if (this.boss.attackTime >= 0.75 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.boss.mesh.position.y = 0;
                    this.audio.playBossSlam();
                    this.game.shakeCamera(0.55, 0.65);
                    this.world.spawnHitSparks(this.boss.mesh.position, true);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 5.8) this.damagePlayer(Math.round(this.boss.damage * 1.1), this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 1.3) this.boss.isAttacking = false;
            }
        }
    }

    updateGapingAI(delta, dist, targetAngle) {
        const u = this.boss.mesh.userData;
        if (u.tailGroup) u.tailGroup.rotation.y = Math.sin(this.boss.animTime * 3) * 0.4;
        if (u.rightHip && u.leftHip) {
            u.rightHip.rotation.x = Math.sin(this.boss.animTime * 6) * 0.35;
            u.leftHip.rotation.x = -Math.sin(this.boss.animTime * 6) * 0.35;
        }

        if (dist > 4.5 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 3.6 : 2.5;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
            this.boss._chargeDir = new THREE.Vector3(Math.sin(targetAngle), 0, Math.cos(targetAngle));
            this.boss.cooldown = this.boss.isPhase2 ? 2.0 : 2.8;

            const roll = Math.random();
            if (roll < 0.5) {
                this.boss.attackType = 'CHOMP';
                this.audio.playBossRoar();
                this.game.showNotification("GAPING DRAGON RIBCAGE CHOMP!");
            } else {
                this.boss.attackType = 'TAIL_SWEEP';
                this.audio.playSwing(true);
            }
        }

        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackType === 'CHOMP') {
                if (this.boss.attackTime < 0.6) {
                    this.boss.mesh.position.addScaledVector(this.boss._chargeDir, 5.0 * delta);
                }
                if (this.boss.attackTime >= 0.6 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.audio.playBossSlam();
                    this.game.shakeCamera(0.4, 0.5);
                    this.world.spawnHitSparks(this.boss.mesh.position, true);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 5.5) this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 1.2) this.boss.isAttacking = false;
            } else {
                if (u.tailGroup) u.tailGroup.rotation.y = Math.sin(this.boss.attackTime * 8) * 1.2;
                if (this.boss.attackTime >= 0.45 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.game.shakeCamera(0.3, 0.4);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 4.8) this.damagePlayer(Math.round(this.boss.damage * 0.8), this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 0.9) this.boss.isAttacking = false;
            }
        }
    }

    updateQuelaagAI(delta, dist, targetAngle) {
        const u = this.boss.mesh.userData;
        if (u.legGroups) {
            u.legGroups.forEach((lg, idx) => {
                lg.rotation.x = Math.sin(this.boss.animTime * 8 + idx) * 0.25;
            });
        }

        if (dist > 4.2 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 4.2 : 3.0;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
            this.boss._hit2 = false;
            this.boss.cooldown = this.boss.isPhase2 ? 1.6 : 2.3;

            const roll = Math.random();
            if (roll < 0.6) {
                this.boss.attackType = 'FURYSWORD';
                this.audio.playSwing(false);
            } else {
                this.boss.attackType = 'MAGMA';
                this.audio.playSunlightFlame();
                this.game.showNotification("QUELAAG CHAOS MAGMA ERUPTION!");
            }
        }

        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackType === 'FURYSWORD') {
                if (this.boss.attackTime >= 0.25 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 4.2) this.damagePlayer(Math.round(this.boss.damage * 0.5), this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 0.52 && !this.boss._hit2) {
                    this.boss._hit2 = true;
                    this.audio.playSwing(true);
                    this.game.shakeCamera(0.3, 0.4);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 4.5) this.damagePlayer(Math.round(this.boss.damage * 0.7), this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 0.85) this.boss.isAttacking = false;
            } else {
                if (this.boss.attackTime >= 0.6 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.world.spawnSunlightBurst(this.boss.mesh.position);
                    this.game.shakeCamera(0.4, 0.5);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 5.4) this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 1.1) this.boss.isAttacking = false;
            }
        }
    }

    updateButterflyAI(delta, dist, targetAngle) {
        const u = this.boss.mesh.userData;
        if (u.leftWingGroup && u.rightWingGroup) {
            u.leftWingGroup.rotation.y = Math.sin(this.boss.animTime * 6) * 0.45;
            u.rightWingGroup.rotation.y = -Math.sin(this.boss.animTime * 6) * 0.45;
        }
        this.boss.mesh.position.y = 3.6 + Math.sin(this.boss.animTime * 2) * 0.6;

        if (dist > 7.0 && !this.boss.isAttacking) {
            const speed = 2.6;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
            this.boss.cooldown = 2.4;
            this.audio.playBellToll();
            this.game.showNotification("MOONLIGHT HOMING CRYSTAL DARTS!");
        }

        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.7 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.world.spawnHitSparks(this.boss.mesh.position, true);
                this.game.shakeCamera(0.2, 0.3);
                const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                if (hitDist < 9.0) this.damagePlayer(this.boss.damage, this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 1.1) this.boss.isAttacking = false;
        }
    }

    updateIronGolemAI(delta, dist, targetAngle) {
        if (dist > 4.2 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 3.2 : 2.2;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
            this.boss.cooldown = this.boss.isPhase2 ? 1.8 : 2.6;

            const roll = Math.random();
            if (roll < 0.55) {
                this.boss.attackType = 'AXE_SLAM';
                this.audio.playBossSlam();
            } else {
                this.boss.attackType = 'WIND_WAVE';
                this.audio.playSwing(true);
                this.game.showNotification("IRON GOLEM VACUUM WIND SLICE!");
            }
        }

        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackType === 'AXE_SLAM') {
                if (this.boss.attackTime >= 0.65 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.game.shakeCamera(0.45, 0.55);
                    this.world.spawnHitSparks(this.boss.mesh.position, true);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 4.8) this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 1.15) this.boss.isAttacking = false;
            } else {
                if (this.boss.attackTime >= 0.48 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.game.shakeCamera(0.35, 0.45);
                    this.world.spawnHitSparks(this.boss.mesh.position, false);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 7.2) this.damagePlayer(Math.round(this.boss.damage * 0.85), this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 0.9) this.boss.isAttacking = false;
            }
        }
    }

    updateOrnsteinAI(delta, dist, targetAngle) {
        const u = this.boss.mesh.userData;
        // Plume undulation
        if (u.plumeGroup) {
            u.plumeGroup.rotation.y = Math.sin(this.boss.animTime * 6) * 0.25;
        }

        if (dist > 4.5 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 5.2 : 4.0;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
            this.boss.mesh.position.x = Math.max(-15.0, Math.min(15.0, this.boss.mesh.position.x));
            this.boss.mesh.position.z = Math.max(98.0, Math.min(162.0, this.boss.mesh.position.z));

            // Leg stride animation
            if (u.rightHip && u.leftHip) {
                const stride = Math.sin(this.boss.animTime * 8);
                u.rightHip.rotation.x = stride * 0.55;
                u.leftHip.rotation.x = -stride * 0.55;
            }
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
            this.boss._chargeDir = new THREE.Vector3(Math.sin(targetAngle), 0, Math.cos(targetAngle));
            this.boss.cooldown = this.boss.isPhase2 ? 1.5 : 2.2;

            const roll = Math.random();
            if (roll < 0.6) {
                this.boss.attackType = 'SUPERSONIC_THRUST';
                this.audio.playSwing(false);
            } else {
                this.boss.attackType = 'LIGHTNING_IMPALE';
                this.audio.playBellToll();
                this.game.showNotification("ORNSTEIN LIGHTNING IMPALE!");
            }
        }

        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackType === 'SUPERSONIC_THRUST') {
                if (this.boss.attackTime < 0.38) {
                    const toPlayerDist = this.boss.mesh.position.distanceTo(this.game.playerMesh.position);
                    if (toPlayerDist > (this.boss.radius || 2.0) + 0.8) {
                        this.boss.mesh.position.addScaledVector(this.boss._chargeDir, 8.5 * delta);
                    }
                    this.boss.mesh.position.x = Math.max(-15.0, Math.min(15.0, this.boss.mesh.position.x));
                    this.boss.mesh.position.z = Math.max(98.0, Math.min(162.0, this.boss.mesh.position.z));
                }
                if (this.boss.attackTime >= 0.38 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.audio.playParry();
                    this.game.shakeCamera(0.3, 0.4);
                    this.world.spawnHitSparks(this.boss.mesh.position, true);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 4.8) this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 0.7) this.boss.isAttacking = false;
            } else {
                if (this.boss.attackTime < 0.55) {
                    this.boss.mesh.position.y = Math.sin((this.boss.attackTime / 0.55) * Math.PI) * 2.2;
                }
                if (this.boss.attackTime >= 0.55 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.boss.mesh.position.y = 0;
                    this.audio.playBossSlam();
                    this.game.shakeCamera(0.45, 0.55);
                    this.world.spawnSunlightBurst(this.boss.mesh.position);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 5.2) this.damagePlayer(Math.round(this.boss.damage * 0.9), this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 0.95) this.boss.isAttacking = false;
            }
        }
    }

    updateSmoughAI(delta, dist, targetAngle) {
        if (dist > 4.2 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 3.8 : 2.8;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
            this.boss.cooldown = this.boss.isPhase2 ? 1.7 : 2.5;

            const roll = Math.random();
            if (roll < 0.55) {
                this.boss.attackType = 'HAMMER_SWEEP';
                this.audio.playSwing(true);
            } else {
                this.boss.attackType = 'BUTT_SLAM';
                this.audio.playBossRoar();
                this.game.showNotification("SMOUGH LIGHTNING BUTT SLAM!");
            }
        }

        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackType === 'HAMMER_SWEEP') {
                if (this.boss.attackTime >= 0.6 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.audio.playBossSlam();
                    this.game.shakeCamera(0.45, 0.55);
                    this.world.spawnHitSparks(this.boss.mesh.position, true);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 5.2) this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 1.1) this.boss.isAttacking = false;
            } else {
                if (this.boss.attackTime < 0.72) {
                    this.boss.mesh.position.y = Math.sin((this.boss.attackTime / 0.72) * Math.PI) * 2.8;
                }
                if (this.boss.attackTime >= 0.72 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.boss.mesh.position.y = 0;
                    this.audio.playBossSlam();
                    this.game.shakeCamera(0.55, 0.7);
                    this.world.spawnSunlightBurst(this.boss.mesh.position);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 6.0) this.damagePlayer(Math.round(this.boss.damage * 1.1), this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 1.25) this.boss.isAttacking = false;
            }
        }
    }

    updateArtoriasAI(delta, dist, targetAngle) {
        if (dist > 4.5 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 5.0 : 3.8;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
            this.boss._chargeDir = new THREE.Vector3(Math.sin(targetAngle), 0, Math.cos(targetAngle));
            this.boss.cooldown = this.boss.isPhase2 ? 1.6 : 2.2;

            const roll = Math.random();
            if (roll < 0.6) {
                this.boss.attackType = 'SOMERSAULT_SLAM';
                this.audio.playWolfHowl();
                this.game.showNotification("ARTORIAS SOMERSAULT ABYSS SLAM!");
            } else {
                this.boss.attackType = 'PIERCING_THRUST';
                this.audio.playSwing(false);
            }
        }

        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackType === 'SOMERSAULT_SLAM') {
                if (this.boss.attackTime < 0.52) {
                    this.boss.mesh.rotation.x += delta * (Math.PI * 2 / 0.52);
                    this.boss.mesh.position.addScaledVector(this.boss._chargeDir, 4.5 * delta);
                    this.boss.mesh.position.y = Math.sin((this.boss.attackTime / 0.52) * Math.PI) * 2.2;
                }
                if (this.boss.attackTime >= 0.52 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.boss.mesh.position.y = 0;
                    this.boss.mesh.rotation.x = 0;
                    this.audio.playBossSlam();
                    this.game.shakeCamera(0.45, 0.55);
                    this.world.spawnHitSparks(this.boss.mesh.position, true);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 5.2) this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 0.95) this.boss.isAttacking = false;
            } else {
                if (this.boss.attackTime < 0.36) {
                    this.boss.mesh.position.addScaledVector(this.boss._chargeDir, 7.5 * delta);
                }
                if (this.boss.attackTime >= 0.36 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.game.shakeCamera(0.3, 0.4);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 4.4) this.damagePlayer(Math.round(this.boss.damage * 0.85), this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 0.7) this.boss.isAttacking = false;
            }
        }
    }

    updateManusAI(delta, dist, targetAngle) {
        if (dist > 4.5 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 4.5 : 3.2;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
            this.boss._hit2 = false;
            this.boss.cooldown = this.boss.isPhase2 ? 1.6 : 2.4;

            const roll = Math.random();
            if (roll < 0.6) {
                this.boss.attackType = 'CLAW_RAKE';
                this.audio.playBossRoar();
            } else {
                this.boss.attackType = 'DARK_BEAD';
                this.audio.playSunlightFlame();
                this.game.showNotification("MANUS DARK BEAD VOID BARRAGE!");
            }
        }

        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackType === 'CLAW_RAKE') {
                if (this.boss.attackTime >= 0.22 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 4.8) this.damagePlayer(Math.round(this.boss.damage * 0.45), this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 0.58 && !this.boss._hit2) {
                    this.boss._hit2 = true;
                    this.audio.playBossSlam();
                    this.game.shakeCamera(0.45, 0.55);
                    this.world.spawnHitSparks(this.boss.mesh.position, true);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 5.5) this.damagePlayer(Math.round(this.boss.damage * 0.8), this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 0.95) this.boss.isAttacking = false;
            } else {
                if (this.boss.attackTime >= 0.65 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.game.shakeCamera(0.4, 0.5);
                    this.world.spawnSunlightBurst(this.boss.mesh.position);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 7.0) this.damagePlayer(Math.round(this.boss.damage * 0.9), this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 1.1) this.boss.isAttacking = false;
            }
        }
    }

    updateKalameetAI(delta, dist, targetAngle) {
        const u = this.boss.mesh.userData;
        if (u.leftWingGroup && u.rightWingGroup) {
            u.leftWingGroup.rotation.y = Math.sin(this.boss.animTime * 5) * 0.35;
            u.rightWingGroup.rotation.y = -Math.sin(this.boss.animTime * 5) * 0.35;
        }

        if (dist > 5.0 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 4.6 : 3.4;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
            this.boss.cooldown = this.boss.isPhase2 ? 1.8 : 2.5;

            const roll = Math.random();
            if (roll < 0.5) {
                this.boss.attackType = 'BLACK_FLAME';
                this.audio.playFireBreath();
                this.game.showNotification("KALAMEET BLACK FLAME BREATH!");
            } else {
                this.boss.attackType = 'CALAMITY_CURSE';
                this.audio.playWolfHowl();
                this.game.showNotification("CALAMITY EYE TELEKINETIC CURSE!");
                if (u.eyeLight) u.eyeLight.intensity = 8.0;
            }
        }

        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackType === 'BLACK_FLAME') {
                if (this.boss.attackTime >= 0.6 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    this.game.shakeCamera(0.35, 0.45);
                    this.world.spawnFlameBreath(this.boss.mesh.position, new THREE.Vector3(Math.sin(targetAngle), 0, Math.cos(targetAngle)));
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 6.8) this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 1.1) this.boss.isAttacking = false;
            } else {
                if (this.boss.attackTime >= 0.68 && !this.boss._hit1) {
                    this.boss._hit1 = true;
                    if (u.eyeLight) u.eyeLight.intensity = 3.5;
                    this.audio.playBossSlam();
                    this.game.shakeCamera(0.45, 0.55);
                    this.world.spawnSunlightBurst(this.game.playerMesh.position);
                    const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                    if (hitDist < 8.0) this.damagePlayer(Math.round(this.boss.damage * 0.95), this.boss.mesh.position);
                }
                if (this.boss.attackTime >= 1.2) {
                    if (u.eyeLight) u.eyeLight.intensity = 0;
                    this.boss.isAttacking = false;
                }
            }
        }
    }

    // ====================================================
    // BOSS 41-60 AI CONTROLLERS (BLOODBORNE, DS2, DS3, SEKIRO, ELDEN RING)
    // ====================================================

    updateLudwigAI(delta, dist, targetAngle) {
        const u = this.boss.mesh.userData;
        const speed = 4.0;
        if (dist > 4.5 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
        }
        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.65 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.audio.playBossSlam();
                this.game.shakeCamera(0.4, 0.5);
                this.world.spawnSunlightBurst(this.boss.mesh.position);
                if (dist < 5.5) this.damagePlayer(Math.round(this.boss.damage * 1.1), this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 1.1) {
                this.boss.isAttacking = false;
                this.boss.cooldown = 2.0;
            }
        }
    }

    updateLadyMariaAI(delta, dist, targetAngle) {
        const u = this.boss.mesh.userData;
        const speed = 5.2; // Hyper-agile hunter
        if (dist > 3.2 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
        }
        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.45 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.audio.playAttack();
                this.world.spawnBloodSparks(this.game.playerMesh.position);
                if (dist < 4.5) this.damagePlayer(Math.round(this.boss.damage * 0.95), this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 0.85) {
                this.boss.isAttacking = false;
                this.boss.cooldown = 1.4;
            }
        }
    }

    updateOrphanOfKosAI(delta, dist, targetAngle) {
        const speed = 4.8;
        if (dist > 4.2 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
        }
        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.55 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.audio.playBossSlam();
                this.game.shakeCamera(0.45, 0.5);
                this.world.spawnHitSparks(this.boss.mesh.position, true);
                if (dist < 5.2) this.damagePlayer(this.boss.damage, this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 1.0) {
                this.boss.isAttacking = false;
                this.boss.cooldown = 1.8;
            }
        }
    }

    updateFatherGascoigneAI(delta, dist, targetAngle) {
        const speed = 4.4;
        if (dist > 3.6 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
        }
        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.5 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.audio.playAttack();
                this.world.spawnHitSparks(this.boss.mesh.position, false);
                if (dist < 4.8) this.damagePlayer(Math.round(this.boss.damage * 0.9), this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 0.9) {
                this.boss.isAttacking = false;
                this.boss.cooldown = 1.6;
            }
        }
    }

    updateDarklurkerAI(delta, dist, targetAngle) {
        const speed = 3.6;
        if (dist > 5.0 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
        }
        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.65 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.audio.playBellToll();
                this.world.spawnSunlightBurst(this.boss.mesh.position);
                if (dist < 6.0) this.damagePlayer(this.boss.damage, this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 1.1) {
                this.boss.isAttacking = false;
                this.boss.cooldown = 2.2;
            }
        }
    }

    updateVelstadtAI(delta, dist, targetAngle) {
        const speed = 3.2;
        if (dist > 4.2 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
        }
        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.75 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.audio.playBellToll();
                this.game.shakeCamera(0.5, 0.6);
                if (dist < 5.5) this.damagePlayer(Math.round(this.boss.damage * 1.2), this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 1.3) {
                this.boss.isAttacking = false;
                this.boss.cooldown = 2.2;
            }
        }
    }

    updateIvoryKingAI(delta, dist, targetAngle) {
        const speed = 4.2;
        if (dist > 4.0 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
        }
        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.6 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.audio.playBossSlam();
                this.world.spawnSunlightBurst(this.boss.mesh.position);
                if (dist < 5.2) this.damagePlayer(this.boss.damage, this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 1.05) {
                this.boss.isAttacking = false;
                this.boss.cooldown = 1.9;
            }
        }
    }

    updateDragonriderAI(delta, dist, targetAngle) {
        const speed = 3.3;
        if (dist > 4.0 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
        }
        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.65 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.audio.playBossSlam();
                this.game.shakeCamera(0.35, 0.4);
                if (dist < 5.0) this.damagePlayer(Math.round(this.boss.damage * 0.95), this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 1.1) {
                this.boss.isAttacking = false;
                this.boss.cooldown = 2.0;
            }
        }
    }

    updateTwinPrincesAI(delta, dist, targetAngle) {
        const speed = 3.8;
        if (dist > 4.2 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
        }
        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.7 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.audio.playBellToll();
                this.world.spawnSunlightBurst(this.boss.mesh.position);
                if (dist < 5.6) this.damagePlayer(Math.round(this.boss.damage * 1.15), this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 1.2) {
                this.boss.isAttacking = false;
                this.boss.cooldown = 2.1;
            }
        }
    }

    updateDragonslayerArmourAI(delta, dist, targetAngle) {
        const speed = 3.6;
        if (dist > 4.4 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
        }
        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.75 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.audio.playBossSlam();
                this.game.shakeCamera(0.55, 0.65);
                this.world.spawnHitSparks(this.boss.mesh.position, true);
                if (dist < 5.8) this.damagePlayer(Math.round(this.boss.damage * 1.25), this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 1.35) {
                this.boss.isAttacking = false;
                this.boss.cooldown = 2.3;
            }
        }
    }

    updateSisterFriedeAI(delta, dist, targetAngle) {
        const speed = 5.0;
        if (dist > 3.6 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
        }
        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.45 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.audio.playAttack();
                this.world.spawnBloodSparks(this.game.playerMesh.position);
                if (dist < 4.8) this.damagePlayer(Math.round(this.boss.damage * 0.95), this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 0.85) {
                this.boss.isAttacking = false;
                this.boss.cooldown = 1.5;
            }
        }
    }

    updateChampionGundyrAI(delta, dist, targetAngle) {
        const speed = 4.6;
        if (dist > 4.0 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
        }
        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.55 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.audio.playBossSlam();
                this.game.shakeCamera(0.45, 0.5);
                if (dist < 5.2) this.damagePlayer(Math.round(this.boss.damage * 1.1), this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 1.0) {
                this.boss.isAttacking = false;
                this.boss.cooldown = 1.7;
            }
        }
    }

    updateDarkeaterMidirAI(delta, dist, targetAngle) {
        const speed = 3.6;
        if (dist > 6.0 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
        }
        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.8 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.audio.playBossSlam();
                this.game.shakeCamera(0.6, 0.7);
                this.world.spawnSunlightBurst(this.boss.mesh.position);
                if (dist < 7.5) this.damagePlayer(Math.round(this.boss.damage * 1.3), this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 1.45) {
                this.boss.isAttacking = false;
                this.boss.cooldown = 2.5;
            }
        }
    }

    updateGodfreyAI(delta, dist, targetAngle) {
        const speed = 4.2;
        if (dist > 4.4 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
        }
        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.7 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.audio.playBossSlam();
                this.game.shakeCamera(0.6, 0.65);
                this.world.spawnHitSparks(this.boss.mesh.position, true);
                if (dist < 6.0) this.damagePlayer(Math.round(this.boss.damage * 1.2), this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 1.3) {
                this.boss.isAttacking = false;
                this.boss.cooldown = 2.1;
            }
        }
    }

    updateMalikethAI(delta, dist, targetAngle) {
        const speed = 5.2; // Acrobatic & lethal
        if (dist > 4.2 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
        }
        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.55 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.audio.playAttack();
                this.game.shakeCamera(0.45, 0.5);
                this.world.spawnHitSparks(this.boss.mesh.position, true);
                if (dist < 5.5) this.damagePlayer(Math.round(this.boss.damage * 1.15), this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 1.0) {
                this.boss.isAttacking = false;
                this.boss.cooldown = 1.7;
            }
        }
    }

    updateMohgAI(delta, dist, targetAngle) {
        const speed = 3.6;
        if (dist > 4.4 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
        }
        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.65 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.audio.playBellToll();
                this.world.spawnBloodSparks(this.game.playerMesh.position);
                if (dist < 5.8) this.damagePlayer(Math.round(this.boss.damage * 1.1), this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 1.2) {
                this.boss.isAttacking = false;
                this.boss.cooldown = 2.0;
            }
        }
    }

    updateMorgottAI(delta, dist, targetAngle) {
        const speed = 4.4;
        if (dist > 4.0 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
        }
        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.55 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.audio.playAttack();
                this.world.spawnSunlightBurst(this.boss.mesh.position);
                if (dist < 5.2) this.damagePlayer(this.boss.damage, this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 1.05) {
                this.boss.isAttacking = false;
                this.boss.cooldown = 1.8;
            }
        }
    }

    updateRykardAI(delta, dist, targetAngle) {
        const speed = 3.0;
        if (dist > 5.5 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
        }
        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.85 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.audio.playBossSlam();
                this.game.shakeCamera(0.65, 0.7);
                this.world.spawnSunlightBurst(this.boss.mesh.position);
                if (dist < 7.0) this.damagePlayer(Math.round(this.boss.damage * 1.25), this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 1.5) {
                this.boss.isAttacking = false;
                this.boss.cooldown = 2.4;
            }
        }
    }

    updateIsshinAI(delta, dist, targetAngle) {
        const speed = 5.2; // Sword saint agility
        if (dist > 3.8 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
        }
        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.45 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.audio.playAttack();
                this.game.shakeCamera(0.35, 0.4);
                this.world.spawnHitSparks(this.game.playerMesh.position, false);
                if (dist < 5.2) this.damagePlayer(Math.round(this.boss.damage * 1.05), this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 0.9) {
                this.boss.isAttacking = false;
                this.boss.cooldown = 1.4;
            }
        }
    }

    updateEldenBeastAI(delta, dist, targetAngle) {
        const speed = 3.5;
        if (dist > 6.0 && !this.boss.isAttacking) {
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (!this.boss.isAttacking && this.boss.cooldown <= 0) {
            this.boss.isAttacking = true;
            this.boss.attackTime = 0;
            this.boss._hit1 = false;
        }
        if (this.boss.isAttacking) {
            this.boss.attackTime += delta;
            if (this.boss.attackTime >= 0.85 && !this.boss._hit1) {
                this.boss._hit1 = true;
                this.audio.playBellToll();
                this.game.shakeCamera(0.65, 0.75);
                this.world.spawnSunlightBurst(this.boss.mesh.position);
                if (dist < 7.5) this.damagePlayer(Math.round(this.boss.damage * 1.35), this.boss.mesh.position);
            }
            if (this.boss.attackTime >= 1.5) {
                this.boss.isAttacking = false;
                this.boss.cooldown = 2.6;
            }
        }
    }

}
