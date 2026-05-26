#!/bin/bash
# Push main to GitHub via SSH deploy key (requires write deploy key on repo).
set -euo pipefail

KEY=/root/.ssh/github_push
REPO="${1:-/home/jameslcowan/panax}"

cd "$REPO"
if [[ ! -f "$KEY" ]]; then
  echo "Missing $KEY — see docs/GITHUB-PUSH.md"
  exit 1
fi

export GIT_SSH_COMMAND="ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
git remote set-url origin git@github.com:jameslcowan/panax.git
git push origin main
