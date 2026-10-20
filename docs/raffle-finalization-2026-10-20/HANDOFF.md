# Raffle: exact remaining human actions

Prepared October 20, 2026. Website changes are live. Joe's email remains an **unsent draft**. This document is a proposed operating checklist, not a signed authorization or an official drawing.

## Joe / KHG: assign people and approve the procedure before November 15

- [ ] Name a reconciliation lead, an independent checker, a drawing operator, witness(es), and backups. Record names and acceptance in a restricted copy of the signoff form below. No one has been assigned by this task.
- [ ] Obtain the organizational/legal approval applicable to electronic selection and have an independent technical reviewer review `scripts/raffle_electronic.py` and its exact Git revision/runtime file hash. A guarded **`draw-approved` command is now implemented for review**; no further entry-point coding is being handed to Joe. Its official path has only been tested with fictional records, fictional approval references and a mocked future clock. Do not run it on real entries before independent and organizer approval, final reconciliation and the actual drawing time.
- [ ] Approve the published six-prize structure (20%, 6%, 5%, 4%, 3%, 2%), eligible ticket-sales basis excluding Zeffy contributions, accounting/cent-rounding treatment, identity review and interruption/no-rerun procedure. Do not change the published rules through this checklist.
- [ ] Approve the named closing operator's manual contingency described below.

## Caleb or Joe: resolve Zeffy's generated 6:01 display

Use [the prepared support message](zeffy-support-request.txt) in the existing Zeffy account's Help widget. It is ready to copy, but **has not been submitted or sent**. Ask Zeffy to suppress the internal end marker in the native confirmation/calendar and e-ticket output while preserving the real 5 PM close / 6 PM drawing, America/New_York. Request a supported way to associate each exported ticket with its stable native payment/order ID. The editor exposes no e-ticket date-format control; public hiding is already saved.

After a provider fix, inspect the saved date/close settings, send a native test only to the existing authorized account, and check the actual delivered email and e-ticket output. Do not disable numbered e-ticket issuance or replace the campaign.

## Caleb or assigned reviewer: finish production evidence when a real order exists

No paid raffle transactions were available during this follow-up. Use an existing legitimate production order when available, with the purchaser's cooperation for their confirmation; a new paid test is **optional**, not a prerequisite imposed by this task. Do not create charges, refunds, cancellations or eligible test entries without separate organizer authorization.

- [ ] Verify the real production confirmation's ticket link, ticket counts for purchased bundles and unique native numbers. Existing separate free tests already verified 1/3/7 issuance; the native production test email is a fixture, not a purchase.
- [ ] Open the delivered confirmation on an actual phone/email client and open its actual ticket link. The delivered HTML has been checked at 320px and 390px in a browser, which does not establish Gmail/iOS/Outlook client behavior.
- [ ] Preserve the production Itemized payments export and corresponding payment-detail evidence. Prove the stable order-to-ticket mapping, package counts, raffle-only amounts and payment/refund/cancellation status. Do not derive order IDs by grouping names, email addresses or timestamps.

## Assigned closing operator: November 15, 2026, 5 PM Eastern

The saved automatic close is **5 PM America/New_York** (3 PM Mountain / 22:00 UTC); drawing begins **6 PM Eastern** (4 PM Mountain / 23:00 UTC). Existing campaign: `e2d45f03-d16e-4e0c-816b-464489fc4782`.

1. Before 5 PM, open the direct public checkout and keep a second unsubmitted cart open. Use a clock displaying Eastern time. Do not submit a payment just to test the boundary.
2. At 5 PM, reload the direct public checkout and inspect the existing cart's available actions. Capture the time and closed-sales state. A disabled UI is evidence of display behavior; server-side rejection of a previously open cart's payment must be confirmed by Zeffy or an authorized real payment attempt, not claimed from inspection alone.
3. If sales remain open, use **Campaigns → exact NEO Chosen Cash Raffle → three-dot menu → Close sales**, then recheck direct checkout. This proposed contingency requires Joe's approval and a named operator. Do not close current live sales now.
4. Preserve complete, unfiltered final Itemized payments and order-level Payments exports, capture filters/timezone/campaign, and hash the unchanged originals. Resolve any boundary-time payment with the organizer according to approved rules.
5. If closure, final reconciliation or approvals are unresolved, stop before selection and escalate to Joe. Do not improvise a drawing or eligibility decision.

## Reconciliation lead + independent checker: before the 6 PM drawing

1. Match every native ticket to its evidenced payment/order and package; reconcile included/excluded counts and eligible sales. Resolve refunds, canceled/voided tickets and every unsettled/ambiguous status explicitly.
2. Review the private identity crosswalk across separate orders. Similar names are not enough to merge; different email addresses do not prove different people. Resolve every pending identity before approval.
3. Keep names, email, native ticket-access links and purchaser exports outside Git and public website folders. Make the minimal normalized JSON described in the [electronic operations guide](../raffle-electronic-drawing-2026-10-20.md).
4. Run the read-only preflight against the reviewed snapshot and unchanged original source:

   ```powershell
   python scripts/raffle_electronic.py preflight '<private reviewed snapshot.json>' --source '<private original export or manifest>' --campaign e2d45f03-d16e-4e0c-816b-464489fc4782
   ```

   This checks the campaign, original source bytes, basic row validity and at least six verified eligible people. It does not authenticate reviewers, establish settlement/eligibility, check package money, parse a native XLSX, authorize a draw or prove that normalized rows faithfully represent the source. If the source is a manifest of multiple originals, reviewers must independently recheck **each referenced file's hash**; preflight verifies the manifest bytes only.
5. Both reviewers sign the final snapshot/source digests and reconciliation counts. The operator and witness retain the approved version and digests independently. Use the approved official procedure only after all gates are satisfied.

## Drawing operator + witness: reviewed official command

Copy [approval-template.json](approval-template.json) to the restricted custody location. All its approvals are deliberately false and all signature references blank. Humans must complete genuine signed reviews first, then record their evidence references; the program cannot authenticate signatures or establish legal clearance. The normalized official snapshot must explicitly contain `synthetic: false`. Never relabel a rehearsal as real entrant data.

Record the actual source and canonical snapshot hashes from `preflight`, and the exact operator-machine script hash from `Get-FileHash scripts/raffle_electronic.py -Algorithm SHA256` (lowercase). That exact script must have been independently reviewed. Fill the fixed campaign/prize/time bindings and named operator; each signed reference identifies the restricted record containing that role's name, decision and timestamp. When a source manifest is used, reviewers must also recheck every original it lists.

Before selection, the operator can run the **read-only** `check-approval` with the same snapshot/source/approval/operator arguments as below, omitting `--custody-dir`. A pass proves recorded fields and hashes match; it is not a program-granted authorization.

Only at/after **November 15, 6 PM Eastern**, with the human approvals and witness in place, the human operator invokes:

```powershell
python scripts/raffle_electronic.py draw-approved '<private reviewed snapshot.json>' --source '<private unchanged source or manifest>' --approval '<private signed approval.json>' --operator '<exact approved operator name>' --custody-dir '<ONE designated restricted custody folder outside this repository>'
```

The command verifies the source, campaign, tool/snapshot hashes, signed-reference fields, approval attestations, operator and time. It claims a permanent campaign start record **before randomness**, preserves snapshot/approval copies, and flushes each selection to `selection-events.jsonl` before selecting the next winner. It produces `official-audit.json` and `official-results.csv`; it does not calculate/pay prizes, contact winners, or modify Zeffy. `official_draw_authorized: false` means the program does not grant authorization; genuine authority must come from the independently signed human records.

There is no force/restart/unlock option. A second run in the same designated custody folder fails before randomness. **Never delete the start record or use a different directory to rerun.** This protects against accidental repeats in the approved folder; independent custody and witnesses are still needed to detect deliberate relocation/deletion. Any interruption or output error stops the process: preserve the start record, partial transcript and all files and escalate under the preapproved recovery procedure. Do not invent a replacement drawing or rerun.

The independent checker uses `verify-official` with the same snapshot/source/approval/operator and `--audit '<private official-audit.json>'`, without `--custody-dir`. This recomputes the complete pool transitions and hashes without randomness. Compare the audit's six events with the retained JSONL transcript and CSV, verify all six distinct people and every removed cross-order ticket, and retain the final digest independently before any public announcement.

No official command was run against real entries during this task. The **25-test** suite exercises these controls only with fictional records/approvals and a mocked future clock in temporary folders that are deleted after testing.

## Restricted signoff form — copy outside the public repository

Do not fill this public template with purchaser details or signatures in Git.

| Gate | Name / decision / evidence reference / timestamp |
| --- | --- |
| Reconciliation lead + backup accept role | Pending |
| Independent checker + backup accept role | Pending |
| Drawing operator + backup accept role | Pending |
| Witness(es) accept role | Pending |
| Organizational/legal clearance reference | Pending |
| Reviewed tool/method, exact revision and official entry point | Pending |
| Witnessed rehearsal, recovery and no-rerun approval | Pending |
| Published rules/version, prize base, percentages and rounding approval | Pending |
| Cutoff enforcement / approved contingency evidence | Pending until November 15 |
| Original source file(s) and SHA256 / manifest | Pending final export |
| Native order mapping, bundle counts and financial/status reconciliation | Pending |
| Private identity crosswalk signed; zero unresolved identities | Pending |
| Final normalized snapshot SHA256 / active and excluded counts | Pending |
| Independent custody of digests and recording/results plan | Pending |
| Final go/no-go signed by organizer, reviewers, operator and witness | Pending |

## Joe's email

Caleb should review the existing draft and decide when to send it. It remains unsent by instruction. The draft explains the live website, verified testing and the unresolved handoffs; it must not describe the drawing as authorized or the 6:01 issue as fixed.
