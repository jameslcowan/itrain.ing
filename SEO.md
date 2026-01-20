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
- Hash route (default): `/#/p/<STATE>`
- Pretty path route: `/p/<STATE>` (works on Netlify via redirects)

Where `<STATE>` is an encoded program payload.

**Important:** We intentionally keep the encoded payload as a single URL segment so it can be copied/shared reliably.

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
- Program links (`/p/<STATE>`) **not indexable** (user-generated, infinite, and not useful as search results)

Implementation notes:
- Netlify sends `X-Robots-Tag: noindex...` on `/p/*`.
- `robots.txt` exists and references `sitemap.xml`.

---

## Future: landing page + premade programs

When we add a landing page and premade programs, we should:
- Keep the homepage as the canonical marketing entry point.
- Add dedicated, indexable pages for premade templates (with stable URLs).
- Link templates to generated `/p/<STATE>` URLs for “open in builder” actions, while keeping `/p/*` itself noindex.

