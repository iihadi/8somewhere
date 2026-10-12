# 04. SEO, schema, redirects, local search

Canonical host: `https://maldonspice.co.uk` (no www; legacy canonical is the same). `en-GB` everywhere. Trailing slashes. One H1 per page.

## Titles and meta descriptions
Lengths in brackets (titles under 60, descriptions under 160). Source of truth: `seo/meta.json`. The heritage description is written from the live page (checked 12 October 2026).

| URL | Title | Meta description |
|---|---|---|
| `/` | Maldon Spice | Indian Restaurant in Maldon, Essex (49) | Indian restaurant on Maldon High Street. Clay-oven tandoori grills, vegan and dairy-free options and a full allergen guide. Open Tuesday to Sunday, 5pm to 10pm. (160) |
| `/menu/` | Menu | Maldon Spice, Indian Restaurant in Maldon (48) | Starters, tandoori grills, biryani and sides at Maldon Spice, with allergens beside every dish. Filter by allergen, or see the dairy-free and drinks menus. (155) |
| `/menu/dairy-free/` | Dairy-Free Menu | Maldon Spice, Maldon (38) | A dedicated dairy-free Indian menu at Maldon Spice. Served Sunday, Tuesday, Wednesday and Thursday for pre-booked tables; pre-order on Friday and Saturday. (155) |
| `/menu/drinks/` | Drinks and Wine List | Maldon Spice, Maldon (43) | Wines by the glass and bottle, Cobra and Maldon Gold, cocktails and non-alcoholic drinks at Maldon Spice on Maldon High Street. (127) |
| `/allergens/` | Allergen Guide | Maldon Spice, Maldon, Essex (44) | How Maldon Spice handles allergens: dish-by-dish allergen codes, a filter on the menu, dairy-free dishes and how to tell us before you book or order. (149) |
| `/visit/` | Visit, Opening Hours and Parking | Maldon Spice, Maldon (55) | Maldon Spice, 111 High Street, Maldon CM9 5BS. Open Tuesday to Sunday, 5pm to 10pm. Parking reimbursed at Butt Lane Car Park. Reserve or order for collection. (158) |
| `/our-story/` | Our Story | Maldon Spice, Maldon, Essex (39) | Maldon Spice is run by Jhual and Shamema, restaurateurs with over thirty years of experience. Euro Asia Curry Award 2022 winners. (129) |
| `/heritage/` | Maldon Town History | Maldon Spice (34) | A short history of Maldon, from the Bronze Age hill and the Battle of Maldon to the Plume Library, the canal and the railway, by Stephen Nunn. (142) |
| `/privacy/` | Privacy and Cookies | Maldon Spice (34) | How Maldon Spice handles personal data and cookies on this website. (67) |

Avoid unprovable superlatives in titles ("best", "No.1"). The legacy meta description is a keyword list; do not reproduce it.

## Page-level requirements
- Unique `<title>`, meta description, canonical, `og:title`, `og:description`, `og:image` (1200x630), `og:locale=en_GB`, `twitter:card=summary_large_image`.
- `og:image`: a designed 1200x630 image (wordmark on `#A5BCC4`, plus a real food photograph if a good one exists). Generate at build time into `public/og/`.
- Real H1s: Home "Maldon Spice" with the visible italic line as a paragraph; Menu "Main menu"; and so on. Do not use "Homepage".
- Alt text on every meaningful image; empty `alt=""` for decorative. Describe the content, no "image of".
- `<html lang="en-GB">`. `theme-color` `#A5BCC4`.
- Internal links use descriptive text ("Dairy-free menu", not "click here").
- Preview and staging deployments send `X-Robots-Tag: noindex, nofollow` and a disallow-all robots. Production does not.

## Structured data (JSON-LD, generated from `data/site.json` and `data/menu.json`)
Template: `seo/jsonld/restaurant.template.json`. Rules:
- Home, Visit, Our story: `Restaurant` (with `address`, `telephone`, `openingHoursSpecification`, `servesCuisine: "Indian"`, `acceptsReservations: true`, `hasMenu`, `sameAs`, `award`, `image`, `url`, `geo` once known). Add `priceRange` only once the owner confirms (for example `££`).
- Menu pages: `Menu` > `MenuSection` > `MenuItem` with `name`, `description`, `offers` (`Offer` with `price`, `priceCurrency: GBP`). Add `suitableForDiet` (`https://schema.org/VeganDiet`, etc.) **only** for dishes explicitly confirmed. Never emit allergen claims in structured data.
- `BreadcrumbList` on every page except Home. `WebSite` on Home.
- Heritage page: `Article` with `headline: "Maldon Through Time"`, `author` `Person` Stephen Nunn, `publisher` the Restaurant `@id`, `about` the place Maldon, `image` the lead photograph. Do not invent `datePublished`; omit it unless the owner knows it.
- Opening hours must come from `site.json` and match Google Business Profile exactly. Special closures use `openingHoursSpecification` with `validFrom`/`validThrough` and zero hours.
- Validate with Google Rich Results Test and validator.schema.org before launch. Run on every build via `scripts/validate-jsonld.mjs`.

## Sitemap and robots
- `@astrojs/sitemap`, `lastmod` from git or content dates. Exclude `/404`.
- `public/robots.txt` (see `seo/robots.txt`). Submit `https://maldonspice.co.uk/sitemap-index.xml` in Search Console.

## Redirects (critical)
`data/redirects.csv` is the starting map; `data/_redirects` is the Cloudflare Pages format. Before launch, **crawl the live site** to catch everything (sitemap at `/sitemap.xml` or `/wp-sitemap.xml`, then a spider crawl) and add every legacy URL, including image and PDF URLs that Google has indexed. Rules:
- 301 each legacy URL to the closest new equivalent (not to the homepage unless there is truly no match).
- `/menus` becomes `/menu/`. The four legacy menu PDFs redirect to their new HTML pages (they are in the CSV).
- Keep `/heritage/` as is.
- Return 404 or 410 for `wp-admin`, `wp-login.php`, `wp-json`, `xmlrpc.php`, feeds and author archives. Tell the family WordPress admin will disappear.
- After deploy, run `scripts/check-redirects.mjs` against the full legacy list: every row must return the expected status and final URL in one hop.

## Google Business Profile (do alongside launch; not code)
- Website link: `https://maldonspice.co.uk/`. Menu link: `/menu/`. Appointment/Reserve link: the Mobi booking URL. Order link: the Mobi order URL. Add the dairy-free and vegan attributes if offered.
- Hours must match `site.json`. Add special hours for any closures. Upload new photos (the ones chosen in `docs/07`). Reply to reviews. Ask for fresh reviews at the table (QR to the review link).
- Mobi advertises Google reservations integration; ask Mobi whether bookings can appear in Search and Maps.
- Keep name, address and phone identical across the site, GBP, Facebook, Instagram, Mobi pages and directories (Tripadvisor, Yell, Apple Business Connect, Bing Places).

## Target queries and where they land
- "Indian restaurant Maldon", "curry house Maldon", "Indian restaurant Essex": Home, Visit, Menu.
- "dairy free Indian Maldon", "vegan Indian Maldon": `/menu/dairy-free/`, `/allergens/`, Menu vegan section. Include natural-language mentions of "vegan" and "dairy-free" in copy where true, once data confirms which dishes are vegan.
- "Indian takeaway Maldon", "collection": Home, Visit (collection only; no delivery claims).
- "Maldon history", "history of Maldon", "Battle of Maldon", "Plume Library": `/heritage/` (keep the URL; it is a genuine content asset: about 700 words, 20 photographs, a named author). Add alt text, subheadings (with the author's approval), the key-dates list and links to Visit and Menu.
Do not stuff keywords. Write for people first.

## Analytics and consent
- Use **cookieless** analytics (Cloudflare Web Analytics or Plausible). No Google Analytics, no Meta pixel, no tag manager. This means no cookie banner is needed for analytics.
- Load nothing third-party on page load: no fonts from Google (self-host), no map embed (click-to-load), no social feeds, no reviews widget.
- If Mobi pages set cookies, that is Mobi's responsibility; mention it in `/privacy/`.
- Search Console and Bing Webmaster: verify via DNS TXT at IONOS or via a file in `public/`.

## Performance as SEO
Core Web Vitals budgets are in `docs/09`. A fast static site is the main ranking win over the legacy install.

## Post-launch checks (week 1, week 4)
Search Console coverage and index status, redirect errors, queries and impressions, mobile usability, structured data reports, GBP insights (calls, direction requests, website clicks, bookings).
