function doPost(e) {
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        const data = typeof e === 'object' && e.postData
            ? JSON.parse(e.postData.getDataAsString())
            : {};

        sheet.appendRow([
            data.timestamp || new Date().toISOString(),
            data.name || '',
            data.phone || '',
            data.email || '',
            data.city || '',
            data.experience || '',
            data.client_base || '',
            data.car || '',
            data.schedule || '',
            data.message || ''
        ]);

        return ContentService
            .createTextOutput(JSON.stringify({ result: 'ok' }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
        return ContentService
            .createTextOutput(JSON.stringify({ error: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function doGet() {
    return ContentService
        .createTextOutput(JSON.stringify({ status: 'ready' }))
        .setMimeType(ContentService.MimeType.JSON);
}
