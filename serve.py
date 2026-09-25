#!/usr/bin/env python3
"""Serve the site. Unknown paths get 404.html (same as GitHub Pages)."""

import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(ROOT, "404.html")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def send_error(self, code, message=None, explain=None):
        if code == 404 and os.path.isfile(PAGE):
            with open(PAGE, "rb") as f:
                body = f.read()
            self.send_response(404, "Not Found")
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().send_error(code, message, explain)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "47291"))
    httpd = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"serving {ROOT} on http://127.0.0.1:{port}")
    httpd.serve_forever()
