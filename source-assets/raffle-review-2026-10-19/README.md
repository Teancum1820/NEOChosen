# Raffle graphics — October 19, 2026

**DRAFT REVIEW / SALES CLOSED. Local review only.**

Two independently composed, editable SVGs:

- `raffle-square-draft-v1.svg` — 1080 × 1080.
- `raffle-story-draft-v1.svg` — 1080 × 1920.

PNG exports and a contact sheet are in `../../docs/raffle-review-2026-10-19/`.
Reusable standalone QR exports are `../../docs/raffle-review-2026-10-19/raffle-info-qr-v1.svg` and `.png` (740 × 740, same module matrix as the embedded QR). They retain a four-module white quiet zone and error correction Q. The manifest records both files and SHA256; `qr-validation-v1.json` records independent decoding at 740, 370 and 148 px and module-by-module matching to both existing graphic PNGs.
Open the SVGs in Inkscape to edit live Arial text, vectors, and named layers. Both original logos are embedded, so there are no missing image links. The logos are raster originals; typography, shapes and QR modules are editable vectors. Each aspect ratio is composed separately.

## Facts and approval

The October 19 user assignment supplies the package prices ($20/1 ticket, $50/3 tickets, $100/7 tickets), six prize percentages (20%, 6%, 5%, 4%, 3%, 2%; total 40%), November 15, 2026 drawing at 6 PM Eastern, and ticket cutoff at 5 PM Eastern. Existing `source-assets/raffle-preview/public-launch.html` and `official-rules.html` corroborate those proposed terms and the eligible-gross-ticket-sales basis.

The artwork identifies Kirtland Heritage Group as raffle operator. Great Lakes Auto Group appears **only as NEO Chosen Weekend Presenting Sponsor**. No raffle administration, prize guarantee, winner-selection or prize-payment role is assigned to Great Lakes. There is no nationwide eligibility claim. Final terms and eligibility approval remain pending; the draft graphics do not authorize sales.

QR payload is exactly `https://neochosen.com/raffle/`, including the trailing slash. This is an information destination, not a checkout link. Four-module white quiet zone; error correction Q; integer vector module sizes. The validation report records independent decoding of the exported PNGs at full size and at 540 px width.

## Provenance

The brief requests reuse of existing approved artwork. The KHG and Great Lakes logos are reused from the existing website; new design approval remains pending. `asset-manifest.json` records original repository paths, copied paths, SHA256, dimensions, credit and the user-directed approval evidence. No new license terms are inferred.

- KHG original: `images/partners/kirtland-heritage-group.webp`; unchanged copy in `assets/`.
- Great Lakes original: `images/great-lakes-auto-group-black.png`; unchanged copy in `assets/`.
- KHG rendering derivative: `assets/khg-render.png`; lossless container conversion, with identical decoded RGBA pixels. Neither logo is cropped, stretched or recolored.

Navy, gold and ivory are provisional review design choices. Arial regular and bold are installed working fonts, not asserted official brand typography. Fonts are referenced by family, not redistributed; paths and source hashes are recorded. No font substitutions were used. No generated photos or background images were used.

## Rebuild and checks

From the repository root, using PowerShell:

```powershell
& 'C:\Users\caleb\CreativeStudio\apps\python-env\Scripts\python.exe' -m pip install --target 'source-assets\raffle-review-2026-10-19\.deps' qrcode==8.2 zxing-cpp==3.1.1
& 'C:\Users\caleb\CreativeStudio\apps\python-env\Scripts\python.exe' 'scripts\build-raffle-review-assets.py'
```

To regenerate only the reusable QR while preserving the existing graphics and draft banners, append `--qr-only` to the build command. This updates the QR manifest, separate QR validation report and deliverable checksums without resetting the graphic inspection report.

Pillow is available in the CreativeStudio interpreter. `.deps/` is ignored local build support, not a deliverable. Use `--inkscape <absolute executable path>` if needed. The builder writes only the assigned source-assets and docs review folders; its source is the separately assigned script. It does not edit the website, commit, deploy, publish, send or purchase anything.

Rebuilding intentionally replaces this unapproved `v1` review's generated files. Preserve a copy before hand editing, or make a new version. Rebuilding resets recorded visual review to pending because the new render must be inspected again. Automated validation covers actual SVG/PNG dimensions, exact QR payload at two sizes, embedded logos, required text, prize total, package values and Inkscape actual text bounds. Human approval stays DRAFT after all technical checks pass.

The creative-studio skill was read and its social-media route selected Inkscape. Its project/template writers are restricted to the studio root. To honor this assignment's stricter ownership limits, project metadata, original layered SVG construction and Inkscape export are implemented within the three authorized repository paths. No shared template or studio configuration was changed.
