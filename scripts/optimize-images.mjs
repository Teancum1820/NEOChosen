import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

// Opt-in example for approved photography only. Production pages keep their
// current sources until a future redesign reviews the generated variants.
const source = path.resolve("images/hero.png");
const output = path.resolve("artifacts/optimized-images");
await mkdir(output, { recursive: true });
for (const width of [640, 960, 1440]) {
  await sharp(source)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(output, `hero-${width}.webp`));
  await sharp(source)
    .resize({ width, withoutEnlargement: true })
    .avif({ quality: 58 })
    .toFile(path.join(output, `hero-${width}.avif`));
}
console.log(
  `Generated responsive hero variants in ${output}; original and sponsor logos unchanged.`,
);
