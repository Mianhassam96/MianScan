/**
 * GrowthEngine — MianScan v2.2
 *
 * Computes an overall Growth Score (0–100) and 8 category scores
 * from the data already produced by the existing analyzers.
 * Does NOT modify or replace any existing analyzer output.
 *
 * Category weights (must sum to 100):
 *   SEO          20
 *   Performance  15
 *   Mobile       12
 *   Security     12
 *   Accessibility 10
 *   Content       10
 *   Conversion    11
 *   UX            10
 */

const GrowthEngine = {

  // ── Category weights ──────────────────────────────────────────────────────
  WEIGHTS: {
    seo:           20,
    performance:   15,
    mobile:        12,
    security:      12,
    accessibility: 10,
    content:       10,
    conversion:    11,
    ux:            10,
  },

  /**
   * compute(data)
   * @param {object} data  Full scanner result object
   * @returns {object}     Growth score object (see shape below)
   */
  compute(data) {
    const categories = {
      seo:           this._scoreSEO(data),
      performance:   this._scorePerformance(data),
      mobile:        this._scoreMobile(data),
      security:      this._scoreSecurity(data),
      accessibility: this._scoreAccessibility(data),
      content:       this._scoreContent(data),
      conversion:    this._scoreConversion(data),
      ux:            this._scoreUX(data),
    };

    // Weighted overall score
    let overall = 0;
    for (const [key, score] of Object.entries(categories)) {
      overall += (score / 100) * this.WEIGHTS[key];
    }
    overall = Math.round(overall);

    // Priority findings across all categories
    const findings = this._buildFindings(data, categories);

    // Action plan (Today / This week / This month)
    const actionPlan = this._buildActionPlan(findings);

    // Executive summary sentence
    const summary = this._buildSummary(overall, categories, findings);

    return {
      overall,
      grade: this._grade(overall),
      label: this._label(overall),
      summary,
      categories,
      findings,
      actionPlan,
    };
  },

  // ── Category scorers ──────────────────────────────────────────────────────

  _scoreSEO(d) {
    // Base is the existing SEO analyzer score
    return Math.round(d.seo?.score ?? 50);
  },

  _scorePerformance(d) {
    const base  = d.performance?.score ?? 50;
    const speed = d.ranking?.perfScore;       // Google PageSpeed (mobile)
    if (speed != null) {
      // Blend: 60% PageSpeed, 40% our perf score
      return Math.round(speed * 0.6 + base * 0.4);
    }
    return Math.round(base);
  },

  _scoreMobile(d) {
    return Math.round(d.mobile?.score ?? 50);
  },

  _scoreSecurity(d) {
    return Math.round(d.security?.score ?? 50);
  },

  _scoreAccessibility(d) {
    // Built from performance a11y checks + SEO signals
    const a11y   = d.performance?.a11y || [];
    const total  = a11y.length;
    if (!total) return 60; // neutral if no data

    const okCount   = a11y.filter(c => c.type === 'ok').length;
    let score = Math.round((okCount / total) * 100);

    // Bonus: all images have alt text
    if (d.seo?.noAlt === 0 && d.images?.total > 0) score = Math.min(100, score + 8);

    // Penalty: missing viewport
    if (!d.seo?.viewport) score = Math.max(0, score - 15);

    return Math.round(score);
  },

  _scoreContent(d) {
    let score = 60;
    const wc    = d.content?.wordCount ?? 0;
    const kws   = d.content?.keywords?.length ?? 0;
    const read  = d.content?.readability?.score ?? 50;

    if (wc >= 300)  score += 10;
    if (wc >= 700)  score += 5;
    if (wc >= 1500) score += 5;
    if (kws >= 5)   score += 5;
    if (read >= 60) score += 10;
    else if (read >= 40) score += 5;

    // H1 presence
    if (d.seo?.h1s?.length === 1) score += 5;

    return Math.min(100, Math.round(score));
  },

  _scoreConversion(d) {
    // Use ConversionAnalyzer score if available, else estimate
    if (d.conversion?.score != null) return Math.round(d.conversion.score);

    let score = 40;
    // Primary CTA
    if ((d.cta?.primary?.length ?? 0) > 0)     score += 20;
    // Contact options
    if ((d.contacts?.emails?.length ?? 0) > 0)  score += 10;
    if (Object.keys(d.contacts?.social ?? {}).length > 0) score += 10;
    // Multiple CTAs (not too many)
    const totalCTA = (d.cta?.primary?.length ?? 0) + (d.cta?.secondary?.length ?? 0);
    if (totalCTA >= 2 && totalCTA <= 6)          score += 10;
    // Phone / WhatsApp
    if ((d.contacts?.phones?.length ?? 0) > 0)  score += 5;
    if ((d.contacts?.whatsapp?.length ?? 0) > 0) score += 5;

    return Math.min(100, Math.round(score));
  },

  _scoreUX(d) {
    let score = 60;

    // Nav structure
    if ((d.structure?.counts?.Navbar ?? 0) > 0)  score += 5;
    if ((d.structure?.counts?.Header ?? 0) > 0)  score += 5;
    if ((d.structure?.counts?.Footer ?? 0) > 0)  score += 5;

    // Page organised into sections
    const sections = d.structure?.counts?.Sections ?? 0;
    if (sections >= 3) score += 5;
    if (sections >= 6) score += 5;

    // Has hero
    if ((d.structure?.counts?.Hero ?? 0) > 0) score += 5;

    // Penalise very low link count (navigation friction)
    const intLinks = d.links?.totalInternal ?? 0;
    if (intLinks < 3) score = Math.max(0, score - 10);

    // Penalise HTTP (security-adjacent UX signal)
    if (!d.security?.https) score = Math.max(0, score - 10);

    return Math.min(100, Math.round(score));
  },

  // ── Findings / Priority Engine ────────────────────────────────────────────

  /**
   * Each finding:
   * { id, priority, category, title, detail, action, impact }
   * priority: 'critical' | 'high' | 'medium' | 'low' | 'good'
   */
  _buildFindings(d, cats) {
    const f = [];
    const add = (id, priority, category, title, detail, action, impact = '') =>
      f.push({ id, priority, category, title, detail, action, impact });

    // ── SEO ──────────────────────────────────────────────────────────────────
    if (!d.seo?.title) {
      add('seo_title', 'critical', 'SEO',
        'Missing page title',
        'Search engines use the title tag as the primary signal for ranking. Without it, your page cannot compete for search traffic.',
        'Add a descriptive <title> tag (50–60 characters).',
        'High');
    }
    if (!d.seo?.metaDesc) {
      add('seo_desc', 'critical', 'SEO',
        'Missing meta description',
        'Meta descriptions are displayed in search results and directly affect click-through rate.',
        'Add a meta description (120–160 characters) that clearly describes the page.',
        'High');
    }
    if (d.seo?.h1s?.length === 0) {
      add('seo_h1', 'critical', 'SEO',
        'No H1 heading found',
        'The H1 is the most important on-page SEO signal. Its absence confuses both users and search engines.',
        'Add one clear H1 that describes the page\'s primary topic.',
        'High');
    } else if ((d.seo?.h1s?.length ?? 0) > 1) {
      add('seo_h1_multi', 'high', 'SEO',
        `Multiple H1 tags (${d.seo.h1s.length})`,
        'Having more than one H1 dilutes the page\'s topic signal for search engines.',
        'Keep only one H1. Demote additional H1s to H2 or H3.',
        'Medium');
    }
    if (!d.seo?.canonical) {
      add('seo_canonical', 'medium', 'SEO',
        'No canonical URL set',
        'Without a canonical tag, search engines may index duplicate or near-duplicate versions of your page.',
        'Add <link rel="canonical" href="..."> to the page <head>.',
        'Medium');
    }
    if (!d.seo?.ogTitle) {
      add('seo_og', 'medium', 'SEO',
        'Missing Open Graph tags',
        'OG tags control how your page looks when shared on social media. Without them, previews look unprofessional.',
        'Add og:title, og:description, and og:image meta tags.',
        'Medium');
    }
    if ((d.seo?.noAlt ?? 0) > 0) {
      add('seo_alt', d.seo.noAlt > 3 ? 'high' : 'medium', 'SEO',
        `${d.seo.noAlt} image(s) missing alt text`,
        'Alt text helps search engines understand image content and is required for accessibility compliance.',
        'Add descriptive alt attributes to all <img> tags.',
        d.seo.noAlt > 3 ? 'High' : 'Medium');
    }

    // ── Performance ──────────────────────────────────────────────────────────
    const perfScore = d.ranking?.perfScore ?? d.performance?.score ?? 100;
    if (perfScore < 50) {
      add('perf_slow', 'critical', 'Performance',
        'Poor page performance score',
        `Your site scores ${perfScore}/100 on performance. Slow pages lose visitors quickly — a 1-second delay reduces conversions by ~7%.`,
        'Optimise images, reduce JavaScript, enable caching, and use a CDN.',
        'High');
    } else if (perfScore < 70) {
      add('perf_moderate', 'high', 'Performance',
        'Performance needs improvement',
        `Performance score is ${perfScore}/100. There are clear opportunities to speed up the page.`,
        'Audit Core Web Vitals in PageSpeed Insights and address the top recommendations.',
        'Medium');
    }
    const htmlKB = parseFloat(d.performance?.htmlSizeKB ?? 0);
    if (htmlKB > 300) {
      add('perf_size', 'high', 'Performance',
        `Large HTML payload (${d.performance.htmlSizeKB} KB)`,
        'Oversized HTML increases parse time and delays First Contentful Paint.',
        'Minify HTML, remove unused code, and consider lazy-loading off-screen content.',
        'Medium');
    }
    if ((d.performance?.lazyImgs ?? 1) === 0 && (d.performance?.imagesCount ?? 0) > 3) {
      add('perf_lazy', 'medium', 'Performance',
        'No lazy-loaded images',
        'All images are loaded immediately, even those below the fold. This increases initial page weight unnecessarily.',
        'Add loading="lazy" to all images below the fold.',
        'Medium');
    }

    // ── Mobile ───────────────────────────────────────────────────────────────
    if (!d.mobile?.hasViewport) {
      add('mob_viewport', 'critical', 'Mobile',
        'Missing viewport meta tag',
        'Without a viewport tag, mobile browsers render the desktop layout at full width, making the page completely unusable on phones.',
        'Add <meta name="viewport" content="width=device-width, initial-scale=1">.',
        'High');
    }
    if (cats.mobile < 60) {
      add('mob_score', 'high', 'Mobile',
        'Low mobile friendliness score',
        `Mobile score is ${d.mobile?.score ?? 0}/100. Over 60% of web traffic is on mobile devices.`,
        'Check the Mobile tab for detailed checks and fix issues starting with viewport and responsive images.',
        'High');
    }

    // ── Security ─────────────────────────────────────────────────────────────
    if (!d.security?.https) {
      add('sec_https', 'critical', 'Security',
        'Site is not using HTTPS',
        'All data between your visitors and server is transmitted in plain text. Modern browsers show "Not Secure" warnings, which destroy trust.',
        'Install a free SSL certificate via Let\'s Encrypt and redirect all HTTP traffic to HTTPS.',
        'High');
    }
    const secGrade = d.security?.grade ?? 'F';
    if (['D', 'F'].includes(secGrade)) {
      add('sec_grade', 'high', 'Security',
        `Security grade: ${secGrade}`,
        `Your site scored ${d.security?.score ?? 0}/100 on security. Missing headers expose visitors to risks.`,
        'Add Content-Security-Policy, Referrer-Policy headers. Check the Security tab for the full checklist.',
        'High');
    }

    // ── Accessibility ────────────────────────────────────────────────────────
    if (cats.accessibility < 60) {
      add('a11y_low', 'high', 'Accessibility',
        'Accessibility issues detected',
        `Accessibility score is ${cats.accessibility}/100. Poor accessibility excludes a portion of your audience and can affect SEO.`,
        'Fix missing image alt text, label all form inputs, and ensure sufficient colour contrast.',
        'Medium');
    }

    // ── Content ──────────────────────────────────────────────────────────────
    const wc = d.content?.wordCount ?? 0;
    if (wc < 300) {
      add('content_thin', 'high', 'Content',
        `Thin content (${wc} words)`,
        'Search engines favour pages with substantial, relevant content. Thin pages often rank poorly.',
        'Expand the page content to at least 300–500 words that clearly describe your product or service.',
        'High');
    }
    const read = d.content?.readability?.score ?? 100;
    if (read < 40) {
      add('content_read', 'medium', 'Content',
        `Difficult to read (Flesch score ${read})`,
        'Complex language reduces engagement and can increase bounce rate.',
        'Use shorter sentences, simpler vocabulary, and clear headings to improve readability.',
        'Medium');
    }

    // ── Conversion ───────────────────────────────────────────────────────────
    if ((d.cta?.primary?.length ?? 0) === 0) {
      add('conv_cta', 'critical', 'Conversion',
        'No primary CTA detected',
        'Without a clear call-to-action, visitors have no obvious next step. This directly reduces leads and revenue.',
        'Add one dominant CTA button (e.g. "Get Started", "Book a Call", "Request a Quote") above the fold.',
        'High');
    } else if ((d.cta?.primary?.length ?? 0) === 0 && (d.cta?.all?.length ?? 0) > 10) {
      add('conv_cta_crowded', 'medium', 'Conversion',
        'Too many competing CTAs',
        'When everything is clickable, nothing stands out. Visitors become paralysed by choice.',
        'Identify one primary action and reduce secondary CTAs visually.',
        'Medium');
    }
    if ((d.contacts?.emails?.length ?? 0) === 0 &&
        (d.contacts?.phones?.length ?? 0) === 0 &&
        Object.keys(d.contacts?.social ?? {}).length === 0) {
      add('conv_contact', 'high', 'Conversion',
        'No contact information found',
        'Visitors who cannot easily find contact details often leave without converting.',
        'Add at least one contact method (email, phone, or a contact form) in the header or footer.',
        'High');
    }
    if (d.conversion?.trustScore != null && d.conversion.trustScore < 30) {
      add('conv_trust', 'high', 'Conversion',
        'Low trust signals',
        'Visitors are unlikely to convert without social proof, testimonials, reviews, or trust badges.',
        'Add testimonials, case studies, certifications, or review counts to build credibility.',
        'High');
    }

    // ── UX ───────────────────────────────────────────────────────────────────
    if ((d.structure?.counts?.Navbar ?? 0) === 0) {
      add('ux_nav', 'high', 'UX',
        'No navigation detected',
        'Visitors need clear navigation to find what they\'re looking for. Missing nav increases bounce rate significantly.',
        'Add a clearly visible navigation menu with links to key pages.',
        'High');
    }
    if ((d.structure?.counts?.Footer ?? 0) === 0) {
      add('ux_footer', 'medium', 'UX',
        'No footer detected',
        'Footers provide essential links (contact, legal, social) and signal a professional, complete website.',
        'Add a footer with contact details, social links, and navigation links.',
        'Low');
    }

    // ── Good findings (positive) ──────────────────────────────────────────────
    if (d.security?.https) {
      add('good_https', 'good', 'Security',
        'HTTPS enabled',
        'Your site uses a secure connection. Visitor data is encrypted and browsers display a padlock.',
        '', 'Low');
    }
    if (d.seo?.title && d.seo?.metaDesc) {
      add('good_meta', 'good', 'SEO',
        'Title and meta description present',
        'Both the page title and meta description are set — solid baseline for search visibility.',
        '', 'Low');
    }
    if (d.mobile?.hasViewport && d.mobile?.hasWidthDevice) {
      add('good_viewport', 'good', 'Mobile',
        'Viewport correctly configured',
        'The viewport meta tag is properly set for mobile rendering.',
        '', 'Low');
    }
    if (d.tech?.detected?.length > 0) {
      add('good_tech', 'good', 'Performance',
        `Modern tech stack detected`,
        `Using: ${d.tech.detected.slice(0, 4).join(', ')}${d.tech.detected.length > 4 ? ' and more' : ''}.`,
        '', 'Low');
    }
    if ((d.cta?.primary?.length ?? 0) > 0) {
      add('good_cta', 'good', 'Conversion',
        `Primary CTA present: "${d.cta.primary[0]}"`,
        'Your site has a clear primary call-to-action.',
        '', 'Low');
    }

    // Sort: critical → high → medium → low → good
    const order = { critical: 0, high: 1, medium: 2, low: 3, good: 4 };
    f.sort((a, b) => (order[a.priority] ?? 5) - (order[b.priority] ?? 5));

    return f;
  },

  // ── Action Plan ───────────────────────────────────────────────────────────

  _buildActionPlan(findings) {
    const issues = findings.filter(f => f.priority !== 'good');
    return {
      today:     issues.filter(f => f.priority === 'critical').map(f => f.title),
      thisWeek:  issues.filter(f => f.priority === 'high').map(f => f.title),
      thisMonth: issues.filter(f => f.priority === 'medium' || f.priority === 'low').map(f => f.title),
    };
  },

  // ── Helpers ───────────────────────────────────────────────────────────────

  _grade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 65) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  },

  _label(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Strong';
    if (score >= 65) return 'Good';
    if (score >= 50) return 'Needs Work';
    return 'Critical Issues';
  },

  _buildSummary(overall, cats, findings) {
    const criticalCount = findings.filter(f => f.priority === 'critical').length;
    const highCount     = findings.filter(f => f.priority === 'high').length;

    // Find strongest and weakest category
    const entries = Object.entries(cats);
    const strongest = entries.reduce((a, b) => a[1] > b[1] ? a : b);
    const weakest   = entries.reduce((a, b) => a[1] < b[1] ? a : b);
    const catLabels = {
      seo: 'SEO', performance: 'Performance', mobile: 'Mobile friendliness',
      security: 'Security', accessibility: 'Accessibility',
      content: 'Content', conversion: 'Conversion', ux: 'UX',
    };

    if (overall >= 80) {
      return `Your website is in strong shape overall. Your biggest strength is ${catLabels[strongest[0]]} (${strongest[1]}). Focus on ${catLabels[weakest[0]]} to push higher.`;
    }
    if (criticalCount > 0) {
      return `Your website has ${criticalCount} critical issue${criticalCount > 1 ? 's' : ''} that need immediate attention. Fix those first, then work through ${highCount} high-priority improvements.`;
    }
    if (highCount > 0) {
      return `Your website has a solid foundation but ${highCount} important improvement${highCount > 1 ? 's' : ''} that will meaningfully increase traffic and conversions. Your strongest area is ${catLabels[strongest[0]]}.`;
    }
    return `Your website is performing well. Your strongest area is ${catLabels[strongest[0]]} (${strongest[1]}). Keep iterating on ${catLabels[weakest[0]]} for further gains.`;
  },
};
