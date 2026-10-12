// Fails if built HTML contains square-bracket placeholder text, "lorem", "TODO" or the Wi-Fi password
// line from the legacy menu. Runs after every build.

import { readdir, readFile } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');

async function* html(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* html(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

const patterns = [
  { re: /\[(Photograph|Map|Article|A recent guest|Domain email|owner)[^\]]*\]/i, why: 'placeholder in brackets' },
  { re: /lorem ipsum/i, why: 'lorem ipsum' },
  { re: /__TODO__/, why: '__TODO__ marker' },
  { re: /wi-?fi\s*(password|code)/i, why: 'Wi-Fi password' },
];

const problems = [];
for await (const file of html(dist)) {
  // Strip scripts and JSON-LD so only visible text and attributes are checked.
  const text = (await readFile(file, 'utf8')).replace(/<script[\s\S]*?<\/script>/g, '');
  for (const { re, why } of patterns) {
    const m = text.match(re);
    if (m) problems.push(`${relative(dist, file)}: ${why}: "${m[0].slice(0, 80)}"`);
  }
}

if (problems.length) {
  console.error('Placeholder check FAILED:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log('Placeholder check OK.');
