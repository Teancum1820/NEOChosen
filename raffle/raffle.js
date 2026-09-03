(() => {
  const tracked = new Set();
  const track = (event) => {
    if (tracked.has(event)) return;
    tracked.add(event);
    const body = JSON.stringify({ event, path: location.pathname });
    if (navigator.sendBeacon && navigator.sendBeacon('/api/analytics-events', new Blob([body], { type: 'application/json' }))) return;
    fetch('/api/analytics-events', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => {});
  };
  document.querySelectorAll('.general-donation-link').forEach((link) => link.addEventListener('click', () => track('raffle_general_donation_click')));
  window.addEventListener('message', (event) => {
    if (event.origin === 'https://www.zeffy.com' && event.data?.type === 'zeffy-embed:thank-you-page-shown') track('raffle_notification_signup');
  });

  const form = document.querySelector('#prize-donation-form');
  const status = document.querySelector('#prize-form-status');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault(); status.className = 'form-status';
    if (!form.reportValidity()) return;
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true; button.textContent = 'Submitting…'; status.textContent = 'Submitting your prize information…';
    try {
      const response = await fetch('/api/prize-donations', { method: 'POST', body: new FormData(form) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'We could not submit the form. Please try again.');
      form.reset(); status.classList.add('success'); status.textContent = 'Thank you. Your prize proposal was received, and Kirtland Heritage Group will follow up with you.'; track('raffle_prize_donation_submission');
    } catch (error) { status.classList.add('error'); status.textContent = error.message; }
    finally { button.disabled = false; button.textContent = 'Donate or Pledge a Prize'; }
  });

  const render = () => {
    const data = window.NEOCHOSEN_RAFFLE_DATA || { prizes: [], partners: [] };
    const prizeGrid = document.querySelector('#prize-grid'), partnerGrid = document.querySelector('#partner-grid');
    data.prizes.forEach((prize) => {
      const card = document.createElement('article'); card.className = 'prize-card';
      const image = document.createElement('img'); image.src = prize.image; image.alt = prize.imageAlt; image.loading = 'lazy';
      const content = document.createElement('div'); content.className = 'prize-card-content';
      const title = document.createElement('h3'); title.textContent = prize.name;
      const donor = document.createElement('p'); donor.textContent = `Donated by ${prize.donor}`;
      const description = document.createElement('p'); description.textContent = prize.description;
      const details = document.createElement('p'); details.className = 'honesty-note'; details.textContent = [prize.value, prize.restrictions].filter(Boolean).join(' · ');
      content.append(title, donor, description, details); card.append(image, content); prizeGrid.append(card);
    });
    data.partners.forEach((partner) => {
      const card = document.createElement('article'); card.className = 'partner-card';
      const image = document.createElement('img'); image.src = partner.logo; image.alt = `${partner.name} logo`; image.loading = 'lazy'; card.append(image); partnerGrid.append(card);
    });
  };
  const script = document.createElement('script'); script.src = '/raffle/raffle-data.js'; script.onload = render; document.head.append(script);
})();
