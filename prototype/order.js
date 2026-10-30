// One order record, and the story as a series of scenes that change it.
// Every screen (Kade's order activity, Nigel's WhatsApp, Priya's Teams, Tom's case) is drawn
// from this record; none of them keeps its own copy.
(() => {
  // Line statuses: one vocabulary, used by every screen.
  //   received   · the agent has the line, nothing decided yet
  //   confirmed  · within the contract and budget, or approved; done
  //   stopped    · the agent stopped and asked the person who owns the decision
  //   suggested  · a substitute is offered; the requester decides
  //   handed     · a person at Kade has taken it over
  //   quote      · a one-off quote waits for the requester
  const initial = () => ({
    day: 'Wednesday',
    order: {
      id: 'KD-24817',
      customer: 'The Olive Tree · Harbour',
      purpose: 'Private dinner, Saturday · 120 covers',
      status: 'Not created',
      erp: 'Not sent',
      lines: [
        { id: 'cheese', name: 'Cheese board, house selection', qty: '1 board', status: 'received' },
        { id: 'salmon', name: 'Salmon fillet', qty: '18 kg', status: 'received' },
        { id: 'wine', name: 'Sauvignon Blanc', qty: '24 bottles', status: 'received' },
      ],
    },
    trail: [],      // the order's activity in Kade's Sana: append only
    wa: [],         // Nigel's WhatsApp chat with Kade
    assistant: [],  // Priya's chat with her own AI assistant (Teams)
    kade: [],       // Priya's chat with Kade's app (Teams)
    notify: null,   // the lock-screen notification on Nigel's phone
    compose: '',    // what Priya is typing
    caseFile: null, // Tom's case
  });

  const line = (s, id) => s.order.lines.find(l => l.id === id);
  const set = (s, id, props) => Object.assign(line(s, id), props);
  // who: 'system' | 'agent' | a person. Optional: detail (the evidence), rule, stop.
  const log = (s, time, who, text, extra = {}) => s.trail.push({ day: s.day, time, who, text, ...extra });
  const wa = (s, time, who, text, extra = {}) => s.wa.push({ time, who, text, kind: 'text', ...extra });

  // ---------- Wednesday night ----------
  const intake = {
    time: '22:47',
    moment: 'intake', screen: 'trail',
    title: 'Kade’s agent picks up the voice note and works through it, line by line.',
    next: 'Nigel’s phone buzzes',
    apply(s) {
      wa(s, '22:47', 'nigel', 'Private dinner Saturday, 120 covers. Eighteen kilos of salmon, the usual cheese board, and 24 bottles of Sauvignon Blanc.', { kind: 'voice' });
      log(s, '22:47', 'system', 'New order request received', { detail: 'Type: voice message, 0:14 · From: Nigel, head chef', source: 'WhatsApp', open: 'Play voice note' });
      log(s, '22:47', 'agent', 'Transcribed the voice note', { quote: 'Private dinner Saturday, 120 covers. Eighteen kilos of salmon, the usual cheese board, and 24 bottles of Sauvignon Blanc.' });
      log(s, '22:47', 'agent', 'Matched to The Olive Tree · Harbour', { detail: 'Nigel’s number is on the Harbour account' });
      s.order.status = 'Draft';
      log(s, '22:47', 'agent', 'Created draft order KD-24817 with 3 lines', { change: ['Order', 'None', 'Draft'] });
      set(s, 'cheese', { status: 'confirmed' });
      log(s, '22:48', 'agent', 'Cheese board: confirmed', { change: ['Status', 'Received', 'Confirmed'], rule: 'In the contract, in stock, within budget' });
      set(s, 'salmon', { status: 'stopped', owner: 'priya', note: '€180 over Harbour’s fish budget' });
      log(s, '22:48', 'agent', 'Salmon: stopped, approval requested from Priya', { detail: '€180 over Harbour’s fish budget', change: ['Status', 'Received', 'Needs Priya'], rule: 'Category budget per outlet · v3', stop: true });
      set(s, 'wine', { status: 'suggested', owner: 'nigel', note: 'Not enough in stock · Pinot Grigio suggested' });
      log(s, '22:48', 'agent', 'Sauvignon Blanc: not enough in stock, Pinot Grigio suggested', { change: ['Status', 'Received', 'Asked Nigel'], rule: 'Substitutes are suggested; the requester decides' });
      s.order.status = 'Awaiting replies';
      log(s, '22:48', 'agent', 'Message sent to Nigel to confirm the order', { detail: 'Approval request also sent to Priya in Teams', source: 'WhatsApp', open: 'Open message', change: ['Order', 'Draft', 'Awaiting replies'] });
      s.kade.push({ time: '22:48', kind: 'card' });
    },
  };

  const lock = {
    time: '22:48',
    moment: 'nigel', screen: 'lock', actor: 'nigel',
    title: 'Nigel is closing up the kitchen when his phone buzzes.',
    prompt: 'Open the message on Nigel’s phone.',
    choices: [{ action: 'open', label: 'Open' }],
    apply(s) {
      s.notify = { app: 'WhatsApp', from: 'Kade Foodservice', text: 'Your order for Saturday: the cheese is confirmed, and two lines need a look.' };
    },
  };

  const readback = {
    time: '22:48',
    moment: 'nigel', screen: 'whatsapp', actor: 'nigel',
    title: 'The agent confirms what it may, and asks about what it may not.',
    prompt: 'Which reply does Nigel choose?',
    choices: [{ action: 'accept' }, { action: 'decline' }, { action: 'more' }],
    def: 'decline',
    apply(s) {
      s.notify = null;
      wa(s, '22:48', 'agent', 'Thanks, Nigel. Your order for Saturday is KD-24817.\n✓ Cheese board, house selection: confirmed.');
      wa(s, '22:48', 'agent', 'Salmon, 18 kg: this is €180 over Harbour’s fish budget, so I’ve asked Priya to approve it.');
      wa(s, '22:48', 'agent', 'Sauvignon Blanc, 24 bottles: we don’t have enough in stock. Pinot Grigio is a close match at the same price. Would that work?', {
        buttons: [{ action: 'accept', label: 'Accept Pinot Grigio' }, { action: 'decline', label: 'Decline' }, { action: 'more', label: 'More options' }],
      });
    },
  };

  const handToTom = (s) => {
    set(s, 'wine', { status: 'handed', owner: 'tom', note: 'With Tom from 08:00' });
    s.caseFile = { id: 'CS-3391', title: 'Source 24 × Sauvignon Blanc', status: 'Queued for 08:00', task: 'Find 24 bottles of Sauvignon Blanc for Harbour’s private dinner on Saturday.' };
    wa(s, '22:51', 'agent', s.more
      ? 'There’s no other Sauvignon Blanc in your contract, so I’ve passed the wine to Tom in our team. He starts on it at 08:00, and you’ll hear from us here.'
      : 'Understood. I’ve passed the wine to Tom in our team. He starts on it at 08:00, and you’ll hear from us here.');
  };

  const declined = {
    time: '22:51',
    moment: 'nigel', screen: 'whatsapp', actor: 'nigel',
    title: 'Nigel declines. The agent has nothing else it may offer, so it passes the wine to a person.',
    next: 'Back to Kade’s screen',
    apply(s) {
      wa(s, '22:51', 'nigel', 'Decline', { kind: 'reply' });
      handToTom(s);
    },
  };

  const more = {
    ...declined,
    title: 'Nigel asks for more options. There are none within his contract, so the agent passes the wine to a person.',
    apply(s) {
      s.more = true;
      wa(s, '22:51', 'nigel', 'More options', { kind: 'reply' });
      handToTom(s);
    },
  };

  const handover = {
    time: '22:51',
    moment: 'handover', screen: 'trail',
    title: 'Back at Kade, the hand-over is logged, and Tom has a case waiting for the morning.',
    next: 'Thursday morning',
    apply(s) {
      log(s, '22:51', 'nigel', s.more ? 'Nigel asked for more options' : 'Nigel declined Pinot Grigio', { detail: s.more ? 'No other Sauvignon Blanc in the contract' : 'Needs Sauvignon Blanc for the food pairing', source: 'WhatsApp', open: 'Open message' });
      log(s, '22:51', 'agent', 'Wine: handed over to Tom', { change: ['Status', 'Asked Nigel', 'With Tom'], rule: 'Hand over when no allowed option is left' });
      log(s, '22:51', 'system', 'Case CS-3391 created for Tom', { detail: 'Source 24 × Sauvignon Blanc · queued for 08:00 · full thread attached', open: 'Open case' });
      log(s, '22:51', 'agent', 'Told Nigel who has the wine, and when', { source: 'WhatsApp', open: 'Open message' });
    },
  };

  // ---------- Thursday morning ----------
  const morning = {
    moment: 'priya', screen: 'break', actor: 'priya', day: 'Thursday',
    kicker: 'Thursday, 07:40',
    title: 'Let’s start at Priya’s end.',
    body: 'Priya has her own AI assistant, a separate tool The Olive Tree uses. It can see their orders and the stock in all three restaurants.',
    next: 'Priya’s laptop',
    apply() {},
  };

  const tip = {
    time: '07:40',
    moment: 'priya', screen: 'teams', actor: 'priya', chat: 'assistant',
    title: 'Her assistant has read Kade’s update and checked the other restaurants.',
    prompt: 'Priya calls Old Town.',
    choices: [{ action: 'call' }],
    apply(s) {
      s.assistant.push({ time: '07:40', kind: 'card', text: 'Kade couldn’t fill 24 bottles of Sauvignon Blanc for Harbour’s Saturday dinner. Old Town has 10 of the same wine in stock.', buttons: [{ action: 'call', label: 'Call Old Town' }, { action: 'not-now', label: 'Not now' }] });
    },
  };

  const called = {
    time: '07:43',
    moment: 'priya', screen: 'teams', actor: 'priya', chat: 'assistant',
    title: 'Priya calls Old Town. They can send all 10 bottles. Her assistant only knows once she tells it.',
    prompt: 'Priya tells her assistant.',
    choices: [{ action: 'confirmed' }],
    apply(s) {
      s.assistant.push({ time: '07:43', kind: 'note', text: 'Call with Old Town · 2 min' });
      s.assistant.push({ time: '07:43', kind: 'card', text: 'Did Old Town confirm the 10 bottles?', buttons: [{ action: 'confirmed', label: 'Old Town confirmed' }, { action: 'not-available', label: 'Not available' }] });
    },
  };

  const compose = {
    time: '07:44',
    moment: 'priya', screen: 'teams', actor: 'priya', chat: 'kade',
    title: 'Priya replies in Kade’s order thread, not in a private chat, so the change lands on the order itself.',
    prompt: 'Priya sends the change.',
    choices: [{ action: 'send' }],
    apply(s) {
      s.assistant.push({ time: '07:44', kind: 'text', who: 'priya', text: 'Old Town confirmed' });
      s.assistant.push({ time: '07:44', kind: 'text', who: 'assistant', text: 'Noted. Let Kade know, so they only source 14.' });
      s.compose = '10 from Old Town. Source 14.';
    },
  };

  const sent = {
    time: '07:45',
    moment: 'priya', screen: 'teams', actor: 'priya', chat: 'kade',
    title: 'Kade’s agent updates the order and Tom’s case. While she’s here, Priya approves the salmon.',
    prompt: 'Priya approves the salmon.',
    choices: [{ action: 'approve' }],
    apply(s) {
      s.compose = '';
      s.kade.push({ time: '07:45', kind: 'text', who: 'priya', text: '10 from Old Town. Source 14.' });
      set(s, 'wine', { qty: '24 bottles · 10 from Old Town, 14 to source', note: 'Priya arranged 10 from Old Town' });
      s.caseFile = { ...s.caseFile, title: 'Source 14 × Sauvignon Blanc', task: 'Find 14 bottles of Sauvignon Blanc for Harbour’s private dinner on Saturday.', changed: 'Changed by Priya at 07:45: 10 bottles come from Old Town, so Kade sources 14.' };
      s.kade.push({ time: '07:45', kind: 'text', who: 'agent', text: 'Updated: Kade will source 14 bottles. Tom has the change.' });
      wa(s, '07:45', 'agent', 'Priya arranged 10 bottles from Old Town. Kade will source the other 14.');
    },
  };

  const priyaLogged = {
    time: '07:46',
    moment: 'priya', screen: 'trail',
    title: 'The order’s activity shows who changed what, and why, before Tom starts.',
    next: 'Tom opens his case',
    apply(s) {
      set(s, 'salmon', { status: 'confirmed', owner: null, note: 'Approved by Priya' });
      log(s, '07:45', 'priya', 'Priya changed the wine: 10 from Old Town, source 14', { change: ['To source', '24', '14'], source: 'Teams, Kade order thread', open: 'Open message' });
      log(s, '07:45', 'agent', 'Applied the change before work started', { rule: 'Changes from the buyer apply before work starts' });
      log(s, '07:45', 'system', 'Case CS-3391 updated', { change: ['Quantity', '24', '14'], open: 'Open case' });
      log(s, '07:45', 'agent', 'Told Nigel about the change', { source: 'WhatsApp', open: 'Open message' });
      log(s, '07:46', 'priya', 'Priya approved the salmon', { detail: '€180 over budget, approved', source: 'Teams', open: 'Open message' });
      log(s, '07:46', 'agent', 'Salmon: confirmed', { change: ['Status', 'Needs Priya', 'Confirmed'] });
    },
  };

  const tom = {
    time: '08:05',
    moment: 'tom', screen: 'desk', actor: 'tom',
    title: 'Tom opens his case. It already says 14, with the reason.',
    prompt: 'Tom sends Nigel a quote.',
    choices: [{ action: 'quote' }],
    apply(s) {
      s.caseFile = { ...s.caseFile, status: 'In progress', found: '14 bottles in stock at a partner supplier · €11.80 a bottle' };
    },
  };

  const quote = {
    time: '08:05',
    moment: 'tom', screen: 'whatsapp', actor: 'nigel',
    title: 'Nigel gets a one-off quote on WhatsApp. His contract stays as it is.',
    prompt: 'Nigel confirms the quote.',
    choices: [{ action: 'confirm' }],
    apply(s) {
      s.caseFile = { ...s.caseFile, status: 'Quote sent' };
      set(s, 'wine', { status: 'quote', owner: 'nigel', note: 'One-off quote · 14 × €11.80' });
      log(s, '08:05', 'tom', 'Tom sent Nigel a one-off quote: 14 × €11.80', { detail: 'Partner supplier · the contract is unchanged', change: ['Status', 'With Tom', 'Quote for Nigel'], source: 'WhatsApp', open: 'Open message' });
      wa(s, '08:05', 'agent', 'Tom found 14 bottles of Sauvignon Blanc at a partner supplier: a one-off price of €11.80 a bottle. Your contract stays as it is. Confirm?', {
        buttons: [{ action: 'confirm', label: 'Confirm' }, { action: 'no-thanks', label: 'No, thanks' }],
      });
    },
  };

  const done = {
    time: '08:31',
    moment: 'done', screen: 'trail',
    title: 'Every line has its owner’s answer. The order is confirmed and sent to Kade’s ERP.',
    next: 'Wrap up',
    apply(s) {
      wa(s, '08:30', 'nigel', 'Confirm', { kind: 'reply' });
      set(s, 'wine', { status: 'confirmed', owner: null, qty: '24 bottles', note: '10 from Old Town · 14 via one-off quote' });
      s.caseFile = { ...s.caseFile, status: 'Closed' };
      s.order.status = 'Confirmed';
      s.order.erp = 'Booked · delivery Fri 07:00–09:00';
      log(s, '08:30', 'nigel', 'Nigel confirmed the quote', { source: 'WhatsApp', open: 'Open message' });
      log(s, '08:30', 'agent', 'Sauvignon Blanc: confirmed', { change: ['Status', 'Quote for Nigel', 'Confirmed'] });
      log(s, '08:31', 'agent', 'All lines confirmed by their owners: order confirmed', { change: ['Order', 'Awaiting replies', 'Confirmed'], rule: 'Confirm only when every line is decided' });
      log(s, '08:31', 'system', 'Sent to Kade’s ERP: delivery Friday, 07:00–09:00', { change: ['ERP', 'Not sent', 'Booked'] });
      log(s, '08:31', 'agent', 'Confirmation sent to Nigel and Priya', { source: 'WhatsApp and Teams' });
      wa(s, '08:31', 'agent', 'Order KD-24817 is confirmed. Delivery Friday, 07:00–09:00.', { kind: 'done' });
    },
  };

  const end = {
    moment: 'done', screen: 'end',
    title: 'One voice note, three outcomes.',
    outcomes: [
      ['Acts', 'The cheese was confirmed on its own: in the contract, in stock, within budget.'],
      ['Stops', 'The salmon went over budget, so it went to Priya, who owns that decision.'],
      ['Hands over', 'The wine ran out of allowed options, so it went to Tom, with the full thread.'],
    ],
    links: [{ go: 'accept', label: 'What if Nigel had accepted?' }],
    apply() {},
  };

  // ---------- The other branch: Nigel accepts the Pinot Grigio ----------
  const accepted = {
    time: '22:50',
    moment: 'nigel', screen: 'whatsapp', actor: 'nigel',
    title: 'Nigel accepts the Pinot Grigio. No one at Kade needs to step in.',
    next: 'Back to Kade’s screen',
    apply(s) {
      wa(s, '22:50', 'nigel', 'Accept Pinot Grigio', { kind: 'reply' });
      set(s, 'wine', { name: 'Pinot Grigio', status: 'confirmed', owner: null, note: 'Swap accepted by Nigel' });
      wa(s, '22:50', 'agent', 'Done: 24 bottles of Pinot Grigio. The salmon is still with Priya. I’ll confirm the whole order once she approves it.');
    },
  };

  const acceptLogged = {
    time: '22:50',
    moment: 'accepted', screen: 'trail',
    title: 'The swap is logged. The order now waits only for Priya’s approval of the salmon.',
    next: 'Wrap up',
    apply(s) {
      log(s, '22:50', 'nigel', 'Nigel accepted Pinot Grigio', { source: 'WhatsApp', open: 'Open message' });
      log(s, '22:50', 'agent', 'Wine: confirmed as Pinot Grigio, 24 bottles', { change: ['Status', 'Asked Nigel', 'Confirmed'], rule: 'Substitutes are suggested; the requester decides' });
      log(s, '22:50', 'agent', 'Waiting for Priya to approve the salmon', { detail: 'Approval request in Teams since 22:48' });
    },
  };

  const acceptEnd = {
    moment: 'accepted', screen: 'end',
    title: 'This branch closes here.',
    body: 'In the morning, Priya approves the salmon and the order is confirmed. The agent acted and stopped; it never had to hand over.',
    links: [{ go: 'decline', label: 'Back to the main story' }],
    apply() {},
  };

  const shared = [intake, lock, readback];
  window.STORY = {
    initial,
    choiceAt: shared.length - 1,
    moments: {
      intake: ['Wed 22:47', 'The agent reads the order', 'agent'],
      nigel: ['22:48', 'Nigel confirms', 'nigel'],
      handover: ['22:51', 'Hand-over to Tom', 'agent'],
      accepted: ['22:50', 'Swap accepted', 'agent'],
      priya: ['Thu 07:40', 'Priya’s morning', 'priya'],
      tom: ['08:05', 'Tom finds the wine', 'tom'],
      done: ['08:31', 'Order confirmed', 'agent'],
    },
    paths: {
      decline: [...shared, declined, handover, morning, tip, called, compose, sent, priyaLogged, tom, quote, done, end],
      more: [...shared, more, handover, morning, tip, called, compose, sent, priyaLogged, tom, quote, done, end],
      accept: [...shared, accepted, acceptLogged, acceptEnd],
    },
    labels: { decline: 'Nigel declines the swap', more: 'Nigel asks for more options', accept: 'Nigel accepts the swap' },
  };
})();
