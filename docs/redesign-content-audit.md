# NEOChosen redesign content audit — September 29, 2026

This inventory describes the combined local branch from PRs #96 and #97. It is a content baseline for Figma, not approval to change event facts. The original PRs and live Cloudflare deployment are unchanged.

## Latest implementation and user corrections

The interior redesign is complete locally. Caleb's September 30 corrections are implemented: donation-led dinner invitations (one per $200, subject to space), removal of the homepage visitor section, Explore Weekend targeting “Find your moment.”, eight supplied/requested partner logos, removal of repeated media labels and unrelated sponsorship credits. Joe's September 28 approved copy establishes the donation benefit; his September 29 direction establishes individual reservations. Both are reflected in the current copy. See [current full-site review](fullsite-redesign-review-2026-09-30.md) for sources and verification. Sections below retain the earlier audit state and are not the current implementation checklist.

## Full-site review update — September 30, 2026

The approved Concept A homepage and shared navigation, footer, colors, sponsor/event data and image delivery are implemented locally. This is not yet a complete visual redesign of every interior page. Current localhost captures were inspected alongside the earlier reference captures and Joe's September 29 master email and sponsor-treatment follow-up. The functional cleanup in PR #96 and tooling in PR #97 provide the foundation; interior page composition still needs the approved Figma treatment.

| Area | Current state | Next implementation work |
| --- | --- | --- |
| Homepage | Concept A implemented; five experiences, original photographs, separate presenting ribbon and coordinated tiers | Preserve its direction; verify complete sponsor-mark legibility at actual phone size and reconcile new sponsor records |
| Five event pages | Dedicated working routes, shared facts/actions, compatible typography and sponsor credits | Implement complete Figma event layouts: recognizable hero crops, essential facts and sponsor near the first action, guest context, venue guidance, related events and closing action |
| Sponsor directory | Working four-level hierarchy and approved links | Apply the full directory design, approved business descriptions, complete current roster and sponsor-specific display assets |
| Sponsorship landing + eight sections + contact | Readable investments, benefits, audiences, inquiry actions and supporting PDFs | Replace older black/gold layouts with the approved page template, improve comparisons/mobile tables and reconcile actual remaining inventory |
| About / Get Involved | Content shortened; donation, sponsor, dinner and volunteer paths separated | Replace older bold-sans/composite-hero layouts with the approved editorial templates and real organization imagery |
| Donations / dinner | Existing destinations preserved | Separate direct individual dinner reservation from business sponsorship; coordinate wording with Joe's latest invitation direction |
| Media Kit | Grouped by event with downloads and website review dates | Apply press-resource design, publish approved current artwork/true asset revision dates, and synchronize PDF/PNG facts, sponsor marks and QR destinations |
| Social / raffle / utility pages | Working links and fallback contact paths; raffle remains unpublished | Finish matching content/form/confirmation templates and check every visitor path |
| Visitor guidance | Homepage summary and event addresses | Add approved parking, accessibility, arrival and venue-specific policies through a coherent visitor-information pattern |

### Email evidence that changes the earlier open questions

- **Dinner venue is confirmed:** Jessica's September 29 “Dinner Venue change” email explicitly replaces Music Box with Windows on the River, Cleveland. Joe's September 29 master email also marks that website update complete. Correct remaining old external copy and PDFs; do not ask Caleb to reconfirm the venue. [Jessica's email](https://mail.google.com/mail/u/?authuser=calebday1820%40gmail.com#all/1a0edeb58d0988d3).
- **Dinner conversion needs refinement:** Joe's September 29 evening invitation email calls for $200 individual reservations, welcomes someone coming alone/with a spouse/friend, and distinguishes that from Austin's table outreach. The current “Become an Official Event Sponsor” primary label does not communicate that individual-seat action. Verify the existing Zeffy page is the correct individual reservation destination before changing live URLs. Do not promise celebrity seating or private performances. [Joe's invitation direction](https://mail.google.com/mail/u/?authuser=calebday1820%40gmail.com#all/1a0efe2edc2a026f).
- **FNA alternate artwork is available by application:** Todd's September 29 reply says he will supply the appropriate full-logo variant after reviewing intended use. Prepare website mockups and exact dimensions; the existing approved red icon remains the current asset. [Todd's reply](https://mail.google.com/mail/u/?authuser=calebday1820%40gmail.com#all/1a0ef0fdeafc1f7e).
- **Sponsor inventory has new evidence:** Jessica's September 30 booklet map identifies Catholic Cemeteries Association as confirmed paid Silver, Haven of Rest Ministries as a confirmed $250 program advertiser, and Hallow as Official Prayer Sponsor. It also reserves/plans placements for Giving Machine, Ascend Wealth Management, Trinity Commercial Realty and other partners with some sizes/names still pending. These records are not all represented in `scripts/sponsors.json`. Reconcile website recognition obligations, exact names, tiers, approved artwork and public-release status with the team; a program placement alone does not establish a website tier. [Booklet instructions](https://mail.google.com/mail/u/?authuser=calebday1820%40gmail.com#all/1a0f27148945becf).
- **Logo legibility still requires human review:** Joe's September 29 follow-up requires the complete important sponsor identity to remain readable at phone size. The current Great Lakes ribbon is deliberately compact, but its small dealership text remains difficult to read at 390px. Passing automated accessibility/layout tests is not sponsor-brand approval. Request an approved compact lockup if the complete existing mark cannot fit clearly; do not redraw/retype/stretch it. [Sponsor-treatment requirements](https://mail.google.com/mail/u/?authuser=calebday1820%40gmail.com#all/1a0ef25f800aa272).

### Information still needed from Caleb / the event team

1. Official Piano Guys ticket destination, current on-sale state and approved final pricing. The latest reviewed Joe reply still says the ticket link is pending.
2. Approved compact Great Lakes and application-appropriate full FNA variants, Advanced Care artwork, and missing partner assets/descriptions. Existing sources should be retrieved first; do not make Caleb resend available files.
3. Current sponsorship inventory and website recognition obligations for the newly documented sponsors/advertisers; confirm the exact public business names and remaining positions.
4. Approved per-event guest attendance/bios and genuine KHG, venue, community or past-event imagery for the interior pages. The five approved homepage photographs are already available.
5. Venue-approved parking/accessibility/arrival/policy information, public contact details and raffle launch state/rules when ready.
6. Who receives each inquiry, volunteer and newsletter notification, and a coordinated way to verify real delivery before launch. No real submission has been sent.

Implementation can continue with the approved visual direction and verified existing facts while these details are gathered. The branch remains local-only; this review does not authorize any email, push, PR/main merge or Cloudflare deployment.

## Routes and navigation

| Area | Current routes and behavior | Preserve in redesign |
| --- | --- | --- |
| Home | `/`, anchors for events, tickets, performers, sponsors, visitor information | Weekend identity, date, region, sponsor hierarchy, event actions, signup |
| Events | `/vip-dinner/`, `/lakewood/`, `/piano-guys/`, `/fairlawn/`, `/chesterland/` generated at build time | Distinct pages, details, event-specific sponsor credit and actions |
| Sponsors | `/sponsors/` | Four-tier directory and each approved outbound URL |
| Opportunities | `/sponsorship-opportunities/` plus eight generated detail routes with slugs `all`, `weekend`, `piano-guys`, `leadership-breakfasts`, `lakewood`, `meet-and-greet`, `vip-dinner`, and `community` | Investment, audience, benefits, availability and inquiry paths; do not invent missing figures |
| Organization | `/about-us/`, `/get-involved/`, `/donations/`, `/raffle/`, `/media-kit/`, `/social-media-links/` | Mission, distinct participation paths, downloads, social destinations |
| Utility | `/thank-you/chesterland/`, `/thank-you/donor-dinner/`, `/thank-you/fairlawn/`, `/thank-you/lakewood/`, `/giveaway-rules/`, root `.html` redirects | Existing post-registration destinations and legacy redirects |

Shared navigation currently includes Home, Events, About, Get Involved, Sponsors, Sponsorship Opportunities, Media Kit, Tickets and Donate. Desktop menus and a responsive mobile menu are generated by `scripts/site-chrome.mjs`, with behavior in `site.js`. The footer carries site routes, contact, social links and nonprofit identity. Preserve functional destinations while simplifying visual hierarchy.

## Homepage and event facts

The combined homepage contains a shared header and slim Great Lakes recognition, `NeoHeader.webp` hero, weekend introduction, five event experiences, Piano Guys feature, four cast profiles, partner section, visitor guidance, closing action, Zeffy newsletter and footer. The event facts below come from current site source and its approved links; the design may change their presentation.

| Event | Date and time (Eastern) | Venue | Action state | Sponsor role |
| --- | --- | --- | --- | --- |
| VIP Donor Dinner | Fri Nov 13, 5–6:45 PM | Windows on the River, Cleveland | Zeffy sponsorship/dinner invitation | Great Lakes is weekend presenting |
| Evening with Cast Members of The Chosen | Fri Nov 13, 7:30 PM; doors 6 PM | Lakewood Civic Auditorium | Free Zeffy registration | Great Lakes is weekend presenting |
| The Piano Guys Live | Sat Nov 14, 4 PM; doors 3 PM | Akron Civic Theatre | Official theater ticket URL unconfirmed; use ticket updates | FNA Wealth Management is concert presenting |
| Fairlawn Meet & Greet | Sat Nov 14, 7 PM | St. Hilary Church | Free Zeffy registration | FNA Wealth Management and Advanced Care Endodontics present |
| Chesterland Meet & Greet | Sun Nov 15, 2 PM | Mayfield United Methodist Church | Free Zeffy registration | Great Lakes is weekend presenting |

Performer identity: The Piano Guys; Shaan Sharma (Shmuel); Noah James (Andrew); Vanessa Benavente (Mother Mary); Yasmine Al-Bustami (Ramah). Do not fabricate cast attendance at particular event sessions beyond verified page copy.

## Sponsors and assets

`scripts/sponsors.json` is the maintained sponsor source: Great Lakes Auto Group (weekend presenting), FNA Wealth Management and Advanced Care Endodontics (event presenting), Barons Bus (platinum), and Rogish Farms, Down the Block, Casa Rosa, Tour Lake County, This Is The Place, Maggie's Doughnuts and Cafe, Cleveland Diocese, Historic Kirtland Sites, The FEST, and Hallmark Homecare (community partners). Great Lakes, FNA, Barons, Hallmark and Mayfield venue artwork have local files. Advanced Care has no approved local logo and currently uses a text treatment. Some community marks and performer portraits depend on remote hosts. Preserve logo proportions and source artwork.

Local image inventory includes `images/NeoHeader.webp` (the user-supplied composite used on the present homepage), `images/piano-guys-feature.webp`, original `images/hero.png` and `images/hero.webp`, Great Lakes dark/reversed logos, FNA SVG/PNG, Barons logo/photo, Hallmark SVG, Mayfield church logo and favicon. The user also supplied the original Piano Guys photo at `C:\Users\caleb\Downloads\image (10).png`. For new art direction use actual approved photos and crops; do not regenerate or alter people. The composite must not be treated as proof that its individual portraits are unaltered source photography.

## Forms, links, SEO and analytics

- Free event registration and donor dinner point to their existing Zeffy URLs; Piano Guys has no confirmed ticket URL. Avoid promising tickets or prices.
- Homepage newsletter and raffle updates use Zeffy embeds with fallback links. Volunteer uses a public Google Form. The raffle prize form is unpublished; contact email is the fallback.
- Media Kit has event PNG/PDF preview/download pairs and a master sponsorship deck. Downloads predate Great Lakes recognition; the webpage carries current sponsor credits.
- Existing canonical URLs, Open Graph metadata, Event structured data and `noindex,follow` on thank-you pages should survive any implementation. The raffle analytics beacon and `/api/analytics-events` function are present; no sitewide GA or Meta Pixel was found.
- The combined build's local-link check passed 1,197 references across 37 built HTML files. Desktop and mobile browser captures at seven widths and 11 routes had no horizontal overflow. External links can change independently; Advanced Care's site rejects automated requests with HTTP 403.

## Content and experience issues to resolve in design

- Repeated registration actions and sponsor credits create redundancy. Make the event action visible where the experience is presented.
- Standard event cards should expose date, time, venue, city, free/ticketed state, relevant sponsor and CTA without crowding each card with full address and long body copy.
- Give The Piano Guys and four cast members substantial photography, avoiding tiny profile cards.
- Distinguish weekend presenting recognition from event presenting, platinum and community levels. Avoid equally sized logo boxes.
- Eight sponsorship sections need readable web layouts and real benefits/investment fields, rather than image-only PDFs.
- About, Get Involved and Media Kit should have distinct task-focused structures; Donate, Sponsor, Volunteer and Donor Dinner should remain separate actions.
- Review 320, 375, 390, 430, 768, 1024 and 1440px layouts. Existing PR #96 homepage/event kicker text has serious automated contrast findings; address this in the approved design and implementation.

## Factual content to preserve vs. design to change

**Preserve:** names, dates, times, venues, sponsor contracts/roles, approved logos, registration URLs, missing-ticket state, legal and organization copy, download assets, route compatibility, form integrations, structured data and analytics behavior.

**Can change in Figma:** scale, typography, composition, color, photography crop, section pacing, card layout, responsive navigation, sponsor display, CTA hierarchy, page density, and how details are progressively revealed.

## Open editorial questions

1. Resolved September 30: Jessica explicitly confirmed Windows on the River. Remaining Music Box references in older collateral and Zeffy copy require cleanup.
2. Official Piano Guys ticket URL and price are unconfirmed. Keep a ticket-update action.
3. Approved Advanced Care/full FNA variants and refreshed Great Lakes media-kit artwork remain needed. Original cast photographs were recovered and are used individually.
4. Confirm final brand spelling (`NEOChosen` versus `NEO Chosen Weekend`) and contract-specific sponsor labels before publishing revised collateral.
5. End-to-end form delivery has not been tested with real submissions.

Related detailed audits: [site audit](site-audit-2026-09-29.md) and [homepage audit](neochosen-homepage-audit.md).

## Implementation update — September 30

The local full-site implementation addresses the layout and route gaps above. Dinner information now uses Windows on the River and individual reservations at $200/person. Jessica’s latest confirmed Silver/prayer/program-advertiser relationships are included with separate labels. See [full-site implementation review](fullsite-redesign-review-2026-09-30.md) for completed pages, source evidence, tests and remaining publication dependencies.
