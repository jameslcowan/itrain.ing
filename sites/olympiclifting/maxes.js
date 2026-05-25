/**
 * 1RM maxes: exercise keys, aliases, localStorage cache, load ↔ % math.
 */
(() => {
  "use strict";

  const CACHE_KEY = "oli_maxes_v1";
  const LB_PER_KG = 2.204622621848775;
  const MAX_CACHE_LIFTS = 50;

  const PRIMARY_LIFTS = [
    { key: "snatch", label: "Snatch" },
    { key: "clean and jerk", label: "Clean & jerk" },
  ];

  /** Normalized alias → canonical primary (or exact) key */
  const ALIASES = {
    snatches: "snatch",
    "power snatch": "snatch",
    "hang snatch": "snatch",
    "muscle snatch": "snatch",
    "snatch pull": "snatch",
    "snatch balance": "snatch",
    "snatch deadlift": "snatch",
    "overhead squat": "snatch",
    "squat snatch": "snatch",
    "clean & jerk": "clean and jerk",
    "clean and jerk": "clean and jerk",
    cj: "clean and jerk",
    "c&j": "clean and jerk",
    cnj: "clean and jerk",
    jerk: "clean and jerk",
    "split jerk": "clean and jerk",
    "power jerk": "clean and jerk",
    "push jerk": "clean and jerk",
    clean: "clean and jerk",
    "power clean": "clean and jerk",
    "hang clean": "clean and jerk",
    "muscle clean": "clean and jerk",
    "clean pull": "clean and jerk",
    "front squat": "clean and jerk",
    "squat clean": "clean and jerk",
    "romanian deadlift": "romanian deadlift",
    rdl: "romanian deadlift",
    "back squat": "back squat",
    "front squats": "clean and jerk",
  };

  function normalizeExerciseKey(name) {
    return String(name ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function sanitizeMaxValue(raw) {
    const digits = String(raw ?? "").replace(/\D/g, "").slice(0, 4);
    if (!digits) return "";
    const n = Number(digits);
    if (!Number.isFinite(n) || n <= 0) return "";
    return String(n);
  }

  function toInt(x) {
    const n = Number(String(x ?? "").replace(/\D/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  function normalizeMaxesMap(input) {
    const out = {};
    if (!input || typeof input !== "object") return out;
    for (const [k, v] of Object.entries(input)) {
      const key = normalizeExerciseKey(k);
      const val = sanitizeMaxValue(v);
      if (key && val) out[key] = val;
    }
    return out;
  }

  function canonicalKey(normalizedExercise) {
    if (!normalizedExercise) return "";
    if (ALIASES[normalizedExercise]) return ALIASES[normalizedExercise];
    return normalizedExercise;
  }

  function readCache(unit) {
    const u = unit === "kg" ? "kg" : "lb";
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return normalizeMaxesMap(parsed?.[u]);
    } catch {
      return {};
    }
  }

  function writeCache(unit, map) {
    const u = unit === "kg" ? "kg" : "lb";
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const next = normalizeMaxesMap(map);
      const keys = Object.keys(next);
      const trimmed =
        keys.length > MAX_CACHE_LIFTS
          ? Object.fromEntries(keys.slice(-MAX_CACHE_LIFTS).map((k) => [k, next[k]]))
          : next;
      parsed[u] = trimmed;
      localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
    } catch {}
  }

  function mergeCacheWithProgram(programM, unit) {
    const cache = readCache(unit);
    return { ...cache, ...normalizeMaxesMap(programM) };
  }

  function resolveMaxForExercise(exerciseName, programM, unit) {
    const norm = normalizeExerciseKey(exerciseName);
    if (!norm) return null;

    const program = normalizeMaxesMap(programM);
    const cache = readCache(unit);
    const canon = canonicalKey(norm);

    const fromProgram = toInt(program[norm]) || (canon !== norm ? toInt(program[canon]) : 0);
    if (fromProgram > 0) return fromProgram;

    const fromCache = toInt(cache[norm]) || (canon !== norm ? toInt(cache[canon]) : 0);
    if (fromCache > 0) return fromCache;

    return null;
  }

  function convertMaxValue(value, fromU, toU) {
    const from = fromU === "kg" ? "kg" : "lb";
    const to = toU === "kg" ? "kg" : "lb";
    if (from === to) return value;
    const n = toInt(value);
    if (n <= 0) return "";
    if (from === "lb" && to === "kg") return String(Math.round(n / LB_PER_KG));
    if (from === "kg" && to === "lb") return String(Math.round(n * LB_PER_KG));
    return value;
  }

  function convertMaxesMap(map, fromU, toU) {
    const out = {};
    for (const [k, v] of Object.entries(normalizeMaxesMap(map))) {
      out[k] = convertMaxValue(v, fromU, toU);
    }
    return out;
  }

  function loadFromPct(max, pct) {
    const p = toInt(pct);
    if (p <= 0 || max <= 0) return "";
    return String(Math.round((max * p) / 100));
  }

  function pctFromLoad(max, load) {
    const l = toInt(load);
    if (l <= 0 || max <= 0) return "";
    return String(Math.min(100, Math.round((l / max) * 100)));
  }

  function collectExerciseNamesFromProgram(program) {
    const names = new Set();
    for (const w of program?.weeks || []) {
      for (const d of w.days || []) {
        for (const r of d.rows || []) {
          const key = normalizeExerciseKey(r?.ex);
          if (key) names.add(key);
        }
      }
    }
    return [...names].sort();
  }

  function customLiftKeys(mergedMaxes) {
    const primary = new Set(PRIMARY_LIFTS.map((p) => p.key));
    return Object.keys(mergedMaxes)
      .filter((k) => !primary.has(k))
      .sort();
  }

  const api = {
    CACHE_KEY,
    PRIMARY_LIFTS,
    normalizeExerciseKey,
    sanitizeMaxValue,
    normalizeMaxesMap,
    canonicalKey,
    readCache,
    writeCache,
    mergeCacheWithProgram,
    resolveMaxForExercise,
    convertMaxValue,
    convertMaxesMap,
    loadFromPct,
    pctFromLoad,
    collectExerciseNamesFromProgram,
    customLiftKeys,
  };

  const root = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : {};
  root.PowerliftMaxes = api;
})();
