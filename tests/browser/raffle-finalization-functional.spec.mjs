import { test, expect } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`final raffle features and evidence at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of [
      "/",
      "/vip-dinner/",
      "/lakewood/",
      "/piano-guys/",
      "/fairlawn/",
      "/chesterland/",
      "/raffle/",
    ]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
      const imageUrls = await page
        .locator("main img")
        .evaluateAll((images) =>
          images.map((image) => image.currentSrc || image.src),
        );
      for (const url of new Set(imageUrls)) {
        if (url.startsWith("http://127.0.0.1"))
          expect((await page.request.get(url)).ok(), url).toBe(true);
      }
      if (route === "/raffle/") {
        await expect(page.locator(".cash-hero")).toContainText(
          "Sales close November 15, 2026, at 5 p.m. Eastern.",
        );
        await expect(page.locator(".cash-hero")).toContainText(
          "Electronic drawing November 15, 2026, at 6 p.m. Eastern.",
        );
        await expect(page.locator(".cash-contribution")).toHaveCount(1);
        for (const button of await page.locator(".cash-ticket-card a").all())
          await expect(button).toHaveAttribute(
            "aria-describedby",
            "zeffy-contribution-packages",
          );
        await expect(page.locator(".cash-ticket-card--featured")).toContainText(
          "Best value",
        );
        await testInfo.attach(`raffle-top-${width}`, {
          body: await page.screenshot({ fullPage: false }),
          contentType: "image/png",
        });
        await page.locator("#raffle-tickets").scrollIntoViewIfNeeded();
        await testInfo.attach(`packages-contribution-${width}`, {
          body: await page.screenshot({ fullPage: false }),
          contentType: "image/png",
        });
      } else if (route === "/piano-guys/") {
        const feature = page.locator(".raffle-promotion");
        await expect(feature).toContainText("In-person-only 50/50 raffle");
        await expect(feature).toContainText("No online raffle-ticket sales.");
        await expect(feature).toContainText("cash or credit card");
        await expect(feature).toContainText(
          "The raffle and drawing conclude at the end of the St. Hilary meet-and-greet on Saturday, November 14.",
        );
        await expect(feature).toContainText(
          "There will be no raffle at Sunday’s November 15 event at Mayfield United Methodist Church.",
        );
        await expect(page.locator('a[href*="/raffle/"]')).toHaveCount(0);
        await feature.scrollIntoViewIfNeeded();
        await testInfo.attach(`piano-guys-in-person-raffle-${width}`, {
          body: await page.screenshot({ fullPage: false }),
          contentType: "image/png",
        });
      } else {
        const feature = page.locator(".raffle-promotion");
        await expect(feature).toContainText(
          "$20 for 1 ticket · $50 for 3 · $100 for 7",
        );
        await expect(
          feature.getByRole("link", { name: "Get Raffle Tickets" }),
        ).toHaveAttribute("href", "/raffle/");
        if (route !== "/")
          await expect(feature).toContainText(
            "Raffle tickets are separate from event admission.",
          );
        await feature.scrollIntoViewIfNeeded();
        await testInfo.attach(
          `${route === "/" ? "homepage" : route.split("/")[1]}-raffle-${width}`,
          {
            body: await page.screenshot({ fullPage: false }),
            contentType: "image/png",
          },
        );
      }
    }
    expect(errors).toEqual([]);
  });
}
