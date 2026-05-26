#!/bin/bash
# Push main to GitHub via SSH deploy key (requires write deploy key on repo).
set -euo pipefail

KEY=/root/.ssh/github_push
REPO="${1:-/home/jameslcowan/panax}"
# Until GitHub repo is renamed to panax, push to itrain.ing (redirects after rename).
PUSH_REMOTE="${GIT_PUSH_REMOTE:-git@github.com:jameslcowan/itrain.ing.git}"

cd "$REPO"
if [[ ! -f "$KEY" ]]; then
  echo "Missing $KEY — see docs/GITHUB-PUSH.md"
  exit 1
fi

export GIT_SSH_COMMAND="ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
git push "$PUSH_REMOTE" main:main
