// Build the public launch design into a separate, non-transactional review
// bundle. The ordinary production build continues to show Coming Soon.
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { applySiteChrome } from "./site-chrome.mjs";
import { applySponsorSystem } from "./sponsor-system.mjs";

await import("./build-static.mjs");
const output = path.resolve("artifacts/raffle-preview");
await mkdir(path.join(output, "raffle/rules"), { recursive: true });
for (const file of ["site.css", "editorial.css", "sponsor-system.css", "fonts.css", "site.js"]) {
  await cp(path.join("dist", file), path.join(output, file));
}
await cp("dist/images", path.join(output, "images"), { recursive: true });
await cp("raffle/cash-raffle.css", path.join(output, "raffle/cash-raffle.css"));
for (const file of ["public-launch.css", "public-launch.js"]) {
  await cp(path.join("source-assets/raffle-preview", file), path.join(output, "raffle", file));
}

const notice = `<aside class="raffle-review-notice" aria-label="Review preview"><strong>DRAFT RULES FOR REVIEW</strong><span>The landing page shows the public launch design. These rules remain unapproved. Checkout, ticket delivery and drawing-stub fulfillment are not connected or tested here.</span></aside>`;
const style = `<style>.raffle-review-notice{background:#fff1cc;color:#332707;padding:16px max(24px,calc((100% - 1200px)/2));border-bottom:2px solid #c7a366;font:14px/1.6 Arial,sans-serif}.raffle-review-notice strong,.raffle-review-notice span{display:block}.raffle-review-notice strong{letter-spacing:.06em}</style>`;

for (const [source, route, file] of [
  ["raffle-preview/public-launch.html", "/raffle/", "raffle/index.html"],
  ["raffle-archive/cash-raffle-draft-rules.html", "/raffle/rules/", "raffle/rules/index.html"],
]) {
  let html = await readFile(path.join("source-assets", source), "utf8");
  html = html.replace(/\s*<script src="\/raffle\/cash-raffle\.js" defer><\/script>/, "")
    .replace(/<link rel="canonical"[^>]*>/, '<meta name="robots" content="noindex,nofollow,noarchive">')
    .replace(/<time datetime="2026-10-01T13:00:00-04:00"[\s\S]*?<\/time\s*>/g,
      '<strong>New opening date and time pending Joe’s approval</strong>')
    .replace(/The opening time is not guaranteed\.[\s\S]*?sales will remain closed\./,
      'The original October 1 opening has passed. Sales will remain closed until a new opening is approved and all launch requirements are met.')
    .replace(/If required approvals are not completed by the intended opening[\s\S]*?sales will remain closed\./,
      'The original October 1 opening has passed. A new opening requires Joe’s approval. Sales remain closed.');
  if (route === "/raffle/rules/") {
    html = html.replace("</head>", `${style}</head>`)
      .replace(/<main id="main-content">/, `<main id="main-content">${notice}`);
  }
  html = applySiteChrome(applySponsorSystem(html), route);
  html = html.replaceAll("Raffle — Coming Soon", "Cash Raffle");
  // Keep review navigation inside the preview only for the two raffle pages.
  // Other shared navigation destinations use the existing public website.
  html = html.replace(/(<a\b[^>]*\bhref=")(\/(?!raffle(?:\/|"))[^"\s]*)(")/g, "$1https://neochosen.com$2$3");
  await writeFile(path.join(output, file), html);
}
await writeFile(path.join(output, "index.html"), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow,noarchive"><meta http-equiv="refresh" content="0;url=/raffle/"><title>Raffle review preview</title></head><body><a href="/raffle/">Open raffle review preview</a></body></html>');
await writeFile(path.join(output, "robots.txt"), "User-agent: *\nDisallow: /\n");
console.log(`Raffle review bundle: ${output}`);
