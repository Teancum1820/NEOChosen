# Zeffy configuration checklist — October 19, 2026

Existing KHG raffle only: `e2d45f03-d16e-4e0c-816b-464489fc4782`. Inspected in the authenticated **Codex browser**, not Opera. No purchase, manual ticket, refund or payout was created.

| Check | Outcome | Evidence / limitation |
| --- | --- | --- |
| Campaign published | PASS | Public information URL resolves |
| Public sales closed | PASS | Native Close sales applied; dashboard Sales closed; direct URL three disabled Closed controls and disabled Continue |
| Records preserved | PASS | Campaign still present; zero payments/tickets visible |
| Package amounts and counts | PASS configuration | Native Tickets editor shows 1/$20, 3/$50, 7/$100, zero bundles sold |
| Unique paid native numbers | BLOCKED | No tickets issued; needs authorized paid test |
| Native cutoff | PASS saved fields | November 15, 2026 5 PM; drawing 6 PM, end 6:01 PM; preview EST/calendar 23:00 UTC confirm Eastern drawing time |
| Already-open-cart cutoff | NOT TESTED | Do not reopen to test without explicit authorization |
| Purchaser name/email/address/phone | PASS configuration | Required first/last name (not explicitly labeled legal name), email, full address and phone |
| Age acknowledgment | PASS configuration | Required checkbox age at least 18; not independent identity/age verification |
| Residency acknowledgment | PASS configuration | Required U.S.-resident checkbox; broader legal clearance NOT established |
| Self-purchase/rules agreement | PASS configuration | Required; draft rules still have missing policies, so cannot authorize sales |
| Marketing consent | NOT TESTED | Not among required buyer questions; verify optional, separate, unchecked in final supported checkout |
| Email enabled / subject | PASS native | Required thank-you email enabled; Your NEO Chosen Cash Raffle tickets |
| Test email delivered | PASS native test only | October 19 19:55:09 UTC / 13:55:09 MDT, Gmail message 1a155bb71eac615a; fictional $71 fixture, no real ticket |
| Ticket access/resend | BLOCKED | Preview uses example.com sample ticket; real native document access needs paid test |
| Personalization/order quantity | PARTIAL | Native greeting and summary shown; no supported numeric ticket-count variable verified; copy gives 1/3/7 mapping |
| Email rules/social/events | PASS copy inspection | Seven event/social links plus rules present; canonical KHG social destinations match website; live social pages may throttle verification |
| Support | Awaiting owner | Public info@kirtlandheritagegroup.com / 440-796-1642; monitoring and coverage need assignment |
| e-ticket numbering setting | PASS native configuration | Issue e-tickets checked; native editor describes unique No. on each ticket; actual paid behavior remains unverified |
| Add-on donations/discounts | NOT CHANGED | No bonus, coupon or promotional multiplier added |
| Export schema | PASS native header inspection | Fresh Payments and Itemized XLSX, both zero data rows. [Headers and SHA256](raffle-native-export-evidence-2026-10-19.json) |
| Native report importer | BLOCKED native mapping | Neither observed export has stable payment/order ID; populated bundle semantics unverified |

## Export procedure

Campaign hub > Payments (confirm exact raffle title), leave date/status filters empty for all-time coverage > More options > Export. Download Payments. Repeat Itemized payments and enable Rate Title, Item Amount, Ticket #, E-ticket URL and Canceled Tickets. Keep buyer review fields only in restricted storage. Preserve original XLSX and SHA256. Current October 19 originals remain in the reviewer's Downloads folder, outside Git. Header-only metadata is safe to share.

The source reports include timezone America/Denver for payment dates/times. Do not confuse export-display timezone with the drawing's Eastern timezone. Preserve explicit offsets during normalization.

## Controlled paid-test plan — awaiting Joe's separate approval

1. Obtain counsel/operations clearance and Joe's explicit narrow test authorization. A human executes any prize-based payment. Maintain the public hold until an approved controlled access method is agreed; do not assume Zeffy has an undocumented sandbox/private purchase mode.
2. Test one $20/1, $50/3 and $100/7 package. Maximum ticket-only expenditure $170, 11 expected distinct native tickets. Optional contribution to Zeffy declined. Use an approved human payer and existing approved payment method; do not store payment data in this project.
3. Record native order IDs privately, receipt amounts, actual ticket-number text and documents, delivered confirmation, resend/access behavior, payment settlement and exported rows. Test desktop, iPhone and Android viewports without creating extra transactions. Confirm optional contribution and separate marketing consent before the human submits.
4. Classify controlled orders as TEST / eligibility pending in the restricted register; never silently enter them into the official pool. Accountant/rules owner decides whether they may remain eligible or must be canceled/refunded. Any refund is separately authorized and performed by a human through native controls. Preserve every original and reversal record; verify the export and quarantine effects.
5. Verify individual bundle semantics, stable source joins and physical stubs before calling the adapter native-verified. Obtain release signoff and a fresh explicit reopening instruction. Preserve cutoff at November 15 5 PM Eastern; recheck direct URL and an already-open cart at the approved cutoff rehearsal.

Checkboxes and accepted addresses cannot establish legal age, residence, physical purchase location or nationwide legality. Legal eligibility copy must be approved and then reconciled across rules, website, email and Zeffy before sales resume.
