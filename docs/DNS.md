# DNS — custom domains to the droplet

**Hold DNS changes until the stack is ready.** `powerlift.ing` is still live on its current hosting; cutting over early would send real users to an unfinished droplet.

**Droplet IPv4 (for later):** `137.184.37.56`

## Registrar: Porkbun (all suite domains)

You register and manage DNS at [porkbun.com](https://porkbun.com) for the suite:

| Site folder | Apex domain |
|-------------|-------------|
| `sites/powerlifting/` | `powerlift.ing` |
| `sites/powerbuilding/` | `powerbuild.ing` |
| `sites/olympiclifting/` | `olympiclift.ing` |
| `sites/bootybuilding/` | `bootybuild.ing` |
| `sites/itraining/` | `itrain.ing` |

**API (PostgREST, when ready):** `api.itrain.ing` → same droplet (A record `api` in the `itrain.ing` zone).

### powerlift.ing nameservers (check before cutover)

Other domains may already use Porkbun NS (`*.ns.porkbun.com`). **`powerlift.ing` has historically used Netlify/NS1 nameservers** — if `host -t NS powerlift.ing` still shows `nsone.net`, switch the domain to **Porkbun nameservers** in Porkbun before editing A records there.

## Pre-launch testing (no DNS change)

Deploy to the droplet with GitHub Actions or `./scripts/deploy-all-sites.sh`, then test **without** changing public DNS:

```bash
# From your machine — correct Host header, droplet IP
curl -sI -H "Host: powerlift.ing" http://137.184.37.56/ | head -5
curl -sI -H "Host: powerbuild.ing" http://137.184.37.56/ | head -5
# … repeat for olympiclift.ing, bootybuild.ing, itrain.ing
```

Optional local override (your laptop only):

```text
137.184.37.56  powerlift.ing www.powerlift.ing
```

HTTPS on the droplet needs DNS pointing here (or temporary hosts + Caddy certs) — use HTTP smoke tests until cutover.

### API (`api.itrain.ing`) — no DNS change

PostgREST analytics ingest (see [ANALYTICS.md](ANALYTICS.md)):

```bash
cd /path/to/itrain.ing
./scripts/smoke-api.sh
# or: DROPLET=137.184.37.56 curl --resolve "api.itrain.ing:443:137.184.37.56" ...
```

Caddy must have `infra/caddy/api.itrain.ing.caddy` in `/etc/caddy/sites/` on the droplet. TLS for `api.itrain.ing` works with `--resolve` once a cert exists (Caddy on-demand or temporary DNS for ACME only).

## When you are ready: records (all sites, same pattern)

For **each** apex domain in Porkbun:

| Type | Host | Answer |
|------|------|--------|
| A | `@` | `137.184.37.56` |
| A | `www` | `137.184.37.56` |

For API (under `itrain.ing`):

| Type | Host | Answer |
|------|------|--------|
| A | `api` | `137.184.37.56` |

Cut over **all** sites when you are satisfied — not only `powerlift.ing`. Suggested order:

1. Lower TTL a day ahead (optional).
2. Point **non-live** domains first (`powerbuild.ing`, `olympiclift.ing`, `bootybuild.ing`, `itrain.ing`) and verify.
3. Point `powerlift.ing` + `www` when ready to replace Netlify.
4. Shut down the **legacy Netlify powerlift repo/site** (separate from this monorepo).
5. Add `api.itrain.ing` when PostgREST is installed and tested.

## Verify after cutover

```bash
host powerlift.ing powerbuild.ing itrain.ing
curl -sI https://powerlift.ing/ | head -3
```

Caddy issues Let's Encrypt certificates once DNS points at the droplet.
