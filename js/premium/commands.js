// Command Palette
const CommandPalette = {
    commands: [
        { id: 'save', name: 'Save Document', icon: 'save', action: () => saveCurrentDoc() },
        { id: 'export-txt', name: 'Export as TXT', icon: 'download', action: () => ExportManager.export('txt') },
        { id: 'export-pdf', name: 'Export as PDF', icon: 'file-pdf', action: () => ExportManager.export('pdf') },
        { id: 'export-html', name: 'Export as HTML', icon: 'file-code', action: () => ExportManager.export('html') },
        { id: 'upper', name: 'Convert to UPPERCASE', icon: 'type', action: () => quickTransform('upper') },
        { id: 'lower', name: 'Convert to lowercase', icon: 'type', action: () => quickTransform('lower') },
        { id: 'title', name: 'Convert to Title Case', icon: 'type', action: () => quickTransform('title') },
        { id: 'camel', name: 'Convert to camelCase', icon: 'code', action: () => quickTransform('camelCase') },
        { id: 'snake', name: 'Convert to snake_case', icon: 'code', action: () => quickTransform('snakeCase') },
        { id: 'kebab', name: 'Convert to kebab-case', icon: 'code', action: () => quickTransform('kebabCase') },
        { id: 'copy', name: 'Copy All Text', icon: 'clipboard', action: () => copyAllText() },
        { id: 'clear', name: 'Clear All Text', icon: 'trash', action: () => clearAllText() },
        { id: 'focus', name: 'Toggle Focus Mode', icon: 'fullscreen', action: () => toggleFocusMode() },
        { id: 'theme', name: 'Toggle Dark Mode', icon: 'moon', action: () => toggleTheme() },
        { id: 'stats', name: 'Show Statistics', icon: 'bar-chart', action: () => showStatsModal() },
        { id: 'new', name: 'New Document', icon: 'file-plus', action: () => newDocument() },
    ],
    
    init() {
        const searchInput = document.getElementById('commandSearch');
        const commandList = document.getElementById('commandList');
        
        searchInput.addEventListener('input', (e) => {
            this.filter(e.target.value, commandList);
        });
        
        this.render(commandList);
    },
    
    render(container, commands = this.commands) {
        container.innerHTML = commands.map(cmd => `
            <div class="command-item" data-command="${cmd.id}">
                <i class="bi bi-${cmd.icon} me-2"></i>
                ${cmd.name}
            </div>
        `).join('');
        
        container.querySelectorAll('.command-item').forEach(item => {
            item.addEventListener('click', () => {
                const cmd = this.commands.find(c => c.id === item.dataset.command);
                if (cmd) {
                    cmd.action();
                    bootstrap.Modal.getInstance(document.getElementById('commandPaletteModal')).hide();
                }
            });
        });
    },
    
    filter(query, container) {
        const filtered = this.commands.filter(cmd => 
            cmd.name.toLowerCase().includes(query.toLowerCase())
        );
        this.render(container, filtered);
    },
    
    show() {
        const modal = new bootstrap.Modal(document.getElementById('commandPaletteModal'));
        modal.show();
        setTimeout(() => {
            document.getElementById('commandSearch').focus();
        }, 100);
    }
};

// Command actions
function quickTransform(action) {
    const editor = document.getElementById('mainEditor');
    editor.value = MianScribe.transform[action](editor.value);
    updateStats();
    MianScribe.utils.showToast('Text transformed', 'success');
}

function copyAllText() {
    const text = document.getElementById('mainEditor').value;
    MianScribe.utils.copyToClipboard(text);
}

function clearAllText() {
    if (confirm('Are you sure you want to clear all text?')) {
        document.getElementById('mainEditor').value = '';
        updateStats();
        MianScribe.utils.showToast('Text cleared', 'success');
    }
}

function toggleFocusMode() {
    document.body.classList.toggle('focus-mode');
    const isFocus = document.body.classList.contains('focus-mode');
    MianScribe.utils.showToast(isFocus ? 'Focus mode enabled' : 'Focus mode disabled', 'info');
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    MianScribe.storage.save('theme', isDark ? 'dark' : 'light');
    
    const icon = document.querySelector('#themeToggle i');
    icon.className = isDark ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
}

function showStatsModal() {
    const text = document.getElementById('mainEditor').value;
    const stats = MianScribe.getStats(text);
    const readability = MianScribe.getReadability(text);
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Document Statistics</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <table class="table">
                        <tr><td>Words</td><td><strong>${stats.words}</strong></td></tr>
                        <tr><td>Characters</td><td><strong>${stats.chars}</strong></td></tr>
                        <tr><td>Characters (no spaces)</td><td><strong>${stats.charsNoSpaces}</strong></td></tr>
                        <tr><td>Sentences</td><td><strong>${stats.sentences}</strong></td></tr>
                        <tr><td>Paragraphs</td><td><strong>${stats.paragraphs}</strong></td></tr>
                        <tr><td>Reading Time</td><td><strong>${stats.readingTime} min</strong></td></tr>
                        <tr><td>Speaking Time</td><td><strong>${stats.speakingTime} min</strong></td></tr>
                        <tr><td>Readability</td><td><strong>${readability.grade}</strong></td></tr>
                    </table>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
}

function newDocument() {
    if (confirm('Create a new document? Unsaved changes will be lost.')) {
        document.getElementById('mainEditor').value = '';
        updateStats();
        MianScribe.utils.showToast('New document created', 'success');
    }
}

function saveCurrentDoc() {
    const text = document.getElementById('mainEditor').value;
    const title = prompt('Enter document title:', 'Untitled');
    if (title) {
        const doc = MianScribe.documents.create(title, text);
        MianScribe.documents.save(doc);
        MianScribe.utils.showToast('Document saved', 'success');
        loadDocumentsList();
    }
}

function loadDocumentsList() {
    const docs = MianScribe.documents.getAll();
    const container = document.getElementById('documentsList');
    
    if (docs.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">No documents yet</p>';
        return;
    }
    
    container.innerHTML = docs.map(doc => `
        <div class="card mb-2">
            <div class="card-body">
                <h6>${doc.title}</h6>
                <small class="text-muted">${new Date(doc.updatedAt).toLocaleDateString()}</small>
                <div class="mt-2">
                    <button class="btn btn-sm btn-primary" onclick="loadDocument('${doc.id}')">Open</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteDocument('${doc.id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function loadDocument(id) {
    const docs = MianScribe.documents.getAll();
    const doc = docs.find(d => d.id === id);
    if (doc) {
        document.getElementById('mainEditor').value = doc.content;
        updateStats();
        MianScribe.utils.showToast('Document loaded', 'success');
    }
}

function deleteDocument(id) {
    if (confirm('Delete this document?')) {
        MianScribe.documents.delete(id);
        loadDocumentsList();
        MianScribe.utils.showToast('Document deleted', 'success');
    }
}
