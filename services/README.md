# Backend services (DigitalOcean)

Self-hosted on the itrain droplet — **not** Netlify, **not** managed cloud DB.

| Service | Purpose |
|---------|---------|
| `db/migrations/` | PostgreSQL schema (`site_id` multisite model) |
| `postgrest/` | [PostgREST](https://postgrest.org/) — HTTP API over Postgres (no ORM) |

## API (after install)

- Base URL (via Caddy): `https://api.itrain.ing/`
- Analytics ingest: `POST /rpc/collect_event` with JSON body:

```json
{
  "p_site_id": "powerlift",
  "p_path": "/programs/",
  "p_event": "pageview",
  "p_meta": {}
}
```

## Install on droplet

```bash
sudo ./infra/server/install-swap.sh      # recommended before Postgres on 2GB RAM
sudo ./infra/server/install-postgres.sh
sudo ./infra/server/install-postgrest.sh
sudo cp infra/caddy/api.itrain.ing.caddy /etc/caddy/sites/
sudo systemctl reload caddy
```

See [docs/DATABASE.md](../docs/DATABASE.md) for Postgres vs SQLite vs PostgREST.
