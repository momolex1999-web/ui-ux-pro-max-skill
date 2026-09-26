/* ==========================================================================
   LAQTA × SAYED KADHIM — Internal Creative Manual
   Vanilla JS, no dependencies.
   --------------------------------------------------------------------------
   1. Editable data (shot list)
   2. Helpers (safe storage, pad)
   3. Chrome: progress bar, timecode, active chapter, rail, index overlay
   4. Keyboard chapter navigation (J / K)
   5. Ch.07 content-system filter
   6. Ch.10 contact-sheet shot matrix
   7. Ch.13 Before Month One checklist
   8. Ch.15 loop diagram
   9. Ch.16 final filter tester
   10. Scroll reveal
   ========================================================================== */

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  /* 1. EDITABLE DATA ======================================================= */

  // Food categories to cover on production days. Reorder once the client
  // confirms hero dishes (chapter 13).
  const SHOT_CATEGORIES = [
    { id: "kebab",   ar: "كباب",       en: "KEBAB" },
    { id: "qouzi",   ar: "قوزي",       en: "QOUZI" },
    { id: "fish",    ar: "سمك",        en: "FISH" },
    { id: "dolma",   ar: "دولمة",      en: "DOLMA" },
    { id: "chicken", ar: "دجاج",       en: "CHICKEN" },
    { id: "fried",   ar: "كنتاكي",     en: "FRIED CHICKEN" },
    { id: "bread",   ar: "الخبز الحار", en: "FRESH BREAD" }
  ];

  // Shots required per category. `opt: true` = only if delivered.
  const SHOTS = [
    { id: "hero",     en: "HERO",      ar: "هيرو" },
    { id: "wide",     en: "WIDE",      ar: "عريضة" },
    { id: "medium",   en: "MEDIUM",    ar: "متوسطة" },
    { id: "macro",    en: "MACRO",     ar: "ماكرو" },
    { id: "prep",     en: "PREP",      ar: "تحضير" },
    { id: "serving",  en: "SERVING",   ar: "تقديم" },
    { id: "hands",    en: "HANDS",     ar: "إيدين" },
    { id: "steam",    en: "STEAM",     ar: "بخار" },
    { id: "table",    en: "TABLE",     ar: "عالطاولة" },
    { id: "eating",   en: "EATING",    ar: "أكل وتفاعل" },
    { id: "pack",     en: "PACKAGING*", ar: "تغليف", opt: true },
    { id: "delivery", en: "DELIVERY*",  ar: "نسخة توصيل", opt: true }
  ];

  const STORE_SHOTS = "laqta-sk-shots-v1";
  const STORE_BMO = "laqta-sk-bmo-v1";

  /* 2. HELPERS ============================================================= */

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const pad = (n) => String(n).padStart(2, "0");

  // Storage can throw (private mode, blocked data) — the page works without it.
  const store = {
    get(key) {
      try { return JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { return {}; }
    },
    set(key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
    }
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 3. CHROME ============================================================== */

  const sections = $$("main section[data-ch]");
  const progressBar = $("#progress-bar");
  const tcEl = $("#tc");
  const nowNum = $("#now-num");
  const nowTitle = $("#now-title");
  const railLinks = $$("#rail a");
  const topbar = $("#topbar");

  // Group consecutive sections that share a chapter number (e.g. statement + body)
  const chapters = [];
  sections.forEach((sec) => {
    const ch = sec.dataset.ch;
    const last = chapters[chapters.length - 1];
    if (last && last.ch === ch) last.els.push(sec);
    else chapters.push({ ch, title: sec.dataset.title, els: [sec] });
  });

  let currentCh = null;

  function onScroll() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const y = window.scrollY;
    const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    if (progressBar) progressBar.style.transform = "scaleX(" + p.toFixed(4) + ")";

    // Active chapter: last chapter whose top has passed the reading line
    const line = (topbar ? topbar.offsetHeight : 56) + window.innerHeight * 0.3;
    let active = chapters[0];
    for (const c of chapters) {
      if (c.els[0].getBoundingClientRect().top <= line) active = c;
    }

    // Timecode: HH:MM:SS:FF where MM = chapter, SS:FF = progress inside it
    const first = active.els[0].getBoundingClientRect();
    const lastEl = active.els[active.els.length - 1].getBoundingClientRect();
    const span = Math.max(1, lastEl.bottom - first.top);
    const f = Math.min(0.9999, Math.max(0, (line - first.top) / span));
    const secs = f * 60;
    if (tcEl) tcEl.textContent = "00:" + pad(active.ch) + ":" + pad(Math.floor(secs)) + ":" + pad(Math.floor((secs % 1) * 25));

    if (active.ch !== currentCh) {
      currentCh = active.ch;
      if (nowNum) nowNum.textContent = active.ch;
      if (nowTitle) nowTitle.textContent = active.title;
      railLinks.forEach((a) => {
        const on = a.dataset.ch === active.ch;
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
      $$("#toc-panel a").forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#ch" + active.ch));
    }
  }

  let ticking = false;
  function requestScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; onScroll(); });
  }
  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll);

  // Index overlay — reuses the cover table of contents
  const indexBtn = $("#index-btn");
  const indexPanel = $("#index-panel");
  const indexClose = $("#index-close");
  const tocPanel = $("#toc-panel");
  const tocSource = $("#toc");
  if (tocPanel && tocSource) tocPanel.innerHTML = tocSource.innerHTML;

  function openIndex() {
    indexPanel.hidden = false;
    indexBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    indexClose.focus();
  }
  function closeIndex(returnFocus) {
    indexPanel.hidden = true;
    indexBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (returnFocus) indexBtn.focus();
  }
  if (indexBtn && indexPanel) {
    indexBtn.addEventListener("click", () => (indexPanel.hidden ? openIndex() : closeIndex(true)));
    indexClose.addEventListener("click", () => closeIndex(true));
    indexPanel.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeIndex(false);
      else if (e.target === indexPanel) closeIndex(true);
    });
  }

  /* 4. KEYBOARD NAV ======================================================== */

  const anchors = $$("main section[id]");
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && indexPanel && !indexPanel.hidden) { closeIndex(true); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    const k = e.key.toLowerCase();
    if (k !== "j" && k !== "k") return;
    const line = (topbar ? topbar.offsetHeight : 56) + 12;
    let idx = -1;
    anchors.forEach((a, i) => { if (a.getBoundingClientRect().top <= line + 4) idx = i; });
    const next = k === "j" ? Math.min(anchors.length - 1, idx + 1) : Math.max(0, idx - (anchors[idx] && anchors[idx].getBoundingClientRect().top < line - 40 ? 0 : 1));
    if (anchors[next]) anchors[next].scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* 5. CONTENT SYSTEM FILTER =============================================== */

  const filterBtns = $$(".filter");
  const tiles = $$(".tile");
  const tilesCount = $("#tiles-count");

  function applyFilter(key) {
    let shown = 0;
    tiles.forEach((tile) => {
      const hit = key === "all" || (key === "paid" ? tile.dataset.paid === "1" : tile.dataset.job === key);
      tile.classList.toggle("is-dim", !hit);
      tile.classList.toggle("is-hit", hit && key !== "all");
      if (hit) shown++;
    });
    filterBtns.forEach((b) => {
      const on = b.dataset.filter === key;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", String(on));
    });
    if (tilesCount) tilesCount.textContent = shown + " / " + tiles.length + " قطعة ظاهرة";
  }
  filterBtns.forEach((b) => b.addEventListener("click", () => {
    const already = b.classList.contains("is-on") && b.dataset.filter !== "all";
    applyFilter(already ? "all" : b.dataset.filter);
  }));

  /* 6. CONTACT SHEET ======================================================= */

  const shotTable = $("#shot-table");
  const shotCount = $("#shot-count");
  const shotState = store.get(STORE_SHOTS);

  function buildShotTable() {
    if (!shotTable) return;
    let html = "<thead><tr><th scope=\"col\"><span class=\"ar\">الصنف</span></th>";
    SHOTS.forEach((s) => {
      html += "<th scope=\"col\"" + (s.opt ? " class=\"opt\"" : "") + "><span class=\"en\">" + s.en + "</span><small>" + s.ar + "</small></th>";
    });
    html += "<th scope=\"col\"><span class=\"en\">DONE</span></th></tr></thead><tbody>";
    SHOT_CATEGORIES.forEach((c) => {
      html += "<tr data-cat=\"" + c.id + "\"><th scope=\"row\"><b>" + c.ar + "</b><span class=\"en\">" + c.en + "</span></th>";
      SHOTS.forEach((s) => {
        const id = "shot-" + c.id + "-" + s.id;
        html += "<td><label class=\"shot-cell\"><input type=\"checkbox\" id=\"" + id + "\" aria-label=\"" + c.ar + " — " + s.en.replace("*", "") + "\"" + (shotState[id] ? " checked" : "") + "><span></span></label></td>";
      });
      html += "<td class=\"row-count en\">0/" + SHOTS.length + "</td></tr>";
    });
    html += "</tbody>";
    shotTable.innerHTML = html;
  }

  function updateShots() {
    if (!shotTable) return;
    const boxes = $$("input", shotTable);
    const done = boxes.filter((b) => b.checked).length;
    if (shotCount) shotCount.textContent = done + " / " + boxes.length;
    $$("tbody tr", shotTable).forEach((row) => {
      const rb = $$("input", row);
      const rd = rb.filter((b) => b.checked).length;
      const cell = $(".row-count", row);
      cell.textContent = rd + "/" + rb.length;
      cell.classList.toggle("is-done", rd === rb.length);
    });
  }

  buildShotTable();
  updateShots();
  if (shotTable) {
    shotTable.addEventListener("change", (e) => {
      const box = e.target;
      if (box.type !== "checkbox") return;
      if (box.checked) shotState[box.id] = 1; else delete shotState[box.id];
      store.set(STORE_SHOTS, shotState);
      updateShots();
    });
  }
  const shotReset = $("#shot-reset");
  if (shotReset) shotReset.addEventListener("click", () => {
    $$("input", shotTable).forEach((b) => { b.checked = false; });
    Object.keys(shotState).forEach((k) => delete shotState[k]);
    store.set(STORE_SHOTS, shotState);
    updateShots();
  });

  /* 7. BEFORE MONTH ONE ==================================================== */

  const bmo = $("#bmo");
  const bmoState = store.get(STORE_BMO);
  const bmoBar = $("#bmo-bar");
  const bmoCount = $("#bmo-count");
  const bmoToggle = $("#bmo-toggle");
  const bmoReset = $("#bmo-reset");

  function updateBmo() {
    if (!bmo) return;
    const boxes = $$("input[type=checkbox]", bmo);
    const done = boxes.filter((b) => b.checked).length;
    if (bmoCount) bmoCount.textContent = done + " / " + boxes.length;
    if (bmoBar) bmoBar.style.width = (boxes.length ? (done / boxes.length) * 100 : 0) + "%";
    $$(".bmo-group", bmo).forEach((g) => {
      const gb = $$("input[type=checkbox]", g);
      const gd = gb.filter((b) => b.checked).length;
      const c = $("[data-count]", g);
      if (c) c.textContent = gd + "/" + gb.length;
      g.classList.toggle("is-complete", gd === gb.length);
    });
  }

  function syncBmoToggleLabel() {
    if (!bmoToggle) return;
    const allOpen = $$(".bmo-group", bmo).every((g) => g.open);
    bmoToggle.textContent = allOpen ? "سد الكل" : "افتح الكل";
  }

  if (bmo) {
    $$("input[type=checkbox]", bmo).forEach((b) => { if (bmoState[b.id]) b.checked = true; });
    bmo.addEventListener("change", (e) => {
      const box = e.target;
      if (box.type !== "checkbox") return;
      if (box.checked) bmoState[box.id] = 1; else delete bmoState[box.id];
      store.set(STORE_BMO, bmoState);
      updateBmo();
    });
    $$(".bmo-group", bmo).forEach((g) => g.addEventListener("toggle", syncBmoToggleLabel));
    updateBmo();
    syncBmoToggleLabel();
  }
  if (bmoToggle) bmoToggle.addEventListener("click", () => {
    const groups = $$(".bmo-group", bmo);
    const openAll = !groups.every((g) => g.open);
    groups.forEach((g) => { g.open = openAll; });
    syncBmoToggleLabel();
  });
  if (bmoReset) bmoReset.addEventListener("click", () => {
    $$("input[type=checkbox]", bmo).forEach((b) => { b.checked = false; });
    Object.keys(bmoState).forEach((k) => delete bmoState[k]);
    store.set(STORE_BMO, bmoState);
    updateBmo();
  });

  /* 8. LOOP DIAGRAM ======================================================== */

  const loopNodes = $$(".loop-node");
  const loopSteps = $$("#loop-steps li");

  function setLoopStep(step) {
    loopNodes.forEach((n) => {
      const on = n.dataset.step === step;
      n.classList.toggle("is-active", on);
      n.setAttribute("aria-pressed", String(on));
    });
    loopSteps.forEach((li) => li.classList.toggle("is-active", li.dataset.step === step));
  }
  loopNodes.forEach((n) => {
    n.addEventListener("click", () => setLoopStep(n.dataset.step));
    n.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLoopStep(n.dataset.step); }
    });
  });
  loopSteps.forEach((li) => li.addEventListener("click", () => setLoopStep(li.dataset.step)));
  setLoopStep("1");

  /* 9. FINAL FILTER ======================================================== */

  const ff = $("#final-filter");
  const ffVerdict = $("#ff-verdict");
  const ffLabel = $("#ff-label");
  const ffText = $("#ff-text");
  const ffReset = $("#ff-reset");
  const answers = {};

  function renderVerdict() {
    const rows = $$(".ff-list li", ff);
    const total = rows.length;
    const answered = Object.keys(answers).length;
    const noes = Object.keys(answers).filter((q) => answers[q] === "no").sort();

    ffVerdict.classList.remove("is-no", "is-yes");
    if (noes.length) {
      ffVerdict.classList.add("is-no");
      ffLabel.textContent = "VERDICT — REWORK";
      ffText.textContent = "ارجع اشتغل عالفكرة. وقفت عند: " + noes.map((q) => pad(q)).join("، ");
    } else if (answered === total) {
      ffVerdict.classList.add("is-yes");
      ffLabel.textContent = "VERDICT — READY";
      ffText.textContent = "الفكرة عبرت الفلتر. جاهزة للموافقة.";
    } else {
      ffLabel.textContent = "VERDICT — " + answered + " / " + total;
      ffText.textContent = answered ? "كمّل. باقي " + (total - answered) + " أسئلة." : "جاوب على السبع أسئلة.";
    }
  }

  if (ff) {
    ff.addEventListener("click", (e) => {
      const btn = e.target.closest(".ff-btns button");
      if (!btn) return;
      const row = btn.closest("li");
      const q = row.dataset.q;
      $$("button", row).forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      answers[q] = btn.dataset.a;
      row.classList.toggle("is-no", btn.dataset.a === "no");
      renderVerdict();
    });
    $$(".ff-btns button", ff).forEach((b) => b.setAttribute("aria-pressed", "false"));
  }
  if (ffReset) ffReset.addEventListener("click", () => {
    Object.keys(answers).forEach((k) => delete answers[k]);
    $$(".ff-btns button", ff).forEach((b) => b.setAttribute("aria-pressed", "false"));
    $$(".ff-list li", ff).forEach((li) => li.classList.remove("is-no"));
    renderVerdict();
  });

  /* 10. SCROLL REVEAL ======================================================
     Content is always visible. Blocks below the fold get a short lift that
     settles when they enter the viewport. */

  if (!reduceMotion && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.remove("pre"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add("pre");
        io.observe(el);
      }
    });
  }

  onScroll();
})();
