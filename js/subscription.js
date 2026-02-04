
/**
 * Samovar Subscription System - DISABLED
 * All content is now free.
 */

const SubscriptionSystem = {
    init: function() {
        // Subscription system disabled - everything is free
        console.log('Subscription system disabled: All content is free.');
    },

    hasPremium: function() {
        return true; // Always behave as if premium is active
    },

    checkLessonAccess: function() {
        // No restrictions
    },

    renderPremiumUI: function() {
        // No UI to render
    },
    
    isLessonFree: function() {
        return true;
    }
};

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => {
    SubscriptionSystem.init();
});
