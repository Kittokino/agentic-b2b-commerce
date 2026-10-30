// Screens and components. Every screen is drawn from the same order record,
// using the same small set of components (status chip, order line, avatar).
(() => {
  const esc = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = (id) => `<svg class="ico"><use href="#i-${id}"/></svg>`;

  const PEOPLE = { nigel: 'Nigel', priya: 'Priya', tom: 'Tom', agent: 'Order agent', system: 'Sana' };

  // Whose screen we are looking at, for the left column.
  const VIEWPOINT = {
    trail: [null, 'Kade’s order screen, in Sana'],
    desk: ['tom', 'Tom’s case screen, in Sana'],
    lock: ['nigel', 'Nigel’s phone'],
    whatsapp: ['nigel', 'Nigel’s phone, WhatsApp'],
    teams: ['priya', 'Priya’s laptop, Teams'],
  };

  // ---------- Components ----------
  const avatar = (who, size = 'xs') =>
    who === 'agent' ? `<span class="face ${size} agent">${icon('agent')}</span>`
      : who === 'system' ? `<span class="face ${size} system">${icon('db')}</span>`
        : `<span class="face ${size}"><img src="../assets/personas/${who}.png" alt=""></span>`;

  // One status vocabulary; the label adapts to who is looking.
  function statusChip(line, viewer) {
    const mine = line.owner && line.owner === viewer;
    const map = {
      received: ['plain', 'Received'],
      confirmed: ['done', 'Confirmed'],
      stopped: ['wait', mine ? 'Needs you' : `Waiting on ${PEOPLE[line.owner]}`],
      suggested: ['suggest', mine ? 'Your call' : `Waiting on ${PEOPLE[line.owner]}`],
      handed: ['handed', 'With Tom'],
      quote: ['suggest', mine ? 'Your call' : `Waiting on ${PEOPLE[line.owner]}`],
    };
    const [cls, label] = map[line.status];
    return `<span class="status ${cls}">${line.status === 'confirmed' ? icon('check') : ''}${esc(label)}</span>`;
  }

  // A button inside a screen: live when it is the move the story is waiting for.
  const act = (b, ctx, cls = '') => {
    const live = ctx.live.includes(b.action);
    return `<button class="${cls} ${live ? 'live' : ''}" ${live ? `data-action="${b.action}"` : 'disabled'}>${esc(b.label)}</button>`;
  };

  // Things the current scene added animate in, one after another.
  const enter = (i, from, step = .45) => i >= from ? ` class="new" style="animation-delay:${((i - from) * step).toFixed(2)}s"` : '';

  // ---------- Kade's order in Sana: its Activity tab ----------
  const sanaTop = (on) => `
    <header class="sana-top">
      <div class="brand"><img class="logo" src="../assets/kade-logo.png" alt=""><b>Kade Foodservice</b><span class="on">on Sana</span></div>
      <nav>${['Orders', 'Cases', 'Customers', 'Agent rules'].map(n => `<span class="${n === on ? 'on' : ''}">${n}</span>`).join('')}</nav>
    </header>`;

  const ACTOR = { agent: 'AI · Order agent · v2.3', system: 'System', nigel: 'Nigel · Head chef', priya: 'Priya · Buyer', tom: 'Tom · Service rep' };

  // Only what needs a person: it stays this size whether an order has 3 lines or 40.
  function summary(s) {
    const o = s.order;
    const c = s.caseFile;
    const open = o.lines.filter(l => !['confirmed', 'received'].includes(l.status));
    const done = o.lines.filter(l => l.status === 'confirmed').length;
    return `
      <aside class="summary">
        <p class="tally">${o.lines.length} lines · ${done} confirmed · ${open.length} with a person</p>
        <h3>Needs a person</h3>
        ${open.length ? `<ul class="sum-lines">${open.map(l => `
          <li class="${l.status === 'stopped' ? 'is-stop' : ''}">
            <b>${esc(l.name)}</b>
            ${statusChip(l, 'kade')}
            ${l.note ? `<span>${esc(l.note)}</span>` : ''}
          </li>`).join('')}
        </ul>` : '<p class="none">Nothing. Every line has its answer.</p>'}
        <dl class="sum-facts">
          <div><dt>ERP</dt><dd>${esc(o.erp)}</dd></div>
          ${c ? `<div><dt>Case</dt><dd>${avatar('tom')}${esc(c.id)} · ${esc(c.status)}</dd></div>` : ''}
        </dl>
      </aside>`;
  }

  function trail(s, scene, ctx) {
    const o = s.order;
    let day = '';
    const rows = s.trail.map((e, i) => {
      const divider = e.day !== day ? `<li class="day">${esc((day = e.day))}</li>` : '';
      const [field, from, to] = e.change || [];
      return `${divider}
        <li${enter(i, ctx.fresh.trail)}>
          <div class="entry ${e.stop ? 'is-stop' : ''}">
            <span class="t">${esc(e.time)}</span>
            ${avatar(e.who)}
            <div>
              <span class="actor by-${e.who === 'agent' || e.who === 'system' ? e.who : 'person'}">${esc(ACTOR[e.who])}</span>
              <p><b>${esc(e.text)}</b></p>
              ${e.quote ? `<q>${esc(e.quote)}</q>` : ''}
              ${e.detail ? `<p class="detail">${esc(e.detail)}</p>` : ''}
              ${e.change ? `<p class="chg">${esc(field)}: <s>${esc(from)}</s> → <b>${esc(to)}</b></p>` : ''}
              ${e.source || e.open ? `<p class="src">${e.source ? `via ${esc(e.source)}` : ''}${e.source && e.open ? ' · ' : ''}${e.open ? `<button class="open-link" data-open="${i}">${esc(e.open)}</button>` : ''}</p>` : ''}
              ${e.rule ? `<span class="rule">${icon('rule')}Rule: ${esc(e.rule)}</span>` : ''}
            </div>
          </div>
        </li>`;
    }).join('');
    const cls = o.status === 'Confirmed' ? 'done' : 'handed';
    return `
      <div class="frame">
        ${sanaTop('Orders')}
        <div class="order-head">
          <div class="crumb">Orders <span>/</span> ${esc(o.id)}</div>
          <div class="order-title">
            <h1>Order ${esc(o.id)}</h1>
            <span class="status ${cls}">${o.status === 'Confirmed' ? icon('check') : ''}${esc(o.status)}</span>
          </div>
          <p class="order-meta">${esc(o.customer)} · ${esc(o.purpose)}</p>
          <nav class="tabs">${['Overview', 'Lines', 'Conversation', 'Activity'].map(t => `<span class="${t === 'Activity' ? 'on' : ''}">${t}</span>`).join('')}</nav>
        </div>
        <div class="trail-page">
          <section class="trail-main">
            <div class="filters">
              ${['All', 'AI agents', 'People', 'System'].map((f, i) => `<span class="${i ? '' : 'on'}">${f}</span>`).join('')}
              <span class="ro" title="Entries in this log can’t be edited or deleted.">${icon('lock')}Read-only</span>
            </div>
            <ol class="trail">${rows}</ol>
          </section>
          ${summary(s)}
        </div>
      </div>`;
  }

  // ---------- Tom's case, in Sana ----------
  function desk(s, scene, ctx) {
    const c = s.caseFile;
    const recent = s.trail.slice(-5).map(e => `<li><span class="t">${esc(e.time)}</span>${avatar(e.who)}<p>${esc(e.text)}</p></li>`).join('');
    return `
      <div class="frame">
        ${sanaTop('Cases')}
        <div class="trail-page">
          <section class="case-main">
            <div class="crumb">Cases <span>/</span> ${esc(c.id)}</div>
            <div class="case-title"><h1>${esc(c.title)}</h1><span class="status handed">${esc(c.status)}</span></div>
            <p class="case-for">${avatar('tom')} Assigned to Tom · for ${esc(s.order.customer)} · order ${esc(s.order.id)}</p>
            <p class="case-task">${esc(c.task)}</p>
            ${c.changed ? `<div class="changed">${icon('rule')}<p>${esc(c.changed)}</p></div>` : ''}
            ${c.found ? `<div class="found"><span class="muted">What Tom found</span><p>${esc(c.found)}</p></div>` : ''}
            <div class="case-actions">${act({ action: 'quote', label: 'Send Nigel the one-time price' }, ctx, 'btn')}</div>
          </section>
          <aside class="summary history">
            <h3>Latest activity on the order</h3>
            <ul>${recent}</ul>
          </aside>
        </div>
      </div>`;
  }

  // ---------- Nigel's phone ----------
  function lock(s, scene, ctx) {
    const n = s.notify;
    return `
      <div class="phone lockscreen">
        <div class="lock-time"><span>Wednesday</span><b>22:48</b></div>
        ${n ? `
        <button class="notification ${ctx.live.includes('open') ? 'live' : ''}" data-action="open">
          <span class="n-top"><img class="n-icon" src="../assets/whatsapp-icon.svg" alt=""><span>${esc(n.app)} · now</span>${icon('down')}</span>
          <b>${esc(n.from)}</b>
          <p>${esc(n.text)}</p>
        </button>` : ''}
      </div>`;
  }

  function whatsapp(s, scene, ctx) {
    const msgs = s.wa.map((m, i) => {
      const out = m.who === 'nigel';
      let body = esc(m.text).replace(/\n/g, '<br>');
      if (m.kind === 'voice') body = `<div class="voice"><span class="play">${icon('play')}</span><span class="wave">${'<i></i>'.repeat(24)}</span><span class="len">0:14</span></div>`;
      if (m.kind === 'done') body = `<p class="done-msg">${icon('check')} ${body}</p>`;
      const buttons = m.buttons ? `<div class="wa-buttons">${m.buttons.map(b => act(b, ctx)).join('')}</div>` : '';
      return `<div${enter(i, ctx.fresh.wa, .6)}><div class="msg ${out ? 'out' : 'in'} k-${m.kind}"><div class="bubble">${body}<span class="ts">${esc(m.time)}</span></div></div>${buttons}</div>`;
    }).join('');
    return `
      <div class="phone">
        <div class="phone-top">${icon('back')}${avatar('agent', 'sm')}<div><b>Kade Foodservice</b><span>Order agent (AI)</span></div></div>
        <div class="chat">${msgs}</div>
        <div class="phone-bar"><span>Message</span>${icon('mic')}</div>
      </div>`;
  }

  // ---------- Priya's laptop: Teams ----------
  function orderCard(s, ctx) {
    return `
      <div class="tcard">
        <div class="tcard-head">${avatar('agent', 'sm')}<div><b>Harbour Front · Saturday dinner</b><span>${esc(s.order.id)} · ${esc(s.order.status)}</span></div></div>
        ${s.order.lines.map(l => `
          <div class="o-line">
            <div class="o-main"><b>${esc(l.name)}</b><span>${esc(l.qty)}</span>${l.note ? `<em>${esc(l.note)}</em>` : ''}</div>
            <div class="o-side">${statusChip(l, 'priya')}${l.status === 'stopped' ? act({ action: 'approve', label: 'Approve' }, ctx, 'btn sm') : ''}</div>
          </div>`).join('')}
      </div>`;
  }

  function teams(s, scene, ctx) {
    const chatAssistant = s.assistant.map((m, i) => {
      let body;
      if (m.kind === 'card') body = `<div class="acard"><p>${esc(m.text)}</p><div class="acard-btns">${m.buttons.map(b => act(b, ctx, 'btn sm ghost')).join('')}</div></div>`;
      else if (m.kind === 'note') body = `<p class="call">${icon('phone')}${esc(m.text)}</p>`;
      else body = `<p class="tmsg ${m.who === 'priya' ? 'mine' : ''}">${esc(m.text)}</p>`;
      return `<li${enter(i, ctx.fresh.assistant)}>${m.who === 'priya' ? '' : `<span class="assistant">${icon('agent')}</span>`}<div><span class="meta">${m.who === 'priya' ? 'You' : 'Your assistant'} · ${esc(m.time)}</span>${body}</div></li>`;
    }).join('');

    const chatKade = s.kade.map((m, i) => {
      const body = m.kind === 'card' ? orderCard(s, ctx) : `<p class="tmsg ${m.who === 'priya' ? 'mine' : ''}">${esc(m.text)}</p>`;
      return `<li${enter(i, ctx.fresh.kade)}>${m.who === 'priya' ? '' : avatar('agent')}<div><span class="meta">${m.who === 'priya' ? 'You' : 'Kade · Order agent (AI)'} · ${esc(m.time)}</span>${body}</div></li>`;
    }).join('');

    const onAssistant = scene.chat === 'assistant';
    const last = (list) => { const m = list[list.length - 1]; return m ? (m.kind === 'card' && !m.text ? 'Harbour Front · Saturday dinner' : m.text) : ''; };
    return `
      <div class="teams">
        <div class="teams-top"><span class="dot"></span><b>Teams</b><span class="search">Search</span></div>
        <div class="teams-main">
          <aside class="chats">
            <div class="chat-item ${onAssistant ? 'on' : ''}"><span class="assistant">${icon('agent')}</span><div><b>Your assistant</b><span>${esc(last(s.assistant))}</span></div></div>
            <div class="chat-item ${onAssistant ? '' : 'on'}">${avatar('agent', 'sm')}<div><b>Kade Foodservice</b><span>${esc(last(s.kade))}</span></div></div>
          </aside>
          <section class="conv">
            <header>${onAssistant ? `<span class="assistant">${icon('agent')}</span><b>Your assistant</b><span class="muted">The Olive Tree</span>` : `${avatar('agent', 'sm')}<b>Kade Foodservice</b><span class="muted">Order thread · ${esc(s.order.id)}</span>`}</header>
            <ul class="tlist">${onAssistant ? chatAssistant : chatKade}</ul>
            <div class="composer ${s.compose ? 'typing' : ''}">
              <span>${s.compose ? esc(s.compose) : 'Type a message'}</span>
              ${s.compose ? act({ action: 'send', label: 'Send' }, ctx, 'btn sm') : ''}
            </div>
          </section>
        </div>
      </div>`;
  }

  // ---------- Cards between the screens ----------
  function brk(s, scene) {
    return `
      <div class="card-scene">
        ${avatar(scene.actor, 'lg')}
        <span class="kicker">${esc(scene.kicker)}</span>
        <h2>${esc(scene.title)}</h2>
        <p>${esc(scene.body)}</p>
      </div>`;
  }

  function end(s, scene) {
    return `
      <div class="card-scene end">
        ${avatar('agent', 'lg')}
        <h2>${esc(scene.title)}</h2>
        ${scene.body ? `<p>${esc(scene.body)}</p>` : ''}
        ${scene.outcomes ? `<ul class="outcomes">${scene.outcomes.map(([k, v], i) => `<li class="${i === 1 ? 'is-stop' : ''}"><b>${k}</b><p>${esc(v)}</p></li>`).join('')}</ul>` : ''}
        <div class="end-btns">
          ${scene.links.map(l => `<button class="btn" data-go="${l.go}">${esc(l.label)}</button>`).join('')}
          <button class="btn ghost" data-nav="restart">Start again</button>
        </div>
      </div>`;
  }

  // A person's screen, centred; who it belongs to is said in the left column.
  const personScene = (s, scene, ctx, device) => `<div class="person-scene dev-${scene.screen}">${device}</div>`;
  const wide = (s, scene, ctx, body) => `<div class="wide-scene">${body}</div>`;

  // ---------- What an activity link opens: the message, case or voice note as it was then ----------
  const waveform = (n) => Array.from({ length: n }, (_, i) => `<i style="height:${6 + Math.round(14 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * .45)))}px"></i>`).join('');

  function modal(s, e, then) {
    const at = (list) => list.filter(m => m.time === e.time);
    const by = (list) => { const own = at(list).filter(m => m.who === e.who); return own.length ? own : at(list).filter(m => m.who === 'agent'); };
    let title, body;
    if (e.open === 'Play voice note') {
      const v = s.wa.find(m => m.kind === 'voice');
      title = 'Voice note from Nigel';
      body = `
        <p class="m-meta">WhatsApp · Wednesday ${esc(v.time)} · 0:14</p>
        <div class="player">
          <div class="track"><span class="bars">${waveform(48)}</span><span class="head"></span></div>
          <div class="times"><span>0:05</span><span>0:14</span></div>
          <div class="controls">
            <span class="ctl">1×</span>
            <span class="ctl">${icon('back')}5</span>
            <span class="ctl main">${icon('play')}</span>
            <span class="ctl">5${icon('right')}</span>
          </div>
        </div>
        <p class="m-label">Transcript</p>
        <q class="m-quote">${esc(v.text)}</q>`;
    } else if (e.open === 'Open case') {
      const c = then.caseFile;
      title = `Case ${esc(c.id)}`;
      body = `
        <p class="m-meta">Assigned to Tom · order ${esc(s.order.id)} · ${esc(c.status)}</p>
        <h4 class="m-case">${esc(c.title)}</h4>
        <p class="m-text">${esc(c.task)}</p>
        ${c.changed ? `<p class="m-note">${esc(c.changed)}</p>` : ''}
        <p class="m-label">Attached</p>
        <p class="m-text">The full conversation with Nigel and Priya, and every entry in the order’s activity.</p>`;
    } else if (e.open === 'Open approval') {
      const salmon = s.order.lines.find(l => l.id === 'salmon');
      title = 'Priya’s approval';
      body = `
        <p class="m-meta">Teams · Kade order thread · Thursday ${esc(e.time)}</p>
        <div class="m-approval">
          <div><b>${esc(salmon.name)}</b><span>${esc(salmon.qty)} · takes Harbour Front €180 over its fish budget</span></div>
          <span class="status done">${icon('check')}Approved by Priya</span>
        </div>
        <p class="m-text">Priya approved the salmon with the Approve button on Kade’s order card in Teams. There is no written message for this step.</p>`;
    } else if ((e.source || '').startsWith('Teams')) {
      title = 'Message in Teams';
      body = `
        <p class="m-meta">Kade order thread · ${esc(s.day)} ${esc(e.time)}</p>
        <ul class="tlist m-list">${by(s.kade).map(m => `<li><div><span class="meta">${m.who === 'priya' ? 'Priya' : 'Kade · Order agent (AI)'}</span><p class="tmsg ${m.who === 'priya' ? 'mine' : ''}">${esc(m.text)}</p></div></li>`).join('')}</ul>`;
    } else {
      // A reply from Nigel shows with the message it answers.
      let msgs = by(s.wa);
      if (e.who === 'nigel') {
        const first = s.wa.indexOf(msgs[0]);
        const asked = s.wa.slice(0, first).reverse().find(m => m.who === 'agent');
        if (asked) msgs = [asked, ...msgs];
      }
      title = 'Message on WhatsApp';
      body = `
        <p class="m-meta">Nigel and Kade Foodservice · ${esc(e.day)} ${esc(e.time)}</p>
        <div class="chat m-chat">${msgs.map(m => `
          <div class="msg ${m.who === 'nigel' ? 'out' : 'in'}"><div class="bubble">${esc(m.text).replace(/\n/g, '<br>')}<span class="ts">${esc(m.time)}</span></div></div>
          ${m.buttons ? `<div class="wa-buttons">${m.buttons.map(b => `<button disabled>${esc(b.label)}</button>`).join('')}</div>` : ''}`).join('')}
        </div>`;
    }
    return `
      <div class="modal" role="dialog" aria-modal="true" aria-label="${title}">
        <header><h3>${title}</h3><button class="m-close" data-close aria-label="Close">${icon('close')}</button></header>
        <div class="m-body">${body}</div>
      </div>`;
  }

  const SCREENS = {
    trail: (s, sc, ctx) => wide(s, sc, ctx, trail(s, sc, ctx)),
    desk: (s, sc, ctx) => wide(s, sc, ctx, desk(s, sc, ctx)),
    lock: (s, sc, ctx) => personScene(s, sc, ctx, lock(s, sc, ctx)),
    whatsapp: (s, sc, ctx) => personScene(s, sc, ctx, whatsapp(s, sc, ctx)),
    teams: (s, sc, ctx) => personScene(s, sc, ctx, teams(s, sc, ctx)),
    break: brk,
    end,
  };

  window.VIEWS = { SCREENS, modal, VIEWPOINT, avatar, esc, icon, PEOPLE };
})();
