# NEOChosen 2026 Figma design review

**Status:** Caleb approved Concept A and the slim, separate sponsor ribbon on September 30, 2026. Implementation is authorized only on local branch `codex/private-figma-redesign`; push, PR merge, main merge, and deployment remain prohibited. See [implementation review](implementation-review-2026-09-30.md).

## Figma source

- [Figma file — NEOChosen — Website Redesign 2026](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx)
- [Review board: current combined homepage vs proposed direction](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=24-2)
- [Desktop prototype flow](https://www.figma.com/proto/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=23-2)
- [Mobile prototype flow](https://www.figma.com/proto/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=23-270)

The Figma file contains the requested 15 named pages, 12 text styles, 29 semantic variables in three collections, reusable components including Button/EventCard/SponsorCredit variants, three editable desktop homepage directions, a candidate homepage, page templates, mobile layouts, reference/review boards, and a clickable prototype. Components and tokens are drafts; publish a team library only after approval.

## Three directions

| Direction | Figma frame | Intent |
| --- | --- | --- |
| A — Cinematic Festival | [Desktop](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=7-2) | Dark identity panel; original Piano Guys photograph plus separate cast portraits; direct five-event schedule; dedicated concert moment; ranked sponsor hierarchy. |
| B — Premium Editorial | [Desktop](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=9-2) | Spacious serif title over a panorama; asymmetric editorial event grid; restrained neutral surfaces. |
| C — Warm Community Event | [Desktop](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=11-2) | Warm collage composition, visible cast strip and compact two-row event program. |

**Approved direction:** A, with the slim separate Great Lakes ribbon. Its photographic hierarchy best supports an event-first homepage while giving Great Lakes clear weekend-level recognition. [Approval-pending candidate](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=21-33) is deliberately labeled as such; the page name is a reserved workflow destination, not a claim of approval.

## Great Lakes recognition options

| Treatment | Desktop | Mobile |
| --- | --- | --- |
| Integrated into hero | [Option A](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=29-2) | [Option A](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=31-2) |
| Slim premium ribbon (recommended) | [Option B](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=29-25) | [Option B](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=31-17) |

Both use approved logo artwork. The recommended ribbon keeps sponsor recognition readable without competing with the event identity or portraits.

## Page and mobile templates

- [Homepage mobile 390px](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=14-2), including event/sponsor/footer composition.
- [The Piano Guys event page](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=16-2) and [mobile event page](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=22-2).
- [Sponsor directory](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=17-2) and [mobile directory](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=22-27).
- [Eight sponsorship opportunity sections](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=18-2) transcribed from the approved 2026 package content; unconfirmed live inventory is visibly marked `CONTENT REQUIRED`.
- [About](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=19-2), [Get Involved](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=19-28), [generic content template](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=19-71), [Media Kit](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=20-2), [mobile participation and form controls](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=22-57), and [mobile menu](https://www.figma.com/design/Rcy1fLtuWlaQ6XMeLAjIxx?node-id=22-89).

Prototype links cover desktop home → Piano Guys event → sponsors, the confirmed Lakewood Zeffy registration action, and mobile home → menu/event/sponsors. No unconfirmed Piano Guys ticket URL is linked.

## Source and quality notes

- [Content audit](redesign-content-audit.md) and [reference analysis](reference-site-analysis.md) are the factual baseline. Summerfest blocked automated visual capture; its official sponsor-tier page text was reviewed and the limitation is visible in Figma.
- The original user-supplied Piano Guys photo is used via the current site's optimized image. Existing cast portraits are separate image assets; their original photography and permissions should be confirmed before final publication. No people were regenerated or altered for this design.
- Great Lakes printable Media Kit files remain outdated. Their Figma previews are labeled with a currency note rather than silently edited.
- The approved local implementation passes the build, source checks, Storybook build, all 20 browser tests, and responsive overflow captures. The earlier serious kicker contrast failures are fixed. Final Lighthouse accessibility scores are 100 on all three measured routes; homepage performance is 98 with a 2.3-second LCP. See the implementation review for complete evidence and measurement limits.
- The Figma mobile source is designed at 390px. Implementation was verified at 320, 375, 390, 430, 768, 1024 and 1440px, with an additional 1200px navigation check.

## Approval received

Caleb explicitly approved Concept A and the separate slim Great Lakes ribbon on September 30, 2026. The approval supersedes the pre-code checkpoint recorded above. Local implementation is complete; publication is still outside the approval. Figma's older approval-pending annotations are design history. Confirm the VIP dinner venue, official Piano Guys ticket destination, approved Advanced Care logo, cast portrait originals and refreshed sponsor artwork before publishing changed collateral.

The integration branch `codex/private-figma-redesign` exists only in the local worktree because the GitHub repository is public. Both source PRs remain open; production Cloudflare Worker version `f752694d-4a7c-4b33-b851-2f286875820a` remains the latest listed deployment at 100%.
