# powerlift.ing

Static, zero-build program builder where **the entire program lives in the URL** (shareable links).

## What this is
- Vanilla `index.html` + `app.css` + `app.js` (no framework, no build step)
- Client-only (no accounts, no backend)
- Sharing = copy the URL

## Routing (public contract)
- **Default (current)**: `/program/<STATE>`
- **Legacy (still works)**: `/p/<STATE>`
- **Legacy (still works)**: `/#/p/<STATE>`

The app updates the URL as you edit via `history.replaceState()` (no page reload).

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

## Local usage
No build step. Run any static server:

```powershell
python -m http.server 8080
```

## Deployment (Netlify)
Publishes from repo root (`.`). `netlify.toml` routes `/program/*` and `/p/*` to `index.html`.


