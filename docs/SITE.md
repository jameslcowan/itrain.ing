# Site architecture

## Product shape

**powerlift.ing** is a static site on the DigitalOcean droplet (Caddy) plus a client-only program builder. The full program is encoded in shareable URLs — no accounts, no program database on the server for the builder itself.

| Surface | URL | Notes |
|---------|-----|--------|
| Landing | `/` | `index.html` |
| Builder | `/app`, `/app/<STATE>` | `app.html` SPA; shared links **noindex** |
| Legacy builder URLs | `/program/*`, `/p/*` | Redirect to `app.html` |
| Free programs | `/programs/` | Template library (built from `content/programs-data.js`) |
| FAQ | `/faq/`, landing `#faq` | `content/faq-data.js` |
| Blog | `/blog/`, `/blog/<slug>/` | Markdown → HTML |
| Legal | `/terms/`, `/privacy/` | `legal/content.mjs` |
| 404 | (any missing path) | `404.html` at repo root |

Marketing pages share header/footer via `blog/templates.mjs` and `site/footer.mjs`. The builder (`/app`) has its own chrome and **no** site footer.

## URL encoding (public contract)

Shared `<STATE>` in URLs:

1. `JSON.stringify(program)` (v1 schema — see [SEO.md](SEO.md))
2. `LZString.compressToUint8Array`
3. Base64url (`+` → `-`, `/` → `_`, strip `=`)

The app decodes older payloads for backward compatibility. Tests: `tests/codec.test.mjs`.

## Build pipeline

`npm run build` runs, in order:

| Script | Output |
|--------|--------|
| `blog/build.mjs` | `/blog/`, `/sitemap.xml`, `/feed.xml` |
| `faq/build.mjs` | `/faq/`, patches landing `#faq` |
| `legal/build.mjs` | `/terms/`, `/privacy/`, patches landing footer |
| `programs/build.mjs` | `/programs/index.html` |
| `site/build-404.mjs` | `/404.html` |

Individual targets: `npm run build:blog`, `build:faq`, `build:legal`, `build:programs`, `build:404`.

**Commit generated HTML** when you change templates or content sources (same as CI on the droplet).

## Local development

```bash
npm install && npm run build
python scripts/dev-server.py   # http://127.0.0.1:8080
```

The dev server rewrites `/app`, `/app/*`, `/program/*`, and `/p/*` to `app.html` (same rules as Caddy in production). It serves `404.html` for missing paths.

Plain `python -m http.server` only works for `/`; shared program URLs 404 locally.

## Production deployment (DigitalOcean)

- **Build:** `npm ci && npm run build` in `sites/<name>/`
- **Host:** Caddy — `infra/caddy/<domain>.caddy` (SPA rewrites, `noindex` on shared program routes)
- **Publish:** rsync to `/var/www/<domain>/` — [DEPLOY.md](DEPLOY.md)

This repo does **not** use Netlify. Analytics/API: Postgres + PostgREST — [ANALYTICS.md](ANALYTICS.md).

## Conventions for agents

- **Micro-commits:** one logical change per commit (see `.cursor/rules/micro-commits.mdc`)
- **Do not commit:** `.env`, `powerlift.ing.code-workspace`, `node_modules/`
- **Programs data:** edit `content/programs-data.js`, then `npm run build:programs`
