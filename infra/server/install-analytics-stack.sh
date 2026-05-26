#!/bin/bash
# Full analytics stack on droplet: Postgres → PostgREST → Caddy api vhost → smoke.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root: sudo $0" >&2
  exit 1
fi

"$REPO_ROOT/infra/server/install-postgres.sh"
"$REPO_ROOT/infra/server/install-postgrest.sh"
"$REPO_ROOT/infra/server/install-api-caddy.sh"

echo "==> smoke-api (HTTP, Host: api.panax.ai)"
SMOKE_HTTP=1 DROPLET=127.0.0.1 "$REPO_ROOT/scripts/smoke-api.sh"

echo "Analytics stack ready. Run install-panax-caddy.sh after panax.ai DNS; then smoke without SMOKE_HTTP."
