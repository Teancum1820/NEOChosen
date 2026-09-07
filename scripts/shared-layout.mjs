export const sharedHeader = `
  <nav class="site-nav" aria-label="Main navigation">
    <a class="site-wordmark" href="/" aria-label="NEOChosen home">NEO<span>Chosen</span></a>
    <div class="site-nav-links" id="primary-nav">
      <a href="/" data-nav-route="home">Home</a>
      <a href="/about-us/" data-nav-route="about-us">About Us</a>
      <a href="/get-involved/" data-nav-route="get-involved">Get Involved</a>
      <a href="/media-kit/" data-nav-route="media-kit">Media Kit</a>
      <div class="nav-dropdown">
        <button class="nav-dropdown-toggle" type="button" aria-expanded="false">Our Sponsors</button>
        <div class="nav-dropdown-menu">
          <a href="/sponsors/" data-nav-route="sponsors">Our Sponsors</a>
          <a href="/sponsorship-opportunities/" data-nav-route="sponsorship-opportunities">Become a Sponsor</a>
        </div>
      </div>
      <a href="/donations/" data-nav-route="donations">Donations</a>
      <a href="/raffle/" data-nav-route="raffle">Raffle — Coming Soon</a>
      <a href="/social-media-links/" data-nav-route="social-media-links">Social Media</a>
      <a href="/#tickets" class="nav-ticket">Get Event Tickets</a>
    </div>
    <div class="site-nav-actions"><a class="site-donate" href="/donations/"><span>Donate</span></a><button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" aria-label="Open navigation">Menu</button></div>
  </nav>`;

export const sharedFooter = `
  <footer class="site-footer">
    <p class="footer-logo">Kirtland Heritage Group</p>
    <p>A 501(c)(3) nonprofit dedicated to uniting neighbors in faith &amp; fellowship.</p>
    <p><a href="/about-us/">About</a> &middot; <a href="/sponsors/">Sponsors</a> &middot; <a href="/raffle/">Raffle — Coming Soon</a> &middot; <a href="/social-media-links/">Social Media</a> &middot; <a href="https://www.kirtlandheritagegroup.com/" target="_blank" rel="noopener noreferrer">Kirtland Heritage Group</a></p>
    <p>&copy; 2026 Kirtland Heritage Group. All Rights Reserved.</p>
  </footer>`;

export function applySharedLayout(html, route) {
  if (!html.includes('class="site-nav"') || !html.includes('class="site-footer"')) return html;
  const header = sharedHeader.replace(`data-nav-route="${route}"`, `data-nav-route="${route}" aria-current="page"`);
  return html
    .replace(/\s*<nav class="site-nav"[\s\S]*?<\/nav>/, `\n${header}`)
    .replace(/\s*<footer class="site-footer"[\s\S]*?<\/footer>/, `\n${sharedFooter}`);
}
