#!/bin/bash
# Build and rsync every site in sites/ to /var/www/<domain>/
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
EXCLUDES="$REPO/infra/deploy/rsync-excludes.txt"

declare -A SITES=(
  [powerlifting]=powerlift.ing
  [powerbuilding]=powerbuild.ing
  [olympiclifting]=olympiclift.ing
  [bootybuilding]=bootybuild.ing
  [itraining]=itrain.ing
)

for folder in "${!SITES[@]}"; do
  domain="${SITES[$folder]}"
  src="$REPO/sites/$folder"
  dest="/var/www/$domain"

  echo "==> $folder -> $dest"
  mkdir -p "$dest"
  cd "$src"
  npm ci
  npm run build
  rsync -avzr --delete --delete-excluded --exclude-from="$EXCLUDES" ./ "$dest/"
done

chown -R deploy:www-data /var/www/*.ing
chmod -R g+w /var/www/*.ing
echo "All sites deployed."
