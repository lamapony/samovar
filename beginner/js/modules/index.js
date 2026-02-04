/**
 * Samovar Lesson Engine - Module Index
 * 
 * This is the main entry point for the modularized lesson engine.
 * It imports all modules and re-exports them for use in lessons.
 * 
 * Usage in HTML:
 *   <script type="module" src="js/modules/index.js"></script>
 * 
 * Or import specific modules:
 *   import { TTS } from './modules/tts.js';
 *   import { FillBlankExercise } from './modules/exercises-basic.js';
 */

// Import core modules
import { TTS, TTSEngine } from './tts.js';
import { callClaudeAPI, CLAUDE_API_URL } from './ai-provider.js';

// Import vocabulary components
import { VocabularyCard, VocabularyList } from './vocabulary.js';

// Import basic exercises
import {
    FillBlankExercise,
    ListeningExercise,
    MatchingExercise,
    WritingExercise,
    getResultMessage,
    reportScore
} from './exercises-basic.js';

// Import advanced exercises
import {
    SentenceBuilder,
    Flashcards,
    Dialogue,
    MemoryGame,
    SpeedChallenge,
    WordScramble,
    LessonProgress
} from './exercises-advanced.js';

// Import typing exercises
import { TypingPractice, AnimatedDialogue } from './exercises-typing.js';

// Re-export everything
export {
    // Core
    TTS,
    TTSEngine,
    callClaudeAPI,
    CLAUDE_API_URL,

    // Vocabulary
    VocabularyCard,
    VocabularyList,

    // Basic Exercises
    FillBlankExercise,
    ListeningExercise,
    MatchingExercise,
    WritingExercise,

    // Advanced Exercises
    SentenceBuilder,
    Flashcards,
    Dialogue,
    MemoryGame,
    SpeedChallenge,
    WordScramble,
    LessonProgress,

    // Typing Exercises
    TypingPractice,
    AnimatedDialogue,

    // Helpers
    getResultMessage,
    reportScore
};

// Make modules available globally for backward compatibility with existing lessons
if (typeof window !== 'undefined') {
    // Core
    window.TTS = TTS;
    window.callClaudeAPI = callClaudeAPI;

    // Vocabulary
    window.VocabularyCard = VocabularyCard;
    window.VocabularyList = VocabularyList;

    // Basic Exercises
    window.FillBlankExercise = FillBlankExercise;
    window.ListeningExercise = ListeningExercise;
    window.MatchingExercise = MatchingExercise;
    window.WritingExercise = WritingExercise;

    // Advanced Exercises
    window.SentenceBuilder = SentenceBuilder;
    window.Flashcards = Flashcards;
    window.Dialogue = Dialogue;
    window.MemoryGame = MemoryGame;
    window.SpeedChallenge = SpeedChallenge;
    window.WordScramble = WordScramble;
    window.LessonProgress = LessonProgress;

    // Typing Exercises
    window.TypingPractice = TypingPractice;
    window.AnimatedDialogue = AnimatedDialogue;
}

console.log('Samovar Lesson Engine modules loaded (16 components)');

