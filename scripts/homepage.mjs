import { performers, renderPhoto } from './performer-images.mjs';

export function applyHomepage(html) {
  return html.replace('<!-- HERO_PHOTOGRAPHY -->', `<div class="home-hero-photos"><div class="home-hero-piano">${renderPhoto('piano-guys', { alt: 'The Piano Guys standing together with a cello in a red rock landscape', sizes: '(max-width: 899px) 100vw, (min-width: 1200px) max(35vw, 930px), 830px', priority: true, className: 'home-hero-image' })}</div><div class="home-hero-cast">${performers.map(person => renderPhoto(person.id, { alt: person.name, sizes: '(max-width: 899px) 25vw, (min-width: 1200px) 350px, 310px', eager: true, position: 'center 20%' })).join('')}</div></div>`);
}
