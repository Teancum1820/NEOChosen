# Reviewed-ticket register and printing

`scripts/raffle_print.py` is a local, persistent print register. It accepts human-reviewed normalized ticket records, prepares printable HTML and a numbered manifest, prevents a second batch from reserving the same native numbers, and separately records two named people's physical checks. No cloud database, new ticket numbers or payment system is introduced.

It is **not an automatic Zeffy XLSX importer**. On October 16 the actual campaign's Payments and Itemized payments workbooks downloaded successfully with zero data rows. Neither exported a stable payment ID. Itemized columns included Rate Title, Item Amount, Ticket #, E-ticket URL and Canceled Tickets. Bundle row semantics cannot be established from empty reports. Do not join orders by amount, date, name or email, or treat this implementation as proof that paid ticket issuance has been tested.

## Native source and human preparation

Use the existing campaign `e2d45f03-d16e-4e0c-816b-464489fc4782`. Preserve complete all-time Payments and Itemized exports and native payment details in a restricted KHG folder. Verify each payment's native ID against its detail record and each ticket against its native document. Use native PDFs directly if their detachable stub format is approved. Never replace missing numbers with generated numbers.

Create a complete normalized snapshot using [the data contract](raffle-normalized-data.md), with an additional outer envelope:

```json
{
  "campaign_id": "e2d45f03-d16e-4e0c-816b-464489fc4782",
  "source_reference": "Restricted export folder and human review record reference",
  "complete_snapshot_verified": true,
  "transactions": []
}
```

The empty array above is a format example, not a populated export. Each real transaction needs its verified native payment ID, reviewed purchaser reference linking that person's orders, confirmed settlement and eligibility, refund status, raffle-only amount, packages and their actual native ticket numbers. The existing reconciler validates $20/1, $50/3, $100/7 and mixed packages. Failed, unsettled, canceled, refunded, unreviewed, missing or inconsistent records are held. Conflicting owners/versions stop the import. Purchaser references should be short private codes; keep names, addresses and contact crosswalks separately.

## Commands

Keep the database, source snapshots and printable batches together in **one restricted KHG operations folder outside the public website**. Maintain a backup. One authoritative database is essential: copying it and running independent registers defeats duplicate controls. Do not upload these files to GitHub. The repository's `raffle-private/` directory is ignored if used temporarily.

```powershell
python scripts/raffle_print.py --database "<restricted folder>/register.sqlite" sync "<restricted folder>/reviewed-snapshot.json"
python scripts/raffle_print.py --database "<restricted folder>/register.sqlite" batch --output "<restricted folder>/batches"
```

`sync` reads a complete authoritative snapshot, preserves native numbers and flags any already-prepared stubs that have become invalid or disappeared. Inspect its exception output. `batch` reserves only new eligible numbers in an atomic database transaction and writes a printable `.html` file plus a `.json` manifest containing numbers, count, source hash and file hash. It never overwrites existing files. Repeating the same import and batch does not create another set. A file-generation failure rolls back reservations and removes partial output.

Open the prepared HTML in a browser, print **once** at 100% on US Letter, and cut on the outlines. Stubs are 3.5 by 1.75 inches. This custom format still needs approval against the drawing requirements and an actual printer rehearsal. File creation does not mean paper has been printed. Compare every number and count against the native tickets and manifest, with two people. Only then record:

```powershell
python scripts/raffle_print.py --database "<restricted folder>/register.sqlite" confirm-physical <batch-id> --operator "Actual operator name" --witness "Actual independent witness name"
```

The tool refuses the same checker twice, a changed file, a repeated confirmation, or unresolved held stubs. Never make up operator or witness names. A buyer's resend or customer-copy reprint does not involve this command or a new official batch.

For refunded/canceled/missing tickets already prepared, locate their paper stubs and physically quarantine them. After two actual people verify removal, record only the specific numbers shown in the exception report:

```powershell
python scripts/raffle_print.py --database "<restricted folder>/register.sqlite" confirm-quarantine <native-number> <native-number> --operator "Actual operator name" --witness "Actual independent witness name"
```

New batches remain blocked while physical removal is unresolved. Retain the quarantined material and audit trail. If eligibility later changes again, investigate custody before any return to the receptacle; the tool never automatically reprints a reserved number. For misprints, loss, restored eligibility or replacement stubs, stop and use an approved witnessed exception procedure. Do not clear the database to bypass reservations.

## Validation and remaining verification

29 Python tests cover reconciliation, 1/3/7 and mixed package counts, repeated imports, duplicate ownership, refunds, physical-removal reporting, atomic file failures, HTML escaping and separate physical confirmation. The tests use fictional records and an isolated temporary register. No production entries or purchases were created. A populated native purchase/export mapping, actual customer ticket access/resend, actual print/cut/count rehearsal and assigned operations staff remain unverified.
