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
  //   quote      · a one-time price waits for the requester
  const initial = () => ({
    day: 'Wednesday',
    order: {
      id: 'KD-24817',
      customer: 'The Olive Tree · Harbour Front',
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
    story: "After service at Harbour Front, Nigel sent Kade a voice note on WhatsApp. He is ordering for a private dinner on Saturday with 120 guests. On a usual Saturday, the restaurant serves about 70.",
    time: '22:47',
    screen: 'trail',
    title: 'Kade’s order agent reads the voice note and checks each item against the contract, the stock and the budget.',
    next: 'Go to Nigel’s phone',
    apply(s) {
      wa(s, '22:47', 'nigel', 'Private dinner Saturday, 120 covers. Eighteen kilos of salmon, the usual cheese board, and 24 bottles of Sauvignon Blanc.', { kind: 'voice' });
      log(s, '22:47', 'system', 'Received a new order request on WhatsApp', { detail: 'A 14-second voice message from Nigel, head chef at Harbour Front.', source: 'WhatsApp', open: 'Play voice note' });
      log(s, '22:47', 'agent', 'Transcribed the voice message', { quote: 'Private dinner Saturday, 120 covers. Eighteen kilos of salmon, the usual cheese board, and 24 bottles of Sauvignon Blanc.' });
      log(s, '22:47', 'agent', 'Matched the message to The Olive Tree, Harbour Front', { detail: 'Nigel’s phone number is registered on the Harbour Front account.' });
      s.order.status = 'Draft';
      log(s, '22:47', 'agent', 'Created draft order KD-24817 with three items', { change: ['Order', 'None', 'Draft'] });
      set(s, 'cheese', { status: 'confirmed' });
      log(s, '22:48', 'agent', 'Confirmed the cheese board', { change: ['Status', 'Received', 'Confirmed'], rule: 'In the contract, in stock, within budget' });
      set(s, 'salmon', { status: 'stopped', owner: 'priya', note: 'Takes Harbour Front €180 over its fish budget' });
      log(s, '22:48', 'agent', 'Stopped the salmon and asked Priya to approve it', { detail: 'The 18 kg of salmon takes Harbour Front €180 over its fish budget.', change: ['Status', 'Received', 'Waiting on Priya'], rule: 'Category budget per outlet · v3', stop: true });
      set(s, 'wine', { status: 'suggested', owner: 'nigel', note: 'Not enough in stock, so Pinot Grigio was suggested' });
      log(s, '22:48', 'agent', 'Suggested Pinot Grigio instead of Sauvignon Blanc', { detail: 'Kade has fewer than 24 bottles of Sauvignon Blanc in stock. Pinot Grigio is a close match at the same price.', change: ['Status', 'Received', 'Waiting on Nigel'], rule: 'Substitutes are suggested; the requester decides' });
      s.order.status = 'Waiting on customer';
      log(s, '22:48', 'agent', 'Sent Nigel a WhatsApp message to confirm the order', { detail: 'Also sent Priya a request in Teams to approve the salmon.', source: 'WhatsApp', open: 'Open message', change: ['Order', 'Draft', 'Waiting on customer'] });
      s.kade.push({ time: '22:48', kind: 'card' });
    },
  };

  const lock = {
    story: "Kade’s order agent confirmed the cheese board and asked Priya to approve the salmon. Kade does not have enough Sauvignon Blanc, so the agent needs Nigel to decide about the wine.",
    time: '22:48',
    screen: 'lock', actor: 'nigel',
    title: 'Nigel is closing up the kitchen when a WhatsApp message from Kade arrives.',
    prompt: 'Open the message on Nigel’s phone.',
    choices: [{ action: 'open', label: 'Open' }],
    apply(s) {
      s.notify = { app: 'WhatsApp', from: 'Kade Foodservice', text: 'We have your order for Saturday. The cheese board is confirmed. The salmon and the wine need a decision.' };
    },
  };

  const readback = {
    story: "Kade sends Nigel three messages, one for each item he ordered. The buttons under the last message are WhatsApp reply buttons.",
    time: '22:48',
    screen: 'whatsapp', actor: 'nigel',
    title: 'The agent confirms what the contract allows. For everything else, it asks the person who decides.',
    prompt: 'Which reply does Nigel choose?',
    choices: [{ action: 'accept' }, { action: 'decline' }, { action: 'more' }],
    def: 'decline',
    apply(s) {
      s.notify = null;
      wa(s, '22:48', 'agent', 'Thanks, Nigel. We have your order for Saturday, number KD-24817.\nThe cheese board (house selection) is confirmed.');
      wa(s, '22:48', 'agent', 'The 18 kg of salmon takes Harbour Front €180 over its fish budget, so I have asked Priya to approve it. You don’t need to do anything for the salmon.');
      wa(s, '22:48', 'agent', 'We don’t have 24 bottles of Sauvignon Blanc in stock. We can send 24 bottles of Pinot Grigio instead, at the same price. Would Pinot Grigio work for your dinner?', {
        buttons: [{ action: 'accept', label: 'Accept Pinot Grigio' }, { action: 'decline', label: 'Decline' }, { action: 'more', label: 'More options' }],
      });
    },
  };

  const handToTom = (s) => {
    set(s, 'wine', { status: 'handed', owner: 'tom', note: 'Tom will look for it from 08:00' });
    s.caseFile = { id: 'CS-3391', title: 'Find 24 bottles of Sauvignon Blanc', status: 'Starts at 08:00', task: 'For Harbour Front’s private dinner on Saturday. Nigel needs Sauvignon Blanc for the menu, so a different wine won’t do.' };
    wa(s, '22:51', 'agent', s.more
      ? 'There is no other Sauvignon Blanc in your contract. Tom from our customer service team will look for 24 bottles elsewhere when he starts work tomorrow at 08:00. We will message you here on WhatsApp with what he finds. You don’t need to do anything until then.'
      : 'Understood, Nigel. Tom from our customer service team will look for 24 bottles of Sauvignon Blanc when he starts work tomorrow at 08:00. We will message you here on WhatsApp with what he finds. You don’t need to do anything until then.');
  };

  const declined = {
    story: "Nigel needs Sauvignon Blanc because it is paired with a dish on the menu, so Pinot Grigio won’t work for him.",
    time: '22:51',
    screen: 'whatsapp', actor: 'nigel',
    title: 'Nigel declines the Pinot Grigio. The agent has no other wine it is allowed to offer, so it passes the request to Tom, a person at Kade.',
    next: 'Back to Kade’s screen',
    apply(s) {
      wa(s, '22:51', 'nigel', 'Decline', { kind: 'reply' });
      handToTom(s);
    },
  };

  const more = {
    ...declined,
    story: "Nigel asks whether Kade has any other options.",
    title: 'Nigel asks for more options. His contract has no other Sauvignon Blanc, so the agent passes the request to Tom, a person at Kade.',
    apply(s) {
      s.more = true;
      wa(s, '22:51', 'nigel', 'More options', { kind: 'reply' });
      handToTom(s);
    },
  };

  const handover = {
    story: "Tom will look for the Sauvignon Blanc in the morning, and the salmon is waiting for Priya’s approval. Nigel has nothing more to do tonight and can go home.",
    time: '22:51',
    screen: 'trail',
    title: 'Back on Kade’s screen, the hand-over is recorded, and Tom has a case ready for the morning.',
    next: 'Go to Thursday morning',
    apply(s) {
      log(s, '22:51', 'nigel', s.more ? 'Nigel asked for other options' : 'Nigel declined the Pinot Grigio', { detail: s.more ? 'There is no other Sauvignon Blanc in his contract.' : 'He needs Sauvignon Blanc to go with a dish on the menu.', source: 'WhatsApp', open: 'Open message' });
      s.order.status = 'Waiting on customer and Kade';
      log(s, '22:51', 'agent', 'Passed the Sauvignon Blanc request to Tom', { change: ['Status', 'Waiting on Nigel', 'With Tom'], rule: 'Hand over when no allowed option is left' });
      log(s, '22:51', 'system', 'Created case CS-3391 for Tom', { detail: 'Find 24 bottles of Sauvignon Blanc. Tom starts work at 08:00, and the full conversation is attached.', open: 'Open case' });
      log(s, '22:51', 'agent', 'Told Nigel that Tom will look for the Sauvignon Blanc at 08:00', { source: 'WhatsApp', open: 'Open message' });
    },
  };

  // ---------- Thursday morning ----------
  const morning = {
    story: "Overnight, the order stayed as it was. Tom starts work at 08:00, so nobody has looked for the Sauvignon Blanc yet, and Priya has not yet approved the salmon.",
    screen: 'break', actor: 'priya', day: 'Thursday',
    kicker: 'Thursday, 07:40',
    title: 'Let’s start at Priya’s end.',
    body: 'Priya also uses her own AI assistant. It belongs to The Olive Tree, not to Kade, and it can see the orders and the inventory of all three of their restaurants.',
    next: 'Go to Priya’s laptop',
    apply() {},
  };

  const tip = {
    story: "During the night, Kade’s order agent updated the order in Priya’s Teams. Tom will look for the Sauvignon Blanc at 08:00, and the salmon is waiting for Priya’s approval.",
    time: '07:40',
    screen: 'teams', actor: 'priya', chat: 'assistant',
    title: 'Priya’s assistant has read Kade’s update and checked the inventory of the other two restaurants.',
    prompt: 'Priya calls Old Town.',
    choices: [{ action: 'call' }],
    apply(s) {
      s.assistant.push({ time: '07:40', kind: 'card', text: 'Kade doesn’t have 24 bottles of Sauvignon Blanc for Harbour Front’s private dinner on Saturday. Old Town, one of your restaurants, has 10 bottles of the same wine in stock and could send them to Harbour Front.', buttons: [{ action: 'call', label: 'Call Old Town' }, { action: 'not-now', label: 'Not now' }] });
    },
  };

  const called = {
    story: "Priya calls the manager at Old Town to ask whether they can spare the 10 bottles.",
    time: '07:43',
    screen: 'teams', actor: 'priya', chat: 'assistant',
    title: 'Old Town can send all 10 bottles. Priya’s assistant does not hear the call, so it asks her how it went.',
    prompt: 'Priya tells her assistant.',
    choices: [{ action: 'confirmed' }],
    apply(s) {
      s.assistant.push({ time: '07:43', kind: 'note', text: 'Call with Old Town, 2 minutes' });
      s.assistant.push({ time: '07:43', kind: 'card', text: 'Did Old Town confirm the 10 bottles?', buttons: [{ action: 'confirmed', label: 'Old Town confirmed' }, { action: 'not-available', label: 'Not available' }] });
    },
  };

  const compose = {
    story: "Old Town will send 10 bottles to Harbour Front, so Kade only needs to find the other 14.",
    time: '07:44',
    screen: 'teams', actor: 'priya', chat: 'kade',
    title: 'Priya tells Kade in Kade’s order thread, not in a private chat, so the change is made on the order itself.',
    prompt: 'Priya sends the change.',
    choices: [{ action: 'send' }],
    apply(s) {
      s.assistant.push({ time: '07:44', kind: 'text', who: 'priya', text: 'Old Town confirmed' });
      s.assistant.push({ time: '07:44', kind: 'text', who: 'assistant', text: 'Thanks. Please tell Kade, so they look for 14 bottles instead of 24.' });
      s.compose = 'Our Old Town restaurant is sending 10 bottles of Sauvignon Blanc to Harbour Front. Please find the other 14.';
    },
  };

  const sent = {
    story: "Because Priya wrote in Kade’s order thread, Kade’s order agent can change the order directly.",
    time: '07:45',
    screen: 'teams', actor: 'priya', chat: 'kade',
    title: 'Kade’s order agent changes the wine to 14 bottles and updates Tom’s case. While she is in the thread, Priya also approves the salmon.',
    prompt: 'Priya approves the salmon.',
    choices: [{ action: 'approve' }],
    apply(s) {
      s.compose = '';
      s.kade.push({ time: '07:45', kind: 'text', who: 'priya', text: 'Our Old Town restaurant is sending 10 bottles of Sauvignon Blanc to Harbour Front. Please find the other 14.' });
      set(s, 'wine', { qty: '24 bottles · 10 from Old Town, 14 to source', note: '10 bottles come from Old Town' });
      s.caseFile = { ...s.caseFile, title: 'Find 14 bottles of Sauvignon Blanc', task: 'For Harbour Front’s private dinner on Saturday. Nigel needs Sauvignon Blanc for the menu, so a different wine won’t do.', changed: 'Priya changed this at 07:45. Old Town is sending 10 bottles, so Kade only needs to find 14.' };
      s.kade.push({ time: '07:45', kind: 'text', who: 'agent', text: 'Thanks, Priya. I have changed the order, so Kade will now find 14 bottles of Sauvignon Blanc instead of 24. Tom’s case is updated too.' });
      wa(s, '07:45', 'agent', 'Priya has arranged 10 bottles of Sauvignon Blanc from your Old Town restaurant. Kade will find the other 14 bottles, and we will message you here when we have them.');
    },
  };

  const priyaLogged = {
    story: "Priya’s change arrived before Tom started work, so nobody looks for bottles that are no longer needed.",
    time: '07:46',
    screen: 'trail',
    title: 'The order’s activity shows who changed what, and why, before Tom starts work.',
    next: 'Go to Tom’s case',
    apply(s) {
      set(s, 'salmon', { status: 'confirmed', owner: null, note: 'Approved by Priya' });
      log(s, '07:45', 'priya', 'Priya reduced the Sauvignon Blanc Kade must find from 24 to 14 bottles', { detail: 'Old Town is sending the other 10 bottles.', change: ['To source', '24', '14'], source: 'Teams, Kade order thread', open: 'Open message' });
      log(s, '07:45', 'agent', 'Updated the order before Tom started on the case', { rule: 'Changes from the buyer apply before work starts' });
      log(s, '07:45', 'system', 'Updated case CS-3391 to 14 bottles', { change: ['Quantity', '24', '14'], open: 'Open case' });
      log(s, '07:45', 'agent', 'Told Nigel that Old Town is sending 10 bottles', { source: 'WhatsApp', open: 'Open message' });
      log(s, '07:46', 'priya', 'Priya approved the salmon', { detail: 'She accepted going €180 over Harbour Front’s fish budget.', source: 'Teams, Kade order thread', open: 'Open approval' });
      log(s, '07:46', 'agent', 'Confirmed the salmon', { change: ['Status', 'Waiting on Priya', 'Confirmed'] });
      s.order.status = 'With Kade';
      log(s, '07:46', 'system', 'Changed the order status to With Kade', { detail: 'Only the Sauvignon Blanc is still open, and Tom has it.', change: ['Order', 'Waiting on customer and Kade', 'With Kade'] });
    },
  };

  const tom = {
    story: "When Tom starts work, he finds one case that tells the whole story, instead of a pile of messages to read.",
    time: '08:05',
    screen: 'desk', actor: 'tom',
    title: 'Tom opens his case. It already says 14 bottles and explains why.',
    prompt: 'Tom sends Nigel the price.',
    choices: [{ action: 'quote' }],
    apply(s) {
      s.caseFile = { ...s.caseFile, status: 'In progress', found: 'A partner supplier has 14 bottles in stock, at €11.80 a bottle.' };
    },
  };

  const quote = {
    story: "Tom found 14 bottles at a partner supplier. The price is not in The Olive Tree’s contract, so Nigel has to agree to it first.",
    time: '08:05',
    screen: 'whatsapp', actor: 'nigel',
    title: 'Nigel gets a one-time price on WhatsApp. His contract stays the same.',
    prompt: 'Nigel agrees to the price.',
    choices: [{ action: 'confirm' }],
    apply(s) {
      s.caseFile = { ...s.caseFile, status: 'Quote sent' };
      set(s, 'wine', { status: 'quote', owner: 'nigel', note: 'One-time price: 14 bottles at €11.80' });
      s.order.status = 'Waiting on customer';
      log(s, '08:05', 'tom', 'Tom sent Nigel a one-time price for 14 bottles at €11.80 each', { detail: 'The bottles come from a partner supplier. The contract does not change.', change: ['Status', 'With Tom', 'Waiting on Nigel'], source: 'WhatsApp', open: 'Open message' });
      wa(s, '08:05', 'agent', 'Tom has found 14 bottles of Sauvignon Blanc at a partner supplier. They cost €11.80 a bottle. This is a one-time price for this order, and your contract does not change. Shall we order them?', {
        buttons: [{ action: 'confirm', label: 'Yes, order them' }, { action: 'no-thanks', label: 'No, thanks' }],
      });
    },
  };

  const done = {
    story: "Nigel agreed to the one-time price on WhatsApp.",
    time: '08:31',
    screen: 'trail',
    title: 'Every item now has an answer from the person who decides. The order is confirmed and sent to Kade’s ERP system for delivery.',
    next: 'See the summary',
    apply(s) {
      wa(s, '08:30', 'nigel', 'Yes, order them', { kind: 'reply' });
      set(s, 'wine', { status: 'confirmed', owner: null, qty: '24 bottles', note: '10 bottles from Old Town and 14 from a partner supplier' });
      s.caseFile = { ...s.caseFile, status: 'Closed' };
      s.order.status = 'Confirmed';
      s.order.erp = 'Booked · delivery Fri 07:00–09:00';
      log(s, '08:30', 'nigel', 'Nigel agreed to the one-time price', { source: 'WhatsApp', open: 'Open message' });
      log(s, '08:30', 'agent', 'Confirmed the Sauvignon Blanc', { change: ['Status', 'Waiting on Nigel', 'Confirmed'] });
      log(s, '08:31', 'agent', 'Confirmed the order, because every item now has an answer', { change: ['Order', 'Waiting on customer', 'Confirmed'], rule: 'Confirm only when every line is decided' });
      log(s, '08:31', 'system', 'Sent the order to Kade’s ERP for delivery on Friday between 07:00 and 09:00', { change: ['ERP', 'Not sent', 'Booked'] });
      log(s, '08:31', 'agent', 'Sent the confirmation to Nigel and Priya', { source: 'WhatsApp and Teams' });
      wa(s, '08:31', 'agent', 'Your order KD-24817 is confirmed. We will deliver it to Harbour Front on Friday between 07:00 and 09:00.', { kind: 'done' });
    },
  };

  const end = {
    story: "It took from 22:47 on Wednesday to 08:31 on Thursday to go from one voice note to a confirmed order.",
    screen: 'end',
    title: 'One voice note, three outcomes.',
    outcomes: [
      ['Acts', 'The agent confirmed the cheese board by itself, because it was in the contract, in stock and within budget.'],
      ['Stops', 'The salmon went over Harbour Front’s fish budget, so the agent stopped and asked Priya, who decides on budgets.'],
      ['Hands over', 'The agent had no other wine it was allowed to offer, so it passed the Sauvignon Blanc to Tom with the full conversation.'],
    ],
    links: [{ go: 'accept', label: 'What if Nigel had accepted?' }],
    apply() {},
  };

  // ---------- The other branch: Nigel accepts the Pinot Grigio ----------
  const accepted = {
    story: "In this version of the story, Pinot Grigio works with Nigel’s menu.",
    time: '22:50',
    screen: 'whatsapp', actor: 'nigel',
    title: 'Nigel accepts the Pinot Grigio, so nobody at Kade needs to step in.',
    next: 'Back to Kade’s screen',
    apply(s) {
      wa(s, '22:50', 'nigel', 'Accept Pinot Grigio', { kind: 'reply' });
      set(s, 'wine', { name: 'Pinot Grigio', status: 'confirmed', owner: null, note: 'Nigel accepted Pinot Grigio' });
      wa(s, '22:50', 'agent', 'Thanks, Nigel. I have changed the wine to 24 bottles of Pinot Grigio. The salmon is still waiting for Priya’s approval, and I will confirm the whole order as soon as she approves it.');
    },
  };

  const acceptLogged = {
    story: "Nigel chose the suggested wine, so the agent could settle the wine without help from Tom.",
    time: '22:50',
    screen: 'trail',
    title: 'The change of wine is recorded. The order now waits only for Priya to approve the salmon.',
    next: 'See the summary',
    apply(s) {
      log(s, '22:50', 'nigel', 'Nigel accepted the Pinot Grigio', { source: 'WhatsApp', open: 'Open message' });
      log(s, '22:50', 'agent', 'Confirmed 24 bottles of Pinot Grigio instead of Sauvignon Blanc', { change: ['Status', 'Waiting on Nigel', 'Confirmed'], rule: 'Substitutes are suggested; the requester decides' });
      log(s, '22:50', 'agent', 'Waiting for Priya to approve the salmon', { detail: 'Priya has had the approval request in Teams since 22:48.' });
    },
  };

  const acceptEnd = {
    story: "Nigel accepted the Pinot Grigio at 22:50.",
    screen: 'end',
    title: 'This branch closes here.',
    body: 'In the morning, Priya approves the salmon, and the order is confirmed. In this version, the agent confirmed what it could and stopped for the salmon, but it never needed to pass anything to a person at Kade.',
    links: [{ go: 'decline', label: 'Back to the main story' }],
    apply() {},
  };

  const shared = [intake, lock, readback];
  window.STORY = {
    initial,
    choiceAt: shared.length - 1,
    paths: {
      decline: [...shared, declined, handover, morning, tip, called, compose, sent, priyaLogged, tom, quote, done, end],
      more: [...shared, more, handover, morning, tip, called, compose, sent, priyaLogged, tom, quote, done, end],
      accept: [...shared, accepted, acceptLogged, acceptEnd],
    },
  };
})();
