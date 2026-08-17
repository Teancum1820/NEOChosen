# NEO Chosen Event Site

Static marketing website for the **Kirtland Heritage Group** "NEO Chosen" weekend event.

## Project Structure

- `index.html` — main landing page.
- `<page>/index.html` — canonical subpages served from directory routes (for example, `/about-us/`, `/donations/`, `/raffle/`).
- `*.html` in the repository root — lightweight redirect pages that forward `.html` routes to canonical directory routes.
- `images/` — shared site imagery and favicon assets.
- `media-kit/` — downloadable media-kit graphics and gallery page.
- `sponsorship-opportunities/` — sponsorship packet page and downloadable packet image.
- `manifest.webmanifest`, `sw.js`, `pwa-register.js` — PWA metadata and service worker support.

## Local Preview

Because this is a static site, any local server works. To preview with Cloudflare Pages behavior:

```bash
npm install
npm run dev
```

Then open the local URL printed by Wrangler.

## Deployment Notes

- The site is configured for Cloudflare Pages in `wrangler.jsonc`.
- Cloudflare Pages project name: `neochosen`.
- Build command: `npm run build`.
- Build output directory: `dist`.
- Root directory: repository root.
- Production branch: `main`.
- Custom domain: add `neochosen.com` in Cloudflare Pages > Custom domains after the project is created.
- For CLI deployment, run `npm run deploy` after authenticating with Wrangler.
- Keep route pages in directory form (`/page/index.html`) and maintain matching root redirect files (`/page.html`) for compatibility with legacy links.

## Cleanup Performed

Removed repository files that were not referenced by the site:

- `images/placeholder.txt`
- `ChatGPT Image May 11, 2026, 04_08_48 PM.png`
- `1200 X630 .png`
