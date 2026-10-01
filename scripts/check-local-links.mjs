import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const walk = async dir => (await Promise.all((await readdir(dir,{withFileTypes:true})).map(entry => {
  const file = path.join(dir,entry.name);
  return entry.isDirectory() ? walk(file) : file;
}))).flat();
const htmlFiles = (await walk(root)).filter(file => file.endsWith('.html'));
const failures = [];
let links = 0;
for (const file of htmlFiles) {
  const route = '/' + path.relative(root,file).split(path.sep).join('/').replace(/index\.html$/,'');
  const html = (await readFile(file,'utf8')).replace(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/g,'');
  for (const [,attribute,value] of html.matchAll(/\b(href|src|action|data)="([^"]+)"/g)) {
    if (attribute === 'data' && !value.startsWith('/') && !value.startsWith('./')) continue;
    if (/^(?:mailto:|tel:|data:|javascript:)/.test(value)) continue;
    let url;
    try { url = new URL(value.replaceAll('&amp;','&'),`https://local.test${route}`); }
    catch { failures.push(`${route}: invalid ${attribute} ${value}`); continue; }
    if (url.origin !== 'https://local.test') continue;
    links++;
    // This form action is served by the production Worker, not a static file.
    if (attribute === 'action' && route === '/interfaith-community-breakfast/' && url.pathname === '/api/breakfast-requests') {
      const worker = await readFile('production/worker.ts', 'utf8');
      assert(worker.includes('const route = "/api/breakfast-requests";'), 'Breakfast form must match the configured Worker route');
      continue;
    }
    const target = path.join(root,decodeURIComponent(url.pathname));
    try {
      const info = await stat(target);
      if (info.isDirectory()) await stat(path.join(target,'index.html'));
      if (url.hash && (!path.extname(target) || info.isDirectory())) {
        const targetHtml = await readFile(info.isDirectory()?path.join(target,'index.html'):target,'utf8');
        const id = decodeURIComponent(url.hash.slice(1));
        if (!targetHtml.includes(`id="${id}"`)) failures.push(`${route}: missing anchor ${value}`);
      }
    } catch { failures.push(`${route}: missing ${attribute} target ${value}`); }
  }
}
assert.equal(failures.length,0,failures.join('\n'));
console.log(`Validated ${links} local page, asset, and anchor references across ${htmlFiles.length} HTML files.`);
