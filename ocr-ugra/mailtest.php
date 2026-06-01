<?php
$to = 'info@ocr-ugra.ru';
$subject = '=?UTF-8?B?' . base64_encode('Тест почты с сайта OCR UGRA') . '?=';
$body = 'Это тестовое письмо для проверки работы mail() на Beget.';
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=utf-8\r\n";
$headers .= "From: Тест <info@ocr-ugra.ru>\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

$result = mail($to, $subject, $body, $headers, '-f info@ocr-ugra.ru');

if ($result) {
    echo 'Письмо отправлено. Проверьте папку «Входящие» и «Спам» на info@ocr-ugra.ru.';
} else {
    $error = error_get_last();
    echo 'Ошибка: ' . ($error['message'] ?? 'неизвестная ошибка');
}
