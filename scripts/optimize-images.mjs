import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Delivery derivatives only: resize and encode approved original pixels.
// Never crop, filter, retouch, or overwrite a photographic source.
const sources = {
  "piano-guys": "images/piano-guys-feature.webp",
  "shaan-sharma": "source-assets/performers/shaan-sharma.png",
  "noah-james": "source-assets/performers/noah-james.png",
  "vanessa-benavente": "source-assets/performers/vanessa-benavente.png",
  "yasmine-al-bustami": "source-assets/performers/yasmine-al-bustami.png",
};
const output = path.resolve("images/performers");
await mkdir(output, { recursive: true });
const manifest = {};
for (const [name, source] of Object.entries(sources)) {
  const { width, height } = await sharp(source).metadata();
  const maximum = Math.min(width, name === "piano-guys" ? 1440 : 720);
  const widths = [...new Set([160, 320, 480, 800, 1200, maximum])]
    .filter((size) => size <= maximum)
    .sort((a, b) => a - b);
  manifest[name] = { width, height, variants: [] };
  for (const size of widths) {
    const prefix = `/images/performers/${name}-${size}`;
    await sharp(source)
      .resize({ width: size })
      .webp({ quality: 86 })
      .toFile(path.join(output, `${name}-${size}.webp`));
    await sharp(source)
      .resize({ width: size })
      .avif({ quality: 65 })
      .toFile(path.join(output, `${name}-${size}.avif`));
    manifest[name].variants.push({
      width: size,
      webp: `${prefix}.webp`,
      avif: `${prefix}.avif`,
    });
  }
}
await writeFile(
  path.join(output, "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
await sharp("images/favicon.png")
  .resize(64, 64)
  .png()
  .toFile("images/neo-favicon.png");
for (const size of [192, 512]) {
  await sharp("images/favicon.png")
    .resize(size, size)
    .png({ palette: true, colours: 256 })
    .toFile(`images/neo-icon-${size}.png`);
}
console.log(
  "Generated WebP/AVIF deliveries from five approved photographs and a 64px favicon.",
);
