import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { escape, page } from "./editorial-page.mjs";

export const raffleAnnouncement = JSON.parse(
  await readFile(new URL("../source-assets/raffle-announcement.json", import.meta.url), "utf8"),
);

export function renderRaffleAnnouncement() {
  const copy = raffleAnnouncement;
  return `<p>${escape(copy.intro)}</p><ul>${copy.events.map(event => `<li>${escape(event.announcement)}</li>`).join("")}</ul><p>${escape(copy.closing)}</p><p><strong>${escape(copy.online)}</strong> ${escape(copy.sunday)}</p>`;
}

export async function writeRafflePages(outDir) {
  const dir = path.join(outDir, "raffle");
  await mkdir(path.join(dir, "rules"), { recursive: true });
  await writeFile(path.join(dir, "index.html"), page({
    title: "50/50 Raffle — In Person Only | NEOChosen 2026",
    description: "In-person-only 50/50 raffle at four NEOChosen events November 13–14. Ends at St. Hilary on Saturday. No online raffle-ticket sales or Sunday raffle.",
    route: "/raffle/",
    extraHead: '<link rel="stylesheet" href="/raffle-promotion.css">',
    body: `<header class="editorial-hero"><div class="editorial-hero-copy"><p class="editorial-kicker">NEOChosen Weekend</p><h1>${escape(raffleAnnouncement.heading)}</h1></div></header><section class="editorial-section editorial-section--white"><div class="editorial-shell raffle-announcement">${renderRaffleAnnouncement()}</div></section>`,
  }));
  await writeFile(path.join(dir, "rules/index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow,noarchive"><meta http-equiv="refresh" content="0; url=/raffle/"><link rel="canonical" href="https://neochosen.com/raffle/"><title>Updated raffle announcement | NEOChosen</title></head><body><p>The previous online raffle rules have been retired. <a href="/raffle/">Read the current in-person raffle announcement.</a></p></body></html>`);
}

export function applyRafflePromotion(html, route) {
  const home = route === "/";
  const event = raffleAnnouncement.events.find(event => event.route === route);
  if (!home && !event) return html;
  const copy = raffleAnnouncement;
  if (event) {
    const final = route === "/fairlawn/" ? " This is the final raffle location." : "";
    const early = `<p class="raffle-early-event"><strong>50/50 raffle · In person only</strong><span>Tickets available here by cash or credit card.${final} No online raffle-ticket sales.</span></p>`;
    const firstAction = route === "/vip-dinner/" ? /(<div class="vip-reservation">[\s\S]*?<\/a>)/ : /(<div class="event-actions">[\s\S]*?<\/a>)/;
    if (!firstAction.test(html)) throw new Error(`In-person raffle placement missing on ${route}`);
    html = html.replace(firstAction, "$1" + early);
  }
  const content = home ? renderRaffleAnnouncement() : `<p>50/50 raffle tickets will be available for purchase in person only, by cash or credit card, at ${escape(event.venue)}.</p>${route === "/fairlawn/" ? "<p><strong>This is the final raffle location.</strong></p>" : ""}<p>${escape(copy.closing)} ${escape(copy.online)}</p><p>${escape(copy.sunday)}</p><p><a href="/raffle/">See all four participating events</a></p>`;
  const feature = `<section class="raffle-promotion${home ? " raffle-promotion--home" : ""}" aria-labelledby="weekend-raffle-title"><div class="raffle-promotion-shell"><div><p class="raffle-promotion-kicker">NEOChosen Weekend</p><h2 id="weekend-raffle-title">${escape(copy.heading)}</h2>${content}</div></div></section>`;
  html = html.replace("</head>", '<link rel="stylesheet" href="/raffle-promotion.css"></head>');
  const marker = home ? '<section class="home-overview' : route === "/vip-dinner/" ? '<section class="editorial-section editorial-section--white vip-experience' : '<section class="editorial-section"><div class="editorial-shell"><p class="editorial-kicker">The venue';
  if (!html.includes(marker)) throw new Error(`In-person raffle section missing on ${route}`);
  return html.replace(marker, feature + marker);
}
