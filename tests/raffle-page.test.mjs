import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  applyRafflePromotion,
  renderRaffleLanding,
  raffleLaunch,
  raffleSalesOpen,
} from "../scripts/raffle-page.mjs";
import { applySiteChrome } from "../scripts/site-chrome.mjs";

const source = await readFile(
  "source-assets/raffle-preview/public-launch.html",
  "utf8",
);
const beforeClosing = new Date("2026-10-19T18:00:00Z");
const approved = {
  ...raffleLaunch,
  salesOpen: true,
  salesAuthorized: true,
  rulesFinalized: true,
};
const checkoutCount = (html) =>
  html.split('href="' + raffleLaunch.checkoutUrl + '"').length - 1;

test("release config keeps all approvals and ticket sales on hold", () => {
  assert.equal(raffleLaunch.salesOpen, false);
  assert.equal(raffleLaunch.salesAuthorized, false);
  assert.equal(raffleLaunch.rulesFinalized, false);
});

test("held page closes all three package controls even with other approvals present", () => {
  for (const config of [raffleLaunch, { ...approved, salesOpen: false }]) {
    const page = renderRaffleLanding(source, config, beforeClosing);
    assert.equal((page.match(/disabled>Sales closed/g) || []).length, 3);
    for (const marker of [
      "cash-checkout-preview",
      "data-preview-notes",
      "public-launch.js",
      raffleLaunch.checkoutUrl,
    ])
      assert(!page.includes(marker));
    assert(page.includes("Ticket sales are currently closed"));
    assert(page.includes('href="/raffle/rules/"'));
    assert(!page.includes("Buy raffle tickets"));
  }
});

test("opening requires explicit authorization and final rules independently", () => {
  for (const value of [false, undefined, "true", 1]) {
    assert.throws(
      () =>
        renderRaffleLanding(
          source,
          { ...approved, salesAuthorized: value },
          beforeClosing,
        ),
      /authorization/,
    );
    assert.throws(
      () =>
        renderRaffleLanding(
          source,
          { ...approved, rulesFinalized: value },
          beforeClosing,
        ),
      /Final approved rules/,
    );
  }
  const page = renderRaffleLanding(source, approved, beforeClosing);
  assert.equal(checkoutCount(page), 3);
  assert(!page.includes("disabled>Sales closed"));
  for (const [count, price] of [
    [1, 20],
    [3, 50],
    [7, 100],
  ])
    assert(
      page.includes(
        `Get ${count} ${count === 1 ? "ticket" : "tickets"} for $${price}`,
      ),
    );
});

test("purchase links close at exact cutoff and refuse alternate campaigns", () => {
  assert.equal(
    checkoutCount(
      renderRaffleLanding(
        source,
        approved,
        new Date("2026-11-15T21:59:59.999Z"),
      ),
    ),
    3,
  );
  for (const time of ["2026-11-15T22:00:00Z", "2026-11-16T00:00:00Z"]) {
    const page = renderRaffleLanding(source, approved, new Date(time));
    assert.equal((page.match(/disabled>Sales closed/g) || []).length, 3);
    assert.equal(checkoutCount(page), 0);
    assert(!page.includes(raffleLaunch.checkoutUrl));
  }
  assert.throws(
    () =>
      renderRaffleLanding(
        source,
        { ...approved, checkoutUrl: "https://example.com" },
        beforeClosing,
      ),
    /Unexpected/,
  );
  assert.throws(
    () => raffleSalesOpen({ ...approved, salesOpen: "true" }),
    /boolean/,
  );
  assert.throws(
    () => raffleSalesOpen({ ...approved, closing: "invalid" }),
    /closing time/,
  );
});

test("promotion uses the same approval and closing gate as checkout", () => {
  const html = "<main></main>";
  const held = applyRafflePromotion(html, "/", raffleLaunch, beforeClosing);
  assert(held.includes("Ticket sales are currently closed"));
  assert(!held.includes("Tickets available now."));
  assert(
    applyRafflePromotion(html, "/", approved, beforeClosing).includes(
      "Tickets available now.",
    ),
  );
  assert(
    applyRafflePromotion(
      html,
      "/",
      approved,
      new Date("2026-11-15T22:00:00Z"),
    ).includes("Ticket sales are currently closed"),
  );
  assert.throws(
    () =>
      applyRafflePromotion(
        html,
        "/",
        { ...approved, rulesFinalized: false },
        beforeClosing,
      ),
    /Final approved rules/,
  );
});

test("raffle information is directly reachable in shared header and footer", () => {
  for (const route of ["/", "/raffle/", "/raffle/rules/", "/vip-dinner/"]) {
    for (const html of [
      applySiteChrome(source, route),
      applyRafflePromotion(
        applySiteChrome(source, route),
        route,
        raffleLaunch,
        beforeClosing,
      ),
    ]) {
      const header = html.match(
        /<div class="site-nav-links"[^>]*>([\s\S]*?)<div class="nav-dropdown">/,
      )[1];
      assert(header.includes('href="/raffle/"'));
      assert(header.includes("Raffle Info"));
      assert.equal(
        header.includes('href="/raffle/" aria-current="page"'),
        route === "/raffle/",
      );
      const footer = html.match(
        /<footer class="site-footer"[\s\S]*?<\/footer>/,
      )[0];
      assert(footer.includes('href="/raffle/"'));
      assert(!html.includes("Raffle — Coming Soon"));
      assert.equal((header.match(/href="\/raffle\/"/g) || []).length, 1);
      assert.equal((footer.match(/href="\/raffle\/"/g) || []).length, 1);
      assert(!html.includes(raffleLaunch.checkoutUrl));
      const more = html.match(/id="resource-navigation">([\s\S]*?)<\/div>/)[1];
      assert(!more.includes('href="/raffle/"'));
    }
  }
});
