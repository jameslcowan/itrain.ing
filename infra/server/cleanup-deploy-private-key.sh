#!/bin/bash
# Remove deploy private key from server — only the public key belongs in authorized_keys.
# GitHub Actions must already have SSH_PRIVATE_KEY set.
set -euo pipefail

KEY=/home/deploy/.ssh/deploy_key
if [[ -f "$KEY" ]]; then
  rm -f "$KEY"
  echo "Removed $KEY (private). Public key and authorized_keys unchanged."
else
  echo "No private deploy key on disk."
fi

chown deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys 2>/dev/null || true
chmod 644 /home/deploy/.ssh/deploy_key.pub 2>/dev/null || true
