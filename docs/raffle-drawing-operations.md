# Drawing-stub operations

October 19, 2026. **Sales held. No real drawing authorized.** This supersedes the October 16 register command examples. One authoritative private SQLite register is used; no parallel register or production ticket numbering is introduced.

## Roles and storage

Joe names and confirms the eligibility reviewer, reconciliation lead, printer, independent checker, drawing lead/witnesses and support monitor, with backups. Keep original native exports, native documents, identity crosswalk, reviewer evidence, database, batch files and backups in a restricted KHG operations folder outside public assets/Git. No card/bank/SSN or unnecessary purchaser contact details belong in print files. Keep a single active register and serialized operator access. SQLite transactions prevent concurrent duplicate reservations, but copying the database defeats that protection.

## Export and normalize

1. Follow [native export instructions](raffle-zeffy-checklist.md). Preserve complete all-time Payments and Itemized exports and checksums, source time with offset, campaign and filtering evidence.
2. Establish native payment IDs from supported provider records and exact native ticket numbers/documents. Neither current header-only report exposes a stable payment key. Do not join by name, email, amount, timestamp or row number. Do not manufacture a missing ticket number.
3. Human-review the person crosswalk across orders. Similar names/shared email do not prove one person; ambiguous matches remain pending. Record rules version, reviewer, evidence and review time privately. Map settlement for each payment method and canceled/refunded/disputed tickets explicitly.
4. Create the complete reviewed normalized JSON contract described in [normalized data](raffle-normalized-data.md). Required envelope now includes campaign_id, source_reference, currency USD, source_as_of, reviewed_at, reviewed_by, and true attestations complete_snapshot_verified, authoritative_snapshot_verified, native_ids_verified, person_references_verified and ticket_statuses_verified. Dates require UTC offsets, review follows capture, no future/stale snapshots. Empty snapshots require special care: they can hold all previously imported entries.
5. `scripts/raffle_import.py` is an **explicitly mapped reviewed CSV adapter**, not a verified native Zeffy importer. One row is one entire normalized order, including packages JSON; it does not join native spreadsheets or infer their schema. Mapping file version 1 requires reviewed_by/reviewed_at/evidence_reference, mapping_reviewed/native_ids_verified true, every field-to-exact-header mapping and every status mapping. Keep mapping review with the source. See tests/fixtures/raffle-envelope.sample.json, raffle-mapping.sample.json and raffle-transactions.sample.csv for fictional examples. For those fixtures, pass --campaign SAMPLE-NOT-A-CAMPAIGN before the command and batch --sample, using a separate sample database. Native mapping remains a release blocker.

```powershell
python scripts/raffle_import.py '<private>/reviewed-orders.csv' --mapping '<private>/reviewed-mapping.json' --envelope '<private>/reviewed-envelope.json' --output '<private>/snapshot.json'
python scripts/raffle_print.py --database '<private>/register.sqlite' sync '<private>/snapshot.json'
python scripts/raffle_print.py --database '<private>/register.sqlite' report
```

Output exclusively creates a new snapshot file. Reimporting identical canonical records is idempotent. Conflicting versions, identities, native-number ownership, unknown statuses, malformed amounts/packages and missing fields are rejected or held. Older snapshots cannot restore stale eligibility. Review every exception; import success does not imply drawing eligibility.

## Validity and accounting

Only settled, no-refund/reversal, active-ticket, eligibility-approved orders with correct $20/1, $50/3, $100/7 package counts can be included. Preserve leading zeroes as ticket-number strings. Purchaser references are private short codes; names alone cannot determine winner exclusion. Raffle-only revenue is counted once per unique payment, never once per ticket. Optional Zeffy contributions, donations, admissions and sponsorships are excluded by the reviewed ticket-sales mapping. Separate settled gross/refund/net from eligibility-approved prize basis; unresolved amounts never become an assumed zero.

## Prepare and print a batch

```powershell
python scripts/raffle_print.py --database '<private>/register.sqlite' batch --output '<private>/batches'
```

This atomically reserves only new eligible native numbers and creates HTML plus a hashed JSON manifest, containing number list, count, source digest and sample/live status. It never means paper was printed. No second batch or customer resend creates another reservation for the same number. Files exclusively create; failed generation rolls back. Sample runs use a separate temporary database and `batch --sample`, with SAMPLE-prefixed fictional order/person references. Never mix sample and live registers. Legacy reservations require witnessed investigation, not automatic migration into the pool.

Print one HTML batch once, US Letter at 100%. Cut uniform 3.5 by 1.75 inch stubs. Minimum proposed information: native number, private purchaser reference, source order and batch. Counsel/operations must approve format. Operator and independent witness compare every native number and total with the manifest and source documents, inspect for clipping/misprints and record secure container custody. Only after actual paper verification run:

```powershell
python scripts/raffle_print.py --database '<private>/register.sqlite' confirm-physical '<batch-id>' --operator '<actual printer>' --witness '<actual independent checker>' --custody-ref '<sealed container reference>'
```

Different names, unchanged HTML/manifest and no unresolved removals are required. No invented checker or sample software event counts as a human rehearsal. Secure container access and transfers belong in a signed custody log; the database records the supplied custody reference, not physical security itself.

## Refunds, voids, damage and duplicate handling

Refresh the complete source before each batch and at final close. Any prepared ticket that becomes invalid or disappears enters removal_required. Quarantine the actual paper with two humans; retain it and its audit trail. New batches/confirmation remain blocked until removal is resolved.

```powershell
python scripts/raffle_print.py --database '<private>/register.sqlite' confirm-quarantine '<native-number>' --operator '<actual operator>' --witness '<actual witness>' --custody-ref '<quarantine container>'
python scripts/raffle_print.py --database '<private>/register.sqlite' physical-exception damage_hold '<native-number>' --operator '<actual operator>' --witness '<actual witness>' --reason '<reason>' --custody-ref '<container>'
```

`void` requires already recovered/quarantined paper and permanently preserves the reservation. `restore` returns only the same intact original stub after eligibility and original batch confirmation; it does not print replacements. Unknown/lost paper cannot be declared recovered. **Automated replacements are intentionally unsupported:** stop for an approved witnessed destruction/replacement procedure and implementation review. Do not clear a reservation/database or reprint a batch to bypass controls. A proposed replacement remains a blocker until the procedure is approved and verified.

## Reconcile and simulate

Compare all three counts: package-derived entries, unique native valid numbers and physically confirmed eligible stubs in custody. File generation, printed paper and independently verified paper are distinct states. Investigate any eligible unprinted, quarantined, void, missing or duplicate stub. Retain source snapshots, order history and audit_events. A report always states official_draw_authorized=false; it cannot authorize launch or an official draw.

For a **fictional** rehearsal use the test suite and sanitized examples. Supplied explicit ticket selections model physical selections; the software does not randomly choose a real winner. Grand prize is first. Each time a purchaser wins, remove every remaining ticket for that same reviewed person across all orders before selecting the next prize. Require six distinct eligible people; held/refunded/invalid entries cannot win. Witness physical removals against the complete purchaser crosswalk. Never infer identity from similar names.

## Final drawing and payout handoff

At approved cutoff: confirm native sales closed, obtain complete final source/settlement/refund reports, resolve every exception, freeze a hashed register backup, verify all valid entries have exactly one physical stub and sign the custody/count reconciliation. Drawing lead/witnesses must be assigned and venue/rules approved. No real winner selection occurred during software testing.

Reconciliation lead verifies eligible gross revenue; independent calculation reviewer checks 20/6/5/4/3/2 percentages and approved cent/refund policies. Record basis, source hash, each award, total and retained amount before expenses. Existing prize_example is illustrative HALF_UP, **not adopted policy**. Accountant determines withholding/reporting and collects necessary tax data securely outside this project. Winner verifier applies approved rules; Joe names payment authorizer and disburser. Record authorized disbursements and required acknowledgments in restricted records. No Zeffy automatic prize payout is assumed and no payments are initiated by this workflow.
