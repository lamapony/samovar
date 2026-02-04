/**
 * Basic Exercise Components Module
 * Core exercise types: Fill-in-the-blank, Listening, Matching, Writing
 */

import { TTS } from './tts.js';

// Helper to safely call reportExerciseScore if it exists
function reportScore(exerciseId, score, total) {
    if (typeof window !== 'undefined' && typeof window.reportExerciseScore === 'function') {
        window.reportExerciseScore(exerciseId, score, total);
    }
}

// Result message generator
function getResultMessage(percent) {
    if (percent === 100) return "Fantastisk! Du mestrer dette emne!";
    if (percent >= 80) return "Meget godt! Du er på rette vej.";
    if (percent >= 60) return "Godt arbejde. Øv lidt mere for at forbedre dig.";
    return "Bliv ved med at øve. Du bliver bedre!";
}

/**
 * Fill-in-the-blank exercise
 * Data format: [{ text: "Меня ___ Анна.", answer: "зовут", hint: "hedder", danish: "...", alternatives: [] }]
 */
class FillBlankExercise {
    constructor(containerId, sentences) {
        this.container = document.getElementById(containerId);
        this.exerciseId = containerId;
        this.sentences = sentences;
        this.currentIndex = 0;
        this.score = 0;
        this.render();
    }

    render() {
        const sentence = this.sentences[this.currentIndex];
        const parts = sentence.text.split('___');

        this.container.innerHTML = `
            <div class="exercise-header">
                <span class="exercise-progress">Opgave ${this.currentIndex + 1} af ${this.sentences.length}</span>
                <span class="exercise-score">Point: ${this.score}</span>
            </div>
            <div class="fill-blank-sentence">
                <span class="sentence-part">${parts[0]}</span>
                <input type="text" class="blank-input" placeholder="${sentence.hint || '...'}" autocomplete="off" spellcheck="false">
                <span class="sentence-part">${parts[1] || ''}</span>
                <button class="speak-sentence-btn" title="Lyt til sætningen">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                </button>
            </div>
            ${sentence.danish ? `<div class="fill-blank-danish">${sentence.danish}</div>` : ''}
            <div class="exercise-actions">
                <button class="btn check-answer-btn">Tjek svar</button>
            </div>
            <div class="exercise-feedback"></div>
        `;

        this.bindEvents(sentence);
    }

    bindEvents(sentence) {
        const input = this.container.querySelector('.blank-input');
        const checkBtn = this.container.querySelector('.check-answer-btn');
        const speakBtn = this.container.querySelector('.speak-sentence-btn');
        const feedback = this.container.querySelector('.exercise-feedback');

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer(input, sentence, feedback);
        });

        checkBtn.addEventListener('click', () => {
            this.checkAnswer(input, sentence, feedback);
        });

        speakBtn.addEventListener('click', () => {
            const fullSentence = sentence.text.replace('___', sentence.answer);
            TTS.speak(fullSentence);
        });

        input.focus({ preventScroll: true });
    }

    checkAnswer(input, sentence, feedback) {
        const userAnswer = input.value.trim().toLowerCase();
        const correctAnswer = sentence.answer.toLowerCase();
        const alternatives = sentence.alternatives || [];

        const isCorrect = userAnswer === correctAnswer ||
            alternatives.map(a => a.toLowerCase()).includes(userAnswer);

        if (isCorrect) {
            this.score++;
            feedback.className = 'exercise-feedback correct';
            feedback.innerHTML = `
                <strong>Rigtigt!</strong> ${sentence.explanation || ''}
                <button class="btn btn-next">Næste</button>
            `;
            input.classList.add('correct');
            TTS.speak(sentence.text.replace('___', sentence.answer));

            this.container.querySelector('.btn-next').addEventListener('click', () => this.next());
        } else {
            feedback.className = 'exercise-feedback incorrect';
            feedback.innerHTML = `
                <strong>Ikke helt.</strong>
                <div style="margin-top: 8px;">
                    <button class="btn btn-outline btn-retry">Prøv igen</button>
                    <button class="btn btn-next">Giv op & vis svar</button>
                </div>
            `;
            input.classList.add('incorrect');

            this.container.querySelector('.btn-retry').addEventListener('click', () => {
                feedback.className = 'exercise-feedback';
                feedback.innerHTML = '';
                input.classList.remove('incorrect');
                input.focus({ preventScroll: true });
            });

            this.container.querySelector('.btn-next').addEventListener('click', () => {
                feedback.innerHTML = `
                    <strong>Det rigtige svar er:</strong> ${sentence.answer}
                    <button class="btn btn-next-final" style="margin-left: 10px;">Næste</button>
                `;
                this.container.querySelector('.btn-next-final').addEventListener('click', () => this.next());
            });
        }
    }

    next() {
        this.currentIndex++;
        if (this.currentIndex < this.sentences.length) {
            this.render();
        } else {
            this.showResults();
        }
    }

    showResults() {
        const percent = Math.round((this.score / this.sentences.length) * 100);
        reportScore(this.exerciseId, this.score, this.sentences.length);

        this.container.innerHTML = `
            <div class="exercise-results">
                <h3>Resultat</h3>
                <div class="result-score">${this.score} / ${this.sentences.length}</div>
                <div class="result-percent">${percent}% korrekt</div>
                <p class="result-message">${getResultMessage(percent)}</p>
                <button class="btn" onclick="location.reload()">Prøv igen</button>
            </div>
        `;
    }
}

/**
 * Listening exercise - hear audio and select correct translation
 * Data format: [{ audio: "Привет", options: ["Hej", "Farvel", "Tak"], correct: 0 }]
 */
class ListeningExercise {
    constructor(containerId, items) {
        this.container = document.getElementById(containerId);
        this.exerciseId = containerId;
        this.items = items;
        this.currentIndex = 0;
        this.score = 0;
        this.render();
    }

    render() {
        const item = this.items[this.currentIndex];

        this.container.innerHTML = `
            <div class="exercise-header">
                <span class="exercise-progress">Opgave ${this.currentIndex + 1} af ${this.items.length}</span>
                <span class="exercise-score">Point: ${this.score}</span>
            </div>
            <div class="listening-prompt">
                <p>Lyt og vælg den rigtige oversættelse:</p>
                <button class="listen-btn">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    </svg>
                    <span>Afspil lyd</span>
                </button>
                <button class="listen-slow-btn">Langsom</button>
            </div>
            <div class="listening-options">
                ${item.options.map((opt, i) => `
                    <button class="listening-option" data-index="${i}">${opt}</button>
                `).join('')}
            </div>
            <div class="exercise-feedback"></div>
        `;

        this.bindEvents(item);
    }

    bindEvents(item) {
        const listenBtn = this.container.querySelector('.listen-btn');
        const slowBtn = this.container.querySelector('.listen-slow-btn');
        const options = this.container.querySelectorAll('.listening-option');
        const feedback = this.container.querySelector('.exercise-feedback');

        listenBtn.addEventListener('click', () => TTS.speak(item.audio));
        slowBtn.addEventListener('click', () => TTS.speakSlow(item.audio));

        options.forEach(opt => {
            opt.addEventListener('click', () => {
                this.checkAnswer(parseInt(opt.dataset.index), item, options, feedback);
            });
        });
    }

    checkAnswer(selected, item, options, feedback) {
        options.forEach(opt => opt.disabled = true);

        if (selected === item.correct) {
            this.score++;
            options[selected].classList.add('correct');
            feedback.className = 'exercise-feedback correct';
            feedback.innerHTML = `
                <strong>Rigtigt!</strong> "${item.audio}" betyder "${item.options[item.correct]}"
                <button class="btn btn-next">Næste</button>
            `;
        } else {
            options[selected].classList.add('incorrect');
            options[item.correct].classList.add('correct');
            feedback.className = 'exercise-feedback incorrect';
            feedback.innerHTML = `
                <strong>Ikke helt.</strong> "${item.audio}" betyder "${item.options[item.correct]}"
                <button class="btn btn-next">Næste</button>
            `;
        }

        this.container.querySelector('.btn-next').addEventListener('click', () => {
            this.currentIndex++;
            if (this.currentIndex < this.items.length) {
                this.render();
            } else {
                this.showResults();
            }
        });
    }

    showResults() {
        const percent = Math.round((this.score / this.items.length) * 100);
        reportScore(this.exerciseId, this.score, this.items.length);

        this.container.innerHTML = `
            <div class="exercise-results">
                <h3>Lytteøvelse færdig!</h3>
                <div class="result-score">${this.score} / ${this.items.length}</div>
                <div class="result-percent">${percent}%</div>
                <button class="btn" onclick="location.reload()">Prøv igen</button>
            </div>
        `;
    }
}

/**
 * Matching exercise - match Russian words with Danish translations
 * Data format: [{ russian: "Привет", danish: "Hej" }]
 */
class MatchingExercise {
    constructor(containerId, pairs) {
        this.container = document.getElementById(containerId);
        this.exerciseId = containerId;
        this.pairs = pairs;
        this.selectedLeft = null;
        this.matched = new Set();
        this.render();
    }

    render() {
        const shuffledDanish = [...this.pairs].sort(() => Math.random() - 0.5);

        this.container.innerHTML = `
            <div class="matching-grid">
                <div class="matching-column left">
                    ${this.pairs.map((p, i) => `
                        <div class="match-item left-item" data-index="${i}" data-russian="${p.russian}">
                            <span>${p.russian}</span>
                            <button class="speak-mini" data-text="${p.russian}">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                </svg>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div class="matching-column right">
                    ${shuffledDanish.map((p) => `
                        <div class="match-item right-item" data-danish="${p.danish}">
                            ${p.danish}
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="exercise-feedback"></div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const leftItems = this.container.querySelectorAll('.left-item');
        const rightItems = this.container.querySelectorAll('.right-item');
        const feedback = this.container.querySelector('.exercise-feedback');

        this.container.querySelectorAll('.speak-mini').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                TTS.speak(btn.dataset.text);
            });
        });

        leftItems.forEach(item => {
            item.addEventListener('click', () => {
                if (item.classList.contains('matched')) return;
                leftItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                this.selectedLeft = item;
                TTS.speak(item.dataset.russian);
            });
        });

        rightItems.forEach(item => {
            item.addEventListener('click', () => {
                if (!this.selectedLeft || item.classList.contains('matched')) return;

                const leftRussian = this.selectedLeft.dataset.russian;
                const rightDanish = item.dataset.danish;
                const pair = this.pairs.find(p => p.russian === leftRussian && p.danish === rightDanish);

                if (pair) {
                    this.selectedLeft.classList.add('matched', 'correct');
                    item.classList.add('matched', 'correct');
                    this.matched.add(leftRussian);
                    this.selectedLeft = null;

                    if (this.matched.size === this.pairs.length) {
                        this.showComplete(feedback);
                    }
                } else {
                    item.classList.add('incorrect');
                    setTimeout(() => item.classList.remove('incorrect'), 500);
                }
            });
        });
    }

    showComplete(feedback) {
        feedback.className = 'exercise-feedback correct';
        feedback.innerHTML = `<strong>Alle par matchet!</strong> Godt arbejde!`;
        reportScore(this.exerciseId, this.matched.size, this.pairs.length);
    }
}

/**
 * Writing exercise - write Russian word from Danish prompt
 * Data format: [{ russian: "Привет", danish: "Hej", hint: "6 bogstaver" }]
 */
class WritingExercise {
    constructor(containerId, words) {
        this.container = document.getElementById(containerId);
        this.exerciseId = containerId;
        this.words = words;
        this.currentIndex = 0;
        this.score = 0;
        this.render();
    }

    render() {
        const word = this.words[this.currentIndex];

        this.container.innerHTML = `
            <div class="exercise-header">
                <span class="exercise-progress">Ord ${this.currentIndex + 1} af ${this.words.length}</span>
                <span class="exercise-score">Point: ${this.score}</span>
            </div>
            <div class="writing-prompt">
                <p>Skriv dette ord på russisk:</p>
                <div class="writing-danish">${word.danish}</div>
                <button class="hint-btn">Lyt til ordet</button>
            </div>
            <div class="writing-input-area">
                <input type="text" class="writing-input" placeholder="Skriv på russisk..." autocomplete="off" spellcheck="false">
                ${word.hint ? `<div class="writing-hint">${word.hint}</div>` : ''}
            </div>
            <div class="exercise-actions">
                <button class="btn check-answer-btn">Tjek</button>
            </div>
            <div class="exercise-feedback"></div>
        `;

        this.bindEvents(word);
    }

    bindEvents(word) {
        const input = this.container.querySelector('.writing-input');
        const checkBtn = this.container.querySelector('.check-answer-btn');
        const hintBtn = this.container.querySelector('.hint-btn');
        const feedback = this.container.querySelector('.exercise-feedback');

        hintBtn.addEventListener('click', () => TTS.speak(word.russian));

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer(input, word, feedback);
        });

        checkBtn.addEventListener('click', () => {
            this.checkAnswer(input, word, feedback);
        });

        input.focus({ preventScroll: true });
    }

    checkAnswer(input, word, feedback) {
        const userAnswer = input.value.trim().toLowerCase();
        const correct = word.russian.toLowerCase();

        if (userAnswer === correct) {
            this.score++;
            feedback.className = 'exercise-feedback correct';
            feedback.innerHTML = `
                <strong>Perfekt!</strong>
                <button class="btn btn-next">Næste ord</button>
            `;
            input.classList.add('correct');
            TTS.speak(word.russian);

            this.container.querySelector('.btn-next').addEventListener('click', () => {
                this.currentIndex++;
                if (this.currentIndex < this.words.length) {
                    this.render();
                } else {
                    this.showResults();
                }
            });
        } else {
            feedback.className = 'exercise-feedback incorrect';
            feedback.innerHTML = `
                <strong>Ikke helt.</strong>
                <div style="margin-top: 8px;">
                    <button class="btn btn-outline btn-retry">Prøv igen</button>
                    <button class="btn btn-next">Giv op</button>
                </div>
            `;
            input.classList.add('incorrect');

            this.container.querySelector('.btn-retry').addEventListener('click', () => {
                feedback.className = 'exercise-feedback';
                feedback.innerHTML = '';
                input.classList.remove('incorrect');
                input.focus({ preventScroll: true });
            });

            this.container.querySelector('.btn-next').addEventListener('click', () => {
                feedback.innerHTML = `
                    Det rigtige: <strong class="cyrillic">${word.russian}</strong>
                    <button class="btn btn-next-final" style="margin-left: 10px;">Næste</button>
                `;
                this.container.querySelector('.btn-next-final').addEventListener('click', () => {
                    this.currentIndex++;
                    if (this.currentIndex < this.words.length) {
                        this.render();
                    } else {
                        this.showResults();
                    }
                });
            });
        }
    }

    showResults() {
        const percent = Math.round((this.score / this.words.length) * 100);
        reportScore(this.exerciseId, this.score, this.words.length);

        this.container.innerHTML = `
            <div class="exercise-results">
                <h3>Skriveøvelse færdig!</h3>
                <div class="result-score">${this.score} / ${this.words.length}</div>
                <div class="result-percent">${percent}%</div>
                <button class="btn" onclick="location.reload()">Prøv igen</button>
            </div>
        `;
    }
}

// Export for ES modules
export {
    FillBlankExercise,
    ListeningExercise,
    MatchingExercise,
    WritingExercise,
    getResultMessage,
    reportScore
};

// Global exports for backward compatibility
if (typeof window !== 'undefined') {
    window.FillBlankExercise = FillBlankExercise;
    window.ListeningExercise = ListeningExercise;
    window.MatchingExercise = MatchingExercise;
    window.WritingExercise = WritingExercise;
}
