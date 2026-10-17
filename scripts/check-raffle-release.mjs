import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { raffleLaunch } from './raffle-page.mjs';
const landing = await readFile('dist/raffle/index.html', 'utf8');
const rules = await readFile('dist/raffle/rules/index.html', 'utf8');
const redirects = await readFile('dist/_redirects', 'utf8');
assert(raffleLaunch.informationPublished);
assert(landing.includes('<h1>NEO Chosen Cash Raffle</h1>'));
for (const marker of ['cash-checkout-preview', 'data-preview-notes']) assert(!landing.includes(marker));
assert(landing.includes('href="/raffle/rules/"'));
assert(rules.includes('99-1301074'));
assert(rules.includes('U.S. resident'));
assert(!redirects.includes('/raffle/rules/ /raffle/'));
if (!raffleLaunch.salesOpen) {
  assert.equal((landing.match(/disabled>Sales closed/g) || []).length, 3);
  assert(!landing.includes('href="' + raffleLaunch.checkoutUrl + '"'));
  assert(rules.includes('Rules under final review'));
}
for (const page of ['', 'vip-dinner', 'lakewood', 'piano-guys', 'fairlawn', 'chesterland']) {
  const html = await readFile('dist/' + (page ? page + '/' : '') + 'index.html', 'utf8');
  assert(html.includes('id="weekend-raffle-title"'), page + ': raffle feature missing');
  assert(!html.includes('Raffle — Coming Soon'));
}
console.log('Validated raffle information, rules, six promotion placements and accurate closed purchase controls.');
