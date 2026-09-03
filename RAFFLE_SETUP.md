# Raffle coming-soon production setup

The raffle page remains a draft until these account-side steps are complete.

## Immediate Zeffy shutdown

1. Disable or archive the old `Kirtland Heritage Group's Raffle 2026` checkout.
2. Export all payments, purchasers, contacts, ticket/attendee records, and custom-question answers.
3. Preserve the original exports without editing them and record the export date.
4. Confirm the number of purchases and tickets issued. Escalate any nonzero result before merging this PR.
5. Confirm the `NEOChosen Raffle Interest` signup form adds contacts to the intended Zeffy list, includes first name, last name, email, and optional ZIP, and shows the approved confirmation message.

## Cloudflare resources

The D1 database `neochosen-raffle` and private R2 bucket `neochosen-raffle-uploads` are created and bound in `wrangler.jsonc` as `RAFFLE_DB` and `RAFFLE_UPLOADS`. Complete the remaining configuration for both Preview and Production in the `neochosen` Pages project:

- Secret `RESEND_API_KEY`.
- Variable `RAFFLE_ALERT_FROM` using a verified `neochosen.com` sender.
- Variable `RAFFLE_ALERT_TO=info@kirtlandheritagegroup.com`.
- Add a Cloudflare rate-limiting rule for `POST /api/prize-donations` (recommended threshold: 5 requests per IP per 10 minutes).

The prize form stores its record before sending an alert. Failed alerts are marked `alert_failed` in D1 for follow-up. Uploaded objects are keyed by the submission UUID and are never rendered publicly.

## Export and review

- Export prize records with `wrangler d1 export <database-name> --remote --output raffle-prize-records.sql` or export CSV from the Cloudflare dashboard.
- Review `prize_donations` for `alert_failed` rows and resend those alerts manually.
- Download private R2 objects only through authenticated Cloudflare administration.
- Add approved prizes and donor logos to `raffle/raffle-data.js`; never add alcohol-related or unconfirmed prizes.

## Release checklist

- Test Zeffy signup/list assignment and approved confirmation message.
- Submit a test prize with both uploads and verify D1, private R2 objects, and the email alert.
- Verify all three rows appear in `raffle_events` after signup, prize submission, and donation click.
- Purge the Cloudflare cache after production deployment, including the four retired media-kit URLs.
