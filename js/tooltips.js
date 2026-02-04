/**
 * Tooltip System for Complex Words
 * Handles hover (desktop) and tap (mobile) interactions
 */

(function () {
    'use strict';

    // Configuration
    const VIEWPORT_PADDING = 20; // Pixels from edge before repositioning
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    /**
     * Initialize all tooltips on the page
     */
    function initTooltips() {
        const tooltipWords = document.querySelectorAll('.tooltip-word');

        tooltipWords.forEach(word => {
            // Make focusable for accessibility
            if (!word.hasAttribute('tabindex')) {
                word.setAttribute('tabindex', '0');
            }

            // Desktop: hover behavior (already handled by CSS)
            // Mobile: tap behavior
            if (isMobile) {
                word.addEventListener('click', handleMobileClick);
            }

            // Keyboard accessibility
            word.addEventListener('focus', handleFocus);
            word.addEventListener('blur', handleBlur);

            // Position check on hover/show
            word.addEventListener('mouseenter', () => checkPosition(word));
        });

        // Close tooltip when clicking outside (mobile)
        if (isMobile) {
            document.addEventListener('click', handleOutsideClick);
        }
    }

    /**
     * Handle mobile tap to toggle tooltip
     */
    function handleMobileClick(event) {
        event.preventDefault();
        event.stopPropagation();

        const word = event.currentTarget;
        const wasActive = word.classList.contains('active');

        // Close all other tooltips
        closeAllTooltips();

        // Toggle this tooltip
        if (!wasActive) {
            word.classList.add('active');
            checkPosition(word);
        }
    }

    /**
     * Handle clicks outside tooltips (mobile)
     */
    function handleOutsideClick(event) {
        if (!event.target.closest('.tooltip-word')) {
            closeAllTooltips();
        }
    }

    /**
     * Close all active tooltips
     */
    function closeAllTooltips() {
        document.querySelectorAll('.tooltip-word.active').forEach(word => {
            word.classList.remove('active');
        });
    }

    /**
     * Handle keyboard focus
     */
    function handleFocus(event) {
        const word = event.currentTarget;
        checkPosition(word);
    }

    /**
     * Handle keyboard blur
     */
    function handleBlur(event) {
        // Blur is handled by CSS :focus state
    }

    /**
     * Check tooltip position and adjust if it overflows viewport
     */
    function checkPosition(word) {
        const popup = word.querySelector('.tooltip-popup');
        if (!popup) return;

        // Reset alignment classes
        popup.classList.remove('align-left', 'align-right');

        // Wait for next frame to get accurate measurements
        requestAnimationFrame(() => {
            const rect = popup.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            // Check if tooltip overflows left
            if (rect.left < VIEWPORT_PADDING) {
                popup.classList.add('align-left');
            }
            // Check if tooltip overflows right
            else if (rect.right > viewportWidth - VIEWPORT_PADDING) {
                popup.classList.add('align-right');
            }
        });
    }

    /**
     * Helper function to create tooltip markup programmatically
     * Usage: createTooltip('сложное слово', 'svært ord')
     */
    window.createTooltip = function (russianWord, danishExplanation) {
        const span = document.createElement('span');
        span.className = 'tooltip-word';
        span.textContent = russianWord;

        const popup = document.createElement('span');
        popup.className = 'tooltip-popup';
        popup.textContent = danishExplanation;

        span.appendChild(popup);
        return span;
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTooltips);
    } else {
        initTooltips();
    }

    // Re-initialize if new content is added dynamically
    window.reinitTooltips = initTooltips;

})();
