# 06. Menu data, allergens and the filter

`data/menu.json` is a **seed**. It contains 75 dishes and drinks that have been transcribed from the four legacy PDFs and cross-checked against the allergy sheet (main menu), plus the full dairy-free menu and a first slice of the drinks list. The rest of the main menu must still be extracted and reviewed (see Extraction pipeline). Nothing is allergen-reviewed by the kitchen yet: every item has `reviewed: false`.

## Sources (retrieved 12 October 2026)
- Main menu: `https://maldonspice.co.uk/wp-content/uploads/2025/12/ms_main_menu_oct2025_temp.pdf`
- Allergy menu: `https://maldonspice.co.uk/wp-content/uploads/2025/10/Maldon-Spice-Allergy-Menu.pdf`
- Dairy-free menu: `https://maldonspice.co.uk/wp-content/uploads/2025/11/ms_dairy_free_menu_nov2025.pdf`
- Drinks and wine: `https://maldonspice.co.uk/wp-content/uploads/2025/11/ms_6ponA3_drinks_menu_oct2025.pdf`

## Data model
```
menus[]: id, title, path, source, filterable, availability?, sections[]
sections[]: id, title, note, items[]
items[]: id, name, description, prices[{amount, label?}], allergens[]|null,
         allergenStatus: "listed" | "not-on-allergy-sheet" | "needs-check" | "not-applicable",
         dietary[] (only explicitly confirmed: "vegetarian" | "vegan" | "dairy-free"),
         preorder, reviewed, dairyFreeMenu?
```
Allergen codes: `d` dairy (milk), `g` gluten (cereals containing gluten), `n` tree nuts, `m` mustard, `e` egg, `f` fish. The allergy sheet also lists "sulphur dioxide and sulphites" on Chicken Chaat on Puri; add `s` (and any other code) when the data needs it. Validate with a Zod schema in `src/content.config.ts`; the build must fail on unknown codes, missing prices, `reviewed: false` in production (see below), or duplicate ids.

## Safety rules (non-negotiable)
1. **Never infer allergens.** An item gets `allergenStatus: "listed"` only when the allergy sheet lists that exact dish. A blank entry on the allergy sheet means unknown, not "none".
2. **Unknown is unsafe.** When the filter is active, dishes whose status is not `listed` are hidden, and a visible line says "N dishes are hidden because their allergen information is not confirmed. Please ask us." Never show them as safe.
3. **Never write "free from", "safe" or "suitable for" next to allergen-related UI.** Use "hiding dishes that contain dairy".
4. A permanent line is visible with the filter: "A quick guide only. Please always tell your server about any allergy."
5. Production builds fail while any item shown on a public page has `reviewed: false`. Add `ALLOW_UNREVIEWED=1` for previews only; previews carry a visible "DRAFT: allergen data not yet verified by the kitchen" banner and `noindex`.
6. Keep the legacy statement that some dishes contain nuts and that staff can advise.
7. Do not claim "gluten free". The dairy-free PDF is titled "Dairy & Gluten Free" but the website calls it "Dairy Free", and the allergy sheet lists gluten on items that appear on it (see conflicts). Resolve with the owners first (`docs/10`).

## Allergen filter (Main menu only)
- Six toggle buttons: Dairy, Gluten, Tree nuts, Mustard, Egg, Fish (plus any added codes), each `<button aria-pressed>`, min 44px high.
- Multi-select. A dish is hidden if it contains **any** selected allergen **or** its status is not `listed`.
- Shows "Showing X of Y dishes, hiding dairy, nuts." in an `aria-live="polite"` region. Offers "Clear all". If zero dishes remain: "No dishes in this selection match. Please ask the team and we will help you choose."
- Empty sections disappear along with their jump links.
- State lives in the URL (`?avoid=d,n`), so it is shareable and survives refresh. Do not use cookies. Server-render the full list; filtering is progressive enhancement (works without JS as a complete menu with codes).
- The prototype in `design/reference/Menu.dc.html` implements toggling and counts but not rules 2 and 4 above; implement them.
- Menu pages print cleanly (codes included).

## Display rules
- Dish row: name, description, codes in brackets, right-aligned prices with tabular figures. Multiple prices render `7.95 / 8.95`; labels (Chicken, Lamb, Half, Pint...) show in the description or as a small suffix, never lost.
- Pre-order dishes (dairy-free menu) say "Pre-order" in the description. Availability text sits above the list.
- Prices in pounds; no currency symbol on rows, with "Prices in pounds" under the legend (or use £ consistently; pick one and keep it).
- Fix obvious typos in copy when migrating: "Telapia" to "Tilapia", "Somosa" to "Samosa", "Bahji" to "Bhaji", "chill" to "chilli", "king king prawn", "£11:95" and "£20:95" (colons) and similar. Keep dish names as the restaurant spells them where spelling is a brand choice (Shashlic, Massala, Balti). Ask the owners to approve spelling changes.

## Extraction pipeline (`scripts/extract-menu.mjs`)
1. Download the four PDFs into `data/source/` (gitignored if large; commit the text outputs).
2. Extract text with layout preserved: `pdftotext -layout` (poppler) or pdf.js with positions. **Plain text extraction mangled the main menu**: the standard-curry price grid scrambled, and category headings came out at the end. If layout extraction still fails, rasterise the page (300 dpi) and read it visually, then transcribe.
3. Parse into items, normalise names (lowercase, strip punctuation, expand "Chicken/Lamb"), assign categories using the PDF headings: Appetizers, Maldon Spice Specials, King Prawn, Fish Dishes, Keema Dishes, Biryani Dishes, Standard Curry Dishes, Veg Sides, Side Dishes, Vegan Specials, Set Meals, Kid's Meals, English Dishes, plus tandoori grills.
4. Join to the allergy sheet by normalised name. Write `data/menu.generated.json` and a human review file `data/menu.review.md` listing: unmatched dishes in both directions, name mismatches, multi-price items, and conflicts.
5. Owners review `menu.review.md`. Only reviewed rows are merged into `menu.json` with `reviewed: true`.
6. Acceptance: every main-menu dish has a category, at least one price, and either allergens (status `listed`) or an explicit status. Counts per section are printed and compared with the PDFs by eye.

## Known content still to ingest from the main menu
- **Standard curry grid:** sauces Korma, Bhuna, Madras, Vindaloo, Dopiaza, Dansak, Rougan, Pathia, Methi, Sag, Korai, each with a short description (for example Korma "very mild creamy sauce", Pathia "hot as Jalfrezi, sour and spicy"). Price columns observed in the text: Chicken/Lamb (+£1 for lamb), Vegetarian/Mushroom/Chana, Tandoori Chicken, Keema, King Prawn/Tandoori King Prawn (+£5), Tikka Chicken/Lamb (+£1). **The extracted numbers could not be mapped reliably to cells.** Read the printed page.
- **Set meals:** for 2 £52.95, for 4 £110.95, for 6 £165.95, each listing popadums, mixed starters, specified mains, sides, rice and naan.
- **Kid's meals** (£8.95 each: fish fingers and chips, chicken nuggets and chips, scampi and chips, chicken korma and rice or chips, chicken tikka massala and rice or chips, chicken tikka and rice or chips) and **English dishes** (sirloin steak and chips with peas, onions and mushrooms £24.95; chicken and chips £18.95).
- House specials (about 35), king prawn dishes (about 16), keema (4), fish dishes (11), vegetable mains and vegan specials, vegetable sides, rice and breads, extras ("charged at 65p to 95p"), "Minimum charge £17.95" (confirm), nut-allergy note.
- **Do not publish** the guest Wi-Fi password printed at the end of the main menu PDF.

## Data problems found during review (resolve before launch)
**Dishes on the main menu with no entry on the allergy sheet (examples, not exhaustive):** Romeo & Juliet, Paneer Shashlic, Tetul Skewers, Masli Sag Garlic Balti, Chilli Tikka, Paneer Massala.
**Allergy-sheet names that do not match any main-menu name (examples):** Platter for 2 People (menu: Platter for 4 People), Special Duplex (menu: Special Delex), Infusion, Ghoulish Tandoori, Titli Express, Chicken/Lamb Executive, Kora Bhuna Balti (menu: Korai Bhuna Balti), Kolhapuri Chilli Curry (menu: Kolhapuri Chilli Egg Curry). These may be old names.
**Allergy-sheet entries with no allergens listed (ambiguous):** Kora Bhuna Balti, Red and Green Spice Massala, Red or Green Pepper Biryani, Alo Chana Massala, Begun Chilli Garlic Spicy, Kacha Morich Alo Gouflor, Chips, Popadum, Chilli Garlic Massala (Vegan), Peri Peri Alo Coli Bangla, Rice Roti (Gluten Free).
**Internal inconsistencies:** chicken and lamb versions of the same dish list different allergens (for example Chicken Sag lists milk and mustard, Lamb Sag lists milk and tree nuts; Lamb Tikka Massala Balti lists milk only while the chicken version lists milk and mustard); "Chicken Tikka Massala" appears twice with identical data.
**Dairy-free menu versus allergy sheet:** the dairy-free menu offers King Prawn Butterfly (breadcrumbed; the allergy sheet lists milk, eggs and tree nuts but no gluten), Prawn and King Prawn on Puri (allergy sheet lists gluten, and for king prawn also milk and tree nuts), Chilli Mushroom (allergy sheet lists milk and tree nuts), Chicken Korma and Pilau Rice (allergy sheet lists milk). These may be intentionally different dairy-free preparations; the kitchen must confirm per dish and the dairy-free dishes need their own allergen entries.
