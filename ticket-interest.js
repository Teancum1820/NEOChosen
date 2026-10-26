/* Ticket interest only: these Google Ads actions are secondary, not purchases. */
(() => {
  const destinations = new Map([
    ['www.ticketmaster.com/event/05006538EC473EB4', 'AW-18530665275/c4ueCITJ36kdELuGjoRF'],
    ['ticketmaster.com/event/05006538EC473EB4', 'AW-18530665275/c4ueCITJ36kdELuGjoRF'],
    ['www.zeffy.com/en-US/ticketing/an-evening-with-the-chosen', 'AW-18530665275/bsqaCIfJ36kdELuGjoRF']
  ]);
  const sent = new Set();
  function record(event) {
    if (event.type === 'auxclick' && event.button !== 1) return;
    const link = event.target.closest?.('a[href]');
    if (!link || typeof window.gtag !== 'function') return;
    let url;
    try { url = new URL(link.href); } catch { return; }
    if (url.protocol !== 'https:') return;
    const destination = destinations.get(url.hostname + url.pathname.replace(/\/$/, ''));
    if (!destination || sent.has(destination)) return;
    const key = 'neo-ticket-interest:' + destination;
    try { if (sessionStorage.getItem(key)) return; } catch { /* Storage may be disabled. */ }
    window.gtag('event', 'conversion', { send_to: destination, value: 0, currency: 'USD' });
    sent.add(destination);
    try { sessionStorage.setItem(key, '1'); } catch { /* Navigation remains unaffected. */ }
  }
  document.addEventListener('click', record);
  document.addEventListener('auxclick', record);
})();
