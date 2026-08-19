(() => {
  const navs = document.querySelectorAll('.site-nav');

  navs.forEach((nav) => {
    const updateScrollState = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 12);
    };

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });

    nav.querySelectorAll('.site-nav-links a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        const toggle = nav.querySelector('.nav-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    });
  });
})();
