# Suite branding plan

Marketing-only customization for the three clones. **`sites/powerlifting/`** is the reference (unchanged look). The **builder** (`app.js`, program schema, templates data) stays shared until product asks otherwise.

## Status

| Site | Domain | Branding | Deploy |
|------|--------|----------|--------|
| powerlifting | powerlift.ing | Reference | Production (DO) |
| powerbuilding | powerbuild.ing | Done | Local / preview |
| olympiclifting | olympiclift.ing | Done | Local / preview |
| bootybuilding | bootybuild.ing | Done | Local / preview |

## What changed per clone

- **Theme:** `design-tokens.css` (accent, surfaces, fonts)
- **Fonts:** `fonts.css` + Google Fonts in HTML / `blog/templates.mjs`
- **Copy:** `index.html` hero, meta, FAQ (`content/faq-data.js` + build), legal, blog articles, programs page titles, footer, 404, `llms.txt` / `ai.txt`
- **Assets:** `favicon.svg` (accent bar)
- **Shell:** `content/site-brand.js` drives `blog/templates.mjs`, `site/footer.mjs`, builds

## Brand tokens

| Site | Accent | Display / UI fonts |
|------|--------|-------------------|
| powerlifting | `#ff5c00` | Bebas Neue + DM Sans |
| powerbuilding | `#c41e3a` | Oswald + Source Sans 3 |
| olympiclifting | `#2563eb` | Barlow Condensed + Inter |
| bootybuilding | `#e11d73` | Outfit + Nunito Sans |

Definitions live in [`scripts/site-brands.mjs`](../scripts/site-brands.mjs). Re-apply after editing:

```bash
node scripts/apply-site-brand.mjs powerbuilding
npm run build:powerbuilding
```

## Dev & build

```bash
npm run dev:all                 # :8080–8083
npm run build:all               # all four sites
npm run dev:powerbuilding       # single site
```

Run `npm ci` once inside each new clone under `sites/<name>/` before the first build.

Verify clones contain no `powerlift.ing` in marketing files:

```bash
npm run audit:clones
```

## Out of scope (later)

- `app.js` exercise defaults / sport-specific lifts
- Shared `packages/` extract
- Matrix deploy + Caddy vhosts for sister domains
- Postgres analytics (`site_id`)
- Deep program template curation per sport

## Production note

Only **powerlifting** deploys via GitHub Actions today. Sister domains are previewed on local dev ports until DNS and matrix deploy are added (see [DEPLOY.md](DEPLOY.md), [MONOREPO.md](MONOREPO.md)).
