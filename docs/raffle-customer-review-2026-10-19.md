# Raffle customer review package — October 19, 2026

**DRAFT / SALES CLOSED. Ready for review is not launch authorization.** New graphics are unpublished.

| Material | Review location | Scope |
| --- | --- | --- |
| Live raffle information | https://neochosen.com/raffle/ | Closed-sales production page |
| Published rules draft | https://neochosen.com/raffle/rules/ | Unapproved terms retained |
| Existing rules review | https://neochosen-raffle-review.calebday1820.workers.dev/raffle/rules/ | Refreshed October 19 review-only deployment; rules still unapproved |
| Existing email preview | https://neochosen-raffle-review.calebday1820.workers.dev/raffle/confirmation-preview/ | Refreshed October 19; accurate closed-sales copy, no ticket issuance |
| Current email message source | [Confirmation content](../source-assets/raffle-preview/confirmation-message.html) | Native subject is Your NEO Chosen Cash Raffle tickets; Zeffy supplies greeting/order/ticket button |
| Delivered native test example | [Sanitized HTML](raffle-review-delivered-email-2026-10-19.html) | October 19 13:55 MDT; links disabled, fictional $71 receipt; not paid issuance |
| Square artwork | [PNG](raffle-review-2026-10-19/raffle-square-draft-v1.png) / [editable SVG](../source-assets/raffle-review-2026-10-19/raffle-square-draft-v1.svg) | 1080 by 1080, draft/sales-closed banner |
| Story artwork | [PNG](raffle-review-2026-10-19/raffle-story-draft-v1.png) / [editable SVG](../source-assets/raffle-review-2026-10-19/raffle-story-draft-v1.svg) | 1080 by 1920, draft/sales-closed banner |
| Graphics, QR and provenance | [Artwork package](raffle-review-2026-10-19/README.md) | QR decodes to canonical information page; logos trace to approved website assets |
| Standalone canonical QR | [PNG](raffle-review-2026-10-19/raffle-info-qr-v1.png) / [SVG](raffle-review-2026-10-19/raffle-info-qr-v1.svg) | Decoded at 740, 370 and 148 pixels |
| Short promotional copy | [Copy for review](raffle-review-2026-10-19/promotional-copy.md) | Final terms/eligibility/release still need approval |
| Printable sample stubs | [29-stub HTML batch](raffle-rehearsal-2026-10-19/953a25f7bede9e54852ee787.html) | Sample-only, source/order/person and batch references, not physically printed |
| Sample manifest | [Manifest JSON](raffle-rehearsal-2026-10-19/953a25f7bede9e54852ee787.json) | 29 numbers, source and file hashes, physical status NOT CONFIRMED |
| Sample reconciliation | [Summary](raffle-rehearsal-2026-10-19/sample-summary.json) / [register report](raffle-rehearsal-2026-10-19/sample-register-report.json) | Simulated $490 gross, $50 refunded, $440 included; no purchaser data |
| Six-person draw rehearsal | [Explicit simulation](raffle-rehearsal-2026-10-19/sample-draw-simulation.json) | C wins first; all C entries excluded; six distinct fictional people |
| Prize illustration | [Calculation](raffle-rehearsal-2026-10-19/sample-prize-report.json) | $440 illustrative basis: $88, $26.40, $22, $17.60, $13.20, $8.80; $176 prizes, $264 retained before expenses |
| Native export evidence | [Headers and SHA256](raffle-native-export-evidence-2026-10-19.json) | Fresh October 19 reports, zero rows, missing stable payment-ID column |
| Production hold evidence | [Desktop](raffle-zeffy-sales-closed-2026-10-19.png), [iPhone](raffle-zeffy-hold-iphone-2026-10-19.png), [Android](raffle-zeffy-hold-android-2026-10-19.png) | Native public checkout disabled |

Current local website preview is produced by `npm run build`; nontransactional raffle review bundle by `node scripts/build-raffle-review.mjs` under ignored `artifacts/raffle-preview`. The builder now strips the mock dialog and disables ticket purchase controls during the hold. Review-only deployment 3bf3cdda-b8df-4747-81ff-6d227a95dd1b succeeded and all three raffle/review routes were verified HTTP 200 with noindex headers. Landing page has three disabled package controls, zero checkout links and zero simulated dialogs. No new graphics were published.

Great Lakes Auto Group is recognized only as NEO Chosen Weekend Presenting Sponsor. Kirtland Heritage Group remains raffle operator. Following social accounts grants no entries. Raffle entry is separate from all weekend event admissions. Prize rounding, refund handling and broader eligibility remain for professional/human approval.

[Readiness](raffle-readiness-2026-10-19.md) · [QA matrix](raffle-qa-2026-10-19.md) · [Operations](raffle-drawing-operations.md) · [Zeffy checklist](raffle-zeffy-checklist.md) · [PR #107](https://github.com/Teancum1820/NEOChosen/pull/107)
