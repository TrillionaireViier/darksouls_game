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

        this.initMaterials();
        this.initObjectPools();
        this.buildLighting();
        this.buildEnvironment();
        this.buildDistantFortress();
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

                // Authentic grim Dark Souls flagstone palette (Dark slate, weathered basalt & aged granite)
                const palSeed = Math.random();
                let baseR, baseG, baseB;
                if (palSeed < 0.35) {
                    baseR = 40 + Math.floor(Math.random() * 8);
                    baseG = 38 + Math.floor(Math.random() * 8);
                    baseB = 36 + Math.floor(Math.random() * 8);
                } else if (palSeed < 0.7) {
                    baseR = 46 + Math.floor(Math.random() * 10);
                    baseG = 43 + Math.floor(Math.random() * 8);
                    baseB = 39 + Math.floor(Math.random() * 8);
                } else {
                    baseR = 35 + Math.floor(Math.random() * 6);
                    baseG = 34 + Math.floor(Math.random() * 6);
                    baseB = 33 + Math.floor(Math.random() * 6);
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

                // Rich varied Lordran fortress limestone and granite tones
                const toneSeed = Math.random();
                let rC, gC, bC;
                if (toneSeed < 0.35) {
                    rC = 88 + Math.floor(Math.random() * 14); // Weathered dark basalt
                    gC = 82 + Math.floor(Math.random() * 14);
                    bC = 76 + Math.floor(Math.random() * 14);
                } else if (toneSeed < 0.70) {
                    rC = 112 + Math.floor(Math.random() * 16); // Warm sun-baked ashlar
                    gC = 104 + Math.floor(Math.random() * 16);
                    bC = 94 + Math.floor(Math.random() * 16);
                } else {
                    rC = 98 + Math.floor(Math.random() * 14); // Classic gray Lordran granite
                    gC = 96 + Math.floor(Math.random() * 14);
                    bC = 94 + Math.floor(Math.random() * 14);
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
    }

    buildLighting() {
        // 1. Panoramic Gothic Sky Dome with Vertical Horizon Gradient
        const skyCanvas = document.createElement('canvas');
        skyCanvas.width = 512;
        skyCanvas.height = 512;
        const skyCtx = skyCanvas.getContext('2d');
        const skyGrad = skyCtx.createLinearGradient(0, 0, 0, 512);
        skyGrad.addColorStop(0.0, '#152538'); // Dark twilight azure zenith
        skyGrad.addColorStop(0.45, '#2e4862'); // Atmospheric sky blue
        skyGrad.addColorStop(0.75, '#5c5244'); // Warm golden dust haze
        skyGrad.addColorStop(1.0, '#786048'); // Sunlit mountain horizon glow
        skyCtx.fillStyle = skyGrad;
        skyCtx.fillRect(0, 0, 512, 512);

        const skyTex = new THREE.CanvasTexture(skyCanvas);
        const skyDomeGeo = new THREE.SphereGeometry(340, 32, 16);
        const skyDomeMat = new THREE.MeshBasicMaterial({
            map: skyTex,
            side: THREE.BackSide,
            depthWrite: false
        });
        const skyDome = new THREE.Mesh(skyDomeGeo, skyDomeMat);
        this.scene.add(skyDome);

        this.scene.background = new THREE.Color(0x28384a);

        // 2. Exponential Natural Atmospheric Depth Fog (Dark Souls / Elden Ring depth)
        this.scene.fog = new THREE.FogExp2(0x324458, 0.0075);

        // 3. Balanced Ambient Light (retains deep, dramatic shadow crevices without washing out)
        this.ambientLight = new THREE.AmbientLight(0x202a38, 0.35);
        this.scene.add(this.ambientLight);

        // 4. Sky and ground bounce hemisphere lighting (slate blue sky + warm stone bounce)
        this.hemiLight = new THREE.HemisphereLight(0x4a6d95, 0x221a14, 0.45);
        this.scene.add(this.hemiLight);

        // 5. Cinematic Golden Lordran Sunlight (dramatic rake angle casting long soft shadows)
        this.moonlight = new THREE.DirectionalLight(0xffedd2, 1.4);
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
        this.moonlight.shadow.bias = -0.0003;
        this.moonlight.shadow.radius = 1.0;
        this.scene.add(this.moonlight);

        // 6. Radiant Golden Sun Disc & Volumetric Aura
        const sunGeo = new THREE.SphereGeometry(8, 20, 20);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xfffae4 });
        const sun = new THREE.Mesh(sunGeo, sunMat);
        sun.position.set(65, 125, 45);
        this.scene.add(sun);

        const sunAuraGeo = new THREE.RingGeometry(8.2, 22.0, 32);
        const sunAuraMat = new THREE.MeshBasicMaterial({
            color: 0xffeed0,
            transparent: true,
            opacity: 0.65,
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
            // West wall
            [-29, 3.5, -14], [-29, 3.5, 0], [-29, 3.5, 14],
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

        // Interactive unlit torches near courtyard gate (ignitable with [E] for +50 Souls)
        this.createTorch(-6.5, 2.5, 25, { interactive: true, isLit: false });
        this.createTorch(6.5, 2.5, 25, { interactive: true, isLit: false });
    }

    getGroundHeight(x, z, currentY = null) {
        // 1. East Upper Ramparts & Stairs (y = 6.0)
        // Broad ramparts elevation lock & walkway span (x in [11.0, 26.5], z in [18, 96])
        if (currentY !== null && currentY >= 2.5 && x >= 11.0 && x <= 26.5 && z >= 18 && z <= 96) {
            if (z > 91) {
                const t = (96 - z) / 5;
                return Math.max(0, t * 6.0);
            }
            return 6.0;
        }

        // Ascending Stairs from Courtyard to Ramparts (z in [4, 22], x in [14.0, 26.0])
        if (x >= 14.0 && x <= 26.0 && z >= 4 && z <= 22) {
            const t = (z - 4) / 18;
            return t * 6.0;
        }
        // High Ramparts Battlement Walkway & Bastion (z in [22, 91], x in [11.0, 26.5])
        if (x >= 11.0 && x <= 26.5 && z > 22 && z <= 91) {
            return 6.0;
        }
        // Watchtower & Descent Ramp to Fog Gate (z in [91, 96], x in [11.0, 26.5])
        if (x >= 11.0 && x <= 26.5 && z > 91 && z <= 96) {
            const t = (96 - z) / 5;
            return Math.max(0, t * 6.0);
        }

        // 2. Surface Boss Arena (z in [92, 172], wide arena span x in [-22, 22])
        // If player is on surface (currentY === null || currentY >= -2.2), ALWAYS stay solid at y = 0.0!
        if (x >= -22 && x <= 22 && z >= 92 && z <= 172 && (currentY === null || currentY >= -2.2)) {
            return 0.0;
        }

        // 3. Central Royal Bridge (z in [24, 96], walkable bridge span x in [-9.0, 9.0])
        if (x >= -9.0 && x <= 9.0 && z >= 24 && z <= 96 && (currentY === null || currentY >= -2.2)) {
            return 0.0;
        }

        // 4. West Sunken Catacombs & Deep Subterranean Mausoleum
        // Precise stairwell trench check: stairs are 8m wide centered at x = -20 (bounds x: [-23.8, -16.2])
        const inStairTrench = (x >= -23.8 && x <= -16.2 && z >= 4.0 && z <= 22.5);
        if (inStairTrench) {
            const t = Math.max(0, Math.min(1.0, (z - 4.0) / 18.0));
            // Precisely aligns with step top meshes (-stepDepth + 0.445)
            return Math.min(0.0, -t * 5.0 + 0.22);
        }

        // Deep Catacombs Crypt & Mausoleum (z in [90, 150], x in [-34, -7])
        const inCryptBounds = (x >= -34 && x <= -7 && z >= 90 && z <= 150);
        if (inCryptBounds && (currentY === null || currentY < -2.2)) {
            // Crypt Exit Ascent Stairs back to surface fog gate (x in [-20, -12], z in [90, 96])
            if (x >= -20 && x <= -12 && z >= 90 && z <= 96) {
                const t = (z - 90) / 6;
                return -5.0 + t * 5.0;
            }
            // Descending entrance ramp into Mausoleum (z in [90, 98])
            if (z >= 90 && z <= 98) {
                const t = (z - 90) / 8;
                return -5.0 - t * 1.0;
            }
            return -6.0;
        }

        // Flooded Subterranean Catacombs Corridor (z in [22, 90], x in [-24.2, -15.8])
        if (x >= -24.2 && x <= -15.8 && z > 22 && z <= 90 && (currentY === null || currentY < -1.5)) {
            return -4.92;
        }

        // 5. Main Courtyard Starting Arena (z in [-35, 35], x in [-35, 35])
        // Guarantees solid floor at y = 0.0 anywhere in the courtyard
        if (x >= -35 && x <= 35 && z >= -35 && z <= 35) {
            if (currentY === null || currentY >= -1.2) {
                return 0.0;
            }
        }

        // 6. Serpent Sanctuary & Temple of the Gorgon (z in [-115, -30], x in [-38, 38])
        // A. Descent Stairs from Courtyard (z in [-36, -30], x in [-12, 12])
        if (x >= -12 && x <= 12 && z >= -36 && z <= -30) {
            const t = (-30 - z) / 6.0;
            return -t * 2.5;
        }
        // B. Sunken Serpent Courtyard (z in [-70, -36], x in [-32, 32])
        if (x >= -32 && x <= 32 && z >= -70 && z < -36) {
            return -2.5;
        }
        // C. Descent Stairs into Gorgon Inner Sanctum (z in [-78, -70], x in [-14, 14])
        if (x >= -14 && x <= 14 && z >= -78 && z < -70) {
            const t = (-70 - z) / 8.0;
            return -2.5 - t * 1.5;
        }
        // D. Gorgon Inner Sanctum & Altar of Medusa (z in [-115, -78], x in [-38, 38])
        if (x >= -38 && x <= 38 && z >= -115 && z < -78) {
            return -4.0;
        }

        // 7. Dynamic Fast-Travel Lordran Realm Ground Height
        if (window.DARK_SOULS_LOCATIONS) {
            for (let i = 0; i < window.DARK_SOULS_LOCATIONS.length; i++) {
                const loc = window.DARK_SOULS_LOCATIONS[i];
                const dx = x - loc.pos[0];
                const dz = z - loc.pos[2];
                if (dx * dx + dz * dz < 40 * 40) {
                    if (currentY === null || Math.abs(currentY - loc.pos[1]) < 8.0) {
                        return loc.pos[1];
                    }
                }
            }
        }

        // Beyond citadel architectural borders lies the bottomless chasm
        return -50.0;
    }

    buildEnvironment() {
        // 1. Courtyard Floor (Starting area) with Open Trenches for Catacombs Descent & Ramparts Stairs
        // North Courtyard Floor Slab (z in [-30, 4], x in [-30, 30])
        const northCourtyardGeo = new THREE.PlaneGeometry(60, 34);
        const northCourtyard = new THREE.Mesh(northCourtyardGeo, this.stoneMat);
        northCourtyard.rotation.x = -Math.PI / 2;
        northCourtyard.position.set(0, 0, -13);
        northCourtyard.receiveShadow = true;
        this.scene.add(northCourtyard);

        // Center Promenade Floor Slab (z in [4, 30], x in [-15, 15] - between stairwells)
        const centerCourtyardGeo = new THREE.PlaneGeometry(30, 26);
        const centerCourtyard = new THREE.Mesh(centerCourtyardGeo, this.stoneMat);
        centerCourtyard.rotation.x = -Math.PI / 2;
        centerCourtyard.position.set(0, 0, 17);
        centerCourtyard.receiveShadow = true;
        this.scene.add(centerCourtyard);

        // Far West Battlement Floor Slab (z in [4, 30], x in [-30, -25])
        const westCourtyardGeo = new THREE.PlaneGeometry(5, 26);
        const westCourtyard = new THREE.Mesh(westCourtyardGeo, this.stoneMat);
        westCourtyard.rotation.x = -Math.PI / 2;
        westCourtyard.position.set(-27.5, 0, 17);
        westCourtyard.receiveShadow = true;
        this.scene.add(westCourtyard);

        // Far East Battlement Floor Slab (z in [4, 30], x in [25, 30])
        const eastCourtyardGeo = new THREE.PlaneGeometry(5, 26);
        const eastCourtyard = new THREE.Mesh(eastCourtyardGeo, this.stoneMat);
        eastCourtyard.rotation.x = -Math.PI / 2;
        eastCourtyard.position.set(27.5, 0, 17);
        eastCourtyard.receiveShadow = true;
        this.scene.add(eastCourtyard);

        // Outer Courtyard Fortress Walls (North Gate open at x in [-7, 7] for Serpent Sanctuary)
        this.createWall(-18.5, 5, -30, 23, 10, 2); // West segment of North wall (x: -30 to -7)
        this.createWall(18.5, 5, -30, 23, 10, 2);  // East segment of North wall (x: 7 to 30)
        this.createWall(0, 9.5, -30, 14, 3, 2);    // Overhead monumental arch lintel above doorway
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

        // Solid stair side skirt filling under steps
        const skirtGeo = new THREE.BoxGeometry(0.3, 3.5, 18.5);
        const skirtL = new THREE.Mesh(skirtGeo, this.wallMat);
        skirtL.position.set(15.8, 1.6, 13.5);
        skirtL.rotation.x = Math.atan2(6.0, 18.0);
        this.scene.add(skirtL);

        this.colliders.push(new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(15.75, 3.5, 13.5),
            new THREE.Vector3(0.6, 5.0, 19.0)
        ));
        this.colliders.push(new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(24.25, 3.5, 13.5),
            new THREE.Vector3(0.6, 5.0, 19.0)
        ));

        // Upper Ramparts Walkway Elevated Floor Slab (z=22 to z=91 at y=5.5)
        const rampartFloorGeo = new THREE.BoxGeometry(10.0, 1.0, 69);
        const rampartFloorMat = this.stoneMat.clone();
        rampartFloorMat.map = rampartFloorMat.map.clone();
        rampartFloorMat.map.repeat.set(3, 23);
        if (rampartFloorMat.bumpMap) {
            rampartFloorMat.bumpMap = rampartFloorMat.bumpMap.clone();
            rampartFloorMat.bumpMap.repeat.set(3, 23);
        }
        if (rampartFloorMat.roughnessMap) {
            rampartFloorMat.roughnessMap = rampartFloorMat.roughnessMap.clone();
            rampartFloorMat.roughnessMap.repeat.set(3, 23);
        }
        const rampartFloor = new THREE.Mesh(rampartFloorGeo, rampartFloorMat);
        rampartFloor.position.set(20, 5.5, 56.5);
        rampartFloor.receiveShadow = true;
        this.scene.add(rampartFloor);

        // Outer Fortress Wall with Crenellations (x=24.6, y=6.0 to 10.0, z=22 to 96)
        this.createWall(24.6, 8.0, 59.0, 1.2, 4.0, 74);
        this.createWall(20.0, 8.0, 95.5, 8.5, 4.0, 1.2); // North containment wall of High Ramparts Walkway
        for (let cz = 24; cz <= 94; cz += 4) {
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

        // Side retaining walls enclosing the sunken stairs (z=4 to z=22)
        this.createWall(-24.6, 0.5, 13, 0.8, 6.0, 18);
        this.createWall(-15.4, 0.5, 13, 0.8, 6.0, 18);

        // Overhead sloped tunnel ceiling above sunken stairs
        const tunnelCeil = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.8, 18.5), this.stoneMat);
        tunnelCeil.position.set(-20, 3.8, 13);
        tunnelCeil.rotation.x = -Math.atan2(5.0, 18.0);
        this.scene.add(tunnelCeil);

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

        // Flooded Crypt Corridor Vaulted Stone Ceiling (y=1.5, z=22 to z=90)
        const cryptCeilGeo = new THREE.BoxGeometry(9.6, 0.8, 68);
        const cryptCeil = new THREE.Mesh(cryptCeilGeo, this.stoneMat);
        cryptCeil.position.set(-20, 1.5, 56);
        cryptCeil.receiveShadow = true;
        this.scene.add(cryptCeil);

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

        // ====================================================
        // DEEP SUBTERRANEAN CATACOMBS MAUSOLEUM (z=96 to z=148, y=-6.0)
        // Tomb of the Giants & Crypt Sanctum of Gravelord Nito
        // ====================================================
        // Entrance Portal Arch at z=96 leading into the Mausoleum
        const mausoleumArchL = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.0, 1.6), this.wallMat);
        mausoleumArchL.position.set(-24.5, -2.5, 96);
        this.scene.add(mausoleumArchL);
        const mausoleumArchR = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.0, 1.6), this.wallMat);
        mausoleumArchR.position.set(-15.5, -2.5, 96);
        this.scene.add(mausoleumArchR);
        const mausoleumArchTop = new THREE.Mesh(new THREE.BoxGeometry(10.6, 1.4, 1.6), this.wallMat);
        mausoleumArchTop.position.set(-20, 0.8, 96);
        this.scene.add(mausoleumArchTop);

        // Subterranean Mausoleum Stone Floor Slab (y=-6.5, z=96 to 148, x=[-33, -7])
        const mausoleumFloorGeo = new THREE.BoxGeometry(26, 1.0, 52);
        const mausoleumFloor = new THREE.Mesh(mausoleumFloorGeo, this.stoneMat);
        mausoleumFloor.position.set(-20, -6.5, 122);
        mausoleumFloor.receiveShadow = true;
        this.scene.add(mausoleumFloor);

        // Subterranean Vaulted Stone Ceiling (y=2.8, z=96 to 148, x=[-33, -7])
        const mausoleumCeilGeo = new THREE.BoxGeometry(26.6, 0.9, 52);
        const mausoleumCeil = new THREE.Mesh(mausoleumCeilGeo, this.stoneMat);
        mausoleumCeil.position.set(-20, 2.8, 122);
        mausoleumCeil.receiveShadow = true;
        this.scene.add(mausoleumCeil);

        // Mausoleum Outer Retaining Fortress Walls
        this.createWall(-33.2, -2.0, 122, 1.2, 9.5, 52); // West Crypt Wall
        this.createWall(-6.8, -2.0, 122, 1.2, 9.5, 52);  // East Crypt Wall (Divides Catacombs from Bridge chasm)
        this.createWall(-20, -2.0, 148, 27, 9.5, 1.2);   // South Sanctum Wall
        this.createWall(-29, -2.0, 96, 9, 9.5, 1.2);     // North Left Wall
        this.createWall(-11, -2.0, 96, 9, 9.5, 1.2);     // North Right Wall

        // Massive Skeletal Ossuary Pillars supporting the crypt ceiling
        const cryptPillarCoords = [
            [-27, 106], [-13, 106],
            [-27, 118], [-13, 118],
            [-27, 130], [-13, 130],
            [-27, 142], [-13, 142]
        ];
        cryptPillarCoords.forEach(([px, pz]) => {
            const pillar = new THREE.Mesh(new THREE.BoxGeometry(2.2, 8.5, 2.2), this.wallMat);
            pillar.position.set(px, -2.0, pz);
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            this.scene.add(pillar);
            this.colliders.push(new THREE.Box3().setFromObject(pillar));

            // Ghostfire Brazier hanging on pillar
            this.createTealBrazier(px > -20 ? px - 1.2 : px + 1.2, -3.5, pz);
        });

        // Ancient Carved Stone Sarcophagi lining the tomb
        [102, 114, 126, 138].forEach((sz, idx) => {
            const sarcX = (idx % 2 === 0) ? -31.8 : -8.2;
            const sarc = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 3.4), this.stoneMat);
            sarc.position.set(sarcX, -5.4, sz);
            sarc.castShadow = true;
            sarc.receiveShadow = true;
            this.scene.add(sarc);
            this.colliders.push(new THREE.Box3().setFromObject(sarc));

            const skullPile = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 1), this.stoneMat);
            skullPile.position.set(sarcX, -4.6, sz);
            this.scene.add(skullPile);
        });

        // Giant Throne of Bones & Gravelord Sarcophagus at the far end (z=145)
        const boneThrone = new THREE.Mesh(new THREE.BoxGeometry(6.0, 3.0, 2.4), this.stoneMat);
        boneThrone.position.set(-20, -4.5, 146);
        boneThrone.castShadow = true;
        this.scene.add(boneThrone);
        this.colliders.push(new THREE.Box3().setFromObject(boneThrone));

        // Emerald Ghostfire Mist & Torch Sconces throughout the Mausoleum
        [100, 112, 124, 136, 144].forEach((tz) => {
            this.createTorch(-32.6, -3.2, tz, { color: 0x00ffcc, intensity: 3.2, radius: 22 });
            this.createTorch(-7.4, -3.2, tz, { color: 0x00ffcc, intensity: 3.2, radius: 22 });
        });

        // Emerald Fog Gate at Catacombs Mausoleum Entrance (x=-20, y=-6.0, z=96)
        const catacombFogGroup = new THREE.Group();
        const cFogGeo = new THREE.PlaneGeometry(8, 7.5, 8, 8);
        const cFogMat = new THREE.MeshBasicMaterial({
            color: 0x00ffcc,
            transparent: true,
            opacity: 0.72,
            side: THREE.DoubleSide
        });
        const cFogMesh = new THREE.Mesh(cFogGeo, cFogMat);
        cFogMesh.position.set(0, 3.2, 0);
        catacombFogGroup.add(cFogMesh);
        catacombFogGroup.position.set(-20, -6.0, 96);
        this.scene.add(catacombFogGroup);
        this.catacombFogMesh = cFogMesh;

        // Register Catacombs Fog Gate interaction
        this.interactables.push({
            type: 'catacomb_fog_gate',
            position: new THREE.Vector3(-20, -5.0, 94.5),
            radius: 3.6,
            prompt: '[ E ] ENTER SANCTUM OF THE DEAD (GRAVELORD NITO)'
        });

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

        // 4. North Path Beacon: Jade Serpent Beam & Serpentine Sanctum Banner (Flanking North Archway)
        this.createPathBeacon(-5.8, 0, -28.0, 0x1e824c, "🐍 GORGON'S SANCTUM & SERPENT RUINS [NORTH]", "SUNKEN TEMPLE • MEDUSA & COBRAS", "#2ecc71");

        // Build Massive Serpentine Sanctum & Atmospheric Map Details
        this.buildSerpentSanctum();
        this.buildMapDetailEnhancements();
    }

    buildSerpentSanctum() {
        const sanctumGroup = new THREE.Group();

        // 1. Grand Serpent Gate Arch & Twin 6-Meter Colossal Cobra Statues (z = -30, x in [-12, 12])
        this.createColossalCobraStatue(-8.5, 0, -31, Math.PI / 4);
        this.createColossalCobraStatue(8.5, 0, -31, -Math.PI / 4);

        // Archway Columns flanking doorway
        this.createPillar(-6.5, -30, 9);
        this.createPillar(6.5, -30, 9);

        // Wall sconces with atmospheric serpentine flames
        this.createTorch(-6.5, 4.5, -29, { intensity: 1.6, radius: 12, color: 0x1e824c });
        this.createTorch(6.5, 4.5, -29, { intensity: 1.6, radius: 12, color: 0x1e824c });

        // 2. Descending Stone Staircase (z: -30 to -36, x: -12 to 12, y: 0 to -2.5)
        const stairSteps = 12;
        for (let s = 0; s < stairSteps; s++) {
            const sz = -30 - (s / stairSteps) * 6.0;
            const sy = - (s / stairSteps) * 2.5;
            const step = new THREE.Mesh(new THREE.BoxGeometry(22, 0.28, 0.6), this.serpentStoneMat);
            step.position.set(0, sy, sz);
            step.receiveShadow = true;
            sanctumGroup.add(step);
        }

        // Side balustrades for entrance stairs
        this.createWall(-11.5, 0, -33, 1.2, 4.0, 7);
        this.createWall(11.5, 0, -33, 1.2, 4.0, 7);

        // 3. Sunken Serpent Courtyard Floor Slab (z: -36 to -70, x: -32 to 32, y = -2.5)
        const courtyardFloorGeo = new THREE.PlaneGeometry(64, 34);
        const courtyardFloor = new THREE.Mesh(courtyardFloorGeo, this.serpentStoneMat);
        courtyardFloor.rotation.x = -Math.PI / 2;
        courtyardFloor.position.set(0, -2.5, -53);
        courtyardFloor.receiveShadow = true;
        sanctumGroup.add(courtyardFloor);

        // Perimeter Walls for Sunken Courtyard (y: -2.5, height: 10m)
        this.createWall(-32, 2.5, -53, 2, 10, 36); // West Wall
        this.createWall(32, 2.5, -53, 2, 10, 36);  // East Wall
        // South retaining wall segments around stairs
        this.createWall(-22, 2.5, -36, 20, 10, 2);
        this.createWall(22, 2.5, -36, 20, 10, 2);

        // 4. Toxic Swamp / Poison Marsh Pool at Center of Sunken Courtyard
        const poolGeo = new THREE.CylinderGeometry(8.5, 8.5, 0.2, 16);
        const poolMesh = new THREE.Mesh(poolGeo, this.poisonWaterMat);
        poolMesh.position.set(0, -2.42, -53);
        sanctumGroup.add(poolMesh);

        // Poisonous light aura
        const poisonLight = new THREE.PointLight(0x10ff66, 2.8, 20);
        poisonLight.position.set(0, -1.8, -53);
        sanctumGroup.add(poisonLight);

        // 5. Four Stone Serpent Braziers with Emerald Flames in Sunken Courtyard
        [[-16, -44], [16, -44], [-16, -62], [16, -62]].forEach(([bx, bz]) => {
            this.createStandingBrazier(bx, -2.5, bz, 0x10ff66, 3.8, 24);
        });

        // 6. Eight Petrified Warriors Frozen in Dynamic Combat Poses
        const petrifiedCoords = [
            [-8, -42, 0, 0],    // Shield raised
            [10, -46, 1.2, 1],  // Screaming reaching up
            [-12, -56, -0.8, 2],// Kneeling with broken sword
            [12, -58, 2.4, 3],  // Mid-slash frozen
            [-4, -64, 0.4, 0],  // Shield defense
            [6, -64, -1.4, 1],  // Screaming
            [-18, -50, 1.8, 2], // Kneeling
            [18, -52, -2.2, 3]  // Mid-slash
        ];
        petrifiedCoords.forEach(([px, pz, pang, ppose]) => {
            if (this.scene && window.game && window.game.characters) {
                window.game.characters.createPetrifiedWarrior(px, pz, pang, -2.5, ppose);
                this.colliders.push(new THREE.Box3(
                    new THREE.Vector3(px - 0.7, -2.5, pz - 0.7),
                    new THREE.Vector3(px + 0.7, 0.0, pz + 0.7)
                ));
            }
        });

        // 7. Descending Stairs to Inner Sanctum (z: -70 to -78, x: -14 to 14, y: -2.5 to -4.0)
        for (let s = 0; s < 12; s++) {
            const sz = -70 - (s / 12) * 8.0;
            const sy = -2.5 - (s / 12) * 1.5;
            const step = new THREE.Mesh(new THREE.BoxGeometry(26, 0.26, 0.7), this.serpentStoneMat);
            step.position.set(0, sy, sz);
            step.receiveShadow = true;
            sanctumGroup.add(step);
        }
        // Retaining walls beside inner stairs
        this.createWall(-23, 2.5, -70, 20, 10, 2);
        this.createWall(23, 2.5, -70, 20, 10, 2);
        this.createWall(-13.5, 1.5, -74, 1.2, 8, 9);
        this.createWall(13.5, 1.5, -74, 1.2, 8, 9);

        // 8. Gorgon's Inner Sanctum Floor Slab (z: -78 to -115, x: -38 to 38, y = -4.0)
        const innerFloorGeo = new THREE.PlaneGeometry(76, 37);
        const innerFloor = new THREE.Mesh(innerFloorGeo, this.serpentStoneMat);
        innerFloor.rotation.x = -Math.PI / 2;
        innerFloor.position.set(0, -4.0, -96.5);
        innerFloor.receiveShadow = true;
        sanctumGroup.add(innerFloor);

        // Perimeter Enclosing Walls for Inner Sanctum
        this.createWall(-38, 1.0, -96.5, 2, 12, 39); // West Wall
        this.createWall(38, 1.0, -96.5, 2, 12, 39);  // East Wall
        this.createWall(0, 1.0, -115, 78, 12, 2);    // Far North Wall

        // 9. Colonnade of Medusa (8 Colossal Columns wrapped in Stone Snakes)
        const colonnadeCoords = [
            [-16, -84], [16, -84],
            [-22, -96], [22, -96],
            [-16, -106], [16, -106],
            [-8, -112], [8, -112]
        ];
        colonnadeCoords.forEach(([cx, cz]) => {
            this.createSerpentPillar(cx, cz, -4.0, 11);
        });

        // 10. The Great Altar of the Gorgon (z = -108, x = 0, y = -4.0)
        const altarDais = new THREE.Mesh(new THREE.BoxGeometry(14, 1.2, 8), this.serpentJadeMat);
        altarDais.position.set(0, -3.4, -108);
        altarDais.receiveShadow = true;
        sanctumGroup.add(altarDais);

        // Giant Carved Gorgon Relief Head above Altar
        const reliefHead = new THREE.Mesh(new THREE.BoxGeometry(4.5, 5.5, 1.2), this.serpentStoneMat);
        reliefHead.position.set(0, 0.5, -113.8);
        sanctumGroup.add(reliefHead);

        // Glowing Emerald Eyes on Wall Relief (Subtle serpentine glow)
        const leftReliefEye = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshStandardMaterial({ color: 0x1e824c, emissive: 0x1e824c, emissiveIntensity: 0.6 }));
        leftReliefEye.position.set(-1.1, 1.2, -113.1);
        sanctumGroup.add(leftReliefEye);
        const rightReliefEye = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshStandardMaterial({ color: 0x1e824c, emissive: 0x1e824c, emissiveIntensity: 0.6 }));
        rightReliefEye.position.set(1.1, 1.2, -113.1);
        sanctumGroup.add(rightReliefEye);

        const altarGlow = new THREE.PointLight(0x1e824c, 2.0, 16);
        altarGlow.position.set(0, 1.2, -110);
        sanctumGroup.add(altarGlow);

        // Sacrificial Basin with Glowing Venom
        const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.2, 1.0, 12), this.serpentJadeMat);
        basin.position.set(0, -2.4, -106);
        sanctumGroup.add(basin);
        const basinLiquid = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.1, 12), this.poisonWaterMat);
        basinLiquid.position.set(0, -1.85, -106);
        sanctumGroup.add(basinLiquid);

        // 11. Emerald Serpent Bonfire (z = -82, x = 0, y = -4.0)
        this.createSerpentBonfire(0, -4.0, -82);

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
            radius: 3.2,
            prompt: '[ E ] REST AT SERPENT BONFIRE'
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
            flatShading: true
        });

        const mountainCoords = [
            [-180, 25, -120, 55, 110], [-110, 20, -160, 45, 95], [0, 30, -180, 65, 130],
            [120, 25, -160, 50, 105], [190, 20, -110, 55, 115],
            [-210, 15, 40, 48, 90], [210, 15, 40, 52, 100],
            [-190, 18, 160, 55, 110], [190, 18, 160, 55, 110],
            [-100, 25, 230, 60, 125], [0, 35, 250, 75, 145], [110, 25, 230, 60, 120]
        ];

        mountainCoords.forEach(([mx, my, mz, mw, mh]) => {
            const mGeo = new THREE.ConeGeometry(mw, mh, 5);
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
            [-85, 0, -90, 7, 55], [-45, 0, -115, 6, 68], [55, 0, -110, 6.5, 62], [95, 0, -85, 7.5, 52],
            [-125, -5, 110, 8, 50], [125, -5, 110, 8, 50],
            [-80, 0, 195, 9, 78], [80, 0, 195, 9, 78]
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

        // Massive foundation walls under East Ramparts (x=20, z=[22, 91])
        const rampartFoundation = new THREE.Mesh(new THREE.BoxGeometry(8.8, 24, 69), this.wallMat);
        rampartFoundation.position.set(20, -9.0, 56.5);
        rampartFoundation.receiveShadow = true;
        distantGroup.add(rampartFoundation);

        // Massive foundation walls under West Catacombs (x=-20, z=[22, 90])
        const cryptFoundation = new THREE.Mesh(new THREE.BoxGeometry(8.8, 16, 67), this.wallMat);
        cryptFoundation.position.set(-20, -15.0, 56);
        cryptFoundation.receiveShadow = true;
        distantGroup.add(cryptFoundation);

        // Colossal stone bridge piers & buttresses beneath the Royal Bridge (x=0, z=[28, 96])
        for (let bz = 36; bz <= 88; bz += 26) {
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
        const arenaBastion = new THREE.Mesh(new THREE.BoxGeometry(37, 24, 74), this.wallMat);
        arenaBastion.position.set(0, -13.0, 131);
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

    createPathBeacon(x, y, z, colorHex, title, desc, titleColor) {
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
        this.createFloorSoapstone(x, y, z + 2.5, titleColor || ('#' + colorHex.toString(16).padStart(6, '0')), title, desc);

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
        this.bonfireLight.castShadow = false;
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
    spawnArenaBonfire(x = 0, y = 0, z = 138) {
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
            radius: 3.4,
            prompt: '🔥 [ E ] REST AT ARENA VICTORY BONFIRE'
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

        this.scene.add(group);
        this.discoveredWaystoneMesh = group;

        // Register interactable
        this.interactables.push({
            type: 'discovered_waystone',
            position: new THREE.Vector3(x, y, z),
            radius: 4.2,
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
        const obelisk = new THREE.Mesh(obeliskGeo, obeliskMat);
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
            prompt: '[ E ] RETURN TO ROYAL CITADEL & ARENA [ENTER]',
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
