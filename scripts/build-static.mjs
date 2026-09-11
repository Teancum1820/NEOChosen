import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChevronDown, Heart, Menu, Minus, Plus, Ticket, X } from "lucide-react";
import { writeSponsorshipPages } from "./sponsorship-pages.mjs";
import { applySiteChrome } from "./site-chrome.mjs";
import { applySponsorSystem } from "./sponsor-system.mjs";

const root = process.cwd();
const outDir = path.join(root, "dist");

const rootFilePattern = /(\.html|\.css|\.js|\.svg|\.webmanifest)$/;
const rootFiles = new Set(["_headers", "_redirects"]);
const siteDirs = [
  "thank-you",
  "about-us",
  "chesterland",
  "donations",
  "get-involved",
  "images",
  "media-kit",
  "raffle",
  "social-media-links",
  "sponsors",
  "sponsorships",
  "sponsorship-opportunities"
];

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const icon = (Icon, className = "site-icon") => renderToStaticMarkup(
  React.createElement(Icon, {
    className,
    "aria-hidden": "true",
    focusable: "false",
    strokeWidth: 1.9
  })
);
const icons = {
  menu: icon(Menu, "site-icon site-menu-icon"),
  close: icon(X, "site-icon site-menu-icon"),
  heart: icon(Heart),
  ticket: icon(Ticket),
  plus: icon(Plus, "site-icon nav-dropdown-icon"),
  minus: icon(Minus, "site-icon nav-dropdown-icon"),
  chevronDown: icon(ChevronDown, "site-icon nav-dropdown-icon")
};
const siteTemplate = await readFile(path.join(root, "scripts", "site-template.js"), "utf8");
await writeFile(
  path.join(outDir, "site.js"),
  siteTemplate.replace("__LUCIDE_ICONS__", JSON.stringify(icons)),
  "utf8"
);

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.isFile() && (rootFiles.has(entry.name) || rootFilePattern.test(entry.name))) {
    await cp(path.join(root, entry.name), path.join(outDir, entry.name));
  }
}

for (const dir of siteDirs) {
  await cp(path.join(root, dir), path.join(outDir, dir), { recursive: true });
}

await writeSponsorshipPages(outDir);

async function updateChrome(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await updateChrome(file);
    else if (entry.name.endsWith('.html')) {
      const route = '/' + path.relative(outDir, file).split(path.sep).join('/').replace(/index\.html$/, '');
      await writeFile(file, applySiteChrome(applySponsorSystem(await readFile(file, 'utf8')), route), 'utf8');
    }
  }
}
await updateChrome(outDir);
