import { readFile } from 'node:fs/promises';
import { renderImage } from '../design-system/image.mjs';

const manifest = JSON.parse(await readFile(new URL('../images/performers/manifest.json', import.meta.url), 'utf8'));
export const performers = [
  { id: 'shaan-sharma', name: 'Shaan Sharma', role: 'Shmuel' },
  { id: 'noah-james', name: 'Noah James', role: 'Andrew' },
  { id: 'vanessa-benavente', name: 'Vanessa Benavente', role: 'Mother Mary' },
  { id: 'yasmine-al-bustami', name: 'Yasmine Al-Bustami', role: 'Ramah' },
];

export function renderPhoto(id, { alt = '', sizes, priority = false, eager = false, className = '', position = 'center' } = {}) {
  const photo = manifest[id];
  if (!photo) throw Error(`Unknown approved photo: ${id}`);
  const fallback = photo.variants.find(v => v.width >= 480) || photo.variants.at(-1);
  return `<picture><source type="image/avif" srcset="${photo.variants.map(v => `${v.avif} ${v.width}w`).join(', ')}" sizes="${sizes}">${renderImage({ src: fallback.webp, alt, width: photo.width, height: photo.height, srcSet: photo.variants.map(v => ({ src: v.webp, width: v.width })), sizes, priority, eager, className, position })}</picture>`;
}
