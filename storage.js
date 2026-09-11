(function () {
  // Compatibility shim for previously cached client scripts.
  // Keeps legacy references from failing while the static site is served.
  window.AISecurityStorage = {
    get: function (key) {
      try {
        return window.localStorage.getItem(String(key));
      } catch (_error) {
        return null;
      }
    },
    set: function (key, value) {
      try {
        window.localStorage.setItem(String(key), String(value));
        return true;
      } catch (_error) {
        return false;
      }
    }
  };
})();
