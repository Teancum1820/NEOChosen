import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const out = 'artifacts/joe-guest-update';
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
    for (const route of ['/', '/lakewood/', '/fairlawn/', '/vip-dinner/']) {
      await page.goto('http://127.0.0.1:4173' + route);
      await page.evaluate(() => document.fonts.ready);
      const target = page.locator(route === '/' ? '#performers' : route === '/vip-dinner/' ? '.vip-guests' : '.event-hero');
      await target.scrollIntoViewIfNeeded();
      await target.locator('img').evaluateAll(async images => { await Promise.all(images.map(image => image.decode())); });
      const name = route === '/' ? 'home-cast' : route.replaceAll('/', '');
      await target.screenshot({ path: out + '/' + name + '-' + width + '.png' });
      const result = await page.evaluate(() => ({
        route: location.pathname, viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth,
        cast: [...document.querySelectorAll('[data-cast-member]')].map(node => node.dataset.castMember),
        legacyCollages: [...document.images].filter(image => image.currentSrc.includes('/images/collages/')).length,
        retiredPortraits: [...document.images].filter(image => /vanessa-benavente/.test(image.currentSrc)).length,
      }));
      assert(result.scrollWidth <= width, 'Horizontal overflow: ' + route + ' at ' + width);
      assert.equal(result.legacyCollages, 0);
      assert.equal(result.retiredPortraits, 0);
      if(route !== '/') assert.deepEqual(result.cast, ['shaan-sharma', 'noah-james', 'zhaleh-vossough', 'yasmine-al-bustami']);
      results.push(result);
    }
    await page.close();
  }
  await writeFile(out + '/verification.json', JSON.stringify(results, null, 2) + '\n');
  console.log('Verified current roster and loaded portraits across eight desktop/mobile page checks.');
} finally { await browser.close(); }
