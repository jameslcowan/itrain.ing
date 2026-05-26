#!/bin/bash
# 2GB swap for 2GB droplet (recommended before PostgreSQL on-box).
set -euo pipefail

if swapon --show | grep -q '/swapfile'; then
  echo "Swap already enabled."
  swapon --show
  exit 0
fi

fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
echo "Swap enabled:"
swapon --show
