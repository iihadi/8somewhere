# 8somewhere

A dark-mode restaurant review blog with a live `/edit` interface. Next.js
15 (App Router) · TypeScript · Tailwind v4 · Framer Motion.

Reviews and photos are stored in **Vercel Blob** in production, with an
automatic fallback to local files (`data/reviews.local.json`,
`public/uploads/`) when no Blob token is configured — so `npm run dev`
works immediately with zero cloud setup, and upgrades to Blob storage
automatically once deployed.

---

## What's needed to run and host this

| Thing | Why | Cost |
| --- | --- | --- |
| **Node.js 20+** | To run and build locally | Free |
| **A GitHub account + repo** | Vercel deploys from git | Free |
| **A Vercel account** | Hosting + Blob storage | Free (Hobby tier) |
| **A domain** *(optional)* | `yourname.com` instead of `*.vercel.app` | ~£10/yr |

No separate database. Vercel Blob holds one JSON document (the review
list) plus the uploaded photos — plenty for a single-admin blog with a
few hundred entries.

---

## Running it locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Edit `.env.local` first — at minimum set `ADMIN_USERNAME`,
`ADMIN_PASSWORD`, and `SESSION_SECRET` (generate one with
`openssl rand -hex 32`). Leave `BLOB_READ_WRITE_TOKEN` unset locally;
the app falls back to local files automatically. Then open
<http://localhost:3000> — the site seeds itself from `data/seed-reviews.ts`
on first request.

---

## Editing reviews — `/edit`

Sign in at `/edit/login` with `ADMIN_USERNAME` / `ADMIN_PASSWORD`. From
there:

- **`/edit`** — every review, with Edit / Delete on each row.
- **`/edit/new`** — add a restaurant. The slug auto-fills from the name
  (editable before saving; fixed afterwards, since the URL depends on it).
- **`/edit/<slug>`** — edit any field, including the 0–3 star rating,
  write-up paragraphs, named dishes, tags, and photos (drag a file in,
  it uploads immediately and appears as a thumbnail).

Saves take effect immediately — every public page reads live data on
each request, so there's no rebuild or cache to wait on. Deleting a
review also deletes its uploaded photos.

Auth is a signed, `httpOnly` session cookie (14 days) — no external auth
service, no user database. See [`lib/auth.ts`](lib/auth.ts) and
[`middleware.ts`](middleware.ts), which gate every `/edit/*` page and
`/api/edit/*` route.

### Adding a review by hand instead

You can still add entries directly in
[`data/seed-reviews.ts`](data/seed-reviews.ts) if you'd rather edit code
than use the UI — it's only the *initial* seed, though: once the site
has bootstrapped its live store (Blob or local JSON), further edits
there won't be picked up. Use `/edit` for anything after first deploy.

```ts
{
  slug: "some-restaurant",
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
  photos: [],                    // populated via /edit uploads
  revisited: true,               // optional — shows a "been back" marker
  closed: true,                  // optional
  needsCheck: "Open question",   // optional — renders a "needs filling in" box
}
```

### 0–3 stars, Michelin-style

Verdicts are internally five tiers — `loved` / `liked` / `mixed` /
`avoid` / `unlogged` — defined in [`lib/tiers.ts`](lib/tiers.ts), which
map to a 0–3 star display: `loved` → ★★★, `liked` → ★★, `mixed` → ★,
`avoid` → 0 stars.

`unlogged` is not the same as zero stars — it renders "Not yet rated"
rather than an empty star row, because it's an absence of a verdict,
not a negative one.

---

## Deploying to Vercel

```bash
git init
git add -A
git commit -m "Initial commit"
gh repo create 8somewhere --private --source=. --push
```

Then:

1. Go to <https://vercel.com/new> and import the repo. Framework
   preset: **Next.js** — leave everything else default.
2. **Before the first deploy**, add a Blob store: Project → Storage →
   Create Database → **Blob**. Connecting it injects
   `BLOB_READ_WRITE_TOKEN` into your project's environment automatically
   — you don't set this one by hand.
3. Add the remaining environment variables under Project → Settings →
   Environment Variables:

   | Variable | Value |
   | --- | --- |
   | `ADMIN_USERNAME` | whatever you want to log in with |
   | `ADMIN_PASSWORD` | a real password, not the example one |
   | `SESSION_SECRET` | output of `openssl rand -hex 32` |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-actual-domain.com` (optional but recommended) |

4. Deploy.

After that, every `git push` to `main` redeploys, and `/edit` writes
straight to the linked Blob store — content survives redeploys, unlike
files baked into the build.

`NEXT_PUBLIC_SITE_URL` feeds `sitemap.ts`, `robots.ts`, and
`metadataBase` in [`app/layout.tsx`](app/layout.tsx) for correct social
share previews; harmless to leave unset until you have a domain.

### Custom domain

Vercel → Project → Settings → Domains → Add. Point your registrar's
nameservers or add the CNAME Vercel shows you. HTTPS is automatic.

### A note on hosting cost

Public pages are server-rendered on every request now (not static),
because content can change at any time via `/edit`. That trades away
pure-static hosting for live edits — still comfortably inside Vercel's
Hobby tier for personal-blog traffic, just not literally free of
serverless invocations the way the original static version was.

---

## Project structure

```
app/
  layout.tsx              root shell — fonts, metadata, no Nav/Footer
  (site)/                 route group: the public site (has Nav/Footer)
    layout.tsx             fetches stats once, renders Nav + Footer
    page.tsx                homepage
    reviews/page.tsx         archive, filterable by city and rating
    reviews/[slug]/           individual review
    wishlist/                places not yet visited (static, not editable)
    about/                    scoring key + tier counts
  edit/                    the admin UI — outside the (site) group
    layout.tsx              minimal edit-mode header
    login/page.tsx            sign-in form
    page.tsx                 dashboard
    new/page.tsx               create
    [slug]/page.tsx             edit
  api/edit/                protected API routes (see middleware.ts)
    auth/route.ts             login / logout
    reviews/route.ts           create
    reviews/[slug]/route.ts     update / delete
    upload/route.ts            photo upload / delete
  icon.png, apple-icon.png  favicon, from the hand-drawn mark
  sitemap.ts, robots.ts
middleware.ts             guards /edit/* and /api/edit/*
lib/
  auth.ts                  signed session cookies (Web Crypto)
  storage.ts               Blob-or-local persistence, chosen by env
  repo.ts                  review CRUD on top of storage.ts
  derive.ts                stats/sorting/filtering, computed at request time
  tiers.ts                 verdict tiers and their star counts
  image-size.ts             dependency-free JPEG/PNG/WebP/GIF dimension reader
  photos.ts, format.ts
components/
  edit/                    ReviewForm, LogoutButton, DeleteReviewButton
  Nav, Hero, ReviewCard, ReviewGrid, Stars, TierBadge, Gallery, …
data/
  seed-reviews.ts          initial content — see "Adding a review by hand"
  reviews.local.json        gitignored — local dev's live store
public/
  logo-mark.png             the hand-drawn mark, used in the nav
  uploads/                  gitignored — local dev's uploaded photos
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
