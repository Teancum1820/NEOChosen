import { test, expect } from "@playwright/test";
import { raffleLaunch } from "../../scripts/raffle-page.mjs";

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
});

for (const width of [320, 375, 390, 430, 768, 1024, 1200, 1440]) {
  test(`held raffle and draft rules remain readable without checkout at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const route of ["/raffle/", "/raffle/rules/"]) {
      expect((await page.goto(route))?.ok()).toBe(true);
      expect(
        await page.locator(`a[href="${raffleLaunch.checkoutUrl}"]`).count(),
      ).toBe(0);
      await expect(
        page.locator("iframe, [data-zeffy-embed], main form, dialog"),
      ).toHaveCount(0);
      const geometry = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        elementsOutsideViewport: [
          ...document.querySelectorAll("main a, main button, main table"),
        ]
          .filter((node) => {
            const box = node.getBoundingClientRect();
            return (
              box.width > 0 && (box.left < -1 || box.right > innerWidth + 1)
            );
          })
          .map((node) => node.outerHTML.slice(0, 160)),
      }));
      expect(geometry.width, `${route}: overflow`).toBeLessThanOrEqual(width);
      expect(geometry.elementsOutsideViewport).toEqual([]);
      if (route === "/raffle/") {
        await expect(page.locator("main h1")).toHaveText(
          "NEO Chosen Cash Raffle",
        );
        await expect(page.getByLabel("Raffle sales status")).toContainText(
          "Ticket sales are currently closed",
        );
        await expect(page.locator("main .cash-statement")).toContainText(
          "Six cash prizes.",
        );
        const controls = page.locator(".cash-ticket-card button");
        await expect(controls).toHaveCount(3);
        for (const control of await controls.all()) {
          await expect(control).toBeDisabled();
          await expect(control).toHaveText("Sales closed");
        }
        await page
          .getByRole("link", { name: "View ticket packages" })
          .first()
          .click();
        await expect(page).toHaveURL(/#raffle-tickets$/);
        await expect(page.locator("#cash-ticket-heading")).toBeInViewport();
      } else {
        await expect(page.locator("main h1")).toContainText(
          "DRAFT Official Raffle Rules",
        );
        await expect(page.locator(".cash-draft-warning")).toContainText(
          "RAFFLE SALES ARE NOT YET AUTHORIZED",
        );
        await expect(page.locator("#final-approvals")).toContainText(
          "Final approvals required before sales open",
        );
      }
      await testInfo.attach(
        `${route === "/raffle/" ? "raffle" : "rules"}-${width}px`,
        {
          body: await page.screenshot({
            fullPage: true,
            animations: "disabled",
          }),
          contentType: "image/png",
        },
      );
    }
    expect(errors).toEqual([]);
  });
}

test("raffle navigation and all six event promotions show information during hold", async ({
  page,
}) => {
  for (const route of [
    "/",
    "/vip-dinner/",
    "/lakewood/",
    "/piano-guys/",
    "/fairlawn/",
    "/chesterland/",
  ]) {
    await page.goto(route);
    const headerLink = page.locator('.site-nav-links > a[href="/raffle/"]');
    await expect(headerLink).toHaveText("Raffle Info");
    await expect(headerLink).toBeVisible();
    await expect(page.locator('.site-footer a[href="/raffle/"]')).toHaveText(
      "Raffle Info",
    );
    const feature = page.locator(
      'section[aria-labelledby="weekend-raffle-title"]',
    );
    await expect(feature).toContainText("Ticket sales are currently closed");
    await expect(feature.locator('a[href="/raffle/"]')).toHaveCount(1);
    await expect(
      page.locator(`a[href="${raffleLaunch.checkoutUrl}"]`),
    ).toHaveCount(0);
  }
});

for (const width of [320, 390, 768, 1200, 1440]) {
  test(`major pages expose a single top-level raffle information link at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/about-us/",
      "/get-involved/",
      "/sponsors/",
      "/sponsorship-opportunities/",
      "/donations/",
      "/media-kit/",
      "/vip-dinner/",
      "/lakewood/",
      "/piano-guys/",
      "/fairlawn/",
      "/chesterland/",
      "/raffle/",
      "/raffle/rules/",
    ]) {
      expect((await page.goto(route))?.ok(), route).toBe(true);
      if (width < 1200) await page.locator(".nav-toggle").click();
      const infoLink = page.locator('.site-nav-links > a[href="/raffle/"]');
      await expect(infoLink).toHaveCount(1);
      await expect(infoLink).toHaveText("Raffle Info");
      await expect(infoLink).toBeVisible();
      await expect(infoLink).toBeInViewport();
      await expect(
        page.locator('#resource-navigation a[href="/raffle/"]'),
      ).toHaveCount(0);
      await expect(page.locator('.site-footer a[href="/raffle/"]')).toHaveCount(
        1,
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
        route,
      ).toBeLessThanOrEqual(width);
      await expect(
        page.locator(`a[href="${raffleLaunch.checkoutUrl}"]`),
      ).toHaveCount(0);
      if (route === "/raffle/")
        await expect(infoLink).toHaveAttribute("aria-current", "page");
    }
  });
}

for (const width of [390, 1440]) {
  test(`raffle information navigation works with the keyboard at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    if (width < 1200) {
      await page.locator(".nav-toggle").focus();
      await page.keyboard.press("Enter");
      await expect(page.locator(".nav-toggle")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    }
    const infoLink = page.locator('.site-nav-links > a[href="/raffle/"]');
    await infoLink.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/raffle\/$/);
    await expect(infoLink).toHaveAttribute("aria-current", "page");
    const rulesLink = page
      .getByRole("link", { name: "Read raffle rules" })
      .first();
    await rulesLink.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/raffle\/rules\/$/);
  });
}
