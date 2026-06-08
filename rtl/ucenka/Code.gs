const SHEET_ID = '1b7QHS-KwZpwu84svzpXTZnX9Z_Vh2iCYJJDug1fmKiA';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('Заказы') || ss.getSheets()[0];

    const itemsText = (data.items || [])
      .map(function(i) { return i.article + ' | ' + i.brand + ' | ' + i.name + ' | ' + i.qty + ' шт.'; })
      .join('\n');

    sheet.appendRow([
      new Date(),
      data.city || '',
      data.name || '',
      data.phone || '',
      data.email || '',
      data.comment || '',
      itemsText,
      data.leadId || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
