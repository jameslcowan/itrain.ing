/* global LZString */
/**
 * Program state codec (encode/decode/normalize). Shared by app.js.
 * Requires LZString (vendor/lz-string.min.js) loaded first in the browser.
 */
(() => {
  "use strict";

  const DOW = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  /** Soft/hard limits for /app/<STATE> path segment (chars in encoded payload). */
  const URL_STATE_SOFT = 1800;
  const URL_STATE_HARD = 6000;

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function emptyRow() {
    return { ex: "", mode: "", sets: "", reps: "", load: "", pct: "", rpe: "", rest: "" };
  }

  function defaultDayLabels() {
    return ["DAY 1 - MON", "DAY 2 - WED", "DAY 3 - FRI"];
  }

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

  function normalizeMaxesMap(input) {
    const out = {};
    if (!input || typeof input !== "object") return out;
    for (const [k, v] of Object.entries(input)) {
      const key = String(k ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
      const digits = String(v ?? "").replace(/\D/g, "").slice(0, 4);
      if (key && digits && Number(digits) > 0) out[key] = digits;
    }
    return out;
  }

  function defaultProgram() {
    return { v: 1, u: "lb", m: {}, c: [{ n: "Meso 1" }], weeks: [defaultWeek()] };
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
      v: 1,
      u: prog.u === "kg" ? "kg" : "lb",
      m: normalizeMaxesMap(prog.m),
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
            const label =
              existingLabel && existingLabel.trim()
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

  function compactState(state) {
    const m = normalizeMaxesMap(state.m);
    const compact = {
      v: 2,
      u: state.u,
      c: state.c,
      weeks: state.weeks.map((w) => ({
        c: w.c,
        days: w.days.map((d) => ({
          d: dowFromLabel(d.label) || "MON",
          rows: d.rows.map((r) => {
            const row = {};
            if (r.ex) row.ex = r.ex;
            if (r.mode) row.m = r.mode;
            if (r.sets) row.s = r.sets;
            if (r.reps) row.r = r.reps;
            if (r.load) row.l = r.load;
            if (r.pct) row.p = r.pct;
            if (r.rpe) row.e = r.rpe;
            if (r.rest) row.t = r.rest;
            return row;
          }),
        })),
      })),
    };
    if (Object.keys(m).length) compact.m = m;
    return compact;
  }

  function expandState(compact) {
    return {
      v: 1,
      u: compact.u,
      m: normalizeMaxesMap(compact.m),
      c: compact.c,
      weeks: compact.weeks.map((w) => ({
        c: w.c,
        days: w.days.map((d, di) => ({
          label: labelForDay(di, d.d || "MON"),
          rows: d.rows.map((r) => ({
            ex: r.ex || "",
            mode: r.m || "",
            sets: r.s || "",
            reps: r.r || "",
            load: r.l || "",
            pct: r.p || "",
            rpe: r.e || "",
            rest: r.t || "",
          })),
        })),
      })),
    };
  }

  function encodeState(state) {
    const compact = compactState(state);
    const json = JSON.stringify(compact);
    const bytes = LZString.compressToUint8Array(json);
    return base64urlEncode(bytesToBase64(bytes));
  }

  function decodeState(str) {
    const b64 = base64urlDecode(str);
    const bytes = base64ToBytes(b64);
    const json = LZString.decompressFromUint8Array(bytes);
    if (!json) throw new Error("Invalid state");

    const parsed = JSON.parse(json);
    if (parsed.v === 2) return expandState(parsed);
    return parsed;
  }

  function looksLikeProgramV1(obj) {
    if (!obj || typeof obj !== "object") return false;
    if (obj.v !== 1) return false;
    if (obj.u !== "kg" && obj.u !== "lb") return false;
    if (!Array.isArray(obj.c) || !Array.isArray(obj.weeks)) return false;
    return true;
  }

  function urlStateLengthHint(encodedLength) {
    if (encodedLength >= URL_STATE_HARD) {
      return {
        level: "error",
        message:
          "This program link is too long for some apps and browsers. Remove exercises or split into multiple links.",
      };
    }
    if (encodedLength >= URL_STATE_SOFT) {
      return {
        level: "warn",
        message: "Link is getting long — some apps may truncate very long URLs when sharing.",
      };
    }
    return null;
  }

  const api = {
    DOW,
    URL_STATE_SOFT,
    URL_STATE_HARD,
    emptyRow,
    defaultDayLabels,
    standardDowPreset,
    labelForDay,
    dowFromLabel,
    usedDows,
    nextDowForWeek,
    defaultWeek,
    defaultProgram,
    normalizeProgram,
    normalizeMaxesMap,
    encodeState,
    decodeState,
    looksLikeProgramV1,
    urlStateLengthHint,
  };

  const root = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
  root.PowerliftCodec = api;
})();
