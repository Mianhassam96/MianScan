// Export functionality
const ExportManager = {
    formats: {
        txt: { mime: 'text/plain', ext: 'txt' },
        md: { mime: 'text/markdown', ext: 'md' },
        html: { mime: 'text/html', ext: 'html' },
        json: { mime: 'application/json', ext: 'json' },
        rtf: { mime: 'application/rtf', ext: 'rtf' }
    },
    
    export(format) {
        console.log('Export called with format:', format);
        const text = document.getElementById('mainEditor').value;
        if (!text.trim()) {
            MianScribe.utils.showToast('Nothing to export', 'warning');
            return;
        }
        
        console.log('Exporting text length:', text.length);
        
        switch(format) {
            case 'txt':
                this.exportTXT(text);
                break;
            case 'md':
                this.exportMarkdown(text);
                break;
            case 'html':
                this.exportHTML(text);
                break;
            case 'pdf':
                this.exportPDF(text);
                break;
            case 'docx':
                this.exportDOCX(text);
                break;
            case 'rtf':
                this.exportRTF(text);
                break;
            case 'json':
                this.exportJSON(text);
                break;
            default:
                console.error('Unknown format:', format);
                MianScribe.utils.showToast('Format not supported yet', 'warning');
        }
    },
    
    exportTXT(text) {
        console.log('Exporting as TXT...');
        const filename = `mianscribe-${Date.now()}.txt`;
        MianScribe.utils.downloadFile(text, filename, 'text/plain');
        MianScribe.utils.showToast('Exported as TXT', 'success');
        console.log('✅ TXT export complete');
    },
    
    exportMarkdown(text) {
        const filename = `mianscribe-${Date.now()}.md`;
        MianScribe.utils.downloadFile(text, filename, 'text/markdown');
        MianScribe.utils.showToast('Exported as Markdown', 'success');
    },
    
    exportHTML(text) {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MianScribe Export</title>
    <style>
        body {
            font-family: Georgia, serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div>${text.replace(/\n/g, '<br>')}</div>
</body>
</html>`;
        const filename = `mianscribe-${Date.now()}.html`;
        MianScribe.utils.downloadFile(html, filename, 'text/html');
        MianScribe.utils.showToast('Exported as HTML', 'success');
    },
    
    exportPDF(text) {
        try {
            // Check if jsPDF is available
            if (typeof window.jspdf === 'undefined') {
                MianScribe.utils.showToast('Loading PDF library...', 'info');
                // Fallback: export as HTML instead
                this.exportHTML(text);
                return;
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(16);
            doc.text('MianScribe Document', 20, 20);
            
            // Add date
            doc.setFontSize(10);
            doc.text(new Date().toLocaleDateString(), 20, 30);
            
            // Add content
            doc.setFontSize(12);
            const lines = doc.splitTextToSize(text, 170);
            doc.text(lines, 20, 45);
            
            // Save
            doc.save(`mianscribe-${Date.now()}.pdf`);
            MianScribe.utils.showToast('Exported as PDF', 'success');
        } catch (error) {
            console.error('PDF export error:', error);
            MianScribe.utils.showToast('PDF export failed. Exporting as HTML instead.', 'warning');
            this.exportHTML(text);
        }
    },
    
    exportDOCX(text) {
        // Simple DOCX-like export using HTML with proper formatting
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>MianScribe Document</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            max-width: 8.5in;
            margin: 1in auto;
            padding: 0;
        }
        p { margin: 0 0 12pt 0; }
    </style>
</head>
<body>
    ${text.split('\n\n').map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`).join('')}
</body>
</html>`;
        
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mianscribe-${Date.now()}.doc`;
        a.click();
        URL.revokeObjectURL(url);
        
        MianScribe.utils.showToast('Exported as DOC format', 'success');
    },
    
    exportRTF(text) {
        console.log('Exporting as RTF...');
        
        // Convert text to RTF format
        // RTF header
        let rtfContent = '{\\rtf1\\ansi\\deff0\n';
        
        // Font table
        rtfContent += '{\\fonttbl{\\f0\\fnil\\fcharset0 Times New Roman;}}\n';
        
        // Color table (optional)
        rtfContent += '{\\colortbl;\\red0\\green0\\blue0;}\n';
        
        // Document formatting
        rtfContent += '\\viewkind4\\uc1\\pard\\f0\\fs24\n';
        
        // Convert text content
        // Escape special RTF characters
        let escapedText = text
            .replace(/\\/g, '\\\\')  // Backslash
            .replace(/\{/g, '\\{')   // Left brace
            .replace(/\}/g, '\\}')   // Right brace
            .replace(/\n\n/g, '\\par\\par\n')  // Paragraph breaks
            .replace(/\n/g, '\\line\n');        // Line breaks
        
        rtfContent += escapedText;
        
        // Close RTF document
        rtfContent += '\n}';
        
        const filename = `mianscribe-${Date.now()}.rtf`;
        MianScribe.utils.downloadFile(rtfContent, filename, 'application/rtf');
        MianScribe.utils.showToast('Exported as RTF', 'success');
        console.log('✅ RTF export complete');
    },
    
    exportJSON(text) {
        const stats = MianScribe.getStats(text);
        const data = {
            content: text,
            stats: stats,
            exportedAt: new Date().toISOString(),
            version: MianScribe.version
        };
        const filename = `mianscribe-${Date.now()}.json`;
        MianScribe.utils.downloadFile(JSON.stringify(data, null, 2), filename, 'application/json');
        MianScribe.utils.showToast('Exported as JSON', 'success');
    }
};

// Import functionality
const ImportManager = {
    import(file) {
        console.log('Import started for file:', file.name, file.type, file.size);
        const ext = file.name.split('.').pop().toLowerCase();
        
        // Handle PDF files differently (binary)
        if (ext === 'pdf') {
            this.importPDF(file);
            return;
        }
        
        // Handle DOC/DOCX files
        if (ext === 'doc' || ext === 'docx') {
            this.importDOC(file);
            return;
        }
        
        // Handle text-based files
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const content = e.target.result;
            console.log('File read successfully, extension:', ext, 'content length:', content.length);
            
            switch(ext) {
                case 'txt':
                case 'md':
                    this.importText(content);
                    break;
                case 'html':
                    this.importHTML(content);
                    break;
                case 'json':
                    this.importJSON(content);
                    break;
                case 'rtf':
                    this.importRTF(content);
                    break;
                default:
                    console.error('Unsupported file extension:', ext);
                    MianScribe.utils.showToast('File format not supported', 'warning');
            }
        };
        
        reader.onerror = () => {
            console.error('File read error');
            MianScribe.utils.showToast('Failed to read file', 'danger');
        };
        
        reader.readAsText(file);
    },
    
    importText(content) {
        console.log('Importing text, length:', content.length);
        const editor = document.getElementById('mainEditor');
        if (editor) {
            editor.value = content;
            updateStats();
            MianScribe.utils.showToast('File imported successfully', 'success');
            console.log('✅ Text imported successfully');
        } else {
            console.error('❌ Editor not found');
        }
    },
    
    importHTML(content) {
        // Strip HTML tags
        const temp = document.createElement('div');
        temp.innerHTML = content;
        const text = temp.textContent || temp.innerText;
        this.importText(text);
    },
    
    importJSON(content) {
        try {
            const data = JSON.parse(content);
            if (data.content) {
                this.importText(data.content);
            } else {
                this.importText(content);
            }
        } catch (e) {
            MianScribe.utils.showToast('Invalid JSON file', 'danger');
        }
    },
    
    importRTF(content) {
        console.log('Importing RTF file...');
        
        // Basic RTF to plain text conversion
        // Remove RTF control words and groups
        let text = content;
        
        // Remove RTF header
        text = text.replace(/^\{\\rtf1[^\n]*\n/g, '');
        
        // Remove font table
        text = text.replace(/\{\\fonttbl[^}]*\}/g, '');
        
        // Remove color table
        text = text.replace(/\{\\colortbl[^}]*\}/g, '');
        
        // Remove other control groups
        text = text.replace(/\{\\[^}]*\}/g, '');
        
        // Convert RTF paragraph marks to newlines
        text = text.replace(/\\par\s*/g, '\n\n');
        
        // Convert RTF line breaks to newlines
        text = text.replace(/\\line\s*/g, '\n');
        
        // Remove other RTF control words
        text = text.replace(/\\[a-z]+\d*\s*/gi, '');
        
        // Unescape special characters
        text = text.replace(/\\\\/g, '\\');
        text = text.replace(/\\\{/g, '{');
        text = text.replace(/\\\}/g, '}');
        
        // Remove remaining braces
        text = text.replace(/[\{\}]/g, '');
        
        // Clean up extra whitespace
        text = text.trim();
        
        console.log('RTF converted to text, length:', text.length);
        this.importText(text);
    },
    
    importPDF(file) {
        console.log('Importing PDF file...');
        MianScribe.utils.showToast('Reading PDF file...', 'info');
        
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const typedArray = new Uint8Array(e.target.result);
                
                // Check if pdf.js is loaded
                if (typeof pdfjsLib === 'undefined') {
                    console.error('PDF.js library not loaded');
                    MianScribe.utils.showToast('PDF library not available. Please refresh the page.', 'danger');
                    return;
                }
                
                // Set worker path
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                
                // Load PDF
                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                console.log('PDF loaded, pages:', pdf.numPages);
                
                let fullText = '';
                
                // Extract text from each page
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n\n';
                }
                
                console.log('PDF text extracted, length:', fullText.length);
                this.importText(fullText.trim());
                
            } catch (error) {
                console.error('PDF import error:', error);
                MianScribe.utils.showToast('Failed to read PDF: ' + error.message, 'danger');
            }
        };
        
        reader.onerror = () => {
            console.error('PDF file read error');
            MianScribe.utils.showToast('Failed to read PDF file', 'danger');
        };
        
        reader.readAsArrayBuffer(file);
    },
    
    importDOC(file) {
        console.log('Importing DOC/DOCX file...');
        
        // DOC/DOCX files are complex binary formats
        // For basic support, we'll try to read as text and extract what we can
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                
                // Try to extract text from DOC file (basic approach)
                // This works for simple DOC files but not complex ones
                let text = content;
                
                // Remove binary characters and control codes
                text = text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');
                
                // Remove common DOC markers
                text = text.replace(/\{\\[^}]*\}/g, '');
                
                // Clean up extra whitespace
                text = text.replace(/\s+/g, ' ').trim();
                
                if (text.length > 0) {
                    console.log('DOC text extracted, length:', text.length);
                    this.importText(text);
                } else {
                    MianScribe.utils.showToast('Could not extract text from DOC file. Try saving as RTF or TXT instead.', 'warning');
                }
                
            } catch (error) {
                console.error('DOC import error:', error);
                MianScribe.utils.showToast('Failed to read DOC file. Try saving as RTF or TXT instead.', 'warning');
            }
        };
        
        reader.onerror = () => {
            console.error('DOC file read error');
            MianScribe.utils.showToast('Failed to read DOC file', 'danger');
        };
        
        reader.readAsText(file, 'ISO-8859-1');
    }
};
