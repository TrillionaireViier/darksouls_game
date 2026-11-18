// ============================================================================
// DARK SOULS COLLISION & PHYSICS MODULE (CollisionSystem)
// Objective: Prevent entities from clipping through walls and merging into each other.
//
// Key Features:
// 1. Strict boundary limits enforcement (min/max X & Z) across all Lordran zones:
//    - Royal Bridge: parapet containment (z in [28, 95], x in [-6.45, 6.45])
//    - Surface Boss Arena: 34m wide access (z in [94.8, 168], x in [-16.8, 16.8])
//    - Courtyard Arena: perimeter fortress walls (x in [-28, 28], z in [-28, 28])
//    - High Ramparts Walkway: battlement balustrades (z in [22, 90], x in [16.5, 23.5])
//    - Flooded Catacombs Corridor: stone trench (z in [22, 90], x in [-23.4, -16.6])
//    - Deep Catacombs Crypt & Mausoleum: tomb walls (z in [90, 150], x in [-33, -7.5])
// 2. Radius-based separation force when distance between active entities drops below
//    combined thresholds (dist < r1 + r2).
//    - Mob-to-Mob pairwise repulsion (eliminates crowd-stacking / mesh merging)
//    - Mob-to-Player soft/hard repulsion
//    - Mob-to-Boss repulsion
//    - Player-to-Boss repulsion
// 3. Static world obstacle AABB swept box collision & sliding.
// 4. Elevation-aware ground snapping & abyss fall protection.
// ============================================================================

class CollisionSystem {
    constructor(world, game, combat) {
        this.world = world;
        this.game = game;
        this.combat = combat;

        // Reusable scratch vectors for allocation-free physics
        this._diff = new THREE.Vector3();
        this.totalSeparationEvents = 0;
        this.boundaryClampsCount = 0;
    }

    // ------------------------------------------------------------------------
    // 1. STRICT ZONE BOUNDARY ENFORCEMENT
    // Enforces min/max X and Z boundaries based on zone geometry and elevation
    // ------------------------------------------------------------------------
    enforceBoundaries(pos, radius = 0.45, currentY = null) {
        const y = (currentY !== null) ? currentY : pos.y;
        const initialX = pos.x;
        const initialZ = pos.z;

        // A. Royal Bridge Parapets (z in [28.0, 95.0])
        if (pos.z >= 28.0 && pos.z <= 95.0) {
            if (y >= -1.0 && y <= 3.5) {
                const minX = -6.45 + radius;
                const maxX = 6.45 - radius;
                pos.x = Math.max(minX, Math.min(maxX, pos.x));
            }
        }

        // B. Surface Boss Arena (z in [94.8, 168.0]) - Full 34m wide access (-16.8 to +16.8)
        if (pos.z >= 94.8 && pos.z <= 168.0 && y >= -1.0 && y <= 4.0) {
            const minX = -16.8 + radius;
            const maxX = 16.8 - radius;
            pos.x = Math.max(minX, Math.min(maxX, pos.x));
            pos.z = Math.min(164.0 - radius, pos.z);
        }

        // C. Flooded Catacombs Corridor (z in [22.0, 90.0], y < 1.0)
        if (pos.z >= 22.0 && pos.z <= 90.0 && y < 1.0) {
            const minX = -23.4 + radius;
            const maxX = -16.6 - radius;
            pos.x = Math.max(minX, Math.min(maxX, pos.x));
        }

        // D. Deep Catacombs Crypt & Mausoleum (z in [90.0, 150.0], x in [-34, -7], y < -4.0)
        if (pos.z >= 90.0 && pos.z <= 150.0 && y < -4.0) {
            const minX = -33.0 + radius;
            const maxX = -7.5 - radius;
            pos.x = Math.max(minX, Math.min(maxX, pos.x));
            pos.z = Math.min(148.0 - radius, pos.z);
        }

        // E. High Ramparts Walkway (z in [22.0, 90.0], y > 4.5)
        if (pos.z >= 22.0 && pos.z <= 90.0 && y > 4.5) {
            const minX = 16.5 + radius;
            const maxX = 23.5 - radius;
            pos.x = Math.max(minX, Math.min(maxX, pos.x));
        }

        // F. Courtyard Starting Arena (z in [-28.0, 28.0], x in [-28.0, 28.0])
        if (pos.z < 28.0 && y > -2.0) {
            const minX = -28.0 + radius;
            const maxX = 28.0 - radius;
            pos.x = Math.max(minX, Math.min(maxX, pos.x));
            pos.z = Math.max(minX, pos.z);
        }

        if (pos.x !== initialX || pos.z !== initialZ) {
            this.boundaryClampsCount++;
        }
    }

    // ------------------------------------------------------------------------
    // 2. RADIUS-BASED ENTITY SEPARATION FORCE (AVOIDS MERGING / CROWD CLIPPING)
    // ------------------------------------------------------------------------
    resolveSeparation(enemies, playerPos, playerRadius = 0.45, boss = null) {
        if (!enemies) return;
        const count = enemies.length;

        // A. Mob-to-Mob pairwise separation
        for (let i = 0; i < count; i++) {
            const eA = enemies[i];
            if (!eA.mesh || !eA.mesh.visible || eA.isDead || eA.state === 'DEAD') continue;
            const posA = eA.mesh.position;
            const rA = eA.radius || 0.45;

            // Test against every other mob (O(N^2) over active nearby mobs)
            for (let j = i + 1; j < count; j++) {
                const eB = enemies[j];
                if (!eB.mesh || !eB.mesh.visible || eB.isDead || eB.state === 'DEAD') continue;
                const posB = eB.mesh.position;
                const rB = eB.radius || 0.45;

                // Height check: only separate if on similar elevation level
                if (Math.abs(posA.y - posB.y) > 2.2) continue;

                const dx = posA.x - posB.x;
                const dz = posA.z - posB.z;
                const distSq = dx * dx + dz * dz;
                const minDist = rA + rB;

                if (distSq < minDist * minDist && distSq > 0.00001) {
                    const dist = Math.sqrt(distSq);
                    const overlap = minDist - dist;
                    const pushX = (dx / dist) * overlap * 0.52;
                    const pushZ = (dz / dist) * overlap * 0.52;

                    posA.x += pushX;
                    posA.z += pushZ;
                    posB.x -= pushX;
                    posB.z -= pushZ;
                    this.totalSeparationEvents++;
                }
            }

            // B. Mob-to-Player separation
            if (playerPos && Math.abs(posA.y - playerPos.y) <= 2.2) {
                const dx = posA.x - playerPos.x;
                const dz = posA.z - playerPos.z;
                const distSq = dx * dx + dz * dz;
                const minDist = rA + playerRadius;

                if (distSq < minDist * minDist && distSq > 0.00001) {
                    const dist = Math.sqrt(distSq);
                    const overlap = minDist - dist;
                    const pushX = (dx / dist) * overlap;
                    const pushZ = (dz / dist) * overlap;

                    // Player has greater inertia: push mob 65%, nudge player 35%
                    posA.x += pushX * 0.65;
                    posA.z += pushZ * 0.65;
                    playerPos.x -= pushX * 0.35;
                    playerPos.z -= pushZ * 0.35;
                    this.totalSeparationEvents++;
                }
            }

            // C. Mob-to-Boss separation
            if (boss && boss.mesh && !boss.isDead && Math.abs(posA.y - boss.mesh.position.y) <= 3.5) {
                const bPos = boss.mesh.position;
                const bRadius = boss.radius || 2.2;
                const dx = posA.x - bPos.x;
                const dz = posA.z - bPos.z;
                const distSq = dx * dx + dz * dz;
                const minDist = rA + bRadius;

                if (distSq < minDist * minDist && distSq > 0.00001) {
                    const dist = Math.sqrt(distSq);
                    const overlap = minDist - dist;
                    // Boss is immovable titan: push mob 100% away
                    posA.x += (dx / dist) * overlap;
                    posA.z += (dz / dist) * overlap;
                    this.totalSeparationEvents++;
                }
            }
        }

        // D. Player-to-Boss separation
        if (boss && boss.mesh && !boss.isDead && playerPos && Math.abs(playerPos.y - boss.mesh.position.y) <= 3.5) {
            const bPos = boss.mesh.position;
            const bRadius = boss.radius || 2.2;
            const dx = playerPos.x - bPos.x;
            const dz = playerPos.z - bPos.z;
            const distSq = dx * dx + dz * dz;
            const minDist = playerRadius + bRadius;

            if (distSq < minDist * minDist && distSq > 0.00001) {
                const dist = Math.sqrt(distSq);
                const overlap = minDist - dist;
                playerPos.x += (dx / dist) * overlap;
                playerPos.z += (dz / dist) * overlap;
                this.totalSeparationEvents++;
            }
        }
    }

    // ------------------------------------------------------------------------
    // 3. STATIC WORLD OBSTACLE AABB COLLISION RESOLUTION (PILLARS, WALLS)
    // ------------------------------------------------------------------------
    resolveObstacles(pos, radius = 0.45, bottom = pos.y, top = pos.y + 1.8) {
        if (!this.world || !this.world.colliders) return;
        const colliders = this.world.colliders;

        for (let iter = 0; iter < 2; iter++) {
            for (let i = 0; i < colliders.length; i++) {
                const box = colliders[i];
                if (bottom < box.max.y && top > box.min.y) {
                    if (pos.x > box.min.x - radius && pos.x < box.max.x + radius &&
                        pos.z > box.min.z - radius && pos.z < box.max.z + radius) {
                        const overlapL = pos.x - (box.min.x - radius);
                        const overlapR = (box.max.x + radius) - pos.x;
                        const overlapT = pos.z - (box.min.z - radius);
                        const overlapB = (box.max.z + radius) - pos.z;

                        const minOverlap = Math.min(overlapL, overlapR, overlapT, overlapB);
                        if (minOverlap === overlapL) pos.x = box.min.x - radius;
                        else if (minOverlap === overlapR) pos.x = box.max.x + radius;
                        else if (minOverlap === overlapT) pos.z = box.min.z - radius;
                        else if (minOverlap === overlapB) pos.z = box.max.z + radius;
                    }
                }
            }
        }
    }

    // ------------------------------------------------------------------------
    // 4. MASTER FRAME COLLISION UPDATE
    // ------------------------------------------------------------------------
    update(delta) {
        const playerPos = (this.game && this.game.playerMesh) ? this.game.playerMesh.position : null;
        const enemies = (this.combat && this.combat.enemies) ? this.combat.enemies : [];
        const boss = (this.combat && this.combat.boss) ? this.combat.boss : null;

        // 1. Entity pairwise separation force
        this.resolveSeparation(enemies, playerPos, 0.45, boss);

        // 2. Obstacles and strict zone boundaries for active mobs
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            if (!e.mesh || !e.mesh.visible || e.isDead || e.state === 'DEAD') continue;
            const pos = e.mesh.position;
            const r = e.radius || 0.45;

            this.resolveObstacles(pos, r, pos.y, pos.y + 1.8);
            this.enforceBoundaries(pos, r, pos.y);

            // Ground height terrain snapping
            if (this.world && this.world.getGroundHeight) {
                pos.y = this.world.getGroundHeight(pos.x, pos.z, pos.y);
            }
        }

        // 3. Boss boundary enforcement
        if (boss && boss.mesh && !boss.isDead) {
            this.enforceBoundaries(boss.mesh.position, boss.radius || 2.2, boss.mesh.position.y);
        }
    }
}

// Global exposure
if (typeof window !== 'undefined') {
    window.CollisionSystem = CollisionSystem;
}
