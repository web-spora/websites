// ===== Инициализация дашборда =====
(() => {
  const C = window.Charts;

  // ---- Иконки KPI (инлайн SVG) ----
  const ICONS = {
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11"/><path d="M3 16v-3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
    funnel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 14h.01"/><path d="M2 7l2.4-3.6A2 2 0 0 1 6.2 2.5H17a1 1 0 0 1 1 1V7"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>'
  };

  // ---- Анимированный счётчик ----
  function animateValue(el, target, opts = {}) {
    const dur = opts.dur || 1600;
    const prefix = opts.prefix || "";
    const suffix = opts.suffix || "";
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * ease);
      el.textContent = prefix + val.toLocaleString("ru-RU") + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toLocaleString("ru-RU") + suffix;
    }
    requestAnimationFrame(tick);
  }

  // ---- KPI grid ----
  const kpiGrid = document.getElementById("kpiGrid");
  AUDIT.kpi.forEach(k => {
    const card = document.createElement("div");
    card.className = "kpi-card";
    card.style.setProperty("--kpi-color", k.color);
    card.style.animationDelay = "0s";
    card.innerHTML = `
      <div class="kpi-top">
        <span class="kpi-label">${k.label}</span>
        <span class="kpi-icon">${ICONS[k.icon] || ICONS.users}</span>
      </div>
      <div class="kpi-value" data-target="${k.value}" data-prefix="${k.prefix || ""}" data-suffix="${k.suffix || ""}">0</div>
      <div class="kpi-note">${k.note}</div>
    `;
    kpiGrid.appendChild(card);
    const val = card.querySelector(".kpi-value");
    animateValue(val, k.value, { prefix: k.prefix || "", suffix: k.suffix || "" });
  });

  // ---- Графики ----
  // Месяцы
  C.vBarChart(document.getElementById("monthChart"), "Количество лидов по месяцам", AUDIT.months.labels, AUDIT.months.values);

  // Источники (топ) + воронка по источникам
  const topSources = AUDIT.sources.slice().sort((a, b) => b.leads - a.leads);
  C.hBarChart(document.getElementById("sourceChart"), "Лиды по источникам", topSources.map(s => ({ name: s.name, leads: s.leads, color: s.color })));
  C.hBarChart(
    document.getElementById("sourceFunnelChart"),
    "Конверсия воронки по источникам, %",
    AUDIT.sources.slice().sort((a, b) => b.funnel - a.funnel).map(s => ({ name: s.name, funnel: s.funnel, color: s.color })),
    { valueKey: "funnel", labelWidth: 170 }
  );

  // Направления
  const dirs = AUDIT.directions.slice().sort((a, b) => b.leads - a.leads);
  C.hBarChart(document.getElementById("dirChart"), "Лиды по направлениям бизнеса", dirs.map(d => ({ name: d.name, leads: d.leads, color: d.color })));
  C.dataTable(
    document.getElementById("dirTable"),
    "Направления: показатели",
    ["Направление", "Лиды", "Продаж", "Мусор", "Воронка"],
    dirs.map(d => ({
      cells: [d.name, C.fmtNum(d.leads), C.fmtNum(d.done), C.fmtNum(d.garbage), d.funnel.toFixed(1) + "%"],
      color: d.color
    })),
    { rightAlign: ["Лиды", "Продаж", "Мусор", "Воронка"], dots: true, dotCol: "Направление" }
  );

  // Воронка
  C.funnelViz(document.getElementById("funnelViz"), "Воронка стадий (33 740 лидов)", AUDIT.funnel);
  C.donutChart(document.getElementById("funnelDonut"), "Распределение по стадиям", AUDIT.funnel);

  // Экономика
  C.hBarChart(
    document.getElementById("effChart"),
    "Стоимость продажи по платным каналам, ₽",
    AUDIT.efficiency.map(e => ({ name: e.name, cpa: e.cpa, color: e.color })),
    { valueKey: "cpa", labelWidth: 170 }
  );

  C.dataTable(
    document.getElementById("budgetAvito"),
    "Бюджет Авито",
    ["Канал", "Расходы, ₽", "Контакты", "₽/контакт"],
    AUDIT.budget.avito.map(a => ({
      cells: [a.name, C.fmtMoney(a.spend), C.fmtNum(a.contacts), C.fmtNum(a.cpl)],
      color: "#5b8cff"
    })),
    { rightAlign: ["Расходы, ₽", "Контакты", "₽/контакт"], totalRow: 3, dots: true, dotCol: "Канал" }
  );

  C.dataTable(
    document.getElementById("budgetDrom"),
    "Бюджет Дром",
    ["Канал", "Расходы, ₽", "Просмотры", "Звонки"],
    AUDIT.budget.drom.map(d => ({
      cells: [d.name, C.fmtMoney(d.spend), C.fmtNum(d.views), C.fmtNum(d.calls)],
      color: "#60a5fa"
    })),
    { rightAlign: ["Расходы, ₽", "Просмотры", "Звонки"], totalRow: 3, dots: true, dotCol: "Канал" }
  );

  C.hBarChart(
    document.getElementById("freeChart"),
    "Бесплатные/картографические каналы: конверсия воронки, %",
    AUDIT.freeChannels.map(f => ({ name: f.name, funnel: f.funnel, color: "#34d399" })),
    { valueKey: "funnel", labelWidth: 170 }
  );

  // ---- Трафик (табы) ----
  const trafficTabs = document.getElementById("trafficTabs");
  const trafficChart = document.getElementById("trafficChart");
  const trafficCities = document.getElementById("trafficCities");

  function renderTraffic(siteKey) {
    const data = AUDIT.traffic[siteKey];
    trafficChart.innerHTML = "";
    trafficCities.innerHTML = "";
    C.hBarChart(trafficChart, `Источники визитов (всего ${C.fmtNum(data.total)})`, data.items.map(([name, val]) => ({ name, leads: val, color: "#5b8cff" })));
    C.hBarChart(trafficCities, "Топ городов", data.cities.map(([name, val]) => ({ name, leads: val, color: "#22d3ee" })));
  }
  trafficTabs.addEventListener("click", e => {
    const btn = e.target.closest(".tab");
    if (!btn) return;
    trafficTabs.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    renderTraffic(btn.dataset.site);
  });
  renderTraffic("fesauto");

  // ---- АСП ----
  C.dataTable(
    document.getElementById("aspTable"),
    "Каналы АСП Р263",
    ["Канал", "Объявления", "Просмотры", "Контакты", "Расходы, ₽", "₽/контакт"],
    AUDIT.asp.channels.map(c => ({
      cells: [c.name, c.ads, C.fmtNum(c.views), c.contacts, C.fmtMoney(c.spend), C.fmtNum(c.cpl)],
      color: "#22d3ee"
    })),
    { rightAlign: ["Объявления", "Просмотры", "Контакты", "Расходы, ₽", "₽/контакт"], totalRow: 2, dots: true, dotCol: "Канал" }
  );

  C.dataTable(
    document.getElementById("aspCrm"),
    "АСП в CRM (Битрикс24)",
    ["Показатель", "Значение"],
    AUDIT.asp.crm.map(([name, val]) => ({ cells: [name, C.fmtNum(val)] })),
    { rightAlign: ["Значение"] }
  );

  const aspNotes = document.getElementById("aspNotes");
  const notes = [
    "56,7% лидов АСП некачественные (899) — самая высокая доля по направлениям. Нужен скоринг на входе.",
    "Стадия продажи АСП не фиксируется («забрал» = 0). Реальная конверсия неизвестна — настроить воронку АСП в CRM.",
    "Авито АСП: 1 692 контакта при 560 ₽/контакт — самый дешёвый контакт в портфеле. Масштабировать объявления.",
    "Дром АСП: 173 650 просмотров, но лишь 96 целевых звонков и 246 диалогов. 1 769 ₽ за звонок — дорого.",
    "Итого 1 118 135 ₽/год на АСП — второй по объёму поток. Сконвертировано 20,4% — потенциал продаж есть.",
    "Точка роста: автоматизация квалификации АСП-лидов (марка, год, бюджет, город) уберёт 56% мусора."
  ];
  const noteList = document.createElement("ul");
  noteList.style.cssText = "padding-left:20px;color:var(--muted);font-size:14px;display:grid;gap:8px;";
  notes.forEach(n => {
    const li = document.createElement("li");
    li.textContent = n;
    noteList.appendChild(li);
  });
  aspNotes.appendChild(noteList);

  // ---- Слабые места ----
  const weakGrid = document.getElementById("weakGrid");
  AUDIT.weak.forEach(w => {
    const card = document.createElement("div");
    card.className = "mini-card warn reveal";
    card.innerHTML = `
      <div class="num">0${w.num}</div>
      <h3>${w.title}</h3>
      <p>${w.desc}</p>
      <div class="fix">→ ${w.fix}</div>
    `;
    weakGrid.appendChild(card);
  });

  // ---- Точки роста ----
  const growthGrid = document.getElementById("growthGrid");
  AUDIT.growth.forEach(g => {
    const card = document.createElement("div");
    card.className = "mini-card good reveal";
    card.innerHTML = `
      <div class="num">0${g.num}</div>
      <span class="chip">${g.eff}</span>
      <h3>${g.title}</h3>
      <p>${g.act}</p>
    `;
    growthGrid.appendChild(card);
  });

  // ---- Scroll reveal ----
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add("visible");
        revealObserver.unobserve(en.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

  // ---- Навигация: активный пункт + бургер ----
  const navLinks = document.getElementById("navLinks");
  const nav = document.getElementById("nav");
  const links = navLinks.querySelectorAll("a");

  window.addEventListener("scroll", () => {
    nav.style.background = window.scrollY > 40
      ? "rgba(10, 14, 26, 0.92)"
      : "rgba(10, 14, 26, 0.6)";
    let current = "";
    document.querySelectorAll("section").forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 140) current = sec.id;
    });
    links.forEach(a => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  });

  document.getElementById("navBurger").addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
  links.forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

  // ---- Плавный скролл для якорей с фикс. навигацией ----
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.pageYOffset - 70;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }
    });
  });
})();
