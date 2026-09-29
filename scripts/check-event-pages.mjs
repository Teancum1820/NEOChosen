import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const home = await readFile(path.join(root,'index.html'),'utf8');
assert(home.indexOf('class="home-sponsor-ribbon"') < home.indexOf('class="home-hero"'), 'Weekend sponsor ribbon must be above the opening image');
assert(home.includes('Kirtland Heritage Group Presents'), 'Organizer credit must remain in the hero');
const cards = [...home.matchAll(/<article class="home-event-card[^"]*"[^>]*>([\s\S]*?)<\/article>/g)].map(match=>match[1]);
assert.equal(cards.length,5,'Homepage must contain five event cards');
for (const card of cards) {
  for (const required of ['home-event-day','home-status','home-event-time','home-event-location','home-event-bottom','NEO Chosen Weekend Presenting Sponsor','Great Lakes Auto Group']) {
    assert(card.includes(required),`Event card missing ${required}`);
  }
  assert(card.includes('home-event-cta'), 'Every event card needs a working primary action');
  assert(card.includes('home-event-secondary'), 'Every event card needs a detail route');
}
for (const [slug,needed] of Object.entries({
  'vip-dinner':['Sponsor invitation','$200','Windows on the River'],
  lakewood:['Free','Lakewood Civic Auditorium'],
  'piano-guys':['Paid theater concert','FNA Wealth Management','tickets coming soon'],
  fairlawn:['Free','Advanced Care Endodontics','FNA Wealth Management'],
  chesterland:['Free','Mayfield United Methodist Church']
})) {
  const page = await readFile(path.join(root,slug,'index.html'),'utf8');
  assert(home.includes(`href="/${slug}/"`),`Missing homepage link to /${slug}/`);
  assert(page.includes(`<link rel="canonical" href="https://neochosen.com/${slug}/">`),`Missing canonical for /${slug}/`);
  assert(page.includes('application/ld+json'),`Missing event structured data for /${slug}/`);
  assert(page.includes('Great Lakes Auto Group'),`Missing weekend sponsor on /${slug}/`);
  for (const fragment of needed) assert(page.includes(fragment),`/${slug}/ missing ${fragment}`);
}
console.log('Validated five event cards, detail routes, admission types, sponsor roles, CTAs, and event metadata.');
