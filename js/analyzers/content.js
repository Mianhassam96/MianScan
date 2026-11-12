const ContentAnalyzer = {
  analyze(doc) {
    const headings = [...doc.querySelectorAll('h1,h2,h3,h4')]
      .map(h => h.textContent.trim()).filter(Boolean);
    const paras = [...doc.querySelectorAll('p')]
      .map(p => p.textContent.trim()).filter(t => t.length > 20);
    const metaKw = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';

    const allText = [...headings, ...paras, metaKw].join(' ').toLowerCase();
    const words = allText.replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 4);

    // Filter common English stop words so keyword results are meaningful
    const STOP_WORDS = new Set([
      'about','above','after','again','against','all','also','although','always',
      'among','another','any','anyone','anything','are','around','because','been',
      'before','being','below','between','both','but','came','cannot','come',
      'could','does','doing','done','down','during','each','either','else',
      'even','ever','every','everyone','everything','except','first','for',
      'from','further','get','gets','getting','given','going','had','has',
      'have','having','here','how','however','if','in','into','is','it',
      'its','itself','just','know','last','like','made','make','many','may',
      'more','most','much','must','my','need','new','next','no','not','now',
      'of','off','often','on','once','only','or','other','our','out','over',
      'own','part','per','put','rather','really','same','should','since','so',
      'some','something','sometimes','still','such','take','than','that',
      'the','their','them','then','there','therefore','these','they','this',
      'those','though','through','thus','to','too','under','until','up',
      'used','very','via','was','we','well','were','what','when','where',
      'which','while','who','will','with','within','without','would','your',
    ]);

    const filteredWords = words.filter(w => !STOP_WORDS.has(w));
    const totalWords = filteredWords.length || 1;

    // Single-word keyword frequency (stop words already removed)
    const freq = {};
    filteredWords.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

    const keywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16)
      .map(([w, count]) => ({
        word: w,
        count,
        density: ((count / totalWords) * 100).toFixed(1)
      }));

    // Bigrams and trigrams also use filtered words
    const bigrams  = this._ngrams(filteredWords, 2, 10);
    const trigrams = this._ngrams(filteredWords, 3, 5);

    // Readability (Flesch-Kincaid Reading Ease)
    const readability = this._readability(paras);

    const topics = headings.filter(h => h.length > 3 && h.length < 70).slice(0, 6);
    const tags = metaKw.split(',').map(t => t.trim()).filter(Boolean).slice(0, 10);

    // Body word count — visible text only, excluding script/style/noscript content
    // Bug fix: body.innerText is not available in DOMParser output; textContent
    // includes all script/style text inflating the count. Clone body and remove
    // non-visible elements before extracting text.
    let wordCount = 0;
    try {
      const bodyClone = doc.body?.cloneNode(true);
      if (bodyClone) {
        bodyClone.querySelectorAll('script,style,noscript,template').forEach(el => el.remove());
        const visibleText = bodyClone.textContent || '';
        wordCount = visibleText.trim().split(/\s+/).filter(w => w.length > 0).length;
      }
    } catch (_) {
      // Fallback if cloneNode fails
      wordCount = (doc.body?.textContent || '').trim().split(/\s+/).filter(w => w.length > 0).length;
    }

    return {
      headings: headings.slice(0, 10),
      paragraphCount: paras.length,
      keywords,
      bigrams,
      trigrams,
      readability,
      topics,
      tags,
      wordCount
    };
  },

  _ngrams(words, n, topK) {
    const freq = {};
    for (let i = 0; i <= words.length - n; i++) {
      const gram = words.slice(i, i + n).join(' ');
      freq[gram] = (freq[gram] || 0) + 1;
    }
    return Object.entries(freq)
      .filter(([, c]) => c > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK)
      .map(([phrase, count]) => ({ phrase, count }));
  },

  _readability(paras) {
    const text = paras.join(' ');
    if (!text.trim()) return { score: 0, grade: 'N/A', label: 'Not enough text' };

    // Count sentences (split on . ! ?)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = Math.max(sentences.length, 1);

    // Count words
    const wordList = text.replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    const wordCount = Math.max(wordList.length, 1);

    // Count syllables
    const syllableCount = wordList.reduce((sum, w) => sum + this._syllables(w), 0);

    // Flesch-Kincaid Reading Ease
    const score = Math.round(
      206.835
      - 1.015 * (wordCount / sentenceCount)
      - 84.6 * (syllableCount / wordCount)
    );

    const clamped = Math.max(0, Math.min(100, score));

    let grade, label;
    if (clamped >= 90)      { grade = 'A'; label = 'Very Easy'; }
    else if (clamped >= 70) { grade = 'B'; label = 'Easy'; }
    else if (clamped >= 50) { grade = 'C'; label = 'Standard'; }
    else if (clamped >= 30) { grade = 'D'; label = 'Difficult'; }
    else                    { grade = 'F'; label = 'Very Difficult'; }

    return { score: clamped, grade, label };
  },

  _syllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!word) return 0;
    // Count vowel groups
    const matches = word.match(/[aeiouy]+/g);
    let count = matches ? matches.length : 1;
    // Subtract silent trailing 'e'
    if (word.endsWith('e') && count > 1) count--;
    return Math.max(1, count);
  }
};
