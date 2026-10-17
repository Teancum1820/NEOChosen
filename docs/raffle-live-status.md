# Raffle publication and remaining launch blockers

## Current update: sales opened at Caleb's explicit instruction

Caleb subsequently instructed: **“Make the Zeffy live so people can start buying tickets.”** The existing Zeffy campaign was opened using its **Open sales** control. Public Add buttons are enabled for $20/1, $50/3 and $100/7. Selecting one $50 package and continuing reached the required buyer questions, $50 order summary, optional Zeffy contribution and live payment methods. The cart was cleared afterward. No acknowledgments were accepted, no payment information was entered, and no purchase was submitted.

The saved native schedule was rechecked after opening: drawing November 15 at 6 PM, end 6:01 PM, blank opening, sales closing November 15 at 5 PM. Existing America/New_York configuration was preserved. Public description and automatic-email copy were updated to remove obsolete closed/pre-launch wording and link to the current production rules. The five event links and social links remain.

The NEOChosen website was deployed with all three package buttons connected to the existing checkout. Production version **764697e2-8479-4194-8cdc-9a1d06b02356**. Browser verification showed “Ticket sales are open,” three correct checkout links and no disabled package buttons. Build/site/function tests and lint passed. A screenshot records the enabled native Add buttons.

`salesAuthorized` records Caleb's direct instruction separately from `rulesFinalized`, which remains false. Opening sales does not establish that the unresolved legal/accounting terms have been finalized or that paid issuance/export/physical-print tests passed. Those limits below remain factual. The draft rules and the live description continue to identify terms under review; no missing policy was invented. The remainder of this report is the immediately preceding closed-sales snapshot.

October 16, 2026 Mountain Time (verification completed October 17 UTC).

Joe's [reply](https://mail.google.com/mail/u/0/#all/1a1471c29daa1dde) explicitly says to make it live. Caleb directly authorized launch and thorough testing in this chat. The earlier lack of launch authorization is resolved. **The information page is live; paid sales are not open. Do not report the raffle as fully functional or fully tested.**

## Published

- https://neochosen.com/raffle/ now presents the reviewed design, three packages, six percentages, schedule, eligibility, ticket explanation and KHG/Great Lakes sponsor recognition. It accurately says sales are closed; all three purchase controls are disabled. The preview's simulated checkout dialogs are absent.
- https://neochosen.com/raffle/rules/ serves the reviewed rules and organizer details rather than redirecting. Unresolved terms remain explicitly marked as draft; they were not invented or silently converted to final terms.
- Homepage plus all five event pages have a raffle feature and link. Shared navigation/footer labels now say Cash Raffle. The service-worker cache was updated.
- Production Worker version: `58eed9af-3e78-498f-84be-a4f68599c7de`. Prior rollback version: `d7b173f4-8a54-4297-9dab-c801f2792ee5`. Existing production config, secrets and variables were preserved. No worker logic, banking, real payments or analytics implementation was changed. PR #106 remains separate.

## Implemented and tested

- [Private print-register tool](raffle-print-register.md): persistent SQLite reservations, exact native ticket numbers, printable HTML and source/file-hashed manifests, repeat-import protection, held/refunded ticket removal reports, witnessed physical confirmation and witnessed quarantine logging. This consumes reviewed normalized snapshots; it is not a verified raw Zeffy export adapter.
- 29 Python tests passed: 1/3/7 packages, mixed orders, duplicate/conflict handling, failed/pending/refunded records, number ownership, atomic file failures and physical-check controls. A fictional 23-stub batch rendered with 23 unique numbers and no clipped boxes. No actual paper was printed.
- `npm test` passed: sponsorships, shared navigation/footer on 30 pages, 1,651 local references, five event facts/CTAs, sponsor hierarchy, three raffle-release tests, existing raffle function tests, nine breakfast API tests and unlisted-page checks.
- `npm run typecheck`, `npm run lint`, production deployment dry-run and `git diff --check` passed.
- Browser checks at 1440, 768, 390 and 320 pixels showed no horizontal overflow on raffle and rules pages. Deferred sponsor images loaded without broken images after scrolling into view. Deployed mobile navigation and its Cash Raffle link worked; the live rules link opened the correct rules page and displayed organizer EIN.
- Deployed HTTP checks: raffle/rules, homepage and five event pages returned 200; `/raffle.html` redirected to `/raffle/`; the unrelated breakfast API still rejected GET with 405. No form submission or payment was made.
- A new native Zeffy **Send test email**, addressed only to Caleb, arrived in Gmail INBOX at `2026-10-17T00:03:36Z`, message `1a1472bd020ca7fc`. The five event-page links and two social-follow links in the delivered email each returned a 302 redirect to the exact intended destination. The email's John/$71 receipt is Zeffy's fictional preview data, not an order or issued ticket.
- Actual campaign-only Payments and Itemized payments XLSX exports downloaded. Both contained header rows only. Neither included a stable payment ID column; itemized row/bundle semantics remain unverified with real data.

## Still required before accepting purchases

1. **Final missing rules decisions and clearance.** The September 30 source explicitly leaves refund/reversal treatment, prize cent rounding, replacement drawings/unclaimed prizes and other legal/accounting terms undefined. Joe's go-ahead resolves launch authorization but does not supply these missing choices. Caleb was asked for the final decisions and clearance for the proposed U.S.-resident online-sale arrangement. No response or legal clearance is inferred from silence. Current Ohio statute permits qualifying nonprofit raffles but does not independently establish nationwide online-sale clearance: https://codes.ohio.gov/ohio-revised-code/section-2915.092 .
2. **Controlled real provider test by a human.** Zeffy's documented payment test is an actual payment; a $0 ticket or manual-payment workaround would create production records and would not prove paid bundle processing. Do not add free/discounted raffle rates or fabricated production payments. The user must perform any real raffle transaction; the computer-use policy reserves prize-based transactions to the human. Verify $20/1, $50/3, $100/7 and mixed packages, native ticket access, delivery/resend, refunds/cancellations, no duplicate entries and a populated report-to-stub mapping. Reference: https://support.zeffy.com/test-the-platform-run-payment-tests-and-test-confirmation-emails-wuu20 .
3. **Physical and operational rehearsal.** Assign actual purchase/eligibility reviewer, reconciliation lead, printer, independent witness and drawing crew. Confirm the custom or native detachable-stub format, actually print/cut/count a batch and rehearse removing all tickets belonging to a winner. Confirm the venue permission and accounting/payment procedure through the organization's process.
4. **Final activation sequence.** Replace draft rules with the completed effective rules, update Zeffy description and confirmation to final production links/copy, restore and verify the November 15 5 PM America/New_York native cutoff, then open the existing campaign and verify direct checkout. Enable `salesOpen`/`rulesFinalized` in `source-assets/raffle-launch.json` only after the corresponding content and provider steps are complete. Build-time cutoff logic is not a substitute for Zeffy's server-side cutoff; check both direct checkout and an already-open cart.

The deployed website intentionally does not claim that these unperformed tests passed. The campaign remains sales-closed with zero raffle sales observed. No launch email was sent to Joe by the agent.
