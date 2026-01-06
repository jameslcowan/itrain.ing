/* global LZString */
(() => {
  "use strict";

  const ROUTE_PREFIX = "/p/";
  const HASH_PREFIX = "#/p/";

  /** -------------------------
   *  State model + defaults
   *  ------------------------- */

  function emptyRow() {
    return { ex: "", mode: "", sets: "", reps: "", load: "", pct: "", rpe: "", rest: "" };
  }

  function defaultDayLabels() {
    // Default start: 3 days (common lifting cadence)
    return ["DAY 1 - MON", "DAY 2 - WED", "DAY 3 - FRI"];
  }

  const DOW = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  function standardDowPreset(count) {
    if (count === 3) return ["MON", "WED", "FRI"];
    if (count === 4) return ["MON", "TUE", "THU", "FRI"];
    if (count === 5) return ["MON", "TUE", "WED", "THU", "FRI"];
    if (count === 6) return ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
    if (count === 7) return ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    if (count === 2) return ["MON", "THU"];
    return ["MON"];
  }

  function labelForDay(dayIndex, dow) {
    const safeDow = dow && DOW.includes(dow) ? dow : "DAY";
    return `DAY ${dayIndex + 1} - ${safeDow}`;
  }

  function dowFromLabel(label) {
    if (typeof label !== "string") return "";
    const m = label.trim().match(/-\s*([A-Z]{3})\s*$/);
    const val = m ? m[1] : "";
    return DOW.includes(val) ? val : "";
  }

  function usedDows(week) {
    const days = Array.isArray(week?.days) ? week.days : [];
    return new Set(days.map((d) => dowFromLabel(d?.label)).filter(Boolean));
  }

  function nextDowForWeek(week) {
    const used = usedDows(week);
    for (const d of DOW) {
      if (!used.has(d)) return d;
    }
    return "MON";
  }

  function defaultWeek() {
    return {
      c: 0,
      days: defaultDayLabels().map((label) => ({
        label,
        rows: [emptyRow()],
      })),
    };
  }

  function defaultProgram() {
    return { v: 1, u: "lb", c: [{ n: "Meso 1" }], weeks: [defaultWeek()] };
  }

  function normalizeProgram(input) {
    const prog = input && typeof input === "object" ? input : defaultProgram();
    const weeks = Array.isArray(prog.weeks) ? prog.weeks : [];
    if (weeks.length === 0) return defaultProgram();

    const cycles = Array.isArray(prog.c) ? prog.c : [{ n: "Meso 1" }];
    const safeCycles = cycles.length
      ? cycles.map((cy, i) => ({
          n: typeof cy?.n === "string" && cy.n.trim() ? cy.n : `Meso ${i + 1}`,
        }))
      : [{ n: "Meso 1" }];

    return {
      v: prog.v === 1 ? 1 : 1,
      u: prog.u === "kg" ? "kg" : "lb",
      c: safeCycles,
      weeks: weeks.map((w) => {
        const incomingDays = Array.isArray(w.days) ? w.days : [];
        const count = incomingDays.length || defaultDayLabels().length;
        const preset = standardDowPreset(count);
        const cycleIndex = Number.isFinite(w?.c) ? clamp(Number(w.c), 0, safeCycles.length - 1) : 0;

        return {
          c: cycleIndex,
          days: (incomingDays.length ? incomingDays : new Array(count).fill(null)).map((d, di) => {
            const existingLabel = d && typeof d.label === "string" ? d.label : "";
            const existingDow = dowFromLabel(existingLabel);
            const label = existingLabel && existingLabel.trim()
              ? existingLabel
              : labelForDay(di, preset[di] || "MON");

            return {
              label,
              rows: (Array.isArray(d?.rows) && d.rows.length ? d.rows : [emptyRow()]).map((r) => ({
                ex: typeof r.ex === "string" ? r.ex : "",
                mode: typeof r.mode === "string" ? r.mode : "",
                sets: r.sets ?? "",
                reps: r.reps ?? "",
                load: r.load ?? "",
                pct: r.pct ?? "",
                rpe: r.rpe ?? "",
                rest: r.rest ?? "",
              })),
            };
          }),
        };
      }),
    };
  }

  /** -------------------------
   *  Encoding (lz-string + base64url)
   *  ------------------------- */

  function bytesToBase64(bytes) {
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      const sub = bytes.subarray(i, i + chunk);
      binary += String.fromCharCode.apply(null, sub);
    }
    return btoa(binary);
  }

  function base64ToBytes(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function base64urlEncode(b64) {
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function base64urlDecode(b64url) {
    const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
    return b64 + pad;
  }

  function encodeState(state) {
    const json = JSON.stringify(state);
    const bytes = LZString.compressToUint8Array(json);
    return base64urlEncode(bytesToBase64(bytes));
  }

  function decodeState(str) {
    const b64 = base64urlDecode(str);
    const bytes = base64ToBytes(b64);
    const json = LZString.decompressFromUint8Array(bytes);
    if (!json) throw new Error("Invalid state");
    return JSON.parse(json);
  }

  /** -------------------------
   *  Routing helpers
   *  ------------------------- */

  function getRouteMode() {
    const path = window.location.pathname || "/";
    if (path.startsWith(ROUTE_PREFIX)) return "path";
    return "hash";
  }

  function readStateFromUrl() {
    const path = window.location.pathname || "/";
    const hash = window.location.hash || "";

    if (path.startsWith(ROUTE_PREFIX)) {
      const enc = decodeURIComponent(path.slice(ROUTE_PREFIX.length));
      return enc || null;
    }

    if (hash.startsWith(HASH_PREFIX)) {
      const enc = decodeURIComponent(hash.slice(HASH_PREFIX.length));
      return enc || null;
    }

    return null;
  }

  function writeStateToUrl(enc) {
    const routeMode = getRouteMode();
    if (routeMode === "path") {
      const url = `${ROUTE_PREFIX}${encodeURIComponent(enc)}`;
      history.replaceState(null, "", url);
      return;
    }
    const url = `/${HASH_PREFIX}${encodeURIComponent(enc)}`;
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
    deleteWeekBtn: document.getElementById("deleteWeekBtn"),
  };

  const app = {
    program: defaultProgram(),
    currentWeek: 0,
    urlDebounce: null,
    lastEncoded: null,
    pendingFocus: null, // { di, ri, focusField }
    pendingWeekScrollLeft: null,
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
  }

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
        setStatus("");
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

  function icon(name) {
    return el("iconify-icon", { icon: name });
  }

  function renderDropdown({ id, label, value, options, onChange }) {
    const wrap = el("div", { class: "ddWrap", "data-dd": id });

    const btn = el(
      "button",
      {
        type: "button",
        class: "dd__btn",
        "aria-haspopup": "listbox",
        "aria-expanded": "false",
      },
      [
        el("span", { class: "dd__label", text: label(value) }),
        el("span", { class: "dd__chev" }, [icon("material-symbols-light:expand-more")]),
      ]
    );

    const menu = el("div", { class: "dd__menu", role: "listbox", hidden: true }, []);

    function close() {
      btn.setAttribute("aria-expanded", "false");
      menu.hidden = true;
    }
    function open() {
      btn.setAttribute("aria-expanded", "true");
      menu.hidden = false;
    }
    function toggle() {
      if (menu.hidden) open();
      else close();
    }

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggle();
    });

    menu.addEventListener("click", (e) => {
      const opt = e.target.closest("[data-value]");
      if (!opt) return;
      const v = opt.getAttribute("data-value");
      close();
      onChange(v);
    });

    // Close on outside click
    window.addEventListener("pointerdown", (e) => {
      if (!wrap.contains(e.target)) close();
    });

    // Populate options
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

  function renderWeekBar() {
    const total = app.program.weeks.length;
    const idx = app.currentWeek;
    dom.weekHint.textContent = `${total} week${total === 1 ? "" : "s"} • Link updates as you type`;

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

  function renderRow(wi, di, ri, row) {
    const showExamples = wi === 0 && di === 0 && ri === 0;

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
        el("label", { text: "Exercise" }),
        el("input", { class: "input", placeholder: showExamples ? "e.g. Squat" : "", value: row.ex, "data-field": "ex" }),
      ]),
      el("div", { class: "field field--mode" }, [
        el("label", { text: "Variation" }),
        el("input", { class: "input", placeholder: "", value: row.mode, "data-field": "mode" }),
      ]),
      el("div", { class: "field field--sets" }, [
        el("label", { text: "Sets" }),
        el("input", { class: "input", inputmode: "numeric", pattern: "\\d*", maxlength: "3", placeholder: "", value: row.sets, "data-field": "sets" }),
      ]),
      el("div", { class: "field field--reps" }, [
        el("label", { text: "Reps" }),
        el("input", { class: "input", inputmode: "numeric", pattern: "\\d*", maxlength: "3", placeholder: "", value: row.reps, "data-field": "reps" }),
      ]),
      el("div", { class: "field field--load" }, [
        el("label", { text: `Load (${app.program.u === "kg" ? "kg" : "lb"})` }),
        el("input", { class: "input", inputmode: "numeric", pattern: "\\d*", maxlength: "4", placeholder: "", value: row.load, "data-field": "load" }),
      ]),
      el("div", { class: "field field--pct" }, [
        el("label", { text: "%1RM" }),
        el("input", { class: "input", inputmode: "numeric", pattern: "\\d*", maxlength: "3", placeholder: "", value: row.pct, "data-field": "pct" }),
      ]),
      el("div", { class: "field field--rpe" }, [
        el("label", { text: "RPE" }),
        el("input", { class: "input", inputmode: "decimal", placeholder: "", value: row.rpe, "data-field": "rpe" }),
      ]),
      el("div", { class: "field field--rest" }, [
        el("label", { text: "Rest (mm:ss)" }),
        el("input", { class: "input", inputmode: "numeric", placeholder: "", value: row.rest, "data-field": "rest" }),
      ]),
      el("div", { class: "field field--rm" }, [
        el("label", { text: "" }),
        el("div", { class: "rowRightBtns" }, []),
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
      [icon("material-symbols-light:add"), el("span", { text: "Add exercise" })]
    );

    const canDelete = day.rows.length > 1;
    const deleteExerciseBtn = el(
      "button",
      {
        type: "button",
        class: "actionBtn actionBtn--delete",
        title: canDelete ? "Delete last exercise" : "Can’t delete last exercise",
        "aria-label": "Delete exercise",
        "data-action": "remove-last-row",
        disabled: canDelete ? false : true,
      },
      [icon("material-symbols-light:delete-outline"), el("span", { text: "Delete exercise" })]
    );

    const headerRow = el("div", { class: "colHeader", "aria-hidden": "true" }, [
      el("div", { text: "Exercise" }),
      el("div", { text: "Variation" }),
      el("div", { text: "Sets" }),
      el("div", { text: "Reps" }),
      el("div", { text: "Load" }),
      el("div", { text: "%1RM" }),
      el("div", { text: "RPE" }),
      el("div", { text: "Rest (mm:ss)" }),
      el("div", { class: "hRm", text: "" }),
    ]);

    const dayMeta = `${day.rows.length} row${day.rows.length === 1 ? "" : "s"}`;

    const currentDow = dowFromLabel(day.label) || "MON";
    const dowSelect = el(
      "select",
      { class: "select select--compact dayDowSelect", "data-action": "set-dow" },
      DOW.map((d) => {
        const opt = el("option", { value: d, text: d });
        if (d === currentDow) opt.selected = true;
        return opt;
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
      [icon("material-symbols-light:delete-outline")]
    );

    const summary = el("summary", {}, [
      el("div", { class: "day__headerLeft" }, [
        el("div", { class: "day__label", text: `DAY ${di + 1}` }),
        dowSelect,
      ]),
      el("div", { class: "day__headerRight" }, [
        el("div", { class: "day__meta", text: dayMeta }),
        deleteDayBtn,
      ]),
    ]);

    const body = el("div", { class: "day__body" }, [
      headerRow,
      rowsMount,
      el("div", { class: "dayFooter dayFooter--actions" }, [addExerciseBtn, deleteExerciseBtn]),
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

    const weekScroller = dom.weekMount.querySelector(".week");
    if (weekScroller && typeof app.pendingWeekScrollLeft === "number") {
      weekScroller.scrollLeft = app.pendingWeekScrollLeft;
      app.pendingWeekScrollLeft = null;
    }

    // After mutations, smooth-scroll to the newly created exercise row and focus it.
    if (app.pendingFocus) {
      const { di, ri, focusField } = app.pendingFocus;
      app.pendingFocus = null;

      const dayEl = dom.weekMount.querySelector(`details.day[data-d="${di}"]`);
      const rowEl = dom.weekMount.querySelector(`.row[data-d="${di}"][data-r="${ri}"]`);
      const input = rowEl?.querySelector(`[data-field="${focusField}"]`);

      window.requestAnimationFrame(() => {
        if (dayEl?.scrollIntoView) {
          try {
            dayEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
          } catch {}
        }
        window.requestAnimationFrame(() => {
          if (input?.scrollIntoView) {
            try {
              input.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
            } catch {
              input.scrollIntoView();
            }
          }
          if (input?.focus) input.focus({ preventScroll: true });
        });
      });
    }
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

  function applyStandardWeekLabels(wi) {
    const week = app.program.weeks[wi];
    const preset = standardDowPreset(week.days.length);
    week.days.forEach((d, di) => {
      d.label = labelForDay(di, preset[di] || "MON");
    });
  }

  function setDayCount(wi, count) {
    const week = app.program.weeks[wi];
    const desired = clamp(count, 1, 7);

    if (week.days.length < desired) {
      const preset = standardDowPreset(desired);
      for (let di = week.days.length; di < desired; di++) {
        week.days.push({ label: labelForDay(di, preset[di] || "MON"), rows: [emptyRow()] });
      }
    } else if (week.days.length > desired) {
      week.days = week.days.slice(0, desired);
    }

    // Keep "DAY 1..N" numbering consistent.
    week.days.forEach((d, idx) => {
      const dow = dowFromLabel(d.label) || standardDowPreset(week.days.length)[idx] || "MON";
      d.label = labelForDay(idx, dow);
    });
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
    scheduleUrlUpdate();
    render();
  }

  function removeLastRow(wi, di) {
    const rows = app.program.weeks[wi].days[di].rows;
    if (rows.length <= 1) return;
    rows.pop();
    scheduleUrlUpdate();
    render();
  }

  function removeRow(wi, di, ri) {
    const rows = app.program.weeks[wi].days[di].rows;
    if (rows.length <= 1) return;
    rows.splice(ri, 1);
    scheduleUrlUpdate();
    render();
  }

  function setField(wi, di, ri, field, value) {
    const row = app.program.weeks[wi].days[di].rows[ri];
    if (!row) return;
    row[field] = sanitizeField(field, value);
    scheduleUrlUpdate();
  }

  /** -------------------------
   *  Events
   *  ------------------------- */

  dom.addWeekBtn?.addEventListener("click", () => {
    addWeek();
  });

  dom.deleteWeekBtn?.addEventListener("click", () => {
    if (app.program.weeks.length <= 1) {
      window.alert("You can’t delete the last week.");
      return;
    }
    const ok = window.confirm("Delete this week? This cannot be undone.");
    if (!ok) return;
    deleteWeek(app.currentWeek);
  });

  dom.addCycleBtn?.addEventListener("click", () => {
    addCycle();
  });

  dom.renameCycleBtn?.addEventListener("click", () => {
    const ci = getCurrentCycleIndex();
    const current = app.program.c?.[ci]?.n || `Meso ${ci + 1}`;
    const next = window.prompt("Mesocycle name:", current);
    if (next == null) return;
    if (!app.program.c?.[ci]) return;
    app.program.c[ci].n = next.trim() || current;
    scheduleUrlUpdate();
    renderWeekBar();
  });

  dom.addDayBtn?.addEventListener("click", () => {
    const wi = app.currentWeek;
    const week = app.program.weeks[wi];
    if (!week?.days) return;
    if (week.days.length >= 7) {
      window.alert("Max 7 days per week.");
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
        if (dom.shareDialog?.showModal) {
          dom.shareDialog.showModal();
          window.setTimeout(() => {
            try { dom.shareDialog.close(); } catch {}
          }, 1600);
        } else {
          window.alert("Link copied. Anyone with this link can open your program.");
        }
      } else {
        window.prompt("Copy this link:", link);
      }
    } catch {
      window.prompt("Copy this link:", link);
    }
  });

  dom.shareDialogCloseBtn?.addEventListener("click", () => {
    try { dom.shareDialog?.close(); } catch {}
  });

  function openMenu() {
    if (!dom.menuOverlay) return;
    dom.menuOverlay.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    if (!dom.menuOverlay) return;
    dom.menuOverlay.hidden = true;
    document.body.style.overflow = "";
  }

  dom.menuBtn?.addEventListener("click", openMenu);
  dom.menuCloseBtn?.addEventListener("click", closeMenu);
  dom.menuOverlay?.addEventListener("click", (e) => {
    if (e.target === dom.menuOverlay) closeMenu();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
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
      dom.themeIcon.setAttribute(
        "icon",
        effective === "dark" ? "material-symbols-light:dark-mode" : "material-symbols-light:light-mode"
      );
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
    mediaDark?.addEventListener?.("change", () => {
      if (!getStoredTheme()) updateThemeIcon();
    });
  }

  function toggleTheme() {
    const effective = getEffectiveTheme();
    const next = effective === "dark" ? "light" : "dark";
    setStoredTheme(next);
    applyTheme(next);
  }

  dom.themeToggleBtn?.addEventListener("click", toggleTheme);

  // Always return to a fresh blank program (clears /p/<STATE> and #/p/<STATE>).
  dom.homeLink?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = `${window.location.origin}/`;
  });

  dom.weekMount.addEventListener("click", (e) => {
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
    const weekScroller = dom.weekMount.querySelector(".week");

    if (action === "add-row" && dayEl) {
      const wi = Number(dayEl.getAttribute("data-w"));
      const di = Number(dayEl.getAttribute("data-d"));
      if (weekScroller) app.pendingWeekScrollLeft = weekScroller.scrollLeft;
      app.pendingFocus = { di, ri: app.program.weeks[wi].days[di].rows.length, focusField: "ex" };
      addRow(wi, di); // appends; pendingFocus points to new index
      return;
    }

    if (action === "remove-last-row" && dayEl) {
      const wi = Number(dayEl.getAttribute("data-w"));
      const di = Number(dayEl.getAttribute("data-d"));
      if (weekScroller) app.pendingWeekScrollLeft = weekScroller.scrollLeft;
      removeLastRow(wi, di);
      return;
    }

    if (action === "delete-day" && dayEl) {
      const wi = Number(dayEl.getAttribute("data-w"));
      const di = Number(dayEl.getAttribute("data-d"));
      const week = app.program.weeks[wi];
      if (week?.days?.length <= 1) {
        window.alert("You can’t delete the last day.");
        return;
      }
      const ok = window.confirm("Delete this day? This cannot be undone.");
      if (!ok) return;
      deleteDay(wi, di);
    }
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

    const dowSel = e.target.closest('select[data-action="set-dow"]');
    if (!dowSel) return;
    const dayEl = dowSel.closest("details.day");
    if (!dayEl) return;
    const wi = Number(dayEl.getAttribute("data-w"));
    const di = Number(dayEl.getAttribute("data-d"));
    setDayDow(wi, di, dowSel.value);
    scheduleUrlUpdate();
    render();
  });

  // Prevent interacting with the DOW dropdown from toggling the <details> open/closed.
  dom.weekMount.addEventListener("pointerdown", (e) => {
    const dowSel = e.target.closest('select[data-action="set-dow"]');
    if (dowSel) e.stopPropagation();
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

  initTheme();
  boot();
})();


