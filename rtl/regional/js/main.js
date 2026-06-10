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
    const modalBody = document.getElementById('modalBody');
    const stepCounter = document.getElementById('stepCounter');
    const progressFill = document.getElementById('progressFill');
    const btnBack = document.getElementById('btnBack');
    const btnNext = document.getElementById('btnNext');

    const TOTAL_STEPS = 11;
    let currentStep = 1;
    let formData = {};

    function openModal() {
        currentStep = 1;
        const cb = document.getElementById('videoCheckbox');
        if (cb) {
            cb.classList.remove('show');
            cb.style.display = 'none';
            const chk = cb.querySelector('.step-checkbox');
            if (chk) chk.checked = false;
        }
        renderStep();
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modalOverlay.classList.remove('open');
        document.body.style.overflow = '';
        formData = {};
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
        if (e.key === 'Escape' && modalOverlay.classList.contains('open') && currentStep <= 2) {
            closeModal();
        }
    });

    document.addEventListener('input', (e) => {
        const input = e.target.closest('.phone-mask');
        if (!input) return;

        let digits = input.value.replace(/\D/g, '');
        if (digits.startsWith('7')) {
            digits = '8' + digits.slice(1);
        }
        if (!digits.startsWith('8')) {
            digits = '8' + digits;
        }
        digits = digits.slice(0, 11);

        let formatted = '8';
        if (digits.length > 1) {
            formatted += ' ' + digits.slice(1, 4);
        }
        if (digits.length >= 5) {
            formatted += ' ' + digits.slice(4, 7);
        }
        if (digits.length >= 8) {
            formatted += '-' + digits.slice(7, 9);
        }
        if (digits.length >= 10) {
            formatted += '-' + digits.slice(9, 11);
        }

        const pos = input.selectionStart;
        input.value = formatted;
        if (pos < formatted.length) {
            input.setSelectionRange(pos, pos);
        }
    });

    document.addEventListener('input', (e) => {
        const input = e.target.closest('.email-validate');
        if (!input) return;

        const val = input.value.trim();
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (val.length === 0) {
            input.style.borderColor = '#ccc';
            return;
        }

        if (re.test(val)) {
            input.style.borderColor = '#27ae60';
        } else {
            input.style.borderColor = '#e67e22';
        }
    });

    modalBody.addEventListener('click', (e) => {
        const link = e.target.closest('.video-links a');
        if (link) showVideoCheckbox();
    });

    modalBody.addEventListener('play', (e) => {
        if (e.target.closest('.video-wrapper video')) showVideoCheckbox();
    }, true);

    function showVideoCheckbox() {
        const cb = document.getElementById('videoCheckbox');
        if (cb && !cb.classList.contains('show')) {
            cb.style.display = '';
            cb.classList.add('show');
        }
    }

    function saveCurrentStepData() {
        const stepEl = modalBody.querySelector('.step.active');
        if (!stepEl) return;

        const inputs = stepEl.querySelectorAll('.step-input');
        inputs.forEach(inp => {
            formData[inp.name] = inp.value.trim();
        });

        const radios = stepEl.querySelectorAll('.step-radio');
        if (radios.length) {
            const checked = stepEl.querySelector('.step-radio:checked');
            if (checked) {
                formData[checked.name] = checked.value;
            }
        }
    }

    function clearErrors(stepEl) {
        stepEl.querySelectorAll('.field-error').forEach(el => el.remove());
        stepEl.querySelectorAll('.step-input').forEach(inp => inp.style.borderColor = '');
        stepEl.querySelectorAll('.step-radio').forEach(r => r.style.outline = '');
    }

    function showError(input, msg) {
        input.style.borderColor = '#e11110';
        const err = document.createElement('span');
        err.className = 'field-error';
        err.textContent = msg;
        input.parentNode.insertBefore(err, input.nextSibling);
    }

    function getInputLabel(input) {
        const label = input.closest('label');
        if (label) {
            const text = label.childNodes[0]?.textContent?.trim();
            if (text) return text;
        }
        return null;
    }

    function validateCurrentStep() {
        const stepEl = modalBody.querySelector('.step.active');
        if (!stepEl) return true;

        clearErrors(stepEl);

        const inputs = stepEl.querySelectorAll('.step-input[data-required="true"]');
        for (const inp of inputs) {
            if (!inp.value.trim()) {
                const label = getInputLabel(inp);
                showError(inp, label ? `Укажите ${label.toLowerCase()}` : 'Заполните это поле');
                inp.addEventListener('input', function onFix() {
                    inp.style.borderColor = '';
                    const err = inp.parentNode.querySelector('.field-error');
                    if (err) err.remove();
                    inp.removeEventListener('input', onFix);
                }, { once: true });
                return false;
            }
            const pattern = inp.dataset.pattern;
            if (pattern) {
                const re = new RegExp(pattern);
                if (!re.test(inp.value.trim())) {
                    const label = getInputLabel(inp);
                    const msg = inp.name === 'phone' ? 'Укажите номер в формате 8 999 999-99-99' :
                               inp.name === 'email' ? 'Укажите корректный email' :
                               `Некорректный формат`;
                    showError(inp, label ? `${msg}` : msg);
                    inp.addEventListener('input', function onFix() {
                        inp.style.borderColor = '';
                        const err = inp.parentNode.querySelector('.field-error');
                        if (err) err.remove();
                        inp.removeEventListener('input', onFix);
                    }, { once: true });
                    return false;
                }
            }
        }

        const radios = stepEl.querySelectorAll('.step-radio[data-required="true"]');
        if (radios.length) {
            const checked = stepEl.querySelector('.step-radio:checked');
            if (!checked) {
                const firstRadio = radios[0];
                const container = firstRadio.closest('.radio-group') || firstRadio.parentNode;
                firstRadio.style.outline = '2px solid #e11110';
                const err = document.createElement('span');
                err.className = 'field-error';
                err.textContent = 'Выберите один из вариантов';
                container.parentNode.insertBefore(err, container.nextSibling);
                return false;
            }
        }

        return true;
    }

    function renderStep() {
        const allSteps = modalBody.querySelectorAll('.step');
        allSteps.forEach(s => {
            s.classList.remove('active');
            clearErrors(s);
        });

        const target = modalBody.querySelector(`.step[data-step="${currentStep}"]`);
        if (target) target.classList.add('active');

        stepCounter.textContent = `Шаг ${currentStep} из ${TOTAL_STEPS}`;
        progressFill.style.width = `${(currentStep / TOTAL_STEPS) * 100}%`;

        if (currentStep === 1) {
            btnBack.style.display = 'none';
        } else {
            btnBack.style.display = '';
        }

        if (currentStep === TOTAL_STEPS) {
            btnNext.style.display = 'none';
        } else {
            btnNext.style.display = '';
        }
    }

    function showCheckboxHint(stepNum) {
        const hint = document.getElementById('hint' + stepNum);
        if (hint) {
            hint.classList.add('show');
            setTimeout(() => hint.classList.remove('show'), 2500);
        }
    }

    function goNext() {
        saveCurrentStepData();

        const activeStep = modalBody.querySelector('.step.active');
        if (activeStep) {
            const cb = activeStep.querySelector('.step-checkbox');
            if (cb && !cb.checked) {
                const stepNum = activeStep.dataset.step;
                showCheckboxHint(stepNum);
                return;
            }
        }

        if (currentStep === 1) {
            const video = modalBody.querySelector('.video-wrapper video');
            if (video && !video.paused) video.pause();
        }

        if (!validateCurrentStep()) return;

        if (currentStep < TOTAL_STEPS) {
            currentStep++;
            renderStep();
        }
    }

    function goBack() {
        saveCurrentStepData();

        if (currentStep > 1) {
            currentStep--;
            renderStep();
        }
    }

    btnNext.addEventListener('click', goNext);
    btnBack.addEventListener('click', goBack);

    document.addEventListener('keydown', (e) => {
        if (!modalOverlay.classList.contains('open')) return;
        if (e.key === 'Enter' && currentStep < TOTAL_STEPS) {
            goNext();
        }
    });

    const submitBtn = document.getElementById('submitQuiz');
    if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
            if (submitBtn.disabled) return;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Отправка...';

            saveCurrentStepData();

            formData.timestamp = new Date().toISOString();

            console.log('📋 Анкета кандидата (все шаги):', formData);

            // ═══════════════════════════════════════════════════
            // Интеграция с Google Sheets
            // ═══════════════════════════════════════════════════
            // 1. Создайте Google Sheet с заголовками столбцов:
            //    timestamp | name | phone | email | city | experience | client_base | car | schedule | message
            // 2. Откройте Расширения → Apps Script
            // 3. Вставьте скрипт из `assets/gsheet.gs`
            // 4. Разверните как веб-приложение (Execute as: Me, Access: Anyone)
            // 5. Укажите URL ниже:

            const GSHEET_URL = 'https://script.google.com/macros/s/AKfycbyoGwjKzP07Cgb2OBfyNvsq0PJeJIU6BtsZAJk-cFTf_NyPBCsRcwI8HoB8hxtby3m1/exec';

            try {
                await fetch(GSHEET_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(formData)
                });
                console.log('✅ Данные отправлены в Google Sheets');
            } catch (err) {
                console.error('❌ Ошибка отправки:', err);
            }

            showToast('Спасибо! Ваша анкета принята.<br>Мы рассмотрим её и свяжемся с вами в ближайшее время.');
            closeModal();
        });
    }

    function showToast(msg) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = msg;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4500);
    }

    const navLinks = document.querySelectorAll('.nav-list a');
    const sectionIds = ['section1', 'section2', 'section3', 'section4', 'section5', 'section6'];

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navList.classList.remove('open');
            burger.innerHTML = '&#9776;';
        });
    });

    function updateActiveNav() {
        let currentId = '';
        for (const id of sectionIds) {
            const el = document.getElementById(id);
            if (el && el.getBoundingClientRect().top <= 150) {
                currentId = id;
            }
        }

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
        });
    }

    document.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    const heroImg = document.querySelector('.hero-image img');
    if (heroImg) {
        function updateParallax() {
            const rect = heroImg.getBoundingClientRect();
            const offset = rect.top * 0.3;
            heroImg.style.transform = `translateY(${offset}px)`;
        }

        document.addEventListener('scroll', updateParallax, { passive: true });
        updateParallax();
    }
});
