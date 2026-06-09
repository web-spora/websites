// Google Apps Script
// Расширения → Apps Script → вставить этот код → Развернуть → Новое развёртывание
// Тип: Веб-приложение, Execute as: Me, Access: Anyone

function doPost(e) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
        data.timestamp || new Date().toISOString(),
        data.name || '',
        data.phone || '',
        data.email || '',
        data.city || '',
        data.experience || '',
        data.client_base || '',
        data.format || '',
        data.message || ''
    ]);

    return ContentService
        .createTextOutput(JSON.stringify({ result: 'ok' }))
        .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
    return ContentService
        .createTextOutput(JSON.stringify({ status: 'ready' }))
        .setMimeType(ContentService.MimeType.JSON);
}
