import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
  await page.goto("/");
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}.reveal{opacity:1!important;transform:none!important}",
  });
});

test("approved Concept A desktop header, hero, event card, sponsor, and footer", async ({
  page,
}) => {
  for (const [name, selector] of [
    ["header", ".site-nav"],
    ["hero", ".home-hero"],
    ["event-card", ".home-event-card"],
    ["weekend-sponsor", ".home-sponsor-ribbon"],
    ["footer", ".site-footer"],
  ]) {
    const item = page.locator(selector).first();
    await item.scrollIntoViewIfNeeded();
    await expect(item).toHaveScreenshot(`${name}.png`);
  }
});

test("approved mobile navigation and event sponsor credit", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}.reveal{opacity:1!important;transform:none!important}",
  });
  await expect
    .soft(page.locator(".site-nav"))
    .toHaveScreenshot("mobile-header.png");
  const credit = page.locator('[data-sponsor-event="akron"]').first();
  await credit.scrollIntoViewIfNeeded();
  await expect(credit).toHaveScreenshot("mobile-event-sponsor.png");
});

test("coordinated sponsor directory major tier", async ({ page }) => {
  await page.goto("/sponsors/");
  const tier = page.locator(".neo-sponsor-section").first();
  await tier.scrollIntoViewIfNeeded();
  await expect(tier).toHaveScreenshot("sponsor-tier.png");
});

test("approved mobile hero and separate sponsor ribbon", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const [name, selector] of [
    ["mobile-hero", ".home-hero"],
    ["mobile-ribbon", ".home-sponsor-ribbon"],
  ]) {
    await expect(page.locator(selector)).toHaveScreenshot(`${name}.png`, {
      style:
        ".site-nav{visibility:hidden!important}.site-skip-link{display:none!important}",
    });
  }
});
