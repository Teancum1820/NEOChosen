# Website sponsor logos — October 20, 2026

Added Frostop and Squeaky Clean NEO to the existing Community Partners listing in `scripts/sponsors.json`. No paid tier, event assignment, or special title was inferred. The shared renderer updates the homepage and sponsor directory.

- Frostop: Joe’s Gmail message `1a159b5c0ca37714` says “Website only no booklet.” The supplied 151 × 132 PNG was inspected; the sharper, original vector wordmark was isolated from `Frostop_Ad_QuarterPg_Oct2025_v1.pdf` into `images/partners/frostop-logo.svg`. Ad imagery, copy, crop marks and unused image data were removed; original logo paths and colors were preserved. No website URL was confirmed, so no link was added.
- Squeaky Clean NEO: Joe’s Gmail message `1a15567e0cc58aa9` supplied Kim’s `SCNEO_Quarter_Page_Ad_QR_300dpi.jpg` (675 × 1125). Its complete circular logo was cropped at `(171, 60, 504, 391)` and losslessly encoded as `images/partners/squeaky-clean-neo-logo.webp` (333 × 331). `https://squeakycleanneo.com/` is printed on the supplied artwork and was verified against the company website.

Both original threads and an October 18 onward mailbox search were checked before editing; no newer completion was found. The existing shared presentation uses decorative empty image alt text beside the visible sponsor name, with an accessible name on linked identities. Artwork is contained with `object-fit: contain`.

`npm test`, lint, formatting, and typecheck pass. Browser inspection of both shared listings at 1440px and 390px confirmed one instance per sponsor, successful image decoding, natural aspect ratio containment, and no document overflow. Existing functional/accessibility checks and production verification are recorded in the completion report.

No booklet, marketing packet, raffle, analytics, or unrelated content was changed. Original attachments, QA JSON, test logs, and desktop/mobile captures are retained outside the repository in `output/sponsor-logos-20261020` in the task workspace.
