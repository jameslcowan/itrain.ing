#!/bin/bash
# Install all panax.ai Caddy vhosts (apex, api, nocodb) and reload.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SITES_DIR=/etc/caddy/sites

for name in panax.ai api.panax.ai nocodb.panax.ai; do
  install -m 0644 "$REPO_ROOT/infra/caddy/${name}.caddy" "$SITES_DIR/${name}.caddy"
done

# Retired platform hostnames (product itrain.ing vhost unchanged)
rm -f "$SITES_DIR/api.itrain.ing.caddy" "$SITES_DIR/nocodb.itrain.ing.caddy"

"$REPO_ROOT/infra/server/install-panax-www.sh"

if [[ -f /etc/caddy/Caddyfile ]]; then
  sed -i 's/admin@itrain\.ing/admin@panax.ai/g' /etc/caddy/Caddyfile
  sed -i 's/itrain\.ing suite/Panax platform/g' /etc/caddy/Caddyfile
fi

caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
echo "Caddy: panax.ai, api.panax.ai, nocodb.panax.ai"
