// One order record, and the story as a series of changes to it.
// Every screen (WhatsApp, Teams, service desk, webshop) is drawn from this record;
// none of them keeps its own copy. That is the point of the prototype.
(() => {
  // Line statuses: one vocabulary, used by every channel.
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
      status: 'Draft',
      erp: 'Not sent',
      lines: [
        { id: 'salmon', name: 'Salmon fillet', qty: '18 kg', status: 'received', note: '' },
        { id: 'cheese', name: 'Cheese board, house selection', qty: '1 board', status: 'received', note: '' },
        { id: 'wine', name: 'Sauvignon Blanc', qty: '24 bottles', status: 'received', note: '' },
      ],
    },
    // The conversation thread, attached to the order. `to` says whose channel shows it.
    thread: [],
    // Tom's case at the service desk (exists once the agent hands over).
    caseFile: null,
    // What Priya's own AI assistant says (The Olive Tree's tool, not Sana's).
    assistant: null,
  });

  const line = (s, id) => s.order.lines.find(l => l.id === id);
  const say = (s, entry) => s.thread.push({ time: s.time, ...entry });

  // Steps for the story the deck tells (Nigel declines the swap).
  const shared = [
    {
      time: 'Wed 22:47', actor: 'nigel', panel: 'whatsapp',
      caption: 'After service, Nigel sends Kade one voice note.',
      apply(s) {
        s.order.status = 'Draft';
        say(s, { who: 'nigel', to: ['whatsapp'], kind: 'voice', text: 'Private dinner Saturday, 120 covers. Eighteen kilos of salmon, the usual cheese board, and 24 bottles of Sauvignon Blanc.' });
      },
    },
    {
      time: '22:48', actor: 'agent', panel: 'whatsapp', stop: true,
      caption: 'The agent reads the order back. Cheese is confirmed, the salmon goes to Priya, and a swap is suggested for the wine.',
      awaits: ['decline', 'accept'],
      apply(s) {
        s.order.status = 'In progress';
        Object.assign(line(s, 'cheese'), { status: 'confirmed', note: 'Within contract and budget' });
        Object.assign(line(s, 'salmon'), { status: 'stopped', owner: 'priya', note: '€180 over Harbour\'s fish budget' });
        Object.assign(line(s, 'wine'), { status: 'suggested', owner: 'nigel', note: 'Low on stock. Pinot Grigio is in stock, same price band.', alt: 'Pinot Grigio' });
        say(s, { who: 'agent', to: ['whatsapp'], kind: 'readback', text: 'Here is your order for Saturday, line by line.', lines: JSON.parse(JSON.stringify(s.order.lines)) });
        say(s, { who: 'agent', to: ['teams'], kind: 'card', text: 'Harbour · Saturday dinner. One line needs your approval.' });
      },
    },
  ];

  const decline = [
    {
      time: '22:51', actor: 'nigel', panel: 'whatsapp',
      caption: 'Nigel declines the Pinot Grigio. The agent has nothing else it may offer, so it hands the wine to Tom.',
      apply(s) {
        say(s, { who: 'nigel', to: ['whatsapp'], kind: 'text', text: 'Has to be Sauvignon Blanc, it\'s for the pairing.' });
        Object.assign(line(s, 'wine'), { status: 'handed', owner: 'tom', note: 'With Tom at Kade from 08:00', alt: null });
        s.caseFile = { id: 'CS-3391', title: 'Source 24 × Sauvignon Blanc', status: 'Queued for 08:00', task: 'Find 24 bottles of Sauvignon Blanc for Saturday.' };
        say(s, { who: 'agent', to: ['whatsapp'], kind: 'text', text: 'Understood. Our team will look for Sauvignon Blanc from 08:00, and I\'ll keep you posted.' });
        say(s, { who: 'agent', to: ['teams'], kind: 'quiet', text: 'Wine: with Tom at Kade from 08:00.' });
      },
    },
    {
      time: 'Thu 07:40', actor: 'priya', panel: 'teams',
      caption: 'Early on Thursday, Priya\'s AI assistant tells her that Old Town has 10 bottles of the same wine.',
      awaits: ['adjust'],
      apply(s) {
        s.assistant = 'Old Town has 10 bottles of this Sauvignon Blanc in stock.';
      },
    },
    {
      time: '07:45', actor: 'priya', panel: 'teams',
      caption: 'Priya calls Old Town to check, then adjusts the wine line before Kade opens. Tom\'s case now says 14, not 24.',
      awaits: ['quote'],
      apply(s) {
        s.assistant = 'Old Town has 10 bottles of this Sauvignon Blanc in stock. Priya called them: they can spare all 10.';
        Object.assign(line(s, 'wine'), { qty: '24 bottles: 10 from Old Town, 14 to source', note: 'Priya arranged 10 from Old Town' });
        s.caseFile = { ...s.caseFile, title: 'Source 14 × Sauvignon Blanc', task: 'Find 14 bottles of Sauvignon Blanc for Saturday. Priya has arranged the other 10 from Old Town.' };
        say(s, { who: 'priya', to: ['teams'], kind: 'text', text: '10 from Old Town. Source 14.' });
        say(s, { who: 'agent', to: ['whatsapp'], kind: 'text', text: 'Priya arranged 10 bottles from Old Town. Kade will source the other 14.' });
      },
    },
    {
      time: '08:05', actor: 'tom', panel: 'desk',
      caption: 'Tom opens the case with the full story, finds 14 bottles at a partner supplier, and sends a one-off quote.',
      awaits: ['confirm'],
      apply(s) {
        s.caseFile = { ...s.caseFile, status: 'Quote sent' };
        Object.assign(line(s, 'wine'), { status: 'quote', owner: 'nigel', note: 'One-off quote: 14 × €11.80 from a partner supplier' });
        say(s, { who: 'tom', to: ['desk'], kind: 'text', text: 'Found 14 at a partner supplier. Sending a one-off quote; the contract stays as it is.' });
        say(s, { who: 'agent', to: ['whatsapp'], kind: 'quote', text: 'Tom found 14 bottles: one-off price €11.80 a bottle. Confirm?' });
      },
    },
    {
      time: '08:30', actor: 'priya', panel: 'teams',
      caption: 'Nigel confirms the wine quote, and Priya approves the salmon.',
      apply(s) {
        Object.assign(line(s, 'wine'), { status: 'confirmed', owner: null, qty: '24 bottles', note: '10 from Old Town · 14 via one-off quote' });
        Object.assign(line(s, 'salmon'), { status: 'confirmed', owner: null, note: 'Approved by Priya' });
        say(s, { who: 'nigel', to: ['whatsapp'], kind: 'text', text: 'Confirmed.' });
        say(s, { who: 'priya', to: ['teams'], kind: 'text', text: 'Approved.' });
      },
    },
    {
      time: '08:31', actor: 'agent', panel: 'webshop',
      caption: 'The order is confirmed, and the same everywhere. Sana sends it to Kade\'s ERP for delivery.',
      apply(s) {
        s.order.status = 'Confirmed';
        s.order.erp = 'Booked · delivery Fri 07:00–09:00';
        say(s, { who: 'agent', to: ['whatsapp', 'teams'], kind: 'done', text: 'Order confirmed. Delivery Friday, 07:00–09:00.' });
      },
    },
  ];

  // The other branch: Nigel accepts the Pinot Grigio, so there is no hand-over.
  const accept = [
    {
      time: '22:50', actor: 'nigel', panel: 'whatsapp',
      caption: 'Nigel accepts the Pinot Grigio. No hand-over is needed.',
      awaits: ['confirm'],
      apply(s) {
        say(s, { who: 'nigel', to: ['whatsapp'], kind: 'text', text: 'Pinot Grigio is fine.' });
        Object.assign(line(s, 'wine'), { name: 'Pinot Grigio', status: 'confirmed', owner: null, note: 'Swap accepted by Nigel', alt: null });
        say(s, { who: 'agent', to: ['teams'], kind: 'quiet', text: 'Wine: Pinot Grigio, accepted by Nigel.' });
      },
    },
    {
      time: 'Thu 08:30', actor: 'priya', panel: 'teams',
      caption: 'Priya approves the salmon.',
      apply(s) {
        Object.assign(line(s, 'salmon'), { status: 'confirmed', owner: null, note: 'Approved by Priya' });
        say(s, { who: 'priya', to: ['teams'], kind: 'text', text: 'Approved.' });
      },
    },
    decline[decline.length - 1],
  ];

  window.STORY = {
    initial,
    paths: { decline: [...shared, ...decline], accept: [...shared, ...accept] },
  };
})();
