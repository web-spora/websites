const SHEET_ID = '1NUPKDXd7iL0S_GgQOlmZs_sIreqyGaxTYKwAKSN_l7c';
const GID = '753591601';
const container = document.getElementById('container');
const summary = document.getElementById('summary');
const filterOrg = document.getElementById('filter-org');
const filterBrand = document.getElementById('filter-brand');
const filterCat = document.getElementById('filter-cat');
const filterQty = document.getElementById('filter-qty');
let allItems = [];

function findField(fields, label) {
  for (const f of fields) {
    if (f.label === label) return f.value;
  }
  return '';
}

function esc(v) {
  return (v || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const HIDE_LABELS = { '№': true, 'Фото': true, 'Бренд': true, 'Назначение': true };

var COL_ARTICLE = -1, COL_BRAND = -1, COL_NAME = -1, COL_QTY = -1, COL_ORG = -1;

function cb(json) {
  const cols = json.table.cols.map(c => (c.label || '').trim());
  cols.forEach((label, i) => {
    if (label === 'Артикул') COL_ARTICLE = i;
    else if (label === 'Бренд') COL_BRAND = i;
    else if (label === 'Наименование') COL_NAME = i;
    else if (label === 'Кол-во') COL_QTY = i;
    else if (label === 'Организация') COL_ORG = i;
  });
  json.table.rows.forEach(row => {
    const cells = row.c;
    const name = cells[COL_NAME] && cells[COL_NAME].v ? ('' + cells[COL_NAME].v).trim() : '';
    const brand = cells[COL_BRAND] && cells[COL_BRAND].v ? ('' + cells[COL_BRAND].v).trim() : '';
    if (!brand && !name) return;
    var category = 'Моторное';
    if (name.toLowerCase().indexOf('трансмиссионное') !== -1) category = 'Трансмиссионное';
    var org = cells[COL_ORG] && cells[COL_ORG].v ? ('' + cells[COL_ORG].v).trim() : '';
    var qty = cells[COL_QTY] && cells[COL_QTY].v !== null && cells[COL_QTY].v !== undefined ? cells[COL_QTY].v : '';
    var article = cells[COL_ARTICLE] && cells[COL_ARTICLE].v ? ('' + cells[COL_ARTICLE].v).trim() : '';
    var photoVal = '';
    var defectVal = '';
    cells.forEach((cell, i) => {
      var label = cols[i];
      if (HIDE_LABELS[label]) return;
      if (label === 'Фото') {
        photoVal = cell && cell.v ? ('' + cell.v).trim() : '';
        return;
      }
      if (label === 'Дефект') {
        defectVal = cell && cell.v ? ('' + cell.v).trim() : '';
        return;
      }
    });
    var fields = [
      { label: 'Назначение', value: category },
      { label: 'Организация', value: org },
      { label: 'Бренд', value: brand },
      { label: 'Артикул', value: article },
      { label: 'Наименование', value: name }
    ];
    if (qty !== '') fields.push({ label: 'Остаток', value: qty });
    if (defectVal) fields.push({ label: 'Дефект', value: defectVal });
    if (photoVal) fields.push({ label: 'Фото', value: photoVal });
    allItems.push(fields);
  });
  onDataLoaded();
}

function onDataLoaded() {
  var orgs = new Set();
  var brands = new Set();
  allItems.forEach(item => {
    var o = findField(item, 'Организация');
    if (o) orgs.add(o);
    var b = findField(item, 'Бренд');
    if (b) brands.add(b);
  });
  [...orgs].sort().forEach(o => {
    var opt = document.createElement('option');
    opt.value = o;
    opt.textContent = o;
    filterOrg.appendChild(opt);
  });
  [...brands].sort().forEach(b => {
    var opt = document.createElement('option');
    opt.value = b;
    opt.textContent = b;
    filterBrand.appendChild(opt);
  });
  filterOrg.addEventListener('change', render);
  filterBrand.addEventListener('change', render);
  filterCat.addEventListener('change', render);
  filterQty.addEventListener('change', render);
  render();
  cartSync();
  cartRender();
}

function render() {
  var orgVal = filterOrg.value;
  var brandVal = filterBrand.value;
  var catVal = filterCat.value;
  var qtyVal = filterQty.value;

  var filtered = allItems.filter(item => {
    if (orgVal !== 'all' && findField(item, 'Организация') !== orgVal) return false;
    if (catVal !== 'all' && findField(item, 'Назначение') !== catVal) return false;
    if (brandVal !== 'all' && findField(item, 'Бренд') !== brandVal) return false;
    return true;
  });

  if (qtyVal === 'asc') {
    filtered.sort((a, b) => (parseFloat(findField(a, 'Остаток')) || 0) - (parseFloat(findField(b, 'Остаток')) || 0));
  } else if (qtyVal === 'desc') {
    filtered.sort((a, b) => (parseFloat(findField(b, 'Остаток')) || 0) - (parseFloat(findField(a, 'Остаток')) || 0));
  }

  summary.textContent = 'Показано: ' + filtered.length + ' из ' + allItems.length;

  container.innerHTML = '';
  if (filtered.length === 0) {
    container.innerHTML = '<div class="error">Ничего не найдено</div>';
    return;
  }
  filtered.forEach(fields => {
    var article = '';
    var name = '';
    var photoHtml = '';
    var restHtml = '';

    fields.forEach(f => {
      var v = f.value + '';
      if (f.label === 'Назначение' || f.label === 'Бренд') return;

      if (f.label === 'Артикул') {
        article = v;
        return;
      }

      if (f.label === 'Наименование') {
        name = v;
        return;
      }

      if (f.label === 'Фото') {
        return;
      }

      if (f.label === 'Остаток') {
        restHtml += '<div class="field"><span class="label">Остаток:</span> ' + v + '</div>';
        return;
      }

      restHtml += '<div class="field"><span class="label">' + f.label + ':</span> ' + v + '</div>';
    });

    var cardHtml = '<div class="no-photo">Фото ещё нет</div>';
    if (article) cardHtml += '<div class="article" data-copy-article="' + esc(article) + '" title="Нажмите, чтобы скопировать">' + article + '</div>';
    if (name) cardHtml += '<div class="product-name">' + name + '</div>';
    cardHtml += '<div class="spoiler-btn" data-spoiler>Подробнее <span class="spoiler-arrow">▼</span></div>';
    cardHtml += '<div class="spoiler-content">' + restHtml + '</div>';

    var qtyVal = parseFloat(findField(fields, 'Остаток')) || 0;
    if (qtyVal > 0) {
      var safeArticle = esc(article);
      var safeBrand = esc(findField(fields, 'Бренд'));
      var safeName = esc(name);
      var inCartItem = cart.find(function(i) { return i.article === article; });
      var inCartQty = inCartItem ? inCartItem.qty : 0;
      var remaining = qtyVal - inCartQty;
      cardHtml += '<div class="cart-controls">' +
        '<div class="cart-control-qty">' +
        '<button data-article="' + safeArticle + '" data-delta="-1"' + (inCartQty > 0 ? '' : ' disabled') + '>−</button>' +
        '<span>' + inCartQty + '</span>' +
        '<button data-article="' + safeArticle + '" data-delta="1"' + (remaining > 0 ? '' : ' disabled') + '>+</button>' +
        '</div>' +
        '<button class="cart-add-btn" data-article="' + safeArticle + '" data-brand="' + safeBrand + '" data-name="' + safeName + '" data-qty="' + qtyVal + '"' + (remaining > 0 ? '' : ' disabled') + '>В корзину</button>' +
        '</div>';
    }

    container.innerHTML += '<div class="card">' + cardHtml + '</div>';
  });
}

function toggleSpoiler(btn) {
  btn.classList.toggle('open');
  var content = btn.nextElementSibling;
  if (content) content.classList.toggle('open');
}

function copyArticle(el) {
  var text = el.textContent || el.innerText;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      el.style.color = '#27ae60';
      setTimeout(function() { el.style.color = ''; }, 800);
    });
  }
}

// Cart module
var B24_URL = 'https://auto-oil.bitrix24.ru/rest/6642/te8yq8tl2zc82wop/crm.lead.add';
var LOG_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzFlhwXJjcK-hl5PwI5Y1AQlG11RXrifPhu8TrGHj0OjBHqoRLuNg0EykdRJBa7aFF0/exec';
var CART_KEY = 'cart_msk';
var cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

function cartSync() {
  cart.forEach(function(item) {
    var fields = allItems.find(function(f) { return findField(f, 'Артикул') === item.article; });
    if (!fields) {
      cart = cart.filter(function(i) { return i.article !== item.article; });
    } else {
      var maxQty = parseFloat(findField(fields, 'Остаток')) || 0;
      if (item.qty > maxQty) item.qty = maxQty;
    }
  });
  cart = cart.filter(function(i) { return i.qty > 0; });
  cartSave();
}

function cartAdd(article, brand, name, maxQty) {
  var existing = cart.find(function(i) { return i.article === article; });
  var current = existing ? existing.qty : 0;
  if (current < maxQty) {
    if (existing) { existing.qty++; }
    else { cart.push({ article: article, brand: brand, name: name, qty: 1 }); }
    cartSave();
    cartRender();
    render();
  }
}

function cartChangeQty(article, delta) {
  var existing = cart.find(function(i) { return i.article === article; });
  if (!existing) {
    if (delta > 0) {
      var f = allItems.find(function(f) { return findField(f, 'Артикул') === article; });
      if (f) cartAdd(article, findField(f, 'Бренд'), findField(f, 'Наименование'), parseFloat(findField(f, 'Остаток')) || 0);
    }
    return;
  }
  var fields = allItems.find(function(f) { return findField(f, 'Артикул') === article; });
  var maxQty = fields ? parseFloat(findField(fields, 'Остаток')) || 0 : 0;
  var newQty = existing.qty + delta;
  if (newQty <= 0) {
    cart = cart.filter(function(i) { return i.article !== article; });
  } else if (newQty <= maxQty) {
    existing.qty = newQty;
  } else {
    existing.qty = maxQty;
  }
  cartSave();
  cartRender();
  render();
}

function cartRemove(article) {
  cart = cart.filter(function(i) { return i.article !== article; });
  cartSave();
  cartRender();
  render();
}

function cartSave() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function cartRender() {
  var badge = document.getElementById('cartBadge');
  if (badge) {
    var count = cart.reduce(function(sum, i) { return sum + i.qty; }, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
  var body = document.getElementById('cartBody');
  var footer = document.getElementById('cartFooter');
  if (!body) return;
  if (cart.length === 0) {
    body.innerHTML = '<div class="cart-empty">Корзина пуста</div>';
    if (footer) footer.style.display = 'none';
    return;
  }
  if (footer) footer.style.display = 'block';
  var html = '';
  cart.forEach(function(item) {
    var safeArticle = esc(item.article);
    html += '<div class="cart-item">' +
      '<div class="cart-item-info">' +
      '<div class="cart-item-article">' + safeArticle + '</div>' +
      '<div class="cart-item-name">' + esc(item.name) + '</div>' +
      '</div>' +
      '<div class="cart-item-qty">' +
      '<button class="cart-qty-btn" data-article="' + safeArticle + '" data-delta="-1">−</button>' +
      '<span class="cart-qty-val">' + item.qty + '</span>' +
      '<button class="cart-qty-btn" data-article="' + safeArticle + '" data-delta="1">+</button>' +
      '<button class="cart-item-remove" data-article="' + safeArticle + '" data-remove>✕</button>' +
      '</div>' +
      '</div>';
  });
  body.innerHTML = html;
}

function showCart() {
  var panel = document.getElementById('cartPanel');
  var overlay = document.getElementById('cartOverlay');
  if (panel) panel.classList.add('open');
  if (overlay) overlay.classList.add('open');
}

function hideCart() {
  var panel = document.getElementById('cartPanel');
  var overlay = document.getElementById('cartOverlay');
  if (panel) panel.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

function formatPhone(input) {
  var v = input.value.replace(/\D/g, '');
  if (v.length === 0) { input.value = ''; return; }
  if (v[0] === '8') v = '7' + v.slice(1);
  if (v[0] !== '7') v = '7' + v;
  if (v.length > 11) v = v.slice(0, 11);
  var s = '+7';
  if (v.length > 1) s += ' (' + v.slice(1, 4);
  if (v.length > 4) s += ') ' + v.slice(4, 7);
  if (v.length > 7) s += '-' + v.slice(7, 9);
  if (v.length > 9) s += '-' + v.slice(9, 11);
  input.value = s;
}

function cartSubmit() {
  var name = document.getElementById('orderName').value.trim();
  var phone = document.getElementById('orderPhone').value.trim();
  if (!name || !phone) {
    cartStatus('Заполните Имя и Телефон', 'error');
    return;
  }
  if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phone)) {
    cartStatus('Введите корректный номер телефона', 'error');
    return;
  }
  phone = phone.replace(/\D/g, '');
  var email = document.getElementById('orderEmail').value.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    cartStatus('Введите корректный email', 'error');
    return;
  }
  if (!document.getElementById('orderConsent').checked) {
    cartStatus('Примите согласие на обработку данных', 'error');
    return;
  }
  if (cart.length === 0) {
    cartStatus('Корзина пуста', 'error');
    return;
  }
  cartStatus('Отправка...', '');
  var itemsText = '';
  cart.forEach(function(i) {
    itemsText += i.article + ' | ' + i.brand + ' | ' + i.name + ' | ' + i.qty + ' шт.\n';
  });
  var payload = {
    fields: {
      TITLE: 'Заказ уценки от ' + name,
      NAME: name,
      PHONE: [{ VALUE: phone, VALUE_TYPE: 'WORK' }],
      EMAIL: [{ VALUE: email, VALUE_TYPE: 'WORK' }],
      COMMENTS: 'Город: Москва\n\nСостав заказа:\n' + itemsText + '\nКомментарий: ' + document.getElementById('orderComment').value.trim(),
      SOURCE_ID: 'UCENKA'
    }
  };

  fetch(B24_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  .then(function(r) { return r.json(); })
  .then(function(res) {
    if (res.result) {
      cartStatus('Заказ отправлен!', 'success');
      showToast('Заказ отправлен! Номер: ' + res.result);
      navigator.sendBeacon(LOG_SHEET_URL, JSON.stringify({
        city: 'Москва',
        name: name,
        phone: phone,
        email: email,
        comment: document.getElementById('orderComment').value.trim(),
        items: cart,
        leadId: res.result
      }));
      cart = [];
      cartSave();
      cartRender();
      render();
      setTimeout(function() { hideCart(); }, 3000);
    } else {
      cartStatus('Ошибка: ' + JSON.stringify(res), 'error');
    }
  })
  .catch(function(err) {
    cartStatus('Ошибка отправки: ' + err, 'error');
  });
}

function cartStatus(msg, type) {
  var el = document.getElementById('cartStatus');
  if (!el) return;
  el.textContent = msg;
  el.className = 'cart-status';
  if (type) el.classList.add('cart-status-' + type);
}

function showToast(msg) {
  var el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('open');
  setTimeout(function() { el.classList.remove('open'); }, 4000);
}
// End cart module

document.addEventListener('click', function(e) {
  var btn = e.target.closest('[data-article][data-delta]');
  if (btn && !btn.disabled) {
    cartChangeQty(btn.dataset.article, parseInt(btn.dataset.delta, 10));
    return;
  }
  btn = e.target.closest('.cart-add-btn[data-article]');
  if (btn && !btn.disabled) {
    cartAdd(btn.dataset.article, btn.dataset.brand || '', btn.dataset.name || '', parseInt(btn.dataset.qty, 10) || 0);
    return;
  }
  btn = e.target.closest('[data-remove][data-article]');
  if (btn) {
    cartRemove(btn.dataset.article);
    return;
  }
  btn = e.target.closest('[data-spoiler]');
  if (btn) {
    toggleSpoiler(btn);
    return;
  }
  btn = e.target.closest('[data-copy-article]');
  if (btn) {
    copyArticle(btn);
    return;
  }
});

var s = document.createElement('script');
s.src = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tq=&gid=' + GID + '&tqx=out:json;responseHandler:cb';
document.body.appendChild(s);
