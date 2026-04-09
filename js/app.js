document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const scanBtn  = document.getElementById('scanBtn');
    const progress = document.getElementById('scanProgress');
    const fill     = document.getElementById('progressFill');
    const label    = document.getElementById('progressLabel');
    const results  = document.getElementById('results');

    // Theme
    if (localStorage.getItem('ms_theme') === 'light') {
        document.body.classList.add('light');
        document.querySelector('#themeToggle i').className = 'bi bi-sun-fill';
    }

    document.getElementById('themeToggle').addEventListener('click', () => {
        document.body.classList.toggle('light');
        const light = document.body.classList.contains('light');
        localStorage.setItem('ms_theme', light ? 'light' : 'dark');
        document.querySelector('#themeToggle i').className = light ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    });

    // Example buttons
    document.querySelectorAll('.ex-btn').forEach(btn =>
        btn.addEventListener('click', () => { urlInput.value = btn.dataset.url; run(); })
    );

    // Scan
    scanBtn.addEventListener('click', run);
    urlInput.addEventListener('keydown', e => e.key === 'Enter' && run());

    // Tabs
    document.getElementById('tabs').addEventListener('click', e => {
        const btn = e.target.closest('.tab');
        if (!btn || !Scanner.currentData) return;
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        UI.renderTab(btn.dataset.tab, Scanner.currentData);
    });

    // Export
    document.getElementById('exportJSON').addEventListener('click', () => Scanner.currentData && Exporter.toJSON(Scanner.currentData));
    document.getElementById('exportPDF').addEventListener('click',  () => Scanner.currentData && Exporter.toPDF(Scanner.currentData));
    document.getElementById('copyReport').addEventListener('click', () => Scanner.currentData && Exporter.copyReport(Scanner.currentData));

    async function run() {
        let url = urlInput.value.trim();
        if (!url) { UI.toast('Enter a URL first'); return; }
        if (!url.startsWith('http')) url = 'https://' + url;
        try { new URL(url); } catch { UI.toast('Invalid URL'); return; }
        urlInput.value = url;

        // Reset UI
        scanBtn.disabled = true;
        scanBtn.innerHTML = '<i class="bi bi-radar spin me-2"></i>Scanning...';
        progress.classList.remove('d-none');
        results.classList.add('d-none');
        fill.style.width = '0%';

        try {
            const data = await Scanner.scan(url, (msg, pct) => {
                fill.style.width = pct + '%';
                label.textContent = msg;
            });

            results.classList.remove('d-none');
            UI.renderOverview(data);

            // Reset to overview tab
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelector('[data-tab="overview"]').classList.add('active');
            UI.renderTab('overview', data);

            results.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (err) {
            UI.toast('Scan failed: ' + err.message);
        } finally {
            scanBtn.disabled = false;
            scanBtn.innerHTML = '<i class="bi bi-radar me-2"></i>Analyze';
            setTimeout(() => progress.classList.add('d-none'), 800);
        }
    }
});
