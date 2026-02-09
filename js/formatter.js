/**
 * formatter.js - Text Formatting Module
 * Provides text transformation utilities
 */

const TextFormatter = {
    /**
     * Convert text to UPPERCASE
     * @param {string} text - Input text
     * @returns {string} Uppercase text
     */
    toUpperCase(text) {
        return text.toUpperCase();
    },

    /**
     * Convert text to lowercase
     * @param {string} text - Input text
     * @returns {string} Lowercase text
     */
    toLowerCase(text) {
        return text.toLowerCase();
    },

    /**
     * Capitalize Each Word
     * @param {string} text - Input text
     * @returns {string} Capitalized text
     */
    capitalizeWords(text) {
        return text.replace(/\b\w/g, char => char.toUpperCase());
    },

    /**
     * Remove extra spaces
     * @param {string} text - Input text
     * @returns {string} Text without extra spaces
     */
    removeExtraSpaces(text) {
        return text.replace(/\s+/g, ' ').trim();
    },

    /**
     * Remove line breaks
     * @param {string} text - Input text
     * @returns {string} Text without line breaks
     */
    removeLineBreaks(text) {
        return text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
    },

    /**
     * Apply formatting and update textarea
     * @param {Function} formatter - Formatting function
     */
    applyFormatting(formatter) {
        const textarea = document.getElementById('textArea');
        const formatted = formatter(textarea.value);
        textarea.value = formatted;

        // Trigger input event to update stats
        textarea.dispatchEvent(new Event('input'));

        // Save to localStorage
        StorageManager.saveText(formatted);
    }
};
