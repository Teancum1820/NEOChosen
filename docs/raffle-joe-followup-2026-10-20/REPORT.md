# Joe's October 20 raffle follow-up

This follow-up implements Joe's specific five website/artwork requests from his latest raffle reply. Prices, rules, campaign identity, six prize percentages and November 15 schedule are unchanged.

## Changes

1. Compact homepage promotion above the hero: “Six cash prizes. Tickets from $20. Enter the Cash Raffle.” The existing substantial promotion after the hero/sponsor remains.
2. The actual raffle-page desktop header and mobile menu now say Get Raffle Tickets. A sticky mobile shortcut takes visitors to the package controls without a bottom overlay.
3. Shorter mobile hero, earlier prices and schedule, three compact package cards, visible 7-ticket Best Value label, and one shared optional-contribution disclosure adjacent to all three accessible controls. All package links clearly open the same Zeffy selection page.
4. Early raffle link immediately after the first registration button on VIP Dinner, Lakewood, Piano Guys, Fairlawn and Chesterland. Each preserves the separate-admission notice and the substantial existing promotion.
5. Public square (1080×1080) and story (1080×1920) PNG/WebP downloads in the media kit. The unchanged PNG QR codes both decode to https://neochosen.com/raffle/. The Zeffy generic jar image was replaced with the approved complete square artwork; Zeffy's uploader explicitly recommends square artwork. Published desktop verification: `screenshots/zeffy-branded-desktop.png`.

## Zeffy support — submitted, awaiting response

Submitted through the human support form linked by https://www.zeffy.com/home/contact after the chatbot explicitly said it could not create a human case. All three issues and the existing end-time validation screenshot were included. The form visibly confirmed “Thank you for your message!” and “We will get back to you in 1-6 business hours :)”. No case number was displayed. Evidence: `screenshots/zeffy-support-submitted.png`.

- Suppress the required internal 6:01 PM end marker in generated confirmation/calendar and e-ticket output without altering the real 6 PM drawing or 5 PM sales close.
- Confirm server-side cutoff enforcement for carts opened before 5 PM and a supported no-charge verification method.
- Establish stable native payment/order-to-ticket mapping and exact partial-refund/canceled-bundle export semantics.

The 6:01 display is **not fixed**. Existing public date hiding and correct custom copy remain. Chat advice is not confirmation of these unresolved behaviors.

## Testing and limits

Static build/release/link checks, lint, typecheck, formatting and the 25 synthetic drawing tests passed. Browser functional coverage includes 36 existing cases plus three new 320/390/1440 cases for opening-screen promotion, actual navigation, unobscured mobile package heading, all three compact cards, early event links and valid PNG downloads. All 32 accessibility checks and four established visual comparisons passed without baseline changes. Storybook built successfully. Lighthouse assertions passed on all three configured routes; local performance scores were 98 homepage, 94 sponsors and 97 Chesterland, with accessibility/best practices/SEO 100 on each. These are local lab results, not field performance guarantees.

Live Zeffy no-payment checks selected one of each package and confirmed $20 + $50 + $100 = $170. The suggested contribution was $25.50; choosing Other and entering 0 produced USD 170.00. The individual purchaser eligibility attestations remain; Zeffy's native corporate/organization checkbox is still present and does not override the published individual-only rules. No eligibility checkboxes, payment methods or payment button were submitted. Mobile checkout had viewport/scroll width 390/390. Screenshots contain no purchaser records.

The production Payments tab showed “You have no payments”; Ticket list showed “You have no guests”. There is therefore no legitimate production order available for ticket-count, unique-number, actual delivered confirmation/link or refund verification. Prior separate free 1/3/7-ticket tests and the native production email fixture remain historical evidence, not proof of a paid production order. After saving the branded banner, the saved Date panel was re-opened read-only and still showed the hidden November 15 date, 6:00 PM start, required 6:01 PM end marker, and explicit 5:00 PM sales close.

No paid purchases, refunds, cancellations, live eligible test entries, official drawing, prize payments or messages to Joe were made.

## Exact human/provider handoff

| Owner | Remaining action |
| --- | --- |
| Zeffy | Reply to the submitted display/cutoff/mapping/refund questions and provide a supported fix/workflow. |
| Caleb / Joe | Review the new reply draft and decide when to send it. It remains unsent. |
| Social publisher | When posting a story, add the platform's tappable link sticker labeled Enter the Cash Raffle to https://neochosen.com/raffle/, alongside the supplied QR. The media kit supplies the exact link/instructions; a PNG cannot contain an Instagram/Facebook interactive sticker. No social story was published in this task. |
| Caleb / assigned reviewer | When a legitimate production order exists, check actual bundle ticket counts and unique native numbers, delivered email and ticket link on an actual phone/email client, and supported stable payment-to-ticket mapping. No paid test or refund is authorized. |
| Joe / KHG | Name the reconciliation lead, independent checker, drawing operator, witnesses and backups; record acceptance and outstanding organizer/method approvals from the existing operating checklist. Joe reports an independent rerun of the 25 tests; that does not sign final reconciliation or assign drawing-day roles. |
| Assigned closing operator | At November 15, 5 PM Eastern, verify actual closure/open-cart behavior and preserve unchanged final exports. Obtain Joe's approval for the documented manual-close contingency before drawing day. |
| Reconciliation lead + independent checker | Reconcile final eligible sales, refunds/cancellations and all cross-order identities, sign exact source/snapshot hashes and counts, and complete final go/no-go before the 6 PM drawing. |

Detailed existing operating procedure and private signoff template: [HANDOFF.md](../raffle-finalization-2026-10-20/HANDOFF.md). Do not put purchaser exports, native ticket-access links or signatures in this public repository.

## Release evidence

- Application changes: [PR 113](https://github.com/Teancum1820/NEOChosen/pull/113), tested source commit `c048603`.
- GitHub [Frontend QA](https://github.com/Teancum1820/NEOChosen/actions/runs/39497221493) completed successfully, including functional/accessibility/visual checks, responsive screenshots and Lighthouse. Cloudflare Workers Builds check passed.
- Published through the existing `neochosen` Worker with unchanged config/bindings. Manual release version: `6208d6c3-7fda-4695-98e3-8a9d797d6bce`. Previous version for rollback: `63daf98b-e0e5-4f35-85b6-400fa08af99d`.
- [production-verification.json](production-verification.json): all 14 checked production pages/assets returned HTTP 200 and matched the tested build's SHA256 bytes, including official rules, all five event pages, styles and both PNGs.
- Live desktop/mobile screenshots are in `screenshots/`: opening homepage, actual raffle navigation, compact packages, branded Zeffy artwork, media-kit downloads, early event link and support confirmation.
- [joe-reply.html](joe-reply.html) is the saved text of the actual Gmail reply draft. Gmail read-back confirmed DRAFT status, correct recipient/thread/reply reference, 11 JPEG screenshot attachments and explicit unresolved 6:01 wording. Nothing was sent to Joe.
- A local accessibility run was interrupted by another local rebuild; its complete stable-build rerun passed 32/32. The initial new download tests had an ambiguous selector matching both preview and download links; selecting the actual download control fixed the tests, and all three reran successfully. The independent GitHub run then passed the complete final suite.
