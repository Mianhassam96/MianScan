// Main application initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('MianScribe Premium initializing...');
    
    // Initialize editor
    const editor = document.getElementById('mainEditor');
    if (!editor) {
        console.error('Main editor not found!');
        return;
    }
    
    // Load saved content
    const savedText = MianScribe.storage.load('currentText') || '';
    editor.value = savedText;
    
    // Load theme
    const savedTheme = MianScribe.storage.load('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) themeIcon.className = 'bi bi-sun-fill';
    }
    
    // Initialize stats
    console.log('Initializing stats...');
    updateStats();
    
    // Render tools
    console.log('Rendering tools...');
    renderTools('transform', 'transformTools');
    renderTools('ai', 'aiTools');
    renderTools('dev', 'devTools');
    renderTools('extract', 'extractTools');
    
    // Initialize command palette
    console.log('Initializing command palette...');
    CommandPalette.init();
    
    // Load documents list
    console.log('Loading documents...');
    loadDocumentsList();
    
    // Event listeners
    editor.addEventListener('input', () => {
        updateStats();
        autoSave();
    });
    
    // Toolbar buttons
    const uploadBtn = document.getElementById('uploadFile');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            console.log('Upload button clicked');
            document.getElementById('fileInput').click();
        });
        console.log('✅ Upload button connected');
    } else {
        console.error('❌ Upload button not found');
    }
    
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                console.log('File selected:', file.name, file.type);
                ImportManager.import(file);
            }
        });
        console.log('✅ File input connected');
    } else {
        console.error('❌ File input not found');
    }
    
    const saveBtn = document.getElementById('saveDoc');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveCurrentDoc);
    }
    
    // Export dropdown
    const exportItems = document.querySelectorAll('[data-format]');
    console.log('Export items found:', exportItems.length);
    exportItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const format = item.dataset.format;
            console.log('Export clicked:', format);
            ExportManager.export(format);
        });
    });
    if (exportItems.length > 0) {
        console.log('✅ Export dropdown connected');
    } else {
        console.error('❌ Export dropdown items not found');
    }
    
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            document.execCommand('undo');
        });
    }
    
    const redoBtn = document.getElementById('redoBtn');
    if (redoBtn) {
        redoBtn.addEventListener('click', () => {
            document.execCommand('redo');
        });
    }
    
    const focusModeBtn = document.getElementById('focusMode');
    if (focusModeBtn) {
        focusModeBtn.addEventListener('click', toggleFocusMode);
    }
    
    // Quick actions
    const quickUpper = document.getElementById('quickUpper');
    const quickLower = document.getElementById('quickLower');
    const quickTitle = document.getElementById('quickTitle');
    const quickSpaces = document.getElementById('quickSpaces');
    const quickCopy = document.getElementById('quickCopy');
    const quickClear = document.getElementById('quickClear');
    
    if (quickUpper) quickUpper.addEventListener('click', () => quickTransform('upper'));
    if (quickLower) quickLower.addEventListener('click', () => quickTransform('lower'));
    if (quickTitle) quickTitle.addEventListener('click', () => quickTransform('title'));
    if (quickSpaces) quickSpaces.addEventListener('click', () => quickTransform('removeSpaces'));
    if (quickCopy) quickCopy.addEventListener('click', copyAllText);
    if (quickClear) quickClear.addEventListener('click', clearAllText);
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Command palette
    const cmdPalette = document.getElementById('cmdPalette');
    if (cmdPalette) {
        cmdPalette.addEventListener('click', () => {
            CommandPalette.show();
        });
    }
    
    // Compare button
    const compareBtn = document.getElementById('compareBtn');
    if (compareBtn) {
        compareBtn.addEventListener('click', () => {
            CompareManager.compare();
        });
    }
    
    // New document button
    const newDocBtn = document.getElementById('newDocBtn');
    if (newDocBtn) {
        newDocBtn.addEventListener('click', newDocument);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+K - Command Palette
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            CommandPalette.show();
        }
        // Ctrl+S - Save
        else if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveCurrentDoc();
        }
        // Ctrl+/ - Focus Mode
        else if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            toggleFocusMode();
        }
        // Escape - Exit Focus Mode
        else if (e.key === 'Escape' && document.body.classList.contains('focus-mode')) {
            toggleFocusMode();
        }
    });
    
    // Auto-save functionality
    let autoSaveTimeout;
    function autoSave() {
        clearTimeout(autoSaveTimeout);
        const status = document.getElementById('autoSaveStatus');
        status.innerHTML = '<i class="bi bi-hourglass-split"></i> Saving...';
        
        autoSaveTimeout = setTimeout(() => {
            MianScribe.storage.save('currentText', editor.value);
            status.innerHTML = '<i class="bi bi-check-circle"></i> Saved';
        }, 1000);
    }
    
    // Welcome message
    if (!savedText) {
        editor.value = `Welcome to MianScribe Premium! 🚀

Your complete text utility platform with 50+ professional tools.

✨ Quick Start:
• Start typing or paste your text
• Explore tools from the left sidebar
• Press Ctrl+K for command palette
• Press Ctrl+/ for focus mode

🔧 Available Tools:
• Text Transformation (15 tools)
• Extraction Tools (7 tools)
• Developer Tools (12 tools)
• AI Features (8 tools)
• Text Comparison
• Export to 6 formats

⌨️ Keyboard Shortcuts:
• Ctrl+K - Command palette
• Ctrl+S - Save document
• Ctrl+/ - Focus mode
• Escape - Exit focus mode

Start typing to see real-time statistics and analysis...`;
        updateStats();
    }
    
    console.log('✅ MianScribe Premium v' + MianScribe.version + ' initialized successfully!');
    console.log('📊 All features ready to use');
});

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.log('Service Worker registration failed'));
}


// Render tools function
function renderTools(category, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }
    
    const tools = ToolsManager.getTools(category);
    container.innerHTML = tools.map(tool => `
        <div class="col-md-6 col-lg-4">
            <div class="tool-card" onclick="executeTool('${tool.id}')">
                <h6>
                    <i class="${tool.icon}"></i>
                    ${tool.name}
                </h6>
                <p>${tool.description}</p>
            </div>
        </div>
    `).join('');
}

// Execute tool function
function executeTool(toolId) {
    const editor = document.getElementById('mainEditor');
    const text = editor.value;
    
    if (!text.trim()) {
        MianScribe.utils.showToast('Please enter some text first', 'warning');
        return;
    }
    
    const result = ToolsManager.execute(toolId, text);
    if (result !== null) {
        editor.value = result;
        updateStats();
        MianScribe.utils.showToast('Tool applied successfully!', 'success');
    }
}

// Quick transform function
function quickTransform(type) {
    const editor = document.getElementById('mainEditor');
    const text = editor.value;
    
    if (!text.trim()) {
        MianScribe.utils.showToast('Please enter some text first', 'warning');
        return;
    }
    
    if (MianScribe.transform[type]) {
        editor.value = MianScribe.transform[type](text);
        updateStats();
        MianScribe.utils.showToast('Text transformed!', 'success');
    }
}

// Copy all text
function copyAllText() {
    const editor = document.getElementById('mainEditor');
    if (editor.value.trim()) {
        MianScribe.utils.copyToClipboard(editor.value);
    } else {
        MianScribe.utils.showToast('Nothing to copy', 'warning');
    }
}

// Clear all text
function clearAllText() {
    if (confirm('Are you sure you want to clear all text?')) {
        const editor = document.getElementById('mainEditor');
        editor.value = '';
        updateStats();
        MianScribe.utils.showToast('Text cleared', 'info');
    }
}

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = isDark ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    }
    MianScribe.storage.save('theme', isDark ? 'dark' : 'light');
}

// Toggle focus mode
function toggleFocusMode() {
    document.body.classList.toggle('focus-mode');
    const isFocus = document.body.classList.contains('focus-mode');
    MianScribe.utils.showToast(isFocus ? 'Focus mode enabled' : 'Focus mode disabled', 'info');
}

// Save current document
function saveCurrentDoc() {
    const editor = document.getElementById('mainEditor');
    const title = prompt('Enter document title:', 'Untitled Document');
    
    if (title) {
        const doc = MianScribe.documents.create(title, editor.value);
        MianScribe.documents.save(doc);
        loadDocumentsList();
        MianScribe.utils.showToast('Document saved!', 'success');
    }
}

// New document
function newDocument() {
    if (confirm('Create a new document? Current text will be saved.')) {
        const editor = document.getElementById('mainEditor');
        MianScribe.storage.save('currentText', editor.value);
        editor.value = '';
        updateStats();
        MianScribe.utils.showToast('New document created', 'success');
    }
}

// Load documents list
function loadDocumentsList() {
    const container = document.getElementById('documentsList');
    if (!container) return;
    
    const docs = MianScribe.documents.getAll();
    
    if (docs.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-folder2-open" style="font-size: 3rem;"></i>
                <p class="mt-3">No documents yet</p>
                <p class="small">Click "New Document" to create one</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = docs.map(doc => `
        <div class="card mb-3">
            <div class="card-body">
                <h6 class="card-title">${doc.title}</h6>
                <p class="card-text small text-muted">
                    ${new Date(doc.updatedAt).toLocaleDateString()}
                </p>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="loadDocument('${doc.id}')">
                        <i class="bi bi-folder-open"></i> Open
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteDocument('${doc.id}')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load document
function loadDocument(id) {
    const docs = MianScribe.documents.getAll();
    const doc = docs.find(d => d.id === id);
    
    if (doc) {
        const editor = document.getElementById('mainEditor');
        editor.value = doc.content;
        updateStats();
        MianScribe.utils.showToast(`Loaded: ${doc.title}`, 'success');
        
        // Switch to editor tab
        const editorTab = document.querySelector('[data-bs-target="#editor-tab"]');
        if (editorTab) editorTab.click();
    }
}

// Delete document
function deleteDocument(id) {
    if (confirm('Are you sure you want to delete this document?')) {
        MianScribe.documents.delete(id);
        loadDocumentsList();
        MianScribe.utils.showToast('Document deleted', 'info');
    }
}
