# Deploy (DigitalOcean droplet)

This monorepo is **independent of Netlify**. Production is Caddy + static files under `/var/www/`, optional Postgres + PostgREST on the same droplet.

**Droplet IPv4:** `137.184.37.56`  
**DNS:** [DNS.md](DNS.md) — **hold until ready** (all domains on Porkbun; cut over together when stack is verified).

## Order of operations

1. **Droplet:** Debian 13, SSH (`jameslcowan`), firewall (22, 80, 443).
2. **Server once:** Caddy, `deploy` user, web roots — below.
3. **GitHub Actions (recommended):** Auto-deploy on push — [GITHUB-ACTIONS.md](GITHUB-ACTIONS.md).
4. **Pre-DNS test:** Deploy via CI or `./scripts/deploy-all-sites.sh`; smoke-test with `Host:` header + droplet IP — [DNS.md](DNS.md).
5. **Database (when ready):** `install-swap.sh`, `install-postgres.sh`, `install-postgrest.sh` — [DATABASE.md](DATABASE.md).
6. **DNS cutover (later):** Point **all** `.ing` domains at the droplet in Porkbun — only when ready to go live.
7. **Retire** legacy Netlify powerlift site (separate repo).

## Server setup (one time)

```bash
apt update && apt install -y caddy rsync

useradd -m -s /bin/bash deploy
for d in powerlift.ing powerbuild.ing olympiclift.ing bootybuild.ing itrain.ing; do
  mkdir -p "/var/www/$d"
done
chown -R deploy:www-data /var/www/*.ing
chmod -R g+w /var/www/*.ing

mkdir -p /etc/caddy/sites
cp infra/caddy/*.caddy /etc/caddy/sites/
# Main Caddyfile: import /etc/caddy/sites/*.caddy
systemctl reload caddy
```

## GitHub Actions (recommended)

See **[GITHUB-ACTIONS.md](GITHUB-ACTIONS.md)** for secrets and verification. Deploys **all five sites** on each qualifying push to `main`.

## Manual deploy

```bash
./scripts/deploy-all-sites.sh
```

## Rsync excludes (production surface)

[`infra/deploy/rsync-excludes.txt`](../infra/deploy/rsync-excludes.txt) omits dev-only paths from `/var/www/`.

## Sites on this droplet

| Domain | Web root | Caddy config |
|--------|----------|--------------|
| powerlift.ing | `/var/www/powerlift.ing/` | `infra/caddy/powerlift.ing.caddy` |
| powerbuild.ing | `/var/www/powerbuild.ing/` | `infra/caddy/powerbuild.ing.caddy` |
| olympiclift.ing | `/var/www/olympiclift.ing/` | `infra/caddy/olympiclift.ing.caddy` |
| bootybuild.ing | `/var/www/bootybuild.ing/` | `infra/caddy/bootybuild.ing.caddy` |
| itrain.ing | `/var/www/itrain.ing/` | `infra/caddy/itrain.ing.caddy` |
| api.panax.ai | PostgREST `:3000` | `infra/caddy/api.panax.ai.caddy` |

## Old Netlify repo

The legacy **powerlift.ing-only** Netlify repo is separate. Shut it down in the Netlify UI after DNS points here. This monorepo does not use Netlify.
