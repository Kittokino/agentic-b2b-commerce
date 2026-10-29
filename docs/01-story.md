# The Olive Tree × Kade: story

> Concept for a Team Lead Research & Design case. Set in **Rotterdam**. All companies, people and figures are fictional.

## In one line
Nigel orders three things in one voice note. **Cheese just happens, the salmon goes to Priya (money), the wine goes back to Nigel (taste)**. When he declines the alternative, Priya finds 10 bottles at another outlet, and the agent hands the remaining 14 to Tom.

## Places
| Place | What it is |
|---|---|
| **The Olive Tree** | A restaurant chain in Rotterdam: a head office (Priya) and 3 outlets: **Harbour** (Nigel's kitchen), **Old Town** (spares 10 bottles of wine), Riverside |
| **Kade Foodservice** ("Kade" = quay in Dutch) | A food & beverage wholesaler running on Sana: the agent, Tom's service desk, Maheep's admin |
| **Sana** | The platform under Kade; it serves many wholesalers in many industries |

## Cast (5)
| Actor | Side | Channel in this story |
|---|---|---|
| **Priya**, central buyer | The Olive Tree | **Teams** (approvals, updates) + Kade **webshop** (full order) |
| **Chef Nigel**, head chef, Harbour | The Olive Tree | **WhatsApp** (voice note, replies) |
| **Kade agent** | Kade | Reads WhatsApp, posts to Teams |
| **Tom**, service rep | Kade | Service desk on his desktop |
| **Maheep**, commerce admin | Kade | Sana admin (sets the rules) |

**Priya's assistant (a tool, not a cast member):** The Olive Tree's own AI assistant, not Sana's. It summarises supplier updates for Priya and finds things for her (e.g. stock across outlets). It reads Kade's order data through an API / MCP server that Sana offers. It does **not** order or negotiate. Shown as an outlined sparkle, unlike Kade's agent, which is a filled navy-to-red circle.

## Rules (set at Kade, limits from Priya)
0. **The contract comes first:** the agent only works with the products and prices agreed in each buyer's contract. It never steps outside it.
1. **Category budgets per outlet:** a line that takes Harbour over its budget for that category (e.g. fish) needs **Priya's** approval.
2. **Substitutions:** the agent may *suggest* an in-stock alternative within budget; the **requester (Nigel)** accepts or declines.
3. **Hand-over:** when the agent has nothing left it's allowed to offer (e.g. sourcing from a partner supplier), it hands over to **Tom** with full context.

## The journey (one order, three lines)
1. **Wed 22:47 · WhatsApp.** Nigel sends a voice note: *"Private dinner Saturday, 120 covers. 18 kilos of salmon, the usual cheese board, and 24 bottles of Sauvignon Blanc."*
2. **The agent reads it back to Nigel**, line by line:
   - **Cheese:** within budget → **confirmed.**
   - **Salmon:** takes Harbour's fish budget over → **sent to Priya.** The agent doesn't change it.
   - **Sauvignon Blanc:** low stock → **suggests Pinot Grigio** (in stock, within budget) → *Accept / Decline.*
3. **Priya gets one card in Teams** showing all three lines and their status. The salmon *needs her*; the others are for information. She can open the full order in the **webshop**.
4. **Nigel declines the Pinot Grigio** (he needs a Sauvignon Blanc for the pairing). The agent has nothing else it's allowed to offer → **hands over to Tom.**
5. **Priya's Teams card updates quietly:** *"Wine: with Tom at Kade from 08:00."*
6. **Thu 07:45 · Priya acts before Kade's service desk opens.** Her own assistant checks stock across her outlets and finds **10 bottles** at Old Town. Priya calls Old Town to check they can spare them: asking a colleague to give up stock is a conversation between people. In her Teams card she adjusts the wine line: *"10 from Old Town. Source 14."* The agent updates the order, tells Nigel, and Tom's case now says **14, not 24**. Because she acts before Tom starts, nothing is over-ordered and nothing needs refunding.
7. **08:05 · Tom**, on his desktop, sees the whole case, including Priya's adjustment, finds **14 bottles** of Sauvignon Blanc at a partner supplier and sends a **one-off quote** (not a contract change).
8. **08:30 · Nigel confirms** the wine; if it takes the wine budget over, **Priya approves** it. **Priya approves the salmon.**
9. **Confirmation:** one order, shown in WhatsApp (Nigel), Teams (Priya) and the webshop.

**Why the twist matters:** a person changes the plan mid-flight, and the agent keeps everyone in step: the quiet update was useful, Priya stays in control, and the agent coordinates instead of competing with her.

**Edge case to design for:** if Tom has already started sourcing when Priya adjusts, the agent flags the clash to both of them instead of silently changing his case.

**Two branches in the prototype:** Nigel accepts the Pinot Grigio (done, no hand-over) or declines (→ Tom).

## Three notification levels (for Priya)
- **Needs you:** interrupts (salmon).
- **For your information:** updates quietly (wine is with Tom).
- **Done:** simply ticked off (cheese).

## Small additions to consider
- **Agent unsure what it heard:** *"18 kg, not 80?"*, shows how mistakes are handled.
- **Behind the scenes:** Maheep's rules view, and the same rules set up for a medical supplier.

## Where this is heading (vision slide, not the prototype)
- **Today:** Kade's agent takes orders, stops and hands over; people decide the exceptions.
- **Next:** buyers' assistants (like Priya's) summarise and find, reading suppliers' data.
- **Later:** buyers' agents order within mandates; people set the mandates and handle disputes and relationships. Risk for merchants: competing on price alone. Sana's role: help merchants win in agent-mediated buying.

## Parked
Delivery delay · damaged crate · waste insight · month-end summary · drifting account.
