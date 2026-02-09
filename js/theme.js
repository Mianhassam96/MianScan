/**
 * theme.js - Theme Management Module
 * Handles dark/light mode toggle
 */

const ThemeManager = {
    currentTheme: 'light',

    /**
     * Initialize theme from localStorage
     */
    init() {
        this.currentTheme = StorageManager.loadTheme();
        this.applyTheme(this.currentTheme);
        this.updateIcon();
    },

    /**
     * Toggle between light and dark theme
     */
    toggle() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        this.updateIcon();
        StorageManager.saveTheme(this.currentTheme);
    },

    /**
     * Apply theme to document
     * @param {string} theme - 'light' or 'dark'
     */
    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    },

    /**
     * Update theme toggle button icon
     */
    updateIcon() {
        const icon = document.querySelector('#themeToggle i');
        if (this.currentTheme === 'dark') {
            icon.className = 'bi bi-sun-fill';
        } else {
            icon.className = 'bi bi-moon-fill';
        }
    }
};
