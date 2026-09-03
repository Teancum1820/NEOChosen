import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist');
const walk = async (dir) => (await Promise.all((await readdir(dir, { withFileTypes: true })).map(async (entry) => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : full;
}))).flat();
const files = (await walk(out)).filter((file) => /\.(html|css|js|webmanifest)$/.test(file) || path.basename(file).startsWith('_'));
const corpus = (await Promise.all(files.map((file) => readFile(file, 'utf8')))).join('\n');
const raffle = await readFile(path.join(out, 'raffle', 'index.html'), 'utf8');

for (const prohibited of [
  'kirtland-heritage-groups-raffle--2026', 'Buy Raffle Tickets', 'Purchase Raffle Tickets',
  '$15,000', '3,000 tickets', '1,200 tickets', '20 cash prizes', 'Win Up to'
]) assert(!corpus.toLowerCase().includes(prohibited.toLowerCase()), `Old raffle marker remains: ${prohibited}`);

for (const required of [
  'NEOChosen Raffle Coming Soon | Kirtland Heritage Group',
  'Win Extraordinary Experiences.', 'Tickets Are Not on Sale Yet',
  'neochosen-raffle-interest', 'Donate or Pledge a Prize — Coming Soon',
  'A general donation does not purchase a raffle ticket'
]) assert(raffle.includes(required), `Required coming-soon content missing: ${required}`);

assert(corpus.includes('Raffle — Coming Soon'), 'Coming-soon navigation label is missing.');
assert(!raffle.includes('id="prize-donation-form"'), 'Prize form must remain disabled while marked coming soon.');
console.log(`Validated raffle coming-soon content across ${files.length} built text assets.`);
