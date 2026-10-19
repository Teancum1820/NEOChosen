import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
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
          ? `<a class="cash-button" href="${config.checkoutUrl}">Get ${entries} ${entries === "1" ? "ticket" : "tickets"} for $${price} <span aria-hidden="true">→</span></a>`
          : '<button class="cash-button" type="button" disabled>Sales closed</button>',
    )
    .replace(
      "Buy raffle tickets <span",
      `${open ? "Buy raffle tickets" : "View ticket packages"} <span`,
    )
    .replace(
      "Choose your tickets <span",
      `${open ? "Choose your tickets" : "View ticket packages"} <span`,
    )
    .replace(
      "After your purchase, you’ll receive",
      "After a successful purchase when sales are open, you’ll receive",
    );
  return html;
}

export async function writeRafflePages(outDir) {
  if (!raffleLaunch.informationPublished) return;
  const dir = path.join(outDir, "raffle");
  await mkdir(path.join(dir, "rules"), { recursive: true });
  const landing = renderRaffleLanding(
    await readFile(new URL("public-launch.html", source), "utf8"),
  );
  await writeFile(path.join(dir, "index.html"), landing);
  await cp(
    new URL("public-launch.css", source),
    path.join(dir, "public-launch.css"),
  );
  let rules = await readFile(new URL("official-rules.html", source), "utf8");
  // A config flag cannot turn the draft legal document into approved rules.
  if (
    raffleLaunch.salesOpen &&
    /DRAFT Official Raffle Rules|NOT FINAL|RAFFLE SALES ARE NOT YET AUTHORIZED/.test(
      rules,
    )
  ) {
    throw new Error("Final approved rules source required before sales open");
  }
  rules = rules
    .replace(
      "</head>",
      '<link rel="stylesheet" href="/raffle/public-launch.css" /></head>',
    )
    .replace(
      /<time datetime="2026-10-01T13:00:00-04:00"[\s\S]*?<\/time\s*>/g,
      "<strong>Opening announcement pending</strong>",
    )
    .replace(
      /If required approvals are not completed by the intended opening[\s\S]*?sales will remain closed\./,
      "Ticket sales are currently closed. The original October 1 opening did not occur.",
    )
    .replace(
      /<main id="main-content">/,
      '<main id="main-content"><aside class="cash-preview-bar"><strong>Rules under final review · Sales closed</strong><span>These proposed terms are available for review. They do not authorize a purchase.</span></aside>',
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
  const feature = `<section class="editorial-section" aria-labelledby="weekend-raffle-title"><div class="editorial-shell"><p class="editorial-kicker">Support Kirtland Heritage Group</p><h2 id="weekend-raffle-title">NEO Chosen Cash Raffle</h2><p>Six cash prizes. One great cause. ${status}</p><p>A raffle entry is separate from event admission.</p><a class="event-text-link" href="/raffle/">Explore the cash raffle →</a></div></section>`;
  return html.replace("</main>", feature + "</main>");
}
