/**
 * Advanced Exercise Components Module
 * Complex exercise types: SentenceBuilder, Flashcards, Dialogue, MemoryGame, SpeedChallenge, WordScramble
 */

import { TTS } from './tts.js';

// Helper to safely call reportExerciseScore if it exists
function reportScore(exerciseId, score, total) {
    if (typeof window !== 'undefined' && typeof window.reportExerciseScore === 'function') {
        window.reportExerciseScore(exerciseId, score, total);
    }
}

/**
 * SentenceBuilder - Arrange words to form correct sentences
 * Data format: [{ words: ["Меня", "зовут", "Анна"], danish: "Jeg hedder Anna" }]
 */
class SentenceBuilder {
    constructor(containerId, sentences) {
        this.container = document.getElementById(containerId);
        this.exerciseId = containerId;
        this.sentences = sentences;
        this.currentIndex = 0;
        this.score = 0;
        this.selectedWords = [];
        this.render();
    }

    render() {
        const sentence = this.sentences[this.currentIndex];
        const shuffled = [...sentence.words].sort(() => Math.random() - 0.5);
        this.selectedWords = [];

        this.container.innerHTML = `
            <div class="exercise-header">
                <span class="exercise-progress">Sætning ${this.currentIndex + 1} af ${this.sentences.length}</span>
                <span class="exercise-score">Point: ${this.score}</span>
            </div>
            <div class="sentence-builder-prompt">
                <p>Byg sætningen på russisk:</p>
                <div class="danish-sentence">${sentence.danish}</div>
            </div>
            <div class="sentence-builder-answer"></div>
            <div class="sentence-builder-words">
                ${shuffled.map((w, i) => `
                    <button class="word-tile" data-word="${w}" data-index="${i}">${w}</button>
                `).join('')}
            </div>
            <div class="exercise-actions">
                <button class="btn btn-outline clear-btn">Ryd</button>
                <button class="btn check-answer-btn">Tjek svar</button>
            </div>
            <div class="exercise-feedback"></div>
        `;

        this.bindEvents(sentence);
    }

    bindEvents(sentence) {
        const wordTiles = this.container.querySelectorAll('.word-tile');
        const answerArea = this.container.querySelector('.sentence-builder-answer');
        const clearBtn = this.container.querySelector('.clear-btn');
        const checkBtn = this.container.querySelector('.check-answer-btn');
        const feedback = this.container.querySelector('.exercise-feedback');

        wordTiles.forEach(tile => {
            tile.addEventListener('click', () => {
                if (tile.classList.contains('used')) return;
                tile.classList.add('used');
                this.selectedWords.push(tile.dataset.word);
                TTS.speak(tile.dataset.word);
                this.updateAnswerArea(answerArea);
            });
        });

        answerArea.addEventListener('click', (e) => {
            if (e.target.classList.contains('selected-word')) {
                const word = e.target.dataset.word;
                const idx = this.selectedWords.indexOf(word);
                if (idx > -1) {
                    this.selectedWords.splice(idx, 1);
                    const tile = this.container.querySelector(`.word-tile[data-word="${word}"]:not(.re-enabled)`);
                    if (tile) {
                        tile.classList.remove('used');
                        tile.classList.add('re-enabled');
                    }
                    this.updateAnswerArea(answerArea);
                }
            }
        });

        clearBtn.addEventListener('click', () => {
            this.selectedWords = [];
            wordTiles.forEach(t => t.classList.remove('used', 're-enabled'));
            this.updateAnswerArea(answerArea);
        });

        checkBtn.addEventListener('click', () => this.checkAnswer(sentence, feedback));
    }

    updateAnswerArea(area) {
        if (this.selectedWords.length === 0) {
            area.innerHTML = '<span class="placeholder">Klik på ordene for at bygge sætningen</span>';
        } else {
            area.innerHTML = this.selectedWords.map(w =>
                `<span class="selected-word" data-word="${w}">${w}</span>`
            ).join(' ');
        }
    }

    checkAnswer(sentence, feedback) {
        const userAnswer = this.selectedWords.join(' ');
        const correct = sentence.words.join(' ');

        if (userAnswer === correct) {
            this.score++;
            feedback.className = 'exercise-feedback correct';
            feedback.innerHTML = `<strong>Rigtigt!</strong> <button class="btn btn-next">Næste</button>`;
            TTS.speak(correct);
        } else {
            feedback.className = 'exercise-feedback incorrect';
            feedback.innerHTML = `<strong>Ikke helt.</strong> Korrekt: <strong>${correct}</strong> <button class="btn btn-next">Næste</button>`;
        }

        this.container.querySelector('.btn-next').addEventListener('click', () => {
            this.currentIndex++;
            if (this.currentIndex < this.sentences.length) {
                this.render();
            } else {
                this.showResults();
            }
        });
    }

    showResults() {
        const percent = Math.round((this.score / this.sentences.length) * 100);
        reportScore(this.exerciseId, this.score, this.sentences.length);

        this.container.innerHTML = `
            <div class="exercise-results">
                <h3>Sætningsbygger færdig!</h3>
                <div class="result-score">${this.score} / ${this.sentences.length}</div>
                <div class="result-percent">${percent}%</div>
                <button class="btn" onclick="location.reload()">Prøv igen</button>
            </div>
        `;
    }
}

/**
 * Flashcards - Interactive flip cards for vocabulary
 * Data format: [{ front: "Привет", back: "Hej", audio: true }]
 */
class Flashcards {
    constructor(containerId, cards) {
        this.container = document.getElementById(containerId);
        this.cards = cards;
        this.currentIndex = 0;
        this.isFlipped = false;
        this.render();
    }

    render() {
        const card = this.cards[this.currentIndex];

        this.container.innerHTML = `
            <div class="flashcard-container">
                <div class="flashcard-progress">${this.currentIndex + 1} / ${this.cards.length}</div>
                <div class="flashcard ${this.isFlipped ? 'flipped' : ''}">
                    <div class="flashcard-inner">
                        <div class="flashcard-front">
                            <span class="flashcard-text">${card.front}</span>
                            ${card.audio !== false ? `
                                <button class="flashcard-audio">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                    </svg>
                                </button>
                            ` : ''}
                        </div>
                        <div class="flashcard-back">
                            <span class="flashcard-text">${card.back}</span>
                        </div>
                    </div>
                </div>
                <div class="flashcard-hint">Klik for at vende</div>
                <div class="flashcard-controls">
                    <button class="btn btn-outline prev-btn" ${this.currentIndex === 0 ? 'disabled' : ''}>Forrige</button>
                    <button class="btn next-btn" ${this.currentIndex === this.cards.length - 1 ? 'disabled' : ''}>Næste</button>
                </div>
            </div>
        `;

        this.bindEvents(card);
    }

    bindEvents(card) {
        const flashcard = this.container.querySelector('.flashcard');
        const audioBtn = this.container.querySelector('.flashcard-audio');
        const prevBtn = this.container.querySelector('.prev-btn');
        const nextBtn = this.container.querySelector('.next-btn');

        flashcard.addEventListener('click', (e) => {
            if (e.target.closest('.flashcard-audio')) return;
            this.isFlipped = !this.isFlipped;
            flashcard.classList.toggle('flipped');
        });

        if (audioBtn) {
            audioBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                TTS.speak(card.front);
            });
        }

        prevBtn.addEventListener('click', () => {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.isFlipped = false;
                this.render();
            }
        });

        nextBtn.addEventListener('click', () => {
            if (this.currentIndex < this.cards.length - 1) {
                this.currentIndex++;
                this.isFlipped = false;
                this.render();
            }
        });
    }
}

/**
 * Dialogue - Display conversation with TTS
 * Data format: [{ speaker: "A", russian: "Привет!", danish: "Hej!" }]
 */
class Dialogue {
    constructor(containerId, lines) {
        this.container = document.getElementById(containerId);
        this.lines = lines;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="dialogue-container">
                <div class="dialogue-controls">
                    <button class="btn play-all-btn">Afspil hele dialogen</button>
                </div>
                <div class="dialogue-lines">
                    ${this.lines.map((line, i) => `
                        <div class="dialogue-line ${line.speaker === 'A' ? 'speaker-a' : 'speaker-b'}">
                            <div class="dialogue-speaker">${line.speaker === 'A' ? 'Person A' : 'Person B'}</div>
                            <div class="dialogue-bubble">
                                <div class="dialogue-russian">${line.russian}</div>
                                <div class="dialogue-danish">${line.danish}</div>
                                <button class="speak-line-btn" data-index="${i}">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const playAllBtn = this.container.querySelector('.play-all-btn');
        const speakBtns = this.container.querySelectorAll('.speak-line-btn');

        speakBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                TTS.speak(this.lines[idx].russian);
            });
        });

        playAllBtn.addEventListener('click', () => this.playAll());
    }

    async playAll() {
        for (let i = 0; i < this.lines.length; i++) {
            TTS.speak(this.lines[i].russian);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

/**
 * MemoryGame - Match pairs by flipping cards
 * Data format: [{ russian: "Привет", danish: "Hej" }]
 */
class MemoryGame {
    constructor(containerId, pairs) {
        this.container = document.getElementById(containerId);
        this.pairs = pairs;
        this.cards = [];
        this.flipped = [];
        this.matched = new Set();
        this.moves = 0;
        this.init();
    }

    init() {
        this.pairs.forEach((pair, idx) => {
            this.cards.push({ id: idx, type: 'russian', text: pair.russian, pairId: idx });
            this.cards.push({ id: idx + 100, type: 'danish', text: pair.danish, pairId: idx });
        });
        this.cards.sort(() => Math.random() - 0.5);
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="memory-game-header">
                <span class="memory-moves">Træk: ${this.moves}</span>
                <span class="memory-pairs">Par fundet: ${this.matched.size} / ${this.pairs.length}</span>
            </div>
            <div class="memory-grid">
                ${this.cards.map((card, i) => `
                    <div class="memory-card ${this.matched.has(card.pairId) ? 'matched' : ''}" 
                         data-index="${i}" data-pair="${card.pairId}" data-type="${card.type}">
                        <div class="memory-card-inner">
                            <div class="memory-card-front">?</div>
                            <div class="memory-card-back">${card.text}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        this.bindEvents();
    }

    bindEvents() {
        this.container.querySelectorAll('.memory-card').forEach(card => {
            card.addEventListener('click', () => this.flipCard(card));
        });
    }

    flipCard(card) {
        if (this.flipped.length >= 2) return;
        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

        card.classList.add('flipped');
        const index = parseInt(card.dataset.index);
        this.flipped.push({ element: card, card: this.cards[index] });

        if (this.cards[index].type === 'russian') {
            TTS.speak(this.cards[index].text);
        }

        if (this.flipped.length === 2) {
            this.moves++;
            this.checkMatch();
        }
    }

    checkMatch() {
        const [first, second] = this.flipped;

        if (first.card.pairId === second.card.pairId && first.card.type !== second.card.type) {
            setTimeout(() => {
                first.element.classList.add('matched');
                second.element.classList.add('matched');
                this.matched.add(first.card.pairId);
                this.flipped = [];
                this.updateHeader();

                if (this.matched.size === this.pairs.length) {
                    this.showWin();
                }
            }, 500);
        } else {
            setTimeout(() => {
                first.element.classList.remove('flipped');
                second.element.classList.remove('flipped');
                first.element.classList.add('shake');
                second.element.classList.add('shake');
                setTimeout(() => {
                    first.element.classList.remove('shake');
                    second.element.classList.remove('shake');
                }, 500);
                this.flipped = [];
            }, 1000);
        }
        this.updateHeader();
    }

    updateHeader() {
        this.container.querySelector('.memory-moves').textContent = `Træk: ${this.moves}`;
        this.container.querySelector('.memory-pairs').textContent = `Par fundet: ${this.matched.size} / ${this.pairs.length}`;
    }

    showWin() {
        setTimeout(() => {
            this.container.innerHTML = `
                <div class="exercise-results memory-win">
                    <h3>Tillykke!</h3>
                    <p>Du fandt alle par på ${this.moves} træk!</p>
                    <button class="btn" onclick="location.reload()">Spil igen</button>
                </div>
            `;
        }, 500);
    }
}

/**
 * SpeedChallenge - Timed vocabulary matching
 * Data format: [{ russian: "Привет", danish: "Hej" }]
 */
class SpeedChallenge {
    constructor(containerId, words, timeLimit = 60) {
        this.container = document.getElementById(containerId);
        this.words = [...words].sort(() => Math.random() - 0.5);
        this.timeLimit = timeLimit;
        this.timeLeft = timeLimit;
        this.score = 0;
        this.currentIndex = 0;
        this.timer = null;
        this.started = false;
        this.render();
    }

    render() {
        if (!this.started) {
            this.container.innerHTML = `
                <div class="speed-challenge-start">
                    <h3>Hurtighedsudfordring</h3>
                    <p>Du har ${this.timeLimit} sekunder til at matche så mange ord som muligt!</p>
                    <button class="btn speed-start-btn">Start!</button>
                </div>
            `;
            this.container.querySelector('.speed-start-btn').addEventListener('click', () => this.start());
            return;
        }

        const word = this.words[this.currentIndex];
        const options = this.generateOptions(word);

        this.container.innerHTML = `
            <div class="speed-challenge-game">
                <div class="speed-header">
                    <div class="speed-timer">
                        <div class="timer-bar" style="width: ${(this.timeLeft / this.timeLimit) * 100}%"></div>
                        <span class="timer-text">${this.timeLeft}s</span>
                    </div>
                    <div class="speed-score">Point: ${this.score}</div>
                </div>
                <div class="speed-word" onclick="TTS.speak('${word.russian}')">${word.russian}</div>
                <div class="speed-options">
                    ${options.map(opt => `
                        <button class="speed-option" data-correct="${opt === word.danish}">${opt}</button>
                    `).join('')}
                </div>
            </div>
        `;

        this.container.querySelectorAll('.speed-option').forEach(btn => {
            btn.addEventListener('click', () => this.checkAnswer(btn));
        });
    }

    generateOptions(correctWord) {
        const options = [correctWord.danish];
        const otherWords = this.words.filter(w => w.danish !== correctWord.danish);
        while (options.length < 4 && otherWords.length > 0) {
            const randomIndex = Math.floor(Math.random() * otherWords.length);
            options.push(otherWords[randomIndex].danish);
            otherWords.splice(randomIndex, 1);
        }
        return options.sort(() => Math.random() - 0.5);
    }

    start() {
        this.started = true;
        this.timer = setInterval(() => {
            this.timeLeft--;
            const timerBar = this.container.querySelector('.timer-bar');
            const timerText = this.container.querySelector('.timer-text');
            if (timerBar) {
                timerBar.style.width = `${(this.timeLeft / this.timeLimit) * 100}%`;
                timerText.textContent = `${this.timeLeft}s`;
            }
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
        this.render();
    }

    checkAnswer(btn) {
        const isCorrect = btn.dataset.correct === 'true';

        if (isCorrect) {
            this.score += 10;
            btn.classList.add('correct');
        } else {
            btn.classList.add('incorrect');
        }

        setTimeout(() => {
            this.currentIndex++;
            if (this.currentIndex >= this.words.length) {
                this.currentIndex = 0;
                this.words.sort(() => Math.random() - 0.5);
            }
            this.render();
        }, 300);
    }

    endGame() {
        clearInterval(this.timer);
        this.container.innerHTML = `
            <div class="exercise-results speed-results">
                <h3>Tid er ude!</h3>
                <div class="result-score">${this.score}</div>
                <p>point på ${this.timeLimit} sekunder</p>
                <button class="btn" onclick="location.reload()">Prøv igen</button>
            </div>
        `;
    }
}

/**
 * WordScramble - Unscramble letters to form words
 * Data format: [{ russian: "Привет", danish: "Hej" }]
 */
class WordScramble {
    constructor(containerId, words) {
        this.container = document.getElementById(containerId);
        this.words = words;
        this.currentIndex = 0;
        this.score = 0;
        this.render();
    }

    scramble(word) {
        return word.split('').sort(() => Math.random() - 0.5);
    }

    render() {
        const word = this.words[this.currentIndex];
        const scrambled = this.scramble(word.russian);

        this.container.innerHTML = `
            <div class="exercise-header">
                <span class="exercise-progress">Ord ${this.currentIndex + 1} af ${this.words.length}</span>
                <span class="exercise-score">Point: ${this.score}</span>
            </div>
            <div class="scramble-hint">
                <p>Betydning: <strong>${word.danish}</strong></p>
                <button class="hint-btn">Lyt til ordet</button>
            </div>
            <div class="scramble-letters">
                ${scrambled.map((letter, i) => `
                    <div class="scramble-letter" data-letter="${letter}" data-index="${i}">${letter}</div>
                `).join('')}
            </div>
            <div class="scramble-answer"></div>
            <div class="exercise-actions">
                <button class="btn btn-outline clear-scramble-btn">Ryd</button>
                <button class="btn check-scramble-btn">Tjek</button>
            </div>
            <div class="exercise-feedback"></div>
        `;

        this.bindEvents(word);
    }

    bindEvents(word) {
        const hintBtn = this.container.querySelector('.hint-btn');
        const letters = this.container.querySelectorAll('.scramble-letter');
        const answerArea = this.container.querySelector('.scramble-answer');
        const clearBtn = this.container.querySelector('.clear-scramble-btn');
        const checkBtn = this.container.querySelector('.check-scramble-btn');
        const feedback = this.container.querySelector('.exercise-feedback');

        hintBtn.addEventListener('click', () => TTS.speak(word.russian));

        letters.forEach(letter => {
            letter.addEventListener('click', () => {
                if (letter.classList.contains('used')) return;
                letter.classList.add('used');
                const span = document.createElement('span');
                span.className = 'answer-letter';
                span.textContent = letter.dataset.letter;
                span.dataset.index = letter.dataset.index;
                span.addEventListener('click', () => {
                    letter.classList.remove('used');
                    span.remove();
                });
                answerArea.appendChild(span);
            });
        });

        clearBtn.addEventListener('click', () => {
            letters.forEach(l => l.classList.remove('used'));
            answerArea.innerHTML = '';
        });

        checkBtn.addEventListener('click', () => {
            const answer = Array.from(answerArea.querySelectorAll('.answer-letter'))
                .map(l => l.textContent).join('');

            if (answer === word.russian) {
                this.score++;
                feedback.className = 'exercise-feedback correct';
                feedback.innerHTML = `<strong>Rigtigt!</strong> <button class="btn btn-next">Næste</button>`;
                TTS.speak(word.russian);
            } else {
                feedback.className = 'exercise-feedback incorrect';
                feedback.innerHTML = `<strong>Prøv igen!</strong> Det rigtige ord er: ${word.russian}
                    <button class="btn btn-next">Næste</button>`;
            }

            this.container.querySelector('.btn-next').addEventListener('click', () => {
                this.currentIndex++;
                if (this.currentIndex < this.words.length) {
                    this.render();
                } else {
                    this.showResults();
                }
            });
        });
    }

    showResults() {
        const percent = Math.round((this.score / this.words.length) * 100);
        this.container.innerHTML = `
            <div class="exercise-results">
                <h3>Færdig!</h3>
                <div class="result-score">${this.score} / ${this.words.length}</div>
                <div class="result-percent">${percent}%</div>
                <button class="btn" onclick="location.reload()">Prøv igen</button>
            </div>
        `;
    }
}

/**
 * LessonProgress - Track lesson completion
 */
class LessonProgress {
    constructor(lessonId) {
        this.lessonId = lessonId;
        this.key = `russlearn_progress_${lessonId}`;
    }

    save(data) {
        localStorage.setItem(this.key, JSON.stringify({
            ...data,
            timestamp: Date.now()
        }));
    }

    load() {
        const saved = localStorage.getItem(this.key);
        return saved ? JSON.parse(saved) : null;
    }

    markComplete() {
        this.save({ completed: true });
    }

    isComplete() {
        const data = this.load();
        return data?.completed || false;
    }
}

// Export for ES modules
export {
    SentenceBuilder,
    Flashcards,
    Dialogue,
    MemoryGame,
    SpeedChallenge,
    WordScramble,
    LessonProgress,
    reportScore
};

// Global exports for backward compatibility
if (typeof window !== 'undefined') {
    window.SentenceBuilder = SentenceBuilder;
    window.Flashcards = Flashcards;
    window.Dialogue = Dialogue;
    window.MemoryGame = MemoryGame;
    window.SpeedChallenge = SpeedChallenge;
    window.WordScramble = WordScramble;
    window.LessonProgress = LessonProgress;
}
