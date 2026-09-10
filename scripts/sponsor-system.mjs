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
  if (!['presenting', 'community'].includes(sponsor.tier)) throw Error(`Unrecognized sponsor tier for ${sponsor.name}`);
  if (sponsor.events.some(event => !events[event])) throw Error(`Unrecognized event for ${sponsor.name}`);
}
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const presenters = event => sponsors.filter(s => s.tier === 'presenting' && s.events.includes(event));
const logo = s => `<div class="neo-sponsor-art neo-sponsor-art--${s.background || 'light'}">${s.logo
  ? `<img src="${escape(s.logo)}" alt="${escape(s.name)} logo" loading="lazy" decoding="async" referrerpolicy="no-referrer">`
  : `<span class="neo-sponsor-placeholder">${escape(s.name)}</span>`}</div>`;

export function renderSponsorCard(s, { event = false } = {}) {
  const presenting = s.tier === 'presenting';
  return `<article class="neo-sponsor-card neo-sponsor-card--${presenting ? 'presenting' : 'community'}${event ? ' neo-sponsor-card--event' : ''}" data-sponsor="${escape(s.id)}">
    ${presenting ? '<p class="neo-sponsor-tier">Presenting Sponsor</p>' : ''}
    ${logo(s)}
    <h3 class="neo-sponsor-name">${escape(s.name)}</h3>
    ${!event && presenting ? `<p class="neo-sponsor-scope">${s.events.map(e=>escape(events[e])).join('<br>')}</p>` : ''}
    ${s.phone ? `<a class="neo-sponsor-contact" href="tel:+1${s.phone.replace(/\D/g,'')}">${escape(s.phone)}</a>` : ''}
    ${s.url ? `<a class="neo-sponsor-contact" href="${escape(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="Visit ${escape(s.name)} website">${presenting && !event ? escape(s.linkLabel) : 'Visit website'}</a>` : ''}
  </article>`;
}

export function renderSponsorDirectory() {
  return [
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

export function renderEventSponsors(event) {
  const group = presenters(event);
  if(!group.length) return '';
  return `<div class="neo-event-sponsors" data-sponsor-event="${escape(event)}" role="group" aria-label="${escape(events[event])} presenting sponsors">
    <div class="neo-sponsor-grid neo-sponsor-grid--event">${group.map(s=>renderSponsorCard(s,{event:true})).join('\n')}</div>
  </div>`;
}

// The sponsorship portal keeps compact text recognition, from the same records.
export function renderPresentingRecognition(event) {
  return `<p class="presenting-recognition"><strong>${escape(events[event])} presenting sponsors:</strong> ${presenters(event).map(s=>`<a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.name)}</a>`).join(' and ')}.</p>`;
}

export function applySponsorSystem(html) {
  return html.replace('<!-- SPONSOR_DIRECTORY -->',renderSponsorDirectory())
    .replace(/<!-- EVENT_SPONSORS:(\w+) -->/g,(_,event)=>{
      if(!events[event]) throw Error(`Unknown sponsor event: ${event}`);
      return renderEventSponsors(event);
    });
}
