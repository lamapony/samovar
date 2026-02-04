/**
 * Vocabulary Components Module
 * Card and List components for displaying vocabulary
 */

import { TTS } from './tts.js';

/**
 * Single vocabulary card with word, transcription, translation and TTS
 */
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

/**
 * Grid list of vocabulary cards
 */
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

// Export for ES modules
export { VocabularyCard, VocabularyList };

// Global exports for backward compatibility
if (typeof window !== 'undefined') {
    window.VocabularyCard = VocabularyCard;
    window.VocabularyList = VocabularyList;
}
