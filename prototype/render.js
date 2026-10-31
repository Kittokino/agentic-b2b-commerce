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

  // Kade's own mark, where Kade appears as a business (a profile picture, a chat).
  const kadeMark = (size = 'sm') => `<span class="face ${size} kade"><img src="../assets/kade-logo.png" alt=""></span>`;

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

  // In the activity, the first new entry is what moved the story on. It waits for the screen to
  // finish sliding in, comes in slowly with a soft wash, and holds for a moment before the rest follow.
  const lead = (i, from) => {
    if (i < from) return '';
    const k = i - from;
    const delay = k === 0 ? .8 : .8 + 1 + 1.2 + (k - 1) * .45;
    return ` class="new${k === 0 ? ' lead' : ''}" style="animation-delay:${delay.toFixed(2)}s"`;
  };

  // The channels an entry came through, for the channel filter.
  const channelsOf = (source = '') => [/WhatsApp/.test(source) && 'whatsapp', /Teams/.test(source) && 'teams'].filter(Boolean).join(' ');

  // The bottom row of an entry: why the agent acted (the rule), then the evidence (a message,
  // a case, the voice note). Always in the same place, so both are easy to find.
  function foot(e, i) {
    const r = e.rule && window.STORY.rules[e.rule];
    const rule = r ? `<button class="rule" data-rule="${e.rule}">${icon('rule')}Rule: ${esc(r.name)} · v${r.version}</button>` : '';
    const open = e.open ? `<button class="open-link" data-open="${i}">${icon(e.open === 'Play voice note' ? 'play' : 'open')}${esc(e.open)}</button>` : '';
    return rule || open ? `<p class="entry-foot">${rule}${open}</p>` : '';
  }

  // A rule, as Maheep maintains it: what it says, who it applies to, and every version.
  function ruleModal(r) {
    return `
      <div class="modal" role="dialog" aria-modal="true" aria-label="Rule">
        <header><h3>Rule</h3><button class="m-close" data-close aria-label="Close">${icon('close')}</button></header>
        <div class="m-body">
          <p class="m-rule-name">${esc(r.name)} <span>Version ${r.version}</span></p>
          <p class="m-text">${esc(r.sentence)}</p>
          <p class="m-label">Applies to</p>
          <p class="m-text">${esc(r.scope)}</p>
          <p class="m-label">Maintained by</p>
          <p class="m-text">${esc(r.owner)}</p>
          <p class="m-label">Version history</p>
          <ol class="m-history">${r.history.map(([v, d, c], k) => `<li class="${k ? '' : 'now'}"><b>${v}</b><span>${esc(d)}</span><p>${esc(c)}</p></li>`).join('')}</ol>
          <p class="m-note-small">Only an admin can change this rule, in Agent rules. A change creates a new version, and every decision keeps the version it was made under.</p>
        </div>
      </div>`;
  }

  // ---------- Kade's order in Sana: its Activity tab ----------
  const sanaTop = (on) => `
    <header class="sana-top">
      <div class="brand"><img class="logo" src="../assets/kade-logo.png" alt=""><b>Kade Foodservice</b><span class="on">on Sana</span></div>
      <nav>${['Orders', 'Cases', 'Customers', 'Agent rules'].map(n => `<span class="${n === on ? 'on' : ''}">${n}</span>`).join('')}</nav>
    </header>`;

  // The agent's version is kept for audits, in a tooltip, not on every row.
  const AGENT_VERSION = 'AI order agent, version 2.3';
  const ACTOR = { agent: 'AI order agent', system: 'System', nigel: 'Nigel · Head chef', priya: 'Priya · Buyer', tom: 'Tom · Service rep' };

  // Only the open decisions: it stays this size whether an order has 3 lines or 40.
  function summary(s) {
    const o = s.order;
    const c = s.caseFile;
    const open = o.lines.filter(l => !['confirmed', 'received'].includes(l.status));
    const done = o.lines.filter(l => l.status === 'confirmed').length;
    return `
      <aside class="summary">
        <h3>Open decisions</h3>
        <p class="tally">${open.length ? `${open.length} of ${o.lines.length} items still need a decision.` : `No open decisions. All ${o.lines.length} items are confirmed.`}</p>
        ${open.length ? `<ul class="sum-lines">${open.map(l => `
          <li class="${l.status === 'stopped' ? 'is-stop' : ''}">
            <b>${esc(l.name)}</b>
            ${statusChip(l, 'kade')}
            ${l.note ? `<span>${esc(l.note)}</span>` : ''}
          </li>`).join('')}
        </ul>` : ''}
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
      const divider = e.day !== day ? `<li class="day">${esc(window.STORY.dates[(day = e.day)])}</li>` : '';
      const [field, from, to] = e.change || [];
      return `${divider}
        <li${lead(i, ctx.fresh.trail)} data-kind="${e.who === 'agent' || e.who === 'system' ? e.who : 'person'}" data-channel="${channelsOf(e.source)}">
          <div class="entry ${e.stop ? 'is-stop' : ''}">
            <span class="t">${esc(e.time)}</span>
            ${avatar(e.who)}
            <div>
              <p class="actor-row">
                <span class="actor by-${e.who === 'agent' || e.who === 'system' ? e.who : 'person'}"${e.who === 'agent' ? ` title="${AGENT_VERSION}"` : ''}>${esc(ACTOR[e.who])}${e.source ? ` · via ${esc(e.source)}` : ''}</span>
              </p>
              <p><b>${esc(e.text)}</b></p>
              ${e.quote ? `<q>${esc(e.quote)}</q>` : ''}
              ${e.detail ? `<p class="detail">${esc(e.detail)}</p>` : ''}
              ${e.change ? `<p class="chg">${esc(field)}: <s>${esc(from)}</s> → <b>${esc(to)}</b></p>` : ''}
              ${foot(e, i)}
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
              ${[['all', 'All'], ['agent', 'AI agents'], ['person', 'People'], ['system', 'System']].map(([k, f], i) => `<button class="pill ${i ? '' : 'on'}" data-filter="${k}">${f}</button>`).join('')}
              <select class="select" data-channel-filter aria-label="Channel">
                ${[['', 'All channels'], ['whatsapp', 'WhatsApp'], ['teams', 'Teams'], ['email', 'Email'], ['phone', 'Phone call'], ['manual', 'Manually entered']].map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}
              </select>
              <span class="ro" title="Entries in this log can’t be edited or deleted.">${icon('lock')}Read-only</span>
            </div>
            <div class="trail-scroll"><ol class="trail">${rows}</ol>
              <div class="no-match" hidden><img src="../assets/empty-box.png?v=2" alt=""><p></p><button class="btn ghost sm" data-reset>Show all entries</button></div>
            </div>
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
        <div class="lock-time"><span>Wednesday 28 October</span><b>22:48</b></div>
        ${n ? `
        <button class="notification ${ctx.live.includes('open') ? 'live' : ''}" data-action="open">
          <span class="n-top"><img class="n-icon" src="../assets/whatsapp-icon.svg" alt=""><span>${esc(n.app)} · now</span>${icon('down')}</span>
          <b>${esc(n.from)}</b>
          <p>${esc(n.text)}</p>
        </button>` : ''}
      </div>`;
  }

  function whatsapp(s, scene, ctx) {
    // New messages come in one after another. When the agent answers Nigel, it shows that it is
    // typing for a second before its reply appears.
    let delay = 0;
    const msgs = s.wa.map((m, i) => {
      const out = m.who === 'nigel';
      const isNew = i >= ctx.fresh.wa;
      let typing = '';
      if (isNew && m.who === 'agent' && s.wa[i - 1] && s.wa[i - 1].who === 'nigel') {
        typing = `<div class="wa-typing" style="animation-delay:${delay.toFixed(2)}s"><span></span><span></span><span></span></div>`;
        delay += 1;
      }
      const wrap = isNew ? ` class="new" style="animation-delay:${delay.toFixed(2)}s"` : '';
      if (isNew) delay += .6;
      let body = esc(m.text).replace(/\n/g, '<br>');
      if (m.kind === 'voice') body = `<div class="voice"><span class="play">${icon('play')}</span><span class="wave">${'<i></i>'.repeat(24)}</span><span class="len">0:14</span></div>`;
      if (m.kind === 'done') body = `<p class="done-msg">${icon('check')} ${body}</p>`;
      const buttons = m.buttons ? `<div class="wa-buttons">${m.buttons.map(b => act(b, ctx)).join('')}</div>` : '';
      return `${typing}<div${wrap}><div class="msg ${out ? 'out' : 'in'} k-${m.kind}"><div class="bubble">${body}<span class="ts">${esc(m.time)}</span></div></div>${buttons}</div>`;
    }).join('');
    return `
      <div class="phone">
        <div class="phone-top">${icon('back')}${kadeMark()}<div><b>Kade Foodservice</b><span>Order agent (AI)</span></div>${icon('kebab')}</div>
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
        <div class="teams-top"><img class="teams-logo" src="../assets/teams-outline.png" alt=""><b>Teams</b><span class="search">Search</span></div>
        <div class="teams-main">
          <aside class="chats">
            <div class="chat-item ${onAssistant ? 'on' : ''}"><span class="assistant">${icon('agent')}</span><div><b>Your assistant</b><span>${esc(last(s.assistant))}</span></div></div>
            <div class="chat-item ${onAssistant ? '' : 'on'}">${kadeMark()}<div><b>Kade Foodservice</b><span>${esc(last(s.kade))}</span></div></div>
          </aside>
          <section class="conv">
            <header>${onAssistant ? `<span class="assistant">${icon('agent')}</span><b>Your assistant</b><span class="muted">The Olive Tree</span>` : `${kadeMark()}<b>Kade Foodservice</b><span class="muted">Order thread · ${esc(s.order.id)}</span>`}</header>
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
  const hintFor = (scene) => scene.hint ? `<p class="tap-hint at-${scene.hintAt}">${icon('point')}<em>${esc(scene.hint)}</em></p>` : '';
  // A hand and a short line beside the phone point to where the viewer clicks.
  const personScene = (s, scene, ctx, device) => `
    <div class="person-scene dev-${scene.screen}">
      <div class="device-wrap">${device}${hintFor(scene)}</div>
    </div>`;
  const wide = (s, scene, ctx, body) => `<div class="wide-scene">${body}${hintFor(scene)}</div>`;

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
    } else if (e.open === 'Open past orders') {
      const h = window.STORY.pastOrders;
      title = 'Past cheese board orders';
      body = `
        <p class="m-meta">Harbour Front · the last six orders with a cheese board</p>
        <p class="m-text">Each time: one board of ${esc(h.contents)}.</p>
        <ol class="m-history m-orders">${h.orders.map(([d, id]) => `<li><b>${esc(id)}</b><span>${esc(d)}</span><p>1 board, the same contents</p></li>`).join('')}</ol>
        <p class="m-note-small">All six orders agree, so the agent could read “the usual” without asking. If they had differed, it would have asked Nigel which board he meant.</p>`;
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

  window.VIEWS = { SCREENS, modal, ruleModal, VIEWPOINT, avatar, esc, icon, PEOPLE };
})();
