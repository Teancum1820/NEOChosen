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
const lakewood = await page('lakewood/index.html');
const vip = await page('vip-dinner/index.html');
const chesterland = await page('chesterland/index.html');
const thanks = await page('thank-you/fairlawn/index.html');
const byId = id => sponsors.find(s => s.id === id);

assert.equal(byId('great-lakes-auto-group').tier, 'weekend-presenting');
assert.deepEqual(byId('fna').events, ['akron', 'fairlawn']);
assert.deepEqual(byId('advanced-care').events, ['fairlawn']);
assert.equal(byId('barons-bus').tier, 'platinum');
assert.equal(byId('hallow').tier, 'community');
assert.equal(byId('haven-of-rest').tier, 'program-advertiser');
assert.doesNotMatch(home + directory, /Official Prayer Sponsor/);
for (const document of [home, directory]) {
  assert.ok(document.indexOf('Community Partners') < document.indexOf('data-sponsor="hallow"'));
  assert.ok(document.indexOf('data-sponsor="hallow"') < document.indexOf('Program Advertiser'));
  assert.ok(document.indexOf('Program Advertiser') < document.indexOf('data-sponsor="haven-of-rest"'));
}
assert.equal(byId('ascend-wealth-management').tier, 'community');
assert.deepEqual(byId('ascend-wealth-management').events, ['lakewood']);
assert.equal(byId('ascend-wealth-management').url, 'https://www.conniecostanzo.com/');
assert.equal(byId('ascend-wealth-management').description, undefined);
assert.match(home, /<a class="home-sponsor-logo home-sponsor-logo--light" data-sponsor="ascend-wealth-management" href="https:\/\/www\.conniecostanzo\.com\/"/);
for (const document of [home, directory, lakewood]) {
  assert.doesNotMatch(document, /Community sponsor of the November 13, 2026 Lakewood event\./);
  assert.match(document, /href="https:\/\/www\.conniecostanzo\.com\/"/);
  assert.match(document, /src="\/images\/ascend-wealth-management\.png"/);
  assert.doesNotMatch(document, /href="undefined"/);
  assert.equal([...document.matchAll(/data-sponsor="ascend-wealth-management"/g)].length, 1);
}
assert.match(lakewood, /class="event-community-sponsors"/);
assert.match(directory, /<a class="neo-sponsor-identity" href="https:\/\/www\.conniecostanzo\.com\/"[^>]*><span[^>]*><img src="\/images\/ascend-wealth-management\.png"/);
assert.match(lakewood, /<a class="event-community-identity" href="https:\/\/www\.conniecostanzo\.com\/"[^>]*><span[^>]*><img src="\/images\/ascend-wealth-management\.png"/);
assert.ok(lakewood.indexOf('data-sponsor="great-lakes-auto-group"') < lakewood.indexOf('Community Sponsors'));
assert.ok(lakewood.indexOf('Community Sponsors') < lakewood.indexOf('data-sponsor="ascend-wealth-management"'));
for (const document of [akron, fairlawn, vip, chesterland, thanks]) {
  assert.doesNotMatch(document, /data-sponsor="ascend-wealth-management"|event-community-sponsors-heading/);
}
assert.ok(sponsors.filter(s => s.tier === 'community').length > 0);
assert.ok(directory.indexOf('Weekend Presenting Sponsor') < directory.indexOf('Event Presenting Sponsors'));
assert.ok(directory.indexOf('Event Presenting Sponsors') < directory.indexOf('Platinum Sponsor'));
assert.ok(directory.indexOf('Platinum Sponsor') < directory.indexOf('Community Partners'));
assert.match(home, /NEO CHOSEN WEEKEND<br>PRESENTING SPONSOR/);
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
  if (s.url) assert.ok(directory.includes(s.url.replaceAll('&', '&amp;')), `Missing website for ${s.name}`);
}
for (const document of [home, directory]) assert.doesNotMatch(document, /href="undefined"/);
console.log('Validated sponsor hierarchy, approved event relationships, directory links, and shared credits.');
