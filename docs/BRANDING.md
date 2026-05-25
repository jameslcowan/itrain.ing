# Site branding plan (fonts, theme, wording)

Customize **marketing surfaces only** for the three clones. **`sites/powerlifting/`** stays as-is. The **builder** (`app.html`, `app.js`, `state-codec.js`, share URLs) stays the same on all four sites for now.

## Scope

| In scope | Out of scope (later) |
|----------|----------------------|
| `design-tokens.css` (colors, accent) | `app.js` / program schema |
| `fonts.css` + Google font links in HTML | New exercises per sport |
| Landing (`index.html`, `landing.css` hero) | Programs template data (use copy pass only) |
| Meta, OG, JSON-LD, `humans.txt`, `llms.txt` | Analytics |
| Header logo text, nav labels, footer | Netlify/DO vhosts for sister domains |
| FAQ / legal / blog **wording** (domain strings) | Shared `packages/` extract |

## Per-site direction

| Site | Domain | Accent vibe | Display / UI fonts (proposal) | Voice |
|------|--------|-------------|-------------------------------|--------|
| **powerlifting** | powerlift.ing | Plate orange `#ff5c00` | Bebas Neue + DM Sans | Direct, gym floor, SBD |
| **powerbuilding** | powerbuild.ing | Deep red `#c41e3a` or burgundy | Oswald + Source Sans 3 | Hypertrophy, volume, growth |
| **olympiclifting** | olympiclift.ing | Olympic blue `#2563eb` | Barlow Condensed + Inter | Technical, snatch/C&J, precision |
| **bootybuilding** | bootybuild.ing | Coral `#e11d73` or rose | Outfit (display) + Nunito Sans | Friendly, glute-focused, inclusive |

Tune exact hex after first pass in browser (light + dark).

## File checklist (each clone except powerlifting)

Work **top to bottom**; one micro-commit per site per layer is fine.

### 1. Theme — `design-tokens.css`

- Rename header comment to site name.
- Override brand primaries (`--pl-plate` or new `--brand-*` aliases → `--accent`).
- Recompute `--accent-muted`, `--focus-ring`, dark-mode blocks.
- Optional: slight `--bg` / `--panel` tint (warm vs cool) — keep readable.

### 2. Fonts — `fonts.css` + HTML `<link>`

- Pick Google Fonts pair per table above.
- Update `--font-display`, `--sans` in `design-tokens.css`.
- Update `--font-display-fallback` / `--font-sans-fallback` in `fonts.css`.
- Add `<link rel="stylesheet" href="https://fonts.googleapis.com/...">` in:
  - `index.html`
  - `app.html` (mono can stay JetBrains Mono)
  - Built pages: run build after template changes, or patch `blog/templates.mjs` / shared head partial if extracted later.

### 3. Wording — find/replace with judgment

**Global replace (careful):**

- `powerlift.ing` → `powerbuild.ing` / `olympiclift.ing` / `bootybuild.ing`
- `Powerlifting` → `Powerbuilding` / `Olympic lifting` / etc.
- Canonical URLs, `og:url`, sitemap/feed (after build)

**Landing (`index.html` + patched FAQ in `content/faq-data.js`):**

- H1 / hero subhead: sport-specific promise.
- Meta description + keywords.
- JSON-LD `WebSite` / `FAQPage` names.

**Shell (`blog/templates.mjs`, `site/footer.mjs`, menus in templates):**

- Logo wordmark, `©` line, menu credit.

**Programs page** (`programs/build.mjs` title if any; `programs/index.html` H1 via build):

- Page title: “Free … programs” variant.

**Do not change** exercise defaults in `app.js` (still SBD-oriented) until product asks.

### 4. Build + smoke

```bash
npm run build:powerbuilding
npm run dev:powerbuilding   # or npm run dev:all
```

Check: `/`, `/programs/`, `/app`, `/faq/`, light/dark toggle.

## Suggested commit order (micro-commits)

1. `docs/BRANDING.md` (this plan)
2. Dev servers for all sites (root `scripts/`)
3. **powerbuilding** — tokens
4. **powerbuilding** — fonts
5. **powerbuilding** — landing + meta wording
6. **powerbuilding** — shell footer/templates + rebuild
7. Repeat 3–6 for **olympiclifting**
8. Repeat 3–6 for **bootybuilding**
9. `docs/SUITE.md` — note branding status

## Dev servers (all four)

| Site | Command | URL |
|------|---------|-----|
| powerlifting | `npm run dev:powerlifting` | http://127.0.0.1:8080/ |
| powerbuilding | `npm run dev:powerbuilding` | http://127.0.0.1:8081/ |
| olympiclifting | `npm run dev:olympiclifting` | http://127.0.0.1:8082/ |
| bootybuilding | `npm run dev:bootybuilding` | http://127.0.0.1:8083/ |
| All | `npm run dev:all` | ports above |

Run `npm run build:<site>` in each folder before testing generated `/blog/`, `/faq/`, etc.

## Netlify / deploy note

Until sister domains go live, only **powerlifting** deploys to production. Branded clones are local/preview via dev ports.
