// ==========================================
// DARK SOULS 3D PROCEDURAL CHARACTERS & ANIMATIONS
// Player (Chosen Undead Knight), Hollows, Black Knight, Taurus Demon Boss
// ==========================================

const COSTUMES = {
    forgotten_witness: {
        id: 'forgotten_witness',
        name: 'THE FORGOTTEN WITNESS',
        title: 'The Sunken Liturgy &bull; Order of the Blank Page, Ink-Draped Ashen Cowl & Zero-Debt Shroud',
        icon: '⚖️',
        desc: 'Garments of the entity born outside the Grand Ledger of Oaths. Shrouded in ash-grey wool inscribed with nullifying runes, unbound by celestial debt.',
        perk: 'Solvency of the Blank Page: +20% Damage vs Auditors & Debt Mobs, Immune to Default Curses, -20% Stamina Cost',
        perkData: { defMultiplier: 1.15, stamMultiplier: 1.25, speedMultiplier: 1.12, dmgBonus: 1.20, poiseBonus: 12 }
    },
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

        // Astora deep steel-blue field with subtle radial highlight
        const bgGrad = sCtx.createRadialGradient(256, 200, 30, 256, 256, 300);
        bgGrad.addColorStop(0, '#223854');
        bgGrad.addColorStop(0.65, '#142234');
        bgGrad.addColorStop(1, '#09111c');
        sCtx.fillStyle = bgGrad;
        sCtx.fillRect(0, 0, 512, 512);

        // Fluted steel damascus lines
        sCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        sCtx.lineWidth = 2;
        for (let i = 0; i < 512; i += 12) {
            sCtx.beginPath();
            sCtx.moveTo(i, 0);
            sCtx.lineTo(i, 512);
            sCtx.stroke();
        }

        // Golden rim border
        sCtx.strokeStyle = '#d4af37';
        sCtx.lineWidth = 18;
        sCtx.strokeRect(10, 10, 492, 492);
        sCtx.strokeStyle = '#7c5a1a';
        sCtx.lineWidth = 4;
        sCtx.strokeRect(22, 22, 468, 468);

        // Golden corner cornerpieces & rivets
        const corners = [[20, 20], [492, 20], [20, 492], [492, 492], [256, 18], [256, 494]];
        corners.forEach(([cx, cy]) => {
            sCtx.fillStyle = '#f5d061';
            sCtx.beginPath();
            sCtx.arc(cx, cy, 10, 0, Math.PI * 2);
            sCtx.fill();
            sCtx.fillStyle = '#543b0c';
            sCtx.beginPath();
            sCtx.arc(cx - 2, cy - 2, 4, 0, Math.PI * 2);
            sCtx.fill();
        });

        // Silver Heraldic Falcon & Sacred Cross of Astora
        sCtx.fillStyle = '#eaf0f8';
        sCtx.beginPath();
        // Cross vertical beam
        sCtx.fillRect(236, 50, 40, 400);
        // Cross horizontal bar
        sCtx.fillRect(110, 150, 292, 40);
        // Golden filigree inlays
        sCtx.fillStyle = '#f5c842';
        sCtx.fillRect(246, 55, 20, 390);
        sCtx.fillRect(115, 160, 282, 20);

        // Central diamond crest
        sCtx.fillStyle = '#ffd700';
        sCtx.beginPath();
        sCtx.moveTo(256, 130);
        sCtx.lineTo(295, 170);
        sCtx.lineTo(256, 210);
        sCtx.lineTo(217, 170);
        sCtx.closePath();
        sCtx.fill();
        sCtx.strokeStyle = '#5a3d08';
        sCtx.lineWidth = 3;
        sCtx.stroke();

        // Falcon wing heraldic flourishes
        sCtx.strokeStyle = '#d6e4f2';
        sCtx.lineWidth = 8;
        sCtx.beginPath();
        sCtx.arc(195, 245, 55, Math.PI * 0.15, Math.PI * 0.95);
        sCtx.stroke();
        sCtx.beginPath();
        sCtx.arc(317, 245, 55, Math.PI * 0.05, Math.PI * 0.85, true);
        sCtx.stroke();

        // Battle cuts & micro-scratches
        for (let i = 0; i < 55; i++) {
            const x1 = 30 + Math.random() * 452;
            const y1 = 30 + Math.random() * 452;
            const len = 15 + Math.random() * 45;
            const angle = Math.random() * Math.PI;
            sCtx.strokeStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.5)';
            sCtx.lineWidth = 1.3;
            sCtx.beginPath();
            sCtx.moveTo(x1, y1);
            sCtx.lineTo(x1 + Math.cos(angle) * len, y1 + Math.sin(angle) * len);
            sCtx.stroke();
        }

        const shieldTex = new THREE.CanvasTexture(shieldCanvas);
        this.defaultShieldTex = shieldTex;

        this.crestShieldMat = new THREE.MeshStandardMaterial({
            map: shieldTex,
            metalness: 0.82,
            roughness: 0.32,
            side: THREE.DoubleSide
        });

        // 1B. AGED OAK WOOD BACKING TEXTURE (256x256)
        const woodCanvas = document.createElement('canvas');
        woodCanvas.width = 256;
        woodCanvas.height = 256;
        const wCtx = woodCanvas.getContext('2d');
        wCtx.fillStyle = '#26180c';
        wCtx.fillRect(0, 0, 256, 256);
        // Vertical planks
        for (let x = 0; x < 256; x += 36) {
            wCtx.strokeStyle = '#120b05';
            wCtx.lineWidth = 2.5;
            wCtx.beginPath();
            wCtx.moveTo(x, 0);
            wCtx.lineTo(x, 256);
            wCtx.stroke();
        }
        for (let i = 0; i < 220; i++) {
            wCtx.fillStyle = Math.random() > 0.5 ? 'rgba(65, 42, 22, 0.35)' : 'rgba(10, 6, 3, 0.45)';
            wCtx.fillRect(Math.random() * 256, Math.random() * 256, 2, 12 + Math.random() * 28);
        }
        const woodTex = new THREE.CanvasTexture(woodCanvas);
        this.shieldWoodMat = new THREE.MeshStandardMaterial({
            map: woodTex,
            roughness: 0.88,
            metalness: 0.12,
            side: THREE.DoubleSide
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
            roughness: 0.72,
            side: THREE.DoubleSide
        });

        this.goldTrimMat = new THREE.MeshStandardMaterial({
            color: 0xd4a84e,
            metalness: 0.88,
            roughness: 0.28,
            side: THREE.DoubleSide
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

        // Procedural Demonic Keratin & Scales Bump Texture
        const scalesCanvas = document.createElement('canvas');
        scalesCanvas.width = 256;
        scalesCanvas.height = 256;
        const scalesCtx = scalesCanvas.getContext('2d');
        scalesCtx.fillStyle = '#808080';
        scalesCtx.fillRect(0, 0, 256, 256);
        for (let y = 0; y < 256; y += 12) {
            for (let x = 0; x < 256; x += 12) {
                const shift = (y / 12) % 2 === 0 ? 0 : 6;
                const brightness = Math.floor(100 + Math.random() * 80);
                scalesCtx.fillStyle = `rgb(${brightness},${brightness},${brightness})`;
                sCtx.beginPath();
                scalesCtx.arc((x + shift) % 256, y, 5, 0, Math.PI * 2);
                sCtx.fill();
            }
        }
        const scalesTex = new THREE.CanvasTexture(scalesCanvas);
        scalesTex.wrapS = THREE.RepeatWrapping;
        scalesTex.wrapT = THREE.RepeatWrapping;
        scalesTex.repeat.set(4, 4);

        // Procedural Weathered Stone / Chiseled Granite Texture
        const stoneCanvas = document.createElement('canvas');
        stoneCanvas.width = 256;
        stoneCanvas.height = 256;
        const stCtx = stoneCanvas.getContext('2d');
        stCtx.fillStyle = '#666666';
        stCtx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 500; i++) {
            stCtx.fillStyle = Math.random() > 0.5 ? '#444444' : '#888888';
            stCtx.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 4, 1 + Math.random() * 3);
        }
        const stoneTex = new THREE.CanvasTexture(stoneCanvas);
        stoneTex.wrapS = THREE.RepeatWrapping;
        stoneTex.wrapT = THREE.RepeatWrapping;
        stoneTex.repeat.set(3, 3);

        this.demonScalesTex = scalesTex;
        this.demonStoneTex = stoneTex;

        this.demonFleshMat = new THREE.MeshStandardMaterial({
            map: lavaTex,
            bumpMap: scalesTex,
            bumpScale: 0.08,
            color: 0x2e1f1a,
            roughness: 0.76,
            metalness: 0.28
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

        // 12. NEW ADVANCED 3D MOB ARCHETYPES MATERIALS
        this.wyrmScaleMat = new THREE.MeshStandardMaterial({
            color: 0x1c140e,
            metalness: 0.35,
            roughness: 0.65
        });
        this.magmaGlowMat = new THREE.MeshStandardMaterial({
            color: 0xff4500,
            emissive: 0xff2200,
            emissiveIntensity: 1.6,
            roughness: 0.2
        });
        this.crucibleGoldMat = new THREE.MeshStandardMaterial({
            color: 0xc28d38,
            metalness: 0.88,
            roughness: 0.28
        });
        this.crucibleRedMat = new THREE.MeshStandardMaterial({
            color: 0x5a1814,
            metalness: 0.45,
            roughness: 0.5
        });
        this.abductorIronMat = new THREE.MeshStandardMaterial({
            color: 0x242629,
            metalness: 0.82,
            roughness: 0.38
        });
        this.abductorBladeMat = new THREE.MeshStandardMaterial({
            color: 0x88929e,
            metalness: 0.95,
            roughness: 0.15
        });
        this.cosmicVelvetMat = new THREE.MeshStandardMaterial({
            color: 0x0a0d18,
            roughness: 0.85
        });
        this.cosmicGlowMat = new THREE.MeshStandardMaterial({
            color: 0x00f5ff,
            emissive: 0x00d0ee,
            emissiveIntensity: 1.4,
            roughness: 0.2
        });
        this.omenHornMat = new THREE.MeshStandardMaterial({
            color: 0x2a2015,
            roughness: 0.72,
            metalness: 0.15
        });
        this.omenFleshMat = new THREE.MeshStandardMaterial({
            color: 0x3e342c,
            roughness: 0.8
        });
        this.arachnidChitinMat = new THREE.MeshStandardMaterial({
            color: 0x121016,
            metalness: 0.7,
            roughness: 0.25
        });
        this.venomGlowMat = new THREE.MeshStandardMaterial({
            color: 0x39ff14,
            emissive: 0x22cc00,
            emissiveIntensity: 1.5,
            roughness: 0.2
        });

        // --- NEW ADVANCED 3D MOB ARCHETYPE MATERIALS ---
        this.jarTerracottaMat = new THREE.MeshStandardMaterial({
            color: 0xba5834,
            roughness: 0.85,
            metalness: 0.08
        });
        this.jarWaxSealMat = new THREE.MeshStandardMaterial({
            color: 0x991118,
            roughness: 0.35,
            metalness: 0.25
        });
        this.jarGoldMat = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            roughness: 0.3,
            metalness: 0.85
        });
        this.basiliskEyeMat = new THREE.MeshStandardMaterial({
            color: 0xffaa00,
            emissive: 0xff6600,
            emissiveIntensity: 0.9,
            roughness: 0.2
        });
        this.basiliskSkinMat = new THREE.MeshStandardMaterial({
            color: 0x3d352b,
            roughness: 0.65,
            metalness: 0.2
        });
        this.curseMistMat = new THREE.MeshStandardMaterial({
            color: 0x660088,
            emissive: 0x440066,
            emissiveIntensity: 0.7,
            transparent: true,
            opacity: 0.6
        });
        this.titaniteStoneMat = new THREE.MeshStandardMaterial({
            color: 0x2a302d,
            roughness: 0.9,
            metalness: 0.25
        });
        this.titaniteGlowMat = new THREE.MeshStandardMaterial({
            color: 0x00ffcc,
            emissive: 0x00aa88,
            emissiveIntensity: 0.85,
            roughness: 0.25
        });
        this.channelerSilkMat = new THREE.MeshStandardMaterial({
            color: 0xc49d3f,
            roughness: 0.5,
            metalness: 0.35
        });
        this.bonePaleMat = new THREE.MeshStandardMaterial({
            color: 0xdfd8c8,
            roughness: 0.75,
            metalness: 0.1
        });
        this.crowFeatherMat = new THREE.MeshStandardMaterial({
            color: 0x141824,
            roughness: 0.45,
            metalness: 0.35
        });
        this.stoneRuneMat = new THREE.MeshStandardMaterial({
            color: 0x48524a,
            roughness: 0.85,
            metalness: 0.25
        });
        this.chimeraFireMat = new THREE.MeshStandardMaterial({
            color: 0xff5500,
            emissive: 0xff2200,
            emissiveIntensity: 1.2,
            roughness: 0.3
        });
        this.gargoyleBronzeMat = new THREE.MeshStandardMaterial({
            color: 0x8c6239,
            metalness: 0.82,
            roughness: 0.35
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

        } else if (weaponId === 'rivers_of_blood') {
            // Rivers of Blood (Cursed Crimson Katana)
            const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.030, 0.45, 8), this.pitchWrapMat || this.leatherMat);
            hilt.position.y = -0.22;
            root.add(hilt);

            const tsuba = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 12), this.goldTrimMat);
            tsuba.position.y = 0.02;
            root.add(tsuba);

            const bladeGeo = new THREE.BoxGeometry(0.065, 1.55, 0.022);
            const bladeMat = new THREE.MeshStandardMaterial({
                color: 0x990011,
                emissive: 0x550008,
                emissiveIntensity: 0.8,
                roughness: 0.25,
                metalness: 0.8
            });
            const blade = new THREE.Mesh(bladeGeo, bladeMat);
            blade.position.set(0.02, 0.78, 0);
            blade.rotation.z = -0.04;
            blade.castShadow = true;
            root.add(blade);

            const bloodLight = new THREE.PointLight(0xff1122, 2.2, 8, 1.4);
            bloodLight.position.set(0, 0.8, 0);
            root.add(bloodLight);

        } else if (weaponId === 'dark_moon_greatsword') {
            // Dark Moon Greatsword (Ranni's Moonlight Frost Greatsword)
            const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.042, 0.50, 8), this.darkSteelMat);
            hilt.position.y = -0.24;
            root.add(hilt);

            const pommel = new THREE.Mesh(new THREE.DodecahedronGeometry(0.065), this.moonlightMat);
            pommel.position.y = -0.52;
            root.add(pommel);

            const guard = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.08, 0.12), this.moonlightMat);
            guard.position.y = 0.02;
            root.add(guard);

            const bladeGeo = new THREE.BoxGeometry(0.24, 1.85, 0.045);
            const bladeMat = new THREE.MeshStandardMaterial({
                color: 0x22eeff,
                emissive: 0x0088cc,
                emissiveIntensity: 1.2,
                roughness: 0.15,
                metalness: 0.5
            });
            const blade = new THREE.Mesh(bladeGeo, bladeMat);
            blade.position.y = 1.0;
            blade.castShadow = true;
            root.add(blade);

            const rimeLight = new THREE.PointLight(0x44ddff, 2.6, 9, 1.2);
            rimeLight.position.y = 1.1;
            root.add(rimeLight);

        } 
        else if (weaponId === 'carian_knights_sword') {
            const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.32, 8), this.leatherMat);
            hilt.position.y = -0.12;
            root.add(hilt);
            const guard = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 0.06), new THREE.MeshStandardMaterial({ color: 0x4a90e2, metalness: 0.8, roughness: 0.2 }));
            guard.position.y = 0.06;
            root.add(guard);
            const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.045), new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00aaff, emissiveIntensity: 0.6 }));
            gem.position.set(0, 0.06, 0.035);
            root.add(gem);
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.45, 0.025), new THREE.MeshStandardMaterial({ color: 0xd0e8ff, metalness: 0.9, roughness: 0.15 }));
            blade.position.y = 0.80;
            blade.castShadow = true;
            root.add(blade);
        }
        else if (weaponId === 'wing_of_astel') {
            const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.28, 8), new THREE.MeshStandardMaterial({ color: 0x1a237e }));
            hilt.position.y = -0.10;
            root.add(hilt);
            const wingBlade = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.35, 3), new THREE.MeshStandardMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.85, emissive: 0x18ffff, emissiveIntensity: 0.5, metalness: 0.5, roughness: 0.2 }));
            wingBlade.position.set(0.05, 0.72, 0);
            wingBlade.rotation.z = -0.08;
            root.add(wingBlade);
        }
        else if (weaponId === 'reduvia') {
            const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.22, 8), this.leatherMat);
            hilt.position.y = -0.08;
            root.add(hilt);
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.75, 0.025), new THREE.MeshStandardMaterial({ color: 0x880e4f, emissive: 0xd50000, emissiveIntensity: 0.4, metalness: 0.7, roughness: 0.3 }));
            blade.position.y = 0.38;
            root.add(blade);
        }
        else if (weaponId === 'magma_wyrm_scalesword') {
            const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.45, 8), this.leatherMat);
            hilt.position.y = -0.18;
            root.add(hilt);
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.9, 0.06), new THREE.MeshStandardMaterial({ color: 0xff3d00, emissive: 0xdd2c00, emissiveIntensity: 0.6, roughness: 0.7 }));
            blade.position.y = 1.05;
            blade.castShadow = true;
            root.add(blade);
        }
        else if (weaponId === 'profaned_greatsword') {
            const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.55, 8), this.darkSteelMat);
            hilt.position.y = -0.22;
            root.add(hilt);
            const guard = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.06, 0.08), this.darkSteelMat);
            guard.position.y = 0.08;
            root.add(guard);
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.05, 0.04), new THREE.MeshStandardMaterial({ color: 0xff6d00, emissive: 0xff3d00, emissiveIntensity: 0.45, metalness: 0.8, roughness: 0.25 }));
            blade.position.y = 1.12;
            blade.castShadow = true;
            root.add(blade);
        }
        else if (weaponId === 'greatsword_of_judgment') {
            const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.52, 8), this.darkSteelMat);
            hilt.position.y = -0.20;
            root.add(hilt);
            const guard = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.06, 0.08), this.darkSteelMat);
            guard.position.y = 0.08;
            root.add(guard);
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.20, 2.0, 0.04), new THREE.MeshStandardMaterial({ color: 0x4a148c, emissive: 0x7b1fa2, emissiveIntensity: 0.4, metalness: 0.85, roughness: 0.2 }));
            blade.position.y = 1.10;
            blade.castShadow = true;
            root.add(blade);
        }
        else if (weaponId === 'mornes_great_hammer') {
            const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.4, 8), this.darkSteelMat);
            shaft.position.y = 0.35;
            root.add(shaft);
            const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.55, 0.45), this.darkSteelMat);
            head.position.y = 1.15;
            head.castShadow = true;
            root.add(head);
        }
        else if (weaponId === 'paladin_grant') {
            const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 1.35, 8), this.darkSteelMat);
            shaft.position.y = 0.35;
            root.add(shaft);
            const head = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.52, 8), new THREE.MeshStandardMaterial({ color: 0xffd54f, metalness: 0.8, roughness: 0.2 }));
            head.position.y = 1.12;
            head.castShadow = true;
            root.add(head);
        }
        else if (weaponId === 'smouldering_demon_greataxe') {
            const haft = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.5, 8), this.leatherMat);
            haft.position.y = 0.40;
            root.add(haft);
            const axeHead = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.70, 0.08), new THREE.MeshStandardMaterial({ color: 0xbf360c, emissive: 0xff5722, emissiveIntensity: 0.4, roughness: 0.6 }));
            axeHead.position.set(0.22, 1.20, 0);
            axeHead.castShadow = true;
            root.add(axeHead);
        }
        else if (weaponId === 'mohgwyn_sacred_spear') {
            const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 8), this.darkSteelMat);
            shaft.position.y = 0.70;
            root.add(shaft);
            const centerProng = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.65, 4), new THREE.MeshStandardMaterial({ color: 0xb71c1c, emissive: 0xd50000, emissiveIntensity: 0.5 }));
            centerProng.position.y = 2.05;
            root.add(centerProng);
            const leftProng = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.45, 4), new THREE.MeshStandardMaterial({ color: 0xb71c1c }));
            leftProng.position.set(-0.16, 1.85, 0);
            leftProng.rotation.z = 0.2;
            root.add(leftProng);
            const rightProng = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.45, 4), new THREE.MeshStandardMaterial({ color: 0xb71c1c }));
            rightProng.position.set(0.16, 1.85, 0);
            rightProng.rotation.z = -0.2;
            root.add(rightProng);
        }

        else if (weaponId === 'torch') {
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
        // Authentic combat-ready weapon rigging (held naturally upright & balanced)
        const isColossal = ['zweihander', 'dark_moon_greatsword', 'moonlight', 'blasphemous_blade', 'starscourge_greatswords', 'godslayer_greatsword', 'holy_moonlight_sword', 'fume_ultra_greatsword', 'greatsword_of_artorias', 'bloodhounds_fang', 'claymore', 'sacred_relic_sword', 'ringed_knight_paired', 'magma_wyrm_scalesword', 'profaned_greatsword', 'greatsword_of_judgment'].includes(weaponId);
        const isPolearm = ['halberd', 'black_knight_halberd', 'eleonoras_poleblade', 'bolt_of_gransax', 'moonlight_butterfly_horn', 'dragonslayer_spear', 'lifehunt_scythe', 'friedes_scythe', 'mohgwyn_sacred_spear'].includes(weaponId);
        const isGreatImpact = ['dragontooth', 'giant_crusher', 'dragonslayer_greataxe', 'whirligig_saw', 'dragon_king_greataxe', 'smoughs_great_hammer', 'mornes_great_hammer', 'paladin_grant', 'smouldering_demon_greataxe'].includes(weaponId);
        const isKatana = ['uchigatana', 'rivers_of_blood', 'moonveil', 'kusabimaru', 'chikage', 'rakuyo', 'chaos_blade', 'mortal_blade', 'hand_of_malenia', 'frayed_blade'].includes(weaponId);

        if (isPolearm) {
            newWeapon.rotation.set(2.95, 0.04, 0.04);
            newWeapon.position.set(0.02, 0.02, 0.02);
        } else if (isColossal) {
            newWeapon.rotation.set(2.95, 0.06, 0.06);
            newWeapon.position.set(0.02, 0.02, 0.04);
        } else if (isGreatImpact) {
            newWeapon.rotation.set(2.95, 0.06, 0.06);
            newWeapon.position.set(0.02, 0.02, 0.04);
        } else if (weaponId === 'torch') {
            newWeapon.rotation.set(0.12, 0, -0.05);
            newWeapon.position.set(0, 0.06, 0.04);
        } else if (isKatana) {
            newWeapon.rotation.set(3.02, 0.04, 0.05);
            newWeapon.position.set(0.02, 0.0, 0.04);
        } else {
            // Authentic straight sword idle posture (blade hangs naturally down along outer thigh)
            newWeapon.rotation.set(3.02, 0.05, 0.05);
            newWeapon.position.set(0.02, 0.0, 0.04);
        }
        rHand.add(newWeapon);

        // Hide back sword hilt when holding any weapon to prevent double-sword / torch clipping
        if (playerMesh.userData && playerMesh.userData.greatswordHiltGroup) {
            playerMesh.userData.greatswordHiltGroup.visible = false;
        }

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
        rHand.position.y = -0.58;
        rightShoulder.add(rHand);

        const swordGroup = this.createWeaponMesh('sword');
        swordGroup.rotation.set(3.02, 0.05, 0.05);
        swordGroup.position.set(0.02, 0.0, 0.04);
        rHand.add(swordGroup);

        // 4. Left Arm (Shield & Offhand Arm)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.34, 0.26, 0);
        torso.add(leftShoulder);

        const lHand = new THREE.Group();
        lHand.position.y = -0.58;
        leftShoulder.add(lHand);

        // Authentic Sculpted 3D Dark Souls Crest Shield (Gothic Curved Heater Plate with Double-Sided Detailing)
        const shieldGroup = new THREE.Group();

        // 1. Solid Curved Heater Shield Shape
        const shieldShape = new THREE.Shape();
        const shW = 0.22, shTop = 0.36, shMid = 0.04, shBot = -0.38;
        shieldShape.moveTo(-shW, shTop);
        shieldShape.quadraticCurveTo(0, shTop + 0.02, shW, shTop);
        shieldShape.quadraticCurveTo(shW + 0.01, shMid + 0.14, shW, shMid);
        shieldShape.quadraticCurveTo(shW * 0.88, -0.18, 0, shBot);
        shieldShape.quadraticCurveTo(-shW * 0.88, -0.18, -shW, shMid);
        shieldShape.quadraticCurveTo(-shW - 0.01, shMid + 0.14, -shW, shTop);

        const shieldExtrudeSettings = {
            depth: 0.018,
            bevelEnabled: true,
            bevelSegments: 3,
            steps: 1,
            bevelSize: 0.010,
            bevelThickness: 0.010
        };

        const shieldPlateGeom = new THREE.ExtrudeGeometry(shieldShape, shieldExtrudeSettings);
        shieldPlateGeom.computeBoundingBox();
        const shBox = shieldPlateGeom.boundingBox;
        const shSizeX = shBox.max.x - shBox.min.x;
        const shSizeY = shBox.max.y - shBox.min.y;
        const shPos = shieldPlateGeom.attributes.position;
        const shUvs = shieldPlateGeom.attributes.uv;

        for (let i = 0; i < shPos.count; i++) {
            const x = shPos.getX(i);
            const z = shPos.getZ(i);
            // Cylindrical curvature wrapping naturally around arm and flank
            const curveZ = (1 - Math.min(1, (x / shW) * (x / shW))) * 0.038;
            shPos.setZ(i, z + curveZ);
            if (z > 0.005) {
                shUvs.setXY(i, (x - shBox.min.x) / shSizeX, (shPos.getY(i) - shBox.min.y) / shSizeY);
            }
        }
        shieldPlateGeom.computeVertexNormals();

        // Multi-material: Front face = Astora Crest texture, Beveled side rim = Polished Gold
        const shieldPlate = new THREE.Mesh(shieldPlateGeom, [this.crestShieldMat, this.goldTrimMat]);
        shieldPlate.castShadow = true;
        shieldPlate.receiveShadow = true;
        shieldGroup.add(shieldPlate);

        // 2. Inner Aged Oak Wood Back Plate (Mounted cleanly behind the metal face)
        const backGeom = new THREE.ExtrudeGeometry(shieldShape, {
            depth: 0.006,
            bevelEnabled: false
        });
        const bPos = backGeom.attributes.position;
        for (let i = 0; i < bPos.count; i++) {
            const x = bPos.getX(i);
            const z = bPos.getZ(i);
            const curveZ = (1 - Math.min(1, (x / shW) * (x / shW))) * 0.038;
            bPos.setZ(i, z + curveZ);
        }
        backGeom.computeVertexNormals();
        const shieldBack = new THREE.Mesh(backGeom, this.shieldWoodMat);
        shieldBack.position.z = -0.006;
        shieldGroup.add(shieldBack);

        // 3. Central Heraldic Shield Boss (Umbo)
        const bossGroup = new THREE.Group();
        bossGroup.position.set(0, 0.10, 0.065);

        const bossCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.060, 0.070, 0.014, 12), this.goldTrimMat);
        bossCollar.rotation.x = Math.PI / 2;
        bossGroup.add(bossCollar);

        const bossDome = new THREE.Mesh(new THREE.SphereGeometry(0.050, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), this.steelMat);
        bossDome.rotation.x = Math.PI / 2;
        bossGroup.add(bossDome);

        const bossStud = new THREE.Mesh(new THREE.OctahedronGeometry(0.020, 0), this.goldTrimMat);
        bossStud.position.z = 0.050;
        bossGroup.add(bossStud);

        shieldGroup.add(bossGroup);

        // 4. Perimeter 3D Golden Rivets (Catching torch light & specular reflections)
        const rivetCoords = [
            [0, 0.37, 0.065],
            [-0.19, 0.35, 0.022],
            [0.19, 0.35, 0.022],
            [-0.20, 0.04, 0.021],
            [0.20, 0.04, 0.021],
            [-0.12, -0.20, 0.034],
            [0.12, -0.20, 0.034],
            [0, -0.36, 0.062]
        ];
        const rivetGeom = new THREE.SphereGeometry(0.011, 8, 8);
        rivetCoords.forEach(([rx, ry, rz]) => {
            const rivet = new THREE.Mesh(rivetGeom, this.goldTrimMat);
            rivet.position.set(rx, ry, rz);
            shieldGroup.add(rivet);
        });

        // 5. Inner Steel Reinforcement Cross-Braces
        const brace1 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.024, 0.010), this.darkSteelMat);
        brace1.position.set(0, 0.12, 0.004);
        shieldGroup.add(brace1);

        const brace2 = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.024, 0.010), this.darkSteelMat);
        brace2.position.set(0, -0.12, 0.008);
        shieldGroup.add(brace2);

        // 6. Forearm Leather Padding Cushion Pad
        const pad = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.18, 0.020), this.leatherMat);
        pad.position.set(0, -0.03, -0.018);
        shieldGroup.add(pad);

        // 7. Forearm Enarme Straps (Snugly wrapping around left forearm vambrace)
        const strap1 = new THREE.Mesh(new THREE.TorusGeometry(0.070, 0.012, 8, 20), this.leatherMat);
        strap1.position.set(0, 0.05, -0.092);
        strap1.rotation.x = Math.PI / 2;
        shieldGroup.add(strap1);

        const buckle1 = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.018, 0.010), this.steelBuckleMat);
        buckle1.position.set(0, 0.05, -0.162);
        shieldGroup.add(buckle1);

        const strap2 = new THREE.Mesh(new THREE.TorusGeometry(0.066, 0.012, 8, 20), this.leatherMat);
        strap2.position.set(0, -0.10, -0.090);
        strap2.rotation.x = Math.PI / 2;
        shieldGroup.add(strap2);

        // 8. Hand Grip Handle Bar (Guige handle securely gripped inside left gauntlet)
        const handleBracket1 = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.016, 0.07), this.darkSteelMat);
        handleBracket1.position.set(-0.04, -0.18, -0.045);
        shieldGroup.add(handleBracket1);

        const handleBracket2 = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.016, 0.07), this.darkSteelMat);
        handleBracket2.position.set(0.04, -0.18, -0.045);
        shieldGroup.add(handleBracket2);

        const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.09, 8), this.scabbardWrapMat);
        handleBar.position.set(0, -0.18, -0.075);
        handleBar.rotation.z = Math.PI / 2;
        shieldGroup.add(handleBar);

        // Anatomically strapped to outer forearm: covers entire left flank & front-left
        shieldGroup.position.set(-0.08, 0.14, 0.02);
        shieldGroup.rotation.set(0.08, -1.35, -0.06);
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

        // Two-handed Greatsword Hilt (Compact authentic arming hilt, hidden when weapon drawn)
        const greatswordHiltGroup = new THREE.Group();
        greatswordHiltGroup.position.y = 0.40;
        greatswordHiltGroup.visible = false;
        backScabbardGroup.add(greatswordHiltGroup);

        const guardMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.032, 0.040), this.steelMat);
        guardMesh.castShadow = true;
        greatswordHiltGroup.add(guardMesh);

        const gripMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.020, 0.26, 8), this.scabbardWrapMat);
        gripMesh.position.y = 0.15;
        greatswordHiltGroup.add(gripMesh);

        for (let gi = 0; gi < 4; gi++) {
            const cordRing = new THREE.Mesh(new THREE.TorusGeometry(0.021, 0.004, 4, 8), this.leatherMat);
            cordRing.position.y = 0.06 + gi * 0.06;
            cordRing.rotation.x = Math.PI / 2;
            greatswordHiltGroup.add(cordRing);
        }

        const ringPommel = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.012, 8, 16), this.steelMat);
        ringPommel.position.y = 0.32;
        ringPommel.castShadow = true;
        greatswordHiltGroup.add(ringPommel);

        const pommelSpoke = new THREE.Mesh(new THREE.BoxGeometry(0.010, 0.070, 0.012), this.steelMat);
        pommelSpoke.position.y = 0.32;
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
            greatswordHiltGroup,
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

        const isRune = !!(mobDef && (mobDef.isRuneArcher || (mobDef.meshType && mobDef.meshType.includes('rune')) || (mobDef.name && (mobDef.name.includes('RUNE') || mobDef.name.includes('GLINTSTONE') || mobDef.name.includes('MAGIC')))));

        const torsoMat = isRune 
            ? new THREE.MeshStandardMaterial({ color: 0x141c30, roughness: 0.85, metalness: 0.18 })
            : (this.hollowRagsMat || this.quiltedSkirtMat);
        const skinMat = isRune
            ? new THREE.MeshStandardMaterial({ color: 0x48647e, roughness: 0.72 })
            : this.hollowSkinMat;

        // 1. Contoured Humanoid Torso wearing hooded archer cowl
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.58, 0.28), torsoMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Shoulder cowl drape
        const cowlMantle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.24, 0.32, 0.22, 12, 1, false, -Math.PI * 0.45, Math.PI * 0.9),
            torsoMat
        );
        cowlMantle.position.set(0, 0.22, 0.02);
        torso.add(cowlMantle);

        // Leather belt & waist quiver strap
        const belt = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.06, 0.30), this.leatherMat);
        belt.position.y = -0.22;
        torso.add(belt);

        // 2. Head with contoured archer hood / cowl
        const headGroup = new THREE.Group();
        headGroup.position.y = 0.48;
        torso.add(headGroup);

        const skull = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.28), skinMat);
        skull.castShadow = true;
        headGroup.add(skull);

        const cowl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.34), torsoMat);
        cowl.position.set(0, 0.04, -0.04);
        headGroup.add(cowl);

        // Sunken eye sockets with soul embers (Cyan for Rune Archer, Fiery Orange-Red for Hollow)
        const eyeColor = isRune ? 0x00e5ff : 0xc93010;
        this.attachHollowEyes(headGroup, eyeColor);

        const soulLight = new THREE.PointLight(isRune ? 0x00d8ff : 0xff2200, isRune ? 0.75 : 0.45, isRune ? 2.8 : 1.8);
        soulLight.position.set(0, 0.04, 0.18);
        headGroup.add(soulLight);

        // 3. Quiver with Bodkin / Glintstone Arrows on Back
        const quiverGroup = new THREE.Group();
        quiverGroup.position.set(0.12, 0.10, -0.18);
        quiverGroup.rotation.set(-0.15, 0, -0.38);
        torso.add(quiverGroup);

        const quiverBody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.065, 0.72, 8), 
            isRune ? new THREE.MeshStandardMaterial({ color: 0x121a2c, roughness: 0.65 }) : this.leatherMat
        );
        quiverBody.castShadow = true;
        quiverGroup.add(quiverBody);

        for (let a = 0; a < 5; a++) {
            const arrowShaft = new THREE.Mesh(
                new THREE.CylinderGeometry(0.012, 0.012, 0.75, 5), 
                isRune ? new THREE.MeshStandardMaterial({ color: 0x304860 }) : this.leatherMat
            );
            arrowShaft.position.set(-0.03 + (a % 3) * 0.03, 0.32 + (a % 2) * 0.06, (a > 2 ? 0.03 : -0.03));
            quiverGroup.add(arrowShaft);

            const fletchMat = isRune 
                ? new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x0088cc, emissiveIntensity: 0.6 })
                : new THREE.MeshStandardMaterial({ color: 0xdd2222 });
            const fletch = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.12, 0.05), fletchMat);
            fletch.position.set(-0.03 + (a % 3) * 0.03, 0.65, (a > 2 ? 0.03 : -0.03));
            quiverGroup.add(fletch);
        }

        // 4. Left Arm holding the Sculpted 3D Longbow
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.32, 0.20, 0);
        torso.add(leftShoulder);

        const lBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.060, 0.22, 8), skinMat);
        lBicep.position.y = -0.12;
        leftShoulder.add(lBicep);

        const lForearm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.060, 0.052, 0.24, 8),
            isRune ? new THREE.MeshStandardMaterial({ color: 0x182438, metalness: 0.4 }) : this.leatherMat
        );
        lForearm.position.y = -0.32;
        leftShoulder.add(lForearm);

        // Authentic Dark Souls Longbow / Carian Glintstone Recurve Bow (held firmly in left hand)
        const bowGroup = new THREE.Group();
        bowGroup.position.set(0, -0.44, 0.08);
        leftShoulder.add(bowGroup);

        const bowWoodMat = isRune
            ? new THREE.MeshStandardMaterial({ color: 0x162030, roughness: 0.45, metalness: 0.45 })
            : new THREE.MeshStandardMaterial({ color: 0x422a18, roughness: 0.65, metalness: 0.12 });
        const bowIronMat = isRune
            ? new THREE.MeshStandardMaterial({ color: 0x7ab6d6, roughness: 0.3, metalness: 0.85 })
            : new THREE.MeshStandardMaterial({ color: 0x242424, roughness: 0.45, metalness: 0.85 });
        const bowStringMat = isRune
            ? new THREE.MeshBasicMaterial({ color: 0xa8f5ff })
            : new THREE.MeshBasicMaterial({ color: 0xf0f0ea });

        // Central Riser Grip
        const bowHandle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.024, 0.026, 0.16, 8), 
            isRune ? new THREE.MeshStandardMaterial({ color: 0x0c1424, roughness: 0.6 }) : this.leatherMat
        );
        bowGroup.add(bowHandle);

        // Upper Recurve Limb
        const upperLimb = new THREE.Group();
        bowGroup.add(upperLimb);

        const uStave = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.022, 0.38, 7), bowWoodMat);
        uStave.position.set(0, 0.24, 0.04);
        uStave.rotation.x = -0.28;
        upperLimb.add(uStave);

        const uTip = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.016, 0.32, 6), bowWoodMat);
        uTip.position.set(0, 0.52, 0.02);
        uTip.rotation.x = 0.22;
        upperLimb.add(uTip);

        const uNock = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.06, 5), bowIronMat);
        uNock.position.set(0, 0.67, 0.0);
        upperLimb.add(uNock);

        // Lower Recurve Limb
        const lowerLimb = new THREE.Group();
        bowGroup.add(lowerLimb);

        const lStave = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.016, 0.38, 7), bowWoodMat);
        lStave.position.set(0, -0.24, 0.04);
        lStave.rotation.x = 0.28;
        lowerLimb.add(lStave);

        const lTip = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.010, 0.32, 6), bowWoodMat);
        lTip.position.set(0, -0.52, 0.02);
        lTip.rotation.x = -0.22;
        lowerLimb.add(lTip);

        const lNock = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.06, 5), bowIronMat);
        lNock.position.set(0, -0.67, 0.0);
        lNock.rotation.x = Math.PI;
        lowerLimb.add(lNock);

        // Dynamic Dual-Segment Bowstring (Draws back under tension)
        const upperString = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.68, 4), bowStringMat);
        upperString.position.set(0, 0.34, 0.02);
        bowGroup.add(upperString);

        const lowerString = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.68, 4), bowStringMat);
        lowerString.position.set(0, -0.34, 0.02);
        bowGroup.add(lowerString);

        // Carian Glintstone Rune Rings & Focus Crystal (Only on Rune Archers)
        let runeRingUpper = null;
        let runeRingLower = null;
        if (isRune) {
            const runeMat = new THREE.MeshBasicMaterial({ color: 0x00d8ff, wireframe: false });
            runeRingUpper = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.012, 6, 16), runeMat);
            runeRingUpper.position.set(0, 0.42, 0.02);
            bowGroup.add(runeRingUpper);

            runeRingLower = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.012, 6, 16), runeMat);
            runeRingLower.position.set(0, -0.42, 0.02);
            bowGroup.add(runeRingLower);

            // Glintstone Focus Crystal on Bow Riser
            const crystalGeo = new THREE.OctahedronGeometry(0.045);
            const crystalMat = new THREE.MeshStandardMaterial({
                color: 0x00ffff,
                emissive: 0x00d8ff,
                emissiveIntensity: 1.35,
                roughness: 0.15,
                metalness: 0.8
            });
            const focusCrystal = new THREE.Mesh(crystalGeo, crystalMat);
            focusCrystal.position.set(0, 0, 0.045);
            bowGroup.add(focusCrystal);

            const bowGlow = new THREE.PointLight(0x00d8ff, 1.4, 4.0);
            bowGlow.position.set(0, 0, 0.06);
            bowGroup.add(bowGlow);
        }

        // Notched Bodkin / Glintstone Arrow (Mounted on bow arrow-shelf)
        const notchedArrow = new THREE.Group();
        notchedArrow.position.set(0, 0, 0.02);
        bowGroup.add(notchedArrow);

        const nShaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.008, 0.008, 0.90, 6),
            isRune ? new THREE.MeshStandardMaterial({ color: 0xd8eeff, roughness: 0.5 }) : this.leatherMat
        );
        nShaft.rotation.x = Math.PI / 2;
        nShaft.position.z = 0.45;
        notchedArrow.add(nShaft);

        const nTipMat = isRune
            ? new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00d8ff, emissiveIntensity: 1.5 })
            : this.steelMat;
        const nTip = new THREE.Mesh(new THREE.ConeGeometry(isRune ? 0.035 : 0.026, isRune ? 0.15 : 0.12, 6), nTipMat);
        nTip.rotation.x = -Math.PI / 2;
        nTip.position.z = 0.94;
        notchedArrow.add(nTip);

        for (let f = 0; f < 3; f++) {
            const fletchMat = isRune
                ? new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x0088cc, emissiveIntensity: 0.6 })
                : new THREE.MeshStandardMaterial({ color: 0xcc2222 });
            const fletch = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.045, 0.11), fletchMat);
            fletch.position.set(0, 0, 0.05);
            fletch.rotation.z = (f * Math.PI * 2) / 3;
            notchedArrow.add(fletch);
        }

        // 5. Right Arm (Draw Arm & Archer Gauntlet)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.32, 0.20, 0);
        torso.add(rightShoulder);

        const rBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.060, 0.22, 8), skinMat);
        rBicep.position.y = -0.12;
        rightShoulder.add(rBicep);

        const rForearm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.060, 0.052, 0.24, 8),
            isRune ? new THREE.MeshStandardMaterial({ color: 0x182438, metalness: 0.4 }) : this.leatherMat
        );
        rForearm.position.y = -0.32;
        rightShoulder.add(rForearm);

        const rHand = new THREE.Mesh(
            new THREE.BoxGeometry(0.09, 0.10, 0.09), 
            isRune ? new THREE.MeshStandardMaterial({ color: 0x0c1424 }) : this.leatherMat
        );
        rHand.position.set(0, -0.46, 0);
        rightShoulder.add(rHand);

        // 6. Contoured Grounded Legs & Archer Boots
        const rightHip = new THREE.Group();
        rightHip.position.set(0.15, -0.32, 0);
        torso.add(rightHip);

        const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.072, 0.32, 8), torsoMat);
        rThigh.position.y = -0.16;
        rightHip.add(rThigh);

        const rBoot = new THREE.Mesh(
            new THREE.CylinderGeometry(0.070, 0.060, 0.30, 8),
            isRune ? new THREE.MeshStandardMaterial({ color: 0x0c1424 }) : this.leatherMat
        );
        rBoot.position.y = -0.44;
        rightHip.add(rBoot);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.15, -0.32, 0);
        torso.add(leftHip);

        const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.072, 0.32, 8), torsoMat);
        lThigh.position.y = -0.16;
        leftHip.add(lThigh);

        const lBoot = new THREE.Mesh(
            new THREE.CylinderGeometry(0.070, 0.060, 0.30, 8),
            isRune ? new THREE.MeshStandardMaterial({ color: 0x0c1424 }) : this.leatherMat
        );
        lBoot.position.y = -0.44;
        leftHip.add(lBoot);

        root.userData = {
            type: isRune ? 'rune_archer' : 'archer',
            mobType: 'ranged',
            isRuneArcher: isRune,
            bodyGroup,
            torso,
            head: headGroup,
            rightShoulder,
            leftShoulder,
            rightHip,
            leftHip,
            bowGroup,
            upperString,
            lowerString,
            bowString: upperString,
            notchedArrow,
            quiverGroup,
            runeRingUpper,
            runeRingLower
        };

        this.scene.add(root);
        return root;
    }

    createArrowMesh(isMagic = false) {
        const arrow = new THREE.Group();

        if (isMagic) {
            // Carian Glintstone Magic Arrow (Ethereal Crystal Spear Projectile)
            const shaft = new THREE.Mesh(
                new THREE.CylinderGeometry(0.016, 0.016, 0.92, 8),
                new THREE.MeshStandardMaterial({
                    color: 0xd8eeff,
                    emissive: 0x0088cc,
                    emissiveIntensity: 0.65,
                    roughness: 0.25,
                    metalness: 0.6
                })
            );
            shaft.castShadow = true;
            arrow.add(shaft);

            // Glowing Glintstone Crystal Broadhead
            const crystalHead = new THREE.Mesh(
                new THREE.ConeGeometry(0.048, 0.22, 6),
                new THREE.MeshStandardMaterial({
                    color: 0x00ffff,
                    emissive: 0x00d8ff,
                    emissiveIntensity: 1.5,
                    roughness: 0.1,
                    metalness: 0.8
                })
            );
            crystalHead.position.y = 0.52;
            crystalHead.castShadow = true;
            arrow.add(crystalHead);

            // Orbiting Glintstone Rune Ring Collar
            const runeRing = new THREE.Mesh(
                new THREE.TorusGeometry(0.065, 0.007, 6, 12),
                new THREE.MeshBasicMaterial({ color: 0x00d8ff })
            );
            runeRing.position.y = 0.40;
            runeRing.rotation.x = Math.PI / 2;
            arrow.add(runeRing);

            // Starlight Cyan Fletching
            for (let f = 0; f < 3; f++) {
                const feather = new THREE.Mesh(
                    new THREE.BoxGeometry(0.005, 0.16, 0.05),
                    new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00aacc, emissiveIntensity: 0.8 })
                );
                feather.position.y = -0.35;
                feather.rotation.y = (f * Math.PI * 2) / 3;
                arrow.add(feather);
            }

            // High-luminance Arcane Light Aura
            const glow = new THREE.PointLight(0x00d8ff, 1.8, 5.0);
            glow.position.y = 0.35;
            arrow.add(glow);

            arrow.userData = { isMagic: true };
            return arrow;
        }

        // Standard Ash wood shaft (length 0.85m)
        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.014, 0.014, 0.82, 6),
            new THREE.MeshStandardMaterial({ color: 0x6e4e3a, roughness: 0.75 })
        );
        shaft.castShadow = true;
        arrow.add(shaft);

        // Steel pyramid bodkin point
        const bodkin = new THREE.Mesh(
            new THREE.ConeGeometry(0.038, 0.15, 4),
            this.steelMat
        );
        bodkin.position.y = 0.45;
        bodkin.castShadow = true;
        arrow.add(bodkin);

        // Fletching (3 vanes)
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

        arrow.userData = { isMagic: false };
        return arrow;
    }

    // ----------------------------------------------------
    // CREATE PROCEDURAL MOB (30 MOBS COMPENDIUM)
    // Supports 30 distinct mob types with unique geometries, weapons & materials
    // ----------------------------------------------------
    createMob(mobDef, x, z, angle = 0, y = 0) {
        const type = (mobDef && (mobDef.meshType || mobDef.id)) || 'torch_hollow';

        if (type.includes('jar') || type.includes('pot') || type.includes('alexander')) {
            return this.createLivingJarMob(x, z, angle, y, mobDef);
        } else if (type.includes('belfry_gargoyle') || type.includes('winged_gargoyle') || type === 'gargoyle_mob') {
            return this.createBelfryGargoyleMob(x, z, angle, y, mobDef);
        } else if (type.includes('titanite_demon') || type === 'titanite' || type.includes('titanite_catch_pole')) {
            return this.createTitaniteDemonMob(x, z, angle, y, mobDef);
        } else if (type.includes('channeleer') || type.includes('channeler')) {
            return this.createChannelerSorcererMob(x, z, angle, y, mobDef);
        } else if (type.includes('skeletal_beast') || type.includes('giant_dog_skeleton')) {
            return this.createSkeletalBeastMob(x, z, angle, y, mobDef);
        } else if (type.includes('stone_guardian') || type.includes('sanctuary_stone')) {
            return this.createAncientStoneGuardianMob(x, z, angle, y, mobDef);
        } else if (type.includes('silver_knight_greatbow') || type.includes('greatbowman')) {
            return this.createSilverKnightGreatbowMob(x, z, angle, y, mobDef);
        } else if (type.includes('darkwraith') || type.includes('abyssal_darkwraith')) {
            return this.createAbyssalDarkwraithMob(x, z, angle, y, mobDef);
        } else if (type.includes('crow_demon') || type.includes('corvian')) {
            return this.createCrowDemonMob(x, z, angle, y, mobDef);
        } else if (type.includes('new_londo_ghost') || type.includes('banshee')) {
            return this.createNewLondoGhostMob(x, z, angle, y, mobDef);
        } else if (type.includes('wheel_skeleton')) {
            return this.createWheelSkeletonMob(x, z, angle, y, mobDef);
        } else if (type.includes('treant_guardian') || type.includes('bark_guardian') || type.includes('ancient_treant')) {
            return this.createTreantBarkGuardian(x, z, angle, y, mobDef);
        } else if (type.includes('cursed_basilisk') || type.includes('basilisk_alpha') || type.includes('death_basilisk')) {
            return this.createCursedBasilisk(x, z, angle, y, mobDef);
        } else if (type.includes('fell_omen_gladiator') || type.includes('omen_gladiator')) {
            return this.createFellOmenGladiator(x, z, angle, y, mobDef);
        } else if (type.includes('crystal_drake') || type.includes('drake_whelp')) {
            return this.createCrystalDrakeWhelp(x, z, angle, y, mobDef);
        } else if (type.includes('crucible_knight_sentinel') || type.includes('crucible_sentinel')) {
            return this.createCrucibleKnightSentinel(x, z, angle, y, mobDef);
        } else if (type.includes('fire_chimera') || type.includes('chimera_hound')) {
            return this.createFireChimeraHound(x, z, angle, y, mobDef);
        } else if (type.includes('gorgon') || type.includes('medusa')) {
            return this.createGorgonMedusa(x, z, angle, y, mobDef);
        } else if (type.includes('giant_cobra') || type.includes('pit_viper') || type.includes('serpent_swarm') || type === 'snake' || type === 'serpent' || type.includes('viper')) {
            return this.createGiantSerpent(x, z, angle, y);
        } else if (type.includes('man_serpent')) {
            return this.createManSerpent(x, z, angle, y);
        } else if (type.includes('archer') || (mobDef && mobDef.isArcher) || (mobDef && mobDef.aiType === 'Ranged')) {
            return this.createHollowArcher(x, z, angle, y, mobDef);
        } else if (type.includes('dragonkin') || type.includes('magma_wyrm') || type.includes('wyrm')) {
            return this.createDragonkinWyrm(x, z, angle, y, mobDef);
        } else if (type.includes('crucible')) {
            return this.createCrucibleKnightMob(x, z, angle, y, mobDef);
        } else if (type.includes('abductor') || type.includes('iron_maiden')) {
            return this.createAbductorVirgin(x, z, angle, y, mobDef);
        } else if (type.includes('mindflayer') || type.includes('cthulhu') || type.includes('astral_scholar')) {
            return this.createCthulhuMindflayer(x, z, angle, y, mobDef);
        } else if (type.includes('omen') || type.includes('bloodfiend') || type.includes('horned_ogre')) {
            return this.createOmenOgre(x, z, angle, y, mobDef);
        } else if (type.includes('arachnid') || type.includes('spider_beast') || type.includes('scorpion')) {
            return this.createArachnidScuttler(x, z, angle, y, mobDef);
        } else if (type.includes('shadow_wolf') || type.includes('red_wolf') || type.includes('dire_wolf')) {
            return this.createDireShadowWolf(x, z, angle, y, mobDef);
        } else if (type.includes('pus_of_man') || type.includes('abyssal_pus') || type.includes('corrupted_serpent')) {
            return this.createAbyssalPusBeast(x, z, angle, y, mobDef);
        } else if (type.includes('black_knife') || type.includes('shadow_assassin') || type.includes('numen_assassin')) {
            return this.createBlackKnifeAssassin(x, z, angle, y, mobDef);
        } else if (type.includes('horned_shaman') || type.includes('ancestral_shaman') || type.includes('horned_druid')) {
            return this.createAncestralHornedShaman(x, z, angle, y, mobDef);
        } else if (type.includes('marionette') || type.includes('glintstone_automaton') || type.includes('clockwork_soldier')) {
            return this.createGlintstoneAutomaton(x, z, angle, y, mobDef);
        } else if (type.includes('magma_wyrm_hatchling') || type.includes('molten_drake') || type.includes('basalt_drake')) {
            return this.createMagmaWyrmHatchling(x, z, angle, y, mobDef);
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
        bodyGroup.position.y = 2.4;
        root.add(bodyGroup);

        const fleshMat = this.demonFleshMat;
        const hornMat = this.demonHornMat;
        const lavaMat = this.demonLavaMat;
        const ironMat = this.darkSteelMat || this.demonHornMat;
        const woodMat = this.stoneClubMat;

        // 1. ANATOMICALLY SCULPTED DEMONIC TORSO
        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // Broad Upper Chest / Pectorals
        const upperChestGeo = new THREE.CylinderGeometry(1.35, 1.05, 1.3, 12);
        upperChestGeo.scale(1.2, 1.0, 0.95);
        const upperChest = new THREE.Mesh(upperChestGeo, fleshMat);
        upperChest.position.set(0, 0.45, 0);
        upperChest.castShadow = true;
        torso.add(upperChest);

        // Pectoral Muscle Plates (Left & Right)
        for (let side = -1; side <= 1; side += 2) {
            const pecGeo = new THREE.BoxGeometry(0.75, 0.65, 0.35);
            const pec = new THREE.Mesh(pecGeo, fleshMat);
            pec.position.set(side * 0.45, 0.55, 0.55);
            pec.rotation.set(0.1, side * -0.15, side * -0.05);
            torso.add(pec);

            // Spiked Obsidian Shoulder Pauldron
            const pauldronGeo = new THREE.CylinderGeometry(0.45, 0.65, 0.7, 8);
            pauldronGeo.scale(1.1, 1.0, 1.3);
            const pauldron = new THREE.Mesh(pauldronGeo, ironMat);
            pauldron.position.set(side * 1.5, 0.9, -0.05);
            pauldron.rotation.set(0, 0, side * -0.45);
            torso.add(pauldron);

            // Spikes on Pauldron
            for (let sp = -1; sp <= 1; sp += 2) {
                const pSpike = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.55, 5), hornMat);
                pSpike.position.set(side * 1.6 + side * 0.25, 1.1 + sp * 0.15, sp * 0.25);
                pSpike.rotation.set(sp * 0.4, 0, side * -0.8);
                torso.add(pSpike);
            }
        }

        // Abdominal Core & Serratus Ribs
        const absCore = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 1.15), fleshMat);
        absCore.position.set(0, -0.45, 0);
        absCore.castShadow = true;
        torso.add(absCore);

        // 6-Pack Muscle Definition
        for (let row = 0; row < 3; row++) {
            for (let col = -1; col <= 1; col += 2) {
                const ab = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.24, 0.15), fleshMat);
                ab.position.set(col * 0.28, -0.2 - row * 0.28, 0.6);
                torso.add(ab);
            }
        }

        // Molten Core Fissure (Multi-Segment Lava Heart)
        const lavaCrack = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.5, 0.25), lavaMat);
        lavaCrack.position.set(0, 0.05, 0.62);
        torso.add(lavaCrack);

        // Secondary volcanic vein branches
        const lavaVeinL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.15), lavaMat);
        lavaVeinL.position.set(-0.35, 0.35, 0.61);
        lavaVeinL.rotation.z = -0.35;
        torso.add(lavaVeinL);
        const lavaVeinR = lavaVeinL.clone();
        lavaVeinR.position.x = 0.35;
        lavaVeinR.rotation.z = 0.35;
        torso.add(lavaVeinR);

        // Massive Demonic Spines along Vertebral Column
        for (let i = 0; i < 7; i++) {
            const size = 0.18 + Math.sin(i / 6 * Math.PI) * 0.12;
            const length = 0.55 + Math.sin(i / 6 * Math.PI) * 0.35;
            const spine = new THREE.Mesh(new THREE.ConeGeometry(size, length, 6), hornMat);
            spine.rotation.x = -Math.PI / 2 + (i - 3) * 0.08;
            spine.position.set(0, 0.9 - i * 0.28, -0.75 - Math.sin(i / 6 * Math.PI) * 0.15);
            torso.add(spine);
        }

        // Heavy Tail
        const tailRoot = new THREE.Group();
        tailRoot.position.set(0, -0.85, -0.55);
        torso.add(tailRoot);
        let currentTail = tailRoot;
        for (let t = 0; t < 5; t++) {
            const segGeo = new THREE.CylinderGeometry(0.22 - t * 0.035, 0.26 - t * 0.035, 0.45, 7);
            const seg = new THREE.Mesh(segGeo, fleshMat);
            seg.position.set(0, -0.2, -0.15);
            seg.rotation.x = -0.35;
            currentTail.add(seg);
            currentTail = seg;
        }
        const tailSpade = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.45, 4), hornMat);
        tailSpade.position.set(0, -0.25, 0);
        tailSpade.rotation.x = Math.PI;
        currentTail.add(tailSpade);

        // 2. FIERCE MINOTAUR DEMON HEAD
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.45, 0.45);
        torso.add(headGroup);

        // Cranium
        const craniumGeo = new THREE.BoxGeometry(0.95, 0.85, 0.95);
        const cranium = new THREE.Mesh(craniumGeo, fleshMat);
        cranium.position.set(0, 0.15, -0.1);
        headGroup.add(cranium);

        // Elongated Beast Snout / Muzzle
        const muzzleGeo = new THREE.BoxGeometry(0.8, 0.55, 0.85);
        const muzzle = new THREE.Mesh(muzzleGeo, fleshMat);
        muzzle.position.set(0, -0.15, 0.45);
        headGroup.add(muzzle);

        // Iron Nose Ring
        const ringGeo = new THREE.TorusGeometry(0.18, 0.045, 6, 16);
        const noseRing = new THREE.Mesh(ringGeo, ironMat);
        noseRing.position.set(0, -0.32, 0.85);
        noseRing.rotation.x = Math.PI / 2;
        headGroup.add(noseRing);

        // Exposed Lower Demonic Fangs
        const fangGeo = new THREE.ConeGeometry(0.08, 0.35, 5);
        for (let side = -1; side <= 1; side += 2) {
            const fang = new THREE.Mesh(fangGeo, hornMat);
            fang.position.set(side * 0.3, -0.12, 0.8);
            fang.rotation.set(-0.35, 0, side * 0.25);
            headGroup.add(fang);
        }

        // Burning Red Demonic Eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff1100 });
        for (let side = -1; side <= 1; side += 2) {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), eyeMat);
            eye.position.set(side * 0.38, 0.18, 0.42);
            headGroup.add(eye);

            const brow = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.3), fleshMat);
            brow.position.set(side * 0.36, 0.3, 0.45);
            brow.rotation.z = side * 0.2;
            headGroup.add(brow);
        }

        // Majestic 3-Segment Curling Ram Horns
        for (let side = -1; side <= 1; side += 2) {
            const hornBase = new THREE.Group();
            hornBase.position.set(side * 0.55, 0.45, 0);
            headGroup.add(hornBase);

            // Segment 1 (Base - flares out and back)
            const h1 = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.8, 8), hornMat);
            h1.rotation.set(side * 0.2, 0, side * -0.85);
            h1.position.set(side * 0.35, 0.2, -0.15);
            hornBase.add(h1);

            // Segment 2 (Middle - curves upward and forward)
            const h2 = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 0.85, 8), hornMat);
            h2.position.set(side * 0.72, 0.7, 0.15);
            h2.rotation.set(-0.6, side * 0.35, side * -0.45);
            hornBase.add(h2);

            // Segment 3 (Tip - sharp lethal point curving forward)
            const h3 = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.85, 8), hornMat);
            h3.position.set(side * 0.75, 1.05, 0.7);
            h3.rotation.set(-1.45, 0, side * -0.2);
            hornBase.add(h3);

            // Bronze Trophy Battle Bands on Horn
            if (side === 1) {
                const bandGeo = new THREE.TorusGeometry(0.28, 0.05, 6, 12);
                const band = new THREE.Mesh(bandGeo, ironMat);
                band.position.copy(h1.position);
                band.rotation.copy(h1.rotation);
                hornBase.add(band);
            }
        }

        // 3. RIGHT ARM & COLOSSAL STONE DEMON GREATHAMMER
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.6, 0.85, 0);
        torso.add(rightShoulder);

        const rDeltoid = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), fleshMat);
        rightShoulder.add(rDeltoid);

        const rBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 1.25, 8), fleshMat);
        rBicep.position.y = -0.65;
        rBicep.castShadow = true;
        rightShoulder.add(rBicep);

        // Spiked Forearm Bracer
        const rBracer = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.38, 0.7, 8), ironMat);
        rBracer.position.y = -1.0;
        rightShoulder.add(rBracer);

        const rHand = new THREE.Group();
        rHand.position.y = -1.45;
        rightShoulder.add(rHand);

        // Hand digits gripping shaft
        const handFlesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.45), fleshMat);
        rHand.add(handFlesh);

        // WEAPON: DEMON'S GREAT HAMMER / CLEAVER
        const weaponGroup = new THREE.Group();
        
        // Petrified Ironwood Shaft
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 4.8, 10), woodMat);
        shaft.position.y = 0.9;
        shaft.castShadow = true;
        weaponGroup.add(shaft);

        // Iron Binding Chains wrapped around shaft
        for (let ch = -0.5; ch <= 2.2; ch += 0.55) {
            const chainLink = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.045, 5, 10), ironMat);
            chainLink.position.y = ch;
            chainLink.rotation.x = Math.PI / 2 + ch * 0.8;
            weaponGroup.add(chainLink);
        }

        // Colossal Basalt Head with Carved Notches
        const hammerHeadGeo = new THREE.BoxGeometry(1.4, 2.2, 1.4);
        const hammerHead = new THREE.Mesh(hammerHeadGeo, woodMat);
        hammerHead.position.y = 2.7;
        hammerHead.castShadow = true;
        weaponGroup.add(hammerHead);

        // Jagged Granite Crown / Cleave Face
        const strikeCrown = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.1, 4), woodMat);
        strikeCrown.position.set(0, 3.85, 0);
        strikeCrown.rotation.y = Math.PI / 4;
        weaponGroup.add(strikeCrown);

        // Heavy Rusted Iron Spikes
        for (let s = 0; s < 6; s++) {
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.75, 5), ironMat);
            const angle = (s / 6) * Math.PI * 2;
            spike.position.set(Math.cos(angle) * 0.85, 2.7 + (s % 2) * 0.5 - 0.25, Math.sin(angle) * 0.85);
            spike.rotation.z = Math.PI / 2;
            spike.rotation.y = -angle;
            weaponGroup.add(spike);
        }

        // Weapon Flame Light (Fires during Enrage / Phase 2)
        const weaponFlame = new THREE.PointLight(0xff4400, 0, 14);
        weaponFlame.position.set(0, 2.7, 0);
        weaponGroup.add(weaponFlame);

        weaponGroup.rotation.x = Math.PI / 3;
        rHand.add(weaponGroup);

        // 4. LEFT ARM (Ripping Beast Claws)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-1.6, 0.85, 0);
        torso.add(leftShoulder);

        const lDeltoid = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), fleshMat);
        leftShoulder.add(lDeltoid);

        const lBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 1.25, 8), fleshMat);
        lBicep.position.y = -0.65;
        lBicep.castShadow = true;
        leftShoulder.add(lBicep);

        const lBracer = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.38, 0.7, 8), ironMat);
        lBracer.position.y = -1.0;
        leftShoulder.add(lBracer);

        const lHand = new THREE.Group();
        lHand.position.y = -1.45;
        leftShoulder.add(lHand);

        const lPalm = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.35, 0.45), fleshMat);
        lHand.add(lPalm);

        // 4 Razor Claws on Hand
        for (let c = -1.5; c <= 1.5; c += 1.0) {
            const claw = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.5, 5), hornMat);
            claw.position.set(c * 0.14, -0.32, 0.12);
            claw.rotation.x = 0.5;
            lHand.add(claw);
        }

        // 5. POWERFUL BOVINE DEMON LEGS & HOOVES
        const rightHip = new THREE.Group();
        rightHip.position.set(0.72, -0.95, 0);
        torso.add(rightHip);

        const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.38, 1.35, 8), fleshMat);
        rThigh.position.y = -0.65;
        rThigh.castShadow = true;
        rightHip.add(rThigh);

        // Knee Armor Guard
        const rKnee = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.4, 0.35), ironMat);
        rKnee.position.set(0, -1.3, 0.22);
        rightHip.add(rKnee);

        // Lower Leg & Heavy Hoof
        const rHoof = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 0.65, 8), ironMat);
        rHoof.position.set(0, -1.7, 0.05);
        rightHip.add(rHoof);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.72, -0.95, 0);
        torso.add(leftHip);

        const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.38, 1.35, 8), fleshMat);
        lThigh.position.y = -0.65;
        lThigh.castShadow = true;
        leftHip.add(lThigh);

        const lKnee = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.4, 0.35), ironMat);
        lKnee.position.set(0, -1.3, 0.22);
        leftHip.add(lKnee);

        const lHoof = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 0.65, 8), ironMat);
        lHoof.position.set(0, -1.7, 0.05);
        leftHip.add(lHoof);

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

        const stoneMat = this.gargoyleStoneMat;
        const bronzeMat = this.bronzeHalberdMat;
        const hornMat = this.demonHornMat;
        const bladeMat = this.bladeMat;
        const membraneMat = this.wingMembraneMat;

        // 1. Sculpted Gothic Stone Torso
        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // Core chest block (upper pectoral mass)
        const upperChestGeo = new THREE.CylinderGeometry(0.72, 0.58, 1.1, 8);
        const upperChest = new THREE.Mesh(upperChestGeo, stoneMat);
        upperChest.scale.set(1.25, 1.0, 0.85);
        upperChest.castShadow = true;
        torso.add(upperChest);

        // Pectoral slabs
        const pecGeo = new THREE.BoxGeometry(0.65, 0.45, 0.28);
        const pecL = new THREE.Mesh(pecGeo, stoneMat);
        pecL.position.set(-0.35, 0.18, 0.42);
        pecL.rotation.z = 0.08;
        torso.add(pecL);
        const pecR = new THREE.Mesh(pecGeo, stoneMat);
        pecR.position.set(0.35, 0.18, 0.42);
        pecR.rotation.z = -0.08;
        torso.add(pecR);

        // Abdominal core & Ribcage arches
        const midAbGeo = new THREE.CylinderGeometry(0.52, 0.48, 0.85, 8);
        const midAb = new THREE.Mesh(midAbGeo, stoneMat);
        midAb.position.y = -0.75;
        midAb.scale.set(1.15, 1.0, 0.82);
        midAb.castShadow = true;
        torso.add(midAb);

        // Gothic ribcage ridges along flanks
        for (let r = 0; r < 4; r++) {
            const ribY = -0.15 - r * 0.22;
            const ribScale = 1.0 - r * 0.08;
            const ribMeshL = new THREE.Mesh(new THREE.BoxGeometry(0.68 * ribScale, 0.11, 0.22), stoneMat);
            ribMeshL.position.set(-0.46, ribY, 0.34);
            ribMeshL.rotation.set(-0.06, 0.35, 0.12);
            torso.add(ribMeshL);

            const ribMeshR = new THREE.Mesh(new THREE.BoxGeometry(0.68 * ribScale, 0.11, 0.22), stoneMat);
            ribMeshR.position.set(0.46, ribY, 0.34);
            ribMeshR.rotation.set(-0.06, -0.35, -0.12);
            torso.add(ribMeshR);
        }

        // Spine column & dorsal gargoyle spikes along back
        for (let s = 0; s < 6; s++) {
            const spineY = 0.42 - s * 0.28;
            const vert = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.26), stoneMat);
            vert.position.set(0, spineY, -0.44);
            torso.add(vert);

            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.32, 4), hornMat);
            spike.position.set(0, spineY, -0.62);
            spike.rotation.x = -Math.PI / 2.2;
            torso.add(spike);
        }

        // Gargoyle waist belt / stone grotesque trim
        const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.58, 0.22, 10), bronzeMat);
        belt.position.y = -1.15;
        torso.add(belt);

        // 2. Chiseled Gargoyle Head & Grotesque Face
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.72, 0.28);
        torso.add(headGroup);

        // Cranium block
        const craniumGeo = new THREE.BoxGeometry(0.72, 0.65, 0.78);
        const cranium = new THREE.Mesh(craniumGeo, stoneMat);
        cranium.position.set(0, 0.12, 0);
        cranium.castShadow = true;
        headGroup.add(cranium);

        // Heavy demonic brow ridge
        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.18, 0.28), stoneMat);
        brow.position.set(0, 0.24, 0.36);
        headGroup.add(brow);

        // Snout & Upper Jaw
        const snout = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.34, 0.55), stoneMat);
        snout.position.set(0, -0.05, 0.52);
        snout.rotation.x = 0.12;
        headGroup.add(snout);

        // Lower Jaw & Fangs
        const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.22, 0.52), stoneMat);
        jaw.position.set(0, -0.28, 0.46);
        jaw.rotation.x = 0.24; // snarling open mouth
        headGroup.add(jaw);

        // Upper & Lower Stone Fangs
        const fangGeo = new THREE.ConeGeometry(0.05, 0.22, 4);
        const fangL1 = new THREE.Mesh(fangGeo, hornMat);
        fangL1.position.set(-0.2, -0.2, 0.68);
        fangL1.rotation.x = Math.PI;
        headGroup.add(fangL1);
        const fangR1 = new THREE.Mesh(fangGeo, hornMat);
        fangR1.position.set(0.2, -0.2, 0.68);
        fangR1.rotation.x = Math.PI;
        headGroup.add(fangR1);

        const fangL2 = new THREE.Mesh(fangGeo, hornMat);
        fangL2.position.set(-0.16, -0.18, 0.58);
        headGroup.add(fangL2);
        const fangR2 = new THREE.Mesh(fangGeo, hornMat);
        fangR2.position.set(0.16, -0.18, 0.58);
        headGroup.add(fangR2);

        // Pointed Gargoyle Ears
        const earGeo = new THREE.ConeGeometry(0.12, 0.55, 4);
        const earL = new THREE.Mesh(earGeo, stoneMat);
        earL.position.set(-0.46, 0.38, -0.1);
        earL.rotation.set(-0.2, 0, 0.65);
        headGroup.add(earL);

        const earR = new THREE.Mesh(earGeo, stoneMat);
        earR.position.set(0.46, 0.38, -0.1);
        earR.rotation.set(-0.2, 0, -0.65);
        headGroup.add(earR);

        // Sweeping Horns with Bronze Growth Bands
        for (let side = -1; side <= 1; side += 2) {
            const hornGroup = new THREE.Group();
            hornGroup.position.set(side * 0.38, 0.42, -0.05);
            headGroup.add(hornGroup);

            const hornBase = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.55, 6), hornMat);
            hornBase.rotation.set(-0.35, 0, side * 0.45);
            hornBase.position.set(side * 0.12, 0.22, -0.08);
            hornGroup.add(hornBase);

            const hornRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 6, 12), bronzeMat);
            hornRing.position.copy(hornBase.position);
            hornRing.rotation.copy(hornBase.rotation);
            hornGroup.add(hornRing);

            const hornMid = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 0.65, 6), hornMat);
            hornMid.rotation.set(-0.65, 0, side * 0.85);
            hornMid.position.set(side * 0.34, 0.58, -0.26);
            hornGroup.add(hornMid);

            const hornTip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.65, 5), hornMat);
            hornTip.rotation.set(-0.95, 0, side * 1.15);
            hornTip.position.set(side * 0.62, 0.88, -0.52);
            hornGroup.add(hornTip);
        }

        // Glowing Amber Gargoyle Eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), eyeMat);
        eyeL.position.set(-0.25, 0.12, 0.42);
        headGroup.add(eyeL);
        const eyeR = eyeL.clone();
        eyeR.position.x = 0.25;
        headGroup.add(eyeR);

        // Throat Flame Light (Activated during Fire Breath)
        const throatFlame = new THREE.PointLight(0xff4400, 0, 12);
        throatFlame.position.set(0, -0.15, 0.75);
        headGroup.add(throatFlame);

        // 3. Sprawling Articulated Stone Wings (Left & Right)
        const leftWingGroup = new THREE.Group();
        leftWingGroup.position.set(-0.75, 0.45, -0.45);
        torso.add(leftWingGroup);

        const rightWingGroup = new THREE.Group();
        rightWingGroup.position.set(0.75, 0.45, -0.45);
        torso.add(rightWingGroup);

        // Construct high-detail bat wing with 3 articulated struts & dual membrane
        const buildGargoyleWing = (wingGroup, side) => {
            // Shoulder strut (Humerus)
            const strut1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.4, 6), stoneMat);
            strut1.position.set(side * 0.65, 0.45, 0);
            strut1.rotation.z = side * 0.65;
            wingGroup.add(strut1);

            // Elbow spur
            const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 6), stoneMat);
            elbow.position.set(side * 1.25, 0.85, 0);
            wingGroup.add(elbow);

            const spur = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.35, 4), hornMat);
            spur.position.set(side * 1.32, 1.05, 0);
            spur.rotation.z = side * 0.4;
            wingGroup.add(spur);

            // Forearm strut
            const strut2 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 1.6, 6), stoneMat);
            strut2.position.set(side * 1.95, 0.65, 0);
            strut2.rotation.z = side * -0.45;
            wingGroup.add(strut2);

            // 3 Wing finger digits radiating outwards
            const fingerGeo = new THREE.CylinderGeometry(0.04, 0.08, 1.8, 5);
            for (let f = 0; f < 3; f++) {
                const finger = new THREE.Mesh(fingerGeo, stoneMat);
                const fAngle = side * (-0.15 - f * 0.38);
                finger.position.set(side * (2.2 + f * 0.35), 0.1 - f * 0.45, 0);
                finger.rotation.z = fAngle;
                wingGroup.add(finger);

                const claw = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.28, 4), hornMat);
                claw.position.set(side * (2.4 + f * 0.5), -0.7 - f * 0.55, 0);
                claw.rotation.z = fAngle;
                wingGroup.add(claw);
            }

            // Dual-sided leathery stone wing membrane
            const wingPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2), membraneMat);
            wingPlane.position.set(side * 1.7, 0.15, 0);
            wingPlane.rotation.y = side * 0.15;
            wingPlane.material.side = THREE.DoubleSide;
            wingGroup.add(wingPlane);
        };

        buildGargoyleWing(leftWingGroup, -1);
        buildGargoyleWing(rightWingGroup, 1);

        // 4. Jointed Stone Tail with Bladed Axe Tip
        const tailGroup = new THREE.Group();
        tailGroup.position.set(0, -0.95, -0.45);
        torso.add(tailGroup);

        // Segmented vertebrae chain
        let prevTail = tailGroup;
        for (let t = 0; t < 6; t++) {
            const tSeg = new THREE.Group();
            tSeg.position.set(0, -0.18, -0.32);
            tSeg.rotation.x = 0.22 - t * 0.04;
            prevTail.add(tSeg);

            const rSeg = 0.18 - t * 0.022;
            const vertMesh = new THREE.Mesh(new THREE.CylinderGeometry(rSeg * 0.85, rSeg, 0.42, 6), stoneMat);
            vertMesh.rotation.x = Math.PI / 2.4;
            tSeg.add(vertMesh);

            // Tail spike
            const tSpike = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.24, 4), hornMat);
            tSpike.position.set(0, 0.12, -0.1);
            tSpike.rotation.x = -Math.PI / 3;
            tSeg.add(tSpike);

            prevTail = tSeg;
        }

        // Bladed Tail-Axe Finial
        const tailAxeGroup = new THREE.Group();
        prevTail.add(tailAxeGroup);

        const tailAxeBlade = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.65, 0.14), bronzeMat);
        tailAxeBlade.position.set(0, 0.1, -0.25);
        tailAxeBlade.rotation.x = Math.PI / 4;
        tailAxeGroup.add(tailAxeBlade);

        const tailAxeSpike = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.65, 4), bladeMat);
        tailAxeSpike.position.set(0, 0.18, -0.65);
        tailAxeSpike.rotation.x = -Math.PI / 2.2;
        tailAxeGroup.add(tailAxeSpike);

        // 5. Right Arm with Ornate Belfry Halberd
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.95, 0.45, 0);
        torso.add(rightShoulder);

        // Spiked gothic pauldron
        const pauldronR = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), stoneMat);
        pauldronR.scale.set(1.1, 0.9, 1.1);
        rightShoulder.add(pauldronR);
        const pSpikeR = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.45, 4), hornMat);
        pSpikeR.position.set(0.28, 0.22, 0);
        pSpikeR.rotation.z = -0.65;
        rightShoulder.add(pSpikeR);

        const rBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.75, 6), stoneMat);
        rBicep.position.set(0, -0.42, 0);
        rightShoulder.add(rBicep);

        const rElbow = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), stoneMat);
        rElbow.position.set(0, -0.85, 0);
        rightShoulder.add(rElbow);

        const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.8, 6), stoneMat);
        rForearm.position.set(0, -1.25, 0);
        rightShoulder.add(rForearm);

        const rHand = new THREE.Group();
        rHand.position.set(0, -1.68, 0);
        rightShoulder.add(rHand);

        // Claws on right hand
        for (let c = 0; c < 4; c++) {
            const claw = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.22, 4), hornMat);
            claw.position.set((c - 1.5) * 0.1, -0.15, 0.12);
            claw.rotation.x = 0.5;
            rHand.add(claw);
        }

        // Authentic Belfry Halberd
        const halberdGroup = new THREE.Group();
        // Reinforced bronze & iron pole shaft
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 5.2, 8), bronzeMat);
        pole.position.y = 1.1;
        pole.castShadow = true;
        halberdGroup.add(pole);

        // Leather grip wraps on pole
        for (let g = 0; g < 3; g++) {
            const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.35, 8), this.leatherMat);
            grip.position.y = -0.4 + g * 0.55;
            halberdGroup.add(grip);
        }

        // Halberd head socket
        const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.55, 8), bronzeMat);
        socket.position.y = 3.35;
        halberdGroup.add(socket);

        // Crescent Axe Blade
        const axeCrescent = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.95, 0.14), bronzeMat);
        axeCrescent.position.set(0.65, 3.45, 0);
        axeCrescent.castShadow = true;
        halberdGroup.add(axeCrescent);

        // Axe cutting edge
        const axeEdge = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.15, 0.08), bladeMat);
        axeEdge.position.set(1.28, 3.45, 0);
        axeEdge.castShadow = true;
        halberdGroup.add(axeEdge);

        // Rear armor-piercing spike hook
        const rearHook = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.75, 4), bladeMat);
        rearHook.position.set(-0.55, 3.45, 0);
        rearHook.rotation.z = Math.PI / 2;
        halberdGroup.add(rearHook);

        // Top Spear Tip
        const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.1, 6), bladeMat);
        spearTip.position.y = 4.2;
        spearTip.castShadow = true;
        halberdGroup.add(spearTip);

        halberdGroup.rotation.x = Math.PI / 3;
        rHand.add(halberdGroup);

        // 6. Left Arm (Gargoyle Shield-Claw)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.95, 0.45, 0);
        torso.add(leftShoulder);

        const pauldronL = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), stoneMat);
        pauldronL.scale.set(1.1, 0.9, 1.1);
        leftShoulder.add(pauldronL);
        const pSpikeL = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.45, 4), hornMat);
        pSpikeL.position.set(-0.28, 0.22, 0);
        pSpikeL.rotation.z = 0.65;
        leftShoulder.add(pSpikeL);

        const lBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.75, 6), stoneMat);
        lBicep.position.set(0, -0.42, 0);
        leftShoulder.add(lBicep);

        const lElbow = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), stoneMat);
        lElbow.position.set(0, -0.85, 0);
        leftShoulder.add(lElbow);

        const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.8, 6), stoneMat);
        lForearm.position.set(0, -1.25, 0);
        leftShoulder.add(lForearm);

        // Spiked forearm stone guard
        const guardSpike = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 4), hornMat);
        guardSpike.position.set(-0.18, -1.15, 0);
        guardSpike.rotation.z = Math.PI / 2.5;
        leftShoulder.add(guardSpike);

        const lHand = new THREE.Group();
        lHand.position.set(0, -1.68, 0);
        leftShoulder.add(lHand);

        for (let c = 0; c < 4; c++) {
            const claw = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.28, 4), hornMat);
            claw.position.set((c - 1.5) * 0.1, -0.18, 0.12);
            claw.rotation.x = 0.6;
            lHand.add(claw);
        }

        // 7. Powerful Muscular Digitigrade Legs & Bird-of-Prey Talons
        const rightHip = new THREE.Group();
        rightHip.position.set(0.48, -1.15, 0);
        torso.add(rightHip);

        const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.95, 7), stoneMat);
        rThigh.position.set(0, -0.45, 0);
        rightHip.add(rThigh);

        const rHock = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), stoneMat);
        rHock.position.set(0, -0.95, -0.05);
        rightHip.add(rHock);

        const rShin = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.95, 6), stoneMat);
        rShin.position.set(0, -1.45, 0.05);
        rShin.rotation.x = 0.12;
        rightHip.add(rShin);

        // 3 heavy stone ground talons
        for (let t = 0; t < 3; t++) {
            const talon = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.45, 4), hornMat);
            talon.position.set((t - 1) * 0.2, -1.95, 0.22);
            talon.rotation.x = 1.1;
            rightHip.add(talon);
        }

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.48, -1.15, 0);
        torso.add(leftHip);

        const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.95, 7), stoneMat);
        lThigh.position.set(0, -0.45, 0);
        leftHip.add(lThigh);

        const lHock = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), stoneMat);
        lHock.position.set(0, -0.95, -0.05);
        leftHip.add(lHock);

        const lShin = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.95, 6), stoneMat);
        lShin.position.set(0, -1.45, 0.05);
        lShin.rotation.x = 0.12;
        leftHip.add(lShin);

        for (let t = 0; t < 3; t++) {
            const talon = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.45, 4), hornMat);
            talon.position.set((t - 1) * 0.2, -1.95, 0.22);
            talon.rotation.x = 1.1;
            leftHip.add(talon);
        }

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

        const skinMat = this.capraSkinMat;
        const skullMat = this.goatSkullMat;
        const hornMat = this.demonHornMat;
        const leatherMat = this.leatherMat;

        // 1. Hunched Muscular Demon Torso
        const torso = new THREE.Group();
        torso.rotation.x = Math.PI / 14; // Savage hunched posture
        bodyGroup.add(torso);

        // Core chest cylinder & sculpted pectorals
        const chestMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.55, 1.25, 8), skinMat);
        chestMesh.scale.set(1.22, 1.0, 0.88);
        chestMesh.castShadow = true;
        torso.add(chestMesh);

        // Defined sinewy pectorals
        const pecL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.42, 0.25), skinMat);
        pecL.position.set(-0.32, 0.22, 0.42);
        pecL.rotation.z = 0.08;
        torso.add(pecL);
        const pecR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.42, 0.25), skinMat);
        pecR.position.set(0.32, 0.22, 0.42);
        pecR.rotation.z = -0.08;
        torso.add(pecR);

        // Lean abdominal core
        const abMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.44, 0.9, 8), skinMat);
        abMesh.position.y = -0.85;
        abMesh.scale.set(1.15, 1.0, 0.82);
        abMesh.castShadow = true;
        torso.add(abMesh);

        // Leather harness straps crossing the chest
        const strap1 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 0.06), leatherMat);
        strap1.position.set(0, 0.1, 0.48);
        strap1.rotation.z = 0.55;
        torso.add(strap1);

        const strap2 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.12, 0.06), leatherMat);
        strap2.position.set(0, 0.1, 0.48);
        strap2.rotation.z = -0.55;
        torso.add(strap2);

        // Rusted iron buckle at harness center
        const buckle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 8), this.rustedIronMat || this.darkSteelMat);
        buckle.rotation.x = Math.PI / 2;
        buckle.position.set(0, 0.1, 0.52);
        torso.add(buckle);

        // Jagged spinal bone crest projecting from vertebrae
        for (let i = 0; i < 7; i++) {
            const spikeY = 0.5 - i * 0.24;
            const ridge = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.55, 4), skullMat);
            ridge.rotation.x = -Math.PI / 2.1;
            ridge.position.set(0, spikeY, -0.48);
            torso.add(ridge);
        }

        // 2. Terrifying Bleached Goat Skull Head
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.88, 0.32);
        torso.add(headGroup);

        // Cranium block
        const skullGeo = new THREE.CylinderGeometry(0.34, 0.38, 0.72, 7);
        const skull = new THREE.Mesh(skullGeo, skullMat);
        skull.rotation.x = 0.38;
        skull.scale.set(1.1, 1.0, 1.35);
        skull.castShadow = true;
        headGroup.add(skull);

        // Elongated demonic muzzle / nasal bone
        const snout = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.72), skullMat);
        snout.position.set(0, -0.16, 0.48);
        snout.rotation.x = 0.48;
        headGroup.add(snout);

        // Exposed lower jaw with teeth
        const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.65), skullMat);
        jaw.position.set(0, -0.38, 0.42);
        jaw.rotation.x = 0.65; // open menacing snarl
        headGroup.add(jaw);

        // Teeth rows
        for (let t = 0; t < 5; t++) {
            const toothUpper = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.14, 4), skullMat);
            toothUpper.position.set((t - 2) * 0.07, -0.28, 0.65 + (t === 2 ? 0.08 : 0));
            toothUpper.rotation.x = Math.PI;
            headGroup.add(toothUpper);
        }

        // Hollow eye sockets with glowing crimson embers
        const socketGeo = new THREE.TorusGeometry(0.12, 0.04, 6, 8);
        const sockL = new THREE.Mesh(socketGeo, skullMat);
        sockL.position.set(-0.25, 0.08, 0.32);
        sockL.rotation.y = -0.3;
        headGroup.add(sockL);

        const sockR = new THREE.Mesh(socketGeo, skullMat);
        sockR.position.set(0.25, 0.08, 0.32);
        sockR.rotation.y = 0.3;
        headGroup.add(sockR);

        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff1100 });
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
        eyeL.position.set(-0.24, 0.08, 0.34);
        headGroup.add(eyeL);
        const eyeR = eyeL.clone();
        eyeR.position.x = 0.24;
        headGroup.add(eyeR);

        // Eye glow light
        const capraEyeLight = new THREE.PointLight(0xff2200, 1.2, 5);
        capraEyeLight.position.set(0, 0.1, 0.5);
        headGroup.add(capraEyeLight);

        // Monumental Curved Spiral Capra Horns
        for (let side = -1; side <= 1; side += 2) {
            const hornGroup = new THREE.Group();
            hornGroup.position.set(side * 0.35, 0.28, 0.05);
            headGroup.add(hornGroup);

            // 4-segment sweeping goat horn with growth ridges
            const h1 = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.75, 6), hornMat);
            h1.position.set(side * 0.25, 0.35, -0.15);
            h1.rotation.set(-0.45, 0, side * 0.55);
            hornGroup.add(h1);

            const h2 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.85, 6), hornMat);
            h2.position.set(side * 0.65, 0.85, -0.55);
            h2.rotation.set(-0.85, 0, side * 0.85);
            hornGroup.add(h2);

            const h3 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.85, 6), hornMat);
            h3.position.set(side * 0.95, 1.25, -1.15);
            h3.rotation.set(-1.25, 0, side * 1.05);
            hornGroup.add(h3);

            const hTip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.85, 5), hornMat);
            hTip.position.set(side * 1.15, 1.45, -1.85);
            hTip.rotation.set(-1.55, 0, side * 1.15);
            hornGroup.add(hTip);
        }

        // 3. Right Arm with Demon Great Machete #1
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.85, 0.45, 0);
        torso.add(rightShoulder);

        const rBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.8, 6), skinMat);
        rBicep.position.set(0, -0.45, 0);
        rightShoulder.add(rBicep);

        const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.85, 6), skinMat);
        rForearm.position.set(0, -1.15, 0);
        rightShoulder.add(rForearm);

        // Leather forearm wrap
        const rWrap = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.45, 6), leatherMat);
        rWrap.position.set(0, -1.1, 0);
        rightShoulder.add(rWrap);

        const rHand = new THREE.Group();
        rHand.position.set(0, -1.65, 0);
        rightShoulder.add(rHand);

        const rMachete = this.createDemonMacheteMesh();
        rMachete.rotation.x = Math.PI / 3.5;
        rHand.add(rMachete);

        // 4. Left Arm with Demon Great Machete #2 (Dual Wielding!)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.85, 0.45, 0);
        torso.add(leftShoulder);

        const lBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.8, 6), skinMat);
        lBicep.position.set(0, -0.45, 0);
        leftShoulder.add(lBicep);

        const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.85, 6), skinMat);
        lForearm.position.set(0, -1.15, 0);
        leftShoulder.add(lForearm);

        const lWrap = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.45, 6), leatherMat);
        lWrap.position.set(0, -1.1, 0);
        leftShoulder.add(lWrap);

        const lHand = new THREE.Group();
        lHand.position.set(0, -1.65, 0);
        leftShoulder.add(lHand);

        const lMachete = this.createDemonMacheteMesh();
        lMachete.rotation.x = Math.PI / 3.5;
        lHand.add(lMachete);

        // 5. Digitigrade Satyr Demon Legs & Cloven Hooves
        const rightHip = new THREE.Group();
        rightHip.position.set(0.45, -1.2, 0);
        torso.add(rightHip);

        const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.95, 7), skinMat);
        rThigh.position.set(0, -0.45, 0);
        rightHip.add(rThigh);

        const rHock = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), skinMat);
        rHock.position.set(0, -0.95, -0.08);
        rightHip.add(rHock);

        const rShin = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.95, 6), skinMat);
        rShin.position.set(0, -1.45, 0.08);
        rShin.rotation.x = 0.15;
        rightHip.add(rShin);

        // Cloven Hoof
        const rHoof = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.28, 0.48), hornMat);
        rHoof.position.set(0, -1.95, 0.18);
        rightHip.add(rHoof);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.45, -1.2, 0);
        torso.add(leftHip);

        const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.95, 7), skinMat);
        lThigh.position.set(0, -0.45, 0);
        leftHip.add(lThigh);

        const lHock = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), skinMat);
        lHock.position.set(0, -0.95, -0.08);
        leftHip.add(lHock);

        const lShin = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.95, 6), skinMat);
        lShin.position.set(0, -1.45, 0.08);
        lShin.rotation.x = 0.15;
        leftHip.add(lShin);

        const lHoof = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.28, 0.48), hornMat);
        lHoof.position.set(0, -1.95, 0.18);
        leftHip.add(lHoof);

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
        const macheteMat = this.capraMacheteMat;
        const leatherMat = this.leatherMat;
        const skullMat = this.goatSkullMat;

        // Two-handed hilt wrapped in coarse leather
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.4, 8), leatherMat);
        handle.position.y = 0.3;
        group.add(handle);

        // Iron skull-crusher pommel
        const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), macheteMat);
        pommel.position.y = -0.45;
        group.add(pommel);

        // Heavy crossguard collar
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.24), macheteMat);
        guard.position.y = 1.05;
        group.add(guard);

        // Massive Brutal Cleaver Blade
        // 1. Heavy reinforced spine
        const spine = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.8, 0.22), macheteMat);
        spine.position.set(-0.16, 2.45, 0);
        spine.castShadow = true;
        group.add(spine);

        // 2. Wide convex cutting edge
        const bladeBody = new THREE.Mesh(new THREE.BoxGeometry(0.38, 2.7, 0.12), macheteMat);
        bladeBody.position.set(0.08, 2.45, 0);
        bladeBody.castShadow = true;
        group.add(bladeBody);

        // 3. Serrated blood notches along blade spine
        for (let s = 0; s < 4; s++) {
            const notch = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.32, 4), macheteMat);
            notch.position.set(-0.28, 1.6 + s * 0.55, 0);
            notch.rotation.z = Math.PI / 2.2;
            group.add(notch);
        }

        // 4. Wicked forward chopping tip
        const tipChopper = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.12), macheteMat);
        tipChopper.position.set(0.12, 3.85, 0);
        tipChopper.rotation.z = -0.35;
        tipChopper.castShadow = true;
        group.add(tipChopper);

        // Top spike finial
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.75, 4), macheteMat);
        tip.position.set(-0.05, 4.25, 0);
        tip.castShadow = true;
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

        const furMat = this.wolfFurMat;
        const underbellyMat = this.wolfUnderbellyMat;
        const hornMat = this.demonHornMat;
        const bladeMat = this.artoriasBladeMat;
        const goldMat = this.goldTrimMat;
        const steelMat = this.darkSteelMat;

        // 1. Long Muscular Wolf Body
        const chest = new THREE.Group();
        bodyGroup.add(chest);

        // Core barrel ribcage
        const chestMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 2.6, 8), furMat);
        chestMesh.rotation.x = Math.PI / 2;
        chestMesh.scale.set(1.0, 1.15, 1.0);
        chestMesh.castShadow = true;
        chest.add(chestMesh);

        // Fluffy underbelly
        const underbelly = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.82, 2.4, 8), underbellyMat);
        underbelly.position.y = -0.32;
        underbelly.rotation.x = Math.PI / 2;
        chest.add(underbelly);

        // Muscular shoulder hump & spine ridge
        const spine = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.42, 2.7), furMat);
        spine.position.y = 0.65;
        chest.add(spine);

        // Layered fluffy wolf mane & neck ruff
        const maneGroup = new THREE.Group();
        maneGroup.position.set(0, 0.65, 1.25);
        bodyGroup.add(maneGroup);

        const maneCore = new THREE.Mesh(new THREE.ConeGeometry(1.25, 2.1, 8), furMat);
        maneCore.rotation.x = -Math.PI / 2.8;
        maneGroup.add(maneCore);

        // Flared fur tufts around collar
        for (let t = 0; t < 6; t++) {
            const angle = (t / 6) * Math.PI * 2;
            const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.85, 4), underbellyMat);
            tuft.position.set(Math.cos(angle) * 0.95, Math.sin(angle) * 0.75, -0.2);
            tuft.rotation.z = angle - Math.PI / 2;
            maneGroup.add(tuft);
        }

        // 2. Sculpted Wolf Head
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.15, 2.3);
        bodyGroup.add(headGroup);

        // Cranium block
        const cranium = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.75, 0.95), furMat);
        cranium.position.set(0, 0.12, 0);
        cranium.castShadow = true;
        headGroup.add(cranium);

        // Snout & Upper Jaw
        const snout = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.42, 1.05), underbellyMat);
        snout.position.set(0, -0.12, 0.85);
        headGroup.add(snout);

        // Black Nose
        const nose = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.22), hornMat);
        nose.position.set(0, 0.04, 1.4);
        headGroup.add(nose);

        // Lower Jaw (open slightly to hold sword)
        const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.22, 0.95), underbellyMat);
        jaw.position.set(0, -0.38, 0.82);
        jaw.rotation.x = 0.15;
        headGroup.add(jaw);

        // Sharp fangs gripping
        const fangL1 = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.24, 4), underbellyMat);
        fangL1.position.set(-0.2, -0.2, 0.92);
        fangL1.rotation.x = Math.PI;
        headGroup.add(fangL1);
        const fangR1 = fangL1.clone();
        fangR1.position.x = 0.2;
        headGroup.add(fangR1);

        // Pointed Wolf Ears with inner fur
        for (let side = -1; side <= 1; side += 2) {
            const ear = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.75, 4), furMat);
            ear.position.set(side * 0.38, 0.65, -0.05);
            ear.rotation.set(-0.15, 0, side * 0.28);
            headGroup.add(ear);

            const earInner = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.55, 4), underbellyMat);
            earInner.position.set(side * 0.38, 0.62, 0.05);
            earInner.rotation.set(-0.15, 0, side * 0.28);
            headGroup.add(earInner);
        }

        // Glowing Blue Noble Eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x66bbff });
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeMat);
        eyeL.position.set(-0.28, 0.18, 0.55);
        headGroup.add(eyeL);
        const eyeR = eyeL.clone();
        eyeR.position.x = 0.28;
        headGroup.add(eyeR);

        // 3. Artorias's Greatsword held in Jaws!
        const swordGroup = new THREE.Group();
        swordGroup.position.set(0, -0.25, 1.05); // Held in mouth
        headGroup.add(swordGroup);

        // Sword Hilt gripped in teeth
        const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 8), steelMat);
        hilt.rotation.z = Math.PI / 2;
        swordGroup.add(hilt);

        // Pommel
        const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), goldMat);
        pommel.position.set(0.85, 0, 0);
        swordGroup.add(pommel);

        // Wolf Head Crossguard
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.42, 1.1), goldMat);
        guard.position.set(-0.48, 0, 0);
        swordGroup.add(guard);

        // Colossal Shining Silver-Blue Blade
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 5.2), bladeMat);
        blade.position.set(-0.48, 0, 2.8);
        blade.castShadow = true;
        swordGroup.add(blade);

        // Etched fuller along blade
        const fuller = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 4.6), steelMat);
        fuller.position.set(-0.48, 0, 2.7);
        swordGroup.add(fuller);

        // Glowing Abyss Blue Aura Light
        const swordGlow = new THREE.PointLight(0x3399ff, 2.5, 10);
        swordGlow.position.set(-0.48, 0, 3.0);
        swordGroup.add(swordGlow);

        // 4. Bushy Silver Tail with multiple tufts
        const tailGroup = new THREE.Group();
        tailGroup.position.set(0, 0.35, -1.4);
        bodyGroup.add(tailGroup);

        let prevTail = tailGroup;
        for (let t = 0; t < 5; t++) {
            const seg = new THREE.Group();
            seg.position.set(0, -0.18 - t * 0.05, -0.45);
            seg.rotation.x = -0.25 - t * 0.06;
            prevTail.add(seg);

            const rSeg = 0.24 + Math.sin((t / 4) * Math.PI) * 0.18;
            const tMesh = new THREE.Mesh(new THREE.CylinderGeometry(rSeg * 0.8, rSeg, 0.55, 6), furMat);
            tMesh.rotation.x = Math.PI / 3;
            seg.add(tMesh);

            prevTail = seg;
        }

        // 5. Four Muscular Canine Legs
        const buildCanineLeg = (isFront, isRight) => {
            const leg = new THREE.Group();
            const side = isRight ? 1 : -1;
            const zPos = isFront ? 0.95 : -1.05;
            leg.position.set(side * 0.85, -0.2, zPos);

            // Upper thigh / shoulder blade
            const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.95, 6), furMat);
            upper.position.set(0, -0.42, 0);
            leg.add(upper);

            // Knee / Hock joint
            const joint = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), furMat);
            joint.position.set(0, -0.9, isFront ? 0.05 : -0.1);
            leg.add(joint);

            // Lower shin
            const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.95, 6), furMat);
            lower.position.set(0, -1.35, isFront ? -0.05 : 0.08);
            leg.add(lower);

            // Paw
            const paw = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.24, 0.52), underbellyMat);
            paw.position.set(0, -1.82, isFront ? 0.08 : 0.18);
            leg.add(paw);

            // Claws
            for (let c = 0; c < 3; c++) {
                const claw = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.22, 4), hornMat);
                claw.position.set((c - 1) * 0.12, -1.86, isFront ? 0.36 : 0.46);
                claw.rotation.x = 1.1;
                leg.add(claw);
            }

            return leg;
        };

        const frontLeft = buildCanineLeg(true, false);
        bodyGroup.add(frontLeft);

        const frontRight = buildCanineLeg(true, true);
        bodyGroup.add(frontRight);

        const rearLeft = buildCanineLeg(false, false);
        bodyGroup.add(rearLeft);

        const rearRight = buildCanineLeg(false, true);
        bodyGroup.add(rearRight);

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

        const robeMat = this.gwynRobeMat;
        const crownMat = this.gwynCrownMat;
        const hairMat = this.gwynHairMat;
        const skinMat = this.hollowSkinMat;
        const swordMat = this.sunlightGreatswordMat;
        const steelMat = this.darkSteelMat;

        // 1. Tall Regal Warrior Torso & Charred Robes
        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // Core chest mass
        const chestGeo = new THREE.CylinderGeometry(0.65, 0.52, 1.25, 8);
        const chestMesh = new THREE.Mesh(chestGeo, robeMat);
        chestMesh.scale.set(1.15, 1.0, 0.85);
        chestMesh.castShadow = true;
        torso.add(chestMesh);

        // Burned golden chainmail underneath tattered tunic
        const mailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.5, 0.65, 8), crownMat);
        mailMesh.position.set(0, 0.2, 0.12);
        torso.add(mailMesh);

        // Royal Sunburst Pectoral Medallion & Brooch
        const medallion = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.12, 12), crownMat);
        medallion.rotation.x = Math.PI / 2;
        medallion.position.set(0, 0.35, 0.45);
        torso.add(medallion);

        // Radiant sunlight rays radiating from brooch
        for (let r = 0; r < 8; r++) {
            const angle = (r / 8) * Math.PI * 2;
            const ray = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.35, 4), crownMat);
            ray.position.set(Math.cos(angle) * 0.42, 0.35 + Math.sin(angle) * 0.42, 0.46);
            ray.rotation.z = angle - Math.PI / 2;
            torso.add(ray);
        }

        // Tattered Flowing Robe Skirt (Billowing charred cloth)
        const skirtGroup = new THREE.Group();
        skirtGroup.position.y = -0.75;
        torso.add(skirtGroup);

        const robeSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.98, 1.45, 10), robeMat);
        robeSkirt.position.y = -0.55;
        skirtGroup.add(robeSkirt);

        // Charred ragged fringe at bottom of robes
        for (let f = 0; f < 8; f++) {
            const angle = (f / 8) * Math.PI * 2;
            const flap = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.45, 0.08), steelMat);
            flap.position.set(Math.cos(angle) * 0.95, -1.25, Math.sin(angle) * 0.95);
            flap.rotation.y = angle;
            skirtGroup.add(flap);
        }

        // 2. Lord Gwyn's Regal Head with Golden Sun Crown
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.88, 0.05);
        torso.add(headGroup);

        // Hollow Ash Monarch Cranium
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.68, 0.65), skinMat);
        head.castShadow = true;
        headGroup.add(head);

        // Weathered gaunt brow & hollow cheeks
        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.16, 0.22), skinMat);
        brow.position.set(0, 0.18, 0.32);
        headGroup.add(brow);

        // Flowing White-Grey Braided/Split Beard
        const beardCenter = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.25, 5), hairMat);
        beardCenter.position.set(0, -0.65, 0.38);
        beardCenter.rotation.x = Math.PI / 8;
        headGroup.add(beardCenter);

        const beardL = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.05, 5), hairMat);
        beardL.position.set(-0.22, -0.55, 0.32);
        beardL.rotation.set(Math.PI / 8, 0, 0.15);
        headGroup.add(beardL);

        const beardR = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.05, 5), hairMat);
        beardR.position.set(0.22, -0.55, 0.32);
        beardR.rotation.set(Math.PI / 8, 0, -0.15);
        headGroup.add(beardR);

        // Flowing White Hair down neck and shoulders
        const hairBack = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.58, 1.1, 8), hairMat);
        hairBack.position.set(0, -0.22, -0.32);
        headGroup.add(hairBack);

        // Spiked Golden Crown of Sunlight
        const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.22, 14), crownMat);
        crownBase.position.y = 0.42;
        headGroup.add(crownBase);

        // Crown filigree rim
        const crownRim = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.05, 6, 16), crownMat);
        crownRim.position.y = 0.42;
        crownRim.rotation.x = Math.PI / 2;
        headGroup.add(crownRim);

        // 7 Tall Sunlight Spikes around Crown with gem inlays
        for (let i = 0; i < 7; i++) {
            const angle = (i / 7) * Math.PI * 2;
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.75, 4), crownMat);
            spike.position.set(Math.sin(angle) * 0.42, 0.78, Math.cos(angle) * 0.42);
            spike.rotation.y = angle;
            headGroup.add(spike);

            // Gem inlay
            const gem = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff8800 }));
            gem.position.set(Math.sin(angle) * 0.46, 0.42, Math.cos(angle) * 0.46);
            headGroup.add(gem);
        }

        // Hollow Ash Eyes with burning cinder embers
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff8822 });
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
        eyeL.position.set(-0.16, 0.08, 0.32);
        headGroup.add(eyeL);
        const eyeR = eyeL.clone();
        eyeR.position.x = 0.16;
        headGroup.add(eyeR);

        // 3. Right Arm with Flaming Sunlight Greatsword
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.85, 0.45, 0);
        torso.add(rightShoulder);

        // Gilded royal pauldron
        const pauldronR = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), crownMat);
        pauldronR.scale.set(1.1, 0.9, 1.1);
        rightShoulder.add(pauldronR);

        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.85, 6), robeMat);
        rArm.position.y = -0.45;
        rightShoulder.add(rArm);

        const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.85, 6), crownMat);
        rForearm.position.y = -1.15;
        rightShoulder.add(rForearm);

        const rHand = new THREE.Group();
        rHand.position.y = -1.65;
        rightShoulder.add(rHand);

        // Greatsword of Gwyn (Flaming Sunlight Greatsword)
        const swordGroup = new THREE.Group();
        // Pommel
        const swordPommel = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), crownMat);
        swordPommel.position.y = -0.45;
        swordGroup.add(swordPommel);

        // Two-handed hilt wrapped in charred wire
        const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.07, 1.25, 8), steelMat);
        hilt.position.y = 0.25;
        swordGroup.add(hilt);

        // Majestic sweeping golden crossguard
        const guard = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 0.28), crownMat);
        guard.position.y = 0.9;
        swordGroup.add(guard);

        // Swept quillon terminals
        for (let q = -1; q <= 1; q += 2) {
            const quillon = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.45, 4), crownMat);
            quillon.position.set(q * 0.65, 1.05, 0);
            quillon.rotation.z = -q * 0.65;
            swordGroup.add(quillon);
        }

        // Flaming Sunlight Blade (Broad two-handed greatsword with fuller and incandescence)
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.32, 4.2, 0.1), swordMat);
        blade.position.y = 3.0;
        blade.castShadow = true;
        swordGroup.add(blade);

        // Inner incandescent core
        const coreBlade = new THREE.Mesh(new THREE.BoxGeometry(0.14, 4.0, 0.12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        coreBlade.position.y = 3.0;
        swordGroup.add(coreBlade);

        // Piercing diamond blade tip
        const swordTip = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.85, 4), swordMat);
        swordTip.position.y = 5.35;
        swordTip.castShadow = true;
        swordGroup.add(swordTip);

        // Dynamic Radiant Fire Light
        const weaponFlame = new THREE.PointLight(0xff7700, 4.0, 16);
        weaponFlame.position.set(0, 3.2, 0);
        swordGroup.add(weaponFlame);

        swordGroup.rotation.x = Math.PI / 3.6;
        rHand.add(swordGroup);

        // 4. Left Arm (Gwyn Grab / Thrust Arm)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.85, 0.45, 0);
        torso.add(leftShoulder);

        const pauldronL = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), crownMat);
        pauldronL.scale.set(1.1, 0.9, 1.1);
        leftShoulder.add(pauldronL);

        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.85, 6), robeMat);
        lArm.position.y = -0.45;
        leftShoulder.add(lArm);

        // Gilded vambrace with sunlight crest
        const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.85, 6), crownMat);
        lForearm.position.y = -1.15;
        leftShoulder.add(lForearm);

        const lHand = new THREE.Group();
        lHand.position.y = -1.65;
        leftShoulder.add(lHand);

        const lHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.32), skinMat);
        lHand.add(lHandMesh);

        // 5. Plate Greaves under Robes
        const rightHip = new THREE.Group();
        rightHip.position.set(0.38, -0.9, 0);
        torso.add(rightHip);

        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 1.3, 6), crownMat);
        rLeg.position.y = -0.65;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.38, -0.9, 0);
        torso.add(leftHip);

        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 1.3, 6), crownMat);
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

        const fleshMat = this.asylumFleshMat;
        const hornMat = this.demonHornMat;
        const hammerMat = this.asylumHammerMat || this.stoneClubMat;
        const ironMat = this.darkSteelMat || this.demonHornMat;

        // 1. GROTESQUE BULBOUS DEMONIC TORSO
        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // Saggy Upper Chest & Back Hump
        const upperChestGeo = new THREE.CylinderGeometry(1.25, 1.5, 1.6, 12);
        upperChestGeo.scale(1.25, 1.0, 1.1);
        const upperChest = new THREE.Mesh(upperChestGeo, fleshMat);
        upperChest.position.set(0, 0.5, 0);
        upperChest.castShadow = true;
        torso.add(upperChest);

        // Sagging Pectoral Flesh Folds
        for (let side = -1; side <= 1; side += 2) {
            const pecGeo = new THREE.SphereGeometry(0.65, 8, 8);
            pecGeo.scale(1.1, 0.7, 0.85);
            const pec = new THREE.Mesh(pecGeo, fleshMat);
            pec.position.set(side * 0.55, 0.5, 0.65);
            pec.rotation.set(0.15, 0, side * -0.15);
            torso.add(pec);
        }

        // Colossal Potbelly with Visceral Hanging Fat Folds
        const bellyGeo = new THREE.SphereGeometry(1.35, 14, 12);
        bellyGeo.scale(1.2, 0.95, 1.45);
        const belly = new THREE.Mesh(bellyGeo, fleshMat);
        belly.position.set(0, -0.35, 0.62);
        belly.castShadow = true;
        torso.add(belly);

        // Navel depression
        const navelGeo = new THREE.CylinderGeometry(0.12, 0.05, 0.2, 6);
        const navel = new THREE.Mesh(navelGeo, hornMat);
        navel.rotation.x = Math.PI / 2;
        navel.position.set(0, -0.38, 1.4);
        torso.add(navel);

        // Double Row of Serrated Demonic Spines along Back
        for (let r = 0; r < 6; r++) {
            for (let side = -1; side <= 1; side += 2) {
                const sGeo = new THREE.ConeGeometry(0.14, 0.55, 5);
                const sp = new THREE.Mesh(sGeo, hornMat);
                sp.position.set(side * 0.28, 0.8 - r * 0.25, -0.85);
                sp.rotation.set(-Math.PI / 2 - 0.2, side * 0.15, 0);
                torso.add(sp);
            }
        }

        // Heavy Barbed Tail
        const tailGroup = new THREE.Group();
        tailGroup.position.set(0, -0.9, -0.7);
        torso.add(tailGroup);
        let currTail = tailGroup;
        for (let t = 0; t < 6; t++) {
            const tSeg = new THREE.Mesh(new THREE.CylinderGeometry(0.25 - t * 0.03, 0.3 - t * 0.03, 0.42, 8), fleshMat);
            tSeg.position.set(0, -0.18, -0.15);
            tSeg.rotation.x = -0.3;
            currTail.add(tSeg);
            currTail = tSeg;
        }
        const tailSpade = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.6, 4), hornMat);
        tailSpade.position.set(0, -0.28, 0);
        tailSpade.rotation.x = Math.PI;
        currTail.add(tailSpade);

        // 2. DEMON HEAD WITH CURVED HORNS
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.45, 0.45);
        torso.add(headGroup);

        const skullGeo = new THREE.SphereGeometry(0.85, 10, 10);
        skullGeo.scale(1.15, 1.0, 1.1);
        const skull = new THREE.Mesh(skullGeo, fleshMat);
        skull.castShadow = true;
        headGroup.add(skull);

        // Wide Grimacing Predator Maw
        const jawGeo = new THREE.BoxGeometry(0.85, 0.35, 0.7);
        const jaw = new THREE.Mesh(jawGeo, fleshMat);
        jaw.position.set(0, -0.35, 0.35);
        headGroup.add(jaw);

        // Staggered Needle Teeth
        for (let t = -3; t <= 3; t++) {
            const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.18, 4), hornMat);
            tooth.position.set(t * 0.11, -0.2, 0.65);
            tooth.rotation.x = Math.PI;
            headGroup.add(tooth);
        }

        // Burning Demon Eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });
        for (let side = -1; side <= 1; side += 2) {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), eyeMat);
            eye.position.set(side * 0.38, 0.15, 0.7);
            headGroup.add(eye);
        }

        // Swept-Back Horns with Ridged Curve
        for (let side = -1; side <= 1; side += 2) {
            const hBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.7, 7), hornMat);
            hBase.position.set(side * 0.65, 0.45, -0.1);
            hBase.rotation.set(-0.35, 0, side * 0.7);
            headGroup.add(hBase);

            const hTip = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.9, 7), hornMat);
            hTip.position.set(side * 1.1, 0.85, -0.45);
            hTip.rotation.set(-0.95, side * 0.2, side * 0.5);
            headGroup.add(hTip);
        }

        // 3. ARTICULATED BAT WINGS (Left & Right)
        const leftWingGroup = new THREE.Group();
        leftWingGroup.position.set(-1.1, 0.75, -0.65);
        torso.add(leftWingGroup);

        const rightWingGroup = new THREE.Group();
        rightWingGroup.position.set(1.1, 0.75, -0.65);
        torso.add(rightWingGroup);

        const wingMat = this.wingMembraneMat || new THREE.MeshStandardMaterial({
            color: 0x221a18,
            roughness: 0.92,
            side: THREE.DoubleSide
        });

        for (let side = -1; side <= 1; side += 2) {
            const wGroup = (side === -1) ? leftWingGroup : rightWingGroup;
            
            // Primary wing bone
            const bone1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.8, 6), hornMat);
            bone1.position.set(side * 0.7, 0.65, 0);
            bone1.rotation.z = side * -0.85;
            wGroup.add(bone1);

            // Secondary strut
            const bone2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.6, 6), hornMat);
            bone2.position.set(side * 1.5, 0.2, -0.1);
            bone2.rotation.z = side * -0.3;
            wGroup.add(bone2);

            // Webbing membrane
            const membrane = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.9), wingMat);
            membrane.position.set(side * 0.9, 0.25, -0.05);
            membrane.rotation.y = side * 0.25;
            wGroup.add(membrane);
        }

        // 4. RIGHT ARM & DEMON'S GREAT HAMMER (Colossal Stone Ruins Mallet)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.65, 0.75, 0);
        torso.add(rightShoulder);

        const rBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.42, 1.3, 8), fleshMat);
        rBicep.position.y = -0.65;
        rBicep.castShadow = true;
        rightShoulder.add(rBicep);

        const weaponGroup = new THREE.Group();
        weaponGroup.position.y = -1.45;
        rightShoulder.add(weaponGroup);

        // Petrified Oak Trunk Haft
        const clubShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 4.4, 8), hammerMat);
        clubShaft.position.y = 0.8;
        clubShaft.castShadow = true;
        weaponGroup.add(clubShaft);

        // Carved Stone Column Capital (Head)
        const colHeadGeo = new THREE.BoxGeometry(1.5, 1.9, 1.5);
        const colHead = new THREE.Mesh(colHeadGeo, hammerMat);
        colHead.position.y = 2.4;
        colHead.castShadow = true;
        weaponGroup.add(colHead);

        // Iron Binding Straps and Studs
        for (let st = 1.6; st <= 3.1; st += 0.7) {
            const strap = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 1.6), ironMat);
            strap.position.y = st;
            weaponGroup.add(strap);
        }

        // Hanging Iron Chains with Rings
        for (let side = -1; side <= 1; side += 2) {
            const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 5), ironMat);
            chain.position.set(side * 0.7, 1.4, 0);
            weaponGroup.add(chain);
        }

        weaponGroup.rotation.x = Math.PI / 3;

        // 5. LEFT ARM
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-1.65, 0.75, 0);
        torso.add(leftShoulder);

        const lBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.42, 1.3, 8), fleshMat);
        lBicep.position.y = -0.65;
        lBicep.castShadow = true;
        leftShoulder.add(lBicep);

        const lHand = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.5), fleshMat);
        lHand.position.y = -1.45;
        leftShoulder.add(lHand);

        // 6. THICK DEMONIC LEGS & CLAWS
        const rightHip = new THREE.Group();
        rightHip.position.set(0.75, -1.0, 0);
        torso.add(rightHip);

        const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.44, 1.45, 8), fleshMat);
        rThigh.position.y = -0.7;
        rThigh.castShadow = true;
        rightHip.add(rThigh);

        const rFoot = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.35, 0.85), fleshMat);
        rFoot.position.set(0, -1.5, 0.2);
        rightHip.add(rFoot);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.75, -1.0, 0);
        torso.add(leftHip);

        const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.44, 1.45, 8), fleshMat);
        lThigh.position.y = -0.7;
        lThigh.castShadow = true;
        leftHip.add(lThigh);

        const lFoot = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.35, 0.85), fleshMat);
        lFoot.position.set(0, -1.5, 0.2);
        leftHip.add(lFoot);

        root.position.set(x, 0, z);
        root.userData = {
            bodyGroup,
            torso,
            headGroup,
            rightShoulder,
            leftShoulder,
            rightHip,
            leftHip,
            leftWingGroup,
            rightWingGroup,
            weaponGroup
        };

        this.scene.add(root);
        return root;
    }

    // 2. GAPING DRAGON (The Depths)
    createGapingDragon(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.8;
        root.add(bodyGroup);

        const fleshMat = this.gapingFleshMat;
        const toothMat = this.gapingToothMat;
        const hornMat = this.demonHornMat;
        const membraneMat = this.wingMembraneMat;

        // 1. Vast Elongated Reptilian Torso with Open Ribcage Maw
        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // Core under-body mass
        const underTorso = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.45, 4.4, 8), fleshMat);
        underTorso.rotation.x = Math.PI / 2;
        underTorso.scale.set(1.15, 0.75, 1.0);
        underTorso.castShadow = true;
        torso.add(underTorso);

        // Cavernous inner maw gullet
        const mawCavity = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.95, 3.8), new THREE.MeshBasicMaterial({ color: 0x140404 }));
        mawCavity.position.set(0, 0.45, 0.1);
        torso.add(mawCavity);

        // Toxic sewer bile pool inside gullet
        const bileGlow = new THREE.PointLight(0x44aa22, 1.8, 8);
        bileGlow.position.set(0, 0.4, 0.2);
        torso.add(bileGlow);

        // 14 Arching Rib Struts along flanks with double rows of needle teeth
        for (let r = 0; r < 7; r++) {
            const zPos = -1.45 + r * 0.48;
            const ribHeight = 1.1 + Math.sin((r / 6) * Math.PI) * 0.55;

            // Left rib arch
            const ribL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, ribHeight, 6), fleshMat);
            ribL.position.set(-1.05, 0.55 + ribHeight * 0.4, zPos);
            ribL.rotation.z = -0.45;
            torso.add(ribL);

            // Left needle teeth (outer & inner)
            const toothL1 = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.72, 4), toothMat);
            toothL1.position.set(-1.18, 0.85 + ribHeight * 0.4, zPos);
            toothL1.rotation.z = -0.65;
            torso.add(toothL1);

            const toothL2 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.52, 4), toothMat);
            toothL2.position.set(-0.95, 0.75 + ribHeight * 0.35, zPos + 0.08);
            toothL2.rotation.z = -0.35;
            torso.add(toothL2);

            // Right rib arch
            const ribR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, ribHeight, 6), fleshMat);
            ribR.position.set(1.05, 0.55 + ribHeight * 0.4, zPos);
            ribR.rotation.z = 0.45;
            torso.add(ribR);

            // Right needle teeth
            const toothR1 = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.72, 4), toothMat);
            toothR1.position.set(1.18, 0.85 + ribHeight * 0.4, zPos);
            toothR1.rotation.z = 0.65;
            torso.add(toothR1);

            const toothR2 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.52, 4), toothMat);
            toothR2.position.set(0.95, 0.75 + ribHeight * 0.35, zPos + 0.08);
            toothR2.rotation.z = 0.35;
            torso.add(toothR2);
        }

        // Sewer pustules & diseased warts along flanks
        for (let p = 0; p < 8; p++) {
            const side = p % 2 === 0 ? 1 : -1;
            const pZ = -1.2 + Math.floor(p / 2) * 0.75;
            const pustule = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), new THREE.MeshStandardMaterial({ color: 0x4a5a2a, roughness: 0.9 }));
            pustule.position.set(side * 1.35, 0.1, pZ);
            torso.add(pustule);
        }

        // 4 Vestigial Ripped Dragon Wings along upper back
        for (let w = 0; w < 4; w++) {
            const side = w % 2 === 0 ? 1 : -1;
            const wRow = Math.floor(w / 2); // 0 or 1
            const wingGroup = new THREE.Group();
            wingGroup.position.set(side * 1.25, 0.85, -0.6 + wRow * 1.1);
            torso.add(wingGroup);

            const bone1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.2, 5), fleshMat);
            bone1.position.set(side * 0.55, 0.45, 0);
            bone1.rotation.z = side * 0.65;
            wingGroup.add(bone1);

            const web = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.1), membraneMat);
            web.position.set(side * 0.75, 0.35, 0);
            web.rotation.y = side * 0.25;
            web.material.side = THREE.DoubleSide;
            wingGroup.add(web);
        }

        // 2. Tiny Grotesque Vestigial Dragon Head
        const headGroup = new THREE.Group();
        headGroup.position.set(0, -0.25, 2.45);
        torso.add(headGroup);

        // Slender scaly neck hanging under front ribs
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.35, 0.85, 6), fleshMat);
        neck.rotation.x = Math.PI / 3;
        headGroup.add(neck);

        // Tiny cranium
        const tinyHead = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.95, 6), fleshMat);
        tinyHead.rotation.x = -Math.PI / 2;
        tinyHead.position.set(0, -0.22, 0.45);
        headGroup.add(tinyHead);

        // Tiny fangs
        for (let f = 0; f < 4; f++) {
            const tFang = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.16, 4), toothMat);
            tFang.position.set((f - 1.5) * 0.08, -0.32, 0.72);
            tFang.rotation.x = Math.PI;
            headGroup.add(tFang);
        }

        // 3. Four Massive Splayed Crawling Legs
        const buildReptilianLeg = (isFront, isRight) => {
            const leg = new THREE.Group();
            const side = isRight ? 1 : -1;
            const zPos = isFront ? 1.25 : -1.35;
            leg.position.set(side * 1.45, -0.55, zPos);

            // Upper scaly thigh splayed outward
            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 1.25, 6), fleshMat);
            thigh.position.set(side * 0.45, -0.35, 0);
            thigh.rotation.z = side * -0.55;
            leg.add(thigh);

            // Heavy knee spur
            const knee = new THREE.Mesh(new THREE.SphereGeometry(0.32, 6, 6), fleshMat);
            knee.position.set(side * 0.85, -0.65, 0);
            leg.add(knee);

            const kSpur = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.45, 4), hornMat);
            kSpur.position.set(side * 1.05, -0.55, 0);
            kSpur.rotation.z = side * -0.85;
            leg.add(kSpur);

            // Lower shin
            const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 1.15, 6), fleshMat);
            shin.position.set(side * 0.85, -1.25, 0);
            leg.add(shin);

            // 4 splayed ground claws
            for (let c = 0; c < 4; c++) {
                const claw = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.48, 4), hornMat);
                claw.position.set(side * 0.85 + (c - 1.5) * 0.16, -1.75, 0.28);
                claw.rotation.x = 1.0;
                leg.add(claw);
            }

            return leg;
        };

        const rightHip = buildReptilianLeg(true, true);
        torso.add(rightHip);

        const leftHip = buildReptilianLeg(true, false);
        torso.add(leftHip);

        const rearRightHip = buildReptilianLeg(false, true);
        torso.add(rearRightHip);

        const rearLeftHip = buildReptilianLeg(false, false);
        torso.add(rearLeftHip);

        // 4. Heavy Segmented Spiked Tail
        const tailGroup = new THREE.Group();
        tailGroup.position.set(0, 0, -2.1);
        torso.add(tailGroup);

        let prevTail = tailGroup;
        for (let t = 0; t < 6; t++) {
            const tSeg = new THREE.Group();
            tSeg.position.set(0, -0.15, -0.55);
            tSeg.rotation.x = -0.12 - t * 0.05;
            prevTail.add(tSeg);

            const rSeg = 0.55 - t * 0.075;
            const tMesh = new THREE.Mesh(new THREE.CylinderGeometry(rSeg * 0.82, rSeg, 0.65, 6), fleshMat);
            tMesh.rotation.x = Math.PI / 2.2;
            tSeg.add(tMesh);

            // Scythe dorsal spine on tail
            const spine = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.65, 4), toothMat);
            spine.position.set(0, 0.38, -0.15);
            spine.rotation.x = -Math.PI / 3;
            tSeg.add(spine);

            prevTail = tSeg;
        }

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

        const chitinMat = this.quelaagChitinMat;
        const fireMat = this.quelaagFireMat;
        const humanMat = this.quelaagHumanMat;
        const swordMat = this.sunlightGreatswordMat;
        const hairMat = this.capraSkinMat;
        const hornMat = this.demonHornMat;

        // 1. Lower Monstrous Chaos Spider Cephalothorax & Abdomen
        const spiderAbdomen = new THREE.Group();
        bodyGroup.add(spiderAbdomen);

        // Cephalothorax (front spider thorax)
        const cephMesh = new THREE.Mesh(new THREE.SphereGeometry(1.25, 10, 8), chitinMat);
        cephMesh.scale.set(1.15, 0.75, 1.15);
        cephMesh.position.set(0, 0, 0.45);
        cephMesh.castShadow = true;
        spiderAbdomen.add(cephMesh);

        // Huge rear abdomen bulb
        const rearBulb = new THREE.Mesh(new THREE.SphereGeometry(1.75, 12, 10), chitinMat);
        rearBulb.scale.set(1.15, 0.85, 1.65);
        rearBulb.position.set(0, 0.15, -0.95);
        rearBulb.castShadow = true;
        spiderAbdomen.add(rearBulb);

        // Dorsal volcanic carapace ridges on abdomen
        for (let c = 0; c < 4; c++) {
            const ridge = new THREE.Mesh(new THREE.BoxGeometry(1.2 - c * 0.18, 0.22, 0.45), chitinMat);
            ridge.position.set(0, 0.95 - c * 0.1, -0.4 - c * 0.55);
            spiderAbdomen.add(ridge);
        }

        // Glowing molten lava underbelly / fire sac
        const lavaSac = new THREE.Mesh(new THREE.SphereGeometry(1.35, 10, 8), fireMat);
        lavaSac.position.set(0, -0.35, -0.65);
        lavaSac.scale.set(1.0, 0.7, 1.4);
        spiderAbdomen.add(lavaSac);

        const lavaLight = new THREE.PointLight(0xff4400, 3.5, 14);
        lavaLight.position.set(0, -0.2, -0.5);
        spiderAbdomen.add(lavaLight);

        // 2. Eight Articulated Spider Legs (4 per side)
        const legGroups = [];
        for (let i = 0; i < 8; i++) {
            const side = i % 2 === 0 ? 1 : -1;
            const row = Math.floor(i / 2); // 0, 1, 2, 3
            const zOff = 0.85 - row * 0.85;

            const legHip = new THREE.Group();
            legHip.position.set(side * 1.25, -0.1, zOff);
            spiderAbdomen.add(legHip);

            // Coxa base
            const coxa = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.55, 6), chitinMat);
            coxa.rotation.z = side * -0.65;
            coxa.position.set(side * 0.25, 0.1, 0);
            legHip.add(coxa);

            // High arching femur
            const femur = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 2.1, 6), chitinMat);
            femur.position.set(side * 1.05, 0.75, 0);
            femur.rotation.z = side * -0.95;
            femur.castShadow = true;
            legHip.add(femur);

            // Spiked patella / knee joint
            const kneeSpike = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.45, 4), hornMat);
            kneeSpike.position.set(side * 1.85, 1.55, 0);
            kneeSpike.rotation.z = side * -0.45;
            legHip.add(kneeSpike);

            // Long plunging tibia
            const tibia = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 2.4, 6), chitinMat);
            tibia.position.set(side * 2.35, 0.45, 0);
            tibia.rotation.z = side * 0.38;
            tibia.castShadow = true;
            legHip.add(tibia);

            // Needle-sharp tarsus claw tip
            const tarsus = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.85, 4), hornMat);
            tarsus.position.set(side * 2.95, -0.65, 0);
            tarsus.rotation.z = side * 0.45;
            legHip.add(tarsus);

            legGroups.push(legHip);
        }

        // 3. Upper Pale Human Maiden Torso
        const humanGroup = new THREE.Group();
        humanGroup.position.set(0, 0.65, 0.85);
        spiderAbdomen.add(humanGroup);

        const humanTorso = new THREE.Group();
        humanGroup.add(humanTorso);

        // Core maiden torso
        const chestMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 1.25, 10), humanMat);
        chestMesh.scale.set(1.12, 1.0, 0.85);
        chestMesh.castShadow = true;
        humanTorso.add(chestMesh);

        // Slender waist & hips rising from chitin
        const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 0.55, 10), humanMat);
        waist.position.y = -0.65;
        humanTorso.add(waist);

        // Sculpted collarbones & delicate chest
        const bustL = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), humanMat);
        bustL.position.set(-0.16, 0.18, 0.24);
        humanTorso.add(bustL);
        const bustR = bustL.clone();
        bustR.position.x = 0.16;
        humanTorso.add(bustR);

        // 4. Head, Face & Cascading Voluminous Raven Hair
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.82, 0);
        humanTorso.add(headGroup);

        // Alabaster maiden face
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), humanMat);
        head.scale.set(0.9, 1.05, 0.95);
        head.castShadow = true;
        headGroup.add(head);

        // Cascading torrent of dark hair
        const hairBack = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.65, 1.8, 8), hairMat);
        hairBack.position.set(0, -0.45, -0.16);
        hairBack.castShadow = true;
        headGroup.add(hairBack);

        const hairL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.26, 1.4, 6), hairMat);
        hairL.position.set(-0.25, -0.35, 0.1);
        headGroup.add(hairL);

        const hairR = hairL.clone();
        hairR.position.x = 0.25;
        headGroup.add(hairR);

        // 5. Right Arm wielding Flaming Quelaag Furysword
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.55, 0.42, 0);
        humanTorso.add(rightShoulder);

        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.85, 6), humanMat);
        rArm.position.y = -0.42;
        rightShoulder.add(rArm);

        // Gold armlet
        const rArmlet = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.025, 6, 12), this.goldTrimMat);
        rArmlet.position.y = -0.22;
        rArmlet.rotation.x = Math.PI / 2;
        rightShoulder.add(rArmlet);

        const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.85, 6), humanMat);
        rForearm.position.y = -1.05;
        rightShoulder.add(rForearm);

        const weaponGroup = new THREE.Group();
        weaponGroup.position.y = -1.45;
        rightShoulder.add(weaponGroup);

        // Quelaag's Furysword (Curved Chaos Scimitar)
        // Demonic eye pommel & gold hilt
        const swordPommel = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), this.goldTrimMat);
        swordPommel.position.y = -0.35;
        weaponGroup.add(swordPommel);

        const swordGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.65, 8), this.darkSteelMat);
        swordGrip.position.y = 0;
        weaponGroup.add(swordGrip);

        const swordGuard = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 0.16), this.goldTrimMat);
        swordGuard.position.y = 0.35;
        weaponGroup.add(swordGuard);

        // Curved serrated chaos scimitar blade
        const swordBlade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.42), swordMat);
        swordBlade.position.set(0, 1.45, 0.35);
        swordBlade.rotation.x = 0.38;
        swordBlade.castShadow = true;
        weaponGroup.add(swordBlade);

        // Core incandescent flame strip
        const coreFlame = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.2, 0.15), new THREE.MeshBasicMaterial({ color: 0xffdd44 }));
        coreFlame.position.set(0, 1.45, 0.38);
        coreFlame.rotation.x = 0.38;
        weaponGroup.add(coreFlame);

        const swordFlame = new THREE.PointLight(0xff5500, 3.2, 12);
        swordFlame.position.set(0, 1.6, 0.45);
        weaponGroup.add(swordFlame);

        // 6. Left Arm
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.55, 0.42, 0);
        humanTorso.add(leftShoulder);

        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.85, 6), humanMat);
        lArm.position.y = -0.42;
        leftShoulder.add(lArm);

        const lArmlet = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.025, 6, 12), this.goldTrimMat);
        lArmlet.position.y = -0.22;
        lArmlet.rotation.x = Math.PI / 2;
        leftShoulder.add(lArmlet);

        const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.85, 6), humanMat);
        lForearm.position.y = -1.05;
        leftShoulder.add(lForearm);

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
    // 5. IRON GOLEM (Sen's Fortress)
    createIronGolem(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.8;
        root.add(bodyGroup);

        const golemMat = this.ironGolemMat;
        const coreMat = this.ironGolemCoreMat;
        const steelMat = this.steelMat;
        const darkSteelMat = this.darkSteelMat;

        // 1. Towering Iron-Plated Automaton Torso
        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // Core iron block
        const torsoMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 0.95, 2.6, 8), golemMat);
        torsoMesh.scale.set(1.25, 1.0, 0.9);
        torsoMesh.castShadow = true;
        torso.add(torsoMesh);

        // Heavy chest breastplate with rivets
        const breastplate = new THREE.Mesh(new THREE.BoxGeometry(1.85, 1.45, 0.35), golemMat);
        breastplate.position.set(0, 0.35, 0.45);
        torso.add(breastplate);

        // Burning furnace core in center chest
        const coreFurnace = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.45, 12), coreMat);
        coreFurnace.rotation.x = Math.PI / 2;
        coreFurnace.position.set(0, 0.28, 0.65);
        torso.add(coreFurnace);

        // Furnace iron grating bars
        for (let b = -2; b <= 2; b++) {
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.85, 6), darkSteelMat);
            bar.position.set(b * 0.16, 0.28, 0.88);
            torso.add(bar);
        }

        const coreLight = new THREE.PointLight(0xff6600, 3.5, 12);
        coreLight.position.set(0, 0.28, 1.05);
        torso.add(coreLight);

        // Exhaust chimney vents on upper back
        for (let v = -1; v <= 1; v += 2) {
            const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.85, 6), darkSteelMat);
            vent.position.set(v * 0.55, 1.35, -0.45);
            vent.rotation.x = -0.35;
            torso.add(vent);
        }

        // Segmented iron waist faulds / skirt
        const faulds = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.25, 0.75, 8), golemMat);
        faulds.position.y = -1.15;
        torso.add(faulds);

        // 2. Sculpted Iron Helm with Ocular Slit
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.55, 0.1);
        torso.add(headGroup);

        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.52, 0.85, 8), golemMat);
        helm.castShadow = true;
        headGroup.add(helm);

        // Heavy visor ridge
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.12, 0.28), darkSteelMat);
        visor.position.set(0, 0.08, 0.42);
        headGroup.add(visor);

        // Glowing molten eye slit
        const ocularSlit = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.045, 0.1), new THREE.MeshBasicMaterial({ color: 0xff5500 }));
        ocularSlit.position.set(0, 0.08, 0.52);
        headGroup.add(ocularSlit);

        // 3. Massive Tiered Curved Pauldrons
        for (let side = -1; side <= 1; side += 2) {
            const pauld = new THREE.Mesh(new THREE.SphereGeometry(0.75, 8, 8), golemMat);
            pauld.scale.set(1.2, 0.85, 1.1);
            pauld.position.set(side * 1.55, 1.05, 0);
            torso.add(pauld);

            // Heavy pauldron rivets
            for (let r = 0; r < 4; r++) {
                const angle = (r / 4) * Math.PI;
                const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), darkSteelMat);
                rivet.position.set(side * 1.55 + Math.cos(angle) * 0.75 * side, 1.05 + Math.sin(angle) * 0.55, 0.45);
                torso.add(rivet);
            }
        }

        // 4. Right Arm wielding Giant Crescent Core Axe
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.45, 0.85, 0);
        torso.add(rightShoulder);

        const rBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 1.25, 8), golemMat);
        rBicep.position.y = -0.65;
        rightShoulder.add(rBicep);

        const rElbow = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 8), darkSteelMat);
        rElbow.position.y = -1.35;
        rightShoulder.add(rElbow);

        const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 1.25, 8), golemMat);
        rForearm.position.y = -2.05;
        rightShoulder.add(rForearm);

        const weaponGroup = new THREE.Group();
        weaponGroup.position.y = -2.75;
        rightShoulder.add(weaponGroup);

        // Colossal Dragon Bone Golem Greataxe
        const axeShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 5.8, 8), darkSteelMat);
        axeShaft.position.y = 1.6;
        axeShaft.castShadow = true;
        weaponGroup.add(axeShaft);

        // Massive crescent axe blade
        const axeBlade = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.6, 1.8), steelMat);
        axeBlade.position.set(0, 3.4, 0.85);
        axeBlade.castShadow = true;
        weaponGroup.add(axeBlade);

        // Hollow center core slot on axe
        const axeHollow = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.6, 0.75), darkSteelMat);
        axeHollow.position.set(0, 3.4, 0.75);
        weaponGroup.add(axeHollow);

        // Razor steel cutting edge
        const axeEdge = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.8, 0.45), new THREE.MeshStandardMaterial({ color: 0xddeeff, metalness: 0.9, roughness: 0.2 }));
        axeEdge.position.set(0, 3.4, 1.85);
        weaponGroup.add(axeEdge);

        // 5. Left Arm (Colossal Crushing Fist)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-1.45, 0.85, 0);
        torso.add(leftShoulder);

        const lBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 1.25, 8), golemMat);
        lBicep.position.y = -0.65;
        leftShoulder.add(lBicep);

        const lElbow = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 8), darkSteelMat);
        lElbow.position.y = -1.35;
        leftShoulder.add(lElbow);

        const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 1.25, 8), golemMat);
        lForearm.position.y = -2.05;
        leftShoulder.add(lForearm);

        const lFist = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.75), darkSteelMat);
        lFist.position.y = -2.85;
        leftShoulder.add(lFist);

        // 6. Thick Hydraulic Iron Pillar Legs & Stomping Boots
        const rightHip = new THREE.Group();
        rightHip.position.set(0.72, -1.35, 0);
        torso.add(rightHip);

        const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.42, 1.45, 8), golemMat);
        rThigh.position.y = -0.72;
        rightHip.add(rThigh);

        const rKnee = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 8), darkSteelMat);
        rKnee.position.set(0, -1.45, 0.1);
        rightHip.add(rKnee);

        const rShin = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.46, 1.45, 8), golemMat);
        rShin.position.y = -2.15;
        rightHip.add(rShin);

        const rBoot = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.45, 1.15), darkSteelMat);
        rBoot.position.set(0, -2.95, 0.22);
        rightHip.add(rBoot);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.72, -1.35, 0);
        torso.add(leftHip);

        const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.42, 1.45, 8), golemMat);
        lThigh.position.y = -0.72;
        leftHip.add(lThigh);

        const lKnee = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 8), darkSteelMat);
        lKnee.position.set(0, -1.45, 0.1);
        leftHip.add(lKnee);

        const lShin = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.46, 1.45, 8), golemMat);
        lShin.position.y = -2.15;
        leftHip.add(lShin);

        const lBoot = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.45, 1.15), darkSteelMat);
        lBoot.position.set(0, -2.95, 0.22);
        leftHip.add(lBoot);

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
    // 7. EXECUTIONER SMOUGH (Anor Londo Cathedral)
    createExecutionerSmough(x, z) {
        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.4;
        root.add(bodyGroup);

        const smoughMat = this.smoughGoldMat;
        const goldMat = this.goldTrimMat;
        const steelMat = this.steelMat;
        const darkSteelMat = this.darkSteelMat;

        // 1. Colossal Bulbous Golden Cuirass
        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // Core massive bulbous belly
        const bellyMesh = new THREE.Mesh(new THREE.SphereGeometry(1.45, 14, 12), smoughMat);
        bellyMesh.scale.set(1.35, 1.18, 1.28);
        bellyMesh.castShadow = true;
        torso.add(bellyMesh);

        // Grotesque embossed breastplate details & pectoral plates
        const pecL = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), smoughMat);
        pecL.position.set(-0.65, 0.65, 1.2);
        pecL.scale.set(1.0, 0.8, 0.6);
        torso.add(pecL);

        const pecR = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), smoughMat);
        pecR.position.set(0.65, 0.65, 1.2);
        pecR.scale.set(1.0, 0.8, 0.6);
        torso.add(pecR);

        // High fluted neck collar / gorget
        const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 0.55, 10), smoughMat);
        collar.position.set(0, 1.35, 0.15);
        torso.add(collar);

        // Hanging layered brass faulds / hip tassets
        const faulds = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.75, 0.85, 10), smoughMat);
        faulds.position.y = -1.15;
        torso.add(faulds);

        // 2. Grotesque Small Domed Helm
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.75, 0.25);
        torso.add(headGroup);

        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 0.85, 10), smoughMat);
        helm.castShadow = true;
        headGroup.add(helm);

        // Pointed helm peak
        const helmPeak = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 6), smoughMat);
        helmPeak.position.y = 0.55;
        headGroup.add(helmPeak);

        // Grotesque face visor slit
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.15), darkSteelMat);
        visor.position.set(0, 0.1, 0.46);
        headGroup.add(visor);

        // 3. Massive Bulbous Pauldrons & Muscular Gilded Arms
        const pauldL = new THREE.Mesh(new THREE.SphereGeometry(0.75, 8, 8), smoughMat);
        pauldL.position.set(-1.65, 0.85, 0);
        pauldL.scale.set(1.15, 0.95, 1.15);
        torso.add(pauldL);

        const pauldR = new THREE.Mesh(new THREE.SphereGeometry(0.75, 8, 8), smoughMat);
        pauldR.position.set(1.65, 0.85, 0);
        pauldR.scale.set(1.15, 0.95, 1.15);
        torso.add(pauldR);

        // Right Arm (Wielding Colossal Executioner's War Hammer)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.65, 0.7, 0);
        torso.add(rightShoulder);

        const rBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 1.25, 8), smoughMat);
        rBicep.position.y = -0.65;
        rightShoulder.add(rBicep);

        const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.44, 1.25, 8), smoughMat);
        rForearm.position.y = -1.75;
        rightShoulder.add(rForearm);

        const weaponGroup = new THREE.Group();
        weaponGroup.position.y = -2.35;
        rightShoulder.add(weaponGroup);

        // Colossal Golden Executioner War Hammer
        // Massive steel & leather shaft
        const hammerShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 5.8, 8), darkSteelMat);
        hammerShaft.position.y = 1.4;
        hammerShaft.castShadow = true;
        weaponGroup.add(hammerShaft);

        // Spiked counterweight pommel
        const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.32, 6, 6), smoughMat);
        pommel.position.y = -1.4;
        weaponGroup.add(pommel);

        // Massive golden anvil/barrel hammer head
        const hammerHead = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 2.5, 12), smoughMat);
        hammerHead.position.set(0, 3.8, 0.35);
        hammerHead.rotation.z = Math.PI / 2;
        hammerHead.castShadow = true;
        weaponGroup.add(hammerHead);

        // Iron reinforcement hoops around hammer barrel
        for (let h = -1; h <= 1; h += 2) {
            const hoop = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.08, 6, 16), darkSteelMat);
            hoop.position.set(h * 0.95, 3.8, 0.35);
            hoop.rotation.y = Math.PI / 2;
            weaponGroup.add(hoop);
        }

        // Crushing flat strike faces on both hammer ends
        for (let f = -1; f <= 1; f += 2) {
            const face = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.08, 0.15, 12), darkSteelMat);
            face.position.set(f * 1.3, 3.8, 0.35);
            face.rotation.z = Math.PI / 2;
            weaponGroup.add(face);
        }

        // 4. Left Arm
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-1.65, 0.7, 0);
        torso.add(leftShoulder);

        const lBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 1.25, 8), smoughMat);
        lBicep.position.y = -0.65;
        leftShoulder.add(lBicep);

        const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.44, 1.25, 8), smoughMat);
        lForearm.position.y = -1.75;
        leftShoulder.add(lForearm);

        // 5. Heavy Gilded Pillar Legs & Fluted Knee Bells
        const rightHip = new THREE.Group();
        rightHip.position.set(0.85, -1.35, 0);
        torso.add(rightHip);

        const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 1.45, 8), smoughMat);
        rThigh.position.y = -0.72;
        rightHip.add(rThigh);

        const rKnee = new THREE.Mesh(new THREE.SphereGeometry(0.52, 8, 8), smoughMat);
        rKnee.position.set(0, -1.45, 0.15);
        rightHip.add(rKnee);

        const rShin = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.54, 1.45, 8), smoughMat);
        rShin.position.y = -2.15;
        rightHip.add(rShin);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.85, -1.35, 0);
        torso.add(leftHip);

        const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 1.45, 8), smoughMat);
        lThigh.position.y = -0.72;
        leftHip.add(lThigh);

        const lKnee = new THREE.Mesh(new THREE.SphereGeometry(0.52, 8, 8), smoughMat);
        lKnee.position.set(0, -1.45, 0.15);
        leftHip.add(lKnee);

        const lShin = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.54, 1.45, 8), smoughMat);
        lShin.position.y = -2.15;
        leftHip.add(lShin);

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

        const abyssMat = this.artoriasAbyssMat;
        const bladeMat = this.artoriasBladeDarkMat;
        const steelMat = this.steelMat;
        const darkSteelMat = this.darkSteelMat;
        const goldMat = this.goldTrimMat;

        // 1. Slender Tall Knight Torso & Fluted Cobalt Cuirass
        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // Core chest cylinder
        const cuirassGeo = new THREE.CylinderGeometry(0.48, 0.42, 1.45, 10);
        const cuirass = new THREE.Mesh(cuirassGeo, abyssMat);
        cuirass.scale.set(1.15, 1.0, 0.85);
        cuirass.castShadow = true;
        torso.add(cuirass);

        // Pectoral fluting & Royal Silver Crest relief
        const crest = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.55, 0.15), steelMat);
        crest.position.set(0, 0.25, 0.38);
        torso.add(crest);

        // Segmented waist faulds / tassets protecting hips
        const faulds = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.56, 0.45, 8), abyssMat);
        faulds.position.y = -0.7;
        torso.add(faulds);

        // Tattered abyssal mantle / cowl draped over shoulder & down back
        const mantle = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.85, 1.7, 8), abyssMat);
        mantle.position.set(0, -0.35, -0.32);
        mantle.castShadow = true;
        torso.add(mantle);

        // Shredded mantle tails
        for (let m = 0; m < 4; m++) {
            const mTail = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.65, 0.05), abyssMat);
            mTail.position.set((m - 1.5) * 0.22, -1.25, -0.42);
            mTail.rotation.x = -0.15;
            torso.add(mTail);
        }

        // 2. Sculpted Artorias Helm with High Tattered Plume
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.95, 0);
        torso.add(headGroup);

        // Helm dome & narrow sallet
        const helmDome = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.75, 8), steelMat);
        helmDome.castShadow = true;
        headGroup.add(helmDome);

        // Narrow cross-visor slit
        const visorH = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.08), new THREE.MeshBasicMaterial({ color: 0x050810 }));
        visorH.position.set(0, 0.02, 0.28);
        headGroup.add(visorH);

        const visorV = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.08), new THREE.MeshBasicMaterial({ color: 0x050810 }));
        visorV.position.set(0, -0.05, 0.28);
        headGroup.add(visorV);

        // Monumental Shredded Abyssal Plume billowing backward
        const plumeGroup = new THREE.Group();
        plumeGroup.position.set(0, 0.38, -0.08);
        headGroup.add(plumeGroup);

        let prevPlume = plumeGroup;
        for (let p = 0; p < 5; p++) {
            const pSeg = new THREE.Group();
            pSeg.position.set(0, -0.15 - p * 0.04, -0.28);
            pSeg.rotation.x = -0.35 - p * 0.05;
            prevPlume.add(pSeg);

            const rP = 0.16 + Math.sin((p / 4) * Math.PI) * 0.12;
            const pMesh = new THREE.Mesh(new THREE.CylinderGeometry(rP * 0.7, rP, 0.48, 6), abyssMat);
            pMesh.rotation.x = Math.PI / 2.5;
            pSeg.add(pMesh);

            prevPlume = pSeg;
        }

        // 3. Right Arm (Greatsword Master)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.68, 0.45, 0);
        torso.add(rightShoulder);

        // Layered fluted pauldron
        const pauldronR = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.38, 0.45, 8), steelMat);
        pauldronR.rotation.z = -0.35;
        rightShoulder.add(pauldronR);

        const rBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.75, 6), abyssMat);
        rBicep.position.y = -0.42;
        rightShoulder.add(rBicep);

        const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.75, 6), steelMat);
        rForearm.position.y = -1.05;
        rightShoulder.add(rForearm);

        const weaponGroup = new THREE.Group();
        weaponGroup.position.y = -1.45;
        rightShoulder.add(weaponGroup);

        // Greatsword of Artorias
        // Pommel
        const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), steelMat);
        pommel.position.y = -0.35;
        weaponGroup.add(pommel);

        // Long two-handed grip
        const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.06, 1.15, 8), darkSteelMat);
        hilt.position.y = 0.25;
        weaponGroup.add(hilt);

        // Wolf-head crossguard
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.18, 0.22), steelMat);
        guard.position.y = 0.85;
        weaponGroup.add(guard);

        for (let q = -1; q <= 1; q += 2) {
            const quillon = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 4), steelMat);
            quillon.position.set(q * 0.48, 0.95, 0);
            quillon.rotation.z = -q * 0.55;
            weaponGroup.add(quillon);
        }

        // Colossal Abyss Greatsword Blade
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.2, 0.42), bladeMat);
        blade.position.y = 3.0;
        blade.castShadow = true;
        weaponGroup.add(blade);

        // Deep central fuller
        const fuller = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.8, 0.12), darkSteelMat);
        fuller.position.y = 2.9;
        weaponGroup.add(fuller);

        // Pointed blade tip
        const swordTip = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.85, 4), bladeMat);
        swordTip.position.y = 5.35;
        swordTip.castShadow = true;
        weaponGroup.add(swordTip);

        // Swirling Abyssal Miasma Light
        const abyssLight = new THREE.PointLight(0x3355cc, 3.2, 10);
        abyssLight.position.set(0, 3.2, 0);
        weaponGroup.add(abyssLight);

        // 4. Left Arm: Broken and hanging limp (Iconic Lore Posture)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.68, 0.45, 0);
        torso.add(leftShoulder);

        // Damaged / broken pauldron
        const pauldronL = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 0.42, 6), abyssMat);
        pauldronL.rotation.z = 0.45;
        leftShoulder.add(pauldronL);

        // Broken upper arm dangling
        const lBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.16, 0.85, 6), abyssMat);
        lBicep.position.set(0.08, -0.45, 0.05);
        lBicep.rotation.z = 0.22;
        leftShoulder.add(lBicep);

        // Limp forearm wrapped in frayed bandages
        const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.85, 6), darkSteelMat);
        lForearm.position.set(0.18, -1.15, 0.1);
        lForearm.rotation.z = 0.28;
        leftShoulder.add(lForearm);

        // Dangling limp hand
        const lHand = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.22), steelMat);
        lHand.position.set(0.26, -1.62, 0.12);
        leftShoulder.add(lHand);

        // 5. Slender Gothic Plate Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.32, -0.75, 0);
        torso.add(rightHip);

        const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.22, 1.05, 6), abyssMat);
        rThigh.position.y = -0.52;
        rightHip.add(rThigh);

        const rKnee = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), steelMat);
        rKnee.position.set(0, -1.05, 0.05);
        rightHip.add(rKnee);

        const rShin = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 1.05, 6), steelMat);
        rShin.position.set(0, -1.55, 0);
        rightHip.add(rShin);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.32, -0.75, 0);
        torso.add(leftHip);

        const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.22, 1.05, 6), abyssMat);
        lThigh.position.y = -0.52;
        leftHip.add(lThigh);

        const lKnee = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), steelMat);
        lKnee.position.set(0, -1.05, 0.05);
        leftHip.add(lKnee);

        const lShin = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 1.05, 6), steelMat);
        lShin.position.set(0, -1.55, 0);
        leftHip.add(lShin);

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

        const manusMat = this.manusDarkMat;
        const hornMat = this.demonHornMat;
        const darkSteelMat = this.darkSteelMat;

        // 1. Primeval Dark Beast Torso
        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // Core barrel chest
        const chestMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 0.95, 2.4, 8), manusMat);
        chestMesh.scale.set(1.28, 1.0, 1.15);
        chestMesh.castShadow = true;
        torso.add(chestMesh);

        // Heavy hunched dorsal muscle hump
        const hump = new THREE.Mesh(new THREE.SphereGeometry(1.15, 10, 8), manusMat);
        hump.position.set(0, 0.65, -0.45);
        hump.scale.set(1.1, 0.85, 1.25);
        torso.add(hump);

        // Primeval bone spurs protruding from spine
        for (let s = 0; s < 5; s++) {
            const spur = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.65, 4), hornMat);
            spur.position.set(0, 0.85 - s * 0.35, -0.85);
            spur.rotation.x = -Math.PI / 2.3;
            torso.add(spur);
        }

        // Corrupted abyssal rib cage
        for (let r = 0; r < 4; r++) {
            const ribL = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.14, 0.32), manusMat);
            ribL.position.set(-0.65, 0.25 - r * 0.32, 0.55);
            ribL.rotation.set(-0.1, 0.35, 0.15);
            torso.add(ribL);

            const ribR = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.14, 0.32), manusMat);
            ribR.position.set(0.65, 0.25 - r * 0.32, 0.55);
            ribR.rotation.set(-0.1, -0.35, -0.15);
            torso.add(ribR);
        }

        // 2. Primeval Beast Skull with Multi-Eyes & Curved Ram Horns
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.25, 0.45);
        torso.add(headGroup);

        const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.75, 10, 8), manusMat);
        cranium.scale.set(1.0, 0.9, 1.25);
        cranium.castShadow = true;
        headGroup.add(cranium);

        // Menacing lower jaw
        const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.28, 0.85), manusMat);
        jaw.position.set(0, -0.42, 0.45);
        jaw.rotation.x = 0.28;
        headGroup.add(jaw);

        // Fangs
        for (let f = 0; f < 6; f++) {
            const fang = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.26, 4), hornMat);
            fang.position.set((f % 3 - 1) * 0.22, -0.28, 0.55 + Math.floor(f / 3) * 0.18);
            fang.rotation.x = Math.PI;
            headGroup.add(fang);
        }

        // 8 Glowing Red Void Eyes arranged in an arc
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });
        for (let e = 0; e < 8; e++) {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
            const ex = (e % 4 - 1.5) * 0.22;
            const ey = 0.15 - Math.floor(e / 4) * 0.2;
            eye.position.set(ex, ey, 0.82);
            headGroup.add(eye);
        }

        const eyeGlow = new THREE.PointLight(0xff0022, 2.8, 8);
        eyeGlow.position.set(0, 0.1, 0.95);
        headGroup.add(eyeGlow);

        // Curled primeval ram horns
        for (let side = -1; side <= 1; side += 2) {
            const h1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.75, 6), hornMat);
            h1.position.set(side * 0.55, 0.35, -0.1);
            h1.rotation.set(-0.35, 0, side * 0.75);
            headGroup.add(h1);

            const h2 = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.1, 5), hornMat);
            h2.position.set(side * 0.95, 0.15, -0.55);
            h2.rotation.set(-1.15, 0, side * 1.25);
            headGroup.add(h2);
        }

        // 3. Right Arm (holding Ancient Catalyst)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.35, 0.65, 0);
        torso.add(rightShoulder);

        const rBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 1.25, 6), manusMat);
        rBicep.position.y = -0.6;
        rightShoulder.add(rBicep);

        const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 1.25, 6), manusMat);
        rForearm.position.y = -1.65;
        rightShoulder.add(rForearm);

        const weaponGroup = new THREE.Group();
        weaponGroup.position.y = -2.25;
        rightShoulder.add(weaponGroup);

        // Ancient Catalyst Staff (Gnarled root staff with soul crystal)
        const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 4.4, 7), hornMat);
        staff.position.y = 1.2;
        weaponGroup.add(staff);

        // Head of catalyst
        const catHead = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), darkSteelMat);
        catHead.position.y = 3.4;
        weaponGroup.add(catHead);

        const voidOrb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshBasicMaterial({ color: 0x220044 }));
        voidOrb.position.y = 3.65;
        weaponGroup.add(voidOrb);

        const abyssOrbLight = new THREE.PointLight(0x6600aa, 2.5, 8);
        abyssOrbLight.position.y = 3.65;
        weaponGroup.add(abyssOrbLight);

        // 4. Colossal Demonic Giant Left Arm (Manus Iconic Monstrous Mutated Arm)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-1.65, 0.7, 0);
        torso.add(leftShoulder);

        // Bulging mutated upper arm
        const lBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.68, 1.85, 8), manusMat);
        lBicep.position.y = -0.92;
        leftShoulder.add(lBicep);

        // Forearm with protruding abyss thorns
        const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.75, 1.85, 8), manusMat);
        lForearm.position.y = -2.25;
        leftShoulder.add(lForearm);

        for (let t = 0; t < 4; t++) {
            const thorn = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.55, 4), hornMat);
            thorn.position.set(-0.55, -1.8 - t * 0.35, 0.1);
            thorn.rotation.z = Math.PI / 2.3;
            leftShoulder.add(thorn);
        }

        // Monstrous claw hand
        const clawGroup = new THREE.Group();
        clawGroup.position.y = -3.25;
        leftShoulder.add(clawGroup);

        const palm = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.65, 1.35), manusMat);
        clawGroup.add(palm);

        // 5 elongated curved demon talon claws
        for (let c = 0; c < 5; c++) {
            const claw = new THREE.Mesh(new THREE.ConeGeometry(0.15, 1.75, 5), hornMat);
            claw.position.set((c - 2) * 0.28, -0.95, 0.45);
            claw.rotation.x = 0.45;
            clawGroup.add(claw);
        }

        // 5. Heavy Muscular Beast Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.65, -1.15, 0);
        torso.add(rightHip);

        const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.48, 1.45, 7), manusMat);
        rThigh.position.y = -0.72;
        rightHip.add(rThigh);

        const rShin = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 1.45, 7), manusMat);
        rShin.position.y = -1.95;
        rightHip.add(rShin);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.65, -1.15, 0);
        torso.add(leftHip);

        const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.48, 1.45, 7), manusMat);
        lThigh.position.y = -0.72;
        leftHip.add(lThigh);

        const lShin = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 1.45, 7), manusMat);
        lShin.position.y = -1.95;
        leftHip.add(lShin);

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

        const dragonMat = this.kalameetDragonMat;
        const eyeMat = this.calamityEyeMat;
        const membraneMat = this.wingMembraneMat;
        const hornMat = this.demonHornMat;
        const toothMat = this.gapingToothMat;

        // 1. Sleek Muscular Obsidian Dragon Torso
        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // Core barrel body
        const bodyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.15, 3.8, 8), dragonMat);
        bodyMesh.rotation.x = Math.PI / 2;
        bodyMesh.scale.set(1.15, 0.85, 1.0);
        bodyMesh.castShadow = true;
        torso.add(bodyMesh);

        // Ventral chest scutes / armored belly plates
        const bellyPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.98, 3.4, 8), hornMat);
        bellyPlate.rotation.x = Math.PI / 2;
        bellyPlate.position.y = -0.35;
        bellyPlate.scale.set(1.05, 0.65, 1.0);
        torso.add(bellyPlate);

        // Dorsal spine fin crest running down spine
        for (let s = 0; s < 7; s++) {
            const zPos = 1.4 - s * 0.48;
            const spine = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.65, 4), hornMat);
            spine.position.set(0, 0.72, zPos);
            spine.rotation.x = -0.35;
            torso.add(spine);
        }

        // 2. Long Serpentine Dragon Neck & Horned Calamity Skull
        const neckGroup = new THREE.Group();
        neckGroup.position.set(0, 0.65, 1.7);
        torso.add(neckGroup);

        let prevNeck = neckGroup;
        for (let n = 0; n < 4; n++) {
            const nSeg = new THREE.Group();
            nSeg.position.set(0, 0.28, 0.38);
            nSeg.rotation.x = 0.22 - n * 0.04;
            prevNeck.add(nSeg);

            const rN = 0.52 - n * 0.05;
            const nMesh = new THREE.Mesh(new THREE.CylinderGeometry(rN * 0.85, rN, 0.55, 6), dragonMat);
            nMesh.rotation.x = Math.PI / 3;
            nSeg.add(nMesh);

            prevNeck = nSeg;
        }

        // Dragon Head
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.35, 0.55);
        prevNeck.add(headGroup);

        // Horned Cranium block
        const skull = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.55, 1.15), dragonMat);
        skull.castShadow = true;
        headGroup.add(skull);

        // Snout & Upper Jaw
        const snout = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.25, 6), dragonMat);
        snout.rotation.x = -Math.PI / 2;
        snout.position.set(0, -0.05, 0.85);
        headGroup.add(snout);

        // Menacing Lower Jaw
        const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.22, 1.1), dragonMat);
        jaw.position.set(0, -0.32, 0.65);
        jaw.rotation.x = 0.22;
        headGroup.add(jaw);

        // Fangs
        for (let f = 0; f < 6; f++) {
            const fang = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.22, 4), toothMat);
            fang.position.set((f % 2 === 0 ? 0.2 : -0.2), -0.22, 0.65 + Math.floor(f / 2) * 0.25);
            fang.rotation.x = Math.PI;
            headGroup.add(fang);
        }

        // Sweeping Curved Obsidian Dragon Horns
        for (let side = -1; side <= 1; side += 2) {
            const horn1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.85, 6), hornMat);
            horn1.position.set(side * 0.42, 0.45, -0.35);
            horn1.rotation.set(-0.65, 0, side * 0.45);
            headGroup.add(horn1);

            const horn2 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1.1, 5), hornMat);
            horn2.position.set(side * 0.65, 0.95, -0.95);
            horn2.rotation.set(-1.15, 0, side * 0.65);
            headGroup.add(horn2);
        }

        // Glowing Crimson Calamity Eye on forehead
        const calamityEye = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), eyeMat);
        calamityEye.position.set(0, 0.38, 0.25);
        headGroup.add(calamityEye);

        const eyeLight = new THREE.PointLight(0xff0022, 4.0, 14);
        eyeLight.position.set(0, 0.45, 0.25);
        headGroup.add(eyeLight);

        // 3. Four Massive Bat-Like Dragon Wings
        const leftWingGroup = new THREE.Group();
        leftWingGroup.position.set(-0.85, 0.65, 0.35);
        torso.add(leftWingGroup);

        const rightWingGroup = new THREE.Group();
        rightWingGroup.position.set(0.85, 0.65, 0.35);
        torso.add(rightWingGroup);

        const buildDragonWing = (wGroup, side) => {
            // Main shoulder bone
            const bone1 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 1.8, 6), dragonMat);
            bone1.position.set(side * 0.85, 0.65, 0);
            bone1.rotation.z = side * 0.75;
            wGroup.add(bone1);

            // Elbow joint & spur
            const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), dragonMat);
            elbow.position.set(side * 1.65, 1.25, 0);
            wGroup.add(elbow);

            const spur = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.45, 4), hornMat);
            spur.position.set(side * 1.75, 1.45, 0);
            spur.rotation.z = side * 0.4;
            wGroup.add(spur);

            // 4 Wing finger digits
            for (let f = 0; f < 4; f++) {
                const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 2.4, 5), dragonMat);
                const angle = side * (-0.15 - f * 0.35);
                finger.position.set(side * (2.4 + f * 0.45), 0.3 - f * 0.6, 0);
                finger.rotation.z = angle;
                wGroup.add(finger);
            }

            // Obsidian wing membrane
            const membrane = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 3.2), membraneMat);
            membrane.position.set(side * 2.2, 0.3, 0);
            membrane.rotation.y = side * 0.2;
            membrane.material.side = THREE.DoubleSide;
            wGroup.add(membrane);
        };

        buildDragonWing(leftWingGroup, -1);
        buildDragonWing(rightWingGroup, 1);

        // 4. Four Heavy Muscular Dragon Legs
        const buildDragonLeg = (isFront, isRight) => {
            const leg = new THREE.Group();
            const side = isRight ? 1 : -1;
            const zPos = isFront ? 1.05 : -1.15;
            leg.position.set(side * 1.15, -0.55, zPos);

            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 1.25, 6), dragonMat);
            thigh.position.set(0, -0.45, 0);
            leg.add(thigh);

            const knee = new THREE.Mesh(new THREE.SphereGeometry(0.28, 6, 6), dragonMat);
            knee.position.set(0, -0.95, isFront ? 0.08 : -0.08);
            leg.add(knee);

            const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 1.15, 6), dragonMat);
            shin.position.set(0, -1.45, 0);
            leg.add(shin);

            // Heavy obsidian dragon claws
            for (let c = 0; c < 3; c++) {
                const claw = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.45, 4), hornMat);
                claw.position.set((c - 1) * 0.18, -1.95, 0.25);
                claw.rotation.x = 1.1;
                leg.add(claw);
            }

            return leg;
        };

        const rightHip = buildDragonLeg(true, true);
        torso.add(rightHip);

        const leftHip = buildDragonLeg(true, false);
        torso.add(leftHip);

        // 5. Long Segmented Spiked Tail with Axe-Finial
        const tailGroup = new THREE.Group();
        tailGroup.position.set(0, 0, -1.95);
        torso.add(tailGroup);

        let prevTail = tailGroup;
        for (let t = 0; t < 7; t++) {
            const tSeg = new THREE.Group();
            tSeg.position.set(0, -0.12, -0.52);
            tSeg.rotation.x = -0.15 - t * 0.04;
            prevTail.add(tSeg);

            const rSeg = 0.52 - t * 0.065;
            const tMesh = new THREE.Mesh(new THREE.CylinderGeometry(rSeg * 0.82, rSeg, 0.6, 6), dragonMat);
            tMesh.rotation.x = Math.PI / 2.2;
            tSeg.add(tMesh);

            // Double dorsal spikes on tail
            const sp1 = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.48, 4), hornMat);
            sp1.position.set(-0.15, 0.32, -0.1);
            sp1.rotation.set(-0.4, 0, -0.3);
            tSeg.add(sp1);

            const sp2 = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.48, 4), hornMat);
            sp2.position.set(0.15, 0.32, -0.1);
            sp2.rotation.set(-0.4, 0, 0.3);
            tSeg.add(sp2);

            prevTail = tSeg;
        }

        // Tail-axe blade finial
        const tailBlade = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.25, 0.85), dragonMat);
        tailBlade.position.set(0, 0.2, -0.35);
        tailBlade.rotation.x = Math.PI / 4;
        prevTail.add(tailBlade);

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

    // ====================================================
    // 37. GORGON MEDUSA (30 BESPOKE 3D VARIANTS & HIGH-POLY SCULPT)
    // ====================================================
    static GORGON_VARIANTS = [
        {
            id: 'medusa_petrified_queen',
            name: 'MEDUSA, PETRIFIED QUEEN',
            title: 'Sunken Temple Matriarch • Emerald Petro-Gaze & Serpentine Kris',
            skinColor: 0x8ba695, scaleColor: 0x1e452c, bellyColor: 0xa8c8b4,
            armorColor: 0x7c5a2c, hairColor: 0x163422, eyeColor: 0x00ff88,
            auraColor: 0x00ff88, weaponType: 'twin_kris', crownType: 'diadem', gemColor: 0x00e676
        },
        {
            id: 'euryale_abyssal_siren',
            name: 'EURYALE, ABYSSAL SIREN',
            title: 'Void Depths Siren • Abyssal Shadow Gaze & Dual Obsidian Khopeshes',
            skinColor: 0x423854, scaleColor: 0x181024, bellyColor: 0x62547a,
            armorColor: 0x2d1f42, hairColor: 0x120c1c, eyeColor: 0xb388ff,
            auraColor: 0x9c27b0, weaponType: 'khopesh', crownType: 'void_horns', gemColor: 0x7c4dff
        },
        {
            id: 'stheno_blood_gorgon',
            name: 'STHENO, BLOOD GORGON',
            title: 'Immortal Slayer • Sanguine Bloodboil Gaze & Jagged Bone Sickles',
            skinColor: 0x7a3038, scaleColor: 0x3d0c14, bellyColor: 0xa84852,
            armorColor: 0x5a1820, hairColor: 0x2a050b, eyeColor: 0xff1744,
            auraColor: 0xd50000, weaponType: 'blood_sickles', crownType: 'bone_horns', gemColor: 0xff1744
        },
        {
            id: 'mytha_baneful_queen',
            name: 'MYTHA, THE BANEFUL QUEEN',
            title: 'Earthen Peak Matriarch • Poison Mire Gaze & Venomous Stilettos',
            skinColor: 0x5a7a60, scaleColor: 0x203824, bellyColor: 0x7aa684,
            armorColor: 0xb89040, hairColor: 0x142818, eyeColor: 0x76ff03,
            auraColor: 0x00e676, weaponType: 'twin_kris', crownType: 'royal_tiara', gemColor: 0x00e676
        },
        {
            id: 'viper_empress_sunken',
            name: 'VIPER EMPRESS OF THE SUNKEN CRYPT',
            title: 'Pharaonic Sovereign • Golden Solar Gaze & Ceremonial Khopesh',
            skinColor: 0x9e8a60, scaleColor: 0x4d3f1a, bellyColor: 0xd4c08e,
            armorColor: 0xe6b800, hairColor: 0x382c0c, eyeColor: 0xffd700,
            auraColor: 0xffab00, weaponType: 'khopesh', crownType: 'pharaoh_cobra', gemColor: 0xffab00
        },
        {
            id: 'carian_glintstone_gorgon',
            name: 'CARIAN GLINTSTONE GORGON',
            title: 'Academy Stargazer • Glintstone Sorcery Gaze & Starlight Recurve Bow',
            skinColor: 0x587896, scaleColor: 0x162c45, bellyColor: 0x88a8cc,
            armorColor: 0x244266, hairColor: 0x0e1c2e, eyeColor: 0x00e5ff,
            auraColor: 0x00b0ff, weaponType: 'glintstone_bow', crownType: 'glintstone_crown', gemColor: 0x00e5ff
        },
        {
            id: 'magma_broodmother',
            name: 'MAGMA BROODMOTHER GORGON',
            title: 'Volcanic Fissure Matron • Molten Lava Gaze & Magma Kris',
            skinColor: 0x3a2c28, scaleColor: 0x1f1412, bellyColor: 0xd85820,
            armorColor: 0x4a2018, hairColor: 0x1a0e0c, eyeColor: 0xff3d00,
            auraColor: 0xff5722, weaponType: 'twin_kris', crownType: 'magma_spires', gemColor: 0xff3d00
        },
        {
            id: 'pale_albinauric_gorgon',
            name: 'PALE ALBINAURIC GORGON',
            title: 'Consecrated Snowfield Hybrid • Glacial Frost Gaze & Silver Scythe',
            skinColor: 0xd8e0e8, scaleColor: 0x8aa0b4, bellyColor: 0xf0f4f8,
            armorColor: 0xb0c4d8, hairColor: 0x70889c, eyeColor: 0x80d8ff,
            auraColor: 0x40c4ff, weaponType: 'serpent_scythe', crownType: 'silver_halo', gemColor: 0x00e5ff
        },
        {
            id: 'shadow_priestess_gorgon',
            name: 'SHADOW PRIESTESS OF MIQUELLA',
            title: 'Unalloyed Sanctuary Sentinel • Sacred Grace Gaze & Holy Halberd',
            skinColor: 0x8c7c64, scaleColor: 0x4a402a, bellyColor: 0xb8a88a,
            armorColor: 0xf5d061, hairColor: 0x332a18, eyeColor: 0xffea00,
            auraColor: 0xffd600, weaponType: 'halberd', crownType: 'erdtree_halo', gemColor: 0xffd600
        },
        {
            id: 'scarlet_rot_gorgon',
            name: 'MALENIA’S ROT BROOD GORGON',
            title: 'Aeonian Bloom Matriarch • Scarlet Rot Gaze & Corrupted Daggers',
            skinColor: 0x8a4b48, scaleColor: 0x4c2020, bellyColor: 0xc47870,
            armorColor: 0x5a2b28, hairColor: 0x361414, eyeColor: 0xff5252,
            auraColor: 0xff1744, weaponType: 'twin_kris', crownType: 'rot_bloom', gemColor: 0xff5252
        },
        {
            id: 'ancient_lightning_gorgon',
            name: 'ANCIENT LIGHTNING DRAKE GORGON',
            title: 'Dragonlord Acolyte • Red Dragon Lightning Gaze & Bolttip Javelin',
            skinColor: 0x7a6e5a, scaleColor: 0x3d3526, bellyColor: 0xaba088,
            armorColor: 0xc49a45, hairColor: 0x262014, eyeColor: 0xffd600,
            auraColor: 0xffab00, weaponType: 'lightning_spear', crownType: 'lightning_horns', gemColor: 0xffd600
        },
        {
            id: 'darkwraith_abyss_gorgon',
            name: 'ABYSSAL DARKWRAITH GORGON',
            title: 'New Londo Dread Matron • Lifedrain Gaze & Abyssal Claws',
            skinColor: 0x2c2c34, scaleColor: 0x121218, bellyColor: 0x454552,
            armorColor: 0x1e1e24, hairColor: 0x0a0a0e, eyeColor: 0xd500f9,
            auraColor: 0xaa00ff, weaponType: 'claws', crownType: 'skull_mask', gemColor: 0xd500f9
        },
        {
            id: 'emerald_alchemist_gorgon',
            name: 'EMERALD TOXICOLOGIST GORGON',
            title: 'Grand Apothecary • Caustic Acid Gaze & Toxic Kris Daggers',
            skinColor: 0x507a4a, scaleColor: 0x1d3d18, bellyColor: 0x7cb574,
            armorColor: 0x2e5426, hairColor: 0x132610, eyeColor: 0x69f0ae,
            auraColor: 0x00e676, weaponType: 'twin_kris', crownType: 'diadem', gemColor: 0x00e676
        },
        {
            id: 'ivory_bone_weaver',
            name: 'IVORY BONE WEAVER GORGON',
            title: 'Catacombs Osteomancer • Soulflame Gaze & Carved Ivory Scythe',
            skinColor: 0xd2cbbe, scaleColor: 0x7a7468, bellyColor: 0xeee8da,
            armorColor: 0x8a8478, hairColor: 0x545048, eyeColor: 0x00e5ff,
            auraColor: 0x18ffff, weaponType: 'serpent_scythe', crownType: 'bone_crest', gemColor: 0x00e5ff
        },
        {
            id: 'crimson_sanguine_matron',
            name: 'SANGUINE NOBLE GORGON',
            title: 'Lord of Blood Consort • Blood Oath Gaze & Ritual Kris',
            skinColor: 0x5e2a34, scaleColor: 0x2b0e14, bellyColor: 0x8c4250,
            armorColor: 0x3d121c, hairColor: 0x1a060a, eyeColor: 0xff1744,
            auraColor: 0xd50000, weaponType: 'twin_kris', crownType: 'royal_tiara', gemColor: 0xff1744
        },
        {
            id: 'cosmic_void_gorgon',
            name: 'ASTEL VOIDBORN GORGON',
            title: 'Nokron Naturalborn • Gravitational Singularity Gaze & Astral Caduceus',
            skinColor: 0x3b325c, scaleColor: 0x140e28, bellyColor: 0x5f528f,
            armorColor: 0x261b45, hairColor: 0x0c071a, eyeColor: 0xe040fb,
            auraColor: 0xd500f9, weaponType: 'caduceus_staff', crownType: 'cosmic_spires', gemColor: 0xe040fb
        },
        {
            id: 'moonlight_huntress_gorgon',
            name: 'MOONLIGHT HUNTRESS GORGON',
            title: 'Moonlit Lake Stalker • Pale Lunar Gaze & Silver Recurve Greatbow',
            skinColor: 0x7a90a8, scaleColor: 0x283e54, bellyColor: 0xa4bed8,
            armorColor: 0x426080, hairColor: 0x182838, eyeColor: 0xb2ebf2,
            auraColor: 0x80deea, weaponType: 'glintstone_bow', crownType: 'lunar_crescent', gemColor: 0x80deea
        },
        {
            id: 'sunken_crypt_wraith',
            name: 'SUNKEN CRYPT WRAITH GORGON',
            title: 'Subterranean Shade • Funerary Specter Gaze & Crypt Flamberge',
            skinColor: 0x485854, scaleColor: 0x1a2624, bellyColor: 0x6e8480,
            armorColor: 0x2e3c38, hairColor: 0x101816, eyeColor: 0x64ffda,
            auraColor: 0x1de9b6, weaponType: 'serpent_scythe', crownType: 'tattered_cowl', gemColor: 0x1de9b6
        },
        {
            id: 'dragonkin_matron_gorgon',
            name: 'DRAGONKIN MATRON GORGON',
            title: 'Nokstella Dragon Abomination • Cold Magma Gaze & Draconic Greatblade',
            skinColor: 0x5a5450, scaleColor: 0x262220, bellyColor: 0x857e78,
            armorColor: 0x38322e, hairColor: 0x181514, eyeColor: 0xff9100,
            auraColor: 0xff6d00, weaponType: 'khopesh', crownType: 'dragon_horns', gemColor: 0xff9100
        },
        {
            id: 'golden_order_arbiter',
            name: 'GOLDEN ORDER ARBITER GORGON',
            title: 'Erdtree Inquisitor • Golden Grace Gaze & Gilded Longsword',
            skinColor: 0x94825e, scaleColor: 0x4d4024, bellyColor: 0xc4b288,
            armorColor: 0xf5c842, hairColor: 0x332912, eyeColor: 0xffea00,
            auraColor: 0xffd600, weaponType: 'halberd', crownType: 'erdtree_halo', gemColor: 0xffd600
        },
        {
            id: 'ashen_kiln_gorgon',
            name: 'ASHEN KILN GORGON',
            title: 'Cinder Brood Matron • Smoldering Ash Gaze & Flame-Forged Sickles',
            skinColor: 0x403836, scaleColor: 0x181414, bellyColor: 0x6e6260,
            armorColor: 0x282020, hairColor: 0x100c0c, eyeColor: 0xff5722,
            auraColor: 0xff3d00, weaponType: 'blood_sickles', crownType: 'cinder_horns', gemColor: 0xff5722
        },
        {
            id: 'leviathan_deep_gorgon',
            name: 'LEVIATHAN DEEP GORGON',
            title: 'Sunken Trench Terror • Bioluminescent Tidal Gaze & Coral Trident',
            skinColor: 0x28606e, scaleColor: 0x0c2830, bellyColor: 0x4896a8,
            armorColor: 0x143c48, hairColor: 0x06181e, eyeColor: 0x00e5ff,
            auraColor: 0x00b0ff, weaponType: 'serpent_scythe', crownType: 'coral_crest', gemColor: 0x00e5ff
        },
        {
            id: 'grave_warden_duelist',
            name: 'GRAVE WARDEN DUELIST GORGON',
            title: 'Colosseum Champion • Frenzied Blood Gaze & Dual Serpent Battleaxes',
            skinColor: 0x85664a, scaleColor: 0x422e1c, bellyColor: 0xb39070,
            armorColor: 0x694625, hairColor: 0x2e1c0e, eyeColor: 0xff9100,
            auraColor: 0xff6d00, weaponType: 'khopesh', crownType: 'gladiator_crest', gemColor: 0xff9100
        },
        {
            id: 'nights_cavalry_gorgon',
            name: 'NIGHT’S CAVALRY GORGON',
            title: 'Midnight Highway Inquisitor • Eclipse Shadow Gaze & Flail of Serpents',
            skinColor: 0x242428, scaleColor: 0x0c0c10, bellyColor: 0x3e3e46,
            armorColor: 0x141418, hairColor: 0x060608, eyeColor: 0x7c4dff,
            auraColor: 0x651fff, weaponType: 'chaos_whip', crownType: 'tattered_cowl', gemColor: 0x7c4dff
        },
        {
            id: 'royal_sentinel_gorgon',
            name: 'ROYAL SENTINEL GORGON',
            title: 'Capital High Bastion Matron • Peerless Steel Gaze & Tower Spear',
            skinColor: 0x78848a, scaleColor: 0x364045, bellyColor: 0xa4b2ba,
            armorColor: 0x546268, hairColor: 0x20282c, eyeColor: 0xe0e0e0,
            auraColor: 0xffffff, weaponType: 'halberd', crownType: 'diadem', gemColor: 0xffffff
        },
        {
            id: 'frost_witch_gorgon',
            name: 'FROST WITCH GORGON',
            title: 'Ranni’s Moonlit Disciple • Freezing Blizzard Gaze & Rime Kris Daggers',
            skinColor: 0x8aa8c4, scaleColor: 0x304860, bellyColor: 0xb8d4ec,
            armorColor: 0x486888, hairColor: 0x1c2e40, eyeColor: 0x00e5ff,
            auraColor: 0x80d8ff, weaponType: 'twin_kris', crownType: 'glintstone_crown', gemColor: 0x00e5ff
        },
        {
            id: 'duskborn_deathroot_gorgon',
            name: 'DUSKBORN DEATHROOT GORGON',
            title: 'Godwyn’s Blighted Spawn • Deathblight Thorn Gaze & Thorny Scythe',
            skinColor: 0x383430, scaleColor: 0x161412, bellyColor: 0x58524c,
            armorColor: 0x24201c, hairColor: 0x0c0a08, eyeColor: 0xffab00,
            auraColor: 0xff6d00, weaponType: 'serpent_scythe', crownType: 'bone_horns', gemColor: 0xffab00
        },
        {
            id: 'sunken_liturgy_hierophant',
            name: 'SUNKEN LITURGY HIGH PRIESTESS',
            title: 'Cathedral of Scales Sovereign • Liturgical Grace Gaze & Sacred Caduceus',
            skinColor: 0x94866c, scaleColor: 0x483e2c, bellyColor: 0xc4b698,
            armorColor: 0x736345, hairColor: 0x2c2416, eyeColor: 0xffd700,
            auraColor: 0xffc400, weaponType: 'caduceus_staff', crownType: 'royal_tiara', gemColor: 0xffd700
        },
        {
            id: 'chaos_bed_gorgon',
            name: 'CHAOS BED DEMON GORGON',
            title: 'Izalith Flame Daughter • Chaos Magma Gaze & Chaos Flame Whip',
            skinColor: 0x5c2818, scaleColor: 0x2c0e06, bellyColor: 0x8f4632,
            armorColor: 0x3d160c, hairColor: 0x1c0602, eyeColor: 0xff3d00,
            auraColor: 0xff1744, weaponType: 'chaos_whip', crownType: 'magma_spires', gemColor: 0xff3d00
        },
        {
            id: 'apex_titan_empress',
            name: 'APEX TITAN GORGON EMPRESS',
            title: 'Primordial World Serpent Deity • Supreme Sovereign Petro-Gaze & Celestial Twin Khopeshes',
            skinColor: 0x8a9299, scaleColor: 0x2a323a, bellyColor: 0xb8c2cc,
            armorColor: 0xd4af37, hairColor: 0x121820, eyeColor: 0x00ffff,
            auraColor: 0x00e5ff, weaponType: 'khopesh', crownType: 'royal_tiara', gemColor: 0x00ffff
        }
    ];

    createGorgonMedusa(x, z, angle = 0, y = 0, mobDef = null) {
        // Resolve 1 of 30 Bespoke Gorgon Variants
        let variant = DarkSoulsCharacters.GORGON_VARIANTS[0];
        if (mobDef) {
            if (typeof mobDef.variantIndex === 'number' && mobDef.variantIndex >= 0) {
                variant = DarkSoulsCharacters.GORGON_VARIANTS[mobDef.variantIndex % DarkSoulsCharacters.GORGON_VARIANTS.length];
            } else if (mobDef.variantId) {
                const found = DarkSoulsCharacters.GORGON_VARIANTS.find(v => v.id === mobDef.variantId);
                if (found) variant = found;
            } else if (mobDef.name) {
                const upper = mobDef.name.toUpperCase();
                const found = DarkSoulsCharacters.GORGON_VARIANTS.find(v => upper.includes(v.id.toUpperCase().split('_')[0]));
                if (found) variant = found;
                else {
                    let hash = 0;
                    const str = (mobDef.id || mobDef.name || '') + '_' + Math.round(x) + '_' + Math.round(z);
                    for (let c = 0; c < str.length; c++) hash = (hash * 31 + str.charCodeAt(c)) & 0x7fffffff;
                    variant = DarkSoulsCharacters.GORGON_VARIANTS[hash % DarkSoulsCharacters.GORGON_VARIANTS.length];
                }
            }
        }

        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.35;
        root.add(bodyGroup);

        const skinMat = new THREE.MeshStandardMaterial({ color: variant.skinColor, roughness: 0.52, metalness: 0.18 });
        const scaleMat = new THREE.MeshStandardMaterial({ color: variant.scaleColor, roughness: 0.32, metalness: 0.50 });
        const bellyMat = new THREE.MeshStandardMaterial({ color: variant.bellyColor, roughness: 0.65, metalness: 0.12 });
        const armorMat = new THREE.MeshStandardMaterial({ color: variant.armorColor, roughness: 0.25, metalness: 0.88 });
        const hairMat = new THREE.MeshStandardMaterial({ color: variant.hairColor, roughness: 0.28, metalness: 0.45 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: variant.eyeColor });
        const gemMat = new THREE.MeshStandardMaterial({ color: variant.gemColor, emissive: variant.gemColor, emissiveIntensity: 0.8, roughness: 0.1 });
        const goldMat = this.goldTrimMat || new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.22, metalness: 0.9 });
        const darkSteelMat = this.darkSteelMat || new THREE.MeshStandardMaterial({ color: 0x222228, roughness: 0.35, metalness: 0.8 });
        const venomMat = this.venomAcidMat || new THREE.MeshStandardMaterial({ color: 0x33ff66, emissive: 0x11bb33, emissiveIntensity: 1.2, roughness: 0.15 });

        // 1. Serpentine Tail (14 articulated spine segments)
        const tailSegments = [];
        const tailGroup = new THREE.Group();
        bodyGroup.add(tailGroup);

        const segCount = 14;
        for (let i = 0; i < segCount; i++) {
            const t = i / segCount;
            const segRadius = 0.55 * (1.0 - t * 0.78);
            const segLen = 0.48;

            const segMesh = new THREE.Mesh(
                new THREE.CylinderGeometry(segRadius, segRadius * 0.92, segLen, 12),
                scaleMat
            );
            segMesh.castShadow = true;
            segMesh.receiveShadow = true;

            // Pale ventral belly scutes
            const belly = new THREE.Mesh(
                new THREE.PlaneGeometry(segRadius * 1.5, segLen * 0.95),
                bellyMat
            );
            belly.rotation.x = Math.PI / 2;
            belly.position.set(0, -segRadius * 0.85, 0);
            segMesh.add(belly);

            // Dorsal ridge spine fin
            if (i < segCount - 2) {
                const fin = new THREE.Mesh(
                    new THREE.ConeGeometry(segRadius * 0.24, segLen * 0.5, 4),
                    armorMat
                );
                fin.position.set(0, segRadius * 0.85, 0);
                fin.rotation.z = Math.PI;
                segMesh.add(fin);
            }

            // Sinuous S-curve on the floor
            const sx = Math.sin(t * Math.PI * 2.2) * (0.65 * (1 - t * 0.35));
            const sz = -0.3 - i * 0.44;
            const sy = -0.5 - t * 0.65;
            segMesh.position.set(sx, sy, sz);
            segMesh.rotation.x = 0.22;
            segMesh.userData = { baseX: sx, baseZ: sz, sIdx: i };

            tailGroup.add(segMesh);
            tailSegments.push(segMesh);
        }

        // Rattlesnake Rattle & Tail Stinger on final segment
        const tipSeg = tailSegments[tailSegments.length - 1];
        const rattleGroup = new THREE.Group();
        rattleGroup.position.set(0, 0, -0.28);
        for (let r = 0; r < 3; r++) {
            const bead = new THREE.Mesh(
                new THREE.TorusGeometry(0.06 - r * 0.015, 0.02, 6, 12),
                goldMat
            );
            bead.position.z = -r * 0.06;
            rattleGroup.add(bead);
        }
        const stinger = new THREE.Mesh(
            new THREE.ConeGeometry(0.045, 0.22, 6),
            darkSteelMat
        );
        stinger.rotation.x = -Math.PI / 2;
        stinger.position.z = -0.24;
        rattleGroup.add(stinger);
        tipSeg.add(rattleGroup);

        // 2. Sculpted Feminine Torso & Antique Cuirass
        const torso = new THREE.Group();
        torso.position.y = 0.18;
        bodyGroup.add(torso);

        // Scaled waist transition
        const waistScales = new THREE.Mesh(
            new THREE.CylinderGeometry(0.36, 0.46, 0.45, 12),
            scaleMat
        );
        waistScales.position.y = -0.25;
        waistScales.castShadow = true;
        torso.add(waistScales);

        // Embossed antique cuirass / corslet
        const cuirass = new THREE.Mesh(
            new THREE.CylinderGeometry(0.32, 0.37, 0.68, 12),
            armorMat
        );
        cuirass.position.y = 0.12;
        cuirass.castShadow = true;
        torso.add(cuirass);

        // Pectoral armor plates
        [-0.14, 0.14].forEach((px) => {
            const pec = new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
                armorMat
            );
            pec.position.set(px, 0.22, 0.26);
            pec.rotation.x = Math.PI / 2;
            cuirass.add(pec);
        });

        // Embossed twin serpents motif on chest
        const chestSnakeL = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.014, 6, 14, Math.PI * 1.5), goldMat);
        chestSnakeL.position.set(-0.12, 0.18, 0.32);
        cuirass.add(chestSnakeL);
        const chestSnakeR = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.014, 6, 14, Math.PI * 1.5), goldMat);
        chestSnakeR.position.set(0.12, 0.18, 0.32);
        chestSnakeR.rotation.y = Math.PI;
        cuirass.add(chestSnakeR);

        // Ornate Gorgon Gorget Collar with central gem
        const gorget = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 6, 16), goldMat);
        gorget.position.set(0, 0.46, 0.05);
        gorget.rotation.x = Math.PI / 2;
        cuirass.add(gorget);

        const gorgetGem = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), gemMat);
        gorgetGem.position.set(0, 0.46, 0.27);
        cuirass.add(gorgetGem);

        // Serpent Hip Faulds / Tassets
        const faulds = new THREE.Mesh(
            new THREE.CylinderGeometry(0.39, 0.46, 0.26, 12, 1, true, -Math.PI * 0.45, Math.PI * 0.90),
            armorMat
        );
        faulds.position.set(0, -0.15, 0.02);
        torso.add(faulds);

        // Dorsal spine fin crest
        const spineFin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.72, 0.16), armorMat);
        spineFin.position.set(0, 0.18, -0.36);
        torso.add(spineFin);

        // 3. Sculpted Head & Menacing Chiseled Face
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.74, 0.04);
        torso.add(headGroup);

        // Cranium with sculpted hollow cheeks and brow
        const cranium = new THREE.Mesh(
            new THREE.SphereGeometry(0.20, 14, 12),
            skinMat
        );
        cranium.scale.set(0.88, 1.15, 0.96);
        cranium.castShadow = true;
        headGroup.add(cranium);

        // Chiseled cheekbone contours
        [-0.14, 0.14].forEach((cx) => {
            const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.08), skinMat);
            cheek.position.set(cx, -0.04, 0.12);
            cheek.rotation.y = (cx > 0 ? -0.35 : 0.35);
            headGroup.add(cheek);
        });

        // Menacing brow ridge
        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.06), skinMat);
        brow.position.set(0, 0.08, 0.18);
        brow.rotation.x = -0.18;
        headGroup.add(brow);

        // Hinged unmasked jaw with open venomous maw
        const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.16), skinMat);
        jaw.position.set(0, -0.16, 0.08);
        jaw.rotation.x = 0.25;
        headGroup.add(jaw);

        // 4 Viper Fangs
        [[-0.05, 0.16], [0.05, 0.16], [-0.04, 0.12], [0.04, 0.12]].forEach(([fx, fz], fIdx) => {
            const fang = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.07, 5), goldMat);
            fang.position.set(fx, fIdx < 2 ? -0.10 : -0.18, fz);
            fang.rotation.x = fIdx < 2 ? Math.PI : 0;
            headGroup.add(fang);
        });

        // Forked flickering tongue
        const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.005, 0.18), venomMat);
        tongue.position.set(0, -0.14, 0.22);
        tongue.rotation.x = 0.15;
        headGroup.add(tongue);

        // Piercing Reptilian Slit Eyes
        [-0.08, 0.08].forEach((ex) => {
            const eyeSocket = new THREE.Mesh(new THREE.SphereGeometry(0.044, 8, 8), darkSteelMat);
            eyeSocket.position.set(ex, 0.03, 0.17);
            headGroup.add(eyeSocket);

            const eyePupil = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), eyeMat);
            eyePupil.scale.set(0.65, 1.25, 0.65);
            eyePupil.position.set(ex, 0.03, 0.19);
            headGroup.add(eyePupil);
        });

        // High-luminance Gaze Aura PointLight
        const gazeLight = new THREE.PointLight(variant.auraColor, 3.2, 14);
        gazeLight.position.set(0, 0.08, 0.42);
        headGroup.add(gazeLight);

        // Headpiece / Crown
        if (variant.crownType === 'royal_tiara' || variant.crownType === 'diadem') {
            const tiara = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.024, 6, 16, Math.PI * 1.2), goldMat);
            tiara.position.set(0, 0.14, 0.02);
            tiara.rotation.x = -Math.PI * 0.45;
            headGroup.add(tiara);

            const crownGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.045, 0), gemMat);
            crownGem.position.set(0, 0.24, 0.16);
            headGroup.add(crownGem);

            if (variant.crownType === 'royal_tiara') {
                for (let sp = -2; sp <= 2; sp++) {
                    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.14 - Math.abs(sp) * 0.025, 5), goldMat);
                    spire.position.set(sp * 0.065, 0.26 - Math.abs(sp) * 0.02, 0.12 - Math.abs(sp) * 0.02);
                    spire.rotation.x = -0.15;
                    headGroup.add(spire);
                }
            }
        } else if (variant.crownType === 'pharaoh_cobra') {
            const nemes = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.36, 0.45, 12, 1, true, -Math.PI * 0.5, Math.PI), goldMat);
            nemes.position.set(0, 0.05, -0.06);
            nemes.rotation.x = 0.25;
            headGroup.add(nemes);

            const uraeus = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.22, 6), goldMat);
            uraeus.position.set(0, 0.26, 0.18);
            uraeus.rotation.x = -0.45;
            headGroup.add(uraeus);
        } else if (variant.crownType === 'glintstone_crown') {
            for (let gc = 0; gc < 5; gc++) {
                const crystal = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.22, 6), gemMat);
                const gang = (gc - 2) * 0.42;
                crystal.position.set(Math.sin(gang) * 0.18, 0.24, Math.cos(gang) * 0.14);
                crystal.rotation.z = -gang * 0.5;
                headGroup.add(crystal);
            }
        } else if (variant.crownType === 'erdtree_halo' || variant.crownType === 'silver_halo') {
            const halo = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.022, 6, 24), goldMat);
            halo.position.set(0, 0.12, -0.15);
            headGroup.add(halo);
        } else if (variant.crownType === 'bone_horns' || variant.crownType === 'void_horns' || variant.crownType === 'dragon_horns' || variant.crownType === 'lightning_horns' || variant.crownType === 'cinder_horns') {
            [-0.16, 0.16].forEach((hx) => {
                const horn = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.38, 6), darkSteelMat);
                horn.position.set(hx, 0.24, -0.02);
                horn.rotation.z = (hx > 0 ? -0.55 : 0.55);
                horn.rotation.x = -0.35;
                headGroup.add(horn);
            });
        }

        // 4. Living Crown of 24 Articulated Serpents (3 Anatomical Tiers)
        const snakeHair = [];

        // Tier 1: 8 Crest Serpents (Top Arching Forward)
        for (let s = 0; s < 8; s++) {
            const ang = (s / 8) * Math.PI * 2;
            const sGroup = new THREE.Group();
            const rad = 0.14;
            sGroup.position.set(Math.cos(ang) * rad, 0.20, Math.sin(ang) * rad);

            const sBody = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.032, 0.48, 6), hairMat);
            sBody.position.set(Math.cos(ang) * 0.08, 0.18, Math.sin(ang) * 0.08);
            sBody.rotation.z = Math.cos(ang) * 0.55;
            sBody.rotation.x = Math.sin(ang) * 0.55;
            sGroup.add(sBody);

            const sHead = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.12, 5), hairMat);
            sHead.position.set(Math.cos(ang) * 0.16, 0.40, Math.sin(ang) * 0.16);
            sHead.rotation.x = Math.PI;

            const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.012, 4, 4), gemMat);
            e1.position.set(0.024, -0.04, 0.03);
            sHead.add(e1);
            const e2 = new THREE.Mesh(new THREE.SphereGeometry(0.012, 4, 4), gemMat);
            e2.position.set(-0.024, -0.04, 0.03);
            sHead.add(e2);

            sGroup.add(sHead);
            headGroup.add(sGroup);
            snakeHair.push(sGroup);
        }

        // Tier 2: 8 Temple Serpents (Sides Coiling Outward)
        for (let s = 0; s < 8; s++) {
            const side = (s < 4 ? -1 : 1);
            const idx = s % 4;
            const sGroup = new THREE.Group();
            sGroup.position.set(side * (0.16 + idx * 0.025), 0.06 - idx * 0.04, 0.06 - idx * 0.04);

            const sBody = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.030, 0.44, 6), hairMat);
            sBody.position.set(side * 0.12, 0.08, -0.04);
            sBody.rotation.z = -side * 0.85;
            sGroup.add(sBody);

            const sHead = new THREE.Mesh(new THREE.ConeGeometry(0.040, 0.11, 5), hairMat);
            sHead.position.set(side * 0.28, 0.14, 0.02);
            sHead.rotation.z = -side * 1.1;

            const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.011, 4, 4), gemMat);
            e1.position.set(0.02, -0.03, 0.025);
            sHead.add(e1);
            const e2 = new THREE.Mesh(new THREE.SphereGeometry(0.011, 4, 4), gemMat);
            e2.position.set(-0.02, -0.03, 0.025);
            sHead.add(e2);

            sGroup.add(sHead);
            headGroup.add(sGroup);
            snakeHair.push(sGroup);
        }

        // Tier 3: 8 Mane Serpents (Flowing down back & shoulders)
        for (let s = 0; s < 8; s++) {
            const sGroup = new THREE.Group();
            const sx = (s - 3.5) * 0.048;
            sGroup.position.set(sx, 0.08, -0.16);

            const sBody = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.030, 0.52, 6), hairMat);
            sBody.position.set(0, -0.18, -0.08);
            sBody.rotation.x = -0.45;
            sGroup.add(sBody);

            const sHead = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.12, 5), hairMat);
            sHead.position.set(0, -0.42, -0.16);
            sHead.rotation.x = -0.2;

            const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.011, 4, 4), gemMat);
            e1.position.set(0.02, 0.02, 0.03);
            sHead.add(e1);
            const e2 = new THREE.Mesh(new THREE.SphereGeometry(0.011, 4, 4), gemMat);
            e2.position.set(-0.02, 0.02, 0.03);
            sHead.add(e2);

            sGroup.add(sHead);
            headGroup.add(sGroup);
            snakeHair.push(sGroup);
        }

        // 5. Scaled Arms & Golden Ouroboros Armlets
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.52, 0.34, 0);
        torso.add(rightShoulder);

        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.080, 0.72, 8), skinMat);
        rArm.position.y = -0.36;
        rArm.castShadow = true;
        rightShoulder.add(rArm);

        const rOuroboros = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.022, 6, 14), goldMat);
        rOuroboros.position.y = -0.22;
        rOuroboros.rotation.x = Math.PI / 2;
        rightShoulder.add(rOuroboros);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.52, 0.34, 0);
        torso.add(leftShoulder);

        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.080, 0.72, 8), skinMat);
        lArm.position.y = -0.36;
        lArm.castShadow = true;
        leftShoulder.add(lArm);

        const lOuroboros = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.022, 6, 14), goldMat);
        lOuroboros.position.y = -0.22;
        lOuroboros.rotation.x = Math.PI / 2;
        leftShoulder.add(lOuroboros);

        // 6. Weapon Rigging based on weaponType
        let rightWeapon = new THREE.Group();
        let leftWeapon = new THREE.Group();

        if (variant.weaponType === 'khopesh') {
            [rightWeapon, leftWeapon].forEach((wGroup, wIdx) => {
                const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.36, 8), darkSteelMat);
                hilt.position.y = -0.15;
                wGroup.add(hilt);

                const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.85, 0.14), goldMat);
                blade.position.set(0, 0.35, 0);
                wGroup.add(blade);

                const hook = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 6, 12, Math.PI * 0.7), darkSteelMat);
                hook.position.set(wIdx === 0 ? 0.12 : -0.12, 0.75, 0);
                hook.rotation.z = (wIdx === 0 ? 0.4 : -0.4);
                wGroup.add(hook);
            });
        } else if (variant.weaponType === 'serpent_scythe') {
            const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 2.2, 8), darkSteelMat);
            staff.position.y = 0.3;
            rightWeapon.add(staff);

            const blade = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1.1, 4), goldMat);
            blade.position.set(0.48, 1.35, 0);
            blade.rotation.z = -Math.PI * 0.45;
            rightWeapon.add(blade);
        } else if (variant.weaponType === 'glintstone_bow') {
            const bow = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.032, 6, 18, Math.PI), darkSteelMat);
            bow.rotation.y = Math.PI / 2;
            leftWeapon.add(bow);

            const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.1, 6), gemMat);
            arrow.rotation.x = Math.PI / 2;
            rightWeapon.add(arrow);
        } else if (variant.weaponType === 'caduceus_staff') {
            const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.0, 8), goldMat);
            shaft.position.y = 0.3;
            rightWeapon.add(shaft);

            const orb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), gemMat);
            orb.position.y = 1.35;
            rightWeapon.add(orb);
        } else {
            // Default: twin_kris or blood_sickles
            [rightWeapon, leftWeapon].forEach((wGroup) => {
                const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.030, 0.32, 8), darkSteelMat);
                hilt.position.y = -0.12;
                wGroup.add(hilt);

                // Wavy flamberge Kris blade
                for (let b = 0; b < 3; b++) {
                    const wave = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.32, 0.14), darkSteelMat);
                    wave.position.set((b % 2 === 0 ? 0.02 : -0.02), 0.16 + b * 0.28, 0);
                    wave.rotation.z = (b % 2 === 0 ? 0.08 : -0.08);
                    wGroup.add(wave);
                }

                const venomGlow = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.85, 0.16), venomMat);
                venomGlow.position.y = 0.45;
                wGroup.add(venomGlow);
            });
        }

        rightWeapon.position.set(0, -0.72, 0.18);
        rightWeapon.rotation.x = Math.PI / 3.5;
        rightShoulder.add(rightWeapon);

        leftWeapon.position.set(0, -0.72, 0.18);
        leftWeapon.rotation.x = Math.PI / 3.5;
        leftShoulder.add(leftWeapon);

        // Dummy hip groups for animation safety
        const rightHip = new THREE.Group();
        const leftHip = new THREE.Group();
        torso.add(rightHip);
        torso.add(leftHip);

        // Volumetric Petrifying Gaze Beam Cone
        const gazeBeamGeo = new THREE.ConeGeometry(3.5, 16, 16, 1, true);
        gazeBeamGeo.rotateX(Math.PI / 2);
        gazeBeamGeo.translate(0, 0, 8.0);
        const gazeBeamMat = new THREE.MeshBasicMaterial({
            color: variant.auraColor,
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

        root.userData = {
            bodyGroup,
            torso,
            head: headGroup,
            headGroup,
            rightShoulder,
            leftShoulder,
            rightHip,
            leftHip,
            weapon: rightWeapon,
            tailSegments,
            snakeHair,
            tongue,
            gorgonGazeBeam,
            gazeLight,
            variant,
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

            // S-curve natural serpentine resting posture (undulating & coiled, alive)
            const curveX = Math.sin(i * 0.72) * 0.35;
            const curveY = (i < 2 ? 0.18 : 0.0);
            const curveZ = -i * 0.42;
            segGroup.position.set(curveX, curveY, curveZ);
            segGroup.rotation.y = Math.cos(i * 0.72) * 0.30;
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

    // 38. MALENIA, BLADE OF MIQUELLA (Haligtree Roots)
    createMalenia(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.35;
        root.add(bodyGroup);

        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.22 });
        const dressMat = new THREE.MeshStandardMaterial({ color: 0xefdfc8, roughness: 0.85 });
        const hairMat = new THREE.MeshStandardMaterial({ color: 0xb53818, roughness: 0.7 });
        const rotMat = new THREE.MeshStandardMaterial({ color: 0xe65100, emissive: 0x992200, roughness: 0.3 });

        // Slender Valkyrie Torso
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 1.35, 8), dressMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Winged Gold Helm & Crimson Hair
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.95, 0);
        torso.add(headGroup);

        const helm = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), goldMat);
        headGroup.add(helm);

        const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 0.22), goldMat);
        wingL.position.set(-0.28, 0.2, -0.05);
        wingL.rotation.z = -0.35;
        headGroup.add(wingL);

        const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 0.22), goldMat);
        wingR.position.set(0.28, 0.2, -0.05);
        wingR.rotation.z = 0.35;
        headGroup.add(wingR);

        const hair = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.26, 1.1, 6), hairMat);
        hair.position.set(0, -0.35, -0.22);
        hair.rotation.x = -0.25;
        headGroup.add(hair);

        // Golden Prosthetic Right Arm with Hand of Malenia Katana
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.42, 0.45, 0);
        torso.add(rightShoulder);

        const rProsthetic = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.85, 8), goldMat);
        rProsthetic.position.y = -0.42;
        rightShoulder.add(rProsthetic);

        const katana = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.6, 0.02), goldMat);
        katana.position.set(0.02, 0.85, 0.25);
        katana.rotation.x = -0.4;
        rightShoulder.add(katana);

        // Left Arm (Flesh and Cape Robe)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.42, 0.45, 0);
        torso.add(leftShoulder);

        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.85, 6), dressMat);
        lArm.position.y = -0.42;
        leftShoulder.add(lArm);

        // Flowing Cape
        const cape = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.6, 0.04), dressMat);
        cape.position.set(0, -0.25, -0.22);
        cape.rotation.x = 0.15;
        torso.add(cape);

        // Scarlet Aeonia Glow Light
        const aeoniaLight = new THREE.PointLight(0xff6622, 2.5, 12, 1.2);
        aeoniaLight.position.set(0, 0.6, 0);
        bodyGroup.add(aeoniaLight);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, aeoniaLight };
        this.scene.add(root);
        return root;
    }

    // 39. STARCOURGE RADAHN (Caelid Redmane Castle)
    createRadahn(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.6;
        root.add(bodyGroup);

        const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x8a5d2e, metalness: 0.8, roughness: 0.35 });
        const gravMat = new THREE.MeshStandardMaterial({ color: 0x110d18, metalness: 0.85, roughness: 0.3 });
        const redManeMat = new THREE.MeshStandardMaterial({ color: 0x991111, roughness: 0.8 });

        // Massive Colossal Torso
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 2.4, 8), bronzeMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Lion Crest Horned Helm & Red Mane
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.6, 0);
        torso.add(headGroup);

        const helm = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 8), bronzeMat);
        headGroup.add(helm);

        const mane = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.9, 1.8, 8), redManeMat);
        mane.position.set(0, -0.4, -0.45);
        mane.rotation.x = -0.3;
        headGroup.add(mane);

        // Twin Colossal Starscourge Curved Greatswords
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.4, 0.8, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 1.3, 8), bronzeMat);
        rArm.position.y = -0.65;
        rightShoulder.add(rArm);
        const rSword = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.4, 0.1), gravMat);
        rSword.position.set(0, 1.2, 0.5);
        rSword.rotation.x = -0.3;
        rightShoulder.add(rSword);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-1.4, 0.8, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 1.3, 8), bronzeMat);
        lArm.position.y = -0.65;
        leftShoulder.add(lArm);
        const lSword = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.4, 0.1), gravMat);
        lSword.position.set(0, 1.2, 0.5);
        lSword.rotation.x = -0.3;
        leftShoulder.add(lSword);

        // Gravity Purple Orb Light
        const gravLight = new THREE.PointLight(0x9922ff, 3.8, 16, 1.2);
        gravLight.position.set(0, 1.0, 0.6);
        bodyGroup.add(gravLight);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, gravLight };
        this.scene.add(root);
        return root;
    }

    // 40. FALSE KING ALLANT (Boletaria Palace Pinnacle)
    createKingAllant(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.6;
        root.add(bodyGroup);

        const royalWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f7fa, roughness: 0.65 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 });
        const soulbrantMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xaaccff, roughness: 0.1, metalness: 0.9 });

        // King's Robed Torso
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 1.7, 8), royalWhiteMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Crown & Bearded Head
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.1, 0);
        torso.add(headGroup);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), royalWhiteMat);
        headGroup.add(head);

        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.25, 8), goldMat);
        crown.position.y = 0.22;
        headGroup.add(crown);

        // Right Arm with Soulbrant Radiant Blade
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.65, 0.55, 0);
        torso.add(rightShoulder);

        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 1.0, 6), royalWhiteMat);
        rArm.position.y = -0.5;
        rightShoulder.add(rArm);

        const soulbrant = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.5, 0.03), soulbrantMat);
        soulbrant.position.set(0, 0.9, 0.3);
        soulbrant.rotation.x = -0.3;
        rightShoulder.add(soulbrant);

        // Left Arm (Soul Drain Channeling Hand)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.65, 0.55, 0);
        torso.add(leftShoulder);

        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 1.0, 6), royalWhiteMat);
        lArm.position.y = -0.5;
        leftShoulder.add(lArm);

        // Sovereign Royal Cape
        const cape = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.9, 0.05), royalWhiteMat);
        cape.position.set(0, -0.2, -0.35);
        cape.rotation.x = 0.12;
        torso.add(cape);

        // Divine White Light
        const divineLight = new THREE.PointLight(0xffffff, 3.2, 14, 1.2);
        divineLight.position.set(0, 0.8, 0.5);
        bodyGroup.add(divineLight);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, divineLight };
        this.scene.add(root);
        return root;
    }


    // ====================================================
    // BOSS 41: LUDWIG THE ACCURSED & HOLY BLADE
    // ====================================================
    createLudwig(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.6;
        root.add(bodyGroup);

        const beastMat = new THREE.MeshStandardMaterial({ color: 0x221a15, roughness: 0.85 });
        const fleshMat = new THREE.MeshStandardMaterial({ color: 0x4a1818, roughness: 0.7 });
        const arcaneMat = new THREE.MeshStandardMaterial({ color: 0x33ffee, emissive: 0x11aabb, roughness: 0.2, metalness: 0.8 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 });

        // Equine beast body
        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 2.8), beastMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // 4 mutated hooved legs
        const legOffsets = [[-0.7, 0.9], [0.7, 0.9], [-0.7, -0.9], [0.7, -0.9]];
        legOffsets.forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.6, 6), beastMat);
            leg.position.set(lx, -1.0, lz);
            torso.add(leg);
        });

        // Mutated second head & neck
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.1, 1.2);
        torso.add(headGroup);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.85, 1.4), beastMat);
        headGroup.add(head);

        // Arcane glowing eyes
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), arcaneMat);
        eyeL.position.set(-0.35, 0.2, 0.5);
        headGroup.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), arcaneMat);
        eyeR.position.set(0.35, 0.2, 0.5);
        headGroup.add(eyeR);

        // Right Arm & Moonlight Greatsword
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.9, 0.6, 0.4);
        torso.add(rightShoulder);

        const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.3, 0.3), fleshMat);
        rArm.position.y = -0.65;
        rightShoulder.add(rArm);

        const moonlightBlade = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.2, 0.08), arcaneMat);
        moonlightBlade.position.set(0, -0.8, 1.1);
        moonlightBlade.rotation.x = 1.1;
        rightShoulder.add(moonlightBlade);

        // Arcane Moonlight Light
        const arcaneLight = new THREE.PointLight(0x33ffee, 3.2, 16, 1.2);
        arcaneLight.position.set(0, 1.2, 0.6);
        bodyGroup.add(arcaneLight);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, moonlightBlade, arcaneLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 42: LADY MARIA OF THE ASTRAL CLOCKTOWER
    // ====================================================
    createLadyMaria(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.35;
        root.add(bodyGroup);

        const coatMat = new THREE.MeshStandardMaterial({ color: 0x1f191b, roughness: 0.7 });
        const capeMat = new THREE.MeshStandardMaterial({ color: 0x660c18, roughness: 0.65 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 });
        const steelMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.2 });
        const bloodMat = new THREE.MeshStandardMaterial({ color: 0xff1133, emissive: 0xaa0022, roughness: 0.2 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 1.4, 8), coatMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Hunter Tricorn Hat & Head
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.95, 0);
        torso.add(headGroup);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), coatMat);
        headGroup.add(head);

        const tricorn = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.08, 3), coatMat);
        tricorn.position.y = 0.2;
        headGroup.add(tricorn);

        // Crimson Cape
        const cape = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.6, 0.04), capeMat);
        cape.position.set(0, -0.2, -0.25);
        cape.rotation.x = 0.12;
        torso.add(cape);

        // Right Arm: Rakuyo Saber
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.48, 0.45, 0);
        torso.add(rightShoulder);

        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.85, 6), coatMat);
        rArm.position.y = -0.42;
        rightShoulder.add(rArm);

        const saber = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.7, 0.03), steelMat);
        saber.position.set(0, -0.5, 0.7);
        saber.rotation.x = 0.9;
        rightShoulder.add(saber);

        // Left Arm: Rakuyo Dagger with Bloodflame
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.48, 0.45, 0);
        torso.add(leftShoulder);

        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.85, 6), coatMat);
        lArm.position.y = -0.42;
        leftShoulder.add(lArm);

        const dagger = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 0.03), bloodMat);
        dagger.position.set(0, -0.3, 0.4);
        dagger.rotation.x = 0.6;
        leftShoulder.add(dagger);

        const bloodLight = new THREE.PointLight(0xff1133, 2.8, 12, 1.2);
        bloodLight.position.set(0, 0.6, 0.4);
        bodyGroup.add(bloodLight);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, saber, dagger, bloodLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 43: ORPHAN OF KOS, CHILD OF THE SEA
    // ====================================================
    createOrphanOfKos(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.5;
        root.add(bodyGroup);

        const fleshMat = new THREE.MeshStandardMaterial({ color: 0xd8dde4, roughness: 0.65 });
        const placentaMat = new THREE.MeshStandardMaterial({ color: 0x7c1424, roughness: 0.5, metalness: 0.2 });
        const lightningMat = new THREE.MeshStandardMaterial({ color: 0x99ccff, emissive: 0x4488ff, roughness: 0.1 });

        // Emaciated celestial frame
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, 1.8, 8), fleshMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Distorted head & cry
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.15, 0.1);
        torso.add(headGroup);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 8), fleshMat);
        headGroup.add(head);

        // Thin membranous wings
        const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.02), placentaMat);
        wingL.position.set(-0.55, 0.2, -0.2);
        wingL.rotation.y = 0.4;
        torso.add(wingL);
        const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.02), placentaMat);
        wingR.position.set(0.55, 0.2, -0.2);
        wingR.rotation.y = -0.4;
        torso.add(wingR);

        // Right Arm & Placenta Cleaver Blade
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.55, 0.6, 0);
        torso.add(rightShoulder);

        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.2, 6), fleshMat);
        rArm.position.y = -0.6;
        rightShoulder.add(rArm);

        const cleaver = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.4, 0.12), placentaMat);
        cleaver.position.set(0, -0.7, 0.8);
        cleaver.rotation.x = 0.9;
        rightShoulder.add(cleaver);

        const lightningLight = new THREE.PointLight(0x66aaff, 3.2, 14, 1.2);
        lightningLight.position.set(0, 0.8, 0.5);
        bodyGroup.add(lightningLight);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, cleaver, lightningLight, wingL, wingR };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 44: FATHER GASCOIGNE, THE BEAST HUNTER
    // ====================================================
    createFatherGascoigne(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.45;
        root.add(bodyGroup);

        const coatMat = new THREE.MeshStandardMaterial({ color: 0x18181c, roughness: 0.8 });
        const steelMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.9, roughness: 0.3 });
        const brassMat = new THREE.MeshStandardMaterial({ color: 0xb58934, metalness: 0.85, roughness: 0.25 });

        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.6, 0.5), coatMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Slouched fedora hat
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.05, 0);
        torso.add(headGroup);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 8), coatMat);
        headGroup.add(head);

        const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.12, 10), coatMat);
        hat.position.y = 0.2;
        headGroup.add(hat);

        // Right Arm: Extended Hunter Axe
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.55, 0.5, 0);
        torso.add(rightShoulder);

        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.0, 6), coatMat);
        rArm.position.y = -0.5;
        rightShoulder.add(rArm);

        const axeShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 8), coatMat);
        axeShaft.position.set(0, -0.6, 0.8);
        axeShaft.rotation.x = 0.8;
        rightShoulder.add(axeShaft);

        const axeBlade = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.08), steelMat);
        axeBlade.position.set(0.15, 0.9, 0);
        axeShaft.add(axeBlade);

        // Left Arm: Beast Blunderbuss
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.55, 0.5, 0);
        torso.add(leftShoulder);

        const blunderbuss = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.07, 1.1, 8), brassMat);
        blunderbuss.position.set(0, -0.4, 0.5);
        blunderbuss.rotation.x = 1.2;
        leftShoulder.add(blunderbuss);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, axeShaft, blunderbuss };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 45: DARKLURKER, SHADOW OF THE PILGRIMS
    // ====================================================
    createDarklurker(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.7; // Ethereally floating
        root.add(bodyGroup);

        const darkRobeMat = new THREE.MeshStandardMaterial({ color: 0x121016, roughness: 0.9 });
        const soulMat = new THREE.MeshStandardMaterial({ color: 0xaa44ff, emissive: 0x6611aa, roughness: 0.2, metalness: 0.6 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.7, 8), darkRobeMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // 4 Feathered Shadow Wings
        const wings = [];
        for (let i = 0; i < 4; i++) {
            const angle = (i - 1.5) * 0.45;
            const wing = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.03), darkRobeMat);
            wing.position.set(Math.sin(angle) * 0.8, 0.4, -0.3);
            wing.rotation.y = angle;
            wing.rotation.z = (i % 2 === 0 ? 0.2 : -0.2);
            torso.add(wing);
            wings.push(wing);
        }

        // Dual Soul Greatswords
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.6, 0.5, 0);
        torso.add(rightShoulder);
        const swordR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.2, 0.04), soulMat);
        swordR.position.set(0, -0.4, 0.7);
        swordR.rotation.x = 0.7;
        rightShoulder.add(swordR);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.6, 0.5, 0);
        torso.add(leftShoulder);
        const swordL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.2, 0.04), soulMat);
        swordL.position.set(0, -0.4, 0.7);
        swordL.rotation.x = 0.7;
        leftShoulder.add(swordL);

        const soulLight = new THREE.PointLight(0xaa44ff, 3.5, 15, 1.2);
        soulLight.position.set(0, 0.8, 0.4);
        bodyGroup.add(soulLight);

        root.userData = { bodyGroup, torso, wings, rightShoulder, leftShoulder, swordR, swordL, soulLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 46: VELSTADT, THE ROYAL AEGIS
    // ====================================================
    createVelstadt(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.75;
        root.add(bodyGroup);

        const goldArmorMat = new THREE.MeshStandardMaterial({ color: 0xcaa246, metalness: 0.85, roughness: 0.28 });
        const darkIronMat = new THREE.MeshStandardMaterial({ color: 0x1f1f24, metalness: 0.9, roughness: 0.35 });
        const darkResonanceMat = new THREE.MeshStandardMaterial({ color: 0x6a1b9a, emissive: 0x4a148c, roughness: 0.3 });

        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.8, 0.65), goldArmorMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Bell-Visor Helm
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.2, 0);
        torso.add(headGroup);

        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.32, 0.6, 8), goldArmorMat);
        headGroup.add(helm);

        // Sacred Chime Hammer
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.8, 0.6, 0);
        torso.add(rightShoulder);

        const hammerHaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8), darkIronMat);
        hammerHaft.position.set(0, -0.6, 0.8);
        hammerHaft.rotation.x = 0.9;
        rightShoulder.add(hammerHaft);

        const chimeBellHead = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, 1.1, 10), darkIronMat);
        chimeBellHead.position.set(0, 1.0, 0);
        hammerHaft.add(chimeBellHead);

        const bellLight = new THREE.PointLight(0x9c27b0, 3.2, 14, 1.2);
        bellLight.position.set(0, 1.0, 0);
        chimeBellHead.add(bellLight);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, hammerHaft, chimeBellHead, bellLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 47: THE BURNT IVORY KING
    // ====================================================
    createIvoryKing(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.8;
        root.add(bodyGroup);

        const ivoryMat = new THREE.MeshStandardMaterial({ color: 0xf5f3ee, metalness: 0.75, roughness: 0.3 });
        const chaosFlameMat = new THREE.MeshStandardMaterial({ color: 0xff4500, emissive: 0xff2200, roughness: 0.2 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 });

        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.9, 0.6), ivoryMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Ivory Spiked Crown
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.25, 0);
        torso.add(headGroup);

        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.3, 0.5, 8), ivoryMat);
        headGroup.add(helm);
        const crown = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.3, 6), goldMat);
        crown.position.y = 0.35;
        headGroup.add(crown);

        // Radiant Sunlight Blade
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.75, 0.65, 0);
        torso.add(rightShoulder);

        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.2, 0.08), chaosFlameMat);
        blade.position.set(0, -0.6, 1.0);
        blade.rotation.x = 0.9;
        rightShoulder.add(blade);

        const flameLight = new THREE.PointLight(0xff5500, 3.5, 16, 1.2);
        flameLight.position.set(0, 0.8, 0.6);
        bodyGroup.add(flameLight);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, blade, flameLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 48: DRAGONRIDER OF HEIDE
    // ====================================================
    createDragonrider(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.7;
        root.add(bodyGroup);

        const crimsonMat = new THREE.MeshStandardMaterial({ color: 0x7a1820, metalness: 0.8, roughness: 0.35 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 });
        const steelMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.25 });

        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.8), crimsonMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Horned Dragon Helm
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.2, 0);
        torso.add(headGroup);

        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.35, 0.55, 8), crimsonMat);
        headGroup.add(helm);

        // Twin-bladed Halberd
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.85, 0.6, 0);
        torso.add(rightShoulder);

        const halberd = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.0, 8), crimsonMat);
        halberd.position.set(0, -0.6, 0.8);
        halberd.rotation.x = 0.8;
        rightShoulder.add(halberd);

        const bladeTop = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.06), steelMat);
        bladeTop.position.set(0.18, 1.2, 0);
        halberd.add(bladeTop);

        // Tower Greatshield
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.85, 0.6, 0);
        torso.add(leftShoulder);

        const shield = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 1.1), crimsonMat);
        shield.position.set(-0.2, -0.4, 0.4);
        leftShoulder.add(shield);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, halberd, shield };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 49: LOTHRIC & LORIAN, TWIN PRINCES
    // ====================================================
    createTwinPrinces(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.35; // Lorian on knees
        root.add(bodyGroup);

        const dragonBrassMat = new THREE.MeshStandardMaterial({ color: 0x3d2f24, metalness: 0.8, roughness: 0.4 });
        const holyRobeMat = new THREE.MeshStandardMaterial({ color: 0xf5f5fa, roughness: 0.6 });
        const flameBladeMat = new THREE.MeshStandardMaterial({ color: 0xff3300, emissive: 0xcc2200, roughness: 0.2 });
        const holyGoldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0x886600, roughness: 0.3 });

        // Elder Prince Lorian (Torso)
        const lorianTorso = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.6, 0.7), dragonBrassMat);
        lorianTorso.castShadow = true;
        bodyGroup.add(lorianTorso);

        // Scorched Greatsword of Lorian
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.8, 0.5, 0);
        lorianTorso.add(rightShoulder);

        const greatsword = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, 0.1), flameBladeMat);
        greatsword.position.set(0, -0.6, 0.9);
        greatsword.rotation.x = 0.9;
        rightShoulder.add(greatsword);

        // Younger Prince Lothric (Clinging to back)
        const lothricTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 1.1, 8), holyRobeMat);
        lothricTorso.position.set(0, 0.4, -0.55);
        lothricTorso.rotation.x = -0.15;
        lorianTorso.add(lothricTorso);

        const holyLight = new THREE.PointLight(0xffea88, 3.5, 15, 1.2);
        holyLight.position.set(0, 0.9, -0.4);
        lorianTorso.add(holyLight);

        root.userData = { bodyGroup, lorianTorso, lothricTorso, rightShoulder, greatsword, holyLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 50: DRAGONSLAYER ARMOUR
    // ====================================================
    createDragonslayerArmour(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.85;
        root.add(bodyGroup);

        const ironMat = new THREE.MeshStandardMaterial({ color: 0x34302c, metalness: 0.9, roughness: 0.35 });
        const redPlumeMat = new THREE.MeshStandardMaterial({ color: 0xaa1824, roughness: 0.7 });
        const lightningMat = new THREE.MeshStandardMaterial({ color: 0xffea00, emissive: 0xffaa00, roughness: 0.2 });

        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.9, 0.75), ironMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Dragon Crest Helm & Red Plume
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.3, 0);
        torso.add(headGroup);

        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.35, 0.6, 8), ironMat);
        headGroup.add(helm);
        const plume = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.9), redPlumeMat);
        plume.position.set(0, 0.4, -0.3);
        headGroup.add(plume);

        // Colossal Lightning Greataxe
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.85, 0.65, 0);
        torso.add(rightShoulder);

        const greataxeShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.0, 8), ironMat);
        greataxeShaft.position.set(0, -0.7, 0.9);
        greataxeShaft.rotation.x = 0.85;
        rightShoulder.add(greataxeShaft);

        const axeBlade = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.1, 0.12), lightningMat);
        axeBlade.position.set(0.35, 1.0, 0);
        greataxeShaft.add(axeBlade);

        // Dragon Greatshield
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.85, 0.65, 0);
        torso.add(leftShoulder);

        const greatshield = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 1.2), ironMat);
        greatshield.position.set(-0.25, -0.3, 0.5);
        leftShoulder.add(greatshield);

        const lightningLight = new THREE.PointLight(0xffea00, 3.5, 16, 1.2);
        lightningLight.position.set(0, 1.0, 0.8);
        bodyGroup.add(lightningLight);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, greataxeShaft, greatshield, lightningLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 51: SISTER FRIEDE & FATHER ARIANDEL
    // ====================================================
    createSisterFriede(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.35;
        root.add(bodyGroup);

        const habitMat = new THREE.MeshStandardMaterial({ color: 0x1b1d22, roughness: 0.85 });
        const frostMat = new THREE.MeshStandardMaterial({ color: 0x77eeff, emissive: 0x2288aa, roughness: 0.2 });
        const blackflameMat = new THREE.MeshStandardMaterial({ color: 0x220033, emissive: 0x440066, roughness: 0.3 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 1.5, 8), habitMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Nun Veil & Cowl
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.0, 0);
        torso.add(headGroup);

        const cowl = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.5, 8), habitMat);
        headGroup.add(cowl);

        // Right Hand: Great Scythe (Frostbite)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.5, 0.45, 0);
        torso.add(rightShoulder);

        const frostScythe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8), habitMat);
        frostScythe.position.set(0, -0.5, 0.7);
        frostScythe.rotation.x = 0.8;
        rightShoulder.add(frostScythe);

        const frostBlade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 0.6), frostMat);
        frostBlade.position.set(0, 1.1, 0.3);
        frostScythe.add(frostBlade);

        // Left Hand: Blackflame Scythe
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.5, 0.45, 0);
        torso.add(leftShoulder);

        const blackScythe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8), habitMat);
        blackScythe.position.set(0, -0.4, 0.5);
        blackScythe.rotation.x = 0.6;
        leftShoulder.add(blackScythe);

        const blackBlade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.45), blackflameMat);
        blackBlade.position.set(0, 0.8, 0.25);
        blackScythe.add(blackBlade);

        const frostLight = new THREE.PointLight(0x77eeff, 3.2, 14, 1.2);
        frostLight.position.set(0, 0.7, 0.5);
        bodyGroup.add(frostLight);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, frostScythe, blackScythe, frostLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 52: CHAMPION GUNDYR
    // ====================================================
    createChampionGundyr(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.85;
        root.add(bodyGroup);

        const steelMat = new THREE.MeshStandardMaterial({ color: 0x24242c, metalness: 0.85, roughness: 0.4 });
        const redGazeMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xaa0000 });

        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.9, 0.7), steelMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Horned Iron Visor Helm
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.3, 0);
        torso.add(headGroup);

        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.35, 0.6, 8), steelMat);
        headGroup.add(helm);

        // Colossal Halberd
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.85, 0.65, 0);
        torso.add(rightShoulder);

        const halberd = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.3, 8), steelMat);
        halberd.position.set(0, -0.7, 0.9);
        halberd.rotation.x = 0.85;
        rightShoulder.add(halberd);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, halberd };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 53: DARK-EATER MIDIR
    // ====================================================
    createDarkeaterMidir(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.4;
        root.add(bodyGroup);

        const scalesMat = new THREE.MeshStandardMaterial({ color: 0x16151c, roughness: 0.85, metalness: 0.3 });
        const abyssMat = new THREE.MeshStandardMaterial({ color: 0x8800ff, emissive: 0x4400aa, roughness: 0.2 });

        // Colossal dragon body
        const torso = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.8, 4.4), scalesMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Dragon neck and horned head
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.4, 2.4);
        torso.add(headGroup);

        const head = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 1.8), scalesMat);
        headGroup.add(head);

        // Abyssal wings
        const leftWing = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.1, 2.2), scalesMat);
        leftWing.position.set(-2.8, 0.6, 0);
        torso.add(leftWing);

        const rightWing = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.1, 2.2), scalesMat);
        rightWing.position.set(2.8, 0.6, 0);
        torso.add(rightWing);

        // Abyssal chest core
        const abyssLight = new THREE.PointLight(0x8800ff, 4.0, 20, 1.2);
        abyssLight.position.set(0, 0.5, 1.0);
        bodyGroup.add(abyssLight);

        root.userData = { bodyGroup, torso, headGroup, leftWing, rightWing, abyssLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 54: GODFREY, FIRST ELDEN LORD
    // ====================================================
    createGodfrey(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.8;
        root.add(bodyGroup);

        const skinMat = new THREE.MeshStandardMaterial({ color: 0xb5977c, roughness: 0.8 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 });
        const seroshMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f5, roughness: 0.7 });

        // Muscular shirtless barbarian lord
        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.9, 0.75), skinMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Crown & Mane
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.3, 0);
        torso.add(headGroup);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 8, 8), skinMat);
        headGroup.add(head);
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.35, 0.22, 8), goldMat);
        crown.position.y = 0.25;
        headGroup.add(crown);

        // Serosh the White Lion Phantom on Back
        const serosh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), seroshMat);
        serosh.position.set(0.3, 0.5, -0.6);
        torso.add(serosh);

        // Dual-Bitted Colossal Greataxe
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.9, 0.65, 0);
        torso.add(rightShoulder);

        const axeShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8), goldMat);
        axeShaft.position.set(0, -0.7, 0.9);
        axeShaft.rotation.x = 0.85;
        rightShoulder.add(axeShaft);

        const axeBladeL = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.9, 0.08), goldMat);
        axeBladeL.position.set(0.35, 1.1, 0);
        axeShaft.add(axeBladeL);
        const axeBladeR = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.9, 0.08), goldMat);
        axeBladeR.position.set(-0.35, 1.1, 0);
        axeShaft.add(axeBladeR);

        const lordLight = new THREE.PointLight(0xffcc33, 3.5, 16, 1.2);
        lordLight.position.set(0, 1.0, 0.6);
        bodyGroup.add(lordLight);

        root.userData = { bodyGroup, torso, headGroup, serosh, rightShoulder, axeShaft, lordLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 55: MALIKETH, THE BLACK BLADE
    // ====================================================
    createMaliketh(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.7;
        root.add(bodyGroup);

        const armorMat = new THREE.MeshStandardMaterial({ color: 0x1f1c19, metalness: 0.8, roughness: 0.35 });
        const goldTrim = new THREE.MeshStandardMaterial({ color: 0xb5933c, metalness: 0.85, roughness: 0.28 });
        const deathMat = new THREE.MeshStandardMaterial({ color: 0xff0033, emissive: 0xcc0022, roughness: 0.2 });

        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.8, 0.65), armorMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Beastly helmet & silver mane
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.2, 0.15);
        torso.add(headGroup);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.8), armorMat);
        headGroup.add(head);

        // Colossal Black Blade with Destined Death Runes
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.75, 0.6, 0);
        torso.add(rightShoulder);

        const blackBlade = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.4, 0.1), deathMat);
        blackBlade.position.set(0, -0.6, 1.0);
        blackBlade.rotation.x = 0.9;
        rightShoulder.add(blackBlade);

        const deathLight = new THREE.PointLight(0xff0033, 3.5, 16, 1.2);
        deathLight.position.set(0, 0.9, 0.7);
        bodyGroup.add(deathLight);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, blackBlade, deathLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 56: MOHG, LORD OF BLOOD
    // ====================================================
    createMohg(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.75;
        root.add(bodyGroup);

        const robeMat = new THREE.MeshStandardMaterial({ color: 0x1b0810, roughness: 0.75 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 });
        const bloodflameMat = new THREE.MeshStandardMaterial({ color: 0xff1122, emissive: 0xaa0011, roughness: 0.2 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.65, 1.8, 8), robeMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Omen Horns Crown
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.2, 0);
        torso.add(headGroup);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), robeMat);
        headGroup.add(head);

        // Trident of Blood (Mohgwyn Sacred Spear)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.75, 0.6, 0);
        torso.add(rightShoulder);

        const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.3, 8), goldMat);
        spear.position.set(0, -0.6, 0.9);
        spear.rotation.x = 0.85;
        rightShoulder.add(spear);

        const tridentHead = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.1), bloodflameMat);
        tridentHead.position.set(0, 1.3, 0);
        spear.add(tridentHead);

        const bloodLight = new THREE.PointLight(0xff1122, 3.5, 16, 1.2);
        bloodLight.position.set(0, 1.0, 0.6);
        bodyGroup.add(bloodLight);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, spear, bloodLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 57: MORGOTT, THE OMEN KING
    // ====================================================
    createMorgott(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.7;
        root.add(bodyGroup);

        const cloakMat = new THREE.MeshStandardMaterial({ color: 0x484239, roughness: 0.9 });
        const cursedSwordMat = new THREE.MeshStandardMaterial({ color: 0x5a1818, roughness: 0.6, metalness: 0.4 });
        const goldenHolyMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0x886600, roughness: 0.2 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 1.8, 8), cloakMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Gnarled Omen Horns
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.2, 0);
        torso.add(headGroup);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), cloakMat);
        headGroup.add(head);

        // Cursed Blood Sword
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.7, 0.6, 0);
        torso.add(rightShoulder);

        const sword = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.8, 0.06), cursedSwordMat);
        sword.position.set(0, -0.5, 0.8);
        sword.rotation.x = 0.85;
        rightShoulder.add(sword);

        const holyLight = new THREE.PointLight(0xffd700, 3.2, 15, 1.2);
        holyLight.position.set(0, 0.9, 0.5);
        bodyGroup.add(holyLight);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, sword, holyLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 58: RYKARD, LORD OF BLASPHEMY
    // ====================================================
    createRykard(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.0;
        root.add(bodyGroup);

        const serpentMat = new THREE.MeshStandardMaterial({ color: 0x3d140e, roughness: 0.8 });
        const blasphemousMat = new THREE.MeshStandardMaterial({ color: 0x881111, emissive: 0x550000, roughness: 0.4 });

        // Colossal Serpent Body
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 3.2, 10), serpentMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Blasphemous Visage Head
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 2.0, 0.6);
        torso.add(headGroup);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 10), serpentMat);
        headGroup.add(head);

        // Blasphemous Blade
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.6, 0.14), blasphemousMat);
        blade.position.set(1.2, 0.5, 1.2);
        blade.rotation.x = 0.9;
        torso.add(blade);

        const magmaLight = new THREE.PointLight(0xff4400, 4.0, 20, 1.2);
        magmaLight.position.set(0, 1.4, 1.0);
        bodyGroup.add(magmaLight);

        root.userData = { bodyGroup, torso, headGroup, blade, magmaLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 59: SWORD SAINT ISSHIN
    // ====================================================
    createIsshin(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.35;
        root.add(bodyGroup);

        const kimonoMat = new THREE.MeshStandardMaterial({ color: 0xededed, roughness: 0.75 });
        const steelMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.95, roughness: 0.15 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 1.4, 8), kimonoMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Jingasa War Hat & Head
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.95, 0);
        torso.add(headGroup);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), kimonoMat);
        headGroup.add(head);

        const hat = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.18, 12), kimonoMat);
        hat.position.y = 0.22;
        headGroup.add(hat);

        // Right Hand: Razor Katana
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.5, 0.45, 0);
        torso.add(rightShoulder);

        const sword = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.9, 0.03), steelMat);
        sword.position.set(0, -0.4, 0.8);
        sword.rotation.x = 0.85;
        rightShoulder.add(sword);

        // Left Hand: Cross Spear (Jumonji Yari)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.5, 0.45, 0);
        torso.add(leftShoulder);

        const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.9, 8), kimonoMat);
        spear.position.set(0, -0.5, 0.8);
        spear.rotation.x = 0.8;
        leftShoulder.add(spear);

        const spearTip = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.7, 0.04), steelMat);
        spearTip.position.set(0, 1.2, 0);
        spear.add(spearTip);

        const windLight = new THREE.PointLight(0xddeeff, 2.8, 12, 1.2);
        windLight.position.set(0, 0.7, 0.5);
        bodyGroup.add(windLight);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, sword, spear, windLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 60: ELDEN BEAST, VASSAL OF THE GREATER WILL
    // ====================================================
    createEldenBeast(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.2;
        root.add(bodyGroup);

        const nebulaMat = new THREE.MeshStandardMaterial({
            color: 0x0a1628,
            roughness: 0.3,
            metalness: 0.7,
            transparent: true,
            opacity: 0.92
        });
        const sacredGoldMat = new THREE.MeshStandardMaterial({
            color: 0xffea77,
            emissive: 0xaa8811,
            roughness: 0.2,
            metalness: 0.8
        });

        // Cosmic celestial serpentine torso
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.3, 3.4, 10), nebulaMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Ethereal wings
        const wingL = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.08, 1.6), nebulaMat);
        wingL.position.set(-2.0, 0.8, -0.4);
        wingL.rotation.z = 0.35;
        torso.add(wingL);

        const wingR = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.08, 1.6), nebulaMat);
        wingR.position.set(2.0, 0.8, -0.4);
        wingR.rotation.z = -0.35;
        torso.add(wingR);

        // Sacred Relic Sword
        const sacredSword = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.6, 0.1), sacredGoldMat);
        sacredSword.position.set(0.9, 0.4, 1.1);
        sacredSword.rotation.x = 0.85;
        torso.add(sacredSword);

        const starLight = new THREE.PointLight(0xffea77, 4.5, 22, 1.2);
        starLight.position.set(0, 1.2, 0.8);
        bodyGroup.add(starLight);

        root.userData = { bodyGroup, torso, wingL, wingR, sacredSword, starLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 101: STARCOURGE RADAHN (TITAN OF THE STARS)
    // ====================================================
    createStarscourgeRadahn(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.4;
        root.add(bodyGroup);

        const bronzeMat = new THREE.MeshStandardMaterial({ color: 0x8a5d2e, metalness: 0.82, roughness: 0.32 });
        const gravMat = new THREE.MeshStandardMaterial({ color: 0x181024, metalness: 0.88, roughness: 0.28 });
        const redManeMat = new THREE.MeshStandardMaterial({ color: 0xa81c1c, roughness: 0.75 });
        const runeMat = new THREE.MeshStandardMaterial({ color: 0x9b59b6, emissive: 0x7d3c98, roughness: 0.25 });

        // Titan Torso with Lion Cuirass
        const torso = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 1.6), bronzeMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        const lionEmboss = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), bronzeMat);
        lionEmboss.position.set(0, 0.2, 0.82);
        torso.add(lionEmboss);

        // Head with Golden Bull Horns & Red Crest Mane
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.45, 0.2);
        torso.add(headGroup);

        const helm = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 1.0), bronzeMat);
        helm.castShadow = true;
        headGroup.add(helm);

        // Curled golden tusks on helm
        const hornL = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.12, 6, 12, Math.PI * 0.9), bronzeMat);
        hornL.position.set(-0.7, 0.2, 0.2);
        hornL.rotation.y = 0.4;
        headGroup.add(hornL);

        const hornR = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.12, 6, 12, Math.PI * 0.9), bronzeMat);
        hornR.position.set(0.7, 0.2, 0.2);
        hornR.rotation.y = -0.4;
        headGroup.add(hornR);

        // Voluminous Red Mane
        const mane = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.85, 2.2, 8), redManeMat);
        mane.position.set(0, -0.6, -0.65);
        mane.rotation.x = -0.4;
        headGroup.add(mane);

        // Right Arm & Starscourge Curved Greatsword
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.45, 0.65, 0);
        torso.add(rightShoulder);

        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 1.3, 6), bronzeMat);
        rArm.position.y = -0.65;
        rightShoulder.add(rArm);

        const swordR = new THREE.Mesh(new THREE.BoxGeometry(0.42, 3.4, 0.14), gravMat);
        swordR.position.set(0.1, 0.8, 0.5);
        swordR.rotation.x = 0.8;
        rightShoulder.add(swordR);

        const runeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.6, 0.16), runeMat);
        runeR.position.copy(swordR.position);
        runeR.rotation.copy(swordR.rotation);
        rightShoulder.add(runeR);

        // Left Arm & Second Starscourge Greatsword
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-1.45, 0.65, 0);
        torso.add(leftShoulder);

        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 1.3, 6), bronzeMat);
        lArm.position.y = -0.65;
        leftShoulder.add(lArm);

        const swordL = new THREE.Mesh(new THREE.BoxGeometry(0.42, 3.4, 0.14), gravMat);
        swordL.position.set(-0.1, 0.8, 0.5);
        swordL.rotation.x = 0.8;
        leftShoulder.add(swordL);

        // Warhorse Leonard
        const horse = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.8, 1.7), bronzeMat);
        horse.position.set(0, -1.8, 0);
        bodyGroup.add(horse);

        // Gravitational purple aura light
        const gravLight = new THREE.PointLight(0xa855f7, 4.0, 24, 1.2);
        gravLight.position.set(0, 0.8, 0.8);
        bodyGroup.add(gravLight);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, swordR, swordL, gravLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 102: BAYLE THE DREAD (VILE DRAKE TYRANT)
    // ====================================================
    createBayleTheDread(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.6;
        root.add(bodyGroup);

        const scaleMat = new THREE.MeshStandardMaterial({ color: 0x151318, roughness: 0.9, metalness: 0.22, flatShading: true });
        const lavaMat = new THREE.MeshStandardMaterial({ color: 0xff3b00, emissive: 0xff2200, roughness: 0.3 });
        const hornMat = new THREE.MeshStandardMaterial({ color: 0x3d3530, roughness: 0.85 });

        // Massive Brutal Drake Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.2, 3.2), scaleMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Molten lava fissures across chest and flanks
        const lavaFissure = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.6, 2.6), lavaMat);
        lavaFissure.position.set(0, -0.2, 0.4);
        torso.add(lavaFissure);

        // Elongated Serpentine Dragon Neck & Menacing Head
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.1, 2.2, 8), scaleMat);
        neck.position.set(0, 1.4, 1.6);
        neck.rotation.x = 0.55;
        torso.add(neck);

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 2.2, 2.4);
        torso.add(headGroup);

        const jaw = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.8), scaleMat);
        headGroup.add(jaw);

        // Glowing magma maw
        const mawGlow = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), lavaMat);
        mawGlow.position.set(0, -0.1, 0.8);
        headGroup.add(mawGlow);

        // Snapped left horn (broken in battle with Placidusax)
        const brokenHorn = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 0.7, 6), hornMat);
        brokenHorn.position.set(-0.55, 0.5, -0.2);
        brokenHorn.rotation.z = -0.4;
        headGroup.add(brokenHorn);

        // Massive jagged right horn
        const greatHorn = new THREE.Mesh(new THREE.ConeGeometry(0.24, 2.0, 6), hornMat);
        greatHorn.position.set(0.65, 1.1, -0.4);
        greatHorn.rotation.z = 0.4;
        greatHorn.rotation.x = -0.4;
        headGroup.add(greatHorn);

        // Torn volcanic bat wings
        const wingL = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.1, 2.8), scaleMat);
        wingL.position.set(-3.2, 0.8, -0.4);
        wingL.rotation.z = 0.35;
        wingL.rotation.y = 0.2;
        torso.add(wingL);

        const wingR = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.1, 2.8), scaleMat);
        wingR.position.set(3.2, 0.8, -0.4);
        wingR.rotation.z = -0.35;
        wingR.rotation.y = -0.2;
        torso.add(wingR);

        // Spiked Heavy Dragon Tail
        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.75, 4.2, 6), scaleMat);
        tail.position.set(0, -0.6, -3.2);
        tail.rotation.x = -0.85;
        torso.add(tail);

        const tailClub = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7), lavaMat);
        tailClub.position.set(0, -1.6, -4.6);
        torso.add(tailClub);

        // Volcanic fire aura
        const bayleLight = new THREE.PointLight(0xff3700, 4.5, 26, 1.2);
        bayleLight.position.set(0, 1.2, 1.0);
        bodyGroup.add(bayleLight);

        root.userData = { bodyGroup, torso, headGroup, wingL, wingR, tail, bayleLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 103: MESSMER THE IMPALER (SHADOW KEEP LORD)
    // ====================================================
    createMessmerTheImpaler(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.0;
        root.add(bodyGroup);

        const plateMat = new THREE.MeshStandardMaterial({ color: 0x6b1616, metalness: 0.8, roughness: 0.32 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });
        const serpentMat = new THREE.MeshStandardMaterial({ color: 0x1b181b, roughness: 0.65 });
        const flameMat = new THREE.MeshStandardMaterial({ color: 0xff3b00, emissive: 0xff2200, roughness: 0.25 });

        // Slender gothic fluted armor torso
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 2.2, 8), plateMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Winged Plumed Helm
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.35, 0);
        torso.add(headGroup);

        const helm = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), plateMat);
        headGroup.add(helm);

        const crest = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 0.5), goldMat);
        crest.position.set(0, 0.45, -0.1);
        headGroup.add(crest);

        // Coiled Abyssal Serpent wrapping around torso
        for (let s = 0; s < 5; s++) {
            const sang = s * 1.3;
            const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.6, 6), serpentMat);
            seg.position.set(Math.cos(sang) * 0.55, -0.6 + s * 0.35, Math.sin(sang) * 0.55);
            seg.rotation.y = sang;
            torso.add(seg);
        }

        // Right Arm & 4.8-Meter Spear of Messmer
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.65, 0.6, 0);
        torso.add(rightShoulder);

        const spearShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 4.8, 8), goldMat);
        spearShaft.position.set(0, 0.6, 0.8);
        spearShaft.rotation.x = 0.5;
        rightShoulder.add(spearShaft);

        const spearHead = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.4, 4), flameMat);
        spearHead.position.set(0, 2.8, -0.3);
        spearHead.rotation.x = 0.5;
        rightShoulder.add(spearHead);

        // Flowing crimson cloak
        const cape = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.05), plateMat);
        cape.position.set(0, -0.3, -0.35);
        cape.rotation.x = 0.12;
        torso.add(cape);

        const messmerLight = new THREE.PointLight(0xff2200, 4.0, 20);
        messmerLight.position.set(0, 1.2, 0.4);
        bodyGroup.add(messmerLight);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, spearShaft, spearHead, messmerLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 104: RELLANA, TWIN MOON KNIGHT
    // ====================================================
    createRellanaTwinMoon(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.4;
        root.add(bodyGroup);

        const carianMat = new THREE.MeshStandardMaterial({ color: 0xb0bec5, metalness: 0.85, roughness: 0.22 });
        const surcoatMat = new THREE.MeshStandardMaterial({ color: 0x0d1b36, roughness: 0.75 });
        const magicMat = new THREE.MeshStandardMaterial({ color: 0x00d2ff, emissive: 0x0066aa, roughness: 0.2 });
        const flameMat = new THREE.MeshStandardMaterial({ color: 0xff7700, emissive: 0xff3300, roughness: 0.2 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 1.4, 8), carianMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.95, 0);
        torso.add(headGroup);

        const helm = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), carianMat);
        headGroup.add(helm);

        // Twin Moon Halo Rings
        const moonHaloL = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.04, 6, 16), magicMat);
        moonHaloL.position.set(-0.7, 0.3, -0.1);
        headGroup.add(moonHaloL);

        const moonHaloR = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.04, 6, 16), flameMat);
        moonHaloR.position.set(0.7, 0.3, -0.1);
        headGroup.add(moonHaloR);

        // Right hand: Magic Blade
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.48, 0.45, 0);
        torso.add(rightShoulder);

        const magicSword = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.4, 0.02), magicMat);
        magicSword.position.set(0.05, 0.8, 0.3);
        magicSword.rotation.x = -0.3;
        rightShoulder.add(magicSword);

        // Left hand: Fire Blade
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.48, 0.45, 0);
        torso.add(leftShoulder);

        const flameSword = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.4, 0.02), flameMat);
        flameSword.position.set(-0.05, 0.8, 0.3);
        flameSword.rotation.x = -0.3;
        leftShoulder.add(flameSword);

        const blueLight = new THREE.PointLight(0x00d2ff, 2.5, 14);
        blueLight.position.set(0.6, 0.8, 0.2);
        bodyGroup.add(blueLight);

        const orangeLight = new THREE.PointLight(0xff6600, 2.5, 14);
        orangeLight.position.set(-0.6, 0.8, 0.2);
        bodyGroup.add(orangeLight);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, leftShoulder, magicSword, flameSword };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 105: DIVINE BEAST DANCING LION
    // ====================================================
    createDancingLion(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.8;
        root.add(bodyGroup);

        const maskMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.75, roughness: 0.28 });
        const silkMat = new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 0.85 });
        const stormMat = new THREE.MeshStandardMaterial({ color: 0xffee55, emissive: 0xccaa00, roughness: 0.3 });

        // Horned Ceremonial Lion Head Mask
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.8, 0.6);
        bodyGroup.add(headGroup);

        const mask = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 1.6), maskMat);
        mask.castShadow = true;
        headGroup.add(mask);

        // Spiraling horns
        const hornL = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.15, 6, 12, Math.PI), maskMat);
        hornL.position.set(-1.1, 0.6, 0);
        hornL.rotation.y = 0.5;
        headGroup.add(hornL);

        const hornR = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.15, 6, 12, Math.PI), maskMat);
        hornR.position.set(1.1, 0.6, 0);
        hornR.rotation.y = -0.5;
        headGroup.add(hornR);

        // Billowing Silken Ceremonial Body
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.0, 2.2, 10), silkMat);
        torso.position.set(0, -0.4, -0.3);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Storm lightning aura
        const stormLight = new THREE.PointLight(0xffee55, 4.2, 22);
        stormLight.position.set(0, 1.0, 0.4);
        bodyGroup.add(stormLight);

        root.userData = { bodyGroup, torso, headGroup, stormLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // BOSS 106: MIDRA, LORD OF FRENZIED FLAME
    // ====================================================
    createMidraFrenziedFlame(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.7;
        root.add(bodyGroup);

        const goldRobeMat = new THREE.MeshStandardMaterial({ color: 0x9c7a28, roughness: 0.82 });
        const frenzySunMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xff9900, emissiveIntensity: 1.0, roughness: 0.2 });
        const ironBarbsMat = new THREE.MeshStandardMaterial({ color: 0x332a18, metalness: 0.85, roughness: 0.35 });

        // Slender withering royal torso
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 1.8, 8), goldRobeMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Blazing Sun of Frenzy Head
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.25, 0);
        torso.add(headGroup);

        const sunCore = new THREE.Mesh(new THREE.SphereGeometry(0.65, 16, 16), frenzySunMat);
        headGroup.add(sunCore);

        // Corona of chaotic flame rays
        for (let r = 0; r < 12; r++) {
            const rayAng = (r / 12) * Math.PI * 2;
            const ray = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.85, 4), frenzySunMat);
            ray.position.set(Math.cos(rayAng) * 0.75, Math.sin(rayAng) * 0.75, 0);
            ray.rotation.z = rayAng - Math.PI / 2;
            headGroup.add(ray);
        }

        // Greatsword of Damnation (right arm)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.5, 0.45, 0);
        torso.add(rightShoulder);

        const greatsword = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.2, 0.05), ironBarbsMat);
        greatsword.position.set(0, 0.9, 0.4);
        greatsword.rotation.x = 0.55;
        rightShoulder.add(greatsword);

        // Golden barbed thorns along crossguard
        const barbCross = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 0.12), ironBarbsMat);
        barbCross.position.set(0, -0.4, 0.4);
        barbCross.rotation.x = 0.55;
        rightShoulder.add(barbCross);

        const frenzyLight = new THREE.PointLight(0xffaa00, 4.5, 24, 1.2);
        frenzyLight.position.set(0, 1.4, 0);
        bodyGroup.add(frenzyLight);

        root.userData = { bodyGroup, torso, headGroup, rightShoulder, greatsword, frenzyLight };
        this.scene.add(root);
        return root;
    }

    // ====================================================
    // NEW PROCEDURAL MOBS (OUTSIDE REALM & EXPEDITIONS)
    // ====================================================

    // 1. ANCIENT TREANT BARK GUARDIAN
    createTreantBarkGuardian(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.6;
        root.add(bodyGroup);

        const barkMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.94, flatShading: true });
        const folMat = new THREE.MeshStandardMaterial({ color: 0x1a4520, roughness: 0.85, flatShading: true });
        const sapMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff7700, roughness: 0.3 });

        // Gnarled Tree Trunk Torso
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.95, 1.8, 8), barkMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Head Knot with glowing amber eyes
        const head = new THREE.Group();
        head.position.set(0, 1.15, 0.15);
        torso.add(head);

        const headKnot = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55), barkMat);
        head.add(headKnot);

        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), sapMat);
        eyeL.position.set(-0.2, 0.1, 0.45);
        head.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), sapMat);
        eyeR.position.set(0.2, 0.1, 0.45);
        head.add(eyeR);

        // Branch horns / crown
        const branchCrown = new THREE.Mesh(new THREE.ConeGeometry(0.15, 1.2, 4), barkMat);
        branchCrown.position.set(0, 0.7, -0.1);
        branchCrown.rotation.x = -0.3;
        head.add(branchCrown);

        // Arms (knobby branches)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.9, 0.4, 0);
        torso.add(rightShoulder);

        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 1.4, 6), barkMat);
        rArm.position.y = -0.55;
        rightShoulder.add(rArm);

        // Tree Branch Club Weapon
        const branchClub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 2.0, 6), barkMat);
        branchClub.position.set(0, -0.8, 0.5);
        branchClub.rotation.x = 0.8;
        rightShoulder.add(branchClub);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.9, 0.4, 0);
        torso.add(leftShoulder);

        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 1.4, 6), barkMat);
        lArm.position.y = -0.55;
        leftShoulder.add(lArm);

        // Foliage tufts on shoulders
        const folL = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45), folMat);
        folL.position.set(0, 0.3, 0);
        leftShoulder.add(folL);

        // Legs (root buttresses)
        const rightHip = new THREE.Group();
        rightHip.position.set(0.4, -0.9, 0);
        torso.add(rightHip);

        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, 1.2, 6), barkMat);
        rLeg.position.y = -0.6;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.4, -0.9, 0);
        torso.add(leftHip);

        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.4, 1.2, 6), barkMat);
        lLeg.position.y = -0.6;
        leftHip.add(lLeg);

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
            weapon: branchClub
        };

        this.scene.add(root);
        return root;
    }

    // 2. CURSED BASILISK OF THE OUTLANDS
    createCursedBasilisk(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 0.55;
        root.add(bodyGroup);

        const skinMat = new THREE.MeshStandardMaterial({ color: 0x242028, roughness: 0.88, flatShading: true });
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xb959e0, emissive: 0x5e1685, roughness: 0.25 });

        // Low predatory reptilian torso
        const torso = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8), skinMat);
        torso.scale.set(1.0, 0.65, 1.6);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Distinctive Colossal Bulbous False Eyes on top of head
        const head = new THREE.Group();
        head.position.set(0, 0.35, 1.0);
        torso.add(head);

        const falseEyeL = new THREE.Mesh(new THREE.SphereGeometry(0.36, 10, 10), eyeMat);
        falseEyeL.position.set(-0.35, 0.25, 0.1);
        head.add(falseEyeL);

        const falseEyeR = new THREE.Mesh(new THREE.SphereGeometry(0.36, 10, 10), eyeMat);
        falseEyeR.position.set(0.35, 0.25, 0.1);
        head.add(falseEyeR);

        // True predatory lizard snout below
        const snout = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 5), skinMat);
        snout.position.set(0, -0.15, 0.45);
        snout.rotation.x = Math.PI / 2;
        head.add(snout);

        // Sprawling quadruped limbs
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.65, 0, 0.5);
        torso.add(rightShoulder);
        const rFrontLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.7, 5), skinMat);
        rFrontLeg.position.set(0.2, -0.3, 0);
        rFrontLeg.rotation.z = -0.5;
        rightShoulder.add(rFrontLeg);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.65, 0, 0.5);
        torso.add(leftShoulder);
        const lFrontLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.7, 5), skinMat);
        lFrontLeg.position.set(-0.2, -0.3, 0);
        lFrontLeg.rotation.z = 0.5;
        leftShoulder.add(lFrontLeg);

        const rightHip = new THREE.Group();
        rightHip.position.set(0.65, 0, -0.5);
        torso.add(rightHip);
        const rBackLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.75, 5), skinMat);
        rBackLeg.position.set(0.2, -0.3, 0);
        rBackLeg.rotation.z = -0.5;
        rightHip.add(rBackLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.65, 0, -0.5);
        torso.add(leftHip);
        const lBackLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.75, 5), skinMat);
        lBackLeg.position.set(-0.2, -0.3, 0);
        lBackLeg.rotation.z = 0.5;
        leftHip.add(lBackLeg);

        // Long Spiked Tail
        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.22, 1.8, 6), skinMat);
        tail.position.set(0, 0.1, -1.5);
        tail.rotation.x = -Math.PI / 2.3;
        torso.add(tail);

        const curseLight = new THREE.PointLight(0xb959e0, 2.0, 8);
        curseLight.position.set(0, 0.6, 0.8);
        bodyGroup.add(curseLight);

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
            weapon: head
        };

        this.scene.add(root);
        return root;
    }

    // 3. FELL OMEN GLADIATOR
    createFellOmenGladiator(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.35;
        root.add(bodyGroup);

        const omenMat = new THREE.MeshStandardMaterial({ color: 0x423830, roughness: 0.85 });
        const hornMat = new THREE.MeshStandardMaterial({ color: 0x221c18, roughness: 0.9, flatShading: true });
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0x2a2826, metalness: 0.85, roughness: 0.35 });

        // Broad muscular brutish torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.3, 0.85), omenMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Head with tangled horned crown
        const head = new THREE.Group();
        head.position.set(0, 0.95, 0.15);
        torso.add(head);

        const skull = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.65), omenMat);
        head.add(skull);

        // Curling Omen horns
        const horn1 = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.1, 5, 10, Math.PI * 0.8), hornMat);
        horn1.position.set(-0.35, 0.25, 0);
        horn1.rotation.y = 0.4;
        head.add(horn1);

        const horn2 = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.12, 5, 10, Math.PI * 0.9), hornMat);
        horn2.position.set(0.4, 0.3, -0.1);
        horn2.rotation.y = -0.5;
        head.add(horn2);

        // Right Arm & Jagged Cleaver
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.75, 0.4, 0);
        torso.add(rightShoulder);

        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 1.1, 6), omenMat);
        rArm.position.y = -0.55;
        rightShoulder.add(rArm);

        const cleaver = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.8, 0.06), bladeMat);
        cleaver.position.set(0.1, 0.4, 0.5);
        cleaver.rotation.x = 0.6;
        rightShoulder.add(cleaver);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.75, 0.4, 0);
        torso.add(leftShoulder);

        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 1.1, 6), omenMat);
        lArm.position.y = -0.55;
        leftShoulder.add(lArm);

        const rightHip = new THREE.Group();
        rightHip.position.set(0.3, -0.65, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 1.1, 6), omenMat);
        rLeg.position.y = -0.55;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.3, -0.65, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 1.1, 6), omenMat);
        lLeg.position.y = -0.55;
        leftHip.add(lLeg);

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
            weapon: cleaver
        };

        this.scene.add(root);
        return root;
    }

    // 4. CRYSTAL DRAKE WHELP
    createCrystalDrakeWhelp(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 0.9;
        root.add(bodyGroup);

        const crystalMat = new THREE.MeshStandardMaterial({
            color: 0x3498db,
            emissive: 0x1a5276,
            roughness: 0.2,
            metalness: 0.8,
            flatShading: true
        });

        // Crystalline dragon body
        const torso = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.6, 6), crystalMat);
        torso.rotation.x = Math.PI / 2.2;
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Head with crystal horns
        const head = new THREE.Group();
        head.position.set(0, 0.45, 0.9);
        torso.add(head);

        const skull = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.7, 5), crystalMat);
        skull.rotation.x = Math.PI / 2;
        head.add(skull);

        // Wings
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.45, 0.2, 0.2);
        torso.add(rightShoulder);
        const rWing = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.9), crystalMat);
        rWing.position.set(0.8, 0.1, 0);
        rWing.rotation.y = -0.25;
        rightShoulder.add(rWing);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.45, 0.2, 0.2);
        torso.add(leftShoulder);
        const lWing = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 0.9), crystalMat);
        lWing.position.set(-0.8, 0.1, 0);
        lWing.rotation.y = 0.25;
        leftShoulder.add(lWing);

        // Tail
        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.2, 1.4, 5), crystalMat);
        tail.position.set(0, 0.1, -1.2);
        tail.rotation.x = -Math.PI / 2.2;
        torso.add(tail);

        const rightHip = new THREE.Group();
        rightHip.position.set(0.3, -0.3, -0.3);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 5), crystalMat);
        rLeg.position.y = -0.3;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.3, -0.3, -0.3);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 5), crystalMat);
        lLeg.position.y = -0.3;
        leftHip.add(lLeg);

        const glowLight = new THREE.PointLight(0x00d2ff, 2.2, 10);
        glowLight.position.set(0, 0.4, 0.4);
        bodyGroup.add(glowLight);

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
            weapon: skull
        };

        this.scene.add(root);
        return root;
    }

    // 5. CRUCIBLE KNIGHT SENTINEL
    createCrucibleKnightSentinel(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.15;
        root.add(bodyGroup);

        const crucibleMat = new THREE.MeshStandardMaterial({ color: 0x8b3a1a, metalness: 0.78, roughness: 0.28 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 });
        const auraMat = new THREE.MeshStandardMaterial({ color: 0xffa500, emissive: 0xff7700, roughness: 0.3 });

        // Crucible Red-Bronze Plate Cuirass
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.0, 0.55), crucibleMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Winged Tree Crest Helm
        const head = new THREE.Group();
        head.position.set(0, 0.75, 0.05);
        torso.add(head);

        const helm = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.48), crucibleMat);
        head.add(helm);

        const treeCrest = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.65, 0.4), goldMat);
        treeCrest.position.set(0, 0.4, -0.05);
        head.add(treeCrest);

        // Right Arm & Crucible Broadsword with Solar Energy
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.55, 0.35, 0);
        torso.add(rightShoulder);

        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.85, 6), crucibleMat);
        rArm.position.y = -0.42;
        rightShoulder.add(rArm);

        const sword = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.4, 0.03), auraMat);
        sword.position.set(0, 0.3, 0.35);
        sword.rotation.x = 0.65;
        rightShoulder.add(sword);

        // Left Arm & Crucible Kite Shield
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.55, 0.35, 0);
        torso.add(leftShoulder);

        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.85, 6), crucibleMat);
        lArm.position.y = -0.42;
        leftShoulder.add(lArm);

        const shield = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.06), crucibleMat);
        shield.position.set(-0.15, -0.15, 0.3);
        leftShoulder.add(shield);

        const rightHip = new THREE.Group();
        rightHip.position.set(0.25, -0.5, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.95, 6), crucibleMat);
        rLeg.position.y = -0.48;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.25, -0.5, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.95, 6), crucibleMat);
        lLeg.position.y = -0.48;
        leftHip.add(lLeg);

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
            weapon: sword
        };

        this.scene.add(root);
        return root;
    }

    // 6. FIRE CHIMERA HOUND
    createFireChimeraHound(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 0.7;
        root.add(bodyGroup);

        const furMat = new THREE.MeshStandardMaterial({ color: 0x181518, roughness: 0.9, flatShading: true });
        const fireMat = new THREE.MeshStandardMaterial({ color: 0xff3b00, emissive: 0xff2200, roughness: 0.25 });

        // Muscular charred canine torso with glowing magma ribs
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.75, 1.5), furMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        const magmaRibs = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.45, 0.9), fireMat);
        torso.add(magmaRibs);

        // Twin Snarling Canine Heads
        const head = new THREE.Group();
        head.position.set(0, 0.45, 0.8);
        torso.add(head);

        const headL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.55), furMat);
        headL.position.set(-0.25, 0.1, 0.1);
        head.add(headL);

        const headR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.55), furMat);
        headR.position.set(0.25, 0.1, 0.1);
        head.add(headR);

        // Glowing red ember eyes
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 4, 4), fireMat);
        eyeL.position.set(-0.25, 0.22, 0.35);
        head.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 4, 4), fireMat);
        eyeR.position.set(0.25, 0.22, 0.35);
        head.add(eyeR);

        // 4 Sprinting legs
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.42, -0.15, 0.45);
        torso.add(rightShoulder);
        const rLegF = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.75, 5), furMat);
        rLegF.position.y = -0.35;
        rightShoulder.add(rLegF);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.42, -0.15, 0.45);
        torso.add(leftShoulder);
        const lLegF = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.75, 5), furMat);
        lLegF.position.y = -0.35;
        leftShoulder.add(lLegF);

        const rightHip = new THREE.Group();
        rightHip.position.set(0.42, -0.15, -0.45);
        torso.add(rightHip);
        const rLegB = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.75, 5), furMat);
        rLegB.position.y = -0.35;
        rightHip.add(rLegB);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.42, -0.15, -0.45);
        torso.add(leftHip);
        const lLegB = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.75, 5), furMat);
        lLegB.position.y = -0.35;
        leftHip.add(lLegB);

        // Tail with flame core
        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 0.9, 5), furMat);
        tail.position.set(0, 0.2, -0.9);
        tail.rotation.x = -Math.PI / 3;
        torso.add(tail);

        const tailFlame = new THREE.Mesh(new THREE.SphereGeometry(0.15, 6, 6), fireMat);
        tailFlame.position.set(0, 0.6, -1.2);
        torso.add(tailFlame);

        const chimeraLight = new THREE.PointLight(0xff4500, 2.5, 9);
        chimeraLight.position.set(0, 0.6, 0.4);
        bodyGroup.add(chimeraLight);

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
            weapon: head
        };

        this.scene.add(root);
        return root;
    }

    // ----------------------------------------------------
    // DYNAMIC SOULSBORNE LEGENDARY BOSS MESH GENERATOR (BOSSES 61-100)
    // ----------------------------------------------------
    createSoulsborneBoss(bossDef, x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.4;
        root.add(bodyGroup);

        const theme = bossDef.theme || 'dark';
        let mainColor = 0x222222;
        let glowColor = 0xff6600;
        let metalness = 0.6;
        let roughness = 0.4;

        if (theme === 'flame' || theme === 'fire') {
            mainColor = 0x2a1510;
            glowColor = 0xff3300;
        } else if (theme === 'holy' || theme === 'gold') {
            mainColor = 0x3d3215;
            glowColor = 0xffd700;
            metalness = 0.85;
            roughness = 0.25;
        } else if (theme === 'magic' || theme === 'cosmic') {
            mainColor = 0x0e1b2b;
            glowColor = 0x00e5ff;
        } else if (theme === 'rot' || theme === 'frenzy') {
            mainColor = 0x2e1e0a;
            glowColor = 0xffaa00;
        } else if (theme === 'beast' || theme === 'blood') {
            mainColor = 0x201416;
            glowColor = 0xcc1122;
        } else if (theme === 'frost' || theme === 'dragon') {
            mainColor = 0x182430;
            glowColor = 0x88ddff;
        }

        const armorMat = new THREE.MeshStandardMaterial({
            color: mainColor,
            metalness: metalness,
            roughness: roughness
        });
        const glowMat = new THREE.MeshStandardMaterial({
            color: glowColor,
            emissive: glowColor,
            emissiveIntensity: 0.65,
            roughness: 0.3
        });
        const steelMat = new THREE.MeshStandardMaterial({
            color: 0x444444,
            metalness: 0.8,
            roughness: 0.2
        });

        const scale = bossDef.bossScale || 1.8;
        bodyGroup.scale.set(scale, scale, scale);

        // 1. Torso
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.42, 1.6, 8), armorMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // 2. Head & Helmet / Horns
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.1, 0);
        torso.add(headGroup);

        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), armorMat);
        headGroup.add(headMesh);

        // Glowing eyes
        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.08), glowMat);
        eyeL.position.set(-0.12, 0.04, 0.28);
        headGroup.add(eyeL);

        const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.08), glowMat);
        eyeR.position.set(0.12, 0.04, 0.28);
        headGroup.add(eyeR);

        // Themed Crest / Crown / Horns
        if (theme === 'holy' || theme === 'gold') {
            const crown = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.05, 6, 12), glowMat);
            crown.position.y = 0.28;
            crown.rotation.x = Math.PI / 2;
            headGroup.add(crown);
        } else if (theme === 'flame' || theme === 'rot' || theme === 'beast') {
            const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.65, 5), glowMat);
            hornL.position.set(-0.25, 0.35, 0);
            hornL.rotation.z = -0.45;
            headGroup.add(hornL);
            const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.65, 5), glowMat);
            hornR.position.set(0.25, 0.35, 0);
            hornR.rotation.z = 0.45;
            headGroup.add(hornR);
        } else {
            const crest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.5), steelMat);
            crest.position.set(0, 0.32, 0);
            headGroup.add(crest);
        }

        // 3. Wings / Tendrils
        const wingL = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.8), armorMat);
        wingL.position.set(-1.1, 0.4, -0.3);
        wingL.rotation.z = 0.3;
        torso.add(wingL);

        const wingR = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.8), armorMat);
        wingR.position.set(1.1, 0.4, -0.3);
        wingR.rotation.z = -0.3;
        torso.add(wingR);

        // 4. Arms & Boss Weapon
        const rShoulder = new THREE.Group();
        rShoulder.position.set(0.65, 0.5, 0);
        torso.add(rShoulder);

        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.95, 6), armorMat);
        rArm.position.y = -0.45;
        rShoulder.add(rArm);

        let wpn;
        if (theme === 'flame' || theme === 'rot') {
            wpn = new THREE.Group();
            const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.8, 6), steelMat);
            const tip = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.1, 6), glowMat);
            tip.position.y = 2.1;
            wpn.add(shaft);
            wpn.add(tip);
        } else if (theme === 'holy' || theme === 'gold') {
            wpn = new THREE.Mesh(new THREE.BoxGeometry(0.28, 3.2, 0.08), glowMat);
        } else if (theme === 'beast') {
            wpn = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.8, 0.1), steelMat);
        } else {
            wpn = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.4, 0.08), steelMat);
        }
        wpn.position.set(0.1, 0.6, 0.6);
        wpn.rotation.x = 0.7;
        rShoulder.add(wpn);

        const lShoulder = new THREE.Group();
        lShoulder.position.set(-0.65, 0.5, 0);
        torso.add(lShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.95, 6), armorMat);
        lArm.position.y = -0.45;
        lShoulder.add(lArm);

        // 5. Boss Atmospheric Point Light
        const auraLight = new THREE.PointLight(glowColor, 3.5, 18, 1.2);
        auraLight.position.set(0, 1.4, 0.6);
        bodyGroup.add(auraLight);

        root.userData = {
            bodyGroup,
            torso,
            headGroup,
            rShoulder,
            lShoulder,
            wpn,
            auraLight,
            wingL,
            wingR
        };

        this.scene.add(root);
        return root;
    }


    createSpiritCompanionMesh(ash) {
        const root = new THREE.Group();
        root.userData = { ashId: ash.id };

        const ghostColor = ash.color || 0x88ccff;
        const ghostMat = new THREE.MeshStandardMaterial({
            color: ghostColor,
            transparent: true,
            opacity: 0.75,
            emissive: ghostColor,
            emissiveIntensity: 0.40,
            roughness: 0.35,
            metalness: 0.15
        });

        // Glowing summon floor ring
        const ringGeo = new THREE.RingGeometry(0.7, 1.0, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: ghostColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.name = 'spiritRing';
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.y = 0.04;
        root.add(ringMesh);

        if (ash.id === 'iron_fist_alexander') {
            // Living Warrior Jar Mesh
            const jarBody = new THREE.Mesh(new THREE.SphereGeometry(0.9, 14, 12), ghostMat);
            jarBody.scale.set(1.1, 0.95, 1.1);
            jarBody.position.y = 0.85;
            root.add(jarBody);

            const jarLid = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.22, 14), ghostMat);
            jarLid.position.y = 1.62;
            root.add(jarLid);

            const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.6, 0.24), ghostMat);
            rArm.name = 'spiritRArm';
            rArm.position.set(0.95, 0.85, 0);
            root.add(rArm);

            const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.6, 0.24), ghostMat);
            lArm.name = 'spiritLArm';
            lArm.position.set(-0.95, 0.85, 0);
            root.add(lArm);
        } else if (ash.id === 'stormhawk_deenh') {
            // Avian Stormhawk
            const birdBody = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.1, 6), ghostMat);
            birdBody.rotation.x = Math.PI / 2;
            birdBody.position.y = 1.6;
            root.add(birdBody);

            const wingL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.5), ghostMat);
            wingL.position.set(-0.7, 1.6, 0);
            wingL.rotation.z = -0.2;
            root.add(wingL);

            const wingR = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.5), ghostMat);
            wingR.position.set(0.7, 1.6, 0);
            wingR.rotation.z = 0.2;
            root.add(wingR);
        } else if (ash.id === 'mad_pumpkin_head') {
            // Colossal Brass Pumpkin Helmet Warrior
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 0.4), ghostMat);
            torso.position.y = 1.1;
            root.add(torso);

            const pumpkinHelm = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 10), new THREE.MeshStandardMaterial({
                color: 0xffaa00,
                emissive: 0xff6600,
                emissiveIntensity: 0.35,
                roughness: 0.5
            }));
            pumpkinHelm.position.y = 1.78;
            root.add(pumpkinHelm);

            const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.75, 6), ghostMat);
            rArm.name = 'spiritRArm';
            rArm.position.set(0.45, 1.1, 0);
            root.add(rArm);
        } else {
            // Humanoid Warrior / Knight / Hero Phantom
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.65, 0.28), ghostMat);
            torso.position.y = 1.05;
            root.add(torso);

            const head = new THREE.Mesh(new THREE.SphereGeometry(0.20, 10, 8), ghostMat);
            head.position.y = 1.55;
            root.add(head);

            const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6), ghostMat);
            rArm.name = 'spiritRArm';
            rArm.position.set(0.34, 1.05, 0);
            root.add(rArm);

            const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6), ghostMat);
            lArm.name = 'spiritLArm';
            lArm.position.set(-0.34, 1.05, 0);
            root.add(lArm);

            // Greatshield for soldiers & Tarkus
            if (ash.id === 'greatshield_soldiers' || ash.id === 'iron_tarkus') {
                const shield = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.95, 0.6), ghostMat);
                shield.position.set(-0.38, 0.95, 0.25);
                root.add(shield);
            }

            // Weapon in Right Hand
            const sword = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.25, 0.03), ghostMat);
            sword.position.set(0.38, 1.0, 0.35);
            root.add(sword);

            const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.7, 6), ghostMat);
            legL.position.set(-0.16, 0.35, 0);
            root.add(legL);

            const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.7, 6), ghostMat);
            legR.position.set(0.16, 0.35, 0);
            root.add(legR);
        }

        return root;
    }

    // =========================================================================
    // NEW PROCEDURAL 3D MOB MODELS (DRAGONKIN, CRUCIBLE, ABDUCTOR, MINDFLAYER, OMEN, ARACHNID)
    // =========================================================================

    // 1. DRAGONKIN MAGMA WYRM
    createDragonkinWyrm(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const scale = (mobDef && mobDef.scale) || 1.45;
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.15;
        bodyGroup.scale.set(scale, scale, scale);
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // Muscular Charred Wyrm Torso
        const chestGeo = new THREE.CylinderGeometry(0.48, 0.38, 1.35, 8);
        const chest = new THREE.Mesh(chestGeo, this.wyrmScaleMat);
        chest.castShadow = true;
        torso.add(chest);

        // Glowing Magma Core Vent on Chest
        const vent = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22), this.magmaGlowMat);
        vent.position.set(0, 0.2, 0.36);
        torso.add(vent);

        const ventLight = new THREE.PointLight(0xff4500, 1.8, 4.5);
        ventLight.position.set(0, 0.2, 0.45);
        torso.add(ventLight);

        // Dorsal Spine Ridges
        for (let i = 0; i < 4; i++) {
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 4), this.wyrmScaleMat);
            spike.position.set(0, 0.4 - i * 0.26, -0.38);
            spike.rotation.x = -0.55;
            torso.add(spike);
        }

        // Long Spiked Wyrm Tail
        const tail = new THREE.Group();
        tail.position.set(0, -0.5, -0.35);
        tail.rotation.x = -0.65;
        const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.06, 1.8, 6), this.wyrmScaleMat);
        tailMesh.position.y = -0.9;
        tail.add(tailMesh);
        const tailBlade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 0.35), this.magmaGlowMat);
        tailBlade.position.set(0, -1.5, 0.15);
        tail.add(tailBlade);
        torso.add(tail);

        // Draconic Horned Head
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.9, 0.2);
        torso.add(headGroup);

        const snout = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, 0.65), this.wyrmScaleMat);
        snout.position.z = 0.2;
        headGroup.add(snout);

        // Swept-back Dragon Horns
        const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.75, 5), this.wyrmScaleMat);
        hornL.position.set(-0.25, 0.3, -0.15);
        hornL.rotation.set(-0.6, 0, -0.4);
        headGroup.add(hornL);

        const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.75, 5), this.wyrmScaleMat);
        hornR.position.set(0.25, 0.3, -0.15);
        hornR.rotation.set(-0.6, 0, 0.4);
        headGroup.add(hornR);

        // Glowing Fiery Eyes
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 4, 4), this.magmaGlowMat);
        eyeL.position.set(-0.19, 0.1, 0.25);
        headGroup.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.05, 4, 4), this.magmaGlowMat);
        eyeR.position.set(0.19, 0.1, 0.25);
        headGroup.add(eyeR);

        // Right Shoulder & Magma Wyrm Curved Greatsword
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.65, 0.45, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.95, 6), this.wyrmScaleMat);
        rArm.position.y = -0.48;
        rightShoulder.add(rArm);

        const wyrmBlade = new THREE.Group();
        wyrmBlade.position.set(0.1, -0.9, 0.25);
        wyrmBlade.rotation.x = 0.75;
        const bladeSpine = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.6, 0.22), this.wyrmScaleMat);
        bladeSpine.position.y = 1.2;
        wyrmBlade.add(bladeSpine);
        const bladeEdge = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.4, 0.18), this.magmaGlowMat);
        bladeEdge.position.set(0, 1.2, 0.16);
        wyrmBlade.add(bladeEdge);
        rightShoulder.add(wyrmBlade);

        // Left Shoulder & Heavy Dragon Claw
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.65, 0.45, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.95, 6), this.wyrmScaleMat);
        lArm.position.y = -0.48;
        leftShoulder.add(lArm);
        const claw = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.35, 0.24), this.wyrmScaleMat);
        claw.position.y = -0.95;
        leftShoulder.add(claw);

        // Taloned Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.26, -0.65, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 1.05, 6), this.wyrmScaleMat);
        rLeg.position.y = -0.52;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.26, -0.65, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 1.05, 6), this.wyrmScaleMat);
        lLeg.position.y = -0.52;
        leftHip.add(lLeg);

        root.userData = {
            bodyGroup, torso, head: headGroup, headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            weapon: wyrmBlade, rightArm: rArm, leftArm: lArm,
            rightLeg: rLeg, leftLeg: lLeg
        };
        return root;
    }

    // 2. CRUCIBLE HORNED KNIGHT
    createCrucibleKnightMob(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const scale = (mobDef && mobDef.scale) || 1.25;
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.0;
        bodyGroup.scale.set(scale, scale, scale);
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // Red-Gold Ordovis Plate Cuirass
        const cuirass = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.32, 1.15, 8), this.crucibleGoldMat);
        cuirass.castShadow = true;
        torso.add(cuirass);

        const waistTrim = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.18, 8), this.crucibleRedMat);
        waistTrim.position.y = -0.45;
        torso.add(waistTrim);

        // Crucible Feathered Wings arching from shoulderblades
        const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.4, 0.65), this.crucibleGoldMat);
        wingL.position.set(-0.48, 0.45, -0.32);
        wingL.rotation.set(-0.35, 0.25, 0.4);
        torso.add(wingL);

        const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.4, 0.65), this.crucibleGoldMat);
        wingR.position.set(0.48, 0.45, -0.32);
        wingR.rotation.set(-0.35, -0.25, -0.4);
        torso.add(wingR);

        // Crucible Antler Helmet
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.78, 0);
        torso.add(headGroup);

        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.45, 8), this.crucibleGoldMat);
        headGroup.add(helm);

        // Branching Antler Horns
        const antlerL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.85, 5), this.crucibleGoldMat);
        antlerL.position.set(-0.25, 0.45, -0.05);
        antlerL.rotation.set(0.2, 0, 0.55);
        headGroup.add(antlerL);
        const prongL = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.4, 4), this.crucibleGoldMat);
        prongL.position.set(-0.38, 0.75, 0.1);
        prongL.rotation.set(-0.3, 0, 0.4);
        headGroup.add(prongL);

        const antlerR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.85, 5), this.crucibleGoldMat);
        antlerR.position.set(0.25, 0.45, -0.05);
        antlerR.rotation.set(0.2, 0, -0.55);
        headGroup.add(antlerR);
        const prongR = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.4, 4), this.crucibleGoldMat);
        prongR.position.set(0.38, 0.75, 0.1);
        prongR.rotation.set(-0.3, 0, -0.4);
        headGroup.add(prongR);

        // Visor slit
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.04, 0.15), this.crucibleRedMat);
        visor.position.set(0, 0.05, 0.22);
        headGroup.add(visor);

        // Right Arm & Crucible Greatsword
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.55, 0.4, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.82, 6), this.crucibleGoldMat);
        rArm.position.y = -0.42;
        rightShoulder.add(rArm);

        const greatsword = new THREE.Group();
        greatsword.position.set(0.08, -0.82, 0.25);
        greatsword.rotation.x = 0.7;
        const swordBlade = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.3, 0.05), this.crucibleGoldMat);
        swordBlade.position.y = 1.05;
        greatsword.add(swordBlade);
        const crossguard = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.1), this.crucibleRedMat);
        crossguard.position.y = 0.02;
        greatsword.add(crossguard);
        rightShoulder.add(greatsword);

        // Left Arm & Crucible Hornshield
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.55, 0.4, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.82, 6), this.crucibleGoldMat);
        lArm.position.y = -0.42;
        leftShoulder.add(lArm);

        const hornshield = new THREE.Group();
        hornshield.position.set(-0.16, -0.42, 0.22);
        const shieldFace = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.25, 0.65), this.crucibleGoldMat);
        hornshield.add(shieldFace);
        const centerHorn = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.45, 5), this.crucibleRedMat);
        centerHorn.position.set(-0.12, 0, 0);
        centerHorn.rotation.z = Math.PI / 2;
        hornshield.add(centerHorn);
        leftShoulder.add(hornshield);

        // Greaves
        const rightHip = new THREE.Group();
        rightHip.position.set(0.22, -0.55, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.9, 6), this.crucibleGoldMat);
        rLeg.position.y = -0.45;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.22, -0.55, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.9, 6), this.crucibleGoldMat);
        lLeg.position.y = -0.45;
        leftHip.add(lLeg);

        root.userData = {
            bodyGroup, torso, head: headGroup, headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            weapon: greatsword, rightArm: rArm, leftArm: lArm,
            rightLeg: rLeg, leftLeg: lLeg
        };
        return root;
    }

    // 3. ABDUCTOR VIRGIN (IRON MAIDEN MECHANICAL WAR ENGINE)
    createAbductorVirgin(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const scale = (mobDef && mobDef.scale) || 1.45;
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.1;
        bodyGroup.scale.set(scale, scale, scale);
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // Heavy Cylindrical Iron Maiden Cage Body
        const cageGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.6, 12);
        const cage = new THREE.Mesh(cageGeo, this.abductorIronMat);
        cage.castShadow = true;
        torso.add(cage);

        // Golden Royal Maternal Face Relief on front
        const faceMask = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.55, 0.15), this.crucibleGoldMat);
        faceMask.position.set(0, 0.35, 0.62);
        torso.add(faceMask);

        // Internal Red Ember Incandescence shining through cage seams
        const emberCore = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), this.magmaGlowMat);
        emberCore.position.set(0, -0.1, 0);
        torso.add(emberCore);

        const emberLight = new THREE.PointLight(0xff2200, 2.0, 5.0);
        emberLight.position.set(0, -0.1, 0.3);
        torso.add(emberLight);

        // Twin Studded Chariot Wheels at base
        const wheelL = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.22, 10), this.abductorIronMat);
        wheelL.rotation.z = Math.PI / 2;
        wheelL.position.set(-0.75, -0.85, 0);
        torso.add(wheelL);

        const wheelR = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.22, 10), this.abductorIronMat);
        wheelR.rotation.z = Math.PI / 2;
        wheelR.position.set(0.75, -0.85, 0);
        torso.add(wheelR);

        // Head Cupola & Spire
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.95, 0);
        torso.add(headGroup);

        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), this.abductorIronMat);
        headGroup.add(dome);
        const finial = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.5, 6), this.crucibleGoldMat);
        finial.position.y = 0.55;
        headGroup.add(finial);

        // Right Arm: Mechanical Arm with Heavy Curved Scythe Pendulum
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.85, 0.4, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.1, 6), this.abductorIronMat);
        rArm.position.y = -0.55;
        rightShoulder.add(rArm);

        const scytheR = new THREE.Group();
        scytheR.position.set(0.1, -1.1, 0.2);
        scytheR.rotation.x = 0.6;
        const bladeMeshR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.9, 0.45), this.abductorBladeMat);
        bladeMeshR.position.y = 0.85;
        scytheR.add(bladeMeshR);
        rightShoulder.add(scytheR);

        // Left Arm: Twin Pendular Guillotine Blade
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.85, 0.4, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.1, 6), this.abductorIronMat);
        lArm.position.y = -0.55;
        leftShoulder.add(lArm);

        const scytheL = new THREE.Group();
        scytheL.position.set(-0.1, -1.1, 0.2);
        scytheL.rotation.x = 0.6;
        const bladeMeshL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.9, 0.45), this.abductorBladeMat);
        bladeMeshL.position.y = 0.85;
        scytheL.add(bladeMeshL);
        leftShoulder.add(scytheL);

        // Lower support structs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.3, -0.85, 0);
        torso.add(rightHip);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.3, -0.85, 0);
        torso.add(leftHip);

        root.userData = {
            bodyGroup, torso, head: headGroup, headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            weapon: scytheR, rightArm: rArm, leftArm: lArm,
            wheelL, wheelR
        };
        return root;
    }

    // 4. CTHULHU MINDFLAYER & COSMIC SCHOLAR
    createCthulhuMindflayer(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const scale = (mobDef && mobDef.scale) || 1.2;
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.0;
        bodyGroup.scale.set(scale, scale, scale);
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // Midnight Cosmic Robe
        const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 1.45, 8), this.cosmicVelvetMat);
        robe.castShadow = true;
        torso.add(robe);

        // Cephalopod Alien Head with 6 writhing face tentacles
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.92, 0);
        torso.add(headGroup);

        const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), this.cosmicVelvetMat);
        cranium.scale.set(0.9, 1.25, 1.1);
        headGroup.add(cranium);

        // Glowing blank cosmic cyan eyes
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 4, 4), this.cosmicGlowMat);
        eyeL.position.set(-0.16, 0.08, 0.28);
        headGroup.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.045, 4, 4), this.cosmicGlowMat);
        eyeR.position.set(0.16, 0.08, 0.28);
        headGroup.add(eyeR);

        // 6 Writhing Tentacles curling from lower face
        for (let i = 0; i < 6; i++) {
            const angleOffset = (i - 2.5) * 0.22;
            const tentacle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.012, 0.65, 4), this.cosmicGlowMat);
            tentacle.position.set(Math.sin(angleOffset) * 0.18, -0.28, 0.28 + Math.cos(angleOffset) * 0.06);
            tentacle.rotation.set(0.45, 0, angleOffset * 0.8);
            headGroup.add(tentacle);
        }

        // Right Arm & Starlight Wand Catalyst
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.48, 0.35, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.82, 6), this.cosmicVelvetMat);
        rArm.position.y = -0.42;
        rightShoulder.add(rArm);

        const starlightStaff = new THREE.Group();
        starlightStaff.position.set(0.08, -0.85, 0.25);
        starlightStaff.rotation.x = 0.5;
        const staffShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 6), this.darkSteelMat);
        staffShaft.position.y = 0.95;
        starlightStaff.add(staffShaft);
        const staffOrb = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18), this.cosmicGlowMat);
        staffOrb.position.y = 2.1;
        starlightStaff.add(staffOrb);
        rightShoulder.add(starlightStaff);

        // Left Arm & Resonant Bell
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.48, 0.35, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.82, 6), this.cosmicVelvetMat);
        lArm.position.y = -0.42;
        leftShoulder.add(lArm);

        const bell = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 6), this.crucibleGoldMat);
        bell.position.set(-0.08, -0.85, 0.15);
        bell.rotation.x = Math.PI;
        leftShoulder.add(bell);

        // Legs underneath robe
        const rightHip = new THREE.Group();
        rightHip.position.set(0.18, -0.65, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.85, 6), this.cosmicVelvetMat);
        rLeg.position.y = -0.42;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.18, -0.65, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.85, 6), this.cosmicVelvetMat);
        lLeg.position.y = -0.42;
        leftHip.add(lLeg);

        root.userData = {
            bodyGroup, torso, head: headGroup, headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            weapon: starlightStaff, rightArm: rArm, leftArm: lArm,
            rightLeg: rLeg, leftLeg: lLeg
        };
        return root;
    }

    // 5. OMEN OGRE (HORN-ENCRUSTED BRUTE TITAN)
    createOmenOgre(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const scale = (mobDef && mobDef.scale) || 1.55;
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.1;
        bodyGroup.scale.set(scale, scale, scale);
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // Heavy Hulking Titan Torso
        const chest = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.25, 0.65), this.omenFleshMat);
        chest.castShadow = true;
        torso.add(chest);

        // Jagged Horn Clusters bursting through shoulders & upper back
        for (let i = 0; i < 6; i++) {
            const h = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.55, 4), this.omenHornMat);
            const side = (i % 2 === 0) ? 1 : -1;
            h.position.set(side * 0.42, 0.4 - Math.floor(i / 2) * 0.28, -0.32);
            h.rotation.set(-0.6, 0, side * 0.5);
            torso.add(h);
        }

        // Spiked Iron Collar
        const collar = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.08, 6, 10), this.abductorIronMat);
        collar.position.y = 0.65;
        collar.rotation.x = Math.PI / 2;
        torso.add(collar);

        // Brutal Head wrapped in spiraling horns
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.88, 0.1);
        torso.add(headGroup);

        const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.45), this.omenFleshMat);
        headGroup.add(headMesh);

        // Massive ram-like curved horns
        const mainHornL = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.08, 5, 8, Math.PI), this.omenHornMat);
        mainHornL.position.set(-0.35, 0.2, 0);
        mainHornL.rotation.set(0.3, 0.4, 0.5);
        headGroup.add(mainHornL);

        const mainHornR = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.08, 5, 8, Math.PI), this.omenHornMat);
        mainHornR.position.set(0.35, 0.2, 0);
        mainHornR.rotation.set(0.3, -0.4, -0.5);
        headGroup.add(mainHornR);

        // Bloodshot Red Eyes
        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.08), this.magmaGlowMat);
        eyeL.position.set(-0.12, 0.05, 0.24);
        headGroup.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.08), this.magmaGlowMat);
        eyeR.position.set(0.12, 0.05, 0.24);
        headGroup.add(eyeR);

        // Right Arm & Barbed Omen Butcher Cleaver
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.68, 0.45, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.95, 0.24), this.omenFleshMat);
        rArm.position.y = -0.48;
        rightShoulder.add(rArm);

        const omenCleaver = new THREE.Group();
        omenCleaver.position.set(0.12, -0.92, 0.25);
        omenCleaver.rotation.x = 0.72;
        const cleaverBlade = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.2, 0.55), this.rustedIronMat);
        cleaverBlade.position.y = 1.0;
        omenCleaver.add(cleaverBlade);
        const cleaverBarbs = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.8, 0.08), this.abductorBladeMat);
        cleaverBarbs.position.set(0, 1.0, 0.3);
        omenCleaver.add(cleaverBarbs);
        rightShoulder.add(omenCleaver);

        // Left Arm with Spiked Iron Fist Manacle
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.68, 0.45, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.95, 0.24), this.omenFleshMat);
        lArm.position.y = -0.48;
        leftShoulder.add(lArm);
        const manacle = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, 0.3), this.abductorIronMat);
        manacle.position.y = -0.92;
        leftShoulder.add(manacle);

        // Colossal Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.28, -0.65, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.95, 0.26), this.omenFleshMat);
        rLeg.position.y = -0.48;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.28, -0.65, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.95, 0.26), this.omenFleshMat);
        lLeg.position.y = -0.48;
        leftHip.add(lLeg);

        root.userData = {
            bodyGroup, torso, head: headGroup, headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            weapon: omenCleaver, rightArm: rArm, leftArm: lArm,
            rightLeg: rLeg, leftLeg: lLeg
        };
        return root;
    }

    // 6. ARACHNID SCUTTLER (MULTI-LEGGED VENOM STINGER BEAST)
    createArachnidScuttler(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const scale = (mobDef && mobDef.scale) || 1.35;
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 0.55;
        bodyGroup.scale.set(scale, scale, scale);
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // Segmented Chitinous Carapace
        const carapace = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.45, 1.25), this.arachnidChitinMat);
        carapace.castShadow = true;
        torso.add(carapace);

        // Head & Mandibles
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.1, 0.72);
        torso.add(headGroup);

        const cephalon = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.45), this.arachnidChitinMat);
        headGroup.add(cephalon);

        // 6 Glowing Crimson Spider Eyes
        for (let i = 0; i < 6; i++) {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), this.calamityEyeMat);
            const side = (i % 2 === 0) ? 1 : -1;
            eye.position.set(side * (0.09 + Math.floor(i / 2) * 0.08), 0.12 - (i % 2) * 0.05, 0.24);
            headGroup.add(eye);
        }

        // Pincer Mandibles
        const mandL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.35, 4), this.abductorBladeMat);
        mandL.position.set(-0.2, -0.1, 0.35);
        mandL.rotation.set(0.6, 0, 0.3);
        headGroup.add(mandL);

        const mandR = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.35, 4), this.abductorBladeMat);
        mandR.position.set(0.2, -0.1, 0.35);
        mandR.rotation.set(0.6, 0, -0.3);
        headGroup.add(mandR);

        // Arching Venom Stinger Tail
        const tailGroup = new THREE.Group();
        tailGroup.position.set(0, 0.2, -0.65);
        torso.add(tailGroup);

        // 3 Curved Segments arching up and forward
        const tailSeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.75, 6), this.arachnidChitinMat);
        tailSeg1.position.set(0, 0.45, -0.2);
        tailSeg1.rotation.x = -0.55;
        tailGroup.add(tailSeg1);

        const tailSeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.75, 6), this.arachnidChitinMat);
        tailSeg2.position.set(0, 1.0, -0.1);
        tailSeg2.rotation.x = 0.55;
        tailGroup.add(tailSeg2);

        // Glowing Toxic Venom Stinger Tip
        const stinger = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.42, 5), this.venomGlowMat);
        stinger.position.set(0, 1.35, 0.2);
        stinger.rotation.x = 1.6;
        tailGroup.add(stinger);

        // 6 Jointed Scuttling Legs
        for (let i = 0; i < 3; i++) {
            const zOff = 0.35 - i * 0.35;
            // Left leg
            const legGroupL = new THREE.Group();
            legGroupL.position.set(-0.45, 0, zOff);
            const femurL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.75, 5), this.arachnidChitinMat);
            femurL.position.set(-0.35, 0.25, 0);
            femurL.rotation.z = -0.7;
            legGroupL.add(femurL);
            const tibiaL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 0.85, 4), this.arachnidChitinMat);
            tibiaL.position.set(-0.65, -0.25, 0);
            tibiaL.rotation.z = 0.45;
            legGroupL.add(tibiaL);
            torso.add(legGroupL);

            // Right leg
            const legGroupR = new THREE.Group();
            legGroupR.position.set(0.45, 0, zOff);
            const femurR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.75, 5), this.arachnidChitinMat);
            femurR.position.set(0.35, 0.25, 0);
            femurR.rotation.z = 0.7;
            legGroupR.add(femurR);
            const tibiaR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 0.85, 4), this.arachnidChitinMat);
            tibiaR.position.set(0.65, -0.25, 0);
            tibiaR.rotation.z = -0.45;
            legGroupR.add(tibiaR);
            torso.add(legGroupR);
        }

        // Standard dummy joints for animation system
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.4, 0.1, 0.3);
        torso.add(rightShoulder);
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.4, 0.1, 0.3);
        torso.add(leftShoulder);
        const rightHip = new THREE.Group();
        rightHip.position.set(0.4, -0.1, -0.3);
        torso.add(rightHip);
        const leftHip = new THREE.Group();
        leftHip.position.set(-0.4, -0.1, -0.3);
        torso.add(leftHip);

        root.userData = {
            bodyGroup, torso, head: headGroup, headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            weapon: stinger, tailGroup
        };
        return root;
    }


    // ====================================================
    // ADVANCED 3D MOB MODELS: 17 ICONIC SOULSBORNE MOBS
    // ====================================================

    // 1. LIVING WARRIOR JAR (IRON FIST ALEXANDER ARCHETYPE)
    createLivingJarMob(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const scale = (mobDef && mobDef.scale) || 1.15;
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 0.75;
        bodyGroup.scale.set(scale, scale, scale);
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        const potMat = this.jarTerracottaMat || this.quiltedSkirtMat;
        const sealMat = this.jarWaxSealMat || this.clothMat;
        const goldMat = this.jarGoldMat || this.goldTrimMat;

        // Terracotta Belly Pot
        const bellyGeo = new THREE.CylinderGeometry(0.85, 0.58, 1.35, 16);
        const belly = new THREE.Mesh(bellyGeo, potMat);
        belly.castShadow = true;
        belly.receiveShadow = true;
        torso.add(belly);

        // Bulging Midsection Torus Fillet
        const midTorus = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.09, 8, 20), potMat);
        midTorus.rotation.x = Math.PI / 2;
        midTorus.position.y = 0.05;
        torso.add(midTorus);

        // Pot Upper Lip Collar
        const lip = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.16, 16), potMat);
        lip.position.y = 0.72;
        torso.add(lip);

        // Sealing Wax Lid
        const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.12, 16), sealMat);
        lid.position.y = 0.82;
        torso.add(lid);

        // Wax Dripping Lip
        for (let d = 0; d < 5; d++) {
            const dripAng = (d / 5) * Math.PI * 2;
            const drip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.18, 5), sealMat);
            drip.position.set(Math.cos(dripAng) * 0.68, 0.72, Math.sin(dripAng) * 0.68);
            drip.rotation.z = Math.PI;
            torso.add(drip);
        }

        // Ornate Red Wax Front Crest Emblem
        const crest = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.05, 12), sealMat);
        crest.position.set(0, 0.15, 0.88);
        crest.rotation.x = Math.PI / 2;
        torso.add(crest);

        const crestRing = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 6, 16), goldMat);
        crestRing.position.set(0, 0.15, 0.90);
        torso.add(crestRing);

        // Golden Kintsugi Repair Vein
        const crack = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.65, 0.03), goldMat);
        crack.position.set(0.35, 0.1, 0.78);
        crack.rotation.z = 0.4;
        torso.add(crack);

        // Head Knot on Lid
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.92, 0);
        torso.add(headGroup);
        const knot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.14, 8), sealMat);
        headGroup.add(knot);

        // Chunky Clay Pugilist Arms
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.88, 0.35, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.65, 8), potMat);
        rArm.position.y = -0.28;
        rArm.rotation.z = -0.35;
        rArm.castShadow = true;
        rightShoulder.add(rArm);
        const rFist = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), potMat);
        rFist.position.set(0.15, -0.62, 0.25);
        rightShoulder.add(rFist);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.88, 0.35, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.65, 8), potMat);
        lArm.position.y = -0.28;
        lArm.rotation.z = 0.35;
        lArm.castShadow = true;
        leftShoulder.add(lArm);
        const lFist = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), potMat);
        lFist.position.set(-0.15, -0.62, 0.25);
        leftShoulder.add(lFist);

        // Stout Clay Foot Pegs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.38, -0.68, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.38, 8), potMat);
        rLeg.position.y = -0.15;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.38, -0.68, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.38, 8), potMat);
        lLeg.position.y = -0.15;
        leftHip.add(lLeg);

        root.userData = {
            def: mobDef,
            bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: rFist
        };
        this.scene.add(root);
        return root;
    }

    // 2. BELFRY WINGED GARGOYLE MOB
    createBelfryGargoyleMob(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.25;
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        const stoneMat = this.gargoyleStoneMat || this.stoneMat;
        const bronzeMat = this.gargoyleBronzeMat || this.darkSteelMat;

        // Muscular Chiseled Stone Torso
        const chest = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.85, 0.45), stoneMat);
        chest.castShadow = true;
        torso.add(chest);

        // Head with Devil Horns & Pointed Ears
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.62, 0.08);
        torso.add(headGroup);

        const gargHead = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.38), stoneMat);
        headGroup.add(gargHead);

        const lHorn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.45, 5), bronzeMat);
        lHorn.position.set(-0.18, 0.32, -0.08);
        lHorn.rotation.x = -0.45;
        lHorn.rotation.z = -0.35;
        headGroup.add(lHorn);

        const rHorn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.45, 5), bronzeMat);
        rHorn.position.set(0.18, 0.32, -0.08);
        rHorn.rotation.x = -0.45;
        rHorn.rotation.z = 0.35;
        headGroup.add(rHorn);

        // Glowing Amber Gargoyle Eyes
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xff6600, emissiveIntensity: 0.8 });
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 5, 5), eyeMat);
        eyeL.position.set(-0.11, 0.06, 0.20);
        headGroup.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.05, 5, 5), eyeMat);
        eyeR.position.set(0.11, 0.06, 0.20);
        headGroup.add(eyeR);

        // Dual Stone Bat Wings Spanning 2.2m
        const wingL = new THREE.Group();
        wingL.position.set(-0.35, 0.25, -0.22);
        wingL.rotation.y = 0.45;
        wingL.rotation.z = 0.25;
        torso.add(wingL);
        const boneL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.25, 6), stoneMat);
        boneL.position.set(-0.55, 0.25, 0);
        boneL.rotation.z = Math.PI / 3;
        wingL.add(boneL);
        const membraneL = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.75, 0.04), stoneMat);
        membraneL.position.set(-0.48, -0.08, 0);
        wingL.add(membraneL);

        const wingR = new THREE.Group();
        wingR.position.set(0.35, 0.25, -0.22);
        wingR.rotation.y = -0.45;
        wingR.rotation.z = -0.25;
        torso.add(wingR);
        const boneR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.25, 6), stoneMat);
        boneR.position.set(0.55, 0.25, 0);
        boneR.rotation.z = -Math.PI / 3;
        wingR.add(boneR);
        const membraneR = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.75, 0.04), stoneMat);
        membraneR.position.set(0.48, -0.08, 0);
        wingR.add(membraneR);

        // Gargoyle Tail
        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.1, 1.1, 6), stoneMat);
        tail.position.set(0, -0.4, -0.42);
        tail.rotation.x = -0.85;
        torso.add(tail);

        // Arms & Bronze Battle Halberd
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.48, 0.28, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.85, 6), stoneMat);
        rArm.position.y = -0.38;
        rightShoulder.add(rArm);

        // Halberd Weapon
        const halberd = new THREE.Group();
        halberd.position.set(0.12, -0.72, 0.35);
        halberd.rotation.x = 0.45;
        rightShoulder.add(halberd);
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.3, 6), bronzeMat);
        halberd.add(shaft);
        const axeBlade = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.05), bronzeMat);
        axeBlade.position.set(0.24, 0.82, 0);
        halberd.add(axeBlade);
        const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.45, 4), bronzeMat);
        spearTip.position.y = 1.35;
        halberd.add(spearTip);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.48, 0.28, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.85, 6), stoneMat);
        lArm.position.y = -0.38;
        leftShoulder.add(lArm);

        // Legs with Stone Talons
        const rightHip = new THREE.Group();
        rightHip.position.set(0.24, -0.48, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.9, 6), stoneMat);
        rLeg.position.y = -0.42;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.24, -0.48, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.9, 6), stoneMat);
        lLeg.position.y = -0.42;
        leftHip.add(lLeg);

        root.userData = {
            def: mobDef,
            bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: halberd
        };
        this.scene.add(root);
        return root;
    }

    // 3. CURSED BASILISK / POISON TOAD
    createCursedBasilisk(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 0.52;
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        const skinMat = this.basiliskSkinMat || this.hollowSkinMat;
        const eyeMat = this.basiliskEyeMat || this.gorgonRubyEyeMat;
        const gasMat = this.curseMistMat || this.nitoMiasmaMat;

        // Broad Crouching Amphibian Torso
        const belly = new THREE.Mesh(new THREE.SphereGeometry(0.72, 12, 8), skinMat);
        belly.scale.set(1.15, 0.65, 1.35);
        belly.castShadow = true;
        torso.add(belly);

        // Head with Real Jaws & Huge Bulbous Fake Yellow Eyes
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.22, 0.65);
        torso.add(headGroup);

        const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.32, 0.62), skinMat);
        headGroup.add(jaw);

        // Giant Bulbous False Eyes
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), eyeMat);
        eyeL.position.set(-0.32, 0.36, 0.08);
        headGroup.add(eyeL);

        const pupilL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 6), this.darkSteelMat);
        pupilL.position.set(-0.32, 0.36, 0.34);
        pupilL.rotation.x = Math.PI / 2;
        headGroup.add(pupilL);

        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), eyeMat);
        eyeR.position.set(0.32, 0.36, 0.08);
        headGroup.add(eyeR);

        const pupilR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 6), this.darkSteelMat);
        pupilR.position.set(0.32, 0.36, 0.34);
        pupilR.rotation.x = Math.PI / 2;
        headGroup.add(pupilR);

        // Bloated Purple Curse Gas Throat Sac
        const throatSac = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), gasMat);
        throatSac.position.set(0, -0.18, 0.32);
        throatSac.scale.set(1.2, 0.8, 1.1);
        headGroup.add(throatSac);

        const sacLight = new THREE.PointLight(0x8800bb, 1.4, 4.0);
        sacLight.position.set(0, -0.18, 0.42);
        headGroup.add(sacLight);

        // Splayed Reptile Crawling Forelegs
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.65, 0.05, 0.42);
        torso.add(rightShoulder);
        const rForeleg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.65, 6), skinMat);
        rForeleg.position.set(0.22, -0.25, 0.12);
        rForeleg.rotation.z = -0.7;
        rightShoulder.add(rForeleg);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.65, 0.05, 0.42);
        torso.add(leftShoulder);
        const lForeleg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.65, 6), skinMat);
        lForeleg.position.set(-0.22, -0.25, 0.12);
        lForeleg.rotation.z = 0.7;
        leftShoulder.add(lForeleg);

        // Splayed Hind Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.62, 0.05, -0.45);
        torso.add(rightHip);
        const rHindleg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.11, 0.7, 6), skinMat);
        rHindleg.position.set(0.24, -0.25, -0.1);
        rHindleg.rotation.z = -0.75;
        rightHip.add(rHindleg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.62, 0.05, -0.45);
        torso.add(leftHip);
        const lHindleg = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.11, 0.7, 6), skinMat);
        lHindleg.position.set(-0.22, -0.25, -0.1);
        lHindleg.rotation.z = 0.75;
        leftHip.add(lHindleg);

        root.userData = {
            def: mobDef,
            bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: throatSac
        };
        this.scene.add(root);
        return root;
    }

    // 4. DECAPITATED TITANITE DEMON WITH CATCH POLE
    createTitaniteDemonMob(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.35;
        bodyGroup.scale.set(1.35, 1.35, 1.35);
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        const stoneMat = this.titaniteStoneMat || this.darkSteelMat;
        const glowMat = this.titaniteGlowMat || this.moonlightMat;
        const ironMat = this.darkSteelMat;

        // Headless Jagged Stone Torso
        const chest = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.15, 0.58), stoneMat);
        chest.castShadow = true;
        torso.add(chest);

        // Jagged Decapitated Neck Stump with Single Horn
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.65, 0);
        torso.add(headGroup);

        const neckStump = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.28, 7), stoneMat);
        headGroup.add(neckStump);

        const singleHorn = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.65, 5), ironMat);
        singleHorn.position.set(0.18, 0.35, -0.1);
        singleHorn.rotation.z = 0.35;
        headGroup.add(singleHorn);

        // Titanite Mineral Nodules Embedded in Chest
        for (let t = 0; t < 4; t++) {
            const nodule = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12), glowMat);
            nodule.position.set((t % 2 === 0 ? 0.22 : -0.22), 0.35 - t * 0.22, 0.32);
            torso.add(nodule);
        }

        const titaniteLight = new THREE.PointLight(0x00ffcc, 1.5, 6.0);
        titaniteLight.position.set(0, 0.2, 0.45);
        torso.add(titaniteLight);

        // Right Arm Wielding Titanite Catch Pole
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.68, 0.38, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 1.05, 6), stoneMat);
        rArm.position.y = -0.45;
        rightShoulder.add(rArm);

        // Titanite Catch Pole (Three Curved Wicked Prongs)
        const catchPole = new THREE.Group();
        catchPole.position.set(0.2, -0.85, 0.4);
        catchPole.rotation.x = 0.35;
        rightShoulder.add(catchPole);

        const poleShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 6), ironMat);
        catchPole.add(poleShaft);

        // Center Prong & Dual Curved Barbs
        const centerTip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.65, 4), ironMat);
        centerTip.position.y = 1.9;
        catchPole.add(centerTip);

        const leftBarb = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 4, 10, Math.PI * 0.65), ironMat);
        leftBarb.position.set(-0.25, 1.6, 0);
        catchPole.add(leftBarb);

        const rightBarb = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 4, 10, Math.PI * 0.65), ironMat);
        rightBarb.position.set(0.25, 1.6, 0);
        rightBarb.rotation.y = Math.PI;
        catchPole.add(rightBarb);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.68, 0.38, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 1.05, 6), stoneMat);
        lArm.position.y = -0.45;
        leftShoulder.add(lArm);

        // Left Leg Missing - Broken Carved Stone Stump Pedestal
        const leftHip = new THREE.Group();
        leftHip.position.set(-0.35, -0.62, 0);
        torso.add(leftHip);
        const stumpPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.38, 0.68, 6), stoneMat);
        stumpPedestal.position.y = -0.28;
        leftHip.add(stumpPedestal);

        // Right Leg Heavy Stone Foot
        const rightHip = new THREE.Group();
        rightHip.position.set(0.35, -0.62, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 1.15, 6), stoneMat);
        rLeg.position.y = -0.55;
        rightHip.add(rLeg);

        root.userData = {
            def: mobDef,
            bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: catchPole
        };
        this.scene.add(root);
        return root;
    }

    // 5. CHANNELER SORCERER OF SEATH
    createChannelerSorcererMob(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.05;
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        const silkMat = this.channelerSilkMat || this.goldTrimMat;
        const goldMat = this.jarGoldMat || this.goldTrimMat;
        const gemMat = this.moonlightMat;

        // Flowing Robed Torso
        const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.62, 1.45, 10), silkMat);
        robe.castShadow = true;
        torso.add(robe);

        // Ceremonial Six-Eyed Hexagonal Tricorn Headdress
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.88, 0);
        torso.add(headGroup);

        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), silkMat);
        headGroup.add(headMesh);

        // Wide Flared Tricorn Brim
        const tricorn = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.35, 6), silkMat);
        tricorn.position.y = 0.25;
        headGroup.add(tricorn);

        // Six Mystical Painted Eyes
        for (let e = 0; e < 6; e++) {
            const ang = (e / 6) * Math.PI * 2;
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), goldMat);
            eye.position.set(Math.cos(ang) * 0.38, 0.18, Math.sin(ang) * 0.38);
            headGroup.add(eye);
        }

        // Channeler's Trident Staff
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.48, 0.45, 0);
        torso.add(rightShoulder);

        const rSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.75, 8), silkMat);
        rSleeve.position.y = -0.32;
        rightShoulder.add(rSleeve);

        const trident = new THREE.Group();
        trident.position.set(0.15, -0.65, 0.25);
        trident.rotation.x = 0.25;
        rightShoulder.add(trident);

        const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.5, 8), goldMat);
        trident.add(staff);

        // Triple Prongs
        const centerProng = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.45, 4), goldMat);
        centerProng.position.y = 1.45;
        trident.add(centerProng);

        const prongL = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.40, 4), goldMat);
        prongL.position.set(-0.16, 1.35, 0);
        prongL.rotation.z = -0.2;
        trident.add(prongL);

        const prongR = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.40, 4), goldMat);
        prongR.position.set(0.16, 1.35, 0);
        prongR.rotation.z = 0.2;
        trident.add(prongR);

        // Central Channeler Crystal
        const crystal = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12), gemMat);
        crystal.position.y = 1.15;
        trident.add(crystal);

        const crystalLight = new THREE.PointLight(0x00e5ff, 1.4, 5.0);
        crystalLight.position.y = 1.15;
        trident.add(crystalLight);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.48, 0.45, 0);
        torso.add(leftShoulder);
        const lSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.75, 8), silkMat);
        lSleeve.position.y = -0.32;
        leftShoulder.add(lSleeve);

        const rightHip = new THREE.Group();
        rightHip.position.set(0.2, -0.75, 0);
        torso.add(rightHip);
        const leftHip = new THREE.Group();
        leftHip.position.set(-0.2, -0.75, 0);
        torso.add(leftHip);

        root.userData = {
            def: mobDef,
            bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: trident
        };
        this.scene.add(root);
        return root;
    }

    // 6. QUADRUPED SKELETAL BEAST OF THE TOMB
    createSkeletalBeastMob(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 0.62;
        bodyGroup.scale.set(1.25, 1.25, 1.25);
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        const boneMat = this.bonePaleMat || this.boneMat;

        // Long Segmented Vertebra Spine
        for (let s = 0; s < 7; s++) {
            const vert = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.24), boneMat);
            vert.position.set(0, 0.15 - s * 0.04, -0.65 + s * 0.22);
            torso.add(vert);
        }

        // Exposed Curved Rib Cage
        for (let r = 0; r < 5; r++) {
            const rib = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.04, 4, 10, Math.PI * 0.85), boneMat);
            rib.rotation.y = Math.PI / 2;
            rib.rotation.z = -Math.PI / 2.3;
            rib.position.set(0, -0.05, -0.35 + r * 0.2);
            torso.add(rib);
        }

        // Elongated Canine Predator Skull with Razor Fangs
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.15, 0.85);
        torso.add(headGroup);

        const skull = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, 0.58), boneMat);
        headGroup.add(skull);

        // Jaw & Interlocking Fangs
        const lowerJaw = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.52), boneMat);
        lowerJaw.position.set(0, -0.18, 0.06);
        headGroup.add(lowerJaw);

        for (let f = 0; f < 4; f++) {
            const fang = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.16, 4), boneMat);
            fang.position.set((f % 2 === 0 ? 0.14 : -0.14), -0.12, 0.18 + (f > 1 ? 0.12 : 0));
            fang.rotation.x = Math.PI;
            headGroup.add(fang);
        }

        // Hollow Glowing Eye Sockets
        const eyeGlow = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 0.9 });
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), eyeGlow);
        eyeL.position.set(-0.12, 0.12, 0.22);
        headGroup.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), eyeGlow);
        eyeR.position.set(0.12, 0.12, 0.22);
        headGroup.add(eyeR);

        // Four Spindly Jointed Bone Limbs
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.42, 0.05, 0.45);
        torso.add(rightShoulder);
        const rFore = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.85, 6), boneMat);
        rFore.position.set(0.1, -0.35, 0);
        rFore.rotation.z = -0.35;
        rightShoulder.add(rFore);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.42, 0.05, 0.45);
        torso.add(leftShoulder);
        const lFore = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.85, 6), boneMat);
        lFore.position.set(-0.1, -0.35, 0);
        lFore.rotation.z = 0.35;
        leftShoulder.add(lFore);

        const rightHip = new THREE.Group();
        rightHip.position.set(0.38, 0.05, -0.55);
        torso.add(rightHip);
        const rHind = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.9, 6), boneMat);
        rHind.position.set(0.12, -0.38, -0.05);
        rHind.rotation.z = -0.4;
        rightHip.add(rHind);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.38, 0.05, -0.55);
        torso.add(leftHip);
        const lHind = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.9, 6), boneMat);
        lHind.position.set(-0.12, -0.38, -0.05);
        lHind.rotation.z = 0.4;
        leftHip.add(lHind);

        root.userData = {
            def: mobDef,
            bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: skull
        };
        this.scene.add(root);
        return root;
    }

    // 7. DARKROOT TREANT BARK GUARDIAN
    createTreantBarkGuardian(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const scale = (mobDef && mobDef.scale) || 1.35;
        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.3;
        bodyGroup.scale.set(scale, scale, scale);
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        const barkMat = this.mobTreantBarkMat || this.woodMat;
        const foliageMat = this.mobTreantFoliageMat || this.ivyMat;

        // Gnarled Tree Trunk Torso
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.72, 1.45, 8), barkMat);
        trunk.castShadow = true;
        torso.add(trunk);

        // Canopy Crown of Coniferous Pine Leaves
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.95, 0);
        torso.add(headGroup);

        const woodHead = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.45, 7), barkMat);
        headGroup.add(woodHead);

        const canopyCrown = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.1, 7), foliageMat);
        canopyCrown.position.y = 0.55;
        headGroup.add(canopyCrown);

        // Glowing Forest Eyes
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x39ff14, emissive: 0x22cc00, emissiveIntensity: 0.9 });
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 4, 4), eyeMat);
        eyeL.position.set(-0.16, 0.05, 0.28);
        headGroup.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.05, 4, 4), eyeMat);
        eyeR.position.set(0.16, 0.05, 0.28);
        headGroup.add(eyeR);

        // Right Arm Spiked Timber Branch Club
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.68, 0.45, 0);
        torso.add(rightShoulder);

        const rBranch = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.95, 6), barkMat);
        rBranch.position.y = -0.42;
        rightShoulder.add(rBranch);

        const timberClub = new THREE.Group();
        timberClub.position.set(0.15, -0.85, 0.25);
        timberClub.rotation.x = 0.4;
        rightShoulder.add(timberClub);

        const clubShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 1.9, 7), barkMat);
        timberClub.add(clubShaft);

        for (let b = 0; b < 5; b++) {
            const twig = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.35, 4), barkMat);
            twig.position.set((b % 2 === 0 ? 0.18 : -0.18), 0.35 + b * 0.25, 0);
            twig.rotation.z = (b % 2 === 0 ? 0.85 : -0.85);
            timberClub.add(twig);
        }

        // Left Arm Foliage Shield Branch
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.68, 0.45, 0);
        torso.add(leftShoulder);
        const lBranch = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.95, 6), barkMat);
        lBranch.position.y = -0.42;
        leftShoulder.add(lBranch);
        const foliageShield = new THREE.Mesh(new THREE.SphereGeometry(0.42, 6, 6), foliageMat);
        foliageShield.position.set(-0.25, -0.55, 0.15);
        leftShoulder.add(foliageShield);

        // Heavy Gnarled Root Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.35, -0.75, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.95, 6), barkMat);
        rLeg.position.y = -0.45;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.35, -0.75, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.32, 0.95, 6), barkMat);
        lLeg.position.y = -0.45;
        leftHip.add(lLeg);

        root.userData = {
            def: mobDef,
            bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: timberClub
        };
        this.scene.add(root);
        return root;
    }

    // 8. ANCIENT STONE GUARDIAN WITH COLOSSAL GREATSWORD
    createAncientStoneGuardianMob(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.35;
        bodyGroup.scale.set(1.3, 1.3, 1.3);
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        const stoneMat = this.mobStoneKnightMat || this.stoneMat;
        const runeMat = this.stoneRuneMat || this.mobCrystalMat;

        // Heavy Stone Slab Cuirass
        const chest = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.1, 0.55), stoneMat);
        chest.castShadow = true;
        torso.add(chest);

        // Cylindrical Stone Helm with Glowing Visor Slit
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.78, 0);
        torso.add(headGroup);

        const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.45, 8), stoneMat);
        headGroup.add(helm);

        const slitMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00cc66, emissiveIntensity: 0.9 });
        const visorSlit = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.05), slitMat);
        visorSlit.position.set(0, 0.05, 0.28);
        headGroup.add(visorSlit);

        // Colossal Stone Greatsword on Shoulder
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.62, 0.38, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.95, 6), stoneMat);
        rArm.position.y = -0.42;
        rightShoulder.add(rArm);

        const greatsword = new THREE.Group();
        greatsword.position.set(0.22, 0.2, -0.15);
        greatsword.rotation.x = -0.55;
        greatsword.rotation.z = -0.3;
        rightShoulder.add(greatsword);

        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.6, 0.08), stoneMat);
        blade.position.y = 1.05;
        greatsword.add(blade);

        const crossguard = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.14, 0.14), stoneMat);
        crossguard.position.y = -0.22;
        greatsword.add(crossguard);

        // Massive Pauldrons
        const pauldronR = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.45), stoneMat);
        pauldronR.position.set(0.08, 0.15, 0);
        rightShoulder.add(pauldronR);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.62, 0.38, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.95, 6), stoneMat);
        lArm.position.y = -0.42;
        leftShoulder.add(lArm);

        const pauldronL = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.45), stoneMat);
        pauldronL.position.set(-0.08, 0.15, 0);
        leftShoulder.add(pauldronL);

        // Heavy Stone Greaves
        const rightHip = new THREE.Group();
        rightHip.position.set(0.32, -0.62, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.19, 1.1, 6), stoneMat);
        rLeg.position.y = -0.52;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.32, -0.62, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.19, 1.1, 6), stoneMat);
        lLeg.position.y = -0.52;
        leftHip.add(lLeg);

        root.userData = {
            def: mobDef,
            bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: greatsword
        };
        this.scene.add(root);
        return root;
    }

    // 9. SILVER KNIGHT GREATBOW SNIPER
    createSilverKnightGreatbowMob(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.05;
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        const silverMat = this.mobSilverKnightMat || this.steelMat;
        const ironMat = this.darkSteelMat;

        // Sleek Silver Plate Cuirass
        const chest = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.78, 0.36), silverMat);
        chest.castShadow = true;
        torso.add(chest);

        // Winged Eagle-Crest Armet Helm
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.58, 0);
        torso.add(headGroup);

        const helm = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), silverMat);
        headGroup.add(helm);

        // Eagle Crest Wings
        const wingCrestL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.16), silverMat);
        wingCrestL.position.set(-0.18, 0.18, -0.05);
        wingCrestL.rotation.z = -0.3;
        headGroup.add(wingCrestL);

        const wingCrestR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.16), silverMat);
        wingCrestR.position.set(0.18, 0.18, -0.05);
        wingCrestR.rotation.z = 0.3;
        headGroup.add(wingCrestR);

        // Colossal 2.4m Dragonslayer Greatbow on Back
        const greatbow = new THREE.Group();
        greatbow.position.set(0, 0.1, -0.28);
        greatbow.rotation.z = 0.65;
        torso.add(greatbow);

        const bowArc = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.045, 6, 18, Math.PI * 0.72), ironMat);
        greatbow.add(bowArc);

        const bowString = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 2.2, 4), silverMat);
        bowString.position.x = 0.42;
        greatbow.add(bowString);

        // Right Arm with Silver Sword
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.42, 0.28, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.75, 6), silverMat);
        rArm.position.y = -0.35;
        rightShoulder.add(rArm);

        const sword = new THREE.Group();
        sword.position.set(0.1, -0.68, 0.15);
        sword.rotation.x = 0.35;
        rightShoulder.add(sword);
        const swordBlade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.35, 0.02), silverMat);
        swordBlade.position.y = 0.55;
        sword.add(swordBlade);

        // Left Arm with Silver Kite Shield
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.42, 0.28, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.75, 6), silverMat);
        lArm.position.y = -0.35;
        leftShoulder.add(lArm);

        const kiteShield = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.82, 0.06), silverMat);
        kiteShield.position.set(-0.25, -0.35, 0.18);
        leftShoulder.add(kiteShield);

        // Silver Greaves
        const rightHip = new THREE.Group();
        rightHip.position.set(0.2, -0.45, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.85, 6), silverMat);
        rLeg.position.y = -0.42;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.2, -0.45, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.85, 6), silverMat);
        lLeg.position.y = -0.42;
        leftHip.add(lLeg);

        root.userData = {
            def: mobDef,
            bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: greatbow
        };
        this.scene.add(root);
        return root;
    }

    // 10. ABYSSAL DARKWRAITH INFILTRATOR WITH DARK HAND
    createAbyssalDarkwraithMob(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.05;
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        const darkMat = this.blackKnightMat || this.darkSteelMat;
        const handMat = this.mobDarkHandMat || this.emberGlowMat;

        // Skeletal Skull Mask Helm
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.58, 0);
        torso.add(headGroup);

        const skullHelm = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.35, 0.34), darkMat);
        headGroup.add(skullHelm);

        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xff0022, emissive: 0xff0022, emissiveIntensity: 1.2 });
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), eyeMat);
        eyeL.position.set(-0.1, 0.05, 0.18);
        headGroup.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.04, 4, 4), eyeMat);
        eyeR.position.set(0.1, 0.05, 0.18);
        headGroup.add(eyeR);

        // Ribbed Skeletal Cuirass & Tattered Cowl
        const chest = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.75, 0.36), darkMat);
        chest.castShadow = true;
        torso.add(chest);

        for (let r = 0; r < 3; r++) {
            const rib = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.08), darkMat);
            rib.position.set(0, 0.15 - r * 0.16, 0.19);
            torso.add(rib);
        }

        // Right Arm Wielding Jagged Dark Sword
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.42, 0.28, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.75, 6), darkMat);
        rArm.position.y = -0.35;
        rightShoulder.add(rArm);

        const darkSword = new THREE.Group();
        darkSword.position.set(0.1, -0.65, 0.2);
        darkSword.rotation.x = 0.35;
        rightShoulder.add(darkSword);
        const darkBlade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.45, 0.03), darkMat);
        darkBlade.position.y = 0.65;
        darkSword.add(darkBlade);

        // Left Arm with Crimson Dark Hand Energy Shield Vortex
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.42, 0.28, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.75, 6), darkMat);
        lArm.position.y = -0.35;
        leftShoulder.add(lArm);

        const darkHandDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.04, 14), handMat);
        darkHandDisc.position.set(-0.18, -0.45, 0.2);
        darkHandDisc.rotation.x = Math.PI / 2;
        leftShoulder.add(darkHandDisc);

        const darkHandLight = new THREE.PointLight(0xff0033, 1.5, 4.0);
        darkHandLight.position.set(-0.18, -0.45, 0.28);
        leftShoulder.add(darkHandLight);

        // Dark Greaves
        const rightHip = new THREE.Group();
        rightHip.position.set(0.2, -0.45, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.85, 6), darkMat);
        rLeg.position.y = -0.42;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.2, -0.45, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.85, 6), darkMat);
        lLeg.position.y = -0.42;
        leftHip.add(lLeg);

        root.userData = {
            def: mobDef,
            bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: darkSword
        };
        this.scene.add(root);
        return root;
    }

    // 11. CORVIAN CROW DEMON WITH REAPER SCYTHE
    createCrowDemonMob(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.1;
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        const featherMat = this.crowFeatherMat || this.clothMat;
        const ironMat = this.rustedIronMat || this.darkSteelMat;

        // Hunched Avian Torso
        const chest = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.85, 0.42), featherMat);
        chest.rotation.x = 0.25;
        chest.castShadow = true;
        torso.add(chest);

        // Long Raven Beak Mask
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.62, 0.15);
        torso.add(headGroup);

        const crowHead = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), featherMat);
        headGroup.add(crowHead);

        const beak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.55, 4), ironMat);
        beak.position.set(0, -0.05, 0.35);
        beak.rotation.x = Math.PI / 2.1;
        beak.rotation.y = Math.PI / 4;
        headGroup.add(beak);

        // Feathered Wing Arms
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.42, 0.32, 0);
        torso.add(rightShoulder);

        const rWing = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.75, 0.42), featherMat);
        rWing.position.y = -0.35;
        rightShoulder.add(rWing);

        // 2.2m Curved Reaper Scythe
        const scythe = new THREE.Group();
        scythe.position.set(0.15, -0.7, 0.25);
        scythe.rotation.x = 0.35;
        rightShoulder.add(scythe);

        const scytheShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 2.2, 6), ironMat);
        scythe.add(scytheShaft);

        const scytheBlade = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.16, 0.02), ironMat);
        scytheBlade.position.set(0.38, 1.05, 0);
        scytheBlade.rotation.z = -0.3;
        scythe.add(scytheBlade);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.42, 0.32, 0);
        torso.add(leftShoulder);
        const lWing = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.75, 0.42), featherMat);
        lWing.position.y = -0.35;
        leftShoulder.add(lWing);

        // Avian Talon Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.2, -0.45, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.9, 6), ironMat);
        rLeg.position.y = -0.45;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.2, -0.45, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.9, 6), ironMat);
        lLeg.position.y = -0.45;
        leftHip.add(lLeg);

        root.userData = {
            def: mobDef,
            bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: scythe
        };
        this.scene.add(root);
        return root;
    }

    // 12. NEW LONDO GHOST BANSHEE (HOVERING SPECTRE)
    createNewLondoGhostMob(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y + 0.65, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 0.85;
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        const ghostMat = this.mobGhostMat || new THREE.MeshStandardMaterial({
            color: 0x66ccff,
            emissive: 0x0088cc,
            emissiveIntensity: 0.85,
            transparent: true,
            opacity: 0.72
        });

        // Translucent Floating Phantom Shroud
        const shroud = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.6, 8, 1, true), ghostMat);
        shroud.rotation.x = Math.PI;
        shroud.position.y = -0.2;
        torso.add(shroud);

        // Veiled Skeletal Head with Floating Hair
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.75, 0);
        torso.add(headGroup);

        const skull = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), ghostMat);
        headGroup.add(skull);

        // Spectral Ambient Light
        const ghostLight = new THREE.PointLight(0x00e5ff, 1.8, 6.0);
        ghostLight.position.set(0, 0.2, 0);
        torso.add(ghostLight);

        // Twin Spectral Jagged Blades
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.42, 0.35, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.75, 6), ghostMat);
        rArm.position.y = -0.35;
        rightShoulder.add(rArm);
        const rBlade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.85, 0.02), ghostMat);
        rBlade.position.set(0.08, -0.65, 0.2);
        rBlade.rotation.x = 0.55;
        rightShoulder.add(rBlade);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.42, 0.35, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.75, 6), ghostMat);
        lArm.position.y = -0.35;
        leftShoulder.add(lArm);
        const lBlade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.85, 0.02), ghostMat);
        lBlade.position.set(-0.08, -0.65, 0.2);
        lBlade.rotation.x = 0.55;
        leftShoulder.add(lBlade);

        const rightHip = new THREE.Group();
        rightHip.position.set(0.18, -0.4, 0);
        torso.add(rightHip);
        const leftHip = new THREE.Group();
        leftHip.position.set(-0.18, -0.4, 0);
        torso.add(leftHip);

        root.userData = {
            def: mobDef,
            bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: rBlade
        };
        this.scene.add(root);
        return root;
    }

    // 13. TORTURE WHEEL SKELETON
    createWheelSkeletonMob(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 0.85;
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        const boneMat = this.bonePaleMat || this.boneMat;
        const woodMat = this.woodTorchMat || this.woodMat;
        const ironMat = this.darkSteelMat;

        // Medieval Torture Wheel Frame (Torus + Spokes)
        const wheel = new THREE.Group();
        wheel.position.set(0, 0, 0);
        torso.add(wheel);

        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.08, 8, 20), woodMat);
        rim.castShadow = true;
        wheel.add(rim);

        // 8 Spokes
        for (let s = 0; s < 4; s++) {
            const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.36, 6), woodMat);
            spoke.rotation.z = (s / 4) * Math.PI;
            wheel.add(spoke);
        }

        // 16 Outward Spikes on Rim
        for (let k = 0; k < 16; k++) {
            const ang = (k / 16) * Math.PI * 2;
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.24, 4), ironMat);
            spike.position.set(Math.cos(ang) * 0.78, Math.sin(ang) * 0.78, 0);
            spike.rotation.z = ang - Math.PI / 2;
            wheel.add(spike);
        }

        // Skeletal Skull Peering Through Upper Spokes
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.35, 0.12);
        torso.add(headGroup);

        const skull = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.26), boneMat);
        headGroup.add(skull);

        // Bone Arms Strapped to Wheel Spokes
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.35, 0.15, 0.1);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.65, 6), boneMat);
        rArm.position.y = -0.28;
        rightShoulder.add(rArm);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.35, 0.15, 0.1);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.65, 6), boneMat);
        lArm.position.y = -0.28;
        leftShoulder.add(lArm);

        const rightHip = new THREE.Group();
        rightHip.position.set(0.22, -0.55, 0.05);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.45, 6), boneMat);
        rLeg.position.y = -0.2;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.22, -0.55, 0.05);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.45, 6), boneMat);
        lLeg.position.y = -0.2;
        leftHip.add(lLeg);

        root.userData = {
            def: mobDef,
            bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: rim
        };
        this.scene.add(root);
        return root;
    }

    // 14. FELL OMEN GLADIATOR (ELDEN RING OMEN WARRIOR)
    createFellOmenGladiator(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.35;
        bodyGroup.scale.set(1.4, 1.4, 1.4);
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        const fleshMat = this.omenFleshMat || this.demonFleshMat;
        const hornMat = this.omenHornMat || this.demonHornMat;
        const ironMat = this.darkSteelMat;

        // Hulking Muscular Torso
        const chest = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.15, 0.65), fleshMat);
        chest.castShadow = true;
        torso.add(chest);

        // Head Engulfed in Curled Omen Horns
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.72, 0.1);
        torso.add(headGroup);

        const omenHead = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 8), fleshMat);
        headGroup.add(omenHead);

        // Twisted Crown Horns
        for (let h = 0; h < 4; h++) {
            const side = (h % 2 === 0 ? 1 : -1);
            const horn = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.07, 5, 12, Math.PI * 0.9), hornMat);
            horn.position.set(side * (0.2 + (h > 1 ? 0.12 : 0)), 0.18 + (h > 1 ? 0.15 : 0), -0.05);
            horn.rotation.y = side * 0.65;
            headGroup.add(horn);
        }

        // Heavy Cleaver Greataxe
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.65, 0.45, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.95, 6), fleshMat);
        rArm.position.y = -0.42;
        rightShoulder.add(rArm);

        const axe = new THREE.Group();
        axe.position.set(0.2, -0.85, 0.35);
        axe.rotation.x = 0.45;
        rightShoulder.add(axe);

        const haft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6), ironMat);
        axe.add(haft);
        const cleaverHead = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.85, 0.08), ironMat);
        cleaverHead.position.set(0.32, 0.75, 0);
        axe.add(cleaverHead);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.65, 0.45, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.95, 6), fleshMat);
        lArm.position.y = -0.42;
        leftShoulder.add(lArm);

        // Heavy Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.35, -0.65, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 1.05, 6), fleshMat);
        rLeg.position.y = -0.52;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.35, -0.65, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 1.05, 6), fleshMat);
        lLeg.position.y = -0.52;
        leftHip.add(lLeg);

        root.userData = {
            def: mobDef,
            bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: axe
        };
        this.scene.add(root);
        return root;
    }

    // 15. CRYSTAL DRAKE WHELP
    createCrystalDrakeWhelp(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 0.82;
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        const crystalMat = this.mobCrystalMat || this.moonlightMat;

        // Multifaceted Crystalline Body
        const drakeChest = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65), crystalMat);
        drakeChest.scale.set(0.9, 0.75, 1.35);
        drakeChest.castShadow = true;
        torso.add(drakeChest);

        // Dragon Head with Crystal Horns
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.35, 0.85);
        torso.add(headGroup);

        const drakeHead = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.75, 5), crystalMat);
        drakeHead.rotation.x = -Math.PI / 2.2;
        headGroup.add(drakeHead);

        const lHorn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.45, 4), crystalMat);
        lHorn.position.set(-0.18, 0.25, -0.15);
        lHorn.rotation.x = -0.5;
        headGroup.add(lHorn);

        const rHorn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.45, 4), crystalMat);
        rHorn.position.set(0.18, 0.25, -0.15);
        rHorn.rotation.x = -0.5;
        headGroup.add(rHorn);

        // Crystal Wings
        const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 0.05), crystalMat);
        wingL.position.set(-0.65, 0.35, -0.1);
        wingL.rotation.y = 0.45;
        wingL.rotation.z = 0.35;
        torso.add(wingL);

        const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 0.05), crystalMat);
        wingR.position.set(0.65, 0.35, -0.1);
        wingR.rotation.y = -0.45;
        wingR.rotation.z = -0.35;
        torso.add(wingR);

        // Tail
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.14, 1.25, 5), crystalMat);
        tail.position.set(0, -0.15, -1.05);
        tail.rotation.x = -Math.PI / 2.3;
        torso.add(tail);

        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.45, 0, 0.45);
        torso.add(rightShoulder);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.7, 5), crystalMat);
        rLeg.position.y = -0.32;
        rightShoulder.add(rLeg);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.45, 0, 0.45);
        torso.add(leftShoulder);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.7, 5), crystalMat);
        lLeg.position.y = -0.32;
        leftShoulder.add(lLeg);

        const rightHip = new THREE.Group();
        rightHip.position.set(0.42, 0, -0.45);
        torso.add(rightHip);
        const rRear = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.75, 5), crystalMat);
        rRear.position.y = -0.35;
        rightHip.add(rRear);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.42, 0, -0.45);
        torso.add(leftHip);
        const lRear = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.75, 5), crystalMat);
        lRear.position.y = -0.35;
        leftHip.add(lRear);

        root.userData = {
            def: mobDef,
            bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: drakeHead
        };
        this.scene.add(root);
        return root;
    }

    // 16. CRUCIBLE KNIGHT SENTINEL (SILURIA TREE SPEAR)
    createCrucibleKnightSentinel(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.15;
        bodyGroup.scale.set(1.2, 1.2, 1.2);
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        const goldMat = this.crucibleGoldMat || this.goldTrimMat;
        const redMat = this.crucibleRedMat || this.clothMat;

        // Ancient Crucible Plate Cuirass
        const chest = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.85, 0.4), goldMat);
        chest.castShadow = true;
        torso.add(chest);

        // Tree-Horned Greathelm
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.62, 0);
        torso.add(headGroup);

        const helm = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), goldMat);
        headGroup.add(helm);

        const treeCrest = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 5), goldMat);
        treeCrest.position.set(0, 0.38, -0.05);
        headGroup.add(treeCrest);

        // Siluria's Spiral Tree Spear
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.48, 0.32, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.8, 6), goldMat);
        rArm.position.y = -0.38;
        rightShoulder.add(rArm);

        const spear = new THREE.Group();
        spear.position.set(0.15, -0.75, 0.35);
        spear.rotation.x = 0.35;
        rightShoulder.add(spear);

        const spearShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.8, 6), goldMat);
        spear.add(spearShaft);
        const spiralTip = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.75, 5), goldMat);
        spiralTip.position.y = 1.75;
        spear.add(spiralTip);

        // Horned Crucible Greatshield on Left Arm
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.48, 0.32, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.8, 6), goldMat);
        lArm.position.y = -0.38;
        leftShoulder.add(lArm);

        const shield = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.05, 0.08), redMat);
        shield.position.set(-0.25, -0.35, 0.22);
        leftShoulder.add(shield);

        const rightHip = new THREE.Group();
        rightHip.position.set(0.24, -0.48, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.95, 6), goldMat);
        rLeg.position.y = -0.45;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.24, -0.48, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.95, 6), goldMat);
        lLeg.position.y = -0.45;
        leftHip.add(lLeg);

        root.userData = {
            def: mobDef,
            bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: spear
        };
        this.scene.add(root);
        return root;
    }

    // 17. FIRE CHIMERA HOUND
    createFireChimeraHound(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 0.72;
        root.add(bodyGroup);

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        const beastMat = this.demonFleshMat || this.leatherMat;
        const fireMat = this.chimeraFireMat || this.emberGlowMat;

        // Muscular Beast Chassis
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.65, 1.25), beastMat);
        body.castShadow = true;
        torso.add(body);

        // Blazing Lion / Hound Skull with Fire Mane
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.25, 0.75);
        torso.add(headGroup);

        const skull = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.48), beastMat);
        headGroup.add(skull);

        const mane = new THREE.Mesh(new THREE.DodecahedronGeometry(0.48), fireMat);
        mane.position.set(0, 0.1, -0.15);
        headGroup.add(mane);

        const fireLight = new THREE.PointLight(0xff4500, 2.0, 5.0);
        fireLight.position.set(0, 0.2, 0.2);
        headGroup.add(fireLight);

        // Writhing Viper Tail with Fangs
        const viperTail = new THREE.Group();
        viperTail.position.set(0, 0.1, -0.75);
        viperTail.rotation.x = -0.85;
        torso.add(viperTail);

        const tailShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.1, 6), beastMat);
        viperTail.add(tailShaft);

        const snakeHead = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.28, 4), beastMat);
        snakeHead.position.y = 0.65;
        viperTail.add(snakeHead);

        // 4 Running Paws
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.42, -0.1, 0.45);
        torso.add(rightShoulder);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.75, 6), beastMat);
        rLeg.position.y = -0.32;
        rightShoulder.add(rLeg);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.42, -0.1, 0.45);
        torso.add(leftShoulder);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.75, 6), beastMat);
        lLeg.position.y = -0.32;
        leftShoulder.add(lLeg);

        const rightHip = new THREE.Group();
        rightHip.position.set(0.38, -0.1, -0.45);
        torso.add(rightHip);
        const rRear = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.8, 6), beastMat);
        rRear.position.y = -0.35;
        rightHip.add(rRear);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.38, -0.1, -0.45);
        torso.add(leftHip);
        const lRear = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.8, 6), beastMat);
        lRear.position.y = -0.35;
        leftHip.add(lRear);

        root.userData = {
            def: mobDef,
            bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: skull
        };
        this.scene.add(root);
        return root;
    }

    // ----------------------------------------------------
    // THE SUNKEN LITURGY: HIGH BAILIFF OF ARREARS
    // First Adjudicator of the Grand Counting House
    // ----------------------------------------------------
    createHighBailiff(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.9;
        root.add(bodyGroup);

        const robeMat = new THREE.MeshStandardMaterial({
            color: 0x221215,
            roughness: 0.85,
            metalness: 0.2
        });
        const ironMat = new THREE.MeshStandardMaterial({
            color: 0x1f1f22,
            roughness: 0.45,
            metalness: 0.8
        });
        const brassMat = new THREE.MeshStandardMaterial({
            color: 0x997232,
            roughness: 0.35,
            metalness: 0.85
        });
        const glowSealMat = new THREE.MeshStandardMaterial({
            color: 0xff3300,
            emissive: 0xff2200,
            emissiveIntensity: 0.9,
            roughness: 0.3
        });

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // Heavy clerical robes & leaden chasuble
        const chestGeo = new THREE.CylinderGeometry(1.0, 1.25, 2.2, 10);
        const chest = new THREE.Mesh(chestGeo, robeMat);
        chest.castShadow = true;
        torso.add(chest);

        // Brass Seal of Arrears Collar
        const collar = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.16, 8, 16), brassMat);
        collar.rotation.x = Math.PI / 2;
        collar.position.y = 0.95;
        torso.add(collar);

        // Hanging parchment contract fragments
        for (let i = 0; i < 4; i++) {
            const rotA = (i / 4) * Math.PI * 2;
            const scroll = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.9, 0.04), new THREE.MeshStandardMaterial({ color: 0xbaa482, roughness: 0.9 }));
            scroll.position.set(Math.cos(rotA) * 0.95, -0.4, Math.sin(rotA) * 0.95);
            scroll.rotation.y = rotA;
            torso.add(scroll);
        }

        // Head Group & Iron Mask
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.45, 0);
        torso.add(headGroup);

        const headMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.75, 8), ironMat);
        headGroup.add(headMesh);

        // Glowing Seal of Default (Forehead)
        const eyeRune = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 0.08), glowSealMat);
        eyeRune.position.set(0, 0.15, 0.38);
        headGroup.add(eyeRune);

        // Mitre / Horned Iron Adjudicator Crown
        const crown = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.85, 6), brassMat);
        crown.position.y = 0.7;
        headGroup.add(crown);

        // Arms & Shoulders
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.25, 0.8, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 1.2, 8), robeMat);
        rArm.position.y = -0.55;
        rightShoulder.add(rArm);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-1.25, 0.8, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 1.2, 8), robeMat);
        lArm.position.y = -0.55;
        leftShoulder.add(lArm);

        // Weapon Group: Gavel of Foreclosure (Right Hand)
        const weaponGroup = new THREE.Group();
        weaponGroup.position.set(0, -1.15, 0.2);
        rightShoulder.add(weaponGroup);

        const hammerShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.2, 8), ironMat);
        weaponGroup.add(hammerShaft);

        const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 1.4), brassMat);
        hammerHead.position.set(0, 1.35, 0.15);
        hammerHead.castShadow = true;
        weaponGroup.add(hammerHead);

        const hammerRune = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.2, 0.2), glowSealMat);
        hammerRune.position.set(0, 1.35, 0.15);
        weaponGroup.add(hammerRune);

        // Left Hand: Suspended Scale of Arrears
        const scaleGroup = new THREE.Group();
        scaleGroup.position.set(0, -1.1, 0.2);
        leftShoulder.add(scaleGroup);
        const scaleBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), brassMat);
        scaleBeam.rotation.z = Math.PI / 2;
        scaleGroup.add(scaleBeam);
        const panL = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.15, 0.12, 8), brassMat);
        panL.position.set(-0.55, -0.45, 0);
        scaleGroup.add(panL);
        const panR = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.15, 0.12, 8), brassMat);
        panR.position.set(0.55, -0.45, 0);
        scaleGroup.add(panR);

        // Legs / Robe Base
        const rightHip = new THREE.Group();
        rightHip.position.set(0.5, -1.0, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 1.1, 8), robeMat);
        rLeg.position.y = -0.55;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.5, -1.0, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 1.1, 8), robeMat);
        lLeg.position.y = -0.55;
        leftHip.add(lLeg);

        const auraLight = new THREE.PointLight(0xff3300, 2.2, 16);
        auraLight.position.set(0, 1.8, 0.5);
        bodyGroup.add(auraLight);

        root.userData = {
            bodyGroup,
            torso,
            headGroup,
            rightShoulder,
            leftShoulder,
            rightHip,
            leftHip,
            weaponGroup,
            auraLight
        };

        this.scene.add(root);
        return root;
    }

    // ----------------------------------------------------
    // THE SUNKEN LITURGY: THE TWINS OF SURETY
    // Shared Balance Arbiters joined by the Brass Equilibrium Chain
    // ----------------------------------------------------
    createTwinsOfSurety(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.8;
        root.add(bodyGroup);

        const shroudMat = new THREE.MeshStandardMaterial({
            color: 0xdedcd7,
            roughness: 0.65,
            metalness: 0.15
        });
        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xcca033,
            roughness: 0.35,
            metalness: 0.85
        });
        const blindfoldMat = new THREE.MeshStandardMaterial({
            color: 0x4a3822,
            roughness: 0.9
        });
        const chainMat = new THREE.MeshStandardMaterial({
            color: 0xffcc44,
            emissive: 0xbb8800,
            emissiveIntensity: 0.7,
            roughness: 0.4
        });

        const torso = new THREE.Group();
        bodyGroup.add(torso);

        // Twin 1 (Left Arbiter of Collateral)
        const twin1 = new THREE.Group();
        twin1.position.set(-1.1, 0, 0);
        torso.add(twin1);

        const t1Body = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.38, 1.8, 8), shroudMat);
        twin1.add(t1Body);
        const t1Head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), shroudMat);
        t1Head.position.y = 1.15;
        twin1.add(t1Head);
        const t1Band = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.12, 10), blindfoldMat);
        t1Band.position.y = 1.15;
        twin1.add(t1Band);
        const t1Crown = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.04, 6, 12), goldMat);
        t1Crown.rotation.x = Math.PI / 2;
        t1Crown.position.y = 1.35;
        twin1.add(t1Crown);

        // Twin 2 (Right Arbiter of Discharge)
        const twin2 = new THREE.Group();
        twin2.position.set(1.1, 0, 0);
        torso.add(twin2);

        const t2Body = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.38, 1.8, 8), shroudMat);
        twin2.add(t2Body);
        const t2Head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), shroudMat);
        t2Head.position.y = 1.15;
        twin2.add(t2Head);
        const t2Band = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.12, 10), blindfoldMat);
        t2Band.position.y = 1.15;
        twin2.add(t2Band);
        const t2Crown = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.04, 6, 12), goldMat);
        t2Crown.rotation.x = Math.PI / 2;
        t2Crown.position.y = 1.35;
        twin2.add(t2Crown);

        // Glowing Equilibrium Chain connecting them
        const eqChain = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8), chainMat);
        eqChain.rotation.z = Math.PI / 2;
        eqChain.position.set(0, 0.3, 0);
        torso.add(eqChain);

        // Suspended brass balance pan in center of chain
        const centerPan = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.18, 0.15, 8), goldMat);
        centerPan.position.set(0, -0.15, 0);
        torso.add(centerPan);

        // Arms & Weapons
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(1.8, 0.5, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 1.0, 6), shroudMat);
        rArm.position.y = -0.45;
        rightShoulder.add(rArm);

        // Surety Balance Scythe (Twin 2)
        const weaponGroup = new THREE.Group();
        weaponGroup.position.set(0, -0.9, 0.2);
        rightShoulder.add(weaponGroup);
        const scytheStaff = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.8, 8), goldMat);
        weaponGroup.add(scytheStaff);
        const scytheBlade = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.06, 6, 12, Math.PI * 0.75), goldMat);
        scytheBlade.position.set(0.45, 1.25, 0);
        weaponGroup.add(scytheBlade);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-1.8, 0.5, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 1.0, 6), shroudMat);
        lArm.position.y = -0.45;
        leftShoulder.add(lArm);

        // Balance Flail (Twin 1)
        const flailStaff = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 6), goldMat);
        flailStaff.position.set(0, -0.6, 0.2);
        leftShoulder.add(flailStaff);
        const flailOrb = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24), goldMat);
        flailOrb.position.set(0, -1.5, 0.2);
        leftShoulder.add(flailOrb);

        const rightHip = new THREE.Group();
        rightHip.position.set(0.5, -0.9, 0);
        torso.add(rightHip);
        const leftHip = new THREE.Group();
        leftHip.position.set(-0.5, -0.9, 0);
        torso.add(leftHip);

        const auraLight = new THREE.PointLight(0xffd700, 2.0, 14);
        auraLight.position.set(0, 1.2, 0.5);
        bodyGroup.add(auraLight);

        root.userData = {
            bodyGroup,
            torso,
            headGroup: twin1,
            rightShoulder,
            leftShoulder,
            rightHip,
            leftHip,
            weaponGroup,
            auraLight
        };

        this.scene.add(root);
        return root;
    }


    // =========================================================================
    // NEW BESPOKE 3D MOB MODELS (OUTSIDE REALM EXPEDITIONS)
    // =========================================================================

    // 1. LESSER RED WOLF OF RADAGON / DIRE SHADOW WOLF
    createDireShadowWolf(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.0;
        root.add(bodyGroup);

        const wolfFurMat = new THREE.MeshStandardMaterial({ color: 0x181a24, roughness: 0.82 });
        const wolfManeMat = new THREE.MeshStandardMaterial({ color: 0x2e1e24, roughness: 0.9 });
        const lunarGlowMat = new THREE.MeshStandardMaterial({ color: 0x00f5ff, emissive: 0x00c4dd, emissiveIntensity: 0.9 });
        const etherealBladeMat = new THREE.MeshStandardMaterial({ color: 0x88e5ff, emissive: 0x0099cc, emissiveIntensity: 0.85, metalness: 0.85, roughness: 0.2 });
        const fangMat = new THREE.MeshStandardMaterial({ color: 0xf2eee2, roughness: 0.3 });

        // Predatory canine torso (tapered horizontal cylinder)
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.38, 1.6, 8), wolfFurMat);
        torso.rotation.x = Math.PI / 2;
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Flared mane tufts along spine
        const spineMane = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38), wolfManeMat);
        spineMane.position.set(0, 0.25, 0.3);
        torso.add(spineMane);

        // Muscular Neck & Wolf Head
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.45, 0.75);
        torso.add(headGroup);

        const skull = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.35, 0.55), wolfFurMat);
        headGroup.add(skull);

        const snout = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.65, 5), wolfFurMat);
        snout.rotation.x = Math.PI / 2;
        snout.position.set(0, -0.05, 0.48);
        headGroup.add(snout);

        // Pointed lupine ears
        const earL = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.38, 4), wolfFurMat);
        earL.position.set(-0.2, 0.3, -0.08);
        earL.rotation.z = -0.3;
        headGroup.add(earL);
        const earR = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.38, 4), wolfFurMat);
        earR.position.set(0.2, 0.3, -0.08);
        earR.rotation.z = 0.3;
        headGroup.add(earR);

        // Glowing lunar cyan eyes
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 6, 6), lunarGlowMat);
        eyeL.position.set(-0.16, 0.08, 0.24);
        headGroup.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.065, 6, 6), lunarGlowMat);
        eyeR.position.set(0.16, 0.08, 0.24);
        headGroup.add(eyeR);

        // Lethal Ethereal Magic Sword gripped crosswise in jaws
        const jawsSword = new THREE.Group();
        jawsSword.position.set(0, -0.08, 0.42);
        jawsSword.rotation.y = Math.PI / 2;
        headGroup.add(jawsSword);

        const swordHilt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6), lunarGlowMat);
        jawsSword.add(swordHilt);
        const swordBlade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 1.8), etherealBladeMat);
        swordBlade.position.set(0, 0, 0.9);
        jawsSword.add(swordBlade);

        // 4 Articulated Clawed Legs
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.38, 0, 0.55);
        torso.add(rightShoulder);
        const rForeleg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.95, 6), wolfFurMat);
        rForeleg.position.y = -0.45;
        rightShoulder.add(rForeleg);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.38, 0, 0.55);
        torso.add(leftShoulder);
        const lForeleg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.95, 6), wolfFurMat);
        lForeleg.position.y = -0.45;
        leftShoulder.add(lForeleg);

        const rightHip = new THREE.Group();
        rightHip.position.set(0.36, 0, -0.55);
        torso.add(rightHip);
        const rHindleg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.95, 6), wolfFurMat);
        rHindleg.position.y = -0.45;
        rightHip.add(rHindleg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.36, 0, -0.55);
        torso.add(leftHip);
        const lHindleg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.95, 6), wolfFurMat);
        lHindleg.position.y = -0.45;
        leftHip.add(lHindleg);

        // Arched bushy tail
        const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.06, 1.2, 6), wolfFurMat);
        tail.position.set(0, 0.25, -0.9);
        tail.rotation.x = -0.7;
        torso.add(tail);

        root.userData = {
            def: mobDef, bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: swordBlade
        };
        this.scene.add(root);
        return root;
    }

    // 2. ABYSSAL PUS OF MAN / CORRUPTED SERPENT BEAST
    createAbyssalPusBeast(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.3;
        root.add(bodyGroup);

        const pitchMat = new THREE.MeshStandardMaterial({ color: 0x09070f, roughness: 0.25, metalness: 0.65 });
        const redVeinMat = new THREE.MeshStandardMaterial({ color: 0xaa0022, emissive: 0x880018, emissiveIntensity: 0.9 });
        const boneMat = new THREE.MeshStandardMaterial({ color: 0xc8c0b0, roughness: 0.5 });
        const ragsMat = new THREE.MeshStandardMaterial({ color: 0x221b18, roughness: 0.95 });

        // Withered host body at the base
        const hostTorso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.35), ragsMat);
        hostTorso.position.y = -0.5;
        bodyGroup.add(hostTorso);

        // Massive writhing Abyssal Serpent Neck erupting upwards
        const serpentGroup = new THREE.Group();
        bodyGroup.add(serpentGroup);

        for (let s = 0; s < 4; s++) {
            const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.45 - s * 0.05, 0.52 - s * 0.05, 0.7, 8), pitchMat);
            seg.position.set(Math.sin(s * 0.6) * 0.3, s * 0.6, -Math.cos(s * 0.6) * 0.2);
            seg.rotation.z = Math.sin(s * 0.5) * 0.25;
            seg.castShadow = true;
            serpentGroup.add(seg);

            if (s % 2 === 0) {
                const veinRing = new THREE.Mesh(new THREE.TorusGeometry(0.48 - s * 0.04, 0.04, 6, 12), redVeinMat);
                veinRing.position.copy(seg.position);
                veinRing.rotation.x = Math.PI / 2;
                serpentGroup.add(veinRing);
            }
        }

        // Gaping Serpent Skull
        const headGroup = new THREE.Group();
        headGroup.position.set(0.35, 2.3, -0.2);
        serpentGroup.add(headGroup);

        const upperJaw = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.2, 6), pitchMat);
        upperJaw.rotation.x = -Math.PI / 2;
        headGroup.add(upperJaw);

        const lowerJaw = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.0, 5), pitchMat);
        lowerJaw.rotation.x = -Math.PI / 2 + 0.55;
        lowerJaw.position.set(0, -0.3, 0.1);
        headGroup.add(lowerJaw);

        // Cluster of 5 glowing crimson eyes
        [-0.2, -0.1, 0, 0.1, 0.2].forEach((ex, ei) => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), redVeinMat);
            eye.position.set(ex, 0.22 + (ei % 2) * 0.08, 0.35 - Math.abs(ex) * 0.4);
            headGroup.add(eye);
        });

        // Monstrous Asymmetrical Left Talon Arm (Colossal Abyssal Claw)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.7, 0.5, 0);
        bodyGroup.add(leftShoulder);

        const heavyForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.22, 1.4, 6), pitchMat);
        heavyForearm.position.y = -0.55;
        leftShoulder.add(heavyForearm);

        // 3 Razor Talons
        for (let t = -1; t <= 1; t++) {
            const talon = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.65, 4), boneMat);
            talon.position.set(t * 0.16, -1.3, 0.2);
            talon.rotation.x = 0.5;
            leftShoulder.add(talon);
        }

        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.45, 0.1, 0);
        bodyGroup.add(rightShoulder);
        const rWitheredArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.8, 5), ragsMat);
        rWitheredArm.position.y = -0.35;
        rightShoulder.add(rWitheredArm);

        const rightHip = new THREE.Group();
        rightHip.position.set(0.2, -0.9, 0);
        bodyGroup.add(rightHip);
        const leftHip = new THREE.Group();
        leftHip.position.set(-0.2, -0.9, 0);
        bodyGroup.add(leftHip);

        root.userData = {
            def: mobDef, bodyGroup, torso: serpentGroup, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: heavyForearm
        };
        this.scene.add(root);
        return root;
    }

    // 3. BLACK KNIFE ASSASSIN / SHADOW STALKER
    createBlackKnifeAssassin(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.1;
        root.add(bodyGroup);

        const silverMat = new THREE.MeshStandardMaterial({ color: 0x98a8b8, metalness: 0.88, roughness: 0.25 });
        const shroudMat = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.7, transparent: true, opacity: 0.92 });
        const maskMat = new THREE.MeshStandardMaterial({ color: 0xf5f3ee, roughness: 0.2 });
        const destinedDeathMat = new THREE.MeshStandardMaterial({ color: 0x1f0407, emissive: 0xd9162e, emissiveIntensity: 0.95 });
        const daggerSteelMat = new THREE.MeshStandardMaterial({ color: 0x15151a, metalness: 0.95, roughness: 0.15 });

        // Slender agile humanoid torso
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 1.1, 8), silverMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Billowing shroud cloak & cowled hood
        const hood = new THREE.Mesh(new THREE.DodecahedronGeometry(0.36), shroudMat);
        hood.position.y = 0.82;
        torso.add(hood);

        // Porcelain blank oval mask
        const mask = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), maskMat);
        mask.position.set(0, 0.78, 0.18);
        mask.scale.set(0.9, 1.15, 0.6);
        torso.add(mask);

        // Subtle glowing vermilion eyes behind mask
        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.02), destinedDeathMat);
        eyeL.position.set(-0.07, 0.82, 0.3);
        torso.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.02), destinedDeathMat);
        eyeR.position.set(0.07, 0.82, 0.3);
        torso.add(eyeR);

        // Cloak tails
        const cloakTail = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.2, 0.05), shroudMat);
        cloakTail.position.set(0, 0.15, -0.22);
        cloakTail.rotation.x = 0.18;
        torso.add(cloakTail);

        // Reverse-Grip Black Knife Weapon (Right Hand)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.42, 0.45, 0);
        torso.add(rightShoulder);

        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.75, 6), silverMat);
        rForearmPos: rArm.position.y = -0.32;
        rightShoulder.add(rArm);

        const daggerGroup = new THREE.Group();
        daggerGroup.position.set(0, -0.65, 0.05);
        daggerGroup.rotation.x = -Math.PI * 0.75; // reverse grip
        rightShoulder.add(daggerGroup);

        const wavyBlade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.85), daggerSteelMat);
        wavyBlade.position.z = 0.4;
        daggerGroup.add(wavyBlade);

        const destinedCore = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.025, 0.75), destinedDeathMat);
        destinedCore.position.z = 0.4;
        daggerGroup.add(destinedCore);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.42, 0.45, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.75, 6), silverMat);
        lArm.position.y = -0.32;
        leftShoulder.add(lArm);

        // Greaves
        const rightHip = new THREE.Group();
        rightHip.position.set(0.18, -0.55, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.95, 6), silverMat);
        rLeg.position.y = -0.45;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.18, -0.55, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.95, 6), silverMat);
        lLeg.position.y = -0.45;
        leftHip.add(lLeg);

        root.userData = {
            def: mobDef, bodyGroup, torso, head: hood,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: wavyBlade
        };
        this.scene.add(root);
        return root;
    }

    // 4. ANCESTRAL HORNED SHAMAN / MINOTAUR DRUID
    createAncestralHornedShaman(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.45;
        root.add(bodyGroup);

        const fleshMat = new THREE.MeshStandardMaterial({ color: 0x485854, roughness: 0.75 });
        const antlerMat = new THREE.MeshStandardMaterial({ color: 0xe0d6c4, roughness: 0.65 });
        const peltMat = new THREE.MeshStandardMaterial({ color: 0x30251c, roughness: 0.95 });
        const soulSpiritMat = new THREE.MeshStandardMaterial({ color: 0x00f5cc, emissive: 0x00b399, emissiveIntensity: 0.92 });
        const staffWoodMat = new THREE.MeshStandardMaterial({ color: 0x3d2716, roughness: 0.88 });

        // Muscular primeval torso & pelt kilt
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.42, 1.4, 8), fleshMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        const peltMantle = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.7), peltMat);
        peltMantle.position.set(0, 0.6, 0);
        torso.add(peltMantle);

        // Beast Skull Mask & Sprawling 8-Point Antler Crown
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.05, 0.1);
        torso.add(headGroup);

        const skull = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.42, 0.5), antlerMat);
        headGroup.add(skull);

        // Glowing turquoise soul eyes
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), soulSpiritMat);
        eyeL.position.set(-0.16, 0.05, 0.24);
        headGroup.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), soulSpiritMat);
        eyeR.position.set(0.16, 0.05, 0.24);
        headGroup.add(eyeR);

        // Grand Antler Horns
        for (let side = -1; side <= 1; side += 2) {
            const mainHorn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 1.4, 6), antlerMat);
            mainHorn.position.set(side * 0.55, 0.75, -0.1);
            mainHorn.rotation.z = -side * 0.7;
            headGroup.add(mainHorn);

            const tine1 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.55, 5), antlerMat);
            tine1.position.set(side * 0.8, 1.1, 0.1);
            tine1.rotation.z = -side * 0.35;
            headGroup.add(tine1);

            const tine2 = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.45, 5), antlerMat);
            tine2.position.set(side * 0.95, 0.85, -0.2);
            tine2.rotation.y = side * 0.4;
            headGroup.add(tine2);
        }

        // Shaman Spirit Staff (Right Arm)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.68, 0.45, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 1.1, 6), fleshMat);
        rArm.position.y = -0.5;
        rightShoulder.add(rArm);

        const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.7, 7), staffWoodMat);
        staff.position.set(0, -0.5, 0.45);
        rightShoulder.add(staff);

        const staffSoulGem = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24), soulSpiritMat);
        staffSoulGem.position.set(0, 0.95, 0.45);
        rightShoulder.add(staffSoulGem);

        // Soul Lantern (Left Arm)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.68, 0.45, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 1.1, 6), fleshMat);
        lArm.position.y = -0.5;
        leftShoulder.add(lArm);

        const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.4, 6), soulSpiritMat);
        lantern.position.set(0, -1.05, 0.2);
        leftShoulder.add(lantern);

        // Cloven Hoof Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.3, -0.75, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 1.2, 6), fleshMat);
        rLeg.position.y = -0.6;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.3, -0.75, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 1.2, 6), fleshMat);
        lLeg.position.y = -0.6;
        leftHip.add(lLeg);

        root.userData = {
            def: mobDef, bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: staff
        };
        this.scene.add(root);
        return root;
    }

    // 5. GLINTSTONE SORCERY MARIONETTE / CLOCKWORK AVIAN AUTOMATON
    createGlintstoneAutomaton(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.2;
        root.add(bodyGroup);

        const brassMat = new THREE.MeshStandardMaterial({ color: 0xc49632, metalness: 0.88, roughness: 0.28 });
        const darkBronzeMat = new THREE.MeshStandardMaterial({ color: 0x4a3a20, metalness: 0.8, roughness: 0.4 });
        const glintstoneMat = new THREE.MeshStandardMaterial({ color: 0x00d0ff, emissive: 0x0088cc, emissiveIntensity: 0.95 });
        const steelCutterMat = new THREE.MeshStandardMaterial({ color: 0xd8dde4, metalness: 0.92, roughness: 0.18 });

        // Spherical Clockwork Brass Torso with Exposed Gears
        const torso = new THREE.Mesh(new THREE.SphereGeometry(0.48, 8, 8), brassMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Glowing Glintstone Heart Core
        const coreGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 1), glintstoneMat);
        coreGem.position.set(0, 0, 0.38);
        torso.add(coreGem);

        // Avian Marionette Mask & Beak Helmet
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.72, 0.05);
        torso.add(headGroup);

        const helmet = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.65, 6), brassMat);
        helmet.rotation.x = -0.2;
        headGroup.add(helmet);

        const avianBeak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.55, 4), darkBronzeMat);
        avianBeak.rotation.x = Math.PI / 2;
        avianBeak.position.set(0, -0.1, 0.35);
        headGroup.add(avianBeak);

        // Twin sapphire ocular lenses
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), glintstoneMat);
        eyeL.position.set(-0.14, 0.04, 0.2);
        headGroup.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), glintstoneMat);
        eyeR.position.set(0.14, 0.04, 0.2);
        headGroup.add(eyeR);

        // FOUR Articulated Clockwork Arms:
        // Upper Pair: Dual Curved Scythe Blades
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.55, 0.25, 0);
        torso.add(rightShoulder);
        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.85, 6), brassMat);
        rArm.position.y = -0.4;
        rightShoulder.add(rArm);

        const rScythe = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 6, 12, Math.PI * 0.75), steelCutterMat);
        rScythe.position.set(0.25, -0.75, 0.2);
        rScythe.rotation.z = 0.5;
        rightShoulder.add(rScythe);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.55, 0.25, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.85, 6), brassMat);
        lArm.position.y = -0.4;
        leftShoulder.add(lArm);

        const lScythe = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 6, 12, Math.PI * 0.75), steelCutterMat);
        lScythe.position.set(-0.25, -0.75, 0.2);
        lScythe.rotation.z = -0.5;
        leftShoulder.add(lScythe);

        // Lower Pair: Spindle shortbow / parrying limbs
        const rLowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.65, 5), darkBronzeMat);
        rLowerArm.position.set(0.42, -0.25, 0.1);
        rLowerArm.rotation.z = -0.4;
        torso.add(rLowerArm);

        const lLowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.65, 5), darkBronzeMat);
        lLowerArm.position.set(-0.42, -0.25, 0.1);
        lLowerArm.rotation.z = 0.4;
        torso.add(lLowerArm);

        // Spindle Piston Legs
        const rightHip = new THREE.Group();
        rightHip.position.set(0.25, -0.45, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 1.05, 5), brassMat);
        rLeg.position.y = -0.5;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.25, -0.45, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 1.05, 5), brassMat);
        lLeg.position.y = -0.5;
        leftHip.add(lLeg);

        root.userData = {
            def: mobDef, bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: rScythe
        };
        this.scene.add(root);
        return root;
    }

    // 6. MAGMA WYRM HATCHLING / MOLTEN BASALT DRAKE
    createMagmaWyrmHatchling(x, z, angle = 0, y = 0, mobDef = null) {
        const root = new THREE.Group();
        root.position.set(x, y, z);
        root.rotation.y = angle;

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 0.75;
        root.add(bodyGroup);

        const basaltMat = new THREE.MeshStandardMaterial({ color: 0x1f1b18, roughness: 0.94, flatShading: true });
        const moltenMat = new THREE.MeshStandardMaterial({ color: 0xff3300, emissive: 0xff4400, emissiveIntensity: 0.95 });
        const hornMat = new THREE.MeshStandardMaterial({ color: 0x3d2820, roughness: 0.6 });

        // Low heavy quadruped chassis (flat basalt shell)
        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.75, 2.0), basaltMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Glowing magma channels along spine
        const magmaSpine = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 1.8), moltenMat);
        magmaSpine.position.set(0, 0.4, 0);
        torso.add(magmaSpine);

        // 3 Volcanic vent chimneys along spine
        [-0.5, 0, 0.5].forEach(vz => {
            const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.4, 6), basaltMat);
            chimney.position.set(0, 0.55, vz);
            torso.add(chimney);
            const ember = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), moltenMat);
            ember.position.set(0, 0.72, vz);
            torso.add(ember);
        });

        // Broad Triangular Drake Head & Molten Maw
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.25, 1.25);
        torso.add(headGroup);

        const headMesh = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.1, 5), basaltMat);
        headMesh.rotation.x = Math.PI / 2;
        headGroup.add(headMesh);

        // Curved brow horns
        const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.75, 4), hornMat);
        hornL.position.set(-0.35, 0.35, -0.2);
        hornL.rotation.z = -0.5;
        headGroup.add(hornL);
        const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.75, 4), hornMat);
        hornR.position.set(0.35, 0.35, -0.2);
        hornR.rotation.z = 0.5;
        headGroup.add(hornR);

        // Molten Maw dripping lava
        const mawGlow = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.15, 0.5), moltenMat);
        mawGlow.position.set(0, -0.15, 0.3);
        headGroup.add(mawGlow);

        // 4 Splayed reptilian claw limbs
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.85, -0.1, 0.75);
        torso.add(rightShoulder);
        const rForeclaw = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.85, 6), basaltMat);
        rForeclaw.position.set(0.2, -0.35, 0);
        rForeclaw.rotation.z = -0.4;
        rightShoulder.add(rForeclaw);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.85, -0.1, 0.75);
        torso.add(leftShoulder);
        const lForeclaw = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.85, 6), basaltMat);
        lForeclaw.position.set(-0.2, -0.35, 0);
        lForeclaw.rotation.z = 0.4;
        leftShoulder.add(lForeclaw);

        const rightHip = new THREE.Group();
        rightHip.position.set(0.85, -0.1, -0.75);
        torso.add(rightHip);
        const rHindclaw = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.85, 6), basaltMat);
        rHindclaw.position.set(0.2, -0.35, 0);
        rHindclaw.rotation.z = -0.4;
        rightHip.add(rHindclaw);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.85, -0.1, -0.75);
        torso.add(leftHip);
        const lHindclaw = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.85, 6), basaltMat);
        lHindclaw.position.set(-0.2, -0.35, 0);
        lHindclaw.rotation.z = 0.4;
        leftHip.add(lHindclaw);

        // Spiked Heavy Tail
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.6, 6), basaltMat);
        tail.position.set(0, 0, -1.6);
        tail.rotation.x = -Math.PI / 2 - 0.2;
        torso.add(tail);

        root.userData = {
            def: mobDef, bodyGroup, torso, head: headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            rightArm: rightShoulder, leftArm: leftShoulder,
            rightLeg: rightHip, leftLeg: leftHip,
            weapon: mawGlow
        };
        this.scene.add(root);
        return root;
    }

    // =========================================================================
    // NEW BESPOKE 3D BOSS MODELS (APEX OUTSIDE REALM LORDS)
    // =========================================================================

    // 1. MALIKETH, THE BLACK BLADE (DEATH EMBODIED)
    createMalikethBlackBlade(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.2;
        root.add(bodyGroup);

        const beastFurMat = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.88 });
        const goldArmorMat = new THREE.MeshStandardMaterial({ color: 0xc49a45, metalness: 0.88, roughness: 0.24 });
        const blackBladeMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0e, metalness: 0.95, roughness: 0.15 });
        const destinedDeathFlameMat = new THREE.MeshStandardMaterial({ color: 0x220206, emissive: 0xd9162e, emissiveIntensity: 1.0 });

        bodyGroup.scale.set(2.6, 2.6, 2.6);

        // Feral Lupine Torso with Golden Ceremonial Cuirass
        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.9), goldArmorMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        const backFur = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.5, 0.4), beastFurMat);
        backFur.position.set(0, 0, -0.35);
        torso.add(backFur);

        // Wolf-Beast Helm with Golden Fangs
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.1, 0.15);
        torso.add(headGroup);

        const helm = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.65), goldArmorMat);
        headGroup.add(helm);

        const lupineMaw = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 5), beastFurMat);
        lupineMaw.rotation.x = Math.PI / 2;
        lupineMaw.position.set(0, -0.1, 0.5);
        headGroup.add(lupineMaw);

        // Burning golden eye slots
        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.05), destinedDeathFlameMat);
        eyeL.position.set(-0.16, 0.08, 0.35);
        headGroup.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.05), destinedDeathFlameMat);
        eyeR.position.set(0.16, 0.08, 0.35);
        headGroup.add(eyeR);

        // Colossal Black Blade Greatsword
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.85, 0.5, 0);
        torso.add(rightShoulder);

        const rArm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 1.1, 6), goldArmorMat);
        rArm.position.y = -0.5;
        rightShoulder.add(rArm);

        const bladeGroup = new THREE.Group();
        bladeGroup.position.set(0, -0.9, 0.5);
        bladeGroup.rotation.x = 0.6;
        rightShoulder.add(bladeGroup);

        const blackHilt = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.2, 6), goldArmorMat);
        bladeGroup.add(blackHilt);

        const giantBlade = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 3.2), blackBladeMat);
        giantBlade.position.set(0, 0, 1.6);
        bladeGroup.add(giantBlade);

        // Destined Death Flame Core running along blade
        const deathAura = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.1, 3.1), destinedDeathFlameMat);
        deathAura.position.set(0, 0, 1.6);
        bladeGroup.add(deathAura);

        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.85, 0.5, 0);
        torso.add(leftShoulder);
        const lArm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 1.1, 6), goldArmorMat);
        lArm.position.y = -0.5;
        leftShoulder.add(lArm);

        // Gold Greaves
        const rightHip = new THREE.Group();
        rightHip.position.set(0.38, -0.85, 0);
        torso.add(rightHip);
        const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 1.3, 6), goldArmorMat);
        rLeg.position.y = -0.65;
        rightHip.add(rLeg);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.38, -0.85, 0);
        torso.add(leftHip);
        const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 1.3, 6), goldArmorMat);
        lLeg.position.y = -0.65;
        leftHip.add(lLeg);

        const deathLight = new THREE.PointLight(0xd9162e, 3.2, 22);
        deathLight.position.set(0, 1.8, 1.2);
        bodyGroup.add(deathLight);

        root.userData = {
            bodyGroup, torso, headGroup,
            rightShoulder, leftShoulder, rightHip, leftHip,
            weaponGroup: bladeGroup, auraLight: deathLight
        };
        this.scene.add(root);
        return root;
    }

    // 2. DRAGONLORD PLACIDUSAX (LORD OF THE ANCIENT TEMPEST)
    createDragonlordPlacidusax(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.8;
        root.add(bodyGroup);

        const stoneScaleMat = new THREE.MeshStandardMaterial({ color: 0x423d38, roughness: 0.88, flatShading: true });
        const goldRuinMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.3 });
        const redLightningMat = new THREE.MeshStandardMaterial({ color: 0xff1133, emissive: 0xdd0022, emissiveIntensity: 1.0 });

        bodyGroup.scale.set(3.5, 3.5, 3.5);

        // Colossal Stone Dragon Torso
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.4, 3.2, 8), stoneScaleMat);
        torso.rotation.x = Math.PI / 2;
        torso.castShadow = true;
        bodyGroup.add(torso);

        // DUAL ARTICULATED HEADS (Left & Right Dragon Heads)
        [-0.8, 0.8].forEach((hx, hi) => {
            const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 2.2, 6), stoneScaleMat);
            neck.position.set(hx, 1.2, 1.5);
            neck.rotation.x = -0.55;
            neck.rotation.z = hi === 0 ? 0.35 : -0.35;
            bodyGroup.add(neck);

            const dHead = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.4, 5), goldRuinMat);
            dHead.position.set(hx * 1.3, 2.2, 2.5);
            dHead.rotation.x = 0.25;
            bodyGroup.add(dHead);

            // Red ancient lightning horns
            const horn = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.9, 4), redLightningMat);
            horn.position.set(hx * 1.3, 2.8, 2.2);
            horn.rotation.x = -0.5;
            bodyGroup.add(horn);
        });

        // FOUR Colossal Draconic Wings (2 on left, 2 on right)
        [-1, 1].forEach(side => {
            const wingUpper = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.1, 1.8), stoneScaleMat);
            wingUpper.position.set(side * 3.4, 1.2, 0);
            wingUpper.rotation.z = side * 0.45;
            bodyGroup.add(wingUpper);

            const wingLower = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 1.5), goldRuinMat);
            wingLower.position.set(side * 2.8, 0.3, -1.0);
            wingLower.rotation.z = side * 0.25;
            bodyGroup.add(wingLower);
        });

        // Ancient Red Lightning Sparks
        const auraLight = new THREE.PointLight(0xff2244, 3.5, 28);
        auraLight.position.set(0, 2.5, 1.0);
        bodyGroup.add(auraLight);

        root.userData = { bodyGroup, torso, auraLight };
        this.scene.add(root);
        return root;
    }

    // 3. LICHDRAGON FORTISSAX (CORRUPTED DEATH LIGHTNING)
    createLichdragonFortissax(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.6;
        root.add(bodyGroup);

        const charredBlackMat = new THREE.MeshStandardMaterial({ color: 0x161618, roughness: 0.9 });
        const goldFleckMat = new THREE.MeshStandardMaterial({ color: 0x997a33, metalness: 0.75, roughness: 0.35 });
        const redLightningSpearMat = new THREE.MeshStandardMaterial({ color: 0xff1a35, emissive: 0xee0828, emissiveIntensity: 1.0 });

        bodyGroup.scale.set(3.2, 3.2, 3.2);

        // Dragon Body & Charred Ribs
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.2, 3.0, 8), charredBlackMat);
        torso.rotation.x = Math.PI / 2;
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Dragon Neck & Skull
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.75, 2.4, 6), charredBlackMat);
        neck.position.set(0, 1.3, 1.6);
        neck.rotation.x = -0.55;
        bodyGroup.add(neck);

        const skull = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.6, 5), goldFleckMat);
        skull.position.set(0, 2.2, 2.6);
        skull.rotation.x = 0.25;
        bodyGroup.add(skull);

        // Twin Colossal Red Lightning Spears held in talons
        for (let side = -1; side <= 1; side += 2) {
            const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.02, 6.5, 6), redLightningSpearMat);
            spear.position.set(side * 2.2, 1.2, 2.0);
            spear.rotation.x = 0.45;
            spear.rotation.z = side * 0.25;
            bodyGroup.add(spear);
        }

        // 4 Ragged Deathblight Wings
        for (let side = -1; side <= 1; side += 2) {
            const wing = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.08, 1.6), charredBlackMat);
            wing.position.set(side * 3.2, 1.4, -0.2);
            wing.rotation.z = side * 0.4;
            bodyGroup.add(wing);
        }

        const deathLightningLight = new THREE.PointLight(0xff1a35, 3.6, 26);
        deathLightningLight.position.set(0, 2.2, 1.5);
        bodyGroup.add(deathLightningLight);

        root.userData = { bodyGroup, torso, auraLight: deathLightningLight };
        this.scene.add(root);
        return root;
    }

    // 4. RENNALA, QUEEN OF THE FULL MOON (STARLIGHT ARCH-SORCERESS)
    createRennalaFullMoon(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 1.8;
        root.add(bodyGroup);

        const royalRobeMat = new THREE.MeshStandardMaterial({ color: 0x0c1b33, roughness: 0.65, metalness: 0.2 });
        const silverCarianMat = new THREE.MeshStandardMaterial({ color: 0xdde5ef, metalness: 0.88, roughness: 0.2 });
        const fullMoonSphereMat = new THREE.MeshStandardMaterial({ color: 0xe8f4ff, emissive: 0x99ddff, emissiveIntensity: 0.95 });
        const glintstoneCyanMat = new THREE.MeshStandardMaterial({ color: 0x00f5ff, emissive: 0x00a8cc, emissiveIntensity: 0.9 });

        bodyGroup.scale.set(2.2, 2.2, 2.2);

        // Cascading Astrologer Robes (Conical dress to floor)
        const dress = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.0, 12), royalRobeMat);
        dress.position.y = 0;
        dress.castShadow = true;
        bodyGroup.add(dress);

        // Upper Torso
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.8, 8), silverCarianMat);
        torso.position.y = 1.25;
        bodyGroup.add(torso);

        // Head with Iconic Towering Conical Crescent Moon Headdress
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.8, 0);
        bodyGroup.add(headGroup);

        const headdress = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.6, 8), royalRobeMat);
        headdress.position.y = 0.7;
        headGroup.add(headdress);

        const crescentMoon = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 6, 16, Math.PI * 0.9), silverCarianMat);
        crescentMoon.position.set(0, 0.9, 0.2);
        crescentMoon.rotation.z = Math.PI / 2;
        headGroup.add(crescentMoon);

        // Carian Regal Scepter (Right Hand)
        const scepter = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6), silverCarianMat);
        scepter.position.set(0.75, 0.6, 0.4);
        bodyGroup.add(scepter);

        const scepterGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 1), glintstoneCyanMat);
        scepterGem.position.set(0.75, 1.85, 0.4);
        bodyGroup.add(scepterGem);

        // Hovering Luminous Full Moon Sphere
        const moonSphere = new THREE.Mesh(new THREE.SphereGeometry(0.95, 16, 16), fullMoonSphereMat);
        moonSphere.position.set(-1.4, 1.6, 0.6);
        bodyGroup.add(moonSphere);

        // Orbiting miniature glintstone stars
        [-0.7, 0.7].forEach(ang => {
            const miniStar = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14), glintstoneCyanMat);
            miniStar.position.set(-1.4 + Math.sin(ang) * 1.3, 1.6, 0.6 + Math.cos(ang) * 1.3);
            bodyGroup.add(miniStar);
        });

        const moonLight = new THREE.PointLight(0x00f5ff, 3.2, 24);
        moonLight.position.set(-1.4, 1.8, 0.6);
        bodyGroup.add(moonLight);

        root.userData = { bodyGroup, torso, headGroup, auraLight: moonLight };
        this.scene.add(root);
        return root;
    }

    // 5. BOREALIS, THE FREEZING FOG (ANCIENT GLACIAL WYRM)
    createBorealisFreezingFog(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.6;
        root.add(bodyGroup);

        const permafrostMat = new THREE.MeshStandardMaterial({ color: 0x9be8ff, roughness: 0.2, metalness: 0.6, transparent: true, opacity: 0.88 });
        const iceSpireMat = new THREE.MeshStandardMaterial({ color: 0xe0f7ff, emissive: 0x00aacc, emissiveIntensity: 0.85, roughness: 0.1 });

        bodyGroup.scale.set(3.4, 3.4, 3.4);

        // Crystalline Translucent Ice Body
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.1, 3.2, 7), permafrostMat);
        torso.rotation.x = Math.PI / 2;
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Jagged Glacial Icicles lining the spine
        for (let ic = -1.2; ic <= 1.2; ic += 0.5) {
            const spire = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.2, 5), iceSpireMat);
            spire.position.set(0, 1.1, ic);
            bodyGroup.add(spire);
        }

        // Dragon Neck & Frost Skull
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 2.2, 6), permafrostMat);
        neck.position.set(0, 1.2, 1.6);
        neck.rotation.x = -0.5;
        bodyGroup.add(neck);

        const skull = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.5, 5), iceSpireMat);
        skull.position.set(0, 2.0, 2.6);
        skull.rotation.x = 0.25;
        bodyGroup.add(skull);

        // Frosted Crystalline Wings
        for (let side = -1; side <= 1; side += 2) {
            const wing = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, 1.8), permafrostMat);
            wing.position.set(side * 3.4, 1.3, -0.2);
            wing.rotation.z = side * 0.45;
            bodyGroup.add(wing);
        }

        const blizzardLight = new THREE.PointLight(0xa5f3fc, 3.2, 26);
        blizzardLight.position.set(0, 2.2, 1.5);
        bodyGroup.add(blizzardLight);

        root.userData = { bodyGroup, torso, auraLight: blizzardLight };
        this.scene.add(root);
        return root;
    }

    // 6. PROMISED CONSORT RADAHN (LORD OF MIQUELLA'S DIVINITY)
    createConsortRadahn(x, z) {
        const root = new THREE.Group();
        root.position.set(x, 0, z);

        const bodyGroup = new THREE.Group();
        bodyGroup.position.y = 2.4;
        root.add(bodyGroup);

        const goldPlateMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.22 });
        const miquellaHairMat = new THREE.MeshStandardMaterial({ color: 0xffea88, roughness: 0.45 });
        const whiteShroudMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.8 });
        const radiantLightBladeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffdd44, emissiveIntensity: 1.0 });

        bodyGroup.scale.set(2.8, 2.8, 2.8);

        // Massive Gilded Lion Plate Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.7, 1.1), goldPlateMat);
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Head with Prime Golden Lion Helm
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.3, 0.1);
        torso.add(headGroup);

        const helm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.75, 0.8), goldPlateMat);
        headGroup.add(helm);

        // Young Miquella on Radahn's back
        const miquellaBody = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 1.1, 7), whiteShroudMat);
        miquellaBody.position.set(0, 0.8, -0.65);
        torso.add(miquellaBody);

        // Cascading Braided Golden Hair draping over shoulders
        for (let side = -1; side <= 1; side += 2) {
            const hairStrand = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 1.8, 6), miquellaHairMat);
            hairStrand.position.set(side * 0.75, 0.6, -0.2);
            hairStrand.rotation.z = side * 0.25;
            torso.add(hairStrand);
        }

        // Divine Pillar of Light Solar Halo above Radahn
        const solarHalo = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.08, 8, 24), radiantLightBladeMat);
        solarHalo.position.set(0, 1.8, -0.3);
        torso.add(solarHalo);

        // Twin Greatswords of Light (held in both hands)
        for (let side = -1; side <= 1; side += 2) {
            const shoulder = new THREE.Group();
            shoulder.position.set(side * 1.1, 0.6, 0);
            torso.add(shoulder);

            const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 1.2, 6), goldPlateMat);
            arm.position.y = -0.55;
            shoulder.add(arm);

            const greatsword = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 2.6), radiantLightBladeMat);
            greatsword.position.set(side * 0.2, -0.9, 0.9);
            greatsword.rotation.x = 0.55;
            shoulder.add(greatsword);
        }

        const holySunLight = new THREE.PointLight(0xffdd44, 3.8, 30);
        holySunLight.position.set(0, 2.2, 0.8);
        bodyGroup.add(holySunLight);

        root.userData = { bodyGroup, torso, headGroup, auraLight: holySunLight };
        this.scene.add(root);
        return root;
    }

}
