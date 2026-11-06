import { test, expect } from "@playwright/test";

async function expectAlignedScreenshot(locator, name) {
  await locator.scrollIntoViewIfNeeded();
  const originalStyle = await locator.getAttribute("style");
  try {
    // Upstream copy changes fractional page offsets. Keep component crops on
    // whole pixels so text rasterization and clip edges stay deterministic.
    await locator.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const pageTop = bounds.top + window.scrollY;
      element.style.position = "relative";
      element.style.top = `${Math.ceil(pageTop) - pageTop}px`;
      element.style.height = `${Math.ceil(bounds.height)}px`;
    });
    await expect(locator).toHaveScreenshot(name);
  } finally {
    await locator.evaluate((element, style) => {
      if (style === null) element.removeAttribute("style");
      else element.setAttribute("style", style);
    }, originalStyle);
  }
}

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
  await page.goto("/");
  // Compare the page after a real consent choice so the fixed notice cannot
  // cover unrelated crops. The saved choice also survives later navigation.
  await page.getByRole("button", { name: "Reject optional cookies" }).click();
  await expect(
    page.getByRole("region", { name: "Cookie preferences" }),
  ).toBeHidden();
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}.reveal{opacity:1!important;transform:none!important}",
  });
});

test("approved Concept A desktop header, hero, event card, sponsor, and footer", async ({
  page,
}) => {
  for (const [name, selector] of [
    ["header", ".site-nav"],
    ["hero", ".home-hero"],
    ["event-card", ".home-event-card"],
    ["weekend-sponsor", ".home-sponsor-ribbon"],
    ["footer", ".site-footer"],
  ]) {
    const item = page.locator(selector).first();
    await item.scrollIntoViewIfNeeded();
    if (name === "event-card") {
      await expectAlignedScreenshot(item, `${name}.png`);
    } else {
      if (name === "footer") {
        // The sponsor content changes the footer's fractional page offset.
        // Align this crop to whole pixels while retaining its measured height.
        await item.evaluate((footer) => {
          const bounds = footer.getBoundingClientRect();
          const pageTop = bounds.top + window.scrollY;
          footer.style.top = `${Math.ceil(pageTop) - pageTop}px`;
          footer.style.height = `${Math.ceil(bounds.height)}px`;
        });
      }
      await expect(item).toHaveScreenshot(`${name}.png`);
    }
  }
});

test("approved mobile navigation and event sponsor credit", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}.reveal{opacity:1!important;transform:none!important}",
  });
  await expect
    .soft(page.locator(".site-nav"))
    .toHaveScreenshot("mobile-header.png");
  const credit = page.locator('[data-sponsor-event="akron"]').first();
  await expectAlignedScreenshot(credit, "mobile-event-sponsor.png");
});

for (const width of [390, 1440]) {
  test(`component crops survive upstream fractional spacing at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const crops =
      width === 390
        ? [["mobile-event-sponsor", '[data-sponsor-event="akron"]']]
        : [["event-card", ".home-event-card"]];
    for (const offset of [0.25, 0.5, 0.75]) {
      await page.locator(".raffle-promotion").evaluate((element, value) => {
        element.style.marginBottom = `${value}px`;
      }, offset);
      for (const [name, selector] of crops) {
        await expectAlignedScreenshot(
          page.locator(selector).first(),
          `${name}.png`,
        );
      }
    }
  });
}

test("coordinated sponsor directory major tier", async ({ page }) => {
  await page.goto("/sponsors/");
  const tier = page.locator(".sponsor-weekend-feature");
  await tier.scrollIntoViewIfNeeded();
  await expect(tier).toHaveScreenshot("sponsor-tier.png");
});

test("approved mobile hero and separate sponsor ribbon", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const [name, selector] of [
    ["mobile-hero", ".home-hero"],
    ["mobile-ribbon", ".home-sponsor-ribbon"],
  ]) {
    await expect(page.locator(selector)).toHaveScreenshot(`${name}.png`, {
      style:
        ".site-nav{visibility:hidden!important}.site-skip-link{display:none!important}",
    });
  }
});
