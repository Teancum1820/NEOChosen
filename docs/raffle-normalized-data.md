# Reconciliation reference data contract

The new [private print-register tool](raffle-print-register.md) accepts this normalized format inside a reviewed snapshot envelope. It adds persistent batch reservations and physical-check logs. The raw Zeffy XLSX-to-normalized mapping still requires a populated native purchase/export test; neither of the observed empty XLSX headers includes a stable payment ID.

This is an offline rehearsal schema, not Zeffy's export schema. No production CSV adapter has been verified. Prefer native reports/ticket documents. Do not paste raw purchaser records into source or sample folders.

The reference `reconcile` function consumes a **complete authoritative snapshot**, not an append-only event stream. Exact duplicate records are ignored. Two differing records with the same campaign/payment ID quarantine that order until an operator obtains and reviews the current native source. Do not combine historical snapshots and assume the last row is current.

| Field | Meaning and required mapping |
| --- | --- |
| campaign_id | Verified native form/campaign ID; required string |
| transaction_id | Stable native order/payment identifier; required string; export join key must be verified |
| purchaser_ref | Restricted crosswalk to a human-reviewed person across orders; nonempty string; not merely an unreviewed email match |
| payment_status | `settled` only after agreed provider settlement evidence; everything else held. Native UI uses labels such as Succeeded/Processing, which must not be blindly copied or treated as settlement for every method |
| eligibility_status | `approved` only after final-rule review of required buyer information, acknowledgments, exclusions and evidence; pending/missing/ineligible held |
| refund_status | `none` only when no cancellation, refund, dispute or reversal needs review; all other values held |
| ticket_sales_cents | Nonnegative integer USD cents for raffle packages alone; no optional contribution/donation/admission; must equal package prices times bundle counts |
| refunded_cents | Nonnegative integer cents, not boolean/string, no more than ticket sales; only zero permits automatic sample inclusion |
| packages | Nonempty list of native rate purchases |
| packages[].price_cents | 2000, 5000 or 10000 |
| packages[].quantity | Positive integer bundles purchased, not entries |
| packages[].ticket_numbers | Native numbers as exact digit strings, one per entry; 1/3/7 times bundle quantity; do not generate from quantity or assign replacements |

Canceled native tickets or inconsistent active/canceled item counts must put their order on hold during normalization until final rules resolve the disposition. This reference does not parse ticket cancellation columns, partial-refund allocations, source timestamps, native status histories, person identity, or buyer evidence. It cannot authorize an official draw. Those are controlled review/adapter prerequisites, not automatic guesses.

The working register keeps all valid-number rows, including held entries, with reason/status. Orders that cannot supply native numbers remain visible in the order/exception table; no missing number is manufactured. A shared native number in two orders holds both orders. Within-order duplicates also hold the entire order. Amounts are counted once per unique order. Input/payment order is irrelevant to the resulting sorted ledger.

The CLI intentionally has only a `sample` command. Its PDFs reject held entries, duplicate numbers and non-sample campaign/person references. This prevents presenting the supplied rehearsal as a production fulfillment system. Future real-data support would require the populated-export mapping, approved rules and private storage workflow to be implemented and independently verified first.
