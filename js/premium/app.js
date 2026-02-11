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
