# Monorepo plan — itrain.ing

Umbrella platform for the `.ing` app family. **Product domains stay the brands**; this repo is the single source of truth for code, deploy, and shared backend.

## Goals

| Goal | How |
|------|-----|
| One VPS, many vhosts | `infra/caddy/*.caddy` + `/var/www/<domain>/` |
| Shared analytics + DB | `services/analytics/` + Postgres `site_id` |
| Copy a site to launch another | `sites/<domain>/` from powerlift template |
| Safe migration | DNS cutover per domain; legacy Netlify repo retired separately |

## Target tree

```text
itrain.ing/                          # GitHub repo name (rename from powerlift.ing)
├── README.md                        # Suite overview + links to sites
├── package.json                     # Optional root scripts only (no app code at root)
├── docs/
│   ├── MONOREPO.md                  # This file
│   ├── SUITE.md                     # Site roster + status
│   ├── DEPLOY.md                    # Droplet + GitHub Actions
│   ├── ANALYTICS.md
│   └── …
├── sites/
│   ├── powerlifting/                # powerlift.ing (moved from repo root)
│   ├── powerbuilding/               # powerbuild.ing (copy — rebrand TBD)
│   ├── olympiclifting/              # olympiclift.ing (copy — rebrand TBD)
│   └── bootybuilding/               # bootybuild.ing (copy — rebrand TBD)
├── packages/                        # Shared libraries (extract over time)
│   ├── tokens/                      # design-tokens.css, fonts.css
│   ├── site-shell/                  # header, footer, menu, theme.js
│   └── codec/                       # state-codec (if identical across apps)
├── services/
│   └── analytics/                   # Ingest API, migrations, admin (later)
│       ├── package.json
│       ├── migrations/
│       └── README.md
└── infra/
    ├── caddy/                       # One file per public domain
    ├── deploy/
    │   ├── rsync-excludes.txt
    │   └── github/                  # Reusable workflow fragments
    └── systemd/                     # analytics.service, etc. (later)
```

**Not at repo root:** app code — only under `sites/<name>/`.

## Site identity

| `site_id` (DB / analytics) | Domain | Folder |
|----------------------------|--------|--------|
| `powerlift` | powerlift.ing | `sites/powerlifting/` |
| `olympiclift` | olympiclift.ing | `sites/olympiclifting/` |
| `powerbuild` | powerbuild.ing | `sites/powerbuilding/` |
| `bootybuild` | bootybuild.ing | `sites/bootybuilding/` |

Optional later: `itrain` for a hub at itrain.ing (marketing only).

## Phased migration

### Phase 0 — Deploy powerlifting

- [x] Repo → `itrain.ing` on GitHub
- [x] App under `sites/powerlifting/` (+ sister copies)
- [x] `infra/caddy`, deploy workflow → `sites/powerlifting/`
- [ ] DO droplet live for powerlift.ing (see [DEPLOY.md](DEPLOY.md))
- [ ] GitHub Actions secrets + green deploy

### Phase 1 — Rename repo

Done: **itrain.ing** repo exists.

### Phase 2 — Move powerlift into `sites/`

Done: **`sites/powerlifting/`** (+ copies `powerbuilding`, `olympiclifting`, `bootybuilding`).

<details>
<summary>Original Phase 2 git mv notes (historical)</summary>

One PR, single focus:

```bash
# Illustrative — run from repo root with care; preserve git history via git mv
git mv app.html app.js app.css index.html landing.css landing.js landing-boot.js \
  theme.js fonts.css fonts-boot.js design-tokens.css site-header.css site-menu.css \
  site-footer.css site-404.css programs.css programs.js state-codec.js maxes.js \
  blog.css faq.css legal.css 404.html robots.txt sitemap.xml feed.xml favicon.svg \
  ai.txt llms.txt humans.txt _redirects netlify.toml package.json package-lock.json \
  content blog faq legal programs site scripts tests vendor .well-known \
  sites/powerlift.ing/
```

Then fix:

| Area | Change |
|------|--------|
| `.github/workflows/deploy.yml` | `path: sites/powerlift.ing/`, `remote_path` unchanged |
| `infra/deploy/rsync-excludes.txt` | Exclude `sites/olympiclift.ing` etc. from powerlift deploy — deploy **one site dir only** |
| `scripts/dev-server.py` | Run from `sites/powerlift.ing/` or accept `--root` flag |
| Root `README.md` | Pointer to `sites/powerlift.ing/` |
| Netlify | Base directory: `sites/powerlift.ing` |
| Internal imports | Grep for paths assuming repo root (unlikely) |

Add root `package.json` scripts:

```json
{
  "name": "itrain.ing",
  "private": true,
  "scripts": {
    "build:powerlift": "npm run build --prefix sites/powerlift.ing",
    "dev:powerlift": "python scripts/dev-server.py --site powerlift.ing"
  }
}
```

</details>

### Phase 3 — Multi-site deploy

Replace single workflow with **one job per site** (or matrix):

```yaml
strategy:
  matrix:
    site: [powerlift.ing]   # add olympiclift.ing when ready
```

Each site:

- `working-directory: sites/${{ matrix.site }}`
- `npm ci && npm run build`
- rsync to `/var/www/${{ matrix.site }}/`
- `infra/caddy/${{ matrix.site }}.caddy` on server

Path filter (optional): only deploy a site when its folder changes.

### Phase 4 — Extract `packages/`

Order by payoff:

1. **`packages/tokens`** — `design-tokens.css`, shared CSS variables.
2. **`packages/site-shell`** — `site-header.css`, `site-menu.css`, `footer.mjs`, `theme.js`.
3. **`packages/codec`** — if all builders share URL encoding.

Consumption: copy built CSS into sites at first; later `npm workspace` or simple relative imports (`@itrain/tokens`).

### Phase 5 — `services/analytics` + Postgres

On the droplet (or DO Managed DB later):

```sql
-- sketch
CREATE TABLE sites (
  id TEXT PRIMARY KEY,
  domain TEXT NOT NULL
);

CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  site_id TEXT REFERENCES sites(id),
  path TEXT,
  event TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

- Small Node/Bun/Go service on `127.0.0.1:PORT`.
- Caddy route `handle /collect` → reverse_proxy analytics.
- Front-end snippet in `packages/site-shell` or per-site `analytics.js` (privacy policy update).

Bump droplet to **2 GB+** when Postgres runs on-box (see deploy sizing notes in conversation / DEPLOY.md).

### Phase 6 — Clone next site

For each new domain:

1. Copy `sites/powerlift.ing/` → `sites/<domain>/`.
2. Replace brand strings, `content/programs-data.js`, FAQ, meta, Caddy hostnames.
3. Add matrix entry + Caddy file + DNS.
4. Register `site_id` in DB seed.

## What stays separate per site

- Program templates (`content/programs-data.js`)
- FAQ copy, blog posts, landing hero, SEO positioning
- `netlify.toml` / product-specific redirects (SPA paths may differ later)

## What merges shared

- Deploy pattern, Caddy SPA + 404 pattern
- Analytics ingest + dashboard auth
- Header/footer/menu chrome (after package extract)
- Codec / app shell (if identical)

## Decisions (locked for v1)

| Decision | Choice |
|----------|--------|
| Repo name | `itrain.ing` |
| Monorepo layout | `sites/<domain>/` + `services/` + `infra/` |
| First production site | powerlift.ing only |
| Host | DigitalOcean droplet, Debian 13, Caddy |
| DB | Postgres + PostgREST on droplet (`site_id` column) |
| Netlify | **Not used** — this monorepo is DO-only |

## Open questions

- [ ] Register **itrain.ing** domain — hub page or repo-only?
- [ ] **Managed Postgres** on DO vs on-droplet Postgres?
- [ ] **Bun vs Node** for analytics API?
- [ ] Single GitHub Environment `production` vs per-site secrets?

## Related docs

- [SUITE.md](SUITE.md) — roster and status table
- [DEPLOY.md](DEPLOY.md) — droplet setup (update paths after Phase 2)
- [ANALYTICS.md](ANALYTICS.md) — analytics intent
- [TODO.md](TODO.md) — actionable checklist
