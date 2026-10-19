import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
});

for (const width of [320, 390, 768, 1440]) {
  for (const route of ["/raffle/", "/raffle/rules/"]) {
    test(`${route} meets WCAG AA at ${width}px including navigation`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      expect((await page.goto(route))?.ok(), route).toBe(true);
      await expect(page.locator("main h1")).toBeVisible();
      for (const menuOpen of width < 1200 ? [false, true] : [false]) {
        if (menuOpen) await page.locator(".nav-toggle").click();
        const result = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        expect(
          result.violations.map((v) => ({
            id: v.id,
            targets: v.nodes.map((n) => n.target),
          })),
        ).toEqual([]);
      }
    });
  }
}
