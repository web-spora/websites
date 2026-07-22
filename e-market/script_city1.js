/* ===== Конфигурация ===== */
const SHEET_ID = 'ВАШ_SHEET_ID';
const ORGANIZATIONS = [{gid: '0', name: 'ООО Ромашка'}];
const CART_KEY = 'cart_city1';
const B24_URL = 'https://your-domain.bitrix24.ru/rest/1/TOKEN/crm.lead.add';
const LOG_SHEET_URL = 'https://script.google.com/macros/s/ВАШ_SCRIPT_ID/exec';
const CITY_NAME = 'Москва';

/* ===== Состояние ===== */
const container = document.getElementById('container');
const summary = document.getElementById('summary');
const filterOrg = document.getElementById('filter-org');
const filterBrand = document.getElementById('filter-brand');
const filterCat = document.getElementById('filter-cat');
const filterQty = document.getElementById('filter-qty');
let allItems = [];

/* ===== Утилиты ===== */
function findField(item, label) {
  if (typeof item[label] !== 'undefined') return item[label];
  for (const key of Object.keys(item)) {
    if (key.trim().toLowerCase() === label.trim().toLowerCase()) return item[key];
  }
  return '';
}

function esc(v) {
  return (v || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('open');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('open'), 4000);
}

/* ===== Загрузка данных из Google Sheets ===== */
let pending = 0;

ORGANIZATIONS.forEach(org => {
  pending++;
  const cbName = 'cb' + org.gid;
  window[cbName] = function(json) {
    const cols = json.table.cols.map(c => (c.label || '').trim());
    json.table.rows.forEach(row => {
      const cells = row.c;
      const item = {};
      cols.forEach((label, i) => {
        item[label] = cells[i] && cells[i].v !== null ? '' + cells[i].v : '';
      });
      item['Организация'] = org.name;
      allItems.push(item);
    });
    if (--pending === 0) onDataLoaded();
  };
  var s = document.createElement('script');
  s.src = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tq=&gid=' + org.gid + '&tqx=out:json;responseHandler:' + cbName;
  document.body.appendChild(s);
});

/* ===== После загрузки ===== */
function onDataLoaded() {
  const orgs = new Set();
  const brands = new Set();
  allItems.forEach(item => {
    const o = findField(item, 'Организация');
    if (o) orgs.add(o);
    const b = findField(item, 'Бренд');
    if (b) brands.add(b);
  });

  orgs.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o; opt.textContent = o;
    filterOrg.appendChild(opt);
  });
  brands.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b; opt.textContent = b;
    filterBrand.appendChild(opt);
  });

  [filterOrg, filterBrand, filterCat, filterQty].forEach(el => {
    el.addEventListener('change', render);
  });

  cartSync();
  render();
  cartRender();
}

/* ===== Фильтрация и рендер ===== */
function render() {
  let filtered = allItems.filter(item => {
    if (filterOrg.value !== 'all' && findField(item, 'Организация') !== filterOrg.value) return false;
    if (filterCat.value !== 'all' && findField(item, 'Назначение') !== filterCat.value) return false;
    if (filterBrand.value !== 'all' && findField(item, 'Бренд') !== filterBrand.value) return false;
    return true;
  });

  if (filterQty.value === 'asc') {
    filtered.sort((a, b) => (parseFloat(findField(a, 'Остаток')) || 0) - (parseFloat(findField(b, 'Остаток')) || 0));
  } else if (filterQty.value === 'desc') {
    filtered.sort((a, b) => (parseFloat(findField(b, 'Остаток')) || 0) - (parseFloat(findField(a, 'Остаток')) || 0));
  }

  summary.textContent = 'Показано: ' + filtered.length + ' из ' + allItems.length;

  container.innerHTML = '';
  filtered.forEach(item => {
    container.innerHTML += buildCardHTML(item);
  });
}

/* ===== Построение карточки ===== */
function buildCardHTML(item) {
  const article = findField(item, 'Артикул');
  const name = findField(item, 'Наименование');
  const brand = findField(item, 'Бренд');
  const qty = parseFloat(findField(item, 'Остаток')) || 0;
  const photoUrl = findField(item, 'Фото');

  let html = '<div class="card">';

  if (photoUrl && photoUrl.indexOf('drive.google.com/file/d/') !== -1) {
    const match = photoUrl.match(/\/d\/([^\/]+)/);
    const id = match ? match[1] : '';
    html += '<div class="photo-wrap"><a href="' + esc(photoUrl) + '" target="_blank">'
      + '<img class="thumb" src="https://drive.google.com/thumbnail?id=' + id + '&sz=w200" loading="lazy">'
      + '<div class="photo-hint">Увеличить</div></a></div>';
  } else {
    html += '<div class="no-photo">Фото ещё нет</div>';
  }

  if (article) {
    html += '<div class="article" data-copy-article="' + esc(article) + '">' + esc(article) + '</div>';
  }
  if (name) {
    html += '<div class="product-name">' + esc(name) + '</div>';
  }

  html += '<div class="spoiler-btn" data-spoiler>Подробнее ▼</div>';
  html += '<div class="spoiler-content">' + buildDetails(item) + '</div>';

  if (qty > 0) {
    html += buildCartControls(article, qty, brand, name);
  } else {
    html += '<div style="font-size:.8rem;color:#e53935;padding-top:8px;margin-top:auto">Нет в наличии</div>';
  }

  html += '</div>';
  return html;
}

/* ===== Детали товара ===== */
function buildDetails(item) {
  const fields = ['Бренд', 'Назначение', 'Остаток', 'Производитель', 'Вязкость', 'Объём', 'Состав', 'Примечание'];
  let html = '';
  fields.forEach(f => {
    const v = findField(item, f);
    if (v) {
      html += '<div class="detail-row"><span class="detail-label">' + esc(f) + '</span><span class="detail-value">' + esc(v) + '</span></div>';
    }
  });
  return html;
}

/* ===== Корзина ===== */
let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');

function cartSync() {
  const validArticles = new Set(allItems.map(i => findField(i, 'Артикул')));
  cart = cart.filter(c => validArticles.has(c.article));
  cart.forEach(c => {
    const source = allItems.find(i => findField(i, 'Артикул') === c.article);
    if (source) {
      const maxQty = parseFloat(findField(source, 'Остаток')) || 0;
      if (c.qty > maxQty) c.qty = maxQty;
    }
  });
  cart = cart.filter(c => c.qty > 0);
  cartSave();
}

function cartSave() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function cartAdd(article, brand, name, maxQty) {
  const existing = cart.find(i => i.article === article);
  const current = existing ? existing.qty : 0;
  if (current < maxQty) {
    if (existing) existing.qty++;
    else cart.push({article, brand, name, qty: 1});
    cartSave();
    cartRender();
    render();
    showToast('Товар добавлен в корзину');
  }
}

function cartChangeQty(article, delta) {
  let item = cart.find(i => i.article === article);
  if (!item && delta > 0) {
    const source = allItems.find(i => findField(i, 'Артикул') === article);
    if (source) {
      const maxQty = parseFloat(findField(source, 'Остаток')) || 0;
      if (maxQty > 0) {
        cart.push({article, brand: findField(source, 'Бренд'), name: findField(source, 'Наименование'), qty: 0});
        item = cart[cart.length - 1];
      }
    }
  }
  if (!item) return;
  const source = allItems.find(i => findField(i, 'Артикул') === article);
  const maxQty = source ? (parseFloat(findField(source, 'Остаток')) || 0) : 0;
  let newQty = item.qty + delta;
  if (newQty > maxQty) newQty = maxQty;
  if (newQty <= 0) {
    cart = cart.filter(i => i.article !== article);
  } else {
    item.qty = newQty;
  }
  cartSave();
  cartRender();
  render();
}

function cartRemove(article) {
  cart = cart.filter(i => i.article !== article);
  cartSave();
  cartRender();
  render();
}

function cartRender() {
  const badge = document.getElementById('cartBadge');
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  if (totalQty > 0) {
    badge.style.display = 'inline-flex';
    badge.textContent = totalQty;
  } else {
    badge.style.display = 'none';
  }

  const body = document.getElementById('cartBody');
  const footer = document.getElementById('cartFooter');

  if (cart.length === 0) {
    body.innerHTML = '<div class="cart-empty">Корзина пуста</div>';
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';
  let html = '';
  cart.forEach(item => {
    const source = allItems.find(i => findField(i, 'Артикул') === item.article);
    const maxQty = source ? (parseFloat(findField(source, 'Остаток')) || 0) : 0;
    html += '<div class="cart-item">'
      + '<div class="cart-item-info">'
      + '<div class="cart-item-name">' + esc(item.name) + '</div>'
      + '<div class="cart-item-article">' + esc(item.article) + '</div>'
      + '</div>'
      + '<div class="cart-item-qty">'
      + '<button data-article="' + esc(item.article) + '" data-delta="-1"' + (item.qty > 1 ? '' : '') + '>−</button>'
      + '<span>' + item.qty + '</span>'
      + '<button data-article="' + esc(item.article) + '" data-delta="1"' + (item.qty < maxQty ? '' : ' disabled') + '>+</button>'
      + '</div>'
      + '<button class="cart-item-remove" data-remove data-article="' + esc(item.article) + '">✕</button>'
      + '</div>';
  });
  body.innerHTML = html;
}

function showCart() {
  document.getElementById('cartOverlay').classList.add('open');
  document.getElementById('cartPanel').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function hideCart() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartPanel').classList.remove('open');
  document.body.style.overflow = '';
}

/* ===== Построение кнопок корзины в карточке ===== */
function buildCartControls(article, maxQty, brand, name) {
  const safeArticle = esc(article);
  const inCart = cart.find(i => i.article === article);
  const inCartQty = inCart ? inCart.qty : 0;
  const remaining = maxQty - inCartQty;

  return '<div class="cart-controls">'
    + '<div class="cart-control-qty">'
    + '<button data-article="' + safeArticle + '" data-delta="-1"' + (inCartQty > 0 ? '' : ' disabled') + '>−</button>'
    + '<span>' + inCartQty + '</span>'
    + '<button data-article="' + safeArticle + '" data-delta="1"' + (remaining > 0 ? '' : ' disabled') + '>+</button>'
    + '</div>'
    + '<button class="cart-add-btn" data-article="' + safeArticle + '" data-brand="' + esc(brand) + '"'
    + ' data-name="' + esc(name) + '" data-qty="' + maxQty + '"' + (remaining > 0 ? '' : ' disabled') + '>В корзину</button>'
    + '</div>';
}

/* ===== Делегирование событий ===== */
document.addEventListener('click', function(e) {
  let btn = e.target.closest('[data-article][data-delta]');
  if (btn && !btn.disabled) {
    cartChangeQty(btn.dataset.article, parseInt(btn.dataset.delta));
    return;
  }
  btn = e.target.closest('.cart-add-btn[data-article]');
  if (btn && !btn.disabled) {
    cartAdd(btn.dataset.article, btn.dataset.brand, btn.dataset.name, parseInt(btn.dataset.qty));
    return;
  }
  btn = e.target.closest('[data-remove][data-article]');
  if (btn) { cartRemove(btn.dataset.article); return; }
  btn = e.target.closest('[data-spoiler]');
  if (btn) { toggleSpoiler(btn); return; }
  btn = e.target.closest('[data-copy-article]');
  if (btn) { copyArticle(btn); return; }
});

/* ===== Спойлер ===== */
function toggleSpoiler(btn) {
  btn.classList.toggle('open');
  const content = btn.nextElementSibling;
  if (content) content.classList.toggle('open');
  btn.innerHTML = btn.classList.contains('open') ? 'Подробнее ▲' : 'Подробнее ▼';
}

/* ===== Копирование артикула ===== */
function copyArticle(el) {
  const text = el.textContent;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text);
    el.style.color = '#27ae60';
    setTimeout(() => el.style.color = '', 800);
  }
}

/* ===== Бургер ===== */
function toggleBurger(btn) {
  btn.classList.toggle('open');
  document.querySelector('.mobile-nav').classList.toggle('open');
}

/* ===== Скролл ===== */
window.addEventListener('scroll', function() {
  const el = document.querySelector('.scroll-top');
  if (el) el.classList.toggle('show', window.scrollY > 300);
});

/* ===== Телефон ===== */
function formatPhone(input) {
  let v = input.value.replace(/\D/g, '');
  if (v.length === 0) { input.value = ''; return; }
  if (v[0] === '8') v = '7' + v.slice(1);
  if (v[0] !== '7') v = '7' + v;
  if (v.length > 11) v = v.slice(0, 11);
  let s = '+7';
  if (v.length > 1) s += ' (' + v.slice(1, 4);
  if (v.length > 4) s += ') ' + v.slice(4, 7);
  if (v.length > 7) s += '-' + v.slice(7, 9);
  if (v.length > 9) s += '-' + v.slice(9, 11);
  input.value = s;
}

/* ===== Отправка заказа ===== */
function cartSubmit() {
  const name = document.getElementById('orderName').value.trim();
  const phoneInput = document.getElementById('orderPhone').value.trim();
  const email = document.getElementById('orderEmail').value.trim();
  const comment = document.getElementById('orderComment').value.trim();
  const consent = document.getElementById('orderConsent').checked;

  if (!name) { showError('Введите имя'); return; }
  if (!phoneInput || !/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phoneInput)) {
    showError('Введите корректный номер телефона');
    return;
  }
  if (!consent) { showError('Примите согласие на обработку данных'); return; }

  const phone = phoneInput.replace(/\D/g, '');
  const statusEl = document.getElementById('cartStatus');
  statusEl.textContent = 'Отправка...';
  statusEl.style.color = '#888';
  const submitBtn = document.querySelector('.cart-submit');
  submitBtn.disabled = true;

  const itemsText = cart.map(i => i.article + ' | ' + i.brand + ' | ' + i.name + ' | ' + i.qty + ' шт.').join('\n');

  const payload = {
    fields: {
      TITLE: 'Заказ от ' + name + ' (' + CITY_NAME + ')',
      NAME: name,
      PHONE: [{ VALUE: phone, VALUE_TYPE: 'WORK' }],
      EMAIL: [{ VALUE: email, VALUE_TYPE: 'WORK' }],
      COMMENTS: 'Город: ' + CITY_NAME + '\n\nСостав заказа:\n' + itemsText + '\n\nКомментарий: ' + comment,
      SOURCE_ID: 'UCENKA'
    }
  };

  fetch(B24_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(r => r.json())
  .then(res => {
    if (res.result) {
      showToast('Заказ отправлен! Номер: ' + res.result);
      logToSheet({ name, phone, email, items: cart, leadId: res.result, comment });
      cart = []; cartSave(); cartRender(); render();
      statusEl.textContent = '';
      document.getElementById('orderName').value = '';
      document.getElementById('orderPhone').value = '';
      document.getElementById('orderEmail').value = '';
      document.getElementById('orderComment').value = '';
      document.getElementById('orderConsent').checked = false;
      setTimeout(() => hideCart(), 3000);
    } else {
      showError('Ошибка: ' + JSON.stringify(res));
    }
  })
  .catch(err => showError('Ошибка отправки: ' + err))
  .finally(() => { submitBtn.disabled = false; });
}

function showError(msg) {
  const el = document.getElementById('cartStatus');
  el.textContent = msg;
  el.style.color = '#e53935';
}

function logToSheet(data) {
  if (LOG_SHEET_URL.indexOf('ВАШ_SCRIPT_ID') !== -1) return;
  try {
    navigator.sendBeacon(LOG_SHEET_URL, JSON.stringify({
      city: CITY_NAME,
      name: data.name,
      phone: data.phone,
      email: data.email,
      comment: data.comment || '',
      items: data.items,
      leadId: data.leadId
    }));
  } catch (e) {}
}
