document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    const burger = document.getElementById('burger');
    const navList = document.querySelector('.nav-list');

    if (burger && navList) {
        burger.addEventListener('click', () => {
            navList.classList.toggle('open');
            burger.innerHTML = navList.classList.contains('open') ? '&#10005;' : '&#9776;';
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav')) {
                navList.classList.remove('open');
                burger.innerHTML = '&#9776;';
            }
        });
    }
});
