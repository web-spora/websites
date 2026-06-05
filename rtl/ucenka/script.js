const SHEET_ID = '1N6XI24dSjuRRXVJVsoCyB5O42dDpOGv4CoHWN6gPSu8';
const ORGANIZATIONS = [
  { gid: '0', name: 'ООО Рустранс-Логистик' },
  { gid: '1729447566', name: 'ИП Трошкина' }
];
const MAX_COLS = 14;
const container = document.getElementById('container');
const summary = document.getElementById('summary');
const filterOrg = document.getElementById('filter-org');
const filterBrand = document.getElementById('filter-brand');
const filterCat = document.getElementById('filter-cat');
const filterQty = document.getElementById('filter-qty');
let pending = ORGANIZATIONS.length;
let allItems = [];

function findField(fields, label) {
  for (const f of fields) {
    if (f.label === label) return f.value;
  }
  return '';
}

ORGANIZATIONS.forEach(org => {
  const cbName = 'cb' + org.gid;
  window[cbName] = function(json) {
    const cols = json.table.cols.slice(0, MAX_COLS).map(c => (c.label || '').replace(/[\s]+$/, ''));
      let category = 'Моторное';
      json.table.rows.forEach(row => {
        const cells = row.c;
        const catVal = cells[0] && cells[0].v ? ('' + cells[0].v).trim() : '';
        if (catVal === 'ТРАНСМИССИОННОЕ МАСЛО') category = 'Трансмиссионное';
        const brand = cells[1] && cells[1].v ? ('' + cells[1].v).trim() : '';
        const name = cells[3] && cells[3].v ? ('' + cells[3].v).trim() : '';
        if (!brand && !name) return;
        const fields = [];
        cells.slice(0, MAX_COLS).forEach((cell, i) => {
          let val = cell && cell.v !== null && cell.v !== undefined ? cell.v : '';
          if (val !== '' && cols[i].indexOf('Ссылка на') === -1 && cols[i].indexOf('Код') === -1) {
          fields.push({ label: cols[i], value: val });
        }
        });
        fields.unshift({ label: 'Назначение', value: category });
        fields.unshift({ label: 'Организация', value: org.name });
        allItems.push(fields);
      });
    if (--pending === 0) onDataLoaded();
  };
  const s = document.createElement('script');
  s.src = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tq=&gid=' + org.gid + '&tqx=out:json;responseHandler:' + cbName;
  document.body.appendChild(s);
});

function onDataLoaded() {
  const brands = new Set();
  allItems.forEach(item => {
    const b = findField(item, 'Бренд');
    if (b) brands.add(b);
  });
  [...brands].sort().forEach(b => {
    const opt = document.createElement('option');
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
  const orgVal = filterOrg.value;
  const brandVal = filterBrand.value;
  const catVal = filterCat.value;
  const qtyVal = filterQty.value;

  let filtered = allItems.filter(item => {
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
    var hasPhoto = false;
    var spoilerHtml = '';

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

      if (v.indexOf('drive.google.com/file/d/') !== -1) {
        var id = (v.match(/\/d\/([^\/]+)/) || [])[1] || '';
        hasPhoto = true;
        spoilerHtml += '<div class="photo-wrap"><a href="' + v + '" target="_blank" rel="noopener"><img class="thumb" src="https://drive.google.com/thumbnail?id=' + id + '&sz=w200" alt="фото"><div class="photo-hint">Увеличить</div></a></div>';
      } else if (v.indexOf('http://') === 0 || v.indexOf('https://') === 0) {
        spoilerHtml += '<div class="field"><span class="label">' + f.label + ':</span> <a href="' + v + '" target="_blank" rel="noopener">Перейти к фото</a></div>';
      } else {
        spoilerHtml += '<div class="field"><span class="label">' + f.label + ':</span> ' + v + '</div>';
      }
    });

    spoilerHtml = (hasPhoto ? '' : '<div class="no-photo">Фото ещё нет</div>') + spoilerHtml;

    var cardHtml = '';
    if (article) cardHtml += '<div class="article" onclick="copyArticle(this)" title="Нажмите, чтобы скопировать">' + article + '</div>';
    if (name) cardHtml += '<div class="product-name">' + name + '</div>';
    cardHtml += '<div class="spoiler-btn" onclick="toggleSpoiler(this)">Подробнее <span class="spoiler-arrow">▼</span></div>';
    cardHtml += '<div class="spoiler-content">' + spoilerHtml + '</div>';

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
