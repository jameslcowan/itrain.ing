# Analytics

Netlify analytics was removed from this monorepo. Ingest is **PostgreSQL + PostgREST** on the DigitalOcean droplet.

## Stack

- **PostgreSQL** — `events` table with `site_id` (multisite)
- **PostgREST** — `POST /rpc/collect_event` (no ORM)
- **Caddy** — `https://api.itrain.ing/` → PostgREST

See [DATABASE.md](DATABASE.md) and [services/README.md](../services/README.md).

## Install

```bash
sudo ./infra/server/install-swap.sh
sudo ./infra/server/install-postgres.sh
sudo ./infra/server/install-postgrest.sh
```

Add DNS: `api.itrain.ing` → droplet ([DNS.md](DNS.md)).

## Example ingest

```bash
curl -sS -X POST "https://api.itrain.ing/rpc/collect_event" \
  -H "Content-Type: application/json" \
  -d '{"p_site_id":"powerlift","p_path":"/programs/","p_event":"pageview","p_meta":{}}'
```

## Front-end snippet (later)

Add a small `analytics.js` in `packages/` or per-site that POSTs to `api.itrain.ing` with the correct `site_id`. Update privacy policy when enabled.

## Not planned

- Netlify Blobs / Functions
- Managed database services (self-hosted Postgres only)
