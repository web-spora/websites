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

    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const floatBtn = document.getElementById('floatBtn');

    function openModal() {
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modalOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (floatBtn) {
        floatBtn.addEventListener('click', openModal);
    }

    document.querySelectorAll('.btn-open-modal').forEach(btn => {
        btn.addEventListener('click', openModal);
    });

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
            closeModal();
        }
    });

    const form = document.getElementById('quizForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                timestamp: new Date().toISOString(),
                name: form.name.value.trim(),
                phone: form.phone.value.trim(),
                email: form.email.value.trim(),
                city: form.city.value.trim(),
                experience: form.experience.value,
                client_base: form.querySelector('input[name="client_base"]:checked')?.value || '',
                format: form.format.value,
                message: form.message.value.trim()
            };

            console.log('📋 Данные анкеты:', data);

            // ═══════════════════════════════════════════════════
            // Интеграция с Google Sheets
            // ═══════════════════════════════════════════════════
            // 1. Создайте Google Sheet с заголовками столбцов:
            //    timestamp | name | phone | email | city | experience | client_base | format | message
            // 2. Откройте Расширения → Apps Script
            // 3. Вставьте скрипт из `assets/gsheet.gs`
            // 4. Разверните как веб-приложение (Execute as: Me, Access: Anyone)
            // 5. Скопируйте URL развёртывания и укажите ниже:
            //
            // const GSHEET_URL = 'https://script.google.com/macros/s/ВАШ_ID/exec';
            //
            // Раскомментируйте блок ниже, когда URL будет готов:
            //
            // try {
            //     const res = await fetch(GSHEET_URL, {
            //         method: 'POST',
            //         mode: 'no-cors',
            //         headers: { 'Content-Type': 'application/json' },
            //         body: JSON.stringify(data)
            //     });
            //     console.log('✅ Данные отправлены в Google Sheets');
            // } catch (err) {
            //     console.error('❌ Ошибка отправки:', err);
            // }

            alert('Спасибо! Ваша анкета принята. Мы свяжемся с вами в ближайшее время.');
            form.reset();
            closeModal();
        });
    }
});
