#!/bin/bash
# Create admin user jameslcowan with sudo and the same SSH key as root.
set -euo pipefail

ADMIN=jameslcowan
ROOT_KEYS=/root/.ssh/authorized_keys

if ! id "$ADMIN" &>/dev/null; then
  useradd -m -s /bin/bash "$ADMIN"
  echo "Created user $ADMIN"
fi

usermod -aG sudo "$ADMIN"
install -d -m 0700 -o "$ADMIN" -g "$ADMIN" "/home/$ADMIN/.ssh"
if [[ -f "$ROOT_KEYS" ]]; then
  cp "$ROOT_KEYS" "/home/$ADMIN/.ssh/authorized_keys"
  chown "$ADMIN:$ADMIN" "/home/$ADMIN/.ssh/authorized_keys"
  chmod 600 "/home/$ADMIN/.ssh/authorized_keys"
fi

# Passwordless sudo for remote admin (Cursor / automation)
echo "$ADMIN ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/$ADMIN"
chmod 440 "/etc/sudoers.d/$ADMIN"
visudo -cf "/etc/sudoers.d/$ADMIN"

su - "$ADMIN" -c 'whoami && sudo -n whoami'
echo "Admin $ADMIN ready. Test: ssh ${ADMIN}@YOUR_HOST"
