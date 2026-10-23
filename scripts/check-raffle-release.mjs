import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const retired = JSON.parse(await readFile("source-assets/retired-raffle-assets.json", "utf8"));
for (const url of retired) await assert.rejects(access(`dist${url}`), { code: "ENOENT" });
await assert.rejects(access("dist/source-assets"), { code: "ENOENT" });
const archive = "source-assets/raffle-archive/retired-2026-10-23";
for (const file of ["live-official-rules.html", "source-assets/raffle-preview/official-rules.html"])
  assert((await readFile(`${archive}/${file}`, "utf8")).includes("electronic drawing"));
const forbidden = /neo-chosen-cash-raffle|six cash prizes|six-prize|40%|Tickets from \$20|\$20 for 1 ticket|Get Raffle Tickets|Raffle — Coming Soon|cash-raffle-artwork|Electronic drawing November 15/i;
async function check(dir) {
  let count = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) count += await check(file);
    else if (/\.(html|js|json|svg)$/.test(file)) {
      const html = await readFile(file, "utf8");
      assert(!forbidden.test(html), `${file}: obsolete online raffle content`);
      if (!file.endsWith(".html")) continue;
      const chrome = (html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)?.[0] || "") + (html.match(/<footer class="site-footer"[\s\S]*?<\/footer>/)?.[0] || "");
      assert(!/Cash Raffle|Get Raffle Tickets/i.test(chrome), `${file}: retired raffle sales navigation`);
      assert(!html.includes('href="/raffle/rules/"'), `${file}: old rules promotion`);
      count++;
    }
  }
  return count;
}
const count = await check("dist");
const landing = await readFile("dist/raffle/index.html", "utf8");
assert(landing.includes("50/50 Raffle — In Person Only"));
assert(landing.includes("No online raffle-ticket sales."));
assert.equal((landing.match(/<li>/g) || []).length, 4);
assert(!/<iframe|<form|zeffy|\$\d|winner.*present/i.test(landing));
for (const slug of ["", "vip-dinner", "lakewood", "piano-guys", "fairlawn"]) {
  const html = await readFile(`dist/${slug ? slug + "/" : ""}index.html`, "utf8");
  assert(html.includes('id="weekend-raffle-title"'), `${slug}: announcement missing`);
  assert(html.includes("No online raffle-ticket sales."));
  assert(html.includes("Mayfield United Methodist Church."));
  assert(!html.includes("raffle-quick-promotion"));
  if (slug) assert(html.includes("raffle-early-event"));
}
assert((await readFile("dist/fairlawn/index.html", "utf8")).includes("This is the final raffle location."));
assert(!/raffle/i.test((await readFile("dist/chesterland/index.html", "utf8")).match(/<main\b[\s\S]*?<\/main>/)[0]));
const rules = await readFile("dist/raffle/rules/index.html", "utf8");
assert(rules.includes('http-equiv="refresh" content="0; url=/raffle/"'));
const redirects = await readFile("dist/_redirects", "utf8");
for (const route of ["/raffle/rules/", "/media-kit/neo-chosen-raffle-*", "/media-kit/2026-weekend-schedule*", "/images/raffle/*", "/images/media-previews/2026-weekend-schedule*"])
  assert(redirects.includes(`${route} /raffle/ 302`), `${route}: retirement redirect missing`);
console.log(`Validated ${count} HTML files, the archived rules, four participating events, Sunday exclusion, and ${retired.length} retired assets.`);
