#!/bin/bash
# Install api.itrain.ing Caddy vhost (reverse proxy to PostgREST :3000).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$REPO_ROOT/infra/caddy/api.itrain.ing.caddy"
DEST=/etc/caddy/sites/api.itrain.ing.caddy

[[ -f "$SRC" ]] || { echo "Missing $SRC"; exit 1; }

install -m 0644 "$SRC" "$DEST"
caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
echo "Caddy vhost installed: $DEST → 127.0.0.1:3000"
