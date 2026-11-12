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
        this.rollTime = 0;
        this.rollDir = new THREE.Vector3();
        this.isInvincible = false;
        this.isDrinkingEstus = false;
        this.estusTime = 0;
        this.isStaggered = false;
        this.staggerTime = 0;
        this.isDead = false;

        // Enemies & Boss
        this.enemies = [];
        this.boss = null;
        this.lockedTarget = null;
    }

    initEnemies(charFactory) {
        this.charFactory = charFactory;
        this.spawnEnemies();
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

        // 4. Boss: Taurus Demon (in Boss Arena at z = 125)
        if (!this.boss || this.boss.isDead) {
            if (this.boss && this.boss.mesh) this.game.scene.remove(this.boss.mesh);
            const bossMesh = this.charFactory.createTaurusDemon(0, 132);
            this.boss = {
                type: 'boss',
                name: 'TAURUS DEMON',
                mesh: bossMesh,
                maxHp: 2200,
                hp: 2200,
                damage: 280,
                state: 'IDLE',
                stateTimer: 0,
                cooldown: 0,
                isPhase2: false,
                isDead: false,
                isAttacking: false,
                attackType: '',
                radius: 2.2,
                animTime: 0
            };
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
        if (this.stamina < 20) return;

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
            this.stamina = Math.max(0, this.stamina - 22);
            this.staminaDelay = 0.5;
            this.audio.playSwing(false);
            this.checkAttackHits(150, 1.2);
        } else if (this.attackTime > 0.22 && this.attackCombo === 1) {
            // Buffer combo 2
            this.attackCombo = 2;
            this.attackTime = 0;
            this.stamina = Math.max(0, this.stamina - 24);
            this.staminaDelay = 0.5;
            this.audio.playSwing(false);
            this.checkAttackHits(170, 1.4);
        }
    }

    tryHeavyAttack() {
        if (this.isDead || this.isRolling || this.isDrinkingEstus || this.isStaggered) return;
        if (this.stamina < 35) return;

        this.isAttacking = true;
        this.attackCombo = 3; // Heavy thrust / overhead
        this.attackTime = 0;
        this.stamina = Math.max(0, this.stamina - 36);
        this.staminaDelay = 0.7;
        this.audio.playSwing(true);
        this.checkAttackHits(280, 2.0);
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
        if (this.stamina < 24) return;

        this.isRolling = true;
        this.rollTime = 0;
        this.isInvincible = true;
        this.isAttacking = false;
        this.isBlocking = false;
        this.stamina = Math.max(0, this.stamina - 24);
        this.staminaDelay = 0.5;

        // Roll direction
        if (moveDir.lengthSq() > 0.01) {
            this.rollDir.copy(moveDir).normalize();
        } else {
            // Forward from player facing
            const playerRot = this.game.playerMesh.rotation.y;
            this.rollDir.set(Math.sin(playerRot), 0, Math.cos(playerRot)).normalize();
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

    checkAttackHits(baseDamage, poiseDmg) {
        const playerPos = this.game.playerMesh.position;
        const playerRot = this.game.playerMesh.rotation.y;
        const forward = new THREE.Vector3(Math.sin(playerRot), 0, Math.cos(playerRot));

        // Damage boost from strength stat
        const totalDmg = Math.round(baseDamage * (1 + (this.strength - 10) * 0.12));

        // 1. Check Hollow Soldiers
        for (const e of this.enemies) {
            if (e.isDead) continue;
            const toEnemy = new THREE.Vector3().subVectors(e.mesh.position, playerPos);
            const dist = toEnemy.length();
            if (dist < 2.8) {
                const angle = forward.dot(toEnemy.normalize());
                if (angle > 0.35) { // In front arc
                    e.hp -= totalDmg;
                    this.audio.playHit(this.attackCombo === 3);
                    this.world.spawnBlood(e.mesh.position);
                    this.world.spawnHitSparks(e.mesh.position, false);
                    this.game.showDamageNumber(e.mesh.position, totalDmg, false);
                    this.game.shakeCamera(0.12, 0.15);

                    if (e.hp <= 0) {
                        this.killEnemy(e);
                    } else {
                        // Stagger hollow
                        e.isStaggered = true;
                        e.staggerTimer = 0.5 * poiseDmg;
                    }
                }
            }
        }

        // 2. Check Boss (Taurus Demon)
        if (this.boss && !this.boss.isDead) {
            const toBoss = new THREE.Vector3().subVectors(this.boss.mesh.position, playerPos);
            const dist = toBoss.length();
            if (dist < 4.2) {
                const angle = forward.dot(toBoss.normalize());
                if (angle > 0.2) {
                    this.boss.hp -= totalDmg;
                    this.audio.playHit(true);
                    this.world.spawnHitSparks(this.boss.mesh.position, true);
                    this.game.showDamageNumber(this.boss.mesh.position, totalDmg, false);
                    this.game.shakeCamera(0.18, 0.2);

                    // Check Phase 2 (below 50% HP)
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
        this.audio.playBossRoar();
        this.game.showNotification("TAURUS DEMON ENRAGED!");
        this.game.shakeCamera(0.4, 0.6);

        // Turn on weapon flame light & emissive
        if (this.boss.mesh.userData.weaponFlame) {
            this.boss.mesh.userData.weaponFlame.intensity = 4.0;
        }
        if (this.boss.mesh.userData.lavaCrack) {
            this.boss.mesh.userData.lavaCrack.material.emissiveIntensity = 2.0;
        }
    }

    killBoss() {
        this.boss.isDead = true;
        this.boss.state = 'DEAD';
        const soulReward = 5000;
        this.souls += soulReward;
        this.audio.playVictory();
        this.audio.setBossMusic(false);
        this.game.triggerVictoryBanner();
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
        return true;
    }

    // ----------------------------------------------------
    // UPDATE TICK (COMBAT TIMERS & ENEMY AI)
    // ----------------------------------------------------
    update(delta) {
        if (this.isDead) return;

        // 1. Stamina Regeneration
        if (this.staminaDelay > 0) {
            this.staminaDelay -= delta;
        } else if (this.stamina < this.maxStamina) {
            const rate = this.isBlocking ? this.staminaRegenRate * 0.4 : this.staminaRegenRate;
            this.stamina = Math.min(this.maxStamina, this.stamina + rate * delta);
        }

        // 2. Roll Timer & i-frames
        if (this.isRolling) {
            this.rollTime += delta;
            // Invincible between 0.1s and 0.38s of roll
            this.isInvincible = this.rollTime >= 0.08 && this.rollTime <= 0.40;

            // Move player forward in rollDir
            const rollSpeed = 8.5;
            this.game.playerMesh.position.addScaledVector(this.rollDir, rollSpeed * delta);

            if (this.rollTime > 0.55) {
                this.isRolling = false;
                this.isInvincible = false;
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
            this.audio.playBossRoar();
            this.audio.setBossMusic(true);
            this.game.showNotification("TAURUS DEMON AWAKENED");
            this.game.showBossHpBar(this.boss);
        }

        if (this.boss.state === 'IDLE') return;

        // Turn towards player smoothly
        const targetAngle = Math.atan2(toPlayer.x, toPlayer.z);
        this.boss.mesh.rotation.y = targetAngle;

        this.boss.cooldown -= delta;

        if (dist > 3.8 && !this.boss.isAttacking) {
            // Boss Walk / Chase
            const speed = this.boss.isPhase2 ? 3.4 : 2.5;
            this.boss.mesh.position.x += Math.sin(targetAngle) * speed * delta;
            this.boss.mesh.position.z += Math.cos(targetAngle) * speed * delta;

            // Footstep slam shake
            this.boss.animTime += delta;
            if (Math.sin(this.boss.animTime * 4) > 0.95) {
                this.game.shakeCamera(0.08, 0.1);
            }
        } else if (this.boss.cooldown <= 0 && !this.boss.isAttacking) {
            // Initiate Boss Attack
            this.boss.isAttacking = true;
            this.boss.cooldown = this.boss.isPhase2 ? 1.8 : 2.6;

            const roll = Math.random();
            if (roll < 0.6) {
                // Slam Attack
                this.audio.playBossRoar();
                setTimeout(() => {
                    if (this.boss && !this.boss.isDead) {
                        this.audio.playBossSlam();
                        this.game.shakeCamera(0.45, 0.6);
                        this.world.spawnHitSparks(this.boss.mesh.position, true);

                        // Check slam radius
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
}
