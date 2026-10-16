# Raffle review preview

Review page: https://neochosen-raffle-review.calebday1820.workers.dev/raffle/

Draft rules: https://neochosen-raffle-review.calebday1820.workers.dev/raffle/rules/

This separate Cloudflare Worker hosts the archived raffle proposal for Joe's review. It has no production routes or data bindings. The public website continues to show its existing Coming Soon page.

The preview is publicly reachable by anyone with the link. Robots headers and metadata request no indexing; they are not access controls. It accepts GET and HEAD only, contains no Zeffy checkout, and keeps notification fields disabled. The page explicitly identifies ticket delivery and drawing-stub fulfillment as unconnected and untested. Proposed terms and rules still require approval. The expired October 1 opening is replaced with an opening pending approval.

Rebuild and redeploy only this review service:

```powershell
node scripts/build-raffle-review.mjs
npx wrangler deploy --config preview/raffle.wrangler.jsonc
```

The output is `artifacts/raffle-preview`, separate from the ordinary `dist` build. The existing review Worker is reused without changes. Do not use the production deployment command to update this preview.

Verified October 16, 2026: both hosted pages return 200 with noindex headers; POST returns 405; both sponsor logo assets return 200. Desktop and mobile layouts and the draft-rules link were checked. The live raffle page remains Coming Soon.
