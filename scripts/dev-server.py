#!/usr/bin/env python3
"""Static dev server with Netlify-like SPA routes for /app and legacy /program/."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def site_root() -> str:
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        return arg if os.path.isabs(arg) else os.path.join(REPO_ROOT, arg)
    return os.path.join(REPO_ROOT, "sites", "powerlifting")


ROOT = site_root()


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

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            path = os.path.join(ROOT, "404.html")
            if os.path.isfile(path):
                try:
                    with open(path, "rb") as f:
                        body = f.read()
                    self.send_response(404)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.send_header("Content-Length", str(len(body)))
                    self.end_headers()
                    self.wfile.write(body)
                    return
                except OSError:
                    pass
        super().send_error(code, message, explain)

    def do_GET(self):
        self._rewrite_spa_path()
        super().do_GET()

    def do_HEAD(self):
        self._rewrite_spa_path()
        super().do_HEAD()


if __name__ == "__main__":
    port = int(sys.argv[2]) if len(sys.argv) > 2 else int(os.environ.get("PORT", "8080"))
    server = ThreadingHTTPServer(("", port), Handler)
    print(f"Serving {ROOT} at http://127.0.0.1:{port}/")
    print("Routes: / → landing, /app and /app/* (and legacy /program/*) → app.html")
    server.serve_forever()
