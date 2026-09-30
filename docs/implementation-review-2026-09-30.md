# NEOChosen local implementation review — September 30, 2026

Caleb explicitly approved Concept A and the separate slim Great Lakes ribbon in [the implementation instructions](design-approval-2026-09-30.txt). This implementation is on local branch `codex/private-figma-redesign`, based on combined PR #96 and #97 commits. The branch has no upstream. No push, merge, or Cloudflare deployment was performed. The requested production version remains outside this work's deployment scope: `f752694d-4a7c-4b33-b851-2f286875820a`.

## What changed

- `index.html`, `homepage.css`, `homepage.js`: responsive cinematic split hero, original Piano Guys photo plus four separate original cast photos, compact five-event schedule, concert feature, cast rail, coordinated sponsor tiers, visitor guidance, closing action, and existing newsletter form. Photography comes first below 900px; the narrow tablet crop was reviewed and corrected.
- `scripts/homepage.mjs`, `scripts/event-pages.mjs`, `scripts/build-static.mjs`: homepage event rows now come from the same verified event records as the detail pages. The homepage no longer duplicates event facts and live registration destinations. All five existing primary destinations are preserved.
- `scripts/sponsor-system.mjs`, `scripts/sponsors.json`: shared sponsor data still owns Great Lakes weekend recognition, FNA/Advanced Care event roles, Barons platinum recognition, and approved community partners. A separate gold ribbon immediately follows the hero. Logo artwork is contained at its natural aspect ratio. Links use visible names; repeated decorative logo alt text was removed.
- `site.css`, `scripts/site-chrome.mjs`, `fonts.css`, `events/event.css`, `sponsors/sponsors.css`: consistent navy, cream, gold and teal tokens, Cinzel/Montserrat type, coordinated shared navigation/footer and compatible event/directory styling. Existing mobile menu, focus handling, routes, forms and page-specific content remain functional.
- `design-system/image.mjs`, `scripts/performer-images.mjs`, `scripts/optimize-images.mjs`, `images/performers/`: explicit image dimensions and responsive WebP/AVIF sources; the hero has high fetch priority and below-fold images remain lazy. The tall desktop crop requests sufficient resolution. No image was generated, retouched, filtered or combined.
- `source-assets/performers/`: unchanged approved Figma cast source images. These large originals are excluded from `dist`; delivery derivatives are served. The Piano Guys source remains the existing approved `images/piano-guys-feature.webp`; the older Downloads original is no longer on disk. [Photograph provenance](performer-asset-provenance.json) records source hashes.
- `images/fonts/`: local copies of the same fonts with their SIL licenses. `images/partners/` caches the existing approved remote partner artwork; [asset provenance](sponsor-asset-provenance.json) records origins and hashes. Organization names, event relationships and sponsor website destinations are unchanged.
- `manifest.webmanifest`, `images/neo-*.png`, `sw.js`: correctly sized favicon/app icons and a new offline cache version. The original favicon remains available. The old app manifest fetched the 2.17 MB original; it now references actual 192px/512px derivatives.
- `.storybook/preview.mjs`, `tests/browser/`, `scripts/capture-implementation.mjs`, `package.json`: shared fonts in Storybook, verified event/CTA consistency, eight header/hero width checks, keyboard menu/focus checks, deferred newsletter behavior, expanded accessibility coverage, and review capture tooling.

The eight sponsorship sections, PDFs, media downloads, redirects, structured event data, canonical URLs, thank-you pages, raffle analytics and backend handlers are preserved. Changes to the homepage and shared chrome are the scope of this approved implementation; page-specific content was retained.

## Verification

- Production build: pass.
- Sponsor, event, local-link and site-chrome checks: pass; 1,248 local references across 37 built HTML files, 24 content pages with shared chrome, five event detail routes, and the sponsorship landing page plus eight detail routes.
- Storybook production build: pass.
- Functional Playwright: 7 tests pass.
- Accessibility Playwright: 9 tests pass, covering homepage, sponsors, all five events, raffle/form page, mobile homepage and open mobile navigation. No serious/critical WCAG violations remain in those scans; mobile checks have no violations. Existing homepage/event kicker contrast failures are fixed. External Zeffy content is managed by its provider.
- Visual regression: 4 tests / 10 snapshots pass in a normal test run after baselines were reviewed and refreshed for the approved redesign.
- Responsive captures: 320, 375, 390, 430, 768, 1024 and 1440px across the homepage and ten supporting routes (77 route/viewport combinations). Horizontal overflow: zero. An extra 1200px desktop header check also passes.
- Formatting, lint, type checking, and whitespace diff check: pass.
- Existing raffle source and mocked function checks: pass.
- Live newsletter read-only check: the existing Zeffy script and newsletter iframe return HTTP 200 and render the email field and Submit control. No form, donation, registration or newsletter submission was sent.

Visual differences were inspected before changing any baseline. Expected changes include the new split hero, compact rows, navy navigation/footer, gold sponsor ribbon, responsive sponsor credit and coordinated directory type/surface colors. Side-by-side evidence is saved in `artifacts/implementation/visual-diffs/`. The new mobile hero/ribbon were separately inspected. Baselines were then updated and the normal comparison suite rerun successfully.

## Lighthouse

| Route | Performance before → after | LCP before → after | Accessibility after | Best practices after | SEO after |
| --- | --- | --- | --- | --- | --- |
| / | 89 → 98 | 3.2s → 2.3s | 100 | 100 | 100 |
| /sponsors/ | 71 → 89 | 14.9s → 3.6s | 100 | 100 | 100 |
| /chesterland/ | 92 → 99 | 2.9s → 1.8s | 100 | 100 | 100 |


See `artifacts/implementation/lighthouse-comparison.json` for the final measured comparison and raw reports in `lighthouse-before/` and `lighthouse-after/`. Runs use the unchanged repository Lighthouse configuration: mobile simulation, one run for each of `/`, `/sponsors/`, and `/chesterland/`. These are local laboratory measurements, not production field data. The fresh combined-branch baseline was 3.2 seconds on the homepage and 14.9 seconds on the sponsor page; it did not reproduce the older 15+ second homepage figure from the brief.

## Screenshot review

Review captures are local artifacts (not committed or published). Relative paths below resolve from this worktree.

| Capture | Desktop 1440px | Mobile 390px |
| --- | --- | --- |
| Homepage | [Full page](../artifacts/implementation/home-1440.png) | [Full page](../artifacts/implementation/home-390.png) |
| Hero | [Hero](../artifacts/implementation/hero-1440.png) | [Hero](../artifacts/implementation/hero-390.png) |
| Five-event section | [Events](../artifacts/implementation/events-1440.png) | [Events](../artifacts/implementation/events-390.png) |
| Great Lakes ribbon | [Ribbon](../artifacts/implementation/ribbon-1440.png) | [Ribbon](../artifacts/implementation/ribbon-390.png) |
| Performer rail | [Performers](../artifacts/implementation/performers-1440.png) | [Performers](../artifacts/implementation/performers-390.png) |
| Sponsor hierarchy | [Sponsors](../artifacts/implementation/partners-1440.png) | [Sponsors](../artifacts/implementation/partners-390.png) |

`artifacts/screenshots/` contains all seven-width route captures. `artifacts/implementation/photo-delivery.json` verifies the five photographic hero slots are loaded from nonempty local sources, with correct rendered geometry. Review section captures hide sticky navigation only while taking a crop, so the header cannot obscure event content. The final full homepage captures include the live newsletter without submitting it; sticky positioning is disabled only for those captures to keep the actual navigation at the top while the external iframe is painted. The standalone `newsletter-live-390.png` shows the unmodified sticky navigation and loaded form. The deterministic `screenshots:review` command blocks external requests, so its recreated full-page captures show the signup fallback rather than the live provider form.

## Content questions retained

1. VIP dinner venue: current verified site data says **Windows on the River**. The sponsorship PDF/lower Zeffy copy references **Music Box Supper Club**. This implementation retains Windows on the River and documents the discrepancy rather than making a factual change.
2. The official Piano Guys theater ticket destination and final price remain unconfirmed. The existing ticket-updates destination is preserved; no ticket link was fabricated.
3. Advanced Care has no approved logo in the shared records, so its real name is used as the designed fallback. Great Lakes printable Media Kit artwork remains outdated and requires a separate approved collateral update.
4. Real submissions and fulfillment are untested; the existing provider URLs and integration behavior were preserved, and newsletter rendering was checked without submitting.

## Local preview

The local preview runs at **http://127.0.0.1:4173/**. To start it from a stopped state in PowerShell:

```powershell
Set-Location -LiteralPath 'C:\Users\caleb\OneDrive\Documents\New project\neochosen-private-redesign'
npm run build
node scripts/serve-static.mjs
```

Reproduce the review screenshots with `npm run screenshots:review` while that server is running. Run `npm run screenshots` for the seven-width route set. The localhost server binds to loopback only.

This is the implementation review checkpoint. Caleb must approve any future push, PR merge, main merge, or Cloudflare deployment. A pushed branch in the current public repository would be publicly visible, so the local branch is intentionally unpublished.
