// Review-only Worker. All files require authentication; no production bindings.
const encoder = new TextEncoder();
const cookieName = '__Host-neo-review';
const sessionSeconds = 7 * 24 * 60 * 60;
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hex = bytes => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
const unhex = value => Uint8Array.from(value.match(/../g) || [], b => Number.parseInt(b, 16));
const keyFor = value => crypto.subtle.importKey('raw', encoder.encode(value), {name:'HMAC', hash:'SHA-256'}, false, ['sign', 'verify']);
const headers = {'Cache-Control':'private, no-store', 'X-Robots-Tag':'noindex, nofollow, noarchive', 'Referrer-Policy':'same-origin'};

function login(path, invalid = false) {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>NEOChosen · Private Review</title><style>body{margin:0;background:#101a2d;color:#f8f4ec;font:16px/1.6 Arial,sans-serif;display:grid;place-items:center;min-height:100svh}main{width:min(420px,calc(100% - 48px));padding:36px 0}h1{font:32px Georgia,serif;line-height:1.2}p{color:#d6ddea}label{display:block;margin:28px 0 8px}input,button{box-sizing:border-box;width:100%;font:inherit;border-radius:4px;padding:12px;border:1px solid #a58b60}input{background:#fff;color:#101a2d}button{margin-top:16px;background:#cda76a;color:#101a2d;font-weight:bold;cursor:pointer}.error{color:#ffb1a8}small{color:#cda76a;letter-spacing:.1em}a{color:#cda76a}</style></head><body><main><small>NEO CHOSEN WEEKEND</small><h1>Website review</h1><p>Enter the review password to explore the redesigned website.</p>${invalid ? '<p class="error" role="alert">That password did not match. Please try again.</p>' : ''}<form method="post" action="/__preview/login"><input type="hidden" name="returnTo" value="${escape(path)}"><label for="password">Review password</label><input id="password" type="password" name="password" required maxlength="128" autocomplete="current-password"><button type="submit">Open website preview</button></form></main></body></html>`, {status:invalid ? 401 : 200, headers:{...headers, 'Content-Type':'text/html; charset=utf-8', 'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"}});
}

async function readLogin(request) {
  const reader = request.body?.getReader();
  if (!reader) return new URLSearchParams();
  const decoder = new TextDecoder();
  let size = 0, body = '';
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) { await reader.cancel(); return null; }
      body += decoder.decode(value, {stream:true});
    }
    return new URLSearchParams(body + decoder.decode());
  } finally { reader.releaseLock(); }
}

async function validSession(request, key) {
  const token = (request.headers.get('Cookie') || '').split(';').map(v => v.trim()).find(v => v.startsWith(cookieName+'='))?.slice(cookieName.length+1);
  const match = token?.match(/^(\d{13})\.([a-f0-9-]{36})\.([a-f0-9]{64})$/);
  if (!match || Number(match[1]) <= Date.now()) return false;
  return crypto.subtle.verify('HMAC', key, unhex(match[3]), encoder.encode(match[1]+'.'+match[2]));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!env.REVIEW_PASSWORD) return new Response('Private review is being prepared.', {status:503, headers});
    const key = await keyFor(env.REVIEW_PASSWORD);
    if (url.pathname === '/__preview/login' && request.method === 'POST') {
      if (request.headers.get('Origin') !== url.origin) return new Response('Invalid request.', {status:403, headers});
      const fields = await readLogin(request);
      if (!fields) return new Response('Request too large.', {status:413, headers});
      const path = fields.get('returnTo') || '/';
      const returnTo = path.startsWith('/') && !path.startsWith('//') && !path.includes('\\') && !/[\r\n]/.test(path) ? path : '/';
      const password = fields.get('password') || '';
      // HMAC verification avoids comparing secret strings in application code.
      const proof = await crypto.subtle.sign('HMAC', key, encoder.encode('NEOChosen review password'));
      const accepted = password.length > 0 && password.length <= 128 && await crypto.subtle.verify('HMAC', await keyFor(password), proof, encoder.encode('NEOChosen review password'));
      if (!accepted) return login(returnTo, true);
      const payload = String(Date.now()+sessionSeconds*1000)+'.'+crypto.randomUUID();
      const token = payload+'.'+hex(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
      return new Response(null, {status:303, headers:{...headers, Location:returnTo, 'Set-Cookie':`${cookieName}=${token}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${sessionSeconds}`}});
    }
    if (!await validSession(request, key)) return login(url.pathname+url.search);
    if (!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed.', {status:405, headers:{...headers, Allow:'GET, HEAD'}});
    const asset = await env.ASSETS.fetch(request);
    const response = new Response(asset.body, asset);
    for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
    return response;
  }
};
