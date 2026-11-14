// ====================================================================
// MEDICAL, HERBALISM & APOTHECARY CRAFTING (411–420)
// Complete medieval surgery & pharmacology: Leechcraft bloodletting,
// bone setting, herb drying racks, mortar grinding, alembic distillation,
// poppy extracts, antivenom synthesis, sterile bandages, and botanical codex.
// ====================================================================

class ApothecaryCraftingSystem {
    constructor(game) {
        this.game = game;
        this.audio = window.dsAudio;

        // Herb Inventory
        this.herbs = {
            marigold: { name: 'Golden Marigold', raw: 6, dried: 4, desc: 'Promotes rapid tissue healing & coagulation' },
            bloodflower: { name: 'Scarlet Bloodflower', raw: 4, dried: 3, desc: 'Potent astringent for deep lacerations' },
            poppy: { name: 'Slumbering Poppy', raw: 3, dried: 2, desc: 'High opioid alkaloid for total pain numbness' },
            thistle: { name: 'Sovereign Thistle', raw: 5, dried: 5, desc: 'Draws venom, cleanses bloodstream poisons' },
            spores: { name: 'Subterranean Spores', raw: 2, dried: 2, desc: 'Hallucinogenic bioluminescent crypt spores' }
        };

        // 411. Leechcraft & Bloodletting
        this.leechcraft = {
            leechesInJar: 8,
            feverToxinPurged: 0
        };

        // 412. Bone Setting
        this.boneFracture = {
            isFractured: false,
            splintApplied: true,
            boneAlignmentPct: 100 // 0 to 100%
        };

        // 413. Herb Drying Racks
        this.dryingRacks = [
            { slot: 1, herb: 'marigold', progress: 100, completed: true },
            { slot: 2, herb: 'poppy', progress: 65, completed: false },
            { slot: 3, herb: 'thistle', progress: 100, completed: true }
        ];

        // 414. Mortar & Pestle Grinding Physics
        this.mortarPestle = {
            grindAngle: 0,
            crushProgress: 0, // 0 to 100%
            activeHerb: 'marigold',
            finePowderYield: 0
        };

        // 415. Alembic Heat Control (Distillation)
        this.alembic = {
            currentTempC: 72,       // 20°C to 110°C (Optimal: 78°C to 84°C)
            targetMin: 78,
            targetMax: 84,
            bellowsPressure: 0,
            distillProgress: 0,     // 0 to 100%
            isDistilling: false,
            activeFormula: 'antidote'
        };

        // Crafted Medicine Pouches / Ready Inventory
        this.craftedMeds = {
            sterileBandages: 3,
            poppyExtracts: 2,
            venomAntidotes: 3,
            marigoldDecoctions: 2
        };

        // 416. Poppy Extract Active Buff
        this.poppyBuffActive = false;
        this.poppyBuffTimer = 0;

        // 419. Botanical Codex Journal
        this.codexEntries = [
            { id: 'marigold', name: 'Golden Marigold (Calendula)', family: 'Asteraceae', use: 'Wound closure, burns, decoctions' },
            { id: 'poppy', name: 'Slumbering Poppy (Papaver Somniferum)', family: 'Papaveraceae', use: 'Severe trauma analgesia, stamina numbness' },
            { id: 'thistle', name: 'Sovereign Thistle (Silybum)', family: 'Cardueae', use: 'Venom neutralization, liver cleansing' },
            { id: 'bloodflower', name: 'Scarlet Bloodflower (Asclepias)', family: 'Apocynaceae', use: 'Arterial clotting, anti-gangrene' },
            { id: 'fungi', name: 'Crypt Spore Caps (Psilocybe Crypta)', family: 'Hymenogastraceae', use: 'Sensory confusion, tavern toxins' }
        ];
    }

    update(delta) {
        // Drying racks progress
        for (const rack of this.dryingRacks) {
            if (!rack.completed) {
                rack.progress = Math.min(100, rack.progress + delta * 2.5);
                if (rack.progress >= 100) {
                    rack.completed = true;
                    if (this.herbs[rack.herb]) this.herbs[rack.herb].dried += 2;
                }
            }
        }

        // Alembic distillation heat decay & process
        if (this.alembic.isDistilling) {
            // Temperature naturally drops towards room temp (24°C)
            this.alembic.currentTempC = Math.max(24, this.alembic.currentTempC - delta * 4.5);

            // If within optimal gold temperature window (78°C - 84°C)
            if (this.alembic.currentTempC >= this.alembic.targetMin && this.alembic.currentTempC <= this.alembic.targetMax) {
                this.alembic.distillProgress += delta * 14.0;
                if (this.alembic.distillProgress >= 100) {
                    this._completeDistillation();
                }
            }
        }

        // Poppy Pain-Numbing Buff Timer
        if (this.poppyBuffActive) {
            this.poppyBuffTimer -= delta;
            if (this.game && this.game.combat) {
                this.game.combat.stamina = this.game.combat.maxStamina; // Zero stamina exhaustion
            }
            if (this.poppyBuffTimer <= 0) {
                this.poppyBuffActive = false;
                if (this.game) this.game.showNotification("POPPY EXTRACT WORE OFF: Stamina exertion returned to normal");
            }
        }
    }

    // ----------------------------------------------------------------
    // 411. LEECHCRAFT & BLOODLETTING
    // ----------------------------------------------------------------
    applyLeeches() {
        if (this.leechcraft.leechesInJar <= 0) {
            if (this.game) this.game.showNotification("⚠️ JAR EMPTY: Harvest leeches from the riverbank");
            return false;
        }

        this.leechcraft.leechesInJar--;
        this.leechcraft.feverToxinPurged += 40;

        if (this.audio) this.audio.playWaterSplash();
        if (this.game && this.game.combat) {
            // Minor blood cost (-40 HP) in exchange for purging all toxicity / status buildup
            this.game.combat.hp = Math.max(20, this.game.combat.hp - 40);
            this.game.showNotification("🪱 LEECHCRAFT PERFORMED: Bad blood drained! Toxins purged (-40 HP blood sacrifice).");
        }
        return true;
    }

    // ----------------------------------------------------------------
    // 412. BONE SETTING & SPLINTING
    // ----------------------------------------------------------------
    setFracture(alignmentDegree) {
        this.boneFracture.boneAlignmentPct = Math.min(100, Math.max(0, alignmentDegree));
        if (this.boneFracture.boneAlignmentPct >= 85) {
            this.boneFracture.isFractured = false;
            this.boneFracture.splintApplied = true;
            if (this.audio) this.audio.playBlock();
            if (this.game) {
                this.game.showNotification("🦴 BONE SET & SPLINTED! Full running and rolling speed restored!");
            }
            return true;
        }
        return false;
    }

    // ----------------------------------------------------------------
    // 414. MORTAR & PESTLE GRINDING
    // ----------------------------------------------------------------
    grindPestle() {
        this.mortarPestle.crushProgress += 18.0;
        this.mortarPestle.grindAngle = (this.mortarPestle.grindAngle + 75) % 360;

        if (this.audio) this.audio.playMortarGrind();

        if (this.mortarPestle.crushProgress >= 100) {
            this.mortarPestle.crushProgress = 0;
            this.mortarPestle.finePowderYield++;
            const herbData = this.herbs[this.mortarPestle.activeHerb];
            if (herbData && herbData.dried > 0) herbData.dried--;
            if (this.game) {
                this.game.showNotification("🥣 HERB CRUSHED: Refined into pure alchemical powder!");
            }
        }

        return this.mortarPestle.crushProgress;
    }

    // ----------------------------------------------------------------
    // 415. ALEMBIC DISTILLATION & BELLOWS HEAT
    // ----------------------------------------------------------------
    pumpBellows() {
        this.alembic.isDistilling = true;
        this.alembic.currentTempC = Math.min(115, this.alembic.currentTempC + 8.5);

        if (this.audio) this.audio.playAlembicBellows();
        return this.alembic.currentTempC;
    }

    _completeDistillation() {
        this.alembic.distillProgress = 0;
        this.alembic.isDistilling = false;

        if (this.alembic.activeFormula === 'poppy') {
            this.craftedMeds.poppyExtracts++;
            if (this.game) this.game.showNotification("🧪 DISTILLATION COMPLETE: +1 Refined Poppy Extract bottled!");
        } else if (this.alembic.activeFormula === 'antidote') {
            this.craftedMeds.venomAntidotes++;
            if (this.game) this.game.showNotification("🧪 DISTILLATION COMPLETE: +1 Sovereign Antidote Elixir bottled!");
        } else {
            this.craftedMeds.marigoldDecoctions++;
            if (this.game) this.game.showNotification("🧪 DISTILLATION COMPLETE: +1 Marigold Healing Decoction bottled!");
        }

        if (this.audio) this.audio.playVictory();
    }

    // ----------------------------------------------------------------
    // 416. OPIOID POPPY EXTRACTION USE
    // ----------------------------------------------------------------
    drinkPoppyExtract() {
        if (this.craftedMeds.poppyExtracts <= 0) {
            if (this.game) this.game.showNotification("⚠️ No Poppy Extracts left in satchel!");
            return false;
        }

        this.craftedMeds.poppyExtracts--;
        this.poppyBuffActive = true;
        this.poppyBuffTimer = 25.0; // 25s zero stamina exhaustion

        if (this.audio) this.audio.playEstusDrink();
        if (this.game) {
            this.game.showNotification("🌸 POPPY TINCTURE CONSUMED: All stamina exhaustion eliminated for 25s!");
        }
        return true;
    }

    // ----------------------------------------------------------------
    // 417. ANTIDOTE SYNTHESIS USE
    // ----------------------------------------------------------------
    drinkAntidote() {
        if (this.craftedMeds.venomAntidotes <= 0) {
            if (this.game) this.game.showNotification("⚠️ No Antidotes left in satchel!");
            return false;
        }

        this.craftedMeds.venomAntidotes--;
        if (this.audio) this.audio.playEstusDrink();
        if (this.game) {
            this.game.showNotification("🌿 SOVEREIGN ANTIDOTE CONSUMED: Poison & toxic bloodstream venom eliminated!");
        }
        return true;
    }

    // ----------------------------------------------------------------
    // 418. BANDAGE STERILIZATION & APPLICATION
    // ----------------------------------------------------------------
    boilSterileBandages() {
        this.craftedMeds.sterileBandages += 2;
        if (this.audio) this.audio.playWaterSplash();
        if (this.game) {
            this.game.showNotification("🩹 LINEN BOILED: +2 Sterile Bandages ready (Guaranteed 0% Sepsis/Gangrene)");
        }
    }

    applySterileBandage() {
        if (this.craftedMeds.sterileBandages <= 0) {
            if (this.game) this.game.showNotification("⚠️ No sterile bandages in pouch! Boil linen in cauldron.");
            return false;
        }

        this.craftedMeds.sterileBandages--;
        if (this.audio) this.audio.playEstusDrink();
        if (this.game && this.game.combat) {
            this.game.combat.hp = Math.min(this.game.combat.maxHp, this.game.combat.hp + 280);
            this.game.showNotification("🩹 STERILE BANDAGE APPLIED: Wounds cleanly dressed! +280 HP restored!");
        }
        return true;
    }

    // ----------------------------------------------------------------
    // 420. POISONOUS SPORE EXTRACTION
    // ----------------------------------------------------------------
    extractToxicSpores() {
        if (this.herbs.spores.raw <= 0) return false;
        this.herbs.spores.raw--;
        this.herbs.spores.dried++;
        if (this.audio) this.audio.playAlembicBellows();
        if (this.game) {
            this.game.showNotification("🍄 SPORES HARVESTED: Hallucinogenic dust ready for blade coating or food toxins.");
        }
        return true;
    }
}

window.ApothecaryCraftingSystem = ApothecaryCraftingSystem;
