#!/usr/bin/env bash
# Standard Git remote: SSH (not HTTPS). Run once per clone.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# After GitHub rename: git@github.com:jameslcowan/panax.git
SSH_URL="git@github.com:jameslcowan/itrain.ing.git"
current="$(git remote get-url origin 2>/dev/null || true)"

if [[ "$current" == "$SSH_URL" ]]; then
  echo "origin already uses SSH: $SSH_URL"
  exit 0
fi

git remote set-url origin "$SSH_URL"
echo "origin -> $SSH_URL"
echo "Ensure ~/.ssh/id_ed25519 is added to https://github.com/settings/keys"
echo "Test: ssh -T git@github.com"
