# itrain.ing

Monorepo for the **itrain.ing** app suite — shareable program builders on `.ing` domains.

## Sites (`sites/`)

| Folder | Domain |
|--------|--------|
| [powerlifting/](sites/powerlifting/) | [powerlift.ing](https://powerlift.ing) |
| [powerbuilding/](sites/powerbuilding/) | powerbuild.ing |
| [olympiclifting/](sites/olympiclifting/) | olympiclift.ing |
| [bootybuilding/](sites/bootybuilding/) | bootybuild.ing |

Sister copies need branding, content, and deploy wiring — only **powerlifting** deploys to production today.

## Documentation

| Doc | Topic |
|-----|--------|
| [docs/HANDOFF.md](docs/HANDOFF.md) | Session context + infra status |
| [docs/MONOREPO.md](docs/MONOREPO.md) | Monorepo plan and phases |
| [docs/DEPLOY.md](docs/DEPLOY.md) | DigitalOcean + GitHub Actions |
| [docs/SITE.md](docs/SITE.md) | Routes and build (powerlifting) |
| [docs/TODO.md](docs/TODO.md) | Backlog |

## Quick start (powerlifting)

```bash
cd sites/powerlifting && npm install && npm run build
npm run dev:powerlifting   # from repo root
```

```bash
cd sites/powerlifting && node --test tests/codec.test.mjs
```
