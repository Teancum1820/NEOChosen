# Sponsor recognition review

The shared sponsor records in `scripts/sponsors.json` drive the homepage ribbon, event credits, directory, media kit, sponsor opportunity pages, and Fairlawn confirmation credit. The directory shows weekend presenting, event presenting, Platinum, then community partners. The treatments use the structural hierarchy of [Summerfest](https://www.summerfest.com/sponsors/) and the card information approach described for [The FEST](https://thefest.us/sponsors/), with NEOChosen's own visual design.

| View | Desktop | Mobile 390px |
| --- | --- | --- |
| Great Lakes homepage ribbon | [Desktop ribbon](1440-ribbon.png) | [Mobile ribbon](390-ribbon.png) |
| Piano Guys event card | [Desktop card](1440-piano-guys.png) | [Mobile card](390-piano-guys.png) |
| Fairlawn event card | [Desktop card](1440-fairlawn.png) | [Mobile card](390-fairlawn.png) |
| Full sponsor directory | [Desktop directory](1440-directory.png) | [Mobile directory](390-directory.png) |

[Desktop and mobile hierarchy comparison](sponsor-hierarchy-desktop-mobile.png)

The approved FNA red icon appears beside the full live company name, following Todd's supplied-artwork note in the repository. An approved full FNA wordmark and an approved Advanced Care Endodontics logo are not in the repository. Advanced Care is displayed by its name and role until that artwork is supplied. The existing community logos are remote assets; they fall back to the company name if their hosts fail.

Chrome checks covered the homepage and directory at 320, 375, 390, 430, 768, 1024, and 1440px, and Piano Guys, Fairlawn, Media Kit, and sponsorship opportunities at 320, 375, 390, 430, and 1440px. None showed horizontal overflow, broken rendered images, or runtime exceptions in those passes. Event-page credits were also visually checked at 390px.
