function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var props = PropertiesService.getScriptProperties();
    var city = props.getProperty('CITY') || 'Не указан';
    var webhookBase = props.getProperty('B24_WEBHOOK_BASE');
    var sourceSheetId = props.getProperty('SOURCE_SHEET_ID');

    if (!webhookBase) return error('Не задан URL вебхука Битрикс24');
    if (!sourceSheetId) return error('Не задан ID таблицы');

    var ss = SpreadsheetApp.openById(sourceSheetId);
    var sheets = ss.getSheets();
    var stockMap = {};

    for (var s = 0; s < sheets.length; s++) {
      var sheet = sheets[s];
      if (sheet.getName() === 'Заказы') continue;

      var rows = sheet.getDataRange().getValues();
      if (rows.length < 2) continue;

      var header = rows[0];
      var colArticle = -1, colQty = -1;

      for (var c = 0; c < header.length; c++) {
        var h = ('' + header[c]).trim();
        if (h === 'Артикул') colArticle = c;
        if (h === 'Кол-во' || h === 'Остаток') colQty = c;
      }

      if (colArticle === -1 || colQty === -1) continue;

      for (var r = 1; r < rows.length; r++) {
        var article = ('' + rows[r][colArticle]).trim();
        var qty = parseInt(rows[r][colQty]) || 0;
        if (article && qty > 0) {
          stockMap[article] = (stockMap[article] || 0) + qty;
        }
      }
    }

    var items = data.items || [];
    var errors = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var avail = stockMap[item.article] || 0;
      if (avail < item.qty) {
        errors.push(item.article + ' (' + item.name + '): доступно ' + avail + ', заказано ' + item.qty);
      }
    }

    if (errors.length > 0) return error(errors);

    var customer = data.customer || {};
    var itemsText = '';
    for (var i = 0; i < items.length; i++) {
      itemsText += items[i].article + ' | ' + items[i].brand + ' | ' + items[i].name + ' | ' + items[i].qty + ' шт.\n';
    }

    var b24Payload = {
      fields: {
        TITLE: 'Заказ уценки от ' + (customer.name || 'Не указан'),
        NAME: customer.name || '',
        COMPANY_TITLE: customer.company || '',
        PHONE_WORK: [{ VALUE: customer.phone || '', VALUE_TYPE: 'WORK' }],
        EMAIL_WORK: [{ VALUE: customer.email || '', VALUE_TYPE: 'WORK' }],
        COMMENTS: 'Город: ' + city + '\n\nСостав заказа:\n' + itemsText + '\nКомментарий: ' + (customer.comment || ''),
        SOURCE_ID: 'UCENKA'
      }
    };

    var b24Url = webhookBase + 'crm.lead.add';
    var b24Resp = UrlFetchApp.fetch(b24Url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(b24Payload)
    });
    var b24Result = JSON.parse(b24Resp.getContentText());

    if (!b24Result.result) {
      return error('Ошибка Битрикс24: ' + JSON.stringify(b24Result));
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      leadId: b24Result.result
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return error(err.toString());
  }
}

function error(msg) {
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    errors: typeof msg === 'string' ? [msg] : msg
  })).setMimeType(ContentService.MimeType.JSON);
}
