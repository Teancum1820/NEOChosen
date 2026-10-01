# Frontend workflow

Use Node 24 from `.nvmrc`, matching CI and the local baseline. Run `npm ci` from the repository root, then `npx playwright install chromium` once. The project remains static HTML/CSS/JS.

| Task | Command | Result |
| --- | --- | --- |
| Production build | `npm run build` | Cloudflare-compatible `dist/` |
| Cloudflare local preview | `npm run dev` | Wrangler Pages local server, including Functions |
| Component workshop | `npm run storybook` | Local development-only Storybook on port 6006 |
| Storybook static build | `npm run build-storybook` | Ignored `artifacts/storybook/` |
| Functional browser tests | `npm run test:e2e` | Current routes, nav, CTAs, forms, JS exceptions |
| Accessibility tests | `npm run test:a11y` | Serious/critical axe checks on four routes |
| Visual regression | `npm run test:visual` | Compares reviewed component screenshots |
| Responsive captures | `npm run screenshots` | Ignored `artifacts/screenshots/` with all seven viewports |
| Performance | `npm run lighthouse` | Local-build reports in `.lighthouseci/` |
| Source checks | `npm run lint`, `npm run typecheck`, `npm run test` | New tooling lint/typecheck and existing Node tests |
| Image audit/variants | `npm run images:audit`, `npm run images:optimize` | Metadata report / ignored opt-in outputs |

`npm run test:visual:update` rewrites the eight small committed component baselines. Run it only for an intentional visual change, inspect the PNG diff, and include the changed baselines in the PR. The baselines were created on Windows Chromium; CI uses Windows Chromium to minimize font rendering drift. If a browser/font update changes snapshots broadly, verify the rendered site before accepting them.

The screenshot workflow blocks third-party requests and disables animation, so it is deterministic and cannot submit Zeffy forms. On this combined local branch it captures all five generated event routes alongside the other canonical pages and the homepage event section. `artifacts/screenshots/overflow.json` records document-width overflow candidates for review. Browser tests run against a local static server; they do not exercise production Cloudflare Functions or live third-party embeds.

GitHub Actions runs one Chromium job on pull requests, then uploads the Playwright report, responsive screenshots, and Lighthouse reports even if a check fails. Cloudflare Git previews, if configured externally, remain separate; this workflow does not deploy. Use `npm run dev` to review a Cloudflare preview locally and check Function behavior separately when changing backend code.

Known tooling dependency issue: `npm ci` currently reports 14 advisory findings in development dependencies, primarily the latest Lighthouse CI dependency tree and the existing pinned Wrangler tree. `npm audit --omit=dev` reports zero production dependency findings. Do not run `npm audit fix --force` without reviewing its incompatible Lighthouse CI downgrade and Cloudflare changes.
