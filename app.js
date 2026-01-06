/* global LZString */
(() => {
  "use strict";

  const ROUTE_PREFIX = "/p/";
  const HASH_PREFIX = "#/p/";

  /** -------------------------
   *  State model + defaults
   *  ------------------------- */

  function emptyRow() {
    return { ex: "", mode: "", sets: "", reps: "", load: "", pct: "", rest: "" };
  }

  function defaultDayLabels() {
    return [
      "DAY 1 - MON",
      "DAY 2 - TUE",
      "DAY 3 - WED",
      "DAY 4 - THU",
      "DAY 5 - FRI",
      "DAY 6 - SAT",
      "DAY 7 - SUN",
    ];
  }

  function defaultWeek() {
    return {
      days: defaultDayLabels().map((label) => ({
        label,
        rows: [emptyRow()],
      })),
    };
  }

  function defaultProgram() {
    return { v: 1, weeks: [defaultWeek()] };
  }

  function normalizeProgram(input) {
    const prog = input && typeof input === "object" ? input : defaultProgram();
    const weeks = Array.isArray(prog.weeks) ? prog.weeks : [];
    if (weeks.length === 0) return defaultProgram();

    return {
      v: prog.v === 1 ? 1 : 1,
      weeks: weeks.map((w) => ({
        days: (Array.isArray(w.days) ? w.days : []).map((d, di) => ({
          label: typeof d.label === "string" && d.label.trim() ? d.label : defaultDayLabels()[di] || `DAY ${di + 1}`,
          rows: (Array.isArray(d.rows) && d.rows.length ? d.rows : [emptyRow()]).map((r) => ({
            ex: typeof r.ex === "string" ? r.ex : "",
            mode: typeof r.mode === "string" ? r.mode : "",
            sets: r.sets ?? "",
            reps: r.reps ?? "",
            load: r.load ?? "",
            pct: r.pct ?? "",
            rest: r.rest ?? "",
          })),
        })),
      })),
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
    weekLabel: document.getElementById("weekLabel"),
    weekHint: document.getElementById("weekHint"),
    status: document.getElementById("status"),
    prevWeekBtn: document.getElementById("prevWeekBtn"),
    nextWeekBtn: document.getElementById("nextWeekBtn"),
    addWeekBtn: document.getElementById("addWeekBtn"),
    copyLinkBtn: document.getElementById("copyLinkBtn"),
  };

  const app = {
    program: defaultProgram(),
    currentWeek: 0,
    urlDebounce: null,
    lastEncoded: null,
  };

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

  function renderWeekBar() {
    const total = app.program.weeks.length;
    const idx = app.currentWeek;
    dom.weekLabel.textContent = `Week ${idx + 1}`;
    dom.weekHint.textContent = `${total} week${total === 1 ? "" : "s"} • Shareable link updates as you type`;
    dom.prevWeekBtn.disabled = idx <= 0;
    dom.nextWeekBtn.disabled = idx >= total - 1;
  }

  function renderRow(wi, di, ri, row) {
    const showExamples = wi === 0 && di === 0 && ri === 0;

    const removeBtn = el(
      "button",
      {
        type: "button",
        class: "iconBtn iconBtn--danger",
        title: "Remove row",
        "data-action": "remove-row",
      },
      ["Remove"]
    );

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
        el("input", { class: "input", placeholder: showExamples ? "e.g. Paused / Comp / Tempo" : "", value: row.mode, "data-field": "mode" }),
      ]),
      el("div", { class: "field field--sets" }, [
        el("label", { text: "Sets" }),
        el("input", { class: "input", inputmode: "numeric", placeholder: showExamples ? "e.g. 5" : "", value: row.sets, "data-field": "sets" }),
      ]),
      el("div", { class: "field field--reps" }, [
        el("label", { text: "Reps" }),
        el("input", { class: "input", inputmode: "numeric", placeholder: showExamples ? "e.g. 3" : "", value: row.reps, "data-field": "reps" }),
      ]),
      el("div", { class: "field field--load" }, [
        el("label", { text: "Load" }),
        el("input", { class: "input", placeholder: showExamples ? "e.g. 185" : "", value: row.load, "data-field": "load" }),
      ]),
      el("div", { class: "field field--pct" }, [
        el("label", { text: "%1RM" }),
        el("input", { class: "input", inputmode: "decimal", placeholder: showExamples ? "e.g. 75" : "", value: row.pct, "data-field": "pct" }),
      ]),
      el("div", { class: "field field--rest" }, [
        el("label", { text: "Rest (mm:ss)" }),
        el("input", { class: "input", placeholder: showExamples ? "e.g. 2:00" : "", value: row.rest, "data-field": "rest" }),
      ]),
      el("div", { class: "field field--rm" }, [
        el("label", { text: "" }),
        removeBtn,
      ]),
    ]
    );
    return grid;
  }

  function renderDay(wi, di, day) {
    const rowsMount = el("div", { class: "rows" }, day.rows.map((r, ri) => renderRow(wi, di, ri, r)));

    const addRowBtn = el("button", { type: "button", class: "btn btn--ghost", "data-action": "add-row" }, ["+ Row"]);

    const headerRow = el("div", { class: "colHeader", "aria-hidden": "true" }, [
      el("div", { text: "Exercise" }),
      el("div", { text: "Variation" }),
      el("div", { text: "Sets" }),
      el("div", { text: "Reps" }),
      el("div", { text: "Load" }),
      el("div", { text: "%1RM" }),
      el("div", { text: "Rest (mm:ss)" }),
      el("div", { class: "hRm", text: "" }),
    ]);

    const dayMeta = `${day.rows.length} row${day.rows.length === 1 ? "" : "s"}`;
    const summary = el("summary", {}, [
      el("div", { class: "day__label", text: day.label }),
      el("div", { class: "day__meta", text: dayMeta }),
    ]);

    const body = el("div", { class: "day__body" }, [
      headerRow,
      rowsMount,
      el("div", { class: "dayFooter" }, [addRowBtn]),
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
    app.program.weeks.push(defaultWeek());
    app.currentWeek = app.program.weeks.length - 1;
    scheduleUrlUpdate();
    render();
  }

  function addRow(wi, di) {
    app.program.weeks[wi].days[di].rows.push(emptyRow());
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
    row[field] = value;
    scheduleUrlUpdate();
  }

  /** -------------------------
   *  Events
   *  ------------------------- */

  dom.prevWeekBtn.addEventListener("click", () => {
    app.currentWeek = clamp(app.currentWeek - 1, 0, app.program.weeks.length - 1);
    render();
  });
  dom.nextWeekBtn.addEventListener("click", () => {
    app.currentWeek = clamp(app.currentWeek + 1, 0, app.program.weeks.length - 1);
    render();
  });
  dom.addWeekBtn.addEventListener("click", addWeek);

  dom.copyLinkBtn.addEventListener("click", async () => {
    const link = window.location.href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
        setStatus("Link copied.");
      } else {
        window.prompt("Copy this link:", link);
      }
    } catch {
      window.prompt("Copy this link:", link);
    }
  });

  dom.weekMount.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    if (!action) return;

    const rowEl = btn.closest(".row");
    const dayEl = btn.closest("details.day");

    if (action === "add-row" && dayEl) {
      const wi = Number(dayEl.getAttribute("data-w"));
      const di = Number(dayEl.getAttribute("data-d"));
      addRow(wi, di);
      return;
    }

    if (action === "remove-row" && rowEl) {
      const wi = Number(rowEl.getAttribute("data-w"));
      const di = Number(rowEl.getAttribute("data-d"));
      const ri = Number(rowEl.getAttribute("data-r"));
      removeRow(wi, di, ri);
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

  boot();
})();


