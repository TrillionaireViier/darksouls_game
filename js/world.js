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
        this.buildMerchant();
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
        sCtx.fillStyle = '#3a3430';
        sCtx.fillRect(0, 0, 1024, 1024);
        sbCtx.fillStyle = '#202020'; // Recessed mortar
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

                // High-visibility bright weathered Lordran stone palette
                const palSeed = Math.random();
                let baseR, baseG, baseB;
                if (palSeed < 0.35) {
                    baseR = 130 + Math.floor(Math.random() * 26); // Slate grey granite
                    baseG = 135 + Math.floor(Math.random() * 26);
                    baseB = 142 + Math.floor(Math.random() * 26);
                } else if (palSeed < 0.7) {
                    baseR = 145 + Math.floor(Math.random() * 26); // Warm Lordran limestone
                    baseG = 138 + Math.floor(Math.random() * 24);
                    baseB = 126 + Math.floor(Math.random() * 22);
                } else {
                    baseR = 118 + Math.floor(Math.random() * 24); // Weathered ashlar stone
                    baseG = 120 + Math.floor(Math.random() * 24);
                    baseB = 124 + Math.floor(Math.random() * 24);
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
        wCtx.fillStyle = '#3c3630';
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

                const shade = 135 + Math.floor(Math.random() * 30);
                wCtx.fillStyle = `rgb(${shade + 6}, ${shade + 2}, ${shade})`;
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

        // Scorched arena base
        aCtx.fillStyle = '#64564c';
        aCtx.fillRect(0, 0, 1024, 1024);
        abCtx.fillStyle = '#808080';
        abCtx.fillRect(0, 0, 1024, 1024);
        aeCtx.fillStyle = '#000000';
        aeCtx.fillRect(0, 0, 1024, 1024);

        // Circular burned epicenter
        const burnGrad = aCtx.createRadialGradient(512, 512, 40, 512, 512, 480);
        burnGrad.addColorStop(0, '#382e28');
        burnGrad.addColorStop(0.5, '#50443c');
        burnGrad.addColorStop(1, '#685a50');
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
        // 1. Celestial Lordran Twilight Sky Background (Eliminates pitch-black void)
        this.scene.background = new THREE.Color(0x324660);

        // 2. Linear distance atmospheric fog (Pushed far back: 100% crisp visibility up to 95m)
        this.scene.fog = new THREE.Fog(0x324660, 95, 420);

        // 3. Radiant High-Visibility Ambient Fill (Ensures no surface is ever pitch black)
        this.ambientLight = new THREE.AmbientLight(0xdce8f8, 1.9);
        this.scene.add(this.ambientLight);

        // 4. Sky and ground bounce lighting for crisp 3D depth and volume
        this.hemiLight = new THREE.HemisphereLight(0xeaf4ff, 0x9c8c7c, 1.7);
        this.scene.add(this.hemiLight);

        // 5. Radiant Lordran Sunlight / Moonlight from above
        this.moonlight = new THREE.DirectionalLight(0xfff5e4, 2.6);
        this.moonlight.position.set(40, 75, 30);
        this.moonlight.castShadow = true;
        this.moonlight.shadow.mapSize.width = 2048;
        this.moonlight.shadow.mapSize.height = 2048;
        this.moonlight.shadow.camera.near = 0.5;
        this.moonlight.shadow.camera.far = 320;
        const d = 85;
        this.moonlight.shadow.camera.left = -d;
        this.moonlight.shadow.camera.right = d;
        this.moonlight.shadow.camera.top = d;
        this.moonlight.shadow.camera.bottom = -d;
        this.moonlight.shadow.bias = -0.0003;
        this.scene.add(this.moonlight);

        // 6. Glowing Celestial Moon/Sun Orb in the Sky
        const moonGeo = new THREE.SphereGeometry(6, 16, 16);
        const moonMat = new THREE.MeshBasicMaterial({ color: 0xfffaea });
        const moon = new THREE.Mesh(moonGeo, moonMat);
        moon.position.set(70, 120, 60);
        this.scene.add(moon);

        // Luminous celestial aura ring
        const moonAuraGeo = new THREE.RingGeometry(6.2, 13.0, 32);
        const moonAuraMat = new THREE.MeshBasicMaterial({
            color: 0xffeedd,
            transparent: true,
            opacity: 0.38,
            side: THREE.DoubleSide
        });
        const moonAura = new THREE.Mesh(moonAuraGeo, moonAuraMat);
        moonAura.position.copy(moon.position);
        moonAura.lookAt(0, 0, 0);
        this.scene.add(moonAura);

        // Perimeter courtyard torches for clear visibility across starting zone
        const courtyardTorches = [
            // North perimeter wall
            [-26, 3.5, -28], [-13, 3.5, -28], [0, 3.5, -28], [13, 3.5, -28], [26, 3.5, -28],
            // West wall
            [-28, 3.5, -14], [-28, 3.5, 0], [-28, 3.5, 14],
            // East wall
            [28, 3.5, -14], [28, 3.5, 0], [28, 3.5, 14],
            // South wall flanking bridge arch
            [-12, 3.5, 28], [12, 3.5, 28]
        ];
        courtyardTorches.forEach(([tx, ty, tz]) => {
            this.createTorch(tx, ty, tz, { intensity: 2.8, radius: 22 });
        });

        // Standing Iron Braziers flanking the Bonfire in central courtyard
        this.createStandingBrazier(-3.6, 0, 0, 0xff7722, 3.8, 26);
        this.createStandingBrazier(3.6, 0, 0, 0xff7722, 3.8, 26);

        // Interactive unlit torches near courtyard gate (ignitable with [E] for +50 Souls)
        this.createTorch(-6.5, 2.5, 25, { interactive: true, isLit: false });
        this.createTorch(6.5, 2.5, 25, { interactive: true, isLit: false });
    }

    getGroundHeight(x, z) {
        // 1. East Upper Ramparts & Stairs
        // Ascending Stairs from Courtyard (z in [4, 22], x in [15, 25])
        if (x >= 15 && x <= 25 && z >= 4 && z <= 22) {
            const t = (z - 4) / 18;
            return t * 6.0;
        }
        // High Ramparts Battlement Walkway (z in [22, 91], x in [15, 25])
        if (x >= 15 && x <= 25 && z > 22 && z <= 91) {
            return 6.0;
        }
        // Watchtower & Descent Ramp to Fog Gate (z in [91, 96], x in [13, 25])
        if (x >= 13 && x <= 25 && z > 91 && z <= 96) {
            const t = (96 - z) / 5;
            return Math.max(0, t * 6.0);
        }

        // 2. West Lower Flooded Catacombs & Stairs
        // Descending Sunken Stairs from Courtyard (z in [4, 22], x in [-25, -15])
        if (x >= -25 && x <= -15 && z >= 4 && z <= 22) {
            const t = (z - 4) / 18;
            return -t * 5.0;
        }
        // Flooded Subterranean Catacombs (z in [22, 90], x in [-25, -15])
        if (x >= -25 && x <= -15 && z > 22 && z <= 90) {
            return -5.0;
        }
        // Crypt Exit Ascent Stairs to Fog Gate (z in [90, 96], x in [-25, -13])
        if (x >= -25 && x <= -13 && z > 90 && z <= 96) {
            const t = (z - 90) / 6;
            return -5.0 + t * 5.0;
        }

        // 3. Central Bridge (z in [28, 96], x in [-8, 8])
        if (x >= -8 && x <= 8 && z >= 28 && z <= 96) {
            return 0.0;
        }

        // 4. Boss Arena (z in [95, 170], x in [-18, 18])
        if (x >= -18 && x <= 18 && z >= 95 && z <= 170) {
            return 0.0;
        }

        // 5. Courtyard (z in [-30, 30], x in [-30, 30])
        if (x >= -30 && x <= 30 && z >= -30 && z <= 30) {
            return 0.0;
        }

        // Default level ground
        return 0.0;
    }

    buildEnvironment() {
        // 1. Courtyard Floor (Starting area)
        const courtyardGeo = new THREE.PlaneGeometry(60, 60);
        const courtyard = new THREE.Mesh(courtyardGeo, this.stoneMat);
        courtyard.rotation.x = -Math.PI / 2;
        courtyard.receiveShadow = true;
        this.scene.add(courtyard);

        // Outer Courtyard Fortress Walls with Openings for East/West Paths
        this.createWall(0, 5, -30, 60, 10, 2);   // North wall
        this.createWall(-30, 5, 0, 2, 10, 60);   // West wall
        this.createWall(30, 5, 0, 2, 10, 60);    // East wall

        // South Wall Openings (Central Bridge opening x=[-6, 6])
        // West South Wall (leaves archway open for Catacombs Descent at x=[-25, -15])
        this.createWall(-10.5, 5, 30, 9, 10, 2);
        this.createWall(-27.5, 5, 30, 5, 10, 2);
        this.createWall(-20, 6.5, 30, 10, 7, 2); // Overhead lintel above sunken stairs

        // East South Wall (leaves archway open for High Ramparts Walkway at x=[15, 25])
        this.createWall(10.5, 5, 30, 9, 10, 2);
        this.createWall(27.5, 5, 30, 5, 10, 2);
        this.createWall(20, 11, 30, 10, 2, 2);  // Overhead lintel above ramparts walkway

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

        // ----------------------------------------------------
        // PATH 1: THE HIGH CASTLE RAMPARTS (UP: Y = 6.0)
        // Grand Stone Staircase, Battlements, Overlooks, Watchtower
        // ----------------------------------------------------
        // East Ascending Staircase (18 Stone Steps from z=4 to z=22 climbing to y=6.0)
        for (let i = 0; i < 18; i++) {
            const stepZ = 4.5 + i * 1.0;
            const stepH = (i + 1) * (6.0 / 18);
            const stepGeo = new THREE.BoxGeometry(8, stepH, 1.05);
            const stepMesh = new THREE.Mesh(stepGeo, this.stoneMat);
            stepMesh.position.set(20, stepH / 2, stepZ);
            stepMesh.receiveShadow = true;
            stepMesh.castShadow = true;
            this.scene.add(stepMesh);
        }

        // Stair Balustrade Posts & Golden Sconces
        for (let i = 0; i < 18; i += 4) {
            const sz = 4.5 + i * 1.0;
            const sh = (i + 1) * (6.0 / 18);
            const postL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), this.stoneMat);
            postL.position.set(15.75, sh + 0.6, sz);
            this.scene.add(postL);
            const postR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), this.stoneMat);
            postR.position.set(24.25, sh + 0.6, sz);
            this.scene.add(postR);

            if (i === 0 || i === 16) {
                this.createGoldenBrazier(15.75, sh + 1.2, sz);
                this.createGoldenBrazier(24.25, sh + 1.2, sz);
            }
        }

        // Upper Ramparts Walkway Elevated Floor Slab (z=22 to z=91 at y=5.5)
        const rampartFloorGeo = new THREE.BoxGeometry(9, 1.0, 69);
        const rampartFloor = new THREE.Mesh(rampartFloorGeo, this.stoneMat);
        rampartFloor.position.set(20, 5.5, 56.5);
        rampartFloor.receiveShadow = true;
        this.scene.add(rampartFloor);

        // Outer Fortress Wall with Crenellations (x=24.6, y=6.0 to 10.0)
        this.createWall(24.6, 8.0, 56.5, 1.2, 4.0, 69);
        for (let cz = 24; cz <= 88; cz += 4) {
            const cren = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 2.0), this.wallMat);
            cren.position.set(24.6, 10.5, cz);
            cren.castShadow = true;
            this.scene.add(cren);
        }

        // Inner Overlook Railing facing Bridge below (x=15.4, y=6.8)
        // With intentional drop-off gaps at z=[44, 52] and z=[70, 78] for plunging attacks!
        this.createWall(15.4, 6.8, 33, 0.8, 1.6, 22); // Segment 1: z=22 to 44
        this.createWall(15.4, 6.8, 61, 0.8, 1.6, 18); // Segment 2: z=52 to 70
        this.createWall(15.4, 6.8, 84.5, 0.8, 1.6, 13); // Segment 3: z=78 to 91

        // Golden Torches along the Upper Ramparts
        [26, 38, 50, 62, 74, 86].forEach((tz) => {
            this.createGoldenTorch(24.0, 8.2, tz);
        });

        // High Watchtower Bastion at z=92 overlooking Boss Arena & Fog Gate
        const bastionGeo = new THREE.CylinderGeometry(4.2, 4.5, 9, 12);
        const bastion = new THREE.Mesh(bastionGeo, this.wallMat);
        bastion.position.set(20, 8.5, 92);
        bastion.castShadow = true;
        bastion.receiveShadow = true;
        this.scene.add(bastion);
        this.colliders.push(new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(20, 8.5, 92),
            new THREE.Vector3(8.5, 9, 8.5)
        ));

        // Golden Brazier beacon on top of the Bastion
        this.createGoldenBrazier(20, 13.2, 92, 2.8);

        // Grand Descent Stone Staircase from Watchtower (z=91 to z=96) down to Fog Gate Plaza (y=0)
        for (let i = 0; i < 8; i++) {
            const stepZ = 91.5 + i * 0.65;
            const stepH = (8 - i) * (6.0 / 8);
            const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(6, stepH, 0.7), this.stoneMat);
            stepMesh.position.set(16, stepH / 2, stepZ);
            stepMesh.receiveShadow = true;
            this.scene.add(stepMesh);
        }

        // ----------------------------------------------------
        // PATH 2: ROYAL PROCESSION BRIDGE (MAIN: Y = 0.0)
        // ----------------------------------------------------
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

        // Torches along both parapets of the Royal Bridge (16 Wall Sconces)
        [32, 40, 48, 56, 64, 72, 80, 88].forEach((tz) => {
            this.createTorch(-6.8, 2.8, tz, { intensity: 2.8, radius: 20 });
            this.createTorch(6.8, 2.8, tz, { intensity: 2.8, radius: 20 });
        });

        // Grand Standing Braziers at Bridge Portal (South & North)
        this.createStandingBrazier(-5.2, 0, 30, 0xff7722, 3.8, 28);
        this.createStandingBrazier(5.2, 0, 30, 0xff7722, 3.8, 28);
        this.createStandingBrazier(-5.2, 0, 93, 0xffaa33, 4.0, 30);
        this.createStandingBrazier(5.2, 0, 93, 0xffaa33, 4.0, 30);

        // ----------------------------------------------------
        // PATH 3: FLOODED SUBTERRANEAN CATACOMBS (DOWN: Y = -5.0)
        // Sunken Stone Steps, Flooded Corridor, Crypt Arches, Teal Ghostfire
        // ----------------------------------------------------
        // West Sunken Staircase (18 Stone Steps descending from y=0 to y=-5.0, z=4 to z=22)
        for (let i = 0; i < 18; i++) {
            const stepZ = 4.5 + i * 1.0;
            const stepDepth = (i + 1) * (5.0 / 18);
            const stepGeo = new THREE.BoxGeometry(8, 0.45, 1.05);
            const stepMesh = new THREE.Mesh(stepGeo, this.stoneMat);
            stepMesh.position.set(-20, -stepDepth + 0.22, stepZ);
            stepMesh.receiveShadow = true;
            this.scene.add(stepMesh);
        }

        // Catacombs Entrance Crypt Gateway Arch at z=4
        const archL = new THREE.Mesh(new THREE.BoxGeometry(1.4, 7, 1.4), this.wallMat);
        archL.position.set(-24.5, 3.5, 4);
        this.scene.add(archL);
        const archR = new THREE.Mesh(new THREE.BoxGeometry(1.4, 7, 1.4), this.wallMat);
        archR.position.set(-15.5, 3.5, 4);
        this.scene.add(archR);
        const archTop = new THREE.Mesh(new THREE.BoxGeometry(10.4, 1.6, 1.6), this.wallMat);
        archTop.position.set(-20, 7.5, 4);
        this.scene.add(archTop);

        // Flooded Crypt Corridor Floor Slab (y=-5.5, z=22 to z=90)
        const cryptFloorGeo = new THREE.BoxGeometry(9, 1.0, 68);
        const cryptFloor = new THREE.Mesh(cryptFloorGeo, this.stoneMat);
        cryptFloor.position.set(-20, -5.5, 56);
        cryptFloor.receiveShadow = true;
        this.scene.add(cryptFloor);

        // Shallow Flooded Murky Water Plane (y=-4.92)
        const waterGeo = new THREE.PlaneGeometry(8.6, 67);
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x0a2624,
            roughness: 0.15,
            metalness: 0.55,
            transparent: true,
            opacity: 0.82
        });
        const waterPlane = new THREE.Mesh(waterGeo, waterMat);
        waterPlane.rotation.x = -Math.PI / 2;
        waterPlane.position.set(-20, -4.92, 56);
        waterPlane.receiveShadow = true;
        this.scene.add(waterPlane);

        // Crypt Side Fortress Walls
        this.createWall(-24.6, -2.0, 56, 1.2, 6.5, 68); // West Crypt Wall
        this.createWall(-15.4, -2.0, 56, 1.2, 6.5, 68); // East Crypt Wall

        // Overhead Vaulted Stone Arches along the Crypt
        [32, 44, 56, 68, 80].forEach((az) => {
            const cryptArch = new THREE.Mesh(new THREE.BoxGeometry(8.8, 1.2, 1.2), this.wallMat);
            cryptArch.position.set(-20, 0.8, az);
            cryptArch.castShadow = true;
            this.scene.add(cryptArch);

            // Teal Ghostfire Lantern hanging from arch
            this.createTealBrazier(-20, -0.6, az);
        });

        // Crypt Corridor Sconces & Atmospheric Lighting
        [28, 38, 48, 58, 68, 78, 86].forEach((cz, idx) => {
            const isGhostfire = idx % 2 === 1;
            const torchColor = isGhostfire ? 0x00ffcc : 0xff8833;
            this.createTorch(-24.0, -2.8, cz, { color: torchColor, intensity: 2.6, radius: 18 });
            this.createTorch(-16.0, -2.8, cz, { color: torchColor, intensity: 2.6, radius: 18 });
        });

        // Interactive unlit torches in crypt alcoves
        this.createTorch(-23.8, -2.8, 52, { interactive: true, isLit: false, color: 0x00ffcc });
        this.createTorch(-16.2, -2.8, 66, { interactive: true, isLit: false, color: 0xff8833 });

        // Ancient Carved Stone Sarcophagi in Crypt Alcoves
        [36, 50, 64, 76].forEach((sz, idx) => {
            const sarcX = (idx % 2 === 0) ? -23.2 : -16.8;
            const sarcGeo = new THREE.BoxGeometry(1.4, 0.9, 3.2);
            const sarcMesh = new THREE.Mesh(sarcGeo, this.stoneMat);
            sarcMesh.position.set(sarcX, -4.45, sz);
            sarcMesh.castShadow = true;
            sarcMesh.receiveShadow = true;
            this.scene.add(sarcMesh);
            this.colliders.push(new THREE.Box3().setFromObject(sarcMesh));
        });

        // Crypt Ascent Shortcut Stairs emerging right beside the Fog Gate (z=90 to z=96 climbing to y=0)
        for (let i = 0; i < 8; i++) {
            const stepZ = 90.5 + i * 0.7;
            const stepH = (i + 1) * (5.0 / 8);
            const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(6, stepH, 0.75), this.stoneMat);
            stepMesh.position.set(-18, -5.0 + stepH / 2, stepZ);
            stepMesh.receiveShadow = true;
            this.scene.add(stepMesh);
        }

        // ----------------------------------------------------
        // DRAMATIC ILLUMINATED PATH BEACONS ("ADD LIGHTS MAKE IT SEEN")
        // Luminous Sky Beacons, Overhead Banners & Path Color Themes
        // ----------------------------------------------------
        // 1. East Path Beacon: Golden Beam & High Ramparts Banner (UP)
        this.createPathBeacon(20, 0, 3, 0xffbb33, "▲ UPPER RAMPARTS [UP]", "+6m ELEVATION • ARCHER BATTLEMENTS", "#ffd700");

        // 2. West Path Beacon: Emerald Ghostfire Beam & Catacombs Banner (DOWN)
        this.createPathBeacon(-20, 0, 3, 0x00ffaa, "▼ FLOODED CATACOMBS [DOWN]", "-5m SUBTERRANEAN • CRYPT SHORTCUT", "#00ffcc");

        // 3. Central Path Beacon: Fiery Orange Torches & Royal Bridge Banner (MAIN)
        this.createPathBeacon(0, 0, 29, 0xff7722, "⚔️ ROYAL BRIDGE [MAIN]", "LEVEL 0m • DIRECT FOG GATE PATH", "#ff9933");

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

        // Roaring Braziers atop the 4 Arena Watchtowers (High Atmospheric Illumination)
        this.createStandingBrazier(-14, 17.5, 105, 0xff7722, 4.6, 35);
        this.createStandingBrazier(14, 17.5, 105, 0xff7722, 4.6, 35);
        this.createStandingBrazier(-14, 17.5, 155, 0xff7722, 4.6, 35);
        this.createStandingBrazier(14, 17.5, 155, 0xff7722, 4.6, 35);

        // Perimeter Wall Torches along Boss Arena East & West Walls (18 Sconces)
        [102, 110, 118, 126, 134, 142, 150, 158].forEach((az) => {
            this.createTorch(-16.8, 4.2, az, { intensity: 3.0, radius: 24, color: 0xff8833 });
            this.createTorch(16.8, 4.2, az, { intensity: 3.0, radius: 24, color: 0xff8833 });
        });

        // Northern Throne Gate Braziers (at far end of Arena)
        this.createStandingBrazier(-5.5, 0, 163, 0xffaa33, 4.0, 28);
        this.createStandingBrazier(5.5, 0, 163, 0xffaa33, 4.0, 28);
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

    createPathBeacon(x, y, z, colorHex, title, desc, titleColor) {
        const beaconGroup = new THREE.Group();

        // 1. Towering vertical light beam reaching 36m into the sky
        const beamGeo = new THREE.CylinderGeometry(0.55, 1.4, 36, 16, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.38,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.y = 18;
        beaconGroup.add(beam);

        // 2. High-intensity PointLight illuminating the path entrance
        const light = new THREE.PointLight(colorHex, 3.4, 28, 1.4);
        light.position.y = 2.4;
        light.castShadow = true;
        light.shadow.bias = -0.002;
        beaconGroup.add(light);

        // 3. Glowing Core Flame Brazier
        const flameCore = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.55),
            new THREE.MeshBasicMaterial({ color: colorHex })
        );
        flameCore.position.y = 2.2;
        beaconGroup.add(flameCore);

        // Stone Brazier Pedestal Base
        const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.0, 2.0, 8), this.stoneMat);
        pedestal.position.y = 1.0;
        pedestal.receiveShadow = true;
        beaconGroup.add(pedestal);

        // 4. Overhead Illuminated Sign Banner
        const sign = this.createPathSign(0, 4.8, 0, title, desc, titleColor, '#' + colorHex.toString(16).padStart(6, '0'));
        beaconGroup.add(sign);

        beaconGroup.position.set(x, y, z);
        this.scene.add(beaconGroup);

        this.particles.push({
            mesh: flameCore,
            light: light,
            baseIntensity: 3.4,
            seed: Math.random() * 20
        });
    }

    createPathSign(x, y, z, title, desc, titleColor, glowColor) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Dark gothic slate background
        ctx.fillStyle = '#0a0908';
        ctx.fillRect(0, 0, 512, 256);

        // Ornate border
        ctx.strokeStyle = glowColor || '#c49a45';
        ctx.lineWidth = 6;
        ctx.strokeRect(8, 8, 496, 240);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(16, 16, 480, 224);

        // Corner studs
        const corners = [[16, 16], [496, 16], [16, 240], [496, 240]];
        corners.forEach(([cx, cy]) => {
            ctx.fillStyle = glowColor || '#c49a45';
            ctx.beginPath();
            ctx.arc(cx, cy, 6, 0, Math.PI * 2);
            ctx.fill();
        });

        // Title text
        ctx.font = 'bold 36px "Cinzel", serif, Times, sans-serif';
        ctx.fillStyle = titleColor || '#ffd700';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = glowColor || '#ffd700';
        ctx.shadowBlur = 14;
        ctx.fillText(title, 256, 95);

        // Subtitle / Description
        ctx.font = '22px "EB Garamond", serif, Georgia, sans-serif';
        ctx.fillStyle = '#d0c6b8';
        ctx.shadowBlur = 4;
        ctx.fillText(desc, 256, 160);

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.MeshBasicMaterial({
            map: tex,
            transparent: true,
            opacity: 0.96,
            side: THREE.DoubleSide
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.2), mat);
        mesh.position.set(x, y, z);
        return mesh;
    }

    createGoldenBrazier(x, y, z, intensity = 2.2) {
        const light = new THREE.PointLight(0xffcc44, intensity, 18, 1.5);
        light.position.set(x, y + 0.5, z);
        this.scene.add(light);

        const flame = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.35),
            new THREE.MeshBasicMaterial({ color: 0xffdd66 })
        );
        flame.position.set(x, y + 0.5, z);
        this.scene.add(flame);

        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.25, 0.4, 8), this.ironMat);
        bowl.position.set(x, y, z);
        this.scene.add(bowl);

        this.particles.push({
            mesh: flame,
            light: light,
            baseIntensity: intensity,
            seed: Math.random() * 15
        });
    }

    createGoldenTorch(x, y, z) {
        const sconce = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6), this.ironMat);
        sconce.position.set(x, y, z);
        this.scene.add(sconce);

        const flameLight = new THREE.PointLight(0xffbb33, 2.2, 16, 1.6);
        flameLight.position.set(x, y + 0.7, z);
        this.scene.add(flameLight);

        const fMesh = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.2),
            new THREE.MeshBasicMaterial({ color: 0xffcc44 })
        );
        fMesh.position.set(x, y + 0.7, z);
        this.scene.add(fMesh);

        this.particles.push({
            mesh: fMesh,
            light: flameLight,
            baseIntensity: 2.2,
            seed: Math.random() * 10
        });
    }

    createTealBrazier(x, y, z) {
        const light = new THREE.PointLight(0x00ffcc, 2.0, 16, 1.6);
        light.position.set(x, y + 0.4, z);
        this.scene.add(light);

        const flame = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.28),
            new THREE.MeshBasicMaterial({ color: 0x44ffdd })
        );
        flame.position.set(x, y + 0.4, z);
        this.scene.add(flame);

        const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), this.ironMat);
        chain.position.set(x, y + 1.0, z);
        this.scene.add(chain);

        this.particles.push({
            mesh: flame,
            light: light,
            baseIntensity: 2.0,
            seed: Math.random() * 15
        });
    }

    spawnLandingDust(pos) {
        for (let i = 0; i < 18; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.5 + Math.random() * 4.0;
            const mesh = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.12 + Math.random() * 0.1),
                new THREE.MeshStandardMaterial({ color: 0x857d72, roughness: 0.9 })
            );
            mesh.position.set(pos.x, pos.y + 0.1, pos.z);
            const vel = new THREE.Vector3(
                Math.sin(angle) * speed,
                0.8 + Math.random() * 2.0,
                Math.cos(angle) * speed
            );
            this.scene.add(mesh);
            this.sparkParticles.push({ mesh, vel, life: 0.45, maxLife: 0.45 });
        }
    }

    spawnWaterSplash(pos) {
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.8 + Math.random() * 3.5;
            const mesh = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.08 + Math.random() * 0.08),
                new THREE.MeshBasicMaterial({ color: 0x55eedd, transparent: true, opacity: 0.85 })
            );
            mesh.position.set(pos.x, pos.y + 0.1, pos.z);
            const vel = new THREE.Vector3(
                Math.sin(angle) * speed,
                2.2 + Math.random() * 3.0,
                Math.cos(angle) * speed
            );
            this.scene.add(mesh);
            this.sparkParticles.push({ mesh, vel, life: 0.4, maxLife: 0.4 });
        }
    }

    spawnPlungingShockwave(pos) {
        // High-velocity expanding ring of sparks
        const count = 36;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 10.0 + Math.random() * 4.0;
            const mesh = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.12),
                new THREE.MeshBasicMaterial({ color: 0xffd244, transparent: true, opacity: 0.95 })
            );
            mesh.position.set(pos.x, pos.y + 0.2, pos.z);
            const vel = new THREE.Vector3(
                Math.sin(angle) * speed,
                1.5 + Math.random() * 3.5,
                Math.cos(angle) * speed
            );
            this.scene.add(mesh);
            this.sparkParticles.push({ mesh, vel, life: 0.65, maxLife: 0.65 });
        }
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

    createTorch(x, y, z, options = {}) {
        const torchGroup = new THREE.Group();
        const colorHex = options.color !== undefined ? options.color : 0xff7722;
        const baseIntensity = options.intensity !== undefined ? options.intensity : 2.8;
        const radius = options.radius !== undefined ? options.radius : 20;
        const isInteractive = options.interactive || false;
        let isLit = options.isLit !== false;

        // 1. Wrought iron wall mount backplate
        const plateGeo = new THREE.BoxGeometry(0.18, 0.45, 0.06);
        const plate = new THREE.Mesh(plateGeo, this.ironMat);
        torchGroup.add(plate);

        // 2. Curved forged iron holder arm
        const armGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.5, 6);
        const arm = new THREE.Mesh(armGeo, this.ironMat);
        arm.position.set(0, 0.08, 0.2);
        arm.rotation.x = Math.PI / 4;
        torchGroup.add(arm);

        // 3. Iron torch collar / basket ring
        const basketGeo = new THREE.CylinderGeometry(0.12, 0.08, 0.22, 8, 1, true);
        const basket = new THREE.Mesh(basketGeo, this.ironMat);
        basket.position.set(0, 0.26, 0.38);
        torchGroup.add(basket);

        // 4. Charred wooden torch handle wrapped in pitch cloth
        const shaftGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.85, 8);
        const shaftMat = new THREE.MeshStandardMaterial({ color: 0x221812, roughness: 0.95 });
        const shaft = new THREE.Mesh(shaftGeo, shaftMat);
        shaft.position.set(0, 0.28, 0.38);
        shaft.rotation.x = Math.PI / 12;
        shaft.castShadow = true;
        torchGroup.add(shaft);

        // Pitch wrapping bundle
        const pitchGeo = new THREE.CylinderGeometry(0.1, 0.085, 0.28, 8);
        const pitchMat = new THREE.MeshStandardMaterial({ color: 0x140e0a, roughness: 0.95 });
        const pitchMesh = new THREE.Mesh(pitchGeo, pitchMat);
        pitchMesh.position.set(0, 0.58, 0.44);
        torchGroup.add(pitchMesh);

        // 5. Dual-Layer Animated Flame
        const flameGroup = new THREE.Group();
        flameGroup.position.set(0, 0.8, 0.48);

        // White-gold inner core
        const coreGeo = new THREE.DodecahedronGeometry(0.1);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        flameGroup.add(coreMesh);

        // Outer vibrant flame body
        const flameGeo = new THREE.ConeGeometry(0.16, 0.48, 8);
        const flameMat = new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: colorHex,
            emissiveIntensity: 2.5,
            roughness: 0.2
        });
        const flameMesh = new THREE.Mesh(flameGeo, flameMat);
        flameMesh.position.y = 0.16;
        flameGroup.add(flameMesh);

        // PointLight
        const flameLight = new THREE.PointLight(colorHex, isLit ? baseIntensity : 0, radius, 1.4);
        flameLight.position.y = 0.18;
        flameLight.castShadow = true;
        flameLight.shadow.bias = -0.002;
        flameGroup.add(flameLight);

        flameGroup.visible = isLit;
        torchGroup.add(flameGroup);

        torchGroup.position.set(x, y, z);
        this.scene.add(torchGroup);

        const particleEntry = {
            mesh: flameGroup,
            coreMesh,
            flameMesh,
            light: flameLight,
            baseIntensity: baseIntensity,
            seed: Math.random() * 20,
            isTorch: true,
            isLit: isLit
        };
        this.particles.push(particleEntry);

        // Interactive unlit torch
        if (isInteractive) {
            const interactable = {
                type: 'torch_sconce',
                position: new THREE.Vector3(x, y, z),
                radius: 2.8,
                prompt: isLit ? '[ E ] REFUEL TORCH' : '🔥 [ E ] LIGHT TORCH (+50 SOULS)',
                isLit: isLit,
                lightUp: () => {
                    isLit = true;
                    interactable.isLit = true;
                    flameGroup.visible = true;
                    flameLight.intensity = baseIntensity;
                    particleEntry.isLit = true;
                    interactable.prompt = '[ E ] REFUEL TORCH';
                }
            };
            this.interactables.push(interactable);
        }

        return torchGroup;
    }

    createStandingBrazier(x, y, z, colorHex = 0xff7722, intensity = 3.6, radius = 26) {
        const brazierGroup = new THREE.Group();

        // 1. Tripod Iron Legs
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const legGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.5, 6);
            const leg = new THREE.Mesh(legGeo, this.ironMat);
            leg.position.set(Math.sin(angle) * 0.42, 0.75, Math.cos(angle) * 0.42);
            leg.rotation.z = Math.cos(angle) * 0.22;
            leg.rotation.x = -Math.sin(angle) * 0.22;
            brazierGroup.add(leg);
        }

        // 2. Iron Brazier Cauldron Bowl
        const bowlGeo = new THREE.CylinderGeometry(0.7, 0.45, 0.5, 12, 1, false);
        const bowl = new THREE.Mesh(bowlGeo, this.ironMat);
        bowl.position.y = 1.4;
        bowl.castShadow = true;
        brazierGroup.add(bowl);

        // Riveted Lip Ring
        const lipGeo = new THREE.TorusGeometry(0.72, 0.04, 6, 16);
        const lip = new THREE.Mesh(lipGeo, this.ironMat);
        lip.position.y = 1.65;
        lip.rotation.x = Math.PI / 2;
        brazierGroup.add(lip);

        // 3. Glowing Charcoal Embers Mound
        const coalsGeo = new THREE.ConeGeometry(0.65, 0.35, 10);
        const coalsMat = new THREE.MeshStandardMaterial({
            color: 0x221100,
            emissive: colorHex,
            emissiveIntensity: 1.8,
            roughness: 0.85
        });
        const coals = new THREE.Mesh(coalsGeo, coalsMat);
        coals.position.y = 1.7;
        brazierGroup.add(coals);

        // 4. Roaring Central Flame
        const flameGeo = new THREE.ConeGeometry(0.38, 1.0, 8);
        const flameMat = new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: colorHex,
            emissiveIntensity: 3.2,
            roughness: 0.1
        });
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.y = 2.2;
        brazierGroup.add(flame);

        // Core white-hot spark
        const coreGeo = new THREE.DodecahedronGeometry(0.2);
        const core = new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        core.position.y = 1.95;
        brazierGroup.add(core);

        // 5. Dynamic Warm Light
        const light = new THREE.PointLight(colorHex, intensity, radius, 1.3);
        light.position.y = 2.4;
        light.castShadow = true;
        light.shadow.bias = -0.002;
        brazierGroup.add(light);

        brazierGroup.position.set(x, y, z);
        this.scene.add(brazierGroup);

        this.particles.push({
            mesh: flame,
            light: light,
            baseIntensity: intensity,
            seed: Math.random() * 20
        });

        // Collider for the solid tripod brazier
        this.colliders.push(new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(x, y + 0.9, z),
            new THREE.Vector3(1.5, 1.8, 1.5)
        ));

        return brazierGroup;
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
    // UNDEAD MERCHANT NPC (LORDRAN PEDDLER)
    // ----------------------------------------------------
    buildMerchant() {
        const merchantGroup = new THREE.Group();

        // 1. Merchant Rug / Blanket spread on flagstones
        const rugGeo = new THREE.PlaneGeometry(3.6, 3.6);
        const rugMat = new THREE.MeshStandardMaterial({
            color: 0x4e2016, // Crimson patterned carpet
            roughness: 0.92,
            metalness: 0.05
        });
        const rug = new THREE.Mesh(rugGeo, rugMat);
        rug.rotation.x = -Math.PI / 2;
        rug.position.y = 0.02;
        rug.receiveShadow = true;
        merchantGroup.add(rug);

        // 2. Wares Crates & Merchandise Barrels
        const crate1 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.85, 0.9), this.woodMat);
        crate1.position.set(-1.1, 0.42, -0.6);
        crate1.rotation.y = 0.15;
        crate1.castShadow = true;
        crate1.receiveShadow = true;
        merchantGroup.add(crate1);

        const crate2 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.65, 0.75), this.woodMat);
        crate2.position.set(-1.0, 1.15, -0.5);
        crate2.rotation.y = -0.25;
        crate2.castShadow = true;
        merchantGroup.add(crate2);

        // Display Weapons leaning against crates
        const displayZwei = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.22), this.ironMat);
        displayZwei.position.set(-0.65, 0.9, -0.2);
        displayZwei.rotation.z = -0.32;
        displayZwei.castShadow = true;
        merchantGroup.add(displayZwei);

        const displayKatana = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 6), this.ironMat);
        displayKatana.position.set(-0.55, 0.8, -0.35);
        displayKatana.rotation.z = -0.25;
        displayKatana.castShadow = true;
        merchantGroup.add(displayKatana);

        // Glowing Merchant Lantern on the crate
        const lanternLight = new THREE.PointLight(0xffa834, 2.4, 14, 1.4);
        lanternLight.position.set(-1.0, 1.6, -0.5);
        merchantGroup.add(lanternLight);

        const lanternMesh = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.18),
            new THREE.MeshBasicMaterial({ color: 0xffcc66 })
        );
        lanternMesh.position.set(-1.0, 1.6, -0.5);
        merchantGroup.add(lanternMesh);

        // 3. Merchant NPC Figure (Sitting on low wooden stool)
        const npcGroup = new THREE.Group();
        npcGroup.position.set(0.3, 0, 0);

        // Stool
        const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.35, 8), this.woodMat);
        stool.position.y = 0.18;
        npcGroup.add(stool);

        // Sitting legs & boots
        const legs = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.35, 0.55), new THREE.MeshStandardMaterial({ color: 0x362b22, roughness: 0.8 }));
        legs.position.set(0, 0.25, 0.15);
        legs.castShadow = true;
        npcGroup.add(legs);

        // Torso with weathered traveler's coat
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.72, 0.42), new THREE.MeshStandardMaterial({ color: 0x5a4230, roughness: 0.85 }));
        torso.position.y = 0.72;
        torso.castShadow = true;
        npcGroup.add(torso);

        // Crimson shawl / scarf
        const scarf = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.22, 0.46), new THREE.MeshStandardMaterial({ color: 0x7c241c, roughness: 0.9 }));
        scarf.position.y = 1.0;
        npcGroup.add(scarf);

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.35, 0.32), new THREE.MeshStandardMaterial({ color: 0xb59e82, roughness: 0.8 }));
        head.position.y = 1.28;
        head.castShadow = true;
        npcGroup.add(head);

        // Wide-brimmed merchant pilgrim hat
        const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.04, 14), new THREE.MeshStandardMaterial({ color: 0x261d16, roughness: 0.8 }));
        hatBrim.position.y = 1.48;
        npcGroup.add(hatBrim);

        const hatCone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.42, 10), new THREE.MeshStandardMaterial({ color: 0x261d16, roughness: 0.8 }));
        hatCone.position.y = 1.68;
        npcGroup.add(hatCone);

        // Arms resting forward on knees
        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.48, 0.14), new THREE.MeshStandardMaterial({ color: 0x5a4230, roughness: 0.85 }));
        armL.position.set(-0.32, 0.55, 0.16);
        armL.rotation.x = 0.42;
        npcGroup.add(armL);

        const armR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.48, 0.14), new THREE.MeshStandardMaterial({ color: 0x5a4230, roughness: 0.85 }));
        armR.position.set(0.32, 0.55, 0.16);
        armR.rotation.x = 0.42;
        npcGroup.add(armR);

        merchantGroup.add(npcGroup);

        // Position merchant in Courtyard near the bonfire
        merchantGroup.position.set(-8.5, 0, 3.5);
        merchantGroup.rotation.y = Math.PI / 4;
        this.scene.add(merchantGroup);
        this.merchantGroup = merchantGroup;

        // Register interactable
        this.interactables.push({
            type: 'merchant',
            position: new THREE.Vector3(-8.5, 0, 3.5),
            radius: 3.5,
            prompt: '[ E ] TALK TO UNDEAD MERCHANT'
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
            if (p.isLit === false) return;
            if (p.light) {
                p.light.intensity = p.baseIntensity + Math.sin(time * 9 + p.seed) * 0.35 + Math.sin(time * 21 + p.seed * 2) * 0.15;
            }
            if (p.flameMesh) {
                const s = 1.0 + Math.sin(time * 12 + p.seed) * 0.08;
                p.flameMesh.scale.set(s, 1.0 + Math.sin(time * 16 + p.seed) * 0.14, s);
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
