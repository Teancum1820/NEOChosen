import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { renderWeekendTextRecognition, renderPresentingRecognition, renderEventPartnerLogos } from './sponsor-system.mjs';
import { renderPhoto } from './performer-images.mjs';
import { page as editorialPage } from './editorial-page.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const events = [
  {
    slug: 'vip-dinner', title: 'VIP Donor Dinner', eyebrow: 'Friday · November 13', date: 'Friday, November 13, 2026', time: '5:00–6:45 PM Eastern', startDate: '2026-11-13T17:00:00-05:00', admission: '$200 donation · one dinner invitation', venue: 'Windows on the River', city: 'Cleveland', street: '2000 Sycamore Street', zip: '44113', address: '2000 Sycamore Street, Cleveland, OH 44113', image: '/images/hero.webp', imageAlt: '',
    description: 'A private thank-you dinner for donors supporting NEOChosen Weekend, with The Piano Guys, cast members from The Chosen, and Northeast Ohio community and faith leaders.',
    detail: 'Join cast members from The Chosen, The Piano Guys, and area leaders for dinner, conversation, and opportunities to mingle. Come on your own, bring a friend, or make it an evening with someone you love. A $200 donation includes one dinner invitation; $400 includes two, while space remains. Your support helps make the weekend’s free public events possible.',
    cta: 'Become a donor', url: 'https://www.zeffy.com/en-US/ticketing/vip-donor-dinner-with-the-chosen-and-piano-guys',
    secondary: '/sponsorship-opportunities/vip-dinner/', secondaryLabel: 'Explore business sponsorship'
  },
  {
    slug: 'lakewood', title: 'An Evening with Cast Members from The Chosen', eyebrow: 'Friday · November 13', date: 'Friday, November 13, 2026', time: '7:30 PM Eastern · Doors 6:00 PM', startDate: '2026-11-13T19:30:00-05:00', admission: 'Free · registration required', venue: 'Lakewood Civic Auditorium', city: 'Lakewood', street: '14100 Franklin Blvd', zip: '44107', address: '14100 Franklin Blvd, Lakewood, OH 44107', image: 'https://m.media-amazon.com/images/M/MV5BZTI4OTAxMTAtMzU0NC00OWE2LWE1MWQtODFmZmNhYWRkZTMwXkEyXkFqcGc@._V1_.jpg', imageAlt: '',
    description: 'A free evening of stories, testimony, and audience questions featuring cast members from The Chosen.',
    detail: 'Admission is free, but a reservation is required. Donations are optional and help support accessible community programming.',
    cta: 'Reserve free ticket', url: 'https://www.zeffy.com/en-US/ticketing/an-evening-with-the-chosen'
  },
  {
    slug: 'piano-guys', title: 'The Piano Guys Live', eyebrow: 'Saturday · November 14', date: 'Saturday, November 14, 2026', time: '4:00 PM Eastern · Doors 3:00 PM', startDate: '2026-11-14T16:00:00-05:00', admission: 'Paid theater concert · tickets coming soon', venue: 'Akron Civic Theatre', city: 'Akron', street: '182 S Main Street', zip: '44308', address: '182 S Main Street, Akron, OH 44308', image: '/images/piano-guys-feature.webp', imageAlt: 'Two members of The Piano Guys with a cello',
    description: 'The Piano Guys take the stage for a separately ticketed concert at Akron Civic Theatre.',
    detail: 'This concert requires a separate paid theater ticket. The official purchase link and ticket prices will be shared when confirmed. Join the update list to hear when tickets are available.',
    cta: 'Get ticket updates', url: '/#event-updates', sponsor: 'akron'
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
  image: `https://neochosen.com/images/${event.slug === 'chesterland' ? 'mayfield-united-methodist-church-logo.jpg' : 'NeoHeader.webp'}`,
  location: { '@type': 'Place', name: event.venue, address: { '@type': 'PostalAddress', streetAddress: event.street, addressLocality: event.city, addressRegion: 'OH', postalCode: event.zip, addressCountry: 'US' } },
  organizer: { '@type': 'Organization', name: 'Kirtland Heritage Group', url: 'https://www.kirtlandheritagegroup.com/' },
  ...(event.admission.startsWith('Free') ? { offers: { '@type': 'Offer', url: event.url, price: '0', priceCurrency: 'USD' } } : {})
});
const venues = {
  'vip-dinner': { url:'https://www.windowsontheriver.com/', intro:'An evening on Cleveland’s waterfront, in the historic FirstEnergy Powerhouse. Exposed brick, high ceilings, and river and skyline views make Windows on the River a memorable gathering place.', photo:'windows', alt:'Banquet tables, arched windows and exposed brick at Windows on the River', credit:'Venue photography: Windows on the River. Example room setup; the dinner layout may differ.', guide:'Contact the organizing team for event arrival and accessibility questions. See the venue website for its spaces and location.' },
  lakewood: { url:'https://lkwdcivicauditorium.lakewoodcityschools.org/guest-services', intro:'A community auditorium in the heart of Lakewood, welcoming guests for an evening of stories and conversation.', guide:'The venue lists a wheelchair ramp, separate ADA seating and assistive hearing devices. Accessible parking is adjacent to the auditorium; additional parking is in the North Lot across the street.' },
  'piano-guys': { url:'https://akroncivic.com/', intro:'Built in 1929, this downtown landmark brings atmospheric theater architecture, a starry ceiling and an unforgettable setting to a live concert.', photo:'akron', alt:'Akron Civic Theatre auditorium viewed from the balcony, with ornate arches and a starry ceiling', credit:'Photo: Nat Napoletano / Wikimedia Commons, CC BY-SA 3.0. Resized and converted to WebP.', creditUrl:'https://commons.wikimedia.org/wiki/File:Akron_Civic_Theatre,_house_view_from_balcony.jpg', guide:'Review the theater’s current parking and accessibility guidance before traveling. Contact the theater about accessible seating and listening assistance.', links:[['https://akroncivic.com/parking','Parking information'],['https://akroncivic.com/accessibility-information','Accessibility information']] },
  fairlawn: { url:'https://sthilarychurch.org/belong/im-new/', intro:'Gather at St. Hilary Church in Fairlawn for a community evening with The Piano Guys and cast members from The Chosen.', guide:'The parish is on West Market Street. See the parish’s visitor guidance for directions and information about its hearing loop; ask the organizing team about the event’s seating and access arrangements.' },
  chesterland: { url:'https://www.mayfieldchurch.org/', intro:'Mayfield United Methodist Church hosts the Sunday gathering that closes NEOChosen Weekend in Chesterland.', guide:'Plan your route to 7747 Mayfield Road. Contact the organizing team before the event with seating or accessibility questions.' }
};
const venuePhoto = v => v.photo ? `<figure class="venue-photo"><div class="venue-photo-media preview-placeholder"><span class="preview-placeholder-label" aria-hidden="true">PLACEHOLDER</span><img src="/images/venues/${v.photo}-960.webp" srcset="/images/venues/${v.photo}-480.webp 480w, /images/venues/${v.photo}-960.webp 960w" sizes="(max-width:800px) calc(100vw - 48px), 55vw" alt="${escape(v.alt)}" width="960" height="${v.photo === 'akron' ? 720 : 602}" loading="lazy" decoding="async"></div><figcaption>${v.creditUrl ? `<a href="${v.creditUrl}" target="_blank" rel="noopener noreferrer">${escape(v.credit)}</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">License</a>` : `<a href="${v.url}" target="_blank" rel="noopener noreferrer">${escape(v.credit)}</a>`}</figcaption></figure>` : '';
const page = event => {
 const v = venues[event.slug];
 const photo = event.slug === 'piano-guys' || event.slug === 'vip-dinner' ? 'piano-guys' : event.slug === 'lakewood' ? 'shaan-sharma' : event.slug === 'fairlawn' ? 'vanessa-benavente' : 'yasmine-al-bustami';
 const before = event.slug === 'vip-dinner' ? 'Each $200 donated includes one dinner invitation, while space remains. Use the donor dinner form to give and reserve your place. If you have already donated another way, contact our team to arrange your invitation. Business sponsorship packages are also available.' : event.slug === 'piano-guys' ? 'Free-event registrations do not include this concert. Use the official concert purchase link once announced; the update list is not a ticket reservation.' : 'Reserve a free ticket before arriving and keep your registration confirmation handy. Donations are optional and do not replace a ticket reservation.';
 return editorialPage({title:`${event.title} | NEOChosen 2026`,description:`${event.date} at ${event.venue} in ${event.city}. ${event.description}`,route:`/${event.slug}/`,className:'event-page',extraHead:`<link rel="stylesheet" href="/events/event.css"><script type="application/ld+json">${JSON.stringify(schema(event))}</script>`,body:`
 <header class="event-hero"><div class="event-hero-photo preview-placeholder"><span class="preview-placeholder-label" aria-hidden="true">PLACEHOLDER</span>${renderPhoto(photo,{alt:photo==='piano-guys'?'The Piano Guys standing together with a cello':event.title+' featured guest',sizes:'(max-width:800px) 100vw, 53vw',priority:true,position:photo==='piano-guys'?'center':'center 25%'})}</div><div class="event-hero-content"><p class="editorial-kicker">NEOChosen Weekend · ${escape(event.eyebrow)}</p><h1>${escape(event.title)}</h1><p class="event-hero-time">${escape(event.time)}</p><p>${escape(event.venue)} · ${escape(event.city)}</p><p class="event-admission">${escape(event.admission)}</p><div class="event-actions">${action(event.url,event.cta)}${event.secondary ? action(event.secondary,event.secondaryLabel,'event-text-link') : ''}</div></div></header>
 <section class="event-facts-band" aria-label="Event details"><div class="editorial-shell event-facts">${[['Date',event.date],['Time',event.time],['Venue',event.venue],['Admission',event.admission]].map(([label,value])=>`<div><span>${label}</span><strong>${escape(value)}</strong></div>`).join('')}</div></section>
 <section class="event-recognition${['piano-guys','fairlawn','chesterland'].includes(event.slug) ? ' event-recognition--logos' : ''}"><div class="editorial-shell">${['piano-guys','fairlawn','chesterland'].includes(event.slug) ? renderEventPartnerLogos(event.sponsor,{includeOrganizer:event.slug==='chesterland'}) : (event.sponsor ? renderPresentingRecognition(event.sponsor) : '<p class="editorial-kicker">Presented by Kirtland Heritage Group</p>')+renderWeekendTextRecognition()}</div></section>
 <section class="editorial-section editorial-section--white"><div class="editorial-shell editorial-article"><div class="editorial-copy"><p class="editorial-kicker">${event.slug==='vip-dinner'?'The most intimate event of the weekend':'The experience'}</p><h2>${event.slug==='vip-dinner'?'And you’re invited.':event.slug==='piano-guys'?'Music in a remarkable setting.':'A moment to connect.'}</h2><p>${escape(event.description)}</p><p>${escape(event.detail)}</p>${event.slug==='vip-dinner'?'<p>Special prizes, giveaways, and gift bags add to the evening. Specific items will be shared when confirmed.</p>':''}<div class="event-actions">${action(event.url,event.cta)}</div></div><aside class="editorial-aside"><p class="editorial-kicker">Before you go</p><h2>Make your plans</h2><p>${escape(before)}</p><p>All times are Eastern. Questions? <a href="mailto:info@kirtlandheritagegroup.com">Contact our team</a>.</p></aside></div></section>
 <section class="editorial-section"><div class="editorial-shell"><p class="editorial-kicker">The venue</p><h2>${escape(event.venue)}</h2><div class="editorial-columns"><div class="editorial-copy"><p>${escape(v.intro)}</p>${venuePhoto(v)}</div><div class="event-venue-guide"><h3>Getting there</h3><address>${escape(event.address)}</address>${action('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(event.address),'Get directions','event-text-link')}<h3>Visitor information</h3><p>${escape(v.guide)}</p>${action(v.url,'Visit the venue website','event-text-link')}${(v.links||[]).map(([url,label])=>action(url,label,'event-text-link')).join('')}</div></div></div></section>
 <section class="editorial-section editorial-section--navy"><div class="editorial-shell"><p class="editorial-kicker">November 13–15</p><h2>Make a weekend of it.</h2><div class="event-related">${events.filter(e=>e.slug!==event.slug).slice(0,3).map(e=>`<a href="/${e.slug}/"><span>${escape(e.eyebrow)}</span><h3>${escape(e.title)}</h3><p>${escape(e.venue)} · ${escape(e.admission)}</p><strong>Event details →</strong></a>`).join('')}</div><a class="event-text-link" href="/#events">Explore all five experiences →</a></div></section>`});
};

export async function writeEventPages(outDir) {
  for (const event of events) {
    const dir = path.join(outDir, event.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), page(event), 'utf8');
  }
}
