# Scripts to write (Node `.mjs`, cross-platform)

| Script | Purpose |
|---|---|
| `extract-menu.mjs` | Download the four legacy PDFs, extract with layout, join to the allergy sheet, write `data/menu.generated.json` and `data/menu.review.md` (see docs/06). |
| `audit-images.mjs` | Scan `F:\Work\websiteWork\Maldon Spice`, report dimensions, EXIF orientation, GPS presence, duplicates, and match filenames to `data/images.json`. |
| `process-images.mjs` | Orient, strip metadata, crop by focal point, output AVIF/WebP/JPEG at 480/800/1200/1600. |
| `validate-jsonld.mjs` | Build JSON-LD from `site.json` and `menu.json` and validate shape; fail on `__TODO__`. |
| `check-redirects.mjs` | Read `data/redirects.csv`, request each legacy URL against a base URL, assert status and single-hop final URL. |
| `check-placeholders.mjs` | Fail if built HTML contains square-bracket placeholder text or "lorem". |
| `contrast.mjs` | Compute WCAG ratios for the token pairs in docs/02 and fail below thresholds. |
| `diff-mobi.mjs` | Compare `menu.json` with a Mobi product export if one becomes available. |
| `migrate-heritage.mjs` | Fetch https://maldonspice.co.uk/heritage while it is live, convert the `<article>` to Markdown in `src/content/heritage.md` (keep author and credit lines), list and download the 20 images into the image pipeline, and write `data/heritage.json` image order. Run once, early. |
