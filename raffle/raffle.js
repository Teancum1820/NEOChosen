(() => {
  let tracked = false;
  const trackSignup = () => {
    if (tracked) return;
    tracked = true;
    const body = JSON.stringify({ event: 'raffle_notification_signup', path: location.pathname });
    if (navigator.sendBeacon && navigator.sendBeacon('/api/analytics-events', new Blob([body], { type: 'application/json' }))) return;
    fetch('/api/analytics-events', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => {});
  };

  window.addEventListener('message', (event) => {
    if (event.origin === 'https://www.zeffy.com' && event.data?.type === 'zeffy-embed:thank-you-page-shown') trackSignup();
  });
})();
