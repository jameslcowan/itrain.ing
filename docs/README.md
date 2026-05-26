# itrain.ing documentation

Monorepo docs: suite plan, deploy, and powerlift.ing product details.

**Context from prior workspace:** [HANDOFF.md](HANDOFF.md)

| Doc | Purpose |
|-----|---------|
| [SITE.md](SITE.md) | Architecture, routes, build pipeline, local dev, DO deploy |
| [DATABASE.md](DATABASE.md) | Postgres + PostgREST (multisite) |
| [DNS.md](DNS.md) | Porkbun DNS cutover (when ready) |
| [GITHUB-ACTIONS.md](GITHUB-ACTIONS.md) | CI deploy workflow + secrets |
| [DEPLOY.md](DEPLOY.md) | DigitalOcean droplet, GitHub Actions, DNS cutover |
| [MONOREPO.md](MONOREPO.md) | itrain.ing monorepo plan (phases, tree, DB sketch) |
| [SUITE.md](SUITE.md) | Site roster and migration summary |
| [BRANDING.md](BRANDING.md) | Per-site fonts, theme, wording (marketing only) |
| [ANALYTICS.md](ANALYTICS.md) | Analytics ingest (Postgres + PostgREST) |
| [BLOG.md](BLOG.md) | Adding articles, frontmatter, SSG output |
| [SEO.md](SEO.md) | Positioning, indexing rules, URL contract |
| [TODO.md](TODO.md) | Prioritized backlog and launch checklist |

## Quick commands

```bash
npm run build:powerlifting   # or npm run build:all
npm run dev:all              # :8080–8083 — all suite sites
npm run dev:powerlifting     # single site
```

Per-site tests (powerlifting): `cd sites/powerlifting && node --test tests/codec.test.mjs`

## Repo layout (high level)

| Path | Role |
|------|------|
| `sites/powerlifting/` | powerlift.ing — production app |
| `sites/powerbuilding/`, `olympiclifting/`, `bootybuilding/` | Branded clones |
| `scripts/dev-server.py`, `scripts/apply-site-brand.mjs` | Local dev + branding tool |
| `docs/`, `infra/`, `.github/` | Monorepo docs and deploy |
