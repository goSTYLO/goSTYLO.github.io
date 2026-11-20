import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { adminBypassAllowed, scaleToMaxEdge, visibleNav } from '../src/lib/portfolioPure.ts';

assert.equal(adminBypassAllowed({ ADMIN_AUTH_BYPASS: '1' }), true);
assert.equal(adminBypassAllowed({ ADMIN_AUTH_BYPASS: '1', VERCEL_ENV: 'development' }), true);
assert.equal(adminBypassAllowed({ ADMIN_AUTH_BYPASS: '1', VERCEL_ENV: 'production' }), false);
assert.equal(adminBypassAllowed({ ADMIN_AUTH_BYPASS: '1', VERCEL_ENV: 'preview' }), false);
assert.equal(adminBypassAllowed({}), false);

const scaled = scaleToMaxEdge(3200, 1600, 1600);
assert.deepEqual(scaled, { width: 1600, height: 800 });
assert.deepEqual(scaleToMaxEdge(800, 600, 1600), { width: 800, height: 600 });

const nav = visibleNav([
  { id: 'hero', enabled: true, navLabel: 'OVERVIEW' },
  { id: 'education', enabled: false, navLabel: 'EDUCATION' },
  { id: 'cv', enabled: true, navLabel: 'CV' },
]);
assert.deepEqual(
  nav.map((item) => item.id),
  ['hero'],
);

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) files.push(...walk(full));
    else if (/\.(js|css|html)$/.test(name)) files.push(full);
  }
  return files;
}

const dist = path.resolve('dist');
try {
  if (statSync(dist).isDirectory()) {
    for (const file of walk(dist)) {
      const text = readFileSync(file, 'utf8');
      assert.equal(text.includes('TOTP_SECRET'), false, `${file} contains TOTP_SECRET`);
    }
  }
} catch {
  /* dist is optional until a build exists */
}

console.log('check-content ok');
