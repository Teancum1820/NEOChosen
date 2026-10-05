import { test, expect } from "@playwright/test";
import { events } from "../../scripts/event-pages.mjs";

test.beforeEach(async ({ page }) => {
  // Keep automation on the local build; no Zeffy or production write requests.
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
});

test("community partners include Hallow and Haven remains last and no larger", async ({
  page,
}) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/sponsors/"]) {
      await page.goto(route);
      const community =
        route === "/"
          ? page.locator(".home-sponsor-tier--community")
          : page.locator(
              'section[aria-labelledby="community-sponsors-heading"]',
            );
      const advertiser =
        route === "/"
          ? page.locator(".home-sponsor-tier--program-advertiser")
          : page.locator(
              'section[aria-labelledby="program-advertiser-sponsors-heading"]',
            );
      await expect(community.locator('[data-sponsor="hallow"]')).toHaveCount(1);
      await expect(
        community.locator('[data-sponsor="haven-of-rest"]'),
      ).toHaveCount(0);
      await expect(
        page.getByText("Official Prayer Sponsor", { exact: true }),
      ).toHaveCount(0);
      const haven = advertiser.locator('[data-sponsor="haven-of-rest"]');
      await expect(haven).toHaveCount(1);
      await haven.scrollIntoViewIfNeeded();
      const havenArt = haven.locator(".neo-sponsor-art");
      const communityArt = community.locator(".neo-sponsor-art").first();
      const havenBounds = await havenArt.boundingBox();
      const communityBounds = await communityArt.boundingBox();
      expect(havenBounds.width).toBeLessThanOrEqual(communityBounds.width + 1);
      expect(havenBounds.height).toBeLessThanOrEqual(communityBounds.height);
      expect(
        await haven.locator("img").evaluate(async (img) => {
          await img.decode();
          return img.naturalWidth;
        }),
      ).toBeGreaterThan(0);
      expect(
        await advertiser.evaluate(
          (node) =>
            node.nextElementSibling?.matches(
              ".home-sponsor-tier, .sponsor-editorial-section, .sponsor-platinum-feature",
            ) ?? false,
        ),
      ).toBe(false);
    }
  }
});

test("homepage and current canonical routes load without page-level exceptions", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of [
    "/",
    "/sponsors/",
    "/about-us/",
    "/get-involved/",
    "/chesterland/",
    "/vip-dinner/",
    "/lakewood/",
    "/piano-guys/",
    "/fairlawn/",
    "/media-kit/",
    "/sponsorship-opportunities/",
    "/donations/",
    "/raffle/",
    "/social-media-links/",
  ]) {
    const response = await page.goto(route);
    expect(response?.ok(), route).toBeTruthy();
    await expect(page.locator("main h1").first()).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("navigation and local links stay usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.locator(".nav-toggle").first();
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.locator('.site-nav a[href="/about-us/"]').first(),
  ).toBeVisible();
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await page.goto("/sponsors/");
  await expect(
    page.locator('a[href="/sponsorship-opportunities/"]').first(),
  ).toBeAttached();
});

test("registration actions and forms render without submitting", async ({
  page,
}) => {
  await page.goto("/");
  expect(
    await page.locator('a[href*="zeffy.com/en-US/ticketing"]').count(),
  ).toBeGreaterThan(0);
  await expect(page.locator("[data-zeffy-embed]").first()).toBeAttached();
  await page.goto("/raffle/");
  await expect(page.locator("main form")).toHaveCount(0);
  await expect(page.locator("[data-zeffy-embed]")).toHaveCount(0);
});

test("cash raffle shows only holding copy and defers rules on desktop tablet and mobile", async ({
  page,
}) => {
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/raffle/");
    await expect(page.locator("main h1")).toHaveText("NEO Chosen Cash Raffle");
    await expect(page.locator("main .cash-kicker")).toHaveText(
      "NEO Chosen Cash Raffle — Coming Soon",
    );
    await expect(page.locator("main .cash-statement")).toContainText(
      "Six cash prizes.",
    );
    await expect(
      page.locator("main form, main a, main button, main aside, main section"),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.goto("/raffle/rules/");
    await expect(page).toHaveURL(/\/raffle\/$/);
    await expect(page.locator("main h1")).toHaveText("NEO Chosen Cash Raffle");
  }
});

test("homepage rows preserve the verified event facts and destinations", async ({
  page,
}) => {
  await page.goto("/");
  for (const event of events) {
    const card = page.locator(`[data-event="${event.slug}"]`);
    await expect(card.locator("h3")).toHaveText(event.title);
    await expect(card.locator(".home-event-time")).toHaveText(event.time);
    await expect(card.locator(".home-event-location")).toContainText(
      event.venue,
    );
    await expect(card.locator(".home-status")).toHaveText(event.admission);
    await expect(card.locator(".home-event-cta")).toHaveAttribute(
      "href",
      event.url,
    );
    await expect(card.locator(".home-event-secondary")).toHaveAttribute(
      "href",
      `/${event.slug}/`,
    );
  }
});

test("responsive hero, header, and sponsor band fit all review widths", async ({
  page,
}) => {
  for (const width of [320, 375, 390, 430, 768, 1024, 1200, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    const geometry = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      images: [...document.querySelectorAll(".home-hero img")].map((image) => ({
        width: image.clientWidth,
        height: image.clientHeight,
        loaded: image.complete && image.naturalWidth > 0,
        source: image.currentSrc,
      })),
      ribbon: document
        .querySelector(".home-sponsor-ribbon")
        .getBoundingClientRect().height,
    }));
    expect(geometry.width, `overflow at ${width}px`).toBeLessThanOrEqual(width);
    expect(geometry.images).toHaveLength(5);
    for (const image of geometry.images) {
      expect(image.loaded).toBeTruthy();
      expect(image.width).toBeGreaterThan(40);
      expect(image.height).toBeGreaterThan(40);
      expect(image.source).toContain("/images/performers/");
    }
    if (width < 768) expect(geometry.ribbon).toBeLessThan(220);
    if (width >= 1200) {
      for (const selector of [
        ".site-wordmark",
        'a[href="/#events"]',
        'a[href="/#performers"]',
        ".nav-dropdown-toggle",
        ".nav-ticket",
      ]) {
        const item = page.locator(".site-nav").locator(selector).first();
        const box = await item.boundingBox();
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
    }
  }
});

test("mobile menu preserves focus and closes with Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.locator(".nav-toggle");
  await menu.click();
  await expect(page.locator("main")).toHaveAttribute("inert", "");
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("main")).not.toHaveAttribute("inert", "");
});

test("newsletter script waits for signup visibility and retains the direct destination", async ({
  page,
}) => {
  const requested = [];
  page.on("request", (request) => {
    if (request.url().includes("zeffy-embed.js")) requested.push(request.url());
  });
  await page.goto("/");
  expect(requested).toEqual([]);
  await page.locator("#event-updates").scrollIntoViewIfNeeded();
  await expect.poll(() => requested.length).toBe(1);
  await expect(page.locator(".home-updates-form > p a")).toHaveAttribute(
    "href",
    "https://www.zeffy.com/en-US/embed/newsletter-form/get-neochosen-event-updates",
  );
});

test("sponsorship print previews load on demand with usable mobile download links", async ({
  page,
}) => {
  await page.goto("/sponsorship-opportunities/all/");
  const preview = page.locator("[data-pdf-src]");
  await expect(preview).not.toHaveAttribute("data");
  await preview.scrollIntoViewIfNeeded();
  await expect(preview).toHaveAttribute(
    "data",
    "/sponsorships/neochosen-master-sponsorship-overview.pdf#page=1&view=FitH",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.locator(".pdf-mobile-fallback").scrollIntoViewIfNeeded();
  await expect(preview).not.toHaveAttribute("data");
  await expect(page.locator(".pdf-mobile-fallback a").first()).toHaveAttribute(
    "href",
    "/sponsorships/neochosen-master-sponsorship-overview.pdf",
  );
});

test("every concert action goes directly to Ticketmaster without a notice", async ({
  page,
  context,
}) => {
  const ticketUrl = "https://www.ticketmaster.com/event/05006538EC473EB4";
  await context.route("https://www.ticketmaster.com/**", (route) =>
    route.fulfill({ body: "Ticket destination" }),
  );
  for (const [route, expectedCount] of [
    ["/", 3],
    ["/piano-guys/", 2],
  ]) {
    await page.goto(route);
    const buttons = page.locator(`a[href="${ticketUrl}"]`);
    await expect(buttons).toHaveCount(expectedCount);
    for (let index = 0; index < expectedCount; index++) {
      const trigger = buttons.nth(index);
      const popupPromise = page.waitForEvent("popup");
      await trigger.click();
      const popup = await popupPromise;
      await expect(popup).toHaveURL(ticketUrl);
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await popup.close();
    }
  }
});

test("mobile concert action goes directly to Ticketmaster with the keyboard", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await context.route("https://www.ticketmaster.com/**", (route) =>
    route.fulfill({ body: "Ticket destination" }),
  );
  await page.goto("/piano-guys/");
  const trigger = page.locator('.event-hero a[href*="ticketmaster.com"]');
  await trigger.focus();
  const popupPromise = page.waitForEvent("popup");
  await page.keyboard.press("Enter");
  const popup = await popupPromise;
  await expect(popup).toHaveURL(
    "https://www.ticketmaster.com/event/05006538EC473EB4",
  );
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await popup.close();
});
