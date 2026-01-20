# SEO + AI notes (editable)

This file is the **human-editable source of truth** for how `powerlift.ing` should be described for:
- Search engines (SEO / social previews / structured data)
- AI agents/tools that want to generate and share programs using our routing contract

The app’s runtime behavior and routing contract **must not change** (existing shared links depend on it).

---

## Product description (recommended wording)

**powerlift.ing** is a shareable powerlifting program builder.

- No accounts.
- The program is stored in the link itself (state-in-URL).
- You can send a link to a coach/training partner and they’ll see the exact same plan.

Author/creator:
- **James L. Cowan** (**@jameslcowan**) — `https://jameslcowan.com/`
- Source: `https://github.com/jameslcowan/powerlift.ing`

---

## Routing + state-in-URL (public contract)

Supported URL formats:
- **Current (default)**: `/program/<STATE>` - Clean, descriptive path
- **Legacy (still works)**: `/#/p/<STATE>` - Old hash format
- **Legacy (still works)**: `/p/<STATE>` - Old path format

Where `<STATE>` is an encoded program payload (V2 format = 30-40% shorter than V1).

**Important:** We intentionally keep the encoded payload as a single URL segment so it can be copied/shared reliably.

All legacy formats continue to work indefinitely for backward compatibility.

---

## Encoding contract (v1)

Program state is JSON, compressed using `lz-string`, then base64url encoded.

High-level steps:
1. `JSON.stringify(state)`
2. `LZString.compressToUint8Array(json)`
3. Convert bytes -> base64
4. Convert base64 -> base64url:
   - replace `+` with `-`
   - replace `/` with `_`
   - remove `=` padding

Decoding reverses the above.

---

## Program state schema (v1)

```json
{
  "v": 1,
  "u": "lb",
  "c": [{ "n": "Meso 1" }],
  "weeks": [
    {
      "c": 0,
      "days": [
        {
          "label": "DAY 1 - MON",
          "rows": [
            { "ex": "", "mode": "", "sets": "", "reps": "", "load": "", "pct": "", "rpe": "", "rest": "" }
          ]
        }
      ]
    }
  ]
}
```

Notes:
- Keys are short for URL size.
- Numeric values are stored as strings.

---

## Example program JSON (copy/paste)

This is a complete example that follows the schema and is intentionally minimal.

```json
{
  "v": 1,
  "u": "kg",
  "c": [{ "n": "Meso 1" }],
  "weeks": [
    {
      "c": 0,
      "days": [
        {
          "label": "DAY 1 - MON",
          "rows": [
            { "ex": "Squat", "mode": "", "sets": "4", "reps": "5", "load": "", "pct": "", "rpe": "7.5", "rest": "03:00" },
            { "ex": "Bench Press", "mode": "", "sets": "4", "reps": "6", "load": "", "pct": "", "rpe": "7.5", "rest": "02:30" },
            { "ex": "Row", "mode": "", "sets": "3", "reps": "10", "load": "", "pct": "", "rpe": "8", "rest": "02:00" }
          ]
        },
        {
          "label": "DAY 2 - WED",
          "rows": [
            { "ex": "Deadlift", "mode": "", "sets": "3", "reps": "5", "load": "", "pct": "", "rpe": "7.5", "rest": "03:30" },
            { "ex": "Overhead Press", "mode": "", "sets": "3", "reps": "8", "load": "", "pct": "", "rpe": "8", "rest": "02:00" },
            { "ex": "Lat Pulldown", "mode": "", "sets": "3", "reps": "10", "load": "", "pct": "", "rpe": "8", "rest": "02:00" }
          ]
        },
        {
          "label": "DAY 3 - FRI",
          "rows": [
            { "ex": "Squat", "mode": "Paused (2s)", "sets": "3", "reps": "4", "load": "", "pct": "", "rpe": "8", "rest": "03:00" },
            { "ex": "Bench Press", "mode": "Paused (1s)", "sets": "3", "reps": "5", "load": "", "pct": "", "rpe": "8", "rest": "02:30" },
            { "ex": "Romanian Deadlift", "mode": "", "sets": "3", "reps": "8", "load": "", "pct": "", "rpe": "8", "rest": "02:30" }
          ]
        }
      ]
    }
  ]
}
```

To make a 4-week program, duplicate the single week object 4 times in `weeks[]` (changing RPE/sets/reps week-to-week as desired).

---

## Full schema example (multi-mesocycle, 4 weeks each, 4 days/week)

This example is intentionally “complete” to show:
- Multiple mesocycles (`c[]`)
- Weeks assigned to mesocycles (`weeks[].c`)
- 4-day labels using the standard preset (MON/TUE/THU/FRI)
- Both `load` and `%1RM` usage, plus `rpe` and `rest`

```json
{
  "v": 1,
  "u": "kg",
  "c": [{ "n": "Hypertrophy" }, { "n": "Strength" }],
  "weeks": [
    { "c": 0, "days": [
      { "label": "DAY 1 - MON", "rows": [
        { "ex": "Squat", "mode": "High bar", "sets": "4", "reps": "8", "load": "100", "pct": "", "rpe": "7.5", "rest": "03:00" },
        { "ex": "Bench Press", "mode": "", "sets": "4", "reps": "8", "load": "70", "pct": "", "rpe": "7.5", "rest": "02:30" },
        { "ex": "Lat Pulldown", "mode": "", "sets": "3", "reps": "12", "load": "", "pct": "", "rpe": "8", "rest": "02:00" }
      ]},
      { "label": "DAY 2 - TUE", "rows": [
        { "ex": "Deadlift", "mode": "", "sets": "3", "reps": "6", "load": "140", "pct": "", "rpe": "7.5", "rest": "03:30" },
        { "ex": "Overhead Press", "mode": "", "sets": "3", "reps": "10", "load": "", "pct": "", "rpe": "8", "rest": "02:00" },
        { "ex": "Split Squat", "mode": "", "sets": "3", "reps": "10", "load": "", "pct": "", "rpe": "8", "rest": "02:00" }
      ]},
      { "label": "DAY 3 - THU", "rows": [
        { "ex": "Bench Press", "mode": "Paused (1s)", "sets": "4", "reps": "6", "load": "", "pct": "75", "rpe": "8", "rest": "02:30" },
        { "ex": "Squat", "mode": "Tempo", "sets": "3", "reps": "6", "load": "", "pct": "70", "rpe": "8", "rest": "03:00" },
        { "ex": "Row", "mode": "Chest-supported", "sets": "3", "reps": "10", "load": "", "pct": "", "rpe": "8", "rest": "02:00" }
      ]},
      { "label": "DAY 4 - FRI", "rows": [
        { "ex": "Deadlift", "mode": "Paused (1s)", "sets": "3", "reps": "5", "load": "", "pct": "75", "rpe": "8", "rest": "03:30" },
        { "ex": "Bench Press", "mode": "Close grip", "sets": "3", "reps": "8", "load": "", "pct": "", "rpe": "8", "rest": "02:30" },
        { "ex": "Hamstring Curl", "mode": "", "sets": "3", "reps": "12", "load": "", "pct": "", "rpe": "8", "rest": "01:30" }
      ]}
    ]},

    { "c": 0, "days": [ { "label": "DAY 1 - MON", "rows": [ { "ex": "Squat", "mode": "High bar", "sets": "4", "reps": "8", "load": "102", "pct": "", "rpe": "8", "rest": "03:00" } ] }, { "label": "DAY 2 - TUE", "rows": [ { "ex": "Deadlift", "mode": "", "sets": "3", "reps": "6", "load": "145", "pct": "", "rpe": "8", "rest": "03:30" } ] }, { "label": "DAY 3 - THU", "rows": [ { "ex": "Bench Press", "mode": "Paused (1s)", "sets": "4", "reps": "6", "load": "", "pct": "77", "rpe": "8.5", "rest": "02:30" } ] }, { "label": "DAY 4 - FRI", "rows": [ { "ex": "Deadlift", "mode": "Paused (1s)", "sets": "3", "reps": "5", "load": "", "pct": "77", "rpe": "8.5", "rest": "03:30" } ] } ] },
    { "c": 0, "days": [ { "label": "DAY 1 - MON", "rows": [ { "ex": "Squat", "mode": "High bar", "sets": "4", "reps": "6", "load": "105", "pct": "", "rpe": "8.5", "rest": "03:00" } ] }, { "label": "DAY 2 - TUE", "rows": [ { "ex": "Deadlift", "mode": "", "sets": "3", "reps": "5", "load": "150", "pct": "", "rpe": "8.5", "rest": "03:30" } ] }, { "label": "DAY 3 - THU", "rows": [ { "ex": "Bench Press", "mode": "Paused (1s)", "sets": "4", "reps": "5", "load": "", "pct": "80", "rpe": "8.5", "rest": "02:30" } ] }, { "label": "DAY 4 - FRI", "rows": [ { "ex": "Deadlift", "mode": "Paused (1s)", "sets": "3", "reps": "4", "load": "", "pct": "80", "rpe": "8.5", "rest": "03:30" } ] } ] },
    { "c": 0, "days": [ { "label": "DAY 1 - MON", "rows": [ { "ex": "Squat", "mode": "High bar", "sets": "3", "reps": "6", "load": "107", "pct": "", "rpe": "9", "rest": "03:00" } ] }, { "label": "DAY 2 - TUE", "rows": [ { "ex": "Deadlift", "mode": "", "sets": "2", "reps": "5", "load": "155", "pct": "", "rpe": "9", "rest": "03:30" } ] }, { "label": "DAY 3 - THU", "rows": [ { "ex": "Bench Press", "mode": "Paused (1s)", "sets": "3", "reps": "5", "load": "", "pct": "82", "rpe": "9", "rest": "02:30" } ] }, { "label": "DAY 4 - FRI", "rows": [ { "ex": "Deadlift", "mode": "Paused (1s)", "sets": "2", "reps": "4", "load": "", "pct": "82", "rpe": "9", "rest": "03:30" } ] } ] },

    { "c": 1, "days": [ { "label": "DAY 1 - MON", "rows": [ { "ex": "Squat", "mode": "", "sets": "4", "reps": "5", "load": "", "pct": "80", "rpe": "7.5", "rest": "03:30" } ] }, { "label": "DAY 2 - TUE", "rows": [ { "ex": "Deadlift", "mode": "", "sets": "3", "reps": "4", "load": "", "pct": "80", "rpe": "7.5", "rest": "04:00" } ] }, { "label": "DAY 3 - THU", "rows": [ { "ex": "Bench Press", "mode": "Paused (1s)", "sets": "3", "reps": "4", "load": "", "pct": "82", "rpe": "8", "rest": "03:00" } ] }, { "label": "DAY 4 - FRI", "rows": [ { "ex": "Deadlift", "mode": "Paused (1s)", "sets": "2", "reps": "3", "load": "", "pct": "82", "rpe": "8", "rest": "04:00" } ] } ] },
    { "c": 1, "days": [ { "label": "DAY 1 - MON", "rows": [ { "ex": "Squat", "mode": "", "sets": "4", "reps": "4", "load": "", "pct": "83", "rpe": "8", "rest": "03:30" } ] }, { "label": "DAY 2 - TUE", "rows": [ { "ex": "Deadlift", "mode": "", "sets": "3", "reps": "3", "load": "", "pct": "83", "rpe": "8", "rest": "04:00" } ] }, { "label": "DAY 3 - THU", "rows": [ { "ex": "Bench Press", "mode": "Paused (1s)", "sets": "3", "reps": "3", "load": "", "pct": "85", "rpe": "8.5", "rest": "03:00" } ] }, { "label": "DAY 4 - FRI", "rows": [ { "ex": "Deadlift", "mode": "Paused (1s)", "sets": "2", "reps": "3", "load": "", "pct": "85", "rpe": "8.5", "rest": "04:00" } ] } ] },
    { "c": 1, "days": [ { "label": "DAY 1 - MON", "rows": [ { "ex": "Squat", "mode": "", "sets": "4", "reps": "3", "load": "", "pct": "86", "rpe": "8.5", "rest": "03:30" } ] }, { "label": "DAY 2 - TUE", "rows": [ { "ex": "Deadlift", "mode": "", "sets": "3", "reps": "2", "load": "", "pct": "86", "rpe": "8.5", "rest": "04:00" } ] }, { "label": "DAY 3 - THU", "rows": [ { "ex": "Bench Press", "mode": "Paused (1s)", "sets": "3", "reps": "2", "load": "", "pct": "88", "rpe": "9", "rest": "03:00" } ] }, { "label": "DAY 4 - FRI", "rows": [ { "ex": "Deadlift", "mode": "Paused (1s)", "sets": "2", "reps": "2", "load": "", "pct": "88", "rpe": "9", "rest": "04:00" } ] } ] },
    { "c": 1, "days": [ { "label": "DAY 1 - MON", "rows": [ { "ex": "Squat", "mode": "", "sets": "3", "reps": "2", "load": "", "pct": "90", "rpe": "9", "rest": "03:30" } ] }, { "label": "DAY 2 - TUE", "rows": [ { "ex": "Deadlift", "mode": "", "sets": "2", "reps": "2", "load": "", "pct": "90", "rpe": "9", "rest": "04:00" } ] }, { "label": "DAY 3 - THU", "rows": [ { "ex": "Bench Press", "mode": "Paused (1s)", "sets": "2", "reps": "2", "load": "", "pct": "92", "rpe": "9", "rest": "03:00" } ] }, { "label": "DAY 4 - FRI", "rows": [ { "ex": "Deadlift", "mode": "Paused (1s)", "sets": "2", "reps": "2", "load": "", "pct": "92", "rpe": "9", "rest": "04:00" } ] } ] }
  ]
}
```

For a fully expanded version of this same structure (with more rows per day), see `ai.txt` and `ai.html`.

---

## What we publish for AI agents (llms.txt)

We publish a machine-readable guide at `llms.txt` (kept in sync with this document) that includes:
- Routing formats
- Encoding details
- Schema
- Indexing guidance

If you update wording here, update `llms.txt` to match.

---

## Indexing guidance (SEO hygiene)

We want:
- Homepage (`/`) indexable
- Program links (`/program/<STATE>` and `/p/<STATE>`) **not indexable** (user-generated, infinite, and not useful as search results)

Implementation notes:
- Netlify sends `X-Robots-Tag: noindex...` on `/program/*` and `/p/*`.
- `robots.txt` exists and references `sitemap.xml`.
- All user-generated share links are noindex by default.

---

## Future: landing page + premade programs

When we add a landing page and premade programs, we should:
- Keep the homepage as the canonical marketing entry point.
- Add dedicated, indexable pages for premade templates (with stable URLs).
- Link templates to generated `/p/<STATE>` URLs for “open in builder” actions, while keeping `/p/*` itself noindex.

