<?php
$name = trim($_POST['name'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$email = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

if (!$name || !$email) {
    http_response_code(400);
    echo 'name and email required';
    exit;
}

$to = 'info@ocr-ugra.ru';
$subject = '=?UTF-8?B?' . base64_encode('Новое сообщение с сайта OCR UGRA') . '?=';
$body = "Имя: $name\nТелефон: $phone\nEmail: $email\n\nСообщение:\n$message";
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=utf-8\r\n";
$headers .= "From: info@ocr-ugra.ru\r\n";
$headers .= "Reply-To: $email\r\n";

$result = mail($to, $subject, $body, $headers);

if ($result) {
    echo 'ok';
} else {
    http_response_code(500);
    echo 'mail() returned false';
}
