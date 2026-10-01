import { mkdir, copyFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { page, hero, section, escape } from "./editorial-page.mjs";

export async function writeReviewHub(outDir) {
  const items = [
    { title: "VIP Sponsor Dinner", route: "/vip-dinner/", status: "For approval", text: "Intimate experience, limited seating, $200 per person, $1,400 table of eight, updated menu, and KHG / Great Lakes logos.", note: "Before launch: confirm the reservation checkout matches the table price and meal choices." },
    { title: "Interfaith & Community Leaders Breakfast", route: "/interfaith-community-breakfast/", status: "For approval", text: "Purpose, two regional gatherings, invitation deadline, community discussion themes, and invitation-request form.", note: "Review the form wording and fields. Submissions are disabled in this preview; the private Google Sheets connection has been tested locally." },
    { title: "Media Kit & Event Flyers", route: "/media-kit/", status: "Already live · Feedback welcome", text: "Approved Akron, Fairlawn, VIP dinner, and Master Weekend artwork, with both 8.5×11 and 11×17 weekend print options.", note: "Current flyer downloads and event-page artwork are included here." },
  ];
  const browse = [
    ["Homepage & weekend overview", "/"],
    ["Performers", "/#performers"],
    ["Akron · The Piano Guys", "/piano-guys/"],
    ["Fairlawn Meet & Greet", "/fairlawn/"],
    ["Lakewood · An Evening with The Chosen", "/lakewood/"],
    ["Chesterland Meet & Greet", "/chesterland/"],
    ["Sponsors", "/sponsors/"],
    ["Sponsorship opportunities", "/sponsorship-opportunities/"],
    ["About Us", "/about-us/"],
    ["Get Involved", "/get-involved/"],
    ["Donations", "/donations/"],
    ["Social links", "/social-media-links/"],
  ];
  const body = hero("Joe’s website review · October 1, 2026", "Review the NEOChosen website.", "Joe, start with the three updates below, then browse the rest of the website. This preview brings the latest changes together for your review.")
    + section("Start here", "Three updates to review.", `<div class="review-grid">${items.map(item => `<article class="review-card"><p class="review-status">${escape(item.status)}</p><h3>${escape(item.title)}</h3><p>${escape(item.text)}</p><a class="editorial-button" href="${item.route}">Review page <span aria-hidden="true">→</span></a><p class="review-note">${escape(item.note)}</p></article>`).join("")}</div>`, "editorial-section--white")
    + section("The complete website", "Browse every part of the weekend.", `<div class="review-links">${browse.map(([title, route]) => `<a href="${route}">${escape(title)} <span aria-hidden="true">→</span></a>`).join("")}</div>`)
    + section("Your feedback", "Approve or request changes.", '<div class="editorial-copy"><p>Reply to Caleb with the pages you approve and any edits you would like. Please confirm the dinner pricing and menu, the breakfast content and request fields, and the flyer print options.</p><p>The revised dinner and breakfast pages will stay off the live website until approved and their launch dependencies are ready. This review link does not record approvals automatically.</p></div>', "editorial-section--white");
  const directory = path.join(outDir, "review");
  await mkdir(directory, { recursive: true });
  await copyFile("preview/review.css", path.join(directory, "review.css"));
  await writeFile(path.join(directory, "index.html"), page({ title: "Joe’s Website Review | NEOChosen", description: "Review the latest NEOChosen website changes in one place.", route: "/review/", className: "review-hub", extraHead: '<meta name="robots" content="noindex,nofollow,noarchive"><link rel="stylesheet" href="/review/review.css">', body }));
}
