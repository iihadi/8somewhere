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

## The public site

| Page | What's on it |
| --- | --- |
| `/` | Hero, headline stats, "on this day" throwback, three-star list, recent meals, zero-star list |
| `/reviews` | The full archive, filterable by city, rating, badge and cuisine, searchable |
| `/reviews/<slug>` | One review — verdict, your verbatim quote, write-up, dishes, photo/video gallery, map, prev/next |
| `/map` | Every pinned restaurant on one Leaflet/OpenStreetMap map, pins coloured and numbered by rating |
| `/cuisines` | Grouped by what each place actually cooks, most-visited first |
| `/stats` | Rating spread, price spread, meals per year, cuisine and city breakdowns |
| `/timeline` | Every dated visit, scrolling back through the years |
| `/search` | Full-text search across name, verdict, quote, write-up, dishes and tags |
| `/future-destinations` | Booked or planned, not yet visited |
| `/about` | Why the site exists and how the scoring works |
| `/feed.xml` | RSS feed of the 50 most recent reviews |

Press **⌘K** / **Ctrl+K** (or `/`) anywhere on the site to open the
command palette — jump straight to a review or a page, or hit "Surprise
me" for a random one. It's built on the same search index as `/search`.

Every review also generates its own social share card at
`opengraph-image` — a 1200×630 PNG with the name, stars, verdict and
location, rendered on demand by `next/og`. No image files to maintain.

---

## Editing reviews — `/edit`

Sign in at `/edit/login` with `ADMIN_USERNAME` / `ADMIN_PASSWORD`. From
there:

- **`/edit`** — every review, filterable and searchable (see below).
- **`/edit/new`** — add a restaurant. The slug auto-fills from the name
  (editable before saving; fixed afterwards, since the URL depends on it).
- **`/edit/<slug>`** — edit any field, including the 0–3 star rating,
  write-up paragraphs, named dishes, tags, location, photos and videos.
  Photos upload as soon as you pick them; each one takes an optional
  caption (which doubles as its alt text) and can be reordered with
  ← →. The first photo is the cover used on cards and at the top of the
  review. Video clips (`.mp4`/`.mov`) work the same way — a poster frame
  and duration are captured client-side on upload, and the clip plays
  inline in the public gallery's lightbox, after the photos.
- **`/edit/featured`** — drag to reorder the homepage "Three stars" list.
- **`/edit/future-destinations`** — manage the wishlist shown on
  `/future-destinations`.

Saves take effect immediately — every public page reads live data on
each request, so there's no rebuild or cache to wait on. Deleting a
review also deletes its uploaded photos.

Auth is a signed, `httpOnly` session cookie (14 days) — no external auth
service, no user database. See [`lib/auth.ts`](lib/auth.ts) and
[`middleware.ts`](middleware.ts), which gate every `/edit/*` page and
`/api/edit/*` route.

### HEIC/HEIF photos (iPhone)

Photos straight off an iPhone are usually `.heic`, which no browser
renders. The upload route detects them by extension (iOS reports the
MIME type inconsistently) and converts to JPEG server-side via
[`heic-convert`](https://www.npmjs.com/package/heic-convert) — pure
JS/WASM, no native build step, so it runs on Vercel without extra
config. Everything downstream (the gallery, cards, dimension reader)
only ever sees the converted JPEG.

### Video clips

Photos upload through the Next.js server (buffered in memory, then
handed to `lib/storage.ts`) — fine at their 15MB cap, but standard
Vercel serverless functions cap request bodies around ~4.5MB, and video
clips blow past that routinely. So video takes a different path
depending on where it's running:

- **Locally** (no `BLOB_READ_WRITE_TOKEN`), clips go through
  [`/api/edit/upload-video`](app/api/edit/upload-video/route.ts), a
  plain multipart route into `public/uploads/`, same shape as the photo
  route.
- **On Vercel** (Blob configured), the browser uploads straight to Blob
  storage instead, via
  [`/api/edit/upload-video-token`](app/api/edit/upload-video-token/route.ts)
  handing out a short-lived, scoped upload token
  (`@vercel/blob/client`'s `handleUpload`) — the video bytes never pass
  through the Next.js server, so the body-size ceiling doesn't apply.

Either way, width/height/duration are read from the file itself in the
browser (an off-DOM `<video>` element), and a poster frame is grabbed
via `<canvas>` and uploaded through the existing, unmodified photo route
— no server-side video parsing anywhere.

### Location — live lookup via OpenStreetMap

The "Look up on the map" field in the edit form searches
[Nominatim](https://nominatim.org/), OpenStreetMap's free geocoder — no
API key, no billing account, no rate-limit setup. Type a name and city,
pick the right result, and it fills in the address, city, country and
coordinates, plus shows a small map preview so you can confirm the pin
before saving.

Any review with coordinates gets an embedded map and a "Get directions"
link on its public page. Coordinates are entirely optional — leave the
address as free text and skip the lookup if you'd rather.

The lookup is proxied through [`/api/edit/geocode`](app/api/edit/geocode/route.ts)
because Nominatim requires a real identifying `User-Agent` header, which
browsers won't let client-side code set directly. It's gated behind
`/edit` auth like the rest of the admin API. Nominatim's usage policy
asks for roughly one request per second at most — normal typing-speed
searching from a single admin stays well under that.

### Populating restaurant data — "Look up restaurant details"

Typing in cuisine and address by hand for every entry gets old. The
"Look up restaurant details" box (in the review form, and next to any
Future destination that's missing a "kind of restaurant" tag) searches
name + city and fills in whatever's still blank, via
[`/api/edit/enrich`](app/api/edit/enrich/route.ts) — the same free
Nominatim/OpenStreetMap service `/api/edit/geocode` already uses for
addresses, just asked for more (`extratags=1`). OSM restaurant entries
are often tagged with a `cuisine` value, which is enough to auto-fill
"what kind of restaurant is this" without typing it in.

This was the easiest realistic option and needs **no API key at all**:
Yelp Fusion needs a developer sign-up to get a key, and Google Places
wants a billing account on file even to stay inside its free tier.
Nominatim needs neither — same zero-setup story as the rest of this
project. The tradeoff is coverage: not every OSM entry carries a
cuisine tag, and OSM has no price data, so treat it as a head start
rather than a guarantee — the fields it can't find are simply left for
you to fill in by hand.

### The dashboard — filtering and sorting

`/edit` opens on four stat tiles (total, needs attention, no photos, no
map pin) that double as quick filters — click one to jump straight to
just those reviews. Below that: filter by city or by star rating,
free-text search across name/city/cuisine/tags, and sort by most
recent, oldest, rating, name, or "needs attention first".

"Needs attention" means `tier: "unlogged"` or a `needsCheck` note is
set — the same signal the public About page's open-questions count uses.

**Export** buttons in the dashboard header download the whole
collection as JSON (a faithful backup you could re-seed from) or CSV
(opens in Excel/Sheets — UTF-8 BOM included so `£` and accents survive).
Worth doing occasionally: once deployed, your content lives in Vercel
Blob rather than in the repo.

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
  videos: [],                    // populated via /edit uploads
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
  globals.css              Tailwind v4 theme tokens + global CSS
  (site)/                 route group: the public site (has Nav/Footer)
    layout.tsx             fetches stats once, renders Nav + Footer + CommandPalette
    template.tsx            route-enter fade+lift, remounted on every navigation
    loading.tsx             shown while a page's data fetch is in flight
    page.tsx                homepage
    reviews/page.tsx         archive, filterable by city/rating/badge/cuisine, searchable
    reviews/[slug]/           individual review
      opengraph-image.tsx      per-review social share card (next/og)
      share-card/route.tsx      alternate share-card render path
    map/                     all pinned restaurants on one Leaflet map
    cuisines/                grouped by kind of cooking
    stats/                   ratings, prices, years, cuisines, cities
    timeline/                every dated visit, scroll-linked, grouped by year
    search/                  full-text search (also reachable via ⌘K)
    future-destinations/     places not yet visited
    about/                    scoring key + tier counts
  feed.xml/route.ts         RSS feed
  edit/                    the admin UI — outside the (site) group
    layout.tsx              minimal edit-mode header
    loading.tsx              same loading state, edit-mode copy
    login/page.tsx            sign-in form
    page.tsx                 dashboard
    new/page.tsx               create
    [slug]/page.tsx             edit
    featured/                 drag-reorder the homepage "Three stars" list
    future-destinations/       wishlist admin
  api/edit/                protected API routes (see middleware.ts)
    auth/route.ts             login / logout
    reviews/route.ts           create
    reviews/[slug]/route.ts     update / delete
    reviews/reorder/route.ts    featured-rank drag reorder
    reviews/bulk/route.ts       bulk edit from the dashboard
    upload/route.ts            photo upload / delete (converts HEIC)
    upload-video/route.ts       video upload — local dev only (multipart)
    upload-video-token/route.ts video upload — Blob mode (client-direct token handshake)
    geocode/route.ts           OpenStreetMap address search proxy
    enrich/route.ts             "look up restaurant details" auto-fill
    export/route.ts            JSON / CSV backup download
    wishlist/route.ts           wishlist create
    wishlist/[id]/route.ts      wishlist update / delete
  icon.png, apple-icon.png  favicon, from the hand-drawn mark
  sitemap.ts, robots.ts
middleware.ts             guards /edit/* and /api/edit/*
lib/
  auth.ts                  signed session cookies (Web Crypto)
  storage.ts               Blob-or-local persistence, chosen by env
  repo.ts                  review CRUD on top of storage.ts
  derive.ts                stats/sorting/grouping/neighbors, computed at request time
  search.ts                 the matching logic behind /search, ⌘K and the archive filter
  tiers.ts                 verdict tiers and their star counts
  badges.ts                 shorthand verdict badges ("must-visit", …)
  cuisine.ts                 cuisine-family classification
  duplicates.ts              possible-duplicate detection in /edit
  slug.ts                    slug validation/generation
  motion.ts                  usePrefersReducedMotion() + shared easing
  image-size.ts             dependency-free JPEG/PNG/WebP/GIF dimension reader
  shareCard.tsx               share-card rendering shared by both card routes
  photos.ts, format.ts
components/
  edit/                    ReviewForm, PhotoManager, VideoManager, DashboardTable, …
  Brand.tsx                the site name, "somewhere" always italic
  MapView.tsx              Leaflet map (client-only; loads leaflet in an effect)
  BarRow.tsx               one bar in a stats breakdown
  CommandPalette.tsx        ⌘K / Ctrl+K / "/" — jump to a review, a page, or "Surprise me"
  PrevNextNav.tsx            chronological prev/next on a review page
  Timeline.tsx               scroll-linked spine behind /timeline
  LoadingScreen.tsx, Spinner.tsx
  Nav, Hero, ReviewCard, ReviewGrid, Stars, TierBadge, Gallery, …
data/
  seed-reviews.ts          initial content — see "Adding a review by hand"
  reviews.local.json        gitignored — local dev's live store
  wishlist.local.json        gitignored — local dev's wishlist store
public/
  logo-mark.png             the hand-drawn mark, used in the nav
  uploads/                  gitignored — local dev's uploaded photos and videos
```

## Design notes

- Dark only, warm ember/gold accents on near-black — food photos read
  better against warm neutrals than blue-grey ones.
- Fraunces (display) + Inter (body) via `next/font`, self-hosted at build
  time so there's no layout shift and no Google request at runtime.
- Motion: staggered scroll reveals, a shared-layout pill on the nav and
  city filters, a keyed remount that replays the card stagger when the
  grid re-filters, a keyboard-navigable photo/video lightbox, a
  scroll-linked drawing spine on `/timeline`, a cursor-reactive spotlight
  on review cards, a slow-drifting ambient background, and a
  glow-pulse on tier/badge pills on hover.
- Reduced motion: pure-CSS transitions/keyframes collapse via the
  blanket rule in `globals.css`; every Framer Motion component (which
  that rule can't reach, since it's WAAPI-driven rather than
  CSS-transition-driven) checks `usePrefersReducedMotion()` from
  `lib/motion.ts` and either skips its animated `initial` state or
  collapses its `transition` to `duration: 0`. The infinite drifting
  hero tile strip is dropped entirely rather than just sped up. The
  cursor-reactive spotlight is the one exception — real-time pointer
  tracking isn't the kind of automatic motion the setting targets.
