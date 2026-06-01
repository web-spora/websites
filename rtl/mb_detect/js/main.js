document.addEventListener('DOMContentLoaded', () => {

    // Year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu on link click (mobile)
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // Mobile submenu toggle
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.has-submenu > .submenu-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                trigger.parentElement.classList.toggle('open');
            });
        });
    }

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');

    const onScroll = () => {
        const scrollY = window.scrollY;

        // Navbar background
        navbar.classList.toggle('scrolled', scrollY > 60);

        // Scroll-to-top visibility
        document.getElementById('scrollTop').classList.toggle('visible', scrollY > 400);

        // Active nav link
        const sections = document.querySelectorAll('section[id]');
        let currentId = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            const bottom = top + section.offsetHeight;
            if (scrollY >= top && scrollY < bottom) {
                currentId = section.getAttribute('id');
            }
        });

        navLinks.querySelectorAll('a[href^="#"]').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Image comparison slider
    const sliderContainer = document.querySelector('.before-after-images');
    if (sliderContainer) {
        const afterImg = sliderContainer.querySelector('.img-after');
        const handle = sliderContainer.querySelector('.slider-handle');
        let isDragging = false;

        const updateSlider = (x) => {
            const rect = sliderContainer.getBoundingClientRect();
            let pos = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
            afterImg.style.clipPath = `inset(0 ${(1 - pos) * 100}% 0 0)`;
            handle.style.left = `${pos * 100}%`;
        };

        const onMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            updateSlider(clientX);
        };

        const onStart = (e) => {
            isDragging = true;
            sliderContainer.style.userSelect = 'none';
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            updateSlider(clientX);
        };

        const onEnd = () => {
            isDragging = false;
            sliderContainer.style.userSelect = '';
        };

        sliderContainer.addEventListener('mousedown', onStart);
        sliderContainer.addEventListener('touchstart', onStart, { passive: true });
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: true });
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
    }

    // QR modal
    const qrBtn = document.getElementById('qrBtn');
    const qrModal = document.getElementById('qrModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');

    if (qrBtn && qrModal) {
        const openModal = () => {
            qrModal.classList.add('open');
            document.body.style.overflow = 'hidden';
        };
        const closeModal = () => {
            qrModal.classList.remove('open');
            document.body.style.overflow = '';
        };

        qrBtn.addEventListener('click', openModal);
        modalOverlay.addEventListener('click', closeModal);
        modalClose.addEventListener('click', closeModal);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }
});
