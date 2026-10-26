#!/usr/bin/env python3
"""Serve the site. Unknown paths get 404.html (same as GitHub Pages).

Stops after 20 minutes with no file change and no Cursor prompt.
IDLE_SECONDS overrides the idle window. ACTIVITY_FILE overrides the stamp.
"""

import os
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
PAGE = os.path.join(ROOT, "404.html")
ACTIVITY = os.environ.get(
    "ACTIVITY_FILE",
    os.path.join(os.path.expanduser("~"), ".cursor", "emerickli-site-activity"),
)
IDLE_SECONDS = int(os.environ.get("IDLE_SECONDS", "1200"))
SKIP_DIRS = {".git", "__pycache__", ".cursor"}


def stamp_activity():
    folder = os.path.dirname(ACTIVITY)
    if folder:
        os.makedirs(folder, exist_ok=True)
    with open(ACTIVITY, "w", encoding="utf-8") as handle:
        handle.write(str(time.time()))


def newest_site_mtime():
    newest = 0.0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [name for name in dirnames if name not in SKIP_DIRS]
        for name in filenames:
            path = os.path.join(dirpath, name)
            try:
                newest = max(newest, os.path.getmtime(path))
            except OSError:
                pass
    return newest


def last_activity(started):
    times = [started, newest_site_mtime()]
    try:
        times.append(os.path.getmtime(ACTIVITY))
    except OSError:
        pass
    return max(times)


def watch_idle(httpd, started):
    while True:
        time.sleep(15)
        idle = time.time() - last_activity(started)
        if idle >= IDLE_SECONDS:
            print(f"idle {int(idle)}s — shutting down")
            threading.Thread(target=httpd.shutdown, daemon=True).start()
            return


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
    stamp_activity()
    port = int(os.environ.get("PORT", "47291"))
    httpd = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    started = time.time()
    threading.Thread(target=watch_idle, args=(httpd, started), daemon=True).start()
    print(f"serving {ROOT} on http://127.0.0.1:{port}")
    print(f"stops after {IDLE_SECONDS}s with no edits or prompts")
    httpd.serve_forever()
