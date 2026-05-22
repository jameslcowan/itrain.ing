#!/usr/bin/env python3
"""Static dev server with Netlify-like SPA routes for /app and legacy /program/."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def _rewrite_spa_path(self):
        raw = self.path
        path = raw.split("?", 1)[0].rstrip("/") or "/"
        if (
            path == "/app"
            or path.startswith("/app/")
            or path.startswith("/program/")
            or path.startswith("/p/")
        ):
            qs = raw.split("?", 1)[1] if "?" in raw else ""
            self.path = "/app.html" + (f"?{qs}" if qs else "")

    def do_GET(self):
        self._rewrite_spa_path()
        super().do_GET()

    def do_HEAD(self):
        self._rewrite_spa_path()
        super().do_HEAD()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    server = ThreadingHTTPServer(("", port), Handler)
    print(f"Serving {ROOT} at http://127.0.0.1:{port}/")
    print("Routes: / → landing, /app and /app/* (and legacy /program/*) → app.html")
    server.serve_forever()
