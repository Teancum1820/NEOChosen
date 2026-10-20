# Electronic drawing — operator review required

Joe's October 20 email explicitly replaces physical-stub operations with an electronic drawing, grand prize first, then 6%, 5%, 4%, 3%, and 2%, with all remaining tickets of each winner excluded across orders. Those percentages already appear in the published rules; none were invented. This method amendment does not establish regulatory clearance or approve this candidate implementation for a real drawing.

Zeffy has no native winner-selection tool. Its [current drawing instructions](https://support.zeffy.com/drawing-a-winner-for-your-raffle-uusgb) require an external drawing after exporting itemized tickets. Its [ERS explanation](https://support.zeffy.com/is-zeffy-a-licensed-electronic-raffle-system-3j4tt) distinguishes ticket issuance from a licensed drawing system. Joe must obtain the organizational/legal clearance applicable to this procedure. No winner was selected from actual purchaser data.

## Candidate and rehearsal

`scripts/raffle_electronic.py` is a small offline, standard-library candidate. `validate` accepts reviewed normalized JSON; `rehearse` generates only fictional records. Follow-up work prepared a guarded `draw-approved` command for independent review, with read-only `check-approval` and `verify-official` commands. Independent code review and separately documented operator authorization must precede any real use. Changing a campaign label to bypass the rehearsal guard is not authorization.

October 20 follow-up adds source integrity checks, approval-bound official selection with durable per-event logging and accidental-repeat protection in the designated custody folder, and read-only audit verification. See the [exact human handoff, official command procedure and blank signoff form](raffle-finalization-2026-10-20/HANDOFF.md) and [technical review](raffle-finalization-2026-10-20/drawing-code-review.md). The expanded suite passes 25 tests; official-path tests use fictional records/approvals and a mocked future clock only. These additions do not authorize official use.

```powershell
python -m unittest discover -s tests -p test_raffle_electronic.py -v
python scripts/raffle_electronic.py rehearse --output '<new local rehearsal folder>'
python scripts/raffle_electronic.py validate '<restricted reviewed snapshot.json>'
python scripts/raffle_electronic.py preflight '<restricted reviewed snapshot.json>' --source '<unchanged native source or manifest>' --campaign e2d45f03-d16e-4e0c-816b-464489fc4782
python scripts/raffle_electronic.py verify-rehearsal '<synthetic-input.json>' '<audit.json>'
```

The saved [rehearsal](raffle-finalization-2026-10-20/rehearsal/audit.json) used 23 active fictional tickets for six people, including a three-ticket order and a seven-ticket order for the same person, plus a refunded ticket excluded from the pool. Six distinct people were selected. The deterministic unit test forces that ten-ticket person to win first and verifies that the next pool contains 13 tickets. It also checks the 1/3/7 weights, all excluded statuses, duplicate ticket identifiers, missing identifiers, uncertain identities, order conflicts, empty/malformed input, fewer than six people, exhaustion prevention, file errors, immutable input, output overwrite refusal, cryptographic randomness calls and the audit chain. All 11 tests passed.

Each active ticket occupies one pool row. `secrets.randbelow(pool_size)` uses OS cryptographic randomness with rejection sampling; no predictable seed or `Math.random` is used. After selection, filtering removes **all rows with that reviewed person_id**, regardless of order_id. The tool rejects a pool with fewer than six eligible people before any selection. Each event records rank, percentage, selected index/native identifier/person code, entire pre-selection pool hash/count, removed identifiers, time, previous-event hash and event hash. JSON audit and CSV results are written to a new exclusive directory.

Cryptographic selection cannot be reproduced from a seed; the logged index, immutable pool and hashes allow independent verification of each removal and rank. Hashes alone cannot prove an operator did not rerun the program or rewrite the whole chain. Witnesses, a recording and an independently retained pre-draw digest/transcript are essential. Never rerun a real draw because a result is inconvenient; interruption/recovery and alternate-winner procedures require approval before use.

## Native export and identity reconciliation

1. At close, verify direct Zeffy checkout and an already-open cart refuse payment. Preserve complete, all-time native Payments and Itemized exports, source time/timezone, campaign ID, selected filters and SHA256 hashes. Store them outside this public repository and its `dist`, `images`, `docs`, `source-assets` and screenshot folders, in a restricted KHG location. Preserve the original files unchanged and back them up.
2. Follow Zeffy Payments → filter exact raffle → Export → Itemized payments. Include native ticket number, ticket status/canceled flags, package/rate, payment status and purchaser identity fields. Reconcile against the order-level Payments report and supported provider payment-detail records. Do not manufacture order IDs or ticket numbers, or join orders by spreadsheet row, name, email, amount or timestamp alone. The October 19 itemized free-test export lacked a stable order-ID column; native paid-order mapping is **not yet verified**.
3. Have two named reviewers map provider records into a normalized ticket-per-row snapshot. Exactly 1, 3 or 7 distinct native identifiers must reconcile for each purchased package; repeated bundle purchases retain every valid entry. Map canceled, voided, refunded, invalid, reversed/disputed/unsettled and otherwise ineligible records explicitly; unresolved status must block release. Do not treat a blank status as active. Compare package-derived counts, exported distinct numbers and final included/excluded totals.
4. Create a restricted crosswalk from verified purchaser evidence to a private person_id. Separate emails can belong to the same person; shared emails can belong to different people. Similar names do not authorize a merge. Group possible matches for human review, record the evidence, reviewer, decision and time, and mark unresolved rows `identity_status: pending`. The validator refuses all unresolved rows, including excluded ones. Use `verified` only after evidence-based review. One order cannot map to conflicting people. Reconcile separate orders for one verified person to the same person_id.
5. Never put names, emails, addresses, native e-ticket access URLs or purchaser exports into Git. The normalized drawing data should use minimal private IDs. Ticket ownership and winner verification remain restricted human tasks. Reviewer attestations are not automated identity verification.

Normalized envelope: `schema_version: 1`, `campaign_id`, `source_sha256` (original native source hash; if multiple originals, hash an immutable source-manifest file), `reviewed_by`, `review_reference` (restricted signed reconciliation record), and literal `true` values for `complete_export_reviewed`, `identity_reconciliation_approved`, `statuses_reviewed`. `tickets` is a nonempty array of `{ticket_id, order_id, person_id, status, identity_status}`. Ticket IDs are exact provider strings; preserve leading zeros. Status is `active`, `canceled`, `voided`, `refunded`, `invalid` or `ineligible`. Identity status is `verified` or `pending`. Reject every unmapped value. The validator does not verify the source file itself, authenticate reviewer identity, calculate monetary eligibility, or convert Zeffy exports automatically: those remain documented human reconciliation gates. The synthetic fixture demonstrates the JSON format without private data.

Use `preflight`, rather than `validate` alone, to additionally compare the actual original file's bytes against `source_sha256`, bind the expected campaign ID and require six eligible people. For a source manifest it verifies only the manifest bytes; reviewers must recheck every listed original file separately. It does not inspect native spreadsheet contents or authenticate the human review. `verify-rehearsal` deterministically checks the synthetic transcript's transitions and hashes without selecting any new winners. It does not prove randomness, source truth or independent custody.

## Mandatory signed authorization before the official drawing

Joe must name a reconciliation lead, independent checker, drawing operator and witness(es), and backups. Before 6 p.m. Eastern November 15, they must sign off on:

- Final eligible ticket list, native-export mapping, complete snapshot hashes, settled/refund status and 1/3/7 counts.
- All identity crosswalk decisions across separate orders; no unresolved matches.
- Exact published rules/version, eligible gross ticket-sales basis excluding Zeffy contributions, six percentages, cent rounding/refund treatment and minimum-six rule.
- Legal/organizational clearance for electronic selection and purchaser eligibility.
- Independently reviewed tool/version, witnessed rehearsal, secure machine/storage and final procedure (including failure/restart/recovery).
- Audit recording, independent custody of original hashes/results, named operators/witnesses and a no-rerun policy.

Joe and the accounting reviewer must verify prize calculations and tax/withholding/payment procedures separately. The candidate records percentage ranks only and never calculates, allocates or pays cash, sends notifications, or changes Zeffy records. No official drawing approval, paid production issuance test, native paid-export adapter approval or named operator acceptance is claimed.

## Sales cutoff

Saved native campaign settings on October 20: America/New_York, start November 15 at 6 p.m., automatic **Sales closing date November 15 at 5 p.m.** Eastern. This is 22:00 UTC, after the daylight-saving transition; the drawing is 23:00 UTC. Zeffy's current documentation supports that explicit automatic close field. Future execution and already-open-cart behavior have not been observed. Joe should assign an operator to verify closure at 5 p.m. and use Campaigns → exact raffle → menu → Close sales if the native cutoff fails. This is a proposed contingency requiring Joe's operator assignment, not an executed or approved manual fallback. Website build-time cutoff logic does not close direct provider checkout.

## Superseded documents

October 19 physical-print/register documents and draft promotional sources are historical. Do not run their printing or physical-custody steps as this electronic drawing procedure. Retain them and all old records; no source/history was deleted.
