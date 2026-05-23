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

Because this is a static site, any local server works. For example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deployment Notes

- `CNAME` is configured for GitHub Pages custom-domain deployment.
- Keep route pages in directory form (`/page/index.html`) and maintain matching root redirect files (`/page.html`) for compatibility with legacy links.

## Cleanup Performed

Removed repository files that were not referenced by the site:

- `images/placeholder.txt`
- `ChatGPT Image May 11, 2026, 04_08_48 PM.png`
- `1200 X630 .png`
