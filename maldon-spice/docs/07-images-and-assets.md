# 07. Images and assets

Local image repo: `F:\Work\websiteWork\Maldon Spice` (Windows). Treat it as **read-only source**: never commit originals, never modify them. Process copies into `src/assets/images/` and commit only the optimised outputs plus `data/images.json`.

## Honest assessment of what exists
Sixteen images from the home page and uploads were reviewed visually (plus 20 heritage-page images catalogued from the page, see below) (see `data/images.json` for per-image notes):
- **Four award and mayoral collages** (2560x1053 banners). They are composites of people, so they are not hero material. One panel carries a faint agency watermark. They show identifiable people, including a child in the opening-day group photo, so consent matters.
- **Five WhatsApp interior and exterior photos** (2021, JPEG; only one was measured at 1600x1200, so treat the others as similar until audited). Two are strong table-setting portraits; the dining room and exterior shots carry Christmas decoration; the bar is cluttered with teal LED light.
- **Three food photos** (2021, phone, top-down on white cloth). The mixed grill platter is the best; the chicken and peppers dish is usable; the two-dish shot is cluttered.
- **Three logo files**: arched plate mark and horizontal lockup, both white artwork on blue-grey with a white margin (not transparent).

**Quality verdict:** good enough as interim content for a first launch, not good enough for a premium look. The design depends on photography. Plan a proper shoot (half a day: five to eight plated dishes in natural light, the clay oven in action, the dining room empty and set, the exterior by day, a team portrait of the owners) and swap images in without code changes.

## Provisional slot mapping (interim, until the shoot)
| Slot | Interim image | Notes |
|---|---|---|
| Home hero | none (typographic wordmark) | Keep it typographic even after the shoot, or use one photograph only if it is excellent |
| Home "Our story" portrait | `food-mixed-grill` | Portrait 4:5 crop |
| Home photo pair, left | `food-mixed-grill` crop or `food-chicken-peppers` | Choose different crops so the two do not repeat |
| Home photo pair, right (dining room) | `table-setting-1` | Portrait |
| Menu page header (optional) | `table-setting-2` | Keep small |
| Visit page exterior | `exterior-night` | Christmas decor: flag; replace with a daytime shot |
| Drinks page header (optional) | `bar` (tight crop) | Skip if the crop looks poor |
| Our story page | one panel from `banner-2` or `banner-3` (left) | Only with consent; prefer originals; never the watermarked panel |
| OG image 1200x630 | Wordmark on `#A5BCC4`, plus `food-mixed-grill` if it composes well | Generated at build |
| Favicon, apple-touch, manifest | Arched mark on `#A5BCC4` | Vectorise |

Do not use: `food-two-dishes`, `interior-christmas` (seasonal), the group banner with a child.

## Processing pipeline (`scripts/process-images.mjs`, uses `sharp`)
1. Read `data/images.json`, locate each file in the local repo by filename, and report any missing.
2. Auto-orient from EXIF, then **strip all metadata, including GPS**.
3. Crop to the slot's aspect ratio using a focal point stored in `images.json` (`focus: {x, y}` in 0 to 1), never a blind centre crop.
4. Output AVIF and WebP (and a JPEG fallback) at widths 480, 800, 1200, 1600 (never upscale past the source; 1600x1200 WhatsApp files are soft above 800px wide, so cap their `sizes`).
5. Use Astro's `<Image>` / `<Picture>` with explicit `width`, `height`, `sizes` and `loading="lazy"` (eager only for the LCP image). Aspect-ratio boxes avoid layout shift.
6. Alt text lives in `images.json` (`alt`), reviewed by a human. Describe what is visible: "Mixed grill on a long white plate: samosa, tandoori chicken, king prawns and onion bhaji". Decorative images use `alt=""`.
7. Colour: grade lightly and consistently (neutral white balance, no heavy filters). The brand blue-grey and the green napkins already carry the palette; do not recolour food.
8. Budget: no single image over 200 KB on a phone; hero or LCP image preloaded; total image weight on Home under 600 KB.

## Logos
- Obtain source artwork (SVG/AI) from the designer of the January 2021 logo if possible. Otherwise vectorise the PNG with potrace or equivalent, remove the white margin, and keep two variants: **white artwork on transparent** (for the plate colour) and **ink artwork on transparent** (for white).
- Header: the horizontal lockup if legible at 40px height, `alt="Maldon Spice"`, linked to `/`; otherwise the typeset wordmark.
- White logo artwork on `#A5BCC4` has low contrast (about 2:1). It is a logo so it is exempt from text contrast rules, but never rely on it to convey information: the restaurant name must also exist as real text on the page.
- Favicon set: `favicon.svg`, `favicon.ico` (32), `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, `site.webmanifest` with `theme_color` `#A5BCC4`.

## Rights and consent checklist (before any people photographs go live)
- [ ] Owners confirm consent for themselves and any identifiable staff.
- [ ] Confirm rights for press and media photographs; skip any carrying a watermark.
- [ ] Remove or avoid photographs of children or members of the public.
- [ ] Note photographer credits where required.

## Heritage page images (20 files, catalogued 12 October 2026)
Ids `heritage-*` in `data/images.json`. Findings: **none has alt text**; seven `beeleigh-*` PNGs are small (481 to 640px wide) and soft when enlarged; `URC.jpg` (160x240), `barges-quay.jpg` (300x168) and `brynoth.jpg` (194x259) are tiny and should be replaced with larger originals or dropped; the larger phone photographs (up to 2560px) and the Plume Library, friary garden and river images are the best candidates for the gallery. The legacy credit is "Images courtesy of English Heritage"; some filenames look like phone camera photos, so rights differ per image. Keep the credit line on the page and confirm rights (docs/10). Choose 8 to 10 images for the gallery rather than carrying all 20 over, and keep an ordered list in `images.json`.
