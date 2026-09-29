# Image audit

Run `npm run images:audit` to reproduce the file metadata audit. It inspects local `images/`, `media-kit/`, and sponsorship summary files, plus raw homepage `<img>` markup. This is a source audit; remotely hosted images need manual review.

| Finding | Evidence | Follow-up |
| --- | --- | --- |
| Heavy hero | `images/hero.png` is 2,420,647 bytes at 1448×1086 | Review an approved WebP/AVIF variant and responsive source selection in the redesign. |
| Oversized favicon | `images/favicon.png` is 2,174,806 bytes at 1254×1254 | Export smaller favicon sizes after artwork approval. |
| Large downloads | Eight media-kit PNGs range from about 1.5–3.0 MB | Keep downloadable originals; optimize only preview thumbnails if needed. |
| Large sponsor logos | Great Lakes black/white PNGs are each about 0.83 MB at 5385×2390 | Preserve approved source artwork; consider separately approved display derivatives without stretching/recoloring. |
| Missing dimensions | All five raw homepage `<img>` elements omit `width` and/or `height` | Add intrinsic dimensions when touching these components in the redesign to reserve layout space. |
| Missing alt | None of the five raw homepage `<img>` elements lacked an `alt` attribute | Continue checking whether each value describes its purpose, including remote art. |
| Exact duplicates | No duplicate hashes in the scanned local directories | Keep auditing when new assets arrive. |

The scanner cannot reliably determine photographic quality, aspect-ratio distortion in CSS, or whether remote images are sufficiently large for each viewport. Visual QA must inspect those cases, especially the 390px sponsor view and hero focal point. Do not AI-modify artist/cast photography or alter sponsor logos. `npm run images:optimize` writes optional WebP and AVIF hero variants to ignored `artifacts/optimized-images/`; it never overwrites an original or changes a production page.
