/**
 * storage.js - LocalStorage Management Module
 * Handles auto-save and restore functionality
 */

const StorageManager = {
    // Keys for localStorage
    KEYS: {
        TEXT: 'mianscribe_text',
        THEME: 'mianscribe_theme',
        CHAR_LIMIT: 'mianscribe_char_limit',
        LANGUAGE: 'mianscribe_language'
    },

    /**
     * Save text to localStorage
     * @param {string} text - Text to save
     */
    saveText(text) {
        try {
            localStorage.setItem(this.KEYS.TEXT, text);
        } catch (e) {
            console.error('Failed to save text:', e);
        }
    },

    /**
     * Load text from localStorage
     * @returns {string} Saved text or empty string
     */
    loadText() {
        try {
            return localStorage.getItem(this.KEYS.TEXT) || '';
        } catch (e) {
            console.error('Failed to load text:', e);
            return '';
        }
    },

    /**
     * Save theme preference
     * @param {string} theme - 'light' or 'dark'
     */
    saveTheme(theme) {
        try {
            localStorage.setItem(this.KEYS.THEME, theme);
        } catch (e) {
            console.error('Failed to save theme:', e);
        }
    },

    /**
     * Load theme preference
     * @returns {string} Saved theme or 'light'
     */
    loadTheme() {
        try {
            return localStorage.getItem(this.KEYS.THEME) || 'light';
        } catch (e) {
            console.error('Failed to load theme:', e);
            return 'light';
        }
    },

    /**
     * Save character limit
     * @param {number} limit - Character limit value
     */
    saveCharLimit(limit) {
        try {
            localStorage.setItem(this.KEYS.CHAR_LIMIT, limit.toString());
        } catch (e) {
            console.error('Failed to save char limit:', e);
        }
    },

    /**
     * Load character limit
     * @returns {number} Saved limit or 1000
     */
    loadCharLimit() {
        try {
            const limit = localStorage.getItem(this.KEYS.CHAR_LIMIT);
            return limit ? parseInt(limit, 10) : 1000;
        } catch (e) {
            console.error('Failed to load char limit:', e);
            return 1000;
        }
    },

    /**
     * Save language preference
     * @param {string} language - Language code
     */
    saveLanguage(language) {
        try {
            localStorage.setItem(this.KEYS.LANGUAGE, language);
        } catch (e) {
            console.error('Failed to save language:', e);
        }
    },

    /**
     * Load language preference
     * @returns {string} Saved language or 'en-US'
     */
    loadLanguage() {
        try {
            return localStorage.getItem(this.KEYS.LANGUAGE) || 'en-US';
        } catch (e) {
            console.error('Failed to load language:', e);
            return 'en-US';
        }
    },

    /**
     * Clear all stored data
     */
    clearAll() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (e) {
            console.error('Failed to clear storage:', e);
        }
    }
};
