// ==========================================
// DARK SOULS MAIN GAME CONTROLLER & UI LOOP
// Third-person camera, lock-on, input manager, HUD sync
// ==========================================

class DarkSoulsGame {
    constructor() {
        this.container = document.getElementById('game-container');
        this.clock = new THREE.Clock();

        // Three.js Core
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Subsystems
        this.audio = window.dsAudio;
        this.world = new DarkSoulsWorld(this.scene);
        this.charFactory = new DarkSoulsCharacters(this.scene);
        this.combat = new DarkSoulsCombat(this);

        // Player Entity
        this.playerMesh = this.charFactory.createPlayer();
        this.playerMesh.position.set(0, 0, 5); // Courtyard start near bonfire
        this.playerVelocity = new THREE.Vector3();
        this.moveSpeed = 4.8;
        this.sprintSpeed = 7.2;

        // Camera Parameters
        this.cameraDistance = 4.2;
        this.cameraPitch = 0.28;
        this.cameraYaw = 0;
        this.cameraTarget = new THREE.Vector3();
        this.shakeIntensity = 0;
        this.shakeDuration = 0;

        // Input State
        this.keys = {};
        this.isPointerLocked = false;
        this.mouseDeltaX = 0;
        this.mouseDeltaY = 0;

        // Virtual Touch Joystick
        this.touchJoyActive = false;
        this.touchJoyVector = new THREE.Vector2();

        // Spawn enemies
        this.combat.initEnemies(this.charFactory);

        // UI references
        this.cacheUIElements();

        // Event listeners
        this.bindEvents();

        // Resize handler
        window.addEventListener('resize', () => this.onWindowResize());

        // Start render loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);

        this.showNotification("WELCOME TO LORDRAN. PREPARE TO DIE.");
    }

    cacheUIElements() {
        this.ui = {
            hpBar: document.getElementById('hp-bar-fill'),
            hpText: document.getElementById('hp-text'),
            staminaBar: document.getElementById('stamina-bar-fill'),
            estusCount: document.getElementById('estus-count'),
            soulsCount: document.getElementById('souls-count'),
            interactionPrompt: document.getElementById('interaction-prompt'),
            promptText: document.getElementById('prompt-text'),
            damageFlash: document.getElementById('damage-flash'),
            notification: document.getElementById('game-notification'),
            deathScreen: document.getElementById('death-screen'),
            bonfireBanner: document.getElementById('bonfire-banner'),
            victoryBanner: document.getElementById('victory-banner'),
            bossHud: document.getElementById('boss-hud'),
            bossBarFill: document.getElementById('boss-bar-fill'),
            bossBarLag: document.getElementById('boss-bar-lag'),
            bossName: document.getElementById('boss-name'),
            levelModal: document.getElementById('level-up-modal'),
            lockonReticle: document.getElementById('lockon-reticle')
        };
    }

    bindEvents() {
        // Keyboard inputs
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            if (e.code === 'KeyE') this.handleInteraction();
            if (e.code === 'KeyR' || e.code === 'Digit1') this.combat.tryDrinkEstus();
            if (e.code === 'KeyQ' || e.code === 'Tab') {
                e.preventDefault();
                this.combat.tryParry();
            }
            if (e.code === 'KeyF') this.toggleLockOn();
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.combat.isDead) {
                    this.respawnPlayer();
                } else {
                    this.triggerRoll();
                }
            }
            if (e.code === 'KeyJ') this.combat.tryLightAttack();
            if (e.code === 'KeyK') this.combat.tryHeavyAttack();
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse controls
        this.renderer.domElement.addEventListener('mousedown', (e) => {
            // Lock pointer if not locked
            if (!this.isPointerLocked && document.pointerLockElement !== this.renderer.domElement) {
                this.renderer.domElement.requestPointerLock().catch(() => {});
            }

            if (e.button === 0) { // LMB -> Light Attack
                this.combat.tryLightAttack();
            } else if (e.button === 2) { // RMB -> Block
                this.combat.tryBlock(true);
            } else if (e.button === 1) { // MMB -> Lock-on
                e.preventDefault();
                this.toggleLockOn();
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                this.combat.tryBlock(false);
            }
        });

        // Context menu disable on canvas
        this.renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

        // Pointer Lock & Mouse Look
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isPointerLocked) {
                const sensitivity = 0.0022;
                this.cameraYaw -= e.movementX * sensitivity;
                this.cameraPitch = Math.max(-0.25, Math.min(1.2, this.cameraPitch + e.movementY * sensitivity));
            }
        });

        // Touch Virtual Controls for Mobile
        this.setupTouchControls();
    }

    setupTouchControls() {
        const joyBase = document.getElementById('touch-joystick-base');
        const joyStick = document.getElementById('touch-joystick-stick');
        if (!joyBase || !joyStick) return;

        let startX = 0, startY = 0;
        const maxDist = 45;

        joyBase.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchJoyActive = true;
            const touch = e.touches[0];
            const rect = joyBase.getBoundingClientRect();
            startX = rect.left + rect.width / 2;
            startY = rect.top + rect.height / 2;
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (!this.touchJoyActive) return;
            const touch = e.touches[0];
            let dx = touch.clientX - startX;
            let dy = touch.clientY - startY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > maxDist) {
                dx = (dx / dist) * maxDist;
                dy = (dy / dist) * maxDist;
            }

            joyStick.style.transform = `translate(${dx}px, ${dy}px)`;
            this.touchJoyVector.set(dx / maxDist, dy / maxDist);
        });

        const resetJoy = () => {
            this.touchJoyActive = false;
            this.touchJoyVector.set(0, 0);
            joyStick.style.transform = `translate(0px, 0px)`;
        };
        window.addEventListener('touchend', resetJoy);
        window.addEventListener('touchcancel', resetJoy);

        // Mobile Buttons
        const bindTouchBtn = (id, onDown, onUp) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (onDown) onDown();
            }, { passive: false });
            if (onUp) {
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    onUp();
                }, { passive: false });
            }
        };

        bindTouchBtn('touch-btn-attack', () => this.combat.tryLightAttack());
        bindTouchBtn('touch-btn-heavy', () => this.combat.tryHeavyAttack());
        bindTouchBtn('touch-btn-block', () => this.combat.tryBlock(true), () => this.combat.tryBlock(false));
        bindTouchBtn('touch-btn-roll', () => this.triggerRoll());
        bindTouchBtn('touch-btn-estus', () => this.combat.tryDrinkEstus());
        bindTouchBtn('touch-btn-parry', () => this.combat.tryParry());
        bindTouchBtn('touch-btn-lockon', () => this.toggleLockOn());
        bindTouchBtn('touch-btn-interact', () => this.handleInteraction());
    }

    triggerRoll() {
        const moveDir = this.calculateMovementDirection();
        this.combat.tryRoll(moveDir);
    }

    toggleLockOn() {
        if (this.combat.lockedTarget) {
            this.combat.lockedTarget = null;
            if (this.ui.lockonReticle) this.ui.lockonReticle.style.display = 'none';
            return;
        }

        // Find nearest living enemy or boss
        let nearest = null;
        let minDist = 18;
        const pPos = this.playerMesh.position;

        for (const e of this.combat.enemies) {
            if (!e.isDead) {
                const d = pPos.distanceTo(e.mesh.position);
                if (d < minDist) {
                    minDist = d;
                    nearest = e;
                }
            }
        }

        if (this.combat.boss && !this.combat.boss.isDead) {
            const d = pPos.distanceTo(this.combat.boss.mesh.position);
            if (d < minDist + 6) {
                nearest = this.combat.boss;
            }
        }

        this.combat.lockedTarget = nearest;
        if (nearest) {
            this.audio.playRoll(); // subtle lock-on sound
        }
    }

    handleInteraction() {
        const pPos = this.playerMesh.position;

        // Check Bonfire
        for (const item of this.world.interactables) {
            const d = pPos.distanceTo(item.position);
            if (d <= item.radius) {
                if (item.type === 'bonfire') {
                    this.combat.restAtBonfire();
                    this.openBonfireModal();
                    return;
                } else if (item.type === 'fog_gate' && !this.world.fogTraversed) {
                    this.world.traverseFogGate();
                    this.showNotification("TRAVERSED THE WHITE LIGHT");
                    this.audio.playRoll();
                    return;
                }
            }
        }
    }

    openBonfireModal() {
        if (this.ui.levelModal) {
            this.ui.levelModal.style.display = 'flex';
            this.updateLevelModalValues();
        }
    }

    closeBonfireModal() {
        if (this.ui.levelModal) {
            this.ui.levelModal.style.display = 'none';
        }
    }

    updateLevelModalValues() {
        const cost = this.combat.level * 250;
        document.getElementById('modal-level').textContent = this.combat.level;
        document.getElementById('modal-souls').textContent = this.combat.souls;
        document.getElementById('modal-cost').textContent = cost;
        document.getElementById('modal-vigor').textContent = this.combat.vigor;
        document.getElementById('modal-endurance').textContent = this.combat.endurance;
        document.getElementById('modal-strength').textContent = this.combat.strength;
    }

    calculateMovementDirection() {
        const moveDir = new THREE.Vector3();

        // Keyboard
        if (this.keys['KeyW'] || this.keys['ArrowUp']) moveDir.z += 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) moveDir.z -= 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveDir.x += 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) moveDir.x -= 1;

        // Touch Joystick
        if (this.touchJoyActive) {
            moveDir.x -= this.touchJoyVector.x;
            moveDir.z -= this.touchJoyVector.y;
        }

        if (moveDir.lengthSq() > 0.001) {
            moveDir.normalize();
            // Transform relative to camera yaw
            const transformed = new THREE.Vector3();
            transformed.x = moveDir.x * Math.cos(this.cameraYaw) + moveDir.z * Math.sin(this.cameraYaw);
            transformed.z = -moveDir.x * Math.sin(this.cameraYaw) + moveDir.z * Math.cos(this.cameraYaw);
            return transformed;
        }

        return moveDir;
    }

    // ----------------------------------------------------
    // ANIMATION & FRAME LOOP
    // ----------------------------------------------------
    animate() {
        requestAnimationFrame(this.animate);
        const delta = Math.min(this.clock.getDelta(), 0.1);

        // 1. Update Subsystems
        this.world.update(delta);
        this.combat.update(delta);

        // 2. Update Player Position & Rotation
        this.updatePlayer(delta);

        // 3. Update Camera
        this.updateCamera(delta);

        // 4. Update HUD
        this.updateHUD();

        // 5. Render Scene
        this.renderer.render(this.scene, this.camera);
    }

    updatePlayer(delta) {
        if (this.combat.isDead) {
            // Collapse downwards
            if (this.playerMesh.position.y > 0.1) {
                this.playerMesh.position.y = Math.max(0, this.playerMesh.position.y - delta * 2);
            }
            if (this.playerMesh.userData.torso) {
                this.playerMesh.userData.torso.rotation.x = Math.min(Math.PI / 2.2, this.playerMesh.userData.torso.rotation.x + delta * 3);
            }
            return;
        }

        if (this.combat.isRolling) {
            // Roll somersault rotation
            const progress = this.combat.rollTime / 0.55;
            if (this.playerMesh.userData.torso) {
                this.playerMesh.userData.torso.rotation.x = progress * Math.PI * 2;
            }
            return;
        } else if (this.playerMesh.userData.torso) {
            this.playerMesh.userData.torso.rotation.x = 0;
        }

        const moveDir = this.calculateMovementDirection();
        const isMoving = moveDir.lengthSq() > 0.001;

        if (isMoving && !this.combat.isAttacking && !this.combat.isDrinkingEstus && !this.combat.isStaggered) {
            // Speed (holding Shift = sprint if stamina > 0)
            const isSprinting = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) && this.combat.stamina > 5;
            const speed = isSprinting ? this.sprintSpeed : (this.combat.isBlocking ? this.moveSpeed * 0.55 : this.moveSpeed);

            if (isSprinting) {
                this.combat.stamina = Math.max(0, this.combat.stamina - delta * 18);
                this.combat.staminaDelay = 0.4;
            }

            // Move
            const step = moveDir.clone().multiplyScalar(speed * delta);
            this.playerMesh.position.add(step);

            // Collisions with world walls
            this.resolvePlayerCollisions();

            // Face movement direction or locked target
            if (this.combat.lockedTarget) {
                const toTarget = new THREE.Vector3().subVectors(this.combat.lockedTarget.mesh.position, this.playerMesh.position);
                this.playerMesh.rotation.y = Math.atan2(toTarget.x, toTarget.z);
            } else {
                const targetRot = Math.atan2(moveDir.x, moveDir.z);
                this.playerMesh.rotation.y = targetRot;
            }

            // Procedural running limb oscillation
            const time = this.clock.getElapsedTime();
            const freq = isSprinting ? 14 : 9;
            const uData = this.playerMesh.userData;
            if (uData.rightHip && uData.leftHip) {
                uData.rightHip.rotation.x = Math.sin(time * freq) * 0.5;
                uData.leftHip.rotation.x = -Math.sin(time * freq) * 0.5;
            }

            // Periodic footstep audio
            if (Math.sin(time * freq) > 0.95) {
                this.audio.playFootstep();
            }
        } else {
            // Idle breathing oscillation
            const time = this.clock.getElapsedTime();
            const uData = this.playerMesh.userData;
            if (uData.rightHip && uData.leftHip) {
                uData.rightHip.rotation.x = 0;
                uData.leftHip.rotation.x = 0;
            }
            if (uData.torso) {
                uData.torso.position.y = Math.sin(time * 2.5) * 0.03;
            }
        }

        // Shield stance
        const uData = this.playerMesh.userData;
        if (uData.shieldGroup) {
            if (this.combat.isBlocking) {
                uData.shieldGroup.position.set(0, 0.25, 0.38);
                uData.shieldGroup.rotation.y = 0;
            } else {
                uData.shieldGroup.position.set(-0.1, 0.1, 0.2);
                uData.shieldGroup.rotation.y = Math.PI / 6;
            }
        }

        // Sword swing attack animation
        if (uData.swordGroup && this.combat.isAttacking) {
            const t = this.combat.attackTime;
            if (this.combat.attackCombo === 1) { // Slash 1
                uData.swordGroup.rotation.z = Math.sin(t * 12) * 1.8;
                uData.swordGroup.rotation.y = Math.cos(t * 12) * 1.2;
            } else if (this.combat.attackCombo === 2) { // Slash 2
                uData.swordGroup.rotation.z = -Math.sin(t * 12) * 1.8;
                uData.swordGroup.rotation.x = Math.cos(t * 12) * 1.4;
            } else if (this.combat.attackCombo === 3) { // Heavy overhead
                uData.swordGroup.rotation.x = Math.sin(t * 8) * 2.2;
            } else if (this.combat.attackCombo === 4) { // Riposte thrust
                uData.swordGroup.position.z = 0.2 + Math.sin(t * 10) * 0.7;
            }
        } else if (uData.swordGroup) {
            uData.swordGroup.rotation.set(Math.PI / 2, 0, 0);
            uData.swordGroup.position.set(0, 0, 0);
        }
    }

    resolvePlayerCollisions() {
        const pPos = this.playerMesh.position;
        // Keep within world boundary bounds
        pPos.y = 0; // Stick to ground

        for (const box of this.world.colliders) {
            if (box.containsPoint(pPos)) {
                // Push back to closest edge
                const min = box.min;
                const max = box.max;
                const dx1 = Math.abs(pPos.x - min.x);
                const dx2 = Math.abs(pPos.x - max.x);
                const dz1 = Math.abs(pPos.z - min.z);
                const dz2 = Math.abs(pPos.z - max.z);

                const minD = Math.min(dx1, dx2, dz1, dz2);
                if (minD === dx1) pPos.x = min.x - 0.5;
                else if (minD === dx2) pPos.x = max.x + 0.5;
                else if (minD === dz1) pPos.z = min.z - 0.5;
                else if (minD === dz2) pPos.z = max.z + 0.5;
            }
        }
    }

    updateCamera(delta) {
        const targetPos = this.playerMesh.position.clone().add(new THREE.Vector3(0, 1.4, 0));

        // Lock-on Tracking
        if (this.combat.lockedTarget) {
            if (this.combat.lockedTarget.isDead) {
                this.combat.lockedTarget = null;
                if (this.ui.lockonReticle) this.ui.lockonReticle.style.display = 'none';
            } else {
                const targetEnemyPos = this.combat.lockedTarget.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0));
                const toEnemy = new THREE.Vector3().subVectors(targetEnemyPos, targetPos);
                this.cameraYaw = Math.atan2(toEnemy.x, toEnemy.z) + Math.PI;

                // Update screen reticle
                if (this.ui.lockonReticle) {
                    const screenPos = targetEnemyPos.clone().project(this.camera);
                    const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
                    const y = (-(screenPos.y * 0.5) + 0.5) * window.innerHeight;
                    if (screenPos.z < 1.0) {
                        this.ui.lockonReticle.style.display = 'block';
                        this.ui.lockonReticle.style.left = `${x}px`;
                        this.ui.lockonReticle.style.top = `${y}px`;
                    } else {
                        this.ui.lockonReticle.style.display = 'none';
                    }
                }
            }
        }

        // Spherical camera placement
        const cx = targetPos.x + this.cameraDistance * Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch);
        const cy = targetPos.y + this.cameraDistance * Math.sin(this.cameraPitch);
        const cz = targetPos.z + this.cameraDistance * Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch);

        // Screen shake
        let shakeOffset = new THREE.Vector3();
        if (this.shakeDuration > 0) {
            this.shakeDuration -= delta;
            shakeOffset.set(
                (Math.random() - 0.5) * this.shakeIntensity,
                (Math.random() - 0.5) * this.shakeIntensity,
                (Math.random() - 0.5) * this.shakeIntensity
            );
        }

        this.camera.position.set(cx + shakeOffset.x, cy + shakeOffset.y, cz + shakeOffset.z);
        this.camera.lookAt(targetPos);
    }

    // ----------------------------------------------------
    // UI UPDATES & NOTIFICATIONS
    // ----------------------------------------------------
    updateHUD() {
        // HP Bar
        const hpPercent = Math.max(0, (this.combat.hp / this.combat.maxHp) * 100);
        this.ui.hpBar.style.width = `${hpPercent}%`;
        this.ui.hpText.textContent = `${this.combat.hp} / ${this.combat.maxHp}`;

        // Stamina Bar
        const stamPercent = Math.max(0, (this.combat.stamina / this.combat.maxStamina) * 100);
        this.ui.staminaBar.style.width = `${stamPercent}%`;

        // Estus Flasks
        this.ui.estusCount.textContent = `x ${this.combat.estusFlasks}`;

        // Souls Counter
        this.ui.soulsCount.textContent = this.combat.souls.toLocaleString();

        // Check Interactable Proximity
        const pPos = this.playerMesh.position;
        let activePrompt = null;
        for (const item of this.world.interactables) {
            if (item.type === 'fog_gate' && this.world.fogTraversed) continue;
            if (pPos.distanceTo(item.position) <= item.radius) {
                activePrompt = item.prompt;
                break;
            }
        }

        if (activePrompt) {
            this.ui.interactionPrompt.style.display = 'block';
            this.ui.promptText.textContent = activePrompt;
        } else {
            this.ui.interactionPrompt.style.display = 'none';
        }

        // Boss Bar Update
        if (this.combat.boss && this.combat.boss.state !== 'IDLE' && !this.combat.boss.isDead) {
            this.ui.bossHud.style.display = 'block';
            const bossHpPercent = Math.max(0, (this.combat.boss.hp / this.combat.boss.maxHp) * 100);
            this.ui.bossBarFill.style.width = `${bossHpPercent}%`;
            // Smoothly lag the damage bar
            setTimeout(() => {
                if (this.ui.bossBarLag) this.ui.bossBarLag.style.width = `${bossHpPercent}%`;
            }, 300);
        } else {
            this.ui.bossHud.style.display = 'none';
        }
    }

    showBossHpBar(boss) {
        this.ui.bossHud.style.display = 'block';
        this.ui.bossName.textContent = boss.name;
    }

    shakeCamera(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    flashDamageScreen() {
        if (!this.ui.damageFlash) return;
        this.ui.damageFlash.style.opacity = '0.75';
        setTimeout(() => {
            this.ui.damageFlash.style.opacity = '0';
        }, 120);
    }

    showNotification(msg) {
        if (!this.ui.notification) return;
        this.ui.notification.textContent = msg;
        this.ui.notification.style.opacity = '1';
        this.ui.notification.style.transform = 'translate(-50%, 0)';
        clearTimeout(this.notifTimer);
        this.notifTimer = setTimeout(() => {
            this.ui.notification.style.opacity = '0';
            this.ui.notification.style.transform = 'translate(-50%, -10px)';
        }, 3200);
    }

    showDamageNumber(pos, amount, isCrit = false) {
        const div = document.createElement('div');
        div.className = `floating-damage ${isCrit ? 'crit' : ''}`;
        div.textContent = amount;

        const screenPos = pos.clone().project(this.camera);
        const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(screenPos.y * 0.5) + 0.5) * window.innerHeight;

        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
        document.body.appendChild(div);

        setTimeout(() => div.remove(), 1000);
    }

    showSoulsGained(amount) {
        this.showNotification(`+${amount} SOULS ACQUIRED`);
    }

    spawnRollDust() {
        // Roll dust puff
        const pos = this.playerMesh.position.clone();
        for (let i = 0; i < 8; i++) {
            const mesh = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.12),
                new THREE.MeshBasicMaterial({ color: 0x44403c, transparent: true, opacity: 0.6 })
            );
            mesh.position.set(
                pos.x + (Math.random() - 0.5) * 0.8,
                0.15,
                pos.z + (Math.random() - 0.5) * 0.8
            );
            this.scene.add(mesh);
            this.world.sparkParticles.push({
                mesh,
                vel: new THREE.Vector3((Math.random() - 0.5) * 2, 0.4, (Math.random() - 0.5) * 2),
                life: 0.35,
                maxLife: 0.35
            });
        }
    }

    triggerDeathScreen() {
        if (this.ui.deathScreen) {
            this.ui.deathScreen.style.display = 'flex';
            setTimeout(() => {
                this.ui.deathScreen.classList.add('active');
            }, 100);
        }
    }

    triggerBonfireLitBanner() {
        if (this.ui.bonfireBanner) {
            this.ui.bonfireBanner.style.display = 'flex';
            this.ui.bonfireBanner.classList.add('active');
            setTimeout(() => {
                this.ui.bonfireBanner.classList.remove('active');
                setTimeout(() => {
                    this.ui.bonfireBanner.style.display = 'none';
                }, 800);
            }, 3200);
        }
    }

    triggerVictoryBanner() {
        if (this.ui.victoryBanner) {
            this.ui.victoryBanner.style.display = 'flex';
            this.ui.victoryBanner.classList.add('active');
            setTimeout(() => {
                this.ui.victoryBanner.classList.remove('active');
                setTimeout(() => {
                    this.ui.victoryBanner.style.display = 'none';
                }, 1000);
            }, 4500);
        }
    }

    respawnPlayer() {
        if (this.ui.deathScreen) {
            this.ui.deathScreen.classList.remove('active');
            setTimeout(() => {
                this.ui.deathScreen.style.display = 'none';
            }, 800);
        }

        this.combat.isDead = false;
        this.combat.hp = this.combat.maxHp;
        this.combat.stamina = this.combat.maxStamina;
        this.combat.estusFlasks = this.combat.maxEstus;

        // Reset position to Bonfire
        this.playerMesh.position.set(0, 0, 5);
        if (this.playerMesh.userData.torso) {
            this.playerMesh.userData.torso.rotation.x = 0;
            this.playerMesh.userData.torso.position.y = 0;
        }

        // Respawns hollow soldiers
        this.combat.spawnEnemies();
        this.audio.playBonfireIgnite();
        this.showNotification("AWAKENED AT THE BONFIRE");
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
    window.game = new DarkSoulsGame();
});
