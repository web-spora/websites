export function initNavigation() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  const header = document.getElementById('header');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
    toggle.classList.toggle('is-active');
    document.body.style.overflow = nav.classList.contains('is-open') ? 'hidden' : '';
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.classList.remove('is-active');
      document.body.style.overflow = '';
    });
  });

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    if (current > 60) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
    lastScroll = current;
  }, { passive: true });
}
