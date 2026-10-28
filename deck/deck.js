// Slide navigation: arrows / space / swipe, #n deep links, N for speaker notes, F for fullscreen.
(() => {
  const deck = document.querySelector('.deck');
  const slides = [...deck.querySelectorAll('.slide')];
  const total = slides.length;
  const progress = document.querySelector('.progress');
  const notesPanel = document.querySelector('.notes-panel');
  let current = 0;

  slides.forEach((slide, n) => {
    const footer = document.createElement('footer');
    footer.className = 'slide-footer';
    footer.innerHTML = `<span>B2B Commerce with Agentic AI · a design exploration</span><span>${n + 1} / ${total}</span>`;
    slide.appendChild(footer);
  });

  function fit() {
    const scale = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
    deck.style.transform = `scale(${scale})`;
  }

  function show(n) {
    current = Math.max(0, Math.min(total - 1, n));
    slides.forEach((slide, k) => slide.classList.toggle('active', k === current));
    progress.style.width = `${((current + 1) / total) * 100}%`;
    const notes = slides[current].querySelector('.notes');
    notesPanel.innerHTML = `<h4>Notes · slide ${current + 1}</h4>${notes ? notes.innerHTML : '<p>No notes.</p>'}`;
    history.replaceState(null, '', `#${current + 1}`);
  }

  function fromHash() {
    const n = parseInt(location.hash.slice(1), 10);
    return Number.isFinite(n) ? n - 1 : 0;
  }

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ':
        e.preventDefault(); show(current + 1); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
        e.preventDefault(); show(current - 1); break;
      case 'Home': show(0); break;
      case 'End': show(total - 1); break;
      case 'n': case 'N': notesPanel.classList.toggle('open'); break;
      case 'f': case 'F':
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen?.();
        break;
    }
  });

  let touchX = null;
  document.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  document.querySelector('[data-nav="prev"]').addEventListener('click', () => show(current - 1));
  document.querySelector('[data-nav="next"]').addEventListener('click', () => show(current + 1));
  document.querySelector('[data-nav="notes"]').addEventListener('click', () => notesPanel.classList.toggle('open'));
  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', () => show(fromHash()));

  fit();
  show(fromHash());
})();
