# itrain.ing

Monorepo for the **itrain.ing** app suite — shareable program builders on `.ing` domains.

**Live product:** [powerlift.ing](https://powerlift.ing) (repo root until [Phase 2](docs/MONOREPO.md#phase-2--move-powerlift-into-sites) moves it to `sites/powerlift.ing/`).

**New here?** Read [docs/HANDOFF.md](docs/HANDOFF.md) for migration context, then [docs/MONOREPO.md](docs/MONOREPO.md).

## Documentation

| Doc | Topic |
|-----|--------|
| [docs/HANDOFF.md](docs/HANDOFF.md) | Session context + infra status |
| [docs/MONOREPO.md](docs/MONOREPO.md) | Monorepo plan and phases |
| [docs/DEPLOY.md](docs/DEPLOY.md) | DigitalOcean + GitHub Actions |
| [docs/SITE.md](docs/SITE.md) | powerlift.ing routes and build |
| [docs/SUITE.md](docs/SUITE.md) | Site roster |
| [docs/TODO.md](docs/TODO.md) | Backlog |

## Quick start (powerlift.ing app at repo root)

```bash
npm install
npm run build
python scripts/dev-server.py   # http://127.0.0.1:8080
```

```bash
node --test tests/codec.test.mjs
```

## Suite sites

| Domain | Folder |
|--------|--------|
| powerlift.ing | `/` (→ `sites/powerlift.ing/` after Phase 2) |
| olympiclift.ing | `sites/olympiclift.ing/` |
| powerbuild.ing | `sites/powerbuild.ing/` |
| bootybuild.ing | `sites/bootybuild.ing/` |
