import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { events } from "./event-pages.mjs";

const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const metadata = (event) => ({
  event_slug: event.slug,
  event_title: event.title,
  event_location: event.venue,
  event_date: event.startDate.slice(0, 10),
  ticket_provider: event.slug === "piano-guys" ? "ticketmaster" : "zeffy",
  link_type: "ticket_outbound",
});

export function applyAnalytics(html, route) {
  if (html.includes("/tracking/analytics.js"))
    throw new Error(`Duplicate analytics owner: ${route}`);
  let n = 0;
  html = html.replace(
    /<a\b[^>]*\bhref=(["'])(.*?)\1[^>]*>/g,
    (tag, quote, href) => {
      const url = href.replaceAll("&amp;", "&");
      const event = events.find((event) => event.url === url);
      let key, name;
      if (event) {
        key = event.slug;
        name =
          event.slug === "vip-dinner"
            ? "vip_dinner_click"
            : event.slug === "piano-guys"
              ? "ticket_button_click"
              : "registration_button_click";
      } else if (
        ["#events", "/#events", "#tickets", "/#tickets"].includes(url)
      ) {
        key = "weekend";
        name = "schedule_button_click";
      } else {
        const detail = events.find((e) => url === `/${e.slug}/`);
        if (detail) {
          key = detail.slug;
          name = "event_details_click";
        }
      }
      if (!key) {
        if (
          /https:\/\/(www\.)?(ticketmaster\.com\/event\/|zeffy\.com\/[^/]+\/ticketing\/)/.test(
            url,
          )
        )
          throw new Error(`Unmapped ticket URL on ${route}: ${url}`);
        return tag;
      }
      const button = `${route.replace(/[^a-z0-9]+/gi, "_") || "home"}_${key}_${++n}`;
      return (
        tag.slice(0, -1) +
        ` data-analytics-event="${name}" data-analytics-key="${key}" data-analytics-button="${escape(button)}">`
      );
    },
  );
  return html.replace(
    "</head>",
    '<script src="/tracking/analytics.js" defer></script></head>',
  );
}

export async function writeAnalyticsConfig(root, out) {
  const file = path.join(out, "tracking", "analytics-config.json");
  const config = JSON.parse(
    await readFile(
      path.join(root, "tracking", "analytics-config.json"),
      "utf8",
    ),
  );
  config.contentRoutes = Object.fromEntries(
    events.map((e) => [`/${e.slug}`, metadata(e)]),
  );
  config.linkEvents = Object.fromEntries(
    events.map((e) => [e.slug, metadata(e)]),
  );
  config.linkEvents.weekend = {
    event_slug: "weekend",
    event_title: "NEOChosen Weekend",
    link_type: "schedule_navigation",
  };
  await writeFile(file, JSON.stringify(config, null, 2) + "\n");
}
