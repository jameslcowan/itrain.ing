# Lifting apps suite (itrain.ing)

Platform monorepo. Full plan: **[MONOREPO.md](MONOREPO.md)**. Branding: **[BRANDING.md](BRANDING.md)**.

## Sites

| Folder | Domain | Status |
|--------|--------|--------|
| `sites/powerlifting/` | powerlift.ing | Production; DO deploy |
| `sites/powerbuilding/` | powerbuild.ing | Production; DO deploy |
| `sites/olympiclifting/` | olympiclift.ing | Production; DO deploy |
| `sites/bootybuilding/` | bootybuild.ing | Production; DO deploy |
| `sites/itraining/` | itrain.ing | Production; DO deploy |

## Repo layout

```text
itrain.ing/
  docs/ infra/ .github/ scripts/
  sites/
    powerlifting/   … production reference
    powerbuilding/  … hypertrophy brand
    olympiclifting/ … Olympic lifting brand
    bootybuilding/  … glute-focused brand
    itraining/      … general training / platform hub
```

## Quick commands

```bash
npm run dev:all       # five dev servers (8080–8084)
npm run build:all     # build every site
```
