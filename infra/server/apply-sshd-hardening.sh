#!/bin/bash
# Apply non-disruptive sshd hardening. Test a second SSH session before closing the first.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$REPO_ROOT/infra/server/sshd/99-itrain-hardening.conf"
DEST=/etc/ssh/sshd_config.d/99-itrain-hardening.conf

install -d -m 0755 /etc/ssh/sshd_config.d
cp "$SRC" "$DEST"
chmod 644 "$DEST"
sshd -t
systemctl reload sshd
echo "Applied $DEST — verify a new SSH session before disconnecting."
