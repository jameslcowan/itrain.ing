#!/bin/bash
# Install nocodb.panax.ai Caddy vhost (included in install-panax-caddy.sh).
set -euo pipefail
exec "$(dirname "$0")/install-panax-caddy.sh"
