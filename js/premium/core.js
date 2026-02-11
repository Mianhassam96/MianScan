// Core functionality and utilities
const MianScribe = {
    version: '2.0.0',
    
    // Text statistics
    getStats(text) {
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        const charsNoSpaces = text.replace(/\s/g, '').length;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).length;
        const readingTime = Math.ceil(words / 200);
        const speakingTime = Math.ceil(words / 130);
        
        return { words, chars, charsNoSpaces, sentences, paragraphs, readingTime, speakingTime };
    },
    
    // Readability scores
    getReadability(text) {
        const stats = this.getStats(text);
        if (stats.words === 0) return { score: 0, grade: 'N/A' };
        
        const avgWordsPerSentence = stats.words / stats.sentences;
        const avgSyllablesPerWord = this.countSyllables(text) / stats.words;
        
        // Flesch Reading Ease
        const flesch = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
        
        let grade;
        if (flesch >= 90) grade = 'Very Easy';
        else if (flesch >= 80) grade = 'Easy';
        else if (flesch >= 70) grade = 'Fairly Easy';
        else if (flesch >= 60) grade = 'Standard';
        else if (flesch >= 50) grade = 'Fairly Difficult';
        else if (flesch >= 30) grade = 'Difficult';
        else grade = 'Very Difficult';
        
        return { score: Math.max(0, Math.min(100, flesch)).toFixed(1), grade };
    },
    
    countSyllables(text) {
        const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
        return words.reduce((count, word) => {
            word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
            const syllables = word.match(/[aeiouy]{1,2}/g);
            return count + (syllables ? syllables.length : 1);
        }, 0);
    },
    
    // Text transformations
    transform: {
        upper: text => text.toUpperCase(),
        lower: text => text.toLowerCase(),
        title: text => text.replace(/\b\w/g, l => l.toUpperCase()),
        sentence: text => text.replace(/(^\w|\.\s+\w)/g, l => l.toUpperCase()),
        camelCase: text => text.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (m, i) => 
            i === 0 ? m.toLowerCase() : m.toUpperCase()).replace(/\s+/g, ''),
        snakeCase: text => text.toLowerCase().replace(/\s+/g, '_'),
        kebabCase: text => text.toLowerCase().replace(/\s+/g, '-'),
        pascalCase: text => text.replace(/(?:^\w|[A-Z]|\b\w)/g, m => m.toUpperCase()).replace(/\s+/g, ''),
        removeSpaces: text => text.replace(/\s+/g, ' ').trim(),
        removeBreaks: text => text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim(),
        removeEmojis: text => text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, ''),
        reverse: text => text.split('').reverse().join(''),
        sortLines: text => text.split('\n').sort().join('\n'),
        removeDuplicates: text => [...new Set(text.split('\n'))].join('\n'),
        numberLines: text => text.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n'),
    },
    
    // Extraction tools
    extract: {
        emails: text => text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [],
        urls: text => text.match(/https?:\/\/[^\s]+/g) || [],
        hashtags: text => text.match(/#\w+/g) || [],
        mentions: text => text.match(/@\w+/g) || [],
        numbers: text => text.match(/\d+/g) || [],
        phones: text => text.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g) || [],
        emojis: text => text.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || [],
    },
    
    // Storage
    storage: {
        save(key, value) {
            localStorage.setItem(`mianscribe_${key}`, JSON.stringify(value));
        },
        load(key) {
            const item = localStorage.getItem(`mianscribe_${key}`);
            return item ? JSON.parse(item) : null;
        },
        remove(key) {
            localStorage.removeItem(`mianscribe_${key}`);
        }
    },
    
    // Documents
    documents: {
        getAll() {
            return MianScribe.storage.load('documents') || [];
        },
        save(doc) {
            const docs = this.getAll();
            const index = docs.findIndex(d => d.id === doc.id);
            if (index >= 0) {
                docs[index] = doc;
            } else {
                docs.push(doc);
            }
            MianScribe.storage.save('documents', docs);
        },
        delete(id) {
            const docs = this.getAll().filter(d => d.id !== id);
            MianScribe.storage.save('documents', docs);
        },
        create(title, content) {
            return {
                id: Date.now().toString(),
                title: title || 'Untitled Document',
                content: content || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        }
    },
    
    // Utilities
    utils: {
        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Copied to clipboard!', 'success');
            });
        },
        showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
            toast.style.zIndex = '9999';
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        },
        downloadFile(content, filename, type = 'text/plain') {
            const blob = new Blob([content], { type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        },
        generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }
    }
};

// Initialize stats update
function updateStats() {
    const editor = document.getElementById('mainEditor');
    if (!editor) {
        console.error('Editor element not found');
        return;
    }
    
    const text = editor.value;
    const stats = MianScribe.getStats(text);
    const readability = MianScribe.getReadability(text);
    
    // Update footer
    const footerWords = document.getElementById('footerWords');
    const footerChars = document.getElementById('footerChars');
    const footerReadTime = document.getElementById('footerReadTime');
    
    if (footerWords) footerWords.textContent = stats.words;
    if (footerChars) footerChars.textContent = stats.chars;
    if (footerReadTime) footerReadTime.textContent = stats.readingTime;
    
    // Update sidebar
    const statWords = document.getElementById('statWords');
    const statChars = document.getElementById('statChars');
    const statSentences = document.getElementById('statSentences');
    const statParagraphs = document.getElementById('statParagraphs');
    const statReadTime = document.getElementById('statReadTime');
    const statSpeakTime = document.getElementById('statSpeakTime');
    
    if (statWords) statWords.textContent = stats.words;
    if (statChars) statChars.textContent = stats.chars;
    if (statSentences) statSentences.textContent = stats.sentences;
    if (statParagraphs) statParagraphs.textContent = stats.paragraphs;
    if (statReadTime) statReadTime.textContent = stats.readingTime + ' min';
    if (statSpeakTime) statSpeakTime.textContent = stats.speakingTime + ' min';
    
    // Update readability
    const badge = document.getElementById('readabilityBadge');
    if (badge) {
        badge.textContent = `Readability: ${readability.grade}`;
        badge.className = 'badge';
        if (readability.score >= 70) badge.classList.add('readability-excellent');
        else if (readability.score >= 60) badge.classList.add('readability-good');
        else if (readability.score >= 50) badge.classList.add('readability-fair');
        else badge.classList.add('readability-poor');
    }
    
    // Update analysis
    updateAnalysis(text);
}

function updateAnalysis(text) {
    const panel = document.getElementById('analysisPanel');
    if (!panel) {
        console.error('Analysis panel not found');
        return;
    }
    
    const longSentences = text.split(/[.!?]+/).filter(s => s.trim().split(/\s+/).length > 20).length;
    const extraSpaces = (text.match(/\s{2,}/g) || []).length;
    const passiveVoice = (text.match(/\b(am|is|are|was|were|be|been|being)\s+\w+ed\b/gi) || []).length;
    
    panel.innerHTML = `
        <div class="analysis-item mb-2">
            <span class="badge bg-warning">${longSentences}</span>
            <small class="ms-2">Long sentences</small>
        </div>
        <div class="analysis-item mb-2">
            <span class="badge bg-info">${extraSpaces}</span>
            <small class="ms-2">Extra spaces</small>
        </div>
        <div class="analysis-item">
            <span class="badge bg-secondary">${passiveVoice}</span>
            <small class="ms-2">Passive voice</small>
        </div>
    `;
}
