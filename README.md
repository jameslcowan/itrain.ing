# powerlift.ing

Static, zero-build program builder where **the entire program lives in the URL** (shareable links).

## What this is
- Marketing landing at `/` (`index.html`, `landing.css`, `landing.js`)
- Program builder at `/app` (`app.html`, `app.css`, `app.js`, `state-codec.js`, `theme.js`)
- Client-only (no accounts, no backend yet)
- Sharing = copy the URL

## Routing (public contract)
- **Landing (indexed)**: `/`
- **Builder**: `/app` → `app.html`
- **Shared program (noindex)**: `/app/<STATE>` (legacy `/program/<STATE>` and `/p/<STATE>` still work)
- **Legacy (still works)**: `/p/<STATE>`, `/#/p/<STATE>`

The builder updates the URL as you edit via `history.replaceState()` (no page reload).

## Encoding (public contract)
`<STATE>` is compressed JSON:
- `JSON.stringify(state)`
- `LZString.compressToUint8Array(...)`
- base64url encode (replace `+`→`-`, `/`→`_`, remove `=` padding)

The app **decodes both older and newer payloads** for backward compatibility.

## Program JSON (authoring schema, v1)
This is the JSON shape the UI works with (keys are short to keep links small):

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

## Tests
```bash
node --test tests/codec.test.mjs
```

## Local usage
No build step. Use the dev server so `/app`, `/app/*`, and legacy `/program/*` match production:

```bash
python scripts/dev-server.py
```

Plain `python -m http.server` only serves `/`; shared `/app/…` links will 404 locally.

## Deployment (Netlify)
Publishes from repo root (`.`). `netlify.toml` routes `/app`, `/app/*`, legacy `/program/*`, and `/p/*` to `app.html`. `/` serves `index.html`.


