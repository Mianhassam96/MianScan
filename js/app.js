document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const scanBtn = document.getElementById('scanBtn');
    const progressWrap = document.getElementById('scanProgress');
    const progressBar = document.getElementById('progressBar');
    const progressLabel = document.getElementById('progressLabel');
    const resultsSection = document.getElementById('resultsSection');

    // Theme
    const savedTheme = localStorage.getItem('mianscan_theme');
    if (savedTheme === 'light') document.body.classList.add('light-mode');

    document.getElementById('themeToggle').addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('mianscan_theme', isLight ? 'light' : 'dark');
        document.querySelector('#themeToggle i').className = isLight ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    });

    // Example buttons
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            urlInput.value = btn.dataset.url;
            startScan();
        });
    });

    // Scan button
    scanBtn.addEventListener('click', startScan);
    urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') startScan(); });

    // History
    document.getElementById('historyBtn').addEventListener('click', () => {
        History.render();
        new bootstrap.Offcanvas(document.getElementById('historyPanel')).show();
    });

    // Tabs
    document.getElementById('resultTabs').addEventListener('click', e => {
        const btn = e.target.closest('[data-tab]');
        if (!btn || !Scanner.currentData) return;
        document.querySelectorAll('.result-tabs .nav-link').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        UI.renderTab(btn.dataset.tab, Scanner.currentData);
    });

    // Export
    document.getElementById('exportJSON').addEventListener('click', () => Scanner.currentData && Exporter.toJSON(Scanner.currentData));
    document.getElementById('exportPDF').addEventListener('click', () => Scanner.currentData && Exporter.toPDF(Scanner.currentData));
    document.getElementById('copyReport').addEventListener('click', () => Scanner.currentData && Exporter.copyReport(Scanner.currentData));

    async function startScan() {
        let url = urlInput.value.trim();
        if (!url) { UI.toast('Please enter a URL'); return; }
        if (!url.startsWith('http')) url = 'https://' + url;

        try {
            new URL(url);
        } catch {
            UI.toast('Invalid URL'); return;
        }

        urlInput.value = url;
        scanBtn.disabled = true;
        scanBtn.innerHTML = '<i class="bi bi-radar me-2 spinning"></i>Scanning...';
        progressWrap.classList.remove('d-none');
        resultsSection.classList.add('d-none');

        try {
            const data = await Scanner.scan(url, (label, pct) => {
                progressBar.style.width = pct + '%';
                progressLabel.textContent = label;
            });

            History.save(url);

            // Show results
            resultsSection.classList.remove('d-none');
            UI.renderOverview(data);

            // Reset to overview tab
            document.querySelectorAll('.result-tabs .nav-link').forEach(b => b.classList.remove('active'));
            document.querySelector('[data-tab="overview"]').classList.add('active');
            UI.renderTab('overview', data);

            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (err) {
            UI.toast('Scan failed: ' + err.message);
            console.error(err);
        } finally {
            scanBtn.disabled = false;
            scanBtn.innerHTML = '<i class="bi bi-radar me-2"></i>Analyze';
            setTimeout(() => progressWrap.classList.add('d-none'), 1000);
        }
    }
});
