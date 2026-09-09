const socialLinks = `<a href="https://www.facebook.com/people/Kirtland-Heritage-Group/61572253884775/" target="_blank" rel="noopener noreferrer" aria-label="Facebook (opens in a new tab)"><svg class="follow-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33V21.88A9.962 9.962 0 0022 12z" clip-rule="evenodd" />
            </svg><span>Facebook</span></a><a href="https://www.instagram.com/kirtland.heritage.group" target="_blank" rel="noopener noreferrer" aria-label="Instagram (opens in a new tab)"><svg class="follow-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zM12 7.177a4.823 4.823 0 100 9.646 4.823 4.823 0 000-9.646zm0 7.78a2.953 2.953 0 110-5.906 2.953 2.953 0 010 5.906zM20.15 5.562a1.28 1.28 0 10-2.56 0 1.28 1.28 0 002.56 0z" clip-rule="evenodd" />
            </svg><span>Instagram</span></a>`;
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
  </nav><div class="site-follow-bar" role="group" aria-label="Follow NEOChosen"><span class="follow-label">Follow Us</span>${socialLinks}</div>`;
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
        ${item('/sponsorship-opportunities/', 'Become a Sponsor')}${item('/sponsors/', 'Our Sponsors')}${item('/donations/', 'Make a Donation')}${item('/get-involved/#volunteer', 'Volunteer')}${item('/sponsorship-opportunities/#program-advertising-specs', 'Program Advertising Specs')}${item('/media-kit/', 'Media Kit')}
      </nav>
      <div class="site-footer-contact">
        <h2>Stay Connected</h2>
        <a href="mailto:info@kirtlandheritagegroup.com">info@kirtlandheritagegroup.com</a>
        <a href="tel:+14407961642">440-796-1642</a>
        <div class="site-follow-links">${socialLinks}</div>
        ${item('/social-media-links/', 'All social links')}
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
