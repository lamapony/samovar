/**
 * AI Provider Module for Samovar
 * Claude API integration via Netlify Proxy
 */

// API calls are proxied through Netlify Functions for security
// The actual API key is stored in Netlify environment variables
const CLAUDE_API_URL = '/api/claude-proxy';

/**
 * Call Claude API via secure proxy
 * @param {Array} messages - Array of {role, content} objects
 * @param {string} systemPrompt - Optional system prompt
 * @param {number} maxTokens - Max tokens to generate
 * @returns {Promise<string>} - The generated text response
 */
async function callClaudeAPI(messages, systemPrompt = '', maxTokens = 250) {
    // Format messages for Claude
    const validMessages = messages.filter(m => m.role !== 'system');

    try {
        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                messages: validMessages,
                system: systemPrompt,
                max_tokens: maxTokens
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Claude API Error:', response.status, errorData);

            if (response.status === 429) throw new Error('Rate limited. Please wait a moment.');
            if (response.status === 500) throw new Error('API not configured');
            throw new Error(errorData.error || `API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.content[0].text;
    } catch (error) {
        console.error('Call to Claude failed:', error);
        throw error;
    }
}

// Export for ES modules
export { callClaudeAPI, CLAUDE_API_URL };

// Also make available globally for backward compatibility
if (typeof window !== 'undefined') {
    window.callClaudeAPI = callClaudeAPI;
}
