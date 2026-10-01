import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("dist");
const route = "/interfaith-community-breakfast/";
const config = async (file) =>
  JSON.parse((await readFile(file, "utf8")).replace(/,\s*([}\]])/g, "$1"));
const automatic = await config("wrangler.jsonc");
const production = await config("production/wrangler.jsonc");
for (const key of [
  "name",
  "compatibility_date",
  "vars",
  "secrets",
  "ratelimits",
  "observability",
]) {
  assert.deepEqual(
    automatic[key],
    production[key],
    `Automatic and production Worker ${key} must agree`,
  );
}
assert.equal(
  path.resolve(automatic.main),
  path.resolve("production", production.main),
);
assert.equal(
  path.resolve(automatic.assets.directory),
  path.resolve("production", production.assets.directory),
);
assert.deepEqual(
  automatic.assets.run_worker_first,
  production.assets.run_worker_first,
);
assert.equal(automatic.assets.binding, production.assets.binding);
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) => {
        const file = path.join(dir, entry.name);
        return entry.isDirectory() ? files(file) : file;
      }),
    )
  ).flat();
}
const built = await files(root);
const breakfast = await readFile(path.join(root, route, "index.html"), "utf8");
assert.match(
  breakfast,
  /<meta name="robots" content="noindex, nofollow, noarchive">/,
);
assert(
  !breakfast.includes("application/ld+json"),
  "Breakfast must not become a listed structured event",
);
const headers = await readFile(path.join(root, "_headers"), "utf8");
assert.match(
  headers,
  /\/interfaith-community-breakfast\/\*\s+X-Robots-Tag: noindex, nofollow, noarchive/,
);
for (const file of built) {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  if (relative.startsWith("interfaith-community-breakfast/")) continue;
  if (process.env.NEOCHOSEN_REVIEW === "true" && relative.startsWith("review/"))
    continue;
  assert(
    !relative.startsWith("review/"),
    "The approval hub must not be published in production",
  );
  if (file.endsWith(".html")) {
    const html = await readFile(file, "utf8");
    for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
      const url = new URL(href, "https://neochosen.com/");
      assert(
        !["neochosen.com", "www.neochosen.com"].includes(url.hostname) ||
          !url.pathname.startsWith(route.slice(0, -1)),
        `${relative}: breakfast must remain unlinked`,
      );
    }
  }
  if (/sitemap.*\.xml$/i.test(file)) {
    assert(
      !(await readFile(file, "utf8")).includes(route),
      "Breakfast must be absent from every sitemap",
    );
  }
}
console.log(
  "Breakfast is unlinked, excluded from sitemaps and the production review hub, and marked noindex in HTML and HTTP headers.",
);
