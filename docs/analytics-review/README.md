# NEOChosen: Joe's analytics review

Existing draft [PR #106](https://github.com/Teancum1820/NEOChosen/pull/106); base main at 273ff5c77beba41c1180063de6fb9a129eac169e. Source evidence commit 09d9361e2912b0eccf3f90482e852ef78dbec852. All tracking is disabled and no production publication is authorized. This is ready for technical review with explicit account/approval blockers, not activation approval.

- [Verified baseline](BASELINE.md)
- [Metricool discrepancy and UNVERIFIED status](METRICOOL_VALIDATION.md)
- [Site-specific notice source and proposed path](PRIVACY_NOTICE_DRAFTS.md)
- [Account/domain/administrator audit and Joe's access checklist](ANALYTICS_ACCOUNT_VERIFICATION.md)
- [Exact command, SHA, browser and CI evidence](TRACKING_VALIDATION_REPORT.md)
- [Consent behavior and limits](CONSENT_TEST_MATRIX.md)
- [Future activation prerequisites](ACTIVATION_CHECKLIST.md)

Proposed notice /privacy/; all notices are drafts and noindex. Unknown IDs remain blank; Metricool hashes remain exact and UNVERIFIED. Provider delivery and completed external transactions are not established by synthetic tests. Cookie deletion is not implemented; notices disclose this. Consent withdrawal denies/revokes future custom events and reloads vendor code.

Source improvements preserve opt-in, reject corrupt consent/unsafe notice paths/wrong-type provider IDs, keep settings available while globally disabled, and remove a stale stored grant if writing withdrawal fails.

Joe's remaining decisions: approve the notice/contacts/retention and automatic measurement policy; provide missing existing account access/IDs and generated Metricool snippets; review event semantics and any RTG Ads linkage; approve any future release separately. The Workers build hold must remain during this assignment. No PR is merged, no main is pushed, no provider is enabled, and no email is sent to Joe.
