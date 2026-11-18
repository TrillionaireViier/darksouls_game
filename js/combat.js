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

        // Enemies & Boss Roster (5 Iconic Dark Souls Bosses)
        this.enemies = [];
        this.boss = null;
        this.lockedTarget = null;
        this.currentBossType = 'taurus';
        this.defeatedBosses = [];
        this.adminModeUnlocked = (localStorage.getItem('darksouls_admin_mode') === 'true');
        this.isGodMode = false;

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
            }
        ];
    }

    // Check sequential boss progression (override if admin mode active)
    isBossUnlocked(bossId) {
        if (this.adminModeUnlocked) return true;
        if (!bossId || bossId === 'asylum' || bossId === 'taurus') return true;
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
            this.game.playerMesh.position.set(-20, -5.8, 93);
            this.game.playerMesh.rotation.y = 0;
            this.game.cameraYaw = 0;
            this.game.cameraPitch = 0.15;
            this.game.showNotification("WARPED TO CATACOMBS SANCTUM OF THE DEAD");
        } else {
            this.game.playerMesh.position.set(0, 0, 93);
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
        // Clear any remaining enemies
        this.enemies.forEach(e => {
            if (e.mesh) this.game.scene.remove(e.mesh);
        });
        this.enemies = [];

        // 30 MOBS COMPENDIUM SPANNING LORDRAN (CATACOMBS -5M, BRIDGE 0M, RAMPARTS +6M)
        const mobList = (window.DarkSoulsLore && window.DarkSoulsLore.mobs) || window.DARK_SOULS_MOBS || [];
        if (mobList.length > 0) {
            mobList.forEach(mobDef => {
                const pos = mobDef.defaultPos || [0, 0, 0];
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
            state: 'PATROL',
            stateTimer: 0,
            cooldown: 0,
            isDead: false,
            isRiposteable: false,
            riposteTimer: 0,
            isStaggered: false,
            staggerTimer: 0,
            radius: 0.9,
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
            souls: 350
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
            animTime: Math.random() * 5
        };
        this.enemies.push(enemy);
    }

    // ----------------------------------------------------
    // PLAYER ACTIONS
    // ----------------------------------------------------
    tryLightAttack() {
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

        // Devastating impact: 3.2x heavy damage
        const damage = Math.round(wpn.heavyDmg * 3.2);
        this.audio.playPlungingSlam();
        this.world.spawnPlungingShockwave(pPos);
        this.game.shakeCamera(0.35, 0.45);
        this.game.showNotification(`💥 PLUNGING CRATER IMPACT • ${damage} DMG!`);

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
        if (this.isDead || this.isRolling || this.isDrinkingEstus || this.isStaggered || this.isAttacking) return;
        if (this.stamina < 20) return;

        this.isParrying = true;
        this.parryTime = 0;
        this.stamina = Math.max(0, this.stamina - 18);
        this.staminaDelay = 0.6;
        this.audio.playRoll(); // Swish of shield
    }

    tryRoll(moveDir) {
        if (this.isDead || this.isRolling || this.isDrinkingEstus || this.isStaggered) return;
        // Roll-cancel during attack recovery frames (after initial swing impact)
        if (this.isAttacking && this.attackTime < 0.20) return;
        if (this.stamina < 22) return;

        this.isRolling = true;
        this.rollTime = 0;
        this.isInvincible = true;
        this.isAttacking = false;
        this.isBlocking = false;
        this.stamina = Math.max(0, this.stamina - 22);
        this.staminaDelay = 0.45;

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
        if (this.isDead || this.isRolling || this.isDrinkingEstus || this.isStaggered) return;
        if (this.estusFlasks <= 0) {
            this.game.showNotification("NO ESTUS REMAINING");
            return;
        }
        if (this.hp >= this.maxHp) {
            this.game.showNotification("HEALTH ALREADY FULL");
            return;
        }

        this.isDrinkingEstus = true;
        this.estusTime = 0;
        this.isBlocking = false;
        this.isAttacking = false;
        this.estusFlasks--;
        this.audio.playEstusDrink();

        // Heal after 0.5s drinking animation
        setTimeout(() => {
            if (!this.isDead) {
                const healAmt = Math.round(this.maxHp * 0.65);
                this.hp = Math.min(this.maxHp, this.hp + healAmt);
                this.world.spawnEstusParticles(this.game.playerMesh.position);
                this.game.showNotification(`+${healAmt} HP RESTORED`);
            }
        }, 550);
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

                    if (e.hp <= 0) {
                        this.killEnemy(e);
                    } else {
                        e.isStaggered = true;
                        e.staggerTimer = 0.5 * poiseDmg;
                        e.maxStaggerTimer = e.staggerTimer;
                        e.isAttacking = false;
                        e._hitDir = (Math.random() > 0.5 ? 1 : -1) * (0.25 + Math.random() * 0.2);
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

        if (this.game && this.game.saveGame) {
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

        // QA Test Mode Hook: Clamp incoming damage to 1 HP
        if (this.qaOneHpDamage || (window.qaSuite && window.qaSuite.qaOneHpDamageActive)) {
            damage = 1;
        }

        // Check if player is actively Parrying
        if (this.isParrying && this.parryTime > 0.05 && this.parryTime < 0.28) {
            // SUCCESSFUL PARRY!
            this.audio.playParry();
            this.world.spawnHitSparks(this.game.playerMesh.position, true);
            this.game.shakeCamera(0.25, 0.3);

            // Find attacker to stun
            for (const e of this.enemies) {
                if (!e.isDead && e.mesh.position.distanceTo(attackerPos) < 1.0) {
                    e.isRiposteable = true;
                    e.riposteTimer = 2.6; // Stunned for 2.6 seconds
                    this.game.showNotification("PARRY! RIPOSTE READY!");
                    break;
                }
            }
            return;
        }

        // Check if player is Blocking
        if (this.isBlocking && this.stamina > 15) {
            // Check if facing attacker
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

                if (this.stamina <= 0) {
                    // GUARD BROKEN!
                    this.isStaggered = true;
                    this.staggerTime = 1.3;
                    this.isBlocking = false;
                    this.guardCounterWindow = 0;
                    this.game.showNotification("GUARD BROKEN!");
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

        if (this.hp <= 0) {
            this.killPlayer();
        } else {
            this.isStaggered = true;
            this.staggerTime = 0.45;
            this.isAttacking = false;
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

        // Trigger realistic Dark Souls ragdoll collapse
        enemy.deathProgress = 0;
        enemy.isAttacking = false;
        enemy.isStaggered = false;
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
                this.game.showNotification("👑 ALL 16 LORDS OF LORDRAN SLAIN! YOU ARE THE LORD OF CINDER!");
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

        // 2. Roll Timer & Invincibility Frames (i-frames)
        if (this.isRolling) {
            this.rollTime += delta;
            const maxDuration = this.isBackstep ? 0.38 : 0.52;
            const iFrameStart = 0.04;
            const iFrameEnd = this.isBackstep ? 0.28 : 0.42;
            this.isInvincible = this.rollTime >= iFrameStart && this.rollTime <= iFrameEnd;

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

    updateHollowAI(delta) {
        const playerPos = this.game.playerMesh.position;
        if (!this._scratchMobVec) this._scratchMobVec = new THREE.Vector3();

        for (let i = 0; i < this.enemies.length; i++) {
            const e = this.enemies[i];
            if (!e.mesh) continue;

            const u = e.mesh.userData;

            // 1. Realistic Ragdoll Collapse Animation upon Death
            if (e.isDead || e.state === 'DEAD') {
                e.deathProgress = (e.deathProgress || 0) + delta;
                const p = Math.min(1.0, e.deathProgress / 0.65);
                const ease = 1 - Math.pow(1 - p, 3); // Smooth cubic ease-out

                if (u.bodyGroup) {
                    u.bodyGroup.position.y = 0.95 - 0.78 * ease; // Sinks to floor
                }
                if (u.torso) {
                    u.torso.rotation.x = -1.15 * ease; // Collapses backwards
                    u.torso.rotation.z = 0.42 * ease;  // Slumps sideways
                }
                if (u.head) {
                    u.head.rotation.x = 0.75 * ease;   // Head rolls back
                    u.head.rotation.y = 0.45 * ease;
                }
                if (u.rightHip) {
                    u.rightHip.rotation.x = -1.25 * ease; // Knees buckle
                    u.rightHip.rotation.z = 0.45 * ease;
                }
                if (u.leftHip) {
                    u.leftHip.rotation.x = -0.95 * ease;
                    u.leftHip.rotation.z = -0.35 * ease;
                }
                if (u.rightShoulder) {
                    u.rightShoulder.rotation.x = -0.3 * ease;
                    u.rightShoulder.rotation.z = 1.35 * ease; // Weapon arm drops limp
                }
                if (u.leftShoulder) {
                    u.leftShoulder.rotation.x = -0.2 * ease;
                    u.leftShoulder.rotation.z = -1.25 * ease;
                }

                // After lying on the ground for 2.8s, dissipate
                if (e.deathProgress > 2.8) {
                    const fade = Math.max(0, 1.0 - (e.deathProgress - 2.8) / 0.8);
                    e.mesh.scale.setScalar(fade);
                    if (e.deathProgress > 3.6) {
                        this.game.scene.remove(e.mesh);
                    }
                }
                continue;
            }

            // Distance culling & frustum optimization:
            const dx = playerPos.x - e.mesh.position.x;
            const dz = playerPos.z - e.mesh.position.z;
            const distSq = dx * dx + dz * dz;

            if (distSq > 48 * 48) {
                if (e.mesh.visible) e.mesh.visible = false;
                continue;
            } else {
                if (!e.mesh.visible) e.mesh.visible = true;
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
                    if (u.torso) u.torso.rotation.set(0, 0, 0);
                    if (u.head) u.head.rotation.set(0, 0, 0);
                }
                continue;
            }

            this._scratchMobVec.subVectors(playerPos, e.mesh.position);
            const dist = this._scratchMobVec.length();
            const heightDiff = Math.abs(playerPos.y - e.mesh.position.y);
            const reach = e.attackReach || 2.0;

            // 4. Attack Animation (Telegraphed Windup, Cleave Strike & Recovery)
            if (e.isAttacking) {
                e.attackTime += delta;
                const windupEnd = 0.36;
                const strikeEnd = 0.56;
                const totalDur = 0.90;

                if (e.attackTime < windupEnd) {
                    // Phase 1: High Windup & Coiling Torso
                    const t = e.attackTime / windupEnd;
                    if (u.torso) {
                        u.torso.rotation.y = -0.65 * t;
                        u.torso.rotation.x = -0.22 * t;
                    }
                    if (u.head) {
                        u.head.rotation.x = 0.15 * t;
                        u.head.rotation.y = 0.25 * t;
                    }
                    if (u.rightShoulder) {
                        u.rightShoulder.rotation.x = -2.1 * t;
                        u.rightShoulder.rotation.z = 0.45 * t;
                        u.rightShoulder.rotation.y = -0.25 * t;
                    }
                    if (u.leftShoulder) {
                        u.leftShoulder.rotation.x = 0.35 * t;
                        u.leftShoulder.rotation.z = -0.35 * t;
                    }
                    if (u.rightHip && u.leftHip) {
                        u.rightHip.rotation.x = -0.3 * t;
                        u.leftHip.rotation.x = 0.3 * t;
                    }
                } else if (e.attackTime < strikeEnd) {
                    // Phase 2: Explosive Forward Slash & Cleave
                    const t = (e.attackTime - windupEnd) / (strikeEnd - windupEnd);
                    if (u.torso) {
                        u.torso.rotation.y = -0.65 + 1.25 * t;
                        u.torso.rotation.x = -0.22 + 0.65 * t;
                    }
                    if (u.head) {
                        u.head.rotation.x = 0.15 - 0.35 * t;
                        u.head.rotation.y = 0.25 - 0.45 * t;
                    }
                    if (u.rightShoulder) {
                        u.rightShoulder.rotation.x = -2.1 + 3.45 * t;
                        u.rightShoulder.rotation.z = 0.45 - 0.75 * t;
                    }
                    if (u.leftShoulder) {
                        u.leftShoulder.rotation.x = 0.35 - 0.7 * t;
                    }

                    // Strike Impact Frame
                    if (!e._damageDelivered && t >= 0.5) {
                        e._damageDelivered = true;
                        this.audio.playSwing(false);
                        const playerDist = this.game.playerMesh.position.distanceTo(e.mesh.position);
                        if (playerDist < (reach + 0.7) && !this.isRolling && !this.isInvincible) {
                            const dmg = (this.qaOneHpDamage || (window.qaSuite && window.qaSuite.qaOneHpDamageActive)) ? 1 : (e.damage || 35);
                            this.damagePlayer(dmg, e.mesh.position);
                            if (this.world && this.world.spawnHitSparks) {
                                this.world.spawnHitSparks(this.game.playerMesh.position, false);
                            }
                        }
                    }
                } else if (e.attackTime < totalDur) {
                    // Phase 3: Follow-through and recovery
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
                    e.cooldown = 1.4 + Math.random() * 0.8;
                }
                continue;
            }

            // 5. Aggro & Locomotion Logic
            if (dist < 14 && heightDiff < 3.8) {
                e.state = 'CHASE';
                const angle = Math.atan2(this._scratchMobVec.x, this._scratchMobVec.z);
                e.mesh.rotation.y = angle;

                if (dist > reach) {
                    const moveSpeed = e.speed || 2.4;
                    e.mesh.position.x += Math.sin(angle) * moveSpeed * delta;
                    e.mesh.position.z += Math.cos(angle) * moveSpeed * delta;
                    e.mesh.position.y = this.world.getGroundHeight(e.mesh.position.x, e.mesh.position.z);

                    // Authentic Dark Souls Shambling Undead Locomotion
                    const freq = 7.2;
                    const stride = e.animTime * freq;

                    if (u.rightHip && u.leftHip) {
                        u.rightHip.rotation.x = Math.sin(stride) * 0.68;
                        u.leftHip.rotation.x = -Math.sin(stride) * 0.68;
                        u.rightHip.rotation.z = Math.sin(stride) * 0.06;
                        u.leftHip.rotation.z = -Math.sin(stride) * 0.06;
                    }
                    if (u.torso) {
                        u.torso.rotation.x = 0.25;
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
                } else {
                    e.cooldown -= delta;
                    if (e.cooldown <= 0 && !e.isAttacking) {
                        e.isAttacking = true;
                        e.attackTime = 0;
                        e._damageDelivered = false;
                    }
                }
            } else {
                // 6. Idle / Patrol Breathing & Scanning Animation
                e.state = 'PATROL';
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

        // Dispatch to all 16 boss-specific AI behaviors
        const id = this.boss.id;
        if (id === 'asylum') this.updateAsylumAI(delta, dist, targetAngle);
        else if (id === 'gargoyle') this.updateGargoyleAI(delta, dist, targetAngle);
        else if (id === 'capra') this.updateCapraAI(delta, dist, targetAngle);
        else if (id === 'gaping') this.updateGapingAI(delta, dist, targetAngle);
        else if (id === 'quelaag') this.updateQuelaagAI(delta, dist, targetAngle);
        else if (id === 'butterfly') this.updateButterflyAI(delta, dist, targetAngle);
        else if (id === 'iron_golem') this.updateIronGolemAI(delta, dist, targetAngle);
        else if (id === 'ornstein') this.updateOrnsteinAI(delta, dist, targetAngle);
        else if (id === 'smough') this.updateSmoughAI(delta, dist, targetAngle);
        else if (id === 'sif') this.updateSifAI(delta, dist, targetAngle);
        else if (id === 'artorias') this.updateArtoriasAI(delta, dist, targetAngle);
        else if (id === 'manus') this.updateManusAI(delta, dist, targetAngle);
        else if (id === 'kalameet') this.updateKalameetAI(delta, dist, targetAngle);
        else if (id === 'nito') this.updateNitoAI(delta, dist, targetAngle);
        else if (id === 'gwyn') this.updateGwynAI(delta, dist, targetAngle);
        else this.updateTaurusAI(delta, dist, targetAngle);
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
            this.boss.attackType = Math.random() < 0.6 ? 'SLAM' : 'CLEAVE';
            this.boss.cooldown = this.boss.isPhase2 ? 1.8 : 2.6;

            if (this.boss.attackType === 'SLAM') {
                this.audio.playBossRoar();
            } else {
                this.audio.playSwing(true);
            }
        }

        // Active Taurus Demon Attack Animation
        if (this.boss.isAttacking) {
            this.boss.attackTime = (this.boss.attackTime || 0) + delta;

            if (this.boss.attackType === 'SLAM') {
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
