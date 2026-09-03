import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const loadModule = async (file) => {
  const source = await readFile(file, 'utf8');
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
};
const statementLog = [];
const db = { prepare(sql) { const row = { sql, values: [] }; statementLog.push(row); return { bind(...values) { row.values = values; return this; }, async run() { return { success: true }; } }; } };
const objects = new Map();
const bucket = { async put(key, value, metadata) { objects.set(key, { value, metadata }); }, async delete(key) { objects.delete(key); } };

const analytics = await loadModule('functions/api/analytics-events.js');
let response = await analytics.onRequestPost({ request: new Request('https://example.com/api/analytics-events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ event: 'raffle_general_donation_click', path: '/raffle/' }) }), env: { RAFFLE_DB: db } });
assert.equal(response.status, 204);
response = await analytics.onRequestPost({ request: new Request('https://example.com/api/analytics-events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ event: 'not_allowed' }) }), env: { RAFFLE_DB: db } });
assert.equal(response.status, 400);

const prize = await loadModule('functions/api/prize-donations.js');
const validForm = () => {
  const form = new FormData();
  Object.entries({ legal_name: 'Example LLC', public_name: 'Example', contact_person: 'Ada Lovelace', email: 'ada@example.com', phone: '440-555-0100', website: 'https://example.com', prize_name: 'Weekend experience', prize_description: 'A complete description', retail_value: '$500', availability: 'Yes, it is available now', restrictions: 'Expires next year', fulfillment: 'Contact Ada', notes: '', recognition_permission: 'yes' }).forEach(([key, value]) => form.set(key, value));
  form.set('logo', new File([new Uint8Array([1, 2, 3])], 'logo.png', { type: 'image/png' }));
  return form;
};
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url) => String(url).startsWith('https://api.resend.com/') ? new Response('{}', { status: 200 }) : originalFetch(url);
response = await prize.onRequestPost({ request: new Request('https://example.com/api/prize-donations', { method: 'POST', body: validForm() }), env: { RAFFLE_DB: db, RAFFLE_UPLOADS: bucket, RESEND_API_KEY: 'test', RAFFLE_ALERT_FROM: 'test@example.com' } });
assert.equal(response.status, 201);
assert.equal(objects.size, 1);
assert(statementLog.some(({ sql }) => sql.includes('INSERT INTO prize_donations')));

const invalid = validForm(); invalid.set('email', 'invalid');
response = await prize.onRequestPost({ request: new Request('https://example.com/api/prize-donations', { method: 'POST', body: invalid }), env: { RAFFLE_DB: db, RAFFLE_UPLOADS: bucket, RESEND_API_KEY: 'test' } });
assert.equal(response.status, 400);
globalThis.fetch = originalFetch;
console.log('Validated raffle analytics and prize-submission handlers with mocked D1, R2, and Resend.');
