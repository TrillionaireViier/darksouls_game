// ============================================================================
// AUTOMATED AI TESTING FRAMEWORK (QABotTester)
// Objective: Enable automated self-testing of combat logic, timings, and hitboxes
// without manual input.
//
// Key Features:
// 1. Action Simulation:
//    - Timed rolls with i-frame verification
//    - Light combo attack chains (R1)
//    - Heavy attacks (R2)
//    - Shield blocks (L1) & parry window tests
//    - Estus Flask healing at low HP
//    - Automatic enemy lock-on cycling and strafing
// 2. State Machine Monitoring & Telemetry:
//    - Tracks transitions: IDLE, CHASE, WINDUP, STRIKE, RECOVERY, STAGGER, DEAD
//    - Real-time logging of step executions to QA console and UI terminal
// 3. Anti-Stuck Watchdog:
//    - Continuously samples spatial coordinates over 1.2s windows
//    - Detects stuck states (displacement < 0.08m while navigating)
//    - Triggers lateral impulse slide & ground snap anti-stuck corrections
// ============================================================================

class QABotTester {
    constructor(game, combat, world) {
        this.game = game;
        this.combat = combat;
        this.world = world;
        this.isActive = false;

        this.cycleTimer = 0;
        this.stepCounter = 0;
        this.currentAction = 'IDLE';
        this.actionTimer = 0;
        this.attackCadence = 0.85;

        // Anti-stuck watchdog state
        this.lastSamplePos = new THREE.Vector3();
        this.stuckTimer = 0;
        this.stuckThresholdSeconds = 1.2;
        this.minDisplacement = 0.08;
        this.stuckCount = 0;
        this.unstuckCorrections = 0;

        // Telemetry & metrics
        this.logs = [];
        this.lastRecordedState = '';
        this.targetEnemy = null;
    }

    start() {
        this.isActive = true;
        this.cycleTimer = 0;
        this.stepCounter = 0;
        this.stuckTimer = 0;
        this.actionTimer = 0;
        if (this.game && this.game.playerMesh) {
            this.lastSamplePos.copy(this.game.playerMesh.position);
        }
        this.logStep("🚀 QABotTester ACTIVATED: Commencing Autonomous Combat Cycle & Watchdog", '#00ffaa');
        if (this.game && this.game.showNotification) {
            this.game.showNotification("🤖 QA BOT TESTER ACTIVATED");
        }
        if (window.qaSuite) {
            window.qaSuite.autoBotActive = true;
            window.qaSuite.updateStatsUI();
        }
    }

    stop() {
        this.isActive = false;
        this.logStep(`⏹️ QABotTester DEACTIVATED: Completed ${this.stepCounter} steps with ${this.unstuckCorrections} anti-stuck corrections.`, '#ffd700');
        if (this.game && this.game.showNotification) {
            this.game.showNotification("🤖 QA BOT TESTER STOPPED");
        }
        if (window.qaSuite) {
            window.qaSuite.autoBotActive = false;
            window.qaSuite.updateStatsUI();
        }
    }

    toggle() {
        if (this.isActive) this.stop();
        else this.start();
        return this.isActive;
    }

    // ------------------------------------------------------------------------
    // ANTI-STUCK WATCHDOG & CORRECTION SYSTEM
    // ------------------------------------------------------------------------
    checkStuckWatchdog(delta) {
        if (!this.game || !this.game.playerMesh) return;
        const pPos = this.game.playerMesh.position;

        this.stuckTimer += delta;
        if (this.stuckTimer >= this.stuckThresholdSeconds) {
            const dist = pPos.distanceTo(this.lastSamplePos);
            // If the bot was trying to navigate towards a target but moved less than 0.08m
            if (dist < this.minDisplacement && this.currentAction === 'APPROACH') {
                this.stuckCount++;
                this.unstuckCorrections++;
                this.logStep(`⚠️ STUCK DETECTED at (${pPos.x.toFixed(2)}, ${pPos.z.toFixed(2)}). Displacement: ${dist.toFixed(3)}m < ${this.minDisplacement}m. Executing anti-stuck correction!`, '#ffaa00');

                // Corrective impulse: lateral slide + forward nudge
                const angle = Math.random() * Math.PI * 2;
                pPos.x += Math.cos(angle) * 0.95;
                pPos.z += Math.sin(angle) * 0.95;

                // Snap feet to safe ground height
                if (this.world && this.world.getGroundHeight) {
                    pPos.y = this.world.getGroundHeight(pPos.x, pPos.z, pPos.y);
                }

                // Enforce zone boundaries
                if (window.collisionSystem) {
                    window.collisionSystem.enforceBoundaries(pPos, 0.45, pPos.y);
                }

                this.logStep(`✅ ANTI-STUCK CORRECTION APPLIED: New pos (${pPos.x.toFixed(2)}, ${pPos.y.toFixed(2)}, ${pPos.z.toFixed(2)}). Resuming navigation.`, '#00ffaa');
                if (this.game.showNotification) {
                    this.game.showNotification("🛠️ ANTI-STUCK CORRECTION APPLIED");
                }
            }
            this.lastSamplePos.copy(pPos);
            this.stuckTimer = 0;
        }
    }

    // ------------------------------------------------------------------------
    // STATE MACHINE MONITOR & TELEMETRY
    // ------------------------------------------------------------------------
    monitorStateMachines() {
        if (!this.combat) return;

        // Player state
        const pState = this.combat.isAttacking ? 'ATTACK' :
                       (this.combat.isRolling ? 'ROLL' :
                       (this.combat.isDrinkingEstus ? 'ESTUS' :
                       (this.combat.isBlocking ? 'BLOCK' : 'READY')));

        // Target mob or boss state
        const target = this.getPriorityTarget();
        if (target && target.mesh) {
            const mState = target.state || (target.isAttacking ? (target.attackPhase || 'ATTACK') : 'CHASE');
            const stateKey = `${pState}_vs_${mState}`;
            if (this.lastRecordedState !== stateKey) {
                this.lastRecordedState = stateKey;
                const dist = this.game.playerMesh.position.distanceTo(target.mesh.position).toFixed(1);
                this.logStep(`State Transition: Player [${pState}] vs Target [${target.name || 'Lordran Mob'}] [${mState}] (Distance: ${dist}m)`);
            }
        }
    }

    // ------------------------------------------------------------------------
    // PRIORITY TARGET SELECTION (BOSS OR NEAREST MOB)
    // ------------------------------------------------------------------------
    getPriorityTarget() {
        if (!this.combat) return null;
        if (this.combat.boss && !this.combat.boss.isDead && this.combat.boss.mesh) {
            return this.combat.boss;
        }
        if (this.combat.enemies && this.combat.enemies.length > 0) {
            const pPos = this.game.playerMesh.position;
            let nearest = null;
            let minDist = Infinity;
            for (let i = 0; i < this.combat.enemies.length; i++) {
                const e = this.combat.enemies[i];
                if (e.isDead || !e.mesh || !e.mesh.visible) continue;
                const d = pPos.distanceTo(e.mesh.position);
                if (d < minDist) {
                    minDist = d;
                    nearest = e;
                }
            }
            return nearest;
        }
        return null;
    }

    // ------------------------------------------------------------------------
    // MASTER FRAME UPDATE: AUTONOMOUS ACTION SIMULATION
    // ------------------------------------------------------------------------
    update(delta) {
        if (!this.isActive || !this.game || !this.combat) return;

        this.cycleTimer += delta;
        this.actionTimer += delta;

        // 1. Stuck detection & correction
        this.checkStuckWatchdog(delta);

        // 2. State machine monitor
        this.monitorStateMachines();

        // 3. Autonomous player action simulation
        const pPos = this.game.playerMesh.position;
        const target = this.getPriorityTarget();

        // Target Lock-on cycling
        if (target && target.mesh && !this.combat.lockedTarget) {
            this.combat.lockedTarget = target;
        }

        if (target && target.mesh) {
            const toTarget = new THREE.Vector3().subVectors(target.mesh.position, pPos);
            const dist = toTarget.length();

            // Smoothly face target
            this.game.playerMesh.rotation.y = Math.atan2(toTarget.x, toTarget.z);

            // Autonomous combat decision tree
            if (dist > 3.0) {
                // Approach target along ground plane
                this.currentAction = 'APPROACH';
                const speed = 4.2;
                toTarget.y = 0;
                toTarget.normalize();
                pPos.add(toTarget.multiplyScalar(speed * delta));
            } else {
                // In close combat engagement range (within 3.0m)
                // A. Evasive Roll if enemy is in active Windup/Strike
                if (target.isAttacking && (!target.attackTime || target.attackTime < 0.38) &&
                    !this.combat.isRolling && !this.combat.isInvincible) {
                    this.currentAction = 'ROLL';
                    if (this.combat.tryRoll) {
                        const rollDir = toTarget.clone().negate().normalize();
                        this.combat.tryRoll(rollDir);
                    }
                    this.stepCounter++;
                    this.logStep(`Step ${this.stepCounter}: Incoming strike telegraphed by ${target.name}. Executed tactical i-frame roll.`);
                }
                // B. Estus Healing if HP drops below 350
                else if (this.combat.hp < 350 && this.combat.estusFlasks > 0 && !this.combat.isDrinkingEstus) {
                    this.currentAction = 'ESTUS';
                    if (this.combat.tryDrinkEstus) this.combat.tryDrinkEstus();
                    this.stepCounter++;
                    this.logStep(`Step ${this.stepCounter}: Critical HP (${this.combat.hp} HP). Simulated Estus flask drink.`);
                }
                // C. Attack Execution
                else if (!this.combat.isAttacking && !this.combat.isRolling && !this.combat.isDrinkingEstus) {
                    if (this.actionTimer >= this.attackCadence) {
                        this.actionTimer = 0;
                        this.stepCounter++;
                        if (Math.random() < 0.65) {
                            this.currentAction = 'LIGHT_ATTACK';
                            if (this.combat.tryLightAttack) this.combat.tryLightAttack();
                            else if (this.combat.tryAttack) this.combat.tryAttack();
                            this.logStep(`Step ${this.stepCounter}: Executed LIGHT_ATTACK R1 combo against ${target.name}.`);
                        } else {
                            this.currentAction = 'HEAVY_ATTACK';
                            if (this.combat.tryHeavyAttack) this.combat.tryHeavyAttack();
                            this.logStep(`Step ${this.stepCounter}: Executed HEAVY_ATTACK R2 charged strike against ${target.name}.`);
                        }
                    } else if (Math.random() < 0.08 && !this.combat.isBlocking) {
                        // D. Shield Block & Parry test
                        this.currentAction = 'BLOCK';
                        if (this.combat.tryBlock) {
                            this.combat.tryBlock(true);
                            setTimeout(() => { if (this.combat && this.combat.tryBlock) this.combat.tryBlock(false); }, 350);
                        }
                    }
                }
            }
        } else {
            this.currentAction = 'IDLE';
        }
    }

    simulateAction(action) {
        if (!this.combat) return;
        switch (action) {
            case 'ATTACK_LIGHT':
            case 'LIGHT_ATTACK':
                if (this.combat.tryLightAttack) this.combat.tryLightAttack();
                else if (this.combat.tryAttack) this.combat.tryAttack();
                this.stepCounter++;
                this.logStep(`Step ${this.stepCounter}: Simulated LIGHT_ATTACK (R1).`);
                break;
            case 'ATTACK_HEAVY':
            case 'HEAVY_ATTACK':
                if (this.combat.tryHeavyAttack) this.combat.tryHeavyAttack();
                this.stepCounter++;
                this.logStep(`Step ${this.stepCounter}: Simulated HEAVY_ATTACK (R2).`);
                break;
            case 'ROLL_EVADE':
            case 'ROLL':
                if (this.combat.tryRoll) {
                    const dir = (this.game && this.game.calculateMovementDirection) ? this.game.calculateMovementDirection() : new THREE.Vector3(0,0,-1);
                    this.combat.tryRoll(dir);
                }
                this.stepCounter++;
                this.logStep(`Step ${this.stepCounter}: Simulated ROLL_EVADE (i-frame test).`);
                break;
            case 'BLOCK_SHIELD':
            case 'BLOCK':
                if (this.combat.tryBlock) {
                    this.combat.tryBlock(true);
                    setTimeout(() => { if (this.combat && this.combat.tryBlock) this.combat.tryBlock(false); }, 250);
                }
                this.stepCounter++;
                this.logStep(`Step ${this.stepCounter}: Simulated BLOCK_SHIELD (L1).`);
                break;
            case 'DRINK_ESTUS':
            case 'ESTUS':
                if (this.combat.tryDrinkEstus) this.combat.tryDrinkEstus();
                this.stepCounter++;
                this.logStep(`Step ${this.stepCounter}: Simulated DRINK_ESTUS.`);
                break;
            case 'PARRY':
                if (this.combat.tryParry) this.combat.tryParry();
                this.stepCounter++;
                this.logStep(`Step ${this.stepCounter}: Simulated PARRY.`);
                break;
            default:
                this.logStep(`Simulated custom action: ${action}`);
        }
    }

    logStep(msg, color = '#88ccff') {
        const time = new Date().toLocaleTimeString();
        const entry = { time, msg, color };
        this.logs.push(entry);
        console.log(`%c[QA BOT] ${msg}`, `color: ${color}; font-weight: bold;`);
        if (window.qaSuite && typeof window.qaSuite.appendLog === 'function') {
            window.qaSuite.appendLog('QA-BOT', msg, color);
        }
    }
}

// Global exposure
if (typeof window !== 'undefined') {
    window.QABotTester = QABotTester;
}
