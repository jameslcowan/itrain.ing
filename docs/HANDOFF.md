# Session handoff — Panax platform monorepo

Open **`~/panax`** (`git@github.com:jameslcowan/panax.git`).

## What this repo is

- **Panax** ([panax.ai](https://panax.ai)) — platform brand; future mega AI app + shared accounts.
- **Product apps** — powerlift.ing, itrain.ing, etc. under `sites/`; each has its own domain and `site_id`.
- **This repository** — `jameslcowan/panax` on GitHub; clone at `~/panax`.

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
| **Hostname** | `panax` |
| **Clone** | `/home/jameslcowan/panax` |
| **Products** | Five `.ing` vhosts + `/var/www/*.ing/` |
| **panax.ai** | `/var/www/panax.ai/` |
| **api.panax.ai** | PostgREST |
| **nocodb.panax.ai** | NocoDB |
| **Postgres** | database `panax`, `platform_id = panax` |

## SSH

`jameslcowan@137.184.37.56` — see [SECURITY-HARDENING.md](SECURITY-HARDENING.md).
