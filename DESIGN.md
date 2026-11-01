# DESIGN.md

The design system for Kade's AI order agent, which runs on Sana. It describes how one order looks and reads in every channel: WhatsApp, Microsoft Teams, Kade's own screens in Sana, and any channel added later.

**For people:** read this before designing a screen or writing a message. **For AI tools:** follow this file when you generate a screen, a card or a message for this project. Use only the values, components and words defined here. When something you need is missing, say so instead of inventing it.

The code that implements this file lives in `shared/tokens.css` (colours and type) and `shared/components.css` (status, faces, the agent symbol). The deck and the prototype both use them.

## 1. Principles

1. **The order lives in one record.** Every channel shows the same order, with the same statuses and the same history. No channel keeps its own copy.
2. **The agent works within rules that people set, and people improve the rules.** Every decision names the rule and the version it followed.
3. **People only see what needs a decision.** Confirm quietly; interrupt only the person who has to act.
4. **Every decision goes to the person who owns it, and affects only the item it is about.** A decline never cancels the whole order.
5. **Red means one thing: the agent has stopped and is asking a person.** Never use red for decoration, errors in general, or emphasis.

The design starts from the principles of Microsoft's Fluent design system: calm, neutral surfaces, a clear hierarchy, status shown with text and a mark (never colour alone), and cards that work inside Teams. The colours and type below are this project's own.

## 2. Foundations

### Colour

| Token | Value | Use it for |
| --- | --- | --- |
| `--bg` | `#f5f3f1` | Page background (off-white). |
| `--surface` | `#ffffff` | Cards, messages, panels on top of the background. |
| `--ink` | `#150f33` | Text, icons, primary buttons (navy). |
| `--ink-2` | `#4b4862` | Secondary text, descriptions. |
| `--ink-3` | `#67637a` | Labels, times, captions. At least 4.7:1 contrast on every background used. |
| `--line` | `#e3e0da` | Dividers and borders. |
| `--red` | `#e2103c` | **Only** where the agent stops and asks a person: the status, the marker on that item, the stop in a journey. |
| `--red-soft` | `#fce4e9` | Background behind a stopped item or activity entry. |
| `--done` / `--done-soft` | `#2f7a49` / `#e3f1e6` | A confirmation that something is finished, such as "Version 2 is live". Use sparingly. |
| `--person-soft` | `#e9e8f0` | Notes from people, hover states, system faces. |

### Dark mode

Every screen and card works in dark mode too, because Teams, phones and laptops switch to it. The tokens keep their meaning; only the values change. Red still means only the agent's stop.

| Token | Dark value | Contrast on `--bg` |
| --- | --- | --- |
| `--bg` | `#121022` | |
| `--surface` | `#1c1932` | |
| `--ink` | `#f2f0f7` | 16.6 to 1 |
| `--ink-2` | `#c4c1d4` | 10.6 to 1 |
| `--ink-3` | `#9d99b2` | 6.8 to 1 |
| `--line` | `#2e2a47` | |
| `--red` | `#ff5c7a` | 6.3 to 1 |
| `--red-soft` | `#3a1622` | |
| `--done` / `--done-soft` | `#6cc58c` / `#17301f` | 8.9 to 1 |
| `--person-soft` | `#2a2742` | |

Follow the system setting (`prefers-color-scheme`), and let a person override it.

### Type

| Role | Font | Size and weight |
| --- | --- | --- |
| Headings | Inter Tight | 19 to 30px in screens, 44px on slides; weight 400 to 500. |
| Body and interface | Inter | 15px body, 14px small, 12px labels (600, uppercase, spaced); weight 400 to 600. |
| The "voice" (people's quotes, closing lines) | Instrument Serif, italic | Large only: 24px or more. Never for interface text. |

### Shape and icons

- Corner radius 14px for cards; 999px (fully round) for buttons and pills; 8 to 12px for small panels.
- Icons are 24×24 line icons, stroke 1.6, round caps and joins, drawn in the current text colour. Channel icons exist for voice, chat, Teams, screen, email and phone.

## 3. Components

### Status
A small round mark followed by plain text. A finished item shows a check mark instead of the dot.

| State in the record | Shown to the person who must act | Shown to everyone else | Style |
| --- | --- | --- | --- |
| Received | Received | Received | Faint (`--ink-3`), weight 500 |
| Confirmed | ✓ Confirmed | ✓ Confirmed | Navy, check mark |
| Stopped (needs approval) | Awaiting approval | Waiting on *name* | **Red** |
| Suggested (a choice is offered) | Your call | Waiting on *name* | Navy |
| Handed over to a person at the supplier | With *name* | With *name* | Navy |
| One-time price to approve | Awaiting approval | Waiting on *name* | Navy |

The label adapts to who is looking; the state underneath is the same everywhere.

### Faces and the agent symbol
- **People:** a round face, 28, 36 or 56px, white with a thin border.
- **The supplier's AI order agent:** a round navy symbol with a sparkle, warming into red at the top right. It is never drawn as a person and never given a human name.
- **A buyer's own assistant** (for example, Priya's purchasing assistant): an outlined sparkle in a thin navy ring, so it is never confused with the supplier's agent.

### Order item
One line per item: the item named in full with its quantity ("18 kg of salmon fillet"), its status, and one short sentence on why it has that status ("Takes Harbour Front €180 over its fish budget"). A stopped item gets a red marker on its left edge and the `--red-soft` background.

### Approval request
The order item, plus at most three actions. The person who owns the decision sees "Approve" and "Decline"; nobody else sees buttons. After a choice, every button in that message is disabled, as a record of what happened.

### Activity entry (Kade's screen in Sana)
One entry per thing that happened, in this order: the time; who did it (a face or the agent symbol); what happened, as a full sentence ("Stopped the salmon and asked Priya to approve it"); the evidence; the change ("Status: Received → Waiting on Priya"); the rule and its version; the channel it came from. Entries are never edited. A person can flag one for review.

### Hand-over case
What a person at the supplier receives when the agent has nothing left that it may offer: a title that says what to do ("Find 14 bottles of Sauvignon Blanc"), why, by when, the full conversation, and the options the agent has already prepared.

### Patterns

**When nobody answers in time.** Every decision has a deadline. If the person who owns it does not answer by then, the agent stops: it does not process the order any further, and it tells everyone involved that it has stopped, because the decision did not arrive in time. The message names the decision, the deadline that passed, and what each person can do now. The order stays open for a person to pick up.

**Undoing what the agent did.** People can undo an action of the agent, but only people who are authorised to, such as the buyer for spending or the supplier's service rep for a substitution. Undoing asks for a reason. The undo is a new entry in the order's activity; the original entry stays. Another person can review the reason, and the reasons are used to improve the rules, in the same way as a flag.

## 4. Accessibility

Meet WCAG 2.2 at level AA in every channel and in both light and dark mode.

- Text contrast at least 4.5 to 1 (3 to 1 for text of 18.5px bold or 24px and larger, and for icons and borders that carry meaning).
- Never show a state by colour alone. Every status has words and a mark; the agent's stop is red **and** says what it is waiting for.
- Everything works with a keyboard, with a visible focus outline.
- Buttons and other targets are at least 44 by 44px on touch screens.
- The agent symbol and faces have text alternatives, for example "Kade's AI order agent".
- Voice notes always have a transcript, and spoken read-backs have the same words in writing.
- Respect the setting for reduced motion: no animation that is needed to understand something.
- Plain, complete sentences (section 6) are part of accessibility, for readers who read in a second language.

## 5. Channels

| Channel | How the order appears | Limits to respect |
| --- | --- | --- |
| **WhatsApp** | Plain messages, one item per message when a decision is needed. Bold (`*text*`) for the item and the outcome. | At most three reply buttons per message; up to ten options as a list. Outside 24 hours after the customer's last message, only a pre-approved template may start a conversation. |
| **Microsoft Teams** | One order card in the supplier's thread, with every item and its status. Only the item that needs this person has buttons. | Keep a card to one order; at most three actions per item. |
| **Kade's screens in Sana** | The order's full activity, with every entry, rule and version, and filters. | None; this is the complete record. |
| **Voice** | The agent reads the order back in the same words it would write. | Ask about one item at a time. |
| **Email** | A needed channel. Its rules are deliberately not written yet: render it from the principles, foundations, components and words in this file, and the checklist in section 7. | Write it so it works in dark mode and in plain text. |
| **A new channel** | Follow section 7. | |

## 6. Words

- Write complete, plain sentences that someone seeing them for the first time can follow.
- Say who does what, to which item, and why. Name items in full: "24 bottles of Sauvignon Blanc", not "the wine".
- A message to a customer always says what happened, who will act, when, and whether the customer needs to do anything.
- The agent says it is an AI the first time it writes to someone.
- Use "inventory" for what a system records and "in stock" for availability.
- A colon may introduce a complete sentence or a question; the next word then starts with a capital letter.
- Use the status words in section 3 exactly as written.

### Every person's own language and formats

Language is never a barrier. A person can write or speak to the agent in any language, and the agent answers in that language. The order record itself holds values, not words in one language, so every channel can show it in each reader's language.

- Numbers, dates, times and money follow each reader's own conventions: Priya reads "€11,80" if she uses Dutch formats, and "€11.80" if she uses English ones.
- Item names keep the supplier's catalogue name, with a translation where the reader needs one.
- The status words in section 3 are translated once, consistently, for each language.

## 7. Adding a new channel: checklist

1. Show the order from the same record, with the same item names and status words.
2. Show only what the reader needs to act on; everything else is one line of information.
3. Give the person who owns a decision at most three actions; nobody else gets buttons.
4. Use red only for the item where the agent stopped.
5. Say who is writing: Kade's AI order agent, not a person.
6. End with what happens next and whether the reader needs to do anything.
7. Check every sentence against section 6, and the result against section 4 (accessibility), in light and dark mode.

## 8. Example data

The salmon order at 22:48 on Wednesday 28 October 2026, after the agent read Nigel's voice note:

```json
{
  "order": "KD-24817",
  "customer": "The Olive Tree, Harbour Front",
  "purpose": "Private dinner on Saturday 31 October, 120 guests",
  "orderedBy": "Nigel, head chef at Harbour Front",
  "buyer": "Priya, central buyer at The Olive Tree",
  "items": [
    { "name": "Cheese board, house selection", "quantity": "1 board", "state": "confirmed",
      "why": "The same as Harbour Front's last six orders", "rule": "Confirm what is in the contract, in stock and within budget, version 2" },
    { "name": "Salmon fillet", "quantity": "18 kg", "state": "stopped", "owner": "Priya",
      "why": "Takes Harbour Front €180 over its fish budget", "rule": "Category budget per outlet, version 3" },
    { "name": "Sauvignon Blanc", "quantity": "24 bottles", "state": "suggested", "owner": "Nigel",
      "why": "Not enough in stock, so 24 bottles of Pinot Grigio were offered at the same price", "rule": "Substitutes are suggested; the requester decides, version 1" }
  ]
}
```

## 9. Example request for an AI tool

> Using only DESIGN.md, write the email that Kade's AI order agent sends to Priya at 22:48 about order KD-24817. Follow the checklist in section 7.

## 10. Open decisions

These are not decided yet. Do not invent them; ask the owner.

- Email: the rules are left open on purpose, to test whether this file is enough to render it.
- Red text contrast in light mode: red status text (`#e2103c`) reaches 4.3 to 1 on `--bg` and 4.0 to 1 on `--red-soft`, below 4.5 to 1. A darker red for text, `#c40e35`, reaches 5.5 to 1 and 5.0 to 1. Changing `shared/tokens.css` needs the owner's approval.
- Dark mode is defined here but not yet built into the prototype.
- A spacing scale (spacing is currently set per screen).

## 11. Owner and changes

Owner: the design lead of this project. Change this file through a reviewed commit, and record the change below.

| Date | Change |
| --- | --- |
| 1 November 2026 | First version, written from the prototype's tokens, components and copy rules. |
| 1 November 2026 | Added dark mode, accessibility, every person's own language and formats, and the patterns for a missed deadline and for undoing. Email listed as a channel, with its rules left open on purpose. |
