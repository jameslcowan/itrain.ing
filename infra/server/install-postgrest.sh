#!/bin/bash
# PostgREST binary + systemd (reads /etc/panax/postgrest.env).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
# shellcheck source=platform-paths.sh
source "$REPO_ROOT/infra/server/platform-paths.sh"
ENV_FILE="${PANAX_ETC_DIR}/postgrest.env"

VERSION=12.2.8
ARCH=linux-static-x86-64
URL="https://github.com/PostgREST/postgrest/releases/download/v${VERSION}/postgrest-v${VERSION}-${ARCH}.tar.xz"
BIN=/usr/local/bin/postgrest

[[ -f "$ENV_FILE" ]] || { echo "Run install-postgres.sh first."; exit 1; }

apt-get install -y -qq curl xz-utils
tmpdir=$(mktemp -d)
trap 'rm -rf "$tmpdir"' EXIT
curl -fsSL "$URL" -o "$tmpdir/postgrest.tar.xz"
tar -xJf "$tmpdir/postgrest.tar.xz" -C "$tmpdir"
install -m 0755 "$tmpdir/postgrest" "$BIN"

cat > /etc/systemd/system/postgrest.service <<'UNIT'
[Unit]
Description=PostgREST API (Panax platform)
After=postgresql.service
Requires=postgresql.service

[Service]
EnvironmentFile=/etc/panax/postgrest.env
ExecStart=/usr/local/bin/postgrest
Restart=on-failure
User=postgres
Group=postgres

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable postgrest
systemctl restart postgrest
sleep 1
curl -sf "http://127.0.0.1:3000/" >/dev/null && echo "PostgREST responding on :3000" || {
  journalctl -u postgrest -n 20 --no-pager
  exit 1
}
