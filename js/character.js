// ==========================================
// DARK SOULS 3D PROCEDURAL CHARACTERS & ANIMATIONS
// Player (Chosen Undead Knight), Hollows, Black Knight, Taurus Demon Boss
// ==========================================

class DarkSoulsCharacters {
    constructor(scene) {
        this.scene = scene;
        this.initMaterials();
    }

    initMaterials() {
        // Player Knight Materials
        this.steelMat = new THREE.MeshStandardMaterial({
            color: 0x889098,
            metalness: 0.85,
            roughness: 0.3
        });
        this.darkSteelMat = new THREE.MeshStandardMaterial({
            color: 0x2e3238,
            metalness: 0.9,
            roughness: 0.35
        });
        this.clothMat = new THREE.MeshStandardMaterial({
            color: 0x1b2838, // Astora navy blue
            roughness: 0.85
        });
        this.leatherMat = new THREE.MeshStandardMaterial({
            color: 0x3d271d,
            roughness: 0.7
        });
        this.goldTrimMat = new THREE.MeshStandardMaterial({
            color: 0xc49a45,
            metalness: 0.8,
            roughness: 0.35
        });
        this.bladeMat = new THREE.MeshStandardMaterial({
            color: 0xd8e0e8,
            metalness: 0.95,
            roughness: 0.15
        });

        // Hollow Soldier Materials
        this.hollowSkinMat = new THREE.MeshStandardMaterial({
            color: 0x5a554a,
            roughness: 0.95
        });
        this.hollowRagsMat = new THREE.MeshStandardMaterial({
            color: 0x2a241e,
            roughness: 0.9
        });
        this.rustedIronMat = new THREE.MeshStandardMaterial({
            color: 0x483a32,
            metalness: 0.5,
            roughness: 0.7
        });

        // Boss (Taurus Demon) Materials
        this.demonFleshMat = new THREE.MeshStandardMaterial({
            color: 0x221a18,
            roughness: 0.85,
            metalness: 0.2
        });
        this.demonHornMat = new THREE.MeshStandardMaterial({
            color: 0x110d0b,
            roughness: 0.6,
            metalness: 0.3
        });
        this.demonLavaMat = new THREE.MeshStandardMaterial({
            color: 0xff3300,
            emissive: 0xff3300,
            emissiveIntensity: 0.8,
            roughness: 0.3
        });
        this.stoneClubMat = new THREE.MeshStandardMaterial({
            color: 0x2b2b2b,
            roughness: 0.95,
            metalness: 0.1
        });

        // ----------------------------------------------------
        // 4 NEW BOSSES MATERIALS
        // ----------------------------------------------------
        // 1. Bell Gargoyle Materials
        this.gargoyleStoneMat = new THREE.MeshStandardMaterial({
            color: 0x484c44,
            roughness: 0.88,
            metalness: 0.2
        });
        this.bronzeHalberdMat = new THREE.MeshStandardMaterial({
            color: 0x9e6c38,
            metalness: 0.85,
            roughness: 0.35
        });
        this.wingMembraneMat = new THREE.MeshStandardMaterial({
            color: 0x2e2c28,
            roughness: 0.9,
            side: THREE.DoubleSide
        });

        // 2. Capra Demon Materials
        this.capraSkinMat = new THREE.MeshStandardMaterial({
            color: 0x181414,
            roughness: 0.92,
            metalness: 0.15
        });
        this.goatSkullMat = new THREE.MeshStandardMaterial({
            color: 0xd6cdb8,
            roughness: 0.75,
            metalness: 0.1
        });
        this.capraMacheteMat = new THREE.MeshStandardMaterial({
            color: 0x2a2826,
            metalness: 0.85,
            roughness: 0.4
        });

        // 3. Great Grey Wolf Sif Materials
        this.wolfFurMat = new THREE.MeshStandardMaterial({
            color: 0x828a94,
            roughness: 0.96
        });
        this.wolfUnderbellyMat = new THREE.MeshStandardMaterial({
            color: 0xd0d8e2,
            roughness: 0.96
        });
        this.artoriasBladeMat = new THREE.MeshStandardMaterial({
            color: 0x88b0d8,
            metalness: 0.95,
            roughness: 0.18
        });

        // 4. Gwyn Lord of Cinder Materials
        this.gwynRobeMat = new THREE.MeshStandardMaterial({
            color: 0x2c2825,
            roughness: 0.92
        });
        this.gwynCrownMat = new THREE.MeshStandardMaterial({
            color: 0xe6b840,
            metalness: 0.9,
            roughness: 0.25
        });
        this.sunlightGreatswordMat = new THREE.MeshStandardMaterial({
            color: 0xffaa22,
            emissive: 0xff5500,
            emissiveIntensity: 1.4,
            metalness: 0.7,
            roughness: 0.3
        });
        this.gwynHairMat = new THREE.MeshStandardMaterial({
            color: 0xdedee4,
            roughness: 0.9
        });
    }

    // ----------------------------------------------------
    // CREATE PLAYER (CHOSEN UNDEAD KNIGHT)
    // ----------------------------------------------------
    createPlayer() {
        const root = new THREE.Group();

        // Base root offset so position represents feet on ground
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.0;
        root.add(bodyGroup);

        // 1. Torso / Breastplate
        const torsoGeo = new THREE.BoxGeometry(0.55, 0.65, 0.35);
        const torso = new THREE.Mesh(torsoGeo, this.steelMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Surcoat / Tabard cloth draped over chest
        const tabard = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.75, 0.38), this.clothMat);
        torso.add(tabard);

        // 2. Head & Elite Knight Helm
        const headGroup = new THREE.Group();
        headGroup.position.y = 0.55;
        torso.add(headGroup);

        const helm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.38), this.steelMat);
        helm.castShadow = true;
        headGroup.add(helm);

        // Visor slit
        const visor = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.05, 0.05),
            new THREE.MeshBasicMaterial({ color: 0x88ccff })
        );
        visor.position.set(0, 0.02, 0.18);
        headGroup.add(visor);

        // Helm Crest/Plume
        const plume = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 6), this.goldTrimMat);
        plume.position.set(0, 0.22, -0.05);
        headGroup.add(plume);

        // 3. Right Arm (Weapon Arm)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.38, 0.25, 0);
        torso.add(rightShoulder);

        const rPauldrons = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.25), this.steelMat);
        rightShoulder.add(rPauldrons);

        const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.4, 0.14), this.darkSteelMat);
        rArm.position.y = -0.22;
        rightShoulder.add(rArm);

        // Right Hand / Longsword
        const rHand = new THREE.Group();
        rHand.position.y = -0.42;
        rightShoulder.add(rHand);

        const swordGroup = new THREE.Group();
        // Crossguard
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.08), this.goldTrimMat);
        swordGroup.add(guard);
        // Hilt
        const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8), this.leatherMat);
        hilt.position.y = -0.14;
        swordGroup.add(hilt);
        // Blade
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.25, 0.03), this.bladeMat);
        blade.position.y = 0.68;
        blade.castShadow = true;
        swordGroup.add(blade);
        // Tip
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 4), this.bladeMat);
        tip.position.y = 1.38;
        tip.rotation.y = Math.PI / 4;
        swordGroup.add(tip);

        swordGroup.rotation.x = Math.PI / 2;
        rHand.add(swordGroup);

        // 4. Left Arm (Shield Arm)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.38, 0.25, 0);
        torso.add(leftShoulder);

        const lPauldrons = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.25), this.steelMat);
        leftShoulder.add(lPauldrons);

        const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.4, 0.14), this.darkSteelMat);
        lArm.position.y = -0.22;
        leftShoulder.add(lArm);

        // Left Hand & Heater Shield
        const lHand = new THREE.Group();
        lHand.position.y = -0.42;
        leftShoulder.add(lHand);

        const shieldGroup = new THREE.Group();
        const shieldPlate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.8, 0.06), this.steelMat);
        shieldPlate.castShadow = true;
        shieldGroup.add(shieldPlate);

        // Shield crest stripe
        const shieldStripe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.78, 0.07), this.clothMat);
        shieldGroup.add(shieldStripe);
        const shieldCross = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.08), this.goldTrimMat);
        shieldCross.position.y = 0.1;
        shieldGroup.add(shieldCross);

        shieldGroup.position.set(-0.1, 0.1, 0.2);
        shieldGroup.rotation.y = Math.PI / 6;
        lHand.add(shieldGroup);

        // Estus Flask (attached to hip, shown when drinking)
        const estusFlask = new THREE.Group();
        const flaskBody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.12, 0.25, 8),
            new THREE.MeshStandardMaterial({
                color: 0xffaa00,
                emissive: 0xff8800,
                emissiveIntensity: 0.6,
                roughness: 0.3
            })
        );
        estusFlask.add(flaskBody);
        estusFlask.position.set(-0.25, -0.3, -0.15);
        torso.add(estusFlask);

        // 5. Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.18, -0.35, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, 0.18), this.darkSteelMat);
        rLeg.position.y = -0.28;
        rLeg.castShadow = true;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.18, -0.35, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, 0.18), this.darkSteelMat);
        lLeg.position.y = -0.28;
        lLeg.castShadow = true;
        leftHip.add(lLeg);

        // Assign animation nodes
        root.userData = {
            bodyGroup,
            torso,
            headGroup,
            rightShoulder,
            leftShoulder,
            rightHip,
            leftHip,
            rHand,
            lHand,
            swordGroup,
            shieldGroup,
            estusFlask
        };

        this.scene.add(root);
        return root;
    }

    // ----------------------------------------------------
    // CREATE HOLLOW UNDEAD SOLDIER
    // ----------------------------------------------------
    createHollow(x, z, angle = 0) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 0.95;
        root.add(bodyGroup);

        // Torso with rags
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.6, 0.3), this.hollowRagsMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.3), this.hollowSkinMat);
        head.position.y = 0.5;
        torso.add(head);

        // Red glowing undead hollow eyes
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04), new THREE.MeshBasicMaterial({ color: 0xff1100 }));
        eyeL.position.set(-0.08, 0.05, 0.16);
        head.add(eyeL);
        const eyeR = eyeL.clone();
        eyeR.position.x = 0.08;
        head.add(eyeR);

        // Broken helm
        const brokenHelm = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.34), this.rustedIronMat);
        brokenHelm.position.y = 0.15;
        head.add(brokenHelm);

        // Right Arm (Sword)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.32, 0.2, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.12), this.hollowSkinMat);
        rArm.position.y = -0.22;
        rightShoulder.add(rArm);

        // Rusted sword
        const sword = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.02), this.rustedIronMat);
        sword.position.set(0, -0.4, 0.35);
        sword.rotation.x = Math.PI / 2.2;
        rightShoulder.add(sword);

        // Left Arm (Buckler)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.32, 0.2, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.12), this.hollowSkinMat);
        lArm.position.y = -0.22;
        leftShoulder.add(lArm);

        const buckler = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 8), this.rustedIronMat);
        buckler.rotation.x = Math.PI / 2;
        buckler.position.set(-0.05, -0.25, 0.15);
        leftShoulder.add(buckler);

        // Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.16, -0.3, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), this.hollowSkinMat);
        rLeg.position.y = -0.25;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.16, -0.3, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), this.hollowSkinMat);
        lLeg.position.y = -0.25;
        leftHip.add(lLeg);

        root.position.set(x, 0, z);
        root.rotation.y = angle;

        root.userData = {
            bodyGroup,
            torso,
            head,
            rightShoulder,
            leftShoulder,
            rightHip,
            leftHip,
            sword
        };

        this.scene.add(root);
        return root;
    }

    // ----------------------------------------------------
    // CREATE BOSS: TAURUS DEMON
    // Massive, hulking, horned demonic brute with giant stone club
    // ----------------------------------------------------
    createTaurusDemon(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.4; // High center of mass
        root.add(bodyGroup);

        // 1. Massive Demonic Torso
        const torsoGeo = new THREE.BoxGeometry(2.0, 2.2, 1.4);
        const torso = new THREE.Mesh(torsoGeo, this.demonFleshMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Molten Chest Crack / Lava core
        const lavaCrack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.4, 0.2), this.demonLavaMat);
        lavaCrack.position.set(0, 0, 0.72);
        torso.add(lavaCrack);

        // Demon spine ridges on back
        for (let i = -0.8; i <= 0.8; i += 0.4) {
            const spine = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 4), this.demonHornMat);
            spine.rotation.x = -Math.PI / 2;
            spine.position.set(0, i, -0.85);
            torso.add(spine);
        }

        // 2. Head with Monstrous Curled Horns
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.4, 0.4);
        torso.add(headGroup);

        const demonHead = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.2), this.demonFleshMat);
        demonHead.castShadow = true;
        headGroup.add(demonHead);

        // Burning Red Demon Eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const bossEyeL = new THREE.Mesh(new THREE.SphereGeometry(0.14), eyeMat);
        bossEyeL.position.set(-0.35, 0.15, 0.62);
        headGroup.add(bossEyeL);

        const bossEyeR = bossEyeL.clone();
        bossEyeR.position.x = 0.35;
        headGroup.add(bossEyeR);

        // Massive Curled Horns
        const hornGeo = new THREE.CylinderGeometry(0.08, 0.35, 1.8, 8);
        const hornL = new THREE.Mesh(hornGeo, this.demonHornMat);
        hornL.position.set(-0.85, 0.65, -0.1);
        hornL.rotation.z = Math.PI / 3;
        hornL.rotation.x = -Math.PI / 6;
        headGroup.add(hornL);

        const hornR = new THREE.Mesh(hornGeo, this.demonHornMat);
        hornR.position.set(0.85, 0.65, -0.1);
        hornR.rotation.z = -Math.PI / 3;
        hornR.rotation.x = -Math.PI / 6;
        headGroup.add(hornR);

        // 3. Right Arm (Wielding Giant Demon Greathammer)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.4, 0.8, 0);
        torso.add(rightShoulder);

        const rBicep = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.2, 0.65), this.demonFleshMat);
        rBicep.position.y = -0.6;
        rBicep.castShadow = true;
        rightShoulder.add(rBicep);

        // Hand & Giant Weapon
        const rHand = new THREE.Group();
        rHand.position.y = -1.3;
        rightShoulder.add(rHand);

        const weaponGroup = new THREE.Group();
        // Weapon Shaft (charred massive log)
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 4.2, 8), this.stoneClubMat);
        shaft.position.y = 0.8;
        shaft.castShadow = true;
        weaponGroup.add(shaft);

        // Massive Spiked Stone Hammer Head
        const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 1.2), this.stoneClubMat);
        hammerHead.position.y = 2.4;
        hammerHead.castShadow = true;
        weaponGroup.add(hammerHead);

        // Spikes on hammer
        for (let s = 0; s < 4; s++) {
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 4), this.rustedIronMat);
            spike.position.set(s % 2 === 0 ? 0.65 : -0.65, 2.4, s < 2 ? 0.65 : -0.65);
            spike.rotation.z = s % 2 === 0 ? -Math.PI / 2 : Math.PI / 2;
            weaponGroup.add(spike);
        }

        // Fire glow on weapon for Phase 2
        const weaponFlame = new THREE.PointLight(0xff4400, 0, 10);
        weaponFlame.position.set(0, 2.4, 0);
        weaponGroup.add(weaponFlame);

        weaponGroup.rotation.x = Math.PI / 3;
        rHand.add(weaponGroup);

        // 4. Left Arm (Gargantuan Clawed Arm)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-1.4, 0.8, 0);
        torso.add(leftShoulder);

        const lBicep = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.2, 0.65), this.demonFleshMat);
        lBicep.position.y = -0.6;
        lBicep.castShadow = true;
        leftShoulder.add(lBicep);

        const lClaw = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.5), this.demonHornMat);
        lClaw.position.y = -1.3;
        leftShoulder.add(lClaw);

        // 5. Heavy Demonic Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.65, -1.0, 0);
        torso.add(rightHip);
        const rThigh = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.4, 0.65), this.demonFleshMat);
        rThigh.position.y = -0.7;
        rThigh.castShadow = true;
        rightHip.add(rThigh);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.65, -1.0, 0);
        torso.add(leftHip);
        const lThigh = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.4, 0.65), this.demonFleshMat);
        lThigh.position.y = -0.7;
        lThigh.castShadow = true;
        leftHip.add(lThigh);

        root.position.set(x, 0, z);

        root.userData = {
            bodyGroup,
            torso,
            headGroup,
            rightShoulder,
            leftShoulder,
            rightHip,
            leftHip,
            rHand,
            weaponGroup,
            weaponFlame,
            lavaCrack
        };

        this.scene.add(root);
        return root;
    }

    // ----------------------------------------------------
    // CREATE BOSS 2: BELL GARGOYLE (Undead Parish Belfry)
    // Towering stone-bronze winged gargoyle with halberd, stone tail-axe, and flame breath
    // ----------------------------------------------------
    createBellGargoyle(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.2;
        root.add(bodyGroup);

        // 1. Stone Gargoyle Torso
        const torsoGeo = new THREE.BoxGeometry(1.6, 2.0, 1.2);
        const torso = new THREE.Mesh(torsoGeo, this.gargoyleStoneMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Chest Rib Sculpt
        for (let r = -0.5; r <= 0.5; r += 0.3) {
            const rib = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.1, 0.2), this.gargoyleStoneMat);
            rib.position.set(0, r, 0.62);
            torso.add(rib);
        }

        // 2. Gargoyle Head
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.3, 0.3);
        torso.add(headGroup);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 1.0), this.gargoyleStoneMat);
        head.castShadow = true;
        headGroup.add(head);

        // Horns & Ears
        const hornGeo = new THREE.ConeGeometry(0.12, 1.2, 5);
        const hornL = new THREE.Mesh(hornGeo, this.demonHornMat);
        hornL.position.set(-0.55, 0.6, -0.15);
        hornL.rotation.z = Math.PI / 4;
        hornL.rotation.x = -Math.PI / 8;
        headGroup.add(hornL);

        const hornR = new THREE.Mesh(hornGeo, this.demonHornMat);
        hornR.position.set(0.55, 0.6, -0.15);
        hornR.rotation.z = -Math.PI / 4;
        hornR.rotation.x = -Math.PI / 8;
        headGroup.add(hornR);

        // Glowing Amber Gargoyle Eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.12), eyeMat);
        eyeL.position.set(-0.28, 0.1, 0.52);
        headGroup.add(eyeL);
        const eyeR = eyeL.clone();
        eyeR.position.x = 0.28;
        headGroup.add(eyeR);

        // Throat Flame Light (Activated during Fire Breath)
        const throatFlame = new THREE.PointLight(0xff4400, 0, 12);
        throatFlame.position.set(0, -0.1, 0.8);
        headGroup.add(throatFlame);

        // 3. Sprawling Stone Wings (Left & Right)
        const leftWingGroup = new THREE.Group();
        leftWingGroup.position.set(-0.9, 0.8, -0.6);
        torso.add(leftWingGroup);

        const wingBone1L = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 2.2, 6), this.gargoyleStoneMat);
        wingBone1L.position.set(-1.0, 0.6, 0);
        wingBone1L.rotation.z = Math.PI / 3;
        leftWingGroup.add(wingBone1L);

        const wingMembraneL = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.8), this.wingMembraneMat);
        wingMembraneL.position.set(-1.1, 0.2, 0);
        wingMembraneL.rotation.y = Math.PI / 12;
        leftWingGroup.add(wingMembraneL);

        const rightWingGroup = new THREE.Group();
        rightWingGroup.position.set(0.9, 0.8, -0.6);
        torso.add(rightWingGroup);

        const wingBone1R = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 2.2, 6), this.gargoyleStoneMat);
        wingBone1R.position.set(1.0, 0.6, 0);
        wingBone1R.rotation.z = -Math.PI / 3;
        rightWingGroup.add(wingBone1R);

        const wingMembraneR = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.8), this.wingMembraneMat);
        wingMembraneR.position.set(1.1, 0.2, 0);
        wingMembraneR.rotation.y = -Math.PI / 12;
        rightWingGroup.add(wingMembraneR);

        // 4. Jointed Stone Tail with Bladed Axe Tip
        const tailGroup = new THREE.Group();
        tailGroup.position.set(0, -0.8, -0.7);
        torso.add(tailGroup);

        const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 2.4, 6), this.gargoyleStoneMat);
        tailMesh.rotation.x = Math.PI / 2.6;
        tailMesh.position.set(0, 0, -1.0);
        tailGroup.add(tailMesh);

        // Bladed Tail-Axe Head
        const tailAxe = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.15), this.bronzeHalberdMat);
        tailAxe.position.set(0, 0.4, -2.2);
        tailGroup.add(tailAxe);

        // 5. Right Arm with Bronze Halberd
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.1, 0.7, 0);
        torso.add(rightShoulder);

        const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), this.gargoyleStoneMat);
        rArm.position.y = -0.55;
        rArm.castShadow = true;
        rightShoulder.add(rArm);

        const rHand = new THREE.Group();
        rHand.position.y = -1.2;
        rightShoulder.add(rHand);

        // Bronze Halberd
        const halberdGroup = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 4.8, 8), this.bronzeHalberdMat);
        pole.position.y = 1.0;
        pole.castShadow = true;
        halberdGroup.add(pole);

        // Crescent Axe Head
        const axeCrescent = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 0.12), this.bronzeHalberdMat);
        axeCrescent.position.set(0.6, 2.6, 0);
        axeCrescent.castShadow = true;
        halberdGroup.add(axeCrescent);

        // Top Spear Tip
        const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.8, 6), this.bladeMat);
        spearTip.position.y = 3.6;
        spearTip.castShadow = true;
        halberdGroup.add(spearTip);

        halberdGroup.rotation.x = Math.PI / 3;
        rHand.add(halberdGroup);

        // 6. Left Arm (Gargoyle Shield-Claw)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-1.1, 0.7, 0);
        torso.add(leftShoulder);

        const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), this.gargoyleStoneMat);
        lArm.position.y = -0.55;
        lArm.castShadow = true;
        leftShoulder.add(lArm);

        // 7. Stone Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.5, -0.9, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.3, 0.55), this.gargoyleStoneMat);
        rLeg.position.y = -0.65;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.5, -0.9, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.3, 0.55), this.gargoyleStoneMat);
        lLeg.position.y = -0.65;
        leftHip.add(lLeg);

        root.position.set(x, 0, z);

        root.userData = {
            bodyGroup,
            torso,
            headGroup,
            throatFlame,
            leftWingGroup,
            rightWingGroup,
            tailGroup,
            rightShoulder,
            leftShoulder,
            rightHip,
            leftHip,
            weaponGroup: halberdGroup
        };

        this.scene.add(root);
        return root;
    }

    // ----------------------------------------------------
    // CREATE BOSS 3: CAPRA DEMON (Lower Undead Burg)
    // Feral goat-headed demon dual-wielding massive jagged Demon Great Machetes
    // ----------------------------------------------------
    createCapraDemon(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.0;
        root.add(bodyGroup);

        // 1. Hunched Muscular Demon Torso
        const torsoGeo = new THREE.BoxGeometry(1.4, 2.1, 1.1);
        const torso = new THREE.Mesh(torsoGeo, this.capraSkinMat);
        torso.rotation.x = Math.PI / 16; // Hunched aggressive posture
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Spine Ridges
        for (let i = -0.8; i <= 0.8; i += 0.3) {
            const ridge = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 4), this.goatSkullMat);
            ridge.rotation.x = -Math.PI / 2;
            ridge.position.set(0, i, -0.65);
            torso.add(ridge);
        }

        // 2. Terrifying Bleached Goat Skull Head
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.3, 0.35);
        torso.add(headGroup);

        const skull = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.85, 1.1), this.goatSkullMat);
        skull.castShadow = true;
        headGroup.add(skull);

        // Fangs / Jaw
        const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.8), this.goatSkullMat);
        jaw.position.set(0, -0.35, 0.2);
        headGroup.add(jaw);

        // Glowing Crimson Demon Eye Points
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff1100 });
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.09), eyeMat);
        eyeL.position.set(-0.25, 0.05, 0.5);
        headGroup.add(eyeL);
        const eyeR = eyeL.clone();
        eyeR.position.x = 0.25;
        headGroup.add(eyeR);

        // Massive Sweeping Curled Goat Horns
        const hornGeo = new THREE.CylinderGeometry(0.06, 0.25, 2.2, 7);
        const hornL = new THREE.Mesh(hornGeo, this.demonHornMat);
        hornL.position.set(-0.7, 0.8, -0.3);
        hornL.rotation.z = Math.PI / 3.2;
        hornL.rotation.x = -Math.PI / 3;
        headGroup.add(hornL);

        const hornR = new THREE.Mesh(hornGeo, this.demonHornMat);
        hornR.position.set(0.7, 0.8, -0.3);
        hornR.rotation.z = -Math.PI / 3.2;
        hornR.rotation.x = -Math.PI / 3;
        headGroup.add(hornR);

        // 3. Right Arm with Demon Great Machete #1
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.0, 0.8, 0);
        torso.add(rightShoulder);

        const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.1, 0.5), this.capraSkinMat);
        rArm.position.y = -0.55;
        rightShoulder.add(rArm);

        const rHand = new THREE.Group();
        rHand.position.y = -1.2;
        rightShoulder.add(rHand);

        const rMachete = this.createDemonMacheteMesh();
        rMachete.rotation.x = Math.PI / 3.5;
        rHand.add(rMachete);

        // 4. Left Arm with Demon Great Machete #2 (Dual Wielding!)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-1.0, 0.8, 0);
        torso.add(leftShoulder);

        const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.1, 0.5), this.capraSkinMat);
        lArm.position.y = -0.55;
        leftShoulder.add(lArm);

        const lHand = new THREE.Group();
        lHand.position.y = -1.2;
        leftShoulder.add(lHand);

        const lMachete = this.createDemonMacheteMesh();
        lMachete.rotation.x = Math.PI / 3.5;
        lHand.add(lMachete);

        // 5. Digitigrade Demon Legs & Hooves
        const rightHip = new THREE.Group();
        rightHip.position.set(0.5, -0.9, 0);
        torso.add(rightHip);
        const rThigh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.3, 0.5), this.capraSkinMat);
        rThigh.position.y = -0.65;
        rightHip.add(rThigh);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.5, -0.9, 0);
        torso.add(leftHip);
        const lThigh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.3, 0.5), this.capraSkinMat);
        lThigh.position.y = -0.65;
        leftHip.add(lThigh);

        root.position.set(x, 0, z);

        root.userData = {
            bodyGroup,
            torso,
            headGroup,
            rightShoulder,
            leftShoulder,
            rightHip,
            leftHip,
            rHand,
            lHand,
            rMachete,
            lMachete
        };

        this.scene.add(root);
        return root;
    }

    createDemonMacheteMesh() {
        const group = new THREE.Group();
        // Handle
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6), this.leatherMat);
        handle.position.y = 0.2;
        group.add(handle);

        // Massive Jagged Cleaver Blade
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.6, 0.12), this.capraMacheteMat);
        blade.position.set(0, 1.8, 0);
        blade.castShadow = true;
        group.add(blade);

        // Jagged tip spike
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.6, 4), this.capraMacheteMat);
        tip.position.set(0, 3.3, 0);
        group.add(tip);

        return group;
    }

    // ----------------------------------------------------
    // CREATE BOSS 4: GREAT GREY WOLF SIF (Darkroot Garden)
    // Colossal silver wolf wielding Artorias's Greatsword horizontally in jaws
    // ----------------------------------------------------
    createWolfSif(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.6;
        root.add(bodyGroup);

        // 1. Long Muscular Wolf Body
        const chest = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 2.6), this.wolfFurMat);
        chest.castShadow = true;
        bodyGroup.add(chest);

        const underbelly = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 2.4), this.wolfUnderbellyMat);
        underbelly.position.y = -0.85;
        chest.add(underbelly);

        // Fluffy Wolf Neck & Mane
        const mane = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.8, 6), this.wolfFurMat);
        mane.rotation.x = -Math.PI / 3;
        mane.position.set(0, 0.7, 1.2);
        bodyGroup.add(mane);

        // 2. Wolf Head
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.2, 2.2);
        bodyGroup.add(headGroup);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 1.2), this.wolfFurMat);
        head.castShadow = true;
        headGroup.add(head);

        // Snout & Jaws
        const snout = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 1.0), this.wolfUnderbellyMat);
        snout.position.set(0, -0.2, 0.9);
        headGroup.add(snout);

        // Nose
        const nose = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.16), this.demonHornMat);
        nose.position.set(0, -0.1, 1.4);
        headGroup.add(nose);

        // Pointed Wolf Ears
        const earL = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.6, 4), this.wolfFurMat);
        earL.position.set(-0.4, 0.65, -0.1);
        earL.rotation.z = Math.PI / 12;
        headGroup.add(earL);

        const earR = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.6, 4), this.wolfFurMat);
        earR.position.set(0.4, 0.65, -0.1);
        earR.rotation.z = -Math.PI / 12;
        headGroup.add(earR);

        // Glowing Blue Noble Eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x66bbff });
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.1), eyeMat);
        eyeL.position.set(-0.3, 0.15, 0.65);
        headGroup.add(eyeL);
        const eyeR = eyeL.clone();
        eyeR.position.x = 0.3;
        headGroup.add(eyeR);

        // 3. Artorias's Greatsword held in Jaws!
        const swordGroup = new THREE.Group();
        swordGroup.position.set(0, -0.25, 1.1); // In mouth
        headGroup.add(swordGroup);

        // Sword Hilt gripped in teeth
        const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8), this.darkSteelMat);
        hilt.rotation.z = Math.PI / 2;
        swordGroup.add(hilt);

        // Crossguard
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.35, 0.9), this.goldTrimMat);
        guard.position.set(-0.5, 0, 0);
        swordGroup.add(guard);

        // Colossal Shining Silver-Blue Blade
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 4.4), this.artoriasBladeMat);
        blade.position.set(0, 0, 2.3);
        blade.castShadow = true;
        swordGroup.add(blade);

        // Glowing Abyss Blue Aura Light
        const swordGlow = new THREE.PointLight(0x3399ff, 1.8, 8);
        swordGlow.position.set(0, 0, 2.5);
        swordGroup.add(swordGlow);

        // 4. Bushy Silver Tail
        const tailGroup = new THREE.Group();
        tailGroup.position.set(0, 0.3, -1.4);
        bodyGroup.add(tailGroup);
        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.35, 2.0, 6), this.wolfFurMat);
        tail.rotation.x = -Math.PI / 3;
        tail.position.set(0, -0.5, -0.8);
        tailGroup.add(tail);

        // 5. Four Muscular Legs
        const legGeo = new THREE.BoxGeometry(0.45, 1.6, 0.45);
        const frontLeft = new THREE.Group();
        frontLeft.position.set(-0.85, -0.2, 1.0);
        bodyGroup.add(frontLeft);
        const flMesh = new THREE.Mesh(legGeo, this.wolfFurMat);
        flMesh.position.y = -0.7;
        frontLeft.add(flMesh);

        const frontRight = new THREE.Group();
        frontRight.position.set(0.85, -0.2, 1.0);
        bodyGroup.add(frontRight);
        const frMesh = new THREE.Mesh(legGeo, this.wolfFurMat);
        frMesh.position.y = -0.7;
        frontRight.add(frMesh);

        const rearLeft = new THREE.Group();
        rearLeft.position.set(-0.85, -0.2, -1.0);
        bodyGroup.add(rearLeft);
        const rlMesh = new THREE.Mesh(legGeo, this.wolfFurMat);
        rlMesh.position.y = -0.7;
        rearLeft.add(rlMesh);

        const rearRight = new THREE.Group();
        rearRight.position.set(0.85, -0.2, -1.0);
        bodyGroup.add(rearRight);
        const rrMesh = new THREE.Mesh(legGeo, this.wolfFurMat);
        rrMesh.position.y = -0.7;
        rearRight.add(rrMesh);

        root.position.set(x, 0, z);

        root.userData = {
            bodyGroup,
            chest,
            headGroup,
            swordGroup,
            swordGlow,
            tailGroup,
            frontLeft,
            frontRight,
            rearLeft,
            rearRight
        };

        this.scene.add(root);
        return root;
    }

    // ----------------------------------------------------
    // CREATE BOSS 5: GWYN, LORD OF CINDER (Kiln of the First Flame)
    // The Sun Lord with radiant Golden Crown and Flaming Sunlight Greatsword
    // ----------------------------------------------------
    createGwynLordOfCinder(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.0;
        root.add(bodyGroup);

        // 1. Tall Regal Warrior Torso & Charred Robes
        const torsoGeo = new THREE.BoxGeometry(1.3, 1.8, 0.9);
        const torso = new THREE.Mesh(torsoGeo, this.gwynRobeMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Royal Golden Chest Medallion & Sun Emblem
        const medallion = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.1, 12), this.gwynCrownMat);
        medallion.rotation.x = Math.PI / 2;
        medallion.position.set(0, 0.4, 0.5);
        torso.add(medallion);

        // Tattered Flowing Robe Skirt
        const robeSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 1.1, 1.6, 8), this.gwynRobeMat);
        robeSkirt.position.y = -1.2;
        bodyGroup.add(robeSkirt);

        // 2. Lord Gwyn's Regal Head with Golden Sun Crown
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.35, 0);
        torso.add(headGroup);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.7), this.hollowSkinMat);
        head.castShadow = true;
        headGroup.add(head);

        // Flowing White-Grey Beard
        const beard = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.9, 5), this.gwynHairMat);
        beard.position.set(0, -0.45, 0.35);
        beard.rotation.x = Math.PI / 6;
        headGroup.add(beard);

        // Flowing White Hair
        const hair = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.8, 0.5), this.gwynHairMat);
        hair.position.set(0, 0.1, -0.3);
        headGroup.add(hair);

        // Spiked Golden Crown of Sunlight
        const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.18, 12), this.gwynCrownMat);
        crownBase.position.y = 0.48;
        headGroup.add(crownBase);

        // 7 Tall Sunlight Spikes around Crown
        for (let i = 0; i < 7; i++) {
            const angle = (i / 7) * Math.PI * 2;
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.5, 4), this.gwynCrownMat);
            spike.position.set(Math.sin(angle) * 0.4, 0.75, Math.cos(angle) * 0.4);
            headGroup.add(spike);
        }

        // Hollow Ash Eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff8822 });
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08), eyeMat);
        eyeL.position.set(-0.18, 0.08, 0.36);
        headGroup.add(eyeL);
        const eyeR = eyeL.clone();
        eyeR.position.x = 0.18;
        headGroup.add(eyeR);

        // 3. Right Arm with Flaming Sunlight Greatsword
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.95, 0.75, 0);
        torso.add(rightShoulder);

        const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.1, 0.42), this.gwynRobeMat);
        rArm.position.y = -0.55;
        rightShoulder.add(rArm);

        const rHand = new THREE.Group();
        rHand.position.y = -1.15;
        rightShoulder.add(rHand);

        // Greatsword of Gwyn
        const swordGroup = new THREE.Group();
        const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.0, 8), this.darkSteelMat);
        hilt.position.y = 0.2;
        swordGroup.add(hilt);

        const guard = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.18, 0.22), this.gwynCrownMat);
        guard.position.y = 0.7;
        swordGroup.add(guard);

        // Flaming Sunlight Blade
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.28, 3.4, 0.08), this.sunlightGreatswordMat);
        blade.position.y = 2.4;
        blade.castShadow = true;
        swordGroup.add(blade);

        // Dynamic Radiant Fire Light
        const weaponFlame = new THREE.PointLight(0xff7700, 3.5, 14);
        weaponFlame.position.set(0, 2.4, 0);
        swordGroup.add(weaponFlame);

        swordGroup.rotation.x = Math.PI / 3.6;
        rHand.add(swordGroup);

        // 4. Left Arm (Gwyn Grab / Thrust Arm)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.95, 0.75, 0);
        torso.add(leftShoulder);

        const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.1, 0.42), this.gwynRobeMat);
        lArm.position.y = -0.55;
        leftShoulder.add(lArm);

        // 5. Legs under Robes
        const rightHip = new THREE.Group();
        rightHip.position.set(0.4, -0.9, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.3, 0.45), this.steelMat);
        rLeg.position.y = -0.65;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.4, -0.9, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.3, 0.45), this.steelMat);
        lLeg.position.y = -0.65;
        leftHip.add(lLeg);

        root.position.set(x, 0, z);

        root.userData = {
            bodyGroup,
            torso,
            headGroup,
            rightShoulder,
            leftShoulder,
            rightHip,
            leftHip,
            weaponGroup: swordGroup,
            weaponFlame
        };

        this.scene.add(root);
        return root;
    }
}
