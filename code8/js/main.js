document.addEventListener('DOMContentLoaded', () => {

  /* ========== Mobile Burger ========== */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const navLinks = nav.querySelectorAll('.header__link, .contact__social-link');

  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !nav.classList.contains('active');
    nav.classList.toggle('active', isOpen);
    burger.classList.toggle('active', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  burger.addEventListener('click', () => toggleMenu());
  navLinks.forEach(link => link.addEventListener('click', () => toggleMenu(false)));

  /* ========== Header Scroll ========== */
  const header = document.getElementById('header');
  const totop = document.getElementById('totop');
  const heroImage = document.getElementById('heroImage');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 60);
    totop.classList.toggle('visible', y > 500);
    if (heroImage) {
      const speed = Math.min(y * 0.25, 120);
      const scale = 1 + Math.min(y * 0.0002, 0.06);
      heroImage.style.transform = `translateY(${speed}px) scale(${scale})`;
    }
  }, { passive: true });

  totop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ========== Smooth scroll for anchor links ========== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const offset = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ========== Portfolio Filter Tabs ========== */
  const tabs = document.querySelectorAll('.portfolio__tab');
  const items = document.querySelectorAll('.portfolio__item');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      items.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  /* ========== Intersection Observer (fade-in) ========== */
  const fadeEls = document.querySelectorAll(
    '.service-card, .portfolio__item, .process__step, .stat, .about__content, .contact__grid'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  fadeEls.forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });

  /* ========== Counter Animation ========== */
  const statNums = document.querySelectorAll('.stat__num[data-target]');

  if (statNums.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target, 10);
          animateCounter(el, target);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statNums.forEach(el => counterObserver.observe(el));

    function animateCounter(el, target) {
      const duration = 1500;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + (target > 50 ? '+' : '');
        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
    }
  }

  /* ========== Form Handling ========== */
  const form = document.getElementById('contactForm');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const phone = form.querySelector('#phone');
    if (phone.value.trim() === '') {
      phone.style.borderColor = '#800211';
      phone.focus();
      return;
    }
    const submitBtn = form.querySelector('.form__submit');
    submitBtn.textContent = 'Отправлено!';
    submitBtn.style.pointerEvents = 'none';
    setTimeout(() => {
      submitBtn.textContent = 'Отправить';
      submitBtn.style.pointerEvents = '';
      form.reset();
    }, 2500);
  });

});
