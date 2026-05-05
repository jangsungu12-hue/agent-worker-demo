"""Serve the calculator app."""

from __future__ import annotations

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


HOST = "127.0.0.1"
PORT = 8001
STATIC_DIR = Path(__file__).resolve().parent


class AppHandler(SimpleHTTPRequestHandler):
    """Serve static files for the calculator."""

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/":
            self.path = "/index.html"
        super().do_GET()


def main() -> None:
    handler = partial(AppHandler, directory=str(STATIC_DIR))
    server = ThreadingHTTPServer((HOST, PORT), handler)
    print(f"Serving calculator at http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
