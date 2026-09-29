# Frontend tooling audit

Audited `main` at `401a1df` before adding tooling. This PR branches from that production baseline and does not include the separate homepage redesign PR.

## CURRENT STACK

Static HTML, CSS, and browser JavaScript. Node ESM scripts assemble the release; React and React DOM are used only at build time to render Lucide icons. No client React application, TypeScript, Tailwind, shadcn/ui, or animation library exists. Canonical routes use `<route>/index.html`; root `.html` files preserve old links.

## CURRENT BUILD COMMAND

`npm run build` runs `scripts/build-static.mjs`, copying page/assets to `dist/`, generating sponsorship pages and icons, and applying shared navigation/footer and sponsor placeholders. npm and `package-lock.json` are already in use.

## CURRENT DEPLOYMENT

`wrangler.jsonc` configures Cloudflare Pages with `pages_build_output_dir: ./dist`, the `neochosen` project, and D1/R2 bindings for raffle functions. `main` is the production branch per README. `npm run dev` uses Wrangler Pages locally; `npm run deploy` is a manual deployment command. This tooling PR keeps those settings and commands intact.

## CURRENT TESTING

Build-time Node checks cover sponsorship pages, shared chrome, raffle coming-soon content, and mocked raffle Functions. No browser end-to-end, visual, accessibility, performance, lint, typecheck, or formatting gate is configured.

## CURRENT CSS SYSTEM

`site.css` has a small `--site-*` variable set for shared chrome. Most homepage and interior-page styles are embedded in HTML or route CSS, with independent color/spacing values. Existing breakpoints include 430, 560, 599, 700, 767/768, 1000, and 1200px. Fonts include Cinzel, Montserrat, Cormorant Garamond, and Raleway via Google Fonts; pages do not yet use one typography scale.

## CURRENT COMPONENT SYSTEM

Shared build functions produce the navigation/footer, sponsorship pages, sponsor recognition, and icons. Event items, performer cards, CTAs, and forms are page-local markup. Storybook can show existing built fragments and small future-ready primitives without migrating the public site.

## CURRENT IMAGE PIPELINE

Local assets are copied unchanged. The 2.4 MB `hero.png` and 2.1 MB `favicon.png` stand out; sponsorship summaries and media-kit raster downloads are larger still. Remote artist, cast, and several sponsor images rely on external hosts. There is no responsive-image helper, image metadata check, or build-time optimization. Approved logos and artist/cast imagery must remain untouched.

## CURRENT CI

No `.github/workflows` pipeline is present. Cloudflare's Git integration may build previews independently; this PR does not alter it.

## OTHER SITE INTEGRATIONS

Zeffy powers event registration and newsletter embeds. The raffle includes a Cloudflare Pages Function backed by D1/R2 and a small custom event analytics endpoint. Automated browser tests must neither submit live forms nor call production write endpoints.

## GAPS

- No repeatable component workshop, responsive screenshot workflow, visual baseline, or manual-review artifact.
- No browser-level functional or accessibility gate.
- No measured performance baseline or automated non-regression check.
- No consistent semantic tokens, typography/spacing guidance, or image usage policy.
- No pull-request CI independent of hosting.

## RECOMMENDED CHANGES

1. Add semantic CSS tokens beside legacy aliases; apply new tokens to the development-only component workshop first.
2. Use Storybook's HTML/Vite integration, Playwright Chromium, axe-core, and Lighthouse CI against the existing static build.
3. Add a Sharp-based **opt-in** image pipeline and metadata audit; preserve source files and keep generated variants out of this PR's production pages.
4. Add focused lint/typecheck/format commands and GitHub Actions with cached npm/browser dependencies and uploaded review reports.
5. Keep Tailwind, shadcn/ui, Motion, Chromatic, and framework migration out of this PR: they add a second app architecture or unnecessary cost for this static site.
