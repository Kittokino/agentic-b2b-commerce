# Working on this repository

## Writing copy

All copy (prototype screens, messages, activity entries, deck slides and notes) is written in complete, plain sentences that someone seeing it for the first time can follow without context.

- Say who does what, to which item, and why. Name things in full: "24 bottles of Sauvignon Blanc", not "the wine".
- No telegraphic "Label: fragment" phrasing ("Wine: handed over to Tom"), no colon-compressed clauses, and no clever shorthand ("Overnight, nothing moved").
- A colon may introduce a complete sentence or a direct question, after a complete clause (not after "which is"). The first word after the colon then starts with a capital letter, and a question ends with a question mark: "I chose one challenge to solve: How do restaurants order their supplies from a wholesaler?", "Note: These are assumptions."
- Explain times and roles where they matter: "when Tom starts work at 08:00", "Tom from our customer service team".
- Messages a customer receives (WhatsApp, Teams) must be unambiguous: what happened, who will act, when, and whether the customer needs to do anything.
- "Inventory" for what a system records; "in stock" for what people say about availability.

## Working with the author

Argue for a suggestion before making it. Changes go to `main`; bump the `?v=` version on any CSS or JS file you change.

## The brief, as clarified by the hiring manager

Charles Barton (VP of Product, Sana) replied to the author's questions: do not use Sana's existing platform, or any other existing commerce platform, as a reference. Derive the work from research and a product vision, as if building a new solution from the ground up. The author may use their own design system.

Decisions the author made in response:

- Keep the name Sana in the prototype and deck ("Kade runs on Sana"). Sana is the company the author is applying to, and the work must not suggest a name for its future platform.
- Keep the current visual language (off-white, navy, red only for the agent's stop).

Open points the author will decide later. They matter for the application, so raise them again when the deck is next worked on:

1. Present the research into how orders are handled today (shared inboxes, order desks, AI order capture) as evidence about the problem, not as products the design copies.
2. Make the vision central: the "Where this is heading" slide (Today, Next, Later), plus one slide of principles derived from the research (for example: the order lives in one record; the agent works within rules people set; people only see the exceptions; every decision goes to the person who owns it).

Vision idea to carry into the "Next" or "Later" stage: the agent suggests changes the customer did not ask for, for example "Your usual cheese board serves about 70; this dinner is for 120. Would you like two?". The author decided against this in the prototype, because from the supplier's agent it can feel pushy, like upselling. In the vision, it shows how trust lets such suggestions work: the more an agent has earned trust, the more it is allowed to suggest.

Research note: the author's G2 research read reviews of Sana's products. They are rated well, and people describe the interface as simple and easy to work with.

## Where the prototype stands (31 October 2026)

- Main story: 18 scenes (#scene-1 to #scene-18). Side branches: #what-if-accepted-n and #what-if-more-options-n. Follow-on: #after-the-order-1 to 4 (Tom flags a suggestion; Maheep publishes version 2 of the substitution rule).
- Decided not to build: the full Sana navigation (Orders, Customers and the other tabs). The author will mention the unbuilt parts in the email to Anjali.
- Still open: the length review of the main story; the vision ("Where this is heading"), possibly with one mock-up of the "Later" stage; the deck slides listed in the open points above.
- Testing: Playwright scripts click through every path and open every link and pop-up; run them after any change to order.js, render.js or app.js.

## Deck: what to build next (hand-over, 31 October 2026)

The deck is `deck/index.html` (slides), `deck/deck.css` and `deck/deck.js`. It is a fixed 1280x720 stage; keys ←/→, N for notes. Live at https://kittokino.github.io/agentic-b2b-commerce/deck/.

Deadlines: submit the deck and the prototype by Tuesday 3 November 2026, 18:00 IST. The presentation is Wednesday 4 November, 18:00 IST, over Microsoft Teams: about 30 minutes presenting, then questions. Panel: Charles Barton (VP of Product, hiring manager), Nicole (user researcher), Frank (product manager).

Slides that exist: 1 title, 2 problem, 3 four principles, 4 the places and the people, 5 a typical day at work, 6 the opportunity, 7 what the agent does (acts, stops, hands over), 8 the journey, 9 configuring the platform (Maheep's rules, and the same rules for a medical supplier), 10 assumptions and research; appendix with the assumptions matrix, the research plan, and how this was made.

Slides still to build (the case brief asks for research, vision, leadership, commercial impact, platform configurability, and a design system shown in two or more channels):
1. Research as evidence (open point 1 above), including the author's revised research plan. Research questions and technical notes are in `docs/02-research-and-technical-notes.md`.
2. Principles derived from the research, then "Where this is heading": Today, Next, Later (open point 2 above, plus the vision idea about trust).
3. A "Live prototype" hand-off slide that links to https://kittokino.github.io/agentic-b2b-commerce/prototype/.
4. Platform configurability: Maheep's rules (versioned, tested before publishing), and one example of the same platform with different rules for another industry (for example, a medical supplier: lot numbers, prescriptions, cold chain).
5. The design system: the same components (status, order item, agent symbol, activity entry) in WhatsApp, Teams and Kade's Sana.
6. Commercial impact: what it is worth to Kade (more orders confirmed without a person, faster confirmation, fewer errors) and the measures to track.
7. How the author would lead: team, ways of working with product and engineering, the first 90 days.
8. A technical assumptions appendix slide (from `docs/02`). Check slide 8's speaker notes against the slide with the author.

The deck must match what the prototype now shows:
- The agent works out "the usual cheese board" from Harbour Front's order history.
- Prices outside the contract go to Priya, the buyer, not to Nigel. Tom chooses the supplier (Northgate Wines, 14 bottles at €11.80) from options the agent prepared; Priya approves the one-time price in Teams.
- Every decision on an item affects only that item; a decline never cancels the whole order.
- After the order: Tom flags a poor suggestion, and Maheep publishes version 2 of the substitution rule (up to three ranked alternatives from all of Kade's inventory; a WhatsApp list, because a message holds at most three reply buttons).
- Names: Harbour Front (Nigel's restaurant), Old Town (sends 10 bottles), the AI order agent (Kade's), the purchasing assistant (The Olive Tree's own, Priya's). Dates: Wednesday 28 to Friday 30 October 2026; the dinner is on Saturday 31 October.

When two sessions work on this repository at the same time:
- Pull `main` before starting, and pull again before pushing.
- Do not change `shared/` (colours, fonts, components) without asking the author; the prototype uses the same files.
- Record any change to the story (a name, a time, a price) in `docs/01-story.md`, so both sessions read the same story.

