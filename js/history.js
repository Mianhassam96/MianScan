const History = {
    KEY: 'mianscan_history',

    save(url) {
        const list = this.getAll();
        const entry = { url, time: new Date().toISOString() };
        const filtered = list.filter(e => e.url !== url);
        filtered.unshift(entry);
        localStorage.setItem(this.KEY, JSON.stringify(filtered.slice(0, 20)));
    },

    getAll() {
        try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
        catch { return []; }
    },

    render() {
        const list = this.getAll();
        const container = document.getElementById('historyList');
        if (!list.length) {
            container.innerHTML = '<p class="text-muted text-center mt-4">No scans yet</p>';
            return;
        }
        container.innerHTML = list.map(e => `
            <div class="history-item" onclick="History.load('${e.url}')">
                <div>
                    <div class="history-url">${e.url}</div>
                    <div class="history-time">${new Date(e.time).toLocaleString()}</div>
                </div>
                <i class="bi bi-arrow-right-circle text-muted"></i>
            </div>
        `).join('');
    },

    load(url) {
        document.getElementById('urlInput').value = url;
        bootstrap.Offcanvas.getInstance(document.getElementById('historyPanel'))?.hide();
        document.getElementById('scanBtn').click();
    }
};
