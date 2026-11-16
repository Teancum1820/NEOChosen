import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const fridayCheckout = 'https://www.zeffy.com/en-US/ticketing/an-evening-with-the-chosen';
const closedCheckout = /zeffy\.com\/en-US\/ticketing\/chosen-and-piano-guys-meet-and-greet/;
const home = await readFile(path.join(root,'index.html'),'utf8');
assert(home.indexOf('class="home-sponsor-ribbon"') > home.indexOf('class="home-hero"'), 'Approved weekend sponsor ribbon must follow the hero');
assert(home.indexOf('class="home-sponsor-ribbon"') < home.indexOf('class="home-partners'), 'Sponsor ribbon must precede the sponsor directory');
assert.match(home, /class="home-hero-lede">[^<]*Kirtland Heritage Group/, 'Organizer credit must remain in the hero');
assert.doesNotMatch(home, /home-event-card|home-schedule-update|home-performers|home-updates|ticketmaster\.com/, 'Homepage must hide retired event content');
for (const [slug,needed] of Object.entries({
  'vip-dinner':['VIP Sponsor Dinner','$200','$1,400','Table of eight','Save $200','Doors Open 4:30 PM | Dinner 5:00 PM','Windows on the River','This event took place Friday, November 13.','Grilled Chicken Vinaigrette','Pan Seared Atlantic Salmon','Vegetable Lasagna Roll','New Potatoes with Lemon &amp; Dill','Green Beans with Red Pepper &amp; Dill','Chocolate Tuxedo Mousse','Cheesecake with Raspberry Sauce','Dinner menu from Friday, November 13.'],
  lakewood:['Event ended','Lakewood Civic Auditorium'],
  'piano-guys':['5:30 PM Eastern · Doors 4:30 PM','FNA Wealth Management','Saturday, November 14, 2026','https://www.ticketmaster.com/event/05006538EC473EB4'],
  fairlawn:['Free · Sold Out','https://schema.org/SoldOut','7:00 PM Eastern','Advanced Care Endodontics','FNA Wealth Management'],
  chesterland:['Free · Sold Out','https://schema.org/SoldOut','2:00 PM Eastern','Mayfield United Methodist Church']
})) {
  const page = await readFile(path.join(root,slug,'index.html'),'utf8');
  assert(!home.includes(`href="/${slug}/"`),`Archived route /${slug}/ must be unlisted`);
  assert.match(page, /<meta name="robots" content="noindex">/);
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
  assert(!html.includes(fridayCheckout), "Expired Friday checkout on " + route);
}
console.log('Validated the thank-you homepage, unlisted event routes, and preserved event metadata.');
