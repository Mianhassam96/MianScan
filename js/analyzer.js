/**
 * analyzer.js - Text Analysis Module
 * Provides advanced text analysis features
 */

const TextAnalyzer = {
    /**
     * Detect long sentences (>20 words)
     * @param {string} text - Input text
     * @returns {number} Count of long sentences
     */
    detectLongSentences(text) {
        if (text.trim() === '') return 0;
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        let longCount = 0;

        sentences.forEach(sentence => {
            const words = sentence.trim().split(/\s+/).filter(w => w.length > 0);
            if (words.length > 20) {
                longCount++;
            }
        });

        return longCount;
    },

    /**
     * Detect extra spaces
     * @param {string} text - Input text
     * @returns {number} Count of extra space instances
     */
    detectExtraSpaces(text) {
        const matches = text.match(/\s{2,}/g);
        return matches ? matches.length : 0;
    },

    /**
     * Detect passive voice (basic regex-based)
     * @param {string} text - Input text
     * @returns {number} Count of passive voice instances
     */
    detectPassiveVoice(text) {
        // Common passive voice patterns
        const patterns = [
            /\b(am|is|are|was|were|be|been|being)\s+\w+ed\b/gi,
            /\b(am|is|are|was|were|be|been|being)\s+\w+en\b/gi
        ];

        let count = 0;
        patterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) count += matches.length;
        });

        return count;
    },

    /**
     * Get most repeated words (top 5)
     * @param {string} text - Input text
     * @returns {Array} Array of {word, count} objects
     */
    getMostRepeatedWords(text) {
        if (text.trim() === '') return [];

        // Remove punctuation and convert to lowercase
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3); // Ignore short words

        // Count word frequency
        const frequency = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        // Sort by frequency and get top 5
        return Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word, count]) => ({ word, count }));
    },

    /**
     * Calculate keyword density
     * @param {string} text - Input text
     * @param {string} keyword - Keyword to search
     * @returns {Object} Density information
     */
    calculateKeywordDensity(text, keyword) {
        if (!keyword || text.trim() === '') {
            return { count: 0, density: 0 };
        }

        const lowerText = text.toLowerCase();
        const lowerKeyword = keyword.toLowerCase().trim();
        const totalWords = text.trim().split(/\s+/).length;

        // Count keyword occurrences
        const regex = new RegExp(`\\b${lowerKeyword}\\b`, 'gi');
        const matches = lowerText.match(regex);
        const count = matches ? matches.length : 0;

        // Calculate density percentage
        const density = totalWords > 0 ? ((count / totalWords) * 100).toFixed(2) : 0;

        return { count, density };
    },

    /**
     * Update all analysis in the UI
     * @param {string} text - Input text
     */
    updateAnalysis(text) {
        // Update long sentences
        const longSentences = this.detectLongSentences(text);
        document.getElementById('longSentences').textContent = longSentences;

        // Update extra spaces
        const extraSpaces = this.detectExtraSpaces(text);
        document.getElementById('extraSpaces').textContent = extraSpaces;

        // Update passive voice
        const passiveVoice = this.detectPassiveVoice(text);
        document.getElementById('passiveVoice').textContent = passiveVoice;

        // Update repeated words
        const repeatedWords = this.getMostRepeatedWords(text);
        const repeatedWordsDiv = document.getElementById('repeatedWords');

        if (repeatedWords.length === 0) {
            repeatedWordsDiv.innerHTML = '<small class="text-muted">No repeated words found</small>';
        } else {
            repeatedWordsDiv.innerHTML = repeatedWords.map(({ word, count }) => `
                <div class="word-item">
                    <span>${word}</span>
                    <span class="badge bg-primary">${count}</span>
                </div>
            `).join('');
        }
    }
};
