/**
 * Shared Footer Component for Samovar
 */

class SamovarFooter extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback(): void {
        const year = new Date().getFullYear();
        this.innerHTML = `
            <footer>
                <div class="footer-content">
                    <div class="footer-copyright">&copy; ${year} Samovar. Akademisk russisk sprogkursus.</div>
                    <div class="footer-links">
                        <a href="#">Metodologi</a>
                        <a href="#">Bibliotek</a>
                        <a href="#">Kontakt</a>
                    </div>
                </div>
            </footer>
        `;
        this.styleFooter();
    }

    private styleFooter(): void {
        const footer = this.querySelector('footer');
        if (footer) {
            footer.style.marginTop = 'var(--space-xl)';
            footer.style.padding = 'var(--space-l) 0';
            footer.style.borderTop = '1px solid var(--line-color, #e0e0e0)';

            const content = footer.querySelector('.footer-content') as HTMLElement;
            if (content) {
                content.style.display = 'flex';
                content.style.justifyContent = 'space-between';
                content.style.alignItems = 'center';
                content.style.color = '#777';
                content.style.fontSize = '0.9rem';
            }

            footer.querySelectorAll('a').forEach(a => {
                const element = a as HTMLElement;
                element.style.color = 'inherit';
                element.style.marginLeft = 'var(--space-m)';
                element.style.textDecoration = 'none';
            });
        }
    }
}

customElements.define('samovar-footer', SamovarFooter);
