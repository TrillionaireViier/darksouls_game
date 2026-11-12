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
    // SFX: FOOTSTEP
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
}

// Global audio singleton
window.dsAudio = new DarkSoulsAudio();
