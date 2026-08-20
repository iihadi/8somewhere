# Ate Somewhere

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

> **Node is not currently installed on this machine.** Get it from
> <https://nodejs.org> (LTS), or `winget install OpenJS.NodeJS.LTS`.

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
  address: "1 Example Street, London",
  cuisine: "Japanese",
  visitedAt: "2026-09-01T19:30:00+01:00",
  price: "£££",
  rating: 8.5,                   // out of 10
  verdict: "One line for the card.",
  dishes: [{ name: "…", note: "…" }],
  body: ["Paragraph one.", "Paragraph two."],
  tags: ["dinner"],
  draft: false,                  // true shows a "Draft" badge
}
```

The homepage stats, filters, city lists, sitemap and "more from this
city" sections all derive from this array — nothing else to update.

### About the `draft` flag

**Every review currently in the file is `draft: true`.** The restaurants,
dates, times and addresses are real (pulled from your Google Calendar
bookings), but the prose, dish notes and ratings are placeholder text
written to fill the design out. Rewrite each one in your own words and
set `draft: false` to remove the badge.

---

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
  page.tsx             homepage — hero, stats, recent, leaderboard
  globals.css          theme tokens, grain, ambient glow
  reviews/page.tsx     filterable archive
  reviews/[slug]/      individual review (statically generated)
  wishlist/            places not yet visited
  about/               scoring key
components/            Nav, Hero, ReviewCard, ReviewGrid, Gallery, …
data/reviews.ts        ← all content lives here
data/photos.json       generated — do not edit by hand
lib/                   date formatting, photo lookup
scripts/sync-photos.mjs
public/photos/<slug>/  your images
```

## Design notes

- Dark only, warm ember/gold accents on near-black — food photos read
  better against warm neutrals than blue-grey ones.
- Fraunces (display) + Inter (body) via `next/font`, self-hosted at build
  time so there's no layout shift and no Google request at runtime.
- Motion: staggered scroll reveals, a shared-layout pill on the nav and
  city filters, `layout` animations when the grid re-filters, and a
  keyboard-navigable lightbox. All of it is disabled under
  `prefers-reduced-motion`.
