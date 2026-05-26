# Session handoff — Panax platform monorepo

Open **`~/panax`** or **`~/itrain.ing`** (same clone until [RENAME.md](RENAME.md) is done).

## What this repo is

- **Panax** ([panax.ai](https://panax.ai)) — platform brand; future mega AI app + shared accounts.
- **Product apps** — powerlift.ing, itrain.ing, etc. under `sites/`; each has its own domain and `site_id`.
- **This repository** — single deploy unit for all products + shared Postgres/PostgREST.

See [PANAX-VISION.md](PANAX-VISION.md).

## Read first

| Doc | Purpose |
|-----|---------|
| [PANAX-VISION.md](PANAX-VISION.md) | Platform vs products |
| [MONOREPO.md](MONOREPO.md) | Tree, phases |
| [DEPLOY.md](DEPLOY.md) | Droplet + GitHub Actions |
| [SUITE.md](SUITE.md) | Site roster |
| [DNS.md](DNS.md) | panax.ai + product DNS |
| [TODO.md](TODO.md) | Backlog |

## Infrastructure (droplet `137.184.37.56`)

| Item | Status |
|------|--------|
| **Products** | Five `.ing` vhosts + `/var/www/*.ing/` |
| **panax.ai** | Placeholder at `/var/www/panax.ai/` |
| **api.panax.ai** | PostgREST |
| **nocodb.panax.ai** | NocoDB (internal) |
| **Postgres** | DB `itrain`, `platform_id = panax` |
| **DNS** | Point panax.ai + products at Porkbun when ready |

## SSH

`jameslcowan@137.184.37.56` — see [SECURITY-HARDENING.md](SECURITY-HARDENING.md).

## Clone path

Droplet: `/home/jameslcowan/itrain.ing` (rename to `panax` optional per [RENAME.md](RENAME.md)).
