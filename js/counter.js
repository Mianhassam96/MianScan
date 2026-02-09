/**
 * counter.js - Text Statistics Counter Module
 * Calculates real-time text statistics
 */

const TextCounter = {
    /**
     * Count characters with spaces
     * @param {string} text - Input text
     * @returns {number} Character count
     */
    countCharsWithSpaces(text) {
        return text.length;
    },

    /**
     * Count characters without spaces
     * @param {string} text - Input text
     * @returns {number} Character count
     */
    countCharsNoSpaces(text) {
        return text.replace(/\s/g, '').length;
    },

    /**
     * Count words
     * @param {string} text - Input text
     * @returns {number} Word count
     */
    countWords(text) {
        const trimmed = text.trim();
        if (trimmed === '') return 0;
        return trimmed.split(/\s+/).filter(word => word.length > 0).length;
    },

    /**
     * Count sentences
     * @param {string} text - Input text
     * @returns {number} Sentence count
     */
    countSentences(text) {
        if (text.trim() === '') return 0;
        const sentences = text.match(/[.!?]+/g);
        return sentences ? sentences.length : 0;
    },

    /**
     * Count paragraphs
     * @param {string} text - Input text
     * @returns {number} Paragraph count
     */
    countParagraphs(text) {
        if (text.trim() === '') return 0;
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
        return paragraphs.length;
    },

    /**
     * Calculate reading time (200 words per minute)
     * @param {number} wordCount - Number of words
     * @returns {string} Reading time formatted
     */
    calculateReadingTime(wordCount) {
        const minutes = Math.ceil(wordCount / 200);
        return minutes === 0 ? '< 1 min' : `${minutes} min`;
    },

    /**
     * Calculate speaking time (150 words per minute)
     * @param {number} wordCount - Number of words
     * @returns {string} Speaking time formatted
     */
    calculateSpeakingTime(wordCount) {
        const minutes = Math.ceil(wordCount / 150);
        return minutes === 0 ? '< 1 min' : `${minutes} min`;
    },

    /**
     * Update all statistics in the UI
     * @param {string} text - Input text
     */
    updateStats(text) {
        const charWithSpaces = this.countCharsWithSpaces(text);
        const charNoSpaces = this.countCharsNoSpaces(text);
        const words = this.countWords(text);
        const sentences = this.countSentences(text);
        const paragraphs = this.countParagraphs(text);
        const readingTime = this.calculateReadingTime(words);
        const speakingTime = this.calculateSpeakingTime(words);

        // Update DOM elements
        document.getElementById('charWithSpaces').textContent = charWithSpaces;
        document.getElementById('charNoSpaces').textContent = charNoSpaces;
        document.getElementById('wordCount').textContent = words;
        document.getElementById('sentenceCount').textContent = sentences;
        document.getElementById('paragraphCount').textContent = paragraphs;
        document.getElementById('readingTime').textContent = readingTime;
        document.getElementById('speakingTime').textContent = speakingTime;

        // Update progress bar
        this.updateProgressBar(charWithSpaces);
    },

    /**
     * Update progress bar based on character limit
     * @param {number} currentChars - Current character count
     */
    updateProgressBar(currentChars) {
        const limit = parseInt(document.getElementById('charLimit').value, 10);
        const percentage = Math.min((currentChars / limit) * 100, 100);
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');

        progressBar.style.width = percentage + '%';
        progressText.textContent = `${currentChars} / ${limit}`;

        // Change color based on percentage
        progressBar.className = 'progress-bar';
        if (percentage >= 100) {
            progressBar.classList.add('bg-danger');
        } else if (percentage >= 80) {
            progressBar.classList.add('bg-warning');
        }
    }
};
