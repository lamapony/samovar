/**
 * TTS (Text-to-Speech) Module for Samovar
 * Supports ElevenLabs API with browser fallback
 */

class TTSEngine {
    constructor() {
        // Never hardcode API keys in frontend code. Provide it at runtime via window.ELEVENLABS_API_KEY if needed.
        this.apiKey = (typeof window !== 'undefined' && window.ELEVENLABS_API_KEY) ? window.ELEVENLABS_API_KEY : '';
        // Voices: Lily (Female), Daniel (Male)
        this.voices = {
            female: 'XrExE9yKIg1WjnnlVkGX', // Lily
            male: 'onwK4e9ZLuTAKqWW03F9'    // Daniel
        };
        this.defaultVoice = 'female';
        this.isPlaying = false;
        this.audioCache = new Map();
    }

    // Scroll to top on load
    init() {
        if (typeof window !== 'undefined') {
            window.onload = () => window.scrollTo(0, 0);
        }
    }

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
    }

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
    }

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
    }

    speakSlow(text, gender = 'female') {
        return this.speak(text, true, gender);
    }

    stop() {
        this.isPlaying = false;
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
    }
}

// Create singleton instance
const TTS = new TTSEngine();

// Initialize scroll fix
TTS.init();

// Export for ES modules
export { TTS, TTSEngine };

// Also make available globally for backward compatibility
if (typeof window !== 'undefined') {
    window.TTS = TTS;
}
