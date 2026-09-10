(() => {
  const revealItems = document.querySelectorAll(".reveal");
  if (revealItems.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealItems.forEach((item) => observer.observe(item));
  }

  const counters = document.querySelectorAll("[data-count]");
  const animateCounter = (el) => {
    const target = Number(el.dataset.count);
    if (Number.isNaN(target)) {
      return;
    }
    const start = performance.now();
    const duration = 1400;

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.floor(target * eased));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = String(target);
      }
    };
    requestAnimationFrame(step);
  };

  if (counters.length) {
    const seen = new WeakSet();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !seen.has(entry.target)) {
            seen.add(entry.target);
            animateCounter(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    counters.forEach((el) => observer.observe(el));
  }
})();
