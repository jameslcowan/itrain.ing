/**
 * Node build helper — mirrors browser encode in state-codec.js + vendor LZString.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const lzSrc = readFileSync(join(__dirname, "../vendor/lz-string.min.js"), "utf8");
const lzSandbox = { module: { exports: {} }, exports: {} };
vm.runInNewContext(lzSrc, lzSandbox);
const LZString = lzSandbox.module.exports;

const DOW = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function dowFromLabel(label) {
  if (typeof label !== "string") return "";
  const m = label.trim().match(/-\s*([A-Z]{3})\s*$/);
  const val = m ? m[1] : "";
  return DOW.includes(val) ? val : "";
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

function compactState(state) {
  const m = normalizeMaxesMap(state.m);
  const compact = {
    v: 2,
    u: state.u === "kg" ? "kg" : "lb",
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

function bytesToBase64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

function base64urlEncode(b64) {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

/** @param {import('../content/programs-data.js').ProgramV1} program */
export function encodeProgram(program) {
  const json = JSON.stringify(compactState(program));
  const bytes = LZString.compressToUint8Array(json);
  return base64urlEncode(bytesToBase64(bytes));
}
