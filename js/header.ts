/**
 * Shared Header Component for Samovar
 * Standardizes navigation across all pages and simplifies maintenance.
 */

class SamovarHeader extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback(): void {
        const isLesson = window.location.pathname.includes('/lessons/') || window.location.pathname.includes('/beginner/lessons/');
        const isBeginner = window.location.pathname.includes('/beginner/');
        const basePath = this.calculateBasePath();

        this.innerHTML = `
            <header>
                <div class="header-left">
                    <a href="${basePath}index.html" class="logo">Samovar.</a>
                </div>
                <nav>
                    <a href="${basePath}index.html" class="${!isLesson && !isBeginner ? 'active' : ''}">Hovedside</a>
                    <a href="${basePath}beginner/index.html" class="${isBeginner ? 'active' : ''}">Begynder</a>
                    ${isLesson ? `<a href="#" class="active lesson-nav-item">Lektion</a>` : ''}
                </nav>
                <div class="header-right">
                    <button class="theme-toggle" aria-label="Toggle Dark Mode" title="Skift tema">
                        <svg class="sun" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                        <svg class="moon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                    </button>
                    <button class="menu-toggle" aria-label="Toggle Menu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </header>
            <div class="drawer-overlay"></div>
            <div class="mobile-drawer">
                <a href="${basePath}index.html" class="${!isLesson && !isBeginner ? 'active' : ''}">Hovedside</a>
                <a href="${basePath}beginner/index.html" class="${isBeginner ? 'active' : ''}">Begynder</a>
                ${isLesson ? `<a href="#" class="active lesson-nav-item">Lektion</a>` : ''}
            </div>
        `;

        this.initMobileMenu();
        this.initThemeToggle();
        this.styleHeader();
    }

    private initThemeToggle(): void {
        const toggle = this.querySelector('.theme-toggle');
        if (!toggle) return;

        // Check for saved theme preference or system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else if (savedTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        }

        toggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    private initMobileMenu(): void {
        const toggle = this.querySelector('.menu-toggle') as HTMLElement;
        const drawer = this.querySelector('.mobile-drawer') as HTMLElement;
        const overlay = this.querySelector('.drawer-overlay') as HTMLElement;
        const links = this.querySelectorAll('.mobile-drawer a');

        if (!toggle || !drawer || !overlay) return;

        const openMenu = () => {
            toggle.classList.add('open');
            drawer.classList.add('open');
            overlay.classList.add('open');
            toggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            // Focus the first link
            setTimeout(() => {
                (drawer.querySelector('a') as HTMLElement)?.focus();
            }, 300);
        };

        const closeMenu = () => {
            toggle.classList.remove('open');
            drawer.classList.remove('open');
            overlay.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            toggle.focus();
        };

        toggle.addEventListener('click', () => {
            if (drawer.classList.contains('open')) closeMenu();
            else openMenu();
        });

        overlay.addEventListener('click', closeMenu);

        links.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawer.classList.contains('open')) {
                closeMenu();
            }
        });
    }

    private calculateBasePath(): string {
        // Simple logic to find relative path to root
        // In Vite dev, it's often better to use absolute paths from root
        // but for hybrid/MPA relative might still be needed if deployed to subpaths.
        // For now, we'll keep the logic but make it more robust.

        const path = window.location.pathname;
        if (path.includes('/lessons/') || path.includes('/beginner/lessons/')) {
            return '../../';
        } else if (path.includes('/beginner/') || path.includes('/articles/')) {
            return '../';
        }
        return './';
    }

    private styleHeader(): void {
        const header = this.querySelector('header');
        if (header) {
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.style.padding = 'var(--space-m) 0';
            header.style.borderBottom = '1px solid var(--line-color, #e0e0e0)';
            header.style.marginBottom = 'var(--space-l)';
        }
    }
}

customElements.define('samovar-header', SamovarHeader);
