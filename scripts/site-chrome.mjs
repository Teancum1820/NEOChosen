const link = (href, label, currentPath, className = '') =>
  `<a href="${href}"${className ? ` class="${className}"` : ''}${href === currentPath ? ' aria-current="page"' : ''}>${label}</a>`;

export function applySiteChrome(html, currentPath) {
  if (!html.includes('class="site-nav"')) return html; // Preserve redirect documents.
  // Same approved fonts, served locally for reliable critical rendering.
  html = html.replace(/\s*<link[^>]+href="https:\/\/(?:fonts.googleapis.com|fonts.gstatic.com)[^>]+>/g, '')
    .replace('href="/images/favicon.png"', 'href="/images/neo-favicon.png"');
  if (!html.includes('href="/fonts.css"')) html = html.replace('</head>', '<link rel="stylesheet" href="/fonts.css">\n</head>');
  // Base Google Ads tag; conversion events are configured separately.
  if (!html.includes('gtag/js?id=AW-18530665275')) {
    html = html.replace('</head>', `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18530665275"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-18530665275', {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });
</script>
</head>`);
  }
  if (!html.includes('src="/ticket-interest.js"')) html = html.replace('</head>', '<script src="/ticket-interest.js" defer></script>\n</head>');
  if (!html.includes('src="/meta-pixel.js"')) html = html.replace('</head>', '<script src="/meta-pixel.js" defer></script>\n</head>');
  // Preserve old links for visitors who already have them while unlisting archive pages.
  if (currentPath !== '/' && currentPath !== '/sponsors/' && !/<meta\s+name="robots"/i.test(html)) {
    html = html.replace('</head>', '<meta name="robots" content="noindex">\n</head>');
  }
  const nav = `<a class="site-skip-link" href="#main-content">Skip to content</a>
  <nav class="site-nav" aria-label="Main navigation">
    <a class="site-wordmark" href="/" aria-label="NEOChosen home">NEO<span> Chosen</span></a>
    <div class="site-closeout-links">
      ${link('/', 'THANK YOU!', currentPath)}
      ${link('/sponsors/', 'Sponsors', currentPath)}
    </div>
  </nav>`;
  const footer = `<footer class="site-footer">
    <div class="site-footer-bottom site-closeout-footer">
      <p>&copy; 2026 Kirtland Heritage Group. All Rights Reserved.</p>
      <nav class="site-privacy-links" aria-label="Privacy"><a href="/privacy/">Privacy &amp; cookies</a><button type="button" data-meta-consent-open>Cookie settings</button></nav>
    </div>
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
