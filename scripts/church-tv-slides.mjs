import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderImage } from "../design-system/image.mjs";
import { escape } from "./editorial-page.mjs";

const slides = [
  ["01_Weekend_Overview_TV", "NEO Chosen Weekend overview", "November 13–15 · All five weekend events"],
  ["02_VIP_Dinner_TV", "VIP Chosen Dinner", "Friday, November 13 · 5:00 PM · Windows on the River"],
  ["03_Lakewood_Cast_Evening_TV", "Lakewood — Evening with The Chosen Cast", "Friday, November 13 · 7:30 PM · Lakewood Civic Auditorium"],
  ["04_Piano_Guys_Concert_TV", "The Piano Guys Concert — Akron", "Saturday, November 14 · 4:00 PM · Akron Civic Theatre"],
  ["05_Fairlawn_Meet_Greet_TV", "Fairlawn Meet & Greet", "Saturday, November 14 · 7:00 PM · St. Hilary Church"],
  ["06_Chesterland_Meet_Greet_TV", "Chesterland Meet & Greet", "Sunday, November 15 · 2:00 PM · Mayfield United Methodist Church"],
];

export const churchTvSlides = await Promise.all(slides.map(async ([base, title, description]) => {
  const source = `media-kit/church-tv/${base}.jpg`;
  const hash = createHash("sha256").update(await readFile(source)).digest("hex").slice(0, 12);
  return {
    base, title, description, source,
    download: `/media-kit/church-tv/${base}-${hash}.jpg`,
    preview: `/images/media-previews/${base}-${hash}`,
  };
}));

export async function writeChurchTvSlides(outDir) {
  for (const slide of churchTvSlides)
    await writeFile(path.join(outDir, slide.download), await readFile(slide.source));
}

export function churchTvSection() {
  const cards = churchTvSlides.map(slide => {
    const title = escape(slide.title);
    const image = renderImage({
      src: `${slide.preview}-480.webp`,
      srcSet: [480, 900].map(width => ({src: `${slide.preview}-${width}.webp`, width})),
      width: 1920, height: 1080,
      sizes: "(max-width:800px) calc(100vw - 88px), 42vw",
      alt: `${slide.title} church lobby TV slide`,
      className: "church-tv-preview",
    });
    return `<article class="asset-card approved-media-card church-tv-card"><a class="asset-preview-link" href="${slide.download}" target="_blank" rel="noopener noreferrer" aria-label="View ${title} TV slide">${image}</a><div class="asset-info"><p class="editorial-kicker">1920 × 1080 · JPEG</p><h3>${title}</h3><p>${escape(slide.description)}</p><div class="asset-actions"><a class="editorial-button" href="${slide.download}" download="${slide.base}.jpg" aria-label="Download ${title} TV slide JPEG">Download JPEG</a></div></div></article>`;
  }).join("");
  return `<section class="editorial-section editorial-section--sand" id="church-lobby-tv-slides" aria-labelledby="church-lobby-tv-title"><div class="editorial-shell"><p class="editorial-kicker">For our church partners</p><h2 id="church-lobby-tv-title">Church Lobby TV Slides — 1920 × 1080</h2><p class="church-tv-intro">Download these landscape JPEGs for widescreen church lobby TVs and digital displays. Each slide includes its own NEO Chosen Weekend header and can be displayed on its own. Show the complete image at 16:9 without cropping or stretching. All event times are Eastern.</p><div class="approved-media-grid church-tv-grid">${cards}</div></div></section>`;
}
