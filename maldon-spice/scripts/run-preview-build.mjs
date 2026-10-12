// Preview build: allows unreviewed allergen data, adds the DRAFT banner and noindex on every page.
// Works the same on Windows, macOS and Linux (no inline env-var syntax needed).

import { spawnSync } from 'node:child_process';

const env = { ...process.env, ALLOW_UNREVIEWED: '1' };
const run = (args) => {
  const r = spawnSync('npm', args, { stdio: 'inherit', env, shell: process.platform === 'win32' });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
run(['run', 'build']);
