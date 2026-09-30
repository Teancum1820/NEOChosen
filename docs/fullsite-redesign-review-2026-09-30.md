# Full-site redesign review — September 30, 2026

## Local review status

Implementation is on `codex/private-figma-redesign`, with no upstream. No pull request was merged and no branch was pushed. A separate review Worker is hosted for Joe and is accessible without a password at Caleb's request; the production Worker and its routes were not changed. The requested production pin `f752694d-4a7c-4b33-b851-2f286875820a` was verified at 100% before and after creating the review on September 30.

Preview: http://127.0.0.1:4173/ . The preview server binds to loopback.

Shareable review: https://neochosen-joe-review.calebday1820.workers.dev/ . No password is required. Anyone with the URL can view it; noindex headers remain enabled.

The approved Concept A hero and sponsor ribbon are preserved. At Caleb's request, the “Five gatherings. One region.” visitor section is removed and the Explore Weekend navigation button targets `/#events` (“Find your moment.”). Dinner information now leads with the donor benefit: each $200 donated includes one dinner invitation, while space remains. Confirmed Silver, prayer, and program-advertiser recognition is included in the coordinated sponsor directory.

## Implemented pages

- All five event detail pages: split photo and identity, date/time/venue/admission band, correct presenting relationships, experience, arrival guidance, venue links, related events, and direct registration/update actions.
- Sponsors: Great Lakes gold feature with Julia's supplied full black artwork, event presenters, Barons Platinum, Silver, Official Prayer Sponsor, compact community partners, and separately labeled program advertisers. Hallmark's phone number was removed at Caleb's latest request.
- Sponsorship landing: eight alternating editorial rows exposing investment, audience, benefits and availability. All eight detail routes retain readable tables and benefits, original approved PDF/PNG assets, and contact controls. Desktop PDF previews load when approached; mobile visitors have direct download links.
- About: photo introduction, mission, community work and participation action.
- Get Involved: separate Donate, Sponsor, Volunteer and individual Donor Dinner paths.
- Donations: Venmo, Stripe and check destinations/address preserved; the donor dinner form supports individual giving/registration. Supporters giving another way are directed to the team to arrange their dinner invitation.
- Media Kit: Figma asset-grid layout and optimized web previews; original download URLs retained. Repeated artwork labels, the page-level artwork note and the Media Inquiries section are removed at Caleb's request.
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
| Joe approved donor copy, Sep 28 (`1a0ea24173aba0cb`) | A $200 donation includes one dinner invitation; $400 includes two, while space remains. The donor framing supports the weekend's free public events. |
| Joe individual dinner direction, Sep 29 (`1a0efe2edc2a026f`) | $200/person, individual reservations, dinner/conversation/mingling, direct dinner destination, no attendance count or guaranteed celebrity seating/private performance. |
| Jessica program planning, Sep 30 (`1a0f27148945becf`) | Catholic Cemeteries Association confirmed Silver; Hallow Official Prayer Sponsor; Haven of Rest Ministries confirmed program advertiser. Planned ad placements are not inferred to be website sponsorship tiers. |
| Caleb's sponsor update and Joe's quoted request, Sep 10 (`1a08d0bb1638af45`) | Hallmark Community recognition and 216-390-1090. |
| Joe ticket update, Sep 29 (`1a0eec8126f1586e`) | Official Piano Guys purchase link was still pending. New email and official theater searches did not supply a verified link. Keep updates CTA and omit speculative pricing. |

## Venue research and photography

- [Akron Civic history](https://akroncivic.com/history), [parking](https://akroncivic.com/parking), [accessibility](https://akroncivic.com/accessibility-information): venue context and official visitor links. An initially discovered `/accessibility` link returned 404 and was corrected.
- Previous [Akron auditorium photograph](https://commons.wikimedia.org/wiki/File:Akron_Civic_Theatre,_house_view_from_balcony.jpg): Nat Napoletano, May 2013, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). Its archived derivatives retain that license. The event page now uses Caleb's supplied replacement photograph, with a venue-name caption rather than carrying the previous photograph's author credit onto a different image.
- [Windows on the River](https://www.windowsontheriver.com/) and [spaces](https://www.windowsontheriver.com/spaces/): waterfront/Powerhouse context, official address and room photography. Caleb supplied two replacement photographs for the dinner page: the close view of dining tables is the main image, and the wider room view is in the lower venue section. Venue credit and example-layout qualification remain visible.
- [Lakewood guest services](https://lkwdcivicauditorium.lakewoodcityschools.org/guest-services): ramp, ADA seating, assisted listening and North Lot guidance.
- [St. Hilary visitor information](https://sthilarychurch.org/belong/im-new/): address, directions and hearing-loop context. Event-specific arrangements remain organizer questions.
- [Mayfield United Methodist Church](https://www.mayfieldchurch.org/): host identity, street address and visitor destination.

No generated venue scenes, modified performer likenesses, or inferred celebrity access were added. Original performer images are served responsively as AVIF/WebP. Caleb explicitly requested the two stylized sign-based partner wordmarks below.

## Caleb's supplied logos and corrections

- Advanced Care: [supplied source](https://www.acendodontics.com/wp-content/uploads/sites/478/2013/03/Harris-Logo-e1363376953680.png). The original URL initially returned 403; the same source with `?download=1` returned the logo successfully. Stored as `images/partners/advanced-care.webp`.
- Catholic Cemeteries: [supplied source](https://www.clecem.org/img/Logos/CCA_Main_Logo.png), stored as `images/partners/catholic-cemeteries.webp`. Silver recognition has a wider display to keep the full name readable.
- Hallow: Caleb's attached `codex-clipboard-edc800f3-bde3-470b-9629-eda810c5bdbe.png`, copied unchanged to `images/partners/hallow.png`.
- Tour Lake County: [supplied source](https://images.squarespace-cdn.com/content/v1/65049ab99a8f8f0a19e6b4ac/212b3ba0-98fa-4244-9110-f0d7eef88f7b/White+Outline+Main+Logo.png?format=1500w), replacing the previous local derivative.
- The FEST: [supplied 2026 source](https://thefest.us/wp-content/uploads/2026/07/The-FEST-2026-white.webp). Original white artwork retained locally. `images/partners/fest-black.svg` embeds that exact source and uses an SVG color filter for black, preserving its silhouette, transparency and date text.
- Haven of Rest: [supplied source](https://havenofrest.org/wp-content/uploads/2024/03/HRM-COLOR-logo-e1764394898440.png), stored as `images/partners/haven-of-rest.webp`. The “Confirmed program advertiser.” sentence is removed; its documented program-advertiser placement remains.
- Historic Kirtland: native `images/partners/historic-kirtland.svg`, based on Caleb's attached Visitors' Center sign, retaining its serif lettering, green sign and slim rules.
- This Is The Place: native `images/partners/this-is-the-place.svg`, based on Caleb's attached screenshot, retaining the uppercase serif name and italic Bookstore and Gift Shop line.
- Great Lakes' generic weekend credit is removed from all eight sponsorship detail pages and the unrelated Media Inquiries footer. Event credits, the approved homepage ribbon and sponsor directory remain.
- The two sign-based SVGs are requested website treatments; they are not represented as organization-supplied official brand files.

## Latest preview polish

- Fairlawn now uses Caleb's first St. Hilary stained-glass photograph as its main image and the second “Come Follow Me” detail in the lower venue section. Its red placeholder is removed. Original PNGs are preserved in `source-assets/venues/`; responsive WebP derivatives are capped at the supplied resolutions. The main crop focuses on the figure at the left of the wide artwork. Static checks, lint and the existing Fairlawn accessibility check pass. Review captures are in `artifacts/fairlawn-update/`.

- Piano Guys Live retains the supplied performer photograph with its red placeholder label removed. Caleb's new Akron Civic Theatre interior photo replaces the lower venue image and its placeholder. The original is preserved in `source-assets/venues/`; 480/800px WebP derivatives respect the original resolution. Static checks and lint pass, along with four existing ticket behavior and accessibility tests. Local and hosted checks at five widths verify both images, no placeholders, no overflow and the concert on-sale dialog. Captures are in `artifacts/piano-photo-update/`. Only the review Worker was updated; production is still pinned at `f752694d-4a7c-4b33-b851-2f286875820a` at 100%.

- Lakewood now uses Caleb's supplied auditorium interior as its main image and the supplied exterior photograph in its lower venue section. The main placeholder label is removed. Original PNGs are preserved in `source-assets/venues/`; responsive WebP deliveries respect each photograph's original resolution (1280px interior, 512px exterior). Static checks, lint and the Lakewood/dinner/concert accessibility checks pass. Local and hosted reviews at 320/390/768/1024/1440px verify image order, successful loading and no overflow. Captures are in `artifacts/lakewood-update/`. Only the review Worker was updated; production remains pinned to `f752694d-4a7c-4b33-b851-2f286875820a` at 100%.

- VIP Donor Dinner now uses both Caleb-supplied Windows on the River photographs in the requested order, replacing its main and lower venue placeholders. Originals are preserved in `source-assets/venues/`; responsive WebP deliveries are 480/960/1110px wide. Static checks, lint and the existing dinner accessibility test pass; local and hosted checks at five widths confirm both photos load, correct order, no remaining dinner placeholders and no overflow. Captures are in `artifacts/dinner-update/`. Only the separate review Worker was updated; production is still pinned to `f752694d-4a7c-4b33-b851-2f286875820a` at 100%.

- About Us now displays the existing official Kirtland Heritage Group logo linked to its website, plus Caleb's supplied community gathering photo. The original PNG is preserved in `source-assets/community/`; 480/960/1600px WebP derivatives provide responsive delivery. The complete photograph is shown without cropping on desktop and mobile. The red placeholder label is removed only from About Us. Local checks pass across 320/390/768/1024/1440px, with the existing About accessibility check, lint and static link/event/sponsor checks passing. Captures are in `artifacts/about-update/`.

- Larger Great Lakes artwork in the homepage ribbon and partner directory; larger Barons Bus artwork in the homepage directory.
- Lake County artwork has a white display box on the homepage and no display box on the Sponsors page.
- Sponsors-page boxes removed for Haven of Rest, Barons Bus and Hallow. CSS multiply compositing removes the white backgrounds within the Haven/Barons files against the page surface while preserving the supplied original assets.
- Facebook and Instagram icons are visible in the persistent top navigation at mobile and desktop widths.
- The large red “PLACEHOLDER” label remains only on the Chesterland event hero photograph. About Us, both dinner images, Lakewood, Piano Guys Live and Fairlawn use Caleb's supplied or approved photographs. Homepage images remain as supplied.
- Verification: static build and link/sponsor checks passed; 29 functional/accessibility tests passed; 45 additional route/width checks across 320, 390, 768, 1200 and 1440px passed. Reviewed captures are in `artifacts/preview-polish/`. Header and ribbon visual baselines are updated to the requested appearance.

## Verification

### Concert ticketing and shareable review

- Joe's September 30 ticket email (`1a0f2edd2bbe227b`) supplies `https://www.ticketmaster.com/event/05006538EC473EB4` and Friday's 10 a.m. on-sale announcement. The website now shows Friday, October 2 at 10 a.m. and uses “Concert tickets” for the homepage event card, concert feature, closing action and dedicated concert-page actions. No ticket prices are inferred. Automated browsing could not independently read Ticketmaster; the destination is transcribed directly from Joe's email.
- The review is hosted on the separate `neochosen-joe-review` Worker. Password authentication was removed at Caleb's request. It has no production data bindings or custom-domain routes. Review responses retain noindex and private/no-store headers; the review Worker only serves GET/HEAD requests.
- Worker tests verify anonymous page/image/PDF access without sessions or a password secret, preserved errors/redirects and rejection of write requests.
- Concert actions show an accessible dialog: “Concert tickets go on sale Friday, October 2 at 10 a.m.” Closing restores focus to the trigger; Escape and clicking outside dismiss it. Continue to Ticketmaster retains Joe's destination and opens a new tab. Original anchor destinations remain usable without JavaScript.
- Current checks pass: 1,483 local references across 37 HTML files, static event/sponsor checks, lint, two review Worker tests and 32 functional/accessibility browser tests. Anonymous live review checks verify 12 page views, direct image/PDF/script requests and the dialog at 390/1440px. Popup captures are in `artifacts/concert-popup/`. The obsolete remote password secret and its ignored local copy were deleted. Production remains pinned at `f752694d-4a7c-4b33-b851-2f286875820a` at 100% after updating the review.
- Static checks cover 1,455 local references across 37 HTML files. Functional/accessibility checks pass (29 tests). Two visual baselines have only fractional-position/one-pixel capture adjustments following the longer concert status and feature text; header, hero and sponsor-ribbon artwork remains unchanged.

### Regional footer and Lakewood recognition

- Homepage Community Partners now use four desktop columns, taller 78px logo areas and slightly larger names. The two-column mobile arrangement is retained.
- Every shared site footer now has an original navy-and-gold, Cleveland-inspired skyline SVG with layered towers, a bridge and water reflections. It is a decorative illustration, not venue photography. A dark overlay preserves the existing link contrast; mobile sizing anchors the skyline beneath the contact and copyright area.
- Lakewood now has the same large organizer/presenting recognition treatment as Chesterland: the supplied KHG mark under “Presented by” and Great Lakes under “NEO Chosen Weekend Presenting Sponsor.”
- Ten rendered route/width checks at 320, 390, 768, 1024 and 1440px confirm the footer treatment, Lakewood logo delivery and no horizontal overflow. Reviewed desktop/mobile captures are in `artifacts/regional-footer/`.
- Static checks cover 1,460 local references across 37 HTML documents. Lint and all 33 browser tests pass; the reviewed desktop footer screenshot baseline is refreshed for this requested design change.
- Changes remain local on `codex/private-figma-redesign`; no pull request was merged and nothing was pushed or deployed.

### Latest event-logo refinements

- Homepage: Haven of Rest's white raster background is composited into the light card surface; mobile Great Lakes recognition now uses a centered, full-width logo treatment. The mobile partner-directory logo is also larger.
- Sponsors: FNA and Advanced Care logo display heights increased from 85px to 170px, preserving their original aspect ratios.
- Piano Guys: large FNA and Great Lakes logo cards with their respective concert/weekend roles.
- Fairlawn: large FNA, Advanced Care and Great Lakes logo cards with accurate event/weekend roles.
- Chesterland: Kirtland Heritage Group organizer and Great Lakes weekend presenting logo cards. The KHG mark is the unmodified [official website header asset](https://kirtlandheritagegroup.com/_astro/logo-landscape-transparent.DqsBXB6H_Z2vuHJu.webp), saved as `images/partners/kirtland-heritage-group.webp`.
- 25 rendered checks at 320, 390, 768, 1024 and 1440px verify logo delivery and no horizontal overflow. Captures are in `artifacts/event-logo-updates/`. The former 110px mobile sponsor-ribbon limit is updated to 220px for Caleb's requested larger treatment; the reviewed mobile ribbon baseline is refreshed.

- Static build, all sponsorship checks, shared chrome, 1,458 local links/anchors/assets across 37 HTML documents, event facts/sponsors, raffle coming-soon state and mocked raffle handlers pass.
- 196 rendered captures: all 28 content pages at 320, 375, 390, 430, 768, 1024 and 1440px. No horizontal overflow, missing local images, page exceptions or missing H1s. Captures explicitly wait for fonts and image decoding; earlier quick captures made before image decoding are not final evidence.
- All 33 browser tests pass. The suite covers functional navigation and destinations, desktop accessibility, mobile interior templates/tables, and approved homepage/sponsor screenshots. Automated checks submit no real registrations, donations or email.
- Following Caleb's corrections, all 33 tests passed again without changes to screenshot baselines. Additional rendered checks at 390px and 1440px verify all eight added/replaced logos load, no horizontal overflow, removal of the visitor section and media labels, the Explore Weekend anchor, and removal of irrelevant sponsorship credits. Captures are in `artifacts/partner-updates/`.
- Visual baselines were updated only for the reviewed new Great Lakes feature and a one-pixel homepage footer capture-height shift. Homepage hero, header and separate ribbon baselines remain unchanged.
- Lighthouse mobile simulation: homepage 97 performance / 100 accessibility / 100 best practices / 100 SEO (LCP 2.3s); sponsors 95/100/100/100 (1.9s); Chesterland 99/100/100/100 (1.8s). These are local synthetic results, not real-user metrics.
- Lint and tooling typecheck are part of the local verification. New page generators and capture/optimization helpers are included in lint coverage.

## Remaining content dependencies before publication

1. Resolved September 30: Joe supplied the Piano Guys Ticketmaster purchase link and Friday 10 a.m. on-sale information; the link and announcement are integrated. Ticket prices and seating are referred to Ticketmaster.
2. Supplied full FNA variant. Advanced Care, Catholic Cemeteries, Hallow, Lake County, The FEST and Haven of Rest artwork are now supplied by Caleb and integrated. Great Lakes' existing approved black/white artwork is usable; no blue version was found.
3. Refreshed print flyers/schedule carrying the corrected dinner venue and current presenting credits. Original files remain unchanged; the media-kit artwork note and repeated labels have been removed at Caleb's request. This pass did not rewrite approved PDF artwork.
4. Resolved September 30: Caleb supplied and approved two Windows on the River replacement photographs; both are integrated on the dinner page.
5. Real organizer-controlled delivery tests for external Zeffy/Google forms and final launch review. No real submission was made in this task.

No additional event information was requested from Caleb because the available email and existing approved assets supplied the facts used here.
