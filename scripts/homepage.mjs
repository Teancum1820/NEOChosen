import { events } from './event-pages.mjs';
import { performers, renderPhoto } from './performer-images.mjs';
import { renderEventSponsors, renderWeekendTextRecognition } from './sponsor-system.mjs';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const action = (event, label = event.cta) => `<a class="home-event-cta" href="${escape(event.url)}"${event.url.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escape(label)} <span aria-hidden="true">↗</span></a>`;
const renderEvents = () => events.map(event => `<article class="home-event-card${event.slug === 'piano-guys' ? ' home-event-card-featured' : ''}"${event.slug === 'piano-guys' ? ' id="piano-guys-event"' : ''} data-event="${event.slug}">
  <div class="home-event-top"><p class="home-event-day">${escape(event.eyebrow.replace('November', 'Nov'))}</p><p class="home-status">${escape(event.admission)}</p></div>
  <div class="home-event-body"><h3>${escape(event.title)}</h3><p class="home-event-time">${escape(event.time)}</p><p class="home-event-location">${escape(event.venue)} <span>·</span> ${escape(event.city)}</p>${event.sponsor ? renderEventSponsors(event.sponsor) : ''}${renderWeekendTextRecognition()}</div>
  <div class="home-event-bottom">${action(event)}<a class="home-event-secondary" href="/${event.slug}/">Event details <span class="sr-only">for ${escape(event.title)}</span><span aria-hidden="true">→</span></a></div>
</article>`).join('\n');
const piano = events.find(event => event.slug === 'piano-guys');

export function applyHomepage(html) {
  return html
    .replace('<!-- HERO_PHOTOGRAPHY -->', `<div class="home-hero-photos"><div class="home-hero-piano">${renderPhoto('piano-guys', { alt: 'The Piano Guys standing together with a cello in a red rock landscape', sizes: '(max-width: 899px) 100vw, (min-width: 1200px) max(35vw, 930px), 830px', priority: true, className: 'home-hero-image' })}</div><div class="home-hero-cast">${performers.map(person => renderPhoto(person.id, { alt: person.name, sizes: '(max-width: 899px) 25vw, (min-width: 1200px) 350px, 310px', eager: true, position: 'center 20%' })).join('')}</div></div>`)
    .replace('<!-- HOMEPAGE_EVENTS -->', renderEvents())
    .replace('<!-- PIANO_FEATURE -->', `<div class="home-piano-photo">${renderPhoto('piano-guys', { alt: 'The Piano Guys with a cello on a sandstone overlook', sizes: '(max-width: 899px) 100vw, 51vw' })}</div><div class="home-piano-copy"><p class="home-kicker">${escape(piano.eyebrow)}</p><h2 id="piano-feature-title">The Piano<br>Guys Live</h2><p class="home-piano-facts">${escape(piano.time)}<br>${escape(piano.venue)}</p><p class="home-piano-facts">${escape(piano.admission)}</p>${renderEventSponsors(piano.sponsor)}<div class="home-actions"><a class="home-button home-button-gold" href="${escape(piano.url)}" target="_blank" rel="noopener noreferrer">${escape(piano.cta)} <span aria-hidden="true">↗</span></a><a class="home-text-link" href="/piano-guys/">Concert details →</a></div></div>`)
    .replace('<!-- HOMEPAGE_PERFORMERS -->', performers.map(person => `<article class="home-performer-card">${renderPhoto(person.id, { alt: person.name, sizes: '(max-width: 899px) 45vw, 21vw', position: 'center 20%' })}<div><h3>${escape(person.name)}</h3><p>${escape(person.role)}</p></div></article>`).join('\n'));
}
