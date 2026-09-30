# Full-site redesign review — September 30, 2026

## Local review status

Implementation is on `codex/private-figma-redesign`, with no upstream. No pull request was merged, no branch was pushed, and no deployment or Cloudflare setting was changed. The requested production pin remains `f752694d-4a7c-4b33-b851-2f286875820a`; its live state was not rechecked during this implementation.

Preview: http://127.0.0.1:4173/ . The preview server binds to loopback.

The approved Concept A homepage composition is preserved. Its shared event data now describes the dinner as individual reservations at $200 per person. Confirmed Silver, prayer, and program-advertiser recognition was added to the coordinated sponsor directory.

## Implemented pages

- All five event detail pages: split photo and identity, date/time/venue/admission band, correct presenting relationships, experience, arrival guidance, venue links, related events, and direct registration/update actions.
- Sponsors: Great Lakes gold feature with Julia's supplied full black artwork, event presenters, Barons Platinum, Silver, Official Prayer Sponsor, compact community partners, and separately labeled program advertisers. Hallmark's requested phone number remains visible.
- Sponsorship landing: eight alternating editorial rows exposing investment, audience, benefits and availability. All eight detail routes retain readable tables and benefits, original approved PDF/PNG assets, and contact controls. Desktop PDF previews load when approached; mobile visitors have direct download links.
- About: photo introduction, mission, community work and participation action.
- Get Involved: separate Donate, Sponsor, Volunteer and individual Donor Dinner paths.
- Donations: Venmo, Stripe and check destinations/address preserved; individual dinner reservations separated from general donation checkout.
- Media Kit: Figma asset-grid layout and optimized web previews; original download URLs retained. Older artwork is clearly labeled rather than represented as newly approved.
- Social, raffle, giveaway rules and four registration confirmations: matching typography, palette and responsive layouts. Confirmation logic, raffle analytics/form hooks, legal text, and noindex metadata remain intact.
- Shared navigation and footer now cover all 28 content pages; legacy redirect documents remain available.

## Email facts used

Only event/sponsor facts relevant to the website were transcribed. Private financial discussions and unrelated email content are excluded.

| Source message | Website decision |
| --- | --- |
| Joe master task list, Sep 29 (`1a0eec2c510fc16a`) | Website priority, coordinated sponsor hierarchy, five event pages and eight readable sponsorship sections. |
| Joe sponsor follow-up, Sep 29 (`1a0ef25f800aa272`) | Great Lakes weekend presenting; FNA concert and Fairlawn; Advanced Care Fairlawn; Barons Platinum. Preserve supplied marks and phone legibility. |
| Julia artwork forwarded by Joe (`1a0d4bf9b2169c8b`) | Supplied black/white Great Lakes artwork; blue version was still being prepared. Existing local derivatives of her PDFs are reused. |
| Jessica venue update, Sep 29 (`1a0edeb58d0988d3`) | Windows on the River, Cleveland, replaces Music Box in current website dinner information. |
| Joe individual dinner direction, Sep 29 (`1a0efe2edc2a026f`) | $200/person, individual reservations, dinner/conversation/mingling, direct dinner destination, no attendance count or guaranteed celebrity seating/private performance. |
| Jessica program planning, Sep 30 (`1a0f27148945becf`) | Catholic Cemeteries Association confirmed Silver; Hallow Official Prayer Sponsor; Haven of Rest Ministries confirmed program advertiser. Planned ad placements are not inferred to be website sponsorship tiers. |
| Caleb's sponsor update and Joe's quoted request, Sep 10 (`1a08d0bb1638af45`) | Hallmark Community recognition and 216-390-1090. |
| Joe ticket update, Sep 29 (`1a0eec8126f1586e`) | Official Piano Guys purchase link was still pending. New email and official theater searches did not supply a verified link. Keep updates CTA and omit speculative pricing. |

## Venue research and photography

- [Akron Civic history](https://akroncivic.com/history), [parking](https://akroncivic.com/parking), [accessibility](https://akroncivic.com/accessibility-information): venue context and official visitor links. An initially discovered `/accessibility` link returned 404 and was corrected.
- [Akron auditorium photograph](https://commons.wikimedia.org/wiki/File:Akron_Civic_Theatre,_house_view_from_balcony.jpg): Nat Napoletano, May 2013, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). Resized and converted to WebP; attribution and license links are displayed with the image. The derivatives retain that license.
- [Windows on the River](https://www.windowsontheriver.com/) and [spaces](https://www.windowsontheriver.com/spaces/): waterfront/Powerhouse context, official address and room photography. Local preview uses `https://www.windowsontheriver.com/wp-content/uploads/2019/08/windows-spaces.jpg`; source credit and example-layout qualification are visible. The official source does not state an open redistribution license; confirm permission for this photo before a public launch.
- [Lakewood guest services](https://lkwdcivicauditorium.lakewoodcityschools.org/guest-services): ramp, ADA seating, assisted listening and North Lot guidance.
- [St. Hilary visitor information](https://sthilarychurch.org/belong/im-new/): address, directions and hearing-loop context. Event-specific arrangements remain organizer questions.
- [Mayfield United Methodist Church](https://www.mayfieldchurch.org/): host identity, street address and visitor destination.

No generated venue scenes, modified performer likenesses, fabricated logos, or inferred celebrity access were added. Original performer images are served responsively as AVIF/WebP.

## Verification

- Static build, all sponsorship checks, shared chrome, 1,436 local links/anchors/assets across 37 HTML documents, event facts/sponsors, raffle coming-soon state and mocked raffle handlers pass.
- 196 rendered captures: all 28 content pages at 320, 375, 390, 430, 768, 1024 and 1440px. No horizontal overflow, missing local images, page exceptions or missing H1s. Captures explicitly wait for fonts and image decoding; earlier quick captures made before image decoding are not final evidence.
- All 33 browser tests pass. The suite covers functional navigation and destinations, desktop accessibility, mobile interior templates/tables, and approved homepage/sponsor screenshots. Automated checks submit no real registrations, donations or email.
- Visual baselines were updated only for the reviewed new Great Lakes feature and a one-pixel homepage footer capture-height shift. Homepage hero, header and separate ribbon baselines remain unchanged.
- Lighthouse mobile simulation: homepage 97 performance / 100 accessibility / 100 best practices / 100 SEO (LCP 2.3s); sponsors 95/100/100/100 (1.9s); Chesterland 99/100/100/100 (1.8s). These are local synthetic results, not real-user metrics.
- Lint and tooling typecheck are part of the local verification. New page generators and capture/optimization helpers are included in lint coverage.

## Remaining content dependencies before publication

1. Verified official Piano Guys ticket purchase link and confirmed prices.
2. Supplied full FNA variant and approved Advanced Care/new partner logo files. Names remain live text where artwork is missing; no substitute identity has been manufactured. Great Lakes' existing approved black/white artwork is usable; no blue version was found.
3. Refreshed print flyers/schedule carrying the corrected dinner venue and current presenting credits. The current media kit explicitly flags its retained supplied artwork as older material. This pass did not rewrite approved PDF artwork.
4. Permission for the Windows on the River room photo, or an organizer-supplied replacement.
5. Real organizer-controlled delivery tests for external Zeffy/Google forms and final launch review. No real submission was made in this task.

No additional event information was requested from Caleb because the available email and existing approved assets supplied the facts used here.
