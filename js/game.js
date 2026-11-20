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
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1500);
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Adaptive High-FPS Resolution: Default to 60 FPS Turbo Mode for ultra-smooth 60 FPS
        const isMobile = (typeof window !== 'undefined') && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth < 1024));
        const savedPerf = localStorage.getItem('darksouls_perf_mode');
        this.performanceMode = isMobile ? true : (savedPerf !== null ? (savedPerf === 'true') : true);

        const effectivePr = 1.0; // 1.0 CSS pixel ratio eliminates Retina GPU fillrate bottlenecks
        this.renderer.setPixelRatio(effectivePr);
        this.renderer.shadowMap.enabled = !this.performanceMode;
        this.renderer.shadowMap.type = THREE.PCFShadowMap; // 2.5x faster shadow filtering
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.08;
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
        if (typeof BlacksmithForgeSystem !== 'undefined') {
            this.blacksmith = new BlacksmithForgeSystem(this);
        }

        // Interactive Inventory & Equipment System
        if (typeof DarkSoulsInventory !== 'undefined') {
            this.inventory = new DarkSoulsInventory(this);
            window.inventory = this.inventory;
        }

        // Camera Obstacle Raycasting Scratch Objects
        this._camDir = new THREE.Vector3();
        this._camRay = new THREE.Ray();
        this._camHit = new THREE.Vector3();

        // Collision & Physics Module
        if (typeof CollisionSystem !== 'undefined') {
            this.collisionSystem = new CollisionSystem(this.world, this, this.combat);
            window.collisionSystem = this.collisionSystem;
        }

        // Automated AI Testing Framework
        if (typeof QABotTester !== 'undefined') {
            this.qaBotTester = new QABotTester(this, this.combat, this.world);
            window.qaBotTester = this.qaBotTester;
        }

        // Comprehensive QA & Test Automation Suite
        if (typeof DarkSoulsQASuite !== 'undefined') {
            this.qaSuite = new DarkSoulsQASuite(this);
            window.qaSuite = this.qaSuite;
        }

        // Post-Processing Cinematic Pipeline (ACES Filmic Tone Mapping, 9-Tap Bloom, Vignette, Micro-grain)
        try {
            if (typeof DarkSoulsPostProcessing !== 'undefined') {
                this.postProcessing = new DarkSoulsPostProcessing(this.renderer, this.scene, this.camera);
                this.postProcessingEnabled = true;
                this.renderer.toneMapping = THREE.NoToneMapping; // Composite shader handles ACES filmic & bloom
            } else {
                this.postProcessing = null;
                this.postProcessingEnabled = false;
            }
        } catch (e) {
            console.warn("PostProcessing init fallback:", e);
            this.postProcessing = null;
            this.postProcessingEnabled = false;
        }

        // Player Entity
        this.playerMesh = this.charFactory.createPlayer();
        this.playerMesh.position.set(0, 0, 5); // Courtyard start near bonfire
        this.playerMesh.rotation.y = Math.PI; // Face forward into Lordran towards bonfire
        this.playerVelocity = new THREE.Vector3();
        this.moveSpeed = 4.8;
        this.sprintSpeed = 7.2;

        // Player Local Warm Fill Light (subtle, contours pop without washing out)
        this.playerLantern = new THREE.PointLight(0xffeedd, 0.45, 12, 1.8);
        this.playerLantern.position.set(0, 2.2, 0);
        this.playerMesh.add(this.playerLantern);

        // Player Back Fill Light (Gleaming knight armor highlights)
        this.playerBackLight = new THREE.PointLight(0xddeeff, 0.35, 10, 1.5);
        this.playerBackLight.position.set(0, 1.5, -1.2);
        this.playerMesh.add(this.playerBackLight);

        // Character Rim Light (Gives silhouetted edge separation against dark fortress geometry)
        this.playerRimLight = new THREE.DirectionalLight(0x7898c0, 0.55);
        this.playerRimLight.position.set(-15, 25, -20);
        this.scene.add(this.playerRimLight);

        // Camera Soft Ambient Headlight Fill (gentle non-intrusive fill)
        this.cameraLight = new THREE.DirectionalLight(0xffffff, 0.02);
        this.camera.add(this.cameraLight);
        this.scene.add(this.camera);

        this.brightnessLevel = 0; // 0: Noon Sun, 1: Maximum+, 2: Daylight

        // Handheld Medieval Pitch Torch State - Default to false so shield is shown
        this.isTorchActive = false;
        this.torchFuel = 100.0;
        this.maxTorchFuel = 100.0;
        this.charFactory.setPlayerTorchVisible(this.playerMesh, false);

        // Camera Parameters
        this.cameraDistance = 4.2;
        this.cameraPitch = 0.28;
        this.cameraYaw = 0;
        this.cameraTarget = new THREE.Vector3();
        this.shakeIntensity = 0;
        this.shakeDuration = 0;

        // Input State & Hitstop
        this.keys = {};
        this.hitstopFrames = 0;
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
        this.updatePerfUI();

        // Restore equipped skin
        const savedSkin = localStorage.getItem('darksouls_equipped_skin') || 'warrior';
        this.selectSkin(savedSkin, false);

        // Unlocked Fast-Travel Lordran Realms
        let savedLocs = null;
        try {
            savedLocs = JSON.parse(localStorage.getItem('ds_unlocked_locations'));
        } catch (e) {}
        this.unlockedLocations = Array.isArray(savedLocs) && savedLocs.length > 0 
            ? savedLocs 
            : ['royal_bridge_arena', 'firelink_shrine', 'undead_asylum', 'undead_burg_bridge', 'majula_cliffside', 'heides_tower_ruins', 'boletaria_palace_gate', 'central_yharnam_bridge', 'limgrave_first_step', 'hunters_dream'];

        // Auto-Save Management (Periodic 15s & Event-Driven)
        this.autoSaveInterval = 15.0;
        this.autoSaveTimer = 0.0;
        this.lastAutoSaveTime = Date.now();
        this.autoSaveIndicatorTimeout = null;
        this.currentZoneName = 'Royal Bridge (0m)';

        // Auto-save on page exit / tab blur
        window.addEventListener('beforeunload', () => {
            if (this.triggerAutoSave) this.triggerAutoSave('BEFOREUNLOAD');
        });
        window.addEventListener('pagehide', () => {
            if (this.triggerAutoSave) this.triggerAutoSave('PAGEHIDE');
        });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.triggerAutoSave) {
                this.triggerAutoSave('TAB_BLUR');
            }
        });

        // Auto-restore saved journey if present
        if (this.hasSaveData()) {
            this.loadGame(false);
            this.showNotification(`JOURNEY RESTORED • SOUL LEVEL ${this.combat.level}`);
        } else {
            this.showNotification("WELCOME TO LORDRAN. PREPARE TO DIE.");
        }

        setTimeout(() => {
            if (this.initFirelinkNPCs) this.initFirelinkNPCs();
        }, 900);
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
            lockonReticle: document.getElementById('lockon-reticle'),
            locationUnlockedBanner: document.getElementById('location-unlocked-banner'),
            locationUnlockedTitle: document.getElementById('location-unlocked-title'),
            locationUnlockedSubtitle: document.getElementById('location-unlocked-subtitle')
        };
    }

    bindEvents() {
        // Keyboard inputs (Full English & Cyrillic Russian Layout Support)
        window.addEventListener('keydown', (e) => {
            if (e.code) this.keys[e.code] = true;
            if (e.key) {
                this.keys[e.key.toLowerCase()] = true;
                this.keys[e.key] = true;
            }

            // Defocus any HTML button so keys are never trapped by UI elements
            if (document.activeElement && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                const k = (e.key || '').toLowerCase();
                if (['w', 'a', 's', 'd', 'ц', 'ф', 'ы', 'в', ' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'shift', 'e', 'q', 'r', 'f', 'j', 'k', 'p', 'v', 't', 'з', 'м', 'е'].includes(k) ||
                    ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft', 'ShiftRight', 'KeyE', 'KeyQ', 'KeyR', 'KeyF', 'KeyJ', 'KeyK', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                    document.activeElement.blur();
                }
            }

            if (e.code === 'Escape' || e.key === 'Escape') {
                e.preventDefault();
                this.handleEscapeKey();
                return;
            }
            if (e.code === 'KeyM' || e.key === 'm' || e.key === 'M' || e.key === 'ь' || e.key === 'Ь' || e.code === 'KeyO' || e.key === 'o' || e.key === 'O') {
                const locModal = document.getElementById('locations-modal');
                if (locModal && locModal.style.display === 'flex') {
                    this.closeLocationsModal();
                } else {
                    this.openLocationsModal();
                }
            }
            if (e.code === 'KeyE' || e.key === 'e' || e.key === 'E' || e.key === 'у' || e.key === 'У') this.handleInteraction();
            if (e.code === 'KeyG' || e.key === 'g' || e.key === 'G' || e.key === 'п' || e.key === 'П') {
                if (this._nearbyCompendiumEntity && this._nearbyCompendiumEntity.parent) {
                    const ent = this._nearbyCompendiumEntity;
                    const eName = (ent.userData && ent.userData.entry && ent.userData.entry.name) || '3D Entity';
                    if (window.compendiumInstance && window.compendiumInstance.spawnedEntities) {
                        const idx = window.compendiumInstance.spawnedEntities.indexOf(ent);
                        if (idx >= 0) window.compendiumInstance.spawnedEntities.splice(idx, 1);
                    }
                    if (ent.parent) ent.parent.remove(ent);
                    else this.scene.remove(ent);
                    this._nearbyCompendiumEntity = null;
                    this.showNotification(`✨ ${eName.toUpperCase()} BANISHED`);
                    if (this.audio && this.audio.playRoll) this.audio.playRoll();
                }
            }
            if (e.code === 'KeyT' || e.key === 't' || e.key === 'T' || e.key === 'е' || e.key === 'Е') this.toggleTorch();
            if (e.code === 'KeyR' || e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К' || e.code === 'Digit1') this.combat.tryDrinkEstus();
            if (e.code === 'KeyN' || e.key === 'n' || e.key === 'N' || e.key === 'т' || e.key === 'Т') {
                e.preventDefault();
                this.combat.trySummonSpiritAsh();
            }
            if (e.code === 'Digit6') {
                e.preventDefault();
                this.combat.cycleSpiritAsh(1);
            }
            if (e.code === 'Digit3' || e.code === 'KeyY' || e.key === 'y' || e.key === 'Y' || e.key === 'н' || e.key === 'Н') {
                e.preventDefault();
                this.combat.tryCastSpell();
            }
            if (e.code === 'Digit5' || e.code === 'KeyU' || e.key === 'u' || e.key === 'U' || e.key === 'г' || e.key === 'Г') {
                e.preventDefault();
                this.combat.cycleSpell(1);
            }
            if (e.code === 'KeyP' || e.key === 'p' || e.key === 'P' || e.key === 'з' || e.key === 'З' || e.code === 'KeyV' || e.key === 'v' || e.key === 'V' || e.key === 'м' || e.key === 'М' || e.code === 'Digit4') this.combat.tryDrinkAntidote();
            if (e.code === 'Digit2' || e.code === 'KeyX' || e.key === 'x' || e.key === 'X' || e.key === 'ч' || e.key === 'Ч') this.cycleEquippedWeapon(1);
            if (e.code === 'KeyZ' || e.key === 'z' || e.key === 'Z' || e.key === 'я' || e.key === 'Я') this.cycleEquippedWeapon(-1);
            if (e.code === 'KeyC' || e.key === 'c' || e.key === 'C' || e.key === 'с' || e.key === 'С') this.openWeaponArsenalModal();
            if (e.code === 'KeyI' || e.key === 'i' || e.key === 'I' || e.key === 'ш' || e.key === 'Ш' || e.code === 'Tab') {
                e.preventDefault();
                if (this.inventory) {
                    this.inventory.toggle();
                } else if (window.inventory) {
                    window.inventory.toggle();
                }
            }
            if (e.code === 'KeyQ' || e.key === 'q' || e.key === 'Q' || e.key === 'й' || e.key === 'Й') {
                e.preventDefault();
                this.combat.tryParry();
            }
            if (e.code === 'KeyF' || e.key === 'f' || e.key === 'F' || e.key === 'а' || e.key === 'А') this.toggleLockOn();
            if (e.code === 'Space' || e.key === ' ' || ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !e.repeat)) {
                if (e.code === 'Space' || e.key === ' ') e.preventDefault();
                if (this.combat.isDead) {
                    this.respawnPlayer();
                } else if (!this.combat.isRolling) {
                    this.triggerRoll();
                }
            }
            if (e.code === 'KeyJ' || e.key === 'j' || e.key === 'J' || e.key === 'о' || e.key === 'О') this.combat.tryLightAttack();
            if (e.code === 'KeyK' || e.key === 'k' || e.key === 'K' || e.key === 'л' || e.key === 'Л') this.combat.tryHeavyAttack();
            if (e.code === 'KeyL' || e.key === 'l' || e.key === 'L' || e.key === 'д' || e.key === 'Д') {
                this.openLoreCodexModal();
            }
            if (e.code === 'KeyH' || e.key === 'h' || e.key === 'H' || e.key === 'р' || e.key === 'Р') {
                if (this.siege) this.siege.blowWarHorn();
            }
            if (e.code === 'KeyV' || e.key === 'v' || e.key === 'V' || e.key === 'м' || e.key === 'М') {
                if (this.siege) this.siege.deployCaltrops();
            }
            if (e.code === 'KeyB' || e.key === 'b' || e.key === 'B' || e.key === 'и' || e.key === 'И') {
                if (this.apothecary) this.apothecary.applySterileBandage();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code) this.keys[e.code] = false;
            if (e.key) {
                this.keys[e.key.toLowerCase()] = false;
                this.keys[e.key] = false;
            }
        });

        window.addEventListener('blur', () => {
            this.keys = {};
        });

        // Mouse Drag-To-Look (Works BOTH with and without pointer lock!)
        let isMouseDownLook = false;
        let lastMouseX = 0, lastMouseY = 0;

        this.renderer.domElement.addEventListener('mousedown', (e) => {
            if (document.activeElement && document.activeElement.blur && document.activeElement !== document.body) {
                document.activeElement.blur();
            }

            // Lock pointer if requested and not locked
            if (!this.isPointerLocked && document.pointerLockElement !== this.renderer.domElement) {
                this.renderer.domElement.requestPointerLock().catch(() => {});
            }

            isMouseDownLook = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;

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
            isMouseDownLook = false;
            if (e.button === 2) {
                this.combat.tryBlock(false);
            }
        });

        // Context menu disable on canvas
        this.renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

        // Pointer Lock & Mouse Look
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
            document.body.classList.toggle('is-pointer-locked', this.isPointerLocked);
            const hint = document.getElementById('escape-hint-pill');
            if (hint) {
                hint.style.display = this.isPointerLocked ? 'flex' : 'none';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isPointerLocked) {
                const sensitivity = 0.0022;
                this.cameraYaw -= e.movementX * sensitivity;
                this.cameraPitch = Math.max(-0.25, Math.min(1.2, this.cameraPitch + e.movementY * sensitivity));
            } else if (isMouseDownLook) {
                const dx = e.clientX - lastMouseX;
                const dy = e.clientY - lastMouseY;
                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
                const sensitivity = 0.0035;
                this.cameraYaw -= dx * sensitivity;
                this.cameraPitch = Math.max(-0.25, Math.min(1.2, this.cameraPitch + dy * sensitivity));
            }
        });

        // Touch Virtual Controls for Mobile & Desktop
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

        // Mouse Drag Support on Joystick (Allows Desktop click-and-drag to move!)
        let isMouseJoy = false;
        joyBase.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isMouseJoy = true;
            this.touchJoyActive = true;
            const rect = joyBase.getBoundingClientRect();
            startX = rect.left + rect.width / 2;
            startY = rect.top + rect.height / 2;
            currentMaxDist = Math.max(30, rect.width * 0.38);
        });

        window.addEventListener('mousemove', (e) => {
            if (isMouseJoy) {
                let dx = e.clientX - startX;
                let dy = e.clientY - startY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > currentMaxDist) {
                    dx = (dx / dist) * currentMaxDist;
                    dy = (dy / dist) * currentMaxDist;
                }
                joyStick.style.transform = `translate(${dx}px, ${dy}px)`;
                this.touchJoyVector.set(dx / currentMaxDist, dy / currentMaxDist);
            }
        });

        window.addEventListener('mouseup', () => {
            if (isMouseJoy) {
                isMouseJoy = false;
                this.touchJoyActive = false;
                this.touchJoyVector.set(0, 0);
                joyStick.style.transform = `translate(0px, 0px)`;
            }
        });

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

        // 4. On-Screen Action Buttons (Touch + Mouse Support)
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

            // Mouse click/down support for desktop on-screen controls
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onDown) onDown();
            });
            if (onUp) {
                btn.addEventListener('mouseup', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onUp();
                });
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
                } else if (item.type === 'discovered_waystone') {
                    this.travelToLocation(item.targetLocationId, true);
                    return;
                } else if (item.type === 'return_waystone') {
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
                } else if (item.type === 'catacomb_fog_gate') {
                    if (this.combat.isBossUnlocked('nito')) {
                        this.combat.switchBoss('nito');
                    } else {
                        this.showNotification("🔒 SEALED BY ANCIENT LORD VESSEL • DEFEAT CAPRA DEMON FIRST");
                        if (this.audio) this.audio.playRoll();
                    }
                    return;
                }
            }
        }

        // Banish or Talk with nearby spawned Compendium 3D Entity with [E]
        if (this._nearbyCompendiumEntity && this._nearbyCompendiumEntity.parent) {
            const ent = this._nearbyCompendiumEntity;
            const entry = ent.userData && ent.userData.entry;
            const eName = (entry && entry.name) || '3D Entity';
            if (pPos.distanceTo(ent.position) <= 4.2) {
                if (entry && entry.category === 'NPC' && window.speakNPCDialogue) {
                    window.speakNPCDialogue(entry.id);
                    return;
                }
                if (window.compendiumInstance && window.compendiumInstance.spawnedEntities) {
                    const idx = window.compendiumInstance.spawnedEntities.indexOf(ent);
                    if (idx >= 0) window.compendiumInstance.spawnedEntities.splice(idx, 1);
                }
                if (ent.parent) ent.parent.remove(ent);
                else this.scene.remove(ent);
                this._nearbyCompendiumEntity = null;
                this.showNotification(`✨ ${eName.toUpperCase()} BANISHED`);
                if (this.audio && this.audio.playRoll) this.audio.playRoll();
                return;
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
    // RINGS & TALISMANS MODAL (30 RINGS, 4 SLOTS)
    // ----------------------------------------------------
    openRingsModal() {
        const modal = document.getElementById('rings-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.updateRingsUI();
            if (this.audio && this.audio.playRoll) this.audio.playRoll();
        }
    }

    closeRingsModal() {
        const modal = document.getElementById('rings-modal');
        if (modal) modal.style.display = 'none';
    }

    updateRingsUI() {
        if (!this.combat || !this.combat.ringsDatabase) return;
        for (let i = 0; i < 4; i++) {
            const ringId = this.combat.equippedRings[i];
            const slotEl = document.getElementById(`equipped-ring-slot-${i}`);
            if (slotEl) {
                if (ringId && this.combat.ringsDatabase[ringId]) {
                    const r = this.combat.ringsDatabase[ringId];
                    slotEl.innerHTML = `<span style="font-size: 1.4rem;">${r.icon}</span><span style="font-size: 0.72rem; color: #ffd276; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px;">${r.name}</span><button onclick="unequipRing(${i})" style="font-size: 0.65rem; color: #ff6666; background: rgba(50,15,15,0.7); border: 1px solid #aa3333; cursor: pointer; border-radius: 2px; padding: 1px 4px;">REMOVE</button>`;
                } else {
                    slotEl.innerHTML = `<span style="font-size: 1.2rem; opacity: 0.4;">💍</span><span style="font-size: 0.72rem; color: #776655;">EMPTY SLOT ${i + 1}</span>`;
                }
            }
        }

        const cards = document.querySelectorAll('.ring-card');
        cards.forEach(card => {
            const ringId = card.getAttribute('data-ring-id');
            const isEquipped = this.combat.hasRing(ringId);
            const btn = card.querySelector('.btn-equip-ring');
            if (btn) {
                if (isEquipped) {
                    btn.textContent = 'EQUIPPED';
                    btn.disabled = true;
                    btn.style.borderColor = '#88ff88';
                    btn.style.color = '#88ff88';
                } else {
                    btn.textContent = 'EQUIP';
                    btn.disabled = false;
                    btn.style.borderColor = '#ffd276';
                    btn.style.color = '#ffd276';
                    btn.onclick = () => {
                        let targetSlot = this.combat.equippedRings.findIndex(r => !r);
                        if (targetSlot === -1) targetSlot = 0;
                        this.combat.equipRing(targetSlot, ringId);
                    };
                }
            }
        });
    }

    // ----------------------------------------------------
    // GRIMOIRE SPELLS MODAL (20 SPELLS)
    // ----------------------------------------------------
    openSpiritAshesModal() {
        const modal = document.getElementById('spirit-ashes-modal');
        if (modal) modal.style.display = 'flex';
        this.renderSpiritAshesUI();
    }

    closeSpiritAshesModal() {
        const modal = document.getElementById('spirit-ashes-modal');
        if (modal) modal.style.display = 'none';
    }

    renderSpiritAshesUI() {
        const container = document.getElementById('spirit-ashes-cards-grid');
        if (!container || !this.combat || !this.combat.spiritAshesDatabase) return;
        const currentId = this.combat.currentSpiritAshId;
        const companion = this.combat.activeSpiritCompanion;
        const ashes = this.combat.spiritAshesDatabase;
        let html = '';
        for (const [id, ash] of Object.entries(ashes)) {
            const isEquipped = currentId === id;
            const isSummoned = companion && companion.id === id;
            html += `
                <div class="boss-card spirit-ash-card ${isEquipped ? 'ring-active' : ''}" data-ash-id="${id}">
                    <div class="boss-card-info">
                        <div class="boss-card-icon">${ash.icon}</div>
                        <div class="boss-card-text">
                            <div class="boss-card-name" style="color: ${ash.color ? '#' + ash.color.toString(16).padStart(6, '0') : '#ffd778'};">${ash.name.toUpperCase()}</div>
                            <div class="boss-card-desc">${ash.title} &bull; ${ash.desc}</div>
                            <div class="boss-card-stats">HP: ${ash.hp} &bull; ATK: ${ash.damage} &bull; COST: ${ash.cost} SOULS</div>
                        </div>
                    </div>
                    <button class="btn-fight-boss ${isSummoned ? 'btn-unring' : 'btn-arsenal-equip'}" onclick="summonSpiritAsh('${id}')">
                        ${isSummoned ? 'DISMISS' : (isEquipped ? 'SUMMON [4]' : 'ATTUNE')}
                    </button>
                </div>
            `;
        }
        container.innerHTML = html;
    }

    openGrimoireModal() {
        const modal = document.getElementById('grimoire-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.updateGrimoireUI();
            if (this.audio && this.audio.playRoll) this.audio.playRoll();
        }
    }

    closeGrimoireModal() {
        const modal = document.getElementById('grimoire-modal');
        if (modal) modal.style.display = 'none';
    }

    updateGrimoireUI() {
        if (!this.combat || !this.combat.spells) return;
        const cards = document.querySelectorAll('.grimoire-spell-card');
        cards.forEach(card => {
            const spellId = card.getAttribute('data-spell-id');
            const isEquipped = this.combat.currentSpellId === spellId;
            const btn = card.querySelector('.btn-equip-spell');
            if (btn) {
                if (isEquipped) {
                    btn.textContent = 'EQUIPPED';
                    btn.disabled = true;
                    btn.style.borderColor = '#00e5ff';
                    btn.style.color = '#00e5ff';
                } else {
                    btn.textContent = 'ATTUNE';
                    btn.disabled = false;
                    btn.style.borderColor = '#ffd276';
                    btn.style.color = '#ffd276';
                    btn.onclick = () => {
                        this.combat.currentSpellId = spellId;
                        this.combat.updateSpellHUD();
                        this.updateGrimoireUI();
                        if (this.showNotification) {
                            const s = this.combat.spells[spellId];
                            this.showNotification(`📜 ATTUNED: ${s.icon} ${s.name}`);
                        }
                    };
                }
            }
        });
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
    openBlacksmithModal() {
        const modal = document.getElementById('blacksmith-modal');
        if (modal) {
            modal.style.display = 'flex';
            if (this.blacksmith) this.blacksmith.updateForgeUI();
            if (this.audio && this.audio.playAnvilStrike) this.audio.playAnvilStrike();
        }
    }

    closeBlacksmithModal() {
        const modal = document.getElementById('blacksmith-modal');
        if (modal) modal.style.display = 'none';
    }

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
            this.renderer.toneMappingExposure = 1.05;
            if (this.world.moonlight) this.world.moonlight.intensity = 1.4;
            if (this.world.ambientLight) this.world.ambientLight.intensity = 0.35;
            if (this.world.hemiLight) this.world.hemiLight.intensity = 0.45;
            if (this.playerLantern) this.playerLantern.intensity = 0.45;
            if (this.cameraLight) this.cameraLight.intensity = 0.02;
            if (btn) btn.textContent = '☀️ LORDRAN SUN';
            this.showNotification("LIGHTING: LORDRAN CINEMATIC SUNLIGHT");
        } else if (this.brightnessLevel === 1) {
            this.renderer.toneMappingExposure = 1.25;
            if (this.world.moonlight) this.world.moonlight.intensity = 1.85;
            if (this.world.ambientLight) this.world.ambientLight.intensity = 0.5;
            if (this.world.hemiLight) this.world.hemiLight.intensity = 0.65;
            if (this.playerLantern) this.playerLantern.intensity = 0.75;
            if (this.cameraLight) this.cameraLight.intensity = 0.06;
            if (btn) btn.textContent = '☀️ MAXIMUM+';
            this.showNotification("LIGHTING: EXTRA BRIGHT DAYLIGHT");
        } else {
            this.renderer.toneMappingExposure = 0.95;
            if (this.world.moonlight) this.world.moonlight.intensity = 1.15;
            if (this.world.ambientLight) this.world.ambientLight.intensity = 0.25;
            if (this.world.hemiLight) this.world.hemiLight.intensity = 0.35;
            if (this.playerLantern) this.playerLantern.intensity = 0.35;
            if (this.cameraLight) this.cameraLight.intensity = 0.01;
            if (btn) btn.textContent = '☀️ MOODY DUSK';
            this.showNotification("LIGHTING: ATMOSPHERIC DUSK");
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

        // Keyboard (English WASD + Cyrillic Russian ц, ы, в, ф + Arrow Keys)
        if (this.keys['KeyW'] || this.keys['ArrowUp'] || this.keys['w'] || this.keys['W'] || this.keys['ц'] || this.keys['Ц']) fwd += 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown'] || this.keys['s'] || this.keys['S'] || this.keys['ы'] || this.keys['Ы']) fwd -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight'] || this.keys['d'] || this.keys['D'] || this.keys['в'] || this.keys['В']) right += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A'] || this.keys['ф'] || this.keys['Ф']) right -= 1;

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
    triggerHitstop(frames = 3) {
        this.hitstopFrames = Math.max(this.hitstopFrames, frames);
    }

    animate() {
        requestAnimationFrame(this.animate);

        // Hitstop Impact Freeze (freezes render/simulation for 3 frames on successful hit)
        if (this.hitstopFrames > 0) {
            this.hitstopFrames--;
            if (!this.performanceMode && this.postProcessingEnabled && this.postProcessing) {
                this.postProcessing.render(0.016);
            } else {
                this.renderer.render(this.scene, this.camera);
            }
            return;
        }

        const delta = Math.min(this.clock.getDelta(), 0.1);

        // Real-Time FPS Tracker & Diagnostics
        this.frameCount = (this.frameCount || 0) + 1;
        this.fpsTimer = (this.fpsTimer || 0) + delta;
        if (this.fpsTimer >= 0.5) {
            this.currentFps = Math.round(this.frameCount / this.fpsTimer);
            this.frameCount = 0;
            this.fpsTimer = 0;
            if (!this.fpsMeterElem) this.fpsMeterElem = document.getElementById('fps-meter');
            if (this.fpsMeterElem) {
                this.fpsMeterElem.textContent = `${this.currentFps} FPS`;
                this.fpsMeterElem.style.color = this.currentFps >= 50 ? '#00ffaa' : (this.currentFps >= 30 ? '#ffd778' : '#ff5555');
            }
        }

        // 1. Update Subsystems
        this.world.update(delta);
        this.combat.update(delta);

        // Continuous 15-Second Auto-Save Engine
        if (this.combat && !this.combat.isDead) {
            this.autoSaveTimer = (this.autoSaveTimer || 0) + delta;
            if (this.autoSaveTimer >= (this.autoSaveInterval || 15.0)) {
                this.autoSaveTimer = 0;
                this.triggerAutoSave('PERIODIC_15S');
            }
        }
        if (this.collisionSystem) this.collisionSystem.update(delta);
        if (this.qaBotTester && this.qaBotTester.isActive) this.qaBotTester.update(delta);
        if (this.updateLoreBeacons) this.updateLoreBeacons(delta);
        if (this.updateBloodstainMarker) this.updateBloodstainMarker(delta);
        if (this.siege) this.siege.update(delta);
        if (this.heraldry) this.heraldry.update(delta);
        if (this.apothecary) this.apothecary.update(delta);
        if (this.inventory) this.inventory.update(delta);
        if (window.compendiumInstance && window.compendiumInstance.update) window.compendiumInstance.update(delta);

        // 2. Update Player Position & Rotation
        this.updatePlayer(delta);

        // 3. Update Camera
        this.updateCamera(delta);

        // 4. Update HUD
        this.updateHUD(delta);

        // 5. Render Scene: Direct high-speed render in 60 FPS Turbo mode, or HDR post-processing in AAA mode
        if (!this.performanceMode && this.postProcessingEnabled && this.postProcessing) {
            this.postProcessing.render(delta);
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    updatePlayer(delta) {
        const uData = this.playerMesh.userData;
        const time = this.clock.getElapsedTime();

        // 0. Anti-Stuck Safety Watchdog for Player Combat & Locomotion Flags
        if (this.combat) {
            if (this.combat.isAttacking && (!this.combat.attackTime || this.combat.attackTime > 1.2 || isNaN(this.combat.attackTime))) {
                this.combat.isAttacking = false;
                this.combat.attackCombo = 0;
            }
            if (this.combat.isStaggered && (typeof this.combat.staggerTime !== 'number' || this.combat.staggerTime <= 0 || isNaN(this.combat.staggerTime))) {
                this.combat.isStaggered = false;
            }
            if (this.combat.isDrinkingEstus && (typeof this.combat.estusTime !== 'number' || this.combat.estusTime > 2.0 || isNaN(this.combat.estusTime))) {
                this.combat.isDrinkingEstus = false;
            }
            if (this.combat.isRolling && (typeof this.combat.rollTime !== 'number' || this.combat.rollTime > 1.0 || isNaN(this.combat.rollTime))) {
                this.combat.isRolling = false;
                this.combat.isInvincible = false;
                this.combat.isBackstep = false;
            }
        }

        // 1. DEATH COLLAPSE & PROCEDURAL LOL ANIMATIONS
        if (this.combat.isDead) {
            this.deathAnimTimer = (this.deathAnimTimer || 0) + delta;
            const t = this.deathAnimTimer;
            const style = this.deathAnimStyle !== undefined ? this.deathAnimStyle : 0;
            const groundY = this.world.getGroundHeight(this.playerMesh.position.x, this.playerMesh.position.z, this.playerMesh.position.y);

            if (style === 0) {
                // Style 0: "The Dramatic Hollywood Spin Flop"
                // Spins on Y axis, wobbles arms upward, then dramatically flops onto back
                if (t < 0.65) {
                    this.playerMesh.rotation.y += delta * 9.5 * (1.0 - t / 0.65);
                    if (uData.torso) uData.torso.rotation.x = Math.sin(t * 16) * 0.28;
                    if (uData.leftShoulder) uData.leftShoulder.rotation.z = Math.min(1.4, t * 2.8);
                    if (uData.rightShoulder) uData.rightShoulder.rotation.z = Math.max(-1.4, -t * 2.8);
                } else {
                    if (uData.torso) uData.torso.rotation.x = -Math.min(Math.PI / 2.1, (t - 0.65) * 4.5);
                    this.playerMesh.position.y = Math.max(groundY, this.playerMesh.position.y - delta * 2.5);
                    if (uData.head) uData.head.rotation.x = -0.45;
                }
            } else if (style === 1) {
                // Style 1: "The Yeet / Ragdoll Cartwheel Launch"
                // Launched into the air cartwheeling backwards with flailing limbs
                this.deathAnimVelY = (this.deathAnimVelY || 5.8) - 18 * delta;
                this.playerMesh.position.y = Math.max(groundY, this.playerMesh.position.y + this.deathAnimVelY * delta);
                this.playerMesh.position.z -= 1.8 * delta;
                this.playerMesh.rotation.x -= delta * 6.5;
                this.playerMesh.rotation.z += delta * 4.2;
                if (uData.leftShoulder) uData.leftShoulder.rotation.x = Math.sin(t * 18) * 1.5;
                if (uData.rightShoulder) uData.rightShoulder.rotation.x = -Math.sin(t * 18) * 1.5;
                if (uData.leftHip) uData.leftHip.rotation.x = Math.cos(t * 16) * 1.4;
                if (uData.rightHip) uData.rightHip.rotation.x = -Math.cos(t * 16) * 1.4;
            } else if (style === 2) {
                // Style 2: "The Melodramatic Shakespearean Kneel"
                // Falls to knees first, clutches chest, gazes up in agony, then collapses forward
                if (t < 0.95) {
                    this.playerMesh.position.y = Math.max(groundY - 0.42, this.playerMesh.position.y - delta * 2.5);
                    if (uData.leftHip && uData.rightHip) {
                        uData.leftHip.rotation.x = -1.2;
                        uData.rightHip.rotation.x = -1.2;
                    }
                    if (uData.torso) uData.torso.rotation.x = -0.32;
                    if (uData.head) uData.head.rotation.x = -0.65;
                    if (uData.leftShoulder) uData.leftShoulder.rotation.z = 0.85;
                } else {
                    if (uData.torso) uData.torso.rotation.x = Math.min(Math.PI / 2.1, uData.torso.rotation.x + delta * 3.8);
                    this.playerMesh.position.y = groundY;
                }
            } else if (style === 3) {
                // Style 3: "The Breakdance Turtle Spin"
                // Drops flat onto back and spins like a turtle shell on the floor, kicking legs
                this.playerMesh.position.y = groundY;
                this.playerMesh.rotation.x = -Math.PI / 2;
                this.playerMesh.rotation.z += delta * 14 * Math.max(0.1, 1.0 - t / 3.0);
                if (uData.leftHip) uData.leftHip.rotation.x = Math.sin(t * 16) * 0.9;
                if (uData.rightHip) uData.rightHip.rotation.x = -Math.sin(t * 16) * 0.9;
                if (uData.leftShoulder) uData.leftShoulder.rotation.z = Math.sin(t * 12) * 0.8;
                if (uData.rightShoulder) uData.rightShoulder.rotation.z = -Math.sin(t * 12) * 0.8;
            } else if (style === 4) {
                // Style 4: "The Matrix Limbo Backfall"
                // Ultra slow-mo backwards bend until the helmet touches the cobblestones
                const bend = Math.min(Math.PI * 0.65, t * 1.8);
                if (uData.torso) uData.torso.rotation.x = -bend;
                if (uData.head) uData.head.rotation.x = -bend * 0.5;
                if (uData.leftShoulder) uData.leftShoulder.rotation.set(-0.5, 0, 0.9);
                if (uData.rightShoulder) uData.rightShoulder.rotation.set(-0.5, 0, -0.9);
                this.playerMesh.position.y = Math.max(groundY, this.playerMesh.position.y - delta * 1.2);
            } else {
                // Style 5: "The Slapstick Banana Peel Slip"
                // Feet fly forward into the air, player lands with comical flat thud
                if (t < 0.35) {
                    this.playerMesh.position.y = Math.max(groundY, this.playerMesh.position.y + delta * 3.5);
                    this.playerMesh.rotation.x = -Math.min(Math.PI / 2, t * 5.0);
                    if (uData.leftHip && uData.rightHip) {
                        uData.leftHip.rotation.x = 1.4;
                        uData.rightHip.rotation.x = 1.4;
                    }
                } else {
                    this.playerMesh.position.y = groundY;
                    this.playerMesh.rotation.x = -Math.PI / 2;
                    if (uData.leftHip && uData.rightHip) {
                        uData.leftHip.rotation.x = 0.9;
                        uData.rightHip.rotation.x = 0.7;
                    }
                }
            }

            // Drop weapon naturally during comical death animation
            if (uData.swordGroup && t > 0.15) {
                uData.swordGroup.rotation.x = Math.min(Math.PI / 2, uData.swordGroup.rotation.x + delta * 6);
                uData.swordGroup.position.y = Math.max(-0.6, uData.swordGroup.position.y - delta * 3);
            }
            return;
        }

        // 2. DIRECTIONAL ROLLING & BACKSTEP
        if (this.combat.isRolling) {
            if (this.combat.isBackstep) {
                const progress = Math.min(1.0, this.combat.rollTime / 0.38);
                this.playerMesh.position.y = Math.sin(progress * Math.PI) * 0.28;
                if (uData.torso) uData.torso.rotation.x = Math.sin(progress * Math.PI) * 0.35;
                if (uData.leftHip && uData.rightHip) {
                    uData.leftHip.rotation.x = -0.4;
                    uData.rightHip.rotation.x = -0.4;
                }
            } else {
                const progress = Math.min(1.0, this.combat.rollTime / 0.52);
                const rollYaw = Math.atan2(this.combat.rollDir.x, this.combat.rollDir.z);
                this.playerMesh.rotation.y = rollYaw;

                if (uData.torso) uData.torso.rotation.x = progress * Math.PI * 2;

                const tuck = Math.sin(progress * Math.PI);
                if (uData.leftHip && uData.rightHip) {
                    uData.leftHip.rotation.x = -tuck * 1.4;
                    uData.rightHip.rotation.x = -tuck * 1.4;
                }
                if (uData.leftShoulder && uData.rightShoulder) {
                    uData.leftShoulder.rotation.x = tuck * 1.1;
                    uData.rightShoulder.rotation.x = tuck * 1.1;
                }

                const groundY = this.world.getGroundHeight(this.playerMesh.position.x, this.playerMesh.position.z, this.playerMesh.position.y);
                this.playerMesh.position.y = groundY; // Keep feet grounded on terrain during roll

                if (this.combat.isInvincible && Math.random() < 0.45) {
                    this.spawnRollGhostTrail();
                }
            }
            return;
        }

        // 3. TERRAIN ELEVATION & GRAVITY
        const pPos = this.playerMesh.position;
        const targetGroundY = this.world.getGroundHeight(pPos.x, pPos.z, pPos.y);
        const heightDiff = pPos.y - targetGroundY;

        if (heightDiff > 0.16 || this.playerVelocity.y < -0.2) {
            this.playerVelocity.y -= 26 * delta;
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
            if (pPos.y < targetGroundY) {
                // Instantly snap feet to solid ground when below terrain elevation
                // Permanently eliminates floor sinking and partial floor-submersion bugs
                pPos.y = targetGroundY;
            } else {
                pPos.y = THREE.MathUtils.lerp(pPos.y, targetGroundY, Math.min(1.0, delta * 20));
            }
            this.playerVelocity.y = 0;
        }

        // Anti-Clipping Safety Clamp: If player sinks below cobblestone in courtyard/bridge, instantly recover to solid ground
        if (pPos.y < -0.35 && pPos.y > -2.2 && pPos.x >= -35 && pPos.x <= 35 && pPos.z >= -35 && pPos.z <= 96) {
            const inWestTrench = (pPos.x >= -25.2 && pPos.x <= -14.8 && pPos.z >= 3.5 && pPos.z <= 92);
            const inSerpentStairs = (pPos.x >= -14 && pPos.x <= 14 && pPos.z >= -38 && pPos.z <= -28);
            if (!inWestTrench && !inSerpentStairs) {
                pPos.y = 0.0;
                this.playerVelocity.y = 0;
            }
        }

        // 4. MOVEMENT DIRECTION & LOCOMOTION
        const moveDir = this.calculateMovementDirection();
        const isMoving = moveDir.lengthSq() > 0.001;

        // Apply skin stat perks
        const perks = (this.combat && this.combat.skinPerks) || {};
        const speedBonus = perks.speedMultiplier || 1.0;
        const stamCostMult = (perks.stamMultiplier !== undefined) ? (2.0 - perks.stamMultiplier) : 1.0;

        let isSprinting = false;

        const cannotMove = this.combat.isDrinkingEstus || (this.combat.isStaggered && this.combat.staggerTime > 0.35);
        if (isMoving && !this.combat.isAttacking && !cannotMove) {
            isSprinting = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) && this.combat.stamina > 5;
            let speed = isSprinting ? this.sprintSpeed : (this.combat.isBlocking ? this.moveSpeed * 0.55 : this.moveSpeed);
            speed *= speedBonus;
            if (this.combat && this.combat.isPetrified) speed *= 0.65;
            if (this.combat && this.combat.isStaggered) speed *= 0.70;

            const isInWater = this.playerMesh.position.y <= -4.0;
            if (isInWater) speed *= 0.88;

            if (isSprinting) {
                this.combat.stamina = Math.max(0, this.combat.stamina - delta * 18 * stamCostMult);
                this.combat.staminaDelay = 0.4;
            }

            const step = moveDir.clone().multiplyScalar(speed * delta);
            this.playerMesh.position.add(step);
            this.resolvePlayerCollisions();

            if (this.combat.lockedTarget) {
                const toTarget = new THREE.Vector3().subVectors(this.combat.lockedTarget.mesh.position, this.playerMesh.position);
                this.playerMesh.rotation.y = Math.atan2(toTarget.x, toTarget.z);
            } else {
                const targetRot = Math.atan2(moveDir.x, moveDir.z);
                this.playerMesh.rotation.y = targetRot;
            }

            // Organic humanoid locomotion kinetics
            const freq = isSprinting ? 14 : 9;
            const stride = isSprinting ? 0.75 : 0.52;
            const armSwing = isSprinting ? 0.85 : 0.48;
            const phase = time * freq;

            // Alternating hips with lateral tilt & pelvic bounce
            if (uData.rightHip && uData.leftHip) {
                uData.rightHip.rotation.x = Math.sin(phase) * stride;
                uData.rightHip.rotation.z = Math.sin(phase) * 0.08;
                uData.leftHip.rotation.x = -Math.sin(phase) * stride;
                uData.leftHip.rotation.z = -Math.sin(phase) * 0.08;
            }

            // Pelvic bounce & forward lean
            if (uData.bodyGroup) {
                uData.bodyGroup.position.y = 1.0 + Math.abs(Math.sin(phase)) * (isSprinting ? 0.08 : 0.045);
            }
            if (uData.torso) {
                uData.torso.rotation.x = isSprinting ? 0.24 : 0.08;
                uData.torso.rotation.y = -Math.sin(phase) * 0.14;
                uData.torso.rotation.z = Math.cos(phase) * 0.04;
                uData.torso.scale.set(1, 1, 1);
            }



            // Opposite arm swinging
            if (!this.combat.isBlocking) {
                if (uData.rightShoulder) {
                    uData.rightShoulder.rotation.x = -Math.sin(phase) * armSwing;
                    uData.rightShoulder.rotation.y = 0;
                    uData.rightShoulder.rotation.z = -0.06;
                }
                if (uData.leftShoulder) {
                    if (this.isTorchActive) {
                        uData.leftShoulder.rotation.x = -0.65;
                        uData.leftShoulder.rotation.z = -0.15;
                    } else {
                        uData.leftShoulder.rotation.x = Math.sin(phase) * (armSwing * 0.65);
                        uData.leftShoulder.rotation.z = 0.05;
                    }
                }
                if (uData.shieldGroup) {
                    uData.shieldGroup.position.set(-0.06, 0.02, 0.06);
                    uData.shieldGroup.rotation.set(0.10, -0.35, -0.06);
                }
            }

            // Periodic footstep audio
            if (Math.sin(phase) > 0.95) {
                if (isInWater) {
                    this.audio.playWaterSplash();
                    this.world.spawnWaterSplash(this.playerMesh.position);
                } else {
                    this.audio.playFootstep();
                }
            }
        }

        // 5. COMBAT & ACTION ANIMATIONS (REAL KINETIC SKELETON POSED ANIMATIONS)
        if (this.combat.isDrinkingEstus) {
            // Estus Flask Drinking
            const et = this.combat.estusTime;
            const liftProgress = Math.sin(Math.min(1.0, et / 0.35) * Math.PI * 0.5);
            if (uData.leftShoulder) {
                uData.leftShoulder.rotation.x = 1.45 * liftProgress;
                uData.leftShoulder.rotation.z = 0.42 * liftProgress;
            }
            if (uData.headGroup) {
                uData.headGroup.rotation.x = -0.38 * liftProgress;
            }
            if (uData.torso) {
                uData.torso.rotation.x = -0.05;
                uData.torso.rotation.y = 0;
            }
            if (uData.rightShoulder) {
                uData.rightShoulder.rotation.x = 0.2;
            }
        } else if (this.combat.isStaggered) {
            // Heavy Hit Stagger / Knockback
            const st = this.combat.staggerTime;
            const fade = 1.0 - Math.min(1.0, st / 0.6);
            if (uData.torso) {
                uData.torso.rotation.x = -0.42 * fade;
                uData.torso.rotation.z = 0.12 * Math.sin(st * 20) * fade;
            }
            if (uData.leftShoulder) uData.leftShoulder.rotation.z = 0.45 * fade;
            if (uData.rightShoulder) uData.rightShoulder.rotation.z = -0.45 * fade;
            if (uData.bodyGroup) uData.bodyGroup.position.y = 0.92;
        } else if (this.combat.isParrying) {
            // Parry Shield Deflection Flick
            const p = Math.min(1.0, this.combat.parryTime / 0.4);
            const flick = Math.sin(p * Math.PI);
            if (uData.leftShoulder) {
                uData.leftShoulder.rotation.z = flick * 1.15;
                uData.leftShoulder.rotation.x = 0.45;
                uData.leftShoulder.rotation.y = 0.35 + flick * 0.6;
            }
            if (uData.torso) {
                uData.torso.rotation.y = -flick * 0.35;
                uData.torso.rotation.x = -0.08;
            }
        } else if (this.combat.isAttacking) {
            const t = this.combat.attackTime;
            const combo = this.combat.attackCombo;

            if (combo === 1) { // Light Slash 1 (Right-to-Left Cross Cleave)
                const norm = Math.min(1.0, t / 0.42);
                if (norm < 0.32) {
                    const w = norm / 0.32;
                    if (uData.torso) {
                        uData.torso.rotation.y = w * 0.45;
                        uData.torso.rotation.x = -0.08;
                    }
                    if (uData.rightShoulder) {
                        uData.rightShoulder.rotation.x = -w * 0.65;
                        uData.rightShoulder.rotation.y = w * 0.45;
                    }
                } else {
                    const s = (norm - 0.32) / 0.68;
                    if (uData.torso) {
                        uData.torso.rotation.y = 0.45 - s * 1.15;
                        uData.torso.rotation.x = 0.22;
                    }
                    if (uData.rightShoulder) {
                        uData.rightShoulder.rotation.x = -0.65 + s * 1.95;
                        uData.rightShoulder.rotation.y = 0.45 - s * 0.9;
                    }
                    if (uData.rightHip) uData.rightHip.rotation.x = 0.35 * (1 - s);
                }
                if (uData.swordGroup) {
                    uData.swordGroup.rotation.z = Math.sin(t * 12) * 1.8;
                    uData.swordGroup.rotation.y = Math.cos(t * 12) * 1.2;
                    uData.swordGroup.rotation.x = 0.6;
                }
            } else if (combo === 2) { // Reverse Slash (Left-to-Right Backhand)
                const norm = Math.min(1.0, t / 0.45);
                if (uData.torso) {
                    uData.torso.rotation.y = -0.45 + norm * 1.05;
                    uData.torso.rotation.x = 0.15;
                }
                if (uData.rightShoulder) {
                    uData.rightShoulder.rotation.x = 0.3 + Math.sin(norm * Math.PI) * 0.9;
                    uData.rightShoulder.rotation.y = -0.4 + norm * 0.95;
                }
                if (uData.swordGroup) {
                    uData.swordGroup.rotation.z = -Math.sin(t * 12) * 1.8;
                    uData.swordGroup.rotation.x = Math.cos(t * 12) * 1.4;
                }
            } else if (combo === 3) { // Heavy Two-Handed Overhead Slam
                const norm = Math.min(1.0, t / 0.70);
                if (norm < 0.42) {
                    const w = norm / 0.42;
                    if (uData.rightShoulder) uData.rightShoulder.rotation.x = -w * 2.1;
                    if (uData.leftShoulder) {
                        uData.leftShoulder.rotation.x = -w * 1.8;
                        uData.leftShoulder.rotation.y = 0.4;
                    }
                    if (uData.torso) uData.torso.rotation.x = -w * 0.38;
                    if (uData.bodyGroup) uData.bodyGroup.position.y = 1.0 + w * 0.08;
                    if (uData.swordGroup) uData.swordGroup.rotation.x = -w * 1.6;
                } else {
                    const s = (norm - 0.42) / 0.58;
                    if (uData.rightShoulder) uData.rightShoulder.rotation.x = -2.1 + s * 3.8;
                    if (uData.leftShoulder) uData.leftShoulder.rotation.x = -1.8 + s * 3.3;
                    if (uData.torso) uData.torso.rotation.x = -0.38 + s * 1.15;
                    if (uData.bodyGroup) uData.bodyGroup.position.y = 1.08 - s * 0.36;
                    if (uData.swordGroup) uData.swordGroup.rotation.x = Math.sin(t * 8) * 2.2 + 0.3;

                    if (s > 0.5 && s < 0.65) {
                        this.world.spawnLandingDust(this.playerMesh.position);
                    }
                }
            } else if (combo === 4) { // Riposte Thrust
                if (uData.torso) uData.torso.rotation.y = -0.35;
                if (uData.rightShoulder) uData.rightShoulder.rotation.x = 1.55;
                if (uData.rightHip) uData.rightHip.rotation.x = 0.45;
                if (uData.swordGroup) {
                    uData.swordGroup.rotation.set(Math.PI / 2, 0, 0);
                    uData.swordGroup.position.z = 0.2 + Math.sin(t * 10) * 0.7;
                }
            } else if (combo === 5) { // Running Leaping Jump Attack
                const norm = Math.min(1.0, t * 4);
                if (uData.bodyGroup) uData.bodyGroup.position.y = 1.0 + Math.sin(norm * Math.PI) * 0.6;
                if (uData.rightShoulder) uData.rightShoulder.rotation.x = -1.2 + norm * 2.5;
                if (uData.swordGroup) {
                    uData.swordGroup.rotation.x = 2.4 - Math.sin(norm * Math.PI) * 2.6;
                    uData.swordGroup.position.y = Math.sin(t * 5) * 0.3;
                }
            } else if (combo === 6) { // Plunging Attack
                if (uData.torso) uData.torso.rotation.x = 0.6;
                if (uData.swordGroup) {
                    uData.swordGroup.rotation.set(Math.PI * 0.95, 0, 0);
                    uData.swordGroup.position.set(0, -0.4, 0.4);
                }
            }
        } else if (this.combat.isBlocking) {
            // Shield Block Stance: Left arm raises firmly, rotating inward to present the crest shield directly in front of the chest
            if (uData.leftShoulder) {
                uData.leftShoulder.rotation.x = 0.72;
                uData.leftShoulder.rotation.y = 0.36;
                uData.leftShoulder.rotation.z = -0.20;
            }
            if (uData.torso) {
                uData.torso.rotation.y = -0.16;
                uData.torso.rotation.x = 0.08;
            }
            if (uData.bodyGroup) uData.bodyGroup.position.y = 0.95;
            if (uData.shieldGroup) {
                // Firmly anchored to forearm, shielding flank and torso
                uData.shieldGroup.position.set(-0.06, 0.02, 0.06);
                uData.shieldGroup.rotation.set(0.10, -0.35, -0.06);
            }
        } else if (!isMoving) {
            // 6. IDLE BREATHING OSCILLATION & REALISTIC COMBAT STANCE
            const t = time * 2.2;
            if (uData.rightHip && uData.leftHip) {
                uData.rightHip.rotation.x = 0.04;
                uData.rightHip.rotation.z = 0.04;
                uData.leftHip.rotation.x = -0.04;
                uData.leftHip.rotation.z = -0.04;
            }
            if (uData.bodyGroup) uData.bodyGroup.position.y = 1.0;
            if (uData.torso) {
                uData.torso.position.y = Math.sin(t) * 0.025;
                uData.torso.rotation.x = Math.sin(t) * 0.015;
                uData.torso.rotation.y = Math.sin(t * 0.3) * 0.015;
                uData.torso.rotation.z = Math.sin(t * 0.5) * 0.02;
                uData.torso.scale.set(1.0 + Math.sin(t) * 0.012, 1.0, 1.0 + Math.sin(t) * 0.018);
            }
            if (uData.rightShoulder) {
                uData.rightShoulder.rotation.x = Math.sin(t) * 0.03;
                uData.rightShoulder.rotation.y = 0;
                uData.rightShoulder.rotation.z = -0.06;
            }
            if (uData.leftShoulder) {
                if (this.isTorchActive) {
                    uData.leftShoulder.rotation.x = -0.65;
                    uData.leftShoulder.rotation.z = -0.15;
                } else {
                    uData.leftShoulder.rotation.x = -0.12 + Math.sin(t) * 0.02;
                    uData.leftShoulder.rotation.z = 0.05;
                }
            }
            if (uData.headGroup) {
                uData.headGroup.rotation.x = 0;
            }

            // Normal shield posture (anatomically strapped to left forearm)
            if (uData.shieldGroup) {
                uData.shieldGroup.position.set(-0.06, 0.02, 0.06);
                uData.shieldGroup.rotation.set(0.10, -0.35, -0.06);
            }

            // Dynamic idle breathing animation
        }

        // 7. WEAPON STANCE STABILIZATION (Active for both moving and idle)
        if (!this.combat.isAttacking) {
            this.updateWeaponStance(delta, isMoving);
        }
    }

    updateWeaponStance(delta, isMoving) {
        const uData = this.playerMesh && this.playerMesh.userData;
        if (!uData || !uData.swordGroup) return;

        const wpnId = uData.currentWeaponId || (uData.swordGroup.userData && uData.swordGroup.userData.weaponId) || 'sword';
        let targetRotX = 0.35, targetRotY = 0.08, targetRotZ = -0.15;
        let targetPosX = 0.02, targetPosY = 0.04, targetPosZ = 0.06;

        if (wpnId === 'halberd') {
            // Authentic Dark Souls halberd polearm stance (held upright, balanced forward)
            targetRotX = 0.16; targetRotY = 0.05; targetRotZ = -0.06;
            targetPosX = 0.02; targetPosY = 0.04; targetPosZ = 0.02;
        } else if (wpnId === 'zweihander' || wpnId === 'dark_moon_greatsword') {
            // Colossal greatsword held upright in ready posture
            targetRotX = 0.32; targetRotY = 0.10; targetRotZ = -0.16;
            targetPosX = 0.02; targetPosY = 0.05; targetPosZ = 0.06;
        } else if (wpnId === 'dragontooth') {
            targetRotX = 0.28; targetRotY = 0.10; targetRotZ = -0.14;
            targetPosX = 0.02; targetPosY = 0.04; targetPosZ = 0.06;
        } else if (wpnId === 'torch') {
            targetRotX = 0.12; targetRotY = 0.0; targetRotZ = -0.05;
            targetPosX = 0.0; targetPosY = 0.06; targetPosZ = 0.04;
        } else if (wpnId === 'uchigatana' || wpnId === 'rivers_of_blood') {
            targetRotX = 0.32; targetRotY = 0.08; targetRotZ = -0.12;
            targetPosX = 0.02; targetPosY = 0.04; targetPosZ = 0.06;
        } else if (wpnId === 'moonlight') {
            targetRotX = 0.32; targetRotY = 0.08; targetRotZ = -0.14;
            targetPosX = 0.02; targetPosY = 0.04; targetPosZ = 0.06;
        }

        // Smoothly glide back to the natural ready stance every frame
        const blend = Math.min(1.0, delta * 15);
        uData.swordGroup.rotation.x = THREE.MathUtils.lerp(uData.swordGroup.rotation.x, targetRotX, blend);
        uData.swordGroup.rotation.y = THREE.MathUtils.lerp(uData.swordGroup.rotation.y, targetRotY, blend);
        uData.swordGroup.rotation.z = THREE.MathUtils.lerp(uData.swordGroup.rotation.z, targetRotZ, blend);
        uData.swordGroup.position.x = THREE.MathUtils.lerp(uData.swordGroup.position.x, targetPosX, blend);
        uData.swordGroup.position.y = THREE.MathUtils.lerp(uData.swordGroup.position.y, targetPosY, blend);
        uData.swordGroup.position.z = THREE.MathUtils.lerp(uData.swordGroup.position.z, targetPosZ, blend);

        // Continuous mutual collision resolution (runs every frame even when standing still, drinking Estus, or parrying)
        this.resolvePlayerCollisions();
    }

    resolvePlayerCollisions() {
        const pPos = this.playerMesh.position;
        const playerRadius = 0.45;
        const playerBottom = pPos.y;
        const playerTop = pPos.y + 1.8;

        // 1. Solid World Geometry & Pillar Sphere-to-AABB Continuous Resolution
        if (this.world && this.world.colliders) {
            for (let iter = 0; iter < 3; iter++) {
                for (let i = 0; i < this.world.colliders.length; i++) {
                    const box = this.world.colliders[i];
                    if (playerTop <= box.min.y || playerBottom >= box.max.y) continue;

                    const cx = Math.max(box.min.x, Math.min(box.max.x, pPos.x));
                    const cz = Math.max(box.min.z, Math.min(box.max.z, pPos.z));

                    const dx = pPos.x - cx;
                    const dz = pPos.z - cz;
                    const distSq = dx * dx + dz * dz;

                    if (distSq < playerRadius * playerRadius && distSq > 0.000001) {
                        const dist = Math.sqrt(distSq);
                        const push = playerRadius - dist;
                        pPos.x += (dx / dist) * push;
                        pPos.z += (dz / dist) * push;
                    } else if (distSq <= 0.000001) {
                        const dLeft = pPos.x - box.min.x;
                        const dRight = box.max.x - pPos.x;
                        const dBottom = pPos.z - box.min.z;
                        const dTop = box.max.z - pPos.z;
                        const minPen = Math.min(dLeft, dRight, dBottom, dTop);

                        if (minPen === dLeft) pPos.x = box.min.x - playerRadius;
                        else if (minPen === dRight) pPos.x = box.max.x + playerRadius;
                        else if (minPen === dBottom) pPos.z = box.min.z - playerRadius;
                        else pPos.z = box.max.z + playerRadius;
                    }
                }
            }
        }

        // 2. Boss Solid Collider (Mutual two-way pushback prevents walking through or standing inside boss)
        if (this.combat && this.combat.boss && !this.combat.boss.isDead && this.combat.boss.mesh) {
            const bPos = this.combat.boss.mesh.position;
            const dx = pPos.x - bPos.x;
            const dz = pPos.z - bPos.z;
            const distSq = dx * dx + dz * dz;
            const minBossDist = (this.combat.boss.radius || 2.2) + playerRadius;
            if (distSq < minBossDist * minBossDist && distSq > 0.0001) {
                const dist = Math.sqrt(distSq);
                const push = (minBossDist - dist);
                pPos.x += (dx / dist) * push * 0.65;
                pPos.z += (dz / dist) * push * 0.65;
                bPos.x -= (dx / dist) * push * 0.35;
                bPos.z -= (dz / dist) * push * 0.35;
            }
        }

        // 3. Enemy / Mob Solid Colliders (prevents walking through mobs)
        if (this.combat && this.combat.enemies) {
            for (let i = 0; i < this.combat.enemies.length; i++) {
                const e = this.combat.enemies[i];
                if (e.isDead || !e.mesh || !e.mesh.visible) continue;
                const ePos = e.mesh.position;
                const dx = pPos.x - ePos.x;
                const dz = pPos.z - ePos.z;
                const distSq = dx * dx + dz * dz;
                const minMobDist = (e.radius || 0.65) + playerRadius + 0.15;
                if (distSq < minMobDist * minMobDist && distSq > 0.0001) {
                    const dist = Math.sqrt(distSq);
                    const push = (minMobDist - dist);
                    pPos.x += (dx / dist) * push * 0.55;
                    pPos.z += (dz / dist) * push * 0.55;
                    ePos.x -= (dx / dist) * push * 0.45;
                    ePos.z -= (dz / dist) * push * 0.45;
                }
            }
        }

        // 4. Architectural Bounds & Railing Collision Enforcements:
        // A. Royal Bridge Parapets (z in [22, 95.0])
        if (pPos.z >= 22 && pPos.z <= 95.0 && Math.abs(pPos.x) <= 8.5) {
            if (pPos.y >= -1.0 && pPos.y <= 3.5) {
                pPos.x = Math.max(-6.45, Math.min(6.45, pPos.x));
            }
        }

        // B. Surface Boss Arena (z in [94.8, 168.0]) - Full width access (-16.2 to +16.2) without floor/chasm clipping
        if (pPos.z >= 94.8 && pPos.z <= 168.0 && pPos.y >= -1.0 && pPos.y <= 4.0) {
            pPos.x = Math.max(-16.2, Math.min(16.2, pPos.x));
            pPos.z = Math.max(96.0, Math.min(163.5, pPos.z));
        }

        // C. Flooded Catacombs Corridor (z in [22, 90], y < 1.0)
        if (pPos.z >= 22 && pPos.z <= 90 && pPos.y < 1.0) {
            pPos.x = Math.max(-23.4, Math.min(-16.6, pPos.x));
        }

        // D. Deep Catacombs Crypt & Mausoleum (z in [90, 150], x in [-34, -7], y < -4.0)
        if (pPos.z >= 90 && pPos.z <= 150 && pPos.y < -4.0) {
            pPos.x = Math.max(-33.0, Math.min(-7.5, pPos.x));
            pPos.z = Math.min(148.0, pPos.z);
        }

        // E. High Ramparts Walkway (z in [22, 95], y > 4.5)
        if (pPos.z >= 22 && pPos.z <= 95 && pPos.y > 4.5) {
            pPos.x = Math.max(16.5, Math.min(23.5, pPos.x));
            pPos.z = Math.min(94.5, pPos.z);
        }

        // F. Courtyard Starting Arena (z in [-30, 28], x in [-30, 30])
        if (pPos.z >= -30.0 && pPos.z < 28 && pPos.y > -2.0) {
            pPos.x = Math.max(-28.0, Math.min(28.0, pPos.x));
            if (pPos.x < -9.5 || pPos.x > 9.5) {
                pPos.z = Math.max(-28.0, pPos.z);
            }
        }

        // G. Serpent Sanctuary & Gorgon Temple (z in [-115, -30], x in [-38, 38])
        if (pPos.z < -30.0) {
            if (pPos.z >= -70.0) {
                pPos.x = Math.max(-31.0, Math.min(31.0, pPos.x));
            } else {
                pPos.x = Math.max(-37.0, Math.min(37.0, pPos.x));
                pPos.z = Math.max(-113.0, pPos.z);
            }
        }

        if (this.collisionSystem) {
            this.collisionSystem.enforceBoundaries(pPos, playerRadius, pPos.y);
        }

        // 5. Abyss Fall Protection (fatal fall into chasm respawns at bonfire)
        if (pPos.y < -9.5) {
            this.showNotification("💀 PLUNGED INTO THE ABYSS");
            this.respawnPlayer();
        }
    }

    updateCamera(delta) {
        const targetPos = this.playerMesh.position.clone().add(new THREE.Vector3(0, 1.4, 0));

        // Lock-on Tracking
        if (this.combat.lockedTarget) {
            const isOutOfRange = this.combat.lockedTarget.mesh && this.playerMesh.position.distanceTo(this.combat.lockedTarget.mesh.position) > 35;
            if (this.combat.lockedTarget.isDead || isOutOfRange) {
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

        // Spherical camera placement with corridor-aware distance & collision prevention
        let dist = this.cameraDistance;
        if (targetPos.y < -1.0 && Math.abs(targetPos.x - (-20)) < 6) {
            dist = Math.min(dist, 2.8);
        }

        // Camera direction vector pointing from player target towards camera
        if (!this._camDir) this._camDir = new THREE.Vector3();
        if (!this._camRay) this._camRay = new THREE.Ray();
        if (!this._camHit) this._camHit = new THREE.Vector3();

        this._camDir.set(
            Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch),
            Math.sin(this.cameraPitch),
            Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch)
        ).normalize();

        // Continuous Obstacle Raycasting against world colliders (prevents camera clipping through walls/pillars)
        let allowedDist = dist;
        if (this.world && this.world.colliders) {
            this._camRay.origin.copy(targetPos);
            this._camRay.direction.copy(this._camDir);

            for (let i = 0; i < this.world.colliders.length; i++) {
                const box = this.world.colliders[i];
                if (this._camRay.intersectBox(box, this._camHit)) {
                    const hitDist = targetPos.distanceTo(this._camHit);
                    if (hitDist < allowedDist) {
                        allowedDist = Math.max(0.65, hitDist - 0.32); // 32cm safety clearance buffer
                    }
                }
            }
        }

        let cx = targetPos.x + allowedDist * this._camDir.x;
        let cy = targetPos.y + allowedDist * this._camDir.y;
        let cz = targetPos.z + allowedDist * this._camDir.z;

        // Subterranean ceiling & surface floor clamping
        if (targetPos.y < -1.0) {
            cy = Math.min(cy, 0.4);
            cy = Math.max(cy, targetPos.y - 0.2);
        } else {
            cy = Math.max(cy, 0.6);
        }

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
    updateHUD(delta = 0.016) {
        // HP Bar (Dirty checking: only touch DOM when changed)
        if (this.lastHp !== this.combat.hp || this.lastMaxHp !== this.combat.maxHp) {
            this.lastHp = this.combat.hp;
            this.lastMaxHp = this.combat.maxHp;
            const hpPercent = Math.max(0, (this.combat.hp / this.combat.maxHp) * 100);
            this.ui.hpBar.style.width = `${hpPercent}%`;
            this.ui.hpText.textContent = `${this.combat.hp} / ${this.combat.maxHp}`;
        }

        // Stamina Bar (Dirty check: threshold 0.4 to prevent continuous reflows)
        if (Math.abs((this.lastStamina || 0) - this.combat.stamina) > 0.4 || this.lastMaxStamina !== this.combat.maxStamina) {
            this.lastStamina = this.combat.stamina;
            this.lastMaxStamina = this.combat.maxStamina;
            const stamPercent = Math.max(0, (this.combat.stamina / this.combat.maxStamina) * 100);
            this.ui.staminaBar.style.width = `${stamPercent}%`;
        }

        // Estus Flasks
        if (this.lastEstus !== this.combat.estusFlasks) {
            this.lastEstus = this.combat.estusFlasks;
            this.ui.estusCount.textContent = `x ${this.combat.estusFlasks}`;
        }

        // Souls Counter
        if (this.lastSouls !== this.combat.souls) {
            this.lastSouls = this.combat.souls;
            this.ui.soulsCount.textContent = this.combat.souls.toLocaleString();
        }

        const pPos = this.playerMesh.position;

        // Route Compass Pill Active Highlight (Cached, only on state change)
        if (!this.cachedRoutes) {
            this.cachedRoutes = {
                ramparts: document.getElementById('route-ramparts'),
                catacombs: document.getElementById('route-catacombs'),
                bridge: document.getElementById('route-bridge')
            };
        }
        if (this.cachedRoutes.ramparts && this.cachedRoutes.catacombs && this.cachedRoutes.bridge) {
            const currentRoute = pPos.x > 13 ? 'ramparts' : (pPos.x < -13 ? 'catacombs' : (pPos.z > 25 ? 'bridge' : 'none'));
            if (this.lastActiveRoute !== currentRoute) {
                this.lastActiveRoute = currentRoute;
                const r = this.cachedRoutes;
                r.ramparts.style.opacity = currentRoute === 'ramparts' ? '1' : '0.75';
                r.ramparts.style.transform = currentRoute === 'ramparts' ? 'scale(1.06)' : 'scale(1)';
                r.ramparts.style.boxShadow = currentRoute === 'ramparts' ? '0 0 16px rgba(255,215,0,0.85)' : '0 0 6px rgba(255,215,0,0.2)';

                r.catacombs.style.opacity = currentRoute === 'catacombs' ? '1' : '0.75';
                r.catacombs.style.transform = currentRoute === 'catacombs' ? 'scale(1.06)' : 'scale(1)';
                r.catacombs.style.boxShadow = currentRoute === 'catacombs' ? '0 0 16px rgba(0,255,170,0.85)' : '0 0 6px rgba(0,255,170,0.2)';

                r.bridge.style.opacity = currentRoute === 'bridge' ? '1' : '0.75';
                r.bridge.style.transform = currentRoute === 'bridge' ? 'scale(1.06)' : 'scale(1)';
                r.bridge.style.boxShadow = currentRoute === 'bridge' ? '0 0 16px rgba(255,119,34,0.85)' : '0 0 6px rgba(255,119,34,0.2)';
            }
        }

        // Check Interactable Proximity
        let activePrompt = null;
        this._nearbyCompendiumEntity = null;
        for (const item of this.world.interactables) {
            if (item.type === 'fog_gate' && this.world.fogTraversed) continue;
            if (pPos.distanceTo(item.position) <= item.radius) {
                activePrompt = item.prompt;
                break;
            }
        }

        if (!activePrompt && window.compendiumInstance && window.compendiumInstance.spawnedEntities) {
            for (const ent of window.compendiumInstance.spawnedEntities) {
                if (ent && ent.parent && pPos.distanceTo(ent.position) <= 3.8) {
                    const entry = ent.userData && ent.userData.entry;
                    const eName = (entry && entry.name) || '3D Entity';
                    if (entry && entry.category === 'NPC') {
                        activePrompt = `💬 [ E ] TALK TO ${eName.toUpperCase()} • [ G ] DISMISS`;
                    } else {
                        activePrompt = `[ E ] BANISH / DISMISS ${eName.toUpperCase()}`;
                    }
                    this._nearbyCompendiumEntity = ent;
                    break;
                }
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

    triggerPetrifiedEffect() {
        this.showNotification("🗿 PETRIFIED! MEDUSA'S GAZE HAS FROZEN THY FLESH!");
        this.shakeCamera(0.4, 0.35);

        // Slow player movement for 2.8s
        if (this.combat) {
            this.combat.isPetrified = true;
            setTimeout(() => {
                if (this.combat) this.combat.isPetrified = false;
            }, 2800);
        }

        // Screen stone-gray vignette
        let overlay = document.getElementById('petrified-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'petrified-overlay';
            overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;box-shadow:inset 0 0 120px rgba(50,80,60,0.85);backdrop-filter:grayscale(65%) contrast(120%);transition:opacity 0.4s ease;opacity:0;';
            document.body.appendChild(overlay);
        }
        overlay.style.opacity = '1';
        setTimeout(() => {
            if (overlay) overlay.style.opacity = '0';
        }, 2400);
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
        if (!boss) return null; // Locked boss
        if (bossId === 'nito') {
            this.warpToCatacombs();
        } else if (this.playerMesh.position.z < 80) {
            this.warpToArena();
        }
        return boss;
    }

    warpToCatacombs() {
        this.playerMesh.position.set(-20, -5.8, 93);
        this.cameraYaw = 0;
        this.cameraPitch = 0.22;
        this.showNotification("WARPED TO CATACOMBS SANCTUM (GRAVELORD NITO)");
    }

    warpToArena() {
        // Warp player near the surface fog gate (z = 94)
        this.playerMesh.position.set(0, 0, 98);
        this.cameraYaw = 0;
        this.cameraPitch = 0.28;
        this.showNotification("WARPED TO THE ARENA FOG GATE");
    }

    triggerDeathScreen() {
        if (this.ui.deathScreen) {
            // Pick random death quote from 300 Death Quotes library
            if (window.getRandomDeathQuote) {
                const quoteObj = window.getRandomDeathQuote();
                this.currentDeathQuote = quoteObj;
                window._quoteIdx = quoteObj.index - 1;
                const quoteEl = document.getElementById('death-quote-text');
                const nextBtn = document.getElementById('btn-next-death-quote');
                if (quoteEl) quoteEl.textContent = `"${quoteObj.text}"`;
                if (nextBtn) nextBtn.textContent = `🎲 NEXT QUOTE (${quoteObj.index}/300)`;
            }

            // Display lost souls & lost stuff status
            const lostStuffEl = document.getElementById('death-lost-stuff-text');
            if (lostStuffEl && this.combat && this.combat.bloodstain) {
                const soulsCount = this.combat.bloodstain.souls || 0;
                const p = this.combat.bloodstain.pos || (this.playerMesh ? this.playerMesh.position : { x: 0, z: 0 });
                lostStuffEl.textContent = `And your lost stuff at this place rests (${soulsCount.toLocaleString()} Souls at [X:${p.x.toFixed(1)}, Z:${p.z.toFixed(1)}])`;
            }

            // Update death animation label
            const animLabel = document.getElementById('death-anim-label');
            if (animLabel && this.deathAnimName) {
                animLabel.textContent = `🎬 LOL ANIMATION: ${this.deathAnimName}`;
            }

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

    unlockLocationForBoss(bossId, locId) {
        if (!locId) return null;
        if (!this.unlockedLocations) {
            this.unlockedLocations = ['royal_bridge_arena', 'firelink_shrine', 'undead_asylum', 'undead_burg_bridge', 'majula_cliffside', 'heides_tower_ruins', 'boletaria_palace_gate', 'central_yharnam_bridge', 'limgrave_first_step', 'hunters_dream'];
        }
        if (!this.unlockedLocations.includes(locId)) {
            this.unlockedLocations.push(locId);
            try {
                localStorage.setItem('ds_unlocked_locations', JSON.stringify(this.unlockedLocations));
            } catch (e) {}
        }

        const locs = window.DARK_SOULS_LOCATIONS || [];
        const targetLoc = locs.find(l => l.id === locId);

        if (targetLoc) {
            this.triggerLocationUnlockedBanner(targetLoc);
        }

        // Spawn in-world physical golden waystone archway in arena
        if (this.world && this.world.spawnDiscoveredWaystone && targetLoc) {
            const pPos = this.playerMesh ? this.playerMesh.position : { x: 0, y: 0, z: 0 };
            if (pPos.y <= -3.5) {
                this.world.spawnDiscoveredWaystone(-20, -5.0, 125, targetLoc);
            } else {
                this.world.spawnDiscoveredWaystone(0, 0, 154, targetLoc);
            }
        }

        // Spawn in-world physical arena victory bonfire
        if (this.world && this.world.spawnArenaBonfire) {
            const pPos = this.playerMesh ? this.playerMesh.position : { x: 0, y: 0, z: 0 };
            if (pPos.y <= -3.5) {
                this.world.spawnArenaBonfire(-20, -5.0, 115);
            } else {
                this.world.spawnArenaBonfire(0, 0, 345);
            }
        }

        return targetLoc;
    }

    triggerLocationUnlockedBanner(loc) {
        if (!loc) return;
        const banner = document.getElementById('location-unlocked-banner');
        const title = document.getElementById('location-unlocked-title');
        const subtitle = document.getElementById('location-unlocked-subtitle');

        if (banner && title) {
            title.textContent = loc.name.toUpperCase();
            if (subtitle) {
                subtitle.textContent = `📍 ${loc.zone} • Fast-Travel Portal awakened! Return anytime via [ M ] or in-world Waystone.`;
            }
            banner.style.display = 'flex';
            banner.classList.add('active');
            setTimeout(() => {
                banner.classList.remove('active');
                setTimeout(() => {
                    banner.style.display = 'none';
                }, 1000);
            }, 5000);
        } else {
            this.showNotification(`✦ NEW REALM DISCOVERED: ${loc.name.toUpperCase()}! ✦`);
        }

        if (this.audio && this.audio.playBellToll) {
            this.audio.playBellToll();
        }
    }

    showNextLordUnlockedModal(defeatedBoss, nextBoss, unlockedLoc = null) {
        if (!nextBoss) return;
        const modal = document.getElementById('next-lord-modal');
        if (modal) {
            const defElem = document.getElementById('next-lord-defeated-name');
            const nameElem = document.getElementById('next-lord-name');
            const titleElem = document.getElementById('next-lord-title');
            const iconElem = document.getElementById('next-lord-icon');
            const hpElem = document.getElementById('next-lord-hp');
            const soulsElem = document.getElementById('next-lord-souls');

            if (defElem) defElem.textContent = `${defeatedBoss ? defeatedBoss.name : 'LORD'} VANQUISHED`;
            if (nameElem) nameElem.textContent = nextBoss.name;
            if (titleElem) titleElem.innerHTML = nextBoss.title;
            if (iconElem) iconElem.textContent = nextBoss.icon;
            if (hpElem) hpElem.textContent = `HP: ${nextBoss.maxHp.toLocaleString()}`;
            if (soulsElem) soulsElem.textContent = `REWARD: ${nextBoss.souls.toLocaleString()} SOULS`;

            // Realm discovery notification inside modal
            const locBox = document.getElementById('next-lord-unlocked-loc-box');
            const locName = document.getElementById('next-lord-unlocked-loc-name');
            const locDesc = document.getElementById('next-lord-unlocked-loc-desc');
            const btnTravel = document.getElementById('btn-next-lord-travel');

            if (unlockedLoc && locBox && locName) {
                locBox.style.display = 'block';
                locName.textContent = unlockedLoc.name;
                if (locDesc) locDesc.textContent = `"${unlockedLoc.desc}"`;
                if (btnTravel) {
                    btnTravel.style.display = 'inline-block';
                    btnTravel.onclick = () => {
                        this.closeNextLordModal();
                        this.travelToLocation(unlockedLoc.id);
                    };
                }
            } else if (locBox) {
                locBox.style.display = 'none';
                if (btnTravel) btnTravel.style.display = 'none';
            }

            const btnFight = document.getElementById('btn-next-lord-fight');
            if (btnFight) {
                btnFight.onclick = () => {
                    this.closeNextLordModal();
                    this.selectBoss(nextBoss.id);
                };
            }
            modal.style.display = 'flex';
            if (this.audio) this.audio.playBellToll();
        } else {
            this.showNotification(`⚔️ NEXT LORD UNLOCKED: ${nextBoss.name}!`);
        }
    }

    closeNextLordModal() {
        const modal = document.getElementById('next-lord-modal');
        if (modal) modal.style.display = 'none';
    }

    handleEscapeKey() {
        // 1. If any modal overlay is open, close all open modals and resume battle
        const openModals = Array.from(document.querySelectorAll('.modal-overlay')).filter(m => {
            return m.style.display === 'flex' || m.style.display === 'block';
        });

        if (openModals.length > 0) {
            openModals.forEach(m => m.style.display = 'none');
            this.closeNextLordModal();
            if (this.closeLocationsModal) this.closeLocationsModal();
            if (window.qaSuite && window.qaSuite.closeUI) window.qaSuite.closeUI();
            this.showNotification("⚔️ BATTLE RESUMED");
            return;
        }

        // 2. If pointer lock is active, unlock cursor
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }

        // 3. Open Lordran Command Menu & refresh character stats and save slots
        if (typeof openQuickMenuModal === 'function') {
            openQuickMenuModal();
        }
        if (this.updateEscapeMenuUI) {
            this.updateEscapeMenuUI();
        }

        // 4. Smoothly scroll header actions to start and trigger golden pulse
        const bar = document.getElementById('header-actions-bar') || document.querySelector('.header-actions');
        if (bar) {
            bar.scrollTo({ left: 0, behavior: 'smooth' });
            bar.classList.add('header-actions-glow');
            setTimeout(() => bar.classList.remove('header-actions-glow'), 1200);
        }

        this.showNotification("⚜️ LORDRAN COMMAND MENU • [ESC] RESUME");
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

        // Reset position to last rested bonfire / Arena Bonfire (0, 0, 134) avoiding the long 140m run from (0, 0, 5)
        if (this.lastBonfirePos) {
            this.playerMesh.position.copy(this.lastBonfirePos);
        } else if (this.world && this.world.arenaBonfireGroup) {
            this.playerMesh.position.set(0, 0, 330);
        } else {
            this.playerMesh.position.set(0, 0, 330);
        }

        if (this.playerVelocity) this.playerVelocity.set(0, 0, 0);

        // Snap camera immediately without lerping from far away
        const targetPos = this.playerMesh.position.clone().add(new THREE.Vector3(0, 1.4, 0));
        const dist = this.cameraDistance || 4.2;
        this.cameraYaw = 0;
        this.cameraPitch = 0.22;
        this.camera.position.set(
            targetPos.x,
            targetPos.y + dist * Math.sin(0.22),
            targetPos.z + dist * Math.cos(0.22)
        );
        this.camera.lookAt(targetPos);

        if (this.playerMesh && this.playerMesh.userData) {
            const uData = this.playerMesh.userData;
            this.playerMesh.rotation.set(0, 0, 0);
            if (uData.torso) { uData.torso.rotation.set(0, 0, 0); uData.torso.position.set(0, 0.95, 0); }
            if (uData.head) uData.head.rotation.set(0, 0, 0);
            if (uData.leftShoulder) uData.leftShoulder.rotation.set(0, 0, 0);
            if (uData.rightShoulder) uData.rightShoulder.rotation.set(0, 0, 0);
            if (uData.leftHip) uData.leftHip.rotation.set(0, 0, 0);
            if (uData.rightHip) uData.rightHip.rotation.set(0, 0, 0);
            if (uData.swordGroup) { uData.swordGroup.rotation.set(0, 0, 0); uData.swordGroup.position.set(0.35, 0.5, 0.35); }
        }

        // Respawns hollow soldiers
        this.combat.spawnEnemies();
        this.audio.playBonfireIgnite();
        this.showNotification("AWAKENED AT THE BONFIRE");

        if (this.triggerAutoSave) {
            this.triggerAutoSave('RESPAWN');
        }
    }

    // ----------------------------------------------------
    // SAVE / LOAD SYSTEM (LOCALSTORAGE PERSISTENCE & MULTI-SLOT ARCHIVE)
    // ----------------------------------------------------
    triggerAutoSave(context = 'AUTOSAVE') {
        if (!this.combat || this.combat.isDead) return false;

        const now = Date.now();
        const isUnload = (context === 'BEFOREUNLOAD' || context === 'PAGEHIDE');

        // Throttle saves so they do not cause frame drops (minimum 2.2s between saves)
        if (!isUnload && this.lastAutoSaveTime && (now - this.lastAutoSaveTime < 2200)) {
            return false;
        }
        this.lastAutoSaveTime = now;

        const success = this.saveGame(false, context, 'darksouls_autosave');
        if (success && !isUnload) {
            this.flashAutoSaveIndicator(context);
        }
        return success;
    }

    flashAutoSaveIndicator(context = '') {
        const indicator = document.getElementById('autosave-indicator');
        if (!indicator) return;

        if (this.autoSaveIndicatorTimeout) {
            clearTimeout(this.autoSaveIndicatorTimeout);
        }

        indicator.classList.add('active');
        this.autoSaveIndicatorTimeout = setTimeout(() => {
            indicator.classList.remove('active');
        }, 1600);
    }

    saveGame(showNotification = true, context = 'MANUAL', slotKey = 'darksouls_save_v1') {
        if (!this.combat) return false;

        const p = this.playerMesh ? this.playerMesh.position : { x: 0, y: 0, z: 0 };
        const rotY = this.playerMesh ? this.playerMesh.rotation.y : 0;
        const zoneName = p.y <= -3.5 ? 'Catacombs (-5m Depth)' : (p.x > 12 ? 'High Ramparts (+6m)' : (p.z > 95 ? 'Boss Arena' : 'Royal Bridge (0m)'));

        const saveData = {
            version: 2,
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
            antidotes: (this.apothecary && this.apothecary.craftedMeds && this.apothecary.craftedMeds.venomAntidotes !== undefined) ? this.apothecary.craftedMeds.venomAntidotes : 5,
            bloodstain: this.combat.bloodstain ? {
                souls: this.combat.bloodstain.souls,
                pos: { x: this.combat.bloodstain.pos.x, y: this.combat.bloodstain.pos.y, z: this.combat.bloodstain.pos.z }
            } : null,
            currentBossType: this.combat.currentBossType,
            defeatedBosses: this.combat.defeatedBosses || [],
            unlockedLocations: this.unlockedLocations || ['royal_bridge_arena', 'firelink_shrine', 'undead_asylum', 'undead_burg_bridge', 'majula_cliffside', 'heides_tower_ruins', 'boletaria_palace_gate', 'central_yharnam_bridge', 'limgrave_first_step', 'hunters_dream'],
            adminModeUnlocked: !!(this.combat && this.combat.adminModeUnlocked),
            isGodMode: !!(this.combat && this.combat.isGodMode),
            equippedSkin: localStorage.getItem('darksouls_equipped_skin') || 'warrior',
            currentWeaponId: this.combat.currentWeaponId || 'sword',
            unlockedWeapons: this.combat.unlockedWeapons || ['sword'],
            heraldry: this.heraldry ? this.heraldry.heraldry : null,
            chivalryHonor: this.heraldry ? this.heraldry.chivalryHonor : 850,
            currentRankIndex: this.heraldry ? this.heraldry.currentRankIndex : 2,
            fiefdoms: this.heraldry ? this.heraldry.fiefdoms : null,
            craftedMeds: this.apothecary ? this.apothecary.craftedMeds : null,
            trebuchet: this.siege ? { counterweightKg: this.siege.trebuchet.counterweightKg, winchAngleDeg: this.siege.trebuchet.winchAngleDeg } : null,
            locationName: zoneName,
            playerPos: {
                x: Number(p.x.toFixed(2)),
                y: Number(p.y.toFixed(2)),
                z: Number(p.z.toFixed(2))
            },
            playerRot: Number(rotY.toFixed(3))
        };

        try {
            localStorage.setItem(slotKey, JSON.stringify(saveData));
            if (slotKey !== 'darksouls_save_v1') {
                localStorage.setItem('darksouls_save_v1', JSON.stringify(saveData));
            }
            // Always keep autosave mirror updated
            localStorage.setItem('darksouls_autosave', JSON.stringify(saveData));

            if (showNotification) {
                const prefix = context ? `[${context}] ` : '';
                this.showNotification(`💾 ${prefix}JOURNEY SAVED &bull; LEVEL ${saveData.level}`);
                if (this.audio) this.audio.playRoll();
            }
            this.updateSaveUI();
            this.updateEscapeMenuUI();
            return true;
        } catch (err) {
            console.error('Failed to save darksouls game:', err);
            return false;
        }
    }

    loadGame(showNotification = true, slotKey = 'darksouls_save_v1') {
        try {
            let raw = localStorage.getItem(slotKey);
            if (!raw && slotKey === 'darksouls_save_v1') {
                raw = localStorage.getItem('darksouls_autosave') || localStorage.getItem('darksouls_save_slot_1');
            }
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
            if (data.unlockedLocations && Array.isArray(data.unlockedLocations)) {
                this.unlockedLocations = data.unlockedLocations;
                try {
                    localStorage.setItem('ds_unlocked_locations', JSON.stringify(this.unlockedLocations));
                } catch (e) {}
            }

            // Restore persistent arena gateway portal & victory bonfire if lords defeated
            if (this.combat.defeatedBosses && this.combat.defeatedBosses.length > 0) {
                const lastBossId = this.combat.defeatedBosses[this.combat.defeatedBosses.length - 1];
                const def = this.combat.bossRoster.find(b => b.id === lastBossId);
                const locs = window.DARK_SOULS_LOCATIONS || [];
                const targetLoc = locs.find(l => l.id === (def ? def.unlockLocationId : 'undead_asylum'));
                if (targetLoc && this.world && this.world.spawnDiscoveredWaystone) {
                    this.world.spawnDiscoveredWaystone(0, 0, 154, targetLoc);
                }
                if (this.world && this.world.spawnArenaBonfire) {
                    this.world.spawnArenaBonfire(0, 0, 345);
                }
            }
            this.combat.isDead = false;

            // Restore Admin Mode & God Mode
            if (data.adminModeUnlocked !== undefined) {
                this.combat.adminModeUnlocked = !!data.adminModeUnlocked;
                if (this.combat.adminModeUnlocked) {
                    localStorage.setItem('darksouls_admin_mode', 'true');
                } else {
                    localStorage.removeItem('darksouls_admin_mode');
                }
            }
            if (data.isGodMode !== undefined) {
                this.combat.isGodMode = !!data.isGodMode;
            }

            // Restore Equipped 3D Skin
            if (data.equippedSkin) {
                this.selectSkin(data.equippedSkin, false);
            }

            // Restore position and rotation (preserve subterranean Catacombs depth)
            if (data.playerPos && typeof data.playerPos.x === 'number' && typeof data.playerPos.z === 'number') {
                const targetY = typeof data.playerPos.y === 'number' ? data.playerPos.y : this.world.getGroundHeight(data.playerPos.x, data.playerPos.z);
                this.playerMesh.position.set(data.playerPos.x, targetY, data.playerPos.z);
            } else {
                this.playerMesh.position.set(0, 0, 5);
            }
            if (typeof data.playerRot === 'number' && this.playerMesh) {
                this.playerMesh.rotation.y = data.playerRot;
            }

            // Restore bloodstain
            if (data.bloodstain && data.bloodstain.pos) {
                this.combat.bloodstain = {
                    souls: Number(data.bloodstain.souls) || 0,
                    pos: new THREE.Vector3(data.bloodstain.pos.x, data.bloodstain.pos.y, data.bloodstain.pos.z)
                };
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

            // Restore Apothecary Medicines & Antidotes
            if (data.craftedMeds && this.apothecary) {
                this.apothecary.craftedMeds = data.craftedMeds;
            }
            if (data.antidotes !== undefined && this.apothecary) {
                if (!this.apothecary.craftedMeds) this.apothecary.craftedMeds = {};
                this.apothecary.craftedMeds.venomAntidotes = data.antidotes;
                const antiEl = document.getElementById('antidote-count');
                if (antiEl) antiEl.textContent = `x ${data.antidotes}`;
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
            this.updateEscapeMenuUI();

            if (this.audio) this.audio.playBonfireIgnite();
            if (showNotification) {
                this.showNotification(`📂 JOURNEY RESTORED • SOUL LEVEL ${this.combat.level} (${this.combat.souls.toLocaleString()} SOULS)`);
            }
            return true;
        } catch (err) {
            console.error('Failed to load darksouls game:', err);
            if (showNotification) this.showNotification("CORRUPTED SAVE DATA");
            return false;
        }
    }

    saveToSlot(slotId = 1) {
        const slotKey = (slotId === 'auto' || slotId === 0) ? 'darksouls_autosave' : `darksouls_save_slot_${slotId}`;
        const slotName = (slotId === 'auto' || slotId === 0) ? 'AUTO-SAVE' : `SLOT ${slotId}`;
        this.saveGame(false, slotName, slotKey);
        this.showNotification(`💾 EXPEDITION ARCHIVED IN ${slotName}`);
        if (this.audio) this.audio.playRoll();
        this.updateEscapeMenuUI();
        this.updateSaveUI();
    }

    loadFromSlot(slotId = 1) {
        const slotKey = (slotId === 'auto' || slotId === 0) ? 'darksouls_autosave' : `darksouls_save_slot_${slotId}`;
        const slotName = (slotId === 'auto' || slotId === 0) ? 'AUTO-SAVE' : `SAVE SLOT ${slotId}`;
        const success = this.loadGame(false, slotKey);
        if (success) {
            this.showNotification(`📂 RESTORED ${slotName} • LEVEL ${this.combat.level}`);
            this.updateEscapeMenuUI();
            this.updateSaveUI();
            if (typeof closeQuickMenuModal === 'function') closeQuickMenuModal();
        } else {
            this.showNotification(`⚠️ NO DATA IN ${slotName}`);
        }
    }

    deleteSlot(slotId = 1) {
        const slotKey = `darksouls_save_slot_${slotId}`;
        localStorage.removeItem(slotKey);
        if (slotId === 1) localStorage.removeItem('darksouls_save_v1');
        this.showNotification(`🗑️ SAVE SLOT ${slotId} PURGED`);
        this.updateEscapeMenuUI();
        this.updateSaveUI();
    }

    exportSaveJson() {
        const raw = localStorage.getItem('darksouls_save_slot_1') || localStorage.getItem('darksouls_save_v1');
        if (!raw) {
            this.showNotification("⚠️ NO EXPEDITION SAVE FOUND TO EXPORT");
            return;
        }
        try {
            const data = JSON.parse(raw);
            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `darksouls_lordran_level_${data.level || 1}_save.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showNotification("📤 SAVE FILE EXPORTED AS JSON");
        } catch(e) {
            this.showNotification("❌ ERROR EXPORTING SAVE");
        }
    }

    importSaveJson(jsonStr) {
        try {
            const data = JSON.parse(jsonStr);
            if (!data.level && !data.version) throw new Error("Invalid format");
            localStorage.setItem('darksouls_save_slot_1', JSON.stringify(data));
            localStorage.setItem('darksouls_save_v1', JSON.stringify(data));
            this.loadGame(true, 'darksouls_save_v1');
            this.updateEscapeMenuUI();
            this.updateSaveUI();
            this.showNotification("📥 SAVE RESTORED SUCCESSFULLY");
        } catch(e) {
            this.showNotification("❌ ERROR IMPORTING SAVE FILE");
        }
    }

    resetJourney() {
        if (!confirm("Are you sure you want to begin a fresh journey? All unarchived Lordran progress will be cleared.")) return;
        localStorage.removeItem('darksouls_save_v1');
        localStorage.removeItem('darksouls_save_slot_1');
        localStorage.removeItem('darksouls_save_slot_2');
        localStorage.removeItem('darksouls_save_slot_3');
        localStorage.removeItem('darksouls_autosave');
        location.reload();
    }

    hasSaveData() {
        return !!(localStorage.getItem('darksouls_save_v1') || localStorage.getItem('darksouls_save_slot_1'));
    }

    deleteSave() {
        localStorage.removeItem('darksouls_save_v1');
        localStorage.removeItem('darksouls_save_slot_1');
        this.showNotification("SAVED JOURNEY CLEARED FROM ASHES");
        this.updateSaveUI();
        this.updateEscapeMenuUI();
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
                    const raw = localStorage.getItem('darksouls_save_v1') || localStorage.getItem('darksouls_save_slot_1');
                    const data = JSON.parse(raw);
                    statusElem.innerHTML = `LAST SAVED: <span style="color:#ffd276;">${data.date || 'RECENT'}</span> &bull; LEVEL ${data.level} &bull; ${Number(data.souls).toLocaleString()} SOULS`;
                } catch(e) {
                    statusElem.textContent = 'SAVE READY IN MEMORY';
                }
            } else {
                statusElem.textContent = 'NO ACTIVE SAVE FILE (REST AT BONFIRE OR CLICK SAVE)';
            }
        }
    }

    updateEscapeMenuUI() {
        if (!this.combat) return;

        // 1. Update Character Stats Overview Card
        const elLevel = document.getElementById('esc-stat-level');
        const elSouls = document.getElementById('esc-stat-souls');
        const elHp = document.getElementById('esc-stat-hp');
        const elStamina = document.getElementById('esc-stat-stamina');
        const elEstus = document.getElementById('esc-stat-estus');
        const elWeapon = document.getElementById('esc-stat-weapon');
        const elSkin = document.getElementById('esc-stat-skin');
        const elZone = document.getElementById('esc-stat-zone');
        const elBosses = document.getElementById('esc-stat-bosses');
        const elLore = document.getElementById('esc-stat-lore');

        if (elLevel) elLevel.textContent = this.combat.level;
        if (elSouls) elSouls.textContent = this.combat.souls.toLocaleString();
        if (elHp) elHp.textContent = `${this.combat.hp} / ${this.combat.maxHp}`;
        if (elStamina) elStamina.textContent = `${Math.round(this.combat.stamina)} / ${this.combat.maxStamina}`;
        if (elEstus) elEstus.textContent = `${this.combat.estusFlasks} / ${this.combat.maxEstus}`;

        const weaponName = (this.combat.weapons[this.combat.currentWeaponId] && this.combat.weapons[this.combat.currentWeaponId].name) || 'Lordran Straight Sword';
        if (elWeapon) elWeapon.textContent = weaponName;

        const currentSkin = localStorage.getItem('darksouls_equipped_skin') || 'warrior';
        if (elSkin) elSkin.textContent = currentSkin.toUpperCase();

        const p = this.playerMesh ? this.playerMesh.position : { x: 0, y: 0, z: 0 };
        const zoneName = p.y <= -3.5 ? 'Catacombs (-5m Depth)' : (p.x > 12 ? 'High Ramparts (+6m)' : (p.z > 95 ? 'Boss Arena' : 'Royal Bridge (0m)'));
        if (elZone) elZone.textContent = zoneName;

        const defeatedCount = (this.combat.defeatedBosses && this.combat.defeatedBosses.length) || 0;
        if (elBosses) elBosses.textContent = `${defeatedCount} / 16`;

        const unlockedLoreMap = (window.DarkSoulsLore && window.DarkSoulsLore.getUnlockedMap()) || {};
        const loreCount = Object.keys(unlockedLoreMap).length;
        if (elLore) elLore.textContent = `${loreCount} / 60`;

        // Update Auto-Save Slot Status
        const autoKey = 'darksouls_autosave';
        const rawAuto = localStorage.getItem(autoKey);
        const metaAuto = document.getElementById('esc-slot-auto-meta');
        const loadBtnAuto = document.getElementById('esc-slot-auto-load-btn');
        if (rawAuto) {
            try {
                const autoData = JSON.parse(rawAuto);
                const elapsedSec = Math.max(0, Math.round((Date.now() - (autoData.timestamp || Date.now())) / 1000));
                const timeStr = elapsedSec < 60 ? `${elapsedSec}s ago` : `${Math.round(elapsedSec/60)}m ago`;
                if (metaAuto) {
                    metaAuto.innerHTML = `<span style="color: #ffaa33; font-weight: 700;">🔥 RECENT CHECKPOINT</span> &bull; LVL ${autoData.level} &bull; ${Number(autoData.souls).toLocaleString()} Souls &bull; <span style="color: #bbb;">${autoData.date || 'RECENT'} (${timeStr})</span>`;
                }
                if (loadBtnAuto) {
                    loadBtnAuto.disabled = false;
                    loadBtnAuto.style.opacity = '1';
                    loadBtnAuto.style.cursor = 'pointer';
                }
            } catch(e) {
                if (metaAuto) metaAuto.textContent = 'AUTO-SAVE CORRUPTED';
            }
        } else {
            if (metaAuto) metaAuto.innerHTML = `<span style="color: #888;">NO AUTO-SAVE RECORDED YET (TRIGGERS IN 15s OR ON COMBAT)</span>`;
            if (loadBtnAuto) {
                loadBtnAuto.disabled = true;
                loadBtnAuto.style.opacity = '0.5';
                loadBtnAuto.style.cursor = 'not-allowed';
            }
        }

        // 2. Update Save Slots List
        [1, 2, 3].forEach(slotId => {
            const slotKey = `darksouls_save_slot_${slotId}`;
            const raw = localStorage.getItem(slotKey) || (slotId === 1 ? localStorage.getItem('darksouls_save_v1') : null);
            const metaElem = document.getElementById(`esc-slot-${slotId}-meta`);
            const loadBtn = document.getElementById(`esc-slot-${slotId}-load-btn`);
            const delBtn = document.getElementById(`esc-slot-${slotId}-del-btn`);

            if (raw) {
                try {
                    const data = JSON.parse(raw);
                    if (metaElem) {
                        metaElem.innerHTML = `<span style="color: #a5d6a7; font-weight: 700;">ACTIVE ARCHIVE</span> &bull; LVL ${data.level} &bull; ${Number(data.souls).toLocaleString()} Souls &bull; <span style="color: #bbb;">${data.date || 'RECENT'}</span>`;
                    }
                    if (loadBtn) {
                        loadBtn.disabled = false;
                        loadBtn.style.opacity = '1';
                        loadBtn.style.cursor = 'pointer';
                    }
                    if (delBtn) delBtn.style.display = 'inline-flex';
                } catch(e) {
                    if (metaElem) metaElem.textContent = 'EMPTY SAVE SLOT';
                    if (loadBtn) { loadBtn.disabled = true; loadBtn.style.opacity = '0.5'; loadBtn.style.cursor = 'not-allowed'; }
                    if (delBtn) delBtn.style.display = 'none';
                }
            } else {
                if (metaElem) metaElem.innerHTML = `<span style="color: #888;">EMPTY SLOT &bull; READY FOR ARCHIVE</span>`;
                if (loadBtn) {
                    loadBtn.disabled = true;
                    loadBtn.style.opacity = '0.5';
                    loadBtn.style.cursor = 'not-allowed';
                }
                if (delBtn) delBtn.style.display = 'none';
            }
        });
    }

    updateBossRosterUI() {
        if (!this.combat) return;
        const defeated = this.combat.defeatedBosses || [];
        const cards = document.querySelectorAll('.boss-card');
        cards.forEach(card => {
            const bossId = card.getAttribute('data-boss-id');
            if (!bossId) return;

            const isUnlocked = this.combat.isBossUnlocked(bossId);
            const isDefeated = defeated.includes(bossId);
            const btn = card.querySelector('.btn-fight-boss');
            const textDiv = card.querySelector('.boss-card-text');

            // Remove existing badges
            const oldBadge = card.querySelector('.slain-badge, .locked-badge');
            if (oldBadge) oldBadge.remove();

            if (!isUnlocked) {
                card.classList.add('locked');
                card.classList.remove('defeated');
                card.style.opacity = '0.55';
                card.style.borderColor = '#38251c';
                card.style.background = 'rgba(18, 12, 10, 0.7)';

                const lockBadge = document.createElement('div');
                lockBadge.className = 'locked-badge';
                const idx = this.combat.bossRoster.findIndex(b => b.id === bossId);
                const prev = idx > 0 ? this.combat.bossRoster[idx - 1].name : 'PREVIOUS LORD';
                lockBadge.innerHTML = `🔒 <span style="color: #ff7777; font-weight: 700;">LOCKED</span> &bull; <span style="color: #aaa; font-size: 0.72rem;">DEFEAT ${prev} FIRST</span>`;
                lockBadge.style.cssText = 'font-size: 0.75rem; letter-spacing: 1px; margin-top: 4px;';
                if (textDiv) textDiv.appendChild(lockBadge);

                if (btn) {
                    btn.textContent = 'LOCKED 🔒';
                    btn.disabled = true;
                    btn.style.opacity = '0.35';
                    btn.style.cursor = 'not-allowed';
                    btn.style.borderColor = '#443328';
                    btn.style.color = '#776655';
                    btn.style.background = '#110c08';
                }
            } else if (isDefeated) {
                card.classList.add('defeated');
                card.classList.remove('locked');
                card.style.opacity = '1';
                card.style.borderColor = 'rgba(212, 175, 55, 0.7)';
                card.style.background = 'linear-gradient(135deg, rgba(32, 26, 16, 0.95), rgba(16, 12, 8, 0.95))';

                const badge = document.createElement('div');
                badge.className = 'slain-badge';
                badge.innerHTML = '⚔️ <span style="color: #ffd276; font-weight: 700;">LORD SLAIN</span>';
                badge.style.cssText = 'font-size: 0.75rem; letter-spacing: 1.5px; margin-top: 4px;';
                if (textDiv) textDiv.appendChild(badge);

                if (btn) {
                    btn.textContent = 'RE-FIGHT';
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.style.cursor = 'pointer';
                    btn.style.borderColor = '#c49a45';
                    btn.style.color = '#ffd276';
                    btn.style.background = 'linear-gradient(180deg, #331515 0%, #1a0a0a 100%)';
                }
            } else {
                card.classList.remove('locked', 'defeated');
                card.style.opacity = '1';
                card.style.borderColor = '#4a3826';
                card.style.background = 'rgba(18, 14, 12, 0.85)';

                if (btn) {
                    btn.textContent = 'CHALLENGE';
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.style.cursor = 'pointer';
                    btn.style.borderColor = '#aa3333';
                    btn.style.color = '#ff9999';
                    btn.style.background = 'linear-gradient(180deg, #331515 0%, #1a0a0a 100%)';
                }
            }
        });
    }

    // ----------------------------------------------------
    // 3D COSTUMES & SKINS UI CONTROLLER
    // ----------------------------------------------------
    openSkinsModal() {
        const modal = document.getElementById('skins-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.updateSkinsModalUI();
            if (this.audio) this.audio.playRoll();
        }
    }

    closeSkinsModal() {
        const modal = document.getElementById('skins-modal');
        if (modal) modal.style.display = 'none';
    }

    selectSkin(skinId, showNotification = true) {
        if (!window.COSTUMES || !window.COSTUMES[skinId]) return;
        const costume = window.COSTUMES[skinId];

        // Apply 3D model skin swap
        if (this.charFactory && this.playerMesh) {
            this.charFactory.applySkinToPlayer(this.playerMesh, skinId);
        }

        // Apply stat perks
        if (this.combat) {
            this.combat.skinPerks = costume.perkData;
        }

        // Save preference
        localStorage.setItem('darksouls_equipped_skin', skinId);

        // Update UI modal cards
        this.updateSkinsModalUI();

        if (this.triggerAutoSave) {
            this.triggerAutoSave('SKIN_EQUIP');
        }

        if (showNotification) {
            this.showNotification(`🛡️ EQUIPPED 3D ARMOR: ${costume.name}`);
            if (this.audio) this.audio.playBonfireIgnite();
        }
    }

    updateSkinsModalUI() {
        const current = localStorage.getItem('darksouls_equipped_skin') || 'warrior';
        const cards = document.querySelectorAll('.skin-card');
        cards.forEach(card => {
            const sid = card.getAttribute('data-skin-id');
            const btn = card.querySelector('.btn-equip-skin');
            if (sid === current) {
                card.classList.add('equipped');
                card.style.borderColor = '#ffd276';
                card.style.boxShadow = '0 0 15px rgba(255, 210, 118, 0.3)';
                if (btn) {
                    btn.textContent = 'EQUIPPED ✓';
                    btn.disabled = true;
                    btn.style.borderColor = '#c49a45';
                    btn.style.color = '#ffd276';
                    btn.style.background = 'rgba(60, 45, 20, 0.8)';
                }
            } else {
                card.classList.remove('equipped');
                card.style.borderColor = '#4a3826';
                card.style.boxShadow = 'none';
                if (btn) {
                    btn.textContent = 'EQUIP';
                    btn.disabled = false;
                    btn.style.borderColor = '#886633';
                    btn.style.color = '#e0c896';
                    btn.style.background = 'transparent';
                }
            }
        });
    }

    // ==========================================
    // ADMIN TESTING & DEV SUITE (PERMANENT)
    // ==========================================
    openAdminModal() {
        const modal = document.getElementById('admin-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.updateAdminModalUI();
            if (this.audio) this.audio.playRoll();
        }
    }

    closeAdminModal() {
        const modal = document.getElementById('admin-modal');
        if (modal) modal.style.display = 'none';
    }

    adminUnlockAllBosses() {
        if (!this.combat) return;
        this.combat.adminModeUnlocked = true;
        this.combat.defeatedBosses = this.combat.bossRoster.map(b => b.id);
        const locs = window.DARK_SOULS_LOCATIONS || [];
        this.unlockedLocations = locs.map(l => l.id);
        try {
            localStorage.setItem('darksouls_admin_mode', 'true');
            localStorage.setItem('ds_unlocked_locations', JSON.stringify(this.unlockedLocations));
        } catch (e) {}
        this.saveGame(false, 'ADMIN UNLOCK ALL BOSSES & REALMS');
        this.updateBossRosterUI();
        this.updateAdminModalUI();
        this.showNotification(`👑 ADMIN: ALL ${this.combat.bossRoster.length} BOSSES & ALL REALMS UNLOCKED!`);
        if (this.audio) this.audio.playVictory();
    }

    adminLockBosses() {
        if (!this.combat) return;
        this.combat.adminModeUnlocked = false;
        this.combat.defeatedBosses = [];
        localStorage.removeItem('darksouls_admin_mode');
        this.saveGame(false, 'ADMIN RESET');
        this.updateBossRosterUI();
        this.updateAdminModalUI();
        this.showNotification("🔒 PROGRESSION RESET: TAURUS UNLOCKED, SUBSEQUENT LORDS LOCKED");
        if (this.audio) this.audio.playRoll();
    }

    adminUnlockAllWeapons() {
        if (!this.combat) return;
        this.combat.unlockedWeapons = Object.keys(this.combat.weapons);
        this.saveGame(false, 'ADMIN WEAPONS');
        if (this.updateArsenalUI) this.updateArsenalUI();
        if (this.updateWeaponArsenalUI) this.updateWeaponArsenalUI();
        this.updateAdminModalUI();
        this.showNotification(`🗡️ ADMIN: ALL ${this.combat.unlockedWeapons.length} WEAPONS UNLOCKED PERMANENTLY!`);
        if (this.audio) this.audio.playBonfireIgnite();
    }

    adminGrantSoulsAndEstus(souls = 100000) {
        if (!this.combat) return;
        this.combat.souls += souls;
        this.combat.maxEstus = 10;
        this.combat.estusFlasks = 10;
        this.combat.hp = this.combat.maxHp;
        this.combat.stamina = this.combat.maxStamina;
        this.saveGame(false, 'ADMIN RESOURCES');
        this.updateHUD();
        this.updateAdminModalUI();
        this.showNotification(`💰 ADMIN: +${souls.toLocaleString()} SOULS & 10 ESTUS FLASKS GRANTED!`);
        if (this.audio) this.audio.playBonfireIgnite();
    }

    adminToggleGodMode() {
        if (!this.combat) return;
        this.combat.isGodMode = !this.combat.isGodMode;
        if (this.combat.isGodMode) {
            this.combat.hp = this.combat.maxHp;
            this.combat.stamina = this.combat.maxStamina;
        }
        this.saveGame(false, 'ADMIN GODMODE');
        this.updateAdminModalUI();
        this.showNotification(this.combat.isGodMode ? "⚡ ADMIN GOD MODE: ENABLED (INVULNERABLE)" : "🛡️ ADMIN GOD MODE: DISABLED");
        if (this.audio) this.audio.playParry();
    }

    adminWarp(dest) {
        if (!this.playerMesh) return;
        switch (dest) {
            case 'nito':
            case 'catacombs_mausoleum':
                this.warpToCatacombs();
                break;
            case 'arena':
                this.warpToArena();
                break;
            case 'bonfire':
                this.playerMesh.position.set(0, 0, 5);
                this.cameraYaw = 0;
                this.cameraPitch = 0.25;
                this.showNotification("WARPED TO FIRELINK BONFIRE");
                break;
            case 'crypt':
                this.playerMesh.position.set(-20, -5.0, 35);
                this.cameraYaw = 0;
                this.cameraPitch = 0.18;
                this.showNotification("WARPED TO FLOODED CRYPT CORRIDOR");
                break;
            case 'ramparts':
                this.playerMesh.position.set(20, 6.0, 35);
                this.cameraYaw = 0;
                this.cameraPitch = 0.22;
                this.showNotification("WARPED TO HIGH ARCHER RAMPARTS (+6M)");
                break;
        }
        this.closeAdminModal();
        if (this.audio) this.audio.playRoll();
    }

    adminSummonBoss(bossId) {
        this.closeAdminModal();
        if (this.combat) {
            this.combat.spawnBoss(bossId);
            if (bossId === 'nito') {
                this.warpToCatacombs();
            } else {
                this.warpToArena();
            }
            if (this.audio) this.audio.playBellToll();
        }
    }

    updateAdminModalUI() {
        const godBtn = document.getElementById('btn-admin-godmode');
        if (godBtn && this.combat) {
            godBtn.textContent = this.combat.isGodMode ? '⚡ GOD MODE: ON (INVULNERABLE)' : '🛡️ GOD MODE: OFF';
            godBtn.style.borderColor = this.combat.isGodMode ? '#ffd700' : '#885533';
            godBtn.style.color = this.combat.isGodMode ? '#fff3a8' : '#e0c896';
            godBtn.style.background = this.combat.isGodMode ? 'rgba(80, 60, 10, 0.85)' : 'transparent';
        }

        const lockBtn = document.getElementById('btn-admin-unlock-bosses');
        if (lockBtn && this.combat) {
            const isAllUnlocked = this.combat.adminModeUnlocked || (this.combat.defeatedBosses && this.combat.defeatedBosses.length >= 5);
            lockBtn.textContent = isAllUnlocked ? '⚡ ALL BOSSES UNLOCKED ✓' : '🔓 UNLOCK ALL 6 BOSSES';
            lockBtn.style.borderColor = isAllUnlocked ? '#4caf50' : '#c49a45';
            lockBtn.style.color = isAllUnlocked ? '#a5d6a7' : '#ffd276';
        }
    }

    togglePerformanceMode(forceMode = null) {
        if (forceMode !== null) {
            this.performanceMode = forceMode;
        } else {
            this.performanceMode = !this.performanceMode;
        }
        localStorage.setItem('darksouls_perf_mode', this.performanceMode ? 'true' : 'false');

        const isMobileOrTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 1200);
        const pixelRatio = this.performanceMode ? 1.0 : (isMobileOrTouch ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.25));
        this.renderer.setPixelRatio(pixelRatio);
        this.renderer.shadowMap.enabled = !this.performanceMode;

        if (this.performanceMode) {
            this.postProcessingEnabled = false;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.10;
            this.showNotification("⚡ 60 FPS PERFORMANCE MODE: ACTIVE (SMOOTH & FAST)");
        } else {
            this.postProcessingEnabled = (this.postProcessing !== null);
            if (this.postProcessingEnabled) {
                this.renderer.toneMapping = THREE.NoToneMapping;
            }
            this.showNotification("✨ AAA GRAPHICS MODE: ACTIVE (CINEMATIC)");
        }

        this.updatePerfUI();
        if (this.audio) this.audio.playRoll();
    }

    updatePerfUI() {
        const btns = document.querySelectorAll('.btn-perf-toggle');
        btns.forEach(btn => {
            btn.innerHTML = this.performanceMode
                ? '⚡ <span class="btn-label-text">60 FPS</span>'
                : '✨ <span class="btn-label-text">AAA</span>';
            btn.style.borderColor = this.performanceMode ? '#4caf50' : '#00e5ff';
            btn.style.color = this.performanceMode ? '#a5d6a7' : '#b2ebf2';
        });
    }

    // ----------------------------------------------------
    // 3D LORE ITEM BEACON SYSTEM & DROPS
    // ----------------------------------------------------
    spawnLoreItemBeacon(pos, loreId, loreTitle) {
        if (!this.loreBeacons) this.loreBeacons = [];

        const beaconGroup = new THREE.Group();
        beaconGroup.position.copy(pos);

        // 1. Vertical golden beam of light
        const beamGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8);
        const beamMat = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.y = 1.6;
        beaconGroup.add(beam);

        // 2. Floating spinning Soul Relic diamond
        const diamondGeo = new THREE.OctahedronGeometry(0.22, 0);
        const diamondMat = new THREE.MeshStandardMaterial({
            color: 0xffe066,
            emissive: 0xffaa00,
            emissiveIntensity: 1.8,
            roughness: 0.1,
            metalness: 0.9
        });
        const diamond = new THREE.Mesh(diamondGeo, diamondMat);
        diamond.position.y = 0.75;
        beaconGroup.add(diamond);

        // 3. Ground rune circle
        const circleGeo = new THREE.RingGeometry(0.3, 0.55, 16);
        const circleMat = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        const circle = new THREE.Mesh(circleGeo, circleMat);
        circle.rotation.x = -Math.PI / 2;
        circle.position.y = 0.05;
        beaconGroup.add(circle);

        this.scene.add(beaconGroup);

        this.loreBeacons.push({
            group: beaconGroup,
            diamond: diamond,
            beam: beam,
            circle: circle,
            pos: pos.clone(),
            loreId: loreId,
            loreTitle: loreTitle,
            baseY: 0.75,
            time: 0
        });
    }

    updateLoreBeacons(delta) {
        if (!this.loreBeacons || this.loreBeacons.length === 0) return;
        const playerPos = this.playerMesh.position;

        for (let i = this.loreBeacons.length - 1; i >= 0; i--) {
            const b = this.loreBeacons[i];
            b.time += delta;
            if (b.diamond) {
                b.diamond.rotation.y += delta * 2.2;
                b.diamond.rotation.x += delta * 1.1;
                b.diamond.position.y = b.baseY + Math.sin(b.time * 3.5) * 0.15;
            }
            if (b.circle) {
                b.circle.rotation.z += delta * 0.8;
            }

            // Pickup proximity check (within 2.4m)
            const dist = playerPos.distanceTo(b.pos);
            if (dist < 2.4) {
                if (window.DarkSoulsLore && b.loreId) {
                    const res = window.DarkSoulsLore.unlock(b.loreId);
                    const title = (res && res.item && res.item.title) || b.loreTitle || 'Dark Souls Lore Item';
                    this.showNotification(`📜 LORE ITEM ACQUIRED: ${title}`);
                }
                if (this.audio && this.audio.playBellToll) this.audio.playBellToll();
                this.scene.remove(b.group);
                this.loreBeacons.splice(i, 1);
                if (this.triggerAutoSave) {
                    this.triggerAutoSave('LORE_ACQUIRED');
                }
            }
        }
    }

    // ----------------------------------------------------
    // 3D BLOODSTAIN MARKER SYSTEM (RECOVER LOST STUFF & SOULS)
    // ----------------------------------------------------
    spawnBloodstainMarker(pos, souls) {
        if (this.bloodstainMarker && this.bloodstainMarker.group) {
            this.scene.remove(this.bloodstainMarker.group);
        }

        const markerGroup = new THREE.Group();
        markerGroup.position.copy(pos);

        // 1. Glowing Blood Pool on floor
        const poolGeo = new THREE.CircleGeometry(0.85, 18);
        const poolMat = new THREE.MeshStandardMaterial({
            color: 0x880000,
            emissive: 0x440000,
            roughness: 0.2,
            metalness: 0.8,
            side: THREE.DoubleSide
        });
        const pool = new THREE.Mesh(poolGeo, poolMat);
        pool.rotation.x = -Math.PI / 2;
        pool.position.y = 0.04;
        markerGroup.add(pool);

        // 2. Glowing Red & Amber Rune Circle
        const runeGeo = new THREE.RingGeometry(0.75, 1.05, 24);
        const runeMat = new THREE.MeshBasicMaterial({
            color: 0xff3333,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85
        });
        const rune = new THREE.Mesh(runeGeo, runeMat);
        rune.rotation.x = -Math.PI / 2;
        rune.position.y = 0.05;
        markerGroup.add(rune);

        // 3. Floating pulsing Soul Ember Orb
        const orbGeo = new THREE.DodecahedronGeometry(0.26);
        const orbMat = new THREE.MeshStandardMaterial({
            color: 0xff2222,
            emissive: 0xff4422,
            emissiveIntensity: 2.8,
            roughness: 0.1,
            metalness: 0.9
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        orb.position.y = 0.8;
        markerGroup.add(orb);

        // 4. Vertical Crimson Pillar of Light
        const beamGeo = new THREE.CylinderGeometry(0.06, 0.06, 4.2, 8);
        const beamMat = new THREE.MeshBasicMaterial({
            color: 0xff2222,
            transparent: true,
            opacity: 0.55,
            blending: THREE.AdditiveBlending
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.y = 2.1;
        markerGroup.add(beam);

        this.scene.add(markerGroup);

        this.bloodstainMarker = {
            group: markerGroup,
            orb: orb,
            rune: rune,
            pool: pool,
            beam: beam,
            pos: pos.clone(),
            souls: souls,
            baseY: 0.8,
            time: 0
        };
    }

    updateBloodstainMarker(delta) {
        if (!this.bloodstainMarker || !this.bloodstainMarker.group) return;
        const bm = this.bloodstainMarker;
        bm.time += delta;

        if (bm.orb) {
            bm.orb.rotation.y += delta * 2.5;
            bm.orb.rotation.z += delta * 1.2;
            bm.orb.position.y = bm.baseY + Math.sin(bm.time * 3.8) * 0.14;
        }
        if (bm.rune) {
            bm.rune.rotation.z += delta * 0.6;
        }

        // Proximity check: retrieve lost stuff & souls when player touches bloodstain
        if (this.playerMesh && this.combat && !this.combat.isDead) {
            const dist = this.playerMesh.position.distanceTo(bm.pos);
            if (dist < 2.4) {
                const recoveredSouls = bm.souls || 0;
                this.combat.souls += recoveredSouls;
                this.showSoulsGained(recoveredSouls);
                this.showNotification(`🩸 RETRIEVED ${recoveredSouls.toLocaleString()} LOST SOULS & RECOVERED LOST STUFF!`);
                if (this.audio && this.audio.playBellToll) this.audio.playBellToll();
                this.scene.remove(bm.group);
                this.bloodstainMarker = null;
                this.combat.bloodstain = null;

                if (this.triggerAutoSave) {
                    this.triggerAutoSave('BLOODSTAIN_RECOVERED');
                }
            }
        }
    }

    // ----------------------------------------------------
    // LORE CODEX MODAL & ENCYCLOPEDIA (30 MOBS & ITEMS)
    // ----------------------------------------------------
    openLoreCodexModal() {
        const modal = document.getElementById('lore-codex-modal');
        if (!modal) return;
        modal.style.display = 'flex';
        this.renderLoreCodexContent('all');
    }

    closeLoreCodexModal() {
        const modal = document.getElementById('lore-codex-modal');
        if (modal) modal.style.display = 'none';
    }

    renderLoreCodexContent(activeFilter = 'all') {
        const container = document.getElementById('lore-cards-grid');
        const statsElem = document.getElementById('lore-unlocked-count');
        if (!container) return;

        const allMobs = (window.DarkSoulsLore && window.DarkSoulsLore.mobs) || window.DARK_SOULS_MOBS || [];
        const unlockedMap = (window.DarkSoulsLore && window.DarkSoulsLore.getUnlockedMap()) || {};

        let unlockedCount = 0;
        allMobs.forEach(m => {
            if (unlockedMap[m.loreId]) unlockedCount++;
        });

        if (statsElem) {
            statsElem.textContent = `${unlockedCount} / ${allMobs.length} Discovered`;
        }

        const filtered = allMobs.filter(m => {
            if (activeFilter === 'all') return true;
            return (m.loreCategory || '').toLowerCase() === activeFilter.toLowerCase();
        });

        container.innerHTML = filtered.map(m => {
            const isUnlocked = !!unlockedMap[m.loreId];
            if (isUnlocked) {
                return `
                    <div class="lore-card unlocked" style="background: linear-gradient(145deg, rgba(32, 24, 16, 0.95), rgba(18, 14, 10, 0.95)); border: 1.5px solid #d4af37; border-radius: 12px; padding: 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.6), 0 0 12px rgba(212,175,55,0.25);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <span style="font-size: 0.72rem; letter-spacing: 1px; color: #ffd778; font-weight: 800; text-transform: uppercase;">⚜️ ${m.loreCategory}</span>
                            <span style="font-size: 0.72rem; color: #a5d6a7; font-weight: 700; background: rgba(76,175,80,0.2); padding: 2px 8px; border-radius: 9999px;">${m.loreBonus}</span>
                        </div>
                        <h4 style="margin: 0 0 6px 0; color: #fff3a8; font-family: 'Cinzel', serif; font-size: 1.02rem; font-weight: 800;">${m.loreTitle}</h4>
                        <div style="font-size: 0.76rem; color: #b8a896; margin-bottom: 8px;">
                            <span>Origin: <strong style="color: #ffd276;">${m.name}</strong></span> &bull; <span>Zone: ${m.zone}</span>
                        </div>
                        <p style="margin: 0; font-size: 0.82rem; line-height: 1.45; color: #e0d0c0; font-style: italic; border-left: 2px solid #a87932; padding-left: 8px;">
                            "${m.loreDesc}"
                        </p>
                    </div>
                `;
            } else {
                return `
                    <div class="lore-card locked" style="background: rgba(15, 15, 18, 0.85); border: 1px dashed rgba(168, 121, 50, 0.4); border-radius: 12px; padding: 14px; opacity: 0.65;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <span style="font-size: 0.72rem; color: #887d70; font-weight: 700; text-transform: uppercase;">🔒 ${m.loreCategory}</span>
                            <span style="font-size: 0.7rem; color: #666;">UNDISCOVERED</span>
                        </div>
                        <h4 style="margin: 0 0 6px 0; color: #887d70; font-family: 'Cinzel', serif; font-size: 0.95rem;">??? Locked Lore Relic ???</h4>
                        <div style="font-size: 0.76rem; color: #776e62;">
                            Defeat <strong style="color: #c49a45;">${m.name}</strong> in <em>${m.zone}</em> to decipher ancient lore.
                        </div>
                    </div>
                `;
            }
        }).join('');
    }

    adminUnlockAllLore() {
        if (window.DarkSoulsLore && window.DarkSoulsLore.unlockAll) {
            window.DarkSoulsLore.unlockAll();
            this.showNotification("📜 ADMIN: ALL 500 DARK SOULS LORE ITEMS UNLOCKED!");
            this.renderLoreCodexContent('all');
        }
    }

    // ----------------------------------------------------
    // 30 LORDRAN LOCATIONS & FAST-TRAVEL EXPEDITIONS
    // ----------------------------------------------------
    openLocationsModal() {
        const modal = document.getElementById('locations-modal');
        if (!modal) return;
        modal.style.display = 'flex';
        this.renderLocationsUI('all');
    }

    closeLocationsModal() {
        const modal = document.getElementById('locations-modal');
        if (modal) modal.style.display = 'none';
    }

    renderLocationsUI(activeFilter = 'all') {
        const container = document.getElementById('locations-cards-grid');
        if (!container) return;

        const locs = window.DARK_SOULS_LOCATIONS || [];
        const unlocked = this.unlockedLocations || ['royal_bridge_arena', 'firelink_shrine', 'undead_asylum', 'undead_burg_bridge', 'majula_cliffside', 'heides_tower_ruins', 'boletaria_palace_gate', 'central_yharnam_bridge', 'limgrave_first_step', 'hunters_dream'];

        const filtered = locs.filter(l => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'unlocked') return unlocked.includes(l.id) || l.id === 'royal_bridge_arena';
            if (activeFilter === 'depths') return l.pos[1] < -1;
            if (activeFilter === 'high') return l.pos[1] > 2;
            if (activeFilter === 'surface') return l.pos[1] >= -1 && l.pos[1] <= 2;
            if (activeFilter === 'legendary') return (l.danger || '').includes('Tier V');
            return true;
        });

        // Top Return-To-Arena Hero Banner
        let html = `
            <div style="grid-column: 1 / -1; background: linear-gradient(90deg, rgba(45,30,12,0.96), rgba(70,45,15,0.96), rgba(45,30,12,0.96)); border: 2px solid #ffd700; border-radius: 12px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 0 22px rgba(255,215,0,0.35); margin-bottom: 8px;">
                <div>
                    <div style="font-size: 0.72rem; letter-spacing: 2.5px; color: #ffd700; font-weight: 800; text-transform: uppercase;">🏛️ ROYAL CITADEL SANCTUARY & ARENA HUB</div>
                    <div style="font-size: 1.05rem; font-weight: 800; color: #fff3a8; font-family: 'Cinzel', serif;">Grand Lordran Battle Hub & War Arena</div>
                    <div style="font-size: 0.76rem; color: #cbd5e1; margin-top: 2px;">Return here anytime to rest, switch weapons, and challenge the Lords of Lordran.</div>
                </div>
                <button onclick="travelToLordranLocation('royal_bridge_arena')" style="padding: 10px 20px; border: 1.5px solid #ffd700; border-radius: 6px; font-weight: 800; font-family: 'Cinzel', serif; font-size: 0.9rem; color: #fff3a8; background: linear-gradient(180deg, #664411 0%, #332205 100%); cursor: pointer; box-shadow: 0 0 14px rgba(255,215,0,0.45); white-space: nowrap;">
                    ⚡ RETURN TO ARENA
                </button>
            </div>
        `;

        html += filtered.map(l => {
            const isUnlocked = unlocked.includes(l.id) || l.id === 'royal_bridge_arena';
            const elevColor = l.pos[1] < -1 ? '#00ffaa' : (l.pos[1] > 2 ? '#ffd700' : '#ff7722');
            const borderColor = isUnlocked ? '#a87932' : '#443528';
            const bgOpacity = isUnlocked ? '0.95' : '0.65';

            const unlockBadge = isUnlocked
                ? `<span style="font-size: 0.7rem; color: #86efac; font-weight: 800; background: rgba(34,197,94,0.2); border: 1px solid rgba(74,222,128,0.4); padding: 2px 8px; border-radius: 9999px;">✨ DISCOVERED</span>`
                : `<span style="font-size: 0.7rem; color: #f87171; font-weight: 800; background: rgba(239,68,68,0.2); border: 1px solid rgba(248,113,113,0.4); padding: 2px 8px; border-radius: 9999px;">🔒 LOCKED</span>`;

            const actionButton = isUnlocked
                ? `<button class="btn-icon-bar" onclick="travelToLordranLocation('${l.id}')" style="width: 100%; justify-content: center; border-color: #ffd700; color: #fff3a8; font-weight: 800; background: rgba(55, 42, 12, 0.75); box-shadow: 0 0 10px rgba(255,215,0,0.3); padding: 8px 12px; cursor: pointer;">
                    ⚡ FAST-TRAVEL TO THIS REALM
                   </button>`
                : `<button class="btn-icon-bar" disabled style="width: 100%; justify-content: center; border-color: #554433; color: #776655; font-weight: 700; background: rgba(25, 20, 16, 0.6); padding: 8px 12px; cursor: not-allowed; opacity: 0.55;">
                    🔒 DEFEAT ${l.boss ? l.boss.toUpperCase() : 'LORD'} TO UNLOCK
                   </button>`;

            return `
                <div class="location-card" style="background: linear-gradient(145deg, rgba(28, 22, 16, ${bgOpacity}), rgba(15, 12, 10, ${bgOpacity})); border: 1.5px solid ${borderColor}; border-radius: 12px; padding: 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.6); display: flex; flex-direction: column; justify-content: space-between; ${isUnlocked ? '' : 'filter: grayscale(0.25);'}">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <span style="font-size: 0.72rem; letter-spacing: 1px; color: ${elevColor}; font-weight: 800; text-transform: uppercase;">📍 ${l.zone} • ${l.elev}</span>
                            ${unlockBadge}
                        </div>
                        <h4 style="margin: 0 0 6px 0; color: ${isUnlocked ? '#fff3a8' : '#aaa'}; font-family: 'Cinzel', serif; font-size: 1.05rem; font-weight: 800;">${l.name}</h4>
                        <div style="font-size: 0.76rem; color: #b8a896; margin-bottom: 8px;">
                            <span>Key Encounters: <strong style="color: ${isUnlocked ? '#ff9944' : '#887766'};">${l.boss || 'None'}</strong></span>
                        </div>
                        <p style="margin: 0 0 12px 0; font-size: 0.8rem; line-height: 1.4; color: ${isUnlocked ? '#d0c0b0' : '#776b60'}; font-style: italic;">
                            "${l.desc}"
                        </p>
                    </div>
                    ${actionButton}
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    travelToLocation(locationId, keepDiscoveredWaystone = false) {
        const locs = window.DARK_SOULS_LOCATIONS || [];
        const loc = locs.find(l => l.id === locationId);
        if (!loc || !this.playerMesh) return;

        // Check unlock status
        const unlocked = this.unlockedLocations || ['royal_bridge_arena', 'firelink_shrine', 'undead_asylum', 'undead_burg_bridge', 'majula_cliffside', 'heides_tower_ruins', 'boletaria_palace_gate', 'central_yharnam_bridge', 'limgrave_first_step', 'hunters_dream'];
        if (!unlocked.includes(locationId) && locationId !== 'royal_bridge_arena') {
            this.showNotification(`🔒 THIS REALM IS LOCKED! DEFEAT ITS WARDEN TO UNLOCK.`);
            if (this.audio && this.audio.playParry) this.audio.playParry();
            return;
        }

        // Cinematic Dark Souls Teleport Fade Overlay
        let fadeEl = document.getElementById('teleport-fade-overlay');
        if (!fadeEl) {
            fadeEl = document.createElement('div');
            fadeEl.id = 'teleport-fade-overlay';
            fadeEl.style.position = 'fixed';
            fadeEl.style.top = '0';
            fadeEl.style.left = '0';
            fadeEl.style.width = '100vw';
            fadeEl.style.height = '100vh';
            fadeEl.style.backgroundColor = '#040302';
            fadeEl.style.zIndex = '999999';
            fadeEl.style.opacity = '0';
            fadeEl.style.pointerEvents = 'none';
            fadeEl.style.transition = 'opacity 0.18s ease-in-out';
            document.body.appendChild(fadeEl);
        }

        fadeEl.style.opacity = '1.0';

        setTimeout(() => {
            const targetY = typeof loc.pos[1] === 'number' ? loc.pos[1] : 0;
            this.playerMesh.position.set(loc.pos[0], targetY, loc.pos[2]);

            // Ensure ground height receives target elevation so it never falls into the void
            const groundY = this.world.getGroundHeight(loc.pos[0], loc.pos[2], targetY);
            if (groundY > -20.0) {
                this.playerMesh.position.y = groundY;
            } else {
                this.playerMesh.position.y = targetY;
            }

            // Zero velocity and cancel rolling/stagger to prevent carrying motion
            if (this.playerVelocity) this.playerVelocity.set(0, 0, 0);
            if (this.combat) {
                this.combat.isRolling = false;
                this.combat.isAttacking = false;
                this.combat.isStaggered = false;
            }

            this.cameraYaw = 0;
            this.cameraPitch = 0.22;

            // Immediately snap camera position to prevent flying across the world from far away
            const targetPos = this.playerMesh.position.clone().add(new THREE.Vector3(0, 1.4, 0));
            const dist = this.cameraDistance || 4.2;
            this.camera.position.set(
                targetPos.x,
                targetPos.y + dist * Math.sin(0.22),
                targetPos.z + dist * Math.cos(0.22)
            );
            this.camera.lookAt(targetPos);

            if (loc.light && this.renderer) {
                this.renderer.toneMappingExposure = loc.light;
            }

            // Save last active bonfire checkpoint
            this.lastBonfirePos = this.playerMesh.position.clone();

            // Spawn return waystone behind player if traveling outside hub
            const isHub = (locationId === 'royal_bridge_arena' || locationId === 'undead_burg_courtyard' || locationId === 'undead_burg');
            if (!isHub && this.world && this.world.spawnReturnWaystone) {
                const rx = loc.pos[0] - 2.0;
                const rz = loc.pos[2] - 2.5;
                const ry = this.playerMesh.position.y;
                this.world.spawnReturnWaystone(rx, ry, rz);
            } else if (isHub) {
                if (this.world && this.world.removeReturnWaystone) {
                    this.world.removeReturnWaystone();
                }
            }

            // Restore health, stamina, and flasks on fast-travel rest
            if (this.combat) {
                this.combat.hp = this.combat.maxHp;
                this.combat.stamina = this.combat.maxStamina;
                this.combat.estusFlasks = this.combat.maxEstus;
                this.combat.isPoisoned = false;
                this.combat.isPetrified = false;
            }

            if (this.audio && this.audio.playBellToll) this.audio.playBellToll();
            this.showNotification(`🗺️ FAST-TRAVEL: ${loc.name.toUpperCase()} (${loc.elev})`);

            this.closeLocationsModal();
            if (this.closeBonfireModal) this.closeBonfireModal();
            if (typeof closeQuickMenuModal === 'function') closeQuickMenuModal();
            this.updateHUD();
            this.updateEscapeMenuUI();

            setTimeout(() => {
                fadeEl.style.opacity = '0';
            }, 60);
        }, 180);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        const isMobileOrTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 1200);
        const pixelRatio = this.performanceMode ? 1.0 : (isMobileOrTouch ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.25));
        this.renderer.setPixelRatio(pixelRatio);
        if (this.postProcessing) {
            this.postProcessing.setSize(window.innerWidth, window.innerHeight);
        }
    }
}

// Global window helper functions
window.openSkinsModal = () => { if (window.game) window.game.openSkinsModal(); };
window.closeSkinsModal = () => { if (window.game) window.game.closeSkinsModal(); };
window.chooseSkin = (skinId) => { if (window.game) window.game.selectSkin(skinId); };

window.openAdminModal = () => { if (window.game) window.game.openAdminModal(); };
window.closeAdminModal = () => { if (window.game) window.game.closeAdminModal(); };
window.adminUnlockAllBosses = () => { if (window.game) window.game.adminUnlockAllBosses(); };
window.adminLockBosses = () => { if (window.game) window.game.adminLockBosses(); };
window.adminUnlockAllWeapons = () => { if (window.game) window.game.adminUnlockAllWeapons(); };
window.castSpell = () => { if (window.game && window.game.combat) window.game.combat.tryCastSpell(); };
window.cycleSpell = (dir = 1) => { if (window.game && window.game.combat) window.game.combat.cycleSpell(dir); };
window.openRingsModal = () => { if (window.game) window.game.openRingsModal(); };
window.closeRingsModal = () => { if (window.game) window.game.closeRingsModal(); };
window.equipRing = (slot, ringId) => { if (window.game && window.game.combat) window.game.combat.equipRing(slot, ringId); };
window.unequipRing = (slot) => { if (window.game && window.game.combat) window.game.combat.unequipRing(slot); };
window.openSpiritAshesModal = () => { if (window.game) window.game.openSpiritAshesModal(); };
window.closeSpiritAshesModal = () => { if (window.game) window.game.closeSpiritAshesModal(); };
window.summonSpiritAsh = (ashId) => { if (window.game && window.game.combat) window.game.combat.trySummonSpiritAsh(ashId); };
window.cycleSpiritAsh = (dir = 1) => { if (window.game && window.game.combat) window.game.combat.cycleSpiritAsh(dir); };
window.openGrimoireModal = () => { if (window.game) window.game.openGrimoireModal(); };
window.closeGrimoireModal = () => { if (window.game) window.game.closeGrimoireModal(); };
window.adminGrantSoulsAndEstus = (s) => { if (window.game) window.game.adminGrantSoulsAndEstus(s); };
window.adminToggleGodMode = () => { if (window.game) window.game.adminToggleGodMode(); };
window.adminWarp = (d) => { if (window.game) window.game.adminWarp(d); };
window.adminSummonBoss = (b) => { if (window.game) window.game.adminSummonBoss(b); };
window.togglePerformanceMode = () => { if (window.game) window.game.togglePerformanceMode(); };
window.openLoreCodexModal = () => { if (window.game) window.game.openLoreCodexModal(); };
window.closeLoreCodexModal = () => { if (window.game) window.game.closeLoreCodexModal(); };
window.filterLoreCodex = (cat) => { if (window.game) window.game.renderLoreCodexContent(cat); };
window.adminUnlockAllLore = () => { if (window.game) window.game.adminUnlockAllLore(); };

// 300 Authentic Lordran, Drangleic, Lothric, Boletaria, Yharnam, Ashina & Lands Between Fast-Travel Locations
window.DARK_SOULS_LOCATIONS = [
    // ----------------------------------------------------
    // SANCTUARIES & HUB REALMS
    // ----------------------------------------------------
    { id: 'royal_bridge_arena', name: 'Royal Bridge - Grand Citadel Arena (Hub)', zone: 'Royal Citadel', pos: [0, 0, 330], elev: '0m', danger: 'Sanctuary & War Arena (Hub)', boss: 'Arena Colosseum', desc: 'The high rampart causeway spanning the northern chasm, flanked by watchtowers and the nexus bonfire.', light: 1.10 },
    { id: 'firelink_shrine', name: 'Firelink Shrine - Ruined Bonfire', zone: 'Firelink Shrine', pos: [0, 0, 5], elev: '0m', danger: 'Sanctuary (Safe)', boss: 'None (Crestfallen Warrior)', desc: 'The historic nexus of Lordran where weary pilgrims gather around the warm embers of the bonfire.', light: 1.10 },
    { id: 'undead_parish_altar', name: 'Undead Parish - Sunlit Altar', zone: 'Undead Parish', pos: [4, 0, 40], elev: '0m', danger: 'Tier II (Moderate)', boss: 'Armored Fang Boar', desc: 'The shattered altar of the Warriors of Sunlight bathed in the golden radiance of the ancient sun.', light: 1.25 },
    { id: 'high_ramparts_watchtower', name: 'High Ramparts - Solar Overlook', zone: 'High Ramparts', pos: [24, 6.0, 35], elev: '+6m', danger: 'Tier II (Moderate)', boss: 'Knight Solaire', desc: 'The elevated eastern battlements where Knight Solaire gazes upon his incandescent sun.', light: 1.25 },
    { id: 'dukes_archives', name: "The Duke's Archives - Grand Library", zone: "Duke's Archives", pos: [22, 6.0, 35], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Channelers & Pisacas', desc: 'Vast multi-tiered library towers filled with esoteric sorcery tomes where Seath descended into madness.', light: 1.15 },
    { id: 'new_londo_ruins', name: 'New Londo Ruins - Flooded City', zone: 'New Londo Ruins', pos: [-20, -5.0, 145], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Drowned Ghosts & Darkwraiths', desc: 'The drowned city submerged under tons of lake water to contain the spread of the Darkwraiths.', light: 0.55 },
    { id: 'tomb_of_the_giants', name: 'Tomb of the Giants - Stygian Crypt', zone: 'Tomb of the Giants', pos: [-15, -5.0, 90], elev: '-5m', danger: 'Tier V (Legendary)', boss: 'Skeletal Beasts', desc: 'A realm of absolute suffocating blackness where giant four-legged skeletons hunt travelers by sound alone.', light: 0.35 },
    { id: 'blighttown_upper', name: 'Blighttown - Upper Scaffolding', zone: 'Blighttown', pos: [15, 6.0, 65], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Blowdart Snipers', desc: 'Creaking wooden walkways clinging to damp ravine cliffs, riddled with toxic snipers and ghoul nests.', light: 0.60 },

    // ----------------------------------------------------
    // 37 BOSS-UNLOCKED EXPEDITION REALMS
    // ----------------------------------------------------
    { id: 'undead_asylum', name: 'Undead Asylum - Northern Courtyard', zone: 'Undead Asylum', pos: [0, 0, -25], elev: '0m', danger: 'Tier I (Novice)', boss: 'Asylum Demon', desc: 'The remote fortress asylum where the Undead are locked away to await the end of the world.', light: 0.95 },
    { id: 'undead_burg_bridge', name: 'Undead Burg - Watchtower Bridge', zone: 'Undead Burg', pos: [0, 0, 20], elev: '0m', danger: 'Tier II (Moderate)', boss: 'Taurus Demon', desc: 'The scorched stone causeway where the crimson dragon rains incandescent flame upon all who cross.', light: 1.15 },
    { id: 'undead_parish_belfry', name: 'Undead Parish - Bell Tower Roof', zone: 'Undead Parish', pos: [20, 6.0, 50], elev: '+6m', danger: 'Tier III (Advanced)', boss: 'Twin Belfry Gargoyles', desc: 'The precipitous rooftop of the parish cathedral where the First Bell of Awakening tolls across Lordran.', light: 1.20 },
    { id: 'undead_burg_aqueduct', name: 'Undead Burg - Lower Aqueduct', zone: 'Undead Burg', pos: [-10, 0, -15], elev: '0m', danger: 'Tier I (Novice)', boss: 'Capra Demon', desc: 'Narrow mossy brick conduits bridging Firelink Shrine to the lower quarters of the Undead settlement.', light: 0.85 },
    { id: 'the_depths', name: 'The Depths - Slimy Sewers', zone: 'The Depths', pos: [-18, -5.0, 35], elev: '-5m', danger: 'Tier III (Advanced)', boss: 'Gaping Dragon', desc: 'The suffocating subterranean runoff of the Burg, inhabited by butchers, slime and cursed basilisks.', light: 0.65 },
    { id: 'quelaags_domain', name: "Quelaag's Domain - Lava Cavern", zone: "Quelaag's Domain", pos: [-18, -5.0, 65], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Chaos Witch Quelaag', desc: 'Cavern of petrified spiderwebs and boiling volcanic magma where the Second Bell of Awakening hangs.', light: 0.90 },
    { id: 'darkroot_garden', name: 'Darkroot Garden - Moonlit Grove', zone: 'Darkroot Garden', pos: [12, 0, 25], elev: '0m', danger: 'Tier II (Moderate)', boss: 'Moonlight Butterfly', desc: 'A serene yet treacherous forest glowing with bioluminescent foliage and ancient stone guardians.', light: 0.75 },
    { id: 'sens_fortress_roof', name: "Sen's Fortress - Rooftop Battlements", zone: "Sen's Fortress", pos: [24, 6.0, 95], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Iron Golem', desc: 'The gale-swept fortress roof overlooking Lordran, guarded by a colossal automaton forged of dragon bone.', light: 1.10 },
    { id: 'anor_londo_courtyard', name: 'Anor Londo - Grand Cathedral Steps', zone: 'Anor Londo', pos: [-6, 0, 80], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Dragonslayer Ornstein', desc: 'The breathtaking marble city of the gods, illuminated by eternal sunlight atop the mountain plateau.', light: 1.30 },
    { id: 'anor_londo_hall', name: 'Anor Londo - Hall of the Great Lord', zone: 'Anor Londo', pos: [0, 0, 110], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Executioner Smough', desc: 'The majestic throne room where Dragon Slayer Ornstein and Executioner Smough guard the Lordvessel.', light: 1.25 },
    { id: 'darkroot_basin', name: 'Darkroot Basin - Hydra Lagoon & Grave', zone: 'Darkroot Basin', pos: [-12, -5.0, 20], elev: '-5m', danger: 'Tier III (Advanced)', boss: 'Great Grey Wolf Sif', desc: 'Deep mountain chasm where roaring waterfalls crash into a lagoon guarded by Artorias loyal companion.', light: 0.80 },
    { id: 'oolacile_township', name: 'Oolacile Township - Colosseum Grounds', zone: 'Oolacile', pos: [18, 6.0, 115], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Knight Artorias', desc: 'The ancient golden city of sorcery engulfed in the rampant spread of primeval Dark humanity.', light: 0.85 },
    { id: 'chasm_of_the_abyss', name: 'Chasm of the Abyss - Primeval Dark', zone: 'Oolacile', pos: [-28, -5.0, 160], elev: '-5m', danger: 'Tier V (Legendary)', boss: 'Manus, Father of the Abyss', desc: 'The primordial birthplace of dark humanity deep beneath the ancient ruins of Oolacile.', light: 0.30 },
    { id: 'royal_wood', name: 'Royal Wood - Dragon Waterfall Gorge', zone: 'Royal Wood', pos: [16, 6.0, 130], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Black Dragon Kalameet', desc: 'Lush prehistoric woodland fed by subterranean streams where the last ancient calamity dragon nests.', light: 0.90 },
    { id: 'nitos_domain', name: "Gravelord Nito's Domain - Altar of Death", zone: 'Gravelord Domain', pos: [-22, -5.0, 140], elev: '-5m', danger: 'Tier V (Legendary)', boss: 'Gravelord Nito', desc: 'The deepest ossuary of Lordran where the First of the Dead rests inside his subterranean sarcophagus.', light: 0.40 },
    { id: 'kiln_of_first_flame', name: 'Kiln of the First Flame - Ash Field', zone: 'Kiln of the First Flame', pos: [14, 6.0, 140], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Gwyn, Lord of Cinder', desc: 'The white ash desert where the First Flame was ignited and where Lord Gwyn waits at the end of time.', light: 1.05 },
    { id: 'asylum_depths', name: 'Undead Asylum - Subterranean Vaults', zone: 'Undead Asylum', pos: [0, -5.0, -25], elev: '-5m', danger: 'Tier III (Advanced)', boss: 'Stray Demon', desc: 'The collapsed stone cellars beneath the Northern Undead Asylum, sealed beneath fragile stone flooring.', light: 0.70 },
    { id: 'demon_ruins', name: 'Demon Ruins - Magma Riverbanks', zone: 'Demon Ruins', pos: [-26, -5.0, 75], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Demon Firesage', desc: 'The scorched red riverbeds directly beneath Quelaags domain, flooded with fiery molten rock.', light: 1.00 },
    { id: 'blighttown_swamp', name: 'Blighttown - Poison Swamp Bottom', zone: 'Blighttown', pos: [-24, -5.0, 55], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Centipede Demon', desc: 'A vast expanse of poisonous sludge stretching beneath the great hollow, boiling with magma flies.', light: 0.55 },
    { id: 'lost_izalith', name: 'Lost Izalith - Bed of Chaos Sanctuary', zone: 'Lost Izalith', pos: [-22, -5.0, 120], elev: '-5m', danger: 'Tier V (Legendary)', boss: 'Bed of Chaos', desc: 'The ancient capital of flame swallowed by mutant vegetation and chaotic demons after the fire went wild.', light: 0.95 },
    { id: 'demon_ruins_basin', name: 'Demon Ruins - Lava Basin Overlook', zone: 'Demon Ruins', pos: [-30, -5.0, 95], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Ceaseless Discharge', desc: 'A blistering precipice of cooled obsidian overlooking the endless subterranean sea of boiling magma.', light: 1.05 },
    { id: 'crystal_cave', name: 'Crystal Cave - Invisible Crystal Bridges', zone: 'Crystal Cave', pos: [-2, 0, 90], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Seath the Scaleless', desc: 'A glistening underground cavern of blue titanite crystals and invisible walkways spanning bottomless drops.', light: 0.90 },
    { id: 'the_abyss', name: 'The Abyss - Void of the Four Kings', zone: 'The Abyss', pos: [0, 0, 65], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Four Kings', desc: 'An infinite dimension of pure void where matter and time dissolve into primordial darkness.', light: 0.25 },
    { id: 'painted_world', name: 'Painted World of Ariamis - Snow Courtyard', zone: 'Painted World', pos: [-8, 0, 50], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Crossbreed Priscilla', desc: 'A quiet, snowbound exile sealed within an immense oil canvas inside the Anor Londo cathedral.', light: 1.05 },
    { id: 'darkmoon_tomb', name: 'Anor Londo - Darkmoon Tomb of Gwyn', zone: 'Anor Londo', pos: [-4, 0, 125], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Dark Sun Gwyndolin', desc: 'The sacred illusory mausoleum consecrated to Lord Gwyn, guarded by the blade of the Darkmoon.', light: 0.80 },
    { id: 'the_catacombs', name: 'The Catacombs - Bone Crypt', zone: 'The Catacombs', pos: [-20, -5.0, 45], elev: '-5m', danger: 'Tier III (Advanced)', boss: 'Pinwheel', desc: 'A pitch-black necropolis of winding tunnels carved with skull mosaics and animated skeleton sentinels.', light: 0.50 },
    { id: 'oolacile_sanctuary', name: 'Oolacile Sanctuary - Floral Clearing', zone: 'Oolacile', pos: [10, 6.0, 105], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Sanctuary Guardian', desc: 'A tranquil river glade at the threshold of Royal Wood where Elizabeth the talking mushroom tends the waters.', light: 1.15 },
    { id: 'fallen_giants', name: 'Forest of Fallen Giants - High Ramparts', zone: 'Drangleic', pos: [22, 6.0, 60], elev: '+6m', danger: 'Tier III (Advanced)', boss: 'The Pursuer', desc: 'Overgrown ramparts pierced by petrified giant trees and crumbling battlements of an ancient war.', light: 1.00 },
    { id: 'kings_passage', name: "King's Passage - Thunder Colonnade", zone: 'Drangleic', pos: [8, 0, 95], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Looking Glass Knight', desc: 'A rain-lashed outdoor colonnade leading to the royal throne, assaulted by ceaseless lightning strikes.', light: 0.85 },
    { id: 'brume_tower', name: 'Brume Tower - Ash Wasteland Summit', zone: 'Brume Tower', pos: [26, 6.0, 145], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Fume Knight Raime', desc: 'A towering iron spire rising through volcanic ash clouds, haunted by the fiery spirit of Nadalia.', light: 0.95 },
    { id: 'alonne_keep', name: 'Memory of the Old Iron King - Polished Hall', zone: 'Iron Keep', pos: [6, 0, 135], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Sir Alonne', desc: 'A pristine mirrored marble hall from the golden age of the Iron King, spotless and immaculate.', light: 1.20 },
    { id: 'archdragon_peak', name: 'Archdragon Peak - Cloud Sanctuary', zone: 'Archdragon Peak', pos: [20, 6.0, 160], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'The Nameless King', desc: 'Ancient ruinous temple standing high above the cloud layer, sanctuary to dragon worshippers.', light: 1.35 },
    { id: 'farron_keep', name: 'Farron Keep - Mausoleum of Blood', zone: 'Farron Keep', pos: [-14, -5.0, 80], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Abyss Watchers', desc: 'Poisonous swamp leading to the wolf mausoleum where the Undead Legion performs their endless duel.', light: 0.70 },
    { id: 'irithyll_cathedral', name: 'Irithyll of Boreal Valley - Frozen Spire', zone: 'Boreal Valley', pos: [-10, 0, 140], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Pontiff Sulyvahn', desc: 'A moonlit gothic city of frost and pale moonlight, under the tyrannical grasp of the Pontiff.', light: 1.10 },
    { id: 'world_end', name: 'The Ringed City - Ash Desert at the End of Time', zone: 'The Ringed City', pos: [18, 6.0, 175], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Slave Knight Gael', desc: 'An endless dune desert of white ash stretching to the horizon where the remnants of humanity bleed.', light: 0.90 },
    { id: 'first_flame_summit', name: 'Kiln of First Flame - Zenith of Cinder', zone: 'Kiln of First Flame', pos: [0, 6.0, 180], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Soul of Cinder', desc: 'The true epicenter of the fading world where the combined incarnation of every Lord awaits.', light: 1.15 },
    { id: 'serpent_sanctum', name: 'Sunken Serpent Sanctum - Altar of the Gorgon', zone: 'Sunken Sanctum', pos: [-25, -5.0, 130], elev: '-5m', danger: 'Tier V (Legendary)', boss: 'Medusa, Gorgon Matriarch', desc: 'Subterranean serpentine water temple steeped in venomous mist and guarded by petrifying cobras.', light: 0.60 },

    // ----------------------------------------------------
    // 30 EXPEDITION REALMS (DRANGLEIC, LOTHRIC, BOLETARIA & YHARNAM)
    // ----------------------------------------------------
    { id: 'majula_cliffside', name: 'Majula - Seaside Cliff Bonfire', zone: 'Majula', pos: [2, 0, -10], elev: '0m', danger: 'Sanctuary (Safe)', boss: 'Emerald Herald', desc: 'Sun-drenched coastal ruins overlooking the boundless sea where souls find solace under the dying sun.', light: 1.30 },
    { id: 'heides_tower_ruins', name: "Heide's Tower of Flame - Sunken Ruin", zone: 'Heide', pos: [6, 0, 15], elev: '0m', danger: 'Tier II (Moderate)', boss: 'Dragonrider of Heide', desc: 'Submerged ancient aqueducts and soaring lighthouses guarded by lumbering Old Knights in massive green stone plate.', light: 1.25 },
    { id: 'no_mans_wharf', name: "No-man's Wharf - Pirate Harbor", zone: "No-man's Wharf", pos: [-12, -5.0, 50], elev: '-5m', danger: 'Tier III (Advanced)', boss: 'Flexile Sentry', desc: 'A dark subterranean pirate port cut into sea cliffs, infested with darkdwellers terrified of firelight.', light: 0.65 },
    { id: 'lost_bastille_cells', name: 'The Lost Bastille - Exile Holding Cells', zone: 'Lost Bastille', pos: [18, 6.0, 45], elev: '+6m', danger: 'Tier III (Advanced)', boss: 'Ruin Sentinel Trio', desc: 'A colossal ocean penitentiary where cursed hollows were locked away to rot behind iron bars.', light: 0.90 },
    { id: 'sinners_rise_prison', name: "Sinner's Rise - Saltfort Water Prison", zone: "Sinner's Rise", pos: [-22, -5.0, 110], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Lost Sinner', desc: 'A flooded stone spire rising from dark waters, where the chained Sinner punishes herself in eternal darkness.', light: 0.40 },
    { id: 'huntsmans_copse', name: "Huntsman's Copse - Undead Lockaway", zone: "Huntsman's Copse", pos: [8, 0, 30], elev: '0m', danger: 'Tier II (Moderate)', boss: 'Skeleton Lords', desc: 'A misty pine forest where royalty held barbaric hunts of Undead victims across suspension bridges.', light: 0.70 },
    { id: 'earthen_peak_summit', name: 'Earthen Peak - Poison Windmill Summit', zone: 'Earthen Peak', pos: [25, 6.0, 80], elev: '+6m', danger: 'Tier III (Advanced)', boss: 'Mytha, the Baneful Queen', desc: 'A towering iron-and-wood windmill harvesting toxic venom and embalming oils beneath heavy green smog.', light: 0.85 },
    { id: 'iron_keep_molten', name: 'Iron Keep - Molten Threshold Bridge', zone: 'Iron Keep', pos: [0, 0, 115], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Old Iron King & Smelter Demon', desc: 'A sinking obsidian fortress submerged in a bubbling lake of molten basalt and magma flows.', light: 1.15 },
    { id: 'shrine_of_amana', name: 'Shrine of Amana - Priestess Prayer Altar', zone: 'Shrine of Amana', pos: [-16, -5.0, 100], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Demon of Song', desc: 'Submerged marble ruins where Milfanito priestesses sing melancholy lullabies across bioluminescent water lilies.', light: 0.80 },
    { id: 'undead_crypt_entrance', name: 'Undead Crypt - Entrance of the Dead', zone: 'Undead Crypt', pos: [-26, -5.0, 140], elev: '-5m', danger: 'Tier V (Legendary)', boss: 'Velstadt, the Royal Aegis', desc: 'The hallowed burial vault where lights are forbidden, guarded by the devoted royal bell hammer.', light: 0.45 },
    { id: 'dragon_shrine_summit', name: 'Dragon Shrine - Ancient Sky Altar', zone: 'Dragon Shrine', pos: [14, 6.0, 150], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Ancient Dragon', desc: 'Colossal floating mountain sanctuary where noble Drakekeepers and golden Dragonfang knights test pilgrims.', light: 1.30 },
    { id: 'frozen_eleum_loyce', name: 'Frozen Eleum Loyce - Grand Cathedral of Ice', zone: 'Eleum Loyce', pos: [-6, 0, 85], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Burnt Ivory King', desc: 'An ivory citadel encased in eternal blizzards, built atop the mouth of the Old Chaos to contain its wrath.', light: 1.20 },
    { id: 'cathedral_of_deep', name: 'Cathedral of the Deep - Cleansing Chapel', zone: 'Cathedral of Deep', pos: [12, 0, 55], elev: '0m', danger: 'Tier III (Advanced)', boss: 'Deacons of the Deep', desc: 'A monumental gothic cathedral tainted by the abyssal sludge of Aldrich and teeming with wretched deacon thralls.', light: 0.85 },
    { id: 'catacombs_of_carthus', name: 'Catacombs of Carthus - Desert King Crypt', zone: 'Carthus', pos: [-18, -5.0, 75], elev: '-5m', danger: 'Tier III (Advanced)', boss: 'High Lord Wolnir', desc: 'Sunken subterranean tombs of the sand kingdom of Carthus, littered with rolling bone boulders and giant curved swords.', light: 0.50 },
    { id: 'smouldering_lake', name: 'Smouldering Lake - Demon Ruins Basin', zone: 'Smouldering Lake', pos: [-8, -5.0, 120], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Old Demon King', desc: 'A cavernous subterranean sea of embers and weeping ruins where the last embers of Chaos fizzle out under giant ballista fire.', light: 0.75 },
    { id: 'irithyll_dungeon', name: 'Irithyll Dungeon - Cell Block of Jailers', zone: 'Irithyll Dungeon', pos: [-24, -5.0, 85], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Branding Iron Jailers', desc: 'A grim subterranean torture complex where cloaked jailers brand prisoners with flesh-melting searing irons.', light: 0.45 },
    { id: 'profaned_capital', name: 'Profaned Capital - Sunken Throne', zone: 'Profaned Capital', pos: [-15, -5.0, 155], elev: '-5m', danger: 'Tier V (Legendary)', boss: 'Yhorm the Giant', desc: 'The burnt-out metropolis consumed by the Profaned Flame, filled with gold-leaf treasures and monstrous horrors.', light: 0.65 },
    { id: 'lothric_castle_barracks', name: 'Lothric Castle - Dragon Barracks Ramparts', zone: 'Lothric Castle', pos: [24, 6.0, 115], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Dragonslayer Armour', desc: 'The fortified exterior bastions of Lothric guarded by twin wyverns breathing fire across the gatehouse.', light: 1.15 },
    { id: 'grand_archives_roof', name: 'Grand Archives - Gargoyle Rooftop', zone: 'Grand Archives', pos: [16, 6.0, 135], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Twin Princes Lothric & Lorian', desc: 'The steeply pitched slate roofs high above the crystal-coated library, hunted by Winged Knights and gargoyles.', light: 1.10 },
    { id: 'untended_graves', name: 'Untended Graves - Dark Firelink Shrine', zone: 'Untended Graves', pos: [0, 0, -18], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Champion Gundyr', desc: 'An eerie pitch-black mirror world of the Cemetery of Ash where the flame has died and black eyes weep.', light: 0.30 },
    { id: 'ariandel_snowfield', name: 'Painted World of Ariandel - Rope Bridge Overlook', zone: 'Ariandel', pos: [-10, 0, 70], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Sister Friede & Father Ariandel', desc: 'A rotting canvas world of frozen rot and snowdrifts where Corvian settlers huddle beneath a precarious rope bridge.', light: 1.15 },
    { id: 'dreg_heap_ruins', name: 'The Dreg Heap - Converging Ruins', zone: 'The Dreg Heap', pos: [10, 6.0, 120], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Demon Prince', desc: 'The crumpled detritus of every historic kingdom piled atop one another as time itself collapses inwards.', light: 0.85 },
    { id: 'ringed_inner_wall', name: 'The Ringed City - Ringed Inner Wall', zone: 'The Ringed City', pos: [22, 6.0, 155], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Darkeater Midir', desc: 'Gilded spires and abyssal swamps nestled in the hidden valley gifted to early humanity by Gwyn.', light: 0.95 },
    { id: 'boletaria_palace_gate', name: 'Boletarian Palace - Gates of the Nexus', zone: 'Boletaria', pos: [0, 0, 10], elev: '0m', danger: 'Sanctuary & War Gates', boss: 'Phalanx & Tower Knight', desc: 'The monolithic stone gates of King Allant XII palace enveloped in the demonic colorless deep fog.', light: 1.05 },
    { id: 'stonefang_tunnel', name: 'Stonefang Tunnel - Smithing Grounds', zone: 'Stonefang', pos: [-12, -5.0, 60], elev: '-5m', danger: 'Tier III (Advanced)', boss: 'Armor Spider & Flamelurker', desc: 'Deep volcanic mining shafts where scale miners excavate hardstone under searing geothermal steam blasts.', light: 0.80 },
    { id: 'tower_of_latria', name: 'Tower of Latria - Prison of Hope', zone: 'Tower of Latria', pos: [-20, -5.0, 125], elev: '-5m', danger: 'Tier IV (Severe)', boss: "Fool's Idol & Maneater", desc: 'A nightmarish panopticon prison illuminated by eerie green chandeliers where Mind Flayers ring their paralyzing bells.', light: 0.50 },
    { id: 'valley_of_defilement', name: 'Valley of Defilement - Swamp of Sorrow', zone: 'Valley of Defilement', pos: [-14, -5.0, 110], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Maiden Astraea & Garl Vinland', desc: 'A stinking cesspool of poison sludge and rotting shanties where the discarded dregs of humanity weep.', light: 0.40 },
    { id: 'central_yharnam_bridge', name: 'Central Yharnam - Great Bridge', zone: 'Yharnam', pos: [4, 0, 25], elev: '0m', danger: 'Sanctuary & Beast Bridge', boss: 'Cleric Beast & Father Gascoigne', desc: 'A soaring Victorian bridge littered with abandoned burning carriages and howling lycanthropic beasts.', light: 0.90 },
    { id: 'byrgenwerth_moonside', name: 'Byrgenwerth - Moonside Lake Observatory', zone: 'Byrgenwerth', pos: [-2, 0, 100], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Rom, the Vacuous Spider', desc: 'An ancient collegiate academy overlooking a serene moonlit lake that conceals all eldritch horrors.', light: 1.05 },
    { id: 'cainhurst_castle_roof', name: 'Forsaken Cainhurst Castle - Frost Rooftops', zone: 'Cainhurst', pos: [14, 6.0, 85], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Martyr Logarius', desc: 'An isolated snow-covered gothic palace towering above a frozen lake, realm of the immortal Vileblood Queen.', light: 1.15 },

    // ----------------------------------------------------
    // 25 ELDEN RING, SHADOW OF ERDTREE & BLOODBORNE REALMS (76–100)
    // ----------------------------------------------------
    { id: 'limgrave_first_step', name: 'Limgrave - The First Step & Golden Bough', zone: 'Limgrave', pos: [2, 0, 5], elev: '0m', danger: 'Sanctuary & Golden Bough', boss: 'Tree Sentinel', desc: 'Lush golden-grass hills bathed in the warm radiance of the towering Erdtree.', light: 1.35 },
    { id: 'stormveil_cliffside', name: 'Stormveil Castle - Cliffside Ramparts', zone: 'Stormveil', pos: [20, 6.0, 70], elev: '+6m', danger: 'Tier III (Advanced)', boss: 'Margit the Fell Omen', desc: 'A battered gale-swept castle perched on seaside bluffs, scarred by thorn brambles and exiled banishers.', light: 1.05 },
    { id: 'stormveil_throne', name: "Stormveil Castle - Godrick's Scion Hall", zone: 'Stormveil', pos: [4, 0, 105], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Godrick the Grafted', desc: 'The desecrated court where dragon-headed Godrick grafts rotting arms to harvest divine strength.', light: 1.15 },
    { id: 'raya_lucaria_gate', name: 'Academy of Raya Lucaria - Debate Parlor', zone: 'Raya Lucaria', pos: [-10, 0, 95], elev: '0m', danger: 'Tier III (Advanced)', boss: 'Red Wolf of Radagon', desc: 'Submerged crystal lake academy of Glintstone sorcerers beneath a dome of shimmering midnight blue.', light: 0.95 },
    { id: 'raya_lucaria_grand_library', name: 'Academy of Raya Lucaria - Grand Library', zone: 'Raya Lucaria', pos: [-5, 0, 130], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Rennala, Queen of Full Moon', desc: 'An amber-lit circular library where cradle-bound scholars crawl beneath a giant glowing moon.', light: 1.10 },
    { id: 'caelid_redmane_castle', name: 'Caelid - Redmane Castle Plaza', zone: 'Caelid', pos: [16, 0, 110], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Starscourge Radahn', desc: 'Scarlet Rot blighted desert fortress hosting the great combat festival beneath bleeding red skies.', light: 0.90 },
    { id: 'nokron_eternal_city', name: 'Nokron, Eternal City - Ancestral Woods', zone: 'Nokron', pos: [-15, -5.0, 90], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Mimic Tear & Ancestor Spirit', desc: 'A subterranean sunken city roofed with an illusory sky of glowing silver stars and fallen spires.', light: 0.70 },
    { id: 'leyndell_capital_rampart', name: 'Leyndell, Royal Capital - East Capital Rampart', zone: 'Leyndell', pos: [22, 6.0, 100], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Godfrey, First Elden Lord', desc: 'The dazzling golden metropolis of the Erdtree, paved in gilded stone and guarded by divine Oracle Envoys.', light: 1.40 },
    { id: 'leyndell_erdtree_sanctuary', name: 'Leyndell - Erdtree Sanctuary & Roots', zone: 'Leyndell', pos: [0, 6.0, 160], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Morgott, the Omen King', desc: 'The hallowed chamber at the foot of the impenetrable thorn-sealed roots of the Great Erdtree.', light: 1.30 },
    { id: 'mountaintops_giants', name: 'Mountaintops of the Giants - Freezing Lake', zone: 'Mountaintops', pos: [-12, 0, 115], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Fire Giant & Borealis', desc: 'Howling blizzards on frozen mountain crags where ancient frost dragons and giant golems sleep.', light: 1.20 },
    { id: 'crumbling_farum_azula', name: 'Crumbling Farum Azula - Dragon Temple', zone: 'Farum Azula', pos: [18, 6.0, 140], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Dragonlord Placidusax & Maliketh', desc: 'A timeless flying temple suspended in an eternal tornado vortex where ancient dragons rule the storm.', light: 1.25 },
    { id: 'haligtree_roots', name: "Miquella's Haligtree - Roots of the Rot Goddess", zone: 'Haligtree', pos: [-20, -5.0, 135], elev: '-5m', danger: 'Tier V (Legendary)', boss: 'Malenia, Blade of Miquella', desc: 'A colossal rotting sacred tree where the unalloyed needle shattered and the scarlet flower blooms.', light: 0.90 },
    { id: 'mohgwyn_dynasty', name: 'Mohgwyn Palace - Blood Mausoleum', zone: 'Mohgwyn Palace', pos: [-24, -5.0, 145], elev: '-5m', danger: 'Tier V (Legendary)', boss: 'Mohg, Lord of Blood', desc: 'Subterranean blood ocean cavern where the Formless Mother demands sacrificial sanguinary rites.', light: 0.60 },
    { id: 'belurat_tower_settlement', name: 'Belurat Tower Settlement - Stage Front', zone: 'Belurat', pos: [8, 0, 80], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Divine Beast Dancing Lion', desc: 'Sprawling hornsent stone city veiled in mist beneath the towering shadow of the spiral spire.', light: 0.95 },
    { id: 'shadow_keep_plaza', name: 'Shadow Keep - Specimen Storehouse', zone: 'Shadow Keep', pos: [22, 6.0, 130], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Messmer the Impaler', desc: 'A vast black fortress library of stuffed beast specimens and floating tablets burning with blasphemous flame.', light: 0.85 },
    { id: 'abyssal_woods', name: "Abyssal Woods - Midra's Manse", zone: 'Abyssal Woods', pos: [-16, -5.0, 125], elev: '-5m', danger: 'Tier V (Legendary)', boss: 'Midra, Lord of Frenzied Flame', desc: 'Suffocating golden-leaf twilight swamp where winter lanterns hunt travelers and drive them mad with frenzied flame.', light: 0.50 },
    { id: 'enir_ilim_sanctum', name: 'Enir-Ilim - Gate of Divinity', zone: 'Enir-Ilim', pos: [0, 6.0, 175], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Promised Consort Radahn', desc: 'The spiraling heavenly staircase reaching the divine altar of corpses where gods are ascended.', light: 1.45 },
    { id: 'hunters_dream', name: "Hunter's Dream - Workshop Garden", zone: "Hunter's Dream", pos: [0, 0, 8], elev: '0m', danger: 'Sanctuary (Dream Hub)', boss: 'Gehrman, the First Hunter', desc: 'Serene flowering garden sanctuary nestled beneath pillars of celestial fog where hunters awaken.', light: 1.15 },
    { id: 'fishing_hamlet', name: 'Fishing Hamlet - Coastline of the Great One', zone: 'Fishing Hamlet', pos: [-14, 0, 65], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Orphan of Kos', desc: 'A rotting barnacle-encrusted coastal village washed by cold sea rain, sacred to the dead Great One Kos.', light: 0.80 },
    { id: 'research_hall', name: 'Research Hall - Astral Clocktower Steps', zone: 'Clocktower', pos: [14, 6.0, 75], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Lady Maria of Astral Clocktower', desc: 'Vast patient ward of bandaged heads and soaring staircases guarding the dark secrets of the Healing Church.', light: 0.90 },
    { id: 'chalice_ptumeru', name: 'Pthumeru Ihyll - Cursed Defiled Depth', zone: 'Chalice Dungeon', pos: [-22, -5.0, 105], elev: '-5m', danger: 'Tier V (Legendary)', boss: 'Yharnam, Pthumerian Queen', desc: 'Ancient subterranean labyrinth of blood-soaked crypts and labyrinth warriors beneath modern Yharnam.', light: 0.40 },
    { id: 'boletaria_kings_tower', name: "Boletaria - King's High Tower", zone: 'Boletaria', pos: [18, 6.0, 150], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'False King Allant', desc: 'The pinnacle spire of the Boletarian palace where the soul-draining sword of King Allant strikes.', light: 1.20 },
    { id: 'latria_ivory_tower', name: 'Tower of Latria - Heart of the Panopticon', zone: 'Tower of Latria', pos: [-18, -5.0, 135], elev: '-5m', danger: 'Tier V (Legendary)', boss: 'Old Monk & Mindflayers', desc: 'A colossal beating organic heart suspended in chains inside the spiraling blood tower.', light: 0.65 },
    { id: 'storm_altar', name: 'Shrine of Storms - Monolith Altar of the Sky', zone: 'Shrine of Storms', pos: [10, 6.0, 140], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Storm King', desc: 'A wind-whipped seaside cliff battered by rain and lightning where giant flying shadow rays swarm.', light: 0.85 },
    { id: 'lands_between_nexus', name: 'Lands Between - Elden Throne & Fractured Marika', zone: 'Elden Throne', pos: [0, 6.0, 190], elev: '+6m', danger: 'Apex Lord Tier', boss: 'Elden Beast & Radagon', desc: 'The golden cosmic sea inside the Erdtree where the physical incarnation of the Greater Will resides.', light: 1.40 },

    // ----------------------------------------------------
    // 50 NEW SOULSBORNE EXPEDITIONS (SEKIRO, ER SHADOW OF ERDTREE, DS DLCs, DEMON'S SOULS)
    // ----------------------------------------------------
    // SEKIRO: SHADOWS DIE TWICE (10 LOCATIONS: 101–110)
    { id: 'sekiro_ashina_gate', name: 'Ashina Castle - Outskirts Fortress Gate', zone: 'Ashina Outskirts', pos: [0, 0, -28], elev: '0m', danger: 'Tier III (Advanced)', boss: 'Gyoubu Oniwa', desc: 'The massive timber gates guarding Ashina where Gyoubu Masataka Oniwa charges on his demon steed.', light: 1.05 },
    { id: 'sekiro_dojo', name: 'Ashina Castle - Upper Tower Dojo', zone: 'Ashina Castle', pos: [20, 6.0, 48], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Ashina Elite - Jinsuke Saze', desc: 'Tatami dojo high atop Ashina Castle where masters of the Ashina Cross draw their blades in milliseconds.', light: 1.15 },
    { id: 'sekiro_senpou_main', name: 'Senpou Temple - Main Hall of Mt. Kongo', zone: 'Senpou Temple', pos: [14, 6.0, 85], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Folding Screen Monkeys', desc: 'The golden temple halls surrounded by crimson maple trees where monks sought the false dragons heritage.', light: 1.25 },
    { id: 'sekiro_sunken_valley', name: 'Sunken Valley - Bodhisattva Gun Fort', zone: 'Sunken Valley', pos: [-18, -5.0, 75], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Guardian Ape & Snake Eyes', desc: 'A mist-drenched ravine flanked by giant stone Buddha statues and sniper riflemen in the crags.', light: 0.70 },
    { id: 'sekiro_fountainhead', name: 'Fountainhead Palace - Vermilion Sanctuary', zone: 'Fountainhead Palace', pos: [0, 6.0, 160], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'True Corrupted Monk & Divine Dragon', desc: 'Celestial flooded pavilions of sacred waters where nobles play okami flutes beneath cherry blossoms.', light: 1.40 },
    { id: 'sekiro_hirata_estate', name: 'Hirata Estate - Burning Audience Chamber', zone: 'Hirata Estate', pos: [-6, 0, -18], elev: '0m', danger: 'Tier III (Advanced)', boss: 'Lady Butterfly & Juzou the Drunkard', desc: 'The raging inferno of the Hirata clan courtyard where illusions and poisoned sake run thick.', light: 1.10 },
    { id: 'sekiro_reservoir', name: 'Ashina Reservoir - Moon-Viewing Watchtower', zone: 'Ashina Reservoir', pos: [22, 6.0, 28], elev: '+6m', danger: 'Tier II (Moderate)', boss: 'Seven Ashina Spears', desc: 'The tall watchtower where the young Divine Heir Kuro was held captive by Genichiro Ashina.', light: 1.00 },
    { id: 'sekiro_mibu_village', name: 'Mibu Village - Mist-Shrouded Watermill', zone: 'Mibu Village', pos: [-16, -5.0, 110], elev: '-5m', danger: 'Tier IV (Severe)', boss: "O'Rin of the Water", desc: 'An isolated village cursed by eternal sake-drinking madness, guarded by a weeping shamisen ghost.', light: 0.55 },
    { id: 'sekiro_abandoned_dungeon', name: 'Abandoned Dungeon - Bottomless Hole', zone: 'Abandoned Dungeon', pos: [-20, -5.0, 50], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Shichimen Warrior', desc: 'A pit of unhallowed experiments illuminated by eerie purple spirit lanterns and wailing apparitions.', light: 0.45 },
    { id: 'sekiro_silvergrass_field', name: 'Ashina Outskirts - Silvergrass Duel Battlefield', zone: 'Ashina Outskirts', pos: [0, 0, 115], elev: '0m', danger: 'Apex Lord Tier', boss: 'Isshin, the Sword Saint', desc: 'The moonlit meadow of whispering pampas grass where the final clash of the Sengoku era unfolds.', light: 1.20 },

    // ELDEN RING: SHADOW OF THE ERDTREE DLC (12 LOCATIONS: 111–122)
    { id: 'sote_gravesite_plain', name: 'Gravesite Plain - Scorched Ruins & Ghostflame', zone: 'Gravesite Plain', pos: [4, 0, 22], elev: '0m', danger: 'Tier III (Advanced)', boss: 'Furnace Golem', desc: 'A misty spectral cemetery plateau punctuated by towering wicker golems vomiting incandescent flame.', light: 1.00 },
    { id: 'sote_castle_ensis', name: 'Castle Ensis - Moon-Gazing Grounds', zone: 'Castle Ensis', pos: [16, 6.0, 55], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Rellana, Twin Moon Knight', desc: 'Gothic fortified causeway where the Caria princess commands both sorcerous moons and flame blades.', light: 1.10 },
    { id: 'sote_shadow_keep_storehouse', name: 'Shadow Keep - Specimen Storehouse Upper Floor', zone: 'Shadow Keep', pos: [22, 6.0, 110], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Fire Knight Queelign', desc: 'Colossal vertical library filled with preserved beast carcasses and divine tablets suspended in air.', light: 0.85 },
    { id: 'sote_dark_chamber', name: 'Shadow Keep - Dark Chamber of the Impaler', zone: 'Shadow Keep', pos: [0, 6.0, 145], elev: '+6m', danger: 'Apex Lord Tier', boss: 'Messmer the Impaler', desc: 'The red throne hall where the cursed son of Marika summons base serpent flame against the Hornsent.', light: 0.95 },
    { id: 'sote_jagged_peak_foot', name: "Jagged Peak - Dragon's Pit & Foot of the Crag", zone: 'Jagged Peak', pos: [-12, 0, 35], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Ancient Dragon Senessax', desc: 'A sulfurous volcanic ascent strewn with petrified dragon remains and crackling crimson lightning.', light: 0.90 },
    { id: 'sote_jagged_peak_summit', name: 'Jagged Peak - Storm-Rapt Summit of Bayle', zone: 'Jagged Peak', pos: [0, 6.0, 185], elev: '+6m', danger: 'Apex Lord Tier', boss: 'Bayle the Dread', desc: 'The roaring apex of magma where the dread four-winged drake battles eternal thunder in defiance of dragons.', light: 1.35 },
    { id: 'sote_ruins_rauh', name: 'Ancient Ruins of Rauh - Rot-Weaved Overlook', zone: 'Ancient Ruins of Rauh', pos: [-22, 6.0, 95], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Romina, Saint of the Bud', desc: 'Vast pre-Erdtree overgrown stone aqueducts infested with divine rot, scorpions and dancing centipedes.', light: 1.05 },
    { id: 'sote_cerulean_coast', name: 'Cerulean Coast - Ghostflame Shoreline', zone: 'Cerulean Coast', pos: [-14, 0, 85], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Ghostflame Dragon', desc: 'A serene beach carpeted in vibrant blue luminescent flowers bordering the edge of the Shadow Realm.', light: 1.15 },
    { id: 'sote_stone_coffin_fissure', name: 'Stone Coffin Fissure - Garden of Deep Purple', zone: 'Stone Coffin Fissure', pos: [-20, -5.0, 140], elev: '-5m', danger: 'Tier V (Legendary)', boss: 'Putrescent Knight & St. Trina', desc: 'A bottomless abyss of stacked stone sarcophagi leading to the glowing nectar garden of eternal sleep.', light: 0.60 },
    { id: 'sote_scadutree_chalice', name: 'Scadutree Base - Tree-Worship Sanctum', zone: 'Scadutree Base', pos: [12, -5.0, 120], elev: '-5m', danger: 'Tier V (Legendary)', boss: 'Scadutree Avatar', desc: 'The subterranean root sanctuary where the black Scadutree weeps golden sap into giant stone chalices.', light: 0.85 },
    { id: 'sote_shaman_village', name: 'Hinterland - Shaman Village of Golden Boughs', zone: 'Hinterland', pos: [8, 0, 60], elev: '0m', danger: 'Sanctuary (Secret)', boss: "None (Marika's Origin)", desc: 'A tragic blooming meadow of golden flowers where Queen Marika was born before the Hornsent jars.', light: 1.30 },
    { id: 'sote_finger_ruins', name: 'Finger Ruins of Dheo - Primordial Crater', zone: 'Finger Ruins', pos: [18, 0, 105], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Metyr, Mother of Fingers', desc: 'A cosmic impact crater studded with curled stone fingers and microscopic stellar beings from the void.', light: 0.80 },

    // ELDEN RING BASE GAME (8 LOCATIONS: 123–130)
    { id: 'er_deeproot_depths', name: "Deeproot Depths - Prince of Death's Throne", zone: 'Deeproot Depths', pos: [-18, -5.0, 130], elev: '-5m', danger: 'Tier V (Legendary)', boss: "Fia's Champions & Lichdragon Fortissax", desc: 'The subterranean roots of the Greattree cradling Godwyn the Goldens monstrous mutated visage.', light: 0.70 },
    { id: 'er_lake_of_rot', name: 'Lake of Rot - Grand Cloister Scarlet Basin', zone: 'Lake of Rot', pos: [-22, -5.0, 95], elev: '-5m', danger: 'Tier V (Legendary)', boss: 'Astel, Naturalborn of the Void', desc: 'An underground basin of boiling crimson rot sacred to an Outer God sealed beneath the earth.', light: 0.75 },
    { id: 'er_ainsel_river', name: 'Ainsel River - Uhl Palace Ruins Waterfall', zone: 'Ainsel River', pos: [-15, -5.0, 60], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Dragonkin Soldier of Nokstella', desc: 'Ancient stone palace ruins carved into cavern walls, haunted by giant ants and celestial malformed stars.', light: 0.65 },
    { id: 'er_subterranean_shunning', name: 'Leyndell Sewers - Subterranean Shunning-Grounds', zone: 'Leyndell Sewers', pos: [-16, -5.0, 80], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Mohg, the Omen', desc: 'Labyrinthine brick piping where cursed Hornsent and Omen children were cast away in chains.', light: 0.50 },
    { id: 'er_altus_plateau', name: 'Altus Plateau - Leyndell Capital Highway', zone: 'Altus Plateau', pos: [6, 0, 45], elev: '0m', danger: 'Tier III (Advanced)', boss: 'Tree Sentinel Duo', desc: 'The golden grass highlands surrounding the Royal Capital beneath the warm glow of the Erdtree.', light: 1.30 },
    { id: 'er_volcano_manor', name: 'Mt. Gelmir - Volcano Manor Audience Chamber', zone: 'Volcano Manor', pos: [-8, 0, 70], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Rykard, Lord of Blasphemy', desc: 'The opulent serpent court of Tanith overlooking a cauldron of magma where blasphemy is championed.', light: 1.05 },
    { id: 'er_consecrated_snowfield', name: 'Consecrated Snowfield - Hidden Path to the Haligtree', zone: 'Snowfield', pos: [12, 0, 90], elev: '0m', danger: 'Tier IV (Severe)', boss: "Night's Cavalry Duo", desc: 'A blinding blizzard-shrouded frozen wasteland concealing the liturgical town of Ordina.', light: 0.90 },
    { id: 'er_roundtable_hold', name: 'Roundtable Hold - The Tarnished Table of Lost Grace', zone: 'Roundtable Hold', pos: [0, 0, 0], elev: '0m', danger: 'Sanctuary (Sanctum)', boss: 'Master Hewg & Gideon Ofnir', desc: 'The extra-dimensional fortress sanctuary where Tarnished champions sharpen weapons at the round table.', light: 1.20 },

    // DARK SOULS III & DLCs (8 LOCATIONS: 131–138)
    { id: 'ds3_kiln_first_flame', name: 'Kiln of the First Flame - Eclipse of the Cinder', zone: 'Kiln of the First Flame', pos: [0, 6.0, 165], elev: '+6m', danger: 'Apex Lord Tier', boss: 'Soul of Cinder', desc: 'The distorted converging horizon of ruined kingdoms under a bleeding eclipse of fading fire.', light: 1.25 },
    { id: 'ds3_archdragon_peak', name: 'Archdragon Peak - Dragon-Kin Mausoleum Altar', zone: 'Archdragon Peak', pos: [18, 6.0, 115], elev: '+6m', danger: 'Apex Lord Tier', boss: 'Nameless King & King of the Storm', desc: 'A storm-battered mountain peak towering above clouds where dragon worshippers ring the great bell.', light: 1.35 },
    { id: 'ds3_farron_keep', name: 'Farron Keep - Perimeter Wolf Blood Bonfire', zone: 'Farron Keep', pos: [-14, 0, 20], elev: '0m', danger: 'Tier III (Advanced)', boss: 'Abyss Watchers', desc: 'A rotting toxic bog where the Undead Legion swore an oath of wolf blood to extinguish the Abyss.', light: 0.70 },
    { id: 'ds3_irithyll_valley', name: 'Irithyll of the Boreal Valley - Central Moonlit Bridge', zone: 'Boreal Valley', pos: [0, 0, 65], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Pontiff Sulyvahn', desc: 'A breathtaking moonlit snow city of gothic spires and frost-covered bridges guarded by Pontiff beasts.', light: 1.00 },
    { id: 'ds3_anor_londo_water_reserve', name: 'Anor Londo - Water Reserve & Aldrich Cathedral', zone: 'Anor Londo (DS3)', pos: [8, 0, 105], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Aldrich, Devourer of Gods', desc: 'The frozen desecrated cathedral of Gwynevere where the Saint of the Deep devours the Dark Sun Gwyndolin.', light: 0.85 },
    { id: 'ds3_filianore_rest', name: "The Ringed City - Filianore's Rest Ashen Desert", zone: 'The Ringed City', pos: [0, 0, 140], elev: '0m', danger: 'Apex Lord Tier', boss: 'Slave Knight Gael', desc: 'An endless sea of grey ash at the end of time where Gael feasted on the Dark Soul of mankind.', light: 1.10 },
    { id: 'ds3_dreg_heap', name: 'The Dreg Heap - Earthen Peak Toxic Basin', zone: 'The Dreg Heap', pos: [-18, -5.0, 45], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Demon Prince', desc: 'The tangled rubbish heap of ruined ages collapsed upon one another at the edge of the world.', light: 0.75 },
    { id: 'ds3_ariandel_chapel', name: 'Painted World of Ariandel - Ariandel Chapel', zone: 'Painted World', pos: [10, 0, 50], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Sister Friede & Father Ariandel', desc: 'A decaying canvas world of rotting snow and black flame where Sister Friede tends the dying rot.', light: 0.95 },

    // DARK SOULS II & DLCs (7 LOCATIONS: 139–145)
    { id: 'ds2_brume_tower', name: 'Brume Tower - Throne Floor of Ashen Scaffolds', zone: 'Brume Tower', pos: [20, 6.0, 100], elev: '+6m', danger: 'Apex Lord Tier', boss: 'Fume Knight Raime', desc: 'A colossal black iron foundry choked with volcanic ash where the disgraced knight Raime wields dark fire.', light: 0.90 },
    { id: 'ds2_shulva_sunken', name: "Shulva, Sanctum City - Dragon's Sanctum Core", zone: 'Shulva', pos: [-22, -5.0, 115], elev: '-5m', danger: 'Tier V (Legendary)', boss: 'Sinh, the Slumbering Dragon', desc: 'A stepped subterranean ziggurat city hollowed into deep caverns, poisoned by the waking dragons breath.', light: 0.65 },
    { id: 'ds2_memory_jeigh', name: 'Forest of Fallen Giants - Memory of Jeigh Ramparts', zone: 'Memory of Jeigh', pos: [16, 6.0, 60], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Giant Lord', desc: 'The crumbling fortress battlements caught in a past war where giants hurled colossal rolling boulders.', light: 1.10 },
    { id: 'ds2_throne_of_want', name: 'Drangleic Castle - Kiln-Passage Throne of Want', zone: 'Drangleic Castle', pos: [0, 0, 125], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Throne Watcher & Defender / Nashandra', desc: 'The subterranean kiln below Drangleic Castle where the true monarch takes the throne to link the fire.', light: 0.95 },
    { id: 'ds2_aldia_keep', name: "Aldia's Keep - Dragon Shrine Ritual Staircase", zone: "Aldia's Keep", pos: [14, 6.0, 80], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Ancient Dragon', desc: 'A laboratory manor of dragon skeletons and petrified curiosities leading to the high aerial dragon shrine.', light: 1.15 },
    { id: 'ds2_black_gulch', name: 'Black Gulch - Poison Spitfire Caverns', zone: 'Black Gulch', pos: [-16, -5.0, 70], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'The Rotten', desc: 'Pitch black cavern filled with thousands of spitting green poison statues and oil puddles hiding tar beasts.', light: 0.40 },
    { id: 'ds2_eleum_loyce', name: 'Frozen Eleum Loyce - The Old Chaos Pit of Fire', zone: 'Eleum Loyce', pos: [0, -5.0, 135], elev: '-5m', danger: 'Apex Lord Tier', boss: 'Burnt Ivory King', desc: 'A sunken arena of raw bed of chaos flame where the Ivory King leapt into fire to protect his kingdom.', light: 1.05 },

    // DARK SOULS I & DEMON'S SOULS (5 LOCATIONS: 146–150)
    { id: 'ds1_great_hollow', name: 'The Great Hollow - Primordial Archtree Canopy', zone: 'The Great Hollow', pos: [-12, -5.0, 30], elev: '-5m', danger: 'Tier III (Advanced)', boss: 'Basilisks & Mushroom Men', desc: 'A colossal hollowed world tree trunk descending into the underworld, tangled in roots and basilisk gas.', light: 0.60 },
    { id: 'ds1_ash_lake', name: "Ash Lake - Stone Dragon's Everlasting Shore", zone: 'Ash Lake', pos: [0, 0, 75], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Everlasting Dragon & Hydra', desc: 'A tranquil surreal ocean of white sand and everlasting stone archtrees stretching to infinity.', light: 1.30 },
    { id: 'ds1_valley_drakes', name: 'Valley of Drakes - New Londo Sluice Gate Chasm', zone: 'Valley of Drakes', pos: [-10, 0, 5], elev: '0m', danger: 'Tier III (Advanced)', boss: 'Undead Dragon', desc: 'A narrow windy mountain gorge inhabited by blue lightning wyverns guarding the floodgates of New Londo.', light: 0.95 },
    { id: 'des_flamelurker_pit', name: 'Stonefang Tunnel - Armor Spider & Flamelurker Pit', zone: 'Stonefang Tunnel', pos: [-18, -5.0, 85], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Flamelurker', desc: 'Red-hot underground volcanic forge where the ancient beast of flame roars among bones of miners.', light: 0.85 },
    { id: 'des_nexus_mausoleum', name: 'The Nexus - Monumental Upper Archway of Archstones', zone: 'The Nexus', pos: [0, 6.0, 20], elev: '+6m', danger: 'Sanctuary (Prime Hub)', boss: 'Monumental & Maiden in Black', desc: 'The soaring temple holding the fabric of northern Boletaria together against the deep colorless fog.', light: 1.35 },

    // ----------------------------------------------------
    // EXPANSION: 40 NEW SOULSBORNE EXPEDITIONS (151–190)
    // Bloodborne (10), Sekiro (6), Elden Ring & SOTE (12), Dark Souls III (6), Dark Souls II & Demon's Souls (6)
    // ----------------------------------------------------
    // BLOODBORNE (10 LOCATIONS: 151–160)
    { id: 'bb_cainhurst_rooftops', name: 'Forsaken Castle Cainhurst - Frozen Spire Rooftops', zone: 'Castle Cainhurst', pos: [22, 6.0, 72], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Martyr Logarius', desc: 'Snow-capped turrets and frozen gargoyle perches overlooking the desolate sea of Cainhurst.', light: 0.95 },
    { id: 'bb_cathedral_grand_altar', name: 'Cathedral Ward - Grand Altar of the Healing Church', zone: 'Cathedral Ward', pos: [0, 0, 88], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Vicar Amelia', desc: 'The monumental cathedral hall illuminated by cold moonlight through towering stained-glass arches.', light: 1.10 },
    { id: 'bb_forbidden_woods_graveyard', name: 'Forbidden Woods - Serpentine Graveyard', zone: 'Forbidden Woods', pos: [-24, -5.0, 64], elev: '-5m', danger: 'Tier III (Advanced)', boss: 'Shadow of Yharnam', desc: 'Tangled briars, whispering vipers, and sunken graves where three cloaked wraiths guard the tomb of Byrgenwerth.', light: 0.55 },
    { id: 'bb_yahargul_unseen_chapel', name: "Yahar'gul, Unseen Village - Chapel of the Advent", zone: "Yahar'gul", pos: [-12, 0, 132], elev: '0m', danger: 'Tier IV (Severe)', boss: 'The One Reborn', desc: 'Street paved with petrified corpses under the blood-red moon where colossal Great Ones cling to church walls.', light: 0.80 },
    { id: 'bb_hemwick_charnel_lane', name: "Hemwick Charnel Lane - Witch's Abode", zone: 'Hemwick Charnel Lane', pos: [16, 0, -22], elev: '0m', danger: 'Tier II (Moderate)', boss: 'Witch of Hemwick', desc: 'Ramshackle wooden shanties, bone pyres, and gallows where bloodshot eyes are harvested in silence.', light: 0.70 },
    { id: 'bb_nightmare_frontier_swamp', name: 'Nightmare Frontier - Poison Amygdalan Basin', zone: 'Nightmare Frontier', pos: [-22, -5.0, 118], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Amygdala', desc: 'Desolate alien cliffs, poisonous green mires, and singing Winter Lanterns wandering petrified tombs.', light: 0.65 },
    { id: 'bb_mergos_loft_middle', name: "Nightmare of Mensis - Mergo's Loft: Middle Balcony", zone: 'Nightmare of Mensis', pos: [18, 6.0, 138], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Micolash, Host of the Nightmare', desc: 'High stone balustrades perched above the fog of Mensis where shadows of shadows whisper forgotten rituals.', light: 0.85 },
    { id: 'bb_mergos_loft_apex', name: 'Nightmare of Mensis - Lunarium Nursery Apex', zone: 'Nightmare of Mensis', pos: [0, 6.0, 168], elev: '+6m', danger: 'Tier V (Legendary)', boss: "Mergo's Wet Nurse", desc: 'The highest open-air platform of the nightmare tower draped in purple silk curtains and moonlit silence.', light: 1.00 },
    { id: 'bb_upper_cathedral_orphanage', name: 'Upper Cathedral Ward - The Orphanage of Choir', zone: 'Upper Cathedral Ward', pos: [-18, 6.0, 62], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Celestial Emissary & Ebrietas', desc: 'Silent darkened halls of the Choir where cosmic larvae writhe beneath cracked stained-glass lunettes.', light: 0.60 },
    { id: 'bb_old_hunter_nightmare_river', name: "Hunter's Nightmare - Sanguine River of Blood", zone: "Hunter's Nightmare", pos: [-26, -5.0, 92], elev: '-5m', danger: 'Tier V (Legendary)', boss: 'Ludwig the Holy Blade', desc: 'A horrific river of crimson gore choked with butchered limbs beneath the spiraling spires of astral clocktowers.', light: 0.75 },

    // SEKIRO: SHADOWS DIE TWICE (6 LOCATIONS: 161–166)
    { id: 'sekiro_ashina_castle_roof', name: 'Ashina Castle - Upper Tower Rooftop Arena', zone: 'Ashina Castle', pos: [12, 6.0, 52], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Great Shinobi Owl / Isshin', desc: 'Wind-whipped tiled roofs of Ashina Castle where master and student cross katanas beneath dusk clouds.', light: 1.10 },
    { id: 'sekiro_poison_pool', name: 'Ashina Depths - Toxic Cavern & Hidden Forest', zone: 'Ashina Depths', pos: [-20, -5.0, 82], elev: '-5m', danger: 'Tier III (Advanced)', boss: 'Snake Eyes Shirahagi', desc: 'Sunken subterranean lake of green corrosive venom guarded by deadly gunners and ancient statues.', light: 0.60 },
    { id: 'sekiro_temple_grounds', name: 'Mount Kongo - Senpou Temple Bamboo Precipice', zone: 'Senpou Temple', pos: [24, 6.0, 96], elev: '+6m', danger: 'Tier III (Advanced)', boss: 'Armored Warrior & Folding Screen Monkeys', desc: 'Golden maple groves, sacred mountain shrines, and towering cliffs shrouded in morning mist.', light: 1.25 },
    { id: 'sekiro_flame_battlefield', name: 'Ashina Outskirts - Battlefield of Burning Hatred', zone: 'Ashina Outskirts', pos: [0, 0, -32], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Demon of Hatred & Gyoubu Oniwa', desc: 'Vast scorched earthen plain littered with broken wooden barricades and smoldering siege weapons.', light: 0.90 },
    { id: 'sekiro_sanctuary_peak', name: 'Fountainhead Palace - Sanctuary Divine Realm', zone: 'Fountainhead Palace', pos: [0, 6.0, 172], elev: '+6m', danger: 'Apex Lord Tier', boss: 'Divine Dragon', desc: 'Ethereal turquoise waterways, cascading sakura blossoms, and celestial lightning striking divine stone spires.', light: 1.30 },
    { id: 'sekiro_hirata_hidden_temple', name: 'Hirata Estate - Burning Main Hall Sanctuary', zone: 'Hirata Estate', pos: [-8, 0, -26], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Lady Butterfly', desc: 'A burning courtyard of collapsing timbers and fluttering butterfly kunai illusions.', light: 1.15 },

    // ELDEN RING & SHADOW OF THE ERDTREE (12 LOCATIONS: 167–178)
    { id: 'er_stormveil_rampart', name: 'Stormveil Castle - Stormhill Rampart Tower', zone: 'Stormveil Castle', pos: [22, 6.0, 36], elev: '+6m', danger: 'Tier II (Moderate)', boss: 'Godrick the Grafted & Warhawk Knights', desc: 'Gale-swept stone ramparts guarded by bladed warhawks overlooking the misty crags of Limgrave.', light: 1.00 },
    { id: 'er_raya_lucaria_debate', name: 'Academy of Raya Lucaria - Debate Parlor', zone: 'Academy of Raya Lucaria', pos: [-14, 0, 76], elev: '0m', danger: 'Tier III (Advanced)', boss: 'Red Wolf of Radagon', desc: 'Gothic study lined with thousands of illuminated sorcery tomes and glowing glintstone braziers.', light: 1.10 },
    { id: 'er_raya_lucaria_grand_library', name: 'Academy of Raya Lucaria - Grand Library of Fate', zone: 'Academy of Raya Lucaria', pos: [0, 0, 94], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Rennala, Queen of the Full Moon', desc: 'Vast circular library chamber beneath the shimmering phantom moon where scholars sing cradle songs.', light: 1.20 },
    { id: 'er_redmane_castle_plaza', name: 'Redmane Castle - Chamber Outside the Plaza', zone: 'Caelid', pos: [14, 0, 122], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Starscourge Radahn Festival', desc: 'Fortified desert citadel courtyard flying crimson lion banners in anticipation of the greatest festival.', light: 1.05 },
    { id: 'er_ruin_strewn_precipice', name: 'Ruin-Strewn Precipice - Magma Wyrm Basin', zone: 'Liurnia of the Lakes', pos: [26, 6.0, 114], elev: '+6m', danger: 'Tier III (Advanced)', boss: 'Magma Wyrm Makar', desc: 'Dizzying wooden mine elevators clinging to sheer cliffs leading up to the golden plateaus of Altus.', light: 0.85 },
    { id: 'er_shaded_castle_inner', name: 'The Shaded Castle - Poison Briar Ramparts', zone: 'Altus Plateau', pos: [-16, 0, 102], elev: '0m', danger: 'Tier III (Advanced)', boss: 'Elemer of the Briar', desc: 'Sunken mossy castle drowned in stagnant venomous swamp, draped in briars of barbed executioners.', light: 0.70 },
    { id: 'er_haligtree_canopy', name: "Miquella's Haligtree - Sacred Canopy Branches", zone: "Haligtree", pos: [20, 6.0, 144], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Loretta, Knight of the Haligtree', desc: 'Gargantuan golden boughs stretching into the northern clouds, guarded by Oracle Envoys and cleanrot knights.', light: 1.20 },
    { id: 'er_farum_azula_dragon_temple', name: 'Crumbling Farum Azula - Dragon Temple Altar', zone: 'Crumbling Farum Azula', pos: [16, 6.0, 162], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Godskin Duo', desc: 'Ancient dragon mausoleum shattered across the sky, frozen mid-fall in a vortex of swirling hurricanes.', light: 1.15 },
    { id: 'er_farum_azula_tempest', name: "Crumbling Farum Azula - Placidusax's Timeless Eye", zone: 'Crumbling Farum Azula', pos: [-24, -5.0, 142], elev: '-5m', danger: 'Apex Lord Tier', boss: 'Dragonlord Placidusax', desc: 'The eye of the eternal hurricane where time rewinds and gold lightning crackles across fallen monoliths.', light: 1.00 },
    { id: 'sote_bonny_village', name: 'Scadualtars - Bonny Village & Whipping Huts', zone: 'Shadow Realm', pos: [18, 0, 42], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Hornsent Inquisitors', desc: 'An overgrown mountain hamlet where wicker butcher cleavers and sacred apothecary jars rest beside the ravine.', light: 0.85 },
    { id: 'sote_moorth_ruins', name: 'Scadu Altars - Moorth Ruins & Submerged Sinkhole', zone: 'Shadow Realm', pos: [-22, -5.0, 104], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Blackgaol Knight & Dryleaf Dane', desc: 'Cracked church towers sunken into a yawning abyss connecting the Highroad to the Bonny chasms.', light: 0.75 },
    { id: 'sote_manor_midra', name: "Abyssal Woods - Midra's Manse Frenzied Chamber", zone: 'Abyssal Woods', pos: [0, 0, 128], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Midra, Lord of Frenzied Flame', desc: 'A ruined chandelier hall consumed by unbearable golden-yellow madness and golden needle spears.', light: 1.25 },

    // DARK SOULS III (6 LOCATIONS: 179–184)
    { id: 'ds3_high_wall_lothric', name: 'High Wall of Lothric - Tower on the Wall', zone: 'High Wall of Lothric', pos: [24, 6.0, 44], elev: '+6m', danger: 'Tier II (Moderate)', boss: 'Vordt of the Boreal Valley', desc: 'The soaring outer fortifications of Lothric where dead pilgrim dragons crumble into ash.', light: 1.10 },
    { id: 'ds3_undead_settlement_curse', name: 'Undead Settlement - Dilapidated Bridge', zone: 'Undead Settlement', pos: [12, 0, -14], elev: '0m', danger: 'Tier II (Moderate)', boss: 'Curse-Rotted Greatwood', desc: 'Sprawling ramshackle shanties, hanging birdcages, and white birch trees where giant arrows rain from above.', light: 0.90 },
    { id: 'ds3_road_of_sacrifices_crucifix', name: 'Road of Sacrifices - Halfway Fortress', zone: 'Road of Sacrifices', pos: [-14, 0, 58], elev: '0m', danger: 'Tier II (Moderate)', boss: 'Crystal Sage', desc: 'Misty stone gateway overlooking the overgrown swamp where Lycanthropes howl on wooden crosses.', light: 0.80 },
    { id: 'ds3_cathedral_deep_cleansing', name: 'Cathedral of the Deep - Cleansing Chapel', zone: 'Cathedral of the Deep', pos: [-16, 0, 112], elev: '0m', danger: 'Tier III (Advanced)', boss: 'Deacons of the Deep', desc: 'Monolithic sunken church bathed in blue moonlight where watery graves and sludge giants slumber.', light: 0.85 },
    { id: 'ds3_catacombs_carthus', name: 'Catacombs of Carthus - Catacomb Suspension Bridge', zone: 'Catacombs of Carthus', pos: [-28, -5.0, 78], elev: '-5m', danger: 'Tier III (Advanced)', boss: 'High Lord Wolnir', desc: 'A fragile wooden rope bridge spanning an infinite dark abyss filled with rolling skeleton boulders.', light: 0.60 },
    { id: 'ds3_irithyll_dungeon_profaned', name: 'Irithyll Dungeon - Profaned Capital Threshold', zone: 'Irithyll Dungeon', pos: [-26, -5.0, 128], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Yhorm the Giant', desc: 'Dark iron cells smelling of burning brands, opening onto the sunken golden vaults of the Profaned Capital.', light: 0.70 },

    // DARK SOULS II & DEMON'S SOULS (6 LOCATIONS: 185–190)
    { id: 'ds2_heide_cathedral_blue', name: "Heide's Tower of Flame - Cathedral of Blue", zone: "Heide's Tower of Flame", pos: [26, 6.0, 82], elev: '+6m', danger: 'Tier III (Advanced)', boss: 'Old Dragonslayer Ornstein', desc: 'Sunken sea-castle bathed in eternal turquoise sunlight where stone sentinels stand unmoving.', light: 1.30 },
    { id: 'ds2_no_mans_wharf_ship', name: "No-man's Wharf - Ghost Ship Moorings", zone: "No-man's Wharf", pos: [-18, 0, 46], elev: '0m', danger: 'Tier II (Moderate)', boss: 'Flexile Sentry', desc: 'A subterranean cavern harbor lit by torches where a spectral galleon prepares to set sail.', light: 0.75 },
    { id: 'ds2_lost_bastille_straid', name: "The Lost Bastille - Straid's Cell Ramparts", zone: 'The Lost Bastille', pos: [22, 6.0, 126], elev: '+6m', danger: 'Tier III (Advanced)', boss: 'Ruin Sentinels & Lost Sinner', desc: 'A moonlit prison fortress surrounded by crashing dark ocean swells and salt-encrusted battlements.', light: 0.95 },
    { id: 'ds2_iron_keep_smelter', name: 'Iron Keep - Smelter Demon Furnace Bridge', zone: 'Iron Keep', pos: [0, 0, 66], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Smelter Demon & Old Iron King', desc: 'A black iron castle sinking slowly into an endless lake of molten lava, guarded by Alonne captains.', light: 1.20 },
    { id: 'des_tower_latria_fool', name: 'Tower of Latria - Prison of Hope Altar', zone: 'Tower of Latria', pos: [-20, 6.0, 108], elev: '+6m', danger: 'Tier III (Advanced)', boss: "Fool's Idol", desc: 'Towering gothic cathedral nave lined with stone gargoyles where silver chimes cast paralyzing enchantments.', light: 0.85 },
    { id: 'des_shrine_storms_adjudicator', name: "Shrine of Storms - Island's Edge Cliffs", zone: 'Shrine of Storms', pos: [16, 0, -28], elev: '0m', danger: 'Tier III (Advanced)', boss: 'Adjudicator & Storm King', desc: 'Rain-drenched island cliffs battered by stormy ocean winds where giant mantas glide through dark clouds.', light: 0.90 },

    // ----------------------------------------------------
    // EXPANSION: 60 NEW SOULSBORNE EXPEDITIONS (191–250)
    // SOTE (20), Elden Ring (12), Bloodborne (10), Sekiro (6), Dark Souls III (6), Dark Souls II & Demon's Souls (6)
    // ----------------------------------------------------
    // SHADOW OF THE ERDTREE (20 LOCATIONS: 191–210)
    { id: 'sote_three_path_cross', name: 'Gravesite Plain - Three-Path Cross Sanctuary', zone: 'Gravesite Plain', pos: [10, 0, 16], elev: '0m', danger: 'Tier II (Moderate)', boss: 'Furnace Golem & Blackgaol Knight', desc: 'Desolate plain covered in spectral gravestones where Miquella discarded his sacred flesh.', light: 0.90 },
    { id: 'sote_belurat_steps', name: 'Belurat, Tower Settlement - Main Gate Colonnade', zone: 'Belurat', pos: [-14, 0, 32], elev: '0m', danger: 'Tier III (Advanced)', boss: 'Curseblade Labir & Dancing Lion', desc: 'Ancient hornsent stone highroad flanked by weeping statues leading up into the sacred spiral tower.', light: 0.85 },
    { id: 'sote_belurat_small_altar', name: 'Belurat Tower - Small Private Altar', zone: 'Belurat', pos: [-18, 6.0, 48], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Divine Beast Dancing Lion', desc: 'High private terrace overlooking the smog-shrouded roofs of the shadow settlement.', light: 0.95 },
    { id: 'sote_castle_ensis_checkpoint', name: 'Castle Ensis - Moonrise Checkpoint', zone: 'Castle Ensis', pos: [16, 6.0, 58], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Moonrithyll, Carian Knight', desc: 'Fortified stone bridge gate decorated with blue Carian star banners and glintstone ward wards.', light: 1.10 },
    { id: 'sote_castle_ensis_lord', name: "Castle Ensis - Castle Lord's Chamber", zone: 'Castle Ensis', pos: [22, 6.0, 78], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Rellana, Twin Moon Knight', desc: 'Grand moonlit audience hall where the Sword of Light and Flame was crossed in tragic devotion.', light: 1.15 },
    { id: 'sote_scadu_highroad', name: 'Scadu Altars - Highroad Cross Sanctum', zone: 'Scadu Altars', pos: [0, 0, 48], elev: '0m', danger: 'Tier III (Advanced)', boss: 'Dryleaf Dane & Leda', desc: 'Broad stone military road overlooking the jagged peaks, marked by Miquella\'s glowing golden cross.', light: 1.00 },
    { id: 'sote_shadow_keep_gate', name: 'Shadow Keep - Main Gate Plaza', zone: 'Shadow Keep', pos: [0, 0, 84], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Golden Hippopotamus', desc: 'Massive portcullis entry beneath the black towers of Messmer\'s crusader fortress.', light: 0.85 },
    { id: 'sote_storehouse_first', name: 'Shadow Keep - Specimen Storehouse: 1st Floor', zone: 'Shadow Keep', pos: [-16, 0, 96], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Fire Knights & Hornsent', desc: 'Immense multi-story library housing thousands of pickled specimens and giant ancient skeletons.', light: 0.90 },
    { id: 'sote_storehouse_seventh', name: 'Shadow Keep - Specimen Storehouse: 7th Floor', zone: 'Shadow Keep', pos: [-18, 6.0, 116], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Sir Ansbach & Freyja', desc: 'High wooden rafters hanging above the library abyss where scholars researched forbidden blood rites.', light: 0.85 },
    { id: 'sote_dark_chamber_messmer', name: 'Shadow Keep - Dark Chamber of the Impaler', zone: 'Shadow Keep', pos: [0, 6.0, 134], elev: '+6m', danger: 'Apex Lord Tier', boss: 'Messmer the Impaler', desc: 'Scorched throne hall where Messmer kindles his abyssal flame alongside coiled red serpents.', light: 1.30 },
    { id: 'sote_ancient_ruins_rauh', name: 'Ancient Ruins of Rauh - Western Precipice', zone: 'Rauh Ruins', pos: [-24, 6.0, 88], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Devonia, Crucible Knight', desc: 'Colossal red stone viaducts overgrown with lush moss and swarming with furnace golems.', light: 1.05 },
    { id: 'sote_church_of_bud', name: 'Church of the Bud - Rotting Cloister', zone: 'Church of the Bud', pos: [-26, 6.0, 138], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Romina, Saint of the Bud', desc: 'Ancient stone temple choked with blooming scarlet rot butterflies and centipede horrors.', light: 0.95 },
    { id: 'sote_enir_ilim_first', name: 'Enir-Ilim - First Rise Spiral Sanctum', zone: 'Enir-Ilim', pos: [14, 6.0, 132], elev: '+6m', danger: 'Apex Lord Tier', boss: 'Divine Beast Warriors', desc: 'The golden spiral tower reaching into the heavens, carved with the petrified bodies of thousands.', light: 1.25 },
    { id: 'sote_cleansing_chamber', name: 'Enir-Ilim - Cleansing Chamber Anteroom', zone: 'Enir-Ilim', pos: [18, 6.0, 156], elev: '+6m', danger: 'Apex Lord Tier', boss: 'Needle Knight Leda & Allies', desc: 'Grand staircase threshold where Miquella\'s followers clashed in tragic, fatal ideological betrayal.', light: 1.20 },
    { id: 'sote_gate_of_divinity', name: 'Enir-Ilim - Gate of Divinity Apex', zone: 'Enir-Ilim', pos: [0, 6.0, 178], elev: '+6m', danger: 'Apex Lord Tier', boss: 'Promised Consort Radahn & Miquella', desc: 'The apex threshold of godhood constructed of butchered flesh where light and shadow converge.', light: 1.40 },
    { id: 'sote_cerulean_coast_west', name: 'Cerulean Coast - West Cerulean Cross', zone: 'Cerulean Coast', pos: [-16, 0, -26], elev: '0m', danger: 'Tier III (Advanced)', boss: 'Demi-Human Queen Marigga', desc: 'Gentle cerulean flower plains running down to the misty shoreline where ghost ships wash ashore.', light: 1.00 },
    { id: 'sote_stone_coffin_fissure_depths', name: 'Stone Coffin Fissure - Fissure Depths', zone: 'Stone Coffin Fissure', pos: [-22, -5.0, 52], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Misbegotten Crusader', desc: 'Gigantic stone coffins jutting from sheer subterranean cliffs descending into the violet mist.', light: 0.65 },
    { id: 'sote_garden_deep_purple', name: "Garden of Deep Purple - Saint Trina's Respite", zone: 'Garden of Deep Purple', pos: [-28, -5.0, 114], elev: '-5m', danger: 'Tier V (Legendary)', boss: 'Putrescent Knight & Saint Trina', desc: 'A tranquil subterranean cavern of deep purple nectar flowers where Saint Trina slumbers eternally.', light: 0.70 },
    { id: 'sote_jagged_peak_drake_precipice', name: 'Foot of the Jagged Peak - Drake Precipice', zone: 'Jagged Peak', pos: [22, 0, 38], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Jagged Peak Drakes & Igon', desc: 'Thunderous volcanic crags littered with the impaled corpses of lesser dragons.', light: 0.85 },
    { id: 'sote_jagged_peak_dread_apex', name: 'Jagged Peak - Rest of the Dread Apex', zone: 'Jagged Peak', pos: [26, 6.0, 168], elev: '+6m', danger: 'Apex Lord Tier', boss: 'Bayle the Dread', desc: 'The storm-shattered summit where dragon lightning strikes continuously and ancient Bayle roars.', light: 1.35 },

    // ELDEN RING BASE GAME (12 LOCATIONS: 211–222)
    { id: 'er_limgrave_warmaster', name: "Limgrave - Warmaster's Shack", zone: 'Limgrave', pos: [12, 0, 12], elev: '0m', danger: 'Tier I (Introductory)', boss: 'Bell Bearing Hunter', desc: 'A modest roadside shelter on the Stormhill highway where master warriors once traded ashes of war.', light: 0.95 },
    { id: 'er_weeping_castle_morne', name: 'Weeping Peninsula - Castle Morne Ramparts', zone: 'Weeping Peninsula', pos: [-14, 6.0, -18], elev: '+6m', danger: 'Tier II (Moderate)', boss: 'Leonine Misbegotten', desc: 'A stormy coastal fortress surrounded by breaking ocean swells and burning wooden barricades.', light: 0.90 },
    { id: 'er_siofra_river_bank', name: 'Siofra River - Hallowhorn Grounds', zone: 'Siofra River', pos: [-18, -5.0, 42], elev: '-5m', danger: 'Tier III (Advanced)', boss: 'Ancestor Spirit', desc: 'An underground starry realm bathed in phosphorescent light beneath a false celestial sky.', light: 0.75 },
    { id: 'er_nokron_eternal_city', name: "Nokron, Eternal City - Night's Sacred Ground", zone: 'Nokron', pos: [-24, -5.0, 86], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Mimic Tear', desc: 'Gothic silver palaces sunken into the underworld beneath a canopy of eternal midnight clouds.', light: 0.80 },
    { id: 'er_deeproot_nameless_city', name: 'Deeproot Depths - The Nameless Eternal City', zone: 'Deeproot Depths', pos: [-26, -5.0, 136], elev: '-5m', danger: 'Tier IV (Severe)', boss: "Fia's Champions & Fortissax", desc: 'Massive Erdtree roots plunging into a submerged city where the corpse of Godwyn the Golden rests.', light: 0.70 },
    { id: 'er_ainsel_lake_of_rot', name: 'Lake of Rot - Grand Cloister Waterfall', zone: 'Lake of Rot', pos: [-30, -5.0, 154], elev: '-5m', danger: 'Tier V (Legendary)', boss: 'Astel, Naturalborn of the Void', desc: 'A blinding sea of stagnant pink scarlet rot flowing into ancient pillared cloisters.', light: 0.65 },
    { id: 'er_volcano_temple_eiglay', name: 'Volcano Manor - Temple of Eiglay', zone: 'Mt. Gelmir', pos: [16, 0, 72], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Godskin Noble', desc: 'A volcanic cathedral overlooking lakes of molten magma, decorated with coiled serpent sculptures.', light: 1.15 },
    { id: 'er_leyndell_avenue', name: 'Leyndell, Royal Capital - Avenue Balcony', zone: 'Leyndell', pos: [0, 0, 76], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Erdtree Avatar & Crucible Knight', desc: 'The monumental golden boulevard of the Erdtree capital lined with gold-trimmed balustrades.', light: 1.25 },
    { id: 'er_leyndell_sanctuary', name: 'Leyndell, Royal Capital - Erdtree Sanctuary', zone: 'Leyndell', pos: [0, 6.0, 108], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Godfrey, Golden Shade', desc: 'Sacred open-air colonnade sitting directly beneath the monumental glowing roots of the Erdtree.', light: 1.35 },
    { id: 'er_mountaintops_zamor', name: 'Mountaintops of the Giants - Zamor Ruins', zone: 'Mountaintops', pos: [22, 6.0, 122], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Ancient Hero of Zamor', desc: 'Snow-covered frozen monoliths whistling with arctic blizzards and guarded by frost warriors.', light: 0.90 },
    { id: 'er_consecrated_inner_snowfield', name: 'Consecrated Snowfield - Inner Snowfield', zone: 'Consecrated Snowfield', pos: [-18, 0, 118], elev: '0m', danger: 'Tier V (Legendary)', boss: "Death Rite Bird & Night's Cavalry", desc: 'A blinding whiteout blizzard concealing wandering dragonkins and the golden light of the Haligtree.', light: 0.80 },
    { id: 'er_haligtree_elphael_wall', name: 'Elphael, Brace of the Haligtree - Inner Wall', zone: 'Haligtree', pos: [24, 6.0, 164], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Cleanrot Knights & Malenia', desc: 'A palace of golden masonry embraced by gigantic roots, blooming with sacred unalloyed gold flowers.', light: 1.20 },

    // BLOODBORNE (10 LOCATIONS: 223–232)
    { id: 'bb_central_great_bridge', name: 'Central Yharnam - Great Bridge', zone: 'Central Yharnam', pos: [0, 0, -24], elev: '0m', danger: 'Tier II (Moderate)', boss: 'Cleric Beast', desc: 'The gothic stone highway flanked by horse carriages where the first beast of the hunt screeches.', light: 0.85 },
    { id: 'bb_tomb_of_oedon', name: 'Cathedral Ward - Tomb of Oedon', zone: 'Cathedral Ward', pos: [14, 0, -18], elev: '0m', danger: 'Tier III (Advanced)', boss: 'Father Gascoigne', desc: 'A foggy cemetery littered with stone crosses and tombs where beasts all over the shop transform.', light: 0.70 },
    { id: 'bb_old_yharnam_chapel', name: 'Old Yharnam - Church of the Good Chalice', zone: 'Old Yharnam', pos: [-22, -5.0, 36], elev: '-5m', danger: 'Tier III (Advanced)', boss: 'Blood-starved Beast', desc: 'A sunken ash-burned chapel where beasts hang flayed from cathedral rafters.', light: 0.60 },
    { id: 'bb_healing_church_workshop', name: 'Cathedral Ward - Healing Church Workshop', zone: 'Healing Church', pos: [18, 6.0, 42], elev: '+6m', danger: 'Tier III (Advanced)', boss: 'Deacon Watchers', desc: 'A towering wooden scaffold spiraling up into the highest astronomical spires of the church.', light: 0.80 },
    { id: 'bb_byrgenwerth_moonside', name: 'Byrgenwerth - Moonside Lake', zone: 'Byrgenwerth', pos: [0, 0, 74], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Rom, the Vacuous Spider', desc: 'An infinite mirror of dark water beneath the pale moon concealing the Great One ritual.', light: 1.05 },
    { id: 'bb_unseen_village_advent', name: "Yahar'gul - Advent Plaza of the Red Moon", zone: "Yahar'gul", pos: [-14, 0, 126], elev: '0m', danger: 'Tier IV (Severe)', boss: 'The One Reborn', desc: 'Street paved with weeping petrified skeletons beneath the gaping bellies of Amygdalas.', light: 0.75 },
    { id: 'bb_cainhurst_throne', name: "Forsaken Castle Cainhurst - Annalise's Throne Room", zone: 'Castle Cainhurst', pos: [24, 6.0, 92], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Queen Annalise & Logarius', desc: 'A secluded candlelit chamber hidden behind the illusions of the frozen rooftops.', light: 0.90 },
    { id: 'bb_astral_clocktower', name: "The Hunter's Nightmare - Astral Clocktower", zone: "Hunter's Nightmare", pos: [16, 6.0, 148], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Lady Maria of the Astral Clocktower', desc: 'A grand hall illuminated by the giant face of the clocktower where corpses should be left well alone.', light: 1.10 },
    { id: 'bb_fishing_hamlet_coast', name: 'Fishing Hamlet - Coast of the Great One', zone: 'Fishing Hamlet', pos: [0, 0, 142], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Orphan of Kos', desc: 'A rainy beach where the bloated carcass of Kos lies washed ashore beneath weeping skies.', light: 0.85 },
    { id: 'bb_nightmare_grand_cathedral', name: "Hunter's Nightmare - Grand Cathedral Ruins", zone: "Hunter's Nightmare", pos: [0, 0, 82], elev: '0m', danger: 'Tier V (Legendary)', boss: 'Laurence, the First Vicar', desc: 'The flaming church altar where the blazing skull of the First Vicar burns eternally.', light: 1.20 },

    // SEKIRO: SHADOWS DIE TWICE (6 LOCATIONS: 233–238)
    { id: 'sekiro_outskirts_wall_gate', name: 'Ashina Outskirts - Outskirts Wall Gate Path', zone: 'Ashina Outskirts', pos: [14, 0, -22], elev: '0m', danger: 'Tier II (Moderate)', boss: 'General Naomori Kawarada', desc: 'A snowy fortified pass fortified with timber palisades guarding the lower approaches to Ashina.', light: 0.95 },
    { id: 'sekiro_ashina_castle_gate', name: 'Ashina Castle - Castle Gate Fortress', zone: 'Ashina Castle', pos: [0, 0, 22], elev: '0m', danger: 'Tier III (Advanced)', boss: 'Gyoubu Masataka Oniwa', desc: 'The colossal timber portal where the demon steed of Gyoubu stomps the bloodied mud.', light: 1.00 },
    { id: 'sekiro_senpou_shugendo', name: 'Senpou Temple - Shugendo Mountain Cliff', zone: 'Senpou Temple', pos: [22, 6.0, 84], elev: '+6m', danger: 'Tier III (Advanced)', boss: 'Armored Warrior', desc: 'Precarious wooden planks bolted to sheer cliffs over an endless abyss of morning fog.', light: 1.15 },
    { id: 'sekiro_bodhisattva_valley', name: 'Sunken Valley - Bodhisattva Valley Apex', zone: 'Sunken Valley', pos: [-20, -5.0, 68], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Guardian Ape', desc: 'A sunken clearing dominated by monumental stone Buddha statues and pools of toxic sludge.', light: 0.70 },
    { id: 'sekiro_fountainhead_vermilion', name: 'Fountainhead Palace - Vermilion Bridge', zone: 'Fountainhead Palace', pos: [0, 6.0, 152], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'True Corrupted Monk', desc: 'An arched crimson wooden bridge overlooking flooded palace courtyards covered in cherry blossoms.', light: 1.30 },
    { id: 'sekiro_ashina_reservoir_secret', name: 'Ashina Reservoir - Near Secret Passage', zone: 'Ashina Reservoir', pos: [0, 0, 110], elev: '0m', danger: 'Apex Lord Tier', boss: 'Sword Saint Isshin & Genichiro', desc: 'The silvergrass meadow where lightning crashes into the earth and the final duel takes place.', light: 1.25 },

    // DARK SOULS III (6 LOCATIONS: 239–244)
    { id: 'ds3_cemetery_of_ash', name: 'Cemetery of Ash - Untended Graves', zone: 'Cemetery of Ash', pos: [-12, 0, -16], elev: '0m', danger: 'Tier II (Moderate)', boss: 'Iudex Gundyr & Champion Gundyr', desc: 'A desolate graveyard of kneeling ash coffins surrounded by deep, unlit darkness.', light: 0.75 },
    { id: 'ds3_farron_keep_perimeter', name: 'Farron Keep - Keep Perimeter Mausoleum', zone: 'Farron Keep', pos: [-16, 0, 52], elev: '0m', danger: 'Tier III (Advanced)', boss: 'Abyss Watchers, Undead Legion', desc: 'A ruined stone tomb smelling of wolf blood and rotten swamp water outside the legion mausoleum.', light: 0.80 },
    { id: 'ds3_irithyll_church_yorshka', name: 'Boreal Valley - Church of Yorshka', zone: 'Irithyll', pos: [12, 0, 86], elev: '0m', danger: 'Tier IV (Severe)', boss: 'Pontiff Sulyvahn', desc: 'A snow-draped gothic cathedral nave lit by cold blue stained-glass windows and silver candelabras.', light: 1.05 },
    { id: 'ds3_anor_londo_ds3', name: 'Anor Londo - Cathedral of the Devourer', zone: 'Anor Londo', pos: [0, 6.0, 112], elev: '+6m', danger: 'Tier IV (Severe)', boss: 'Aldrich, Devourer of Gods', desc: 'The darkened monumental hall of Gwynevere now flooded with deep black sludge and devoured bones.', light: 0.85 },
    { id: 'ds3_grand_archives_roof', name: 'Lothric Castle - Grand Archives Rooftops', zone: 'Lothric Castle', pos: [22, 6.0, 152], elev: '+6m', danger: 'Tier V (Legendary)', boss: 'Lorian & Lothric Princes', desc: 'Precipitous slate roofs crowded with gargoyles leading up to the high bedchamber of the twin princes.', light: 1.15 },
    { id: 'ds3_kiln_eclipse_ash', name: 'Kiln of the First Flame - Eclipse of Ash', zone: 'Kiln of the First Flame', pos: [0, 0, 164], elev: '0m', danger: 'Apex Lord Tier', boss: 'Soul of Cinder', desc: 'The twisted ruins of kingdoms collapsed into a desert of gray ash beneath the bleeding Darksign sun.', light: 1.35 },

    // DARK SOULS II & DEMON'S SOULS (6 LOCATIONS: 245–250)
    { id: 'ds2_majula_monument', name: 'Majula - Death Counter Monument', zone: 'Majula', pos: [14, 0, -26], elev: '0m', danger: 'Sanctuary (Safe Hub)', boss: 'None (Emerald Herald)', desc: 'The wind-swept cliffside obelisk overlooking the turquoise sea, recording worldwide deaths.', light: 1.30 },
    { id: 'ds2_forest_fallen_giants', name: 'Forest of Fallen Giants - Cardinal Tower', zone: 'Forest of Fallen Giants', pos: [-16, 0, 24], elev: '0m', danger: 'Tier I (Introductory)', boss: 'The Last Giant & The Pursuer', desc: 'A ruined stone fortification built upon the petrified woody roots of fallen foreign giants.', light: 0.90 },
    { id: 'ds2_earthen_peak_windmill', name: 'Earthen Peak - Upper Windmill Spire', zone: 'Earthen Peak', pos: [20, 6.0, 66], elev: '+6m', danger: 'Tier III (Advanced)', boss: 'Mytha, the Baneful Queen', desc: 'A towering wooden windmill churning with poisonous green fumes above flooded magma keeps.', light: 0.80 },
    { id: 'ds2_brume_tower_throne', name: 'Brume Tower - Throne of the Fume Knight', zone: 'Brume Tower', pos: [0, -5.0, 122], elev: '-5m', danger: 'Tier V (Legendary)', boss: 'Fume Knight Raime', desc: 'A colossal subterranean furnace of ash where Raime stands guard over the idol of Nadalia.', light: 0.85 },
    { id: 'des_boletaria_1_1', name: 'Boletarian Palace - Gates of Boletaria Courtyard', zone: 'Boletaria', pos: [0, 0, -32], elev: '0m', danger: 'Tier I (Introductory)', boss: 'Phalanx', desc: 'The monumental stone portcullis leading into the great castle of King Allant under deep fog.', light: 0.95 },
    { id: 'des_flamelurker_temple', name: 'Stonefang Tunnel - Temple of God Underground', zone: 'Stonefang Tunnel', pos: [18, -5.0, 98], elev: '-5m', danger: 'Tier IV (Severe)', boss: 'Flamelurker & Dragon God', desc: 'A scorching volcanic cavern where the ancient fossilized bones of the colossal Dragon God rest.', light: 1.10 },
    // ----------------------------------------------------
    // 50 NEW SOULSBORNE EXPEDITIONS (#251 - #300)
    // ----------------------------------------------------
    { id: 'des_shrine_of_storms_altar', name: "Shrine of Storms - Altar of the Monolith", zone: "Shrine of Storms", pos: [22, -1, 115], elev: '-1m', danger: 'Tier IV (Severe)', boss: "Storm King & Shadowmen", desc: "A stormy mountaintop shrine battered by torrential downpours where the Storm King glides above the monoliths.", light: 0.9 },
    { id: 'des_tower_of_latria_heart', name: "Upper Latria - Monstrous Beating Heart", zone: "Tower of Latria", pos: [-24, 7.5, 88], elev: '+7.5m', danger: 'Tier V (Legendary)', boss: "Maneaters & Old Monk", desc: "Suspended iron walkways encircling a colossal fleshy heart pulsing with ancient demonic corruption.", light: 0.85 },
    { id: 'des_valley_defilement_swamp', name: "Swamp of Sorrow - Colossal Depraved Village", zone: "Valley of Defilement", pos: [30, -8, 75], elev: '-8m', danger: 'Tier V (Nightmare)', boss: "Maiden Astraea & Garl Vinland", desc: "A nauseating toxic swamp filled with depraved shanties and the sanctuary of the fallen Saint Astraea.", light: 0.7 },
    { id: 'des_stonefang_armorspider', name: "Stonefang Tunnel - Smithing Lava Caverns", zone: "Stonefang Tunnel", pos: [12, -3.5, 82], elev: '-3.5m', danger: 'Tier III (Moderate)', boss: "Armor Spider & Miners", desc: "Deep mining tunnels illuminated by blast furnaces, molten lava streams, and ancient burrowing spider webs.", light: 1.15 },
    { id: 'des_penetrator_courtyard', name: "Boletarian Palace - Courtyard of Red Knights", zone: "Boletarian Palace", pos: [-8, 2, 108], elev: '+2m', danger: 'Tier IV (Severe)', boss: "Penetrator & Biorr of Twin Fangs", desc: "Grand cobblestone square leading to the inner sanctum, guarded by elite red-eyed imperial knights.", light: 1.05 },
    { id: 'ds1_great_hollow_trunk', name: "The Great Hollow - Primeval Archtree Trunk", zone: "The Great Hollow", pos: [-32, -9, 60], elev: '-9m', danger: 'Tier IV (Severe)', boss: "Curse Basilisks & Mushroom Men", desc: "The cavernous hollow interior of an ancient everlasting archtree descending toward the subterranean Ash Lake.", light: 0.75 },
    { id: 'ds1_ash_lake_dragon', name: "Stone Dragon Sanctuary - Everlasting Rest", zone: "Ash Lake", pos: [-38, -12, 85], elev: '-12m', danger: 'Tier V (Legendary)', boss: "Everlasting Stone Dragon", desc: "Endless shores of gray ash and primordial archtrees where the immortal Stone Dragon awaits dragon acolytes.", light: 1.2 },
    { id: 'ds1_painted_world_annex', name: "Painted World - Courtyard of Priscilla", zone: "Painted World of Ariamis", pos: [16, 4, 122], elev: '+4m', danger: 'Tier IV (Severe)', boss: "Crossbreed Priscilla & Phalanx", desc: "Snow-covered cold ruins sealed within a colossal canvas in Anor Londo, home to the gentle Crossbreed Priscilla.", light: 1.1 },
    { id: 'ds1_demon_ruins_staircase', name: "Demon Ruins - Lava Staircase of Firesage", zone: "Demon Ruins", pos: [28, -6.5, 92], elev: '-6.5m', danger: 'Tier IV (Severe)', boss: "Demon Firesage & Capra Pack", desc: "A blistering subterranean staircase over churning magma lakes leading down into the roots of Lost Izalith.", light: 1.25 },
    { id: 'ds1_lost_izalith_bed', name: "Lost Izalith - Root Chamber of Chaos", zone: "Lost Izalith", pos: [34, -7, 110], elev: '-7m', danger: 'Tier V (Nightmare)', boss: "Bed of Chaos & Chaos Eaters", desc: "The incandescent cradle of all demons where the Witch of Izalith was consumed by the primordial Flame of Chaos.", light: 1.3 },
    { id: 'ds1_tomb_giants_patches', name: "Tomb of the Giants - Pit of Patches", zone: "Tomb of the Giants", pos: [19, -8.5, 68], elev: '-8.5m', danger: 'Tier V (Nightmare)', boss: "Patches the Hyena & Giant Skeletons", desc: "Pitch-black ossuary caverns where Patches lures naive clerics toward the edge of an abyss pit.", light: 0.45 },
    { id: 'ds1_crystal_cave_butterflies', name: "Crystal Cave - Invisible Bridges of Seath", zone: "Crystal Cave", pos: [-26, 1.5, 130], elev: '+1.5m', danger: 'Tier V (Severe)', boss: "Moonlight Butterflies & Golden Golems", desc: "Luminous sapphire caverns crossed only by stepping onto invisible crystalline walkways over bottomless chasms.", light: 1.15 },
    { id: 'ds1_sanctuary_guardian_pool', name: "Oolacile Sanctuary - Guardian Shaded Spring", zone: "Oolacile Sanctuary", pos: [-15, 0.5, 95], elev: '+0.5m', danger: 'Tier IV (Severe)', boss: "Sanctuary Guardian & Elizabeth", desc: "A tranquil sunlit forest pool guarded by the winged manticore chimera before entering the royal woods.", light: 1.05 },
    { id: 'ds1_chasm_abyss_manus', name: "Chasm of the Abyss - Throne of Manus", zone: "Chasm of the Abyss", pos: [-22, -11, 118], elev: '-11m', danger: 'Tier V (Nightmare)', boss: "Manus, Father of the Abyss", desc: "The abyssal primordial void where the Primeval Man mutated into the monstrous Father of the Abyss.", light: 0.5 },
    { id: 'ds2_majula_pit', name: "Majula - Great Subterranean Pit", zone: "Majula", pos: [6, -1, 52], elev: '-1m', danger: 'Tier II (Fair)', boss: "Gillie the Laddersmith", desc: "The fathomless pit at the center of Majula descending through rickety wooden scaffolds into the Grave of Saints.", light: 1 },
    { id: 'ds2_heides_ruin_blue', name: "Heide Tower of Flame - Cathedral of Blue", zone: "Heide Tower of Flame", pos: [-18, 3, 78], elev: '+3m', danger: 'Tier III (Moderate)', boss: "Old Dragonslayer & Blue Sentinels", desc: "A flooded ocean fortress where the Old Dragonslayer guards the sacred shrine of the Blue Sentinels.", light: 1.15 },
    { id: 'ds2_huntsmans_copse_bridge', name: "Huntsman Copse - Purgatory Chariot Bridge", zone: "Huntsman Copse", pos: [24, 0, 64], elev: '0m', danger: 'Tier IV (Severe)', boss: "Executioner Chariot & Necromancers", desc: "A crumbling rope bridge suspended over a misty gorge leading to the iron colosseum of the Undead Purgatory.", light: 0.85 },
    { id: 'ds2_shrine_of_amana_altar', name: "Shrine of Amana - Altar of Songbirds", zone: "Shrine of Amana", pos: [-30, -4, 84], elev: '-4m', danger: 'Tier V (Severe)', boss: "Demon of Song & Milfanito Priestesses", desc: "Submerged flooded ruins echoing with the sorrowful lullaby of Milfanito priestesses soothing the deformed.", light: 1.1 },
    { id: 'ds2_dragon_shrine_ancient', name: "Dragon Shrine - Stairway of the Ancient", zone: "Dragon Shrine", pos: [32, 8.5, 126], elev: '+8.5m', danger: 'Tier V (Legendary)', boss: "Ancient Dragon & Dragonfang Villard", desc: "A majestic skyward shrine perched on floating stone pillars where silent dragon knights guard the colossal Ancient Dragon.", light: 1.25 },
    { id: 'ds2_memory_of_jeigh', name: "Memory of Jeigh - Scorched Giant Rampart", zone: "Forest of Fallen Giants", pos: [14, 3.5, 102], elev: '+3.5m', danger: 'Tier IV (Severe)', boss: "Giant Lord & King Vendrick Vanguard", desc: "A past memory of catastrophic siege warfare where flaming siege stones rain down upon the battlements.", light: 1.2 },
    { id: 'ds2_shulva_dragon_sanctum', name: "Dragon Sanctum - Chamber of Sinh", zone: "Sunken King Sanctum", pos: [26, -9, 105], elev: '-9m', danger: 'Tier V (Nightmare)', boss: "Sinh the Slumbering Dragon & Elana", desc: "A submerged subterranean ziggurat where the poisonous Slumbering Dragon rests impaled by Sir Yorgh spear.", light: 0.95 },
    { id: 'ds2_eleum_loyce_cathedral', name: "Grand Cathedral of Loyce - Chaos Throne", zone: "Frozen Eleum Loyce", pos: [-28, 6, 114], elev: '+6m', danger: 'Tier V (Nightmare)', boss: "Burnt Ivory King & Loyce Knights", desc: "A frostbitten ivory cathedral suspended above the incandescent mouth of the Old Chaos.", light: 1.2 },
    { id: 'ds3_untended_graves_champion', name: "Untended Graves - Shrine of Champion Gundyr", zone: "Cemetery of Ash", pos: [2, 0.5, 48], elev: '+0.5m', danger: 'Tier I (Introduction)', boss: "Iudex Gundyr & Ravenous Crystal Lizard", desc: "A desolate resting ground of unkindled ash surrounded by silent bell-towers and weathered tombstones.", light: 0.95 },
    { id: 'ds3_undead_settlement_bridge', name: "Undead Settlement - Dilapidated Bridge", zone: "Undead Settlement", pos: [18, -1.5, 72], elev: '-1.5m', danger: 'Tier III (Moderate)', boss: "Curse-rotted Greatwood & Holy Knight Hodrick", desc: "A ramshackle bridge over a sewer ravine beneath the giant archer tower throwing spears from above.", light: 0.9 },
    { id: 'ds3_road_of_sacrifices_keep', name: "Keep Ruins - Farron Swamp Citadel", zone: "Road of Sacrifices", pos: [-16, -2.5, 82], elev: '-2.5m', danger: 'Tier IV (Severe)', boss: "Crystal Sage & Abyss Watchers", desc: "Sunken fortress ramparts overgrown with poisonous moss and extinguished sacred flames.", light: 0.85 },
    { id: 'ds3_rosaria_bedchamber', name: "Cathedral of the Deep - Rosaria\x27s Bedchamber", zone: "Cathedral of the Deep", pos: [22, 2.5, 96], elev: '+2.5m', danger: 'Tier IV (Severe)', boss: "Deacons of the Deep & Cathedral Knights", desc: "The sacred sanctuary where monks of the Way of White fell into horrific devotion to the deep water abyss.", light: 0.95 },
    { id: 'ds3_profaned_capital_yhorm', name: "Profaned Capital - Throne of Yhorm", zone: "Profaned Capital", pos: [30, -5.5, 112], elev: '-5.5m', danger: 'Tier V (Legendary)', boss: "Yhorm the Giant & Siegward of Catarina", desc: "A gold-encrusted subterranean royal hall where Yhorm the Giant sits with the legendary Storm Ruler.", light: 1.15 },
    { id: 'ds3_irithyll_dungeon_cells', name: "Irithyll Dungeon - Bellowing Cell Block", zone: "Irithyll Dungeon", pos: [-20, -4.5, 98], elev: '-4.5m', danger: 'Tier IV (Severe)', boss: "Jailer Overseers & Monstrosities of Sin", desc: "Cold subterranean iron cages where terrifying jailers drain the maximum vitality of captured prisoners.", light: 0.8 },
    { id: 'ds3_archdragon_peak_bell', name: "Archdragon Peak - Great Belfry Summit", zone: "Archdragon Peak", pos: [28, 9, 132], elev: '+9m', danger: 'Tier V (Legendary)', boss: "Nameless King & King of the Storm", desc: "A cloud-shrouded plateau where ringing the great bell summons the Nameless King riding his stormdrake.", light: 1.3 },
    { id: 'ds3_painted_corvian_settlement', name: "Painted World - Corvian Settlement & Vilhelm", zone: "Painted World of Ariandel", pos: [-25, 4.5, 120], elev: '+4.5m', danger: 'Tier V (Nightmare)', boss: "Sister Friede & Father Ariandel", desc: "The frozen chapel of Father Ariandel who whips himself to appease the rising flame with his blood basin.", light: 1.05 },
    { id: 'ds3_ringed_city_streets', name: "Ringed City - Judicator Abyssal Swamp", zone: "The Ringed City", pos: [32, -3, 125], elev: '-3m', danger: 'Tier V (Nightmare)', boss: "Judicator Argo & Ringed Knights", desc: "Sunken streets swallowed by the dark soul swamp, patrolled by giant Judicators summoning ghost archers.", light: 0.9 },
    { id: 'ds3_shira_ruined_tower', name: "The Ringed City - Shira\x27s Crucifix Sanctuary", zone: "The Ringed City", pos: [0, 0, 140], elev: '0m', danger: 'Tier V (Supreme)', boss: "Slave Knight Gael & Shira", desc: "The shattered desert of ash at the end of all time where Slave Knight Gael feasts on the Dark Soul.", light: 1.1 },
    { id: 'bb_central_yharnam_fountain', name: "Central Yharnam - Great Fountain Square", zone: "Central Yharnam", pos: [-12, 1, 68], elev: '+1m', danger: 'Tier III (Moderate)', boss: "Cleric Beast & Brick Trolls", desc: "Cobblestone plaza where maddened townsfolk burn a beast on a wooden pyre under a blood red moon.", light: 0.85 },
    { id: 'bb_cathedral_ward_grand', name: "Cathedral Ward - Grand Beast Altar", zone: "Cathedral Ward", pos: [14, 4, 86], elev: '+4m', danger: 'Tier IV (Severe)', boss: "Vicar Amelia & Eileen the Crow", desc: "The towering marble cathedral of the Healing Church where Vicar Amelia clutches the beastly golden pendant.", light: 1.05 },
    { id: 'bb_forbidden_woods_windmill', name: "Forbidden Woods - Windmill Crossroads", zone: "Forbidden Woods", pos: [-24, -2, 76], elev: '-2m', danger: 'Tier IV (Severe)', boss: "Shadow of Yharnam & Snake Parasites", desc: "Dense misty forest filled with serpent clusters, hidden spike traps, and decaying cobblestone mills.", light: 0.75 },
    { id: 'bb_byrgenwerth_lunarium', name: "Byrgenwerth - Moonside Lake Lunarium", zone: "Byrgenwerth", pos: [20, 1.5, 94], elev: '+1.5m', danger: 'Tier IV (Severe)', boss: "Rom, the Vacuous Spider & Master Willem", desc: "The lakeside academy where scholar Willem gazes endlessly upon the lake hiding the paleblood moon.", light: 1.1 },
    { id: 'bb_hypogean_gaol_paarl', name: "Yahar'gul, Unseen Village - Advent Plaza", zone: "Yahar'gul Unseen Village", pos: [26, -1, 108], elev: '-1m', danger: 'Tier V (Nightmare)', boss: "The One Reborn & Bell Ringing Women", desc: "A nocturnal ritual city where severed flesh descends from the cosmos to manifest The One Reborn.", light: 0.8 },
    { id: 'bb_nightmare_mensis_loft', name: "Nightmare of Mensis - Wet Nurse Terrace", zone: "Nightmare of Mensis", pos: [-28, 8, 124], elev: '+8m', danger: 'Tier V (Nightmare)', boss: "Mergo Wet Nurse & Micolash", desc: "The highest tower balcony of the Nightmare where the multi-bladed Wet Nurse cradles the crying infant Great One.", light: 0.95 },
    { id: 'bb_research_hall_clocktower', name: "Research Hall - Astral Clocktower Veranda", zone: "Hunter Nightmare", pos: [15, 6.5, 118], elev: '+6.5m', danger: 'Tier V (Legendary)', boss: "Lady Maria of the Astral Clocktower", desc: "A colossal stained-glass clock tower where Lady Maria slumbers, guarding the secret of the fishing hamlet.", light: 1.15 },
    { id: 'bb_lighthouse_hut_well', name: "Fishing Hamlet - Lighthouse Hut & Shark Well", zone: "Hunter Nightmare", pos: [-18, -3, 128], elev: '-3m', danger: 'Tier V (Supreme)', boss: "Orphan of Kos & Shark Giants", desc: "A rain-drenched coastal beach where the weeping Orphan of Kos emerges from the washed-up Great One carcass.", light: 0.9 },
    { id: 'sekiro_ashina_reservoir', name: "Ashina Reservoir - Moon-view Tower", zone: "Ashina Outskirts", pos: [8, 1, 62], elev: '+1m', danger: 'Tier III (Moderate)', boss: "Seven Ashina Spears & Lone Shadow", desc: "The reed field where Wolf first met the Divine Heir Kuro before their fateful clash with Lord Genichiro.", light: 1 },
    { id: 'sekiro_senpou_main_hall', name: "Senpou Temple - Main Hall of Monkeys", zone: "Senpou Temple Mt. Kongo", pos: [-14, 5, 92], elev: '+5m', danger: 'Tier IV (Severe)', boss: "Folding Screen Monkeys & Armored Warrior", desc: "A sacred autumn temple sanctuary home to corrupt monks seeking immortality through the dragon blood.", light: 1.15 },
    { id: 'sekiro_sunken_valley_passage', name: "Sunken Valley - Guardian Ape Watering Hole", zone: "Sunken Valley", pos: [22, -4.5, 88], elev: '-4.5m', danger: 'Tier IV (Severe)', boss: "Guardian Ape & Snake Eyes Shirafuji", desc: "A mist-filled gorge filled with lotus waters where the undying giant ape guards the Palace Lotus.", light: 0.95 },
    { id: 'sekiro_mibu_village_watermill', name: "Mibu Village - Watermill & Monk Bridge", zone: "Ashina Depths", pos: [-22, -6, 102], elev: '-6m', danger: 'Tier IV (Severe)', boss: "Corrupted Monk & O'Rin of the Water", desc: "A phantom-haunted village bathed in purple twilight where weeping spirits dance beside the misty river.", light: 0.85 },
    { id: 'sekiro_fountainhead_palace_veranda', name: "Fountainhead Palace - Vermilion Terrace", zone: "Fountainhead Palace", pos: [16, 7, 126], elev: '+7m', danger: 'Tier V (Legendary)', boss: "Divine Dragon & Okami Nobles", desc: "A celestial palace of cherry blossoms and turquoise waters where noble okami warriors flute immortal melodies.", light: 1.25 },
    { id: 'er_academy_debate_parlor', name: "Academy of Raya Lucaria - Debate Parlor", zone: "Liurnia of the Lakes", pos: [-19, 2.5, 96], elev: '+2.5m', danger: 'Tier IV (Severe)', boss: "Red Wolf of Radagon & Rennala", desc: "The grand crystalline academic forum where the Red Wolf of Radagon wields glintstone sorcery swords.", light: 1.1 },
    { id: 'er_volcano_manor_guest_hall', name: "Volcano Manor - Prison Town Noble Hall", zone: "Mt. Gelmir", pos: [25, 4, 110], elev: '+4m', danger: 'Tier V (Severe)', boss: "Godskin Noble & Praetor Rykard", desc: "A lava-scorched fortress where blasphemous inquisitors worship the great serpent of Mt. Gelmir.", light: 1.2 },
    { id: 'er_haligtree_roots_malenia', name: "Brace of the Haligtree - Roots of Malenia", zone: "Miquella Haligtree", pos: [-32, -8, 122], elev: '-8m', danger: 'Tier V (Supreme)', boss: "Malenia, Blade of Miquella", desc: "The deepest roots of the rotting divine tree where Malenia slumbers beside an enormous blooming Aeonian scarlet rot bud.", light: 1.05 },
    { id: 'er_crumbling_farum_dragon_temple', name: "Farum Azula - Dragon Temple Rooftop", zone: "Crumbling Farum Azula", pos: [28, 8, 134], elev: '+8m', danger: 'Tier V (Nightmare)', boss: "Dragonlord Placidusax & Beast Clergyman", desc: "Suspended ruins spinning through a titanic eternal storm where ancient multi-headed dragonlords rule beyond time.", light: 1.25 },
    { id: 'sote_enir_ilim_divine_gate', name: "Enir-Ilim - Gate of Divinity", zone: "Shadow Realm", pos: [0, 9.5, 142], elev: '+9.5m', danger: 'Tier V (Supreme)', boss: "Promised Consort Radahn & Miquella", desc: "The towering spiral citadel summit of the Hornsent where Miquella ascended through the Gate of Divinity.", light: 1.35 }

];

// Locations & Save Slot Global Window Helpers
window.openLocationsModal = () => { if (window.game) window.game.openLocationsModal(); };
window.closeLocationsModal = () => { if (window.game) window.game.closeLocationsModal(); };
window.filterLocations = (f) => { if (window.game) window.game.renderLocationsUI(f); };
window.travelToLordranLocation = (id) => { if (window.game) window.game.travelToLocation(id); };

window.saveToSlot = (id) => { if (window.game) window.game.saveToSlot(id); };
window.loadFromSlot = (id) => { if (window.game) window.game.loadFromSlot(id); };
window.deleteSlot = (id) => { if (window.game) window.game.deleteSlot(id); };
window.exportSaveJson = () => { if (window.game) window.game.exportSaveJson(); };
window.importSaveJsonPrompt = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (window.game) window.game.importSaveJson(ev.target.result);
        };
        reader.readAsText(file);
    };
    input.click();
};
window.resetJourney = () => { if (window.game) window.game.resetJourney(); };

// Global initialization
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
        if (!window.game) window.game = new DarkSoulsGame();
    });
} else {
    if (!window.game) window.game = new DarkSoulsGame();
}
