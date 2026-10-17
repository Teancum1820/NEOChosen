import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderRaffleLanding, raffleLaunch } from '../scripts/raffle-page.mjs';
const source = await readFile('source-assets/raffle-preview/public-launch.html', 'utf8');
test('public page accurately closes all three package controls', () => {
  const page = renderRaffleLanding(source, raffleLaunch, new Date('2026-10-16T23:50:00Z'));
  assert.equal((page.match(/disabled>Sales closed/g) || []).length, 3);
  for (const marker of ['cash-checkout-preview', 'data-preview-notes', 'public-launch.js']) assert(!page.includes(marker));
  assert(!page.includes('href="' + raffleLaunch.checkoutUrl + '"'));
  assert(page.includes('href="/raffle/rules/"'));
});
test('checkout refuses unresolved rules; final release connects all packages to existing campaign', () => {
  assert.throws(() => renderRaffleLanding(source, { ...raffleLaunch, salesOpen: true }), /Finalize/);
  const page = renderRaffleLanding(source, { ...raffleLaunch, salesOpen: true, rulesFinalized: true }, new Date('2026-10-16T23:50:00Z'));
  assert.equal(page.split('href="' + raffleLaunch.checkoutUrl + '"').length - 1, 3);
  assert(!page.includes('disabled>Sales closed'));
  for (const count of [1, 3, 7]) assert(page.includes(`Get ${count} ticket`));
});
test('built purchase links close at exact cutoff and refuse alternate campaigns', () => {
  const page = renderRaffleLanding(source, { ...raffleLaunch, salesOpen: true, rulesFinalized: true }, new Date('2026-11-15T22:00:00Z'));
  assert.equal((page.match(/disabled>Sales closed/g) || []).length, 3);
  assert.throws(() => renderRaffleLanding(source, { ...raffleLaunch, checkoutUrl: 'https://example.com' }), /Unexpected/);
});
