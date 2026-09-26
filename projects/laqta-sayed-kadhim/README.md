# LAQTA × Sayed Kadhim — Internal Creative Manual

Internal creative brief + execution manual for LAQTA's team (copy, CD, design, photo/video, editing, media buying, management). Arabic-first (RTL), long-scroll HTML. No build step, no framework.

Open `index.html` in a browser.

| File | What to edit there |
|---|---|
| `index.html` | All copy. One `<section>` per chapter, commented `01`–`16`. |
| `styles.css` | Tokens at the top (colors, type scale, spacing, radius, grid, motion), then components in page order. |
| `script.js` | `SHOT_CATEGORIES` / `SHOTS` at the top drive the Ch.10 contact sheet. Also: nav, filters, checklists, loop, final filter. |
| `assets/` | Favicon. Drop reference images here if a chapter needs them. |

## Notation used in the manual

- `TBC` = waiting on the client. The team does not guess these.
- `● PAID` = piece built as an ad creative from day one.
- Colored dot = content job (Demand, Product, Occasion, Trust, Experience, Scale, Conversion, Performance).

## Interactive bits

- Ch.07 month grid filters by job / paid.
- Ch.10 shot matrix and Ch.13 "Before Month One" checklist save ticks in the viewer's browser (localStorage, per device).
- Ch.15 loop: click a stage. Ch.16: run any idea through the 7 questions.
- Keyboard: `J` / `K` = next / previous chapter.

## Updating after the client answers Ch.13

1. Fill the hero / support / rotation tiers in Ch.13.
2. Reorder `SHOT_CATEGORIES` in `script.js` by priority.
3. Replace `DISH TBC` tags in Ch.07 with the confirmed dishes.
4. Remove the "working hypothesis" note in Ch.07 once the month grid is locked.
