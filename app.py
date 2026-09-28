import os
import sys
import subprocess
import threading
import time
import shutil
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
import requests
from dotenv import load_dotenv

load_dotenv()

# Determine project base directory
BASE_DIR = Path(__file__).resolve().parent
SUBDIR = BASE_DIR / "ai-agent-1.0-69f761fecbb863689f6a433fb075fc31f838d71b"
PROJECT_DIR = SUBDIR if SUBDIR.exists() and (SUBDIR / "server.js").exists() else BASE_DIR

# Frontend build directory
DIST_DIR = PROJECT_DIR / "dist"
if not DIST_DIR.exists() and (BASE_DIR / "dist").exists():
    DIST_DIR = BASE_DIR / "dist"

app = Flask(
    __name__,
    static_folder=str(DIST_DIR) if DIST_DIR.exists() else None,
    static_url_path=""
)

FLASK_PORT = int(os.environ.get("PORT", 5000))
NODE_PORT = int(os.environ.get("NODE_PORT", 5002 if FLASK_PORT == 5001 else 5001))
NODE_URL = f"http://127.0.0.1:{NODE_PORT}"
node_process = None

def start_node_backend():
    global node_process
    server_js = PROJECT_DIR / "server.js"
    if not server_js.exists():
        print(f"Warning: server.js not found in {PROJECT_DIR}")
        return

    node_bin = shutil.which("node")
    if not node_bin:
        print("Notice: Node.js runtime not detected in this Python environment.")
        return

    env = os.environ.copy()
    env["PORT"] = str(NODE_PORT)

    try:
        print(f"Starting Node.js backend from {PROJECT_DIR} on port {NODE_PORT}...")
        node_process = subprocess.Popen(
            [node_bin, "server.js"],
            cwd=str(PROJECT_DIR),
            env=env
        )
        print("Node.js backend process spawned successfully.")
    except Exception as e:
        print(f"Failed to spawn Node.js backend: {e}")

# Start node backend in background if node exists
threading.Thread(target=start_node_backend, daemon=True).start()

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "ok": True,
        "status": "healthy",
        "service": "vibescape-ai-render",
        "node_backend_active": node_process is not None and node_process.poll() is None
    })

@app.route("/api/<path:subpath>", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
def proxy_api(subpath):
    target_url = f"{NODE_URL}/api/{subpath}"
    try:
        req_headers = {k: v for k, v in request.headers if k.lower() not in ["host", "content-length"]}
        resp = requests.request(
            method=request.method,
            url=target_url,
            headers=req_headers,
            data=request.get_data(),
            params=request.args,
            timeout=30
        )
        excluded_headers = ["content-encoding", "content-length", "transfer-encoding", "connection"]
        headers = [(k, v) for k, v in resp.raw.headers.items() if k.lower() not in excluded_headers]
        return resp.content, resp.status_code, headers
    except requests.exceptions.RequestException:
        # Fallback if node backend is still spinning up
        return jsonify({
            "error": "Backend starting up or node server unreachable.",
            "retry": True
        }), 503

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if DIST_DIR.exists():
        file_path = DIST_DIR / path
        if path != "" and file_path.exists():
            return send_from_directory(str(DIST_DIR), path)
        index_file = DIST_DIR / "index.html"
        if index_file.exists():
            return send_from_directory(str(DIST_DIR), "index.html")
    return jsonify({
        "message": "Vibescape AI Cinema And Music Service is running.",
        "api_health": "/api/health"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=FLASK_PORT)
