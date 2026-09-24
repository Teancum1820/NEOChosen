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
const logo = s => `<${identityLink(s) ? `a ${linkAttributes(s)}` : 'div'} class="neo-sponsor-art neo-sponsor-art--${s.background || 'light'}">${s.logo
  ? `<img src="${escape(s.logo)}" alt="${escape(s.alt || `${s.name} logo`)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`
  : `<span class="neo-sponsor-placeholder">${escape(s.name)}</span>`}</${identityLink(s) ? 'a' : 'div'}>`;

export function renderSponsorCard(s, { event = false, eventId = '' } = {}) {
  const presenting = s.tier === 'presenting';
  const platinum = s.tier === 'platinum';
  const weekendPresenting = s.tier === 'weekend-presenting';
  return `<article class="neo-sponsor-card neo-sponsor-card--${s.tier}${event ? ' neo-sponsor-card--event' : ''}" data-sponsor="${escape(s.id)}">
    ${weekendPresenting ? '<p class="neo-sponsor-tier">NEO Chosen Weekend Presenting Sponsor</p>' : presenting ? `<p class="neo-sponsor-tier">${eventId === 'akron' ? 'The Piano Guys Concert Presenting Sponsor' : 'Presenting Sponsor'}</p>` : platinum ? '<p class="neo-sponsor-tier">Platinum Sponsor</p>' : ''}
    ${logo(s)}
    <h3 class="neo-sponsor-name">${identityLink(s) ? `<a class="neo-sponsor-identity" ${linkAttributes(s)}>${escape(s.name)}</a>` : escape(s.name)}</h3>
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

export function renderWeekendSponsorRecognition() {
  const presentingSponsor = sponsors.find(s => s.tier === 'weekend-presenting');
  const platinumSponsor = sponsors.find(s => s.tier === 'platinum');
  const presentingBlock = presentingSponsor ? `<aside class="neo-weekend-sponsor neo-weekend-sponsor--presenting" aria-label="NEO Chosen Weekend Presenting Sponsor">
    <p class="neo-weekend-sponsor-tier">NEO Chosen Weekend Presenting Sponsor</p>
    <a class="neo-weekend-sponsor-logo" ${linkAttributes(presentingSponsor)} aria-label="Visit ${escape(presentingSponsor.name)} website">
      <img src="${escape(presentingSponsor.logo)}" alt="${escape(presentingSponsor.alt)}" loading="lazy" decoding="async">
    </a>
    <div class="neo-weekend-sponsor-copy">
      <p class="neo-weekend-sponsor-name"><a ${linkAttributes(presentingSponsor)}>${escape(presentingSponsor.name)}</a></p>
      <p class="neo-weekend-sponsor-description">Great Lakes Auto Group is the Presenting Sponsor of NEO Chosen Weekend. We are grateful for their support in helping bring this special weekend of music, faith, and community to Northeast Ohio.</p>
    </div>
    <a class="neo-weekend-sponsor-link" ${linkAttributes(presentingSponsor)}>Visit Great Lakes Auto Group</a>
  </aside>` : '';
  if (!platinumSponsor) return presentingBlock;
  return presentingBlock + `<aside class="neo-weekend-sponsor" aria-label="NEOChosen weekend Platinum Sponsor">
    <p class="neo-weekend-sponsor-tier">NEOChosen Platinum Sponsor</p>
    <a class="neo-weekend-sponsor-logo" ${linkAttributes(platinumSponsor)} aria-label="Visit ${escape(platinumSponsor.name)} website">
      <img src="${escape(platinumSponsor.logo)}" alt="${escape(platinumSponsor.name)} logo" loading="lazy" decoding="async">
    </a>
    <div class="neo-weekend-sponsor-copy">
      <p class="neo-weekend-sponsor-name"><a ${linkAttributes(platinumSponsor)}>${escape(platinumSponsor.name)}</a></p>
      <p class="neo-weekend-sponsor-tagline">${escape(platinumSponsor.tagline)}</p>
    </div>
    <a class="neo-weekend-sponsor-link" ${linkAttributes(platinumSponsor)} aria-label="Visit ${escape(platinumSponsor.name)} website">Visit Website</a>
  </aside>`;
}

export function renderEventSponsors(event) {
  const group = presenters(event);
  if(!group.length) return '';
  return `<div class="neo-event-sponsors" data-sponsor-event="${escape(event)}" role="group" aria-label="${escape(events[event])} presenting sponsors">
    ${event === 'akron' ? '<p class="neo-event-presenter">Presented by: Kirtland Heritage Group</p>' : ''}
    <div class="neo-sponsor-grid neo-sponsor-grid--event">${group.map(s=>renderSponsorCard(s,{event:true,eventId:event})).join('\n')}</div>
    ${renderWeekendTextRecognition()}
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
    .replace(/<!-- WEEKEND_PLATINUM_SPONSOR -->/g,renderWeekendSponsorRecognition())
    .replace(/<!-- WEEKEND_PRESENTING_CREDIT -->/g,renderWeekendTextRecognition())
    .replace(/<!-- EVENT_SPONSORS:(\w+) -->/g,(_,event)=>{
      if(!events[event]) throw Error(`Unknown sponsor event: ${event}`);
      return renderEventSponsors(event);
    });
}
