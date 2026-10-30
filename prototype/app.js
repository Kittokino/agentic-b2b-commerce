// Steps through the story: the state at step n is the initial record with steps 0..n applied.
// Each step first updates Kade's Sana screen, then slides in what the people saw.
(() => {
  const V = window.VIEWS;
  const stage = document.querySelector('.stage');
  const el = (sel) => document.querySelector(sel);
  const flyout = el('#flyout');
  const cue = el('#cue');

  // Illustration placeholders, one per person's device.
  const ILLO = {
    nigel: { prompt: 'Prompt 1 illustration goes here', device: 'phone', view: 'whatsapp', channel: 'WhatsApp' },
    priya: { prompt: 'Prompt 2 illustration goes here', device: 'laptop', view: 'teams', channel: 'Teams' },
  };

  let path = 'decline';
  let chosen = false;   // has the viewer (or a deep link) picked a path at the read-back yet?
  let index = 0;
  let slide = 0;

  const steps = () => window.STORY.paths[path];

  function stateAt(n) {
    const s = window.STORY.initial();
    steps().slice(0, n + 1).forEach(step => { s.time = step.time; step.apply(s); });
    return s;
  }

  // What the current step changed, so the Sana screen can highlight it.
  function freshness(n) {
    const now = stateAt(n);
    const before = n > 0 ? stateAt(n - 1) : window.STORY.initial();
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    return {
      lines: now.order.lines.filter((l, i) => !same(l, before.order.lines[i])).map(l => l.id),
      thread: before.thread.length,
      activity: before.activity.length,
      caseFile: !same(now.caseFile, before.caseFile),
      erp: now.order.erp !== before.order.erp,
    };
  }

  // ---------- Left rail: the timeline ----------
  function timeline() {
    const list = steps();
    const known = chosen || index >= 2 ? list : list.slice(0, 2);
    const items = known.map((st, i) => {
      const state = i < index ? 'done' : i === index ? 'now' : 'next';
      return `
        <li class="${state} ${st.stop ? 'stop' : ''}" data-jump="${i}">
          <span class="time">${V.esc(st.time)}</span>
          ${V.avatar(st.actor)}
          <div><b>${V.esc(st.label)}</b>${i === index ? `<p>${V.esc(st.caption)}</p>` : ''}</div>
        </li>`;
    }).join('');
    const pending = known.length < list.length
      ? '<li class="pending"><span class="time"></span><span class="gap"></span><div><b>The rest depends on Nigel\'s choice</b></div></li>' : '';
    el('#timeline').innerHTML = items + pending;
    el('.path').textContent = !chosen && index < 2 ? 'Wednesday night, after service'
      : path === 'decline' ? 'Nigel declines the swap' : 'Nigel accepts the swap';
    el('.counter').textContent = `${index + 1} / ${list.length}`;
    el('[data-nav="prev"]').disabled = index === 0;
    el('[data-nav="next"]').disabled = index === list.length - 1;
  }

  // ---------- Flyout: what each person sees ----------
  const people = () => (steps()[index].seen || []).filter(p => ILLO[p]);

  function choiceFor(p, step) {
    const d = step.decision;
    const last = index === steps().length - 1;
    const btn = (attrs, label, kind = '') => `<button class="btn ${kind}" ${attrs}>${V.esc(label)}</button>`;
    if (d && d.where === 'kade') {
      return { lead: `Tom picks this up in Kade's screen. ${d.text}`, btns: btn('data-fly="close"', 'Go to Tom\'s case') };
    }
    if (d && (d.who === p || d.who === 'both')) {
      return { lead: d.text, btns: d.actions.map(a => btn(`data-action="${a.action}"`, a.label)).join('') };
    }
    if (d) {
      const other = people().indexOf(d.who);
      return { lead: `${V.PEOPLE[d.who]} decides this step.`, btns: other >= 0 ? btn(`data-slide="${other}"`, `See ${V.PEOPLE[d.who]}'s screen`, 'ghost') : '' };
    }
    if (last) return { lead: 'The same confirmed order, in every channel.', btns: btn('data-nav="restart"', 'Start again', 'ghost') };
    const n = steps()[index + 1];
    return { kicker: `Up next · ${n.time}`, lead: n.caption, btns: btn('data-nav="next"', 'Continue') };
  }

  function renderFlyout(s) {
    const list = people();
    const step = steps()[index];
    slide = Math.max(0, Math.min(list.length - 1, slide));
    const p = list[slide];
    if (!p) return;
    const info = ILLO[p];

    el('#carousel').innerHTML = `
      ${list.length > 1 ? `<button class="arrow" data-slide="${(slide + list.length - 1) % list.length}" aria-label="Previous person"><svg class="ico"><use href="#i-left"/></svg></button>` : ''}
      <div class="people">${list.map((q, i) => `
        <button class="person ${i === slide ? 'on' : ''}" data-slide="${i}">${V.avatar(q, 'sm')}<span><b>${V.PEOPLE[q]}</b><i>${ILLO[q].channel}</i></span></button>`).join('')}
      </div>
      ${list.length > 1 ? `<button class="arrow" data-slide="${(slide + 1) % list.length}" aria-label="Next person"><svg class="ico"><use href="#i-right"/></svg></button>` : ''}`;

    const c = choiceFor(p, step);
    el('#fly-body').innerHTML = `
      <p class="fly-kicker">What ${V.PEOPLE[p]} sees · ${V.esc(V.ROLES[p])}</p>
      <div class="illo dev-${info.device}">
        <span class="illo-label">${info.prompt}</span>
        <div class="screen">${V[info.view](s)}</div>
      </div>
      <div class="choice">
        ${c.kicker ? `<p class="kicker">${V.esc(c.kicker)}</p>` : ''}
        <p class="lead">${V.esc(c.lead)}</p>
        <div class="choice-btns">${c.btns}</div>
      </div>`;

    const chat = el('#fly-body .chat');
    if (chat) chat.scrollTop = chat.scrollHeight;
  }

  function setFlyout(open) {
    const list = people();
    const isOpen = open && list.length > 0;
    flyout.classList.toggle('open', isOpen);
    flyout.setAttribute('aria-hidden', String(!isOpen));
    // The pill gives the cue while the flyout is closed, and moves beside it to close it again.
    cue.hidden = list.length === 0;
    cue.classList.toggle('open', isOpen);
    const waiting = /^Waiting/.test(steps()[index].cue || '');
    cue.classList.toggle('waiting', waiting && !isOpen);
    cue.innerHTML = isOpen
      ? `<svg class="ico"><use href="#i-right"/></svg><span>Back to Kade's screen</span>`
      : `<span class="faces">${list.map(p => V.avatar(p)).join('')}</span><span>${V.esc(steps()[index].cue || '')}</span><svg class="ico"><use href="#i-left"/></svg>`;
  }

  // ---------- Render a step ----------
  function render() {
    const step = steps()[index];
    const s = stateAt(index);
    el('#sana').innerHTML = V.sana(s, { fresh: freshness(index), decision: step.decision });
    timeline();
    const list = people();
    const who = step.decision && list.indexOf(step.decision.who);
    slide = who > 0 ? who : 0;
    renderFlyout(s);
    history.replaceState(null, '', `#${path}-${index + 1}`);
  }

  // Sana updates; the pill gives the cue, and the viewer opens the person's screen.
  function go(n) {
    index = Math.max(0, Math.min(steps().length - 1, n));
    if (index >= 2) chosen = true;
    setFlyout(false);
    render();
  }

  // ---------- Input ----------
  stage.addEventListener('click', (e) => {
    const t = e.target.closest('[data-action], [data-nav], [data-slide], [data-jump], [data-fly], #cue');
    if (!t) return;
    if (t.dataset.action) {
      const a = t.dataset.action;
      if (a === 'accept' || a === 'decline') { path = a; chosen = true; }
      go(index + 1);
    } else if (t.dataset.nav === 'next') go(index + 1);
    else if (t.dataset.nav === 'prev') go(index - 1);
    else if (t.dataset.nav === 'restart') { path = 'decline'; chosen = false; go(0); }
    else if (t.dataset.slide !== undefined) { slide = +t.dataset.slide; renderFlyout(stateAt(index)); }
    else if (t.dataset.jump !== undefined) go(+t.dataset.jump);
    else if (t.dataset.fly === 'close') setFlyout(false);
    else if (t === cue) setFlyout(!flyout.classList.contains('open'));
  });

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (['ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); go(index + 1); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(index - 1); }
    if (e.key === 'Escape') setFlyout(false);
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
    if (index >= 2) chosen = true;
    return true;
  }
  window.addEventListener('hashchange', () => { if (location.hash !== `#${path}-${index + 1}` && fromHash()) go(index); });
  fromHash();
  fit();
  go(index);
})();
