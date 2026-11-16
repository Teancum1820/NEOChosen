import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
});

for (const width of [320, 390, 768, 1440]) {
  for (const route of ["/#schedule-update", "/fairlawn/"]) {
    test(`${route} meets WCAG AA at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      expect((await page.goto(route))?.ok(), route).toBe(true);
      await expect(page.locator("main h1")).toBeVisible();
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(
        result.violations.map((v) => ({
          id: v.id,
          targets: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
    });
  }
}
