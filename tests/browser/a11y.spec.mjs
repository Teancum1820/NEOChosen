import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
});

for (const [name, route] of [
  ["homepage", "/"],
  ["sponsors", "/sponsors/"],
  ["event", "/chesterland/"],
  ["VIP dinner", "/vip-dinner/"],
  ["Lakewood", "/lakewood/"],
  ["Piano Guys", "/piano-guys/"],
  ["Fairlawn", "/fairlawn/"],
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

test("mobile homepage and open navigation meet WCAG AA checks", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const menuOpen of [false, true]) {
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
