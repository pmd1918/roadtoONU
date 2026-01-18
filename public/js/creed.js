(() => {
  const wordEl = document.querySelector(".creed-word");
  const ellipsisEl = document.querySelector(".creed-ellipsis");
  if (!wordEl || !ellipsisEl) return;

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

  function setHighlight(on) {
    wordEl.classList.toggle("is-highlight", on);
  }

  function typeWord(word, i = 0) {
    setHighlight(true);

    if (i < word.length) {
      typedWord += word.charAt(i);
      wordEl.textContent = typedWord;
      setTimeout(() => typeWord(word, i + 1), TYPE_SPEED);
    } else {
      // word complete -> type ellipsis
      typeEllipsis(0);
    }
  }

  function typeEllipsis(i = 0) {
    if (i < ELLIPSIS.length) {
      typedEllipsis += ELLIPSIS.charAt(i);
      ellipsisEl.textContent = typedEllipsis;
      setTimeout(() => typeEllipsis(i + 1), TYPE_SPEED);
    } else {
      // hold with highlight on word
      setTimeout(deleteEllipsis, PAUSE_AFTER_TYPED);
    }
  }

  function deleteEllipsis() {
    // ellipsis is not highlighted, so no class changes here
    if (typedEllipsis.length > 0) {
      typedEllipsis = typedEllipsis.slice(0, -1);
      ellipsisEl.textContent = typedEllipsis;
      setTimeout(deleteEllipsis, DELETE_SPEED);
    } else {
      setTimeout(deleteWord, PAUSE_AFTER_DELETED);
    }
  }

  function deleteWord() {
    setHighlight(false);

    if (typedWord.length > 0) {
      typedWord = typedWord.slice(0, -1);
      wordEl.textContent = typedWord;
      setTimeout(deleteWord, DELETE_SPEED);
    } else {
      setTimeout(nextWordOrHoldTo30s, PAUSE_AFTER_DELETED);
    }
  }

  function nextWordOrHoldTo30s() {
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

    setTimeout(startCycle, remaining);
  }

  function startCycle() {
    cycleStart = Date.now();
    wordIndex = 0;

    typedWord = "";
    typedEllipsis = "";
    wordEl.textContent = "";
    ellipsisEl.textContent = "";
    setHighlight(false);

    typeWord(words[wordIndex], 0);
  }

  startCycle();
})();
