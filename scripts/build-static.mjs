import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "dist");

const rootFilePattern = /(\.html|\.css|\.js|\.svg|\.webmanifest)$/;
const rootFiles = new Set(["_headers", "_redirects"]);
const siteDirs = [
  "about-us",
  "donations",
  "get-involved",
  "images",
  "media-kit",
  "raffle",
  "social-media-links",
  "sponsors",
  "sponsorship-opportunities",
  "thank-you"
];

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.isFile() && (rootFiles.has(entry.name) || rootFilePattern.test(entry.name))) {
    await cp(path.join(root, entry.name), path.join(outDir, entry.name));
  }
}

for (const dir of siteDirs) {
  await cp(path.join(root, dir), path.join(outDir, dir), { recursive: true });
}
