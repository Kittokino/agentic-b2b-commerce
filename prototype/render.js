// Components and channel views. Each view is drawn from the same order record,
// using the same small set of components (status chip, order line, avatar).
(() => {
  const esc = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = (id) => `<svg class="ico"><use href="#i-${id}"/></svg>`;

  const PEOPLE = { nigel: 'Nigel', priya: 'Priya', tom: 'Tom', agent: 'Kade agent' };

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

  const lineRow = (line, viewer, action = '') => `
    <div class="o-line">
      <div class="o-main"><b>${esc(line.name)}</b><span>${esc(line.qty)}</span>${line.note ? `<em>${esc(line.note)}</em>` : ''}</div>
      <div class="o-side">${statusChip(line, viewer)}${action}</div>
    </div>`;

  const btn = (action, label, ctx, kind = '') => {
    const live = ctx.awaits.includes(action);
    return `<button class="btn ${kind} ${live ? 'live' : ''}" data-action="${action}" ${live ? '' : 'disabled'}>${esc(label)}</button>`;
  };

  // ---------- WhatsApp (Nigel's phone) ----------
  function whatsapp(s, ctx) {
    const msgs = s.thread.filter(m => m.to.includes('whatsapp')).map(m => {
      const out = m.who === 'nigel';
      let body = esc(m.text);
      if (m.kind === 'voice') {
        body = `<div class="voice"><span class="play">${icon('play')}</span><span class="wave">${'<i></i>'.repeat(22)}</span><span class="len">0:14</span></div>
                <div class="transcript">“${esc(m.text)}”</div>`;
      }
      if (m.kind === 'readback') {
        const rows = m.lines.map(l => lineRow(l, 'nigel')).join('');
        const wine = m.lines.find(l => l.id === 'wine');
        const actions = wine && wine.status === 'suggested'
          ? `<div class="actions">${btn('accept', 'Accept Pinot Grigio', ctx)}${btn('decline', 'Decline', ctx, 'ghost')}</div>` : '';
        body = `<p>${esc(m.text)}</p><div class="rb">${rows}</div>${actions}`;
      }
      if (m.kind === 'quote') body = `<p>${esc(m.text)}</p><div class="actions">${btn('confirm', 'Confirm', ctx)}</div>`;
      if (m.kind === 'done') body = `<p class="done-msg">${icon('check')} ${esc(m.text)}</p>`;
      return `<div class="msg ${out ? 'out' : 'in'} k-${m.kind}"><div class="bubble">${body}<span class="ts">${esc(m.time.replace(/^(Wed|Thu) /, ''))}</span></div></div>`;
    }).join('');
    return `
      <div class="phone">
        <div class="phone-top">${avatar('agent', 'sm')}<div><b>Kade Foodservice</b><span>business account · usually replies instantly</span></div></div>
        <div class="chat">${msgs || '<p class="empty">No messages yet.</p>'}</div>
        <div class="phone-bar"><span>Message</span>${icon('mic')}</div>
      </div>`;
  }

  // ---------- Teams (Priya) ----------
  function teams(s, ctx) {
    const hasCard = s.thread.some(m => m.to.includes('teams') && m.kind === 'card');
    const quiet = s.thread.filter(m => m.to.includes('teams') && (m.kind === 'quiet' || m.kind === 'done'))
      .map(m => `<li><span>${esc(m.time)}</span>${esc(m.text)}</li>`).join('');
    const rows = s.order.lines.map(l => {
      let action = '';
      if (l.id === 'salmon' && l.status === 'stopped') action = btn('confirm', 'Approve', ctx);
      if (l.id === 'wine' && l.status === 'handed') action = btn('adjust', 'Adjust', ctx, 'ghost');
      return lineRow(l, 'priya', action);
    }).join('');
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
            ${rows}
            <div class="tcard-foot">${icon('screen')} Open full order in Kade's webshop</div>
          </div>
          ${quiet ? `<ul class="quiet">${quiet}</ul>` : ''}` : '<p class="empty">Nothing needs you right now.</p>'}
        </div>
      </div>`;
  }

  // ---------- Service desk (Tom) ----------
  function desk(s, ctx) {
    const c = s.caseFile;
    if (!c) return `<div class="desk"><p class="empty">No open cases for The Olive Tree.</p></div>`;
    const story = s.thread.map(m => `
      <li>${avatar(m.who)}<div><span>${esc(m.time)} · ${esc(PEOPLE[m.who])} · ${esc(m.to.join(', '))}</span><p>${esc(m.kind === 'voice' ? 'Voice note: “' + m.text + '”' : m.text)}</p></div></li>`).join('');
    return `
      <div class="desk">
        <div class="desk-head"><div><span>${esc(c.id)} · ${esc(s.order.customer)}</span><b>${esc(c.title)}</b></div><span class="status handed">${esc(c.status)}</span></div>
        <p class="task">${esc(c.task)}</p>
        <h4>The full story</h4>
        <ul class="story">${story}</ul>
        <div class="actions">${btn('quote', 'Send one-off quote', ctx)}</div>
      </div>`;
  }

  // ---------- Webshop (order page) ----------
  function webshop(s) {
    const hist = s.thread.map(m => `<li><span>${esc(m.time)}</span>${esc(PEOPLE[m.who])}: ${esc(m.kind === 'voice' ? 'voice note' : m.text)}</li>`).join('');
    return `
      <div class="shop">
        <div class="shop-top"><b>Kade</b><span>Orders</span><span>Catalogue</span><span>Invoices</span></div>
        <div class="shop-body">
          <span class="crumb">Orders / ${esc(s.order.id)}</span>
          <h3>${esc(s.order.purpose)}</h3>
          <p class="meta">${esc(s.order.customer)} · <b>${esc(s.order.status)}</b></p>
          <div class="shop-lines">${s.order.lines.map(l => lineRow(l, 'shop')).join('')}</div>
          <h4>History</h4>
          <ul class="hist">${hist || '<li>No activity yet.</li>'}</ul>
        </div>
      </div>`;
  }

  // ---------- Behind the scenes: the order record ----------
  function record(s) {
    const chips = s.order.lines.map(l => `<span class="rec-line">${esc(l.name)} ${statusChip(l, 'record')}</span>`).join('');
    const last = s.thread[s.thread.length - 1];
    return `
      <div class="rec-id"><b>Sana · order record</b><span>${esc(s.order.id)} · ${esc(s.order.status)}</span></div>
      <div class="rec-lines">${chips}</div>
      <div class="rec-meta"><span>${s.thread.length} messages in the thread</span><span>ERP: ${esc(s.order.erp)}</span>${last ? `<span class="last">Last: ${esc(PEOPLE[last.who])}, ${esc(last.time)}</span>` : ''}</div>`;
  }

  window.VIEWS = { whatsapp, teams, desk, webshop, record };
})();
