# Approved media release — October 1, 2026

Caleb authorized publication of the approved Akron/Fairlawn FNA flyers, VIP
Sponsor Dinner flyer, and Master Weekend Schedule only. Historical REVIEW and
PROOF filenames do not appear in public filenames. Original source PDFs were
copied without changing their bytes, logos, sponsor roles, or QR destinations.

The dedicated `codex/approved-media-oct1` worktree starts at published commit
`5a838fe`, verified against the live website ignoring checkout line endings.
The production rollback version before this change is
`dbf90c4d-309f-429e-9732-b36a00b19434`. Previous sources remain in Git at that
commit and tag `archive/media-before-2026-10-01`.

## Website changes

- Four current Media Kit flyer cards, retaining the existing press release.
- Proportional responsive thumbnails rendered from the approved PDFs.
- Exact print labels: `PRINT 11" × 17"` and `PRINT 8.5" × 11"`.
- Primary 11×17 weekend PDF; an actual 8.5×11-inch PDF fitted proportionally,
  with 0.25-inch top/bottom and approximately 0.85-inch side margins. All poster
  text and artwork are retained. Letter print-size rendering is readable;
  11×17 remains preferred for the larger presentation. No redesign was needed.
- Matching flyer sections on `/piano-guys/`, `/fairlawn/`, and `/vip-dinner/`.
  Existing page copy, ticketing links, menus and event metadata are unchanged.
- Content-hash filenames for current PDF/PNG links and responsive previews.
  Existing stable PDF/PNG URLs also serve the approved replacements. Media
  downloads now revalidate; other image-cache rules remain unchanged.
- Removed obsolete flyer cards from the current gallery. Historical files for
  other events remain available at their existing URLs for compatibility.

## Artwork inspection

Both FNA PDFs have no REVIEW • 01 OCT 2026 stamp. Barons Bus is confined to the
Lakewood poster card, using the official transparent logo recorded in the
poster source manifest (SHA-256
`ba5ff04ad7737e281448a894d3486d3ec081df0dbc037faeb7000e5b5d8c8d60`).
No sponsors were added to the dinner artwork. The approved weekend artwork's
existing raffle wording is preserved; the public raffle holding page was not
activated or changed.

All five PDFs were retrieved from the local server, checked against expected
bytes, rendered, and QR-decoded. Every QR resolves to NEOChosen.com. Weekend
page dimensions are 11×17 and 8.5×11 inches. The dinner source retains its
approved 8.75×11.25-inch bleed dimensions.

## Verification and scope

`npm test`, lint and typecheck passed. All 34 functional/accessibility browser
checks passed. Actual desktop and 390px mobile review confirmed loaded,
uncropped images, readable controls and no horizontal overflow on the gallery
and three updated event pages. The print buttons have at least 48px mobile
height. Wrangler production dry-run passed with static assets and no bindings.

The release build changes 13 existing public files and adds 19 media files.
All unrelated build files are byte-identical to the isolated baseline.
Removing the new flyer section and stylesheet from each updated event page
reproduces its existing content (ignoring formatting whitespace).
The private dinner-page rewrite, breakfast page/Google Sheets receiver, Akron
pre-sale variant and Fairlawn combined-photo alternative are excluded.
No Zeffy changes, social posts, paid boosts or messages were made.

Publication and live-file verification are recorded after the deployment below.

Broader inherited checks: `format:check` reports the unchanged published
`tests/browser/functional.spec.mjs` (mixed line endings). Two of four homepage
visual regression checks fail: the footer is 394px versus its 393px snapshot,
and the mobile header differs by 614 pixels. The same failures were reproduced
against the unchanged published baseline. Existing snapshots and unrelated
source were preserved. Two other visual checks pass.

## Published and verified

Production version `84d37750-1c0b-4574-a5ed-e02bf8ec2cb2` serves 100% of
traffic, published at 2026-10-01 22:16:55 UTC from commit `503212b`. The isolated
source branch and recovery tag were pushed; unrelated branches were not merged.

Live Media Kit: https://neochosen.com/media-kit/

All nine current PDF/PNG downloads returned HTTP 200 with correct content types
and exact approved hashes. All five PDFs also downloaded successfully through
the actual browser controls and matched the same hashes. Their live served
files were rendered and QR-decoded again; both weekend dimensions are correct.
Nine stable aliases serve the matching replacements with max-age=0/revalidation.
The live gallery has exactly four cards and the five intended PDF links.

Live desktop and mobile inspection confirmed loaded, uncropped artwork and no
horizontal overflow on the Media Kit and all three related event pages. Final
screenshots are saved here with `live` in their names. Existing homepage,
Lakewood, raffle, shared CSS/JS and service worker content matched the
before-release live copies. Updated event copy matches the previous published
page after removing only the added flyer section/style. The private interfaith
breakfast route still returns HTTP 404.

All requested approved media are published. Private VIP/breakfast draft pages,
Google Sheets integration, Akron pre-sale variant and Fairlawn combined-photo
alternative remain unpublished because they are outside this authorization.
