import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const fridayCheckout = 'https://www.zeffy.com/en-US/ticketing/an-evening-with-the-chosen';
const closedCheckout = /zeffy\.com\/en-US\/ticketing\/chosen-and-piano-guys-meet-and-greet/;
const home = await readFile(path.join(root,'index.html'),'utf8');
assert(home.indexOf('class="home-sponsor-ribbon"') > home.indexOf('class="home-hero"'), 'Approved weekend sponsor ribbon must follow the hero');
assert(home.indexOf('class="home-sponsor-ribbon"') < home.indexOf('class="home-overview'), 'Sponsor ribbon must immediately precede the overview');
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
  'vip-dinner':['VIP Sponsor Dinner','$200','$1,400','Table of eight','Save $200','Doors Open 4:30 PM | Dinner 5:00 PM','Windows on the River','Reserve now','Grilled Chicken Vinaigrette','Pan Seared Atlantic Salmon','Vegetable Lasagna Roll','New Potatoes with Lemon &amp; Dill','Green Beans with Red Pepper &amp; Dill','Chocolate Tuxedo Mousse','Cheesecake with Raspberry Sauce','Guests will select their entrée and dessert when purchasing their tickets.'],
  lakewood:['Free','Lakewood Civic Auditorium'],
  'piano-guys':['Paid concert','FNA Wealth Management','Saturday, November 14, 2026','https://www.ticketmaster.com/event/05006538EC473EB4'],
  fairlawn:['Free · Sold Out','https://schema.org/SoldOut',fridayCheckout,'Advanced Care Endodontics','FNA Wealth Management'],
  chesterland:['Free · Sold Out','https://schema.org/SoldOut',fridayCheckout,'Mayfield United Methodist Church']
})) {
  const page = await readFile(path.join(root,slug,'index.html'),'utf8');
  assert(home.includes(`href="/${slug}/"`),`Missing homepage link to /${slug}/`);
  assert(page.includes(`<link rel="canonical" href="https://neochosen.com/${slug}/">`),`Missing canonical for /${slug}/`);
  assert(page.includes('application/ld+json'),`Missing event structured data for /${slug}/`);
  assert(page.includes('Great Lakes Auto Group'),`Missing weekend sponsor on /${slug}/`);
  for (const fragment of needed) assert(page.includes(fragment),`/${slug}/ missing ${fragment}`);
}
for (const [route, html] of [
  ['/', home],
  ...await Promise.all(['fairlawn', 'chesterland', 'thank-you/fairlawn', 'thank-you/chesterland', 'thank-you/donor-dinner'].map(async route => [route, await readFile(path.join(root,route,'index.html'),'utf8')]))
]) {
  assert(!closedCheckout.test(html), `Closed meet-and-greet checkout on ${route}`);
  assert(html.includes(`href="${fridayCheckout}"`), `Missing Friday checkout on ${route}`);
}
console.log('Validated five event cards, detail routes, admission types, sponsor roles, CTAs, and event metadata.');
