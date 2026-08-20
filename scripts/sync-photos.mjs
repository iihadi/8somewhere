#!/usr/bin/env node
/**
 * Scans public/photos/<slug>/ and regenerates data/photos.json.
 *
 *   1. Export the meal's photos out of Google Photos
 *   2. Drop them in public/photos/<review-slug>/
 *   3. npm run photos
 *
 * The first file alphabetically becomes the cover image, so name the
 * hero shot something like 00-cover.jpg.
 */
import { readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const PHOTOS_DIR = join(ROOT, "public", "photos");
const OUT = join(ROOT, "data", "photos.json");
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

if (!existsSync(PHOTOS_DIR)) {
  console.error("No public/photos directory — nothing to do.");
  process.exit(0);
}

const manifest = {};
let count = 0;

for (const slug of readdirSync(PHOTOS_DIR)) {
  const dir = join(PHOTOS_DIR, slug);
  if (!statSync(dir).isDirectory()) continue;

  const files = readdirSync(dir)
    .filter((f) => EXT.has(extname(f).toLowerCase()))
    .sort();

  if (!files.length) continue;

  manifest[slug] = files.map((f) => ({
    src: `/photos/${slug}/${f}`,
    // next/image needs intrinsic dimensions up front. These are safe
    // defaults; the CSS crops to a fixed aspect ratio anyway.
    width: 1600,
    height: 1200,
  }));
  count += files.length;
}

writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `Wrote ${OUT} — ${Object.keys(manifest).length} restaurant(s), ${count} photo(s).`
);
