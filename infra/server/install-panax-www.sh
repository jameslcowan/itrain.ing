#!/bin/bash
# Deploy static panax.ai placeholder to /var/www/panax.ai
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$REPO_ROOT/infra/www/panax.ai"
DEST=/var/www/panax.ai

install -d -m 0755 "$DEST"
rsync -a --delete "$SRC/" "$DEST/"
chown -R deploy:www-data "$DEST"
echo "Deployed $DEST"
