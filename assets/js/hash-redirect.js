(() => {
  const marker = document.querySelector("[data-hash-redirect]");
  if (!marker) {
    return;
  }

  const source = marker.getAttribute("data-hash-redirect");
  if (!source) {
    return;
  }

  const currentHash = decodeURIComponent(window.location.hash.replace(/^#/, "").trim());
  if (!currentHash) {
    return;
  }

  const redirectToDownloads = async () => {
    try {
      const response = await fetch(source, { cache: "no-cache" });
      if (!response.ok) {
        return;
      }
      const mapping = await response.json();
      if (!mapping[currentHash]) {
        return;
      }
      window.location.replace(`./downloads/#${encodeURIComponent(currentHash)}`);
    } catch (_error) {
      return;
    }
  };

  redirectToDownloads();
})();
