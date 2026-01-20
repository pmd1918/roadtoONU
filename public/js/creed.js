(() => {
  const section = document.querySelector(".creed-wrap");
  const wordEl = document.querySelector(".creed-word");
  const ellipsisEl = document.querySelector(".creed-ellipsis");
  if (!section || !wordEl || !ellipsisEl) return;

  const words = ["Brotherhood", "Service", "Democracy"];
  const ELLIPSIS = "...";

  const TYPE_SPEED = 50;
  const DELETE_SPEED = 35;

  const PAUSE_AFTER_TYPED = 10000; // 10 seconds after ellipsis finishes
  const PAUSE_AFTER_DELETED = 250;

  const CYCLE_TOTAL = 30000; // hold on Democracy until the 30s mark

  let wordIndex = 0;
  let typedWord = "";
  let typedEllipsis = "";
  let cycleStart = 0;
  let isVisible = false;
  let currentTimeout = null;

  function setHighlight(on) {
    wordEl.classList.toggle("is-highlight", on);
  }

  function scheduleNext(fn, delay) {
    // Clear any existing timeout
    if (currentTimeout) {
      clearTimeout(currentTimeout);
    }
    // Only schedule if visible
    if (isVisible) {
      currentTimeout = setTimeout(fn, delay);
    }
  }

  function typeWord(word, i = 0) {
    if (!isVisible) return;
    setHighlight(true);

    if (i < word.length) {
      typedWord += word.charAt(i);
      wordEl.textContent = typedWord;
      scheduleNext(() => typeWord(word, i + 1), TYPE_SPEED);
    } else {
      // word complete -> type ellipsis
      typeEllipsis(0);
    }
  }

  function typeEllipsis(i = 0) {
    if (!isVisible) return;
    if (i < ELLIPSIS.length) {
      typedEllipsis += ELLIPSIS.charAt(i);
      ellipsisEl.textContent = typedEllipsis;
      scheduleNext(() => typeEllipsis(i + 1), TYPE_SPEED);
    } else {
      // hold with highlight on word
      scheduleNext(deleteEllipsis, PAUSE_AFTER_TYPED);
    }
  }

  function deleteEllipsis() {
    if (!isVisible) return;
    // ellipsis is not highlighted, so no class changes here
    if (typedEllipsis.length > 0) {
      typedEllipsis = typedEllipsis.slice(0, -1);
      ellipsisEl.textContent = typedEllipsis;
      scheduleNext(deleteEllipsis, DELETE_SPEED);
    } else {
      scheduleNext(deleteWord, PAUSE_AFTER_DELETED);
    }
  }

  function deleteWord() {
    if (!isVisible) return;
    setHighlight(false);

    if (typedWord.length > 0) {
      typedWord = typedWord.slice(0, -1);
      wordEl.textContent = typedWord;
      scheduleNext(deleteWord, DELETE_SPEED);
    } else {
      scheduleNext(nextWordOrHoldTo30s, PAUSE_AFTER_DELETED);
    }
  }

  function nextWordOrHoldTo30s() {
    if (!isVisible) return;
    wordIndex++;

    if (wordIndex < words.length) {
      typedWord = "";
      typedEllipsis = "";
      wordEl.textContent = "";
      ellipsisEl.textContent = "";
      typeWord(words[wordIndex], 0);
      return;
    }

    // After finishing Democracy (ellipsis + deletes), wait until 30s mark then restart
    const elapsed = Date.now() - cycleStart;
    const remaining = Math.max(0, CYCLE_TOTAL - elapsed);

    scheduleNext(startCycle, remaining);
  }

  function startCycle() {
    if (!isVisible) return;
    cycleStart = Date.now();
    wordIndex = 0;

    typedWord = "";
    typedEllipsis = "";
    wordEl.textContent = "";
    ellipsisEl.textContent = "";
    setHighlight(false);

    typeWord(words[wordIndex], 0);
  }

  // Intersection Observer for lazy loading
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          section.classList.remove('paused');
          isVisible = true;
          // Resume or start the cycle
          if (!currentTimeout) {
            startCycle();
          }
        } else {
          section.classList.add('paused');
          isVisible = false;
          // Clear any pending timeouts to stop the animation
          if (currentTimeout) {
            clearTimeout(currentTimeout);
            currentTimeout = null;
          }
        }
      });
    },
    { rootMargin: '100px', threshold: 0 }
  );

  observer.observe(section);
})();
