/* global PowerliftCodec */
(() => {
  "use strict";

  const {
    DOW,
    emptyRow,
    defaultDayLabels,
    standardDowPreset,
    labelForDay,
    dowFromLabel,
    nextDowForWeek,
    defaultProgram,
    normalizeProgram,
    encodeState,
    decodeState,
    urlStateLengthHint,
  } = PowerliftCodec;

  // New routing (clean paths)
  const ROUTE_PREFIX = "/program/";

  // Legacy routing (for backward compatibility)
  const LEGACY_ROUTE_PREFIX = "/p/";
  const LEGACY_HASH_PREFIX = "#/p/";

  /** -------------------------
   *  Routing helpers
   *  ------------------------- */

  function readStateFromUrl() {
    const path = window.location.pathname || "/";
    const hash = window.location.hash || "";

    // Try new format first: /program/STATE
    if (path.startsWith(ROUTE_PREFIX)) {
      const enc = decodeURIComponent(path.slice(ROUTE_PREFIX.length));
      return enc || null;
    }

    // Legacy format: /p/STATE
    if (path.startsWith(LEGACY_ROUTE_PREFIX)) {
      const enc = decodeURIComponent(path.slice(LEGACY_ROUTE_PREFIX.length));
      return enc || null;
    }

    // Legacy format: /#/p/STATE
    if (hash.startsWith(LEGACY_HASH_PREFIX)) {
      const enc = decodeURIComponent(hash.slice(LEGACY_HASH_PREFIX.length));
      return enc || null;
    }

    return null;
  }

  function writeStateToUrl(enc) {
    // Always write new clean format: /program/STATE
    const url = `${ROUTE_PREFIX}${encodeURIComponent(enc)}`;
    history.replaceState(null, "", url);
  }

  /** -------------------------
   *  App state
   *  ------------------------- */

  const dom = {
    weekMount: document.getElementById("weekMount"),
    weekHint: document.getElementById("weekHint"),
    status: document.getElementById("status"),
    cycleDd: document.getElementById("cycleDd"),
    weekDd: document.getElementById("weekDd"),
    addWeekBtn: document.getElementById("addWeekBtn"),
    copyLinkBtn: document.getElementById("copyLinkBtn"),
    shareDialog: document.getElementById("shareDialog"),
    shareDialogText: document.getElementById("shareDialogText"),
    shareDialogCloseBtn: document.getElementById("shareDialogCloseBtn"),
    shareDialogDontShow: document.getElementById("shareDialogDontShow"),
    menuBtn: document.getElementById("menuBtn"),
    menuOverlay: document.getElementById("menuOverlay"),
    menuCloseBtn: document.getElementById("menuCloseBtn"),
    themeToggleBtn: document.getElementById("themeToggleBtn"),
    themeIcon: document.getElementById("themeIcon"),
    homeLink: document.getElementById("homeLink"),
    unitsDd: document.getElementById("unitsDd"),
    addDayBtn: document.getElementById("addDayBtn"),
    addCycleBtn: document.getElementById("addCycleBtn"),
    renameCycleBtn: document.getElementById("renameCycleBtn"),
    deleteCycleBtn: document.getElementById("deleteCycleBtn"),
    deleteWeekBtn: document.getElementById("deleteWeekBtn"),
    appDialog: document.getElementById("appDialog"),
    appDialogTitle: document.getElementById("appDialogTitle"),
    appDialogText: document.getElementById("appDialogText"),
    appDialogCloseBtn: document.getElementById("appDialogCloseBtn"),
    appDialogCancelBtn: document.getElementById("appDialogCancelBtn"),
    appDialogOkBtn: document.getElementById("appDialogOkBtn"),
    appDialogInputWrap: document.getElementById("appDialogInputWrap"),
    appDialogInputLabel: document.getElementById("appDialogInputLabel"),
    appDialogInput: document.getElementById("appDialogInput"),
    appDialogHelp: document.getElementById("appDialogHelp"),
    onboardingDialog: document.getElementById("onboardingDialog"),
    onboardingDialogCloseBtn: document.getElementById("onboardingDialogCloseBtn"),
    onboardingDialogOkBtn: document.getElementById("onboardingDialogOkBtn"),
    onboardingDialogDontShow: document.getElementById("onboardingDialogDontShow"),
  };

  const app = {
    program: defaultProgram(),
    currentWeek: 0,
    urlDebounce: null,
    lastEncoded: null,
  };

  function getCurrentCycleIndex() {
    const w = app.program.weeks[app.currentWeek];
    return Number.isFinite(w?.c) ? w.c : 0;
  }

  function weeksInCycle(ci) {
    const out = [];
    for (let i = 0; i < app.program.weeks.length; i++) {
      if ((app.program.weeks[i]?.c ?? 0) === ci) out.push(i);
    }
    return out;
  }

  function ordinalInCycle(ci, wi) {
    const list = weeksInCycle(ci);
    const idx = list.indexOf(wi);
    return idx >= 0 ? idx + 1 : 1;
  }

  function setStatus(msg, kind) {
    dom.status.textContent = msg || "";
    dom.status.classList.toggle("status--error", kind === "error");
    dom.status.classList.toggle("status--warn", kind === "warn");
  }

  /** -------------------------
   *  App dialogs (replace alert/confirm/prompt)
   *  ------------------------- */
  function dialogSupported() {
    return !!dom.appDialog?.showModal;
  }

  function showAppDialog({
    mode, // "alert" | "confirm" | "prompt"
    title,
    text,
    okText = "OK",
    cancelText = "Cancel",
    danger = false,
    inputLabel = "Input",
    inputValue = "",
    inputPlaceholder = "",
    inputReadOnly = false,
    helpText = "",
  }) {
    if (!dialogSupported()) {
      if (mode === "confirm") return Promise.resolve(window.confirm(text || ""));
      if (mode === "prompt") return Promise.resolve(window.prompt(text || "", inputValue) ?? null);
      window.alert(text || "");
      return Promise.resolve(true);
    }

    // Reset styles
    dom.appDialogOkBtn.classList.remove("btn--danger", "btn--success", "btn--primary");
    if (danger) dom.appDialogOkBtn.classList.add("btn--danger");
    else if (mode === "confirm" || mode === "prompt") dom.appDialogOkBtn.classList.add("btn--success");
    else dom.appDialogOkBtn.classList.add("btn--primary");

    if (dom.appDialogTitle) dom.appDialogTitle.textContent = title || "Notice";
    if (dom.appDialogText) dom.appDialogText.textContent = text || "";

    // Input mode
    const wantsInput = mode === "prompt";
    if (dom.appDialogInputWrap) dom.appDialogInputWrap.hidden = !wantsInput;
    if (dom.appDialogInputLabel) dom.appDialogInputLabel.textContent = inputLabel || "Input";
    if (dom.appDialogInput) {
      dom.appDialogInput.value = inputValue ?? "";
      dom.appDialogInput.placeholder = inputPlaceholder || "";
      dom.appDialogInput.readOnly = !!inputReadOnly;
    }
    if (dom.appDialogHelp) {
      dom.appDialogHelp.hidden = !helpText;
      dom.appDialogHelp.textContent = helpText || "";
    }

    // Buttons
    dom.appDialogOkBtn.textContent = okText;
    dom.appDialogCancelBtn.textContent = cancelText;
    dom.appDialogCancelBtn.hidden = mode === "alert";
    dom.appDialogCloseBtn.value = mode === "alert" ? "ok" : "cancel";

    return new Promise((resolve) => {
      const onClose = () => {
        dom.appDialog.removeEventListener("close", onClose);
        const rv = dom.appDialog.returnValue || "cancel";
        if (mode === "confirm") resolve(rv === "ok");
        else if (mode === "prompt") resolve(rv === "ok" ? (dom.appDialogInput?.value ?? "") : null);
        else resolve(true);
      };

      dom.appDialog.addEventListener("close", onClose);
      dom.appDialog.showModal();

      if (wantsInput) {
        window.setTimeout(() => {
          try {
            dom.appDialogInput?.focus();
            dom.appDialogInput?.select?.();
          } catch {}
        }, 0);
      } else {
        window.setTimeout(() => {
          try { dom.appDialogOkBtn?.focus(); } catch {}
        }, 0);
      }
    });
  }

  const appAlert = (text, opts = {}) => showAppDialog({ mode: "alert", text, ...opts });
  const appConfirm = (text, opts = {}) => showAppDialog({ mode: "confirm", text, ...opts });
  const appPrompt = (text, opts = {}) => showAppDialog({ mode: "prompt", text, ...opts });

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function scheduleUrlUpdate() {
    if (app.urlDebounce) window.clearTimeout(app.urlDebounce);
    app.urlDebounce = window.setTimeout(() => {
      try {
        const enc = encodeState(app.program);
        if (enc !== app.lastEncoded) {
          app.lastEncoded = enc;
          writeStateToUrl(enc);
        }
        const hint = urlStateLengthHint(enc.length);
        setStatus(hint ? hint.message : "", hint?.level === "error" ? "error" : hint ? "warn" : "");
      } catch (e) {
        setStatus("Could not update link (encoding error).", "error");
      }
    }, 400);
  }

  /** -------------------------
   *  Rendering
   *  ------------------------- */

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k.startsWith("data-")) node.setAttribute(k, v);
      else if (k === "html") node.innerHTML = v;
      else if (v === true) node.setAttribute(k, "");
      else if (v !== false && v != null) node.setAttribute(k, String(v));
    }
    for (const c of children) {
      if (c == null) continue;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return node;
  }

  // SVG elements must be created in the SVG namespace, otherwise they can fail to render
  // (notably when created dynamically in Chrome).
  const SVG_NS = "http://www.w3.org/2000/svg";
  const XLINK_NS = "http://www.w3.org/1999/xlink";
  function svgEl(tag, attrs = {}, children = []) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.setAttribute("class", v);
      else if (k === "text") node.textContent = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.startsWith("data-")) node.setAttribute(k, v);
      else if (v === true) node.setAttribute(k, "");
      else if (v !== false && v != null) node.setAttribute(k, String(v));
    }
    for (const c of children) {
      if (c == null) continue;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return node;
  }

  function icon(id) {
    const safeId = typeof id === "string" ? id : "";
    const href = `#${safeId}`;
    const use = svgEl("use", { href });
    // Some browsers still behave better when xlink:href is present too.
    try {
      use.setAttributeNS(XLINK_NS, "xlink:href", href);
    } catch {}
    return svgEl("svg", { class: "ico", viewBox: "0 0 24 24", "aria-hidden": "true", focusable: "false" }, [use]);
  }

  // Dropdown: single global outside-click handler (avoid attaching one per dropdown render)
  let openDropdown = null; // { wrap, btn, menu }
  window.addEventListener("pointerdown", (e) => {
    if (!openDropdown) return;
    if (openDropdown.wrap.contains(e.target)) return;
    openDropdown.btn.setAttribute("aria-expanded", "false");
    openDropdown.menu.hidden = true;
    openDropdown = null;
  });

  function renderDropdown({ id, label, value, options, onChange }) {
    const menuId = `dd-menu-${id}`;
    const btnId = `dd-btn-${id}`;
    const wrap = el("div", { class: "ddWrap", "data-dd": id });

    const btn = el(
      "button",
      {
        id: btnId,
        type: "button",
        class: "dd__btn",
        "aria-haspopup": "listbox",
        "aria-expanded": "false",
        "aria-controls": menuId,
      },
      [
        el("span", { class: "dd__label", text: label(value) }),
        el("span", { class: "dd__chev" }, [icon("i-expand-more")]),
      ]
    );

    const menu = el(
      "div",
      { id: menuId, class: "dd__menu", role: "listbox", tabindex: "-1", hidden: true },
      []
    );

    function optionButtons() {
      return Array.from(menu.querySelectorAll(".dd__opt"));
    }

    function focusOptionAt(index) {
      const opts = optionButtons();
      if (!opts.length) return;
      const i = Math.max(0, Math.min(index, opts.length - 1));
      opts[i].focus();
    }

    function selectedIndex() {
      return optionButtons().findIndex((o) => o.getAttribute("aria-selected") === "true");
    }

    function selectOption(opt) {
      close();
      btn.focus();
      onChange(opt.getAttribute("data-value"));
    }

    function close() {
      btn.setAttribute("aria-expanded", "false");
      menu.hidden = true;
      if (openDropdown?.wrap === wrap) openDropdown = null;
    }

    function open() {
      if (openDropdown && openDropdown.wrap !== wrap) {
        openDropdown.btn.setAttribute("aria-expanded", "false");
        openDropdown.menu.hidden = true;
      }
      btn.setAttribute("aria-expanded", "true");
      menu.hidden = false;
      openDropdown = { wrap, btn, menu };
      const idx = selectedIndex();
      window.setTimeout(() => focusOptionAt(idx >= 0 ? idx : 0), 0);
    }

    function toggle() {
      if (menu.hidden) open();
      else close();
    }

    function handleListboxKeydown(e) {
      const opts = optionButtons();
      if (!opts.length) return;
      const idx = opts.indexOf(document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        focusOptionAt(idx < 0 ? 0 : idx + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        focusOptionAt(idx < 0 ? opts.length - 1 : idx - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        focusOptionAt(0);
      } else if (e.key === "End") {
        e.preventDefault();
        focusOptionAt(opts.length - 1);
      } else if (e.key === "Enter" || e.key === " ") {
        const active = document.activeElement;
        if (active?.classList?.contains("dd__opt")) {
          e.preventDefault();
          selectOption(active);
        }
      }
    }

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (document.documentElement.classList.contains("menuOpen")) return;
      toggle();
    });

    btn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (menu.hidden) open();
        else handleListboxKeydown(e);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (menu.hidden) open();
        else handleListboxKeydown(e);
      }
    });

    menu.addEventListener("keydown", handleListboxKeydown);

    menu.addEventListener("click", (e) => {
      const opt = e.target.closest("[data-value]");
      if (!opt) return;
      selectOption(opt);
    });

    for (const opt of options) {
      const selected = String(opt.value) === String(value);
      menu.appendChild(
        el(
          "button",
          {
            type: "button",
            class: "dd__opt",
            role: "option",
            "aria-selected": selected ? "true" : "false",
            "data-value": String(opt.value),
          },
          [el("span", { class: "dd__label", text: opt.label })]
        )
      );
    }

    wrap.appendChild(btn);
    wrap.appendChild(menu);
    return wrap;
  }

  function sanitizeField(field, raw) {
    const v = String(raw ?? "");

    if (field === "sets" || field === "reps") {
      // Up to 3 digits, integers only
      return v.replace(/\D/g, "").slice(0, 3);
    }

    if (field === "load") {
      // Up to 4 digits, integers only
      return v.replace(/\D/g, "").slice(0, 4);
    }

    if (field === "pct") {
      // 0–100, integer only
      const digits = v.replace(/\D/g, "").slice(0, 3);
      if (digits === "") return "";
      const n = Math.max(0, Math.min(100, Number(digits)));
      return String(n);
    }

    if (field === "rpe") {
      // 0–11, allow one decimal place
      let s = v.replace(/[^0-9.]/g, "");
      const parts = s.split(".");
      s = parts[0] + (parts.length > 1 ? "." + parts.slice(1).join("") : "");
      if (s.includes(".")) {
        const [a, b] = s.split(".");
        s = a.slice(0, 2) + "." + (b || "").slice(0, 1);
      } else {
        s = s.slice(0, 2);
      }
      if (s === "" || s === ".") return "";
      const n = Math.max(0, Math.min(11, Number(s)));
      // Preserve trailing "." while typing is annoying; return normalized
      return Number.isFinite(n) ? (String(n).includes(".") ? String(n) : String(n)) : "";
    }

    if (field === "rest") {
      // mm:ss, numbers + single colon only, max length 5 (e.g. 12:34)
      let s = v.replace(/[^0-9:]/g, "");
      const firstColon = s.indexOf(":");
      if (firstColon !== -1) {
        s = s.slice(0, firstColon + 1) + s.slice(firstColon + 1).replace(/:/g, "");
      }
      const [mm, ss] = s.split(":");
      const mm2 = (mm || "").slice(0, 2);
      const ss2 = typeof ss === "string" ? ss.slice(0, 2) : "";
      return firstColon === -1 ? mm2 : `${mm2}:${ss2}`;
    }

    return v;
  }

  function toInt(x) {
    const n = Number(String(x ?? "").replace(/\D/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  function toFloat(x) {
    const n = Number(String(x ?? "").replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : NaN;
  }

  function formatNumber(n) {
    try {
      return new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(n);
    } catch {
      return String(n);
    }
  }

  function computeDaySummary(day) {
    const rows = Array.isArray(day?.rows) ? day.rows : [];
    const exercises = rows.filter((r) => (r?.ex || "").trim() !== "").length;

    let totalSets = 0;
    let totalReps = 0;
    let totalWeight = 0;
    let rpeWeighted = 0;
    let rpeWeight = 0;

    for (const r of rows) {
      const sets = toInt(r?.sets);
      const reps = toInt(r?.reps);
      const load = toInt(r?.load);
      const rpe = toFloat(r?.rpe);

      if (sets > 0) totalSets += sets;
      if (sets > 0 && reps > 0) totalReps += sets * reps;
      if (sets > 0 && reps > 0 && load > 0) totalWeight += sets * reps * load;
      if (Number.isFinite(rpe) && sets > 0) {
        rpeWeighted += rpe * sets;
        rpeWeight += sets;
      }
    }

    const avgRpe = rpeWeight > 0 ? rpeWeighted / rpeWeight : null;
    return { exercises, totalSets, totalReps, totalWeight, avgRpe };
  }

  function updateDaySummaryDom(wi, di) {
    const dayEl = dom.weekMount.querySelector(`details.day[data-w="${wi}"][data-d="${di}"]`);
    if (!dayEl) return;
    const day = app.program.weeks[wi]?.days?.[di];
    if (!day) return;

    const s = computeDaySummary(day);
    const units = app.program.u === "kg" ? "kg" : "lb";
    const vals = {
      exercises: String(s.exercises),
      sets: String(s.totalSets),
      reps: String(s.totalReps),
      weight: s.totalWeight > 0 ? `${formatNumber(s.totalWeight)} ${units}` : "—",
      rpe: s.avgRpe != null ? formatNumber(s.avgRpe) : "—",
    };

    for (const [k, v] of Object.entries(vals)) {
      const node = dayEl.querySelector(`[data-sum="${k}"]`);
      if (node) node.textContent = v;
    }
  }

  function renderWeekBar() {
    const total = app.program.weeks.length;
    const idx = app.currentWeek;
    dom.weekHint.textContent = "";

    const week = app.program.weeks[idx];
    if (dom.unitsDd) {
      dom.unitsDd.classList.add("dd--compact");
      dom.unitsDd.innerHTML = "";
      dom.unitsDd.appendChild(
        renderDropdown({
          id: "units",
          value: app.program.u === "kg" ? "kg" : "lb",
          label: (v) => (v === "kg" ? "kg" : "lb"),
          options: [
            { value: "lb", label: "lb" },
            { value: "kg", label: "kg" },
          ],
          onChange: (v) => {
            app.program.u = v === "kg" ? "kg" : "lb";
            scheduleUrlUpdate();
            render();
          },
        })
      );
    }

    const ci = getCurrentCycleIndex();
    if (dom.cycleDd) {
      dom.cycleDd.classList.add("dd--compact");
      dom.cycleDd.innerHTML = "";
      dom.cycleDd.appendChild(
        renderDropdown({
          id: "cycle",
          value: String(ci),
          label: (v) => app.program.c?.[Number(v)]?.n || `Meso ${Number(v) + 1}`,
          options: (app.program.c || []).map((c, i) => ({ value: String(i), label: c.n })),
          onChange: (v) => {
            const nextCi = Number(v);
            const list = weeksInCycle(nextCi);
            if (list.length) {
              app.currentWeek = list[0];
              render();
            }
          },
        })
      );
    }

    if (dom.weekDd) {
      dom.weekDd.classList.add("dd--compact");
      dom.weekDd.innerHTML = "";
      const inThisCycle = weeksInCycle(ci);
      dom.weekDd.appendChild(
        renderDropdown({
          id: "week",
          value: String(idx),
          label: (v) => {
            const wi = Number(v);
            return `Week ${ordinalInCycle(ci, wi)}`;
          },
          options: inThisCycle.map((wi) => ({ value: String(wi), label: `Week ${ordinalInCycle(ci, wi)}` })),
          onChange: (v) => {
            const wi = Number(v);
            if (!Number.isFinite(wi)) return;
            app.currentWeek = clamp(wi, 0, app.program.weeks.length - 1);
            render();
          },
        })
      );
    }
  }

  function rowFieldId(wi, di, ri, field) {
    return `f-${wi}-${di}-${ri}-${field}`;
  }

  function renderRow(wi, di, ri, row) {
    const showExamples = wi === 0 && di === 0 && ri === 0;
    const units = app.program.u === "kg" ? "kg" : "lb";

    const grid = el(
      "div",
      {
        class: "row rowGrid",
        "data-w": String(wi),
        "data-d": String(di),
        "data-r": String(ri),
      },
      [
      el("div", { class: "field field--ex" }, [
        el("label", { for: rowFieldId(wi, di, ri, "ex"), text: "Exercise" }),
        el("input", { id: rowFieldId(wi, di, ri, "ex"), class: "input", "aria-label": "Exercise", placeholder: showExamples ? "e.g. Squat" : "", value: row.ex, "data-field": "ex" }),
      ]),
      el("div", { class: "field field--mode" }, [
        el("label", { for: rowFieldId(wi, di, ri, "mode"), text: "Variation" }),
        el("input", { id: rowFieldId(wi, di, ri, "mode"), class: "input", "aria-label": "Variation", placeholder: "", value: row.mode, "data-field": "mode" }),
      ]),
      el("div", { class: "field field--sets" }, [
        el("label", { for: rowFieldId(wi, di, ri, "sets"), text: "Sets" }),
        el("input", { id: rowFieldId(wi, di, ri, "sets"), class: "input", "aria-label": "Sets", inputmode: "numeric", pattern: "\\d*", maxlength: "3", placeholder: "", value: row.sets, "data-field": "sets" }),
      ]),
      el("div", { class: "field field--reps" }, [
        el("label", { for: rowFieldId(wi, di, ri, "reps"), text: "Reps" }),
        el("input", { id: rowFieldId(wi, di, ri, "reps"), class: "input", "aria-label": "Reps", inputmode: "numeric", pattern: "\\d*", maxlength: "3", placeholder: "", value: row.reps, "data-field": "reps" }),
      ]),
      el("div", { class: "field field--load" }, [
        el("label", { for: rowFieldId(wi, di, ri, "load"), text: `Load (${units})` }),
        el("input", { id: rowFieldId(wi, di, ri, "load"), class: "input", "aria-label": `Load (${units})`, inputmode: "numeric", pattern: "\\d*", maxlength: "4", placeholder: "", value: row.load, "data-field": "load" }),
      ]),
      el("div", { class: "field field--pct" }, [
        el("label", { for: rowFieldId(wi, di, ri, "pct"), text: "%1RM" }),
        el("input", { id: rowFieldId(wi, di, ri, "pct"), class: "input", "aria-label": "%1RM", inputmode: "numeric", pattern: "\\d*", maxlength: "3", placeholder: "", value: row.pct, "data-field": "pct" }),
      ]),
      el("div", { class: "field field--rpe" }, [
        el("label", { for: rowFieldId(wi, di, ri, "rpe"), text: "RPE" }),
        el("input", { id: rowFieldId(wi, di, ri, "rpe"), class: "input", "aria-label": "RPE", inputmode: "decimal", placeholder: "", value: row.rpe, "data-field": "rpe" }),
      ]),
      el("div", { class: "field field--rest" }, [
        el("label", { for: rowFieldId(wi, di, ri, "rest"), text: "Rest (mm:ss)" }),
        el("input", { id: rowFieldId(wi, di, ri, "rest"), class: "input", "aria-label": "Rest (mm:ss)", inputmode: "numeric", placeholder: "", value: row.rest, "data-field": "rest" }),
      ]),
      el("div", { class: "rowActions" }, [
        el(
          "button",
          {
            type: "button",
            class: "actionBtn actionBtn--subtle",
            "data-action": "clear-row",
            title: "Clear exercise",
            "aria-label": "Clear exercise",
          },
          [icon("i-ink-eraser"), el("span", { text: "Clear" })]
        ),
        el(
          "button",
          {
            type: "button",
            class: "actionBtn actionBtn--delete",
            "data-action": "remove-row",
            title: "Delete exercise",
            "aria-label": "Delete exercise",
          },
          [icon("i-delete-outline"), el("span", { text: "Delete" })]
        ),
      ]),
    ]
    );
    return grid;
  }

  function renderDay(wi, di, day) {
    const rowsMount = el("div", { class: "rows" }, day.rows.map((r, ri) => renderRow(wi, di, ri, r)));

    const addExerciseBtn = el(
      "button",
      {
        type: "button",
        class: "actionBtn actionBtn--add",
        title: "Add exercise",
        "aria-label": "Add exercise",
        "data-action": "add-row",
      },
      [icon("i-add"), el("span", { text: "Add exercise" })]
    );

    // Per-exercise delete/clear lives on each row; footer only adds.

    const headerRow = el("div", { class: "colHeader", "aria-hidden": "true" }, [
      el("div", { text: "Exercise" }),
      el("div", { text: "Variation" }),
      el("div", { text: "Sets" }),
      el("div", { text: "Reps" }),
      el("div", { text: "Load" }),
      el("div", { text: "%1RM" }),
      el("div", { text: "RPE" }),
      el("div", { text: "Rest (mm:ss)" }),
    ]);

    const s = computeDaySummary(day);
    const units = app.program.u === "kg" ? "kg" : "lb";
    const summaryParts = [
      { k: "Exercises", key: "exercises", v: String(s.exercises) },
      { k: "Sets", key: "sets", v: String(s.totalSets) },
      { k: "Reps", key: "reps", v: String(s.totalReps) },
      { k: "Weight", key: "weight", v: s.totalWeight > 0 ? `${formatNumber(s.totalWeight)} ${units}` : "—" },
      { k: "Avg RPE", key: "rpe", v: s.avgRpe != null ? formatNumber(s.avgRpe) : "—" },
    ];
    const summaryEl = el(
      "div",
      { class: "day__summary" },
      summaryParts.map((p) =>
        el("div", { class: "day__summaryItem" }, [
          el("span", { class: "day__summaryKey", text: p.k }),
          el("span", { class: "day__summaryVal", "data-sum": p.key, text: p.v }),
        ])
      )
    );

    const currentDow = dowFromLabel(day.label) || "MON";
    const dowDd = el("div", { class: "dd dd--compact dayDowDd" }, []);
    dowDd.appendChild(
      renderDropdown({
        id: `dow-${wi}-${di}`,
        value: currentDow,
        label: (v) => v,
        options: DOW.map((d) => ({ value: d, label: d })),
        onChange: (v) => {
          setDayDow(wi, di, v);
          scheduleUrlUpdate();
          render();
        },
      })
    );

    const deleteDayBtn = el(
      "button",
      {
        type: "button",
        class: "iconBtn iconBtn--headerSm iconBtn--dangerSm",
        title: "Delete day",
        "aria-label": "Delete day",
        "data-action": "delete-day",
      },
      [icon("i-delete-outline")]
    );

    const summary = el("summary", {}, [
      el("div", { class: "day__head" }, [
        el("div", { class: "day__headTop" }, [
          el("div", { class: "day__titleLeft" }, [
            el("div", { class: "day__label", text: `DAY ${di + 1}` }),
            dowDd,
          ]),
          el("div", { class: "day__headActions" }, [deleteDayBtn]),
        ]),
        summaryEl,
      ]),
    ]);

    const body = el("div", { class: "day__body" }, [
      headerRow,
      rowsMount,
      el("div", { class: "dayFooter dayFooter--actions" }, [addExerciseBtn]),
    ]);

    const details = el(
      "details",
      { class: "day", open: true, "data-w": String(wi), "data-d": String(di) },
      [summary, body]
    );
    return details;
  }

  function render() {
    renderWeekBar();
    dom.weekMount.innerHTML = "";

    const week = app.program.weeks[app.currentWeek];
    const weekEl = el("div", { class: "week" }, week.days.map((d, di) => renderDay(app.currentWeek, di, d)));
    dom.weekMount.appendChild(weekEl);
  }

  /** -------------------------
   *  Mutations
   *  ------------------------- */

  function addWeek() {
    const prev = app.program.weeks[app.currentWeek];
    const ci = getCurrentCycleIndex();
    const cloned = {
      c: ci,
      days: prev.days.map((d, di) => ({
        label: typeof d.label === "string" && d.label.trim() ? d.label : labelForDay(di, standardDowPreset(prev.days.length)[di] || "MON"),
        rows: (Array.isArray(d.rows) && d.rows.length ? d.rows : [emptyRow()]).map((r) => ({
          ex: typeof r.ex === "string" ? r.ex : "",
          mode: typeof r.mode === "string" ? r.mode : "",
          sets: r.sets ?? "",
          reps: r.reps ?? "",
          load: "",
          pct: "",
          rpe: "",
          rest: "",
        })),
      })),
    };

    app.program.weeks.push(cloned);
    app.currentWeek = app.program.weeks.length - 1;
    scheduleUrlUpdate();
    render();
  }

  function addCycle() {
    const nextIndex = app.program.c.length;
    app.program.c.push({ n: `Meso ${nextIndex + 1}` });

    const prev = app.program.weeks[app.currentWeek];
    const starter = {
      c: nextIndex,
      days: prev.days.map((d, di) => ({
        label: typeof d.label === "string" && d.label.trim() ? d.label : labelForDay(di, standardDowPreset(prev.days.length)[di] || "MON"),
        rows: (Array.isArray(d.rows) && d.rows.length ? d.rows : [emptyRow()]).map((r) => ({
          ex: typeof r.ex === "string" ? r.ex : "",
          mode: typeof r.mode === "string" ? r.mode : "",
          sets: r.sets ?? "",
          reps: r.reps ?? "",
          load: "",
          pct: "",
          rpe: "",
          rest: "",
        })),
      })),
    };

    app.program.weeks.push(starter);
    app.currentWeek = app.program.weeks.length - 1;
    scheduleUrlUpdate();
    render();
  }

  function setDayDow(wi, di, dow) {
    const week = app.program.weeks[wi];
    if (!week?.days?.[di]) return;
    week.days[di].label = labelForDay(di, dow);
    // After changing a specific day, re-number labels to keep DAY 1..N consistent.
    week.days.forEach((d, idx) => {
      const currentDow = dowFromLabel(d.label) || "MON";
      d.label = labelForDay(idx, currentDow);
    });
  }

  function renumberDays(wi) {
    const week = app.program.weeks[wi];
    if (!week?.days) return;
    week.days.forEach((d, idx) => {
      const currentDow = dowFromLabel(d.label) || standardDowPreset(week.days.length)[idx] || "MON";
      d.label = labelForDay(idx, currentDow);
    });
  }

  function deleteDay(wi, di) {
    const week = app.program.weeks[wi];
    if (!week?.days) return;
    if (week.days.length <= 1) return;
    week.days.splice(di, 1);
    renumberDays(wi);
    scheduleUrlUpdate();
    render();
  }

  function cleanupEmptyCycles() {
    // Remove mesocycles with zero weeks, and reindex weeks' c values.
    const used = new Set(app.program.weeks.map((w) => w?.c ?? 0));
    const keepMap = [];
    const nextCycles = [];
    for (let i = 0; i < app.program.c.length; i++) {
      if (used.has(i) || app.program.c.length === 1) {
        keepMap[i] = nextCycles.length;
        nextCycles.push(app.program.c[i]);
      } else {
        keepMap[i] = -1;
      }
    }
    // Ensure at least 1 cycle exists.
    if (!nextCycles.length) nextCycles.push({ n: "Meso 1" });

    app.program.c = nextCycles;
    app.program.weeks.forEach((w) => {
      const old = w?.c ?? 0;
      const mapped = keepMap[old];
      w.c = mapped >= 0 ? mapped : 0;
    });
  }

  function deleteCycle(ci) {
    if (app.program.c.length <= 1) return { ok: false, reason: "last_cycle" };
    const weeksToKeep = app.program.weeks.filter((w) => (w?.c ?? 0) !== ci);
    if (weeksToKeep.length < 1) return { ok: false, reason: "last_week" };

    app.program.weeks = weeksToKeep;
    app.program.c.splice(ci, 1);

    // Reindex week.c values above the removed cycle index
    app.program.weeks.forEach((w) => {
      if ((w.c ?? 0) > ci) w.c -= 1;
    });

    // Ensure currentWeek points at a valid week
    app.currentWeek = clamp(app.currentWeek, 0, app.program.weeks.length - 1);
    cleanupEmptyCycles();
    return { ok: true };
  }

  function deleteWeek(wi) {
    if (app.program.weeks.length <= 1) return;
    app.program.weeks.splice(wi, 1);
    app.currentWeek = clamp(app.currentWeek, 0, app.program.weeks.length - 1);
    cleanupEmptyCycles();
    scheduleUrlUpdate();
    render();
  }

  function addRow(wi, di) {
    app.program.weeks[wi].days[di].rows.push(emptyRow());
    updateDaySummaryDom(wi, di);
    scheduleUrlUpdate();
  }

  // (removeLastRow removed; per-row delete is used instead)

  function removeRow(wi, di, ri) {
    const rows = app.program.weeks[wi].days[di].rows;
    if (rows.length <= 1) return;
    rows.splice(ri, 1);
    updateDaySummaryDom(wi, di);
    scheduleUrlUpdate();
  }

  function setField(wi, di, ri, field, value) {
    const row = app.program.weeks[wi].days[di].rows[ri];
    if (!row) return;
    row[field] = sanitizeField(field, value);
    updateDaySummaryDom(wi, di);
    scheduleUrlUpdate();
  }

  /** -------------------------
   *  Events
   *  ------------------------- */

  dom.addWeekBtn?.addEventListener("click", () => {
    addWeek();
  });

  dom.deleteWeekBtn?.addEventListener("click", async () => {
    if (app.program.weeks.length <= 1) {
      await appAlert("You can’t delete the last week.", { title: "Can’t delete" });
      return;
    }
    const ok = await appConfirm("Delete this week? This cannot be undone.", {
      title: "Delete week",
      okText: "Delete",
      cancelText: "Cancel",
      danger: true,
    });
    if (!ok) return;
    deleteWeek(app.currentWeek);
  });

  dom.addCycleBtn?.addEventListener("click", () => {
    addCycle();
  });

  dom.renameCycleBtn?.addEventListener("click", async () => {
    const ci = getCurrentCycleIndex();
    const current = app.program.c?.[ci]?.n || `Meso ${ci + 1}`;
    const next = await appPrompt("Mesocycle name:", {
      title: "Rename mesocycle",
      inputLabel: "Name",
      inputValue: current,
      okText: "Save",
      cancelText: "Cancel",
    });
    if (next == null) return;
    if (!app.program.c?.[ci]) return;
    app.program.c[ci].n = next.trim() || current;
    scheduleUrlUpdate();
    renderWeekBar();
  });

  dom.deleteCycleBtn?.addEventListener("click", async () => {
    const ci = getCurrentCycleIndex();
    if (app.program.c.length <= 1) {
      await appAlert("You can’t delete the last mesocycle.", { title: "Can’t delete" });
      return;
    }
    const ok = await appConfirm("Delete this mesocycle and all its weeks? This cannot be undone.", {
      title: "Delete mesocycle",
      okText: "Delete",
      cancelText: "Cancel",
      danger: true,
    });
    if (!ok) return;
    const res = deleteCycle(ci);
    if (!res.ok) {
      await appAlert("You can’t delete the last remaining week.", { title: "Can’t delete" });
      return;
    }
    scheduleUrlUpdate();
    render();
  });

  dom.addDayBtn?.addEventListener("click", async () => {
    const wi = app.currentWeek;
    const week = app.program.weeks[wi];
    if (!week?.days) return;
    if (week.days.length >= 7) {
      await appAlert("Max 7 days per week.", { title: "Limit reached" });
      return;
    }
    const dow = nextDowForWeek(week);
    week.days.push({ label: labelForDay(week.days.length, dow), rows: [emptyRow()] });
    renumberDays(wi);
    scheduleUrlUpdate();
    render();
  });


  dom.copyLinkBtn.addEventListener("click", async () => {
    const link = window.location.href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
        if (dom.shareDialogText) dom.shareDialogText.textContent = "Link copied. Anyone with this link can open your program.";
        const hide = (() => {
          try { return localStorage.getItem("pli_hide_share_dialog") === "1"; } catch { return false; }
        })();
        if (!hide && dom.shareDialog?.showModal) {
          if (dom.shareDialogDontShow) {
            try { dom.shareDialogDontShow.checked = localStorage.getItem("pli_hide_share_dialog") === "1"; } catch {}
          }
          dom.shareDialog.showModal();
        } else {
          // No dialog (either unsupported or user disabled it)
          setStatus("Link copied.");
        }
      } else {
        await appPrompt("Copy this link:", {
          title: "Copy link",
          inputLabel: "Link",
          inputValue: link,
          inputReadOnly: true,
          okText: "Done",
          cancelText: "Close",
          helpText: "Press Ctrl+C (or long-press on mobile) to copy.",
        });
      }
    } catch {
      await appPrompt("Copy this link:", {
        title: "Copy link",
        inputLabel: "Link",
        inputValue: link,
        inputReadOnly: true,
        okText: "Done",
        cancelText: "Close",
        helpText: "Press Ctrl+C (or long-press on mobile) to copy.",
      });
    }
  });

  dom.shareDialogCloseBtn?.addEventListener("click", () => {
    try { dom.shareDialog?.close(); } catch {}
  });

  dom.shareDialogDontShow?.addEventListener("change", () => {
    try {
      localStorage.setItem("pli_hide_share_dialog", dom.shareDialogDontShow.checked ? "1" : "0");
    } catch {}
  });

  let menuReturnFocus = null;

  function openMenu() {
    if (!dom.menuOverlay) return;
    closeOpenDropdown();
    menuReturnFocus = document.activeElement;
    dom.menuOverlay.hidden = false;
    document.documentElement.classList.add("menuOpen");
    document.body.style.overflow = "hidden";
    const main = document.getElementById("app");
    if (main) main.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      try {
        dom.menuCloseBtn?.focus();
      } catch {}
    }, 0);
  }

  function closeMenu() {
    if (!dom.menuOverlay) return;
    dom.menuOverlay.hidden = true;
    document.documentElement.classList.remove("menuOpen");
    document.body.style.overflow = "";
    const main = document.getElementById("app");
    if (main) main.removeAttribute("aria-hidden");
    if (menuReturnFocus?.focus) {
      try {
        menuReturnFocus.focus();
      } catch {}
    }
    menuReturnFocus = null;
  }

  dom.menuBtn?.addEventListener("click", openMenu);
  dom.menuCloseBtn?.addEventListener("click", closeMenu);
  dom.menuOverlay?.addEventListener("click", (e) => {
    if (e.target === dom.menuOverlay) closeMenu();
  });

  dom.menuOverlay?.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || dom.menuOverlay.hidden) return;
    const drawer = dom.menuOverlay.querySelector(".drawer");
    if (!drawer) return;
    const list = Array.from(
      drawer.querySelectorAll(
        'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.disabled && el.offsetParent !== null);
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  function closeOpenDropdown() {
    if (!openDropdown) return false;
    const btn = openDropdown.btn;
    openDropdown.btn.setAttribute("aria-expanded", "false");
    openDropdown.menu.hidden = true;
    openDropdown = null;
    try {
      btn.focus();
    } catch {}
    return true;
  }

  function programHasContent(prog) {
    if (!prog) return false;
    if ((prog.c?.length ?? 0) > 1) return true;
    if (prog.c?.[0]?.n && prog.c[0].n !== "Meso 1") return true;
    if ((prog.weeks?.length ?? 0) > 1) return true;
    const firstWeek = prog.weeks?.[0];
    if ((firstWeek?.days?.length ?? 0) > 3) return true;
    for (const w of prog.weeks || []) {
      for (const d of w.days || []) {
        for (const r of d.rows || []) {
          if (
            (r.ex || "").trim() ||
            (r.mode || "").trim() ||
            String(r.sets ?? "").trim() ||
            String(r.reps ?? "").trim() ||
            String(r.load ?? "").trim() ||
            String(r.pct ?? "").trim() ||
            String(r.rpe ?? "").trim() ||
            String(r.rest ?? "").trim()
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (closeOpenDropdown()) return;
    closeMenu();
  });

  // Theme: follow device by default; user can toggle light/dark (stored locally, not in URL)
  const THEME_KEY = "pli_theme";
  const mediaDark = window.matchMedia?.("(prefers-color-scheme: dark)");

  function getStoredTheme() {
    try {
      const v = localStorage.getItem(THEME_KEY);
      if (v === "dark" || v === "light") return v;
      return null;
    } catch {
      return null;
    }
  }

  function setStoredTheme(v) {
    try {
      if (v === "dark" || v === "light") localStorage.setItem(THEME_KEY, v);
      else localStorage.removeItem(THEME_KEY);
    } catch {}
  }

  function getEffectiveTheme() {
    const stored = getStoredTheme();
    if (stored) return stored;
    return mediaDark && mediaDark.matches ? "dark" : "light";
  }

  function applyTheme(themeOrNull) {
    const html = document.documentElement;
    if (themeOrNull === "dark" || themeOrNull === "light") html.setAttribute("data-theme", themeOrNull);
    else html.removeAttribute("data-theme");
    updateThemeIcon();
  }

  function updateThemeIcon() {
    const effective = getEffectiveTheme();
    if (dom.themeIcon) {
      const href = effective === "dark" ? "#i-dark-mode" : "#i-light-mode";
      dom.themeIcon.setAttribute("href", href);
      try {
        dom.themeIcon.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", href);
      } catch {}
    }
    if (dom.themeToggleBtn) {
      dom.themeToggleBtn.setAttribute("aria-label", effective === "dark" ? "Switch to light mode" : "Switch to dark mode");
      dom.themeToggleBtn.title = effective === "dark" ? "Light mode" : "Dark mode";
    }
  }

  function initTheme() {
    const stored = getStoredTheme();
    applyTheme(stored); // null -> follow device via CSS media query
    updateThemeIcon();
    // Ensure inline SVG sprites render consistently (some browsers prefer xlink:href too).
    try {
      document.querySelectorAll("use[href]").forEach((u) => {
        const href = u.getAttribute("href");
        if (!href) return;
        u.setAttributeNS(XLINK_NS, "xlink:href", href);
      });
    } catch {}
    mediaDark?.addEventListener?.("change", () => {
      if (!getStoredTheme()) updateThemeIcon();
    });
  }

  function toggleTheme() {
    // If a dropdown is open, close it before toggling theme to avoid z-index/overlay weirdness.
    try {
      if (openDropdown) {
        openDropdown.btn.setAttribute("aria-expanded", "false");
        openDropdown.menu.hidden = true;
        openDropdown = null;
      }
    } catch {}
    const effective = getEffectiveTheme();
    const next = effective === "dark" ? "light" : "dark";
    setStoredTheme(next);
    applyTheme(next);
  }

  dom.themeToggleBtn?.addEventListener("click", toggleTheme);

  dom.homeLink?.addEventListener("click", async (e) => {
    e.preventDefault();
    if (programHasContent(app.program)) {
      const ok = await appConfirm("Start a new blank program? Your current work is only saved in this page’s link.", {
        title: "New program",
        okText: "Start new",
        cancelText: "Keep editing",
        danger: true,
      });
      if (!ok) return;
    }
    window.location.href = `${window.location.origin}/`;
  });

  dom.weekMount.addEventListener("click", async (e) => {
    // Prevent details <summary> toggling when using custom dropdowns inside it.
    if (e.target.closest(".ddWrap") && e.target.closest("summary")) {
      e.preventDefault();
      e.stopPropagation();
    }

    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    if (!action) return;

    // Don't toggle <details> when pressing controls inside <summary>.
    if (btn.closest("summary")) {
      e.preventDefault();
      e.stopPropagation();
    }

    const rowEl = btn.closest(".row");
    const dayEl = btn.closest("details.day");

    if (action === "add-row" && dayEl) {
      const wi = Number(dayEl.getAttribute("data-w"));
      const di = Number(dayEl.getAttribute("data-d"));
      const rowsWrap = dayEl.querySelector(".rows");
      const ri = app.program.weeks[wi].days[di].rows.length;
      addRow(wi, di);
      // Minimal DOM update: append new row (avoids full re-render + snap glitches)
      if (rowsWrap) {
        const newRow = renderRow(wi, di, ri, app.program.weeks[wi].days[di].rows[ri]);
        rowsWrap.appendChild(newRow);
        // Smooth scroll within the day card only (doesn't fight horizontal snap)
        try { newRow.scrollIntoView({ behavior: "smooth", block: "nearest" }); } catch {}
      }
      return;
    }

    if (action === "remove-row" && rowEl) {
      const wi = Number(rowEl.getAttribute("data-w"));
      const di = Number(rowEl.getAttribute("data-d"));
      const ri = Number(rowEl.getAttribute("data-r"));
      removeRow(wi, di, ri);
      // Minimal DOM update: remove row + renumber data-r
      rowEl.remove();
      const rowsWrap = dayEl?.querySelector(".rows");
      if (rowsWrap) {
        const all = Array.from(rowsWrap.querySelectorAll(".row"));
        all.forEach((n, idx) => n.setAttribute("data-r", String(idx)));
      }
      return;
    }

    if (action === "clear-row" && rowEl) {
      const wi = Number(rowEl.getAttribute("data-w"));
      const di = Number(rowEl.getAttribute("data-d"));
      const ri = Number(rowEl.getAttribute("data-r"));
      const row = app.program.weeks[wi]?.days?.[di]?.rows?.[ri];
      if (!row) return;
      row.ex = "";
      row.mode = "";
      row.sets = "";
      row.reps = "";
      row.load = "";
      row.pct = "";
      row.rpe = "";
      row.rest = "";
      updateDaySummaryDom(wi, di);
      scheduleUrlUpdate();
      // Update UI without full re-render
      rowEl.querySelectorAll("[data-field]").forEach((inp) => {
        inp.value = "";
      });
      return;
    }

    // (remove-last-row removed; per-row delete is used instead)

    if (action === "delete-day" && dayEl) {
      const wi = Number(dayEl.getAttribute("data-w"));
      const di = Number(dayEl.getAttribute("data-d"));
      const week = app.program.weeks[wi];
      if (week?.days?.length <= 1) {
        await appAlert("You can’t delete the last day.", { title: "Can’t delete" });
        return;
      }
      const ok = await appConfirm("Delete this day? This cannot be undone.", {
        title: "Delete day",
        okText: "Delete",
        cancelText: "Cancel",
        danger: true,
      });
      if (!ok) return;
      deleteDay(wi, di);
    }
  });

  // Mobile horizontal day scrolling + <details> can cause accidental toggles on swipe end,
  // which looks like "layout shifting" and makes row content/icons disappear.
  const mobileDayCarousel = window.matchMedia?.("(max-width: 720px)");
  dom.weekMount.addEventListener("click", (e) => {
    const summary = e.target.closest("details.day > summary");
    if (!summary) return;
    if (!mobileDayCarousel?.matches) return;
    // Allow clicks on actual controls inside the summary.
    if (e.target.closest("button") || e.target.closest(".ddWrap")) return;
    e.preventDefault();
  });

  dom.weekMount.addEventListener("toggle", (e) => {
    const details = e.target.closest?.("details.day");
    if (!details) return;
    if (!mobileDayCarousel?.matches) return;
    // Force open on mobile to avoid accidental collapse while swiping horizontally.
    if (!details.open) details.open = true;
  });

  dom.weekMount.addEventListener("input", (e) => {
    const input = e.target.closest("[data-field]");
    if (!input) return;
    const rowEl = input.closest(".row");
    if (!rowEl) return;
    const field = input.getAttribute("data-field");
    if (!field) return;

    const wi = Number(rowEl.getAttribute("data-w"));
    const di = Number(rowEl.getAttribute("data-d"));
    const ri = Number(rowEl.getAttribute("data-r"));

    setField(wi, di, ri, field, input.value);
  });

  // Some browsers fire "change" (especially for <select>) more reliably than "input".
  dom.weekMount.addEventListener("change", (e) => {
    const input = e.target.closest("[data-field]");
    if (input) {
      const rowEl = input.closest(".row");
      if (!rowEl) return;
      const field = input.getAttribute("data-field");
      if (!field) return;

      const wi = Number(rowEl.getAttribute("data-w"));
      const di = Number(rowEl.getAttribute("data-d"));
      const ri = Number(rowEl.getAttribute("data-r"));

      setField(wi, di, ri, field, input.value);
      return;
    }

    // (day-of-week is now handled by custom dropdown in renderDay)
  });


  /** -------------------------
   *  Boot
   *  ------------------------- */

  function boot() {
    const enc = readStateFromUrl();
    if (enc) {
      try {
        const decoded = decodeState(enc);
        app.program = normalizeProgram(decoded);
        app.currentWeek = 0;
        app.lastEncoded = enc; // prevent immediate re-write thrash
        setStatus("");
      } catch (e) {
        app.program = defaultProgram();
        app.currentWeek = 0;
        setStatus("Could not read program from link. Loaded a blank program instead.", "error");
      }
    } else {
      app.program = defaultProgram();
      app.currentWeek = 0;
      try {
        app.lastEncoded = encodeState(app.program);
        writeStateToUrl(app.lastEncoded);
      } catch {
        // ignore
      }
      setStatus("");
    }
    render();
  }

  const ONBOARDING_KEY = "pli_hide_onboarding";

  function persistOnboardingDismiss() {
    try {
      if (dom.onboardingDialogDontShow?.checked) {
        localStorage.setItem(ONBOARDING_KEY, "1");
      }
    } catch {}
  }

  function closeOnboardingDialog() {
    persistOnboardingDismiss();
    try {
      dom.onboardingDialog?.close();
    } catch {}
  }

  function initOnboarding() {
    if (!dom.onboardingDialog?.showModal) return;
    try {
      if (localStorage.getItem(ONBOARDING_KEY) === "1") return;
    } catch {}
    dom.onboardingDialog.showModal();
    window.setTimeout(() => {
      try {
        dom.onboardingDialogOkBtn?.focus();
      } catch {}
    }, 0);
  }

  dom.onboardingDialogCloseBtn?.addEventListener("click", closeOnboardingDialog);
  dom.onboardingDialogOkBtn?.addEventListener("click", closeOnboardingDialog);
  dom.onboardingDialogDontShow?.addEventListener("change", () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, dom.onboardingDialogDontShow.checked ? "1" : "0");
    } catch {}
  });

  initTheme();
  initOnboarding();
  boot();
})();


