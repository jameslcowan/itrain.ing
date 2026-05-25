#!/usr/bin/env python3
"""Run dev servers for all suite sites on separate ports."""

import os
import signal
import subprocess
import sys
import time

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEV_SERVER = os.path.join(REPO_ROOT, "scripts", "dev-server.py")

SITES = (
    ("sites/powerlifting", 8080),
    ("sites/powerbuilding", 8081),
    ("sites/olympiclifting", 8082),
    ("sites/bootybuilding", 8083),
    ("sites/itraining", 8084),
)


def main() -> None:
    procs: list[subprocess.Popen] = []
    print("Starting suite dev servers (Ctrl+C to stop all):\n")
    for site, port in SITES:
        proc = subprocess.Popen(
            [sys.executable, DEV_SERVER, site, str(port)],
            cwd=REPO_ROOT,
        )
        procs.append(proc)
        print(f"  http://127.0.0.1:{port}/  →  {site}")

    print()

    def shutdown(*_args):
        for proc in procs:
            proc.terminate()
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    while True:
        for proc in procs:
            if proc.poll() is not None:
                shutdown()
        time.sleep(0.5)


if __name__ == "__main__":
    main()
