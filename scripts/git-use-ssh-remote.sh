#!/usr/bin/env bash
# Standard Git remote: SSH (not HTTPS). Run once per clone.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

SSH_URL="git@github.com:jameslcowan/panax.git"
current="$(git remote get-url origin 2>/dev/null || true)"

if [[ "$current" == "$SSH_URL" ]]; then
  echo "origin already uses SSH: $SSH_URL"
  exit 0
fi

git remote set-url origin "$SSH_URL"
echo "origin -> $SSH_URL"
echo "Ensure GitHub repo is named panax (Settings → General → Repository name)."
echo "Test: ssh -T git@github.com"
