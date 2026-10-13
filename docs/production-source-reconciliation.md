# Production source reconciliation — October 13, 2026

This branch records already-deployed partner changes in Git. It introduces no intended public content or Worker behavior change beyond the live release it reconstructs.

- Base: GitHub `main`, `bda3949fde9a37664364466f1b49e50a8279be37`.
- Target live Worker version: `db1ad8f1-c77a-4601-bb7f-362a0fd8b569`, deployed October 13, 2026.
- Source: the preserved existing `NEOChosen-latest` working tree, including approved partner work published October 9 and October 13.
- Included: the five modified sponsor/event/style/check files and seven partner logos, including Safe Families Northeast Ohio and Envision Cleveland.
- Preserved: existing sponsor identities/tier relationships, unlisted breakfast rules, private Sheets backend and deployment configuration.
- Excluded: generated `dist`, dependencies, private data, credentials and unrelated media-kit production work.

## Validation

- `npm test` passed: sponsorship pages, shared navigation/footer on 29 pages, 1,559 local references across 39 HTML files, five event records/routes, sponsor hierarchy, raffle holding-state/mock handlers, nine mocked breakfast tests and unlisted-breakfast checks.
- All 269 rebuilt static files match the saved deployed release output byte for byte.
- The local dry-run compiled Worker matches the retrieved live Worker byte for byte.
- All 54 fresh read-only public page/partner-logo comparisons match the rebuilt content, with the existing raffle-rules redirect handled explicitly.

No deployment, provider transaction, private Sheet request, real form submission, account grant or email is part of this reconciliation.

## Open and maintain

Use Node 24 per `.nvmrc`, install locked dependencies with `npm ci`, then run `npm run build` and the existing local preview. Edit sponsor data in `scripts/sponsors.json`, event records in `scripts/event-pages.mjs` and shared rendering in `scripts/sponsor-system.mjs`; generated output is not the source of truth.

Before pushing or merging, confirm Cloudflare Builds branch behavior. A successful Workers Builds integration exists; syncing Git must not silently activate production. Record this source commit alongside the target version after approved Git publication.
