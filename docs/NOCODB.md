# NocoDB — visual admin for `itrain` Postgres

NocoDB is an **optional** spreadsheet-style UI on top of the existing analytics database. It does **not** replace PostgREST, migrations, or site ingest.

| System | Role |
|--------|------|
| **PostgreSQL `itrain`** | Source of truth (unchanged) |
| **PostgREST** | Public RPC API for sites (`api.itrain.ing`) |
| **NocoDB** | Internal browse/filter/export for humans |

NocoDB’s own config (users, views, invites) lives in **`/var/lib/itrain/nocodb`** (SQLite inside the container volume), not in the `itrain` database.

## Install (droplet)

```bash
cd /home/jameslcowan/itrain.ing
sudo ./infra/server/install-nocodb.sh
```

Optional Caddy vhost (pre-DNS HTTP, same pattern as API):

```bash
sudo ./infra/server/install-nocodb-caddy.sh
```

## First-time setup (once per install)

1. Open NocoDB (see [Access](#access) below).
2. **Sign up** — first account becomes workspace owner (use your email).
3. **Connect the analytics database:**
   - **Create base** → **Connect to external database** → **PostgreSQL**
   - Host: `host.docker.internal` (from the server UI; use `127.0.0.1` only if connecting via SSH tunnel from your laptop)
   - Port: `5432`
   - Database: `itrain`
   - User / password: from `/etc/itrain/nocodb.env` (`NOCODB_PG_USER`, `NOCODB_PG_PASSWORD`) — `sudo cat /etc/itrain/nocodb.env`
4. Select schemas/tables: `sites`, `sessions`, `page_views`, `custom_events`, etc.
5. **Invite family** (e.g. viewer): workspace → **Members** → invite email → role **Viewer** or **Editor** (see below).

Postgres user `itrain_nocodb` is **read-only** at the database layer. NocoDB cannot delete rows via SQL unless you grant more privileges and enable edit in the UI.

## Access

### You (SSH tunnel from Fedora)

```bash
ssh -L 8080:127.0.0.1:8080 jameslcowan@137.184.37.56
```

Browser: **http://localhost:8080**

### Pre-DNS on the droplet IP

```bash
# Caddy vhost installed
curl -sI -H "Host: nocodb.itrain.ing" http://137.184.37.56/
```

Browser (awkward): you’d need Host header or `/etc/hosts` — tunnel is simpler until DNS exists.

### After DNS (recommended for family)

1. Point `nocodb.itrain.ing` → droplet ([DNS.md](DNS.md)).
2. Change `infra/caddy/nocodb.itrain.ing.caddy` from `http://nocodb.itrain.ing` to `nocodb.itrain.ing {` for HTTPS.
3. `sudo ./infra/server/install-nocodb-caddy.sh && sudo systemctl reload caddy`
4. Set `NC_PUBLIC_URL=https://nocodb.itrain.ing` in `/etc/itrain/nocodb.env` and `sudo systemctl restart nocodb`.
5. Invite users by email in NocoDB — they sign in with a link (no SSH).

## Roles for family / collaborators

| NocoDB role | Good for |
|-------------|----------|
| **Viewer** | Wife — browse filters, export CSV, no schema changes |
| **Editor** | Update cells where you allow it (still read-only in Postgres today) |
| **Creator** | Add views; avoid for casual users |

Keep **Owner** to yourself. Do not share the `itrain_nocodb` Postgres password; use NocoDB invites only.

## What stays untouched

- `install-postgres.sh` / migrations — NocoDB does not run DDL on connect
- PostgREST service and `web_anon` RPC path
- Static sites and Caddy site vhosts
- Beacon → `api.itrain.ing` ingest

## Ops

```bash
systemctl status nocodb
journalctl -u nocodb -f
sudo systemctl restart nocodb
```

Uninstall (keeps Postgres data):

```bash
sudo systemctl disable --now nocodb
sudo docker rm -f nocodb
sudo rm -rf /var/lib/itrain/nocodb /etc/itrain/nocodb.env
# optional: DROP ROLE itrain_nocodb;
```

## Grant write access (optional, not default)

If you need grid editing against production tables:

```sql
-- as postgres, only if you accept the risk
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO itrain_nocodb;
```

Prefer read-only + exports for family; use SQL migrations for structural changes.
