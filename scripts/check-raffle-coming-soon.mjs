import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { sharedFooter, sharedHeader } from './shared-layout.mjs';

const out = path.join(process.cwd(), 'dist');
const walk = async (dir) => (await Promise.all((await readdir(dir, { withFileTypes: true })).map(async (entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : full;
}))).flat();
const htmlFiles = (await walk(out)).filter((file) => file.endsWith('.html'));
const publicPages = [];
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  if (html.includes('class="site-nav"') || html.includes('class="site-footer"')) publicPages.push({ file, html });
}

const raffle = await readFile(path.join(out, 'raffle', 'index.html'), 'utf8');
for (const prohibited of ['Buy Raffle Tickets', 'Purchase Raffle Tickets', 'Buy Ticket', 'ticketing/kirtland-heritage-groups-raffle']) {
  assert(!raffle.toLowerCase().includes(prohibited.toLowerCase()), `Premature raffle sales marker remains: ${prohibited}`);
}
for (const required of ['$15,000', '20 Cash Prizes', '$44,000', 'Tickets are not available yet.', 'November 15, 2026', 'Chesterland, Ohio', 'What the Raffle Supports', 'neochosen-raffle-interest']) {
  assert(raffle.includes(required), `Required raffle teaser content missing: ${required}`);
}

const canonicalNavLinks = [...sharedHeader.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
const canonicalFooterLinks = [...sharedFooter.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
for (const { file, html } of publicPages) {
  const nav = html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)?.[0] ?? '';
  const footer = html.match(/<footer class="site-footer"[\s\S]*?<\/footer>/)?.[0] ?? '';
  for (const href of canonicalNavLinks) assert(nav.includes(`href="${href}"`), `${file} is missing shared navigation link ${href}`);
  for (const href of canonicalFooterLinks) assert(footer.includes(`href="${href}"`), `${file} is missing shared footer link ${href}`);
}

console.log(`Validated the raffle teaser and shared navigation/footer across ${publicPages.length} public pages.`);
