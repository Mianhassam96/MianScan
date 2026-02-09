/**
 * speech.js - Speech Recognition Module
 * Handles speech-to-text functionality
 */

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const SpeechManager = {
    recognition: null,
    isRecording: false,

    /**
     * Initialize speech recognition
     */
    init() {
        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported');
            document.getElementById('speechBtn').disabled = true;
            document.getElementById('speechStatus').textContent = 'Not Supported';
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;

        // Set initial language
        const savedLang = StorageManager.loadLanguage();
        this.recognition.lang = savedLang;
        document.getElementById('languageSelect').value = savedLang;

        this.setupEventListeners();
    },

    /**
     * Setup event listeners for speech recognition
     */
    setupEventListeners() {
        const textarea = document.getElementById('textArea');
        const statusBadge = document.getElementById('speechStatus');

        this.recognition.onstart = () => {
            statusBadge.textContent = 'Listening...';
            statusBadge.className = 'badge bg-danger recording';
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            if (finalTranscript) {
                textarea.value += finalTranscript;
                textarea.dispatchEvent(new Event('input'));
                StorageManager.saveText(textarea.value);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            statusBadge.textContent = 'Error: ' + event.error;
            statusBadge.className = 'badge bg-danger';
            this.isRecording = false;
            this.updateButton();
        };

        this.recognition.onend = () => {
            if (this.isRecording) {
                this.recognition.start(); // Restart if still recording
            } else {
                statusBadge.textContent = 'Ready';
                statusBadge.className = 'badge bg-secondary';
            }
        };
    },

    /**
     * Toggle speech recognition
     */
    toggle() {
        if (!this.recognition) return;

        if (this.isRecording) {
            this.stop();
        } else {
            this.start();
        }
    },

    /**
     * Start speech recognition
     */
    start() {
        try {
            this.recognition.start();
            this.isRecording = true;
            this.updateButton();
        } catch (e) {
            console.error('Failed to start recognition:', e);
        }
    },

    /**
     * Stop speech recognition
     */
    stop() {
        this.recognition.stop();
        this.isRecording = false;
        this.updateButton();
    },

    /**
     * Update button text and icon
     */
    updateButton() {
        const btn = document.getElementById('speechBtn');
        if (this.isRecording) {
            btn.innerHTML = '<i class="bi bi-stop-fill"></i> Stop Recording';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-danger');
        } else {
            btn.innerHTML = '<i class="bi bi-mic"></i> Start Recording';
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-primary');
        }
    },

    /**
     * Change recognition language
     * @param {string} language - Language code
     */
    changeLanguage(language) {
        if (this.recognition) {
            this.recognition.lang = language;
            StorageManager.saveLanguage(language);
        }
    }
};
