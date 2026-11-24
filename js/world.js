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

        this.sparkPool = [];
        this.bloodPool = [];
        this.dustPool = [];

        this.dynamicLights = [];
        this.lightCullTimer = 0;

        this.initMaterials();
        this.initObjectPools();
        this.buildLighting();
        this.buildEnvironment();
        this.buildDistantFortress();
        this.buildBonfire();
        this.buildMerchant();
        this.buildFogGate();
        this.buildAtmosphere();
        this.collectDynamicLights();
    }

    collectDynamicLights() {
        this.dynamicLights = [];
        this.scene.traverse((obj) => {
            if (obj && obj.isPointLight) {
                const range = (obj.distance && obj.distance > 0) ? (obj.distance * 1.5) : 65.0;
                obj.userData.maxDistSq = range * range;
                if (!obj.userData.worldPos) obj.userData.worldPos = new THREE.Vector3();
                this.dynamicLights.push(obj);
            }
        });
    }

    initMaterials() {
        // ==========================================
        // HD REMASTER / MOD PROCEDURAL TEXTURES
        // 1024x1024 High-Fidelity Medieval Lordran Textures
        // Diffuse, Bump, Roughness & Emissive Maps
        // ==========================================

        // 1. ANCIENT GOTHIC COURTYARD MONUMENTAL FLAGSTONES (1024x1024)
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

        // Deep recessed aged mortar base
        sCtx.fillStyle = '#110f0e';
        sCtx.fillRect(0, 0, 1024, 1024);
        sbCtx.fillStyle = '#181818';
        sbCtx.fillRect(0, 0, 1024, 1024);
        srCtx.fillStyle = '#cccccc';
        srCtx.fillRect(0, 0, 1024, 1024);

        // Large fortress flagstone slabs (heavy, irregular dark stones)
        const rows = 6;
        const cols = 4;
        const rh = 1024 / rows;
        const cw = 1024 / cols;

        for (let r = 0; r < rows; r++) {
            const rowOffset = (r % 2) * (cw / 2) + Math.sin(r * 2.1) * 8;
            for (let c = -1; c <= cols + 1; c++) {
                const bx = c * cw + rowOffset + 4;
                const by = r * rh + 4;
                const bw = cw - 8;
                const bh = rh - 8;

                // Radiant sunlit Lordran flagstone palette (bright cathedral limestone & sunlit travertine)
                const palSeed = Math.random();
                let baseR, baseG, baseB;
                if (palSeed < 0.35) {
                    baseR = 188 + Math.floor(Math.random() * 16);
                    baseG = 182 + Math.floor(Math.random() * 14);
                    baseB = 170 + Math.floor(Math.random() * 14);
                } else if (palSeed < 0.7) {
                    baseR = 205 + Math.floor(Math.random() * 18);
                    baseG = 196 + Math.floor(Math.random() * 16);
                    baseB = 180 + Math.floor(Math.random() * 14);
                } else {
                    baseR = 178 + Math.floor(Math.random() * 14);
                    baseG = 175 + Math.floor(Math.random() * 14);
                    baseB = 168 + Math.floor(Math.random() * 12);
                }

                // Fill stone slab
                sCtx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
                sCtx.fillRect(bx, by, bw, bh);

                // Subtle bump map: gently raised slab without jarring stepped ridges
                const bumpH = 110 + Math.floor(Math.random() * 25);
                sbCtx.fillStyle = `rgb(${bumpH}, ${bumpH}, ${bumpH})`;
                sbCtx.fillRect(bx, by, bw, bh);

                // Rough matte surface
                const roughVal = 180 + Math.floor(Math.random() * 40);
                srCtx.fillStyle = `rgb(${roughVal}, ${roughVal}, ${roughVal})`;
                srCtx.fillRect(bx, by, bw, bh);

                // Soft weathered bevel (subtle shadow & micro-highlight, NO white subway lines)
                sCtx.fillStyle = 'rgba(160, 150, 140, 0.06)';
                sCtx.fillRect(bx, by, bw, 2);
                sCtx.fillRect(bx, by, 2, bh);
                sCtx.fillStyle = 'rgba(0, 0, 0, 0.45)';
                sCtx.fillRect(bx, by + bh - 3, bw, 3);
                sCtx.fillRect(bx + bw - 3, by, 3, bh);

                sbCtx.fillStyle = '#888888';
                sbCtx.fillRect(bx, by, bw, 2);
                sbCtx.fillRect(bx, by, 2, bh);
                sbCtx.fillStyle = '#222222';
                sbCtx.fillRect(bx, by + bh - 2, bw, 2);
                sbCtx.fillRect(bx + bw - 2, by, 2, bh);

                // Weathering, fissures & surface grit
                for (let k = 0; k < 20; k++) {
                    const gx = bx + Math.random() * bw;
                    const gy = by + Math.random() * bh;
                    const gw = 2 + Math.random() * 8;
                    const gh = 1 + Math.random() * 4;
                    sCtx.fillStyle = Math.random() > 0.5 ? 'rgba(10, 8, 6, 0.25)' : 'rgba(80, 75, 70, 0.08)';
                    sCtx.fillRect(gx, gy, gw, gh);
                }

                // Moss & grime in joints and crevices
                if (Math.random() > 0.4) {
                    sCtx.fillStyle = 'rgba(25, 32, 22, 0.22)';
                    sCtx.fillRect(bx, by + bh - 5, bw, 4);
                }
            }
        }

        const stoneTexture = new THREE.CanvasTexture(stoneCanvas);
        stoneTexture.wrapS = THREE.RepeatWrapping;
        stoneTexture.wrapT = THREE.RepeatWrapping;
        stoneTexture.repeat.set(4, 3);

        const stoneBumpTexture = new THREE.CanvasTexture(stoneBumpCanvas);
        stoneBumpTexture.wrapS = THREE.RepeatWrapping;
        stoneBumpTexture.wrapT = THREE.RepeatWrapping;
        stoneBumpTexture.repeat.set(4, 3);

        const stoneRoughTexture = new THREE.CanvasTexture(stoneRoughCanvas);
        stoneRoughTexture.wrapS = THREE.RepeatWrapping;
        stoneRoughTexture.wrapT = THREE.RepeatWrapping;
        stoneRoughTexture.repeat.set(4, 3);

        this.stoneMat = new THREE.MeshStandardMaterial({
            map: stoneTexture,
            bumpMap: stoneBumpTexture,
            bumpScale: 0.04,
            roughnessMap: stoneRoughTexture,
            roughness: 0.88,
            metalness: 0.06
        });

        // 2. GOTHIC ASHLAR FORTRESS WALL (1024x1024 AAA Realistic Masonry)
        const wallCanvas = document.createElement('canvas');
        wallCanvas.width = 1024;
        wallCanvas.height = 1024;
        const wCtx = wallCanvas.getContext('2d');

        const wallBumpCanvas = document.createElement('canvas');
        wallBumpCanvas.width = 1024;
        wallBumpCanvas.height = 1024;
        const wbCtx = wallBumpCanvas.getContext('2d');

        const wallRoughCanvas = document.createElement('canvas');
        wallRoughCanvas.width = 1024;
        wallRoughCanvas.height = 1024;
        const wrCtx = wallRoughCanvas.getContext('2d');

        // Deep recessed aged lime-mortar base
        wCtx.fillStyle = '#1c1713';
        wCtx.fillRect(0, 0, 1024, 1024);
        wbCtx.fillStyle = '#181818'; // Recessed mortar
        wbCtx.fillRect(0, 0, 1024, 1024);
        wrCtx.fillStyle = '#f0f0f0'; // Matte dry mortar
        wrCtx.fillRect(0, 0, 1024, 1024);

        const wRows = 8;
        const wCols = 4;
        const wrh = 1024 / wRows;
        const wcw = 1024 / wCols;

        for (let r = 0; r < wRows; r++) {
            const offset = (r % 2) * (wcw / 2);
            for (let c = -1; c <= wCols + 1; c++) {
                const x = c * wcw + offset + 4;
                const y = r * wrh + 4;
                const w = wcw - 8;
                const h = wrh - 8;

                // Rich sun-baked Lordran fortress limestone and golden ashlar tones
                const toneSeed = Math.random();
                let rC, gC, bC;
                if (toneSeed < 0.35) {
                    rC = 195 + Math.floor(Math.random() * 16); // Sunlit ashlar
                    gC = 188 + Math.floor(Math.random() * 14);
                    bC = 175 + Math.floor(Math.random() * 14);
                } else if (toneSeed < 0.70) {
                    rC = 218 + Math.floor(Math.random() * 18); // Warm golden limestone
                    gC = 208 + Math.floor(Math.random() * 16);
                    bC = 192 + Math.floor(Math.random() * 16);
                } else {
                    rC = 202 + Math.floor(Math.random() * 16); // Classic Lordran granite
                    gC = 198 + Math.floor(Math.random() * 16);
                    bC = 190 + Math.floor(Math.random() * 14);
                }

                wCtx.fillStyle = `rgb(${rC}, ${gC}, ${bC})`;
                wCtx.fillRect(x, y, w, h);

                // Height bump for stone face (180-220)
                const wbVal = 185 + Math.floor(Math.random() * 35);
                wbCtx.fillStyle = `rgb(${wbVal}, ${wbVal}, ${wbVal})`;
                wbCtx.fillRect(x, y, w, h);

                // Roughness variance
                const wrVal = 190 + Math.floor(Math.random() * 45);
                wrCtx.fillStyle = `rgb(${wrVal}, ${wrVal}, ${wrVal})`;
                wrCtx.fillRect(x, y, w, h);

                // Natural organic stone noise grain (replaces artificial harsh striations)
                for (let k = 0; k < 60; k++) {
                    const gx = x + Math.random() * w;
                    const gy = y + Math.random() * h;
                    const gw = 2 + Math.random() * 8;
                    const gh = 2 + Math.random() * 4;
                    const isDark = Math.random() > 0.45;
                    wCtx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.18)' : 'rgba(255, 255, 255, 0.12)';
                    wCtx.fillRect(gx, gy, gw, gh);
                    wbCtx.fillStyle = isDark ? '#404040' : '#ffffff';
                    wbCtx.fillRect(gx, gy, gw, gh);
                }

                // Subtle lichen / moss patches near lower block seams
                if (Math.random() < 0.4) {
                    wCtx.fillStyle = 'rgba(56, 68, 48, 0.28)';
                    wCtx.fillRect(x + Math.random() * (w - 30), y + h - 14, 25 + Math.random() * 30, 10);
                }

                // Chiseled 3D beveled edges: soft highlight top/left, deep shadow bottom/right
                wCtx.fillStyle = 'rgba(255, 255, 255, 0.18)';
                wCtx.fillRect(x, y, w, 3);
                wCtx.fillRect(x, y, 3, h);
                wCtx.fillStyle = 'rgba(0, 0, 0, 0.65)';
                wCtx.fillRect(x, y + h - 3, w, 3);
                wCtx.fillRect(x + w - 3, y, 3, h);

                wbCtx.fillStyle = '#ffffff';
                wbCtx.fillRect(x, y, w, 2);
                wbCtx.fillRect(x, y, 2, h);
                wbCtx.fillStyle = '#222222';
                wbCtx.fillRect(x, y + h - 2, w, 2);
                wbCtx.fillRect(x + w - 2, y, 2, h);
            }
        }

        // Vertical rainwater seepage, grime & soot runoffs
        for (let i = 0; i < 35; i++) {
            const sx = Math.random() * 1024;
            const sy = Math.random() * 250;
            const slen = 250 + Math.random() * 500;
            const sgrad = wCtx.createLinearGradient(sx, sy, sx, sy + slen);
            sgrad.addColorStop(0, 'rgba(15, 12, 10, 0.55)');
            sgrad.addColorStop(0.4, 'rgba(25, 20, 16, 0.28)');
            sgrad.addColorStop(1, 'rgba(30, 25, 20, 0)');
            wCtx.fillStyle = sgrad;
            wCtx.fillRect(sx - 4, sy, 8 + Math.random() * 12, slen);
        }

        const wallTex = new THREE.CanvasTexture(wallCanvas);
        wallTex.wrapS = THREE.RepeatWrapping;
        wallTex.wrapT = THREE.RepeatWrapping;

        const wallBumpTex = new THREE.CanvasTexture(wallBumpCanvas);
        wallBumpTex.wrapS = THREE.RepeatWrapping;
        wallBumpTex.wrapT = THREE.RepeatWrapping;

        const wallRoughTex = new THREE.CanvasTexture(wallRoughCanvas);
        wallRoughTex.wrapS = THREE.RepeatWrapping;
        wallRoughTex.wrapT = THREE.RepeatWrapping;

        this.wallMat = new THREE.MeshStandardMaterial({
            map: wallTex,
            bumpMap: wallBumpTex,
            bumpScale: 0.18,
            roughnessMap: wallRoughTex,
            roughness: 0.88,
            metalness: 0.08
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

        // Dark aged Lordran fortress granite base (Authentic Dark Souls rampart flagstones)
        aCtx.fillStyle = '#262320';
        aCtx.fillRect(0, 0, 1024, 1024);
        abCtx.fillStyle = '#3a3a3a';
        abCtx.fillRect(0, 0, 1024, 1024);
        aeCtx.fillStyle = '#000000';
        aeCtx.fillRect(0, 0, 1024, 1024);

        // Weathered irregular medieval stone flagstones (staggered running bond, NO modern bathroom tiles)
        const rowHeight = 128;
        const colWidth = 256;
        for (let row = 0; row < 1024; row += rowHeight) {
            const rowOffset = (Math.floor(row / rowHeight) % 2) * (colWidth / 2);
            for (let col = -colWidth; col < 1024 + colWidth; col += colWidth) {
                const sx = col + rowOffset + 6;
                const sy = row + 6;
                const sw = colWidth - 12;
                const sh = rowHeight - 12;

                // Natural stone shade variations (dark charcoal, aged basalt and warm slate)
                const stoneTone = Math.floor(42 + Math.random() * 22);
                const rTone = stoneTone + Math.floor(Math.random() * 8);
                const gTone = stoneTone + Math.floor(Math.random() * 4);
                const bTone = stoneTone;
                aCtx.fillStyle = `rgb(${rTone}, ${gTone}, ${bTone})`;
                aCtx.fillRect(sx, sy, sw, sh);

                // Stone grain & micro-texture
                for (let k = 0; k < 60; k++) {
                    const gx = sx + Math.random() * sw;
                    const gy = sy + Math.random() * sh;
                    const isDark = Math.random() > 0.5;
                    aCtx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.28)' : 'rgba(255, 255, 255, 0.08)';
                    aCtx.fillRect(gx, gy, 2 + Math.random() * 6, 2 + Math.random() * 4);
                }

                // Chiseled 3D beveled edges & deep shadow grooves
                aCtx.fillStyle = 'rgba(255, 255, 255, 0.12)';
                aCtx.fillRect(sx, sy, sw, 3);
                aCtx.fillRect(sx, sy, 3, sh);
                aCtx.fillStyle = 'rgba(0, 0, 0, 0.85)';
                aCtx.fillRect(sx, sy + sh - 3, sw, 3);
                aCtx.fillRect(sx + sw - 3, sy, 3, sh);

                // Bump map depth
                abCtx.fillStyle = '#7a7a7a';
                abCtx.fillRect(sx, sy, sw, sh);
                abCtx.fillStyle = '#101010';
                abCtx.fillRect(sx - 3, sy - 3, sw + 6, 4);
                abCtx.fillRect(sx - 3, sy - 3, 4, sh + 6);
            }
        }

        // Soot & scorch marks radiating from Taurus Demon impacts
        const scorchGrad = aCtx.createRadialGradient(512, 512, 60, 512, 512, 480);
        scorchGrad.addColorStop(0, 'rgba(14, 12, 10, 0.65)');
        scorchGrad.addColorStop(0.6, 'rgba(24, 20, 16, 0.35)');
        scorchGrad.addColorStop(1, 'rgba(26, 22, 20, 0)');
        aCtx.fillStyle = scorchGrad;
        aCtx.fillRect(0, 0, 1024, 1024);

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
        arenaTex.repeat.set(2, 4);

        const arenaBumpTex = new THREE.CanvasTexture(arenaBumpCanvas);
        arenaBumpTex.wrapS = THREE.RepeatWrapping;
        arenaBumpTex.wrapT = THREE.RepeatWrapping;
        arenaBumpTex.repeat.set(2, 4);

        const arenaEmissiveTex = new THREE.CanvasTexture(arenaEmissiveCanvas);
        arenaEmissiveTex.wrapS = THREE.RepeatWrapping;
        arenaEmissiveTex.wrapT = THREE.RepeatWrapping;
        arenaEmissiveTex.repeat.set(2, 4);

        this.arenaMat = new THREE.MeshStandardMaterial({
            map: arenaTex,
            bumpMap: arenaBumpTex,
            bumpScale: 0.18,
            emissiveMap: arenaEmissiveTex,
            emissive: 0xff3300,
            emissiveIntensity: 0.25,
            roughness: 0.88,
            metalness: 0.06
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

        // 6. SERPENTINE SANCTUM STONE & PROCEDURAL ASSETS
        const sStoneCanvas = document.createElement('canvas');
        sStoneCanvas.width = 512;
        sStoneCanvas.height = 512;
        const ssCtx = sStoneCanvas.getContext('2d');
        ssCtx.fillStyle = '#1c261e';
        ssCtx.fillRect(0, 0, 512, 512);
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const rx = c * 64 + (r % 2) * 32 + 2;
                const ry = r * 64 + 2;
                ssCtx.fillStyle = (Math.random() < 0.4) ? '#243b2a' : '#1f2e23';
                ssCtx.fillRect(rx, ry, 60, 60);
                ssCtx.fillStyle = 'rgba(50, 110, 60, 0.35)';
                ssCtx.fillRect(rx, ry, 60, 3);
                ssCtx.fillRect(rx, ry, 3, 60);
            }
        }
        const sStoneTex = new THREE.CanvasTexture(sStoneCanvas);
        sStoneTex.wrapS = THREE.RepeatWrapping;
        sStoneTex.wrapT = THREE.RepeatWrapping;
        sStoneTex.repeat.set(8, 8);
        this.serpentStoneMat = new THREE.MeshStandardMaterial({
            map: sStoneTex,
            roughness: 0.65,
            metalness: 0.15
        });

        this.serpentJadeMat = new THREE.MeshStandardMaterial({
            color: 0x0f2918,
            roughness: 0.25,
            metalness: 0.42
        });

        this.poisonWaterMat = new THREE.MeshStandardMaterial({
            color: 0x184824,
            emissive: 0x0a2812,
            emissiveIntensity: 0.6,
            roughness: 0.12,
            metalness: 0.25,
            transparent: true,
            opacity: 0.85
        });

        this.petrifiedStoneMat = new THREE.MeshStandardMaterial({
            color: 0x686460,
            roughness: 0.94,
            metalness: 0.04
        });

        this.ivyMat = new THREE.MeshStandardMaterial({
            color: 0x1a4520,
            roughness: 0.82,
            side: THREE.DoubleSide
        });

        // ==========================================
        // OUTSIDE REALM & DARKROOT FOREST MATERIALS
        // ==========================================
        const grassCanvas = document.createElement('canvas');
        grassCanvas.width = 512;
        grassCanvas.height = 512;
        const gCtx = grassCanvas.getContext('2d');
        gCtx.fillStyle = '#5ca23e';
        gCtx.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 4000; i++) {
            const gx = Math.random() * 512;
            const gy = Math.random() * 512;
            const gr = 1.0 + Math.random() * 2.5;
            const gShade = Math.random();
            gCtx.fillStyle = gShade < 0.4 ? 'rgba(125, 195, 88, 0.75)' : (gShade < 0.8 ? 'rgba(95, 168, 65, 0.75)' : 'rgba(155, 210, 110, 0.65)');
            gCtx.beginPath();
            gCtx.arc(gx, gy, gr, 0, Math.PI * 2);
            gCtx.fill();
        }
        const grassTex = new THREE.CanvasTexture(grassCanvas);
        grassTex.wrapS = THREE.RepeatWrapping;
        grassTex.wrapT = THREE.RepeatWrapping;
        grassTex.repeat.set(16, 16);

        this.forestGrassMat = new THREE.MeshStandardMaterial({
            map: grassTex,
            roughness: 0.70,
            metalness: 0.05
        });

        this.cliffRockMat = new THREE.MeshStandardMaterial({
            color: 0x8294a8,
            roughness: 0.75,
            metalness: 0.12,
            flatShading: true
        });

        this.archtreeBarkMat = new THREE.MeshStandardMaterial({
            color: 0x7a5e46,
            roughness: 0.80,
            metalness: 0.05
        });

        this.foliageMat = new THREE.MeshStandardMaterial({
            color: 0x4da844,
            roughness: 0.65,
            flatShading: true
        });

        this.runeStoneMat = new THREE.MeshStandardMaterial({
            color: 0x333b42,
            roughness: 0.75,
            metalness: 0.25,
            emissive: 0x0a2228,
            emissiveIntensity: 0.35
        });

        this.dragonBoneMat = new THREE.MeshStandardMaterial({
            color: 0xddd5c7,
            roughness: 0.78,
            metalness: 0.08
        });
    }

    buildLighting() {
        // 1. Panoramic Gothic Sky Dome with Natural Atmospheric Horizon Gradient
        const skyCanvas = document.createElement('canvas');
        skyCanvas.width = 512;
        skyCanvas.height = 512;
        const skyCtx = skyCanvas.getContext('2d');
        const skyGrad = skyCtx.createLinearGradient(0, 0, 0, 512);
        skyGrad.addColorStop(0.0, '#3a5570'); // Deep atmospheric slate zenith
        skyGrad.addColorStop(0.40, '#567595'); // Natural daylight azure
        skyGrad.addColorStop(0.70, '#8ca2b8'); // Soft horizon mist
        skyGrad.addColorStop(1.0, '#d8caa8'); // Warm golden sun horizon glow
        skyCtx.fillStyle = skyGrad;
        skyCtx.fillRect(0, 0, 512, 512);

        const skyTex = new THREE.CanvasTexture(skyCanvas);
        const skyDomeGeo = new THREE.SphereGeometry(2040, 32, 16);
        const skyDomeMat = new THREE.MeshBasicMaterial({
            map: skyTex,
            side: THREE.BackSide,
            depthWrite: false
        });
        const skyDome = new THREE.Mesh(skyDomeGeo, skyDomeMat);
        this.scene.add(skyDome);

        this.scene.background = new THREE.Color(0x566d84);

        // 2. Clear Natural Atmospheric Depth Fog (Balanced distance silhouettes for 12,000m realm)
        this.scene.fog = new THREE.FogExp2(0x5e758c, 0.00005);

        // 3. Balanced Ambient Light (Clear visibility across all architecture without washing out)
        this.ambientLight = new THREE.AmbientLight(0x4c5e72, 0.60);
        this.scene.add(this.ambientLight);

        // 4. Sky and ground bounce hemisphere lighting (Slate blue sky + warm stone bounce)
        this.hemiLight = new THREE.HemisphereLight(0x8eb0d0, 0x5a4e40, 0.65);
        this.scene.add(this.hemiLight);

        // 5. Cinematic Radiant Lordran Sunlight (primary sun from South-East, rich shadows & highlights)
        this.moonlight = new THREE.DirectionalLight(0xfff0dc, 1.85);
        this.moonlight.position.set(45, 80, -25);
        this.moonlight.castShadow = true;
        this.moonlight.shadow.mapSize.width = 1024;
        this.moonlight.shadow.mapSize.height = 1024;
        this.moonlight.shadow.camera.near = 1.0;
        this.moonlight.shadow.camera.far = 240;
        const d = 75;
        this.moonlight.shadow.camera.left = -d;
        this.moonlight.shadow.camera.right = d;
        this.moonlight.shadow.camera.top = d;
        this.moonlight.shadow.camera.bottom = -d;
        this.moonlight.shadow.bias = -0.0005;
        this.moonlight.shadow.radius = 1.2;
        this.scene.add(this.moonlight);

        // Secondary Omni-Directional Fill Sunlight (Soft sky bounce, prevents pitch-black crevices)
        this.fillSunlight = new THREE.DirectionalLight(0x7c9cb8, 0.50);
        this.fillSunlight.position.set(-50, 75, 40);
        this.scene.add(this.fillSunlight);

        // 6. Radiant Golden Sun Disc & Volumetric Aura
        const sunGeo = new THREE.SphereGeometry(7.5, 20, 20);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff6dc });
        const sun = new THREE.Mesh(sunGeo, sunMat);
        sun.position.set(65, 125, 45);
        this.scene.add(sun);

        const sunAuraGeo = new THREE.RingGeometry(7.6, 20.0, 32);
        const sunAuraMat = new THREE.MeshBasicMaterial({
            color: 0xffdfa8,
            transparent: true,
            opacity: 0.45,
            side: THREE.DoubleSide
        });
        const sunAura = new THREE.Mesh(sunAuraGeo, sunAuraMat);
        sunAura.position.copy(sun.position);
        sunAura.lookAt(0, 0, 0);
        this.scene.add(sunAura);

        // Perimeter courtyard torches mounted flush on walls (archway is at x: -7 to 7, so NO floating torch at x=0!)
        const courtyardTorches = [
            // North perimeter wall (flanking doorway)
            [-26, 3.5, -29], [-13, 3.5, -29], [13, 3.5, -29], [26, 3.5, -29],
            // West wall (archway open at z: -7 to 7, no floating torch in doorway!)
            [-29, 3.5, -14], [-29, 3.5, 14],
            // East wall
            [29, 3.5, -14], [29, 3.5, 0], [29, 3.5, 14],
            // South wall flanking bridge arch
            [-12, 3.5, 29], [12, 3.5, 29]
        ];
        courtyardTorches.forEach(([tx, ty, tz]) => {
            this.createTorch(tx, ty, tz, { intensity: 2.8, radius: 22 });
        });

        // Standing Iron Braziers flanking the Bonfire in central courtyard
        this.createStandingBrazier(-3.6, 0, 0, 0xff7722, 3.8, 26);
        this.createStandingBrazier(3.6, 0, 0, 0xff7722, 3.8, 26);

        // Interactive unlit torches near promenade gateway (mounted on carved stone pillars so they never float)
        this.createPillar(-6.5, 25, 4.0);
        this.createPillar(6.5, 25, 4.0);
        this.createTorch(-6.0, 2.5, 25, { interactive: true, isLit: false });
        this.createTorch(6.0, 2.5, 25, { interactive: true, isLit: false });
    }

    getGroundHeight(x, z, currentY = null) {
        // 1. East Upper Ramparts & Stairs (Climbing from y = 0.0 at z = 4.5 to y = 6.0 at z = 22.0)
        // Ascending Stairs from Courtyard to Ramparts (z in [4.0, 22.0], x in [14.5, 25.5])
        if (x >= 14.5 && x <= 25.5 && z >= 4.0 && z <= 22.0) {
            const t = Math.max(0, Math.min(1.0, (z - 4.5) / 17.5));
            return t * 6.0;
        }
        // High Ramparts Battlement Walkway (z in [22.0, 268.0], x in [14.5, 25.5])
        if (x >= 14.5 && x <= 25.5 && z > 22.0 && z <= 268.0) {
            return 6.0;
        }
        // Watchtower & Descent Ramp to Fog Gate (z in [268.0, 274.0], x in [14.5, 25.5])
        if (x >= 14.5 && x <= 25.5 && z > 268.0 && z <= 274.0) {
            const t = Math.max(0, (274.0 - z) / 6.0);
            return t * 6.0;
        }

        // 2. Surface Boss Arena (z in [4140, 12600], expanded arena span x in [-380, 380]) - 3x Lengthened 720m x 8,400m Colosseum
        // If player is on surface (currentY === null || currentY >= -2.2), ALWAYS stay solid at y = 0.0!
        if (x >= -380 && x <= 380 && z >= 4140 && z <= 12600 && (currentY === null || currentY >= -2.2)) {
            return 0.0;
        }

        // 3. Central Royal Bridge (z in [535, 4150], expanded walkable bridge span x in [-95.0, 95.0]) - 3x Lengthened 3,600m Imperial Viaduct!
        if (x >= -95.0 && x <= 95.0 && z >= 535 && z <= 4150 && (currentY === null || currentY >= -2.2)) {
            return 0.0;
        }

        // 4. West Sunken Catacombs & Deep Subterranean Mausoleum
        const inStairTrench = (x >= -25.2 && x <= -14.8 && z >= 3.5 && z <= 22.8);
        if (inStairTrench) {
            const t = Math.max(0, Math.min(1.0, (z - 4.0) / 18.0));
            return -t * 4.92;
        }

        // Flooded Subterranean Catacombs Corridor (z in [22, 268], x in [-28.0, -12.0])
        // ONLY applies if player is actually subterranean (currentY !== null && currentY < -2.0)
        if (x >= -28.0 && x <= -12.0 && z > 22 && z <= 268 && (currentY !== null && currentY < -2.0)) {
            return -4.92;
        }
        // Crypt Exit Ascent Ramp back to surface before Fog Gate (z in [268, 274], x in [-28.0, -12.0])
        if (x >= -28.0 && x <= -12.0 && z > 268 && z <= 274 && (currentY !== null && currentY < -2.0)) {
            const t = (z - 268) / 6;
            return -4.92 + t * 4.92;
        }

        // 5. Serpent Sanctuary & Temple of the Gorgon (z in [-6840, -2250], x in [-160, 160]) - 3x Lengthened 4,500m Sunken Temple
        if (x >= -40 && x <= 40 && z >= -2430 && z <= -2250) {
            const t = Math.max(0, Math.min(1.0, (-2250 - z) / 180.0));
            return -t * 3.5;
        }
        if (x >= -130 && x <= 130 && z >= -4050 && z < -2430) {
            return -3.5;
        }
        if (z >= -4275 && z < -4050) {
            if (x >= -40 && x <= 40) {
                const t = (-4050 - z) / 225.0;
                return -3.5 - t * 2.5;
            }
            if (Math.abs(x) <= 130) {
                return -3.5;
            }
        }
        if (x >= -160 && x <= 160 && z >= -6840 && z < -4275) {
            return -6.0;
        }

        // Undead Burg Outskirts: Cliff Chasm & Mountain Plateau (x in [-310, -140], z in [-50, 90])
        if (x >= -310 && x <= -140 && z >= -50 && z <= 90 && (currentY === null || currentY < 0.5)) {
            return -2.0;
        }

        // 5b. Outside Realm & Extended Expeditions: x in [-1080, -28], z in [-620, 620]
        if (x >= -1080 && x <= -28 && z >= -620 && z <= 620) {
            // 8 Brand-New Legendary Outside Realm Expeditions (V55 Expansion)
            // 1. Painted World Chapel of Sister Friede (outside_ariandel_chapel_blackflame) (elev: +10.0m)
            if (x >= -965 && x <= -875 && z >= -305 && z <= -215) {
                return 10.0;
            }
            // 2. Archdragon Peak Storm Sovereign Colosseum (outside_archdragon_storm_colosseum_nameless) (elev: +24.0m)
            if (x >= -985 && x <= -895 && z >= -125 && z <= -35) {
                return 24.0;
            }
            // 3. Ashina Silvergrass Battlefield Under Thunder (outside_ashina_silvergrass_field_isshin) (elev: +6.0m)
            if (x >= -975 && x <= -885 && z >= 75 && z <= 165) {
                return 6.0;
            }
            // 4. Hunter's Dream Radiant Lunar Flowerbed (outside_hunters_dream_lunar_flowerbed) (elev: -2.0m)
            if (x >= -1005 && x <= -915 && z >= 215 && z <= 305) {
                return -2.0;
            }
            // 5. Inside the Erdtree Throne of Radagon (outside_erdtree_throne_radagon_elden_beast) (elev: +16.0m)
            if (x >= -1025 && x <= -935 && z >= -225 && z <= -135) {
                return 16.0;
            }
            // 6. Leyndell Royal Bedchamber Terrace (outside_leyndell_terrace_godfrey_hoarah_loux) (elev: +12.0m)
            if (x >= -1035 && x <= -945 && z >= 315 && z <= 405) {
                return 12.0;
            }
            // 7. Castle Ensis Moongazing Dais (outside_castle_ensis_twin_moon_dais) (elev: +8.0m)
            if (x >= -1055 && x <= -965 && z >= -425 && z <= -335) {
                return 8.0;
            }
            // 8. Shadow Realm Scadutree Base (outside_scadutree_avatar_sunflower_basin) (elev: -10.0m)
            if (x >= -1065 && x <= -975 && z >= 435 && z <= 525) {
                return -10.0;
            }
            // 8 Brand-New Monumental Outside Realm Expeditions (V47 Expansion)
            // 1. Jagged Peak Summit & Bayle's Dragonheart Roar (outside_jagged_peak_tyrant_summit) (elev: +22.0m)
            if (x >= -825 && x <= -735 && z >= -145 && z <= -55) {
                return 22.0;
            }
            // 2. Fishing Hamlet Coast of the Orphan (outside_fishing_hamlet_orphan_coast) (elev: -8.0m)
            if (x >= -845 && x <= -755 && z >= 135 && z <= 225) {
                return -8.0;
            }
            // 3. Kiln of the First Flame & Cinder Ash Dais (outside_kiln_soul_of_cinder_dais) (elev: +4.0m)
            if (x >= -865 && x <= -775 && z >= -325 && z <= -235) {
                return 4.0;
            }
            // 4. Ash Lake Primeval Stone Dragon Hollow (outside_ash_lake_everlasting_hollow) (elev: -12.0m)
            if (x >= -805 && x <= -715 && z >= -365 && z <= -275) {
                return -12.0;
            }
            // 5. Grand Cloister of the Lake of Rot & Astel Void Maw (outside_astel_naturalborn_void_cloister) (elev: -15.0m)
            if (x >= -885 && x <= -795 && z >= -205 && z <= -115) {
                return -15.0;
            }
            // 6. Cainhurst Frozen Royal Throne (outside_cainhurst_martyr_logarius_throne) (elev: +18.0m)
            if (x >= -835 && x <= -745 && z >= 235 && z <= 325) {
                return 18.0;
            }
            // 7. Fountainhead Sacred Palace Waterway (outside_true_corrupted_monk_palace) (elev: +8.0m)
            if (x >= -855 && x <= -765 && z >= 35 && z <= 125) {
                return 8.0;
            }
            // 8. Sen's Fortress Skyward Iron Golem Rampart (outside_sens_iron_golem_rampart) (elev: +14.0m)
            if (x >= -805 && x <= -715 && z >= 335 && z <= 425) {
                return 14.0;
            }
            // 8 Brand-New Outside Realm Apex Expeditions (V41 Expansion)
            // 1. Haligtree Roots of Rotting Aeonia (outside_haligtree_aeonia_roots) (elev: -4.0m)
            if (x >= -685 && x <= -595 && z >= -225 && z <= -135) {
                return -4.0;
            }
            // 2. Enir-Ilim Divine Gate Staircase (outside_enir_ilim_divine_gate) (elev: +16.0m)
            if (x >= -725 && x <= -635 && z >= -85 && z <= 5) {
                return 16.0;
            }
            // 3. Iron Keep Polished Obsidian Altar (outside_iron_keep_alonne_dojo) (elev: +8.0m)
            if (x >= -695 && x <= -605 && z >= 35 && z <= 125) {
                return 8.0;
            }
            // 4. Old Chaos Throne of the Ivory King (outside_old_chaos_ivory_throne) (elev: -7.0m)
            if (x >= -735 && x <= -645 && z >= 75 && z <= 165) {
                return -7.0;
            }
            // 5. Dune of Filianore & Gael's Ashen Waste (outside_gael_ashen_waste) (elev: +2.0m)
            if (x >= -765 && x <= -675 && z >= -265 && z <= -175) {
                return 2.0;
            }
            // 6. Ringed City Abyssal Midir Chasm (outside_midir_abyssal_chasm) (elev: -10.0m)
            if (x >= -775 && x <= -685 && z >= -25 && z <= 65) {
                return -10.0;
            }
            // 7. Nightmare Corpse-River Cavern (outside_ludwig_nightmare_river) (elev: -3.0m)
            if (x >= -715 && x <= -625 && z >= 195 && z <= 285) {
                return -3.0;
            }
            // 8. Astral Clocktower Celestial Balcony (outside_clocktower_maria_balcony) (elev: +14.0m)
            if (x >= -755 && x <= -665 && z >= -185 && z <= -95) {
                return 14.0;
            }
            // 8 Previous Apex Outside Realm Elevations (Expanded 2x-2.5x Walkable Dias Bounds)
            // 1. Mohgwyn Blood Mausoleum & Dynastic Altar (outside_mohgwyn_blood_mausoleum) (elev: -6.0m)
            if (x >= -565 && x <= -475 && z >= 95 && z <= 185) {
                return -6.0;
            }
            // 2. Dragonbarrow Black Flame Sanctum (outside_black_flame_sanctum) (elev: +8.0m)
            if (x >= -595 && x <= -505 && z >= -125 && z <= -35) {
                return 8.0;
            }
            // 3. Timeless Eye Storm Sanctuary (outside_ancient_dragon_timeless_sanctuary) (elev: +14.0m)
            if (x >= -645 && x <= -515 && z >= -25 && z <= 105) {
                return 14.0;
            }
            // 4. Deeproot Depths Prince of Death (outside_deeproot_prince_of_death) (elev: -8.0m)
            if (x >= -575 && x <= -445 && z >= -225 && z <= -95) {
                return -8.0;
            }
            // 5. Sunken City of Shulva (outside_sunken_city_shulva) (elev: -5.0m)
            if (x >= -635 && x <= -505 && z >= 155 && z <= 285) {
                return -5.0;
            }
            // 6. Brume Tower Ashen Smelter Furnace (outside_brume_tower_foundry) (elev: +10.0m)
            if (x >= -605 && x <= -475 && z >= -285 && z <= -155) {
                return 10.0;
            }
            // 7. Castle Sol Eclipse Ramparts (outside_castle_sol_eclipse) (elev: +6.0m)
            if (x >= -665 && x <= -535 && z >= -185 && z <= -55) {
                return 6.0;
            }
            // 8. Carian Royal Moongazing Spire (outside_ranni_lunar_spire) (elev: +12.0m)
            if (x >= -685 && x <= -555 && z >= 95 && z <= 225) {
                return 12.0;
            }
            // 1. Celestial Falls & Moonlit Shrine (outside_celestial_falls_basin)
            if (x >= -325 && x <= -235 && z >= -125 && z <= -35) {
                return -2.0;
            }
            // 2. Cathedral of Dragon Communion (outside_cathedral_dragon_communion)
            if (x >= -355 && x <= -265 && z >= 65 && z <= 155) {
                return 3.0;
            }
            // 3. Tower of the Frenzied Flame (outside_frenzied_flame_overlook)
            if (x >= -385 && x <= -295 && z >= -185 && z <= -95) {
                return 8.0;
            }
            // 4. Golden Erdtree Royal Colonnade (outside_royal_colonnade_sanctum)
            if (x >= -305 && x <= -215 && z >= 135 && z <= 225) {
                return 2.0;
            }
            // 5. Forlorn Hound Evergaol Seal (outside_evergaol_bloodhound)
            if (x >= -235 && x <= -145 && z >= -205 && z <= -115) {
                return 0.0;
            }
            // 6. Titanite Colossus Smelting Caldera (outside_titan_forge_caldera)
            if (x >= -405 && x <= -315 && z >= -5 && z <= 85) {
                return -1.0;
            }
            // 7. Necromancer's Bone Barrow (outside_necromancer_bone_barrow)
            if (x >= -435 && x <= -345 && z >= -105 && z <= -15) {
                return 1.0;
            }
            // 8. Sunken Mist Lake & Spectral Gondola Pier (outside_sunken_gondola_harbor)
            if (x >= -465 && x <= -375 && z >= 45 && z <= 135) {
                return -3.0;
            }
            // 9. World-Tree Aerial Canopy Bridges (outside_ancient_archtree_canopy)
            if (x >= -495 && x <= -405 && z >= -65 && z <= 25) {
                return 12.0;
            }
            // 10. Emerald Farron Shrine (outside_emerald_farron_shrine)
            if (x >= -525 && x <= -435 && z >= -155 && z <= -65) {
                return 2.0;
            }
            // Mountaintops Flame Peak Cauldron (outside_flame_peak_cauldron) (x in [-285, -205], z in [-115, -45])
            if (x >= -285 && x <= -205 && z >= -115 && z <= -45) {
                return 8.0;
            }
            // Farum Azula Crumbling Tempest (outside_farum_azula_tempest) (x in [-275, -195], z in [-155, -85])
            if (x >= -275 && x <= -195 && z >= -155 && z <= -85) {
                return 7.0;
            }
            // Leyndell Erdtree Colosseum (outside_golden_capital_colosseum) (x in [-215, -135], z in [80, 150])
            if (x >= -215 && x <= -135 && z >= 80 && z <= 150) {
                return 5.0;
            }
            // Nokstella Eternal Moon Terrace (outside_nokstella_moon_terrace) (x in [-165, -85], z in [70, 140])
            if (x >= -165 && x <= -85 && z >= 70 && z <= 140) {
                return -3.0;
            }
            // Cathedral Drowned Necropolis (outside_drowned_abyssal_necropolis) (x in [-135, -55], z in [90, 160])
            if (x >= -135 && x <= -55 && z >= 90 && z <= 160) {
                return -2.5;
            }
            // Carian Star Observatory (x in [-140, -70], z in [-120, -50])
            if (x >= -140 && x <= -70 && z >= -120 && z <= -50) {
                return 3.5;
            }
            // Scorched Dragonbarrow (x in [-245, -175], z in [25, 95])
            if (x >= -245 && x <= -175 && z >= 25 && z <= 95) {
                return 2.0;
            }
            // Forbidden Mistwood Ruins (x in [-100, -30], z in [-110, -40])
            if (x >= -100 && x <= -30 && z >= -110 && z <= -40) {
                return 0.0;
            }
            // Abyssal Eclipse Chasm (x in [-260, -190], z in [-70, 0])
            if (x >= -260 && x <= -190 && z >= -70 && z <= 0) {
                return -4.0;
            }
            // Frozen Wyrmpeak Precipice (x in [-275, -205], z in [-20, 50])
            if (x >= -275 && x <= -205 && z >= -20 && z <= 50) {
                return 6.0;
            }
            // Stormveil Cliffside Ramparts (x in [-180, -110], z in [-130, -60])
            if (x >= -180 && x <= -110 && z >= -130 && z <= -60) {
                return 4.0;
            }
            // Astral Meteor Crater (x in [-195, -125], z in [-95, -25])
            if (x >= -195 && x <= -125 && z >= -95 && z <= -25) {
                return -2.5;
            }
            // Magma Chasm Falls (x in [-215, -145], z in [-55, 5])
            if (x >= -215 && x <= -145 && z >= -55 && z <= 5) {
                return -1.5;
            }
            // Sunken Dragon Crypt (x in [-215, -140], z in [-15, 50])
            if (x >= -215 && x <= -140 && z >= -15 && z <= 50) {
                return -3.0;
            }
            // Wyrm Cliffside Plateau (x in [-205, -110], z in [12, 105])
            if (x >= -205 && x <= -110 && z >= 12 && z <= 105) {
                if (x > -140) {
                    const t = (-130 - x) / 10.0;
                    return t * 2.0;
                }
                return 2.0;
            }
            return 0.0;
        }

        // 6. Main Courtyard Starting Arena (z in [-2280, 545], x in [-480, 480] - 3x Lengthened 900m x 2,790m Imperial Acropolis)
        if (x >= -480 && x <= 480 && z >= -2280 && z <= 545) {
            if (!inStairTrench && (currentY === null || currentY >= -1.5)) {
                return 0.0;
            }
        }

        // Fallen Starship Interior Deck & Ramp (x in [-115, -35], z in [14, 66]) - Dedicated Bazaar Deck
        if (x >= -115 && x <= -35 && z >= 14 && z <= 66) {
            return 0.0;
        }

        // --- 10 BRAND-NEW MEGATERRITORY LOCATIONS GROUND HEIGHT COLLISION ---
        // 1. Valley of the Weeping Drakes (x in [-740, -560], z in [260, 440], elev: -4.0m)
        if (x >= -740 && x <= -560 && z >= 260 && z <= 440) return -4.0;
        // 2. Sunken Cathedral of Archbishops (x in [460, 640], z in [410, 590], elev: -3.0m)
        if (x >= 460 && x <= 640 && z >= 410 && z <= 590) return -3.0;
        // 3. Cinder Peak & Obsidian Caldera (x in [-840, -660], z in [-490, -310], elev: +10.0m)
        if (x >= -840 && x <= -660 && z >= -490 && z <= -310) return 10.0;
        // 4. Frozen Glade of Astral Giants (x in [560, 740], z in [-440, -260], elev: +6.0m)
        if (x >= 560 && x <= 740 && z >= -440 && z <= -260) return 6.0;
        // 5. High Iron Fortress & Bastion of the Lost Legion (x in [610, 790], z in [160, 340], elev: +14.0m)
        if (x >= 610 && x <= 790 && z >= 160 && z <= 340) return 14.0;
        // 6. Blighted Mangrove & Toxic Stilt Village (x in [-640, -460], z in [-290, -110], elev: -6.0m)
        if (x >= -640 && x <= -460 && z >= -290 && z <= -110) return -6.0;
        // 7. The Crystal Grotto of Seath (x in [-440, -260], z in [660, 840], elev: -8.0m)
        if (x >= -440 && x <= -260 && z >= 660 && z <= 840) return -8.0;
        // 8. Ruins of the Sunken Sun Palace (x in [310, 490], z in [-640, -460], elev: +3.0m)
        if (x >= 310 && x <= 490 && z >= -640 && z <= -460) return 3.0;
        // 9. The Abyssal Rift & Void Maw (x in [-120, 120], z in [12800, 13800] & [4380, 4650], elev: -12.0m)
        if (x >= -120 && x <= 120 && ((z >= 12800 && z <= 13800) || (z >= 4380 && z <= 4650))) return -12.0;
        // 10. The Grand Necropolis of the First Lords (x in [-950, -750], z in [-100, 100], elev: 0.0m)
        if (x >= -950 && x <= -750 && z >= -100 && z <= 100) return 0.0;

        // 6b. Outside Realm: Primeval Darkroot Forest & Expanded Megalithic Wildlands (Scaled to 96,000m)
        if (x >= -48000.0 && x <= 48000.0 && z >= -48000.0 && z <= 48000.0) {
            if (currentY === null || currentY >= -2.5) {
                return 0.0;
            }
        }

        // 7. Dynamic Fast-Travel Lordran Realm Ground Height (Nearest location dais clamping within 600m radius for 8x expanded locations)
        if (window.DARK_SOULS_LOCATIONS) {
            let closestLoc = null;
            let minDistSq = 600 * 600;
            for (let i = 0; i < window.DARK_SOULS_LOCATIONS.length; i++) {
                const loc = window.DARK_SOULS_LOCATIONS[i];
                const dx = x - loc.pos[0];
                const dz = z - loc.pos[2];
                const d2 = dx * dx + dz * dz;
                if (d2 < minDistSq) {
                    if (currentY === null || Math.abs(currentY - loc.pos[1]) < 22.0) {
                        minDistSq = d2;
                        closestLoc = loc;
                    }
                }
            }
            if (closestLoc) return closestLoc.pos[1];
        }

        
        // --- 10 OUTSIDE LOCATIONS COLLISION (Expanded Bounds) ---
        if (x >= -95 && x <= -25 && z >= 20 && z <= 80) return -6.0;  // Darkroot Basin (-6m)
        if (x >= 25 && x <= 85 && z >= -10 && z <= 50) return 12.0;    // Sen's Fortress (+12m)
        if (x >= -65 && x <= -5 && z >= 80 && z <= 140) return -9.0;  // Demon Ruins (-9m)
        if (x >= 15 && x <= 75 && z >= 55 && z <= 115) return 4.0;    // Crystal Cave (+4m)
        if (x >= -85 && x <= -25 && z >= -75 && z <= -15) return 1.5; // Oolacile Glade (+1.5m)
        if (x >= -75 && x <= -15 && z >= -55 && z <= 5) return 0.0;   // Majula Cliffs (0m)
        if (x >= 35 && x <= 95 && z >= 35 && z <= 95) return 14.0;    // Dragon Aerie (+14m)
        if (x >= 10 && x <= 65 && z >= -65 && z <= -5) return -2.5;   // Cemetery of Ash (-2.5m)
        if (x >= 30 && x <= 90 && z >= -45 && z <= 15) return 2.0;    // Stormhill (+2m)

        // 8. Undead Burg Outskirts - Cliffside Dragon Chasm (x in [-85, -29], z in [-15, 55])
        if (x >= -85 && x <= -29 && z >= -15 && z <= 55) {
            if (x > -42) {
                const t = (-29 - x) / 13.0;
                return -t * 2.0;
            }
            return -2.0;
        }

        // 8. Citadel & Outside Realm Perimeter Failsafe: Never fall into void within explored grounds
        if ((x >= -55 && x <= 55 && z >= -35 && z <= 440) || (x >= -1590 && x <= -28 && z >= -850 && z <= 850)) {
            if (currentY === null || currentY >= -1.8) {
                return (x <= -130 && x >= -185 && z >= 15 && z <= 80) ? 2.0 : 0.0;
            }
            return -4.92;
        }

        // Beyond citadel architectural borders lies the bottomless chasm
        return -50.0;
    }

    buildEnvironment() {
        // 1. Courtyard Floor (Starting area) - 3x Lengthened 900m x 930m Imperial Acropolis Plaza
        // North Courtyard Floor Slab (z in [-2250, 36], x in [-450, 450]) - 900m x 2,286m Vast Courtyard
        const northCourtyardGeo = new THREE.PlaneGeometry(900, 2286);
        const northCourtyard = new THREE.Mesh(northCourtyardGeo, this.stoneMat);
        northCourtyard.rotation.x = -Math.PI / 2;
        northCourtyard.position.set(0, 0, -1107);
        northCourtyard.receiveShadow = true;
        this.scene.add(northCourtyard);

        // Center Promenade Floor Slab (z in [36, 540], x in [-90, 90] - 180m wide gateway promenade, 504m long)
        const centerCourtyardGeo = new THREE.PlaneGeometry(180, 504);
        const centerCourtyard = new THREE.Mesh(centerCourtyardGeo, this.stoneMat);
        centerCourtyard.rotation.x = -Math.PI / 2;
        centerCourtyard.position.set(0, 0, 288);
        centerCourtyard.receiveShadow = true;
        this.scene.add(centerCourtyard);

        // Far West Battlement Floor Slab (z in [36, 540], x in [-450, -90]) - 360m wide, 504m long
        const westCourtyardGeo = new THREE.PlaneGeometry(360, 504);
        const westCourtyard = new THREE.Mesh(westCourtyardGeo, this.stoneMat);
        westCourtyard.rotation.x = -Math.PI / 2;
        westCourtyard.position.set(-270.0, 0, 288);
        westCourtyard.receiveShadow = true;
        this.scene.add(westCourtyard);

        // Far East Battlement Floor Slab (z in [36, 540], x in [90, 450]) - 360m wide, 504m long
        const eastCourtyardGeo = new THREE.PlaneGeometry(360, 504);
        const eastCourtyard = new THREE.Mesh(eastCourtyardGeo, this.stoneMat);
        eastCourtyard.rotation.x = -Math.PI / 2;
        eastCourtyard.position.set(270.0, 0, 288);
        eastCourtyard.receiveShadow = true;
        this.scene.add(eastCourtyard);

        // Protective Gothic Stone Balustrades flanking Center Promenade (at x = -90.0 and x = 90.0, matching 180m bridge)
        this.createWall(-90.0, 1.2, 288.0, 0.6, 2.4, 504); // West Promenade Balustrade
        this.createWall(90.0, 1.2, 288.0, 0.6, 2.4, 504);  // East Promenade Balustrade

        // Outer balustrades along West and East battlements
        this.createWall(-450.0, 1.2, 288.0, 0.6, 2.4, 504); // West Outer Balustrade
        this.createWall(450.0, 1.2, 288.0, 0.6, 2.4, 504);  // East Outer Balustrade

        // Corner abutments connecting promenade to Bridge portal (sealing gap at z=540)
        this.createWall(-270.0, 1.5, 540.0, 360.0, 3.0, 1.2);
        this.createWall(270.0, 1.5, 540.0, 360.0, 3.0, 1.2);

        // Outer Courtyard Fortress Walls (North Gate open at x in [-40, 40] for Serpent Sanctuary, z = -2250)
        this.createWall(-245.0, 6, -2250, 410, 12, 3); // West segment of North wall (x: -450 to -40)
        this.createWall(245.0, 6, -2250, 410, 12, 3);  // East segment of North wall (x: 40 to 450)
        this.createWall(0, 12.0, -2250, 80, 4, 3);     // Overhead monumental arch lintel above doorway

        // Outer West Fortress Wall (at x = -450, Gate Arch open at z in [-32, 32] leading to OUTSIDE REALM)
        this.createWall(-450, 6, -1141.0, 3, 12, 2218); // North segment of West wall (z: -2250 to -32)
        this.createWall(-450, 6, 286.0, 3, 12, 508);   // South segment of West wall (z: 32 to 540)
        this.createWall(-450, 12.0, 0, 3, 4, 64);     // Overhead monumental arch lintel above West Gate
        this.createPillar(-450, -32, 14);
        this.createPillar(-450, 32, 14);
        this.createTorch(-449.2, 6.0, -31.8, { intensity: 4.5, color: 0x2ecc71 });
        this.createTorch(-449.2, 6.0, 31.8, { intensity: 4.5, color: 0x2ecc71 });

        // Flanking West Gate Waystone Brazier placed beside North pillar
        this.createPathBeacon(-448.0, 0, -30.0, 0x2ecc71, "🌲 OUTSIDE REALM: DARKROOT WOODS & CLIFFS [WEST]", "ANCIENT ARCHTREES • DRAGON CLIFFS • WYRMS & BASILISKS", "#a8ffb2", false);

        // Cobblestone flagstone threshold paving connecting Firelink to Darkroot
        const gatePaving = new THREE.Mesh(new THREE.PlaneGeometry(96, 64), this.cobbleMat || this.stoneMat);
        gatePaving.rotation.x = -Math.PI / 2;
        gatePaving.position.set(-450, 0.015, 0);
        gatePaving.receiveShadow = true;
        this.scene.add(gatePaving);

        // West Gate In-World Portal to Outside Darkroot Bonfire
        this.interactables.push({
            type: 'route_portal',
            position: new THREE.Vector3(-445, 0, 0),
            radius: 12.0,
            prompt: '🌲 [ E ] WAYSTONE: WARP TO OUTSIDE DARKROOT EXPEDITION',
            targetPos: new THREE.Vector3(-550, 0, 0),
            label: 'DARKROOT OUTSIDE REALM'
        });

        this.createWall(450, 6, -855, 3, 12, 2790);    // East wall (at x = 450, spans z: -2250 to 540)

        // South Wall Openings (Central Bridge opening matches 180m viaduct at x=[-90, 90], z = 540)
        this.createWall(-270.0, 6, 540, 360, 12, 3);
        this.createWall(270.0, 6, 540, 360, 12, 3);

        // Gothic pillars in courtyard (Monumental imperial spread across 900m x 2,790m plaza)
        const pillarCoords = [
            [-120, -1500], [120, -1500],
            [-120, -750], [120, -750],
            [-120, 150], [120, 150],
            [-300, -1000], [300, -1000],
            [-300, 200], [300, 200]
        ];
        pillarCoords.forEach(([px, pz]) => {
            this.createPillar(px, pz, 14);
        });

        
        // ----------------------------------------------------
        // OUTSIDE LOCATION: UNDEAD BURG OUTSKIRTS - CLIFFSIDE DRAGON CHASM
        // Position: X in [-310, -150], Z in [-50, 90], Elevation: Y = -2.0m
        // ----------------------------------------------------
        // 1. Gateway Breach in West Fortress Wall (Archway at x=-150, z=18)
        const breachArchL = new THREE.Mesh(new THREE.BoxGeometry(2.4, 7.5, 1.6), this.wallMat);
        breachArchL.position.set(-150, 3.75, 12);
        this.scene.add(breachArchL);
        const breachArchR = new THREE.Mesh(new THREE.BoxGeometry(2.4, 7.5, 1.6), this.wallMat);
        breachArchR.position.set(-150, 3.75, 24);
        this.scene.add(breachArchR);
        const breachArchTop = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.0, 14), this.wallMat);
        breachArchTop.position.set(-150, 8.5, 18);
        this.scene.add(breachArchTop);

        // 2. Suspension Mountain Bridge over bottomless gorge (x: -150 to -180, z: 10 to 26)
        const bridgeSlab = new THREE.Mesh(new THREE.BoxGeometry(30, 0.8, 16.0), this.stoneMat);
        bridgeSlab.position.set(-165.0, -1.0, 18);
        bridgeSlab.rotation.z = Math.atan2(2.0, 30.0);
        bridgeSlab.receiveShadow = true;
        this.scene.add(bridgeSlab);

        // Bridge balustrades & chains
        const chainGeom = new THREE.CylinderGeometry(0.08, 0.08, 30.5, 8);
        const chainL = new THREE.Mesh(chainGeom, this.darkSteelMat);
        chainL.position.set(-165.0, 0.5, 10.2);
        chainL.rotation.z = Math.PI / 2 - Math.atan2(2.0, 30.0);
        this.scene.add(chainL);
        const chainR = new THREE.Mesh(chainGeom, this.darkSteelMat);
        chainR.position.set(-165.0, 0.5, 25.8);
        chainR.rotation.z = Math.PI / 2 - Math.atan2(2.0, 30.0);
        this.scene.add(chainR);

        // 3. Vast Mountain Cliffside Plateau Slab (x: -310 to -180, z: -50 to 90, y=-2.0) - 130m x 140m
        const plateauGeo = new THREE.BoxGeometry(130, 1.5, 140);
        const plateauMat = this.stoneMat.clone();
        const plateauMesh = new THREE.Mesh(plateauGeo, plateauMat);
        plateauMesh.position.set(-245.0, -2.75, 20.0);
        plateauMesh.receiveShadow = true;
        this.scene.add(plateauMesh);

        // 4. Perimeter Jagged Cliffs & Ancient Battlements along edge
        const cliffPosts = [
            [-308, -40], [-308, 0], [-308, 30], [-308, 60], [-308, 88],
            [-245, -48], [-185, -48],
            [-245, 88], [-185, 88]
        ];
        cliffPosts.forEach(([cx, cz]) => {
            const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(4.5, 1), this.wallMat);
            rock.position.set(cx, -1.2, cz);
            rock.scale.set(1.5, 3.0, 1.5);
            rock.castShadow = true;
            this.scene.add(rock);
        });

        // 5. Standing Braziers & Torches at Outskirts Cliff
        this.createStandingBrazier(-195, -2.0, 0, 0xff5511, 5.0, 36);
        this.createStandingBrazier(-195, -2.0, 36, 0xff5511, 5.0, 36);
        this.createStandingBrazier(-290, -2.0, 20, 0xff7722, 5.5, 40);

        // 6. Colossal Ancient Dragon Skull Relic at cliff edge
        const dragonSkull = new THREE.Mesh(new THREE.ConeGeometry(6.0, 12.0, 5), this.boneMat || this.stoneMat);
        dragonSkull.position.set(-285, 0.0, 20);
        dragonSkull.rotation.z = Math.PI / 2 - 0.2;
        dragonSkull.rotation.y = -Math.PI / 2;
        dragonSkull.castShadow = true;
        this.scene.add(dragonSkull);

        // 7. Primal Outskirts Bonfire at (-220, -2.0, 20)
        this.createFloorSoapstone(-220, -2.0, 16, '#ff7722', "⛰️ UNDEAD BURG OUTSKIRTS", "Windswept dragon chasm beyond the fortress wall");

        // Interactive Portals between Courtyard & Outskirts
        this.interactables.push({
            type: 'route_portal',
            position: new THREE.Vector3(-147, 0, 18),
            radius: 6.0,
            prompt: '⛰️ [ E ] PASS TO BURG OUTSKIRTS (CLIFF CHASM: -2m)',
            targetPos: new THREE.Vector3(-195, -2.0, 18),
            label: 'UNDEAD BURG OUTSKIRTS'
        });

        this.interactables.push({
            type: 'route_portal',
            position: new THREE.Vector3(-185, -2.0, 18),
            radius: 6.0,
            prompt: '☀️ [ E ] RETURN TO FIRELINK COURTYARD (0m)',
            targetPos: new THREE.Vector3(0, 0, 0),
            label: 'FIRELINK COURTYARD'
        });

        
        // Clean citadel perimeter - legacy mockup dioramas removed in favor of full Outside Realm territories

        // ----------------------------------------------------
        // PATH 1: THE HIGH CASTLE RAMPARTS (UP: Y = 6.0)
        // Grand Stone Staircase, Battlements, Overlooks, Watchtower
        // ----------------------------------------------------
        // East Ascending Staircase (18 Stone Steps from z=4 to z=22 climbing to y=6.0)
        for (let i = 0; i < 18; i++) {
            const stepZ = 4.5 + i * 1.0;
            const stepH = (i + 1) * (6.0 / 18);
            const stepGeo = new THREE.BoxGeometry(9.8, stepH, 1.05);
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

        // Solid masonry side balustrades along East Stairs (prevents falling and floating look)
        const handrailGeo = new THREE.BoxGeometry(0.45, 1.2, 19.2);
        const handrailL = new THREE.Mesh(handrailGeo, this.stoneMat);
        handrailL.position.set(15.75, 3.6, 13.5);
        handrailL.rotation.x = Math.atan2(6.0, 18.0);
        handrailL.castShadow = true;
        handrailL.receiveShadow = true;
        this.scene.add(handrailL);

        const handrailR = new THREE.Mesh(handrailGeo, this.stoneMat);
        handrailR.position.set(24.25, 3.6, 13.5);
        handrailR.rotation.x = Math.atan2(6.0, 18.0);
        handrailR.castShadow = true;
        handrailR.receiveShadow = true;
        this.scene.add(handrailR);

        // Solid stair side skirt filling under steps on both sides
        const skirtGeo = new THREE.BoxGeometry(0.3, 3.5, 18.5);
        const skirtL = new THREE.Mesh(skirtGeo, this.wallMat);
        skirtL.position.set(15.8, 1.6, 13.5);
        skirtL.rotation.x = Math.atan2(6.0, 18.0);
        this.scene.add(skirtL);

        const skirtR = new THREE.Mesh(skirtGeo, this.wallMat);
        skirtR.position.set(24.2, 1.6, 13.5);
        skirtR.rotation.x = Math.atan2(6.0, 18.0);
        this.scene.add(skirtR);

        this.colliders.push(new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(15.75, 3.5, 13.5),
            new THREE.Vector3(0.6, 5.0, 19.0)
        ));
        this.colliders.push(new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(24.25, 3.5, 13.5),
            new THREE.Vector3(0.6, 5.0, 19.0)
        ));

        // Upper Ramparts Walkway Elevated Floor Slab (Extended 3-4x: z=22 to z=270 at y=5.5)
        const rampartFloorGeo = new THREE.BoxGeometry(10.0, 1.0, 248);
        const rampartFloorMat = this.stoneMat.clone();
        rampartFloorMat.map = rampartFloorMat.map.clone();
        rampartFloorMat.map.repeat.set(3, 80);
        if (rampartFloorMat.bumpMap) {
            rampartFloorMat.bumpMap = rampartFloorMat.bumpMap.clone();
            rampartFloorMat.bumpMap.repeat.set(3, 80);
        }
        if (rampartFloorMat.roughnessMap) {
            rampartFloorMat.roughnessMap = rampartFloorMat.roughnessMap.clone();
            rampartFloorMat.roughnessMap.repeat.set(3, 80);
        }
        const rampartFloor = new THREE.Mesh(rampartFloorGeo, rampartFloorMat);
        rampartFloor.position.set(20, 5.5, 146);
        rampartFloor.receiveShadow = true;
        this.scene.add(rampartFloor);

        // Outer Fortress Wall with Crenellations along East Ramparts (z=22 to 270)
        this.createWall(24.6, 8.0, 146, 1.2, 4.0, 248);
        this.createWall(20.0, 8.0, 270.5, 8.5, 4.0, 1.2); // North containment wall of High Ramparts Walkway
        for (let cz = 24; cz <= 268; cz += 4) {
            const cren = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 2.0), this.wallMat);
            cren.position.set(24.6, 10.5, cz);
            cren.castShadow = true;
            this.scene.add(cren);
        }

        // Inner Overlook Railing facing Bridge below (x=15.4, y=6.8, z=22 to 270)
        this.createWall(15.4, 6.8, 146, 0.6, 1.6, 248);

        // Solid Inner Supporting Wall facing Courtyard (prevents floating ramparts look, solid from y=0 to y=5.5)
        this.createWall(15.4, 2.75, 146, 0.8, 5.5, 248);

        // Ramparts Watchtowers at intervals (z=75, z=145, z=215, z=268)
        [75, 145, 215, 268].forEach(tz => {
            const watchtower = new THREE.Mesh(new THREE.BoxGeometry(8, 14, 8), this.wallMat);
            watchtower.position.set(21, 10.0, tz);
            watchtower.castShadow = true;
            watchtower.receiveShadow = true;
            this.scene.add(watchtower);
            this.createGoldenBrazier(17, 17.5, tz);
            this.createGoldenBrazier(25, 17.5, tz);
        });

        // Torches along High Castle Ramparts
        for (let rz = 28; rz <= 264; rz += 16) {
            this.createTorch(24.0, 8.2, rz, { intensity: 2.6, radius: 18 });
            this.createTorch(15.9, 7.5, rz, { intensity: 2.2, radius: 16 });
        }

        // Descent Ramp from Ramparts down to Fog Gate area (z=268 to 274)
        for (let i = 0; i < 6; i++) {
            const stepZ = 268.5 + i * 1.0;
            const stepH = (6 - i) * (6.0 / 6);
            const stepGeo = new THREE.BoxGeometry(8.5, stepH, 1.05);
            const stepMesh = new THREE.Mesh(stepGeo, this.stoneMat);
            stepMesh.position.set(20, stepH / 2, stepZ);
            stepMesh.receiveShadow = true;
            this.scene.add(stepMesh);
        }

        // ----------------------------------------------------
        // PATH 2: ROYAL PROCESSION BRIDGE / CITADEL VIADUCT (MAIN: Y = 0.0)
        // 3x Lengthened 3,600m Imperial Viaduct (180m wide, 3,600m long, z: 540 to 4140)
        // ----------------------------------------------------
        const bridgeGeo = new THREE.BoxGeometry(180, 2, 3600);
        const bridgeMat = this.stoneMat.clone();
        bridgeMat.map = bridgeMat.map.clone();
        bridgeMat.map.repeat.set(30, 720);
        if (bridgeMat.bumpMap) {
            bridgeMat.bumpMap = bridgeMat.bumpMap.clone();
            bridgeMat.bumpMap.repeat.set(30, 720);
        }
        if (bridgeMat.roughnessMap) {
            bridgeMat.roughnessMap = bridgeMat.roughnessMap.clone();
            bridgeMat.roughnessMap.repeat.set(30, 720);
        }
        const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
        bridge.position.set(0, -1, 2340);
        bridge.receiveShadow = true;
        this.scene.add(bridge);

        // Bridge Parapets (monumental 180m wide, 3,600m long viaduct)
        this.createWall(-89.5, 1.5, 2340, 1, 3, 3600); // Left rail
        this.createWall(89.5, 1.5, 2340, 1, 3, 3600);  // Right rail

        // Continuous Torches along both parapets of the Royal Bridge (Every 50m)
        for (let btz = 560; btz <= 4120; btz += 50) {
            this.createTorch(-88.8, 2.8, btz, { intensity: 3.8, radius: 28 });
            this.createTorch(88.8, 2.8, btz, { intensity: 3.8, radius: 28 });
        }

        // Grand Standing Braziers at Bridge Portal, Causeway, and Gatehouses
        this.createStandingBrazier(-85.0, 0, 542, 0xff7722, 5.5, 36);
        this.createStandingBrazier(85.0, 0, 542, 0xff7722, 5.5, 36);

        // Mid-bridge Fortified Gatehouse Arch 1 at z = 1440 (Spans the 180m wide causeway)
        const midArch1L = new THREE.Mesh(new THREE.BoxGeometry(4.0, 18, 5), this.wallMat);
        midArch1L.position.set(-89.0, 9, 1440);
        this.scene.add(midArch1L);
        const midArch1R = new THREE.Mesh(new THREE.BoxGeometry(4.0, 18, 5), this.wallMat);
        midArch1R.position.set(89.0, 9, 1440);
        this.scene.add(midArch1R);
        const midArch1Top = new THREE.Mesh(new THREE.BoxGeometry(184.0, 4.5, 5), this.wallMat);
        midArch1Top.position.set(0, 18.0, 1440);
        this.scene.add(midArch1Top);
        this.createStandingBrazier(-85.0, 0, 1440, 0xffaa33, 5.5, 36);
        this.createStandingBrazier(85.0, 0, 1440, 0xffaa33, 5.5, 36);

        // Mid-bridge Fortified Gatehouse Arch 2 at z = 2340 (Spans the 180m wide causeway)
        const midArch2L = new THREE.Mesh(new THREE.BoxGeometry(4.0, 18, 5), this.wallMat);
        midArch2L.position.set(-89.0, 9, 2340);
        this.scene.add(midArch2L);
        const midArch2R = new THREE.Mesh(new THREE.BoxGeometry(4.0, 18, 5), this.wallMat);
        midArch2R.position.set(89.0, 9, 2340);
        this.scene.add(midArch2R);
        const midArch2Top = new THREE.Mesh(new THREE.BoxGeometry(184.0, 4.5, 5), this.wallMat);
        midArch2Top.position.set(0, 18.0, 2340);
        this.scene.add(midArch2Top);
        this.createStandingBrazier(-85.0, 0, 2340, 0xffaa33, 5.5, 36);
        this.createStandingBrazier(85.0, 0, 2340, 0xffaa33, 5.5, 36);

        // Mid-bridge Fortified Gatehouse Arch 3 at z = 3240 (Spans the 180m wide causeway)
        const midArch3L = new THREE.Mesh(new THREE.BoxGeometry(4.0, 18, 5), this.wallMat);
        midArch3L.position.set(-89.0, 9, 3240);
        this.scene.add(midArch3L);
        const midArch3R = new THREE.Mesh(new THREE.BoxGeometry(4.0, 18, 5), this.wallMat);
        midArch3R.position.set(89.0, 9, 3240);
        this.scene.add(midArch3R);
        const midArch3Top = new THREE.Mesh(new THREE.BoxGeometry(184.0, 4.5, 5), this.wallMat);
        midArch3Top.position.set(0, 18.0, 3240);
        this.scene.add(midArch3Top);
        this.createStandingBrazier(-85.0, 0, 3240, 0xffaa33, 5.5, 36);
        this.createStandingBrazier(85.0, 0, 3240, 0xffaa33, 5.5, 36);

        this.createStandingBrazier(-85.0, 0, 4135, 0xffaa33, 5.5, 36);
        this.createStandingBrazier(85.0, 0, 4135, 0xffaa33, 5.5, 36);

        // ----------------------------------------------------
        // PATH 3: FLOODED SUBTERRANEAN CATACOMBS (DOWN: Y = -5.0)
        // Extended 3-4x from 68m to 248 METERS! (z = 22 to z = 270)
        // ----------------------------------------------------
        for (let i = 0; i < 18; i++) {
            const stepZ = 4.5 + i * 1.0;
            const stepTop = - (i + 1) * (4.92 / 18);
            const stepH = Math.max(0.45, stepTop - (-4.92));
            const stepGeo = new THREE.BoxGeometry(8.2, stepH, 1.05);
            const stepMesh = new THREE.Mesh(stepGeo, this.stoneMat);
            stepMesh.position.set(-20, -4.92 + stepH / 2, stepZ);
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

        // Solid side containment walls spanning from deep bedrock (y=-5.0) to parapet top (y=4.0)
        this.createWall(-24.6, -0.5, 13, 0.8, 9.0, 18);
        this.createWall(-15.4, -0.5, 13, 0.8, 9.0, 18);

        const tunnelCeil = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.8, 18.5), this.stoneMat);
        tunnelCeil.position.set(-20, 3.8, 13);
        tunnelCeil.rotation.x = -Math.atan2(5.0, 18.0);
        this.scene.add(tunnelCeil);

        // Flooded Crypt Corridor Floor Slab (y=-5.5, z=22 to z=270: 248m length!)
        const cryptFloorGeo = new THREE.BoxGeometry(9, 1.0, 248);
        const cryptFloor = new THREE.Mesh(cryptFloorGeo, this.stoneMat);
        cryptFloor.position.set(-20, -5.5, 146);
        cryptFloor.receiveShadow = true;
        this.scene.add(cryptFloor);

        // Shallow Flooded Murky Water Plane (y=-4.92, length 246m)
        const waterGeo = new THREE.PlaneGeometry(8.6, 246);
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x0a2624,
            roughness: 0.15,
            metalness: 0.55,
            transparent: true,
            opacity: 0.82
        });
        const waterPlane = new THREE.Mesh(waterGeo, waterMat);
        waterPlane.rotation.x = -Math.PI / 2;
        waterPlane.position.set(-20, -4.92, 146);
        waterPlane.receiveShadow = true;
        this.scene.add(waterPlane);

        // Crypt Side Fortress Walls - Subterranean only (y = -2.5, h = 5.0) so it stays underground beneath surface courtyard floor
        this.createWall(-25.2, -2.5, 146, 1.5, 5.0, 252);
        this.createWall(-14.8, -2.5, 146, 1.5, 5.0, 252);

        // Surface Parapet Walls enclosing the Catacombs Trench from Courtyard View (clean gothic parapets at y=0.8)
        this.createWall(-25.2, 0.8, 146, 0.8, 1.6, 248);
        this.createWall(-14.8, 0.8, 146, 0.8, 1.6, 248);

        // Crypt End-Cap Enclosure Wall (seals exit before boss fog gate underground at z=271.5)
        this.createWall(-20, -2.5, 271.5, 12.0, 5.0, 1.5);

        // Sunken Catacombs Grand Colonnade Vaulted Arches every 12m (Open to the sunlit azure sky!)
        for (let caz = 24; caz <= 268; caz += 12) {
            // Radiant Crypt Lantern Light illuminating both floor and architecture
            const cryptLantern = new THREE.PointLight(0xa0e8ff, 4.2, 32, 0.8);
            cryptLantern.position.set(-20, 2.5, caz);
            this.scene.add(cryptLantern);

            // Overhead Vaulted Stone Arch framing the blue sky
            const cryptArch = new THREE.Mesh(new THREE.BoxGeometry(11.0, 1.4, 1.4), this.wallMat);
            cryptArch.position.set(-20, 4.5, caz);
            cryptArch.castShadow = true;
            this.scene.add(cryptArch);

            // Flying Buttresses connecting to canyon walls
            const buttL = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.8, 1.2), this.wallMat);
            buttL.position.set(-24.5, 3.8, caz);
            this.scene.add(buttL);

            const buttR = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.8, 1.2), this.wallMat);
            buttR.position.set(-15.5, 3.8, caz);
            this.scene.add(buttR);

            // Emerald Ghostfire Braziers in Crypt
            this.createStandingBrazier(-18.5, -4.9, caz, 0x00ffcc, 4.5, 26);
            this.createStandingBrazier(-21.5, -4.9, caz, 0x00ffcc, 4.5, 26);
        }

        // Golden Surface Portal Light at Crypt Entryway (z=28)
        const surfacePortalLight = new THREE.PointLight(0xfffaea, 4.8, 32, 0.8);
        surfacePortalLight.position.set(-20, -1.0, 28);
        this.scene.add(surfacePortalLight);

        // Return Portal to Surface Courtyard from inside the Catacombs (Entryway at z=28)
        this.interactables.push({
            type: 'route_portal',
            position: new THREE.Vector3(-20, -4.92, 28),
            radius: 5.5,
            prompt: '☀️ [ E ] TELEPORT TO SURFACE (COURTYARD: 0m)',
            targetPos: new THREE.Vector3(0, 0, 0),
            label: 'SURFACE COURTYARD'
        });

        // Catacombs Exit Portal back to surface before Fog Gate (z=266)
        this.interactables.push({
            type: 'route_portal',
            position: new THREE.Vector3(-20, -4.92, 266),
            radius: 5.5,
            prompt: '⚔️ [ E ] ASCEND TO SURFACE (BOSS FOG GATE: 0m)',
            targetPos: new THREE.Vector3(0, 0, 4135),
            label: 'SURFACE BOSS GATE'
        });

        // Crypt Exit Ascent Stairs back to Fog Gate area (z=268 to 274)
        for (let i = 0; i < 6; i++) {
            const stepZ = 268.5 + i * 1.0;
            const stepH = (i + 1) * (4.92 / 6);
            const stepGeo = new THREE.BoxGeometry(8, 0.45, 1.05);
            const stepMesh = new THREE.Mesh(stepGeo, this.stoneMat);
            stepMesh.position.set(-20, -4.92 + stepH, stepZ);
            stepMesh.receiveShadow = true;
            this.scene.add(stepMesh);
        }

        // DRAMATIC ILLUMINATED PATH BEACONS & GUIDANCE RUNES (NO UNWANTED PROMENADE TELEPORTATION)
        // 1. In Central Courtyard Promenade (Safe, clear, informational guidance braziers & soapstones only)
        this.createPathBeacon(-6.5, 0, 18, 0x00ffaa, "💀 UNDERGROUND CATACOMBS [DOWN]", "LEVEL -5m • FLOODED CRYPTS & SKELETONS", "#a5ffbe", true, false);
        this.createPathBeacon(6.5, 0, 18, 0xffd700, "👑 HIGH CASTLE RAMPARTS [UP]", "LEVEL +6m • ARCHER WATCHTOWERS & BATTLEMENTS", "#fff3a8", true, false);
        // Flanking Bridge Waypoint (pure informational guidance landmark - WALK ON FOOT)
        this.createPathBeacon(-4.8, 0, 33, 0xff7722, "⚔️ ROYAL BRIDGE [VIADUCT AHEAD]", "LEVEL 0m • RUN ON FOOT ACROSS TO TAURUS DEMON (3600m)", "#ff9933", true, false);

        // 2. Return Landmarks from Inside the Flooded Subterranean Catacombs (Informational landmarks)
        this.createPathBeacon(-20, -4.92, 32, 0xffd700, "☀️ SURFACE COURTYARD [UP]", "LEVEL 0m • RETURN TO FIRELINK COURTYARD", "#ffd700", true, false);
        this.createPathBeacon(-20, -4.92, 146, 0xffd700, "☀️ SURFACE COURTYARD [UP]", "LEVEL 0m • RETURN TO FIRELINK COURTYARD", "#ffd700", true, false);

        // 3. Return & Ascent Landmarks on High Castle Ramparts
        this.createPathBeacon(20, 6.0, 32, 0xffd700, "☀️ SURFACE COURTYARD [DOWN]", "LEVEL 0m • RETURN TO FIRELINK COURTYARD", "#ffd700", true, false);
        this.createPathBeacon(20, 6.0, 266, 0xff7722, "⚔️ DESCEND TO BOSS FOG GATE [DOWN]", "LEVEL 0m • DIRECT PASSAGE TO TAURUS DEMON", "#ff9933", true, false);

        // ----------------------------------------------------
        // 3. BOSS ARENA (BEYOND FOG GATE AT Z = 4140 TO Z = 12540)
        // 3x Lengthened 720m x 8,400m Colossal Imperial Colosseum Arena (Centered at z = 8340)
        // ----------------------------------------------------
        const arenaGeo = new THREE.BoxGeometry(720, 2, 8400);
        const arena = new THREE.Mesh(arenaGeo, this.arenaMat);
        arena.position.set(0, -1, 8340);
        arena.receiveShadow = true;
        this.scene.add(arena);

        // Arena Boundaries (Monumental 20m High Ramparts)
        this.createWall(-360.5, 10, 8340, 3, 20, 8400);    // West wall
        this.createWall(360.5, 10, 8340, 3, 20, 8400);     // East wall
        this.createWall(0, 10, 12540, 725, 20, 3);          // Far North end of arena (locked throne gate)

        // South Containment Wall flanking Fog Gate (z = 4140)
        this.createWall(-225.0, 10, 4140, 270, 20, 3);
        this.createWall(225.0, 10, 4140, 270, 20, 3);

        // Colossal Watchtowers and Bastions in Boss Arena (32m High)
        const arenaTowers = [
            [-340, 4200], [340, 4200],
            [-340, 6200], [340, 6200],
            [-340, 8300], [340, 8300],
            [-340, 10400], [340, 10400],
            [-340, 12500], [340, 12500]
        ];
        arenaTowers.forEach(([tx, tz]) => {
            const towerGeo = new THREE.CylinderGeometry(14.0, 18.0, 34, 16);
            const tower = new THREE.Mesh(towerGeo, this.wallMat);
            tower.position.set(tx, 17, tz);
            tower.receiveShadow = true;
            this.scene.add(tower);

            this.createGoldenBrazier(tx, 34.5, tz);
            this.createSpotlight(tx, 34, tz, tx > 0 ? -1 : 1, -1, 0, 0xffaa44, 5.0, 120, 0.55);
        });

        // Perimeter Wall Torches along Boss Arena East & West Walls (Every 80m)
        for (let az = 4200; az <= 12500; az += 80) {
            this.createTorch(-359.5, 8.5, az, { intensity: 4.2, radius: 45 });
            this.createTorch(359.5, 8.5, az, { intensity: 4.2, radius: 45 });
        }

        // Northern Throne Gate Braziers (at far end of Arena, z = 12530)
        this.createStandingBrazier(-65.0, 0, 12530, 0xff5500, 7.5, 60);
        this.createStandingBrazier(65.0, 0, 12530, 0xff5500, 7.5, 60);
        
        // 4. North Path Beacon: Jade Serpent Beam & Serpentine Sanctum Banner (Flanking North Archway at z = -2248)
        this.createPathBeacon(-24.0, 0, -2248.0, 0x1e824c, "🐍 GORGON'S SANCTUM & SERPENT RUINS [NORTH]", "SUNKEN TEMPLE • MEDUSA & COBRAS", "#2ecc71");

        // Build Massive Serpentine Sanctum, Outside Realm & Atmospheric Map Details
        this.buildSerpentSanctum();
        this.buildOutsideRealm();
        this.buildMapDetailEnhancements();
    }

    buildOutsideRealm() {
        const outsideGroup = new THREE.Group();
        this.outsideGroup = outsideGroup;
        outsideGroup.name = 'outside_realm_group';

        // 1. Vast Forest Turf & Extended Outside Realm Ground Slab (Scaled 8x to 16,000m x 16,000m)
        const outdoorFloorGeo = new THREE.PlaneGeometry(16000, 16000);
        const outdoorFloor = new THREE.Mesh(outdoorFloorGeo, this.forestGrassMat);
        outdoorFloor.rotation.x = -Math.PI / 2;
        outdoorFloor.position.set(0, -0.05, 0);
        outdoorFloor.receiveShadow = true;
        outsideGroup.add(outdoorFloor);

        // 2. Monumental Cobblestone Trails Connecting Destinations (Scaled 3x)
        // Main Way: West Gate to Primeval Mother Archtree & Starship (32m wide, 900m long)
        const mainPathGeo = new THREE.PlaneGeometry(900, 32.0);
        const mainPath = new THREE.Mesh(mainPathGeo, this.stoneMat);
        mainPath.rotation.x = -Math.PI / 2;
        mainPath.position.set(-480, 0.02, 0);
        mainPath.receiveShadow = true;
        outsideGroup.add(mainPath);

        // Branching Trail South to Wyrm Ridge (32m wide, 750m long)
        const wyrmPathGeo = new THREE.PlaneGeometry(32, 750);
        const wyrmPath = new THREE.Mesh(wyrmPathGeo, this.stoneMat);
        wyrmPath.rotation.x = -Math.PI / 2;
        wyrmPath.rotation.z = -0.65;
        wyrmPath.position.set(-360, 0.02, 180);
        wyrmPath.receiveShadow = true;
        outsideGroup.add(wyrmPath);

        // Branching Trail North to Ashen Hollow (32m wide, 700m long)
        const ashenPathGeo = new THREE.PlaneGeometry(32, 700);
        const ashenPath = new THREE.Mesh(ashenPathGeo, this.stoneMat);
        ashenPath.rotation.x = -Math.PI / 2;
        ashenPath.rotation.z = 0.65;
        ashenPath.position.set(-350, 0.02, -180);
        ashenPath.receiveShadow = true;
        outsideGroup.add(ashenPath);

        // Branching Highway leading into Fallen Spaceship Trading Post (28m wide)
        const starshipPathGeo = new THREE.PlaneGeometry(28, 90);
        const starshipPath = new THREE.Mesh(starshipPathGeo, this.stoneMat);
        starshipPath.rotation.x = -Math.PI / 2;
        starshipPath.rotation.z = 0.95;
        starshipPath.position.set(-45, 0.03, 24);
        starshipPath.receiveShadow = true;
        outsideGroup.add(starshipPath);

        // 3. High-Poly Majestic Archtrees with Organic Gnarled Trunks, Spreading Boughs & Lush Canopies
        const createArchtree = (tx, tz, scale = 1.0, tint = 0x153520) => {
            const treeGroup = new THREE.Group();
            treeGroup.position.set(tx, 0, tz);

            // Gnarled high-poly trunk with smooth curvature (16 radial segments)
            const trunkGeo = new THREE.CylinderGeometry(1.6 * scale, 3.4 * scale, 24 * scale, 16);
            const trunk = new THREE.Mesh(trunkGeo, this.archtreeBarkMat);
            trunk.position.y = 12 * scale;
            trunk.castShadow = true;
            trunk.receiveShadow = true;
            treeGroup.add(trunk);

            // 6 Organic Root Flares anchoring tree into the turf
            for (let a = 0; a < 6; a++) {
                const ang = (a / 6) * Math.PI * 2;
                const rootGeo = new THREE.CylinderGeometry(0.5 * scale, 1.4 * scale, 6.5 * scale, 8);
                const rootMesh = new THREE.Mesh(rootGeo, this.archtreeBarkMat);
                rootMesh.position.set(Math.cos(ang) * 3.0 * scale, 2.2 * scale, Math.sin(ang) * 3.0 * scale);
                rootMesh.rotation.z = Math.cos(ang) * 0.52;
                rootMesh.rotation.x = Math.sin(ang) * 0.52;
                rootMesh.castShadow = true;
                treeGroup.add(rootMesh);
            }

            // Spreading Primary Boughs
            const boughAngles = [0.2, 1.5, 2.8, 4.1, 5.3];
            boughAngles.forEach((bang, bIdx) => {
                const boughGeo = new THREE.CylinderGeometry(0.7 * scale, 1.1 * scale, 8 * scale, 8);
                const bough = new THREE.Mesh(boughGeo, this.archtreeBarkMat);
                bough.position.set(Math.cos(bang) * 3.2 * scale, 17 * scale + bIdx * 0.8 * scale, Math.sin(bang) * 3.2 * scale);
                bough.rotation.z = Math.cos(bang) * 0.75;
                bough.rotation.x = Math.sin(bang) * 0.75;
                bough.castShadow = true;
                treeGroup.add(bough);
            });

            // Rich multi-tiered canopy foliage clusters with smooth surface normals
            const folMat = new THREE.MeshStandardMaterial({
                color: tint,
                roughness: 0.75,
                metalness: 0.08,
                flatShading: false
            });

            const canopyOffsets = [
                [0, 24 * scale, 0, 6.8 * scale],
                [-4.2 * scale, 21 * scale, 3.2 * scale, 5.5 * scale],
                [4.5 * scale, 22 * scale, -3.5 * scale, 5.2 * scale],
                [3.0 * scale, 20 * scale, 4.2 * scale, 5.0 * scale],
                [-3.6 * scale, 22 * scale, -3.8 * scale, 5.4 * scale],
                [0, 28 * scale, 0, 5.0 * scale]
            ];
            canopyOffsets.forEach(([fx, fy, fz, fr]) => {
                const fol = new THREE.Mesh(new THREE.SphereGeometry(fr, 16, 12), folMat);
                fol.scale.set(1.15, 0.85, 1.15);
                fol.position.set(fx, fy, fz);
                fol.castShadow = true;
                fol.receiveShadow = true;
                treeGroup.add(fol);
            });

            this.scene.add(treeGroup);
            this.colliders.push(new THREE.Box3(
                new THREE.Vector3(tx - 2.5 * scale, 0, tz - 2.5 * scale),
                new THREE.Vector3(tx + 2.5 * scale, 28 * scale, tz + 2.5 * scale)
            ));
        };

        createArchtree(-58, -35, 1.1, 0x163824);
        createArchtree(-62, 38, 1.05, 0x14341f);
        createArchtree(-110, 0, 1.65, 0x102e1b); // Primeval Mother Archtree (centerpiece)
        createArchtree(-95, -55, 1.0, 0x184028);
        createArchtree(-102, 58, 1.15, 0x13301c);
        createArchtree(-145, -35, 1.2, 0x153520);
        createArchtree(-150, 52, 1.05, 0x173a23);
        createArchtree(-175, 8, 1.3, 0x122c19);

        // 4. Darkroot Ancient Tree Bonfire (x = -75, y = 0, z = 0)
        const bonfireBase = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.4, 0.4, 12), this.stoneMat);
        bonfireBase.position.set(-75, 0.2, 0);
        bonfireBase.receiveShadow = true;
        outsideGroup.add(bonfireBase);

        const emberCore = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), new THREE.MeshStandardMaterial({
            color: 0xff6600,
            emissive: 0xff4400,
            emissiveIntensity: 0.95
        }));
        emberCore.position.set(-75, 0.5, 0);
        outsideGroup.add(emberCore);

        const coiledSword = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1.8, 6), this.darkSteelMat || this.stoneMat);
        coiledSword.position.set(-75, 1.1, 0);
        coiledSword.rotation.z = 0.12;
        coiledSword.rotation.x = -0.08;
        outsideGroup.add(coiledSword);

        const bonfireLight = new THREE.PointLight(0xff7722, 3.8, 25);
        bonfireLight.position.set(-75, 1.5, 0);
        outsideGroup.add(bonfireLight);

        // Bonfire interaction
        this.interactables.push({
            type: 'bonfire',
            position: new THREE.Vector3(-75, 0, 0),
            radius: 4.5,
            prompt: '✨ [ E ] HEAL TO FULL & TELEPORT (DARKROOT EXPEDITION)',
            label: 'DARKROOT SANCTUARY'
        });

        // Standing Iron Braziers flanking Darkroot Bonfire
        this.createStandingBrazier(-78.5, 0, -3.5, 0xff7722, 3.5, 20);
        this.createStandingBrazier(-78.5, 0, 3.5, 0xff7722, 3.5, 20);

        // 5. Primeval Waystone Portal (x = -115, y = 0, z = 0)
        for (let m = 0; m < 6; m++) {
            const mAng = (m / 6) * Math.PI * 2;
            const mx = -115 + Math.cos(mAng) * 4.5;
            const mz = Math.sin(mAng) * 4.5;
            const mono = new THREE.Mesh(new THREE.BoxGeometry(0.85, 4.5, 0.85), this.runeStoneMat);
            mono.position.set(mx, 2.25, mz);
            mono.rotation.y = mAng;
            mono.castShadow = true;
            outsideGroup.add(mono);
            this.colliders.push(new THREE.Box3(
                new THREE.Vector3(mx - 0.5, 0, mz - 0.5),
                new THREE.Vector3(mx + 0.5, 4.5, mz + 0.5)
            ));
        }

        const portalDisk = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.1, 16), new THREE.MeshStandardMaterial({
            color: 0x00e5ff,
            emissive: 0x0099cc,
            emissiveIntensity: 0.8,
            roughness: 0.2,
            transparent: true,
            opacity: 0.82
        }));
        portalDisk.position.set(-115, 0.05, 0);
        outsideGroup.add(portalDisk);

        const portalLight = new THREE.PointLight(0x00e5ff, 3.5, 22);
        portalLight.position.set(-115, 2.0, 0);
        outsideGroup.add(portalLight);

        this.interactables.push({
            type: 'route_portal',
            position: new THREE.Vector3(-115, 0, 0),
            radius: 5.5,
            prompt: '⚡ [ E ] WAYSTONE: RETURN TO CITADEL COURTYARD',
            targetPos: new THREE.Vector3(0, 0, 0),
            label: 'CITADEL COURTYARD'
        });

        // Secondary portal to Boss Fog Gate
        this.interactables.push({
            type: 'route_portal',
            position: new THREE.Vector3(-118, 0, 3.5),
            radius: 3.5,
            prompt: '⚔️ [ E ] WAYSTONE: WARP DIRECTLY TO BOSS ARENA FOG GATE',
            targetPos: new THREE.Vector3(0, 0, 4135),
            label: 'BOSS ARENA FOG GATE'
        });

        // 6. Wyrm Cliffside Plateau (x: -130 to -185, z: 15 to 80, y = 2.0)
        const plateauGeo = new THREE.BoxGeometry(165, 2.0, 195);
        const plateauMesh = new THREE.Mesh(plateauGeo, this.cliffRockMat);
        plateauMesh.position.set(-157.5, 1.0, 47.5);
        plateauMesh.receiveShadow = true;
        plateauMesh.castShadow = true;
        outsideGroup.add(plateauMesh);

        // Plateau Access Steps (ramp from x = -130 to -140, z in [40, 55])
        for (let st = 0; st < 8; st++) {
            const sx = -130 - st * 1.25;
            const sy = (st + 1) * (2.0 / 8);
            const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(1.3, sy, 14), this.stoneMat);
            stepMesh.position.set(sx, sy / 2, 47.5);
            stepMesh.receiveShadow = true;
            outsideGroup.add(stepMesh);
        }

        // Colossal Dragon Ribcage Arches on the Plateau
        const ribCoords = [-146, -155, -164, -173, -181];
        ribCoords.forEach(rx => {
            const ribGeo = new THREE.TorusGeometry(5.2, 0.45, 8, 16, Math.PI);
            const rib = new THREE.Mesh(ribGeo, this.dragonBoneMat);
            rib.position.set(rx, 2.0, 47.5);
            rib.rotation.y = Math.PI / 2;
            rib.castShadow = true;
            outsideGroup.add(rib);
        });

        // Ancient Dragon Altar at Plateau Summit (x = -170, z = 47.5, y = 2.0)
        const dragonAltar = new THREE.Mesh(new THREE.BoxGeometry(6.0, 1.2, 4.0), this.stoneMat);
        dragonAltar.position.set(-170, 2.6, 47.5);
        dragonAltar.receiveShadow = true;
        outsideGroup.add(dragonAltar);

        this.createStandingBrazier(-170, 2.0, 43.5, 0xff5500, 4.2, 25);
        this.createStandingBrazier(-170, 2.0, 51.5, 0xff5500, 4.2, 25);

        // Dragon Plateau Beacon
        this.createPathBeacon(-142, 2.0, 47.5, 0xe67e22, "🐉 WYRM CLIFFSIDE PLATEAU [ELEV +2m]", "ANCIENT DRAGON BONES • DRAKE WHELPS & CRUCIBLE KNIGHTS", "#ffcc80");

        // Cliff Balustrades along western and southern drop of the Plateau
        this.createWall(-185.5, 3.2, 47.5, 1.0, 1.6, 65);
        this.createWall(-157.5, 3.2, 80.5, 55, 1.6, 1.0);

        // 7. Ashen Dune Hollow & Ruined Colonnades (x: -100 to -175, z: -80 to -20)
        const ruinDolmens = [
            [-125, -45, 0],
            [-145, -60, 0.4],
            [-165, -40, -0.3]
        ];
        ruinDolmens.forEach(([dx, dz, drot]) => {
            const dL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.0, 1.2), this.stoneMat);
            dL.position.set(dx - 2.5, 2.5, dz);
            dL.rotation.y = drot;
            outsideGroup.add(dL);
            const dR = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.0, 1.2), this.stoneMat);
            dR.position.set(dx + 2.5, 2.5, dz);
            dR.rotation.y = drot;
            outsideGroup.add(dR);
            const dTop = new THREE.Mesh(new THREE.BoxGeometry(6.8, 1.4, 2.2), this.stoneMat);
            dTop.position.set(dx, 5.6, dz);
            dTop.rotation.y = drot;
            outsideGroup.add(dTop);

            this.createStandingBrazier(dx, 0, dz, 0x00ffaa, 3.0, 20);
        });

        // --- 7b. NEW OUTSIDE REALM 3D EXPEDITIONS ---
        // A. Astral Meteor Crater with Starlight Monoliths (x = -160, z = -60, elev = -2.5m)
        const craterRim = new THREE.Mesh(new THREE.TorusGeometry(36.0, 4.5, 12, 24), this.cliffRockMat);
        craterRim.position.set(-160, -1.2, -60);
        craterRim.rotation.x = Math.PI / 2;
        outsideGroup.add(craterRim);

        for (let cr = 0; cr < 5; cr++) {
            const cang = (cr / 5) * Math.PI * 2;
            const cShard = new THREE.Mesh(new THREE.ConeGeometry(0.65, 4.2, 5), this.mobCrystalMat || this.darkSteelMat);
            cShard.position.set(-160 + Math.cos(cang) * 6.5, -0.4, -60 + Math.sin(cang) * 6.5);
            cShard.rotation.set(Math.cos(cang) * 0.35, cang, Math.sin(cang) * 0.35);
            outsideGroup.add(cShard);
        }
        const meteorCore = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4), this.calamityEyeMat || this.mobCrystalMat);
        meteorCore.position.set(-160, -1.8, -60);
        outsideGroup.add(meteorCore);
        const meteorLight = new THREE.PointLight(0x00f5ff, 2.5, 30.0);
        meteorLight.position.set(-160, -0.5, -60);
        outsideGroup.add(meteorLight);
        this.createPathBeacon(-160, -2.5, -60, 0x00f5ff, "🌌 ASTRAL METEOR CRATER [ELEV -2.5m]", "COSMIC FALLEN STAR • MINDFLAYERS & STARLIGHT CRYSTALS", "#a5f3fc");

        // B. Magma Chasm Falls (x = -180, z = -25, elev = -1.5m)
        const magmaPool = new THREE.Mesh(new THREE.BoxGeometry(48.0, 0.4, 42.0), this.demonLavaMat || this.stoneMat);
        magmaPool.position.set(-180, -1.5, -25);
        outsideGroup.add(magmaPool);
        const magmaLight = new THREE.PointLight(0xff4500, 2.8, 28.0);
        magmaLight.position.set(-180, -0.2, -25);
        outsideGroup.add(magmaLight);
        this.createPathBeacon(-180, -1.5, -25, 0xff4500, "🌋 MAGMA CHASM FALLS [ELEV -1.5m]", "MOLTEN BASALT • MAGMA WYRMS & LAVA EMBER CORES", "#fed7aa");

        // C. Titan Bone Cemetery (x = -85, z = 70, elev = 0m)
        [-95, -85, -75].forEach((tbx, tbi) => {
            const titanRib = new THREE.Mesh(new THREE.TorusGeometry(4.8, 0.45, 6, 12, Math.PI), this.dragonBoneMat);
            titanRib.position.set(tbx, 0, 70);
            titanRib.rotation.set(0, Math.PI / 2 + (tbi - 1) * 0.2, 0);
            outsideGroup.add(titanRib);
        });
        this.createPathBeacon(-85, 0, 70, 0xa855f7, "🦴 TITAN BONE CEMETERY [NORTH GLADE]", "COLOSSAL RIBCAGES • OMEN OGRES & GRAVE HORNS", "#e9d5ff");

        // D. Rotten Grove Sanctum (x = -130, z = 65, elev = 0m)
        const rotMound = new THREE.Mesh(new THREE.SphereGeometry(4.5, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), this.mobPustuleMat || this.forestGrassMat);
        rotMound.position.set(-130, 0, 65);
        outsideGroup.add(rotMound);
        this.createPathBeacon(-130, 0, 65, 0x22c55e, "🌺 ROTTEN GROVE SANCTUM [WEST HOLLOW]", "ARACHNID SCUTTLERS • PEST STINGERS & FUNGAL BLOOM", "#bbf7d0");

        // --- 7c. BESPOKE UNIQUE 3D REALM LANDMARKS (NEW OUTSIDE EXPEDITIONS) ---
        // A. Carian Star Observatory (outside_carian_star_observatory) (x = -105, z = -85, elev = +3.5m)
        const observatoryDais = new THREE.Mesh(new THREE.CylinderGeometry(38, 42, 3.5, 24), this.stoneMat);
        observatoryDais.position.set(-105, 1.75, -85);
        observatoryDais.receiveShadow = true;
        outsideGroup.add(observatoryDais);

        // Concentric brass astrolabe armillary rings
        const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.12, 8, 24), this.goldMat || this.stoneMat);
        ring1.position.set(-105, 5.8, -85);
        ring1.rotation.x = Math.PI / 4;
        outsideGroup.add(ring1);
        const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.1, 8, 24), this.goldMat || this.stoneMat);
        ring2.position.set(-105, 5.8, -85);
        ring2.rotation.y = Math.PI / 3;
        outsideGroup.add(ring2);

        // Glowing Glintstone Moon Sphere
        const glintMoon = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), new THREE.MeshStandardMaterial({
            color: 0xe0f7ff,
            emissive: 0x00f5ff,
            emissiveIntensity: 0.95
        }));
        glintMoon.position.set(-105, 5.8, -85);
        outsideGroup.add(glintMoon);

        const moonLight = new THREE.PointLight(0x00f5ff, 3.2, 30.0);
        moonLight.position.set(-105, 6.5, -85);
        outsideGroup.add(moonLight);

        // 4 Surrounding Glintstone obelisks with blue torches
        [[-113, -93], [-97, -93], [-113, -77], [-97, -77]].forEach(([ox, oz]) => {
            const obelisk = new THREE.Mesh(new THREE.ConeGeometry(0.5, 4.5, 5), this.darkSteelMat || this.stoneMat);
            obelisk.position.set(ox, 5.25, oz);
            outsideGroup.add(obelisk);
            this.createStandingBrazier(ox, 3.5, oz, 0x00f5ff, 3.8, 24);
        });
        this.createPathBeacon(-105, 3.5, -85, 0x00d0ff, "🌌 CARIAN STAR OBSERVATORY [ELEV +3.5m]", "GLINTSTONE ASTROLABE • FULL MOON SORCERY & MARIONETTES", "#a5f3fc");

        // B. Scorched Dragonbarrow (outside_scorched_dragonbarrow) (x = -210, z = 60, elev = +2.0m)
        const barrowPlat = new THREE.Mesh(new THREE.BoxGeometry(96, 2.0, 96), this.cliffRockMat);
        barrowPlat.position.set(-210, 1.0, 60);
        barrowPlat.receiveShadow = true;
        outsideGroup.add(barrowPlat);

        // Colossal Dragon Horns erupting from crag
        for (let dh = 0; dh < 3; dh++) {
            const horn = new THREE.Mesh(new THREE.ConeGeometry(1.1, 7.5, 5), this.dragonBoneMat || this.stoneMat);
            horn.position.set(-218 + dh * 8, 4.5, 54 + (dh % 2) * 12);
            horn.rotation.z = -0.3 + dh * 0.25;
            outsideGroup.add(horn);
        }

        // Bubbling magma fissure
        const barrowLava = new THREE.Mesh(new THREE.BoxGeometry(16, 0.4, 6), this.demonLavaMat || this.stoneMat);
        barrowLava.position.set(-210, 2.1, 60);
        outsideGroup.add(barrowLava);

        const barrowLight = new THREE.PointLight(0xff3300, 3.4, 30.0);
        barrowLight.position.set(-210, 3.2, 60);
        outsideGroup.add(barrowLight);
        this.createStandingBrazier(-210, 2.0, 52, 0xff4400, 4.5, 26);
        this.createStandingBrazier(-210, 2.0, 68, 0xff4400, 4.5, 26);
        this.createPathBeacon(-210, 2.0, 60, 0xff3300, "🐉 SCORCHED DRAGONBARROW [ELEV +2.0m]", "MOLTEN BASALT CRAGS • DRAGONLORD PLACIDUSAX TEMPEST", "#fed7aa");

        // C. Forbidden Mistwood Ruins (outside_forbidden_mistwood) (x = -65, z = -75, elev = 0m)
        const mistwoodDolmen = new THREE.Group();
        mistwoodDolmen.position.set(-65, 0, -75);
        for (let mi = 0; mi < 4; mi++) {
            const mang = (mi / 4) * Math.PI * 2;
            const mp = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.0, 1.2), this.stoneMat);
            mp.position.set(Math.cos(mang) * 5.0, 2.5, Math.sin(mang) * 5.0);
            mistwoodDolmen.add(mp);
        }
        const mLintel = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.5, 6, 16), this.stoneMat);
        mLintel.position.y = 5.2;
        mLintel.rotation.x = Math.PI / 2;
        mistwoodDolmen.add(mLintel);

        // Wolf Knight Runestone & Thrust Sword
        const runeStone = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 1.2, 8), this.stoneMat);
        runeStone.position.y = 0.6;
        mistwoodDolmen.add(runeStone);

        const swordThrust = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 0.28), this.darkSteelMat);
        swordThrust.position.set(0, 1.9, 0);
        swordThrust.rotation.z = 0.15;
        mistwoodDolmen.add(swordThrust);
        outsideGroup.add(mistwoodDolmen);

        this.createStandingBrazier(-65, 0, -68, 0x00f5cc, 4.0, 24);
        this.createStandingBrazier(-65, 0, -82, 0x00f5cc, 4.0, 24);
        this.createPathBeacon(-65, 0, -75, 0x00f5cc, "🐺 FORBIDDEN MISTWOOD RUINS [NORTH GLADE]", "WOLF KNIGHT SHRINE • DIRE SHADOW WOLVES & BLACK KNIFE ASSASSINS", "#bbf7d0");

        // D. Abyssal Eclipse Chasm (outside_abyssal_eclipse_chasm) (x = -225, z = -35, elev = -4.0m)
        const eclipseFloor = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 1.2, 18), this.darkSteelMat || this.stoneMat);
        eclipseFloor.position.set(-225, -4.6, -35);
        eclipseFloor.receiveShadow = true;
        outsideGroup.add(eclipseFloor);

        // 6 Curved Obsidian Monoliths leaning inward
        for (let em = 0; em < 6; em++) {
            const eang = (em / 6) * Math.PI * 2;
            const emono = new THREE.Mesh(new THREE.ConeGeometry(0.9, 8.5, 5), this.darkSteelMat);
            emono.position.set(-225 + Math.cos(eang) * 12, 0.0, -35 + Math.sin(eang) * 12);
            emono.rotation.set(Math.sin(eang) * 0.35, eang, -Math.cos(eang) * 0.35);
            outsideGroup.add(emono);
        }

        // Hovering Black Sun Eclipse Orb with Violet Corona
        const blackSun = new THREE.Mesh(new THREE.SphereGeometry(2.0, 16, 16), new THREE.MeshStandardMaterial({
            color: 0x050308,
            roughness: 0.2,
            metalness: 0.95
        }));
        blackSun.position.set(-225, 0.5, -35);
        outsideGroup.add(blackSun);

        const coronaRing = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.14, 8, 24), new THREE.MeshStandardMaterial({
            color: 0xaa00ee,
            emissive: 0x8800cc,
            emissiveIntensity: 1.1,
            roughness: 0.2
        }));
        coronaRing.position.set(-225, 0.5, -35);
        outsideGroup.add(coronaRing);

        const eclipseLight = new THREE.PointLight(0x8800cc, 3.6, 28.0);
        eclipseLight.position.set(-225, 1.5, -35);
        outsideGroup.add(eclipseLight);
        this.createPathBeacon(-225, -4.0, -35, 0x9900ee, "🌑 ABYSSAL ECLIPSE CHASM [ELEV -4.0m]", "CORRUPTED BLACK SUN • PUS OF MAN & DESTINED DEATH MALIKETH", "#e9d5ff");

        // E. Frozen Wyrmpeak Precipice (outside_frozen_wyrmpeak_precipice) (x = -240, z = 15, elev = +6.0m)
        const peakPlat = new THREE.Mesh(new THREE.BoxGeometry(26, 6.0, 26), new THREE.MeshStandardMaterial({
            color: 0xdaeef8,
            roughness: 0.35,
            metalness: 0.5
        }));
        peakPlat.position.set(-240, 3.0, 15);
        peakPlat.receiveShadow = true;
        outsideGroup.add(peakPlat);

        // Frosted Icicle Spires
        for (let ic = 0; ic < 4; ic++) {
            const iang = (ic / 4) * Math.PI * 2;
            const ispire = new THREE.Mesh(new THREE.ConeGeometry(0.75, 6.0, 5), new THREE.MeshStandardMaterial({
                color: 0xc8f0ff,
                emissive: 0x0099bb,
                emissiveIntensity: 0.8,
                roughness: 0.15
            }));
            ispire.position.set(-240 + Math.cos(iang) * 9, 8.5, 15 + Math.sin(iang) * 9);
            outsideGroup.add(ispire);
        }

        // Petrified Frost Dragon Wing frozen in azure ice
        const frostWing = new THREE.Mesh(new THREE.BoxGeometry(9.0, 6.5, 0.4), new THREE.MeshStandardMaterial({
            color: 0x88e0ff,
            transparent: true,
            opacity: 0.85,
            roughness: 0.2
        }));
        frostWing.position.set(-240, 9.0, 15);
        frostWing.rotation.set(0.3, 0.5, 0.4);
        outsideGroup.add(frostWing);

        const frostLight = new THREE.PointLight(0x88ddff, 3.4, 28.0);
        frostLight.position.set(-240, 8.5, 15);
        outsideGroup.add(frostLight);
        this.createStandingBrazier(-240, 6.0, 8, 0xa5f3fc, 4.2, 26);
        this.createStandingBrazier(-240, 6.0, 22, 0xa5f3fc, 4.2, 26);
        this.createPathBeacon(-240, 6.0, 15, 0x88ddff, "❄️ FROZEN WYRMPEAK PRECIPICE [ELEV +6.0m]", "GLACIAL BLIZZARD SUMMIT • BOREALIS FREEZING FOG & ICE DRAGON", "#e0f2fe");

        // F. Stormveil Cliffside Ramparts (outside_stormveil_cliffside_ramparts) (x = -145, z = -95, elev = +4.0m)
        const rampartPlat = new THREE.Mesh(new THREE.BoxGeometry(30, 4.0, 24), this.stoneMat);
        rampartPlat.position.set(-145, 2.0, -95);
        rampartPlat.receiveShadow = true;
        outsideGroup.add(rampartPlat);

        // Stone parapet battlements
        for (let bt = -12; bt <= 12; bt += 4) {
            const cren = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.4, 1.2), this.stoneMat);
            cren.position.set(-145 + bt, 4.7, -106);
            outsideGroup.add(cren);
        }

        // Tempest Lightning Rod & Golden Banner
        const lightningRod = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 7.5, 6), this.goldMat || this.stoneMat);
        lightningRod.position.set(-145, 7.5, -95);
        outsideGroup.add(lightningRod);

        const stormLight = new THREE.PointLight(0xffd700, 3.5, 28.0);
        stormLight.position.set(-145, 6.0, -95);
        outsideGroup.add(stormLight);
        this.createStandingBrazier(-155, 4.0, -95, 0xffd700, 4.0, 24);
        this.createStandingBrazier(-135, 4.0, -95, 0xffd700, 4.0, 24);
        this.createPathBeacon(-145, 4.0, -95, 0xffd700, "⚡ STORMVEIL CLIFFSIDE RAMPARTS [ELEV +4.0m]", "WINDSWEPT PARAPETS • CRUCIBLE SENTINELS & CONSORT RADAHN", "#fef08a");

        // G. Caelid Rot Miasma Swamp (outside_rot_miasma_swamp) (x = -185, z = -100, elev = 0m)
        const rotSwampGroup = new THREE.Group();
        rotSwampGroup.position.set(-185, 0, -100);

        // Bubbling Scarlet Rot Bog Fissure
        const rotBog = new THREE.Mesh(new THREE.BoxGeometry(36, 0.35, 36), new THREE.MeshStandardMaterial({
            color: 0x8b0000,
            roughness: 0.85,
            emissive: 0x550011,
            emissiveIntensity: 0.6
        }));
        rotBog.position.y = 0.15;
        rotSwampGroup.add(rotBog);

        // Towering Aeonian Spore Mushroom Tree
        const shroomTrunk = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.8, 8.5, 8), this.stoneMat);
        shroomTrunk.position.y = 4.25;
        rotSwampGroup.add(shroomTrunk);

        const shroomCap = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 6.0, 1.8, 16), new THREE.MeshStandardMaterial({
            color: 0xd6336c,
            emissive: 0xa61e4d,
            emissiveIntensity: 0.8,
            roughness: 0.6
        }));
        shroomCap.position.y = 8.5;
        rotSwampGroup.add(shroomCap);

        // Arching Weeping Haligtree Root
        const rotRoot = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.8, 8, 20, Math.PI * 0.8), this.stoneMat);
        rotRoot.position.set(0, 0, 0);
        rotRoot.rotation.set(Math.PI / 3, 0.5, 0);
        rotSwampGroup.add(rotRoot);

        const rotLight = new THREE.PointLight(0xff1493, 3.8, 30.0);
        rotLight.position.set(0, 5.5, 0);
        rotSwampGroup.add(rotLight);
        outsideGroup.add(rotSwampGroup);

        this.createStandingBrazier(-185, 0, -90, 0xff1493, 4.0, 24);
        this.createStandingBrazier(-185, 0, -110, 0xff1493, 4.0, 24);
        this.createPathBeacon(-185, 0, -100, 0xff1493, "🌺 CAELID ROT MIASMA SWAMP [0m]", "SCARLET AEONIA • MALENIA BLADE OF MIQUELLA & CLEANROT KNIGHTS", "#fecdd3");

        // H. Mountaintops Flame Peak Cauldron (outside_flame_peak_cauldron) (x = -245, z = -80, elev = +8.0m)
        const flamePeakPlat = new THREE.Mesh(new THREE.BoxGeometry(42, 8.0, 42), this.cliffRockMat);
        flamePeakPlat.position.set(-245, 4.0, -80);
        flamePeakPlat.receiveShadow = true;
        outsideGroup.add(flamePeakPlat);

        // Circular Iron Forge Basin with bubbling molten slag
        const cauldronBasin = new THREE.Mesh(new THREE.CylinderGeometry(9.0, 8.2, 2.2, 18), this.darkSteelMat);
        cauldronBasin.position.set(-245, 8.8, -80);
        outsideGroup.add(cauldronBasin);

        const cauldronMagma = new THREE.Mesh(new THREE.CylinderGeometry(8.2, 8.2, 0.4, 18), this.demonLavaMat || this.stoneMat);
        cauldronMagma.position.set(-245, 9.8, -80);
        outsideGroup.add(cauldronMagma);

        // Colossal Giant Iron Chains spanning peak
        for (let ch = -1; ch <= 1; ch += 2) {
            const chainLink = new THREE.Mesh(new THREE.TorusGeometry(3.8, 0.45, 8, 20), this.darkSteelMat);
            chainLink.position.set(-245 + ch * 11, 9.5, -80);
            chainLink.rotation.set(0.4, ch * 0.6, 0);
            outsideGroup.add(chainLink);
        }

        const cauldronLight = new THREE.PointLight(0xff3300, 4.5, 32.0);
        cauldronLight.position.set(-245, 11.5, -80);
        outsideGroup.add(cauldronLight);
        this.createStandingBrazier(-245, 8.0, -68, 0xff4400, 4.5, 26);
        this.createStandingBrazier(-245, 8.0, -92, 0xff4400, 4.5, 26);
        this.createPathBeacon(-245, 8.0, -80, 0xff3300, "🔥 MOUNTAINTOPS FLAME PEAK [ELEV +8.0m]", "GIANTS CALDERA FORGE • FELL GOD EYE & SMOLDERING PRELATES", "#fed7aa");

        // I. Nokstella Eternal Moon Terrace (outside_nokstella_moon_terrace) (x = -125, z = 105, elev = -3.0m)
        const nokstellaPlat = new THREE.Mesh(new THREE.CylinderGeometry(26, 26, 1.2, 24), this.darkSteelMat);
        nokstellaPlat.position.set(-125, -3.6, 105);
        nokstellaPlat.receiveShadow = true;
        outsideGroup.add(nokstellaPlat);

        // Hovering Silver Moon Core with Orbit Rings
        const silverMoon = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 16), new THREE.MeshStandardMaterial({
            color: 0xe0e8f8,
            emissive: 0x7c92b8,
            emissiveIntensity: 0.9,
            roughness: 0.2
        }));
        silverMoon.position.set(-125, 1.5, 105);
        outsideGroup.add(silverMoon);

        const moonOrbitRing = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.12, 8, 24), this.goldMat || this.stoneMat);
        moonOrbitRing.position.set(-125, 1.5, 105);
        moonOrbitRing.rotation.set(0.6, 0.3, 0);
        outsideGroup.add(moonOrbitRing);

        // 4 Fluted Obsidian Obelisks channeling purple starlight
        [[-135, 95], [-115, 95], [-135, 115], [-115, 115]].forEach(([ox, oz]) => {
            const ob = new THREE.Mesh(new THREE.ConeGeometry(0.7, 5.5, 5), this.darkSteelMat);
            ob.position.set(ox, -0.5, oz);
            outsideGroup.add(ob);
            this.createStandingBrazier(ox, -3.0, oz, 0x9900ff, 4.0, 24);
        });

        const nokstellaLight = new THREE.PointLight(0x9900ff, 3.8, 30.0);
        nokstellaLight.position.set(-125, 2.5, 105);
        outsideGroup.add(nokstellaLight);
        this.createPathBeacon(-125, -3.0, 105, 0x9900ff, "🌌 NOKSTELLA ETERNAL MOON TERRACE [ELEV -3.0m]", "SILVER TEAR BASIN • ASTEL VOID NATURALBORN & NOX SWORDSTRESSES", "#e9d5ff");

        // J. Farum Azula Crumbling Tempest (outside_farum_azula_tempest) (x = -235, z = -120, elev = +7.0m)
        const azulaPlat = new THREE.Mesh(new THREE.BoxGeometry(36, 7.0, 36), this.stoneMat);
        azulaPlat.position.set(-235, 3.5, -120);
        azulaPlat.receiveShadow = true;
        outsideGroup.add(azulaPlat);

        // Dragon God Mausoleum Altar flanked by Stone Dragon Wings
        const altarBase = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 5.2, 1.2, 12), this.stoneMat);
        altarBase.position.set(-235, 7.6, -120);
        outsideGroup.add(altarBase);

        for (let side = -1; side <= 1; side += 2) {
            const dragonWing = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5.5, 3.5), this.stoneMat);
            dragonWing.position.set(-235 + side * 5.5, 9.5, -120);
            dragonWing.rotation.set(0, 0, -side * 0.4);
            outsideGroup.add(dragonWing);
        }

        // Floating shattered ruin fragments hovering in air
        for (let fr = 0; fr < 6; fr++) {
            const fang = (fr / 6) * Math.PI * 2;
            const floatRuin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 2.2), this.stoneMat);
            floatRuin.position.set(-235 + Math.cos(fang) * 12, 11.5 + (fr % 2) * 1.5, -120 + Math.sin(fang) * 12);
            floatRuin.rotation.set(fr * 0.3, fr * 0.5, 0);
            outsideGroup.add(floatRuin);
        }

        const azulaLight = new THREE.PointLight(0xff0044, 4.2, 32.0);
        azulaLight.position.set(-235, 11.0, -120);
        outsideGroup.add(azulaLight);
        this.createStandingBrazier(-235, 7.0, -108, 0xff0044, 4.5, 26);
        this.createStandingBrazier(-235, 7.0, -132, 0xff0044, 4.5, 26);
        this.createPathBeacon(-235, 7.0, -120, 0xff0044, "⚡ FARUM AZULA CRUMBLING TEMPEST [ELEV +7.0m]", "DRAGON MAUSOLEUM • BAYLE THE DREAD & DRACONIC BEASTMEN", "#fda4af");

        // K. Leyndell Erdtree Colosseum (outside_golden_capital_colosseum) (x = -175, z = 115, elev = +5.0m)
        const colosseumPlat = new THREE.Mesh(new THREE.CylinderGeometry(28, 30, 5.0, 24), this.stoneMat);
        colosseumPlat.position.set(-175, 2.5, 115);
        colosseumPlat.receiveShadow = true;
        outsideGroup.add(colosseumPlat);

        // Circular Golden Colonnade around amphitheater
        for (let cp = 0; cp < 8; cp++) {
            const cang = (cp / 8) * Math.PI * 2;
            const col = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 5.2, 10), this.goldMat || this.stoneMat);
            col.position.set(-175 + Math.cos(cang) * 22, 7.6, 115 + Math.sin(cang) * 22);
            outsideGroup.add(col);
        }

        // Radiant Golden Erdtree Archway
        const erdtreeArch = new THREE.Mesh(new THREE.TorusGeometry(5.5, 0.45, 8, 20, Math.PI), new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0xffaa00,
            emissiveIntensity: 0.95
        }));
        erdtreeArch.position.set(-175, 5.0, 115);
        erdtreeArch.rotation.y = Math.PI / 4;
        outsideGroup.add(erdtreeArch);

        const colosseumLight = new THREE.PointLight(0xffd700, 4.0, 30.0);
        colosseumLight.position.set(-175, 8.5, 115);
        outsideGroup.add(colosseumLight);
        this.createStandingBrazier(-185, 5.0, 115, 0xffd700, 4.0, 24);
        this.createStandingBrazier(-165, 5.0, 115, 0xffd700, 4.0, 24);
        this.createPathBeacon(-175, 5.0, 115, 0xffd700, "🏛️ LEYNDELL ERDTREE COLOSSEUM [ELEV +5.0m]", "ROYAL AMPHITHEATER • GODFREY FIRST ELDEN LORD & ROYAL PERFUMERS", "#fef08a");

        // L. Cathedral of the Deep Drowned Necropolis (outside_drowned_abyssal_necropolis) (x = -95, z = 125, elev = -2.5m)
        const necropolisPlat = new THREE.Mesh(new THREE.BoxGeometry(38, 1.2, 38), this.darkSteelMat || this.stoneMat);
        necropolisPlat.position.set(-95, -3.1, 125);
        necropolisPlat.receiveShadow = true;
        outsideGroup.add(necropolisPlat);

        // Drowned Leaning Gothic Spires wrapped in chains
        for (let sp = 0; sp < 4; sp++) {
            const sang = (sp / 4) * Math.PI * 2;
            const spire = new THREE.Mesh(new THREE.ConeGeometry(0.85, 7.5, 5), this.stoneMat);
            spire.position.set(-95 + Math.cos(sang) * 14, 0.5, 125 + Math.sin(sang) * 14);
            spire.rotation.set(Math.sin(sang) * 0.25, 0, Math.cos(sang) * 0.25);
            outsideGroup.add(spire);
        }

        // Colossal Weeping Monolithic Gravestones
        for (let gr = -1; gr <= 1; gr += 2) {
            const graveStone = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3.8, 1.8), this.stoneMat);
            graveStone.position.set(-95 + gr * 6, -0.6, 125);
            outsideGroup.add(graveStone);
        }

        const deepLight = new THREE.PointLight(0x00ffcc, 3.8, 28.0);
        deepLight.position.set(-95, 1.5, 125);
        outsideGroup.add(deepLight);
        this.createStandingBrazier(-95, -2.5, 113, 0x00ffcc, 4.0, 24);
        this.createStandingBrazier(-95, -2.5, 137, 0x00ffcc, 4.0, 24);
        this.createPathBeacon(-95, -2.5, 125, 0x00ffcc, "🌊 CATHEDRAL DROWNED NECROPOLIS [ELEV -2.5m]", "DEEP FLOODED CEMETERY • LUDWIG HOLY BLADE & ABYSSAL GRAVE WARDENS", "#99f6e4");

        // --- 7d. BRAND NEW BESPOKE 3D REALM EXPEDITIONS & LANDMARKS ---
        // 1. Celestial Falls & Moonlit Shrine (outside_celestial_falls_basin) (x = -280, z = -80, elev = -2.0m)
        const fallPool = new THREE.Mesh(new THREE.CylinderGeometry(28, 28, 0.4, 24), new THREE.MeshStandardMaterial({
            color: 0x0a223a,
            roughness: 0.1,
            metalness: 0.85,
            transparent: true,
            opacity: 0.85
        }));
        fallPool.position.set(-280, -2.1, -80);
        fallPool.receiveShadow = true;
        outsideGroup.add(fallPool);

        // Towering Azure Crystal Waterfall Cliff
        const fallCliff = new THREE.Mesh(new THREE.BoxGeometry(4.0, 16.0, 22.0), this.cliffRockMat);
        fallCliff.position.set(-295, 6.0, -80);
        outsideGroup.add(fallCliff);

        const crystalVein = new THREE.Mesh(new THREE.BoxGeometry(1.2, 14.0, 16.0), new THREE.MeshStandardMaterial({
            color: 0x88f5ff,
            emissive: 0x00ccee,
            emissiveIntensity: 0.9,
            roughness: 0.2
        }));
        crystalVein.position.set(-293, 5.0, -80);
        outsideGroup.add(crystalVein);

        // Levitating Glintstone Lotus Runestones in pool
        for (let lt = 0; lt < 5; lt++) {
            const lang = (lt / 5) * Math.PI * 2;
            const lotus = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.4, 6), new THREE.MeshStandardMaterial({
                color: 0x00f5ff,
                emissive: 0x0099cc,
                emissiveIntensity: 0.8
            }));
            lotus.position.set(-280 + Math.cos(lang) * 14, -1.2, -80 + Math.sin(lang) * 14);
            lotus.rotation.x = Math.PI;
            outsideGroup.add(lotus);
        }

        const fallLight = new THREE.PointLight(0x00f5ff, 3.8, 32.0);
        fallLight.position.set(-280, 0.5, -80);
        outsideGroup.add(fallLight);
        this.createStandingBrazier(-270, -2.0, -90, 0x00f5ff, 3.5, 24);
        this.createStandingBrazier(-270, -2.0, -70, 0x00f5ff, 3.5, 24);
        this.createPathBeacon(-280, -2.0, -80, 0x00f5ff, "🌌 CELESTIAL FALLS BASIN [ELEV -2.0m]", "AZURE CRYSTAL WATERFALL • ASTRAL SCHOLARS & STARLIGHT LOTUS", "#a5f3fc");

        // 2. Cathedral of Dragon Communion (outside_cathedral_dragon_communion) (x = -310, z = 110, elev = +3.0m)
        const cathedralDais = new THREE.Mesh(new THREE.CylinderGeometry(28, 32, 3.0, 16), this.stoneMat);
        cathedralDais.position.set(-310, 1.5, 110);
        cathedralDais.receiveShadow = true;
        outsideGroup.add(cathedralDais);

        // Colossal Dragon Skull Temple Gateway Arch
        const skullArch = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.85, 8, 16, Math.PI), this.dragonBoneMat || this.stoneMat);
        skullArch.position.set(-310, 3.0, 96);
        skullArch.rotation.y = Math.PI / 2;
        outsideGroup.add(skullArch);

        for (let dh = 0; dh < 4; dh++) {
            const dHorn = new THREE.Mesh(new THREE.ConeGeometry(0.8, 5.5, 5), this.dragonBoneMat || this.stoneMat);
            dHorn.position.set(-318 + dh * 5.2, 8.5, 96);
            dHorn.rotation.z = -0.3 + dh * 0.2;
            outsideGroup.add(dHorn);
        }

        // Sacrificial Chalice of Dragon Heart Flames
        const chalice = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 1.2, 2.2, 10), this.darkSteelMat);
        chalice.position.set(-310, 4.1, 110);
        outsideGroup.add(chalice);

        const heartFlame = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), new THREE.MeshStandardMaterial({
            color: 0xff2200,
            emissive: 0xff4400,
            emissiveIntensity: 1.2
        }));
        heartFlame.position.set(-310, 5.2, 110);
        outsideGroup.add(heartFlame);

        const communionLight = new THREE.PointLight(0xff2200, 4.2, 32.0);
        communionLight.position.set(-310, 5.5, 110);
        outsideGroup.add(communionLight);
        this.createStandingBrazier(-310, 3.0, 122, 0xff3300, 4.2, 26);
        this.createPathBeacon(-310, 3.0, 110, 0xff2200, "🐉 CATHEDRAL OF DRAGON COMMUNION [ELEV +3.0m]", "TITANIC DRAGON SKULL • DRACONIC PYROMANCERS & DRAGON BLOOD", "#fed7aa");

        // 3. Tower of the Frenzied Flame (outside_frenzied_flame_overlook) (x = -340, z = -140, elev = +8.0m)
        const towerShaft = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 10.5, 16.0, 12), this.stoneMat);
        towerShaft.position.set(-340, 0.0, -140);
        towerShaft.receiveShadow = true;
        outsideGroup.add(towerShaft);

        const towerBrambles = new THREE.Mesh(new THREE.CylinderGeometry(9.0, 9.0, 1.8, 12), this.stoneMat);
        towerBrambles.position.set(-340, 8.9, -140);
        outsideGroup.add(towerBrambles);

        // Blazing Yellow Frenzy Ocular Pinnacle
        const frenzyEye = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 16), new THREE.MeshStandardMaterial({
            color: 0xffcc00,
            emissive: 0xff9900,
            emissiveIntensity: 1.2
        }));
        frenzyEye.position.set(-340, 13.0, -140);
        outsideGroup.add(frenzyEye);

        const eyeRing = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.15, 8, 24), new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            emissive: 0xff6600,
            emissiveIntensity: 1.0
        }));
        eyeRing.position.set(-340, 13.0, -140);
        outsideGroup.add(eyeRing);

        const frenzyLight = new THREE.PointLight(0xffaa00, 4.8, 36.0);
        frenzyLight.position.set(-340, 13.5, -140);
        outsideGroup.add(frenzyLight);
        this.createStandingBrazier(-340, 8.0, -148, 0xffaa00, 4.5, 26);
        this.createStandingBrazier(-340, 8.0, -132, 0xffaa00, 4.5, 26);
        this.createPathBeacon(-340, 8.0, -140, 0xffaa00, "🔥 TOWER OF THE FRENZIED FLAME [ELEV +8.0m]", "INCANDESCENT EYE SPIRE • FRENZIED NOMAD ZEALOTS & THREE FINGERS", "#fef08a");

        // 4. Golden Erdtree Royal Colonnade (outside_royal_colonnade_sanctum) (x = -260, z = 180, elev = +2.0m)
        const colonnadeBase = new THREE.Mesh(new THREE.BoxGeometry(45, 2.0, 36), this.stoneMat);
        colonnadeBase.position.set(-260, 1.0, 180);
        colonnadeBase.receiveShadow = true;
        outsideGroup.add(colonnadeBase);

        [-16, -8, 0, 8, 16].forEach(px => {
            [-12, 12].forEach(pz => {
                const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 7.5, 8), this.goldMat || this.stoneMat);
                pillar.position.set(-260 + px, 5.75, 180 + pz);
                outsideGroup.add(pillar);
            });
        });

        // Gilded Beam Archway
        const beamN = new THREE.Mesh(new THREE.BoxGeometry(38, 1.2, 2.0), this.goldMat || this.stoneMat);
        beamN.position.set(-260, 9.5, 168);
        outsideGroup.add(beamN);
        const beamS = new THREE.Mesh(new THREE.BoxGeometry(38, 1.2, 2.0), this.goldMat || this.stoneMat);
        beamS.position.set(-260, 9.5, 192);
        outsideGroup.add(beamS);

        // Golden Grace Fountain in Center
        const graceCore = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 12), new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffdd44,
            emissiveIntensity: 1.1
        }));
        graceCore.position.set(-260, 4.2, 180);
        outsideGroup.add(graceCore);

        const colonnadeLight = new THREE.PointLight(0xffdd44, 4.2, 32.0);
        colonnadeLight.position.set(-260, 5.0, 180);
        outsideGroup.add(colonnadeLight);
        this.createStandingBrazier(-260, 2.0, 165, 0xffd700, 4.2, 26);
        this.createStandingBrazier(-260, 2.0, 195, 0xffd700, 4.2, 26);
        this.createPathBeacon(-260, 2.0, 180, 0xffdd44, "⚜️ GOLDEN ERDTREE ROYAL COLONNADE [ELEV +2.0m]", "GILDED PERISTYLE • CRUCIBLE WARLORDS & ERDTREE GRACE", "#fef08a");

        // 5. Forlorn Hound Evergaol Seal (outside_evergaol_bloodhound) (x = -190, z = -160, elev = 0.0m)
        const evergaolPlate = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 0.35, 24), this.darkSteelMat || this.stoneMat);
        evergaolPlate.position.set(-190, 0.1, -160);
        evergaolPlate.receiveShadow = true;
        outsideGroup.add(evergaolPlate);

        // 8 Basalt Monoliths around ring
        for (let em = 0; em < 8; em++) {
            const eang = (em / 8) * Math.PI * 2;
            const mono = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.5, 1.0), this.stoneMat);
            mono.position.set(-190 + Math.cos(eang) * 15, 2.75, -160 + Math.sin(eang) * 15);
            mono.rotation.y = eang;
            outsideGroup.add(mono);
        }

        // Void Rift in center
        const riftCenter = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 0.1, 16), new THREE.MeshStandardMaterial({
            color: 0x330055,
            emissive: 0x8800cc,
            emissiveIntensity: 1.0
        }));
        riftCenter.position.set(-190, 0.2, -160);
        outsideGroup.add(riftCenter);

        const evergaolLight = new THREE.PointLight(0x8800cc, 3.8, 28.0);
        evergaolLight.position.set(-190, 2.0, -160);
        outsideGroup.add(evergaolLight);
        this.createPathBeacon(-190, 0.0, -160, 0x8800cc, "⛓️ FORLORN HOUND EVERGAOL [NORTH WILDLANDS]", "RUNIC VOID SEAL • BLOODHOUND STALKERS & DARK MOON SHARDS", "#e9d5ff");

        // 6. Titanite Colossus Smelting Caldera (outside_titan_forge_caldera) (x = -360, z = 40, elev = -1.0m)
        const calderaRim = new THREE.Mesh(new THREE.TorusGeometry(26, 3.8, 10, 24), this.cliffRockMat);
        calderaRim.position.set(-360, -0.2, 40);
        calderaRim.rotation.x = Math.PI / 2;
        outsideGroup.add(calderaRim);

        const lavaBath = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 0.4, 20), this.demonLavaMat || this.stoneMat);
        lavaBath.position.set(-360, -1.0, 40);
        outsideGroup.add(lavaBath);

        // Titanic Anvil of the Primordial Smith
        const anvil = new THREE.Mesh(new THREE.BoxGeometry(5.5, 2.2, 3.2), this.darkSteelMat);
        anvil.position.set(-360, 0.1, 40);
        outsideGroup.add(anvil);

        const calderaLight = new THREE.PointLight(0xff3300, 4.4, 32.0);
        calderaLight.position.set(-360, 2.0, 40);
        outsideGroup.add(calderaLight);
        this.createStandingBrazier(-360, -1.0, 22, 0xff4400, 4.2, 26);
        this.createPathBeacon(-360, -1.0, 40, 0xff3300, "⚒️ TITANITE COLOSSUS CALDERA [ELEV -1.0m]", "PRIMAL SMELTING FORGE • SLAG GOLEMS & TITANITE SLABS", "#fed7aa");

        // 7. Necromancer's Bone Barrow (outside_necromancer_bone_barrow) (x = -390, z = -60, elev = +1.0m)
        const barrowMound = new THREE.Mesh(new THREE.SphereGeometry(18, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), this.stoneMat);
        barrowMound.position.set(-390, 0, -60);
        outsideGroup.add(barrowMound);

        // Crypt Entrance Dolmen
        const ossuaryL = new THREE.Mesh(new THREE.BoxGeometry(1.4, 6.0, 1.4), this.stoneMat);
        ossuaryL.position.set(-390 - 3.5, 3.0, -42);
        outsideGroup.add(ossuaryL);
        const ossuaryR = new THREE.Mesh(new THREE.BoxGeometry(1.4, 6.0, 1.4), this.stoneMat);
        ossuaryR.position.set(-390 + 3.5, 3.0, -42);
        outsideGroup.add(ossuaryR);
        const ossuaryTop = new THREE.Mesh(new THREE.BoxGeometry(9.5, 1.5, 2.2), this.stoneMat);
        ossuaryTop.position.set(-390, 6.5, -42);
        outsideGroup.add(ossuaryTop);

        const ghostflameCauldron = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.9, 1.4, 8), this.darkSteelMat);
        ghostflameCauldron.position.set(-390, 1.7, -42);
        outsideGroup.add(ghostflameCauldron);

        const ghostFlame = new THREE.Mesh(new THREE.SphereGeometry(0.75, 8, 8), new THREE.MeshStandardMaterial({
            color: 0x00f5ff,
            emissive: 0x00ccdd,
            emissiveIntensity: 1.1
        }));
        ghostFlame.position.set(-390, 2.6, -42);
        outsideGroup.add(ghostFlame);

        const necromancerLight = new THREE.PointLight(0x00f5ff, 3.8, 28.0);
        necromancerLight.position.set(-390, 3.0, -42);
        outsideGroup.add(necromancerLight);
        this.createPathBeacon(-390, 1.0, -60, 0x00f5ff, "💀 NECROMANCER'S BONE BARROW [ELEV +1.0m]", "ANCIENT SKULL MOUND • GHOSTFLAME GRAVE WRAITHS & DEATHBLIGHT", "#a5f3fc");

        // 8. Sunken Mist Lake & Spectral Gondola Pier (outside_sunken_gondola_harbor) (x = -420, z = 90, elev = -3.0m)
        const mistLake = new THREE.Mesh(new THREE.BoxGeometry(55, 0.4, 65), new THREE.MeshStandardMaterial({
            color: 0x0b1720,
            roughness: 0.15,
            metalness: 0.9
        }));
        mistLake.position.set(-420, -3.1, 90);
        outsideGroup.add(mistLake);

        // Wooden Mooring Jetty
        const jetty = new THREE.Mesh(new THREE.BoxGeometry(28, 0.6, 5.0), this.stoneMat);
        jetty.position.set(-420, -2.7, 90);
        outsideGroup.add(jetty);

        // Spectral Gondola Boat
        const boat = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 11.0), this.darkSteelMat);
        boat.position.set(-436, -2.4, 90);
        outsideGroup.add(boat);

        const mistLight = new THREE.PointLight(0x60a5fa, 3.6, 28.0);
        mistLight.position.set(-420, -1.2, 90);
        outsideGroup.add(mistLight);
        this.createPathBeacon(-420, -3.0, 90, 0x60a5fa, "🛶 SUNKEN MIST LAKE & GONDOLA PIER [ELEV -3.0m]", "SPECTRAL MOORINGS • BANSHEES & ABYSSAL DEEP WATER", "#bfdbfe");

        // 9. World-Tree Aerial Canopy Bridges (outside_ancient_archtree_canopy) (x = -450, z = -20, elev = +12.0m)
        const treePlatform = new THREE.Mesh(new THREE.CylinderGeometry(20, 24, 3.0, 12), this.stoneMat);
        treePlatform.position.set(-450, 10.5, -20);
        outsideGroup.add(treePlatform);

        // Massive Archtree Trunk piercing platform
        const trunkCol = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 7.5, 36, 12), this.archtreeBarkMat || this.stoneMat);
        trunkCol.position.set(-450, 18, -20);
        outsideGroup.add(trunkCol);

        // Suspension Rope Bridge
        const bridge = new THREE.Mesh(new THREE.BoxGeometry(32, 0.4, 4.0), this.stoneMat);
        bridge.position.set(-426, 12.0, -20);
        outsideGroup.add(bridge);

        const canopyLight = new THREE.PointLight(0x4ade80, 4.0, 32.0);
        canopyLight.position.set(-450, 14.0, -20);
        outsideGroup.add(canopyLight);
        this.createStandingBrazier(-450, 12.0, -32, 0x4ade80, 4.0, 24);
        this.createStandingBrazier(-450, 12.0, -8, 0x4ade80, 4.0, 24);
        this.createPathBeacon(-450, 12.0, -20, 0x4ade80, "🌲 PRIMEVAL AERIAL CANOPY BRIDGES [ELEV +12.0m]", "WORLD-TREE BOUGHS • HIGH FOREST WALKWAY & BIRD'S EYE VIEW", "#bbf7d0");

        // 10. Emerald Farron Shrine of the Abyss Watchers (outside_emerald_farron_shrine) (x = -480, z = -110, elev = +2.0m)
        const shrineDais = new THREE.Mesh(new THREE.CylinderGeometry(22, 26, 2.0, 12), this.stoneMat);
        shrineDais.position.set(-480, 1.0, -110);
        shrineDais.receiveShadow = true;
        outsideGroup.add(shrineDais);

        // 4 Emerald Sarcophagus Pillars
        [[-10, -10], [10, -10], [-10, 10], [10, 10]].forEach(([px, pz]) => {
            const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.5, 1.6), this.stoneMat);
            pillar.position.set(-480 + px, 4.25, -110 + pz);
            outsideGroup.add(pillar);
        });

        // Upright Wolf Knight Greatsword Monument in Center
        const swordHilt = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.8, 6), this.darkSteelMat);
        swordHilt.position.set(-480, 4.5, -110);
        outsideGroup.add(swordHilt);

        const swordCross = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.14, 0.2), this.darkSteelMat);
        swordCross.position.set(-480, 4.0, -110);
        outsideGroup.add(swordCross);

        const swordBlade = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.8, 0.08), this.bladeMat || this.darkSteelMat);
        swordBlade.position.set(-480, 2.0, -110);
        outsideGroup.add(swordBlade);

        const farronLight = new THREE.PointLight(0x10b981, 4.2, 30.0);
        farronLight.position.set(-480, 3.5, -110);
        outsideGroup.add(farronLight);
        this.createStandingBrazier(-480, 2.0, -122, 0x10b981, 4.2, 26);
        this.createStandingBrazier(-480, 2.0, -98, 0x10b981, 4.2, 26);
        this.createPathBeacon(-480, 2.0, -110, 0x10b981, "⚔️ EMERALD FARRON SHRINE [WEST EXPEDITION]", "ABYSS WATCHERS ALTAR • WOLF LEGION BANNERS & EMERALD FIRE", "#a7f3d0");

        // 11. Jagged Peak Draconic Caldera (outside_jagged_peak_caldera) (x = -260, z = 75, elev = +4.0m)
        const calderaPlat = new THREE.Mesh(new THREE.BoxGeometry(42, 4.0, 42), this.cliffRockMat);
        calderaPlat.position.set(-260, 2.0, 75);
        calderaPlat.receiveShadow = true;
        outsideGroup.add(calderaPlat);

        // Volcanic Obsidian Basalt Spire & Magma Fissure
        for (let sp = 0; sp < 6; sp++) {
            const sang = (sp / 6) * Math.PI * 2;
            const spire = new THREE.Mesh(new THREE.ConeGeometry(1.2, 8.5, 5), this.cliffRockMat);
            spire.position.set(-260 + Math.cos(sang) * 16, 6.0, 75 + Math.sin(sang) * 16);
            spire.rotation.set(Math.sin(sang) * 0.25, 0, Math.cos(sang) * 0.25);
            outsideGroup.add(spire);
        }

        const jaggedCalderaLava = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 0.4, 20), this.demonLavaMat || this.stoneMat);
        jaggedCalderaLava.position.set(-260, 4.1, 75);
        outsideGroup.add(jaggedCalderaLava);

        const jaggedCalderaLight = new THREE.PointLight(0xff1744, 4.5, 32.0);
        jaggedCalderaLight.position.set(-260, 7.5, 75);
        outsideGroup.add(jaggedCalderaLight);
        this.createStandingBrazier(-260, 4.0, 62, 0xff1744, 4.5, 26);
        this.createStandingBrazier(-260, 4.0, 88, 0xff1744, 4.5, 26);
        this.createPathBeacon(-260, 4.0, 75, 0xff1744, "🌋 JAGGED PEAK DRACONIC CALDERA [ELEV +4.0m]", "VOLCANIC BASALT CRAGS • BAYLE THE DREAD & DRACONIC BEASTMEN", "#fecdd3");

        // 12. Shadow Keep Impaler Ramparts (outside_shadow_keep_ramparts) (x = -175, z = -115, elev = +4.0m)
        const keepPlat = new THREE.Mesh(new THREE.BoxGeometry(36, 4.0, 36), this.stoneMat);
        keepPlat.position.set(-175, 2.0, -115);
        keepPlat.receiveShadow = true;
        outsideGroup.add(keepPlat);

        // Iron Impaler Stakes with burning coals
        for (let ik = -12; ik <= 12; ik += 6) {
            const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 6.5, 6), this.darkSteelMat);
            stake.position.set(-175 + ik, 6.5, -130);
            outsideGroup.add(stake);

            const coal = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 6), new THREE.MeshStandardMaterial({
                color: 0xff3b00,
                emissive: 0xff2200,
                emissiveIntensity: 1.5
            }));
            coal.position.set(-175 + ik, 9.6, -130);
            outsideGroup.add(coal);
        }

        const keepLight = new THREE.PointLight(0xff3b00, 4.2, 30.0);
        keepLight.position.set(-175, 7.5, -115);
        outsideGroup.add(keepLight);
        this.createStandingBrazier(-185, 4.0, -115, 0xff3b00, 4.2, 26);
        this.createStandingBrazier(-165, 4.0, -115, 0xff3b00, 4.2, 26);
        this.createPathBeacon(-175, 4.0, -115, 0xff3b00, "🏰 SHADOW KEEP IMPALER RAMPARTS [ELEV +4.0m]", "CRIMSON SERPENT STANDARDS • MESSMER THE IMPALER & CRUCIBLE SENTINELS", "#fed7aa");

        // 13. Midra's Frenzied Flame Catacomb (outside_frenzied_flame_abyss) (x = -245, z = -85, elev = -4.0m)
        const abyssPlat = new THREE.Mesh(new THREE.CylinderGeometry(24, 26, 1.2, 24), this.stoneMat);
        abyssPlat.position.set(-245, -4.6, -85);
        abyssPlat.receiveShadow = true;
        outsideGroup.add(abyssPlat);

        // Sunken Searing Frenzied Sun Caldera Basin
        const frenzySunBasin = new THREE.Mesh(new THREE.SphereGeometry(3.5, 16, 16), new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            emissive: 0xff8800,
            emissiveIntensity: 2.0
        }));
        frenzySunBasin.position.set(-245, -1.5, -85);
        outsideGroup.add(frenzySunBasin);

        const abyssLight = new THREE.PointLight(0xffaa00, 4.8, 34.0);
        abyssLight.position.set(-245, 0.5, -85);
        outsideGroup.add(abyssLight);
        this.createStandingBrazier(-245, -4.0, -73, 0xffaa00, 4.5, 26);
        this.createStandingBrazier(-245, -4.0, -97, 0xffaa00, 4.5, 26);
        this.createPathBeacon(-245, -4.0, -85, 0xffaa00, "👁️ MIDRA'S FRENZIED FLAME CATACOMB [ELEV -4.0m]", "ABYSSAL RUIN TERRACE • MIDRA LORD OF FRENZIED FLAME & MADNESS ACOLYTES", "#fef08a");

        // 14. Haligtree Sacred Canopy Roots (outside_haligtree_canopy_roots) (x = -95, z = 95, elev = +2.0m)
        const rootPlat = new THREE.Mesh(new THREE.CylinderGeometry(28, 32, 2.0, 16), this.stoneMat);
        rootPlat.position.set(-95, 1.0, 95);
        rootPlat.receiveShadow = true;
        outsideGroup.add(rootPlat);

        // Woven Golden Boughs & Blooming Scarlet Lotus
        const lotusBloom = new THREE.Mesh(new THREE.SphereGeometry(2.4, 12, 12), new THREE.MeshStandardMaterial({
            color: 0xf43f5e,
            emissive: 0xe11d48,
            emissiveIntensity: 1.2
        }));
        lotusBloom.position.set(-95, 3.8, 95);
        outsideGroup.add(lotusBloom);

        const rootLight = new THREE.PointLight(0xf43f5e, 4.2, 30.0);
        rootLight.position.set(-95, 5.0, 95);
        outsideGroup.add(rootLight);
        this.createStandingBrazier(-95, 2.0, 82, 0xf43f5e, 4.0, 24);
        this.createStandingBrazier(-95, 2.0, 108, 0xf43f5e, 4.0, 24);
        this.createPathBeacon(-95, 2.0, 95, 0xf43f5e, "🌸 HALIGTREE SACRED CANOPY ROOTS [ELEV +2.0m]", "UNALLOYED GOLD BOUGHS • MALENIA GODDESS OF ROT & CRYSTAL MAIDENS", "#fecdd3");

        // 15. Archdragon Thunder Belfry (outside_archdragon_thunder_peak) (x = -270, z = -25, elev = +7.0m)
        const belfryPlat = new THREE.Mesh(new THREE.BoxGeometry(32, 7.0, 32), this.stoneMat);
        belfryPlat.position.set(-270, 3.5, -25);
        belfryPlat.receiveShadow = true;
        outsideGroup.add(belfryPlat);

        // Colossal Bronze Dragon Belfry Bell
        const belfryBell = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 3.2, 4.5, 12), this.goldMat || this.stoneMat);
        belfryBell.position.set(-270, 11.5, -25);
        outsideGroup.add(belfryBell);

        const belfryLight = new THREE.PointLight(0xffdd44, 4.6, 34.0);
        belfryLight.position.set(-270, 13.0, -25);
        outsideGroup.add(belfryLight);
        this.createStandingBrazier(-270, 7.0, -38, 0xffdd44, 4.5, 26);
        this.createStandingBrazier(-270, 7.0, -12, 0xffdd44, 4.5, 26);
        this.createPathBeacon(-270, 7.0, -25, 0xffdd44, "⚡ ARCHDRAGON THUNDER BELFRY [ELEV +7.0m]", "SKYWARD MOUNTAIN BELLTOWER • NAMELESS KING & ONYX METEOR LORDS", "#fef08a");

        // 16. Forlorn Bloodhound Evergaol (outside_bloodhound_gaol) (x = -80, z = -110, elev = 0m)
        const gaolPlat = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 0.25, 24), this.darkSteelMat || this.stoneMat);
        gaolPlat.position.set(-80, 0.05, -110);
        gaolPlat.receiveShadow = true;
        outsideGroup.add(gaolPlat);

        for (let gm = 0; gm < 8; gm++) {
            const gang = (gm / 8) * Math.PI * 2;
            const gmono = new THREE.Mesh(new THREE.BoxGeometry(0.9, 4.5, 0.9), this.stoneMat);
            gmono.position.set(-80 + Math.cos(gang) * 14, 2.25, -110 + Math.sin(gang) * 14);
            gmono.rotation.y = gang;
            outsideGroup.add(gmono);
        }

        const gaolLight = new THREE.PointLight(0x38bdf8, 3.8, 26.0);
        gaolLight.position.set(-80, 1.8, -110);
        outsideGroup.add(gaolLight);
        this.createPathBeacon(-80, 0.0, -110, 0x38bdf8, "⛓️ FORLORN BLOODHOUND EVERGAOL [0m]", "RUNIC VOID RING • BLOODHOUND KNIGHT DARRIWIL & DIRE SHADOW WOLVES", "#bae6fd");

        // 17. Glintstone Crystalian Matrix (outside_crystalian_cavern_matrix) (x = -120, z = -110, elev = -2.0m)
        const matrixPlat = new THREE.Mesh(new THREE.CylinderGeometry(22, 24, 1.0, 16), this.stoneMat);
        matrixPlat.position.set(-120, -2.5, -110);
        matrixPlat.receiveShadow = true;
        outsideGroup.add(matrixPlat);

        // Towering Crystal Cluster Formations
        for (let cr = 0; cr < 7; cr++) {
            const crang = (cr / 7) * Math.PI * 2;
            const crystalMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.75, 6.5 + (cr % 3) * 1.5, 6), new THREE.MeshStandardMaterial({
                color: 0x00f5ff,
                emissive: 0x0088cc,
                emissiveIntensity: 1.2,
                roughness: 0.1,
                metalness: 0.3
            }));
            crystalMesh.position.set(-120 + Math.cos(crang) * 9.5, 1.0, -110 + Math.sin(crang) * 9.5);
            crystalMesh.rotation.set(Math.sin(crang) * 0.35, 0, Math.cos(crang) * 0.35);
            outsideGroup.add(crystalMesh);
        }

        const matrixLight = new THREE.PointLight(0x00f5ff, 4.2, 30.0);
        matrixLight.position.set(-120, 1.5, -110);
        outsideGroup.add(matrixLight);
        this.createStandingBrazier(-120, -2.0, -98, 0x00f5ff, 4.0, 24);
        this.createStandingBrazier(-120, -2.0, -122, 0x00f5ff, 4.0, 24);
        this.createPathBeacon(-120, -2.0, -110, 0x00f5ff, "💎 GLINTSTONE CRYSTALIAN MATRIX [ELEV -2.0m]", "RESONANT AZURE CRYSTAL SPIRES • CRYSTALIAN BLADEMAIDENS & CHAKRAMS", "#a5f3fc");

        // --- 7e. 8 BRAND-NEW BESPOKE 3D REALM EXPEDITIONS & LANDMARKS ---

        // 1. MOHGWYN BLOOD MAUSOLEUM & DYNASTIC ALTAR (x = -520, z = 140, elev = -6.0m) - Expanded Grand Dias
        const bloodPlazaGeo = new THREE.CylinderGeometry(52, 52, 0.4, 32);
        const bloodMarbleMat = new THREE.MeshStandardMaterial({ color: 0x3b0a12, roughness: 0.35, metalness: 0.75 });
        const bloodPlaza = new THREE.Mesh(bloodPlazaGeo, bloodMarbleMat);
        bloodPlaza.position.set(-520, -6.1, 140);
        bloodPlaza.receiveShadow = true;
        outsideGroup.add(bloodPlaza);

        // 4 Sanguine Obsidian Obelisks
        for (let i = 0; i < 4; i++) {
            const obAng = (i / 4) * Math.PI * 2;
            const mohgObelisk = new THREE.Mesh(new THREE.ConeGeometry(2.4, 18.0, 4), new THREE.MeshStandardMaterial({
                color: 0x140608,
                metalness: 0.9,
                roughness: 0.2
            }));
            mohgObelisk.position.set(-520 + Math.cos(obAng) * 36, 1.5, 140 + Math.sin(obAng) * 36);
            mohgObelisk.rotation.y = obAng;
            outsideGroup.add(mohgObelisk);
        }

        // Central Sacrificial Blood Chalice Basin
        const mohgChalice = new THREE.Mesh(new THREE.CylinderGeometry(6.0, 3.5, 3.0, 16), new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.9,
            roughness: 0.25
        }));
        mohgChalice.position.set(-520, -4.5, 140);
        outsideGroup.add(mohgChalice);

        const bloodPool = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 5.5, 0.2, 16), new THREE.MeshStandardMaterial({
            color: 0xaa0022,
            emissive: 0x880011,
            emissiveIntensity: 0.9,
            roughness: 0.1
        }));
        bloodPool.position.set(-520, -3.3, 140);
        outsideGroup.add(bloodPool);

        const mohgLight = new THREE.PointLight(0xff0033, 4.2, 35);
        mohgLight.position.set(-520, -1.5, 140);
        outsideGroup.add(mohgLight);

        this.createPathBeacon(-520, -6.0, 140, 0xff0033, "🩸 MOHGWYN BLOOD MAUSOLEUM [ELEV -6.0m]", "SACRED DYNASTIC MAUSOLEUM • MOHG LORD OF BLOOD & SANGUINE NOBLES", "#fca5a5");

        // 2. DRAGONBARROW BLACK FLAME SANCTUM (x = -550, z = -80, elev = +8.0m) - Expanded Grand Dias
        const sanctumDais = new THREE.Mesh(new THREE.BoxGeometry(65, 16, 65), this.cliffRockMat);
        sanctumDais.position.set(-550, 0, -80);
        outsideGroup.add(sanctumDais);

        const blackPlaza = new THREE.Mesh(new THREE.BoxGeometry(60, 0.4, 60), new THREE.MeshStandardMaterial({
            color: 0x18181c,
            roughness: 0.6,
            metalness: 0.8
        }));
        blackPlaza.position.set(-550, 8.1, -80);
        blackPlaza.receiveShadow = true;
        outsideGroup.add(blackPlaza);

        // 6 Flared Obsidian Pillars
        for (let p = 0; p < 6; p++) {
            const pang = (p / 6) * Math.PI * 2;
            const pil = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, 12.0, 6), new THREE.MeshStandardMaterial({
                color: 0x0f1114,
                roughness: 0.3,
                metalness: 0.9
            }));
            pil.position.set(-550 + Math.cos(pang) * 24, 14.0, -80 + Math.sin(pang) * 24);
            outsideGroup.add(pil);
        }

        // Godskin Black Flame Brazier
        const godskinBrazier = new THREE.Mesh(new THREE.SphereGeometry(2.4, 10, 10), new THREE.MeshStandardMaterial({
            color: 0xeeffff,
            emissive: 0x330055,
            emissiveIntensity: 1.8
        }));
        godskinBrazier.position.set(-550, 10.0, -80);
        outsideGroup.add(godskinBrazier);

        const godskinLight = new THREE.PointLight(0xaaccff, 4.5, 36);
        godskinLight.position.set(-550, 13.0, -80);
        outsideGroup.add(godskinLight);

        this.createPathBeacon(-550, 8.0, -80, 0xaaccff, "🔥 BLACK FLAME SANCTUM [ELEV +8.0m]", "GODSKIN DUO ALTAR • GODSKIN APOSTLE & NOBLE • SWIRLING BLACK FIRE", "#e0e7ff");

        // 3. TIMELESS EYE STORM SANCTUARY (x = -580, z = 40, elev = +14.0m) - Expanded Grand Dias
        const eyePlat = new THREE.Mesh(new THREE.CylinderGeometry(56, 68, 28, 20), this.cliffRockMat);
        eyePlat.position.set(-580, 0, 40);
        outsideGroup.add(eyePlat);

        // Ring of Levitating Golden Gravestones
        for (let g = 0; g < 12; g++) {
            const gravAng = (g / 12) * Math.PI * 2;
            const grave = new THREE.Mesh(new THREE.BoxGeometry(1.8, 4.2, 0.5), new THREE.MeshStandardMaterial({
                color: 0xd4af37,
                metalness: 0.85,
                roughness: 0.3
            }));
            grave.position.set(-580 + Math.cos(gravAng) * 36, 16.0 + Math.sin(gravAng * 2) * 3.0, 40 + Math.sin(gravAng) * 36);
            grave.rotation.y = gravAng + 0.4;
            grave.rotation.z = Math.sin(gravAng) * 0.3;
            outsideGroup.add(grave);
        }

        // Red Lightning Attractor Spires
        for (let s = -1; s <= 1; s += 2) {
            const rod = new THREE.Mesh(new THREE.ConeGeometry(0.8, 12.0, 5), new THREE.MeshStandardMaterial({
                color: 0xff0044,
                emissive: 0xee0033,
                emissiveIntensity: 1.5
            }));
            rod.position.set(-580 + s * 20, 20.0, 40);
            outsideGroup.add(rod);
        }

        const eyeLight = new THREE.PointLight(0xff0044, 4.8, 38);
        eyeLight.position.set(-580, 20.0, 40);
        outsideGroup.add(eyeLight);

        this.createPathBeacon(-580, 14.0, 40, 0xff0044, "⚡ TIMELESS EYE STORM SANCTUARY [ELEV +14.0m]", "DRAGONLORD PLACIDUSAX • FLOATING GOLD GRAVESTONES & RED LIGHTNING", "#fecdd3");

        // 4. DEEPROOT DEPTHS SUNKEN GODWYN CATACOMB (x = -510, z = -160, elev = -8.0m) - Expanded Grand Dias
        const deeprootCavern = new THREE.Mesh(new THREE.CylinderGeometry(56, 56, 0.4, 32), new THREE.MeshStandardMaterial({
            color: 0x081816,
            roughness: 0.95
        }));
        deeprootCavern.position.set(-510, -8.1, -160);
        deeprootCavern.receiveShadow = true;
        outsideGroup.add(deeprootCavern);

        // Giant Carved Stone Face of Prince of Death
        const godwynFace = new THREE.Mesh(new THREE.SphereGeometry(10.0, 16, 16), new THREE.MeshStandardMaterial({
            color: 0x22302e,
            roughness: 0.85
        }));
        godwynFace.scale.set(1.4, 0.8, 1.2);
        godwynFace.position.set(-510, -4.0, -182);
        outsideGroup.add(godwynFace);

        // Arching Deathroot Roots
        for (let r = 0; r < 6; r++) {
            const rang = (r / 6) * Math.PI * 2;
            const deeprootArchMesh = new THREE.Mesh(new THREE.TorusGeometry(15.0, 1.4, 6, 14, Math.PI * 0.7), new THREE.MeshStandardMaterial({
                color: 0x111618,
                roughness: 0.95
            }));
            deeprootArchMesh.position.set(-510 + Math.cos(rang) * 22, -3.0, -160 + Math.sin(rang) * 22);
            deeprootArchMesh.rotation.x = Math.PI / 2;
            deeprootArchMesh.rotation.y = rang;
            outsideGroup.add(deeprootArchMesh);
        }

        const deathLight = new THREE.PointLight(0x00ffcc, 4.4, 34);
        deathLight.position.set(-510, -2.0, -160);
        outsideGroup.add(deathLight);

        this.createPathBeacon(-510, -8.0, -160, 0x00ffcc, "💀 DEEPROOT PRINCE OF DEATH [ELEV -8.0m]", "PETRIFIED GODWYN VISAGE • DEATHROOT ARCHWAYS • MAUSOLEUM KNIGHTS", "#99f6e4");

        // 5. SUNKEN CITY OF SHULVA (x = -570, z = 220, elev = -5.0m) - Expanded Grand Dias
        const shulvaBasin = new THREE.Mesh(new THREE.CylinderGeometry(56, 56, 0.4, 32), new THREE.MeshStandardMaterial({
            color: 0x0a201c,
            roughness: 0.8
        }));
        shulvaBasin.position.set(-570, -5.1, 220);
        outsideGroup.add(shulvaBasin);

        // Stepped Ziggurat Pyramid Structure
        for (let st = 0; st < 3; st++) {
            const step = new THREE.Mesh(new THREE.BoxGeometry(44 - st * 12, 2.0, 44 - st * 12), new THREE.MeshStandardMaterial({
                color: 0x1f4038,
                roughness: 0.7,
                metalness: 0.3
            }));
            step.position.set(-570, -4.0 + st * 2.0, 220);
            outsideGroup.add(step);
        }

        // Verdigris Bronze Totem Columns
        for (let col = -1; col <= 1; col += 2) {
            const totem = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.0, 14.0, 6), new THREE.MeshStandardMaterial({
                color: 0x2d5a52,
                roughness: 0.6,
                metalness: 0.75
            }));
            totem.position.set(-570 + col * 22, 1.5, 220);
            outsideGroup.add(totem);
        }

        const poisonLight = new THREE.PointLight(0x00ff88, 4.5, 34);
        poisonLight.position.set(-570, 4.0, 220);
        outsideGroup.add(poisonLight);

        this.createPathBeacon(-570, -5.0, 220, 0x00ff88, "🐉 SUNKEN CITY OF SHULVA [ELEV -5.0m]", "SINH SLUMBERING DRAGON • STEPPED PYRAMID • POISON SANCTUM AUTOMATONS", "#a7f3d0");

        // 6. BRUME TOWER ASHEN SMELTER FURNACE (x = -540, z = -220, elev = +10.0m) - Expanded Grand Dias
        const smelterTower = new THREE.Mesh(new THREE.CylinderGeometry(44, 56, 20, 20), this.cliffRockMat);
        smelterTower.position.set(-540, 0, -220);
        outsideGroup.add(smelterTower);

        const smelterVat = new THREE.Mesh(new THREE.CylinderGeometry(32, 28, 4.0, 20), new THREE.MeshStandardMaterial({
            color: 0x222428,
            metalness: 0.9,
            roughness: 0.35
        }));
        smelterVat.position.set(-540, 10.5, -220);
        outsideGroup.add(smelterVat);

        // Boiling Molten Magma Core
        const vatMagma = new THREE.Mesh(new THREE.CylinderGeometry(27, 27, 0.5, 20), new THREE.MeshStandardMaterial({
            color: 0xff3300,
            emissive: 0xee2200,
            emissiveIntensity: 1.8,
            roughness: 0.1
        }));
        vatMagma.position.set(-540, 11.8, -220);
        outsideGroup.add(vatMagma);

        // 4 Colossal 2.5m Iron Anchor Chains
        for (let ch = 0; ch < 4; ch++) {
            const chang = (ch / 4) * Math.PI * 2;
            const chain = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 26.0, 6), new THREE.MeshStandardMaterial({
                color: 0x111114,
                metalness: 0.95,
                roughness: 0.3
            }));
            chain.position.set(-540 + Math.cos(chang) * 26, 6.0, -220 + Math.sin(chang) * 26);
            chain.rotation.x = Math.sin(chang) * 0.4;
            chain.rotation.z = -Math.cos(chang) * 0.4;
            outsideGroup.add(chain);
        }

        const fumeLight = new THREE.PointLight(0xff4400, 4.6, 36);
        fumeLight.position.set(-540, 15.0, -220);
        outsideGroup.add(fumeLight);

        this.createPathBeacon(-540, 10.0, -220, 0xff4400, "⚔️ BRUME TOWER SMELTER FURNACE [ELEV +10.0m]", "FUME KNIGHT RAIME • MOLTEN IRON VAT • COLOSSAL ANCHOR CHAINS", "#fed7aa");

        // 7. CATHEDRAL OF THE ECLIPSE & CASTLE SOL (x = -600, z = -120, elev = +6.0m) - Expanded Grand Dias
        const solPlatform = new THREE.Mesh(new THREE.BoxGeometry(64, 12, 64), this.cliffRockMat);
        solPlatform.position.set(-600, 0, -120);
        outsideGroup.add(solPlatform);

        const solPaving = new THREE.Mesh(new THREE.BoxGeometry(58, 0.4, 58), new THREE.MeshStandardMaterial({
            color: 0x8a98a6,
            metalness: 0.4,
            roughness: 0.45
        }));
        solPaving.position.set(-600, 6.1, -120);
        outsideGroup.add(solPaving);

        // Fortified Crenelated Parapets
        for (let wall = 0; wall < 4; wall++) {
            const wang = (wall / 4) * Math.PI * 2;
            const parapet = new THREE.Mesh(new THREE.BoxGeometry(54, 2.2, 1.6), this.stoneMat);
            parapet.position.set(-600 + Math.cos(wang) * 27, 7.2, -120 + Math.sin(wang) * 27);
            parapet.rotation.y = wang;
            outsideGroup.add(parapet);
        }

        // Solar Eclipse Standards
        for (let st = -1; st <= 1; st += 2) {
            const standard = new THREE.Mesh(new THREE.BoxGeometry(0.3, 10.0, 2.6), new THREE.MeshStandardMaterial({
                color: 0x111622,
                roughness: 0.9
            }));
            standard.position.set(-600 + st * 20, 11.0, -120);
            outsideGroup.add(standard);
        }

        const solLight = new THREE.PointLight(0x88eeff, 4.2, 32);
        solLight.position.set(-600, 10.0, -120);
        outsideGroup.add(solLight);

        this.createPathBeacon(-600, 6.0, -120, 0x88eeff, "⚡ CASTLE SOL ECLIPSE RAMPARTS [ELEV +6.0m]", "COMMANDER NIALL • BLIZZARD FROST BATTLEMENTS • BANISHED KNIGHTS", "#cffafe");

        // 8. CARIAN ROYAL MOONGAZING SPIRE (x = -620, z = 160, elev = +12.0m) - Expanded Grand Dias
        const moonSpire = new THREE.Mesh(new THREE.CylinderGeometry(48, 60, 24, 20), this.cliffRockMat);
        moonSpire.position.set(-620, 0, 160);
        outsideGroup.add(moonSpire);

        const moonTerrace = new THREE.Mesh(new THREE.CylinderGeometry(42, 42, 0.4, 32), new THREE.MeshStandardMaterial({
            color: 0x142844,
            roughness: 0.2,
            metalness: 0.8
        }));
        moonTerrace.position.set(-620, 12.1, 160);
        outsideGroup.add(moonTerrace);

        // Hovering Luminous Silver Moon Sphere
        const ranniSilverMoon = new THREE.Mesh(new THREE.SphereGeometry(6.0, 16, 16), new THREE.MeshStandardMaterial({
            color: 0xddeeff,
            emissive: 0x66ccee,
            emissiveIntensity: 1.6,
            roughness: 0.1
        }));
        ranniSilverMoon.position.set(-620, 22.0, 160);
        outsideGroup.add(ranniSilverMoon);

        // Orbital Celestial Rings
        const moonRing = new THREE.Mesh(new THREE.TorusGeometry(9.0, 0.25, 6, 24), new THREE.MeshStandardMaterial({
            color: 0x00f5ff,
            emissive: 0x00aacc,
            emissiveIntensity: 1.4
        }));
        moonRing.position.set(-620, 22.0, 160);
        moonRing.rotation.x = 0.85;
        moonRing.rotation.y = 0.35;
        outsideGroup.add(moonRing);

        const lorettaLight = new THREE.PointLight(0x00bbff, 4.6, 36);
        lorettaLight.position.set(-620, 18.0, 160);
        outsideGroup.add(lorettaLight);

        this.createPathBeacon(-620, 12.0, 160, 0x00bbff, "🌙 CARIAN ROYAL LUNAR SPIRE [ELEV +12.0m]", "ROYAL KNIGHT LORETTA • HOVERING SILVER MOON CORE • CARIAN PRECEPTORS", "#bae6fd");

        // 8. BRAND-NEW BESPOKE 3D REALM EXPEDITIONS & LANDMARKS (V41 EXPANSION)

        // A. HALIGTREE ROOTS OF ROTTING AEONIA (x = -640, z = -180, elev = -4.0m)
        const aeoniaBasin = new THREE.Mesh(new THREE.CylinderGeometry(56, 62, 0.6, 32), this.cliffRockMat);
        aeoniaBasin.position.set(-640, -4.3, -180);
        aeoniaBasin.receiveShadow = true;
        outsideGroup.add(aeoniaBasin);

        const aeoniaRotPool = new THREE.Mesh(new THREE.CylinderGeometry(42, 42, 0.25, 24), new THREE.MeshStandardMaterial({
            color: 0x881122,
            emissive: 0xaa2233,
            emissiveIntensity: 1.1,
            roughness: 0.2
        }));
        aeoniaRotPool.position.set(-640, -3.95, -180);
        outsideGroup.add(aeoniaRotPool);

        // Giant Blooming Scarlet Aeonia Flower in Center
        for (let pet = 0; pet < 8; pet++) {
            const petAng = (pet / 8) * Math.PI * 2;
            const petal = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.35, 12.0), new THREE.MeshStandardMaterial({
                color: 0xd946ef,
                emissive: 0x9d174d,
                emissiveIntensity: 0.8,
                roughness: 0.4
            }));
            petal.position.set(-640 + Math.cos(petAng) * 9.5, -3.2, -180 + Math.sin(petAng) * 9.5);
            petal.rotation.y = petAng;
            petal.rotation.x = 0.35;
            outsideGroup.add(petal);
        }
        const stamenCore = new THREE.Mesh(new THREE.SphereGeometry(3.6, 16, 16), new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            emissive: 0xd97706,
            emissiveIntensity: 1.5
        }));
        stamenCore.position.set(-640, -2.5, -180);
        outsideGroup.add(stamenCore);

        // Petrified Root Arches
        for (let ra = 0; ra < 3; ra++) {
            const rootArch = new THREE.Mesh(new THREE.TorusGeometry(14.0, 0.8, 6, 16, Math.PI), this.cliffRockMat);
            rootArch.position.set(-640, -4.0, -180);
            rootArch.rotation.y = ra * (Math.PI / 3);
            outsideGroup.add(rootArch);
        }

        const aeoniaLight = new THREE.PointLight(0xff2244, 4.6, 38);
        aeoniaLight.position.set(-640, 0.5, -180);
        outsideGroup.add(aeoniaLight);
        this.createPathBeacon(-640, -4.0, -180, 0xff2244, "🌸 HALIGTREE ROOTS OF SCARLET AEONIA [ELEV -4.0m]", "MALENIA GODDESS OF ROT • BLOOMING SCARLET FLOWER • CLEANROT VALKYRIES", "#fecdd3");

        // B. ENIR-ILIM DIVINE GATE STAIRCASE (x = -680, z = -40, elev = +16.0m)
        const enirBase = new THREE.Mesh(new THREE.BoxGeometry(68, 32, 68), this.cliffRockMat);
        enirBase.position.set(-680, 0, -40);
        outsideGroup.add(enirBase);

        const enirPlaza = new THREE.Mesh(new THREE.BoxGeometry(62, 0.5, 62), new THREE.MeshStandardMaterial({
            color: 0xfef08a,
            metalness: 0.85,
            roughness: 0.25
        }));
        enirPlaza.position.set(-680, 16.1, -40);
        enirPlaza.receiveShadow = true;
        outsideGroup.add(enirPlaza);

        // Dual Divine Gate of Divinity Spires
        const leftTower = new THREE.Mesh(new THREE.BoxGeometry(4.5, 26, 4.5), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 }));
        leftTower.position.set(-696, 29, -40);
        outsideGroup.add(leftTower);

        const rightTower = new THREE.Mesh(new THREE.BoxGeometry(4.5, 26, 4.5), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 }));
        rightTower.position.set(-664, 29, -40);
        outsideGroup.add(rightTower);

        const gateArch = new THREE.Mesh(new THREE.BoxGeometry(36, 3.5, 4.5), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 }));
        gateArch.position.set(-680, 40, -40);
        outsideGroup.add(gateArch);

        // Sacred Floating Golden Halo
        const holyHalo = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.35, 12, 32), new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0xffaa00,
            emissiveIntensity: 1.8
        }));
        holyHalo.position.set(-680, 32, -40);
        outsideGroup.add(holyHalo);

        const enirLight = new THREE.PointLight(0xffd700, 4.8, 42);
        enirLight.position.set(-680, 22, -40);
        outsideGroup.add(enirLight);
        this.createPathBeacon(-680, 16.0, -40, 0xffd700, "👑 ENIR-ILIM DIVINE GATE STAIRCASE [ELEV +16.0m]", "PROMISED CONSORT RADAHN & MIQUELLA • DUAL GATE OF DIVINITY • LION DISCIPLES", "#fef08a");

        // C. IRON KEEP POLISHED OBSIDIAN ALTAR (x = -650, z = 80, elev = +8.0m)
        const alonnePlat = new THREE.Mesh(new THREE.BoxGeometry(64, 16, 64), this.cliffRockMat);
        alonnePlat.position.set(-650, 0, 80);
        outsideGroup.add(alonnePlat);

        const mirrorObsidianFloor = new THREE.Mesh(new THREE.BoxGeometry(58, 0.4, 58), new THREE.MeshStandardMaterial({
            color: 0x0a0a0f,
            metalness: 0.95,
            roughness: 0.08
        }));
        mirrorObsidianFloor.position.set(-650, 8.1, 80);
        mirrorObsidianFloor.receiveShadow = true;
        outsideGroup.add(mirrorObsidianFloor);

        // 2 Scarlet Torii Gates
        [-1, 1].forEach(side => {
            const toriiZ = 80 + side * 18;
            const toriiP1 = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 10, 8), new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 }));
            toriiP1.position.set(-662, 13, toriiZ);
            outsideGroup.add(toriiP1);

            const toriiP2 = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 10, 8), new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 }));
            toriiP2.position.set(-638, 13, toriiZ);
            outsideGroup.add(toriiP2);

            const toriiBeam = new THREE.Mesh(new THREE.BoxGeometry(28, 0.9, 1.2), new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.4 }));
            toriiBeam.position.set(-650, 18, toriiZ);
            outsideGroup.add(toriiBeam);
        });

        const alonneLight = new THREE.PointLight(0xff3300, 4.2, 36);
        alonneLight.position.set(-650, 12, 80);
        outsideGroup.add(alonneLight);
        this.createPathBeacon(-650, 8.0, 80, 0xff3300, "🗡️ IRON KEEP ALONNE DUEL DOJO [ELEV +8.0m]", "SIR ALONNE SWORD SAINT • MIRROR-POLISHED OBSIDIAN • ALONNE SHADOW SAMURAI", "#fdba74");

        // D. OLD CHAOS THRONE OF THE IVORY KING (x = -690, z = 120, elev = -7.0m)
        const chaosPit = new THREE.Mesh(new THREE.CylinderGeometry(58, 64, 14, 28), this.cliffRockMat);
        chaosPit.position.set(-690, -14, 120);
        outsideGroup.add(chaosPit);

        const lavaMoat = new THREE.Mesh(new THREE.TorusGeometry(32, 4.5, 8, 24), this.demonLavaMat || this.stoneMat);
        lavaMoat.position.set(-690, -7.2, 120);
        lavaMoat.rotation.x = Math.PI / 2;
        outsideGroup.add(lavaMoat);

        // Center Ivory Throne Plinth
        const ivoryDais = new THREE.Mesh(new THREE.CylinderGeometry(20, 22, 1.0, 20), new THREE.MeshStandardMaterial({
            color: 0xf1f5f9,
            metalness: 0.7,
            roughness: 0.3
        }));
        ivoryDais.position.set(-690, -6.6, 120);
        ivoryDais.receiveShadow = true;
        outsideGroup.add(ivoryDais);

        // Ivory Throne Structure
        const throne = new THREE.Mesh(new THREE.BoxGeometry(4.0, 7.0, 2.8), new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.8,
            roughness: 0.2
        }));
        throne.position.set(-690, -3.1, 114);
        outsideGroup.add(throne);

        // 4 Ice-Flame Crystalline Spires
        for (let isp = 0; isp < 4; isp++) {
            const ispAng = (isp / 4) * Math.PI * 2;
            const iceSpire = new THREE.Mesh(new THREE.ConeGeometry(1.2, 11, 5), new THREE.MeshStandardMaterial({
                color: 0x67e8f9,
                emissive: 0x06b6d4,
                emissiveIntensity: 1.2
            }));
            iceSpire.position.set(-690 + Math.cos(ispAng) * 16, -1.1, 120 + Math.sin(ispAng) * 16);
            outsideGroup.add(iceSpire);
        }

        const chaosFireLight = new THREE.PointLight(0xff4500, 4.2, 34);
        chaosFireLight.position.set(-690, -3.0, 120);
        outsideGroup.add(chaosFireLight);
        this.createPathBeacon(-690, -7.0, 120, 0x67e8f9, "🔥 OLD CHAOS THRONE OF THE IVORY KING [ELEV -7.0m]", "THE BURNT IVORY KING • FROZEN IVORY THRONE • CHARRED LOYCE KNIGHTS", "#a5f3fc");

        // E. DUNE OF FILIANORE & GAEL'S ASHEN WASTE (x = -720, z = -220, elev = +2.0m)
        const ashenDunes = new THREE.Mesh(new THREE.BoxGeometry(70, 4, 70), new THREE.MeshStandardMaterial({
            color: 0x94a3b8,
            roughness: 0.95,
            metalness: 0.1
        }));
        ashenDunes.position.set(-720, 0, -220);
        ashenDunes.receiveShadow = true;
        outsideGroup.add(ashenDunes);

        // Collapsed Half-Buried Gothic Spire
        const tiltedSpire = new THREE.Mesh(new THREE.ConeGeometry(2.6, 18, 6), this.stoneMat);
        tiltedSpire.position.set(-712, 6.0, -214);
        tiltedSpire.rotation.z = 0.45;
        tiltedSpire.rotation.x = -0.3;
        outsideGroup.add(tiltedSpire);

        const brokenArch = new THREE.Mesh(new THREE.TorusGeometry(7.0, 0.9, 4, 12, Math.PI), this.stoneMat);
        brokenArch.position.set(-728, 2.0, -226);
        brokenArch.rotation.y = 0.6;
        outsideGroup.add(brokenArch);

        const gaelLight = new THREE.PointLight(0xfca5a5, 3.8, 35);
        gaelLight.position.set(-720, 5.0, -220);
        outsideGroup.add(gaelLight);
        this.createPathBeacon(-720, 2.0, -220, 0xe2e8f0, "⏳ ASYLUM OF GAEL: ASHEN DUNES [ELEV +2.0m]", "SLAVE KNIGHT GAEL • END OF TIME ASHEN SEA • RINGED EXECUTIONERS", "#f1f5f9");

        // F. RINGED CITY ABYSSAL MIDIR CHASM (x = -730, z = 20, elev = -10.0m)
        const midirChasm = new THREE.Mesh(new THREE.CylinderGeometry(54, 58, 20, 24), this.cliffRockMat);
        midirChasm.position.set(-730, -20, 20);
        outsideGroup.add(midirChasm);

        const abyssFloor = new THREE.Mesh(new THREE.CylinderGeometry(48, 48, 0.4, 24), new THREE.MeshStandardMaterial({
            color: 0x090514,
            roughness: 0.3,
            metalness: 0.9
        }));
        abyssFloor.position.set(-730, -10.1, 20);
        abyssFloor.receiveShadow = true;
        outsideGroup.add(abyssFloor);

        // 6 Protruding Abyssal Humanity Crystals
        for (let hc = 0; hc < 6; hc++) {
            const hcAng = (hc / 6) * Math.PI * 2;
            const humCrystal = new THREE.Mesh(new THREE.ConeGeometry(1.4, 9.0, 4), new THREE.MeshStandardMaterial({
                color: 0x3b0764,
                emissive: 0x581c87,
                emissiveIntensity: 1.4
            }));
            humCrystal.position.set(-730 + Math.cos(hcAng) * 22, -6.0, 20 + Math.sin(hcAng) * 22);
            humCrystal.rotation.z = Math.cos(hcAng) * 0.35;
            outsideGroup.add(humCrystal);
        }

        const midirLight = new THREE.PointLight(0x9333ea, 4.8, 38);
        midirLight.position.set(-730, -4.0, 20);
        outsideGroup.add(midirLight);
        this.createPathBeacon(-730, -10.0, 20, 0x9333ea, "🐉 RINGED CITY ABYSSAL MIDIR CHASM [ELEV -10.0m]", "DARKEATER MIDIR • PRIMORDIAL HUMANITY PIT • ABYSSAL DRAGON APOSTLES", "#d8b4fe");

        // G. NIGHTMARE CORPSE-RIVER CAVERN (x = -670, z = 240, elev = -3.0m)
        const riverBasin = new THREE.Mesh(new THREE.BoxGeometry(65, 6, 65), this.cliffRockMat);
        riverBasin.position.set(-670, -6, 240);
        outsideGroup.add(riverBasin);

        // Crimson Blood Channel
        const bloodRiver = new THREE.Mesh(new THREE.BoxGeometry(26, 0.3, 58), new THREE.MeshStandardMaterial({
            color: 0x7f1d1d,
            emissive: 0x450a0a,
            emissiveIntensity: 0.6,
            roughness: 0.15
        }));
        bloodRiver.position.set(-670, -2.9, 240);
        outsideGroup.add(bloodRiver);

        // Colossal Skeletal Ribcage Arches
        [-16, 0, 16].forEach(offsetZ => {
            const rib = new THREE.Mesh(new THREE.TorusGeometry(6.2, 0.5, 6, 12, Math.PI), this.dragonBoneMat || this.stoneMat);
            rib.position.set(-670, -3.0, 240 + offsetZ);
            outsideGroup.add(rib);
        });

        // Glowing Holy Moonlight Greatsword Crystals
        const moonlightCluster = new THREE.Mesh(new THREE.ConeGeometry(0.9, 7.0, 5), new THREE.MeshStandardMaterial({
            color: 0xa5f3fc,
            emissive: 0x06b6d4,
            emissiveIntensity: 1.8
        }));
        moonlightCluster.position.set(-658, 0.5, 240);
        moonlightCluster.rotation.z = -0.4;
        outsideGroup.add(moonlightCluster);

        const ludwigLight = new THREE.PointLight(0x22d3ee, 4.5, 36);
        ludwigLight.position.set(-670, 1.0, 240);
        outsideGroup.add(ludwigLight);
        this.createPathBeacon(-670, -3.0, 240, 0x22d3ee, "🌕 NIGHTMARE CORPSE-RIVER CAVERN [ELEV -3.0m]", "LUDWIG THE HOLY BLADE • MOONLIGHT CRYSTALS • GOOD BLOOD HUNTERS", "#a5f3fc");

        // H. ASTRAL CLOCKTOWER CELESTIAL BALCONY (x = -710, z = -140, elev = +14.0m)
        const clocktowerSpire = new THREE.Mesh(new THREE.CylinderGeometry(50, 62, 28, 24), this.cliffRockMat);
        clocktowerSpire.position.set(-710, 0, -140);
        outsideGroup.add(clocktowerSpire);

        const clocktowerTerrace = new THREE.Mesh(new THREE.CylinderGeometry(44, 44, 0.4, 32), new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.3,
            metalness: 0.8
        }));
        clocktowerTerrace.position.set(-710, 14.1, -140);
        clocktowerTerrace.receiveShadow = true;
        outsideGroup.add(clocktowerTerrace);

        // Huge Vertical Astronomical Clock Dial
        const dialRing = new THREE.Mesh(new THREE.TorusGeometry(12.0, 0.45, 8, 36), new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.9,
            roughness: 0.2
        }));
        dialRing.position.set(-710, 26.0, -156);
        outsideGroup.add(dialRing);

        const dialCore = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 5.0, 0.3, 16), new THREE.MeshStandardMaterial({
            color: 0xd946ef,
            emissive: 0xa21caf,
            emissiveIntensity: 1.4
        }));
        dialCore.position.set(-710, 26.0, -156);
        dialCore.rotation.x = Math.PI / 2;
        outsideGroup.add(dialCore);

        const clockLight = new THREE.PointLight(0xd946ef, 4.4, 38);
        clockLight.position.set(-710, 20.0, -140);
        outsideGroup.add(clockLight);
        this.createPathBeacon(-710, 14.0, -140, 0xd946ef, "🕰️ ASTRAL CLOCKTOWER BALCONY [ELEV +14.0m]", "LADY MARIA OF THE ASTRAL CLOCKTOWER • CELESTIAL CLOCKWORK • CLOCKWORK MAIDENS", "#f0abfc");

        // Floating forest firefly particles
        const fireflyGeo = new THREE.BufferGeometry();
        const fireflyCount = 60;
        const fireflyPositions = new Float32Array(fireflyCount * 3);
        for (let f = 0; f < fireflyCount; f++) {
            fireflyPositions[f * 3] = -40 - Math.random() * 140;
            fireflyPositions[f * 3 + 1] = 1.0 + Math.random() * 8.0;
            fireflyPositions[f * 3 + 2] = -75 + Math.random() * 150;
        }
        fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));
        const fireflyMat = new THREE.PointsMaterial({
            color: 0x76ff03,
            size: 0.35,
            transparent: true,
            opacity: 0.85
        });
        const fireflyPoints = new THREE.Points(fireflyGeo, fireflyMat);
        outsideGroup.add(fireflyPoints);

        // Build 10 Brand-New Megaterritory Locations across the 8x Scaled Realm
        this.buildTenNewLocations(outsideGroup);

        // Build 8 Brand-New Monumental Outside Realm Expeditions (V47 Expansion)
        this.buildEightMonumentalOutsideExpeditions(outsideGroup);

        // Build 8 Brand-New Legendary Outside Realm Expeditions (V55 Expansion)
        this.buildEightLegendaryOutsideExpeditions(outsideGroup);

        this.scene.add(outsideGroup);
    }

    buildTenNewLocations(outsideGroup) {
        // ====================================================================
        // 10 BRAND-NEW MEGATERRITORY LOCATIONS (3D BESPOKE ARCHITECTURE & HUBS)
        // ====================================================================

        // --------------------------------------------------------------------
        // 1. VALLEY OF THE WEEPING DRAKES ([-650, -4.0, 350])
        // --------------------------------------------------------------------
        const drakePlat = new THREE.Mesh(new THREE.BoxGeometry(160, 2.0, 160), this.cliffRockMat);
        drakePlat.position.set(-650, -5.0, 350);
        drakePlat.receiveShadow = true;
        outsideGroup.add(drakePlat);

        // 3 Giant Dragon Bone Ribcage Arches (18m radius)
        [-690, -650, -610].forEach((drx, dri) => {
            const rib = new THREE.Mesh(new THREE.TorusGeometry(18.0, 1.8, 8, 20, Math.PI), this.dragonBoneMat || this.wallMat);
            rib.position.set(drx, -4.0, 350);
            rib.rotation.y = Math.PI / 2 + (dri - 1) * 0.15;
            outsideGroup.add(rib);
        });

        // Drake Nest with Glowing Calcite Dragon Eggs
        for (let de = 0; de < 4; de++) {
            const deAng = (de / 4) * Math.PI * 2;
            const egg = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6), this.calamityEyeMat || this.goldMat);
            egg.position.set(-650 + Math.cos(deAng) * 4.5, -3.2, 350 + Math.sin(deAng) * 4.5);
            outsideGroup.add(egg);
        }
        const drakeLight = new THREE.PointLight(0x10b981, 4.0, 45.0);
        drakeLight.position.set(-650, -2.0, 350);
        outsideGroup.add(drakeLight);

        this.createStandingBrazier(-640, -4.0, 335, 0x10b981, 5.0, 35);
        this.createStandingBrazier(-660, -4.0, 365, 0x10b981, 5.0, 35);
        this.createPathBeacon(-650, -4.0, 350, 0x10b981, "🐉 VALLEY OF THE WEEPING DRAKES [ELEV -4.0m]", "COLOSSAL WYVERN RIBCAGES • DRAKE EGGS & GORGE NEST", "#6ee7b7");
        this.createFloorSoapstone(-650, -4.0, 345, "#10b981", "🐉 VALLEY OF THE WEEPING DRAKES", "Ancient Wyvern Matriarch perches upon dragon bone crags");

        // --------------------------------------------------------------------
        // 2. SUNKEN CATHEDRAL OF ARCHBISHOPS ([550, -3.0, 500])
        // --------------------------------------------------------------------
        const cathFloor = new THREE.Mesh(new THREE.BoxGeometry(140, 2.0, 180), this.stoneMat);
        cathFloor.position.set(550, -4.0, 500);
        cathFloor.receiveShadow = true;
        outsideGroup.add(cathFloor);

        // Flooded Turquoise Water Pool
        const cathPool = new THREE.Mesh(new THREE.PlaneGeometry(100, 140), new THREE.MeshStandardMaterial({
            color: 0x0ea5e9, roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.75
        }));
        cathPool.rotation.x = -Math.PI / 2;
        cathPool.position.set(550, -2.95, 500);
        outsideGroup.add(cathPool);

        // 6 Soaring Ribbed Vault Cathedral Arches
        for (let ca = -2; ca <= 2; ca += 2) {
            const archP1 = new THREE.Mesh(new THREE.BoxGeometry(3.5, 20.0, 3.5), this.wallMat);
            archP1.position.set(525, 7.0, 500 + ca * 24);
            outsideGroup.add(archP1);
            const archP2 = new THREE.Mesh(new THREE.BoxGeometry(3.5, 20.0, 3.5), this.wallMat);
            archP2.position.set(575, 7.0, 500 + ca * 24);
            outsideGroup.add(archP2);
            const archTop = new THREE.Mesh(new THREE.TorusGeometry(25.0, 1.8, 8, 16, Math.PI), this.wallMat);
            archTop.position.set(550, 17.0, 500 + ca * 24);
            outsideGroup.add(archTop);
        }

        // Submerged High Altar
        const cathAltar = new THREE.Mesh(new THREE.BoxGeometry(16, 2.5, 8), this.serpentJadeMat || this.stoneMat);
        cathAltar.position.set(550, -2.0, 560);
        outsideGroup.add(cathAltar);
        const cathLight = new THREE.PointLight(0x38bdf8, 4.5, 50.0);
        cathLight.position.set(550, 2.0, 500);
        outsideGroup.add(cathLight);

        this.createStandingBrazier(535, -3.0, 500, 0x38bdf8, 5.0, 35);
        this.createStandingBrazier(565, -3.0, 500, 0x38bdf8, 5.0, 35);
        this.createPathBeacon(550, -3.0, 500, 0x38bdf8, "⛪ SUNKEN CATHEDRAL OF ARCHBISHOPS [ELEV -3.0m]", "SUBMERGED GOTHIC NAVE • SACRED TURQUOISE LAKE & DROWNED PATRIARCHS", "#7dd3fc");
        this.createFloorSoapstone(550, -3.0, 490, "#38bdf8", "⛪ SUNKEN CATHEDRAL", "Prayers echo beneath the flooded gothic vaults");

        // --------------------------------------------------------------------
        // 3. CINDER PEAK & OBSIDIAN CALDERA ([-750, 10.0, -400])
        // --------------------------------------------------------------------
        const calderaPlat = new THREE.Mesh(new THREE.CylinderGeometry(75, 85, 4.0, 24), this.cliffRockMat);
        calderaPlat.position.set(-750, 8.0, -400);
        calderaPlat.receiveShadow = true;
        outsideGroup.add(calderaPlat);

        // Boiling Magma Lake at Center of Caldera
        const magmaLake = new THREE.Mesh(new THREE.CylinderGeometry(40, 40, 0.4, 24), new THREE.MeshStandardMaterial({
            color: 0xff4500, emissive: 0xff3300, emissiveIntensity: 1.0, roughness: 0.2
        }));
        magmaLake.position.set(-750, 10.05, -400);
        outsideGroup.add(magmaLake);

        // Giant Obsidian Smithing Anvil Monolith
        const anvil = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 8), this.darkSteelMat || this.stoneMat);
        anvil.position.set(-750, 13.0, -425);
        outsideGroup.add(anvil);

        // 6 Hexagonal Basalt Column Spires
        for (let bc = 0; bc < 6; bc++) {
            const bAng = (bc / 6) * Math.PI * 2;
            const bCol = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.2, 16.0, 6), this.cliffRockMat);
            bCol.position.set(-750 + Math.cos(bAng) * 55, 14.0, -400 + Math.sin(bAng) * 55);
            outsideGroup.add(bCol);
        }
        const calderaLight = new THREE.PointLight(0xff3300, 5.0, 60.0);
        calderaLight.position.set(-750, 14.0, -400);
        outsideGroup.add(calderaLight);

        this.createStandingBrazier(-730, 10.0, -400, 0xff4500, 6.0, 40);
        this.createStandingBrazier(-770, 10.0, -400, 0xff4500, 6.0, 40);
        this.createPathBeacon(-750, 10.0, -400, 0xff4500, "🌋 CINDER PEAK & OBSIDIAN CALDERA [ELEV +10.0m]", "VOLCANIC BASALT COLUMNS • OBSIDIAN FORGE & MOLTEN SMELTER WYRM", "#fdba74");
        this.createFloorSoapstone(-750, 10.0, -385, "#ff4500", "🌋 CINDER PEAK CALDERA", "The magma forge of primeval giants burns eternally");

        // --------------------------------------------------------------------
        // 4. FROZEN GLADE OF ASTRAL GIANTS ([650, 6.0, -350])
        // --------------------------------------------------------------------
        const frostPlat = new THREE.Mesh(new THREE.BoxGeometry(150, 2.0, 150), new THREE.MeshStandardMaterial({
            color: 0xecfeff, roughness: 0.65
        }));
        frostPlat.position.set(650, 5.0, -350);
        frostPlat.receiveShadow = true;
        outsideGroup.add(frostPlat);

        // 5 Giant Sapphire Crystal Monoliths
        for (let sc = 0; sc < 5; sc++) {
            const scAng = (sc / 5) * Math.PI * 2;
            const sMono = new THREE.Mesh(new THREE.ConeGeometry(3.0, 20.0, 6), new THREE.MeshStandardMaterial({
                color: 0x06b6d4, emissive: 0x0284c7, emissiveIntensity: 0.85, roughness: 0.15
            }));
            sMono.position.set(650 + Math.cos(scAng) * 45, 15.0, -350 + Math.sin(scAng) * 45);
            outsideGroup.add(sMono);
        }

        // Frost Giant Stone Effigy at Center
        const giantEffigy = new THREE.Mesh(new THREE.BoxGeometry(10, 18, 8), this.stoneMat);
        giantEffigy.position.set(650, 15.0, -350);
        outsideGroup.add(giantEffigy);

        const frostLight = new THREE.PointLight(0x38bdf8, 4.5, 55.0);
        frostLight.position.set(650, 12.0, -350);
        outsideGroup.add(frostLight);

        this.createStandingBrazier(630, 6.0, -350, 0x06b6d4, 5.5, 38);
        this.createStandingBrazier(670, 6.0, -350, 0x06b6d4, 5.5, 38);
        this.createPathBeacon(650, 6.0, -350, 0x06b6d4, "❄️ FROZEN GLADE OF ASTRAL GIANTS [ELEV +6.0m]", "PERMAFROST MONOLITHS • CELESTIAL SAPPHIRE & BOREAL GOLEM KING", "#a5f3fc");
        this.createFloorSoapstone(650, 6.0, -335, "#06b6d4", "❄️ FROZEN GLADE", "Slumbering astral titan sealed in perennial ice");

        // --------------------------------------------------------------------
        // 5. HIGH IRON FORTRESS - BASTION OF THE LOST LEGION ([700, 14.0, 250])
        // --------------------------------------------------------------------
        const ironPlat = new THREE.Mesh(new THREE.BoxGeometry(150, 4.0, 160), this.darkSteelMat || this.stoneMat);
        ironPlat.position.set(700, 12.0, 250);
        ironPlat.receiveShadow = true;
        outsideGroup.add(ironPlat);

        // Rampart Crenellations
        this.createWall(625, 16.5, 250, 3.0, 5.0, 160);
        this.createWall(775, 16.5, 250, 3.0, 5.0, 160);
        this.createWall(700, 16.5, 170, 150, 5.0, 3.0);
        this.createWall(700, 16.5, 330, 150, 5.0, 3.0);

        // 2 Colossal Siege Ballistas
        [-30, 30].forEach(bxOff => {
            const ballista = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 14), this.wallMat);
            ballista.position.set(700 + bxOff, 16.5, 315);
            outsideGroup.add(ballista);
        });

        // 4 Crimson Legion Battle Standards
        [[-40, 220], [40, 220], [-40, 280], [40, 280]].forEach(([fx, fz]) => {
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 12.0, 8), this.darkSteelMat);
            pole.position.set(700 + fx, 20.0, fz);
            outsideGroup.add(pole);
            const flag = new THREE.Mesh(new THREE.BoxGeometry(0.1, 4.5, 3.0), new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 }));
            flag.position.set(700 + fx, 22.0, fz + 1.5);
            outsideGroup.add(flag);
        });

        const ironLight = new THREE.PointLight(0xf59e0b, 5.0, 60.0);
        ironLight.position.set(700, 18.0, 250);
        outsideGroup.add(ironLight);

        this.createStandingBrazier(675, 14.0, 250, 0xf59e0b, 6.0, 40);
        this.createStandingBrazier(725, 14.0, 250, 0xf59e0b, 6.0, 40);
        this.createPathBeacon(700, 14.0, 250, 0xf59e0b, "🛡️ HIGH IRON FORTRESS - BASTION OF THE LOST LEGION [ELEV +14.0m]", "CRENELLATED RAMPARTS • SIEGE BALLISTAS & LEGION COMMANDER VANE", "#fde68a");
        this.createFloorSoapstone(700, 14.0, 235, "#f59e0b", "🛡️ LOST LEGION BASTION", "The crimson banners of the vanguard flutter undefeated");

        // --------------------------------------------------------------------
        // 6. BLIGHTED MANGROVE & TOXIC STILT VILLAGE ([-550, -6.0, -200])
        // --------------------------------------------------------------------
        const mangroveBog = new THREE.Mesh(new THREE.CylinderGeometry(70, 70, 1.5, 24), this.poisonWaterMat || this.stoneMat);
        mangroveBog.position.set(-550, -6.75, -200);
        outsideGroup.add(mangroveBog);

        // Elevated Timber Boardwalks
        const boardwalk1 = new THREE.Mesh(new THREE.BoxGeometry(90, 0.5, 8.0), this.wallMat);
        boardwalk1.position.set(-550, -4.5, -200);
        outsideGroup.add(boardwalk1);
        const boardwalk2 = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.5, 90), this.wallMat);
        boardwalk2.position.set(-550, -4.5, -200);
        outsideGroup.add(boardwalk2);

        // 3 Hanging Cages on gnarled crane poles
        [-30, 0, 30].forEach((cx, ci) => {
            const crane = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 8.0, 6), this.archtreeBarkMat || this.wallMat);
            crane.position.set(-550 + cx, -1.0, -220);
            crane.rotation.z = (ci - 1) * 0.2;
            outsideGroup.add(crane);
            const cage = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 2.4), this.darkSteelMat);
            cage.position.set(-550 + cx, -3.5, -220);
            outsideGroup.add(cage);
        });

        const toxicLight = new THREE.PointLight(0x22c55e, 4.5, 50.0);
        toxicLight.position.set(-550, -3.0, -200);
        outsideGroup.add(toxicLight);

        this.createStandingBrazier(-530, -6.0, -200, 0x22c55e, 5.0, 35);
        this.createStandingBrazier(-570, -6.0, -200, 0x22c55e, 5.0, 35);
        this.createPathBeacon(-550, -6.0, -200, 0x22c55e, "🌿 BLIGHTED MANGROVE & TOXIC STILT VILLAGE [ELEV -6.0m]", "STILT WALKWAYS • SUSPENDED CAGES & ROT MOTHER", "#86efac");
        this.createFloorSoapstone(-550, -6.0, -185, "#22c55e", "🌿 BLIGHTED MANGROVE", "Poison mist hangs heavy over the waterlogged shanties");

        // --------------------------------------------------------------------
        // 7. THE CRYSTAL GROTTO OF SEATH ([-350, -8.0, 750])
        // --------------------------------------------------------------------
        const grottoFloor = new THREE.Mesh(new THREE.BoxGeometry(140, 2.0, 140), this.cliffRockMat);
        grottoFloor.position.set(-350, -9.0, 750);
        grottoFloor.receiveShadow = true;
        outsideGroup.add(grottoFloor);

        // 8 Luminescent Glintstone Crystal Spires
        for (let gs = 0; gs < 8; gs++) {
            const gAng = (gs / 8) * Math.PI * 2;
            const gSpire = new THREE.Mesh(new THREE.ConeGeometry(2.8, 24.0, 6), new THREE.MeshStandardMaterial({
                color: 0x00f5ff, emissive: 0x0284c7, emissiveIntensity: 0.9, roughness: 0.1, metalness: 0.7
            }));
            gSpire.position.set(-350 + Math.cos(gAng) * 45, 3.0, 750 + Math.sin(gAng) * 45);
            gSpire.rotation.x = Math.sin(gAng) * 0.2;
            gSpire.rotation.z = Math.cos(gAng) * 0.2;
            outsideGroup.add(gSpire);
        }

        // Floating Prismatic Octahedron Core
        const crystalCore = new THREE.Mesh(new THREE.OctahedronGeometry(4.0), new THREE.MeshStandardMaterial({
            color: 0xa5f3fc, emissive: 0x00f5ff, emissiveIntensity: 1.0, roughness: 0.05
        }));
        crystalCore.position.set(-350, 4.0, 750);
        outsideGroup.add(crystalCore);

        const crystalLight = new THREE.PointLight(0x00f5ff, 5.0, 55.0);
        crystalLight.position.set(-350, 2.0, 750);
        outsideGroup.add(crystalLight);

        this.createStandingBrazier(-330, -8.0, 750, 0x00f5ff, 5.5, 38);
        this.createStandingBrazier(-370, -8.0, 750, 0x00f5ff, 5.5, 38);
        this.createPathBeacon(-350, -8.0, 750, 0x00f5ff, "💎 THE CRYSTAL GROTTO OF SEATH [ELEV -8.0m]", "COLOSSAL GLINTSTONE PRISMS • PRISMATIC CORE & SHIMMERING CHASM", "#a5f3fc");
        this.createFloorSoapstone(-350, -8.0, 735, "#00f5ff", "💎 CRYSTAL GROTTO", "Seath's primordial glintstone radiates blinding celestial knowledge");

        // --------------------------------------------------------------------
        // 8. RUINS OF THE SUNKEN SUN PALACE ([400, 3.0, -550])
        // --------------------------------------------------------------------
        const sunPlat = new THREE.Mesh(new THREE.BoxGeometry(130, 2.0, 130), this.stoneMat);
        sunPlat.position.set(400, 2.0, -550);
        sunPlat.receiveShadow = true;
        outsideGroup.add(sunPlat);

        // 8 Golden Fluted Colonnade Pillars
        for (let sp = 0; sp < 8; sp++) {
            const sAng = (sp / 8) * Math.PI * 2;
            const sPillar = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, 16.0, 12), this.goldMat || this.stoneMat);
            sPillar.position.set(400 + Math.cos(sAng) * 42, 10.0, -550 + Math.sin(sAng) * 42);
            outsideGroup.add(sPillar);
        }

        // Shattered Sun Dome Arch
        const sunArch = new THREE.Mesh(new THREE.TorusGeometry(22.0, 2.0, 8, 20, Math.PI), this.goldMat || this.stoneMat);
        sunArch.position.set(400, 18.0, -550);
        outsideGroup.add(sunArch);

        // Ancient Sun Dial Dais
        const sunDial = new THREE.Mesh(new THREE.CylinderGeometry(8.0, 10.0, 1.2, 16), this.goldMat || this.stoneMat);
        sunDial.position.set(400, 3.6, -550);
        outsideGroup.add(sunDial);

        const sunLight = new THREE.PointLight(0xfbbf24, 5.0, 55.0);
        sunLight.position.set(400, 10.0, -550);
        outsideGroup.add(sunLight);

        this.createStandingBrazier(380, 3.0, -550, 0xfbbf24, 5.5, 38);
        this.createStandingBrazier(420, 3.0, -550, 0xfbbf24, 5.5, 38);
        this.createPathBeacon(400, 3.0, -550, 0xfbbf24, "☀️ RUINS OF THE SUNKEN SUN PALACE [ELEV +3.0m]", "GOLDEN COLONNADE • SOLAR DIAL & SUNLIGHT AVATAR OF GWYN", "#fef08a");
        this.createFloorSoapstone(400, 3.0, -535, "#fbbf24", "☀️ SUN PALACE RUINS", "Praise the Sun! The radiant glory of Anor Londo endures");

        // --------------------------------------------------------------------
        // 9. THE ABYSSAL RIFT & VOID MAW ([0, -12.0, 1650])
        // --------------------------------------------------------------------
        const voidCrater = new THREE.Mesh(new THREE.CylinderGeometry(75, 85, 3.0, 24), this.darkSteelMat || this.stoneMat);
        voidCrater.position.set(0, -13.5, 1650);
        voidCrater.receiveShadow = true;
        outsideGroup.add(voidCrater);

        // 6 Floating Shattered Obsidian Monoliths suspended mid-air
        for (let vm = 0; vm < 6; vm++) {
            const vAng = (vm / 6) * Math.PI * 2;
            const vMono = new THREE.Mesh(new THREE.BoxGeometry(4.5, 18.0, 4.5), this.darkSteelMat || this.wallMat);
            vMono.position.set(Math.cos(vAng) * 45, -3.0 + (vm % 3) * 4.0, 1650 + Math.sin(vAng) * 45);
            vMono.rotation.set(0.25 * Math.sin(vAng), vAng, 0.25 * Math.cos(vAng));
            outsideGroup.add(vMono);
        }

        // Primeval Dark Humanity Pulsating Sphere
        const voidSphere = new THREE.Mesh(new THREE.SphereGeometry(6.0, 16, 16), new THREE.MeshStandardMaterial({
            color: 0x090514, emissive: 0x7c3aed, emissiveIntensity: 1.0, roughness: 0.1
        }));
        voidSphere.position.set(0, -5.0, 1650);
        outsideGroup.add(voidSphere);

        const voidLight = new THREE.PointLight(0xa855f7, 5.5, 60.0);
        voidLight.position.set(0, -5.0, 1650);
        outsideGroup.add(voidLight);

        this.createStandingBrazier(-25, -12.0, 1650, 0xa855f7, 6.0, 40);
        this.createStandingBrazier(25, -12.0, 1650, 0xa855f7, 6.0, 40);
        this.createPathBeacon(0, -12.0, 1650, 0xa855f7, "👁️ THE ABYSSAL RIFT & VOID MAW [ELEV -12.0m]", "ANTI-GRAVITY OBSIDIAN SHARDS • PRIMEVAL DARK HUMANITY & VOID MAW", "#e9d5ff");
        this.createFloorSoapstone(0, -12.0, 1635, "#a855f7", "👁️ ABYSSAL RIFT", "The bottomless maw of the primeval abyss whispers across time");

        // --------------------------------------------------------------------
        // 10. THE GRAND NECROPOLIS OF THE FIRST LORDS ([-850, 0.0, 0])
        // --------------------------------------------------------------------
        const necroPlat = new THREE.Mesh(new THREE.BoxGeometry(130, 2.0, 180), this.stoneMat);
        necroPlat.position.set(-850, -1.0, 0);
        necroPlat.receiveShadow = true;
        outsideGroup.add(necroPlat);

        // 6 Colossal Stone Mausoleums
        for (let nm = 0; nm < 3; nm++) {
            const zOff = -50 + nm * 50;
            const mausL = new THREE.Mesh(new THREE.BoxGeometry(18, 12, 22), this.wallMat);
            mausL.position.set(-885, 5.0, zOff);
            outsideGroup.add(mausL);
            const mausR = new THREE.Mesh(new THREE.BoxGeometry(18, 12, 22), this.wallMat);
            mausR.position.set(-815, 5.0, zOff);
            outsideGroup.add(mausR);
        }

        // Central Towering Granite Obelisk (26m tall)
        const obelisk = new THREE.Mesh(new THREE.ConeGeometry(3.5, 26.0, 4), this.stoneMat);
        obelisk.position.set(-850, 12.0, 0);
        outsideGroup.add(obelisk);

        const necroLight = new THREE.PointLight(0xe2e8f0, 4.5, 55.0);
        necroLight.position.set(-850, 6.0, 0);
        outsideGroup.add(necroLight);

        this.createStandingBrazier(-835, 0.0, 0, 0xe2e8f0, 5.5, 38);
        this.createStandingBrazier(-865, 0.0, 0, 0xe2e8f0, 5.5, 38);
        this.createPathBeacon(-850, 0.0, 0, 0xe2e8f0, "⚰️ THE GRAND NECROPOLIS OF THE FIRST LORDS [ELEV 0m]", "MONUMENTAL MAUSOLEUMS • GRANITE OBELISK & FIRST PYRE TOMB WARDENS", "#f1f5f9");
        this.createFloorSoapstone(-850, 0.0, 15, "#e2e8f0", "⚰️ GRAND NECROPOLIS", "Here rest the legendary monarchs of the First Age of Fire");
    }

    buildEightMonumentalOutsideExpeditions(outsideGroup) {
        // ====================================================================
        // 8 BRAND-NEW MONUMENTAL OUTSIDE REALM EXPEDITIONS (V47 EXPANSION)
        // ====================================================================

        // --------------------------------------------------------------------
        // 1. JAGGED PEAK SUMMIT & BAYLE'S DRAGONHEART ROAR ([-780, 22.0, -100])
        // --------------------------------------------------------------------
        const baylePlat = new THREE.Mesh(new THREE.CylinderGeometry(56, 70, 44, 20), this.cliffRockMat);
        baylePlat.position.set(-780, 0, -100);
        outsideGroup.add(baylePlat);

        const bayleCrater = new THREE.Mesh(new THREE.CylinderGeometry(42, 42, 0.5, 24), new THREE.MeshStandardMaterial({
            color: 0x1c0606, roughness: 0.9, metalness: 0.2
        }));
        bayleCrater.position.set(-780, 22.1, -100);
        bayleCrater.receiveShadow = true;
        outsideGroup.add(bayleCrater);

        // Boiling Jagged Magma Core Pool
        const bayleMagma = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 0.3, 20), new THREE.MeshStandardMaterial({
            color: 0xff2200, emissive: 0xdd1100, emissiveIntensity: 1.8, roughness: 0.1
        }));
        bayleMagma.position.set(-780, 22.25, -100);
        outsideGroup.add(bayleMagma);

        // 6 Jagged Basalt Dragon Horn Spires
        for (let j = 0; j < 6; j++) {
            const jang = (j / 6) * Math.PI * 2;
            const spire = new THREE.Mesh(new THREE.ConeGeometry(2.2, 16.0, 5), this.cliffRockMat);
            spire.position.set(-780 + Math.cos(jang) * 32, 28.0, -100 + Math.sin(jang) * 32);
            spire.rotation.z = Math.cos(jang) * 0.35;
            spire.rotation.x = Math.sin(jang) * 0.35;
            outsideGroup.add(spire);
        }

        const bayleLight = new THREE.PointLight(0xff3300, 5.2, 55.0);
        bayleLight.position.set(-780, 26.0, -100);
        outsideGroup.add(bayleLight);

        this.createStandingBrazier(-765, 22.0, -100, 0xff3300, 5.5, 36);
        this.createStandingBrazier(-795, 22.0, -100, 0xff3300, 5.5, 36);
        this.createPathBeacon(-780, 22.0, -100, 0xff3300, "🌋 JAGGED PEAK SUMMIT & BAYLE'S ROAR [ELEV +22.0m]", "BAYLE THE DREAD TYRANT • CRACKED BASALT SPIRES & PRIMORDIAL SCARLET LIGHTNING", "#fca5a5");
        this.createFloorSoapstone(-780, 22.0, -85, "#ff3300", "🌋 JAGGED PEAK SUMMIT", "Curse you, Bayle! The dread tyrant dragon of the fiery summit reigns");

        // --------------------------------------------------------------------
        // 2. FISHING HAMLET COAST OF THE ORPHAN ([-800, -8.0, 180])
        // --------------------------------------------------------------------
        const hamletPlat = new THREE.Mesh(new THREE.CylinderGeometry(60, 68, 16, 24), this.cliffRockMat);
        hamletPlat.position.set(-800, -16, 180);
        outsideGroup.add(hamletPlat);

        // Submerged Shallow Turquoise Coastal Tide Pool
        const tidePool = new THREE.Mesh(new THREE.CylinderGeometry(52, 52, 0.4, 24), new THREE.MeshStandardMaterial({
            color: 0x0891b2, emissive: 0x0e7490, emissiveIntensity: 0.6, roughness: 0.1, transparent: true, opacity: 0.85
        }));
        tidePool.position.set(-800, -7.9, 180);
        outsideGroup.add(tidePool);

        // 5 Weathered Whale Bone Arch Totems
        for (let w = 0; w < 5; w++) {
            const wang = (w / 5) * Math.PI * 2;
            const boneArch = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.7, 6, 16, Math.PI), this.dragonBoneMat || this.stoneMat);
            boneArch.position.set(-800 + Math.cos(wang) * 26, -8.0, 180 + Math.sin(wang) * 26);
            boneArch.rotation.y = wang;
            outsideGroup.add(boneArch);
        }

        // Eldritch Sea Snail Altar Shell
        const seaAltar = new THREE.Mesh(new THREE.DodecahedronGeometry(3.2), new THREE.MeshStandardMaterial({
            color: 0x22d3ee, emissive: 0x0891b2, emissiveIntensity: 0.9, roughness: 0.3
        }));
        seaAltar.position.set(-800, -5.5, 180);
        outsideGroup.add(seaAltar);

        const orphanLight = new THREE.PointLight(0x06b6d4, 4.8, 48.0);
        orphanLight.position.set(-800, -4.0, 180);
        outsideGroup.add(orphanLight);

        this.createStandingBrazier(-785, -8.0, 180, 0x06b6d4, 5.0, 32);
        this.createStandingBrazier(-815, -8.0, 180, 0x06b6d4, 5.0, 32);
        this.createPathBeacon(-800, -8.0, 180, 0x06b6d4, "🌊 FISHING HAMLET COAST OF THE ORPHAN [ELEV -8.0m]", "ORPHAN OF KOS • ASTRAL TIDE SHELF • DEEP SEA FISHMAN PRIESTS", "#a5f3fc");
        this.createFloorSoapstone(-800, -8.0, 195, "#06b6d4", "🌊 FISHING HAMLET COAST", "Byrgenwerth... Byrgenwerth... Blasphemous murderers, blood-crazed fiends");

        // --------------------------------------------------------------------
        // 3. KILN OF THE FIRST FLAME & CINDER ASH DAIS ([-820, 4.0, -280])
        // --------------------------------------------------------------------
        const kilnPlat = new THREE.Mesh(new THREE.CylinderGeometry(58, 65, 8, 24), this.cliffRockMat);
        kilnPlat.position.set(-820, 0, -280);
        outsideGroup.add(kilnPlat);

        const kilnAshFloor = new THREE.Mesh(new THREE.CylinderGeometry(52, 52, 0.4, 24), new THREE.MeshStandardMaterial({
            color: 0x27272a, roughness: 0.95, metalness: 0.2
        }));
        kilnAshFloor.position.set(-820, 4.1, -280);
        kilnAshFloor.receiveShadow = true;
        outsideGroup.add(kilnAshFloor);

        // Colossal Coiled Firelink Sword Monolith in Central Ash Pyre
        const firelinkHilt = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 11.0, 8), new THREE.MeshStandardMaterial({
            color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 1.8, metalness: 0.9, roughness: 0.2
        }));
        firelinkHilt.position.set(-820, 9.5, -280);
        firelinkHilt.rotation.z = 0.25;
        outsideGroup.add(firelinkHilt);

        // 4 Slanted Black Monolith Slabs
        for (let m = 0; m < 4; m++) {
            const mang = (m / 4) * Math.PI * 2;
            const slab = new THREE.Mesh(new THREE.BoxGeometry(4.0, 15.0, 1.8), this.darkSteelMat || this.stoneMat);
            slab.position.set(-820 + Math.cos(mang) * 28, 9.0, -280 + Math.sin(mang) * 28);
            slab.rotation.y = mang;
            slab.rotation.x = 0.22;
            outsideGroup.add(slab);
        }

        const cinderLight = new THREE.PointLight(0xff6600, 5.0, 52.0);
        cinderLight.position.set(-820, 9.0, -280);
        outsideGroup.add(cinderLight);

        this.createStandingBrazier(-805, 4.0, -280, 0xff6600, 5.5, 36);
        this.createStandingBrazier(-835, 4.0, -280, 0xff6600, 5.5, 36);
        this.createPathBeacon(-820, 4.0, -280, 0xff6600, "🔥 KILN OF THE FIRST FLAME & CINDER DAIS [ELEV +4.0m]", "SOUL OF CINDER • COILED SWORD ASH PYRE • BLACK KNIGHT ANNIHILATORS", "#fed7aa");
        this.createFloorSoapstone(-820, 4.0, -265, "#ff6600", "🔥 KILN OF THE FIRST FLAME", "The Fire fades and the Lords go without thrones");

        // --------------------------------------------------------------------
        // 4. ASH LAKE PRIMEVAL STONE DRAGON HOLLOW ([-760, -12.0, -320])
        // --------------------------------------------------------------------
        const ashLakePlat = new THREE.Mesh(new THREE.CylinderGeometry(62, 70, 24, 24), this.cliffRockMat);
        ashLakePlat.position.set(-760, -24, -320);
        outsideGroup.add(ashLakePlat);

        const whiteSandFloor = new THREE.Mesh(new THREE.CylinderGeometry(55, 55, 0.4, 24), new THREE.MeshStandardMaterial({
            color: 0xe2e8f0, roughness: 0.95
        }));
        whiteSandFloor.position.set(-760, -11.9, -320);
        whiteSandFloor.receiveShadow = true;
        outsideGroup.add(whiteSandFloor);

        // 3 Colossal Primeval Archtree Trunks (Surrounding the Dais)
        [[-795, -345], [-725, -345], [-760, -285]].forEach(([atx, atz]) => {
            const archtree = new THREE.Mesh(new THREE.CylinderGeometry(8.0, 10.0, 48.0, 16), this.cliffRockMat);
            archtree.position.set(atx, 8.0, atz);
            outsideGroup.add(archtree);
        });

        // Ancient Dragon Stone Effigy Altar
        const dragonEffigy = new THREE.Mesh(new THREE.ConeGeometry(3.6, 9.0, 6), this.stoneMat);
        dragonEffigy.position.set(-760, -8.0, -320);
        outsideGroup.add(dragonEffigy);

        const dragonLakeLight = new THREE.PointLight(0x94a3b8, 4.5, 48.0);
        dragonLakeLight.position.set(-760, -7.0, -320);
        outsideGroup.add(dragonLakeLight);

        this.createStandingBrazier(-745, -12.0, -320, 0x94a3b8, 5.0, 32);
        this.createStandingBrazier(-775, -12.0, -320, 0x94a3b8, 5.0, 32);
        this.createPathBeacon(-760, -12.0, -320, 0x94a3b8, "🪨 ASH LAKE PRIMEVAL STONE DRAGON HOLLOW [ELEV -12.0m]", "EVERLASTING STONE DRAGON • PRIMEVAL ARCHTREE GROVE • STONE DISCIPLES", "#f1f5f9");
        this.createFloorSoapstone(-760, -12.0, -305, "#94a3b8", "🪨 ASH LAKE HOLLOW", "Descendants of ancient dragons, untouched by death and disparity");

        // --------------------------------------------------------------------
        // 5. GRAND CLOISTER OF LAKE OF ROT & ASTEL VOID MAW ([-840, -15.0, -160])
        // --------------------------------------------------------------------
        const astelPlat = new THREE.Mesh(new THREE.CylinderGeometry(58, 68, 30, 24), this.cliffRockMat);
        astelPlat.position.set(-840, -30, -160);
        outsideGroup.add(astelPlat);

        const voidGrottoFloor = new THREE.Mesh(new THREE.CylinderGeometry(52, 52, 0.4, 24), new THREE.MeshStandardMaterial({
            color: 0x0b0717, roughness: 0.4, metalness: 0.8
        }));
        voidGrottoFloor.position.set(-840, -14.9, -160);
        voidGrottoFloor.receiveShadow = true;
        outsideGroup.add(voidGrottoFloor);

        // Floating Purple Gravity Nebula Core
        const nebulaCore = new THREE.Mesh(new THREE.SphereGeometry(4.8, 16, 16), new THREE.MeshStandardMaterial({
            color: 0x8b5cf6, emissive: 0x6d28d9, emissiveIntensity: 2.2, roughness: 0.1
        }));
        nebulaCore.position.set(-840, -8.0, -160);
        outsideGroup.add(nebulaCore);

        // Orbiting Cosmic Star Dust Ring
        const starRing = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.25, 6, 24), new THREE.MeshStandardMaterial({
            color: 0xc084fc, emissive: 0xa855f7, emissiveIntensity: 1.6
        }));
        starRing.position.set(-840, -8.0, -160);
        starRing.rotation.x = 0.75;
        outsideGroup.add(starRing);

        const astelLight = new THREE.PointLight(0xa855f7, 5.2, 55.0);
        astelLight.position.set(-840, -7.0, -160);
        outsideGroup.add(astelLight);

        this.createStandingBrazier(-825, -15.0, -160, 0xa855f7, 5.5, 34);
        this.createStandingBrazier(-855, -15.0, -160, 0xa855f7, 5.5, 34);
        this.createPathBeacon(-840, -15.0, -160, 0xa855f7, "🌌 GRAND CLOISTER & ASTEL VOID MAW [ELEV -15.0m]", "ASTEL NATURALBORN OF THE VOID • GRAVITY NEBULA CORE • KINDRED OF ROT PESTS", "#e9d5ff");
        this.createFloorSoapstone(-840, -15.0, -145, "#a855f7", "🌌 VOID GROTTO CLOISTER", "A malformed star born in the flightless void that seized their stars");

        // --------------------------------------------------------------------
        // 6. CAINHURST FROZEN ROYAL THRONE ([-790, 18.0, 280])
        // --------------------------------------------------------------------
        const cainPlat = new THREE.Mesh(new THREE.CylinderGeometry(54, 66, 36, 24), this.cliffRockMat);
        cainPlat.position.set(-790, 0, 280);
        outsideGroup.add(cainPlat);

        const snowTerrace = new THREE.Mesh(new THREE.CylinderGeometry(46, 46, 0.4, 24), new THREE.MeshStandardMaterial({
            color: 0xf1f5f9, roughness: 0.75
        }));
        snowTerrace.position.set(-790, 18.1, 280);
        snowTerrace.receiveShadow = true;
        outsideGroup.add(snowTerrace);

        // Grand Gothic Stone Throne of Martyr Logarius
        const martyrThrone = new THREE.Mesh(new THREE.BoxGeometry(4.5, 7.0, 3.5), this.stoneMat);
        martyrThrone.position.set(-790, 21.5, 298);
        outsideGroup.add(martyrThrone);

        // 8 Crown Flying Astral Swords Monoliths
        for (let cs = 0; cs < 8; cs++) {
            const csAng = (cs / 8) * Math.PI * 2;
            const swordMon = new THREE.Mesh(new THREE.ConeGeometry(0.35, 6.0, 4), new THREE.MeshStandardMaterial({
                color: 0x93c5fd, emissive: 0x3b82f6, emissiveIntensity: 1.2, metalness: 0.9, roughness: 0.2
            }));
            swordMon.position.set(-790 + Math.cos(csAng) * 22, 23.0, 280 + Math.sin(csAng) * 22);
            swordMon.rotation.x = Math.PI;
            outsideGroup.add(swordMon);
        }

        const cainLight = new THREE.PointLight(0x60a5fa, 4.6, 50.0);
        cainLight.position.set(-790, 22.0, 280);
        outsideGroup.add(cainLight);

        this.createStandingBrazier(-775, 18.0, 280, 0x60a5fa, 5.0, 34);
        this.createStandingBrazier(-805, 18.0, 280, 0x60a5fa, 5.0, 34);
        this.createPathBeacon(-790, 18.0, 280, 0x60a5fa, "👑 CAINHURST FROZEN ROYAL THRONE [ELEV +18.0m]", "MARTYR LOGARIUS • PERMAFROST BATTLEMENTS • CAINHURST VILEBLOOD GUARDS", "#bfdbfe");
        this.createFloorSoapstone(-790, 18.0, 265, "#60a5fa", "👑 CAINHURST ROYAL THRONE", "Acts of goodness are not always wise, and acts of evil are not always foolish");

        // --------------------------------------------------------------------
        // 7. FOUNTAINHEAD SACRED PALACE WATERWAY ([-810, 8.0, 80])
        // --------------------------------------------------------------------
        const palacePlat = new THREE.Mesh(new THREE.BoxGeometry(72, 16, 72), this.cliffRockMat);
        palacePlat.position.set(-810, 0, 80);
        outsideGroup.add(palacePlat);

        // Reflective Vermilion Water Pool
        const palaceWater = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({
            color: 0x0284c7, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.8
        }));
        palaceWater.rotation.x = -Math.PI / 2;
        palaceWater.position.set(-810, 8.1, 80);
        outsideGroup.add(palaceWater);

        // Vermilion Japanese Torii Gate
        const toriiBeamTop = new THREE.Mesh(new THREE.BoxGeometry(22.0, 1.4, 1.4), new THREE.MeshStandardMaterial({
            color: 0xef4444, roughness: 0.6
        }));
        toriiBeamTop.position.set(-810, 17.5, 80);
        outsideGroup.add(toriiBeamTop);

        [-8, 8].forEach(tx => {
            const toriiCol = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 9.0, 12), new THREE.MeshStandardMaterial({
                color: 0xef4444, roughness: 0.6
            }));
            toriiCol.position.set(-810 + tx, 13.0, 80);
            outsideGroup.add(toriiCol);
        });

        const monkLight = new THREE.PointLight(0xf59e0b, 4.8, 52.0);
        monkLight.position.set(-810, 14.0, 80);
        outsideGroup.add(monkLight);

        this.createStandingBrazier(-795, 8.0, 80, 0xf59e0b, 5.0, 35);
        this.createStandingBrazier(-825, 8.0, 80, 0xf59e0b, 5.0, 35);
        this.createPathBeacon(-810, 8.0, 80, 0xf59e0b, "🏯 FOUNTAINHEAD SACRED WATERWAY [ELEV +8.0m]", "TRUE CORRUPTED MONK • VERMILION TORII GATE • OKAMI PALACE NOBLES", "#fde68a");
        this.createFloorSoapstone(-810, 8.0, 65, "#f59e0b", "🏯 FOUNTAINHEAD PALACE", "The sacred waters of eternal youth flow beneath ancient cherry blossoms");

        // --------------------------------------------------------------------
        // 8. SEN'S FORTRESS SKYWARD IRON GOLEM RAMPART ([-760, 14.0, 380])
        // --------------------------------------------------------------------
        const sensPlat = new THREE.Mesh(new THREE.BoxGeometry(70, 28, 70), this.cliffRockMat);
        sensPlat.position.set(-760, 0, 380);
        outsideGroup.add(sensPlat);

        const ironFloor = new THREE.Mesh(new THREE.BoxGeometry(64, 0.4, 64), new THREE.MeshStandardMaterial({
            color: 0x1f2937, metalness: 0.85, roughness: 0.35
        }));
        ironFloor.position.set(-760, 14.1, 380);
        ironFloor.receiveShadow = true;
        outsideGroup.add(ironFloor);

        // Giant Swinging Pendulum Blade Monument
        const bladeShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 14.0, 8), this.darkSteelMat || this.stoneMat);
        bladeShaft.position.set(-760, 22.0, 380);
        outsideGroup.add(bladeShaft);

        const pendBlade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5.5, 3.2), new THREE.MeshStandardMaterial({
            color: 0x94a3b8, metalness: 0.95, roughness: 0.15
        }));
        pendBlade.position.set(-760, 17.0, 380);
        outsideGroup.add(pendBlade);

        // 4 Fortified Iron Ball Chutes
        for (let ch = 0; ch < 4; ch++) {
            const chAng = (ch / 4) * Math.PI * 2;
            const chute = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.5, 12.0), this.darkSteelMat || this.stoneMat);
            chute.position.set(-760 + Math.cos(chAng) * 26, 15.5, 380 + Math.sin(chAng) * 26);
            chute.rotation.y = chAng;
            outsideGroup.add(chute);
        }

        const sensLight = new THREE.PointLight(0xeab308, 5.0, 52.0);
        sensLight.position.set(-760, 19.0, 380);
        outsideGroup.add(sensLight);

        this.createStandingBrazier(-745, 14.0, 380, 0xeab308, 5.5, 36);
        this.createStandingBrazier(-775, 14.0, 380, 0xeab308, 5.5, 36);
        this.createPathBeacon(-760, 14.0, 380, 0xeab308, "🛡️ SEN'S SKYWARD IRON RAMPART [ELEV +14.0m]", "COLOSSAL IRON GOLEM & TARKUS • PENDULUM BLADE • LIGHTNING MANSERPENTS", "#fef08a");
        this.createFloorSoapstone(-760, 14.0, 365, "#eab308", "🛡️ SEN'S IRON RAMPART", "The deadly house of traps tests those who would reach the City of Gods");
    }

    buildEightLegendaryOutsideExpeditions(outsideGroup) {
        // ====================================================================
        // 8 BRAND-NEW LEGENDARY OUTSIDE REALM EXPEDITIONS (V55 EXPANSION)
        // ====================================================================

        // --------------------------------------------------------------------
        // 1. PAINTED WORLD CHAPEL OF SISTER FRIEDE & BLACKFLAME BELFRY ([-920, 10.0, -260])
        // --------------------------------------------------------------------
        const friedeBase = new THREE.Mesh(new THREE.CylinderGeometry(52, 64, 20, 18), this.cliffRockMat);
        friedeBase.position.set(-920, 0, -260);
        outsideGroup.add(friedeBase);

        // Snow-frosted stone chapel foundation
        const friedeFloor = new THREE.Mesh(new THREE.BoxGeometry(64, 1.2, 54), new THREE.MeshStandardMaterial({
            color: 0x94a3b8, roughness: 0.9, metalness: 0.1
        }));
        friedeFloor.position.set(-920, 10.1, -260);
        friedeFloor.receiveShadow = true;
        outsideGroup.add(friedeFloor);

        // Vaulted Chapel Rafters & Timber Trusses
        for (let r = -20; r <= 20; r += 10) {
            const beamMat = new THREE.MeshStandardMaterial({ color: 0x2b1d14, roughness: 0.85 });
            const leftPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 12, 6), beamMat);
            leftPillar.position.set(-946, 16.0, -260 + r);
            outsideGroup.add(leftPillar);
            const rightPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 12, 6), beamMat);
            rightPillar.position.set(-894, 16.0, -260 + r);
            outsideGroup.add(rightPillar);

            const archBeam = new THREE.Mesh(new THREE.BoxGeometry(54, 0.8, 1.2), beamMat);
            archBeam.position.set(-920, 22.0, -260 + r);
            outsideGroup.add(archBeam);
        }

        // Giant Silver-Bronze Belfry Bell of Ariandel
        const belfryBell = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 4.6, 6.2, 12), new THREE.MeshStandardMaterial({
            color: 0x64748b, roughness: 0.35, metalness: 0.85
        }));
        belfryBell.position.set(-920, 17.5, -276);
        outsideGroup.add(belfryBell);

        // Grand Lordvessel of Ariandel (Frost & Blackflame Embers)
        const lordvessel = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 2.2, 3.2, 16), new THREE.MeshStandardMaterial({
            color: 0x1e1b4b, roughness: 0.4, metalness: 0.7
        }));
        lordvessel.position.set(-920, 11.6, -260);
        outsideGroup.add(lordvessel);

        const friedeColdLight = new THREE.PointLight(0x38bdf8, 4.5, 45.0);
        friedeColdLight.position.set(-920, 14.5, -260);
        outsideGroup.add(friedeColdLight);

        this.createStandingBrazier(-906, 10.0, -260, 0x38bdf8, 4.5, 32);
        this.createStandingBrazier(-934, 10.0, -260, 0x1e1b4b, 4.5, 32);
        this.createPathBeacon(-920, 10.0, -260, 0x38bdf8, "❄️ PAINTED WORLD CHAPEL OF FRIEDE [ELEV +10.0m]", "SISTER FRIEDE & FATHER ARIANDEL • BLACKFLAME BELFRY • CORVIAN KNIGHTS", "#e0f2fe");
        this.createFloorSoapstone(-920, 10.0, -248, "#38bdf8", "❄️ CHAPEL OF ARIANDEL", "Leave us be, Ashen One. Return whence thou cam'st.");

        // --------------------------------------------------------------------
        // 2. ARCHDRAGON PEAK STORM SOVEREIGN COLOSSEUM ([-940, 24.0, -80])
        // --------------------------------------------------------------------
        const stormBase = new THREE.Mesh(new THREE.CylinderGeometry(58, 76, 48, 20), this.cliffRockMat);
        stormBase.position.set(-940, 0, -80);
        outsideGroup.add(stormBase);

        const stormArena = new THREE.Mesh(new THREE.CylinderGeometry(46, 46, 1.2, 24), new THREE.MeshStandardMaterial({
            color: 0x475569, roughness: 0.8, metalness: 0.25
        }));
        stormArena.position.set(-940, 24.1, -80);
        stormArena.receiveShadow = true;
        outsideGroup.add(stormArena);

        // 8 Weathered Dragon-Scale Lightning Rod Spires
        for (let sp = 0; sp < 8; sp++) {
            const spAng = (sp / 8) * Math.PI * 2;
            const spire = new THREE.Mesh(new THREE.ConeGeometry(2.4, 18.0, 6), new THREE.MeshStandardMaterial({
                color: 0x334155, roughness: 0.7, metalness: 0.4
            }));
            spire.position.set(-940 + Math.cos(spAng) * 38, 33.0, -80 + Math.sin(spAng) * 38);
            outsideGroup.add(spire);

            const rodTop = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), new THREE.MeshStandardMaterial({
                color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 2.2
            }));
            rodTop.position.set(-940 + Math.cos(spAng) * 38, 42.0, -80 + Math.sin(spAng) * 38);
            outsideGroup.add(rodTop);
        }

        // Colossal Great Belfry Dragon Bell
        const stormBell = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 5.5, 7.5, 14), new THREE.MeshStandardMaterial({
            color: 0xd97706, roughness: 0.3, metalness: 0.85
        }));
        stormBell.position.set(-940, 31.0, -112);
        outsideGroup.add(stormBell);

        const stormLight = new THREE.PointLight(0xfbbf24, 6.0, 60.0);
        stormLight.position.set(-940, 28.0, -80);
        outsideGroup.add(stormLight);

        this.createStandingBrazier(-924, 24.0, -80, 0xfbbf24, 6.0, 38);
        this.createStandingBrazier(-956, 24.0, -80, 0xfbbf24, 6.0, 38);
        this.createPathBeacon(-940, 24.0, -80, 0xfbbf24, "⚡ ARCHDRAGON STORM COLOSSEUM [ELEV +24.0m]", "THE NAMELESS KING & KING OF STORMS • SUNLIGHT LIGHTNING • DRAGONKIN GUARDS", "#fef3c7");
        this.createFloorSoapstone(-940, 24.0, -68, "#fbbf24", "⚡ STORM COLOSSEUM", "Touch not the bell. The ancient dragon god of war broods amidst storm clouds.");

        // --------------------------------------------------------------------
        // 3. ASHINA SILVERGRASS BATTLEFIELD UNDER THUNDER ([-930, 6.0, 120])
        // --------------------------------------------------------------------
        const ashinaBase = new THREE.Mesh(new THREE.CylinderGeometry(54, 66, 12, 18), this.cliffRockMat);
        ashinaBase.position.set(-930, 0, 120);
        outsideGroup.add(ashinaBase);

        const ashinaSoil = new THREE.Mesh(new THREE.CylinderGeometry(44, 44, 1.0, 22), new THREE.MeshStandardMaterial({
            color: 0x1e293b, roughness: 0.95, metalness: 0.05
        }));
        ashinaSoil.position.set(-930, 6.1, 120);
        ashinaSoil.receiveShadow = true;
        outsideGroup.add(ashinaSoil);

        // Dense Pampas Silvergrass Clumps
        const grassMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 });
        for (let g = 0; g < 40; g++) {
            const gx = -930 + (Math.sin(g * 3.7) * 32);
            const gz = 120 + (Math.cos(g * 2.3) * 32);
            const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 3.2, 5), grassMat);
            stalk.position.set(gx, 7.6, gz);
            stalk.rotation.z = Math.sin(g) * 0.2;
            stalk.rotation.x = Math.cos(g) * 0.2;
            outsideGroup.add(stalk);
        }

        // Grand Vermilion Torii Gate Arch
        const toriiMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.65 });
        const leftTorii = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 14, 8), toriiMat);
        leftTorii.position.set(-942, 13.0, 142);
        outsideGroup.add(leftTorii);
        const rightTorii = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 14, 8), toriiMat);
        rightTorii.position.set(-918, 13.0, 142);
        outsideGroup.add(rightTorii);

        const toriiCross = new THREE.Mesh(new THREE.BoxGeometry(32, 1.4, 2.2), toriiMat);
        toriiCross.position.set(-930, 19.5, 142);
        outsideGroup.add(toriiCross);

        const ashinaLight = new THREE.PointLight(0xe2e8f0, 4.5, 48.0);
        ashinaLight.position.set(-930, 10.0, 120);
        outsideGroup.add(ashinaLight);

        this.createStandingBrazier(-915, 6.0, 120, 0x991b1b, 4.5, 34);
        this.createStandingBrazier(-945, 6.0, 120, 0x991b1b, 4.5, 34);
        this.createPathBeacon(-930, 6.0, 120, 0xe2e8f0, "🌾 ASHINA SILVERGRASS FIELD [ELEV +6.0m]", "SWORD SAINT ISSHIN • TOMOE LIGHTNING • ASHINA RED-GUARD ARQUEBUSIERS", "#f8fafc");
        this.createFloorSoapstone(-930, 6.0, 106, "#e2e8f0", "🌾 SILVERGRASS FIELD", "Hesitation is defeat. Face the Sword Saint of Ashina.");

        // --------------------------------------------------------------------
        // 4. HUNTER'S DREAM RADIANT LUNAR FLOWERBED ([-960, -2.0, 260])
        // --------------------------------------------------------------------
        const dreamPlat = new THREE.Mesh(new THREE.CylinderGeometry(52, 60, 8, 18), this.cliffRockMat);
        dreamPlat.position.set(-960, -6.0, 260);
        outsideGroup.add(dreamPlat);

        const flowerBed = new THREE.Mesh(new THREE.CylinderGeometry(42, 42, 0.8, 22), new THREE.MeshStandardMaterial({
            color: 0x0f172a, roughness: 0.9
        }));
        flowerBed.position.set(-960, -1.9, 260);
        flowerBed.receiveShadow = true;
        outsideGroup.add(flowerBed);

        // Luminous White Dream Flower Sprigs
        const whiteFlowerMat = new THREE.MeshStandardMaterial({
            color: 0xffffff, emissive: 0xe0e7ff, emissiveIntensity: 0.85, roughness: 0.3
        });
        for (let fl = 0; fl < 36; fl++) {
            const fx = -960 + Math.sin(fl * 4.3) * 30;
            const fz = 260 + Math.cos(fl * 2.7) * 30;
            const flower = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6, 6), whiteFlowerMat);
            flower.position.set(fx, -1.5, fz);
            outsideGroup.add(flower);
        }

        // Twisted Weeping Ancient Dream Tree
        const dreamTreeTrunk = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.6, 16, 8), new THREE.MeshStandardMaterial({
            color: 0x27272a, roughness: 0.95
        }));
        dreamTreeTrunk.position.set(-960, 6.0, 282);
        outsideGroup.add(dreamTreeTrunk);

        const dreamTreeFoliage = new THREE.Mesh(new THREE.DodecahedronGeometry(8.5), new THREE.MeshStandardMaterial({
            color: 0x4c0519, roughness: 0.8, emissive: 0x881337, emissiveIntensity: 0.4
        }));
        dreamTreeFoliage.position.set(-960, 16.0, 282);
        outsideGroup.add(dreamTreeFoliage);

        const dreamMoonLight = new THREE.PointLight(0xf472b6, 4.0, 44.0);
        dreamMoonLight.position.set(-960, 5.0, 260);
        outsideGroup.add(dreamMoonLight);

        this.createStandingBrazier(-945, -2.0, 260, 0xf472b6, 4.0, 30);
        this.createStandingBrazier(-975, -2.0, 260, 0xf472b6, 4.0, 30);
        this.createPathBeacon(-960, -2.0, 260, 0xf472b6, "🌙 HUNTER'S DREAM LUNAR FLOWERBED [ELEV -2.0m]", "GEHRMAN FIRST HUNTER & MOON PRESENCE • BURIAL BLADE • CHURCH DOCTORS", "#fce7f3");
        this.createFloorSoapstone(-960, -2.0, 246, "#f472b6", "🌙 LUNAR FLOWERBED", "Dear Hunter, the night will soon end. Accept your fate or defy the dream.");

        // --------------------------------------------------------------------
        // 5. INSIDE THE ERDTREE THRONE OF RADAGON & ELDEN BEAST ([-980, 16.0, -180])
        // --------------------------------------------------------------------
        const erdtreeBase = new THREE.Mesh(new THREE.CylinderGeometry(56, 70, 32, 20), this.cliffRockMat);
        erdtreeBase.position.set(-980, 0, -180);
        outsideGroup.add(erdtreeBase);

        // Golden Crystalline Throne Floor
        const goldenGlassFloor = new THREE.Mesh(new THREE.CylinderGeometry(46, 46, 1.2, 24), new THREE.MeshStandardMaterial({
            color: 0xfacc15, emissive: 0xca8a04, emissiveIntensity: 0.9, roughness: 0.15, metalness: 0.85
        }));
        goldenGlassFloor.position.set(-980, 16.1, -180);
        goldenGlassFloor.receiveShadow = true;
        outsideGroup.add(goldenGlassFloor);

        // Concentric Golden Elden Ring Rune Arc
        const eldenRuneMat = new THREE.MeshBasicMaterial({ color: 0xffe066, side: THREE.DoubleSide });
        const runeRing = new THREE.Mesh(new THREE.RingGeometry(14, 18, 32), eldenRuneMat);
        runeRing.rotation.x = -Math.PI / 2;
        runeRing.position.set(-980, 16.25, -180);
        outsideGroup.add(runeRing);

        // 4 Golden Spectral Erdtree Spires
        for (let tr = 0; tr < 4; tr++) {
            const trAng = (tr / 4) * Math.PI * 2;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 4.8, 36, 8), new THREE.MeshStandardMaterial({
                color: 0xca8a04, emissive: 0xa16207, emissiveIntensity: 1.1, roughness: 0.4
            }));
            trunk.position.set(-980 + Math.cos(trAng) * 34, 34.0, -180 + Math.sin(trAng) * 34);
            outsideGroup.add(trunk);
        }

        const erdtreeLight = new THREE.PointLight(0xfacc15, 6.5, 64.0);
        erdtreeLight.position.set(-980, 22.0, -180);
        outsideGroup.add(erdtreeLight);

        this.createStandingBrazier(-962, 16.0, -180, 0xfacc15, 6.0, 38);
        this.createStandingBrazier(-998, 16.0, -180, 0xfacc15, 6.0, 38);
        this.createPathBeacon(-980, 16.0, -180, 0xfacc15, "✨ INSIDE THE ERDTREE: RADAGON THRONE [ELEV +16.0m]", "RADAGON OF THE GOLDEN ORDER & ELDEN BEAST • HAMMER OF RADAGON • TREE SENTINELS", "#fef08a");
        this.createFloorSoapstone(-980, 16.0, -168, "#facc15", "✨ ELDEN THRONE", "Thou who would claim the title of Elden Lord: face the shattered god.");

        // --------------------------------------------------------------------
        // 6. LEYNDELL ROYAL BEDCHAMBER TERRACE ([-990, 12.0, 360])
        // --------------------------------------------------------------------
        const godfreyBase = new THREE.Mesh(new THREE.CylinderGeometry(54, 68, 24, 18), this.cliffRockMat);
        godfreyBase.position.set(-990, 0, 360);
        outsideGroup.add(godfreyBase);

        const marbleTerrace = new THREE.Mesh(new THREE.BoxGeometry(60, 1.2, 50), new THREE.MeshStandardMaterial({
            color: 0xd97706, roughness: 0.6, metalness: 0.4
        }));
        marbleTerrace.position.set(-990, 12.1, 360);
        marbleTerrace.receiveShadow = true;
        outsideGroup.add(marbleTerrace);

        // Lion Crested Royal Throne of the First Lord
        const throneBack = new THREE.Mesh(new THREE.BoxGeometry(7.0, 12.0, 2.5), new THREE.MeshStandardMaterial({
            color: 0x78350f, roughness: 0.7, metalness: 0.3
        }));
        throneBack.position.set(-990, 18.0, 380);
        outsideGroup.add(throneBack);

        const lionRelief = new THREE.Mesh(new THREE.SphereGeometry(2.4, 12, 12), new THREE.MeshStandardMaterial({
            color: 0xf59e0b, emissive: 0xb45309, emissiveIntensity: 1.2
        }));
        lionRelief.position.set(-990, 22.0, 378);
        outsideGroup.add(lionRelief);

        // Royal Balustrades along Front & Sides
        for (let col = -24; col <= 24; col += 6) {
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 3.6, 8), new THREE.MeshStandardMaterial({
                color: 0xb45309, roughness: 0.5
            }));
            pillar.position.set(-990 + col, 14.0, 336);
            outsideGroup.add(pillar);
        }

        const godfreyLight = new THREE.PointLight(0xf97316, 5.0, 52.0);
        godfreyLight.position.set(-990, 17.0, 360);
        outsideGroup.add(godfreyLight);

        this.createStandingBrazier(-972, 12.0, 360, 0xf97316, 5.0, 34);
        this.createStandingBrazier(-1008, 12.0, 360, 0xf97316, 5.0, 34);
        this.createPathBeacon(-990, 12.0, 360, 0xf97316, "🦁 LEYNDELL BEDCHAMBER TERRACE [ELEV +12.0m]", "GODFREY FIRST ELDEN LORD & HOARAH LOUX • SEROSH • BADLANDS BERSERKERS", "#ffedd5");
        this.createFloorSoapstone(-990, 12.0, 346, "#f97316", "🦁 ROYAL TERRACE", "Long march yielded to this sanctuary. Brave Tarnished, thy strength befits a crown.");

        // --------------------------------------------------------------------
        // 7. CASTLE ENSIS MOONGAZING DAIS ([-1010, 8.0, -380])
        // --------------------------------------------------------------------
        const ensisBase = new THREE.Mesh(new THREE.CylinderGeometry(52, 66, 16, 18), this.cliffRockMat);
        ensisBase.position.set(-1010, 0, -380);
        outsideGroup.add(ensisBase);

        const ensisFloor = new THREE.Mesh(new THREE.CylinderGeometry(42, 42, 1.0, 24), new THREE.MeshStandardMaterial({
            color: 0x1e3a8a, roughness: 0.4, metalness: 0.6
        }));
        ensisFloor.position.set(-1010, 8.1, -380);
        ensisFloor.receiveShadow = true;
        outsideGroup.add(ensisFloor);

        // Twin Moon Floating Orbs (Cold Azure Moon & Blazing Scarlet Flame Moon)
        const azureMoon = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 16), new THREE.MeshStandardMaterial({
            color: 0x60a5fa, emissive: 0x3b82f6, emissiveIntensity: 2.2, roughness: 0.2
        }));
        azureMoon.position.set(-1018, 18.0, -380);
        outsideGroup.add(azureMoon);

        const flameMoon = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 16), new THREE.MeshStandardMaterial({
            color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 2.2, roughness: 0.2
        }));
        flameMoon.position.set(-1002, 18.0, -380);
        outsideGroup.add(flameMoon);

        // Carian Glintstone Obelisks
        for (let ob = 0; ob < 6; ob++) {
            const obAng = (ob / 6) * Math.PI * 2;
            const obelisk = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.2, 10.0, 6), new THREE.MeshStandardMaterial({
                color: 0x1d4ed8, roughness: 0.3, metalness: 0.7
            }));
            obelisk.position.set(-1010 + Math.cos(obAng) * 32, 13.0, -380 + Math.sin(obAng) * 32);
            outsideGroup.add(obelisk);
        }

        const ensisLight = new THREE.PointLight(0x60a5fa, 4.8, 50.0);
        ensisLight.position.set(-1010, 14.0, -380);
        outsideGroup.add(ensisLight);

        this.createStandingBrazier(-995, 8.0, -380, 0x60a5fa, 5.0, 32);
        this.createStandingBrazier(-1025, 8.0, -380, 0xf97316, 5.0, 32);
        this.createPathBeacon(-1010, 8.0, -380, 0x60a5fa, "🌓 CASTLE ENSIS TWIN MOON DAIS [ELEV +8.0m]", "RELLANA TWIN MOON KNIGHT • TWIN MOON BLADES • FIRE KNIGHT QUEELIGNS", "#dbeafe");
        this.createFloorSoapstone(-1010, 8.0, -368, "#60a5fa", "🌓 TWIN MOON DAIS", "Where Carian sorcery embraced Messmer's golden flame.");

        // --------------------------------------------------------------------
        // 8. SHADOW REALM SCADUTREE BASE & SUNFLOWER BASIN ([-1020, -10.0, 480])
        // --------------------------------------------------------------------
        const scaduBase = new THREE.Mesh(new THREE.CylinderGeometry(56, 68, 14, 20), this.cliffRockMat);
        scaduBase.position.set(-1020, -17.0, 480);
        outsideGroup.add(scaduBase);

        // Sunken Briar Basin & Shallow Golden Miasma Water
        const scaduBasin = new THREE.Mesh(new THREE.CylinderGeometry(46, 46, 0.8, 22), new THREE.MeshStandardMaterial({
            color: 0x1c1917, roughness: 0.95
        }));
        scaduBasin.position.set(-1020, -9.9, 480);
        scaduBasin.receiveShadow = true;
        outsideGroup.add(scaduBasin);

        // Golden Liquid Pool in Center
        const scaduPool = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 0.2, 20), new THREE.MeshStandardMaterial({
            color: 0xeab308, emissive: 0xca8a04, emissiveIntensity: 1.4, roughness: 0.1
        }));
        scaduPool.position.set(-1020, -9.75, 480);
        outsideGroup.add(scaduPool);

        // 6 Colossal Thorny Scadutree Briar Arches
        for (let ba = 0; ba < 6; ba++) {
            const bAng = (ba / 6) * Math.PI * 2;
            const briar = new THREE.Mesh(new THREE.TorusGeometry(8.0, 0.9, 8, 16, Math.PI), new THREE.MeshStandardMaterial({
                color: 0x292524, roughness: 0.9
            }));
            briar.position.set(-1020 + Math.cos(bAng) * 32, -4.0, 480 + Math.sin(bAng) * 32);
            briar.rotation.y = bAng;
            outsideGroup.add(briar);
        }

        // Giant Golden Blighted Sunflower Model Statue in Basin
        const flowerCenter = new THREE.Mesh(new THREE.SphereGeometry(3.5, 14, 14), new THREE.MeshStandardMaterial({
            color: 0xca8a04, emissive: 0xa16207, emissiveIntensity: 1.8, roughness: 0.3
        }));
        flowerCenter.position.set(-1020, -2.0, 480);
        outsideGroup.add(flowerCenter);

        const scaduLight = new THREE.PointLight(0xeab308, 5.0, 50.0);
        scaduLight.position.set(-1020, 2.0, 480);
        outsideGroup.add(scaduLight);

        this.createStandingBrazier(-1004, -10.0, 480, 0xeab308, 5.0, 32);
        this.createStandingBrazier(-1036, -10.0, 480, 0xeab308, 5.0, 32);
        this.createPathBeacon(-1020, -10.0, 480, 0xeab308, "🌻 SCADUTREE AVATAR BASIN [ELEV -10.0m]", "SCADUTREE AVATAR • BLIGHTED GOLDEN SUNFLOWER • HORNSENT INQUISITORS", "#fef9c3");
        this.createFloorSoapstone(-1020, -10.0, 466, "#eab308", "🌻 SUNFLOWER BASIN", "The Scadutree wept golden tears for the neglected saint.");
    }

    buildSerpentSanctum() {
        const sanctumGroup = new THREE.Group();

        // 1. Grand Serpent Gate Arch & Twin 6-Meter Colossal Cobra Statues (z = -2252, x in [-36, 36])
        this.createColossalCobraStatue(-36.0, 0, -2252, Math.PI / 4);
        this.createColossalCobraStatue(36.0, 0, -2252, -Math.PI / 4);

        // Archway Columns flanking doorway
        this.createPillar(-28.0, -2250, 14);
        this.createPillar(28.0, -2250, 14);

        // Wall sconces with atmospheric serpentine flames
        this.createTorch(-28.0, 6.5, -2249, { intensity: 2.2, radius: 20, color: 0x1e824c });
        this.createTorch(28.0, 6.5, -2249, { intensity: 2.2, radius: 20, color: 0x1e824c });

        // 2. Descending Stone Staircase (z: -2250 to -2430, x: -40 to 40, y: 0 to -3.5 - 180m long!)
        const stairSteps = 24;
        for (let s = 0; s < stairSteps; s++) {
            const sz = -2250 - (s / stairSteps) * 180.0;
            const sy = - (s / stairSteps) * 3.5;
            const step = new THREE.Mesh(new THREE.BoxGeometry(80, 0.35, 7.8), this.serpentStoneMat);
            step.position.set(0, sy, sz);
            step.receiveShadow = true;
            sanctumGroup.add(step);
        }

        // Side balustrades for entrance stairs
        this.createWall(-40.5, 0, -2340, 2.0, 6.0, 182);
        this.createWall(40.5, 0, -2340, 2.0, 6.0, 182);

        // 3. Sunken Serpent Courtyard Floor Slab (z: -2430 to -4050, x: -120 to 120, y = -3.5) - 3x Lengthened 1,620m x 240m Plaza
        const courtyardFloorGeo = new THREE.PlaneGeometry(240, 1620);
        const courtyardFloor = new THREE.Mesh(courtyardFloorGeo, this.serpentStoneMat);
        courtyardFloor.rotation.x = -Math.PI / 2;
        courtyardFloor.position.set(0, -3.5, -3240);
        courtyardFloor.receiveShadow = true;
        sanctumGroup.add(courtyardFloor);

        // Perimeter Walls for Sunken Courtyard (Anchored y: -7.0 to 18.0, seamless corner seals)
        this.createWall(-120, 5.0, -3240, 6, 22, 1620); // West Wall
        this.createWall(120, 5.0, -3240, 6, 22, 1620);  // East Wall
        // South retaining wall segments around stairs
        this.createWall(-82, 5.0, -2428, 76, 22, 6);
        this.createWall(82, 5.0, -2428, 76, 22, 6);

        // 4. Toxic Swamp / Poison Marsh Pool at Center of Sunken Courtyard
        const poolGeo = new THREE.CylinderGeometry(100, 100, 0.3, 24);
        const poolMesh = new THREE.Mesh(poolGeo, this.poisonWaterMat);
        poolMesh.position.set(0, -3.42, -3240);
        sanctumGroup.add(poolMesh);

        // Poisonous light aura
        const poisonLight = new THREE.PointLight(0x10ff66, 4.5, 95);
        poisonLight.position.set(0, -2.5, -3240);
        sanctumGroup.add(poisonLight);

        // 5. Four Stone Serpent Braziers with Emerald Flames in Sunken Courtyard
        [[-85, -2835], [85, -2835], [-85, -3645], [85, -3645]].forEach(([bx, bz]) => {
            this.createStandingBrazier(bx, -3.5, bz, 0x10ff66, 5.5, 38);
        });

        // 6. Eight Petrified Warriors Frozen in Dynamic Combat Poses
        const petrifiedCoords = [
            [-40, -2835, 0, 0],
            [44, -2925, 1.2, 1],
            [-60, -3240, -0.8, 2],
            [60, -3285, 2.4, 3],
            [-32, -3555, 0.4, 0],
            [36, -3555, -1.4, 1],
            [-72, -3105, 1.8, 2],
            [72, -3150, -2.2, 3]
        ];
        petrifiedCoords.forEach(([px, pz, pang, ppose]) => {
            if (this.scene && window.game && window.game.characters) {
                window.game.characters.createPetrifiedWarrior(px, pz, pang, -3.5, ppose);
                this.colliders.push(new THREE.Box3(
                    new THREE.Vector3(px - 1.2, -3.5, pz - 1.2),
                    new THREE.Vector3(px + 1.2, 0.5, pz + 1.2)
                ));
            }
        });

        // 7. Descending Stairs to Inner Sanctum (z: -4050 to -4275, x: -40 to 40, y: -3.5 to -6.0 - 225m long!)
        for (let s = 0; s < 24; s++) {
            const sz = -4050 - (s / 24) * 225.0;
            const sy = -3.5 - (s / 24) * 2.5;
            const step = new THREE.Mesh(new THREE.BoxGeometry(80, 0.35, 9.6), this.serpentStoneMat);
            step.position.set(0, sy, sz);
            step.receiveShadow = true;
            sanctumGroup.add(step);
        }
        // Seamless Flanking Enclosing Walls beside inner stairs
        this.createWall(-82, 5.0, -4162.5, 76, 24, 225);
        this.createWall(82, 5.0, -4162.5, 76, 24, 225);

        // 8. Gorgon's Inner Sanctum Floor Slab (z: -4275 to -6750, x: -150 to 150, y = -6.0) - 3x Lengthened 2,475m x 300m Sanctum
        const innerFloorGeo = new THREE.PlaneGeometry(300, 2475);
        const innerFloor = new THREE.Mesh(innerFloorGeo, this.serpentStoneMat);
        innerFloor.rotation.x = -Math.PI / 2;
        innerFloor.position.set(0, -6.0, -5512.5);
        innerFloor.receiveShadow = true;
        sanctumGroup.add(innerFloor);

        // Monumental Vaulted High Ceiling for Gorgon's Inner Sanctum (y = 26.0m, completely clear above camera)
        const sanctumCeiling = new THREE.Mesh(new THREE.BoxGeometry(320, 3.0, 2500), this.serpentStoneMat);
        sanctumCeiling.position.set(0, 26.0, -5512.5);
        sanctumCeiling.receiveShadow = true;
        sanctumGroup.add(sanctumCeiling);

        // Monumental Serpentine Temple Portal Arch over stairs at z = -4050
        const portalArchitrave = new THREE.Mesh(new THREE.BoxGeometry(84, 3.5, 5), this.serpentStoneMat);
        portalArchitrave.position.set(0, 14.5, -4050);
        portalArchitrave.receiveShadow = true;
        sanctumGroup.add(portalArchitrave);

        const portalCornice = new THREE.Mesh(new THREE.BoxGeometry(88, 1.0, 5.5), this.serpentJadeMat);
        portalCornice.position.set(0, 16.5, -4050);
        sanctumGroup.add(portalCornice);

        // Flanking Portal Entrance Columns supporting the high entablature at x = -42 and 42
        this.createSerpentPillar(-42.0, -4050, -3.5, 18.0);
        this.createSerpentPillar(42.0, -4050, -3.5, 18.0);

        // Perimeter Enclosing Walls for Inner Sanctum (Anchored y: -8.0 to 26.0, 6m thick)
        this.createWall(-150, 6.0, -5512.5, 6, 32, 2475); // West Wall
        this.createWall(150, 6.0, -5512.5, 6, 32, 2475);  // East Wall
        this.createWall(0, 6.0, -6753.0, 306, 32, 6);    // Far North Wall

        // 9. Colonnade of Medusa (8 Colossal Columns wrapped in Stone Snakes)
        const colonnadeCoords = [
            [-70, -4650], [70, -4650],
            [-100, -5250], [100, -5250],
            [-70, -5850], [70, -5850],
            [-36, -6450], [36, -6450]
        ];
        colonnadeCoords.forEach(([cx, cz]) => {
            this.createSerpentPillar(cx, cz, -6.0, 22);
        });

        // 10. The Great Altar of the Gorgon (z = -6690, x = 0, y = -6.0)
        const altarDais = new THREE.Mesh(new THREE.BoxGeometry(40, 1.8, 20), this.serpentJadeMat);
        altarDais.position.set(0, -5.1, -6690);
        altarDais.receiveShadow = true;
        sanctumGroup.add(altarDais);

        // Giant Carved Gorgon Relief Head above Altar
        const reliefHead = new THREE.Mesh(new THREE.BoxGeometry(12.0, 14.0, 2.4), this.serpentStoneMat);
        reliefHead.position.set(0, 3.0, -6748.0);
        sanctumGroup.add(reliefHead);

        // Glowing Emerald Eyes on Wall Relief
        const leftReliefEye = new THREE.Mesh(new THREE.SphereGeometry(1.0, 8, 8), new THREE.MeshStandardMaterial({ color: 0x1e824c, emissive: 0x1e824c, emissiveIntensity: 0.9 }));
        leftReliefEye.position.set(-2.8, 4.5, -6746.5);
        sanctumGroup.add(leftReliefEye);
        const rightReliefEye = new THREE.Mesh(new THREE.SphereGeometry(1.0, 8, 8), new THREE.MeshStandardMaterial({ color: 0x1e824c, emissive: 0x1e824c, emissiveIntensity: 0.9 }));
        rightReliefEye.position.set(2.8, 4.5, -6746.5);
        sanctumGroup.add(rightReliefEye);

        const altarGlow = new THREE.PointLight(0x1e824c, 4.5, 45);
        altarGlow.position.set(0, 3.0, -6690);
        sanctumGroup.add(altarGlow);

        // Sacrificial Basin with Glowing Venom
        const basin = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 3.2, 2.0, 12), this.serpentJadeMat);
        basin.position.set(0, -4.0, -6650);
        sanctumGroup.add(basin);
        const basinLiquid = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.0, 0.15, 12), this.poisonWaterMat);
        basinLiquid.position.set(0, -3.0, -6650);
        sanctumGroup.add(basinLiquid);

        // 11. Emerald Serpent Bonfire (z = -4500, x = 0, y = -6.0)
        this.createSerpentBonfire(0, -6.0, -4500);

        this.scene.add(sanctumGroup);
    }

    createColossalCobraStatue(x, y, z, rotY) {
        const cobraGroup = new THREE.Group();
        cobraGroup.position.set(x, y, z);
        cobraGroup.rotation.y = rotY;

        const stone = this.serpentJadeMat || this.stoneMat;

        // Base Pedestal
        const base = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, 1.4, 8), stone);
        base.position.y = 0.7;
        base.castShadow = true;
        base.receiveShadow = true;
        cobraGroup.add(base);

        // Coiled Tail Base
        const coil = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.45, 8, 16), stone);
        coil.rotation.x = Math.PI / 2;
        coil.position.y = 1.6;
        cobraGroup.add(coil);

        // Rising Serpentine Neck (Height 4.5m)
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, 4.2, 8), stone);
        neck.position.set(0, 3.8, 0.2);
        neck.rotation.x = 0.15;
        cobraGroup.add(neck);

        // Flared Cobra Hood
        const hood = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 0.35), stone);
        hood.position.set(0, 5.2, 0.3);
        cobraGroup.add(hood);

        // Sculpted Snake Skull & Gaping Jaw
        const skull = new THREE.Mesh(new THREE.ConeGeometry(0.7, 1.6, 4), stone);
        skull.position.set(0, 5.5, 0.9);
        skull.rotation.x = -Math.PI / 2.2;
        skull.scale.set(1.4, 0.65, 1.0);
        cobraGroup.add(skull);

        // Glowing Emerald Eyes (Atmospheric verdigris glow)
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1e824c, emissive: 0x1e824c, emissiveIntensity: 0.7 });
        const lEye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), eyeMat);
        lEye.position.set(-0.55, 5.65, 1.25);
        cobraGroup.add(lEye);
        const rEye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), eyeMat);
        rEye.position.set(0.55, 5.65, 1.25);
        cobraGroup.add(rEye);

        const eyeLight = new THREE.PointLight(0x1e824c, 1.2, 8);
        eyeLight.position.set(0, 5.7, 1.6);
        cobraGroup.add(eyeLight);

        // Collision box for statue
        this.colliders.push(new THREE.Box3(
            new THREE.Vector3(x - 1.8, y, z - 1.8),
            new THREE.Vector3(x + 1.8, y + 6.0, z + 1.8)
        ));

        this.scene.add(cobraGroup);
    }

    createSerpentPillar(x, z, y = 0, height = 8) {
        const pillarGroup = new THREE.Group();
        pillarGroup.position.set(x, y, z);

        const stone = this.serpentStoneMat;

        // Base plinth
        const base = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.0, 2.0), stone);
        base.position.y = 0.5;
        base.castShadow = true;
        base.receiveShadow = true;
        pillarGroup.add(base);

        // Fluted Column Shaft
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, height, 12), stone);
        shaft.position.y = height / 2;
        shaft.castShadow = true;
        shaft.receiveShadow = true;
        pillarGroup.add(shaft);

        // Coiled Serpent wrapped around Column
        for (let s = 0; s < 4; s++) {
            const coilRing = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.18, 6, 12), this.serpentJadeMat);
            coilRing.rotation.x = Math.PI / 2 + 0.25;
            coilRing.position.y = 1.8 + s * 2.2;
            pillarGroup.add(coilRing);
        }

        // Capital top
        const capital = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 2.2), stone);
        capital.position.y = height + 0.4;
        pillarGroup.add(capital);

        this.colliders.push(new THREE.Box3(
            new THREE.Vector3(x - 1.0, y, z - 1.0),
            new THREE.Vector3(x + 1.0, y + height, z + 1.0)
        ));

        this.scene.add(pillarGroup);
    }

    createSerpentBonfire(x, y, z) {
        const bonfireGroup = new THREE.Group();
        bonfireGroup.position.set(x, y, z);

        // Ash & Serpent Bones Mound
        const ashGeo = new THREE.ConeGeometry(2.2, 0.7, 12);
        const ashMesh = new THREE.Mesh(ashGeo, this.ashMat || this.stoneMat);
        ashMesh.position.y = 0.35;
        bonfireGroup.add(ashMesh);

        // Serpent Coiled Sword
        const sword = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 2.6, 6), this.ironMat);
        sword.position.set(0, 1.25, 0);
        sword.rotation.z = -0.15;
        bonfireGroup.add(sword);

        // Emerald Flame
        const flameCore = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55), new THREE.MeshBasicMaterial({ color: 0x10ff66 }));
        flameCore.position.set(0, 1.1, 0);
        bonfireGroup.add(flameCore);

        const flameLight = new THREE.PointLight(0x10ff66, 3.5, 18);
        flameLight.position.set(0, 1.5, 0);
        bonfireGroup.add(flameLight);

        // Register as interactable bonfire
        this.interactables.push({
            type: 'bonfire',
            position: new THREE.Vector3(x, y, z),
            radius: 3.5,
            prompt: '✨ [ E ] HEAL TO FULL & TELEPORT (SERPENT SANCTUM)'
        });

        this.scene.add(bonfireGroup);
    }

    buildMapDetailEnhancements() {
        // 2. Gothic Perched Gargoyles on Ramparts Overlooking the Citadel
        const gargoyleCoords = [
            [15.4, 8.2, 35, -Math.PI / 2],
            [15.4, 8.2, 65, -Math.PI / 2],
            [24.6, 9.4, 45, Math.PI / 2],
            [24.6, 9.4, 75, Math.PI / 2]
        ];
        gargoyleCoords.forEach(([gx, gy, gz, grot]) => {
            const gGroup = new THREE.Group();
            gGroup.position.set(gx, gy, gz);
            gGroup.rotation.y = grot;

            // Gargoyle Torso
            const gTorso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.8, 0.45), this.stoneMat);
            gGroup.add(gTorso);
            // Horned Head
            const gHead = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.35), this.stoneMat);
            gHead.position.set(0, 0.55, 0.15);
            gGroup.add(gHead);
            // Stone Wings
            const rWing = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.4), this.stoneMat);
            rWing.position.set(0.6, 0.4, -0.2);
            rWing.rotation.y = 0.5;
            gGroup.add(rWing);
            const lWing = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.4), this.stoneMat);
            lWing.position.set(-0.6, 0.4, -0.2);
            lWing.rotation.y = -0.5;
            gGroup.add(lWing);
            // Glowing Red Eyes
            const rEye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), new THREE.MeshBasicMaterial({ color: 0xff2200 }));
            rEye.position.set(0.12, 0.6, 0.32);
            gGroup.add(rEye);
            const lEye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), new THREE.MeshBasicMaterial({ color: 0xff2200 }));
            lEye.position.set(-0.12, 0.6, 0.32);
            gGroup.add(lEye);

            this.scene.add(gGroup);
        });

        // 3. Crumbled Masonry & Battlefield Rubble Blocks scattered naturally
        const rubbleCoords = [
            [-8, 0, -22], [7, 0, -18],
            [-15, 0, 15], [14, 0, 18],
            [-22, 0, -8], [21, 0, -6],
            [-4, 0, 48], [4, 0, 72]
        ];
        rubbleCoords.forEach(([rx, ry, rz]) => {
            const block = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.45, 0.7), this.stoneMat);
            block.position.set(rx, ry + 0.22, rz);
            block.rotation.set(0.1, Math.random() * Math.PI, 0.05);
            block.castShadow = true;
            block.receiveShadow = true;
            this.scene.add(block);
        });
    }

    buildDistantFortress() {
        const distantGroup = new THREE.Group();

        // 1. Distant Mountain Range Silhouettes (circling the horizon)
        const mountainMat = new THREE.MeshStandardMaterial({
            color: 0x1c242e,
            roughness: 0.95,
            metalness: 0.05,
            flatShading: false
        });

        // Organic Distant Mountain Ranges (20 radial segments with smooth shading, scaled out to 1200m–1680m radius)
        const mountainCoords = [
            [-1320, 180, -1140, 360, 480], [-780, 220, -1620, 390, 540], [0, 250, -1680, 450, 600],
            [780, 220, -1620, 390, 540], [1320, 180, -1140, 360, 480],
            [-1380, 120, 240, 320, 380], [1380, 120, 240, 320, 400],
            [-1200, 130, 1080, 350, 460], [1200, 130, 1080, 350, 460],
            [-660, 160, 1500, 390, 520], [0, 220, 1650, 480, 620], [660, 160, 1500, 390, 500]
        ];

        mountainCoords.forEach(([mx, my, mz, mw, mh]) => {
            const mGeo = new THREE.ConeGeometry(mw, mh, 20);
            const mMesh = new THREE.Mesh(mGeo, mountainMat);
            mMesh.position.set(mx, my, mz);
            mMesh.rotation.y = Math.random() * Math.PI;
            distantGroup.add(mMesh);
        });

        // 2. Towering Distant Gothic Spires & Cathedral Watchtowers (Anor Londo Skyline)
        const spireTowerMat = new THREE.MeshStandardMaterial({
            color: 0x222a36,
            roughness: 0.9,
            metalness: 0.1
        });
        const spireRoofMat = new THREE.MeshStandardMaterial({
            color: 0x161d26,
            roughness: 0.8,
            metalness: 0.3
        });

        const distantSpires = [
            [-95, 0, -165, 7, 55], [-55, 0, -175, 6, 68], [65, 0, -175, 6.5, 62], [105, 0, -165, 7.5, 52],
            [-135, -5, 125, 8, 50], [135, -5, 125, 8, 50],
            [-85, 0, 215, 9, 78], [85, 0, 215, 9, 78]
        ];

        distantSpires.forEach(([tx, ty, tz, tr, th]) => {
            // Tower shaft firmly grounded into bedrock
            const tBody = new THREE.Mesh(new THREE.CylinderGeometry(tr * 0.9, tr, th, 10), spireTowerMat);
            tBody.position.set(tx, ty + th / 2 - 10, tz);
            distantGroup.add(tBody);

            // Conical spire roof
            const tRoof = new THREE.Mesh(new THREE.ConeGeometry(tr * 1.05, th * 0.45, 10), spireRoofMat);
            tRoof.position.set(tx, ty + th - 10 + (th * 0.45) / 2, tz);
            distantGroup.add(tRoof);
        });

        // 3. Colossal Distant Arched Viaduct (Valley Aqueduct of Lordran)
        const viaductGroup = new THREE.Group();
        viaductGroup.position.set(130, 8, 45);
        viaductGroup.rotation.y = -0.35;
        const viaductSpan = new THREE.Mesh(new THREE.BoxGeometry(12, 5, 160), spireTowerMat);
        viaductSpan.position.y = 20;
        viaductGroup.add(viaductSpan);

        for (let vz = -70; vz <= 70; vz += 28) {
            const vPillar = new THREE.Mesh(new THREE.BoxGeometry(10, 38, 10), spireTowerMat);
            vPillar.position.set(0, 0, vz);
            viaductGroup.add(vPillar);
        }
        distantGroup.add(viaductGroup);

        // 4. Colossal Lordran Chasm Floor & Citadel Bedrock Foundations
        const chasmMat = new THREE.MeshStandardMaterial({
            color: 0x14181a, // Dark wet mountain bedrock
            roughness: 0.95,
            metalness: 0.08,
            flatShading: true
        });

        // Vast valley chasm floor beneath the citadel (eliminates all empty sky gaps)
        const chasmFloorGeo = new THREE.PlaneGeometry(400, 400, 12, 12);
        const cPos = chasmFloorGeo.attributes.position;
        for (let i = 0; i < cPos.count; i++) {
            const vx = cPos.getX(i);
            const vy = cPos.getY(i);
            const bump = Math.sin(vx * 0.04) * Math.cos(vy * 0.04) * 4.2;
            cPos.setZ(i, bump);
        }
        chasmFloorGeo.computeVertexNormals();
        const chasmFloor = new THREE.Mesh(chasmFloorGeo, chasmMat);
        chasmFloor.rotation.x = -Math.PI / 2;
        chasmFloor.position.set(0, -22.0, 60);
        chasmFloor.receiveShadow = true;
        distantGroup.add(chasmFloor);

        // Low valley atmospheric fog layer
        const chasmMistGeo = new THREE.PlaneGeometry(320, 320);
        const chasmMistMat = new THREE.MeshBasicMaterial({
            color: 0x223242,
            transparent: true,
            opacity: 0.42,
            depthWrite: false
        });
        const chasmMist = new THREE.Mesh(chasmMistGeo, chasmMistMat);
        chasmMist.rotation.x = -Math.PI / 2;
        chasmMist.position.set(0, -12.0, 60);
        distantGroup.add(chasmMist);

        // Colossal foundation cliff under the Starting Courtyard (x=[-30, 30], z=[-30, 30])
        const courtyardCliff = new THREE.Mesh(new THREE.BoxGeometry(62, 20, 62), this.wallMat);
        courtyardCliff.position.set(0, -12.0, 0);
        courtyardCliff.receiveShadow = true;
        distantGroup.add(courtyardCliff);

        // Massive foundation walls under East Ramparts (x=20, z=[22, 270]: 248m length!)
        const rampartFoundation = new THREE.Mesh(new THREE.BoxGeometry(10.0, 30, 248), this.wallMat);
        rampartFoundation.position.set(20, -12.0, 146);
        rampartFoundation.receiveShadow = true;
        distantGroup.add(rampartFoundation);

        // Massive foundation walls under West Catacombs (x=-20, z=[22, 270]: 248m length!)
        const cryptFoundation = new THREE.Mesh(new THREE.BoxGeometry(10.0, 22, 248), this.wallMat);
        cryptFoundation.position.set(-20, -16.0, 146);
        cryptFoundation.receiveShadow = true;
        distantGroup.add(cryptFoundation);

        // Colossal foundation valley bedrock slab under the ENTIRE citadel & viaduct (x=[-180, 180], z=[-50, 390])
        const canyonBedrock = new THREE.Mesh(new THREE.BoxGeometry(380, 30, 460), this.cliffRockMat || this.wallMat);
        canyonBedrock.position.set(0, -32.0, 170);
        canyonBedrock.receiveShadow = true;
        distantGroup.add(canyonBedrock);

        // Colossal stone bridge piers & buttresses beneath the Royal Bridge (x=0, z=[28, 96])
        for (let bz = 45; bz <= 265; bz += 35) {
            const bridgePier = new THREE.Mesh(new THREE.BoxGeometry(10, 22, 10), this.wallMat);
            bridgePier.position.set(0, -11.0, bz);
            bridgePier.receiveShadow = true;
            distantGroup.add(bridgePier);

            // Flying buttress arch connecting bridge to East Ramparts
            const buttressE = new THREE.Mesh(new THREE.BoxGeometry(7, 3.5, 4), this.wallMat);
            buttressE.position.set(11, -3.5, bz);
            buttressE.rotation.z = -0.22;
            distantGroup.add(buttressE);

            // Flying buttress arch connecting bridge to West Catacombs
            const buttressW = new THREE.Mesh(new THREE.BoxGeometry(7, 3.5, 4), this.wallMat);
            buttressW.position.set(-11, -3.5, bz);
            buttressW.rotation.z = 0.22;
            distantGroup.add(buttressW);
        }

        // Colossal foundation bastion beneath the Boss Arena (x=[-18, 18], z=[95, 168])
        const arenaBastion = new THREE.Mesh(new THREE.BoxGeometry(44, 24, 114), this.wallMat);
        arenaBastion.position.set(0, -13.0, 330);
        arenaBastion.receiveShadow = true;
        distantGroup.add(arenaBastion);

        // 5. Glossy Courtyard Rain Puddles (specular reflections on flagstones)
        const puddleMat = new THREE.MeshStandardMaterial({
            color: 0x16202c,
            roughness: 0.08,
            metalness: 0.45,
            transparent: true,
            opacity: 0.82
        });

        const puddleCoords = [
            [-5.5, 0.012, 7.5, 2.4], [6.2, 0.012, -4.5, 3.1],
            [-14.0, 0.012, 14.0, 3.8], [15.5, 0.012, 12.0, 3.2],
            [-7.0, 0.012, -16.0, 2.8], [8.5, 0.012, -18.0, 2.6]
        ];
        puddleCoords.forEach(([px, py, pz, pr]) => {
            const pGeo = new THREE.CircleGeometry(pr, 14);
            const pMesh = new THREE.Mesh(pGeo, puddleMat);
            pMesh.position.set(px, py, pz);
            pMesh.rotation.x = -Math.PI / 2;
            pMesh.receiveShadow = true;
            distantGroup.add(pMesh);
        });

        // 6. Ambient Occlusion Contact Shadow Decals (grounding pillars & bonfire)
        const aoShadowMat = new THREE.MeshBasicMaterial({
            color: 0x06080a,
            transparent: true,
            opacity: 0.62,
            depthWrite: false
        });

        const aoPositions = [
            [0, 0.008, 0, 3.8], // Bonfire base
            [-12, 0.008, -12, 2.2], [12, 0.008, -12, 2.2],
            [-12, 0.008, 12, 2.2], [12, 0.008, 12, 2.2],
            [-20, 0.008, -4, 2.2], [20, 0.008, -4, 2.2],
            [-20, 0.008, 20, 2.2], [20, 0.008, 20, 2.2],
            [-3.6, 0.008, 0, 1.8], [3.6, 0.008, 0, 1.8] // Braziers
        ];
        aoPositions.forEach(([ax, ay, az, ar]) => {
            const aoGeo = new THREE.CircleGeometry(ar, 14);
            const aoMesh = new THREE.Mesh(aoGeo, aoShadowMat);
            aoMesh.position.set(ax, ay, az);
            aoMesh.rotation.x = -Math.PI / 2;
            distantGroup.add(aoMesh);
        });

        this.scene.add(distantGroup);
    }

    createWall(x, y, z, w, h, d) {
        const geo = new THREE.BoxGeometry(w, h, d);
        
        const horizDim = Math.max(w, d);
        // Monumental Gothic Ashlar masonry scaling (1.5m x 0.8m heavy stone blocks)
        const repeatX = Math.max(1, Math.round(horizDim / 6.0));
        const repeatY = Math.max(1, Math.round(h / 6.0));
        const cacheKey = `${repeatX}_${repeatY}`;

        if (!this._wallMatCache) this._wallMatCache = {};
        if (!this._wallMatCache[cacheKey]) {
            const mat = this.wallMat.clone();
            mat.map = mat.map.clone();
            mat.bumpMap = mat.bumpMap.clone();
            if (mat.roughnessMap) mat.roughnessMap = mat.roughnessMap.clone();
            mat.map.repeat.set(repeatX, repeatY);
            mat.bumpMap.repeat.set(repeatX, repeatY);
            if (mat.roughnessMap) mat.roughnessMap.repeat.set(repeatX, repeatY);
            this._wallMatCache[cacheKey] = mat;
        }
        const mat = this._wallMatCache[cacheKey];

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        // Collider box
        this.colliders.push(new THREE.Box3().setFromObject(mesh));
    }

    createPathBeacon(x, y, z, colorHex, title, desc, titleColor, addSoapstone = true, enableTeleport = false) {
        const beaconGroup = new THREE.Group();

        // 1. Lordran Wrought-Iron Brazier & Ember Core
        const ironDish = new THREE.Mesh(
            new THREE.CylinderGeometry(0.55, 0.35, 0.28, 8),
            this.darkSteelMat || this.stoneMat
        );
        ironDish.position.y = 1.65;
        beaconGroup.add(ironDish);

        const flameCore = new THREE.Mesh(
            new THREE.SphereGeometry(0.24, 8, 8),
            new THREE.MeshStandardMaterial({
                color: colorHex,
                emissive: colorHex,
                emissiveIntensity: 0.8,
                roughness: 0.4
            })
        );
        flameCore.position.y = 1.82;
        beaconGroup.add(flameCore);

        // Warm beacon flame light (atmospheric, contained radius)
        const beaconLight = new THREE.PointLight(colorHex, 1.4, 9);
        beaconLight.position.set(0, 1.9, 0);
        beaconGroup.add(beaconLight);

        // Slender Stone Pedestal Base
        const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.58, 1.5, 8), this.stoneMat);
        pedestal.position.y = 0.75;
        pedestal.receiveShadow = true;
        beaconGroup.add(pedestal);

        beaconGroup.position.set(x, y, z);
        this.scene.add(beaconGroup);

        // 2. Authentic Floor Soapstone Guidance Rune lying flat on cobblestone
        if (addSoapstone) {
            this.createFloorSoapstone(x, y, z + 2.5, titleColor || ('#' + colorHex.toString(16).padStart(6, '0')), title, desc);
        }

        // 3. Optional Interactive Teleport Portal (Disabled by default to avoid accidental warp)
        if (enableTeleport) {
            let targetPos = null;
            let promptText = `[ E ] TELEPORT: ${title}`;
            if (title.includes('CATACOMBS') || title.includes('SUNKEN') || title.includes('UNDERGROUND')) {
                targetPos = new THREE.Vector3(-20, -4.92, 32);
                promptText = `💀 [ E ] TELEPORT TO UNDERGROUND CATACOMBS (-5m)`;
            } else if (title.includes('RAMPARTS') || title.includes('HIGH')) {
                targetPos = new THREE.Vector3(20, 6.0, 32);
                promptText = `👑 [ E ] TELEPORT TO HIGH RAMPARTS (+6m)`;
            } else if (title.includes('SURFACE') || title.includes('COURTYARD')) {
                targetPos = new THREE.Vector3(0, 0, 16);
                promptText = `☀️ [ E ] RETURN TO SURFACE COURTYARD (0m)`;
            } else if (title.includes('FOG') || title.includes('BOSS') || title.includes('WARP') || title.includes('DESCEND')) {
                targetPos = new THREE.Vector3(0, 0, 4135);
                promptText = `⚔️ [ E ] TELEPORT TO BOSS FOG GATE (3600m)`;
            } else if (title.includes('BRIDGE') || title.includes('ROYAL')) {
                targetPos = new THREE.Vector3(0, 0, 4135);
                promptText = `⚔️ [ E ] TELEPORT TO ROYAL BRIDGE FOG GATE (0m)`;
            }

            if (targetPos) {
                this.interactables.push({
                    type: 'route_portal',
                    position: new THREE.Vector3(x, y, z),
                    radius: 2.2, // Tight radius: player must walk right up to it, never triggers from walkway
                    prompt: promptText,
                    targetPos: targetPos,
                    label: title
                });
            }
        }

        this.particles.push({
            mesh: flameCore,
            seed: Math.random() * 20
        });
    }

    createFloorSoapstone(x, y, z, colorHex, title, desc) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 140;
        const ctx = canvas.getContext('2d');

        // Dark gothic rune slate backing
        ctx.fillStyle = 'rgba(8, 7, 6, 0.78)';
        ctx.fillRect(0, 0, 512, 140);

        // Ornate rune borders
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 4;
        ctx.strokeRect(6, 6, 500, 128);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(12, 12, 488, 116);

        // Corner studs
        [[12, 12], [500, 12], [12, 128], [500, 128]].forEach(([cx, cy]) => {
            ctx.fillStyle = colorHex;
            ctx.beginPath();
            ctx.arc(cx, cy, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Title
        ctx.font = 'bold 30px "Cinzel", serif, Times, sans-serif';
        ctx.fillStyle = colorHex;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = colorHex;
        ctx.shadowBlur = 10;
        ctx.fillText(title, 256, 48);

        // Subtitle
        ctx.font = '19px "EB Garamond", serif, Georgia, sans-serif';
        ctx.fillStyle = '#ded8cc';
        ctx.shadowBlur = 4;
        ctx.fillText(desc || '', 256, 96);

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.MeshBasicMaterial({
            map: tex,
            transparent: true,
            opacity: 0.92,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.0), mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(x, y + 0.03, z);
        this.scene.add(mesh);
        return mesh;
    }

    createSpotlight(x, y, z, targetX, targetY, targetZ, colorHex = 0xffaa44, intensity = 3.5, distance = 45, angle = 0.55) {
        const spot = new THREE.SpotLight(colorHex, intensity, distance, angle, 0.5, 1.5);
        spot.position.set(x, y, z);
        const targetObj = new THREE.Object3D();
        targetObj.position.set(x + targetX, y + targetY, z + targetZ);
        this.scene.add(targetObj);
        spot.target = targetObj;
        this.scene.add(spot);
        return spot;
    }

    createGoldenBrazier(x, y, z, intensity = 2.2) {
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
            seed: Math.random() * 15
        });
    }

    createGoldenTorch(x, y, z) {
        const sconce = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6), this.ironMat);
        sconce.position.set(x, y, z);
        this.scene.add(sconce);

        const fMesh = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.2),
            new THREE.MeshBasicMaterial({ color: 0xffcc44 })
        );
        fMesh.position.set(x, y + 0.7, z);
        this.scene.add(fMesh);

        this.particles.push({
            mesh: fMesh,
            seed: Math.random() * 10
        });
    }

    createTealBrazier(x, y, z) {
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

    spawnMagicRuneSparks(pos) {
        const count = 22;
        for (let i = 0; i < count; i++) {
            const isGlint = (i % 2 === 0);
            const mesh = new THREE.Mesh(
                new THREE.OctahedronGeometry(isGlint ? 0.075 : 0.05),
                new THREE.MeshBasicMaterial({ color: isGlint ? 0x00ffff : 0x70b5ff })
            );
            this.scene.add(mesh);
            mesh.position.copy(pos);
            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 7.5,
                Math.random() * 5.5 + 1.2,
                (Math.random() - 0.5) * 7.5
            );
            this.sparkParticles.push({ mesh, vel, life: 0.45, maxLife: 0.45 });
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

        // Outer vibrant flame body (natural teardrop proportion)
        const flameGeo = new THREE.ConeGeometry(0.085, 0.26, 8);
        const flameMat = new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: colorHex,
            emissiveIntensity: 2.5,
            roughness: 0.2
        });
        const flameMesh = new THREE.Mesh(flameGeo, flameMat);
        flameMesh.position.y = 0.16;
        flameGroup.add(flameMesh);

        flameGroup.visible = isLit;
        torchGroup.add(flameGroup);

        torchGroup.position.set(x, y, z);
        this.scene.add(torchGroup);

        const particleEntry = {
            mesh: flameGroup,
            coreMesh,
            flameMesh,
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

        brazierGroup.position.set(x, y, z);
        this.scene.add(brazierGroup);

        this.particles.push({
            mesh: flame,
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
    // THE SANCTUARY TELEPORT DAIS & HEALING BASE
    // Replaces basic bonfire with full healing fountain & fast-travel teleport dais
    // ----------------------------------------------------
    buildBonfire() {
        const bonfireGroup = new THREE.Group();

        // 1. Radiant Teleport & Healing Glyph Ring lying flat on floor
        const runeGeo = new THREE.RingGeometry(0.8, 3.4, 32);
        const runeMat = new THREE.MeshBasicMaterial({
            color: 0x00ffcc,
            transparent: true,
            opacity: 0.75,
            side: THREE.DoubleSide
        });
        const runeMesh = new THREE.Mesh(runeGeo, runeMat);
        runeMesh.rotation.x = -Math.PI / 2;
        runeMesh.position.y = 0.05;
        bonfireGroup.add(runeMesh);

        // 2. Surrounding Carved Basalt Dais Border
        const ringGeo = new THREE.TorusGeometry(3.5, 0.35, 8, 28);
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0x1a1614,
            roughness: 0.85,
            metalness: 0.2
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.12;
        ring.receiveShadow = true;
        bonfireGroup.add(ring);

        // 3. Central Ash Mound & Sacred Relic Core
        const ashGeo = new THREE.ConeGeometry(2.0, 0.7, 16);
        const ashMat = new THREE.MeshStandardMaterial({
            color: 0x141212,
            roughness: 0.98,
            metalness: 0.05
        });
        const ashMound = new THREE.Mesh(ashGeo, ashMat);
        ashMound.position.y = 0.35;
        ashMound.receiveShadow = true;
        bonfireGroup.add(ashMound);

        // 4. The Coiled Sword (Dark Souls signature twisted blade)
        const swordGroup = new THREE.Group();

        const bladeGeo = new THREE.CylinderGeometry(0.08, 0.16, 2.8, 8);
        const bladeMat = new THREE.MeshStandardMaterial({
            color: 0x4a4440,
            roughness: 0.4,
            metalness: 0.85,
            emissive: 0x003322,
            emissiveIntensity: 0.6
        });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.y = 1.4;
        swordGroup.add(blade);

        const guardGeo = new THREE.BoxGeometry(0.8, 0.12, 0.2);
        const guardMat = new THREE.MeshStandardMaterial({ color: 0x332a22, metalness: 0.9, roughness: 0.3 });
        const guard = new THREE.Mesh(guardGeo, guardMat);
        guard.position.y = 2.8;
        swordGroup.add(guard);

        const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8), this.woodMat);
        hilt.position.y = 3.1;
        swordGroup.add(hilt);

        const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), guardMat);
        pommel.position.y = 3.45;
        swordGroup.add(pommel);

        swordGroup.rotation.z = 0.12;
        swordGroup.rotation.x = -0.08;
        bonfireGroup.add(swordGroup);

        // 5. Vertical Radiant Starlight Healing Pillar
        const beamGeo = new THREE.CylinderGeometry(0.12, 0.12, 5.5, 12);
        const beamMat = new THREE.MeshBasicMaterial({
            color: 0x00ffcc,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.y = 2.75;
        bonfireGroup.add(beam);

        // 6. Dynamic Celestial Flame & Embers
        const flameCore = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.48),
            new THREE.MeshBasicMaterial({ color: 0x00ffcc })
        );
        flameCore.position.y = 1.1;
        bonfireGroup.add(flameCore);
        this.bonfireCore = flameCore;

        // Healing Sanctuary Point Lights (Celestial Emerald & Warm Gold)
        this.bonfireLight = new THREE.PointLight(0x00ffcc, 3.4, 25, 1.4);
        this.bonfireLight.position.set(0, 1.8, 0);
        this.bonfireLight.castShadow = false;
        bonfireGroup.add(this.bonfireLight);

        const warmLight = new THREE.PointLight(0xffd700, 2.2, 16);
        warmLight.position.set(0, 1.2, 0);
        bonfireGroup.add(warmLight);

        // Position at center of Courtyard
        bonfireGroup.position.set(0, 0, 0);
        this.scene.add(bonfireGroup);
        this.bonfireGroup = bonfireGroup;

        // Register interactable
        this.interactables.push({
            type: 'base_heal_teleport',
            position: new THREE.Vector3(0, 0, 0),
            radius: 4.8,
            prompt: '✨ [ E ] SANCTUARY TELEPORT & HEALING BASE (FULL HP & FAST TRAVEL)',
            label: 'SANCTUARY TELEPORT BASE'
        });
    }

    // ----------------------------------------------------
    // UNDEAD & SOULSBORNE MERCHANTS (30 BESPOKE 3D NPCS)
    // ----------------------------------------------------
    buildFallenSpaceshipHouse() {
        if (this._spaceshipBuilt) return;
        this._spaceshipBuilt = true;

        const shipGroup = new THREE.Group();
        this.shipGroup = shipGroup;
        shipGroup.name = 'spaceship_house_group';
        const cx = -75;
        const cy = 0;
        const cz = 40;
        shipGroup.position.set(cx, cy, cz);

        // Luminous Sci-Fi Materials for Dreadnought Starship
        const hullMat = new THREE.MeshStandardMaterial({ color: 0x5a6878, metalness: 0.65, roughness: 0.35 });
        const armorPlatesMat = new THREE.MeshStandardMaterial({ color: 0x48586c, metalness: 0.70, roughness: 0.30 });
        const canopyGlassMat = new THREE.MeshStandardMaterial({ color: 0x38d8ff, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.75 });
        const engineGlowMat = new THREE.MeshBasicMaterial({ color: 0x33ffff });
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x66ffff });
        const goldTrimMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
        const warningStripesMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x48586c, metalness: 0.40, roughness: 0.30, emissive: 0x14202c, emissiveIntensity: 0.25 });

        // 1. Impact Crater Scorched Basin (Bazaar perimeter)
        const craterRimGeo = new THREE.RingGeometry(44, 62, 32);
        const craterMat = new THREE.MeshStandardMaterial({ color: 0x302a24, roughness: 0.85 });
        const craterRim = new THREE.Mesh(craterRimGeo, craterMat);
        craterRim.rotation.x = -Math.PI / 2;
        craterRim.position.y = 0.01;
        shipGroup.add(craterRim);

        // Crater burning embers
        for (let i = 0; i < 28; i++) {
            const ang = (i / 28) * Math.PI * 2;
            const er = 46 + Math.random() * 14;
            const ember = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.3), new THREE.MeshBasicMaterial({ color: 0xff4400 }));
            ember.position.set(Math.cos(ang) * er, 0.2, Math.sin(ang) * er);
            shipGroup.add(ember);
        }

        // 2. Interior Trading Deck Floor (Spans 76m along X, 48m along Z, y = 0.03)
        const deckGeo = new THREE.PlaneGeometry(76, 48);
        const deckFloor = new THREE.Mesh(deckGeo, floorMat);
        deckFloor.rotation.x = -Math.PI / 2;
        deckFloor.position.set(0, 0.03, 0);
        deckFloor.receiveShadow = true;
        shipGroup.add(deckFloor);

        // Deck running hazard stripes
        [-22, 22].forEach(stripZ => {
            const stripeGeo = new THREE.PlaneGeometry(72, 1.0);
            const stripe = new THREE.Mesh(stripeGeo, warningStripesMat);
            stripe.rotation.x = -Math.PI / 2;
            stripe.position.set(0, 0.035, stripZ);
            shipGroup.add(stripe);
        });

        // 3. Titanium Hull Superstructure (Spans x: [-36, 36], z: [-23, 23], height: 16m)
        const fuselageGeo = new THREE.BoxGeometry(74, 16, 46);
        const fuselage = new THREE.Mesh(fuselageGeo, hullMat);
        fuselage.position.set(0, 8.0, 0);
        fuselage.receiveShadow = true;
        shipGroup.add(fuselage);

        // Angled Armor Plating on Hull Exterior (Beveled Shoulders)
        [-22, 22].forEach(sideZ => {
            const wedgeGeo = new THREE.CylinderGeometry(2, 12, 48, 4, 1, false, Math.PI * 0.25, Math.PI * 0.5);
            const wedge = new THREE.Mesh(wedgeGeo, armorPlatesMat);
            wedge.rotation.z = Math.PI / 2;
            wedge.position.set(0, 7.0, sideZ);
            shipGroup.add(wedge);
        });

        // Swept Combat Wings (Streamlined and neatly bounded outside courtyard)
        [-22, 22].forEach(wingZ => {
            const wingGeo = new THREE.BoxGeometry(18, 1.4, 8);
            const wing = new THREE.Mesh(wingGeo, armorPlatesMat);
            wing.position.set(-8, 3.5, wingZ);
            wing.rotation.x = (wingZ > 0 ? 0.25 : -0.25);
            wing.rotation.y = (wingZ > 0 ? -0.15 : 0.15);
            shipGroup.add(wing);

            // Wing Solar Panels
            const solarGeo = new THREE.PlaneGeometry(16, 6);
            const solarMat = new THREE.MeshStandardMaterial({ color: 0x0a1428, metalness: 0.9, roughness: 0.1 });
            const solar = new THREE.Mesh(solarGeo, solarMat);
            solar.rotation.x = (wingZ > 0 ? -Math.PI / 2 + 0.25 : -Math.PI / 2 - 0.25);
            solar.position.set(-8, 4.3, wingZ);
            shipGroup.add(solar);
        });

        // 4. Twin Colossal Hyperdrive Thruster Engines (Rear West End: x = -35)
        [-10, 10].forEach(engZ => {
            const engNacelle = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.2, 10, 16), armorPlatesMat);
            engNacelle.rotation.z = Math.PI / 2;
            engNacelle.position.set(-36, 5.5, engZ);
            shipGroup.add(engNacelle);

            const exhaustRim = new THREE.Mesh(new THREE.TorusGeometry(3.8, 0.45, 8, 20), goldTrimMat);
            exhaustRim.rotation.y = Math.PI / 2;
            exhaustRim.position.set(-41, 5.5, engZ);
            shipGroup.add(exhaustRim);

            const plasmaCore = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 1.0, 16), engineGlowMat);
            plasmaCore.rotation.z = Math.PI / 2;
            plasmaCore.position.set(-40.5, 5.5, engZ);
            shipGroup.add(plasmaCore);

            const engLight = new THREE.PointLight(0x00f0ff, 2.8, 20);
            engLight.position.set(-42, 5.5, engZ);
            shipGroup.add(engLight);
        });

        // 5. Forward Cockpit Observation Canopy Dome (East End: x = 32)
        const canopyGeo = new THREE.SphereGeometry(6.5, 16, 16, 0, Math.PI, 0, Math.PI * 0.5);
        const canopy = new THREE.Mesh(canopyGeo, canopyGlassMat);
        canopy.rotation.z = -Math.PI / 2;
        canopy.position.set(32, 3.5, 0);
        shipGroup.add(canopy);

        // 6. Lowered Hydraulic Steel Cargo Ramp (Entrance at x = 33 to 42, z = [-6, 6])
        const rampGeo = new THREE.BoxGeometry(10, 0.35, 10);
        const ramp = new THREE.Mesh(rampGeo, hullMat);
        ramp.position.set(36, 0.2, 0);
        ramp.rotation.z = -0.04;
        ramp.receiveShadow = true;
        shipGroup.add(ramp);

        // Runway Guidance Lights along Cargo Ramp
        for (let r = 0; r < 4; r++) {
            const rx = 32 + r * 2.8;
            [-4.5, 4.5].forEach(rz => {
                const guideLight = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), engineGlowMat);
                guideLight.position.set(rx, 0.38, rz);
                shipGroup.add(guideLight);
            });
        }

        // 7. Holographic Neon Outpost Archway Sign
        const signBeamGeo = new THREE.BoxGeometry(1.0, 1.0, 12);
        const signBeam = new THREE.Mesh(signBeamGeo, armorPlatesMat);
        signBeam.position.set(32, 6.5, 0);
        shipGroup.add(signBeam);

        const holoSignGeo = new THREE.PlaneGeometry(10, 1.8);
        const holoSignMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, side: THREE.DoubleSide });
        const holoSign = new THREE.Mesh(holoSignGeo, holoSignMat);
        holoSign.rotation.y = Math.PI / 2;
        holoSign.position.set(32.2, 7.6, 0);
        shipGroup.add(holoSign);

        const holoLight = new THREE.PointLight(0x00f5ff, 3.2, 18);
        holoLight.position.set(33, 7.4, 0);
        shipGroup.add(holoLight);

        // 8. Five Vaulted Interior Bulkhead Ribs spanning overhead (x: [-24, -12, 0, 12, 24])
        [-24, -12, 0, 12, 24].forEach(ribX => {
            const ribArchGeo = new THREE.TorusGeometry(14, 0.6, 8, 24, Math.PI);
            const ribArch = new THREE.Mesh(ribArchGeo, armorPlatesMat);
            ribArch.rotation.y = Math.PI / 2;
            ribArch.position.set(ribX, 0, 0);
            shipGroup.add(ribArch);

            const tubeGeo = new THREE.TorusGeometry(13.6, 0.15, 6, 24, Math.PI);
            const tube = new THREE.Mesh(tubeGeo, engineGlowMat);
            tube.rotation.y = Math.PI / 2;
            tube.position.set(ribX, 0, 0);
            shipGroup.add(tube);
        });

        // 9. Central Antimatter Warp Core (Atrium Center: x = 0, z = 0, y = 3.5)
        const coreBase = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.0, 1.2, 12), armorPlatesMat);
        coreBase.position.set(0, 0.6, 0);
        shipGroup.add(coreBase);

        const coreSphere = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 16), coreMat);
        coreSphere.position.set(0, 3.2, 0);
        shipGroup.add(coreSphere);

        const ringGeo = new THREE.TorusGeometry(2.0, 0.18, 8, 20);
        const ring1 = new THREE.Mesh(ringGeo, goldTrimMat);
        ring1.position.set(0, 3.2, 0);
        ring1.rotation.x = Math.PI / 3;
        shipGroup.add(ring1);

        const ring2 = new THREE.Mesh(ringGeo, goldTrimMat);
        ring2.position.set(0, 3.2, 0);
        ring2.rotation.y = Math.PI / 3;
        shipGroup.add(ring2);

        const coreGlow = new THREE.PointLight(0x00ffff, 3.5, 24);
        coreGlow.position.set(0, 3.8, 0);
        shipGroup.add(coreGlow);

        const bayLightN = new THREE.PointLight(0xa5f3fc, 2.2, 22);
        bayLightN.position.set(-10, 5.0, -8);
        shipGroup.add(bayLightN);

        const bayLightS = new THREE.PointLight(0xa5f3fc, 2.2, 22);
        bayLightS.position.set(-10, 5.0, 8);
        shipGroup.add(bayLightS);

        // Radiant Interior Market Illumination across all merchant stalls (including Quelana)
        const marketLightE = new THREE.PointLight(0xfff5e6, 3.2, 28);
        marketLightE.position.set(10, 6.0, 0);
        shipGroup.add(marketLightE);

        const marketLightW = new THREE.PointLight(0xfff5e6, 3.2, 28);
        marketLightW.position.set(-18, 6.0, 0);
        shipGroup.add(marketLightW);

        const marketLightNW = new THREE.PointLight(0xfff5e6, 3.0, 24);
        marketLightNW.position.set(-18, 6.0, -10);
        shipGroup.add(marketLightNW);

        const marketLightSW = new THREE.PointLight(0xfff5e6, 3.2, 26); // Illuminates Quelana of Izalith
        marketLightSW.position.set(-18, 6.0, 10);
        shipGroup.add(marketLightSW);

        this.scene.add(shipGroup);

        // Add colliders for spaceship exterior walls so player remains safely inside
        this.colliders.push(new THREE.Box3(
            new THREE.Vector3(cx - 38, 0, cz - 25),
            new THREE.Vector3(cx + 38, 16, cz - 22)
        ));
        this.colliders.push(new THREE.Box3(
            new THREE.Vector3(cx - 38, 0, cz + 22),
            new THREE.Vector3(cx + 38, 16, cz + 25)
        ));
        this.colliders.push(new THREE.Box3(
            new THREE.Vector3(cx - 38, 0, cz - 24),
            new THREE.Vector3(cx - 34, 16, cz + 24)
        ));
        this.colliders.push(new THREE.Box3(
            new THREE.Vector3(cx + 34, 0, cz - 24),
            new THREE.Vector3(cx + 38, 16, cz - 7)
        ));
        this.colliders.push(new THREE.Box3(
            new THREE.Vector3(cx + 34, 0, cz + 7),
            new THREE.Vector3(cx + 38, 16, cz + 24)
        ));
    }

    buildMerchant() {
        this.buildFallenSpaceshipHouse();
        if (window.DARK_SOULS_MERCHANTS_30 && typeof window.createMerchant3DModel === 'function') {
            this.merchantMeshes = [];
            this.merchantParentGroup = new THREE.Group();
            this.merchantParentGroup.name = 'merchants_30_parent_group';
            window.DARK_SOULS_MERCHANTS_30.forEach((m, idx) => {
                try {
                    const merchantModel = window.createMerchant3DModel(m, this);
                    this.merchantParentGroup.add(merchantModel);
                    this.merchantMeshes.push(merchantModel);

                    if (idx === 0) {
                        this.merchantGroup = merchantModel;
                    }

                    // Register interactable in the world
                    this.interactables.push({
                        type: 'merchant',
                        merchantId: m.id,
                        merchantName: m.name,
                        position: new THREE.Vector3(m.pos[0], m.pos[1], m.pos[2]),
                        radius: 4.5,
                        prompt: `[ E ] TALK TO ${m.name.toUpperCase()} (${m.title})`
                    });
                } catch (err) {
                    console.error('Error generating 3D merchant:', m.id, err);
                }
            });
            this.scene.add(this.merchantParentGroup);
            return;
        }

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
            merchantId: 'merchant_undead_male',
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

        fogGroup.position.set(0, 0, 4140);
        this.scene.add(fogGroup);
        this.fogGateGroup = fogGroup;

        // Fog Gate Collision wall before traversing (at z = 4140)
        this.fogGateCollider = new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(0, 4.5, 4140),
            new THREE.Vector3(12, 9, 2)
        );
        this.colliders.push(this.fogGateCollider);

        // Register interactable
        this.interactables.push({
            type: 'fog_gate',
            position: new THREE.Vector3(0, 1, 4138),
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
    // OBJECT POOLING SYSTEM (Zero GC Allocation during combat)
    // ----------------------------------------------------
    initObjectPools() {
        this.sparkPool = [];
        this.bloodPool = [];
        this.dustPool = [];

        const sparkGeomNormal = new THREE.DodecahedronGeometry(0.05);
        const sparkGeomCrit = new THREE.DodecahedronGeometry(0.08);
        const sparkMatNormal = new THREE.MeshBasicMaterial({ color: 0xffcc33 });
        const sparkMatCrit = new THREE.MeshBasicMaterial({ color: 0xff2200 });

        const bloodGeom = new THREE.DodecahedronGeometry(0.06);
        const bloodMat = new THREE.MeshBasicMaterial({ color: 0x880000 });

        const dustGeom = new THREE.DodecahedronGeometry(0.12);
        const dustMat = new THREE.MeshStandardMaterial({ color: 0x857d72, roughness: 0.9 });

        // Pre-allocate 160 spark meshes in the scene
        for (let i = 0; i < 160; i++) {
            const isCrit = (i % 2 === 0);
            const mesh = new THREE.Mesh(isCrit ? sparkGeomCrit : sparkGeomNormal, isCrit ? sparkMatCrit : sparkMatNormal);
            mesh.visible = false;
            this.scene.add(mesh);
            this.sparkPool.push(mesh);
        }

        // Pre-allocate 100 blood meshes in the scene
        for (let i = 0; i < 100; i++) {
            const mesh = new THREE.Mesh(bloodGeom, bloodMat);
            mesh.visible = false;
            this.scene.add(mesh);
            this.bloodPool.push(mesh);
        }

        // Pre-allocate 50 dust meshes in the scene
        for (let i = 0; i < 50; i++) {
            const mesh = new THREE.Mesh(dustGeom, dustMat);
            mesh.visible = false;
            this.scene.add(mesh);
            this.dustPool.push(mesh);
        }
    }

    // ----------------------------------------------------
    // HIT / IMPACT PARTICLES (Object Pooled)
    // ----------------------------------------------------
    spawnHitSparks(pos, isCrit = false) {
        const count = isCrit ? 24 : 12;
        for (let i = 0; i < count; i++) {
            let mesh = (this.sparkPool && this.sparkPool.length > 0) ? this.sparkPool.pop() : null;
            if (!mesh) {
                mesh = new THREE.Mesh(
                    new THREE.DodecahedronGeometry(isCrit ? 0.08 : 0.05),
                    new THREE.MeshBasicMaterial({ color: isCrit ? 0xff2200 : 0xffcc33 })
                );
                this.scene.add(mesh);
            }
            mesh.position.copy(pos);
            mesh.visible = true;
            mesh.scale.set(1, 1, 1);
            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                Math.random() * 6 + 1,
                (Math.random() - 0.5) * 8
            );
            this.sparkParticles.push({ mesh, vel, life: 0.4, maxLife: 0.4 });
        }
    }

    spawnBlood(pos) {
        const count = 16;
        for (let i = 0; i < count; i++) {
            let mesh = (this.bloodPool && this.bloodPool.length > 0) ? this.bloodPool.pop() : null;
            if (!mesh) {
                mesh = new THREE.Mesh(
                    new THREE.DodecahedronGeometry(0.06),
                    new THREE.MeshBasicMaterial({ color: 0x880000 })
                );
                this.scene.add(mesh);
            }
            mesh.position.copy(pos);
            mesh.visible = true;
            mesh.scale.set(1, 1, 1);
            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                Math.random() * 4,
                (Math.random() - 0.5) * 5
            );
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

        // 0. Dynamic Point Light Distance Culling (+35 to +50 FPS Forward Rendering Optimization)
        this.lightCullTimer = (this.lightCullTimer || 0) + delta;
        if (this.lightCullTimer >= 0.10 && this.dynamicLights && this.dynamicLights.length > 0) {
            this.lightCullTimer = 0;
            const target = (window.game && window.game.playerMesh)
                ? window.game.playerMesh.position
                : ((window.game && window.game.camera) ? window.game.camera.position : null);

            if (target) {
                const tx = target.x;
                const ty = target.y;
                const tz = target.z;
                const len = this.dynamicLights.length;
                const nearbyLights = [];

                for (let i = 0; i < len; i++) {
                    const l = this.dynamicLights[i];
                    l.getWorldPosition(l.userData.worldPos);
                    const dx = l.userData.worldPos.x - tx;
                    const dy = l.userData.worldPos.y - ty;
                    const dz = l.userData.worldPos.z - tz;
                    const distSq = dx * dx + dy * dy + dz * dz;
                    const maxDistSq = l.userData.maxDistSq || (65 * 65);

                    if (distSq > maxDistSq) {
                        l.visible = false;
                    } else {
                        nearbyLights.push({ light: l, distSq: distSq });
                    }
                }

                // Spatial Region & Landmark Visibility Culling (+35 to +50 FPS Boost)
                if (this.outsideGroup) {
                    // Show Outside Realm if player is near West Gate or outside the Citadel
                    const showOutside = (tx <= -15) || (tz < -35) || (tz > 270);
                    this.outsideGroup.visible = showOutside;
                }

                // Spaceship Bazaar & 30 Merchants Culling: Centered at (-75, 0, 40)
                const dxShip = tx - (-75);
                const dzShip = tz - 40;
                const distToShipSq = dxShip * dxShip + dzShip * dzShip;
                const showShip = (tx <= -15) && (distToShipSq < 160 * 160);
                if (this.shipGroup) {
                    this.shipGroup.visible = showShip;
                }
                if (this.merchantParentGroup) {
                    this.merchantParentGroup.visible = showShip;
                }

                // Forward renderer optimization: Three.js shaders have maximum light uniform limits (typically 4-8)
                // If there are more than 8 active nearby lights, enable the nearest 8 and disable the rest
                if (nearbyLights.length > 8) {
                    nearbyLights.sort((a, b) => a.distSq - b.distSq);
                    for (let j = 0; j < nearbyLights.length; j++) {
                        nearbyLights[j].light.visible = (j < 8);
                    }
                } else {
                    for (let j = 0; j < nearbyLights.length; j++) {
                        nearbyLights[j].light.visible = true;
                    }
                }
            }
        }

        // 1. Bonfire flame flicker
        if (this.bonfireLight) {
            this.bonfireLight.intensity = 2.4 + Math.sin(time * 12) * 0.4 + Math.cos(time * 23) * 0.2;
            if (this.bonfireCore) {
                const s = 1.0 + Math.sin(time * 15) * 0.15;
                this.bonfireCore.scale.set(s, s * 1.2, s);
            }
        }

        // 2. Torch lights flicker (Optimized: only animate visible / near torches)
        const playerZ = (window.game && window.game.playerMesh) ? window.game.playerMesh.position.z : 0;
        this.particles.forEach(p => {
            if (p.isLit === false) return;
            if (p.flameMesh && p.flameMesh.parent && p.flameMesh.parent.position) {
                if (Math.abs(p.flameMesh.parent.position.z - playerZ) > 65) return;
            }
            if (p.light && p.light.visible) {
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
        if (this.catacombFogMesh) {
            this.catacombFogMesh.material.opacity = 0.60 + Math.sin(time * 3.5) * 0.18;
        }

        // 4. Floating embers update (Zero-bandwidth GPU translation, 0 buffer uploads)
        if (this.emberParticles) {
            this.emberParticles.position.y += delta * 0.45;
            this.emberParticles.rotation.y = time * 0.025;
            if (this.emberParticles.position.y > 14.0) {
                this.emberParticles.position.y = 0;
            }
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
                p.mesh.visible = false;
                if (this.sparkPool) this.sparkPool.push(p.mesh);
                else this.scene.remove(p.mesh);
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
                p.mesh.visible = false;
                if (this.bloodPool) this.bloodPool.push(p.mesh);
                else this.scene.remove(p.mesh);
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

    // ----------------------------------------------------
    // IN-WORLD FAST-TRAVEL WAYSTONES & EXPEDITION PORTALS
    // ----------------------------------------------------
    spawnArenaBonfire(x = 0, y = 0, z = 345) {
        if (this.arenaBonfireGroup) {
            return;
        }

        const bonfireGroup = new THREE.Group();
        bonfireGroup.name = 'arena_victory_bonfire';
        bonfireGroup.position.set(x, y, z);

        // Ash & charred bones mound
        const ashGeo = new THREE.ConeGeometry(2.4, 0.75, 14);
        const ashMesh = new THREE.Mesh(ashGeo, this.ashMat || this.stoneMat);
        ashMesh.position.y = 0.38;
        bonfireGroup.add(ashMesh);

        // Coiled Sword thrust into ashes
        const sword = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 2.6, 6), this.ironMat);
        sword.position.set(0, 1.25, 0);
        sword.rotation.z = -0.15;
        bonfireGroup.add(sword);

        // Warm Golden Lordran Victory Flame
        const flameCore = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55), new THREE.MeshBasicMaterial({ color: 0xffaa22 }));
        flameCore.position.set(0, 1.1, 0);
        bonfireGroup.add(flameCore);

        const flameLight = new THREE.PointLight(0xff7722, 3.8, 20);
        flameLight.position.set(0, 1.6, 0);
        bonfireGroup.add(flameLight);

        // Register as interactable victory bonfire
        this.interactables.push({
            type: 'bonfire',
            position: new THREE.Vector3(x, y, z),
            radius: 3.8,
            prompt: '✨ [ E ] HEAL TO FULL & TELEPORT (ARENA VICTORY SANCTUARY)'
        });

        this.particles.push({
            mesh: flameCore,
            seed: Math.random() * 20
        });

        this.scene.add(bonfireGroup);
        this.arenaBonfireGroup = bonfireGroup;
    }

    spawnDiscoveredWaystone(x, y, z, loc) {
        if (!loc) return;
        this.removeDiscoveredWaystone();

        const group = new THREE.Group();
        group.name = 'discovered_waystone_portal';
        group.position.set(x, y, z);

        // Monumental 24-Meter Stone Sanctuary Terrace Dais
        const dais = new THREE.Mesh(new THREE.CylinderGeometry(12, 13, 0.4, 24), this.stoneMat);
        dais.position.set(0, 0.2, 0);
        dais.receiveShadow = true;
        group.add(dais);

        // 1. Carved Ash-Granite Fluted Pillars
        const pillarGeo = new THREE.CylinderGeometry(0.38, 0.48, 4.2, 10);
        const pillarMat = new THREE.MeshStandardMaterial({
            color: 0x221f1d,
            roughness: 0.88,
            metalness: 0.15
        });
        const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
        leftPillar.position.set(-1.6, 2.1, 0);
        const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
        rightPillar.position.set(1.6, 2.1, 0);
        group.add(leftPillar, rightPillar);

        // 2. Heavy Archway Lintel & Keystone
        const lintelGeo = new THREE.BoxGeometry(4.0, 0.55, 0.9);
        const lintel = new THREE.Mesh(lintelGeo, pillarMat);
        lintel.position.set(0, 4.2, 0);
        group.add(lintel);

        // 3. Golden Core / Veil of the Lordran Realm
        const veilGeo = new THREE.PlaneGeometry(2.7, 3.8);
        const veilMat = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.75,
            side: THREE.DoubleSide
        });
        const veil = new THREE.Mesh(veilGeo, veilMat);
        veil.position.set(0, 2.1, 0);
        group.add(veil);

        // 4. Ground Soapstone Inscription Circle
        const runeGeo = new THREE.RingGeometry(0.8, 2.6, 20);
        const runeMat = new THREE.MeshBasicMaterial({
            color: 0xffaa22,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide
        });
        const rune = new THREE.Mesh(runeGeo, runeMat);
        rune.rotation.x = -Math.PI / 2;
        rune.position.set(0, 0.06, 0);
        group.add(rune);

        // 5. Radiant Golden Warmth PointLight
        const pLight = new THREE.PointLight(0xffcc44, 2.8, 14);
        pLight.position.set(0, 2.2, 0);
        group.add(pLight);

        group.scale.set(3.0, 3.0, 3.0);
        this.scene.add(group);
        this.discoveredWaystoneMesh = group;

        // Register interactable (tight radius: 2.2m so players passing nearby are never accidentally intercepted)
        this.interactables.push({
            type: 'discovered_waystone',
            position: new THREE.Vector3(x, y, z),
            radius: 2.2,
            prompt: `[ E ] TRAVEL TO ${loc.name.toUpperCase()} [ENTER]`,
            targetLocationId: loc.id
        });
    }

    removeDiscoveredWaystone() {
        if (this.discoveredWaystoneMesh) {
            this.scene.remove(this.discoveredWaystoneMesh);
            this.discoveredWaystoneMesh = null;
        }
        this.interactables = this.interactables.filter(item => item.type !== 'discovered_waystone');
    }

    spawnReturnWaystone(x, y, z) {
        this.removeReturnWaystone();

        const group = new THREE.Group();
        group.name = 'return_waystone_portal';
        group.position.set(x, y, z);

        // 1. Weathered Basalt Return Obelisk
        const obeliskGeo = new THREE.CylinderGeometry(0.3, 0.55, 3.4, 6);
        const obeliskMat = new THREE.MeshStandardMaterial({
            color: 0x1a1612,
            roughness: 0.85,
            metalness: 0.15,
            emissive: 0x221408,
            emissiveIntensity: 0.3
        });
        const mohgObelisk = new THREE.Mesh(obeliskGeo, obeliskMat);
        obelisk.position.set(0, 1.7, 0);
        group.add(obelisk);

        // 2. Lordran Ember Soul Beacon Core (Warm gothic ember instead of neon cyan)
        const coreGeo = new THREE.OctahedronGeometry(0.35);
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0x2a1808,
            emissive: 0xff8822,
            emissiveIntensity: 0.85,
            roughness: 0.4
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.set(0, 3.5, 0);
        group.add(core);

        // 3. Ground Returning Soapstone Ring
        const ringGeo = new THREE.RingGeometry(0.6, 2.0, 18);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xffaa33,
            transparent: true,
            opacity: 0.65,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(0, 0.06, 0);
        group.add(ring);

        // 4. Return Portal Beacon Light
        const rLight = new THREE.PointLight(0xff8822, 1.8, 10);
        rLight.position.set(0, 2.4, 0);
        group.add(rLight);

        this.scene.add(group);
        this.returnWaystoneMesh = group;

        // Register interactable
        this.interactables.push({
            type: 'return_waystone',
            position: new THREE.Vector3(x, y, z),
            radius: 4.0,
            prompt: '🔥 [ E ] REST & FAST TRAVEL AT BONFIRE WAYSTONE',
            targetLocationId: 'royal_bridge_arena'
        });
    }

    removeReturnWaystone() {
        if (this.returnWaystoneMesh) {
            this.scene.remove(this.returnWaystoneMesh);
            this.returnWaystoneMesh = null;
        }
        this.interactables = this.interactables.filter(item => item.type !== 'return_waystone');
    }
}
