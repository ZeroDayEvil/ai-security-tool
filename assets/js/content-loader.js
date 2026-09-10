(() => {
  const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value || "");
  const asLower = (value) => String(value || "").trim().toLowerCase();
  const normalizePrefix = (value) => {
    if (!value) {
      return "";
    }
    return value.endsWith("/") ? value : `${value}/`;
  };

  const toLink = (prefix, value) => {
    if (!value) {
      return "";
    }
    if (isAbsoluteUrl(value) || value.startsWith("mailto:")) {
      return value;
    }
    return `${normalizePrefix(prefix)}${value}`;
  };

  const toBoolean = (value) => asLower(value) === "true";

  const loadData = async (source) => {
    const response = await fetch(source, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Unable to fetch ${source}`);
    }
    return response.json();
  };

  const createEmptyState = (message) => {
    const node = document.createElement("div");
    node.className = "empty-state";
    node.textContent = message;
    return node;
  };

  const applyTypeClass = (node, value) => {
    const validTypes = new Set(["security", "feature", "patch", "module"]);
    node.className = "pill";
    if (validTypes.has(value)) {
      node.classList.add(`pill-${value}`);
    }
  };

  const applyDataOptions = (items, options) => {
    let filtered = Array.isArray(items) ? [...items] : [];

    if (options.filter) {
      const wanted = asLower(options.filter);
      filtered = filtered.filter((item) => asLower(item.type) === wanted || asLower(item.channel) === wanted);
    }

    if (options.latestOnly) {
      filtered = filtered.filter((item) => Boolean(item.latest));
    }

    if (options.skipLatest) {
      filtered = filtered.filter((item) => !Boolean(item.latest));
    }

    return options.limit ? filtered.slice(0, options.limit) : filtered;
  };

  const renderUpdates = (host, items, options) => {
    host.innerHTML = "";

    if (!Array.isArray(items) || !items.length) {
      host.appendChild(createEmptyState("No updates published yet."));
      return;
    }

    const mapped = applyDataOptions(items, options);
    mapped.forEach((entry) => {
      const card = document.createElement("article");
      card.className = "update-item";

      const metaRow = document.createElement("div");
      metaRow.className = "meta-row";

      const type = document.createElement("span");
      applyTypeClass(type, String(entry.type || "").toLowerCase());
      type.textContent = entry.type || "Update";

      const version = document.createElement("span");
      version.className = "pill pill-module";
      version.textContent = entry.version || "Rolling";

      const date = document.createElement("span");
      date.className = "meta-date";
      date.textContent = entry.date || "";

      metaRow.append(type, version, date);

      const title = document.createElement("h3");
      title.className = "item-title";
      title.textContent = entry.title || "Untitled update";

      const summary = document.createElement("p");
      summary.className = "item-summary";
      summary.textContent = entry.summary || "No summary provided.";

      const links = document.createElement("div");
      links.className = "item-links";

      const linkCandidates = [
        { label: "Release notes", value: entry.changelog },
        { label: "Module page", value: entry.page },
        { label: "Repository", value: entry.repo },
        { label: "Advisory", value: entry.advisory }
      ];

      linkCandidates.forEach((item) => {
        const href = toLink(options.linkPrefix, item.value);
        if (!href) {
          return;
        }
        const anchor = document.createElement("a");
        anchor.className = "text-link";
        anchor.href = href;
        anchor.textContent = item.label;
        if (isAbsoluteUrl(href)) {
          anchor.target = "_blank";
          anchor.rel = "noreferrer";
        }
        links.appendChild(anchor);
      });

      card.append(metaRow, title, summary, links);
      host.appendChild(card);
    });
  };

  const renderModules = (host, items, options) => {
    host.innerHTML = "";

    if (!Array.isArray(items) || !items.length) {
      host.appendChild(createEmptyState("No modules in catalog yet."));
      return;
    }

    const mapped = applyDataOptions(items, options);
    mapped.forEach((entry) => {
      const card = document.createElement("article");
      card.className = "module-item";

      const metaRow = document.createElement("div");
      metaRow.className = "meta-row";

      const status = document.createElement("span");
      applyTypeClass(status, "module");
      status.textContent = (entry.status || "active").toUpperCase();

      const type = document.createElement("span");
      type.className = "pill pill-feature";
      type.textContent = entry.type || "Security Module";

      const date = document.createElement("span");
      date.className = "meta-date";
      date.textContent = entry.updated || "";
      metaRow.append(status, type, date);

      const title = document.createElement("h3");
      title.className = "item-title";
      title.textContent = entry.name || "Unnamed module";

      const summary = document.createElement("p");
      summary.className = "item-summary";
      summary.textContent = entry.summary || "No summary provided.";

      const author = document.createElement("p");
      author.className = "item-summary";
      const authorLabel = document.createElement("strong");
      authorLabel.textContent = entry.author || "Unknown";
      author.append("Author: ", authorLabel);

      const links = document.createElement("div");
      links.className = "item-links";

      const modulePage = toLink(options.linkPrefix, entry.page || "");
      if (modulePage) {
        const pageLink = document.createElement("a");
        pageLink.className = "text-link";
        pageLink.href = modulePage;
        pageLink.textContent = "Module page";
        links.appendChild(pageLink);
      }

      const repo = toLink(options.linkPrefix, entry.repo || "");
      if (repo) {
        const repoLink = document.createElement("a");
        repoLink.className = "text-link";
        repoLink.href = repo;
        repoLink.textContent = "Repository";
        if (isAbsoluteUrl(repo)) {
          repoLink.target = "_blank";
          repoLink.rel = "noreferrer";
        }
        links.appendChild(repoLink);
      }

      const authorLink = toLink(options.linkPrefix, entry.authorUrl || "");
      if (authorLink) {
        const profileLink = document.createElement("a");
        profileLink.className = "text-link";
        profileLink.href = authorLink;
        profileLink.textContent = "Author profile";
        if (isAbsoluteUrl(authorLink)) {
          profileLink.target = "_blank";
          profileLink.rel = "noreferrer";
        }
        links.appendChild(profileLink);
      }

      card.append(metaRow, title, summary, author, links);
      host.appendChild(card);
    });
  };

  const renderReleases = (host, items, options) => {
    host.innerHTML = "";

    if (!Array.isArray(items) || !items.length) {
      host.appendChild(createEmptyState("No release data yet."));
      return;
    }

    const mapped = applyDataOptions(items, options);
    mapped.forEach((entry) => {
      const card = document.createElement("article");
      card.className = "release-item";
      if (entry.latest) {
        card.id = "latest-release";
      }

      const metaRow = document.createElement("div");
      metaRow.className = "meta-row";

      const channel = document.createElement("span");
      applyTypeClass(channel, "feature");
      channel.textContent = (entry.channel || "stable").toUpperCase();

      const version = document.createElement("span");
      version.className = "pill pill-security";
      version.textContent = entry.version || "v0";

      const date = document.createElement("span");
      date.className = "meta-date";
      date.textContent = entry.date || "";
      metaRow.append(channel, version, date);

      const title = document.createElement("h3");
      title.className = "item-title";
      title.textContent = entry.title || "Release";

      const summary = document.createElement("p");
      summary.className = "item-summary";
      summary.textContent = entry.summary || "No release notes.";

      const filesWrap = document.createElement("div");
      filesWrap.className = "release-files";

      if (Array.isArray(entry.files) && entry.files.length) {
        entry.files.forEach((file) => {
          const item = document.createElement("div");
          item.className = "release-file";

          const name = document.createElement("span");
          name.textContent = file.name || "Build";

          const action = document.createElement("a");
          action.className = "text-link";
          action.href = toLink(options.linkPrefix, file.url || "");
          action.textContent = "Download";
          if (isAbsoluteUrl(action.href)) {
            action.target = "_blank";
            action.rel = "noreferrer";
          }

          item.append(name, action);
          filesWrap.appendChild(item);
        });
      }

      const note = document.createElement("p");
      note.className = "muted-note mono";
      note.textContent = entry.note || "";

      card.append(metaRow, title, summary, filesWrap, note);
      host.appendChild(card);
    });
  };

  const renderDownloads = (host, items, options) => {
    host.innerHTML = "";

    if (!Array.isArray(items) || !items.length) {
      host.appendChild(createEmptyState("No download targets configured yet."));
      return;
    }

    const mapped = applyDataOptions(items, options);
    mapped.forEach((entry) => {
      const card = document.createElement("article");
      card.className = "download-card";

      const top = document.createElement("div");
      top.className = "download-top";
      top.innerHTML = `
        <h3>${entry.os || "Unknown OS"}</h3>
        <span class="pill pill-feature">${entry.arch || "generic"}</span>
      `;

      const text = document.createElement("p");
      text.className = "item-summary";
      text.textContent = entry.summary || "";

      const actions = document.createElement("div");
      actions.className = "download-actions";

      (entry.files || []).forEach((file) => {
        const button = document.createElement("a");
        button.className = "btn btn-secondary btn-small";
        button.textContent = file.label || file.name || "Download";
        button.href = toLink(options.linkPrefix, file.url || "");
        if (isAbsoluteUrl(button.href)) {
          button.target = "_blank";
          button.rel = "noreferrer";
        }
        actions.appendChild(button);
      });

      const note = document.createElement("p");
      note.className = "muted-note";
      note.textContent = entry.note || "";

      card.append(top, text, actions, note);
      host.appendChild(card);
    });
  };

  const renderers = {
    "updates-list": renderUpdates,
    "modules-list": renderModules,
    "releases-list": renderReleases,
    "downloads-matrix": renderDownloads
  };

  const bootstrap = async () => {
    const nodes = document.querySelectorAll("[data-component]");
    if (!nodes.length) {
      return;
    }

    await Promise.all(
      Array.from(nodes).map(async (node) => {
        const type = node.dataset.component;
        const source = node.dataset.source;
        const renderer = renderers[type];
        if (!source || !renderer) {
          return;
        }

        const options = {
          limit: node.dataset.limit ? Number(node.dataset.limit) : 0,
          linkPrefix: node.dataset.linkPrefix || "",
          filter: node.dataset.filter || "",
          latestOnly: toBoolean(node.dataset.latestOnly),
          skipLatest: toBoolean(node.dataset.skipLatest)
        };

        try {
          const payload = await loadData(source);
          renderer(node, payload, options);
        } catch (error) {
          node.innerHTML = "";
          node.appendChild(createEmptyState(`Unable to load ${type}.`));
        }
      })
    );
  };

  bootstrap();
})();
