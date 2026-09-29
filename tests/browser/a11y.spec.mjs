import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
});

for (const [name, route] of [
  ["homepage", "/"],
  ["sponsors", "/sponsors/"],
  ["event", "/chesterland/"],
  ["form page", "/raffle/"],
]) {
  test(`${name} has no serious or critical axe violations`, async ({
    page,
  }) => {
    await page.goto(route);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const severe = result.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact),
    );
    expect(
      severe.map((v) => ({
        id: v.id,
        impact: v.impact,
        targets: v.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
  });
}
