import sharp from "sharp";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";

const original = await readFile("media-kit/index.html", "utf8");
await mkdir("images/media-previews", { recursive: true });
for (const [, source] of original.matchAll(
  /class="asset-preview" src="([^"]+)"/g,
)) {
  const pathname = new URL(source, "https://local.test").pathname;
  const filename = path.basename(pathname, ".png");
  for (const width of [480, 900])
    await sharp("." + pathname)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(`images/media-previews/${filename}-${width}.webp`);
}
console.log(
  "Created responsive web previews; original PNG/PDF downloads are unchanged.",
);
