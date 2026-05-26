#!/usr/bin/env bash
# Apply analytics migrations 002+ on an existing panax database (droplet).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB="${DB_NAME:-panax}"
MIGRATIONS_DIR="$REPO_ROOT/services/db/migrations"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

for file in "$MIGRATIONS_DIR"/[0-9][0-9][0-9]_*.sql; do
  base=$(basename "$file")
  if [[ "$base" == "001_init.sql" ]]; then
    continue
  fi
  if [[ "$base" == "009_drop_legacy_events.sql" && "${APPLY_DROP_LEGACY:-0}" != "1" ]]; then
    echo "Skipping $base (set APPLY_DROP_LEGACY=1 after smoke-api.sh)"
    continue
  fi
  echo "Applying $base..."
  sudo -u postgres psql -v ON_ERROR_STOP=1 -d "$DB" -f - <"$file"
done

echo "Done. Restart PostgREST: systemctl restart postgrest"
