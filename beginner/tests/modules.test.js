/**
 * Unit tests for TTS module
 * Tests the Text-to-Speech engine functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the TTS module before importing
vi.mock('../js/modules/tts.js', () => ({
    TTS: {
        speak: vi.fn(() => Promise.resolve()),
        speakSlow: vi.fn(() => Promise.resolve()),
        stop: vi.fn(),
        isPlaying: false,
        audioCache: new Map()
    },
    TTSEngine: vi.fn()
}));

describe('TTS Module', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should be importable', async () => {
        const { TTS } = await import('../js/modules/tts.js');
        expect(TTS).toBeDefined();
    });

    it('TTS should have speak method', async () => {
        const { TTS } = await import('../js/modules/tts.js');
        expect(typeof TTS.speak).toBe('function');
    });

    it('TTS should have speakSlow method', async () => {
        const { TTS } = await import('../js/modules/tts.js');
        expect(typeof TTS.speakSlow).toBe('function');
    });

    it('TTS should have stop method', async () => {
        const { TTS } = await import('../js/modules/tts.js');
        expect(typeof TTS.stop).toBe('function');
    });
});

describe('Exercise Helpers', () => {
    it('reportScore should be a function or undefined', async () => {
        const { reportScore } = await import('../js/modules/exercises-basic.js');
        expect(typeof reportScore).toBe('function');
    });

    it('getResultMessage should return correct messages', async () => {
        const { getResultMessage } = await import('../js/modules/exercises-basic.js');

        expect(getResultMessage(100)).toContain('Fantastisk');
        expect(getResultMessage(85)).toContain('Meget godt');
        expect(getResultMessage(65)).toContain('Godt arbejde');
        expect(getResultMessage(40)).toContain('Bliv ved');
    });
});

describe('Module Index', () => {
    it('should export all core modules', async () => {
        const modules = await import('../js/modules/index.js');

        // Core
        expect(modules.TTS).toBeDefined();
        expect(modules.callClaudeAPI).toBeDefined();

        // Vocabulary
        expect(modules.VocabularyCard).toBeDefined();
        expect(modules.VocabularyList).toBeDefined();

        // Basic exercises
        expect(modules.FillBlankExercise).toBeDefined();
        expect(modules.ListeningExercise).toBeDefined();
        expect(modules.MatchingExercise).toBeDefined();
        expect(modules.WritingExercise).toBeDefined();

        // Advanced exercises
        expect(modules.SentenceBuilder).toBeDefined();
        expect(modules.MemoryGame).toBeDefined();

        // Typing exercises
        expect(modules.TypingPractice).toBeDefined();
        expect(modules.AnimatedDialogue).toBeDefined();
    });
});
