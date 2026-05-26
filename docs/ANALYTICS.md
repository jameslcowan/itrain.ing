# Analytics

Netlify analytics was removed from this monorepo. Ingest is **PostgreSQL + PostgREST** on the DigitalOcean droplet.

## Docs

| Doc | Purpose |
|-----|---------|
| [ANALYTICS-SCHEMA.md](ANALYTICS-SCHEMA.md) | Tables, 3NF proof, RPC names |
| [ANALYTICS-IMPLEMENTATION.md](ANALYTICS-IMPLEMENTATION.md) | Phased checklist, smoke tests, DNS hold |

## Stack

- **PostgreSQL** — normalized `page_views`, `sessions`, `custom_events` (`site_id` tenancy)
- **PostgREST** — `POST /rpc/start_session`, `record_page_view`, `record_custom_event`
- **Caddy** — `https://api.itrain.ing/` → PostgREST (DNS held until cutover; test with `--resolve`)

See [DATABASE.md](DATABASE.md) and [services/README.md](../services/README.md).

## Install (droplet)

```bash
sudo ./infra/server/install-swap.sh
sudo ./infra/server/install-postgres.sh
sudo ./infra/server/install-postgrest.sh
sudo cp infra/caddy/api.itrain.ing.caddy /etc/caddy/sites/
sudo systemctl reload caddy
```

After RPC smoke: `sudo APPLY_DROP_LEGACY=1 ./infra/server/install-postgres.sh` skips 001–008 and only needs `009` — or run:

```bash
sudo -u postgres psql -d itrain -f services/db/migrations/009_drop_legacy_events.sql
```

## Smoke test (no DNS)

```bash
./scripts/smoke-api.sh
```

## Example ingest

```bash
DROPLET=137.184.37.56
curl -sS -X POST --resolve "api.itrain.ing:443:${DROPLET}" \
  -H "Content-Type: application/json" \
  "https://api.itrain.ing/rpc/start_session" \
  -d '{"p_site_id":"powerlift","p_visitor_id":"00000000-0000-4000-8000-000000000001","p_ua_raw":"curl"}'
```

## Front-end beacon (later)

Shared module: `packages/analytics/analytics.js`. Enable per site after privacy policy update ([ANALYTICS-IMPLEMENTATION.md](ANALYTICS-IMPLEMENTATION.md) Track D).

## Not planned

- Netlify Blobs / Functions
- Managed database services (self-hosted Postgres only)
- Node/Bun ingest sidecar (PostgREST RPCs only)
