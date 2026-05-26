# GitHub Actions — deploy workflow

Automatic **build + rsync** to the droplet on push to `main` (or manual run). Improves workflow: push code → all five sites deploy without SSH.

**Does not replace DNS** — sites stay on current hosting until you cut over in [DNS.md](DNS.md).

## One-time setup

Repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
|--------|--------|
| `DEPLOY_HOST` | `137.184.37.56` |
| `DEPLOY_USER` | `deploy` |
| `SSH_PRIVATE_KEY` | Full private key for CI deploy (see below) |

### SSH key for `SSH_PRIVATE_KEY`

This is the **`github-actions-deploy`** key pair — **not** the `github_push` key used for `git push` from the droplet.

On the droplet, only the **public** key should exist:

```bash
cat /home/deploy/.ssh/authorized_keys
# github-actions-deploy
```

If you no longer have the private key, generate a new pair:

```bash
ssh-keygen -t ed25519 -f deploy-ci -N "" -C "github-actions-deploy"
# Public → append to /home/deploy/.ssh/authorized_keys on droplet
# Private → paste entire file into GitHub secret SSH_PRIVATE_KEY
```

## What the workflow does

File: [.github/workflows/deploy.yml](../.github/workflows/deploy.yml)

- Triggers on push to `main` when `sites/**`, `infra/**`, or the workflow file changes
- **Matrix:** builds and rsyncs all five sites in parallel
- Target: `/var/www/<domain>/` on the droplet
- Uses `--delete-excluded` so dev files stay out of the web root

Manual run: **Actions → Deploy to DigitalOcean → Run workflow**

## Verify

1. Push a small change under `sites/powerlifting/` (or run workflow manually).
2. Actions tab should show five jobs (or one matrix with five legs).
3. On droplet: `ls -la /var/www/powerlift.ing/index.html` — timestamp updated.

## Pre-DNS smoke test after CI deploy

```bash
curl -sI -H "Host: powerbuild.ing" http://137.184.37.56/ | head -3
```

## Related

- Manual deploy: `./scripts/deploy-all-sites.sh`
- Git push from droplet: [GITHUB-PUSH.md](GITHUB-PUSH.md) (different key)
