# October 16 raffle follow-up

Joe's [latest raffle reply](https://mail.google.com/mail/u/0/#all/1a146fb6602601fa) requests U.S.-resident eligibility, confirmation-email delivery and copy review, numbered ticket delivery, and social-follow links. Caleb authorized implementing these changes. “Other tickets” was interpreted in the raffle context as all numbered raffle entries; the email also explains how separately registered event tickets are accessed through their own confirmation emails. No additional event admission is issued or promised.

## Changes

- Preview landing page and rules now say U.S. resident, age 18 or older, purchasing for oneself, subject to the final rules. The superseded physical-in-Ohio requirement is removed. Prices, ticket counts, and prize percentages are unchanged. This is proposed eligibility for review, not a finding that sales are legally permitted in every jurisdiction.
- Existing Zeffy campaign description and buyer questions were aligned to the U.S.-resident proposal. The residency question remains required and buyer-only; the Ohio-location question was removed. Age, ownership, rules acknowledgment, address, phone and email remain required.
- Subject remains **Your NEO Chosen Cash Raffle tickets**. The native thank-you email is checked, disabled from being turned off, and described by Zeffy as required because it includes the receipt and applicable tickets. Trigger: following a purchase on this campaign.
- Custom message source: `source-assets/raffle-preview/confirmation-message.html`. It explains native View tickets access, 1/3/7 package counts and combined packages, schedule, prize percentages, drawing-stub intent, separate event admission, support contact, and optional KHG Facebook/Instagram follows. It links to review rules with an explicit pre-launch review notice. Remove that notice and replace the rules link with final approved production rules only at an authorized launch.
- Public review of the custom message: https://neochosen-raffle-review.calebday1820.workers.dev/raffle/confirmation-preview/ . Zeffy supplies the actual greeting, order summary, receipt and native ticket link; this web page supplies none of those and cannot issue tickets.

## Delivery evidence and limits

Zeffy's **Send test email** was sent only to Caleb's existing account-user address, calebday1820@gmail.com. It arrived in Gmail **INBOX** on October 16 at 23:15:04 UTC with subject **(Test) Your NEO Chosen Cash Raffle tickets**, message ID `1a146ff67ef4a091`. The received message includes the new review notice, U.S.-resident wording, package counts, native View tickets UI and custom social links. Zeffy rewrites links through its tracking host: the delivered rules/Facebook/Instagram links were checked and returned 302 redirects to the exact intended destinations. The native order and receipt are fictional test data, not a purchase. No real transaction was submitted.

This verifies delivery of a native Zeffy test confirmation and its custom content. It does **not** verify paid package issuance, every unique real ticket number, actual customer ticket access, refunds, or the real-ticket export-to-stub workflow. Those remain open launch checks.

## Campaign-state incident and containment

While editing, the agent advanced the initial setup from Advanced settings to Review and subsequently saved. This finalized the previously unpublished draft. It was not an authorized launch. On discovering that the campaign list no longer said Draft, the agent immediately used **Close sales**. The dashboard then showed **Sales closed**, **$0**, and **0 tickets**, and the public page showed all three package buttons and Continue disabled. The user was informed during the work.

The existing campaign now has a publicly reachable Zeffy page with sales closed. Do not describe it as an unpublished draft or open it merely to obtain a test. Do not delete it or create a replacement campaign. The manual closure is the current safeguard. Before any future authorized opening, verify the intended November 15 5 PM Eastern automatic cutoff, the fresh opening time, and all final launch checks. Do not restore a future cutoff in a way that reopens sales without authorization.

The production NEOChosen website remains its minimal Coming Soon page. Only the isolated review service is deployed for this follow-up. The preview purchase controls remain simulated and no real checkout link is placed on NEOChosen.
