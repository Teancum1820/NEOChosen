# NEOChosen homepage audit (September 29, 2026)

## Stack and preservation points

The site is static HTML/CSS with a Node build (`scripts/build-static.mjs`) that copies pages to `dist`, renders sponsor placeholders from `scripts/sponsors.json`, and replaces navigation/footer through `scripts/site-chrome.mjs`. React and Lucide are build dependencies for shared navigation icons, not the homepage framework. Cloudflare Pages serves `dist`; `_redirects`, `_headers`, `wrangler.jsonc`, Pages functions, D1 and R2 bindings remain in place. The shared `site.js` handles the responsive menu. No homepage analytics script or structured event data was found; raffle analytics lives in its own Pages function. Homepage SEO currently has a title, description, favicon, manifest, and theme color; no canonical or social tags were found.

## Current homepage, in order

1. Shared navigation with Home, Events, About, Get Involved, sponsor and resource menus, Tickets and Donate.
2. Full-screen image hero with The Piano Guys & The Chosen title, three date/location lines, Tickets and Schedule actions.
3. Weekend Schedule intro, large Great Lakes Auto Group and Barons Bus blocks, then Friday/Saturday/Sunday event rows.
4. Piano Guys feature and four Chosen cast cards.
5. Reserve Your Place block repeating event registration links and a raffle link.
6. Zeffy newsletter embed with direct fallback link.
7. Shared footer with routes, contact, social links and nonprofit statement.

## Events, actions, and routes

| Event | Existing time and venue | Existing action |
| --- | --- | --- |
| VIP Donor Dinner, Fri Nov 13 | 5:00–6:45 PM Eastern, Windows on the River, Cleveland | [Zeffy sponsorship/dinner](https://www.zeffy.com/en-US/ticketing/vip-donor-dinner-with-the-chosen-and-piano-guys) |
| Evening with Cast Members from The Chosen, Fri Nov 13 | 7:30 PM, doors 6:00 PM, Lakewood Civic Auditorium | [Zeffy free registration](https://www.zeffy.com/en-US/ticketing/an-evening-with-the-chosen) |
| The Piano Guys Live, Sat Nov 14 | 4:00 PM, doors 3:00 PM, Akron Civic Theatre | No ticket URL yet; existing disabled “Theater Tickets Coming Soon” control |
| Fairlawn Meet & Greet, Sat Nov 14 | 7:00 PM, St. Hilary Church | [Zeffy free registration](https://www.zeffy.com/en-US/ticketing/chosen-and-piano-guys-meet-and-greet-experience-fairlawn) |
| Chesterland Meet & Greet, Sun Nov 15 | 2:00 PM, Mayfield United Methodist Church | [Zeffy free registration](https://www.zeffy.com/en-US/ticketing/chosen-and-piano-guys-meet-and-greet-chesterland); [details](/chesterland/) |

The hero Tickets link points to `/#tickets`, while Schedule and shared Events navigation point to `/#events`. Other homepage routes include `/about-us/`, `/get-involved/`, `/media-kit/`, `/sponsors/`, `/sponsorship-opportunities/`, `/donations/`, `/raffle/`, and `/social-media-links/`. The only dedicated event detail route is `/chesterland/`; the other events use external registration or the homepage schedule. Root `.html` URLs redirect to directory routes. The newsletter is the only homepage form: Zeffy embed plus its direct link and iframe fallback. Preserve that integration exactly.

## Sponsor hierarchy and assets

`scripts/sponsors.json` is the source of truth. Great Lakes Auto Group is weekend presenting; Barons Bus is platinum; FNA Wealth Management presents Akron and Fairlawn; Advanced Care Endodontics presents Fairlawn; remaining records are community partners. The existing schedule renders Great Lakes and Barons as separate large blocks before events, then repeats Great Lakes credits inside Akron and Fairlawn. Event presenters appear as large cards in those rows. Sponsor directory is at `/sponsors/`.

Local assets: `images/hero.png` (approved combined Piano Guys/Chosen artwork, 2.4 MB; optimized WebP added for the homepage), Great Lakes black and white logo variants, Barons logo and photo, FNA SVG/PNG, Hallmark SVG, Mayfield church logo, favicon. Other sponsor and performer images load from third-party URLs. Preserve logo aspect ratios and existing sponsor URLs. The homepage currently lists Kirtland Heritage Group and The Piano Guys in the community partner data although they also serve organizer and performer roles; homepage presentation should distinguish these roles without silently changing the shared sponsor directory data.

## Layout/content issues and open questions

The large sponsor panels interrupt the event sequence, the repeated registration block duplicates event CTAs, and the long schedule creates weak scanning on narrow screens. The hero title describes performers rather than naming NEO Chosen Weekend. Remote cast and sponsor images depend on third-party hosts, and image `onerror` fallbacks rely on `placehold.co`; these should be reviewed if assets are supplied. In local Chrome, Advanced Care Endodontics’ remote logo did not load; the redesign shows its name instead of a broken image while retaining the source URL in `scripts/sponsors.json`. The Piano Guys theater ticket destination is intentionally absent and must remain “coming soon.” The existing text says expected theater prices of $50–$70; verify before publishing a firm price. Current copy uses “NEOChosen”, “NEO Chosen”, and “NEO Chosen Weekend”, plus “The Piano Guys Live” and “The Piano Guys LIVE in Akron”; keep the event facts and flag naming for editorial approval. Sponsor wording in the data uses “Platinum Sponsor of NEOChosen 2026” and “Presenting Sponsor” for both Fairlawn presenters; confirm exact contracted labels with Joe. Some third-party image links and sponsor URLs may change independently of this repository.

The reused pieces are shared chrome, sponsor data/rendering, sponsor logo containment, registration destinations, performer identity/images, and the Zeffy signup. No existing parking, accessibility, or lodging policies were found, so the visitor section should only state verified venue, registration, and ticket information.
