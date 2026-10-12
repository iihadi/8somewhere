// Interim favicon, touch icons and the 1200x630 share image, typeset on the brand blue-grey.
// Replace with the vectorised arched logo once the source artwork is supplied (docs/07).
// Run: node scripts/make-icons.mjs   (outputs to public/; commit the results)

import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const PRIMARY = '#A5BCC4';
const INK = '#1B2A33';
const serif = "'Bodoni Moda', 'Didot', 'Bodoni 72', Georgia, 'DejaVu Serif', serif";

const mark = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
  <rect width="64" height="64" fill="${PRIMARY}"/>
  <text x="32" y="43" text-anchor="middle" font-family="${serif}" font-size="30" letter-spacing="1" fill="${INK}">MS</text>
</svg>`;

await writeFile(join(pub, 'favicon.svg'), mark(64));
for (const [name, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  await sharp(Buffer.from(mark(size))).png().toFile(join(pub, name));
}
await sharp(Buffer.from(mark(32))).resize(32, 32).png().toFile(join(pub, 'favicon-32.png'));

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="${PRIMARY}"/>
  <text x="600" y="300" text-anchor="middle" font-family="${serif}" font-size="120" letter-spacing="24" fill="${INK}">MALDON</text>
  <text x="600" y="390" text-anchor="middle" font-family="${serif}" font-style="italic" font-size="72" fill="${INK}">Spice</text>
  <text x="600" y="500" text-anchor="middle" font-family="${serif}" font-style="italic" font-size="34" fill="${INK}">Indian restaurant on Maldon High Street</text>
</svg>`;
await sharp(Buffer.from(og)).jpeg({ quality: 86 }).toFile(join(pub, 'og', 'home-1200x630.jpg'));

await writeFile(
  join(pub, 'site.webmanifest'),
  JSON.stringify(
    {
      name: 'Maldon Spice',
      short_name: 'Maldon Spice',
      start_url: '/',
      display: 'browser',
      background_color: '#FFFFFF',
      theme_color: PRIMARY,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  ) + '\n',
);
console.log('Icons and share image written to public/.');
