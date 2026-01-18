(() => {
    const sections = document.querySelectorAll(".glowing-card-section");
    if (!sections.length) return;
  
    // Only do scroll-trigger on touch/coarse pointer devices (mobile/tablet)
    const isCoarsePointer =
      window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  
    if (!isCoarsePointer) return;
  
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle("is-active", entry.isIntersecting);
        }
      },
      {
        root: null,
        threshold: 0.25,          // becomes active when ~25% visible
        rootMargin: "0px 0px -15% 0px", // keeps it active a bit longer while scrolling
      }
    );
  
    sections.forEach((s) => observer.observe(s));
  })();
  