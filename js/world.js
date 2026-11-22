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

        // ==========================================
        // OUTSIDE REALM & DARKROOT FOREST MATERIALS
        // ==========================================
        const grassCanvas = document.createElement('canvas');
        grassCanvas.width = 512;
        grassCanvas.height = 512;
        const gCtx = grassCanvas.getContext('2d');
        gCtx.fillStyle = '#182416';
        gCtx.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 4000; i++) {
            const gx = Math.random() * 512;
            const gy = Math.random() * 512;
            const gr = 1.0 + Math.random() * 2.5;
            const gShade = Math.random();
            gCtx.fillStyle = gShade < 0.4 ? 'rgba(38, 54, 32, 0.45)' : (gShade < 0.8 ? 'rgba(24, 38, 20, 0.6)' : 'rgba(48, 40, 26, 0.5)');
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
            roughness: 0.92,
            metalness: 0.05
        });

        this.cliffRockMat = new THREE.MeshStandardMaterial({
            color: 0x22262a,
            roughness: 0.90,
            metalness: 0.12,
            flatShading: true
        });

        this.archtreeBarkMat = new THREE.MeshStandardMaterial({
            color: 0x2a2118,
            roughness: 0.95,
            metalness: 0.05
        });

        this.foliageMat = new THREE.MeshStandardMaterial({
            color: 0x153520,
            roughness: 0.85,
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
        this.scene.fog = new THREE.FogExp2(0x324458, 0.0035);

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
        // 1. East Upper Ramparts & Stairs (y = 6.0) - Extended across 248m
        if (currentY !== null && currentY >= 2.5 && x >= 11.0 && x <= 26.5 && z >= 18 && z <= 274) {
            if (z > 268) {
                const t = (274 - z) / 6;
                return Math.max(0, t * 6.0);
            }
            return 6.0;
        }

        // Ascending Stairs from Courtyard to Ramparts (z in [4, 22], x in [14.0, 26.0])
        if (x >= 14.0 && x <= 26.0 && z >= 4 && z <= 22) {
            const t = (z - 4) / 18;
            return t * 6.0;
        }
        // High Ramparts Battlement Walkway (z in [22, 268], x in [11.0, 26.5])
        if (x >= 11.0 && x <= 26.5 && z > 22 && z <= 268) {
            return 6.0;
        }
        // Watchtower & Descent Ramp to Fog Gate (z in [268, 274], x in [11.0, 26.5])
        if (x >= 11.0 && x <= 26.5 && z > 268 && z <= 274) {
            const t = (274 - z) / 6;
            return Math.max(0, t * 6.0);
        }

        // 2. Surface Boss Arena (z in [272, 390], wide arena span x in [-24, 24])
        // If player is on surface (currentY === null || currentY >= -2.2), ALWAYS stay solid at y = 0.0!
        if (x >= -24 && x <= 24 && z >= 272 && z <= 390 && (currentY === null || currentY >= -2.2)) {
            return 0.0;
        }

        // 3. Central Royal Bridge (z in [24, 274], walkable bridge span x in [-9.0, 9.0]) - Extended across 240m!
        if (x >= -9.0 && x <= 9.0 && z >= 24 && z <= 274 && (currentY === null || currentY >= -2.2)) {
            return 0.0;
        }

        // 4. West Sunken Catacombs & Deep Subterranean Mausoleum
        const inStairTrench = (x >= -25.2 && x <= -14.8 && z >= 3.5 && z <= 22.8);
        if (inStairTrench) {
            const t = Math.max(0, Math.min(1.0, (z - 4.0) / 18.0));
            return -t * 4.92;
        }

        // Flooded Subterranean Catacombs Corridor (z in [22, 268], x in [-25.5, -14.5])
        if (x >= -25.5 && x <= -14.5 && z > 22 && z <= 268 && (currentY === null || currentY < 0.5)) {
            return -4.92;
        }
        // Crypt Exit Ascent Ramp back to surface before Fog Gate (z in [268, 274], x in [-25.5, -14.5])
        if (x >= -25.5 && x <= -14.5 && z > 268 && z <= 274 && (currentY === null || currentY < 0.5)) {
            const t = (z - 268) / 6;
            return -4.92 + t * 4.92;
        }

        // 5. Serpent Sanctuary & Temple of the Gorgon (z in [-115, -30], x in [-38, 38])
        if (x >= -13 && x <= 13 && z >= -36.5 && z <= -29.5) {
            const t = Math.max(0, Math.min(1.0, (-30 - z) / 6.0));
            return -t * 2.5;
        }
        if (x >= -32 && x <= 32 && z >= -70 && z < -36.5) {
            return -2.5;
        }
        if (x >= -14 && x <= 14 && z >= -78 && z < -70) {
            const t = (-70 - z) / 8.0;
            return -2.5 - t * 1.5;
        }
        if (x >= -38 && x <= 38 && z >= -115 && z < -78) {
            return -4.0;
        }

        // 5b. Outside Realm & Extended Expeditions: x in [-265, -28], z in [-140, 140]
        if (x >= -265 && x <= -28 && z >= -140 && z <= 140) {
            // Carian Star Observatory (x in [-120, -90], z in [-100, -70])
            if (x >= -120 && x <= -90 && z >= -100 && z <= -70) {
                return 3.5;
            }
            // Scorched Dragonbarrow (x in [-225, -195], z in [45, 75])
            if (x >= -225 && x <= -195 && z >= 45 && z <= 75) {
                return 2.0;
            }
            // Forbidden Mistwood Ruins (x in [-80, -50], z in [-90, -60])
            if (x >= -80 && x <= -50 && z >= -90 && z <= -60) {
                return 0.0;
            }
            // Abyssal Eclipse Chasm (x in [-240, -210], z in [-50, -20])
            if (x >= -240 && x <= -210 && z >= -50 && z <= -20) {
                return -4.0;
            }
            // Frozen Wyrmpeak Precipice (x in [-255, -225], z in [0, 30])
            if (x >= -255 && x <= -225 && z >= 0 && z <= 30) {
                return 6.0;
            }
            // Stormveil Cliffside Ramparts (x in [-160, -130], z in [-110, -80])
            if (x >= -160 && x <= -130 && z >= -110 && z <= -80) {
                return 4.0;
            }
            // Astral Meteor Crater (x in [-175, -145], z in [-75, -45])
            if (x >= -175 && x <= -145 && z >= -75 && z <= -45) {
                return -2.5;
            }
            // Magma Chasm Falls (x in [-195, -165], z in [-35, -15])
            if (x >= -195 && x <= -165 && z >= -35 && z <= -15) {
                return -1.5;
            }
            // Sunken Dragon Crypt (x in [-195, -160], z in [5, 30])
            if (x >= -195 && x <= -160 && z >= 5 && z <= 30) {
                return -3.0;
            }
            // Wyrm Cliffside Plateau (x in [-185, -130], z in [32, 85])
            if (x >= -185 && x <= -130 && z >= 32 && z <= 85) {
                if (x > -140) {
                    const t = (-130 - x) / 10.0;
                    return t * 2.0;
                }
                return 2.0;
            }
            return 0.0;
        }

        // 6. Main Courtyard Starting Arena (z in [-55, 35], x in [-45, 45])
        if (x >= -45 && x <= 45 && z >= -55 && z <= 35) {
            if (!inStairTrench && (currentY === null || currentY >= -1.5)) {
                return 0.0;
            }
        }

        // 6b. Outside Realm: Primeval Darkroot Archtree Forest & Ashen Wilds (x in [-195, -28], z in [-90, 90])
        if (x >= -195.0 && x <= -28.0 && z >= -90.0 && z <= 90.0) {
            if (currentY === null || currentY >= -2.5) {
                return 0.0;
            }
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

        
        // --- 10 OUTSIDE LOCATIONS COLLISION ---
        if (x >= -75 && x <= -40 && z >= 35 && z <= 65) return -6.0; // Darkroot Basin (-6m)
        if (x >= 42 && x <= 68 && z >= 5 && z <= 35) return 12.0;    // Sen's Fortress (+12m)
        if (x >= -48 && x <= -22 && z >= 95 && z <= 125) return -9.0; // Demon Ruins (-9m)
        if (x >= 32 && x <= 58 && z >= 70 && z <= 100) return 4.0;   // Crystal Cave (+4m)
        if (x >= -68 && x <= -42 && z >= -58 && z <= -32) return 1.5; // Oolacile Glade (+1.5m)
        if (x >= -58 && x <= -32 && z >= -38 && z <= -12) return 0.0; // Majula Cliffs (0m)
        if (x >= 52 && x <= 78 && z >= 52 && z <= 78) return 14.0;   // Dragon Aerie (+14m)
        if (x >= 25 && x <= 50 && z >= -48 && z <= -22) return -2.5; // Cemetery of Ash (-2.5m)
        if (x >= 48 && x <= 72 && z >= -28 && z <= -2) return 2.0;   // Stormhill (+2m)

        // 8. Undead Burg Outskirts - Cliffside Dragon Chasm (x in [-75, -29], z in [-10, 45])
        if (x >= -75 && x <= -29 && z >= -10 && z <= 45) {
            if (x > -42) {
                const t = (-29 - x) / 13.0;
                return -t * 2.0;
            }
            return -2.0;
        }

        // 8. Citadel & Outside Realm Perimeter Failsafe: Never fall into void within explored grounds
        if ((x >= -38 && x <= 38 && z >= -35 && z <= 390) || (x >= -195 && x <= -28 && z >= -90 && z <= 90)) {
            if (currentY === null || currentY >= -1.8) {
                return (x <= -130 && x >= -185 && z >= 15 && z <= 80) ? 2.0 : 0.0;
            }
            return -4.92;
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

        // Protective Gothic Stone Balustrades flanking Center Promenade (prevents falling into side trenches)
        this.createWall(-15.0, 1.2, 17.0, 0.6, 2.4, 26); // West Promenade Balustrade
        this.createWall(15.0, 1.2, 17.0, 0.6, 2.4, 26);  // East Promenade Balustrade

        // Outer balustrades along West and East battlements
        this.createWall(-25.0, 1.2, 17.0, 0.6, 2.4, 26); // West Outer Balustrade
        this.createWall(25.0, 1.2, 17.0, 0.6, 2.4, 26);  // East Outer Balustrade

        // Corner abutments connecting promenade to Bridge portal (sealing gap at z=30)
        this.createWall(-11.0, 1.5, 30.0, 8.0, 3.0, 1.2);
        this.createWall(11.0, 1.5, 30.0, 8.0, 3.0, 1.2);

        // Outer Courtyard Fortress Walls (North Gate open at x in [-7, 7] for Serpent Sanctuary)
        this.createWall(-18.5, 5, -30, 23, 10, 2); // West segment of North wall (x: -30 to -7)
        this.createWall(18.5, 5, -30, 23, 10, 2);  // East segment of North wall (x: 7 to 30)
        this.createWall(0, 9.5, -30, 14, 3, 2);    // Overhead monumental arch lintel above doorway
        // Outer West Fortress Wall (Gate Arch open at z in [-7, 7] leading to OUTSIDE REALM)
        this.createWall(-30, 5, -18.5, 2, 10, 23); // North segment of West wall (z: -30 to -7)
        this.createWall(-30, 5, 18.5, 2, 10, 23);  // South segment of West wall (z: 7 to 30)
        this.createWall(-30, 9.5, 0, 2, 3, 14);    // Overhead monumental arch lintel above West Gate
        this.createPillar(-30, -7, 9);
        this.createPillar(-30, 7, 9);
        this.createTorch(-29.2, 5.0, -6.8, { intensity: 2.5, color: 0x2ecc71 });
        this.createTorch(-29.2, 5.0, 6.8, { intensity: 2.5, color: 0x2ecc71 });
        this.createPathBeacon(-28, 0, 0, 0x2ecc71, "🌲 OUTSIDE REALM: DARKROOT WOODS & CLIFFS [WEST]", "ANCIENT ARCHTREES • DRAGON CLIFFS • WYRMS & BASILISKS", "#a8ffb2");

        // West Gate In-World Portal to Outside Darkroot Bonfire
        this.interactables.push({
            type: 'route_portal',
            position: new THREE.Vector3(-26, 0, 0),
            radius: 4.5,
            prompt: '🌲 [ E ] WAYSTONE: WARP TO OUTSIDE DARKROOT EXPEDITION',
            targetPos: new THREE.Vector3(-75, 0, 0),
            label: 'DARKROOT OUTSIDE REALM'
        });

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
        // OUTSIDE LOCATION: UNDEAD BURG OUTSKIRTS - CLIFFSIDE DRAGON CHASM
        // Position: X in [-75, -30], Z in [-10, 45], Elevation: Y = -2.0m
        // ----------------------------------------------------
        // 1. Gateway Breach in West Fortress Wall (Archway at x=-30, z=18)
        const breachArchL = new THREE.Mesh(new THREE.BoxGeometry(2.4, 7.5, 1.6), this.wallMat);
        breachArchL.position.set(-30, 3.75, 12);
        this.scene.add(breachArchL);
        const breachArchR = new THREE.Mesh(new THREE.BoxGeometry(2.4, 7.5, 1.6), this.wallMat);
        breachArchR.position.set(-30, 3.75, 24);
        this.scene.add(breachArchR);
        const breachArchTop = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.0, 14), this.wallMat);
        breachArchTop.position.set(-30, 8.5, 18);
        this.scene.add(breachArchTop);

        // 2. Suspension Mountain Bridge over bottomless gorge (x: -30 to -42, z: 14 to 22)
        const bridgeSlab = new THREE.Mesh(new THREE.BoxGeometry(13, 0.6, 8.5), this.stoneMat);
        bridgeSlab.position.set(-36, -1.0, 18);
        bridgeSlab.rotation.z = Math.atan2(2.0, 13.0);
        bridgeSlab.receiveShadow = true;
        this.scene.add(bridgeSlab);

        // Bridge balustrades & chains
        const chainGeom = new THREE.CylinderGeometry(0.04, 0.04, 13.5, 8);
        const chainL = new THREE.Mesh(chainGeom, this.darkSteelMat);
        chainL.position.set(-36, 0.4, 14.1);
        chainL.rotation.z = Math.PI / 2 - Math.atan2(2.0, 13.0);
        this.scene.add(chainL);
        const chainR = new THREE.Mesh(chainGeom, this.darkSteelMat);
        chainR.position.set(-36, 0.4, 21.9);
        chainR.rotation.z = Math.PI / 2 - Math.atan2(2.0, 13.0);
        this.scene.add(chainR);

        // 3. Vast Mountain Cliffside Plateau Slab (x: -75 to -42, z: -10 to 45, y=-2.0)
        const plateauGeo = new THREE.BoxGeometry(34, 1.5, 56);
        const plateauMat = this.stoneMat.clone();
        const plateauMesh = new THREE.Mesh(plateauGeo, plateauMat);
        plateauMesh.position.set(-58.5, -2.75, 17.5);
        plateauMesh.receiveShadow = true;
        this.scene.add(plateauMesh);

        // 4. Perimeter Jagged Cliffs & Ancient Battlements along edge
        const cliffPosts = [
            [-74, -10], [-74, 5], [-74, 20], [-74, 35], [-74, 44],
            [-60, -9], [-45, -9],
            [-60, 44], [-45, 44]
        ];
        cliffPosts.forEach(([cx, cz]) => {
            const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 1), this.wallMat);
            rock.position.set(cx, -1.2, cz);
            rock.scale.set(1.2, 2.0, 1.2);
            rock.castShadow = true;
            this.scene.add(rock);
        });

        // 5. Standing Braziers & Torches at Outskirts Cliff
        this.createStandingBrazier(-52, -2.0, 6, 0xff5511, 4.2, 30);
        this.createStandingBrazier(-52, -2.0, 30, 0xff5511, 4.2, 30);
        this.createStandingBrazier(-70, -2.0, 18, 0xff7722, 4.5, 32);

        // 6. Colossal Ancient Dragon Skull Relic at cliff edge
        const dragonSkull = new THREE.Mesh(new THREE.ConeGeometry(2.5, 5.0, 5), this.boneMat || this.stoneMat);
        dragonSkull.position.set(-68, -0.5, 18);
        dragonSkull.rotation.z = Math.PI / 2 - 0.2;
        dragonSkull.rotation.y = -Math.PI / 2;
        dragonSkull.castShadow = true;
        this.scene.add(dragonSkull);

        // 7. Primal Outskirts Bonfire at (-55, -2.0, 18)
        this.createFloorSoapstone(-55, -2.0, 15, '#ff7722', "⛰️ UNDEAD BURG OUTSKIRTS", "Windswept dragon chasm beyond the fortress wall");

        // Interactive Portals between Courtyard & Outskirts
        this.interactables.push({
            type: 'route_portal',
            position: new THREE.Vector3(-28, 0, 18),
            radius: 5.0,
            prompt: '⛰️ [ E ] PASS TO BURG OUTSKIRTS (CLIFF CHASM: -2m)',
            targetPos: new THREE.Vector3(-52, -2.0, 18),
            label: 'UNDEAD BURG OUTSKIRTS'
        });

        this.interactables.push({
            type: 'route_portal',
            position: new THREE.Vector3(-45, -2.0, 18),
            radius: 5.0,
            prompt: '☀️ [ E ] RETURN TO FIRELINK COURTYARD (0m)',
            targetPos: new THREE.Vector3(0, 0, 0),
            label: 'FIRELINK COURTYARD'
        });

        
        // ----------------------------------------------------
        // BESPOKE UNIQUE 3D SCULPTED LANDMARKS FOR ALL REALMS
        // ----------------------------------------------------
        // 1. Ash Lake: Towering Ancient Archtree Trunk & White Quartz Shore ([-15, 0, -95])
        const archtreeTrunk = new THREE.Mesh(new THREE.CylinderGeometry(14, 22, 50, 16, 1, true), this.archtreeBarkMat || this.wallMat);
        archtreeTrunk.position.set(-15, 25, -95);
        this.scene.add(archtreeTrunk);
        const ashLakeSand = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 1.0, 24), new THREE.MeshStandardMaterial({ color: 0xeeece8, roughness: 0.95 }));
        ashLakeSand.position.set(-15, -0.5, -95);
        ashLakeSand.receiveShadow = true;
        this.scene.add(ashLakeSand);
        this.createStandingBrazier(-15, 0, -88, 0xffffff, 5.0, 36);
        this.createFloorSoapstone(-15, 0, -92, '#ffffff', "🌊 ASH LAKE", "Ancient Archtree rising into infinity");

        // 2. Chasm of the Abyss: Obsidian Monoliths & Humanity Sprites ([-40, -11, 130])
        const abyssFloor = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 1.2, 16), this.darkSteelMat || this.stoneMat);
        abyssFloor.position.set(-40, -11.6, 130);
        this.scene.add(abyssFloor);
        for (let i = 0; i < 6; i++) {
            const ang = (i / 6) * Math.PI * 2;
            const spire = new THREE.Mesh(new THREE.ConeGeometry(1.2, 8, 5), this.darkSteelMat || this.stoneMat);
            spire.position.set(-40 + Math.cos(ang) * 12, -7.0, 130 + Math.sin(ang) * 12);
            spire.castShadow = true;
            this.scene.add(spire);
        }
        const humanityOrb = new THREE.Mesh(new THREE.SphereGeometry(1.8, 12, 10), new THREE.MeshStandardMaterial({ color: 0x110218, emissive: 0x660088, roughness: 0.1 }));
        humanityOrb.position.set(-40, -6.0, 130);
        this.scene.add(humanityOrb);
        this.createStandingBrazier(-40, -11, 124, 0x8800ff, 4.5, 30);
        this.createFloorSoapstone(-40, -11, 128, '#aa00ff', "👁️ CHASM OF THE ABYSS", "Manus, Father of the Abyss");

        // 3. Lost Izalith: Searing Magma Lake & Chaos Tree Roots ([-48, -10, 150])
        const izalithLava = new THREE.Mesh(new THREE.PlaneGeometry(36, 36), new THREE.MeshStandardMaterial({ color: 0xff3300, emissive: 0xff4400, emissiveIntensity: 0.85, roughness: 0.2 }));
        izalithLava.rotation.x = -Math.PI / 2;
        izalithLava.position.set(-48, -10.2, 150);
        this.scene.add(izalithLava);
        const izalithDais = new THREE.Mesh(new THREE.CylinderGeometry(10, 12, 1.2, 8), this.darkSteelMat || this.stoneMat);
        izalithDais.position.set(-48, -9.6, 150);
        izalithDais.receiveShadow = true;
        this.scene.add(izalithDais);
        const chaosRoot = new THREE.Mesh(new THREE.TorusGeometry(8, 1.4, 8, 16, Math.PI), this.wallMat);
        chaosRoot.position.set(-48, -5, 156);
        chaosRoot.rotation.x = Math.PI / 2;
        this.scene.add(chaosRoot);
        this.createStandingBrazier(-48, -10, 144, 0xff2200, 5.5, 36);
        this.createFloorSoapstone(-48, -10, 148, '#ff3300', "🔥 LOST IZALITH", "Lava Throne of the Bed of Chaos");

        // 4. Crystal Cave: Giant Glinting Turquoise Crystal Spires ([45, 4, 85])
        const crystalPlat = new THREE.Mesh(new THREE.BoxGeometry(22, 1.2, 24), this.wallMat);
        crystalPlat.position.set(45, 3.4, 85);
        this.scene.add(crystalPlat);
        const crystalMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x0088aa, roughness: 0.1, metalness: 0.6 });
        for (let i = 0; i < 5; i++) {
            const crySpire = new THREE.Mesh(new THREE.ConeGeometry(1.6, 9, 6), crystalMat);
            crySpire.position.set(40 + i * 2.5, 7.0, 78 + (i % 3) * 5);
            crySpire.rotation.x = 0.35 * (i % 2 === 0 ? 1 : -1);
            crySpire.rotation.z = 0.35 * (i % 2 === 0 ? -1 : 1);
            this.scene.add(crySpire);
        }
        this.createStandingBrazier(45, 4, 78, 0x00f5ff, 4.5, 32);
        this.createFloorSoapstone(45, 4, 83, '#00ffff', "💎 CRYSTAL CAVE", "Glimmering prisms of Seath the Scaleless");

        // 5. Painted World of Ariamis: Snowy Gothic Battlements & Icicles ([32, 2, 145])
        const snowPlat = new THREE.Mesh(new THREE.BoxGeometry(24, 1.2, 26), new THREE.MeshStandardMaterial({ color: 0xdae6f0, roughness: 0.7 }));
        snowPlat.position.set(32, 1.4, 145);
        this.scene.add(snowPlat);
        const frostArch = new THREE.Mesh(new THREE.BoxGeometry(16, 8, 2), this.wallMat);
        frostArch.position.set(32, 6, 154);
        this.scene.add(frostArch);
        this.createStandingBrazier(32, 2, 138, 0xddf0ff, 4.0, 28);
        this.createFloorSoapstone(32, 2, 143, '#dae6f0', "❄️ PAINTED WORLD", "Crossbreed Priscilla's snowy refuge");

        // 6. Heide's Tower of Flame: Maritime White Marble Pier & Crashing Waves ([-38, 1, -60])
        const heidePier = new THREE.Mesh(new THREE.BoxGeometry(16, 1.2, 32), new THREE.MeshStandardMaterial({ color: 0xeeeeea, roughness: 0.4 }));
        heidePier.position.set(-38, 0.4, -60);
        this.scene.add(heidePier);
        for (let i = -1; i <= 1; i += 2) {
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 10, 12), this.wallMat);
            pillar.position.set(-38 + i * 6, 5.0, -50);
            this.scene.add(pillar);
        }
        this.createStandingBrazier(-38, 1, -68, 0x00e5ff, 4.5, 30);
        this.createFloorSoapstone(-38, 1, -64, '#77ddff', "🌊 HEIDE'S PIER", "Cathedral of Blue ocean causeway");

        // 7. Caelid / Sellia: Scarlet Rot Spore Forest ([-58, 2, 70])
        const rotGround = new THREE.Mesh(new THREE.BoxGeometry(26, 1.2, 26), new THREE.MeshStandardMaterial({ color: 0x440810, roughness: 0.8 }));
        rotGround.position.set(-58, 1.4, 70);
        this.scene.add(rotGround);
        const sporeTree = new THREE.Mesh(new THREE.SphereGeometry(3.5, 8, 8), new THREE.MeshStandardMaterial({ color: 0x881122, roughness: 0.6 }));
        sporeTree.position.set(-58, 6.0, 78);
        sporeTree.scale.set(1.2, 1.8, 1.2);
        this.scene.add(sporeTree);
        this.createStandingBrazier(-58, 2, 63, 0xff2244, 4.2, 30);
        this.createFloorSoapstone(-58, 2, 68, '#ff3355', "🥀 SELLIA & CAELID", "Town of Sorcery beneath the scarlet sky");

        // 8. Nokron Eternal City: Star-lit Celestial Colonnade ([22, -8, 120])
        const nokronPlat = new THREE.Mesh(new THREE.BoxGeometry(22, 1.2, 24), new THREE.MeshStandardMaterial({ color: 0x121424, roughness: 0.3 }));
        nokronPlat.position.set(22, -8.6, 120);
        this.scene.add(nokronPlat);
        const cosmicStar = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 1), new THREE.MeshStandardMaterial({ color: 0x88ccff, emissive: 0x2288ff, roughness: 0.1 }));
        cosmicStar.position.set(22, -3.0, 126);
        this.scene.add(cosmicStar);
        this.createStandingBrazier(22, -8, 114, 0x4488ff, 4.5, 32);
        this.createFloorSoapstone(22, -8, 118, '#88aaff', "🌌 NOKRON ETERNAL CITY", "Ancestral Woods under the false night sky");

        // 9. Iron Keep: Grated Bridge over Smelting Furnace ([42, 6.5, 115])
        const ironBridge = new THREE.Mesh(new THREE.BoxGeometry(14, 0.8, 30), this.darkSteelMat || this.stoneMat);
        ironBridge.position.set(42, 6.1, 115);
        this.scene.add(ironBridge);
        const smelterAnvil = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.5, 4), this.darkSteelMat || this.stoneMat);
        smelterAnvil.position.set(42, 7.75, 124);
        this.scene.add(smelterAnvil);
        this.createStandingBrazier(42, 6.5, 107, 0xff4400, 5.2, 34);
        this.createFloorSoapstone(42, 6.5, 112, '#ff6600', "🌋 IRON KEEP", "Smelter Demon furnace battlements");

        // 10. Hirata Estate: Japanese Crimson Torii Shrine ([-16, 3, -50])
        const hirataPlat = new THREE.Mesh(new THREE.BoxGeometry(20, 1.2, 22), this.woodMat || this.stoneMat);
        hirataPlat.position.set(-16, 2.4, -50);
        this.scene.add(hirataPlat);
        const toriiTop = new THREE.Mesh(new THREE.BoxGeometry(10, 0.8, 1.2), new THREE.MeshStandardMaterial({ color: 0xaa2211, roughness: 0.5 }));
        toriiTop.position.set(-16, 8.5, -44);
        this.scene.add(toriiTop);
        for (let i = -1; i <= 1; i += 2) {
            const toriiCol = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 6, 8), new THREE.MeshStandardMaterial({ color: 0xaa2211, roughness: 0.5 }));
            toriiCol.position.set(-16 + i * 3.8, 5.5, -44);
            this.scene.add(toriiCol);
        }
        this.createStandingBrazier(-16, 3, -56, 0xff7722, 4.5, 30);
        this.createFloorSoapstone(-16, 3, -52, '#ff6633', "⛩️ HIRATA ESTATE", "Burning bamboo courtyard of Lady Butterfly");

        // 11. Mountaintops of the Giants: Forge Cauldron Rim ([30, 16, 150])
        const forgeRim = new THREE.Mesh(new THREE.TorusGeometry(12, 1.8, 8, 20), this.darkSteelMat || this.stoneMat);
        forgeRim.position.set(30, 16.0, 150);
        forgeRim.rotation.x = Math.PI / 2;
        this.scene.add(forgeRim);
        const snowPeak = new THREE.Mesh(new THREE.CylinderGeometry(15, 17, 1.2, 16), new THREE.MeshStandardMaterial({ color: 0xdde8f2, roughness: 0.8 }));
        snowPeak.position.set(30, 15.4, 150);
        this.scene.add(snowPeak);
        this.createStandingBrazier(30, 16, 142, 0xff5511, 5.5, 36);
        this.createFloorSoapstone(30, 16, 147, '#ffccaa', "🏔️ FORGE OF GIANTS", "Eternal cauldron of the Flame of Ruin");

        // 12. Dragon Aerie: High Wyvern Needle Peak ([65, 14, 65])
        const aerieNeedle = new THREE.Mesh(new THREE.ConeGeometry(12, 14, 8), this.cliffRockMat || this.wallMat);
        aerieNeedle.position.set(65, 7.0, 65);
        this.scene.add(aerieNeedle);
        for (let i = 0; i < 3; i++) {
            const egg = new THREE.Mesh(new THREE.SphereGeometry(1.2, 10, 8), new THREE.MeshStandardMaterial({ color: 0xddccaa, roughness: 0.4 }));
            egg.position.set(63 + i * 1.8, 14.6, 62 + (i % 2) * 1.5);
            egg.scale.set(0.85, 1.3, 0.85);
            this.scene.add(egg);
        }
        this.createStandingBrazier(65, 14, 58, 0xffd700, 5.0, 32);
        this.createFloorSoapstone(65, 14, 62, '#ffd700', "🐉 DRAGON AERIE", "Sky nests of the ancient guardian wyverns");

        // 13. Altus Plateau / Leyndell: Golden Erdtree Promenade ([50, 8, -30])
        const altusPlat = new THREE.Mesh(new THREE.BoxGeometry(24, 1.2, 26), new THREE.MeshStandardMaterial({ color: 0xaa9050, roughness: 0.3, metalness: 0.3 }));
        altusPlat.position.set(50, 7.4, -30);
        this.scene.add(altusPlat);
        const erdtreeBanner = new THREE.Mesh(new THREE.BoxGeometry(0.2, 6, 3), new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0x886600 }));
        erdtreeBanner.position.set(50, 12, -22);
        this.scene.add(erdtreeBanner);
        this.createStandingBrazier(50, 8, -38, 0xffd700, 4.5, 32);
        this.createFloorSoapstone(50, 8, -34, '#ffd700', "👑 ALTUS PLATEAU", "Golden ramparts beneath the Erdtree");

        // 14. Shrine of Amana: Sunken Water Altar ([-50, -4, -80])
        const amanaWater = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x0a4048, transparent: true, opacity: 0.85, roughness: 0.1 }));
        amanaWater.rotation.x = -Math.PI / 2;
        amanaWater.position.set(-50, -3.95, -80);
        this.scene.add(amanaWater);
        const amanaStone = new THREE.Mesh(new THREE.BoxGeometry(20, 1.2, 22), this.stoneMat);
        amanaStone.position.set(-50, -4.6, -80);
        this.scene.add(amanaStone);
        this.createStandingBrazier(-50, -4, -88, 0x00ffcc, 4.2, 28);
        this.createFloorSoapstone(-50, -4, -84, '#00ffcc', "🎶 SHRINE OF AMANA", "Submerged singing water sanctuary");

        // 15. Cemetery of Ash: Untended Grave Ravine ([38, -2.5, -35])
        const ashRavine = new THREE.Mesh(new THREE.BoxGeometry(22, 1.2, 22), this.stoneMat);
        ashRavine.position.set(38, -3.1, -35);
        this.scene.add(ashRavine);
        for (let i = 0; i < 6; i++) {
            const stone = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.8, 0.4), this.wallMat);
            stone.position.set(34 + (i % 3) * 3, -1.6, -38 + Math.floor(i / 3) * 6);
            stone.rotation.z = 0.15 * (i % 2 === 0 ? 1 : -1);
            this.scene.add(stone);
        }
        this.createStandingBrazier(38, -2.5, -42, 0x999999, 3.8, 25);
        this.createFloorSoapstone(38, -2.5, -38, '#bbbbbb', "⚰️ CEMETERY OF ASH", "Graves of the Unkindled ash");

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
        // Extended 3-4x from 65m to 240 METERS! (z = 30 to z = 270)
        // ----------------------------------------------------
        const bridgeGeo = new THREE.BoxGeometry(14, 2, 240);
        const bridgeMat = this.stoneMat.clone();
        bridgeMat.map = bridgeMat.map.clone();
        bridgeMat.map.repeat.set(4, 60);
        if (bridgeMat.bumpMap) {
            bridgeMat.bumpMap = bridgeMat.bumpMap.clone();
            bridgeMat.bumpMap.repeat.set(4, 60);
        }
        if (bridgeMat.roughnessMap) {
            bridgeMat.roughnessMap = bridgeMat.roughnessMap.clone();
            bridgeMat.roughnessMap.repeat.set(4, 60);
        }
        const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
        bridge.position.set(0, -1, 150);
        bridge.receiveShadow = true;
        this.scene.add(bridge);

        // Bridge Parapets (prevent falling off)
        this.createWall(-7.5, 1.5, 150, 1, 3, 240); // Left rail
        this.createWall(7.5, 1.5, 150, 1, 3, 240);  // Right rail

        // Continuous Torches along both parapets of the Royal Bridge (Every 14m)
        for (let btz = 36; btz <= 264; btz += 14) {
            this.createTorch(-6.8, 2.8, btz, { intensity: 2.8, radius: 20 });
            this.createTorch(6.8, 2.8, btz, { intensity: 2.8, radius: 20 });
        }

        // Grand Standing Braziers at Bridge Portal, Causeway, and Gatehouses
        this.createStandingBrazier(-5.2, 0, 30, 0xff7722, 3.8, 28);
        this.createStandingBrazier(5.2, 0, 30, 0xff7722, 3.8, 28);

        // Mid-bridge Fortified Gatehouse Arch at z = 150
        const midArchL = new THREE.Mesh(new THREE.BoxGeometry(2.5, 12, 3), this.wallMat);
        midArchL.position.set(-6.5, 6, 150);
        this.scene.add(midArchL);
        const midArchR = new THREE.Mesh(new THREE.BoxGeometry(2.5, 12, 3), this.wallMat);
        midArchR.position.set(6.5, 6, 150);
        this.scene.add(midArchR);
        const midArchTop = new THREE.Mesh(new THREE.BoxGeometry(15.5, 3, 3), this.wallMat);
        midArchTop.position.set(0, 12.5, 150);
        this.scene.add(midArchTop);
        this.createStandingBrazier(-5.2, 0, 150, 0xffaa33, 4.2, 30);
        this.createStandingBrazier(5.2, 0, 150, 0xffaa33, 4.2, 30);

        this.createStandingBrazier(-5.2, 0, 268, 0xffaa33, 4.0, 30);
        this.createStandingBrazier(5.2, 0, 268, 0xffaa33, 4.0, 30);

        // ----------------------------------------------------
        // PATH 3: FLOODED SUBTERRANEAN CATACOMBS (DOWN: Y = -5.0)
        // Extended 3-4x from 68m to 248 METERS! (z = 22 to z = 270)
        // ----------------------------------------------------
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

        this.createWall(-24.6, 0.5, 13, 0.8, 6.0, 18);
        this.createWall(-15.4, 0.5, 13, 0.8, 6.0, 18);

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

        // Crypt Side Fortress Walls (z=22 to 270)
        this.createWall(-24.6, -2.0, 146, 1.2, 6.5, 248);
        this.createWall(-15.4, -2.0, 146, 1.2, 6.5, 248);

        // Flooded Crypt Corridor Vaulted Stone Ceiling (y=1.5, z=22 to 270)
        const cryptCeilGeo = new THREE.BoxGeometry(9.6, 0.8, 248);
        const cryptCeil = new THREE.Mesh(cryptCeilGeo, this.stoneMat);
        cryptCeil.position.set(-20, 1.5, 146);
        cryptCeil.receiveShadow = true;
        this.scene.add(cryptCeil);

        // Overhead Vaulted Stone Arches along the Crypt every 18m
        for (let caz = 32; caz <= 264; caz += 18) {
            const cryptArch = new THREE.Mesh(new THREE.BoxGeometry(8.8, 1.2, 1.2), this.wallMat);
            cryptArch.position.set(-20, 0.8, caz);
            cryptArch.castShadow = true;
            this.scene.add(cryptArch);

            // Emerald Ghostfire Braziers in Crypt
            this.createStandingBrazier(-18.5, -4.9, caz, 0x00ffaa, 2.5, 16);
        }

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
            targetPos: new THREE.Vector3(0, 0, 274),
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

        // DRAMATIC ILLUMINATED PATH BEACONS & ROUTE PORTALS
        // 1. In Central Courtyard Promenade (Safe, clear, fully accessible on surface flagstones at z = 18m)
        this.createPathBeacon(-6.5, 0, 18, 0x00ffaa, "💀 UNDERGROUND CATACOMBS [DOWN]", "LEVEL -5m • FLOODED CRYPTS & SKELETONS", "#a5ffbe");
        this.createPathBeacon(6.5, 0, 18, 0xffd700, "👑 HIGH CASTLE RAMPARTS [UP]", "LEVEL +6m • ARCHER WATCHTOWERS & BATTLEMENTS", "#fff3a8");
        // Flanking Bridge Waypoint (at bridge entrance parapet, keeping central doorway completely clear)
        this.createPathBeacon(-4.8, 0, 33, 0xff7722, "⚔️ ROYAL BRIDGE [WARP TO FOG GATE]", "LEVEL 0m • DIRECT PASSAGE TO TAURUS DEMON (240m)", "#ff9933");

        // 2. Return Portals from Inside the Flooded Subterranean Catacombs
        this.createPathBeacon(-20, -4.92, 32, 0xffd700, "☀️ SURFACE COURTYARD [UP]", "LEVEL 0m • RETURN TO FIRELINK COURTYARD", "#ffd700");
        this.createPathBeacon(-20, -4.92, 146, 0xffd700, "☀️ SURFACE COURTYARD [UP]", "LEVEL 0m • RETURN TO FIRELINK COURTYARD", "#ffd700");

        // 3. Return & Ascent Portals on High Castle Ramparts
        this.createPathBeacon(20, 6.0, 32, 0xffd700, "☀️ SURFACE COURTYARD [DOWN]", "LEVEL 0m • RETURN TO FIRELINK COURTYARD", "#ffd700");
        this.createPathBeacon(20, 6.0, 266, 0xff7722, "⚔️ DESCEND TO BOSS FOG GATE [DOWN]", "LEVEL 0m • DIRECT PASSAGE TO TAURUS DEMON", "#ff9933");

        // ----------------------------------------------------
        // 3. BOSS ARENA (BEYOND FOG GATE AT Z = 275 TO Z = 385)
        // Grand Colosseum Arena: 40m x 110m (Centered at z = 330)
        // ----------------------------------------------------
        const arenaGeo = new THREE.BoxGeometry(40, 2, 110);
        const arena = new THREE.Mesh(arenaGeo, this.arenaMat);
        arena.position.set(0, -1, 330);
        arena.receiveShadow = true;
        this.scene.add(arena);

        // Arena Boundaries
        this.createWall(-20.5, 6, 330, 2, 12, 110);    // West wall
        this.createWall(20.5, 6, 330, 2, 12, 110);     // East wall
        this.createWall(0, 6, 385, 43, 12, 2);         // Far North end of arena (locked throne gate)

        // South Containment Wall flanking Fog Gate (z = 272)
        this.createWall(-14.0, 6, 272, 14, 12, 2);
        this.createWall(14.0, 6, 272, 14, 12, 2);

        // 4 Colossal Corner Watchtowers in Boss Arena
        const arenaTowers = [
            [-18, 288], [18, 288],
            [-18, 372], [18, 372]
        ];
        arenaTowers.forEach(([tx, tz]) => {
            const towerGeo = new THREE.CylinderGeometry(4.2, 4.8, 18, 12);
            const tower = new THREE.Mesh(towerGeo, this.wallMat);
            tower.position.set(tx, 9, tz);
            tower.castShadow = true;
            tower.receiveShadow = true;
            this.scene.add(tower);

            this.createGoldenBrazier(tx, 18.5, tz);
            this.createSpotlight(tx, 18, tz, tx > 0 ? -1 : 1, -1, 0, 0xffaa44, 3.5, 45, 0.55);
        });

        // Perimeter Wall Torches along Boss Arena East & West Walls
        for (let az = 285; az <= 375; az += 15) {
            this.createTorch(-19.5, 4.5, az, { intensity: 3.2, radius: 25 });
            this.createTorch(19.5, 4.5, az, { intensity: 3.2, radius: 25 });
        }

        // Northern Throne Gate Braziers (at far end of Arena, z = 382)
        this.createStandingBrazier(-6.5, 0, 382, 0xff5500, 4.5, 30);
        this.createStandingBrazier(6.5, 0, 382, 0xff5500, 4.5, 30);
        
        // 4. North Path Beacon: Jade Serpent Beam & Serpentine Sanctum Banner (Flanking North Archway)
        this.createPathBeacon(-5.8, 0, -28.0, 0x1e824c, "🐍 GORGON'S SANCTUM & SERPENT RUINS [NORTH]", "SUNKEN TEMPLE • MEDUSA & COBRAS", "#2ecc71");

        // Build Massive Serpentine Sanctum, Outside Realm & Atmospheric Map Details
        this.buildSerpentSanctum();
        this.buildOutsideRealm();
        this.buildMapDetailEnhancements();
    }

    buildOutsideRealm() {
        const outsideGroup = new THREE.Group();

        // 1. Vast Forest Turf & Extended Outside Realm Ground Slab (x in [-265, -28], z in [-140, 140], y = 0.0)
        const outdoorFloorGeo = new THREE.PlaneGeometry(245, 285);
        const outdoorFloor = new THREE.Mesh(outdoorFloorGeo, this.forestGrassMat);
        outdoorFloor.rotation.x = -Math.PI / 2;
        outdoorFloor.position.set(-146, 0, 0);
        outdoorFloor.receiveShadow = true;
        outsideGroup.add(outdoorFloor);

        // 2. Cobblestone Trails Connecting Destinations
        // Main Way: West Gate (x = -30, z = 0) to Primeval Mother Archtree (x = -110, z = 0)
        const mainPathGeo = new THREE.PlaneGeometry(80, 5.0);
        const mainPath = new THREE.Mesh(mainPathGeo, this.stoneMat);
        mainPath.rotation.x = -Math.PI / 2;
        mainPath.position.set(-70, 0.02, 0);
        mainPath.receiveShadow = true;
        outsideGroup.add(mainPath);

        // Branching Trail South to Wyrm Ridge (x: -90 to -145, z: 0 to 45)
        const wyrmPathGeo = new THREE.PlaneGeometry(6, 65);
        const wyrmPath = new THREE.Mesh(wyrmPathGeo, this.stoneMat);
        wyrmPath.rotation.x = -Math.PI / 2;
        wyrmPath.rotation.z = -0.65;
        wyrmPath.position.set(-115, 0.02, 22);
        wyrmPath.receiveShadow = true;
        outsideGroup.add(wyrmPath);

        // Branching Trail North to Ashen Hollow (x: -90 to -135, z: 0 to -45)
        const ashenPathGeo = new THREE.PlaneGeometry(6, 60);
        const ashenPath = new THREE.Mesh(ashenPathGeo, this.stoneMat);
        ashenPath.rotation.x = -Math.PI / 2;
        ashenPath.rotation.z = 0.65;
        ashenPath.position.set(-110, 0.02, -22);
        ashenPath.receiveShadow = true;
        outsideGroup.add(ashenPath);

        // 3. Eight Majestic Archtrees with Colossal Gnarled Trunks & Canopies
        const createArchtree = (tx, tz, scale = 1.0, tint = 0x153520) => {
            const treeGroup = new THREE.Group();
            treeGroup.position.set(tx, 0, tz);

            // Tapered trunk
            const trunkGeo = new THREE.CylinderGeometry(1.4 * scale, 2.8 * scale, 22 * scale, 8);
            const trunk = new THREE.Mesh(trunkGeo, this.archtreeBarkMat);
            trunk.position.y = 11 * scale;
            trunk.castShadow = true;
            trunk.receiveShadow = true;
            treeGroup.add(trunk);

            // 4 Root flares radiating outward
            for (let a = 0; a < 4; a++) {
                const ang = (a / 4) * Math.PI * 2;
                const rootGeo = new THREE.CylinderGeometry(0.45 * scale, 1.2 * scale, 5 * scale, 5);
                const rootMesh = new THREE.Mesh(rootGeo, this.archtreeBarkMat);
                rootMesh.position.set(Math.cos(ang) * 2.4 * scale, 2.0 * scale, Math.sin(ang) * 2.4 * scale);
                rootMesh.rotation.z = Math.cos(ang) * 0.45;
                rootMesh.rotation.x = Math.sin(ang) * 0.45;
                rootMesh.castShadow = true;
                treeGroup.add(rootMesh);
            }

            // Canopy foliage clusters
            const folMat = new THREE.MeshStandardMaterial({ color: tint, roughness: 0.88, flatShading: true });
            const canopyOffsets = [
                [0, 22 * scale, 0, 5.5 * scale],
                [-3.2 * scale, 19 * scale, 2.5 * scale, 4.2 * scale],
                [3.5 * scale, 20 * scale, -2.8 * scale, 4.0 * scale],
                [2.2 * scale, 18 * scale, 3.2 * scale, 3.8 * scale],
                [-2.8 * scale, 20 * scale, -3.0 * scale, 4.2 * scale]
            ];
            canopyOffsets.forEach(([fx, fy, fz, fr]) => {
                const fol = new THREE.Mesh(new THREE.DodecahedronGeometry(fr, 1), folMat);
                fol.position.set(fx, fy, fz);
                fol.castShadow = true;
                fol.receiveShadow = true;
                treeGroup.add(fol);
            });

            this.scene.add(treeGroup);
            this.colliders.push(new THREE.Box3(
                new THREE.Vector3(tx - 2.0 * scale, 0, tz - 2.0 * scale),
                new THREE.Vector3(tx + 2.0 * scale, 24 * scale, tz + 2.0 * scale)
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
            targetPos: new THREE.Vector3(0, 0, 274),
            label: 'BOSS ARENA FOG GATE'
        });

        // 6. Wyrm Cliffside Plateau (x: -130 to -185, z: 15 to 80, y = 2.0)
        const plateauGeo = new THREE.BoxGeometry(55, 2.0, 65);
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
        const craterRim = new THREE.Mesh(new THREE.TorusGeometry(12.0, 1.8, 8, 16), this.cliffRockMat);
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
        const magmaPool = new THREE.Mesh(new THREE.BoxGeometry(16.0, 0.4, 14.0), this.demonLavaMat || this.stoneMat);
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
        const observatoryDais = new THREE.Mesh(new THREE.CylinderGeometry(14, 15, 3.5, 18), this.stoneMat);
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
        const barrowPlat = new THREE.Mesh(new THREE.BoxGeometry(32, 2.0, 32), this.cliffRockMat);
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

        // 8. Natural Mountain & Cliff Barriers Enclosing the Outside Realm (Expanded to 265m)
        // North mountain ridge: z = -140, x: -265 to -28
        this.createWall(-146, 8, -140, 242, 22, 6);
        // South mountain ridge: z = 140, x: -265 to -28
        this.createWall(-146, 8, 140, 242, 22, 6);
        // West boundary mountain: x = -265, z: -140 to 140
        this.createWall(-265, 10, 0, 6, 26, 285);

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

        this.scene.add(outsideGroup);
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

        // 3. Interactive Teleport Portal
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
            targetPos = new THREE.Vector3(0, 0, 272);
            promptText = `⚔️ [ E ] TELEPORT TO BOSS FOG GATE (240m)`;
        } else if (title.includes('BRIDGE') || title.includes('ROYAL')) {
            targetPos = new THREE.Vector3(0, 0, 272);
            promptText = `⚔️ [ E ] TELEPORT TO ROYAL BRIDGE FOG GATE (0m)`;
        }

        if (targetPos) {
            this.interactables.push({
                type: 'route_portal',
                position: new THREE.Vector3(x, y, z),
                radius: 4.8,
                prompt: promptText,
                targetPos: targetPos,
                label: title
            });
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

        fogGroup.position.set(0, 0, 272);
        this.scene.add(fogGroup);
        this.fogGateGroup = fogGroup;

        // Fog Gate Collision wall before traversing
        this.fogGateCollider = new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(0, 4.5, 272),
            new THREE.Vector3(12, 9, 2)
        );
        this.colliders.push(this.fogGateCollider);

        // Register interactable
        this.interactables.push({
            type: 'fog_gate',
            position: new THREE.Vector3(0, 1, 270),
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
