class AudioController {
    constructor() {
        this.audioCtx = null;
        this.muted = false;
        
        // Lazy initialization on first user interaction
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
            this.initialized = true;
        } catch (e) {
            console.warn("Web Audio API not supported");
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    playTone(frequency, type, duration, volume = 0.1) {
        if (!this.initialized || this.muted || !this.audioCtx) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

        gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + duration);
    }

    playChomp() {
        this.playTone(400, 'triangle', 0.1, 0.2);
    }
    
    playPowerPellet() {
        this.playTone(800, 'sine', 0.1, 0.2);
    }

    playGhostEat() {
        this.playTone(1200, 'square', 0.2, 0.3);
    }

    playDeath() {
        if (!this.initialized || this.muted || !this.audioCtx) return;
        
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.audioCtx.currentTime + 1.5);

        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 1.5);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 1.5);
    }

    playStart() {
        // Simple start jingle
        if (!this.initialized || this.muted) return;
        
        const notes = [
            { f: 523.25, d: 0.15 }, // C5
            { f: 659.25, d: 0.15 }, // E5
            { f: 783.99, d: 0.15 }, // G5
            { f: 1046.50, d: 0.3 }  // C6
        ];
        
        let startTime = this.audioCtx.currentTime;
        
        notes.forEach(note => {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            
            osc.type = 'square';
            osc.frequency.value = note.f;
            
            gain.gain.setValueAtTime(0.1, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.d);
            
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + note.d);
            
            startTime += note.d;
        });
    }
}

export default new AudioController();
