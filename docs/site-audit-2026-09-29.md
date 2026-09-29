# NEOChosen website audit and review notes — September 29, 2026

This review follows Joe's September 29 master task email and the site edits requested by the site owner. The open homepage redesign remains the visual reference. No pull request merge or production deployment is part of this change.

## Routes and integrations preserved

| Area | Current behavior and work completed |
| --- | --- |
| Homepage | Preserved `NeoHeader.webp`, existing hero, event lineup, sponsor hierarchy, newsletter embed, footer, and primary anchors. Added a slim Great Lakes Auto Group ribbon under navigation and five consistent event-detail links. |
| Events | Kept `/chesterland/` and generated matching `/vip-dinner/`, `/lakewood/`, `/piano-guys/`, and `/fairlawn/` pages. The free Zeffy registration links remain on the three public events. VIP dinner keeps its sponsor invitation link. Akron remains “tickets coming soon” until the theater provides an official link. |
| Sponsorships | Kept the landing page, contact page, all eight opportunity routes, master deck, individual PDFs, summary images, and artwork specifications. Added readable HTML investments, audience, benefits, availability and inquiry details to each opportunity page. |
| Directory | Kept confirmed Great Lakes, Barons Bus, FNA Wealth Management, Advanced Care Endodontics, and community partner records. Kirtland Heritage Group and The Piano Guys now appear in their organizer/performer roles rather than as community sponsors. |
| Forms | Retained the Zeffy homepage and raffle update embeds and fallback links. The public Google volunteer form responded with HTTP 200 and is now linked from one maintained volunteer section. Removed the duplicate on-site volunteer submission form from Donations. The raffle prize form remains unpublished; a working email contact path is available. |
| Legacy routes | Root `.html` redirect documents and `_redirects` remain. All thank-you paths and donation flow routes remain. |
| SEO | Normalized primary canonicals to `neochosen.com`. Preserved homepage Open Graph tags and restored Event structured data and social metadata on Chesterland while extending it to four new event pages. Thank-you pages retain `noindex,follow`. |
| Analytics | No sitewide Google Analytics or Meta Pixel implementation was found in source. The existing raffle interaction beacon and `/api/analytics-events` handler were retained; its mocked function test passes. |
| Assets | Kept original artwork and downloadable files. Media kit PNG/PDF pairs were compared by rendering each PDF page at preview size; each paired preview matched closely. The old media-kit sponsorship packet card now points to the current master sponsorship overview. |

## Verification

- `npm run build`, `check:events`, `check:site-chrome`, `check:local-links`, `check:sponsorships`, `check:raffle`, and `test:raffle-functions` pass.
- The local link check resolved 1,166 page, asset, and anchor references across 37 built HTML files.
- Browser review at 1440px and 390px across ten key routes found no horizontal overflow, broken loaded images, or JavaScript exceptions. The sponsorship tables and tiered directory were inspected at both sizes.
- The principal Zeffy registration links, Great Lakes, FNA, Barons, Facebook, Instagram, and the homepage newsletter URL responded with HTTP 200. Advanced Care Endodontics returned HTTP 403 to automated requests, so its site could not be verified by this check.

## Source items requiring Joe's confirmation

1. **VIP dinner venue in external materials.** The current homepage, media flyer, and the top of the Zeffy registration page list Windows on the River. The VIP sponsorship PDF lists Music Box Supper Club. Lower copy on the same live Zeffy page also says Music Box. The website event route follows the current flyer and top registration details; Joe should correct the older PDF and Zeffy copy before sharing them broadly.
2. **Akron theater tickets.** No official Piano Guys ticket URL was confirmed. The site keeps a ticket-update CTA and does not link to an unrelated theater event.
3. **Sponsor logo and business descriptions.** The broken remote Advanced Care logo was replaced with a text treatment. The approved legal logo asset and approved business descriptions for community partners should be supplied before adding new promotional claims.
4. **Media kit sponsor artwork.** The downloadable event flyer files predate Great Lakes recognition. The media kit webpage now carries current sponsor credits by event, but the original PDFs and PNGs were preserved. Updated approved printable artwork is needed if Great Lakes recognition is required inside every download.
5. **Live form submission.** The volunteer and Zeffy forms were opened and checked for reachable destinations. No real submission was sent during QA, so delivery to Joe's inbox remains an end-to-end check for the site owner.

The Great Lakes desktop and mobile opening previews are in `docs/review/great-lakes-homepage-preview-desktop.webp` and `docs/review/great-lakes-homepage-preview-mobile.webp`.
