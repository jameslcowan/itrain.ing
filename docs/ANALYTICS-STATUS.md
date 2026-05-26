# Analytics / Phase 5 status

Last verified on droplet **2026-05-26**.

## Live on droplet (`panax` / `137.184.37.56`)

| Component | Status |
|-----------|--------|
| PostgreSQL `panax` DB | **Running** — `platform_id = panax` (migration `011`) |
| PostgREST `:3000` | **Running** |
| Caddy `api.panax.ai` | Install via `install-panax-caddy.sh` after DNS |
| `panax.ai` placeholder | `/var/www/panax.ai/` |
| `SMOKE_HTTP=1 ./scripts/smoke-api.sh` | Uses `Host: api.panax.ai` |

## Install

```bash
sudo ./infra/server/install-analytics-stack.sh
sudo ./infra/server/install-panax-caddy.sh   # after panax.ai DNS at Porkbun
```

See [DNS.md](DNS.md), [PANAX-VISION.md](PANAX-VISION.md).
