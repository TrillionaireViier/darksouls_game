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
            }
        };
        this.currentWeaponId = 'sword';
        this.unlockedWeapons = ['sword', 'torch'];
        this.charcoalResinTimer = 0;
        this.projectiles = [];

        // Pre-allocated scratch vectors for zero-allocation 60 FPS animation/combat updates
        this._scratchToPlayer = new THREE.Vector3();
        this._scratchDir = new THREE.Vector3();
        this._scratchForward = new THREE.Vector3();

        // 16 LORDS OF LORDRAN: PROGRESSIVE BOSS ROSTER (Smooth Unlock Sequence)
        this.bossRoster = [
            {
                id: 'asylum',
                name: 'ASYLUM DEMON',
                title: 'Northern Undead Asylum &bull; Great Demon Hammer & Butt Slam',
                icon: '👹',
                maxHp: 2000,
                damage: 230,
                souls: 4000,
                radius: 2.7,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createAsylumDemon(x, z)
            },
            {
                id: 'taurus',
                name: 'TAURUS DEMON',
                title: 'Undead Burg Bridge &bull; Great Stone Hammer & Ground Slam',
                icon: '🐂',
                maxHp: 2400,
                damage: 270,
                souls: 5000,
                radius: 2.5,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createTaurusDemon(x, z)
            },
            {
                id: 'gargoyle',
                name: 'BELL GARGOYLE',
                title: 'Undead Parish Belfry &bull; Bronze Halberd, Stone Wings & Flame Breath',
                icon: '🗿',
                maxHp: 2600,
                damage: 260,
                souls: 7500,
                radius: 2.8,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createBellGargoyle(x, z)
            },
            {
                id: 'capra',
                name: 'CAPRA DEMON',
                title: 'Lower Undead Burg &bull; Dual Jagged Demon Great Machetes',
                icon: '🐐',
                maxHp: 2500,
                damage: 310,
                souls: 8000,
                radius: 2.4,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createCapraDemon(x, z)
            },
            {
                id: 'gaping',
                name: 'GAPING DRAGON',
                title: 'Depths &bull; Colossal Ribcage Maw, Acid Spit & Tail Sweep',
                icon: '🐉',
                maxHp: 3200,
                damage: 300,
                souls: 10000,
                radius: 3.5,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createGapingDragon(x, z)
            },
            {
                id: 'quelaag',
                name: 'CHAOS WITCH QUELAAG',
                title: 'Blighttown Swamps &bull; Flaming Furysword & Magma Lava Pools',
                icon: '🕷️',
                maxHp: 3100,
                damage: 310,
                souls: 12000,
                radius: 3.2,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createChaosWitchQuelaag(x, z)
            },
            {
                id: 'butterfly',
                name: 'MOONLIGHT BUTTERFLY',
                title: 'Darkroot Ruins &bull; Luminescent Wings, Homing Magic & Crystal Laser',
                icon: '🦋',
                maxHp: 2700,
                damage: 270,
                souls: 9000,
                radius: 3.0,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createMoonlightButterfly(x, z)
            },
            {
                id: 'iron_golem',
                name: 'IRON GOLEM',
                title: "Sen's Fortress Ramparts &bull; Giant Core Axe & Wind Wave Whirlwind",
                icon: '🤖',
                maxHp: 3400,
                damage: 340,
                souls: 14000,
                radius: 3.0,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createIronGolem(x, z)
            },
            {
                id: 'ornstein',
                name: 'DRAGONSLAYER ORNSTEIN',
                title: 'Anor Londo Cathedral &bull; Lightning Cross-Spear & Supersonic Thrust',
                icon: '⚡',
                maxHp: 3000,
                damage: 330,
                souls: 16000,
                radius: 2.6,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createDragonslayerOrnstein(x, z)
            },
            {
                id: 'smough',
                name: 'EXECUTIONER SMOUGH',
                title: 'Anor Londo Cathedral &bull; Colossal Gilded War Hammer & Butt Slam',
                icon: '🔨',
                maxHp: 3800,
                damage: 360,
                souls: 16000,
                radius: 3.2,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createExecutionerSmough(x, z)
            },
            {
                id: 'sif',
                name: 'GREAT GREY WOLF SIF',
                title: 'Darkroot Garden &bull; Artorias Greatsword & 360° Whirlwind Spin',
                icon: '🐺',
                maxHp: 3300,
                damage: 340,
                souls: 15000,
                radius: 3.4,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createWolfSif(x, z)
            },
            {
                id: 'artorias',
                name: 'KNIGHT ARTORIAS',
                title: 'Oolacile Abyss &bull; Somersault Abyss Slam, Sludge Blast & Dark Thrust',
                icon: '🗡️',
                maxHp: 3600,
                damage: 370,
                souls: 20000,
                radius: 2.7,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createKnightArtorias(x, z)
            },
            {
                id: 'manus',
                name: 'MANUS, FATHER OF THE ABYSS',
                title: 'Chasm of Abyss &bull; Primeval Monstrous Dark Arm, Claws & Dark Beads',
                icon: '👁️',
                maxHp: 4200,
                damage: 390,
                souls: 24000,
                radius: 3.5,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createManusFatherOfAbyss(x, z)
            },
            {
                id: 'kalameet',
                name: 'BLACK DRAGON KALAMEET',
                title: 'Royal Wood &bull; Black Flame Breath, 4 Wings & Calamity Telekinesis',
                icon: '🦇',
                maxHp: 4000,
                damage: 380,
                souls: 25000,
                radius: 3.8,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createBlackDragonKalameet(x, z)
            },
            {
                id: 'nito',
                name: 'GRAVELORD NITO',
                title: 'Tomb of the Dead &bull; Sarcophagus of Skeletons, Miasma & Gravelord Greatsword',
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
                name: 'GWYN, LORD OF CINDER',
                title: 'Kiln of First Flame &bull; Flaming Sunlight Greatsword & Sun Burst',
                icon: '☀️',
                maxHp: 4500,
                damage: 410,
                souls: 35000,
                radius: 2.7,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createGwynLordOfCinder(x, z)
            },
            {
                id: 'stray_demon',
                name: 'STRAY DEMON',
                title: 'Northern Undead Asylum Depths &bull; Great Demon Hammer & Tremor Magic Explosions',
                icon: '👹',
                maxHp: 3200,
                damage: 290,
                souls: 12000,
                radius: 2.8,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createStrayDemon(x, z)
            },
            {
                id: 'demon_firesage',
                name: 'DEMON FIRESAGE',
                title: 'Demon Ruins &bull; Catalyst of Lost Izalith & Flame Wave Explosions',
                icon: '🔥',
                maxHp: 3400,
                damage: 310,
                souls: 14000,
                radius: 2.8,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createDemonFiresage(x, z)
            },
            {
                id: 'centipede',
                name: 'CENTIPEDE DEMON',
                title: 'Lava Lake &bull; Severed Arm Tail Whip, Lava Leaps & Magma Stomp',
                icon: '🐛',
                maxHp: 3600,
                damage: 320,
                souls: 16000,
                radius: 2.9,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createCentipedeDemon(x, z)
            },
            {
                id: 'bed_of_chaos',
                name: 'BED OF CHAOS',
                title: 'Lost Izalith Heart &bull; Sweeping Flame Limbs, Scythe Branches & Firestorm',
                icon: '🌳',
                maxHp: 2800,
                damage: 340,
                souls: 20000,
                radius: 3.5,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createBedOfChaos(x, z)
            },
            {
                id: 'ceaseless',
                name: 'CEASLESS DISCHARGE',
                title: 'Demon Ruins Magma Core &bull; Colossal Magma Fists & Fiery Lava Waves',
                icon: '🌋',
                maxHp: 4200,
                damage: 360,
                souls: 22000,
                radius: 3.8,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createCeaselessDischarge(x, z)
            },
            {
                id: 'seath',
                name: 'SEATH THE SCALELESS',
                title: 'Crystal Cave &bull; Primordial Crystal, Tail Sweep & Cursing White Dragon Breath',
                icon: '🐉',
                maxHp: 4400,
                damage: 370,
                souls: 25000,
                radius: 3.5,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createSeathTheScaleless(x, z)
            },
            {
                id: 'four_kings',
                name: 'FOUR KINGS',
                title: 'The Abyss &bull; Darkwraith Greatswords, Lifedrain & Homing Void Blades',
                icon: '👑',
                maxHp: 4600,
                damage: 380,
                souls: 28000,
                radius: 3.0,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createFourKings(x, z)
            },
            {
                id: 'priscilla',
                name: 'CROSSBREED PRISCILLA',
                title: 'Painted World of Ariamis &bull; Lifehunt Scythe, Blizzard Veil & Snow Footsteps',
                icon: '❄️',
                maxHp: 3500,
                damage: 350,
                souls: 24000,
                radius: 2.2,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createCrossbreedPriscilla(x, z)
            },
            {
                id: 'gwyndolin',
                name: 'DARK SUN GWYNDOLIN',
                title: 'Anor Londo Darkmoon Tomb &bull; Moonlight Greatbow, Magic Orbs & Soul Spears',
                icon: '🌙',
                maxHp: 3300,
                damage: 340,
                souls: 26000,
                radius: 2.3,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createDarkSunGwyndolin(x, z)
            },
            {
                id: 'pinwheel',
                name: 'PINWHEEL',
                title: 'Catacombs Crypt &bull; Rite of Kindling, Triple Mask Clones & Fireball Barrage',
                icon: '🎭',
                maxHp: 2600,
                damage: 280,
                souls: 15000,
                radius: 2.0,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createPinwheel(x, z)
            },
            {
                id: 'sanctuary_guardian',
                name: 'SANCTUARY GUARDIAN',
                title: 'Oolacile Sanctuary &bull; Lightning Orbs, Wing Gusts & Venom Tail Sting',
                icon: '🦁',
                maxHp: 4000,
                damage: 360,
                souls: 30000,
                radius: 2.9,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createSanctuaryGuardian(x, z)
            },
            {
                id: 'pursuer',
                name: 'THE PURSUER',
                title: 'Forest of Fallen Giants &bull; Cursed Greatsword, Greatshield & Levitation Rush',
                icon: '🛡️',
                maxHp: 4200,
                damage: 370,
                souls: 32000,
                radius: 2.4,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createThePursuer(x, z)
            },
            {
                id: 'mirror_knight',
                name: 'LOOKING GLASS KNIGHT',
                title: 'King\'s Passage &bull; Mirror Greatshield, Thunder Call & Mirror Phantom Summon',
                icon: '🪞',
                maxHp: 4600,
                damage: 390,
                souls: 35000,
                radius: 2.8,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createLookingGlassKnight(x, z)
            },
            {
                id: 'fume_knight',
                name: 'FUME KNIGHT RAIME',
                title: 'Brume Tower Core &bull; Fume Ultra Greatsword, Dark Fire Sweep & Flame Thrust',
                icon: '⚔️',
                maxHp: 5000,
                damage: 420,
                souls: 40000,
                radius: 2.7,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createFumeKnight(x, z)
            },
            {
                id: 'sir_alonne',
                name: 'SIR ALONNE',
                title: 'Memory of Old Iron King &bull; Bewitched Alonne Katana & Blood Dark Thrust',
                icon: '🏯',
                maxHp: 4800,
                damage: 410,
                souls: 38000,
                radius: 2.3,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createSirAlonne(x, z)
            },
            {
                id: 'nameless_king',
                name: 'THE NAMELESS KING',
                title: 'Archdragon Peak &bull; Dragonslayer Swordspear, Storm Drake & Thunder Bolts',
                icon: '⚡',
                maxHp: 5200,
                damage: 440,
                souls: 45000,
                radius: 2.7,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createNamelessKing(x, z)
            },
            {
                id: 'abyss_watchers',
                name: 'ABYSS WATCHERS',
                title: 'Farron Keep Perimeter &bull; Wolf Knight Greatsword, Dagger Flurry & Flame Trails',
                icon: '🐺',
                maxHp: 4700,
                damage: 400,
                souls: 36000,
                radius: 2.3,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createAbyssWatchers(x, z)
            },
            {
                id: 'pontiff_sulyvahn',
                name: 'PONTIFF SULYVAHN',
                title: 'Irithyll Boreal Cathedral &bull; Profaned Flame Greatsword & Judgement Sorcery',
                icon: '🕯️',
                maxHp: 4900,
                damage: 415,
                souls: 39000,
                radius: 2.6,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createPontiffSulyvahn(x, z)
            },
            {
                id: 'slave_knight_gael',
                name: 'SLAVE KNIGHT GAEL',
                title: 'End of the World &bull; Executioner Greatsword, Blood Cape & Repeating Crossbow',
                icon: '🩸',
                maxHp: 5600,
                damage: 460,
                souls: 50000,
                radius: 2.6,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createSlaveKnightGael(x, z)
            },
            {
                id: 'soul_of_cinder',
                name: 'SOUL OF CINDER',
                title: 'Kiln of First Flame &bull; Coiled Sword, All Player Classes & Gwyn Remnant',
                icon: '🔥',
                maxHp: 6000,
                damage: 480,
                souls: 60000,
                radius: 2.7,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createSoulOfCinder(x, z)
            },
            {
                id: 'gorgon_medusa',
                name: 'MEDUSA, GORGON MATRIARCH',
                title: 'Sunken Serpent Sanctum &bull; Petrifying Gaze, Snake Hair & Venomous Tail Sweep',
                icon: '🐍',
                maxHp: 3200,
                damage: 290,
                souls: 12000,
                radius: 2.4,
                spawnPos: { x: 0, z: -95 },
                create: (cf, x, z) => cf.createGorgonMedusa(x, z)
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
        const posZ = (z !== null) ? z : (def.spawnPos ? def.spawnPos.z : 132);

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

        // Balanced Tactical Mob Spawning (No 570-mob swarm dog-piles at spawn)
        const mobList = (window.DarkSoulsLore && window.DarkSoulsLore.mobs) || window.DARK_SOULS_MOBS || [];
        if (mobList.length > 0) {
            let starterZoneCount = 0;
            const spawnedCoords = [];

            mobList.forEach(mobDef => {
                const pos = mobDef.defaultPos;
                if (!pos || (pos[0] === 0 && pos[1] === 0 && pos[2] === 0)) return;

                const dist = Math.sqrt(pos[0] * pos[0] + pos[2] * pos[2]);

                // Safe sanctuary zone: no mobs within 14m of bonfire / player start
                if (dist < 14.0) return;

                // Starter Bridge Encounter: Max 3 hollows along the roadway
                if (dist < 35.0) {
                    if (starterZoneCount >= 3) return;
                    starterZoneCount++;
                }

                // Minimum spacing between mobs (at least 9 meters) to prevent clumping
                const isTooClose = spawnedCoords.some(c => {
                    const dx = c[0] - pos[0];
                    const dz = c[1] - pos[2];
                    return (dx * dx + dz * dz) < 81.0;
                });
                if (isTooClose) return;

                spawnedCoords.push([pos[0], pos[2]]);
                this.createCustomMob(mobDef, pos[0], pos[2], 0, pos[1]);
            });
        } else {
            // Fallback starter hollows if lore list is uninitialized
            this.createHollowSoldier(-10, -10, 0, 0);
            this.createHollowSoldier(2, 22, Math.PI, 0);
            this.createHollowSoldier(-1, 55, Math.PI, 0);
            this.createHollowSoldier(20, 48, Math.PI, 6.0);
            this.createHollowSoldier(19, 78, Math.PI, 6.0);
            this.createHollowSoldier(-20, 42, 0, -5.0);
            this.createSkeletonWarriorEnemy(-20, 60, Math.PI, -5.0);
            this.createSkeletonWarriorEnemy(-22, 82, 0, -5.0);
            this.createSkeletonWarriorEnemy(-16, 108, Math.PI, -6.0);
            this.createSkeletonWarriorEnemy(-24, 134, 0, -6.0);
        }

        // Spawn Gorgons & Serpents in the Sunken Serpent Sanctum & Temple of the Gorgon
        const serpentSanctumMobs = [
            {
                id: 'gorgon_matriarch_elite',
                name: 'GORGON MATRIARCH ELITE',
                meshType: 'gorgon_medusa',
                hp: 1200,
                damage: 160,
                souls: 3500,
                speed: 2.8,
                attackReach: 3.2,
                behaviorType: 'Heavy Tank',
                pos: [0, -4.0, -96.0]
            },
            {
                id: 'gorgon_sister_viper_1',
                name: 'GORGON VIPER-WITCH',
                meshType: 'gorgon_medusa',
                hp: 680,
                damage: 95,
                souls: 1800,
                speed: 3.2,
                attackReach: 2.5,
                behaviorType: 'Flanker',
                pos: [-14.0, -2.5, -52.0]
            },
            {
                id: 'gorgon_sister_viper_2',
                name: 'GORGON VIPER-WITCH',
                meshType: 'gorgon_medusa',
                hp: 680,
                damage: 95,
                souls: 1800,
                speed: 3.2,
                attackReach: 2.5,
                behaviorType: 'Flanker',
                pos: [14.0, -2.5, -52.0]
            },
            {
                id: 'giant_pit_viper_1',
                name: 'GIANT PIT VIPER',
                meshType: 'giant_cobra',
                hp: 550,
                damage: 85,
                souls: 1400,
                speed: 3.0,
                attackReach: 2.8,
                behaviorType: 'Swarm',
                pos: [-8.0, -2.5, -44.0]
            },
            {
                id: 'giant_pit_viper_2',
                name: 'GIANT PIT VIPER',
                meshType: 'giant_cobra',
                hp: 550,
                damage: 85,
                souls: 1400,
                speed: 3.0,
                attackReach: 2.8,
                behaviorType: 'Swarm',
                pos: [8.0, -2.5, -44.0]
            },
            {
                id: 'giant_pit_viper_3',
                name: 'COLOSSAL TEMPLE COBRA',
                meshType: 'giant_cobra',
                hp: 850,
                damage: 120,
                souls: 2200,
                speed: 2.7,
                attackReach: 3.4,
                behaviorType: 'Heavy Tank',
                pos: [0, -4.0, -84.0]
            },
            {
                id: 'man_serpent_guard_1',
                name: 'MAN-SERPENT TEMPLE GUARD',
                meshType: 'man_serpent_warrior',
                hp: 620,
                damage: 110,
                souls: 1600,
                speed: 2.6,
                attackReach: 2.8,
                behaviorType: 'Heavy Tank',
                pos: [-5.0, 0, -28.0]
            },
            {
                id: 'man_serpent_guard_2',
                name: 'MAN-SERPENT TEMPLE GUARD',
                meshType: 'man_serpent_warrior',
                hp: 620,
                damage: 110,
                souls: 1600,
                speed: 2.6,
                attackReach: 2.8,
                behaviorType: 'Heavy Tank',
                pos: [5.0, 0, -28.0]
            }
        ];

        serpentSanctumMobs.forEach(sMob => {
            this.createCustomMob(sMob, sMob.pos[0], sMob.pos[2], 0, sMob.pos[1]);
        });

        // Tactical Undead Hollow Archers on High Ramparts (+6m), Overlooks, and Parapets
        const lordranArchers = [
            {
                id: 'undead_archer_tower',
                name: 'UNDEAD BURG RAMPART ARCHER',
                meshType: 'archer',
                isArcher: true,
                behaviorType: 'Ranged',
                aiType: 'Ranged',
                hp: 220,
                damage: 48,
                souls: 180,
                speed: 1.8,
                attackReach: 32.0,
                pos: [12.0, 6.0, 32.0]
            },
            {
                id: 'undead_archer_parapet',
                name: 'PARAPET HOLLOW SNIPER',
                meshType: 'archer',
                isArcher: true,
                behaviorType: 'Ranged',
                aiType: 'Ranged',
                hp: 240,
                damage: 52,
                souls: 220,
                speed: 1.8,
                attackReach: 35.0,
                pos: [-14.0, 6.0, 56.0]
            },
            {
                id: 'undead_archer_bridge',
                name: 'BRIDGE AMBUSH ARCHER',
                meshType: 'archer',
                isArcher: true,
                behaviorType: 'Ranged',
                aiType: 'Ranged',
                hp: 200,
                damage: 44,
                souls: 160,
                speed: 2.0,
                attackReach: 28.0,
                pos: [2.0, 3.8, 88.0]
            },
            {
                id: 'undead_archer_lookout',
                name: 'CASTLE LOOKOUT MARKSMAN',
                meshType: 'archer',
                isArcher: true,
                behaviorType: 'Ranged',
                aiType: 'Ranged',
                hp: 260,
                damage: 55,
                souls: 250,
                speed: 1.6,
                attackReach: 38.0,
                pos: [18.0, 6.0, 72.0]
            },
            {
                id: 'silver_knight_greatbowman',
                name: 'ANOR LONDO GREATBOW ARCHER',
                meshType: 'archer',
                isArcher: true,
                behaviorType: 'Ranged',
                aiType: 'Ranged',
                hp: 420,
                damage: 85,
                souls: 800,
                speed: 1.5,
                attackReach: 44.0,
                pos: [0.0, 6.5, -45.0]
            }
        ];
        lordranArchers.forEach(aMob => {
            this.createCustomMob(aMob, aMob.pos[0], aMob.pos[2], 0, aMob.pos[1]);
        });

        // Boss
        if (!this.boss || this.boss.isDead) {
            this.spawnBoss(this.currentBossType || 'taurus');
        }
    }

    createCustomMob(mobDef, x, z, angle = 0, y = 0) {
        const mesh = this.charFactory.createMob(mobDef, x, z, angle, y);
        const isQaOneHp = (this.qaOneHpMobs || (window.qaSuite && window.qaSuite.qaOneHpMobsActive));
        const isQaOneHpDmg = (this.qaOneHpDamage || (window.qaSuite && window.qaSuite.qaOneHpDamageActive));
        const maxHp = isQaOneHp ? 1 : (mobDef.hp || 200);
        const damage = isQaOneHpDmg ? 1 : (mobDef.damage || 35);

        const behavior = mobDef.behaviorType || 'Swarm';
        let defaultRadius = 0.88;
        if (behavior === 'Heavy Tank') defaultRadius = 1.35;
        else if (behavior === 'Flanker') defaultRadius = 0.75;
        else if (behavior === 'Caster' || behavior === 'Ranged') defaultRadius = 0.82;

        const enemy = {
            def: mobDef,
            id: mobDef.id,
            type: mobDef.meshType || 'mob',
            name: mobDef.name || 'Undead Mob',
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
            animTime: Math.random() * 5
        };
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
            const totalDur = (this.attackCombo === 3 ? 0.70 : 0.45) / (wpn.speedMultiplier || 1.0);
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
        const colliders = this.world.colliders;
        for (let i = 1; i <= 4; i++) {
            const t = i / 5.0;
            const sx = pos1.x + (pos2.x - pos1.x) * t;
            const sy = (pos1.y + 0.9) + (pos2.y - pos1.y) * t;
            const sz = pos1.z + (pos2.z - pos1.z) * t;

            for (let c = 0; c < colliders.length; c++) {
                const box = colliders[c];
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
        // Roll-escape: allow breaking out of minor stagger after 0.1s!
        if (this.isStaggered && this.staggerTime > 0.40) return;
        // Roll-cancel during attack recovery frames
        if (this.isAttacking && this.attackTime < 0.16) return;
        if (this.stamina < 16) return;

        this.isStaggered = false; // Immediately breaks free from flinch/stunlock!
        this.isRolling = true;
        this.rollTime = 0;
        this.isInvincible = true;
        this.isAttacking = false;
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
        if (this.isStaggered && this.staggerTime > 0.35) return;
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

                        // Authentic mob poise pools: random mobs do NOT stagger so easily!
                        let baseMaxPoise = 50;
                        if (behavior === 'Heavy Tank') baseMaxPoise = 115;
                        else if (behavior === 'Flanker') baseMaxPoise = 65;
                        else if (behavior === 'Ranged' || e.isArcher) baseMaxPoise = 42;
                        else if (e.type && (e.type.includes('knight') || e.type.includes('serpent') || e.type.includes('gorgon'))) baseMaxPoise = 100;

                        if (e.maxPoise === undefined) {
                            e.maxPoise = (e.def && e.def.poise) || baseMaxPoise;
                            e.poise = e.maxPoise;
                        }

                        // Calculate poise damage: heavy combo or Zweihander delivers major poise damage
                        const isHeavySlash = (this.attackCombo === 3 || this.currentWeaponId === 'zweihander');
                        const basePoiseHit = isHeavySlash ? 48 : 20;
                        const totalPoiseHit = Math.round(basePoiseHit * wpnPoiseMult * poiseDmg);

                        e.poise -= totalPoiseHit;
                        e.poiseRegenTimer = 3.2; // Delay before poise recovers

                        if (e.poise <= 0) {
                            // POISE BROKEN! Only genuine poise break triggers stagger!
                            e.poise = 0;
                            e.isStaggered = true;
                            e.staggerTimer = isHeavySlash ? 0.70 : 0.45;
                            e.maxStaggerTimer = e.staggerTimer;
                            e.state = 'STAGGER';
                            e.attackPhase = 'IDLE';
                            e.isAttacking = false;
                            e._hitDir = (Math.random() > 0.5 ? 1 : -1) * (0.35 + Math.random() * 0.2);
                        } else {
                            // POISE HOLDS! Random mobs do NOT stagger easily on casual light hits!
                            // They take damage, bleed, and can trade blows with authentic poise hyperarmor!
                            e.isStaggered = false;
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
    }

    // ----------------------------------------------------
    // WEAPONS ARSENAL MANAGEMENT & MERCHANT SHOP
    // ----------------------------------------------------
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
                    // Guard broken for 2.2s!
                    this.poise = 0;
                    this.isStaggered = true;
                    this.staggerTime = 2.2;
                    this.maxStaggerTimer = 2.2;
                    this.isBlocking = false;
                    this.guardCounterWindow = 0;
                    this.game.showNotification("⚠️ GUARD BROKEN! STAGGERED (2.2s)");
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

        // Poise & Stagger: Poise damage, regenerates after 2.5s delay
        const directPoiseDmg = Math.max(15, Math.round(damage * 0.35));
        this.poise -= directPoiseDmg;
        this.poiseRegenDelay = 2.5;

        if (this.hp <= 0) {
            this.killPlayer();
        } else if (this.poise <= 0) {
            // Hitting 0 poise breaks guard for brief moment (0.55s max, not 2.2s!)
            this.poise = 0;
            this.isStaggered = true;
            this.staggerTime = 0.55;
            this.maxStaggerTimer = 0.55;
            this.isAttacking = false;
            this.isBlocking = false;
            this.game.showNotification("⚠️ POISE BROKEN!");
        } else {
            // Player still has poise! Only stagger on colossal boss hits (damage >= 85)
            if (damage >= 85) {
                this.isStaggered = true;
                this.staggerTime = 0.22;
                this.maxStaggerTimer = 0.22;
            } else {
                // Poise absorbs impact! Player retains full movement, attack, and roll freedom!
                this.isStaggered = false;
            }
        }
    }

    killEnemy(enemy) {
        enemy.isDead = true;
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
                    this.game.showNextLordUnlockedModal(this.boss, nextBoss);
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

        // Store bloodstain with all current souls
        this.bloodstain = {
            souls: this.souls,
            pos: this.game.playerMesh.position.clone()
        };
        this.souls = 0;

        if (this.game && this.game.triggerAutoSave) {
            this.game.triggerAutoSave('PLAYER_DEATH');
        }

        this.audio.playYouDied();
        this.game.triggerDeathScreen();
    }

    // ----------------------------------------------------
    // BONFIRE REST & LEVEL UP
    // ----------------------------------------------------
    restAtBonfire() {
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
                    if (e.hp <= 0) this.killEnemy(e);
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
            rd.totalTime += delta;

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

                // Ground Collision against terrain
                const groundY = this.world.getGroundHeight(rd.pos.x, rd.pos.z) + 0.32;
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
                        rd.rot.z = (Math.random() - 0.5) * 0.4;
                        if (u.bodyGroup) u.bodyGroup.position.y = 0.15;
                    }
                }
            } else {
                // Settled: wait and smoothly dissolve into soul energy
                rd.settleTimer += delta;
                if (rd.settleTimer > 3.2) {
                    const fade = Math.max(0, 1.0 - (rd.settleTimer - 3.2) / 1.2);
                    rd.mesh.scale.setScalar(fade);
                    if (fade <= 0) {
                        this.game.scene.remove(rd.mesh);
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
        const arrowMesh = this.charFactory.createArrowMesh();
        arrowMesh.position.copy(fromPos);

        // Aim towards player chest
        const target = targetPos.clone().add(new THREE.Vector3(0, 1.1, 0));
        const dist = fromPos.distanceTo(target);
        const arrowSpeed = 32.0;
        const flightTime = Math.max(0.1, dist / arrowSpeed);
        const upComp = 0.5 * 9.8 * flightTime; // Ballistic parabolic curve compensation

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
            damage: shooter ? (shooter.damage || 45) : 45,
            life: 7.0,
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
                if (arr.stuckTimer > 3.0 || arr.life <= 0) {
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
                            if (this.audio && this.audio.playArrowHit) this.audio.playArrowHit(true);
                            if (this.world && this.world.spawnHitSparks) this.world.spawnHitSparks(arr.pos, true);
                            if (this.game && this.game.shakeCamera) this.game.shakeCamera(0.18, 0.2);

                            this.stamina = Math.max(0, this.stamina - 18);
                            this.staminaDelay = 0.8;

                            // Deflect arrow away realistically
                            arr.vel.reflect(playerFacing).multiplyScalar(0.35);
                            arr.vel.y += 2.0;
                            continue;
                        }
                    }

                    // UNBLOCKED HIT!
                    if (!this.isRolling && !this.isInvincible) {
                        if (this.audio && this.audio.playArrowHit) this.audio.playArrowHit(false);
                        if (this.world && this.world.spawnHitSparks) this.world.spawnHitSparks(arr.pos, false);
                        const attackerPos = arr.shooter ? (arr.shooter.mesh ? arr.shooter.mesh.position : arr.pos) : arr.pos;
                        this.damagePlayer(arr.damage, attackerPos);

                        arr.stuck = true;
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
                if (this.audio && this.audio.playArrowHit) this.audio.playArrowHit(false);
                if (this.world && this.world.spawnHitSparks) this.world.spawnHitSparks(arr.pos, false);
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

            // 1. Articulated Ragdoll Physics handles deceased entities in updateRagdolls
            if (e.isDead || e.state === 'DEAD') {
                continue;
            }

            // Distance culling & frustum optimization:
            const dx = playerPos.x - e.mesh.position.x;
            const dz = playerPos.z - e.mesh.position.z;
            const distSq = dx * dx + dz * dz;

            // Frustum Culling: Disable AI logic updates for off-screen mobs
            const isVisibleInFrustum = this._frustum.containsPoint(e.mesh.position);
            if (!isVisibleInFrustum && distSq > 18 * 18) {
                if (e.mesh.visible) e.mesh.visible = false;
                continue; // Skip AI logic update for off-screen mobs!
            } else {
                if (!e.mesh.visible && distSq <= 48 * 48) e.mesh.visible = true;
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

            // 3. Stagger / Flinch Recoil Animation on Weapon Hit
            if (e.isStaggered) {
                e.staggerTimer -= delta;
                const maxStagger = e.maxStaggerTimer || 0.45;
                const progress = Math.max(0, e.staggerTimer / maxStagger);
                const hitDir = e._hitDir || 0.25;

                if (u.torso) {
                    u.torso.rotation.x = -0.52 * progress;
                    u.torso.rotation.z = hitDir * progress;
                }
                if (u.head) {
                    u.head.rotation.x = -0.4 * progress;
                    u.head.rotation.y = hitDir * 1.2 * progress;
                }
                if (u.rightShoulder) {
                    u.rightShoulder.rotation.x = -0.8 * progress;
                    u.rightShoulder.rotation.z = 0.55 * progress;
                }
                if (u.leftShoulder) {
                    u.leftShoulder.rotation.x = -0.55 * progress;
                    u.leftShoulder.rotation.z = -0.6 * progress;
                }

                if (e.staggerTimer <= 0) {
                    e.isStaggered = false;
                    e.poise = e.maxPoise || 50; // Full poise reset on recovery
                    if (u.torso) u.torso.rotation.set(0, 0, 0);
                    if (u.head) u.head.rotation.set(0, 0, 0);
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
                windupEnd = 0.70;
                strikeEnd = 0.90;
                totalDur = 1.35;
                aggroRange = 38;
                speedMult = 0.85;
                preferredDist = 18.0;
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
                        if (u.torso) { u.torso.rotation.y = 0.75 * t; }
                        if (u.rightShoulder) { u.rightShoulder.rotation.x = -1.4 * t; u.rightShoulder.rotation.y = -0.4 * t; }
                        if (u.leftShoulder) { u.leftShoulder.rotation.x = -1.5 * t; u.leftShoulder.rotation.z = -0.7 * t; }
                        if (u.bowString) { u.bowString.position.x = 0.16 + 0.22 * t; }
                        if (u.notchedArrow) { u.notchedArrow.position.z = 0.42 - 0.25 * t; }
                    } else {
                        // Flanker / Swarm / default
                        if (u.torso) { u.torso.rotation.y = -0.65 * t; u.torso.rotation.x = -0.22 * t; }
                        if (u.head) { u.head.rotation.x = 0.15 * t; u.head.rotation.y = 0.25 * t; }
                        if (u.rightShoulder) { u.rightShoulder.rotation.x = -2.1 * t; u.rightShoulder.rotation.z = 0.45 * t; u.rightShoulder.rotation.y = -0.25 * t; }
                        if (u.leftShoulder) { u.leftShoulder.rotation.x = 0.35 * t; u.leftShoulder.rotation.z = -0.35 * t; }
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
                        if (u.torso) { u.torso.rotation.y = 0.75 - 0.25 * t; }
                        if (u.rightShoulder) { u.rightShoulder.rotation.x = -1.4 + 0.8 * t; }
                        if (u.bowString) { u.bowString.position.x = 0.16; }
                        if (u.notchedArrow) { u.notchedArrow.position.z = 0.42; }
                    } else {
                        // Flanker / Swarm
                        if (u.torso) { u.torso.rotation.y = -0.65 + 1.25 * t; u.torso.rotation.x = -0.22 + 0.65 * t; }
                        if (u.head) { u.head.rotation.x = 0.15 - 0.35 * t; u.head.rotation.y = 0.25 - 0.45 * t; }
                        if (u.rightShoulder) { u.rightShoulder.rotation.x = -2.1 + 3.45 * t; u.rightShoulder.rotation.z = 0.45 - 0.75 * t; }
                        if (u.leftShoulder) { u.leftShoulder.rotation.x = 0.35 - 0.7 * t; }
                    }

                    // Strike Impact Frame
                    if (!e._damageDelivered && t >= 0.35) {
                        e._damageDelivered = true;
                        if (behavior === 'Ranged' || e.isArcher) {
                            if (this.audio && this.audio.playArrowRelease) this.audio.playArrowRelease();
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
                    e.isAttacking = false;
                    e._damageDelivered = false;
                    e.attackPhase = 'IDLE';
                    e.state = 'CHASE';
                    const baseCd = behavior === 'Heavy Tank' ? 1.9 : (behavior === 'Flanker' ? 0.9 : 1.3);
                    e.cooldown = baseCd + Math.random() * 0.6;
                }
                continue;
            }

            // 5. Aggro & Locomotion Logic (Mob Matrix 5 Archetypes)
            if (dist < aggroRange && (heightDiff < 4.2 || behavior === 'Ranged' || e.isArcher || behavior === 'Caster')) {
                // Line of Sight: Aggro drops if blocked by walls for >4s
                const hasLoS = this.checkLineOfSight(e.mesh.position, playerPos);
                if (!hasLoS) {
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
                    if (dist < 4.5) {
                        shouldRetreat = true;
                    } else if (dist > preferredDist + 1.5) {
                        shouldAdvance = true;
                    }
                } else {
                    if (dist > preferredDist) {
                        shouldAdvance = true;
                    }
                }

                if (shouldAdvance) {
                    const moveSpeed = (e.speed || 2.4) * speedMult;
                    e.mesh.position.x += Math.sin(targetAngle) * moveSpeed * delta;
                    e.mesh.position.z += Math.cos(targetAngle) * moveSpeed * delta;
                    if (e.startPos && e.startPos.y > 2.0) {
                        e.mesh.position.y = e.startPos.y; // Keep sniper roost perch height
                    } else {
                        e.mesh.position.y = this.world.getGroundHeight(e.mesh.position.x, e.mesh.position.z, e.mesh.position.y);
                    }
                } else if (shouldRetreat) {
                    const moveSpeed = (e.speed || 2.4) * 0.85;
                    e.mesh.position.x -= Math.sin(targetAngle) * moveSpeed * delta;
                    e.mesh.position.z -= Math.cos(targetAngle) * moveSpeed * delta;
                    e.mesh.position.y = this.world.getGroundHeight(e.mesh.position.x, e.mesh.position.z, e.mesh.position.y);
                }

                // If in attack range, trigger attack when cooldown expires
                const canAttack = (behavior === 'Ranged' || behavior === 'Caster' || e.isArcher) ? 
                    (dist >= 3.0 && dist <= aggroRange) : 
                    (dist <= preferredDist + 0.35 && activeMeleeStrikes < 2);
                if (canAttack) {
                    e.cooldown -= delta;
                    if (e.cooldown <= 0 && !e.isAttacking) {
                        e.isAttacking = true;
                        e.attackTime = 0;
                        e._damageDelivered = false;
                        e.state = 'WINDUP';
                        e.attackPhase = 'WINDUP';
                    }
                }

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
                    u.tailSegments.forEach((seg, sIdx) => {
                        seg.position.x = Math.sin(e.animTime * 7.0 + sIdx * 0.8) * 0.38;
                    });
                    if (u.snakeHair) {
                        u.snakeHair.forEach((sn, snIdx) => {
                            sn.rotation.z = Math.sin(e.animTime * 8.0 + snIdx) * 0.3;
                        });
                    }
                }
            } else {
                // 6. Idle / Patrol Breathing & Scanning Animation
                e.state = 'PATROL';
                e.attackPhase = 'IDLE';
                const breath = Math.sin(e.animTime * 2.2 + e.idleSeed);
                if (u.torso) {
                    u.torso.position.y = breath * 0.035;
                    u.torso.rotation.x = 0.12 + breath * 0.04;
                    u.torso.rotation.z = 0;
                }
                if (u.head) {
                    u.head.rotation.y = Math.sin(e.animTime * 0.85 + e.idleSeed) * 0.32;
                    u.head.rotation.x = 0.08 + Math.cos(e.animTime * 1.6) * 0.05;
                }
                if (u.rightShoulder) {
                    u.rightShoulder.rotation.x = -0.28 + breath * 0.05;
                    u.rightShoulder.rotation.z = 0.18;
                }
                if (u.leftShoulder) {
                    u.leftShoulder.rotation.x = -0.16 - breath * 0.04;
                    u.leftShoulder.rotation.z = -0.22;
                }
                if (u.rightHip) u.rightHip.rotation.x = 0;
                if (u.leftHip) u.leftHip.rotation.x = 0;
            }
        }
    }

    updateBossAI(delta) {
        if (!this.boss || this.boss.isDead) return;

        const playerPos = this.game.playerMesh.position;
        this._scratchToPlayer.subVectors(playerPos, this.boss.mesh.position);
        const dist = this._scratchToPlayer.length();

        // Check if player entered Boss Arena (z > 98)
        if (playerPos.z > 98 && this.boss.state === 'IDLE') {
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

        // Smoothly face player
        const targetAngle = Math.atan2(this._scratchToPlayer.x, this._scratchToPlayer.z);
        this.boss.mesh.rotation.y = THREE.MathUtils.lerp(this.boss.mesh.rotation.y, targetAngle, 0.1);

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
                seg.position.x = Math.sin(time * 6.5 + idx * 0.8) * 0.45;
                seg.rotation.y = Math.cos(time * 6.5 + idx * 0.8) * 0.35;
            });
        }

        // 2. Writhing Snake Hair Animation
        if (u.snakeHair) {
            u.snakeHair.forEach((sn, idx) => {
                sn.rotation.z = Math.sin(time * 7.5 + idx * 1.2) * 0.35;
                sn.rotation.x = Math.cos(time * 6.0 + idx * 0.9) * 0.25;
            });
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
                if (!this.boss._lastStepShake || this.boss.animTime - this.boss._lastStepShake > 0.38) {
                    this.boss._lastStepShake = this.boss.animTime;
                    this.game.shakeCamera(0.14, 0.16);
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
        // Wing flapping & tail swaying animation
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
            this.boss.cooldown = this.boss.isPhase2 ? 2.0 : 2.8;

            const roll = Math.random();
            if (roll < 0.45) {
                // Halberd Thrust & Aerial Lunge
                this.audio.playSwing(false);
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.game.shakeCamera(0.25, 0.35);
                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 5.2) {
                            this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 450);
            } else if (roll < 0.8) {
                // Fire Breath Stream (Iconic Gargoyle Flame)
                this.audio.playFireBreath();
                if (u.throatFlame) u.throatFlame.intensity = 4.0;

                const headPos = this.boss.mesh.position.clone().add(new THREE.Vector3(0, 2.5, 0));
                const fireDir = new THREE.Vector3(Math.sin(targetAngle), -0.15, Math.cos(targetAngle)).normalize();

                // Spray fire particles over 1.0 second
                const fireInterval = setInterval(() => {
                    if (this.boss && !this.boss.isDead && this.boss.isAttacking) {
                        this.world.spawnFlameBreath(headPos, fireDir);
                    }
                }, 120);

                setTimeout(() => {
                    clearInterval(fireInterval);
                    if (this.boss && !this.boss.isDead) {
                        if (u.throatFlame) u.throatFlame.intensity = 0;
                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        // Forward cone check
                        const toPlayer = new THREE.Vector3().subVectors(this.game.playerMesh.position, this.boss.mesh.position).normalize();
                        const forward = new THREE.Vector3(Math.sin(targetAngle), 0, Math.cos(targetAngle));
                        if (hitDist < 6.8 && forward.dot(toPlayer) > 0.3) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.9), this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 1000);
            } else {
                // Tail-Axe Sweep
                this.audio.playSwing(true);
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.game.shakeCamera(0.3, 0.4);
                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 4.2) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.75), this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 500);
            }
        }
    }

    // ----------------------------------------------------
    // BOSS 3: CAPRA DEMON AI (Dual Jagged Machetes & Jumping Slams)
    // ----------------------------------------------------
    updateCapraAI(delta, dist, targetAngle) {
        if (dist > 3.6 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 4.6 : 3.4;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.cooldown = this.boss.isPhase2 ? 1.6 : 2.4;

            const roll = Math.random();
            if (roll < 0.55) {
                // Leaping Dual Overhead Chop
                this.audio.playBossRoar();
                // Forward jump burst
                const jumpDir = new THREE.Vector3(Math.sin(targetAngle), 0, Math.cos(targetAngle));
                this.boss.mesh.position.addScaledVector(jumpDir, 2.0);

                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.audio.playBossSlam();
                        this.game.shakeCamera(0.5, 0.65);
                        this.world.spawnHitSparks(this.boss.mesh.position, true);

                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 4.5) {
                            this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 580);
            } else {
                // Dual Machete Flurry (Double Slice)
                this.audio.playSwing(false);
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 3.8) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.5), this.boss.mesh.position);
                        }
                    }
                }, 220);

                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.audio.playSwing(true);
                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 4.0) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.65), this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 480);
            }
        }
    }

    // ----------------------------------------------------
    // BOSS 4: GREAT GREY WOLF SIF AI (Artorias Greatsword & 360° Spin)
    // ----------------------------------------------------
    updateSifAI(delta, dist, targetAngle) {
        const u = this.boss.mesh.userData;
        // 4-legged running animation
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
            this.boss.cooldown = this.boss.isPhase2 ? 2.2 : 3.0;

            const roll = Math.random();
            if (roll < 0.6) {
                // ICONIC 360° ARTORIAS GREATSWORD WHIRLWIND SPIN!
                this.audio.playWolfHowl();
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.audio.playSwing(true);
                        this.game.shakeCamera(0.4, 0.55);

                        // Full 360 sweep visual burst
                        this.boss.mesh.rotation.y += Math.PI * 2;
                        this.world.spawnHitSparks(this.boss.mesh.position, true);

                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 5.8) {
                            this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                        }

                        // Phase 2: Follow-up second spin!
                        if (this.boss.isPhase2) {
                            setTimeout(() => {
                                if (this.boss && !this.boss.isDead) {
                                    this.audio.playSwing(true);
                                    this.game.shakeCamera(0.4, 0.5);
                                    const hitDist2 = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                                    if (hitDist2 < 5.8) {
                                        this.damagePlayer(Math.round(this.boss.damage * 0.8), this.boss.mesh.position);
                                    }
                                    this.boss.isAttacking = false;
                                }
                            }, 450);
                        } else {
                            this.boss.isAttacking = false;
                        }
                    }
                }, 400);
            } else {
                // Leaping Overhead Sword Pounce
                const jumpDir = new THREE.Vector3(Math.sin(targetAngle), 0, Math.cos(targetAngle));
                this.boss.mesh.position.addScaledVector(jumpDir, 3.2);
                this.audio.playSwing(false);

                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.audio.playBossSlam();
                        this.game.shakeCamera(0.35, 0.45);
                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 4.8) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.9), this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 420);
            }
        }
    }

    // ----------------------------------------------------
    // BOSS 5: GWYN, LORD OF CINDER AI (Sunlight Combos & Sun Burst)
    // ----------------------------------------------------
    updateGwynAI(delta, dist, targetAngle) {
        if (dist > 3.8 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 4.8 : 3.8;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.cooldown = this.boss.isPhase2 ? 1.5 : 2.2;

            const roll = Math.random();
            if (roll < 0.5) {
                // 3-HIT FLAMING SUNLIGHT COMBO
                // Hit 1: Horizontal slash
                this.audio.playSwing(false);
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 4.0) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.4), this.boss.mesh.position);
                        }
                    }
                }, 200);

                // Hit 2: Upward cross cut
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.audio.playSwing(false);
                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 4.0) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.4), this.boss.mesh.position);
                        }
                    }
                }, 440);

                // Hit 3: Overhead flame strike
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.audio.playSunlightFlame();
                        this.game.shakeCamera(0.4, 0.5);
                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 4.5) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.7), this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 720);
            } else if (roll < 0.8) {
                // RADIANT SUNLIGHT BURST (Golden Shockwave Ring)
                this.audio.playSunlightFlame();
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.game.shakeCamera(0.5, 0.65);
                        this.world.spawnSunlightBurst(this.boss.mesh.position);

                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 5.5) {
                            this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 450);
            } else {
                // Lunging Flame Thrust (Fast gap closer)
                const thrustDir = new THREE.Vector3(Math.sin(targetAngle), 0, Math.cos(targetAngle));
                this.boss.mesh.position.addScaledVector(thrustDir, 3.0);
                this.audio.playSwing(true);

                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.game.shakeCamera(0.3, 0.4);
                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 4.2) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.85), this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 350);
            }
        }
    }

    // ----------------------------------------------------
    // BOSS 4: GRAVELORD NITO AI (Miasma Nova, Sword Dance, Cleaves)
    // ----------------------------------------------------
    updateNitoAI(delta, dist, targetAngle) {
        const u = this.boss.mesh.userData;
        if (u.maskFather) u.maskFather.rotation.y = Math.sin(this.boss.animTime * 2.0) * 0.25;
        if (u.maskMother) u.maskMother.rotation.y = Math.cos(this.boss.animTime * 1.8) * 0.25;
        if (u.maskChild) u.maskChild.rotation.y = -Math.sin(this.boss.animTime * 2.2) * 0.25;

        if (dist > 4.2 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 3.2 : 2.2;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;

            if (Math.sin(this.boss.animTime * 3) > 0.95) {
                this.game.shakeCamera(0.06, 0.1);
            }
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.cooldown = this.boss.isPhase2 ? 1.6 : 2.4;

            const roll = Math.random();
            if (roll < 0.45) {
                // GRAVELORD GREATSWORD SWEEPING CLEAVE
                if (u.rightShoulder) {
                    u.rightShoulder.rotation.x = -0.8;
                    u.rightShoulder.rotation.y = 0.5;
                }
                this.audio.playSwing(true);

                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        if (u.rightShoulder) {
                            u.rightShoulder.rotation.x = 1.2;
                            u.rightShoulder.rotation.y = -0.6;
                        }
                        this.game.shakeCamera(0.35, 0.45);
                        this.world.spawnHitSparks(this.boss.mesh.position, true);

                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 5.2) {
                            this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                        }
                        setTimeout(() => {
                            if (u.rightShoulder) u.rightShoulder.rotation.set(0, 0, 0);
                            this.boss.isAttacking = false;
                        }, 300);
                    }
                }, 650);
            } else if (roll < 0.75) {
                // GRAVELORD SWORD DANCE (Toxic red spikes erupt beneath player)
                this.audio.playBossRoar();
                this.game.showNotification("GRAVELORD SWORD DANCE ERUPTION!");

                const targetPos = this.game.playerMesh.position.clone();
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.audio.playBossSlam();
                        this.game.shakeCamera(0.48, 0.6);
                        this.world.spawnSunlightBurst(targetPos);

                        const hitDist = this.game.playerMesh.position.distanceTo(targetPos);
                        if (hitDist < 3.2) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.9), targetPos);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 850);
            } else {
                // MIASMA DEATH NOVA (360 degree dark burst)
                this.game.showNotification("MIASMA DEATH NOVA!");
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.game.shakeCamera(0.55, 0.75);
                        this.world.spawnHitSparks(this.boss.mesh.position, true);

                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 6.2) {
                            this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 900);
            }
        }
    }

    // ----------------------------------------------------
    // 10 NEW BOSSES AI BEHAVIORS
    // ----------------------------------------------------

    // 1. ASYLUM DEMON AI (Hammer Slam, Jump Butt-Crush)
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
            this.boss.cooldown = this.boss.isPhase2 ? 1.8 : 2.5;

            const roll = Math.random();
            if (roll < 0.55) {
                // Great Hammer Overhead Smash
                this.audio.playBossRoar();
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.audio.playBossSlam();
                        this.game.shakeCamera(0.45, 0.55);
                        this.world.spawnHitSparks(this.boss.mesh.position, true);
                        if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 4.8) {
                            this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 680);
            } else {
                // ICONIC JUMP BUTT-STOMP (Rises into air, crashes down with shockwave)
                this.audio.playBossRoar();
                this.game.showNotification("ASYLUM DEMON JUMP STOMP!");
                this.boss.mesh.position.y += 3.0; // Jump up

                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.boss.mesh.position.y = 0; // Slam down!
                        this.audio.playBossSlam();
                        this.game.shakeCamera(0.6, 0.7);
                        this.world.spawnHitSparks(this.boss.mesh.position, true);
                        if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 5.8) {
                            this.damagePlayer(Math.round(this.boss.damage * 1.1), this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 750);
            }
        }
    }

    // 2. GAPING DRAGON AI (Ribcage Maw Chomp, Tail Swipe & Acid Vomit)
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
            this.boss.cooldown = this.boss.isPhase2 ? 2.0 : 2.8;

            const roll = Math.random();
            if (roll < 0.5) {
                // Gaping Maw Charge & Tooth Chomp
                this.audio.playBossRoar();
                this.game.showNotification("GAPING DRAGON RIBCAGE CHOMP!");
                const chargeDir = new THREE.Vector3(Math.sin(targetAngle), 0, Math.cos(targetAngle));
                this.boss.mesh.position.addScaledVector(chargeDir, 3.0);

                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.audio.playBossSlam();
                        this.game.shakeCamera(0.5, 0.6);
                        this.world.spawnHitSparks(this.boss.mesh.position, true);
                        if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 5.5) {
                            this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 600);
            } else {
                // Spiked Tail Sweep
                this.audio.playSwing(true);
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.game.shakeCamera(0.35, 0.45);
                        if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 4.8) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.8), this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 450);
            }
        }
    }

    // 3. CHAOS WITCH QUELAAG AI (Flaming Furysword & Lava Pools)
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
            this.boss.cooldown = this.boss.isPhase2 ? 1.6 : 2.3;

            const roll = Math.random();
            if (roll < 0.6) {
                // Furysword 2-Hit Blazing Slash
                this.audio.playSwing(false);
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 4.2) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.5), this.boss.mesh.position);
                        }
                    }
                }, 250);
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.audio.playSwing(true);
                        this.game.shakeCamera(0.3, 0.4);
                        if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 4.5) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.7), this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 520);
            } else {
                // Magma Lava Pool Spit
                this.audio.playSunlightFlame();
                this.game.showNotification("QUELAAG CHAOS MAGMA ERUPTION!");
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.world.spawnSunlightBurst(this.boss.mesh.position);
                        this.game.shakeCamera(0.45, 0.55);
                        if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 5.4) {
                            this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 600);
            }
        }
    }

    // 4. MOONLIGHT BUTTERFLY AI (Luminescent Wings & Crystal Darts)
    updateButterflyAI(delta, dist, targetAngle) {
        const u = this.boss.mesh.userData;
        if (u.leftWingGroup && u.rightWingGroup) {
            u.leftWingGroup.rotation.y = Math.sin(this.boss.animTime * 6) * 0.45;
            u.rightWingGroup.rotation.y = -Math.sin(this.boss.animTime * 6) * 0.45;
        }

        // Floating hovering motion
        this.boss.mesh.position.y = 3.6 + Math.sin(this.boss.animTime * 2) * 0.6;

        if (dist > 7.0 && !this.boss.isAttacking) {
            const speed = 2.6;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.cooldown = 2.4;

            // Homing Magic Crystal Darts
            this.audio.playBellToll();
            this.game.showNotification("MOONLIGHT HOMING CRYSTAL DARTS!");

            setTimeout(() => {
                if (this.boss && !this.boss.isDead) {
                    this.world.spawnHitSparks(this.boss.mesh.position, true);
                    this.game.shakeCamera(0.25, 0.35);
                    if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 9.0) {
                        this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                    }
                    this.boss.isAttacking = false;
                }
            }, 700);
        }
    }

    // 5. IRON GOLEM AI (Core Greataxe & Wind Wave)
    updateIronGolemAI(delta, dist, targetAngle) {
        if (dist > 4.2 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 3.2 : 2.2;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
            if (Math.sin(this.boss.animTime * 3) > 0.95) this.game.shakeCamera(0.06, 0.08);
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.cooldown = this.boss.isPhase2 ? 1.8 : 2.6;

            const roll = Math.random();
            if (roll < 0.55) {
                // Giant Core Axe Slam
                this.audio.playBossSlam();
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.game.shakeCamera(0.5, 0.6);
                        this.world.spawnHitSparks(this.boss.mesh.position, true);
                        if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 4.8) {
                            this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 650);
            } else {
                // Vacuum Wind Wave Slice
                this.audio.playSwing(true);
                this.game.showNotification("IRON GOLEM VACUUM WIND SLICE!");
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.game.shakeCamera(0.4, 0.5);
                        this.world.spawnHitSparks(this.boss.mesh.position, false);
                        if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 7.2) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.85), this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 480);
            }
        }
    }

    // 6. DRAGONSLAYER ORNSTEIN AI (Lightning Spear & Supersonic Dash)
    updateOrnsteinAI(delta, dist, targetAngle) {
        if (dist > 4.5 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 5.2 : 4.0;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.cooldown = this.boss.isPhase2 ? 1.5 : 2.2;

            const roll = Math.random();
            if (roll < 0.6) {
                // Supersonic Lightning Cross-Spear Thrust
                this.audio.playSwing(false);
                const dashDir = new THREE.Vector3(Math.sin(targetAngle), 0, Math.cos(targetAngle));
                this.boss.mesh.position.addScaledVector(dashDir, 3.5);

                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.audio.playParry();
                        this.game.shakeCamera(0.35, 0.45);
                        this.world.spawnHitSparks(this.boss.mesh.position, true);
                        if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 4.8) {
                            this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 380);
            } else {
                // Thunder Arc Jump Impale
                this.audio.playBellToll();
                this.game.showNotification("ORNSTEIN LIGHTNING IMPALE!");
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.audio.playBossSlam();
                        this.game.shakeCamera(0.48, 0.6);
                        this.world.spawnSunlightBurst(this.boss.mesh.position);
                        if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 5.2) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.9), this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 550);
            }
        }
    }

    // 7. EXECUTIONER SMOUGH AI (Locomotive Hammer Charge & Butt Slam)
    updateSmoughAI(delta, dist, targetAngle) {
        if (dist > 4.2 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 3.8 : 2.8;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
            if (Math.sin(this.boss.animTime * 4) > 0.92) this.game.shakeCamera(0.08, 0.1);
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.cooldown = this.boss.isPhase2 ? 1.7 : 2.5;

            const roll = Math.random();
            if (roll < 0.55) {
                // Colossal Hammer Sweep
                this.audio.playSwing(true);
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.audio.playBossSlam();
                        this.game.shakeCamera(0.5, 0.65);
                        this.world.spawnHitSparks(this.boss.mesh.position, true);
                        if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 5.2) {
                            this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 600);
            } else {
                // SMOUGH LIGHTNING BUTT SLAM
                this.audio.playBossRoar();
                this.game.showNotification("SMOUGH LIGHTNING BUTT SLAM!");
                this.boss.mesh.position.y += 2.5;

                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.boss.mesh.position.y = 0;
                        this.audio.playBossSlam();
                        this.game.shakeCamera(0.65, 0.8);
                        this.world.spawnSunlightBurst(this.boss.mesh.position);
                        if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 6.0) {
                            this.damagePlayer(Math.round(this.boss.damage * 1.1), this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 720);
            }
        }
    }

    // 8. KNIGHT ARTORIAS AI (Somersault Abyss Slam & Piercing Thrust)
    updateArtoriasAI(delta, dist, targetAngle) {
        if (dist > 4.5 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 5.0 : 3.8;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.cooldown = this.boss.isPhase2 ? 1.6 : 2.2;

            const roll = Math.random();
            if (roll < 0.6) {
                // ICONIC ARTORIAS TRIPLE SOMERSAULT ABYSS SLAM!
                this.audio.playWolfHowl();
                this.game.showNotification("ARTORIAS SOMERSAULT ABYSS SLAM!");
                this.boss.mesh.rotation.x += Math.PI * 2; // Acrobatic forward flip

                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.audio.playBossSlam();
                        this.game.shakeCamera(0.5, 0.65);
                        this.world.spawnHitSparks(this.boss.mesh.position, true);
                        if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 5.2) {
                            this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 520);
            } else {
                // Piercing Abyss Thrust
                this.audio.playSwing(false);
                const thrustDir = new THREE.Vector3(Math.sin(targetAngle), 0, Math.cos(targetAngle));
                this.boss.mesh.position.addScaledVector(thrustDir, 3.2);

                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.game.shakeCamera(0.35, 0.45);
                        if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 4.4) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.85), this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 360);
            }
        }
    }

    // 9. MANUS, FATHER OF THE ABYSS AI (Monstrous Claw Combos & Dark Beads)
    updateManusAI(delta, dist, targetAngle) {
        if (dist > 4.5 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 4.5 : 3.2;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.cooldown = this.boss.isPhase2 ? 1.6 : 2.4;

            const roll = Math.random();
            if (roll < 0.6) {
                // 3-HIT DEMONIC CLAW RAKE & CRUSH
                this.audio.playBossRoar();
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 4.8) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.45), this.boss.mesh.position);
                        }
                    }
                }, 220);
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.audio.playBossSlam();
                        this.game.shakeCamera(0.55, 0.7);
                        this.world.spawnHitSparks(this.boss.mesh.position, true);
                        if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 5.5) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.8), this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 580);
            } else {
                // DARK BEAD BARRAGE
                this.audio.playSunlightFlame();
                this.game.showNotification("MANUS DARK BEAD VOID BARRAGE!");
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.game.shakeCamera(0.45, 0.55);
                        this.world.spawnSunlightBurst(this.boss.mesh.position);
                        if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 7.0) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.9), this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 650);
            }
        }
    }

    // 10. BLACK DRAGON KALAMEET AI (Black Flame & Calamity Telekinesis)
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
            this.boss.cooldown = this.boss.isPhase2 ? 1.8 : 2.5;

            const roll = Math.random();
            if (roll < 0.5) {
                // Black Dragon Flame Stream
                this.audio.playFireBreath();
                this.game.showNotification("KALAMEET BLACK FLAME BREATH!");
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.game.shakeCamera(0.4, 0.5);
                        this.world.spawnFlameBreath(this.boss.mesh.position, new THREE.Vector3(Math.sin(targetAngle), 0, Math.cos(targetAngle)));
                        if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 6.8) {
                            this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 600);
            } else {
                // CALAMITY EYE TELEKINESIS PULSE
                this.audio.playWolfHowl();
                this.game.showNotification("CALAMITY EYE TELEKINETIC CURSE!");
                if (u.eyeLight) u.eyeLight.intensity = 8.0;

                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        if (u.eyeLight) u.eyeLight.intensity = 3.5;
                        this.audio.playBossSlam();
                        this.game.shakeCamera(0.55, 0.7);
                        this.world.spawnSunlightBurst(this.game.playerMesh.position);
                        if (this.game.playerMesh.position.distanceTo(this.boss.mesh.position) < 8.0) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.95), this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 680);
            }
        }
    }
}
