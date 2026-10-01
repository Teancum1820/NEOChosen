import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker from '../preview/worker.mjs';

test('review pages and assets are available without a password or session', async () => {
  const origin = 'https://review.example';
  const requests = [];
  const env = {ASSETS: {fetch: async request => {
    requests.push(request);
    return new Response(request.method === 'HEAD' ? null : 'review asset', {
      headers: {'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=3600'}
    });
  }}};
  for (const path of ['/', '/piano-guys/', '/images/northeast-ohio-skyline.svg', '/media-kit/example.pdf']) {
    const response = await worker.fetch(new Request(origin + path), env);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'review asset');
    assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
    assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow, noarchive');
    assert.equal(response.headers.get('Set-Cookie'), null);
  }
  const head = await worker.fetch(new Request(origin, {method: 'HEAD'}), env);
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.equal(requests.length, 5);
  for (const path of ['/api/register', '/__preview/login']) {
    const response = await worker.fetch(new Request(origin + path, {method: 'POST'}), env);
    assert.equal(response.status, 405);
    assert.equal(response.headers.get('Allow'), 'GET, HEAD');
  }
  assert.equal(requests.length, 5);
});

test('review preserves asset errors and redirects', async () => {
  for (const status of [404, 301]) {
    const assetHeaders = status === 301 ? {Location: '/piano-guys/'} : {};
    const response = await worker.fetch(new Request('https://review.example/missing'), {
      ASSETS: {fetch: async () => new Response(null, {status, headers: assetHeaders})}
    });
    assert.equal(response.status, status);
    if (status === 301) assert.equal(response.headers.get('Location'), '/piano-guys/');
    assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow, noarchive');
  }
});
