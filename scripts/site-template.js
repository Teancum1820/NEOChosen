const icons = __LUCIDE_ICONS__;

(() => {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  const links = nav.querySelector('.site-nav-links');
  const toggle = nav.querySelector('.nav-toggle');
  const donate = nav.querySelector('.site-donate');
  if (!links || !toggle) return;
  const breakpoint = matchMedia('(min-width: 1200px)');
  const dropdowns = [...nav.querySelectorAll('.nav-dropdown')];
  const background = [...document.querySelectorAll('main, .site-footer, .site-follow-bar')];
  const previousInert = new Map();
  if (donate) donate.innerHTML = `${icons.heart}<span>Donate</span>`;
  links.querySelector('.nav-ticket')?.insertAdjacentHTML('afterbegin', icons.ticket);
  nav.classList.add('site-header');
  toggle.innerHTML = icons.menu;

  const setDropdown = (dropdown, open) => {
    const button = dropdown.querySelector('.nav-dropdown-toggle');
    const menu = dropdown.querySelector('.nav-dropdown-menu');
    button.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    button.querySelector('.nav-dropdown-icon')?.remove();
    button.insertAdjacentHTML('beforeend', breakpoint.matches ? icons.chevronDown : (open ? icons.minus : icons.plus));
  };
  const closeDropdowns = () => dropdowns.forEach(dropdown => setDropdown(dropdown, false));
  closeDropdowns();
  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.append(backdrop);
  let isOpen = false;
  const closeNav = (restoreFocus = true) => {
    const wasOpen = isOpen;
    isOpen = false;
    links.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    toggle.innerHTML = icons.menu;
    document.documentElement.classList.remove('nav-open');
    document.body.classList.remove('nav-open');
    for (const [element, inert] of previousInert) element.inert = inert;
    previousInert.clear();
    closeDropdowns();
    if (wasOpen && restoreFocus) toggle.focus({ preventScroll: true });
  };
  const openNav = () => {
    isOpen = true;
    links.classList.add('is-open');
    backdrop.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation');
    toggle.innerHTML = icons.close;
    document.documentElement.classList.add('nav-open');
    document.body.classList.add('nav-open');
    background.forEach(element => { previousInert.set(element, element.inert); element.inert = true; });
    links.scrollTop = 0;
    requestAnimationFrame(() => {
      if (isOpen) links.querySelector('a, button')?.focus({ preventScroll: true });
    });
  };
  toggle.addEventListener('click', () => isOpen ? closeNav() : openNav());
  backdrop.addEventListener('click', () => closeNav());
  dropdowns.forEach(dropdown => {
    const button = dropdown.querySelector('.nav-dropdown-toggle');
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      closeDropdowns();
      setDropdown(dropdown, open);
    });
    button.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        closeDropdowns();
        setDropdown(dropdown, true);
        dropdown.querySelector('.nav-dropdown-menu a')?.focus();
      }
    });
    dropdown.addEventListener('focusout', event => {
      if (breakpoint.matches && !dropdown.contains(event.relatedTarget)) setDropdown(dropdown, false);
    });
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a') && isOpen) closeNav(false);
  });
  document.addEventListener('click', event => {
    if (!nav.contains(event.target)) closeDropdowns();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const expanded = dropdowns.find(dropdown => dropdown.querySelector('button').getAttribute('aria-expanded') === 'true');
      if (expanded) {
        setDropdown(expanded, false);
        expanded.querySelector('button').focus();
      } else if (isOpen) closeNav();
    }
    if (event.key === 'Tab' && isOpen) {
      const focusable = [...nav.querySelectorAll('a[href], button')].filter(element => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  breakpoint.addEventListener('change', () => closeNav(false));
})();
