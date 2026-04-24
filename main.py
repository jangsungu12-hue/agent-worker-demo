"""Serve the calculator app with a simple login API."""

from __future__ import annotations

import json
import secrets
from functools import partial
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


HOST = "127.0.0.1"
PORT = 8000
SESSION_COOKIE = "session_id"
STATIC_DIR = Path(__file__).resolve().parent
DEMO_USER = {
    "email": "demo@demo.com",
    "password": "password123",
    "name": "Demo User",
}


class AppHandler(SimpleHTTPRequestHandler):
    """Serve static files and a small in-memory auth API."""

    def __init__(self, *args, directory: str | None = None, **kwargs) -> None:
        super().__init__(*args, directory=directory, **kwargs)

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/api/session":
            self.handle_session()
            return
        if self.path == "/":
            self.path = "/index.html"
        super().do_GET()

    def do_POST(self) -> None:  # noqa: N802
        if self.path == "/api/login":
            self.handle_login()
            return
        if self.path == "/api/logout":
            self.handle_logout()
            return
        self.send_error(HTTPStatus.NOT_FOUND, "Unknown endpoint.")

    def handle_session(self) -> None:
        user = self.get_current_user()
        payload = {"authenticated": bool(user)}
        if user:
            payload["user"] = user
        self.send_json(HTTPStatus.OK, payload)

    def handle_login(self) -> None:
        payload = self.read_json_body()
        if payload is None:
            self.send_json(
                HTTPStatus.BAD_REQUEST,
                {"message": "Request body must be valid JSON."},
            )
            return

        email = str(payload.get("email", "")).strip()
        password = str(payload.get("password", ""))

        if not email or not password:
            self.send_json(
                HTTPStatus.BAD_REQUEST,
                {"message": "Enter both email and password."},
            )
            return

        if email != DEMO_USER["email"] or password != DEMO_USER["password"]:
            self.send_json(
                HTTPStatus.UNAUTHORIZED,
                {"message": "Invalid email or password."},
            )
            return

        session_id = secrets.token_urlsafe(24)
        user = {
            "email": DEMO_USER["email"],
            "name": DEMO_USER["name"],
        }
        self.server.sessions[session_id] = user

        self.send_response(HTTPStatus.OK)
        self.send_session_cookie(session_id)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps({"user": user}).encode("utf-8"))

    def handle_logout(self) -> None:
        session_id = self.get_session_id()
        if session_id:
            self.server.sessions.pop(session_id, None)

        self.send_response(HTTPStatus.OK)
        self.send_expired_session_cookie()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps({"success": True}).encode("utf-8"))

    def read_json_body(self) -> dict[str, object] | None:
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            return None

        raw_body = self.rfile.read(content_length)
        try:
            payload = json.loads(raw_body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return None

        return payload if isinstance(payload, dict) else None

    def get_current_user(self) -> dict[str, str] | None:
        session_id = self.get_session_id()
        if not session_id:
            return None
        return self.server.sessions.get(session_id)

    def get_session_id(self) -> str | None:
        raw_cookie = self.headers.get("Cookie")
        if not raw_cookie:
            return None

        cookie = SimpleCookie()
        cookie.load(raw_cookie)
        morsel = cookie.get(SESSION_COOKIE)
        return morsel.value if morsel else None

    def send_session_cookie(self, session_id: str) -> None:
        self.send_header(
            "Set-Cookie",
            f"{SESSION_COOKIE}={session_id}; HttpOnly; Path=/; SameSite=Lax",
        )

    def send_expired_session_cookie(self) -> None:
        self.send_header(
            "Set-Cookie",
            f"{SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax",
        )

    def send_json(self, status: HTTPStatus, payload: dict[str, object]) -> None:
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode("utf-8"))


class AppServer(ThreadingHTTPServer):
    """HTTP server with shared session storage."""

    def __init__(self, server_address: tuple[str, int], handler_class) -> None:
        super().__init__(server_address, handler_class)
        self.sessions: dict[str, dict[str, str]] = {}


def main() -> None:
    handler = partial(AppHandler, directory=str(STATIC_DIR))
    server = AppServer((HOST, PORT), handler)
    print(f"Serving app at http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
