import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Keep automation on the local build; no Zeffy or production write requests.
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
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
  await expect(page.locator("[data-zeffy-embed]").first()).toBeAttached();
  await expect(
    page.locator("[data-zeffy-embed][data-form-url]").first(),
  ).toBeAttached();
});
