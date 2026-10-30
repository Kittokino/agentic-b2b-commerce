// Components and views. Kade's Sana screen and the people's screens (WhatsApp, Teams)
// are all drawn from the same order record, using the same small set of components.
(() => {
  const esc = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = (id) => `<svg class="ico"><use href="#i-${id}"/></svg>`;
  const clock = (t) => t.replace(/^(Wed|Thu) /, '');

  const PEOPLE = { nigel: 'Nigel', priya: 'Priya', tom: 'Tom', agent: 'Kade agent' };
  const ROLES = { nigel: 'Head chef, Harbour', priya: 'Buyer, The Olive Tree', tom: 'Service rep, Kade', agent: 'Works for Kade' };
  const CHANNELS = { whatsapp: ['chat', 'WhatsApp'], teams: ['teams', 'Teams'], desk: ['desk', 'Service desk'] };

  // ---------- Components ----------
  const avatar = (who, size = 'xs') =>
    who === 'agent'
      ? `<span class="face ${size} agent">${icon('agent')}</span>`
      : `<span class="face ${size}"><img src="../assets/personas/${who}.png" alt=""></span>`;

  // One status vocabulary; the label adapts to who is looking.
  function statusChip(line, viewer) {
    const mine = line.owner && line.owner === viewer;
    const map = {
      received: ['', 'Received'],
      confirmed: ['done', viewer === 'priya' ? 'Done' : 'Confirmed'],
      stopped: ['wait', mine ? 'Needs you' : `Needs ${PEOPLE[line.owner] || 'a person'}`],
      suggested: ['suggest', mine ? 'Your call' : 'Swap suggested'],
      handed: ['handed', 'With Tom'],
      quote: ['suggest', mine ? 'Your call' : `Quote for ${PEOPLE[line.owner] || 'buyer'}`],
    };
    const [cls, label] = map[line.status] || ['', line.status];
    const ic = line.status === 'confirmed' ? icon('check') : '';
    return `<span class="status ${cls || 'plain'}">${ic}${esc(label)}</span>`;
  }

  const lineRow = (line, viewer) => `
    <div class="o-line">
      <div class="o-main"><b>${esc(line.name)}</b><span>${esc(line.qty)}</span>${line.note ? `<em>${esc(line.note)}</em>` : ''}</div>
      <div class="o-side">${statusChip(line, viewer)}</div>
    </div>`;

  // ---------- Kade's view of the order, in Sana ----------
  // `fresh` says what the current step changed, so it can be highlighted.
  function sana(s, ctx) {
    const o = s.order;
    const { fresh } = ctx;
    const statusCls = o.status === 'Confirmed' ? 'done' : o.status === 'Draft' ? 'plain' : 'handed';

    const rows = o.lines.map(l => `
      <tr class="${fresh.lines.includes(l.id) ? 'fresh' : ''} ${l.status === 'stopped' ? 'is-stop' : ''}">
        <td><b>${esc(l.name)}</b><span>${esc(l.qty)}</span></td>
        <td>${statusChip(l, 'kade')}</td>
        <td>${l.owner ? `<span class="owner">${avatar(l.owner)}${esc(PEOPLE[l.owner])}</span>` : '<span class="muted">–</span>'}</td>
        <td class="why">${l.why ? esc(l.why) : '<span class="muted">Not checked yet</span>'}</td>
      </tr>`).join('');

    const thread = s.thread.map((m, i) => {
      const [ic, ch] = CHANNELS[m.channel];
      let text = esc(m.text);
      if (m.kind === 'voice') text = `<span class="voice-tag">${icon('mic')} Voice note, 0:14</span> <q>${esc(m.text)}</q>`;
      if (m.kind === 'readback') text = `${esc(m.text)} <span class="muted">(${m.lines.length} lines)</span>`;
      return `
        <li class="${i >= fresh.thread ? 'fresh' : ''}">
          ${avatar(m.who)}
          <div><span class="meta">${esc(PEOPLE[m.who])} <i>${icon(ic)}${ch}</i> ${esc(clock(m.time))}</span><p>${text}</p></div>
        </li>`;
    }).reverse().join('');

    const activity = s.activity.map((a, i) => `
      <li class="${i >= fresh.activity ? 'fresh' : ''}">
        <span class="t">${esc(clock(a.time))}</span>
        <div><p>${esc(a.text)}</p><span class="rule">${icon('rule')}${esc(a.rule)}</span></div>
      </li>`).reverse().join('');

    const c = s.caseFile;
    const decision = ctx.decision && ctx.decision.where === 'kade' ? ctx.decision : null;
    const caseCard = c ? `
      <section class="card case ${fresh.caseFile ? 'fresh' : ''} ${decision ? 'live' : ''}">
        <header><h3>Case ${esc(c.id)}</h3><span class="status handed">${esc(c.status)}</span></header>
        <div class="case-who">${avatar('tom')}<div><b>Tom</b><span>Service rep · has the full thread</span></div></div>
        <p class="task">${esc(c.task)}</p>
        ${decision ? `
          <div class="choice in-sana">
            <p class="lead">${esc(decision.text)}</p>
            <div class="choice-btns">${decision.actions.map(a => `<button class="btn" data-action="${a.action}">${esc(a.label)}</button>`).join('')}</div>
          </div>` : ''}
      </section>` : '';

    return `
      <header class="sana-top">
        <div class="brand"><span class="mark">K</span><b>Kade Foodservice</b><span class="on">on Sana</span></div>
        <nav><span class="on">Orders</span><span>Customers</span><span>Cases</span><span>Agent rules</span></nav>
        <div class="me">${avatar('tom')}<span>Tom</span></div>
      </header>
      <div class="sana-page">
        <div class="sana-main">
          <div class="crumb">Orders <span>/</span> ${esc(o.id)}</div>
          <div class="title-row">
            <h1>${esc(o.purpose)}</h1>
            <span class="status ${statusCls} big">${o.status === 'Confirmed' ? icon('check') : ''}${esc(o.status)}</span>
          </div>
          <dl class="facts">
            <div><dt>Customer</dt><dd>${esc(o.customer)}</dd></div>
            <div><dt>Came in by</dt><dd>${esc(o.via)}</dd></div>
            <div><dt>Handled by</dt><dd class="agent-dd">${avatar('agent')}Kade agent</dd></div>
            <div class="${fresh.erp ? 'fresh' : ''}"><dt>ERP</dt><dd>${esc(o.erp)}</dd></div>
          </dl>
          <section class="card lines">
            <table>
              <thead><tr><th>Line</th><th>Status</th><th>Decision with</th><th>Why</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </section>
          <section class="card thread">
            <header><h3>Conversation</h3><span class="muted">${s.thread.length} messages · every channel, one thread</span></header>
            <ul>${thread || '<li class="empty">No messages yet.</li>'}</ul>
          </section>
        </div>
        <aside class="sana-side">
          ${caseCard}
          <section class="card activity">
            <header><h3>${avatar('agent')}What the agent did</h3></header>
            <ul>${activity || '<li class="empty">Nothing yet.</li>'}</ul>
          </section>
        </aside>
      </div>`;
  }

  // ---------- WhatsApp (Nigel's phone) ----------
  function whatsapp(s) {
    const msgs = s.thread.filter(m => m.channel === 'whatsapp').map(m => {
      const out = m.who === 'nigel';
      let body = esc(m.text);
      if (m.kind === 'voice') {
        body = `<div class="voice"><span class="play">${icon('play')}</span><span class="wave">${'<i></i>'.repeat(22)}</span><span class="len">0:14</span></div>`;
      }
      if (m.kind === 'readback') body = `<p>${esc(m.text)}</p><div class="rb">${m.lines.map(l => lineRow(l, 'nigel')).join('')}</div>`;
      if (m.kind === 'done') body = `<p class="done-msg">${icon('check')} ${esc(m.text)}</p>`;
      return `<div class="msg ${out ? 'out' : 'in'} k-${m.kind}"><div class="bubble">${body}<span class="ts">${esc(clock(m.time))}</span></div></div>`;
    }).join('');
    return `
      <div class="phone">
        <div class="phone-top">${avatar('agent', 'sm')}<div><b>Kade Foodservice</b><span>business account</span></div></div>
        <div class="chat">${msgs || '<p class="empty">No messages yet.</p>'}</div>
        <div class="phone-bar"><span>Message</span>${icon('mic')}</div>
      </div>`;
  }

  // ---------- Teams (Priya's laptop) ----------
  function teams(s) {
    const mine = s.thread.filter(m => m.channel === 'teams');
    const hasCard = mine.some(m => m.kind === 'card');
    const updates = mine.filter(m => m.kind !== 'card').map(m => m.who === 'priya'
      ? `<li class="you"><span>${esc(clock(m.time))}</span>You: ${esc(m.text)}</li>`
      : `<li><span>${esc(clock(m.time))}</span>${esc(m.text)}</li>`).join('');
    const assistant = s.assistant
      ? `<div class="assist"><span class="assistant">${icon('agent')}</span><div><b>Your AI assistant</b><p>${esc(s.assistant)}</p></div></div>` : '';
    return `
      <div class="teams">
        <div class="teams-top"><span class="dot"></span><b>Teams</b><span>Kade Foodservice app</span></div>
        <div class="teams-body">
          ${assistant}
          ${hasCard ? `
          <div class="tcard">
            <div class="tcard-head">${avatar('agent', 'sm')}<div><b>Harbour · Saturday dinner</b><span>${esc(s.order.id)} · ${esc(s.order.status)}</span></div></div>
            ${s.order.lines.map(l => lineRow(l, 'priya')).join('')}
          </div>
          ${updates ? `<ul class="quiet">${updates}</ul>` : ''}` : '<p class="empty">Nothing needs you right now.</p>'}
        </div>
      </div>`;
  }

  window.VIEWS = { sana, whatsapp, teams, avatar, esc, icon, PEOPLE, ROLES };
})();
