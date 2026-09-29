import { readFile } from 'node:fs/promises';

// Event scope and tiers are confirmed facts, not inferred from contribution amounts.
export const sponsors = JSON.parse(await readFile(new URL('./sponsors.json', import.meta.url), 'utf8'));
export const events = {
  akron: 'The Piano Guys LIVE in Akron',
  fairlawn: 'Fairlawn / St. Hilary Meet & Greet'
};
const sponsorIds = new Set();
for (const sponsor of sponsors) {
  if (sponsorIds.has(sponsor.id) || !sponsor.id || !sponsor.name) throw Error('Sponsor records require unique IDs and names');
  sponsorIds.add(sponsor.id);
  if (!['weekend-presenting', 'platinum', 'presenting', 'community'].includes(sponsor.tier)) throw Error(`Unrecognized sponsor tier for ${sponsor.name}`);
  if (sponsor.events.some(event => !events[event])) throw Error(`Unrecognized event for ${sponsor.name}`);
}
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const presenters = event => sponsors.filter(s => s.tier === 'presenting' && s.events.includes(event));
const identityLink = s => s.linkIdentity && s.url;
const linkAttributes = s => `href="${escape(s.url)}" target="_blank" rel="noopener noreferrer"`;
const logo = s => s.logo ? `<${identityLink(s) ? `a ${linkAttributes(s)}` : 'div'} class="neo-sponsor-art neo-sponsor-art--${s.background || 'light'}"><img src="${escape(s.logo)}" alt="${escape(s.alt || `${s.name} logo`)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()"></${identityLink(s) ? 'a' : 'div'}>` : '';

export function renderSponsorCard(s, { event = false, eventId = '' } = {}) {
  const presenting = s.tier === 'presenting';
  const platinum = s.tier === 'platinum';
  const weekendPresenting = s.tier === 'weekend-presenting';
  return `<article class="neo-sponsor-card neo-sponsor-card--${s.tier}${event ? ' neo-sponsor-card--event' : ''}" data-sponsor="${escape(s.id)}">
    ${weekendPresenting ? '<p class="neo-sponsor-tier">NEO Chosen Weekend Presenting Sponsor</p>' : presenting ? `<p class="neo-sponsor-tier">${eventId === 'akron' ? 'The Piano Guys Concert Presenting Sponsor' : 'Presenting Sponsor'}</p>` : platinum ? '<p class="neo-sponsor-tier">Platinum Sponsor</p>' : ''}
    ${logo(s)}
    <h3 class="neo-sponsor-name">${identityLink(s) ? `<a class="neo-sponsor-identity" ${linkAttributes(s)}>${escape(s.name)}</a>` : escape(s.name)}</h3>
    ${!event && s.description ? `<p class="neo-sponsor-description">${escape(s.description)}</p>` : ''}
    ${!event && presenting ? `<p class="neo-sponsor-scope">${s.events.map(e=>escape(events[e])).join('<br>')}</p>` : ''}
    ${!event && platinum && s.scope ? `<p class="neo-sponsor-scope">${escape(s.scope)}</p>` : ''}
    ${!event && platinum && s.tagline ? `<p class="neo-sponsor-tagline">${escape(s.tagline)}</p>` : ''}
    ${!event && platinum && s.photo ? `<figure class="neo-sponsor-photo"><img src="${escape(s.photo)}" alt="${escape(s.photoAlt || '')}" loading="lazy" decoding="async"></figure>` : ''}
    ${s.phone ? `<a class="neo-sponsor-contact" href="tel:+1${s.phone.replace(/\D/g,'')}">${escape(s.phone)}</a>` : ''}
    ${s.url && (!identityLink(s) || platinum || weekendPresenting) ? `<a class="neo-sponsor-contact" href="${escape(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="Visit ${escape(s.name)} website">${!event && s.linkLabel ? escape(s.linkLabel) : 'Visit website'}</a>` : ''}
  </article>`;
}

export function renderSponsorDirectory() {
  return [
    ['weekend-presenting', 'NEO Chosen Weekend Presenting Sponsor'],
    ['platinum', 'Platinum Sponsor'],
    ['presenting', 'Presenting Sponsors'],
    ['community', 'Community Partners']
  ].map(([tier,title])=>{
    const group=sponsors.filter(s=>s.tier===tier);
    if(!group.length) return '';
    return `<section class="neo-sponsor-section" aria-labelledby="${tier}-sponsors-heading">
      <h2 class="neo-sponsor-heading" id="${tier}-sponsors-heading">${title}</h2>
      <div class="neo-sponsor-grid neo-sponsor-grid--${tier}">${group.map(s=>renderSponsorCard(s)).join('\n')}</div>
    </section>`;
  }).join('\n');
}

// A compact recognition system for the homepage. The organizer and performers
// have their own roles and are not sponsor records.
export function renderHomepageSponsorDirectory() {
  const groups = [
    ['weekend-presenting', 'Weekend Presenting Sponsor'],
    ['presenting', 'Event Presenting Sponsors'],
    ['platinum', 'Platinum Sponsor'],
    ['community', 'Community Partners']
  ];
  return groups.map(([tier, title]) => {
    const members = sponsors.filter(s => s.tier === tier);
    if (!members.length) return '';
    return `<div class="home-sponsor-tier home-sponsor-tier--${tier}">
      <h3>${title}</h3>
      <div class="home-sponsor-list">${members.map(s => {
        const artwork = tier === 'weekend-presenting' ? '/images/great-lakes-auto-group-white.webp' : s.logo;
        const artBackground = tier === 'weekend-presenting' ? 'dark' : (s.background || 'light');
        const scope = tier === 'presenting' ? s.events.map(e => e === 'akron' ? 'The Piano Guys concert' : 'Fairlawn Meet &amp; Greet').join(' · ') : '';
        return `<a class="home-sponsor-logo home-sponsor-logo--${escape(artBackground)}" data-sponsor="${escape(s.id)}" ${linkAttributes(s)} aria-label="Visit ${escape(s.name)} website">
          ${tier === 'platinum' && s.photo ? `<img class="home-sponsor-photo" src="${escape(s.photo)}" alt="${escape(s.photoAlt || '')}" loading="lazy" decoding="async">` : ''}
          ${artwork ? `<span class="home-sponsor-art"><img src="${escape(artwork)}" alt="${escape(s.name)} logo" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()"></span>` : ''}
          <span class="home-sponsor-meta"><strong>${escape(s.name)}</strong>${scope ? `<small>${scope}</small>` : ''}</span>
        </a>`;
      }).join('')}</div>
    </div>`;
  }).join('');
}

export function renderWeekendSponsorRecognition() {
  const presentingSponsor = sponsors.find(s => s.tier === 'weekend-presenting');
  const platinumSponsor = sponsors.find(s => s.tier === 'platinum');
  return `<aside class="neo-weekend-sponsor-credits" aria-label="Weekend sponsors">
    ${presentingSponsor ? `<p><strong>NEO Chosen Weekend Presenting Sponsor:</strong> <a ${linkAttributes(presentingSponsor)}>${escape(presentingSponsor.name)}</a></p>` : ''}
    ${platinumSponsor ? `<p><strong>Platinum Sponsor:</strong> <a ${linkAttributes(platinumSponsor)}>${escape(platinumSponsor.name)}</a></p>` : ''}
    <a href="/sponsors/">View all sponsors</a>
  </aside>`;
}

export function renderEventSponsors(event) {
  const group = presenters(event);
  if(!group.length) return '';
  return `<div class="home-event-sponsors" data-sponsor-event="${escape(event)}" role="group" aria-label="${escape(events[event])} presenting sponsors">
    ${event === 'akron' ? '<p class="home-event-organizer">Presented by Kirtland Heritage Group</p>' : ''}
    <p class="home-event-sponsor-label">${event === 'akron' ? 'The Piano Guys Concert Presenting Sponsor' : 'Fairlawn Meet &amp; Greet Presenting Sponsors'}</p>
    <div class="home-event-sponsor-list">${group.map(s => `<a ${linkAttributes(s)} aria-label="Visit ${escape(s.name)} website">${s.logo ? `<img src="${escape(s.logo)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">` : ''}<strong>${escape(s.name)}</strong></a>`).join('')}</div>
  </div>`;
}

export function renderWeekendTextRecognition() {
  const sponsor = sponsors.find(s => s.tier === 'weekend-presenting');
  return sponsor ? `<p class="neo-weekend-sponsor-credit"><strong>NEO Chosen Weekend Presenting Sponsor:</strong> <a ${linkAttributes(sponsor)}>${escape(sponsor.name)}</a></p>` : '';
}

// The sponsorship portal keeps compact text recognition, from the same records.
export function renderPresentingRecognition(event) {
  return `<p class="presenting-recognition"><strong>${event === 'akron' ? 'The Piano Guys Concert Presenting Sponsor' : `${escape(events[event])} presenting sponsors`}:</strong> ${presenters(event).map(s=>`<a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.name)}</a>`).join(' and ')}.</p>`;
}

export function applySponsorSystem(html) {
  return html.replace('<!-- SPONSOR_DIRECTORY -->',renderSponsorDirectory())
    .replace('<!-- HOMEPAGE_SPONSOR_DIRECTORY -->',renderHomepageSponsorDirectory())
    .replace(/<!-- WEEKEND_PLATINUM_SPONSOR -->/g,renderWeekendSponsorRecognition())
    .replace(/<!-- WEEKEND_PRESENTING_CREDIT -->/g,renderWeekendTextRecognition())
    .replace(/<!-- EVENT_SPONSORS:(\w+) -->/g,(_,event)=>{
      if(!events[event]) throw Error(`Unknown sponsor event: ${event}`);
      return renderEventSponsors(event);
    });
}
