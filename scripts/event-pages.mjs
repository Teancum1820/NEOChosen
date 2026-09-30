import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { renderWeekendTextRecognition, renderPresentingRecognition } from './sponsor-system.mjs';
import { renderPhoto } from './performer-images.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const events = [
  {
    slug: 'vip-dinner', title: 'VIP Donor Dinner', eyebrow: 'Friday · November 13', date: 'Friday, November 13, 2026', time: '5:00–6:45 PM Eastern', startDate: '2026-11-13T17:00:00-05:00', admission: 'Sponsor invitation · $200 per guest', venue: 'Windows on the River', city: 'Cleveland', street: '2000 Sycamore Street', zip: '44113', address: '2000 Sycamore Street, Cleveland, OH 44113', image: '/images/hero.webp', imageAlt: '',
    description: 'A private sponsor evening with The Piano Guys, cast members from The Chosen, and Northeast Ohio community and faith leaders.',
    detail: 'Each full $200 donated in a single transaction includes one dinner invitation while space remains. Business sponsorship packages are separate from individual dinner admissions.',
    cta: 'Become an Official Event Sponsor', url: 'https://www.zeffy.com/en-US/ticketing/vip-donor-dinner-with-the-chosen-and-piano-guys',
    secondary: '/donations/#vip-donor-dinner', secondaryLabel: 'How dinner sponsorship works'
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
    detail: 'Theater tickets are expected to be $50–$70. The official theater ticket link has not yet been announced; subscribe below for updates.',
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
const page = event => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(event.title)} | NEOChosen 2026</title>
  <meta name="description" content="${escape(`${event.date} at ${event.venue} in ${event.city}. ${event.description}`)}">
  <link rel="canonical" href="https://neochosen.com/${event.slug}/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="NEOChosen">
  <meta property="og:title" content="${escape(event.title)} | NEOChosen 2026">
  <meta property="og:description" content="${escape(event.description)}">
  <meta property="og:url" content="https://neochosen.com/${event.slug}/">
  <meta property="og:image" content="https://neochosen.com/images/${event.slug === 'chesterland' ? 'mayfield-united-methodist-church-logo.jpg' : 'NeoHeader.webp'}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escape(event.title)} | NEOChosen 2026">
  <meta name="twitter:description" content="${escape(event.description)}">
  <meta name="twitter:image" content="https://neochosen.com/images/${event.slug === 'chesterland' ? 'mayfield-united-methodist-church-logo.jpg' : 'NeoHeader.webp'}">
  <link rel="icon" type="image/png" href="/images/favicon.png">
  <link rel="manifest" href="/manifest.webmanifest">
  <meta name="theme-color" content="#171613">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&amp;family=Montserrat:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/site.css">
  <link rel="stylesheet" href="/sponsor-system.css">
  <link rel="stylesheet" href="/events/event.css">
  <script type="application/ld+json">${JSON.stringify(schema(event))}</script>
  <script src="/site.js" defer></script>
</head>
<body class="event-page">
  <nav class="site-nav" aria-label="Main navigation"></nav>
  <main id="main-content">
    <header class="event-hero">
      ${event.slug === 'vip-dinner' ? `<img src="${escape(event.image)}" alt="${escape(event.imageAlt)}" width="1448" height="1086" fetchpriority="high" decoding="async">` : renderPhoto(event.slug === 'piano-guys' ? 'piano-guys' : event.slug === 'lakewood' ? 'shaan-sharma' : event.slug === 'fairlawn' ? 'vanessa-benavente' : 'yasmine-al-bustami', { alt: event.imageAlt, sizes: '100vw', priority: true, position: 'center 30%' })}
      <div class="event-hero-shade"></div>
      <div class="event-shell event-hero-content">
        <p class="event-kicker">NEOChosen Weekend · ${escape(event.eyebrow)}</p>
        <h1>${escape(event.title)}</h1>
        <p class="event-lede">${escape(event.description)}</p>
        <div class="event-actions">${action(event.url,event.cta)}${event.secondary ? action(event.secondary,event.secondaryLabel,'event-button event-button-outline') : ''}</div>
      </div>
    </header>
    <section class="event-overview event-shell" aria-label="Event details">
      <div class="event-facts">
        <div><span>Date</span><strong>${escape(event.date)}</strong></div>
        <div><span>Time</span><strong>${escape(event.time)}</strong></div>
        <div><span>Venue</span><strong>${escape(event.venue)}</strong><p>${escape(event.address)}</p></div>
        <div><span>Admission</span><strong>${escape(event.admission)}</strong></div>
      </div>
      <div class="event-overview-copy">
        <p class="event-kicker">Plan your visit</p>
        <h2>Join us in <em>${escape(event.city)}</em></h2>
        <p>${escape(event.detail)}</p>
        <div class="event-recognition">${event.sponsor ? renderPresentingRecognition(event.sponsor) : ''}${renderWeekendTextRecognition()}</div>
        <div class="event-actions">${action(event.url,event.cta)}<a class="event-text-link" href="/#events">View the full weekend lineup</a></div>
      </div>
    </section>
  </main>
  <footer class="site-footer"></footer>
  <script src="/pwa-register.js" defer></script>
</body>
</html>`;

export async function writeEventPages(outDir) {
  for (const event of events) {
    const dir = path.join(outDir, event.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), page(event), 'utf8');
  }
}
