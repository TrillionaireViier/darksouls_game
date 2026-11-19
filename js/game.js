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
        this.heraldry.applyHeraldryTo3DPlayer();
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
            if (e.code === 'KeyT' || e.key === 't' || e.key === 'T' || e.key === 'е' || e.key === 'Е') this.toggleTorch();
            if (e.code === 'KeyR' || e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К' || e.code === 'Digit1') this.combat.tryDrinkEstus();
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
                    this.travelToLocation('royal_bridge_arena');
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
        if (this.siege) this.siege.update(delta);
        if (this.heraldry) this.heraldry.update(delta);
        if (this.apothecary) this.apothecary.update(delta);
        if (this.inventory) this.inventory.update(delta);

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

        // 1. DEATH COLLAPSE
        if (this.combat.isDead) {
            if (this.playerMesh.position.y > 0.1) {
                this.playerMesh.position.y = Math.max(0, this.playerMesh.position.y - delta * 2);
            }
            if (uData.torso) {
                uData.torso.rotation.x = Math.min(Math.PI / 2.2, uData.torso.rotation.x + delta * 3);
            }
            if (uData.leftShoulder) uData.leftShoulder.rotation.z = Math.min(0.7, uData.leftShoulder.rotation.z + delta * 2);
            if (uData.rightShoulder) uData.rightShoulder.rotation.z = Math.max(-0.7, uData.rightShoulder.rotation.z - delta * 2);
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
            pPos.y = THREE.MathUtils.lerp(pPos.y, targetGroundY, Math.min(1.0, delta * 20));
            this.playerVelocity.y = 0;
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
            // Shield Block Stance
            if (uData.leftShoulder) {
                uData.leftShoulder.rotation.x = 0.75;
                uData.leftShoulder.rotation.y = 0.38;
                uData.leftShoulder.rotation.z = -0.18;
            }
            if (uData.torso) {
                uData.torso.rotation.y = -0.16;
                uData.torso.rotation.x = 0.08;
            }
            if (uData.bodyGroup) uData.bodyGroup.position.y = 0.95;
            if (uData.shieldGroup) {
                uData.shieldGroup.position.set(0, 0.22, 0.35);
                uData.shieldGroup.rotation.set(0, 0, 0);
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

            // Normal shield posture
            if (uData.shieldGroup) {
                uData.shieldGroup.position.set(-0.04, 0.06, 0.16);
                uData.shieldGroup.rotation.set(0.08, Math.PI / 8, -0.05);
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
        let targetRotX = 0.45, targetRotY = 0.10, targetRotZ = -0.18;
        let targetPosX = 0.02, targetPosY = 0.04, targetPosZ = 0.06;

        if (wpnId === 'halberd') {
            // Authentic Dark Souls halberd polearm stance (held upright & forward, never skewering backwards)
            targetRotX = 0.18; targetRotY = 0.05; targetRotZ = -0.06;
            targetPosX = 0.02; targetPosY = 0.04; targetPosZ = 0.02;
        } else if (wpnId === 'zweihander') {
            targetRotX = 0.50; targetRotY = 0.12; targetRotZ = -0.20;
            targetPosX = 0.02; targetPosY = 0.05; targetPosZ = 0.08;
        } else if (wpnId === 'dragontooth') {
            targetRotX = 0.40; targetRotY = 0.12; targetRotZ = -0.18;
            targetPosX = 0.02; targetPosY = 0.04; targetPosZ = 0.06;
        } else if (wpnId === 'torch') {
            targetRotX = 0.12; targetRotY = 0.0; targetRotZ = -0.06;
            targetPosX = 0.0; targetPosY = 0.06; targetPosZ = 0.04;
        } else if (wpnId === 'uchigatana') {
            targetRotX = 0.45; targetRotY = 0.10; targetRotZ = -0.16;
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
                this.world.spawnArenaBonfire(0, 0, 138);
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
            this.playerMesh.position.set(0, 0, 134);
        } else {
            this.playerMesh.position.set(0, 0, 134);
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

        if (this.playerMesh.userData.torso) {
            this.playerMesh.userData.torso.rotation.x = 0;
            this.playerMesh.userData.torso.position.y = 0;
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
                    this.world.spawnArenaBonfire(0, 0, 138);
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
                this.showNotification(`📂 JOURNEY RESTORED &bull; SOUL LEVEL ${this.combat.level} (${this.combat.souls.toLocaleString()} SOULS)`);
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
        this.combat.unlockedWeapons = ['sword', 'zweihander', 'uchigatana', 'halberd', 'dragontooth', 'moonlight', 'torch', 'rivers_of_blood', 'dark_moon_greatsword'];
        this.saveGame(false, 'ADMIN WEAPONS');
        if (this.updateWeaponArsenalUI) this.updateWeaponArsenalUI();
        this.updateAdminModalUI();
        this.showNotification("🗡️ ADMIN: ALL 9 WEAPONS UNLOCKED PERMANENTLY!");
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

            if (this.audio && this.audio.playBellToll) this.audio.playBellToll();
            this.showNotification(`🗺️ FAST-TRAVEL: ${loc.name.toUpperCase()} (${loc.elev})`);

            this.closeLocationsModal();
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
window.adminGrantSoulsAndEstus = (s) => { if (window.game) window.game.adminGrantSoulsAndEstus(s); };
window.adminToggleGodMode = () => { if (window.game) window.game.adminToggleGodMode(); };
window.adminWarp = (d) => { if (window.game) window.game.adminWarp(d); };
window.adminSummonBoss = (b) => { if (window.game) window.game.adminSummonBoss(b); };
window.togglePerformanceMode = () => { if (window.game) window.game.togglePerformanceMode(); };
window.openLoreCodexModal = () => { if (window.game) window.game.openLoreCodexModal(); };
window.closeLoreCodexModal = () => { if (window.game) window.game.closeLoreCodexModal(); };
window.filterLoreCodex = (cat) => { if (window.game) window.game.renderLoreCodexContent(cat); };
window.adminUnlockAllLore = () => { if (window.game) window.game.adminUnlockAllLore(); };

// 100 Authentic Lordran, Drangleic, Lothric, Boletaria, Yharnam & Lands Between Fast-Travel Locations
window.DARK_SOULS_LOCATIONS = [
    // ----------------------------------------------------
    // SANCTUARIES & HUB REALMS
    // ----------------------------------------------------
    { id: 'royal_bridge_arena', name: 'Royal Bridge - Grand Citadel Arena (Hub)', zone: 'Royal Citadel', pos: [0, 0, 134], elev: '0m', danger: 'Sanctuary & War Arena (Hub)', boss: 'Arena Colosseum', desc: 'The high rampart causeway spanning the northern chasm, flanked by watchtowers and the nexus bonfire.', light: 1.10 },
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
    { id: 'lands_between_nexus', name: 'Lands Between - Elden Throne & Fractured Marika', zone: 'Elden Throne', pos: [0, 6.0, 190], elev: '+6m', danger: 'Apex Lord Tier', boss: 'Elden Beast & Radagon', desc: 'The golden cosmic sea inside the Erdtree where the physical incarnation of the Greater Will resides.', light: 1.40 }
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
