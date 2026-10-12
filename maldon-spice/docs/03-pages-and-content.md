# 03. Pages and content

Use trailing-slash URLs. All copy below is final unless marked `[owner]`. Exact copy for Home and Menu is also in `design/reference/`.

## Site map
| URL | Page | Notes |
|---|---|---|
| `/` | Home | |
| `/menu/` | Main menu | Allergen filter, section jump links |
| `/menu/dairy-free/` | Dairy-free menu | Separate URL (indexable) |
| `/menu/drinks/` | Drinks and wine | |
| `/allergens/` | Allergen guide | Policy, legend, links to menus |
| `/visit/` | Visit, reserve, order | Address, hours, parking, contact, buttons, map |
| `/our-story/` | Our story | Owners, press, award |
| `/heritage/` | Maldon town history | **Keep the existing slug.** Full spec below; migrate the live article with `scripts/migrate-heritage.mjs` **while the legacy site is still online**. |
| `/privacy/` | Privacy and cookies | |
| `/404` | Not found | Links to Menu, Visit, Home |

Primary navigation (desktop): Menu, Allergens, Visit, plus Order and Reserve buttons. Phone: wordmark, Menu, and the bottom bar (Call, Reserve, Order). Footer: Menu, Allergens, Maldon history, Visit, Our story, Privacy, Cookies, Facebook, Instagram. The Home story section links to Maldon town history.

## Global behaviours
- **Reserve** and **Order for collection** use `site.json` `mobi.bookUrl` / `mobi.orderUrl`. Until those are confirmed, both link to `/visit/#reserve` and `/visit/#order`, where the phone and text numbers are shown. Open Mobi links in the same tab with `rel="noopener"`; add `?utm_source=website` only if Mobi supports it.
- **Open-now badge** (optional, small): computed client-side in `Europe/London` from `site.json` hours and closures: "Open now, until 22:00" / "Opens today at 17:00" / "Closed today. Opens Tuesday at 17:00". No flash on load: server-render "Open Tuesday to Sunday, 17:00 – 22:00", enhance after.
- **Notice banner**: if `site.json` `banner.enabled` is true, show a full-width bar above the header (deep text on pale). If `closures` contains a range covering today or the next 14 days, auto-generate banner text "Closed 25 to 27 December. Back on 28 December." Closures are the **only** way to express holiday hours. Never hard-code dates in templates.
- **Structured data** on every page, per `docs/04-seo.md`.
- Print stylesheet for menu pages (black on white, no bars).

## Home (`/`)
Title tag and meta: see SEO doc. Sections and exact copy:

1. **Hero**: wordmark; italic line "Indian restaurant on Maldon High Street"; "Open Tuesday to Sunday, 17:00 – 22:00"; buttons "Reserve a table", "Order for collection"; text link "See the menu".
2. **Facts**: Hours (Tuesday to Sunday, 17:00 – 22:00); Find us (111 High Street, Maldon CM9 5BS; link "Get directions" to `https://www.google.com/maps/search/?api=1&query=Maldon+Spice+111+High+St+Maldon+CM9+5BS`); Call or text (01621 853162, 07904 659177; links "Call", "Text"); Parking ("Reimbursed for customers at Butt Lane Car Park").
3. **Our story**: "Maldon Spice is run by Jhual and Shamema, who have worked in restaurants for more than thirty years." "Grills are marinated in yoghurt and spices, then baked on skewers in a clay oven over charcoal. There are vegan specials, a dairy-free menu and a full allergen guide." Button "Reserve a table". Portrait photo.
4. **Photo pair**: two portrait photographs (clay oven; dining room).
5. **From the menu**: heading "From the menu", line "A few favourites. The full menus show allergens for every dish." Starters: Tikka Tetul, Sheek Kebab, Chilli Mushroom. Grills: Lamb Chops, Fit for a King, Chicken Tandoori. Biryani: Lamb Biryani. Pull these from `data/menu.json` by id, not hand-typed. Legend line, then buttons "Open the full menu" and "Filter by allergen" (links to `/menu/#filter`).
6. **Allergens band** ("Allergens, dairy-free and vegan"): Allergy guide, Dairy-free menu ("For pre-booked tables on Sunday, Tuesday, Wednesday and Thursday. On Friday and Saturday, dishes must be pre-ordered. Everything takes a little longer to prepare."), Vegan specials ("Vegan dishes have their own section on the main menu, alongside vegetable sides, rice and breads.").
7. **Recognition**: "Euro Asia Curry Award 2022"; "Former mayor and mayoress restaurant adds spice to Maldon high street", Maldon and Burnham Standard; one recent guest review `[owner]` (see open questions).
8. **Visit**: as the facts plus "Parking is reimbursed for customers at Butt Lane Car Park.", buttons, map.

Remove the duplicated blocks if the page feels long on phones; the facts strip, Visit band and bottom bar already repeat the key actions.

## Menu (`/menu/`, `/menu/dairy-free/`, `/menu/drinks/`)
- H1 "Menus" (visual) with a visually-hidden or real page-specific H1: "Main menu", "Dairy-free menu", "Drinks and wine".
- Tabs are `<a>` links with `aria-current="page"` on the active one (not buttons), so each menu has its own URL.
- Intro text: Main: "Cooked in a clay oven over charcoal. Allergen codes sit beside each dish, and you can hide dishes that contain an allergen below." Dairy-free: "Available Sunday, Tuesday, Wednesday and Thursday for pre-booked tables. On Friday and Saturday, dishes must be pre-ordered. All items take a little longer than usual to prepare." Drinks: "Wines, beer, cocktails and non-alcoholic drinks."
- **Allergen filter** (Main menu only): see `docs/06-menu-data.md`.
- **Section jump links** under the filter; each section has an `id` (`starters`, `tandoori-grills`, `biryani`, `sides`, ...).
- Dish row: name (weight 500), description (muted), codes in brackets, price(s) right-aligned. Multiple prices render as `7.95 / 8.95` with a visible label in the description when needed (for example "Chicken / lamb").
- Notes under tabs: "Prices in pounds. Please tell us about any allergy before you order." The bottom bar (phones) and header buttons stay visible.
- A discretionary service charge or minimum charge is **not** currently documented except "Minimum charge £17.95" on the legacy main menu; confirm with the owner before publishing it (`docs/10`).

## Allergens (`/allergens/`)
Purpose: tell people what the guide is and is not, and route them to the filter and staff.
Copy to write, in the owner's voice, covering: the 14 allergens are handled in the kitchen; the code legend (d dairy, g gluten, n tree nuts, m mustard, e egg, f fish; add s sulphites, p peanuts, so sesame, c celery, l lupin, mo molluscs, cr crustaceans, sy soya **only if the allergy sheet uses them**); how to tell staff when booking or ordering; that dairy-free dishes are cooked to order and take longer; that the kitchen cannot guarantee an allergen-free environment `[owner to confirm wording]`; link to `/menu/#filter`; link to the dairy-free menu; phone number. Do not claim "gluten free" anywhere unless the owners confirm it and the allergy data supports it (the legacy dairy-free PDF is titled "Dairy & Gluten Free", the website calls it "Dairy Free"; see open questions).

## Visit (`/visit/`)
- H1 "Visit".
- Address block, hours block (from `site.json`, including any closure notice), contact block (call, text, email once the domain email exists), parking line, "Get directions".
- Buttons "Reserve a table" and "Order for collection" with ids `reserve` and `order`.
- "Collection only" note near Order: "Orders are for collection from the restaurant." Add "Pay when you collect" **only after** the owner confirms Mobi supports pay-on-collection (`docs/05`).
- Map: no iframe by default. Use a click-to-load Google Map (loads on tap, with a short privacy note) or a static image with a link. Do not load third-party map scripts on page load.

## Our story (`/our-story/`)
Short page: the owners' paragraph from Home, the award, the press headline and a link to `/heritage/`. Facts available from the legacy heritage page (owner to confirm): Jhual Hafiz owns and runs the restaurant with his family; over 30 years in the business; ran Maldon Tandoori before Maldon Spice; former Mayor of Maldon and a serving town councillor; the building at 111 High Street housed the first Indian restaurant in Maldon (1978). Expand only with facts supplied by the owners. Do not invent history. The legacy site's About text: "Hi, our names are Jhual and Shamema, and we are multi-award winning restauranter with over 30 years of experience. It is our pleasure to welcome you to our new restaurant, Maldon Spice." Do not reuse the typo "restauranter"; "Jhual" is the spelling used on the heritage page, which also gives the surname Hafiz (a reviewer wrote "Juhal"); confirm with the owners how names should appear. The About text names Shamema as co-owner, while the heritage page says "Jhual Hafiz and his family": confirm who to name.

## Maldon heritage (`/heritage/`)
Design: `design/reference/Heritage.dc.html` (desktop) and `MobileHeritage.dc.html` (phone). The legacy page is a long article plus a 20-image gallery on a blue-grey background; it is a real content asset and must survive.

**Content facts from the legacy page (checked 12 October 2026):**
- Title "Maldon Town History", article headline "Maldon Through Time", byline "Written by Stephen Nunn", credit line "Images courtesy of English Heritage".
- About 700 words in twelve paragraphs with no subheadings, covering the hill and Roman and Anglo-Saxon settlement, the 916 fort and mint, the 991 Battle of Maldon, Domesday, the 1171 charter, churches and monasteries, the Moot Hall and Thomas Plume, the 1797 canal, the 1847 railway, Maldon salt and the 1895 Promenade.
- A closing section about Maldon Spice: owned and run by Jhual Hafiz and family; over 30 years' experience; award-winning; Indian cuisine came to Maldon in 1978 and the first Indian restaurant opened in the same building (111 High Street); Jhual ran Maldon Tandoori before Maldon Spice; former Mayor, serving Town Councillor.
- 20 images (see `data/images.json`, ids `heritage-*`), none with alt text.

**Build requirements**
1. **Do not retype or rewrite the article.** Run `scripts/migrate-heritage.mjs` while https://maldonspice.co.uk/heritage is live: fetch the article HTML, convert it to Markdown in `src/content/heritage.md` preserving paragraphs, bold and italics, keep the author credit and the "Images courtesy of English Heritage" line, download the 20 images into the local image pipeline, and commit the result. The text is Stephen Nunn's work; the owner must confirm permission to republish (docs/10).
2. Layout: primary-colour title band (H1 "Maldon Town History", italic "Maldon Through Time", byline and credit), a horizontally scrollable photo strip (keyboard focusable, visible scroll affordance, no autoplay, no slider plugin), then two columns on desktop: **Key dates** list (from `data/heritage.json`) beside the article at a 36rem measure; on phones the key dates come first, then the article.
3. Typography: article body at 17px/1.65, a drop cap on the first paragraph is optional (Bodoni, ink, not red); optional subheadings (H2) per era **only with the author's approval**, because adding structure to someone else's article changes it.
4. Images: add alt text for all 20 (`images.json`), use English Heritage credit near the strip, lazy-load below the fold, aspect-ratio boxes to avoid layout shift. Several files are very large (up to 2560px); several are tiny (160 to 300px wide: do not enlarge, drop or show small).
5. Closing block "Maldon Spice on the High Street" (mist band) with Reserve and menu buttons. Write it from the facts above (do not paste the legacy paragraph again; it is already in the migrated article), and **do not include the owner's association membership** that appears in the legacy text unless the owner confirms (docs/10).
6. SEO: see docs/04 (Article schema, title, description, internal links to `/visit/` and `/menu/`).
7. Accessibility: the photo strip has an accessible name, each image has a meaningful alt, the key dates list is an actual list (`<dl>`/`<ul>`), headings are in order.

## Privacy and cookies (`/privacy/`)
Plain-English privacy notice covering: who runs the site (restaurant legal name and address `[owner]`), what the site collects (nothing by itself if analytics are cookieless; phone and email if people contact the restaurant; booking and order data processed by Mobi under its own policy), analytics used, third parties (Cloudflare hosting, Google Maps only if the visitor loads the map), how to contact the restaurant about data. State clearly that the site sets no non-essential cookies. Have the owners or an adviser review it. This is not legal advice.

## 404
"That page has moved or does not exist." Links: Menu, Visit, Home, phone number.

## Content migration checklist
- [ ] Run `scripts/migrate-heritage.mjs` against the live `/heritage` page before cutover; commit `src/content/heritage.md` and processed images (keep URL).
- [ ] Do not migrate: slider, Facebook feed, reviews widget, WPForms, "Homepage" H1, Christmas hours, Twitter bird icon.
- [ ] Press and award images: use only if rights are confirmed; otherwise text only.
