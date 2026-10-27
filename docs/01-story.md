# The Olive Tree × FreshSupply: story & storyboard

> Concept for a Team Lead Research & Design case. Working draft of the story, written before anything is built.

## Cast

| Who | Side | Role in the story | Main channels |
|---|---|---|---|
| **Priya** | Buyer: The Olive Tree | Buys all ingredients and drinks for 3 outlets. Goals: never run out, keep waste down, stay within budget. | Desktop dashboard, WhatsApp, email, calls / Teams |
| **Chef Arjun** | Buyer: Outlet 2 (Harbour) | Where demand comes from: bookings, events, menu changes. Never at a desk. | Voice notes, WhatsApp |
| **Lina** | Buyer: Outlet 3 (Old Town) | Outlet manager; receives deliveries. | Phone, WhatsApp, photos |
| **Owner** | Buyer | Sets Priya's monthly budget; approves overspends. | Email summary |
| **FreshSupply agent** | Seller: FreshSupply on Sana | Takes orders, drafts them, explains, stops when it should. Acts for FreshSupply within rules the admin sets. | Every channel |
| **Tom** | Seller: customer service rep | Takes over when the agent stops; resolves exceptions with full context. | Sana service desk |
| **Maria** | Seller: account manager | Owns the relationship and contract with The Olive Tree. | Phone, in person |
| **Ravi** | Seller: platform admin | Sets agent limits, substitution rules and cut-off times. | Sana admin |
| **Driver / logistics** | Seller's partner | Delivery-time updates. | Driver app → shown in WhatsApp / webshop |
| **Priya's assistant** | Buyer: local AI | Summarises her threads, checks the budget, drafts replies. It reads FreshSupply's structured data; it does not order on its own. | On her desktop |

## Rules in play (set by Ravi, with limits from Priya)

- Auto-confirm orders within the customer's contract price list and **≤ €1,500** per order.
- **Never** substitute an item with a different allergen profile without explicit consent from the buyer.
- Price change > **5%** vs. contract → ask the buyer.
- Next-day delivery cut-off: **22:00**.
- Priya's limit (set up when The Olive Tree was onboarded): monthly budget **€42,000**; anything that takes the forecast above budget needs her approval.

---

## The week (context told around the prototype)

| Day | Moment | What the agent does | Who decides |
|---|---|---|---|
| Mon | Routine restock for 3 outlets | Drafts 3 orders from stock levels, bookings and minimum stock levels | Priya, one-tap approval |
| **Wed** | **Event spike** (voice note) | Scales up the order, flags the budget effect | **Priya** |
| **Thu** | **Salmon stock-out** | Stops; explains the trout option and the allergen difference | **Priya + Tom** |
| **Fri** | **Delivery delay** | Warns about the impact on service, offers options | **Priya / Lina** |
| Sat | Damaged crate | Photo → credit note within policy | Automatic, or Tom above the limit |
| Sun | Waste insight | Suggests a lower dairy minimum at Outlet 1 | Priya |
| Month-end | Spend & waste summary | Writes it | Owner reads it |
| Ongoing | Spend drifting to a competitor | Surfaces the signal only | Maria calls |

**The prototype covers Wed → Thu → Fri as one continuous thread**, plus Ravi's admin view behind it.

---

## Storyboard: the prototype thread

### Scene 1: Wednesday 22:47 · voice note (no screen)
Arjun is closing up at Harbour. He sends a WhatsApp voice note to FreshSupply:

> "Hey, it's Arjun from Olive Tree Harbour. We've got a private dinner Saturday, 120 covers. Add the usual for that, plus salmon for the main — about 18 kilos. Thanks."

**FreshSupply agent (WhatsApp, text + short voice reply):**
> Got it, Arjun. For Saturday's 120-cover dinner at **Harbour** I've added your usual event set plus **18 kg salmon fillet**.
> This takes The Olive Tree **€640 over this month's budget**, so I've sent it to **Priya** to approve. You'll hear back here.
> ⏱ It's past today's 22:00 cut-off, so the earliest delivery is **Friday 07:00–09:00**.

*Why it matters:* it works with no screen, it knows who Arjun is and which outlet, and it **does not go over the budget on Arjun's say-so**.

### Scene 2: Thursday 07:30 · Priya's desktop
Priya opens her FreshSupply portal (the Sana webshop). A card at the top:

> **Needs your decision** · Harbour event order · €2,180 · **+€640 over budget**
> Requested by Arjun (voice note, Wed 22:47) · [Listen] [Transcript]
> [Approve] [Adjust quantities] [Ask Arjun]

Her **local assistant** adds a line in its sidebar: *"Harbour's covers this month are 18% above forecast; the overspend is offset if Old Town's Monday dairy order is cut back as suggested."*
Priya approves.

### Scene 3: Thursday 07:34 · the agent stops
Right after approval, FreshSupply's stock sync comes in: **salmon is short by 10 kg** (a catch shortfall).

**The agent does not substitute on its own.** In the portal, and mirrored to WhatsApp:

> ⚠️ **I can only supply 8 of 18 kg salmon** for Friday.
> Option A: **Sea trout**, 10 kg, +€4.20/kg (+€42). ⚠️ **Different allergen/species declaration**: please check the menu and allergen card.
> Option B: Salmon split delivery: 8 kg Fri, 10 kg **Sat 06:00** (tight for a dinner prep).
> Option C: Talk to someone at FreshSupply.
> *Why I'm asking:* allergen-relevant swap, and the price is above your contract.

Priya chooses **C**: she wants to know if a better salmon source exists.

### Scene 4: Thursday 07:40 · handing over to a person
**Tom** at FreshSupply gets the case in the Sana service desk, with everything already filled in:
- Original voice note + transcript, the approved order, the budget context
- The agent's options and why it stopped (rule: *allergen substitution needs consent*)
- The customer's history: salmon ordered weekly, high value, Maria is the account manager

Tom finds 10 kg of Norwegian salmon at the partner depot, +€1.10/kg (within the 5% limit). He confirms in one action; the **agent writes the reply** in Priya's channel, signed by Tom.

> ✅ Tom from FreshSupply sorted it: **18 kg salmon** for Friday (10 kg from our partner depot, +€11 total). No substitution needed.

### Scene 5: Thursday 07:45 · one confirmation, shown in 3 channels
The *same* order object, shown three ways from the same design system:
- **WhatsApp** (Arjun): short text, "Saturday dinner order is confirmed ✅, arrives Fri 07–09".
- **Email** (Priya + accounts): full summary of lines, cost against budget, delivery window, PDF.
- **Webshop order page**: status timeline, an undo / change window until Thu 20:00, an audit trail of who decided what (agent → Priya → Tom).

### Scene 6: Friday 06:20 · delay & impact
The driver's app reports a 2-hour delay (a van fault). The agent doesn't just forward the new time; it **works out what the delay means for service**:

> 🚚 Friday's delivery to **Old Town** is now **09:00–11:00** (van issue).
> Impact: **basil** at Old Town runs out before lunch prep at the current stock level.
> Options: (1) Transfer 1 kg basil from Harbour (they're overstocked), (2) Express courier €25, (3) Accept.
> [Choose] · I've also told Lina.

Priya picks (1) from her phone. Lina gets a WhatsApp message saying that the transfer has been set up.

### Scene 7: behind the curtain · Ravi's admin view
Ravi at FreshSupply sees the rules that drove this thread:
- *Allergen substitution → always ask* (fired Thu 07:34)
- *Price change > 5% → ask* (not fired: Tom's option was +3.4%)
- *Over-budget → customer approver* (Priya's limit, fired Wed 22:47)
- *Delivery delay with impact → proactive alert* (fired Fri 06:20)

Each rule shows how often it fired, how often the agent's suggestion was accepted, and how often a person had to step in. Ravi uses this to tune the rules. **The same settings serve any wholesaler on Sana.**

---

## What this shows against the brief

| Brief asks for | Where it shows |
|---|---|
| A journey that crosses channels | Voice → WhatsApp → webshop → service desk → email → driver app |
| Agent stops, asks, explains, hands over | Scenes 1, 3, 4, 6 |
| The user stays in control | Approve / adjust / ask, undo window, audit trail |
| No-screen moments | Arjun's voice note; driver update |
| Where agents should *not* be used | Allergen swaps, overspend, relationship (Maria) |
| Platform / many merchants | Ravi's rules (scene 7) |
| Design system across channels | Scene 5: the same order shown 3 ways |
| Commercial value | Fewer stock-outs and rescued orders for FreshSupply; less waste and spend kept within budget for The Olive Tree; human time spent on exceptions only |

## Open questions / assumptions to test
- Do chefs actually send orders by voice note, or does Priya consolidate everything? *(Assumption: both happen.)*
- Who at a restaurant group may commit spend: chefs, managers, or only the buyer? *(Assumption: only Priya, above a limit.)*
- How much do buyers trust agent-proposed substitutions in food? *(Assumption: low for allergen/species swaps, high for brand-equivalent swaps.)*
- Will buyers bring their own AI assistants, and what data do they need from suppliers? *(Assumption: a growing minority; structured order and stock data is enough.)*
