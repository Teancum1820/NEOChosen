const icons = __LUCIDE_ICONS__;

(() => {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  const links = nav.querySelector('.site-nav-links');
  const toggle = nav.querySelector('.nav-toggle');
  const sponsorToggle = nav.querySelector('.nav-dropdown-toggle');
  const sponsorMenu = nav.querySelector('.nav-dropdown-menu');
  if (!links || !toggle) return;

  nav.classList.add('site-header');
  const wordmark = document.createElement('a');
  wordmark.className = 'site-wordmark';
  wordmark.href = '/';
  wordmark.setAttribute('aria-label', 'NEOChosen home');
  wordmark.innerHTML = 'NEO<span>Chosen</span>';

  const actions = document.createElement('div');
  actions.className = 'site-nav-actions';
  const donate = document.createElement('a');
  donate.className = 'site-donate';
  donate.href = '/donations/';
  donate.innerHTML = `${icons.heart}<span>Donate</span>`;
  actions.append(donate, toggle);
  nav.prepend(wordmark);
  nav.append(actions);

  const setMenuIcon = (open) => {
    toggle.innerHTML = open ? icons.close : icons.menu;
  };
  const setSponsorIcon = (open) => {
    if (!sponsorToggle) return;
    sponsorToggle.querySelector('.nav-dropdown-icon')?.remove();
    sponsorToggle.insertAdjacentHTML('beforeend', matchMedia('(min-width: 1100px)').matches ? icons.chevronDown : (open ? icons.minus : icons.plus));
  };
  setMenuIcon(false);
  setSponsorIcon(false);
  toggle.setAttribute('aria-label', 'Open navigation');

  const ticketLink = links.querySelector('.nav-ticket');
  if (ticketLink) ticketLink.insertAdjacentHTML('afterbegin', icons.ticket);

  const backdrop = document.createElement('button');
  backdrop.className = 'nav-backdrop';
  backdrop.type = 'button';
  backdrop.tabIndex = -1;
  backdrop.setAttribute('aria-label', 'Close navigation');
  document.body.append(backdrop);

  let returnFocus = null;
  let lockedScrollY = 0;
  const desktop = () => matchMedia('(min-width: 1100px)').matches;
  const closeSponsor = () => {
    if (!sponsorToggle || !sponsorMenu) return;
    sponsorToggle.setAttribute('aria-expanded', 'false');
    sponsorMenu.classList.remove('is-open');
    setSponsorIcon(false);
  };
  const closeNav = (restore = true) => {
    const wasOpen = document.documentElement.classList.contains('nav-open');
    links.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    setMenuIcon(false);
    document.documentElement.classList.remove('nav-open');
    document.body.classList.remove('nav-open');
    closeSponsor();
    if (restore && returnFocus && !desktop()) returnFocus.focus({ preventScroll: true });
    if (wasOpen) requestAnimationFrame(() => scrollTo(0, lockedScrollY));
    returnFocus = null;
  };
  const openNav = () => {
    returnFocus = document.activeElement;
    lockedScrollY = scrollY;
    links.classList.add('is-open');
    backdrop.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation');
    setMenuIcon(true);
    document.documentElement.classList.add('nav-open');
    document.body.classList.add('nav-open');
    requestAnimationFrame(() => links.querySelector('a, button')?.focus({ preventScroll: true }));
  };

  toggle.addEventListener('click', (event) => {
    event.stopImmediatePropagation();
    toggle.getAttribute('aria-expanded') === 'true' ? closeNav() : openNav();
  }, true);
  backdrop.addEventListener('click', () => closeNav());
  sponsorToggle?.addEventListener('click', (event) => {
    event.stopImmediatePropagation();
    const open = sponsorToggle.getAttribute('aria-expanded') !== 'true';
    sponsorToggle.setAttribute('aria-expanded', String(open));
    sponsorMenu?.classList.toggle('is-open', open);
    setSponsorIcon(open);
  }, true);
  links.addEventListener('click', (event) => {
    if (event.target.closest('a') && !desktop()) closeNav(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (sponsorToggle?.getAttribute('aria-expanded') === 'true' && desktop()) closeSponsor();
      else if (toggle.getAttribute('aria-expanded') === 'true') closeNav();
    }
    if (event.key === 'Tab' && toggle.getAttribute('aria-expanded') === 'true' && !desktop()) {
      const focusable = [toggle, ...links.querySelectorAll('a[href], button:not([disabled])')].filter(el => el.offsetParent !== null);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('click', (event) => {
    if (desktop() && sponsorToggle && !sponsorToggle.closest('.nav-dropdown')?.contains(event.target)) closeSponsor();
  });
  addEventListener('resize', () => {
    closeNav(false);
    if (desktop()) links.classList.remove('is-open');
    setSponsorIcon(false);
  });
})();
