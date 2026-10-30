// Steps through the story: the state at step n is the initial record with steps 0..n applied.
(() => {
  const stage = document.querySelector('.stage');
  const el = (sel) => document.querySelector(sel);
  let path = 'decline';
  let index = 0;

  const steps = () => window.STORY.paths[path];

  function stateAt(n) {
    const s = window.STORY.initial();
    steps().slice(0, n + 1).forEach(step => { s.time = step.time; step.apply(s); });
    return s;
  }

  function render() {
    const list = steps();
    const step = list[index];
    const s = stateAt(index);
    const ctx = { awaits: step.awaits || [] };

    el('#whatsapp').innerHTML = window.VIEWS.whatsapp(s, ctx);
    el('#teams').innerHTML = window.VIEWS.teams(s, ctx);
    el('#desk').innerHTML = window.VIEWS.desk(s, ctx);
    el('#webshop').innerHTML = window.VIEWS.webshop(s, ctx);
    el('#record').innerHTML = window.VIEWS.record(s);

    // The right-hand column shows Tom's desk or the webshop, whichever the step is about.
    const right = step.panel === 'webshop' ? 'webshop' : (step.panel === 'desk' || s.caseFile) ? 'desk' : 'webshop';
    showRight(right);

    document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.dataset.panel === step.panel || (step.panel === 'desk' && p.dataset.panel === 'right') || (step.panel === 'webshop' && p.dataset.panel === 'right')));
    el('.cap-time').textContent = step.time;
    el('.cap-text').textContent = step.caption;
    el('.cap-time').classList.toggle('stop', !!step.stop);
    el('.counter').textContent = `${index + 1} / ${list.length}`;
    el('.path').textContent = path === 'decline' ? 'Nigel declines the swap' : 'Nigel accepts the swap';
    el('[data-nav="prev"]').disabled = index === 0;
    el('[data-nav="next"]').disabled = index === list.length - 1;

    // Keep the newest message in view.
    const chat = el('#whatsapp .chat');
    if (chat) chat.scrollTop = chat.scrollHeight;
    const story = el('#desk .story');
    if (story) story.scrollTop = story.scrollHeight;
    history.replaceState(null, '', `#${path}-${index + 1}`);
  }

  function showRight(which) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === which));
    el('#desk').hidden = which !== 'desk';
    el('#webshop').hidden = which !== 'webshop';
  }

  function go(n) {
    index = Math.max(0, Math.min(steps().length - 1, n));
    render();
  }

  // Buttons inside the screens move the story on when they are the step's expected action.
  stage.addEventListener('click', (e) => {
    const b = e.target.closest('[data-action]');
    if (b && !b.disabled) {
      const a = b.dataset.action;
      if (a === 'accept' || a === 'decline') path = a;
      go(index + 1);
      return;
    }
    const t = e.target.closest('.tab');
    if (t) showRight(t.dataset.tab);
  });

  el('[data-nav="prev"]').addEventListener('click', () => go(index - 1));
  el('[data-nav="next"]').addEventListener('click', () => go(index + 1));
  el('[data-nav="restart"]').addEventListener('click', () => { path = 'decline'; go(0); });
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); go(index + 1); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(index - 1); }
  });

  function fit() {
    const scale = Math.min(window.innerWidth / 1440, window.innerHeight / 810);
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
  window.addEventListener('resize', fit);

  // Deep links like #decline-5 open a given step; they also work when only the hash changes.
  function fromHash() {
    const m = location.hash.match(/^#(decline|accept)-(\d+)$/);
    if (!m) return false;
    path = m[1];
    index = Math.max(0, Math.min(steps().length - 1, +m[2] - 1));
    return true;
  }
  window.addEventListener('hashchange', () => { if (fromHash()) render(); });
  fromHash();
  fit();
  render();
})();
