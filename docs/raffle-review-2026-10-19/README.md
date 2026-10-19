# Raffle graphics review — October 19, 2026

**DRAFT REVIEW / SALES CLOSED. No public release approved.**

| Format | Editable source | PNG export |
| --- | --- | --- |
| Square, 1080 × 1080 | [Square SVG](../../source-assets/raffle-review-2026-10-19/raffle-square-draft-v1.svg) | [Square PNG](raffle-square-draft-v1.png) |
| Story, 1080 × 1920 | [Story SVG](../../source-assets/raffle-review-2026-10-19/raffle-story-draft-v1.svg) | [Story PNG](raffle-story-draft-v1.png) |
| Standalone information QR, 740 × 740 | [QR SVG](raffle-info-qr-v1.svg) | [QR PNG](raffle-info-qr-v1.png) |

The standalone QR uses the identical module pattern embedded in both reviewed graphics. Its exact payload is `https://neochosen.com/raffle/`, including the trailing slash. It has a four-module white quiet zone, error correction Q, and a white background; keep that margin when reusing it. Independent decoding passed at 740, 370 and 148 pixels square. [Standalone QR validation](qr-validation-v1.json) records dimensions, SHA256 and exact module comparisons against both embedded QR codes. The existing square and story files remain byte-for-byte unchanged, including their draft banners. Technical visual review passed; human branding approval remains pending and sales/public release remain closed.

- [Side-by-side preview](contact-sheet-v1.png)
- [Short promotional copy and caption](promotional-copy.md)
- [Source provenance, editing and rebuild instructions](../../source-assets/raffle-review-2026-10-19/README.md)
- [Asset paths and SHA256 manifest](../../source-assets/raffle-review-2026-10-19/asset-manifest.json)
- [Automated validation](validation-v1.json)
- [Visual inspection notes](visual-review-v1.md)
- [Deliverable SHA256 list](SHA256SUMS.txt)

Technical checks passed: exact SVG and PNG dimensions; exact QR payload `https://neochosen.com/raffle/` decoded from both full-resolution PNGs and both 540-pixel-wide reductions; copied logo SHA256 matches; lossless KHG format conversion; embedded images; live editable text; package prices/counts; six percentages totaling 40%; date and Eastern times; operator and presenting-sponsor-only labels; and actual Inkscape text bounds.

Both exported PNGs were visually inspected individually. No clipped text, missing logos, broken QR quiet zones or text collisions were observed. Arial regular/bold rendered without substitution. Human branding, eligibility, final terms and release approval remain pending. Great Lakes recognition applies only to the NEO Chosen Weekend; Kirtland Heritage Group is explicitly the raffle operator.

Changes stay within `source-assets/raffle-review-2026-10-19/`, `docs/raffle-review-2026-10-19/` and `scripts/build-raffle-review-assets.py`. No commit, deployment, publication, sales-setting change, email or purchase was made by this graphics assignment.
