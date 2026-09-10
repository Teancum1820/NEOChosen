import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const walk = async dir => (await Promise.all((await readdir(dir, { withFileTypes: true })).map(entry => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(file) : file;
}))).flat();
const pages = new Map();
for (const file of (await walk(root)).filter(file => file.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  if (!html.includes('class="site-nav"')) continue;
  const route = '/' + path.relative(root, file).split(path.sep).join('/').replace(/index\.html$/, '');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${route}: duplicate IDs`);
  assert.equal((html.match(/class="site-nav"/g) || []).length, 1, `${route}: one header`);
  assert.equal((html.match(/class="site-footer"/g) || []).length, 1, `${route}: one footer`);
  assert.equal((html.match(/class="site-skip-link"/g) || []).length, 1, `${route}: one skip link`);
  assert(ids.includes('main-content'), `${route}: skip target`);
  for (const [, control] of html.matchAll(/aria-controls="([^"]+)"/g)) {
    assert(ids.includes(control), `${route}: missing controlled element ${control}`);
  }
  assert(!/mailchimp|list-manage\.com|become a friend/i.test(html), `${route}: retired signup`);
  const chrome = html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)[0]
    + html.match(/<footer class="site-footer"[\s\S]*?<\/footer>/)[0];
  const header = html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)[0];
  assert(!html.includes('class="site-follow-bar"'), `${route}: duplicate social strip`);
  for (const [name, url] of [
    ['Facebook', 'https://www.facebook.com/people/Kirtland-Heritage-Group/61572253884775/'],
    ['Instagram', 'https://www.instagram.com/kirtland.heritage.group']
  ]) {
    assert(header.includes(`href="${url}" target="_blank" rel="noopener noreferrer" aria-label="Follow us on ${name}"`), `${route}: accessible header ${name} link`);
    assert.equal(chrome.split(`href="${url}"`).length - 1, 2, `${route}: ${name} in header and footer`);
  }
  pages.set(route, { html, ids, chrome });
}
assert.equal(pages.size, 19, 'Expected all 19 content pages to have shared navigation and footer');
for (const [route, { chrome }] of pages) {
  for (const [, href] of chrome.matchAll(/href="([^"]+)"/g)) {
    const url = new URL(href, `https://local.test${route}`);
    if (url.origin !== 'https://local.test') continue;
    const target = path.join(root, decodeURIComponent(url.pathname));
    const info = await stat(target);
    if (info.isDirectory()) await stat(path.join(target, 'index.html'));
    if (url.hash) assert(pages.get(url.pathname)?.ids.includes(url.hash.slice(1)), `${route}: broken anchor ${href}`);
  }
}
console.log(`Validated shared navigation, footer, controls, links, anchors, and signup removal on ${pages.size} pages.`);
