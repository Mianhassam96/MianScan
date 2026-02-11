// AI Tools (Mock implementation - integrate with OpenAI/Claude API)
function handleAITool(toolId, text) {
    // Show loading
    MianScribe.utils.showToast('Processing with AI...', 'info');
    
    // Mock AI processing (replace with actual API calls)
    setTimeout(() => {
        let result;
        
        switch(toolId) {
            case 'paraphrase':
                result = mockParaphrase(text);
                break;
            case 'summarize':
                result = mockSummarize(text);
                break;
            case 'expand':
                result = mockExpand(text);
                break;
            case 'grammar':
                result = mockGrammarCheck(text);
                break;
            case 'translate':
                showTranslateModal(text);
                return;
            case 'tone':
                showToneAnalysis(text);
                return;
            default:
                result = text;
        }
        
        document.getElementById('mainEditor').value = result;
        updateStats();
        MianScribe.utils.showToast('AI processing complete!', 'success');
    }, 1500);
}

function mockParaphrase(text) {
    // Simple mock - replace with actual AI API
    return text.replace(/\b(the|a|an)\b/gi, match => {
        const alternatives = { 'the': 'this', 'a': 'one', 'an': 'one' };
        return alternatives[match.toLowerCase()] || match;
    });
}

function mockSummarize(text) {
    // Simple mock - take first 2 sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    return sentences.slice(0, 2).join(' ');
}

function mockExpand(text) {
    // Simple mock - add descriptive words
    return text.replace(/\b(\w+)\b/g, (match, word) => {
        if (word.length > 5 && Math.random() > 0.7) {
            return `${word} (which is significant)`;
        }
        return match;
    });
}

function mockGrammarCheck(text) {
    // Simple mock - fix common issues
    return text
        .replace(/\bi\b/g, 'I')
        .replace(/\s{2,}/g, ' ')
        .replace(/([.!?])\s*([a-z])/g, (m, p, l) => p + ' ' + l.toUpperCase());
}

function showTranslateModal(text) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">AI Translator</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <label class="form-label">Target Language</label>
                    <select class="form-select mb-3" id="targetLang">
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="it">Italian</option>
                        <option value="pt">Portuguese</option>
                        <option value="zh">Chinese</option>
                        <option value="ja">Japanese</option>
                        <option value="ar">Arabic</option>
                    </select>
                    <div id="translationResult" class="alert alert-info d-none"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="performTranslation('${text.replace(/'/g, "\\'")}')">
                        Translate
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
}

function performTranslation(text) {
    const resultDiv = document.getElementById('translationResult');
    resultDiv.classList.remove('d-none');
    resultDiv.textContent = 'Translation: ' + text + ' (translated)';
    MianScribe.utils.showToast('Translation complete!', 'success');
}

function showToneAnalysis(text) {
    const tones = ['Professional', 'Casual', 'Formal', 'Friendly', 'Neutral'];
    const tone = tones[Math.floor(Math.random() * tones.length)];
    const confidence = (Math.random() * 30 + 70).toFixed(1);
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Tone Analysis</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="text-center">
                        <h3 class="text-primary">${tone}</h3>
                        <p class="text-muted">Confidence: ${confidence}%</p>
                        <div class="progress">
                            <div class="progress-bar" style="width: ${confidence}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
}

// API Integration Template (for future use)
async function callAIAPI(prompt, tool) {
    // Example OpenAI integration
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_API_KEY'
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }]
        })
    });
    const data = await response.json();
    return data.choices[0].message.content;
    */
    return 'AI response placeholder';
}
