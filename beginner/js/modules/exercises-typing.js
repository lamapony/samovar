/**
 * Typing Exercise Components Module
 * TypingPractice and AnimatedDialogue with typewriter effects
 */

import { TTS } from './tts.js';

// SVG Icons for typing exercises
const TYPING_ICONS = {
    keyboard: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: #1a1a1a;"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="6" y1="8" x2="6" y2="8"/><line x1="10" y1="8" x2="10" y2="8"/><line x1="14" y1="8" x2="14" y2="8"/><line x1="18" y1="8" x2="18" y2="8"/><line x1="6" y1="12" x2="6" y2="12"/><line x1="10" y1="12" x2="10" y2="12"/><line x1="14" y1="12" x2="14" y2="12"/><line x1="18" y1="12" x2="18" y2="12"/><line x1="6" y1="16" x2="18" y2="16"/></svg>`,
    listen: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`
};

/**
 * TypingPractice - Type what you hear exercise
 * Data format: [{ russian: "Привет", danish: "Hej" }]
 */
class TypingPractice {
    constructor(containerId, words) {
        this.container = document.getElementById(containerId);
        this.words = words;
        this.currentIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.renderStartScreen();
    }

    renderStartScreen() {
        this.container.innerHTML = `
            <div class="typing-start" style="text-align: center; padding: 3rem 1.5rem; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <div class="typing-icon" style="margin-bottom: 1.5rem; opacity: 0.8;">${TYPING_ICONS.keyboard}</div>
                <h3 style="font-family: 'Newsreader', serif; font-size: 2rem; margin-bottom: 0.5rem; color: #1a1a1a;">Skriv tallet</h3>
                <p style="color: #666; margin-bottom: 2rem; font-size: 1.1rem;">Øv dig i at skrive de russiske tal.</p>
                <button class="btn btn-primary start-typing-btn" style="padding: 0.75rem 2rem; font-size: 1.1rem;">Start Øvelse</button>
            </div>
        `;
        this.container.querySelector('.start-typing-btn').addEventListener('click', () => {
            this.render();
        });
    }

    render() {
        if (this.currentIndex >= this.words.length) {
            this.showResults();
            return;
        }

        const word = this.words[this.currentIndex];

        this.container.innerHTML = `
            <div class="typing-exercise" style="background: #fff; padding: 2.5rem; border-radius: 12px; border: 1px solid #e5e7eb; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
                <div class="exercise-header" style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2.5rem; border-bottom: 1px solid #f3f4f6; padding-bottom: 1rem;">
                    <div class="exercise-meta">
                        <span style="display: block; font-size: 0.75rem; letter-spacing: 0.1em; color: #ef4444; font-weight: 600; text-transform: uppercase; margin-bottom: 0.25rem;">ØVELSE</span>
                        <span style="color: #9ca3af; font-size: 0.9rem; font-weight: 500;">ORD ${this.currentIndex + 1} AF ${this.words.length}</span>
                    </div>
                    <div class="exercise-score" style="font-weight: 600; color: #1e293b;">Point: ${this.score}</div>
                </div>

                <div class="typing-content" style="text-align: center; margin-bottom: 2.5rem;">
                    <p style="color: #4b5563; margin-bottom: 1.5rem; font-size: 1.1rem;">Skriv dette ord på russisk:</p>
                    <h2 class="typing-prompt-word" style="font-family: 'Newsreader', serif; font-size: 3.5rem; color: #1a1a1a; margin-bottom: 2rem; line-height: 1;">${word.danish}</h2>
                    
                    <button class="typing-listen-btn" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.25rem; background: #fdf2f8; color: #db2777; border: 1px solid #fbcfe8; border-radius: 50px; cursor: pointer; font-size: 0.95rem; font-weight: 500; transition: all 0.2s;">
                        ${TYPING_ICONS.listen} Lyt til ordet
                    </button>
                </div>

                <div class="typing-input-area" style="margin-bottom: 2rem; position: relative;">
                    <input type="text" class="typing-input" placeholder="Skriv på russisk..." autocomplete="off" spellcheck="false" 
                        style="width: 100%; padding: 1.25rem; font-size: 1.5rem; text-align: center; border: 2px solid #e2e8f0; border-radius: 8px; font-family: 'Newsreader', serif; transition: all 0.2s; outline: none; color: #334155;">
                    <div class="input-feedback" style="margin-top: 0.75rem; min-height: 1.5rem; font-size: 0.95rem; text-align: center; color: #ef4444;"></div>
                </div>

                <div class="exercise-actions" style="text-align: left;">
                    <button class="btn btn-primary check-typing-btn" style="background: #9f1239; border-color: #9f1239; color: white; padding: 0.8rem 2rem; font-size: 1rem; width: auto; min-width: 120px;">Tjek</button>
                </div>
            </div>
        `;

        this.bindEvents(word);
    }

    bindEvents(word) {
        const input = this.container.querySelector('.typing-input');
        const listenBtn = this.container.querySelector('.typing-listen-btn');
        const checkBtn = this.container.querySelector('.check-typing-btn');
        const feedbackEl = this.container.querySelector('.input-feedback');

        listenBtn.addEventListener('click', () => {
            listenBtn.style.transform = 'scale(0.95)';
            setTimeout(() => listenBtn.style.transform = 'scale(1)', 150);
            TTS.speak(word.russian);
        });

        input.addEventListener('focus', () => {
            if (!input.classList.contains('error') && !input.classList.contains('success')) {
                input.style.borderColor = '#94a3b8';
            }
        });

        input.addEventListener('blur', () => {
            if (!input.classList.contains('error') && !input.classList.contains('success')) {
                input.style.borderColor = '#e2e8f0';
            }
        });

        const check = () => this.checkAnswer(input, word, checkBtn, feedbackEl);

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') check();
        });

        checkBtn.addEventListener('click', check);

        setTimeout(() => input.focus({ preventScroll: true }), 100);
    }

    checkAnswer(input, word, checkBtn, feedbackEl) {
        if (input.disabled) return;

        const typed = input.value.trim().toLowerCase();
        const correct = word.russian.toLowerCase();

        if (typed === correct) {
            this.score += 10;
            this.streak++;

            input.disabled = true;
            input.style.borderColor = '#22c55e';
            input.style.backgroundColor = '#f0fdf4';
            input.style.color = '#15803d';
            input.classList.add('success');

            checkBtn.textContent = 'Rigtigt!';
            checkBtn.style.backgroundColor = '#22c55e';
            checkBtn.style.borderColor = '#22c55e';
            feedbackEl.textContent = '';

            TTS.speak(word.russian);

            setTimeout(() => {
                this.currentIndex++;
                this.render();
            }, 1200);
        } else {
            this.streak = 0;

            input.style.borderColor = '#ef4444';
            input.style.backgroundColor = '#fef2f2';
            input.style.color = '#b91c1c';
            input.classList.add('error');

            input.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' },
                { transform: 'translateX(0)' }
            ], { duration: 300 });

            checkBtn.textContent = 'Prøv igen';
            checkBtn.style.backgroundColor = '#ef4444';
            checkBtn.style.borderColor = '#ef4444';

            feedbackEl.innerHTML = `Forkert. Det rigtige svar er: <strong>${word.russian}</strong>`;

            setTimeout(() => {
                input.classList.remove('error');
                input.style.backgroundColor = '#fff';
                input.style.borderColor = '#e2e8f0';
                input.style.color = '#334155';
                input.value = '';
                input.focus({ preventScroll: true });
                checkBtn.textContent = 'Tjek';
                checkBtn.style.backgroundColor = '#9f1239';
                checkBtn.style.borderColor = '#9f1239';
                feedbackEl.textContent = '';
            }, 2500);
        }
    }

    showResults() {
        this.container.innerHTML = `
            <div class="typing-results" style="text-align: center; padding: 3rem; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                <h3 style="font-family: 'Newsreader', serif; font-size: 2rem; margin-bottom: 1rem; color: #1a1a1a;">Flot klaret!</h3>
                <p style="color: #666; margin-bottom: 2rem; font-size: 1.1rem;">Du fik ${this.score} point.</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="btn btn-outline" onclick="location.reload()">Prøv igen</button>
                    <button class="btn btn-primary" onclick="history.back()">Tilbage til oversigt</button>
                </div>
            </div>
        `;
    }
}

/**
 * AnimatedDialogue - Dialogue with typewriter effect
 * Data format: [{ speaker: "A", russian: "Привет!", danish: "Hej!" }]
 */
class AnimatedDialogue {
    constructor(containerId, lines) {
        this.container = document.getElementById(containerId);
        this.lines = lines;
        this.currentLine = 0;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="animated-dialogue">
                <div class="dialogue-controls">
                    <button class="btn play-dialogue-btn">Afspil dialog</button>
                    <button class="btn btn-outline reset-dialogue-btn">Nulstil</button>
                </div>
                <div class="dialogue-stage"></div>
            </div>
        `;

        this.stage = this.container.querySelector('.dialogue-stage');
        this.container.querySelector('.play-dialogue-btn').addEventListener('click', () => this.playAll());
        this.container.querySelector('.reset-dialogue-btn').addEventListener('click', () => this.reset());
    }

    async playAll() {
        this.stage.innerHTML = '';
        for (let i = 0; i < this.lines.length; i++) {
            await this.showLine(this.lines[i], i);
            await this.delay(500);
        }
    }

    showLine(line, index) {
        return new Promise(async resolve => {
            const gender = line.speaker === 'A' ? 'female' : 'male';
            const bubble = document.createElement('div');
            bubble.className = `dialogue-line ${line.speaker === 'A' ? 'speaker-a' : 'speaker-b'} animate-in`;
            bubble.innerHTML = `
                <div class="dialogue-speaker">${line.speaker === 'A' ? 'Person A' : 'Person B'}</div>
                <div class="dialogue-bubble">
                    <div class="dialogue-russian"></div>
                    <div class="dialogue-danish">${line.danish}</div>
                    <button class="speak-line-btn" data-text="${line.russian}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        </svg>
                    </button>
                </div>
            `;
            this.stage.appendChild(bubble);
            bubble.scrollIntoView({ behavior: 'smooth', block: 'center' });

            bubble.querySelector('.speak-line-btn').addEventListener('click', () => TTS.speak(line.russian, false, gender));

            const russianEl = bubble.querySelector('.dialogue-russian');
            await this.typewriter(russianEl, line.russian);

            await TTS.speak(line.russian, false, gender);
            resolve();
        });
    }

    typewriter(element, text) {
        return new Promise(resolve => {
            let i = 0;
            const speed = 40;
            const type = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            };
            type();
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    reset() {
        this.stage.innerHTML = '';
        this.currentLine = 0;
    }
}

// Export for ES modules
export { TypingPractice, AnimatedDialogue, TYPING_ICONS };

// Global exports for backward compatibility
if (typeof window !== 'undefined') {
    window.TypingPractice = TypingPractice;
    window.AnimatedDialogue = AnimatedDialogue;
}
