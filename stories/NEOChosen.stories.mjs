import { existing, sponsor } from "./fragments.mjs";

const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const frame = (content, { light = false, mobile = false } = {}) =>
  `<div class="neo-workshop${light ? " neo-workshop--light" : ""}"><div class="neo-workshop__inner${mobile ? " neo-workshop__mobile" : ""}">${content}</div></div>`;
const button = ({
  label = "Explore events",
  disabled = false,
  loading = false,
  state = "",
} = {}) =>
  `<button class="neo-workshop-button${state ? ` is-${state}` : ""}" type="button"${disabled ? " disabled" : ""}${loading ? ' aria-busy="true"' : ""}>${esc(label)}</button>`;

export default { title: "Design System / NEOChosen" };

export const Overview = {
  render: () =>
    frame(`<div class="neo-workshop__stack">
    <p class="neo-workshop__label">Design review · development only</p>
    <h1 style="font: 600 var(--type-h1)/var(--leading-tight) var(--font-display); margin: 0">NEOChosen</h1>
    <p style="max-width: var(--content-narrow); font-size: var(--type-body-lg)">A visual index of the current site and the tokens that will guide the next redesign. Sponsor examples use approved records and artwork from the production baseline.</p>
    <div class="neo-workshop__swatches">
      <div class="neo-workshop__swatch" style="--swatch: var(--color-brand-background)">Brand background</div>
      <div class="neo-workshop__swatch" style="--swatch: var(--color-surface-elevated)">Elevated surface</div>
      <div class="neo-workshop__swatch" style="--swatch: var(--color-brand-gold); --swatch-text: #100d08">Brand gold</div>
      <div class="neo-workshop__swatch" style="--swatch: var(--color-accent-teal)">Teal accent</div>
    </div>
    <div class="neo-workshop__row">${button()} <a class="neo-workshop-link" href="/sponsors/">View sponsors</a></div>
    ${existing("home", ".event-item")}
    ${sponsor("great-lakes-auto-group")}
    ${existing("home", ".performer-card")}
  </div>`),
};

export const Typography = {
  render: () =>
    frame(`<div class="neo-workshop__stack">
    <p class="neo-workshop__label">Type scale · Cinzel / Montserrat</p>
    <div style="font: 600 var(--type-display)/var(--leading-tight) var(--font-display)">Music, Faith &amp; Community</div>
    <h1 style="font: 600 var(--type-h1)/var(--leading-tight) var(--font-display); margin: 0">Hero and H1 title</h1>
    <h2 style="font: 600 var(--type-h2)/var(--leading-tight) var(--font-display); margin: 0">Section H2 title</h2>
    <h3 style="font: 600 var(--type-h3)/var(--leading-tight) var(--font-display); margin: 0">Card H3 title</h3>
    <h4 style="font: 700 var(--type-h4)/1.3 var(--font-body); margin: 0">Subheading H4 title</h4>
    <p style="font-size: var(--type-body-lg); margin: 0">Body large: join us for a weekend of music and community.</p>
    <p style="font-size: var(--type-body); margin: 0">Body: clear date, time, venue, and registration details.</p>
    <small style="font-size: var(--type-small)">Caption: November 13–15, 2026</small>
    <p class="neo-workshop__label">Eyebrow / overline</p>
    <div class="neo-workshop__row">${button()} <a class="neo-workshop-link" href="/#events">Read event details</a></div>
  </div>`),
};
export const Spacing = {
  render: () =>
    frame(`<div class="neo-workshop__stack"><p class="neo-workshop__label">Predictable spacing scale</p>
    ${["1", "2", "3", "4", "6", "8", "12", "16"].map((n) => `<div><small>--space-${n}</small><div class="neo-workshop__space" style="--size: var(--space-${n})"></div></div>`).join("")}
  </div>`),
};

export const ButtonDefault = {
  args: { label: "Explore events" },
  render: (args) => frame(button(args)),
};
export const ButtonHover = { render: () => frame(button({ state: "hover" })) };
export const ButtonFocus = { render: () => frame(button({ state: "focus" })) };
export const ButtonDisabled = {
  render: () => frame(button({ disabled: true })),
};
export const ButtonLoading = {
  render: () => frame(button({ label: "Loading…", loading: true })),
};
export const ButtonLongText = {
  render: () =>
    frame(
      button({
        label: "Explore sponsorship opportunities for the entire weekend",
      }),
    ),
};
export const ButtonMobile = {
  render: () =>
    frame(button({ label: "Reserve free ticket" }), { mobile: true }),
};
export const Link = {
  render: () =>
    frame(
      '<a class="neo-workshop-link" href="/sponsors/">Meet the NEOChosen sponsors →</a>',
    ),
};
export const Container = {
  render: () =>
    frame(
      '<div style="max-width:var(--content-narrow); padding:var(--space-8); border:1px solid var(--color-border-subtle)">A narrow reading container inside the standard page width.</div>',
    ),
};
export const Section = {
  render: () =>
    frame(
      '<section style="padding-block:var(--space-section-md); border-block:1px solid var(--color-border-subtle)"><p class="neo-workshop__label">Section</p><h2>Meaningful moments together</h2><p>Section spacing follows the shared token scale.</p></section>',
    ),
};
export const Heading = { render: Typography.render };
export const EventCard = {
  render: () => frame(existing("home", ".event-item")),
};
export const EventCardLongText = {
  render: () =>
    frame(
      existing("home", ".event-item").replace(
        "VIP Donor Dinner",
        "A deliberately long event title that tests wrapping on a narrow phone",
      ),
      { mobile: true },
    ),
};
export const SponsorCredit = {
  render: () => frame(existing("home", '[data-sponsor-event="akron"]')),
};
export const SponsorCreditMobile = {
  render: () =>
    frame(existing("home", '[data-sponsor-event="fairlawn"]'), {
      mobile: true,
    }),
};
export const SponsorCardGreatLakes = {
  render: () => frame(sponsor("great-lakes-auto-group")),
};
export const SponsorCardFNA = { render: () => frame(sponsor("fna")) };
export const SponsorCardAdvancedCare = {
  render: () => frame(sponsor("advanced-care")),
};
export const SponsorCardBarons = { render: () => frame(sponsor("barons-bus")) };
export const SponsorCardMobile = {
  render: () => frame(sponsor("great-lakes-auto-group"), { mobile: true }),
};
export const SponsorTier = {
  render: () => frame(existing("sponsors", ".neo-sponsor-section")),
};
export const PerformerCard = {
  render: () => frame(existing("home", ".performer-card")),
};
export const CTASection = {
  render: () => frame(existing("home", ".cta-band")),
};
export const Navigation = { render: () => existing("home", ".site-nav") };
export const FormControls = {
  render: () =>
    frame(
      `<form class="neo-workshop__stack" action="#"><label class="neo-workshop-field">Email address<input type="email" name="email" autocomplete="email" placeholder="you@example.com" required></label><label class="neo-workshop-field">Interest<select name="interest"><option>Event updates</option><option>Sponsorship</option></select></label><label class="neo-workshop-field">Message<textarea name="message" rows="3"></textarea></label>${button({ label: "Preview only" })}</form>`,
    ),
};
export const FormControlsError = {
  render: () =>
    frame(
      '<label class="neo-workshop-field">Email address<input type="email" aria-invalid="true" aria-describedby="email-error" value="invalid"><span class="neo-workshop-error" id="email-error">Enter a valid email address.</span></label>',
    ),
};
export const FormControlsDisabled = {
  render: () =>
    frame(
      '<label class="neo-workshop-field">Email address<input type="email" value="updates@example.com" disabled></label>',
    ),
};
