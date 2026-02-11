// Text comparison and diff tool
const CompareManager = {
    compare() {
        const text1 = document.getElementById('compareText1').value;
        const text2 = document.getElementById('compareText2').value;
        
        if (!text1.trim() || !text2.trim()) {
            MianScribe.utils.showToast('Please enter text in both fields', 'warning');
            return;
        }
        
        const diff = this.computeDiff(text1, text2);
        this.displayDiff(diff);
    },
    
    computeDiff(text1, text2) {
        // Simple word-by-word diff
        const words1 = text1.split(/\s+/);
        const words2 = text2.split(/\s+/);
        const result = [];
        
        const maxLen = Math.max(words1.length, words2.length);
        
        for (let i = 0; i < maxLen; i++) {
            const word1 = words1[i] || '';
            const word2 = words2[i] || '';
            
            if (word1 === word2) {
                result.push({ type: 'equal', value: word1 });
            } else {
                if (word1) result.push({ type: 'removed', value: word1 });
                if (word2) result.push({ type: 'added', value: word2 });
            }
        }
        
        return result;
    },
    
    displayDiff(diff) {
        const resultDiv = document.getElementById('compareResult');
        
        const html = diff.map(item => {
            if (item.type === 'equal') {
                return `<span>${item.value}</span>`;
            } else if (item.type === 'removed') {
                return `<span class="diff-removed">${item.value}</span>`;
            } else if (item.type === 'added') {
                return `<span class="diff-added">${item.value}</span>`;
            }
        }).join(' ');
        
        resultDiv.innerHTML = `
            <div class="mb-3">
                <h6>Comparison Result</h6>
                <div class="d-flex gap-3 mb-2">
                    <span><span class="diff-removed">Removed</span></span>
                    <span><span class="diff-added">Added</span></span>
                </div>
            </div>
            <div class="p-3 bg-light rounded">${html}</div>
        `;
        
        MianScribe.utils.showToast('Comparison complete', 'success');
    },
    
    // Advanced diff using Levenshtein distance
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    },
    
    similarity(text1, text2) {
        const distance = this.levenshteinDistance(text1, text2);
        const maxLen = Math.max(text1.length, text2.length);
        return ((maxLen - distance) / maxLen * 100).toFixed(2);
    }
};
