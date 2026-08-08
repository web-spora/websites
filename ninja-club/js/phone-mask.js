(function () {
    'use strict';

    var phoneInput = document.getElementById('parent-phone');
    if (!phoneInput) return;

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
})();
