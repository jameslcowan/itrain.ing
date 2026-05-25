import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadLzString() {
  const src = readFileSync(join(root, "vendor/lz-string.min.js"), "utf8");
  const ctx = { exports: {}, module: { exports: {} }, window: {} };
  vm.runInNewContext(src, ctx);
  return ctx.LZString || ctx.module.exports || ctx.exports;
}

function loadCodec(LZString) {
  const src = readFileSync(join(root, "state-codec.js"), "utf8");
  const ctx = {
    LZString,
    globalThis: {},
    window: {},
    btoa: (s) => Buffer.from(s, "binary").toString("base64"),
    atob: (s) => Buffer.from(s, "base64").toString("binary"),
  };
  vm.runInNewContext(src, ctx);
  return ctx.globalThis.PowerliftCodec || ctx.window.PowerliftCodec;
}

const LZString = loadLzString();
const codec = loadCodec(LZString);

const sampleV1 = {
  v: 1,
  u: "kg",
  c: [{ n: "Meso 1" }],
  weeks: [
    {
      c: 0,
      days: [
        {
          label: "DAY 1 - MON",
          rows: [
            {
              ex: "Squat",
              mode: "High bar",
              sets: "4",
              reps: "5",
              load: "100",
              pct: "",
              rpe: "7.5",
              rest: "03:00",
            },
          ],
        },
      ],
    },
  ],
};

test("encodeState + decodeState round-trip (v2 wire format)", () => {
  const enc = codec.encodeState(sampleV1);
  assert.ok(enc.length > 0);
  const decoded = codec.decodeState(enc);
  assert.equal(decoded.u, "kg");
  assert.equal(decoded.weeks[0].days[0].rows[0].ex, "Squat");
  assert.equal(decoded.weeks[0].days[0].rows[0].rpe, "7.5");
});

test("normalizeProgram fills missing rows and units", () => {
  const out = codec.normalizeProgram({ v: 1, weeks: [{ c: 0, days: [{ label: "DAY 1 - MON", rows: [] }] }] });
  assert.equal(out.u, "kg");
  assert.equal(out.weeks[0].days[0].rows.length, 1);
  assert.equal(out.weeks[0].days[0].rows[0].ex, "");
});

test("defaultProgram encodes and decodes", () => {
  const enc = codec.encodeState(codec.defaultProgram());
  const decoded = codec.decodeState(enc);
  assert.equal(decoded.u, "kg");
  assert.equal(decoded.weeks.length, 1);
  assert.equal(decoded.weeks[0].days.length, 3);
});

test("urlStateLengthHint thresholds", () => {
  assert.equal(codec.urlStateLengthHint(100), null);
  assert.equal(codec.urlStateLengthHint(2000).level, "warn");
  assert.equal(codec.urlStateLengthHint(7000).level, "error");
});

test("looksLikeProgramV1 validation", () => {
  assert.equal(codec.looksLikeProgramV1(sampleV1), true);
  assert.equal(codec.looksLikeProgramV1({ v: 2 }), false);
  assert.equal(codec.looksLikeProgramV1(null), false);
});

test("encodeState round-trip preserves maxes (m)", () => {
  const withMaxes = {
    ...sampleV1,
    m: { squat: "140", "bench press": "100", "leg press": "200" },
  };
  const decoded = codec.normalizeProgram(codec.decodeState(codec.encodeState(withMaxes)));
  assert.equal(decoded.m.squat, "140");
  assert.equal(decoded.m["bench press"], "100");
  assert.equal(decoded.m["leg press"], "200");
});
