// ===== SVG-чарты: барах, пончики, линейные, воронка =====
const NS = "http://www.w3.org/2000/svg";

function svgEl(tag, attrs) {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}

function fmtNum(n) {
  return n.toLocaleString("ru-RU");
}

function fmtMoney(n) {
  return n.toLocaleString("ru-RU") + " ₽";
}

// Встраиваем SVG в контейнер с CSS-анимацией появления
function mount(container, svg, opts = {}) {
  container.classList.add("chart");
  container.appendChild(svg);
  if (opts.legend) {
    const lg = document.createElement("div");
    lg.className = "chart-legend";
    opts.legend.forEach(item => {
      const span = document.createElement("span");
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.style.background = item.color;
      span.appendChild(dot);
      span.appendChild(document.createTextNode(item.name + (item.val !== undefined ? " — " + item.val : "")));
      lg.appendChild(span);
    });
    container.appendChild(lg);
  }
}

// ===== Горизонтальные бары (источники, каналы) =====
function hBarChart(container, title, items, opts = {}) {
  const valueKey = opts.valueKey || "leads";
  const max = Math.max(...items.map(it => it[valueKey]));
  const labelW = opts.labelWidth || 170;
  const rowH = opts.rowH || 34;
  const gap = opts.gap || 6;
  const height = items.length * rowH + 20;
  const width = opts.width || 620;
  const barMaxW = width - labelW - 90;

  const head = document.createElement("div");
  head.className = "chart-title";
  head.textContent = title;
  container.appendChild(head);

  const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, width: "100%", height });
  svg.style.overflow = "visible";

  items.forEach((it, i) => {
    const val = it[valueKey];
    const frac = max > 0 ? val / max : 0;
    const y = i * rowH + 14;
    const color = it.color || opts.color || "#5b8cff";

    const lbl = svgEl("text", { x: 0, y: y + 14, class: "bar-label", "text-anchor": "start" });
    lbl.textContent = it.name;
    svg.appendChild(lbl);

    const bg = svgEl("rect", { x: labelW, y, width: barMaxW, height: rowH - 12, rx: 7, fill: "rgba(255,255,255,0.05)" });
    svg.appendChild(bg);

    const bar = svgEl("rect", { x: labelW, y, width: 0, height: rowH - 12, rx: 7, fill: color, class: "bar", opacity: 0.92 });
    bar.style.transition = "width 1s cubic-bezier(0.22,1,0.36,1) " + (i * 0.06) + "s";
    bar.dataset.w = Math.max(4, barMaxW * frac);
    svg.appendChild(bar);

    const tv = svgEl("text", { x: labelW + barMaxW + 8, y: y + 15, class: "bar-value" });
    tv.textContent = fmtNum(val);
    svg.appendChild(tv);
  });

  mount(container, svg);
  requestAnimationFrame(() => {
    svg.querySelectorAll(".bar").forEach(b => b.setAttribute("width", b.dataset.w));
  });
  return svg;
}

// ===== Вертикальные колонки (месяцы) =====
function vBarChart(container, title, labels, values, opts = {}) {
  const width = 640, height = 320;
  const padL = 52, padB = 34, padT = 16, padR = 14;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const max = Math.max(...values) * 1.1;
  const n = values.length;
  const slot = plotW / n;
  const barW = Math.min(34, slot * 0.55);

  const head = document.createElement("div");
  head.className = "chart-title";
  head.textContent = title;
  container.appendChild(head);

  const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, width: "100%", height });
  const grad = svgEl("linearGradient", { id: "vbar-grad", x1: 0, y1: 0, x2: 0, y2: 1 });
  const st1 = svgEl("stop", { offset: "0%", "stop-color": "#5b8cff" });
  const st2 = svgEl("stop", { offset: "100%", "stop-color": "#22d3ee" });
  grad.appendChild(st1); grad.appendChild(st2);
  svg.appendChild(grad);

  // сетка
  const ticks = 4;
  for (let t = 0; t <= ticks; t++) {
    const y = padT + plotH - (plotH / ticks) * t;
    const line = svgEl("line", { x1: padL, x2: width - padR, y1: y, y2: y, stroke: "rgba(255,255,255,0.06)" });
    svg.appendChild(line);
    const txt = svgEl("text", { x: padL - 8, y: y + 4, "text-anchor": "end", class: "tick-text" });
    txt.textContent = fmtNum(Math.round(max * (t / ticks)));
    svg.appendChild(txt);
  }

  values.forEach((v, i) => {
    const h = Math.max(2, plotH * (v / max));
    const x = padL + slot * i + (slot - barW) / 2;
    const y = padT + plotH - h;
    const bar = svgEl("rect", { x, y: padT + plotH, width: barW, height: 0, rx: 6, fill: "url(#vbar-grad)", class: "bar" });
    bar.style.transition = "all 0.9s cubic-bezier(0.22,1,0.36,1) " + (i * 0.05) + "s";
    bar.dataset.h = h; bar.dataset.y = y;
    svg.appendChild(bar);
    const lbl = svgEl("text", { x: x + barW / 2, y: padT + plotH + 18, "text-anchor": "middle", class: "bar-label" });
    lbl.textContent = labels[i].slice(2);
    svg.appendChild(lbl);
    const tv = svgEl("text", { x: x + barW / 2, y: y - 7, "text-anchor": "middle", class: "bar-value" });
    tv.textContent = fmtNum(v);
    tv.style.opacity = 0;
    tv.style.transition = "opacity 0.5s ease " + (0.5 + i * 0.05) + "s";
    svg.appendChild(tv);
  });

  mount(container, svg);
  requestAnimationFrame(() => {
    svg.querySelectorAll("rect.bar").forEach(b => {
      b.setAttribute("height", b.dataset.h);
      b.setAttribute("y", b.dataset.y);
    });
    svg.querySelectorAll(".bar-value").forEach(t => t.style.opacity = 1);
  });
  return svg;
}

// ===== Пончик (воронка стадий) =====
function donutChart(container, title, items, opts = {}) {
  const size = 240, cx = size / 2, cy = size / 2, r = 92, sw = 34;
  const total = items.reduce((s, it) => s + it.value, 0);
  const head = document.createElement("div");
  head.className = "chart-title";
  head.textContent = title;
  container.appendChild(head);

  const svg = svgEl("svg", { viewBox: `0 0 ${size} ${size}`, width: 220, height: 220, style: "display:block;margin:0 auto" });

  const bgc = svgEl("circle", { cx, cy, r, fill: "none", stroke: "rgba(255,255,255,0.07)", "stroke-width": sw });
  svg.appendChild(bgc);

  const C = 2 * Math.PI * r;
  let offset = 0;
  items.forEach((it, i) => {
    const frac = it.value / total;
    const len = frac * C;
    const seg = svgEl("circle", {
      cx, cy, r, fill: "none", stroke: it.color,
      "stroke-width": sw, "stroke-linecap": "butt",
      "stroke-dasharray": `${len} ${C - len}`,
      "stroke-dashoffset": -offset,
      transform: `rotate(-90 ${cx} ${cy})`,
      opacity: 0
    });
    seg.style.transition = "opacity 0.8s ease " + (i * 0.12) + "s";
    svg.appendChild(seg);
    offset += len;
  });

  const center = svgEl("g", {});
  const cv = svgEl("text", { x: cx, y: cy - 2, "text-anchor": "middle", class: "donut-value", fill: "#fff", "font-size": "30", "font-weight": "800" });
  cv.textContent = fmtNum(total);
  const cl = svgEl("text", { x: cx, y: cy + 18, "text-anchor": "middle", class: "tick-text" });
  cl.textContent = "всего лидов";
  center.appendChild(cv); center.appendChild(cl);
  svg.appendChild(center);

  mount(container, svg, { legend: items.map(it => ({ name: it.name, color: it.color, val: fmtNum(it.value) })) });

  requestAnimationFrame(() => {
    svg.querySelectorAll("circle[opacity='0']").forEach(c => c.setAttribute("opacity", "1"));
  });
  return svg;
}

// ===== Воронка (таперные ряды) =====
function funnelViz(container, title, items, opts = {}) {
  const head = document.createElement("div");
  head.className = "chart-title";
  head.textContent = title;
  container.appendChild(head);

  const max = items[0].value;
  items.forEach((it, i) => {
    const row = document.createElement("div");
    row.className = "funnel-row";

    const name = document.createElement("div");
    name.className = "funnel-name";
    name.textContent = it.name;
    row.appendChild(name);

    const wrap = document.createElement("div");
    wrap.className = "funnel-bar-wrap";
    const bar = document.createElement("div");
    bar.className = "funnel-bar";
    bar.style.background = it.color;
    bar.style.width = "0%";
    bar.dataset.w = Math.max(12, (it.value / max) * 100);
    bar.textContent = fmtNum(it.value);
    wrap.appendChild(bar);
    row.appendChild(wrap);

    const pct = document.createElement("div");
    pct.className = "funnel-pct";
    pct.textContent = (it.value / max * 100).toFixed(1) + "%";
    row.appendChild(pct);

    container.appendChild(row);
  });

  requestAnimationFrame(() => {
    container.querySelectorAll(".funnel-bar").forEach(b => b.style.width = b.dataset.w + "%");
  });
}

// ===== Таблица из данных =====
function dataTable(container, title, columns, rows, opts = {}) {
  const head = document.createElement("div");
  head.className = "chart-title";
  head.textContent = title;
  container.appendChild(head);

  const table = document.createElement("table");
  table.className = "tbl";
  const thead = document.createElement("thead");
  const trh = document.createElement("tr");
  columns.forEach(c => {
    const th = document.createElement("th");
    th.textContent = c;
    if (opts.rightAlign && opts.rightAlign.includes(c)) th.style.textAlign = "right";
    trh.appendChild(th);
  });
  thead.appendChild(trh);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach((r, ri) => {
    const tr = document.createElement("tr");
    if (opts.totalRow === ri) tr.className = "total";
    r.cells.forEach((cell, ci) => {
      const td = document.createElement("td");
      if (opts.rightAlign && opts.rightAlign.includes(columns[ci])) td.className = "num-cell";
      if (r.badge && columns[ci] === opts.badgeCol) {
        td.innerHTML = `<span class="badge ${r.badgeTone}">${cell}</span>`;
      } else if (opts.dots && columns[ci] === opts.dotCol) {
        const d = document.createElement("span");
        d.className = "dot";
        d.style.background = r.color;
        td.appendChild(d);
        td.appendChild(document.createTextNode(cell));
      } else {
        td.textContent = cell;
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

// Экспорт для main.js
window.Charts = { hBarChart, vBarChart, donutChart, funnelViz, dataTable, fmtNum, fmtMoney };
