// Validates data/menu.json before every build (docs/06). Fails on unknown allergen codes, missing
// prices, duplicate ids, inconsistent allergen status, and, in production, any unreviewed item.
// Previews: set ALLOW_UNREVIEWED=1 (npm run build:preview does this) to allow unreviewed data.

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const menu = JSON.parse(await readFile(join(root, 'data', 'menu.json'), 'utf8'));
const allowUnreviewed = process.env.ALLOW_UNREVIEWED === '1';

const STATUSES = new Set(['listed', 'not-on-allergy-sheet', 'needs-check', 'not-applicable']);
const DIETARY = new Set(['vegetarian', 'vegan', 'dairy-free']);
const codes = new Set(Object.keys(menu.legend ?? {}));
const errors = [];
const ids = new Set();
let unreviewed = 0;
let total = 0;

for (const m of menu.menus ?? []) {
  for (const s of m.sections ?? []) {
    if (!s.id || !s.title) errors.push(`${m.id}: section without id or title`);
    for (const i of s.items ?? []) {
      total++;
      const where = `${m.id} > ${s.id} > ${i.id ?? i.name}`;
      if (!i.id) errors.push(`${where}: missing id`);
      else if (ids.has(i.id)) errors.push(`${where}: duplicate id "${i.id}"`);
      ids.add(i.id);
      if (!i.name) errors.push(`${where}: missing name`);
      if (!Array.isArray(i.prices) || i.prices.length === 0) errors.push(`${where}: no prices`);
      for (const p of i.prices ?? []) {
        if (typeof p.amount !== 'number' || !(p.amount > 0)) errors.push(`${where}: bad price ${JSON.stringify(p)}`);
      }
      if (!STATUSES.has(i.allergenStatus)) errors.push(`${where}: unknown allergenStatus "${i.allergenStatus}"`);
      if (i.allergenStatus === 'listed') {
        if (!Array.isArray(i.allergens)) errors.push(`${where}: status "listed" needs an allergens array`);
      } else if (i.allergens !== null && i.allergens !== undefined && i.allergenStatus !== 'not-applicable') {
        errors.push(`${where}: allergens given but status is "${i.allergenStatus}" (use "listed")`);
      }
      for (const c of i.allergens ?? []) {
        if (!codes.has(c)) errors.push(`${where}: unknown allergen code "${c}" (add it to legend first)`);
      }
      for (const d of i.dietary ?? []) {
        if (!DIETARY.has(d)) errors.push(`${where}: unknown dietary value "${d}"`);
      }
      if (i.reviewed !== true) unreviewed++;
    }
  }
}

if (unreviewed && !allowUnreviewed) {
  errors.push(
    `${unreviewed} of ${total} items have "reviewed": false. The kitchen must check allergens and prices ` +
      'before a production build. For a preview, run: npm run build:preview',
  );
}

if (errors.length) {
  console.error(`menu.json check FAILED (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(
  `menu.json OK: ${total} items${unreviewed ? `, ${unreviewed} unreviewed (allowed for preview only)` : ''}.`,
);
