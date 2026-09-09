/**
 * GrowthEngine — MianScan v2.3
 *
 * Computes an overall Growth Score (0–100) and 9 category scores.
 * Added: Business Readiness category.
 * Fixed: conv_cta_crowded logic bug.
 * Improved: effort estimates on findings, richer action detail.
 *
 * Category weights (must sum to 100):
 *   SEO               18
 *   Performance       13
 *   Mobile            11
 *   Security          10
 *   Accessibility      8
 *   Content            9
 *   Conversion        12
 *   UX                 9
 *   Business          10
 */

const GrowthEngine = {

  WEIGHTS: {
    seo:           18,
    performance:   13,
    mobile:        11,
    security:      10,
    accessibility:  8,
    content:        9,
    conversion:    12,
    ux:             9,
    business:      10,
  },

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
      business:      this._scoreBusiness(data),
    };

    let overall = 0;
    for (const [key, score] of Object.entries(categories)) {
      overall += (score / 100) * this.WEIGHTS[key];
    }
    overall = Math.round(overall);

    const findings   = this._buildFindings(data, categories);
    const actionPlan = this._buildActionPlan(findings);
    const summary    = this._buildSummary(overall, categories, findings);

    return { overall, grade: this._grade(overall), label: this._label(overall), summary, categories, findings, actionPlan };
  },

  // ── Category scorers ───────────────────────────────────────────────────────

  _scoreSEO(d)         { return Math.round(d.seo?.score ?? 50); },
  _scoreMobile(d)      { return Math.round(d.mobile?.score ?? 50); },
  _scoreSecurity(d)    { return Math.round(d.security?.score ?? 50); },

  _scorePerformance(d) {
    const base  = d.performance?.score ?? 50;
    const speed = d.ranking?.perfScore;
    return speed != null ? Math.round(speed * 0.6 + base * 0.4) : Math.round(base);
  },

  _scoreAccessibility(d) {
    const a11y  = d.performance?.a11y || [];
    const total = a11y.length;
    if (!total) return 60;
    let score = Math.round((a11y.filter(c => c.type === 'ok').length / total) * 100);
    if (d.seo?.noAlt === 0 && d.images?.total > 0) score = Math.min(100, score + 8);
    if (!d.seo?.viewport) score = Math.max(0, score - 15);
    return Math.round(score);
  },

  _scoreContent(d) {
    let score = 55;
    const wc   = d.content?.wordCount ?? 0;
    const read = d.content?.readability?.score ?? 50;
    if (wc >= 300)  score += 10;
    if (wc >= 700)  score += 8;
    if (wc >= 1500) score += 5;
    if (read >= 60) score += 12;
    else if (read >= 40) score += 6;
    if (d.seo?.h1s?.length === 1) score += 5;
    if ((d.content?.keywords?.length ?? 0) >= 5) score += 5;
    return Math.min(100, Math.round(score));
  },

  _scoreConversion(d) {
    if (d.conversion?.score != null) return Math.round(d.conversion.score);
    // Fallback estimate
    let score = 35;
    if ((d.cta?.primary?.length ?? 0) > 0)                    score += 20;
    if ((d.contacts?.emails?.length ?? 0) > 0)                score += 10;
    if (Object.keys(d.contacts?.social ?? {}).length > 0)     score += 8;
    const total = (d.cta?.primary?.length ?? 0) + (d.cta?.secondary?.length ?? 0);
    if (total >= 2 && total <= 8)                              score += 10;
    if ((d.contacts?.phones?.length ?? 0) > 0)                score += 7;
    if ((d.contacts?.whatsapp?.length ?? 0) > 0)              score += 5;
    if ((d.contacts?.emails?.length ?? 0) === 0 && (d.contacts?.phones?.length ?? 0) === 0) score -= 15;
    return Math.min(100, Math.max(0, Math.round(score)));
  },

  _scoreUX(d) {
    let score = 55;
    if ((d.structure?.counts?.Navbar ?? 0) > 0)  score += 6;
    if ((d.structure?.counts?.Header ?? 0) > 0)  score += 6;
    if ((d.structure?.counts?.Footer ?? 0) > 0)  score += 6;
    const sections = d.structure?.counts?.Sections ?? 0;
    if (sections >= 3) score += 6;
    if (sections >= 6) score += 5;
    if ((d.structure?.counts?.Hero ?? 0) > 0)    score += 6;
    if ((d.links?.totalInternal ?? 0) < 3)        score = Math.max(0, score - 10);
    if (!d.security?.https)                        score = Math.max(0, score - 10);
    return Math.min(100, Math.round(score));
  },

  _scoreBusiness(d) {
    if (d.business?.score != null) return Math.round(d.business.score);
    // Fallback from available data when BusinessAnalyzer not run
    let score = 40;
    if (d.conversion?.hasTestimonials)  score += 10;
    if (d.conversion?.hasPricing)       score += 8;
    if (d.conversion?.hasContactPg)     score += 8;
    if (d.conversion?.hasEmail)         score += 8;
    if (d.conversion?.hasForm)          score += 6;
    if (d.conversion?.hasSocialProof)   score += 6;
    if (d.indexing?.schemas?.length > 0)score += 8;
    return Math.min(100, Math.max(0, Math.round(score)));
  },

  // ── Priority Findings ──────────────────────────────────────────────────────
  // Each finding: { id, priority, category, title, detail, action, impact, effort }
  // effort: 'Easy (< 30 min)' | 'Medium (1–2 hrs)' | 'Hard (half day+)'

  _buildFindings(d, cats) {
    const f = [];
    const add = (id, priority, category, title, detail, action, impact, effort) =>
      f.push({ id, priority, category, title, detail, action, impact: impact || '', effort: effort || '' });

    // ── SEO ───────────────────────────────────────────────────────────────────
    if (!d.seo?.title) {
      add('seo_title', 'critical', 'SEO',
        'Missing page title',
        'Search engines use the title tag as the primary ranking signal. Without it, your page is invisible to search traffic.',
        'Add a descriptive <title> tag of 50–60 characters to your page <head>.',
        'High', 'Easy (< 15 min)');
    }
    if (!d.seo?.metaDesc) {
      add('seo_desc', 'critical', 'SEO',
        'Missing meta description',
        'Meta descriptions appear in search results and directly drive click-through rate. Missing ones are auto-generated by Google, often poorly.',
        'Write a compelling 140–160 character meta description that explains the page value and includes your target keyword.',
        'High', 'Easy (< 15 min)');
    }
    if ((d.seo?.h1s?.length ?? 0) === 0) {
      add('seo_h1', 'critical', 'SEO',
        'No H1 heading found',
        'The H1 is the clearest on-page signal of what the page is about. Both users and search engines look for it first.',
        'Add one H1 that clearly states the page\'s primary topic or main value proposition.',
        'High', 'Easy (< 15 min)');
    } else if ((d.seo?.h1s?.length ?? 0) > 1) {
      add('seo_h1_multi', 'high', 'SEO',
        `Multiple H1 tags (${d.seo.h1s.length} found)`,
        'Multiple H1s dilute the page\'s topic signal. Google may not know which one is primary.',
        `Keep only one H1. Change the others to H2 or H3. Current H1s: "${(d.seo.h1s || []).slice(0,2).join('", "')}"`,
        'Medium', 'Easy (< 30 min)');
    }
    if (!d.seo?.canonical) {
      add('seo_canonical', 'medium', 'SEO',
        'No canonical URL set',
        'Without a canonical tag, search engines may index multiple versions of this page (with/without www, trailing slashes, etc.).',
        'Add <link rel="canonical" href="https://yourdomain.com/this-page"> to the page <head>.',
        'Medium', 'Easy (< 15 min)');
    }
    if (!d.seo?.ogTitle) {
      add('seo_og', 'medium', 'SEO',
        'Missing Open Graph tags',
        'When someone shares this page on LinkedIn, Facebook, or WhatsApp, it will show a blank or ugly preview without OG tags.',
        'Add og:title, og:description, and og:image meta tags. Use a 1200×630px image for the best preview.',
        'Medium', 'Easy (< 30 min)');
    }
    if ((d.seo?.noAlt ?? 0) > 0) {
      add('seo_alt', (d.seo?.noAlt ?? 0) > 3 ? 'high' : 'medium', 'SEO',
        `${d.seo.noAlt} image(s) missing alt text`,
        'Alt text helps search engines index your images and is required for screen reader accessibility.',
        'Add a short, descriptive alt attribute to each image. Describe what the image shows — not just "image1.jpg".',
        (d.seo?.noAlt ?? 0) > 3 ? 'High' : 'Medium', 'Easy (< 30 min)');
    }

    // ── Performance ───────────────────────────────────────────────────────────
    const perfScore = d.ranking?.perfScore ?? d.performance?.score ?? 100;
    if (perfScore < 50) {
      add('perf_slow', 'critical', 'Performance',
        `Poor performance score (${perfScore}/100)`,
        'Slow pages lose visitors before they even see your content. A 1-second delay can reduce conversions by ~7% and hurts Google rankings.',
        'Run PageSpeed Insights on your site. Focus on: compress images to WebP, defer non-critical JS, enable browser caching.',
        'High', 'Medium (2–4 hrs)');
    } else if (perfScore < 70) {
      add('perf_moderate', 'high', 'Performance',
        `Performance needs improvement (${perfScore}/100)`,
        'There are clear opportunities to speed up the page. Faster sites rank better and convert better.',
        'Check Core Web Vitals in PageSpeed Insights. Address the top 2–3 recommendations first.',
        'Medium', 'Medium (1–2 hrs)');
    }
    if (parseFloat(d.performance?.htmlSizeKB ?? 0) > 300) {
      add('perf_size', 'high', 'Performance',
        `Large HTML payload (${d.performance.htmlSizeKB} KB)`,
        'Oversized HTML slows initial page load and hurts First Contentful Paint.',
        'Minify HTML output. Remove unused inline scripts/styles. Consider lazy-loading off-screen sections.',
        'Medium', 'Medium (1–2 hrs)');
    }
    if ((d.performance?.lazyImgs ?? 1) === 0 && (d.performance?.imagesCount ?? 0) > 3) {
      add('perf_lazy', 'medium', 'Performance',
        'No lazy-loaded images',
        `${d.performance?.imagesCount ?? ''} images load immediately on page load, including those below the fold.`,
        'Add loading="lazy" to all <img> tags that aren\'t visible above the fold.',
        'Medium', 'Easy (< 30 min)');
    }

    // ── Mobile ────────────────────────────────────────────────────────────────
    if (!d.mobile?.hasViewport) {
      add('mob_viewport', 'critical', 'Mobile',
        'Missing viewport meta tag',
        'Without a viewport tag, mobile browsers render your desktop layout at full width — completely unusable on phones.',
        'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to your <head>.',
        'High', 'Easy (< 5 min)');
    }
    if (cats.mobile < 60) {
      add('mob_score', 'high', 'Mobile',
        `Low mobile score (${d.mobile?.score ?? 0}/100)`,
        'Over 60% of web traffic is mobile. A poor mobile experience means you\'re losing more than half your visitors.',
        'Open the Mobile tab for the full checklist. Priority: fix viewport, add responsive images (srcset), check tap target sizes.',
        'High', 'Medium (2–4 hrs)');
    }

    // ── Security ──────────────────────────────────────────────────────────────
    if (!d.security?.https) {
      add('sec_https', 'critical', 'Security',
        'Site not using HTTPS',
        'Browsers display "Not Secure" for HTTP sites. Google penalises them in rankings. All visitor data is unencrypted.',
        'Install a free SSL certificate via Let\'s Encrypt. Redirect all HTTP requests to HTTPS via your server config or hosting panel.',
        'High', 'Easy (< 1 hr)');
    }
    if (['D', 'F'].includes(d.security?.grade ?? 'F') && d.security?.https) {
      add('sec_grade', 'high', 'Security',
        `Security grade: ${d.security?.grade} (${d.security?.score ?? 0}/100)`,
        'Missing security headers expose visitors to XSS and data leakage risks.',
        'Add Content-Security-Policy and Referrer-Policy headers via your server or hosting platform. Check the Security tab for the full list.',
        'High', 'Medium (1–2 hrs)');
    }

    // ── Accessibility ─────────────────────────────────────────────────────────
    if (cats.accessibility < 60) {
      add('a11y_low', 'high', 'Accessibility',
        `Accessibility issues (${cats.accessibility}/100)`,
        'Poor accessibility excludes users with disabilities and can affect SEO. WCAG compliance is also increasingly a legal requirement.',
        'Fix missing image alt text, label all form inputs with <label for="">, and check colour contrast ratios.',
        'Medium', 'Medium (2–4 hrs)');
    }

    // ── Content ───────────────────────────────────────────────────────────────
    const wc = d.content?.wordCount ?? 0;
    if (wc < 300) {
      add('content_thin', 'high', 'Content',
        `Thin content (${wc} words)`,
        'Pages with less than 300 words rarely rank well. Search engines see them as low-value.',
        'Expand content to at least 400–600 words. Explain what you do, who you help, and why you\'re the right choice.',
        'High', 'Medium (1–3 hrs)');
    } else if (wc < 600) {
      add('content_brief', 'medium', 'Content',
        `Brief content (${wc} words)`,
        'More detailed pages tend to rank better and convert more effectively.',
        'Consider adding a section on your process, a FAQ, or client results to add depth.',
        'Low', 'Medium (1–2 hrs)');
    }
    const read = d.content?.readability?.score ?? 100;
    if (read < 40) {
      add('content_read', 'medium', 'Content',
        `Content is difficult to read (Flesch score: ${read})`,
        'Complex language reduces engagement and increases bounce rate. Most website copy should target a Flesch score of 60+.',
        'Use shorter sentences (max 20 words), simpler vocabulary, and clear subheadings to break up dense text.',
        'Medium', 'Medium (1–2 hrs)');
    }

    // ── Conversion ────────────────────────────────────────────────────────────
    if ((d.cta?.primary?.length ?? 0) === 0) {
      add('conv_cta', 'critical', 'Conversion',
        'No primary CTA detected',
        'Without a clear call-to-action, visitors have no obvious next step. This directly reduces leads and revenue regardless of traffic.',
        'Add one dominant CTA above the fold — "Get Started", "Book a Free Call", or "Request a Quote". Make it stand out visually.',
        'High', 'Easy (< 1 hr)');
    }
    // Fixed: check for crowded CTAs separately from missing CTAs
    if ((d.cta?.primary?.length ?? 0) > 0 && (d.cta?.all?.length ?? 0) > 10) {
      add('conv_cta_crowded', 'medium', 'Conversion',
        `Too many competing CTAs (${d.cta.all.length} buttons/links)`,
        'When every element is clickable, nothing stands out. Visitors become paralysed by choice and take no action.',
        'Identify one primary action. Reduce secondary CTAs to supporting roles. Use visual hierarchy to guide attention.',
        'Medium', 'Easy (< 1 hr)');
    }
    const noContacts = (d.contacts?.emails?.length ?? 0) === 0 &&
      (d.contacts?.phones?.length ?? 0) === 0 &&
      Object.keys(d.contacts?.social ?? {}).length === 0;
    if (noContacts) {
      add('conv_contact', 'high', 'Conversion',
        'No contact information found',
        'Visitors who can\'t easily find how to contact you will leave. Contact details build trust and enable enquiries.',
        'Add at least an email address and/or phone number in the header or footer — visible on every page.',
        'High', 'Easy (< 30 min)');
    }
    if ((d.conversion?.trustScore ?? d.business?.trustScore ?? 100) < 30) {
      add('conv_trust', 'high', 'Conversion',
        'Low trust signals',
        'First-time visitors need reasons to trust you before they\'ll contact you or buy. Without social proof, many will leave.',
        'Add at least 2–3 client testimonials with names and photos. Client logos or case studies also work well.',
        'High', 'Medium (2–4 hrs)');
    }

    // ── Business Readiness ────────────────────────────────────────────────────
    if (d.business) {
      if (!d.business.hasTestimonials && !d.conversion?.hasTestimonials) {
        add('biz_testimonials', 'high', 'Business',
          'No testimonials or reviews',
          'Social proof is one of the most powerful conversion drivers. Websites with testimonials convert up to 34% better.',
          'Add 3–5 client testimonials with full names. Video testimonials or star ratings are even more effective.',
          'High', 'Medium (2–4 hrs)');
      }
      if (!d.business.hasPricing) {
        add('biz_pricing', 'medium', 'Business',
          'No pricing information',
          'Visitors who can\'t gauge affordability often leave rather than enquire. Transparency builds confidence.',
          'Add a pricing page or at least starting-from prices. If custom, explain what affects the price.',
          'Medium', 'Medium (1–2 hrs)');
      }
      if (!d.business.hasOrgSchema) {
        add('biz_schema', 'medium', 'Business',
          'No Organization schema markup',
          'Schema markup helps Google understand your business details and can enable rich results in search.',
          'Add Organization (or LocalBusiness) JSON-LD schema to your homepage. Use Google\'s Structured Data Markup Helper.',
          'Medium', 'Easy (< 1 hr)');
      }
      if (!d.business.hasPrivacy) {
        add('biz_privacy', 'medium', 'Business',
          'No privacy policy detected',
          'A privacy policy is a legal requirement in most jurisdictions (GDPR, CCPA). Missing one can expose you to legal risk.',
          'Add a privacy policy page and link it in your footer. Free generators are available at termly.io or privacypolicygenerator.info.',
          'Medium', 'Easy (< 1 hr)');
      }
      if (!d.business.hasCaseStudies && !d.business.hasClientLogos) {
        add('biz_proof', 'medium', 'Business',
          'No case studies or client logos',
          'For service businesses, demonstrated results are stronger social proof than any copy.',
          'Add at least one brief case study showing: the client\'s problem, your solution, and the measurable result.',
          'Medium', 'Hard (half day+)');
      }
    }

    // ── UX ────────────────────────────────────────────────────────────────────
    if ((d.structure?.counts?.Navbar ?? 0) === 0) {
      add('ux_nav', 'high', 'UX',
        'No navigation detected',
        'Without clear navigation, visitors can\'t explore your site. Bounce rate increases significantly.',
        'Add a visible navigation bar with links to your main pages: Services, About, Pricing, Contact.',
        'High', 'Medium (1–2 hrs)');
    }
    if ((d.structure?.counts?.Footer ?? 0) === 0) {
      add('ux_footer', 'medium', 'UX',
        'No footer detected',
        'Footers are expected on professional websites. Visitors often scroll to the footer to find contact details and legal pages.',
        'Add a footer with: contact details, key page links, social media, and legal links (privacy, terms).',
        'Low', 'Easy (< 1 hr)');
    }

    // ── Good findings ─────────────────────────────────────────────────────────
    if (d.security?.https) {
      add('good_https', 'good', 'Security', 'HTTPS enabled',
        'Visitor data is encrypted. Browsers show a padlock.', '', 'Low', '');
    }
    if (d.seo?.title && d.seo?.metaDesc) {
      add('good_meta', 'good', 'SEO', 'Title and meta description set',
        'Solid baseline for search visibility.', '', 'Low', '');
    }
    if (d.mobile?.hasViewport && d.mobile?.hasWidthDevice) {
      add('good_viewport', 'good', 'Mobile', 'Viewport correctly configured',
        'Mobile rendering is properly set up.', '', 'Low', '');
    }
    if ((d.tech?.detected?.length ?? 0) > 0) {
      add('good_tech', 'good', 'Performance', 'Modern tech stack detected',
        `Using: ${(d.tech?.detected ?? []).slice(0,4).join(', ')}${(d.tech?.detected?.length ?? 0) > 4 ? ' and more' : ''}.`, '', 'Low', '');
    }
    if ((d.cta?.primary?.length ?? 0) > 0) {
      add('good_cta', 'good', 'Conversion', `Primary CTA present`,
        `"${d.cta.primary[0]}" — clear call-to-action found.`, '', 'Low', '');
    }
    if ((d.conversion?.hasTestimonials || d.business?.hasTestimonials)) {
      add('good_testimonials', 'good', 'Business', 'Testimonials present',
        'Social proof is in place — this builds trust with new visitors.', '', 'Low', '');
    }

    // Sort: critical → high → medium → low → good
    const order = { critical: 0, high: 1, medium: 2, low: 3, good: 4 };
    f.sort((a, b) => (order[a.priority] ?? 5) - (order[b.priority] ?? 5));
    return f;
  },

  // ── Action Plan ────────────────────────────────────────────────────────────

  _buildActionPlan(findings) {
    const issues = findings.filter(f => f.priority !== 'good');
    return {
      today:     issues.filter(f => f.priority === 'critical')
                       .map(f => ({ title: f.title, effort: f.effort, category: f.category })),
      thisWeek:  issues.filter(f => f.priority === 'high')
                       .map(f => ({ title: f.title, effort: f.effort, category: f.category })),
      thisMonth: issues.filter(f => f.priority === 'medium' || f.priority === 'low')
                       .map(f => ({ title: f.title, effort: f.effort, category: f.category })),
    };
  },

  // ── Helpers ───────────────────────────────────────────────────────────────

  _grade(s)  { return s>=90?'A':s>=80?'B':s>=65?'C':s>=50?'D':'F'; },
  _label(s)  { return s>=90?'Excellent':s>=80?'Strong':s>=65?'Good':s>=50?'Needs Work':'Critical Issues'; },

  _buildSummary(overall, cats, findings) {
    const critCount = findings.filter(f => f.priority === 'critical').length;
    const highCount = findings.filter(f => f.priority === 'high').length;
    const entries   = Object.entries(cats);
    const strongest = entries.reduce((a, b) => a[1] > b[1] ? a : b);
    const weakest   = entries.reduce((a, b) => a[1] < b[1] ? a : b);
    const labels = {
      seo:'SEO', performance:'Performance', mobile:'Mobile', security:'Security',
      accessibility:'Accessibility', content:'Content', conversion:'Conversion',
      ux:'UX', business:'Business Readiness',
    };

    if (overall >= 80) {
      return `Your website is in strong shape. Your biggest strength is ${labels[strongest[0]]} (${strongest[1]}). Focusing on ${labels[weakest[0]]} would push the score higher.`;
    }
    if (critCount > 0) {
      return `Your website has ${critCount} critical issue${critCount > 1 ? 's' : ''} that need immediate attention — fix those first, then address ${highCount} high-priority improvements to meaningfully increase traffic and conversions.`;
    }
    if (highCount > 0) {
      return `Good foundation — but ${highCount} important improvement${highCount > 1 ? 's' : ''} are holding back your growth potential. Your strongest area is ${labels[strongest[0]]}. ${labels[weakest[0]]} needs the most attention.`;
    }
    return `Your website is performing well across most areas. Your strongest area is ${labels[strongest[0]]} (${strongest[1]}). Keep iterating on ${labels[weakest[0]]} for further gains.`;
  },
};
