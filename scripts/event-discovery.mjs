import { performers, renderPhoto } from './performer-images.mjs';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const action = (url,label,style='event-button') => `<a class="${style}" href="${escape(url)}"${url.startsWith('http')?' target="_blank" rel="noopener noreferrer"':''}>${escape(label)} <span aria-hidden="true">↗</span></a>`;
export function eventDiscovery(event) {
 if (event.slug === 'piano-guys') return `<section class="editorial-section event-discovery" aria-labelledby="event-preview-title"><div class="editorial-shell editorial-columns"><div class="editorial-copy"><p class="editorial-kicker">Plan a Saturday with live music</p><h2 id="event-preview-title">Live music in Akron</h2><p>Hear The Piano Guys in the setting of Akron Civic Theatre. The concert begins at 5:30 PM Eastern and doors open at 4:30 PM.</p><p>Get a feel for their music before choosing your seats: explore the artist’s official music videos. These videos introduce the artists; they do not announce the Akron concert’s setlist.</p>${action('https://thepianoguys.com/pages/music-videos','Watch official music videos','event-text-link')}</div><aside class="event-venue-guide"><p class="editorial-kicker">Tickets &amp; prices</p><h3>Choose your seats through Ticketmaster</h3><p>Check Ticketmaster for current prices, fees, and availability.</p><p>If you reserved complimentary concert tickets, pick them up at will call at Akron Civic Theatre.</p>${action(event.url,'View seats & current prices')}</aside></div></section>`;
 if (!['lakewood','fairlawn','chesterland'].includes(event.slug)) return '';
 return `<section class="editorial-section event-discovery" aria-labelledby="event-preview-title"><div class="editorial-shell"><p class="editorial-kicker">Meet the visiting cast</p><h2 id="event-preview-title">The people behind familiar characters</h2><p class="event-discovery-intro">Spend time with visiting cast members from The Chosen in ${escape(event.city)}. ${event.slug==='lakewood'?'The Lakewood evening features stories, testimony and audience questions.':'This free community meet-and-greet offers another way to take part in NEOChosen Weekend.'}</p><div class="event-guest-cards">${performers.map(person=>`<article>${renderPhoto(person.id,{alt:person.name,sizes:'(max-width:600px) 42vw, 22vw',position:'center 20%'})}<h3>${escape(person.name)}</h3><p>${escape(person.role)} in The Chosen</p></article>`).join('')}</div><p>${event.past ? 'This event took place Friday, November 13.' : event.soldOut ? 'Registration is closed.' : 'Reserve for this specific event through Zeffy. Admission is free and donations are optional.'}</p><div class="event-actions">${event.soldOut || event.past ? '' : action(event.url,'Reserve free tickets')}${action('/#performers','Explore the performers','event-text-link')}</div></div></section>`;
}
export function eventQuestions(event) {
 if (!['piano-guys','lakewood','fairlawn','chesterland'].includes(event.slug)) return '';
 const piano=event.slug==='piano-guys';
 const questions=piano?[
 ['How do I buy concert tickets?','Choose your seats and complete your purchase on Ticketmaster. Current prices, fees, availability and booking terms are shown there.'],
 ['Does a free weekend registration include the concert?','The Akron concert requires its own ticket. Reserved complimentary concert tickets will be at will call.'],
 ['When should I arrive?','The concert is Saturday, November 14, 2026 at 5:30 PM Eastern. Doors open at 4:30 PM. Use the venue links below for parking and accessibility information.']
 ]:event.soldOut?[
 ['Can I still register for this meet & greet?','Registration is closed because the meet & greet is sold out.'],
 ['What if I already have a ticket?','Bring your Zeffy confirmation for check-in.']
 ]:[
 ['Is this event free?','Yes. Admission is free, but registration through Zeffy is required. Donations are optional.'],
 ['What am I reserving?',`A place at ${event.title} at ${event.venue} on ${event.date}, ${event.time}. This reservation is for this event only.`],
 ['Where will I find my tickets?','Complete your reservation on Zeffy and check the confirmation it sends by email. Keep that confirmation handy for your visit.'],
 ['Does this include the Piano Guys concert in Akron?','No. The Saturday afternoon concert at Akron Civic Theatre is a separate paid event booked through Ticketmaster.']
 ];
 return `<section class="editorial-section editorial-section--white event-questions" aria-labelledby="event-questions-title"><div class="editorial-shell"><p class="editorial-kicker">${event.soldOut ? 'Before you go' : 'Before you book'}</p><h2 id="event-questions-title">Your questions, answered</h2>${questions.map(([q,a])=>`<details><summary>${escape(q)}</summary><p>${escape(a)}</p></details>`).join('')}<div class="event-actions">${event.soldOut || event.past ? '' : action(event.url,piano?'View tickets & prices':'Reserve free tickets')}${['piano-guys','lakewood'].includes(event.slug)?action('/'+event.slug+'/plan-your-visit/','Directions & visitor information','event-text-link'):''}</div></div></section>`;
}
