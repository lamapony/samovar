/**
 * Samovar - Adaptive Spaced Repetition System (SRS)
 * Advanced SM-2 algorithm implementation with personalized learning
 * Version 1.0
 */

// ============================================
// SM-2 ALGORITHM CORE
// ============================================

class SM2Algorithm {
    /**
     * Calculate next review interval using SuperMemo 2 algorithm
     * @param {number} quality - Quality of recall (0-5)
     * @param {number} repetitions - Number of successful repetitions
     * @param {number} easiness - Easiness factor (min 1.3)
     * @param {number} interval - Current interval in days
     * @returns {Object} New state {repetitions, easiness, interval}
     */
    static calculate(quality, repetitions, easiness, interval) {
        // Quality: 0-2 = fail, 3-5 = pass
        const newEasiness = Math.max(
            1.3,
            easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        );

        let newRepetitions = repetitions;
        let newInterval = interval;

        if (quality < 3) {
            // Failed recall - reset repetitions
            newRepetitions = 0;
            newInterval = 1;
        } else {
            // Successful recall
            newRepetitions = repetitions + 1;
            
            if (newRepetitions === 1) {
                newInterval = 1;
            } else if (newRepetitions === 2) {
                newInterval = 6;
            } else {
                newInterval = Math.round(interval * newEasiness);
            }
        }

        return {
            repetitions: newRepetitions,
            easiness: newEasiness,
            interval: newInterval
        };
    }

    /**
     * Calculate priority score for review queue
     * Higher score = more urgent to review
     */
    static calculatePriority(card, now = Date.now()) {
        const daysSinceReview = (now - card.lastReview) / (1000 * 60 * 60 * 24);
        const daysOverdue = daysSinceReview - card.interval;
        
        // Priority factors:
        // 1. Overdue cards get higher priority
        // 2. Cards with lower easiness (harder words) get slight boost
        // 3. Cards never reviewed get highest priority
        
        if (card.repetitions === 0 && card.lastReview === null) {
            return 1000; // New cards - highest priority
        }
        
        if (daysOverdue > 0) {
            // Overdue: exponential priority increase
            return 100 + (daysOverdue * 10) + (3 - card.easiness) * 5;
        }
        
        // Not yet due: negative priority
        return -Math.abs(daysOverdue) * 10;
    }
}

// ============================================
// VOCABULARY CARD DATA MODEL
// ============================================

class VocabCard {
    constructor(data) {
        this.id = data.id || this.generateId(data.russian);
        this.russian = data.russian;
        this.danish = data.danish;
        this.transcription = data.transcription || '';
        this.example = data.example || '';
        this.exampleDanish = data.exampleDanish || '';
        this.lessonId = data.lessonId || null;
        this.tags = data.tags || [];
        
        // SRS fields
        this.repetitions = data.repetitions || 0;
        this.easiness = data.easiness || 2.5;
        this.interval = data.interval || 0;
        this.lastReview = data.lastReview || null;
        this.nextReview = data.nextReview || Date.now();
        this.totalReviews = data.totalReviews || 0;
        this.correctReviews = data.correctReviews || 0;
        this.createdAt = data.createdAt || Date.now();
        this.lastModified = data.lastModified || Date.now();
    }

    generateId(russian) {
        return `card_${russian}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    review(quality) {
        const result = SM2Algorithm.calculate(
            quality,
            this.repetitions,
            this.easiness,
            this.interval
        );

        this.repetitions = result.repetitions;
        this.easiness = result.easiness;
        this.interval = result.interval;
        this.lastReview = Date.now();
        this.nextReview = Date.now() + (result.interval * 24 * 60 * 60 * 1000);
        this.totalReviews++;
        
        if (quality >= 3) {
            this.correctReviews++;
        }
        
        this.lastModified = Date.now();
    }

    isDue(now = Date.now()) {
        return this.nextReview <= now;
    }

    getPriority(now = Date.now()) {
        return SM2Algorithm.calculatePriority(this, now);
    }

    getAccuracy() {
        if (this.totalReviews === 0) return 0;
        return Math.round((this.correctReviews / this.totalReviews) * 100);
    }

    getStatus() {
        if (this.repetitions === 0 && this.lastReview === null) return 'new';
        if (this.repetitions === 0 && this.lastReview !== null) return 'learning';
        if (this.repetitions >= 1) return 'reviewing';
        return 'unknown';
    }

    toJSON() {
        return {
            id: this.id,
            russian: this.russian,
            danish: this.danish,
            transcription: this.transcription,
            example: this.example,
            exampleDanish: this.exampleDanish,
            lessonId: this.lessonId,
            tags: this.tags,
            repetitions: this.repetitions,
            easiness: this.easiness,
            interval: this.interval,
            lastReview: this.lastReview,
            nextReview: this.nextReview,
            totalReviews: this.totalReviews,
            correctReviews: this.correctReviews,
            createdAt: this.createdAt,
            lastModified: this.lastModified
        };
    }
}

// ============================================
// SRS MANAGER
// ============================================

class SRSManager {
    constructor() {
        this.storageKey = 'ruslaering_srs_v1';
        this.cards = new Map();
        this.settings = {
            newCardsPerDay: 20,
            reviewsPerDay: 100,
            easyBonus: 1.3,
            hardInterval: 1.2,
            lapseInterval: 0.5
        };
        this.dailyStats = {
            date: this.getTodayString(),
            newCards: 0,
            reviews: 0,
            correctReviews: 0
        };
        this.load();
    }

    getTodayString() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                
                // Load cards
                if (data.cards) {
                    data.cards.forEach(cardData => {
                        const card = new VocabCard(cardData);
                        this.cards.set(card.id, card);
                    });
                }
                
                // Load settings
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                }
                
                // Load daily stats
                if (data.dailyStats) {
                    this.dailyStats = data.dailyStats;
                    // Reset if new day
                    if (this.dailyStats.date !== this.getTodayString()) {
                        this.resetDailyStats();
                    }
                }
            }
        } catch (e) {
            console.error('SRS load error:', e);
        }
    }

    save() {
        try {
            const data = {
                cards: Array.from(this.cards.values()).map(c => c.toJSON()),
                settings: this.settings,
                dailyStats: this.dailyStats,
                version: 1,
                lastSaved: Date.now()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.error('SRS save error:', e);
        }
    }

    resetDailyStats() {
        this.dailyStats = {
            date: this.getTodayString(),
            newCards: 0,
            reviews: 0,
            correctReviews: 0
        };
        this.save();
    }

    // ============================================
    // CARD MANAGEMENT
    // ============================================

    addCard(cardData) {
        const card = new VocabCard(cardData);
        
        // Check for duplicates
        const existing = this.findCardByRussian(card.russian);
        if (existing) {
            console.warn('Card already exists:', card.russian);
            return existing;
        }
        
        this.cards.set(card.id, card);
        this.save();
        return card;
    }

    addCards(cardsData) {
        const added = [];
        cardsData.forEach(data => {
            const card = this.addCard(data);
            if (card) added.push(card);
        });
        return added;
    }

    findCardByRussian(russian) {
        return Array.from(this.cards.values()).find(c => c.russian === russian);
    }

    getCard(id) {
        return this.cards.get(id);
    }

    deleteCard(id) {
        const deleted = this.cards.delete(id);
        if (deleted) this.save();
        return deleted;
    }

    updateCard(id, updates) {
        const card = this.cards.get(id);
        if (!card) return null;
        
        Object.assign(card, updates);
        card.lastModified = Date.now();
        this.save();
        return card;
    }

    // ============================================
    // REVIEW QUEUE
    // ============================================

    getDueCards(limit = null) {
        const now = Date.now();
        const dueCards = Array.from(this.cards.values())
            .filter(card => card.isDue(now))
            .sort((a, b) => b.getPriority(now) - a.getPriority(now));
        
        return limit ? dueCards.slice(0, limit) : dueCards;
    }

    getNewCards(limit = null) {
        const newCards = Array.from(this.cards.values())
            .filter(card => card.getStatus() === 'new')
            .sort((a, b) => a.createdAt - b.createdAt);
        
        const remaining = this.settings.newCardsPerDay - this.dailyStats.newCards;
        const maxNew = limit ? Math.min(limit, remaining) : remaining;
        
        return newCards.slice(0, Math.max(0, maxNew));
    }

    getReviewQueue(includeNew = true) {
        const queue = [];
        
        // Add due cards
        const dueCards = this.getDueCards();
        queue.push(...dueCards);
        
        // Add new cards if allowed
        if (includeNew) {
            const newCards = this.getNewCards();
            queue.push(...newCards);
        }
        
        // Interleave new and review cards for better learning
        return this.interleaveCards(queue);
    }

    interleaveCards(cards) {
        const newCards = cards.filter(c => c.getStatus() === 'new');
        const reviewCards = cards.filter(c => c.getStatus() !== 'new');
        
        const interleaved = [];
        const ratio = 3; // 3 reviews per 1 new card
        
        let reviewIndex = 0;
        let newIndex = 0;
        
        while (reviewIndex < reviewCards.length || newIndex < newCards.length) {
            // Add review cards
            for (let i = 0; i < ratio && reviewIndex < reviewCards.length; i++) {
                interleaved.push(reviewCards[reviewIndex++]);
            }
            
            // Add one new card
            if (newIndex < newCards.length) {
                interleaved.push(newCards[newIndex++]);
            }
        }
        
        return interleaved;
    }

    // ============================================
    // REVIEW PROCESSING
    // ============================================

    reviewCard(cardId, quality) {
        const card = this.cards.get(cardId);
        if (!card) {
            console.error('Card not found:', cardId);
            return null;
        }

        const wasNew = card.getStatus() === 'new';
        
        card.review(quality);
        
        // Update daily stats
        if (wasNew) {
            this.dailyStats.newCards++;
        }
        this.dailyStats.reviews++;
        if (quality >= 3) {
            this.dailyStats.correctReviews++;
        }
        
        this.save();
        
        return {
            card: card,
            wasNew: wasNew,
            nextReview: card.nextReview,
            interval: card.interval,
            easiness: card.easiness
        };
    }

    // ============================================
    // STATISTICS
    // ============================================

    getStats() {
        const cards = Array.from(this.cards.values());
        
        const newCount = cards.filter(c => c.getStatus() === 'new').length;
        const learningCount = cards.filter(c => c.getStatus() === 'learning').length;
        const reviewingCount = cards.filter(c => c.getStatus() === 'reviewing').length;
        const dueCount = cards.filter(c => c.isDue()).length;
        
        const totalReviews = cards.reduce((sum, c) => sum + c.totalReviews, 0);
        const totalCorrect = cards.reduce((sum, c) => sum + c.correctReviews, 0);
        const overallAccuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;
        
        const avgEasiness = cards.length > 0
            ? cards.reduce((sum, c) => sum + c.easiness, 0) / cards.length
            : 2.5;
        
        return {
            total: cards.length,
            new: newCount,
            learning: learningCount,
            reviewing: reviewingCount,
            due: dueCount,
            totalReviews: totalReviews,
            overallAccuracy: overallAccuracy,
            avgEasiness: avgEasiness.toFixed(2),
            dailyStats: this.dailyStats,
            settings: this.settings
        };
    }

    getCardsByLesson(lessonId) {
        return Array.from(this.cards.values())
            .filter(c => c.lessonId === lessonId);
    }

    getCardsByTag(tag) {
        return Array.from(this.cards.values())
            .filter(c => c.tags.includes(tag));
    }

    getRetentionRate(days = 7) {
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
        const recentCards = Array.from(this.cards.values())
            .filter(c => c.lastReview && c.lastReview >= cutoff);
        
        if (recentCards.length === 0) return 0;
        
        const totalReviews = recentCards.reduce((sum, c) => sum + c.totalReviews, 0);
        const correctReviews = recentCards.reduce((sum, c) => sum + c.correctReviews, 0);
        
        return totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;
    }

    // ============================================
    // BULK OPERATIONS
    // ============================================

    importFromLesson(lessonId, words) {
        const imported = words.map(word => {
            return this.addCard({
                russian: word.russian,
                danish: word.danish,
                transcription: word.transcription || '',
                example: word.example || '',
                exampleDanish: word.exampleDanish || '',
                lessonId: lessonId,
                tags: word.tags || []
            });
        });
        return imported.filter(c => c !== null);
    }

    resetCard(cardId) {
        const card = this.cards.get(cardId);
        if (!card) return null;
        
        card.repetitions = 0;
        card.easiness = 2.5;
        card.interval = 0;
        card.lastReview = null;
        card.nextReview = Date.now();
        card.totalReviews = 0;
        card.correctReviews = 0;
        card.lastModified = Date.now();
        
        this.save();
        return card;
    }

    resetAllProgress() {
        this.cards.forEach(card => {
            this.resetCard(card.id);
        });
        this.resetDailyStats();
    }

    exportData() {
        return {
            cards: Array.from(this.cards.values()).map(c => c.toJSON()),
            settings: this.settings,
            stats: this.getStats(),
            exportedAt: Date.now()
        };
    }

    importData(data) {
        try {
            if (data.cards) {
                data.cards.forEach(cardData => {
                    const card = new VocabCard(cardData);
                    this.cards.set(card.id, card);
                });
            }
            if (data.settings) {
                this.settings = { ...this.settings, ...data.settings };
            }
            this.save();
            return true;
        } catch (e) {
            console.error('Import error:', e);
            return false;
        }
    }
}

// ============================================
// SRS UI COMPONENT
// ============================================

class SRSReviewSession {
    constructor(containerId, srsManager, options = {}) {
        this.container = document.getElementById(containerId);
        this.srs = srsManager;
        this.options = {
            sessionSize: options.sessionSize || 20,
            showProgress: options.showProgress !== false,
            autoSpeak: options.autoSpeak !== false,
            ...options
        };
        
        this.queue = [];
        this.currentIndex = 0;
        this.sessionStats = {
            total: 0,
            correct: 0,
            hard: 0,
            easy: 0
        };
        
        this.isFlipped = false;
        this.init();
    }

    init() {
        this.queue = this.srs.getReviewQueue(true).slice(0, this.options.sessionSize);
        this.sessionStats.total = this.queue.length;
        
        if (this.queue.length === 0) {
            this.showNoCards();
        } else {
            this.render();
        }
    }

    render() {
        if (this.currentIndex >= this.queue.length) {
            this.showResults();
            return;
        }

        const card = this.queue[this.currentIndex];
        this.isFlipped = false;
        
        this.container.innerHTML = `
            <div class="srs-session">
                ${this.options.showProgress ? `
                    <div class="srs-progress">
                        <div class="srs-progress-bar">
                            <div class="srs-progress-fill" style="width: ${(this.currentIndex / this.queue.length) * 100}%"></div>
                        </div>
                        <div class="srs-progress-text">${this.currentIndex + 1} / ${this.queue.length}</div>
                    </div>
                ` : ''}
                
                <div class="srs-card ${this.isFlipped ? 'flipped' : ''}" data-card-id="${card.id}">
                    <div class="srs-card-inner">
                        <div class="srs-card-front">
                            <div class="srs-card-status">${this.getStatusBadge(card)}</div>
                            <div class="srs-card-question">
                                <div class="srs-danish">${card.danish}</div>
                                <div class="srs-hint">Hvad er dette på russisk?</div>
                            </div>
                            <button class="btn btn-primary srs-show-answer">Vis svar</button>
                        </div>
                        
                        <div class="srs-card-back">
                            <div class="srs-card-answer">
                                <div class="srs-russian">
                                    ${card.russian}
                                    <button class="srs-speak-btn" data-text="${card.russian}">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                        </svg>
                                    </button>
                                </div>
                                <div class="srs-transcription">[${card.transcription}]</div>
                                ${card.example ? `
                                    <div class="srs-example">
                                        <div class="srs-example-russian">${card.example}</div>
                                        <div class="srs-example-danish">${card.exampleDanish}</div>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="srs-rating">
                                <div class="srs-rating-label">Hvor godt huskede du det?</div>
                                <div class="srs-rating-buttons">
                                    <button class="srs-rate-btn srs-rate-again" data-quality="0">
                                        <span class="rate-label">Igen</span>
                                        <span class="rate-interval">&lt;1 min</span>
                                    </button>
                                    <button class="srs-rate-btn srs-rate-hard" data-quality="3">
                                        <span class="rate-label">Svært</span>
                                        <span class="rate-interval">${this.getIntervalPreview(card, 3)}</span>
                                    </button>
                                    <button class="srs-rate-btn srs-rate-good" data-quality="4">
                                        <span class="rate-label">Godt</span>
                                        <span class="rate-interval">${this.getIntervalPreview(card, 4)}</span>
                                    </button>
                                    <button class="srs-rate-btn srs-rate-easy" data-quality="5">
                                        <span class="rate-label">Let</span>
                                        <span class="rate-interval">${this.getIntervalPreview(card, 5)}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="srs-card-info">
                    <div class="srs-info-item">
                        <span class="srs-info-label">Nøjagtighed:</span>
                        <span class="srs-info-value">${card.getAccuracy()}%</span>
                    </div>
                    <div class="srs-info-item">
                        <span class="srs-info-label">Gennemgange:</span>
                        <span class="srs-info-value">${card.totalReviews}</span>
                    </div>
                    <div class="srs-info-item">
                        <span class="srs-info-label">Lethed:</span>
                        <span class="srs-info-value">${card.easiness.toFixed(1)}</span>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents(card);
    }

    bindEvents(card) {
        const showBtn = this.container.querySelector('.srs-show-answer');
        const speakBtn = this.container.querySelector('.srs-speak-btn');
        const rateButtons = this.container.querySelectorAll('.srs-rate-btn');

        if (showBtn) {
            showBtn.addEventListener('click', () => {
                this.flipCard();
                if (this.options.autoSpeak && typeof TTS !== 'undefined') {
                    TTS.speak(card.russian);
                }
            });
        }

        if (speakBtn) {
            speakBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof TTS !== 'undefined') {
                    TTS.speak(speakBtn.dataset.text);
                }
            });
        }

        rateButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const quality = parseInt(btn.dataset.quality);
                this.rateCard(card, quality);
            });
        });
    }

    flipCard() {
        this.isFlipped = true;
        const cardEl = this.container.querySelector('.srs-card');
        if (cardEl) {
            cardEl.classList.add('flipped');
        }
    }

    rateCard(card, quality) {
        const result = this.srs.reviewCard(card.id, quality);
        
        // Update session stats
        if (quality >= 4) {
            this.sessionStats.easy++;
        } else if (quality === 3) {
            this.sessionStats.hard++;
        }
        if (quality >= 3) {
            this.sessionStats.correct++;
        }
        
        // Show feedback animation
        this.showFeedback(quality, result);
        
        // Move to next card
        setTimeout(() => {
            this.currentIndex++;
            this.render();
        }, 800);
    }

    showFeedback(quality, result) {
        const cardEl = this.container.querySelector('.srs-card');
        if (!cardEl) return;
        
        const feedbackClass = quality >= 3 ? 'feedback-correct' : 'feedback-incorrect';
        cardEl.classList.add(feedbackClass);
    }

    getStatusBadge(card) {
        const status = card.getStatus();
        const badges = {
            'new': '<span class="srs-badge srs-badge-new">Ny</span>',
            'learning': '<span class="srs-badge srs-badge-learning">Lærer</span>',
            'reviewing': '<span class="srs-badge srs-badge-review">Gennemgang</span>'
        };
        return badges[status] || '';
    }

    getIntervalPreview(card, quality) {
        const result = SM2Algorithm.calculate(quality, card.repetitions, card.easiness, card.interval);
        const days = result.interval;
        
        if (days < 1) return '< 1 dag';
        if (days === 1) return '1 dag';
        if (days < 30) return `${days} dage`;
        if (days < 365) return `${Math.round(days / 30)} mån`;
        return `${Math.round(days / 365)} år`;
    }

    showNoCards() {
        const stats = this.srs.getStats();
        this.container.innerHTML = `
            <div class="srs-no-cards">
                <div class="srs-no-cards-icon">🎉</div>
                <h3>Ingen kort at gennemgå!</h3>
                <p>Du er opdateret. Kom tilbage senere.</p>
                <div class="srs-stats-summary">
                    <div class="stat-box">
                        <div class="stat-number">${stats.due}</div>
                        <div class="stat-label">Forfaldne</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number">${stats.new}</div>
                        <div class="stat-label">Nye</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number">${stats.reviewing}</div>
                        <div class="stat-label">I gennemgang</div>
                    </div>
                </div>
            </div>
        `;
    }

    showResults() {
        const accuracy = this.sessionStats.total > 0
            ? Math.round((this.sessionStats.correct / this.sessionStats.total) * 100)
            : 0;
        
        this.container.innerHTML = `
            <div class="srs-results">
                <div class="srs-results-icon">✨</div>
                <h2>Session færdig!</h2>
                <div class="srs-results-stats">
                    <div class="result-stat-large">
                        <div class="result-stat-number">${accuracy}%</div>
                        <div class="result-stat-label">Nøjagtighed</div>
                    </div>
                    <div class="result-stats-grid">
                        <div class="result-stat">
                            <div class="result-stat-number">${this.sessionStats.total}</div>
                            <div class="result-stat-label">Kort gennemgået</div>
                        </div>
                        <div class="result-stat">
                            <div class="result-stat-number">${this.sessionStats.correct}</div>
                            <div class="result-stat-label">Korrekte</div>
                        </div>
                    </div>
                </div>
                <div class="srs-results-actions">
                    <button class="btn btn-primary" onclick="location.reload()">Ny session</button>
                    <a href="../index-v2.html" class="btn btn-secondary">Tilbage til oversigt</a>
                </div>
            </div>
        `;
    }
}

// ============================================
// GLOBAL INSTANCE
// ============================================

if (typeof window !== 'undefined') {
    window.SRSManager = SRSManager;
    window.SRSReviewSession = SRSReviewSession;
    window.VocabCard = VocabCard;
    window.SM2Algorithm = SM2Algorithm;
}
