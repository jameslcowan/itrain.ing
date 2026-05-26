# Panax platform (monorepo)

Monorepo for the **Panax** platform ([panax.ai](https://panax.ai)) and its **`.ing` product apps** — shareable program builders and related sites.

| Folder | Domain | Product |
|--------|--------|---------|
| [powerlifting/](sites/powerlifting/) | powerlift.ing | Powerlifting builder |
| [powerbuilding/](sites/powerbuilding/) | powerbuild.ing | Powerbuilding |
| [olympiclifting/](sites/olympiclifting/) | olympiclift.ing | Olympic lifting |
| [bootybuilding/](sites/bootybuilding/) | bootybuild.ing | Glute-focused training |
| [itraining/](sites/itraining/) | itrain.ing | General training |

**panax.ai** — platform home + future AI app (data from all products).  
**itrain.ing** — one product in the suite, not the platform owner.

## Documentation

| Doc | Topic |
|-----|--------|
| [docs/PANAX-VISION.md](docs/PANAX-VISION.md) | Platform vs products, data flow |
| [docs/HANDOFF.md](docs/HANDOFF.md) | Infra status + droplet |
| [docs/MONOREPO.md](docs/MONOREPO.md) | Repo layout and phases |
| [docs/DNS.md](docs/DNS.md) | Domains (panax.ai + `.ing` products) |
| [docs/DEPLOY.md](docs/DEPLOY.md) | DigitalOcean + GitHub Actions |
| [docs/RENAME.md](docs/RENAME.md) | Rename GitHub repo / clone path |
| [docs/TODO.md](docs/TODO.md) | Backlog |

## Quick start (powerlifting)

```bash
cd sites/powerlifting && npm ci && npm run dev
```

Root: `npm run dev:all` (ports 8080–8084).
