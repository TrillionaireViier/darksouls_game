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
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 2.1; // Brilliant high visibility daylight exposure
        this.container.appendChild(this.renderer.domElement);

        // Subsystems
        this.audio = window.dsAudio;
        this.world = new DarkSoulsWorld(this.scene);
        this.charFactory = new DarkSoulsCharacters(this.scene);
        this.character = this.charFactory;
        this.combat = new DarkSoulsCombat(this);
        this.siege = new SiegeWarfareSystem(this);
        this.heraldry = new HeraldryNobilitySystem(this);
        this.apothecary = new ApothecaryCraftingSystem(this);

        // Player Entity
        this.playerMesh = this.charFactory.createPlayer();
        this.playerMesh.position.set(0, 0, 5); // Courtyard start near bonfire
        this.heraldry.applyHeraldryTo3DPlayer();
        this.playerVelocity = new THREE.Vector3();
        this.moveSpeed = 4.8;
        this.sprintSpeed = 7.2;

        // Player Overhead Lantern (Illuminates 360-degree surroundings with warm golden light)
        this.playerLantern = new THREE.PointLight(0xfff0d4, 3.2, 30, 1.2);
        this.playerLantern.position.set(0, 2.4, 0);
        this.playerMesh.add(this.playerLantern);

        // Player Back Fill Light (Ensures player's armor is gleaming from behind the camera)
        this.playerBackLight = new THREE.PointLight(0xddeeff, 2.2, 18, 1.4);
        this.playerBackLight.position.set(0, 1.4, -1.2);
        this.playerMesh.add(this.playerBackLight);

        // Camera Headlight (Shines forward from camera perspective so dark voids are eliminated)
        this.cameraLight = new THREE.DirectionalLight(0xeaf4ff, 1.2);
        this.camera.add(this.cameraLight);
        this.scene.add(this.camera);

        this.brightnessLevel = 0; // 0: Daylight, 1: Ultra+, 2: Clear Twilight

        // Handheld Medieval Pitch Torch State (Kingdom Come / Dark Souls Mechanics)
        this.isTorchActive = false;
        this.torchFuel = 100.0;
        this.maxTorchFuel = 100.0;

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

        // Auto-restore saved journey if present
        if (this.hasSaveData()) {
            this.loadGame(false);
            this.showNotification(`JOURNEY RESTORED &bull; SOUL LEVEL ${this.combat.level}`);
        } else {
            this.showNotification("WELCOME TO LORDRAN. PREPARE TO DIE.");
        }
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
            if (e.code === 'KeyT') this.toggleTorch();
            if (e.code === 'KeyR' || e.code === 'Digit1') this.combat.tryDrinkEstus();
            if (e.code === 'Digit2' || e.code === 'KeyX') this.cycleEquippedWeapon(1);
            if (e.code === 'KeyZ') this.cycleEquippedWeapon(-1);
            if (e.code === 'KeyC') this.openWeaponArsenalModal();
            if (e.code === 'KeyQ' || e.code === 'Tab') {
                e.preventDefault();
                this.combat.tryParry();
            }
            if (e.code === 'KeyF') this.toggleLockOn();
            if (e.code === 'Space' || ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !e.repeat)) {
                if (e.code === 'Space') e.preventDefault();
                if (this.combat.isDead) {
                    this.respawnPlayer();
                } else if (!this.combat.isRolling) {
                    this.triggerRoll();
                }
            }
            if (e.code === 'KeyJ') this.combat.tryLightAttack();
            if (e.code === 'KeyK') this.combat.tryHeavyAttack();
            if (e.code === 'KeyH') {
                if (this.siege) this.siege.blowWarHorn();
            }
            if (e.code === 'KeyV') {
                if (this.siege) this.siege.deployCaltrops();
            }
            if (e.code === 'KeyB') {
                if (this.apothecary) this.apothecary.applySterileBandage();
            }
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

        let joyTouchId = null;
        let startX = 0, startY = 0;
        let currentMaxDist = 45;

        let lookTouchId = null;
        let lastLookX = 0, lastLookY = 0;

        // 1. Joystick touch start
        joyBase.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (joyTouchId !== null) return;
            const touch = e.changedTouches[0];
            joyTouchId = touch.identifier;
            this.touchJoyActive = true;
            const rect = joyBase.getBoundingClientRect();
            startX = rect.left + rect.width / 2;
            startY = rect.top + rect.height / 2;
            currentMaxDist = Math.max(30, rect.width * 0.38);
            if (navigator.vibrate) navigator.vibrate(8);
        }, { passive: false });

        // 2. Camera Touch Drag: touch anywhere outside joystick and buttons
        window.addEventListener('touchstart', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === joyTouchId) continue;

                // Check if touch is on joystick, buttons, top-header, or modal
                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                if (target && (target.closest('#touch-joystick-base') || target.closest('#touch-buttons-cluster') || target.closest('#top-header') || target.closest('.modal-overlay'))) {
                    continue;
                }

                if (lookTouchId === null) {
                    lookTouchId = touch.identifier;
                    lastLookX = touch.clientX;
                    lastLookY = touch.clientY;
                }
            }
        }, { passive: true });

        // 3. TouchMove for both Joystick and Camera Look
        window.addEventListener('touchmove', (e) => {
            for (let i = 0; i < e.touches.length; i++) {
                const touch = e.touches[i];

                // Joystick movement
                if (this.touchJoyActive && touch.identifier === joyTouchId) {
                    let dx = touch.clientX - startX;
                    let dy = touch.clientY - startY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist > currentMaxDist) {
                        dx = (dx / dist) * currentMaxDist;
                        dy = (dy / dist) * currentMaxDist;
                    }

                    joyStick.style.transform = `translate(${dx}px, ${dy}px)`;
                    this.touchJoyVector.set(dx / currentMaxDist, dy / currentMaxDist);
                }

                // Camera Look Drag
                if (touch.identifier === lookTouchId) {
                    const deltaX = touch.clientX - lastLookX;
                    const deltaY = touch.clientY - lastLookY;
                    lastLookX = touch.clientX;
                    lastLookY = touch.clientY;

                    const sensitivity = 0.0055;
                    this.cameraYaw -= deltaX * sensitivity;
                    this.cameraPitch = Math.max(-0.25, Math.min(1.2, this.cameraPitch + deltaY * sensitivity));
                }
            }
        }, { passive: false });

        const onTouchEnd = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === joyTouchId) {
                    joyTouchId = null;
                    this.touchJoyActive = false;
                    this.touchJoyVector.set(0, 0);
                    joyStick.style.transform = `translate(0px, 0px)`;
                }
                if (touch.identifier === lookTouchId) {
                    lookTouchId = null;
                }
            }
        };

        window.addEventListener('touchend', onTouchEnd, { passive: true });
        window.addEventListener('touchcancel', onTouchEnd, { passive: true });

        // 4. Mobile Buttons with tactile feedback and aim assist
        const bindTouchBtn = (id, onDown, onUp) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (navigator.vibrate) navigator.vibrate(12);
                if (onDown) onDown();
            }, { passive: false });
            if (onUp) {
                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onUp();
                }, { passive: false });
            }
        };

        bindTouchBtn('touch-btn-attack', () => {
            this.assistMobileAim();
            this.combat.tryLightAttack();
        });
        bindTouchBtn('touch-btn-heavy', () => {
            this.assistMobileAim();
            this.combat.tryHeavyAttack();
        });
        bindTouchBtn('touch-btn-block', () => this.combat.tryBlock(true), () => this.combat.tryBlock(false));
        bindTouchBtn('touch-btn-roll', () => this.triggerRoll());
        bindTouchBtn('touch-btn-estus', () => this.combat.tryDrinkEstus());
        bindTouchBtn('touch-btn-parry', () => this.combat.tryParry());
        bindTouchBtn('touch-btn-lockon', () => this.toggleLockOn());
        bindTouchBtn('touch-btn-interact', () => this.handleInteraction());
        bindTouchBtn('touch-btn-torch', () => this.toggleTorch());
        bindTouchBtn('touch-btn-weapon', () => this.cycleEquippedWeapon(1));
    }

    assistMobileAim() {
        if (this.combat.lockedTarget) return;
        let closest = null;
        let closestDist = 9.0;
        const playerPos = this.playerMesh.position;

        if (this.combat.boss && !this.combat.boss.isDead && this.combat.boss.mesh) {
            const dist = playerPos.distanceTo(this.combat.boss.mesh.position);
            if (dist < closestDist) {
                closest = this.combat.boss.mesh;
                closestDist = dist;
            }
        }

        if (this.combat.enemies) {
            for (const enemy of this.combat.enemies) {
                if (!enemy.isDead && enemy.mesh) {
                    const dist = playerPos.distanceTo(enemy.mesh.position);
                    if (dist < closestDist) {
                        closest = enemy.mesh;
                        closestDist = dist;
                    }
                }
            }
        }

        if (closest) {
            const targetAngle = Math.atan2(closest.position.x - playerPos.x, closest.position.z - playerPos.z);
            this.playerMesh.rotation.y = targetAngle;
        }
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

        for (const item of this.world.interactables) {
            const d = pPos.distanceTo(item.position);
            if (d <= item.radius) {
                if (item.type === 'bonfire') {
                    this.combat.restAtBonfire();
                    this.refuelTorch(100);
                    this.openBonfireModal();
                    return;
                } else if (item.type === 'torch_sconce') {
                    if (!item.isLit) {
                        item.lightUp();
                        this.combat.souls += 50;
                        this.updateSoulsHUD();
                        this.showNotification("🔥 TORCH LIT &bull; +50 SOULS");
                        if (this.audio) this.audio.playTorchIgnite();
                        return;
                    } else {
                        this.refuelTorch(30);
                        return;
                    }
                } else if (item.type === 'merchant') {
                    this.openMerchantModal();
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

    openMerchantModal() {
        const modal = document.getElementById('merchant-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.updateMerchantUI();
            this.audio.playRoll();
        }
    }

    closeMerchantModal() {
        const modal = document.getElementById('merchant-modal');
        if (modal) modal.style.display = 'none';
    }

    openWeaponArsenalModal() {
        const modal = document.getElementById('weapons-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.updateArsenalUI();
            this.audio.playRoll();
        }
    }

    closeWeaponArsenalModal() {
        const modal = document.getElementById('weapons-modal');
        if (modal) modal.style.display = 'none';
    }

    // ----------------------------------------------------
    // SIEGE WARFARE MODAL (391–400)
    // ----------------------------------------------------
    openSiegeModal() {
        const modal = document.getElementById('siege-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.updateSiegeUI();
            if (this.audio) this.audio.playRoll();
        }
    }

    closeSiegeModal() {
        const modal = document.getElementById('siege-modal');
        if (modal) modal.style.display = 'none';
    }

    updateSiegeUI() {
        if (!this.siege) return;
        const s = this.siege;

        // Trebuchet labels
        const cwEl = document.getElementById('treb-cw-val');
        if (cwEl) cwEl.textContent = s.trebuchet.counterweightKg + ' kg';
        const angleEl = document.getElementById('treb-angle-val');
        if (angleEl) angleEl.textContent = s.trebuchet.winchAngleDeg + '°';
        const distEl = document.getElementById('treb-last-dist');
        if (distEl) distEl.textContent = s.trebuchet.lastHitDistance ? (s.trebuchet.lastHitDistance + ' m') : '--';

        // Battering Ram
        const ramFill = document.getElementById('ram-sync-bar');
        if (ramFill) ramFill.style.width = Math.round(s.batteringRam.rhythmBeat * 100) + '%';
        const gateHp = document.getElementById('ram-gate-hp');
        if (gateHp) gateHp.textContent = s.batteringRam.gateIntegrity + ' / ' + s.batteringRam.maxGateIntegrity;

        // Boiling Oil & Caltrops
        const oilCount = document.getElementById('siege-oil-count');
        if (oilCount) oilCount.textContent = s.boilingOil.cauldronsReady + ' / ' + s.boilingOil.maxCauldrons;
        const caltropCount = document.getElementById('siege-caltrop-count');
        if (caltropCount) caltropCount.textContent = s.caltrops.carried;

        // Tower
        const towerPct = document.getElementById('siege-tower-pct');
        if (towerPct) towerPct.textContent = Math.round(s.siegeTower.progressPct) + '%';
    }

    // ----------------------------------------------------
    // HERALDRY & NOBILITY MODAL (401–410)
    // ----------------------------------------------------
    openHeraldryModal() {
        const modal = document.getElementById('heraldry-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.updateHeraldryUI();
            if (this.audio) this.audio.playRoll();
        }
    }

    closeHeraldryModal() {
        const modal = document.getElementById('heraldry-modal');
        if (modal) modal.style.display = 'none';
    }

    updateHeraldryUI() {
        if (!this.heraldry) return;
        const h = this.heraldry;

        // Render preview canvas
        const previewCanvas = document.getElementById('heraldry-preview-canvas');
        if (previewCanvas) {
            h.renderCoatOfArms(previewCanvas);
        }

        // Rank & Honor
        const rankObj = h.getCurrentRank();
        const rankEl = document.getElementById('heraldry-rank-title');
        if (rankEl) rankEl.textContent = rankObj.title;
        const honorEl = document.getElementById('heraldry-honor-pts');
        if (honorEl) honorEl.textContent = h.chivalryHonor + ' pts';
        const perkEl = document.getElementById('heraldry-perk-desc');
        if (perkEl) perkEl.textContent = rankObj.perk;

        // Fief Taxes
        let uncollected = 0;
        h.fiefdoms.forEach(f => uncollected += Math.floor(f.uncollectedTithe));
        const titheEl = document.getElementById('fief-uncollected-val');
        if (titheEl) titheEl.textContent = uncollected + ' Souls';
    }

    // ----------------------------------------------------
    // APOTHECARY & MEDIEVAL SURGERY MODAL (411–420)
    // ----------------------------------------------------
    openApothecaryModal() {
        const modal = document.getElementById('apothecary-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.updateApothecaryUI();
            if (this.audio) this.audio.playRoll();
        }
    }

    closeApothecaryModal() {
        const modal = document.getElementById('apothecary-modal');
        if (modal) modal.style.display = 'none';
    }

    updateApothecaryUI() {
        if (!this.apothecary) return;
        const a = this.apothecary;

        // Leeches & Bandages
        const leechEl = document.getElementById('med-leech-count');
        if (leechEl) leechEl.textContent = a.leechcraft.leechesInJar;
        const bandEl = document.getElementById('med-bandage-count');
        if (bandEl) bandEl.textContent = a.craftedMeds.sterileBandages;
        const poppyEl = document.getElementById('med-poppy-count');
        if (poppyEl) poppyEl.textContent = a.craftedMeds.poppyExtracts;
        const antiEl = document.getElementById('med-antidote-count');
        if (antiEl) antiEl.textContent = a.craftedMeds.venomAntidotes;

        // Alembic Temp
        const tempEl = document.getElementById('alembic-temp-val');
        if (tempEl) tempEl.textContent = Math.round(a.alembic.currentTempC) + '°C';
        const distBar = document.getElementById('alembic-distill-bar');
        if (distBar) distBar.style.width = Math.round(a.alembic.distillProgress) + '%';

        // Mortar progress
        const grindBar = document.getElementById('mortar-grind-bar');
        if (grindBar) grindBar.style.width = Math.round(a.mortarPestle.crushProgress) + '%';
    }

    // ----------------------------------------------------
    // TORCH SYSTEM (HANDHELD TORCH & FUEL CONSUMPTION)
    // ----------------------------------------------------
    toggleTorch(forced = null) {
        if (forced !== null) {
            this.isTorchActive = forced;
        } else {
            this.isTorchActive = !this.isTorchActive;
        }

        if (this.isTorchActive && this.torchFuel <= 0) {
            this.isTorchActive = false;
            this.showNotification("TORCH OUT OF FUEL &bull; REFUEL AT BONFIRE OR SCONCES");
            if (this.audio) this.audio.playTorchSizzle();
            return;
        }

        // Toggle visibility on 3D player model
        if (this.charFactory && this.charFactory.setPlayerTorchVisible) {
            this.charFactory.setPlayerTorchVisible(this.playerMesh, this.isTorchActive);
        }

        const btn = document.getElementById('btn-torch-toggle');
        const fuelContainer = document.getElementById('torch-fuel-container');
        const touchBtn = document.getElementById('touch-btn-torch');

        if (this.isTorchActive) {
            if (this.audio) this.audio.playTorchIgnite();
            this.showNotification("🔥 TORCH EQUIPPED &bull; DARKNESS DISPELLED &bull; FIRE DAMAGE INFUSED");
            if (btn) {
                btn.style.borderColor = '#ffaa33';
                btn.style.color = '#ffdd77';
                btn.style.boxShadow = '0 0 14px rgba(255,150,30,0.6)';
            }
            if (touchBtn) {
                touchBtn.style.borderColor = '#ffdd77';
                touchBtn.style.boxShadow = '0 0 14px rgba(255,150,30,0.6)';
            }
            if (fuelContainer) fuelContainer.style.display = 'block';
        } else {
            if (this.audio) this.audio.playTorchSizzle();
            this.showNotification("TORCH STOWED &bull; SHIELD RE-EQUIPPED");
            if (btn) {
                btn.style.borderColor = '#ff7722';
                btn.style.color = '#ffaa44';
                btn.style.boxShadow = '0 0 8px rgba(255,119,34,0.35)';
            }
            if (touchBtn) {
                touchBtn.style.borderColor = '#ff7722';
                touchBtn.style.boxShadow = '0 0 10px rgba(255,119,34,0.4)';
            }
            if (fuelContainer) fuelContainer.style.display = 'none';
        }
        this.updateTorchHUD();
    }

    refuelTorch(amount = 100) {
        this.torchFuel = Math.min(this.maxTorchFuel, this.torchFuel + amount);
        this.updateTorchHUD();
        this.showNotification(`🔥 TORCH REFUELED (${Math.round(this.torchFuel)}% PITCH FUEL)`);
        if (this.audio) this.audio.playTorchIgnite();
    }

    updateTorchHUD() {
        const fill = document.getElementById('torch-bar-fill');
        const text = document.getElementById('torch-fuel-text');
        if (fill) fill.style.width = `${Math.round(this.torchFuel)}%`;
        if (text) text.textContent = `${Math.round(this.torchFuel)}%`;
    }

    cycleBrightness() {
        this.brightnessLevel = (this.brightnessLevel || 0) + 1;
        if (this.brightnessLevel > 2) this.brightnessLevel = 0;

        const btn = document.getElementById('btn-brightness-toggle');
        if (this.brightnessLevel === 0) {
            this.renderer.toneMappingExposure = 2.1;
            if (this.world.moonlight) this.world.moonlight.intensity = 2.6;
            if (this.world.ambientLight) this.world.ambientLight.intensity = 1.9;
            if (this.playerLantern) this.playerLantern.intensity = 3.2;
            if (this.cameraLight) this.cameraLight.intensity = 1.2;
            if (btn) btn.textContent = '☀️ DAYLIGHT';
            this.showNotification("LIGHTING: HIGH VISIBILITY DAYLIGHT");
        } else if (this.brightnessLevel === 1) {
            this.renderer.toneMappingExposure = 2.7;
            if (this.world.moonlight) this.world.moonlight.intensity = 3.4;
            if (this.world.ambientLight) this.world.ambientLight.intensity = 2.6;
            if (this.playerLantern) this.playerLantern.intensity = 4.2;
            if (this.cameraLight) this.cameraLight.intensity = 1.8;
            if (btn) btn.textContent = '☀️ ULTRA+';
            this.showNotification("LIGHTING: MAXIMUM BRIGHTNESS (NO SHADOWS)");
        } else {
            this.renderer.toneMappingExposure = 1.7;
            if (this.world.moonlight) this.world.moonlight.intensity = 1.8;
            if (this.world.ambientLight) this.world.ambientLight.intensity = 1.4;
            if (this.playerLantern) this.playerLantern.intensity = 2.4;
            if (this.cameraLight) this.cameraLight.intensity = 0.8;
            if (btn) btn.textContent = '🌙 TWILIGHT';
            this.showNotification("LIGHTING: CLEAR DUSK & MOONLIGHT");
        }
    }

    cycleEquippedWeapon(dir = 1) {
        if (!this.combat) return;
        const unlocked = this.combat.unlockedWeapons;
        if (!unlocked || unlocked.length <= 1) {
            this.showNotification("ONLY 1 WEAPON OWNED &bull; VISIT UNDEAD MERCHANT");
            return;
        }

        let idx = unlocked.indexOf(this.combat.currentWeaponId);
        if (idx < 0) idx = 0;
        idx = (idx + dir + unlocked.length) % unlocked.length;
        this.combat.equipWeapon(unlocked[idx]);
    }

    updateWeaponHUD(wpn) {
        if (!wpn) return;
        const rightSlot = document.querySelector('.equipment-dpad .eq-right');
        if (rightSlot) {
            const iconSpan = rightSlot.querySelector('.eq-icon');
            if (iconSpan) iconSpan.textContent = wpn.icon || '⚔️';
            rightSlot.title = `${wpn.name} (Press 2 / X to switch)`;
        }
        const nameLabel = document.getElementById('active-weapon-name');
        if (nameLabel) {
            nameLabel.textContent = wpn.name;
        }
    }

    updateMerchantUI() {
        if (!this.combat) return;
        const soulsEl = document.getElementById('merchant-souls-val');
        if (soulsEl) soulsEl.textContent = this.combat.souls.toLocaleString();

        const cards = document.querySelectorAll('.merchant-weapon-card');
        cards.forEach(card => {
            const wid = card.getAttribute('data-weapon-id');
            const wpn = this.combat.weapons[wid];
            if (!wpn) return;

            const isOwned = this.combat.unlockedWeapons.includes(wid);
            const isEquipped = this.combat.currentWeaponId === wid;
            const btn = card.querySelector('.btn-merchant-action');
            if (btn) {
                if (isEquipped) {
                    btn.textContent = 'EQUIPPED';
                    btn.disabled = true;
                    btn.style.borderColor = '#88ff88';
                    btn.style.color = '#88ff88';
                    btn.style.background = 'rgba(20, 80, 40, 0.4)';
                } else if (isOwned) {
                    btn.textContent = 'EQUIP';
                    btn.disabled = false;
                    btn.style.borderColor = '#ffd276';
                    btn.style.color = '#ffd276';
                    btn.style.background = 'rgba(70, 50, 20, 0.5)';
                    btn.onclick = () => { this.combat.equipWeapon(wid); this.updateMerchantUI(); };
                } else {
                    btn.textContent = `BUY (${wpn.cost.toLocaleString()})`;
                    btn.disabled = this.combat.souls < wpn.cost;
                    btn.style.borderColor = this.combat.souls >= wpn.cost ? '#ffd276' : '#554433';
                    btn.style.color = this.combat.souls >= wpn.cost ? '#fff' : '#887766';
                    btn.style.background = this.combat.souls >= wpn.cost ? 'linear-gradient(180deg, #64441e 0%, #322008 100%)' : '#221a14';
                    btn.onclick = () => { this.combat.buyWeapon(wid); };
                }
            }
        });
    }

    updateArsenalUI() {
        if (!this.combat) return;
        const cards = document.querySelectorAll('.arsenal-weapon-card');
        cards.forEach(card => {
            const wid = card.getAttribute('data-weapon-id');
            const isOwned = this.combat.unlockedWeapons.includes(wid);
            const isEquipped = this.combat.currentWeaponId === wid;
            const btn = card.querySelector('.btn-arsenal-equip');
            if (btn) {
                if (isEquipped) {
                    btn.textContent = 'EQUIPPED';
                    btn.disabled = true;
                    btn.style.borderColor = '#88ff88';
                    btn.style.color = '#88ff88';
                } else if (isOwned) {
                    btn.textContent = 'EQUIP';
                    btn.disabled = false;
                    btn.style.borderColor = '#ffd276';
                    btn.style.color = '#ffd276';
                    btn.onclick = () => { this.combat.equipWeapon(wid); this.updateArsenalUI(); };
                } else {
                    btn.textContent = 'LOCKED (BUY AT MERCHANT)';
                    btn.disabled = true;
                    btn.style.borderColor = '#443322';
                    btn.style.color = '#776655';
                }
            }
        });
    }

    openBonfireModal() {
        if (this.ui.levelModal) {
            this.ui.levelModal.style.display = 'flex';
            this.updateLevelModalValues();
            this.updateSaveUI();
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
        let fwd = 0;
        let right = 0;

        // Keyboard
        if (this.keys['KeyW'] || this.keys['ArrowUp']) fwd += 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) fwd -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) right += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) right -= 1;

        // Touch Joystick (y > 0 is down/back, y < 0 is up/forward)
        if (this.touchJoyActive) {
            fwd -= this.touchJoyVector.y;
            right += this.touchJoyVector.x;
        }

        if (Math.abs(fwd) < 0.001 && Math.abs(right) < 0.001) {
            return new THREE.Vector3();
        }

        // Camera forward and right vectors on XZ ground plane
        const camForward = new THREE.Vector3(-Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw)).normalize();
        const camRight = new THREE.Vector3(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw)).normalize();

        const moveDir = new THREE.Vector3()
            .addScaledVector(camForward, fwd)
            .addScaledVector(camRight, right)
            .normalize();

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
        if (this.siege) this.siege.update(delta);
        if (this.heraldry) this.heraldry.update(delta);
        if (this.apothecary) this.apothecary.update(delta);

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
            const uData = this.playerMesh.userData;
            if (this.combat.isBackstep) {
                // Backstep hop animation (0.38s)
                const progress = Math.min(1.0, this.combat.rollTime / 0.38);
                this.playerMesh.position.y = Math.sin(progress * Math.PI) * 0.28;
                if (uData.torso) {
                    uData.torso.rotation.x = Math.sin(progress * Math.PI) * 0.35;
                }
                if (uData.leftHip && uData.rightHip) {
                    uData.leftHip.rotation.x = -0.4;
                    uData.rightHip.rotation.x = -0.4;
                }
            } else {
                // Full 3D directional somersault roll (0.52s)
                const progress = Math.min(1.0, this.combat.rollTime / 0.52);

                // 1. Orient player mesh towards roll direction
                const rollYaw = Math.atan2(this.combat.rollDir.x, this.combat.rollDir.z);
                this.playerMesh.rotation.y = rollYaw;

                // 2. Full 360 somersault flip
                if (uData.torso) {
                    uData.torso.rotation.x = progress * Math.PI * 2;
                }

                // 3. Tuck legs & arms into tight somersault ball
                const tuck = Math.sin(progress * Math.PI);
                if (uData.leftHip && uData.rightHip) {
                    uData.leftHip.rotation.x = -tuck * 1.4;
                    uData.rightHip.rotation.x = -tuck * 1.4;
                }
                if (uData.leftShoulder && uData.rightShoulder) {
                    uData.leftShoulder.rotation.x = tuck * 1.1;
                    uData.rightShoulder.rotation.x = tuck * 1.1;
                }

                // 4. Drop Y position close to ground during roll
                const groundY = this.world.getGroundHeight(this.playerMesh.position.x, this.playerMesh.position.z);
                this.playerMesh.position.y = groundY - Math.sin(progress * Math.PI) * 0.35;

                // 5. Spawn i-frame ghost trail & embers
                if (this.combat.isInvincible && Math.random() < 0.45) {
                    this.spawnRollGhostTrail();
                }
            }
            return;
        } else {
            // Restore upright posture when not rolling
            const uData = this.playerMesh.userData;
            if (uData.torso && uData.torso.rotation.x !== 0 && !this.combat.isAttacking) {
                uData.torso.rotation.x = 0;
            }
            if (uData.leftShoulder && uData.rightShoulder && !this.combat.isAttacking && !this.combat.isBlocking) {
                if (this.isTorchActive) {
                    uData.leftShoulder.rotation.x = -0.65;
                    uData.leftShoulder.rotation.z = -0.15;
                } else {
                    uData.leftShoulder.rotation.x = 0;
                    uData.leftShoulder.rotation.z = 0;
                }
                uData.rightShoulder.rotation.x = 0;
            }

            // 3D Vertical Physics & Terrain Elevation
            const pPos = this.playerMesh.position;
            const targetGroundY = this.world.getGroundHeight(pPos.x, pPos.z);
            const heightDiff = pPos.y - targetGroundY;

            if (heightDiff > 0.16 || this.playerVelocity.y < -0.2) {
                // Airborne / falling
                this.playerVelocity.y -= 26 * delta; // Gravity
                pPos.y += this.playerVelocity.y * delta;

                if (pPos.y <= targetGroundY) {
                    const fallSpeed = -this.playerVelocity.y;
                    pPos.y = targetGroundY;
                    this.playerVelocity.y = 0;

                    if (fallSpeed > 4.5) {
                        this.audio.playFootstep();
                        this.shakeCamera(0.18, 0.25);
                        this.world.spawnLandingDust(pPos);

                        if (this.combat.isPlungingAttack) {
                            this.combat.executePlungingImpact(fallSpeed);
                        }
                    }
                }
            } else {
                // Grounded: smoothly adhere to steps and slopes
                pPos.y = THREE.MathUtils.lerp(pPos.y, targetGroundY, Math.min(1.0, delta * 20));
                this.playerVelocity.y = 0;
            }
        }

        const moveDir = this.calculateMovementDirection();
        const isMoving = moveDir.lengthSq() > 0.001;

        if (isMoving && !this.combat.isAttacking && !this.combat.isDrinkingEstus && !this.combat.isStaggered) {
            // Speed (holding Shift = sprint if stamina > 0)
            const isSprinting = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) && this.combat.stamina > 5;
            let speed = isSprinting ? this.sprintSpeed : (this.combat.isBlocking ? this.moveSpeed * 0.55 : this.moveSpeed);

            // Water surface drag in Flooded Catacombs (y <= -4.0)
            const isInWater = this.playerMesh.position.y <= -4.0;
            if (isInWater) {
                speed *= 0.88;
            }

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

            // Periodic footstep audio & surface splash particles
            if (Math.sin(time * freq) > 0.95) {
                if (isInWater) {
                    this.audio.playWaterSplash();
                    this.world.spawnWaterSplash(this.playerMesh.position);
                } else {
                    this.audio.playFootstep();
                }
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
            } else if (this.combat.attackCombo === 5) { // Running Leaping Jump Attack
                uData.swordGroup.rotation.x = 2.4 - Math.sin(Math.min(1.0, t * 4) * Math.PI) * 2.6;
                uData.swordGroup.position.y = Math.sin(t * 5) * 0.3;
            } else if (this.combat.attackCombo === 6) { // Plunging Attack (blade down)
                uData.swordGroup.rotation.set(Math.PI * 0.95, 0, 0);
                uData.swordGroup.position.set(0, -0.4, 0.4);
            }
        } else if (uData.swordGroup) {
            uData.swordGroup.rotation.set(Math.PI / 2, 0, 0);
            uData.swordGroup.position.set(0, 0, 0);
        }
    }

    resolvePlayerCollisions() {
        const pPos = this.playerMesh.position;
        const playerBottom = pPos.y;
        const playerTop = pPos.y + 1.8;

        for (const box of this.world.colliders) {
            // Check vertical tier overlap:
            if (playerBottom < box.max.y && playerTop > box.min.y) {
                // Check horizontal penetration:
                if (pPos.x >= box.min.x && pPos.x <= box.max.x &&
                    pPos.z >= box.min.z && pPos.z <= box.max.z) {
                    const dx1 = Math.abs(pPos.x - box.min.x);
                    const dx2 = Math.abs(pPos.x - box.max.x);
                    const dz1 = Math.abs(pPos.z - box.min.z);
                    const dz2 = Math.abs(pPos.z - box.max.z);

                    const minD = Math.min(dx1, dx2, dz1, dz2);
                    if (minD === dx1) pPos.x = box.min.x - 0.45;
                    else if (minD === dx2) pPos.x = box.max.x + 0.45;
                    else if (minD === dz1) pPos.z = box.min.z - 0.45;
                    else if (minD === dz2) pPos.z = box.max.z + 0.45;
                }
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

        // Route Compass Pill Active Highlight
        const rRamparts = document.getElementById('route-ramparts');
        const rCatacombs = document.getElementById('route-catacombs');
        const rBridge = document.getElementById('route-bridge');
        if (rRamparts && rCatacombs && rBridge) {
            const isRamparts = pPos.x > 13;
            const isCatacombs = pPos.x < -13;
            const isBridge = !isRamparts && !isCatacombs && pPos.z > 25;

            rRamparts.style.opacity = isRamparts ? '1' : '0.75';
            rRamparts.style.transform = isRamparts ? 'scale(1.06)' : 'scale(1)';
            rRamparts.style.boxShadow = isRamparts ? '0 0 16px rgba(255,215,0,0.85)' : '0 0 6px rgba(255,215,0,0.2)';

            rCatacombs.style.opacity = isCatacombs ? '1' : '0.75';
            rCatacombs.style.transform = isCatacombs ? 'scale(1.06)' : 'scale(1)';
            rCatacombs.style.boxShadow = isCatacombs ? '0 0 16px rgba(0,255,170,0.85)' : '0 0 6px rgba(0,255,170,0.2)';

            rBridge.style.opacity = isBridge ? '1' : '0.75';
            rBridge.style.transform = isBridge ? 'scale(1.06)' : 'scale(1)';
            rBridge.style.boxShadow = isBridge ? '0 0 16px rgba(255,119,34,0.85)' : '0 0 6px rgba(255,119,34,0.2)';
        }

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

        // ----------------------------------------------------
        // TORCH FUEL CONSUMPTION & FLAME ANIMATION (KINGDOM COME 301-315)
        // ----------------------------------------------------
        if (this.isTorchActive) {
            // Deplete torch fuel (lasts ~6.5 minutes of continuous use)
            this.torchFuel = Math.max(0, this.torchFuel - delta * 0.25);
            this.updateTorchHUD();

            // Extinguish if fuel depleted
            if (this.torchFuel <= 0) {
                this.toggleTorch(false);
                this.showNotification("TORCH EXTINGUISHED &bull; OUT OF FUEL");
                if (this.audio) this.audio.playTorchSizzle();
            }

            // Extinguish if rolling underwater in flooded catacombs
            if (this.playerMesh.position.y <= -4.6 && this.combat.isRolling) {
                this.toggleTorch(false);
                this.showNotification("TORCH EXTINGUISHED BY DEEP WATER");
                if (this.audio) this.audio.playTorchSizzle();
            }

            // Animate flame flicker and embers on player's offhand torch
            const offhand = this.playerMesh.userData.offhandTorch;
            if (offhand && offhand.visible) {
                const now = performance.now() * 0.001;
                if (offhand.userData && offhand.userData.flameLight) {
                    offhand.userData.flameLight.intensity = 3.6 + Math.sin(now * 14) * 0.5 + Math.sin(now * 29) * 0.25;
                }
                if (offhand.userData && offhand.userData.midMesh) {
                    const s = 1.0 + Math.sin(now * 15) * 0.1;
                    offhand.userData.midMesh.scale.set(s, 1.0 + Math.sin(now * 18) * 0.15, s);
                }
            }
        }

        // Animate flame if equipped as primary weapon in right hand
        if (this.combat && this.combat.currentWeaponId === 'torch') {
            const wpn = this.playerMesh.userData.swordGroup;
            if (wpn && wpn.userData && wpn.userData.isTorch) {
                const now = performance.now() * 0.001;
                if (wpn.userData.flameLight) {
                    wpn.userData.flameLight.intensity = 3.6 + Math.sin(now * 14) * 0.5 + Math.sin(now * 29) * 0.25;
                }
                if (wpn.userData.midMesh) {
                    const s = 1.0 + Math.sin(now * 15) * 0.1;
                    wpn.userData.midMesh.scale.set(s, 1.0 + Math.sin(now * 18) * 0.15, s);
                }
            }
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

    spawnRollGhostTrail() {
        // Invincibility frame ethereal ghost phantom
        const ghostMat = new THREE.MeshBasicMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.38
        });
        const ghost = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.2, 0.4), ghostMat);
        ghost.position.copy(this.playerMesh.position).add(new THREE.Vector3(0, 0.7, 0));
        ghost.rotation.y = this.playerMesh.rotation.y;
        this.scene.add(ghost);

        let op = 0.38;
        const fade = setInterval(() => {
            op -= 0.08;
            ghostMat.opacity = op;
            if (op <= 0) {
                this.scene.remove(ghost);
                ghostMat.dispose();
                clearInterval(fade);
            }
        }, 35);
    }

    selectBoss(bossId) {
        if (!this.combat) return;
        const boss = this.combat.switchBoss(bossId);
        // Warp player right in front of arena fog gate if in courtyard
        if (this.playerMesh.position.z < 80) {
            this.warpToArena();
        }
        return boss;
    }

    warpToArena() {
        // Warp player near the fog gate (z = 94)
        this.playerMesh.position.set(0, 0, 94);
        this.cameraYaw = 0;
        this.cameraPitch = 0.28;
        this.showNotification("WARPED TO THE ARENA FOG GATE");
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

    triggerVictoryBanner(bossName) {
        if (this.ui.victoryBanner) {
            const titleElem = this.ui.victoryBanner.querySelector('.victory-title');
            if (titleElem && bossName) {
                titleElem.innerHTML = `VICTORY ACHIEVED<br><span style="font-size: 0.45em; letter-spacing: 5px; color: #ffd276; opacity: 0.9;">${bossName} SLAIN</span>`;
            }
            this.ui.victoryBanner.style.display = 'flex';
            this.ui.victoryBanner.classList.add('active');
            setTimeout(() => {
                this.ui.victoryBanner.classList.remove('active');
                setTimeout(() => {
                    this.ui.victoryBanner.style.display = 'none';
                    if (titleElem) titleElem.textContent = 'VICTORY ACHIEVED';
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

    // ----------------------------------------------------
    // SAVE / LOAD SYSTEM (LOCALSTORAGE PERSISTENCE)
    // ----------------------------------------------------
    saveGame(showNotification = true, context = 'MANUAL') {
        if (!this.combat) return false;

        const saveData = {
            version: 1,
            timestamp: Date.now(),
            date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
            level: this.combat.level,
            souls: this.combat.souls,
            vigor: this.combat.vigor,
            endurance: this.combat.endurance,
            strength: this.combat.strength,
            hp: this.combat.hp,
            maxHp: this.combat.maxHp,
            stamina: this.combat.stamina,
            maxStamina: this.combat.maxStamina,
            estusFlasks: this.combat.estusFlasks,
            maxEstus: this.combat.maxEstus,
            currentBossType: this.combat.currentBossType,
            defeatedBosses: this.combat.defeatedBosses || [],
            currentWeaponId: this.combat.currentWeaponId || 'sword',
            unlockedWeapons: this.combat.unlockedWeapons || ['sword'],
            heraldry: this.heraldry ? this.heraldry.heraldry : null,
            chivalryHonor: this.heraldry ? this.heraldry.chivalryHonor : 850,
            currentRankIndex: this.heraldry ? this.heraldry.currentRankIndex : 2,
            fiefdoms: this.heraldry ? this.heraldry.fiefdoms : null,
            craftedMeds: this.apothecary ? this.apothecary.craftedMeds : null,
            trebuchet: this.siege ? { counterweightKg: this.siege.trebuchet.counterweightKg, winchAngleDeg: this.siege.trebuchet.winchAngleDeg } : null,
            playerPos: {
                x: Number(this.playerMesh.position.x.toFixed(2)),
                y: Number(this.playerMesh.position.y.toFixed(2)),
                z: Number(this.playerMesh.position.z.toFixed(2))
            }
        };

        try {
            localStorage.setItem('darksouls_save_v1', JSON.stringify(saveData));
            if (showNotification) {
                const prefix = context ? `[${context}] ` : '';
                this.showNotification(`💾 ${prefix}JOURNEY SAVED &bull; LEVEL ${saveData.level}`);
                if (this.audio) this.audio.playRoll();
            }
            this.updateSaveUI();
            return true;
        } catch (err) {
            console.error('Failed to save darksouls game:', err);
            return false;
        }
    }

    loadGame(showNotification = true) {
        try {
            const raw = localStorage.getItem('darksouls_save_v1');
            if (!raw) {
                if (showNotification) this.showNotification("NO SAVED JOURNEY FOUND IN BONFIRE ASHES");
                return false;
            }

            const data = JSON.parse(raw);
            this.combat.level = data.level || 1;
            this.combat.souls = Number(data.souls) || 0;
            this.combat.vigor = data.vigor || 10;
            this.combat.endurance = data.endurance || 10;
            this.combat.strength = data.strength || 10;
            this.combat.maxHp = data.maxHp || (1000 + (this.combat.vigor - 10) * 100);
            this.combat.hp = this.combat.maxHp;
            this.combat.maxStamina = data.maxStamina || (100 + (this.combat.endurance - 10) * 15);
            this.combat.stamina = this.combat.maxStamina;
            this.combat.maxEstus = data.maxEstus || 5;
            this.combat.estusFlasks = this.combat.maxEstus;
            this.combat.defeatedBosses = Array.isArray(data.defeatedBosses) ? data.defeatedBosses : [];
            this.combat.isDead = false;

            // Restore position (validate bounded)
            if (data.playerPos && typeof data.playerPos.x === 'number' && typeof data.playerPos.z === 'number') {
                this.playerMesh.position.set(data.playerPos.x, 0, data.playerPos.z);
            } else {
                this.playerMesh.position.set(0, 0, 5);
            }

            // Restore active boss
            if (data.currentBossType) {
                this.combat.spawnBoss(data.currentBossType);
            }

            // Restore unlocked weapons & equipped weapon
            if (Array.isArray(data.unlockedWeapons)) {
                this.combat.unlockedWeapons = data.unlockedWeapons;
            }
            if (data.currentWeaponId && this.combat.weapons[data.currentWeaponId]) {
                this.combat.equipWeapon(data.currentWeaponId);
            }

            // Restore Heraldry & Nobility
            if (data.heraldry && this.heraldry) {
                this.heraldry.heraldry = data.heraldry;
                if (data.chivalryHonor !== undefined) this.heraldry.chivalryHonor = data.chivalryHonor;
                if (data.currentRankIndex !== undefined) this.heraldry.currentRankIndex = data.currentRankIndex;
                if (Array.isArray(data.fiefdoms)) this.heraldry.fiefdoms = data.fiefdoms;
                this.heraldry.customizeHeraldry();
            }

            // Restore Apothecary Medicines
            if (data.craftedMeds && this.apothecary) {
                this.apothecary.craftedMeds = data.craftedMeds;
            }

            // Restore Siege Settings
            if (data.trebuchet && this.siege) {
                this.siege.trebuchet.counterweightKg = data.trebuchet.counterweightKg || 650;
                this.siege.trebuchet.winchAngleDeg = data.trebuchet.winchAngleDeg || 42;
            }

            this.updateHUD();
            this.updateLevelModalValues();
            this.updateBossRosterUI();
            this.updateSaveUI();

            if (this.audio) this.audio.playBonfireIgnite();
            if (showNotification) {
                this.showNotification(`📂 JOURNEY RESTORED &bull; SOUL LEVEL ${this.combat.level} (${this.combat.souls.toLocaleString()} SOULS)`);
            }
            return true;
        } catch (err) {
            console.error('Failed to load darksouls game:', err);
            if (showNotification) this.showNotification("CORRUPTED SAVE DATA");
            return false;
        }
    }

    hasSaveData() {
        return !!localStorage.getItem('darksouls_save_v1');
    }

    deleteSave() {
        localStorage.removeItem('darksouls_save_v1');
        this.showNotification("SAVED JOURNEY CLEARED FROM ASHES");
        this.updateSaveUI();
    }

    updateSaveUI() {
        const hasSave = this.hasSaveData();
        const loadBtns = document.querySelectorAll('.btn-load-save');
        loadBtns.forEach(btn => {
            btn.disabled = !hasSave;
            btn.style.opacity = hasSave ? '1' : '0.5';
            btn.style.cursor = hasSave ? 'pointer' : 'not-allowed';
        });

        const statusElem = document.getElementById('save-status-text');
        if (statusElem) {
            if (hasSave) {
                try {
                    const data = JSON.parse(localStorage.getItem('darksouls_save_v1'));
                    statusElem.innerHTML = `LAST SAVED: <span style="color:#ffd276;">${data.date || 'RECENT'}</span> &bull; LEVEL ${data.level} &bull; ${Number(data.souls).toLocaleString()} SOULS`;
                } catch(e) {
                    statusElem.textContent = 'SAVE READY IN MEMORY';
                }
            } else {
                statusElem.textContent = 'NO ACTIVE SAVE FILE (REST AT BONFIRE OR CLICK SAVE)';
            }
        }
    }

    updateBossRosterUI() {
        if (!this.combat) return;
        const defeated = this.combat.defeatedBosses || [];
        const cards = document.querySelectorAll('.boss-card');
        cards.forEach(card => {
            const bossId = card.getAttribute('data-boss-id');
            if (bossId && defeated.includes(bossId)) {
                card.classList.add('defeated');
                card.style.borderColor = 'rgba(212, 175, 55, 0.7)';
                let badge = card.querySelector('.slain-badge');
                if (!badge) {
                    badge = document.createElement('div');
                    badge.className = 'slain-badge';
                    badge.innerHTML = '⚔️ <span style="color: #ffd276; font-weight: 700;">LORD SLAIN</span>';
                    badge.style.cssText = 'font-size: 0.75rem; letter-spacing: 1.5px; margin-top: 4px;';
                    const textDiv = card.querySelector('.boss-card-text');
                    if (textDiv) textDiv.appendChild(badge);
                }
                const btn = card.querySelector('.btn-fight-boss');
                if (btn) {
                    btn.textContent = 'RE-FIGHT';
                    btn.style.borderColor = '#c49a45';
                    btn.style.color = '#ffd276';
                }
            }
        });
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
