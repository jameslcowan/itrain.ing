#!/bin/bash
# Disable root SSH login. Run only after jameslcowan SSH is verified.
set -euo pipefail

DROPIN=/etc/ssh/sshd_config.d/99-itrain-root-login.conf
cat > "$DROPIN" << 'EOF'
# Managed by itrain.ing — root login disabled after admin user verified
PermitRootLogin no
EOF
chmod 644 "$DROPIN"
sshd -t
systemctl reload sshd
echo "PermitRootLogin no applied. Root SSH disabled; use jameslcowan@host."
