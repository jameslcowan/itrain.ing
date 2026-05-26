# Session handoff — itrain.ing monorepo

Use this file when opening **`/home/jameslcowan/Documents/GitHub/itrain.ing`** in a new Cursor workspace. It carries context from the powerlift.ing → suite migration chat.

## What this repo is

- **itrain.ing** — umbrella monorepo for the `.ing` app family.
- **First product:** [powerlift.ing](https://powerlift.ing) (free powerlifting program builder; whole program in one URL).
- **Planned sites:** olympiclift.ing, powerbuild.ing, bootybuild.ing (scaffolds in `sites/`).
- **Origin:** cloned from `powerlift.ing` repo with full git history (May 2026).

## Read first

| Doc | Purpose |
|-----|---------|
| [MONOREPO.md](MONOREPO.md) | Target tree, phases 0–6, DB sketch |
| [DEPLOY.md](DEPLOY.md) | DigitalOcean droplet + GitHub Actions |
| [SUITE.md](SUITE.md) | Site roster |
| [TODO.md](TODO.md) | Backlog |

## Current layout

App code lives under **`sites/`**:

- `sites/powerlifting/` — powerlift.ing (production)
- `sites/powerbuilding/`, `sites/olympiclifting/`, `sites/bootybuilding/`, `sites/itraining/` — branded; DO deploy

Repo root: `docs/`, `infra/`, `.github/` only.

## Infrastructure state

| Item | Status |
|------|--------|
| **Netlify** | **Not used by this repo.** Legacy powerlift-only Netlify site is a separate repo — shut down after DNS cutover |
| **DigitalOcean** | Droplet live: Caddy, five static sites, hardening (`jameslcowan`) |
| **GitHub Actions** | Optional auto-deploy — [DEPLOY.md](DEPLOY.md) |
| **Database** | Schema + RPCs in repo; **droplet apply pending** — [ANALYTICS-STATUS.md](ANALYTICS-STATUS.md), [DATABASE.md](DATABASE.md) |
| **DNS** | Manual at Porkbun / NS1 — [DNS.md](DNS.md) |

## Droplet quick reference

- **OS:** Debian 13 stable (not Fedora on server).
- **Size:** ~$16/mo (2 GB) sized for Postgres later; static-only could be $8.
- **Web:** Caddy — `infra/caddy/*.caddy` (five domains)
- **Deploy paths:** `/var/www/{powerlift,powerbuild,olympiclift,bootybuild,itrain}.ing/`
- **Fedora desktop:** use `wl-copy < ~/.ssh/id_ed25519.pub` (not `pbcopy`).
- **SSH login:** `jameslcowan@137.184.37.56` (root SSH disabled). See [SECURITY-HARDENING.md](SECURITY-HARDENING.md).

## Monorepo phases (summary)

0. **Now:** deploy from repo root to DO; DNS cutover per [DNS.md](DNS.md).
1. Rename GitHub remote to `itrain.ing` (this repo).
2. `git mv` app → `sites/powerlift.ing/`.
3. Matrix deploy per site.
4. Extract `packages/*`.
5. `services/` Postgres + PostgREST (in progress).
6. Clone next site from powerlift template.

## Recent product work (landed in git)

- Landing hero: coarse grid, orange wash (theme-tuned light/dark), viewport-aligned side fade.
- Programs grid: square cards, 40px cells, corner layout, test templates in `content/programs-data.js`.
- Removed grid.bz / jameslcowan **repo** references; author links to @jameslcowan on X unchanged.
- `sites/{olympiclift,powerbuild,bootybuild}.ing/` scaffolds + deploy infra.

## Old repo

`/home/jameslcowan/Documents/GitHub/powerlift.ing` — can archive after this clone is canonical and DNS/deploy point here. Until then, avoid divergent edits in both trees.

## Open in Cursor

**File → Open Folder** → `/home/jameslcowan/Documents/GitHub/itrain.ing`

Optional: open `itrain.ing.code-workspace` in this folder.

## Agent transcript (full chat)

Cursor transcript ID for the migration session: `5659285c-3067-4791-b215-b5972fa2d398` (under the powerlift.ing project path in Cursor metadata). Reference if the IDE supports transcript lookup.
