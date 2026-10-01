(() => {
  const ticketUrl = 'https://www.ticketmaster.com/event/05006538EC473EB4';
  let dialog;
  let trigger;

  function createDialog() {
    const element = document.createElement('dialog');
    element.className = 'concert-ticket-dialog';
    element.setAttribute('aria-labelledby', 'concert-ticket-title');
    element.setAttribute('aria-describedby', 'concert-ticket-message');
    element.innerHTML = `
      <p class="concert-ticket-kicker">The Piano Guys Live</p>
      <h2 id="concert-ticket-title">Concert tickets</h2>
      <p id="concert-ticket-message">Concert tickets go on sale <strong>Friday, October 2 at 10 a.m.</strong></p>
      <div class="concert-ticket-actions">
        <button type="button" class="concert-ticket-close" autofocus>Close</button>
        <a class="concert-ticket-continue" href="${ticketUrl}" target="_blank" rel="noopener noreferrer">Continue to Ticketmaster <span aria-label="(opens in a new tab)">↗</span></a>
      </div>`;
    element.querySelector('button').addEventListener('click', () => element.close());
    element.querySelector('a').addEventListener('click', () => element.close());
    element.addEventListener('click', (event) => {
      if (event.target !== element) return;
      const bounds = element.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) element.close();
    });
    element.addEventListener('close', () => trigger?.focus({ preventScroll: true }));
    document.body.append(element);
    return element;
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a');
    if (!link || link.href !== ticketUrl || link.closest('.concert-ticket-dialog') ||
        event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey || typeof HTMLDialogElement === 'undefined') return;
    event.preventDefault();
    trigger = link;
    dialog ??= createDialog();
    dialog.showModal();
  });
})();
