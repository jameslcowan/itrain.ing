# Analytics / Phase 5 status (review 2026-05-26)

## Accomplished in repo (local `main`, 18+ commits ahead of `origin`)

### Documentation (Track A)

| Item | Path |
|------|------|
| 3NF schema + normalization proof | [ANALYTICS-SCHEMA.md](ANALYTICS-SCHEMA.md) |
| Execution checklist | [ANALYTICS-IMPLEMENTATION.md](ANALYTICS-IMPLEMENTATION.md) |
| Updated backlog | [TODO.md](TODO.md) |
| Stack summary | [ANALYTICS.md](ANALYTICS.md) |
| DATABASE.md aligned with RPCs | [DATABASE.md](DATABASE.md) |

### Database (Track B)

| Migration | Purpose |
|-----------|---------|
| `001_init.sql` | Bootstrap `sites`, legacy `events` (drop via `009`) |
| `002` | `platforms`, extend `sites` |
| `003` | Dimensions + `upsert_*` helpers |
| `004` | `sessions`, `page_views` |
| `005` | `custom_events` |
| `006` | `start_session`, `record_page_view` |
| `007` | `record_custom_event` |
| `008` | Per-site `*_page_views` views |
| `009` | Drop legacy `events` / `collect_event` |

### Infra scripts (Track C — in repo)

| Script | Purpose |
|--------|---------|
| `infra/server/install-postgres.sh` | Ordered migrations `001`–`008` (skip `009` unless env set) |
| `infra/server/install-postgrest.sh` | PostgREST binary + systemd |
| `infra/caddy/api.itrain.ing.caddy` | Reverse proxy `:3000` |
| `scripts/smoke-api.sh` | Remote RPC smoke (`SMOKE_HTTP=1` for port 80) |
| `scripts/test-db-migrations.sh` | Local throwaway DB + RPC test |
| `scripts/apply-pending-migrations.sh` | Upgrade existing droplet DB (`002+`) |

### Client (Track D — partial)

| Item | Status |
|------|--------|
| `packages/analytics/analytics.js` | Written, **not** wired into site HTML |
| Privacy policy updates | Not started |
| Per-site enablement | Not started |

### Other verified locally

| Test | Result |
|------|--------|
| `node --test` codec (all 5 sites) | 6/6 pass per site |
| `./scripts/test-db-migrations.sh` | Run after `003` SQL fix |

---

## Not accomplished (requires droplet / you)

| Item | Blocker |
|------|---------|
| `git push origin main` | Not pushed from Fedora session |
| Postgres migrations on droplet | SSH key from this env denied; pull + `apply-pending-migrations.sh` on server |
| PostgREST running | `install-postgrest.sh` on droplet |
| Caddy `api.itrain.ing` vhost | File in repo; **not** active on droplet (HTTP `Host: api.itrain.ing` returns default suite page) |
| `smoke-api.sh` against production | Fails until above |
| `009_drop_legacy_events.sql` | After RPC smoke |
| DNS cutover | **Held** by design |
| GitHub Actions secrets / verified deploy | Open |
| Front-end beacon on sites | After API + privacy |

---

## Droplet spot-check (from Fedora, no SSH)

| Check | Result |
|-------|--------|
| `Host: powerlift.ing` → droplet | HTTP 308 (redirect) |
| `Host: api.itrain.ing` → droplet:80 | 200 but **default Caddy page**, not PostgREST |
| `api.itrain.ing` HTTPS `--resolve` | TLS error (no cert / wrong backend) |

---

## Next actions (in order)

1. **Push** `main` to GitHub.
2. **SSH** to droplet as `jameslcowan`, pull repo.
3. `sudo ./scripts/apply-pending-migrations.sh` (or full `install-postgres.sh` on fresh DB).
4. `sudo ./infra/server/install-postgrest.sh`
5. `sudo cp infra/caddy/api.itrain.ing.caddy /etc/caddy/sites/ && sudo systemctl reload caddy`
6. `SMOKE_HTTP=1 ./scripts/smoke-api.sh` then HTTPS when TLS ready.
7. `sudo APPLY_DROP_LEGACY=1` … `009_drop_legacy_events.sql` + restart postgrest.

---

## Intentionally deferred

- DNS (all `.ing` + `api`)
- Netlify legacy shutdown
- Analytics beacon in HTML + privacy copy
- Admin dashboard / read role
