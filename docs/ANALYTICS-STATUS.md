# Analytics / Phase 5 status

Last verified on droplet **2026-05-26**.

## Live on droplet (`itrain` / `137.184.37.56`)

| Component | Status |
|-----------|--------|
| PostgreSQL `itrain` DB | **Running** — migrations `001`–`008` applied |
| PostgREST `:3000` | **Running** — `systemctl status postgrest` |
| Caddy `api.itrain.ing` | **Running** — HTTP pre-DNS (`http://api.itrain.ing` block) |
| `SMOKE_HTTP=1 ./scripts/smoke-api.sh` | **Passed** — `start_session`, `record_page_view`, `record_custom_event` |
| Migration `009` (drop legacy) | **Skipped** — run after production beacon smoke |

## Install (one command)

```bash
cd /home/jameslcowan/itrain.ing   # or /root/itrain.ing
sudo ./infra/server/install-analytics-stack.sh
```

Or stepwise:

```bash
sudo ./infra/server/install-postgres.sh
sudo ./infra/server/install-postgrest.sh
sudo ./infra/server/install-api-caddy.sh
SMOKE_HTTP=1 ./scripts/smoke-api.sh
```

Secrets: `/etc/itrain/postgrest.env` (generated, not in git).

## In repo (GitHub `main`)

| Item | Path |
|------|------|
| 3NF schema | [ANALYTICS-SCHEMA.md](ANALYTICS-SCHEMA.md) |
| Checklist | [ANALYTICS-IMPLEMENTATION.md](ANALYTICS-IMPLEMENTATION.md) |
| Client beacon (not wired) | `packages/analytics/analytics.js` |

## Not done yet

| Item | Notes |
|------|--------|
| DNS `api.itrain.ing` | [DNS.md](DNS.md) — then switch Caddy to `api.itrain.ing {` for TLS |
| Front-end beacon | Wire script + privacy policy per site |
| `009_drop_legacy_events.sql` | `sudo APPLY_DROP_LEGACY=1` re-run postgres install or apply script |
| Admin dashboard | Future |

## Pre-DNS test

```bash
SMOKE_HTTP=1 ./scripts/smoke-api.sh
# or
curl -H "Host: api.itrain.ing" http://137.184.37.56/rpc/start_session \
  -H "Content-Type: application/json" \
  -d '{"p_site_id":"powerlift","p_visitor_id":"00000000-0000-4000-8000-000000000099","p_ua_raw":"test","p_entry_path":"/"}'
```
