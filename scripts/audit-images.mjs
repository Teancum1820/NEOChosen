import sharp from "sharp";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const files = [];
for (const dir of ["images", "media-kit", "sponsorships/summaries"]) {
  for (const name of await readdir(dir)) {
    const file = path.join(dir, name);
    if (
      (await stat(file)).isFile() &&
      /\.(png|jpe?g|webp|avif|svg)$/i.test(file)
    )
      files.push(file);
  }
}
const records = [];
for (const file of files) {
  const bytes = await readFile(file);
  const meta = await sharp(bytes)
    .metadata()
    .catch(() => ({}));
  records.push({
    file,
    bytes: bytes.length,
    width: meta.width ?? null,
    height: meta.height ?? null,
    format: meta.format ?? "unknown",
    hash: createHash("sha256").update(bytes).digest("hex"),
  });
}
records.sort((a, b) => b.bytes - a.bytes);
const duplicates = records
  .filter(
    (record, index) =>
      records.findIndex((item) => item.hash === record.hash) !== index,
  )
  .map((item) => item.file);
const html = await readFile("index.html", "utf8");
const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
console.log(
  JSON.stringify(
    {
      largest: records.slice(0, 20).map(({ hash: _hash, ...rest }) => rest),
      duplicateFiles: duplicates,
      homepageImages: images.length,
      missingAlt: images.filter((image) => !/\balt\s*=/.test(image)).length,
      missingDimensions: images.filter(
        (image) => !/\bwidth\s*=/.test(image) || !/\bheight\s*=/.test(image),
      ).length,
    },
    null,
    2,
  ),
);
