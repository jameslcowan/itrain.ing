# powerlift.ing (vanilla MVP)

Static, zero-build web app for building a powerlifting program where **the entire program state lives in the URL** (shareable links).

## What this is
- **Vanilla**: `index.html` + `app.css` + `app.js` (no React/Vue/Svelte, no build step)
- **Netlify-ready**: static publish from repo root
- **Shareable links**: edits update the URL; opening the link recreates the exact program

## Routing (state-in-URL)
The program is encoded into the URL as compressed JSON.

- **Default (hash)**: `/#/p/<STATE>`
- **Optional pretty path**: `/p/<STATE>` (works on Netlify due to redirects)

## State encoding
State is JSON (see schema below), compressed with `lz-string`, then base64url encoded.

- `encodeState(state) -> string`
- `decodeState(string) -> state`

URLs update on edits using `history.replaceState()` with a debounce.

## Program state model (v1)

```json
{
  "v": 1,
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
- `c` (top-level) is the **mesocycle list** (names).
- `weeks[].c` is the **mesocycle index** this week belongs to.
- Row keys are kept short for URL size.

## Theme
- Defaults to **device preference** (`prefers-color-scheme`).
- User can toggle **light/dark** using the header icon.
- Theme choice is stored in `localStorage` (not in the share link).

## Local usage
No build step. Open `index.html` directly, or run any static server.

Example (PowerShell):
```powershell
python -m http.server 8080
```
Then open `http://localhost:8080`.

## Deployment (Netlify)
- Publishes from repo root (`.`)
- `netlify.toml` includes redirects so `/p/<STATE>` works.

## Files
- `index.html` – page shell
- `app.css` – theme + layout
- `app.js` – state, routing, rendering, event handlers
- `vendor/lz-string.min.js` – compression
- `netlify.toml` – redirects for SPA routing


