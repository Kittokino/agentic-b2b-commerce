# The Olive Tree × Kade: story

> Concept for a Team Lead Research & Design case. Set in **Rotterdam**. All companies, people and figures are fictional.

## In one line
On Wednesday night, Nigel orders three things in one voice note. Kade's AI order agent confirms the cheese board on its own, asks Priya to approve the salmon because it goes over the fish budget, and asks Nigel about the wine because Kade does not have enough Sauvignon Blanc in stock. When Nigel declines the alternative, Priya finds 10 bottles at Old Town, and Tom finds the other 14 at a partner supplier.

## Dates and numbers
- The order is placed on **Wednesday 28 October 2026** at 22:47 and confirmed on **Thursday 29 October** at 08:31. Kade delivers to Harbour Front on **Friday 30 October** between 07:00 and 09:00. The private dinner is on **Saturday 31 October**, for 120 guests; a usual Saturday at Harbour Front has about 70.
- The order is **KD-24817**. Tom's case is **CS-3391**.

## Places
| Place | What it is |
|---|---|
| **The Olive Tree** | A restaurant chain in Rotterdam: a head office (Priya) and 3 outlets: **Harbour Front** (Nigel's kitchen), **Old Town** (sends 10 bottles of Sauvignon Blanc), Riverside |
| **Kade Foodservice** ("Kade" = quay in Dutch) | A food & beverage wholesaler running on Sana: the AI order agent, Tom's customer service team, Maheep's admin |
| **Sana** | The platform under Kade; it serves many wholesalers in many industries |
| **Northgate Wines, Riverside Cellars** | Two of Kade's partner suppliers. Northgate has 14 bottles of Sauvignon Blanc at €11.80 a bottle; Riverside Cellars has only 8, at €10.90. |

## Cast (5)
| Actor | Side | Channel in this story |
|---|---|---|
| **Priya**, central buyer | The Olive Tree | **Teams** (approvals, updates) + Kade **webshop** (full order) |
| **Chef Nigel**, head chef, Harbour Front | The Olive Tree | **WhatsApp** (voice note, replies) |
| **The AI order agent** | Kade | Reads WhatsApp, posts to Teams |
| **Tom**, from Kade's customer service team | Kade | His case on his desktop |
| **Maheep**, commerce admin | Kade | Sana admin (sets the rules) |

**The purchasing assistant (a tool, not a cast member):** The Olive Tree's own AI assistant, Priya's, not Kade's or Sana's. It summarises supplier updates for Priya and finds things for her, for example inventory across her outlets. It reads Kade's order data through an API / MCP server that Sana offers. It does **not** order, negotiate or change Kade's order: it tells Priya what to tell Kade. Shown as an outlined sparkle, unlike Kade's agent.

## Rules (set at Kade by Maheep; budgets and limits from Priya)
Every rule is versioned. Each decision in the order's activity records the rule and the version it was made under.

1. **The contract comes first.** The agent only works with the products and prices agreed in each buyer's contract.
2. **"The usual" comes from order history.** The agent reads "the usual" from the outlet's past orders, but only when its recent orders of that item agree. If they differ, it asks which one is meant. Harbour Front has ordered the same cheese board six times since July.
3. **Confirm what is in the contract, in stock and within budget.** The agent may confirm such an item on its own.
4. **Category budget per outlet.** An item that takes an outlet over its budget for that category (for example, fish) needs **Priya's** approval.
5. **Substitutes are suggested, and the person who ordered decides.** The agent never swaps an item on its own.
6. **Hand over when no allowed option is left.** The agent passes the request to the customer's service rep (**Tom**) with the full conversation, and tells the customer who has it and when they will hear back.
7. **One-time prices go to the buyer.** A price outside the contract is approved by **Priya**, not by Nigel. The contract does not change.
8. **Changes from the buyer apply before work starts.** If a person at Kade has already started, the agent tells them instead of changing their work quietly.
9. **Confirm only when every item is decided.** Then the order goes to Kade's ERP.

Every decision on an item affects only that item. A decline never cancels the whole order.

## The journey (one order, three items)
1. **Wed 22:47, WhatsApp.** Nigel sends a voice note: *"Private dinner Saturday, 120 covers. Eighteen kilos of salmon, the usual cheese board, and 24 bottles of Sauvignon Blanc."* The agent transcribes it and works out "the usual cheese board" from Harbour Front's order history.
2. **22:48. The agent reads the order back to Nigel**, item by item:
   - The **cheese board** is in the contract, in stock and within budget, so the agent confirms it.
   - The **18 kg of salmon** takes Harbour Front €180 over its fish budget, so the agent asks Priya to approve it in Teams. It does not change the salmon, and Nigel does not need to do anything.
   - Kade does not have **24 bottles of Sauvignon Blanc** in stock, so the agent offers 24 bottles of Pinot Grigio at the same price, with three buttons: *Accept Pinot Grigio*, *Decline*, *More options*.
3. **Priya gets one order card in Teams** that shows all three items and their status. Only the salmon needs her; the other two are there for her information.
4. **22:51. Nigel declines the Pinot Grigio**, because the Sauvignon Blanc is paired with a dish on the menu. (If he asks for more options, the result is the same: his contract has no other Sauvignon Blanc.) The agent has nothing else it is allowed to offer, so it creates case CS-3391 for Tom and tells Nigel that Tom will look for the wine when he starts work at 08:00.
5. **During the night**, the agent updates Priya's order card in Teams without sending her an alert.
6. **Thu 07:40 to 07:46, Teams.** Priya's purchasing assistant has read Kade's update and finds **10 bottles** at Old Town. Priya calls Old Town to check they can spare them, because asking a colleague to give up stock is a conversation between people. The assistant does not change Kade's order; it reminds Priya to tell Kade. At 07:45 Priya writes in Kade's order thread that Old Town is sending 10 bottles. The agent changes the order and Tom's case to **14 bottles** and tells Nigel. Because Tom has not started yet, nothing is ordered twice. At 07:46 Priya approves the salmon in the same thread.
7. **08:05, Tom's case.** Tom opens a case that already says 14 bottles. The agent has checked Kade's partner suppliers and found two: **Northgate Wines** (14 bottles, €11.80 a bottle) and **Riverside Cellars** (only 8 bottles). Tom chooses Northgate Wines.
8. **08:05, Teams.** The price is outside The Olive Tree's contract, so it goes to **Priya**, the buyer: 14 bottles at €11.80, €165.20 in total, as a one-time price. Nigel has nothing to decide.
9. **08:30.** Priya approves the one-time price. **08:31:** every item has an answer, so the agent confirms the order, sends it to Kade's ERP, and tells Nigel in WhatsApp and Priya in Teams that it will be delivered on Friday between 07:00 and 09:00.

**Why the twist matters:** a person changes the plan while the order is open, and the agent keeps everyone in step. The quiet update was useful, Priya stays in control, and the agent works with her instead of competing with her.

**Edge case to design for:** if Tom had already started looking when Priya changed the order, the agent would tell both of them instead of changing his case quietly (rule 8).

**Branches in the prototype:**
- **Main story:** Nigel declines (#scene-1 to #scene-18).
- **#what-if-more-options-n:** Nigel asks for more options; the agent hands over to Tom in the same way.
- **#what-if-accepted-n:** Nigel accepts the Pinot Grigio. The wine is confirmed, nobody at Kade needs to step in, and the order is confirmed when Priya approves the salmon in the morning.

## After the order (#after-the-order-1 to 4)
1. **Thursday 09:10.** Looking back at the case, Tom thinks the Pinot Grigio was a poor match for a fish course. He flags that entry in the order's activity for review, with a note asking whether the agent could offer up to three alternatives. The entry itself does not change; the flag is a note attached to it.
2. **Friday 30 October, 09:00.** Maheep, Kade's commerce admin, reviews the flag and drafts **version 2 of the substitution rule**:
   - The agent looks in all of Kade's inventory, not only the contract range. An item outside the contract still needs the buyer to approve its price.
   - A match means the same grape first, otherwise a similar style, and a wine that suits the dish's main ingredient.
   - It offers up to three alternatives, ranked by closest match, then lower price, then more in stock.
   - The person who ordered still decides.
   - In WhatsApp, the alternatives come as a **list**, because a message holds at most three reply buttons, and three alternatives plus "None of these" need four. In Teams, they come as a card with a button for each.
3. **09:20.** Maheep tests the change against October's orders (of 31 wine substitutions, 14 were accepted under version 1; an estimated 22 would have been under version 2) and publishes it. From then on the agent uses version 2, and every earlier decision keeps the version it was made under.

## Three notification levels (for Priya)
- **Needs you:** interrupts (salmon).
- **For your information:** updates quietly (for example, when the Sauvignon Blanc passes to Tom).
- **Done:** simply ticked off (cheese).

## Small additions to consider
- **Agent unsure what it heard:** *"18 kg, not 80?"*, shows how mistakes are handled.
- **Behind the scenes:** Maheep's rules view is now in the prototype (after the order). The same rules set up for a medical supplier is still to do, on the deck's configurability slide.

## Where this is heading (vision slide, not the prototype)
- **Today:** Kade's agent takes orders, stops and hands over; people decide the exceptions.
- **Next:** buyers' assistants (like Priya's) summarise and find, reading suppliers' data.
- **Later:** buyers' agents order within mandates; people set the mandates and handle disputes and relationships. Risk for merchants: competing on price alone. Sana's role: help merchants win in agent-mediated buying.

## Parked
Delivery delay · damaged crate · waste insight · month-end summary · drifting account.
