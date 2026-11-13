// ==========================================
// DARK SOULS 3D WORLD BUILDER & PARTICLE SYSTEM
// Gothic castle ruins, Courtyard, Bonfire, Fog Gate, Boss Arena
// ==========================================

class DarkSoulsWorld {
    constructor(scene) {
        this.scene = scene;
        this.colliders = [];
        this.interactables = [];
        this.particles = [];
        this.bonfireLight = null;
        this.fogGateMesh = null;
        this.fogTraversed = false;
        this.emberParticles = null;
        this.bloodParticles = [];
        this.sparkParticles = [];
        this.clock = new THREE.Clock();

        this.initMaterials();
        this.buildLighting();
        this.buildEnvironment();
        this.buildBonfire();
        this.buildFogGate();
        this.buildAtmosphere();
    }

    initMaterials() {
        // ==========================================
        // HD REMASTER / MOD PROCEDURAL TEXTURES
        // 1024x1024 High-Fidelity Medieval Lordran Textures
        // Diffuse, Bump, Roughness & Emissive Maps
        // ==========================================

        // 1. ANCIENT GOTHIC COURTYARD COBBLESTONE (1024x1024)
        const stoneCanvas = document.createElement('canvas');
        stoneCanvas.width = 1024;
        stoneCanvas.height = 1024;
        const sCtx = stoneCanvas.getContext('2d');

        const stoneBumpCanvas = document.createElement('canvas');
        stoneBumpCanvas.width = 1024;
        stoneBumpCanvas.height = 1024;
        const sbCtx = stoneBumpCanvas.getContext('2d');

        const stoneRoughCanvas = document.createElement('canvas');
        stoneRoughCanvas.width = 1024;
        stoneRoughCanvas.height = 1024;
        const srCtx = stoneRoughCanvas.getContext('2d');

        // Deep mortar base
        sCtx.fillStyle = '#0c0a09';
        sCtx.fillRect(0, 0, 1024, 1024);
        sbCtx.fillStyle = '#101010'; // Recessed mortar
        sbCtx.fillRect(0, 0, 1024, 1024);
        srCtx.fillStyle = '#e5e5e5'; // Matte dry mortar
        srCtx.fillRect(0, 0, 1024, 1024);

        const rows = 16;
        const cols = 8;
        const rh = 1024 / rows;
        const cw = 1024 / cols;

        for (let r = 0; r < rows; r++) {
            const rowOffset = (r % 2) * (cw / 2) + Math.sin(r * 1.5) * 6;
            for (let c = -1; c <= cols + 1; c++) {
                const bx = c * cw + rowOffset + 3;
                const by = r * rh + 3;
                const bw = cw - 6;
                const bh = rh - 6;

                // Varied stone palette: slate, basalt, ash granite, mossy undertone
                const palSeed = Math.random();
                let baseR, baseG, baseB;
                if (palSeed < 0.35) {
                    baseR = 30 + Math.floor(Math.random() * 16); // Slate grey
                    baseG = 32 + Math.floor(Math.random() * 16);
                    baseB = 36 + Math.floor(Math.random() * 18);
                } else if (palSeed < 0.7) {
                    baseR = 34 + Math.floor(Math.random() * 18); // Dark ash granite
                    baseG = 31 + Math.floor(Math.random() * 16);
                    baseB = 28 + Math.floor(Math.random() * 14);
                } else {
                    baseR = 24 + Math.floor(Math.random() * 12); // Basalt charcoal
                    baseG = 25 + Math.floor(Math.random() * 14);
                    baseB = 24 + Math.floor(Math.random() * 12);
                }

                // Fill stone slab
                sCtx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
                sCtx.fillRect(bx, by, bw, bh);

                // Bump map: elevated slab (180-220)
                const bumpH = 190 + Math.floor(Math.random() * 35);
                sbCtx.fillStyle = `rgb(${bumpH}, ${bumpH}, ${bumpH})`;
                sbCtx.fillRect(bx, by, bw, bh);

                // Roughness map: damp polished stone tops (100-140 = 0.4-0.55 roughness)
                const roughVal = 100 + Math.floor(Math.random() * 40);
                srCtx.fillStyle = `rgb(${roughVal}, ${roughVal}, ${roughVal})`;
                srCtx.fillRect(bx, by, bw, bh);

                // Chiseled beveled edges: top-left highlight, bottom-right shadow
                sCtx.fillStyle = 'rgba(255, 255, 255, 0.09)';
                sCtx.fillRect(bx, by, bw, 3);
                sCtx.fillRect(bx, by, 3, bh);
                sCtx.fillStyle = 'rgba(0, 0, 0, 0.45)';
                sCtx.fillRect(bx, by + bh - 3, bw, 3);
                sCtx.fillRect(bx + bw - 3, by, 3, bh);

                sbCtx.fillStyle = '#ffffff';
                sbCtx.fillRect(bx, by, bw, 2);
                sbCtx.fillRect(bx, by, 2, bh);
                sbCtx.fillStyle = '#444444';
                sbCtx.fillRect(bx, by + bh - 2, bw, 2);
                sbCtx.fillRect(bx + bw - 2, by, 2, bh);

                // Micro-cracks & weathering scars
                const cracks = 2 + Math.floor(Math.random() * 3);
                for (let k = 0; k < cracks; k++) {
                    const cx1 = bx + Math.random() * bw;
                    const cy1 = by + Math.random() * bh;
                    const len = 12 + Math.random() * 26;
                    const angle = Math.random() * Math.PI * 2;
                    const cx2 = cx1 + Math.cos(angle) * len;
                    const cy2 = cy1 + Math.sin(angle) * len;

                    sCtx.strokeStyle = '#050404';
                    sCtx.lineWidth = 1.2;
                    sCtx.beginPath();
                    sCtx.moveTo(cx1, cy1);
                    sCtx.lineTo(cx2, cy2);
                    sCtx.stroke();

                    sbCtx.strokeStyle = '#000000';
                    sbCtx.lineWidth = 1.4;
                    sbCtx.beginPath();
                    sbCtx.moveTo(cx1, cy1);
                    sbCtx.lineTo(cx2, cy2);
                    sbCtx.stroke();
                }

                // Damp surface noise / grit
                for (let g = 0; g < 18; g++) {
                    const gx = bx + Math.random() * bw;
                    const gy = by + Math.random() * bh;
                    sCtx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.06)';
                    sCtx.fillRect(gx, gy, 2, 2);
                }
            }
        }

        const stoneTexture = new THREE.CanvasTexture(stoneCanvas);
        stoneTexture.wrapS = THREE.RepeatWrapping;
        stoneTexture.wrapT = THREE.RepeatWrapping;
        stoneTexture.repeat.set(12, 12);

        const stoneBumpTexture = new THREE.CanvasTexture(stoneBumpCanvas);
        stoneBumpTexture.wrapS = THREE.RepeatWrapping;
        stoneBumpTexture.wrapT = THREE.RepeatWrapping;
        stoneBumpTexture.repeat.set(12, 12);

        const stoneRoughTexture = new THREE.CanvasTexture(stoneRoughCanvas);
        stoneRoughTexture.wrapS = THREE.RepeatWrapping;
        stoneRoughTexture.wrapT = THREE.RepeatWrapping;
        stoneRoughTexture.repeat.set(12, 12);

        this.stoneMat = new THREE.MeshStandardMaterial({
            map: stoneTexture,
            bumpMap: stoneBumpTexture,
            bumpScale: 0.08,
            roughnessMap: stoneRoughTexture,
            roughness: 0.75,
            metalness: 0.12
        });

        // 2. GOTHIC ASHLAR FORTRESS WALL (1024x1024)
        const wallCanvas = document.createElement('canvas');
        wallCanvas.width = 1024;
        wallCanvas.height = 1024;
        const wCtx = wallCanvas.getContext('2d');

        const wallBumpCanvas = document.createElement('canvas');
        wallBumpCanvas.width = 1024;
        wallBumpCanvas.height = 1024;
        const wbCtx = wallBumpCanvas.getContext('2d');

        // Dark fortress background
        wCtx.fillStyle = '#100e0e';
        wCtx.fillRect(0, 0, 1024, 1024);
        wbCtx.fillStyle = '#1a1a1a';
        wbCtx.fillRect(0, 0, 1024, 1024);

        const wRows = 16;
        const wCols = 8;
        const wrh = 1024 / wRows;
        const wcw = 1024 / wCols;

        for (let r = 0; r < wRows; r++) {
            const offset = (r % 2) * (wcw / 2);
            for (let c = -1; c <= wCols + 1; c++) {
                const x = c * wcw + offset + 2;
                const y = r * wrh + 2;
                const w = wcw - 4;
                const h = wrh - 4;

                const shade = 18 + Math.floor(Math.random() * 22);
                wCtx.fillStyle = `rgb(${shade}, ${shade - 1}, ${shade - 2})`;
                wCtx.fillRect(x, y, w, h);

                const wbVal = 180 + Math.floor(Math.random() * 45);
                wbCtx.fillStyle = `rgb(${wbVal}, ${wbVal}, ${wbVal})`;
                wbCtx.fillRect(x, y, w, h);

                // Horizontal masonry chisel striations
                for (let s = 4; s < h - 4; s += 8) {
                    wCtx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
                    wCtx.lineWidth = 1;
                    wCtx.beginPath();
                    wCtx.moveTo(x + 2, y + s);
                    wCtx.lineTo(x + w - 2, y + s + (Math.random() - 0.5) * 2);
                    wCtx.stroke();
                }

                // Wall block bevels
                wCtx.fillStyle = 'rgba(255, 255, 255, 0.07)';
                wCtx.fillRect(x, y, w, 2);
                wCtx.fillRect(x, y, 2, h);
                wCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                wCtx.fillRect(x, y + h - 2, w, 2);
                wCtx.fillRect(x + w - 2, y, 2, h);

                wbCtx.fillStyle = '#ffffff';
                wbCtx.fillRect(x, y, w, 2);
                wbCtx.fillRect(x, y, 2, h);
                wbCtx.fillStyle = '#333333';
                wbCtx.fillRect(x, y + h - 2, w, 2);
                wbCtx.fillRect(x + w - 2, y, 2, h);
            }
        }

        // Vertical rainwater seepage & grime streaks
        for (let i = 0; i < 40; i++) {
            const sx = Math.random() * 1024;
            const sy = Math.random() * 400;
            const slen = 150 + Math.random() * 400;
            const sgrad = wCtx.createLinearGradient(sx, sy, sx, sy + slen);
            sgrad.addColorStop(0, 'rgba(8, 12, 10, 0.65)');
            sgrad.addColorStop(1, 'rgba(8, 12, 10, 0)');
            wCtx.fillStyle = sgrad;
            wCtx.fillRect(sx - 3, sy, 6 + Math.random() * 6, slen);
        }

        const wallTex = new THREE.CanvasTexture(wallCanvas);
        wallTex.wrapS = THREE.RepeatWrapping;
        wallTex.wrapT = THREE.RepeatWrapping;
        wallTex.repeat.set(4, 4);

        const wallBumpTex = new THREE.CanvasTexture(wallBumpCanvas);
        wallBumpTex.wrapS = THREE.RepeatWrapping;
        wallBumpTex.wrapT = THREE.RepeatWrapping;
        wallBumpTex.repeat.set(4, 4);

        this.wallMat = new THREE.MeshStandardMaterial({
            map: wallTex,
            bumpMap: wallBumpTex,
            bumpScale: 0.1,
            roughness: 0.92,
            metalness: 0.12
        });

        // 3. BOSS ARENA SCORCHED & BLOODSTAINED STONE (1024x1024)
        const arenaCanvas = document.createElement('canvas');
        arenaCanvas.width = 1024;
        arenaCanvas.height = 1024;
        const aCtx = arenaCanvas.getContext('2d');

        const arenaBumpCanvas = document.createElement('canvas');
        arenaBumpCanvas.width = 1024;
        arenaBumpCanvas.height = 1024;
        const abCtx = arenaBumpCanvas.getContext('2d');

        const arenaEmissiveCanvas = document.createElement('canvas');
        arenaEmissiveCanvas.width = 1024;
        arenaEmissiveCanvas.height = 1024;
        const aeCtx = arenaEmissiveCanvas.getContext('2d');

        // Dark scorched arena base
        aCtx.fillStyle = '#141110';
        aCtx.fillRect(0, 0, 1024, 1024);
        abCtx.fillStyle = '#808080';
        abCtx.fillRect(0, 0, 1024, 1024);
        aeCtx.fillStyle = '#000000';
        aeCtx.fillRect(0, 0, 1024, 1024);

        // Circular burned epicenter
        const burnGrad = aCtx.createRadialGradient(512, 512, 40, 512, 512, 480);
        burnGrad.addColorStop(0, '#090706');
        burnGrad.addColorStop(0.5, '#120f0e');
        burnGrad.addColorStop(1, '#1c1816');
        aCtx.fillStyle = burnGrad;
        aCtx.fillRect(0, 0, 1024, 1024);

        // Ancient arena stone flagstone seams
        aCtx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        aCtx.lineWidth = 3;
        for (let x = 0; x <= 1024; x += 128) {
            aCtx.beginPath();
            aCtx.moveTo(x, 0);
            aCtx.lineTo(x, 1024);
            aCtx.stroke();
        }
        for (let y = 0; y <= 1024; y += 64) {
            aCtx.beginPath();
            aCtx.moveTo(0, y);
            aCtx.lineTo(1024, y);
            aCtx.stroke();
        }

        // Blood pools and splatters of fallen champions
        const bloodPools = [
            { x: 420, y: 480, r: 65 },
            { x: 620, y: 350, r: 50 },
            { x: 340, y: 720, r: 80 },
            { x: 740, y: 640, r: 45 },
            { x: 512, y: 512, r: 90 }
        ];

        bloodPools.forEach(bp => {
            const bGrad = aCtx.createRadialGradient(bp.x, bp.y, bp.r * 0.15, bp.x, bp.y, bp.r);
            bGrad.addColorStop(0, 'rgba(85, 12, 12, 0.85)');
            bGrad.addColorStop(0.6, 'rgba(55, 8, 8, 0.75)');
            bGrad.addColorStop(1, 'rgba(25, 4, 4, 0)');
            aCtx.fillStyle = bGrad;
            aCtx.beginPath();
            aCtx.arc(bp.x, bp.y, bp.r, 0, Math.PI * 2);
            aCtx.fill();

            // Splatter drops
            for (let d = 0; d < 22; d++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = bp.r + Math.random() * 45;
                const dx = bp.x + Math.cos(angle) * dist;
                const dy = bp.y + Math.sin(angle) * dist;
                aCtx.fillStyle = 'rgba(70, 10, 10, 0.7)';
                aCtx.beginPath();
                aCtx.arc(dx, dy, 1.5 + Math.random() * 3, 0, Math.PI * 2);
                aCtx.fill();
            }
        });

        // Glowing magma/ember fissures radiating across the arena
        for (let f = 0; f < 8; f++) {
            let cx = 512 + (Math.random() - 0.5) * 80;
            let cy = 512 + (Math.random() - 0.5) * 80;
            const angle = (f / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
            const len = 220 + Math.random() * 200;

            aeCtx.strokeStyle = '#ff4400';
            aeCtx.lineWidth = 2.5;
            aeCtx.beginPath();
            aeCtx.moveTo(cx, cy);

            aCtx.strokeStyle = '#220800';
            aCtx.lineWidth = 4;
            aCtx.beginPath();
            aCtx.moveTo(cx, cy);

            let curX = cx;
            let curY = cy;
            const steps = 8;
            for (let s = 1; s <= steps; s++) {
                const segLen = len / steps;
                curX += Math.cos(angle + (Math.random() - 0.5) * 0.8) * segLen;
                curY += Math.sin(angle + (Math.random() - 0.5) * 0.8) * segLen;
                aeCtx.lineTo(curX, curY);
                aCtx.lineTo(curX, curY);
            }
            aeCtx.stroke();
            aCtx.stroke();
        }

        const arenaTex = new THREE.CanvasTexture(arenaCanvas);
        arenaTex.wrapS = THREE.RepeatWrapping;
        arenaTex.wrapT = THREE.RepeatWrapping;
        arenaTex.repeat.set(4, 8);

        const arenaBumpTex = new THREE.CanvasTexture(arenaBumpCanvas);
        arenaBumpTex.wrapS = THREE.RepeatWrapping;
        arenaBumpTex.wrapT = THREE.RepeatWrapping;
        arenaBumpTex.repeat.set(4, 8);

        const arenaEmissiveTex = new THREE.CanvasTexture(arenaEmissiveCanvas);
        arenaEmissiveTex.wrapS = THREE.RepeatWrapping;
        arenaEmissiveTex.wrapT = THREE.RepeatWrapping;
        arenaEmissiveTex.repeat.set(4, 8);

        this.arenaMat = new THREE.MeshStandardMaterial({
            map: arenaTex,
            bumpMap: arenaBumpTex,
            bumpScale: 0.1,
            emissiveMap: arenaEmissiveTex,
            emissive: 0xff3300,
            emissiveIntensity: 0.4,
            roughness: 0.82,
            metalness: 0.15
        });

        // 4. WEATHERED MEDIEVAL TIMBER (512x512)
        const woodCanvas = document.createElement('canvas');
        woodCanvas.width = 512;
        woodCanvas.height = 512;
        const wdCtx = woodCanvas.getContext('2d');
        wdCtx.fillStyle = '#22150c';
        wdCtx.fillRect(0, 0, 512, 512);

        // Wood grain striations
        for (let i = 0; i < 512; i += 3) {
            const tone = 20 + Math.floor(Math.random() * 20);
            wdCtx.strokeStyle = `rgb(${tone + 12}, ${tone + 4}, ${tone})`;
            wdCtx.lineWidth = 1.5;
            wdCtx.beginPath();
            wdCtx.moveTo(0, i);
            wdCtx.bezierCurveTo(170, i + (Math.random() - 0.5) * 8, 340, i + (Math.random() - 0.5) * 8, 512, i);
            wdCtx.stroke();
        }

        // Iron bolt studs on timber
        for (let bx = 64; bx < 512; bx += 128) {
            for (let by = 64; by < 512; by += 128) {
                wdCtx.fillStyle = '#111010';
                wdCtx.beginPath();
                wdCtx.arc(bx, by, 6, 0, Math.PI * 2);
                wdCtx.fill();
                wdCtx.fillStyle = '#3a3530';
                wdCtx.beginPath();
                wdCtx.arc(bx - 1, by - 1, 3, 0, Math.PI * 2);
                wdCtx.fill();
            }
        }

        const woodTex = new THREE.CanvasTexture(woodCanvas);
        woodTex.wrapS = THREE.RepeatWrapping;
        woodTex.wrapT = THREE.RepeatWrapping;

        this.woodMat = new THREE.MeshStandardMaterial({
            map: woodTex,
            roughness: 0.78,
            metalness: 0.08
        });

        // 5. FORGED DARK IRON & SCONCE METAL (512x512)
        const ironCanvas = document.createElement('canvas');
        ironCanvas.width = 512;
        ironCanvas.height = 512;
        const irCtx = ironCanvas.getContext('2d');
        irCtx.fillStyle = '#222328';
        irCtx.fillRect(0, 0, 512, 512);

        // Brushed metallic scratches
        for (let i = 0; i < 300; i++) {
            const ix = Math.random() * 512;
            const iy = Math.random() * 512;
            const ilen = 10 + Math.random() * 30;
            irCtx.strokeStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.3)';
            irCtx.lineWidth = 1;
            irCtx.beginPath();
            irCtx.moveTo(ix, iy);
            irCtx.lineTo(ix + ilen, iy + (Math.random() - 0.5) * 4);
            irCtx.stroke();
        }

        const ironTex = new THREE.CanvasTexture(ironCanvas);
        this.ironMat = new THREE.MeshStandardMaterial({
            map: ironTex,
            roughness: 0.38,
            metalness: 0.88
        });
    }

    buildLighting() {
        // Dark moody ambient light
        const ambient = new THREE.AmbientLight(0x181c24, 0.45);
        this.scene.add(ambient);

        // Cold Lordran moonlight from above
        this.moonlight = new THREE.DirectionalLight(0x7c90aa, 0.7);
        this.moonlight.position.set(30, 45, 20);
        this.moonlight.castShadow = true;
        this.moonlight.shadow.mapSize.width = 2048;
        this.moonlight.shadow.mapSize.height = 2048;
        this.moonlight.shadow.camera.near = 0.5;
        this.moonlight.shadow.camera.far = 120;
        const d = 45;
        this.moonlight.shadow.camera.left = -d;
        this.moonlight.shadow.camera.right = d;
        this.moonlight.shadow.camera.top = d;
        this.moonlight.shadow.camera.bottom = -d;
        this.moonlight.shadow.bias = -0.0005;
        this.scene.add(this.moonlight);

        // World fog
        this.scene.fog = new THREE.FogExp2(0x0a0908, 0.024);
    }

    buildEnvironment() {
        // 1. Courtyard Floor (Starting area)
        const courtyardGeo = new THREE.PlaneGeometry(60, 60);
        const courtyard = new THREE.Mesh(courtyardGeo, this.stoneMat);
        courtyard.rotation.x = -Math.PI / 2;
        courtyard.receiveShadow = true;
        this.scene.add(courtyard);

        // Outer Courtyard Fortress Walls
        this.createWall(0, 5, -30, 60, 10, 2);  // North wall
        this.createWall(-30, 5, 0, 2, 10, 60);  // West wall
        this.createWall(30, 5, 0, 2, 10, 60);   // East wall
        this.createWall(-18, 5, 30, 24, 10, 2); // South wall left
        this.createWall(18, 5, 30, 24, 10, 2);  // South wall right
        // South opening (exit to Bridge/Boss Arena) is at x=[-6, 6], z=30

        // Gothic pillars in courtyard
        const pillarCoords = [
            [-12, -12], [12, -12],
            [-12, 12], [12, 12],
            [-20, -4], [20, -4],
            [-20, 20], [20, 20]
        ];
        pillarCoords.forEach(([px, pz]) => {
            this.createPillar(px, pz, 8);
        });

        // 2. High Castle Ramparts & Bridge leading to Boss
        // Bridge starts at z = 30 and extends to z = 95
        const bridgeGeo = new THREE.BoxGeometry(14, 2, 65);
        const bridgeMat = this.stoneMat.clone();
        bridgeMat.map = bridgeMat.map.clone();
        bridgeMat.map.repeat.set(4, 16);
        if (bridgeMat.bumpMap) {
            bridgeMat.bumpMap = bridgeMat.bumpMap.clone();
            bridgeMat.bumpMap.repeat.set(4, 16);
        }
        if (bridgeMat.roughnessMap) {
            bridgeMat.roughnessMap = bridgeMat.roughnessMap.clone();
            bridgeMat.roughnessMap.repeat.set(4, 16);
        }
        const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
        bridge.position.set(0, -1, 62.5);
        bridge.receiveShadow = true;
        this.scene.add(bridge);

        // Bridge Battlements / Parapets (prevent falling off)
        this.createWall(-7.5, 1.5, 62.5, 1, 3, 65); // Left rail
        this.createWall(7.5, 1.5, 62.5, 1, 3, 65);  // Right rail

        // Torches along the bridge
        [40, 55, 70, 85].forEach((tz) => {
            this.createTorch(-6.8, 2.5, tz);
            this.createTorch(6.8, 2.5, tz);
        });

        // 3. Boss Arena (Beyond Fog Gate at z = 95 to z = 160)
        const arenaGeo = new THREE.BoxGeometry(34, 2, 70);
        const arena = new THREE.Mesh(arenaGeo, this.arenaMat);
        arena.position.set(0, -1, 130);
        arena.receiveShadow = true;
        this.scene.add(arena);

        // Arena Boundaries
        this.createWall(-17.5, 5, 130, 1, 10, 70); // West
        this.createWall(17.5, 5, 130, 1, 10, 70);  // East
        this.createWall(0, 6, 165, 36, 12, 2);     // Far North end of bridge (locked gate)

        // Ruined Watchtowers in Boss Arena
        this.createTower(-14, 105);
        this.createTower(14, 105);
        this.createTower(-14, 155);
        this.createTower(14, 155);
    }

    createWall(x, y, z, w, h, d) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, this.wallMat);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        // Collider box
        this.colliders.push(new THREE.Box3().setFromObject(mesh));
    }

    createPillar(x, z, height = 8) {
        const pillarGroup = new THREE.Group();
        // Base
        const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 2.2), this.stoneMat);
        base.position.y = 0.4;
        pillarGroup.add(base);

        // Shaft
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, height, 12), this.wallMat);
        shaft.position.y = height / 2 + 0.4;
        shaft.castShadow = true;
        shaft.receiveShadow = true;
        pillarGroup.add(shaft);

        // Capital
        const cap = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 2.4), this.stoneMat);
        cap.position.y = height + 0.8;
        pillarGroup.add(cap);

        pillarGroup.position.set(x, 0, z);
        this.scene.add(pillarGroup);

        this.colliders.push(new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(x, height / 2, z),
            new THREE.Vector3(1.8, height, 1.8)
        ));
    }

    createTorch(x, y, z) {
        const sconce = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6), this.ironMat);
        sconce.position.set(x, y, z);
        this.scene.add(sconce);

        const flameLight = new THREE.PointLight(0xff7722, 1.8, 14, 1.8);
        flameLight.position.set(x, y + 0.7, z);
        this.scene.add(flameLight);

        // Animated flame particle
        const fMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 });
        const fMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18), fMat);
        fMesh.position.set(x, y + 0.7, z);
        this.scene.add(fMesh);

        this.particles.push({
            mesh: fMesh,
            light: flameLight,
            baseIntensity: 1.8,
            seed: Math.random() * 10
        });
    }

    createTower(x, z) {
        const towerGeo = new THREE.CylinderGeometry(3.5, 4, 18, 12);
        const tower = new THREE.Mesh(towerGeo, this.wallMat);
        tower.position.set(x, 8, z);
        tower.castShadow = true;
        tower.receiveShadow = true;
        this.scene.add(tower);

        this.colliders.push(new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(x, 8, z),
            new THREE.Vector3(7, 18, 7)
        ));
    }

    // ----------------------------------------------------
    // THE BONFIRE (SWORD THRUST INTO ASHES)
    // ----------------------------------------------------
    buildBonfire() {
        const bonfireGroup = new THREE.Group();

        // 1. Ash & charred bone mound
        const ashGeo = new THREE.ConeGeometry(2.4, 0.8, 16);
        const ashMat = new THREE.MeshStandardMaterial({
            color: 0x141212,
            roughness: 0.98,
            metalness: 0.05
        });
        const ashMound = new THREE.Mesh(ashGeo, ashMat);
        ashMound.position.y = 0.4;
        ashMound.receiveShadow = true;
        bonfireGroup.add(ashMound);

        // Surrounding charred stone circle
        const ringGeo = new THREE.TorusGeometry(2.6, 0.35, 8, 18);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x1a1614, roughness: 0.9 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.15;
        bonfireGroup.add(ring);

        // 2. The Coiled Sword (Dark Souls signature twisted blade)
        const swordGroup = new THREE.Group();

        // Twisted blade
        const bladeGeo = new THREE.CylinderGeometry(0.08, 0.16, 2.8, 8);
        const bladeMat = new THREE.MeshStandardMaterial({
            color: 0x4a4440,
            roughness: 0.4,
            metalness: 0.85,
            emissive: 0x331100,
            emissiveIntensity: 0.6
        });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.y = 1.4;
        swordGroup.add(blade);

        // Crossguard
        const guardGeo = new THREE.BoxGeometry(0.8, 0.12, 0.2);
        const guardMat = new THREE.MeshStandardMaterial({ color: 0x332a22, metalness: 0.9, roughness: 0.3 });
        const guard = new THREE.Mesh(guardGeo, guardMat);
        guard.position.y = 2.8;
        swordGroup.add(guard);

        // Grip & Pommel
        const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8), this.woodMat);
        hilt.position.y = 3.1;
        swordGroup.add(hilt);

        const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), guardMat);
        pommel.position.y = 3.45;
        swordGroup.add(pommel);

        // Tilt sword slightly like in Dark Souls
        swordGroup.rotation.z = 0.12;
        swordGroup.rotation.x = -0.08;
        bonfireGroup.add(swordGroup);

        // 3. Dynamic Flame & Fire Particles
        const flameCore = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.45),
            new THREE.MeshBasicMaterial({ color: 0xff6600 })
        );
        flameCore.position.y = 0.9;
        bonfireGroup.add(flameCore);
        this.bonfireCore = flameCore;

        // Bonfire Point Light
        this.bonfireLight = new THREE.PointLight(0xff6611, 2.8, 22, 1.6);
        this.bonfireLight.position.set(0, 1.4, 0);
        this.bonfireLight.castShadow = true;
        this.bonfireLight.shadow.bias = -0.002;
        bonfireGroup.add(this.bonfireLight);

        // Position Bonfire at center of Courtyard
        bonfireGroup.position.set(0, 0, 0);
        this.scene.add(bonfireGroup);
        this.bonfireGroup = bonfireGroup;

        // Register interactable
        this.interactables.push({
            type: 'bonfire',
            position: new THREE.Vector3(0, 0, 0),
            radius: 3.5,
            prompt: '[ E ] REST AT BONFIRE'
        });
    }

    // ----------------------------------------------------
    // THE FOG GATE
    // ----------------------------------------------------
    buildFogGate() {
        const fogGroup = new THREE.Group();

        // Stone Archway Frame at bridge exit into Boss Arena (z = 95)
        const frameMat = this.stoneMat;
        const leftPost = new THREE.Mesh(new THREE.BoxGeometry(2.5, 9, 2), frameMat);
        leftPost.position.set(-5.5, 4.5, 0);
        fogGroup.add(leftPost);

        const rightPost = new THREE.Mesh(new THREE.BoxGeometry(2.5, 9, 2), frameMat);
        rightPost.position.set(5.5, 4.5, 0);
        fogGroup.add(rightPost);

        const lintel = new THREE.Mesh(new THREE.BoxGeometry(13.5, 2.5, 2.5), frameMat);
        lintel.position.set(0, 9.5, 0);
        fogGroup.add(lintel);

        // Swirling white mist plane
        const fogGeo = new THREE.PlaneGeometry(9, 8.5, 16, 16);
        const fogMat = new THREE.MeshBasicMaterial({
            color: 0xccddee,
            transparent: true,
            opacity: 0.75,
            side: THREE.DoubleSide
        });
        const fogMesh = new THREE.Mesh(fogGeo, fogMat);
        fogMesh.position.set(0, 4.25, 0);
        fogGroup.add(fogMesh);
        this.fogGateMesh = fogMesh;

        fogGroup.position.set(0, 0, 95);
        this.scene.add(fogGroup);
        this.fogGateGroup = fogGroup;

        // Fog Gate Collision wall before traversing
        this.fogGateCollider = new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(0, 4.5, 95),
            new THREE.Vector3(12, 9, 2)
        );
        this.colliders.push(this.fogGateCollider);

        // Register interactable
        this.interactables.push({
            type: 'fog_gate',
            position: new THREE.Vector3(0, 1, 93),
            radius: 3.8,
            prompt: '[ E ] TRAVERSE THROUGH THE WHITE LIGHT'
        });
    }

    traverseFogGate() {
        this.fogTraversed = true;
        // Dissolve fog gate
        if (this.fogGateMesh) {
            let opacity = 0.75;
            const fade = setInterval(() => {
                opacity -= 0.05;
                if (opacity <= 0.05) {
                    this.fogGateMesh.visible = false;
                    clearInterval(fade);
                } else {
                    this.fogGateMesh.material.opacity = opacity;
                }
            }, 50);
        }

        // Remove collider
        const idx = this.colliders.indexOf(this.fogGateCollider);
        if (idx !== -1) this.colliders.splice(idx, 1);
    }

    // ----------------------------------------------------
    // ATMOSPHERE: 1,000 FLOATING EMBERS & SPARKLES
    // ----------------------------------------------------
    buildAtmosphere() {
        const count = 900;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 1] = Math.random() * 25;
            positions[i * 3 + 2] = -25 + Math.random() * 180;

            velocities[i * 3] = (Math.random() - 0.5) * 0.4;
            velocities[i * 3 + 1] = 0.3 + Math.random() * 0.8; // Floating upwards
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.emberVelocities = velocities;

        const mat = new THREE.PointsMaterial({
            color: 0xff7722,
            size: 0.22,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.emberParticles = new THREE.Points(geo, mat);
        this.scene.add(this.emberParticles);
    }

    // ----------------------------------------------------
    // HIT / IMPACT PARTICLES
    // ----------------------------------------------------
    spawnHitSparks(pos, isCrit = false) {
        const count = isCrit ? 28 : 14;
        const color = isCrit ? 0xff2200 : 0xffcc33;
        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(
                new THREE.DodecahedronGeometry(isCrit ? 0.08 : 0.05),
                new THREE.MeshBasicMaterial({ color: color })
            );
            mesh.position.copy(pos);
            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                Math.random() * 6 + 1,
                (Math.random() - 0.5) * 8
            );
            this.scene.add(mesh);
            this.sparkParticles.push({ mesh, vel, life: 0.4, maxLife: 0.4 });
        }
    }

    spawnBlood(pos) {
        const count = 16;
        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.06),
                new THREE.MeshBasicMaterial({ color: 0x880000 })
            );
            mesh.position.copy(pos);
            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                Math.random() * 4,
                (Math.random() - 0.5) * 5
            );
            this.scene.add(mesh);
            this.bloodParticles.push({ mesh, vel, life: 0.6, maxLife: 0.6 });
        }
    }

    spawnEstusParticles(pos) {
        for (let i = 0; i < 24; i++) {
            const mesh = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.08),
                new THREE.MeshBasicMaterial({ color: 0xffbb00 })
            );
            mesh.position.set(
                pos.x + (Math.random() - 0.5) * 1.5,
                pos.y + Math.random() * 0.5,
                pos.z + (Math.random() - 0.5) * 1.5
            );
            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 0.6,
                Math.random() * 3 + 1, // rise up
                (Math.random() - 0.5) * 0.6
            );
            this.scene.add(mesh);
            this.sparkParticles.push({ mesh, vel, life: 0.8, maxLife: 0.8 });
        }
    }

    // ----------------------------------------------------
    // UPDATE TICK
    // ----------------------------------------------------
    update(delta) {
        const time = this.clock.getElapsedTime();

        // 1. Bonfire flame flicker
        if (this.bonfireLight) {
            this.bonfireLight.intensity = 2.4 + Math.sin(time * 12) * 0.4 + Math.cos(time * 23) * 0.2;
            if (this.bonfireCore) {
                const s = 1.0 + Math.sin(time * 15) * 0.15;
                this.bonfireCore.scale.set(s, s * 1.2, s);
            }
        }

        // 2. Torch lights flicker
        this.particles.forEach(p => {
            if (p.light) {
                p.light.intensity = p.baseIntensity + Math.sin(time * 8 + p.seed) * 0.3;
            }
        });

        // 3. Fog Gate ripple
        if (this.fogGateMesh && !this.fogTraversed) {
            this.fogGateMesh.material.opacity = 0.65 + Math.sin(time * 3) * 0.15;
        }

        // 4. Floating embers update
        if (this.emberParticles) {
            const posAttr = this.emberParticles.geometry.attributes.position;
            const arr = posAttr.array;
            const count = arr.length / 3;
            for (let i = 0; i < count; i++) {
                arr[i * 3] += this.emberVelocities[i * 3] * delta;
                arr[i * 3 + 1] += this.emberVelocities[i * 3 + 1] * delta;
                arr[i * 3 + 2] += this.emberVelocities[i * 3 + 2] * delta;

                // Reset when floating too high
                if (arr[i * 3 + 1] > 26) {
                    arr[i * 3 + 1] = 0.5;
                }
            }
            posAttr.needsUpdate = true;
        }

        // 5. Sparks update
        for (let i = this.sparkParticles.length - 1; i >= 0; i--) {
            const p = this.sparkParticles[i];
            p.life -= delta;
            p.mesh.position.addScaledVector(p.vel, delta);
            p.vel.y -= 9.8 * delta; // Gravity
            const scale = p.life / p.maxLife;
            p.mesh.scale.set(scale, scale, scale);

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.sparkParticles.splice(i, 1);
            }
        }

        // 6. Blood update
        for (let i = this.bloodParticles.length - 1; i >= 0; i--) {
            const p = this.bloodParticles[i];
            p.life -= delta;
            p.mesh.position.addScaledVector(p.vel, delta);
            p.vel.y -= 14 * delta; // Heavy blood gravity
            if (p.mesh.position.y < 0.05) {
                p.mesh.position.y = 0.05;
                p.vel.set(0, 0, 0);
            }
            const scale = p.life / p.maxLife;
            p.mesh.scale.set(scale, scale * 0.5, scale);

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.bloodParticles.splice(i, 1);
            }
        }
    }

    spawnFlameBreath(origin, dir) {
        for (let i = 0; i < 18; i++) {
            const colors = [0xff4400, 0xff7700, 0xffbb00, 0xee2200];
            const col = colors[Math.floor(Math.random() * colors.length)];
            const mesh = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.14),
                new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85 })
            );
            mesh.position.set(
                origin.x + (Math.random() - 0.5) * 0.4,
                origin.y + (Math.random() - 0.5) * 0.4,
                origin.z + (Math.random() - 0.5) * 0.4
            );
            const spread = 0.35;
            const vel = new THREE.Vector3(
                dir.x * 12 + (Math.random() - 0.5) * 12 * spread,
                dir.y * 12 + (Math.random() - 0.5) * 3,
                dir.z * 12 + (Math.random() - 0.5) * 12 * spread
            );
            this.scene.add(mesh);
            this.sparkParticles.push({
                mesh,
                vel,
                life: 0.5 + Math.random() * 0.3,
                maxLife: 0.8
            });
        }
    }

    spawnSunlightBurst(pos) {
        // 360 degree golden flame shockwave ring
        const count = 36;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const mesh = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.22),
                new THREE.MeshBasicMaterial({ color: 0xffd244, transparent: true, opacity: 0.9 })
            );
            mesh.position.set(pos.x, pos.y + 0.5, pos.z);
            const speed = 9.0;
            const vel = new THREE.Vector3(
                Math.sin(angle) * speed,
                0.4 + Math.random() * 1.5,
                Math.cos(angle) * speed
            );
            this.scene.add(mesh);
            this.sparkParticles.push({
                mesh,
                vel,
                life: 0.6,
                maxLife: 0.6
            });
        }
    }
}
