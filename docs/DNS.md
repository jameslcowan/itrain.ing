# DNS — Panax platform + product domains

**Droplet IPv4:** `137.184.37.56`

**Hold product cutovers** until each site is ready on the droplet. **panax.ai** can point now for platform TLS and API.

## Current DNS status (2026-05-27)

Nothing in the **itrain.ing** zone points at the droplet yet. Public DNS still resolves elsewhere (not `137.184.37.56`). The app is only reachable via **pre-DNS** tests (droplet IP + `Host: itrain.ing` header, or `/etc/hosts`).

| Zone | Points to droplet? | Notes |
|------|-------------------|--------|
| **itrain.ing** | **No** | Never cut over; Porkbun A records not set to `137.184.37.56` |
| **panax.ai** | **No** (check before cutover) | Platform API/Caddy ready on server; DNS separate step |
| **powerlift.ing** | **No** | Still on legacy Netlify IPs |
| Other `.ing` products | **No** | Same hold as suite — see [TODO.md](TODO.md) |

**On the droplet already:** static files at `/var/www/itrain.ing/`, Caddy vhost `infra/caddy/itrain.ing.caddy`, matrix deploy includes `sites/itraining/`. DNS is the missing piece for a public URL.

### Pre-DNS smoke (itrain.ing — works today)

```bash
curl -sI -H "Host: itrain.ing" http://137.184.37.56/ | head -5
# or from the droplet:
curl -sI -H "Host: itrain.ing" http://127.0.0.1/ | head -5
```

When ready to go live, add Porkbun A records for `@` and `www` → `137.184.37.56` (see table below). **Do not** add `api.itrain.ing` — analytics use **`api.panax.ai`** only.

## panax.ai zone (platform — Porkbun or your registrar)

| Type | Host | Answer | Purpose |
|------|------|--------|---------|
| A | `@` | `137.184.37.56` | panax.ai home |
| A | `www` | `137.184.37.56` | redirect/www |
| A | `api` | `137.184.37.56` | PostgREST ingest |
| A | `nocodb` | `137.184.37.56` | NocoDB admin (optional; restrict who knows URL) |

On the droplet after DNS propagates:

```bash
sudo ./infra/server/install-panax-caddy.sh   # TLS via Caddy
SMOKE_HTTP=1 ./scripts/smoke-api.sh          # or HTTPS once certs exist
curl -sI https://panax.ai/
```

Caddy vhosts: `infra/caddy/panax.ai.caddy`, `api.panax.ai.caddy`, `nocodb.panax.ai.caddy`.

## Product `.ing` domains (separate zones)

Each product keeps its **own** domain and Porkbun zone:

| Folder | Apex |
|--------|------|
| `sites/powerlifting/` | powerlift.ing |
| `sites/powerbuilding/` | powerbuild.ing |
| `sites/olympiclifting/` | olympiclift.ing |
| `sites/bootybuilding/` | bootybuild.ing |
| `sites/itraining/` | itrain.ing |

Per zone:

| Type | Host | Answer |
|------|------|--------|
| A | `@` | `137.184.37.56` |
| A | `www` | `137.184.37.56` |

**Do not** use `api.itrain.ing` for the shared API — use **`api.panax.ai`** only.

### powerlift.ing nameservers

If `host -t NS powerlift.ing` still shows Netlify/NS1, move nameservers to Porkbun before A records.

## Pre-launch testing (no product DNS change)

```bash
curl -sI -H "Host: powerlift.ing" http://137.184.37.56/ | head -5
curl -sI -H "Host: api.panax.ai" http://137.184.37.56/ | head -5
./scripts/smoke-api.sh
```

## Suggested cutover order

1. **panax.ai** + `api` + `nocodb` → droplet; verify HTTPS and smoke-api.
2. Non-live **product** domains → droplet; verify each vhost.
3. **powerlift.ing** when ready to leave Netlify.
4. Enable analytics beacon with `data-api-base="https://api.panax.ai"`.
