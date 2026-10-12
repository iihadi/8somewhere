// Downloads the heritage photographs from the legacy WordPress site into src/assets/heritage/.
// Run once on your own computer while https://maldonspice.co.uk/heritage is still online:
//
//   npm run migrate:heritage
//
// The article text is already in src/content/heritage.md. Astro resizes and converts the images at
// build time, so the originals here are only the source for that (and are kept small by the build).
// Cross-platform: plain Node 22, no shell commands.

import { mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'src', 'assets', 'heritage');
const images = JSON.parse(await readFile(join(root, 'data', 'images.json'), 'utf8')).images.filter(
  (i) => i.kind === 'heritage',
);

await mkdir(outDir, { recursive: true });

let ok = 0;
const failed = [];
for (const img of images) {
  const name = img.url.split('/').pop();
  const target = join(outDir, name);
  try {
    await stat(target);
    console.log(`skip  ${name} (already downloaded)`);
    ok++;
    continue;
  } catch {
    // not downloaded yet
  }
  try {
    const res = await fetch(img.url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(target, buf);
    console.log(`saved ${name} (${Math.round(buf.length / 1024)} KB)`);
    ok++;
  } catch (err) {
    failed.push(`${name}: ${err.message}`);
    console.error(`FAIL  ${name}: ${err.message}`);
  }
}

console.log(`\n${ok} of ${images.length} heritage images in src/assets/heritage/.`);
if (failed.length) {
  console.log('Failed (download these by hand from the legacy site if you can):');
  for (const f of failed) console.log(`  ${f}`);
  process.exitCode = 1;
}
console.log('Gallery order and alt text: data/heritage.json (gallery) and data/images.json (alt).');
