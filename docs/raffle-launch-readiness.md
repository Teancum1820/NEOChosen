# NEO Chosen Cash Raffle launch readiness

**Latest status:** [Publication and verification report](raffle-live-status.md). The existing Zeffy raffle and NEOChosen purchase links are now open at Caleb's explicit instruction. Missing final rules decisions, the populated provider purchase/export test and physical rehearsal remain unverified. The historical audit below predates these changes.

Reviewed October 16, 2026. **NOT READY TO OPEN SALES.** The initial audit below is a historical snapshot. Later same-day updates are documented in [October 16 follow-up](raffle-oct16-followup.md): Joe requested U.S.-resident eligibility; the confirmation message was revised and a Zeffy test email reached Caleb's inbox. During editing the initial draft was inadvertently finalized, then sales were closed immediately on discovery. Zeffy now has a public page with sales closed, not an unpublished draft. No tickets or money were shown in the campaign dashboard. The production NEOChosen site remains Coming Soon. Final approvals, paid-ticket tests, and the real-ticket drawing-stub workflow remain unfinished.

## Evidence and requirement precedence

Reviewed received and sent Gmail in `calebday1820@gmail.com`, including searches for raffle, Zeffy, raffle tickets/drawing/rules/launch, drawing stubs, ticket bundles, Emilie, giveaway, and percentage prize. Broad results contained unrelated promotional and event emails. The focused raffle-subject/Emilie search returned 21 messages with no next page. Read the complete October 12 task-list thread, latest urgency thread, September 30 setup brief and forwarded Emilie response, September 3 retirement thread, May raffle thread, and relevant event/Zeffy follow-up correspondence. No final legal approval was located in this evidence.

| Source | Controlling significance |
| --- | --- |
| [October 12 task list, section 6](https://mail.google.com/mail/u/0/#all/1a12d731fa403d05) | Reaffirms $50/3 and $100/7, full testing, physical stubs and payout procedure; explicitly keep unpublished/closed |
| [Latest raffle urgency email](https://mail.google.com/mail/u/0/#all/1a142689da2f9229) | Sent October 15 Mountain / October 16 UTC; subject expresses urgency, body is only an iPhone signature; no launch authorization or changed terms |
| [September 30 cash-raffle brief](https://mail.google.com/mail/u/0/#all/1a0f3c5f9c352f4b) | Explicit three packages, six percentages, gross basis, proposed legal terms, date/time changes and confirmation copy; preparation authorization only |
| [September 30 forwarded Emilie response](https://mail.google.com/mail/u/0/#all/1a0f4197d99cbbe6) | Bundle-count setting, customizable automated email, limited eligibility enforcement, dates and reports supported; percentage arrangement not directly processed |
| [September 3 retirement/Coming Soon thread](https://mail.google.com/mail/u/0/#all/1a068402d3d92078) | Old raffle replaced; preserve prior records; physical drawing and legal review required |
| [May raffle thread](https://mail.google.com/mail/u/0/#all/19e3cd3af30932a8) | Historical fixed-prize/3,000-ticket/US-resident plan, superseded for the new cash proposal; do not retroactively alter any old purchasers' terms |

The September donated-basket plan and May guaranteed-dollar plan are superseded for current preparation. The $20 option was **not revoked** by October 12's emphasis on the two bundles: September 30 explicitly calls all three packages approved. The earlier November 1 close, November 13 drawing, and later-evening drawing times must not be copied into this campaign. Joe's later October 16 instruction replaces the earlier Ohio-residency/physical-in-Ohio proposal with U.S.-resident wording for review; it does not establish nationwide legal clearance. The missed October 1 opening is not permission to open now.

## Existing website and source

- Canonical page: [https://neochosen.com/raffle/](https://neochosen.com/raffle/). Native HTML holding page, with shared site navigation/footer. It currently has **no Zeffy iframe, raffle checkout link, or purchase form**.
- `/raffle.html` and retired raffle aliases route to the holding page. `/raffle/rules/` redirects there; it is not approved rules. `/giveaway-rules/` covers a separate free social giveaway and must not serve as cash-raffle rules.
- `raffle/index.html`, `raffle.html`, `raffle/cash-raffle.css`, `scripts/site-chrome.mjs`, `scripts/sponsor-system.mjs`, `_redirects`, `_headers`, `sw.js`, source archives, legacy handlers/migration, and build/test/deployment files were inspected. Legacy prize-donation and analytics handlers are not a cash-raffle payment/entry system.
- Proposed full page and rules already exist in `source-assets/raffle-archive/cash-raffle-proposal.html` and `cash-raffle-draft-rules.html`, excluded from `dist`. They contain unresolved organizer/contact/rules-version fields. Do not publish them as final rules.
- Production uses the `neochosen` Cloudflare Worker and static `dist` assets through `production/wrangler.jsonc`. This task did not deploy, merge, change bindings, or alter analytics/consent. PR #106 remains separate and unmerged.
- Source base: `origin/main` at `273ff5c77beba41c1180063de6fb9a129eac169e`. Work branch: `feature/raffle-launch-preparation`. No applicable AGENTS.md was found in the repository. Existing other worktrees were preserved.

## Initial Zeffy configuration, observed before the follow-up changes

Existing KHG organization, campaign **NEO Chosen Cash Raffle**, ID `e2d45f03-d16e-4e0c-816b-464489fc4782`.

[Private campaign editor](https://www.zeffy.com/en-US/o/tickets/forms/edit?ticketingId=e2d45f03-d16e-4e0c-816b-464489fc4782&onExitUrl=%2Fen-US%2Fo%2Ffundraising%2Fcampaigns). The campaign list labels it **Raffle Draft**, shows **$0 / 0 sales**, and disables View with a notice that the public page becomes available after finalization. There is no verified public checkout URL to publish yet. **Do not finalize it just to obtain a URL.**

| Setting | Observed state / limitation |
| --- | --- |
| Packages | Single Ticket $20 / 1; Three-Ticket Package $50 / 3; Seven-Ticket Package - Best Value $100 / 7; each shows 0 bundles sold |
| Capacity | Global capacity blank; no fixed cap shown |
| Buyer information | Required first/last name, email, full address, phone; collected once per purchaser |
| Eligibility | Required buyer-only checkboxes: 18+, Ohio resident, physically in Ohio at purchase, purchasing for self/eligible, agreement to rules/non-deductibility; no per-ticket questions |
| E-tickets | Issue e-tickets checked; preview describes unique number at top right and shows a matching detachable section |
| Automated email | Enabled; subject is Your NEO Chosen Cash Raffle tickets; custom raffle wording, ticket access, package counts, close/draw times, six percentages, reprint policy and correct KHG social URLs already prepared; rules link explicitly pending |
| Dates | Drawing start Nov 15 6:00 PM, UI end 6:01 PM; sales close Nov 15 5:00 PM; America/New_York timezone |
| Opening | Blank; UI says empty opens on campaign creation. Draft status is the current safeguard. No automatic opening was set. A new approved opening and final activation procedure are needed |
| Additional donations / discounts | Extra-donation toggle unchecked; no discount codes listed. Preview sometimes renders optional elements, so delivered/direct-checkout behavior needs controlled verification |
| Payment methods | Draft preview offers card and ACH. Presence does not verify processing, settlement, payout access or eligibility enforcement |
| Reporting | Raffle-only Payments filter shows $0, 0 tickets and No data. Export dialog has Payments and Itemized payments tabs |
| Past/old raffle | Past campaigns tab empty; old raffle name not in current list. Absence does not prove an old checkout is inaccessible or that its records were preserved. Owner must reconcile its disposition/history |

No account configuration was changed. This task inspected existing settings and avoided duplicating already-completed work.

## Requirements audit

| Component | Current condition | Required condition | Work needed | Status |
| --- | --- | --- | --- | --- |
| Holding route and HTTPS | Live page renders with correct branding and no sale controls | Remain usable and closed before approval | Verified desktop/mobile | COMPLETE |
| Full raffle offer | Approved preparation copy archived | Final reviewed information published at launch | Approve content and targeted release | NEEDS APPROVAL |
| Packages | Correct native draft prices/counts | Native emailed ticket counts match purchases | Controlled package tests | NEEDS TESTING |
| Prize table | Six percentages in draft description; no prize cards | Clear approved percentages/basis at launch | Legal/accounting and content release | NEEDS APPROVAL |
| Checkout URL | Public View disabled in draft | Correct existing campaign URL, same restrictions for direct access | Obtain only through authorized finalization | BLOCKED |
| Rules | Archived draft only; public route redirects | Versioned approved rules linked on page, form and email | Organizer/legal sign-off and release | BLOCKED |
| Eligibility questions | Five required buyer-only acknowledgments present | Exact final criteria and reliable human review | Approve proposed restrictions and review ownership | NEEDS APPROVAL |
| Confirmation | Existing draft has native View tickets and social links; pending rules text | Delivered correct tickets/receipt, no placeholders | Final link/contact approval and delivery test | NEEDS TESTING |
| Entry numbering | Native numbered e-ticket preview; offline validator tested | Paid order -> every unique native number -> stub | Verify populated native exports and actual tickets | NEEDS TESTING |
| Payment and refund reporting | Export fields inspected; zero raffle records | Reconcile settlement, ticket statuses, refunds and dollars | Approved controlled transaction and export | NEEDS TESTING |
| Physical stubs | Native detachable section preview and fictional PDFs | One approved physical stub per valid native entry | Legal format approval, actual print rehearsal, print log | NEEDS APPROVAL |
| Drawing procedure | Operations guide prepared | Named crew/witnesses, approved venue and rules | Joe assigns/approves and rehearses | NEEDS APPROVAL |
| Prize payout | Formula example prepared; KHG pays separately | Accountant-reviewed calculation, reserve, reviewer and payer | Name owners, authorize method and tax procedure | NEEDS APPROVAL |
| Sales schedule | Closing/timezone configured; opening blank | Fresh approved opening; verified server cutoff | Resolve stale opening and test direct checkout | NEEDS APPROVAL |
| Sponsor acknowledgments | Shared site chrome preserved; minimal raffle has no sponsor block | Approved full page identifies KHG and weekend presenting sponsor accurately | Use existing sponsor system in future release | NEEDS APPROVAL |
| Mobile layout | Live 1440, 390 and 320px views reviewed; local 768 also tested | Page and eventual checkout usable | Checkout test after authorization | NEEDS TESTING |
| Analytics protection | No analytics, consent or PR #106 changes | Preserve privacy defaults | Diff reviewed | COMPLETE |

## Legal and accounting review

Current official sources were retrieved October 16, 2026. This is a list of review requirements, not a compliance certification.

- [ORC 2915.092, effective October 9, 2026](https://codes.ohio.gov/ohio-revised-code/section-2915.092): identifies eligible nonprofit operators and permits qualifying not-for-profit raffle drawings without a bingo license. Verify KHG's exact legal identity and qualifying status. This section alone does not establish that this Zeffy online-sale arrangement is lawful.
- [ORC 2915.01(CC)](https://codes.ohio.gov/ohio-revised-code/section-2915.01) defines selection using physical stubs/detachable sections in a receptacle. [Ohio AG charitable gaming guidance](https://charitable.ohioago.gov/Charitable-Gaming) warns about online tools and online random-number selection, and recommends review of the specific activity with counsel/local enforcement. The current six-prize physical method and online purchase/customer-ticket/physical-stub relationship require express review. Do not use Zeffy's online drawing features.
- [ORC 2915.10](https://codes.ohio.gov/ohio-revised-code/section-2915.10) requires detailed financial/prize records and at least three years' retention. Counsel/accountant must resolve records location/notice, gaming-account rules, expenses, inventories, and required winner identification records. Sensitive winner tax/identity information belongs in restricted records, never this repository or the ordinary checkout.
- [IRS W-2G/5754 instructions, January 2026](https://www.irs.gov/instructions/iw2g) cover charity raffle reporting, withholding and bundled-ticket wager allocation. Accountant must use current thresholds, state/local requirements, secure identity/TIN collection, W-2G/945 obligations where applicable, and the correct per-ticket wager. Do not rely on an old flyer or a Zeffy donation tax receipt.

Final age/residency/location/exclusions, six-person minimum, claim timelines, refund/reversal rules, rounding, cancellation/postponement, unclaimed prizes, privacy, venue permission, and verified organizer contacts remain unresolved approvals. A checkbox cannot establish age, residency or physical location. Proposed eligibility is 18+, Ohio resident, in Ohio at purchase, buying for oneself; it has not been represented as a statutory requirement.

Emilie's statement that Zeffy cannot directly process the percentage arrangement is ambiguous about platform/payment acceptance versus winner disbursement. Native bundles and bank settlement do not resolve that ambiguity. Joe must obtain/identify written clearance for the exact six-prize gross-revenue arrangement and payment method before launch. Do not open a new Stripe checkout to work around it.

## Completed technical preparation

- Added `scripts/raffle_ops.py`, a dependency-free reconciliation reference with a fictional-only sample CLI. It preserves supplied native numbers, collapses identical repeated orders, quarantines conflicting versions/collisions, checks package totals/counts, holds unsettled payments/refunds/unreviewed eligibility, and rehearses exclusion of a winner's other orders.
- Added 20 passing tests in `tests/test_raffle_ops.py`, `npm run test:raffle-ops`, and a dedicated Python CI workflow. Verified tests also pass with third-party Python packages disabled. No live database or payment infrastructure was introduced.
- Added sample transaction report, entry ledger, print manifest, four printable PDFs, confirmation preview and a percentage calculation. All people, payments and numbers in samples are fictional. PDF creation does not mean stubs were physically printed.
- Added operations guide, launch checklist, normalized-data contract and handoff instructions. Python caches/private working exports are ignored by Git. No actual purchaser data is in these deliverables.

The current samples demonstrate 3 + 7 + 13 = **23** unique entries from **$350** across three mock orders. One participant has two orders; excluding all that person's tickets leaves seven. A separate $10,200 less $200 refunded = $10,000 illustration yields $2,000 / $600 / $500 / $400 / $300 / $200, total $4,000. Refund and cent-rounding policies still need approval.

Production should use native Zeffy reports and detachable ticket sections if counsel approves them. The utility is a rehearsal/reference, **not** a verified export adapter or authorization to generate official entries. It cannot manufacture ticket numbers from a dollar amount. See the operations guide for native-first production steps and the required mapping checks.

## Confirmation and reporting findings

The existing native email preview includes order details, a View tickets link and receipt. It uses package explanations instead of an unverified aggregate entry-count merge field. Example ticket URLs in the editor are Zeffy's preview placeholders, not deliverable customer tickets. Do not claim a PDF is attached unless an actual delivered message proves that behavior. No email test was sent.

Existing KHG links match `social-media-links/index.html` and the live footer:

- [Facebook](https://www.facebook.com/people/Kirtland-Heritage-Group/61572253884775/)
- [Instagram](https://www.instagram.com/kirtland.heritage.group)

The saved draft's support mailbox is the existing public KHG address; Joe must confirm it is monitored for raffle operations. Final rules URL must replace the pending-rules text. Currently `/raffle/rules/` is a holding-page redirect. At a 390px browser width, the Facebook destination identifies Kirtland Heritage Group but presents a login overlay; Instagram loads the matching KHG profile and NEOChosen bio. The local fictional confirmation has no horizontal overflow at 390px. Actual delivered-email links remain untested.

Export dialog verified Payments fields including date, amount, status, method, refund amount, details and buyer questions. Itemized payments also offers Rate Title, Status, Item Amount, Ticket #, E-ticket URL, Canceled Tickets, ticket scans and custom questions. A stable payment identifier/join key and actual bundle-row semantics still need verification from a populated export. Never sum repeated order totals across ticket rows. See [Zeffy's export guidance](https://support.zeffy.com/reports-and-exporting-data-k15ip) and [native ticket printing](https://support.zeffy.com/print-out-tickets-or-printing-out-reports-off-the-platform-1wssk).

The [online/paper article Emilie linked](https://support.zeffy.com/how-to-manage-a-raffle-with-online-and-paper-in-person-ticket-sales-0iqtz) explains numbering across sales channels; it does not by itself prove a complete duplicate-free bulk-printing workflow. This plan adds a batch manifest and two-person physical reconciliation without introducing separate cash sales.

## Test matrix

| Test | Result | Evidence / practical limit |
| --- | --- | --- |
| Live raffle HTTPS and desktop | PASS | Real browser, 1440px, correct holding content, no broken images/overflow |
| Live mobile page/navigation | PASS | 390px and 320px screenshots reviewed; menu opens |
| Local holding/rules behavior | PASS | Existing responsive functional test at 1440/768/390/320; rules redirects |
| Correct approved rules displayed | BLOCKED | No final rules; intended redirect confirmed |
| Click correct public checkout | BLOCKED | No raffle CTA; campaign is draft with public View disabled |
| Draft $20/1, $50/3, $100/7 settings | PASS | Actual Zeffy ticket rates inspected |
| $50 -> 3, $100 -> 7, mixed bundles -> 13 | PASS | Offline simulation; not provider processing |
| Duplicate, conflicting order, ticket collisions | PASS | Offline tests; ambiguous orders held |
| Failed/pending/canceled/unknown payments | PASS | Offline tests; zero included entries |
| Full/partial refund and reversal holds | PASS | Offline tests; rules disposition still pending |
| Invalid amount/package, missing purchaser data | PASS | Offline tests fail closed |
| Repeat import / refund refresh | PASS | Counts stable; native numbers retained; refunded entries held |
| Exclude prior winner across orders | PASS | Offline rehearsal removes 16, leaves seven |
| Physical sample PDF counts and layout | PASS | Extracted numbers and visually reviewed pages match 3/7/13/23; no physical print test |
| Confirmation prepared | PASS | Existing native preview and local fictional sample inspected |
| Actual confirmation/ticket delivery, resends, no duplicates | BLOCKED | No authorized transaction/message send |
| Entry export populated and reconciled | BLOCKED | Export controls inspected; campaign has no data |
| Production payment/refund/settlement | NOT TESTED | No real purchases, fake sales or refunds created |
| Mobile direct Zeffy checkout | NOT TESTED | Draft only; no public checkout finalized |
| Prize formula | PASS | Fictional exact-dollar example; final rounding/refund/tax rules pending |
| Cutoff before/at/after close, DST offsets, authorization | PASS | Pure isolated date logic; not a production cutoff test |
| Production automatic close blocks direct sales | NOT TESTED | Correct setting observed, provider boundary not exercised |
| Drawing/payout guide | PASS | Procedure documented; crew, venue and approvals unresolved |
| Existing build, lint, format, type checks | PASS | Executed locally |
| Existing site checks | PASS | `npm test`, including 1,574 local links and default-closed legacy raffle handlers |
| Functional and accessibility browser suites | PASS | 41 tests passed locally |

Zeffy's [testing guidance](https://support.zeffy.com/test-the-platform-run-payment-tests-and-test-confirmation-emails-wuu20) describes real small payments, free options and manual records, not a demonstrated isolated payment sandbox. This task did none of those. Obtain Joe's explicit controlled-test authorization and a plan to segregate tests from the official pool. Do not add $0/$1 rates or send purchaser messages without that authorization. Correct bundle configuration and mocked payment tests do not prove production payments.

Zeffy's current [organization terms, section 3.4](https://support.zeffy.com/terms-and-conditions-of-use-npo-3pvmw) also place legal responsibility on the organizer and allow review/suspension of raffle campaigns. The existence of the draft and its native features is not platform or legal clearance for this particular arrangement.

## Launch blockers and final approvals

1. Joe/legal: versioned rules, verified operator authority, online-sale and physical-ticket legality, final eligibility/exclusions, venue permission, refund/claim/cancellation rules and privacy.
2. Joe/platform: exact cash-prize arrangement and processor acceptance clarified in writing; old raffle checkout/history disposition verified.
3. Joe/accountant: eligible revenue/refund basis, cent rounding, required accounts/reserves, tax records/withholding, independent reviewer, payment authorizer and method.
4. Joe: replace elapsed October 1 opening with a fresh explicit opening/timezone. Keep existing draft; do not schedule automatic opening before approval. Confirm Nov 15 5 PM close / 6 PM drawing and the actual end/duration field.
5. Technical/operator: approve and exercise controlled transactions for all packages and mixed purchases, delivered email/e-tickets, populated exports, resends, refunds, direct checkout eligibility/cutoff and physical printing. Map real statuses and join keys before treating any ledger as official.
6. Joe: approve final page, rules URL, monitored contact, sponsor treatment and confirmation copy. A later focused website release is necessary after those inputs are final.
7. Joe: assign and rehearse named reconciliation/printing/witness/payout duties and give explicit final publication/sales authorization.

The separate checklist leaves those gates unchecked. A draft PR for the actual operations code/docs is appropriate; it is not a replacement website or a claim that the public raffle is complete. No production activation is authorized by this report.
