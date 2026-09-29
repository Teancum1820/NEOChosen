import { readFile } from 'node:fs/promises';

// Approved sponsor identities and relationships live in sponsors.json.
export const sponsors = JSON.parse(await readFile(new URL('./sponsors.json', import.meta.url), 'utf8'));
export const events = { akron: 'The Piano Guys Concert', fairlawn: 'Fairlawn Meet & Greet' };
const tiers = [
  ['weekend-presenting', 'Weekend Presenting Sponsor'],
  ['presenting', 'Event Presenting Sponsors'],
  ['platinum', 'Platinum Sponsor'],
  ['community', 'Community Partners']
];
const ids = new Set();
for (const s of sponsors) {
  if (!s.id || !s.name || ids.has(s.id)) throw Error('Sponsor records require unique IDs and names');
  ids.add(s.id);
  if (!tiers.some(([tier]) => tier === s.tier)) throw Error(`Unrecognized sponsor tier for ${s.name}`);
  if ((s.events || []).some(event => !events[event])) throw Error(`Unrecognized event for ${s.name}`);
}
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byTier = tier => sponsors.filter(s => s.tier === tier).sort((a, b) => (a.sortOrder ?? 100) - (b.sortOrder ?? 100));
const presenters = event => byTier('presenting').filter(s => s.events.includes(event));
const weekend = byTier('weekend-presenting')[0];
const external = s => `href="${escape(s.url)}" target="_blank" rel="noopener noreferrer"`;

// Artwork keeps its natural aspect ratio. Live name text is the fallback when
// approved logo artwork is unavailable; no imitation mark is manufactured.
export function renderSponsorLogo(s, { reversed = false, className = '' } = {}) {
  const artwork = reversed ? (s.logoReversed || s.logo) : s.logo;
  return artwork ? `<span class="neo-sponsor-art neo-sponsor-art--${escape(reversed ? 'dark' : (s.background || 'light'))}${className ? ` ${escape(className)}` : ''}"><img src="${escape(artwork)}" alt="${escape(s.name)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()"></span>` : '';
}
export const renderSponsorDescription = s => s.description ? `<p class="neo-sponsor-description">${escape(s.description)}</p>` : '';
const roleLines = s => s.roles?.length ? s.roles : s.events.map(event => `${events[event]} Presenting Sponsor`);

export function renderSponsorCard(s) {
  const role = s.tier === 'weekend-presenting' ? 'NEO Chosen Weekend Presenting Sponsor' : s.tier === 'platinum' ? 'Platinum Sponsor' : s.tier === 'community' ? 'Community Partner' : 'Event Presenting Sponsor';
  return `<article class="neo-sponsor-card neo-sponsor-card--${s.tier}" data-sponsor="${escape(s.id)}">
    <p class="neo-sponsor-tier">${role}</p>
    ${renderSponsorLogo(s, { reversed: s.tier === 'weekend-presenting' })}
    <div class="neo-sponsor-card-copy">
      <h3 class="neo-sponsor-name">${escape(s.name)}</h3>
      ${s.tier === 'presenting' ? `<ul class="neo-sponsor-roles">${roleLines(s).map(role => `<li>${escape(role)}</li>`).join('')}</ul>` : ''}
      ${renderSponsorDescription(s)}
      ${s.url ? `<a class="neo-sponsor-contact" ${external(s)} aria-label="Visit ${escape(s.name)} website">Visit ${escape(s.name)} <span aria-hidden="true">↗</span></a>` : ''}
    </div>
  </article>`;
}
export function renderSponsorTierSection(tier, title) {
  const group = byTier(tier);
  return group.length ? `<section class="neo-sponsor-section" aria-labelledby="${tier}-sponsors-heading"><h2 class="neo-sponsor-heading" id="${tier}-sponsors-heading">${title}</h2><div class="neo-sponsor-grid neo-sponsor-grid--${tier}">${group.map(renderSponsorCard).join('\n')}</div></section>` : '';
}
export const renderSponsorDirectory = () => tiers.map(([tier, title]) => renderSponsorTierSection(tier, title)).join('\n');

export function renderPresentingSponsorRibbon() {
  return weekend ? `<aside class="home-sponsor-ribbon" aria-label="NEO Chosen Weekend Presenting Sponsor"><div class="home-shell home-sponsor-ribbon-inner"><p>NEO CHOSEN WEEKEND PRESENTING SPONSOR</p><a ${external(weekend)} aria-label="Visit ${escape(weekend.name)} website">${renderSponsorLogo(weekend, { reversed: true })}</a></div></aside>` : '';
}
export function renderHomepageSponsorDirectory() {
  return tiers.map(([tier, title]) => {
    const group = byTier(tier);
    if (!group.length) return '';
    return `<div class="home-sponsor-tier home-sponsor-tier--${tier}"><h3>${title}</h3><div class="home-sponsor-list">${group.map(s => `<a class="home-sponsor-logo home-sponsor-logo--${escape(tier === 'weekend-presenting' ? 'dark' : (s.background || 'light'))}" data-sponsor="${escape(s.id)}" ${external(s)} aria-label="Visit ${escape(s.name)} website">${tier === 'platinum' && s.photo ? `<img class="home-sponsor-photo" src="${escape(s.photo)}" alt="" loading="lazy" decoding="async">` : ''}${renderSponsorLogo(s, { reversed: tier === 'weekend-presenting', className: 'home-sponsor-art' })}<span class="home-sponsor-meta"><strong>${escape(s.name)}</strong>${tier === 'presenting' ? `<small>${s.events.map(event => escape(events[event])).join(' · ')}</small>` : ''}</span></a>`).join('')}</div></div>`;
  }).join('');
}
export function renderEventSponsorCredit(event, { compact = false } = {}) {
  const group = presenters(event);
  if (!group.length) return '';
  const label = event === 'akron' ? 'The Piano Guys Concert Presenting Sponsor' : 'Fairlawn Meet & Greet Presenting Sponsors';
  return `<div class="neo-event-sponsor-credit${compact ? ' neo-event-sponsor-credit--compact' : ''}" data-sponsor-event="${escape(event)}" role="group" aria-label="${escape(label)}"><p class="neo-event-sponsor-label">${escape(label)}</p><div class="neo-event-sponsor-list">${group.map(s => `<a ${external(s)} aria-label="Visit ${escape(s.name)} website">${renderSponsorLogo(s)}<strong>${escape(s.name)}</strong></a>`).join('')}</div></div>`;
}
export const renderEventSponsors = event => renderEventSponsorCredit(event, { compact: true });
export function renderWeekendTextRecognition() {
  return weekend ? `<p class="neo-weekend-sponsor-credit"><strong>NEO Chosen Weekend Presenting Sponsor:</strong> <a ${external(weekend)}>${escape(weekend.name)}</a></p>` : '';
}
export function renderWeekendSponsorRecognition() {
  const platinum = byTier('platinum')[0];
  return `<aside class="neo-weekend-sponsor-credits" aria-label="Weekend sponsors">${renderWeekendTextRecognition()}${platinum ? `<p><strong>Platinum Sponsor:</strong> <a ${external(platinum)}>${escape(platinum.name)}</a></p>` : ''}<a href="/sponsors/">View all sponsors</a></aside>`;
}
export const renderPresentingRecognition = event => renderEventSponsorCredit(event);
export function applySponsorSystem(html) {
  return html.replace('<!-- SPONSOR_DIRECTORY -->', renderSponsorDirectory())
    .replace('<!-- HOMEPAGE_SPONSOR_DIRECTORY -->', renderHomepageSponsorDirectory())
    .replace('<!-- PRESENTING_SPONSOR_RIBBON -->', renderPresentingSponsorRibbon())
    .replace(/<!-- WEEKEND_PLATINUM_SPONSOR -->/g, renderWeekendSponsorRecognition())
    .replace(/<!-- WEEKEND_PRESENTING_CREDIT -->/g, renderWeekendTextRecognition())
    .replace(/<!-- EVENT_SPONSORS:(\w+) -->/g, (_, event) => {
      if (!events[event]) throw Error(`Unknown sponsor event: ${event}`);
      return renderEventSponsors(event);
    });
}
