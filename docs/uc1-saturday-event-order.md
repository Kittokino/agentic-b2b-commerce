# UC1: The Saturday event order

> Status: draft for discussion. Continues as UC2 (salmon stock-out) on the same order.

## 1. Story
- **Wednesday 22:47.** Chef Nigel (head chef, Harbour Front) closes the kitchen and sends Kade a WhatsApp voice note: *"Private dinner Saturday, 120 covers. The usual event set, plus about 18 kilos of salmon for the main."*
- **The agent:**
  - recognises Nigel and Harbour Front
  - turns the voice note into order lines
  - checks them against Harbour Front's product list and contract prices
  - finds the order (~€2,200) is **over the €1,500 limit Priya set for Harbour Front orders**.
- **The agent replies to Nigel on WhatsApp.** It reads the order back and explains that it has sent the order to Priya for approval.
- **Thursday 07:30.** Priya sees a "Needs your decision" card in the Kade portal: the voice note, its transcript, the lines, and the rule that applied, with three buttons: **Approve / Adjust / Ask Nigel**. She approves.
- **Nigel gets a WhatsApp confirmation:** *"Approved by Priya ✅"*

## 2. Actors and channels
| Actor | Channel |
|---|---|
| Nigel | WhatsApp voice note in, WhatsApp text out |
| Kade agent | WhatsApp, the portal |
| Priya | Kade portal on desktop (plus a notification by email or WhatsApp) |
| Maheep (in the background) | The rules he set in Sana admin |

## 3. What the agent does
- **Acts on its own:** transcribes the note, matches items to the product list, prices the order, and reads it back.
- **Stops and asks:** the order is over the limit, so it sends the decision to Priya, the person allowed to make it. It **doesn't refuse Nigel**; it holds the order for Priya instead.
- **Explains:** tells both of them *why* it stopped and *which rule* applied.
- **Hands over:** not in UC1. Handing over to Tom comes in UC2.

## 4. Research needed
| Question | Assumption today | How to find out |
|---|---|---|
| How do restaurant groups split ordering authority between chefs and the central buyer? | Chefs order within limits; the buyer approves exceptions | 6–8 interviews with central buyers and head chefs at multi-site groups |
| How do chefs order today: voice notes, WhatsApp, calls, an ordering app? | Late-night WhatsApp and voice notes are common | Analyse how Kade's incoming orders arrive (share by channel, time of day); spend an evening shift in a kitchen |
| What kind of limit does Priya want: per order, per outlet per week, separate for events? | A per-order limit per outlet is enough to start | Interviews with buyers; look at how they control spend today |
| Does Priya want to be *asked* or just *told*, and at what amount? | Asked over the limit, told otherwise | Prototype test using several thresholds |
| What happens if Priya doesn't respond in time? | Not known | Interviews; walk the scenario through with Priya and Tom |
| Does Nigel trust "sent to Priya", or does he just phone the supplier? | Only if he gets fast feedback | Prototype test with chefs; watch whether they keep trying to go around it |

## 5. Engineering issues
- **Whose limit is it?** Kade only sees what The Olive Tree spends *with Kade*, not Priya's whole budget. The limit is therefore one **Priya sets at Kade**, and the design labels it that way.
- **Who is talking?** The WhatsApp number has to be linked to a person, a role and an outlet. Kitchens often share one phone, and a lost phone is a risk.
- **Turning a voice note into an order:**
  - Speech-to-text has to cope with kitchen noise, accents and slang.
  - "The usual event set" only means something if past orders or saved templates exist.
  - Units need care: kg or cases. Salmon is sold **by actual weight**, so the final price is an estimate until it's weighed.
- **WhatsApp Business platform rules:**
  - Outside a 24-hour window, a business can only start a conversation with a pre-approved message template.
  - Messages can carry at most 3 reply buttons.
  - Voice notes need to be downloaded and transcribed before the agent can use them.
- **Live data from Kade's order system:** prices and stock may only sync periodically, so a total may change between ordering and approval.
- **One order, several channels:** Priya approves on her desktop, and WhatsApp must update straight away. If Nigel changes the order while Priya is approving it, the system needs to manage versions of the order.
- **Data retention:** storing voice notes and transcripts for the audit trail raises privacy (GDPR) questions about what to keep and for how long.

## 6. What this means for the design
- **Always read the order back** as structured lines, and ask only about the items the agent isn't sure of.
- **Show who the agent thinks you are** ("Nigel · Harbour Front") so mistakes are easy to spot.
- **Label the limit honestly:** "Priya's limit for Harbour Front orders", not "your budget".
- **Show estimated totals** for items sold by weight.
- **Priya's decision card** shows the original request (voice and transcript), the amount, the rule that applied and a deadline, all in one view, with at most 3 actions so it fits WhatsApp too.
- **A rule for when nobody answers:** if Priya hasn't decided in time, the agent tells Nigel and escalates. The exact behaviour depends on what research shows.
- **One order history** across channels, so every view shows the same status and who decided what.
