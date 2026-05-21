#!/usr/bin/env python3
"""Static dev server with Netlify-like SPA routes for /app and /program/."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path in ("/app", "/app/") or path.startswith("/program/") or path.startswith("/p/"):
            self.path = "/app.html"
        super().do_GET()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    server = ThreadingHTTPServer(("", port), Handler)
    print(f"Serving {ROOT} at http://127.0.0.1:{port}/")
    print("Routes: / → landing, /app and /program/* → app.html")
    server.serve_forever()
