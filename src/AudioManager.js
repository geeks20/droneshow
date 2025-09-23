export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.masterGain = null;
        this.audioBuffer = null;
        this.loadingAudio = false;
    }
    
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.3; // Set volume to 30%
            this.masterGain.connect(this.audioContext.destination);
            this.initialized = true;
            
            // Load the Saudi audio file
            this.loadAudioFile();
        } catch (e) {
            // Web Audio API not supported
        }
    }
    
    async loadAudioFile() {
        if (this.loadingAudio || this.audioBuffer) return;
        
        this.loadingAudio = true;
        try {
            const response = await fetch('/ksa_manar_al_huda.mp3');
            const arrayBuffer = await response.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            // Audio loaded successfully
        } catch (error) {
            // Failed to load audio file
        } finally {
            this.loadingAudio = false;
        }
    }
    
    // Play a segment of the Saudi audio file
    playAudioSegment(startTime = 0, duration = 2, volume = 0.5) {
        if (!this.audioContext || !this.audioBuffer) {
            // Audio file not loaded yet
            return;
        }
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = this.audioBuffer;
        
        // Create envelope for smooth fade in/out
        const gainNode = this.audioContext.createGain();
        const now = this.audioContext.currentTime;
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + 0.05); // Fade in
        gainNode.gain.setValueAtTime(volume, now + duration - 0.2);
        gainNode.gain.linearRampToValueAtTime(0, now + duration); // Fade out
        
        source.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        source.start(0, startTime, duration);
    }
    
    // Play background music
    playBackgroundMusic() {
        if (!this.audioContext || !this.audioBuffer) return;
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Stop any existing background music
        if (this.backgroundSource) {
            this.backgroundSource.stop();
        }
        
        this.backgroundSource = this.audioContext.createBufferSource();
        this.backgroundSource.buffer = this.audioBuffer;
        this.backgroundSource.loop = true;
        
        // Create gain node for background music
        this.backgroundGain = this.audioContext.createGain();
        this.backgroundGain.gain.value = 0.15; // Lower volume for background
        
        this.backgroundSource.connect(this.backgroundGain);
        this.backgroundGain.connect(this.masterGain);
        
        this.backgroundSource.start();
    }
    
    stopBackgroundMusic() {
        if (this.backgroundSource) {
            this.backgroundSource.stop();
            this.backgroundSource = null;
        }
    }
    
    // Text reveal sound
    playRevealTone() {
        if (!this.initialized) this.init();
        
        // Play from 5 seconds in for 1.5 seconds
        this.playAudioSegment(5, 1.5);
    }
    
    // Flag reveal sound
    playFlagRevealTone() {
        if (!this.initialized) this.init();
        
        // Play from 15 seconds in for 3 seconds (more celebratory part)
        this.playAudioSegment(15, 3);
    }
    
    // Icon transition sound
    playIconTone() {
        if (!this.initialized) this.init();
        
        // Play from 10 seconds in for 0.8 seconds (quick transition)
        this.playAudioSegment(10, 0.8);
    }
}