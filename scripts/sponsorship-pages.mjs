import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { sponsorshipAssetPath, sponsorshipBasePath, sponsorshipDecks } from "./sponsorship-decks.mjs";

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const nav = `
  <nav class="site-nav" aria-label="Main navigation">
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">Menu</button>
    <div class="site-nav-links" id="primary-nav">
      <a href="/">Home</a>
      <a href="/about-us/">About Us</a>
      <a href="/get-involved/">Get Involved</a>
      <a href="/media-kit/">Media Kit</a>
      <div class="nav-dropdown">
        <button class="nav-dropdown-toggle" type="button" aria-expanded="false">Our Sponsors</button>
        <div class="nav-dropdown-menu">
          <a href="/sponsors/">Our Sponsors</a>
          <a href="${sponsorshipBasePath}/" aria-current="page">Become a sponsor</a>
        </div>
      </div>
      <a href="/donations/">Donations</a>
      <a href="/raffle/">Raffle</a>
      <a href="/social-media-links/">Social Media</a>
      <a href="/#tickets" class="nav-ticket">Get Tickets</a>
    </div>
  </nav>`;

const footer = `
  <footer class="site-footer">
    <p class="footer-logo">Kirtland Heritage Group</p>
    <p>A 501(c)(3) nonprofit dedicated to uniting neighbors in faith &amp; fellowship.</p>
    <p><a href="/about-us/">About</a> &middot; <a href="/sponsors/">Sponsors</a> &middot; <a href="/social-media-links/">Social Media</a> &middot; <a href="https://www.kirtlandheritagegroup.com/" target="_blank" rel="noopener noreferrer">Kirtland Heritage Group</a></p>
    <p>&copy; 2026 Kirtland Heritage Group. All Rights Reserved.</p>
  </footer>`;

const page = ({ title, description, canonicalPath, body }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="https://neochosenevents.com${escapeHtml(canonicalPath)}">
  <link rel="icon" type="image/png" href="/images/favicon.png">
  <link rel="manifest" href="/manifest.webmanifest">
  <meta name="theme-color" content="#0a0806">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&amp;family=Montserrat:wght@300;400;500;700;800&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${sponsorshipBasePath}/sponsorship.css">
  <link rel="stylesheet" href="/responsive-pages.css">
  <link rel="stylesheet" href="/site.css">
  <script src="/site.js" defer></script>
</head>
<body>
${nav}
${body}
${footer}
  <script src="/pwa-register.js" defer></script>
</body>
</html>
`.replace(/[ \t]+$/gm, "");

const card = (deck) => {
  const featureClass = deck.featured ? ` sponsorship-card--${deck.featured}` : "";
  return `
          <li class="sponsorship-card${featureClass}">
            <p class="sponsorship-card__category">${escapeHtml(deck.category)}</p>
            <h2>${escapeHtml(deck.title)}</h2>
            <p class="sponsorship-card__description">${escapeHtml(deck.description)}</p>
            <div class="sponsorship-card__details">
              <p class="sponsorship-card__price">${escapeHtml(deck.price)}</p>
              ${deck.availability ? `<p class="sponsorship-card__availability">${escapeHtml(deck.availability)}</p>` : ""}
            </div>
            <a class="gold-button sponsorship-card__cta" href="${sponsorshipBasePath}/${escapeHtml(deck.slug)}/">${escapeHtml(deck.cta)}</a>
          </li>`;
};

const landingBody = `
  <main class="page-shell sponsorship-shell">
    <section class="glassmorphism sponsorship-panel">
      <header class="page-header sponsorship-header">
        <p class="eyebrow">NEOChosen 2026</p>
        <h1>Become a Sponsor</h1>
        <p class="hero-subtitle">Supporting NEOChosen connects your organization with thousands of families, faith communities, business leaders, nonprofit leaders, and community organizations throughout Northeast Ohio.</p>
        <p class="sponsorship-header__prompt">Choose a sponsorship opportunity below to see pricing, benefits, and partnership opportunities.</p>
        <div class="divider-line"></div>
      </header>
      <ul class="sponsorship-grid" aria-label="Sponsorship opportunities">
${sponsorshipDecks.map(card).join("\n")}
      </ul>
    </section>
  </main>`;

const detailBody = (deck) => {
  const pdfUrl = `${sponsorshipAssetPath}/${encodeURIComponent(deck.pdfFile)}`;
  const summaryUrl = `${sponsorshipAssetPath}/summaries/${encodeURIComponent(deck.summaryImage)}`;
  return `
  <main class="page-shell sponsorship-shell sponsorship-detail">
    <nav class="sponsorship-breadcrumb" aria-label="Breadcrumb">
      <a href="${sponsorshipBasePath}/">Become a Sponsor</a>
      <span aria-hidden="true">›</span>
      <span aria-current="page">${escapeHtml(deck.title)}</span>
    </nav>
    <section class="glassmorphism sponsorship-panel">
      <header class="sponsorship-detail__header">
        <p class="eyebrow">${escapeHtml(deck.category)}</p>
        <h1>${escapeHtml(deck.title)}</h1>
        <p class="hero-subtitle">${escapeHtml(deck.description)}</p>
        <div class="sponsorship-investment" role="group" aria-label="${escapeHtml(deck.priceLabel)}: ${escapeHtml(deck.price)}">
          <span>${escapeHtml(deck.priceLabel)}</span>
          <strong>${escapeHtml(deck.price)}</strong>
          ${deck.availability ? `<small>${escapeHtml(deck.availability)}</small>` : ""}
        </div>
        <div class="sponsorship-actions" role="group" aria-label="Sponsorship deck actions">
          <a class="gold-button" href="#full-deck">View Full Deck</a>
          <a class="outline-button" href="${pdfUrl}" download>Download PDF</a>
          <a class="outline-button" href="${pdfUrl}" target="_blank" rel="noopener noreferrer">Open PDF in New Tab</a>
        </div>
      </header>

      <section class="sponsorship-section quick-summary" aria-labelledby="quick-summary-heading">
        <div class="sponsorship-section__heading">
          <p class="section-kicker">At a Glance</p>
          <h2 id="quick-summary-heading">Quick Summary</h2>
          <p>Review the key investment levels, benefits, audience, and important approval guidelines before exploring the complete deck.</p>
        </div>
        <a class="summary-preview" href="${pdfUrl}#page=1&amp;view=FitH" target="_blank" rel="noopener noreferrer" aria-label="Open the ${escapeHtml(deck.shortTitle)} quick summary in a new tab">
          <img src="${summaryUrl}" alt="Quick Summary for ${escapeHtml(deck.shortTitle)}" width="${deck.summaryWidth}" height="${deck.summaryHeight}">
          <span>Swipe to read; tap or click to enlarge the Quick Summary</span>
        </a>
      </section>

      <section class="sponsorship-section full-deck" id="full-deck" aria-labelledby="full-deck-heading">
        <div class="sponsorship-section__heading">
          <p class="section-kicker">Complete Details</p>
          <h2 id="full-deck-heading">Full Sponsorship Deck</h2>
          <p>Review complete sponsorship benefits, pricing, audience opportunities, guidelines, and partnership details below.</p>
        </div>
        <div class="sponsorship-actions sponsorship-actions--section">
          <a class="gold-button" href="${pdfUrl}" target="_blank" rel="noopener noreferrer">Open Full Deck</a>
          <a class="outline-button" href="${pdfUrl}" download>Download PDF</a>
        </div>
        <div class="pdf-viewer">
          <object data="${pdfUrl}#page=2&amp;view=FitH" type="application/pdf" title="${escapeHtml(deck.shortTitle)} full sponsorship deck">
            <p>Your browser cannot display the embedded PDF. <a href="${pdfUrl}" target="_blank" rel="noopener noreferrer">Open the full sponsorship deck in a new tab.</a></p>
          </object>
        </div>
        <div class="pdf-mobile-fallback">
          <p>For the best reading experience on a phone, open the full deck in your device's PDF viewer.</p>
          <a class="gold-button" href="${pdfUrl}" target="_blank" rel="noopener noreferrer">Open Full Deck</a>
          <a class="outline-button" href="${pdfUrl}" download>Download PDF</a>
        </div>
      </section>

      <section class="sponsorship-contact" aria-labelledby="sponsorship-contact-heading">
        <p class="section-kicker">Let's Partner</p>
        <h2 id="sponsorship-contact-heading">Interested in becoming a NEOChosen sponsor?</h2>
        <p>We will work with your organization to create a partnership that fits your goals, audience, and budget.</p>
        <address>
          <strong>Joe Jackson</strong><br>
          President, Kirtland Heritage Group<br>
          <a href="tel:+14407961642">440&#8209;796&#8209;1642</a><br>
          <a href="mailto:info@kirtlandheritagegroup.com">info@kirtlandheritagegroup.com</a><br>
          <a href="/">NEOChosen.com</a>
        </address>
        <a class="gold-button" href="mailto:info@kirtlandheritagegroup.com?subject=NEOChosen%202026%20Sponsorship%20Inquiry">Contact Us About Sponsorship</a>
      </section>

      <a class="return-link" href="${sponsorshipBasePath}/">← Return to All Sponsorship Opportunities</a>
    </section>
  </main>`;
};

export async function writeSponsorshipPages(outDir) {
  const landingDir = path.join(outDir, "sponsorship-opportunities");
  await mkdir(landingDir, { recursive: true });
  await writeFile(path.join(landingDir, "index.html"), page({
    title: "Become a Sponsor | NEOChosen 2026",
    description: "Explore NEOChosen 2026 presenting, event, leadership, community, advertising, and activation sponsorship opportunities.",
    canonicalPath: `${sponsorshipBasePath}/`,
    body: landingBody
  }), "utf8");

  for (const deck of sponsorshipDecks) {
    const detailDir = path.join(landingDir, deck.slug);
    await mkdir(detailDir, { recursive: true });
    await writeFile(path.join(detailDir, "index.html"), page({
      title: deck.metaTitle,
      description: deck.metaDescription,
      canonicalPath: `${sponsorshipBasePath}/${deck.slug}/`,
      body: detailBody(deck)
    }), "utf8");
  }
}
