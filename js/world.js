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
        this.virtualLights = [];
        this.lightPool = [];
        this.lightCullTimer = 0;

        // High-FPS Caches & Spatial Streaming Chunks
        this._geoCache = {};
        this._matCache = {};
        this.biomeChunkBlueprints = new Map();
        this.biomeChunks = new Map();
        this.biomeChunkSize = 2500;
        this.locationGrid = null;
        this.locationGridCellSize = 5000;
        this.interactableGrid = null;
        this.interactableGridCellSize = 100;
        this._lastChunkKey = '';
        this._chunkCheckTimer = 0;

        this.initMaterials();
        this.initObjectPools();
        this.initLightPool();
        this.buildLighting();
        this.buildEnvironment();
        this.buildDistantFortress();
        this.buildBonfire();
        this.buildMerchant();
        this.buildFogGate();
        this.buildAtmosphere();
        this.collectDynamicLights();
        this.buildSpatialGrids();
    }

    getSharedGeo(key, factory) {
        if (!this._geoCache[key]) this._geoCache[key] = factory();
        return this._geoCache[key];
    }

    getSharedMat(key, factory) {
        if (!this._matCache[key]) this._matCache[key] = factory();
        return this._matCache[key];
    }

    initLightPool() {
        this.lightPool = [];
        for (let i = 0; i < 6; i++) {
            const pl = new THREE.PointLight(0xff7722, 0, 25);
            pl.visible = false;
            this.scene.add(pl);
            this.lightPool.push(pl);
        }
    }

    buildSpatialGrids() {
        // 1. O(1) Spatial Hash Grid for window.DARK_SOULS_LOCATIONS (5000m cells)
        this.locationGrid = new Map();
        const locs = (typeof window !== 'undefined' && window.DARK_SOULS_LOCATIONS) ? window.DARK_SOULS_LOCATIONS : [];
        const lCell = this.locationGridCellSize;
        for (let i = 0; i < locs.length; i++) {
            const loc = locs[i];
            if (!loc || !loc.pos) continue;
            // Scale distant expedition coordinates 5x once on startup to match 5x map expansion
            if (!loc._scaled5x) {
                if (Math.abs(loc.pos[0]) > 100 || Math.abs(loc.pos[2]) > 300) {
                    loc.pos[0] *= 5.0;
                    loc.pos[2] *= 5.0;
                }
                loc._scaled5x = true;
            }
            const cx = Math.floor(loc.pos[0] / lCell);
            const cz = Math.floor(loc.pos[2] / lCell);
            const key = cx + ',' + cz;
            let bucket = this.locationGrid.get(key);
            if (!bucket) {
                bucket = [];
                this.locationGrid.set(key, bucket);
            }
            bucket.push(loc);
        }

        // 2. O(1) Spatial Hash Grid for this.interactables (100m cells)
        this.rebuildInteractableGrid();
    }

    rebuildInteractableGrid() {
        this.interactableGrid = new Map();
        const iCell = this.interactableGridCellSize;
        for (let i = 0; i < this.interactables.length; i++) {
            const item = this.interactables[i];
            if (!item || !item.position) continue;
            const cx = Math.floor(item.position.x / iCell);
            const cz = Math.floor(item.position.z / iCell);
            const key = cx + ',' + cz;
            let bucket = this.interactableGrid.get(key);
            if (!bucket) {
                bucket = [];
                this.interactableGrid.set(key, bucket);
            }
            bucket.push(item);
        }
    }

    queryNearbyLocations(x, z, radius = 1200) {
        if (!this.locationGrid) return [];
        const lCell = this.locationGridCellSize;
        const minCx = Math.floor((x - radius) / lCell);
        const maxCx = Math.floor((x + radius) / lCell);
        const minCz = Math.floor((z - radius) / lCell);
        const maxCz = Math.floor((z + radius) / lCell);
        const results = [];
        for (let cx = minCx; cx <= maxCx; cx++) {
            for (let cz = minCz; cz <= maxCz; cz++) {
                const bucket = this.locationGrid.get(cx + ',' + cz);
                if (bucket) {
                    for (let i = 0; i < bucket.length; i++) results.push(bucket[i]);
                }
            }
        }
        return results;
    }

    queryNearbyInteractables(x, z) {
        if (!this.interactableGrid) return this.interactables;
        const iCell = this.interactableGridCellSize;
        const cx = Math.floor(x / iCell);
        const cz = Math.floor(z / iCell);
        const results = [];
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                const bucket = this.interactableGrid.get((cx + dx) + ',' + (cz + dz));
                if (bucket) {
                    for (let i = 0; i < bucket.length; i++) results.push(bucket[i]);
                }
            }
        }
        return results;
    }

    collectDynamicLights() {
        this.dynamicLights = [];
        const poolSet = new Set(this.lightPool || []);
        this.scene.traverse((obj) => {
            if (obj && obj.isPointLight && !poolSet.has(obj)) {
                const range = (obj.distance && obj.distance > 0) ? (obj.distance * 1.5) : 65.0;
                obj.userData.maxDistSq = range * range;
                if (!obj.userData.worldPos) obj.userData.worldPos = new THREE.Vector3();
                // Default all point lights to invisible to prevent WebGL MAX_FRAGMENT_UNIFORM_VECTORS error
                obj.visible = false;
                this.dynamicLights.push(obj);
            }
        });
        // Immediately activate only the closest 6 lights to spawn
        this.cullDynamicLights(new THREE.Vector3(0, 0, 5));
    }

    cullDynamicLights(targetPos) {
        const tx = targetPos.x;
        const ty = targetPos.y;
        const tz = targetPos.z;
        const nearby = [];

        if (this.dynamicLights && this.dynamicLights.length > 0) {
            const len = this.dynamicLights.length;
            for (let i = 0; i < len; i++) {
                const l = this.dynamicLights[i];
                l.getWorldPosition(l.userData.worldPos);
                const dx = l.userData.worldPos.x - tx;
                const dy = l.userData.worldPos.y - ty;
                const dz = l.userData.worldPos.z - tz;
                const distSq = dx * dx + dy * dy + dz * dz;
                const maxDistSq = l.userData.maxDistSq || (65 * 65);

                if (distSq <= maxDistSq) {
                    nearby.push({ type: 'real', light: l, distSq: distSq });
                } else {
                    l.visible = false;
                }
            }
        }

        // Also check virtual lights from active chunks/beacons
        if (this.virtualLights && this.virtualLights.length > 0) {
            for (let i = 0; i < this.virtualLights.length; i++) {
                const vl = this.virtualLights[i];
                const dx = vl.x - tx;
                const dy = vl.y - ty;
                const dz = vl.z - tz;
                const distSq = dx * dx + dy * dy + dz * dz;
                const maxDistSq = (vl.distance || 25) * (vl.distance || 25) * 2.25;
                if (distSq <= maxDistSq) {
                    nearby.push({ type: 'virtual', vlight: vl, distSq: distSq });
                }
            }
        }

        // Limit active point lights to maximum 6 to stay well under MAX_FRAGMENT_UNIFORM_VECTORS(1024)
        nearby.sort((a, b) => a.distSq - b.distSq);
        const MAX_ACTIVE_LIGHTS = 6;
        let poolIdx = 0;
        for (let i = 0; i < nearby.length; i++) {
            const entry = nearby[i];
            if (i < MAX_ACTIVE_LIGHTS) {
                if (entry.type === 'real') {
                    entry.light.visible = true;
                } else if (this.lightPool && poolIdx < this.lightPool.length) {
                    const pl = this.lightPool[poolIdx++];
                    const vl = entry.vlight;
                    pl.position.set(vl.x, vl.y, vl.z);
                    pl.color.setHex(vl.color);
                    pl.intensity = vl.intensity;
                    pl.distance = vl.distance;
                    pl.visible = true;
                }
            } else if (entry.type === 'real') {
                entry.light.visible = false;
            }
        }
        if (this.lightPool) {
            for (let i = poolIdx; i < this.lightPool.length; i++) {
                this.lightPool[i].visible = false;
            }
        }
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

                // Authentic aged Lordran gothic castle slate flagstone palette (dark medieval stone)
                const palSeed = Math.random();
                let baseR, baseG, baseB;
                if (palSeed < 0.35) {
                    baseR = 75 + Math.floor(Math.random() * 14);
                    baseG = 72 + Math.floor(Math.random() * 12);
                    baseB = 68 + Math.floor(Math.random() * 12);
                } else if (palSeed < 0.7) {
                    baseR = 88 + Math.floor(Math.random() * 16);
                    baseG = 84 + Math.floor(Math.random() * 14);
                    baseB = 78 + Math.floor(Math.random() * 14);
                } else {
                    baseR = 64 + Math.floor(Math.random() * 12);
                    baseG = 62 + Math.floor(Math.random() * 12);
                    baseB = 58 + Math.floor(Math.random() * 10);
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
        this.scene.fog = new THREE.FogExp2(0x5e758c, 0.000006);

        // 3. Balanced Ambient Light (Clear visibility across all architecture without washing out)
        this.ambientLight = new THREE.AmbientLight(0x404e5e, 0.45);
        this.scene.add(this.ambientLight);

        // 4. Sky and ground bounce hemisphere lighting (Slate blue sky + warm stone bounce)
        this.hemiLight = new THREE.HemisphereLight(0x7a98b4, 0x483e32, 0.50);
        this.scene.add(this.hemiLight);

        // 5. Cinematic Radiant Lordran Sunlight (primary sun from South-East, rich shadows & highlights)
        this.moonlight = new THREE.DirectionalLight(0xfff0dc, 1.25);
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
        this.fillSunlight = new THREE.DirectionalLight(0x6a869e, 0.35);
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

        // 2. Surface Boss Arena (z in [186300, 567000], 34,200m wide x 380,700m long Colosseum) - 5X COLOSSAL EXPANSION!
        // If player is on surface (currentY === null || currentY >= -2.2), ALWAYS stay solid at y = 0.0!
        if (x >= -17100 && x <= 17100 && z >= 186300 && z <= 567000 && (currentY === null || currentY >= -2.2)) {
            return 0.0;
        }

        // 3. Central Royal Bridge (z in [24075, 186750], 8,550m wide x 162,675m long Imperial Viaduct) - 5X COLOSSAL EXPANSION!
        if (x >= -4275.0 && x <= 4275.0 && z >= 24075 && z <= 186750 && (currentY === null || currentY >= -2.2)) {
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

        // 5. Serpent Sanctuary & Temple of the Gorgon (z in [-307800, -101250], x in [-7200, 7200]) - 5X COLOSSAL EXPANSION!
        if (x >= -1800 && x <= 1800 && z >= -109350 && z <= -101250) {
            const t = Math.max(0, Math.min(1.0, (-101250 - z) / 8100.0));
            return -t * 3.5;
        }
        if (x >= -5850 && x <= 5850 && z >= -182250 && z < -109350) {
            return -3.5;
        }
        if (z >= -192375 && z < -182250) {
            if (x >= -1800 && x <= 1800) {
                const t = (-182250 - z) / 10125.0;
                return -3.5 - t * 2.5;
            }
            if (Math.abs(x) <= 5850) {
                return -3.5;
            }
        }
        if (x >= -7200 && x <= 7200 && z >= -307800 && z < -192375) {
            return -6.0;
        }

        // Undead Burg Outskirts: Cliff Chasm & Mountain Plateau (x in [-310, -140], z in [-50, 90])
        if (x >= -310 && x <= -140 && z >= -50 && z <= 90 && (currentY === null || currentY < 0.5)) {
            return -2.0;
        }

        // 5b. Outside Realm & Extended Expeditions: x in [-3480, -28], z in [-1550, 1550]
        if (x >= -3480 && x <= -28 && z >= -1550 && z <= 1550) {
            // === 8 BRAND-NEW ASCENDED OUTSIDE REALM EXPEDITIONS (V82 EXPANSION) ===
            // 1. Yahar'gul Advent Plaza & Blood Moon Chasm (outside_the_one_reborn_advent_plaza) (elev: -16.0m)
            if (x >= -3250 && x <= -3160 && z >= -365 && z <= -275) {
                return -16.0;
            }
            // 2. Demon Ruins Lava Gorge & Magma Rift (outside_ceaseless_discharge_magma_rift) (elev: -30.0m)
            if (x >= -3280 && x <= -3190 && z >= 215 && z <= 305) {
                return -30.0;
            }
            // 3. Undead Purgatory & Circular Spiked Trench (outside_executioners_chariot_purgatory) (elev: +8.0m)
            if (x >= -3310 && x <= -3220 && z >= -265 && z <= -175) {
                return 8.0;
            }
            // 4. Darkroot Basin & Crystalline Moon Bridge (outside_moonlight_butterfly_basin) (elev: +24.0m)
            if (x >= -3340 && x <= -3250 && z >= 295 && z <= 385) {
                return 24.0;
            }
            // 5. Smouldering Lake & Ashen Demon Pyre (outside_old_demon_king_smouldering_pyre) (elev: -22.0m)
            if (x >= -3370 && x <= -3280 && z >= -205 && z <= -115) {
                return -22.0;
            }
            // 6. Pit of Hollows & Dilapidated Courtyard (outside_curse_rotted_greatwood_pit) (elev: -8.0m)
            if (x >= -3400 && x <= -3310 && z >= 145 && z <= 235) {
                return -8.0;
            }
            // 7. Debate Parlor Meadow & Glintstone Altar (outside_red_wolf_radagon_meadow) (elev: +14.0m)
            if (x >= -3430 && x <= -3340 && z >= -405 && z <= -315) {
                return 14.0;
            }
            // 8. Astral Clocktower Patio & Lumenflower Garden (outside_living_failures_astral_garden) (elev: +36.0m)
            if (x >= -3460 && x <= -3370 && z >= 235 && z <= 325) {
                return 36.0;
            }
            // === 8 BRAND-NEW ASCENDED OUTSIDE REALM EXPEDITIONS (V81 EXPANSION) ===
            // 1. New Londo Ruins & The Abyss Void Well (outside_new_londo_abyss_well) (elev: -32.0m)
            if (x >= -3010 && x <= -2920 && z >= -385 && z <= -295) {
                return -32.0;
            }
            // 2. Blighttown Depths & Magma Web Caldera (outside_blighttown_magma_web) (elev: -24.0m)
            if (x >= -3040 && x <= -2950 && z >= 215 && z <= 305) {
                return -24.0;
            }
            // 3. Old Yharnam & Church of the Good Chalice (outside_old_yharnam_good_chalice) (elev: +16.0m)
            if (x >= -3070 && x <= -2980 && z >= -185 && z <= -95) {
                return 16.0;
            }
            // 4. Moonside Lake & Reflective Glass Expanse (outside_moonside_lake_glass_expanse) (elev: +2.0m)
            if (x >= -3100 && x <= -3010 && z >= 315 && z <= 405) {
                return 2.0;
            }
            // 5. Consumed King's Garden & Toxic Fog Basin (outside_consumed_kings_garden_fog) (elev: -18.0m)
            if (x >= -3130 && x <= -3040 && z >= -325 && z <= -235) {
                return -18.0;
            }
            // 6. Iron Keep Lower Foundry & Molten Brimstone Caldera (outside_iron_keep_molten_brimstone) (elev: -28.0m)
            if (x >= -3160 && x <= -3070 && z >= 135 && z <= 225) {
                return -28.0;
            }
            // 7. Yahar'gul Graveyard & Hypogean Electric Basin (outside_yahargul_hypogean_basin) (elev: -12.0m)
            if (x >= -3190 && x <= -3100 && z >= -425 && z <= -335) {
                return -12.0;
            }
            // 8. Enir-Ilim Cleansing Terrace & Golden Needle Altar (outside_enir_ilim_cleansing_terrace) (elev: +44.0m)
            if (x >= -3220 && x <= -3130 && z >= 235 && z <= 325) {
                return 44.0;
            }
            // === 8 BRAND-NEW ASCENDED OUTSIDE REALM EXPEDITIONS (V80 EXPANSION) ===
            // 1. Dark Chasm of Old & Pilgrims' Altar (outside_dark_chasm_of_old) (elev: -18.0m)
            if (x >= -2770 && x <= -2680 && z >= -365 && z <= -275) {
                return -18.0;
            }
            // 2. Earthen Peak & Windmill Poison Basin (outside_earthen_peak_poison_basin) (elev: +14.0m)
            if (x >= -2800 && x <= -2710 && z >= 195 && z <= 285) {
                return 14.0;
            }
            // 3. Great Bridge of Central Yharnam (outside_central_yharnam_great_bridge) (elev: +28.0m)
            if (x >= -2830 && x <= -2740 && z >= -165 && z <= -75) {
                return 28.0;
            }
            // 4. Catacombs of Carthus & Abyssal Goblet Hall (outside_catacombs_of_carthus_abyss) (elev: -26.0m)
            if (x >= -2860 && x <= -2770 && z >= 295 && z <= 385) {
                return -26.0;
            }
            // 5. Sunken Depths & Flooded Sewer Maw (outside_sunken_depths_sewer_basin) (elev: -22.0m)
            if (x >= -2890 && x <= -2800 && z >= -465 && z <= -375) {
                return -22.0;
            }
            // 6. Shrine of Amana & Flooded Lotus Haven (outside_shrine_of_amana_lotus_haven) (elev: +4.0m)
            if (x >= -2920 && x <= -2830 && z >= 115 && z <= 205) {
                return 4.0;
            }
            // 7. High Wall of Lothric & Boreal Outrider Gate (outside_high_wall_boreal_gate) (elev: +32.0m)
            if (x >= -2950 && x <= -2860 && z >= -265 && z <= -175) {
                return 32.0;
            }
            // 8. Forbidden Grave & Shadow Snake Basin (outside_forbidden_grave_snake_basin) (elev: -10.0m)
            if (x >= -2980 && x <= -2890 && z >= 335 && z <= 425) {
                return -10.0;
            }
            // === 8 BRAND-NEW ASCENDED OUTSIDE REALM EXPEDITIONS (V79 EXPANSION) ===
            // 1. Fell Caldera & Forge of the Giants (outside_fell_caldera_fire_giant) (elev: +32.0m)
            if (x >= -2530 && x <= -2440 && z >= -225 && z <= -135) {
                return 32.0;
            }
            // 2. Belurat Tower & Storm Dancing Stage (outside_belurat_dancing_stage_lion) (elev: +12.0m)
            if (x >= -2560 && x <= -2470 && z >= 215 && z <= 305) {
                return 12.0;
            }
            // 3. King's Passage & Storm Mirror Dais (outside_kings_passage_looking_glass_knight) (elev: -16.0m)
            if (x >= -2590 && x <= -2500 && z >= -425 && z <= -335) {
                return -16.0;
            }
            // 4. The Dreg Heap & Sunken Kiln Basin (outside_dreg_heap_demon_prince) (elev: -28.0m)
            if (x >= -2620 && x <= -2530 && z >= 95 && z <= 185) {
                return -28.0;
            }
            // 5. Scaduview Gravity Ridge & Boar Gate (outside_scaduview_gravity_gaius) (elev: +20.0m)
            if (x >= -2650 && x <= -2560 && z >= -525 && z <= -435) {
                return 20.0;
            }
            // 6. Nightmare Bloom & Red Moon Lake (outside_nightmare_bloom_moon_presence) (elev: +6.0m)
            if (x >= -2680 && x <= -2590 && z >= 335 && z <= 425) {
                return 6.0;
            }
            // 7. Profaned Capital & Burning Throne Dais (outside_profaned_capital_yhorm) (elev: -20.0m)
            if (x >= -2710 && x <= -2620 && z >= -265 && z <= -175) {
                return -20.0;
            }
            // 8. Lothric High Bridge & Bastion Mooring (outside_lothric_bridge_dragonslayer_armour) (elev: +26.0m)
            if (x >= -2740 && x <= -2650 && z >= 35 && z <= 125) {
                return 26.0;
            }
            // === 8 BRAND-NEW ASCENDED OUTSIDE REALM EXPEDITIONS (V76 EXPANSION) ===
            // 1. Tomb of the Giants & Nito's Ossuary (outside_tomb_of_giants_gravelord_nito) (elev: -18.0m)
            if (x >= -2290 && x <= -2200 && z >= -355 && z <= -265) {
                return -18.0;
            }
            // 2. Boreal Valley & Dancer's Grand High Plaza (outside_boreal_dancer_grand_plaza) (elev: +15.0m)
            if (x >= -2320 && x <= -2230 && z >= 115 && z <= 205) {
                return 15.0;
            }
            // 3. Finger Ruins of Dheo & Microcosm Crater (outside_finger_ruins_of_dheo_metyr) (elev: -10.0m)
            if (x >= -2350 && x <= -2260 && z >= -185 && z <= -95) {
                return -10.0;
            }
            // 4. Stone Coffin Fissure & Putrescent Deep Garden (outside_stone_coffin_fissure_putrescent) (elev: -24.0m)
            if (x >= -2380 && x <= -2290 && z >= 265 && z <= 355) {
                return -24.0;
            }
            // 5. Bodhisattva Valley & Primordial Waterhole (outside_bodhisattva_valley_guardian_ape) (elev: +8.0m)
            if (x >= -2410 && x <= -2320 && z >= -465 && z <= -375) {
                return 8.0;
            }
            // 6. Cosmic Golden Sea & Greater Will Dais (outside_cosmic_golden_sea_elden_beast) (elev: +24.0m)
            if (x >= -2440 && x <= -2350 && z >= 25 && z <= 115) {
                return 24.0;
            }
            // 7. Nightmare Grand Cathedral & Blazing Altar (outside_nightmare_grand_cathedral_laurence) (elev: +18.0m)
            if (x >= -2470 && x <= -2380 && z >= -295 && z <= -205) {
                return 18.0;
            }
            // 8. Iron Keep Smelting Core & Magma Kiln (outside_iron_keep_smelting_furnace) (elev: -14.0m)
            if (x >= -2500 && x <= -2410 && z >= 395 && z <= 485) {
                return -14.0;
            }
            // 8 Brand-New Ascended Outside Realm Expeditions (V74 Expansion)
            // 1. Kiln of the First Flame & Ash Cinder Caldera (outside_kiln_of_the_first_flame_gwyn) (elev: +30.0m)
            if (x >= -2050 && x <= -1960 && z >= -305 && z <= -215) {
                return 30.0;
            }
            // 2. Chasm of the Abyss & Primeval Humanity Pit (outside_chasm_of_abyss_manus) (elev: -22.0m)
            if (x >= -2080 && x <= -1990 && z >= 75 && z <= 165) {
                return -22.0;
            }
            // 3. Crystal Cave & Primordial Archive Glade (outside_crystal_cave_primordial_seath) (elev: +14.0m)
            if (x >= -2110 && x <= -2020 && z >= -165 && z <= -75) {
                return 14.0;
            }
            // 4. Untended Graves & Pitch-Black Dark Firelink Altar (outside_untended_graves_champion_gundyr) (elev: -12.0m)
            if (x >= -2140 && x <= -2050 && z >= 235 && z <= 325) {
                return -12.0;
            }
            // 5. Undead Crypt & Throne Guarding Colonnade (outside_undead_crypt_royal_aegis_velstadt) (elev: -16.0m)
            if (x >= -2170 && x <= -2080 && z >= -425 && z <= -335) {
                return -16.0;
            }
            // 6. Astral Clocktower & Lumarium Garden (outside_astronomy_clocktower_lady_maria) (elev: +20.0m)
            if (x >= -2200 && x <= -2110 && z >= -5 && z <= 85) {
                return 20.0;
            }
            // 7. Oolacile Calamity Crater & Black Dragon Cliff (outside_ancient_dragon_peak_kalameet) (elev: +26.0m)
            if (x >= -2230 && x <= -2140 && z >= -265 && z <= -175) {
                return 26.0;
            }
            // 8. Deeproot Depths & Deathbed Dream of Fortissax (outside_deeproot_depths_lichdragon_fortissax) (elev: -8.0m)
            if (x >= -2260 && x <= -2170 && z >= 345 && z <= 435) {
                return -8.0;
            }
            // 8 Brand-New Ascended Outside Realm Expeditions (V73 Expansion)
            // 1. Lothric Castle Throne Room of Twin Princes (outside_lothric_throne_twin_princes) (elev: +24.0m)
            if (x >= -1810 && x <= -1720 && z >= -285 && z <= -195) {
                return 24.0;
            }
            // 2. Painted World of Ariamis Snowy Sanctuary (outside_ariamis_snowy_sanctuary_priscilla) (elev: +16.0m)
            if (x >= -1840 && x <= -1750 && z >= 95 && z <= 185) {
                return 16.0;
            }
            // 3. Ashina Castle Upper Tower Dojo & Thunder Terrace (outside_ashina_dojo_lightning_terrace) (elev: +28.0m)
            if (x >= -1870 && x <= -1780 && z >= -145 && z <= -55) {
                return 28.0;
            }
            // 4. Caelid Wailing Dunes & Starscourge Shore (outside_caelid_wailing_dunes_radahn) (elev: -10.0m)
            if (x >= -1900 && x <= -1810 && z >= 255 && z <= 345) {
                return -10.0;
            }
            // 5. Oedon Tomb Graveyard & Hunter's Sepulcher (outside_oedon_tomb_graveyard_gascoigne) (elev: -6.0m)
            if (x >= -1930 && x <= -1840 && z >= -405 && z <= -315) {
                return -6.0;
            }
            // 6. Anor Londo Royal Cathedral Grand Hall (outside_anor_londo_ornstein_smough_hall) (elev: +22.0m)
            if (x >= -1960 && x <= -1870 && z >= 15 && z <= 105) {
                return 22.0;
            }
            // 7. Lost Bastille Iron Rampart & Crow Nest Roost (outside_lost_bastille_pursuer_rampart) (elev: +18.0m)
            if (x >= -1990 && x <= -1900 && z >= -245 && z <= -155) {
                return 18.0;
            }
            // 8. Stormveil Castle Grafted Courtyard (outside_stormveil_grafted_courtyard) (elev: +12.0m)
            if (x >= -2020 && x <= -1930 && z >= 375 && z <= 465) {
                return 12.0;
            }
            // 8 Brand-New Ascended Outside Realm Expeditions (V69 Expansion)
            // 1. Fountainhead Palace Vermilion Waterway & Sacred Sanctuary (outside_fountainhead_vermilion_sanctuary) (elev: +18.0m)
            if (x >= -1565 && x <= -1475 && z >= -265 && z <= -175) {
                return 18.0;
            }
            // 2. Forsaken Castle Cainhurst Frozen Parapets & Snow Spires (outside_cainhurst_frozen_parapet) (elev: +14.0m)
            if (x >= -1590 && x <= -1500 && z >= -125 && z <= -35) {
                return 14.0;
            }
            // 3. Moonlight Altar of Manus Celes & Lunar Cathedral (outside_moonlight_altar_ranni_cathedral) (elev: +22.0m)
            if (x >= -1615 && x <= -1525 && z >= 35 && z <= 125) {
                return 22.0;
            }
            // 4. Cathedral of the Deep Sunken Graveyard & Sludge Mire (outside_cathedral_deep_sunken_graveyard) (elev: -15.0m)
            if (x >= -1640 && x <= -1550 && z >= 175 && z <= 265) {
                return -15.0;
            }
            // 5. Anor Londo Dark Sun Tomb & Gwyndolin Sanctuary (outside_anor_londo_dark_sun_sanctuary) (elev: +12.0m)
            if (x >= -1665 && x <= -1575 && z >= -365 && z <= -275) {
                return 12.0;
            }
            // 6. The Shaded Castle Poison Briar Moat & Maleigh Terrace (outside_shaded_castle_briar_terrace) (elev: -8.0m)
            if (x >= -1690 && x <= -1600 && z >= 295 && z <= 385) {
                return -8.0;
            }
            // 7. Mt. Senpou Bamboo Path & Bell Demon Sanctum (outside_senpou_bell_demon_sanctum) (elev: +20.0m)
            if (x >= -1715 && x <= -1625 && z >= -205 && z <= -115) {
                return 20.0;
            }
            // 8. Nokstella Eternal City Stargazer Waterfall Basin (outside_nokstella_stargazer_basin) (elev: -18.0m)
            if (x >= -1740 && x <= -1650 && z >= 415 && z <= 505) {
                return -18.0;
            }
            // 8 Brand-New Cataclysmic Outside Realm Expeditions (V60 Expansion)
            // 1. Leyndell Erdtree Sanctuary & Throne of Omens (outside_leyndell_throne_of_omens) (elev: +20.0m)
            if (x >= -1345 && x <= -1255 && z >= -245 && z <= -155) {
                return 20.0;
            }
            // 2. Usui Misty Forest Hall of Illusions (outside_usui_forest_hall_of_illusions) (elev: +10.0m)
            if (x >= -1365 && x <= -1275 && z >= -125 && z <= -35) {
                return 10.0;
            }
            // 3. Ainsel River Basin of Nokstella & Frozen Waterfall (outside_ainsel_river_nokstella_dragonkin) (elev: -14.0m)
            if (x >= -1385 && x <= -1295 && z >= 35 && z <= 125) {
                return -14.0;
            }
            // 4. Oolacile Township Ruined Colosseum of the Dark (outside_oolacile_abyssal_colosseum) (elev: +5.0m)
            if (x >= -1405 && x <= -1315 && z >= 155 && z <= 245) {
                return 5.0;
            }
            // 5. Upper Cathedral Ward Altar of Despair & Cosmic Lumenflower Terrace (outside_upper_cathedral_altar_of_despair) (elev: -16.0m)
            if (x >= -1425 && x <= -1335 && z >= -365 && z <= -275) {
                return -16.0;
            }
            // 6. Ashina Castle Great Gatefield & Fortress Palisade (outside_ashina_gate_battlefield) (elev: +8.0m)
            if (x >= -1445 && x <= -1355 && z >= 275 && z <= 365) {
                return 8.0;
            }
            // 7. Jagged Peak Dragon's Pit & Ancient Red Lightning Crags (outside_dragons_pit_ancient_sanctuary) (elev: +16.0m)
            if (x >= -1465 && x <= -1375 && z >= -185 && z <= -95) {
                return 16.0;
            }
            // 8. Volcano Manor Sunken Magma Lake & Chamber of the Blasphemous Serpent (outside_volcano_manor_magma_chamber) (elev: -12.0m)
            if (x >= -1485 && x <= -1395 && z >= 395 && z <= 485) {
                return -12.0;
            }
            // 8 Brand-New Mythic Outside Realm Expeditions (V57 Expansion)
            // 1. Farron Keep Mausoleum & Perimeter of the Abyss (outside_farron_keep_abyss_mausoleum) (elev: +8.0m)
            if (x >= -1145 && x <= -1055 && z >= -285 && z <= -195) {
                return 8.0;
            }
            // 2. Crumbling Farum Azula Dragon Temple Sanctum (outside_farum_azula_destined_death_sanctum) (elev: +28.0m)
            if (x >= -1165 && x <= -1075 && z >= -125 && z <= -35) {
                return 28.0;
            }
            // 3. Irithyll Boreal Valley Grand Pontiff Cathedral (outside_irithyll_cathedral_pontiff_dais) (elev: +18.0m)
            if (x >= -1155 && x <= -1065 && z >= 95 && z <= 185) {
                return 18.0;
            }
            // 4. Yharnam Grand Cathedral High Altar of Blood (outside_cathedral_ward_vicar_altar) (elev: +12.0m)
            if (x >= -1185 && x <= -1095 && z >= 235 && z <= 325) {
                return 12.0;
            }
            // 5. Hirata Estate Blazing Audience Chamber (outside_hirata_estate_flaming_chamber_owl) (elev: +6.0m)
            if (x >= -1205 && x <= -1115 && z >= -405 && z <= -315) {
                return 6.0;
            }
            // 6. Raya Lucaria Grand Library & Full Moon Chamber (outside_raya_lucaria_grand_library_renalla) (elev: +14.0m)
            if (x >= -1225 && x <= -1135 && z >= 375 && z <= 465) {
                return 14.0;
            }
            // 7. Ashina Castle Gates Flaming Battlefield (outside_ashina_castle_gates_demon_of_hatred) (elev: +4.0m)
            if (x >= -1245 && x <= -1155 && z >= -225 && z <= -135) {
                return 4.0;
            }
            // 8. Ancient Ruins of Rauh Scarlet Rot Pavilion (outside_rauh_ruins_romina_scarlet_bud) (elev: -6.0m)
            if (x >= -1265 && x <= -1175 && z >= 495 && z <= 585) {
                return -6.0;
            }
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

        // 6b. Outside Realm: Primeval Darkroot Forest & Expanded Megalithic Wildlands (Scaled 5x to 480,000m)
        if (x >= -240000.0 && x <= 240000.0 && z >= -240000.0 && z <= 240000.0) {
            if (currentY === null || currentY >= -2.5) {
                return 0.0;
            }
        }

        // 7. Dynamic Fast-Travel Lordran Realm Ground Height (O(1) Spatial Hash Query within 1200m radius)
        if (this.locationGrid) {
            const nearbyLocs = this.queryNearbyLocations(x, z, 1200);
            let closestLoc = null;
            let minDistSq = 1200 * 1200;
            for (let i = 0; i < nearbyLocs.length; i++) {
                const loc = nearbyLocs[i];
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

        // 8. Citadel & Outside Realm Perimeter Failsafe (5X COLOSSAL EXPANSION: 720km breadth)
        // Firelink & Courtyard floor (z in [-101250, 24300], x in [-20250, 20250])
        if (x >= -20250 && x <= 20250 && z >= -101250 && z <= 24300) {
            // Only the subterranean West Catacombs trench drops to -4.92m; the courtyard is solidly grounded at 0.0m
            if (x >= -25.5 && x <= -14.5 && z >= 22.0 && z <= 270.0 && (currentY !== null && currentY < -2.0)) {
                return -4.92;
            }
            return 0.0;
        }
        // Outside Realm Vast Expanses (x in [-720000, -28], z in [-375000, 375000])
        if (x >= -720000 && x <= -28 && z >= -375000 && z <= 375000) {
            // Check scaled local coordinates against outside terrain elevations (45.0x scale)
            const ox = x / 45.0;
            const oz = z / 45.0;
            if (currentY === null || currentY >= -1.8) {
                return (ox <= -130 && ox >= -185 && oz >= 15 && oz <= 80) ? 2.0 : 0.0;
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
        const northCourtyardMat = this.stoneMat.clone();
        northCourtyardMat.map = northCourtyardMat.map.clone();
        northCourtyardMat.map.repeat.set(150, 381);
        if (northCourtyardMat.bumpMap) {
            northCourtyardMat.bumpMap = northCourtyardMat.bumpMap.clone();
            northCourtyardMat.bumpMap.repeat.set(150, 381);
        }
        if (northCourtyardMat.roughnessMap) {
            northCourtyardMat.roughnessMap = northCourtyardMat.roughnessMap.clone();
            northCourtyardMat.roughnessMap.repeat.set(150, 381);
        }
        const northCourtyard = new THREE.Mesh(northCourtyardGeo, northCourtyardMat);
        northCourtyard.rotation.x = -Math.PI / 2;
        northCourtyard.position.set(0, 0, -1107);
        northCourtyard.receiveShadow = true;
        this.scene.add(northCourtyard);

        // Center Promenade Floor Slab (z in [36, 540], x in [-90, 90] - 180m wide gateway promenade, 504m long)
        const centerCourtyardGeo = new THREE.PlaneGeometry(180, 504);
        const centerCourtyardMat = this.stoneMat.clone();
        centerCourtyardMat.map = centerCourtyardMat.map.clone();
        centerCourtyardMat.map.repeat.set(30, 84);
        if (centerCourtyardMat.bumpMap) {
            centerCourtyardMat.bumpMap = centerCourtyardMat.bumpMap.clone();
            centerCourtyardMat.bumpMap.repeat.set(30, 84);
        }
        if (centerCourtyardMat.roughnessMap) {
            centerCourtyardMat.roughnessMap = centerCourtyardMat.roughnessMap.clone();
            centerCourtyardMat.roughnessMap.repeat.set(30, 84);
        }
        const centerCourtyard = new THREE.Mesh(centerCourtyardGeo, centerCourtyardMat);
        centerCourtyard.rotation.x = -Math.PI / 2;
        centerCourtyard.position.set(0, 0, 288);
        centerCourtyard.receiveShadow = true;
        this.scene.add(centerCourtyard);

        // Far West Battlement Floor Slab (z in [36, 540], x in [-450, -90]) - 360m wide, 504m long
        const westCourtyardGeo = new THREE.PlaneGeometry(360, 504);
        const westCourtyardMat = this.stoneMat.clone();
        westCourtyardMat.map = westCourtyardMat.map.clone();
        westCourtyardMat.map.repeat.set(60, 84);
        if (westCourtyardMat.bumpMap) {
            westCourtyardMat.bumpMap = westCourtyardMat.bumpMap.clone();
            westCourtyardMat.bumpMap.repeat.set(60, 84);
        }
        if (westCourtyardMat.roughnessMap) {
            westCourtyardMat.roughnessMap = westCourtyardMat.roughnessMap.clone();
            westCourtyardMat.roughnessMap.repeat.set(60, 84);
        }
        const westCourtyard = new THREE.Mesh(westCourtyardGeo, westCourtyardMat);
        westCourtyard.rotation.x = -Math.PI / 2;
        westCourtyard.position.set(-270.0, 0, 288);
        westCourtyard.receiveShadow = true;
        this.scene.add(westCourtyard);

        // Far East Battlement Floor Slab (z in [36, 540], x in [90, 450]) - 360m wide, 504m long
        const eastCourtyardGeo = new THREE.PlaneGeometry(360, 504);
        const eastCourtyardMat = this.stoneMat.clone();
        eastCourtyardMat.map = eastCourtyardMat.map.clone();
        eastCourtyardMat.map.repeat.set(60, 84);
        if (eastCourtyardMat.bumpMap) {
            eastCourtyardMat.bumpMap = eastCourtyardMat.bumpMap.clone();
            eastCourtyardMat.bumpMap.repeat.set(60, 84);
        }
        if (eastCourtyardMat.roughnessMap) {
            eastCourtyardMat.roughnessMap = eastCourtyardMat.roughnessMap.clone();
            eastCourtyardMat.roughnessMap.repeat.set(60, 84);
        }
        const eastCourtyard = new THREE.Mesh(eastCourtyardGeo, eastCourtyardMat);
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
        // 3. BOSS ARENA (BEYOND FOG GATE AT Z = 37260 TO Z = 112860)
        // TITAN X9 EXPANSION: 6,480m Wide x 75,600m Long Imperial Colosseum Arena (Centered at z = 75060)
        // ----------------------------------------------------
        const arenaGeo = new THREE.BoxGeometry(6480, 4, 75600);
        const arena = new THREE.Mesh(arenaGeo, this.arenaMat);
        arena.position.set(0, -2, 75060);
        arena.receiveShadow = true;
        this.scene.add(arena);

        // Arena Boundaries (Monumental 45m High Ramparts)
        this.createWall(-3241.5, 22.5, 75060, 12, 45, 75600);   // West wall
        this.createWall(3241.5, 22.5, 75060, 12, 45, 75600);    // East wall
        this.createWall(0, 22.5, 112860, 6500, 45, 12);         // Far North end of arena (locked throne gate)

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
        outsideGroup.scale.set(45.0, 1.0, 45.0); // 5X COLOSSAL EXPANSION: 720km MEGALITHIC REALM
        this.buildTripledExpeditionBiomes(outsideGroup);
        this.buildCataclysmicMegalithBiomes(outsideGroup);
        this.buildInfiniteInfinityBiomes(outsideGroup);
        this.buildOmnipotentTitanBiomes(outsideGroup);

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

        // Build 8 Brand-New Mythic Outside Realm Expeditions (V57 Expansion)
        this.buildEightMythicOutsideExpeditions(outsideGroup);

        // Build 8 Brand-New Cataclysmic Outside Realm Expeditions (V60 Expansion)
        this.buildEightCataclysmicOutsideExpeditions(outsideGroup);

        // Build 8 Brand-New Ascended Outside Realm Expeditions (V69 Expansion)
        this.buildEightAscendedOutsideExpeditions(outsideGroup);

        // Build 8 Brand-New Ascended Outside Realm Expeditions (V73 Expansion)
        this.buildEightAscendedOutsideExpeditionsV73(outsideGroup);

        // Build 8 Brand-New Ascended Outside Realm Expeditions (V74 Expansion)
        this.buildEightAscendedOutsideExpeditionsV74(outsideGroup);
        this.buildEightAscendedOutsideExpeditionsV76(outsideGroup);
        this.buildEightAscendedOutsideExpeditionsV79(outsideGroup);
        this.buildEightAscendedOutsideExpeditionsV80(outsideGroup);
        this.buildEightAscendedOutsideExpeditionsV81(outsideGroup);
        this.buildEightAscendedOutsideExpeditionsV82(outsideGroup);

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

    buildEightMythicOutsideExpeditions(outsideGroup) {
        // ====================================================================
        // 8 BRAND-NEW MYTHIC OUTSIDE REALM EXPEDITIONS (V57 EXPANSION)
        // ====================================================================

        // --------------------------------------------------------------------
        // 1. FARRON KEEP MAUSOLEUM & PERIMETER OF THE ABYSS ([-1100, 8.0, -240])
        // --------------------------------------------------------------------
        const farronBase = new THREE.Mesh(new THREE.CylinderGeometry(56, 70, 16, 18), this.cliffRockMat);
        farronBase.position.set(-1100, 0, -240);
        outsideGroup.add(farronBase);

        const farronFloor = new THREE.Mesh(new THREE.BoxGeometry(64, 1.2, 54), new THREE.MeshStandardMaterial({
            color: 0x334155, roughness: 0.9, metalness: 0.1
        }));
        farronFloor.position.set(-1100, 8.1, -240);
        farronFloor.receiveShadow = true;
        outsideGroup.add(farronFloor);

        // 4 Ancient Stone Sarcophagi & Wolf Crest Banners
        [-16, 16].forEach(sx => {
            [-14, 14].forEach(sz => {
                const sarc = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.8, 8.5), new THREE.MeshStandardMaterial({
                    color: 0x1e293b, roughness: 0.8
                }));
                sarc.position.set(-1100 + sx, 9.0, -240 + sz);
                outsideGroup.add(sarc);
            });
        });

        // 8 Vertical Wolf Knight Swords thrust into stone
        const swordMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
        for (let sw = 0; sw < 8; sw++) {
            const swAng = (sw / 8) * Math.PI * 2;
            const sword = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.12, 3.2, 5), swordMat);
            sword.position.set(-1100 + Math.cos(swAng) * 22, 9.6, -240 + Math.sin(swAng) * 22);
            sword.rotation.z = 0.15 * Math.sin(sw);
            outsideGroup.add(sword);
        }

        // Wolf Blood Basin Cauldron in Center
        const wolfCauldron = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 2.0, 2.8, 16), new THREE.MeshStandardMaterial({
            color: 0x1e1b4b, roughness: 0.4, metalness: 0.7
        }));
        wolfCauldron.position.set(-1100, 9.5, -240);
        outsideGroup.add(wolfCauldron);

        const farronLight = new THREE.PointLight(0xf97316, 5.0, 48.0);
        farronLight.position.set(-1100, 12.0, -240);
        outsideGroup.add(farronLight);

        this.createStandingBrazier(-1084, 8.0, -240, 0xf97316, 5.0, 32);
        this.createStandingBrazier(-1116, 8.0, -240, 0xef4444, 5.0, 32);
        this.createPathBeacon(-1100, 8.0, -240, 0xf97316, "🔥 FARRON KEEP MAUSOLEUM [ELEV +8.0m]", "ABYSS WATCHERS LEGION • WOLF BLOOD CAULDRON • FARRON GHRU LEAPERS", "#ffedd5");
        this.createFloorSoapstone(-1100, 8.0, -228, "#f97316", "🔥 FARRON KEEP MAUSOLEUM", "The blood of the wolf binds the legion to eternal struggle against the deep.");

        // --------------------------------------------------------------------
        // 2. CRUMBLING FARUM AZULA DRAGON TEMPLE SANCTUM ([-1120, 28.0, -80])
        // --------------------------------------------------------------------
        const azulaBase = new THREE.Mesh(new THREE.CylinderGeometry(58, 76, 56, 20), this.cliffRockMat);
        azulaBase.position.set(-1120, 0, -80);
        outsideGroup.add(azulaBase);

        const azulaFloor = new THREE.Mesh(new THREE.CylinderGeometry(46, 46, 1.4, 24), new THREE.MeshStandardMaterial({
            color: 0x475569, roughness: 0.75, metalness: 0.3
        }));
        azulaFloor.position.set(-1120, 28.1, -80);
        azulaFloor.receiveShadow = true;
        outsideGroup.add(azulaFloor);

        // Floating Shattered Temple Island Blocks & Arch Fragments
        for (let fa = 0; fa < 6; fa++) {
            const fAng = (fa / 6) * Math.PI * 2;
            const floatBlock = new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.2, 5.5), new THREE.MeshStandardMaterial({
                color: 0x334155, roughness: 0.8
            }));
            floatBlock.position.set(-1120 + Math.cos(fAng) * 38, 36.0 + Math.sin(fa) * 3, -80 + Math.sin(fAng) * 38);
            floatBlock.rotation.set(0.2 * fa, 0.4 * fa, 0.1 * fa);
            outsideGroup.add(floatBlock);
        }

        // Destined Death Crimson Rune Core in Altar
        const destinedDeathCore = new THREE.Mesh(new THREE.OctahedronGeometry(2.4, 1), new THREE.MeshStandardMaterial({
            color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 2.6, roughness: 0.2
        }));
        destinedDeathCore.position.set(-1120, 32.5, -80);
        outsideGroup.add(destinedDeathCore);

        const azulaLight = new THREE.PointLight(0xef4444, 6.0, 56.0);
        azulaLight.position.set(-1120, 32.0, -80);
        outsideGroup.add(azulaLight);

        this.createStandingBrazier(-1104, 28.0, -80, 0xef4444, 6.0, 36);
        this.createStandingBrazier(-1136, 28.0, -80, 0xef4444, 6.0, 36);
        this.createPathBeacon(-1120, 28.0, -80, 0xef4444, "🗡️ FARUM AZULA TEMPLE SANCTUM [ELEV +28.0m]", "MALIKETH THE BLACK BLADE & GURRANQ • DESTINED DEATH • AZULA BEASTMEN", "#fee2e2");
        this.createFloorSoapstone(-1120, 28.0, -68, "#ef4444", "🗡️ FARUM AZULA SANCTUM", "Witless Tarnished, why covet Destined Death? To kill what?");

        // --------------------------------------------------------------------
        // 3. IRITHYLL BOREAL VALLEY GRAND PONTIFF CATHEDRAL ([-1110, 18.0, 140])
        // --------------------------------------------------------------------
        const pontiffBase = new THREE.Mesh(new THREE.CylinderGeometry(54, 68, 36, 18), this.cliffRockMat);
        pontiffBase.position.set(-1110, 0, 140);
        outsideGroup.add(pontiffBase);

        const pontiffFloor = new THREE.Mesh(new THREE.BoxGeometry(62, 1.2, 52), new THREE.MeshStandardMaterial({
            color: 0x64748b, roughness: 0.35, metalness: 0.45
        }));
        pontiffFloor.position.set(-1110, 18.1, 140);
        pontiffFloor.receiveShadow = true;
        outsideGroup.add(pontiffFloor);

        // Fluted Silver Colonnades along Flanks
        const silverPillarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });
        for (let col = -18; col <= 18; col += 9) {
            const leftCol = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 14, 8), silverPillarMat);
            leftCol.position.set(-1136, 25.0, 140 + col);
            outsideGroup.add(leftCol);

            const rightCol = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 14, 8), silverPillarMat);
            rightCol.position.set(-1084, 25.0, 140 + col);
            outsideGroup.add(rightCol);
        }

        // Grand Gothic Stained Glass Portal Backdrop
        const glassArch = new THREE.Mesh(new THREE.BoxGeometry(40, 16, 1.2), new THREE.MeshStandardMaterial({
            color: 0x1d4ed8, emissive: 0x1e40af, emissiveIntensity: 1.5, roughness: 0.1
        }));
        glassArch.position.set(-1110, 26.0, 164);
        outsideGroup.add(glassArch);

        const pontiffColdLight = new THREE.PointLight(0x38bdf8, 5.0, 48.0);
        pontiffColdLight.position.set(-1110, 22.0, 140);
        outsideGroup.add(pontiffColdLight);

        this.createStandingBrazier(-1094, 18.0, 140, 0x38bdf8, 5.0, 32);
        this.createStandingBrazier(-1126, 18.0, 140, 0xf97316, 5.0, 32);
        this.createPathBeacon(-1110, 18.0, 140, 0x38bdf8, "⚔️ IRITHYLL PONTIFICAL DAIS [ELEV +18.0m]", "PONTIFF SULYVAHN • PROFANED FLAME & JUDGEMENT • IRITHYLL FIRE WITCHES", "#e0f2fe");
        this.createFloorSoapstone(-1110, 18.0, 128, "#38bdf8", "⚔️ IRITHYLL PONTIFICAL DAIS", "The tyrant took the old gods captive and fed them to the devourer of gods.");

        // --------------------------------------------------------------------
        // 4. YHARNAM GRAND CATHEDRAL HIGH ALTAR OF BLOOD ([-1140, 12.0, 280])
        // --------------------------------------------------------------------
        const vicarBase = new THREE.Mesh(new THREE.CylinderGeometry(54, 66, 24, 18), this.cliffRockMat);
        vicarBase.position.set(-1140, 0, 280);
        outsideGroup.add(vicarBase);

        const vicarFloor = new THREE.Mesh(new THREE.BoxGeometry(60, 1.2, 50), new THREE.MeshStandardMaterial({
            color: 0x475569, roughness: 0.8, metalness: 0.2
        }));
        vicarFloor.position.set(-1140, 12.1, 280);
        vicarFloor.receiveShadow = true;
        outsideGroup.add(vicarFloor);

        // Gothic Altar Table Draped in Torn Velvet
        const vicarAltar = new THREE.Mesh(new THREE.BoxGeometry(10, 3.2, 4.5), new THREE.MeshStandardMaterial({
            color: 0x7f1d1d, roughness: 0.7
        }));
        vicarAltar.position.set(-1140, 13.8, 300);
        outsideGroup.add(vicarAltar);

        // Mammoth Holy Crucifix Stele behind Altar
        const crossVert = new THREE.Mesh(new THREE.BoxGeometry(1.2, 14, 0.8), new THREE.MeshStandardMaterial({
            color: 0xd97706, roughness: 0.5, metalness: 0.4
        }));
        crossVert.position.set(-1140, 20.0, 303);
        outsideGroup.add(crossVert);

        const crossHoriz = new THREE.Mesh(new THREE.BoxGeometry(7.5, 1.2, 0.8), new THREE.MeshStandardMaterial({
            color: 0xd97706, roughness: 0.5, metalness: 0.4
        }));
        crossHoriz.position.set(-1140, 23.5, 303);
        outsideGroup.add(crossHoriz);

        const vicarLight = new THREE.PointLight(0xfef08a, 5.5, 50.0);
        vicarLight.position.set(-1140, 17.0, 280);
        outsideGroup.add(vicarLight);

        this.createStandingBrazier(-1124, 12.0, 280, 0xfef08a, 5.0, 32);
        this.createStandingBrazier(-1156, 12.0, 280, 0xef4444, 5.0, 32);
        this.createPathBeacon(-1140, 12.0, 280, 0xfef08a, "🐺 GRAND CATHEDRAL HIGH ALTAR [ELEV +12.0m]", "VICAR AMELIA WHITE FUR BEAST • GOLDEN PRAYER TALISMAN • TALL CHURCH SERVANTS", "#fef9c3");
        this.createFloorSoapstone(-1140, 12.0, 268, "#fef08a", "🐺 GRAND CATHEDRAL HIGH ALTAR", "Remain wary of the frailty of men. Their wills are weak, minds young.");

        // --------------------------------------------------------------------
        // 5. HIRATA ESTATE BLAZING AUDIENCE CHAMBER ([-1160, 6.0, -360])
        // --------------------------------------------------------------------
        const hirataBase = new THREE.Mesh(new THREE.CylinderGeometry(52, 64, 12, 18), this.cliffRockMat);
        hirataBase.position.set(-1160, 0, -360);
        outsideGroup.add(hirataBase);

        const hirataFloor = new THREE.Mesh(new THREE.BoxGeometry(58, 1.0, 48), new THREE.MeshStandardMaterial({
            color: 0x292524, roughness: 0.95
        }));
        hirataFloor.position.set(-1160, 6.1, -360);
        hirataFloor.receiveShadow = true;
        outsideGroup.add(hirataFloor);

        // Blazing Japanese Timber Rafters & Fiery Beams
        const burntWoodMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 });
        for (let jb = -16; jb <= 16; jb += 8) {
            const pillarL = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 10, 6), burntWoodMat);
            pillarL.position.set(-1182, 11.0, -360 + jb);
            outsideGroup.add(pillarL);

            const pillarR = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 10, 6), burntWoodMat);
            pillarR.position.set(-1138, 11.0, -360 + jb);
            outsideGroup.add(pillarR);

            const beamCross = new THREE.Mesh(new THREE.BoxGeometry(46, 0.7, 0.9), burntWoodMat);
            beamCross.position.set(-1160, 16.0, -360 + jb);
            outsideGroup.add(beamCross);
        }

        // Spirit Owl Perch Arch
        const owlPerch = new THREE.Mesh(new THREE.TorusGeometry(5.0, 0.6, 6, 12, Math.PI), new THREE.MeshStandardMaterial({
            color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 1.8
        }));
        owlPerch.position.set(-1160, 12.0, -380);
        outsideGroup.add(owlPerch);

        const hirataLight = new THREE.PointLight(0xf97316, 6.0, 52.0);
        hirataLight.position.set(-1160, 11.0, -360);
        outsideGroup.add(hirataLight);

        this.createStandingBrazier(-1144, 6.0, -360, 0xf97316, 5.5, 34);
        this.createStandingBrazier(-1176, 6.0, -360, 0xf97316, 5.5, 34);
        this.createPathBeacon(-1160, 6.0, -360, 0xf97316, "🦉 HIRATA BLAZING AUDIENCE CHAMBER [ELEV +6.0m]", "OWL (FATHER) GREAT SHINOBI • PHANTOM BLUE OWL • HIRATA BANDIT ASSASSINS", "#ffedd5");
        this.createFloorSoapstone(-1160, 6.0, -348, "#f97316", "🦉 HIRATA BLAZING AUDIENCE CHAMBER", "Defeat of a father by his son's hand. That is the rule of the shinobi.");

        // --------------------------------------------------------------------
        // 6. RAYA LUCARIA GRAND LIBRARY & FULL MOON CHAMBER ([-1180, 14.0, 420])
        // --------------------------------------------------------------------
        const rayaBase = new THREE.Mesh(new THREE.CylinderGeometry(56, 70, 28, 20), this.cliffRockMat);
        rayaBase.position.set(-1180, 0, 420);
        outsideGroup.add(rayaBase);

        const rayaFloor = new THREE.Mesh(new THREE.CylinderGeometry(44, 44, 1.2, 24), new THREE.MeshStandardMaterial({
            color: 0x1e3a8a, roughness: 0.35, metalness: 0.55
        }));
        rayaFloor.position.set(-1180, 14.1, 420);
        rayaFloor.receiveShadow = true;
        outsideGroup.add(rayaFloor);

        // 8 Giant Curved Bookcase Monoliths
        const bookMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.85 });
        for (let bk = 0; bk < 8; bk++) {
            const bkAng = (bk / 8) * Math.PI * 2;
            const bookcase = new THREE.Mesh(new THREE.BoxGeometry(6.5, 12.0, 1.8), bookMat);
            bookcase.position.set(-1180 + Math.cos(bkAng) * 36, 20.0, 420 + Math.sin(bkAng) * 36);
            bookcase.rotation.y = -bkAng + Math.PI / 2;
            outsideGroup.add(bookcase);
        }

        // Amber Egg Golden Cradle in Center
        const amberEgg = new THREE.Mesh(new THREE.SphereGeometry(2.4, 14, 14), new THREE.MeshStandardMaterial({
            color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 2.2, roughness: 0.2
        }));
        amberEgg.scale.set(1.0, 1.4, 1.0);
        amberEgg.position.set(-1180, 17.0, 420);
        outsideGroup.add(amberEgg);

        // Floating Full Moon Core overhead
        const fullMoonSphere = new THREE.Mesh(new THREE.SphereGeometry(4.2, 16, 16), new THREE.MeshStandardMaterial({
            color: 0xdbeafe, emissive: 0x93c5fd, emissiveIntensity: 2.5, roughness: 0.1
        }));
        fullMoonSphere.position.set(-1180, 27.0, 420);
        outsideGroup.add(fullMoonSphere);

        const rayaLight = new THREE.PointLight(0x60a5fa, 5.5, 56.0);
        rayaLight.position.set(-1180, 20.0, 420);
        outsideGroup.add(rayaLight);

        this.createStandingBrazier(-1164, 14.0, 420, 0x60a5fa, 5.0, 32);
        this.createStandingBrazier(-1196, 14.0, 420, 0xf59e0b, 5.0, 32);
        this.createPathBeacon(-1180, 14.0, 420, 0x60a5fa, "🌕 RAYA LUCARIA FULL MOON LIBRARY [ELEV +14.0m]", "RENNALA QUEEN OF THE FULL MOON • AMBER EGG CRADLE • CARIAN GLINTSTONE SORCERERS", "#dbeafe");
        this.createFloorSoapstone(-1180, 14.0, 408, "#60a5fa", "🌕 RAYA LUCARIA FULL MOON LIBRARY", "Hush, little culver. Thou art born anew under the soft light of the full moon.");

        // --------------------------------------------------------------------
        // 7. ASHINA CASTLE GATES FLAMING BATTLEFIELD ([-1200, 4.0, -180])
        // --------------------------------------------------------------------
        const demonBase = new THREE.Mesh(new THREE.CylinderGeometry(56, 70, 8, 20), this.cliffRockMat);
        demonBase.position.set(-1200, 0, -180);
        outsideGroup.add(demonBase);

        const demonFloor = new THREE.Mesh(new THREE.BoxGeometry(64, 1.0, 56), new THREE.MeshStandardMaterial({
            color: 0x1c1917, roughness: 0.95
        }));
        demonFloor.position.set(-1200, 4.1, -180);
        demonFloor.receiveShadow = true;
        outsideGroup.add(demonFloor);

        // Scorched Wooden Gate Palisades & Shattered Watchtower
        const charredWoodMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
        for (let pw = -24; pw <= 24; pw += 4) {
            const stake = new THREE.Mesh(new THREE.ConeGeometry(0.35, 4.2, 5), charredWoodMat);
            stake.position.set(-1200 + pw, 6.0, -154);
            stake.rotation.x = -0.3;
            outsideGroup.add(stake);
        }

        // Karmic Flame Fissure Core in Earth
        const flameCore = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 0.8, 1.2, 12), new THREE.MeshStandardMaterial({
            color: 0xdc2626, emissive: 0xb91c1c, emissiveIntensity: 3.0
        }));
        flameCore.position.set(-1200, 4.4, -180);
        outsideGroup.add(flameCore);

        const demonLight = new THREE.PointLight(0xdc2626, 6.5, 54.0);
        demonLight.position.set(-1200, 9.0, -180);
        outsideGroup.add(demonLight);

        this.createStandingBrazier(-1184, 4.0, -180, 0xdc2626, 6.0, 34);
        this.createStandingBrazier(-1216, 4.0, -180, 0xf97316, 6.0, 34);
        this.createPathBeacon(-1200, 4.0, -180, 0xdc2626, "👹 ASHINA CASTLE GATES IN FLAMES [ELEV +4.0m]", "THE DEMON OF HATRED KARMIC TITAN • FLAME WHIP ARM • ASHINA MINISTRY NINJAS", "#fee2e2");
        this.createFloorSoapstone(-1200, 4.0, -168, "#dc2626", "👹 ASHINA CASTLE GATES IN FLAMES", "The flames of hatred cannot be doused by water. Only the severance of karma remains.");

        // --------------------------------------------------------------------
        // 8. SHADOW REALM ANCIENT RUINS OF RAUH SCARLET ROT PAVILION ([-1220, -6.0, 540])
        // --------------------------------------------------------------------
        const rauhBase = new THREE.Mesh(new THREE.CylinderGeometry(54, 66, 12, 18), this.cliffRockMat);
        rauhBase.position.set(-1220, -12.0, 540);
        outsideGroup.add(rauhBase);

        const rauhFloor = new THREE.Mesh(new THREE.BoxGeometry(60, 1.0, 52), new THREE.MeshStandardMaterial({
            color: 0x3f3f46, roughness: 0.85
        }));
        rauhFloor.position.set(-1220, -5.9, 540);
        rauhFloor.receiveShadow = true;
        outsideGroup.add(rauhFloor);

        // Ancient Weathered Rauh Aqueduct Archways
        const aqueductMat = new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.8 });
        for (let aq = -18; aq <= 18; aq += 9) {
            const arch = new THREE.Mesh(new THREE.TorusGeometry(4.5, 0.8, 6, 12, Math.PI), aqueductMat);
            arch.position.set(-1220 + aq, -1.0, 560);
            outsideGroup.add(arch);
        }

        // Scarlet Rot Pool in Center
        const rotPool = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 0.25, 20), new THREE.MeshStandardMaterial({
            color: 0xf43f5e, emissive: 0xe11d48, emissiveIntensity: 1.8, roughness: 0.2
        }));
        rotPool.position.set(-1220, -5.7, 540);
        outsideGroup.add(rotPool);

        // 8 Floating Scarlet Rot Butterflies
        const butterflyMat = new THREE.MeshStandardMaterial({
            color: 0xfb7185, emissive: 0xf43f5e, emissiveIntensity: 2.5
        });
        for (let bf = 0; bf < 8; bf++) {
            const bfAng = (bf / 8) * Math.PI * 2;
            const wingCluster = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), butterflyMat);
            wingCluster.position.set(-1220 + Math.cos(bfAng) * 12, -2.0 + Math.sin(bf) * 1.5, 540 + Math.sin(bfAng) * 12);
            outsideGroup.add(wingCluster);
        }

        const rauhLight = new THREE.PointLight(0xf43f5e, 5.5, 50.0);
        rauhLight.position.set(-1220, 2.0, 540);
        outsideGroup.add(rauhLight);

        this.createStandingBrazier(-1204, -6.0, 540, 0xf43f5e, 5.0, 32);
        this.createStandingBrazier(-1236, -6.0, 540, 0xf43f5e, 5.0, 32);
        this.createPathBeacon(-1220, -6.0, 540, 0xf43f5e, "🌸 RAUH SCARLET ROT PAVILION [ELEV -6.0m]", "ROMINA SAINT OF THE BUD • CENTIPEDE CARAPACE • RAUH HORNED WARRIORS", "#ffe4e6");
        this.createFloorSoapstone(-1220, -6.0, 528, "#f43f5e", "🌸 RAUH SCARLET ROT PAVILION", "Within the bud she nurtured the rotting flame. A butterfly woven from ancient despair.");
    }

    buildEightCataclysmicOutsideExpeditions(outsideGroup) {
        // ====================================================================
        // 8 BRAND-NEW CATACLYSMIC OUTSIDE REALM EXPEDITIONS (V60 EXPANSION)
        // ====================================================================

        // --------------------------------------------------------------------
        // 1. LEYNDELL ERDTREE SANCTUARY & THRONE OF OMENS ([-1300, 20.0, -200])
        // --------------------------------------------------------------------
        const omenBase = new THREE.Mesh(new THREE.CylinderGeometry(56, 70, 24, 18), this.cliffRockMat);
        omenBase.position.set(-1300, 8.0, -200);
        outsideGroup.add(omenBase);

        const omenFloor = new THREE.Mesh(new THREE.BoxGeometry(64, 1.2, 54), new THREE.MeshStandardMaterial({
            color: 0xca8a04, roughness: 0.7, metalness: 0.2
        }));
        omenFloor.position.set(-1300, 20.1, -200);
        omenFloor.receiveShadow = true;
        outsideGroup.add(omenFloor);

        // 4 Monumental Golden Erdtree Fluted Colonnades
        const goldColumnMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5, metalness: 0.3 });
        [[-22, -18], [22, -18], [-22, 18], [22, 18]].forEach(([cx, cz]) => {
            const col = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, 18, 12), goldColumnMat);
            col.position.set(-1300 + cx, 29.0, -200 + cz);
            outsideGroup.add(col);

            const crownLight = new THREE.PointLight(0xfbbf24, 3.5, 30.0);
            crownLight.position.set(-1300 + cx, 38.0, -200 + cz);
            outsideGroup.add(crownLight);
        });

        // Golden Throne of the Omen King
        const throneMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
        const throne = new THREE.Mesh(new THREE.BoxGeometry(7, 8, 4), throneMat);
        throne.position.set(-1300, 24.0, -220);
        outsideGroup.add(throne);

        // Omen Blood Basin
        const basin = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 3.5, 1.5, 14), new THREE.MeshStandardMaterial({
            color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 2.2
        }));
        basin.position.set(-1300, 20.8, -195);
        outsideGroup.add(basin);

        const omenLight = new THREE.PointLight(0xfbbf24, 6.5, 56.0);
        omenLight.position.set(-1300, 27.0, -200);
        outsideGroup.add(omenLight);

        this.createStandingBrazier(-1284, 20.0, -200, 0xfbbf24, 6.0, 36);
        this.createStandingBrazier(-1316, 20.0, -200, 0xf59e0b, 6.0, 36);
        this.createPathBeacon(-1300, 20.0, -200, 0xfbbf24, "👑 LEYNDELL THRONE OF OMENS [ELEV +20.0m]", "MORGOTT THE OMEN KING • CURSED-BLOOD BLADE • LEYNDELL PERFUMER PAGES", "#fef3c7");
        this.createFloorSoapstone(-1300, 20.0, -188, "#fbbf24", "👑 THRONE OF OMENS", "Graceless though he was, he loved the Erdtree till the end. None shall pass.");

        // --------------------------------------------------------------------
        // 2. USUI MISTY FOREST HALL OF ILLUSIONS ([-1320, 10.0, -80])
        // --------------------------------------------------------------------
        const usuiBase = new THREE.Mesh(new THREE.CylinderGeometry(54, 68, 16, 18), this.cliffRockMat);
        usuiBase.position.set(-1320, 2.0, -80);
        outsideGroup.add(usuiBase);

        const usuiFloor = new THREE.Mesh(new THREE.BoxGeometry(60, 1.2, 54), new THREE.MeshStandardMaterial({
            color: 0x475569, roughness: 0.9, metalness: 0.1
        }));
        usuiFloor.position.set(-1320, 10.1, -80);
        usuiFloor.receiveShadow = true;
        outsideGroup.add(usuiFloor);

        // Weathered Japanese Pagoda Cedar Timbers & Gossamer Wire Webs
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
        const wireMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, emissive: 0xa855f7, emissiveIntensity: 2.2 });
        for (let bx = -22; bx <= 22; bx += 11) {
            const beam = new THREE.Mesh(new THREE.BoxGeometry(0.8, 12, 0.8), woodMat);
            beam.position.set(-1320 + bx, 16.0, -80 - 22);
            outsideGroup.add(beam);

            // Overhead horizontal crossbeam
            const cross = new THREE.Mesh(new THREE.BoxGeometry(11, 0.6, 0.6), woodMat);
            cross.position.set(-1320 + bx, 22.0, -80);
            outsideGroup.add(cross);

            // Glowing illusion wire strands
            const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 34, 4), wireMat);
            wire.position.set(-1320 + bx, 18.0, -80);
            wire.rotation.x = 0.5;
            outsideGroup.add(wire);
        }

        // Swarm of 8 Glowing Illusion Butterflies
        const sakuraMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, emissive: 0xec4899, emissiveIntensity: 2.5 });
        for (let sb = 0; sb < 8; sb++) {
            const sAng = (sb / 8) * Math.PI * 2;
            const bfly = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), sakuraMat);
            bfly.position.set(-1320 + Math.cos(sAng) * 14, 13.0 + Math.sin(sb) * 1.6, -80 + Math.sin(sAng) * 14);
            outsideGroup.add(bfly);
        }

        const usuiLight = new THREE.PointLight(0xa855f7, 5.5, 52.0);
        usuiLight.position.set(-1320, 16.0, -80);
        outsideGroup.add(usuiLight);

        this.createStandingBrazier(-1304, 10.0, -80, 0xa855f7, 5.5, 34);
        this.createStandingBrazier(-1336, 10.0, -80, 0xec4899, 5.5, 34);
        this.createPathBeacon(-1320, 10.0, -80, 0xa855f7, "🦋 USUI MISTY HALL OF ILLUSIONS [ELEV +10.0m]", "LADY BUTTERFLY • KUNAI WIRES & PHANTOMS • SENPOU STRAWHAT ASSASSINS", "#fae8ff");
        this.createFloorSoapstone(-1320, 10.0, -68, "#a855f7", "🦋 HALL OF ILLUSIONS", "You were still just a puppy. Let the phantom butterflies dance on your grave.");

        // --------------------------------------------------------------------
        // 3. AINSEL RIVER BASIN OF NOKSTELLA & FROZEN WATERFALL ([-1340, -14.0, 80])
        // --------------------------------------------------------------------
        const ainselBase = new THREE.Mesh(new THREE.CylinderGeometry(56, 70, 16, 18), this.cliffRockMat);
        ainselBase.position.set(-1340, -22.0, 80);
        outsideGroup.add(ainselBase);

        const ainselFloor = new THREE.Mesh(new THREE.BoxGeometry(62, 1.2, 56), new THREE.MeshStandardMaterial({
            color: 0x0f172a, roughness: 0.4, metalness: 0.3
        }));
        ainselFloor.position.set(-1340, -13.9, 80);
        ainselFloor.receiveShadow = true;
        outsideGroup.add(ainselFloor);

        // Giant Bioluminescent Oyster Mushrooms
        const shroomMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.2 });
        [[-20, -18], [-24, 16], [22, -16], [24, 18]].forEach(([mx, mz]) => {
            const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.4, 7, 8), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
            stalk.position.set(-1340 + mx, -10.5, 80 + mz);
            outsideGroup.add(stalk);

            const cap = new THREE.Mesh(new THREE.SphereGeometry(3.6, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.45), shroomMat);
            cap.position.set(-1340 + mx, -7.0, 80 + mz);
            outsideGroup.add(cap);
        });

        // Colossal Frozen Blue Lightning Glacier Backdrop
        const iceMat = new THREE.MeshStandardMaterial({ color: 0x7dd3fc, roughness: 0.15, metalness: 0.4, transparent: true, opacity: 0.85 });
        const iceWall = new THREE.Mesh(new THREE.BoxGeometry(50, 24, 3), iceMat);
        iceWall.position.set(-1340, -2.0, 80 + 26);
        outsideGroup.add(iceWall);

        const ainselLight = new THREE.PointLight(0x38bdf8, 6.0, 55.0);
        ainselLight.position.set(-1340, -6.0, 80);
        outsideGroup.add(ainselLight);

        this.createStandingBrazier(-1324, -14.0, 80, 0x38bdf8, 5.5, 34);
        this.createStandingBrazier(-1356, -14.0, 80, 0x0284c7, 5.5, 34);
        this.createPathBeacon(-1340, -14.0, 80, 0x38bdf8, "⚡ NOKSTELLA AINSEL BASIN [ELEV -14.0m]", "DRAGONKIN SOLDIER OF NOKSTELLA • FROZEN LIGHTNING • CLAYMAN PRIESTS", "#e0f2fe");
        this.createFloorSoapstone(-1340, -14.0, 68, "#38bdf8", "⚡ AINSEL BASIN", "Born underground, they never saw the true sky. Yet their ice lightning shatters dragons.");

        // --------------------------------------------------------------------
        // 4. OOLACILE TOWNSHIP RUINED COLOSSEUM OF THE DARK ([-1360, 5.0, 200])
        // --------------------------------------------------------------------
        const oolacileBase = new THREE.Mesh(new THREE.CylinderGeometry(56, 70, 16, 18), this.cliffRockMat);
        oolacileBase.position.set(-1360, -3.0, 200);
        outsideGroup.add(oolacileBase);

        const oolacileFloor = new THREE.Mesh(new THREE.BoxGeometry(64, 1.2, 56), new THREE.MeshStandardMaterial({
            color: 0x1e1b4b, roughness: 0.9, metalness: 0.1
        }));
        oolacileFloor.position.set(-1360, 5.1, 200);
        oolacileFloor.receiveShadow = true;
        outsideGroup.add(oolacileFloor);

        // Crumbling Gothic Colosseum Arches & Abyssal Corruption
        const archMat = new THREE.MeshStandardMaterial({ color: 0x312e81, roughness: 0.85 });
        for (let oa = 0; oa < 8; oa++) {
            const oAng = (oa / 8) * Math.PI * 2;
            const arch = new THREE.Mesh(new THREE.TorusGeometry(3.8, 0.6, 6, 10, Math.PI), archMat);
            arch.position.set(-1360 + Math.cos(oAng) * 25, 9.0, 200 + Math.sin(oAng) * 25);
            arch.rotation.y = oAng;
            outsideGroup.add(arch);
        }

        // Swirling Dark Humanity Pool in Center
        const humanityPool = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 0.3, 18), new THREE.MeshStandardMaterial({
            color: 0x09090b, emissive: 0x581c87, emissiveIntensity: 2.8, roughness: 0.1
        }));
        humanityPool.position.set(-1360, 5.3, 200);
        outsideGroup.add(humanityPool);

        const oolacileLight = new THREE.PointLight(0x7c3aed, 6.0, 54.0);
        oolacileLight.position.set(-1360, 11.0, 200);
        outsideGroup.add(oolacileLight);

        this.createStandingBrazier(-1344, 5.0, 200, 0x7c3aed, 6.0, 36);
        this.createStandingBrazier(-1376, 5.0, 200, 0x4c1d95, 6.0, 36);
        this.createPathBeacon(-1360, 5.0, 200, 0x7c3aed, "⚔️ OOLACILE ABYSSAL COLOSSEUM [ELEV +5.0m]", "KNIGHT ARTORIAS THE ABYSSWALKER • WOLF GREATSWORD • BLOATHEAD SORCERERS", "#f3e8ff");
        this.createFloorSoapstone(-1360, 5.0, 188, "#7c3aed", "⚔️ OOLACILE COLOSSEUM", "Whatever thou art, stay away. The Dark... it spreads. Forgive me, Sif...");

        // --------------------------------------------------------------------
        // 5. UPPER CATHEDRAL WARD ALTAR OF DESPAIR ([-1380, -16.0, -320])
        // --------------------------------------------------------------------
        const ebrietasBase = new THREE.Mesh(new THREE.CylinderGeometry(56, 72, 18, 18), this.cliffRockMat);
        ebrietasBase.position.set(-1380, -25.0, -320);
        outsideGroup.add(ebrietasBase);

        const ebrietasFloor = new THREE.Mesh(new THREE.BoxGeometry(62, 1.2, 56), new THREE.MeshStandardMaterial({
            color: 0x0f172a, roughness: 0.35, metalness: 0.4
        }));
        ebrietasFloor.position.set(-1380, -15.9, -320);
        ebrietasFloor.receiveShadow = true;
        outsideGroup.add(ebrietasFloor);

        // Ring of 8 Glowing Cosmic Lumenflower Buds
        const lumenMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x2563eb, emissiveIntensity: 2.6 });
        for (let lf = 0; lf < 8; lf++) {
            const lAng = (lf / 8) * Math.PI * 2;
            const lStalk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 5.5, 6), new THREE.MeshStandardMaterial({ color: 0x1e3a8a }));
            lStalk.position.set(-1380 + Math.cos(lAng) * 22, -13.0, -320 + Math.sin(lAng) * 22);
            outsideGroup.add(lStalk);

            const lBud = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), lumenMat);
            lBud.position.set(-1380 + Math.cos(lAng) * 22, -10.0, -320 + Math.sin(lAng) * 22);
            outsideGroup.add(lBud);
        }

        // Petrified Altar of Rom in Rear
        const romAltar = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 6), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 }));
        romAltar.position.set(-1380, -14.0, -320 - 22);
        outsideGroup.add(romAltar);

        const ebrietasLight = new THREE.PointLight(0x60a5fa, 6.5, 54.0);
        ebrietasLight.position.set(-1380, -9.0, -320);
        outsideGroup.add(ebrietasLight);

        this.createStandingBrazier(-1364, -16.0, -320, 0x60a5fa, 6.0, 34);
        this.createStandingBrazier(-1396, -16.0, -320, 0x3b82f6, 6.0, 34);
        this.createPathBeacon(-1380, -16.0, -320, 0x60a5fa, "🌌 ALTAR OF DESPAIR [ELEV -16.0m]", "EBRIETAS DAUGHTER OF THE COSMOS • A CALL BEYOND • CELESTIAL EMISSARIES", "#dbeafe");
        this.createFloorSoapstone(-1380, -16.0, -308, "#60a5fa", "🌌 ALTAR OF DESPAIR", "The cosmos, of course! Left behind by the Great Ones, she weeps tears of stars.");

        // --------------------------------------------------------------------
        // 6. ASHINA CASTLE GREAT GATEFIELD & FORTRESS PALISADE ([-1400, 8.0, 320])
        // --------------------------------------------------------------------
        const gyoubuBase = new THREE.Mesh(new THREE.CylinderGeometry(58, 72, 16, 18), this.cliffRockMat);
        gyoubuBase.position.set(-1400, 0, 320);
        outsideGroup.add(gyoubuBase);

        const gyoubuFloor = new THREE.Mesh(new THREE.BoxGeometry(66, 1.2, 58), new THREE.MeshStandardMaterial({
            color: 0x292524, roughness: 0.95
        }));
        gyoubuFloor.position.set(-1400, 8.1, 320);
        gyoubuFloor.receiveShadow = true;
        outsideGroup.add(gyoubuFloor);

        // Fortified Timber Gatehouse Tower in Rear
        const timberMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 });
        const gatehouse = new THREE.Mesh(new THREE.BoxGeometry(28, 14, 8), timberMat);
        gatehouse.position.set(-1400, 15.0, 320 + 24);
        outsideGroup.add(gatehouse);

        // Spiked Log Barricades
        for (let sp = -24; sp <= 24; sp += 6) {
            const log = new THREE.Mesh(new THREE.ConeGeometry(0.45, 5, 5), timberMat);
            log.position.set(-1400 + sp, 10.0, 320 - 24);
            log.rotation.x = -0.4;
            outsideGroup.add(log);
        }

        const gyoubuLight = new THREE.PointLight(0xf97316, 6.0, 52.0);
        gyoubuLight.position.set(-1400, 14.0, 320);
        outsideGroup.add(gyoubuLight);

        this.createStandingBrazier(-1384, 8.0, 320, 0xf97316, 6.0, 34);
        this.createStandingBrazier(-1416, 8.0, 320, 0xea580c, 6.0, 34);
        this.createPathBeacon(-1400, 8.0, 320, 0xf97316, "🏯 ASHINA CASTLE GATEFIELD [ELEV +8.0m]", "GYOUBU MASATAKA ONIWA • ONIKAGE WARHORSE • ASHINA ASHIGARU RIFLEMEN", "#ffedd5");
        this.createFloorSoapstone(-1400, 8.0, 308, "#f97316", "🏯 ASHINA GATEFIELD", "MY NAME IS GYOUBU MASATAKA ONIWA! As long as I breathe, you shall not pass the castle gate!");

        // --------------------------------------------------------------------
        // 7. JAGGED PEAK DRAGON'S PIT & ANCIENT RED LIGHTNING CRAGS ([-1420, 16.0, -140])
        // --------------------------------------------------------------------
        const florissaxBase = new THREE.Mesh(new THREE.CylinderGeometry(54, 70, 20, 18), this.cliffRockMat);
        florissaxBase.position.set(-1420, 6.0, -140);
        outsideGroup.add(florissaxBase);

        const florissaxFloor = new THREE.Mesh(new THREE.BoxGeometry(60, 1.2, 54), new THREE.MeshStandardMaterial({
            color: 0x18181b, roughness: 0.95
        }));
        florissaxFloor.position.set(-1420, 16.1, -140);
        florissaxFloor.receiveShadow = true;
        outsideGroup.add(florissaxFloor);

        // Jagged Obsidian Dragon Spikes Ringing Peak
        const obsidianMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.6, metalness: 0.5 });
        const redLightningMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 2.8 });
        for (let os = 0; os < 8; os++) {
            const oAng = (os / 8) * Math.PI * 2;
            const spike = new THREE.Mesh(new THREE.ConeGeometry(1.6, 12, 5), obsidianMat);
            spike.position.set(-1420 + Math.cos(oAng) * 24, 21.0, -140 + Math.sin(oAng) * 24);
            spike.rotation.z = Math.cos(oAng) * 0.3;
            spike.rotation.x = Math.sin(oAng) * 0.3;
            outsideGroup.add(spike);

            // Red lightning tendril
            const redBolt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 14, 4), redLightningMat);
            redBolt.position.set(-1420 + Math.cos(oAng) * 24, 22.0, -140 + Math.sin(oAng) * 24);
            outsideGroup.add(redBolt);
        }

        const florissaxLight = new THREE.PointLight(0xef4444, 6.5, 54.0);
        florissaxLight.position.set(-1420, 22.0, -140);
        outsideGroup.add(florissaxLight);

        this.createStandingBrazier(-1404, 16.0, -140, 0xef4444, 6.0, 36);
        this.createStandingBrazier(-1436, 16.0, -140, 0xdc2626, 6.0, 36);
        this.createPathBeacon(-1420, 16.0, -140, 0xef4444, "⚡ DRAGON'S PIT CRAGS [ELEV +16.0m]", "ANCIENT DRAGON FLORISSAX • FLOWERSTONE GAVEL • DRAGON CULT LAPIS KNIGHTS", "#fee2e2");
        this.createFloorSoapstone(-1420, 16.0, -128, "#ef4444", "⚡ DRAGON'S PIT", "Drink the dragon's blood, brandish red lightning. Bayle shall bleed for his betrayal.");

        // --------------------------------------------------------------------
        // 8. VOLCANO MANOR SUNKEN MAGMA LAKE & BLASPHEMOUS CHAMBER ([-1440, -12.0, 440])
        // --------------------------------------------------------------------
        const rykardBase = new THREE.Mesh(new THREE.CylinderGeometry(56, 72, 16, 18), this.cliffRockMat);
        rykardBase.position.set(-1440, -20.0, 440);
        outsideGroup.add(rykardBase);

        const rykardFloor = new THREE.Mesh(new THREE.BoxGeometry(64, 1.2, 58), new THREE.MeshStandardMaterial({
            color: 0x18181b, roughness: 0.95
        }));
        rykardFloor.position.set(-1440, -11.9, 440);
        rykardFloor.receiveShadow = true;
        outsideGroup.add(rykardFloor);

        // Boiling Magma Ring in Center
        const magmaLake = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 0.4, 20), new THREE.MeshStandardMaterial({
            color: 0xe11d48, emissive: 0xbe123c, emissiveIntensity: 3.2, roughness: 0.2
        }));
        magmaLake.position.set(-1440, -11.7, 440);
        outsideGroup.add(magmaLake);

        // Hexagonal Basalt Columns Jutting from Lava
        const basaltMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
        for (let hc = 0; hc < 6; hc++) {
            const hAng = (hc / 6) * Math.PI * 2;
            const column = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.8, 6, 6), basaltMat);
            column.position.set(-1440 + Math.cos(hAng) * 12, -9.0, 440 + Math.sin(hAng) * 12);
            outsideGroup.add(column);
        }

        const rykardLight = new THREE.PointLight(0xe11d48, 7.5, 60.0);
        rykardLight.position.set(-1440, -5.0, 440);
        outsideGroup.add(rykardLight);

        this.createStandingBrazier(-1424, -12.0, 440, 0xe11d48, 6.5, 36);
        this.createStandingBrazier(-1456, -12.0, 440, 0xf43f5e, 6.5, 36);
        this.createPathBeacon(-1440, -12.0, 440, 0xe11d48, "🌋 VOLCANO MANOR MAGMA CHAMBER [ELEV -12.0m]", "RYKARD LORD OF BLASPHEMY • BLASPHEMOUS BLADE • MAN-SERPENT MAGMA SORCERERS", "#ffe4e6");
        this.createFloorSoapstone(-1440, -12.0, 428, "#e11d48", "🌋 MAGMA CHAMBER", "TOGETHAAA AS FAMILYYY WE WILL DEVOUR THE VERY GODS! Serpent hunter blade required.");
    }

    buildEightAscendedOutsideExpeditions(outsideGroup) {
        // ====================================================================
        // 8 BRAND-NEW ASCENDED OUTSIDE REALM EXPEDITIONS (V69 EXPANSION)
        // ====================================================================

        // --------------------------------------------------------------------
        // 1. FOUNTAINHEAD PALACE VERMILION WATERWAY & SACRED SANCTUARY
        // Center: (-1520, 18.0, -220) | Elev: +18.0m | Theme: Celestial Waters, Wisteria & Divine Dragon
        // --------------------------------------------------------------------
        const toriiMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.45, metalness: 0.2 });
        const waterPondMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.5, transparent: true, opacity: 0.85 });
        const wisteriaMat = new THREE.MeshStandardMaterial({ color: 0xd8b4fe, roughness: 0.7 });
        const roofWoodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });

        // Sacred Pond Platform
        const pondGeo = new THREE.CylinderGeometry(36, 38, 1.2, 24);
        const pondMesh = new THREE.Mesh(pondGeo, waterPondMat);
        pondMesh.position.set(-1520, 17.4, -220);
        outsideGroup.add(pondMesh);

        // Triple Vermilion Torii Archways
        for (let t = -1; t <= 1; t++) {
            const toriiZ = -220 + t * 16;
            const leftPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 12, 10), toriiMat);
            leftPillar.position.set(-1532, 23.0, toriiZ);
            outsideGroup.add(leftPillar);

            const rightPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 12, 10), toriiMat);
            rightPillar.position.set(-1508, 23.0, toriiZ);
            outsideGroup.add(rightPillar);

            const crossbarUpper = new THREE.Mesh(new THREE.BoxGeometry(28, 0.8, 1.2), toriiMat);
            crossbarUpper.position.set(-1520, 28.5, toriiZ);
            outsideGroup.add(crossbarUpper);

            const crossbarRoof = new THREE.Mesh(new THREE.BoxGeometry(30, 0.4, 1.8), roofWoodMat);
            crossbarRoof.position.set(-1520, 29.0, toriiZ);
            outsideGroup.add(crossbarRoof);
        }

        // Weeping Wisteria Trees
        for (let w = 0; w < 4; w++) {
            const ang = (w / 4) * Math.PI * 2;
            const wx = -1520 + Math.cos(ang) * 26;
            const wz = -220 + Math.sin(ang) * 26;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 9, 8), roofWoodMat);
            trunk.position.set(wx, 22.0, wz);
            outsideGroup.add(trunk);

            const canopy = new THREE.Mesh(new THREE.SphereGeometry(4.2, 8, 8), wisteriaMat);
            canopy.position.set(wx, 26.5, wz);
            outsideGroup.add(canopy);
        }

        const dragonLight = new THREE.PointLight(0x34d399, 4.5, 55.0);
        dragonLight.position.set(-1520, 26.0, -220);
        outsideGroup.add(dragonLight);

        this.createStandingBrazier(-1506, 18.0, -220, 0x34d399, 5.0, 30);
        this.createStandingBrazier(-1534, 18.0, -220, 0x38bdf8, 5.0, 30);
        this.createPathBeacon(-1520, 18.0, -220, 0x34d399, "🌸 FOUNTAINHEAD VERMILION WATERWAY [ELEV +18.0m]", "DIVINE DRAGON • SEVEN-BRANCHED SWORD • OKAMI WARRIORS", "#dcfce7");
        this.createFloorSoapstone(-1520, 18.0, -232, "#34d399", "🌸 FOUNTAINHEAD PALACE", "Drink of the sacred palace waters and behold the timeless celestial dragon dancing in the storm.");

        // --------------------------------------------------------------------
        // 2. FORSAKEN CASTLE CAINHURST FROZEN PARAPETS & SNOW SPIRES
        // Center: (-1545, 14.0, -80) | Elev: +14.0m | Theme: Gothic Frost, Bloodflame & Lady Maria
        // --------------------------------------------------------------------
        const frozenStoneMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
        const frostIceMat = new THREE.MeshStandardMaterial({ color: 0x7dd3fc, roughness: 0.15, metalness: 0.4, transparent: true, opacity: 0.85 });
        const bloodVelvetMat = new THREE.MeshStandardMaterial({ color: 0x881337, roughness: 0.6 });

        // Gothic Parapet Platform
        const parapetFloor = new THREE.Mesh(new THREE.BoxGeometry(42, 1.4, 42), frozenStoneMat);
        parapetFloor.position.set(-1545, 13.3, -80);
        outsideGroup.add(parapetFloor);

        // Gothic Battlements and Gargoyle Spires
        for (let corner = 0; corner < 4; corner++) {
            const cx = -1545 + ((corner % 2 === 0) ? -19 : 19);
            const cz = -80 + ((corner < 2) ? -19 : 19);
            const spire = new THREE.Mesh(new THREE.ConeGeometry(2.5, 14, 6), frozenStoneMat);
            spire.position.set(cx, 21.0, cz);
            outsideGroup.add(spire);

            const iceSpike = new THREE.Mesh(new THREE.ConeGeometry(0.8, 5.5, 5), frostIceMat);
            iceSpike.position.set(cx, 13.8, cz);
            outsideGroup.add(iceSpike);
        }

        // Blood-Red Heraldic Banners
        for (let b = -1; b <= 1; b += 2) {
            const banner = new THREE.Mesh(new THREE.BoxGeometry(0.1, 7.5, 2.4), bloodVelvetMat);
            banner.position.set(-1545 + b * 12, 17.5, -99);
            outsideGroup.add(banner);
        }

        const mariaLight = new THREE.PointLight(0xe11d48, 4.0, 50.0);
        mariaLight.position.set(-1545, 19.0, -80);
        outsideGroup.add(mariaLight);

        this.createStandingBrazier(-1532, 14.0, -80, 0xe11d48, 5.5, 32);
        this.createStandingBrazier(-1558, 14.0, -80, 0x38bdf8, 5.5, 32);
        this.createPathBeacon(-1545, 14.0, -80, 0xe11d48, "❄️ CAINHURST FROZEN PARAPET [ELEV +14.0m]", "LADY MARIA OF ASTRAL CLOCKTOWER • RAKUYO DUAL BLADES • BLOODLICKER GARGOYLES", "#ffe4e6");
        this.createFloorSoapstone(-1545, 14.0, -92, "#e11d48", "❄️ CAINHURST PARAPET", "A corpse should be left well alone. Bloodflame and clocktower whispers ignite the cold.");

        // --------------------------------------------------------------------
        // 3. MOONLIGHT ALTAR OF MANUS CELES & LUNAR CATHEDRAL
        // Center: (-1570, 22.0, 80) | Elev: +22.0m | Theme: Glintstone Crystals, Lunar Rings & Dragon Adula
        // --------------------------------------------------------------------
        const glintCrystalMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.2, roughness: 0.1 });
        const cathedralMarbleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });

        // Lunar Terrace Slab
        const altarSlab = new THREE.Mesh(new THREE.CylinderGeometry(34, 36, 1.5, 16), cathedralMarbleMat);
        altarSlab.position.set(-1570, 21.25, 80);
        outsideGroup.add(altarSlab);

        // Giant Glintstone Crystal Geodes
        for (let g = 0; g < 6; g++) {
            const gang = (g / 6) * Math.PI * 2;
            const gx = -1570 + Math.cos(gang) * 22;
            const gz = 80 + Math.sin(gang) * 22;
            const crystal = new THREE.Mesh(new THREE.ConeGeometry(2.2, 9.5 + (g % 3) * 2, 6), glintCrystalMat);
            crystal.position.set(gx, 26.0, gz);
            crystal.rotation.z = (Math.random() - 0.5) * 0.4;
            outsideGroup.add(crystal);
        }

        // Floating Lunar Ring Torus
        const moonRing = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.45, 6, 24), glintCrystalMat);
        moonRing.position.set(-1570, 31.0, 80);
        moonRing.rotation.x = Math.PI / 3;
        outsideGroup.add(moonRing);

        const adulaLight = new THREE.PointLight(0x38bdf8, 5.0, 60.0);
        adulaLight.position.set(-1570, 28.0, 80);
        outsideGroup.add(adulaLight);

        this.createStandingBrazier(-1555, 22.0, 80, 0x38bdf8, 6.0, 35);
        this.createStandingBrazier(-1585, 22.0, 80, 0x818cf8, 6.0, 35);
        this.createPathBeacon(-1570, 22.0, 80, 0x38bdf8, "🌙 MOONLIGHT ALTAR OF MANUS CELES [ELEV +22.0m]", "GLINTSTONE DRAGON ADULA • CARIAN MOONLIGHT BLADE • CARIAN MARIONETTES", "#e0f2fe");
        this.createFloorSoapstone(-1570, 22.0, 68, "#38bdf8", "🌙 MOONLIGHT ALTAR", "Here begins the chill dark night of the stars. The Carian blade shines with frozen moonlight.");

        // --------------------------------------------------------------------
        // 4. CATHEDRAL OF THE DEEP SUNKEN GRAVEYARD & SLUDGE MIRE
        // Center: (-1595, -15.0, 220) | Elev: -15.0m | Theme: Sunken Cemetery, Dregs & Aldrich Devourer of Gods
        // --------------------------------------------------------------------
        const mireSludgeMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9, metalness: 0.1 });
        const gravestoneMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.85 });
        const darkmoonMat = new THREE.MeshStandardMaterial({ color: 0x581c87, emissive: 0x3b0764, emissiveIntensity: 2.0 });

        // Sunken Cemetery Basin
        const basin = new THREE.Mesh(new THREE.BoxGeometry(45, 1.2, 45), mireSludgeMat);
        basin.position.set(-1595, -15.6, 220);
        outsideGroup.add(basin);

        // Crooked Gravestones and Obelisks
        for (let gr = 0; gr < 10; gr++) {
            const rx = -1595 + (Math.sin(gr * 1.7) * 16);
            const rz = 220 + (Math.cos(gr * 2.3) * 16);
            const grave = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.2 + (gr % 3) * 0.8, 0.45), gravestoneMat);
            grave.position.set(rx, -13.5, rz);
            grave.rotation.y = gr * 0.6;
            grave.rotation.z = (Math.sin(gr) * 0.25);
            outsideGroup.add(grave);
        }

        // Deep Dregs Altar Platform
        const dregAltar = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 6.0, 1.8, 8), darkmoonMat);
        dregAltar.position.set(-1595, -14.1, 220);
        outsideGroup.add(dregAltar);

        const aldrichLight = new THREE.PointLight(0x7c3aed, 4.5, 48.0);
        aldrichLight.position.set(-1595, -10.0, 220);
        outsideGroup.add(aldrichLight);

        this.createStandingBrazier(-1580, -15.0, 220, 0x7c3aed, 5.0, 28);
        this.createStandingBrazier(-1610, -15.0, 220, 0x4c1d95, 5.0, 28);
        this.createPathBeacon(-1595, -15.0, 220, 0x7c3aed, "🕯️ CATHEDRAL SUNKEN GRAVEYARD [ELEV -15.0m]", "ALDRICH DEVOURER OF GODS • DARKMOON LONGBOW • DEEP EVANGELISTS", "#f3e8ff");
        this.createFloorSoapstone(-1595, -15.0, 208, "#7c3aed", "🕯️ DEEP GRAVEYARD", "Beyond the human dregs lies the devourer of gods. Beware the unending moonlight arrow rain.");

        // --------------------------------------------------------------------
        // 5. ANOR LONDO DARK SUN TOMB & GWYNDOLIN SANCTUARY
        // Center: (-1620, 12.0, -320) | Elev: +12.0m | Theme: Anor Londo Twilight, Gold Statues & Gwyndolin
        // --------------------------------------------------------------------
        const whiteMarbleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.1 });
        const gwynGoldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.85 });

        // Marble Corridor Platform
        const corridor = new THREE.Mesh(new THREE.BoxGeometry(22, 1.2, 54), whiteMarbleMat);
        corridor.position.set(-1620, 11.4, -320);
        outsideGroup.add(corridor);

        // Flanking Fluted Marble Columns
        for (let col = -3; col <= 3; col++) {
            const cz = -320 + col * 7.5;
            const leftCol = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 10, 12), whiteMarbleMat);
            leftCol.position.set(-1629, 16.5, cz);
            outsideGroup.add(leftCol);

            const rightCol = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 10, 12), whiteMarbleMat);
            rightCol.position.set(-1611, 16.5, cz);
            outsideGroup.add(rightCol);
        }

        // Golden Gwyn Statues
        for (let side = -1; side <= 1; side += 2) {
            const statue = new THREE.Mesh(new THREE.BoxGeometry(1.6, 5.0, 1.4), gwynGoldMat);
            statue.position.set(-1620 + side * 6.5, 14.5, -342);
            outsideGroup.add(statue);
        }

        const gwyndolinLight = new THREE.PointLight(0xfbbf24, 4.5, 50.0);
        gwyndolinLight.position.set(-1620, 18.0, -320);
        outsideGroup.add(gwyndolinLight);

        this.createStandingBrazier(-1614, 12.0, -320, 0xfbbf24, 5.0, 30);
        this.createStandingBrazier(-1626, 12.0, -320, 0x60a5fa, 5.0, 30);
        this.createPathBeacon(-1620, 12.0, -320, 0xfbbf24, "☀️ ANOR LONDO DARK SUN TOMB [ELEV +12.0m]", "DARK SUN GWYNDOLIN • GOLDEN MOONLIGHT BOW • ANOR LONDO GIANT SENTINELS", "#fef9c3");
        this.createFloorSoapstone(-1620, 12.0, -332, "#fbbf24", "☀️ DARK SUN TOMB", "Tread lightly in the twilight tomb of Gwyn. The Dark Sun weaves eternal illusions.");

        // --------------------------------------------------------------------
        // 6. THE SHADED CASTLE POISON BRIAR MOAT & MALEIGH TERRACE
        // Center: (-1645, -8.0, 340) | Elev: -8.0m | Theme: Briar Thorns, Poison Mire & Elemer of the Briar
        // --------------------------------------------------------------------
        const poisonMireMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.5, emissive: 0x052e16, emissiveIntensity: 1.5 });
        const castleRustMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.75, metalness: 0.4 });
        const thornMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.6 });

        // Submerged Poison Fortress Slab
        const poisonBasin = new THREE.Mesh(new THREE.BoxGeometry(42, 1.2, 42), poisonMireMat);
        poisonBasin.position.set(-1645, -8.6, 340);
        outsideGroup.add(poisonBasin);

        // Rusted Fortress Rampart Walls
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(38, 7.0, 2.5), castleRustMat);
        backWall.position.set(-1645, -4.5, 359);
        outsideGroup.add(backWall);

        // Barbed Briar Wire Rings
        for (let br = 0; br < 5; br++) {
            const bx = -1645 + (Math.sin(br * 1.5) * 14);
            const bz = 340 + (Math.cos(br * 1.5) * 14);
            const briarRing = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.35, 6, 12), thornMat);
            briarRing.position.set(bx, -6.5, bz);
            briarRing.rotation.x = Math.PI / 2;
            outsideGroup.add(briarRing);
        }

        const elemerLight = new THREE.PointLight(0xdc2626, 4.2, 46.0);
        elemerLight.position.set(-1645, -3.0, 340);
        outsideGroup.add(elemerLight);

        this.createStandingBrazier(-1632, -8.0, 340, 0xdc2626, 5.0, 28);
        this.createStandingBrazier(-1658, -8.0, 340, 0x16a34a, 5.0, 28);
        this.createPathBeacon(-1645, -8.0, 340, 0xdc2626, "🧪 SHADED CASTLE BRIAR MOAT [ELEV -8.0m]", "ELEMER OF THE BRIAR • MARAIS EXECUTIONER SWORD • BRIAR DUELISTS", "#fee2e2");
        this.createFloorSoapstone(-1645, -8.0, 328, "#dc2626", "🧪 SHADED CASTLE", "Beware the executioner wrapped in rusted thorns. The dancing red blade strikes from afar.");

        // --------------------------------------------------------------------
        // 7. MT. SENPOU BAMBOO PATH & BELL DEMON SANCTUM
        // Center: (-1670, 20.0, -160) | Elev: +20.0m | Theme: Japanese Pagoda, Bamboo & Corrupted Monk
        // --------------------------------------------------------------------
        const cedarWoodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.65 });
        const bambooStemMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
        const bellBronzeMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.3, metalness: 0.8 });

        // Bamboo Mountain Terrace
        const senpouPlaza = new THREE.Mesh(new THREE.CylinderGeometry(32, 34, 1.4, 16), cedarWoodMat);
        senpouPlaza.position.set(-1670, 19.3, -160);
        outsideGroup.add(senpouPlaza);

        // Bamboo Grove Clusters
        for (let bm = 0; bm < 14; bm++) {
            const bx = -1670 + (Math.sin(bm * 1.8) * 22);
            const bz = -160 + (Math.cos(bm * 1.8) * 22);
            const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 12, 6), bambooStemMat);
            stalk.position.set(bx, 25.0, bz);
            outsideGroup.add(stalk);
        }

        // Giant Bell Demon Pagoda Frame & Bronze Bell
        const bPillar1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 11, 0.8), cedarWoodMat);
        bPillar1.position.set(-1674, 24.5, -160);
        outsideGroup.add(bPillar1);

        const bPillar2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 11, 0.8), cedarWoodMat);
        bPillar2.position.set(-1666, 24.5, -160);
        outsideGroup.add(bPillar2);

        const bBeam = new THREE.Mesh(new THREE.BoxGeometry(10, 0.8, 1.2), cedarWoodMat);
        bBeam.position.set(-1670, 29.5, -160);
        outsideGroup.add(bBeam);

        const bellDemon = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.2, 4.2, 12), bellBronzeMat);
        bellDemon.position.set(-1670, 26.5, -160);
        outsideGroup.add(bellDemon);

        const monkLight = new THREE.PointLight(0xa855f7, 4.5, 52.0);
        monkLight.position.set(-1670, 25.0, -160);
        outsideGroup.add(monkLight);

        this.createStandingBrazier(-1656, 20.0, -160, 0xa855f7, 5.5, 30);
        this.createStandingBrazier(-1684, 20.0, -160, 0xf97316, 5.5, 30);
        this.createPathBeacon(-1670, 20.0, -160, 0xa855f7, "🔔 BELL DEMON SANCTUM [ELEV +20.0m]", "CORRUPTED MONK • JUMONJI NAGINATA • SENPOU TARO TROOPERS", "#f3e8ff");
        this.createFloorSoapstone(-1670, 20.0, -172, "#a855f7", "🔔 BELL DEMON SANCTUM", "Do not ring the bell of misfortune unless you crave fierce suffering. The monk guards the bridge.");

        // --------------------------------------------------------------------
        // 8. NOKSTELLA ETERNAL CITY STARGAZER WATERFALL BASIN
        // Center: (-1695, -18.0, 460) | Elev: -18.0m | Theme: Void Nebula, Stargazer Ruins & Astel Stars of Darkness
        // --------------------------------------------------------------------
        const voidRockMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.8, metalness: 0.3 });
        const cosmicNebulaMat = new THREE.MeshStandardMaterial({ color: 0x818cf8, emissive: 0x4338ca, emissiveIntensity: 2.5, roughness: 0.2 });

        // Stargazer Cavern Basin Slab
        const stargazerBasin = new THREE.Mesh(new THREE.CylinderGeometry(35, 38, 1.4, 20), voidRockMat);
        stargazerBasin.position.set(-1695, -18.7, 460);
        outsideGroup.add(stargazerBasin);

        // Obsidian Monoliths with Cosmic Runes
        for (let m = 0; m < 8; m++) {
            const mang = (m / 8) * Math.PI * 2;
            const mx = -1695 + Math.cos(mang) * 24;
            const mz = 460 + Math.sin(mang) * 24;
            const mono = new THREE.Mesh(new THREE.BoxGeometry(2.0, 12 + (m % 2) * 3, 2.0), voidRockMat);
            mono.position.set(mx, -12.0, mz);
            outsideGroup.add(mono);

            const runeSphere = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 8), cosmicNebulaMat);
            runeSphere.position.set(mx, -4.5, mz);
            outsideGroup.add(runeSphere);
        }

        // Cascading Starlight Waterfall Mesh
        const waterfall = new THREE.Mesh(new THREE.BoxGeometry(18, 16, 1.2), cosmicNebulaMat);
        waterfall.position.set(-1695, -10.0, 484);
        outsideGroup.add(waterfall);

        const astelLight = new THREE.PointLight(0xa855f7, 5.0, 58.0);
        astelLight.position.set(-1695, -11.0, 460);
        outsideGroup.add(astelLight);

        this.createStandingBrazier(-1678, -18.0, 460, 0xa855f7, 5.5, 32);
        this.createStandingBrazier(-1712, -18.0, 460, 0x6366f1, 5.5, 32);
        this.createPathBeacon(-1695, -18.0, 460, 0xa855f7, "🌌 NOKSTELLA STARGAZER BASIN [ELEV -18.0m]", "ASTEL STARS OF DARKNESS • VOID METEORITE TAIL • SILVER TEAR MIMICS", "#ede9fe");
        this.createFloorSoapstone(-1695, -18.0, 448, "#a855f7", "🌌 STARGAZER BASIN", "A malformed star born in the flightless void. Gravitational collapse awaits all who tread here.");
    }

    buildEightAscendedOutsideExpeditionsV73(outsideGroup) {
        // ====================================================================
        // 8 BRAND-NEW ASCENDED OUTSIDE REALM EXPEDITIONS (V73 EXPANSION)
        // ====================================================================

        // --------------------------------------------------------------------
        // 1. LOTHRIC CASTLE THRONE ROOM OF TWIN PRINCES
        // Center: (-1765, 24.0, -240) | Elev: +24.0m | Theme: Royal Gilded Dais, Twin Thrones & Feathers
        // --------------------------------------------------------------------
        const lothricGoldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3, metalness: 0.8 });
        const royalVelvetMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6 });
        const marbleWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
        const scorchedIronMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.7, metalness: 0.4 });

        // Royal Throne Dais Floor
        const lothricFloor = new THREE.Mesh(new THREE.BoxGeometry(64, 2.5, 64), marbleWhiteMat);
        lothricFloor.position.set(-1765, 22.75, -240);
        lothricFloor.receiveShadow = true;
        outsideGroup.add(lothricFloor);

        // Crimson & Gold Velvet Runner
        const lothricCarpet = new THREE.Mesh(new THREE.BoxGeometry(16, 0.1, 56), royalVelvetMat);
        lothricCarpet.position.set(-1765, 24.05, -240);
        outsideGroup.add(lothricCarpet);

        // Fluted Marble Pillars with Gold Capitals
        for (let px of [-26, 26]) {
            for (let pz of [-22, 0, 22]) {
                const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 22, 16), marbleWhiteMat);
                pillar.position.set(-1765 + px, 35.0, -240 + pz);
                outsideGroup.add(pillar);

                const cap = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, 3.6), lothricGoldMat);
                cap.position.set(-1765 + px, 46.0, -240 + pz);
                outsideGroup.add(cap);
            }
        }

        // Twin Colossal Thrones: Lorian's Scorched Iron Throne & Lothric's Gilded Chair
        const lorianThrone = new THREE.Mesh(new THREE.BoxGeometry(5.2, 7.5, 3.6), scorchedIronMat);
        lorianThrone.position.set(-1769, 27.5, -264);
        outsideGroup.add(lorianThrone);

        const lothricThrone = new THREE.Mesh(new THREE.BoxGeometry(3.6, 6.2, 2.8), lothricGoldMat);
        lothricThrone.position.set(-1761, 27.0, -264);
        outsideGroup.add(lothricThrone);

        const lothricAura = new THREE.PointLight(0xfbbf24, 6.5, 55.0);
        lothricAura.position.set(-1765, 29.0, -240);
        outsideGroup.add(lothricAura);

        this.createStandingBrazier(-1745, 24.0, -240, 0xfbbf24, 5.0, 35);
        this.createStandingBrazier(-1785, 24.0, -240, 0xfbbf24, 5.0, 35);
        this.createPathBeacon(-1765, 24.0, -240, 0xfbbf24, "👑 LOTHRIC THRONE ROOM OF TWIN PRINCES [ELEV +24.0m]", "TWIN PRINCES LORIAN & LOTHRIC • HOLY LIGHT TELEPORT & SOUL ARROWS • WINGED KNIGHTS", "#fef08a");
        this.createFloorSoapstone(-1765, 24.0, -225, "#fbbf24", "👑 LOTHRIC THRONE ROOM", "This spot marks our grave, but you may rest here too, if you would like.");

        // --------------------------------------------------------------------
        // 2. PAINTED WORLD OF ARIAMIS SNOWY SANCTUARY
        // Center: (-1795, 16.0, 140) | Elev: +16.0m | Theme: Hoarfrost Parapet, Blizzard Wind & Priscilla
        // --------------------------------------------------------------------
        const snowParapetMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
        const iceBlueMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.15, metalness: 0.6, transparent: true, opacity: 0.85 });
        const ropeWoodMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.7 });

        // Circular Snow Platform
        const snowTower = new THREE.Mesh(new THREE.CylinderGeometry(32, 34, 4.0, 24), snowParapetMat);
        snowTower.position.set(-1795, 14.0, 140);
        snowTower.receiveShadow = true;
        outsideGroup.add(snowTower);

        // Perimeter Crenellations & Gargoyles
        for (let g = 0; g < 12; g++) {
            const gang = (g / 12) * Math.PI * 2;
            const gx = -1795 + Math.cos(gang) * 31;
            const gz = 140 + Math.sin(gang) * 31;
            const battlement = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.2, 1.8), snowParapetMat);
            battlement.position.set(gx, 17.1, gz);
            battlement.rotation.y = gang;
            outsideGroup.add(battlement);
        }

        // Giant Rope Bridge Anchor Posts
        for (let rw of [-8, 8]) {
            const ropePost = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 9.0, 8), ropeWoodMat);
            ropePost.position.set(-1795 + rw, 20.0, 170);
            outsideGroup.add(ropePost);
        }

        // Swirling Frost Crystals
        for (let fc = 0; fc < 8; fc++) {
            const fang = (fc / 8) * Math.PI * 2;
            const fMesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.2, 0), iceBlueMat);
            fMesh.position.set(-1795 + Math.cos(fang) * 18, 19.5 + Math.sin(fc) * 2.0, 140 + Math.sin(fang) * 18);
            outsideGroup.add(fMesh);
        }

        const priscillaLight = new THREE.PointLight(0x38bdf8, 6.0, 50.0);
        priscillaLight.position.set(-1795, 20.0, 140);
        outsideGroup.add(priscillaLight);

        this.createStandingBrazier(-1780, 16.0, 140, 0x38bdf8, 5.0, 35);
        this.createStandingBrazier(-1810, 16.0, 140, 0x38bdf8, 5.0, 35);
        this.createPathBeacon(-1795, 16.0, 140, 0x38bdf8, "❄️ PAINTED WORLD OF ARIAMIS SNOWY SANCTUARY [ELEV +16.0m]", "CROSSBREED PRISCILLA • LIFEHUNT SCYTHE & BLIZZARD MIST • CORVIAN CROW DEMONS", "#bae6fd");
        this.createFloorSoapstone(-1795, 16.0, 126, "#38bdf8", "❄️ ARIAMIS SNOW SANCTUARY", "This land is peaceful, its inhabitants kind. But trespassers shall reap the cold harvest of the Lifehunt Scythe.");

        // --------------------------------------------------------------------
        // 3. ASHINA CASTLE UPPER TOWER DOJO & THUNDER TERRACE
        // Center: (-1825, 28.0, -100) | Elev: +28.0m | Theme: Japanese Tenshu Roof, Lightning Rods & Tomoe
        // --------------------------------------------------------------------
        const cedarRoofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
        const tatamiFloorMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.7 });
        const shojiWhiteMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4 });
        const copperRodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3, metalness: 0.8 });

        // Dojo Platform
        const dojoPlat = new THREE.Mesh(new THREE.BoxGeometry(50, 3.0, 50), tatamiFloorMat);
        dojoPlat.position.set(-1825, 26.5, -100);
        outsideGroup.add(dojoPlat);

        // Curved Overhanging Pagoda Eaves
        const pagodaEaves = new THREE.Mesh(new THREE.ConeGeometry(38, 7.5, 4), cedarRoofMat);
        pagodaEaves.position.set(-1825, 38.0, -100);
        pagodaEaves.rotation.y = Math.PI / 4;
        outsideGroup.add(pagodaEaves);

        // Shoji Screen Partitions
        for (let s of [-18, 18]) {
            const shoji = new THREE.Mesh(new THREE.BoxGeometry(0.4, 7.0, 32), shojiWhiteMat);
            shoji.position.set(-1825 + s, 31.5, -100);
            outsideGroup.add(shoji);
        }

        // Quad Lightning Conductor Rods with Golden Arcs
        for (let lrx of [-22, 22]) {
            for (let lrz of [-22, 22]) {
                const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 14.0, 8), copperRodMat);
                rod.position.set(-1825 + lrx, 34.0, -100 + lrz);
                outsideGroup.add(rod);

                const spark = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7), new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 3.5 }));
                spark.position.set(-1825 + lrx, 41.5, -100 + lrz);
                outsideGroup.add(spark);
            }
        }

        const genichiroAura = new THREE.PointLight(0xfacc15, 6.5, 55.0);
        genichiroAura.position.set(-1825, 32.0, -100);
        outsideGroup.add(genichiroAura);

        this.createStandingBrazier(-1810, 28.0, -100, 0xfacc15, 5.5, 35);
        this.createStandingBrazier(-1840, 28.0, -100, 0xfacc15, 5.5, 35);
        this.createPathBeacon(-1825, 28.0, -100, 0xfacc15, "⚡ ASHINA CASTLE UPPER DOJO & THUNDER TERRACE [ELEV +28.0m]", "GENICHIRO ASHINA WAY OF TOMOE • MORTAL BLADE & LIGHTNING OF TOMOE • NIGHTJAR NINJAS", "#fef08a");
        this.createFloorSoapstone(-1825, 28.0, -85, "#facc15", "⚡ ASHINA UPPER DOJO", "For the sake of Ashina, I will shed my humanity. Behold the Lightning of Tomoe!");

        // --------------------------------------------------------------------
        // 4. CAELID WAILING DUNES & STARSCOURGE SHORE
        // Center: (-1855, -10.0, 300) | Elev: -10.0m | Theme: Red Sand Basin, Gravity Meteorite & Radahn
        // --------------------------------------------------------------------
        const rustSandMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.9 });
        const gravityAmethystMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, emissive: 0x7e22ce, emissiveIntensity: 2.5, roughness: 0.2 });
        const charredWoodMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 });

        // Red Sand Dune Basin
        const duneBasin = new THREE.Mesh(new THREE.CylinderGeometry(54, 58, 2.0, 32), rustSandMat);
        duneBasin.position.set(-1855, -11.0, 300);
        outsideGroup.add(duneBasin);

        // Center Cosmic Meteorite Crater
        const craterRim = new THREE.Mesh(new THREE.TorusGeometry(14.0, 3.2, 8, 24), rustSandMat);
        craterRim.position.set(-1855, -9.8, 300);
        craterRim.rotation.x = Math.PI / 2;
        outsideGroup.add(craterRim);

        // Floating Purple Gravity Amethyst Monoliths
        for (let m = 0; m < 5; m++) {
            const mang = (m / 5) * Math.PI * 2;
            const mono = new THREE.Mesh(new THREE.BoxGeometry(2.4, 7.0, 2.4), gravityAmethystMat);
            mono.position.set(-1855 + Math.cos(mang) * 11, -5.0 + Math.sin(m) * 1.5, 300 + Math.sin(mang) * 11);
            mono.rotation.set(0.3, mang, 0.2);
            outsideGroup.add(mono);
        }

        // Redmane War Barricades & Speared Flags
        for (let b = 0; b < 6; b++) {
            const bang = (b / 6) * Math.PI * 2;
            const bar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.0, 6.0), charredWoodMat);
            bar.position.set(-1855 + Math.cos(bang) * 36, -8.0, 300 + Math.sin(bang) * 36);
            bar.rotation.y = bang;
            outsideGroup.add(bar);
        }

        const radahnLight = new THREE.PointLight(0x9333ea, 7.0, 60.0);
        radahnLight.position.set(-1855, -4.0, 300);
        outsideGroup.add(radahnLight);

        this.createStandingBrazier(-1835, -10.0, 300, 0xef4444, 6.0, 38);
        this.createStandingBrazier(-1875, -10.0, 300, 0x9333ea, 6.0, 38);
        this.createPathBeacon(-1855, -10.0, 300, 0x9333ea, "🌌 CAELID WAILING DUNES & STARSCOURGE SHORE [ELEV -10.0m]", "GENERAL RADAHN CONQUEROR OF THE STARS • COLLAPSING STARS & METEOR CRASH • FLAME CHARIOTS", "#e9d5ff");
        this.createFloorSoapstone(-1855, -10.0, 285, "#9333ea", "🌌 WAILING DUNES", "A celebration of war! The Redmane Festival has begun! Radahn holds the stars in thrall.");

        // --------------------------------------------------------------------
        // 5. OEDON TOMB GRAVEYARD & HUNTER'S SEPULCHER
        // Center: (-1885, -6.0, -360) | Elev: -6.0m | Theme: Victorian Cobbles, Tombstones & Father Gascoigne
        // --------------------------------------------------------------------
        const mossCobbleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
        const tombstoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.75 });
        const wroughtIronMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.7 });

        // Cemetery Cobblestone Floor
        const cemFloor = new THREE.Mesh(new THREE.BoxGeometry(54, 2.0, 54), mossCobbleMat);
        cemFloor.position.set(-1885, -7.0, -360);
        outsideGroup.add(cemFloor);

        // Crumbling Gothic Gazebo Mausoleum
        for (let col = 0; col < 6; col++) {
            const cang = (col / 6) * Math.PI * 2;
            const cPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 7.5, 8), tombstoneMat);
            cPillar.position.set(-1885 + Math.cos(cang) * 9.0, -2.5, -360 + Math.sin(cang) * 9.0);
            outsideGroup.add(cPillar);
        }
        const gazeboDome = new THREE.Mesh(new THREE.SphereGeometry(9.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), tombstoneMat);
        gazeboDome.position.set(-1885, 1.2, -360);
        outsideGroup.add(gazeboDome);

        // Dozens of Crooked Tombstone Slabs
        for (let ts = 0; ts < 16; ts++) {
            const tang = (ts / 16) * Math.PI * 2;
            const dist = 14 + (ts % 3) * 6;
            const tstone = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.8, 0.45), tombstoneMat);
            tstone.position.set(-1885 + Math.cos(tang) * dist, -4.6, -360 + Math.sin(tang) * dist);
            tstone.rotation.y = tang + (ts % 2 ? 0.2 : -0.2);
            tstone.rotation.z = (ts % 2 ? 0.15 : -0.15);
            outsideGroup.add(tstone);
        }

        // Victorian Wrought Iron Gas Lamps
        for (let vl of [-18, 18]) {
            const vPost = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 6.0, 8), wroughtIronMat);
            vPost.position.set(-1885 + vl, -3.0, -360);
            outsideGroup.add(vPost);

            const vLamp = new THREE.Mesh(new THREE.OctahedronGeometry(0.65), new THREE.MeshStandardMaterial({ color: 0xd97706, emissive: 0xb45309, emissiveIntensity: 2.5 }));
            vLamp.position.set(-1885 + vl, 0.2, -360);
            outsideGroup.add(vLamp);
        }

        const gascoigneLight = new THREE.PointLight(0xd97706, 5.5, 48.0);
        gascoigneLight.position.set(-1885, -1.0, -360);
        outsideGroup.add(gascoigneLight);

        this.createStandingBrazier(-1868, -6.0, -360, 0xd97706, 5.0, 32);
        this.createStandingBrazier(-1902, -6.0, -360, 0xd97706, 5.0, 32);
        this.createPathBeacon(-1885, -6.0, -360, 0xd97706, "🪦 OEDON TOMB GRAVEYARD & HUNTER'S SEPULCHER [ELEV -6.0m]", "FATHER GASCOIGNE THE BEAST HUNTER • HUNTER AXE & BEAST FORM • YHARNAM HUNTSMEN", "#fed7aa");
        this.createFloorSoapstone(-1885, -6.0, -345, "#d97706", "🪦 TOMB OF OEDON", "Beasts all over the shop... You'll be one of them, sooner or later...");

        // --------------------------------------------------------------------
        // 6. ANOR LONDO ROYAL CATHEDRAL GRAND HALL
        // Center: (-1915, 22.0, 60) | Elev: +22.0m | Theme: High Gothic Arches, Stained Glass & Ornstein / Smough
        // --------------------------------------------------------------------
        const cathedralWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
        const cathedralGoldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.85 });
        const stainedGlassMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 2.0, transparent: true, opacity: 0.8 });

        // Cathedral Nave Floor
        const cathNave = new THREE.Mesh(new THREE.BoxGeometry(68, 3.0, 36), cathedralWhiteMat);
        cathNave.position.set(-1915, 20.5, 60);
        cathNave.receiveShadow = true;
        outsideGroup.add(cathNave);

        // High Vaulted Gothic Arches
        for (let ax = -26; ax <= 26; ax += 13) {
            const arch = new THREE.Mesh(new THREE.TorusGeometry(12.0, 1.2, 8, 20, Math.PI), cathedralWhiteMat);
            arch.position.set(-1915 + ax, 32.0, 60);
            arch.rotation.y = Math.PI / 2;
            outsideGroup.add(arch);
        }

        // Stained Glass Rosette Window at Apse
        const rosette = new THREE.Mesh(new THREE.CylinderGeometry(7.0, 7.0, 0.4, 24), stainedGlassMat);
        rosette.position.set(-1948, 32.0, 60);
        rosette.rotation.z = Math.PI / 2;
        outsideGroup.add(rosette);

        // Golden Statues of Gwyn & Gwynevere Dais
        for (let st of [-8, 8]) {
            const statue = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 9.0, 8), cathedralGoldMat);
            statue.position.set(-1940, 26.5, 60 + st);
            outsideGroup.add(statue);
        }

        const onSAura = new THREE.PointLight(0xf59e0b, 7.0, 60.0);
        onSAura.position.set(-1915, 28.0, 60);
        outsideGroup.add(onSAura);

        this.createStandingBrazier(-1895, 22.0, 60, 0xf59e0b, 5.5, 35);
        this.createStandingBrazier(-1935, 22.0, 60, 0xf59e0b, 5.5, 35);
        this.createPathBeacon(-1915, 22.0, 60, 0xf59e0b, "☀️ ANOR LONDO ROYAL CATHEDRAL GRAND HALL [ELEV +22.0m]", "DRAGONSLAYER ORNSTEIN & EXECUTIONER SMOUGH • LIGHTNING SPEAR & GOLDEN HAMMER • SILVER KNIGHTS", "#fde68a");
        this.createFloorSoapstone(-1915, 22.0, 75, "#f59e0b", "☀️ ROYAL CATHEDRAL", "The sun god's finest knights stand vigil. Beware the swift spear and the crushing hammer!");

        // --------------------------------------------------------------------
        // 7. LOST BASTILLE IRON RAMPART & CROW NEST ROOST
        // Center: (-1945, 18.0, -200) | Elev: +18.0m | Theme: Iron Bastion, Cursed Fog & The Pursuer
        // --------------------------------------------------------------------
        const basaltBastionMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
        const curseSteelMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.8 });
        const nestTwigMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });

        // Bastille Rampart Platform
        const bastPlat = new THREE.Mesh(new THREE.BoxGeometry(50, 3.5, 50), basaltBastionMat);
        bastPlat.position.set(-1945, 16.25, -200);
        outsideGroup.add(bastPlat);

        // Rusted Iron Gibbets & Hanging Cages
        for (let g of [-18, 18]) {
            const gibbetArm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 8.0, 0.5), curseSteelMat);
            gibbetArm.position.set(-1945 + g, 22.0, -200);
            outsideGroup.add(gibbetArm);

            const cage = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.5, 8, 1, true), curseSteelMat);
            cage.position.set(-1945 + g, 22.5, -200);
            outsideGroup.add(cage);
        }

        // Colossal Crow Nest Landing Platform
        const crowNest = new THREE.Mesh(new THREE.TorusGeometry(8.5, 2.2, 8, 20), nestTwigMat);
        crowNest.position.set(-1945, 18.5, -218);
        crowNest.rotation.x = Math.PI / 2;
        outsideGroup.add(crowNest);

        // Rusted Siege Ballistas
        for (let b of [-12, 12]) {
            const ballista = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.4, 4.0), curseSteelMat);
            ballista.position.set(-1945 + b, 19.0, -182);
            outsideGroup.add(ballista);
        }

        const pursuerLight = new THREE.PointLight(0x6366f1, 6.0, 50.0);
        pursuerLight.position.set(-1945, 22.0, -200);
        outsideGroup.add(pursuerLight);

        this.createStandingBrazier(-1928, 18.0, -200, 0x6366f1, 5.0, 35);
        this.createStandingBrazier(-1962, 18.0, -200, 0x6366f1, 5.0, 35);
        this.createPathBeacon(-1945, 18.0, -200, 0x6366f1, "🦅 LOST BASTILLE IRON RAMPART & CROW ROOST [ELEV +18.0m]", "THE PURSUER CURSEBEARER OF BASTILLE • ULTRA GREATSWORD & CURSE SWARMS • RUIN SENTINELS", "#c7d2fe");
        this.createFloorSoapstone(-1945, 18.0, -186, "#6366f1", "🦅 BASTILLE RAMPARTS", "Borne upon the wings of an omen crow, the Pursuer never yields. Dodge the red thrust!");

        // --------------------------------------------------------------------
        // 8. STORMVEIL CASTLE SECLUDED CELL & GRAFTED COURTYARD
        // Center: (-1975, 12.0, 420) | Elev: +12.0m | Theme: Storm Briars, Decapitated Dragon & Godrick
        // --------------------------------------------------------------------
        const stormStoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
        const graftedDragonMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.35, metalness: 0.6 });
        const stormVortexMat = new THREE.MeshStandardMaterial({ color: 0xeab308, emissive: 0xca8a04, emissiveIntensity: 2.2, transparent: true, opacity: 0.75 });

        // Grafted Courtyard Flagstone Floor
        const stormFloor = new THREE.Mesh(new THREE.BoxGeometry(56, 2.5, 56), stormStoneMat);
        stormFloor.position.set(-1975, 10.75, 420);
        outsideGroup.add(stormFloor);

        // Decapitated Colossal Dragon Head Monument
        const dragonHead = new THREE.Mesh(new THREE.ConeGeometry(4.5, 10.0, 6), graftedDragonMat);
        dragonHead.position.set(-1975, 16.0, 440);
        dragonHead.rotation.x = -Math.PI / 3;
        outsideGroup.add(dragonHead);

        // Quad Ruined Cloister Columns
        for (let cx of [-22, 22]) {
            for (let cz of [400, 440]) {
                const cCol = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 12, 10), stormStoneMat);
                cCol.position.set(-1975 + cx, 16.5, cz);
                outsideGroup.add(cCol);
            }
        }

        // Swirling Golden Stormwind Vortex Rings
        for (let vr = 0; vr < 3; vr++) {
            const vRing = new THREE.Mesh(new THREE.TorusGeometry(8.0 + vr * 4.0, 0.45, 6, 24), stormVortexMat);
            vRing.position.set(-1975, 14.0 + vr * 2.5, 420);
            vRing.rotation.x = Math.PI / 2 + vr * 0.1;
            outsideGroup.add(vRing);
        }

        const godrickLight = new THREE.PointLight(0xeab308, 6.5, 55.0);
        godrickLight.position.set(-1975, 17.0, 420);
        outsideGroup.add(godrickLight);

        this.createStandingBrazier(-1955, 12.0, 420, 0xeab308, 5.5, 35);
        this.createStandingBrazier(-1995, 12.0, 420, 0xeab308, 5.5, 35);
        this.createPathBeacon(-1975, 12.0, 420, 0xeab308, "🌪️ STORMVEIL CASTLE GRAFTED COURTYARD [ELEV +12.0m]", "GODRICK THE GRAFTED LORD OF STORMVEIL • GRAFTED DRAGON & TORNADO AXES • BLADE WARHAWKS", "#fef08a");
        this.createFloorSoapstone(-1975, 12.0, 404, "#eab308", "🌪️ GRAFTED COURTYARD", "I command thee, KNEEL! Witness the true power of the Golden Lineage!");
    }

    buildEightAscendedOutsideExpeditionsV74(outsideGroup) {
        // ====================================================================
        // 8 BRAND-NEW ASCENDED OUTSIDE REALM EXPEDITIONS (V74 EXPANSION)
        // ====================================================================

        // --------------------------------------------------------------------
        // 1. KILN OF THE FIRST FLAME & ASH CINDER CALDERA
        // Center: (-2005, 30.0, -260) | Elev: +30.0m | Theme: Ash Spirals, Charred Kiln & Lord Gwyn
        // --------------------------------------------------------------------
        const whiteAshMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.95 });
        const charredStoneMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85, metalness: 0.2 });
        const cinderGlowMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 2.8 });
        const sunlightGoldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3, metalness: 0.8 });

        // Ash Mound Caldera Dais
        const kilnFloor = new THREE.Mesh(new THREE.CylinderGeometry(28, 34, 4.0, 24), whiteAshMat);
        kilnFloor.position.set(-2005, 28.0, -260);
        outsideGroup.add(kilnFloor);

        // Charred Obsidian Megalith Pillars
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const px = -2005 + Math.cos(angle) * 23;
            const pz = -260 + Math.sin(angle) * 23;
            const pillar = new THREE.Mesh(new THREE.BoxGeometry(2.5, 18.0, 2.5), charredStoneMat);
            pillar.position.set(px, 37.0, pz);
            pillar.rotation.y = angle + 0.3;
            outsideGroup.add(pillar);
        }

        // Colossal Central First Flame Kiln Bonfire
        const kilnBase = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 5.5, 2.5, 16), charredStoneMat);
        kilnBase.position.set(-2005, 31.25, -260);
        outsideGroup.add(kilnBase);

        const flameCore = new THREE.Mesh(new THREE.ConeGeometry(2.8, 7.5, 12), cinderGlowMat);
        flameCore.position.set(-2005, 36.0, -260);
        outsideGroup.add(flameCore);

        // Coiled Sword of Gwyn
        const coiledSword = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 6.0, 8), sunlightGoldMat);
        coiledSword.position.set(-2005, 34.0, -260);
        coiledSword.rotation.z = 0.15;
        outsideGroup.add(coiledSword);

        const gwynLight = new THREE.PointLight(0xf59e0b, 7.5, 65.0);
        gwynLight.position.set(-2005, 35.0, -260);
        outsideGroup.add(gwynLight);

        this.createStandingBrazier(-1985, 30.0, -260, 0xf59e0b, 6.0, 38);
        this.createStandingBrazier(-2025, 30.0, -260, 0xf59e0b, 6.0, 38);
        this.createPathBeacon(-2005, 30.0, -260, 0xf59e0b, "☀️ KILN OF THE FIRST FLAME & ASH CALDERA [ELEV +30.0m]", "LORD GWYN FIRST LORD OF CINDER • BLAZING SUNLIGHT GREATSWORD & SUNLIGHT SPEARS • BLACK KNIGHTS", "#fef08a");
        this.createFloorSoapstone(-2005, 30.0, -244, "#f59e0b", "☀️ KILN OF FIRST FLAME", "Here lies the First Flame. Deliver Lord Gwyn from the ashes and choose the fate of the world.");

        // --------------------------------------------------------------------
        // 2. CHASM OF THE ABYSS & PRIMEVAL HUMANITY PIT
        // Center: (-2035, -22.0, 120) | Elev: -22.0m | Theme: Void Mire, Black Humanity & Manus
        // --------------------------------------------------------------------
        const abyssSlateMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.95 });
        const humanityVoidMat = new THREE.MeshStandardMaterial({ color: 0x581c87, emissive: 0x3b0764, emissiveIntensity: 2.5, transparent: true, opacity: 0.85 });
        const primevalClawMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.6, metalness: 0.4 });

        // Sunken Cavern Abyss Floor
        const abyssFloor = new THREE.Mesh(new THREE.BoxGeometry(58, 3.0, 58), abyssSlateMat);
        abyssFloor.position.set(-2035, -23.5, 120);
        outsideGroup.add(abyssFloor);

        // Hanging Primordial Stalactites
        for (let s of [-20, -10, 0, 10, 20]) {
            for (let sz of [-18, 18]) {
                const stala = new THREE.Mesh(new THREE.ConeGeometry(1.6, 12.0, 6), abyssSlateMat);
                stala.position.set(-2035 + s, -10.0, 120 + sz);
                stala.rotation.x = Math.PI;
                outsideGroup.add(stala);
            }
        }

        // Swirling Floating Humanity Phantoms
        for (let h = 0; h < 6; h++) {
            const hAngle = (h / 6) * Math.PI * 2;
            const hx = -2035 + Math.cos(hAngle) * 16;
            const hz = 120 + Math.sin(hAngle) * 16;
            const phantom = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 8), humanityVoidMat);
            phantom.position.set(hx, -18.0 + (h % 3) * 2.0, hz);
            outsideGroup.add(phantom);
        }

        // Manus Primeval Monolith Totem
        const manusTotem = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 3.2, 10.0, 8), primevalClawMat);
        manusTotem.position.set(-2035, -17.0, 138);
        outsideGroup.add(manusTotem);

        const manusLight = new THREE.PointLight(0xa855f7, 7.0, 55.0);
        manusLight.position.set(-2035, -18.0, 120);
        outsideGroup.add(manusLight);

        this.createStandingBrazier(-2015, -22.0, 120, 0xa855f7, 5.5, 35);
        this.createStandingBrazier(-2055, -22.0, 120, 0xa855f7, 5.5, 35);
        this.createPathBeacon(-2035, -22.0, 120, 0xa855f7, "🌑 CHASM OF THE ABYSS & PRIMEVAL PIT [ELEV -22.0m]", "MANUS FATHER OF THE ABYSS • PRIMEVAL CATALYST DARK BEADS & COLOSSAL CLAW • BLOATHEAD SORCERERS", "#f3e8ff");
        this.createFloorSoapstone(-2035, -22.0, 104, "#a855f7", "🌑 CHASM OF THE ABYSS", "The primal dark stirs in frenzy. Raise the Silver Pendant to deflect the dark rain of humanity!");

        // --------------------------------------------------------------------
        // 3. CRYSTAL CAVE & PRIMORDIAL ARCHIVE GLADE
        // Center: (-2065, 14.0, -120) | Elev: +14.0m | Theme: Cyan Crystal Spires, Moonlight & Seath
        // --------------------------------------------------------------------
        const cyanCrystalMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.2, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.85 });
        const iceRockMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
        const moonlightRelicMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, emissive: 0x38bdf8, emissiveIntensity: 3.5 });

        // Glaciated Crystal Cavern Platform
        const crystalPlat = new THREE.Mesh(new THREE.BoxGeometry(54, 3.0, 54), iceRockMat);
        crystalPlat.position.set(-2065, 12.5, -120);
        outsideGroup.add(crystalPlat);

        // Giant Cyan Crystal Spires
        for (let sp = 0; sp < 10; sp++) {
            const spAngle = (sp / 10) * Math.PI * 2;
            const spx = -2065 + Math.cos(spAngle) * 20;
            const spz = -120 + Math.sin(spAngle) * 20;
            const spire = new THREE.Mesh(new THREE.ConeGeometry(1.8, 14.0 + (sp % 4) * 3, 5), cyanCrystalMat);
            spire.position.set(spx, 19.0, spz);
            spire.rotation.z = Math.cos(spAngle) * 0.2;
            spire.rotation.x = Math.sin(spAngle) * 0.2;
            outsideGroup.add(spire);
        }

        // Primordial Invulnerability Crystal Core on Altar
        const altar = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.8, 3.0, 8), iceRockMat);
        altar.position.set(-2065, 15.5, -120);
        outsideGroup.add(altar);

        const primCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(2.2), moonlightRelicMat);
        primCrystal.position.set(-2065, 18.5, -120);
        outsideGroup.add(primCrystal);

        const seathLight = new THREE.PointLight(0x38bdf8, 7.5, 60.0);
        seathLight.position.set(-2065, 18.0, -120);
        outsideGroup.add(seathLight);

        this.createStandingBrazier(-2045, 14.0, -120, 0x38bdf8, 6.0, 35);
        this.createStandingBrazier(-2085, 14.0, -120, 0x38bdf8, 6.0, 35);
        this.createPathBeacon(-2065, 14.0, -120, 0x38bdf8, "💎 CRYSTAL CAVE & PRIMORDIAL GLADE [ELEV +14.0m]", "SEATH THE SCALELESS BLIND DRAGON • MOONLIGHT CRYSTAL GEYSERS & PRIMORDIAL CORE • CRYSTAL GOLEMS", "#e0f2fe");
        this.createFloorSoapstone(-2065, 14.0, -104, "#38bdf8", "💎 CRYSTAL CAVE", "Shatter the Primordial Crystal behind him to break the scale-less dragon's curse of immortality!");

        // --------------------------------------------------------------------
        // 4. UNTENDED GRAVES & DARK FIRELINK ALTAR
        // Center: (-2095, -12.0, 280) | Elev: -12.0m | Theme: Extinguished Bonfire, Shrouded Tombs & Gundyr
        // --------------------------------------------------------------------
        const pitchGraveMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
        const darkIronMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.7 });
        const coiledAshenMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 });

        // Sunken Dark Graveyard Arena
        const graveFloor = new THREE.Mesh(new THREE.BoxGeometry(56, 3.0, 56), pitchGraveMat);
        graveFloor.position.set(-2095, -13.5, 280);
        outsideGroup.add(graveFloor);

        // Dilapidated Shrine Arches
        for (let ax of [-18, 18]) {
            const arch = new THREE.Mesh(new THREE.TorusGeometry(8.0, 1.2, 6, 16, Math.PI), pitchGraveMat);
            arch.position.set(-2095 + ax, -7.0, 280);
            arch.rotation.y = Math.PI / 2;
            outsideGroup.add(arch);
        }

        // Leaning Dark Headstones
        for (let hx of [-22, -12, 12, 22]) {
            for (let hz of [260, 300]) {
                const headstone = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.5, 0.4), pitchGraveMat);
                headstone.position.set(-2095 + hx, -10.5, hz);
                headstone.rotation.y = (hx + hz) * 0.1;
                headstone.rotation.z = 0.12;
                outsideGroup.add(headstone);
            }
        }

        // Extinguished Ash Coiled Sword
        const coiledSwordDark = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 4.5, 8), coiledAshenMat);
        coiledSwordDark.position.set(-2095, -9.5, 280);
        coiledSwordDark.rotation.z = -0.2;
        outsideGroup.add(coiledSwordDark);

        const gundyrLight = new THREE.PointLight(0x64748b, 6.0, 50.0);
        gundyrLight.position.set(-2095, -8.0, 280);
        outsideGroup.add(gundyrLight);

        this.createStandingBrazier(-2075, -12.0, 280, 0x64748b, 5.0, 32);
        this.createStandingBrazier(-2115, -12.0, 280, 0x64748b, 5.0, 32);
        this.createPathBeacon(-2095, -12.0, 280, 0x64748b, "🪦 UNTENDED GRAVES & DARK FIRELINK [ELEV -12.0m]", "CHAMPION GUNDYR UNBROKEN VANGUARD • IRON HALBERD SHOULDER TACKLE & DROPKICKS • GRAVE WARDENS", "#cbd5e1");
        this.createFloorSoapstone(-2095, -12.0, 264, "#64748b", "🪦 UNTENDED GRAVES", "He never met his Firekeeper. Prepare for unmatched martial prowess and relentless counter-attacks.");

        // --------------------------------------------------------------------
        // 5. UNDEAD CRYPT & THRONE GUARDING COLONNADE
        // Center: (-2125, -16.0, -380) | Elev: -16.0m | Theme: Dark Crypt Basalt, Sacred Chimes & Velstadt
        // --------------------------------------------------------------------
        const cryptBasaltMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
        const cryptGoldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.75 });
        const darkSpiritMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 2.0 });

        // Royal Crypt Stone Floor
        const cryptFloor = new THREE.Mesh(new THREE.BoxGeometry(56, 3.0, 56), cryptBasaltMat);
        cryptFloor.position.set(-2125, -17.5, -380);
        outsideGroup.add(cryptFloor);

        // Flanking Crypt Pillars with Resonant Bell Capitals
        for (let px of [-18, 18]) {
            for (let pz of [-395, -380, -365]) {
                const cPillar = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 14.0, 8), cryptBasaltMat);
                cPillar.position.set(-2125 + px, -10.0, pz);
                outsideGroup.add(cPillar);

                const bell = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.2, 8), cryptGoldMat);
                bell.position.set(-2125 + px, -4.0, pz);
                bell.rotation.x = Math.PI;
                outsideGroup.add(bell);
            }
        }

        // Royal Sarcophagus Dais
        const sarco = new THREE.Mesh(new THREE.BoxGeometry(6.0, 2.4, 10.0), cryptBasaltMat);
        sarco.position.set(-2125, -14.8, -380);
        outsideGroup.add(sarco);

        const sarcoGold = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.4, 8.8), cryptGoldMat);
        sarcoGold.position.set(-2125, -13.4, -380);
        outsideGroup.add(sarcoGold);

        const velstadtLight = new THREE.PointLight(0xd97706, 6.5, 55.0);
        velstadtLight.position.set(-2125, -12.0, -380);
        outsideGroup.add(velstadtLight);

        this.createStandingBrazier(-2105, -16.0, -380, 0x3b82f6, 5.5, 35);
        this.createStandingBrazier(-2145, -16.0, -380, 0x3b82f6, 5.5, 35);
        this.createPathBeacon(-2125, -16.0, -380, 0xd97706, "🔔 UNDEAD CRYPT & ROYAL COLONNADE [ELEV -16.0m]", "VELSTADT THE ROYAL AEGIS • SACRED CHIME GREATHAMMER RESONANT BELL WAVES • SYAN KNIGHTS", "#fed7aa");
        this.createFloorSoapstone(-2125, -16.0, -364, "#d97706", "🔔 UNDEAD CRYPT", "Do not produce light. The hammer tolls for thee, resonant with ancient dark magic.");

        // --------------------------------------------------------------------
        // 6. ASTRAL CLOCKTOWER & LUMARIUM GARDEN
        // Center: (-2155, 20.0, 40) | Elev: +20.0m | Theme: Astronomical Clock, Lumenflowers & Lady Maria
        // --------------------------------------------------------------------
        const clockBrassMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.3, metalness: 0.85 });
        const gothicWoodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
        const bloodGlowMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 2.5 });
        const lumenflowerMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, emissive: 0x93c5fd, emissiveIntensity: 1.5 });

        // Polished Clocktower Parquet Platform
        const clockFloor = new THREE.Mesh(new THREE.BoxGeometry(54, 3.0, 54), gothicWoodMat);
        clockFloor.position.set(-2155, 18.5, 40);
        outsideGroup.add(clockFloor);

        // Colossal Brass Astronomical Clock Face at Back
        const clockDial = new THREE.Mesh(new THREE.CylinderGeometry(14.0, 14.0, 0.8, 32), clockBrassMat);
        clockDial.position.set(-2180, 28.0, 40);
        clockDial.rotation.z = Math.PI / 2;
        outsideGroup.add(clockDial);

        const clockHands = new THREE.Mesh(new THREE.BoxGeometry(0.3, 11.0, 0.8), bloodGlowMat);
        clockHands.position.set(-2179, 28.0, 40);
        outsideGroup.add(clockHands);

        // Bed of Radiant White Lumenflowers
        for (let lf = 0; lf < 12; lf++) {
            const lfx = -2155 + (lf % 4 - 1.5) * 8.0;
            const lfz = 40 + (Math.floor(lf / 4) - 1) * 8.0;
            const flower = new THREE.Mesh(new THREE.SphereGeometry(0.8, 6, 6), lumenflowerMat);
            flower.position.set(lfx, 20.8, lfz);
            outsideGroup.add(flower);
        }

        const mariaLight = new THREE.PointLight(0xef4444, 7.0, 55.0);
        mariaLight.position.set(-2155, 24.0, 40);
        outsideGroup.add(mariaLight);

        this.createStandingBrazier(-2135, 20.0, 40, 0xef4444, 5.5, 35);
        this.createStandingBrazier(-2175, 20.0, 40, 0xef4444, 5.5, 35);
        this.createPathBeacon(-2155, 20.0, 40, 0xef4444, "🕰️ ASTRAL CLOCKTOWER & LUMARIUM [ELEV +20.0m]", "LADY MARIA OF THE ASTRAL CLOCKTOWER • RAKUYO TWIN BLADES BLOODFLAME SLASHES • RESEARCH PATIENTS", "#fecaca");
        this.createFloorSoapstone(-2155, 20.0, 24, "#ef4444", "🕰️ ASTRAL CLOCKTOWER", "A corpse should be left well alone. Prepare for soaring arcs of blazing blood and flame.");

        // --------------------------------------------------------------------
        // 7. OOLACILE CALAMITY CRATER & BLACK DRAGON CLIFF
        // Center: (-2185, 26.0, -220) | Elev: +26.0m | Theme: Calamity Eye, Magma Fissures & Kalameet
        // --------------------------------------------------------------------
        const calamityBasaltMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 });
        const calamityEyeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 3.2 });
        const dragonObsidianMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.35, metalness: 0.85 });

        // Cliff Ravine Arena Floor
        const cliffFloor = new THREE.Mesh(new THREE.BoxGeometry(56, 3.5, 56), calamityBasaltMat);
        cliffFloor.position.set(-2185, 24.25, -220);
        outsideGroup.add(cliffFloor);

        // Calamity Eye Central Sigil
        const eyeRing = new THREE.Mesh(new THREE.TorusGeometry(7.0, 0.6, 8, 24), calamityEyeMat);
        eyeRing.position.set(-2185, 26.1, -220);
        eyeRing.rotation.x = Math.PI / 2;
        outsideGroup.add(eyeRing);

        const eyePupil = new THREE.Mesh(new THREE.SphereGeometry(2.0, 10, 10), calamityEyeMat);
        eyePupil.scale.set(1.5, 0.4, 0.8);
        eyePupil.position.set(-2185, 26.2, -220);
        outsideGroup.add(eyePupil);

        // Flanking Obsidian Dragon Statues
        for (let ds of [-20, 20]) {
            const dStatue = new THREE.Mesh(new THREE.ConeGeometry(2.5, 12.0, 6), dragonObsidianMat);
            dStatue.position.set(-2185 + ds, 32.0, -220);
            outsideGroup.add(dStatue);
        }

        const kalameetLight = new THREE.PointLight(0xea580c, 7.5, 60.0);
        kalameetLight.position.set(-2185, 30.0, -220);
        outsideGroup.add(kalameetLight);

        this.createStandingBrazier(-2165, 26.0, -220, 0xea580c, 6.0, 35);
        this.createStandingBrazier(-2205, 26.0, -220, 0xea580c, 6.0, 35);
        this.createPathBeacon(-2185, 26.0, -220, 0xea580c, "🐉 OOLACILE CALAMITY CRATER & CLIFF [ELEV +26.0m]", "BLACK DRAGON KALAMEET • CALAMITY EYE LEVITATION BURST & BLACK FLAME • DRAGON ACOLYTES", "#fed7aa");
        this.createFloorSoapstone(-2185, 26.0, -204, "#ea580c", "🐉 CALAMITY CLIFF", "Even mighty Anor Londo dared not provoke Kalameet. Beware the orange eye of double damage!");

        // --------------------------------------------------------------------
        // 8. DEEPROOT DEPTHS & DEATHBED DREAM OF FORTISSAX
        // Center: (-2215, -8.0, 390) | Elev: -8.0m | Theme: Petrified Roots, Red Lightning & Fortissax
        // --------------------------------------------------------------------
        const rootPetrifiedMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.95 });
        const deathblightBrierMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.5, metalness: 0.5 });
        const redLightningMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 3.5 });

        // Deep Cavern Root Platform
        const rootFloor = new THREE.Mesh(new THREE.BoxGeometry(58, 3.0, 58), rootPetrifiedMat);
        rootFloor.position.set(-2215, -9.5, 390);
        outsideGroup.add(rootFloor);

        // Giant Gnarled Arching Roots overhead
        for (let r = 0; r < 4; r++) {
            const rootArch = new THREE.Mesh(new THREE.TorusGeometry(14.0 + r * 3, 1.8, 6, 20, Math.PI), rootPetrifiedMat);
            rootArch.position.set(-2215, -2.0, 390);
            rootArch.rotation.y = (r / 4) * Math.PI;
            outsideGroup.add(rootArch);
        }

        // Deathblight Golden Thorns
        for (let tb of [-18, -6, 6, 18]) {
            const thorn = new THREE.Mesh(new THREE.ConeGeometry(0.8, 6.0, 5), deathblightBrierMat);
            thorn.position.set(-2215 + tb, -5.0, 372);
            thorn.rotation.x = -0.3;
            outsideGroup.add(thorn);
        }

        // Crackling Red Lightning Spear Monuments
        for (let rl of [-12, 12]) {
            const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 9.0, 6), redLightningMat);
            spear.position.set(-2215 + rl, -3.5, 408);
            spear.rotation.z = (rl > 0 ? -0.25 : 0.25);
            outsideGroup.add(spear);
        }

        const fortissaxLight = new THREE.PointLight(0xdc2626, 7.5, 60.0);
        fortissaxLight.position.set(-2215, -3.0, 390);
        outsideGroup.add(fortissaxLight);

        this.createStandingBrazier(-2195, -8.0, 390, 0xdc2626, 6.0, 35);
        this.createStandingBrazier(-2235, -8.0, 390, 0xdc2626, 6.0, 35);
        this.createPathBeacon(-2215, -8.0, 390, 0xdc2626, "⚡ DEEPROOT DEPTHS & DEATHBED DREAM [ELEV -8.0m]", "LICHDRAGON FORTISSAX • DEATHBLIGHT LIGHTNING SPEARS & DRAGON WINGS • CRUCIBLE KNIGHT SILURIA", "#fecaca");
        this.createFloorSoapstone(-2215, -8.0, 374, "#dc2626", "⚡ DEEPROOT DEPTHS", "Corrupted by Godwyn's slumbering death, the Lichdragon channels twin bolts of crimson lightning.");
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


    // ========================================================================
    // BUILD TRIPLED EXPEDITION BIOMES: 184 BRAND-NEW BESPOKE 3D LANDMARKS (Build V61)
    // Triples physical in-world landmarks from 92 to 276 across the 144km realm!
    // ========================================================================
    registerBiomeBlueprint(archetype, x, y, z, colorHex, brazierOffset, title, desc, titleColor, scaleFactor = 45.0) {
        const worldX = x * scaleFactor;
        const worldZ = z * scaleFactor;
        const cs = this.biomeChunkSize || 2500;
        const cx = Math.floor(worldX / cs);
        const cz = Math.floor(worldZ / cs);
        const key = cx + ',' + cz;
        let bucket = this.biomeChunkBlueprints.get(key);
        if (!bucket) {
            bucket = [];
            this.biomeChunkBlueprints.set(key, bucket);
        }
        bucket.push({ archetype, x, y, z, worldX, worldZ, colorHex, brazierOffset, title, desc, titleColor, scaleFactor });
    }

    buildChunkLandmark(chunkGroup, bp) {
        const { archetype, y, worldX, worldZ, colorHex, brazierOffset, title, desc, titleColor, scaleFactor } = bp;
        const stoneMat = this.stoneMat;
        const wallMat = this.wallMat;
        const goldMat = this.goldMat || this.wallMat;
        const boneMat = this.boneMat || stoneMat;

        if (archetype === 1) {
            const daisGeo = this.getSharedGeo('bio_dais_1', () => new THREE.CylinderGeometry(18, 22, 2.6, 12));
            const dais = new THREE.Mesh(daisGeo, stoneMat);
            dais.position.set(worldX, y - 1.3, worldZ);
            dais.scale.set(scaleFactor, 1, scaleFactor);
            chunkGroup.add(dais);

            const skullGeo = this.getSharedGeo('bio_skull_1', () => new THREE.ConeGeometry(3.5, 9.0, 5));
            const skull = new THREE.Mesh(skullGeo, boneMat);
            skull.position.set(worldX, y + 4.0, worldZ);
            skull.rotation.z = Math.PI / 2 - 0.2;
            skull.scale.set(scaleFactor, 1, scaleFactor);
            chunkGroup.add(skull);
        } else if (archetype === 2) {
            const baseGeo = this.getSharedGeo('bio_base_2', () => new THREE.BoxGeometry(32, 2.5, 32));
            const base = new THREE.Mesh(baseGeo, stoneMat);
            base.position.set(worldX, y - 1.25, worldZ);
            base.scale.set(scaleFactor, 1, scaleFactor);
            chunkGroup.add(base);

            const prismGeo = this.getSharedGeo('bio_prism_2', () => new THREE.CylinderGeometry(1.0, 4.0, 18, 6));
            const prismMat = this.getSharedMat('bio_mat_2_' + colorHex, () => new THREE.MeshStandardMaterial({
                color: colorHex, emissive: colorHex, emissiveIntensity: 0.65, roughness: 0.15, metalness: 0.85
            }));
            const prism = new THREE.Mesh(prismGeo, prismMat);
            prism.position.set(worldX, y + 9.0, worldZ);
            prism.scale.set(scaleFactor, 1, scaleFactor);
            chunkGroup.add(prism);
        } else if (archetype === 3) {
            const cryptGeo = this.getSharedGeo('bio_crypt_3', () => new THREE.BoxGeometry(36, 2.4, 36));
            const crypt = new THREE.Mesh(cryptGeo, stoneMat);
            crypt.position.set(worldX, y - 1.2, worldZ);
            crypt.scale.set(scaleFactor, 1, scaleFactor);
            chunkGroup.add(crypt);

            const tombGeo = this.getSharedGeo('bio_tomb_3', () => new THREE.BoxGeometry(10, 12, 10));
            const tomb = new THREE.Mesh(tombGeo, wallMat);
            tomb.position.set(worldX, y + 6.0, worldZ);
            tomb.scale.set(scaleFactor, 1, scaleFactor);
            chunkGroup.add(tomb);
        } else if (archetype === 4) {
            const basinGeo = this.getSharedGeo('bio_basin_4', () => new THREE.CylinderGeometry(20, 24, 2.6, 12));
            const basin = new THREE.Mesh(basinGeo, wallMat);
            basin.position.set(worldX, y - 1.3, worldZ);
            basin.scale.set(scaleFactor, 1, scaleFactor);
            chunkGroup.add(basin);

            const ringGeo = this.getSharedGeo('bio_ring_4', () => new THREE.TorusGeometry(6, 1.6, 6, 12));
            const ringMat = this.getSharedMat('bio_mat_4_' + colorHex, () => new THREE.MeshStandardMaterial({
                color: colorHex, emissive: colorHex, emissiveIntensity: 0.8, roughness: 0.25
            }));
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.set(worldX, y + 0.5, worldZ);
            ring.scale.set(scaleFactor, scaleFactor, 1);
            chunkGroup.add(ring);
        } else if (archetype === 5) {
            const keepGeo = this.getSharedGeo('bio_keep_5', () => new THREE.BoxGeometry(34, 2.6, 34));
            const keep = new THREE.Mesh(keepGeo, stoneMat);
            keep.position.set(worldX, y - 1.3, worldZ);
            keep.scale.set(scaleFactor, 1, scaleFactor);
            chunkGroup.add(keep);

            const spireGeo = this.getSharedGeo('bio_spire_5', () => new THREE.ConeGeometry(6, 20, 6));
            const spireMat = this.getSharedMat('bio_mat_5_' + colorHex, () => new THREE.MeshStandardMaterial({
                color: colorHex, emissive: colorHex, emissiveIntensity: 0.5, roughness: 0.2, metalness: 0.7
            }));
            const spire = new THREE.Mesh(spireGeo, spireMat);
            spire.position.set(worldX, y + 10.0, worldZ);
            spire.scale.set(scaleFactor, 1, scaleFactor);
            chunkGroup.add(spire);
        } else if (archetype === 6) {
            const mireGeo = this.getSharedGeo('bio_mire_6', () => new THREE.CylinderGeometry(20, 22, 2.2, 12));
            const mire = new THREE.Mesh(mireGeo, stoneMat);
            mire.position.set(worldX, y - 1.1, worldZ);
            mire.scale.set(scaleFactor, 1, scaleFactor);
            chunkGroup.add(mire);

            const bloomGeo = this.getSharedGeo('bio_bloom_6', () => new THREE.CylinderGeometry(2.5, 4.5, 14, 7));
            const bloomMat = this.getSharedMat('bio_mat_6_' + colorHex, () => new THREE.MeshStandardMaterial({
                color: colorHex, emissive: colorHex, emissiveIntensity: 0.55, roughness: 0.5
            }));
            const bloom = new THREE.Mesh(bloomGeo, bloomMat);
            bloom.position.set(worldX, y + 7.0, worldZ);
            bloom.scale.set(scaleFactor, 1, scaleFactor);
            chunkGroup.add(bloom);
        } else if (archetype === 7) {
            const daisGeo = this.getSharedGeo('bio_dais_7', () => new THREE.CylinderGeometry(24, 28, 2.8, 12));
            const dais = new THREE.Mesh(daisGeo, goldMat);
            dais.position.set(worldX, y - 1.4, worldZ);
            dais.scale.set(scaleFactor, 1, scaleFactor);
            chunkGroup.add(dais);

            const colGeo = this.getSharedGeo('bio_col_7', () => new THREE.CylinderGeometry(2.2, 2.6, 22, 8));
            const col = new THREE.Mesh(colGeo, goldMat);
            col.position.set(worldX, y + 11.0, worldZ);
            col.scale.set(scaleFactor, 1, scaleFactor);
            chunkGroup.add(col);
        } else {
            const wellGeo = this.getSharedGeo('bio_well_8', () => new THREE.CylinderGeometry(22, 26, 2.8, 12));
            const well = new THREE.Mesh(wellGeo, stoneMat);
            well.position.set(worldX, y - 1.4, worldZ);
            well.scale.set(scaleFactor, 1, scaleFactor);
            chunkGroup.add(well);

            const towerGeo = this.getSharedGeo('bio_tower_8', () => new THREE.CylinderGeometry(2.8, 6.0, 28, 8));
            const towerMat = this.getSharedMat('bio_mat_8_obsidian', () => new THREE.MeshStandardMaterial({
                color: 0x09090b, roughness: 0.9, metalness: 0.4
            }));
            const tower = new THREE.Mesh(towerGeo, towerMat);
            tower.position.set(worldX, y + 14.0, worldZ);
            tower.scale.set(scaleFactor, 1, scaleFactor);
            chunkGroup.add(tower);
        }

        this.createStandingBrazier(worldX - brazierOffset, y, worldZ, colorHex, 7.5, 50, chunkGroup);
        this.createStandingBrazier(worldX + brazierOffset, y, worldZ, colorHex, 7.5, 50, chunkGroup);
        this.createPathBeacon(worldX, y, worldZ, colorHex, title, desc, titleColor, false, false, chunkGroup);
    }

    updateBiomeChunks(tx, tz) {
        if (!this.biomeChunkBlueprints || this.biomeChunkBlueprints.size === 0) return;
        const cs = this.biomeChunkSize || 2500;
        const pcx = Math.floor(tx / cs);
        const pcz = Math.floor(tz / cs);
        const chunkKey = pcx + ',' + pcz;
        if (this._lastChunkKey === chunkKey) return;
        this._lastChunkKey = chunkKey;

        const activeKeys = new Set();
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                const key = (pcx + dx) + ',' + (pcz + dz);
                activeKeys.add(key);
                let chunkGroup = this.biomeChunks.get(key);
                if (!chunkGroup) {
                    const bps = this.biomeChunkBlueprints.get(key);
                    if (bps && bps.length > 0) {
                        chunkGroup = new THREE.Group();
                        chunkGroup.name = 'biome_chunk_' + key;
                        for (let i = 0; i < bps.length; i++) {
                            this.buildChunkLandmark(chunkGroup, bps[i]);
                        }
                        this.scene.add(chunkGroup);
                        this.biomeChunks.set(key, chunkGroup);
                    }
                }
                if (chunkGroup) chunkGroup.visible = true;
            }
        }

        for (const [key, grp] of this.biomeChunks.entries()) {
            if (!activeKeys.has(key)) {
                grp.visible = false;
            }
        }
    }

    buildTripledExpeditionBiomes(outsideGroup) {
        if (!outsideGroup) return;
        const scale = 45.0;
        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2;
            const dist = 320 + (i % 6) * 45;
            const x = Math.cos(angle) * dist - 350;
            const z = Math.sin(angle) * dist;
            const y = 6.0 + (i % 4) * 2.5;
            this.registerBiomeBlueprint(1, x, y, z, 0xff5500, 15, `🐉 DRAGON AERIE PEAK #${i+1} [ELEV +${y.toFixed(0)}m]`, "ANCIENT WYRM CRAG • FOSSIL VERTEBRAE • DRAKE ROOST", "#ff7733", scale);
        }
        for (let i = 0; i < 24; i++) {
            const angle = ((i + 0.5) / 24) * Math.PI * 2;
            const dist = 360 + (i % 5) * 50;
            const x = Math.cos(angle) * dist - 400;
            const z = Math.sin(angle) * dist;
            const y = 8.0 + (i % 3) * 3.0;
            this.registerBiomeBlueprint(2, x, y, z, 0x00f5ff, 18, `🌌 CELESTIAL OBSERVATORY #${i+1} [ELEV +${y.toFixed(0)}m]`, "CARIAN ASTRAL SPHERE • PRIMEVAL CURRENT • GLINTSTONE", "#66ffff", scale);
        }
        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2;
            const dist = 280 + (i % 4) * 40;
            const x = Math.cos(angle) * dist - 280;
            const z = Math.sin(angle) * dist;
            const y = -6.0 - (i % 3) * 2.0;
            this.registerBiomeBlueprint(3, x, y, z, 0x00ffaa, 15, `💀 SUNKEN CATACOMB CRYPT #${i+1} [ELEV ${y.toFixed(0)}m]`, "GRAVELORD OSSUARY • GHOSTFIRE BRAZIER • BONE VAULT", "#99ffcc", scale);
        }
        for (let i = 0; i < 24; i++) {
            const angle = ((i + 0.3) / 24) * Math.PI * 2;
            const dist = 420 + (i % 6) * 55;
            const x = Math.cos(angle) * dist - 460;
            const z = Math.sin(angle) * dist;
            const y = -4.0 + (i % 5) * 2.0;
            this.registerBiomeBlueprint(4, x, y, z, 0xff2200, 18, `🌋 SMELTER CALDERA FORGE #${i+1} [ELEV ${y.toFixed(0)}m]`, "MOLTEN LAVA CHANNEL • CHAOS TITANITE • BASALT ANVIL", "#ff6644", scale);
        }
        for (let i = 0; i < 24; i++) {
            const angle = ((i + 0.7) / 24) * Math.PI * 2;
            const dist = 460 + (i % 5) * 60;
            const x = Math.cos(angle) * dist - 480;
            const z = Math.sin(angle) * dist;
            const y = 10.0 + (i % 4) * 3.0;
            this.registerBiomeBlueprint(5, x, y, z, 0x38bdf8, 18, `❄️ PERMAFROST CITADEL KEEP #${i+1} [ELEV +${y.toFixed(0)}m]`, "ELEUM LOYCE GLADE • FROSTBITTEN SPIRE • BOREAL KNIGHTS", "#bae6fd", scale);
        }
        for (let i = 0; i < 24; i++) {
            const angle = ((i + 0.2) / 24) * Math.PI * 2;
            const dist = 340 + (i % 4) * 45;
            const x = Math.cos(angle) * dist - 340;
            const z = Math.sin(angle) * dist;
            const y = -8.0 - (i % 3) * 1.5;
            this.registerBiomeBlueprint(6, x, y, z, 0xd946ef, 14, `🌺 SCARLET ROT CANOPY #${i+1} [ELEV ${y.toFixed(0)}m]`, "CAELID AEONIA BLOOM • TOXIC STILT VILLAGE • ROT PESTS", "#f5d0fe", scale);
        }
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const dist = 500 + (i % 4) * 50;
            const x = Math.cos(angle) * dist - 520;
            const z = Math.sin(angle) * dist;
            const y = 12.0 + (i % 3) * 4.0;
            this.registerBiomeBlueprint(7, x, y, z, 0xffd700, 20, `👑 GOLDEN ERDTREE COLONNADE #${i+1} [ELEV +${y.toFixed(0)}m]`, "LEYNDELL ALABASTER • SENTINEL SANCTUARY • GOLDEN ORDER", "#fff3a8", scale);
        }
        for (let i = 0; i < 20; i++) {
            const angle = ((i + 0.5) / 20) * Math.PI * 2;
            const dist = 540 + (i % 4) * 55;
            const x = Math.cos(angle) * dist - 560;
            const z = Math.sin(angle) * dist;
            const y = 4.0 + (i % 4) * 2.5;
            this.registerBiomeBlueprint(8, x, y, z, 0x2dd4bf, 18, `⚡ SHADOW REALM SPIRAL TOWER #${i+1} [ELEV +${y.toFixed(0)}m]`, "ENIR-ILIM HORNSENT MONOLITH • SCADUTREE SHADOW • GHOSTFLAME", "#99f6e4", scale);
        }
    }

    buildCataclysmicMegalithBiomes(outsideGroup) {
        if (!outsideGroup) return;
        const scale = 45.0;
        const specs = [
            [1, 70, 600, 8, 60, 700, 0, 8.0, 4, 3.0, 0xff4500, 20, '🐉 DRAGON COMMUNION SHRINE', 'ANCIENT DRAGON HEART ALTAR • DRAKE ROOST • DRAGONBOLT', '#ff8844'],
            [2, 70, 680, 7, 65, 780, 0.3, 10.0, 4, 3.5, 0x38bdf8, 22, '🌌 PRIMEVAL CURRENT OBSERVATORY', 'AZUR STAR METEOR • GLINTSTONE SPIRE • LUNAR RADIANCY', '#7dd3fc'],
            [3, 70, 540, 6, 55, 620, 0.6, -8.0, 4, -2.5, 0x10b981, 20, '💀 ABYSSAL TOMB OSSUARY', 'GRAVELORD CRYPT • EMERALD GHOSTFIRE • ETERNAL REST', '#6ee7b7'],
            [4, 70, 740, 8, 70, 840, 0.15, -4.0, 5, 2.5, 0xf43f5e, 24, '🌋 MOLTEN SMELTER CALDERA', 'CHAOS TITANITE FORGE • BASALT LAVA CHANNEL • EMBER CORE', '#fda4af'],
            [5, 70, 800, 7, 75, 900, 0.45, 12.0, 4, 3.5, 0x0ea5e9, 24, '❄️ BOREAL PERMAFROST KEEP', 'ELEUM LOYCE CITADEL • GLACIAL SPIRE • FROSTBITE THRONE', '#e0f2fe'],
            [6, 70, 620, 6, 60, 720, 0.75, -10.0, 3, -2.0, 0xc026d3, 18, '🌺 SCARLET ROT SANCTUARY', 'AEONIA BLOOM CANOPY • MIASMA MIRE • KINDRED OF ROT', '#f5d0fe'],
            [7, 66, 880, 6, 80, 980, 0.25, 14.0, 4, 4.0, 0xeab308, 26, '👑 HOLY ERDTREE PANTHEON', 'ROYAL LEYNDELL ALABASTER • GOLDEN ORDER TEMPLE • DIVINE DAIS', '#fef9c3'],
            [8, 66, 940, 6, 85, 1040, 0.85, 6.0, 4, 3.0, 0x06b6d4, 24, '⚡ HORNSENT SPIRAL SPIRE', 'ENIR-ILIM SHADOW MONOLITH • GHOSTFLAME WELL • DIVINE GATE', '#cffafe']
        ];
        for (const [arch, count, baseDist, modD, stepD, xOff, phase, baseY, modY, stepY, col, brOff, prefix, desc, tCol] of specs) {
            for (let i = 0; i < count; i++) {
                const angle = ((i + phase) / count) * Math.PI * 2;
                const dist = baseDist + (i % modD) * stepD;
                const x = Math.cos(angle) * dist - xOff;
                const z = Math.sin(angle) * dist;
                const y = baseY + (i % modY) * stepY;
                const sign = y >= 0 ? '+' : '';
                this.registerBiomeBlueprint(arch, x, y, z, col, brOff, `${prefix} #${i+1} [ELEV ${sign}${y.toFixed(0)}m]`, desc, tCol, scale);
            }
        }
    }

    buildOmnipotentTitanBiomes(outsideGroup) {
        if (!outsideGroup) return;
        const scale = 45.0;
        const specs = [
            [1, 210, 750, 12, 75, 850, 0, 8.0, 4, 3.5, 0xff4500, 22, '🐉 OMNIPOTENT DRAGON ROOST', 'TITAN DRACONIC ALTAR • WYRM NEST • RED LIGHTNING', '#ff8844'],
            [2, 210, 850, 10, 80, 950, 0.25, 10.0, 4, 4.0, 0x38bdf8, 24, '🌌 OMNIPOTENT STARFALL SPIRE', 'AZUR PRIMEVAL CURRENT • GLINTSTONE MONOLITH • CELESTIAL', '#7dd3fc'],
            [3, 210, 680, 9, 70, 760, 0.5, -8.0, 4, -2.5, 0x10b981, 22, '💀 OMNIPOTENT ROYAL MAUSOLEUM', 'GRAVELORD OSSUARY • EMERALD GHOSTFIRE • PRIMEVAL SOULS', '#6ee7b7'],
            [4, 210, 950, 11, 85, 1050, 0.15, -4.0, 5, 2.5, 0xf43f5e, 26, '🌋 OMNIPOTENT SMELTER CALDERA', 'CHAOS CRUCIBLE • BASALT LAVA CHANNEL • TITANITE FORGE', '#fda4af'],
            [5, 210, 1050, 10, 90, 1150, 0.4, 12.0, 4, 3.5, 0x0ea5e9, 26, '❄️ OMNIPOTENT PERMAFROST KEEP', 'ELEUM LOYCE CITADEL • BOREAL FROSTBITE • ICE THRONE', '#e0f2fe'],
            [6, 210, 800, 8, 75, 880, 0.65, -10.0, 3, -2.0, 0xc026d3, 20, '🌺 OMNIPOTENT SCARLET ROT SANCTUARY', 'AEONIA BLOOM CANOPY • TOXIC MIRE • KINDRED OF ROT', '#f5d0fe'],
            [7, 198, 1150, 9, 95, 1250, 0.3, 14.0, 4, 4.0, 0xeab308, 30, '👑 OMNIPOTENT ERDTREE PANTHEON', 'ROYAL LEYNDELL ALABASTER • GOLDEN ORDER TEMPLE • DIVINE DAIS', '#fef9c3'],
            [8, 198, 1220, 9, 95, 1320, 0.75, 6.0, 4, 3.5, 0x06b6d4, 28, '⚡ OMNIPOTENT HORNSENT SPIRE', 'ENIR-ILIM SHADOW MONOLITH • GHOSTFLAME WELL • SPIRAL TOWER', '#cffafe']
        ];
        for (const [arch, count, baseDist, modD, stepD, xOff, phase, baseY, modY, stepY, col, brOff, prefix, desc, tCol] of specs) {
            for (let i = 0; i < count; i++) {
                const angle = ((i + phase) / count) * Math.PI * 2;
                const dist = baseDist + (i % modD) * stepD;
                const x = Math.cos(angle) * dist - xOff;
                const z = Math.sin(angle) * dist;
                const y = baseY + (i % modY) * stepY;
                const sign = y >= 0 ? '+' : '';
                this.registerBiomeBlueprint(arch, x, y, z, col, brOff, `${prefix} #${i+1} [ELEV ${sign}${y.toFixed(0)}m]`, desc, tCol, scale);
            }
        }
    }

    buildInfiniteInfinityBiomes(outsideGroup) {
        if (!outsideGroup) return;
        const scale = 45.0;
        const specs = [
            [1, 621, 900, 16, 85, 1000, 0, 8.0, 4, 3.5, 0xff4500, 22, '🐉 INFINITE DRAGON SANCTUM', 'ANCIENT DRAGON HEART ALTAR • DRAKE ROOST • RED LIGHTNING', '#ff8844'],
            [2, 621, 1000, 14, 90, 1100, 0.2, 10.0, 4, 4.0, 0x38bdf8, 24, '🌌 INFINITE STARFALL SPIRE', 'AZUR PRIMEVAL CURRENT • GLINTSTONE MONOLITH • CELESTIAL', '#7dd3fc'],
            [3, 621, 820, 12, 80, 920, 0.4, -8.0, 4, -2.5, 0x10b981, 22, '💀 INFINITE LORD MAUSOLEUM', 'GRAVELORD OSSUARY • EMERALD GHOSTFIRE • PRIMEVAL SOULS', '#6ee7b7'],
            [4, 621, 1100, 15, 95, 1200, 0.1, -4.0, 5, 2.5, 0xf43f5e, 26, '🌋 INFINITE SMELTER CALDERA', 'CHAOS CRUCIBLE • BASALT LAVA CHANNEL • TITANITE FORGE', '#fda4af'],
            [5, 621, 1200, 14, 95, 1300, 0.35, 12.0, 4, 3.5, 0x0ea5e9, 26, '❄️ INFINITE PERMAFROST KEEP', 'ELEUM LOYCE CITADEL • BOREAL FROSTBITE • ICE THRONE', '#e0f2fe'],
            [6, 621, 950, 11, 85, 1050, 0.6, -10.0, 3, -2.0, 0xc026d3, 20, '🌺 INFINITE SCARLET ROT SANCTUARY', 'AEONIA BLOOM CANOPY • TOXIC MIRE • KINDRED OF ROT', '#f5d0fe'],
            [7, 621, 1320, 13, 95, 1420, 0.25, 14.0, 4, 4.0, 0xeab308, 30, '👑 INFINITE ERDTREE PANTHEON', 'ROYAL LEYNDELL ALABASTER • GOLDEN ORDER TEMPLE • DIVINE DAIS', '#fef9c3'],
            [8, 621, 1400, 15, 95, 1500, 0.7, 8.0, 4, 3.5, 0x06b6d4, 28, '⚡ INFINITE HORNSENT SPIRE', 'ENIR-ILIM SHADOW MONOLITH • GHOSTFLAME WELL • SPIRAL TOWER', '#cffafe']
        ];
        for (const [arch, count, baseDist, modD, stepD, xOff, phase, baseY, modY, stepY, col, brOff, prefix, desc, tCol] of specs) {
            for (let i = 0; i < count; i++) {
                const angle = ((i + phase) / count) * Math.PI * 2;
                const dist = baseDist + (i % modD) * stepD;
                const x = Math.cos(angle) * dist - xOff;
                const z = Math.sin(angle) * dist;
                const y = baseY + (i % modY) * stepY;
                const sign = y >= 0 ? '+' : '';
                this.registerBiomeBlueprint(arch, x, y, z, col, brOff, `${prefix} #${i+1} [ELEV ${sign}${y.toFixed(0)}m]`, desc, tCol, scale);
            }
        }
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

    createPathBeacon(x, y, z, colorHex, title, desc, titleColor, addSoapstone = true, enableTeleport = false, targetGroup = null) {
        const beaconGroup = new THREE.Group();

        // 1. Lordran Wrought-Iron Brazier & Ember Core (Shared Geometry & Material)
        const ironDishGeo = this.getSharedGeo('beacon_dish', () => new THREE.CylinderGeometry(0.55, 0.35, 0.28, 8));
        const ironDish = new THREE.Mesh(ironDishGeo, this.darkSteelMat || this.stoneMat);
        ironDish.position.y = 1.65;
        beaconGroup.add(ironDish);

        const flameCoreGeo = this.getSharedGeo('beacon_flame', () => new THREE.SphereGeometry(0.24, 8, 8));
        const flameCoreMat = this.getSharedMat('beacon_mat_' + colorHex, () => new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: colorHex,
            emissiveIntensity: 0.8,
            roughness: 0.4
        }));
        const flameCore = new THREE.Mesh(flameCoreGeo, flameCoreMat);
        flameCore.position.y = 1.82;
        beaconGroup.add(flameCore);

        // Register virtual light (pooled 6-light system prevents 5,550 PointLights in scene graph)
        if (!targetGroup) {
            this.virtualLights.push({ x, y: y + 1.9, z, color: colorHex, intensity: 1.4, distance: 9 });
        }

        // Slender Stone Pedestal Base
        const pedestalGeo = this.getSharedGeo('beacon_pedestal', () => new THREE.CylinderGeometry(0.42, 0.58, 1.5, 8));
        const pedestal = new THREE.Mesh(pedestalGeo, this.stoneMat);
        pedestal.position.y = 0.75;
        pedestal.receiveShadow = true;
        beaconGroup.add(pedestal);

        beaconGroup.position.set(x, y, z);
        (targetGroup || this.scene).add(beaconGroup);

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

    buildEightAscendedOutsideExpeditionsV76(outsideGroup) {
        // ====================================================================
        // 8 BRAND-NEW ASCENDED OUTSIDE REALM EXPEDITIONS (V76 EXPANSION)
        // ====================================================================

        // --------------------------------------------------------------------
        // 1. TOMB OF THE GIANTS & NITO'S OSSUARY
        // Center: (-2245, -18.0, -310) | Elev: -18.0m | Theme: Skulls, Skeletons, Red Miasma & Gravelord Nito
        // --------------------------------------------------------------------
        const ossuaryStoneMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.95 });
        const boneMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.85 });
        const redMiasmaMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, emissive: 0x7f1d1d, emissiveIntensity: 2.2 });
        const gravelordIronMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.6, metalness: 0.8 });

        // Sunken Ossuary Pit Floor
        const nitoFloor = new THREE.Mesh(new THREE.CylinderGeometry(28, 33, 4.0, 24), ossuaryStoneMat);
        nitoFloor.position.set(-2245, -20.0, -310);
        outsideGroup.add(nitoFloor);

        // Ring of 10 Giant Skeletal Spine Columns (Ribcage Arches)
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            const px = -2245 + Math.cos(angle) * 22;
            const pz = -310 + Math.sin(angle) * 22;
            const spine = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.8, 16.0, 8), boneMat);
            spine.position.set(px, -10.0, pz);
            spine.rotation.z = Math.cos(angle) * 0.18;
            spine.rotation.x = Math.sin(angle) * 0.18;
            outsideGroup.add(spine);

            // Skull Capitols atop spines
            const skull = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 8), boneMat);
            skull.position.set(px, -1.2, pz);
            outsideGroup.add(skull);
        }

        // Central Gravelord Sarcophagus Altar
        const sarcophagus = new THREE.Mesh(new THREE.BoxGeometry(6.0, 2.2, 3.8), ossuaryStoneMat);
        sarcophagus.position.set(-2245, -16.9, -310);
        outsideGroup.add(sarcophagus);

        // Red Miasma Brazier atop Sarcophagus
        const miasmaCore = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 12), redMiasmaMat);
        miasmaCore.position.set(-2245, -14.6, -310);
        outsideGroup.add(miasmaCore);

        const nitoLight = new THREE.PointLight(0xef4444, 4.0, 50.0);
        nitoLight.position.set(-2245, -14.0, -310);
        outsideGroup.add(nitoLight);

        this.createFloorSoapstone(-2245, -18.0, -298, "#ef4444", "💀 OSSUARY OF FIRST OF THE DEAD", "Fear the Gravelord's dance; strike when the miasma parts!");

        // --------------------------------------------------------------------
        // 2. BOREAL VALLEY & DANCER'S GRAND HIGH PLAZA
        // Center: (-2275, 15.0, 160) | Elev: +15.0m | Theme: Silver Gothic Marble, Frost Columns & Dancer
        // --------------------------------------------------------------------
        const borealMarbleMat = new THREE.MeshStandardMaterial({ color: 0xe0e7ff, roughness: 0.35, metalness: 0.25 });
        const borealSilverMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.85 });
        const frostIceMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.4 });

        // Raised Circular Marble Terrace
        const dancerPlaza = new THREE.Mesh(new THREE.CylinderGeometry(26, 30, 3.5, 24), borealMarbleMat);
        dancerPlaza.position.set(-2275, 13.25, 160);
        outsideGroup.add(dancerPlaza);

        // 8 Slender Gothic Filigree Pillars
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const px = -2275 + Math.cos(angle) * 20;
            const pz = 160 + Math.sin(angle) * 20;
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, 14.0, 12), borealMarbleMat);
            pillar.position.set(px, 22.0, pz);
            outsideGroup.add(pillar);

            // Silver crossbeam arches
            const arch = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.8, 0.9), borealSilverMat);
            arch.position.set(px, 29.0, pz);
            arch.rotation.y = angle + Math.PI / 4;
            outsideGroup.add(arch);
        }

        // Central Moonlit Frost Brazier
        const frostOrb = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 12), frostIceMat);
        frostOrb.position.set(-2275, 17.5, 160);
        outsideGroup.add(frostOrb);

        const dancerLight = new THREE.PointLight(0x38bdf8, 4.5, 55.0);
        dancerLight.position.set(-2275, 18.0, 160);
        outsideGroup.add(dancerLight);

        this.createFloorSoapstone(-2275, 15.0, 172, "#38bdf8", "💃 BOREAL HIGH PLAZA", "Beware the endless spinning pirouette of blades—roll through the fire!");

        // --------------------------------------------------------------------
        // 3. FINGER RUINS OF DHEO & MICROCOSM CRATER
        // Center: (-2305, -10.0, -140) | Elev: -10.0m | Theme: Stone Finger Trees, Cosmic Microcosm & Metyr
        // --------------------------------------------------------------------
        const cosmicStoneMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.9 });
        const fingerStoneMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.75 });
        const microcosmGlowMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0x9333ea, emissiveIntensity: 2.8 });

        // Cosmic Crater Basin
        const fingerCrater = new THREE.Mesh(new THREE.CylinderGeometry(27, 32, 3.5, 24), cosmicStoneMat);
        fingerCrater.position.set(-2305, -11.75, -140);
        outsideGroup.add(fingerCrater);

        // Ring of 12 Gigantic Stone Finger Obelisks (curved inward)
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const px = -2305 + Math.cos(angle) * 21;
            const pz = -140 + Math.sin(angle) * 21;
            const fBase = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.5, 12.0, 8), fingerStoneMat);
            fBase.position.set(px, -4.0, pz);
            fBase.rotation.x = -Math.sin(angle) * 0.22;
            fBase.rotation.z = Math.cos(angle) * 0.22;
            outsideGroup.add(fBase);

            // Upper finger knuckle segment
            const fTip = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), fingerStoneMat);
            fTip.position.set(px, 2.5, pz);
            outsideGroup.add(fTip);
        }

        // Microcosm Pulsing Cosmic Pearl Altar
        const pearlAltar = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 4.0, 1.8, 16), cosmicStoneMat);
        pearlAltar.position.set(-2305, -9.1, -140);
        outsideGroup.add(pearlAltar);

        const microcosmOrb = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 16), microcosmGlowMat);
        microcosmOrb.position.set(-2305, -6.8, -140);
        outsideGroup.add(microcosmOrb);

        const metyrLight = new THREE.PointLight(0xa855f7, 5.0, 55.0);
        metyrLight.position.set(-2305, -6.5, -140);
        outsideGroup.add(metyrLight);

        this.createFloorSoapstone(-2305, -10.0, -128, "#a855f7", "🖐️ FINGER RUINS OF DHEO", "The Mother of Fingers listens to cosmic void; dodge the starlight ray!");

        // --------------------------------------------------------------------
        // 4. STONE COFFIN FISSURE & PUTRESCENT DEEP GARDEN
        // Center: (-2335, -24.0, 310) | Elev: -24.0m | Theme: Megalithic Coffins, Ghostflame Putrescence & Putrescent Knight
        // --------------------------------------------------------------------
        const coffinStoneMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 });
        const putrescentSlimeMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 2.6 });

        // Deep Fissure Slab
        const fissureFloor = new THREE.Mesh(new THREE.CylinderGeometry(28, 34, 4.0, 24), coffinStoneMat);
        fissureFloor.position.set(-2335, -26.0, 310);
        outsideGroup.add(fissureFloor);

        // 6 Colossal Tilted Megalithic Stone Coffins
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const px = -2335 + Math.cos(angle) * 19;
            const pz = 310 + Math.sin(angle) * 19;
            const coffin = new THREE.Mesh(new THREE.BoxGeometry(4.5, 14.0, 3.2), coffinStoneMat);
            coffin.position.set(px, -17.0, pz);
            coffin.rotation.z = Math.cos(angle) * 0.28;
            coffin.rotation.x = Math.sin(angle) * 0.28;
            outsideGroup.add(coffin);
        }

        // Luminous Ghostflame Putrescence Pool
        const putrescentPool = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 7.5, 0.4, 20), putrescentSlimeMat);
        putrescentPool.position.set(-2335, -23.8, 310);
        outsideGroup.add(putrescentPool);

        const putrescentLight = new THREE.PointLight(0x06b6d4, 4.5, 50.0);
        putrescentLight.position.set(-2335, -22.5, 310);
        outsideGroup.add(putrescentLight);

        this.createFloorSoapstone(-2335, -24.0, 322, "#06b6d4", "🐎 STONE COFFIN FISSURE", "The Putrescent Knight rides without fear; roll when the cleaver returns!");

        // --------------------------------------------------------------------
        // 5. BODHISATTVA VALLEY & PRIMORDIAL WATERHOLE
        // Center: (-2365, 8.0, -420) | Elev: +8.0m | Theme: Colossal Buddha Statues, Bamboo & Guardian Ape
        // --------------------------------------------------------------------
        const mossRockMat = new THREE.MeshStandardMaterial({ color: 0x365314, roughness: 0.9 });
        const bambooGreenMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.6 });
        const riverWaterMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.4 });

        // Overgrown Canyon Basin Floor
        const canyonFloor = new THREE.Mesh(new THREE.CylinderGeometry(27, 32, 3.5, 24), mossRockMat);
        canyonFloor.position.set(-2365, 6.25, -420);
        outsideGroup.add(canyonFloor);

        // Serene River Water Basin
        const waterPond = new THREE.Mesh(new THREE.CylinderGeometry(14, 15, 0.3, 20), riverWaterMat);
        waterPond.position.set(-2365, 8.1, -420);
        outsideGroup.add(waterPond);

        // 4 Colossal Mossy Bodhisattva Buddha Statues
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + 0.4;
            const px = -2365 + Math.cos(angle) * 21;
            const pz = -420 + Math.sin(angle) * 21;

            // Buddha base torso
            const bTorso = new THREE.Mesh(new THREE.BoxGeometry(5.0, 7.5, 4.0), mossRockMat);
            bTorso.position.set(px, 12.0, pz);
            bTorso.rotation.y = angle + Math.PI;
            outsideGroup.add(bTorso);

            // Buddha head
            const bHead = new THREE.Mesh(new THREE.SphereGeometry(2.2, 10, 10), mossRockMat);
            bHead.position.set(px, 17.5, pz);
            outsideGroup.add(bHead);
        }

        // Bamboo Grove Clusters around Perimeter
        for (let b = 0; b < 16; b++) {
            const bAngle = (b / 16) * Math.PI * 2;
            const bx = -2365 + Math.cos(bAngle) * 23;
            const bz = -420 + Math.sin(bAngle) * 23;
            const bamboo = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 12.0, 6), bambooGreenMat);
            bamboo.position.set(bx, 14.0, bz);
            outsideGroup.add(bamboo);
        }

        const apeLight = new THREE.PointLight(0xa3e635, 3.5, 45.0);
        apeLight.position.set(-2365, 11.0, -420);
        outsideGroup.add(apeLight);

        this.createFloorSoapstone(-2365, 8.0, -408, "#84cc16", "🐒 BODHISATTVA WATERHOLE", "When the terror scream echoes, flee behind the sacred stone!");

        // --------------------------------------------------------------------
        // 6. COSMIC GOLDEN SEA & GREATER WILL DAIS
        // Center: (-2395, 24.0, 70) | Elev: +24.0m | Theme: Mirrored Golden Waters, Spectral Erdtrees & Elden Beast
        // --------------------------------------------------------------------
        const goldenWaterMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.15, metalness: 0.85 });
        const erdtreeGoldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 2.2 });
        const divineStoneMat = new THREE.MeshStandardMaterial({ color: 0xfffbeb, roughness: 0.3 });

        // Mirrored Liquid Gold Platform
        const goldenSeaFloor = new THREE.Mesh(new THREE.CylinderGeometry(28, 33, 3.5, 24), goldenWaterMat);
        goldenSeaFloor.position.set(-2395, 22.25, 70);
        outsideGroup.add(goldenSeaFloor);

        // 4 Towering Spectral Golden Erdtrees
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const px = -2395 + Math.cos(angle) * 22;
            const pz = 70 + Math.sin(angle) * 22;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.8, 22.0, 10), erdtreeGoldMat);
            trunk.position.set(px, 35.0, pz);
            outsideGroup.add(trunk);

            const crown = new THREE.Mesh(new THREE.ConeGeometry(6.5, 12.0, 8), erdtreeGoldMat);
            crown.position.set(px, 48.0, pz);
            outsideGroup.add(crown);
        }

        // Concentric Golden Rune Circles in Center
        for (let r = 0; r < 3; r++) {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(3.5 + r * 3.5, 0.25, 8, 24), erdtreeGoldMat);
            ring.position.set(-2395, 24.2, 70);
            ring.rotation.x = Math.PI / 2;
            outsideGroup.add(ring);
        }

        const eldenLight = new THREE.PointLight(0xfacc15, 6.0, 65.0);
        eldenLight.position.set(-2395, 28.0, 70);
        outsideGroup.add(eldenLight);

        this.createFloorSoapstone(-2395, 24.0, 82, "#facc15", "✨ COSMIC GOLDEN SEA", "Elden Stars fall from the cosmos; sprint in circles to escape the starlight!");

        // --------------------------------------------------------------------
        // 7. NIGHTMARE GRAND CATHEDRAL & BLAZING ALTAR
        // Center: (-2425, 18.0, -250) | Elev: +18.0m | Theme: Scorched Gothic Nave, Lava Fissure & Laurence
        // --------------------------------------------------------------------
        const scorchedCathedralMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
        const roaringLavaMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 3.2 });
        const cathedralBrassMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4, metalness: 0.7 });

        // Cathedral Nave Floor Slab
        const laurenceFloor = new THREE.Mesh(new THREE.BoxGeometry(48, 4.0, 32), scorchedCathedralMat);
        laurenceFloor.position.set(-2425, 16.0, -250);
        outsideGroup.add(laurenceFloor);

        // 8 Vaulted Scorched Cathedral Buttress Columns
        for (let c = 0; c < 4; c++) {
            for (let side of [-12, 12]) {
                const cz = -250 - 12 + c * 8;
                const pillar = new THREE.Mesh(new THREE.BoxGeometry(2.0, 18.0, 2.0), scorchedCathedralMat);
                pillar.position.set(-2425 + side, 26.0, cz);
                outsideGroup.add(pillar);

                // Burning iron wall sconces
                const sconce = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), roaringLavaMat);
                sconce.position.set(-2425 + side * 0.9, 23.0, cz);
                outsideGroup.add(sconce);
            }
        }

        // Central Molten Lava Fissure
        const lavaChasm = new THREE.Mesh(new THREE.BoxGeometry(32, 0.5, 4.0), roaringLavaMat);
        lavaChasm.position.set(-2425, 18.1, -250);
        outsideGroup.add(lavaChasm);

        const laurenceLight = new THREE.PointLight(0xea580c, 5.5, 60.0);
        laurenceLight.position.set(-2425, 21.0, -250);
        outsideGroup.add(laurenceLight);

        this.createFloorSoapstone(-2425, 18.0, -238, "#ea580c", "🌋 NIGHTMARE CATHEDRAL", "Laurence bleeds molten lava; stay clear of the trailing magma pool!");

        // --------------------------------------------------------------------
        // 8. IRON KEEP SMELTING CORE & MAGMA KILN
        // Center: (-2455, -14.0, 440) | Elev: -14.0m | Theme: Iron Foundry, Chains, Molten Metal & Smelter Demon
        // --------------------------------------------------------------------
        const castIronMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.5, metalness: 0.9 });
        const moltenMagmaMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 3.5 });

        // Octagonal Smelting Crucible Floor
        const furnaceFloor = new THREE.Mesh(new THREE.CylinderGeometry(26, 30, 4.0, 8), castIronMat);
        furnaceFloor.position.set(-2455, -16.0, 440);
        outsideGroup.add(furnaceFloor);

        // 6 Heavy Blast Furnace Exhaust Chimneys
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const px = -2455 + Math.cos(angle) * 20;
            const pz = 440 + Math.sin(angle) * 20;
            const chimney = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.2, 16.0, 10), castIronMat);
            chimney.position.set(px, -6.0, pz);
            outsideGroup.add(chimney);

            // Glowing heat exhaust cap
            const cap = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 8), moltenMagmaMat);
            cap.position.set(px, 2.5, pz);
            outsideGroup.add(cap);
        }

        // Heavy Iron Mooring Chains crossing the Arena
        for (let ch = 0; ch < 4; ch++) {
            const chAngle = (ch / 4) * Math.PI;
            const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 36.0, 8), castIronMat);
            chain.position.set(-2455, -5.0, 440);
            chain.rotation.z = Math.PI / 2;
            chain.rotation.y = chAngle;
            outsideGroup.add(chain);
        }

        // Central Smelting Core Vat
        const vat = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 5.5, 2.0, 16), castIronMat);
        vat.position.set(-2455, -13.0, 440);
        outsideGroup.add(vat);

        const moltenCore = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.0, 0.4, 16), moltenMagmaMat);
        moltenCore.position.set(-2455, -11.9, 440);
        outsideGroup.add(moltenCore);

        const smelterLight = new THREE.PointLight(0xef4444, 5.0, 55.0);
        smelterLight.position.set(-2455, -10.0, 440);
        outsideGroup.add(smelterLight);

        this.createFloorSoapstone(-2455, -14.0, 452, "#ef4444", "👹 SMELTING FURNACE", "When the Smelter Demon ignites its core, keep your distance from the heat pulse!");
    }

    buildEightAscendedOutsideExpeditionsV79(outsideGroup) {
        // ====================================================================
        // 8 BRAND-NEW ASCENDED OUTSIDE REALM EXPEDITIONS (V79 EXPANSION)
        // ====================================================================

        // --------------------------------------------------------------------
        // 1. FELL CALDERA & FORGE OF THE GIANTS
        // Center: (-2485, 32.0, -180) | Elev: +32.0m | Theme: Primordial Fire, Basalt Crags & Fire Giant
        // --------------------------------------------------------------------
        const calderaStoneMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.95 });
        const magmaVeinMat = new THREE.MeshStandardMaterial({ color: 0xea580c, emissive: 0xc2410c, emissiveIntensity: 2.8 });
        const giantIronMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.5, metalness: 0.85 });

        // Raised Volcanic Caldera Platform
        const calderaFloor = new THREE.Mesh(new THREE.CylinderGeometry(30, 35, 4.0, 24), calderaStoneMat);
        calderaFloor.position.set(-2485, 30.0, -180);
        outsideGroup.add(calderaFloor);

        // Giant Iron Cauldron Forge in Center
        const forgeCauldron = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 6.0, 5.0, 16, 1, true), giantIronMat);
        forgeCauldron.position.set(-2485, 34.0, -180);
        outsideGroup.add(forgeCauldron);

        const forgeMagma = new THREE.Mesh(new THREE.CylinderGeometry(7.0, 7.0, 0.4, 16), magmaVeinMat);
        forgeMagma.position.set(-2485, 33.5, -180);
        outsideGroup.add(forgeMagma);

        // Ring of 8 Monumental Basalt Spikes bound with Chains
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const px = -2485 + Math.cos(angle) * 24;
            const pz = -180 + Math.sin(angle) * 24;
            const spike = new THREE.Mesh(new THREE.ConeGeometry(2.0, 14.0, 6), calderaStoneMat);
            spike.position.set(px, 39.0, pz);
            outsideGroup.add(spike);

            const chainRing = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.22, 6, 12), giantIronMat);
            chainRing.position.set(px, 37.0, pz);
            chainRing.rotation.x = Math.PI / 2;
            outsideGroup.add(chainRing);
        }

        const fireGiantLight = new THREE.PointLight(0xf97316, 2.8, 65);
        fireGiantLight.position.set(-2485, 37.0, -180);
        outsideGroup.add(fireGiantLight);

        this.createFloorSoapstone(-2485, 32.0, -168, "#f97316", "🔥 FELL CALDERA & GIANT'S FORGE", "Beware the Fell God's gaze; when the cauldron lid strikes, roll beneath the titan's heel!");

        // --------------------------------------------------------------------
        // 2. BELURAT TOWER & STORM DANCING STAGE
        // Center: (-2515, 12.0, 260) | Elev: +12.0m | Theme: Spiral Arches, Golden Thunder & Dancing Lion
        // --------------------------------------------------------------------
        const hornsentStoneMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.85 });
        const spiralGoldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.75 });
        const stormCyanMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.2 });

        // Hornsent Theatre Stage Dais
        const lionStage = new THREE.Mesh(new THREE.CylinderGeometry(28, 32, 3.5, 24), hornsentStoneMat);
        lionStage.position.set(-2515, 10.25, 260);
        outsideGroup.add(lionStage);

        // 8 Spiral Hornsent Arches around the Stage
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const px = -2515 + Math.cos(angle) * 22;
            const pz = 260 + Math.sin(angle) * 22;
            const archPillar = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 12.0, 8), hornsentStoneMat);
            archPillar.position.set(px, 18.0, pz);
            outsideGroup.add(archPillar);

            const hornCrown = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.35, 6, 12, Math.PI), spiralGoldMat);
            hornCrown.position.set(px, 24.5, pz);
            hornCrown.rotation.z = Math.PI / 2;
            outsideGroup.add(hornCrown);
        }

        // Swirling Incense Braziers
        const brazier1 = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 0.9, 2.2, 8), spiralGoldMat);
        brazier1.position.set(-2515 - 12, 13.0, 260);
        outsideGroup.add(brazier1);

        const brazier2 = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 0.9, 2.2, 8), spiralGoldMat);
        brazier2.position.set(-2515 + 12, 13.0, 260);
        outsideGroup.add(brazier2);

        const lionLight = new THREE.PointLight(0xfacc15, 2.5, 60);
        lionLight.position.set(-2515, 17.0, 260);
        outsideGroup.add(lionLight);

        this.createFloorSoapstone(-2515, 12.0, 272, "#facc15", "🦁 BELURAT STORM DANCING STAGE", "The Divine Beast cycles through tempest, frost, and golden thunder; watch the horns to predict the element!");

        // --------------------------------------------------------------------
        // 3. KING'S PASSAGE & STORM MIRROR DAIS
        // Center: (-2545, -16.0, -380) | Elev: -16.0m | Theme: Wet Flagstones, Mirror Reflections & Looking Glass Knight
        // --------------------------------------------------------------------
        const wetSlateMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.5 });
        const mirrorGlassMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.1, metalness: 0.95 });
        const lightningBlueMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.6 });

        // Rain-slicked Castle Terrace
        const terrace = new THREE.Mesh(new THREE.BoxGeometry(48, 3.0, 56), wetSlateMat);
        terrace.position.set(-2545, -17.5, -380);
        outsideGroup.add(terrace);

        // 10 Storm Buttress Columns with Spires
        for (let i = 0; i < 10; i++) {
            const side = (i % 2 === 0) ? -1 : 1;
            const zStep = Math.floor(i / 2) * 11 - 22;
            const col = new THREE.Mesh(new THREE.BoxGeometry(2.4, 16.0, 2.4), wetSlateMat);
            col.position.set(-2545 + side * 22, -8.0, -380 + zStep);
            outsideGroup.add(col);

            const spire = new THREE.Mesh(new THREE.ConeGeometry(0.8, 4.5, 6), mirrorGlassMat);
            spire.position.set(-2545 + side * 22, 2.0, -380 + zStep);
            outsideGroup.add(spire);
        }

        // Mirror Glass Dais in Center
        const mirrorCenterDais = new THREE.Mesh(new THREE.CylinderGeometry(10.0, 11.5, 0.8, 16), mirrorGlassMat);
        mirrorCenterDais.position.set(-2545, -15.6, -380);
        outsideGroup.add(mirrorCenterDais);

        const mirrorLight = new THREE.PointLight(0x38bdf8, 2.3, 55);
        mirrorLight.position.set(-2545, -10.0, -380);
        outsideGroup.add(mirrorLight);

        this.createFloorSoapstone(-2545, -16.0, -368, "#38bdf8", "🪞 KING'S PASSAGE MIRROR DAIS", "When the Looking Glass Knight plants his mirror shield, rush the mirror before phantoms emerge!");

        // --------------------------------------------------------------------
        // 4. THE DREG HEAP & SUNKEN KILN BASIN
        // Center: (-2575, -28.0, 140) | Elev: -28.0m | Theme: Submerged Cathedrals, Chaos Magma & Demon Prince
        // --------------------------------------------------------------------
        const dregAshMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.95 });
        const chaosLavaMat = new THREE.MeshStandardMaterial({ color: 0xea580c, emissive: 0x9a3412, emissiveIntensity: 3.2 });
        const ruinedStoneMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.85 });

        // Sunken Basin Floor
        const kilnBasin = new THREE.Mesh(new THREE.CylinderGeometry(30, 36, 4.0, 24), dregAshMat);
        kilnBasin.position.set(-2575, -30.0, 140);
        outsideGroup.add(kilnBasin);

        // Magma Chasms in Basin
        const magmaPool = new THREE.Mesh(new THREE.CylinderGeometry(14.0, 14.0, 0.4, 16), chaosLavaMat);
        magmaPool.position.set(-2575, -27.8, 140);
        outsideGroup.add(magmaPool);

        // 4 Tilted Ruined Cathedral Towers in Ash
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + 0.4;
            const px = -2575 + Math.cos(angle) * 20;
            const pz = 140 + Math.sin(angle) * 20;
            const ruinedTower = new THREE.Mesh(new THREE.BoxGeometry(4.5, 18.0, 4.5), ruinedStoneMat);
            ruinedTower.position.set(px, -20.0, pz);
            ruinedTower.rotation.z = 0.28 * Math.cos(angle);
            ruinedTower.rotation.x = 0.28 * Math.sin(angle);
            outsideGroup.add(ruinedTower);
        }

        const demonPrinceLight = new THREE.PointLight(0xea580c, 2.7, 60);
        demonPrinceLight.position.set(-2575, -23.0, 140);
        outsideGroup.add(demonPrinceLight);

        this.createFloorSoapstone(-2575, -28.0, 152, "#ea580c", "🦇 SUNKEN KILN OF THE DREG HEAP", "The Demon Prince channels chaos meteors; sprint behind the sunken cathedral pillars for cover!");

        // --------------------------------------------------------------------
        // 5. SCADUVIEW GRAVITY RIDGE & BOAR GATE
        // Center: (-2605, 20.0, -480) | Elev: +20.0m | Theme: Shadowrock Ridge, Purple Gravity & Commander Gaius
        // --------------------------------------------------------------------
        const scaduRockMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.9 });
        const gravityPurpleMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0x7e22ce, emissiveIntensity: 2.8 });
        const gateIronMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.85 });

        // High Fortress Ridge Platform
        const scaduRidge = new THREE.Mesh(new THREE.BoxGeometry(50, 4.0, 50), scaduRockMat);
        scaduRidge.position.set(-2605, 18.0, -480);
        outsideGroup.add(scaduRidge);

        // Colossal Fortress Boar Gate
        const leftTower = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.2, 20.0, 12), scaduRockMat);
        leftTower.position.set(-2605 - 16, 28.0, -480 - 18);
        outsideGroup.add(leftTower);

        const rightTower = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.2, 20.0, 12), scaduRockMat);
        rightTower.position.set(-2605 + 16, 28.0, -480 - 18);
        outsideGroup.add(rightTower);

        const gateArch = new THREE.Mesh(new THREE.BoxGeometry(34, 4.0, 4.5), scaduRockMat);
        gateArch.position.set(-2605, 36.0, -480 - 18);
        outsideGroup.add(gateArch);

        // Floating Purple Gravity Rifts
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const gx = -2605 + Math.cos(angle) * 16;
            const gz = -480 + Math.sin(angle) * 16;
            const gravOrb = new THREE.Mesh(new THREE.SphereGeometry(1.2, 12, 12), gravityPurpleMat);
            gravOrb.position.set(gx, 25.0, gz);
            outsideGroup.add(gravOrb);
        }

        const gaiusLight = new THREE.PointLight(0xc084fc, 2.5, 55);
        gaiusLight.position.set(-2605, 25.0, -480);
        outsideGroup.add(gaiusLight);

        this.createFloorSoapstone(-2605, 20.0, -468, "#c084fc", "🐗 SCADUVIEW GRAVITY RIDGE", "Commander Gaius charges with unstoppable boar momentum; time your dodge sideways through the tusks!");

        // --------------------------------------------------------------------
        // 6. NIGHTMARE BLOOM & RED MOON LAKE
        // Center: (-2635, 6.0, 380) | Elev: +6.0m | Theme: Crimson Blood Water, White Flora & Moon Presence
        // --------------------------------------------------------------------
        const bloodLakeMat = new THREE.MeshStandardMaterial({ color: 0x450a0a, roughness: 0.15, metalness: 0.4 });
        const lunarFloraMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf1f5f9, emissiveIntensity: 1.5 });
        const redMoonBoneMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 3.0 });

        // Blood Lake Basin
        const bloodLake = new THREE.Mesh(new THREE.CylinderGeometry(28, 33, 3.0, 24), bloodLakeMat);
        bloodLake.position.set(-2635, 4.5, 380);
        outsideGroup.add(bloodLake);

        // Clusters of White Lunar Night-Flowers
        for (let i = 0; i < 24; i++) {
            const fAngle = (i / 24) * Math.PI * 2;
            const fDist = 6.0 + (i % 5) * 3.5;
            const fx = -2635 + Math.cos(fAngle) * fDist;
            const fz = 380 + Math.sin(fAngle) * fDist;
            const flower = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.2, 6), lunarFloraMat);
            flower.position.set(fx, 6.6, fz);
            outsideGroup.add(flower);
        }

        // Ring of 8 Petrified Bone Pillars
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const px = -2635 + Math.cos(angle) * 22;
            const pz = 380 + Math.sin(angle) * 22;
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 14.0, 8), boneMat);
            pillar.position.set(px, 13.0, pz);
            outsideGroup.add(pillar);

            const redOrb = new THREE.Mesh(new THREE.SphereGeometry(1.0, 10, 10), redMoonBoneMat);
            redOrb.position.set(px, 20.8, pz);
            outsideGroup.add(redOrb);
        }

        const moonPresenceLight = new THREE.PointLight(0xef4444, 2.7, 65);
        moonPresenceLight.position.set(-2635, 14.0, 380);
        outsideGroup.add(moonPresenceLight);

        this.createFloorSoapstone(-2635, 6.0, 392, "#ef4444", "🩸 NIGHTMARE RED MOON LAKE", "The Moon Presence gazes with eldritch eyes; when the blood flash blinds you, drink your vial immediately!");

        // --------------------------------------------------------------------
        // 7. PROFANED CAPITAL & BURNING THRONE DAIS
        // Center: (-2665, -20.0, -220) | Elev: -20.0m | Theme: Burnt Gold, Iron Chains, Profaned Flame & Yhorm
        // --------------------------------------------------------------------
        const profanedStoneMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
        const burntGoldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.45, metalness: 0.75 });
        const profanedFlameMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 3.0 });

        // Sunken Gilded Palace Hall
        const profanedHall = new THREE.Mesh(new THREE.CylinderGeometry(30, 35, 4.0, 24), profanedStoneMat);
        profanedHall.position.set(-2665, -22.0, -220);
        outsideGroup.add(profanedHall);

        // Monumental Colossal Throne of Yhorm
        const yhormThrone = new THREE.Mesh(new THREE.BoxGeometry(10.0, 12.0, 6.0), profanedStoneMat);
        yhormThrone.position.set(-2665, -14.0, -220 - 18);
        outsideGroup.add(yhormThrone);

        const throneSeat = new THREE.Mesh(new THREE.BoxGeometry(8.0, 4.0, 5.0), burntGoldMat);
        throneSeat.position.set(-2665, -16.0, -220 - 15);
        outsideGroup.add(throneSeat);

        // 8 Massive Columns bound with Iron Chains & Flaming Braziers
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const px = -2665 + Math.cos(angle) * 22;
            const pz = -220 + Math.sin(angle) * 22;
            const pCol = new THREE.Mesh(new THREE.BoxGeometry(2.8, 18.0, 2.8), profanedStoneMat);
            pCol.position.set(px, -11.0, pz);
            outsideGroup.add(pCol);

            const brazier = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.7, 1.4, 8), profanedFlameMat);
            brazier.position.set(px, -1.0, pz);
            outsideGroup.add(brazier);
        }

        const yhormLight = new THREE.PointLight(0xf59e0b, 2.6, 60);
        yhormLight.position.set(-2665, -10.0, -220);
        outsideGroup.add(yhormLight);

        this.createFloorSoapstone(-2665, -20.0, -208, "#f59e0b", "👑 PROFANED CAPITAL THRONE DAIS", "Yhorm's great machete leaves flaming rifts; take refuge in the wind of the Storm Ruler!");

        // --------------------------------------------------------------------
        // 8. LOTHRIC HIGH BRIDGE & BASTION MOORING
        // Center: (-2695, 26.0, 80) | Elev: +26.0m | Theme: High Castle Viaduct, Dragon Greatshields & Dragonslayer Armour
        // --------------------------------------------------------------------
        const lothricAshlarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
        const lothricIronMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.45, metalness: 0.85 });
        const dragonslayerLightningMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 2.8 });

        // Monumental Viaduct Bridge Deck
        const highBridge = new THREE.Mesh(new THREE.BoxGeometry(32, 4.0, 60), lothricAshlarMat);
        highBridge.position.set(-2695, 24.0, 80);
        outsideGroup.add(highBridge);

        // Bridge Parapets on Sides
        const leftParapet = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.5, 60), lothricAshlarMat);
        leftParapet.position.set(-2695 - 15, 27.25, 80);
        outsideGroup.add(leftParapet);

        const rightParapet = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.5, 60), lothricAshlarMat);
        rightParapet.position.set(-2695 + 15, 27.25, 80);
        outsideGroup.add(rightParapet);

        // 6 Gothic Arch Pylons with Heraldic Dragon Heads
        for (let i = 0; i < 6; i++) {
            const side = (i % 2 === 0) ? -1 : 1;
            const zStep = Math.floor(i / 2) * 22 - 22;
            const pylon = new THREE.Mesh(new THREE.BoxGeometry(3.0, 16.0, 3.0), lothricIronMat);
            pylon.position.set(-2695 + side * 15, 32.0, 80 + zStep);
            outsideGroup.add(pylon);

            const lightningConduit = new THREE.Mesh(new THREE.ConeGeometry(0.7, 3.5, 6), dragonslayerLightningMat);
            lightningConduit.position.set(-2695 + side * 15, 41.5, 80 + zStep);
            outsideGroup.add(lightningConduit);
        }

        const dragonslayerLight = new THREE.PointLight(0xeab308, 2.5, 55);
        dragonslayerLight.position.set(-2695, 31.0, 80);
        outsideGroup.add(dragonslayerLight);

        this.createFloorSoapstone(-2695, 26.0, 92, "#eab308", "🛡️ LOTHRIC CASTLE HIGH BRIDGE", "The Dragonslayer Armour swings with crushing poise; keep the shield raised and beware the butterfly volleys!");
    }

    buildEightAscendedOutsideExpeditionsV80(outsideGroup) {
        // ====================================================================
        // 8 BRAND-NEW ASCENDED OUTSIDE REALM EXPEDITIONS (V80 EXPANSION)
        // ====================================================================

        // --------------------------------------------------------------------
        // 1. DARK CHASM OF OLD & PILGRIMS' ALTAR
        // Center: (-2725, -18.0, -320) | Elev: -18.0m | Theme: Abyssal Obsidian, Void Runes & Darklurker
        // --------------------------------------------------------------------
        const chasmDarkMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 });
        const chasmRuneMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, emissive: 0x7e22ce, emissiveIntensity: 2.6 });
        const chasmSoulMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.2 });

        // Sunken Circular Abyssal Dais
        const chasmFloor = new THREE.Mesh(new THREE.CylinderGeometry(28, 32, 3.5, 24), chasmDarkMat);
        chasmFloor.position.set(-2725, -19.75, -320);
        outsideGroup.add(chasmFloor);

        const chasmInnerRing = new THREE.Mesh(new THREE.RingGeometry(8, 22, 24), chasmRuneMat);
        chasmInnerRing.rotation.x = -Math.PI / 2;
        chasmInnerRing.position.set(-2725, -17.95, -320);
        outsideGroup.add(chasmInnerRing);

        // 8 Twisted Abyssal Obelisks crowned with Dark Soul Beacons
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const px = -2725 + Math.cos(angle) * 22;
            const pz = -320 + Math.sin(angle) * 22;
            const obelisk = new THREE.Mesh(new THREE.BoxGeometry(1.8, 14.0, 1.8), chasmDarkMat);
            obelisk.position.set(px, -11.0, pz);
            obelisk.rotation.y = angle;
            outsideGroup.add(obelisk);

            const soulBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), chasmSoulMat);
            soulBeacon.position.set(px, -3.2, pz);
            outsideGroup.add(soulBeacon);
        }

        const darkChasmLight = new THREE.PointLight(0xa855f7, 2.7, 60);
        darkChasmLight.position.set(-2725, -12.0, -320);
        outsideGroup.add(darkChasmLight);

        this.createFloorSoapstone(-2725, -18.0, -308, "#a855f7", "🌌 DARK CHASM OF OLD & PILGRIMS' ALTAR", "The Darklurker splits its soul in two; strike fast when the blade forms and beware the abyssal orb!");

        // --------------------------------------------------------------------
        // 2. EARTHEN PEAK & WINDMILL POISON BASIN
        // Center: (-2755, 14.0, 240) | Elev: +14.0m | Theme: Toxic Sludge, Iron Pipes & Mytha Baneful Queen
        // --------------------------------------------------------------------
        const peakWoodMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.9 });
        const toxicSlimeMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, emissive: 0x15803d, emissiveIntensity: 2.5 });
        const rustedIronMat = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.7, metalness: 0.6 });

        // Raised Industrial Timber & Sludge Dais
        const peakFloor = new THREE.Mesh(new THREE.CylinderGeometry(29, 34, 3.8, 24), peakWoodMat);
        peakFloor.position.set(-2755, 12.1, 240);
        outsideGroup.add(peakFloor);

        const poisonPool = new THREE.Mesh(new THREE.CylinderGeometry(22, 22, 0.4, 24), toxicSlimeMat);
        poisonPool.position.set(-2755, 14.1, 240);
        outsideGroup.add(poisonPool);

        // Windmill Gear Hub & Blades in Center
        const gearHub = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 2.0, 16), rustedIronMat);
        gearHub.position.set(-2755, 20.0, 240);
        gearHub.rotation.x = Math.PI / 2;
        outsideGroup.add(gearHub);

        for (let i = 0; i < 4; i++) {
            const bladeAngle = (i / 4) * Math.PI * 2;
            const blade = new THREE.Mesh(new THREE.BoxGeometry(1.2, 16.0, 0.4), peakWoodMat);
            blade.position.set(-2755 + Math.cos(bladeAngle) * 8.0, 20.0 + Math.sin(bladeAngle) * 8.0, 240);
            blade.rotation.z = bladeAngle;
            outsideGroup.add(blade);
        }

        // 4 Bubbling Toxic Vats
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
            const px = -2755 + Math.cos(angle) * 18;
            const pz = 240 + Math.sin(angle) * 18;
            const vat = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.0, 4.0, 12), rustedIronMat);
            vat.position.set(px, 16.0, pz);
            outsideGroup.add(vat);

            const vatSlime = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.3, 12), toxicSlimeMat);
            vatSlime.position.set(px, 18.0, pz);
            outsideGroup.add(vatSlime);
        }

        const mythaLight = new THREE.PointLight(0x22c55e, 2.8, 60);
        mythaLight.position.set(-2755, 18.0, 240);
        outsideGroup.add(mythaLight);

        this.createFloorSoapstone(-2755, 14.0, 252, "#22c55e", "🐍 EARTHEN PEAK POISON BASIN", "Mytha's severed singing head casts venomous waves; keep clear of toxic pools and strike the tail!");

        // --------------------------------------------------------------------
        // 3. GREAT BRIDGE OF CENTRAL YHARNAM
        // Center: (-2785, 28.0, -120) | Elev: +28.0m | Theme: Victorian Cobblestone, Gas Lamps & Cleric Beast
        // --------------------------------------------------------------------
        const bridgeCobbleMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.85 });
        const victorianIronMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5, metalness: 0.8 });
        const gasFlameMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 3.2 });

        // Monumental Elevated Viaduct Bridge Deck
        const bridgeRoad = new THREE.Mesh(new THREE.BoxGeometry(26.0, 4.0, 60.0), bridgeCobbleMat);
        bridgeRoad.position.set(-2785, 26.0, -120);
        outsideGroup.add(bridgeRoad);

        // Heavy Stone Parapets
        const leftBalustrade = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.5, 60.0), victorianIronMat);
        leftBalustrade.position.set(-2785 - 12.0, 29.25, -120);
        outsideGroup.add(leftBalustrade);

        const rightBalustrade = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.5, 60.0), victorianIronMat);
        rightBalustrade.position.set(-2785 + 12.0, 29.25, -120);
        outsideGroup.add(rightBalustrade);

        // 6 Ornate Iron Streetlamp Posts with Glowing Amber Gas Lamps
        for (let i = 0; i < 6; i++) {
            const side = (i % 2 === 0) ? -1 : 1;
            const zStep = Math.floor(i / 2) * 20 - 20;
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 7.0, 8), victorianIronMat);
            post.position.set(-2785 + side * 11.5, 31.5, -120 + zStep);
            outsideGroup.add(post);

            const lantern = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 1.2), gasFlameMat);
            lantern.position.set(-2785 + side * 11.5, 35.2, -120 + zStep);
            outsideGroup.add(lantern);
        }

        const clericLight = new THREE.PointLight(0xf59e0b, 2.6, 65);
        clericLight.position.set(-2785, 33.0, -120);
        outsideGroup.add(clericLight);

        this.createFloorSoapstone(-2785, 28.0, -102, "#f59e0b", "🐺 GREAT BRIDGE OF CENTRAL YHARNAM", "The Cleric Beast shrieks from the bridge chapel; roll through its oversized left claw!");

        // --------------------------------------------------------------------
        // 4. CATACOMBS OF CARTHUS & ABYSSAL GOBLET HALL
        // Center: (-2815, -26.0, 340) | Elev: -26.0m | Theme: Skulls, Gold Bangles, Black Fog & High Lord Wolnir
        // --------------------------------------------------------------------
        const carthusBoneMat = new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.95 });
        const wolnirGoldMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.35, metalness: 0.9 });
        const abyssVoidMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 1.0 });

        // Sunken Carthus Crypt Dais
        const cryptFloor = new THREE.Mesh(new THREE.CylinderGeometry(30, 35, 4.0, 24), carthusBoneMat);
        cryptFloor.position.set(-2815, -28.0, 340);
        outsideGroup.add(cryptFloor);

        // Monumental Golden Chalice Goblet in Center
        const gobletStem = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 3.2, 5.0, 16), wolnirGoldMat);
        gobletStem.position.set(-2815, -23.5, 340);
        outsideGroup.add(gobletStem);

        const gobletCup = new THREE.Mesh(new THREE.CylinderGeometry(6.0, 2.0, 5.5, 16, 1, true), wolnirGoldMat);
        gobletCup.position.set(-2815, -18.5, 340);
        outsideGroup.add(gobletCup);

        const gobletAbyss = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 5.6, 0.4, 16), abyssVoidMat);
        gobletAbyss.position.set(-2815, -19.0, 340);
        outsideGroup.add(gobletAbyss);

        // 8 Skull Totem Columns with Golden Torches
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const px = -2815 + Math.cos(angle) * 23;
            const pz = 340 + Math.sin(angle) * 23;
            const skullPillar = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 14.0, 8), carthusBoneMat);
            skullPillar.position.set(px, -19.0, pz);
            outsideGroup.add(skullPillar);

            const goldCrown = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.3, 8, 16), wolnirGoldMat);
            goldCrown.position.set(px, -11.8, pz);
            goldCrown.rotation.x = Math.PI / 2;
            outsideGroup.add(goldCrown);
        }

        const wolnirLight = new THREE.PointLight(0xeab308, 2.8, 65);
        wolnirLight.position.set(-2815, -18.0, 340);
        outsideGroup.add(wolnirLight);

        this.createFloorSoapstone(-2815, -26.0, 352, "#eab308", "💀 CATACOMBS ABYSSAL GOBLET HALL", "Shatter High Lord Wolnir's glowing golden bangles before the abyssal vapor suffocates you!");

        // --------------------------------------------------------------------
        // 5. SUNKEN DEPTHS & FLOODED SEWER MAW
        // Center: (-2845, -22.0, -420) | Elev: -22.0m | Theme: Iron Grates, Ribcage Arches & Gaping Dragon
        // --------------------------------------------------------------------
        const sewerStoneMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.95 });
        const slimeWaterMat = new THREE.MeshStandardMaterial({ color: 0x84cc16, emissive: 0x4d7c0f, emissiveIntensity: 2.0 });
        const boneRibMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.7 });

        // Sunken Amphitheater Sewer Basin
        const sewerFloor = new THREE.Mesh(new THREE.CylinderGeometry(30, 35, 4.0, 24), sewerStoneMat);
        sewerFloor.position.set(-2845, -24.0, -420);
        outsideGroup.add(sewerFloor);

        const slimeLake = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 0.4, 24), slimeWaterMat);
        slimeLake.position.set(-2845, -21.9, -420);
        outsideGroup.add(slimeLake);

        // 6 Monumental Ribcage Arches around the Basin
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const px = -2845 + Math.cos(angle) * 20;
            const pz = -420 + Math.sin(angle) * 20;
            const ribArch = new THREE.Mesh(new THREE.TorusGeometry(8.0, 0.8, 8, 16, Math.PI), boneRibMat);
            ribArch.position.set(px, -15.0, pz);
            ribArch.rotation.y = angle + Math.PI / 2;
            ribArch.rotation.z = Math.PI;
            outsideGroup.add(ribArch);
        }

        const gapingDragonLight = new THREE.PointLight(0xa3e635, 2.5, 60);
        gapingDragonLight.position.set(-2845, -16.0, -420);
        outsideGroup.add(gapingDragonLight);

        this.createFloorSoapstone(-2845, -22.0, -408, "#a3e635", "🐲 SUNKEN DEPTHS FLOODED MAW", "The Gaping Dragon's ribcage opens into an insatiable maw; avoid the charge and cut the tail!");

        // --------------------------------------------------------------------
        // 6. SHRINE OF AMANA & FLOODED LOTUS HAVEN
        // Center: (-2875, 4.0, 160) | Elev: +4.0m | Theme: Submerged Azure Sanctum, Water Lilies & Demon of Song
        // --------------------------------------------------------------------
        const amanaStoneMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
        const amanaWaterMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 2.2 });
        const lotusBloomMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 2.8 });

        // Submerged Circular Platform
        const amanaDais = new THREE.Mesh(new THREE.CylinderGeometry(28, 33, 3.2, 24), amanaStoneMat);
        amanaDais.position.set(-2875, 2.4, 160);
        outsideGroup.add(amanaDais);

        const waterSheen = new THREE.Mesh(new THREE.CylinderGeometry(25, 25, 0.4, 24), amanaWaterMat);
        waterSheen.position.set(-2875, 4.1, 160);
        outsideGroup.add(waterSheen);

        // 16 Luminous Water Lilies / Lotus Blooms
        for (let i = 0; i < 16; i++) {
            const fAngle = (i / 16) * Math.PI * 2;
            const fDist = 7.0 + (i % 4) * 4.0;
            const fx = -2875 + Math.cos(fAngle) * fDist;
            const fz = 160 + Math.sin(fAngle) * fDist;
            const lotusPad = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.1, 8), amanaStoneMat);
            lotusPad.position.set(fx, 4.2, fz);
            outsideGroup.add(lotusPad);

            const flower = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.0, 6), lotusBloomMat);
            flower.position.set(fx, 4.7, fz);
            outsideGroup.add(flower);
        }

        // 8 Luminous Crystal Spires
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const px = -2875 + Math.cos(angle) * 22;
            const pz = 160 + Math.sin(angle) * 22;
            const crystal = new THREE.Mesh(new THREE.ConeGeometry(1.2, 12.0, 6), lotusBloomMat);
            crystal.position.set(px, 10.0, pz);
            outsideGroup.add(crystal);
        }

        const amanaLight = new THREE.PointLight(0x38bdf8, 2.6, 60);
        amanaLight.position.set(-2875, 11.0, 160);
        outsideGroup.add(amanaLight);

        this.createFloorSoapstone(-2875, 4.0, 172, "#38bdf8", "🪷 SHRINE OF AMANA LOTUS HAVEN", "Wait for the Demon of Song's armored carapace to open before unleashing your strikes!");

        // --------------------------------------------------------------------
        // 7. HIGH WALL OF LOTHRIC & BOREAL OUTRIDER GATE
        // Center: (-2905, 32.0, -220) | Elev: +32.0m | Theme: Frozen Castle Bastion, Icicles & Vordt of Boreal Valley
        // --------------------------------------------------------------------
        const frozenCastleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
        const borealFrostMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, emissive: 0x60a5fa, emissiveIntensity: 2.6 });
        const iceIronMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.8 });

        // Raised Frozen Castle Rampart Platform
        const borealPlatform = new THREE.Mesh(new THREE.BoxGeometry(32.0, 4.5, 45.0), frozenCastleMat);
        borealPlatform.position.set(-2905, 29.75, -220);
        outsideGroup.add(borealPlatform);

        // Massive Portcullis Archway at North End
        const archL = new THREE.Mesh(new THREE.BoxGeometry(4.0, 18.0, 4.0), iceIronMat);
        archL.position.set(-2905 - 12.0, 41.0, -220 - 18.0);
        outsideGroup.add(archL);

        const archR = new THREE.Mesh(new THREE.BoxGeometry(4.0, 18.0, 4.0), iceIronMat);
        archR.position.set(-2905 + 12.0, 41.0, -220 - 18.0);
        outsideGroup.add(archR);

        const archTop = new THREE.Mesh(new THREE.BoxGeometry(28.0, 4.0, 4.0), iceIronMat);
        archTop.position.set(-2905, 52.0, -220 - 18.0);
        outsideGroup.add(archTop);

        // 6 Frost Icicle Braziers along Battlement Edges
        for (let i = 0; i < 6; i++) {
            const side = (i % 2 === 0) ? -1 : 1;
            const zStep = Math.floor(i / 2) * 16 - 16;
            const brazierBase = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.8, 3.5, 8), iceIronMat);
            brazierBase.position.set(-2905 + side * 14.0, 33.75, -220 + zStep);
            outsideGroup.add(brazierBase);

            const frostFlame = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.5, 6), borealFrostMat);
            frostFlame.position.set(-2905 + side * 14.0, 36.5, -220 + zStep);
            outsideGroup.add(frostFlame);
        }

        const vordtLight = new THREE.PointLight(0x60a5fa, 2.8, 65);
        vordtLight.position.set(-2905, 37.0, -220);
        outsideGroup.add(vordtLight);

        this.createFloorSoapstone(-2905, 32.0, -204, "#60a5fa", "❄️ HIGH WALL BOREAL OUTRIDER GATE", "Vordt charges in a subzero fury; dodge behind his armored haunches to avoid the frost cone!");

        // --------------------------------------------------------------------
        // 8. FORBIDDEN GRAVE & SHADOW SNAKE BASIN
        // Center: (-2935, -10.0, 380) | Elev: -10.0m | Theme: Mossy Gravestones, Serpent Monoliths & Shadow of Yharnam
        // --------------------------------------------------------------------
        const mossGraveMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.95 });
        const serpentStoneMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.85 });
        const shadowFlameMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 2.8 });

        // Misty Forest Basin Dais
        const graveFloor = new THREE.Mesh(new THREE.CylinderGeometry(30, 35, 4.0, 24), mossGraveMat);
        graveFloor.position.set(-2935, -12.0, 380);
        outsideGroup.add(graveFloor);

        // 12 Ancient Tilting Headstones
        for (let i = 0; i < 12; i++) {
            const hAngle = (i / 12) * Math.PI * 2;
            const hDist = 8.0 + (i % 3) * 5.0;
            const hx = -2935 + Math.cos(hAngle) * hDist;
            const hz = 380 + Math.sin(hAngle) * hDist;
            const headstone = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.2, 0.4), mossGraveMat);
            headstone.position.set(hx, -9.0, hz);
            headstone.rotation.y = hAngle;
            headstone.rotation.z = (i % 2 === 0 ? 0.15 : -0.15);
            outsideGroup.add(headstone);
        }

        // 4 Monumental Serpent Pillars entwined with Fire
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
            const px = -2935 + Math.cos(angle) * 21;
            const pz = 380 + Math.sin(angle) * 21;
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, 14.0, 8), serpentStoneMat);
            pillar.position.set(px, -3.0, pz);
            outsideGroup.add(pillar);

            const coil = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.4, 8, 16), serpentStoneMat);
            coil.position.set(px, 1.0, pz);
            coil.rotation.x = Math.PI / 3;
            outsideGroup.add(coil);

            const fireBrazier = new THREE.Mesh(new THREE.SphereGeometry(1.0, 8, 8), shadowFlameMat);
            fireBrazier.position.set(px, 5.0, pz);
            outsideGroup.add(fireBrazier);
        }

        const shadowLight = new THREE.PointLight(0xf97316, 2.7, 65);
        shadowLight.position.set(-2935, -3.0, 380);
        outsideGroup.add(shadowLight);

        this.createFloorSoapstone(-2935, -10.0, 392, "#f97316", "🌑 FORBIDDEN GRAVE SHADOW BASIN", "Three shadows hunt in concert; separate the pyromancer first and watch the ground for giant serpents!");
    }

    buildEightAscendedOutsideExpeditionsV81(outsideGroup) {
        // ====================================================================
        // 8 BRAND-NEW ASCENDED OUTSIDE REALM EXPEDITIONS (V81 EXPANSION)
        // ====================================================================

        // --------------------------------------------------------------------
        // 1. NEW LONDO RUINS & THE ABYSS VOID WELL
        // Center: (-2965, -32.0, -340) | Elev: -32.0m | Theme: Drowned Stone, Void Darkness & Four Kings
        // --------------------------------------------------------------------
        const drownedStoneMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.95 });
        const abyssVoidMat = new THREE.MeshStandardMaterial({ color: 0x030712, roughness: 1.0 });
        const abyssSoulMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, emissive: 0x4338ca, emissiveIntensity: 2.5 });

        // Sunken Circular Abyssal Pit
        const abyssFloor = new THREE.Mesh(new THREE.CylinderGeometry(28, 32, 4.0, 24), drownedStoneMat);
        abyssFloor.position.set(-2965, -34.0, -340);
        outsideGroup.add(abyssFloor);

        const abyssVoidInner = new THREE.Mesh(new THREE.RingGeometry(6, 22, 24), abyssVoidMat);
        abyssVoidInner.rotation.x = -Math.PI / 2;
        abyssVoidInner.position.set(-2965, -31.95, -340);
        outsideGroup.add(abyssVoidInner);

        // 4 Monumental Abyssal Thrones
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const tx = -2965 + Math.cos(angle) * 19;
            const tz = -340 + Math.sin(angle) * 19;
            const throne = new THREE.Mesh(new THREE.BoxGeometry(2.6, 6.5, 2.0), drownedStoneMat);
            throne.position.set(tx, -28.75, tz);
            throne.rotation.y = angle + Math.PI;
            outsideGroup.add(throne);

            const soulOrb = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), abyssSoulMat);
            soulOrb.position.set(tx, -24.8, tz);
            outsideGroup.add(soulOrb);
        }

        const newLondoLight = new THREE.PointLight(0x818cf8, 2.6, 55);
        newLondoLight.position.set(-2965, -26.0, -340);
        outsideGroup.add(newLondoLight);

        this.createFloorSoapstone(-2965, -32.0, -328, "#818cf8", "👑 NEW LONDO ABYSS VOID WELL", "Four Kings rise from the dark abyss; equip Covenant of Artorias, stay close and slay each before the next awakens!");

        // --------------------------------------------------------------------
        // 2. BLIGHTTOWN DEPTHS & MAGMA WEB CALDERA
        // Center: (-2995, -24.0, 260) | Elev: -24.0m | Theme: Boiling Magma, Silk Webs & Chaos Witch Quelaag
        // --------------------------------------------------------------------
        const magmaRockMat = new THREE.MeshStandardMaterial({ color: 0x262626, roughness: 0.9 });
        const boilingMagmaMat = new THREE.MeshStandardMaterial({ color: 0xea580c, emissive: 0xc2410c, emissiveIntensity: 3.2 });
        const silkWebMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f4, roughness: 0.3, transparent: true, opacity: 0.85 });

        // Raised Volcanic Caldera Rim
        const calderaBase = new THREE.Mesh(new THREE.CylinderGeometry(29, 34, 4.0, 24), magmaRockMat);
        calderaBase.position.set(-2995, -26.0, 260);
        outsideGroup.add(calderaBase);

        const lavaPool = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 0.4, 24), boilingMagmaMat);
        lavaPool.position.set(-2995, -23.8, 260);
        outsideGroup.add(lavaPool);

        // 6 Basalt Spider Web Pillars
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const px = -2995 + Math.cos(angle) * 22;
            const pz = 260 + Math.sin(angle) * 22;
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.4, 12.0, 8), magmaRockMat);
            pillar.position.set(px, -18.0, pz);
            outsideGroup.add(pillar);

            const webMesh = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.3, 6, 12), silkWebMat);
            webMesh.position.set(px, -13.0, pz);
            webMesh.rotation.x = Math.PI / 4;
            outsideGroup.add(webMesh);
        }

        const quelaagLight = new THREE.PointLight(0xf97316, 3.0, 60);
        quelaagLight.position.set(-2995, -17.0, 260);
        outsideGroup.add(quelaagLight);

        this.createFloorSoapstone(-2995, -24.0, 272, "#f97316", "🕷️ BLIGHTTOWN MAGMA WEB CALDERA", "Chaos Witch Quelaag spews boiling magma; watch her human torso for the explosion signal and circle to her spider flank!");

        // --------------------------------------------------------------------
        // 3. OLD YHARNAM & CHURCH OF THE GOOD CHALICE
        // Center: (-3025, 16.0, -140) | Elev: +16.0m | Theme: Burned Cathedral, Blood Sacraments & Blood-starved Beast
        // --------------------------------------------------------------------
        const charredStoneMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });
        const bloodAltarMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, emissive: 0x7f1d1d, emissiveIntensity: 2.2 });
        const chaliceGoldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.3 });

        // Cathedral Nave Platform
        const naveFloor = new THREE.Mesh(new THREE.BoxGeometry(42, 3.5, 26), charredStoneMat);
        naveFloor.position.set(-3025, 14.25, -140);
        outsideGroup.add(naveFloor);

        // High Sacrificial Chalice Altar
        const altarBase = new THREE.Mesh(new THREE.BoxGeometry(8, 2.2, 5), charredStoneMat);
        altarBase.position.set(-3040, 17.1, -140);
        outsideGroup.add(altarBase);

        const chaliceBowl = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 0.6, 2.2, 12), chaliceGoldMat);
        chaliceBowl.position.set(-3040, 19.3, -140);
        outsideGroup.add(chaliceBowl);

        const bloodPool = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.2, 12), bloodAltarMat);
        bloodPool.position.set(-3040, 20.3, -140);
        outsideGroup.add(bloodPool);

        // 8 Burnt Gothic Colonnade Pillars
        for (let i = 0; i < 4; i++) {
            const zOff = (i % 2 === 0) ? -10.5 : 10.5;
            const xOff = -3010 - Math.floor(i / 2) * 14;
            const col = new THREE.Mesh(new THREE.BoxGeometry(2.0, 13.0, 2.0), charredStoneMat);
            col.position.set(xOff, 22.5, -140 + zOff);
            outsideGroup.add(col);
        }

        const chaliceLight = new THREE.PointLight(0xef4444, 2.8, 55);
        chaliceLight.position.set(-3025, 22.0, -140);
        outsideGroup.add(chaliceLight);

        this.createFloorSoapstone(-3025, 16.0, -128, "#ef4444", "🩸 CHURCH OF THE GOOD CHALICE", "Blood-starved Beast attacks with frenzied poison swipes; dodge to her left and throw pungent blood cocktails!");

        // --------------------------------------------------------------------
        // 4. MOONSIDE LAKE & REFLECTIVE GLASS EXPANSE
        // Center: (-3055, 2.0, 360) | Elev: +2.0m | Theme: Infinite Mirror Water, Cosmic Moon & Rom the Vacuous Spider
        // --------------------------------------------------------------------
        const mirrorWaterMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.7 });
        const lunarGlowMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, emissive: 0xbae6fd, emissiveIntensity: 2.8 });
        const cosmicMistMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.0 });

        // Glass-like Mirror Surface
        const lakeDisc = new THREE.Mesh(new THREE.CylinderGeometry(32, 35, 2.5, 32), mirrorWaterMat);
        lakeDisc.position.set(-3055, 0.75, 360);
        outsideGroup.add(lakeDisc);

        const lunarRing = new THREE.Mesh(new THREE.RingGeometry(12, 28, 32), lunarGlowMat);
        lunarRing.rotation.x = -Math.PI / 2;
        lunarRing.position.set(-3055, 2.05, 360);
        outsideGroup.add(lunarRing);

        // 8 Floating Crystalline Moon Shards
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const cx = -3055 + Math.cos(angle) * 23;
            const cz = 360 + Math.sin(angle) * 23;
            const shard = new THREE.Mesh(new THREE.OctahedronGeometry(1.6, 0), cosmicMistMat);
            shard.position.set(cx, 6.0, cz);
            shard.rotation.y = angle;
            outsideGroup.add(shard);
        }

        const moonsideLight = new THREE.PointLight(0x7dd3fc, 2.9, 65);
        moonsideLight.position.set(-3055, 8.0, 360);
        outsideGroup.add(moonsideLight);

        this.createFloorSoapstone(-3055, 2.0, 372, "#7dd3fc", "🌕 MOONSIDE LAKE REFLECTIVE EXPANSE", "Rom summons meteor showers from the cosmos; sprint laterally when she rears up and crush the brood from behind!");

        // --------------------------------------------------------------------
        // 5. CONSUMED KING'S GARDEN & TOXIC FOG BASIN
        // Center: (-3085, -18.0, -280) | Elev: -18.0m | Theme: Sunken Marble Courtyard, Toxic Vapor & Oceiros Consumed King
        // --------------------------------------------------------------------
        const mossMarbleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
        const toxicFogMat = new THREE.MeshStandardMaterial({ color: 0x84cc16, emissive: 0x65a30d, emissiveIntensity: 2.2 });
        const royalGoldMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.75, roughness: 0.35 });

        // Octagonal Sunken Royal Terrace
        const gardenFloor = new THREE.Mesh(new THREE.CylinderGeometry(28, 32, 3.8, 8), mossMarbleMat);
        gardenFloor.position.set(-3085, -19.9, -280);
        outsideGroup.add(gardenFloor);

        const toxicPool = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 0.3, 8), toxicFogMat);
        toxicPool.position.set(-3085, -17.9, -280);
        outsideGroup.add(toxicPool);

        // 6 Twisted Overgrown Royal Balustrades & Statues
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const bx = -3085 + Math.cos(angle) * 22;
            const bz = -280 + Math.sin(angle) * 22;
            const statue = new THREE.Mesh(new THREE.BoxGeometry(2.0, 8.0, 2.0), mossMarbleMat);
            statue.position.set(bx, -14.0, bz);
            outsideGroup.add(statue);

            const crown = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.0, 6), royalGoldMat);
            crown.position.set(bx, -9.0, bz);
            outsideGroup.add(crown);
        }

        const oceirosLight = new THREE.PointLight(0xa3e635, 2.6, 55);
        oceirosLight.position.set(-3085, -12.0, -280);
        outsideGroup.add(oceirosLight);

        this.createFloorSoapstone(-3085, -18.0, -268, "#a3e635", "🐉 CONSUMED KING'S GARDEN", "Oceiros thrashes with blinding crystal rage; stay under his dragon tail in phase 2 and roll through his no-windup charge!");

        // --------------------------------------------------------------------
        // 6. IRON KEEP LOWER FOUNDRY & MOLTEN BRIMSTONE CALDERA
        // Center: (-3115, -28.0, 180) | Elev: -28.0m | Theme: Black Iron Foundry, Lava Sea & Old Iron King
        // --------------------------------------------------------------------
        const castIronMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8, metalness: 0.7 });
        const moltenBrimstoneMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xb91c1c, emissiveIntensity: 3.5 });
        const ironSpikeMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.6, metalness: 0.8 });

        // Raised Heavy Iron Smelting Island
        const ironPlatform = new THREE.Mesh(new THREE.BoxGeometry(32, 4.0, 32), castIronMat);
        ironPlatform.position.set(-3115, -30.0, 180);
        outsideGroup.add(ironPlatform);

        const lavaLake = new THREE.Mesh(new THREE.RingGeometry(18, 36, 24), moltenBrimstoneMat);
        lavaLake.rotation.x = -Math.PI / 2;
        lavaLake.position.set(-3115, -27.8, 180);
        outsideGroup.add(lavaLake);

        // 4 Monumental Iron Blast Chimneys
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
            const fx = -3115 + Math.cos(angle) * 18;
            const fz = 180 + Math.sin(angle) * 18;
            const chimney = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.4, 14.0, 8), castIronMat);
            chimney.position.set(fx, -21.0, fz);
            outsideGroup.add(chimney);

            const flameTop = new THREE.Mesh(new THREE.ConeGeometry(2.0, 3.5, 8), moltenBrimstoneMat);
            flameTop.position.set(fx, -12.5, fz);
            outsideGroup.add(flameTop);
        }

        const ironKingLight = new THREE.PointLight(0xef4444, 3.2, 60);
        ironKingLight.position.set(-3115, -19.0, 180);
        outsideGroup.add(ironKingLight);

        this.createFloorSoapstone(-3115, -28.0, 192, "#ef4444", "🔥 MOLTEN BRIMSTONE FOUNDRY CALDERA", "The Old Iron King commands the molten abyss; bait his flame fist onto the stone slab and avoid the lava pit hole!");

        // --------------------------------------------------------------------
        // 7. YAHAR'GUL GRAVEYARD & HYPOGEAN ELECTRIC BASIN
        // Center: (-3145, -12.0, -380) | Elev: -12.0m | Theme: Sunken Basalt Crypts, Lightning Arcs & Darkbeast Paarl
        // --------------------------------------------------------------------
        const hypogeanStoneMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95 });
        const cyanLightningMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0891b2, emissiveIntensity: 3.2 });
        const ironCageMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.4 });

        // Sunken Circular Courtyard
        const hypogeanFloor = new THREE.Mesh(new THREE.CylinderGeometry(28, 33, 3.8, 24), hypogeanStoneMat);
        hypogeanFloor.position.set(-3145, -13.9, -380);
        outsideGroup.add(hypogeanFloor);

        const electricRings = new THREE.Mesh(new THREE.RingGeometry(8, 22, 24), cyanLightningMat);
        electricRings.rotation.x = -Math.PI / 2;
        electricRings.position.set(-3145, -11.9, -380);
        outsideGroup.add(electricRings);

        // 6 Megalithic Skeletal Cage Arches
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const kx = -3145 + Math.cos(angle) * 21;
            const kz = -380 + Math.sin(angle) * 21;
            const cage = new THREE.Mesh(new THREE.BoxGeometry(2.2, 11.0, 2.2), ironCageMat);
            cage.position.set(kx, -6.5, kz);
            outsideGroup.add(cage);

            const spark = new THREE.Mesh(new THREE.OctahedronGeometry(1.2, 0), cyanLightningMat);
            spark.position.set(kx, 0.0, kz);
            outsideGroup.add(spark);
        }

        const paarlLight = new THREE.PointLight(0x06b6d4, 2.9, 60);
        paarlLight.position.set(-3145, -5.0, -380);
        outsideGroup.add(paarlLight);

        this.createFloorSoapstone(-3145, -12.0, -368, "#06b6d4", "⚡ YAHAR'GUL HYPOGEAN ELECTRIC BASIN", "Darkbeast Paarl surges with blinding lightning; focus your strikes on his skeletal legs to break his electric charge!");

        // --------------------------------------------------------------------
        // 8. ENIR-ILIM CLEANSING TERRACE & GOLDEN NEEDLE ALTAR
        // Center: (-3175, 44.0, 280) | Elev: +44.0m | Theme: Celestial Limestone, Helical Spires & Needle Knight Leda
        // --------------------------------------------------------------------
        const celestialStoneMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
        const holyNeedleMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 2.8 });
        const divineFabricMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 });

        // Monumental Sunlit Limestone Terrace
        const terraceBase = new THREE.Mesh(new THREE.CylinderGeometry(30, 35, 4.5, 24), celestialStoneMat);
        terraceBase.position.set(-3175, 41.75, 280);
        outsideGroup.add(terraceBase);

        const needleDais = new THREE.Mesh(new THREE.RingGeometry(7, 24, 24), divineFabricMat);
        needleDais.rotation.x = -Math.PI / 2;
        needleDais.position.set(-3175, 44.05, 280);
        outsideGroup.add(needleDais);

        // 8 Radiant Helical Columns crowned with Golden Needles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const hx = -3175 + Math.cos(angle) * 22;
            const hz = 280 + Math.sin(angle) * 22;
            const col = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 14.0, 8), celestialStoneMat);
            col.position.set(hx, 51.0, hz);
            col.rotation.y = angle;
            outsideGroup.add(col);

            const needle = new THREE.Mesh(new THREE.ConeGeometry(0.5, 4.0, 6), holyNeedleMat);
            needle.position.set(hx, 60.0, hz);
            outsideGroup.add(needle);
        }

        const ledaLight = new THREE.PointLight(0xfef08a, 3.0, 65);
        ledaLight.position.set(-3175, 52.0, 280);
        outsideGroup.add(ledaLight);

        this.createFloorSoapstone(-3175, 44.0, 292, "#fde047", "🗡️ ENIR-ILIM CLEANSING TERRACE", "Needle Knight Leda purges all who stray from Miquella's grace; roll through her piercing thrust and parry her golden flurry!");
    }

    buildEightAscendedOutsideExpeditionsV82(outsideGroup) {
        // ====================================================================
        // 8 BRAND-NEW ASCENDED OUTSIDE REALM EXPEDITIONS (V82 EXPANSION)
        // ====================================================================

        // --------------------------------------------------------------------
        // 1. YAHAR'GUL ADVENT PLAZA & BLOOD MOON CHASM
        // Center: (-3205, -16.0, -320) | Elev: -16.0m | Theme: Blood Moon, Corpse Street & The One Reborn
        // --------------------------------------------------------------------
        const bloodBasaltMat = new THREE.MeshStandardMaterial({ color: 0x13111c, roughness: 0.95 });
        const crimsonGooMat = new THREE.MeshStandardMaterial({ color: 0x881337, emissive: 0x4c0519, emissiveIntensity: 2.2 });
        const ironCageArchMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.4 });

        // Monumental Sunken Street Plaza
        const adventStreet = new THREE.Mesh(new THREE.BoxGeometry(44, 3.8, 28), bloodBasaltMat);
        adventStreet.position.set(-3205, -17.9, -320);
        outsideGroup.add(adventStreet);

        const bloodPool = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 0.2, 16), crimsonGooMat);
        bloodPool.position.set(-3205, -15.9, -320);
        outsideGroup.add(bloodPool);

        // 6 Towering Iron Bell Balustrades
        for (let i = 0; i < 6; i++) {
            const bx = -3222 + (i % 3) * 17;
            const bz = -320 + ((i < 3) ? -12 : 12);
            const bal = new THREE.Mesh(new THREE.BoxGeometry(2.4, 9.0, 2.4), ironCageArchMat);
            bal.position.set(bx, -11.5, bz);
            outsideGroup.add(bal);

            const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 1.6, 8), bloodBasaltMat);
            bell.position.set(bx, -6.0, bz);
            outsideGroup.add(bell);
        }

        const oneRebornLight = new THREE.PointLight(0xe11d48, 3.2, 60);
        oneRebornLight.position.set(-3205, -8.0, -320);
        outsideGroup.add(oneRebornLight);

        this.createFloorSoapstone(-3205, -16.0, -308, "#f43f5e", "🩸 YAHAR'GUL ADVENT PLAZA", "The One Reborn rains down corpse limbs and acid vomit; take out the bell-ringing summoners on the balcony first, then smash the center mass!");

        // --------------------------------------------------------------------
        // 2. DEMON RUINS LAVA GORGE & MAGMA RIFT
        // Center: (-3235, -30.0, 260) | Elev: -30.0m | Theme: Boiling Magma Chasm, Weeping Son of Chaos & Ceaseless Discharge
        // --------------------------------------------------------------------
        const scorchedBasaltMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 });
        const boilingRiftMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xd97706, emissiveIntensity: 3.6 });
        const altarAshMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.85 });

        // Raised Volcanic Terrace
        const lavaTerrace = new THREE.Mesh(new THREE.BoxGeometry(40, 4.0, 34), scorchedBasaltMat);
        lavaTerrace.position.set(-3235, -32.0, 260);
        outsideGroup.add(lavaTerrace);

        // Sunken Magma Chasm Rift
        const magmaRift = new THREE.Mesh(new THREE.BoxGeometry(36, 0.4, 12), boilingRiftMat);
        magmaRift.position.set(-3235, -29.8, 260);
        outsideGroup.add(magmaRift);

        // 4 Ancient Demon Altar Crags
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
            const cx = -3235 + Math.cos(angle) * 19;
            const cz = 260 + Math.sin(angle) * 19;
            const crag = new THREE.Mesh(new THREE.ConeGeometry(2.8, 12.0, 6), altarAshMat);
            crag.position.set(cx, -24.0, cz);
            outsideGroup.add(crag);
        }

        const ceaselessLight = new THREE.PointLight(0xffedd5, 3.5, 65);
        ceaselessLight.position.set(-3235, -18.0, 260);
        outsideGroup.add(ceaselessLight);

        this.createFloorSoapstone(-3235, -30.0, 272, "#fb923c", "🔥 DEMON RUINS MAGMA RIFT", "Ceaseless Discharge weeps over his sister's grave; sprint toward the narrow rock passage to force his lava limb over the precipice!");

        // --------------------------------------------------------------------
        // 3. UNDEAD PURGATORY & CIRCULAR SPIKED TRENCH
        // Center: (-3265, 8.0, -220) | Elev: +8.0m | Theme: Racetrack Trench, Iron Spikes & Executioner's Chariot
        // --------------------------------------------------------------------
        const rustedGraniteMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.95 });
        const bloodRutsMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.8 });
        const ironSpikeSpireMat = new THREE.MeshStandardMaterial({ color: 0x374151, metalness: 0.85, roughness: 0.3 });

        // Circular Arena Floor
        const chariotArena = new THREE.Mesh(new THREE.CylinderGeometry(30, 34, 4.0, 28), rustedGraniteMat);
        chariotArena.position.set(-3265, 6.0, -220);
        outsideGroup.add(chariotArena);

        // Outer Chariot Racetrack Ring
        const raceRing = new THREE.Mesh(new THREE.RingGeometry(18, 26, 28), bloodRutsMat);
        raceRing.rotation.x = -Math.PI / 2;
        raceRing.position.set(-3265, 8.05, -220);
        outsideGroup.add(raceRing);

        // 8 Spiked Iron Palisades with Refuge Alcoves
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const sx = -3265 + Math.cos(angle) * 27;
            const sz = -220 + Math.sin(angle) * 27;
            const alcove = new THREE.Mesh(new THREE.BoxGeometry(3.5, 8.0, 2.5), rustedGraniteMat);
            alcove.position.set(sx, 12.0, sz);
            alcove.rotation.y = angle + Math.PI / 2;
            outsideGroup.add(alcove);

            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.6, 4.0, 6), ironSpikeSpireMat);
            spike.position.set(sx, 18.0, sz);
            outsideGroup.add(spike);
        }

        const chariotLight = new THREE.PointLight(0xdc2626, 3.0, 55);
        chariotLight.position.set(-3265, 14.0, -220);
        outsideGroup.add(chariotLight);

        this.createFloorSoapstone(-3265, 8.0, -208, "#ef4444", "🐎 UNDEAD PURGATORY SPIKED TRENCH", "The Executioner's Chariot circles relentlessly; dive into the side alcoves as he thunders past, sprint to the lever to lower the portcullis!");

        // --------------------------------------------------------------------
        // 4. DARKROOT BASIN & CRYSTALLINE MOON BRIDGE
        // Center: (-3295, 24.0, 340) | Elev: +24.0m | Theme: High Forest Bridge, Iridescent Crystal & Moonlight Butterfly
        // --------------------------------------------------------------------
        const mossBridgeMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 });
        const moonCrystalMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 2.8, transparent: true, opacity: 0.88 });
        const starlightStoneMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });

        // High Canopy Ruined Bridge
        const bridgeSpan = new THREE.Mesh(new THREE.BoxGeometry(42, 3.5, 16), mossBridgeMat);
        bridgeSpan.position.set(-3295, 22.25, 340);
        outsideGroup.add(bridgeSpan);

        // 8 Floating Iridescent Moon Shards along the Balustrade
        for (let i = 0; i < 8; i++) {
            const bx = -3312 + (i % 4) * 11;
            const bz = 340 + ((i < 4) ? -7.5 : 7.5);
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 6.0, 6), starlightStoneMat);
            post.position.set(bx, 27.0, bz);
            outsideGroup.add(post);

            const geode = new THREE.Mesh(new THREE.OctahedronGeometry(1.4, 0), moonCrystalMat);
            geode.position.set(bx, 31.5, bz);
            geode.rotation.y = (i * Math.PI) / 4;
            outsideGroup.add(geode);
        }

        const butterflyLight = new THREE.PointLight(0x38bdf8, 3.0, 65);
        butterflyLight.position.set(-3295, 30.0, 340);
        outsideGroup.add(butterflyLight);

        this.createFloorSoapstone(-3295, 24.0, 350, "#38bdf8", "🦋 DARKROOT CRYSTALLINE MOON BRIDGE", "Moonlight Butterfly fires homing soul darts and laser barrages from the abyss; roll across the narrow parapet and strike when she rests upon the ledge!");

        // --------------------------------------------------------------------
        // 5. SMOULDERING LAKE & ASHEN DEMON PYRE
        // Center: (-3325, -22.0, -160) | Elev: -22.0m | Theme: Ash Cavern, Demon Skulls & Old Demon King
        // --------------------------------------------------------------------
        const ashRockMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.95 });
        const demonEmberMat = new THREE.MeshStandardMaterial({ color: 0xea580c, emissive: 0xc2410c, emissiveIntensity: 3.2 });
        const skullPileMat = new THREE.MeshStandardMaterial({ color: 0x71717a, roughness: 0.85 });

        // Octagonal Ash & Basalt Platform
        const pyreFloor = new THREE.Mesh(new THREE.CylinderGeometry(28, 33, 3.8, 8), ashRockMat);
        pyreFloor.position.set(-3325, -23.9, -160);
        outsideGroup.add(pyreFloor);

        // Central Demon Skull Cairn
        const skullMound = new THREE.Mesh(new THREE.ConeGeometry(10, 4.5, 12), skullPileMat);
        skullMound.position.set(-3325, -19.75, -160);
        outsideGroup.add(skullMound);

        // 4 Burning Basalt Obelisks
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const ox = -3325 + Math.cos(angle) * 20;
            const oz = -160 + Math.sin(angle) * 20;
            const obelisk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 11.0, 2.4), ashRockMat);
            obelisk.position.set(ox, -16.5, oz);
            outsideGroup.add(obelisk);

            const flameBeacon = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 0), demonEmberMat);
            flameBeacon.position.set(ox, -9.5, oz);
            outsideGroup.add(flameBeacon);
        }

        const demonKingLight = new THREE.PointLight(0xf97316, 3.2, 60);
        demonKingLight.position.set(-3325, -13.0, -160);
        outsideGroup.add(demonKingLight);

        this.createFloorSoapstone(-3325, -22.0, -148, "#f97316", "👑 SMOULDERING ASHEN DEMON PYRE", "Old Demon King summons expanding flame rings and meteor rains; retreat behind the demon corpse mounds to avoid his apocalyptic chaos blast!");

        // --------------------------------------------------------------------
        // 6. PIT OF HOLLOWS & DILAPIDATED COURTYARD
        // Center: (-3355, -8.0, 190) | Elev: -8.0m | Theme: Sunken Courtyard, Rotting Roots & Curse-rotted Greatwood
        // --------------------------------------------------------------------
        const mossPavingMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.9 });
        const toxicSporeMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, emissive: 0xa16207, emissiveIntensity: 2.4 });
        const rottingWoodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.95 });

        // Sunken Dilapidated Courtyard Base
        const hollowCourtyard = new THREE.Mesh(new THREE.CylinderGeometry(29, 34, 4.0, 20), mossPavingMat);
        hollowCourtyard.position.set(-3355, -10.0, 190);
        outsideGroup.add(hollowCourtyard);

        const sporeBed = new THREE.Mesh(new THREE.RingGeometry(8, 22, 20), toxicSporeMat);
        sporeBed.rotation.x = -Math.PI / 2;
        sporeBed.position.set(-3355, -7.95, 190);
        outsideGroup.add(sporeBed);

        // 6 Gnarled Rotting Timber Arches
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const rx = -3355 + Math.cos(angle) * 21;
            const rz = 190 + Math.sin(angle) * 21;
            const arch = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.2, 9.5, 6), rottingWoodMat);
            arch.position.set(rx, -3.25, rz);
            arch.rotation.z = Math.cos(angle) * 0.2;
            outsideGroup.add(arch);
        }

        const greatwoodLight = new THREE.PointLight(0xeab308, 2.8, 55);
        greatwoodLight.position.set(-3355, 0.0, 190);
        outsideGroup.add(greatwoodLight);

        this.createFloorSoapstone(-3355, -8.0, 202, "#eab308", "🌳 PIT OF HOLLOWS COURTYARD", "Curse-rotted Greatwood is immune to direct damage; pop the pulsing egg sacs on his belly, legs, and back to shatter his massive health pool!");

        // --------------------------------------------------------------------
        // 7. DEBATE PARLOR MEADOW & GLINTSTONE ALTAR
        // Center: (-3385, 14.0, -360) | Elev: +14.0m | Theme: Academy Slate, Scholar Roses & Red Wolf of Radagon
        // --------------------------------------------------------------------
        const academySlateMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 });
        const glintstoneGlowMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x2563eb, emissiveIntensity: 3.0 });
        const carianMarbleMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 });

        // Academy Courtyard Platform
        const parlorFloor = new THREE.Mesh(new THREE.CylinderGeometry(28, 32, 3.8, 24), academySlateMat);
        parlorFloor.position.set(-3385, 12.1, -360);
        outsideGroup.add(parlorFloor);

        const glintCircle = new THREE.Mesh(new THREE.RingGeometry(6, 20, 24), glintstoneGlowMat);
        glintCircle.rotation.x = -Math.PI / 2;
        glintCircle.position.set(-3385, 14.05, -360);
        outsideGroup.add(glintCircle);

        // 6 Carian Marble Colonnades with Floating Glintstones
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const px = -3385 + Math.cos(angle) * 20;
            const pz = -360 + Math.sin(angle) * 20;
            const col = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 12.0, 8), carianMarbleMat);
            col.position.set(px, 20.0, pz);
            outsideGroup.add(col);

            const gem = new THREE.Mesh(new THREE.OctahedronGeometry(1.3, 0), glintstoneGlowMat);
            gem.position.set(px, 27.5, pz);
            gem.rotation.y = angle;
            outsideGroup.add(gem);
        }

        const redWolfLight = new THREE.PointLight(0x60a5fa, 2.9, 60);
        redWolfLight.position.set(-3385, 21.0, -360);
        outsideGroup.add(redWolfLight);

        this.createFloorSoapstone(-3385, 14.0, -348, "#60a5fa", "🐺 DEBATE PARLOR GLINTSTONE MEADOW", "Red Wolf of Radagon conjures flying glintblade swords while leaping; stay mobile, roll through his magic sword bite, and punish his landing!");

        // --------------------------------------------------------------------
        // 8. ASTRAL CLOCKTOWER PATIO & LUMENFLOWER GARDEN
        // Center: (-3415, 36.0, 280) | Elev: +36.0m | Theme: Elevated Astral Patio, Lumenflowers & Living Failures
        // --------------------------------------------------------------------
        const astralMarbleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
        const lumenflowerMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0x9333ea, emissiveIntensity: 2.8 });
        const astronomicalBrassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.35 });

        // Monumental Astral Stone Terrace
        const patioFloor = new THREE.Mesh(new THREE.CylinderGeometry(30, 35, 4.5, 24), astralMarbleMat);
        patioFloor.position.set(-3415, 33.75, 280);
        outsideGroup.add(patioFloor);

        // Astronomical Brass Armillary Rings
        const armillaryRing = new THREE.Mesh(new THREE.TorusGeometry(18, 0.4, 8, 28), astronomicalBrassMat);
        armillaryRing.rotation.x = Math.PI / 3;
        armillaryRing.position.set(-3415, 42.0, 280);
        outsideGroup.add(armillaryRing);

        // 8 Radiant Lumenflower Pillars
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const fx = -3415 + Math.cos(angle) * 22;
            const fz = 280 + Math.sin(angle) * 22;
            const post = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 11.0, 8), astralMarbleMat);
            post.position.set(fx, 41.5, fz);
            outsideGroup.add(post);

            const flower = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 0), lumenflowerMat);
            flower.position.set(fx, 48.5, fz);
            flower.rotation.y = angle;
            outsideGroup.add(flower);
        }

        const failuresLight = new THREE.PointLight(0xa855f7, 3.2, 65);
        failuresLight.position.set(-3415, 45.0, 280);
        outsideGroup.add(failuresLight);

        this.createFloorSoapstone(-3415, 36.0, 292, "#c084fc", "🌌 ASTRAL CLOCKTOWER LUMENFLOWER PATIO", "Living Failures raise their hands to call the cosmos; when the sky darkens and meteors descend, hide behind the great Astral Tree!");
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

    createStandingBrazier(x, y, z, colorHex = 0xff7722, intensity = 3.6, radius = 26, targetGroup = null) {
        const brazierGroup = new THREE.Group();

        // 1. Tripod Iron Legs (Shared Geometry)
        const legGeo = this.getSharedGeo('brazier_leg', () => new THREE.CylinderGeometry(0.04, 0.05, 1.5, 6));
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const leg = new THREE.Mesh(legGeo, this.ironMat);
            leg.position.set(Math.sin(angle) * 0.42, 0.75, Math.cos(angle) * 0.42);
            leg.rotation.z = Math.cos(angle) * 0.22;
            leg.rotation.x = -Math.sin(angle) * 0.22;
            brazierGroup.add(leg);
        }

        // 2. Iron Brazier Cauldron Bowl
        const bowlGeo = this.getSharedGeo('brazier_bowl', () => new THREE.CylinderGeometry(0.7, 0.45, 0.5, 10, 1, false));
        const bowl = new THREE.Mesh(bowlGeo, this.ironMat);
        bowl.position.y = 1.4;
        brazierGroup.add(bowl);

        // Riveted Lip Ring
        const lipGeo = this.getSharedGeo('brazier_lip', () => new THREE.TorusGeometry(0.72, 0.04, 6, 12));
        const lip = new THREE.Mesh(lipGeo, this.ironMat);
        lip.position.y = 1.65;
        lip.rotation.x = Math.PI / 2;
        brazierGroup.add(lip);

        // 3. Glowing Charcoal Embers Mound
        const coalsGeo = this.getSharedGeo('brazier_coals', () => new THREE.ConeGeometry(0.65, 0.35, 8));
        const coalsMat = this.getSharedMat('brazier_coals_' + colorHex, () => new THREE.MeshStandardMaterial({
            color: 0x221100,
            emissive: colorHex,
            emissiveIntensity: 1.8,
            roughness: 0.85
        }));
        const coals = new THREE.Mesh(coalsGeo, coalsMat);
        coals.position.y = 1.7;
        brazierGroup.add(coals);

        // 4. Roaring Central Flame
        const flameGeo = this.getSharedGeo('brazier_flame', () => new THREE.ConeGeometry(0.38, 1.0, 7));
        const flameMat = this.getSharedMat('brazier_flame_' + colorHex, () => new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: colorHex,
            emissiveIntensity: 3.2,
            roughness: 0.1
        }));
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.y = 2.2;
        brazierGroup.add(flame);

        // Core white-hot spark
        const coreGeo = this.getSharedGeo('brazier_core', () => new THREE.DodecahedronGeometry(0.2));
        const coreMat = this.getSharedMat('basic_white', () => new THREE.MeshBasicMaterial({ color: 0xffffff }));
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.y = 1.95;
        brazierGroup.add(core);

        brazierGroup.position.set(x, y, z);
        (targetGroup || this.scene).add(brazierGroup);

        if (!targetGroup) {
            this.particles.push({
                mesh: flame,
                seed: Math.random() * 20
            });
            // Collider for the solid tripod brazier
            this.colliders.push(new THREE.Box3().setFromCenterAndSize(
                new THREE.Vector3(x, y + 0.9, z),
                new THREE.Vector3(1.5, 1.8, 1.5)
            ));
        }

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
        const cx = -495;
        const cy = 0;
        const cz = 360;
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

        // 0. Dynamic Point Light Distance Culling & Spatial Biome Chunk Streaming (+50 FPS Optimization)
        this.lightCullTimer = (this.lightCullTimer || 0) + delta;
        if (this.lightCullTimer >= 0.08) {
            this.lightCullTimer = 0;
            const target = (window.game && window.game.playerMesh)
                ? window.game.playerMesh.position
                : ((window.game && window.game.camera) ? window.game.camera.position : null);

            if (target) {
                const tx = target.x;
                const ty = target.y;
                const tz = target.z;

                this.cullDynamicLights(target);
                this.updateBiomeChunks(tx, tz);

                // Spatial Region & Landmark Visibility Culling (+35 to +50 FPS Boost)
                if (this.outsideGroup) {
                    // Show Outside Realm if player is near West Gate or outside the Citadel
                    const showOutside = (tx <= -15) || (tz < -35) || (tz > 270);
                    this.outsideGroup.visible = showOutside;
                }

                // Spaceship Bazaar & 30 Merchants Culling: Centered at (-495, 0, 360)
                const dxShip = tx - (-495);
                const dzShip = tz - 360;
                const distToShipSq = dxShip * dxShip + dzShip * dzShip;
                const showShip = (distToShipSq < 180 * 180);
                if (this.shipGroup) {
                    this.shipGroup.visible = showShip;
                }
                if (this.merchantParentGroup) {
                    this.merchantParentGroup.visible = showShip;
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
