import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { raffleLaunch, raffleSalesOpen } from "./raffle-page.mjs";

// Validate approvals even when an already-built dist is being checked.
const open = raffleSalesOpen();
const landing = await readFile("dist/raffle/index.html", "utf8");
const rules = await readFile("dist/raffle/rules/index.html", "utf8");
const redirects = await readFile("dist/_redirects", "utf8");
assert.equal(raffleLaunch.informationPublished, true);
assert(landing.includes("<h1>NEO Chosen Cash Raffle</h1>"));
for (const marker of [
  "cash-checkout-preview",
  "data-preview-notes",
  "public-launch.js",
]) {
  assert(!landing.includes(marker), `Preview control leaked: ${marker}`);
}
assert(landing.includes('href="/raffle/rules/"'));
assert(rules.includes("99-1301074"));
assert(rules.includes("U.S. resident"));
assert(!redirects.includes("/raffle/rules/ /raffle/"));
for (const [name, html] of [
  ["landing", landing],
  ["rules", rules],
]) {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
  assert(
    !/\bdraft\b|internal review|pending approval|proposed|working proposal|final approvals required|not yet authorized|preview revision/i.test(
      text,
    ),
    `${name}: internal review copy is public`,
  );
}
assert(!rules.includes('name="robots" content="noindex'));
for (const file of [
  "cash-raffle.js",
  "raffle.js",
  "raffle-data.js",
  "raffle.css",
]) {
  await assert.rejects(access(`dist/raffle/${file}`), { code: "ENOENT" });
}
if (!open) {
  assert.equal((landing.match(/disabled>Sales closed/g) || []).length, 3);
  assert(landing.includes("Ticket sales are currently closed"));
  assert(!landing.includes(raffleLaunch.checkoutUrl));
  if (!raffleLaunch.rulesFinalized) {
    assert(rules.includes("Rules under final review"));
    assert(rules.includes("RAFFLE SALES ARE NOT YET AUTHORIZED"));
  }
} else {
  assert.equal(
    raffleLaunch.salesAuthorized,
    true,
    "Explicit sales authorization required",
  );
  assert.equal(
    raffleLaunch.rulesFinalized,
    true,
    "Final approved rules required",
  );
  assert(landing.includes("Ticket sales are open"));
  assert.equal(
    landing.split('href="' + raffleLaunch.checkoutUrl + '"').length - 1,
    3,
  );
  assert(!landing.includes("disabled>Sales closed"));
  assert(
    !/DRAFT Official Raffle Rules|NOT FINAL|RAFFLE SALES ARE NOT YET AUTHORIZED/.test(
      rules,
    ),
    "Draft rules cannot be released with sales open",
  );
  assert(!rules.includes("Sales remain closed"));
}

async function checkPages(dir) {
  let count = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) count += await checkPages(file);
    else if (entry.name.endsWith(".html")) {
      const html = await readFile(file, "utf8");
      if (!open)
        assert(
          !html.includes(raffleLaunch.checkoutUrl),
          `${file}: held checkout leaked`,
        );
      if (!html.includes('class="site-nav"')) continue;
      const header = html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)?.[0];
      const footer = html.match(
        /<footer class="site-footer"[\s\S]*?<\/footer>/,
      )?.[0];
      assert(
        header?.includes('href="/raffle/"'),
        `${file}: raffle navigation missing`,
      );
      assert(
        footer?.includes('href="/raffle/"'),
        `${file}: raffle footer missing`,
      );
      assert(
        !html.includes("Raffle — Coming Soon"),
        `${file}: outdated raffle label`,
      );
      count++;
    }
  }
  return count;
}

const pageCount = await checkPages("dist");
for (const page of [
  "",
  "vip-dinner",
  "lakewood",
  "piano-guys",
  "fairlawn",
  "chesterland",
]) {
  const html = await readFile(
    "dist/" + (page ? page + "/" : "") + "index.html",
    "utf8",
  );
  assert(
    html.includes('id="weekend-raffle-title"'),
    page + ": raffle feature missing",
  );
  if (!open) assert(!html.includes("Tickets available now."));
}
console.log(
  `Validated raffle information, rules, six promotion placements, navigation on ${pageCount} pages and ${open ? "approved open" : "held (no checkout)"} sales controls.`,
);
