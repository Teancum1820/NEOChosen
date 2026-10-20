import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export const raffleLaunch = JSON.parse(
  await readFile(
    new URL("../source-assets/raffle-launch.json", import.meta.url),
    "utf8",
  ),
);
const source = new URL("../source-assets/raffle-preview/", import.meta.url);

export function raffleSalesOpen(config = raffleLaunch, current = new Date()) {
  if (config.salesOpen !== false && config.salesOpen !== true)
    throw new Error("salesOpen must be a boolean");
  if (config.salesOpen && config.salesAuthorized !== true)
    throw new Error("Explicit sales authorization required");
  if (config.salesOpen && config.rulesFinalized !== true)
    throw new Error("Final approved rules required before sales open");
  const closing = new Date(config.closing);
  if (!Number.isFinite(closing.getTime()))
    throw new Error("Valid raffle closing time required");
  return config.salesOpen === true && current < closing;
}

export function renderRaffleLanding(
  html,
  config = raffleLaunch,
  current = new Date(),
) {
  if (
    config.checkoutUrl !==
    "https://www.zeffy.com/en-US/ticketing/neo-chosen-cash-raffle"
  )
    throw new Error("Unexpected raffle checkout");
  const open = raffleSalesOpen(config, current);
  const status = open
    ? "Ticket sales are open"
    : "Ticket sales are currently closed";
  html = html
    .replace(
      '<meta name="robots" content="noindex,nofollow,noarchive" />',
      '<link rel="canonical" href="https://neochosen.com/raffle/" />',
    )
    .replace(
      /\s*<script src="\/raffle\/public-launch\.js" defer><\/script>/,
      "",
    )
    .replace(
      /<aside class="cash-preview-bar"[\s\S]*?<\/aside>/,
      `<aside class="cash-preview-bar" aria-label="Raffle sales status"><strong>${status}</strong>${open ? "<span>Purchase securely through Zeffy. Please review the current raffle rules.</span>" : "<span>Tickets cannot be purchased at this time. Please check back for an opening announcement.</span>"}</aside>`,
    )
    .replace(/\s*<dialog[\s\S]*?<\/dialog>/g, "")
    .replace(
      /<button class="cash-button" type="button" data-ticket-option="(\d+)" data-ticket-price="(\d+)">[\s\S]*?<\/button>/g,
      (_, entries, price) =>
        open
          ? `<a class="cash-button" href="${config.checkoutUrl}" aria-describedby="zeffy-contribution-${entries}">Choose tickets on Zeffy <span class="sr-only">— $${price} for ${entries} ${entries === "1" ? "ticket" : "tickets"}</span><span aria-hidden="true">→</span></a><p class="cash-small cash-contribution" id="zeffy-contribution-${entries}">${zeffyContribution}</p>`
          : '<button class="cash-button" type="button" disabled>Sales closed</button>',
    )
    .replace(
      "Get Raffle Tickets <span",
      `${open ? "Get Raffle Tickets" : "View ticket packages"} <span`,
    )
    .replace(
      "Choose your tickets <span",
      `${open ? "Choose your tickets" : "View ticket packages"} <span`,
    )
    .replace(
      "After your purchase, you’ll receive",
      open
        ? "After a successful purchase, you’ll receive"
        : "After a successful purchase when sales are open, you’ll receive",
    );
  return html;
}

export async function writeRafflePages(outDir) {
  if (!raffleLaunch.informationPublished) return;
  const dir = path.join(outDir, "raffle");
  await mkdir(path.join(dir, "rules"), { recursive: true });
  for (const file of [
    "cash-raffle.js",
    "raffle.js",
    "raffle-data.js",
    "raffle.css",
  ])
    await rm(path.join(dir, file), { force: true });
  const landing = renderRaffleLanding(
    await readFile(new URL("public-launch.html", source), "utf8"),
  );
  await writeFile(path.join(dir, "index.html"), landing);
  await cp(
    new URL("public-launch.css", source),
    path.join(dir, "public-launch.css"),
  );
  let rules = await readFile(new URL("official-rules.html", source), "utf8");
  // Finalized rules must not publish editorial or internal review copy.
  if (
    (raffleLaunch.salesOpen || raffleLaunch.rulesFinalized) &&
    /\bdraft\b|NOT FINAL|not yet authorized|internal review|under final review|working proposal|pending approval|\bproposed\b|final approvals required/i.test(
      rules.replace(/<[^>]*>/g, " ").replace(/\s+/g, " "),
    )
  ) {
    throw new Error("Final approved rules source required before sales open");
  }
  rules = rules.replace(
    "</head>",
    '<link rel="stylesheet" href="/raffle/public-launch.css" /></head>',
  );
  await writeFile(path.join(dir, "rules/index.html"), rules);
  const redirects = await readFile(path.join(outDir, "_redirects"), "utf8");
  await writeFile(
    path.join(outDir, "_redirects"),
    redirects.replace(/^\/raffle\/rules\/? \/raffle\/ 302\r?\n/gm, ""),
  );
}

export function applyRafflePromotion(
  html,
  route,
  config = raffleLaunch,
  current = new Date(),
) {
  if (!config.informationPublished) return html;
  const open = raffleSalesOpen(config, current);
  if (
    route !== "/" &&
    !/^\/(vip-dinner|lakewood|piano-guys|fairlawn|chesterland)\/$/.test(route)
  )
    return html;
  const status = open
    ? "Tickets available now."
    : "View the packages, six-prize structure and drawing schedule. Ticket sales are currently closed.";
  const home = route === "/";
  const feature = `<section class="raffle-promotion${home ? " raffle-promotion--home" : ""}" aria-labelledby="weekend-raffle-title"><div class="raffle-promotion-shell"><div><p class="raffle-promotion-kicker">${home ? "NEO Chosen Cash Raffle" : "Support Kirtland Heritage Group"}</p><h2 id="weekend-raffle-title">${home ? "Six cash prizes. One great cause." : "NEO Chosen Cash Raffle"}</h2><p>${home ? "Enter the NEO Chosen Cash Raffle and support Kirtland Heritage Group’s community programs throughout Northeast Ohio. Every valid ticket purchased grows the prize pool." : "Six cash prizes. One great cause."}</p><p class="raffle-promotion-pricing">$20 for 1 ticket · $50 for 3 · $100 for 7</p><p>Six cash prizes total 40% of eligible raffle-ticket sales. Final prize amounts depend on eligible sales; no minimum dollar prize is guaranteed.</p><p>Drawing November 15 at 6 p.m. Eastern. Winners need not be present.</p>${home ? "" : "<p><strong>Raffle tickets are separate from event admission.</strong></p>"}</div><div class="raffle-promotion-actions"><p class="raffle-promotion-status">${status}</p><a class="raffle-promotion-button" href="/raffle/">Get Raffle Tickets <span aria-hidden="true">→</span></a><a class="raffle-promotion-rules" href="/raffle/rules/">Official Raffle Rules</a></div></div></section>`;
  html = html.replace("</head>", '<link rel="stylesheet" href="/raffle-promotion.css" /></head>');
  // The shared sponsor renderer runs first. Insert directly after its ribbon,
  // before the overview/events; event placements follow registration details.
  const marker = home ? '<section class="home-overview' : route === "/vip-dinner/" ? '<section class="editorial-section editorial-section--white vip-experience' : '<section class="editorial-section"><div class="editorial-shell"><p class="editorial-kicker">The venue';
  if (!html.includes(marker)) throw new Error(`Raffle promotion placement missing on ${route}`);
  return html.replace(marker, feature + marker);
}

export const zeffyContribution = "Zeffy may suggest an optional contribution to support its platform. You can change the amount or choose not to contribute. This contribution does not provide additional raffle entries and is excluded from the prize calculation.";
