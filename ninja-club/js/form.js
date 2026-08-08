(function () {
    'use strict';

    var totalSpots = 50;
    var remainingSpots = totalSpots;

    function updateSpots() {
        var text = 'Осталось ' + remainingSpots + ' мест со скидкой 30%';
        var els = document.querySelectorAll('#spots-display, #spots-display-form');
        els.forEach(function (el) { el.textContent = text; });
    }

    updateSpots();

    var form = document.getElementById('lead-form');
    if (!form) return;

    var nameInput = document.getElementById('parent-name');
    var phoneInput = document.getElementById('parent-phone');
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
            age: ageSelect.value
        };

        // Google Sheets + Email
        fetch('https://script.google.com/macros/s/AKfycbx8r5e3VlJVnHe9z7QExUzkRNHSsyM3dTcK6-t9iZzl42YCxTD9puTkEBWEPBxhDSh2GQ/exec', {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(formData)
        }).catch(function () {});

        // Telegram (прямая отправка из браузера)
        var tgMsg = 'Предварительная запись из https://ninja-club.ru/\n\nИмя: ' + formData.name + '\nТелефон: ' + formData.phone + '\nВозраст: ' + formData.age;
        fetch('https://api.telegram.org/bot8603920779:AAEOh5S18_CPPK-j2PNCGnauJhUMWD5bsC0/sendMessage', {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'chat_id=-5334487847&text=' + encodeURIComponent(tgMsg)
        }).catch(function () {});

        if (remainingSpots > 0) {
            remainingSpots--;
            updateSpots();
        }
        document.getElementById('form-state').classList.remove('visible');
        document.getElementById('success-state').classList.add('visible');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Записаться на пробное';
    });

    window.resetForm = function () {
        form.reset();
        document.getElementById('success-state').classList.remove('visible');
        document.getElementById('form-state').classList.add('visible');
        hideAllErrors();
    };
})();
