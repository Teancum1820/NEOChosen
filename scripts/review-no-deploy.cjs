"use strict";
// Review hold: the connected Cloudflare builder runs npm run build before upload.
// Do not remove until the owner approves publication. No credentials are read.
if (process.env.WORKERS_CI) {
  console.error(
    "ANALYTICS_REVIEW_HOLD: upload and deployment are blocked pending approval. Run review QA in GitHub Actions or locally.",
  );
  process.exit(1);
}
