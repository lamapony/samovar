/**
 * Samovar - Progress System
 * Comprehensive progress tracking for the beginner course
 * Version 1.0
 */

// ============================================
// COURSE CONFIGURATION
// ============================================

// ============================================
// ICONS & ASSETS
// ============================================

const ICONS = {
    // Lesson Icons (matching index-v2.html)
    '01-intro': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" /><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" /><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" /></svg>`,
    '02-alphabet': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" /></svg>`,
    '03-numbers': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16" /><path d="M4 15h16" /><path d="M4 11h16" /><path d="M4 7h16" /></svg>`,
    '04-about-me': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>`,
    '05-family': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18" /><path d="M5 21V7l8-4 8 4v14" /><path d="M13 11V7" /><path d="M9 11V7" /></svg>`,
    '06-food': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>`,
    '07-cafe': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>`,
    '08-time': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>`,
    '09-city': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>`,
    '10-shopping': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>`,
    '11-weather': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19c0-1.7-1.3-3-3-3s-3 1.3-3 3" /><path d="M14.5 16c0-1.7-1.3-3-3-3s-3 1.3-3 3" /><path d="M11.5 13c0-1.7-1.3-3-3-3s-3 1.3-3 3" /><path d="M8.5 10c0-1.7-1.3-3-3-3s-3 1.3-3 3" /><path d="M17.5 19h-9M14.5 16h-3M11.5 13h-3" /></svg>`,
    '12-review': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>`,

    // System Icons
    'fire': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #f59e0b;"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.072-4-2.072-5.5a5.57 5.57 0 1 1 11.14 0c0-2.3-1.14-4.5-2.07-5.5-.5 1-1 1.62-1 3a2.5 2.5 0 0 0 2.5 2.5c1.38 0 2 .5 2 1.5a5.5 5.5 0 0 1-11 5.5Z"/></svg>`,
    'party': `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: #a33e3e;"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>`,
    'trophy': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #fbbf24;"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
    'hourglass': `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: #64748b;"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>`,
    'check': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    'scroll': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 15 11"/></svg>`,
    'pencil': `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`
};

const COURSE_CONFIG = {
    courseId: 'beginner-v2',
    totalLessons: 12,
    defaultCompletionPolicy: {
        minExercises: 1,
        allowScrollComplete: true,
        requireScrollComplete: false
    },
    lessons: [
        { id: '01-intro', title: 'Hej! Farvel!', iconId: '01-intro', wordsCount: 10 },
        { id: '02-alphabet', title: 'Det Kyrilliske Alfabet', iconId: '02-alphabet', wordsCount: 33 },
        { id: '03-numbers', title: 'Tal fra 1 til 10', iconId: '03-numbers', wordsCount: 15 },
        { id: '04-about-me', title: 'Jeg Hedder...', iconId: '04-about-me', wordsCount: 20 },
        { id: '05-family', title: 'Min Familie', iconId: '05-family', wordsCount: 18 },
        { id: '06-food', title: 'Mad og Drikke', iconId: '06-food', wordsCount: 25 },
        { id: '07-cafe', title: 'På Café', iconId: '07-cafe', wordsCount: 20 },
        { id: '08-time', title: 'Hvad Er Klokken?', iconId: '08-time', wordsCount: 22 },
        { id: '09-city', title: 'I Byen', iconId: '09-city', wordsCount: 24 },
        { id: '10-shopping', title: 'Shopping', iconId: '10-shopping', wordsCount: 22 },
        { id: '11-weather', title: 'Vejret', iconId: '11-weather', wordsCount: 18 },
        { id: '12-review', title: 'Stor Repetition', iconId: '12-review', wordsCount: 0, completedButtonText: 'Kurset gennemført!', completionPolicy: { minExercises: 2, allowScrollComplete: false } }
    ]
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getLocalISODate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getIsoDayNumber(isoDateString) {
    if (typeof isoDateString !== 'string') return NaN;
    const parts = isoDateString.split('-').map((p) => parseInt(p, 10));
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return NaN;
    const [year, month, day] = parts;
    return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
}

// ============================================
// PROGRESS MANAGER
// ============================================

class ProgressManager {
    constructor() {
        // Versioned key allows multiple courses without collisions and safe evolution over time.
        this.storageKey = `ruslaering_progress_${COURSE_CONFIG.courseId}`;
        this.legacyStorageKey = 'ruslaering_progress';
        this.listeners = new Set();
        this.activeLessonId = null;
        this.data = this.load();

        if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
            // Keep progress in sync across tabs/windows.
            window.addEventListener('storage', (e) => {
                if (!e || e.storageArea !== localStorage) return;
                if (e.key !== this.storageKey && e.key !== this.legacyStorageKey) return;
                this.data = this.load();
                this._emitChange({ type: 'storage-sync' });
            });
        }
    }

    onChange(listener) {
        if (typeof listener !== 'function') return () => { };
        this.listeners.add(listener);
        return () => this.offChange(listener);
    }

    offChange(listener) {
        this.listeners.delete(listener);
    }

    _emitChange(event) {
        this.listeners.forEach((fn) => {
            try {
                fn(event);
            } catch (e) {
                console.error('Progress change listener error:', e);
            }
        });
    }

    // Load progress from localStorage
    load() {
        try {
            const saved = localStorage.getItem(this.storageKey) || localStorage.getItem(this.legacyStorageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                const migrated = this.migrate(parsed);
                if (migrated && migrated.courseId === COURSE_CONFIG.courseId) {
                    return migrated;
                }
            }
        } catch (e) {
            console.error('Error loading progress:', e);
        }
        return this.getDefaultData();
    }

    // Save progress to localStorage
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.error('Error saving progress:', e);
        }
    }

    // Default data structure
    getDefaultData() {
        return {
            schemaVersion: 2,
            courseId: COURSE_CONFIG.courseId,
            startedAt: null,
            lastActivity: null,
            lessons: {},
            stats: {
                totalTimeSpent: 0,
                exercisesCompleted: 0,
                wordsLearned: 0,
                currentStreak: 0,
                longestStreak: 0,
                lastStudyDate: null
            }
        };
    }

    migrate(data) {
        if (!data || typeof data !== 'object') {
            return this.getDefaultData();
        }

        const base = this.getDefaultData();
        const schemaVersion = typeof data.schemaVersion === 'number' ? data.schemaVersion : 1;

        const merged = {
            ...base,
            ...data,
            stats: {
                ...base.stats,
                ...(data.stats || {})
            },
            lessons: {
                ...(data.lessons || {})
            }
        };

        if (schemaVersion < 2) {
            if (merged.stats && merged.stats.lastStudyDate && typeof merged.stats.lastStudyDate === 'string') {
                if (/^\d{4}-\d{2}-\d{2}$/.test(merged.stats.lastStudyDate)) {
                    // keep
                } else {
                    const dt = new Date(merged.stats.lastStudyDate);
                    if (!Number.isNaN(dt.getTime())) {
                        merged.stats.lastStudyDate = getLocalISODate(dt);
                    } else {
                        merged.stats.lastStudyDate = null;
                    }
                }
            }

            Object.values(merged.lessons).forEach((lesson) => {
                if (!lesson || typeof lesson !== 'object') return;
                if (typeof lesson.attempts !== 'number') lesson.attempts = 1;
                if (lesson.lastSessionStartAt === undefined) lesson.lastSessionStartAt = null;
            });

            merged.schemaVersion = 2;
        }

        return merged;
    }

    // ============================================
    // LESSON PROGRESS
    // ============================================

    // Start a lesson
    startLesson(lessonId) {
        if (!this.data.startedAt) {
            this.data.startedAt = Date.now();
        }

        this.activeLessonId = lessonId;

        if (!this.data.lessons[lessonId]) {
            this.data.lessons[lessonId] = {
                started: true,
                startedAt: Date.now(),
                lastSessionStartAt: Date.now(),
                completed: false,
                completedAt: null,
                timeSpent: 0,
                exerciseScores: {},
                sectionsVisited: [],
                attempts: 1
            };
        } else {
            const lesson = this.data.lessons[lessonId];
            lesson.attempts = (lesson.attempts || 0) + 1;
            lesson.lastSessionStartAt = Date.now();
        }

        this.data.lastActivity = Date.now();
        this.updateStreak();
        this.save();
        this._emitChange({ type: 'lesson-started', lessonId });
    }

    // Complete a lesson
    completeLesson(lessonId, score = null) {
        if (!this.data.lessons[lessonId]) {
            this.startLesson(lessonId);
        }

        const lesson = this.data.lessons[lessonId];
        const wasCompleted = lesson.completed;

        lesson.completed = true;
        lesson.completedAt = Date.now();

        if (score !== null) {
            lesson.finalScore = score;
        }

        // Calculate time spent
        const sessionStart = lesson.lastSessionStartAt || lesson.startedAt;
        if (sessionStart) {
            const delta = Date.now() - sessionStart;
            if (delta > 0) {
                lesson.timeSpent += delta;
                this.data.stats.totalTimeSpent += delta;
            }
        }
        lesson.lastSessionStartAt = null;

        // Update words learned (only first completion)
        if (!wasCompleted) {
            const lessonConfig = COURSE_CONFIG.lessons.find(l => l.id === lessonId);
            if (lessonConfig) {
                this.data.stats.wordsLearned += lessonConfig.wordsCount;
            }
        }

        this.data.lastActivity = Date.now();
        this.save();
        this._emitChange({ type: 'lesson-completed', lessonId, score });

        return {
            isFirstCompletion: !wasCompleted,
            totalCompleted: this.getCompletedCount(),
            totalLessons: COURSE_CONFIG.totalLessons
        };
    }

    // Record exercise score
    recordExerciseScore(lessonId, exerciseId, score, maxScore) {
        if (!this.data.lessons[lessonId]) {
            this.startLesson(lessonId);
        }

        const lesson = this.data.lessons[lessonId];
        const prevScore = lesson.exerciseScores[exerciseId];

        // Keep best score
        if (!prevScore || score > prevScore.score) {
            lesson.exerciseScores[exerciseId] = {
                score,
                maxScore,
                percentage: Math.round((score / maxScore) * 100),
                timestamp: Date.now()
            };
        }

        if (!prevScore) {
            this.data.stats.exercisesCompleted++;
        }
        this.data.lastActivity = Date.now();
        this.save();
        this._emitChange({ type: 'exercise-scored', lessonId, exerciseId, score, maxScore });
    }

    // Mark section as visited
    visitSection(lessonId, sectionId) {
        if (!this.data.lessons[lessonId]) {
            this.startLesson(lessonId);
        }

        const sections = this.data.lessons[lessonId].sectionsVisited;
        if (!sections.includes(sectionId)) {
            sections.push(sectionId);
            this.save();
            this._emitChange({ type: 'section-visited', lessonId, sectionId });
        }
    }

    // ============================================
    // STREAK MANAGEMENT
    // ============================================

    updateStreak() {
        const today = getLocalISODate();
        const lastStudy = this.data.stats.lastStudyDate;

        if (lastStudy === today) {
            // Already studied today
            return;
        }

        if (lastStudy) {
            const diffDays = getIsoDayNumber(today) - getIsoDayNumber(lastStudy);

            if (diffDays === 1) {
                // Consecutive day
                this.data.stats.currentStreak++;
            } else if (diffDays > 1) {
                // Streak broken
                this.data.stats.currentStreak = 1;
            }
        } else {
            // First study day
            this.data.stats.currentStreak = 1;
        }

        // Update longest streak
        if (this.data.stats.currentStreak > this.data.stats.longestStreak) {
            this.data.stats.longestStreak = this.data.stats.currentStreak;
        }

        this.data.stats.lastStudyDate = today;
        this.save();
    }

    // ============================================
    // GETTERS
    // ============================================

    // Get lesson status
    getLessonStatus(lessonId) {
        const lesson = this.data.lessons[lessonId];
        if (!lesson) {
            return 'not-started';
        }
        if (lesson.completed) {
            return 'completed';
        }
        return 'in-progress';
    }

    // Get lesson data
    getLessonData(lessonId) {
        return this.data.lessons[lessonId] || null;
    }

    getLessonReadiness(lessonId) {
        const lesson = this.data.lessons[lessonId];
        const exerciseCount = lesson ? Object.keys(lesson.exerciseScores || {}).length : 0;
        const sectionsVisited = lesson ? (lesson.sectionsVisited || []) : [];
        const hasScrollComplete = sectionsVisited.includes('scroll-complete');

        const lessonConfig = COURSE_CONFIG.lessons.find(l => l.id === lessonId);
        const policy = {
            ...COURSE_CONFIG.defaultCompletionPolicy,
            ...(lessonConfig && lessonConfig.completionPolicy ? lessonConfig.completionPolicy : {})
        };

        const minExercises = policy.minExercises || 0;
        const meetsExerciseCount = exerciseCount >= minExercises;
        const meetsScrollComplete = Boolean(hasScrollComplete);

        const requiresScroll = Boolean(policy.requireScrollComplete);
        const allowsScrollAlternative = Boolean(policy.allowScrollComplete);

        let isReady;
        if (requiresScroll) {
            // AND-case: scroll is mandatory; exercises are mandatory only if minExercises > 0.
            isReady = Boolean(meetsScrollComplete && (minExercises > 0 ? meetsExerciseCount : true));
        } else if (minExercises > 0 && allowsScrollAlternative) {
            // Default: scroll OR exercises.
            isReady = Boolean(meetsScrollComplete || meetsExerciseCount);
        } else {
            // Pure exercise-based completion (or immediate completion if minExercises === 0).
            isReady = Boolean(meetsExerciseCount);
        }

        return {
            isReady,
            hasScrollComplete,
            exerciseCount,
            policy,
            meetsExerciseCount,
            meetsScroll: meetsScrollComplete
        };
    }

    // Get completed lessons count
    getCompletedCount() {
        return Object.values(this.data.lessons).filter(l => l.completed).length;
    }

    // Get overall progress percentage
    getOverallProgress() {
        return Math.round((this.getCompletedCount() / COURSE_CONFIG.totalLessons) * 100);
    }

    // Get next lesson to study
    getNextLesson() {
        for (const lesson of COURSE_CONFIG.lessons) {
            const status = this.getLessonStatus(lesson.id);
            if (status !== 'completed') {
                return lesson;
            }
        }
        return null; // All completed
    }

    // Get current lesson (in progress)
    getCurrentLesson() {
        for (const lesson of COURSE_CONFIG.lessons) {
            const status = this.getLessonStatus(lesson.id);
            if (status === 'in-progress') {
                return lesson;
            }
        }
        return this.getNextLesson();
    }

    // Get all stats
    getStats() {
        return {
            ...this.data.stats,
            completedLessons: this.getCompletedCount(),
            totalLessons: COURSE_CONFIG.totalLessons,
            overallProgress: this.getOverallProgress()
        };
    }

    // Get lesson score (average of exercises)
    getLessonScore(lessonId) {
        const lesson = this.data.lessons[lessonId];
        if (!lesson || Object.keys(lesson.exerciseScores).length === 0) {
            return null;
        }

        const scores = Object.values(lesson.exerciseScores);
        const totalPercentage = scores.reduce((sum, s) => sum + s.percentage, 0);
        return Math.round(totalPercentage / scores.length);
    }

    // ============================================
    // UTILITY / CONVENIENCE WRAPPERS
    // ============================================

    // Check if lesson is completed (convenience wrapper)
    isLessonComplete(lessonId) {
        return this.getLessonStatus(lessonId) === 'completed';
    }

    // Mark lesson as complete (convenience wrapper for completeLesson)
    markLessonComplete(lessonId, score = null) {
        return this.completeLesson(lessonId, score);
    }

    // Format time spent
    formatTimeSpent(ms) {
        const minutes = Math.floor(ms / 60000);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}t ${minutes % 60}m`;
        }
        return `${minutes}m`;
    }

    // Reset all progress
    reset() {
        this.data = this.getDefaultData();
        this.save();
        this._emitChange({ type: 'reset' });
    }

    // Export progress (for backup)
    export() {
        return JSON.stringify(this.data, null, 2);
    }

    // Import progress (from backup)
    import(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            if (imported.courseId === COURSE_CONFIG.courseId) {
                this.data = this.migrate(imported);
                this.save();
                this._emitChange({ type: 'import' });
                return true;
            }
        } catch (e) {
            console.error('Import error:', e);
        }
        return false;
    }
}

// ============================================
// PROGRESS UI COMPONENTS
// ============================================

class ProgressUI {
    constructor(progressManager) {
        this.pm = progressManager;
    }

    // Create progress indicator for lesson card
    createLessonIndicator(lessonId) {
        const status = this.pm.getLessonStatus(lessonId);
        const score = this.pm.getLessonScore(lessonId);

        const indicator = document.createElement('div');
        indicator.className = `lesson-progress-indicator status-${status}`;
        indicator.dataset.lessonId = lessonId;

        if (status === 'completed') {
            indicator.innerHTML = `
                <span class="progress-check">✓</span>
                ${score !== null ? `<span class="progress-score">${score}%</span>` : ''}
            `;
        } else if (status === 'in-progress') {
            indicator.innerHTML = `<span class="progress-dot"></span>`;
        }

        return indicator;
    }

    // Create overall progress bar
    createProgressBar() {
        const progress = this.pm.getOverallProgress();
        const completed = this.pm.getCompletedCount();
        const total = COURSE_CONFIG.totalLessons;

        const container = document.createElement('div');
        container.className = 'overall-progress';
        container.dataset.progressRole = 'overall-progress';
        container.innerHTML = `
            <div class="progress-header">
                <span class="progress-label">Din fremgang</span>
                <span class="progress-count">${completed}/${total} lektioner</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${progress}%"></div>
            </div>
            <div class="progress-percentage">${progress}%</div>
        `;

        return container;
    }

    // Create stats panel
    createStatsPanel() {
        const stats = this.pm.getStats();

        const panel = document.createElement('div');
        panel.className = 'stats-panel';
        panel.dataset.progressRole = 'stats-panel';
        panel.innerHTML = `
            <div class="stat-item">
                <span class="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.072-4-2.072-5.5a5.57 5.57 0 1 1 11.14 0c0-2.3-1.14-4.5-2.07-5.5-.5 1-1 1.62-1 3a2.5 2.5 0 0 0 2.5 2.5c1.38 0 2 .5 2 1.5a5.5 5.5 0 0 1-11 5.5Z"/></svg>
                </span>
                <span class="stat-value">${stats.currentStreak}</span>
                <span class="stat-label">Dages streak</span>
            </div>
            <div class="stat-item">
                <span class="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2c1.94 0 3.5 1.56 3.5 3.5V15"/><path d="M20 19.5v-15A2.5 2.5 0 0 0 17.5 2c-1.94 0-3.5 1.56-3.5 3.5V15"/><path d="M6.5 2C8.44 2 10 3.56 10 5.5V19a.5.5 0 0 0 .8.4l1.2-.6 1.2.6a.5.5 0 0 0 .8-.4V5.5c0-1.94 1.56-3.5 3.5-3.5"/></svg>
                </span>
                <span class="stat-value">${stats.wordsLearned}</span>
                <span class="stat-label">Ord lært</span>
            </div>
            <div class="stat-item">
                <span class="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </span>
                <span class="stat-value">${this.pm.formatTimeSpent(stats.totalTimeSpent)}</span>
                <span class="stat-label">Tid brugt</span>
            </div>
            <div class="stat-item">
                <span class="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </span>
                <span class="stat-value">${stats.exercisesCompleted}</span>
                <span class="stat-label">Øvelser</span>
            </div>
        `;

        return panel;
    }

    refreshAll(root = document) {
        // Update existing widgets in-place to keep pages simple.
        root.querySelectorAll('.lesson-progress-indicator[data-lesson-id]').forEach((el) => {
            const lessonId = el.dataset.lessonId;
            const status = this.pm.getLessonStatus(lessonId);
            const score = this.pm.getLessonScore(lessonId);
            el.className = `lesson-progress-indicator status-${status}`;

            if (status === 'completed') {
                el.innerHTML = `
                    <span class="progress-check">✓</span>
                    ${score !== null ? `<span class="progress-score">${score}%</span>` : ''}
                `;
            } else if (status === 'in-progress') {
                el.innerHTML = '<span class="progress-dot"></span>';
            } else {
                el.innerHTML = '';
            }
        });

        root.querySelectorAll('[data-progress-role="overall-progress"]').forEach((container) => {
            const progress = this.pm.getOverallProgress();
            const completed = this.pm.getCompletedCount();
            const total = COURSE_CONFIG.totalLessons;
            const countEl = container.querySelector('.progress-count');
            const fillEl = container.querySelector('.progress-bar-fill');
            const pctEl = container.querySelector('.progress-percentage');
            if (countEl) countEl.textContent = `${completed}/${total} lektioner`;
            if (fillEl) fillEl.style.width = `${progress}%`;
            if (pctEl) pctEl.textContent = `${progress}%`;
        });

        root.querySelectorAll('[data-progress-role="stats-panel"]').forEach((panel) => {
            const stats = this.pm.getStats();
            const values = panel.querySelectorAll('.stat-value');
            if (values.length >= 4) {
                values[0].textContent = String(stats.currentStreak);
                values[1].textContent = String(stats.wordsLearned);
                values[2].textContent = String(this.pm.formatTimeSpent(stats.totalTimeSpent));
                values[3].textContent = String(stats.exercisesCompleted);
            }
        });
    }

    // Create lesson completion modal
    createCompletionModal(lessonId, result) {
        const lessonConfig = COURSE_CONFIG.lessons.find(l => l.id === lessonId);
        const nextLesson = this.pm.getNextLesson();
        const stats = this.pm.getStats();
        const readiness = this.pm.getLessonReadiness(lessonId);

        const minExercises = readiness.policy?.minExercises || 0;
        const requiresScroll = Boolean(readiness.policy?.requireScrollComplete);
        const allowsScrollAlternative = Boolean(readiness.policy?.allowScrollComplete);

        let checklistHint = '';
        if (!requiresScroll && allowsScrollAlternative && minExercises > 0) {
            checklistHint = 'Du kan gennemføre ved at opfylde mindst én af punkterne:';
        }

        const checklistItems = [];
        if (requiresScroll || allowsScrollAlternative) {
            checklistItems.push({
                ok: readiness.hasScrollComplete,
                label: 'Læst til bunden'
            });
        }
        if (minExercises > 0) {
            checklistItems.push({
                ok: readiness.meetsExerciseCount,
                label: `Øvelser (mindst ${minExercises})`
            });
        }

        const modal = document.createElement('div');
        modal.className = 'completion-modal';
        modal.innerHTML = `
            <div class="completion-overlay"></div>
            <div class="completion-content">
                <div class="completion-celebration">
                    <div class="confetti-container"></div>
                    <span class="completion-icon">${ICONS[lessonConfig?.iconId] || ICONS['party']}</span>
                </div>
                <h2>Lektion Færdig!</h2>
                <p class="completion-title">${lessonConfig?.title || 'Lektion'}</p>
                
                <div class="completion-stats">
                    <div class="completion-stat">
                        <span class="stat-number">${result.totalCompleted}</span>
                        <span class="stat-text">af ${result.totalLessons} lektioner</span>
                    </div>
                    ${result.score !== null && result.score !== undefined ? `
                        <div class="completion-stat">
                            <span class="stat-number">${result.score}%</span>
                            <span class="stat-text">score</span>
                        </div>
                    ` : ''}
                </div>

                ${stats.currentStreak > 1 ? `
                    <div class="streak-badge">
                        <span class="streak-icon">${ICONS['fire']}</span> ${stats.currentStreak} dages streak!
                    </div>
                ` : ''}

                ${checklistItems.length ? `
                    <div class="completion-checklist">
                        ${checklistHint ? `<div class="checklist-hint">${checklistHint}</div>` : ''}
                        ${checklistItems.map(item => `
                            <div class="checklist-item ${item.ok ? 'ok' : ''}">
                                <span class="checklist-mark">${item.ok ? '✓' : '—'}</span>
                                <span class="checklist-text">${item.label}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <div class="completion-actions">
                    ${nextLesson ? `
                        <a href="${nextLesson.id}-v2.html" class="btn btn-primary">
                            Næste: ${nextLesson.title} →
                        </a>
                    ` : `
                        <div class="course-complete">
                            <span class="trophy">${ICONS['trophy']}</span>
                            <p>Du har gennemført hele kurset!</p>
                        </div>
                    `}
                    <a href="../index-v2.html" class="btn btn-secondary">Tilbage til oversigt</a>
                </div>
            </div>
        `;

        // Close on overlay click
        modal.querySelector('.completion-overlay').addEventListener('click', () => {
            modal.classList.add('closing');
            setTimeout(() => modal.remove(), 300);
        });

        // Add confetti animation
        this.addConfetti(modal.querySelector('.confetti-container'));

        return modal;
    }

    createNotReadyModal(lessonId, readiness) {
        const lessonConfig = COURSE_CONFIG.lessons.find(l => l.id === lessonId);

        const minExercises = readiness.policy?.minExercises || 0;
        const requiresScroll = Boolean(readiness.policy?.requireScrollComplete);
        const allowsScrollAlternative = Boolean(readiness.policy?.allowScrollComplete);

        let requirementsText = '';
        if (requiresScroll && minExercises > 0) {
            requirementsText = `læse til bunden og lave mindst ${minExercises} øvelse${minExercises === 1 ? '' : 'r'}`;
        } else if (requiresScroll) {
            requirementsText = 'læse til bunden';
        } else if (minExercises > 0 && allowsScrollAlternative) {
            requirementsText = `læse til bunden eller lave mindst ${minExercises} øvelse${minExercises === 1 ? '' : 'r'}`;
        } else if (minExercises > 0) {
            requirementsText = `lave mindst ${minExercises} øvelse${minExercises === 1 ? '' : 'r'}`;
        } else {
            requirementsText = 'fortsætte';
        }

        const modal = document.createElement('div');
        modal.className = 'completion-modal';
        modal.innerHTML = `
            <div class="completion-overlay"></div>
            <div class="completion-content">
                <div class="completion-celebration">
                    <span class="completion-icon">${ICONS['hourglass']}</span>
                </div>
                <h2>Ikke endnu</h2>
                <p class="completion-title">${lessonConfig?.title || 'Lektion'}</p>
                <p style="color:#666; margin: 0 0 1.5rem; line-height: 1.5;">
                    For at markere lektionen som gennemført, skal du ${requirementsText}.
                </p>
                <div class="completion-stats">
                    <div class="completion-stat">
                        <span class="stat-number">${requiresScroll || allowsScrollAlternative ? (readiness.hasScrollComplete ? '✓' : '—') : '—'}</span>
                        <span class="stat-text">Læst til bunden</span>
                    </div>
                    <div class="completion-stat">
                        <span class="stat-number">${readiness.exerciseCount}</span>
                        <span class="stat-text">Øvelser (kræver ${minExercises})</span>
                    </div>
                </div>
                <div class="completion-actions">
                    <button class="btn btn-primary" data-action="close">OK</button>
                </div>
            </div>
        `;

        modal.querySelector('.completion-overlay').addEventListener('click', () => {
            modal.classList.add('closing');
            setTimeout(() => modal.remove(), 300);
        });
        modal.querySelector('[data-action="close"]').addEventListener('click', () => {
            modal.classList.add('closing');
            setTimeout(() => modal.remove(), 300);
        });

        return modal;
    }

    // Add confetti animation
    addConfetti(container) {
        const colors = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6'];

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.cssText = `
                left: ${Math.random() * 100}%;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                animation-delay: ${Math.random() * 0.5}s;
                animation-duration: ${1 + Math.random()}s;
            `;
            container.appendChild(confetti);
        }
    }
}

// ============================================
// PROGRESS STYLES (injected)
// ============================================

const PROGRESS_STYLES = `
/* Progress Indicator on Lesson Cards */
.lesson-progress-indicator {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 2;
}

.lesson-progress-indicator.status-completed .progress-check {
    width: 24px;
    height: 24px;
    background: #2ecc71;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
}

.lesson-progress-indicator.status-completed .progress-score {
    background: rgba(46, 204, 113, 0.2);
    color: #27ae60;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 600;
}

.lesson-progress-indicator.status-in-progress .progress-dot {
    width: 12px;
    height: 12px;
    background: #f39c12;
    border-radius: 50%;
    animation: pulse-progress 2s infinite;
}

@keyframes pulse-progress {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.7; }
}

/* Overall Progress Bar */
.overall-progress {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    margin-bottom: 2rem;
}

.progress-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
}

.progress-label {
    font-weight: 600;
    color: #1a1a1a;
}

.progress-count {
    color: #666;
    font-size: 0.9rem;
}

.progress-bar-container {
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
}

.progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #e74c3c, #f39c12);
    border-radius: 4px;
    transition: width 0.5s ease;
}

.progress-percentage {
    text-align: right;
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: #666;
}

/* Stats Panel */
.stats-panel {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
}

.stat-item {
    background: white;
    border-radius: 12px;
    padding: 1.25rem;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.stat-icon {
    font-size: 1.5rem;
    display: block;
    margin-bottom: 0.5rem;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1a1a;
    display: block;
}

.stat-label {
    font-size: 0.75rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

/* Completion Modal */
.completion-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
}

.completion-modal.closing {
    animation: fadeOut 0.3s ease forwards;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}

.completion-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
}

.completion-content {
    position: relative;
    background: white;
    border-radius: 20px;
    padding: 3rem;
    max-width: 480px;
    width: 90%;
    text-align: center;
    animation: slideUp 0.4s ease;
}

@keyframes slideUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.completion-celebration {
    position: relative;
    margin-bottom: 1.5rem;
}

.confetti-container {
    position: absolute;
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 100px;
    overflow: visible;
}

.confetti-piece {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    animation: confetti-fall 1.5s ease-out forwards;
}

@keyframes confetti-fall {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(150px) rotate(720deg); opacity: 0; }
}

.completion-icon {
    font-size: 4rem;
    display: block;
}

.completion-content h2 {
    font-size: 2rem;
    font-weight: 300;
    margin-bottom: 0.5rem;
    color: #1a1a1a;
}

.completion-title {
    color: #666;
    font-size: 1.1rem;
    margin-bottom: 2rem;
}

.completion-stats {
    display: flex;
    justify-content: center;
    gap: 3rem;
    margin-bottom: 1.5rem;
}

.completion-checklist {
    margin: 0 auto 1.5rem;
    max-width: 360px;
    text-align: left;
}

.completion-checklist .checklist-hint {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 0.5rem;
}

.completion-checklist .checklist-item {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    padding: 0.5rem 0;
    border-top: 1px solid #f0f0f0;
}

.completion-checklist .checklist-item:first-child {
    border-top: none;
}

.completion-checklist .checklist-mark {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    background: #f3f3f3;
    color: #666;
    flex: 0 0 20px;
}

.completion-checklist .checklist-item.ok .checklist-mark {
    background: rgba(46, 204, 113, 0.2);
    color: #27ae60;
}

.completion-checklist .checklist-text {
    color: #1a1a1a;
    font-size: 0.95rem;
}

.completion-stat {
    text-align: center;
}

.completion-stat .stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #e74c3c;
    display: block;
}

.completion-stat .stat-text {
    font-size: 0.85rem;
    color: #666;
}

.streak-badge {
    background: linear-gradient(135deg, #f39c12, #e74c3c);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 30px;
    display: inline-block;
    font-weight: 600;
    margin-bottom: 1.5rem;
}

.completion-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.completion-actions .btn {
    padding: 1rem 2rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;
}

.completion-actions .btn-primary {
    background: #1a1a1a;
    color: white;
}

.completion-actions .btn-primary:hover {
    background: #e74c3c;
}

.completion-actions .btn-secondary {
    background: transparent;
    color: #666;
    border: 1px solid #e0e0e0;
}

.completion-actions .btn-secondary:hover {
    border-color: #1a1a1a;
    color: #1a1a1a;
}

.course-complete {
    padding: 1rem;
}

.course-complete .trophy {
    font-size: 3rem;
    display: block;
    margin-bottom: 0.5rem;
}

.course-complete p {
    color: #666;
}

/* Inline Requirements Checklist (next to complete button) */
.completion-requirements {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 1rem;
    font-size: 0.85rem;
    color: #666;
    flex-wrap: wrap;
}

.completion-req-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    background: rgba(0,0,0,0.03);
    border-radius: 20px;
    transition: all 0.2s;
}

.completion-req-item.met {
    background: rgba(46, 204, 113, 0.15);
    color: #27ae60;
}

.completion-req-item .req-icon {
    font-size: 0.9rem;
    line-height: 1;
}

.completion-req-item .req-label {
    font-size: 0.8rem;
}

/* Responsive */
@media (max-width: 600px) {
    .stats-panel {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .completion-content {
        padding: 2rem;
    }
    
    .completion-stats {
        gap: 1.5rem;
    }

    .completion-requirements {
        flex-direction: column;
        gap: 0.5rem;
        align-items: center;
    }
}
`;

// Inject styles
function injectProgressStyles() {
    if (!document.getElementById('progress-system-styles')) {
        const style = document.createElement('style');
        style.id = 'progress-system-styles';
        style.textContent = PROGRESS_STYLES;
        document.head.appendChild(style);
    }
}

// ============================================
// GLOBAL INSTANCE
// ============================================

// Create global instance
const Progress = new ProgressManager();
const ProgressUIHelper = new ProgressUI(Progress);

// Auto-refresh progress UI on any progress change (where widgets exist).
Progress.onChange(() => {
    try {
        ProgressUIHelper.refreshAll(document);
    } catch (e) {
        console.error('Progress UI refresh error:', e);
    }
});

// Auto-inject styles when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectProgressStyles);
} else {
    injectProgressStyles();
}

// ============================================
// HELPER FUNCTIONS FOR LESSONS
// ============================================

// Call this at the start of each lesson
function initLessonProgress(lessonId) {
    Progress.startLesson(lessonId);

    const completeBtn = document.getElementById('complete-lesson-btn');
    if (completeBtn) {
        // Create requirements checklist element
        let requirementsEl = document.getElementById('completion-requirements');
        if (!requirementsEl) {
            requirementsEl = document.createElement('div');
            requirementsEl.id = 'completion-requirements';
            requirementsEl.className = 'completion-requirements';
            completeBtn.parentNode.insertBefore(requirementsEl, completeBtn.nextSibling);
        }

        const syncCompletionButton = () => {
            const status = Progress.getLessonStatus(lessonId);
            const readiness = Progress.getLessonReadiness(lessonId);

            const lessonConfig = COURSE_CONFIG.lessons.find(l => l.id === lessonId);

            const minExercises = readiness.policy?.minExercises || 0;
            const requiresScroll = Boolean(readiness.policy?.requireScrollComplete);
            const allowsScrollAlternative = Boolean(readiness.policy?.allowScrollComplete);

            // Update requirements checklist
            const checklistItems = [];
            if (requiresScroll || allowsScrollAlternative) {
                checklistItems.push({
                    met: readiness.hasScrollComplete,
                    label: 'Læst til bunden',
                    icon: readiness.hasScrollComplete ? ICONS['check'] : ICONS['scroll']
                });
            }
            if (minExercises > 0) {
                checklistItems.push({
                    met: readiness.meetsExerciseCount,
                    label: `${readiness.exerciseCount}/${minExercises} øvelser`,
                    icon: readiness.meetsExerciseCount ? ICONS['check'] : ICONS['pencil']
                });
            }

            if (status === 'completed') {
                completeBtn.innerHTML = lessonConfig?.completedButtonText || `${ICONS['check']} Allerede gennemført`;
                completeBtn.classList.add('completed');
                completeBtn.disabled = true;
                completeBtn.removeAttribute('title');
                requirementsEl.style.display = 'none';
                return;
            }

            // Show requirements checklist
            if (checklistItems.length > 0) {
                requirementsEl.style.display = 'flex';
                requirementsEl.innerHTML = checklistItems.map(item => `
                    <div class="completion-req-item ${item.met ? 'met' : ''}">
                        <span class="req-icon">${item.icon}</span>
                        <span class="req-label">${item.label}</span>
                    </div>
                `).join('');
            } else {
                requirementsEl.style.display = 'none';
            }

            completeBtn.disabled = false;
            completeBtn.classList.remove('completed');
            completeBtn.removeAttribute('title');
        };

        syncCompletionButton();
        Progress.onChange(syncCompletionButton);
    }

    // Track scroll progress
    let maxScroll = 0;
    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            ticking = false;
            const denom = document.body.scrollHeight - window.innerHeight;
            if (denom <= 0) return;
            const scrollPercent = Math.round((window.scrollY / denom) * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                if (maxScroll >= 90) {
                    Progress.visitSection(lessonId, 'scroll-complete');
                    window.removeEventListener('scroll', onScroll);
                }
            }
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
}

// Call this when lesson is completed
function completeLessonWithModal(lessonId, score = null) {
    const readiness = Progress.getLessonReadiness(lessonId);
    if (!readiness.isReady) {
        const modal = ProgressUIHelper.createNotReadyModal(lessonId, readiness);
        document.body.appendChild(modal);
        return { blocked: true, readiness };
    }

    const effectiveScore = score !== null && score !== undefined ? score : Progress.getLessonScore(lessonId);
    const result = Progress.completeLesson(lessonId, effectiveScore);
    result.score = effectiveScore;

    const modal = ProgressUIHelper.createCompletionModal(lessonId, result);
    document.body.appendChild(modal);

    return result;
}

function reportExerciseScore(exerciseId, score, maxScore, lessonId = null) {
    // Thin integration layer: exercises can report results without importing ProgressManager.
    const effectiveLessonId = lessonId || Progress.activeLessonId;
    if (!effectiveLessonId) {
        console.warn('reportExerciseScore: no active lesson id');
        return;
    }
    if (!exerciseId) {
        console.warn('reportExerciseScore: missing exerciseId');
        return;
    }
    Progress.recordExerciseScore(effectiveLessonId, String(exerciseId), Number(score) || 0, Number(maxScore) || 0);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        COURSE_CONFIG,
        ProgressManager,
        ProgressUI,
        Progress,
        ProgressUIHelper,
        initLessonProgress,
        completeLessonWithModal,
        reportExerciseScore
    };
}
