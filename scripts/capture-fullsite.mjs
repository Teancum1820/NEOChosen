import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const output = "artifacts/fullsite-redesign";
const walk = async (dir) =>
  (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((e) =>
        e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name),
      ),
    )
  ).flat();
const routes = [];
for (const file of (await walk("dist")).filter((f) => f.endsWith(".html"))) {
  if ((await readFile(file, "utf8")).includes('class="site-nav"'))
    routes.push(
      "/" +
        path
          .relative("dist", file)
          .split(path.sep)
          .join("/")
          .replace(/index\.html$/, ""),
    );
}
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      serviceWorkers: "block",
      reducedMotion: "reduce",
    });
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
    for (const route of routes) {
      const errors = [];
      const recordError = (e) => errors.push(e.message);
      page.on("pageerror", recordError);
      await page.goto("http://127.0.0.1:4173" + route);
      await page.evaluate(async () => {
        await document.fonts.ready;
        const images = [...document.images];
        images.forEach((i) => (i.loading = "eager"));
        await Promise.all(images.map((i) => i.decode().catch(() => {})));
      });
      const state = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        images: [...document.images]
          .filter((i) => !i.complete || !i.naturalWidth)
          .map((i) => i.src),
        h1: document.querySelector("main h1")?.textContent,
      }));
      results.push({ route, width, ...state, errors });
      const png = await page.screenshot({
        fullPage: true,
        animations: "disabled",
      });
      const metadata = await sharp(png).metadata();
      const name =
        route === "/" ? "home" : route.slice(1, -1).replaceAll("/", "-");
      for (let top = 0, part = 1; top < metadata.height; top += 12000, part++) {
        await sharp(png)
          .extract({
            left: 0,
            top,
            width,
            height: Math.min(12000, metadata.height - top),
          })
          .webp({ quality: 82 })
          .toFile(
            `${output}/${name}-${width}${metadata.height > 12000 ? "-part" + part : ""}.webp`,
          );
      }
      page.removeListener("pageerror", recordError);
    }
    await page.close();
    console.log(`Captured ${routes.length} routes at ${width}px`);
  }
} finally {
  await browser.close();
}
await writeFile(
  `${output}/checks.json`,
  JSON.stringify(results, null, 2) + "\n",
);
const failures = results.filter(
  (r) => r.scrollWidth > r.width || r.images.length || r.errors.length || !r.h1,
);
console.log(`${results.length} captures; ${failures.length} failures`);
if (failures.length) {
  console.error(failures);
  process.exitCode = 1;
}
