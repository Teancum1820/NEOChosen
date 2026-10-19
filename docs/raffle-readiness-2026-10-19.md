# Raffle readiness — October 19, 2026

**Release decision: HOLD. Ready for review is not authorization to sell.**

## Executive summary

Public website purchase paths and the existing Zeffy campaign were open when inspected. The website was restored to its immediately preceding closed-sales deployment. The native Zeffy **Close sales** control was then used without deleting the campaign or records. Direct checkout displays Sales closed, three disabled Closed buttons and disabled Continue. No payment, refund or actual drawing was performed.

## Sales status and evidence

- Website checked 13:39 MDT (19:39:15 UTC): HTTP 200, closed-sales message, three disabled package buttons and zero direct raffle checkout links.
- Cloudflare restored 100% traffic to `58eed9af-3e78-498f-84be-a4f68599c7de` from `764697e2-8479-4194-8cdc-9a1d06b02356`. Those adjacent releases differ in raffle sales activation. No bank, payout, binding resource or unrelated PR was changed.
- Zeffy inspected and closed approximately 13:50 MDT, using the signed-in Codex browser and campaign `e2d45f03-d16e-4e0c-816b-464489fc4782`. [Public hold evidence](raffle-zeffy-sales-closed-2026-10-19.png).
- Campaign overview: $0 raffle total, zero tickets. Payments: no payments, no status/date filter selected. Ticket list: no guests. Per-rate totals: zero sold, canceled, refunded and net raised. No pending, failed or reversed records were visible. Chargebacks/settlement have not been independently reconciled to finance reports. An organization-wide payout is not raffle revenue.
- No pre-clearance raffle purchases were found in these native campaign views. This is a point-in-time observation, not an audit of banking history.

## Implemented / tested / verified

| Component | Evidence level | Current finding |
| --- | --- | --- |
| Sales hold | Verified in production | Website and direct native checkout closed |
| Prices and bundles | Verified native configuration | $20/1, $50/3, $100/7 saved; zero sales |
| Native paid issuance | BLOCKED | No authorized paid test; no issued numbers to map |
| Buyer questions | Verified native configuration | First/last name, email, full address, phone, required age/residency/self-purchase/rules checkboxes |
| Confirmation | Native preview inspected | Correct subject, personalization supplied by Zeffy, ticket access instructions, schedule, rules/support/events/social disclosures |
| Delivered email | Native test delivery verified | October 19 test arrived 19:55:09 UTC; sanitized delivered example saved; no paid ticket proven |
| Register | Implemented; simulated testing | Existing SQLite tool extended; actual populated native report mapping remains unverified |
| Physical printing | NOT TESTED | File generation is not actual print/cut/count or custody verification |
| Prize calculations | Illustrative simulated testing | Order-level accounting; cent/refund policies need approval |
| Legal/rules | Awaiting human approval | Draft terms preserved; no legal clearance inferred |

## Completed October 19 work

- Existing register hardened with reviewed snapshot metadata, stale-import protection, permanent ownership reservations, strict JSON, leading-zero ticket preservation, hashed manifests, sample/live separation, custody/damage/quarantine/void audit and explicit physical checks.
- Explicit mapped CSV adapter and isolated sample-generation CLI added. These do not establish a populated native Zeffy mapping.
- 81 Python tests passed; 32 functional, 32 accessibility and 4 visual checks passed. Format/lint/types/site tests/build/Storybook passed; 91 responsive captures had zero overflow; local Lighthouse assertions passed on 3 URLs.
- Shared top-level Raffle Info link and stronger closed-sales gates prepared on the review branch; only the emergency closed-site restoration was deployed.
- Native confirmation test delivered October 19 at 13:55:09 MDT. Sanitized copy and mobile rendering reviewed.
- Square/story editable graphics, standalone canonical QR, 29 fictional printable stubs/manifests, six-person simulation, sample prize report and operations documents prepared for review.

## Code and release control

Existing PR: https://github.com/Teancum1820/NEOChosen/pull/107 . Main baseline: `273ff5c77beba41c1180063de6fb9a129eac169e`; working baseline: `a74da803ef2576a85b426d891c695b6a4e7e73d8`. PR remains unmerged. The October 19 hold supersedes the October 16 activation instruction. Source gates are closed and now require final rules as well as explicit sales authorization before future activation. Frontend QA historical failure was Formatting; current checks are recorded in [QA report](raffle-qa-2026-10-19.md). PR #106 analytics stays separate.

## Launch blockers

### Technical

1. Human-controlled paid tests for all packages and ticket delivery/access/resend, under separately approved temporary sales access. No free/manual order workaround.
2. Populated native Payments and Itemized export mapping with stable payment identifiers, exact ticket-number text, cancellation/refund semantics and verified bundle rows. Empty exports cannot establish this.
3. Physical print/cut/count rehearsal against native documents, independent witnessed custody and damage/replacement procedure.
4. Review final automated results and exact commit in PR #107 before a release decision. Local checks do not establish native paid fulfillment.

### Legal and financial

- Counsel must approve online raffle operation, geographic eligibility (including proposed U.S.-resident language), exclusions, venue, customer e-tickets and KHG-held stubs, final rules, refund/reversal treatment, unclaimed prizes and replacement drawings.
- Accountant/rules owner must approve revenue eligibility, cent rounding, 40% allocation reconciliation, reserves, withholding, reporting and secure tax-document process. Zeffy does not automatically authorize or disburse prizes.

### Operational

- Name eligibility reviewer, reconciliation lead, printer, independent checker, drawing lead/witnesses, support inbox monitor, accountant, calculation checker, payment authorizer and disburser with backups.
- Confirm approved minimum stub information and secure identity crosswalk. Shared names or emails do not automatically establish one person.
- Confirm optional separate marketing consent, unchecked by default, in final supported checkout. Required acknowledgments cannot verify age, residency or physical location.

## Decisions needed from Joe

Approve final rules through counsel; choose financial/refund/rounding policies through the accountant; assign accountable staff; approve the controlled human paid-test plan and maximum $170 ticket-only cost (optional Zeffy contributions declined); approve print/custody/replacement procedures. Continue the hold until evidence is reviewed. Any later reopening needs explicit new authorization.

## Customer-facing review package

[Review index](raffle-customer-review-2026-10-19.md), [Zeffy checklist](raffle-zeffy-checklist.md), [drawing operations](raffle-drawing-operations.md), [QA](raffle-qa-2026-10-19.md), [email draft](raffle-joe-status-email-2026-10-19.txt). New artwork remains unpublished. Existing draft rules are not silently finalized.

## Code delivery

Code commit: `1b569ae` (hold, register/importer, tests and navigation). All technical changes are on the existing PR #107 branch; no merge or reopening is authorized. Joe's unsent Gmail draft was created before 14:00 MDT and then updated with final local results. The report/email have not been sent to Joe by the agent.
