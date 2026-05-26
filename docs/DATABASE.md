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

- Auto REST from tables/views + **RPC** from SQL functions (`collect_event`, etc.)
- No Node ORM required for CRUD and ingest
- JWT + Postgres roles when you add auth for panax / admin

## What PostgREST does not replace

- Static sites (builders stay client-side)
- Caddy / TLS / DNS
- Future heavy business logic → SQL functions or a small service beside PostgREST

## Multisite model

One database, many brands:

```text
sites (id, domain)     — powerlift, bootybuild, itrain, panax (later)
events (site_id, …)    — analytics
-- later: users, programs, subscriptions keyed by site_id / org_id
```

`panax.ai` is a future row in `sites` and a future frontend — not a separate database.

## Hosting

- **Self-hosted** on the DigitalOcean droplet (your choice; no managed DB)
- Config: `services/postgrest/postgrest.conf`
- Secrets: `/etc/itrain/postgrest.env` (generated on server, never committed)
