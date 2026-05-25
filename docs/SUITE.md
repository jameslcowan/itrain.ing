# Lifting apps suite (itrain.ing)

Platform monorepo for the `.ing` family. Full plan: **[MONOREPO.md](MONOREPO.md)**.

## Sites

| Site | Folder | Status |
|------|--------|--------|
| [powerlift.ing](https://powerlift.ing) | `sites/powerlift.ing/` (repo root until Phase 2) | Live (Netlify) → DO in progress |
| olympiclift.ing | `sites/olympiclift.ing/` | Scaffold |
| powerbuild.ing | `sites/powerbuild.ing/` | Scaffold |
| bootybuild.ing | `sites/bootybuild.ing/` | Scaffold |

## Migration phase (summary)

| Phase | What |
|-------|------|
| **0** | Deploy current layout to DO; prove GitHub Actions |
| **1** | Rename GitHub repo → `itrain.ing` |
| **2** | `git mv` app into `sites/powerlift.ing/` |
| **3** | Matrix deploy per site |
| **4** | Extract `packages/*` |
| **5** | `services/analytics` + Postgres |
| **6** | Clone next product site |

## Shared stack (target)

- **Edge:** Caddy on one DigitalOcean droplet (`infra/caddy/`)
- **Deploy:** GitHub Actions → rsync per site (`infra/deploy/`)
- **Data:** Postgres + `site_id` — see [ANALYTICS.md](ANALYTICS.md)

## Adding a new site

See [MONOREPO.md — Phase 6](MONOREPO.md#phase-6--clone-next-site).
