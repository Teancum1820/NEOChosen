import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = "http://127.0.0.1:4173";
const out = path.resolve("artifacts/screenshots");
await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const viewports = [
  [320, 800],
  [375, 812],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1440, 1000],
];
const routes = [
  ["home", "/"],
  ["sponsors", "/sponsors/"],
  ["chesterland", "/chesterland/"],
  ["vip-dinner", "/vip-dinner/"],
  ["lakewood", "/lakewood/"],
  ["piano-guys", "/piano-guys/"],
  ["fairlawn", "/fairlawn/"],
  ["about", "/about-us/"],
  ["get-involved", "/get-involved/"],
  ["media-kit", "/media-kit/"],
  ["opportunities", "/sponsorship-opportunities/"],
];
const overflow = [];
try {
  for (const [width, height] of viewports) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
      serviceWorkers: "block",
    });
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
    for (const [name, route] of routes) {
      await page.goto(base + route);
      await page.addStyleTag({
        content:
          "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}.reveal{opacity:1!important;transform:none!important}",
      });
      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      );
      if (scrollWidth > width + 1)
        overflow.push({ route, viewport: width, scrollWidth });
      const png = await page.screenshot({
        fullPage: true,
        animations: "disabled",
      });
      const { width: imageWidth, height: imageHeight } =
        await sharp(png).metadata();
      const segmentHeight = 12000;
      for (
        let top = 0, part = 1;
        top < imageHeight;
        top += segmentHeight, part += 1
      ) {
        const suffix = imageHeight > segmentHeight ? `-part${part}` : "";
        await sharp(png)
          .extract({
            left: 0,
            top,
            width: imageWidth,
            height: Math.min(segmentHeight, imageHeight - top),
          })
          .webp({ quality: 82 })
          .toFile(path.join(out, `${name}-${width}x${height}${suffix}.webp`));
      }
    }
    await page.goto(base + "/#events");
    const events = await page
      .locator("#events")
      .first()
      .screenshot({ animations: "disabled" });
    await sharp(events)
      .webp({ quality: 82 })
      .toFile(path.join(out, `homepage-events-${width}x${height}.webp`));
    await page.close();
    console.log(`Captured ${width} × ${height}`);
  }
  await writeFile(
    path.join(out, "overflow.json"),
    JSON.stringify(overflow, null, 2) + "\n",
  );
  console.log(`Horizontal overflow cases: ${overflow.length}`);
} finally {
  await browser.close();
}
