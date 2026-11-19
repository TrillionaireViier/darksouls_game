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
            color: 0x545e6c, // Rich dark tempered steel with visible diffuse form
            metalness: 0.35,
            roughness: 0.45
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

        // Hollow Soldier Materials (Authentic ash-grey undead tone & weathered burlap)
        this.hollowSkinMat = new THREE.MeshStandardMaterial({
            color: 0x827c6c,
            roughness: 0.76,
            metalness: 0.05
        });
        this.hollowRagsMat = new THREE.MeshStandardMaterial({
            color: 0x544a3e,
            roughness: 0.82,
            metalness: 0.04
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
        // 10 NEW BOSSES MATERIALS
        // ----------------------------------------------------
        // 1. Asylum Demon (Olive Demon Skin & Rough Great Hammer)
        this.asylumFleshMat = new THREE.MeshStandardMaterial({
            color: 0x364230,
            roughness: 0.88,
            metalness: 0.2
        });
        this.asylumHammerMat = new THREE.MeshStandardMaterial({
            color: 0x282018,
            roughness: 0.95,
            metalness: 0.08
        });

        // 2. Gaping Dragon (Decaying Ribcage & Bone Teeth)
        this.gapingFleshMat = new THREE.MeshStandardMaterial({
            color: 0x5a544b,
            roughness: 0.86,
            metalness: 0.18
        });
        this.gapingToothMat = new THREE.MeshStandardMaterial({
            color: 0xded8c6,
            roughness: 0.52,
            metalness: 0.15
        });

        // 3. Chaos Witch Quelaag (Spider Chitin & Molten Fire Abdomen)
        this.quelaagHumanMat = new THREE.MeshStandardMaterial({
            color: 0xf5dcc8,
            roughness: 0.62,
            metalness: 0.1
        });
        this.quelaagChitinMat = new THREE.MeshStandardMaterial({
            color: 0x1f1412,
            roughness: 0.65,
            metalness: 0.45
        });
        this.quelaagFireMat = new THREE.MeshStandardMaterial({
            color: 0xff4400,
            emissive: 0xff3300,
            emissiveIntensity: 1.3,
            roughness: 0.28
        });

        // 4. Moonlight Butterfly (Luminescent Cyan Crystal Wings)
        this.butterflyLuminMat = new THREE.MeshStandardMaterial({
            color: 0x44eeff,
            emissive: 0x00aacc,
            emissiveIntensity: 0.85,
            transparent: true,
            opacity: 0.88,
            side: THREE.DoubleSide
        });

        // 5. Iron Golem (Heavy Cast Iron & Core Furnace)
        this.ironGolemMat = new THREE.MeshStandardMaterial({
            color: 0x353a40,
            metalness: 0.88,
            roughness: 0.32
        });
        this.ironGolemCoreMat = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            emissive: 0xff4400,
            emissiveIntensity: 1.6,
            roughness: 0.2
        });

        // 6. Dragonslayer Ornstein (Lion-Crested Royal Gold)
        this.ornsteinGoldMat = new THREE.MeshStandardMaterial({
            color: 0x9b7a32,
            metalness: 0.42,
            roughness: 0.52
        });
        this.ornsteinPlumeMat = new THREE.MeshStandardMaterial({
            color: 0x6e141c,
            roughness: 0.92,
            metalness: 0.08
        });

        // 7. Executioner Smough (Gilded Grotesque Armor)
        this.smoughGoldMat = new THREE.MeshStandardMaterial({
            color: 0x8a6a2a,
            metalness: 0.45,
            roughness: 0.48
        });

        // 8. Knight Artorias (Abyss Corrupted Plate & Cobalt Cloak)
        this.artoriasAbyssMat = new THREE.MeshStandardMaterial({
            color: 0x1a2638,
            metalness: 0.72,
            roughness: 0.42
        });
        this.artoriasBladeDarkMat = new THREE.MeshStandardMaterial({
            color: 0x141c26,
            emissive: 0x0c1220,
            emissiveIntensity: 0.4,
            metalness: 0.92,
            roughness: 0.22
        });

        // 9. Manus, Father of the Abyss (Primeval Void Flesh & Claws)
        this.manusDarkMat = new THREE.MeshStandardMaterial({
            color: 0x0a0a0f,
            roughness: 0.95,
            metalness: 0.25
        });

        // 10. Black Dragon Kalameet (Obsidian Scales & Calamity Eye)
        this.kalameetDragonMat = new THREE.MeshStandardMaterial({
            color: 0x111316,
            metalness: 0.65,
            roughness: 0.38
        });
        this.calamityEyeMat = new THREE.MeshStandardMaterial({
            color: 0xff0022,
            emissive: 0xff0011,
            emissiveIntensity: 2.2,
            roughness: 0.1
        });

        // 11. 30 MOBS COMPENDIUM DEDICATED MATERIALS
        this.mobCrystalMat = new THREE.MeshStandardMaterial({
            color: 0x88d8ff,
            roughness: 0.18,
            metalness: 0.8,
            emissive: 0x2266aa,
            emissiveIntensity: 0.5
        });
        this.mobGhostMat = new THREE.MeshStandardMaterial({
            color: 0xaae8ff,
            transparent: true,
            opacity: 0.65,
            emissive: 0x3388bb,
            emissiveIntensity: 0.65,
            roughness: 0.1
        });
        this.mobSlimeMat = new THREE.MeshStandardMaterial({
            color: 0x33bb44,
            roughness: 0.25,
            metalness: 0.2,
            emissive: 0x116611,
            emissiveIntensity: 0.4
        });
        this.mobDarkHandMat = new THREE.MeshStandardMaterial({
            color: 0xcc2200,
            emissive: 0xff3300,
            emissiveIntensity: 1.4,
            roughness: 0.3,
            transparent: true,
            opacity: 0.85
        });
        this.mobSilverKnightMat = new THREE.MeshStandardMaterial({
            color: 0xdde5ee,
            metalness: 0.92,
            roughness: 0.2
        });
        this.mobTreantBarkMat = new THREE.MeshStandardMaterial({
            color: 0x382c1e,
            roughness: 0.95
        });
        this.mobTreantFoliageMat = new THREE.MeshStandardMaterial({
            color: 0x243e16,
            roughness: 0.9
        });
        this.mobStoneKnightMat = new THREE.MeshStandardMaterial({
            color: 0x546050,
            roughness: 0.92
        });
        this.mobTorchFlameMat = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            emissive: 0xff4400,
            emissiveIntensity: 1.9,
            roughness: 0.2
        });
        this.mobPustuleMat = new THREE.MeshStandardMaterial({
            color: 0xddaa22,
            emissive: 0xaa7711,
            emissiveIntensity: 0.7,
            roughness: 0.4
        });
        this.mobWhiteRobeMat = new THREE.MeshStandardMaterial({
            color: 0xf4f4f0,
            roughness: 0.8
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
        // GORGONS & SERPENTS PROCEDURAL MATERIALS
        // ----------------------------------------------------
        this.serpentScaleMat = new THREE.MeshStandardMaterial({
            color: 0x183820,
            roughness: 0.38,
            metalness: 0.32
        });

        this.serpentBellyMat = new THREE.MeshStandardMaterial({
            color: 0xd6caa2,
            roughness: 0.62,
            metalness: 0.08
        });

        this.gorgonSkinMat = new THREE.MeshStandardMaterial({
            color: 0xa8c2af,
            roughness: 0.65,
            metalness: 0.15
        });

        this.gorgonArmorMat = new THREE.MeshStandardMaterial({
            color: 0x6e522e,
            roughness: 0.32,
            metalness: 0.88
        });

        this.gorgonSnakeHairMat = new THREE.MeshStandardMaterial({
            color: 0x0f2214,
            roughness: 0.28,
            metalness: 0.45
        });

        this.gorgonGlowMat = new THREE.MeshBasicMaterial({
            color: 0x00ff88
        });

        this.gorgonRubyEyeMat = new THREE.MeshBasicMaterial({
            color: 0xff1122
        });

        this.petrifiedStoneMat = new THREE.MeshStandardMaterial({
            color: 0x6e6a64,
            roughness: 0.94,
            metalness: 0.04
        });

        this.venomAcidMat = new THREE.MeshStandardMaterial({
            color: 0x33ff66,
            emissive: 0x11bb33,
            emissiveIntensity: 1.4,
            roughness: 0.15,
            metalness: 0.2,
            transparent: true,
            opacity: 0.88
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
            color: 0x363842, // Charred obsidian iron with metallic sheen
            metalness: 0.38,
            roughness: 0.48
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
        this.hollowSocketMat = new THREE.MeshStandardMaterial({
            color: 0x141010,
            roughness: 0.95,
            metalness: 0.1
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
            // Astora Straight Sword (High-Fidelity 3D Model Upgrade)
            const swordRoot = new THREE.Group();
            root.add(swordRoot);

            // 1. Crossguard with swept quillons and gold lion studs
            const guard = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.055, 0.075), this.goldTrimMat);
            guard.castShadow = true;
            swordRoot.add(guard);

            const quillonL = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.12, 6), this.goldTrimMat);
            quillonL.position.set(-0.24, 0.03, 0);
            quillonL.rotation.z = 0.55;
            swordRoot.add(quillonL);

            const quillonR = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.12, 6), this.goldTrimMat);
            quillonR.position.set(0.24, 0.03, 0);
            quillonR.rotation.z = -0.55;
            swordRoot.add(quillonR);

            // 2. Wire-wrapped hilt
            const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.030, 0.32, 10), this.leatherMat);
            hilt.position.y = -0.17;
            hilt.castShadow = true;
            swordRoot.add(hilt);

            for (let wi = 0; wi < 6; wi++) {
                const wire = new THREE.Mesh(new THREE.TorusGeometry(0.029, 0.005, 4, 12), this.goldTrimMat);
                wire.position.y = -0.06 - wi * 0.042;
                wire.rotation.x = Math.PI / 2;
                swordRoot.add(wire);
            }

            // 3. Faceted octagonal pommel with inset ruby gemstone
            const pommel = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.038, 0.08, 8), this.steelMat);
            pommel.position.y = -0.36;
            pommel.castShadow = true;
            swordRoot.add(pommel);

            const rubyGem = new THREE.Mesh(
                new THREE.SphereGeometry(0.024, 8, 8),
                new THREE.MeshStandardMaterial({
                    color: 0xee1133,
                    emissive: 0x880011,
                    emissiveIntensity: 0.6,
                    roughness: 0.1,
                    metalness: 0.2
                })
            );
            rubyGem.position.y = -0.36;
            swordRoot.add(rubyGem);

            // 4. Double-edged blade with deep central fuller groove
            const bladeLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.38, 0.026), this.bladeMat);
            bladeLeft.position.set(-0.032, 0.74, 0);
            bladeLeft.castShadow = true;
            swordRoot.add(bladeLeft);

            const bladeRight = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.38, 0.026), this.bladeMat);
            bladeRight.position.set(0.032, 0.74, 0);
            bladeRight.castShadow = true;
            swordRoot.add(bladeRight);

            const fuller = new THREE.Mesh(new THREE.BoxGeometry(0.022, 1.15, 0.030), this.darkSteelMat);
            fuller.position.set(0, 0.65, 0);
            swordRoot.add(fuller);

            // 5. Tapered tip
            const tip = new THREE.Mesh(new THREE.ConeGeometry(0.068, 0.28, 4), this.bladeMat);
            tip.position.y = 1.54;
            tip.rotation.y = Math.PI / 4;
            tip.castShadow = true;
            swordRoot.add(tip);
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

        // Amber-gold mid flame (natural compact teardrop shape)
        const midMat = new THREE.MeshStandardMaterial({
            color: 0xffa020,
            emissive: 0xff6600,
            emissiveIntensity: 2.4,
            roughness: 0.2,
            metalness: 0.05
        });
        const midMesh = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.20, 8), midMat);
        midMesh.position.y = 0.10;
        flameGroup.add(midMesh);

        // Soft flickering flame envelope with additive blending
        const tipMat = new THREE.MeshBasicMaterial({
            color: 0xff7711,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending
        });
        const tipMesh = new THREE.Mesh(new THREE.ConeGeometry(0.088, 0.25, 8), tipMat);
        tipMesh.position.y = 0.12;
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
            newWeapon.rotation.set(0.85, 0.08, -0.15);
            newWeapon.position.set(0.02, 0.04, 0.04);
        } else if (weaponId === 'zweihander') {
            newWeapon.rotation.set(0.50, 0.12, -0.20);
            newWeapon.position.set(0.02, 0.05, 0.08);
        } else if (weaponId === 'dragontooth') {
            newWeapon.rotation.set(0.40, 0.12, -0.18);
            newWeapon.position.set(0.02, 0.04, 0.06);
        } else if (weaponId === 'torch') {
            newWeapon.rotation.set(0.12, 0, -0.06);
            newWeapon.position.set(0, 0.06, 0.04);
        } else if (weaponId === 'uchigatana') {
            newWeapon.rotation.set(0.45, 0.10, -0.16);
            newWeapon.position.set(0.02, 0.04, 0.06);
        } else {
            newWeapon.rotation.set(0.45, 0.10, -0.18);
            newWeapon.position.set(0.02, 0.04, 0.06);
        }
        rHand.add(newWeapon);

        playerMesh.userData.swordGroup = newWeapon;
        playerMesh.userData.currentWeaponId = weaponId;
    }

    // ----------------------------------------------------
    // CREATE PLAYER (SCULPTED 3D CHOSEN UNDEAD WARRIOR)
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
        headGroup.position.y = 0.58;
        torso.add(headGroup);

        // 3. Right Arm (Weapon Arm)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.34, 0.26, 0);
        torso.add(rightShoulder);

        const rHand = new THREE.Group();
        rHand.position.y = -0.44;
        rightShoulder.add(rHand);

        const swordGroup = this.createWeaponMesh('sword');
        swordGroup.rotation.set(0.45, 0.10, -0.18);
        swordGroup.position.set(0.02, 0.04, 0.06);
        rHand.add(swordGroup);

        // 4. Left Arm (Shield & Offhand Arm)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.34, 0.26, 0);
        torso.add(leftShoulder);

        const lHand = new THREE.Group();
        lHand.position.y = -0.44;
        leftShoulder.add(lHand);

        // Authentic Curved Heater Shield (Anatomically curved plate facing forward)
        const shieldGroup = new THREE.Group();
        const shieldPlate = new THREE.Mesh(
            new THREE.CylinderGeometry(0.48, 0.38, 0.78, 14, 1, false, -Math.PI * 0.26, Math.PI * 0.52),
            this.crestShieldMat
        );
        shieldPlate.castShadow = true;
        shieldPlate.receiveShadow = true;
        shieldPlate.rotation.y = Math.PI;
        shieldGroup.add(shieldPlate);

        // Shield heraldic gold border rims
        const shieldBorderTop = new THREE.Mesh(
            new THREE.CylinderGeometry(0.49, 0.39, 0.04, 14, 1, true, -Math.PI * 0.26, Math.PI * 0.52),
            this.goldTrimMat
        );
        shieldBorderTop.position.y = 0.38;
        shieldBorderTop.rotation.y = Math.PI;
        shieldGroup.add(shieldBorderTop);

        const shieldBorderBot = new THREE.Mesh(
            new THREE.CylinderGeometry(0.49, 0.39, 0.04, 14, 1, true, -Math.PI * 0.26, Math.PI * 0.52),
            this.goldTrimMat
        );
        shieldBorderBot.position.y = -0.38;
        shieldBorderBot.rotation.y = Math.PI;
        shieldGroup.add(shieldBorderBot);

        // Forearm inner leather straps
        const strap1 = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.016, 6, 8), this.leatherMat);
        strap1.position.set(0, 0.12, 0.06);
        shieldGroup.add(strap1);
        const strap2 = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.016, 6, 8), this.leatherMat);
        strap2.position.set(0, -0.12, 0.06);
        shieldGroup.add(strap2);

        shieldGroup.position.set(-0.04, 0.06, 0.16);
        shieldGroup.rotation.set(0.08, Math.PI / 8, -0.05);
        lHand.add(shieldGroup);

        // Offhand Torch
        const offhandTorch = this.createTorchMesh(false);
        offhandTorch.position.set(0, 0.1, 0.15);
        offhandTorch.rotation.x = -0.2;
        offhandTorch.visible = false;
        lHand.add(offhandTorch);

        // Estus Flask (Contoured glass vessel in leather hip holster)
        const estusFlask = new THREE.Group();
        const flaskHolster = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.07, 0.08, 10), this.leatherMat);
        flaskHolster.position.set(0, -0.02, 0);
        estusFlask.add(flaskHolster);

        const flaskVessel = new THREE.Mesh(
            new THREE.SphereGeometry(0.068, 12, 10),
            new THREE.MeshStandardMaterial({
                color: 0xd88015,
                emissive: 0x663300,
                emissiveIntensity: 0.55,
                roughness: 0.18,
                metalness: 0.25
            })
        );
        flaskVessel.scale.set(0.9, 1.25, 0.9);
        flaskVessel.castShadow = true;
        estusFlask.add(flaskVessel);

        const flaskNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.03, 0.05, 8), this.goldTrimMat);
        flaskNeck.position.y = 0.09;
        estusFlask.add(flaskNeck);

        const flaskCork = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 0.03, 6), this.leatherMat);
        flaskCork.position.y = 0.12;
        estusFlask.add(flaskCork);

        const flaskGlow = new THREE.PointLight(0xffaa22, 0.7, 2.2);
        flaskGlow.position.set(0, 0, 0);
        estusFlask.add(flaskGlow);

        estusFlask.position.set(-0.24, -0.22, -0.08);
        estusFlask.rotation.set(0.08, 0.2, -0.12);
        torso.add(estusFlask);

        // 5. Contoured Legs (Hips attached to Torso for unified kinetic motion)
        const rightHip = new THREE.Group();
        rightHip.position.set(0.16, -0.36, 0);
        torso.add(rightHip);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.16, -0.36, 0);
        torso.add(leftHip);

        // 6. Iconic Back-Mounted Greatsword with Leather Scabbard (Reference Image 5 Replica)
        // Mounted diagonally across spine: from right hip across back to left shoulder
        const backScabbardGroup = new THREE.Group();
        backScabbardGroup.position.set(0.03, 0.16, -0.20);
        backScabbardGroup.rotation.set(-0.06, 0, -0.42);
        torso.add(backScabbardGroup);

        const scabbardBody = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.40, 0.045), this.scabbardMat);
        scabbardBody.position.y = -0.30;
        scabbardBody.castShadow = true;
        backScabbardGroup.add(scabbardBody);

        const scabbardThroat = new THREE.Mesh(new THREE.BoxGeometry(0.098, 0.07, 0.058), this.steelMat);
        scabbardThroat.position.y = 0.40;
        backScabbardGroup.add(scabbardThroat);

        const wrapLevels = [0.30, 0.15, 0.0, -0.15, -0.30, -0.45, -0.60, -0.75, -0.90];
        wrapLevels.forEach((wy) => {
            const wrapBand = new THREE.Mesh(new THREE.BoxGeometry(0.088, 0.024, 0.052), this.scabbardWrapMat);
            wrapBand.position.y = wy;
            backScabbardGroup.add(wrapBand);
        });

        const chape = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.14, 4), this.steelMat);
        chape.position.y = -1.06;
        chape.rotation.x = Math.PI;
        chape.rotation.y = Math.PI / 4;
        backScabbardGroup.add(chape);

        // Two-handed Greatsword Hilt
        const greatswordHiltGroup = new THREE.Group();
        greatswordHiltGroup.position.y = 0.42;
        backScabbardGroup.add(greatswordHiltGroup);

        const guardMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.038, 0.045), this.steelMat);
        guardMesh.castShadow = true;
        greatswordHiltGroup.add(guardMesh);

        const gripMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.023, 0.36, 8), this.scabbardWrapMat);
        gripMesh.position.y = 0.20;
        greatswordHiltGroup.add(gripMesh);

        for (let gi = 0; gi < 5; gi++) {
            const cordRing = new THREE.Mesh(new THREE.TorusGeometry(0.023, 0.005, 4, 8), this.leatherMat);
            cordRing.position.y = 0.07 + gi * 0.065;
            cordRing.rotation.x = Math.PI / 2;
            greatswordHiltGroup.add(cordRing);
        }

        const ringPommel = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.014, 8, 16), this.steelMat);
        ringPommel.position.y = 0.42;
        ringPommel.castShadow = true;
        greatswordHiltGroup.add(ringPommel);

        const pommelSpoke = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.085, 0.014), this.steelMat);
        pommelSpoke.position.y = 0.42;
        greatswordHiltGroup.add(pommelSpoke);

// Clean Dark Souls Nordic knight back: unhindered fur mantle & scabbard

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
            capeGroup: null,
            capeJoint1: null,
            capeJoint2: null,
            skinMeshes: [],
            currentSkin: 'warrior'
        };

        // Apply default sculpted skin (Reference Image 5 Replica)
        this.applySkinToPlayer(root, 'warrior');

        this.scene.add(root);
        return root;
    }

    // ====================================================
    // 3D COSTUMES & SKINS APPLIER (SCULPTED 3D ARMOR SUITES)
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
            // 1. Helm: Fluted Armet with winged gold crests
            const helm = addPart(u.headGroup, new THREE.Mesh(
                new THREE.SphereGeometry(0.18, 16, 14),
                this.eliteSteelMat
            ));
            helm.scale.set(0.88, 1.05, 0.96);

            const crest = addPart(u.headGroup, new THREE.Mesh(
                new THREE.CylinderGeometry(0.014, 0.032, 0.38, 8),
                this.goldTrimMat
            ));
            crest.position.set(0, 0.16, -0.02);
            crest.rotation.z = Math.PI / 2;
            crest.rotation.y = Math.PI / 2;

            const wingL = addPart(u.headGroup, new THREE.Mesh(
                new THREE.BoxGeometry(0.02, 0.16, 0.14),
                this.goldTrimMat
            ));
            wingL.position.set(-0.17, 0.12, -0.05);
            wingL.rotation.z = -0.25;

            const wingR = addPart(u.headGroup, new THREE.Mesh(
                new THREE.BoxGeometry(0.02, 0.16, 0.14),
                this.goldTrimMat
            ));
            wingR.position.set(0.17, 0.12, -0.05);
            wingR.rotation.z = 0.25;

            const visorBrow = addPart(u.headGroup, new THREE.Mesh(
                new THREE.CylinderGeometry(0.19, 0.20, 0.08, 14, 1, false, -Math.PI * 0.38, Math.PI * 0.76),
                this.eliteSteelMat
            ));
            visorBrow.position.set(0, 0.04, 0.03);

            const visorSlit = addPart(u.headGroup, new THREE.Mesh(
                new THREE.BoxGeometry(0.24, 0.024, 0.04),
                new THREE.MeshBasicMaterial({ color: 0x66ccff })
            ));
            visorSlit.position.set(0, 0.015, 0.17);

            const gorget = addPart(u.headGroup, new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.17, 0.14, 12),
                this.eliteSteelMat
            ));
            gorget.position.set(0, -0.18, 0);

            // 2. Torso: Polished fluted plate & Astora blue embroidered cross tabard
            const chest = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.22, 0.32, 16),
                this.eliteSteelMat
            ));
            chest.position.set(0, 0.14, 0);
            chest.scale.set(1.06, 1.0, 0.86);

            const ridge = addPart(u.torso, new THREE.Mesh(
                new THREE.BoxGeometry(0.028, 0.30, 0.04),
                this.goldTrimMat
            ));
            ridge.position.set(0, 0.14, 0.17);

            const tabardF = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.22, 0.26, 0.44, 14, 1, false, -Math.PI * 0.35, Math.PI * 0.70),
                this.astoraBlueClothMat
            ));
            tabardF.position.set(0, -0.12, 0.02);

            const crossH = addPart(u.torso, new THREE.Mesh(
                new THREE.BoxGeometry(0.24, 0.05, 0.02),
                this.goldTrimMat
            ));
            crossH.position.set(0, 0.10, 0.185);

            const crossV = addPart(u.torso, new THREE.Mesh(
                new THREE.BoxGeometry(0.05, 0.24, 0.02),
                this.goldTrimMat
            ));
            crossV.position.set(0, 0.08, 0.185);

            const belt = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.21, 0.215, 0.07, 16),
                this.leatherMat
            ));
            belt.position.set(0, -0.16, 0);

            const buckle = addPart(u.torso, new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.065, 0.03),
                this.goldTrimMat
            ));
            buckle.position.set(0, -0.16, 0.18);

            const skirtF = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.22, 0.27, 0.34, 12, 1, false, -Math.PI * 0.38, Math.PI * 0.76),
                this.astoraBlueClothMat
            ));
            skirtF.position.set(0, -0.36, 0.02);
            skirtF.rotation.x = 0.12;

            const skirtB = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.22, 0.27, 0.34, 12, 1, false, Math.PI * 0.62, Math.PI * 0.76),
                this.astoraBlueClothMat
            ));
            skirtB.position.set(0, -0.36, -0.02);
            skirtB.rotation.x = -0.12;

            // 3. Pauldrons & Arms
            ['rightShoulder', 'leftShoulder'].forEach((shKey) => {
                const sh = u[shKey];
                const pauld = addPart(sh, new THREE.Mesh(
                    new THREE.SphereGeometry(0.14, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
                    this.eliteSteelMat
                ));
                pauld.position.set(0, 0.05, 0);
                pauld.scale.set(1.1, 0.9, 1.25);

                const trim = addPart(sh, new THREE.Mesh(
                    new THREE.TorusGeometry(0.12, 0.015, 6, 12),
                    this.goldTrimMat
                ));
                trim.position.set(0, 0.04, 0);
                trim.rotation.x = Math.PI / 2;

                const bicep = addPart(sh, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.075, 0.068, 0.24, 12),
                    this.steelMat
                ));
                bicep.position.set(0, -0.18, 0);

                const elbow = addPart(sh, new THREE.Mesh(
                    new THREE.SphereGeometry(0.075, 10, 8),
                    this.goldTrimMat
                ));
                elbow.position.set(0, -0.32, -0.02);

                const vambrace = addPart(sh, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.072, 0.060, 0.22, 12),
                    this.eliteSteelMat
                ));
                vambrace.position.set(0, -0.45, 0);

                const glove = addPart(sh, new THREE.Mesh(
                    new THREE.BoxGeometry(0.08, 0.10, 0.08),
                    this.steelMat
                ));
                glove.position.set(0, -0.58, 0);
            });

            // 4. Legs
            ['rightHip', 'leftHip'].forEach((hipKey) => {
                const hip = u[hipKey];
                const thigh = addPart(hip, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.115, 0.092, 0.34, 12),
                    this.steelMat
                ));
                thigh.position.set(0, -0.16, 0);
                thigh.scale.set(0.95, 1.0, 1.05);

                const knee = addPart(hip, new THREE.Mesh(
                    new THREE.SphereGeometry(0.085, 10, 8, 0, Math.PI, 0, Math.PI),
                    this.goldTrimMat
                ));
                knee.position.set(0, -0.33, 0.05);

                const shin = addPart(hip, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.088, 0.072, 0.30, 12),
                    this.eliteSteelMat
                ));
                shin.position.set(0, -0.48, 0);

                const foot = addPart(hip, new THREE.Mesh(
                    new THREE.BoxGeometry(0.11, 0.08, 0.22),
                    this.steelMat
                ));
                foot.position.set(0, -0.64, 0.04);

                const toe = addPart(hip, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.055, 0.055, 0.11, 8),
                    this.eliteSteelMat
                ));
                toe.position.set(0, -0.64, 0.13);
                toe.rotation.z = Math.PI / 2;
            });

        } else if (skinId === 'black_knight') {
            // ------------------------------------------------
            // BLACK KNIGHT OF GWYN (Charred Iron, Horns & Lava Embers)
            // ------------------------------------------------
            const helm = addPart(u.headGroup, new THREE.Mesh(
                new THREE.SphereGeometry(0.18, 16, 14),
                this.blackKnightMat
            ));
            helm.scale.set(0.88, 1.05, 0.96);

            const hornL = addPart(u.headGroup, new THREE.Mesh(
                new THREE.ConeGeometry(0.045, 0.30, 6),
                this.blackKnightHornMat
            ));
            hornL.position.set(-0.16, 0.18, -0.02);
            hornL.rotation.z = 0.55;
            hornL.rotation.x = -0.25;

            const hornR = addPart(u.headGroup, new THREE.Mesh(
                new THREE.ConeGeometry(0.045, 0.30, 6),
                this.blackKnightHornMat
            ));
            hornR.position.set(0.16, 0.18, -0.02);
            hornR.rotation.z = -0.55;
            hornR.rotation.x = -0.25;

            const visorBrow = addPart(u.headGroup, new THREE.Mesh(
                new THREE.CylinderGeometry(0.19, 0.20, 0.08, 14, 1, false, -Math.PI * 0.38, Math.PI * 0.76),
                this.blackKnightMat
            ));
            visorBrow.position.set(0, 0.04, 0.03);

            const visorSlit = addPart(u.headGroup, new THREE.Mesh(
                new THREE.BoxGeometry(0.24, 0.024, 0.04),
                this.emberGlowMat
            ));
            visorSlit.position.set(0, 0.015, 0.17);

            const gorget = addPart(u.headGroup, new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.17, 0.14, 12),
                this.blackKnightMat
            ));
            gorget.position.set(0, -0.18, 0);

            const chest = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.22, 0.32, 16),
                this.blackKnightMat
            ));
            chest.position.set(0, 0.14, 0);
            chest.scale.set(1.06, 1.0, 0.86);

            const chestSpur = addPart(u.torso, new THREE.Mesh(
                new THREE.BoxGeometry(0.03, 0.28, 0.04),
                this.emberGlowMat
            ));
            chestSpur.position.set(0, 0.14, 0.17);

            const abdomen = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.22, 0.195, 0.22, 16),
                this.blackKnightMat
            ));
            abdomen.position.set(0, -0.12, 0);
            abdomen.scale.set(1.02, 1.0, 0.84);

            const skirtF = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.21, 0.26, 0.32, 12, 1, false, -Math.PI * 0.38, Math.PI * 0.76),
                this.blackKnightMat
            ));
            skirtF.position.set(0, -0.36, 0.02);
            skirtF.rotation.x = 0.12;

            const skirtB = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.21, 0.26, 0.32, 12, 1, false, Math.PI * 0.62, Math.PI * 0.76),
                this.blackKnightMat
            ));
            skirtB.position.set(0, -0.36, -0.02);
            skirtB.rotation.x = -0.12;

            ['rightShoulder', 'leftShoulder'].forEach((shKey, idx) => {
                const sh = u[shKey];
                const pauld = addPart(sh, new THREE.Mesh(
                    new THREE.SphereGeometry(0.14, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
                    this.blackKnightMat
                ));
                pauld.position.set(0, 0.05, 0);
                pauld.scale.set(1.1, 0.9, 1.25);

                const spike = addPart(sh, new THREE.Mesh(
                    new THREE.ConeGeometry(0.04, 0.16, 5),
                    this.blackKnightHornMat
                ));
                spike.position.set(idx === 0 ? 0.08 : -0.08, 0.12, 0);
                spike.rotation.z = idx === 0 ? -0.4 : 0.4;

                const bicep = addPart(sh, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.075, 0.068, 0.24, 12),
                    this.blackKnightMat
                ));
                bicep.position.set(0, -0.18, 0);

                const elbow = addPart(sh, new THREE.Mesh(
                    new THREE.SphereGeometry(0.075, 10, 8),
                    this.blackKnightHornMat
                ));
                elbow.position.set(0, -0.32, -0.02);

                const vambrace = addPart(sh, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.072, 0.060, 0.22, 12),
                    this.blackKnightMat
                ));
                vambrace.position.set(0, -0.45, 0);

                const glove = addPart(sh, new THREE.Mesh(
                    new THREE.BoxGeometry(0.08, 0.10, 0.08),
                    this.blackKnightMat
                ));
                glove.position.set(0, -0.58, 0);
            });

            ['rightHip', 'leftHip'].forEach((hipKey) => {
                const hip = u[hipKey];
                const thigh = addPart(hip, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.115, 0.092, 0.34, 12),
                    this.blackKnightMat
                ));
                thigh.position.set(0, -0.16, 0);
                thigh.scale.set(0.95, 1.0, 1.05);

                const knee = addPart(hip, new THREE.Mesh(
                    new THREE.ConeGeometry(0.04, 0.10, 4),
                    this.blackKnightHornMat
                ));
                knee.position.set(0, -0.33, 0.09);
                knee.rotation.x = Math.PI / 2;

                const shin = addPart(hip, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.088, 0.072, 0.30, 12),
                    this.blackKnightMat
                ));
                shin.position.set(0, -0.48, 0);

                const foot = addPart(hip, new THREE.Mesh(
                    new THREE.BoxGeometry(0.11, 0.08, 0.22),
                    this.blackKnightMat
                ));
                foot.position.set(0, -0.64, 0.04);
            });

        } else if (skinId === 'shinobi') {
            // ------------------------------------------------
            // SHINOBI OF THE EAST (Midnight Cowl & Oni Mask)
            // ------------------------------------------------
            const cowl = addPart(u.headGroup, new THREE.Mesh(
                new THREE.SphereGeometry(0.18, 16, 14),
                this.shinobiClothMat
            ));
            cowl.scale.set(0.86, 1.02, 0.94);

            const oniMask = addPart(u.headGroup, new THREE.Mesh(
                new THREE.CylinderGeometry(0.16, 0.14, 0.15, 10, 1, false, -Math.PI * 0.35, Math.PI * 0.70),
                this.shinobiMaskMat
            ));
            oniMask.position.set(0, -0.04, 0.06);

            const eyes = addPart(u.headGroup, new THREE.Mesh(
                new THREE.BoxGeometry(0.18, 0.02, 0.04),
                new THREE.MeshBasicMaterial({ color: 0xffcc00 })
            ));
            eyes.position.set(0, 0.02, 0.16);

            const gi = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.24, 0.20, 0.48, 14),
                this.shinobiClothMat
            ));
            gi.position.set(0, 0.02, 0);
            gi.scale.set(1.02, 1.0, 0.84);

            const ropeBelt = addPart(u.torso, new THREE.Mesh(
                new THREE.TorusGeometry(0.21, 0.03, 8, 16),
                this.shinobiRopeMat
            ));
            ropeBelt.position.set(0, -0.16, 0);
            ropeBelt.rotation.x = Math.PI / 2;

            const hakamaF = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.21, 0.25, 0.30, 12, 1, false, -Math.PI * 0.38, Math.PI * 0.76),
                this.shinobiClothMat
            ));
            hakamaF.position.set(0, -0.34, 0.02);

            ['rightShoulder', 'leftShoulder'].forEach((shKey) => {
                const sh = u[shKey];
                const bicep = addPart(sh, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.072, 0.062, 0.24, 12),
                    this.shinobiClothMat
                ));
                bicep.position.set(0, -0.18, 0);

                const vambrace = addPart(sh, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.068, 0.058, 0.22, 12),
                    this.leatherMat
                ));
                vambrace.position.set(0, -0.45, 0);

                const glove = addPart(sh, new THREE.Mesh(
                    new THREE.BoxGeometry(0.075, 0.09, 0.075),
                    this.shinobiClothMat
                ));
                glove.position.set(0, -0.58, 0);
            });

            ['rightHip', 'leftHip'].forEach((hipKey) => {
                const hip = u[hipKey];
                const thigh = addPart(hip, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.11, 0.088, 0.34, 12),
                    this.shinobiClothMat
                ));
                thigh.position.set(0, -0.16, 0);

                const shin = addPart(hip, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.082, 0.068, 0.30, 12),
                    this.shinobiRopeMat
                ));
                shin.position.set(0, -0.48, 0);

                const foot = addPart(hip, new THREE.Mesh(
                    new THREE.BoxGeometry(0.10, 0.07, 0.20),
                    this.shinobiClothMat
                ));
                foot.position.set(0, -0.64, 0.04);
            });

        } else if (skinId === 'solaire') {
            // ------------------------------------------------
            // SOLAIRE OF ASTORA (Warrior of Sunlight)
            // ------------------------------------------------
            const helm = addPart(u.headGroup, new THREE.Mesh(
                new THREE.CylinderGeometry(0.17, 0.18, 0.32, 16),
                this.steelMat
            ));

            const crossH = addPart(u.headGroup, new THREE.Mesh(
                new THREE.BoxGeometry(0.22, 0.04, 0.03),
                this.goldTrimMat
            ));
            crossH.position.set(0, 0.02, 0.17);

            const crossV = addPart(u.headGroup, new THREE.Mesh(
                new THREE.BoxGeometry(0.04, 0.24, 0.03),
                this.goldTrimMat
            ));
            crossV.position.set(0, 0.0, 0.17);

            const plume = addPart(u.headGroup, new THREE.Mesh(
                new THREE.ConeGeometry(0.06, 0.28, 6),
                this.solairePlumeMat
            ));
            plume.position.set(0, 0.25, -0.06);
            plume.rotation.x = -0.45;

            const tunic = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.23, 0.48, 16),
                this.solaireSunMat
            ));
            tunic.position.set(0, 0.02, 0);
            tunic.scale.set(1.06, 1.0, 0.86);

            const belt = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.21, 0.215, 0.07, 16),
                this.leatherMat
            ));
            belt.position.set(0, -0.16, 0);

            const skirtF = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.21, 0.26, 0.32, 12, 1, false, -Math.PI * 0.38, Math.PI * 0.76),
                this.solaireClothMat
            ));
            skirtF.position.set(0, -0.36, 0.02);
            skirtF.rotation.x = 0.12;

            const skirtB = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.21, 0.26, 0.32, 12, 1, false, Math.PI * 0.62, Math.PI * 0.76),
                this.solaireClothMat
            ));
            skirtB.position.set(0, -0.36, -0.02);
            skirtB.rotation.x = -0.12;

            ['rightShoulder', 'leftShoulder'].forEach((shKey) => {
                const sh = u[shKey];
                const epaulet = addPart(sh, new THREE.Mesh(
                    new THREE.BoxGeometry(0.20, 0.05, 0.22),
                    this.solairePlumeMat
                ));
                epaulet.position.set(0, 0.06, 0);

                const bicep = addPart(sh, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.075, 0.068, 0.24, 12),
                    this.solaireChainmailMat
                ));
                bicep.position.set(0, -0.18, 0);

                const vambrace = addPart(sh, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.072, 0.060, 0.22, 12),
                    this.leatherMat
                ));
                vambrace.position.set(0, -0.45, 0);

                const glove = addPart(sh, new THREE.Mesh(
                    new THREE.BoxGeometry(0.08, 0.10, 0.08),
                    this.steelMat
                ));
                glove.position.set(0, -0.58, 0);
            });

            ['rightHip', 'leftHip'].forEach((hipKey) => {
                const hip = u[hipKey];
                const thigh = addPart(hip, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.115, 0.092, 0.34, 12),
                    this.solaireChainmailMat
                ));
                thigh.position.set(0, -0.16, 0);

                const knee = addPart(hip, new THREE.Mesh(
                    new THREE.SphereGeometry(0.085, 10, 8, 0, Math.PI, 0, Math.PI),
                    this.steelMat
                ));
                knee.position.set(0, -0.33, 0.05);

                const shin = addPart(hip, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.088, 0.072, 0.30, 12),
                    this.steelMat
                ));
                shin.position.set(0, -0.48, 0);

                const foot = addPart(hip, new THREE.Mesh(
                    new THREE.BoxGeometry(0.11, 0.08, 0.22),
                    this.leatherMat
                ));
                foot.position.set(0, -0.64, 0.04);
            });

        } else if (skinId === 'onion' || skinId === 'onion_knight') {
            // ------------------------------------------------
            // SIEGMEYER OF CATARINA (The Onion Knight)
            // ------------------------------------------------
            const onionHelm = addPart(u.headGroup, new THREE.Mesh(
                new THREE.SphereGeometry(0.22, 16, 12),
                this.onionPlateMat
            ));
            onionHelm.scale.set(1.2, 0.85, 1.2);

            const brim = addPart(u.headGroup, new THREE.Mesh(
                new THREE.CylinderGeometry(0.32, 0.32, 0.03, 16),
                this.onionPlateMat
            ));
            brim.position.y = -0.06;

            const spindle = addPart(u.headGroup, new THREE.Mesh(
                new THREE.ConeGeometry(0.035, 0.15, 8),
                this.onionBrassMat
            ));
            spindle.position.y = 0.22;

            const visor = addPart(u.headGroup, new THREE.Mesh(
                new THREE.BoxGeometry(0.24, 0.03, 0.06),
                new THREE.MeshBasicMaterial({ color: 0x111111 })
            ));
            visor.position.set(0, -0.02, 0.19);

            const bulbousChest = addPart(u.torso, new THREE.Mesh(
                new THREE.SphereGeometry(0.36, 16, 14),
                this.onionPlateMat
            ));
            bulbousChest.position.y = 0.02;
            bulbousChest.scale.set(1.18, 1.05, 1.18);

            const waistRing = addPart(u.torso, new THREE.Mesh(
                new THREE.TorusGeometry(0.34, 0.04, 8, 16),
                this.onionBrassMat
            ));
            waistRing.position.y = -0.16;
            waistRing.rotation.x = Math.PI / 2;

            ['rightShoulder', 'leftShoulder'].forEach((shKey) => {
                const sh = u[shKey];
                const pauld = addPart(sh, new THREE.Mesh(
                    new THREE.SphereGeometry(0.16, 12, 10),
                    this.onionPlateMat
                ));
                pauld.position.set(0, 0.05, 0);

                const bicep = addPart(sh, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.08, 0.07, 0.24, 12),
                    this.onionPlateMat
                ));
                bicep.position.set(0, -0.18, 0);

                const vambrace = addPart(sh, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.075, 0.065, 0.22, 12),
                    this.onionPlateMat
                ));
                vambrace.position.set(0, -0.45, 0);

                const glove = addPart(sh, new THREE.Mesh(
                    new THREE.BoxGeometry(0.08, 0.10, 0.08),
                    this.steelMat
                ));
                glove.position.set(0, -0.58, 0);
            });

            ['rightHip', 'leftHip'].forEach((hipKey) => {
                const hip = u[hipKey];
                const thigh = addPart(hip, new THREE.Mesh(
                    new THREE.SphereGeometry(0.15, 12, 10),
                    this.onionPlateMat
                ));
                thigh.position.set(0, -0.16, 0);

                const shin = addPart(hip, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.10, 0.082, 0.30, 12),
                    this.onionPlateMat
                ));
                shin.position.set(0, -0.48, 0);

                const foot = addPart(hip, new THREE.Mesh(
                    new THREE.BoxGeometry(0.14, 0.09, 0.24),
                    this.onionPlateMat
                ));
                foot.position.set(0, -0.64, 0.04);
            });

        } else {
            // ------------------------------------------------
            // NORTHERN WARRIOR (SCULPTED 3D WARRIOR • REFERENCE IMAGE 5)
            // ------------------------------------------------
            // 1. Helmet: Fluted Sallet/Bascinet with rounded skull dome & brow visor
            const helmDome = addPart(u.headGroup, new THREE.Mesh(
                new THREE.SphereGeometry(0.18, 16, 14),
                this.steelMat
            ));
            helmDome.scale.set(0.86, 1.05, 0.96);

            const helmComb = addPart(u.headGroup, new THREE.Mesh(
                new THREE.CylinderGeometry(0.012, 0.030, 0.36, 8),
                this.goldTrimMat
            ));
            helmComb.position.set(0, 0.16, -0.02);
            helmComb.rotation.z = Math.PI / 2;
            helmComb.rotation.y = Math.PI / 2;

            const visorBrow = addPart(u.headGroup, new THREE.Mesh(
                new THREE.CylinderGeometry(0.19, 0.20, 0.08, 14, 1, false, -Math.PI * 0.38, Math.PI * 0.76),
                this.steelMat
            ));
            visorBrow.position.set(0, 0.04, 0.03);

            const visorSlit = addPart(u.headGroup, new THREE.Mesh(
                new THREE.BoxGeometry(0.24, 0.024, 0.04),
                new THREE.MeshBasicMaterial({ color: 0x66ddff })
            ));
            visorSlit.position.set(0, 0.015, 0.17);

            // Radiant cyan eye-gaze illumination
            const knightEyeLight = new THREE.PointLight(0x44ddff, 0.75, 1.8);
            knightEyeLight.position.set(0, 0.02, 0.22);
            u.headGroup.add(knightEyeLight);
            u.skinMeshes.push(knightEyeLight);

            const bevor = addPart(u.headGroup, new THREE.Mesh(
                new THREE.CylinderGeometry(0.17, 0.15, 0.14, 14, 1, false, -Math.PI * 0.40, Math.PI * 0.80),
                this.darkSteelMat
            ));
            bevor.position.set(0, -0.09, 0.04);

            const gorget = addPart(u.headGroup, new THREE.Mesh(
                new THREE.CylinderGeometry(0.12, 0.16, 0.14, 12),
                this.darkSteelMat
            ));
            gorget.position.set(0, -0.18, 0);

            // 2. Torso: Contoured Breastplate, Leather Doublet, Fur Mantle, Baldric & Quilted Skirt
            const chestPlate = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.22, 0.32, 16),
                this.steelMat
            ));
            chestPlate.position.set(0, 0.14, 0);
            chestPlate.scale.set(1.06, 1.0, 0.86);

            const chestKeel = addPart(u.torso, new THREE.Mesh(
                new THREE.BoxGeometry(0.026, 0.30, 0.04),
                this.goldTrimMat
            ));
            chestKeel.position.set(0, 0.14, 0.17);

            // Golden Lion Crest Emblem on breastplate
            const chestEmblem = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.075, 0.075, 0.025, 12),
                this.goldTrimMat
            ));
            chestEmblem.position.set(0, 0.18, 0.175);
            chestEmblem.rotation.x = Math.PI / 2;

            const abdomen = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.22, 0.195, 0.22, 16),
                this.darkSteelMat
            ));
            abdomen.position.set(0, -0.12, 0);
            abdomen.scale.set(1.02, 1.0, 0.84);

            // Fur Mantle & Collar around neck & shoulders (Reference Image 5)
            const furCollar = addPart(u.torso, new THREE.Mesh(
                new THREE.TorusGeometry(0.24, 0.075, 8, 16),
                this.furMantleMat
            ));
            furCollar.position.set(0, 0.28, 0);
            furCollar.rotation.x = 0.15;

            const furShoulderPelt = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.28, 0.20, 14, 1, false, Math.PI * 0.60, Math.PI * 0.80),
                this.furMantleMat
            ));
            furShoulderPelt.position.set(0, 0.18, -0.07);

            // Leather Belt with 3D Steel Buckle
            const belt = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.21, 0.215, 0.07, 16),
                this.leatherMat
            ));
            belt.position.set(0, -0.16, 0);

            const buckle = addPart(u.torso, new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.065, 0.03),
                this.steelBuckleMat
            ));
            buckle.position.set(0, -0.16, 0.18);

            // Diagonal Leather Baldric Strap across chest (anchors back sheath)
            const baldric = addPart(u.torso, new THREE.Mesh(
                new THREE.BoxGeometry(0.06, 0.66, 0.025),
                this.leatherMat
            ));
            baldric.position.set(-0.02, 0.12, 0.17);
            baldric.rotation.z = -0.52;

            // Quilted Gambeson Faulds / Skirt with diamond pattern (Reference Image 5)
            const skirtFront = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.21, 0.26, 0.32, 12, 1, false, -Math.PI * 0.38, Math.PI * 0.76),
                this.quiltedSkirtMat
            ));
            skirtFront.position.set(0, -0.36, 0.02);
            skirtFront.rotation.x = 0.12;

            const skirtRear = addPart(u.torso, new THREE.Mesh(
                new THREE.CylinderGeometry(0.21, 0.26, 0.32, 12, 1, false, Math.PI * 0.62, Math.PI * 0.76),
                this.quiltedSkirtMat
            ));
            skirtRear.position.set(0, -0.36, -0.02);
            skirtRear.rotation.x = -0.12;

            // 3. Pauldrons & Arms
            ['rightShoulder', 'leftShoulder'].forEach((shKey) => {
                const sh = u[shKey];
                const pauld = addPart(sh, new THREE.Mesh(
                    new THREE.SphereGeometry(0.14, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
                    this.steelMat
                ));
                pauld.position.set(0, 0.05, 0);
                pauld.scale.set(1.1, 0.9, 1.25);

                const pauldLame = addPart(sh, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.13, 0.11, 0.10, 12, 1, true, -Math.PI * 0.45, Math.PI * 0.90),
                    this.steelMat
                ));
                pauldLame.position.set(0, -0.06, 0);

                const bicep = addPart(sh, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.075, 0.068, 0.24, 12),
                    this.leatherMat
                ));
                bicep.position.set(0, -0.18, 0);

                const elbow = addPart(sh, new THREE.Mesh(
                    new THREE.SphereGeometry(0.075, 10, 8),
                    this.steelMat
                ));
                elbow.position.set(0, -0.32, -0.02);

                const vambrace = addPart(sh, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.072, 0.060, 0.22, 12),
                    this.steelMat
                ));
                vambrace.position.set(0, -0.45, 0);

                const glove = addPart(sh, new THREE.Mesh(
                    new THREE.BoxGeometry(0.08, 0.10, 0.08),
                    this.leatherMat
                ));
                glove.position.set(0, -0.58, 0);

                // Articulated 3D Gauntlet Fingers
                for (let fi = 0; fi < 4; fi++) {
                    const fingerPlate = addPart(sh, new THREE.Mesh(
                        new THREE.BoxGeometry(0.018, 0.055, 0.022),
                        this.steelMat
                    ));
                    fingerPlate.position.set(-0.027 + fi * 0.018, -0.62, 0.038);
                    fingerPlate.rotation.x = 0.5;
                }
            });

            // 4. Contoured Legs & Leather Boots
            ['rightHip', 'leftHip'].forEach((hipKey) => {
                const hip = u[hipKey];
                const thigh = addPart(hip, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.115, 0.092, 0.34, 12),
                    this.darkSteelMat
                ));
                thigh.position.set(0, -0.16, 0);
                thigh.scale.set(0.95, 1.0, 1.05);

                const knee = addPart(hip, new THREE.Mesh(
                    new THREE.SphereGeometry(0.085, 10, 8, 0, Math.PI, 0, Math.PI),
                    this.steelMat
                ));
                knee.position.set(0, -0.33, 0.05);

                // Fluted poleyn side wing
                const kneeFan = addPart(hip, new THREE.Mesh(
                    new THREE.BoxGeometry(0.025, 0.10, 0.06),
                    this.goldTrimMat
                ));
                kneeFan.position.set(hipKey === 'rightHip' ? 0.09 : -0.09, -0.33, 0.03);

                const greave = addPart(hip, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.088, 0.072, 0.30, 12),
                    this.steelMat
                ));
                greave.position.set(0, -0.48, 0);

                const bootCuff = addPart(hip, new THREE.Mesh(
                    new THREE.TorusGeometry(0.075, 0.018, 6, 12),
                    this.leatherMat
                ));
                bootCuff.position.set(0, -0.56, 0);
                bootCuff.rotation.x = Math.PI / 2;

                const foot = addPart(hip, new THREE.Mesh(
                    new THREE.BoxGeometry(0.11, 0.08, 0.22),
                    this.leatherMat
                ));
                foot.position.set(0, -0.64, 0.04);

                const toe = addPart(hip, new THREE.Mesh(
                    new THREE.CylinderGeometry(0.055, 0.055, 0.11, 8),
                    this.leatherMat
                ));
                toe.position.set(0, -0.64, 0.13);
                toe.rotation.z = Math.PI / 2;
            });
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
    attachHollowEyes(head, eyeColor = 0xc93010, isBloathead = false) {
        if (!head) return;

        const socketMat = this.hollowSocketMat || new THREE.MeshStandardMaterial({
            color: 0x221e1a,
            roughness: 0.88
        });

        // Dark sunken skeletal eye sockets
        const socketGeo = new THREE.BoxGeometry(0.065, 0.045, 0.02);
        const socketL = new THREE.Mesh(socketGeo, socketMat);
        socketL.position.set(-0.075, 0.04, 0.148);
        head.add(socketL);

        const socketR = new THREE.Mesh(socketGeo, socketMat);
        socketR.position.set(0.075, 0.04, 0.148);
        head.add(socketR);

        // Subtle sunken soul embers recessed deep inside the sockets
        const emberGeo = new THREE.SphereGeometry(isBloathead ? 0.020 : 0.015, 6, 6);
        const emberMat = new THREE.MeshBasicMaterial({ color: eyeColor });
        const emberL = new THREE.Mesh(emberGeo, emberMat);
        emberL.position.set(-0.075, 0.04, 0.150);
        head.add(emberL);

        const emberR = new THREE.Mesh(emberGeo, emberMat);
        emberR.position.set(0.075, 0.04, 0.150);
        head.add(emberR);

        // Subtle hollow brow ridge
        const browGeo = new THREE.BoxGeometry(0.24, 0.03, 0.025);
        const brow = new THREE.Mesh(browGeo, socketMat);
        brow.position.set(0, 0.075, 0.152);
        head.add(brow);

        // Sunken hollow mouth cavity
        const mouthGeo = new THREE.BoxGeometry(0.12, 0.018, 0.015);
        const mouth = new THREE.Mesh(mouthGeo, socketMat);
        mouth.position.set(0, -0.07, 0.15);
        head.add(mouth);
    }

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

        // Authentic Dark Souls sunken eye sockets with deep soul embers
        this.attachHollowEyes(head, 0xc93010);

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
    // CREATE UNDEAD HOLLOW ARCHER (RANGED SNIPER)
    // ----------------------------------------------------
    createHollowArcher(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 0.95;
        root.add(bodyGroup);

        const torsoMat = this.hollowRagsMat || this.quiltedSkirtMat;
        const skinMat = this.hollowSkinMat;

        // 1. Torso wearing tattered archer cowl
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.58, 0.28), torsoMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // 2. Head with archer cowl / hood
        const headGroup = new THREE.Group();
        headGroup.position.y = 0.48;
        torso.add(headGroup);

        const skull = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.28), skinMat);
        skull.castShadow = true;
        headGroup.add(skull);

        const cowl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.34), torsoMat);
        cowl.position.set(0, 0.04, -0.04);
        headGroup.add(cowl);

        // Authentic Dark Souls sunken eye sockets with deep soul embers
        this.attachHollowEyes(headGroup, 0xc93010);

        const soulLight = new THREE.PointLight(0xff2200, 0.45, 1.8);
        soulLight.position.set(0, 0.04, 0.18);
        headGroup.add(soulLight);

        // 3. Quiver with Bodkin Arrows on Back
        const quiverGroup = new THREE.Group();
        quiverGroup.position.set(0.12, 0.10, -0.18);
        quiverGroup.rotation.set(-0.15, 0, -0.38);
        torso.add(quiverGroup);

        const quiverBody = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.72, 8), this.leatherMat);
        quiverBody.castShadow = true;
        quiverGroup.add(quiverBody);

        for (let a = 0; a < 5; a++) {
            const arrowShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.75, 5), this.leatherMat);
            arrowShaft.position.set(-0.03 + (a % 3) * 0.03, 0.32 + (a % 2) * 0.06, (a > 2 ? 0.03 : -0.03));
            quiverGroup.add(arrowShaft);

            const fletch = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.12, 0.05), new THREE.MeshStandardMaterial({ color: 0xdd2222 }));
            fletch.position.set(-0.03 + (a % 3) * 0.03, 0.65, (a > 2 ? 0.03 : -0.03));
            quiverGroup.add(fletch);
        }

        // 4. Left Arm holding the Longbow
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.32, 0.20, 0);
        torso.add(leftShoulder);

        const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.46, 0.11), skinMat);
        lArm.position.y = -0.23;
        leftShoulder.add(lArm);

        const bowGroup = new THREE.Group();
        bowGroup.position.set(0, -0.42, 0.15);
        leftShoulder.add(bowGroup);

        const bowCurve = new THREE.Mesh(
            new THREE.TorusGeometry(0.55, 0.024, 6, 14, Math.PI * 0.72),
            new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.7 })
        );
        bowCurve.rotation.z = Math.PI * 0.64;
        bowGroup.add(bowCurve);

        const bowString = new THREE.Mesh(
            new THREE.CylinderGeometry(0.004, 0.004, 0.95, 4),
            new THREE.MeshBasicMaterial({ color: 0xeeeeee })
        );
        bowString.position.x = 0.16;
        bowGroup.add(bowString);

        // 5. Right Arm (Draw Arm & Notched Arrow)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.32, 0.20, 0);
        torso.add(rightShoulder);

        const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.46, 0.11), skinMat);
        rArm.position.y = -0.23;
        rightShoulder.add(rArm);

        const notchedArrow = new THREE.Group();
        notchedArrow.position.set(0, -0.42, 0.1);
        rightShoulder.add(notchedArrow);

        const nShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.85, 6), this.leatherMat);
        nShaft.rotation.x = Math.PI / 2;
        nShaft.position.z = 0.42;
        notchedArrow.add(nShaft);

        const nTip = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.14, 4), this.steelMat);
        nTip.rotation.x = -Math.PI / 2;
        nTip.position.z = 0.88;
        notchedArrow.add(nTip);

        // 6. Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.15, -0.32, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.58, 0.12), skinMat);
        rLeg.position.y = -0.29;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.15, -0.32, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.58, 0.12), skinMat);
        lLeg.position.y = -0.29;
        leftHip.add(lLeg);

        root.userData = {
            type: 'archer',
            mobType: 'ranged',
            bodyGroup,
            torso,
            head: headGroup,
            rightShoulder,
            leftShoulder,
            rightHip,
            leftHip,
            bowGroup,
            bowString,
            notchedArrow,
            quiverGroup
        };

        this.scene.add(root);
        return root;
    }

    createArrowMesh() {
        const arrow = new THREE.Group();

        // 1. Ash wood shaft (length 0.85m)
        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.014, 0.014, 0.82, 6),
            new THREE.MeshStandardMaterial({ color: 0x6e4e3a, roughness: 0.75 })
        );
        shaft.castShadow = true;
        arrow.add(shaft);

        // 2. Steel pyramid bodkin point
        const bodkin = new THREE.Mesh(
            new THREE.ConeGeometry(0.038, 0.15, 4),
            this.steelMat
        );
        bodkin.position.y = 0.45;
        bodkin.castShadow = true;
        arrow.add(bodkin);

        // 3. Fletching (3 vanes)
        for (let f = 0; f < 3; f++) {
            const feather = new THREE.Mesh(
                new THREE.BoxGeometry(0.005, 0.14, 0.045),
                new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.8 })
            );
            feather.position.y = -0.32;
            feather.rotation.y = (f * Math.PI * 2) / 3;
            arrow.add(feather);
        }

        // Speed trail glow
        const glow = new THREE.PointLight(0xffeedd, 0.4, 1.2);
        glow.position.y = 0.2;
        arrow.add(glow);

        return arrow;
    }

    // ----------------------------------------------------
    // CREATE PROCEDURAL MOB (30 MOBS COMPENDIUM)
    // Supports 30 distinct mob types with unique geometries, weapons & materials
    // ----------------------------------------------------
    createMob(mobDef, x, z, angle = 0, y = 0) {
        const type = (mobDef && (mobDef.meshType || mobDef.id)) || 'torch_hollow';

        if (type.includes('gorgon')) {
            return this.createGorgonMedusa(x, z, angle, y);
        } else if (type.includes('giant_cobra') || type.includes('pit_viper') || type.includes('serpent_swarm') || type === 'snake' || type === 'serpent' || type.includes('viper')) {
            return this.createGiantSerpent(x, z, angle, y);
        } else if (type.includes('man_serpent')) {
            return this.createManSerpent(x, z, angle, y);
        } else if (type.includes('archer') || (mobDef && mobDef.isArcher) || (mobDef && mobDef.aiType === 'Ranged')) {
            return this.createHollowArcher(x, z, angle, y, mobDef);
        }

        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 0.95;
        root.add(bodyGroup);

        // Materials setup
        let torsoMat = this.hollowRagsMat || this.rustedIronMat;
        let skinMat = this.hollowSkinMat;
        let weaponMat = this.rustedIronMat || this.darkSteelMat;

        if (type.includes('crystal') || type.includes('golem')) {
            torsoMat = this.mobCrystalMat || this.darkSteelMat;
            skinMat = this.mobCrystalMat || this.darkSteelMat;
            weaponMat = this.mobCrystalMat || this.darkSteelMat;
        } else if (type.includes('ghost')) {
            torsoMat = this.mobGhostMat;
            skinMat = this.mobGhostMat;
            weaponMat = this.mobGhostMat;
        } else if (type.includes('slime')) {
            torsoMat = this.mobSlimeMat;
            skinMat = this.mobSlimeMat;
            weaponMat = this.mobSlimeMat;
        } else if (type.includes('silver')) {
            torsoMat = this.mobSilverKnightMat;
            skinMat = this.mobSilverKnightMat;
            weaponMat = this.mobSilverKnightMat;
        } else if (type.includes('black_knight') || type.includes('darkwraith')) {
            torsoMat = this.darkSteelMat;
            skinMat = this.darkSteelMat;
            weaponMat = this.darkSteelMat;
        } else if (type.includes('stone')) {
            torsoMat = this.mobStoneKnightMat;
            skinMat = this.mobStoneKnightMat;
            weaponMat = this.mobStoneKnightMat;
        } else if (type.includes('treant')) {
            torsoMat = this.mobTreantBarkMat;
            skinMat = this.mobTreantBarkMat;
            weaponMat = this.mobTreantFoliageMat;
        } else if (type.includes('painting')) {
            torsoMat = this.mobWhiteRobeMat;
            skinMat = this.hollowSkinMat;
            weaponMat = this.darkSteelMat;
        } else if (type.includes('skeleton') || type.includes('skeletal')) {
            torsoMat = this.boneMat;
            skinMat = this.boneMat;
            weaponMat = this.rustedIronMat;
        }

        // Shared Node Containers for 100% animation safety
        const torso = new THREE.Group();
        bodyGroup.add(torso);

        const head = new THREE.Group();
        head.position.y = 0.5;
        torso.add(head);

        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.32, 0.2, 0);
        torso.add(rightShoulder);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.32, 0.2, 0);
        torso.add(leftShoulder);

        const rightHip = new THREE.Group();
        rightHip.position.set(0.16, -0.3, 0);
        torso.add(rightHip);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.16, -0.3, 0);
        torso.add(leftHip);

        let weapon = null;

        // Specialized Mob Archetypes
        if (type === 'acid_slime') {
            bodyGroup.position.y = 0.25;
            const slimeDome = new THREE.Mesh(new THREE.SphereGeometry(0.65, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), torsoMat);
            slimeDome.scale.set(1.2, 0.8, 1.2);
            torso.add(slimeDome);
            const nucleus = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2), this.mobPustuleMat || this.emberGlowMat);
            nucleus.position.y = 0.2;
            torso.add(nucleus);
            weapon = slimeDome;
        } else if (type === 'wheel_skeleton') {
            const rib = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.4, 0.2), torsoMat);
            torso.add(rib);
            const skull = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.25, 0.24), skinMat);
            head.add(skull);
            const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.08, 8, 16), this.hollowRagsMat);
            wheel.rotation.y = Math.PI / 2;
            torso.add(wheel);
            for (let i = 0; i < 8; i++) {
                const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6), this.hollowRagsMat);
                spoke.rotation.z = (i * Math.PI) / 4;
                wheel.add(spoke);
                const spike = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.2, 4), this.rustedIronMat);
                spike.position.set(Math.cos(i * Math.PI / 4) * 0.65, Math.sin(i * Math.PI / 4) * 0.65, 0);
                spike.rotation.z = i * Math.PI / 4 - Math.PI / 2;
                wheel.add(spike);
            }
            weapon = wheel;
        } else if (type === 'giant_skeleton') {
            root.scale.set(2.0, 2.0, 2.0);
            const rib = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.25), torsoMat);
            torso.add(rib);
            const skull = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, 0.3), skinMat);
            head.add(skull);
            const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.12), skinMat);
            rArm.position.y = -0.3;
            rightShoulder.add(rArm);
            const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.6, 0.12), skinMat);
            lArm.position.y = -0.3;
            leftShoulder.add(lArm);
            const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.65, 0.14), skinMat);
            rLeg.position.y = -0.32;
            rightHip.add(rLeg);
            const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.65, 0.14), skinMat);
            lLeg.position.y = -0.32;
            leftHip.add(lLeg);
            const scim = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.8, 0.04), weaponMat);
            scim.position.set(0, -0.6, 0.6);
            scim.rotation.x = Math.PI / 2.3;
            rightShoulder.add(scim);
            weapon = scim;
        } else if (type === 'skeletal_beast') {
            // Sculpted 3D Skeletal Beast (Tomb of the Giants Bone Quadruped)
            bodyGroup.position.y = 0.55;
            torso.rotation.x = 0.25;

            // Ribbed spine & vertebral column
            const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.95, 6), this.boneMat);
            spine.rotation.x = Math.PI / 2;
            torso.add(spine);

            // Arching ribcage
            for (let rb = 0; rb < 5; rb++) {
                const rib = new THREE.Mesh(new THREE.TorusGeometry(0.22 - rb * 0.02, 0.025, 5, 8, Math.PI), this.boneMat);
                rib.position.set(0, -0.05, -0.28 + rb * 0.14);
                rib.rotation.x = Math.PI;
                torso.add(rib);
            }

            // Terrifying Beast Skull with protruding snout & fangs
            head.position.set(0, 0.18, 0.55);
            const cranium = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.20, 0.28), this.boneMat);
            head.add(cranium);

            const snout = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.26), this.boneMat);
            snout.position.set(0, -0.04, 0.22);
            head.add(snout);

            // Sunken glowing red ember eyes
            const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), this.emberGlowMat || new THREE.MeshBasicMaterial({ color: 0xff2200 }));
            eyeL.position.set(-0.08, 0.04, 0.12);
            head.add(eyeL);
            const eyeR = eyeL.clone();
            eyeR.position.x = 0.08;
            head.add(eyeR);

            // Upper and lower jagged fangs
            for (let f = 0; f < 4; f++) {
                const fang = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.09, 4), this.boneMat);
                fang.position.set((f % 2 === 0 ? -0.06 : 0.06), -0.10, 0.20 + Math.floor(f / 2) * 0.10);
                fang.rotation.x = Math.PI;
                head.add(fang);
            }

            // Articulated forelegs
            const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.52, 6), this.boneMat);
            rArm.position.set(0.22, -0.26, 0.28);
            rArm.rotation.x = -0.2;
            torso.add(rArm);

            const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.52, 6), this.boneMat);
            lArm.position.set(-0.22, -0.26, 0.28);
            lArm.rotation.x = -0.2;
            torso.add(lArm);

            // Articulated hindlegs
            const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.55, 6), this.boneMat);
            rLeg.position.set(0.20, -0.26, -0.28);
            rLeg.rotation.x = 0.25;
            rightHip.add(rLeg);

            const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.55, 6), this.boneMat);
            lLeg.position.set(-0.20, -0.26, -0.28);
            lLeg.rotation.x = 0.25;
            leftHip.add(lLeg);

            weapon = snout;
        } else {
            // Standard Humanoid Geometry Framework
            if (type === 'berenike_knight') root.scale.set(1.35, 1.35, 1.35);
            else if (type === 'infested_barbarian') root.scale.set(1.5, 1.5, 1.5);
            else if (type === 'crystal_golem') root.scale.set(1.4, 1.4, 1.4);
            else if (type === 'stone_guardian') root.scale.set(1.45, 1.45, 1.45);
            else if (type === 'blowdart_sniper') root.scale.set(0.85, 0.85, 0.85);

            const chest = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.6, 0.3), torsoMat);
            chest.castShadow = true;
            torso.add(chest);

            const cranium = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.3), skinMat);
            cranium.castShadow = true;
            head.add(cranium);

            // Authentic Dark Souls sunken hollow eye sockets with soul embers
            const eyeColor = type.includes('crystal') ? 0x00ffff : (type.includes('ghost') ? 0x88ffff : 0xc93010);
            this.attachHollowEyes(head, eyeColor, type === 'chasm_bloathead');

            const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.45, 0.13), skinMat);
            rArm.position.y = -0.22;
            rightShoulder.add(rArm);

            const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.45, 0.13), skinMat);
            lArm.position.y = -0.22;
            leftShoulder.add(lArm);

            const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), skinMat);
            rLeg.position.y = -0.25;
            rightHip.add(rLeg);

            const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.15), skinMat);
            lLeg.position.y = -0.25;
            leftHip.add(lLeg);

            // Archetype specifics & weapons
            if (type === 'torch_hollow') {
                const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.1, 6), this.hollowRagsMat);
                staff.position.set(0, -0.25, 0.4);
                staff.rotation.x = Math.PI / 3;
                rightShoulder.add(staff);
                const flame = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 6), this.mobTorchFlameMat || this.emberGlowMat);
                flame.position.set(0, 0.6, 0);
                staff.add(flame);
                weapon = staff;
            } else if (type === 'pitchfork_peasant') {
                const hat = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.14, 8), this.hollowRagsMat);
                hat.position.y = 0.24;
                head.add(hat);
                const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 6), this.hollowRagsMat);
                staff.position.set(0, -0.2, 0.55);
                staff.rotation.x = Math.PI / 2.4;
                rightShoulder.add(staff);
                [-0.08, 0, 0.08].forEach(ox => {
                    const tine = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.3, 0.02), weaponMat);
                    tine.position.set(ox, 1.0, 0);
                    staff.add(tine);
                });
                weapon = staff;
            } else if (type === 'broken_sword_hollow') {
                torso.rotation.x = 0.25;
                const sword = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.02), weaponMat);
                sword.position.set(0, -0.3, 0.25);
                sword.rotation.x = Math.PI / 2;
                rightShoulder.add(sword);
                weapon = sword;
            } else if (type === 'undead_assassin') {
                const cowl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.34), this.darkSteelMat);
                head.add(cowl);
                const dagR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.45, 0.02), weaponMat);
                dagR.position.set(0, -0.25, 0.2);
                dagR.rotation.x = Math.PI / 2.2;
                rightShoulder.add(dagR);
                const dagL = dagR.clone();
                leftShoulder.add(dagL);
                weapon = dagR;
            } else if (type === 'balder_knight') {
                const plume = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.25, 0.25), this.mobPustuleMat || this.emberGlowMat);
                plume.position.set(0, 0.24, 0);
                head.add(plume);
                const rapier = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6), weaponMat);
                rapier.position.set(0, -0.3, 0.5);
                rapier.rotation.x = Math.PI / 2;
                rightShoulder.add(rapier);
                const buckler = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 8), weaponMat);
                buckler.position.set(0, -0.2, 0.15);
                buckler.rotation.x = Math.PI / 2;
                leftShoulder.add(buckler);
                weapon = rapier;
            } else if (type === 'berenike_knight') {
                const helm = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), weaponMat);
                head.add(helm);
                const mace = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.1, 0.18), weaponMat);
                mace.position.set(0, -0.4, 0.4);
                mace.rotation.x = Math.PI / 2.3;
                rightShoulder.add(mace);
                const shield = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.25, 0.08), weaponMat);
                shield.position.set(-0.1, -0.2, 0.2);
                leftShoulder.add(shield);
                weapon = mace;
            } else if (type === 'crystal_soldier' || type === 'crystal_golem') {
                for (let i = 0; i < 4; i++) {
                    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 5), this.mobCrystalMat || weaponMat);
                    spike.position.set((Math.random() - 0.5) * 0.4, 0.2, -0.15);
                    spike.rotation.set(-0.5, (Math.random() - 0.5), 0);
                    torso.add(spike);
                }
                const crySword = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 0.03), this.mobCrystalMat || weaponMat);
                crySword.position.set(0, -0.3, 0.4);
                crySword.rotation.x = Math.PI / 2.2;
                rightShoulder.add(crySword);
                weapon = crySword;
            } else if (type === 'darkwraith_mob') {
                const skullMask = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.36, 0.32), this.boneMat);
                head.add(skullMask);
                const dSword = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.15, 0.03), this.darkSteelMat);
                dSword.position.set(0, -0.3, 0.45);
                dSword.rotation.x = Math.PI / 2.2;
                rightShoulder.add(dSword);
                const dHand = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), this.mobDarkHandMat || this.emberGlowMat);
                dHand.position.set(0, -0.25, 0.2);
                leftShoulder.add(dHand);
                weapon = dSword;
            } else if (type === 'silver_knight') {
                const sHelm = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.4, 0.34), this.mobSilverKnightMat || weaponMat);
                head.add(sHelm);
                const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.0, 6), this.mobSilverKnightMat || weaponMat);
                spear.position.set(0, -0.2, 0.7);
                spear.rotation.x = Math.PI / 2.2;
                rightShoulder.add(spear);
                const sShield = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.9, 0.05), this.mobSilverKnightMat || weaponMat);
                sShield.position.set(0, -0.2, 0.2);
                leftShoulder.add(sShield);
                weapon = spear;
            } else if (type === 'black_knight_mob' || type.includes('black_knight')) {
                // Authentic 3D Black Knight of Gwyn: Curved horns, armet helm, pauldrons & shield
                const bkHelm = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 10), this.blackKnightMat);
                bkHelm.scale.set(0.9, 1.05, 0.95);
                head.add(bkHelm);

                const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.28, 5), this.blackKnightHornMat);
                hornL.position.set(-0.16, 0.16, 0);
                hornL.rotation.z = 0.55;
                hornL.rotation.x = -0.2;
                head.add(hornL);

                const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.28, 5), this.blackKnightHornMat);
                hornR.position.set(0.16, 0.16, 0);
                hornR.rotation.z = -0.55;
                hornR.rotation.x = -0.2;
                head.add(hornR);

                const pL = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), this.blackKnightMat);
                pL.position.set(-0.06, 0.05, 0);
                leftShoulder.add(pL);

                const pR = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), this.blackKnightMat);
                pR.position.set(0.06, 0.05, 0);
                rightShoulder.add(pR);

                const bAxe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.4, 0.06), this.blackKnightMat);
                bAxe.position.set(0, -0.35, 0.5);
                bAxe.rotation.x = Math.PI / 2.3;
                rightShoulder.add(bAxe);

                const bkShield = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.85, 0.05), this.blackKnightMat);
                bkShield.position.set(0, -0.2, 0.18);
                leftShoulder.add(bkShield);

                weapon = bAxe;
            } else if (type === 'lantern_necromancer') {
                const cowl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.34), this.darkSteelMat);
                head.add(cowl);
                const lantern = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16), this.mobTorchFlameMat || this.emberGlowMat);
                lantern.position.set(0, -0.35, 0.3);
                leftShoulder.add(lantern);
                const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 6), this.hollowRagsMat);
                staff.position.set(0, -0.2, 0.4);
                staff.rotation.x = Math.PI / 2.5;
                rightShoulder.add(staff);
                weapon = staff;
            } else if (type === 'engorged_zombie') {
                for (let i = 0; i < 4; i++) {
                    const pustule = new THREE.Mesh(new THREE.SphereGeometry(0.1), this.mobPustuleMat || this.emberGlowMat);
                    pustule.position.set((Math.random() - 0.5) * 0.3, 0.15 + Math.random() * 0.15, 0.15);
                    head.add(pustule);
                }
                const cleaver = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.7, 0.03), weaponMat);
                cleaver.position.set(0, -0.3, 0.3);
                cleaver.rotation.x = Math.PI / 2.2;
                rightShoulder.add(cleaver);
                weapon = cleaver;
            } else if (type === 'chasm_bloathead') {
                head.scale.set(1.35, 1.35, 1.35);
                // Bloathead: deep sunken eye sockets (random red multi-dots removed)
                const wand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.9, 6), this.darkSteelMat);
                wand.position.set(0, -0.2, 0.3);
                wand.rotation.x = Math.PI / 2.2;
                rightShoulder.add(wand);
                weapon = wand;
            } else if (type === 'tree_treant') {
                const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35), this.mobTreantFoliageMat || torsoMat);
                foliage.position.y = 0.35;
                head.add(foliage);
                const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.02, 1.2, 5), this.mobTreantBarkMat || torsoMat);
                branch.position.set(0, -0.3, 0.4);
                branch.rotation.x = Math.PI / 2.2;
                rightShoulder.add(branch);
                weapon = branch;
            } else if (type === 'stone_guardian') {
                const stShield = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 10), this.mobStoneKnightMat || weaponMat);
                stShield.rotation.x = Math.PI / 2;
                stShield.position.set(0, -0.2, 0.2);
                leftShoulder.add(stShield);
                const stSword = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.2, 0.05), this.mobStoneKnightMat || weaponMat);
                stSword.position.set(0, -0.35, 0.5);
                stSword.rotation.x = Math.PI / 2.2;
                rightShoulder.add(stSword);
                weapon = stSword;
            } else if (type === 'new_londo_ghost') {
                root.position.y += 0.3;
                const gDagger = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.02), this.mobGhostMat || weaponMat);
                gDagger.position.set(0, -0.25, 0.25);
                gDagger.rotation.x = Math.PI / 2.2;
                rightShoulder.add(gDagger);
                weapon = gDagger;
            } else {
                const sword = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.02), weaponMat);
                sword.position.set(0, -0.4, 0.35);
                sword.rotation.x = Math.PI / 2.2;
                rightShoulder.add(sword);
                weapon = sword;
            }
        }

        root.userData = {
            def: mobDef,
            bodyGroup,
            torso,
            head,
            rightShoulder,
            leftShoulder,
            rightHip,
            leftHip,
            rightArm: rightShoulder,
            leftArm: leftShoulder,
            rightLeg: rightHip,
            leftLeg: leftHip,
            weapon: weapon || rightShoulder
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

    // ----------------------------------------------------
    // 10 NEW BOSSES: SCULPTED 3D GEOMETRY RIGS
    // ----------------------------------------------------

    // 1. ASYLUM DEMON (Northern Undead Asylum)
    createAsylumDemon(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.4;
        root.add(bodyGroup);

        // Huge bulbous demon torso with pot belly
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.4, 2.2, 10), this.asylumFleshMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        const belly = new THREE.Mesh(new THREE.SphereGeometry(1.1, 10, 8), this.asylumFleshMat);
        belly.scale.set(1.05, 0.9, 1.25);
        belly.position.set(0, -0.2, 0.45);
        torso.add(belly);

        // Demon Head with curling horns
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.35, 0.35);
        torso.add(headGroup);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), this.asylumFleshMat);
        head.castShadow = true;
        headGroup.add(head);

        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff2200 });
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.12), eyeMat);
        eyeL.position.set(-0.28, 0.1, 0.55);
        const eyeR = eyeL.clone();
        eyeR.position.x = 0.28;
        headGroup.add(eyeL);
        headGroup.add(eyeR);

        // Swept-back Horns
        const hornGeo = new THREE.CylinderGeometry(0.06, 0.24, 1.4, 6);
        const hornL = new THREE.Mesh(hornGeo, this.demonHornMat);
        hornL.position.set(-0.65, 0.5, -0.15);
        hornL.rotation.set(-0.4, 0, 0.7);
        const hornR = hornL.clone();
        hornR.position.x = 0.65;
        hornR.rotation.set(-0.4, 0, -0.7);
        headGroup.add(hornL);
        headGroup.add(hornR);

        // Demon Bat Wings
        const leftWingGroup = new THREE.Group();
        leftWingGroup.position.set(-1.0, 0.6, -0.6);
        torso.add(leftWingGroup);
        const wingL = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 0.08), this.wingMembraneMat);
        wingL.position.set(-0.8, 0.4, 0);
        wingL.rotation.y = -0.3;
        leftWingGroup.add(wingL);

        const rightWingGroup = new THREE.Group();
        rightWingGroup.position.set(1.0, 0.6, -0.6);
        torso.add(rightWingGroup);
        const wingR = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 0.08), this.wingMembraneMat);
        wingR.position.set(0.8, 0.4, 0);
        wingR.rotation.y = 0.3;
        rightWingGroup.add(wingR);

        // Right Arm wielding Demon's Great Hammer (Gargantuan tree-trunk stone club)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.5, 0.7, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 1.3, 8), this.asylumFleshMat);
        rArm.position.y = -0.65;
        rightShoulder.add(rArm);

        const weaponGroup = new THREE.Group();
        weaponGroup.position.y = -1.3;
        rightShoulder.add(weaponGroup);

        const hammerShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 4.4, 8), this.asylumHammerMat);
        hammerShaft.position.y = 0.9;
        weaponGroup.add(hammerShaft);

        const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 1.4), this.asylumHammerMat);
        hammerHead.position.y = 2.6;
        hammerHead.castShadow = true;
        weaponGroup.add(hammerHead);

        // Left Arm
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-1.5, 0.7, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 1.3, 8), this.asylumFleshMat);
        lArm.position.y = -0.65;
        leftShoulder.add(lArm);

        // Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.7, -1.0, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 1.4, 8), this.asylumFleshMat);
        rLeg.position.y = -0.7;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.7, -1.0, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 1.4, 8), this.asylumFleshMat);
        lLeg.position.y = -0.7;
        leftHip.add(lLeg);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, rightHip, leftHip, leftWingGroup, rightWingGroup, weaponGroup };
        this.scene.add(root);
        return root;
    }

    // 2. GAPING DRAGON (The Depths)
    createGapingDragon(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.8;
        root.add(bodyGroup);

        // Vast elongated reptilian torso with massive open ribcage maw
        const torso = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 3.8), this.gapingFleshMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Horrific gaping ribcage cavity opening upward
        const mawCavity = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 3.0), new THREE.MeshBasicMaterial({ color: 0x1a0604 }));
        mawCavity.position.set(0, 0.55, 0.1);
        torso.add(mawCavity);

        // Double rows of jagged ivory teeth along the ribs
        for (let i = -1.2; i <= 1.2; i += 0.35) {
            const toothL = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.65, 4), this.gapingToothMat);
            toothL.position.set(-0.95, 0.95, i);
            toothL.rotation.z = -0.25;
            torso.add(toothL);

            const toothR = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.65, 4), this.gapingToothMat);
            toothR.position.set(0.95, 0.95, i);
            toothR.rotation.z = 0.25;
            torso.add(toothR);
        }

        // Tiny grotesque head sitting far forward below the ribs
        const headGroup = new THREE.Group();
        headGroup.position.set(0, -0.2, 2.3);
        torso.add(headGroup);
        const tinyHead = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.45, 0.9, 6), this.gapingFleshMat);
        tinyHead.rotation.x = Math.PI / 2;
        headGroup.add(tinyHead);

        // 4 Splayed reptilian crawl legs
        const rightHip = new THREE.Group();
        rightHip.position.set(1.4, -0.6, 1.1);
        torso.add(rightHip);
        const rLegF = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 1.4, 6), this.gapingFleshMat);
        rLegF.position.y = -0.6;
        rightHip.add(rLegF);

        const leftHip = new THREE.Group();
        leftHip.position.set(-1.4, -0.6, 1.1);
        torso.add(leftHip);
        const lLegF = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 1.4, 6), this.gapingFleshMat);
        lLegF.position.y = -0.6;
        leftHip.add(lLegF);

        const rearRightHip = new THREE.Group();
        rearRightHip.position.set(1.4, -0.6, -1.2);
        torso.add(rearRightHip);
        const rLegB = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 1.4, 6), this.gapingFleshMat);
        rLegB.position.y = -0.6;
        rearRightHip.add(rLegB);

        const rearLeftHip = new THREE.Group();
        rearLeftHip.position.set(-1.4, -0.6, -1.2);
        torso.add(rearLeftHip);
        const lLegB = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 1.4, 6), this.gapingFleshMat);
        lLegB.position.y = -0.6;
        rearLeftHip.add(lLegB);

        // Heavy spiked tail
        const tailGroup = new THREE.Group();
        tailGroup.position.set(0, 0, -1.9);
        torso.add(tailGroup);
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.65, 3.2, 6), this.gapingFleshMat);
        tail.rotation.x = -Math.PI / 2;
        tail.position.z = -1.5;
        tailGroup.add(tail);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightHip, leftHip, rearRightHip, rearLeftHip, tailGroup };
        this.scene.add(root);
        return root;
    }

    // 3. CHAOS WITCH QUELAAG (Blighttown Swamps)
    createChaosWitchQuelaag(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.6;
        root.add(bodyGroup);

        // Lower Monstrous Chaos Spider Body
        const spiderAbdomen = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 10), this.quelaagChitinMat);
        spiderAbdomen.scale.set(1.2, 0.8, 1.8);
        spiderAbdomen.castShadow = true;
        bodyGroup.add(spiderAbdomen);

        // Glowing molten lava underbelly / venom sac
        const lavaSac = new THREE.Mesh(new THREE.SphereGeometry(1.1, 10, 8), this.quelaagFireMat);
        lavaSac.position.set(0, -0.3, -0.5);
        spiderAbdomen.add(lavaSac);

        const lavaLight = new THREE.PointLight(0xff4400, 3.0, 12);
        lavaLight.position.set(0, 0, 0);
        spiderAbdomen.add(lavaLight);

        // 6 Jointed Spidery Chitin Legs
        const legGroups = [];
        for (let i = 0; i < 6; i++) {
            const side = i % 2 === 0 ? 1 : -1;
            const row = Math.floor(i / 2) - 1; // -1, 0, 1
            const legHip = new THREE.Group();
            legHip.position.set(side * 1.3, -0.1, row * 0.9);
            spiderAbdomen.add(legHip);

            const legUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.8, 6), this.quelaagChitinMat);
            legUpper.position.set(side * 0.8, 0.4, 0);
            legUpper.rotation.z = side * -0.9;
            legHip.add(legUpper);

            const legLower = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 2.0, 6), this.demonHornMat);
            legLower.position.set(side * 1.5, -0.6, 0);
            legLower.rotation.z = side * 0.4;
            legHip.add(legLower);

            legGroups.push(legHip);
        }

        // Upper Human Torso rising seamlessly from the spider cephalothorax
        const humanGroup = new THREE.Group();
        humanGroup.position.set(0, 0.7, 0.8);
        spiderAbdomen.add(humanGroup);

        const humanTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, 1.2, 10), this.quelaagHumanMat);
        humanTorso.castShadow = true;
        humanGroup.add(humanTorso);

        // Long Dark Hair & Face
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.85, 0);
        humanTorso.add(headGroup);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), this.quelaagHumanMat);
        headGroup.add(head);

        const hair = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.45, 1.4, 8), this.capraSkinMat);
        hair.position.set(0, -0.4, -0.12);
        headGroup.add(hair);

        // Right Arm wielding Flaming Quelaag Furysword
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.55, 0.45, 0);
        humanTorso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.85, 6), this.quelaagHumanMat);
        rArm.position.y = -0.42;
        rightShoulder.add(rArm);

        const weaponGroup = new THREE.Group();
        weaponGroup.position.y = -0.85;
        rightShoulder.add(weaponGroup);

        // Curved scimitar blade with blazing orange flame
        const bladeGeo = new THREE.BoxGeometry(0.12, 1.9, 0.32);
        const sword = new THREE.Mesh(bladeGeo, this.sunlightGreatswordMat);
        sword.position.set(0, 0.7, 0.3);
        sword.rotation.x = 0.45;
        weaponGroup.add(sword);

        const swordFlame = new THREE.PointLight(0xff5500, 2.5, 8);
        swordFlame.position.set(0, 1.0, 0.3);
        weaponGroup.add(swordFlame);

        // Left Arm
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.55, 0.45, 0);
        humanTorso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.85, 6), this.quelaagHumanMat);
        lArm.position.y = -0.42;
        leftShoulder.add(lArm);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso: humanTorso, spiderAbdomen, headGroup, rightShoulder, leftShoulder, legGroups, weaponGroup, swordFlame };
        this.scene.add(root);
        return root;
    }

    // 4. MOONLIGHT BUTTERFLY (Darkroot Garden Ruins)
    createMoonlightButterfly(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 3.8; // Levitating high above arena floor
        root.add(bodyGroup);

        // Luminescent slender crystal body
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.15, 2.2, 8), this.butterflyLuminMat);
        torso.rotation.x = Math.PI / 4;
        bodyGroup.add(torso);

        // Glowing crystal head with antennae
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.8, 0.7);
        torso.add(headGroup);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), this.butterflyLuminMat);
        headGroup.add(head);

        const antL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 4), this.butterflyLuminMat);
        antL.position.set(-0.25, 0.6, 0.2);
        antL.rotation.z = 0.4;
        const antR = antL.clone();
        antR.position.x = 0.25;
        antR.rotation.z = -0.4;
        headGroup.add(antL);
        headGroup.add(antR);

        // 4 Giant stained-glass iridescent crystal wings
        const leftWingGroup = new THREE.Group();
        leftWingGroup.position.set(-0.2, 0.3, 0);
        torso.add(leftWingGroup);
        const wingUL = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.2), this.butterflyLuminMat);
        wingUL.position.set(-1.8, 1.2, 0);
        wingUL.rotation.y = -0.25;
        leftWingGroup.add(wingUL);

        const rightWingGroup = new THREE.Group();
        rightWingGroup.position.set(0.2, 0.3, 0);
        torso.add(rightWingGroup);
        const wingUR = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.2), this.butterflyLuminMat);
        wingUR.position.set(1.8, 1.2, 0);
        wingUR.rotation.y = 0.25;
        rightWingGroup.add(wingUR);

        // Ethereal magic radiance
        const mysticLight = new THREE.PointLight(0x00ffff, 4.0, 16);
        mysticLight.position.set(0, 0, 0);
        bodyGroup.add(mysticLight);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, leftWingGroup, rightWingGroup, mysticLight };
        this.scene.add(root);
        return root;
    }

    // 5. IRON GOLEM (Sen's Fortress Ramparts)
    createIronGolem(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.8;
        root.add(bodyGroup);

        // Towering iron-plated automaton torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.6, 1.6), this.ironGolemMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Burning furnace core in center chest
        const coreFurnace = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.4, 12), this.ironGolemCoreMat);
        coreFurnace.rotation.x = Math.PI / 2;
        coreFurnace.position.set(0, 0.2, 0.8);
        torso.add(coreFurnace);

        const coreLight = new THREE.PointLight(0xff6600, 3.2, 10);
        coreLight.position.set(0, 0.2, 1.0);
        torso.add(coreLight);

        // Iron Helm with ocular slit
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.6, 0.1);
        torso.add(headGroup);
        const helm = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.1, 1.0), this.ironGolemMat);
        helm.castShadow = true;
        headGroup.add(helm);

        // Curved heavy pauldrons
        const pauldL = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 8), this.ironGolemMat);
        pauldL.position.set(-1.6, 1.1, 0);
        torso.add(pauldL);
        const pauldR = pauldL.clone();
        pauldR.position.x = 1.6;
        torso.add(pauldR);

        // Right Arm wielding Giant Crescent Core Axe
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.5, 0.9, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 1.5, 8), this.ironGolemMat);
        rArm.position.y = -0.75;
        rightShoulder.add(rArm);

        const weaponGroup = new THREE.Group();
        weaponGroup.position.y = -1.5;
        rightShoulder.add(weaponGroup);

        const axeShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 5.2, 8), this.ironGolemMat);
        axeShaft.position.y = 1.2;
        weaponGroup.add(axeShaft);

        const axeBlade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.2, 1.4), this.steelMat);
        axeBlade.position.set(0, 2.8, 0.7);
        axeBlade.castShadow = true;
        weaponGroup.add(axeBlade);

        // Left Arm
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-1.5, 0.9, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 1.5, 8), this.ironGolemMat);
        lArm.position.y = -0.75;
        leftShoulder.add(lArm);

        // Thick Iron Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.75, -1.2, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.6, 0.7), this.ironGolemMat);
        rLeg.position.y = -0.8;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.75, -1.2, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.6, 0.7), this.ironGolemMat);
        lLeg.position.y = -0.8;
        leftHip.add(lLeg);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, rightHip, leftHip, weaponGroup, coreLight };
        this.scene.add(root);
        return root;
    }

    // 6. DRAGONSLAYER ORNSTEIN (Anor Londo Cathedral)
    createDragonslayerOrnstein(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.1;
        root.add(bodyGroup);

        // 1. Lion-Crested Gilded Cuirass (Layered pectoral plates & waist faulds)
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 1.35, 10), this.ornsteinGoldMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Pectoral Lion Ridge
        const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.48, 0.35), this.ornsteinGoldMat);
        chestPlate.position.set(0, 0.28, 0.16);
        chestPlate.castShadow = true;
        torso.add(chestPlate);

        // Gilded waist faulds / tassets protecting hips
        const tassets = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.58, 0.42, 8), this.ornsteinGoldMat);
        tassets.position.set(0, -0.65, 0);
        tassets.castShadow = true;
        torso.add(tassets);

        // 2. Sculpted Lion Helmet & Flowing Crimson Plume
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.98, 0);
        torso.add(headGroup);

        const helmDome = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), this.ornsteinGoldMat);
        helmDome.scale.set(0.9, 1.1, 1.05);
        helmDome.castShadow = true;
        headGroup.add(helmDome);

        // Lion snout & visor beak
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.26), this.ornsteinGoldMat);
        visor.position.set(0, -0.06, 0.22);
        visor.castShadow = true;
        headGroup.add(visor);

        // Dark recessed eye slit
        const eyeSlit = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.035, 0.05), new THREE.MeshBasicMaterial({ color: 0x110e08 }));
        eyeSlit.position.set(0, 0.01, 0.34);
        headGroup.add(eyeSlit);

        // Lion cheek crests
        const crestL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.26, 4), this.ornsteinGoldMat);
        crestL.position.set(-0.24, 0.14, 0.08);
        crestL.rotation.z = 0.5;
        headGroup.add(crestL);
        const crestR = crestL.clone();
        crestR.position.x = 0.24;
        crestR.rotation.z = -0.5;
        headGroup.add(crestR);

        // Flowing Crimson Plume (curved gracefully down the back of helm)
        const plumeGroup = new THREE.Group();
        plumeGroup.position.set(0, 0.26, -0.16);
        headGroup.add(plumeGroup);

        const plume1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 0.55, 6), this.ornsteinPlumeMat);
        plume1.position.set(0, -0.08, -0.18);
        plume1.rotation.x = -0.75;
        plumeGroup.add(plume1);

        const plume2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 0.45, 6), this.ornsteinPlumeMat);
        plume2.position.set(0, -0.32, -0.42);
        plume2.rotation.x = -1.15;
        plumeGroup.add(plume2);

        // 3. Ornate Layered Pauldrons
        const pauldGeo = new THREE.CylinderGeometry(0.22, 0.38, 0.45, 8);
        const pauldL = new THREE.Mesh(pauldGeo, this.ornsteinGoldMat);
        pauldL.position.set(-0.68, 0.45, 0);
        pauldL.rotation.z = 0.35;
        pauldL.castShadow = true;
        torso.add(pauldL);

        const pauldR = new THREE.Mesh(pauldGeo, this.ornsteinGoldMat);
        pauldR.position.set(0.68, 0.45, 0);
        pauldR.rotation.z = -0.35;
        pauldR.castShadow = true;
        torso.add(pauldR);

        // 4. Right Arm & Dragonslayer Cross-Spear
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.72, 0.38, 0);
        torso.add(rightShoulder);

        const rBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.65, 6), this.ornsteinGoldMat);
        rBicep.position.y = -0.35;
        rBicep.castShadow = true;
        rightShoulder.add(rBicep);

        const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.65, 6), this.ornsteinGoldMat);
        rForearm.position.y = -0.85;
        rForearm.castShadow = true;
        rightShoulder.add(rForearm);

        const weaponGroup = new THREE.Group();
        weaponGroup.position.set(0, -1.05, 0.1);
        rightShoulder.add(weaponGroup);

        // Ash wood polearm shaft
        const shaftMat = new THREE.MeshStandardMaterial({ color: 0x221810, roughness: 0.85 });
        const spearShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 3.8, 8), shaftMat);
        spearShaft.position.y = 1.2;
        spearShaft.castShadow = true;
        weaponGroup.add(spearShaft);

        // Crossguard lion boss & cross prongs
        const crossBoss = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.24), this.ornsteinGoldMat);
        crossBoss.position.y = 2.9;
        weaponGroup.add(crossBoss);

        const crossWings = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, 0.08), this.ornsteinGoldMat);
        crossWings.position.y = 2.9;
        weaponGroup.add(crossWings);

        // Razor diamond thrusting spearhead
        const spearHead = new THREE.Mesh(new THREE.ConeGeometry(0.14, 1.25, 4), this.steelMat);
        spearHead.position.y = 3.65;
        spearHead.castShadow = true;
        weaponGroup.add(spearHead);

        // Lightning point light
        const spearLight = new THREE.PointLight(0xffea00, 1.5, 8);
        spearLight.position.set(0, 3.5, 0);
        weaponGroup.add(spearLight);

        // 5. Left Arm (Gauntleted Guard)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.72, 0.38, 0);
        torso.add(leftShoulder);

        const lBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.65, 6), this.ornsteinGoldMat);
        lBicep.position.y = -0.35;
        lBicep.castShadow = true;
        leftShoulder.add(lBicep);

        const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.65, 6), this.ornsteinGoldMat);
        lForearm.position.y = -0.85;
        lForearm.castShadow = true;
        leftShoulder.add(lForearm);

        // 6. Articulated Legs (Cuisses, Poleyn Knees, Greaves & Sabatons)
        const rightHip = new THREE.Group();
        rightHip.position.set(0.32, -0.72, 0);
        torso.add(rightHip);

        const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 0.75, 6), this.ornsteinGoldMat);
        rThigh.position.y = -0.4;
        rThigh.castShadow = true;
        rightHip.add(rThigh);

        const rKnee = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.18), this.ornsteinGoldMat);
        rKnee.position.set(0, -0.82, 0.08);
        rightHip.add(rKnee);

        const rCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.75, 6), this.ornsteinGoldMat);
        rCalf.position.y = -1.22;
        rCalf.castShadow = true;
        rightHip.add(rCalf);

        const rBoot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.44), this.ornsteinGoldMat);
        rBoot.position.set(0, -1.62, 0.08);
        rightHip.add(rBoot);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.32, -0.72, 0);
        torso.add(leftHip);

        const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 0.75, 6), this.ornsteinGoldMat);
        lThigh.position.y = -0.4;
        lThigh.castShadow = true;
        leftHip.add(lThigh);

        const lKnee = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.18), this.ornsteinGoldMat);
        lKnee.position.set(0, -0.82, 0.08);
        leftHip.add(lKnee);

        const lCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.15, 0.75, 6), this.ornsteinGoldMat);
        lCalf.position.y = -1.22;
        lCalf.castShadow = true;
        leftHip.add(lCalf);

        const lBoot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.44), this.ornsteinGoldMat);
        lBoot.position.set(0, -1.62, 0.08);
        leftHip.add(lBoot);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, rightHip, leftHip, plumeGroup, weaponGroup, spearLight };
        this.scene.add(root);
        return root;
    }
    // 7. EXECUTIONER SMOUGH (Anor Londo Cathedral)
    createExecutionerSmough(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.4;
        root.add(bodyGroup);

        // Colossal bulbous golden cuirass
        const torso = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 10), this.smoughGoldMat);
        torso.scale.set(1.3, 1.15, 1.25);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Grotesque small domed helm
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.45, 0.25);
        torso.add(headGroup);
        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.75, 8), this.smoughGoldMat);
        headGroup.add(helm);

        // Right Arm wielding Colossal Executioner's War Hammer
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.6, 0.7, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 1.3, 8), this.smoughGoldMat);
        rArm.position.y = -0.65;
        rightShoulder.add(rArm);

        const weaponGroup = new THREE.Group();
        weaponGroup.position.y = -1.3;
        rightShoulder.add(weaponGroup);

        const hammerShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 4.8, 8), this.steelMat);
        hammerShaft.position.y = 1.2;
        weaponGroup.add(hammerShaft);

        // Massive golden anvil/cylinder hammer head
        const hammerHead = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 1.9, 12), this.smoughGoldMat);
        hammerHead.position.set(0, 3.2, 0.3);
        hammerHead.rotation.z = Math.PI / 2;
        hammerHead.castShadow = true;
        weaponGroup.add(hammerHead);

        // Left Arm
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-1.6, 0.7, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 1.3, 8), this.smoughGoldMat);
        lArm.position.y = -0.65;
        leftShoulder.add(lArm);

        // Heavy Gilded Thighs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.8, -1.0, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 1.3, 8), this.smoughGoldMat);
        rLeg.position.y = -0.65;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.8, -1.0, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 1.3, 8), this.smoughGoldMat);
        lLeg.position.y = -0.65;
        leftHip.add(lLeg);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, rightHip, leftHip, weaponGroup };
        this.scene.add(root);
        return root;
    }

    // 8. KNIGHT ARTORIAS (Oolacile Abyss)
    createKnightArtorias(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.0;
        root.add(bodyGroup);

        // Slender tall knight cuirass in abyss-stained cobalt
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.52, 1.5, 8), this.artoriasAbyssMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Tattered abyss cowl / mantle
        const cowl = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.9, 8), this.artoriasAbyssMat);
        cowl.position.set(0, 0.45, 0);
        torso.add(cowl);

        // Helm with high tattered plume
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.0, 0);
        torso.add(headGroup);
        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.75, 8), this.steelMat);
        headGroup.add(helm);

        // Right Arm (Acrobatic Greatsword Master)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.65, 0.45, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.95, 6), this.artoriasAbyssMat);
        rArm.position.y = -0.48;
        rightShoulder.add(rArm);

        const weaponGroup = new THREE.Group();
        weaponGroup.position.y = -0.95;
        rightShoulder.add(weaponGroup);

        // Abyss Greatsword: Long tattered blade with dark purple/blue void aura
        const bladeShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 6), this.steelMat);
        bladeShaft.position.y = 0.2;
        weaponGroup.add(bladeShaft);

        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.2, 0.38), this.artoriasBladeDarkMat);
        blade.position.y = 2.0;
        blade.castShadow = true;
        weaponGroup.add(blade);

        const abyssLight = new THREE.PointLight(0x2244aa, 2.5, 8);
        abyssLight.position.set(0, 2.2, 0);
        weaponGroup.add(abyssLight);

        // Left Arm: Broken and hanging limp (Iconic Artorias Lore)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.65, 0.45, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.95, 6), this.artoriasAbyssMat);
        lArm.position.y = -0.48;
        lArm.rotation.z = 0.2;
        leftShoulder.add(lArm);

        // Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.32, -0.75, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 1.3, 6), this.artoriasAbyssMat);
        rLeg.position.y = -0.65;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.32, -0.75, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 1.3, 6), this.artoriasAbyssMat);
        lLeg.position.y = -0.65;
        leftHip.add(lLeg);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, rightHip, leftHip, weaponGroup, abyssLight };
        this.scene.add(root);
        return root;
    }

    // 9. MANUS, FATHER OF THE ABYSS (Chasm of the Abyss)
    createManusFatherOfAbyss(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.3;
        root.add(bodyGroup);

        // Primeval dark beast torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.4, 1.6), this.manusDarkMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Beast skull with multi-eyes & curved ram horns
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.4, 0.3);
        torso.add(headGroup);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), this.manusDarkMat);
        headGroup.add(head);

        // 6 Glowing red void eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });
        for (let e = 0; e < 6; e++) {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09), eyeMat);
            const ex = (e % 3 - 1) * 0.24;
            const ey = (Math.floor(e / 3) * 0.2) - 0.05;
            eye.position.set(ex, ey, 0.65);
            headGroup.add(eye);
        }

        // Right Arm (holding Ancient Catalyst)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.3, 0.7, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 1.2, 6), this.manusDarkMat);
        rArm.position.y = -0.6;
        rightShoulder.add(rArm);

        const weaponGroup = new THREE.Group();
        weaponGroup.position.y = -1.2;
        rightShoulder.add(weaponGroup);
        const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3.4, 6), this.demonHornMat);
        staff.position.y = 0.8;
        weaponGroup.add(staff);

        // Colossal Demonic Giant Left Hand (Iconic Manus Monstrous Arm)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-1.6, 0.7, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 1.8, 8), this.manusDarkMat);
        lArm.position.y = -0.9;
        leftShoulder.add(lArm);

        // Monstrous claw hand
        const clawGroup = new THREE.Group();
        clawGroup.position.y = -1.9;
        leftShoulder.add(clawGroup);

        const palm = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 1.1), this.manusDarkMat);
        clawGroup.add(palm);

        for (let c = 0; c < 4; c++) {
            const claw = new THREE.Mesh(new THREE.ConeGeometry(0.14, 1.4, 4), this.demonHornMat);
            claw.position.set((c - 1.5) * 0.26, -0.7, 0.4);
            claw.rotation.x = 0.35;
            clawGroup.add(claw);
        }

        // Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.65, -1.0, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 1.3, 6), this.manusDarkMat);
        rLeg.position.y = -0.65;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.65, -1.0, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 1.3, 6), this.manusDarkMat);
        lLeg.position.y = -0.65;
        leftHip.add(lLeg);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, rightHip, leftHip, clawGroup, weaponGroup };
        this.scene.add(root);
        return root;
    }

    // 10. BLACK DRAGON KALAMEET (Royal Wood)
    createBlackDragonKalameet(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.0;
        root.add(bodyGroup);

        // Obsidian dragon body
        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.6, 3.2), this.kalameetDragonMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Long serpentine dragon neck & horned skull
        const neckGroup = new THREE.Group();
        neckGroup.position.set(0, 0.6, 1.6);
        torso.add(neckGroup);
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 1.6, 6), this.kalameetDragonMat);
        neck.rotation.x = Math.PI / 4;
        neckGroup.add(neck);

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.7, 0.8);
        neckGroup.add(headGroup);
        const dragonHead = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.4, 6), this.kalameetDragonMat);
        dragonHead.rotation.x = -Math.PI / 2;
        headGroup.add(dragonHead);

        // Glowing Crimson Calamity Eye on forehead
        const calamityEye = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), this.calamityEyeMat);
        calamityEye.position.set(0, 0.35, 0.3);
        headGroup.add(calamityEye);

        const eyeLight = new THREE.PointLight(0xff0022, 3.5, 12);
        eyeLight.position.set(0, 0.4, 0.3);
        headGroup.add(eyeLight);

        // 4 Dragon Wings (2 main upper wings + 2 lower stabilizers)
        const leftWingGroup = new THREE.Group();
        leftWingGroup.position.set(-0.9, 0.6, 0.2);
        torso.add(leftWingGroup);
        const wingL = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.4), this.wingMembraneMat);
        wingL.position.set(-1.8, 0.6, 0);
        wingL.rotation.y = -0.3;
        leftWingGroup.add(wingL);

        const rightWingGroup = new THREE.Group();
        rightWingGroup.position.set(0.9, 0.6, 0.2);
        torso.add(rightWingGroup);
        const wingR = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.4), this.wingMembraneMat);
        wingR.position.set(1.8, 0.6, 0);
        wingR.rotation.y = 0.3;
        rightWingGroup.add(wingR);

        // 4 Dragon Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(1.0, -0.6, 0.8);
        torso.add(rightHip);
        const rLegF = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 1.2, 6), this.kalameetDragonMat);
        rLegF.position.y = -0.6;
        rightHip.add(rLegF);

        const leftHip = new THREE.Group();
        leftHip.position.set(-1.0, -0.6, 0.8);
        torso.add(leftHip);
        const lLegF = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 1.2, 6), this.kalameetDragonMat);
        lLegF.position.y = -0.6;
        leftHip.add(lLegF);

        // Spiked Tail
        const tailGroup = new THREE.Group();
        tailGroup.position.set(0, 0, -1.6);
        torso.add(tailGroup);
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.8, 6), this.kalameetDragonMat);
        tail.rotation.x = -Math.PI / 2;
        tail.position.z = -1.4;
        tailGroup.add(tail);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, neckGroup, leftWingGroup, rightWingGroup, rightHip, leftHip, tailGroup, calamityEye, eyeLight };
        this.scene.add(root);
        return root;
    }

    // ========================================================================
    // EXPANDED BOSS ROSTER: 20 NEW LORDS OF LORDRAN (BOSSES 17 - 36)
    // ========================================================================

    // 17. STRAY DEMON (Undead Asylum Depths)
    createStrayDemon(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.4;
        root.add(bodyGroup);

        const ashFleshMat = new THREE.MeshStandardMaterial({ color: 0x2c2927, roughness: 0.92 });
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.45, 2.3, 10), ashFleshMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        const belly = new THREE.Mesh(new THREE.SphereGeometry(1.15, 10, 8), ashFleshMat);
        belly.scale.set(1.05, 0.9, 1.25);
        belly.position.set(0, -0.2, 0.45);
        torso.add(belly);

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.35, 0.35);
        torso.add(headGroup);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.72, 8, 8), ashFleshMat);
        headGroup.add(head);

        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.12), eyeMat);
        eyeL.position.set(-0.28, 0.1, 0.55);
        const eyeR = eyeL.clone();
        eyeR.position.x = 0.28;
        headGroup.add(eyeL);
        headGroup.add(eyeR);

        const hornGeo = new THREE.CylinderGeometry(0.06, 0.25, 1.5, 6);
        const hornL = new THREE.Mesh(hornGeo, this.demonHornMat);
        hornL.position.set(-0.65, 0.55, -0.15);
        hornL.rotation.set(-0.4, 0, 0.7);
        const hornR = hornL.clone();
        hornR.position.x = 0.65;
        hornR.rotation.set(-0.4, 0, -0.7);
        headGroup.add(hornL);
        headGroup.add(hornR);

        // Right Arm & Colossal Great Hammer
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.4, 0.8, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 1.6, 8), ashFleshMat);
        rArm.position.y = -0.8;
        rightShoulder.add(rArm);

        const weaponGroup = new THREE.Group();
        weaponGroup.position.y = -1.6;
        rightShoulder.add(weaponGroup);
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 4.4, 8), this.demonHornMat);
        handle.position.y = 1.0;
        weaponGroup.add(handle);
        const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 1.3), this.asylumHammerMat);
        hammerHead.position.y = 2.8;
        weaponGroup.add(hammerHead);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-1.4, 0.8, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 1.5, 8), ashFleshMat);
        lArm.position.y = -0.75;
        leftShoulder.add(lArm);

        const rightHip = new THREE.Group();
        rightHip.position.set(0.7, -1.0, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.52, 1.4, 8), ashFleshMat);
        rLeg.position.y = -0.7;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.7, -1.0, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.52, 1.4, 8), ashFleshMat);
        lLeg.position.y = -0.7;
        leftHip.add(lLeg);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, rightHip, leftHip, weaponGroup };
        this.scene.add(root);
        return root;
    }

    // 18. DEMON FIRESAGE (Demon Ruins)
    createDemonFiresage(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.4;
        root.add(bodyGroup);

        const firesageMat = new THREE.MeshStandardMaterial({ color: 0x992200, roughness: 0.65, emissive: 0x441100 });
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.4, 2.2, 10), firesageMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        const belly = new THREE.Mesh(new THREE.SphereGeometry(1.15, 10, 8), firesageMat);
        belly.scale.set(1.05, 0.9, 1.25);
        belly.position.set(0, -0.2, 0.45);
        torso.add(belly);

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.35, 0.35);
        torso.add(headGroup);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.72, 8, 8), firesageMat);
        headGroup.add(head);

        const flameLight = new THREE.PointLight(0xff5500, 3.0, 12);
        flameLight.position.set(0, 1.5, 0);
        bodyGroup.add(flameLight);

        // Demonic Firesage Catalyst Staff
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.4, 0.8, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 1.6, 8), firesageMat);
        rArm.position.y = -0.8;
        rightShoulder.add(rArm);

        const weaponGroup = new THREE.Group();
        weaponGroup.position.y = -1.6;
        rightShoulder.add(weaponGroup);
        const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.8, 8), this.demonHornMat);
        staff.position.y = 1.2;
        weaponGroup.add(staff);
        const crystal = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6), new THREE.MeshStandardMaterial({ color: 0xff3300, emissive: 0xff4400 }));
        crystal.position.y = 3.4;
        weaponGroup.add(crystal);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-1.4, 0.8, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 1.5, 8), firesageMat);
        lArm.position.y = -0.75;
        leftShoulder.add(lArm);

        const rightHip = new THREE.Group();
        rightHip.position.set(0.7, -1.0, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.52, 1.4, 8), firesageMat);
        rLeg.position.y = -0.7;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.7, -1.0, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.52, 1.4, 8), firesageMat);
        lLeg.position.y = -0.7;
        leftHip.add(lLeg);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, rightHip, leftHip, weaponGroup, flameLight };
        this.scene.add(root);
        return root;
    }

    // 19. CENTIPEDE DEMON (Lava Lake)
    createCentipedeDemon(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.0;
        root.add(bodyGroup);

        const chitinMat = new THREE.MeshStandardMaterial({ color: 0x541808, roughness: 0.5, metalness: 0.2 });
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 2.6, 8), chitinMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Multiple Segmented Appendages
        for (let i = 0; i < 4; i++) {
            const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.8, 6), chitinMat);
            legL.position.set(-1.1, -0.6 + i * 0.5, (i - 1.5) * 0.6);
            legL.rotation.z = 0.6;
            torso.add(legL);

            const legR = legL.clone();
            legR.position.x = 1.1;
            legR.rotation.z = -0.6;
            torso.add(legR);
        }

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.5, 0.4);
        torso.add(headGroup);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 8), chitinMat);
        headGroup.add(head);

        // Segmented Tail Whip Arm
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.2, 0.8, 0);
        torso.add(rightShoulder);
        const tailWhip = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.35, 4.2, 8), chitinMat);
        tailWhip.position.set(0.6, -1.0, 1.0);
        tailWhip.rotation.set(0.4, 0, -0.5);
        rightShoulder.add(tailWhip);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-1.2, 0.8, 0);
        torso.add(leftShoulder);
        const lClaw = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 2.0, 6), chitinMat);
        lClaw.position.y = -1.0;
        leftShoulder.add(lClaw);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder };
        this.scene.add(root);
        return root;
    }

    // 20. BED OF CHAOS (Lost Izalith Heart)
    createBedOfChaos(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.5;
        root.add(bodyGroup);

        const woodMat = new THREE.MeshStandardMaterial({ color: 0x2e1808, roughness: 0.95 });
        const fireBranchMat = new THREE.MeshStandardMaterial({ color: 0xff3300, emissive: 0xcc2200, roughness: 0.4 });

        // Ancient Gnarled Tree Trunk
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.4, 4.5, 10), woodMat);
        trunk.castShadow = true;
        bodyGroup.add(trunk);

        // Sweeping Scythe Branches
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(2.0, 1.5, 0);
        trunk.add(rightShoulder);
        const scytheR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.2, 0.8), fireBranchMat);
        scytheR.position.set(1.2, -1.2, 0);
        scytheR.rotation.z = -0.5;
        rightShoulder.add(scytheR);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-2.0, 1.5, 0);
        trunk.add(leftShoulder);
        const scytheL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.2, 0.8), fireBranchMat);
        scytheL.position.set(-1.2, -1.2, 0);
        scytheL.rotation.z = 0.5;
        leftShoulder.add(scytheL);

        // Central Chaos Bug Core
        const coreGeo = new THREE.SphereGeometry(0.75, 12, 12);
        const coreMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff5500, roughness: 0.2 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.set(0, 0, 1.6);
        trunk.add(core);

        const fireLight = new THREE.PointLight(0xff4400, 3.5, 14);
        fireLight.position.set(0, 0, 2.0);
        trunk.add(fireLight);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso: trunk, rightShoulder, leftShoulder, core, fireLight };
        this.scene.add(root);
        return root;
    }

    // 21. CEASELESS DISCHARGE (Demon Ruins Magma Core)
    createCeaselessDischarge(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 3.2;
        root.add(bodyGroup);

        const magmaMat = new THREE.MeshStandardMaterial({ color: 0x440800, emissive: 0xcc2200, roughness: 0.75 });
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.6, 4.2, 12), magmaMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 2.4, 0.4);
        torso.add(headGroup);
        const head = new THREE.Mesh(new THREE.SphereGeometry(1.0, 8, 8), magmaMat);
        headGroup.add(head);

        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(2.4, 1.2, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 3.4, 8), magmaMat);
        rArm.position.y = -1.7;
        rightShoulder.add(rArm);
        const rFist = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 8), magmaMat);
        rFist.position.y = -3.4;
        rightShoulder.add(rFist);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-2.4, 1.2, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 3.4, 8), magmaMat);
        lArm.position.y = -1.7;
        leftShoulder.add(lArm);
        const lFist = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 8), magmaMat);
        lFist.position.y = -3.4;
        leftShoulder.add(lFist);

        const magmaLight = new THREE.PointLight(0xff3300, 4.0, 16);
        magmaLight.position.set(0, 1.5, 2.0);
        bodyGroup.add(magmaLight);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, magmaLight };
        this.scene.add(root);
        return root;
    }

    // 22. SEATH THE SCALELESS (Crystal Cave)
    createSeathTheScaleless(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.4;
        root.add(bodyGroup);

        const dragonScalesMat = new THREE.MeshStandardMaterial({ color: 0xdde6ed, roughness: 0.35, metalness: 0.1 });
        const crystalWingMat = new THREE.MeshStandardMaterial({ color: 0x99ccff, transparent: true, opacity: 0.8, roughness: 0.1 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.8, 3.6, 10), dragonScalesMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 2.2, 0.8);
        torso.add(headGroup);
        const head = new THREE.Mesh(new THREE.ConeGeometry(0.65, 2.2, 8), dragonScalesMat);
        head.rotation.x = 1.3;
        headGroup.add(head);

        // 4 Multi-jointed Crystal Wings
        const leftWingGroup = new THREE.Group();
        leftWingGroup.position.set(-1.2, 1.0, -0.4);
        torso.add(leftWingGroup);
        const wingL1 = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 4.5), crystalWingMat);
        wingL1.position.set(-1.8, 0.8, 0);
        wingL1.rotation.y = -0.4;
        leftWingGroup.add(wingL1);

        const rightWingGroup = new THREE.Group();
        rightWingGroup.position.set(1.2, 1.0, -0.4);
        torso.add(rightWingGroup);
        const wingR1 = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 4.5), crystalWingMat);
        wingR1.position.set(1.8, 0.8, 0);
        wingR1.rotation.y = 0.4;
        rightWingGroup.add(wingR1);

        // Sweeping Tentacle Tails
        const tailGroup = new THREE.Group();
        tailGroup.position.set(0, -1.4, -1.2);
        torso.add(tailGroup);
        for (let i = -1; i <= 1; i++) {
            const tail = new THREE.Mesh(new THREE.ConeGeometry(0.4, 4.5, 6), dragonScalesMat);
            tail.position.set(i * 1.1, -0.5, -2.0);
            tail.rotation.x = -1.4;
            tailGroup.add(tail);
        }

        const crystalLight = new THREE.PointLight(0x77bbff, 3.0, 12);
        crystalLight.position.set(0, 1.5, 1.2);
        bodyGroup.add(crystalLight);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, leftWingGroup, rightWingGroup, tailGroup, crystalLight };
        this.scene.add(root);
        return root;
    }

    // 23. FOUR KINGS (The Abyss)
    createFourKings(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.4;
        root.add(bodyGroup);

        const voidMat = new THREE.MeshStandardMaterial({ color: 0x0c0f14, roughness: 0.95 });
        const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1f242d, roughness: 0.4, metalness: 0.8 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.2, 3.2, 8), voidMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Spired Abyssal Spiked Crown
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 2.0, 0);
        torso.add(headGroup);
        const crown = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.4, 6), darkMetalMat);
        headGroup.add(crown);

        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.0, 1.2, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1.8, 6), darkMetalMat);
        rArm.position.y = -0.9;
        rightShoulder.add(rArm);

        // Abyssal Greatsword
        const weaponGroup = new THREE.Group();
        weaponGroup.position.y = -1.8;
        rightShoulder.add(weaponGroup);
        const sword = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.4, 0.5), darkMetalMat);
        sword.position.y = 1.8;
        weaponGroup.add(sword);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-1.0, 1.2, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1.8, 6), darkMetalMat);
        lArm.position.y = -0.9;
        leftShoulder.add(lArm);

        const voidLight = new THREE.PointLight(0x4422aa, 2.5, 10);
        voidLight.position.set(0, 1.0, 0);
        bodyGroup.add(voidLight);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, weaponGroup, voidLight };
        this.scene.add(root);
        return root;
    }

    // 24. CROSSBREED PRISCILLA (Painted World of Ariamis)
    createCrossbreedPriscilla(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.0;
        root.add(bodyGroup);

        const dressMat = new THREE.MeshStandardMaterial({ color: 0xf0f2f5, roughness: 0.85 });
        const furMat = new THREE.MeshStandardMaterial({ color: 0xe8ecf0, roughness: 0.95 });
        const scytheMat = new THREE.MeshStandardMaterial({ color: 0x222226, roughness: 0.3, metalness: 0.7 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.7, 2.2, 8), dressMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.35, 0);
        torso.add(headGroup);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), dressMat);
        headGroup.add(head);

        // Fluffy Dragon Tail
        const tailGroup = new THREE.Group();
        tailGroup.position.set(0, -0.6, -0.5);
        torso.add(tailGroup);
        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.55, 2.6, 8), furMat);
        tail.position.set(0, 0.5, -1.2);
        tail.rotation.x = -1.0;
        tailGroup.add(tail);

        // Lifehunt Scythe
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.65, 0.8, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.1, 6), dressMat);
        rArm.position.y = -0.55;
        rightShoulder.add(rArm);

        const weaponGroup = new THREE.Group();
        weaponGroup.position.y = -1.1;
        rightShoulder.add(weaponGroup);
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 3.2, 6), this.demonHornMat);
        handle.position.y = 0.8;
        weaponGroup.add(handle);
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.4, 0.45), scytheMat);
        blade.position.set(0.6, 2.2, 0);
        blade.rotation.z = 1.0;
        weaponGroup.add(blade);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.65, 0.8, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.1, 6), dressMat);
        lArm.position.y = -0.55;
        leftShoulder.add(lArm);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, tailGroup, rightShoulder, leftShoulder, weaponGroup };
        this.scene.add(root);
        return root;
    }

    // 25. DARK SUN GWYNDOLIN (Anor Londo Darkmoon Tomb)
    createDarkSunGwyndolin(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.0;
        root.add(bodyGroup);

        const silkMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
        const goldMat = this.goldTrimMat || new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.65, 2.0, 8), silkMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Golden Sunburst Crown Mask
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.3, 0);
        torso.add(headGroup);
        const mask = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.08, 6, 12), goldMat);
        headGroup.add(mask);
        for (let r = 0; r < 8; r++) {
            const ray = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.6, 4), goldMat);
            ray.position.set(Math.cos(r * Math.PI / 4) * 0.6, Math.sin(r * Math.PI / 4) * 0.6, 0);
            ray.rotation.z = r * Math.PI / 4 - Math.PI / 2;
            headGroup.add(ray);
        }

        // Moonlight Greatbow in Right Arm
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.65, 0.7, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.2, 6), silkMat);
        rArm.position.y = -0.6;
        rightShoulder.add(rArm);
        const bow = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.06, 6, 12, Math.PI), goldMat);
        bow.position.set(0.3, -0.6, 0);
        rightShoulder.add(bow);

        // Serpentine Tentacles Base
        const snakeGroup = new THREE.Group();
        snakeGroup.position.set(0, -1.0, 0);
        torso.add(snakeGroup);
        for (let s = 0; s < 6; s++) {
            const angle = s * Math.PI / 3;
            const snake = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.6, 6), new THREE.MeshStandardMaterial({ color: 0x4a5a6a }));
            snake.position.set(Math.cos(angle) * 0.65, -0.4, Math.sin(angle) * 0.65);
            snake.rotation.set(0.2, angle, 0.3);
            snakeGroup.add(snake);
        }

        const moonLight = new THREE.PointLight(0x88ccff, 2.5, 10);
        moonLight.position.set(0, 1.2, 0.6);
        bodyGroup.add(moonLight);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightShoulder, snakeGroup, moonLight };
        this.scene.add(root);
        return root;
    }

    // 26. PINWHEEL (Catacombs Crypt)
    createPinwheel(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.8;
        root.add(bodyGroup);

        const robeMat = new THREE.MeshStandardMaterial({ color: 0x141210, roughness: 0.95 });
        const maskMat = new THREE.MeshStandardMaterial({ color: 0xb8860b, metalness: 0.6, roughness: 0.4 });

        const torso = new THREE.Mesh(new THREE.ConeGeometry(0.85, 2.5, 8), robeMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // 3 Overlapping Masks
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.4, 0);
        torso.add(headGroup);
        const mask1 = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), maskMat);
        mask1.position.set(0, 0.2, 0.3);
        const mask2 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), maskMat);
        mask2.position.set(-0.35, -0.15, 0.25);
        const mask3 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), maskMat);
        mask3.position.set(0.35, -0.15, 0.25);
        headGroup.add(mask1);
        headGroup.add(mask2);
        headGroup.add(mask3);

        const lantern = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25), new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff4400 }));
        lantern.position.set(0.6, 0.4, 0.6);
        torso.add(lantern);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup };
        this.scene.add(root);
        return root;
    }

    // 27. SANCTUARY GUARDIAN (Oolacile Sanctuary)
    createSanctuaryGuardian(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.6;
        root.add(bodyGroup);

        const furMat = new THREE.MeshStandardMaterial({ color: 0xf2f4f8, roughness: 0.85 });
        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 2.8), furMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.8, 1.5);
        torso.add(headGroup);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), furMat);
        headGroup.add(head);

        // Ram Horns
        const hornL = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.12, 6, 8, Math.PI * 1.2), this.demonHornMat);
        hornL.position.set(-0.55, 0.4, 0);
        const hornR = hornL.clone();
        hornR.position.x = 0.55;
        headGroup.add(hornL);
        headGroup.add(hornR);

        // Feathered Wings
        const leftWingGroup = new THREE.Group();
        leftWingGroup.position.set(-0.9, 0.6, 0);
        torso.add(leftWingGroup);
        const wingL = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2), furMat);
        wingL.position.set(-1.6, 0.5, 0);
        leftWingGroup.add(wingL);

        const rightWingGroup = new THREE.Group();
        rightWingGroup.position.set(0.9, 0.6, 0);
        torso.add(rightWingGroup);
        const wingR = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2), furMat);
        wingR.position.set(1.6, 0.5, 0);
        rightWingGroup.add(wingR);

        // Scorpion Stinger Tail
        const tailGroup = new THREE.Group();
        tailGroup.position.set(0, 0.4, -1.4);
        torso.add(tailGroup);
        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.35, 2.8, 6), this.demonHornMat);
        tail.position.set(0, 1.2, -0.6);
        tail.rotation.x = -0.8;
        tailGroup.add(tail);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, leftWingGroup, rightWingGroup, tailGroup };
        this.scene.add(root);
        return root;
    }

    // 28. THE PURSUER (Forest of Fallen Giants)
    createThePursuer(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.2;
        root.add(bodyGroup);

        const armorMat = new THREE.MeshStandardMaterial({ color: 0x22262c, metalness: 0.85, roughness: 0.35 });
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 1.8, 8), armorMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.15, 0);
        torso.add(headGroup);
        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 0.7, 8), armorMat);
        headGroup.add(helm);
        const visorLight = new THREE.PointLight(0xff0000, 2.0, 4);
        visorLight.position.set(0, 0.1, 0.35);
        headGroup.add(visorLight);

        // Right Arm & Ultra Greatsword
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.8, 0.6, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.1, 6), armorMat);
        rArm.position.y = -0.55;
        rightShoulder.add(rArm);

        const weaponGroup = new THREE.Group();
        weaponGroup.position.y = -1.1;
        rightShoulder.add(weaponGroup);
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.8, 0.5), armorMat);
        blade.position.y = 1.8;
        weaponGroup.add(blade);

        // Left Arm & Red-Eye Tower Shield
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.8, 0.6, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.1, 6), armorMat);
        lArm.position.y = -0.55;
        leftShoulder.add(lArm);
        const shield = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.4, 1.2), armorMat);
        shield.position.set(-0.2, -0.3, 0.3);
        leftShoulder.add(shield);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, weaponGroup };
        this.scene.add(root);
        return root;
    }

    // 29. LOOKING GLASS KNIGHT (King's Passage)
    createLookingGlassKnight(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.4;
        root.add(bodyGroup);

        const mirrorSteelMat = new THREE.MeshStandardMaterial({ color: 0xd8e0e8, metalness: 0.95, roughness: 0.1 });
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 2.0, 8), mirrorSteelMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.3, 0);
        torso.add(headGroup);
        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.8, 8), mirrorSteelMat);
        headGroup.add(helm);

        // Right Arm & Thorned Thunder Greatsword
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.9, 0.7, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1.2, 6), mirrorSteelMat);
        rArm.position.y = -0.6;
        rightShoulder.add(rArm);
        const sword = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.8, 0.45), mirrorSteelMat);
        sword.position.set(0, 1.4, 0);
        rightShoulder.add(sword);

        // Left Arm & Mirror Greatshield
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.9, 0.7, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1.2, 6), mirrorSteelMat);
        lArm.position.y = -0.6;
        leftShoulder.add(lArm);
        const mirrorShield = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.0, 1.6), mirrorSteelMat);
        mirrorShield.position.set(-0.3, -0.2, 0.4);
        leftShoulder.add(mirrorShield);

        const thunderLight = new THREE.PointLight(0xaaddff, 3.0, 10);
        thunderLight.position.set(0, 2.0, 0.5);
        bodyGroup.add(thunderLight);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, thunderLight };
        this.scene.add(root);
        return root;
    }

    // 30. FUME KNIGHT RAIME (Brume Tower Core)
    createFumeKnight(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.4;
        root.add(bodyGroup);

        const fumeArmorMat = new THREE.MeshStandardMaterial({ color: 0x181a1e, metalness: 0.8, roughness: 0.5 });
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 1.9, 8), fumeArmorMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.2, 0);
        torso.add(headGroup);
        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 0.75, 8), fumeArmorMat);
        headGroup.add(helm);

        // Right Arm: Colossal Slab Fume Ultra Greatsword
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.85, 0.65, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1.2, 6), fumeArmorMat);
        rArm.position.y = -0.6;
        rightShoulder.add(rArm);
        const fumeBlade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.2, 0.8), fumeArmorMat);
        fumeBlade.position.set(0, 1.5, 0);
        rightShoulder.add(fumeBlade);

        // Left Arm: Long Straight Sword
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.85, 0.65, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.1, 6), fumeArmorMat);
        lArm.position.y = -0.55;
        leftShoulder.add(lArm);
        const leftSword = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.25), fumeArmorMat);
        leftSword.position.set(0, 0.7, 0);
        leftShoulder.add(leftSword);

        const darkFireLight = new THREE.PointLight(0xff4411, 3.0, 10);
        darkFireLight.position.set(0, 1.5, 0.5);
        bodyGroup.add(darkFireLight);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, darkFireLight };
        this.scene.add(root);
        return root;
    }

    // 31. SIR ALONNE (Memory of the Old Iron King)
    createSirAlonne(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.0;
        root.add(bodyGroup);

        const samuraiMat = new THREE.MeshStandardMaterial({ color: 0x3a3632, metalness: 0.75, roughness: 0.35 });
        const goldMat = this.goldTrimMat || new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.58, 1.7, 8), samuraiMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Kabuto Helm with Stag Horns
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.1, 0);
        torso.add(headGroup);
        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.34, 0.65, 8), samuraiMat);
        headGroup.add(helm);
        const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.8, 4), goldMat);
        hornL.position.set(-0.35, 0.45, 0);
        hornL.rotation.z = 0.5;
        const hornR = hornL.clone();
        hornR.position.x = 0.35;
        hornR.rotation.z = -0.5;
        headGroup.add(hornL);
        headGroup.add(hornR);

        // Bewitched Alonne Katana (Two-Handed Stance)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.65, 0.55, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 1.0, 6), samuraiMat);
        rArm.position.y = -0.5;
        rightShoulder.add(rArm);

        const katana = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.6, 0.2), new THREE.MeshStandardMaterial({ color: 0xc0c8d0, metalness: 0.95, roughness: 0.1 }));
        katana.position.set(0.2, 1.2, 0.3);
        katana.rotation.set(-0.3, 0, -0.2);
        rightShoulder.add(katana);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightShoulder };
        this.scene.add(root);
        return root;
    }

    // 32. THE NAMELESS KING (Archdragon Peak)
    createNamelessKing(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.4;
        root.add(bodyGroup);

        const skinMat = new THREE.MeshStandardMaterial({ color: 0x78726a, roughness: 0.7 });
        const scaleMat = new THREE.MeshStandardMaterial({ color: 0xc8a848, metalness: 0.75, roughness: 0.35 });
        const hairMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.9 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 1.8, 8), scaleMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Crown of the Firstborn & Wind-Blown Ash Mane
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.2, 0);
        torso.add(headGroup);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), skinMat);
        headGroup.add(head);
        const hair = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.6, 8), hairMat);
        hair.position.set(0, 0.4, -0.4);
        hair.rotation.x = -0.8;
        headGroup.add(hair);

        // Dragonslayer Swordspear
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.8, 0.6, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.1, 6), scaleMat);
        rArm.position.y = -0.55;
        rightShoulder.add(rArm);

        const spearShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 4.2, 8), scaleMat);
        spearShaft.position.set(0, 1.4, 0);
        rightShoulder.add(spearShaft);
        const spearBlade = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.4, 6), scaleMat);
        spearBlade.position.set(0, 3.8, 0);
        rightShoulder.add(spearBlade);

        const thunderLight = new THREE.PointLight(0xffdd44, 3.5, 12);
        thunderLight.position.set(0, 3.6, 0);
        rightShoulder.add(thunderLight);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightShoulder, thunderLight };
        this.scene.add(root);
        return root;
    }

    // 33. ABYSS WATCHERS (Farron Keep Perimeter)
    createAbyssWatchers(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.0;
        root.add(bodyGroup);

        const leatherMat = new THREE.MeshStandardMaterial({ color: 0x24201c, roughness: 0.85 });
        const steelMat = new THREE.MeshStandardMaterial({ color: 0x4a505a, metalness: 0.8, roughness: 0.35 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.52, 1.6, 8), leatherMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Pointed Conical Helm
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.1, 0);
        torso.add(headGroup);
        const helm = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.0, 8), steelMat);
        headGroup.add(helm);

        // Right Arm & Wolf Knight Greatsword
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.65, 0.55, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 1.0, 6), leatherMat);
        rArm.position.y = -0.5;
        rightShoulder.add(rArm);
        const sword = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.0, 0.35), steelMat);
        sword.position.set(0, 1.1, 0);
        rightShoulder.add(sword);

        // Left Arm & Parrying Dagger
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.65, 0.55, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 1.0, 6), leatherMat);
        lArm.position.y = -0.5;
        leftShoulder.add(lArm);
        const dagger = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.2, 0.18), steelMat);
        dagger.position.set(0, 0.4, 0);
        leftShoulder.add(dagger);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder };
        this.scene.add(root);
        return root;
    }

    // 34. PONTIFF SULYVAHN (Irithyll Boreal Cathedral)
    createPontiffSulyvahn(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.4;
        root.add(bodyGroup);

        const robeMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.85 });
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, 2.2, 8), robeMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.4, 0);
        torso.add(headGroup);
        const mitre = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.1, 6), robeMat);
        headGroup.add(mitre);

        // Dark Tree Branch Wings
        for (let b = -1; b <= 1; b += 2) {
            const branch = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.8, 0.2), this.demonHornMat);
            branch.position.set(b * 0.8, 0.6, -0.4);
            branch.rotation.z = b * 0.6;
            torso.add(branch);
        }

        // Right Hand: Profaned Greatsword (Fire Flame Orange)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.8, 0.7, 0);
        torso.add(rightShoulder);
        const fireSword = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.4, 0.4), new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xcc2200 }));
        fireSword.position.set(0, 1.2, 0);
        rightShoulder.add(fireSword);
        const fireLight = new THREE.PointLight(0xff5500, 2.5, 8);
        fireLight.position.set(0, 1.5, 0);
        rightShoulder.add(fireLight);

        // Left Hand: Greatsword of Judgement (Magic Blue)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.8, 0.7, 0);
        torso.add(leftShoulder);
        const magicSword = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.4, 0.4), new THREE.MeshStandardMaterial({ color: 0x3388ff, emissive: 0x1144cc }));
        magicSword.position.set(0, 1.2, 0);
        leftShoulder.add(magicSword);
        const magicLight = new THREE.PointLight(0x4488ff, 2.5, 8);
        magicLight.position.set(0, 1.5, 0);
        leftShoulder.add(magicLight);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, fireLight, magicLight };
        this.scene.add(root);
        return root;
    }

    // 35. SLAVE KNIGHT GAEL (End of the World)
    createSlaveKnightGael(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.2;
        root.add(bodyGroup);

        const gaelRobeMat = new THREE.MeshStandardMaterial({ color: 0x6e1b1b, roughness: 0.95 });
        const gaelArmorMat = new THREE.MeshStandardMaterial({ color: 0x3a322c, metalness: 0.7, roughness: 0.4 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.7, 1.8, 8), gaelArmorMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Tattered Crimson Blood Cape & Hood
        const hood = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.9, 8), gaelRobeMat);
        hood.position.set(0, 1.15, 0);
        torso.add(hood);

        const cape = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.8), gaelRobeMat);
        cape.position.set(0, 0.2, -0.6);
        cape.rotation.x = 0.25;
        torso.add(cape);

        // Executioner Greatsword (Chipped Blade)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.8, 0.6, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.1, 6), gaelArmorMat);
        rArm.position.y = -0.55;
        rightShoulder.add(rArm);
        const sword = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.6, 0.5), gaelArmorMat);
        sword.position.set(0, 1.4, 0);
        rightShoulder.add(sword);

        // Repeating Crossbow on Left Arm
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.8, 0.6, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.1, 6), gaelArmorMat);
        lArm.position.y = -0.55;
        leftShoulder.add(lArm);
        const xbow = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.8), gaelArmorMat);
        xbow.position.set(-0.2, -0.4, 0.4);
        leftShoulder.add(xbow);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, hood, cape, rightShoulder, leftShoulder };
        this.scene.add(root);
        return root;
    }

    // 36. SOUL OF CINDER (Kiln of the First Flame)
    createSoulOfCinder(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.4;
        root.add(bodyGroup);

        const cinderArmorMat = new THREE.MeshStandardMaterial({ color: 0x1f1b18, metalness: 0.8, roughness: 0.6 });
        const firelinkMat = new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xdd2200, roughness: 0.3 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.68, 1.9, 8), cinderArmorMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Melted Horn Crown
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.25, 0);
        torso.add(headGroup);
        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 0.75, 8), cinderArmorMat);
        headGroup.add(helm);
        for (let h = 0; h < 4; h++) {
            const horn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.5, 4), cinderArmorMat);
            horn.position.set(Math.cos(h * Math.PI / 2) * 0.3, 0.4, Math.sin(h * Math.PI / 2) * 0.3);
            headGroup.add(horn);
        }

        // Firelink Coiled Sword
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.85, 0.65, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.1, 6), cinderArmorMat);
        rArm.position.y = -0.55;
        rightShoulder.add(rArm);
        const coiledSword = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 3.8, 8), firelinkMat);
        coiledSword.position.set(0, 1.4, 0);
        coiledSword.rotation.z = -0.15;
        rightShoulder.add(coiledSword);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.85, 0.65, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.1, 6), cinderArmorMat);
        lArm.position.y = -0.55;
        leftShoulder.add(lArm);

        const kilnLight = new THREE.PointLight(0xff5500, 3.5, 12);
        kilnLight.position.set(0, 1.0, 0.4);
        bodyGroup.add(kilnLight);

        root.position.set(x, 0, z);
        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, kilnLight };
        this.scene.add(root);
        return root;
    }

    // 37. MEDUSA, GORGON MATRIARCH (Sunken Serpent Sanctum)
    createGorgonMedusa(x, z, angle = 0, y = 0) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.35;
        root.add(bodyGroup);

        // 1. Long Coiled Serpentine Tail (8 articulated spine segments)
        const tailSegments = [];
        const tailGroup = new THREE.Group();
        bodyGroup.add(tailGroup);

        const segCount = 8;
        for (let i = 0; i < segCount; i++) {
            const segRadius = 0.44 * (1.0 - (i / segCount) * 0.75);
            const segLength = 0.55;
            const segMesh = new THREE.Mesh(
                new THREE.CylinderGeometry(segRadius, segRadius * 0.9, segLength, 10),
                this.serpentScaleMat
            );
            segMesh.castShadow = true;
            segMesh.receiveShadow = true;
            
            // Belly plates on bottom
            const belly = new THREE.Mesh(
                new THREE.PlaneGeometry(segRadius * 1.5, segLength * 0.95),
                this.serpentBellyMat
            );
            belly.rotation.x = Math.PI / 2;
            belly.position.set(0, -segRadius * 0.85, 0);
            segMesh.add(belly);

            // Natural initial serpentine S-curve trailing backwards
            const t = i / segCount;
            const sx = Math.sin(t * Math.PI * 2) * 0.45;
            const sz = -i * 0.55;
            const sy = -0.5 - t * 0.6;
            segMesh.position.set(sx, sy, sz);
            segMesh.rotation.x = 0.25;

            tailGroup.add(segMesh);
            tailSegments.push(segMesh);
        }

        // 2. Humanoid Torso with Antique Bronze Chitin Armor
        const torso = new THREE.Group();
        torso.position.y = 0.2;
        bodyGroup.add(torso);

        const breastplate = new THREE.Mesh(
            new THREE.CylinderGeometry(0.36, 0.42, 0.95, 8),
            this.gorgonArmorMat
        );
        breastplate.castShadow = true;
        torso.add(breastplate);

        // Serpentine Rib Scales
        const ribScales = new THREE.Mesh(
            new THREE.CylinderGeometry(0.38, 0.44, 0.4, 8),
            this.serpentScaleMat
        );
        ribScales.position.y = -0.3;
        torso.add(ribScales);

        // 3. Gorgon Head with Glowing Jade Eyes & Fangs
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.75, 0);
        torso.add(headGroup);

        const face = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 8, 8),
            this.gorgonSkinMat
        );
        face.scale.set(0.9, 1.15, 1.0);
        headGroup.add(face);

        // Piercing Emerald Gaze Eyes
        const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), this.gorgonGlowMat);
        leftEye.position.set(-0.1, 0.06, 0.22);
        headGroup.add(leftEye);

        const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), this.gorgonGlowMat);
        rightEye.position.set(0.1, 0.06, 0.22);
        headGroup.add(rightEye);

        const gazeLight = new THREE.PointLight(0x00ff88, 2.5, 12);
        gazeLight.position.set(0, 0.1, 0.4);
        headGroup.add(gazeLight);

        // Volumetric Petrifying Gaze Beam Cone (activated during Stone Stare)
        const gazeBeamGeo = new THREE.ConeGeometry(3.5, 16, 16, 1, true);
        gazeBeamGeo.rotateX(Math.PI / 2);
        const gazeBeamMat = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        const gorgonGazeBeam = new THREE.Mesh(gazeBeamGeo, gazeBeamMat);
        gazeBeamGeo.translate(0, 0, 8.0);
        gorgonGazeBeam.visible = false;
        headGroup.add(gorgonGazeBeam);

        // 4. Writhing Snake Hair (10 distinct articulated serpent tendrils)
        const snakeHair = [];
        for (let s = 0; s < 10; s++) {
            const angle = (s / 10) * Math.PI * 2;
            const snakeRoot = new THREE.Group();
            snakeRoot.position.set(
                Math.cos(angle) * 0.18,
                0.15 + (s % 2) * 0.1,
                Math.sin(angle) * 0.18 - 0.05
            );

            // Wavy snake body
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(0.025, 0.035, 0.45, 5),
                this.gorgonSnakeHairMat
            );
            body.position.set(Math.cos(angle) * 0.12, 0.18, Math.sin(angle) * 0.12);
            body.rotation.z = Math.cos(angle) * 0.45;
            body.rotation.x = Math.sin(angle) * 0.45;
            snakeRoot.add(body);

            // Snake head with ruby eyes
            const sHead = new THREE.Mesh(
                new THREE.BoxGeometry(0.06, 0.04, 0.09),
                this.gorgonSnakeHairMat
            );
            sHead.position.set(Math.cos(angle) * 0.22, 0.38, Math.sin(angle) * 0.22);
            const rEye = new THREE.Mesh(new THREE.SphereGeometry(0.015, 4, 4), this.gorgonRubyEyeMat);
            rEye.position.set(0.025, 0.015, 0.035);
            sHead.add(rEye);
            const lEye = new THREE.Mesh(new THREE.SphereGeometry(0.015, 4, 4), this.gorgonRubyEyeMat);
            lEye.position.set(-0.025, 0.015, 0.035);
            sHead.add(lEye);
            snakeRoot.add(sHead);

            headGroup.add(snakeRoot);
            snakeHair.push(snakeRoot);
        }

        // 5. Dual Serrated Viper Kris Daggers (Venom-dripping wavy blades)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.55, 0.35, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.75, 6), this.gorgonSkinMat);
        rArm.position.y = -0.38;
        rightShoulder.add(rArm);

        // Right Viper Kris
        const rightKris = new THREE.Group();
        rightKris.position.set(0, -0.75, 0.2);
        rightKris.rotation.x = Math.PI / 3;
        const rBlade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.1, 0.16), this.darkSteelMat);
        rBlade.position.y = 0.45;
        rightKris.add(rBlade);
        const rVenom = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.65, 0.18), this.venomAcidMat);
        rVenom.position.y = 0.55;
        rightKris.add(rVenom);
        rightShoulder.add(rightKris);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.55, 0.35, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.75, 6), this.gorgonSkinMat);
        lArm.position.y = -0.38;
        leftShoulder.add(lArm);

        // Left Viper Kris
        const leftKris = new THREE.Group();
        leftKris.position.set(0, -0.75, 0.2);
        leftKris.rotation.x = Math.PI / 3;
        const lBlade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.1, 0.16), this.darkSteelMat);
        lBlade.position.y = 0.45;
        leftKris.add(lBlade);
        const lVenom = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.65, 0.18), this.venomAcidMat);
        lVenom.position.y = 0.55;
        leftKris.add(lVenom);
        leftShoulder.add(leftKris);

        // Generic leg dummy groups for 100% animation safety
        const rightHip = new THREE.Group();
        const leftHip = new THREE.Group();
        torso.add(rightHip);
        torso.add(leftHip);

        root.userData = {
            bodyGroup,
            torso,
            head: headGroup,
            headGroup,
            rightShoulder,
            leftShoulder,
            rightHip,
            leftHip,
            weapon: rightKris,
            tailSegments,
            snakeHair,
            gorgonGazeBeam,
            gazeLight,
            isGorgon: true
        };

        this.scene.add(root);
        return root;
    }

    // GIANT PIT VIPER / COLOSSAL COBRA (12-segment articulated undulating serpent)
    createGiantSerpent(x, z, angle = 0, y = 0) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 0.35;
        root.add(bodyGroup);

        const segments = [];
        const segCount = 12;

        for (let i = 0; i < segCount; i++) {
            const segGroup = new THREE.Group();
            const radius = 0.38 * (1.0 - (i / segCount) * 0.7);
            const length = 0.5;

            const segMesh = new THREE.Mesh(
                new THREE.CylinderGeometry(radius, radius * 0.92, length, 8),
                this.serpentScaleMat
            );
            segMesh.rotation.x = Math.PI / 2;
            segMesh.castShadow = true;
            segMesh.receiveShadow = true;
            segGroup.add(segMesh);

            const belly = new THREE.Mesh(
                new THREE.PlaneGeometry(radius * 1.6, length * 0.95),
                this.serpentBellyMat
            );
            belly.position.set(0, -radius * 0.88, 0);
            belly.rotation.x = Math.PI / 2;
            segGroup.add(belly);

            // Flared Cobra Hood on Segments 1 & 2
            if (i === 1 || i === 2) {
                const hood = new THREE.Mesh(
                    new THREE.BoxGeometry(0.85 - (i - 1) * 0.25, 0.12, length * 0.9),
                    this.serpentScaleMat
                );
                hood.position.y = 0.05;
                segGroup.add(hood);
            }

            segGroup.position.set(0, 0, -i * 0.45);
            bodyGroup.add(segGroup);
            segments.push(segGroup);
        }

        // Head on segment 0
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.15, 0.3);
        segments[0].add(headGroup);

        const skull = new THREE.Mesh(
            new THREE.ConeGeometry(0.28, 0.65, 4),
            this.serpentScaleMat
        );
        skull.rotation.x = -Math.PI / 2;
        skull.rotation.y = Math.PI / 4;
        skull.scale.set(1.2, 0.6, 1.0);
        headGroup.add(skull);

        // Glowing Yellow Eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
        const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 5, 5), eyeMat);
        leftEye.position.set(-0.16, 0.08, 0.12);
        headGroup.add(leftEye);
        const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 5, 5), eyeMat);
        rightEye.position.set(0.16, 0.08, 0.12);
        headGroup.add(rightEye);

        // Fangs & Forked Tongue
        const fangMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
        const leftFang = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.22, 4), fangMat);
        leftFang.position.set(-0.1, -0.08, 0.25);
        leftFang.rotation.x = Math.PI;
        headGroup.add(leftFang);
        const rightFang = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.22, 4), fangMat);
        rightFang.position.set(0.1, -0.08, 0.25);
        rightFang.rotation.x = Math.PI;
        headGroup.add(rightFang);

        // Forked Tongue
        const tongue = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, 0.015, 0.35),
            new THREE.MeshBasicMaterial({ color: 0xdd1122 })
        );
        tongue.position.set(0, -0.06, 0.38);
        headGroup.add(tongue);

        // Reusable dummy groups for generic animation safety
        const torso = segments[0];
        const rightShoulder = new THREE.Group();
        const leftShoulder = new THREE.Group();
        const rightHip = new THREE.Group();
        const leftHip = new THREE.Group();
        torso.add(rightShoulder);
        torso.add(leftShoulder);
        torso.add(rightHip);
        torso.add(leftHip);

        root.userData = {
            bodyGroup,
            torso,
            head: headGroup,
            rightShoulder,
            leftShoulder,
            rightHip,
            leftHip,
            weapon: segments[0],
            segments,
            tongue,
            isSerpent: true
        };

        this.scene.add(root);
        return root;
    }

    // MAN-SERPENT WARRIOR (Sen's Fortress bipedal serpent soldier)
    createManSerpent(x, z, angle = 0, y = 0) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.0;
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // Muscular Reptilian Chest
        const chest = new THREE.Mesh(
            new THREE.CylinderGeometry(0.38, 0.48, 1.1, 8),
            this.serpentScaleMat
        );
        chest.castShadow = true;
        torso.add(chest);

        // Serpentine Cobra Head & Snapping Jaw
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.8, 0.15);
        torso.add(headGroup);

        const sSkull = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.28, 0.48),
            this.serpentScaleMat
        );
        headGroup.add(sSkull);

        // Cobra Hood Flaring behind neck
        const hood = new THREE.Mesh(
            new THREE.BoxGeometry(0.75, 0.45, 0.1),
            this.serpentScaleMat
        );
        hood.position.set(0, 0.1, -0.2);
        headGroup.add(hood);

        // Snapping lower jaw
        const jaw = new THREE.Mesh(
            new THREE.BoxGeometry(0.28, 0.12, 0.42),
            this.serpentScaleMat
        );
        jaw.position.set(0, -0.16, 0.05);
        headGroup.add(jaw);

        // Eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
        const rEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 4, 4), eyeMat);
        rEye.position.set(0.16, 0.08, 0.15);
        headGroup.add(rEye);
        const lEye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 4, 4), eyeMat);
        lEye.position.set(-0.16, 0.08, 0.15);
        headGroup.add(lEye);

        // Reptilian Tail extending backwards
        const tail = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.06, 1.4, 6),
            this.serpentScaleMat
        );
        tail.position.set(0, -0.4, -0.65);
        tail.rotation.x = -0.7;
        torso.add(tail);

        // Right Arm & Serpent Flamberge
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.55, 0.35, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.85, 6), this.serpentScaleMat);
        rArm.position.y = -0.42;
        rightShoulder.add(rArm);

        // Serpent Flamberge (Wavy Greatsword)
        const flamberge = new THREE.Group();
        flamberge.position.set(0, -0.85, 0.3);
        flamberge.rotation.x = Math.PI / 3;
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.28), this.darkSteelMat);
        blade.position.y = 1.0;
        flamberge.add(blade);
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.12), this.gorgonArmorMat);
        guard.position.y = 0.05;
        flamberge.add(guard);
        rightShoulder.add(flamberge);

        // Left Arm & Spiked Shield
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.55, 0.35, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.85, 6), this.serpentScaleMat);
        lArm.position.y = -0.42;
        leftShoulder.add(lArm);

        const shield = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 0.65), this.gorgonArmorMat);
        shield.position.set(-0.15, -0.45, 0.25);
        leftShoulder.add(shield);

        // Muscular Taloned Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.24, -0.45, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.95, 6), this.serpentScaleMat);
        rLeg.position.y = -0.45;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.24, -0.45, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.95, 6), this.serpentScaleMat);
        lLeg.position.y = -0.45;
        leftHip.add(lLeg);

        root.userData = {
            bodyGroup,
            torso,
            head: headGroup,
            headGroup,
            rightShoulder,
            leftShoulder,
            rightHip,
            leftHip,
            weapon: flamberge,
            isManSerpent: true
        };

        this.scene.add(root);
        return root;
    }

    // PETRIFIED WARRIORS (Victims of Medusa's Petrifying Gaze)
    createPetrifiedWarrior(x, z, angle = 0, y = 0, poseIndex = 0) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const stoneMat = this.petrifiedStoneMat;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 0.9;
        root.add(bodyGroup);

        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.75, 0.32), stoneMat);
        torso.castShadow = true;
        torso.receiveShadow = true;
        bodyGroup.add(torso);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.28), stoneMat);
        head.position.y = 0.55;
        torso.add(head);

        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.38, 6), stoneMat);
        helm.position.y = 0.12;
        head.add(helm);

        if (poseIndex === 0) {
            // Shield-raised in terror
            torso.rotation.x = -0.25;
            head.rotation.x = -0.45;
            const shieldArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.7, 0.14), stoneMat);
            shieldArm.position.set(-0.35, 0.15, 0.35);
            shieldArm.rotation.x = Math.PI / 3;
            torso.add(shieldArm);
            const shield = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.95, 0.6), stoneMat);
            shield.position.set(-0.45, 0.3, 0.55);
            torso.add(shield);
        } else if (poseIndex === 1) {
            // Reaching out screaming
            torso.rotation.x = -0.4;
            head.rotation.x = 0.6;
            const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.75, 0.12), stoneMat);
            rArm.position.set(0.38, 0.5, 0.3);
            rArm.rotation.x = -Math.PI / 2.5;
            torso.add(rArm);
            const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.75, 0.12), stoneMat);
            lArm.position.set(-0.38, 0.5, 0.3);
            lArm.rotation.x = -Math.PI / 2.5;
            torso.add(lArm);
        } else if (poseIndex === 2) {
            // Kneeling with broken sword
            bodyGroup.position.y = 0.55;
            torso.rotation.x = 0.35;
            const sword = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.8, 0.15), stoneMat);
            sword.position.set(0.2, -0.2, 0.4);
            sword.rotation.x = Math.PI / 4;
            torso.add(sword);
        } else {
            // Mid-slash frozen
            torso.rotation.y = 0.5;
            const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.8, 0.14), stoneMat);
            rArm.position.set(0.35, 0.4, 0.2);
            rArm.rotation.x = -Math.PI / 3;
            torso.add(rArm);
            const claymore = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.8, 0.2), stoneMat);
            claymore.position.set(0.5, 0.8, 0.4);
            claymore.rotation.x = -Math.PI / 4;
            torso.add(claymore);
        }

        // Stone Base Plinth / Rubble
        const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.8, 0.2, 8), stoneMat);
        plinth.position.y = -0.85;
        bodyGroup.add(plinth);

        root.userData = { bodyGroup, torso, head, isPetrified: true };
        this.scene.add(root);
        return root;
    }

}
