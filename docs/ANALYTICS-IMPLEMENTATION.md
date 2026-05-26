# Analytics implementation checklist (Phase 5)

Execution plan for **PostgreSQL + PostgREST** multisite analytics.  
Schema: [ANALYTICS-SCHEMA.md](ANALYTICS-SCHEMA.md) (3NF minimum, approved).  
**DNS:** held until full stack is tested — use pre-DNS curls below.

## Principles

| Rule | Detail |
|------|--------|
| Micro-commits | One concern per commit; see `.cursor/rules/micro-commits.mdc` |
| No DNS yet | Sites + `api.panax.ai` tested via IP + `Host` / `--resolve` |
| PostgREST only | Ingest via RPCs; no Node/Bun sidecar for v1 |
| 3NF floor | Migrations must match schema doc; no new `meta`-only facts |
| Git | No agent co-author; no push unless explicitly requested |

## Droplet reference

| Item | Value |
|------|--------|
| SSH | `jameslcowan@137.184.37.56` |
| IPv4 | `137.184.37.56` |
| Static roots | `/var/www/{powerlift,powerbuild,olympiclift,bootybuild,itrain}.ing/` |
| API (local) | PostgREST `127.0.0.1:3000` behind Caddy |
| DB name | `itrain` |
| Secrets | `/etc/panax/postgrest.env` (generated on server, never commit) |

---

## Track A — Docs (complete before migrations)

| Step | Commit | Status |
|------|--------|--------|
| A1 | `docs/ANALYTICS-SCHEMA.md` — design + 3NF proof | ✅ `292e3f4` |
| A2 | `docs/ANALYTICS-IMPLEMENTATION.md` — this file | ✅ |
| A3 | `docs/TODO.md`, `docs/ANALYTICS.md` — pointers | ✅ |

**Gate:** Track B migrations in repo → apply on droplet (Track C).

---

## Track B — SQL migrations (repo only)

Run on droplet only after each migration file is committed. Order is fixed.

| Step | Commit message (subject) | File | Gate |
|------|--------------------------|------|------|
| B1 | `db: add platforms table and extend sites` | `services/db/migrations/002_platforms.sql` | `psql` apply OK |
| B2 | `db: add analytics dimension tables` | `003_dimensions.sql` | FKs valid |
| B3 | `db: add sessions and page_views` | `004_page_views.sql` | |
| B4 | `db: add custom_events and event_types seed` | `005_custom_events.sql` | |
| B5 | `db: add start_session and record_page_view RPCs` | `006_postgrest_api.sql` | RPC smoke |
| B6 | `db: add record_custom_event RPC` | `007_postgrest_rpcs.sql` | RPC smoke |
| B7 | `db: add per-site read views` | `008_site_views.sql` | |
| B8 | `db: drop legacy events table` | `009_drop_legacy_events.sql` | After B5–B7 proven |

**Apply on droplet** (after pulling repo):

```bash
cd ~/panax
sudo -u postgres psql -v ON_ERROR_STOP=1 -d itrain -f services/db/migrations/002_platforms.sql
# … repeat for 003–008 in order
```

**Do not** run `009` until new RPCs replace `collect_event` in smoke tests.

**Gate before B8:** document normalization unchanged (no new JSONB-only facts).

---

## Track C — Infra on droplet (no public DNS)

Server work; split git commits for scripts/docs vs one-time apply.

| Step | Git commit (typical) | Server action | Verify |
|------|----------------------|---------------|--------|
| C1 | `infra: run ordered migrations in install-postgres` | Update `install-postgres.sh` to apply `002+` | `psql \dt` shows new tables |
| C2 | `infra: postgrest systemd and healthcheck` | `install-postgrest.sh`, enable unit | `curl 127.0.0.1:3000/` |
| C3 | `infra: document pre-DNS API testing` | `DNS.md` + comment in `api.panax.ai.caddy` | — |
| C4 | `scripts: add smoke-api.sh` + `test-db-migrations.sh` | Local + droplet | all checks pass |

### First-time install (if Postgres not yet on box)

```bash
sudo ./infra/server/install-swap.sh
sudo ./infra/server/install-postgres.sh    # 001 + 002… when C1 merged
sudo ./infra/server/install-postgrest.sh
sudo cp infra/caddy/api.panax.ai.caddy /etc/caddy/sites/
sudo systemctl reload caddy
```

### Pre-DNS API smoke (from Fedora or droplet)

```bash
DROPLET=137.184.37.56

# PostgREST root (may 404 JSON — proves proxy)
curl -sS -o /dev/null -w "%{http_code}\n" \
  --resolve "api.panax.ai:443:${DROPLET}" \
  "https://api.panax.ai/"

# Start session
curl -sS -X POST \
  --resolve "api.panax.ai:443:${DROPLET}" \
  -H "Content-Type: application/json" \
  "https://api.panax.ai/rpc/start_session" \
  -d '{"p_site_id":"powerlift","p_visitor_id":"00000000-0000-4000-8000-000000000001","p_ua_raw":"smoke-test"}'

# Page view (use session_id from response)
curl -sS -X POST \
  --resolve "api.panax.ai:443:${DROPLET}" \
  -H "Content-Type: application/json" \
  "https://api.panax.ai/rpc/record_page_view" \
  -d '{"p_site_id":"powerlift","p_session_id":"<uuid>","p_path":"/programs/","p_occurred_at":"2026-05-26T12:00:00Z","p_document_title":"Programs"}'
```

HTTP on port 80 if TLS cert not ready for `api.panax.ai`:

```bash
curl -sS -H "Host: api.panax.ai" "http://${DROPLET}/"
```

**Gate for Track C:** `scripts/smoke-api.sh` exits 0; rows visible in `page_views` for `site_id = powerlift`.

---

## Track D — Front-end beacon (after Track C)

| Step | Commit | Scope |
|------|--------|--------|
| D1 | `feat(analytics): shared beacon module` | `packages/analytics/` or shared script |
| D2 | `feat(powerlifting): enable analytics beacon` | **one site only** |
| D3–D6 | `feat(<site>): enable analytics beacon` | one commit per sister site |
| D7 | `docs: privacy policy analytics disclosure` | legal pages per site |

**Gate before D2:** privacy copy drafted; API base URL uses pre-DNS or relative proxy if added later.

Beacon must send:

- `site_id` (constant per site)
- `session_id` / `visitor_id` (cookies)
- path, title, viewport, timing, referrer
- custom events: `program_card_open`, `open_in_builder`, etc.

---

## Track E — Later (explicitly out of scope here)

- [ ] GitHub Actions deploy verification (`DEPLOY_HOST`, `DEPLOY_USER`, `SSH_PRIVATE_KEY`)
- [ ] Porkbun DNS cutover — all apex + `api.panax.ai` ([DNS.md](DNS.md))
- [ ] Shut down legacy Netlify `powerlift` repo
- [ ] Admin read role + dashboard (not `web_anon`)
- [ ] Monthly partitions on `page_views` when volume warrants
- [ ] Materialized views / warehouse export (denormalized reads OK off 3NF base)

---

## Verification matrix (before DNS)

| Check | Command / action | Expected |
|-------|------------------|----------|
| Postgres running | `systemctl is-active postgresql` | `active` |
| PostgREST running | `systemctl is-active postgrest` | `active` |
| Tables exist | `\dt` in `psql -d itrain` | `platforms`, `sites`, `page_views`, … |
| 3NF | Review migration SQL vs schema doc | No core fields only in JSONB |
| Ingest | `smoke-api.sh` | exit 0 |
| Static sites | `curl -H "Host: powerlift.ing" http://137.184.37.56/` | 200 |
| No legacy ingest | `collect_event` absent after B8 | only new RPCs |

---

## Rollback notes

| Failure | Action |
|---------|--------|
| Bad migration | Restore DB snapshot or `pg_restore`; fix SQL; re-apply from failed file |
| PostgREST down | `journalctl -u postgrest`; check `/etc/panax/postgrest.env` |
| Wrong data in `extras` | Bump `extras_schema_version`; document keys in future `ANALYTICS-EXTRAS.md` |

Do **not** force-push `main` to fix migrations; add forward-fix migration `010_*.sql` instead.

---

## Related docs

- [ANALYTICS-SCHEMA.md](ANALYTICS-SCHEMA.md) — tables, 3NF proof, RPC names
- [DATABASE.md](DATABASE.md) — Postgres vs SQLite
- [ANALYTICS.md](ANALYTICS.md) — short stack summary
- [DNS.md](DNS.md) — hold + pre-launch testing
- [services/README.md](../services/README.md) — install commands
