(function () {
  'use strict';

  /* ========== БУРГЕР-МЕНЮ ========== */
  const burger = document.querySelector('.header__burger');
  const nav = document.querySelector('.header__nav');
  const navLinks = document.querySelectorAll('.header__link');

  function toggleMenu() {
    const isOpen = nav.classList.toggle('open');
    burger.classList.toggle('active');
    burger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMenu() {
    nav.classList.remove('open');
    burger.classList.remove('active');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (burger) {
    burger.addEventListener('click', toggleMenu);
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target) && !burger.contains(e.target) && nav.classList.contains('open')) {
      closeMenu();
    }
  });

  /* ========== ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ ========== */
  document.addEventListener('click', function (e) {
    var target = e.target.closest('a[href^="#"]');
    if (!target) return;

    var href = target.getAttribute('href');
    if (href === '#') return;

    var section = document.querySelector(href);
    if (!section) return;

    e.preventDefault();

    var headerHeight = document.querySelector('.header').offsetHeight;
    var top = section.getBoundingClientRect().top + window.pageYOffset - headerHeight;

    window.scrollTo({
      top: top,
      behavior: 'smooth'
    });
  });

  /* ========== АККОРДЕОН ========== */
  var accordionItems = document.querySelectorAll('.accordion__item');

  accordionItems.forEach(function (item) {
    var trigger = item.querySelector('.accordion__trigger');

    trigger.addEventListener('click', function () {
      var isActive = item.classList.contains('active');

      accordionItems.forEach(function (other) {
        other.classList.remove('active');
        other.querySelector('.accordion__trigger').setAttribute('aria-expanded', 'false');
      });

      if (!isActive) {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ========== ПОЯВЛЕНИЕ ПРИ СКРОЛЛЕ (IntersectionObserver) ========== */
  var fadeElements = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    fadeElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ========== СЛАЙДЕР ========== */
  var track = document.querySelector('.gallery__track');
  var slides = track ? track.querySelectorAll('.gallery__slide') : [];
  var prevBtn = document.querySelector('.gallery__btn--prev');
  var nextBtn = document.querySelector('.gallery__btn--next');
  var dotsContainer = document.querySelector('.gallery__dots');

  if (track && slides.length) {
    var current = 0;
    var total = slides.length;
    var autoplayTimer = null;
    var isPlaying = true;

    function goTo(index) {
      if (index < 0) index = total - 1;
      if (index >= total) index = 0;
      current = index;
      var wrapper = document.querySelector('.gallery__wrapper');
      var slideWidth = wrapper ? wrapper.clientWidth : 0;
      slides.forEach(function (s) { s.style.flex = 'none'; s.style.width = slideWidth + 'px'; });
      track.style.transform = 'translateX(-' + (current * slideWidth) + 'px)';
      updateDots();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function updateDots() {
      var btns = dotsContainer.querySelectorAll('button');
      btns.forEach(function (btn, i) {
        btn.classList.toggle('active', i === current);
        btn.setAttribute('aria-selected', i === current);
      });
    }

    function startAutoplay() {
      stopAutoplay();
      if (!isPlaying) return;
      autoplayTimer = setInterval(next, 5000);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    dotsContainer.innerHTML = '';
    for (var i = 0; i < total; i++) {
      var dot = document.createElement('button');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Слайд ' + (i + 1));
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', function (idx) {
        return function () { goTo(idx); };
      }(i));
      dotsContainer.appendChild(dot);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); startAutoplay(); });

    var wrapper = document.querySelector('.gallery__wrapper');
    if (wrapper) {
      wrapper.addEventListener('mouseenter', stopAutoplay);
      wrapper.addEventListener('mouseleave', startAutoplay);

      // Touch / swipe
      var startX = 0;
      var isDragging = false;

      wrapper.addEventListener('touchstart', function (e) {
        stopAutoplay();
        startX = e.touches[0].clientX;
        isDragging = true;
      }, { passive: true });

      wrapper.addEventListener('touchend', function (e) {
        if (!isDragging) return;
        isDragging = false;
        var endX = e.changedTouches[0].clientX;
        var diff = startX - endX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? next() : prev();
        }
        startAutoplay();
      }, { passive: true });
    }

    startAutoplay();
    goTo(0);

    window.addEventListener('resize', function () {
      goTo(current);
    });
  }

  /* ========== МАСКА ТЕЛЕФОНА ========== */
  var phoneInput = document.querySelector('#phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      var digits = this.value.replace(/\D/g, '');
      if (digits.length === 0) {
        this.value = '';
        return;
      }
      if (digits[0] === '7' || digits[0] === '8') {
        digits = digits.slice(1);
      }
      digits = digits.slice(0, 10);
      var formatted = '+7';
      if (digits.length > 0) {
        formatted += ' (' + digits.slice(0, 3);
      }
      if (digits.length > 3) {
        formatted += ') ' + digits.slice(3, 6);
      }
      if (digits.length > 6) {
        formatted += '-' + digits.slice(6, 8);
      }
      if (digits.length > 8) {
        formatted += '-' + digits.slice(8, 10);
      }
      this.value = formatted;
    });

    phoneInput.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && this.value === '+7 (') {
        this.value = '';
      }
    });
  }

  /* ========== МАСКА EMAIL ========== */
  var emailInput = document.querySelector('#email');
  if (emailInput) {
    emailInput.addEventListener('input', function () {
      this.value = this.value.replace(/\s/g, '').toLowerCase();
    });
  }

  /* ========== ВАЛИДАЦИЯ И ОТПРАВКА ФОРМЫ ========== */
  var form = document.querySelector('.contact__form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var isValid = true;
      var nameInput = form.querySelector('#name');
      var phoneInput = form.querySelector('#phone');
      var emailInput = form.querySelector('#email');
      var consentInput = form.querySelector('input[name="consent"]');
      var nameError = form.querySelector('#name').closest('.form__group').querySelector('.form__error');
      var phoneError = phoneInput ? phoneInput.closest('.form__group').querySelector('.form__error') : null;
      var emailError = form.querySelector('#email').closest('.form__group').querySelector('.form__error');
      var consentError = consentInput.closest('.form__group').querySelector('.form__error');

      nameError.textContent = '';
      if (phoneError) phoneError.textContent = '';
      emailError.textContent = '';
      consentError.textContent = '';
      nameInput.classList.remove('error');
      if (phoneInput) phoneInput.classList.remove('error');
      emailInput.classList.remove('error');

      var name = nameInput.value.trim();
      if (!name) {
        nameError.textContent = 'Пожалуйста, укажите ваше имя.';
        nameInput.classList.add('error');
        isValid = false;
      }

      var email = emailInput.value.trim();
      var phone = phoneInput ? phoneInput.value.trim() : '';
      if (phone && !/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phone)) {
        if (phoneError) {
          phoneError.textContent = 'Введите номер полностью: +7 (XXX) XXX-XX-XX';
          phoneInput.classList.add('error');
        }
        isValid = false;
      }

      if (!email) {
        emailError.textContent = 'Пожалуйста, укажите ваш email.';
        emailInput.classList.add('error');
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.textContent = 'Пожалуйста, введите корректный email.';
        emailInput.classList.add('error');
        isValid = false;
      }

      if (!consentInput.checked) {
        consentError.textContent = 'Необходимо согласие на обработку данных.';
        isValid = false;
      }

      if (!isValid) return;

      var formData = {
        name: name,
        phone: phone,
        email: email,
        message: form.querySelector('#message').value.trim(),
        consent: consentInput.checked
      };

      // Локальный запуск — симуляция успеха (нет PHP)
      if (location.protocol === 'file:') {
        console.log('Локальный режим: отправка пропущена');
        form.reset();
        document.getElementById('popup').classList.add('visible');
        return;
      }

      fetch('send.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          name: name,
          phone: phone,
          email: email,
          message: form.querySelector('#message').value.trim()
        })
      })
      .then(function (r) {
        return r.text().then(function (text) {
          if (!r.ok) throw new Error(text || 'HTTP ' + r.status);
          return text;
        });
      })
      .then(function (text) {
        if (text === 'ok') {
          form.reset();
          document.getElementById('popup').classList.add('visible');
        } else {
          alert('Ошибка: сервер вернул "' + text + '"');
        }
      })
      .catch(function (err) {
        alert('Ошибка: ' + err.message);
      });
    });
  }

  /* ========== ПОПАП ========== */
  document.getElementById('popupClose').addEventListener('click', function () {
    document.getElementById('popup').classList.remove('visible');
  });
  document.getElementById('popup').addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('visible');
  });

  /* ========== КНОПКА «НАВЕРХ» ========== */
  var scrollBtn = document.getElementById('scrollTop');
  window.addEventListener('scroll', function () {
    scrollBtn.classList.toggle('visible', window.scrollY > 400);
  });
  scrollBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

})();
