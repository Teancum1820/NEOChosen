import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
});

for (const width of [320, 390, 768, 1440]) {
  test(`Saturday schedule and retired raffle promotion at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "/",
      "/piano-guys/",
      "/fairlawn/",
      "/chesterland/",
      "/media-kit/",
    ]) {
      expect((await page.goto(route)).ok()).toBe(true);
      await expect(page.locator("body")).not.toContainText(/50\/50 raffle/i);
      await expect(
        page.locator('a[href^="/raffle/"], .raffle-promotion'),
      ).toHaveCount(0);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
    }

    await page.goto("/");
    const notice = page.locator("#schedule-update");
    await expect(notice).toContainText("Doors 4:30 PM · Concert 5:30 PM");
    await expect(notice).toContainText("7:15 PM");
    await expect(notice).not.toContainText(/will call|still need concert tickets/i);
  });
}

test("retired pages and artwork are absent from the static build", async ({
  request,
}) => {
  for (const url of [
    "/raffle/",
    "/raffle/rules/",
    "/media-kit/neo-chosen-raffle-square.png",
    "/images/raffle/raffle-square-v2.webp",
    "/media-kit/2026-fairlawn-meet-and-greet.pdf",
    "/media-kit/2026-akron-piano-guys-concert.pdf",
  ]) {
    expect((await request.get(url)).status()).toBe(404);
  }
});
