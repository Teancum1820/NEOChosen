import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { escape } from "./editorial-page.mjs";
import { renderImage } from "../design-system/image.mjs";

const items = [
  { id: "akron", base: "2026-akron-piano-guys-concert", title: "The Piano Guys — Akron", description: "Saturday, November 14 · 4:00 PM · Akron Civic Theatre", route: "/piano-guys/" },
  { id: "fairlawn", base: "2026-fairlawn-meet-and-greet", title: "Fairlawn Meet & Greet", description: "Saturday, November 14 · 7:00 PM · St. Hilary Church", route: "/fairlawn/" },
  { id: "vip", base: "2026-vip-sponsor-dinner", title: "VIP Sponsor Dinner", description: "Friday, November 13 · Dinner 5:00 PM · Windows on the River", route: "/vip-dinner/" },
  { id: "weekend", base: "2026-weekend-schedule", title: "Master Weekend Schedule", description: "November 13–15 · Five events across Northeast Ohio", route: "/#events" },
];
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex").slice(0, 12);
export const mediaStyles = `/media-kit/media-kit.css?v=${digest(await readFile("media-kit/media-kit.css"))}`;
export const approvedMedia = await Promise.all(items.map(async (item) => {
  const pdf = await readFile(`media-kit/${item.base}.pdf`);
  const png = await readFile(`media-kit/${item.base}.png`);
  const asset = {
    ...item,
    width: png.readUInt32BE(16), height: png.readUInt32BE(20),
    pdf: `/media-kit/${item.base}-${digest(pdf)}.pdf`,
    png: `/media-kit/${item.base}-${digest(png)}.png`,
    preview: `/images/media-previews/${item.base}-${digest(png)}`,
  };
  if (item.id === "weekend") {
    const letter = await readFile("media-kit/2026-weekend-schedule-letter.pdf");
    asset.letter = `/media-kit/2026-weekend-schedule-letter-${digest(letter)}.pdf`;
  }
  return asset;
}));

export async function writeApprovedMedia(outDir) {
  for (const asset of approvedMedia) {
    for (const extension of ["pdf", "png"])
      await writeFile(path.join(outDir, asset[extension]), await readFile(`media-kit/${asset.base}.${extension}`));
    if (asset.letter)
      await writeFile(path.join(outDir, asset.letter), await readFile("media-kit/2026-weekend-schedule-letter.pdf"));
  }
}

export function mediaImage(asset, sizes = "(max-width:800px) calc(100vw - 96px), 38vw") {
  return renderImage({
    src: `${asset.preview}-480.webp`,
    srcSet: [480, 900].map(width => ({ src: `${asset.preview}-${width}.webp`, width })),
    width: asset.width, height: asset.height,
    alt: `${asset.title} official flyer`, sizes,
    className: "asset-preview",
  });
}
const download = (url, label, className = "editorial-button", aria) =>
  `<a class="${className}" href="${escape(url)}" download${aria ? ` aria-label="${escape(aria)}"` : ""}>${escape(label)}</a>`;

export function mediaCard(asset) {
  return `<article class="asset-card approved-media-card" id="${asset.id}-flyer">
    <a class="asset-preview-link" href="${asset.pdf}" target="_blank" rel="noopener noreferrer" aria-label="View ${escape(asset.title)} PDF">${mediaImage(asset)}</a>
    <div class="asset-info"><p class="editorial-kicker">${asset.id === "weekend" ? "Print-ready PDFs" : "Event flyer"}</p><h3>${escape(asset.title)}</h3><p>${escape(asset.description)}</p>
    ${asset.letter ? '<p class="media-print-note">11×17 is the primary poster format. Choose 8.5×11 for home or office printing.</p>' : ""}
    <div class="asset-actions">${asset.letter ? download(asset.pdf, 'PRINT 11" × 17"') + download(asset.letter, 'PRINT 8.5" × 11"', "editorial-link") : download(asset.pdf, "Download PDF", "editorial-button", `Download ${asset.title} PDF`)}</div>
    <div class="asset-secondary">${download(asset.png, "Download PNG", "editorial-link", `Download ${asset.title} PNG`)}<a class="editorial-link" href="${asset.route}">${asset.id === "weekend" ? "Weekend event details" : "Event details"} <span aria-hidden="true">→</span></a></div></div></article>`.replace(/^[ \t]+$/gm, "");
}

export function eventFlyer(slug) {
  const asset = approvedMedia.find(item => item.route === `/${slug}/`);
  if (!asset) return "";
  return `<section class="editorial-section editorial-section--white event-flyer" id="event-flyer"><div class="editorial-shell event-flyer-layout"><a class="asset-preview-link" href="${asset.pdf}" target="_blank" rel="noopener noreferrer" aria-label="View ${escape(asset.title)} PDF">${mediaImage(asset, "(max-width:800px) calc(100vw - 48px), 280px")}</a><div><p class="editorial-kicker">Official event artwork</p><h2>${escape(asset.title)} flyer</h2><p>Download the flyer to print or share with your community.</p>${download(asset.pdf, "Download PDF", "editorial-button", `Download ${asset.title} PDF`)}<p><a class="editorial-link" href="/media-kit/#${asset.id}-flyer">Explore the media kit <span aria-hidden="true">→</span></a></p></div></div></section>`;
}
