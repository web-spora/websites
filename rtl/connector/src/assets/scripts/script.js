document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const header = document.getElementById('header');

    // Current year
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Menu toggle
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('open');
            menuToggle.classList.toggle('active');
            menuToggle.setAttribute(
                'aria-label',
                mainNav.classList.contains('open') ? 'Закрыть меню' : 'Открыть меню'
            );
        });

        // Close menu on nav link click
        mainNav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('open');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-label', 'Открыть меню');
            });
        });

        // Close menu on click outside
        document.addEventListener('click', (e) => {
            if (!header.contains(e.target) && mainNav.classList.contains('open')) {
                mainNav.classList.remove('open');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-label', 'Открыть меню');
            }
        });
    }

    // Header background on scroll
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
            header.style.background = 'rgba(10, 10, 26, 0.98)';
            header.style.borderBottomColor = 'rgba(255, 255, 255, 0.1)';
        } else {
            header.style.background = 'rgba(10, 10, 26, 0.95)';
            header.style.borderBottomColor = 'rgba(255, 255, 255, 0.06)';
        }
        lastScroll = scrollY;
    });
});
