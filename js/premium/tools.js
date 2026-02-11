// Tools configuration and rendering
const TOOLS = {
    transform: [
        { id: 'upper', name: 'UPPERCASE', icon: 'type', desc: 'Convert all text to uppercase', action: 'upper' },
        { id: 'lower', name: 'lowercase', icon: 'type', desc: 'Convert all text to lowercase', action: 'lower' },
        { id: 'title', name: 'Title Case', icon: 'type', desc: 'Capitalize first letter of each word', action: 'title' },
        { id: 'sentence', name: 'Sentence case', icon: 'type', desc: 'Capitalize first letter of sentences', action: 'sentence' },
        { id: 'camel', name: 'camelCase', icon: 'code', desc: 'Convert to camelCase format', action: 'camelCase' },
        { id: 'snake', name: 'snake_case', icon: 'code', desc: 'Convert to snake_case format', action: 'snakeCase' },
        { id: 'kebab', name: 'kebab-case', icon: 'code', desc: 'Convert to kebab-case format', action: 'kebabCase' },
        { id: 'pascal', name: 'PascalCase', icon: 'code', desc: 'Convert to PascalCase format', action: 'pascalCase' },
        { id: 'removeSpaces', name: 'Remove Extra Spaces', icon: 'eraser', desc: 'Remove multiple spaces', action: 'removeSpaces' },
        { id: 'removeBreaks', name: 'Remove Line Breaks', icon: 'text-paragraph', desc: 'Remove all line breaks', action: 'removeBreaks' },
        { id: 'removeEmojis', name: 'Remove Emojis', icon: 'emoji-smile', desc: 'Remove all emoji characters', action: 'removeEmojis' },
        { id: 'reverse', name: 'Reverse Text', icon: 'arrow-left-right', desc: 'Reverse character order', action: 'reverse' },
        { id: 'sortLines', name: 'Sort Lines', icon: 'sort-alpha-down', desc: 'Sort lines alphabetically', action: 'sortLines' },
        { id: 'removeDupes', name: 'Remove Duplicates', icon: 'layers', desc: 'Remove duplicate lines', action: 'removeDuplicates' },
        { id: 'numberLines', name: 'Number Lines', icon: 'list-ol', desc: 'Add line numbers', action: 'numberLines' },
    ],
    
    ai: [
        { id: 'paraphrase', name: 'AI Paraphraser', icon: 'stars', desc: 'Rewrite text in different words' },
        { id: 'summarize', name: 'AI Summarizer', icon: 'stars', desc: 'Create concise summary' },
        { id: 'expand', name: 'AI Expander', icon: 'stars', desc: 'Elaborate and expand text' },
        { id: 'grammar', name: 'Grammar Checker', icon: 'stars', desc: 'Fix grammar and spelling' },
        { id: 'translate', name: 'AI Translator', icon: 'translate', desc: 'Translate to any language' },
        { id: 'tone', name: 'Tone Analyzer', icon: 'emoji-smile', desc: 'Analyze text tone' },
        { id: 'seo', name: 'SEO Optimizer', icon: 'graph-up', desc: 'Optimize for search engines' },
        { id: 'headline', name: 'Headline Generator', icon: 'newspaper', desc: 'Generate catchy headlines' },
    ],
    
    dev: [
        { id: 'regex', name: 'Regex Tester', icon: 'code-slash', desc: 'Test regular expressions' },
        { id: 'jsonFormat', name: 'JSON Formatter', icon: 'braces', desc: 'Format and validate JSON' },
        { id: 'xmlFormat', name: 'XML Formatter', icon: 'code', desc: 'Format and validate XML' },
        { id: 'base64Encode', name: 'Base64 Encode', icon: 'lock', desc: 'Encode text to Base64' },
        { id: 'base64Decode', name: 'Base64 Decode', icon: 'unlock', desc: 'Decode Base64 to text' },
        { id: 'urlEncode', name: 'URL Encode', icon: 'link', desc: 'Encode URL parameters' },
        { id: 'urlDecode', name: 'URL Decode', icon: 'link', desc: 'Decode URL parameters' },
        { id: 'hash', name: 'Hash Generator', icon: 'shield-check', desc: 'Generate MD5/SHA hashes' },
        { id: 'uuid', name: 'UUID Generator', icon: 'key', desc: 'Generate unique IDs' },
        { id: 'lorem', name: 'Lorem Ipsum', icon: 'file-text', desc: 'Generate placeholder text' },
        { id: 'password', name: 'Password Generator', icon: 'shield-lock', desc: 'Generate secure passwords' },
        { id: 'slug', name: 'Slug Generator', icon: 'dash', desc: 'Create URL-friendly slugs' },
    ],
    
    extract: [
        { id: 'emails', name: 'Extract Emails', icon: 'envelope', desc: 'Find all email addresses' },
        { id: 'urls', name: 'Extract URLs', icon: 'link-45deg', desc: 'Find all web links' },
        { id: 'hashtags', name: 'Extract Hashtags', icon: 'hash', desc: 'Find all hashtags' },
        { id: 'mentions', name: 'Extract Mentions', icon: 'at', desc: 'Find all @mentions' },
        { id: 'numbers', name: 'Extract Numbers', icon: '123', desc: 'Find all numbers' },
        { id: 'phones', name: 'Extract Phone Numbers', icon: 'telephone', desc: 'Find phone numbers' },
        { id: 'emojis', name: 'Extract Emojis', icon: 'emoji-smile', desc: 'Find all emojis' },
    ]
};

function renderTools(category, containerId) {
    const container = document.getElementById(containerId);
    const tools = TOOLS[category];
    
    container.innerHTML = tools.map(tool => `
        <div class="col-md-6 col-lg-4">
            <div class="tool-card" data-tool="${tool.id}" data-action="${tool.action || tool.id}">
                <h6>
                    <i class="bi bi-${tool.icon}"></i>
                    ${tool.name}
                </h6>
                <p>${tool.desc}</p>
            </div>
        </div>
    `).join('');
    
    // Add click handlers
    container.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', () => {
            const action = card.dataset.action;
            const toolId = card.dataset.tool;
            executeTool(category, action, toolId);
        });
    });
}

function executeTool(category, action, toolId) {
    const editor = document.getElementById('mainEditor');
    const text = editor.value;
    
    if (!text.trim()) {
        MianScribe.utils.showToast('Please enter some text first', 'warning');
        return;
    }
    
    try {
        let result;
        
        if (category === 'transform') {
            result = MianScribe.transform[action](text);
            editor.value = result;
            updateStats();
            MianScribe.utils.showToast('Text transformed!', 'success');
        }
        else if (category === 'extract') {
            result = MianScribe.extract[action](text);
            showExtractResult(toolId, result);
        }
        else if (category === 'dev') {
            handleDevTool(toolId, text);
        }
        else if (category === 'ai') {
            handleAITool(toolId, text);
        }
    } catch (error) {
        MianScribe.utils.showToast('Error: ' + error.message, 'danger');
    }
}

function showExtractResult(toolId, results) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Extraction Results</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p class="text-muted">Found ${results.length} items:</p>
                    ${results.length > 0 ? `
                        <div class="list-group">
                            ${results.map(item => `<div class="list-group-item">${item}</div>`).join('')}
                        </div>
                    ` : '<p class="text-center text-muted">No items found</p>'}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="MianScribe.utils.copyToClipboard('${results.join('\\n')}')">
                        <i class="bi bi-clipboard"></i> Copy All
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

function handleDevTool(toolId, text) {
    let result;
    
    switch(toolId) {
        case 'jsonFormat':
            try {
                result = JSON.stringify(JSON.parse(text), null, 2);
                document.getElementById('mainEditor').value = result;
                MianScribe.utils.showToast('JSON formatted!', 'success');
            } catch (e) {
                MianScribe.utils.showToast('Invalid JSON', 'danger');
            }
            break;
            
        case 'base64Encode':
            result = btoa(text);
            document.getElementById('mainEditor').value = result;
            MianScribe.utils.showToast('Encoded to Base64', 'success');
            break;
            
        case 'base64Decode':
            try {
                result = atob(text);
                document.getElementById('mainEditor').value = result;
                MianScribe.utils.showToast('Decoded from Base64', 'success');
            } catch (e) {
                MianScribe.utils.showToast('Invalid Base64', 'danger');
            }
            break;
            
        case 'urlEncode':
            result = encodeURIComponent(text);
            document.getElementById('mainEditor').value = result;
            MianScribe.utils.showToast('URL encoded', 'success');
            break;
            
        case 'urlDecode':
            result = decodeURIComponent(text);
            document.getElementById('mainEditor').value = result;
            MianScribe.utils.showToast('URL decoded', 'success');
            break;
            
        case 'uuid':
            result = MianScribe.utils.generateId();
            document.getElementById('mainEditor').value = result;
            MianScribe.utils.showToast('UUID generated', 'success');
            break;
            
        case 'lorem':
            result = generateLoremIpsum();
            document.getElementById('mainEditor').value = result;
            MianScribe.utils.showToast('Lorem ipsum generated', 'success');
            break;
            
        case 'password':
            result = generatePassword();
            document.getElementById('mainEditor').value = result;
            MianScribe.utils.showToast('Password generated', 'success');
            break;
            
        case 'slug':
            result = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            document.getElementById('mainEditor').value = result;
            MianScribe.utils.showToast('Slug generated', 'success');
            break;
            
        case 'regex':
            showRegexTester();
            break;
            
        default:
            MianScribe.utils.showToast('Tool coming soon!', 'info');
    }
    
    updateStats();
}

function generateLoremIpsum() {
    const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    return lorem.repeat(3);
}

function generatePassword(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    return Array.from({length}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function showRegexTester() {
    MianScribe.utils.showToast('Regex tester coming soon!', 'info');
}


function handleAITool(toolId, text) {
    // AI tools are simulated for demo purposes
    MianScribe.utils.showToast('AI feature: ' + toolId + ' - Coming soon with API integration!', 'info');
    
    // For demo, show what each tool would do
    const aiDescriptions = {
        paraphrase: 'This will rewrite your text using AI while maintaining the meaning',
        summarize: 'This will create a concise summary of your text',
        expand: 'This will elaborate and expand your text with more details',
        grammar: 'This will check and fix grammar, spelling, and punctuation',
        translate: 'This will translate your text to any language',
        tone: 'This will analyze the emotional tone of your text',
        seo: 'This will optimize your text for search engines',
        headline: 'This will generate catchy headlines from your text'
    };
    
    setTimeout(() => {
        MianScribe.utils.showToast(aiDescriptions[toolId] || 'AI processing...', 'info');
    }, 500);
}

// ToolsManager for compatibility with app.js
const ToolsManager = {
    getTools(category) {
        return (TOOLS[category] || []).map(tool => ({
            id: tool.id,
            name: tool.name,
            icon: `bi bi-${tool.icon}`,
            description: tool.desc,
            action: tool.action || tool.id
        }));
    },
    
    execute(toolId, text) {
        // Find the tool in all categories
        for (const category in TOOLS) {
            const tool = TOOLS[category].find(t => t.id === toolId);
            if (tool) {
                const action = tool.action || toolId;
                
                if (category === 'transform' && MianScribe.transform[action]) {
                    return MianScribe.transform[action](text);
                }
                else if (category === 'extract' && MianScribe.extract[action]) {
                    const results = MianScribe.extract[action](text);
                    showExtractResult(toolId, results);
                    return null;
                }
                else if (category === 'dev') {
                    handleDevTool(toolId, text);
                    return null;
                }
                else if (category === 'ai') {
                    handleAITool(toolId, text);
                    return null;
                }
            }
        }
        
        MianScribe.utils.showToast('Tool not found', 'warning');
        return null;
    }
};
