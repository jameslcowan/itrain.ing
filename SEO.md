# SEO + AI notes (editable)

Less is more. This is the short positioning + the non-negotiable URL contract.

## Positioning (recommended)
**powerlift.ing** is the **best free powerlifting program builder**.

Build a squat/bench/deadlift (SBD) program fast, then share it as a single link.
- Free, no signup
- Mobile-first
- Coach/training-partner friendly

Use common powerlifting terms naturally (don’t spam):
- powerlifting program, powerlifting program builder, strength program, workout program
- periodization, mesocycle, hypertrophy, strength block, peaking, meet prep
- RPE, %1RM, squat bench deadlift

Creator/credit:
- James L. Cowan (@jameslcowan) — https://x.com/jameslcowan

## Routing + state-in-URL (public contract)
- Current (default): `/app/<STATE>`
- Legacy (still works): `/p/<STATE>`
- Legacy (still works): `/#/p/<STATE>`

The app updates the URL as you edit (`history.replaceState`). Existing shared links must keep working.

## Program JSON schema (authoring shape, v1)
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

## Indexing guidance
- Index `/`, `/blog/`, `/blog/*`
- Noindex `/app/*`, `/program/*`, and `/p/*` (user-generated, effectively infinite)

