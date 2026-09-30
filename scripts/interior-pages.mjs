import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { page, hero, section, callout, action } from "./editorial-page.mjs";
import { renderWeekendTextRecognition } from "./sponsor-system.mjs";

const organization = "Kirtland Heritage Group";
const volunteer =
  "https://docs.google.com/forms/d/e/1FAIpQLSecLbZEnc51XTWfnO8HmHafagxf79lwewNz5V1EEuyZ_SLAcA/viewform";
const dinner =
  "https://www.zeffy.com/en-US/ticketing/vip-donor-dinner-with-the-chosen-and-piano-guys";
const descriptions = {
  "about-us":
    "Kirtland Heritage Group is a Northeast Ohio 501(c)(3) nonprofit connecting neighbors through faith, service, education and community events.",
  "get-involved":
    "Donate, sponsor, volunteer, or reserve an individual VIP donor dinner seat. Find your way to help NEOChosen Weekend.",
  donations:
    "Support free NEOChosen community events through Venmo, card or check. Donations are optional and separate from event registration.",
  "social-media-links":
    "Follow Kirtland Heritage Group on Facebook and Instagram for NEOChosen news, photos, community stories and ticket updates.",
  "media-kit":
    "Find NEOChosen weekend artwork, sponsorship resources, event details and media contacts.",
};
const titles = {
  "about-us": "About Kirtland Heritage Group | NEOChosen",
  "get-involved": "Get Involved | NEOChosen 2026",
  donations: "Donations | NEOChosen",
  "social-media-links": "Follow NEOChosen | Social and Event Updates",
  "media-kit": "Media Kit | NEOChosen 2026",
};
const contact = `<aside class="editorial-aside"><p class="editorial-kicker">Our team</p><h2>Here to help.</h2><p>Joe Jackson<br>President, Kirtland Heritage Group</p><address><a href="mailto:info@kirtlandheritagegroup.com">info@kirtlandheritagegroup.com</a><br><a href="tel:+14407961642">440-796-1642</a></address>${action("/get-involved/", "Find your way to help")}</aside>`;

const about =
  hero(
    organization,
    "People and places connected.",
    "Preserving heritage. Building community across Northeast Ohio.",
    "piano-guys",
  ) +
  section(
    "Our mission",
    "A community with room for everyone.",
    `<div class="editorial-columns"><h3>Faith, service, education, and a shared sense of belonging.</h3><div class="editorial-copy"><p>Kirtland Heritage Group is a Northeast Ohio 501(c)(3) nonprofit. We bring people together through faith, service, educational programs, and family-centered events. Our work connects congregations, schools, community organizations, and neighbors across the region.</p><p>NEOChosen Weekend is one expression of that mission: three days of music, conversation, and accessible public events featuring The Piano Guys and cast members from <em>The Chosen</em>.</p>${action("/#events", "Explore the weekend")}</div></div>`,
  ) +
  section(
    "Beyond one weekend",
    "Faith. Service. Education. Community.",
    `<div class="editorial-values"><div class="editorial-value"><h3>Gather together</h3><p>Concerts, civic and interfaith events that welcome people from different backgrounds.</p></div><div class="editorial-value"><h3>Serve together</h3><p>Volunteer projects supporting local schools, neighborhoods, and community traditions.</p></div><div class="editorial-value"><h3>Stay connected</h3><p>Experiences that bring families, faith communities, and local leaders together.</p>${action("https://www.kirtlandheritagegroup.com/", "Visit Kirtland Heritage Group")}</div></div>`,
    "editorial-section--sand",
  ) +
  callout(
    "Help make it possible.",
    "Give, volunteer, or partner with a weekend that brings people together.",
    "/get-involved/",
    "Explore ways to help",
  );

const paths = [
  [
    "For individual supporters",
    "Make a donation.",
    "Support free public events and Kirtland Heritage Group’s broader community work. Donations are optional and separate from admission.",
    "/donations/",
    "Explore donation options",
  ],
  [
    "For organizations",
    "Become a sponsor.",
    "Choose a partnership with one event or the full weekend. Compare investment levels, audience, benefits, and availability across eight sponsorship paths.",
    "/sponsorship-opportunities/",
    "Compare sponsorships",
  ],
  [
    "Serve together",
    "Volunteer.",
    "Help welcome guests and support weekend activities. Complete the Kirtland Heritage Group volunteer form so the team can contact you.",
    volunteer,
    "Open volunteer form",
  ],
  [
    "Friday, November 13",
    "Join the donor dinner.",
    "The most intimate event of the weekend: dinner, conversation, and opportunities to mingle at Windows on the River. Individual reservations are $200 per person. Come on your own or bring someone you love.",
    "/vip-dinner/",
    "Explore dinner details",
  ],
];
const involved =
  hero(
    "Get involved",
    "Find your way to help.",
    "Your time, generosity, and partnership help bring NEOChosen Weekend to life.",
  ) +
  paths
    .map(
      ([k, t, p, u, l], i) =>
        `<section class="editorial-path"${i === 2 ? ' id="volunteer"' : ""}><div class="editorial-shell"><div><p class="editorial-kicker">${k}</p><h2>${t}</h2></div><div><p>${p}</p><div class="editorial-actions">${action(u, l)}${i === 3 ? action(dinner, "Reserve your dinner seat") : ""}</div></div></div></section>`,
    )
    .join("") +
  callout(
    "Talk with our team.",
    "Joe Jackson can help you find a partnership that fits your organization.",
    "/sponsorship-opportunities/contact/",
    "Contact Joe",
  );

const donations =
  hero(
    "Support the mission",
    "Your generosity brings people together.",
    "Help keep community experiences accessible across Northeast Ohio.",
  ) +
  section(
    "Ways to give",
    "Make a meaningful contribution.",
    `<div class="editorial-article"><div class="editorial-copy"><p>Admission to the Lakewood, Fairlawn, and Chesterland events is free. No donation is required or expected. The Piano Guys concert at Akron Civic Theatre is a separate paid theater event.</p><p>Your support helps Kirtland Heritage Group bring people together across faith traditions through music, service, fellowship, and community.</p><div class="editorial-payments" id="ways-to-donate"><article><h3>Venmo</h3><p>@KirtlandHeritageGroup</p>${action("https://venmo.com/u/KirtlandHeritageGroup", "Donate with Venmo", "editorial-button")}<p>Sign in to Venmo or continue in the app if prompted. On a computer, scan the QR code on our Venmo profile with your phone.</p></article><article><h3>Credit or debit card</h3><p>Choose your amount on our secure Stripe checkout page.</p>${action("https://buy.stripe.com/5kQ3cv9i7eEUfhD5kF6g80b", "Donate by card", "editorial-button")}<p>Look for “Kirtland Heritage Group Donation” at checkout.</p></article></div><div class="editorial-check"><h3>Give by check</h3><p>Make checks payable to <strong>The Kirtland Heritage Group</strong>.</p><address>38323 Apollo Parkway Unit 7<br>Willoughby, Ohio 44094</address></div><p>Payment links open in a new tab. Return here to continue browsing NEOChosen.</p></div>${contact}</div>`,
  ) +
  `<section id="vip-donor-dinner">${section("An invitation", "Join us for dinner.", `<div class="editorial-copy"><p>Reserve an individual seat at the VIP Donor Dinner on Friday, November 13, from 5:00–6:45 PM Eastern at Windows on the River, 2000 Sycamore Street, Cleveland. Reservations are $200 per person while space remains.</p><p>Meet cast members from <em>The Chosen</em>, The Piano Guys, and area leaders over dinner and conversation. Use the dinner reservation page to reserve your seat; general donation checkout does not reserve event admission.</p><div class="editorial-actions">${action(dinner, "Reserve your dinner seat", "editorial-button")}${action("/vip-dinner/", "Dinner details")}${action("/sponsorship-opportunities/", "Business sponsorships")}</div></div>`, "editorial-section--white")}</section>` +
  callout(
    "Give your time.",
    "Volunteers help welcome guests and support weekend activities.",
    "/get-involved/#volunteer",
    "Explore volunteering",
  );

const social =
  hero(
    "Stay connected",
    "Follow the weekend.",
    "Event news, photos, community stories, and ticket updates from Kirtland Heritage Group.",
  ) +
  section(
    "Official channels",
    "Stay in the loop.",
    `<div class="editorial-article"><div class="editorial-copy"><h3>Facebook</h3><p>Follow Kirtland Heritage Group for NEOChosen announcements and community updates.</p>${action("https://www.facebook.com/people/Kirtland-Heritage-Group/61572253884775/", "Open Facebook")}<hr><h3>Instagram</h3><p>See moments from events, behind-the-scenes news, and stories from the weekend.</p>${action("https://www.instagram.com/kirtland.heritage.group", "Open Instagram")}<hr><h3>Share with your community</h3><p>Find event artwork and check current event details before sharing with your congregation, school, or neighbors.</p>${action("/media-kit/", "Explore the media kit")}</div><aside class="editorial-aside"><p class="editorial-kicker">Email updates</p><h2>Get news directly.</h2><p>Sign up for event announcements and official theater-ticket updates.</p>${action("/#event-updates", "Sign up for updates")}</aside></div>`,
  );

// Keep the original downloadable artwork and URLs. Labels describe the artwork
// accurately instead of implying that older print files have been reapproved.
async function media(outDir) {
  const original = await readFile(
    path.join(outDir, "media-kit/index.html"),
    "utf8",
  );
  const assets = [
    ...original.matchAll(/<article class="asset-card">[\s\S]*?<\/article>/g),
  ].map((m) =>
    m[0]
      .replace(
        /Details checked Sep 29, 2026/g,
        "Supplied artwork · check current event details",
      )
      .replace(/class="gold-button"/g, 'class="editorial-link"')
      .replace(/class="asset-preview" src="([^"]+)"/, (_, source) => {
        const basename = path.basename(
          new URL(source, "https://local.test").pathname,
          ".png",
        );
        return `class="asset-preview" src="/images/media-previews/${basename}-480.webp" srcset="/images/media-previews/${basename}-480.webp 480w, /images/media-previews/${basename}-900.webp 900w" sizes="(max-width:800px) calc(100vw - 88px), (max-width:1100px) 43vw, 36vw"`;
      }),
  );
  if (assets.length !== 8) throw Error("Expected eight supplied media assets");
  return (
    hero(
      "Media kit",
      "Share the weekend accurately.",
      "Event artwork, sponsorship resources, and useful information for your community.",
    ) +
    `<aside class="media-note"><div class="editorial-shell"><p><strong>Website facts updated September 30, 2026.</strong> Supplied print artwork is retained below. The donor dinner is now at Windows on the River and presenting-sponsor artwork is being updated. Check the event pages before sharing older files; contact our team for current artwork.</p></div></aside>` +
    section(
      "Weekend overview",
      "Start with the big picture.",
      `<div class="media-grid">${assets.slice(0, 2).join("")}</div>`,
    ) +
    section(
      "Event flyers",
      "Find artwork for your event.",
      `<div class="media-grid">${assets.slice(2).join("")}</div>`,
      "editorial-section--white event-flyers",
    ) +
    section(
      "Media inquiries",
      "Need a current detail or custom asset?",
      `<div class="editorial-actions">${action("/#events", "Check event details")}${action("mailto:info@kirtlandheritagegroup.com", "Contact Kirtland Heritage Group")}</div>${renderWeekendTextRecognition()}`,
      "editorial-section--sand",
    )
  );
}

export async function writeInteriorPages(outDir) {
  for (const [slug, body] of Object.entries({
    "about-us": about,
    "get-involved": involved,
    donations,
    "social-media-links": social,
    "media-kit": await media(outDir),
  })) {
    await writeFile(
      path.join(outDir, slug, "index.html"),
      page({
        title: titles[slug],
        description: descriptions[slug],
        route: `/${slug}/`,
        body,
      }),
    );
  }
  await writeFile(
    path.join(outDir, "sponsors/index.html"),
    page({
      title: "Our Sponsors | NEOChosen 2026",
      description:
        "Meet the presenting sponsors, event partners and community supporters making NEOChosen Weekend possible.",
      route: "/sponsors/",
      extraHead: '<link rel="stylesheet" href="/sponsors/sponsors.css">',
      body:
        hero(
          "Our sponsors",
          "The people who make the weekend possible.",
          "NEOChosen brings communities together with the support of presenting sponsors, event partners, and neighbors across Northeast Ohio.",
        ) +
        "<!-- SPONSOR_DIRECTORY -->" +
        callout(
          "Partner with the weekend.",
          "Explore eight sponsorship paths and find the right fit for your organization.",
          "/sponsorship-opportunities/",
          "Explore sponsorship opportunities",
        ),
    }),
  );
}
