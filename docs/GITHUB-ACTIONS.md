# GitHub Actions

## Workflows

| Workflow | When | Purpose |
|----------|------|---------|
| [**CI**](../.github/workflows/ci.yml) | Push/PR to `main` (code paths) | **Required checks** — build all sites, codec tests, DB migrations |
| [**Deploy**](../.github/workflows/deploy.yml) | Manual, or after CI if `AUTO_DEPLOY=true` | Rsync to droplet (needs secrets) |
| [**CI failure → TODO**](../.github/workflows/ci-failure-todo.yml) | After CI/Deploy fails | Appends [CI-TODO.md](CI-TODO.md), opens `ci-todo` issue |

### Why deploy was failing every push

Deploy ran on every `main` push but **Rsync failed** when `DEPLOY_HOST` / `DEPLOY_USER` / `SSH_PRIVATE_KEY` were missing or wrong. That produced constant red X on the repo.

**Fix:** Deploy no longer runs on push by default. **CI** is the check that must pass on push.

## CI (green checks on push)

Runs on changes under `sites/`, `services/`, `scripts/`, `packages/`, `.github/`, `package.json`.

1. **build** — matrix: `npm ci && npm run build` per site  
2. **test-codec** — `node --test` on all five sites  
3. **test-db** — Postgres 17 service + `./scripts/test-db-migrations.sh`

## Deploy (production)

### Manual (recommended until secrets verified)

**Actions → Deploy to DigitalOcean → Run workflow**

### Auto-deploy after green CI

1. Add secrets (below)  
2. Repo → **Settings → Secrets and variables → Actions → Variables**  
3. Set `AUTO_DEPLOY` = `true`  

Deploy runs only when **CI succeeds** on `main`.

## Secrets (deploy only)

| Secret | Value |
|--------|--------|
| `DEPLOY_HOST` | `137.184.37.56` |
| `DEPLOY_USER` | `deploy` |
| `SSH_PRIVATE_KEY` | Private key whose public half is in `/home/deploy/.ssh/authorized_keys` |

See key setup below. **Not used by CI.**

## CI failure backlog

- **[docs/CI-TODO.md](CI-TODO.md)** — checklist updated automatically on failure  
- **GitHub Issues** — label [`ci-todo`](https://github.com/jameslcowan/itrain.ing/issues?q=is%3Aissue+is%3Aopen+label%3Aci-todo)  

Clear items when fixed; close issues when CI is green.

## SSH key for `SSH_PRIVATE_KEY`

Pair name: **`github-actions-deploy`** (not `github_push`).

```bash
ssh-keygen -t ed25519 -f deploy-ci -N "" -C "github-actions-deploy"
# Public → /home/deploy/.ssh/authorized_keys on droplet
# Private → GitHub secret SSH_PRIVATE_KEY
```

## Branch protection (recommended)

**Settings → Branches → main → Require status checks:**

- `build (powerlifting)` … or require all matrix `build` jobs  
- `codec tests`  
- `analytics migrations`  

## Related

- Manual deploy: `./scripts/deploy-all-sites.sh`  
- Droplet push: [GITHUB-PUSH.md](GITHUB-PUSH.md)  
- Pre-DNS smoke: [DNS.md](DNS.md)
