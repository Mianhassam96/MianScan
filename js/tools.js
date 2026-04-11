const Tools = {
  init() {
    const app = document.getElementById('toolsApp');
    app.innerHTML = this.layout();
    this.wire();
  },

  layout() {
    return `
    <div class="tools-grid">
      ${this.toolCard('meta','bi-tags-fill','Meta Tag Generator','Generate complete meta tags for any page','#6470ff')}
      ${this.toolCard('robots','bi-robot','Robots.txt Generator','Build a robots.txt file instantly','#22c55e')}
      ${this.toolCard('sitemap','bi-diagram-3-fill','Sitemap Generator','Generate an XML sitemap template','#00d4ff')}
      ${this.toolCard('keyword','bi-bar-chart-fill','Keyword Density Checker','Analyze keyword frequency in any text','#a855f7')}
      ${this.toolCard('slug','bi-link-45deg','Slug Generator','Convert any title to a clean URL slug','#f59e0b')}
      ${this.toolCard('minifier','bi-code-slash','HTML Minifier','Minify HTML to reduce page size','#f04444')}
      ${this.toolCard('counter','bi-file-text-fill','Text Counter','Count words, chars, sentences, paragraphs','#ec4899')}
      ${this.toolCard('checklist','bi-check2-all','SEO Checklist','Complete on-page SEO checklist generator','#00d4ff')}
    </div>
    <div id="toolOutput" style="margin-top:2rem"></div>`;
  },

  toolCard(id, icon, title, desc, color) {
    return `<div class="tool-card" data-tool="${id}" style="--tc:${color}">
      <div class="tool-icon" style="background:${color}20;color:${color}"><i class="bi ${icon}"></i></div>
      <h3>${title}</h3>
      <p>${desc}</p>
      <span class="tool-open">Open Tool →</span>
    </div>`;
  },

  wire() {
    document.querySelectorAll('.tool-card').forEach(c => {
      c.addEventListener('click', () => {
        document.querySelectorAll('.tool-card').forEach(x => x.classList.remove('active'));
        c.classList.add('active');
        this.render(c.dataset.tool);
        document.getElementById('toolOutput').scrollIntoView({behavior:'smooth',block:'start'});
      });
    });
  },

  render(tool) {
    const out = document.getElementById('toolOutput');
    const map = {
      meta:      () => this.tMeta(),
      robots:    () => this.tRobots(),
      sitemap:   () => this.tSitemap(),
      keyword:   () => this.tKeyword(),
      slug:      () => this.tSlug(),
      minifier:  () => this.tMinifier(),
      counter:   () => this.tCounter(),
      checklist: () => this.tChecklist(),
    };
    out.innerHTML = `<div class="card fu">${(map[tool]||map.meta)()}</div>`;
    this.wireOutputs(tool);
  },

  copyOut(id) {
    const el = document.getElementById(id);
    if (!el) return;
    navigator.clipboard.writeText(el.value || el.textContent).then(() => {
      const t = document.getElementById('toast');
      t.textContent = 'Copied!'; t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2000);
    });
  },

  // ── Meta Tag Generator
  tMeta() {
    return `<div class="card-head"><i class="bi bi-tags-fill" style="color:#6470ff"></i> Meta Tag Generator</div>
    <div class="g2">
      <div>
        ${this.field('mt-title','Page Title','e.g. Best SEO Tool — MianScan','text')}
        ${this.field('mt-desc','Meta Description','120–160 chars recommended','textarea')}
        ${this.field('mt-kw','Keywords (comma separated)','seo, website analyzer, free tool','text')}
        ${this.field('mt-author','Author','Your Name or Brand','text')}
        ${this.field('mt-url','Canonical URL','https://example.com/page','text')}
        ${this.field('mt-img','OG Image URL','https://example.com/image.jpg','text')}
        <button class="scan-btn" style="margin-top:.75rem" onclick="Tools.genMeta()"><i class="bi bi-gear-fill"></i> Generate Tags</button>
      </div>
      <div>
        <div style="font-size:.8rem;font-weight:700;color:var(--muted);margin-bottom:.5rem;text-transform:uppercase;letter-spacing:.06em">Generated HTML</div>
        <textarea id="mt-output" rows="18" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-s);padding:.875rem;color:var(--text);font-family:monospace;font-size:.78rem;resize:vertical" readonly placeholder="Fill in the fields and click Generate…"></textarea>
        <button class="exp-btn" style="margin-top:.5rem" onclick="Tools.copyOut('mt-output')"><i class="bi bi-clipboard"></i> Copy HTML</button>
      </div>
    </div>`;
  },

  genMeta() {
    const v = id => document.getElementById(id)?.value?.trim() || '';
    const title = v('mt-title'), desc = v('mt-desc'), kw = v('mt-kw'),
          author = v('mt-author'), url = v('mt-url'), img = v('mt-img');
    const lines = [
      '<!-- Primary Meta Tags -->',
      title  ? `<title>${title}</title>` : '',
      title  ? `<meta name="title" content="${title}">` : '',
      desc   ? `<meta name="description" content="${desc}">` : '',
      kw     ? `<meta name="keywords" content="${kw}">` : '',
      author ? `<meta name="author" content="${author}">` : '',
      '<meta name="robots" content="index, follow">',
      '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">',
      '',
      '<!-- Open Graph / Facebook -->',
      '<meta property="og:type" content="website">',
      url    ? `<meta property="og:url" content="${url}">` : '',
      title  ? `<meta property="og:title" content="${title}">` : '',
      desc   ? `<meta property="og:description" content="${desc}">` : '',
      img    ? `<meta property="og:image" content="${img}">` : '',
      '',
      '<!-- Twitter -->',
      '<meta property="twitter:card" content="summary_large_image">',
      url    ? `<meta property="twitter:url" content="${url}">` : '',
      title  ? `<meta property="twitter:title" content="${title}">` : '',
      desc   ? `<meta property="twitter:description" content="${desc}">` : '',
      img    ? `<meta property="twitter:image" content="${img}">` : '',
    ].filter(l => l !== '');
    document.getElementById('mt-output').value = lines.join('\n');
  },

  // ── Robots.txt Generator
  tRobots() {
    return `<div class="card-head"><i class="bi bi-robot" style="color:#22c55e"></i> Robots.txt Generator</div>
    <div class="g2">
      <div>
        ${this.field('rb-sitemap','Sitemap URL','https://example.com/sitemap.xml','text')}
        <div style="margin-bottom:.875rem">
          <label style="font-size:.8rem;font-weight:600;color:var(--muted);display:block;margin-bottom:.4rem">Crawl Delay (seconds)</label>
          <input id="rb-delay" type="number" value="0" min="0" max="60" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-s);padding:.6rem .875rem;color:var(--text);font-size:.9rem">
        </div>
        <div style="margin-bottom:.875rem">
          <label style="font-size:.8rem;font-weight:600;color:var(--muted);display:block;margin-bottom:.4rem">Disallow Paths (one per line)</label>
          <textarea id="rb-disallow" rows="5" placeholder="/admin/&#10;/private/&#10;/tmp/" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-s);padding:.6rem .875rem;color:var(--text);font-size:.85rem;font-family:monospace;resize:vertical"></textarea>
        </div>
        <div style="margin-bottom:.875rem">
          <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer;font-size:.875rem">
            <input type="checkbox" id="rb-block-gpt" style="width:16px;height:16px"> Block AI crawlers (GPTBot, CCBot, etc.)
          </label>
        </div>
        <button class="scan-btn" onclick="Tools.genRobots()"><i class="bi bi-gear-fill"></i> Generate</button>
      </div>
      <div>
        <div style="font-size:.8rem;font-weight:700;color:var(--muted);margin-bottom:.5rem;text-transform:uppercase;letter-spacing:.06em">robots.txt</div>
        <textarea id="rb-output" rows="18" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-s);padding:.875rem;color:var(--text);font-family:monospace;font-size:.78rem;resize:vertical" readonly></textarea>
        <button class="exp-btn" style="margin-top:.5rem" onclick="Tools.copyOut('rb-output')"><i class="bi bi-clipboard"></i> Copy</button>
      </div>
    </div>`;
  },

  genRobots() {
    const sitemap = document.getElementById('rb-sitemap')?.value?.trim();
    const delay   = document.getElementById('rb-delay')?.value?.trim();
    const disallow= document.getElementById('rb-disallow')?.value?.trim().split('\n').filter(Boolean);
    const blockAI = document.getElementById('rb-block-gpt')?.checked;
    const lines = ['User-agent: *'];
    if (delay && delay !== '0') lines.push(`Crawl-delay: ${delay}`);
    if (disallow?.length) disallow.forEach(p => lines.push(`Disallow: ${p.trim()}`));
    else lines.push('Disallow:');
    lines.push('Allow: /');
    if (sitemap) { lines.push(''); lines.push(`Sitemap: ${sitemap}`); }
    if (blockAI) {
      lines.push('','# Block AI crawlers');
      ['GPTBot','CCBot','anthropic-ai','Claude-Web','Omgilibot','FacebookBot'].forEach(b => {
        lines.push(`User-agent: ${b}`, 'Disallow: /', '');
      });
    }
    document.getElementById('rb-output').value = lines.join('\n');
  },

  // ── Sitemap Generator
  tSitemap() {
    return `<div class="card-head"><i class="bi bi-diagram-3-fill" style="color:#00d4ff"></i> Sitemap XML Generator</div>
    <div class="g2">
      <div>
        ${this.field('sm-domain','Domain','https://example.com','text')}
        <div style="margin-bottom:.875rem">
          <label style="font-size:.8rem;font-weight:600;color:var(--muted);display:block;margin-bottom:.4rem">Pages (one path per line)</label>
          <textarea id="sm-pages" rows="8" placeholder="/&#10;/about&#10;/contact&#10;/blog&#10;/pricing" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-s);padding:.6rem .875rem;color:var(--text);font-size:.85rem;font-family:monospace;resize:vertical"></textarea>
        </div>
        <div style="margin-bottom:.875rem">
          <label style="font-size:.8rem;font-weight:600;color:var(--muted);display:block;margin-bottom:.4rem">Change Frequency</label>
          <select id="sm-freq" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-s);padding:.6rem .875rem;color:var(--text);font-size:.9rem">
            <option>weekly</option><option>daily</option><option>monthly</option><option>yearly</option>
          </select>
        </div>
        <button class="scan-btn" onclick="Tools.genSitemap()"><i class="bi bi-gear-fill"></i> Generate</button>
      </div>
      <div>
        <div style="font-size:.8rem;font-weight:700;color:var(--muted);margin-bottom:.5rem;text-transform:uppercase;letter-spacing:.06em">sitemap.xml</div>
        <textarea id="sm-output" rows="18" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-s);padding:.875rem;color:var(--text);font-family:monospace;font-size:.78rem;resize:vertical" readonly></textarea>
        <button class="exp-btn" style="margin-top:.5rem" onclick="Tools.copyOut('sm-output')"><i class="bi bi-clipboard"></i> Copy XML</button>
      </div>
    </div>`;
  },

  genSitemap() {
    const domain = document.getElementById('sm-domain')?.value?.trim().replace(/\/$/, '');
    const pages  = document.getElementById('sm-pages')?.value?.trim().split('\n').filter(Boolean);
    const freq   = document.getElementById('sm-freq')?.value || 'weekly';
    const today  = new Date().toISOString().split('T')[0];
    const urls   = (pages?.length ? pages : ['/']).map(p => {
      const path = p.startsWith('/') ? p : '/' + p;
      return `  <url>\n    <loc>${domain}${path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${path === '/' ? '1.0' : '0.8'}</priority>\n  </url>`;
    });
    document.getElementById('sm-output').value =
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
  },

  // ── Keyword Density
  tKeyword() {
    return `<div class="card-head"><i class="bi bi-bar-chart-fill" style="color:#a855f7"></i> Keyword Density Checker</div>
    <div style="margin-bottom:.875rem">
      <textarea id="kd-text" rows="8" placeholder="Paste your content here…" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-s);padding:.875rem;color:var(--text);font-size:.9rem;resize:vertical"></textarea>
    </div>
    <button class="scan-btn" onclick="Tools.calcKeyword()"><i class="bi bi-bar-chart-fill"></i> Analyze</button>
    <div id="kd-output" style="margin-top:1.25rem"></div>`;
  },

  calcKeyword() {
    const text = document.getElementById('kd-text')?.value || '';
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w => w.length > 2);
    const stop = new Set(['the','and','for','are','but','not','you','all','can','her','was','one','our','out','day','get','has','him','his','how','its','may','new','now','old','see','two','way','who','boy','did','its','let','put','say','she','too','use','that','this','with','have','from','they','will','been','were','said','each','which','their','there','would','about','could','other','into','than','then','when','where','while','your','more','also','just','like','some','what','over','such','even','most','made','after','before','these','those','should','through']);
    const freq = {};
    words.forEach(w => { if (!stop.has(w)) freq[w] = (freq[w]||0) + 1; });
    const total = words.length;
    const sorted = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,20);
    if (!sorted.length) { document.getElementById('kd-output').innerHTML = '<p style="color:var(--muted)">No content to analyze.</p>'; return; }
    document.getElementById('kd-output').innerHTML = `
      <div style="margin-bottom:.75rem;font-size:.82rem;color:var(--muted)">${total} words analyzed</div>
      <div class="kw-table">
        <div class="kw-header"><span>Keyword</span><span>Count</span><span>Density</span></div>
        ${sorted.map(([w,c])=>`<div class="kw-row">
          <span class="kw-word">${w}</span>
          <span class="kw-count">${c}</span>
          <span class="kw-density"><span class="kw-bar" style="width:${Math.min((c/total)*1000,100)}%"></span>${((c/total)*100).toFixed(2)}%</span>
        </div>`).join('')}
      </div>`;
  },

  // ── Slug Generator
  tSlug() {
    return `<div class="card-head"><i class="bi bi-link-45deg" style="color:#f59e0b"></i> Slug Generator</div>
    ${this.field('sl-input','Page Title or Text','e.g. How to Improve Your SEO Score in 2026','text')}
    <button class="scan-btn" onclick="Tools.genSlug()"><i class="bi bi-gear-fill"></i> Generate Slug</button>
    <div id="sl-output" style="margin-top:1.25rem"></div>`;
  },

  genSlug() {
    const val = document.getElementById('sl-input')?.value || '';
    const slug = val.toLowerCase().trim()
      .replace(/[^\w\s-]/g,'').replace(/[\s_-]+/g,'-').replace(/^-+|-+$/g,'');
    document.getElementById('sl-output').innerHTML = slug ? `
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-s);padding:.875rem 1rem;display:flex;align-items:center;gap:.75rem;flex-wrap:wrap">
        <code style="flex:1;color:var(--primary2);font-size:1rem;word-break:break-all">${slug}</code>
        <button class="exp-btn" onclick="navigator.clipboard.writeText('${slug.replace(/'/g,"\\'")}').then(()=>{const t=document.getElementById('toast');t.textContent='Copied!';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000)})"><i class="bi bi-clipboard"></i> Copy</button>
      </div>` : '';
  },

  // ── HTML Minifier
  tMinifier() {
    return `<div class="card-head"><i class="bi bi-code-slash" style="color:#f04444"></i> HTML Minifier</div>
    <div class="g2">
      <div>
        <label style="font-size:.8rem;font-weight:600;color:var(--muted);display:block;margin-bottom:.4rem">Input HTML</label>
        <textarea id="mn-input" rows="14" placeholder="Paste HTML here…" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-s);padding:.875rem;color:var(--text);font-size:.82rem;font-family:monospace;resize:vertical"></textarea>
        <button class="scan-btn" style="margin-top:.5rem" onclick="Tools.minifyHTML()"><i class="bi bi-lightning-fill"></i> Minify</button>
      </div>
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.4rem">
          <label style="font-size:.8rem;font-weight:600;color:var(--muted)">Minified Output</label>
          <span id="mn-savings" style="font-size:.75rem;color:var(--green)"></span>
        </div>
        <textarea id="mn-output" rows="14" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-s);padding:.875rem;color:var(--text);font-size:.82rem;font-family:monospace;resize:vertical" readonly></textarea>
        <button class="exp-btn" style="margin-top:.5rem" onclick="Tools.copyOut('mn-output')"><i class="bi bi-clipboard"></i> Copy</button>
      </div>
    </div>`;
  },

  minifyHTML() {
    const input = document.getElementById('mn-input')?.value || '';
    const minified = input
      .replace(/<!--[\s\S]*?-->/g,'')
      .replace(/\s+/g,' ')
      .replace(/>\s+</g,'><')
      .replace(/\s+>/g,'>')
      .replace(/<\s+/g,'<')
      .trim();
    document.getElementById('mn-output').value = minified;
    const saved = (((input.length - minified.length) / input.length) * 100).toFixed(1);
    document.getElementById('mn-savings').textContent = input.length ? `Saved ${saved}% (${input.length - minified.length} chars)` : '';
  },

  // ── Text Counter
  tCounter() {
    return `<div class="card-head"><i class="bi bi-file-text-fill" style="color:#ec4899"></i> Text Counter</div>
    <textarea id="tc-input" rows="10" placeholder="Paste or type your text here…" oninput="Tools.countText()" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-s);padding:.875rem;color:var(--text);font-size:.9rem;resize:vertical;margin-bottom:1rem"></textarea>
    <div class="stats-row" style="grid-template-columns:repeat(auto-fit,minmax(110px,1fr))">
      <div class="stat-card"><div class="stat-icon">📝</div><div class="stat-val" id="tc-words" style="color:var(--primary2)">0</div><div class="stat-lbl">Words</div></div>
      <div class="stat-card"><div class="stat-icon">🔤</div><div class="stat-val" id="tc-chars" style="color:var(--accent)">0</div><div class="stat-lbl">Characters</div></div>
      <div class="stat-card"><div class="stat-icon">📄</div><div class="stat-val" id="tc-sentences" style="color:var(--green)">0</div><div class="stat-lbl">Sentences</div></div>
      <div class="stat-card"><div class="stat-icon">¶</div><div class="stat-val" id="tc-paras" style="color:var(--purple)">0</div><div class="stat-lbl">Paragraphs</div></div>
      <div class="stat-card"><div class="stat-icon">⏱️</div><div class="stat-val" id="tc-read" style="color:var(--yellow)">0</div><div class="stat-lbl">Min Read</div></div>
    </div>`;
  },

  countText() {
    const t = document.getElementById('tc-input')?.value || '';
    const words = t.trim() ? t.trim().split(/\s+/).length : 0;
    document.getElementById('tc-words').textContent     = words;
    document.getElementById('tc-chars').textContent     = t.length;
    document.getElementById('tc-sentences').textContent = (t.match(/[.!?]+/g)||[]).length;
    document.getElementById('tc-paras').textContent     = t.trim() ? t.split(/\n\s*\n/).filter(Boolean).length : 0;
    document.getElementById('tc-read').textContent      = Math.max(1, Math.ceil(words / 200));
  },

  // ── SEO Checklist
  tChecklist() {
    const items = [
      {cat:'On-Page SEO', checks:['Page has a unique title tag (50–60 chars)','Meta description is present (120–160 chars)','Page has exactly one H1 tag','H2/H3 tags used for content structure','Target keyword in title, H1, and first paragraph','URL is short and descriptive (slug)','Canonical tag is set','No duplicate content on page']},
      {cat:'Images', checks:['All images have alt text','Images are compressed (WebP/AVIF preferred)','Lazy loading enabled on images','Image file names are descriptive']},
      {cat:'Technical', checks:['Site uses HTTPS','Page loads in under 3 seconds','Mobile-friendly / responsive design','Viewport meta tag present','robots.txt file exists','XML sitemap submitted to Google','No broken links (404s)','Structured data / Schema.org markup']},
      {cat:'Social & OG', checks:['Open Graph title and description set','OG image is 1200x630px','Twitter card meta tags present','Social media profiles linked']},
      {cat:'Content', checks:['Content is at least 300 words','Readability score is 60+','No keyword stuffing','Internal links to related pages','External links to authoritative sources']},
    ];
    const html = items.map(cat => `
      <div style="margin-bottom:1.5rem">
        <div style="font-size:.82rem;font-weight:700;color:var(--primary2);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.75rem;display:flex;align-items:center;gap:.4rem"><i class="bi bi-check2-all"></i>${cat.cat}</div>
        ${cat.checks.map((c,i) => `
          <label style="display:flex;align-items:center;gap:.75rem;padding:.52rem .72rem;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-s);margin-bottom:.35rem;cursor:pointer;font-size:.875rem;transition:border-color .2s" onmouseover="this.style.borderColor='var(--border-h)'" onmouseout="this.style.borderColor='var(--border)'">
            <input type="checkbox" style="width:16px;height:16px;flex-shrink:0;accent-color:var(--primary)" onchange="Tools.updateChecklist()">
            <span>${c}</span>
          </label>`).join('')}
      </div>`).join('');
    const total = items.reduce((a,c)=>a+c.checks.length,0);
    return `<div class="card-head"><i class="bi bi-check2-all" style="color:#00d4ff"></i> SEO Checklist <span id="cl-score" class="badge-cnt">0/${total}</span></div>
    <div id="cl-progress" style="height:6px;background:var(--bg4);border-radius:10px;margin-bottom:1.5rem;overflow:hidden"><div id="cl-bar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--primary),var(--accent));border-radius:10px;transition:width .3s"></div></div>
    ${html}`;
  },

  updateChecklist() {
    const all   = document.querySelectorAll('#toolOutput input[type=checkbox]');
    const done  = [...all].filter(c=>c.checked).length;
    const total = all.length;
    const pct   = Math.round((done/total)*100);
    document.getElementById('cl-score').textContent = `${done}/${total}`;
    document.getElementById('cl-bar').style.width   = pct + '%';
  },

  field(id, label, placeholder, type='text') {
    if (type === 'textarea') return `<div style="margin-bottom:.875rem"><label style="font-size:.8rem;font-weight:600;color:var(--muted);display:block;margin-bottom:.4rem">${label}</label><textarea id="${id}" rows="4" placeholder="${placeholder}" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-s);padding:.6rem .875rem;color:var(--text);font-size:.9rem;resize:vertical"></textarea></div>`;
    return `<div style="margin-bottom:.875rem"><label style="font-size:.8rem;font-weight:600;color:var(--muted);display:block;margin-bottom:.4rem">${label}</label><input id="${id}" type="${type}" placeholder="${placeholder}" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius-s);padding:.6rem .875rem;color:var(--text);font-size:.9rem"></div>`;
  },

  wireOutputs(tool) {
    if (tool === 'counter') this.countText();
  }
};

document.addEventListener('DOMContentLoaded', () => Tools.init());
