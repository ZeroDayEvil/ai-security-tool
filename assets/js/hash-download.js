(() => {
  const marker = document.querySelector("[data-hash-downloads]");
  if (!marker) {
    return;
  }

  const source = marker.getAttribute("data-hash-downloads");
  if (!source) {
    return;
  }

  let payload = null;

  const normalizeHash = () => decodeURIComponent(window.location.hash.replace(/^#/, "").trim());

  const triggerBackgroundDownload = (url) => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.setAttribute("aria-hidden", "true");
    iframe.src = url;
    document.body.appendChild(iframe);

    window.setTimeout(() => {
      iframe.remove();
    }, 45000);
  };

  const closeModal = () => {
    const current = document.querySelector(".dl-modal-overlay");
    if (current) {
      current.remove();
    }
  };

  const buildModal = (entry, hash) => {
    closeModal();

    const overlay = document.createElement("div");
    overlay.className = "dl-modal-overlay";
    overlay.innerHTML = `
      <div class="dl-modal" role="dialog" aria-modal="true" aria-label="Download started">
        <h3>Download started</h3>
        <p><strong>${entry.label || hash}</strong> download was triggered in background.</p>
        <p>You can continue with the recommended pages below:</p>
        <div class="item-links">
          <a class="text-link" href="${entry.assetUrl}" target="_blank" rel="noreferrer">Open download manually</a>
          <a class="text-link" href="${entry.modulePage || "../modules/"}">Open related module page</a>
          <a class="text-link" href="${entry.mainSite || "../"}">Open main website</a>
          <a class="text-link" href="${entry.mainRepo || "https://github.com/ZeroDayEvil/ai-security-tool"}" target="_blank" rel="noreferrer">Open main repository</a>
        </div>
        <div class="dl-modal-actions">
          <button type="button" class="btn btn-primary btn-small" data-dl-modal-close>Continue browsing</button>
        </div>
      </div>
    `;

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeModal();
      }
    });

    overlay.querySelector("[data-dl-modal-close]").addEventListener("click", closeModal);
    document.body.appendChild(overlay);
  };

  const triggerHashDownload = (hashValue) => {
    if (!hashValue || !payload) {
      return;
    }
    const entry = payload[hashValue];
    if (!entry || !entry.assetUrl) {
      return;
    }

    triggerBackgroundDownload(entry.assetUrl);
    buildModal(entry, hashValue);
  };

  const boot = async () => {
    try {
      const response = await fetch(source, { cache: "no-cache" });
      if (!response.ok) {
        return;
      }
      payload = await response.json();
    } catch (_error) {
      return;
    }

    triggerHashDownload(normalizeHash());
    window.addEventListener("hashchange", () => triggerHashDownload(normalizeHash()));
  };

  boot();
})();
