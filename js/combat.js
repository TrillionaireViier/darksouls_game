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

        // Enemies & Boss Roster (5 Iconic Dark Souls Bosses)
        this.enemies = [];
        this.boss = null;
        this.lockedTarget = null;
        this.currentBossType = 'taurus';
        this.defeatedBosses = [];

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
            }
        };
        this.currentWeaponId = 'sword';
        this.unlockedWeapons = ['sword'];
        this.charcoalResinTimer = 0;
        this.projectiles = [];

        this.bossRoster = [
            {
                id: 'taurus',
                name: 'TAURUS DEMON',
                title: 'Undead Burg Bridge &bull; Great Stone Hammer & Ground Slam',
                icon: '👹',
                maxHp: 2200,
                damage: 280,
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
                maxHp: 2400,
                damage: 320,
                souls: 8000,
                radius: 2.4,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createCapraDemon(x, z)
            },
            {
                id: 'sif',
                name: 'GREAT GREY WOLF SIF',
                title: 'Darkroot Garden &bull; Artorias Greatsword & 360° Whirlwind Spin',
                icon: '🐺',
                maxHp: 3200,
                damage: 340,
                souls: 12000,
                radius: 3.4,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createWolfSif(x, z)
            },
            {
                id: 'gwyn',
                name: 'GWYN, LORD OF CINDER',
                title: 'Kiln of First Flame &bull; Flaming Sunlight Greatsword & Sun Burst',
                icon: '☀️',
                maxHp: 4000,
                damage: 390,
                souls: 20000,
                radius: 2.6,
                spawnPos: { x: 0, z: 132 },
                create: (cf, x, z) => cf.createGwynLordOfCinder(x, z)
            }
        ];
    }

    initEnemies(charFactory) {
        this.charFactory = charFactory;
        this.spawnEnemies();
    }

    spawnBoss(bossId = this.currentBossType, x = 0, z = 132) {
        if (this.boss && this.boss.mesh) {
            this.game.scene.remove(this.boss.mesh);
        }

        const def = this.bossRoster.find(b => b.id === bossId) || this.bossRoster[0];
        this.currentBossType = def.id;

        const bossMesh = def.create(this.charFactory, x, z);
        this.boss = {
            id: def.id,
            type: 'boss',
            name: def.name,
            title: def.title,
            icon: def.icon,
            mesh: bossMesh,
            maxHp: def.maxHp,
            hp: def.maxHp,
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
        const boss = this.spawnBoss(bossId);
        this.audio.playBellToll();
        this.game.showNotification(`CHALLENGE READY: ${boss.name}`);
        // If player is already in arena, awaken boss immediately
        if (this.game.playerMesh.position.z > 98) {
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

        // 1. Hollow Soldier 1: Courtyard left
        this.createHollowSoldier(-10, -10, 0);

        // 2. Hollow Soldier 2: Courtyard exit gate
        this.createHollowSoldier(2, 22, Math.PI);

        // 3. Hollow Soldier 3: Bridge midway
        this.createHollowSoldier(-1, 55, Math.PI);

        // 4. Boss (in Boss Arena at z = 132)
        if (!this.boss || this.boss.isDead) {
            this.spawnBoss(this.currentBossType || 'taurus');
        }
    }

    createHollowSoldier(x, z, angle) {
        const mesh = this.charFactory.createHollow(x, z, angle);
        const enemy = {
            type: 'hollow',
            name: 'Undead Hollow',
            mesh: mesh,
            startPos: new THREE.Vector3(x, 0, z),
            maxHp: 320,
            hp: 320,
            damage: 115,
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

        // Check if looking at an enemy who is Riposteable (Counter-attack / Visceral Strike)
        const riposteTarget = this.getRiposteTarget();
        if (riposteTarget) {
            this.executeRiposte(riposteTarget);
            return;
        }

        // Check Backstab (enemy facing away within close proximity)
        const backstabTarget = this.getBackstabTarget();
        if (backstabTarget) {
            this.executeBackstab(backstabTarget);
            return;
        }

        // Standard Combo Attack
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

        // 1. Check Hollow Soldiers
        for (const e of this.enemies) {
            if (e.isDead) continue;
            const toEnemy = new THREE.Vector3().subVectors(e.mesh.position, playerPos);
            const dist = toEnemy.length();
            if (dist < reach) {
                const angle = forward.dot(toEnemy.normalize());
                if (angle > 0.30) { // In front arc
                    e.hp -= totalDmg;
                    this.audio.playHit(this.attackCombo === 3);
                    this.world.spawnBlood(e.mesh.position);
                    this.world.spawnHitSparks(e.mesh.position, this.attackCombo === 3);
                    this.game.showDamageNumber(e.mesh.position, totalDmg, this.currentWeaponId === 'uchigatana');
                    this.game.shakeCamera(0.12 * poiseDmg, 0.15);

                    if (e.hp <= 0) {
                        this.killEnemy(e);
                    } else {
                        e.isStaggered = true;
                        e.staggerTimer = 0.5 * poiseDmg;
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
        if (this.isDead || this.isInvincible) return;

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
                    this.game.showNotification("GUARD BROKEN!");
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
        const soulReward = 150;
        this.souls += soulReward;
        this.game.showSoulsGained(soulReward);

        // Collapse mesh
        let t = 0;
        const sink = setInterval(() => {
            t += 0.05;
            enemy.mesh.position.y -= 0.03;
            if (t > 1.2) {
                this.game.scene.remove(enemy.mesh);
                clearInterval(sink);
            }
        }, 50);
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

        // Notify next unlocked boss
        const currentIdx = this.bossRoster.findIndex(b => b.id === this.boss.id);
        if (currentIdx >= 0 && currentIdx < this.bossRoster.length - 1) {
            const nextBoss = this.bossRoster[currentIdx + 1];
            setTimeout(() => {
                this.game.showNotification(`NEXT LORD UNLOCKED: ${nextBoss.name} (Select in BOSS ROSTER)`);
            }, 4200);
        } else {
            setTimeout(() => {
                this.game.showNotification("ALL 5 LORDS OF LORDRAN SLAIN! YOU ARE THE LORD OF CINDER!");
            }, 4200);
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

    // ----------------------------------------------------
    // UPDATE TICK (COMBAT TIMERS & ENEMY AI)
    // ----------------------------------------------------
    update(delta) {
        if (this.isDead) return;

        // Pine Resin Fire Buff Timer
        if (this.charcoalResinTimer > 0) {
            this.charcoalResinTimer -= delta;
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

        for (const e of this.enemies) {
            if (e.isDead) continue;

            e.animTime += delta;

            // Riposte stun recovery
            if (e.isRiposteable) {
                e.riposteTimer -= delta;
                if (e.riposteTimer <= 0) e.isRiposteable = false;
                continue;
            }

            // Hit stagger
            if (e.isStaggered) {
                e.staggerTimer -= delta;
                if (e.staggerTimer <= 0) e.isStaggered = false;
                continue;
            }

            const toPlayer = new THREE.Vector3().subVectors(playerPos, e.mesh.position);
            const dist = toPlayer.length();

            // Aggro check (within 14 units)
            if (dist < 14) {
                e.state = 'CHASE';
                // Turn toward player
                const angle = Math.atan2(toPlayer.x, toPlayer.z);
                e.mesh.rotation.y = angle;

                if (dist > 1.8) {
                    // Move forward
                    const moveSpeed = 2.4;
                    e.mesh.position.x += Math.sin(angle) * moveSpeed * delta;
                    e.mesh.position.z += Math.cos(angle) * moveSpeed * delta;

                    // Walk anim
                    if (e.mesh.userData.rightHip) {
                        e.mesh.userData.rightHip.rotation.x = Math.sin(e.animTime * 8) * 0.45;
                        e.mesh.userData.leftHip.rotation.x = -Math.sin(e.animTime * 8) * 0.45;
                    }
                } else {
                    // Attack player if cooldown ready
                    e.cooldown -= delta;
                    if (e.cooldown <= 0) {
                        e.cooldown = 1.6 + Math.random() * 0.6;
                        // Wind up slash
                        this.audio.playSwing(false);
                        setTimeout(() => {
                            if (!e.isDead && !e.isRiposteable && !e.isStaggered) {
                                if (this.game.playerMesh.position.distanceTo(e.mesh.position) < 2.3) {
                                    this.damagePlayer(e.damage, e.mesh.position);
                                }
                            }
                        }, 280);
                    }
                }
            } else {
                e.state = 'PATROL';
            }
        }
    }

    updateBossAI(delta) {
        if (!this.boss || this.boss.isDead) return;

        const playerPos = this.game.playerMesh.position;
        const toPlayer = new THREE.Vector3().subVectors(playerPos, this.boss.mesh.position);
        const dist = toPlayer.length();

        // Check if player entered Boss Arena (z > 98)
        if (playerPos.z > 98 && this.boss.state === 'IDLE') {
            this.boss.state = 'CHASE';
            const id = this.boss.id;
            if (id === 'taurus') this.audio.playBossRoar();
            else if (id === 'gargoyle') { this.audio.playBellToll(); this.audio.playBossRoar(); }
            else if (id === 'capra') this.audio.playBossRoar();
            else if (id === 'sif') this.audio.playWolfHowl();
            else if (id === 'gwyn') this.audio.playSunlightFlame();

            this.audio.setBossMusic(true);
            this.game.showNotification(`${this.boss.name} AWAKENED`);
            this.game.showBossHpBar(this.boss);
        }

        if (this.boss.state === 'IDLE') return;

        this.boss.animTime += delta;

        // Smoothly face player
        const targetAngle = Math.atan2(toPlayer.x, toPlayer.z);
        this.boss.mesh.rotation.y = THREE.MathUtils.lerp(this.boss.mesh.rotation.y, targetAngle, 0.1);

        this.boss.cooldown -= delta;

        // Dispatch to boss-specific AI behavior
        const id = this.boss.id;
        if (id === 'gargoyle') {
            this.updateGargoyleAI(delta, dist, targetAngle);
        } else if (id === 'capra') {
            this.updateCapraAI(delta, dist, targetAngle);
        } else if (id === 'sif') {
            this.updateSifAI(delta, dist, targetAngle);
        } else if (id === 'gwyn') {
            this.updateGwynAI(delta, dist, targetAngle);
        } else {
            this.updateTaurusAI(delta, dist, targetAngle);
        }
    }

    // ----------------------------------------------------
    // BOSS 1: TAURUS DEMON AI
    // ----------------------------------------------------
    updateTaurusAI(delta, dist, targetAngle) {
        if (dist > 3.8 && !this.boss.isAttacking) {
            const speed = this.boss.isPhase2 ? 3.4 : 2.5;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;

            if (Math.sin(this.boss.animTime * 4) > 0.95) {
                this.game.shakeCamera(0.08, 0.1);
            }
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            this.boss.isAttacking = true;
            this.boss.cooldown = this.boss.isPhase2 ? 1.8 : 2.6;

            const roll = Math.random();
            if (roll < 0.6) {
                // Ground Slam
                this.audio.playBossRoar();
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.audio.playBossSlam();
                        this.game.shakeCamera(0.45, 0.6);
                        this.world.spawnHitSparks(this.boss.mesh.position, true);

                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 4.8) {
                            this.damagePlayer(this.boss.damage, this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 750);
            } else {
                // Sweeping Cleave
                this.audio.playSwing(true);
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.game.shakeCamera(0.3, 0.4);
                        const hitDist = this.game.playerMesh.position.distanceTo(this.boss.mesh.position);
                        if (hitDist < 4.2) {
                            this.damagePlayer(Math.round(this.boss.damage * 0.8), this.boss.mesh.position);
                        }
                        this.boss.isAttacking = false;
                    }
                }, 600);
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
}
