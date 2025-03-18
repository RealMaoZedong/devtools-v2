from flask import Flask, send_from_directory, abort, redirect, request
import os
import logging

app = Flask(__name__)
PUBLIC_DIR = "public"

@app.route("/datautil/<path:filename>")
def serve_file1(filename):
    filepath = os.path.join(PUBLIC_DIR, "datautil", filename)
    if os.path.isfile(filepath):
        return send_from_directory(os.path.join(PUBLIC_DIR, "datautil"), filename)
    abort(404)

@app.route("/imageconv/<path:filename>")
def serve_file2(filename):
    filepath = os.path.join(PUBLIC_DIR, "imageconv", filename)
    if os.path.isfile(filepath):
        return send_from_directory(os.path.join(PUBLIC_DIR, "imageconv"), filename)
    abort(404)

@app.route("/datautil")
def serve_file3():
    filepath = os.path.join(PUBLIC_DIR, "datautil", "index.html")
    if os.path.isfile(filepath):
        return send_from_directory(os.path.join(PUBLIC_DIR, "datautil"), "index.html")
    abort(404)

@app.route("/imageconv")
def serve_file4():
    filepath = os.path.join(PUBLIC_DIR, "imageconv", "index.html")
    if os.path.isfile(filepath):
        return send_from_directory(os.path.join(PUBLIC_DIR, "imageconv"), "index.html")
    abort(404)


@app.route("/datautil/nodes")
def serve_nodes():
    filepath = os.path.join(os.path.join(PUBLIC_DIR, "datautil"), "nodes")
    return os.listdir(filepath)

@app.route("/")
def serve_index():
    filepath = os.path.join(PUBLIC_DIR, "index.html")
    if os.path.isfile(filepath):
        return send_from_directory(PUBLIC_DIR, "index.html")
    abort(404)


@app.route("/.well-known/discord")
def serve_discord():
    return send_from_directory(PUBLIC_DIR, "wellknown.discord") 

logging.basicConfig(filename='app.log', level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')

@app.before_request
def log_all_requests():
    # app.logger.info(f"Requested Path: {request.path}")
    
    blocked_paths = ['.env', 'wp-includes', '.git', 'wordpress', '.php', 'config', 'admin', '.xml', '.json']
    if any(block in request.path for block in blocked_paths):
        try:
            app.logger.info("stupid scanner got redirected " + request.path + " " + request.headers["X-Forwarded-for"])
            app.logger.info(request.headers)
        except KeyError:
            app.logger.error("Failed to get forwarded for (not running behind nginx)?")
            app.logger.info(request.headers)
            app.logger.info("stupid scanner got redirected " + request.path)

        return redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10472)