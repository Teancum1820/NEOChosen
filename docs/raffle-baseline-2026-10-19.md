# Raffle baseline — October 19, 2026

Inspected 2026-10-19 13:36–13:38 MDT (19:36–19:38 UTC), before substantial changes.

- Existing clean checkout: feature/raffle-launch-preparation at a74da803ef2576a85b426d891c695b6a4e7e73d8; PR #107 OPEN against main (273ff5c77beba41c1180063de6fb9a129eac169e). PR #106 excluded.
- Production /raffle/ HTTP/browser extraction says sales open, with three active Zeffy links. This contradicts October 19 sales hold.
- Local source config salesOpen=true, salesAuthorized=true, rulesFinalized=false.
- Direct Zeffy fetch unavailable through web reader; authenticated provider verification pending. No purchase/payment attempted.
- Latest PR Frontend QA failed (run 38985570941); operations rehearsal passed; Workers Build succeeded. Actual failure log pending.
- Existing SQLite print register accepts reviewed normalized JSON, not raw native reports. Existing sample reports and PDFs are simulations. Prior native exports were empty; current transaction counts unknown.
- Historical production version documented as 764697e2-8479-4194-8cdc-9a1d06b02356; live deployment history verification pending.
- Joe's October 19 message explicitly says keep sales closed until approvals and ticket-to-drawing checks clear. Deadline 4 PM has no named timezone; report target 2 PM MDT.

Immediate action: close native sales via authorized control, disable website purchase path without unrelated changes. Preserve campaign and records. All native issuance, eligibility clearance and physical-print claims remain unverified until evidence obtained.
