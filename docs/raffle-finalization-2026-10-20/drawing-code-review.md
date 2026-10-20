# Electronic candidate: follow-up technical review

October 20, 2026. This is the implementing agent's review and test record, **not independent approval**. A guarded official entry point is prepared for review; it has not been run on real entries.

| Area inspected | Result / remaining limit |
| --- | --- |
| Ticket weighting | One active native identifier per row; 1/3/7 bundles and separate orders retain their weights. |
| Winner exclusion | All pool rows for the verified person are removed after each selection, across order IDs. Grand prize first, then 6/5/4/3/2. |
| Randomness | Python `secrets.randbelow`, OS cryptographic source; no predictable seeds. |
| Input failures | Duplicate JSON keys/numbers, missing/invalid identifiers, unknown statuses, unresolved identities and conflicting within-order person IDs fail closed. Follow-up rejects boolean/float schema versions, non-string status values and invisible/control characters in IDs. |
| Source integrity | New `preflight` compares the exact unchanged source bytes' SHA256 with the snapshot and compares its campaign against a separately supplied expected ID. A different source/campaign fails. At least six eligible verified people required. |
| Audit verification | New `verify-rehearsal` checks all six pool hashes/sizes, recorded indices, winner/order/person IDs, complete removal sets, rank percentages, UTC timestamp ordering and the hash chain against the original synthetic snapshot. It never calls randomness or selects new winners. Tampering tests recompute an edited event hash and still fail on the invalid transition. |
| Input and output custody | No input mutation; exclusive output directory prevents replacement of an earlier rehearsal. Source and snapshot originals must be independently retained. |
| Official entry point | `check-approval` is read-only. `draw-approved` verifies all recorded bindings/references/attestations, the named operator and November 15, 23:00 UTC start time. It requires a custody folder outside the repo, claims an exclusive permanent campaign start record before randomness, preserves reviewed input/approval, flushes and fsyncs every selection event, then writes final JSON/CSV. No force/restart/unlock option. `verify-official` checks transitions without drawing again. All official-path tests use fictional records/approvals and a mocked future clock. |
| Approval limits | Reviewer flags/references are attestations, not authenticated identities or signatures. Source hashing does not prove a faithful native import or legal/financial eligibility. No paid-production adapter, package-money calculator, notification or payout is provided. The program explicitly does not grant drawing authorization. |
| Audit limits | A valid self-consistent transcript does not prove randomness, prevent a rewritten transcript or detect every rerun. Independent witnesses, recording, signed retained digests and an approved no-rerun/recovery process remain necessary. |

Validation: `python -m unittest discover -s tests -p test_raffle_electronic.py -v` — **25 passed**. Tests include CLI rehearsal and read-only verification, malformed inputs, exact-byte source changes, wrong campaign, source absence, insufficient participants, input preservation, audit tampering and original drawing requirements. Official-path fixture tests cover every missing binding/approval/reference, premature start, public repo output refusal, six durable events, cross-order removal, input/approval custody, post-run audit verification, repeat refusal before randomness and interrupted-draw preservation/refusal to rerun. A fresh synthetic-only rehearsal and its verified transcript are saved in `rehearsal-followup/`. No real entrant or prize was used.

Before official use, Joe must obtain independent technical review of the exact revision, organizational approval and the final reconciliation/operator approvals listed in [HANDOFF.md](HANDOFF.md). The new commands do not change those gates.
