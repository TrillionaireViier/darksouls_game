// ==========================================
// DARK SOULS PROCEDURAL WEB AUDIO SYNTHESIZER
// High fidelity procedural sound effects & dynamic music
// ==========================================

class DarkSoulsAudio {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.isMuted = false;
        this.bgmPlaying = false;
        this.bossBgmActive = false;
        this.bgmTimer = null;
        this.ambientGain = null;
        this.initOnFirstGesture();
    }

    initOnFirstGesture() {
        const unlock = () => {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                this.ctx = new AudioCtx();
                
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
                this.masterGain.connect(this.ctx.destination);

                this.sfxGain = this.ctx.createGain();
                this.sfxGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
                this.sfxGain.connect(this.masterGain);

                this.musicGain = this.ctx.createGain();
                this.musicGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
                this.musicGain.connect(this.masterGain);

                this.startAmbientDrone();
            } else if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            window.removeEventListener('click', unlock);
            window.removeEventListener('keydown', unlock);
            window.removeEventListener('touchstart', unlock);
        };
        window.addEventListener('click', unlock);
        window.addEventListener('keydown', unlock);
        window.addEventListener('touchstart', unlock);
    }

    ensureContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
                this.masterGain.connect(this.ctx.destination);

                this.sfxGain = this.ctx.createGain();
                this.sfxGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
                this.sfxGain.connect(this.masterGain);

                this.musicGain = this.ctx.createGain();
                this.musicGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
                this.musicGain.connect(this.masterGain);
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime, 0.05);
        }
        return this.isMuted;
    }

    // ----------------------------------------------------
    // SFX: WEAPON SWING
    // ----------------------------------------------------
    playSwing(isHeavy = false) {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // White noise swoosh with bandpass filter sweep
        const bufferSize = this.ctx.sampleRate * (isHeavy ? 0.35 : 0.22);
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(3.0, now);
        filter.frequency.setValueAtTime(isHeavy ? 180 : 350, now);
        filter.frequency.exponentialRampToValueAtTime(isHeavy ? 900 : 1600, now + (isHeavy ? 0.15 : 0.08));
        filter.frequency.exponentialRampToValueAtTime(80, now + (isHeavy ? 0.35 : 0.22));

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.01, now);
        gainNode.gain.linearRampToValueAtTime(isHeavy ? 0.5 : 0.35, now + 0.04);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + (isHeavy ? 0.35 : 0.22));

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxGain);

        whiteNoise.start(now);
    }

    // ----------------------------------------------------
    // SFX: WEAPON HIT / FLESH IMPACT
    // ----------------------------------------------------
    playHit(isCrit = false) {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Low impact punch
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = isCrit ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(isCrit ? 140 : 110, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + (isCrit ? 0.35 : 0.2));

        oscGain.gain.setValueAtTime(isCrit ? 0.8 : 0.6, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + (isCrit ? 0.35 : 0.2));

        osc.connect(oscGain);
        oscGain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + (isCrit ? 0.4 : 0.25));

        // High crunch/slice noise
        const len = this.ctx.sampleRate * 0.15;
        const b = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = b.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.2));
        const noise = this.ctx.createBufferSource();
        noise.buffer = b;

        const f = this.ctx.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.setValueAtTime(isCrit ? 600 : 1200, now);

        const g = this.ctx.createGain();
        g.gain.setValueAtTime(isCrit ? 0.7 : 0.4, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        noise.connect(f);
        f.connect(g);
        g.connect(this.sfxGain);
        noise.start(now);
    }

    // ----------------------------------------------------
    // SFX: SHIELD BLOCK (METALLIC CLANG)
    // ----------------------------------------------------
    playBlock() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Two metal resonant frequencies
        [520, 1140, 2400].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.95, now + 0.3);

            const vol = 0.4 / (idx + 1);
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35 + idx * 0.1);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 0.5);
        });

        // Fast high-pitch clank
        const oscClank = this.ctx.createOscillator();
        const gainClank = this.ctx.createGain();
        oscClank.type = 'square';
        oscClank.frequency.setValueAtTime(800, now);
        oscClank.frequency.exponentialRampToValueAtTime(150, now + 0.08);
        gainClank.gain.setValueAtTime(0.4, now);
        gainClank.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        oscClank.connect(gainClank);
        gainClank.connect(this.sfxGain);
        oscClank.start(now);
        oscClank.stop(now + 0.1);
    }

    // ----------------------------------------------------
    // SFX: DARK SOULS PARRY (THE ICONIC BELL CHIME)
    // ----------------------------------------------------
    playParry() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Pure crystalline chime frequencies with harmonics
        const freqs = [880, 1760, 2640, 3520];
        freqs.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            const amp = [0.6, 0.4, 0.25, 0.15][i];
            gain.gain.setValueAtTime(amp, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6 - (i * 0.2));

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 1.7);
        });

        // Visceral low resonant bell body
        const lowOsc = this.ctx.createOscillator();
        const lowGain = this.ctx.createGain();
        lowOsc.type = 'triangle';
        lowOsc.frequency.setValueAtTime(220, now);
        lowGain.gain.setValueAtTime(0.5, now);
        lowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        lowOsc.connect(lowGain);
        lowGain.connect(this.sfxGain);
        lowOsc.start(now);
        lowOsc.stop(now + 0.9);
    }

    // ----------------------------------------------------
    // SFX: RIPOSTE (CRITICAL VISCERAL STAB)
    // ----------------------------------------------------
    playRiposte() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Low heavy strike
        const bass = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bass.type = 'sawtooth';
        bass.frequency.setValueAtTime(120, now);
        bass.frequency.exponentialRampToValueAtTime(35, now + 0.5);
        bassGain.gain.setValueAtTime(0.9, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        bass.connect(bassGain);
        bassGain.connect(this.sfxGain);
        bass.start(now);
        bass.stop(now + 0.6);

        // Gore squelch
        setTimeout(() => {
            this.playHit(true);
        }, 80);
    }

    // ----------------------------------------------------
    // SFX: ROLL / DODGE
    // ----------------------------------------------------
    playRoll() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const dur = 0.25;
        const b = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
        const d = b.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * (i / d.length));

        const noise = this.ctx.createBufferSource();
        noise.buffer = b;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.linearRampToValueAtTime(650, now + 0.1);
        filter.frequency.linearRampToValueAtTime(150, now + dur);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start(now);
    }

    // ----------------------------------------------------
    // SFX: DRINK ESTUS FLASK
    // ----------------------------------------------------
    playEstusDrink() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Cork pop
        const pop = this.ctx.createOscillator();
        const popGain = this.ctx.createGain();
        pop.type = 'sine';
        pop.frequency.setValueAtTime(320, now);
        pop.frequency.exponentialRampToValueAtTime(750, now + 0.04);
        popGain.gain.setValueAtTime(0.5, now);
        popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        pop.connect(popGain);
        popGain.connect(this.sfxGain);
        pop.start(now);
        pop.stop(now + 0.06);

        // Liquid swallow / gulp
        setTimeout(() => {
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
            const gulp = this.ctx.createOscillator();
            const gGain = this.ctx.createGain();
            gulp.type = 'triangle';
            gulp.frequency.setValueAtTime(190, t);
            gulp.frequency.exponentialRampToValueAtTime(130, t + 0.12);
            gGain.gain.setValueAtTime(0.4, t);
            gGain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
            gulp.connect(gGain);
            gGain.connect(this.sfxGain);
            gulp.start(t);
            gulp.stop(t + 0.15);
        }, 150);

        // Radiant golden shimmer chords
        const shimmerNotes = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
        shimmerNotes.forEach((freq, idx) => {
            setTimeout(() => {
                if (!this.ctx) return;
                const t = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, t);
                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(t);
                osc.stop(t + 0.9);
            }, 300 + idx * 90);
        });
    }

    // ----------------------------------------------------
    // SFX: BONFIRE LIT / RESTING
    // ----------------------------------------------------
    playBonfireIgnite() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Roaring flame whoosh
        const dur = 2.0;
        const b = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
        const d = b.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.4));
        const fire = this.ctx.createBufferSource();
        fire.buffer = b;

        const f = this.ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.setValueAtTime(150, now);
        f.frequency.linearRampToValueAtTime(550, now + 0.4);
        f.frequency.linearRampToValueAtTime(80, now + dur);

        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.05, now);
        g.gain.linearRampToValueAtTime(0.7, now + 0.2);
        g.gain.exponentialRampToValueAtTime(0.001, now + dur);

        fire.connect(f);
        f.connect(g);
        g.connect(this.sfxGain);
        fire.start(now);

        // Mystical low bell chime
        [164.81, 246.94, 329.63].forEach((fVal, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(fVal, now + 0.1);
            gain.gain.setValueAtTime(0.4 / (idx + 1), now + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + 0.1);
            osc.stop(now + 2.6);
        });
    }

    // ----------------------------------------------------
    // SFX: "YOU DIED" (DARK SOULS TRADEMARK CHORD)
    // ----------------------------------------------------
    playYouDied() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Haunting low D minor funeral chord (D2, A2, F3, D3)
        const notes = [73.42, 110.00, 146.83, 174.61];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now);

            // Filter for dark choir timbre
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(260 + idx * 50, now);
            filter.Q.setValueAtTime(4.0, now);

            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.4, now + 0.6);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 4.6);
        });

        // Ominous deep death gong strike
        const gong = this.ctx.createOscillator();
        const gongGain = this.ctx.createGain();
        gong.type = 'sine';
        gong.frequency.setValueAtTime(55, now);
        gongGain.gain.setValueAtTime(0.8, now);
        gongGain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);
        gong.connect(gongGain);
        gongGain.connect(this.sfxGain);
        gong.start(now);
        gong.stop(now + 3.6);
    }

    // ----------------------------------------------------
    // SFX: "VICTORY ACHIEVED" / BOSS DEFEATED
    // ----------------------------------------------------
    playVictory() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Grand heroic brass major triad
        const triad = [261.63, 329.63, 392.00, 523.25];
        triad.forEach((freq) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.35, now + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 4.0);
        });
    }

    // ----------------------------------------------------
    // SFX: FOOTSTEP & LIQUID SPLASH
    // ----------------------------------------------------
    playFootstep() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(95 + Math.random() * 20, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.1);
    }

    playWaterSplash() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Low bubble/drop oscillator
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220 + Math.random() * 80, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

        // Filtered white noise splash
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(650, now);
        filter.Q.setValueAtTime(3.5, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.22, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        noise.start(now);
        osc.stop(now + 0.2);
        noise.stop(now + 0.2);
    }

    playPlungingSlam() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Sub bass crater shock
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(28, now + 0.45);

        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.55);

        // Heavy stone fracture crunch
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(550, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.35);

        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.55, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(this.sfxGain);
        noise.start(now);
        noise.stop(now + 0.4);
    }

    playGuardCounter() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // High metallic chime ring
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1320, now);
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.4);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1760, now);
        osc2.frequency.exponentialRampToValueAtTime(1100, now + 0.35);

        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
    }

    // ----------------------------------------------------
    // SFX: BOSS ROAR & SLAM
    // ----------------------------------------------------
    playBossRoar() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.4);
        osc.frequency.exponentialRampToValueAtTime(45, now + 1.2);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.Q.setValueAtTime(6.0, now);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.7, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 1.4);
    }

    playBossSlam() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Sub rumble
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(60, now);
        sub.frequency.exponentialRampToValueAtTime(15, now + 0.7);
        subGain.gain.setValueAtTime(0.9, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        sub.connect(subGain);
        subGain.connect(this.sfxGain);
        sub.start(now);
        sub.stop(now + 0.85);

        // Ground stone crack
        const len = this.ctx.sampleRate * 0.35;
        const b = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = b.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.15));
        const noise = this.ctx.createBufferSource();
        noise.buffer = b;

        const f = this.ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.setValueAtTime(500, now);

        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.7, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        noise.connect(f);
        f.connect(g);
        g.connect(this.sfxGain);
        noise.start(now);
    }

    // ----------------------------------------------------
    // SFX: UNIQUE BOSS AUDIO (Gargoyle, Capra, Sif, Gwyn)
    // ----------------------------------------------------
    playWolfHowl() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.4);
        osc.frequency.exponentialRampToValueAtTime(320, now + 1.2);
        osc.frequency.exponentialRampToValueAtTime(180, now + 2.0);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.55, now + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 2.2);
    }

    playFireBreath() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        const dur = 1.2;
        const b = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
        const d = b.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * (i / d.length));

        const noise = this.ctx.createBufferSource();
        noise.buffer = b;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, now);
        filter.Q.setValueAtTime(2.5, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.65, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start(now);
    }

    playBellToll() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        [174.61, 349.23, 523.25, 698.46].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.4 / (idx + 1), now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 3.0);
        });
    }

    playSunlightFlame() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Radiant sunlight choir tone
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(293.66, now); // D4
        osc.frequency.linearRampToValueAtTime(440, now + 0.5);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 1.3);

        this.playBossSlam();
    }

    // ----------------------------------------------------
    // BACKGROUND AMBIENT DRONE & MUSIC
    // ----------------------------------------------------
    startAmbientDrone() {
        if (!this.ctx || this.ambientGain) return;
        const now = this.ctx.currentTime;

        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(0.2, now);
        this.ambientGain.connect(this.musicGain);

        // Dual detuned subterranean drone
        [55.0, 55.4].forEach(f => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now);
            osc.connect(this.ambientGain);
            osc.start(now);
        });

        // Loop periodic dark gothic chord swell
        this.startPeriodicMusicLoop();
    }

    startPeriodicMusicLoop() {
        if (this.bgmTimer) return;
        let step = 0;
        const chords = [
            [55.0, 82.4, 110.0], // A minor
            [49.0, 73.4, 98.0],  // G
            [43.65, 65.4, 87.3], // F
            [41.2, 61.7, 82.4]   // E
        ];

        this.bgmTimer = setInterval(() => {
            if (!this.ctx || this.isMuted) return;
            const now = this.ctx.currentTime;

            if (this.bossBgmActive) {
                // Intense Boss War Drum Beat
                this.playBossDrumBeat();
            } else {
                // Atmospheric Dark Ambient swell every 8 seconds
                if (step % 4 === 0) {
                    const chord = chords[(step / 4) % chords.length];
                    chord.forEach((freq, idx) => {
                        const osc = this.ctx.createOscillator();
                        const gain = this.ctx.createGain();
                        osc.type = 'sawtooth';
                        osc.frequency.setValueAtTime(freq * 2, now);

                        const filter = this.ctx.createBiquadFilter();
                        filter.type = 'lowpass';
                        filter.frequency.setValueAtTime(180, now);
                        filter.frequency.linearRampToValueAtTime(320, now + 2.0);
                        filter.frequency.linearRampToValueAtTime(140, now + 4.5);

                        gain.gain.setValueAtTime(0.001, now);
                        gain.gain.linearRampToValueAtTime(0.08 / (idx + 1), now + 2.0);
                        gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.0);

                        osc.connect(filter);
                        filter.connect(gain);
                        gain.connect(this.musicGain);
                        osc.start(now);
                        osc.stop(now + 5.2);
                    });
                }
            }
            step++;
        }, 1000);
    }

    playBossDrumBeat() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Heavy taiko/war drum
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + 0.4);
    }

    setBossMusic(active) {
        this.bossBgmActive = active;
        if (active && this.musicGain && this.ctx) {
            this.musicGain.gain.setTargetAtTime(0.85, this.ctx.currentTime, 0.5);
        } else if (this.musicGain && this.ctx) {
            this.musicGain.gain.setTargetAtTime(0.5, this.ctx.currentTime, 1.0);
        }
    }

    // ==========================================
    // PROCEDURAL AUDIO: SIEGE, HERALDRY & APOTHECARY
    // ==========================================

    playWarHorn() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Multi-oscillator deep brass battle horn
        const freqs = [110, 164.8, 220, 329.6]; // A2, E3, A3, E4 chord
        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
            
            // Subtle brass vibrato
            osc.frequency.setValueAtTime(freq * 0.96, now);
            osc.frequency.exponentialRampToValueAtTime(freq, now + 0.18);
            osc.frequency.setValueAtTime(freq, now + 1.2);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + 2.2);

            gain.gain.setValueAtTime(0.01, now);
            gain.gain.exponentialRampToValueAtTime(0.28 / (idx + 1), now + 0.22);
            gain.gain.setValueAtTime(0.24 / (idx + 1), now + 1.4);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 2.5);
        });
    }

    playTrebuchetLaunch() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Heavy wooden winch creak & whoosh
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(45, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.4);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.9);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 1.0);

        // Exploding fiery projectile impact after 1.1s
        setTimeout(() => {
            if (!this.ctx || this.isMuted) return;
            const t = this.ctx.currentTime;
            const imp = this.ctx.createOscillator();
            const impG = this.ctx.createGain();
            imp.type = 'triangle';
            imp.frequency.setValueAtTime(180, t);
            imp.frequency.exponentialRampToValueAtTime(25, t + 0.7);

            impG.gain.setValueAtTime(0.65, t);
            impG.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

            imp.connect(impG);
            impG.connect(this.masterGain);
            imp.start(t);
            imp.stop(t + 0.8);
        }, 1100);
    }

    playBoilingOil() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // White noise sizzling burst
        const bufferSize = this.ctx.sampleRate * 1.2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.6));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1800, now);
        filter.frequency.exponentialRampToValueAtTime(600, now + 1.1);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(now);
    }

    playCaltropDrop() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // 3 staggered high-pitch metal clicks (caltrops scattering on stone)
        [0, 0.08, 0.16, 0.22].forEach((offset, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const f = 1400 + idx * 300 + Math.random() * 200;
            osc.frequency.setValueAtTime(f, now + offset);
            osc.frequency.exponentialRampToValueAtTime(f * 0.4, now + offset + 0.06);

            gain.gain.setValueAtTime(0.25, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + offset);
            osc.stop(now + offset + 0.08);
        });
    }

    playMortarGrind() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Friction noise of stone pestle in mortar
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(160, now + 0.25);
        osc.frequency.linearRampToValueAtTime(70, now + 0.5);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.6);
    }

    playAlembicBellows() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Air bellows whoosh and bubbling glass elixir
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.6);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.7);
    }

    playChivalricFanfare() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Regal court brass fanfare: C4 - G4 - C5
        const notes = [261.6, 329.6, 392.0, 523.2];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const offset = idx * 0.15;
            osc.frequency.setValueAtTime(freq, now + offset);

            gain.gain.setValueAtTime(0.3, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.55);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + offset);
            osc.stop(now + offset + 0.6);
        });
    }

    // ----------------------------------------------------
    // TORCH PROCEDURAL AUDIO (IGNITE, SIZZLE & SWING)
    // ----------------------------------------------------
    playTorchIgnite() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // 1. Flint Spark Strike (sharp metallic click)
        const flintOsc = this.ctx.createOscillator();
        const flintGain = this.ctx.createGain();
        flintOsc.type = 'triangle';
        flintOsc.frequency.setValueAtTime(2800, now);
        flintOsc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
        flintGain.gain.setValueAtTime(0.35, now);
        flintGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        flintOsc.connect(flintGain);
        flintGain.connect(this.sfxGain);
        flintOsc.start(now);
        flintOsc.stop(now + 0.07);

        // 2. Roaring Pitch Flame Ignition (resonant warm white noise burst)
        const dur = 1.2;
        const b = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
        const d = b.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
            d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.45));
        }
        const fire = this.ctx.createBufferSource();
        fire.buffer = b;

        const f = this.ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.setValueAtTime(180, now);
        f.frequency.linearRampToValueAtTime(750, now + 0.15);
        f.frequency.linearRampToValueAtTime(220, now + dur);

        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.05, now);
        g.gain.linearRampToValueAtTime(0.65, now + 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, now + dur);

        fire.connect(f);
        f.connect(g);
        g.connect(this.sfxGain);
        fire.start(now + 0.02);
    }

    playTorchSizzle() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Water steam hiss / extinguishing fizzle
        const dur = 0.8;
        const b = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
        const d = b.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
            d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = b;

        const f = this.ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.Q.setValueAtTime(4.0, now);
        f.frequency.setValueAtTime(3200, now);
        f.frequency.exponentialRampToValueAtTime(800, now + dur);

        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.4, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + dur);

        noise.connect(f);
        f.connect(g);
        g.connect(this.sfxGain);
        noise.start(now);
    }

    playTorchSwing() {
        this.ensureContext();
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;

        // Flaming swoosh: low frequency air rush combined with crackling fire
        const dur = 0.32;
        const b = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
        const d = b.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
            d[i] = (Math.random() * 2 - 1);
        }
        const src = this.ctx.createBufferSource();
        src.buffer = b;

        const f = this.ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.Q.setValueAtTime(2.2, now);
        f.frequency.setValueAtTime(260, now);
        f.frequency.exponentialRampToValueAtTime(1100, now + 0.12);
        f.frequency.exponentialRampToValueAtTime(140, now + dur);

        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.05, now);
        g.gain.linearRampToValueAtTime(0.55, now + 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + dur);

        src.connect(f);
        f.connect(g);
        g.connect(this.sfxGain);
        src.start(now);
    }
}

// Global audio singleton
window.dsAudio = new DarkSoulsAudio();
