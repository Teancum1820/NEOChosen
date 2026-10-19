# NEO Chosen Cash Raffle — preparation and review notes

## Current display — simplified at Caleb's request

The public raffle content is now only the Coming Soon label, NEO Chosen Cash Raffle heading, “Six cash prizes. One great cause.” line, and KHG preparation paragraph. Notification UI, rules links, status-card disclosures, pricing, prize table, dates, eligibility, and all other raffle sections have been removed from the current page. Shared site navigation and footer remain.

The prepared full proposal and draft rules are saved outside the public build at `source-assets/raffle-archive/cash-raffle-proposal.html` and `source-assets/raffle-archive/cash-raffle-draft-rules.html`. `/raffle/rules/` now redirects to `/raffle/`; it does not expose the draft legal content. The notification script is not loaded. No sales, deployment, or merge has occurred.

The preparation notes below describe the deferred work and remain for later reference; their draft-page/form preview descriptions are no longer the current public display.

Status: **COMING SOON. Preparation only. No sales authorization, deployment, merge, checkout, or payment integration.**

## Current review pages

- `/raffle/`: proposed cash raffle; no ticket sales or entries accepted.
- `/raffle/rules/`: **DRAFT FOR LEGAL REVIEW / NOT FINAL / RAFFLE SALES ARE NOT YET AUTHORIZED**. Directly accessible for review, with `noindex, nofollow` metadata and a matching `_headers` rule. No indexing or legal approval is implied.
- Local preview: `http://127.0.0.1:4173/raffle/` and `http://127.0.0.1:4173/raffle/rules/` after building/serving. These are local URLs, not shareable hosted previews.

## Inspection and conflicting legacy material

Inspected `raffle.html`, `raffle/` including `index.html`, `RAFFLE_SETUP.md`, `giveaway-rules.html`, `giveaway-rules/`, `index.html`, shared styles, sponsor data/rendering, build/navigation/event scripts, `functions/`, database migration, `_redirects`, and `_headers` before replacing the old page.

1. `/raffle/` already existed and was linked under More and in interior-page footers as “Raffle — Coming Soon.” The route and navigation placement are retained. No extra main-nav item was needed.
2. Its previous page/title/description promoted approximately 50 donated prizes, gift baskets, vacations, dining, golf, and other experiences. It included a donated-prize gallery, prize-donation email CTA, general donation CTA, and a raffle-interest newsletter embed. That plan conflicts with the current six-prize cash raffle. The old source page is preserved at `source-assets/raffle-archive/experience-coming-soon.html`; this directory is not included in the public static build.
3. `raffle/raffle-data.js` contains empty prize/partner arrays and example comments for the old donated-prize model. It is preserved unchanged. Legacy `raffle.js` and `raffle.css` are also preserved but are **not loaded by either new page**. Do not populate or activate them as cash-raffle launch configuration.
4. `RAFFLE_SETUP.md` described legacy Zeffy shutdown/export, prize-donation submissions, private uploads, and signup list setup. It now carries a supersession notice; the original reference checklist remains. It is not a launch approval.
5. Existing redirects for `/raffle.html`, generic `/thank-you` aliases, and retired raffle flyer/mail-in PNG/PDF URLs point to `/raffle/`. They are preserved so old links/QR destinations reach the holding page. No newly generated purchase QR or payment URL was added. Printed QR pixels were not independently decoded; retired file destinations were inspected in `_redirects`.
6. The separate `/giveaway-rules/` page concerns a free front-row-seat social giveaway, not the cash raffle. Its September 27 close / September 28 selection dates and giveaway terms are preserved; cash raffle rules do not link to or reuse that giveaway. Other event and dinner dates/CTAs were not repurposed.
7. The new cash pages contain no old basket/experience raffle offer, old prize count, old cash guarantee, or obsolete sales/drawing time. Shared event navigation still identifies the separate concert and meet-and-greet pages. On the two raffle pages only, the footer's generic “Get Tickets” label becomes “Concert & event details” to avoid suggesting raffle sales are open.

## Records and infrastructure preserved

- No D1/R2 query, export, deletion, migration, or account-side operation was performed. Existing purchaser/payment data was neither accessed nor changed.
- `migrations/0001_raffle_forms.sql`, `functions/api/prize-donations.js`, and `functions/api/analytics-events.js` remain unchanged. The prize endpoint is gated by `PRIZE_FORM_ENABLED === 'true'`; it remains closed by default. No environment flag was changed.
- `RAFFLE_SETUP.md` references an old Zeffy checkout, `Kirtland Heritage Group's Raffle 2026`. Its remote sales state and purchase history remain **unverified**. The old checkout is not linked or embedded in the new cash pages. Before any later launch, the account owner must verify its status and preserve payment, purchaser, ticket, contact, and answer exports before any retirement/migration.
- Prior source history remains in Git; the archival HTML is also retained outside the build. No old records were silently discarded.

## Notification form status

The prior newsletter URL was `https://www.zeffy.com/en-US/embed/newsletter-form/neochosen-raffle-interest`. The read-only attempt to inspect that URL did not establish availability, list assignment, consent behavior, or separation from registrations/purchases. No test signup was sent.

The new form is an explicitly labeled **notification signup preview**, not a live mailing-list connection. JavaScript prevents submission; no field has a submitted `name`, and submit controls are disabled until the preview handler is installed. A valid preview submission resets the fields and says no email was sent or saved and no signup occurred. It uses no backend, browser storage, payment system, or successful-signup analytics. Without JavaScript it remains disabled. No SSNs or identity documents are requested.

Before real signup activation, confirm the dedicated raffle notification list/provider, permission to collect contacts, optional raffle-only consent, privacy/retention terms, unsubscribe behavior, delivery/confirmation copy, and end-to-end signup behavior. Do not reuse event registration or paid checkout as a notification mechanism.

## Proposed facts — not final rules

- Ticket packages: $20 / 1 entry; $50 / 3 individually numbered entries; $100 / 7 individually numbered entries. No bonus/free entries or purchase controls.
- Prize percentages: 20%, 6%, 5%, 4%, 3%, 2%; total 40%. Remaining 60% proposed for allowable expenses and KHG programs.
- Intended opening: Thursday, October 1, 2026 at 1:00 PM Eastern Time, pending final approval. There is no timer or automatic opening behavior.
- Proposed close: Sunday, November 15, 2026 at 5:00 PM Eastern Time.
- Proposed drawing: Sunday, November 15, 2026 at 6:00 PM Eastern Time. **No drawing venue is stated.**
- Proposed eligibility: 18+, Ohio resident, physically in Ohio when purchasing, purchasing for oneself; exact requirements/exclusions pending legal review.
- Proposed six distinct eligible purchasers minimum; one cash prize per person; matching physical drawing stubs; winners need not be present.
- No guaranteed minimum dollar prize, hypothetical dollar awards, final legal certification, or platform approval claim.

## Unresolved organizer fields

The draft visibly uses these placeholders:

- `[LEGAL ENTITY NAME TO CONFIRM]`: exact legal entity name/suffix and organizer authority.
- `[MAILING ADDRESS TO CONFIRM]`: designated raffle/legal correspondence address. The project's general donation address is 38323 Apollo Parkway Unit 7, Willoughby, Ohio 44094; it has not been confirmed as the raffle/legal address.
- `[RAFFLE EMAIL TO CONFIRM]`: monitored raffle contact. General site email `info@kirtlandheritagegroup.com` is not automatically designated as the raffle operations mailbox.
- `[PHONE TO CONFIRM]`: approved raffle/legal contact phone. The site's general contact number is not automatically designated for raffle administration.
- `[RULES VERSION / EFFECTIVE DATE TO CONFIRM]`: approved version/date; none invented.

## Legal, accounting, platform and operational decisions still required

1. Legal review of organizer authority, eligibility/age/residency/location verification, purchasing for oneself, exact officer/director/employee/administrator/family/household exclusions, transfer/resale/joint ownership, tax notice, odds, and final rules.
2. Final definition of eligible gross raffle-ticket sales, fees/expenses treatment, excluded separate donations/sponsorships/event admissions/optional Zeffy contributions, refunded/reversed receipts and corresponding pool adjustments, tax withholding/reporting, and accounting reconciliation. No statutory withholding rates or requirements are invented here.
3. Zeffy confirmation of the proposed online transactions and uniquely numbered ticket email workflow, package numbering, purchaser deduplication across orders, matching physical stub reconciliation, and controls preventing duplicate entries when tickets are reprinted/re-sent.
4. Minimum six distinct eligible purchasers threshold and cancellation/refund treatment if it is not met.
5. Physical-stub procedure, witnesses, reconciliation records, grand-prize-first drawing, removal of all remaining tickets owned by each winner, one-prize-per-person verification, and drawing controls.
6. Proposed contact within two business days; three documented attempts on different days; 30-calendar-day response/documentation period. These are proposals, not assertions of legal deadlines.
7. Secure identity/eligibility/ownership/tax verification, retention/access policies, and payment initiation within 30 calendar days after verified paperwork, subject to approval. Do not collect SSNs/documents through the public site.
8. Final refund/reversal/invalid-entry policy, pool reconciliation, replacement drawings for disqualified winners, and lawful disposition of unclaimed amounts. Unclaimed prizes must not automatically become donations.
9. Permitted cancellation/postponement reasons, purchaser notices, no extension solely for revenue, proposed maximum 30-day postponement, and cancellation-refund initiation within 10 business days.
10. Separate optional marketing consent, privacy/retention policy, secure sensitive-data handling, and approved public winner-announcement details.
11. Venue/drawing permission and permission to disclose a location later; no venue published now.
12. KHG final approval and explicit launch authorization after legal, accounting/tax, platform, and end-to-end ticket/drawing testing. **An October 1 time does not authorize automatic sales opening.**

## Organizer and sponsor roles

Kirtland Heritage Group is labeled the raffle organizer. Great Lakes Auto Group is recognized only as NEO Chosen Weekend Presenting Sponsor using the existing central sponsor record and approved logo. No sponsor, performer, cast member, church, or venue is represented as running the raffle, guaranteeing prizes, selecting winners, or paying winners. Existing sponsor hierarchy, including Ascend's community tier, is retained.

## Review evidence

Build/static checks cover both routes, package math, six percentages totaling 40%, exact dates/times, draft/noindex notices, local links, retired-copy removal, and absence of checkout controls on the cash pages. Browser checks cover desktop/tablet/mobile layout, notification preview with no write requests, FAQ and rules-section navigation, image loading/containment, and accessibility. Rendered screenshots and detailed local checks are saved under ignored `artifacts/cash-raffle/`.

- `npm test`: passed all static/site/raffle checks and mocked legacy-handler tests, including the default-closed prize-submission gate.
- Six targeted Playwright functional/accessibility tests: passed, including the notification preview, JavaScript-disabled state, rules navigation, and draft noindex status.
- Eight rendered views (320, 390, 768, and 1440 pixels; both routes): zero horizontal overflow, browser errors, write requests, or WCAG A/AA axe violations.
- Relevant ESLint checks and Git whitespace checks: passed.
- The offline cache version was advanced to invalidate the previous raffle plan; the new holding-page styles and preview script are included in the offline asset list.

## Files changed in this raffle task

- `raffle/index.html` — cash raffle holding page.
- `raffle/rules/index.html` — new draft rules page.
- `raffle/cash-raffle.css` — shared raffle/rules presentation.
- `raffle/cash-raffle.js` — non-transactional notification preview.
- `scripts/sponsor-system.mjs` — centrally rendered organizer/weekend-sponsor recognition; existing sponsor tiers untouched.
- `scripts/site-chrome.mjs` — raffle-page footer wording avoids a generic ticket-sales CTA.
- `scripts/check-raffle-coming-soon.mjs` — new cash/draft/closed-state validations.
- `scripts/check-site-chrome.mjs` — accounts for the added draft route.
- `scripts/test-raffle-functions.mjs` — verifies legacy submissions remain closed by default without writes.
- `tests/browser/functional.spec.mjs` — preview form, no-JavaScript, routes, and navigation tests.
- `tests/browser/a11y.spec.mjs` — draft rules accessibility coverage.
- `_headers` — draft noindex and no-store headers.
- `sw.js` — offline cache version and new asset references.
- `RAFFLE_SETUP.md` — legacy setup supersession notice.
- `RAFFLE-REVIEW-NOTES.md` — inspection, conflicts, preservation, approvals, and evidence.
- `source-assets/raffle-archive/experience-coming-soon.html` — preserved old page, excluded from the build.

Ascend's sponsor data/logo and the associated sponsor checks were already uncommitted from the preceding sponsor task. Those changes are preserved; no sponsor tier was altered by the raffle task.

Nothing was deployed, merged, pushed, enabled in Zeffy, or authorized for ticket sales by this task.
