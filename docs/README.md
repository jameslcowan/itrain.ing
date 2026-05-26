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
| [MONOREPO.md](MONOREPO.md) | Panax platform monorepo plan (phases, tree, DB sketch) |
| [SUITE.md](SUITE.md) | Site roster and migration summary |
| [BRANDING.md](BRANDING.md) | Per-site fonts, theme, wording (marketing only) |
| [ANALYTICS.md](ANALYTICS.md) | Analytics ingest (Postgres + PostgREST) |
| [BLOG.md](BLOG.md) | Adding articles, frontmatter, SSG output |
| [SEO.md](SEO.md) | Positioning, indexing rules, URL contract |
| [FIX-LOCAL-CLONE.md](FIX-LOCAL-CLONE.md) | Reset a stale clone after the 2026-05-26 history rewrite |
| [CONTRIBUTIONS-RESTORE.md](CONTRIBUTIONS-RESTORE.md) | GitHub heatmap recovery after the attribution rewrite |
| [GIT-ATTRIBUTION-POLICY.md](GIT-ATTRIBUTION-POLICY.md) | Allowed git identity, hooks, and no-agent rules |
| [TODO.md](TODO.md) | Prioritized backlog and launch checklist |

## Quick commands

```bash
npm run build:powerlifting   # or npm run build:all
npm run dev:all              # :8080–8083 — all suite sites
npm run dev:powerlifting     # single site
./scripts/fix-local-clone.sh # realign a stale clone and enable repo hooks
```

Per-site tests (powerlifting): `cd sites/powerlifting && node --test tests/codec.test.mjs`

## Repo layout (high level)

| Path | Role |
|------|------|
| `sites/powerlifting/` | powerlift.ing — production app |
| `sites/powerbuilding/`, `olympiclifting/`, `bootybuilding/` | Branded clones |
| `scripts/dev-server.py`, `scripts/apply-site-brand.mjs` | Local dev + branding tool |
| `docs/`, `infra/`, `.github/` | Monorepo docs and deploy |
