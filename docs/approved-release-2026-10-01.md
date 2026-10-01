# Approved website release — October 1, 2026

Caleb confirmed that Joe approved merging and publishing the reviewed website changes, with the breakfast page remaining unlisted.

This release carries the current production redesign and approved media into `main`, adds the reviewed VIP Sponsor Dinner page and organizer/presenting sponsor logos, and publishes the Interfaith & Community Leaders Breakfast by direct link only. The breakfast is excluded from navigation, footer, homepage/event listings and sitemaps. Its HTML and HTTP response specify `noindex, nofollow, noarchive`. Unlisted is not password protection.

The approval hub is generated only by `npm run build:review`; the ordinary production build excludes `/review/`. The breakfast form remains disabled in review builds and is enabled in production at `/api/breakfast-requests`. The existing private Google Sheet receives submissions through the server-only service account integration. Credentials and the Sheet ID are Cloudflare secrets, never static assets or repository content. There is no public endpoint to read submissions. Invitations and RSVP follow-up remain organizer-managed.

The verified existing Zeffy dinner destination now displays Individual Seat ($200), Table of Eight ($1,400, eight tickets), November 13 at Windows on the River, 4:30 PM doors and 5:00 PM dinner, the approved menu, and required entrée/dessert choices. No payment settings were changed as part of this release.

Recovery: the production version immediately before this release is `84d37750-1c0b-4574-a5ed-e02bf8ec2cb2`, from the approved media release (`503212b`, documentation at `24513db`). A recovery tag preserves that source. Rolling back the Worker restores the previous static site; it does not delete the private Sheet or its submitted rows.

Validation and production deployment results are recorded after verification.
