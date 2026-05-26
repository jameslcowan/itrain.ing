#!/usr/bin/env bash
# Reset a local clone after main history rewrite + install repo git hooks.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

HUMAN_NAME="${GIT_HUMAN_NAME:-James L. Cowan Jr.}"
HUMAN_EMAIL="${GIT_HUMAN_EMAIL:-jameslloydcowan@gmail.com}"

echo "==> Fetching origin"
git fetch origin

echo "==> Resetting main to origin/main (discards stale SHAs)"
git checkout -B main origin/main
git reset --hard origin/main

echo "==> Human git identity (repo-local)"
git config user.name "$HUMAN_NAME"
git config user.email "$HUMAN_EMAIL"

echo "==> Repo git hooks (blocks bad trailers and stale-history pushes)"
git config core.hooksPath .githooks
chmod +x .githooks/* 2>/dev/null || true

echo "==> Cursor attribution off (project)"
if [ -f .cursor/cli.json ]; then
  grep -q '"attributeCommitsToAgent": false' .cursor/cli.json || \
    echo "WARN: set attributeCommitsToAgent false in .cursor/cli.json"
fi

echo "==> Verify last commit"
git log -1 --format='commit %h%nAuthor: %an <%ae>%n%s%n%b' | sed '/^$/d'
if git log -1 --format='%B' | grep -qi 'co-authored-by:.*cursor'; then
  echo "ERROR: Co-authored-by Cursor still present on HEAD" >&2
  exit 1
fi

echo "OK: clone matches origin/main; hooks and identity configured."
