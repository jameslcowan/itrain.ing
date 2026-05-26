# Monorepo plan — Panax platform

**Panax** ([panax.ai](https://panax.ai)) owns the portfolio. **Product domains** (powerlift.ing, itrain.ing, …) stay separate brands; this repo is the single source for code, deploy, and shared backend.

## Goals

| Goal | How |
|------|-----|
| One VPS, many vhosts | `infra/caddy/*.caddy` + `/var/www/<domain>/` |
| Shared analytics + DB | Postgres `platform_id = panax`, `site_id` per product |
| Copy a site to launch another | `sites/<folder>/` from powerlift template |
| Safe migration | DNS cutover per domain |

## Target tree

```text
panax/                             # GitHub: jameslcowan/panax — clone at ~/panax
├── README.md
├── docs/                          # PANAX-VISION, DNS, DEPLOY, …
├── sites/
│   ├── powerlifting/              # powerlift.ing
│   ├── powerbuilding/             # powerbuild.ing
│   ├── olympiclifting/            # olympiclift.ing
│   ├── bootybuilding/             # bootybuild.ing
│   └── itraining/                 # itrain.ing (product)
├── packages/                      # analytics, codec, …
├── services/db/migrations/
└── infra/
    ├── caddy/                     # panax.ai, api.panax.ai, *.ing products
    └── server/
```

## Site identity

| `site_id` | Domain | Folder |
|-----------|--------|--------|
| `powerlift` | powerlift.ing | `sites/powerlifting/` |
| `powerbuild` | powerbuild.ing | `sites/powerbuilding/` |
| `olympiclift` | olympiclift.ing | `sites/olympiclifting/` |
| `bootybuild` | bootybuild.ing | `sites/bootybuilding/` |
| `itrain` | itrain.ing | `sites/itraining/` |
| `panax` | panax.ai | placeholder `infra/www/panax.ai/` (app TBD) |

## Phased migration

Phases 0–3 (deploy, `sites/`, matrix workflow) are largely done. See [TODO.md](TODO.md) for DNS, panax AI app, shared accounts, and product polish.
