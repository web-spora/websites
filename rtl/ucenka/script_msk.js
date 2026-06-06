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
    if (article) cardHtml += '<div class="article" onclick="copyArticle(this)" title="Нажмите, чтобы скопировать">' + article + '</div>';
    if (name) cardHtml += '<div class="product-name">' + name + '</div>';
    cardHtml += '<div class="spoiler-btn" onclick="toggleSpoiler(this)">Подробнее <span class="spoiler-arrow">▼</span></div>';
    cardHtml += '<div class="spoiler-content">' + restHtml + '</div>';

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

var s = document.createElement('script');
s.src = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tq=&gid=' + GID + '&tqx=out:json;responseHandler:cb';
document.body.appendChild(s);
