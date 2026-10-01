import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { page, action, escape } from "./editorial-page.mjs";
import { renderImage } from "../design-system/image.mjs";

export const breakfastRoute = "/interfaith-community-breakfast/";
export function breakfastPage(endpoint = "") {
  // Only an explicitly configured, same-origin API destination may receive data.
  if (endpoint && !/^\/api\/[a-z0-9/-]+$/.test(endpoint))
    throw Error(
      "BREAKFAST_REQUEST_ENDPOINT must be an approved same-origin /api/ path.",
    );
  const fields = [
    ["name", "Name", "text", "name", 120, true],
    [
      "organization",
      "Organization or Congregation",
      "text",
      "organization",
      180,
      false,
    ],
    ["role", "Position / Role", "text", "organization-title", 160, false],
    ["email", "Email", "email", "email", 254, true],
    ["phone", "Phone", "tel", "tel", 40, false],
    ["community", "City / Community", "text", "address-level2", 160, true],
  ];
  const topics = [
    "The greatest needs facing our communities",
    "Existing programs and resources more people should know about",
    "Work already being done by churches, nonprofits, schools, businesses, and civic organizations",
    "Gaps that collaboration could address",
    "Relationships across faith traditions and organizations",
    "One or two realistic actions leaders could take together afterward",
  ];
  const communityImage = renderImage({
    src: "/images/community/khg-community-gathering-960.webp",
    alt: "A speaker and audience at a Kirtland Heritage Group community gathering",
    width: 1600,
    height: 1067,
    srcSet: [480, 960, 1600].map((width) => ({
      src: `/images/community/khg-community-gathering-${width}.webp`,
      width,
    })),
    sizes: "(max-width:800px) calc(100vw - 48px), 33vw",
  });
  return page({
    title:
      "Northeast Ohio Interfaith & Community Leaders Breakfast | NEOChosen",
    description:
      "Two complimentary, invitation-only regional breakfasts on Saturday, November 14, 2026, 8:00–9:30 AM Eastern. Community leaders: request an invitation by October 25.",
    route: breakfastRoute,
    className: "breakfast-page",
    extraHead:
      '<link rel="stylesheet" href="/breakfast/breakfast.css"><script src="/breakfast/breakfast.js" defer></script>',
    body: `
  <header class="breakfast-hero"><div class="editorial-shell breakfast-hero-grid"><div><p class="editorial-kicker">Kirtland Heritage Group presents · NEOChosen Weekend</p><h1>Northeast Ohio<br><span>Interfaith &amp; Community</span><br>Leaders Breakfast</h1><p class="breakfast-hero-lede">A morning for the people bringing our communities together.</p><div class="editorial-actions">${action("#invitation-request", "Request an invitation", "editorial-button")}<a class="breakfast-hero-link" href="#regional-gatherings">Find your gathering <span aria-hidden="true">↓</span></a></div></div><div class="breakfast-hero-facts"><p class="breakfast-fact-label">Saturday</p><p class="breakfast-date">November 14<span>2026</span></p><p class="breakfast-time">8:00–9:30 AM <span>Eastern</span></p><p class="breakfast-admission">Two Regional Gatherings<br>Complimentary · By Invitation</p><p class="breakfast-deadline">Request an invitation by<br><strong>October 25, 2026</strong></p></div></div><div class="breakfast-hero-foot"><div class="editorial-shell">No cost. No financial ask. A shared commitment to community.</div></div></header>

  <section class="editorial-section editorial-section--white" aria-labelledby="breakfast-purpose-title"><div class="editorial-shell breakfast-purpose-grid"><div class="editorial-copy"><p class="editorial-kicker">A conversation that continues</p><h2 id="breakfast-purpose-title">Relationships that keep working.</h2><p>As part of NEOChosen Weekend, Kirtland Heritage Group is bringing together faith, civic, nonprofit, education, business, and community leaders for two simultaneous breakfasts. The goal is to build relationships among people who care about Northeast Ohio and begin conversations that can lead to greater cooperation across the region.</p><p>This is a working breakfast centered on conversation. Meet other leaders, share community needs, discover existing resources and organizations, and discuss practical ways to work together. We aim to begin relationships and identify realistic opportunities for collaboration. Kirtland Heritage Group will help facilitate follow-up so connections, resources, and potential partnerships continue after the morning.</p></div><figure class="breakfast-community-photo">${communityImage}<figcaption>A Kirtland Heritage Group community gathering</figcaption></figure></div></section>

  <section class="editorial-section breakfast-regions" id="regional-gatherings" aria-labelledby="breakfast-regions-title"><div class="editorial-shell"><div class="breakfast-section-intro"><p class="editorial-kicker">One morning. Two regional conversations.</p><h2 id="breakfast-regions-title">Find your gathering.</h2><p>Both breakfasts take place simultaneously and follow the same format and core discussion themes. Choose the gathering that best connects you with the communities you serve.</p></div><div class="breakfast-region-grid"><article class="breakfast-region"><p class="breakfast-region-number" aria-hidden="true">01 / EAST</p><h3>East Side Gathering</h3><p>Serving Lake County, eastern Greater Cleveland, Geauga County, and surrounding communities.</p><a class="editorial-link" href="#invitation-request" data-gathering="east-side">Request East Side <span aria-hidden="true">→</span></a></article><article class="breakfast-region"><p class="breakfast-region-number" aria-hidden="true">02 / SOUTH</p><h3>South / Summit Gathering</h3><p>Serving Summit County, Portage County, southern Greater Cleveland, and surrounding communities.</p><a class="editorial-link" href="#invitation-request" data-gathering="south-summit">Request South / Summit <span aria-hidden="true">→</span></a></article></div><p class="breakfast-venue-note">Exact venue information will be provided directly to confirmed guests.</p></div></section>

  <section class="editorial-section editorial-section--navy breakfast-conversation" aria-labelledby="breakfast-conversation-title"><div class="editorial-shell"><p class="editorial-kicker">People. Needs. Possibilities.</p><h2 id="breakfast-conversation-title">People who care.<br>Ideas we can act on.</h2><div class="breakfast-conversation-grid"><div class="editorial-copy"><h3>Who should request an invitation?</h3><p>Each gathering will bring together approximately 75–100 leaders actively serving their communities. We welcome faith and interfaith leaders; nonprofit and community-service organizations; civic and public-service leaders; educators; business and philanthropic leaders; service organizations; neighborhood advocates; and others strengthening Northeast Ohio.</p><p>Participation is about community involvement, not just titles. Outreach leaders, administrators, ministry leaders, volunteer coordinators, and other engaged collaborators are welcome to request an invitation.</p><p class="breakfast-emphasis">Your work in the community matters more than your title.</p></div><div><h3>What we’ll discuss</h3><ol class="breakfast-topics">${topics.map((topic) => `<li>${escape(topic)}</li>`).join("")}</ol></div></div></div></section>

  <section class="editorial-section breakfast-expectations" aria-labelledby="breakfast-expectations-title"><div class="editorial-shell breakfast-expectations-grid"><div><p class="editorial-kicker">What to expect</p><h2 id="breakfast-expectations-title">A welcoming place to listen.</h2></div><div class="editorial-copy"><p>There is no cost to attend and no financial ask. This is not a political forum or theological debate. It is an opportunity to listen, build connections, and find ways to work together for the good of the community.</p><h3>Special guests, shared purpose</h3><p>The breakfasts will include special guests participating in NEOChosen Weekend, including guests from <em>The Chosen</em> and The Piano Guys. Their participation is part of the morning, while the emphasis remains on community leaders, relationships, and collaboration. Guest participation may differ between gatherings.</p></div></div></section>

  <section class="editorial-section editorial-section--white breakfast-request" id="invitation-request" aria-labelledby="breakfast-request-title"><div class="editorial-shell"><p class="editorial-kicker">Requests due October 25, 2026</p><h2 id="breakfast-request-title">Start with an invitation request.</h2><div class="breakfast-request-grid"><div class="breakfast-request-intro"><p>Attendance is complimentary and by invitation. Tell us about the community you serve and the gathering you prefer.</p><p id="request-explanation">Because seating is limited and we are seeking broad representation across communities and organizations, submitting this form does not automatically confirm attendance. We will follow up directly with invitation and RSVP information.</p><div class="breakfast-next"><h3>What happens next</h3><ol><li>Submit your invitation request.</li><li>Our team follows up with invitation and RSVP information.</li><li>Confirmed guests receive exact venue information directly.</li></ol></div></div><div class="breakfast-form-wrap">
  <div class="breakfast-form-notice" id="request-availability" role="status"${endpoint ? " hidden" : ""}><strong>Invitation requests are not open yet.</strong><p>This form is shown for review and does not send information. It will accept requests once the submission connection is ready.</p></div>
  <form id="breakfast-request-form" method="post" action="${escape(endpoint || "#invitation-request")}" data-endpoint="${escape(endpoint)}" aria-describedby="request-explanation request-availability"><p class="breakfast-required-note">Fields marked * are required.</p><div class="breakfast-fields">${fields.map(([id, label, type, autocomplete, maxlength, required]) => `<div class="breakfast-field"><label for="breakfast-${id}">${escape(label)}${required ? ' <span aria-hidden="true">*</span>' : ' <span class="breakfast-optional">(optional)</span>'}</label><input id="breakfast-${id}" name="${id}" type="${type}" autocomplete="${autocomplete}" maxlength="${maxlength}"${required ? " required" : ""} aria-describedby="error-${id}"><p class="breakfast-field-error" id="error-${id}" hidden></p></div>`).join("")}<div class="breakfast-field breakfast-field--full"><label for="breakfast-gathering">Preferred Gathering <span aria-hidden="true">*</span></label><select id="breakfast-gathering" name="gathering" required aria-describedby="error-gathering"><option value="">Choose your gathering</option><option value="east-side">East Side</option><option value="south-summit">South / Summit</option></select><p class="breakfast-field-error" id="error-gathering" hidden></p></div><div class="breakfast-field breakfast-field--full"><label for="breakfast-involvement">Briefly tell us about your community involvement or why you would like to participate. <span aria-hidden="true">*</span></label><textarea id="breakfast-involvement" name="involvement" rows="5" maxlength="3000" required aria-describedby="involvement-help error-involvement"></textarea><p class="breakfast-field-help" id="involvement-help">Share the communities you serve and what you hope to contribute to the conversation.</p><p class="breakfast-field-error" id="error-involvement" hidden></p></div></div><button class="editorial-button breakfast-submit" type="submit"${endpoint ? "" : " disabled"}>Request an invitation <span aria-hidden="true">→</span></button><p class="breakfast-form-status" id="request-status" role="status" tabindex="-1" hidden></p><noscript><p>JavaScript is required to submit this request. Enable JavaScript and reload this page.</p></noscript></form>
  </div></div></div></section>

  <section class="breakfast-weekend"><div class="editorial-shell"><div><p class="editorial-kicker">November 13–15, 2026</p><h2>Part of a weekend that brings people together.</h2></div>${action("/#events", "View the Full NEOChosen Weekend Schedule", "editorial-button")}</div></section>`,
  });
}

export async function writeBreakfastPage(outDir) {
  const dir = path.join(outDir, breakfastRoute);
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, "index.html"),
    breakfastPage(process.env.BREAKFAST_REQUEST_ENDPOINT || ""),
    "utf8",
  );
}
