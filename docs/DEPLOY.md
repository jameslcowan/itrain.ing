# Deploy (DigitalOcean droplet)

Keep **Netlify live** until the droplet is verified. Cut DNS only after smoke tests pass.

## Order of operations

1. **Droplet:** Debian 13, SSH key, firewall (22, 80, 443).
2. **Server once:** create deploy user, web root, Caddy (below).
3. **GitHub:** add Actions secrets, push `main` → workflow deploys.
4. **Test:** hit the droplet by IP or `staging.powerlift.ing` before touching apex DNS.
5. **DNS:** point `powerlift.ing` A/AAAA to the droplet (Cloudflare or DO DNS).
6. **Smoke test** production URL.
7. **Then** disable Netlify deploy / remove site (or leave as rollback for a few days).

Do **not** remove Netlify first — you lose zero-downtime rollback.

## Server setup (one time)

SSH as root (or your admin user):

```bash
apt update && apt install -y caddy rsync

useradd -m -s /bin/bash deploy
for d in powerlift.ing powerbuild.ing olympiclift.ing bootybuild.ing itrain.ing; do
  mkdir -p "/var/www/$d"
done
chown -R deploy:www-data /var/www/*.ing
chmod -R g+w /var/www/*.ing

mkdir -p /home/deploy/.ssh
# Paste the *public* key (same pair as GitHub secret private key):
nano /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

mkdir -p /etc/caddy/sites
# Copy infra/caddy/*.caddy from repo to /etc/caddy/sites/
# Ensure main /etc/caddy/Caddyfile contains: import /etc/caddy/sites/*.caddy
systemctl reload caddy
```

## GitHub Actions secrets

Repo → **Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|--------|
| `DEPLOY_HOST` | Droplet public IPv4 |
| `DEPLOY_USER` | `deploy` |
| `SSH_PRIVATE_KEY` | Full private key (`id_ed25519`), including `-----BEGIN` / `END-----` lines |

The matching **public** key must be in `/home/deploy/.ssh/authorized_keys` on the server.

Workflow: [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) — matrix deploy: each `sites/*/` → `/var/www/<domain>/`.

## Manual deploy (debug)

All sites:

```bash
./scripts/deploy-all-sites.sh
```

Single site (example):

```bash
cd sites/powerlifting && npm ci && npm run build
rsync -avzr --delete --exclude-from=../../infra/deploy/rsync-excludes.txt \
  ./ deploy@YOUR_DROPLET_IP:/var/www/powerlift.ing/
```

## Smoke test checklist

- [ ] `/` landing
- [ ] `/programs/`
- [ ] `/app` and a shared `/app/<STATE>` link
- [ ] `/blog/`, `/faq/`, `/terms/`, `/privacy/`
- [ ] Unknown path → `404.html`
- [ ] HTTPS certificate valid

## Sites on this droplet

| Domain | Web root | Caddy config |
|--------|----------|--------------|
| powerlift.ing | `/var/www/powerlift.ing/` | `infra/caddy/powerlift.ing.caddy` |
| powerbuild.ing | `/var/www/powerbuild.ing/` | `infra/caddy/powerbuild.ing.caddy` |
| olympiclift.ing | `/var/www/olympiclift.ing/` | `infra/caddy/olympiclift.ing.caddy` |
| bootybuild.ing | `/var/www/bootybuild.ing/` | `infra/caddy/bootybuild.ing.caddy` |
| itrain.ing | `/var/www/itrain.ing/` | `infra/caddy/itrain.ing.caddy` |

## Later (DB)

Postgres + API service on same droplet. Bump droplet RAM when DB lands on the box.
