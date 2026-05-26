#!/bin/bash
# Push main to GitHub via SSH deploy key (requires write deploy key on repo).
set -euo pipefail

REPO=/root/itrain.ing
KEY=/root/.ssh/github_push

cd "$REPO"
if [[ ! -f "$KEY" ]]; then
  echo "Missing $KEY — see docs/GITHUB-PUSH.md"
  exit 1
fi

export GIT_SSH_COMMAND="ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
git remote set-url origin git@github.com:jameslcowan/itrain.ing.git
git push origin main
