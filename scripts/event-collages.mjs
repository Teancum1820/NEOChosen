import { performers, renderPhoto } from './performer-images.mjs';

// Assemble the current roster from source photographs to avoid stale guests
// in event artwork after a lineup change.
export function eventCollage(slug) {
  if (!['lakewood', 'fairlawn', 'chesterland', 'vip-dinner'].includes(slug)) return null;
  return { includePiano: slug !== 'lakewood' };
}

export function renderEventCollage({ includePiano }, { priority = true } = {}) {
  const sizes = '(max-width:800px) 45vw, 25vw';
  const cast = performers.map(person => `<div class="event-cast-photo" data-cast-member="${person.id}">${renderPhoto(person.id, { alt: `${person.name} (${person.role})`, sizes, eager: true, position: 'center 20%' })}</div>`).join('');
  const piano = includePiano ? `<div class="event-cast-photo event-cast-piano">${renderPhoto('piano-guys', { alt: 'The Piano Guys standing together with a cello', sizes: '(max-width:800px) 90vw, 50vw', priority, position: 'center 30%' })}</div>` : '';
  return `<div class="event-cast-grid${includePiano ? ' event-cast-grid--with-piano' : ''}">${piano}${cast}</div>`;
}
