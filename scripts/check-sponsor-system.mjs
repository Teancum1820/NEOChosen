import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { sponsors } from './sponsor-system.mjs';

const root = new URL('../dist/', import.meta.url);
const page = async route => readFile(new URL(route, root), 'utf8');
const home = await page('index.html');
const directory = await page('sponsors/index.html');
const media = await page('media-kit/index.html');
const akron = await page('piano-guys/index.html');
const fairlawn = await page('fairlawn/index.html');
const thanks = await page('thank-you/fairlawn/index.html');
const byId = id => sponsors.find(s => s.id === id);

assert.equal(byId('great-lakes-auto-group').tier, 'weekend-presenting');
assert.deepEqual(byId('fna').events, ['akron', 'fairlawn']);
assert.deepEqual(byId('advanced-care').events, ['fairlawn']);
assert.equal(byId('barons-bus').tier, 'platinum');
assert.ok(sponsors.filter(s => s.tier === 'community').length > 0);
assert.ok(directory.indexOf('Weekend Presenting Sponsor') < directory.indexOf('Event Presenting Sponsors'));
assert.ok(directory.indexOf('Event Presenting Sponsors') < directory.indexOf('Platinum Sponsor'));
assert.ok(directory.indexOf('Platinum Sponsor') < directory.indexOf('Community Partners'));
assert.match(home, /NEO CHOSEN WEEKEND PRESENTING SPONSOR/);
for (const document of [home, directory, media, akron, fairlawn, thanks]) {
  assert.doesNotMatch(document, /<!-- (?:EVENT_SPONSORS|WEEKEND_PRESENTING_CREDIT|PRESENTING_SPONSOR_RIBBON)/);
}
for (const document of [home, directory, media, fairlawn]) {
  assert.match(document, /FNA Wealth Management/);
  assert.match(document, /Advanced Care Endodontics/);
}
assert.match(thanks, /Fairlawn Meet &amp; Greet Presenting Sponsors/);
assert.match(akron, /The Piano Guys Concert Presenting Sponsor/);
assert.doesNotMatch(akron, /data-sponsor-event="fairlawn"/);
assert.match(fairlawn, /data-sponsor-event="fairlawn"/);
assert.doesNotMatch(fairlawn, /data-sponsor-event="akron"/);
for (const s of sponsors) {
  assert.match(directory, new RegExp(`data-sponsor="${s.id}"`));
  assert.ok(directory.includes(s.url.replaceAll('&', '&amp;')), `Missing website for ${s.name}`);
}
console.log('Validated sponsor hierarchy, approved event relationships, directory links, and shared credits.');
