import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  breakfastPage,
  breakfastRoute,
} from "../../scripts/breakfast-page.mjs";
import { applySiteChrome } from "../../scripts/site-chrome.mjs";

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
});
for (const width of [320, 1440]) {
  test(`breakfast meets WCAG AA at ${width}px including validation`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const configured of [false, true]) {
      if (configured)
        await page.route(`**${breakfastRoute}`, (route) =>
          route.fulfill({
            contentType: "text/html",
            body: applySiteChrome(
              breakfastPage("/api/test-breakfast-requests"),
              breakfastRoute,
            ),
          }),
        );
      await page.goto(breakfastRoute);
      if (configured) await page.locator(".breakfast-submit").click();
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
