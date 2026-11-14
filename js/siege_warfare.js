// ====================================================================
// ADVANCED SIEGE & WARFARE MECHANICS (391–400)
// Complete medieval siege engine: Trebuchets, Scaling Ladders,
// Battering Rams, Boiling Oil, Arrow Slits, Caltrops, Palisades,
// Siege Towers, Fire Arrows, and Morale War Horns.
// ====================================================================

class SiegeWarfareSystem {
    constructor(game) {
        this.game = game;
        this.audio = window.dsAudio;

        // 391. Trebuchet & Catapult Calibration
        this.trebuchet = {
            counterweightKg: 650,    // 200kg to 1200kg
            winchAngleDeg: 42,       // 15° to 65°
            payloadType: 'fiery_boulder', // 'boulder', 'fiery_boulder', 'dead_cattle_rot'
            isAiming: false,
            readyToFire: true,
            cooldownTimer: 0,
            lastHitDistance: 0,
            shotsFired: 0,
            targetsDestroyed: 0
        };

        // 392. Scaling Ladder Placement
        this.ladders = [
            { id: 'ladder_west', name: 'West Rampart Ladder', raised: false, hp: 100, x: -28, y: 0, z: -15 },
            { id: 'ladder_east', name: 'East Overlook Ladder', raised: false, hp: 100, x: 26, y: 0, z: -12 }
        ];

        // 393. Battering Ram Coordination
        this.batteringRam = {
            rhythmBeat: 0,           // 0 to 1 (oscillating sine)
            syncScore: 0,            // Consecutive perfect heaves
            gateIntegrity: 1000,     // Boss arena portcullis health
            maxGateIntegrity: 1000,
            ramMomentum: 0,
            isPushing: false
        };

        // 394. Boiling Oil Defense
        this.boilingOil = {
            cauldronsReady: 3,
            maxCauldrons: 3,
            reheatTimer: 0,
            activeHazards: [],       // Ground fire pools
            damagePerSecond: 85
        };

        // 395. Arrow Slit Archery Cover
        this.arrowSlit = {
            isInCover: false,
            sniperZoom: false,
            arrowReserve: 24,
            damageMultiplier: 1.65
        };

        // 396. Caltrop Scatter & Foot Injury
        this.caltrops = {
            carried: 4,
            placedClusters: [],      // Array of Vector3 positions
            slowPercentage: 0.60,
            bleedDuration: 8.0
        };

        // 397. Palisade & Wooden Spike Defenses
        this.palisades = [
            { id: 'palisade_center', placed: false, hp: 450, maxHp: 450, x: 0, z: 12 },
            { id: 'palisade_flank', placed: false, hp: 450, maxHp: 450, x: -14, z: 8 }
        ];

        // 398. Siege Tower Docking
        this.siegeTower = {
            progressPct: 0,          // 0% to 100% across battlefield
            isPushing: false,
            isDocked: false,
            drawbridgeDropped: false,
            hp: 2000
        };

        // 399. Fire Arrow Imbues
        this.fireArrows = {
            activeImbue: false,
            imbueTimer: 0,
            burnDuration: 6.0,
            burnDamageBonus: 60
        };

        // 400. Horn Blow Morale Buffs
        this.warHorn = {
            buffActive: false,
            buffTimer: 0,
            buffMaxDuration: 30.0,
            cooldownTimer: 0,
            defenseBonus: 0.45,      // +45% damage mitigation
            staminaRegenBonus: 0.60  // +60% stamina regen
        };

        this.init3DHazards();
    }

    init3DHazards() {
        // Prepare Three.js group for 3D visual battlefield hazards
        if (this.game && this.game.scene) {
            this.siegeGroup = new THREE.Group();
            this.siegeGroup.name = "SiegeWarfareGroup";
            this.game.scene.add(this.siegeGroup);
        }
    }

    update(delta) {
        // Cooldown decays
        if (this.trebuchet.cooldownTimer > 0) {
            this.trebuchet.cooldownTimer -= delta;
            if (this.trebuchet.cooldownTimer <= 0) {
                this.trebuchet.readyToFire = true;
            }
        }

        // War Horn Buff Timer
        if (this.warHorn.buffActive) {
            this.warHorn.buffTimer -= delta;
            if (this.warHorn.buffTimer <= 0) {
                this.warHorn.buffActive = false;
                if (this.game) this.game.showNotification("WAR HORN MORALE BUFF EXPIRED");
            }
        }
        if (this.warHorn.cooldownTimer > 0) {
            this.warHorn.cooldownTimer -= delta;
        }

        // Fire Arrow Imbue Timer
        if (this.fireArrows.activeImbue) {
            this.fireArrows.imbueTimer -= delta;
            if (this.fireArrows.imbueTimer <= 0) {
                this.fireArrows.activeImbue = false;
            }
        }

        // Boiling Oil Reheat
        if (this.boilingOil.cauldronsReady < this.boilingOil.maxCauldrons) {
            this.boilingOil.reheatTimer += delta;
            if (this.boilingOil.reheatTimer >= 18.0) {
                this.boilingOil.cauldronsReady++;
                this.boilingOil.reheatTimer = 0;
            }
        }

        // Active Fire Hazard Decay & Damage
        for (let i = this.boilingOil.activeHazards.length - 1; i >= 0; i--) {
            const h = this.boilingOil.activeHazards[i];
            h.life -= delta;
            if (h.life <= 0) {
                if (h.mesh && h.mesh.parent) h.mesh.parent.remove(h.mesh);
                this.boilingOil.activeHazards.splice(i, 1);
            } else {
                // Pulse ground fire shader/emissive
                if (h.mesh && h.mesh.material) {
                    h.mesh.material.opacity = Math.min(1, h.life / 2.0) * 0.85;
                }
                // Check enemy burn damage
                this._damageEnemiesInRadius(h.x, h.z, h.radius, this.boilingOil.damagePerSecond * delta, "BURN");
            }
        }

        // Caltrop Collision against Enemies / Boss
        this._updateCaltropCollisions(delta);

        // Battering Ram Rhythm Oscillation
        this.batteringRam.rhythmBeat = (Math.sin(performance.now() * 0.0035) + 1.0) * 0.5;

        // Siege Tower Advance
        if (this.siegeTower.isPushing && !this.siegeTower.isDocked) {
            this.siegeTower.progressPct = Math.min(100, this.siegeTower.progressPct + delta * 5.0);
            if (this.siegeTower.progressPct >= 100) {
                this.dockSiegeTower();
            }
        }
    }

    // ----------------------------------------------------------------
    // 391. TREBUCHET BOMBARDMENT CALIBRATION & LAUNCH
    // ----------------------------------------------------------------
    calibrateTrebuchet(weightKg, angleDeg) {
        this.trebuchet.counterweightKg = Math.max(200, Math.min(1200, weightKg));
        this.trebuchet.winchAngleDeg = Math.max(15, Math.min(65, angleDeg));
    }

    fireTrebuchet() {
        if (!this.trebuchet.readyToFire) return { success: false, reason: "Winch being loaded by crew" };

        this.trebuchet.readyToFire = false;
        this.trebuchet.cooldownTimer = 6.0;
        this.trebuchet.shotsFired++;

        if (this.audio) this.audio.playTrebuchetLaunch();

        // Calculate impact distance via parabolic ballistics:
        // Range d = (v^2 * sin(2*theta)) / g
        const counterweightForce = (this.trebuchet.counterweightKg / 40.0);
        const thetaRad = this.trebuchet.winchAngleDeg * (Math.PI / 180);
        const distance = counterweightForce * Math.sin(2 * thetaRad) * 4.2;
        this.trebuchet.lastHitDistance = Math.round(distance);

        // Spawn flying projectile particle & explosion in 3D world
        setTimeout(() => {
            this._triggerSiegeExplosion(distance);
        }, 1100);

        return {
            success: true,
            rangeMetres: Math.round(distance),
            damage: Math.round(this.trebuchet.counterweightKg * 1.85)
        };
    }

    _triggerSiegeExplosion(range) {
        if (!this.game) return;
        const targetZ = -range * 0.6;
        const blastRadius = 9.5;
        const dmg = Math.round(this.trebuchet.counterweightKg * 1.85);

        // Screen shake
        if (this.game.camera) {
            this.game.triggerCameraShake(0.8, 14);
        }

        // Damage Boss or enemies
        if (this.game.combat && this.game.combat.boss && !this.game.combat.boss.isDead) {
            this.game.combat.boss.hp = Math.max(0, this.game.combat.boss.hp - dmg);
            this.game.combat.showFloatingText("-" + dmg + " SIEGE IMPACT!", 0, 4, targetZ, "#ff7700");
            if (this.game.combat.boss.hp <= 0) {
                this.game.combat.onBossDefeated();
            }
        }

        // Spawn visual 3D fire crater
        this._spawnGroundCrater(0, targetZ, blastRadius);
        this.trebuchet.targetsDestroyed++;
        this.game.showNotification("💥 TREBUCHET IMPACT: " + dmg + " DAMAGE AT " + Math.round(range) + "m!");
    }

    // ----------------------------------------------------------------
    // 392. SCALING LADDERS
    // ----------------------------------------------------------------
    toggleLadder(ladderId) {
        const ladder = this.ladders.find(l => l.id === ladderId);
        if (!ladder) return;
        ladder.raised = !ladder.raised;
        if (this.audio) this.audio.playBlock();
        if (this.game) {
            this.game.showNotification(ladder.name.toUpperCase() + ": " + (ladder.raised ? "RAISED & SECURED TO BATTLEMENTS" : "COLLAPSED"));
        }
        return ladder.raised;
    }

    // ----------------------------------------------------------------
    // 393. BATTERING RAM SYNCHRONIZED TIMING
    // ----------------------------------------------------------------
    heaveBatteringRam() {
        // Optimal rhythm window is when rhythmBeat is near peak (0.80 to 1.0)
        const isPerfectRhythm = (this.batteringRam.rhythmBeat >= 0.78);
        const isGoodRhythm = (this.batteringRam.rhythmBeat >= 0.55);

        if (this.audio) this.audio.playBossSlam();

        if (isPerfectRhythm) {
            this.batteringRam.syncScore++;
            this.batteringRam.ramMomentum = Math.min(100, this.batteringRam.ramMomentum + 25);
            const ramDamage = 220 + this.batteringRam.syncScore * 40;
            this.batteringRam.gateIntegrity = Math.max(0, this.batteringRam.gateIntegrity - ramDamage);
            if (this.game) {
                this.game.triggerCameraShake(0.5, 9);
                this.game.showNotification("⚡ PERFECT RAM HEAVE! -" + ramDamage + " GATE INTEGRITY! (Sync x" + this.batteringRam.syncScore + ")");
            }
        } else if (isGoodRhythm) {
            this.batteringRam.ramMomentum = Math.min(100, this.batteringRam.ramMomentum + 10);
            const ramDamage = 110;
            this.batteringRam.gateIntegrity = Math.max(0, this.batteringRam.gateIntegrity - ramDamage);
            if (this.game) {
                this.game.showNotification("RAM STRUCK GATE: -" + ramDamage + " Gate Integrity");
            }
        } else {
            this.batteringRam.syncScore = 0;
            this.batteringRam.ramMomentum = Math.max(0, this.batteringRam.ramMomentum - 20);
            if (this.game) {
                this.game.showNotification("⚠️ POOR RAM TIMING: Crew lost momentum!");
            }
        }

        if (this.batteringRam.gateIntegrity <= 0) {
            if (this.game) {
                this.game.showNotification("🏰 THE PORTCULLIS HAS COLLAPSED! CASTLE BREACHED!");
                if (this.audio) this.audio.playVictory();
            }
        }

        return {
            perfect: isPerfectRhythm,
            momentum: this.batteringRam.ramMomentum,
            gateHp: this.batteringRam.gateIntegrity
        };
    }

    // ----------------------------------------------------------------
    // 394. BOILING OIL DEFENSE
    // ----------------------------------------------------------------
    pourBoilingOil(x = 0, z = -8) {
        if (this.boilingOil.cauldronsReady <= 0) {
            if (this.game) this.game.showNotification("⚠️ CAULDRONS EMPTY: Pitch reheating over charcoal braziers...");
            return false;
        }

        this.boilingOil.cauldronsReady--;
        if (this.audio) this.audio.playBoilingOil();

        // Create 3D Ground Fire Pool Hazard
        const hazardRadius = 7.0;
        const hazardDuration = 14.0; // Seconds

        let hazardMesh = null;
        if (this.siegeGroup) {
            const geo = new THREE.CircleGeometry(hazardRadius, 24);
            geo.rotateX(-Math.PI / 2);
            const mat = new THREE.MeshBasicMaterial({
                color: 0xff3300,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            });
            hazardMesh = new THREE.Mesh(geo, mat);
            hazardMesh.position.set(x, 0.08, z);
            this.siegeGroup.add(hazardMesh);
        }

        this.boilingOil.activeHazards.push({
            x: x,
            z: z,
            radius: hazardRadius,
            life: hazardDuration,
            mesh: hazardMesh
        });

        if (this.game) {
            this.game.showNotification("🔥 BOILING OIL POURED! Searing pitch engulfs gate approach!");
        }

        return true;
    }

    // ----------------------------------------------------------------
    // 395. ARROW SLIT ARCHERY COVER
    // ----------------------------------------------------------------
    toggleArrowSlitCover() {
        this.arrowSlit.isInCover = !this.arrowSlit.isInCover;
        if (this.game) {
            if (this.arrowSlit.isInCover) {
                this.game.showNotification("🎯 ARROW SLIT COVER: 100% Directional Armor | High Precision Zoom Active");
            } else {
                this.game.showNotification("EXITED ARROW SLIT: Mobile combat restored");
            }
        }
        return this.arrowSlit.isInCover;
    }

    // ----------------------------------------------------------------
    // 396. CALTROP SCATTER & FOOT INJURY
    // ----------------------------------------------------------------
    deployCaltrops() {
        if (this.caltrops.carried <= 0) {
            if (this.game) this.game.showNotification("⚠️ NO CALTROPS IN POUCH: Craft or restock at forge");
            return false;
        }

        this.caltrops.carried--;
        if (this.audio) this.audio.playCaltropDrop();

        const pPos = this.game && this.game.character ? this.game.character.position : { x: 0, y: 0, z: 0 };
        const clusterPos = new THREE.Vector3(pPos.x, 0.04, pPos.z);
        const clusterRadius = 4.2;

        // Visual 3D caltrop spikes
        if (this.siegeGroup) {
            const caltropMesh = new THREE.Group();
            for (let i = 0; i < 18; i++) {
                const spike = new THREE.Mesh(
                    new THREE.TetrahedronGeometry(0.12),
                    new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.2 })
                );
                const rx = (Math.random() - 0.5) * clusterRadius * 1.6;
                const rz = (Math.random() - 0.5) * clusterRadius * 1.6;
                spike.position.set(clusterPos.x + rx, 0.06, clusterPos.z + rz);
                spike.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
                caltropMesh.add(spike);
            }
            this.siegeGroup.add(caltropMesh);
        }

        this.caltrops.placedClusters.push({
            pos: clusterPos,
            radius: clusterRadius,
            charges: 8
        });

        if (this.game) {
            this.game.showNotification("📌 CALTROPS SCATTERED! Charging foot soldiers will be crippled (-60% Speed)!");
        }

        return true;
    }

    _updateCaltropCollisions(delta) {
        if (!this.game || !this.game.combat) return;
        const enemies = this.game.combat.enemies || [];
        const boss = this.game.combat.boss;

        for (let cIdx = this.caltrops.placedClusters.length - 1; cIdx >= 0; cIdx--) {
            const cluster = this.caltrops.placedClusters[cIdx];

            // Check Boss stepping on caltrops
            if (boss && !boss.isDead) {
                const distToBoss = cluster.pos.distanceTo(boss.position);
                if (distToBoss < cluster.radius + 1.2) {
                    boss.hp = Math.max(0, boss.hp - delta * 35.0);
                    boss.speed = Math.min(boss.speed || 3.0, 1.4); // Crippled leg speed
                    if (Math.random() < delta * 1.2) {
                        this.game.combat.showFloatingText("📌 FOOT CRIPPLED (-60% SPD)", boss.position.x, 2, boss.position.z, "#ff4444");
                        if (this.audio) this.audio.playHit();
                    }
                }
            }

            // Check regular enemies
            for (const enemy of enemies) {
                if (!enemy.isDead && enemy.position) {
                    if (cluster.pos.distanceTo(enemy.position) < cluster.radius) {
                        enemy.hp = Math.max(0, enemy.hp - delta * 55.0);
                        enemy.speedMultiplier = 0.4;
                    }
                }
            }
        }
    }

    // ----------------------------------------------------------------
    // 397. PALISADES & WOODEN SPIKES
    // ----------------------------------------------------------------
    buildPalisade(palisadeId) {
        const palisade = this.palisades.find(p => p.id === palisadeId);
        if (!palisade) return;
        palisade.placed = true;
        palisade.hp = palisade.maxHp;

        if (this.audio) this.audio.playBlock();

        // Spawn 3D wooden sharpened stake palisade
        if (this.siegeGroup) {
            const pGroup = new THREE.Group();
            for (let i = -3; i <= 3; i++) {
                const stake = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.08, 0.16, 2.4, 6),
                    new THREE.MeshStandardMaterial({ color: 0x5a3e26, roughness: 0.9 })
                );
                stake.position.set(palisade.x + i * 0.8, 1.0, palisade.z);
                stake.rotation.z = (Math.random() - 0.5) * 0.25;
                stake.rotation.x = 0.35; // Angled outward toward charging invaders
                pGroup.add(stake);
            }
            this.siegeGroup.add(pGroup);
        }

        if (this.game) {
            this.game.showNotification("🛡️ WOODEN SPIKE PALISADE CONSTRUCTED! Blocks cavalry & charging infantry.");
        }
    }

    // ----------------------------------------------------------------
    // 398. SIEGE TOWER DOCKING
    // ----------------------------------------------------------------
    pushSiegeTower() {
        if (this.siegeTower.isDocked) return;
        this.siegeTower.isPushing = true;
        if (this.game) {
            this.game.showNotification("🏰 ADVANCING SIEGE TOWER! Progress: " + Math.round(this.siegeTower.progressPct) + "%");
        }
    }

    dockSiegeTower() {
        this.siegeTower.isPushing = false;
        this.siegeTower.isDocked = true;
        this.siegeTower.drawbridgeDropped = true;

        if (this.audio) this.audio.playBossSlam();
        if (this.game) {
            this.game.triggerCameraShake(0.7, 12);
            this.game.showNotification("🏰 SIEGE TOWER DOCKED! Heavy Drawbridge dropped onto battlements!");
        }
    }

    // ----------------------------------------------------------------
    // 399. FIRE ARROW IMBUE
    // ----------------------------------------------------------------
    igniteFireArrows() {
        this.fireArrows.activeImbue = true;
        this.fireArrows.imbueTimer = 45.0; // 45 seconds of incendiary strikes

        if (this.audio) this.audio.playBonfireIgnite();
        if (this.game) {
            this.game.showNotification("🔥 ARROWS IMBUED WITH FLAME! Incendiary DoT & structure ignition enabled.");
        }
        return true;
    }

    // ----------------------------------------------------------------
    // 400. HORN BLOW MORALE BUFFS
    // ----------------------------------------------------------------
    blowWarHorn() {
        if (this.warHorn.cooldownTimer > 0) {
            if (this.game) this.game.showNotification("War Horn cooldown: " + Math.round(this.warHorn.cooldownTimer) + "s remaining");
            return false;
        }

        this.warHorn.buffActive = true;
        this.warHorn.buffTimer = this.warHorn.buffMaxDuration;
        this.warHorn.cooldownTimer = 45.0;

        if (this.audio) this.audio.playWarHorn();

        // Apply temporary defense & stamina buffs to player combat
        if (this.game && this.game.combat) {
            this.game.combat.staminaRegenRate = 38 * (1.0 + this.warHorn.staminaRegenBonus);
            this.game.triggerCameraShake(0.3, 6);
            this.game.showNotification("📯 WAR HORN SOUNDED! +45% Defense & +60% Stamina Regen for 30s!");
        }

        return true;
    }

    _damageEnemiesInRadius(x, z, radius, dmg, reason) {
        if (!this.game || !this.game.combat) return;
        const boss = this.game.combat.boss;
        if (boss && !boss.isDead) {
            const dx = boss.position.x - x;
            const dz = boss.position.z - z;
            if (Math.sqrt(dx * dx + dz * dz) <= radius) {
                boss.hp = Math.max(0, boss.hp - dmg);
                if (Math.random() < 0.15) {
                    this.game.combat.showFloatingText("-" + Math.round(dmg) + " " + reason, boss.position.x, 3, boss.position.z, "#ff3300");
                }
            }
        }
    }

    _spawnGroundCrater(x, z, radius) {
        if (!this.siegeGroup) return;
        const craterGeo = new THREE.RingGeometry(0.1, radius, 24);
        craterGeo.rotateX(-Math.PI / 2);
        const craterMat = new THREE.MeshBasicMaterial({
            color: 0x111111,
            transparent: true,
            opacity: 0.75,
            side: THREE.DoubleSide
        });
        const craterMesh = new THREE.Mesh(craterGeo, craterMat);
        craterMesh.position.set(x, 0.03, z);
        this.siegeGroup.add(craterMesh);
    }
}

window.SiegeWarfareSystem = SiegeWarfareSystem;
