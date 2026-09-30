import { renderPhoto } from "./performer-images.mjs";

export const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const action = (url, label, className = "editorial-link") =>
  `<a class="${className}" href="${escape(url)}"${url.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escape(label)} <span aria-hidden="true">↗</span></a>`;
export const hero = (kicker, title, intro, photo) =>
  `<header class="editorial-hero${photo ? " editorial-hero--split" : ""}"><div class="editorial-hero-copy"><p class="editorial-kicker">${escape(kicker)}</p><h1>${escape(title)}</h1><p class="editorial-intro">${escape(intro)}</p></div>${photo ? `<div class="editorial-hero-photo">${renderPhoto(photo, { alt: photo === "piano-guys" ? "The Piano Guys with a cello in a red rock landscape" : "", sizes: "(max-width: 800px) 100vw, 53vw", priority: true })}</div>` : ""}</header>`;
export const section = (kicker, title, content, className = "") =>
  `<section class="editorial-section ${className}"><div class="editorial-shell"><p class="editorial-kicker">${escape(kicker)}</p><h2>${escape(title)}</h2>${content}</div></section>`;
export const callout = (title, intro, url, label) =>
  `<section class="editorial-callout"><div class="editorial-shell"><div><h2>${escape(title)}</h2><p>${escape(intro)}</p></div>${action(url, label, "editorial-button")}</div></section>`;
export const page = ({
  title,
  description,
  route,
  body,
  extraHead = "",
  className = "",
}) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)}</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="https://neochosen.com${route}"><meta property="og:type" content="website"><meta property="og:site_name" content="NEOChosen"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="https://neochosen.com${route}"><meta property="og:image" content="https://neochosen.com/images/NeoHeader.webp"><meta name="twitter:card" content="summary_large_image"><link rel="icon" type="image/png" href="/images/favicon.png"><link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#101a2d"><link rel="stylesheet" href="/site.css"><link rel="stylesheet" href="/sponsor-system.css"><link rel="stylesheet" href="/editorial.css"><script src="/site.js" defer></script>${extraHead}</head><body class="editorial-page ${className}"><nav class="site-nav" aria-label="Main navigation"></nav><main id="main-content">${body}</main><footer class="site-footer"></footer><script src="/pwa-register.js" defer></script></body></html>`;
