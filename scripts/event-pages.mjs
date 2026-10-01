import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { renderWeekendTextRecognition, renderPresentingRecognition, renderEventPartnerLogos } from './sponsor-system.mjs';
import { renderPhoto } from './performer-images.mjs';
import { page as editorialPage } from './editorial-page.mjs';
import { renderImage } from '../design-system/image.mjs';
import { eventCollage, renderEventCollage } from './event-collages.mjs';
import { eventFlyer, mediaStyles } from './approved-media.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const events = [
  {
    slug: 'vip-dinner', title: 'VIP Sponsor Dinner', eyebrow: 'Friday · November 13', date: 'Friday, November 13, 2026', time: 'Doors Open 4:30 PM | Dinner 5:00 PM', startDate: '2026-11-13T17:00:00-05:00', admission: '$200 per person · $1,400 table of eight', venue: 'Windows on the River', city: 'Cleveland', street: '2000 Sycamore Street', zip: '44113', address: '2000 Sycamore Street, Cleveland, OH 44113', image: '/images/venues/windows-dinner-hero-1110.webp', imageAlt: 'Gold chairs and a floral centerpiece beside arched windows at Windows on the River',
    description: 'Join us for a limited-capacity evening with The Piano Guys and visiting cast members from The Chosen.',
    detail: 'This smaller setting gives guests the opportunity to enjoy dinner, conversation, photos, and personal interaction with our special guests while supporting Kirtland Heritage Group and helping make the larger NEOChosen Weekend events available to the community.',
    cta: 'Reserve now', url: 'https://www.zeffy.com/en-US/ticketing/vip-donor-dinner-with-the-chosen-and-piano-guys'
  },
  {
    slug: 'lakewood', title: 'An Evening with Cast Members from The Chosen', eyebrow: 'Friday · November 13', date: 'Friday, November 13, 2026', time: '7:30 PM Eastern · Doors 6:00 PM', startDate: '2026-11-13T19:30:00-05:00', admission: 'Free · registration required', venue: 'Lakewood Civic Auditorium', city: 'Lakewood', street: '14100 Franklin Blvd', zip: '44107', address: '14100 Franklin Blvd, Lakewood, OH 44107', image: 'https://m.media-amazon.com/images/M/MV5BZTI4OTAxMTAtMzU0NC00OWE2LWE1MWQtODFmZmNhYWRkZTMwXkEyXkFqcGc@._V1_.jpg', imageAlt: '',
    description: 'A free evening of stories, testimony, and audience questions featuring cast members from The Chosen.',
    detail: 'Admission is free, but a reservation is required. Donations are optional and help support accessible community programming.',
    cta: 'Reserve free ticket', url: 'https://www.zeffy.com/en-US/ticketing/an-evening-with-the-chosen'
  },
  {
    slug: 'piano-guys', title: 'The Piano Guys Live', eyebrow: 'Saturday · November 14', date: 'Saturday, November 14, 2026', time: '4:00 PM Eastern · Doors 3:00 PM', startDate: '2026-11-14T16:00:00-05:00', admission: 'Paid concert · on sale Friday, October 2 at 10 a.m.', venue: 'Akron Civic Theatre', city: 'Akron', street: '182 S Main Street', zip: '44308', address: '182 S Main Street, Akron, OH 44308', image: '/images/piano-guys-feature.webp', imageAlt: 'Two members of The Piano Guys with a cello',
    description: 'The Piano Guys take the stage for a separately ticketed concert at Akron Civic Theatre.',
    detail: 'This concert requires a separate paid theater ticket through Ticketmaster. Tickets go on sale Friday, October 2 at 10 a.m. Free-event registrations do not include this concert. See Ticketmaster for seating, ticket prices, and availability.',
    cta: 'Concert tickets', url: 'https://www.ticketmaster.com/event/05006538EC473EB4', sponsor: 'akron'
  },
  {
    slug: 'fairlawn', title: 'Fairlawn Meet & Greet', eyebrow: 'Saturday · November 14', date: 'Saturday, November 14, 2026', time: '7:00 PM Eastern', startDate: '2026-11-14T19:00:00-05:00', admission: 'Free · registration required', venue: 'St. Hilary Church', city: 'Fairlawn', street: '2750 W Market St', zip: '44333', address: '2750 W Market St, Fairlawn, OH 44333', image: 'https://m.media-amazon.com/images/M/MV5BYjgxMjg5YzMtN2ZjNi00ZDIxLWFlOTktZWQ5MTJhMjYyNjFiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', imageAlt: '',
    description: 'A free community Meet & Greet with The Piano Guys and cast members from The Chosen.',
    detail: 'Admission is free, but a reservation is required. Donations are optional.',
    cta: 'Reserve free ticket', url: 'https://www.zeffy.com/en-US/ticketing/chosen-and-piano-guys-meet-and-greet-experience-fairlawn', sponsor: 'fairlawn'
  },
  {
    slug: 'chesterland', title: 'Chesterland Meet & Greet', eyebrow: 'Sunday · November 15', date: 'Sunday, November 15, 2026', time: '2:00 PM Eastern', startDate: '2026-11-15T14:00:00-05:00', admission: 'Free · registration required', venue: 'Mayfield United Methodist Church', city: 'Chesterland', street: '7747 Mayfield Road', zip: '44026', address: '7747 Mayfield Road, Chesterland, OH 44026', image: 'https://m.media-amazon.com/images/M/MV5BZGM2Nzc3N2ItOGI5Mi00MDIzLWJkNzctYmVlMGY4MTRiNmJlXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg', imageAlt: '',
    description: 'A free Sunday Meet & Greet hosted by Mayfield United Methodist Church to close the weekend.',
    detail: 'Admission is free, but a reservation is required. Donations are optional. The host church is at 7747 Mayfield Road.',
    cta: 'Reserve free ticket', url: 'https://www.zeffy.com/en-US/ticketing/chosen-and-piano-guys-meet-and-greet-chesterland',
    secondary: 'https://www.mayfieldchurch.org/', secondaryLabel: 'Visit the host church'
  }
];

const action = (url, label, className = 'event-button') => `<a class="${className}" href="${escape(url)}"${url.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escape(label)} <span aria-hidden="true">↗</span></a>`;
const schema = event => ({
  '@context': 'https://schema.org', '@type': 'Event', name: event.title,
  description: event.description, startDate: event.startDate,
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  url: `https://neochosen.com/${event.slug}/`,
  image: eventCollage(event.slug) ? `https://neochosen.com${eventCollage(event.slug).variants.at(-1).src}` : `https://neochosen.com/images/${event.slug === 'vip-dinner' ? 'venues/windows-dinner-hero-1110.webp' : 'NeoHeader.webp'}`,
  location: { '@type': 'Place', name: event.venue, address: { '@type': 'PostalAddress', streetAddress: event.street, addressLocality: event.city, addressRegion: 'OH', postalCode: event.zip, addressCountry: 'US' } },
  organizer: { '@type': 'Organization', name: 'Kirtland Heritage Group', url: 'https://www.kirtlandheritagegroup.com/' },
  ...(event.admission.startsWith('Free') ? { offers: { '@type': 'Offer', url: event.url, price: '0', priceCurrency: 'USD' } } : {})
});
const venues = {
  'vip-dinner': { url:'https://www.windowsontheriver.com/', intro:'An evening on Cleveland’s waterfront, in the historic FirstEnergy Powerhouse. Exposed brick, high ceilings, and river and skyline views make Windows on the River a memorable gathering place.', photo:'windows-dinner-room', approved:true, photoHeight:481, alt:'A dining room with banquet tables, gold chairs, arched windows and exposed brick at Windows on the River', credit:'Venue photography: Windows on the River. Example room setup; the dinner layout may differ.', guide:'Contact the organizing team for event arrival and accessibility questions. See the venue website for its spaces and location.' },
  lakewood: { url:'https://lkwdcivicauditorium.lakewoodcityschools.org/guest-services', intro:'A community auditorium in the heart of Lakewood, welcoming guests for an evening of stories and conversation.', photo:'lakewood-auditorium-exterior', approved:true, photoWidth:512, photoHeight:311, photoWidths:[480,512], alt:'The brick exterior and entrance of Lakewood Civic Auditorium, with an accessible ramp in front', credit:'Lakewood Civic Auditorium', guide:'The venue lists a wheelchair ramp, separate ADA seating and assistive hearing devices. Accessible parking is adjacent to the auditorium; additional parking is in the North Lot across the street.' },
  'piano-guys': { url:'https://akroncivic.com/', intro:'Built in 1929, this downtown landmark brings atmospheric theater architecture, a starry ceiling and an unforgettable setting to a live concert.', photo:'akron-civic-interior-supplied', approved:true, photoWidth:800, photoHeight:556, photoWidths:[480,800], alt:'Akron Civic Theatre auditorium with ornate gold arches, red stage curtains and a purple-lit ceiling', credit:'Akron Civic Theatre', guide:'Review the theater’s current parking and accessibility guidance before traveling. Contact the theater about accessible seating and listening assistance.', links:[['https://akroncivic.com/parking','Parking information'],['https://akroncivic.com/accessibility-information','Accessibility information']] },
  fairlawn: { url:'https://sthilarychurch.org/belong/im-new/', intro:'Gather at St. Hilary Church in Fairlawn for a community evening with The Piano Guys and cast members from The Chosen.', photo:'st-hilary-stained-glass-detail', approved:true, photoWidth:990, photoHeight:462, photoWidths:[480,960,990], alt:'Blue and purple stained glass with a scroll reading Come Follow Me at St. Hilary Church', credit:'St. Hilary Church', guide:'The parish is on West Market Street. See the parish’s visitor guidance for directions and information about its hearing loop; ask the organizing team about the event’s seating and access arrangements.' },
  chesterland: { url:'https://www.mayfieldchurch.org/', intro:'Mayfield United Methodist Church hosts the Sunday gathering that closes NEOChosen Weekend in Chesterland.', guide:'Plan your route to 7747 Mayfield Road. Contact the organizing team before the event with seating or accessibility questions.' }
};
const venuePhoto = v => {
 if (!v.photo) return '';
 const width = v.photoWidth || 960;
 const widths = v.photoWidths || (v.approved ? [480,960,1110] : [480,960]);
 const image = renderImage({src:`/images/venues/${v.photo}-${width}.webp`,alt:v.alt,width,height:v.photoHeight || (v.photo === 'akron' ? 720 : 602),srcSet:widths.map(size=>({src:`/images/venues/${v.photo}-${size}.webp`,width:size})),sizes:'(max-width:800px) calc(100vw - 48px), 55vw'});
 return `<figure class="venue-photo"><div class="venue-photo-media${v.approved ? '' : ' preview-placeholder'}">${v.approved ? '' : '<span class="preview-placeholder-label" aria-hidden="true">PLACEHOLDER</span>'}${image}</div><figcaption>${v.creditUrl ? `<a href="${v.creditUrl}" target="_blank" rel="noopener noreferrer">${escape(v.credit)}</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">License</a>` : `<a href="${v.url}" target="_blank" rel="noopener noreferrer">${escape(v.credit)}</a>`}</figcaption></figure>`;
};
// The dinner has its own experience-first layout; other event templates stay shared.
const dinnerPage = event => {
 const v = venues[event.slug];
 const reservation = () => `<p class="vip-reserve-label">Seating is limited — reserve your seat or table</p>${action(event.url, 'Reserve now')}`;
 const venueImage = renderImage({src:'/images/venues/windows-dinner-hero-960.webp',alt:event.imageAlt,width:1110,height:556,srcSet:[480,960,1110].map(width=>({src:`/images/venues/windows-dinner-hero-${width}.webp`,width})),sizes:'(max-width:800px) 100vw, 47vw',priority:true});
 const guestImage = renderImage({src:'/images/collages/chosen-and-piano-guys-800.webp',alt:'The Piano Guys and cast members from The Chosen',width:1254,height:1254,srcSet:[480,800,1200,1254].map(width=>({src:`/images/collages/chosen-and-piano-guys-${width}.webp`,width})),sizes:'(max-width:800px) calc(100vw - 48px), 34vw'});
 const includes = ['Dinner at Windows on the River','An intimate setting with The Piano Guys and cast members from The Chosen','Opportunities for conversation and photos','Special experiences and surprises throughout the evening','The opportunity to support the free community events throughout NEOChosen Weekend'];
 return editorialPage({title:`${event.title} | NEOChosen 2026`,description:`${event.description} ${event.date} at ${event.venue} in ${event.city}. Limited seating. $200 per person or $1,400 for a table of eight.`,route:'/vip-dinner/',className:'event-page vip-dinner-page',extraHead:`<link rel="stylesheet" href="/events/event.css"><link rel="stylesheet" href="/events/vip-dinner.css"><script type="application/ld+json">${JSON.stringify(schema(event))}</script>`,body:`
 <header class="event-hero vip-hero">
  <div class="event-hero-content vip-hero-content">
   <p class="editorial-kicker vip-intimate">The most intimate event of NEOChosen Weekend</p>
   <p class="vip-guest-line"><span>An intimate evening with</span>The Piano Guys &amp; cast members from The Chosen</p>
   <h1>VIP Sponsor Dinner</h1>
   <div class="vip-date"><p><strong>${escape(event.date)}</strong></p><p>${escape(event.time)}</p><p>${escape(event.venue)} • ${escape(event.city)}</p></div>
   <div class="vip-prices" aria-label="Dinner pricing"><p><strong>$200</strong><span>Per person</span></p><p><strong>$1,400</strong><span>Table of eight</span></p></div>
   <p class="vip-saving">Save $200 when reserving a full table.</p>
   <div class="vip-reservation">${reservation()}</div>
  </div>
  <figure class="vip-hero-photo">${venueImage}<figcaption>Windows on the River · Venue photography<br>Example room setup; the dinner layout may differ.</figcaption></figure>
 </header>
 <section class="editorial-section editorial-section--white vip-experience" aria-labelledby="vip-experience-title"><div class="editorial-shell vip-experience-grid">
  <div class="editorial-copy"><p class="editorial-kicker">The experience</p><h2 id="vip-experience-title">The most <em>intimate</em> event of NEOChosen Weekend</h2><p class="vip-lede">${escape(event.description)}</p><p>${escape(event.detail)}</p><a class="event-text-link" href="#vip-includes">Your evening includes <span aria-hidden="true">↓</span></a></div>
  <figure class="vip-guests">${guestImage}<figcaption>The Piano Guys &amp; cast members from The Chosen</figcaption></figure>
 </div></section>
 <section class="editorial-section vip-includes" id="vip-includes" aria-labelledby="vip-includes-title"><div class="editorial-shell vip-includes-grid"><div><p class="editorial-kicker">Dinner. Conversation. Connection.</p><h2 id="vip-includes-title">Your evening includes</h2></div><ul>${includes.map(item=>`<li>${escape(item)}</li>`).join('')}</ul></div></section>
 <section class="editorial-section editorial-section--white vip-menu" aria-labelledby="vip-menu-title"><div class="editorial-shell"><div class="vip-menu-intro"><p class="editorial-kicker">At the table</p><h2 id="vip-menu-title">The dinner menu</h2><p>Guests will select their entrée and dessert when purchasing their tickets.</p></div><div class="vip-menu-grid">
  <div><h3>Entrée options</h3><ul><li><strong>Grilled Chicken Vinaigrette</strong><p>Grilled chicken breast marinated in balsamic vinaigrette, topped with fresh tomato relish</p></li><li><strong>Pan Seared Atlantic Salmon</strong></li><li><strong>Vegetable Lasagna Roll</strong><p>Layers of pasta with fresh vegetables and ricotta cheese, topped with salsa rosa sauce</p></li></ul></div>
  <div><h3>Sides</h3><ul><li>New Potatoes with Lemon &amp; Dill</li><li>Green Beans with Red Pepper &amp; Dill</li></ul><h3>Dessert options</h3><ul><li>Chocolate Tuxedo Mousse</li><li>Cheesecake with Raspberry Sauce</li></ul></div>
 </div></div></section>
 <section class="editorial-section vip-venue" aria-labelledby="vip-venue-title"><div class="editorial-shell vip-venue-grid"><div><p class="editorial-kicker">Friday, November 13 · Cleveland</p><h2 id="vip-venue-title">Windows on the River</h2><p>Doors Open 4:30 PM | Dinner 5:00 PM<br>All times are Eastern.</p></div><div><address>${escape(event.address)}</address><div class="event-actions">${action('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(event.address),'Get directions','event-text-link')}${action(v.url,'Visit the venue website','event-text-link')}</div><p class="vip-questions">For arrival or accessibility questions, <a href="mailto:info@kirtlandheritagegroup.com">contact our team</a>.</p></div></div></section>
 <section class="editorial-section editorial-section--navy vip-final-reservation" aria-labelledby="vip-reserve-title"><div class="editorial-shell"><p class="editorial-kicker">The most intimate event of NEOChosen Weekend</p><h2 id="vip-reserve-title">Seating is limited — reserve your seat or table</h2><p>$200 per person · $1,400 table of eight</p><p>Save $200 when reserving a full table.</p>${action(event.url,'Reserve now')}<a class="event-text-link" href="/#events">Explore NEOChosen Weekend <span aria-hidden="true">→</span></a></div></section>
 <section class="event-recognition" aria-label="Event organizer and weekend sponsor"><div class="editorial-shell"><p class="editorial-kicker">Presented by Kirtland Heritage Group</p>${renderWeekendTextRecognition()}</div></section>`});
};
const page = event => {
 if (event.slug === 'vip-dinner') return dinnerPage(event);
 const v = venues[event.slug];
 const collage = eventCollage(event.slug);
 const heroPhoto = collage ? renderEventCollage(collage) : event.slug === 'vip-dinner' ? renderImage({src:'/images/venues/windows-dinner-hero-960.webp',alt:'Gold chairs and a floral centerpiece beside arched windows at Windows on the River',width:1110,height:556,srcSet:[480,960,1110].map(width=>({src:`/images/venues/windows-dinner-hero-${width}.webp`,width})),sizes:'(max-width:800px) 100vw, 53vw',priority:true}) : renderPhoto('piano-guys',{alt:'The Piano Guys standing together with a cello',sizes:'(max-width:800px) 100vw, 53vw',priority:true});
 const before = event.slug === 'vip-dinner' ? 'Each $200 donated includes one dinner invitation, while space remains. Use the donor dinner form to give and reserve your place. If you have already donated another way, contact our team to arrange your invitation. Business sponsorship packages are also available.' : event.slug === 'piano-guys' ? 'Tickets go on sale Friday, October 2 at 10 a.m. Purchase concert tickets through Ticketmaster; a free-event registration or newsletter signup is not a concert ticket.' : 'Reserve a free ticket before arriving and keep your registration confirmation handy. Donations are optional and do not replace a ticket reservation.';
 return editorialPage({title:`${event.title} | NEOChosen 2026`,description:`${event.date} at ${event.venue} in ${event.city}. ${event.description}`,route:`/${event.slug}/`,className:'event-page',extraHead:`<link rel="stylesheet" href="/events/event.css">${eventFlyer(event.slug) ? `<link rel="stylesheet" href="${mediaStyles}">` : ""}<script type="application/ld+json">${JSON.stringify(schema(event))}</script>`,body:`
 <header class="event-hero"><div class="event-hero-photo${collage ? ' event-hero-photo--collage' : ''}">${heroPhoto}</div><div class="event-hero-content"><p class="editorial-kicker">NEOChosen Weekend · ${escape(event.eyebrow)}</p><h1>${escape(event.title)}</h1><p class="event-hero-time">${escape(event.time)}</p><p>${escape(event.venue)} · ${escape(event.city)}</p><p class="event-admission">${escape(event.admission)}</p><div class="event-actions">${action(event.url,event.cta)}${event.secondary ? action(event.secondary,event.secondaryLabel,'event-text-link') : ''}</div></div></header>
 <section class="event-facts-band" aria-label="Event details"><div class="editorial-shell event-facts">${[['Date',event.date],['Time',event.time],['Venue',event.venue],['Admission',event.admission]].map(([label,value])=>`<div><span>${label}</span><strong>${escape(value)}</strong></div>`).join('')}</div></section>
 <section class="event-recognition${['piano-guys','fairlawn','chesterland','lakewood'].includes(event.slug) ? ' event-recognition--logos' : ''}"><div class="editorial-shell">${['piano-guys','fairlawn','chesterland','lakewood'].includes(event.slug) ? renderEventPartnerLogos(event.sponsor,{includeOrganizer:['chesterland','lakewood'].includes(event.slug)}) : (event.sponsor ? renderPresentingRecognition(event.sponsor) : '<p class="editorial-kicker">Presented by Kirtland Heritage Group</p>')+renderWeekendTextRecognition()}</div></section>
 <section class="editorial-section editorial-section--white"><div class="editorial-shell editorial-article"><div class="editorial-copy"><p class="editorial-kicker">${event.slug==='vip-dinner'?'The most intimate event of the weekend':'The experience'}</p><h2>${event.slug==='vip-dinner'?'And you’re invited.':event.slug==='piano-guys'?'Music in a remarkable setting.':'A moment to connect.'}</h2><p>${escape(event.description)}</p><p>${escape(event.detail)}</p>${event.slug==='vip-dinner'?'<p>Special prizes, giveaways, and gift bags add to the evening. Specific items will be shared when confirmed.</p>':''}<div class="event-actions">${action(event.url,event.cta)}</div></div><aside class="editorial-aside"><p class="editorial-kicker">Before you go</p><h2>Make your plans</h2><p>${escape(before)}</p><p>All times are Eastern. Questions? <a href="mailto:info@kirtlandheritagegroup.com">Contact our team</a>.</p></aside></div></section>
 <section class="editorial-section"><div class="editorial-shell"><p class="editorial-kicker">The venue</p><h2>${escape(event.venue)}</h2><div class="editorial-columns"><div class="editorial-copy"><p>${escape(v.intro)}</p>${venuePhoto(v)}</div><div class="event-venue-guide"><h3>Getting there</h3><address>${escape(event.address)}</address>${action('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(event.address),'Get directions','event-text-link')}<h3>Visitor information</h3><p>${escape(v.guide)}</p>${action(v.url,'Visit the venue website','event-text-link')}${(v.links||[]).map(([url,label])=>action(url,label,'event-text-link')).join('')}</div></div></div></section>
 ${eventFlyer(event.slug)}<section class="editorial-section editorial-section--navy"><div class="editorial-shell"><p class="editorial-kicker">November 13–15</p><h2>Make a weekend of it.</h2><div class="event-related">${events.filter(e=>e.slug!==event.slug).slice(0,3).map(e=>`<a href="/${e.slug}/"><span>${escape(e.eyebrow)}</span><h3>${escape(e.title)}</h3><p>${escape(e.venue)} · ${escape(e.admission)}</p><strong>Event details →</strong></a>`).join('')}</div><a class="event-text-link" href="/#events">Explore all five experiences →</a></div></section>`});
};

export async function writeEventPages(outDir) {
  for (const event of events) {
    const dir = path.join(outDir, event.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), page(event), 'utf8');
  }
}
