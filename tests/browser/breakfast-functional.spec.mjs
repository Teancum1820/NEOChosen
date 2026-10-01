import { test, expect } from "@playwright/test";
import {
  breakfastPage,
  breakfastRoute,
} from "../../scripts/breakfast-page.mjs";
import { applySiteChrome } from "../../scripts/site-chrome.mjs";

// Receiver behavior is isolated in local mocks. These tests send no real requests
// and do not claim the missing production receiving system has been verified.
const receiver = "/api/test-breakfast-requests";
test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
});
async function configuredPage(page) {
  await page.route(`**${breakfastRoute}`, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: applySiteChrome(breakfastPage(receiver), breakfastRoute),
    }),
  );
  await page.goto(breakfastRoute);
}
async function fillRequest(page) {
  await page
    .getByRole("textbox", { name: "Name", exact: true })
    .fill("Local Review Test");
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("review@example.invalid");
  await page
    .getByRole("textbox", { name: "City / Community", exact: true })
    .fill("Test community");
  await page
    .getByRole("combobox", { name: "Preferred Gathering", exact: true })
    .selectOption("east-side");
  await page
    .getByRole("textbox", {
      name: "Briefly tell us about your community involvement or why you would like to participate.",
      exact: true,
    })
    .fill("Synthetic local test; no real submission.");
}

test("breakfast content, privacy and unavailable receiver are explicit", async ({
  page,
}) => {
  const posts = [];
  page.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });
  await page.goto(breakfastRoute);
  await expect(page.locator("h1")).toHaveText(
    "Northeast OhioInterfaith & CommunityLeaders Breakfast",
  );
  await expect(page.locator(".breakfast-hero-facts")).toContainText(
    "November 14",
  );
  await expect(page.locator(".breakfast-hero-facts")).toContainText(
    "8:00–9:30 AM",
  );
  await expect(page.locator(".breakfast-hero-facts")).toContainText(
    "October 25, 2026",
  );
  await expect(
    page.getByText(
      "Exact venue information will be provided directly to confirmed guests.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.locator("#request-availability")).toContainText(
    "does not send information",
  );
  await expect(page.locator(".breakfast-submit")).toBeDisabled();
  const html = await page.content();
  expect(html).not.toMatch(
    /lu\.ma|luma\.com|google\.com\/maps|maps\.google|geo\.position|latitude|longitude|application\/ld\+json/i,
  );
  await page
    .getByRole("link", { name: "Request East Side", exact: true })
    .click();
  await expect(page.locator("#breakfast-gathering")).toHaveValue("east-side");
  await expect(page.locator("#breakfast-gathering")).toBeFocused();
  await page
    .getByRole("link", { name: "Request South / Summit", exact: true })
    .click();
  await expect(page.locator("#breakfast-gathering")).toHaveValue(
    "south-summit",
  );
  await expect(
    page.getByRole("link", {
      name: "View the Full NEOChosen Weekend Schedule",
    }),
  ).toHaveAttribute("href", "/#events");
  expect(posts).toEqual([]);
});

test("configured form validates before sending and preserves data on server error", async ({
  page,
}) => {
  let posts = 0;
  await page.route(`**${receiver}`, (route) => {
    posts++;
    return route.fulfill({ status: 503, json: { ok: false } });
  });
  await configuredPage(page);
  await page.locator(".breakfast-submit").click();
  await expect(page.locator("#breakfast-name")).toBeFocused();
  await expect(page.locator("#breakfast-name")).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  expect(posts).toBe(0);
  await fillRequest(page);
  await page.locator("#breakfast-email").fill("not-an-email");
  await page.locator(".breakfast-submit").click();
  await expect(page.locator("#breakfast-email")).toBeFocused();
  await expect(page.locator("#error-email")).toHaveText(
    "Enter a valid email address.",
  );
  expect(posts).toBe(0);
  await page.locator("#breakfast-email").fill("review@example.invalid");
  await page.locator(".breakfast-submit").click();
  await expect(page.locator("#request-status")).toContainText(
    "could not confirm receipt",
  );
  await expect(page.locator("#breakfast-name")).toHaveValue(
    "Local Review Test",
  );
  await expect(page.locator(".breakfast-submit")).toBeEnabled();
  expect(posts).toBe(1);
});

test("loading prevents duplicates and only saved-record acknowledgement shows success", async ({
  page,
}) => {
  let release;
  let posts = 0;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route(`**${receiver}`, async (route) => {
    posts++;
    const data = route.request().postData();
    expect(data).toContain("review@example.invalid");
    expect(data).toContain("east-side");
    await gate;
    await route.fulfill({
      status: 201,
      json: { ok: true, id: "synthetic-local-record" },
    });
  });
  await configuredPage(page);
  await fillRequest(page);
  await page.locator(".breakfast-submit").click();
  await expect(page.locator("#request-status")).toHaveAttribute(
    "data-state",
    "loading",
  );
  await expect(page.locator(".breakfast-submit")).toBeDisabled();
  await expect(page.locator("form")).toHaveAttribute("aria-busy", "true");
  release();
  await expect(page.locator("#request-status")).toContainText(
    "Attendance is not yet confirmed",
  );
  await expect(page.locator("#request-status")).toBeFocused();
  await expect(page.locator("#breakfast-name")).toBeDisabled();
  await expect(page.locator(".breakfast-submit")).toBeDisabled();
  expect(posts).toBe(1);
});

test("ambiguous acknowledgement and network loss never report success", async ({
  page,
}) => {
  for (const failure of ["ambiguous", "network"]) {
    await page.route(`**${receiver}`, (route) =>
      failure === "network"
        ? route.abort()
        : route.fulfill({ status: 200, json: { ok: true } }),
    );
    await configuredPage(page);
    await fillRequest(page);
    await page.locator(".breakfast-submit").click();
    await expect(page.locator("#request-status")).toHaveAttribute(
      "data-state",
      "error",
    );
    await expect(page.locator("#breakfast-email")).toHaveValue(
      "review@example.invalid",
    );
    await page.unroute(`**${receiver}`);
  }
});

test("all review widths have no overflow, loaded photo and usable fields", async ({
  page,
}) => {
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(breakfastRoute);
    await page.locator(".breakfast-community-photo").scrollIntoViewIfNeeded();
    expect(
      await page
        .locator(".breakfast-community-photo img")
        .evaluate(async (image) => {
          await image.decode();
          return image.naturalWidth;
        }),
    ).toBeGreaterThan(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    await page
      .getByRole("link", { name: "Request East Side", exact: true })
      .click();
    await expect(page.locator("#breakfast-gathering")).toBeFocused();
    const bounds = await page.locator("#breakfast-name").boundingBox();
    expect(bounds.height).toBeGreaterThanOrEqual(48);
    expect(bounds.width).toBeGreaterThan(200);
  }
});
