// Load the existing Zeffy form when visitors approach signup, after the hero.
(() => {
  const signup = document.querySelector('.home-updates-form');
  if (!signup) return;
  const load = () => {
    const script = document.createElement('script');
    script.src = 'https://www.zeffy.com/embed/v2/zeffy-embed.js';
    script.async = true;
    script.onerror = () => signup.querySelectorAll('[data-zeffy-embed-fallback]').forEach(element => {
      element.style.display = 'block';
      element.querySelectorAll('iframe[data-zeffy-embed-src]').forEach(frame => {
        frame.src = frame.getAttribute('data-zeffy-embed-src');
      });
    });
    signup.append(script);
  };
  if (!('IntersectionObserver' in window)) return load();
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      observer.disconnect();
      load();
    }
  }, { rootMargin: '400px' });
  observer.observe(signup);
})();
