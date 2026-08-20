# 8somewhere

A dark-mode restaurant review blog. Next.js 15 (App Router) · TypeScript ·
Tailwind v4 · Framer Motion. No database, no CMS — reviews live in one
typed file you edit by hand.

---

## What's needed to run and host this

| Thing | Why | Cost |
| --- | --- | --- |
| **Node.js 20+** | To run and build locally | Free |
| **A GitHub account + repo** | Vercel deploys from git | Free |
| **A Vercel account** | Hosting | Free (Hobby tier) |
| **A domain** *(optional)* | `yourname.com` instead of `*.vercel.app` | ~£10/yr |

Nothing else. No database, no image CDN, no serverless functions — every
page is statically generated at build time, which is exactly what the
Vercel free tier is best at.

---

## Running it locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

---

## Adding a review

Everything is in [`data/reviews.ts`](data/reviews.ts). Copy an existing
object in the `reviews` array and edit it:

```ts
{
  slug: "some-restaurant",       // URL + photo folder name
  name: "Some Restaurant",
  city: "London",
  country: "UK",
  address: "1 Example Street, London",   // null if never logged
  cuisine: "Japanese",
  visitedAt: "2026-09-01T19:30:00+01:00", // or "2026-09-01", or null
  price: "£££",                  // or null
  tier: "liked",                 // loved | liked | mixed | avoid | unlogged
  quote: "What I actually said about it.",  // verbatim, or null
  verdict: "One line for the card.",
  dishes: [{ name: "…", note: "…" }],       // only dishes you actually named
  body: ["Paragraph one.", "Paragraph two."],
  tags: ["dinner"],
  revisited: true,               // optional — shows a "been back" marker
  closed: true,                  // optional
  needsCheck: "Open question",   // optional — renders a "needs filling in" box
}
```

The homepage stats, tier counts, filters, city list, sitemap and "more
from this city" sections all derive from this array.

### 0–3 stars, Michelin-style

Verdicts are internally five tiers — `loved` / `liked` / `mixed` /
`avoid` / `unlogged` — defined in [`lib/tiers.ts`](lib/tiers.ts), which
map to a 0–3 star display via the `stars` field on each tier:
`loved` → ★★★, `liked` → ★★, `mixed` → ★, `avoid` → 0 stars.

`unlogged` is not the same as zero stars — it renders "Not yet rated"
rather than an empty star row, because it's an absence of a verdict,
not a negative one. Keep that distinction when adding entries: only use
`avoid` if a verdict was actually given.

### Where the content came from

Seeded from the Verdict Ledger (`dining-project-brief.md` +
`restaurant_verdicts_to_fill.csv`), cross-referenced against Google
Calendar bookings and Gmail reservation history.

- `quote` is **verbatim** — the diner's own words, lightly cleaned from
  shorthand. Displayed on the review page under "In my own words".
- `body` is written around that quote and adds **no** sensory detail the
  ledger didn't contain.
- `dishes` is only populated where a dish was actually named. Most
  entries have an empty array, and that's correct.
- Four entries are `tier: "unlogged"` — visited, never written up. They
  carry a `needsCheck` note rather than invented copy.

## Adding photos

1. Export the meal's photos from Google Photos (album → ⋮ → Download).
2. Drop them in `public/photos/<slug>/`, matching the review's `slug`.
   Name the hero shot `00-cover.jpg` — the first file alphabetically
   becomes the card image.
3. Run:

```bash
npm run photos
```

That regenerates `data/photos.json`. Any review without a photo folder
falls back to a generated gradient tile, so the site never looks broken.

Resize anything over ~2500px wide before committing — Vercel's free tier
has a soft 1 GB repo limit and phone JPEGs are big.

---

## Deploying to Vercel

```bash
git init
git add -A
git commit -m "Initial commit"
gh repo create review-blog --private --source=. --push
```

Then:

1. Go to <https://vercel.com/new> and import the repo.
2. Framework preset: **Next.js**. Everything else: leave default.
3. Deploy. First build takes ~1 minute.

After that, every `git push` to `main` deploys automatically, and every
pull request gets its own preview URL.

### One environment variable (optional but recommended)

In Vercel → Project → Settings → Environment Variables:

```
NEXT_PUBLIC_SITE_URL = https://your-actual-domain.com
```

This is used by `sitemap.ts` and `robots.ts`. Also update
`metadataBase` in [`app/layout.tsx`](app/layout.tsx) to the same URL so
social share previews resolve correctly.

### Custom domain

Vercel → Project → Settings → Domains → Add. Point your registrar's
nameservers or add the CNAME Vercel shows you. HTTPS is automatic.

---

## Project structure

```
app/
  layout.tsx           root shell, fonts, metadata
  icon.png              favicon (from the hand-drawn mark)
  apple-icon.png         iOS home-screen icon
  page.tsx             homepage — hero, stats, three stars, recent, zero stars
  globals.css          theme tokens, grain, ambient glow
  reviews/page.tsx     archive, filterable by city and rating
  reviews/[slug]/      individual review (statically generated)
  wishlist/            places not yet visited
  about/               scoring key + tier counts
components/            Nav, Hero, ReviewCard, ReviewGrid, Stars, TierBadge, Gallery, …
data/reviews.ts        ← all content lives here
data/photos.json       generated — do not edit by hand
lib/tiers.ts           verdict tiers, their star counts and colours
lib/                   date formatting, photo lookup
scripts/sync-photos.mjs
public/logo-mark.png   the hand-drawn mark, used in the nav
public/photos/<slug>/  your images
```

## Design notes

- Dark only, warm ember/gold accents on near-black — food photos read
  better against warm neutrals than blue-grey ones.
- Fraunces (display) + Inter (body) via `next/font`, self-hosted at build
  time so there's no layout shift and no Google request at runtime.
- Motion: staggered scroll reveals, a shared-layout pill on the nav and
  city filters, a keyed remount that replays the card stagger when the
  grid re-filters, and a keyboard-navigable lightbox. All of it is
  disabled under `prefers-reduced-motion`.
