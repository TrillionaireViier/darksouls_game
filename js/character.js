// ==========================================
// DARK SOULS 3D PROCEDURAL CHARACTERS & ANIMATIONS
// Player (Chosen Undead Knight), Hollows, Black Knight, Taurus Demon Boss
// ==========================================

const COSTUMES = {
    warrior: {
        id: 'warrior',
        name: 'NORTHERN WARRIOR',
        title: 'Hardened Barbarian Wanderer &bull; Fur Mantle & Heavy Quilted Gambeson',
        icon: '🛡️',
        desc: 'Traditional Lordran wanderer equipped with kettle helm, fur-draped pauldrons, quilted tassets, and reinforced greaves.',
        perk: 'Balanced Veteran: Base 100% Defense, 100% Stamina Regen',
        perkData: { defMultiplier: 1.0, stamMultiplier: 1.0, speedMultiplier: 1.0, dmgBonus: 1.0, poiseBonus: 0 }
    },
    elite_knight: {
        id: 'elite_knight',
        name: 'ELITE KNIGHT OF ASTORA',
        title: 'Oscar of Astora &bull; Royal Fluted Steel Armet & Heraldic Surcoat',
        icon: '⚔️',
        desc: 'Armor of a nameless knight said to have journeyed from Astora. High-polished steel plate with royal blue embroidered cross.',
        perk: 'Astora Steel: +18% Physical Defense, +15% Poise Stagger Resistance',
        perkData: { defMultiplier: 1.18, stamMultiplier: 0.95, speedMultiplier: 1.0, dmgBonus: 1.0, poiseBonus: 15 }
    },
    black_knight: {
        id: 'black_knight',
        name: 'BLACK KNIGHT OF GWYN',
        title: 'Soot-Stained Charred Dark Iron &bull; Dual Horned Crests & Smoldering Lava',
        icon: '🔥',
        desc: 'Armor of the Black Knights who burned to ash in the Kiln of the First Flame. Jagged horns and veins of molten ember.',
        perk: 'Charred Flame: +20% Fire/Dark Power, +15% Weapon Attack Damage',
        perkData: { defMultiplier: 1.12, stamMultiplier: 0.92, speedMultiplier: 0.98, dmgBonus: 1.15, poiseBonus: 20 }
    },
    shinobi: {
        id: 'shinobi',
        name: 'SHINOBI OF THE EAST',
        title: 'Shadow Assassin of the Far East &bull; Midnight Cowl & Demon Oni Mask',
        icon: '🥷',
        desc: 'Woven garb of eastern assassins. Lightweight midnight silk, demon oni war mask, and articulated rope tabi sandals.',
        perk: 'Shadow Agility: +22% Movement & Sprint Speed, +30% Roll Distance, -20% Stamina Cost',
        perkData: { defMultiplier: 0.88, stamMultiplier: 1.25, speedMultiplier: 1.22, dmgBonus: 1.08, poiseBonus: -5 }
    },
    solaire: {
        id: 'solaire',
        name: 'SOLAIRE OF ASTORA',
        title: 'Warrior of Sunlight &bull; Iconic Smiling Holy Sun Tunic & Radiant Sunlight Aura',
        icon: '☀️',
        desc: 'The sacred holy vestments of Solaire of Astora! Features the brilliant hand-painted smiling Holy Sun and golden aura.',
        perk: 'Praise The Sun: Holy Radiant Aura, +25% Estus Flask Healing, +15% Miracle/Fire Damage',
        perkData: { defMultiplier: 1.10, stamMultiplier: 1.10, speedMultiplier: 1.05, healBonus: 1.25, dmgBonus: 1.12, poiseBonus: 10 }
    },
    onion_knight: {
        id: 'onion_knight',
        name: 'SIEGMEYER OF CATARINA',
        title: 'Jovial Knight of Catarina &bull; Rotund Bulbous Onion Armor & Ivory Enamel',
        icon: '🧅',
        desc: 'Distinctive spherical armor forged by the smiths of Catarina. Superb deflection against slashing blows and high poise.',
        perk: 'Catarina Bulk: +50% Heavy Poise (Immune to light staggers), +25% Physical Defense',
        perkData: { defMultiplier: 1.25, stamMultiplier: 0.85, speedMultiplier: 0.90, dmgBonus: 1.0, poiseBonus: 50 }
    }
};
window.COSTUMES = COSTUMES;

class DarkSoulsCharacters {
    constructor(scene) {
        this.scene = scene;
        this.initMaterials();
    }

    initMaterials() {
        // ==========================================
        // HD CHARACTER MOD TEXTURES & PROCEDURAL ASSETS
        // ==========================================

        // 1. ELITE KNIGHT CREST SHIELD TEXTURE (512x512)
        const shieldCanvas = document.createElement('canvas');
        shieldCanvas.width = 512;
        shieldCanvas.height = 512;
        const sCtx = shieldCanvas.getContext('2d');

        // Astora deep steel-blue field
        const bgGrad = sCtx.createRadialGradient(256, 256, 40, 256, 256, 280);
        bgGrad.addColorStop(0, '#1c2e44');
        bgGrad.addColorStop(1, '#0e1824');
        sCtx.fillStyle = bgGrad;
        sCtx.fillRect(0, 0, 512, 512);

        // Golden rim border
        sCtx.strokeStyle = '#d4af37';
        sCtx.lineWidth = 20;
        sCtx.strokeRect(10, 10, 492, 492);
        sCtx.strokeStyle = '#7c5a1a';
        sCtx.lineWidth = 4;
        sCtx.strokeRect(22, 22, 468, 468);

        // Golden corner cornerpieces & rivets
        const corners = [[20, 20], [492, 20], [20, 492], [492, 492]];
        corners.forEach(([cx, cy]) => {
            sCtx.fillStyle = '#f0c850';
            sCtx.beginPath();
            sCtx.arc(cx, cy, 10, 0, Math.PI * 2);
            sCtx.fill();
            sCtx.fillStyle = '#614810';
            sCtx.beginPath();
            sCtx.arc(cx - 2, cy - 2, 4, 0, Math.PI * 2);
            sCtx.fill();
        });

        // Silver Heraldic Falcon & Sacred Cross of Astora
        sCtx.fillStyle = '#e8ecf0';
        sCtx.beginPath();
        // Cross vertical beam
        sCtx.fillRect(236, 60, 40, 392);
        // Cross horizontal bar
        sCtx.fillRect(130, 160, 252, 38);
        // Central diamond crest
        sCtx.fillStyle = '#ffd700';
        sCtx.beginPath();
        sCtx.moveTo(256, 140);
        sCtx.lineTo(290, 179);
        sCtx.lineTo(256, 218);
        sCtx.lineTo(222, 179);
        sCtx.closePath();
        sCtx.fill();

        // Falcon wing heraldic flourishes
        sCtx.strokeStyle = '#c8d4e2';
        sCtx.lineWidth = 6;
        sCtx.beginPath();
        sCtx.arc(200, 240, 45, Math.PI * 0.2, Math.PI * 0.9);
        sCtx.stroke();
        sCtx.beginPath();
        sCtx.arc(312, 240, 45, Math.PI * 0.1, Math.PI * 0.8, true);
        sCtx.stroke();

        // Battle cuts & micro-scratches
        for (let i = 0; i < 45; i++) {
            const x1 = 40 + Math.random() * 432;
            const y1 = 40 + Math.random() * 432;
            const len = 15 + Math.random() * 35;
            const angle = Math.random() * Math.PI;
            sCtx.strokeStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.45)';
            sCtx.lineWidth = 1.2;
            sCtx.beginPath();
            sCtx.moveTo(x1, y1);
            sCtx.lineTo(x1 + Math.cos(angle) * len, y1 + Math.sin(angle) * len);
            sCtx.stroke();
        }

        const shieldTex = new THREE.CanvasTexture(shieldCanvas);

        this.crestShieldMat = new THREE.MeshStandardMaterial({
            map: shieldTex,
            metalness: 0.82,
            roughness: 0.32
        });

        // 2. BRUSHED FLUTED STEEL ARMOR (512x512)
        const armorCanvas = document.createElement('canvas');
        armorCanvas.width = 512;
        armorCanvas.height = 512;
        const aCtx = armorCanvas.getContext('2d');
        aCtx.fillStyle = '#828a92';
        aCtx.fillRect(0, 0, 512, 512);

        // Fluted plate ridges
        for (let y = 0; y < 512; y += 16) {
            aCtx.fillStyle = 'rgba(255, 255, 255, 0.14)';
            aCtx.fillRect(0, y, 512, 3);
            aCtx.fillStyle = 'rgba(0, 0, 0, 0.22)';
            aCtx.fillRect(0, y + 10, 512, 3);
        }
        // Micro-hairline scratches
        for (let i = 0; i < 400; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const l = 6 + Math.random() * 18;
            aCtx.strokeStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.25)';
            aCtx.lineWidth = 1;
            aCtx.beginPath();
            aCtx.moveTo(x, y);
            aCtx.lineTo(x + l, y);
            aCtx.stroke();
        }
        const armorTex = new THREE.CanvasTexture(armorCanvas);

        this.steelMat = new THREE.MeshStandardMaterial({
            map: armorTex,
            color: 0xd8e2ec, // Bright polished Astora steel
            metalness: 0.85,
            roughness: 0.24
        });

        this.darkSteelMat = new THREE.MeshStandardMaterial({
            map: armorTex,
            color: 0x828c98, // Polished dark steel
            metalness: 0.88,
            roughness: 0.3
        });

        this.clothMat = new THREE.MeshStandardMaterial({
            color: 0x245484, // Radiant Astora royal blue
            roughness: 0.82
        });

        this.leatherMat = new THREE.MeshStandardMaterial({
            color: 0x6e4e3a, // Saddle brown leather
            roughness: 0.72
        });

        this.goldTrimMat = new THREE.MeshStandardMaterial({
            color: 0xd4a84e,
            metalness: 0.88,
            roughness: 0.28
        });

        // Diamond-quilted gambeson skirt texture (faithful to medieval warrior sculpt)
        const quiltCanvas = document.createElement('canvas');
        quiltCanvas.width = 256;
        quiltCanvas.height = 256;
        const qCtx = quiltCanvas.getContext('2d');
        qCtx.fillStyle = '#282d33';
        qCtx.fillRect(0, 0, 256, 256);
        qCtx.strokeStyle = '#444d56';
        qCtx.lineWidth = 3;
        const qStep = 32;
        for (let i = -256; i < 512; i += qStep) {
            qCtx.beginPath();
            qCtx.moveTo(i, 0);
            qCtx.lineTo(i + 256, 256);
            qCtx.stroke();
            qCtx.beginPath();
            qCtx.moveTo(i, 256);
            qCtx.lineTo(i + 256, 0);
            qCtx.stroke();
        }
        for (let qx = 0; qx < 256; qx += qStep) {
            for (let qy = 0; qy < 256; qy += qStep) {
                qCtx.fillStyle = 'rgba(255, 255, 255, 0.09)';
                qCtx.beginPath();
                qCtx.arc(qx + qStep / 2, qy + qStep / 2, 3, 0, Math.PI * 2);
                qCtx.fill();
            }
        }
        const quiltTex = new THREE.CanvasTexture(quiltCanvas);
        quiltTex.wrapS = THREE.RepeatWrapping;
        quiltTex.wrapT = THREE.RepeatWrapping;
        quiltTex.repeat.set(2, 2);
        this.quiltedSkirtMat = new THREE.MeshStandardMaterial({
            map: quiltTex,
            roughness: 0.82
        });

        // Weathered wolf pelt / chainmail shoulder mantle
        const furCanvas = document.createElement('canvas');
        furCanvas.width = 256;
        furCanvas.height = 256;
        const fCtx = furCanvas.getContext('2d');
        fCtx.fillStyle = '#34302c';
        fCtx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 700; i++) {
            const fx = Math.random() * 256;
            const fy = Math.random() * 256;
            fCtx.fillStyle = Math.random() > 0.5 ? '#4e4740' : '#201e1b';
            fCtx.fillRect(fx, fy, 2, 4 + Math.random() * 6);
        }
        const furTex = new THREE.CanvasTexture(furCanvas);
        this.furMantleMat = new THREE.MeshStandardMaterial({
            map: furTex,
            roughness: 0.94
        });

        // Dark oiled leather scabbard and cross bindings
        this.scabbardMat = new THREE.MeshStandardMaterial({
            color: 0x3a281c,
            roughness: 0.65,
            metalness: 0.12
        });
        this.scabbardWrapMat = new THREE.MeshStandardMaterial({
            color: 0x7c583e,
            roughness: 0.78
        });
        this.steelBuckleMat = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.95,
            roughness: 0.2
        });

        // 3. POLISHED BLADE STEEL WITH BLOOD FULLER
        const bladeCanvas = document.createElement('canvas');
        bladeCanvas.width = 128;
        bladeCanvas.height = 512;
        const bCtx = bladeCanvas.getContext('2d');
        const bGrad = bCtx.createLinearGradient(0, 0, 128, 0);
        bGrad.addColorStop(0, '#f0f4f8');
        bGrad.addColorStop(0.44, '#ffffff');
        bGrad.addColorStop(0.5, '#4a5058'); // Central fuller depression
        bGrad.addColorStop(0.56, '#ffffff');
        bGrad.addColorStop(1, '#d8e0e8');
        bCtx.fillStyle = bGrad;
        bCtx.fillRect(0, 0, 128, 512);

        const bladeTex = new THREE.CanvasTexture(bladeCanvas);
        this.bladeMat = new THREE.MeshStandardMaterial({
            map: bladeTex,
            metalness: 0.96,
            roughness: 0.14
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

        // 4. TAURUS DEMON OBSIDIAN HIDE & LAVA CRACKS
        const lavaCanvas = document.createElement('canvas');
        lavaCanvas.width = 256;
        lavaCanvas.height = 256;
        const lCtx = lavaCanvas.getContext('2d');
        lCtx.fillStyle = '#1c1514';
        lCtx.fillRect(0, 0, 256, 256);
        // Molten veins
        lCtx.strokeStyle = '#ff4400';
        lCtx.lineWidth = 3;
        for (let i = 0; i < 14; i++) {
            lCtx.beginPath();
            lCtx.moveTo(Math.random() * 256, Math.random() * 256);
            lCtx.lineTo(Math.random() * 256, Math.random() * 256);
            lCtx.stroke();
        }
        const lavaTex = new THREE.CanvasTexture(lavaCanvas);

        this.demonFleshMat = new THREE.MeshStandardMaterial({
            map: lavaTex,
            color: 0x241c1a,
            roughness: 0.82,
            metalness: 0.25
        });
        this.demonHornMat = new THREE.MeshStandardMaterial({
            color: 0x110d0b,
            roughness: 0.55,
            metalness: 0.35
        });
        this.demonLavaMat = new THREE.MeshStandardMaterial({
            color: 0xff3b00,
            emissive: 0xff4400,
            emissiveIntensity: 1.1,
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
        // 1. Bell Gargoyle Materials (Ancient Verdigris Stone & Bronze)
        this.gargoyleStoneMat = new THREE.MeshStandardMaterial({
            color: 0x4a5048,
            roughness: 0.85,
            metalness: 0.25
        });
        this.bronzeHalberdMat = new THREE.MeshStandardMaterial({
            color: 0xaa743c,
            metalness: 0.88,
            roughness: 0.32
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
            color: 0xd8d0bc,
            roughness: 0.72,
            metalness: 0.12
        });
        this.capraMacheteMat = new THREE.MeshStandardMaterial({
            color: 0x2e2c2a,
            metalness: 0.88,
            roughness: 0.38
        });

        // 3. Great Grey Wolf Sif Materials (Pelt & Artorias Blade)
        this.wolfFurMat = new THREE.MeshStandardMaterial({
            color: 0x88929e,
            roughness: 0.95
        });
        this.wolfUnderbellyMat = new THREE.MeshStandardMaterial({
            color: 0xd8e0ea,
            roughness: 0.95
        });
        this.artoriasBladeMat = new THREE.MeshStandardMaterial({
            color: 0x90c0f0,
            emissive: 0x224488,
            emissiveIntensity: 0.3,
            metalness: 0.95,
            roughness: 0.16
        });

        // 4. Gwyn Lord of Cinder Materials (Sunlight Flame)
        this.gwynRobeMat = new THREE.MeshStandardMaterial({
            color: 0x2e2824,
            roughness: 0.92
        });
        this.gwynCrownMat = new THREE.MeshStandardMaterial({
            color: 0xecbf44,
            metalness: 0.92,
            roughness: 0.22
        });
        this.sunlightGreatswordMat = new THREE.MeshStandardMaterial({
            color: 0xffaa22,
            emissive: 0xff5500,
            emissiveIntensity: 1.6,
            metalness: 0.75,
            roughness: 0.25
        });
        this.gwynHairMat = new THREE.MeshStandardMaterial({
            color: 0xdedee4,
            roughness: 0.9
        });

        // ----------------------------------------------------
        // ARSENAL WEAPON MATERIALS
        // ----------------------------------------------------
        this.moonlightMat = new THREE.MeshStandardMaterial({
            color: 0x55eeff,
            emissive: 0x00aacc,
            emissiveIntensity: 1.5,
            roughness: 0.12,
            metalness: 0.35,
            transparent: true,
            opacity: 0.92
        });

        this.dragonToothMat = new THREE.MeshStandardMaterial({
            color: 0xd8ceb8,
            roughness: 0.82,
            metalness: 0.1
        });

        this.katanaBladeMat = new THREE.MeshStandardMaterial({
            color: 0xf5f8fc,
            metalness: 0.97,
            roughness: 0.12
        });

        this.halberdShaftMat = new THREE.MeshStandardMaterial({
            color: 0x1c1916,
            roughness: 0.78,
            metalness: 0.25
        });

        // ----------------------------------------------------
        // TORCH MATERIALS (MEDIEVAL WOOD & PITCH WRAPPING)
        // ----------------------------------------------------
        this.woodTorchMat = new THREE.MeshStandardMaterial({
            color: 0x3d2716,
            roughness: 0.88
        });
        this.pitchWrapMat = new THREE.MeshStandardMaterial({
            color: 0x17110c,
            roughness: 0.95,
            metalness: 0.05
        });

        // ====================================================
        // 3D COSTUMES & SKINS MATERIALS (6 ICONIC ARMOR SETS)
        // ====================================================

        // 1. ELITE KNIGHT OF ASTORA
        this.eliteSteelMat = new THREE.MeshStandardMaterial({
            color: 0xdde4ec,
            metalness: 0.88,
            roughness: 0.22
        });
        this.astoraBlueClothMat = new THREE.MeshStandardMaterial({
            color: 0x1c3b66,
            roughness: 0.82
        });

        // 2. BLACK KNIGHT OF GWYN (Soot-stained charred obsidian & smoldering embers)
        const bkCanvas = document.createElement('canvas');
        bkCanvas.width = 256;
        bkCanvas.height = 256;
        const bkCtx = bkCanvas.getContext('2d');
        bkCtx.fillStyle = '#141416';
        bkCtx.fillRect(0, 0, 256, 256);
        // Ember fissures
        for (let i = 0; i < 25; i++) {
            bkCtx.strokeStyle = Math.random() > 0.4 ? 'rgba(255, 60, 0, 0.45)' : 'rgba(20, 20, 22, 0.8)';
            bkCtx.lineWidth = 1 + Math.random() * 2;
            bkCtx.beginPath();
            const bx = Math.random() * 256;
            const by = Math.random() * 256;
            bkCtx.moveTo(bx, by);
            bkCtx.lineTo(bx + (Math.random() - 0.5) * 40, by + (Math.random() - 0.5) * 40);
            bkCtx.stroke();
        }
        const bkTex = new THREE.CanvasTexture(bkCanvas);

        this.blackKnightMat = new THREE.MeshStandardMaterial({
            map: bkTex,
            color: 0x18181c,
            metalness: 0.88,
            roughness: 0.55
        });
        this.blackKnightHornMat = new THREE.MeshStandardMaterial({
            color: 0x221f1d,
            roughness: 0.72,
            metalness: 0.4
        });
        this.emberGlowMat = new THREE.MeshStandardMaterial({
            color: 0xff3b00,
            emissive: 0xff4400,
            emissiveIntensity: 1.4,
            roughness: 0.3
        });

        // 3. SHINOBI OF THE EAST (Midnight ninja silk & Oni demon mask)
        this.shinobiClothMat = new THREE.MeshStandardMaterial({
            color: 0x11131c,
            roughness: 0.92
        });
        this.shinobiMaskMat = new THREE.MeshStandardMaterial({
            color: 0xded8cc,
            roughness: 0.42,
            metalness: 0.2
        });
        this.shinobiRopeMat = new THREE.MeshStandardMaterial({
            color: 0x991818,
            roughness: 0.82
        });

        // 4. SOLAIRE OF ASTORA (Warrior of Sunlight - Iconic Smiling Holy Sun)
        const sunCanvas = document.createElement('canvas');
        sunCanvas.width = 512;
        sunCanvas.height = 512;
        const sunCtx = sunCanvas.getContext('2d');
        // Off-white canvas cloth
        sunCtx.fillStyle = '#f4f2ea';
        sunCtx.fillRect(0, 0, 512, 512);

        // Radiant sunlight golden rays
        sunCtx.save();
        sunCtx.translate(256, 256);
        for (let a = 0; a < 16; a++) {
            sunCtx.rotate(Math.PI / 8);
            sunCtx.fillStyle = a % 2 === 0 ? '#ffb300' : '#ffa000';
            sunCtx.beginPath();
            sunCtx.moveTo(-16, -110);
            sunCtx.lineTo(0, -195);
            sunCtx.lineTo(16, -110);
            sunCtx.closePath();
            sunCtx.fill();
        }
        sunCtx.restore();

        // Central bright sun circle
        sunCtx.beginPath();
        sunCtx.arc(256, 256, 105, 0, Math.PI * 2);
        sunCtx.fillStyle = '#ffc107';
        sunCtx.fill();
        sunCtx.lineWidth = 10;
        sunCtx.strokeStyle = '#d84315';
        sunCtx.stroke();

        // Iconic Solaire Smiling Sun Face!
        // Eyes
        sunCtx.fillStyle = '#3e2723';
        sunCtx.beginPath();
        sunCtx.arc(220, 230, 10, 0, Math.PI * 2);
        sunCtx.arc(292, 230, 10, 0, Math.PI * 2);
        sunCtx.fill();

        // Cheerful Smiling Mouth Arc
        sunCtx.strokeStyle = '#b71c1c';
        sunCtx.lineWidth = 9;
        sunCtx.beginPath();
        sunCtx.arc(256, 260, 48, 0.15 * Math.PI, 0.85 * Math.PI);
        sunCtx.stroke();

        const sunTex = new THREE.CanvasTexture(sunCanvas);
        this.solaireTunicMat = new THREE.MeshStandardMaterial({
            map: sunTex,
            roughness: 0.85
        });
        this.solairePlumeMat = new THREE.MeshStandardMaterial({
            color: 0xc62828,
            roughness: 0.75
        });
        this.solaireChainmailMat = new THREE.MeshStandardMaterial({
            color: 0x90949c,
            metalness: 0.82,
            roughness: 0.42
        });

        // 5. SIEGMEYER OF CATARINA (Onion Knight - Rotund Ivory Enamel & Brass)
        this.onionPlateMat = new THREE.MeshStandardMaterial({
            color: 0xecf0f4,
            metalness: 0.76,
            roughness: 0.28
        });
        this.onionBrassMat = new THREE.MeshStandardMaterial({
            color: 0xc89b3c,
            metalness: 0.85,
            roughness: 0.32
        });

        // 6. CATACOMBS & SKELETON WARRIORS
        this.boneMat = new THREE.MeshStandardMaterial({
            color: 0xd8d0bf,
            roughness: 0.85,
            metalness: 0.05
        });
        this.rustIronMat = new THREE.MeshStandardMaterial({
            color: 0x2e2a28,
            roughness: 0.65,
            metalness: 0.72
        });

        // 7. GRAVELORD NITO (Cloak of the Dead & Miasma)
        this.nitoCloakMat = new THREE.MeshStandardMaterial({
            color: 0x08080a,
            roughness: 0.95
        });
        this.nitoBoneMat = new THREE.MeshStandardMaterial({
            color: 0xb5aa95,
            roughness: 0.82
        });
        this.nitoMaskMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.75,
            roughness: 0.35
        });
        this.nitoBladeMat = new THREE.MeshStandardMaterial({
            color: 0x111114,
            metalness: 0.85,
            roughness: 0.45
        });
        this.nitoMiasmaMat = new THREE.MeshStandardMaterial({
            color: 0x4a0a22,
            emissive: 0x240010,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.85
        });
    }

    // ----------------------------------------------------
    // ARSENAL WEAPON FACTORY (6 ICONIC WEAPONS)
    // ----------------------------------------------------
    createWeaponMesh(weaponId = 'sword') {
        const root = new THREE.Group();

        if (weaponId === 'zweihander') {
            // Colossal Ultra Greatsword
            const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.65, 8), this.leatherMat);
            hilt.position.y = -0.25;
            root.add(hilt);

            const pommel = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.025, 6, 12), this.darkSteelMat);
            pommel.position.y = -0.58;
            root.add(pommel);

            const guard = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, 0.1), this.darkSteelMat);
            guard.position.y = 0.08;
            root.add(guard);

            // Side Parrying Lugs (Parierhaken)
            const lugL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.04), this.darkSteelMat);
            lugL.position.set(-0.24, 0.55, 0);
            lugL.rotation.z = 0.3;
            root.add(lugL);
            const lugR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.04), this.darkSteelMat);
            lugR.position.set(0.24, 0.55, 0);
            lugR.rotation.z = -0.3;
            root.add(lugR);

            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.1, 0.04), this.bladeMat);
            blade.position.y = 1.15;
            blade.castShadow = true;
            root.add(blade);

            const tip = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.32, 4), this.bladeMat);
            tip.position.y = 2.36;
            tip.rotation.y = Math.PI / 4;
            root.add(tip);

        } else if (weaponId === 'uchigatana') {
            // Eastern Katana
            const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8), this.darkSteelMat);
            hilt.position.y = -0.2;
            root.add(hilt);

            const pommel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.04, 8), this.goldTrimMat);
            pommel.position.y = -0.42;
            root.add(pommel);

            const tsuba = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.025, 16), this.goldTrimMat);
            tsuba.position.y = 0.03;
            root.add(tsuba);

            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.065, 1.45, 0.02), this.katanaBladeMat);
            blade.position.set(0.04, 0.75, 0);
            blade.rotation.z = -0.04;
            blade.castShadow = true;
            root.add(blade);

            const tip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.18, 4), this.katanaBladeMat);
            tip.position.set(0.08, 1.55, 0);
            tip.rotation.z = -0.15;
            root.add(tip);

        } else if (weaponId === 'halberd') {
            // Black Knight Halberd
            const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.5, 8), this.halberdShaftMat);
            shaft.position.y = 0.6;
            root.add(shaft);

            const butt = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 6), this.darkSteelMat);
            butt.position.y = -0.75;
            butt.rotation.x = Math.PI;
            root.add(butt);

            const axeHead = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.55, 0.04), this.darkSteelMat);
            axeHead.position.set(0.24, 1.7, 0);
            axeHead.castShadow = true;
            root.add(axeHead);

            const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 4), this.darkSteelMat);
            beak.position.set(-0.2, 1.7, 0);
            beak.rotation.z = Math.PI / 2;
            root.add(beak);

            const spearSpike = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.6, 4), this.bladeMat);
            spearSpike.position.y = 2.15;
            root.add(spearSpike);

        } else if (weaponId === 'dragontooth') {
            // Colossal Dragon Tooth Greathammer
            const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8), this.darkSteelMat);
            hilt.position.y = -0.25;
            root.add(hilt);

            const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.9, 8), this.dragonToothMat);
            tooth.position.y = 0.95;
            tooth.castShadow = true;
            root.add(tooth);

            const band1 = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 6, 12), this.darkSteelMat);
            band1.position.y = 0.35;
            band1.rotation.x = Math.PI / 2;
            root.add(band1);

            const band2 = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 6, 12), this.darkSteelMat);
            band2.position.y = 0.75;
            band2.rotation.x = Math.PI / 2;
            root.add(band2);

        } else if (weaponId === 'moonlight') {
            // Moonlight Greatsword (Seath's Sorcery Blade)
            const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8), this.darkSteelMat);
            hilt.position.y = -0.15;
            root.add(hilt);

            const guard = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 0.1), this.moonlightMat);
            guard.position.y = 0.1;
            root.add(guard);

            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.7, 0.04), this.moonlightMat);
            blade.position.y = 0.98;
            blade.castShadow = true;
            root.add(blade);

            const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.28, 4), this.moonlightMat);
            tip.position.y = 1.96;
            tip.rotation.y = Math.PI / 4;
            root.add(tip);

            // Magical Ambient Aura Light
            const glowLight = new THREE.PointLight(0x00ccff, 2.0, 7, 1.5);
            glowLight.position.y = 1.0;
            root.add(glowLight);

        } else if (weaponId === 'torch') {
            // Pitch-Soaked Torch Weapon (Fire damage & darkness illumination)
            return this.createTorchMesh(true);

        } else {
            // Astora Straight Sword (Default)
            const guard = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.08), this.goldTrimMat);
            root.add(guard);
            const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25, 8), this.leatherMat);
            hilt.position.y = -0.14;
            root.add(hilt);
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.25, 0.03), this.bladeMat);
            blade.position.y = 0.68;
            blade.castShadow = true;
            root.add(blade);
            const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 4), this.bladeMat);
            tip.position.y = 1.38;
            tip.rotation.y = Math.PI / 4;
            root.add(tip);
        }

        root.userData = { weaponId };
        return root;
    }

    createTorchMesh(isWeapon = false) {
        const root = new THREE.Group();

        // 1. Hardwood Shaft
        const shaftGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.15, 8);
        const shaft = new THREE.Mesh(shaftGeo, this.woodTorchMat || this.leatherMat);
        shaft.position.y = 0.45;
        shaft.castShadow = true;
        root.add(shaft);

        // 2. Leather Wrapped Grip
        const gripGeo = new THREE.CylinderGeometry(0.044, 0.048, 0.28, 8);
        const grip = new THREE.Mesh(gripGeo, this.leatherMat);
        grip.position.y = 0.08;
        root.add(grip);

        // Pommel iron ring
        const pommelGeo = new THREE.TorusGeometry(0.045, 0.014, 6, 12);
        const pommel = new THREE.Mesh(pommelGeo, this.darkSteelMat);
        pommel.position.y = -0.06;
        pommel.rotation.x = Math.PI / 2;
        root.add(pommel);

        // 3. Pitch-Soaked Cloth Head
        const pitchGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.35, 10);
        const pitchHead = new THREE.Mesh(pitchGeo, this.pitchWrapMat);
        pitchHead.position.y = 0.95;
        pitchHead.castShadow = true;
        root.add(pitchHead);

        // Iron Binding Bands holding the cloth
        const band1 = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.014, 6, 12), this.darkSteelMat);
        band1.position.y = 0.83;
        band1.rotation.x = Math.PI / 2;
        root.add(band1);

        const band2 = new THREE.Mesh(new THREE.TorusGeometry(0.112, 0.014, 6, 12), this.darkSteelMat);
        band2.position.y = 1.05;
        band2.rotation.x = Math.PI / 2;
        root.add(band2);

        // 4. Burning Flame Core (Multi-layered emissive mesh)
        const flameGroup = new THREE.Group();
        flameGroup.position.y = 1.16;

        // White-hot inner core
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const coreMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.1), coreMat);
        flameGroup.add(coreMesh);

        // Amber-gold mid flame
        const midMat = new THREE.MeshStandardMaterial({
            color: 0xff8800,
            emissive: 0xff7700,
            emissiveIntensity: 2.8,
            roughness: 0.15
        });
        const midMesh = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.45, 8), midMat);
        midMesh.position.y = 0.14;
        flameGroup.add(midMesh);

        // Outer flickering orange flame tip
        const tipMat = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.85
        });
        const tipMesh = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.58, 8), tipMat);
        tipMesh.position.y = 0.22;
        flameGroup.add(tipMesh);

        // 5. Dynamic Warm PointLight
        const flameLight = new THREE.PointLight(0xff8833, 3.8, 28, 1.2);
        flameLight.position.y = 0.22;
        flameLight.castShadow = false;
        flameGroup.add(flameLight);

        // 6. Spark / Ember Particles
        const emberCount = 8;
        const emberGeo = new THREE.BufferGeometry();
        const emberPositions = new Float32Array(emberCount * 3);
        const emberOffsets = [];
        for (let i = 0; i < emberCount; i++) {
            emberPositions[i * 3 + 0] = (Math.random() - 0.5) * 0.22;
            emberPositions[i * 3 + 1] = Math.random() * 0.5;
            emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.22;
            emberOffsets.push({
                x: emberPositions[i * 3 + 0],
                speedY: 0.35 + Math.random() * 0.5,
                maxH: 0.75 + Math.random() * 0.5,
                seed: Math.random() * 10
            });
        }
        emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
        const emberMat = new THREE.PointsMaterial({
            color: 0xffaa22,
            size: 0.08,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });
        const emberPoints = new THREE.Points(emberGeo, emberMat);
        flameGroup.add(emberPoints);

        root.add(flameGroup);

        root.userData = {
            weaponId: 'torch',
            flameGroup,
            flameLight,
            coreMesh,
            midMesh,
            tipMesh,
            emberPoints,
            emberOffsets,
            isTorch: true
        };

        return root;
    }

    attachWeaponToPlayer(playerMesh, weaponId) {
        if (!playerMesh || !playerMesh.userData || !playerMesh.userData.rHand) return;
        const rHand = playerMesh.userData.rHand;

        while (rHand.children.length > 0) {
            rHand.remove(rHand.children[0]);
        }

        const newWeapon = this.createWeaponMesh(weaponId);
        // Realistic initial weapon rigging (refined further in game.js per weapon class)
        if (weaponId === 'halberd') {
            newWeapon.rotation.set(-0.25, 0.12, 0.18);
            newWeapon.position.set(-0.04, 0.12, -0.06);
        } else if (weaponId === 'dragontooth') {
            newWeapon.rotation.set(-0.45, 0.2, 0.15);
            newWeapon.position.set(-0.06, 0.18, -0.1);
        } else if (weaponId === 'torch') {
            newWeapon.rotation.set(0.08, 0, -0.08);
            newWeapon.position.set(0, 0.06, 0.04);
        } else {
            newWeapon.rotation.set(0.48, 0.14, -0.2);
            newWeapon.position.set(0.02, 0.04, 0.06);
        }
        rHand.add(newWeapon);

        playerMesh.userData.swordGroup = newWeapon;
        playerMesh.userData.currentWeaponId = weaponId;
    }

    // ----------------------------------------------------
    // CREATE PLAYER (CHOSEN UNDEAD SKELETAL RIG & WEAPONS)
    // ----------------------------------------------------
    createPlayer() {
        const root = new THREE.Group();

        // Base root offset so position represents feet on ground
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.0;
        root.add(bodyGroup);

        // 1. Torso / Pelvis Group (Parent for spine, shoulders, hips & head)
        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // 2. Head Group
        const headGroup = new THREE.Group();
        headGroup.position.y = 0.55;
        torso.add(headGroup);

        // 3. Right Arm (Weapon Arm)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.38, 0.25, 0);
        torso.add(rightShoulder);

        const rHand = new THREE.Group();
        rHand.position.y = -0.42;
        rightShoulder.add(rHand);

        const swordGroup = this.createWeaponMesh('sword');
        swordGroup.rotation.set(0.48, 0.14, -0.2);
        swordGroup.position.set(0.02, 0.04, 0.06);
        rHand.add(swordGroup);

        // 4. Left Arm (Shield & Offhand Arm)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.38, 0.25, 0);
        torso.add(leftShoulder);

        const lHand = new THREE.Group();
        lHand.position.y = -0.42;
        leftShoulder.add(lHand);

        const shieldGroup = new THREE.Group();
        const shieldPlate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.8, 0.06), this.crestShieldMat);
        shieldPlate.castShadow = true;
        shieldGroup.add(shieldPlate);

        // Shield crest stripe & heraldic cross
        const shieldStripe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.78, 0.07), this.clothMat);
        shieldGroup.add(shieldStripe);
        const shieldCross = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.08), this.goldTrimMat);
        shieldCross.position.y = 0.1;
        shieldGroup.add(shieldCross);

        // Forearm inner straps
        const strap1 = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.018, 6, 8), this.leatherMat);
        strap1.position.set(0, 0.15, -0.05);
        shieldGroup.add(strap1);
        const strap2 = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.018, 6, 8), this.leatherMat);
        strap2.position.set(0, -0.15, -0.05);
        shieldGroup.add(strap2);

        shieldGroup.position.set(-0.06, 0.08, 0.16);
        shieldGroup.rotation.set(0.08, Math.PI / 8, -0.05);
        lHand.add(shieldGroup);

        // Offhand Torch
        const offhandTorch = this.createTorchMesh(false);
        offhandTorch.position.set(0, 0.1, 0.15);
        offhandTorch.rotation.x = -0.2;
        offhandTorch.visible = false;
        lHand.add(offhandTorch);

        // Estus Flask (Holstered on hip)
        const estusFlask = new THREE.Group();
        const flaskHolster = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.075, 0.09, 8), this.leatherMat);
        flaskHolster.position.set(0, -0.02, 0);
        estusFlask.add(flaskHolster);

        const flaskVessel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.07, 0.15, 8),
            new THREE.MeshStandardMaterial({
                color: 0xd88015,
                emissive: 0x663300,
                emissiveIntensity: 0.45,
                roughness: 0.22,
                metalness: 0.15
            })
        );
        flaskVessel.castShadow = true;
        estusFlask.add(flaskVessel);

        const flaskNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.032, 0.05, 8), this.goldTrimMat);
        flaskNeck.position.y = 0.1;
        estusFlask.add(flaskNeck);

        const flaskCork = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.035, 6), this.leatherMat);
        flaskCork.position.y = 0.135;
        estusFlask.add(flaskCork);

        const flaskGlow = new THREE.PointLight(0xffaa22, 0.6, 2.0);
        flaskGlow.position.set(0, 0, 0);
        estusFlask.add(flaskGlow);

        estusFlask.position.set(-0.26, -0.25, -0.08);
        estusFlask.rotation.set(0.1, 0.15, -0.15);
        torso.add(estusFlask);

        // 5. Contoured Legs (Hips attached to Torso for unified kinetic motion)
        const rightHip = new THREE.Group();
        rightHip.position.set(0.18, -0.35, 0);
        torso.add(rightHip);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.18, -0.35, 0);
        torso.add(leftHip);

        // 6. Iconic Back-Mounted Greatsword with Leather Scabbard
        const backScabbardGroup = new THREE.Group();
        backScabbardGroup.position.set(-0.04, 0.08, -0.23);
        backScabbardGroup.rotation.set(-0.12, -0.06, 0.56);
        torso.add(backScabbardGroup);

        const scabbardBody = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.45, 0.05), this.scabbardMat);
        scabbardBody.position.y = -0.32;
        scabbardBody.castShadow = true;
        backScabbardGroup.add(scabbardBody);

        const scabbardThroat = new THREE.Mesh(new THREE.BoxGeometry(0.108, 0.08, 0.066), this.steelMat);
        scabbardThroat.position.y = 0.42;
        backScabbardGroup.add(scabbardThroat);

        const wrapLevels = [0.32, 0.16, 0.0, -0.16, -0.32, -0.48, -0.64, -0.82, -0.98];
        wrapLevels.forEach((wy, idx) => {
            const wrapBand = new THREE.Mesh(new THREE.BoxGeometry(0.096, 0.028, 0.056), this.scabbardWrapMat);
            wrapBand.position.y = wy;
            wrapBand.rotation.y = (idx % 2 === 0 ? 0.04 : -0.04);
            backScabbardGroup.add(wrapBand);

            const diagStrap = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.058), this.scabbardWrapMat);
            diagStrap.position.set(0, wy, 0);
            diagStrap.rotation.z = (idx % 2 === 0 ? 0.35 : -0.35);
            backScabbardGroup.add(diagStrap);
        });

        const chape = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.14, 4), this.steelMat);
        chape.position.y = -1.11;
        chape.rotation.x = Math.PI;
        chape.rotation.y = Math.PI / 4;
        backScabbardGroup.add(chape);

        const greatswordHiltGroup = new THREE.Group();
        greatswordHiltGroup.position.y = 0.46;
        backScabbardGroup.add(greatswordHiltGroup);

        const guardMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.048, 0.065), this.steelMat);
        guardMesh.castShadow = true;
        greatswordHiltGroup.add(guardMesh);

        const gripMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 0.38, 8), this.scabbardWrapMat);
        gripMesh.position.y = 0.21;
        greatswordHiltGroup.add(gripMesh);

        for (let gi = 0; gi < 5; gi++) {
            const cordRing = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.005, 4, 8), this.leatherMat);
            cordRing.position.y = 0.08 + gi * 0.065;
            cordRing.rotation.x = Math.PI / 2;
            greatswordHiltGroup.add(cordRing);
        }

        const ringPommel = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.015, 8, 16), this.steelMat);
        ringPommel.position.y = 0.45;
        ringPommel.castShadow = true;
        greatswordHiltGroup.add(ringPommel);

        const pommelSpoke = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.09, 0.016), this.steelMat);
        pommelSpoke.position.y = 0.45;
        greatswordHiltGroup.add(pommelSpoke);

        // Assign core animation nodes
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
            currentWeaponId: 'sword',
            shieldGroup,
            offhandTorch,
            estusFlask,
            backScabbardGroup,
            skinMeshes: [],
            currentSkin: 'warrior'
        };

        // Apply default skin
        this.applySkinToPlayer(root, 'warrior');

        this.scene.add(root);
        return root;
    }

    // ====================================================
    // 3D COSTUMES & SKINS APPLIER (HOT-SWAPPABLE 3D ARMOR)
    // ====================================================
    applySkinToPlayer(playerMesh, skinId = 'warrior') {
        if (!playerMesh || !playerMesh.userData) return;
        const u = playerMesh.userData;
        if (!u.skinMeshes) u.skinMeshes = [];

        // Remove previous skin meshes cleanly from their parents
        u.skinMeshes.forEach(mesh => {
            if (mesh && mesh.parent) {
                mesh.parent.remove(mesh);
            }
        });
        u.skinMeshes = [];

        const addPart = (parent, mesh) => {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            parent.add(mesh);
            u.skinMeshes.push(mesh);
            return mesh;
        };

        u.currentSkin = skinId;

        if (skinId === 'elite_knight') {
            // ------------------------------------------------
            // ELITE KNIGHT OF ASTORA (Oscar of Astora)
            // ------------------------------------------------
            // Helm: Fluted Armet with winged gold crests
            const helm = addPart(u.headGroup, new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.40, 0.38), this.eliteSteelMat));
            const visor = addPart(u.headGroup, new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: 0x66ccff })));
            visor.position.set(0, 0.02, 0.18);
            const crest = addPart(u.headGroup, new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.40), this.goldTrimMat));
            crest.position.set(0, 0.22, 0);
            const wingL = addPart(u.headGroup, new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.16), this.goldTrimMat));
            wingL.position.set(-0.19, 0.14, -0.06);
            wingL.rotation.z = -0.25;
            const wingR = addPart(u.headGroup, new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.16), this.goldTrimMat));
            wingR.position.set(0.19, 0.14, -0.06);
            wingR.rotation.z = 0.25;

            // Torso: Polished fluted plate & Astora blue embroidered cross tabard
            const chest = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.46, 0.34), this.eliteSteelMat));
            chest.position.y = 0.12;
            const ridge = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.44, 0.05), this.goldTrimMat));
            ridge.position.set(0, 0.12, 0.17);
            const tabard = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.64, 0.36), this.astoraBlueClothMat));
            tabard.position.y = 0.02;
            const crossH = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.02), this.goldTrimMat));
            crossH.position.set(0, 0.12, 0.185);
            const crossV = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.02), this.goldTrimMat));
            crossV.position.set(0, 0.08, 0.185);
            const waist = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.49, 0.24, 0.31), this.steelMat));
            waist.position.y = -0.16;
            const belt = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.07, 0.34), this.leatherMat));
            belt.position.y = -0.14;
            const buckle = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.03), this.goldTrimMat));
            buckle.position.set(0, -0.14, 0.175);

            // Surcoat / Skirt
            const skirtF = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.34, 0.06), this.astoraBlueClothMat));
            skirtF.position.set(0, -0.38, 0.15);
            skirtF.rotation.x = 0.12;
            const skirtB = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.34, 0.06), this.astoraBlueClothMat));
            skirtB.position.set(0, -0.38, -0.15);
            skirtB.rotation.x = -0.12;
            const skirtTrim = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 0.34), this.goldTrimMat));
            skirtTrim.position.y = -0.52;

            // Pauldrons & Arms
            const rPauld = addPart(u.rightShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.20, 0.28), this.eliteSteelMat));
            const rTrim = addPart(u.rightShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 0.30), this.goldTrimMat));
            rTrim.position.y = 0.08;
            const rArm = addPart(u.rightShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.38, 0.14), this.steelMat));
            rArm.position.y = -0.22;
            const rElbow = addPart(u.rightShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.11, 0.13), this.goldTrimMat));
            rElbow.position.set(0, -0.38, -0.02);

            const lPauld = addPart(u.leftShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.20, 0.28), this.eliteSteelMat));
            const lTrim = addPart(u.leftShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 0.30), this.goldTrimMat));
            lTrim.position.y = 0.08;
            const lArm = addPart(u.leftShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.38, 0.14), this.steelMat));
            lArm.position.y = -0.22;
            const lElbow = addPart(u.leftShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.11, 0.13), this.goldTrimMat));
            lElbow.position.set(0, -0.38, -0.02);

            // Legs: Articulated silver plate greaves & sabatons
            const rThigh = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.18), this.steelMat));
            rThigh.position.y = -0.16;
            const rKnee = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.11, 0.14), this.goldTrimMat));
            rKnee.position.set(0, -0.32, 0.06);
            const rShin = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.16), this.eliteSteelMat));
            rShin.position.y = -0.46;
            const rFoot = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.24), this.steelMat));
            rFoot.position.set(0, -0.62, 0.04);

            const lThigh = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.18), this.steelMat));
            lThigh.position.y = -0.16;
            const lKnee = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.11, 0.14), this.goldTrimMat));
            lKnee.position.set(0, -0.32, 0.06);
            const lShin = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.16), this.eliteSteelMat));
            lShin.position.y = -0.46;
            const lFoot = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.24), this.steelMat));
            lFoot.position.set(0, -0.62, 0.04);

        } else if (skinId === 'black_knight') {
            // ------------------------------------------------
            // BLACK KNIGHT OF GWYN (Charred Iron, Horns & Lava Embers)
            // ------------------------------------------------
            // Helm with dual demonic horns
            const helm = addPart(u.headGroup, new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.42, 0.39), this.blackKnightMat));
            const visor = addPart(u.headGroup, new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.05), this.emberGlowMat));
            visor.position.set(0, 0.02, 0.19);
            const hornL = addPart(u.headGroup, new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.32, 5), this.blackKnightHornMat));
            hornL.position.set(-0.20, 0.28, 0.05);
            hornL.rotation.set(-0.25, 0, -0.55);
            const hornR = addPart(u.headGroup, new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.32, 5), this.blackKnightHornMat));
            hornR.position.set(0.20, 0.28, 0.05);
            hornR.rotation.set(-0.25, 0, 0.55);

            // Torso: Obsidian charred plate with molten lava veins
            const chest = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.48, 0.36), this.blackKnightMat));
            chest.position.y = 0.12;
            const emberCore = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.04), this.emberGlowMat));
            emberCore.position.set(0, 0.12, 0.185);
            const waist = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.49, 0.24, 0.32), this.blackKnightMat));
            waist.position.y = -0.16;
            const cape = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.72, 0.04), this.blackKnightMat));
            cape.position.set(0, -0.14, -0.20);
            cape.rotation.x = -0.1;

            // Spiked Obsidian Pauldrons
            const rPauld = addPart(u.rightShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.28), this.blackKnightMat));
            const rSpike = addPart(u.rightShoulder, new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 4), this.blackKnightHornMat));
            rSpike.position.set(0.12, 0.14, 0);
            rSpike.rotation.z = -0.5;
            const rArm = addPart(u.rightShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.38, 0.14), this.blackKnightMat));
            rArm.position.y = -0.22;

            const lPauld = addPart(u.leftShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.28), this.blackKnightMat));
            const lSpike = addPart(u.leftShoulder, new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 4), this.blackKnightHornMat));
            lSpike.position.set(-0.12, 0.14, 0);
            lSpike.rotation.z = 0.5;
            const lArm = addPart(u.leftShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.38, 0.14), this.blackKnightMat));
            lArm.position.y = -0.22;

            // Skirt: Burnt chainmail
            const skirtF = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.32, 0.08), this.blackKnightMat));
            skirtF.position.set(0, -0.38, 0.15);
            skirtF.rotation.x = 0.12;

            // Legs: Spiked blackened iron greaves
            const rThigh = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.18), this.blackKnightMat));
            rThigh.position.y = -0.16;
            const rKneeSpike = addPart(u.rightHip, new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 4), this.blackKnightHornMat));
            rKneeSpike.position.set(0, -0.32, 0.11);
            rKneeSpike.rotation.x = Math.PI / 2;
            const rShin = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.16), this.blackKnightMat));
            rShin.position.y = -0.46;
            const rFoot = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.24), this.blackKnightMat));
            rFoot.position.set(0, -0.62, 0.04);

            const lThigh = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.18), this.blackKnightMat));
            lThigh.position.y = -0.16;
            const lKneeSpike = addPart(u.leftHip, new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 4), this.blackKnightHornMat));
            lKneeSpike.position.set(0, -0.32, 0.11);
            lKneeSpike.rotation.x = Math.PI / 2;
            const lShin = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.16), this.blackKnightMat));
            lShin.position.y = -0.46;
            const lFoot = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.24), this.blackKnightMat));
            lFoot.position.set(0, -0.62, 0.04);

        } else if (skinId === 'shinobi') {
            // ------------------------------------------------
            // SHINOBI OF THE EAST (Midnight Cowl & Demon Oni Mask)
            // ------------------------------------------------
            // Hood & Demon Oni Mask
            const cowl = addPart(u.headGroup, new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.36), this.shinobiClothMat));
            const mask = addPart(u.headGroup, new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.06), this.shinobiMaskMat));
            mask.position.set(0, -0.06, 0.18);
            const fangs = addPart(u.headGroup, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.03), this.shinobiRopeMat));
            fangs.position.set(0, -0.12, 0.21);
            const eyes = addPart(u.headGroup, new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.04), new THREE.MeshBasicMaterial({ color: 0xff4422 })));
            eyes.position.set(0, 0.06, 0.185);

            // Torso: Lightweight midnight vest & crossed crimson cord
            const vest = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.46, 0.32), this.shinobiClothMat));
            vest.position.y = 0.12;
            const sash1 = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.62, 0.03), this.shinobiRopeMat));
            sash1.position.set(0, 0.10, 0.17);
            sash1.rotation.z = 0.45;
            const sash2 = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.62, 0.03), this.shinobiRopeMat));
            sash2.position.set(0, 0.10, 0.17);
            sash2.rotation.z = -0.45;
            const waist = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.34), this.shinobiRopeMat));
            waist.position.y = -0.16;

            // Pauldrons & Arms
            const rPauld = addPart(u.rightShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.22), this.shinobiClothMat));
            const rArm = addPart(u.rightShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.38, 0.12), this.shinobiClothMat));
            rArm.position.y = -0.22;
            const rClaw = addPart(u.rightShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.02), this.steelMat));
            rClaw.position.set(0, -0.40, 0.08);

            const lPauld = addPart(u.leftShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.22), this.shinobiClothMat));
            const lArm = addPart(u.leftShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.38, 0.12), this.shinobiClothMat));
            lArm.position.y = -0.22;

            // Bamboo Kusazuri War Skirt
            const skirtF = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.28, 0.05), this.shinobiClothMat));
            skirtF.position.set(0, -0.34, 0.15);
            skirtF.rotation.x = 0.14;

            // Legs: Shinobi Tabi & Bindings
            const rThigh = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.36, 0.16), this.shinobiClothMat));
            rThigh.position.y = -0.16;
            const rShin = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.14), this.shinobiClothMat));
            rShin.position.y = -0.46;
            const rBinding = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.16), this.shinobiRopeMat));
            rBinding.position.y = -0.44;
            const rFoot = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, 0.22), this.shinobiClothMat));
            rFoot.position.set(0, -0.62, 0.04);

            const lThigh = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.36, 0.16), this.shinobiClothMat));
            lThigh.position.y = -0.16;
            const lShin = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.14), this.shinobiClothMat));
            lShin.position.y = -0.46;
            const lBinding = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.16), this.shinobiRopeMat));
            lBinding.position.y = -0.44;
            const lFoot = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, 0.22), this.shinobiClothMat));
            lFoot.position.set(0, -0.62, 0.04);

        } else if (skinId === 'solaire') {
            // ------------------------------------------------
            // SOLAIRE OF ASTORA (Praise The Sun - Smiling Holy Sun Tunic)
            // ------------------------------------------------
            // Holy Iron Bucket Greathelm & Red Plume
            const helm = addPart(u.headGroup, new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.42, 12), this.steelMat));
            const helmRim = addPart(u.headGroup, new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.06, 12), this.goldTrimMat));
            helmRim.position.y = 0.18;
            const visor = addPart(u.headGroup, new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.06), new THREE.MeshBasicMaterial({ color: 0x111111 })));
            visor.position.set(0, 0.04, 0.17);
            const plume = addPart(u.headGroup, new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.24, 0.14), this.solairePlumeMat));
            plume.position.set(0, 0.28, -0.06);
            plume.rotation.x = -0.3;

            // Torso: Iconic Painted Smiling Holy Sun Tunic & Red Scarf
            const tunic = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.54, 0.35), this.solaireTunicMat));
            tunic.position.y = 0.08;
            const scarf = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.12, 0.40), this.solairePlumeMat));
            scarf.position.set(0, 0.32, 0);
            const belt = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.36), this.leatherMat));
            belt.position.y = -0.16;
            const buckle = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.03), this.goldTrimMat));
            buckle.position.set(0, -0.16, 0.185);

            // Chainmail Pauldrons with red epaulets
            const rPauld = addPart(u.rightShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.26), this.solaireChainmailMat));
            const rEpaulet = addPart(u.rightShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.28), this.solairePlumeMat));
            rEpaulet.position.y = 0.08;
            const rArm = addPart(u.rightShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.38, 0.14), this.leatherMat));
            rArm.position.y = -0.22;

            const lPauld = addPart(u.leftShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.26), this.solaireChainmailMat));
            const lEpaulet = addPart(u.leftShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.28), this.solairePlumeMat));
            lEpaulet.position.y = 0.08;
            const lArm = addPart(u.leftShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.38, 0.14), this.leatherMat));
            lArm.position.y = -0.22;

            // Flowing White Crusader Tabard
            const skirtF = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.36, 0.06), this.solaireTunicMat));
            skirtF.position.set(0, -0.38, 0.15);
            skirtF.rotation.x = 0.12;

            // Gilded Sunlight Greaves
            const rThigh = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.18), this.solaireChainmailMat));
            rThigh.position.y = -0.16;
            const rKnee = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.12, 0.14), this.goldTrimMat));
            rKnee.position.set(0, -0.32, 0.06);
            const rShin = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.16), this.goldTrimMat));
            rShin.position.y = -0.46;
            const rFoot = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.24), this.leatherMat));
            rFoot.position.set(0, -0.62, 0.04);

            const lThigh = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.18), this.solaireChainmailMat));
            lThigh.position.y = -0.16;
            const lKnee = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.12, 0.14), this.goldTrimMat));
            lKnee.position.set(0, -0.32, 0.06);
            const lShin = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.16), this.goldTrimMat));
            lShin.position.y = -0.46;
            const lFoot = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.24), this.leatherMat));
            lFoot.position.set(0, -0.62, 0.04);

            // Radiant Holy Sunlight Aura
            const sunLight = addPart(u.torso, new THREE.PointLight(0xffd700, 1.8, 10, 1.2));
            sunLight.position.set(0, 0.2, 0.2);

        } else if (skinId === 'onion_knight') {
            // ------------------------------------------------
            // SIEGMEYER OF CATARINA (Rotund Bulbous Onion Armor)
            // ------------------------------------------------
            // Spherical Onion Dome Helm & Spindle
            const helm = addPart(u.headGroup, new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 14), this.onionPlateMat));
            helm.scale.set(1.1, 0.95, 1.1);
            const spindle = addPart(u.headGroup, new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 8), this.onionBrassMat));
            spindle.position.y = 0.24;
            const visor = addPart(u.headGroup, new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.06), new THREE.MeshBasicMaterial({ color: 0x111111 })));
            visor.position.set(0, 0.02, 0.24);

            // Torso: Massive Bulbous Spherical Onion Cuirass
            const belly = addPart(u.torso, new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 14), this.onionPlateMat));
            belly.position.set(0, 0.05, 0.02);
            belly.scale.set(1.15, 0.95, 1.15);
            const collar = addPart(u.torso, new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.12, 14), this.onionBrassMat));
            collar.position.y = 0.32;

            // Giant Bulbous Onion Shoulder Bells
            const rPauld = addPart(u.rightShoulder, new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), this.onionPlateMat));
            rPauld.position.set(0.06, 0, 0);
            const rArm = addPart(u.rightShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.38, 0.16), this.onionPlateMat));
            rArm.position.y = -0.22;

            const lPauld = addPart(u.leftShoulder, new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), this.onionPlateMat));
            lPauld.position.set(-0.06, 0, 0);
            const lArm = addPart(u.leftShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.38, 0.16), this.onionPlateMat));
            lArm.position.y = -0.22;

            // Fluted Wide Bell Skirt
            const skirt = addPart(u.torso, new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.44, 0.26, 14, 1, true), this.onionPlateMat));
            skirt.position.y = -0.26;
            const skirtRim = addPart(u.torso, new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.03, 6, 16), this.onionBrassMat));
            skirtRim.position.y = -0.38;
            skirtRim.rotation.x = Math.PI / 2;

            // Legs: Rounded onion domes & plates
            const rThigh = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.36, 0.20), this.onionPlateMat));
            rThigh.position.y = -0.16;
            const rKneeDome = addPart(u.rightHip, new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), this.onionBrassMat));
            rKneeDome.position.set(0, -0.32, 0.08);
            const rShin = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.18), this.onionPlateMat));
            rShin.position.y = -0.46;
            const rFoot = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.10, 0.26), this.onionPlateMat));
            rFoot.position.set(0, -0.62, 0.04);

            const lThigh = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.36, 0.20), this.onionPlateMat));
            lThigh.position.y = -0.16;
            const lKneeDome = addPart(u.leftHip, new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), this.onionBrassMat));
            lKneeDome.position.set(0, -0.32, 0.08);
            const lShin = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.18), this.onionPlateMat));
            lShin.position.y = -0.46;
            const lFoot = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.10, 0.26), this.onionPlateMat));
            lFoot.position.set(0, -0.62, 0.04);

        } else {
            // ------------------------------------------------
            // NORTHERN WARRIOR (Default Barbarian Sculpt)
            // ------------------------------------------------
            // Kettle / Bascinet Helm with gold ridge
            const helm = addPart(u.headGroup, new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.38), this.steelMat));
            const visor = addPart(u.headGroup, new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: 0x88ccff })));
            visor.position.set(0, 0.02, 0.18);
            const crestRidge = addPart(u.headGroup, new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.38), this.goldTrimMat));
            crestRidge.position.set(0, 0.22, 0.0);
            const rearPlume = addPart(u.headGroup, new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.18), this.clothMat));
            rearPlume.position.set(0, 0.19, -0.2);
            rearPlume.rotation.x = -0.35;

            // Torso: Breastplate, Waist, Fur Mantle, Belts, Quilted Skirt
            const chestPlate = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.44, 0.34), this.steelMat));
            chestPlate.position.y = 0.12;
            const chestRidge = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.05), this.steelMat));
            chestRidge.position.set(0, 0.12, 0.17);
            const waistPlate = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.24, 0.31), this.darkSteelMat));
            waistPlate.position.y = -0.16;
            const tabard = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.62, 0.36), this.clothMat));
            tabard.position.y = 0.02;

            const mantleCowl = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.16, 0.44), this.furMantleMat));
            mantleCowl.position.set(0, 0.32, 0);
            const mantleRearPelt = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.28, 0.09), this.furMantleMat));
            mantleRearPelt.position.set(0, 0.18, -0.19);

            const upperBelt = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.51, 0.07, 0.34), this.leatherMat));
            upperBelt.position.y = -0.14;
            const upperBuckle = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.03), this.steelBuckleMat));
            upperBuckle.position.set(0, -0.14, 0.175);

            // Quilted Skirt Tassets
            const frontTasset = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.32, 0.07), this.quiltedSkirtMat));
            frontTasset.position.set(0, -0.38, 0.15);
            frontTasset.rotation.x = 0.14;
            const rearTasset = addPart(u.torso, new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.34, 0.07), this.quiltedSkirtMat));
            rearTasset.position.set(0, -0.39, -0.15);
            rearTasset.rotation.x = -0.12;

            // Pauldrons & Arms
            const rPauldrons = addPart(u.rightShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.26), this.steelMat));
            const rPauldronRim = addPart(u.rightShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.28), this.goldTrimMat));
            rPauldronRim.position.y = 0.07;
            const rArm = addPart(u.rightShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.38, 0.14), this.darkSteelMat));
            rArm.position.y = -0.22;
            const rElbow = addPart(u.rightShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.11, 0.13), this.steelMat));
            rElbow.position.set(0, -0.38, -0.02);

            const lPauldrons = addPart(u.leftShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.26), this.steelMat));
            const lPauldronRim = addPart(u.leftShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.28), this.goldTrimMat));
            lPauldronRim.position.y = 0.07;
            const lArm = addPart(u.leftShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.38, 0.14), this.darkSteelMat));
            lArm.position.y = -0.22;
            const lElbow = addPart(u.leftShoulder, new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.11, 0.13), this.steelMat));
            lElbow.position.set(0, -0.38, -0.02);

            // Legs: Greaves & Leather Boots
            const rThigh = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.18), this.darkSteelMat));
            rThigh.position.y = -0.16;
            const rKnee = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.11, 0.14), this.steelMat));
            rKnee.position.set(0, -0.32, 0.06);
            const rShin = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.16), this.steelMat));
            rShin.position.y = -0.46;
            const rFoot = addPart(u.rightHip, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.24), this.leatherMat));
            rFoot.position.set(0, -0.62, 0.04);

            const lThigh = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.18), this.darkSteelMat));
            lThigh.position.y = -0.16;
            const lKnee = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.11, 0.14), this.steelMat));
            lKnee.position.set(0, -0.32, 0.06);
            const lShin = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.16), this.steelMat));
            lShin.position.y = -0.46;
            const lFoot = addPart(u.leftHip, new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.24), this.leatherMat));
            lFoot.position.set(0, -0.62, 0.04);
        }
    }

    // ----------------------------------------------------
    // CREATE CATACOMBS SKELETON WARRIOR
    // ----------------------------------------------------
    createSkeletonWarrior(x, z, angle = 0, y = -5.0) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 0.92;
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // Weathered bone ribcage
        const ribcage = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.32, 0.22), this.boneMat);
        ribcage.position.y = 0.1;
        ribcage.castShadow = true;
        torso.add(ribcage);

        // Spine vertebrae column
        const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 6), this.boneMat);
        spine.position.y = -0.15;
        torso.add(spine);

        // Bony pelvis
        const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.20), this.boneMat);
        pelvis.position.y = -0.25;
        torso.add(pelvis);

        // Skull & glowing red eye sockets
        const headGroup = new THREE.Group();
        headGroup.position.y = 0.44;
        torso.add(headGroup);

        const cranium = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.24), this.boneMat);
        cranium.castShadow = true;
        headGroup.add(cranium);

        const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.16), this.boneMat);
        jaw.position.set(0, -0.14, 0.04);
        headGroup.add(jaw);

        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.04), this.emberGlowMat);
        eyeL.position.set(-0.06, 0.02, 0.12);
        headGroup.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.04), this.emberGlowMat);
        eyeR.position.set(0.06, 0.02, 0.12);
        headGroup.add(eyeR);

        // Right Arm (Curved Rusted Scimitar)
        const rightArm = new THREE.Group();
        rightArm.position.set(0.26, 0.22, 0);
        torso.add(rightArm);
        const rBone = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 6), this.boneMat);
        rBone.position.y = -0.21;
        rightArm.add(rBone);

        const scimitar = new THREE.Group();
        scimitar.position.set(0, -0.42, 0.06);
        scimitar.rotation.set(0.4, 0.2, -0.3);
        const scimBlade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.95, 0.02), this.rustIronMat);
        scimBlade.position.y = 0.45;
        scimBlade.castShadow = true;
        scimitar.add(scimBlade);
        const scimCurve = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.25, 0.02), this.rustIronMat);
        scimCurve.position.set(0.04, 0.85, 0);
        scimitar.add(scimCurve);
        rightArm.add(scimitar);

        // Left Arm (Cracked Round Bronze Buckler)
        const leftArm = new THREE.Group();
        leftArm.position.set(-0.26, 0.22, 0);
        torso.add(leftArm);
        const lBone = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 6), this.boneMat);
        lBone.position.y = -0.21;
        leftArm.add(lBone);

        const buckler = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 12), this.darkSteelMat);
        buckler.position.set(0, -0.38, 0.12);
        buckler.rotation.x = Math.PI / 2;
        buckler.castShadow = true;
        leftArm.add(buckler);

        // Legs
        const rightLeg = new THREE.Group();
        rightLeg.position.set(0.14, -0.25, 0);
        bodyGroup.add(rightLeg);
        const rLegBone = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.58, 6), this.boneMat);
        rLegBone.position.y = -0.29;
        rightLeg.add(rLegBone);

        const leftLeg = new THREE.Group();
        leftLeg.position.set(-0.14, -0.25, 0);
        bodyGroup.add(leftLeg);
        const lLegBone = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.58, 6), this.boneMat);
        lLegBone.position.y = -0.29;
        leftLeg.add(lLegBone);

        root.userData = {
            type: 'skeleton',
            bodyGroup,
            torso,
            headGroup,
            rightArm,
            leftArm,
            rightLeg,
            leftLeg,
            weapon: scimitar
        };

        this.scene.add(root);
        return root;
    }

    // ----------------------------------------------------
    // CREATE GRAVELORD NITO (FIRST OF THE DEAD)
    // ----------------------------------------------------
    createGravelordNito(x, z) {
        const root = new THREE.Group();
        root.position.set(x, -6.0, z); // Positioned on Catacombs Mausoleum floor

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.0;
        root.add(bodyGroup);

        // 1. Enormous Towering Death Cloak of Skulls and Black Funeral Shrouds (Height ~4.2m)
        const cloakBase = new THREE.Mesh(new THREE.ConeGeometry(2.2, 4.0, 16), this.nitoCloakMat);
        cloakBase.position.y = 0.2;
        cloakBase.castShadow = true;
        bodyGroup.add(cloakBase);

        // Layered skeletal ribs and bone spurs jutting from the cloak
        for (let i = 0; i < 14; i++) {
            const boneSpur = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.65, 4), this.nitoBoneMat);
            const ang = (i / 14) * Math.PI * 2;
            const rad = 1.2 + (i % 3) * 0.25;
            boneSpur.position.set(Math.cos(ang) * rad, -0.4 + (i % 4) * 0.35, Math.sin(ang) * rad);
            boneSpur.rotation.set((Math.random() - 0.5) * 0.8, ang, Math.PI / 2.2);
            boneSpur.castShadow = true;
            bodyGroup.add(boneSpur);
        }

        // 2. Giant Embedded Rite of Kindling Masks (Father, Mother, Child)
        const maskFather = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.14), this.nitoMaskMat);
        maskFather.position.set(0, 1.4, 1.1);
        maskFather.rotation.x = -0.15;
        bodyGroup.add(maskFather);

        const maskMother = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.58, 0.12), this.nitoBoneMat);
        maskMother.position.set(-0.75, 1.1, 0.9);
        maskMother.rotation.set(-0.1, 0.4, -0.2);
        bodyGroup.add(maskMother);

        const maskChild = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.12), this.nitoBoneMat);
        maskChild.position.set(0.75, 1.1, 0.9);
        maskChild.rotation.set(-0.1, -0.4, 0.2);
        bodyGroup.add(maskChild);

        // 3. Colossal Right Arm wielding the Gravelord Greatsword
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.4, 1.2, 0);
        bodyGroup.add(rightShoulder);

        const rArmBone = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 1.6, 8), this.nitoBoneMat);
        rArmBone.position.y = -0.8;
        rightShoulder.add(rArmBone);

        // The Gravelord Greatsword
        const swordGroup = new THREE.Group();
        swordGroup.position.set(0, -1.6, 0.3);
        swordGroup.rotation.set(0.6, 0.2, -0.4);
        rightShoulder.add(swordGroup);

        // Chipped Obsidian Blade
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.38, 3.6, 0.14), this.nitoBladeMat);
        blade.position.y = 1.6;
        blade.castShadow = true;
        swordGroup.add(blade);

        // Vertebrae Spine Crossguard
        const guard = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.24, 0.28), this.nitoBoneMat);
        swordGroup.add(guard);

        // 4. Toxic Miasma Aura PointLight
        const miasmaLight = new THREE.PointLight(0xaa1144, 3.5, 16, 1.5);
        miasmaLight.position.set(0, 1.0, 0);
        bodyGroup.add(miasmaLight);

        root.userData = {
            type: 'boss',
            bossId: 'nito',
            bodyGroup,
            rightShoulder,
            swordGroup,
            maskFather,
            maskMother,
            maskChild,
            miasmaLight
        };

        this.scene.add(root);
        return root;
    }

    setPlayerTorchVisible(playerMesh, isVisible) {
        if (!playerMesh || !playerMesh.userData) return;
        const u = playerMesh.userData;
        if (u.offhandTorch) {
            u.offhandTorch.visible = isVisible;
        }
        if (u.shieldGroup) {
            // Stow shield when holding torch
            u.shieldGroup.visible = !isVisible;
        }
    }

    // ----------------------------------------------------
    // CREATE HOLLOW UNDEAD SOLDIER
    // ----------------------------------------------------
    createHollow(x, z, angle = 0, y = 0) {
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

        root.position.set(x, y, z);
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
