import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const output = "artifacts/implementation";
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const [width, height] of [
    [1440, 1000],
    [390, 844],
    [320, 800],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      serviceWorkers: "block",
      reducedMotion: "reduce",
    });
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
    await page.goto("http://127.0.0.1:4173/");
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `${output}/home-${width}.png`,
      fullPage: true,
    });
    for (const [name, selector] of [
      ["hero", ".home-hero"],
      ["events", "#events"],
      ["ribbon", ".home-sponsor-ribbon"],
      ["performers", "#performers"],
      ["partners", "#partners"],
    ]) {
      await page
        .locator(selector)
        .screenshot({
          path: `${output}/${name}-${width}.png`,
          style:
            ".site-nav{visibility:hidden!important}.site-skip-link{display:none!important}",
        });
    }
    await page.goto("http://127.0.0.1:4173/");
    results.push(
      await page.evaluate(() => ({
        viewport: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        photos: [...document.querySelectorAll(".home-hero img")].map(
          (image) => ({
            alt: image.alt,
            source: image.currentSrc,
            loaded: image.complete && image.naturalWidth > 0,
            width: image.clientWidth,
            height: image.clientHeight,
          }),
        ),
      })),
    );
    await page.close();
  }
  await writeFile(
    `${output}/photo-delivery.json`,
    JSON.stringify(results, null, 2) + "\n",
  );
} finally {
  await browser.close();
}
console.log(`Saved review captures and photo geometry to ${output}`);
