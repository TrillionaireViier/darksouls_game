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
}
