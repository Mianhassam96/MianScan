const Screenshot = {
  // Renders a preview iframe of the scanned URL and captures sections
  async capture(url) {
    if (typeof html2canvas === 'undefined') {
      UI.toast('Screenshot library not loaded'); return;
    }

    UI.toast('Capturing preview…');

    // We render a mini iframe, then capture it
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:2rem';

    const title = document.createElement('div');
    title.style.cssText = 'color:#fff;font-size:1rem;font-weight:700;opacity:.8';
    title.textContent = 'Page Preview — ' + url;

    const frame = document.createElement('iframe');
    frame.src = url;
    frame.style.cssText = 'width:1200px;max-width:90vw;height:70vh;border:none;border-radius:12px;background:#fff;box-shadow:0 20px 60px rgba(0,0,0,.5)';
    frame.sandbox = 'allow-scripts allow-same-origin';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:.75rem';

    const btnCapture = document.createElement('button');
    btnCapture.style.cssText = 'background:linear-gradient(135deg,#6470ff,#a855f7);color:#fff;border:none;border-radius:10px;padding:.6rem 1.5rem;font-weight:700;cursor:pointer;font-size:.9rem';
    btnCapture.innerHTML = '<i class="bi bi-camera-fill"></i> Capture Screenshot';

    const btnClose = document.createElement('button');
    btnClose.style.cssText = 'background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:10px;padding:.6rem 1.5rem;font-weight:600;cursor:pointer;font-size:.9rem';
    btnClose.textContent = 'Close';

    btnCapture.addEventListener('click', async () => {
      btnCapture.textContent = 'Capturing…';
      btnCapture.disabled = true;
      try {
        const canvas = await html2canvas(frame.contentDocument?.body || frame, {
          useCORS: true, allowTaint: true, scale: 1,
          width: frame.offsetWidth, height: frame.offsetHeight
        });
        const link = document.createElement('a');
        link.download = `mianscan-preview-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        UI.toast('Screenshot saved!');
      } catch(e) {
        // Fallback: capture the iframe element itself
        try {
          const canvas = await html2canvas(frame, { useCORS:true, scale:1 });
          const link = document.createElement('a');
          link.download = `mianscan-preview-${Date.now()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          UI.toast('Screenshot saved!');
        } catch(e2) {
          UI.toast('Screenshot blocked by site security policy');
        }
      }
      btnCapture.textContent = 'Capture Screenshot';
      btnCapture.disabled = false;
    });

    btnClose.addEventListener('click', () => document.body.removeChild(modal));
    btnRow.append(btnCapture, btnClose);
    modal.append(title, frame, btnRow);
    document.body.appendChild(modal);
  }
};
