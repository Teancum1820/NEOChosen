# Raffle review preview

Review page: https://neochosen-raffle-review.calebday1820.workers.dev/raffle/

Draft rules: https://neochosen-raffle-review.calebday1820.workers.dev/raffle/rules/

This separate Cloudflare Worker hosts the intended public launch design for Joe's review. It has no production routes or data bindings. The public website continues to show its existing Coming Soon page.

The preview is publicly reachable by anyone with the link. Robots headers and metadata request no indexing; they are not access controls. It accepts GET and HEAD only and contains no Zeffy checkout. The main page uses public-facing launch copy with a small preview bar and a Review notes dialog. Ticket buttons open a selection summary with checkout disabled; they do not issue tickets, collect purchaser data, or send requests. Launch-notification signup and preparation-only sections are removed.

Public-style wording about ticket delivery describes the intended service, not completed functionality. Review notes explicitly identify checkout, confirmation emails, numbering, and drawing-stub fulfillment as unconnected or unverified. Existing proposed prices ($20/1, $50/3, $100/7), prize percentages, eligibility, and November 15 schedule are preserved for design review and still require final approval. The expired opening date is omitted from the landing page. Linked rules retain their draft warnings and unresolved terms.

Preview source: `source-assets/raffle-preview/public-launch.html`, `.css`, and `.js`. These files are excluded from the ordinary production build.

Rebuild and redeploy only this review service:

```powershell
node scripts/build-raffle-review.mjs
npx wrangler deploy --config preview/raffle.wrangler.jsonc
```

The output is `artifacts/raffle-preview`, separate from the ordinary `dist` build. The existing review Worker is reused without changes. Do not use the production deployment command to update this preview.

Verified October 16, 2026: both hosted pages return 200 with noindex headers; POST returns 405; both sponsor logos and preview CSS/JavaScript return 200. Desktop and 390px/320px layouts were checked with no horizontal overflow. All three ticket buttons display their correct counts and totals; checkout is disabled. Dialog close buttons, Escape dismissal, Review notes, and the draft-rules link were checked. The live raffle page remains Coming Soon with no purchase button or preview script.
