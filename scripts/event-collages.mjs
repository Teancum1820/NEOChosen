import { readFile } from 'node:fs/promises';
import { renderImage } from '../design-system/image.mjs';

const manifest = JSON.parse(await readFile(new URL('../images/collages/manifest.json', import.meta.url), 'utf8'));
const names = {lakewood:'chosen-cast',fairlawn:'chosen-and-piano-guys',chesterland:'chosen-and-piano-guys'};

export function eventCollage(slug) {
  const collage = manifest[names[slug]];
  if (!collage) return null;
  const fallback = collage.variants.find(image => image.width >= 800) || collage.variants.at(-1);
  return {...collage,src:fallback.src,alt:slug === 'lakewood' ? 'Collage of Noah James, Shaan Sharma, Vanessa Benavente and Yasmine Al-Bustami' : 'Collage of The Piano Guys with Noah James, Shaan Sharma, Vanessa Benavente and Yasmine Al-Bustami'};
}

export function renderEventCollage(collage) {
  return renderImage({src:collage.src,alt:collage.alt,width:collage.width,height:collage.height,srcSet:collage.variants,sizes:'(max-width:800px) min(100vw, 460px), 53vw',priority:true});
}
