import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { sponsorshipDecks } from "./sponsorship-decks.mjs";

const root = process.cwd();
const dist = path.join(root, "dist");
const failures = [];
const forbiddenInstruction = ["Use a two-column", "layout"].join(" ");
const assert = (condition, message) => { if (!condition) failures.push(message); };
const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");
const exists = async (file, label) => {
  try { await access(file); }
  catch { failures.push(`Missing ${label}: ${path.relative(root, file)}`); }
};

const landingPath = path.join(dist, "sponsorship-opportunities", "index.html");
const contactPath = path.join(dist, "sponsorship-opportunities", "contact", "index.html");
await exists(landingPath, "landing page");
await exists(contactPath, "sponsorship contact page");
const landing = await readFile(landingPath, "utf8");
const contact = await readFile(contactPath, "utf8");

assert(new Set(sponsorshipDecks.map((deck) => deck.slug)).size === sponsorshipDecks.length, "Deck slugs must be unique.");
assert((landing.match(/<li class="sponsorship-card/g) || []).length === 8, "Landing page must contain exactly eight sponsorship cards.");
assert(!landing.includes(forbiddenInstruction), "Landing page contains forbidden placeholder instructions.");
assert(contact.includes("<title>Sponsorship Contact | NEOChosen 2026</title>"), "Contact page metadata title is incorrect.");
assert(contact.includes("Joe Jackson") && contact.includes("President, Kirtland Heritage Group"), "Contact page name or title is missing.");
assert(contact.includes("tel:+14407961642") && contact.includes("440&#8209;796&#8209;1642"), "Contact page telephone information is incorrect.");
assert(contact.includes("mailto:info@kirtlandheritagegroup.com") && contact.includes("info@kirtlandheritagegroup.com"), "Contact page email information is incorrect.");
assert(contact.includes('href="/">NEOChosen.com</a>'), "Contact page website link is incorrect.");

for (const deck of sponsorshipDecks) {
  const detailPath = path.join(dist, "sponsorship-opportunities", deck.slug, "index.html");
  const pdfPath = path.join(dist, "sponsorships", deck.pdfFile);
  const summaryPath = path.join(dist, "sponsorships", "summaries", deck.summaryImage);
  await exists(detailPath, `${deck.slug} detail page`);
  await exists(pdfPath, `${deck.slug} PDF`);
  await exists(summaryPath, `${deck.slug} summary image`);

  const detail = await readFile(detailPath, "utf8");
  assert(landing.includes(`/sponsorship-opportunities/${deck.slug}/`), `Landing link is missing for ${deck.slug}.`);
  assert(detail.includes(`<title>${escapeHtml(deck.metaTitle)}</title>`), `Metadata title is incorrect for ${deck.slug}.`);
  assert(detail.includes(deck.pdfFile), `PDF link is missing for ${deck.slug}.`);
  assert(detail.includes(deck.summaryImage), `Summary image is missing for ${deck.slug}.`);
  assert(detail.includes("Quick Summary") && detail.includes("Full Sponsorship Deck"), `Required sections are missing for ${deck.slug}.`);
  assert((detail.match(/ download/g) || []).length >= 2, `Download controls are missing for ${deck.slug}.`);
  assert(detail.includes("tel:+14407961642"), `Telephone link is missing for ${deck.slug}.`);
  assert(detail.includes("mailto:info@kirtlandheritagegroup.com"), `Email link is missing for ${deck.slug}.`);
  assert(detail.includes('href="/sponsorship-opportunities/contact/">Contact Us About Sponsorship</a>'), `Contact page CTA is incorrect for ${deck.slug}.`);
  assert(!detail.includes(forbiddenInstruction), `Detail page contains forbidden placeholder instructions for ${deck.slug}.`);
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated the sponsorship landing page, contact page, ${sponsorshipDecks.length} detail routes, PDFs, summaries, metadata, and contact controls.`);
}
