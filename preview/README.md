# Joe’s combined website review

Review hub: https://neochosen-joe-review.calebday1820.workers.dev/review/

Contains the current published site and Media Kit plus the proposed VIP Sponsor
Dinner page, partner logos, related reservation wording, and breakfast page.
Breakfast submissions are intentionally disabled. No Google Sheet identifiers,
credentials, private venue/RSVP details, attendee data or receiver bindings are
served. Joe can reply to Caleb with approvals or requested changes.

This existing review-only Worker is accessible without a password at Caleb’s
previous request. Responses prohibit indexing and caching. It has no production
routes or data bindings. Never deploy production/wrangler.jsonc for this review.

Run npm test, npm run lint, npm run typecheck, node --test
tests/review-worker.test.mjs, and the relevant browser tests. Deploy only with
wrangler deploy --config preview/wrangler.jsonc, or this branch’s npm run deploy.

No production release or main merge is authorized by creating this review.
