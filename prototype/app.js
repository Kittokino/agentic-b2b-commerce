// Steps through the story: the state at scene n is the initial record with scenes 0..n applied.
// A new actor's screen swipes in; the same screen updates in place.
(() => {
  const V = window.VIEWS;
  const S = window.STORY;
  const stage = document.querySelector('.stage');
  const el = (sel) => document.querySelector(sel);
  const screen = el('#screen');
  const cue = el('#cue');
  const intro = el('#intro');

  let path = 'decline';
  let chosen = false;   // has a reply been picked at Nigel's choice yet?
  let index = 0;
  let shown = null;     // the screen on view: its element and what it shows

  const steps = () => S.paths[path];

  function stateAt(n) {
    const s = S.initial();
    steps().slice(0, n + 1).forEach(sc => { if (sc.day) s.day = sc.day; sc.apply(s); });
    return s;
  }

  // ---------- Left column: whose screen this is, what led here, what happens now ----------
  function rail() {
    const list = steps();
    const sc = list[index];
    const s = stateAt(index);
    const view = V.VIEWPOINT[sc.screen];
    const face = view && (view[0] ? V.avatar(view[0], 'sm') : '<span class="mark">K</span>');
    const card = ['break', 'end'].includes(sc.screen);
    el('#rail-body').innerHTML = `
      ${view ? `<div class="view"><span class="kicker">You’re looking at</span><div class="view-box">${face}<b>${V.esc(view[1])}</b></div></div>` : ''}
      <div class="so-far"><span class="kicker">So far</span><p>${V.esc(sc.story)}</p></div>
      ${card ? '' : `<div class="now"><span class="kicker">Now · ${V.esc(`${s.day} ${sc.time}`)}</span><h2>${V.esc(sc.title)}</h2></div>`}`;
    el('.path').textContent = chosen || index > S.choiceAt ? S.labels[path] : 'Wednesday night, after service';
    el('.counter').textContent = `Scene ${index + 1} of ${list.length}`;
    el('[data-nav="prev"]').disabled = index === 0;
    el('[data-nav="next"]').disabled = index === list.length - 1;
  }

  // ---------- The screen ----------
  // Scenes on the same surface update in place; a new surface swipes in.
  const surface = (sc) => ['trail', 'desk'].includes(sc.screen) ? 'kade' : `${sc.screen}:${sc.actor || ''}`;

  function render(dir) {
    const sc = steps()[index];
    const s = stateAt(index);
    // What this scene added animates in. Going back, the screen shows as it was, without replaying.
    const before = dir >= 0 && index > 0 ? stateAt(index - 1) : null;
    const count = (k) => (dir < 0 ? 1e9 : before ? before[k].length : 0);
    const fresh = { trail: count('trail'), wa: count('wa'), assistant: count('assistant'), kade: count('kade') };
    const ctx = { fresh, live: (sc.choices || []).map(c => c.action), time: `${s.day} ${sc.time || ''}` };
    const html = V.SCREENS[sc.screen](s, sc, ctx);

    const key = surface(sc);
    if (shown && shown.key === key && sc.screen === shown.screen) {
      shown.el.innerHTML = html;
    } else {
      const next = document.createElement('div');
      next.className = `scene ${dir < 0 ? 'from-left' : 'from-right'}`;
      next.innerHTML = html;
      screen.appendChild(next);
      if (shown) {
        const old = shown.el;
        old.classList.add(dir < 0 ? 'to-right' : 'to-left');
        setTimeout(() => old.remove(), 800);
      }
      next.getBoundingClientRect();
      next.classList.remove('from-left', 'from-right');
      shown = { el: next };
    }
    Object.assign(shown, { key, screen: sc.screen });

    follow(shown.el);
    rail();
    renderCue(sc);
    history.replaceState(null, '', hashFor());
  }

  // Lists start at the first new entry, then follow each one as it comes in.
  let followers = [];
  function follow(root) {
    followers.forEach(clearTimeout);
    followers = [];
    root.querySelectorAll('.trail-main, .chat, .tlist').forEach(list => {
      const fresh = [...list.querySelectorAll('.new')];
      if (!fresh.length) { list.scrollTop = list.scrollHeight; return; }
      list.scrollTop = Math.max(0, fresh[0].offsetTop - list.offsetTop - 60);
      fresh.forEach(item => {
        const delay = parseFloat(item.style.animationDelay) * 1000 || 0;
        followers.push(setTimeout(() => item.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), delay + 150));
      });
    });
  }

  // Footer, right: the way on when nothing needs choosing, a hint when something does.
  function renderCue(sc) {
    cue.hidden = sc.screen === 'end';
    cue.className = sc.choices ? 'cue hint' : 'cue btn';
    cue.innerHTML = sc.choices
      ? `<svg class="ico"><use href="#i-tap"/></svg><span>${V.esc(sc.prompt)}</span>`
      : `<span>${V.esc(sc.next || 'Continue')}</span><svg class="ico"><use href="#i-right"/></svg>`;
  }

  function go(n, dir = 1) {
    index = Math.max(0, Math.min(steps().length - 1, n));
    if (index > S.choiceAt) chosen = true;
    render(dir);
  }

  function choose(action) {
    if (['accept', 'decline', 'more'].includes(action)) { path = action; chosen = true; }
    go(index + 1);
  }

  // Next on a choice takes the story's own path (Nigel declines).
  function advance() {
    const sc = steps()[index];
    if (sc.choices) choose(sc.def || sc.choices[0].action); else go(index + 1);
  }

  // ---------- Input ----------
  stage.addEventListener('click', (e) => {
    const t = e.target.closest('[data-action], [data-nav], [data-go], [data-intro], #cue');
    if (!t || t.disabled) return;
    if (t.dataset.intro) play();
    else if (t === cue) { if (!steps()[index].choices) go(index + 1); }
    else if (t.dataset.action) choose(t.dataset.action);
    else if (t.dataset.nav === 'next') advance();
    else if (t.dataset.nav === 'prev') go(index - 1, -1);
    else if (t.dataset.nav === 'restart') { path = 'decline'; chosen = false; index = 0; intro.classList.remove('gone'); }
    else if (t.dataset.go === 'accept') { path = 'accept'; chosen = true; go(S.choiceAt + 1); }
    else if (t.dataset.go === 'decline') { path = 'decline'; chosen = false; go(S.choiceAt, -1); }
  });

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!intro.classList.contains('gone')) {
      if (['ArrowRight', 'PageDown', 'Enter', ' '].includes(e.key)) { e.preventDefault(); play(); }
      return;
    }
    if (['ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); advance(); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(index - 1, -1); }
  });

  function fit() {
    const scale = Math.min(window.innerWidth / 1440, window.innerHeight / 810);
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
  window.addEventListener('resize', fit);

  // Deep links open a given scene and skip the opening. Before Nigel's reply the link
  // names no path (#scene-2), so it doesn't give his choice away; after it, it does (#declined-5).
  const SLUGS = { decline: 'declined', accept: 'accepted', more: 'more-options' };
  function hashFor() {
    return `#${index > S.choiceAt ? SLUGS[path] : 'scene'}-${index + 1}`;
  }
  function fromHash() {
    const m = location.hash.match(/^#(scene|declined|accepted|more-options)-(\d+)$/);
    if (!m) return false;
    path = Object.keys(SLUGS).find(k => SLUGS[k] === m[1]) || 'decline';
    index = Math.max(0, Math.min(steps().length - 1, +m[2] - 1));
    chosen = index > S.choiceAt;
    return true;
  }
  window.addEventListener('hashchange', () => { if (location.hash !== hashFor() && fromHash()) render(1); });
  // The first scene is drawn when Play is pressed, so it always plays from the start.
  function play() {
    intro.classList.add('gone');
    screen.innerHTML = '';
    shown = null;
    go(0);
  }

  fit();
  if (fromHash()) { intro.classList.add('gone'); render(1); } else rail();
})();
