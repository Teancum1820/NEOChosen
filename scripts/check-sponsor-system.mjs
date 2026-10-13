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
  assert.doesNotMatch(document, /data-sponsor="ascend-wealth-management"/);
}
for (const document of [akron, vip, chesterland, thanks]) {
  assert.doesNotMatch(document, /event-community-sponsors-heading/);
}
const snowAngels = byId('akron-snow-angels');
assert.equal(snowAngels.tier, 'community');
assert.deepEqual(snowAngels.events, ['fairlawn']);
assert.equal(snowAngels.url, 'https://akronsnowangels.com/');
for (const document of [home, directory, fairlawn]) {
  assert.equal([...document.matchAll(/data-sponsor="akron-snow-angels"/g)].length, 1);
  assert.match(document, /href="https:\/\/akronsnowangels\.com\/"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  assert.match(document, /src="\/images\/partners\/akron-snow-angels\.png"/);
  assert.ok(document.indexOf('Community Partners') < document.indexOf('data-sponsor="akron-snow-angels"'));
}
assert.ok(fairlawn.indexOf('data-sponsor="advanced-care"') < fairlawn.indexOf('data-sponsor="akron-snow-angels"'));
for (const document of [akron, lakewood, vip, chesterland, thanks]) {
  assert.doesNotMatch(document, /data-sponsor="akron-snow-angels"/);
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

// Confirm new nonprofits appear only in community recognition, once per page.
for (const [id, event, url, logo, eventPage] of [
  ['camp-quality-usa', 'akron', 'https://campqualityusa.org/', '/images/partners/camp-quality-usa.png', akron],
  ['love-inc-cuyahoga', 'lakewood', 'https://www.loveinccuyahoga.org/', '/images/partners/love-inc-cuyahoga.png', lakewood],
]) {
  assert.equal(byId(id).tier, 'community');
  assert.equal(byId(id).recognition, 'Community Partner');
  assert.deepEqual(byId(id).events, [event]);
  assert.equal(byId(id).url, url);
  for (const document of [home, directory, eventPage]) {
    assert.equal(document.split(`data-sponsor="${id}"`).length - 1, 1);
    assert.ok(document.includes(`src="${logo}"`));
    assert.ok(document.includes(`href="${url}" target="_blank" rel="noopener noreferrer"`));
    assert.ok(document.indexOf('Community Partners') < document.indexOf(`data-sponsor="${id}"`));
  }
  for (const document of [fairlawn, vip, chesterland, thanks, event === 'akron' ? lakewood : akron]) {
    assert.ok(!document.includes(`data-sponsor="${id}"`));
  }
}
assert.ok(akron.indexOf('data-sponsor="fna"') < akron.indexOf('data-sponsor="camp-quality-usa"'));
assert.ok(lakewood.indexOf('data-sponsor="ascend-wealth-management"') < lakewood.indexOf('event-community-partners-heading'));

// Gathering Place is a Chesterland community partner, not an event presenter.
const gathering = byId('the-gathering-place');
assert.equal(gathering.tier, 'community');
assert.equal(gathering.recognition, 'Community Partner');
assert.deepEqual(gathering.events, ['chesterland']);
for (const document of [home, directory, chesterland]) {
  assert.equal(document.split('data-sponsor="the-gathering-place"').length - 1, 1);
  assert.ok(document.includes('src="/images/partners/the-gathering-place.png"'));
  assert.ok(document.includes('href="https://www.touchedbycancer.org" target="_blank" rel="noopener noreferrer"'));
  assert.ok(document.indexOf('Community Partners') < document.indexOf('data-sponsor="the-gathering-place"'));
}
for (const document of [akron, fairlawn, lakewood, vip, thanks]) {
  assert.doesNotMatch(document, /data-sponsor="the-gathering-place"/);
}
assert.ok(chesterland.indexOf('data-sponsor="great-lakes-auto-group"') < chesterland.indexOf('data-sponsor="the-gathering-place"'));

console.log('Validated sponsor hierarchy, approved event relationships, directory links, and shared credits.');
