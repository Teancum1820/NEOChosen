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
await assert.rejects(access("dist/raffle"), { code: "ENOENT" });
await assert.rejects(access("dist/raffle.html"), { code: "ENOENT" });
const redirects = await readFile("dist/_redirects", "utf8");
for (const route of ["/raffle/", "/raffle/*", "/media-kit/neo-chosen-raffle-*", "/media-kit/2026-weekend-schedule*", "/images/raffle/*"]) {
  assert(redirects.includes(route + " /#schedule-update 302"), route + ": current schedule redirect missing");
}
console.log("Validated " + count + " HTML pages and confirmed raffle content stays unpublished.");
