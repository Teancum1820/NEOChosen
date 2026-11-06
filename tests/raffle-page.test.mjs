import { test } from "node:test";
import assert from "node:assert/strict";
import { renderRaffleAnnouncement, applyRafflePromotion } from "../scripts/raffle-page.mjs";

test("Lakewood has its own drawing and Saturday raffles remain conditional", () => {
  const html = renderRaffleAnnouncement();
  assert.equal((html.match(/<li>/g) || []).length, 3);
  for (const venue of ["Lakewood Civic Auditorium", "Akron Civic Theatre", "St. Hilary Church"]) assert(html.includes(venue));
  assert(html.includes("Drawing during the Lakewood event on November 13"));
  assert(html.includes("There is no combined weekend jackpot"));
  assert(html.includes("subject to confirmation"));
  assert(!html.includes("Windows on the River"));
  assert(html.includes("No online raffle-ticket sales."));
  assert(html.includes("no raffle at Sunday&#39;s November 15 event at Mayfield United Methodist Church"));
  assert(!/zeffy|\$\d|6 p\.m\.|winner.*present/i.test(html));
});

test("Sunday and unrelated pages receive no raffle promotion", () => {
  const html = "<main><p>Event registration</p></main>";
  for (const route of ["/chesterland/", "/vip-dinner/", "/sponsors/", "/thank-you/chesterland/"]) assert.equal(applyRafflePromotion(html, route), html);
});

test("the homepage contains the announcement without a sales strip", () => {
  const html = applyRafflePromotion('<head></head><main><section class="home-overview"></section></main>', "/");
  assert(html.includes("50/50 Raffle — In Person Only"));
  assert(!/raffle-quick-promotion|Get Raffle Tickets/i.test(html));
  assert(html.indexOf("weekend-raffle-title") < html.indexOf("home-overview"));
});
