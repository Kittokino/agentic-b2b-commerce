# Research questions and technical notes

This note goes with the story in [`01-story.md`](01-story.md): Nigel's voice note on Wednesday night, the cheese board the agent confirms, the salmon it stops for Priya, and the Sauvignon Blanc it hands to Tom. It lists what still needs research and the technical issues a real build would have to solve. It is input for the deck's research slide and its technical assumptions appendix.

## Research needed

| Question | What we assume today | How to find out |
|---|---|---|
| How do restaurant groups split ordering authority between head chefs and the central buyer? | Chefs order within budgets per category and outlet, and the buyer approves anything over budget. | Six to eight interviews with central buyers and head chefs at groups with several restaurants. |
| How do chefs place orders today: voice notes, WhatsApp messages, phone calls or an ordering app? | Late-night WhatsApp messages and voice notes are common. | Look at how a wholesaler's orders arrive (by channel and time of day), and spend an evening shift in a kitchen. |
| What kind of budget rule does a buyer want: per order, per outlet each week, or a separate budget for events? | A budget per category for each outlet is a good start. | Interviews with buyers, and a look at how they control spending today. |
| Does the buyer want to be asked or only told, and above what amount? | Asked when an item goes over budget, told otherwise. | A prototype test with several thresholds. |
| What should happen if the buyer does not answer in time? | Not known. | Interviews, and walking the scenario through with a buyer and a service rep. |
| Does a chef trust "I have asked Priya", or does he phone the supplier anyway? | Only if he gets quick feedback. | A prototype test with chefs, watching whether they try to go around the agent. |
| When a substitute is suggested, how often do chefs accept it, and what makes them say no? | They decline when a dish depends on the exact product, as Nigel does with the wine pairing. | Order history and interviews with chefs. |
| Do buyers use their own AI assistants, and what would they let one do? | Some use one to read and summarise, not to order or negotiate. | Interviews with buyers. |

## Technical issues

- **Whose budget it is.** Kade only sees what The Olive Tree spends with Kade, not its whole budget. So the budget is one that Priya sets at Kade, and the design says so.
- **Who is talking.** A WhatsApp number has to be linked to a person, a role and a restaurant. Kitchens often share one phone, and a lost phone is a risk.
- **Turning a voice note into an order.**
  - Speech-to-text has to cope with kitchen noise, accents and slang.
  - "The usual cheese board" only means something if past orders or saved templates exist.
  - Units need care: kilos or cases. Salmon is sold by actual weight, so its price is an estimate until it is weighed.
- **WhatsApp Business rules.**
  - Outside a 24-hour window, a business can only start a conversation with a pre-approved message template. This matters for the message Kade sends Nigel on Thursday morning.
  - A message can carry at most three reply buttons, which is why Nigel gets exactly three choices.
  - Voice notes have to be downloaded and transcribed before the agent can use them.
- **Live data from Kade's ERP.** Prices and stock may only update every so often, so a total can change between ordering and approval.
- **One order, several channels.** When Priya changes the order in Teams, Nigel's WhatsApp and Tom's case must update at once. If two people change the same item at the same time, the system needs versions of the order.
- **A change after work has started.** If Priya's change had arrived after Tom started, the agent should tell Tom instead of changing his work quietly.
- **Keeping data.** Storing voice notes and transcripts for the order's activity raises GDPR questions about what to keep and for how long.
- **Telling people they are talking to an AI.** Nigel and Priya are told the order agent is an AI. The EU AI Act has transparency rules for this.

## What this means for the design

- Read the order back item by item, and ask only about what the agent may not decide.
- Show who the agent thinks is writing ("Nigel, head chef at Harbour Front"), so a mistake is easy to spot.
- Name budgets honestly: "Harbour Front's fish budget, set by Priya at Kade", not "your budget".
- Show estimated totals for products sold by weight.
- Give each decision the original request, the amount, the rule that applied and a deadline, with at most three actions, so it also fits WhatsApp.
- Agree what happens when nobody answers in time; research decides the exact behaviour.
- Keep one record of the order across all channels, so every screen shows the same status and who decided what.
