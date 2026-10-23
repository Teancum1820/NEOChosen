import { test, expect } from "@playwright/test";

for (const width of [320, 390, 1440]) {
  test(`Joe's entry paths remain usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
    await page.goto("/");
    const earlyHome = page.locator(".raffle-quick-promotion a");
    await expect(earlyHome).toBeInViewport({ ratio: 1 });
    await expect(earlyHome).toContainText("Six cash prizes. Tickets from $20.");
    await earlyHome.click();
    await expect(page).toHaveURL(/\/raffle\/$/);
    const navPurchase = page.locator(".site-nav .nav-ticket");
    await expect(navPurchase).toHaveText("Get Raffle Tickets");
    if (width < 768) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await expect(navPurchase).toBeVisible();
    }
    await navPurchase.click();
    await expect(page).toHaveURL(/#raffle-tickets$/);
    await expect(page.locator("#cash-ticket-heading")).toBeInViewport();
    if (width < 768) {
      const dimensions = await page.locator(".cash-ticket-grid").boundingBox();
      expect(dimensions.height).toBeLessThan(440);
      await expect(page.locator(".cash-ticket-card--featured")).toBeInViewport({
        ratio: 1,
      });
      const top = await page.locator("#cash-ticket-heading").boundingBox();
      const shortcut = await page
        .locator(".cash-mobile-purchase")
        .boundingBox();
      expect(top.y).toBeGreaterThanOrEqual(shortcut.y + shortcut.height);
    }
    for (const route of [
      "vip-dinner",
      "lakewood",
      "piano-guys",
      "fairlawn",
      "chesterland",
    ]) {
      await page.goto(`/${route}/`);
      const early = page.locator(".raffle-early-event");
      await expect(early.getByRole("link")).toHaveAttribute(
        "href",
        route === "piano-guys" ? "#in-person-raffle" : "/raffle/",
      );
      await expect(early).toContainText(
        "Raffle tickets are separate from event admission.",
      );
      expect(
        await early.evaluate((node) => node.previousElementSibling?.tagName),
      ).toBe("A");
    }
    await page.goto("/media-kit/#cash-raffle-artwork");
    const kit = page.locator("#cash-raffle-artwork");
    await expect(kit).toContainText("tappable link");
    for (const shape of ["square", "story"]) {
      const download = kit.locator(
        `a[download][href="/media-kit/neo-chosen-raffle-${shape}.png"]`,
      );
      const response = await page.request.get(
        await download.getAttribute("href"),
      );
      expect(response.ok()).toBe(true);
      const bytes = await response.body();
      expect(bytes.subarray(1, 4).toString()).toBe("PNG");
      expect(bytes.readUInt32BE(16)).toBe(1080);
      expect(bytes.readUInt32BE(20)).toBe(shape === "square" ? 1080 : 1920);
    }
  });
}
