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
mkdir -p /var/www/powerlift.ing
chown -R deploy:www-data /var/www/powerlift.ing
chmod -R g+w /var/www/powerlift.ing

mkdir -p /home/deploy/.ssh
# Paste the *public* key (same pair as GitHub secret private key):
nano /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

mkdir -p /etc/caddy/sites
# Copy infra/caddy/powerlift.ing.caddy from repo to /etc/caddy/sites/
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

Workflow: [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) — runs `npm ci && npm run build`, then rsync to `/var/www/powerlift.ing/`.

## Manual deploy (debug)

```bash
npm ci && npm run build
rsync -avzr --delete --exclude-from=infra/deploy/rsync-excludes.txt \
  ./ deploy@YOUR_DROPLET_IP:/var/www/powerlift.ing/
```

## Smoke test checklist

- [ ] `/` landing
- [ ] `/programs/`
- [ ] `/app` and a shared `/app/<STATE>` link
- [ ] `/blog/`, `/faq/`, `/terms/`, `/privacy/`
- [ ] Unknown path → `404.html`
- [ ] HTTPS certificate valid

## Later (monorepo + DB)

Same droplet: extra Caddy site files, extra `/var/www/<domain>/`, Postgres + API service. Bump droplet RAM when DB lands on the box.
