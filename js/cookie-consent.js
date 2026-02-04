/**
 * Cookie Consent Manager for Samovar
 * GDPR compliant cookie banner
 */

class CookieConsent {
    constructor() {
        this.cookieName = 'samovar_cookie_consent';
        this.consent = this.getConsent();
        this.init();
    }

    init() {
        // If no consent stored, show banner
        if (!this.consent) {
            this.showBanner();
        }

        // Listen for custom event to reopen banner
        document.addEventListener('openCookieSettings', () => {
            this.showBanner();
        });
    }

    getConsent() {
        try {
            const value = localStorage.getItem(this.cookieName);
            return value ? JSON.parse(value) : null;
        } catch (e) {
            return null;
        }
    }

    setConsent(consent) {
        try {
            localStorage.setItem(this.cookieName, JSON.stringify({
                ...consent,
                date: new Date().toISOString()
            }));
            this.consent = consent;
            this.hideBanner();
            this.applyConsent();
        } catch (e) {
            console.warn('Could not save cookie consent');
        }
    }

    hasConsent(type) {
        if (!this.consent) return false;
        return this.consent[type] === true;
    }

    showBanner() {
        // Remove existing banner if any
        const existing = document.getElementById('cookie-banner');
        if (existing) existing.remove();

        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.innerHTML = this.getBannerHTML();
        document.body.appendChild(banner);

        // Add event listeners
        this.attachEventListeners(banner);
    }

    hideBanner() {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.style.opacity = '0';
            banner.style.transform = 'translateY(100%)';
            setTimeout(() => banner.remove(), 300);
        }
    }

    getBannerHTML() {
        return `
            <div class="cookie-banner-container">
                <div class="cookie-banner-content">
                    <div class="cookie-banner-text">
                        <h3>🍪 Vi bruger cookies</h3>
                        <p>
                            Vi bruger cookies til at forbedre din oplevelse og gemme dine fremskridt. 
                            Læs mere i vores <a href="/privatlivspolitik.html" target="_blank">privatlivspolitik</a>.
                        </p>
                    </div>
                    <div class="cookie-banner-actions">
                        <button class="cookie-btn cookie-btn-secondary" data-action="customize">
                            Tilpas
                        </button>
                        <button class="cookie-btn cookie-btn-primary" data-action="accept-necessary">
                            Kun nødvendige
                        </button>
                        <button class="cookie-btn cookie-btn-primary" data-action="accept-all">
                            Accepter alle
                        </button>
                    </div>
                </div>
                <div class="cookie-customize" style="display: none;">
                    <div class="cookie-options">
                        <label class="cookie-option">
                            <input type="checkbox" checked disabled>
                            <span class="cookie-option-text">
                                <strong>Nødvendige</strong>
                                <small>Kræves for at hjemmesiden fungerer</small>
                            </span>
                        </label>
                        <label class="cookie-option">
                            <input type="checkbox" id="cookie-functional" checked>
                            <span class="cookie-option-text">
                                <strong>Funktionelle</strong>
                                <small>Gemmer dine fremskridt og præferencer</small>
                            </span>
                        </label>
                    </div>
                    <div class="cookie-customize-actions">
                        <button class="cookie-btn cookie-btn-secondary" data-action="back">
                            Tilbage
                        </button>
                        <button class="cookie-btn cookie-btn-primary" data-action="save-preferences">
                            Gem præferencer
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    attachEventListeners(banner) {
        // Main actions
        banner.querySelector('[data-action="accept-all"]').addEventListener('click', () => {
            this.setConsent({
                necessary: true,
                functional: true,
                analytics: false // We don't use analytics yet
            });
        });

        banner.querySelector('[data-action="accept-necessary"]').addEventListener('click', () => {
            this.setConsent({
                necessary: true,
                functional: false,
                analytics: false
            });
        });

        // Customize view
        banner.querySelector('[data-action="customize"]').addEventListener('click', () => {
            banner.querySelector('.cookie-banner-content').style.display = 'none';
            banner.querySelector('.cookie-customize').style.display = 'block';
        });

        banner.querySelector('[data-action="back"]').addEventListener('click', () => {
            banner.querySelector('.cookie-customize').style.display = 'none';
            banner.querySelector('.cookie-banner-content').style.display = 'block';
        });

        banner.querySelector('[data-action="save-preferences"]').addEventListener('click', () => {
            const functional = banner.querySelector('#cookie-functional').checked;
            this.setConsent({
                necessary: true,
                functional: functional,
                analytics: false
            });
        });
    }

    applyConsent() {
        // Apply consent settings
        if (!this.hasConsent('functional')) {
            // Clear any existing progress data if user revokes consent
            // But don't delete it - just don't use it
            console.log('Functional cookies disabled');
        }
    }
}

// Add styles
const cookieStyles = document.createElement('style');
cookieStyles.textContent = `
    #cookie-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--bg-card, #ffffff);
        border-top: 1px solid var(--line-color, #e0e0e0);
        box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
        z-index: 10000;
        padding: var(--space-m, 16px);
        transition: opacity 0.3s, transform 0.3s;
    }

    .cookie-banner-container {
        max-width: 1200px;
        margin: 0 auto;
    }

    .cookie-banner-content {
        display: flex;
        align-items: center;
        gap: var(--space-l, 24px);
        flex-wrap: wrap;
    }

    .cookie-banner-text {
        flex: 1;
        min-width: 250px;
    }

    .cookie-banner-text h3 {
        margin: 0 0 var(--space-xs, 8px) 0;
        font-size: 1.1rem;
    }

    .cookie-banner-text p {
        margin: 0;
        font-size: 0.9rem;
        color: var(--text-secondary, #666);
    }

    .cookie-banner-text a {
        color: var(--accent-blue, #2c3e50);
        text-decoration: underline;
    }

    .cookie-banner-actions {
        display: flex;
        gap: var(--space-s, 8px);
        flex-wrap: wrap;
    }

    .cookie-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.2s;
    }

    .cookie-btn-primary {
        background: var(--accent-blue, #2c3e50);
        color: white;
    }

    .cookie-btn-primary:hover {
        background: var(--accent-blue-dark, #1a3a4a);
    }

    .cookie-btn-secondary {
        background: transparent;
        color: var(--text-secondary, #666);
        border: 1px solid var(--line-color, #e0e0e0);
    }

    .cookie-btn-secondary:hover {
        background: var(--bg-secondary, #f5f5f5);
    }

    .cookie-customize {
        padding: var(--space-m, 16px) 0;
    }

    .cookie-options {
        display: flex;
        flex-direction: column;
        gap: var(--space-m, 16px);
        margin-bottom: var(--space-l, 24px);
    }

    .cookie-option {
        display: flex;
        align-items: flex-start;
        gap: var(--space-s, 8px);
        cursor: pointer;
    }

    .cookie-option input[type="checkbox"] {
        width: 20px;
        height: 20px;
        margin-top: 2px;
        cursor: pointer;
    }

    .cookie-option input[type="checkbox"]:disabled {
        opacity: 0.5;
    }

    .cookie-option-text {
        display: flex;
        flex-direction: column;
    }

    .cookie-option-text strong {
        font-size: 1rem;
    }

    .cookie-option-text small {
        color: var(--text-secondary, #666);
        font-size: 0.85rem;
    }

    .cookie-customize-actions {
        display: flex;
        gap: var(--space-s, 8px);
        justify-content: flex-end;
    }

    @media (max-width: 768px) {
        .cookie-banner-content {
            flex-direction: column;
            align-items: flex-start;
        }

        .cookie-banner-actions {
            width: 100%;
        }

        .cookie-btn {
            flex: 1;
        }
    }
`;

document.head.appendChild(cookieStyles);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new CookieConsent());
} else {
    new CookieConsent();
}

// Expose to global scope for manual triggering
window.CookieConsent = CookieConsent;
