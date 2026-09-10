# NEO Chosen Event Site

Static marketing website for the **Kirtland Heritage Group** "NEO Chosen" weekend event.

## Project Structure

- `index.html` — main landing page.
- `scripts/site-chrome.mjs` — shared navigation and footer, applied to every content page during the build. Update this module instead of individual page headers and footers.
- `site.css` and `scripts/site-template.js` — shared responsive styling and accessible menu behavior. Run `npm run check:site-chrome` after building to validate navigation, footer links, and retired signup removal.
- `<page>/index.html` — canonical subpages served from directory routes (for example, `/about-us/`, `/donations/`, `/raffle/`).
- `*.html` in the repository root — lightweight redirect pages that forward `.html` routes to canonical directory routes.
- `images/` — shared site imagery and favicon assets.
- `media-kit/` — downloadable media-kit graphics and gallery page.
- `sponsorship-opportunities/` — shared sponsorship portal styles; the landing page and eight detail routes are generated at build time from `scripts/sponsorship-decks.mjs`.
- `sponsorships/` — the eight downloadable sponsorship PDFs and static Quick Summary images.
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
- Deploy command: `npx wrangler deploy`.
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

## Sponsor recognition

- Edit `scripts/sponsors.json` to add or update sponsors. `scripts/sponsor-system.mjs` renders the directory, homepage event cards, and sponsorship portal recognition from these same records during the build.
- Current confirmed groups are Presenting Sponsors and Community Partners. Hallmark has no confirmed paid tier or event assignment. Do not infer tiers from donation amounts or add event assignments without confirmation.
- FNA presents Akron and Fairlawn only. Advanced Care Endodontics remains a co-presenter for Fairlawn. Neither is a presenting sponsor of Chesterland.
- Original artwork: `images/fniconred.svg` from Todd's September 9 email, and `images/Hallmark_Homecare_Logo.svg` from Joe's September 10 forwarded materials. FNA's icon must appear with its live company name, per Todd's note. Hallmark's confirmed telephone is 216-390-1090.
- `sponsor-system.css` provides shared contained artwork, prominent presenting cards, and a compact Community Partners grid (5 desktop / 3 tablet / 2 mobile columns). No empty or unconfirmed major tier is displayed.
- Run `npm run build` to generate the sponsor placeholders before previewing `dist`.
