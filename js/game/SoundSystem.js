export class SoundSystem {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.3; // Default volume
        this.enabled = true;

        // 背景音乐 - 轻松欢快风格
        this.bgm = new Audio('happy-music-new.mp3');
        this.bgm.loop = true;
        this.bgm.volume = 0.4;
    }

    startBGM() {
        if (this.enabled && this.bgm) {
            this.bgm.play().catch(e => console.log('BGM play failed:', e));
        }
    }

    stopBGM() {
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.currentTime = 0;
        }
    }

    pauseBGM() {
        if (this.bgm) {
            this.bgm.pause();
        }
    }

    resumeBGM() {
        if (this.bgm && this.enabled) {
            this.bgm.play().catch(e => console.log('BGM resume failed:', e));
        }
    }

    play(type) {
        if (!this.enabled) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        switch (type) {
            case 'collect':
                this.playTone(880, 'sine', 0.1);
                this.playTone(1760, 'sine', 0.1, 0.05);
                break;
            case 'gold':
                this.playTone(1200, 'square', 0.1);
                this.playTone(2000, 'square', 0.2, 0.05);
                break;
            case 'lion':
                // Powerup sound: Ascending slide
                this.playSlide(400, 1200, 0.5);
                break;
            case 'bomb':
                this.playNoise(0.5);
                break;
            case 'complete':
                // Major chord arpeggio
                this.playTone(523.25, 'triangle', 0.3, 0);   // C5
                this.playTone(659.25, 'triangle', 0.3, 0.1); // E5
                this.playTone(783.99, 'triangle', 0.4, 0.2); // G5
                this.playTone(1046.50, 'triangle', 0.6, 0.3);// C6
                break;
            case 'tick':
                this.playTone(400, 'sine', 0.05);
                break;
        }
    }

    playTone(freq, type, duration, delay = 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + delay + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + duration);
    }

    playSlide(startFreq, endFreq, duration) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playNoise(duration) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        noise.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
    }
}
