#!/bin/bash
# One-time: rename live platform paths (DB, /etc, /var/lib) from itrain → panax.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
# shellcheck source=platform-paths.sh
source "$REPO_ROOT/infra/server/platform-paths.sh"

OLD_ETC=/etc/itrain
OLD_DATA=/var/lib/itrain
OLD_DB=itrain

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

echo "==> Stop services"
systemctl stop nocodb postgrest 2>/dev/null || true

if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${OLD_DB}'" | grep -q 1; then
  echo "==> Rename database ${OLD_DB} → ${PANAX_DB_NAME}"
  sudo -u postgres psql -d postgres -v ON_ERROR_STOP=1 <<SQL
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${OLD_DB}' AND pid <> pg_backend_pid();
ALTER DATABASE ${OLD_DB} RENAME TO ${PANAX_DB_NAME};
SQL
fi

if [[ -d "$OLD_ETC" && ! -e "$PANAX_ETC_DIR" ]]; then
  echo "==> Move ${OLD_ETC} → ${PANAX_ETC_DIR}"
  mv "$OLD_ETC" "$PANAX_ETC_DIR"
elif [[ -d "$OLD_ETC" && -d "$PANAX_ETC_DIR" ]]; then
  echo "Merge ${OLD_ETC} into ${PANAX_ETC_DIR}"
  cp -a "$OLD_ETC"/* "$PANAX_ETC_DIR"/
  rm -rf "$OLD_ETC"
fi

if [[ -d "$OLD_DATA" && ! -e "$PANAX_DATA_DIR" ]]; then
  echo "==> Move ${OLD_DATA} → ${PANAX_DATA_DIR}"
  mv "$OLD_DATA" "$PANAX_DATA_DIR"
fi

if [[ -f "${PANAX_ETC_DIR}/postgrest.env" ]]; then
  sed -i "s|/${OLD_DB}|/${PANAX_DB_NAME}|g; s|database=${OLD_DB}|database=${PANAX_DB_NAME}|g" "${PANAX_ETC_DIR}/postgrest.env"
fi

echo "==> Reinstall PostgREST + NocoDB units (paths + ${PANAX_ETC_DIR})"
"$REPO_ROOT/infra/server/install-postgrest.sh"
"$REPO_ROOT/infra/server/install-nocodb.sh"

echo "==> Caddy panax vhosts"
"$REPO_ROOT/infra/server/install-panax-caddy.sh"

echo "==> Apply migrations 011 + 012 if needed"
for mig in 011_platform_panax.sql 012_rename_nocodb_role.sql; do
  if [[ -f "$REPO_ROOT/services/db/migrations/$mig" ]]; then
    sudo -u postgres psql -v ON_ERROR_STOP=1 -d "$PANAX_DB_NAME" -f - <"$REPO_ROOT/services/db/migrations/$mig" || true
  fi
done

SMOKE_HTTP=1 "$REPO_ROOT/scripts/smoke-api.sh"
echo "OK: platform paths migrated to panax"
