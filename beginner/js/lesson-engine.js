/**
 * Samovar - Lesson Engine for Beginners
 * Standardized components for interactive Russian lessons
 * Version 1.0
 */

// ============================================
// TEXT-TO-SPEECH ENGINE (ElevenLabs API)
// ============================================

const TTS = {
    // Never hardcode API keys in frontend code. Provide it at runtime via window.ELEVENLABS_API_KEY if needed.
    apiKey: (typeof window !== 'undefined' && window.ELEVENLABS_API_KEY) ? window.ELEVENLABS_API_KEY : '',
    // Voices: Lily (Female), Daniel (Male)
    voices: {
        female: 'XrExE9yKIg1WjnnlVkGX', // Lily
        male: 'onwK4e9ZLuTAKqWW03F9'    // Daniel
    },
    defaultVoice: 'female',
    isPlaying: false,
    audioCache: new Map(),

    // Scroll to top on load
    init() {
        if (typeof window !== 'undefined') {
            window.onload = () => window.scrollTo(0, 0);
        }
    },

    async speak(text, slow = false, gender = 'female') {
        if (!text || this.isPlaying) return Promise.resolve();

        if (!this.apiKey) {
            return this.fallbackSpeak(text, slow);
        }

        const voiceId = this.voices[gender] || this.voices[this.defaultVoice];
        const cacheKey = `${text}_${slow ? 'slow' : 'normal'}_${voiceId}`;

        if (this.audioCache.has(cacheKey)) {
            return this.playAudio(this.audioCache.get(cacheKey));
        }

        try {
            this.isPlaying = true;

            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': this.apiKey
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                        speed: slow ? 0.7 : 1.0
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`ElevenLabs API error: ${response.status}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            // Cache the audio
            this.audioCache.set(cacheKey, audioUrl);

            return this.playAudio(audioUrl);
        } catch (error) {
            console.error('TTS Error:', error);
            // Fallback to browser TTS
            return this.fallbackSpeak(text, slow);
        }
    },

    playAudio(url) {
        return new Promise((resolve) => {
            const audio = new Audio(url);
            audio.onended = () => {
                this.isPlaying = false;
                resolve();
            };
            audio.onerror = () => {
                this.isPlaying = false;
                resolve();
            };
            audio.play().catch(() => {
                this.isPlaying = false;
                resolve();
            });
        });
    },

    fallbackSpeak(text, slow = false) {
        return new Promise((resolve) => {
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'ru-RU';
                utterance.rate = slow ? 0.6 : 0.85;
                utterance.onend = () => {
                    this.isPlaying = false;
                    resolve();
                };
                utterance.onerror = () => {
                    this.isPlaying = false;
                    resolve();
                };
                speechSynthesis.speak(utterance);
            } else {
                this.isPlaying = false;
                resolve();
            }
        });
    },

    speakSlow(text, gender = 'female') {
        return this.speak(text, true, gender);
    },

    stop() {
        this.isPlaying = false;
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
    }
};

// Initialize scroll fix
TTS.init();

// ============================================
// CLAUDE API INTEGRATION (via Netlify Proxy)
// ============================================

// API calls are proxied through Netlify Functions for security
// The actual API key is stored in Netlify environment variables
const CLAUDE_API_URL = '/api/claude-proxy';

/**
 * Call Claude API via secure proxy
 * @param {Array} messages - Array of {role, content} objects
 * @param {string} systemPrompt - Optional system prompt
 * @param {number} maxTokens - Max tokens to generate
 */
async function callClaudeAPI(messages, systemPrompt = '', maxTokens = 250) {
    // Format messages for Claude
    const validMessages = messages.filter(m => m.role !== 'system');

    try {
        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                messages: validMessages,
                system: systemPrompt,
                max_tokens: maxTokens
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Claude API Error:', response.status, errorData);

            if (response.status === 429) throw new Error('Rate limited. Please wait a moment.');
            if (response.status === 500) throw new Error('API not configured');
            throw new Error(errorData.error || `API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.content[0].text;
    } catch (error) {
        console.error('Call to Claude failed:', error);
        throw error;
    }
}



// ============================================
// VOCABULARY CARD COMPONENT
// ============================================

class VocabularyCard {
    constructor(container, data) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.data = data; // { russian, danish, transcription, example?, exampleDanish? }
        this.render();
    }

    render() {
        const card = document.createElement('div');
        card.className = 'vocab-card';

        card.innerHTML = `
            <div class="vocab-russian">
                <span class="vocab-word">${this.data.russian}</span>
                <button class="speak-btn" title="Lyt til udtale">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    </svg>
                </button>
            </div>
            <div class="vocab-transcription">[${this.data.transcription}]</div>
            <div class="vocab-danish">${this.data.danish}</div>
            ${this.data.example ? `
                <div class="vocab-example">
                    <div class="example-russian">${this.data.example}</div>
                    <div class="example-danish">${this.data.exampleDanish || ''}</div>
                </div>
            ` : ''}
        `;

        // Add speak functionality
        card.querySelector('.speak-btn').addEventListener('click', () => {
            TTS.speak(this.data.russian);
        });

        // Click on word also speaks
        card.querySelector('.vocab-word').addEventListener('click', () => {
            TTS.speak(this.data.russian);
        });

        this.container.appendChild(card);
    }
}

// ============================================
// VOCABULARY LIST COMPONENT
// ============================================

class VocabularyList {
    constructor(containerId, words) {
        this.container = document.getElementById(containerId);
        this.words = words;
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        this.container.className = 'vocab-grid';

        this.words.forEach(word => {
            new VocabularyCard(this.container, word);
        });
    }
}

// ============================================
// FILL-IN-THE-BLANK EXERCISE
// ============================================

class FillBlankExercise {
    constructor(containerId, sentences) {
        this.container = document.getElementById(containerId);
        this.exerciseId = containerId;
        this.sentences = sentences; // [{ text: "Меня ___ Анна.", answer: "зовут", hint: "hedder" }]
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

        // Enter key submits
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer(input, sentence, feedback);
        });

        checkBtn.addEventListener('click', () => {
            this.checkAnswer(input, sentence, feedback);
        });

        // Speak full sentence
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

            this.container.querySelector('.btn-next').addEventListener('click', () => {
                this.next();
            });
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
                this.container.querySelector('.btn-next-final').addEventListener('click', () => {
                    this.next();
                });
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

        if (typeof reportExerciseScore === 'function') {
            reportExerciseScore(this.exerciseId, this.score, this.sentences.length);
        }
        this.container.innerHTML = `
            <div class="exercise-results">
                <h3>Resultat</h3>
                <div class="result-score">${this.score} / ${this.sentences.length}</div>
                <div class="result-percent">${percent}% korrekt</div>
                <p class="result-message">${this.getResultMessage(percent)}</p>
                <button class="btn" onclick="location.reload()">Prøv igen</button>
            </div>
        `;
    }

    getResultMessage(percent) {
        if (percent === 100) return "Fantastisk! Du mestrer dette emne!";
        if (percent >= 80) return "Meget godt! Du er på rette vej.";
        if (percent >= 60) return "Godt arbejde. Øv lidt mere for at forbedre dig.";
        return "Bliv ved med at øve. Du bliver bedre!";
    }
}

// ============================================
// LISTENING EXERCISE
// ============================================

class ListeningExercise {
    constructor(containerId, items) {
        this.container = document.getElementById(containerId);
        this.exerciseId = containerId;
        this.items = items; // [{ audio: "Привет", options: ["Hej", "Farvel", "Tak"], correct: 0 }]
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

        if (typeof reportExerciseScore === 'function') {
            reportExerciseScore(this.exerciseId, this.score, this.items.length);
        }
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

// ============================================
// MATCHING EXERCISE (Drag or Click)
// ============================================

class MatchingExercise {
    constructor(containerId, pairs) {
        this.container = document.getElementById(containerId);
        this.exerciseId = containerId;
        this.pairs = pairs; // [{ russian: "Привет", danish: "Hej" }]
        this.selectedLeft = null;
        this.matched = new Set();
        this.render();
    }

    render() {
        // Shuffle the right column
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
                    ${shuffledDanish.map((p, i) => `
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

        // Speak buttons
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

                // Find if this is a correct pair
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
        feedback.innerHTML = `
            <strong>Alle par matchet!</strong> Godt arbejde!
        `;

        if (typeof reportExerciseScore === 'function') {
            reportExerciseScore(this.exerciseId, this.matched.size, this.pairs.length);
        }
    }
}

// ============================================
// WRITING EXERCISE (Dictation)
// ============================================

class WritingExercise {
    constructor(containerId, words) {
        this.container = document.getElementById(containerId);
        this.exerciseId = containerId;
        this.words = words; // [{ russian: "Привет", danish: "Hej", hint: "6 bogstaver" }]
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

        if (typeof reportExerciseScore === 'function') {
            reportExerciseScore(this.exerciseId, this.score, this.words.length);
        }
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

// ============================================
// SENTENCE BUILDER (Word Order)
// ============================================

class SentenceBuilder {
    constructor(containerId, sentences) {
        this.container = document.getElementById(containerId);
        this.exerciseId = containerId;
        this.sentences = sentences; // [{ words: ["Меня", "зовут", "Анна"], danish: "Jeg hedder Anna" }]
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
                    // Re-enable the word tile
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

        checkBtn.addEventListener('click', () => {
            this.checkAnswer(sentence, feedback);
        });
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
            feedback.innerHTML = `
                <strong>Rigtigt!</strong>
                <button class="btn btn-next">Næste</button>
            `;
            TTS.speak(correct);
        } else {
            feedback.className = 'exercise-feedback incorrect';
            feedback.innerHTML = `
                <strong>Ikke helt.</strong> Korrekt: <strong>${correct}</strong>
                <button class="btn btn-next">Næste</button>
            `;
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

        if (typeof reportExerciseScore === 'function') {
            reportExerciseScore(this.exerciseId, this.score, this.sentences.length);
        }
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

// ============================================
// FLASHCARD COMPONENT
// ============================================

class Flashcards {
    constructor(containerId, cards) {
        this.container = document.getElementById(containerId);
        this.cards = cards; // [{ front: "Привет", back: "Hej", audio: true }]
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

// ============================================
// DIALOGUE COMPONENT
// ============================================

class Dialogue {
    constructor(containerId, lines) {
        this.container = document.getElementById(containerId);
        this.lines = lines; // [{ speaker: "A", russian: "Привет!", danish: "Hej!" }]
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

        playAllBtn.addEventListener('click', () => {
            this.playAll();
        });
    }

    async playAll() {
        for (let i = 0; i < this.lines.length; i++) {
            TTS.speak(this.lines[i].russian);
            // Wait for speech to finish (approximate)
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

// ============================================
// PROGRESS TRACKER
// ============================================

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

// ============================================
// MEMORY GAME - Match pairs
// ============================================

class MemoryGame {
    constructor(containerId, pairs) {
        this.container = document.getElementById(containerId);
        this.pairs = pairs; // [{ russian: "Привет", danish: "Hej" }]
        this.cards = [];
        this.flipped = [];
        this.matched = new Set();
        this.moves = 0;
        this.init();
    }

    init() {
        // Create card pairs
        this.pairs.forEach((pair, idx) => {
            this.cards.push({ id: idx, type: 'russian', text: pair.russian, pairId: idx });
            this.cards.push({ id: idx + 100, type: 'danish', text: pair.danish, pairId: idx });
        });
        // Shuffle
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

        // Speak the word
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
            // Match!
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
            // No match
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
                    <div class="win-animation">
                        <div class="confetti"></div>
                    </div>
                    <h3>Tillykke!</h3>
                    <p>Du fandt alle par pa ${this.moves} træk!</p>
                    <button class="btn" onclick="location.reload()">Spil igen</button>
                </div>
            `;
        }, 500);
    }
}

// ============================================
// SPEED CHALLENGE - Timed vocabulary
// ============================================

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
                    <p>Du har ${this.timeLimit} sekunder til at matche sa mange ord som muligt!</p>
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
            this.container.querySelector('.speed-word').classList.add('pulse-success');
        } else {
            btn.classList.add('incorrect');
            this.container.querySelector('.speed-word').classList.add('shake');
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
                <p>point pa ${this.timeLimit} sekunder</p>
                <button class="btn" onclick="location.reload()">Prov igen</button>
            </div>
        `;
    }
}

// ============================================
// WORD SCRAMBLE - Unscramble letters
// ============================================

class WordScramble {
    constructor(containerId, words) {
        this.container = document.getElementById(containerId);
        this.words = words; // [{ russian: "Привет", danish: "Hej" }]
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
                <button class="hint-btn" onclick="TTS.speak('${word.russian}')">Lyt til ordet</button>
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
        const letters = this.container.querySelectorAll('.scramble-letter');
        const answerArea = this.container.querySelector('.scramble-answer');
        const clearBtn = this.container.querySelector('.clear-scramble-btn');
        const checkBtn = this.container.querySelector('.check-scramble-btn');
        const feedback = this.container.querySelector('.exercise-feedback');

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
                answerArea.classList.add('pulse-success');
                TTS.speak(word.russian);
            } else {
                feedback.className = 'exercise-feedback incorrect';
                feedback.innerHTML = `<strong>Prøv igen!</strong> Det rigtige ord er: ${word.russian}
                    <button class="btn btn-next">Næste</button>`;
                answerArea.classList.add('shake');
                setTimeout(() => answerArea.classList.remove('shake'), 500);
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

// ============================================
// TYPING PRACTICE - Type what you hear
// ============================================

const TYPING_ICONS = {
    keyboard: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: #1a1a1a;"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="6" y1="8" x2="6" y2="8"/><line x1="10" y1="8" x2="10" y2="8"/><line x1="14" y1="8" x2="14" y2="8"/><line x1="18" y1="8" x2="18" y2="8"/><line x1="6" y1="12" x2="6" y2="12"/><line x1="10" y1="12" x2="10" y2="12"/><line x1="14" y1="12" x2="14" y2="12"/><line x1="18" y1="12" x2="18" y2="12"/><line x1="6" y1="16" x2="18" y2="16"/></svg>`,
    listen: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`
};

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
                        <span style="display: block; font-size: 0.75rem; letter-spacing: 0.1em; color: #ef4444; font-weight: 600; text-transform: uppercase; margin-bottom: 0.25rem;">ØVELSE 3</span>
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
            // Success
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
            // Error
            this.streak = 0;

            input.style.borderColor = '#ef4444';
            input.style.backgroundColor = '#fef2f2';
            input.style.color = '#b91c1c';
            input.classList.add('error');

            // Shake effect
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

            // Allow retry (or actually just advance for now if we want to mimic strict flow, but user probably wants to type it correctly)
            // Let's reset after 2 sec so they can try again or move on? 
            // Better UX: Keep error state, let them type again.

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

// ============================================
// ANIMATED DIALOGUE - Typewriter effect
// ============================================

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
            await this.delay(500); // Small pause between lines
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

            // Typewriter effect
            const russianEl = bubble.querySelector('.dialogue-russian');
            await this.typewriter(russianEl, line.russian);

            // Speak and wait for audio to finish
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

// ============================================
// AI CONVERSATION PRACTICE - Chat with AI tutor
// ============================================

class AIConversation {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.config = {
            topic: config.topic || 'general',
            level: config.level || 'A1',
            vocabulary: config.vocabulary || [],
            systemPrompt: config.systemPrompt || '',
            starterPrompts: config.starterPrompts || [],
            ...config
        };
        this.messages = [];
        this.isLoading = false;
        // API key handled globally
        this.renderStartScreen();
    }

    renderStartScreen() {
        // Simple SVG for bot icon
        const botIcon = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: #1a1a1a;"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><rect x="5" y="8" width="14" height="12" rx="2"/><line x1="12" y1="13" x2="12" y2="13"/><line x1="9" y1="13" x2="9" y2="13"/><line x1="15" y1="13" x2="15" y2="13"/></svg>`;

        this.container.innerHTML = `
            <div class="ai-conversation-start" style="text-align: center; padding: 2rem; background: #f9f9f9; border-radius: 12px;">
                <div class="ai-icon" style="margin-bottom: 1rem;">${botIcon}</div>
                <h3 style="margin-bottom: 0.5rem;">Øv Samtale</h3>
                <p style="color: #666; margin-bottom: 2rem;">Snak med AI-tutoren om "${this.config.topic}"</p>
                <button class="btn btn-primary start-chat-btn">Start Samtale</button>
            </div>
        `;
        this.container.querySelector('.start-chat-btn').addEventListener('click', () => {
            this.render();
        });
    }

    getSystemPrompt() {
        const vocabList = this.config.vocabulary.map(v => `${v.russian} (${v.danish})`).join(', ');
        return `Du er en venlig russisk sprogtutor, der hjælper danske elever med at øve russisk på ${this.config.level} niveau.

EMNE FOR DENNE LEKTION: ${this.config.topic}

ORDFORRÅD SOM ELEVEN HAR LÆRT:
${vocabList}

REGLER:
1. Svar ALTID på russisk med dansk oversættelse i parentes
2. Brug KUN ord fra ordforrådet ovenfor + meget simple ord (я, ты, это, да, нет, и, или)
3. Hold sætninger KORTE (3-7 ord)
4. Ret venligt fejl og forklar på dansk
5. Giv ros når eleven skriver korrekt
6. Stil simple spørgsmål for at holde samtalen i gang
7. Hvis eleven skriver på dansk, hjælp dem med at oversætte til russisk

${this.config.systemPrompt}

Start med en venlig hilsen på russisk relateret til lektionens emne.`;
    }

    render() {
        const botIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><rect x="5" y="8" width="14" height="12" rx="2"/><line x1="8" y1="13" x2="10" y2="13"/><line x1="14" y1="13" x2="16" y2="13"/></svg>`;

        this.container.innerHTML = `
            <div class="ai-conversation">
                <div class="ai-header">
                    <div class="ai-avatar" style="background: #e0e0e0; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: #333;">${botIcon}</div>
                    <div class="ai-info">
                        <div class="ai-name">Russisk Tutor</div>
                        <div class="ai-status">Online • ${this.config.topic}</div>
                    </div>
                    <button class="ai-help-btn" title="Hjælp">?</button>
                </div>
                <div class="ai-messages"></div>
                <div class="ai-starter-prompts">
                    ${this.config.starterPrompts.map(p => `
                        <button class="ai-starter-btn" data-text="${p.russian}">${p.danish}</button>
                    `).join('')}
                </div>
                <div class="ai-input-area">
                    <input type="text" class="ai-input" placeholder="Skriv på russisk eller dansk..." autocomplete="off">
                    <button class="ai-send-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </div>
                <div class="ai-disclaimer">
                    AI-tutor hjælper dig med at øve. Svar kan indeholde fejl.
                </div>
            </div>
        `;

        this.messagesEl = this.container.querySelector('.ai-messages');
        this.inputEl = this.container.querySelector('.ai-input');
        this.sendBtn = this.container.querySelector('.ai-send-btn');
        this.starterBtns = this.container.querySelectorAll('.ai-starter-btn');
        this.helpBtn = this.container.querySelector('.ai-help-btn');

        this.bindEvents();
        this.startConversation();
    }

    bindEvents() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.inputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isLoading) this.sendMessage();
        });

        this.starterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.inputEl.value = btn.dataset.text;
                this.sendMessage();
            });
        });

        this.helpBtn.addEventListener('click', () => this.showHelp());
    }

    async startConversation() {
        this.addMessage('ai', 'Загрузка...', 'Indlæser...');

        try {
            const response = await this.callAI([
                { role: 'system', content: this.getSystemPrompt() },
                { role: 'user', content: 'Start samtalen med en venlig hilsen på russisk relateret til emnet.' }
            ]);

            this.messagesEl.innerHTML = '';
            this.addMessage('ai', response);
            this.speakMessage(response);
        } catch (error) {
            this.messagesEl.innerHTML = '';
            this.addMessage('ai', 'Привет! Давай поговорим!', 'Hej! Lad os snakke!');
        }
    }

    async sendMessage() {
        const text = this.inputEl.value.trim();
        if (!text || this.isLoading) return;

        this.inputEl.value = '';
        this.addMessage('user', text);
        this.hideStarterPrompts();

        this.isLoading = true;
        this.showTypingIndicator();

        try {
            this.messages.push({ role: 'user', content: text });

            const response = await this.callAI([
                { role: 'system', content: this.getSystemPrompt() },
                ...this.messages
            ]);

            this.messages.push({ role: 'assistant', content: response });
            this.hideTypingIndicator();
            this.addMessage('ai', response);
            this.speakMessage(response);
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('ai', 'Beklager, der opstod en fejl. Prøv igen.');
        }

        this.isLoading = false;
    }

    async callAI(messages) {
        // Extract system prompt
        const systemMsg = messages.find(m => m.role === 'system');
        const flowMessages = messages.filter(m => m.role !== 'system');
        const systemPrompt = systemMsg ? systemMsg.content : '';

        return await callClaudeAPI(flowMessages, systemPrompt, 250);
    }

    addMessage(type, text, translation = null) {
        const msgEl = document.createElement('div');
        msgEl.className = `ai-message ai-message-${type}`;

        // Extract Russian text for TTS (text before parentheses)
        const russianText = text.split('(')[0].trim();

        msgEl.innerHTML = `
            <div class="ai-message-content">
                ${text}
            </div>
            ${type === 'ai' ? `
                <button class="ai-speak-btn" title="Lyt">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    </svg>
                </button>
            ` : ''}
        `;

        if (type === 'ai') {
            msgEl.querySelector('.ai-speak-btn').addEventListener('click', () => {
                TTS.speak(russianText);
            });
        }

        this.messagesEl.appendChild(msgEl);
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    speakMessage(text) {
        // Extract Russian text (before parentheses)
        const russianText = text.split('(')[0].trim();
        TTS.speak(russianText);
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'ai-typing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        this.messagesEl.appendChild(indicator);
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = this.messagesEl.querySelector('.ai-typing-indicator');
        if (indicator) indicator.remove();
    }

    hideStarterPrompts() {
        const prompts = this.container.querySelector('.ai-starter-prompts');
        if (prompts) prompts.style.display = 'none';
    }

    showHelp() {
        const helpModal = document.createElement('div');
        helpModal.className = 'ai-help-modal';
        helpModal.innerHTML = `
            <div class="ai-help-content">
                <h3>Sådan bruger du AI-tutoren</h3>
                <ul>
                    <li><strong>Skriv på russisk</strong> — Tutoren retter dine fejl</li>
                    <li><strong>Skriv på dansk</strong> — Tutoren hjælper dig med at oversætte</li>
                    <li><strong>Klik på højttaleren</strong> — Hør udtalen</li>
                    <li><strong>Brug starter-knapperne</strong> — Hurtige svar</li>
                </ul>
                <p class="ai-help-tip">💡 Prøv at bruge ordene fra lektionen!</p>
                <button class="btn ai-help-close">Forstået</button>
            </div>
        `;
        this.container.appendChild(helpModal);
        helpModal.querySelector('.ai-help-close').addEventListener('click', () => helpModal.remove());
    }
}

// ============================================
// AI TRANSLATION CHALLENGE - Translate with AI feedback
// ============================================

class AITranslationChallenge {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.config = config;
        this.sentences = config.sentences || []; // [{ danish: "...", russian: "...", hint: "..." }]
        this.vocabulary = config.vocabulary || [];
        this.currentIndex = 0;
        this.currentIndex = 0;
        this.score = 0;
        // API key handled globally
        this.render();
    }

    async generateInitialHint() {
        // API key check handled globally
        const systemPrompt = `Du er en ordgætteleg-vært. Du skal give hints til et russisk ord UDEN at sige selve ordet.

ORDET ER: ${this.currentWord.russian} (${this.currentWord.danish})

REGLER:
1. Giv ÉT hint på dansk der beskriver ordet
2. Giv ALDRIG selve ordet eller direkte oversættelse
3. Hint kan være: kategori, hvad man bruger det til, hvor man finder det, etc.
4. Hold det kort (max 10 ord)
5. Svar KUN med hintet, intet andet`;

        try {
            const hint = await callClaudeAPI([
                { role: 'user', content: 'Giv mig det første hint.' }
            ], systemPrompt, 50);

            this.container.querySelector('.detective-hints').innerHTML = `
                <div class="hint-item">
                    <span class="hint-number">Hint 1:</span>
                    <span class="hint-text">${hint}</span>
                </div>
            `;
        } catch (error) {
            this.container.querySelector('.detective-hints').innerHTML = `
                <div class="hint-item">
                    <span class="hint-number">Hint 1:</span>
                    <span class="hint-text">Kategori: ${this.config.category || 'ordforråd'}</span>
                </div>
            `;
        }
    }

    async getHint() {
        if (this.hintsUsed >= 3 || this.isLoading) return;
        this.hintsUsed++;
        this.container.querySelector('.detective-hint-btn').textContent = `💡 Fe5 hint (${3 - this.hintsUsed} tilbage)`;

        // API key check handled globally

        const hintTypes = [
            'Giv et hint om ordets første bogstav på russisk',
            'Giv et hint om hvor mange stavelser ordet har',
            'Giv et eksempel-sætning med ___ i stedet for ordet'
        ];

        const systemPrompt = `Du er en ordgætteleg-vært. Ordet er: ${this.currentWord.russian} (${this.currentWord.danish})
${hintTypes[this.hintsUsed - 1]}
Svar KUN med hintet, max 15 ord.`;

        try {
            this.isLoading = true;
            const hint = await callClaudeAPI([
                { role: 'user', content: 'Hint?' }
            ], systemPrompt, 50);

            const hintsEl = this.container.querySelector('.detective-hints');
            hintsEl.innerHTML += `
                <div class="hint-item new">
                    <span class="hint-number">Hint ${this.hintsUsed + 1}:</span>
                    <span class="hint-text">${hint}</span>
                </div>
            `;
        } catch (error) {
            console.error('Hint error:', error);
        }
        this.isLoading = false;
    }

    async startStory() {
        // API key check handled globally
        const contentEl = this.container.querySelector('.story-content');
        contentEl.innerHTML = '<div class="story-loading">📖 AI starter historien...</div>';

        try {
            const opening = await callClaudeAPI([
                { role: 'user', content: 'Start historien!' }
            ], this.getSystemPrompt(), 150);

            this.story.push({ role: 'ai', text: opening });
            this.renderStory();
        } catch (error) {
            contentEl.innerHTML = '<div class="story-error">Kunne ikke starte historien. Prøv igen.</div>';
        }
    }

    async continueStory() {
        // API key check handled globally
        const input = this.container.querySelector('.story-input');
        const userText = input.value.trim();
        if (!userText || this.isLoading) return;

        this.story.push({ role: 'user', text: userText });
        input.value = '';
        this.renderStory();
        this.isLoading = true;

        try {
            const messages = this.story.map(s => ({ role: s.role === 'ai' ? 'assistant' : 'user', content: s.text }));

            const continuation = await callClaudeAPI(messages, this.getSystemPrompt(), 150);

            this.story.push({ role: 'ai', text: continuation });
            this.renderStory();
        } catch (error) {
            console.error('Story error:', error);
        }
        this.isLoading = false;
    }
}

// ============================================
// AI WORD DETECTIVE - Guess the word from hints
// ============================================

class AIWordDetective {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.config = config;
        this.words = config.words || [];
        this.currentWord = null;
        this.hintsUsed = 0;
        this.score = 0;
        this.round = 0;
        this.maxRounds = config.maxRounds || 5;
        this.isLoading = false;
        // API key handled globally
        this.render();
    }

    async generateQuestion() {
        // API key check handled globally
        if (this.round >= this.maxRounds) {
            this.showResults();
            return;
        }

        const questionEl = this.container.querySelector('.quiz-question');
        const optionsEl = this.container.querySelector('.quiz-options');
        questionEl.innerHTML = '<div class="quiz-loading">🎲 Genererer spørgsmål...</div>';
        optionsEl.innerHTML = '';

        const vocabList = this.config.vocabulary.map(v => `${v.russian}=${v.danish}`).join(', ');
        const questionTypes = [
            'Hvad betyder [russisk ord] på dansk? (4 valgmuligheder)',
            'Hvordan siger man [dansk ord] på russisk? (4 valgmuligheder)',
            'Vælg det rigtige ord til at udfylde: [sætning med ___]',
            'Hvilket ord passer IKKE i gruppen?'
        ];
        const qType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

        const systemPrompt = `Du er en quiz-generator til russisk sprogindlæring.

ORDFORRÅD: ${vocabList}

OPGAVE: Generer et ${qType} spørgsmål.

FORMAT (JSON):
{
  "question": "Spørgsmålet på dansk",
  "options": ["A", "B", "C", "D"],
  "correct": 0,
  "explanation": "Kort forklaring"
}

REGLER:
1. Brug KUN ord fra ordforrådet
2. Gør det sjovt og varieret
3. Svar KUN med valid JSON, intet andet`;

        try {
            const content = await callClaudeAPI([
                { role: 'user', content: 'Generer spørgsmål!' }
            ], systemPrompt, 250);

            this.currentQuestion = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
            this.displayQuestion();
        } catch (error) {
            // Fallback question
            const word = this.config.vocabulary[Math.floor(Math.random() * this.config.vocabulary.length)];
            const wrongOptions = this.config.vocabulary.filter(v => v !== word).slice(0, 3).map(v => v.danish);
            this.currentQuestion = {
                question: `Hvad betyder "${word.russian}"?`,
                options: [word.danish, ...wrongOptions].sort(() => Math.random() - 0.5),
                correct: 0,
                explanation: `${word.russian} = ${word.danish}`
            };
            this.currentQuestion.correct = this.currentQuestion.options.indexOf(word.danish);
            this.displayQuestion();
        }
    }
}

// ============================================
// AI STORY BUILDER - Build a story together
// ============================================

class AIStoryBuilder {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.config = config;
        this.story = [];
        this.isLoading = false;
        // API key handled globally
        this.render();
    }

    async startStory() {
        // API key check handled globally
        const contentEl = this.container.querySelector('.story-content');
        contentEl.innerHTML = '<div class="story-loading">📖 AI starter historien...</div>';

        try {
            const opening = await callClaudeAPI([
                { role: 'user', content: 'Start historien!' }
            ], this.getSystemPrompt(), 150);

            if (!opening) {
                throw new Error('Empty AI response');
            }
            this.story.push({ role: 'ai', text: opening });
            this.renderStory();
        } catch (error) {
            contentEl.innerHTML = '<div class="story-error">Kunne ikke starte historien. Prøv igen.</div>';
        }
    }

    async continueStory() {
        const input = this.container.querySelector('.story-input');
        const userText = input.value.trim();
        if (!userText || this.isLoading) return;

        this.story.push({ role: 'user', text: userText });
        input.value = '';
        this.renderStory();
        this.isLoading = true;

        try {
            const messages = this.story.map(s => ({ role: s.role === 'ai' ? 'assistant' : 'user', content: s.text }));

            const continuation = await callClaudeAPI(messages, this.getSystemPrompt(), 150);

            this.story.push({ role: 'ai', text: continuation });
            this.renderStory();
        } catch (error) {
            console.error('Story error:', error);
        }
        this.isLoading = false;
    }

    renderStory() {
        const contentEl = this.container.querySelector('.story-content');
        contentEl.innerHTML = this.story.map(s => `
            <div class="story-part ${s.role}">
                <span class="story-author">${s.role === 'ai' ? '📖' : '✍️'}</span>
                <div class="story-text">${s.text}</div>
            </div>
        `).join('');
        contentEl.scrollTop = contentEl.scrollHeight;
    }
}

// ============================================
// AI QUICK QUIZ - Fast-paced AI quiz
// ============================================

const QUIZ_ICONS = {
    trophy: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #fbbf24;"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
    timer: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    fire: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #f59e0b;"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.072-4-2.072-5.5a5.57 5.57 0 1 1 11.14 0c0-2.3-1.14-4.5-2.07-5.5-.5 1-1 1.62-1 3a2.5 2.5 0 0 0 2.5 2.5c1.38 0 2 .5 2 1.5a5.5 5.5 0 0 1-11 5.5Z"/></svg>`,
    check: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    x: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    chat: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
};

class AIQuickQuiz {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.config = config;
        this.score = 0;
        this.streak = 0;
        this.round = 0;
        this.maxRounds = config.maxRounds || 10;
        this.timeLeft = 15;
        this.timer = null;
        this.currentQuestion = null;
        this.isLoading = false;
        // API key handled globally
        this.renderStartScreen();
    }

    renderStartScreen() {
        this.container.innerHTML = `
            <div class="ai-quiz-start" style="text-align: center; padding: 2rem;">
                <div class="quiz-icon" style="margin-bottom: 1rem;">${QUIZ_ICONS.trophy}</div>
                <h3 style="margin-bottom: 1rem;">Hurtig Quiz</h3>
                <p style="color: #666; margin-bottom: 2rem;">Test din viden mod uret! Du har ${this.timeLeft} sekunder pr. spørgsmål.</p>
                <button class="btn btn-primary start-quiz-btn">Start Quiz</button>
            </div>
        `;
        this.container.querySelector('.start-quiz-btn').addEventListener('click', () => {
            this.render();
            this.generateQuestion();
        });
    }

    render() {
        this.container.innerHTML = `
            <div class="ai-quiz">
                <div class="quiz-header">
                    <div class="quiz-score" style="display: flex; align-items: center; gap: 0.5rem;">
                        ${QUIZ_ICONS.trophy} <span style="font-size: 1.2rem; font-weight: bold;">${this.score}</span>
                    </div>
                    <div class="quiz-timer" style="display: flex; align-items: center; gap: 0.5rem; background: #f5f5f5; padding: 0.25rem 0.75rem; border-radius: 20px;">
                        ${QUIZ_ICONS.timer} <span style="font-family: monospace; font-size: 1.1rem;">${this.timeLeft}s</span>
                    </div>
                    <div class="quiz-streak" style="display: flex; align-items: center; gap: 0.5rem;">
                        ${QUIZ_ICONS.fire} <span style="font-weight: bold;">${this.streak}</span>
                    </div>
                </div>
                <div class="quiz-progress">
                    <div class="quiz-progress-bar" style="width: ${(this.round / this.maxRounds) * 100}%"></div>
                </div>
                <div class="quiz-question"></div>
                <div class="quiz-options"></div>
                <div class="quiz-feedback"></div>
            </div>
        `;
    }

    async generateQuestion() {
        // API key check handled globally
        if (this.round >= this.maxRounds) {
            this.showResults();
            return;
        }

        const questionEl = this.container.querySelector('.quiz-question');
        const optionsEl = this.container.querySelector('.quiz-options');
        questionEl.innerHTML = '<div class="quiz-loading">🎲 Genererer spørgsmål...</div>';
        optionsEl.innerHTML = '';

        const vocabList = this.config.vocabulary.map(v => `${v.russian}=${v.danish}`).join(', ');
        const questionTypes = [
            'Hvad betyder [russisk ord] på dansk? (4 valgmuligheder)',
            'Hvordan siger man [dansk ord] på russisk? (4 valgmuligheder)',
            'Vælg det rigtige ord til at udfylde: [sætning med ___]',
            'Hvilket ord passer IKKE i gruppen?'
        ];
        const qType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

        const systemPrompt = `Du er en quiz-generator til russisk sprogindlæring.

ORDFORRÅD: ${vocabList}

OPGAVE: Generer et ${qType} spørgsmål.

FORMAT (JSON):
{
  "question": "Spørgsmålet på dansk",
  "options": ["A", "B", "C", "D"],
  "correct": 0,
  "explanation": "Kort forklaring"
}

REGLER:
1. Brug KUN ord fra ordforrådet
2. Gør det sjovt og varieret
3. Svar KUN med valid JSON, intet andet`;

        try {
            const content = await callClaudeAPI([
                { role: 'user', content: 'Generer spørgsmål!' }
            ], systemPrompt, 250);

            this.currentQuestion = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
            this.displayQuestion();
        } catch (error) {
            // Fallback question
            const word = this.config.vocabulary[Math.floor(Math.random() * this.config.vocabulary.length)];
            const wrongOptions = this.config.vocabulary.filter(v => v !== word).slice(0, 3).map(v => v.danish);
            this.currentQuestion = {
                question: `Hvad betyder "${word.russian}"?`,
                options: [word.danish, ...wrongOptions].sort(() => Math.random() - 0.5),
                correct: 0,
                explanation: `${word.russian} = ${word.danish}`
            };
            this.currentQuestion.correct = this.currentQuestion.options.indexOf(word.danish);
            this.displayQuestion();
        }
    }

    displayQuestion() {
        const questionEl = this.container.querySelector('.quiz-question');
        const optionsEl = this.container.querySelector('.quiz-options');

        questionEl.innerHTML = `<h4>${this.currentQuestion.question}</h4>`;
        optionsEl.innerHTML = this.currentQuestion.options.map((opt, i) => `
            <button class="quiz-option" data-index="${i}">${opt}</button>
        `).join('');

        optionsEl.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', () => this.checkAnswer(parseInt(btn.dataset.index)));
        });

        this.startTimer();
    }

    startTimer() {
        this.timeLeft = 15;
        this.updateTimer();
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.timeUp();
            }
        }, 1000);
    }

    updateTimer() {
        const timerEl = this.container.querySelector('.quiz-timer');
        timerEl.innerHTML = `${QUIZ_ICONS.timer} <span style="font-family: monospace; font-size: 1.1rem;">${this.timeLeft}s</span>`;
        timerEl.className = `quiz-timer ${this.timeLeft <= 5 ? 'urgent' : ''}`;
    }

    checkAnswer(index) {
        clearInterval(this.timer);
        const feedbackEl = this.container.querySelector('.quiz-feedback');
        const optionsEl = this.container.querySelector('.quiz-options');
        const buttons = optionsEl.querySelectorAll('.quiz-option');

        buttons.forEach(btn => btn.disabled = true);
        buttons[this.currentQuestion.correct].classList.add('correct');

        if (index === this.currentQuestion.correct) {
            const points = 10 + this.streak * 2 + Math.floor(this.timeLeft / 3);
            this.score += points;
            this.streak++;
            feedbackEl.className = 'quiz-feedback correct';
            feedbackEl.innerHTML = `<div style="display:flex;align-items:center;gap:0.5rem;">${QUIZ_ICONS.check} <span>Rigtigt! +${points} point</span></div>`;
        } else {
            buttons[index].classList.add('incorrect');
            this.streak = 0;
            feedbackEl.className = 'quiz-feedback incorrect';
            feedbackEl.innerHTML = `<div style="display:flex;align-items:center;gap:0.5rem;">${QUIZ_ICONS.x} <span>${this.currentQuestion.explanation}</span></div>`;
        }

        this.round++;
        this.updateHeader();
        setTimeout(() => {
            feedbackEl.innerHTML = '';
            this.generateQuestion();
        }, 1500);
    }

    timeUp() {
        const feedbackEl = this.container.querySelector('.quiz-feedback');
        this.streak = 0;
        feedbackEl.className = 'quiz-feedback timeout';
        feedbackEl.innerHTML = `⏰ Tiden er udløbet! Svaret: ${this.currentQuestion.options[this.currentQuestion.correct]}`;
        this.round++;
        this.updateHeader();
        setTimeout(() => this.generateQuestion(), 2000);
    }

    updateHeader() {
        this.container.querySelector('.quiz-score').innerHTML = `${QUIZ_ICONS.trophy} <span style="font-size: 1.2rem; font-weight: bold;">${this.score}</span>`;
        this.container.querySelector('.quiz-streak').innerHTML = `${QUIZ_ICONS.fire} <span style="font-weight: bold;">${this.streak}</span>`;
        this.container.querySelector('.quiz-progress-bar').style.width = `${(this.round / this.maxRounds) * 100}%`;
    }

    showResults() {
        const rating = this.score >= 100 ? '🏆 Mester!' : this.score >= 60 ? '⭐ Godt klaret!' : '💪 Bliv ved!';
        this.container.innerHTML = `
            <div class="quiz-results" style="text-align: center; padding: 2rem;">
                <h3>Quiz Færdig!</h3>
                <div style="margin: 2rem 0;">${QUIZ_ICONS.trophy}</div>
                <div class="result-score" style="font-size: 3rem; font-weight: bold; margin-bottom: 1rem;">${this.score}</div>
                <p style="color: #666; margin-bottom: 2rem;">point</p>
                <p>${rating}</p>
                <button class="btn" onclick="location.reload()">Spil igen</button>
            </div>
        `;
    }
}

// ============================================
// AI EMOJI TRANSLATOR - Translate emoji stories
// ============================================

class AIEmojiTranslator {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.config = config;
        this.score = 0;
        this.round = 0;
        this.maxRounds = config.maxRounds || 6;
        this.currentChallenge = null;
        // API key handled globally
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="ai-emoji">
                <div class="emoji-header">
                    <span class="emoji-title">🎭 Emoji Oversætter</span>
                    <span class="emoji-score">Point: ${this.score}</span>
                </div>
                <div class="emoji-round">Runde ${this.round + 1} af ${this.maxRounds}</div>
                <div class="emoji-display"></div>
                <div class="emoji-hint"></div>
                <div class="emoji-input-area">
                    <input type="text" class="emoji-input" placeholder="Skriv sætningen på russisk..." autocomplete="off">
                    <button class="emoji-check-btn">Tjek</button>
                </div>
                <div class="emoji-feedback"></div>
            </div>
        `;
        this.bindEvents();
        this.generateChallenge();
    }

    bindEvents() {
        this.container.querySelector('.emoji-check-btn').addEventListener('click', () => this.checkAnswer());
        this.container.querySelector('.emoji-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });
    }

    async generateChallenge() {
        // API key check handled globally
        if (this.round >= this.maxRounds) {
            this.showResults();
            return;
        }

        const displayEl = this.container.querySelector('.emoji-display');
        const hintEl = this.container.querySelector('.emoji-hint');
        displayEl.innerHTML = '<div class="loading">🎲 Genererer emoji-udfordring...</div>';
        hintEl.innerHTML = '';

        const vocabList = this.config.vocabulary.map(v => `${v.russian}=${v.danish}`).join(', ');

        const systemPrompt = `Du er en emoji-historie generator til russisk sprogindlæring.

ORDFORRÅD: ${vocabList}

OPGAVE: Lav en emoji-sekvens der repræsenterer en kort russisk sætning.

FORMAT (JSON):
{
  "emojis": "🏠👨‍👩‍👧",
  "russian": "Моя семья дома",
  "danish": "Min familie er hjemme",
  "hint": "Familie + hjem"
}

REGLER:
1. Brug 2-5 emojis
2. Sætningen skal bruge ord fra ordforrådet
3. Hold sætningen KORT (3-5 ord)
4. Gør det sjovt og kreativt
5. Svar KUN med valid JSON`;

        try {
            const content = await callClaudeAPI([
                { role: 'user', content: 'Generer emoji-udfordring!' }
            ], systemPrompt, 150);

            this.currentChallenge = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
            displayEl.innerHTML = `<div class="emoji-sequence">${this.currentChallenge.emojis}</div>`;
            hintEl.innerHTML = `<button class="hint-btn">💡 Vis hint</button>`;
            hintEl.querySelector('.hint-btn').addEventListener('click', () => {
                hintEl.innerHTML = `<span class="hint-text">Hint: ${this.currentChallenge.hint} (${this.currentChallenge.danish})</span>`;
            });
        } catch (error) {
            displayEl.innerHTML = '<div class="error">Fejl - prøv igen</div>';
        }
    }

    async checkAnswer() {
        const input = this.container.querySelector('.emoji-input');
        const userAnswer = input.value.trim();
        if (!userAnswer) return;

        // API key check handled globally

        const feedbackEl = this.container.querySelector('.emoji-feedback');
        feedbackEl.innerHTML = '<div class="checking">🔍 AI tjekker dit svar...</div>';

        const systemPrompt = `Du er en russisk sprogbedømmer.

KORREKT SVAR: ${this.currentChallenge.russian} (${this.currentChallenge.danish})
ELEVENS SVAR: ${userAnswer}

Bedøm om svaret er korrekt eller acceptabelt (samme betydning, små stavefejl OK).

Svar med JSON:
{
  "correct": true/false,
  "feedback": "Kort feedback på dansk",
  "correction": "Korrekt version hvis forkert"
}`;

        try {
            const content = await callClaudeAPI([
                { role: 'user', content: 'Bedøm svaret.' }
            ], systemPrompt, 100);

            const result = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));

            if (result.correct) {
                this.score += 10;
                feedbackEl.className = 'emoji-feedback correct';
                feedbackEl.innerHTML = `✅ ${result.feedback}`;
                TTS.speak(this.currentChallenge.russian);
            } else {
                feedbackEl.className = 'emoji-feedback incorrect';
                feedbackEl.innerHTML = `❌ ${result.feedback}<br>Korrekt: <strong>${this.currentChallenge.russian}</strong>`;
            }

            this.round++;
            this.container.querySelector('.emoji-score').textContent = `Point: ${this.score}`;
            input.value = '';
            setTimeout(() => {
                feedbackEl.innerHTML = '';
                this.generateChallenge();
            }, 2500);
        } catch (error) {
            feedbackEl.innerHTML = 'Fejl ved tjek. Prøv igen.';
        }
    }

    showResults() {
        this.container.innerHTML = `
            <div class="emoji-results">
                <h3>🎭 Spil Slut!</h3>
                <div class="result-score">${this.score} point</div>
                <p>${this.score >= 50 ? '🌟 Emoji-mester!' : '💪 God øvelse!'}</p>
                <button class="btn" onclick="location.reload()">Spil igen</button>
            </div>
        `;
    }
}

// ============================================
// AI SENTENCE AUCTION - Bid on correct sentences
// ============================================

class AISentenceAuction {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.config = config;
        this.coins = 100;
        this.round = 0;
        this.maxRounds = config.maxRounds || 8;
        this.currentSentences = [];
        // API key handled globally
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="ai-auction">
                <div class="auction-header">
                    <span class="auction-title">🏛️ Sætnings-Auktion</span>
                    <span class="auction-coins">💰 ${this.coins} mønter</span>
                </div>
                <div class="auction-round">Runde ${this.round + 1} af ${this.maxRounds}</div>
                <div class="auction-task"></div>
                <div class="auction-sentences"></div>
                <div class="auction-feedback"></div>
            </div>
        `;
        this.generateRound();
    }

    async generateRound() {
        // API key check handled globally
        if (this.round >= this.maxRounds || this.coins <= 0) {
            this.showResults();
            return;
        }

        const taskEl = this.container.querySelector('.auction-task');
        const sentencesEl = this.container.querySelector('.auction-sentences');
        taskEl.innerHTML = '<div class="loading">🎲 Genererer sætninger...</div>';
        sentencesEl.innerHTML = '';

        const vocabList = this.config.vocabulary.map(v => `${v.russian}=${v.danish}`).join(', ');

        const systemPrompt = `Du er en quiz-generator. Lav 3 russiske sætninger hvor KUN ÉN er grammatisk korrekt.

ORDFORRÅD: ${vocabList}

FORMAT (JSON):
{
  "task": "Hvilken sætning er korrekt?",
  "sentences": [
    {"text": "Я люблю кофе", "correct": true, "explanation": "Korrekt: Я + люблю + objekt"},
    {"text": "Я любит кофе", "correct": false, "explanation": "Forkert: любит er 3. person"},
    {"text": "Меня люблю кофе", "correct": false, "explanation": "Forkert: Меня er akkusativ"}
  ]
}

REGLER:
1. Præcis 1 korrekt sætning, 2 forkerte
2. Forkerte sætninger skal have TYDELIGE grammatiske fejl
3. Brug ord fra ordforrådet
4. Bland rækkefølgen
5. Svar KUN med valid JSON`;

        try {
            const content = await callClaudeAPI([
                { role: 'user', content: 'Generer auktions-runde!' }
            ], systemPrompt, 300);

            const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));

            taskEl.innerHTML = `<h4>${parsed.task}</h4><p>Vælg den korrekte sætning. Forkert valg koster mønter!</p>`;
            this.currentSentences = parsed.sentences.sort(() => Math.random() - 0.5);

            sentencesEl.innerHTML = this.currentSentences.map((s, i) => `
                <button class="auction-sentence" data-index="${i}">
                    <span class="sentence-text">${s.text}</span>
                    <span class="sentence-cost">Byd 10 💰</span>
                </button>
            `).join('');

            sentencesEl.querySelectorAll('.auction-sentence').forEach(btn => {
                btn.addEventListener('click', () => this.selectSentence(parseInt(btn.dataset.index)));
            });
        } catch (error) {
            taskEl.innerHTML = '<div class="error">Fejl - prøv igen</div>';
        }
    }

    selectSentence(index) {
        const sentence = this.currentSentences[index];
        const feedbackEl = this.container.querySelector('.auction-feedback');
        const buttons = this.container.querySelectorAll('.auction-sentence');

        buttons.forEach(btn => btn.disabled = true);

        if (sentence.correct) {
            this.coins += 20;
            buttons[index].classList.add('correct');
            feedbackEl.className = 'auction-feedback correct';
            feedbackEl.innerHTML = `✅ Rigtigt! +20 mønter<br>${sentence.explanation}`;
            TTS.speak(sentence.text);
        } else {
            this.coins -= 10;
            buttons[index].classList.add('incorrect');
            const correctIndex = this.currentSentences.findIndex(s => s.correct);
            buttons[correctIndex].classList.add('correct');
            feedbackEl.className = 'auction-feedback incorrect';
            feedbackEl.innerHTML = `❌ Forkert! -10 mønter<br>${sentence.explanation}`;
        }

        this.container.querySelector('.auction-coins').textContent = `💰 ${this.coins} mønter`;
        this.round++;

        setTimeout(() => {
            feedbackEl.innerHTML = '';
            this.generateRound();
        }, 2500);
    }

    showResults() {
        const rating = this.coins >= 150 ? '🏆 Auktions-konge!' : this.coins >= 100 ? '⭐ God handel!' : '💸 Bedre held næste gang!';
        this.container.innerHTML = `
            <div class="auction-results">
                <h3>🏛️ Auktion Slut!</h3>
                <div class="result-coins">💰 ${this.coins} mønter</div>
                <p>${rating}</p>
                <button class="btn" onclick="location.reload()">Spil igen</button>
            </div>
        `;
    }
}

// ============================================
// AI FILL-IN-CONTEXT - Contextual gap filling
// ============================================

class AIFillInContext {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.config = config;
        this.score = 0;
        this.round = 0;
        this.maxRounds = config.maxRounds || 5;
        this.currentQuestion = null;
        this.renderStartScreen();
    }

    renderStartScreen() {
        this.container.innerHTML = `
            <div class="ai-exercise-start" style="text-align: center; padding: 2rem;">
                <div style="font-size: 2.5rem; margin-bottom: 1rem;">📝</div>
                <h3 style="margin-bottom: 1rem;">Udfyld i kontekst</h3>
                <p style="color: #666; margin-bottom: 2rem;">AI genererer sætninger med huller. Udfyld med det rigtige ord.</p>
                <button class="btn btn-primary start-btn">Start øvelse</button>
            </div>
        `;
        this.container.querySelector('.start-btn').addEventListener('click', () => {
            this.render();
            this.generateQuestion();
        });
    }

    render() {
        this.container.innerHTML = `
            <div class="ai-fill-context">
                <div class="exercise-header" style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
                    <span class="exercise-progress">Opgave ${this.round + 1} af ${this.maxRounds}</span>
                    <span class="exercise-score">Point: ${this.score}</span>
                </div>
                <div class="fill-question" style="min-height: 80px;"></div>
                <div class="fill-input-area" style="margin: 1.5rem 0;"></div>
                <div class="fill-feedback"></div>
            </div>
        `;
    }

    async generateQuestion() {
        if (this.round >= this.maxRounds) {
            this.showResults();
            return;
        }

        const questionEl = this.container.querySelector('.fill-question');
        const inputArea = this.container.querySelector('.fill-input-area');
        questionEl.innerHTML = '<div class="loading">🎲 Genererer opgave...</div>';

        const vocabList = this.config.vocabulary.map(v => `${v.russian}=${v.danish}`).join(', ');

        const systemPrompt = `Du er en lærer i russisk. ORDFORRÅD: ${vocabList}

Lav en sætning på russisk med ét ord erstattet af ___. 
Sætningen skal være simpel (A1 niveau) og bruge ord fra ordforrådet.

Svar i JSON format:
{
  "sentence": "Sætning med ___ hvor ordet mangler",
  "answer": "det manglende ord",
  "hint": "hint på dansk",
  "danish": "dansk oversættelse af hele sætningen"
}

Kun JSON, intet andet.`;

        try {
            const content = await callClaudeAPI([
                { role: 'user', content: 'Generer en udfyldningsopgave!' }
            ], systemPrompt, 200);

            this.currentQuestion = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
            this.displayQuestion();
        } catch (error) {
            // Fallback
            const word = this.config.vocabulary[Math.floor(Math.random() * this.config.vocabulary.length)];
            this.currentQuestion = {
                sentence: `Jeg siger ___`,
                answer: word.russian,
                hint: word.danish,
                danish: `Jeg siger ${word.danish}`
            };
            this.displayQuestion();
        }
    }

    displayQuestion() {
        const questionEl = this.container.querySelector('.fill-question');
        const inputArea = this.container.querySelector('.fill-input-area');
        const q = this.currentQuestion;

        questionEl.innerHTML = `
            <div class="sentence-display" style="font-size: 1.3rem; margin-bottom: 0.5rem;">${q.sentence}</div>
            <div class="sentence-danish" style="color: #666; font-size: 0.9rem;">${q.danish}</div>
        `;

        inputArea.innerHTML = `
            <input type="text" class="fill-input" placeholder="${q.hint}" autocomplete="off" style="width: 100%; padding: 12px; font-size: 1.1rem; border: 2px solid #e0e0e0; border-radius: 8px;">
            <button class="btn check-btn" style="margin-top: 1rem;">Tjek svar</button>
        `;

        const input = inputArea.querySelector('.fill-input');
        const checkBtn = inputArea.querySelector('.check-btn');

        input.focus();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });
        checkBtn.addEventListener('click', () => this.checkAnswer());
    }

    checkAnswer() {
        const input = this.container.querySelector('.fill-input');
        const feedback = this.container.querySelector('.fill-feedback');
        const userAnswer = input.value.trim().toLowerCase();
        const correct = this.currentQuestion.answer.toLowerCase();

        if (userAnswer === correct) {
            this.score++;
            feedback.className = 'fill-feedback correct';
            feedback.innerHTML = `✅ <strong>Rigtigt!</strong> <button class="btn btn-next">Næste</button>`;
            input.classList.add('correct');
            TTS.speak(this.currentQuestion.sentence.replace('___', this.currentQuestion.answer));
        } else {
            feedback.className = 'fill-feedback incorrect';
            feedback.innerHTML = `❌ Det rigtige svar: <strong class="cyrillic">${this.currentQuestion.answer}</strong> <button class="btn btn-next">Næste</button>`;
            input.classList.add('incorrect');
        }

        this.container.querySelector('.btn-next').addEventListener('click', () => {
            this.round++;
            this.render();
            this.generateQuestion();
        });
    }

    showResults() {
        const percent = Math.round((this.score / this.maxRounds) * 100);
        this.container.innerHTML = `
            <div class="exercise-results" style="text-align: center; padding: 2rem;">
                <h3>Øvelse færdig!</h3>
                <div class="result-score" style="font-size: 2rem; margin: 1rem 0;">${this.score} / ${this.maxRounds}</div>
                <div class="result-percent">${percent}%</div>
                <button class="btn" onclick="location.reload()">Prøv igen</button>
            </div>
        `;
    }
}

// ============================================
// AI MINI DIALOGUE - Short dialogue practice
// ============================================

class AIMiniDialogue {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.config = config;
        this.score = 0;
        this.round = 0;
        this.maxRounds = config.maxRounds || 5;
        this.currentDialogue = null;
        this.renderStartScreen();
    }

    renderStartScreen() {
        this.container.innerHTML = `
            <div class="ai-exercise-start" style="text-align: center; padding: 2rem;">
                <div style="font-size: 2.5rem; margin-bottom: 1rem;">💬</div>
                <h3 style="margin-bottom: 1rem;">Mini-dialoger</h3>
                <p style="color: #666; margin-bottom: 2rem;">Vælg det rigtige svar i korte dialoger.</p>
                <button class="btn btn-primary start-btn">Start øvelse</button>
            </div>
        `;
        this.container.querySelector('.start-btn').addEventListener('click', () => {
            this.render();
            this.generateDialogue();
        });
    }

    render() {
        this.container.innerHTML = `
            <div class="ai-mini-dialogue">
                <div class="exercise-header" style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
                    <span class="exercise-progress">Dialog ${this.round + 1} af ${this.maxRounds}</span>
                    <span class="exercise-score">Point: ${this.score}</span>
                </div>
                <div class="dialogue-content" style="min-height: 120px;"></div>
                <div class="dialogue-options" style="margin: 1.5rem 0;"></div>
                <div class="dialogue-feedback"></div>
            </div>
        `;
    }

    async generateDialogue() {
        if (this.round >= this.maxRounds) {
            this.showResults();
            return;
        }

        const contentEl = this.container.querySelector('.dialogue-content');
        const optionsEl = this.container.querySelector('.dialogue-options');
        contentEl.innerHTML = '<div class="loading">💬 Genererer dialog...</div>';

        const vocabList = this.config.vocabulary.map(v => `${v.russian}=${v.danish}`).join(', ');
        const topic = this.config.topic || 'hilsner';

        const systemPrompt = `Du er en lærer i russisk. ORDFORRÅD: ${vocabList}. EMNE: ${topic}

Lav en kort dialog (2 linjer) hvor person B skal svare. Giv 3 valgmuligheder for svar.

JSON format:
{
  "personA": "Hvad person A siger på russisk",
  "personA_danish": "Dansk oversættelse",
  "options": ["Svar 1", "Svar 2", "Svar 3"],
  "correct": 0,
  "explanation": "Kort forklaring"
}

Kun JSON.`;

        try {
            const content = await callClaudeAPI([
                { role: 'user', content: 'Generer en mini-dialog!' }
            ], systemPrompt, 250);

            this.currentDialogue = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
            this.displayDialogue();
        } catch (error) {
            // Fallback
            this.currentDialogue = {
                personA: 'Привет! Как дела?',
                personA_danish: 'Hej! Hvordan går det?',
                options: ['Хорошо, спасибо!', 'До свидания!', 'Пожалуйста!'],
                correct: 0,
                explanation: 'Хорошо, спасибо! = Godt, tak!'
            };
            this.displayDialogue();
        }
    }

    displayDialogue() {
        const contentEl = this.container.querySelector('.dialogue-content');
        const optionsEl = this.container.querySelector('.dialogue-options');
        const d = this.currentDialogue;

        contentEl.innerHTML = `
            <div class="dialogue-bubble person-a" style="background: #f0f0f0; padding: 1rem; border-radius: 12px; margin-bottom: 1rem;">
                <div style="font-weight: 500; margin-bottom: 4px;">👤 Person A:</div>
                <div class="russian" style="font-size: 1.2rem; cursor: pointer;" onclick="TTS.speak('${d.personA.replace(/'/g, "\\'")}')">${d.personA}</div>
                <div class="danish" style="color: #666; font-size: 0.85rem;">${d.personA_danish}</div>
            </div>
            <div style="font-weight: 500; margin-bottom: 0.5rem;">🙋 Hvad svarer du?</div>
        `;

        optionsEl.innerHTML = d.options.map((opt, i) => `
            <button class="dialogue-option" data-index="${i}" style="display: block; width: 100%; padding: 12px; margin: 8px 0; border: 2px solid #e0e0e0; border-radius: 8px; background: white; cursor: pointer; text-align: left; font-size: 1rem;">
                ${opt}
            </button>
        `).join('');

        optionsEl.querySelectorAll('.dialogue-option').forEach(btn => {
            btn.addEventListener('click', () => this.checkAnswer(parseInt(btn.dataset.index)));
        });
    }

    checkAnswer(selected) {
        const optionsEl = this.container.querySelector('.dialogue-options');
        const feedback = this.container.querySelector('.dialogue-feedback');
        const buttons = optionsEl.querySelectorAll('.dialogue-option');

        buttons.forEach(btn => btn.disabled = true);

        if (selected === this.currentDialogue.correct) {
            this.score++;
            buttons[selected].style.borderColor = '#4CAF50';
            buttons[selected].style.background = '#e8f5e9';
            feedback.innerHTML = `✅ <strong>Rigtigt!</strong> ${this.currentDialogue.explanation} <button class="btn btn-next">Næste</button>`;
            TTS.speak(this.currentDialogue.options[selected]);
        } else {
            buttons[selected].style.borderColor = '#f44336';
            buttons[selected].style.background = '#ffebee';
            buttons[this.currentDialogue.correct].style.borderColor = '#4CAF50';
            buttons[this.currentDialogue.correct].style.background = '#e8f5e9';
            feedback.innerHTML = `❌ ${this.currentDialogue.explanation} <button class="btn btn-next">Næste</button>`;
        }

        this.container.querySelector('.btn-next').addEventListener('click', () => {
            this.round++;
            this.render();
            this.generateDialogue();
        });
    }

    showResults() {
        const percent = Math.round((this.score / this.maxRounds) * 100);
        this.container.innerHTML = `
            <div class="exercise-results" style="text-align: center; padding: 2rem;">
                <h3>💬 Dialoger færdig!</h3>
                <div class="result-score" style="font-size: 2rem; margin: 1rem 0;">${this.score} / ${this.maxRounds}</div>
                <div class="result-percent">${percent}%</div>
                <button class="btn" onclick="location.reload()">Prøv igen</button>
            </div>
        `;
    }
}

// ============================================
// AI FLASH DRILL - Adaptive flashcard practice
// ============================================

class AIFlashDrill {
    constructor(containerId, config) {
        this.container = document.getElementById(containerId);
        this.config = config;
        this.vocabulary = [...config.vocabulary];
        this.wrongAnswers = [];
        this.score = 0;
        this.streak = 0;
        this.round = 0;
        this.maxRounds = config.maxRounds || 10;
        this.direction = 'ru-da'; // or 'da-ru'
        this.currentWord = null;
        this.renderStartScreen();
    }

    renderStartScreen() {
        this.container.innerHTML = `
            <div class="ai-exercise-start" style="text-align: center; padding: 2rem;">
                <div style="font-size: 2.5rem; margin-bottom: 1rem;">⚡</div>
                <h3 style="margin-bottom: 1rem;">Hurtig genkendelse</h3>
                <p style="color: #666; margin-bottom: 1.5rem;">Test din hastighed! Ord du svarer forkert på kommer igen.</p>
                <div style="margin-bottom: 1.5rem;">
                    <button class="direction-btn" data-dir="ru-da" style="padding: 8px 16px; margin: 4px; border: 2px solid #333; border-radius: 4px; background: #333; color: white; cursor: pointer;">🇷🇺 → 🇩🇰</button>
                    <button class="direction-btn" data-dir="da-ru" style="padding: 8px 16px; margin: 4px; border: 2px solid #333; border-radius: 4px; background: white; color: #333; cursor: pointer;">🇩🇰 → 🇷🇺</button>
                </div>
                <button class="btn btn-primary start-btn">Start drill</button>
            </div>
        `;

        this.container.querySelectorAll('.direction-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.container.querySelectorAll('.direction-btn').forEach(b => {
                    b.style.background = 'white';
                    b.style.color = '#333';
                });
                btn.style.background = '#333';
                btn.style.color = 'white';
                this.direction = btn.dataset.dir;
            });
        });

        this.container.querySelector('.start-btn').addEventListener('click', () => {
            this.shuffleVocabulary();
            this.render();
            this.nextWord();
        });
    }

    shuffleVocabulary() {
        this.vocabulary = [...this.config.vocabulary].sort(() => Math.random() - 0.5);
    }

    render() {
        this.container.innerHTML = `
            <div class="ai-flash-drill">
                <div class="drill-header" style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
                    <div class="drill-progress">${this.round + 1} / ${this.maxRounds}</div>
                    <div class="drill-streak" style="display: flex; align-items: center; gap: 4px;">🔥 ${this.streak}</div>
                    <div class="drill-score">⭐ ${this.score}</div>
                </div>
                <div class="drill-word" style="text-align: center; padding: 2rem; background: #f5f5f5; border-radius: 12px; margin-bottom: 1.5rem; min-height: 80px;"></div>
                <div class="drill-options" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;"></div>
                <div class="drill-feedback" style="text-align: center; margin-top: 1rem;"></div>
            </div>
        `;
    }

    nextWord() {
        if (this.round >= this.maxRounds) {
            this.showResults();
            return;
        }

        // Prioritize wrong answers
        if (this.wrongAnswers.length > 0 && Math.random() < 0.5) {
            this.currentWord = this.wrongAnswers.shift();
        } else {
            this.currentWord = this.vocabulary[this.round % this.vocabulary.length];
        }

        this.displayWord();
    }

    displayWord() {
        const wordEl = this.container.querySelector('.drill-word');
        const optionsEl = this.container.querySelector('.drill-options');
        const feedback = this.container.querySelector('.drill-feedback');
        feedback.innerHTML = '';

        const prompt = this.direction === 'ru-da' ? this.currentWord.russian : this.currentWord.danish;
        const correct = this.direction === 'ru-da' ? this.currentWord.danish : this.currentWord.russian;

        wordEl.innerHTML = `
            <div style="font-size: 1.8rem; cursor: pointer;" onclick="TTS.speak('${this.currentWord.russian.replace(/'/g, "\\'")}')">${prompt}</div>
        `;

        // Generate options
        const wrongOptions = this.vocabulary
            .filter(v => v !== this.currentWord)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(v => this.direction === 'ru-da' ? v.danish : v.russian);

        const options = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
        const correctIndex = options.indexOf(correct);

        optionsEl.innerHTML = options.map((opt, i) => `
            <button class="drill-option" data-index="${i}" style="padding: 14px; border: 2px solid #e0e0e0; border-radius: 8px; background: white; cursor: pointer; font-size: 1rem; transition: all 0.2s;">
                ${opt}
            </button>
        `).join('');

        optionsEl.querySelectorAll('.drill-option').forEach(btn => {
            btn.addEventListener('click', () => this.checkAnswer(parseInt(btn.dataset.index), correctIndex));
        });
    }

    checkAnswer(selected, correctIndex) {
        const optionsEl = this.container.querySelector('.drill-options');
        const feedback = this.container.querySelector('.drill-feedback');
        const buttons = optionsEl.querySelectorAll('.drill-option');
        const header = this.container.querySelector('.drill-header');

        buttons.forEach(btn => btn.disabled = true);

        if (selected === correctIndex) {
            this.score += 10 + this.streak * 2;
            this.streak++;
            buttons[selected].style.borderColor = '#4CAF50';
            buttons[selected].style.background = '#e8f5e9';
            feedback.innerHTML = '✅ Rigtigt!';
            TTS.speak(this.currentWord.russian);
        } else {
            this.streak = 0;
            this.wrongAnswers.push(this.currentWord);
            buttons[selected].style.borderColor = '#f44336';
            buttons[selected].style.background = '#ffebee';
            buttons[correctIndex].style.borderColor = '#4CAF50';
            buttons[correctIndex].style.background = '#e8f5e9';
            feedback.innerHTML = `❌ Det var: <strong>${this.direction === 'ru-da' ? this.currentWord.danish : this.currentWord.russian}</strong>`;
        }

        // Update header
        header.querySelector('.drill-streak').innerHTML = `🔥 ${this.streak}`;
        header.querySelector('.drill-score').innerHTML = `⭐ ${this.score}`;

        this.round++;
        setTimeout(() => this.nextWord(), 1200);
    }

    showResults() {
        const accuracy = this.maxRounds > 0 ? Math.round(((this.maxRounds - this.wrongAnswers.length) / this.maxRounds) * 100) : 0;
        const rating = accuracy >= 90 ? '🏆 Fantastisk!' : accuracy >= 70 ? '⭐ Godt arbejde!' : '💪 Bliv ved!';

        this.container.innerHTML = `
            <div class="drill-results" style="text-align: center; padding: 2rem;">
                <h3>⚡ Drill færdig!</h3>
                <div style="font-size: 2.5rem; margin: 1rem 0;">⭐ ${this.score}</div>
                <div style="margin-bottom: 1rem;">${accuracy}% korrekt</div>
                <p>${rating}</p>
                <button class="btn" onclick="location.reload()">Prøv igen</button>
            </div>
        `;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TTS,
        VocabularyCard,
        VocabularyList,
        FillBlankExercise,
        ListeningExercise,
        MatchingExercise,
        WritingExercise,
        SentenceBuilder,
        Flashcards,
        Dialogue,
        LessonProgress,
        MemoryGame,
        SpeedChallenge,
        WordScramble,
        TypingPractice,
        AnimatedDialogue,
        AIConversation,
        AITranslationChallenge,
        AIRolePlay,
        AIWordDetective,
        AIStoryBuilder,
        AIQuickQuiz,
        AIEmojiTranslator,
        AISentenceAuction,
        AIFillInContext,
        AIMiniDialogue,
        AIFlashDrill
    };
}
