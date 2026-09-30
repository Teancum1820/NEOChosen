import { readFile } from 'node:fs/promises';

// Approved sponsor identities and relationships live in sponsors.json.
export const sponsors = JSON.parse(await readFile(new URL('./sponsors.json', import.meta.url), 'utf8'));
export const events = { akron: 'The Piano Guys Concert', fairlawn: 'Fairlawn Meet & Greet' };
const tiers = [
  ['weekend-presenting', 'Weekend Presenting Sponsor'],
  ['presenting', 'Event Presenting Sponsors'],
  ['platinum', 'Platinum Sponsor'],
  ['silver', 'Silver Sponsor'],
  ['prayer', 'Official Prayer Sponsor'],
  ['community', 'Community Partners'],
  ['program-advertiser', 'Program Advertiser']
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
// approved logo artwork is unavailable. The two sign-based wordmarks were
// requested by Caleb and are documented with the supplied references.
export function renderSponsorLogo(s, { reversed = false, className = '', decorative = false } = {}) {
  const artwork = reversed ? (s.logoReversed || s.logo) : s.logo;
  return artwork ? `<span class="neo-sponsor-art neo-sponsor-art--${escape(reversed ? 'dark' : (s.background || 'light'))}${className ? ` ${escape(className)}` : ''}"><img src="${escape(artwork)}" alt="${decorative ? '' : escape(s.name)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()"></span>` : '';
}
export const renderSponsorDescription = s => s.description ? `<p class="neo-sponsor-description">${escape(s.description)}</p>` : '';
const roleLines = s => s.roles?.length ? s.roles : s.events.map(event => `${events[event]} Presenting Sponsor`);

export function renderSponsorCard(s) {
  const role = s.tier === 'weekend-presenting' ? 'NEO Chosen Weekend Presenting Sponsor' : s.tier === 'platinum' ? 'Platinum Sponsor' : s.tier === 'community' ? 'Community Partner' : 'Event Presenting Sponsor';
  return `<article class="neo-sponsor-card neo-sponsor-card--${s.tier}" data-sponsor="${escape(s.id)}">
    <p class="neo-sponsor-tier">${role}</p>
    ${renderSponsorLogo(s, { reversed: s.tier === 'weekend-presenting', decorative: true })}
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
export function renderSponsorDirectory() {
  const major = byTier('platinum')[0];
  const compact = (tier,title) => {
    const group = byTier(tier);
    return group.length ? `<section class="sponsor-editorial-section" aria-labelledby="${tier}-sponsors-heading"><div class="editorial-shell"><p class="editorial-kicker">With gratitude</p><h2 id="${tier}-sponsors-heading">${title}</h2><div class="sponsor-partner-grid">${group.map(s=>`<article data-sponsor="${escape(s.id)}">${renderSponsorLogo(s,{decorative:true})}<h3>${escape(s.name)}</h3>${s.description ? `<p>${escape(s.description)}</p>`:''}${s.phone ? `<a class="sponsor-partner-phone" href="tel:+1${s.phone.replaceAll('-','')}">${escape(s.phone)}</a>`:''}${s.url ? `<a class="editorial-link" ${external(s)}>Visit website <span class="sr-only">for ${escape(s.name)}</span><span aria-hidden="true">↗</span></a>`:''}</article>`).join('')}</div></div></section>` : '';
  };
  return `<section class="sponsor-weekend-feature" aria-labelledby="weekend-presenting-sponsors-heading"><div class="editorial-shell"><div data-sponsor="${weekend.id}"><p class="editorial-kicker">NEO Chosen Weekend Presenting Sponsor</p><h2 id="weekend-presenting-sponsors-heading">${escape(weekend.name)}</h2><p>Presenting partner across November 13–15, 2026. Thank you for helping bring five experiences of music, conversation, faith, and community to Northeast Ohio.</p><a class="editorial-link" ${external(weekend)}>Visit Great Lakes Auto Group <span aria-hidden="true">↗</span></a></div><a ${external(weekend)} aria-label="Visit Great Lakes Auto Group">${renderSponsorLogo(weekend,{decorative:true})}</a></div></section>
  <section class="sponsor-editorial-section" aria-labelledby="presenting-sponsors-heading"><div class="editorial-shell"><p class="editorial-kicker">Event Presenting Sponsors</p><h2 id="presenting-sponsors-heading">Partners at the heart of each event.</h2><div class="sponsor-presenter-grid">${byTier('presenting').map(s=>`<article data-sponsor="${escape(s.id)}">${renderSponsorLogo(s,{decorative:true})}<h3>${escape(s.name)}</h3><ul>${roleLines(s).map(role=>`<li>${escape(role)}</li>`).join('')}</ul><a class="editorial-link" ${external(s)}>Visit ${escape(s.name)} <span aria-hidden="true">↗</span></a></article>`).join('')}</div></div></section>
  ${major ? `<section class="sponsor-platinum-feature" aria-labelledby="platinum-sponsors-heading"><div class="editorial-shell" data-sponsor="${escape(major.id)}"><div><p class="editorial-kicker">Platinum Sponsor</p><h2 id="platinum-sponsors-heading">${escape(major.name)}</h2><p>${escape(major.description)}</p><p>${escape(major.tagline)}</p><a class="editorial-link" ${external(major)}>Visit ${escape(major.name)} <span aria-hidden="true">↗</span></a></div>${renderSponsorLogo(major,{decorative:true})}</div></section>`:''}
  ${compact('silver','Silver Sponsor')}${compact('prayer','Official Prayer Sponsor')}${compact('community','Community Partners')}${compact('program-advertiser','Program Advertiser')}`;
}

export function renderPresentingSponsorRibbon() {
  return weekend ? `<aside class="home-sponsor-ribbon" aria-label="NEO Chosen Weekend Presenting Sponsor"><div class="home-shell home-sponsor-ribbon-inner"><p>NEO CHOSEN WEEKEND<br>PRESENTING SPONSOR</p><a ${external(weekend)} aria-label="Visit ${escape(weekend.name)} website">${renderSponsorLogo(weekend, { decorative: true })}<span class="sr-only">${escape(weekend.name)}</span></a><p class="home-sponsor-weekend">NOV 13–15 <span aria-hidden="true">·</span> FIVE EXPERIENCES</p></div></aside>` : '';
}
export function renderHomepageSponsorDirectory() {
  return tiers.map(([tier, title]) => {
    const group = byTier(tier);
    if (!group.length) return '';
    return `<div class="home-sponsor-tier home-sponsor-tier--${tier}"><h3>${title}</h3><div class="home-sponsor-list">${group.map(s => `<a class="home-sponsor-logo home-sponsor-logo--${escape(s.background || 'light')}" data-sponsor="${escape(s.id)}" ${external(s)} title="Visit ${escape(s.name)} website">${renderSponsorLogo(s, { className: 'home-sponsor-art', decorative: true })}<span class="home-sponsor-meta"><strong>${escape(s.name)}</strong>${tier === 'presenting' ? `<small>${s.events.map(event => escape(events[event])).join(' · ')}</small>` : ''}${s.phone ? `<small>${escape(s.phone)}</small>`:''}</span></a>`).join('')}</div></div>`;
  }).join('');
}
export function renderEventSponsorCredit(event, { compact = false } = {}) {
  const group = presenters(event);
  if (!group.length) return '';
  const label = event === 'akron' ? 'The Piano Guys Concert Presenting Sponsor' : 'Fairlawn Meet & Greet Presenting Sponsors';
  return `<div class="neo-event-sponsor-credit${compact ? ' neo-event-sponsor-credit--compact' : ''}" data-sponsor-event="${escape(event)}" role="group" aria-label="${escape(label)}"><p class="neo-event-sponsor-label">${escape(label)}</p><div class="neo-event-sponsor-list">${group.map(s => `<a ${external(s)} aria-label="Visit ${escape(s.name)} website">${renderSponsorLogo(s, { decorative: true })}<strong>${escape(s.name)}</strong></a>`).join('')}</div></div>`;
}
export const renderEventSponsors = event => renderEventSponsorCredit(event, { compact: true });
export function renderEventPartnerLogos(event, { includeOrganizer = false } = {}) {
  const partners = event ? presenters(event).map(s => ({ ...s, displayRole: event === 'akron' ? 'The Piano Guys Concert Presenting Sponsor' : 'Fairlawn Meet & Greet Presenting Sponsor' })) : [];
  if (includeOrganizer) partners.push({ id:'kirtland-heritage-group', name:'Kirtland Heritage Group', logo:'/images/partners/kirtland-heritage-group.webp', url:'https://kirtlandheritagegroup.com/', background:'light', displayRole:'Presented by' });
  if (weekend) partners.push({ ...weekend, displayRole:'NEO Chosen Weekend Presenting Sponsor' });
  return `<div class="event-brand-grid"${event ? ` data-sponsor-event="${escape(event)}"` : ''} role="group" aria-label="Event partners">${partners.map(s => `<article class="event-brand" data-sponsor="${escape(s.id)}"><p class="neo-event-sponsor-label">${escape(s.displayRole)}</p><a ${external(s)} aria-label="Visit ${escape(s.name)} website">${renderSponsorLogo(s,{decorative:true})}<strong>${escape(s.name)}</strong></a></article>`).join('')}</div>`;
}
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
