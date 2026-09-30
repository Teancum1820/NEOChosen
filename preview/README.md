# Private website review

Review URL: https://neochosen-joe-review.calebday1820.workers.dev/

This is a separate, password-protected static review Worker. It has no production routes, D1 databases, R2 buckets or production API bindings. Pages and assets require a signed session; responses prohibit indexing and shared caching.

Build from the repository root, then update only the review Worker:

```powershell
npm test
node --test tests/review-worker.test.mjs
npx wrangler deploy --config preview/wrangler.jsonc
```

The password is stored as the Cloudflare `REVIEW_PASSWORD` secret, never in source or this document. Its local copy is in the ignored `artifacts/review-secrets.json` file. Changing the password invalidates prior sessions. Sessions expire after seven days; the review URL itself remains available independently of the local preview server.

Production is controlled by the original root `wrangler.jsonc`. Do not deploy that configuration when updating this review. The production version was verified unchanged at `f752694d-4a7c-4b33-b851-2f286875820a` after creating this review on September 30, 2026.
