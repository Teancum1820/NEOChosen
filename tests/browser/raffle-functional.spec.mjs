import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
});

for (const width of [320, 390, 768, 1440]) {
  test(`in-person raffle announcement and retired sales at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of [
      "/",
      "/raffle/",
      "/vip-dinner/",
      "/lakewood/",
      "/piano-guys/",
      "/fairlawn/",
      "/chesterland/",
      "/media-kit/",
    ]) {
      expect((await page.goto(route)).ok()).toBe(true);
      const body = page.locator("body");
      await expect(body).not.toContainText(
        /six cash prizes|40%|Tickets from \$20|\$20 for 1 ticket|Get Raffle Tickets/i,
      );
      await expect(
        page.locator(
          'a[href*="neo-chosen-cash-raffle"], a[href="/raffle/rules/"]',
        ),
      ).toHaveCount(0);
      await expect(
        page.locator(
          '.site-nav a[href="/raffle/"], .site-footer a[href="/raffle/"]',
        ),
      ).toHaveCount(0);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
      if (route === "/raffle/") {
        await expect(page.locator("main li")).toHaveCount(4);
        await expect(page.locator("main")).toContainText(
          "No online raffle-ticket sales.",
        );
        await expect(page.locator("main")).toContainText(
          "Mayfield United Methodist Church",
        );
        await expect(
          page.locator("main form, main iframe, .cash-mobile-purchase"),
        ).toHaveCount(0);
        await page.screenshot({
          path: `artifacts/raffle-cleanup-${width}.png`,
          fullPage: true,
        });
        await testInfo.attach(`raffle-cleanup-${width}`, {
          body: await page.screenshot({ fullPage: true }),
          contentType: "image/png",
        });
      } else if (route === "/chesterland/") {
        await expect(page.locator("main")).not.toContainText(/raffle/i);
      } else if (route === "/media-kit/") {
        await expect(
          page.locator(
            'a[href*="neo-chosen-raffle"], a[href*="weekend-schedule"], img[src*="raffle"], img[src*="weekend-schedule"]',
          ),
        ).toHaveCount(0);
      } else {
        await expect(page.locator(".raffle-promotion")).toContainText("50/50");
        if (route !== "/")
          await expect(page.locator(".raffle-early-event")).toContainText(
            "In person only",
          );
        if (route === "/fairlawn/")
          await expect(page.locator(".raffle-promotion")).toContainText(
            "This is the final raffle location.",
          );
      }
    }
    await page.goto("/raffle/rules/");
    await expect(page).toHaveURL(/\/raffle\/$/);
    await expect(page.locator("h1")).toHaveText(
      "50/50 Raffle — In Person Only",
    );
    if (width < 1200) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await expect(page.locator(".nav-toggle")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
      await expect(page.locator(".site-nav")).not.toContainText(/raffle/i);
    }
    expect(errors).toEqual([]);
  });
}

test("retired artwork is absent from the static build", async ({ request }) => {
  for (const url of [
    "/media-kit/neo-chosen-raffle-square.png",
    "/media-kit/neo-chosen-raffle-story.png",
    "/images/raffle/raffle-square-v2.webp",
    "/media-kit/2026-weekend-schedule.pdf",
    "/media-kit/2026-weekend-schedule-letter.pdf",
    "/source-assets/raffle-archive/retired-2026-10-23/live-official-rules.html",
  ]) {
    expect((await request.get(url)).status()).toBe(404);
  }
});
