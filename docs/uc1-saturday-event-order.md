# UC1: The Saturday event order

> Status: draft for discussion. Not yet prioritised or scoped for the prototype.

## 1. Story
- **Wednesday 22:47.** Chef Nigel (head chef, Harbour) closes the kitchen and sends FreshSupply a WhatsApp voice note: *"Private dinner Saturday, 120 covers. The usual event set, plus about 18 kilos of salmon for the main."*
- **The agent:**
  - recognises Nigel and Harbour
  - turns the voice note into order lines
  - checks them against Harbour's product list and contract prices
  - finds the order is **€640 over Harbour's monthly FreshSupply budget**.
- **The agent replies to Nigel on WhatsApp.** It reads the order back, explains that it has sent the order to Priya because it's over budget, and gives the earliest delivery: Friday 07:00–09:00, since it's past the 22:00 cut-off.
- **Thursday 07:30.** Priya sees a "Needs your decision" card in the FreshSupply portal. It shows the voice note, its transcript, the lines and the budget effect, with three buttons: **Approve / Adjust / Ask Nigel**. She approves.
- **Nigel gets a WhatsApp confirmation:** *"Approved by Priya ✅, arriving Fri 07–09."*

## 2. Actors and channels
| Actor | Channel |
|---|---|
| Nigel | WhatsApp voice note in, WhatsApp text out |
| FreshSupply agent | WhatsApp, the portal |
| Priya | FreshSupply portal on desktop (plus a notification by email or WhatsApp) |
| Ravi (in the background) | The rules he set in Sana admin |

## 3. What the agent does
- **Acts on its own:** transcribes the note, matches items to the product list, prices the order, checks the cut-off, and reads the order back.
- **Stops and asks:** when the order goes over budget, it sends the decision to Priya, the person allowed to make it. It **doesn't refuse Nigel**; it holds the order for Priya instead.
- **Explains:** tells both of them *why* it stopped and *which rule* applied.
- **Hands over:** not needed in UC1. Handing over to a person (Tom) comes in UC2, the salmon stock-out.

## 4. Research needed
| Question | Assumption today | How to find out |
|---|---|---|
| How do restaurant groups split ordering authority between chefs and the central buyer? | Chefs order within limits; the buyer approves exceptions | 6–8 interviews with central buyers and head chefs at multi-site groups |
| How do chefs order today: voice notes, WhatsApp, calls, an ordering app? | Late-night WhatsApp and voice notes are common | Analyse how FreshSupply's incoming orders arrive (share by channel, time of day); spend an evening shift in a kitchen |
| What does "over budget" mean to Priya: a hard stop or a warning? Per outlet or across the group? Are events budgeted separately? | Per-outlet budget; she wants to be asked | Interviews with buyers; look at how they budget today in spreadsheets or tools |
| Does Priya want to be *asked* or just *told*, and at what amount? | Asked when over budget, told otherwise | Prototype test using several thresholds |
| What happens if Priya doesn't respond before the cut-off? | Not known | Interviews; walk the scenario through with Priya and Tom |
| Does Nigel trust "sent to Priya", or does he just phone the supplier? | Only if he gets fast feedback | Prototype test with chefs; watch whether they keep trying to go around it |

## 5. Engineering issues
- **Whose budget is it?** FreshSupply only sees what The Olive Tree spends *with FreshSupply*. It can't see Priya's total budget across all her suppliers. So the agent can only enforce a **FreshSupply spending limit that Priya sets in the portal**, and the design must label it honestly ("your FreshSupply budget for Harbour"). Priya's own assistant is what could see the full picture.
- **Who is talking?** The WhatsApp number has to be linked to a person, a role and an outlet. Kitchens often share one phone, and a lost phone is a risk.
- **Turning a voice note into an order:**
  - Speech-to-text has to cope with kitchen noise, accents and slang.
  - "The usual event set" only means something if past orders or saved templates exist.
  - Units need care: kg or cases. Salmon is sold **by actual weight**, so the final price is only an estimate until it's weighed.
- **WhatsApp Business platform rules:**
  - Outside a 24-hour window, a business can only start a conversation with a pre-approved message template.
  - Messages can carry at most 3 reply buttons.
  - Voice notes need to be downloaded and transcribed before the agent can use them.
- **Live data from FreshSupply's order system:** prices, stock and delivery slots may only sync periodically, so a total may change between ordering and approval.
- **One order, several channels:** Priya approves on her desktop, and WhatsApp must update straight away. If Nigel changes the order while Priya is approving it, the system needs to manage versions of the order.
- **Data retention:** storing voice notes and transcripts for the audit trail raises privacy (GDPR) questions about what to keep and for how long.

## 6. What this means for the design
- **Always read the order back** as structured lines, and ask only about the items the agent isn't sure of.
- **Show who the agent thinks you are** ("Nigel · Harbour") so mistakes are easy to spot.
- **Label spending limits honestly:** "FreshSupply budget for Harbour", not "your budget".
- **Show estimated totals** for items sold by weight.
- **Priya's decision card** shows the original request (voice and transcript), the budget effect, the rule that applied and a deadline, all in one view, with at most 3 actions so it fits WhatsApp too.
- **A rule for when nobody answers:** if Priya hasn't decided by the cut-off, the agent tells Nigel and escalates (owner, or Maria). The exact behaviour depends on what research shows.
- **One order history** across channels, so every view shows the same status and who decided what.

## Open points
- FreshSupply can only enforce its own share of Priya's spend, not her whole budget. How much of the budget story should rest on FreshSupply vs. Priya's own assistant?
- Not yet decided which of the items above are an immediate priority and which can be dropped.
