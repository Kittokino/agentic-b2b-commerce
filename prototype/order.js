// One order record, and the story as a series of changes to it.
// Every view (Kade's Sana screen, WhatsApp, Teams) is drawn from this record;
// none of them keeps its own copy.
(() => {
  // Line statuses: one vocabulary, used by every view.
  //   received   · the agent has the line, nothing decided yet
  //   confirmed  · within the contract and budget; done
  //   stopped    · the agent stopped and asked the person who owns the decision
  //   suggested  · a substitute is offered; the requester decides
  //   handed     · a person at Kade has taken it over
  //   quote      · a one-off quote waits for the requester
  const initial = () => ({
    time: '',
    order: {
      id: 'KD-24817',
      customer: 'The Olive Tree · Harbour',
      purpose: 'Private dinner, Saturday · 120 covers',
      via: 'WhatsApp voice note from Nigel',
      status: 'Draft',
      erp: 'Not sent',
      lines: [
        { id: 'salmon', name: 'Salmon fillet', qty: '18 kg', status: 'received', note: '', why: '' },
        { id: 'cheese', name: 'Cheese board, house selection', qty: '1 board', status: 'received', note: '', why: '' },
        { id: 'wine', name: 'Sauvignon Blanc', qty: '24 bottles', status: 'received', note: '', why: '' },
      ],
    },
    thread: [],    // every message, on every channel, attached to the order
    activity: [],  // what the agent did, and the rule behind it
    caseFile: null,
    assistant: null,
  });

  const line = (s, id) => s.order.lines.find(l => l.id === id);
  const say = (s, entry) => s.thread.push({ time: s.time, ...entry });
  const act = (s, text, rule) => s.activity.push({ time: s.time, text, rule });
  const snapshot = (s) => JSON.parse(JSON.stringify(s.order.lines));

  // Steps for the story the deck tells (Nigel declines the swap).
  const shared = [
    {
      time: 'Wed 22:47', label: 'Voice note', actor: 'nigel',
      cue: "Nigel's voice note, on his phone",
      caption: 'After service, Nigel sends Kade one voice note with three items.',
      seen: ['nigel'],
      apply(s) {
        say(s, { who: 'nigel', channel: 'whatsapp', kind: 'voice', text: 'Private dinner Saturday, 120 covers. Eighteen kilos of salmon, the usual cheese board, and 24 bottles of Sauvignon Blanc.' });
        act(s, 'Transcribed the voice note and created a draft order with three lines.', 'Orders from WhatsApp are accepted for The Olive Tree');
      },
    },
    {
      time: '22:48', label: 'Read-back', actor: 'agent', stop: true,
      cue: "Waiting for Nigel's call on the wine",
      caption: 'The agent checks each line against the contract, stock and budgets, and reads the order back.',
      seen: ['nigel', 'priya'],
      decision: {
        who: 'nigel',
        text: 'The Pinot Grigio is in stock and within budget. Nigel needs Sauvignon Blanc for the food pairing. What does he do?',
        actions: [{ action: 'accept', label: 'Accept the Pinot Grigio' }, { action: 'decline', label: 'Decline it' }],
      },
      apply(s) {
        s.order.status = 'In progress';
        Object.assign(line(s, 'cheese'), { status: 'confirmed', note: 'Within contract and budget', why: 'In the contract, in stock, within budget: confirmed on its own.' });
        Object.assign(line(s, 'salmon'), { status: 'stopped', owner: 'priya', note: '€180 over Harbour\'s fish budget', why: 'Over the outlet\'s fish budget, so it stopped and asked Priya. The order itself is unchanged.' });
        Object.assign(line(s, 'wine'), { status: 'suggested', owner: 'nigel', note: 'Low stock · Pinot Grigio suggested', why: 'Low on stock. A substitute within budget is allowed as a suggestion; Nigel decides.' });
        act(s, 'Confirmed the cheese board.', 'Within contract and budget');
        act(s, 'Stopped on the salmon and asked Priya.', 'Category budget per outlet · set by Maheep');
        act(s, 'Suggested Pinot Grigio for the wine and asked Nigel.', 'Substitutes: suggest only, requester decides');
        say(s, { who: 'agent', channel: 'whatsapp', kind: 'readback', text: 'Here is your order for Saturday, line by line.', lines: snapshot(s) });
        say(s, { who: 'agent', channel: 'teams', kind: 'card', text: 'Harbour · Saturday dinner: one line needs your approval.' });
      },
    },
  ];

  const decline = [
    {
      time: '22:51', label: 'Swap declined', actor: 'nigel',
      cue: "Nigel and Priya see the hand-over",
      caption: 'Nigel declines the Pinot Grigio. The agent has nothing else it may offer, so it hands the wine to Tom.',
      seen: ['nigel', 'priya'],
      apply(s) {
        say(s, { who: 'nigel', channel: 'whatsapp', kind: 'text', text: 'Has to be Sauvignon Blanc, it\'s for the pairing.' });
        Object.assign(line(s, 'wine'), { status: 'handed', owner: 'tom', note: 'With Tom from 08:00', why: 'No other allowed option, so it handed the wine to Tom with the full thread.' });
        s.caseFile = { id: 'CS-3391', title: 'Source 24 × Sauvignon Blanc', status: 'Queued for 08:00', task: 'Find 24 bottles of Sauvignon Blanc for Saturday.' };
        act(s, 'Handed the wine to Tom, with the full thread.', 'Hand over when no allowed option is left');
        say(s, { who: 'agent', channel: 'whatsapp', kind: 'text', text: 'Understood. Our team will look for Sauvignon Blanc from 08:00, and I\'ll keep you posted.' });
        say(s, { who: 'agent', channel: 'teams', kind: 'quiet', text: 'Wine: with Tom at Kade from 08:00.' });
      },
    },
    {
      time: 'Thu 07:40', label: 'Stock at Old Town', actor: 'priya',
      cue: "Priya's assistant has a tip for her",
      caption: 'Early on Thursday, Priya\'s own AI assistant tells her that Old Town has 10 bottles of the same wine.',
      seen: ['priya'],
      decision: {
        who: 'priya',
        text: 'Priya calls Old Town. They can spare all 10 bottles. She updates the wine line before Kade opens.',
        actions: [{ action: 'adjust', label: 'Take 10 from Old Town, source 14' }],
      },
      apply(s) {
        s.assistant = 'Old Town has 10 bottles of this Sauvignon Blanc in stock.';
      },
    },
    {
      time: '07:45', label: 'Priya adjusts', actor: 'priya',
      cue: "Priya and Nigel see the change",
      caption: 'Priya\'s change reaches Kade before Tom starts. His case now says 14 bottles, not 24.',
      seen: ['priya', 'nigel'],
      decision: {
        who: 'tom', where: 'kade',
        text: 'At 08:05 Tom opens the case. He finds 14 bottles at a partner supplier.',
        actions: [{ action: 'quote', label: 'Send Nigel a one-off quote' }],
      },
      apply(s) {
        s.assistant = 'Old Town has 10 bottles of this Sauvignon Blanc. Priya called them: they can spare all 10.';
        Object.assign(line(s, 'wine'), { qty: '24 bottles · 10 from Old Town, 14 to source', note: 'Priya arranged 10 from Old Town', why: 'Priya changed the line before Tom started, so nothing is ordered twice.' });
        s.caseFile = { ...s.caseFile, title: 'Source 14 × Sauvignon Blanc', task: 'Find 14 bottles of Sauvignon Blanc for Saturday. Priya has arranged the other 10 from Old Town.' };
        act(s, 'Updated the wine line and Tom\'s case to 14 bottles.', 'Changes from the buyer are applied before work starts');
        say(s, { who: 'priya', channel: 'teams', kind: 'text', text: '10 from Old Town. Source 14.' });
        say(s, { who: 'agent', channel: 'whatsapp', kind: 'text', text: 'Priya arranged 10 bottles from Old Town. Kade will source the other 14.' });
      },
    },
    {
      time: '08:05', label: 'Tom sends a quote', actor: 'tom',
      cue: "Waiting for Nigel and Priya",
      caption: 'Tom finds 14 bottles at a partner supplier and sends a one-off quote. The contract stays as it is.',
      seen: ['nigel', 'priya'],
      decision: {
        who: 'both',
        text: 'Nigel checks the quote. Priya still has the salmon waiting for her approval.',
        actions: [{ action: 'confirm', label: 'Nigel confirms, Priya approves' }],
      },
      apply(s) {
        s.caseFile = { ...s.caseFile, status: 'Quote sent' };
        Object.assign(line(s, 'wine'), { status: 'quote', owner: 'nigel', note: 'One-off quote · 14 × €11.80', why: 'A one-off price from a partner supplier needs Nigel\'s OK. The contract is unchanged.' });
        say(s, { who: 'tom', channel: 'desk', kind: 'text', text: 'Found 14 at a partner supplier. Sending a one-off quote; the contract stays as it is.' });
        say(s, { who: 'agent', channel: 'whatsapp', kind: 'quote', text: 'Tom found 14 bottles: one-off price €11.80 a bottle. Confirm?' });
      },
    },
    {
      time: '08:30', label: 'Decisions', actor: 'priya',
      cue: "Nigel and Priya decide",
      caption: 'Nigel confirms the wine quote, and Priya approves the salmon.',
      seen: ['nigel', 'priya'],
      apply(s) {
        Object.assign(line(s, 'wine'), { status: 'confirmed', owner: null, qty: '24 bottles', note: '10 from Old Town · 14 via one-off quote', why: 'Confirmed by Nigel.' });
        Object.assign(line(s, 'salmon'), { status: 'confirmed', owner: null, note: 'Approved by Priya', why: 'Approved by Priya.' });
        say(s, { who: 'nigel', channel: 'whatsapp', kind: 'text', text: 'Confirmed.' });
        say(s, { who: 'priya', channel: 'teams', kind: 'text', text: 'Approved.' });
      },
    },
  ];

  const done = {
    time: '08:31', label: 'Confirmed', actor: 'agent',
      cue: "The confirmation, on every screen",
    caption: 'The order is confirmed, the same in every channel, and sent to Kade\'s ERP for delivery.',
    seen: ['nigel', 'priya'],
    apply(s) {
      s.order.status = 'Confirmed';
      s.order.erp = 'Booked · delivery Fri 07:00–09:00';
      act(s, 'Sent the confirmed order to Kade\'s ERP.', 'All lines confirmed by their owners');
      say(s, { who: 'agent', channel: 'whatsapp', kind: 'done', text: 'Order confirmed. Delivery Friday, 07:00–09:00.' });
      say(s, { who: 'agent', channel: 'teams', kind: 'done', text: 'Order confirmed. Delivery Friday, 07:00–09:00.' });
    },
  };

  // The other branch: Nigel accepts the Pinot Grigio, so there is no hand-over.
  const accept = [
    {
      time: '22:50', label: 'Swap accepted', actor: 'nigel',
      cue: "Waiting for Priya's approval",
      caption: 'Nigel accepts the Pinot Grigio. No hand-over is needed.',
      seen: ['nigel', 'priya'],
      decision: {
        who: 'priya',
        text: 'In the morning, Priya sees the salmon waiting for her.',
        actions: [{ action: 'confirm', label: 'Priya approves the salmon' }],
      },
      apply(s) {
        say(s, { who: 'nigel', channel: 'whatsapp', kind: 'text', text: 'Pinot Grigio is fine.' });
        Object.assign(line(s, 'wine'), { name: 'Pinot Grigio', status: 'confirmed', owner: null, note: 'Swap accepted by Nigel', why: 'Nigel accepted the suggested substitute.' });
        act(s, 'Confirmed Pinot Grigio after Nigel accepted.', 'Substitutes: suggest only, requester decides');
        say(s, { who: 'agent', channel: 'teams', kind: 'quiet', text: 'Wine: Pinot Grigio, accepted by Nigel.' });
      },
    },
    {
      time: 'Thu 08:30', label: 'Priya approves', actor: 'priya',
      cue: "Priya approves the salmon",
      caption: 'Priya approves the salmon.',
      seen: ['priya'],
      apply(s) {
        Object.assign(line(s, 'salmon'), { status: 'confirmed', owner: null, note: 'Approved by Priya', why: 'Approved by Priya.' });
        say(s, { who: 'priya', channel: 'teams', kind: 'text', text: 'Approved.' });
      },
    },
  ];

  window.STORY = {
    initial,
    paths: { decline: [...shared, ...decline, done], accept: [...shared, ...accept, done] },
  };
})();
