(function () {
    'use strict';

    // Sticky header
    var header = document.querySelector('.sticky-header');
    if (header) {
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
    }

    // Fade-in animations
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

    // UTM-метки
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
})();
