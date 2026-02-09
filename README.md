# MianScribe - Writing Assistant & Real-time Character Counter

A complete, production-ready, feature-rich writing assistant web application built with HTML, CSS (Bootstrap), and Vanilla JavaScript.

## Features

### Real-time Text Statistics
- Character count (with spaces)
- Character count (without spaces)
- Word count
- Sentence count
- Paragraph count
- Estimated reading time (200 wpm)
- Estimated speaking time (150 wpm)
- Live progress bar based on customizable character limit

### Text Analysis
- Highlight long sentences (>20 words)
- Detect and show most repeated words (top 5)
- Keyword density calculator
- Detect extra spaces
- Basic passive voice detection (regex-based)

### Text Formatting Tools
- UPPERCASE conversion
- lowercase conversion
- Capitalize Each Word
- Remove extra spaces
- Remove line breaks

### UX Features
- Dark/Light mode toggle (saved in localStorage)
- Auto-resizing textarea
- Sticky stats panel
- Keyboard shortcuts for formatting
- Responsive modern UI
- Professional gradient design

### Speech to Text
- Web Speech Recognition API integration
- Multiple language support (10+ languages)
- Real-time transcription
- Append speech to textarea

### File Features
- Upload .txt file into textarea
- Export text as .txt file
- Copy to clipboard with visual feedback
- Reset button to clear all data

### Data Persistence
- Auto-save text in localStorage
- Restore on page reload
- Save theme preference
- Save character limit
- Save language preference

### PWA Ready
- Service Worker for offline functionality
- Web App Manifest
- Installable on mobile devices

## Project Structure

```
/
├── index.html
├── manifest.json
├── service-worker.js
├── README.md
├── css/
│   └── style.css
└── js/
    ├── app.js          # Main application initialization
    ├── counter.js      # Text statistics counter
    ├── analyzer.js     # Text analysis features
    ├── formatter.js    # Text formatting tools
    ├── speech.js       # Speech recognition
    ├── storage.js      # LocalStorage management
    ├── theme.js        # Theme management
    └── export.js       # File import/export

```

## Installation & Usage

### Option 1: Direct Open
1. Download all files maintaining the folder structure
2. Open `index.html` in a modern web browser
3. Start typing!

### Option 2: Local Server (Recommended for PWA)
```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Keyboard Shortcuts

- `Ctrl + U` - Convert to UPPERCASE
- `Ctrl + L` - Convert to lowercase
- `Ctrl + Shift + C` - Capitalize Each Word
- `Ctrl + Shift + S` - Remove Extra Spaces

## Browser Compatibility

- Chrome/Edge: Full support (including Speech Recognition)
- Firefox: Full support (Speech Recognition may require flag)
- Safari: Full support (Speech Recognition limited)
- Opera: Full support

## Technologies Used

- HTML5
- CSS3 (Custom + Bootstrap 5.3)
- Vanilla JavaScript (ES6+)
- Bootstrap Icons
- Web Speech API
- LocalStorage API
- Service Worker API

## Features Breakdown

### Modular Architecture
All JavaScript is separated into logical modules:
- Clean separation of concerns
- Easy to maintain and extend
- Well-commented code
- No inline JavaScript

### Responsive Design
- Mobile-first approach
- Adapts to all screen sizes
- Touch-friendly interface

### Performance
- Lightweight (no heavy frameworks)
- Fast load times
- Efficient DOM updates
- Auto-save with debouncing

## Credits

**Crafted with care by MultiMian © 2026**

## License

Free to use for personal and commercial projects.

## Support

For issues or feature requests, please contact the developer.

---

**MianScribe** - Your professional writing companion! ✍️
