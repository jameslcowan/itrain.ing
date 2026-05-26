#!/bin/bash
# Install api.panax.ai Caddy vhost (reverse proxy to PostgREST :3000).
set -euo pipefail
exec "$(dirname "$0")/install-panax-caddy.sh"
