# 02. Design system and UX rules

**Live preview (desktop and phone frames):** https://claude.ai/artifact/8XrHW1PFz6BA4wezsuehJZ
The preview is a design canvas, not production code. Its source is in `design/reference/` (`Main.dc.html` = Home, `Menu.dc.html` = Menus, `MobileHome` and `MobileMenu` import those at 390px). The `.dc.html` format is proprietary; read it for **exact copy, spacing, colours and structure**, then implement in Astro. If the preview and this document disagree, this document wins, except that the exact copy in the preview wins over copy invented here.

## Direction
Restrained, editorial, quiet. References: **Impala Soho** (white page, tiny tracked capitals, high-contrast serif, almost no chrome), **Humble Chicken** (photography-led, thin outline buttons), **Oudh 1722** (patterned hero with only a wordmark, offset text-and-portrait layout, menu as pure typography with inline allergen codes), and the public description of **Row on 5** (Savile Row tailoring: precision, restraint, quality material; its own site could not be opened because the rowon5.com domain is parked, so no visual cues were taken from it). The brand colour is the logo's blue-grey and it leads; deep blue-grey and white do the supporting work.

Do not drift towards: card grids, rounded corners, drop shadows, gradients, icon rows, big "hero + two buttons" SaaS patterns, emoji, stock photos.

## Colour
Tokens: `design/tokens.css` and `design/tokens.json`. Rhythm down the page: white header, **primary hero**, white facts, mist story, white photos, white menu extract, **deep allergens**, white recognition, **primary visit**, **deep footer**.

Rules:
- Primary `#A5BCC4` is the dominant colour: hero, story panel, visit band, photo placeholders and the mobile Order button.
- Text on primary is **ink only**. Never muted, spice or white text on primary.
- `spice` text only on white or mist. `sand` only on deep.
- Solid buttons: `deep` fill, white text. Outline buttons: 1px `deep` border, ink text. On deep surfaces use a primary-filled button with ink text.
- Verified contrast ratios (computed, WCAG relative luminance):
- `ink` #1B2A33 on `white` #FFFFFF: **14.73:1** (AA text)
- `ink` #1B2A33 on `primary` #A5BCC4: **7.43:1** (AA text)
- `ink` #1B2A33 on `mist` #EEF3F5: **13.17:1** (AA text)
- `ink` #1B2A33 on `pale` #DCE6EA: **11.61:1** (AA text)
- `muted` #44565F on `white` #FFFFFF: **7.66:1** (AA text)
- `muted` #44565F on `mist` #EEF3F5: **6.85:1** (AA text)
- `muted` #44565F on `pale` #DCE6EA: **6.04:1** (AA text)
- `muted` #44565F on `primary` #A5BCC4: **3.86:1** (large text/UI only)
- `spice` #A4502B on `white` #FFFFFF: **5.58:1** (AA text)
- `spice` #A4502B on `mist` #EEF3F5: **4.99:1** (AA text)
- `spice` #A4502B on `primary` #A5BCC4: **2.82:1** (DO NOT USE for text)
- `white` #FFFFFF on `deep` #2F4752: **9.79:1** (AA text)
- `pale` #DCE6EA on `deep` #2F4752: **7.72:1** (AA text)
- `sand` #E3C9A0 on `deep` #2F4752: **6.12:1** (AA text)
- `primary` #A5BCC4 on `deep` #2F4752: **4.94:1** (AA text)
- `deep` #2F4752 on `primary` #A5BCC4: **4.94:1** (AA text)
- `ink` #1B2A33 on `primary (button on deep bar)` #A5BCC4: **7.43:1** (AA text)

## Type
- Display: **Bodoni Moda** (400 and 500, plus 400 italic) for wordmark, headings, section labels. Headings are uppercase with `letter-spacing: .08em` at 30 to 32px; the hero wordmark uses `clamp(40px, 10vw, 84px)` with `.2em` tracking and a matching `text-indent` so it stays optically centred.
- Body and UI: **Hanken Grotesk** (400, 500) at 17px, line-height 1.65.
- Uppercase labels: 13px, `.16em` tracking, weight 500. Never below 12px for decorative labels or 14px for anything a user must read.
- Self-host both fonts (subset to Latin, WOFF2). Preload the display roman and body regular only. `font-display: swap` with metric-compatible fallbacks (size-adjust) to avoid layout shift.

## Layout
- Content width 1100px (`--wrap`), prose measure 34rem, gutters `clamp(24px, 4vw, 48px)`.
- Sections use flat colour fields separated by space, not borders. Hairlines only inside lists and between the allergen columns.
- Asymmetry is allowed on desktop (text column beside a portrait photo; two portrait photos with the second offset 72px lower). On phones everything is one column and offsets are removed.
- Photographs: portrait 4:5 where possible, no rounded corners, no borders, no overlays. Photo slots in the preview are blue-grey blocks with a caption; replace with real images (see `docs/07-images-and-assets.md`).

## Components
- **Header**: white, 1px hairline below. Left: wordmark "MALDON SPICE" (Bodoni caps, 20px, .18em). Centre/right: Menu, Allergens, Visit links. Right: Order (outline) and Reserve (solid). **Phone:** wordmark plus a single Menu link; Order and Reserve move to the bottom bar. Target height 64px desktop, 56px phone.
- **Hero** (primary): typeset wordmark (replace with the real logo file once supplied, see below), one italic line, opening hours, Reserve and Order buttons, a "See the menu" text link. Height driven by content (about 560px desktop). No slider, no video, no autoplay.
- **Facts strip** (white): Hours, Find us (+ Get directions link to Google Maps), Call or text (+ tap links), Parking. This block is the answer to "where and when" and must be reachable without scrolling past the hero on phones.
- **Our story** (mist): short text (about 60 words), Reserve button, portrait photo.
- **Photo pair** (white): two portrait photos, second offset on desktop.
- **Menu extract**: eight real dishes with price, description and allergen codes in the same typographic format as the Menu page, then "Open the full menu" and "Filter by allergen".
- **Allergens band** (deep): three columns separated by hairlines (Allergy guide, Dairy-free menu, Vegan specials).
- **Recognition** (white): Euro Asia Curry Award 2022, the Maldon and Burnham Standard headline, and one recent real guest review (see open questions for sourcing).
- **Visit** (primary): address, hours, contact, parking line, Reserve and Order buttons, map.
- **Footer** (deep): copyright, Menu, Allergens, Privacy, Cookies, Facebook, Instagram.
- **Mobile bottom bar** (phones only): sticky, 56px, three equal targets **Call**, **Reserve**, **Order**. Order is the primary-filled one. Respect `env(safe-area-inset-bottom)`. Add bottom padding to the footer so nothing is hidden behind it. Hide it on the Visit page where the same buttons are already in view only if a visibility observer confirms it (otherwise keep it).
- **Heritage page** (`/heritage/`): primary title band, horizontally scrollable photo strip, then Key dates (aside) beside a 36rem article column, then a mist band about Maldon Spice with Reserve and menu buttons. Reference: `design/reference/Heritage.dc.html`; article text is placeholder lines in the prototype by design (migrate the real text).
- **Menu page**: tab links (Main menu, Dairy-free, Drinks) that are real links to separate URLs. An allergen filter (Main menu only), section jump links (horizontal scroll on phones), and sections of dishes. See `docs/06-menu-data.md` for behaviour.

## Usability rules (desktop and mobile)
1. Top tasks, in order: see the menu, check allergens, find hours and address, call, reserve, order for collection. Each is reachable in at most two taps from any page.
2. Reserve and Order are visible without scrolling on every page and viewport (header on desktop, bottom bar on phones).
3. Every phone number is `tel:` or `sms:`; the address links to Google Maps directions; the email is `mailto:`.
4. Minimum interactive target 48px high (never below 44px), 8px apart.
5. No hover-only information. No carousels. No modal popups. No cookie banner unless a consent-requiring technology is added (see SEO doc: use cookieless analytics and click-to-load maps).
6. Body copy at least 17px; secondary text 14px minimum; line length under 70 characters.
7. Prices right-aligned, tabular figures (`font-variant-numeric: tabular-nums`). Allergen codes shown inline in brackets after the description, with a legend above the list on the menu page, not only at the bottom.
8. Respect `prefers-reduced-motion`; there is almost no motion anyway. No parallax.
9. Focus states are visible (`outline: 3px solid var(--color-ink)`, offset 3px; on deep surfaces use white).
10. Never trap scroll horizontally except the section jump row on phones, which must show a clear scroll affordance (edge fade or partially visible last item).

## Responsive behaviour
Single breakpoint at 720px, container-driven flex wrap everywhere else. At 720px and below: header reduces, section padding drops to 64px / 24px, photo slots shrink to 380px min-height, the offset on the second photo is removed, allergen columns stack with top rules, map shrinks to 260px, the bottom bar appears, jump links scroll horizontally, tabs tighten. Test at 360, 390, 430, 768, 1024, 1280, 1536.

## Logos
Two logo files exist on the live site and should be supplied by the owner or fetched by you from the live URLs and committed as optimised SVG/PNG:
- `https://maldonspice.co.uk/wp-content/uploads/2021/06/cropped-maldon_spice_logo_v2_jan2021.png` (arched plate: botanical circle with MALDON SPICE below, white artwork on the blue-grey)
- `https://maldonspice.co.uk/wp-content/uploads/2021/06/cropped-ms_weblogo-2.png` (horizontal lockup, 1709 by 494)
Use the horizontal lockup in the header if it stays legible at 40px height; otherwise keep the typeset wordmark in the header and use the arched mark as the favicon and in the hero. The artwork is white on `#A5BCC4`, so it should sit on the plate colour. Vectorise (trace or request source files) rather than upscaling the PNG. Favicon: the arched botanical mark on `#A5BCC4`, plus `apple-touch-icon` 180px and a 512px manifest icon.
