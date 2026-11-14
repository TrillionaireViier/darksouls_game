// ====================================================================
// HERALDRY, SOCIAL HIERARCHY & NOBILITY SYSTEM (401–410)
// Authentic medieval blazon studio, feudal titles, peasant deference,
// banquets, chivalric duels, fief taxes, ransoms, court protocols,
// and knightly accolade order initiations.
// ====================================================================

class HeraldryNobilitySystem {
    constructor(game) {
        this.game = game;
        this.audio = window.dsAudio;

        // 401. Tabard & Coat of Arms Customization State
        this.heraldry = {
            tincture: 'gules',        // 'gules' (red), 'azure' (blue), 'sable' (black), 'vert' (green), 'purpure' (purple), 'or' (gold), 'argent' (silver)
            sigil: 'lion',            // 'lion', 'sun', 'dragon', 'swords', 'crown', 'raven', 'tower'
            division: 'plain',        // 'plain', 'pale', 'fess', 'chevron', 'saltire', 'quartered'
            secondaryColor: 'or',     // Gold
            motto: 'Virtus In Aeternum'
        };

        // 402. Noble Title Social Standing
        this.ranks = [
            { id: 'peasant', title: 'Peasant Retainer', honorReq: 0, discount: 0.0, perk: 'Basic citizen status' },
            { id: 'squire', title: 'Squire of the Flame', honorReq: 250, discount: 0.08, perk: 'Merchant 8% discount' },
            { id: 'knight_bachelor', title: 'Knight Bachelor of Astora', honorReq: 600, discount: 0.15, perk: 'Guards salute, 15% discount' },
            { id: 'baronet', title: 'Baronet of Lordran', honorReq: 1200, discount: 0.22, perk: 'Peasants bow, 22% discount' },
            { id: 'count', title: 'Count of High Anor Londo', honorReq: 2500, discount: 0.30, perk: 'Royal Court entry, 30% discount' },
            { id: 'grand_paladin', title: 'Grand Paladin Sovereign', honorReq: 5000, discount: 0.35, perk: 'Maximum deference, +35% discount, Knight Order master' }
        ];
        this.currentRankIndex = 2; // Starts as Knight Bachelor
        this.chivalryHonor = 850;

        // 403. Peasant Deference & Bowing
        this.deferenceEnabled = true;

        // 404. Aristocratic Banquet Etiquette
        this.banquet = {
            reputation: 75,
            activeCourse: 0,
            diplomaticFavor: 100
        };

        // 405. Duel of Honor
        this.honorDuels = [
            { id: 'duel_sir_crest', opponent: 'Sir Roland of the Crest', status: 'Available', wagerSouls: 1500, defeated: false },
            { id: 'duel_baron_iron', opponent: 'Baron Vilem of the Iron Keep', status: 'Available', wagerSouls: 3500, defeated: false },
            { id: 'duel_paladin_leer', opponent: 'Paladin Leer of the Silver Order', status: 'Available', wagerSouls: 6000, defeated: false }
        ];

        // 406. Vassal Land Management (Fiefdoms & Taxes)
        this.fiefdoms = [
            { id: 'fief_skalitz', name: 'Skalitz Foothills Outpost', level: 2, taxRatePerMin: 180, uncollectedTithe: 360, contentment: 'High (88%)' },
            { id: 'fief_burg', name: 'Undead Burg Bastion', level: 1, taxRatePerMin: 260, uncollectedTithe: 520, contentment: 'Loyal (94%)' },
            { id: 'fief_parish', name: 'Parish Belltower Valley', level: 1, taxRatePerMin: 420, uncollectedTithe: 840, contentment: 'Prospering (91%)' }
        ];

        // 407. Ransom & Prisoner Logistics
        this.prisoners = [
            { id: 'pris_cuman_khan', name: 'Cuman Vanguard Warlord', faction: 'King Sigismund Mercenaries', ransomValue: 2400, status: 'Imprisoned' }
        ];

        // 408. Heraldic Recognition Penalty (Infamy)
        this.infamyScore = 0; // 0 to 100

        // 409. Royal Court Protocols
        this.courtStatus = 'Respected';

        // 410. Knightly Order Initiation
        this.knightlyOrder = {
            swornOath: 'Sacred Flame & Shield of the Weak',
            vigilCompleted: true,
            orderName: 'Order of the Radiant Sun',
            orderSwordClaimed: true
        };

        this.initHeraldryTexture();
    }

    initHeraldryTexture() {
        this.heraldryCanvas = document.createElement('canvas');
        this.heraldryCanvas.width = 512;
        this.heraldryCanvas.height = 512;
        this.renderCoatOfArms(this.heraldryCanvas);
    }

    update(delta) {
        // Accumulate passive vassal tax revenues over time
        for (const fief of this.fiefdoms) {
            fief.uncollectedTithe += (fief.taxRatePerMin / 60.0) * delta;
        }
    }

    // ----------------------------------------------------------------
    // 401. TABARD & COAT OF ARMS RENDERING (CANVAS BLAZON ENGINE)
    // ----------------------------------------------------------------
    customizeHeraldry(tincture, sigil, division, secondaryColor) {
        this.heraldry.tincture = tincture || this.heraldry.tincture;
        this.heraldry.sigil = sigil || this.heraldry.sigil;
        this.heraldry.division = division || this.heraldry.division;
        this.heraldry.secondaryColor = secondaryColor || this.heraldry.secondaryColor;

        this.renderCoatOfArms(this.heraldryCanvas);
        this.applyHeraldryTo3DPlayer();

        if (this.game) {
            this.game.showNotification("🛡️ COAT OF ARMS UPDATED: " + this.heraldry.tincture.toUpperCase() + " / " + this.heraldry.sigil.toUpperCase());
        }
        if (this.audio) this.audio.playBlock();
    }

    renderCoatOfArms(canvas) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        const colorMap = {
            gules: '#9b1c1c',      // Crimson
            azure: '#1b3b6f',      // Royal Blue
            sable: '#141416',      // Black
            vert: '#1e5e2e',       // Forest Green
            purpure: '#4d1e5e',    // Imperial Purple
            or: '#d4af37',         // Bright Gold
            argent: '#d9e2ec'      // Silver/White
        };

        const primaryCol = colorMap[this.heraldry.tincture] || '#1b3b6f';
        const secondaryCol = colorMap[this.heraldry.secondaryColor] || '#d4af37';

        // 1. Draw Field / Shield Partition
        ctx.fillStyle = primaryCol;
        ctx.fillRect(0, 0, w, h);

        if (this.heraldry.division === 'pale') {
            ctx.fillStyle = secondaryCol;
            ctx.fillRect(w * 0.5, 0, w * 0.5, h);
        } else if (this.heraldry.division === 'fess') {
            ctx.fillStyle = secondaryCol;
            ctx.fillRect(0, h * 0.35, w, h * 0.3);
        } else if (this.heraldry.division === 'chevron') {
            ctx.fillStyle = secondaryCol;
            ctx.beginPath();
            ctx.moveTo(0, h * 0.8);
            ctx.lineTo(w * 0.5, h * 0.3);
            ctx.lineTo(w, h * 0.8);
            ctx.lineTo(w, h * 0.95);
            ctx.lineTo(w * 0.5, h * 0.45);
            ctx.lineTo(0, h * 0.95);
            ctx.fill();
        } else if (this.heraldry.division === 'saltire') {
            ctx.strokeStyle = secondaryCol;
            ctx.lineWidth = 45;
            ctx.beginPath();
            ctx.moveTo(0, 0); ctx.lineTo(w, h);
            ctx.moveTo(w, 0); ctx.lineTo(0, h);
            ctx.stroke();
        } else if (this.heraldry.division === 'quartered') {
            ctx.fillStyle = secondaryCol;
            ctx.fillRect(w * 0.5, 0, w * 0.5, h * 0.5);
            ctx.fillRect(0, h * 0.5, w * 0.5, h * 0.5);
        }

        // 2. Gold/Silver Orle Border Frame
        ctx.strokeStyle = secondaryCol;
        ctx.lineWidth = 20;
        ctx.strokeRect(10, 10, w - 20, h - 20);

        // 3. Heraldic Charge / Sigil (Drawn in center)
        ctx.save();
        ctx.translate(w * 0.5, h * 0.5);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 12;

        if (this.heraldry.sigil === 'lion') {
            // Bohemian Crowned Two-Tailed Lion
            ctx.font = 'bold 220px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🦁', 0, -10);
        } else if (this.heraldry.sigil === 'sun') {
            // Warrior of Sunlight Crest
            ctx.font = 'bold 220px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('☀️', 0, -10);
        } else if (this.heraldry.sigil === 'dragon') {
            // Ancient Dragon Crest
            ctx.font = 'bold 220px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🐉', 0, -10);
        } else if (this.heraldry.sigil === 'swords') {
            // Crossed Broadswords
            ctx.font = 'bold 220px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚔️', 0, -10);
        } else if (this.heraldry.sigil === 'crown') {
            // High Sovereign Crown
            ctx.font = 'bold 220px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('👑', 0, -10);
        } else if (this.heraldry.sigil === 'raven') {
            // Velka Black Raven
            ctx.font = 'bold 220px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🦅', 0, -10);
        } else {
            // Fortified Watchtower
            ctx.font = 'bold 220px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🏰', 0, -10);
        }
        ctx.restore();
    }

    applyHeraldryTo3DPlayer() {
        if (!this.game || !this.game.character || !this.game.character.crestShieldMat) return;
        const newTex = new THREE.CanvasTexture(this.heraldryCanvas);
        this.game.character.crestShieldMat.map = newTex;
        this.game.character.crestShieldMat.needsUpdate = true;
    }

    // ----------------------------------------------------------------
    // 402. NOBLE TITLE SOCIAL STANDING & PROMOTION
    // ----------------------------------------------------------------
    getCurrentRank() {
        return this.ranks[this.currentRankIndex];
    }

    earnHonor(amount) {
        this.chivalryHonor += amount;
        for (let i = this.ranks.length - 1; i >= 0; i--) {
            if (this.chivalryHonor >= this.ranks[i].honorReq) {
                if (i > this.currentRankIndex) {
                    this.currentRankIndex = i;
                    if (this.audio) this.audio.playChivalricFanfare();
                    if (this.game) {
                        this.game.showNotification("👑 PROMOTED TO: " + this.ranks[i].title.toUpperCase() + "!");
                    }
                }
                break;
            }
        }
    }

    getMerchantDiscount() {
        return this.getCurrentRank().discount;
    }

    // ----------------------------------------------------------------
    // 405. DUEL OF HONOR (1v1 CHIVALRIC CHALLENGE)
    // ----------------------------------------------------------------
    issueHonorDuel(duelId) {
        const duel = this.honorDuels.find(d => d.id === duelId);
        if (!duel) return;

        if (this.audio) this.audio.playChivalricFanfare();
        if (this.game) {
            this.game.showNotification("⚔️ DUEL OF HONOR ACCEPTED: Against " + duel.opponent + " (Wager: " + duel.wagerSouls + " Souls)!");
            // Award wager souls & honor on victory
            setTimeout(() => {
                duel.defeated = true;
                duel.status = 'Victory';
                if (this.game.combat) {
                    this.game.combat.souls += duel.wagerSouls;
                    this.earnHonor(180);
                    this.game.showNotification("🏆 DUEL WON! +" + duel.wagerSouls + " Souls & +180 Chivalric Honor!");
                }
            }, 3500);
        }
    }

    // ----------------------------------------------------------------
    // 406. VASSAL LAND TITHE COLLECTION
    // ----------------------------------------------------------------
    collectFiefTaxes() {
        let totalCoins = 0;
        for (const fief of this.fiefdoms) {
            const amt = Math.floor(fief.uncollectedTithe);
            totalCoins += amt;
            fief.uncollectedTithe = 0;
        }

        if (totalCoins <= 0) {
            if (this.game) this.game.showNotification("Fief treasuries currently collecting revenues...");
            return 0;
        }

        if (this.game && this.game.combat) {
            this.game.combat.souls += totalCoins;
            if (this.audio) this.audio.playVictory();
            this.game.showNotification("💰 FIEFDOM TITHE COLLECTED: +" + totalCoins + " Souls from your vassal lands!");
        }

        return totalCoins;
    }

    // ----------------------------------------------------------------
    // 407. RANSOM PRISONER
    // ----------------------------------------------------------------
    ransomPrisoner(prisId) {
        const pris = this.prisoners.find(p => p.id === prisId);
        if (!pris || pris.status !== 'Imprisoned') return;

        pris.status = 'Ransomed';
        if (this.game && this.game.combat) {
            this.game.combat.souls += pris.ransomValue;
            if (this.audio) this.audio.playVictory();
            this.game.showNotification("📜 RANSOM PAID: +" + pris.ransomValue + " Souls from " + pris.faction + "!");
        }
    }

    // ----------------------------------------------------------------
    // 410. KNIGHTLY ORDER INITIATION
    // ----------------------------------------------------------------
    swearKnightlyOath() {
        this.knightlyOrder.vigilCompleted = true;
        this.earnHonor(350);
        if (this.audio) this.audio.playChivalricFanfare();
        if (this.game) {
            this.game.showNotification("⚔️ SACRED VOW SWORN: Dubbed Knight of the Radiant Order! (+350 Honor)");
        }
    }
}

window.HeraldryNobilitySystem = HeraldryNobilitySystem;
