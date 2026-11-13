import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { escape, page } from "./editorial-page.mjs";

export const raffleAnnouncement = JSON.parse(
  await readFile(new URL("../source-assets/raffle-announcement.json", import.meta.url), "utf8"),
);

export function renderRaffleAnnouncement() {
  const copy = raffleAnnouncement;
  return `<p>${escape(copy.intro)}</p><ul>${copy.events.map(event => `<li>${escape(`${event.day}, November ${event.date} · ${event.name} at ${event.venue}`)}</li>`).join("")}</ul><p>${escape(copy.closing)}</p><p>${escape(copy.prize)}</p><p><strong>${escape(copy.online)}</strong> ${escape(copy.sunday)}</p>`;
}

function renderRaffleLanding() {
  const copy = raffleAnnouncement;
  return `<header class="raffle-landing-hero"><div class="editorial-shell raffle-landing-hero-grid">
    <div class="raffle-landing-copy"><p class="raffle-landing-eyebrow">NEOChosen Weekend · November 13–14, 2026</p><h1>${escape(copy.heading)}</h1><p class="raffle-landing-intro">${escape(copy.intro)}</p><a class="raffle-landing-jump" href="#raffle-events">Participating events <span aria-hidden="true">↓</span></a><p class="raffle-landing-no-online">${escape(copy.online)}</p></div>
    <div class="raffle-ticket-art" aria-hidden="true"><div class="raffle-ticket-art-back"></div><div class="raffle-ticket-art-front"><div class="raffle-ticket-art-top">NEOChosen · 2026</div><div class="raffle-ticket-art-number">50<span>/</span>50</div><div class="raffle-ticket-art-name">Event Raffles</div><div class="raffle-ticket-art-stub">In person only <span>Nov 13–14</span></div></div></div>
  </div></header>
  <section class="raffle-landing-events" id="raffle-events" aria-labelledby="raffle-events-heading"><div class="editorial-shell"><div class="raffle-landing-section-heading"><h2 id="raffle-events-heading">Where to buy tickets</h2></div><ul class="raffle-event-grid">${copy.events.map(event =>
    `<li><article class="raffle-event-card"><div class="raffle-event-date"><span>${escape(event.day)}</span><strong>${escape(event.date)}</strong><span>November</span></div><div class="raffle-event-info"><p class="raffle-event-city">${escape(event.city)}</p><h3>${escape(event.name)}</h3><p>${escape(event.venue)}</p><a href="${event.route}" aria-label="Event details: ${escape(event.name)}">Event details <span aria-hidden="true">↗</span></a></div></article></li>`
  ).join("")}</ul></div></section>
  <section class="raffle-landing-close" aria-labelledby="raffle-close-heading"><div class="editorial-shell raffle-landing-close-grid"><div><h2 id="raffle-close-heading">How the drawings work</h2><p>${escape(copy.closing)}</p><p>${escape(copy.prize)}</p><p>Ask the raffle volunteers at your event for ticket prices and the sales cutoff.</p></div><div class="raffle-sunday-note"><p class="raffle-landing-eyebrow">Sunday · November 15</p><h3>No Sunday raffle</h3><p>${escape(copy.sunday)}</p></div></div></section>`;
}

export async function writeRafflePages(outDir) {
  const dir = path.join(outDir, "raffle");
  await mkdir(path.join(dir, "rules"), { recursive: true });
  await writeFile(path.join(dir, "index.html"), page({
    title: "50/50 Raffle — In Person Only | NEOChosen 2026",
    description: "Four separate 50/50 raffles during NEOChosen Weekend, November 13–14. Buy tickets in person from raffle volunteers at each participating event.",
    route: "/raffle/",
    extraHead: '<link rel="stylesheet" href="/raffle-promotion.css">',
    className: "raffle-landing",
    body: renderRaffleLanding(),
  }));
  await writeFile(path.join(dir, "rules/index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow,noarchive"><meta http-equiv="refresh" content="0; url=/raffle/"><link rel="canonical" href="https://neochosen.com/raffle/"><title>Updated raffle announcement | NEOChosen</title></head><body><p>The previous online raffle rules have been retired. <a href="/raffle/">Read the current in-person raffle announcement.</a></p></body></html>`);
}

export function applyRafflePromotion(html, route) {
  const home = route === "/";
  const event = raffleAnnouncement.events.find(event => event.route === route);
  if (!home && !event) return html;
  const copy = raffleAnnouncement;
  if (event) {
    const early = `<p class="raffle-early-event"><strong>50/50 raffle · In person only</strong><span>This event has its own raffle and winner. Buy tickets from raffle volunteers at the event.</span></p>`;
    const firstAction = route === "/vip-dinner/" ? /(<div class="vip-reservation">[\s\S]*?<\/a>)/ : /(<div class="event-actions">[\s\S]*?<\/a>)/;
    if (!firstAction.test(html)) throw new Error(`In-person raffle placement missing on ${route}`);
    html = html.replace(firstAction, "$1" + early);
  }
  const content = home ? renderRaffleAnnouncement() : `<p>Buy tickets from raffle volunteers at ${escape(event.venue)}. Tickets sold here enter this event’s drawing.</p><p>${escape(copy.prize)}</p><p>${escape(copy.online)}</p><p><a href="/raffle/">Raffle details</a></p>`;
  const feature = `<section class="raffle-promotion${home ? " raffle-promotion--home" : ""}" aria-labelledby="weekend-raffle-title"><div class="raffle-promotion-shell"><div><p class="raffle-promotion-kicker">NEOChosen Weekend</p><h2 id="weekend-raffle-title">${escape(copy.heading)}</h2>${content}</div></div></section>`;
  html = html.replace("</head>", '<link rel="stylesheet" href="/raffle-promotion.css"></head>');
  const marker = home ? '<section class="home-overview' : route === "/vip-dinner/" ? '<section class="editorial-section editorial-section--white vip-experience' : '<section class="editorial-section"><div class="editorial-shell"><p class="editorial-kicker">The venue';
  if (!html.includes(marker)) throw new Error(`In-person raffle section missing on ${route}`);
  return html.replace(marker, feature + marker);
}
