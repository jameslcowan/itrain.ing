#!/usr/bin/env python3
"""Deprecated: use repo-root `npm run dev:powerlifting` (scripts/dev-server.py)."""

import os
import subprocess
import sys

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
ROOT_SCRIPT = os.path.join(REPO, "scripts", "dev-server.py")

if __name__ == "__main__":
    raise SystemExit(
        subprocess.call(
            [sys.executable, ROOT_SCRIPT, "sites/powerlifting", "8080"],
            cwd=REPO,
        )
    )
