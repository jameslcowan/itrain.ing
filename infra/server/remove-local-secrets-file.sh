#!/bin/bash
# Remove one-time setup notes that reference deploy keys.
set -euo pipefail

for f in /root/DEPLOY-SECRETS.txt; do
  if [[ -f "$f" ]]; then
    rm -f "$f"
    echo "Removed $f"
  fi
done
