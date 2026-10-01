import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const out = path.resolve('dist');
const walk = async dir => (await Promise.all((await readdir(dir, { withFileTypes: true })).map(entry => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : full;
}))).flat();
const files = (await walk(out)).filter(file => /\.(html|css|js|webmanifest)$/.test(file) || path.basename(file).startsWith('_'));
const corpus = (await Promise.all(files.map(file => readFile(file, 'utf8')))).join('\n');
const landing = (await readFile(path.join(out, 'raffle/index.html'), 'utf8')).replace(/\s+/g, ' ');
const rules = (await readFile(path.join(out, 'raffle/rules/index.html'), 'utf8')).replace(/\s+/g, ' ');
const main = html => html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];

for (const old of ['kirtland-heritage-groups-raffle--2026', 'Buy Raffle Tickets', 'Purchase Raffle Tickets', '$15,000', '$44,000', '3,000 tickets', '1,200 tickets', '20 cash prizes', 'Win Up To']) {
  assert(!corpus.toLowerCase().includes(old.toLowerCase()), 'Old raffle marker remains: ' + old);
}

const content = main(landing);
assert.match(landing, /<title>NEO Chosen Cash Raffle \| Kirtland Heritage Group<\/title>/);
for (const required of ['NEO Chosen Cash Raffle — Coming Soon', 'NEO Chosen Cash Raffle', 'Six cash prizes.', 'One great cause.', 'We’re preparing a cash raffle supporting Kirtland Heritage Group’s community, historical, charitable, and interfaith programs throughout Greater Northeast Ohio.']) assert(content.includes(required));
assert.doesNotMatch(content, /<section|<aside|<form|<input|<button|<a\b|<table|notification|rules|Pending final approvals|potential for thousands|prize amounts|Ticket sales are not authorized/i);
assert.doesNotMatch(landing, /data-zeffy-embed|src="\/raffle\/cash-raffle\.js"|href="\/raffle\/rules\/"/);
assert.match(rules, /http-equiv="refresh" content="0; url=\/raffle\/"/);
assert.doesNotMatch(rules, /DRAFT Official Raffle Rules|cash-rule-section|cash-notification-preview/);
assert(corpus.includes('Raffle — Coming Soon'));
assert(!files.some(file => file.includes('raffle-archive')));
console.log('Validated minimal cash raffle holding copy, no notifications/rules/purchase UI, deferred-rules redirect, and excluded archives.');
