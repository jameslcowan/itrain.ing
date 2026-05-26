#!/usr/bin/env bash
# Apply analytics migrations 001–008 on a throwaway DB and exercise RPCs.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB="${TEST_DB:-itrain_migration_test}"
PSQL=(sudo -u postgres psql -v ON_ERROR_STOP=1)

run_psql() { "${PSQL[@]}" "$@"; }

echo "==> Recreate database ${DB}"
run_psql -d postgres -c "DROP DATABASE IF EXISTS ${DB};"
run_psql -d postgres -c "CREATE DATABASE ${DB};"

echo "==> Apply migrations (skip 009 legacy drop)"
for file in "$REPO_ROOT"/services/db/migrations/[0-9][0-9][0-9]_*.sql; do
  base=$(basename "$file")
  if [[ "$base" == "009_drop_legacy_events.sql" ]]; then
    continue
  fi
  echo "    $base"
  run_psql -d "$DB" -f - -q <"$file"
done

echo "==> RPC smoke (SQL)"
SESSION_ID=$(run_psql -d "$DB" -tAc \
  "SELECT (start_session('powerlift', '00000000-0000-4000-8000-000000000099'::uuid, 'test-db-migrations', 'https://example.com/'))::json->>'session_id';")
[[ -n "$SESSION_ID" ]] || { echo "start_session failed"; exit 1; }

run_psql -d "$DB" -tAc \
  "SELECT record_page_view('powerlift', '${SESSION_ID}'::uuid, '/programs/', null);"
run_psql -d "$DB" -tAc \
  "SELECT record_custom_event('powerlift', '${SESSION_ID}'::uuid, 'program_card_open', '/programs/', null, 'test-template', null, null);"

PV=$(run_psql -d "$DB" -tAc "SELECT count(*) FROM page_views;")
CE=$(run_psql -d "$DB" -tAc "SELECT count(*) FROM custom_events;")
echo "    page_views=${PV} custom_events=${CE}"

run_psql -d postgres -c "DROP DATABASE ${DB};"
echo "OK: migration + RPC test passed"
