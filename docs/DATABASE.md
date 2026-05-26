# Database — Postgres + PostgREST (multisite)

## Decision: not SQLite

| | SQLite | PostgreSQL + PostgREST |
|--|--------|-------------------------|
| PostgREST | **Does not work** (PostgREST requires PostgreSQL) | **Native fit** |
| Multisite (`site_id`) | One file; write contention under traffic | Row-level tenancy, concurrent writers |
| Same API for itrain + future panax.ai | Rebuild when you outgrow SQLite | One schema; add `site_id` / products |
| Ops on our droplet | Lightest | Heavier; use swap or resize RAM later |

**Verdict:** Use **PostgreSQL** as the database and **PostgREST** as the HTTP layer when you want REST/RPC without an ORM. SQLite is wrong for a PostgREST stack.

## What PostgREST gives you

- **RPC** from SQL functions: `start_session`, `record_page_view`, `record_custom_event`
- Per-site read **views** (e.g. `powerlift_page_views`) for future admin dashboards
- No Node ORM required for ingest
- JWT + Postgres roles when you add auth for panax / admin

See [ANALYTICS-SCHEMA.md](ANALYTICS-SCHEMA.md) (3NF design) and [ANALYTICS-IMPLEMENTATION.md](ANALYTICS-IMPLEMENTATION.md).

## What PostgREST does not replace

- Static sites (builders stay client-side)
- Caddy / TLS / DNS
- Future heavy business logic → SQL functions or a small service beside PostgREST

## Multisite model

One database, many brands:

```text
platforms (id, slug, …)
sites (id, platform_id, domain, …)
sessions, page_views, custom_events  — site_id on all facts
```

`panax.ai` is a future row in `sites` and a future frontend — not a separate database.

## Hosting

- **Self-hosted** on the DigitalOcean droplet (no managed DB)
- Migrations: `services/db/migrations/`
- PostgREST env: `/etc/panax/postgrest.env` (generated on server, never committed)
- Local test: `./scripts/test-db-migrations.sh`
- Visual admin (optional): [NOCODB.md](NOCODB.md) — read-only `panax_nocodb` role
