import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { approvedMedia } from "./approved-media.mjs";

await mkdir("images/media-previews", { recursive: true });
for (const asset of approvedMedia) {
  for (const width of [480, 900])
    await sharp(`media-kit/${asset.base}.png`)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(`.${asset.preview}-${width}.webp`);
}
console.log(
  "Created responsive web previews; original PNG/PDF downloads are unchanged.",
);
