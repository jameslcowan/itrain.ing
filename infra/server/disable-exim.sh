#!/bin/bash
# Disable local MTA if unused (reduces localhost attack surface).
set -euo pipefail

if systemctl is-active --quiet exim4 2>/dev/null; then
  systemctl disable --now exim4
  echo "exim4 disabled."
else
  echo "exim4 not running; nothing to do."
fi
