// Shared static navigation and footer for every built content page.
const link = (href, label, currentPath, className = '') =>
  `<a href="${href}"${className ? ` class="${className}"` : ''}${href === currentPath ? ' aria-current="page"' : ''}>${label}</a>`;

export function applySiteChrome(html, currentPath) {
  if (!html.includes('class="site-nav"')) return html; // Preserve redirect documents.
  if (!html.includes('family=Montserrat')) {
    html = html.replace('</head>', '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">\n</head>');
  }
  const item = (href, label, className) => link(href, label, currentPath, className);
  const dropdown = (id, label, content) => `<div class="nav-dropdown">
    <button class="nav-dropdown-toggle" type="button" aria-expanded="false" aria-controls="${id}">${label}</button>
    <div class="nav-dropdown-menu" id="${id}">${content}</div>
  </div>`;
  const nav = `<a class="site-skip-link" href="#main-content">Skip to content</a>
  <nav class="site-nav" aria-label="Main navigation">
    <a class="site-wordmark" href="/" aria-label="NEOChosen home">NEO<span>Chosen</span></a>
    <div class="site-nav-links" id="primary-nav">
      ${item('/', 'Home')}
      ${item('/#events', 'Events')}
      ${item('/about-us/', 'About Us')}
      ${item('/get-involved/', 'Get Involved')}
      ${dropdown('sponsor-navigation', 'Sponsors', item('/sponsors/', 'Our Sponsors') + item('/sponsorship-opportunities/', 'Become a Sponsor'))}
      ${dropdown('resource-navigation', 'Explore', item('/chesterland/', 'Chesterland Meet &amp; Greet') + item('/media-kit/', 'Media Kit') + item('/raffle/', 'Raffle — Coming Soon') + item('/social-media-links/', 'Social Media'))}
      ${item('/#tickets', 'Get Tickets', 'nav-ticket')}
    </div>
    <div class="site-nav-actions">
      <a class="site-donate" href="/donations/">Donate</a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" aria-label="Open navigation">Menu</button>
    </div>
  </nav>`;
  const footer = `<footer class="site-footer">
    <div class="site-footer-grid">
      <div class="site-footer-brand">
        <a class="site-wordmark" href="/" aria-label="NEOChosen home">NEO<span>Chosen</span></a>
        <p>Uniting neighbors in faith &amp; fellowship across Northeast Ohio.</p>
        <p>Presented by Kirtland Heritage Group, a 501(c)(3) nonprofit.</p>
      </div>
      <nav class="site-footer-links" aria-label="Events and information">
        <h2>Explore</h2>
        ${item('/#events', 'Weekend Events')}${item('/#tickets', 'Get Tickets')}${item('/chesterland/', 'Chesterland Meet &amp; Greet')}${item('/about-us/', 'About Us')}${item('/raffle/', 'Raffle — Coming Soon')}
      </nav>
      <nav class="site-footer-links" aria-label="Support and resources">
        <h2>Get Involved</h2>
        ${item('/sponsorship-opportunities/', 'Become a Sponsor')}${item('/sponsors/', 'Our Sponsors')}${item('/donations/', 'Make a Donation')}${item('/get-involved/', 'Volunteer')}${item('/sponsorship-opportunities/#program-advertising-specs', 'Program Advertising Specs')}${item('/media-kit/', 'Media Kit')}
      </nav>
      <div class="site-footer-contact">
        <h2>Stay Connected</h2>
        <a href="mailto:info@kirtlandheritagegroup.com">info@kirtlandheritagegroup.com</a>
        <a href="tel:+14407961642">440-796-1642</a>
        ${item('/social-media-links/', 'Follow Us on Social Media')}
        <a href="https://www.kirtlandheritagegroup.com/" target="_blank" rel="noopener noreferrer">Kirtland Heritage Group <span aria-label="(opens in a new tab)">↗</span></a>
      </div>
    </div>
    <div class="site-footer-bottom"><p>&copy; 2026 Kirtland Heritage Group. All Rights Reserved.</p><a href="#main-content">Back to top ↑</a></div>
  </footer>`;
  html = html.replace(/<a class="skip-link" href="#main-content">[^<]*<\/a>/, '')
    .replace(/<nav class="site-nav"[\s\S]*?<\/nav>/, nav)
    .replace(/<footer class="site-footer"[\s\S]*?<\/footer>/, footer);
  // Remove legacy page-local menu listeners; site.js owns all menu behavior.
  html = html.replace(/<script>\s*document\.querySelectorAll\('\.site-nav'\)[\s\S]*?<\/script>/g, '');
  if (/<main\b/.test(html)) {
    html = html.replace(/<main\b([^>]*)>/, (_, attrs) => `<main${attrs.replace(/\s+(?:id|tabindex)="[^"]*"/g, '')} id="main-content" tabindex="-1">`);
  } else {
    html = html.replace('</nav>', '</nav><main id="main-content" tabindex="-1">')
      .replace('<footer class="site-footer">', '</main><footer class="site-footer">');
  }
  return html;
}
