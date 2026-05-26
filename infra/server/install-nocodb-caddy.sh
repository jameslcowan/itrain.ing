#!/bin/bash
# Optional: Caddy vhost for nocodb.itrain.ing → localhost:8080 (pre-DNS HTTP).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$REPO_ROOT/infra/caddy/nocodb.itrain.ing.caddy"
DEST=/etc/caddy/sites/nocodb.itrain.ing.caddy

[[ -f "$SRC" ]] || { echo "Missing $SRC"; exit 1; }

install -m 0644 "$SRC" "$DEST"
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
echo "Caddy vhost: $DEST (optional; NocoDB still on 127.0.0.1:8080)"
