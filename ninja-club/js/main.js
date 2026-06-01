(function () {
    'use strict';

    var targetDate = new Date('2026-09-15T00:00:00+05:00').getTime();

    function updateTimer() {
        var now = Date.now();
        var diff = Math.max(0, targetDate - now);

        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('timer-days').textContent = String(days).padStart(2, '0');
        document.getElementById('timer-hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('timer-minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('timer-seconds').textContent = String(seconds).padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);

    var totalSpots = 50;
    var remainingSpots = totalSpots;

    function updateSpots() {
        var text = 'Осталось ' + remainingSpots + ' мест со скидкой 30%';
        var els = document.querySelectorAll('#spots-display, #spots-display-form');
        els.forEach(function (el) { el.textContent = text; });
    }

    updateSpots();

    var header = document.querySelector('.sticky-header');

    function handleScroll() {
        var y = window.scrollY;
        if (y > 60) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    var animEls = document.querySelectorAll('.animate-fade-in');

    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        animEls.forEach(function (el) { observer.observe(el); });
    } else {
        animEls.forEach(function (el) { el.classList.add('visible'); });
    }

    var phoneInput = document.getElementById('parent-phone');

    function maskPhone(value) {
        var digits = value.replace(/\D/g, '');
        if (digits.length === 0) return '';
        if (digits[0] === '7' || digits[0] === '8') {
            digits = digits.slice(0, 11);
        } else {
            digits = digits.slice(0, 11);
        }
        var result = '+7';
        if (digits.length > 1) {
            result += ' (' + digits.slice(1, Math.min(4, digits.length));
        }
        if (digits.length > 4) {
            result += ') ' + digits.slice(4, Math.min(7, digits.length));
        }
        if (digits.length > 7) {
            result += '-' + digits.slice(7, Math.min(9, digits.length));
        }
        if (digits.length > 9) {
            result += '-' + digits.slice(9, 11);
        }
        return result;
    }

    phoneInput.addEventListener('input', function () {
        var cursor = this.selectionStart;
        var oldLen = this.value.length;
        this.value = maskPhone(this.value);
        var newLen = this.value.length;
        if (cursor < oldLen) {
            cursor += (newLen - oldLen);
        }
        this.setSelectionRange(cursor, cursor);
    });

    phoneInput.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && this.value.length <= 3) {
            this.value = '';
        }
    });

    var form = document.getElementById('lead-form');
    var nameInput = document.getElementById('parent-name');
    var ageSelect = document.getElementById('child-age');
    var consentCheck = document.getElementById('consent');
    var submitBtn = document.getElementById('submit-btn');

    function showError(id) {
        document.getElementById(id).classList.add('visible');
    }

    function hideAllErrors() {
        document.querySelectorAll('.form-error').forEach(function (el) {
            el.classList.remove('visible');
        });
        document.querySelectorAll('.form-input.error').forEach(function (el) {
            el.classList.remove('error');
        });
    }

    function validateForm() {
        var valid = true;
        hideAllErrors();

        if (!nameInput.value.trim()) {
            showError('name-error');
            nameInput.classList.add('error');
            valid = false;
        }

        var phoneRaw = phoneInput.value.replace(/\D/g, '');
        if (phoneRaw.length < 11 || phoneRaw[0] !== '7') {
            showError('phone-error');
            phoneInput.classList.add('error');
            valid = false;
        }

        if (!ageSelect.value) {
            showError('age-error');
            ageSelect.classList.add('error');
            valid = false;
        }

        if (!consentCheck.checked) {
            showError('consent-error');
            valid = false;
        }

        return valid;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!validateForm()) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправляем...';

        var formData = {
            name: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
            age: ageSelect.value,
        };

        console.log('Form submitted:', formData);

        setTimeout(function () {
            if (remainingSpots > 0) {
                remainingSpots--;
                updateSpots();
            }
            document.getElementById('form-state').classList.remove('visible');
            document.getElementById('success-state').classList.add('visible');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Записаться на пробное';
        }, 800);
    });

    (function () {
        var params = new URLSearchParams(window.location.search);
        var utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
        var utmData = {};
        utmFields.forEach(function (f) {
            var v = params.get(f);
            if (v) utmData[f] = v;
        });
        if (Object.keys(utmData).length > 0) {
            console.log('UTM params:', utmData);
            try { localStorage.setItem('utm_data', JSON.stringify(utmData)); } catch (e) { }
        }
    })();

    window.resetForm = function () {
        form.reset();
        document.getElementById('success-state').classList.remove('visible');
        document.getElementById('form-state').classList.add('visible');
        hideAllErrors();
    };

})();
