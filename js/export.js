/**
 * export.js - File Import/Export Module
 * Handles file upload, download, and clipboard operations
 */

const FileManager = {
    /**
     * Upload and read .txt file
     */
    uploadFile() {
        const fileInput = document.getElementById('fileInput');
        fileInput.click();

        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.name.endsWith('.txt')) {
                alert('Please upload a .txt file');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const textarea = document.getElementById('textArea');
                textarea.value = event.target.result;
                textarea.dispatchEvent(new Event('input'));
                StorageManager.saveText(textarea.value);
            };
            reader.readAsText(file);
        };
    },

    /**
     * Download text as .txt file
     */
    downloadFile() {
        const textarea = document.getElementById('textArea');
        const text = textarea.value;

        if (!text.trim()) {
            alert('Nothing to download');
            return;
        }

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mianscribe_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Copy text to clipboard
     */
    async copyToClipboard() {
        const textarea = document.getElementById('textArea');
        const text = textarea.value;

        if (!text.trim()) {
            alert('Nothing to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            
            // Visual feedback
            const btn = document.getElementById('copyBtn');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';
            btn.classList.add('btn-success');
            btn.classList.remove('btn-outline-info');

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.classList.remove('btn-success');
                btn.classList.add('btn-outline-info');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
        }
    },

    /**
     * Reset all data
     */
    reset() {
        if (confirm('Are you sure you want to reset everything? This will clear all text and settings.')) {
            document.getElementById('textArea').value = '';
            document.getElementById('charLimit').value = '1000';
            StorageManager.clearAll();
            
            // Update UI
            document.getElementById('textArea').dispatchEvent(new Event('input'));
            
            alert('All data has been reset');
        }
    }
};
