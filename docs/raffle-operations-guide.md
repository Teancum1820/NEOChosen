# NEO Chosen Cash Raffle operations guide

Prepared October 16, 2026 for Joe and Jessica. **Rehearsal and preparation only until launch gates are signed off.** Use the existing Zeffy raffle, not a new campaign. The [readiness report](raffle-launch-readiness.md) distinguishes observed configuration from unverified delivery/payment behavior. The [launch checklist](raffle-launch-checklist.md) records approvals.

## 1. Assign responsibilities before accepting purchases

Joe approves the rules, new opening time, venue, financial procedure, public content and launch. He must name the daily purchase/eligibility reviewer, reconciliation lead, printer, independent print checker, drawing lead, witnesses, accountant, calculation reviewer, payment authorizer and payer. Jessica is a proposed operations contact, not an assumed assignment. Record each accepted duty and backup in the restricted event folder.

Have counsel approve the physical ticket/stub format and the relationship between the emailed ticket and its drawing stub. Use the native detachable Zeffy ticket section if approved and practical. Our minimal sample format is a proposed alternative only. No software random-number drawing is authorized.

## 2. Review purchases in Zeffy

1. Sign into the existing KHG organization. Open **NEO Chosen Cash Raffle** from Campaigns. Its ID is `e2d45f03-d16e-4e0c-816b-464489fc4782`. It was a draft with zero sales on October 16.
2. In Payments, select that exact campaign. Wait until the heading shows its name; avoid using records from free events, dinner, donations or notification lists.
3. Review payment status, package, native ticket numbers, canceled/refunded items and buyer answers. A cart, abandoned payment, receipt page, scan, or free event registration is not proof of paid raffle entry. Pending/processing/ACH is not settled until the agreed settlement evidence is present.
4. Required buyer information is name, email, full address and phone, collected once per order. Five acknowledgments currently cover proposed age, residency, location, self-purchase and rules. These do not prove eligibility. Use the **final approved** criteria and a named reviewer.
5. Assign a stable private purchaser reference. Link that same person across orders, emails and name variations only after human review. Shared names/emails are not sufficient proof of identical identity. Keep the identifying crosswalk restricted. Do not collect ordinary-checkout SSNs or ID uploads.
6. Mark eligibility `pending`, `approved` or `ineligible`, with reviewer, time, rules version and reason/evidence reference in a restricted review log. Missing/conflicting responses remain on hold. Escalate rather than guessing or changing purchaser terms.

For failed, canceled, disputed, partial/full-refund, reversed, missing-data or ineligible purchases, hold affected entries out of any provisional print/drawing set until reviewed under the approved rules. This is an internal safety hold, **not a newly adopted refund or disqualification policy**. Record the resolution and purchaser notices. Only an authorized human performs actual refunds through Zeffy's supported workflow. Never delete histories or edit original exports.

## 3. Export and reconcile purchases and tickets

Keep original exports in a secured KHG folder outside this public repository, with campaign ID, export time/timezone, date range and export type. Preserve read-only originals and checksums. All-time campaign coverage is needed at final close, not just the most recent day. Keep prior snapshots so status changes and refunds remain auditable.

In Payments, filter the raffle, then Export:

- **Payments**: one payment-level record for dollar reconciliation. Include payment date/status/method, total amount, refund amount, details, buyer questions and enough buyer identity for authorized review. Exclude unrelated sensitive columns where unnecessary.
- **Itemized payments**: include Rate Title, Status, Item Amount, Ticket #, E-ticket URL, Canceled Tickets and Custom questions. These controls were observed; populated bundle row semantics and a stable join identifier still need controlled-test verification.
- **Finances > Transactions/Payouts**: reconcile processed receipts/refunds to settlement and KHG's accounts. A bank payout is not the six-prize payout and may include other campaigns. Do not use the entire payout as raffle revenue.

The operator must verify the actual export schema before any real ledger is produced. Confirm:

1. A stable native payment/order identifier joins payment rows, ticket rows and the buyer review. Do not join by amount/name alone or invent IDs from row numbers. If the export omits the key, use supported payment details/native ticket documents to establish an auditable crosswalk or ask the account owner to resolve the missing field.
2. Native numbers are unique within the **same campaign** and unchanged by resend/reprint. Zeffy says numbers are numeric; preserve the exact source value as text. Do not renumber to fill gaps.
3. `quantity` means bundles purchased, with tickets per bundle separate: $20/1, $50/3, $100/7. For example, two $50 bundles plus one $100 bundle means $200 and 13 entries.
4. A `Succeeded` provider label is mapped only after verifying its settlement meaning for each method. The reference validator's `settled` is an internal normalized status, not a claim about Zeffy's raw column values.
5. Cancellation/refund statuses, pending ACH, failed payments and any test/free/manual entries are visible. Partial refunds are unresolved until approved rules specify which tickets/revenue change.
6. Ticket-only gross revenue excludes Zeffy optional contributions, separate donations, sponsorships, taxes if any, and event admissions as approved. Do not multiply repeated order totals by the number of tickets. The approved formula is before processing fees/raffle expenses.

Create a restricted working register with one row per native entry: campaign ID, payment ID, purchaser reference, package, native Ticket #, payment/eligibility/refund statuses, drawing inclusion and reason. Keep totals in a separate payment-level table. Add rule version/reviewer and evidence references to the private audit records. No full card numbers, bank data, SSNs or unnecessary contact details belong in the entry register.

Reconcile three independent counts: package-derived count, unique native ticket count, and approved included-entry count. Reconcile payment dollars to processed receipts/refunds and the accountant-approved revenue basis. Investigate every difference, gap and collision; a numbering gap is a question, not permission to create a replacement number.

Re-importing the identical snapshot must not append more entries. Use campaign + native ticket number as the entry identity and campaign + payment ID as the order identity. Conflicting versions require a fresh authoritative snapshot and review, not last-row-wins. Retain both raw snapshots. Refresh the working view for refunds while preserving the old audit history.

## 4. Rehearse with fictional data

The `docs/raffle-samples` folder already contains all sample outputs. No setup is needed to open/print the PDFs. The two single-bundle examples have three and seven stubs; the multi-bundle example has 13. The combined file has 23, including the same numbers shown in those individual files.

**Choose either the combined PDF or the individual PDFs for a rehearsal. Do not put both copies of the same number into the receptacle.** All pages say SAMPLE ONLY and must never join the real drawing.

For a developer recreating the samples:

```powershell
npm run test:raffle-ops
python scripts/raffle_ops.py sample
```

Python 3.10+ is needed for the tests. PDF creation additionally needs ReportLab. Tests use only the standard library. The CLI only generates fixed fictional fixtures; it has no production-import or official-print command. JSON/CSV outputs are normalized examples, not actual Zeffy exports. A verified native workflow is preferred to adding custom production infrastructure.

The ledger assigns SAMPLE-PERSON-A to two mock orders totaling 16 entries, and SAMPLE-PERSON-B to seven. Rehearse excluding all 16 of A's tickets after A is selected. The test does not select a winner. Two distinct sample people do not satisfy the proposed six-person minimum.

## 5. Print, check and secure official drawing stubs

After legal format approval and successful controlled testing:

1. Download the approved native e-ticket documents from **Payments > payment details > Documents > e-tickets**, or use the reviewed native export/print workflow. Verify a one-to-one match with the included-entry register. If custom minimal stubs are required, verify their adapter against those native numbers before using it.
2. Maintain a restricted **print log**, one row per entry, with campaign/native number, batch ID, file checksum, prepared by, actual print time, printed by, checked by, physical status, disposition and sealed-container ID. PDF generation is `PREPARED`, never automatically `PRINTED`.
3. Print only the set difference between eligible entries and already checked physical stubs. Review the exception list first. Use the same approved paper, size and printing/cutting method for every entry. The sample rectangles are 3.5 x 1.75 inches on US Letter at 100% scale; they still need legal and physical-printer approval.
4. Two people count and compare every cut stub number to the batch manifest and native register. Mark physical completion only after both checks. Log misprints, destroy/void them under two-person control, then authorize a replacement of that same number. Never silently reprint an entire old batch.
5. A buyer ticket resend/reprint is a customer copy and does not request another official stub. Keep those requests distinct from the official print log.
6. If an already-printed ticket becomes held/refunded/canceled, locate and quarantine its physical stub, log both actions, and follow the final rules. A software status change alone does not remove paper from the receptacle.
7. Seal checked batches, record who has custody, and prevent unauthorized additions/removals. Store personal crosswalks separately. Access to stubs must be restricted.

The sample manifest contains hashes and `NOT PRINTED` fields for demonstration; it is not a persistent production print log or a guarantee against someone printing a PDF twice. A completed print log and physical two-person checks supply that control.

## 6. Close sales and freeze the drawing population

The current proposed/encoded cutoff is **November 15, 2026 at 5:00 PM Eastern Time**, `America/New_York`, equivalent to `2026-11-15T22:00:00Z`. Drawing is planned for 6:00 PM Eastern that day. The intended October 1 opening has passed. Obtain a fresh opening decision; do not backdate or automatically open the draft.

Print/check incrementally throughout sales. The one-hour closing interval is for final changes, not printing the whole raffle.

At the approved cutoff:

1. The named operator confirms campaign closure in Zeffy and on an unauthenticated direct checkout; also test an already-open cart. Record time/timezone. Leave the campaign closed after the drawing. Do not assume event start/end closes sales.
2. Preserve full final payment/itemized/transaction snapshots and a second check for status changes. Follow approved rules for a payment started before close but unsettled afterward; this decision is unresolved, so do not guess or include pending ACH.
3. Reconcile successful settled payments, native numbers, eligibility decisions, refunds/cancellations, test exclusions and gross revenue. Sign the exception resolutions. Do not delete held records.
4. Confirm at least six distinct eligible purchasers if that proposed minimum is adopted in final rules. If the minimum or any material reconciliation fails, stop and use the approved cancellation/postponement procedure. Do not improvise an extension to increase revenue.
5. Complete only new stubs, remove voided ones, compare all physical numbers against the frozen register and print log, and record counts with two signatures. Seal the final materials and calculation records.

The pure `sales_allowed` test verifies an inclusive opening/exclusive closing and explicit authorization, including the change from October daylight offset -04:00 to November standard offset -05:00. It does not control or certify Zeffy's server cutoff.

## 7. Conduct and document the physical drawing

Use the venue, lead, witnesses, ticket format and exact method in the approved rules. Venue permission remains unconfirmed for publication, so no drawing venue is named here.

1. Witnesses inspect the receptacle/materials, frozen ledger, counts and rules version. Record the start time and custody.
2. Draw the grand prize first, then 6%, 5%, 4%, 3% and 2% prizes, if this ordering is retained in final rules. No program or platform tool chooses a winner.
3. Record each selected native number, purchaser reference, prize rank, time and witnesses. Secure the selected stub. Verify eligibility/ownership through the approved secure process.
4. Before the next selection, use the verified purchaser crosswalk to identify **every remaining entry of that same person across all orders**, physically remove those stubs, reconcile the removed count/numbers, and have witnesses sign. An email/name search alone cannot enforce one prize per person reliably.
5. Continue under the approved rules. Keep counts of remaining eligible entries at each rank to support the recorded odds/process.
6. Treat selections as provisional until verification is complete. Use the approved replacement-draw procedure for invalid winners, including how previously removed tickets and prize order are handled. These details require final legal approval.
7. Log contact attempts, claim deadlines and outcomes. The September brief proposes two-business-day initial contact, three attempts on different days and a 30-calendar-day response period, but these are not final legal deadlines. Do not donate unclaimed money automatically or invent a new winner-selection method.

## 8. Calculate, approve and pay prizes

Use the final accountant-approved eligible gross ticket-sales basis, before processing fees/raffle expenses. Exclude separate donations, sponsorships, event admissions and optional Zeffy contributions. Resolve refunded/reversed/ineligible transactions and timing before freezing the basis. The KHG-retained share is before allowable expenses; it is not a claim of net profit.

Fictional example, assuming the final policy excludes $200 refunded from $10,200 ticket receipts:

| Calculation | Amount |
| --- | ---: |
| Ticket receipts before refund | $10,200.00 |
| Refunded ticket receipts (illustrative treatment) | ($200.00) |
| Eligible gross basis | $10,000.00 |
| Grand prize, 20% | $2,000.00 |
| Second, 6% | $600.00 |
| Third, 5% | $500.00 |
| Fourth, 4% | $400.00 |
| Fifth, 3% | $300.00 |
| Sixth, 2% | $200.00 |
| Total prizes, 40% | $4,000.00 |
| KHG retained before expenses, 60% | $6,000.00 |

The example's integer-dollar basis avoids a rounding conflict. The reference uses decimal half-up for illustration only. The accountant must approve rounding and residual-cent disposition in the rules before real calculations. Do not silently award or retain residual cents.

1. Reconciliation lead supplies payment-level receipts/refunds, excluded categories, eligible basis and supporting checksums. Accountant confirms the basis, required bank/account treatment and prize reserves.
2. A second named reviewer independently checks the six awards and their total against the signed basis. Joe names and accepts the independent reviewer; none is assumed here.
3. Verify winners' legal identity, eligibility and ownership securely. Accountant determines tax reporting/withholding and collects required information through restricted channels. Never put SSNs or tax forms into GitHub, the public page, ordinary email samples or the sample ledger.
4. Record gross award, applicable withholding, net payment, approvals and tax/report references. Joe or a named financial officer authorizes payment. A separately named authorized KHG payer initiates the approved check/EFT method and records its reference/date/receipt. Do not change bank accounts as part of this task.
5. Zeffy does not calculate or disburse this six-prize allocation. Its normal settlement to KHG is separate from KHG's winner payments. Clarify Emilie's platform limitation before accepting money.
6. Proposed payment initiation within 30 days after complete verification is subject to final approval. Preserve unclaimed/disqualified outcomes and follow final legal instructions.

Maintain the final rules/approvals, original exports, reconciliation, print/void/custody logs, witness/drawing records, contact attempts, winner verification/tax forms, expense receipts and payouts in restricted KHG records for at least three years, subject to counsel's longer holds. Counsel/accountant must confirm required Ohio records location/notices and secure recordkeeping details.

## 9. Confirmation-email fulfillment

Keep the existing draft's native order summary, View tickets access and receipt. Use only merge fields the actual editor supports. The prepared wording describes each package's entry count; it does not promise an unsupported computed aggregate variable or direct insertion of every ticket number into the body.

Before release, replace the pending rules statement with the approved rules URL and confirm the monitored support mailbox. Check social URLs match the established KHG pages and remain optional. If the body cannot list native numbers, the supported ticket document/access link is the authoritative fulfillment. Verify those actual delivered numbers against exports and physical stubs. If delivery fails, the designated reviewer resolves it through supported ticket access/resend; do not create another payment or entry.

After Joe authorizes a controlled test, test $20, $50, $100 and a mixed purchase, failed/pending handling, receipt/ticket access on a phone, correct ticket counts/numbers, social/rules links, duplicate messages, resends/reprints, exports and a permitted refund. Preserve screenshots privately with no purchaser exposure. A zero-dollar/manual test alone does not prove card/ACH processing. Remove/segregate test artifacts from the official pool under the approved test plan; preserve histories.

## 10. Ordered activation handoff

Only after every required item in the launch checklist is checked:

1. Joe records final legal, platform, accountant, venue, rules and content approvals, plus named operators and a fresh opening/timezone.
2. Complete and review the controlled transaction and print rehearsal; resolve all exceptions.
3. Prepare the existing raffle page's approved full content and versioned rules, correct social/support links, approved sponsor recognition and the **existing** campaign destination in a focused release. Verify desktop/mobile and no analytics/consent changes.
4. Separately obtain Joe's explicit authorization to deploy the exact website changes and to finalize/open the existing Zeffy draft at the approved time. A draft PR or old date is not that authorization.
5. The authorized operator verifies final native bundles, eligibility, email/rules links, automatic 5 PM cutoff and timezone, then performs only the authorized finalization/open action. Do not create duplicate campaigns or free test rates in the production raffle.
6. Capture the public URL Zeffy actually returns. Verify direct checkout and the site's CTA agree, HTTPS works, and restrictions apply to both. If anything differs, close sales and escalate under the incident procedure.
7. Start the daily reconciliation/eligibility/printing process, confirm named staff and backups, and schedule the final closure/reconciliation responsibilities. Only then use separately approved promotion.

The October 16 preparation task stops before steps 4-7. No real sale, refund, winner selection, prize payment or promotional email was executed.
