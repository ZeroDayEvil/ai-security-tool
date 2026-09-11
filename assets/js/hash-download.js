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

  const createDownloadAnchor = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.rel = "noopener noreferrer";
    if (filename) {
      link.setAttribute("download", filename);
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <p><strong>${entry.label || hash}</strong> is being downloaded automatically.</p>
        <p>You can continue with the recommended pages below:</p>
        <div class="item-links">
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

    createDownloadAnchor(entry.assetUrl, hashValue);
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
