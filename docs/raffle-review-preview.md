# Raffle review preview

Review page: https://neochosen-raffle-review.calebday1820.workers.dev/raffle/

Draft rules: https://neochosen-raffle-review.calebday1820.workers.dev/raffle/rules/

This separate Cloudflare Worker hosts the intended public launch design for Joe's review. It has no production routes or data bindings. The public website continues to show its existing Coming Soon page.

The preview is publicly reachable by anyone with the link. Robots headers and metadata request no indexing; they are not access controls. It accepts GET and HEAD only and contains no Zeffy checkout. The main page uses public-facing launch copy with a small preview bar and a Review notes dialog. Ticket buttons open a selection summary with checkout disabled; they do not issue tickets, collect purchaser data, or send requests. Launch-notification signup and preparation-only sections are removed.

Public-style wording about ticket delivery describes the intended service, not completed functionality. Review notes explicitly identify checkout, confirmation emails, numbering, and drawing-stub fulfillment as unconnected or unverified. Existing proposed prices ($20/1, $50/3, $100/7), prize percentages, eligibility, and November 15 schedule are preserved for design review and still require final approval. The expired opening date is omitted from the landing page. Linked rules retain their draft warnings and unresolved terms.

Later October 16 update: per Joe's new instruction, eligibility now says U.S. resident and omits the physical-in-Ohio requirement. The custom confirmation message is available at `/raffle/confirmation-preview/` and was delivery-tested through Zeffy to Caleb's inbox. This does not verify actual paid ticket issuance. See [the follow-up record](raffle-oct16-followup.md), including the inadvertent campaign finalization and immediate sales closure; the campaign is no longer an unpublished draft.

Preview source: `source-assets/raffle-preview/public-launch.html`, `.css`, and `.js`. These files are excluded from the ordinary production build.

Rules source: `source-assets/raffle-preview/official-rules.html`, aligned to Joe’s September 30, 2026 setup email, especially section 8 and its supporting pricing, drawing, ownership, and delivery instructions. The earlier preview already contained most of these working terms. This revision adds the omitted no-fixed-cap/payment wording, restrictions on discounts/bonus entries and purchases for minors, rounding review, social-consent wording, ticket-number/printing controls, check-in clarification, separate Zeffy contribution/prize-payment wording, and unresolved dispute/material-rule-change provisions. It identifies the source date without representing the working terms as approved rules. The historical archive is preserved. The private proposed drawing location remains withheld as Joe instructed.

Organizer fields were completed for Joe’s review on October 16, 2026:

- Name: Kirtland Heritage Group. Do not invent an “Inc.” or other suffix.
- EIN: 99-1301074, supplied by Joe in his [October 16 website-update email](https://mail.google.com/mail/u/0/#all/1a144b3b9eaadb0b) and corroborated by the [Charity Navigator EIN profile](https://www.charitynavigator.org/ein/991301074).
- Mailing address: 38323 Apollo Parkway, Unit 7, Willoughby, Ohio 44094, supplied in [Joe’s address-correction email](https://mail.google.com/mail/u/0/#all/1a036463647f4871), and currently published on [KHG’s website](https://kirtlandheritagegroup.com/) and [NEOChosen’s donation page](https://neochosen.com/donations/).
- Contact: info@kirtlandheritagegroup.com and 440-796-1642, using the existing NEOChosen event contact, published on the donation page and shared site footer. A separate KHG contact page lists a different general phone; this preview deliberately retains NEOChosen’s established number. No claim is made that contact-response staffing or ticket-delivery testing is complete.
- Website and 501(c)(3) description: KHG’s current public website.
- Rules version: October 16, 2026 review draft. Effective date says the draft is not in effect, rather than inventing approval or an opening date.

No bracketed organizer placeholders remain. The hosted update matches the build exactly, and its organizer section was checked on desktop and at 390px with no horizontal overflow. Legal/operating provisions that were unresolved in Joe’s source remain identified for review.

Rebuild and redeploy only this review service:

```powershell
node scripts/build-raffle-review.mjs
npx wrangler deploy --config preview/raffle.wrangler.jsonc
```

The output is `artifacts/raffle-preview`, separate from the ordinary `dist` build. The existing review Worker is reused without changes. Do not use the production deployment command to update this preview.

Verified October 16, 2026: both hosted pages return 200 with noindex headers; POST returns 405; both sponsor logos and preview CSS/JavaScript return 200. Desktop and 390px/320px layouts were checked with no horizontal overflow. All three ticket buttons display their correct counts and totals; checkout is disabled. Dialog close buttons, Escape dismissal, Review notes, and the draft-rules link were checked. The live raffle page remains Coming Soon with no purchase button or preview script.
