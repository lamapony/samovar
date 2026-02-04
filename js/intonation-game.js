/**
 * Intonation Game Engine
 * Simulates a string-like interaction with text and synthesizes audio based on curvature.
 */

class IntonationGame {
    constructor(containerId, word = "ЗДРАВСТВУЙТЕ") {
        this.container = document.getElementById(containerId);
        this.word = word;
        this.letters = [];
        this.isAudioContextStarted = false;
        this.audioCtx = null;
        this.oscillator = null;
        this.gainNode = null;
        
        // Physics constants
        this.mouse = { x: -1000, y: 0 };
        this.isHovering = false;
        this.baseY = 0; // Will be set on resize
        
        this.init();
    }

    init() {
        if (!this.container) {
            console.error('IntonationGame: Container not found!');
            return;
        }
        
        console.log('IntonationGame: Initializing...', this.container);
        this.container.innerHTML = '';
        this.container.className = 'intonation-game-container';
        
        // Create "Click to Start" overlay for AudioContext policy
        this.overlay = document.createElement('div');
        this.overlay.className = 'intonation-overlay';
        this.overlay.innerHTML = '<span>Нажмите, чтобы включить звук</span>';
        this.overlay.addEventListener('click', () => this.startAudio());
        this.container.appendChild(this.overlay);

        // Create the visual string line
        this.stringLine = document.createElement('div');
        this.stringLine.className = 'intonation-string';
        this.container.appendChild(this.stringLine);

        // Create letter elements
        const letterContainer = document.createElement('div');
        letterContainer.className = 'intonation-letters';
        
        this.word.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.className = 'intonation-char';
            span.dataset.index = index;
            letterContainer.appendChild(span);
            
            this.letters.push({
                element: span,
                x: 0,
                y: 0,
                vy: 0, // Velocity Y
                baseX: 0
            });
        });
        
        this.container.appendChild(letterContainer);

        // Event Listeners
        this.container.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.container.addEventListener('mouseleave', () => this.handleMouseLeave());
        
        // Mobile support
        this.container.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.container.getBoundingClientRect();
            this.updateMouse(touch.clientX - rect.left, touch.clientY - rect.top);
        }, { passive: false });
        this.container.addEventListener('touchstart', (e) => {
             if (!this.isAudioContextStarted) this.startAudio();
        }, { passive: true });
        this.container.addEventListener('touchend', () => this.handleMouseLeave());

        // Animation Loop
        this.resize();
        window.addEventListener('resize', () => this.resize());
        console.log('IntonationGame: Setup complete. Letters:', this.letters.length);
        this.animate();
    }

    startAudio() {
        if (this.isAudioContextStarted) return;
        
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
        
        this.oscillator = this.audioCtx.createOscillator();
        this.gainNode = this.audioCtx.createGain();
        
        this.oscillator.type = 'sine';
        this.oscillator.frequency.value = 440;
        this.gainNode.gain.value = 0;
        
        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.audioCtx.destination);
        this.oscillator.start();
        
        this.isAudioContextStarted = true;
        this.overlay.style.opacity = '0';
        this.overlay.style.pointerEvents = 'none';
    }

    handleMouseMove(e) {
        const rect = this.container.getBoundingClientRect();
        this.updateMouse(e.clientX - rect.left, e.clientY - rect.top);
    }

    updateMouse(x, y) {
        this.mouse.x = x;
        this.mouse.y = y;
        this.isHovering = true;
        
        if (this.isAudioContextStarted) {
            // Fade in sound
            this.gainNode.gain.setTargetAtTime(0.5, this.audioCtx.currentTime, 0.1);
        }
    }

    handleMouseLeave() {
        this.isHovering = false;
        if (this.isAudioContextStarted) {
            // Fade out sound
            this.gainNode.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.1);
        }
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.baseY = rect.height / 2;
        
        // Update base positions for letters
        this.letters.forEach(letter => {
            const letterRect = letter.element.getBoundingClientRect();
            // Calculate center of letter relative to container
            letter.baseX = (letterRect.left - rect.left) + (letterRect.width / 2);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        let maxDisplacement = 0;

        // Physics params
        const tension = 0.1;
        const damping = 0.85;
        const influenceRadius = 150;

        this.letters.forEach(letter => {
            let targetY = 0;

            // If mouse is active, calculate magnetic pull
            if (this.isHovering) {
                const dx = this.mouse.x - letter.baseX;
                const dist = Math.abs(dx);

                if (dist < influenceRadius) {
                    // Calculate pull based on horizontal distance (Gaussian-ish curve)
                    const pull = Math.cos((dist / influenceRadius) * (Math.PI / 2));
                    
                    // The target Y is the mouse Y, but scaled by the pull factor
                    // Relative to the center line (baseY)
                    const mouseRelativeY = this.mouse.y - this.baseY;
                    targetY = mouseRelativeY * pull;
                }
            }

            // Spring physics implementation
            const ay = (targetY - letter.y) * tension;
            letter.vy += ay;
            letter.vy *= damping;
            letter.y += letter.vy;

            // Apply visual transform
            // Rotate slightly based on slope for more "string-like" feel
            const rotation = letter.vy * 2; 
            letter.element.style.transform = `translateY(${letter.y}px) rotate(${rotation}deg)`;

            // Track max displacement for audio
            if (Math.abs(letter.y) > Math.abs(maxDisplacement)) {
                maxDisplacement = letter.y;
            }
        });

        // Audio Synthesis Logic
        if (this.isAudioContextStarted && this.isHovering) {
            // Map Y displacement to Pitch
            // Up (-Y) = Higher pitch, Down (+Y) = Lower pitch
            // Base pitch 440Hz. Range +/- 1 octave roughly
            const pitchOffset = -maxDisplacement * 2; // Scale factor
            const frequency = 440 + pitchOffset;
            
            // Smooth frequency transition
            this.oscillator.frequency.setTargetAtTime(Math.max(100, Math.min(1000, frequency)), this.audioCtx.currentTime, 0.05);
        }
    }
}

// Initialize automatically if the element exists
document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('intonation-game');
    console.log('Looking for intonation-game container:', gameContainer);
    if (gameContainer) {
        console.log('Initializing IntonationGame...');
        new IntonationGame('intonation-game');
    } else {
        console.error('Container #intonation-game not found!');
    }
});
