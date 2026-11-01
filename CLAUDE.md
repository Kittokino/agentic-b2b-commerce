# Working on this repository

## Writing copy

All copy (prototype screens, messages, activity entries, deck slides and notes) is written in complete, plain sentences that someone seeing it for the first time can follow without context.

- Say who does what, to which item, and why. Name things in full: "24 bottles of Sauvignon Blanc", not "the wine".
- No telegraphic "Label: fragment" phrasing ("Wine: handed over to Tom"), no colon-compressed clauses, and no clever shorthand ("Overnight, nothing moved").
- A colon may introduce a complete sentence or a direct question, after a complete clause (not after "which is"). The first word after the colon then starts with a capital letter, and a question ends with a question mark: "I chose one challenge to solve: How do restaurants order their supplies from a wholesaler?", "Note: These are assumptions."
- Explain times and roles where they matter: "when Tom starts work at 08:00", "Tom from our customer service team".
- Messages a customer receives (WhatsApp, Teams) must be unambiguous: what happened, who will act, when, and whether the customer needs to do anything.
- "Inventory" for what a system records; "in stock" for what people say about availability.

## Checks before showing the author a slide

- Read the slide as the audience at that point in the deck: do not name a person, place or item they have not met yet (Priya and Nigel are introduced on slide 4).
- Keep styles the same across slides: titles (h2, 44px), the line under a title (`.lead`), notes at the bottom (`.caveat`) and eyebrows. Reuse the shared class instead of a slide-specific copy, and compare the computed sizes in a browser.
- Check the slide in a browser at 1280x720: nothing overflows, wraps badly or touches the footer.
- Check the speaker notes too: short, in the author's voice, not repeating what the slide already says, and not technical unless the slide is.

## The design system

`DESIGN.md` at the top of the repository describes the design system for people and AI tools: principles, tokens, components, channels, words and example data. Follow it for every screen and message, and update it (with a line in its change log) when a token, component or rule changes.

## Working with the author

Argue for a suggestion before making it. Changes go to `main`; bump the `?v=` version on any CSS or JS file you change.

## The brief

Build as if creating a new solution from the ground up: derive the work from research and a product vision, and do not use any existing commerce platform as a reference. The author may use their own design system. Keep private details (people, dates, anything about how the work will be assessed) out of this repository: it is public.

Decisions the author made:

- Keep the name Sana in the prototype and deck ("Kade runs on Sana"). The work must not suggest a name for Sana's future platform.
- Keep the current visual language (off-white, navy, red only for the agent's stop).
- The design language follows Microsoft's Fluent at heart: Teams is one of the channels, and B2B buyers work in Microsoft 365.

Vision idea for the "Next" or "Later" stage: the agent suggests changes the customer did not ask for, for example "Your usual cheese board serves about 70; this dinner is for 120. Would you like two?". The author decided against this in the prototype, because from the supplier's agent it can feel pushy, like upselling. In the vision, it shows how trust lets such suggestions work: the more an agent has earned trust, the more it is allowed to suggest.

## Where the prototype stands

- Main story: 16 scenes (#scene-1 to #scene-16). Priya's price approval and the agent's confirmation are one scene (#scene-14): `priceApproved` has `merged: true`, so it plays on the same screen without a scene number of its own. The Old Town call is one scene (#scene-8, `callNoted` in order.js). Side branches: #what-if-accepted-n and #what-if-more-options-n. Follow-on: #after-the-order-1 to 4 (Tom flags a suggestion; Maheep publishes version 2 of the substitution rule).
- The closing cards of the main story and of "After the order" have "Back to the deck", which switches to the deck's tab on slide 9.
- Decided not to build: the full Sana navigation (Orders, Customers and the other tabs).
- Testing: Playwright scripts click through every path and open every link and pop-up; run them after any change to order.js, render.js or app.js.

## The deck

The deck is `deck/index.html` (slides), `deck/deck.css` and `deck/deck.js`. It is a fixed 1280x720 stage; keys ←/→, N for notes. Live at https://kittokino.github.io/agentic-b2b-commerce/deck/.

Slides that exist: 1 title, 2 problem, 3 the problem and four principles, 4 the places and the people, 5 a typical day at work, 6 the opportunity, 7 what the agent does (acts, stops, hands over), 8 the journey, 9 live prototype (opens the prototype in a new tab), 10 configuring the platform (rule types, with Kade and a medical supplier side by side), 11 assumptions and research, 12 where this is heading (the closing slide: "Trust earns the next step.", with the drawing of two chefs plating together, `assets/places/vision-plating.jpg`); appendix with the design system (a backup slide: the same salmon item in WhatsApp, Teams and Kade's Sana), the assumptions matrix, the research plan, and how this was made ("How I worked with AI").

Still to build:
1. A start page (`index.html` at the top of the repository) that tells a reader how to go through the deck and the prototype, including the keys: arrow keys to move, N for the notes.
2. When slides are added, extend the note on slide 9 that lists what the rest of the deck covers.

Leadership and commercial impact are not slides; the author prepares them for the conversation.

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
