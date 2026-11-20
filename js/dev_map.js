// ============================================================================
// DARK SOULS: COMPREHENSIVE GOD-MODE DEV MAP & CARTOGRAPHY RADAR
// Visualizes all 190 Locations, Bosses, 200 NPCs, Bonfires, Lore, Architecture & Live Player Tracker
// Features: Click-to-Teleport, Pan & Zoom, Search Filter, Elevation Layering
// ============================================================================

(function() {
    'use strict';

    class DarkSoulsDevMap {
        constructor(game) {
            this.game = game;
            this.canvas = null;
            this.ctx = null;
            this.isOpen = false;
            
            // Map view transformation
            this.scale = 2.8; // pixels per meter
            this.offsetX = 0;
            this.offsetZ = 0;
            this.isDragging = false;
            this.dragStartX = 0;
            this.dragStartZ = 0;
            
            // Active filters
            this.layers = {
                locations: true,
                bosses: true,
                npcs: true,
                bonfires: true,
                lore: true,
                architecture: true,
                grid: true
            };
            this.elevationFilter = 'ALL'; // 'ALL', 'SURFACE', 'RAMPARTS', 'DEPTHS'
            this.searchQuery = '';
            this.hoveredItem = null;
            this.cursorWorldPos = { x: 0, z: 0 };
            
            // World boundaries for auto-framing
            // X: [-40, 40], Z: [-40, 180]
            this.worldCenter = { x: 0, z: 65 };
            
            this.initDOM();
            this.bindEvents();
        }

        initDOM() {
            this.canvas = document.getElementById('dev-map-canvas');
            if (this.canvas) {
                this.ctx = this.canvas.getContext('2d');
            }
        }

        bindEvents() {
            // Hotkey [M] to toggle Dev Map
            window.addEventListener('keydown', (e) => {
                if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
                if (e.code === 'KeyM' || e.key === 'm' || e.key === 'M' || e.key === 'ь' || e.key === 'Ь') {
                    this.toggle();
                }
            });

            if (!this.canvas) return;

            // Pan with mouse drag
            this.canvas.addEventListener('mousedown', (e) => {
                this.isDragging = true;
                this.dragStartX = e.clientX;
                this.dragStartZ = e.clientY;
            });

            window.addEventListener('mouseup', () => {
                this.isDragging = false;
            });

            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                if (this.isDragging) {
                    const dx = e.clientX - this.dragStartX;
                    const dy = e.clientY - this.dragStartZ;
                    this.offsetX += dx;
                    this.offsetZ += dy;
                    this.dragStartX = e.clientX;
                    this.dragStartZ = e.clientY;
                    this.render();
                    return;
                }

                // Update world coordinates under cursor
                this.cursorWorldPos = this.screenToWorld(mouseX, mouseY);
                this.updateHoveredItem(mouseX, mouseY);
                this.updateCoordinateHUD();
                this.render();
            });

            // Zoom with mouse wheel
            this.canvas.addEventListener('wheel', (e) => {
                e.preventDefault();
                const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
                this.zoom(zoomFactor, e.clientX, e.clientY);
            }, { passive: false });

            // Click to teleport or select
            this.canvas.addEventListener('click', (e) => {
                if (Math.abs(e.clientX - this.dragStartX) > 6 || Math.abs(e.clientY - this.dragStartZ) > 6) return;
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                const clickedItem = this.getItemAt(mouseX, mouseY);
                if (clickedItem) {
                    this.teleportToItem(clickedItem);
                } else {
                    const wPos = this.screenToWorld(mouseX, mouseY);
                    this.teleportToWorldCoords(wPos.x, wPos.z);
                }
            });

            // Touch support for tablets & mobile
            let touchStartX = 0, touchStartY = 0;
            this.canvas.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    this.isDragging = true;
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                    this.dragStartX = touchStartX;
                    this.dragStartZ = touchStartY;
                }
            }, { passive: true });

            this.canvas.addEventListener('touchmove', (e) => {
                if (e.touches.length === 1 && this.isDragging) {
                    const dx = e.touches[0].clientX - touchStartX;
                    const dy = e.touches[0].clientY - touchStartY;
                    this.offsetX += dx;
                    this.offsetZ += dy;
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                    this.render();
                }
            }, { passive: true });

            this.canvas.addEventListener('touchend', (e) => {
                this.isDragging = false;
            });
        }

        zoom(factor, clientX, clientY) {
            const oldScale = this.scale;
            this.scale = Math.max(0.8, Math.min(8.0, this.scale * factor));
            
            if (this.canvas && clientX !== undefined && clientY !== undefined) {
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = clientX - rect.left;
                const mouseY = clientY - rect.top;
                
                // Keep mouse point steady while zooming
                const worldX = (mouseX - (this.canvas.width / 2 + this.offsetX)) / oldScale;
                const worldZ = (mouseY - (this.canvas.height / 2 + this.offsetZ)) / oldScale;
                
                this.offsetX = mouseX - this.canvas.width / 2 - worldX * this.scale;
                this.offsetZ = mouseY - this.canvas.height / 2 - worldZ * this.scale;
            }
            this.render();
        }

        worldToScreen(x, z) {
            const cx = this.canvas.width / 2 + this.offsetX;
            const cz = this.canvas.height / 2 + this.offsetZ;
            return {
                x: cx + (x - this.worldCenter.x) * this.scale,
                y: cz + (z - this.worldCenter.z) * this.scale
            };
        }

        screenToWorld(sx, sy) {
            const cx = this.canvas.width / 2 + this.offsetX;
            const cz = this.canvas.height / 2 + this.offsetZ;
            return {
                x: (sx - cx) / this.scale + this.worldCenter.x,
                z: (sy - cz) / this.scale + this.worldCenter.z
            };
        }

        open() {
            const modal = document.getElementById('dev-map-modal');
            if (!modal) return;
            modal.style.display = 'flex';
            this.isOpen = true;

            if (!this.canvas) this.initDOM();
            this.resizeCanvas();
            this.centerOnPlayer();
            this.render();

            if (this.game && this.game.audio && this.game.audio.playBellToll) {
                this.game.audio.playBellToll();
            }
        }

        close() {
            const modal = document.getElementById('dev-map-modal');
            if (modal) modal.style.display = 'none';
            this.isOpen = false;
        }

        toggle() {
            if (this.isOpen) this.close();
            else this.open();
        }

        centerOnPlayer() {
            if (this.game && this.game.playerMesh) {
                const p = this.game.playerMesh.position;
                this.offsetX = -(p.x - this.worldCenter.x) * this.scale;
                this.offsetZ = -(p.z - this.worldCenter.z) * this.scale;
            } else {
                this.offsetX = 0;
                this.offsetZ = 0;
            }
            this.render();
        }

        resetView() {
            this.scale = 2.8;
            this.offsetX = 0;
            this.offsetZ = 0;
            this.render();
        }

        resizeCanvas() {
            if (!this.canvas) return;
            const container = document.getElementById('dev-map-canvas-container');
            if (container) {
                this.canvas.width = container.clientWidth || 800;
                this.canvas.height = container.clientHeight || 560;
            } else {
                this.canvas.width = 800;
                this.canvas.height = 560;
            }
        }

        updateHoveredItem(mouseX, mouseY) {
            this.hoveredItem = this.getItemAt(mouseX, mouseY);
            const tooltip = document.getElementById('dev-map-tooltip');
            if (!tooltip) return;

            if (this.hoveredItem) {
                tooltip.style.display = 'block';
                tooltip.style.left = `${mouseX + 16}px`;
                tooltip.style.top = `${mouseY + 16}px`;
                tooltip.innerHTML = `
                    <div style="font-weight: 800; color: #ffd700; font-size: 0.85rem; letter-spacing: 1px;">
                        ${this.hoveredItem.icon || '📍'} ${this.hoveredItem.name.toUpperCase()}
                    </div>
                    <div style="font-size: 0.72rem; color: #a5d6a7; margin-top: 2px;">
                        🏷️ ${this.hoveredItem.type.toUpperCase()} &bull; ELEV: ${this.hoveredItem.elev || '0m'}
                    </div>
                    <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 2px;">
                        🌐 COORDS: [${this.hoveredItem.x.toFixed(1)}, ${this.hoveredItem.y.toFixed(1)}, ${this.hoveredItem.z.toFixed(1)}]
                    </div>
                    ${this.hoveredItem.desc ? `<div style="font-size: 0.72rem; color: #cbd5e1; margin-top: 4px; font-style: italic;">${this.hoveredItem.desc}</div>` : ''}
                    <div style="font-size: 0.68rem; color: #00ffaa; margin-top: 6px; font-weight: 800;">
                        ⚡ CLICK TO INSTANT TELEPORT
                    </div>
                `;
            } else {
                tooltip.style.display = 'none';
            }
        }

        updateCoordinateHUD() {
            const hud = document.getElementById('dev-map-coords-hud');
            if (!hud) return;

            const pPos = this.game && this.game.playerMesh ? this.game.playerMesh.position : { x: 0, y: 0, z: 0 };
            const groundY = this.game && this.game.world ? this.game.world.getGroundHeight(this.cursorWorldPos.x, this.cursorWorldPos.z) : 0;

            hud.innerHTML = `
                <span>🧍 <b>PLAYER:</b> [X: ${pPos.x.toFixed(1)}m, Y: ${pPos.y.toFixed(1)}m, Z: ${pPos.z.toFixed(1)}m]</span>
                <span style="margin: 0 10px; color: #7c6848;">&bull;</span>
                <span>🎯 <b>CURSOR:</b> [X: ${this.cursorWorldPos.x.toFixed(1)}m, Z: ${this.cursorWorldPos.z.toFixed(1)}m &bull; Ground: ${groundY.toFixed(1)}m]</span>
                <span style="margin: 0 10px; color: #7c6848;">&bull;</span>
                <span style="color: #00e5ff;">🔍 <b>ZOOM:</b> ${(this.scale / 2.8).toFixed(1)}x</span>
            `;
        }

        getAllWorldItems() {
            const items = [];

            // 1. Locations (190)
            if (this.layers.locations && window.DARK_SOULS_LOCATIONS) {
                window.DARK_SOULS_LOCATIONS.forEach(loc => {
                    const elevNum = loc.pos[1];
                    let elevType = 'SURFACE';
                    if (elevNum > 2.0) elevType = 'RAMPARTS';
                    else if (elevNum < -1.5) elevType = 'DEPTHS';

                    if (this.elevationFilter !== 'ALL' && this.elevationFilter !== elevType) return;
                    if (this.searchQuery && !loc.name.toLowerCase().includes(this.searchQuery) && !loc.zone.toLowerCase().includes(this.searchQuery)) return;

                    items.push({
                        type: 'location',
                        id: loc.id,
                        name: loc.name,
                        zone: loc.zone,
                        x: loc.pos[0],
                        y: loc.pos[1],
                        z: loc.pos[2],
                        elev: loc.elev,
                        danger: loc.danger,
                        desc: loc.desc,
                        icon: '📍',
                        color: elevType === 'DEPTHS' ? '#00ffaa' : (elevType === 'RAMPARTS' ? '#ffd700' : '#ff7722')
                    });
                });
            }

            // 2. Bosses
            if (this.layers.bosses && this.game && this.game.combat && this.game.combat.bossRoster) {
                const roster = this.game.combat.bossRoster;
                const activeBoss = this.game.combat.boss;

                roster.forEach(b => {
                    if (this.searchQuery && !b.name.toLowerCase().includes(this.searchQuery)) return;
                    // Position bosses based on their arena
                    let bx = 0, by = 0, bz = 138;
                    if (b.id === 'nito') { bx = -20; by = -5.0; bz = 115; }
                    else if (b.id === 'taurus') { bx = 0; by = 0; bz = 52; }
                    else if (b.id === 'gargoyles') { bx = 24; by = 6.0; bz = 35; }
                    else if (b.id === 'capra') { bx = -14; by = 0; bz = 18; }
                    else if (b.id === 'gwyn') { bx = 0; by = 0; bz = 158; }

                    items.push({
                        type: 'boss',
                        id: b.id,
                        name: b.name,
                        x: bx,
                        y: by,
                        z: bz,
                        elev: `${by}m`,
                        desc: `HP: ${b.hp || 3000} &bull; Souls: ${b.souls || 10000} &bull; ${b.title || 'Lord of Cinder'}`,
                        icon: '👑',
                        color: '#ff3344',
                        isCurrent: activeBoss && activeBoss.id === b.id
                    });
                });
            }

            // 3. NPCs (In-World & Spawns)
            if (this.layers.npcs) {
                // Permanent Courtyard NPCs
                const courtyardNPCs = [
                    { id: 'npc_1_solaire', name: 'Solaire of Astora', x: -5.5, y: 0, z: 7.5, quote: 'Praise the Sun!', icon: '☀️' },
                    { id: 'npc_2_siegmeyer', name: 'Siegmeyer of Catarina', x: 7.5, y: 0, z: 3.5, quote: 'Hmm... Mmm...', icon: '🧅' },
                    { id: 'npc_164_fire_keeper_ds3', name: 'Fire Keeper of Firelink', x: -2.4, y: 0, z: -1.8, quote: 'Welcome home, Ashen One.', icon: '🔥' },
                    { id: 'npc_101_ranni_witch', name: 'Ranni the Witch', x: 4.8, y: 0, z: -8.0, quote: 'I stole death long ago.', icon: '🌙' },
                    { id: 'merchant_undead', name: 'Undead Merchant (Male)', x: -8.5, y: 0, z: 3.5, quote: 'Y-you there! Care to purchase?', icon: '🛒' }
                ];

                courtyardNPCs.forEach(npc => {
                    if (this.searchQuery && !npc.name.toLowerCase().includes(this.searchQuery)) return;
                    items.push({
                        type: 'npc',
                        id: npc.id,
                        name: npc.name,
                        x: npc.x,
                        y: npc.y,
                        z: npc.z,
                        elev: `${npc.y}m`,
                        desc: `"${npc.quote}"`,
                        icon: npc.icon,
                        color: '#00e5ff'
                    });
                });

                // Spawned Compendium Phantoms/Entities
                if (window.compendiumInstance && window.compendiumInstance.spawnedEntities) {
                    window.compendiumInstance.spawnedEntities.forEach(ent => {
                        if (ent && ent.parent && ent.userData.entry) {
                            const e = ent.userData.entry;
                            if (this.searchQuery && !e.name.toLowerCase().includes(this.searchQuery)) return;
                            items.push({
                                type: 'companion',
                                id: e.id,
                                name: e.name,
                                x: ent.position.x,
                                y: ent.position.y,
                                z: ent.position.z,
                                elev: `${ent.position.y.toFixed(1)}m`,
                                desc: `Active Summon Ally &bull; "${e.quote || ''}"`,
                                icon: '🧙',
                                color: '#ffd700'
                            });
                        }
                    });
                }
            }

            // 4. Bonfires & Waystones
            if (this.layers.bonfires) {
                const bonfires = [
                    { id: 'bonfire_firelink', name: 'Firelink Shrine Central Bonfire', x: 0, y: 0, z: 0, icon: '🜂' },
                    { id: 'bonfire_serpent', name: 'Emerald Serpent Courtyard Bonfire', x: 0, y: -4.0, z: -82, icon: '🜂' },
                    { id: 'bonfire_victory', name: 'Arena Victory Bonfire of Lords', x: 0, y: 0, z: 138, icon: '🜂' },
                    { id: 'waystone_golden', name: 'Golden Realm Waystone Portal', x: 0, y: 0, z: 154, icon: '⛩️' },
                    { id: 'fog_gate_main', name: 'White Fog Gate (Upper Arena Entrance)', x: 0, y: 1.0, z: 93, icon: '🌫️' },
                    { id: 'fog_gate_catacombs', name: 'Abyssal Fog Gate (Nito Crypt Entrance)', x: -20, y: -5.0, z: 94.5, icon: '🌫️' }
                ];

                bonfires.forEach(b => {
                    if (this.searchQuery && !b.name.toLowerCase().includes(this.searchQuery)) return;
                    items.push({
                        type: 'bonfire',
                        id: b.id,
                        name: b.name,
                        x: b.x,
                        y: b.y,
                        z: b.z,
                        elev: `${b.y}m`,
                        desc: 'Sacred checkpoint & warp point',
                        icon: b.icon,
                        color: '#ff5500'
                    });
                });
            }

            // 5. Lore Relics & Loot Drops
            if (this.layers.lore && this.game && this.game.loreBeacons) {
                this.game.loreBeacons.forEach(b => {
                    if (this.searchQuery && !b.loreTitle.toLowerCase().includes(this.searchQuery)) return;
                    items.push({
                        type: 'lore',
                        id: b.loreId,
                        name: b.loreTitle,
                        x: b.pos.x,
                        y: b.pos.y,
                        z: b.pos.z,
                        elev: `${b.pos.y.toFixed(1)}m`,
                        desc: 'Ancient Lordran Lore Relic',
                        icon: '💎',
                        color: '#e0c068'
                    });
                });
            }

            return items;
        }

        getItemAt(mouseX, mouseY) {
            const items = this.getAllWorldItems();
            let closest = null;
            let minDist = 14; // pixel radius

            for (const item of items) {
                const s = this.worldToScreen(item.x, item.z);
                const d = Math.hypot(mouseX - s.x, mouseY - s.y);
                if (d < minDist) {
                    closest = item;
                    minDist = d;
                }
            }
            return closest;
        }

        teleportToItem(item) {
            if (!this.game || !this.game.playerMesh) return;
            const targetY = typeof item.y === 'number' ? item.y : 0;
            this.game.playerMesh.position.set(item.x, targetY, item.z);

            const groundY = this.game.world ? this.game.world.getGroundHeight(item.x, item.z, targetY) : targetY;
            if (groundY > -20.0) {
                this.game.playerMesh.position.y = groundY;
            } else {
                this.game.playerMesh.position.y = targetY;
            }

            if (this.game.showNotification) {
                this.game.showNotification(`⚡ DEV MAP: WARPED TO ${item.name.toUpperCase()} [${item.x.toFixed(1)}, ${item.z.toFixed(1)}]`);
            }
            if (this.game.audio && this.game.audio.playRoll) {
                this.game.audio.playRoll();
            }
            this.render();
        }

        teleportToWorldCoords(x, z) {
            if (!this.game || !this.game.playerMesh) return;
            const groundY = this.game.world ? this.game.world.getGroundHeight(x, z) : 0;
            if (groundY < -25.0) {
                if (this.game.showNotification) {
                    this.game.showNotification(`⚠️ VOID CHASM: CANNOT TELEPORT OUTSIDE ARCHITECTURE BOUNDS!`);
                }
                return;
            }

            this.game.playerMesh.position.set(x, groundY, z);
            if (this.game.showNotification) {
                this.game.showNotification(`⚡ DEV MAP: TELEPORTED TO [X: ${x.toFixed(1)}, Z: ${z.toFixed(1)}] &bull; Y: ${groundY.toFixed(1)}m`);
            }
            if (this.game.audio && this.game.audio.playRoll) {
                this.game.audio.playRoll();
            }
            this.render();
        }

        render() {
            if (!this.canvas || !this.ctx || !this.isOpen) return;
            const ctx = this.ctx;
            const w = this.canvas.width;
            const h = this.canvas.height;

            // Clear Background (Deep obsidian abyss)
            ctx.fillStyle = '#080a0e';
            ctx.fillRect(0, 0, w, h);

            // 1. Draw Grid Lines (10m and 50m intervals)
            if (this.layers.grid) {
                ctx.lineWidth = 1;
                const minWorld = this.screenToWorld(0, 0);
                const maxWorld = this.screenToWorld(w, h);

                const startX = Math.floor(minWorld.x / 10) * 10;
                const endX = Math.ceil(maxWorld.x / 10) * 10;
                const startZ = Math.floor(minWorld.z / 10) * 10;
                const endZ = Math.ceil(maxWorld.z / 10) * 10;

                for (let x = startX; x <= endX; x += 10) {
                    const isMajor = x % 50 === 0;
                    ctx.strokeStyle = isMajor ? 'rgba(0, 229, 255, 0.22)' : 'rgba(255, 255, 255, 0.05)';
                    const s = this.worldToScreen(x, 0);
                    ctx.beginPath();
                    ctx.moveTo(s.x, 0);
                    ctx.lineTo(s.x, h);
                    ctx.stroke();

                    if (isMajor) {
                        ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
                        ctx.font = '10px monospace';
                        ctx.fillText(`X:${x}m`, s.x + 3, 12);
                    }
                }

                for (let z = startZ; z <= endZ; z += 10) {
                    const isMajor = z % 50 === 0;
                    ctx.strokeStyle = isMajor ? 'rgba(0, 229, 255, 0.22)' : 'rgba(255, 255, 255, 0.05)';
                    const s = this.worldToScreen(0, z);
                    ctx.beginPath();
                    ctx.moveTo(0, s.y);
                    ctx.lineTo(w, s.y);
                    ctx.stroke();

                    if (isMajor) {
                        ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
                        ctx.font = '10px monospace';
                        ctx.fillText(`Z:${z}m`, 4, s.y - 3);
                    }
                }
            }

            // 2. Draw Architecture Footprint & Walkable Slabs
            if (this.layers.architecture) {
                // Courtyard (Surface 0m)
                this.drawZoneRect(ctx, -30, -30, 60, 34, 'rgba(40, 30, 20, 0.65)', '#7c6848', 'COURTYARD & BONFIRE (0m)');

                // Ramparts & Watchtower (+6m)
                this.drawZoneRect(ctx, 18, -20, 14, 70, 'rgba(60, 50, 15, 0.55)', '#ffd700', 'WATCHTOWER RAMPARTS (+6m)');

                // Royal Bridge (0m)
                this.drawZoneRect(ctx, -12, 4, 24, 91, 'rgba(30, 35, 45, 0.65)', '#4fc3f7', 'ROYAL HIGHWAY BRIDGE (0m)');

                // Upper Arena (0m)
                this.drawZoneRect(ctx, -30, 95, 60, 80, 'rgba(50, 20, 25, 0.65)', '#ff4444', 'UPPER CITADEL ARENA OF LORDS (0m)');

                // Catacombs & Nito Tomb (-5m)
                this.drawZoneRect(ctx, -34, 40, 26, 120, 'rgba(10, 45, 30, 0.65)', '#00ffaa', 'CATACOMBS CRYPT (-5m)');

                // Sunken Serpent Courtyard (-4m)
                this.drawZoneRect(ctx, -25, -95, 50, 35, 'rgba(15, 30, 40, 0.65)', '#00e5ff', 'SERPENT SANCTUARY (-4m)');
            }

            // 3. Draw All World Pins
            const items = this.getAllWorldItems();
            items.forEach(item => {
                const s = this.worldToScreen(item.x, item.z);
                if (s.x < -30 || s.x > w + 30 || s.y < -30 || s.y > h + 30) return;

                const isHovered = this.hoveredItem && this.hoveredItem.id === item.id;
                const pinRadius = isHovered ? 8 : (item.type === 'boss' ? 7 : 5);

                // Glow ring on hover or current
                if (isHovered || item.isCurrent) {
                    ctx.save();
                    ctx.strokeStyle = item.color;
                    ctx.lineWidth = 2.5;
                    ctx.shadowColor = item.color;
                    ctx.shadowBlur = 14;
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, pinRadius + 4, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }

                // Core Pin
                ctx.fillStyle = item.color;
                ctx.beginPath();
                ctx.arc(s.x, s.y, pinRadius, 0, Math.PI * 2);
                ctx.fill();

                // Border
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Small icon or text if zoomed in
                if (this.scale > 2.2 || isHovered || item.type === 'boss' || item.type === 'bonfire') {
                    ctx.font = '11px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(item.icon, s.x, s.y - 12);
                }

                if (isHovered || (this.scale > 3.4 && (item.type === 'boss' || item.type === 'bonfire'))) {
                    ctx.fillStyle = '#fff3a8';
                    ctx.font = 'bold 9px "Cinzel", serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(item.name.slice(0, 22), s.x, s.y + 14);
                }
            });

            // 4. Draw Live Player Marker
            if (this.game && this.game.playerMesh) {
                const p = this.game.playerMesh.position;
                const rotY = this.game.playerMesh.rotation.y;
                const s = this.worldToScreen(p.x, p.z);

                // View heading cone (FOV 60 deg)
                ctx.save();
                ctx.translate(s.x, s.y);
                ctx.rotate(-rotY);

                const grad = ctx.createRadialGradient(0, 0, 4, 0, 28, 32);
                grad.addColorStop(0, 'rgba(0, 229, 255, 0.45)');
                grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
                ctx.fillStyle = grad;

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, 32, Math.PI / 2 - 0.5, Math.PI / 2 + 0.5);
                ctx.closePath();
                ctx.fill();

                // Player Triangle Pointer
                ctx.fillStyle = '#00e5ff';
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.shadowColor = '#00e5ff';
                ctx.shadowBlur = 10;

                ctx.beginPath();
                ctx.moveTo(0, 10);
                ctx.lineTo(-6, -6);
                ctx.lineTo(0, -3);
                ctx.lineTo(6, -6);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.restore();

                // Pulsing Player Halo
                const pulse = Math.sin(Date.now() * 0.006) * 3;
                ctx.strokeStyle = 'rgba(0, 229, 255, 0.8)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(s.x, s.y, 10 + pulse, 0, Math.PI * 2);
                ctx.stroke();

                // Label
                ctx.fillStyle = '#00e5ff';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(`YOU [${p.x.toFixed(1)}, ${p.z.toFixed(1)}]`, s.x, s.y + 18);
            }
        }

        drawZoneRect(ctx, wx, wz, ww, wh, fill, stroke, label) {
            const p1 = this.worldToScreen(wx, wz);
            const p2 = this.worldToScreen(wx + ww, wz + wh);
            const w = p2.x - p1.x;
            const h = p2.y - p1.y;

            ctx.fillStyle = fill;
            ctx.fillRect(p1.x, p1.y, w, h);

            ctx.strokeStyle = stroke;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(p1.x, p1.y, w, h);

            if (this.scale > 1.2) {
                ctx.fillStyle = stroke;
                ctx.font = 'bold 10px "Cinzel", serif';
                ctx.textAlign = 'left';
                ctx.fillText(label, p1.x + 8, p1.y + 16);
            }
        }
    }

    // Global UI helpers
    window.DarkSoulsDevMap = DarkSoulsDevMap;

    window.openDevMapModal = function() {
        if (!window.devMapInstance && window.game) {
            window.devMapInstance = new DarkSoulsDevMap(window.game);
        }
        if (window.devMapInstance) {
            window.devMapInstance.open();
        }
    };

    window.closeDevMapModal = function() {
        if (window.devMapInstance) {
            window.devMapInstance.close();
        }
    };

    window.toggleDevMapModal = function() {
        if (window.devMapInstance && window.devMapInstance.isOpen) {
            window.closeDevMapModal();
        } else {
            window.openDevMapModal();
        }
    };

    window.setDevMapLayer = function(layer, checkbox) {
        if (!window.devMapInstance) return;
        window.devMapInstance.layers[layer] = checkbox.checked;
        window.devMapInstance.render();
    };

    window.filterDevMapElevation = function(elev) {
        if (!window.devMapInstance) return;
        window.devMapInstance.elevationFilter = elev;
        document.querySelectorAll('.dev-map-elev-btn').forEach(btn => {
            const match = btn.getAttribute('data-elev') === elev;
            btn.classList.toggle('active', match);
            btn.style.boxShadow = match ? '0 0 10px rgba(0,229,255,0.6)' : 'none';
        });
        window.devMapInstance.render();
    };

    window.onDevMapSearchInput = function(query) {
        if (!window.devMapInstance) return;
        window.devMapInstance.searchQuery = (query || '').toLowerCase().trim();
        window.devMapInstance.render();
    };

    window.devMapZoom = function(factor) {
        if (window.devMapInstance) {
            window.devMapInstance.zoom(factor);
        }
    };

    window.devMapCenterPlayer = function() {
        if (window.devMapInstance) {
            window.devMapInstance.centerOnPlayer();
        }
    };

    window.devMapResetView = function() {
        if (window.devMapInstance) {
            window.devMapInstance.resetView();
        }
    };

    window.addEventListener('DOMContentLoaded', () => {
        if (window.game) {
            window.devMapInstance = new DarkSoulsDevMap(window.game);
        }
    });
})();
