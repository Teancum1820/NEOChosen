# Website review

Review URL: https://neochosen-joe-review.calebday1820.workers.dev/

This is a separate static review Worker. At Caleb's request, pages and assets are accessible without a password. It has no production routes, D1 databases, R2 buckets or production API bindings. Responses prohibit indexing and shared caching. The link works independently of the local preview server.

Build from the repository root, then update only the review Worker:

```powershell
npm test
node --test tests/review-worker.test.mjs
npx wrangler deploy --config preview/wrangler.jsonc
```

Production is controlled by the original root `wrangler.jsonc`. Do not deploy that configuration when updating this review. The production version was verified unchanged at `f752694d-4a7c-4b33-b851-2f286875820a` after creating this review on September 30, 2026.
