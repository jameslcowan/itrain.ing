# Backend services (DigitalOcean)

Self-hosted on the itrain droplet — **not** Netlify, **not** managed cloud DB.

| Service | Purpose |
|---------|---------|
| `db/migrations/` | PostgreSQL schema (3NF multisite analytics) |
| `postgrest/` | [PostgREST](https://postgrest.org/) — HTTP API over Postgres |

## Migrations

| File | Content |
|------|---------|
| `001_init.sql` | Bootstrap `sites`, legacy `events` (dropped by `009`) |
| `002`–`005` | Platforms, dimensions, `page_views`, `custom_events` |
| `006`–`007` | `start_session`, `record_page_view`, `record_custom_event` |
| `008` | Per-site read views |
| `009` | Drop legacy `events` (after smoke test) |

## API (after install)

- Base URL: `https://api.itrain.ing/` (pre-DNS: `./scripts/smoke-api.sh`)
- `POST /rpc/start_session` — begin visit; returns `session_id`
- `POST /rpc/record_page_view` — page load / unload metrics
- `POST /rpc/record_custom_event` — product events (`program_card_open`, etc.)

## Install on droplet

```bash
sudo ./infra/server/install-swap.sh
sudo ./infra/server/install-postgres.sh
sudo ./infra/server/install-postgrest.sh
sudo cp infra/caddy/api.itrain.ing.caddy /etc/caddy/sites/
sudo systemctl reload caddy
./scripts/smoke-api.sh
```

Drop legacy table after smoke:

```bash
sudo APPLY_DROP_LEGACY=1 bash -c 'sudo -u postgres psql -d itrain -f services/db/migrations/009_drop_legacy_events.sql'
systemctl restart postgrest
```

See [docs/DATABASE.md](../docs/DATABASE.md), [docs/ANALYTICS-SCHEMA.md](../docs/ANALYTICS-SCHEMA.md).
