/**
 * Program templates for /programs/ (v1 JSON — encoded at build time).
 */

/** @typedef {object} ProgramV1
 * @property {1} v
 * @property {'lb'|'kg'} u
 * @property {Record<string, string>} [m]
 * @property {{ n: string }[]} c
 * @property {{ c: number, days: { label: string, rows: object[] }[] }[]} weeks
 */

/** @typedef {object} ProgramCard
 * @property {string} id
 * @property {string} title
 * @property {string} [subtitle]
 * @property {string} [label]
 * @property {string} [badge]
 * @property {string} [category]
 * @property {string} description
 * @property {ProgramV1|null} program null → opens blank /app
 */

const row = (ex, sets, reps, opts = {}) => ({
  ex,
  mode: opts.mode || "",
  sets: String(sets),
  reps: String(reps),
  load: opts.load || "",
  pct: opts.pct || "",
  rpe: opts.rpe || "",
  rest: opts.rest || "",
});

/** @param {object} spec */
function miniProgram(spec) {
  const days = spec.days ?? [
    {
      label: "DAY 1",
      rows: [row(spec.lift ?? "Squat", 3, 5, { rpe: "8", rest: "03:00" })],
    },
  ];
  const weeks = Array.from({ length: spec.weeks ?? 1 }, (_, i) => ({
    c: i,
    days,
  }));
  return /** @type {ProgramCard} */ ({
    id: spec.id,
    title: spec.title,
    subtitle: spec.subtitle ?? "Test template",
    label: spec.label,
    badge: spec.badge ?? `${days.length} day${days.length === 1 ? "" : "s"}`,
    category: spec.category ?? "Test",
    description:
      spec.description ?? `Placeholder ${spec.title} for /programs/ grid and layout testing.`,
    program: {
      v: 1,
      u: spec.u ?? "lb",
      m: spec.m ?? { squat: "225", bench: "185", deadlift: "275" },
      c: [{ n: spec.block ?? "Test block" }],
      weeks,
    },
  });
}

/** @type {ProgramCard[]} */
export const PROGRAMS = [
  {
    id: "blank",
    title: "Blank program",
    subtitle: "Empty week, your rules",
    label: "Start here",
    category: "Starter",
    description:
      "Open the itrain.ing editor with a fresh week. Add mesocycles, days, and exercises, then share your link when you are ready.",
    program: null,
  },
  {
    id: "3-day-sbd",
    title: "3-day SBD",
    subtitle: "Squat · bench · deadlift",
    label: "Popular",
    badge: "3 days",
    category: "Full strength",
    description:
      "Classic three-day full power layout: squat, bench, and deadlift each get a focused session. Percentages are left open so you can plug in your own maxes in Config.",
    program: {
      v: 1,
      u: "lb",
      m: { squat: "315", bench: "225", deadlift: "365" },
      c: [{ n: "Strength block" }],
      weeks: [
        {
          c: 0,
          days: [
            {
              label: "DAY 1 - MON",
              rows: [
                row("Squat", 4, 6, { pct: "75", rest: "03:00" }),
                row("Bench Press", 4, 8, { pct: "70", rest: "02:30" }),
                row("Barbell Row", 3, 10, { rpe: "8", rest: "02:00" }),
              ],
            },
            {
              label: "DAY 2 - WED",
              rows: [
                row("Deadlift", 3, 5, { pct: "78", rest: "03:30" }),
                row("Overhead Press", 3, 8, { rpe: "7.5", rest: "02:00" }),
                row("Pull-ups", 3, 8, { rpe: "8", rest: "02:00" }),
              ],
            },
            {
              label: "DAY 3 - FRI",
              rows: [
                row("Squat", 3, 4, { pct: "82", rest: "03:30" }),
                row("Pause Bench", 4, 5, { pct: "75", rest: "03:00" }),
                row("Romanian Deadlift", 3, 8, { rpe: "7.5", rest: "02:30" }),
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "4-day-split",
    title: "4-day split",
    subtitle: "Squat focus + bench volume",
    badge: "4 days",
    category: "Hypertrophy",
    description:
      "Four training days with extra bench and squat exposure. Good when you want more frequency without running a full five-day split.",
    program: {
      v: 1,
      u: "lb",
      m: { squat: "300", bench: "215", deadlift: "350" },
      c: [{ n: "Hypertrophy" }],
      weeks: [
        {
          c: 0,
          days: [
            {
              label: "DAY 1 - MON",
              rows: [
                row("Squat", 4, 8, { pct: "72", rest: "02:30" }),
                row("Leg Press", 3, 12, { rpe: "8", rest: "02:00" }),
              ],
            },
            {
              label: "DAY 2 - TUE",
              rows: [
                row("Bench Press", 5, 8, { pct: "70", rest: "02:30" }),
                row("Close-Grip Bench", 3, 10, { rpe: "7.5", rest: "02:00" }),
                row("Tricep Pushdown", 3, 15, { rpe: "8", rest: "01:30" }),
              ],
            },
            {
              label: "DAY 3 - THU",
              rows: [
                row("Deadlift", 3, 6, { pct: "75", rest: "03:00" }),
                row("Barbell Row", 4, 8, { rpe: "8", rest: "02:00" }),
              ],
            },
            {
              label: "DAY 4 - FRI",
              rows: [
                row("Squat", 3, 5, { pct: "78", rest: "03:00" }),
                row("Bench Press", 3, 6, { pct: "75", rest: "03:00" }),
                row("Lat Pulldown", 3, 12, { rpe: "8", rest: "01:30" }),
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "531-week1",
    title: "5/3/1 — Week 1",
    subtitle: "65 · 75 · 85% sets",
    label: "Classic",
    badge: "1 week",
    category: "Percentage",
    description:
      "Jim Wendler-style 5/3/1 opening week on squat, bench, and deadlift. Set your true maxes in Config so loads fill in from the percentages.",
    program: {
      v: 1,
      u: "lb",
      m: { squat: "335", bench: "235", deadlift: "385" },
      c: [{ n: "5/3/1" }],
      weeks: [
        {
          c: 0,
          days: [
            {
              label: "DAY 1 - MON",
              rows: [
                row("Squat", 3, 5, { pct: "65", rest: "03:00" }),
                row("Squat", 3, 5, { pct: "75", rest: "03:00" }),
                row("Squat", 3, "5+", { pct: "85", rest: "03:30" }),
                row("Leg Curl", 5, 10, { rpe: "8", rest: "01:30" }),
              ],
            },
            {
              label: "DAY 2 - WED",
              rows: [
                row("Bench Press", 3, 5, { pct: "65", rest: "03:00" }),
                row("Bench Press", 3, 5, { pct: "75", rest: "03:00" }),
                row("Bench Press", 3, "5+", { pct: "85", rest: "03:30" }),
                row("Dumbbell Row", 5, 10, { rpe: "8", rest: "02:00" }),
              ],
            },
            {
              label: "DAY 3 - FRI",
              rows: [
                row("Deadlift", 3, 5, { pct: "65", rest: "03:30" }),
                row("Deadlift", 3, 5, { pct: "75", rest: "03:30" }),
                row("Deadlift", 3, "5+", { pct: "85", rest: "04:00" }),
                row("Ab Wheel", 3, 12, { rpe: "8", rest: "01:30" }),
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "bench-focus",
    title: "Bench focus",
    subtitle: "Extra pressing volume",
    badge: "3 days",
    category: "Bench",
    description:
      "Three-day template with bench twice per week plus supporting back and legs. Useful for off-season bench building.",
    program: {
      v: 1,
      u: "lb",
      m: { squat: "285", bench: "205", deadlift: "325" },
      c: [{ n: "Bench block" }],
      weeks: [
        {
          c: 0,
          days: [
            {
              label: "DAY 1 - MON",
              rows: [
                row("Bench Press", 5, 5, { pct: "78", rest: "03:00" }),
                row("Close-Grip Bench", 4, 6, { pct: "72", rest: "02:30" }),
                row("Spoto Press", 3, 6, { rpe: "7.5", rest: "02:30" }),
              ],
            },
            {
              label: "DAY 2 - WED",
              rows: [
                row("Squat", 3, 6, { pct: "72", rest: "03:00" }),
                row("Deadlift", 2, 5, { pct: "70", rest: "03:00" }),
              ],
            },
            {
              label: "DAY 3 - FRI",
              rows: [
                row("Bench Press", 4, 8, { pct: "70", rest: "02:30" }),
                row("Incline Bench", 3, 10, { rpe: "8", rest: "02:00" }),
                row("Tricep Extension", 3, 12, { rpe: "8", rest: "01:30" }),
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "meet-prep",
    title: "Meet prep peek",
    subtitle: "Opener · second · third",
    label: "Peaking",
    badge: "1 week",
    category: "Meet prep",
    description:
      "Single-week peek at meet attempts on SBD with light back-off work. Adjust percentages to match your planned attempts.",
    program: {
      v: 1,
      u: "kg",
      m: { squat: "180", bench: "120", deadlift: "200" },
      c: [{ n: "Meet week" }],
      weeks: [
        {
          c: 0,
          days: [
            {
              label: "DAY 1 - MON",
              rows: [
                row("Squat", 1, 1, { pct: "90", rest: "05:00" }),
                row("Squat", 1, 1, { pct: "96", rest: "06:00" }),
                row("Squat", 1, 1, { pct: "102", rest: "08:00" }),
              ],
            },
            {
              label: "DAY 2 - WED",
              rows: [
                row("Bench Press", 1, 1, { pct: "90", rest: "05:00" }),
                row("Bench Press", 1, 1, { pct: "96", rest: "06:00" }),
                row("Bench Press", 1, 1, { pct: "102", rest: "08:00" }),
              ],
            },
            {
              label: "DAY 3 - FRI",
              rows: [
                row("Deadlift", 1, 1, { pct: "90", rest: "05:00" }),
                row("Deadlift", 1, 1, { pct: "96", rest: "06:00" }),
                row("Deadlift", 1, 1, { pct: "102", rest: "08:00" }),
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "beginner-linear",
    title: "Beginner linear",
    subtitle: "Add weight each session",
    label: "New lifter",
    badge: "3 days",
    category: "Starter",
    description:
      "Simple A/B style three-day layout for newer lifters. Leave load blank and add 5 lb or 2.5 kg per session as you progress.",
    program: {
      v: 1,
      u: "lb",
      m: { squat: "135", bench: "95", deadlift: "185" },
      c: [{ n: "Linear" }],
      weeks: [
        {
          c: 0,
          days: [
            {
              label: "DAY 1 - MON",
              rows: [
                row("Squat", 3, 5, { load: "135", rest: "03:00" }),
                row("Bench Press", 3, 5, { load: "95", rest: "03:00" }),
                row("Deadlift", 1, 5, { load: "185", rest: "03:30" }),
              ],
            },
            {
              label: "DAY 2 - WED",
              rows: [
                row("Squat", 3, 5, { load: "140", rest: "03:00" }),
                row("Overhead Press", 3, 5, { load: "65", rest: "02:30" }),
                row("Barbell Row", 3, 5, { load: "95", rest: "02:30" }),
              ],
            },
            {
              label: "DAY 3 - FRI",
              rows: [
                row("Squat", 3, 5, { load: "145", rest: "03:00" }),
                row("Bench Press", 3, 5, { load: "100", rest: "03:00" }),
                row("Deadlift", 1, 5, { load: "190", rest: "03:30" }),
              ],
            },
          ],
        },
      ],
    },
  },
  // ——— Test templates (grid / layout) ———
  miniProgram({ id: "test-squat-day", title: "Squat day", label: "Popular", lift: "Squat", category: "Squat" }),
  miniProgram({
    id: "test-bench-day",
    title: "Bench day",
    label: "High rated",
    lift: "Bench Press",
    category: "Bench",
  }),
  miniProgram({
    id: "test-deadlift-day",
    title: "Deadlift day",
    lift: "Deadlift",
    category: "Deadlift",
    badge: "1 day",
  }),
  miniProgram({
    id: "test-2-day-ul",
    title: "2-day upper / lower",
    badge: "2 days",
    days: [
      { label: "DAY 1 - UPPER", rows: [row("Bench Press", 3, 8, { pct: "70", rest: "02:30" })] },
      { label: "DAY 2 - LOWER", rows: [row("Squat", 3, 8, { pct: "70", rest: "03:00" })] },
    ],
  }),
  miniProgram({
    id: "test-5-day",
    title: "5-day split",
    badge: "5 days",
    category: "Hypertrophy",
    days: [
      { label: "DAY 1", rows: [row("Squat", 3, 6)] },
      { label: "DAY 2", rows: [row("Bench Press", 3, 6)] },
      { label: "DAY 3", rows: [row("Deadlift", 3, 5)] },
      { label: "DAY 4", rows: [row("Overhead Press", 3, 8)] },
      { label: "DAY 5", rows: [row("Barbell Row", 3, 10)] },
    ],
  }),
  miniProgram({
    id: "test-volume-squat",
    title: "Volume squat",
    subtitle: "Higher rep squats",
    label: "Popular",
    category: "Squat",
    days: [{ label: "DAY 1", rows: [row("Squat", 5, 10, { rpe: "7", rest: "02:00" })] }],
  }),
  miniProgram({
    id: "test-deload",
    title: "Deload week",
    label: "Recovery",
    category: "Deload",
    days: [
      {
        label: "DAY 1",
        rows: [
          row("Squat", 2, 5, { pct: "60", rest: "02:00" }),
          row("Bench Press", 2, 5, { pct: "60", rest: "02:00" }),
        ],
      },
    ],
  }),
  miniProgram({
    id: "test-rpe-block",
    title: "RPE block",
    subtitle: "Autoregulated",
    category: "RPE",
    days: [{ label: "DAY 1", rows: [row("Squat", 4, 6, { rpe: "8", rest: "03:00" })] }],
  }),
  miniProgram({
    id: "test-kg",
    title: "KG template",
    u: "kg",
    m: { squat: "140", bench: "100", deadlift: "180" },
    category: "Metric",
  }),
  miniProgram({
    id: "test-2-week",
    title: "2-week block",
    weeks: 2,
    badge: "2 days",
    days: [
      { label: "DAY 1", rows: [row("Squat", 3, 5)] },
      { label: "DAY 2", rows: [row("Bench Press", 3, 5)] },
    ],
  }),
  miniProgram({
    id: "test-3-week-peak",
    title: "3-week peak",
    label: "Peaking",
    weeks: 3,
    category: "Meet prep",
    days: [{ label: "DAY 1", rows: [row("Squat", 3, 3, { pct: "80", rest: "04:00" })] }],
  }),
  miniProgram({
    id: "test-push-pull",
    title: "Push / pull",
    badge: "2 days",
    days: [
      { label: "PUSH", rows: [row("Bench Press", 4, 6)] },
      { label: "PULL", rows: [row("Barbell Row", 4, 8)] },
    ],
  }),
  miniProgram({
    id: "test-accessories",
    title: "Accessories only",
    category: "Accessory",
    days: [
      {
        label: "DAY 1",
        rows: [
          row("Lat Pulldown", 3, 12, { rpe: "8", rest: "01:30" }),
          row("Leg Curl", 3, 12, { rpe: "8", rest: "01:30" }),
        ],
      },
    ],
  }),
  miniProgram({
    id: "test-home-gym",
    title: "Home gym",
    subtitle: "Minimal equipment",
    label: "New lifter",
    category: "Starter",
    days: [{ label: "DAY 1", rows: [row("Bench Press", 3, 10, { load: "95", rest: "02:00" })] }],
  }),
  miniProgram({
    id: "test-4-day-push",
    title: "4-day push focus",
    badge: "4 days",
    category: "Bench",
    days: [
      { label: "DAY 1", rows: [row("Bench Press", 4, 5)] },
      { label: "DAY 2", rows: [row("Close-Grip Bench", 3, 8)] },
      { label: "DAY 3", rows: [row("Squat", 3, 6)] },
      { label: "DAY 4", rows: [row("Overhead Press", 3, 8)] },
    ],
  }),
  miniProgram({
    id: "test-heavy-single",
    title: "Heavy single",
    label: "Classic",
    category: "Percentage",
    days: [{ label: "DAY 1", rows: [row("Deadlift", 1, 1, { pct: "90", rest: "05:00" })] }],
  }),
  miniProgram({
    id: "test-pause-bench",
    title: "Pause bench",
    category: "Bench",
    days: [{ label: "DAY 1", rows: [row("Pause Bench", 4, 4, { pct: "75", rest: "03:00" })] }],
  }),
  miniProgram({
    id: "test-front-squat",
    title: "Front squat day",
    category: "Squat",
    days: [{ label: "DAY 1", rows: [row("Front Squat", 4, 6, { rpe: "7.5", rest: "02:30" })] }],
  }),
  miniProgram({
    id: "test-condensed-sbd",
    title: "Condensed SBD",
    subtitle: "One lift per day",
    label: "Popular",
    badge: "3 days",
    category: "Full strength",
    days: [
      { label: "SQUAT", rows: [row("Squat", 3, 5)] },
      { label: "BENCH", rows: [row("Bench Press", 3, 5)] },
      { label: "DEADLIFT", rows: [row("Deadlift", 3, 5)] },
    ],
  }),
  miniProgram({
    id: "test-6-day",
    title: "6-day frequency",
    badge: "6 days",
    category: "Hypertrophy",
    days: Array.from({ length: 6 }, (_, i) => ({
      label: `DAY ${i + 1}`,
      rows: [row("Bench Press", 2, 8, { rpe: "7", rest: "01:30" })],
    })),
  }),
  miniProgram({
    id: "test-technique",
    title: "Technique day",
    subtitle: "Light singles",
    category: "Technique",
    days: [{ label: "DAY 1", rows: [row("Squat", 5, 3, { pct: "65", rest: "02:00" })] }],
  }),
];
