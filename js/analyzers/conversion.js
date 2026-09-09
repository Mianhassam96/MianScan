/**
 * ConversionAnalyzer — MianScan v2.3
 *
 * Analyses a webpage for conversion-readiness with per-section scoring:
 *   – CTA (presence, position, clarity, repetition)
 *   – Lead generation (forms, newsletter, gated content)
 *   – Contact accessibility (email, phone, WhatsApp, chat)
 *   – Trust signals (testimonials, reviews, social proof, guarantees)
 *   – Navigation friction
 */

const ConversionAnalyzer = {
  analyze(doc, html = '') {
    const fullHtml  = html || doc.documentElement.innerHTML;
    const bodyText  = (doc.body?.textContent || '').toLowerCase();
    const allLinks  = [...doc.querySelectorAll('a[href]')];
    const allBtns   = [...doc.querySelectorAll('button, a.btn, a[class*="cta"], [class*="btn"]')];

    // ── CTA analysis ──────────────────────────────────────────────────────────
    const ctaKeywords = /get started|start free|try free|sign up|free trial|get access|join now|start now|create account|get demo|book a call|request a quote|contact us|buy now|order now|subscribe|book now|hire us|work with us/i;

    const ctaEls = allBtns.concat(allLinks).filter(el => {
      const t = el.textContent.trim();
      return t.length > 1 && t.length < 60 && ctaKeywords.test(t);
    });

    const hasPrimaryCTA   = ctaEls.length > 0;
    const primaryCTACount = ctaEls.length;

    // CTA clarity — primary CTAs use action verbs
    const actionVerbCTAs = ctaEls.filter(el =>
      /\b(get|start|try|book|hire|request|join|buy|order|subscribe|download|sign)\b/i.test(el.textContent.trim())
    );
    const ctaHasActionVerb = actionVerbCTAs.length > 0;

    // Above-fold: CTA in first 25% of HTML
    const firstQuarter = fullHtml.slice(0, Math.floor(fullHtml.length * 0.25));
    const ctaAboveFold = ctaKeywords.test(firstQuarter);

    // CTA repetition — good if CTA appears in multiple sections (not just once)
    const ctaInMultipleSections = primaryCTACount >= 2;

    // Too crowded — too many competing CTAs
    const ctaCrowded = primaryCTACount > 10;

    // CTA section score (0–35)
    let ctaScore = 0;
    if (hasPrimaryCTA)         ctaScore += 12;
    if (ctaAboveFold)          ctaScore += 10;
    if (ctaHasActionVerb)      ctaScore += 7;
    if (ctaInMultipleSections) ctaScore += 6;
    if (ctaCrowded)            ctaScore -= 5;
    ctaScore = Math.max(0, ctaScore);

    // ── Lead generation ───────────────────────────────────────────────────────
    const forms = [...doc.querySelectorAll('form')];
    const hasForm = forms.length > 0;
    const hasContactForm = forms.some(f =>
      /contact|enquir|inquiry|message|name.*email|email.*name/i.test(f.innerHTML)
    );
    const hasNewsletterForm = forms.some(f =>
      /newsletter|subscribe|email/i.test(f.innerHTML) ||
      f.querySelector('input[type="email"]')
    );
    const hasGatedContent = /download|free guide|ebook|whitepaper|cheat sheet|free resource|get the|grab the/i.test(bodyText);
    const hasLeadCapture = hasContactForm || hasNewsletterForm || hasGatedContent;

    // Lead-gen section score (0–20)
    let leadScore = 0;
    if (hasContactForm)    leadScore += 10;
    if (hasNewsletterForm) leadScore += 5;
    if (hasGatedContent)   leadScore += 5;

    // ── Contact accessibility ─────────────────────────────────────────────────
    const emailReg   = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,6}/g;
    const emailCount = (fullHtml.match(emailReg) || [])
      .filter(e => !/(\.png|\.jpg|\.gif|\.svg|sentry|example|test@|noreply)/.test(e)).length;
    const hasEmail     = emailCount > 0;
    const hasPhone     = /(\+?\d[\d\s\-().]{6,}\d)/.test(bodyText);
    const hasWhatsApp  = /wa\.me|whatsapp\.com/i.test(fullHtml);
    const hasContactPg = allLinks.some(a => /\/(contact|reach|support|help|hire)/i.test(a.getAttribute('href') || ''));
    const hasChatWidget= /intercom|crisp|tawk|livechat|drift|hubspot/i.test(fullHtml);
    const contactMethods = [hasEmail, hasPhone, hasWhatsApp, hasContactPg, hasChatWidget].filter(Boolean).length;

    // Contact section score (0–25)
    const contactScore =
      (hasEmail     ? 8  : 0) +
      (hasPhone     ? 7  : 0) +
      (hasWhatsApp  ? 4  : 0) +
      (hasContactPg ? 4  : 0) +
      (hasChatWidget? 2  : 0);

    // ── Trust signals ─────────────────────────────────────────────────────────
    const hasTestimonials = /testimonial|review|feedback|what (?:our|clients|customers) say|client said/i.test(fullHtml) ||
      doc.querySelectorAll('[class*="testimonial"], [class*="review"], [class*="rating"]').length > 0;

    const hasClientLogos  = /our clients|trusted by|clients include|our partners|worked with/i.test(bodyText) ||
      doc.querySelectorAll('[class*="client"], [class*="partner"], [class*="logo-grid"]').length > 0;

    const hasSocialProof  = /(\d[\d,]* (?:customers|users|clients|companies|businesses|teams|projects)|trusted by|rated \d|\d+ reviews)/i.test(bodyText);

    const hasGuarantee    = /money.back|guarantee|no.risk|risk.free|cancel anytime|no commitment/i.test(bodyText);

    const hasCertBadges   = /ssl|secure|certified|verified|award|accredited|iso |gdpr compliant/i.test(bodyText);

    const hasPricing      = /pricing|our plans|starting (?:at|from)|\$\d|£\d|€\d|per month|\/mo\b/i.test(bodyText) ||
      doc.querySelectorAll('[class*="pricing"], [class*="plan"]').length > 0;

    // Trust section score (0–20)
    const trustScore =
      (hasTestimonials ? 7  : 0) +
      (hasSocialProof  ? 5  : 0) +
      (hasClientLogos  ? 4  : 0) +
      (hasGuarantee    ? 2  : 0) +
      (hasCertBadges   ? 2  : 0);

    // ── Navigation friction ───────────────────────────────────────────────────
    const navLinks = doc.querySelectorAll('nav a, [class*="nav"] a, [class*="menu"] a');
    const navCount = navLinks.length;
    const hasExcessiveNav = navCount > 20;
    const navPenalty = hasExcessiveNav ? -5 : 0;

    // ── Overall score ─────────────────────────────────────────────────────────
    const score = Math.min(100, Math.max(0, Math.round(
      ctaScore + leadScore + contactScore + trustScore + navPenalty
    )));
    const grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F';

    // ── Grouped checks for UI ─────────────────────────────────────────────────
    const checks = [
      // CTA
      { section: 'CTA',          type: hasPrimaryCTA       ? 'ok' : 'error', label: 'Primary CTA',              msg: hasPrimaryCTA       ? `${primaryCTACount} call-to-action element(s) detected` : 'No primary CTA found — visitors have no clear next step' },
      { section: 'CTA',          type: ctaAboveFold        ? 'ok' : 'warn',  label: 'CTA Visibility',           msg: ctaAboveFold        ? 'CTA visible above the fold' : 'CTA may not be visible without scrolling' },
      { section: 'CTA',          type: ctaHasActionVerb    ? 'ok' : 'warn',  label: 'CTA Clarity',              msg: ctaHasActionVerb    ? 'CTA uses clear action verbs' : 'CTA wording could be more action-oriented' },
      { section: 'CTA',          type: ctaInMultipleSections?'ok' : 'warn',  label: 'CTA Repetition',           msg: ctaInMultipleSections?'CTA appears in multiple sections' : 'CTA only appears once on the page' },
      { section: 'CTA',          type: ctaCrowded          ? 'warn': 'ok',   label: 'CTA Focus',                msg: ctaCrowded          ? `${primaryCTACount} competing CTAs — may confuse visitors` : 'CTA count is focused' },
      // Lead Gen
      { section: 'Lead Gen',     type: hasContactForm      ? 'ok' : 'warn',  label: 'Contact Form',             msg: hasContactForm      ? 'Contact or enquiry form detected' : 'No contact form found' },
      { section: 'Lead Gen',     type: hasNewsletterForm   ? 'ok' : 'warn',  label: 'Newsletter / Email Opt-in',msg: hasNewsletterForm   ? 'Email opt-in or newsletter form found' : 'No email opt-in form found' },
      { section: 'Lead Gen',     type: hasGatedContent     ? 'ok' : 'warn',  label: 'Lead Magnet / Free Resource', msg: hasGatedContent  ? 'Downloadable or free resource offer detected' : 'No lead magnet or free resource offer found' },
      // Contact
      { section: 'Contact',      type: hasEmail            ? 'ok' : 'warn',  label: 'Email Address',            msg: hasEmail            ? `${emailCount} email address(es) found` : 'No email address found' },
      { section: 'Contact',      type: hasPhone            ? 'ok' : 'warn',  label: 'Phone Number',             msg: hasPhone            ? 'Phone number found' : 'No phone number found' },
      { section: 'Contact',      type: hasWhatsApp         ? 'ok' : 'warn',  label: 'WhatsApp',                 msg: hasWhatsApp         ? 'WhatsApp contact link found' : 'No WhatsApp link found' },
      { section: 'Contact',      type: hasContactPg        ? 'ok' : 'warn',  label: 'Contact Page',             msg: hasContactPg        ? 'Contact page link found' : 'No contact page detected' },
      // Trust
      { section: 'Trust',        type: hasTestimonials     ? 'ok' : 'warn',  label: 'Testimonials / Reviews',   msg: hasTestimonials     ? 'Testimonials or reviews section found' : 'No testimonials or reviews found' },
      { section: 'Trust',        type: hasSocialProof      ? 'ok' : 'warn',  label: 'Social Proof Numbers',     msg: hasSocialProof      ? 'Quantified social proof detected' : 'No social proof numbers found' },
      { section: 'Trust',        type: hasClientLogos      ? 'ok' : 'warn',  label: 'Client Logos',             msg: hasClientLogos      ? 'Client logos or partner section found' : 'No client logos detected' },
      { section: 'Trust',        type: hasGuarantee        ? 'ok' : 'warn',  label: 'Guarantee / Risk Reversal',msg: hasGuarantee        ? 'Guarantee or risk-reversal language found' : 'No guarantee or risk-reversal found' },
      { section: 'Trust',        type: hasPricing          ? 'ok' : 'warn',  label: 'Pricing Transparency',     msg: hasPricing          ? 'Pricing section or page found' : 'No pricing information detected' },
      // Navigation
      { section: 'Navigation',   type: hasExcessiveNav     ? 'warn': 'ok',   label: 'Navigation Clarity',       msg: hasExcessiveNav     ? `${navCount} navigation links — may overwhelm visitors` : `${navCount} navigation link(s) — looks focused` },
    ];

    return {
      score,
      grade,
      // Section scores (0–100 normalised for display)
      ctaSectionScore:     Math.min(100, Math.round((ctaScore  / 35) * 100)),
      leadSectionScore:    Math.min(100, Math.round((leadScore / 20) * 100)),
      contactSectionScore: Math.min(100, Math.round((contactScore / 25) * 100)),
      trustSectionScore:   Math.min(100, Math.round((trustScore / 20) * 100)),
      // Raw section values (for Growth Engine)
      trustScore: Math.round(trustScore),
      contactScore: Math.round(contactScore),
      contactMethods,
      // CTA details
      hasPrimaryCTA,
      primaryCTACount,
      ctaAboveFold,
      ctaHasActionVerb,
      ctaInMultipleSections,
      ctaCrowded,
      // Lead gen
      hasContactForm,
      hasNewsletterForm,
      hasGatedContent,
      hasLeadCapture,
      // Contact
      hasEmail,
      hasPhone,
      hasWhatsApp,
      hasContactPg,
      hasChatWidget,
      // Trust
      hasTestimonials,
      hasClientLogos,
      hasSocialProof,
      hasGuarantee,
      hasCertBadges,
      hasPricing,
      // Nav
      hasExcessiveNav,
      navCount,
      // Full checks list grouped by section
      checks,
    };
  }
};
