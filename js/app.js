/**
 * app.js - Main Application Module
 * Initializes and coordinates all modules
 */

// Auto-resize textarea
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('textArea');
    const charLimitInput = document.getElementById('charLimit');
    const keywordInput = document.getElementById('keywordInput');

    // Load saved data
    textarea.value = StorageManager.loadText();
    charLimitInput.value = StorageManager.loadCharLimit();

    // Initialize modules
    ThemeManager.init();
    SpeechManager.init();

    // Initial stats update
    TextCounter.updateStats(textarea.value);
    TextAnalyzer.updateAnalysis(textarea.value);
    autoResize(textarea);

    // Text area input event
    textarea.addEventListener('input', () => {
        const text = textarea.value;
        TextCounter.updateStats(text);
        TextAnalyzer.updateAnalysis(text);
        StorageManager.saveText(text);
        autoResize(textarea);
    });

    // Character limit change
    charLimitInput.addEventListener('input', () => {
        const limit = parseInt(charLimitInput.value, 10);
        StorageManager.saveCharLimit(limit);
        TextCounter.updateProgressBar(textarea.value.length);
    });

    // Keyword density
    keywordInput.addEventListener('input', () => {
        const keyword = keywordInput.value;
        const result = TextAnalyzer.calculateKeywordDensity(textarea.value, keyword);
        const resultDiv = document.getElementById('keywordDensity');

        if (keyword.trim() === '') {
            resultDiv.innerHTML = '<small class="text-muted">Enter a keyword to check density</small>';
        } else {
            resultDiv.innerHTML = `
                <strong>"${keyword}"</strong> appears <strong>${result.count}</strong> times
                <br>Density: <strong>${result.density}%</strong>
            `;
        }
    });

    // Formatting buttons
    document.getElementById('upperBtn').addEventListener('click', () => {
        TextFormatter.applyFormatting(TextFormatter.toUpperCase);
    });

    document.getElementById('lowerBtn').addEventListener('click', () => {
        TextFormatter.applyFormatting(TextFormatter.toLowerCase);
    });

    document.getElementById('capitalizeBtn').addEventListener('click', () => {
        TextFormatter.applyFormatting(TextFormatter.capitalizeWords);
    });

    document.getElementById('removeSpacesBtn').addEventListener('click', () => {
        TextFormatter.applyFormatting(TextFormatter.removeExtraSpaces);
    });

    document.getElementById('removeBreaksBtn').addEventListener('click', () => {
        TextFormatter.applyFormatting(TextFormatter.removeLineBreaks);
    });

    // File operations
    document.getElementById('uploadBtn').addEventListener('click', () => {
        FileManager.uploadFile();
    });

    document.getElementById('downloadBtn').addEventListener('click', () => {
        FileManager.downloadFile();
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        FileManager.copyToClipboard();
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        FileManager.reset();
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
        ThemeManager.toggle();
    });

    // Speech recognition
    document.getElementById('speechBtn').addEventListener('click', () => {
        SpeechManager.toggle();
    });

    document.getElementById('languageSelect').addEventListener('change', (e) => {
        SpeechManager.changeLanguage(e.target.value);
    });

    // Keyboard shortcuts
    textarea.addEventListener('keydown', (e) => {
        // Ctrl+U - UPPERCASE
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            TextFormatter.applyFormatting(TextFormatter.toUpperCase);
        }
        // Ctrl+L - lowercase
        else if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            TextFormatter.applyFormatting(TextFormatter.toLowerCase);
        }
        // Ctrl+Shift+C - Capitalize
        else if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            TextFormatter.applyFormatting(TextFormatter.capitalizeWords);
        }
        // Ctrl+Shift+S - Remove Spaces
        else if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            TextFormatter.applyFormatting(TextFormatter.removeExtraSpaces);
        }
    });

    // Auto-save every 5 seconds
    setInterval(() => {
        StorageManager.saveText(textarea.value);
    }, 5000);
});
