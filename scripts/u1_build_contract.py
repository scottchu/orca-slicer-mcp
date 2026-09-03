"""Closed, read-only contract for a relocatable SvelteKit/Bun service build."""
from __future__ import annotations

import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path, PurePosixPath
import re


BUILD_KIND = "sveltekit-bun"
BUILD_MANIFEST = "build-manifest.json"
HASH = re.compile(r"[0-9a-f]{64}\Z")
SAFE_PATH = re.compile(r"[A-Za-z0-9_./@+\-]+\Z")
VIEWS = ("overview", "progress", "thermals", "heads", "jobs", "job_history", "queue", "fans", "bed_mesh", "camera")
FOCUSED_ASSETS = ("fans", "thermals", "heads", "queue", "camera")
CURRENT_ASSET_FILES = {
    "mcp-observation.html": "mcp-observation.html",
    "mcp-camera.html": "mcp-camera.html",
    "status-dashboard-host.html": "static-contract/status-dashboard-host.html",
    "camera-dashboard-host.html": "static-contract/camera-dashboard-host.html",
}
# Independent minimum: omitting a manifest route must not silently reduce the
# public-isolation checks that were required before the framework migration.
REQUIRED_ROLES = {
    "/widget": "both",
    "/dashboard": "dashboard",
    "/dashboard/": "dashboard",
    "/dashboard/lab": "dashboard",
    **{f"/dashboard/{view}": "dashboard" for view in VIEWS},
    **{f"/dashboard/lab/{view}": "dashboard" for view in VIEWS},
    **{f"/dashboard/{view}_widget": "dashboard" for view in FOCUSED_ASSETS},
}


class DirectoryLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self.links.append(dict(attrs).get("href"))


def file_digest(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("Duplicate build manifest key")
        result[key] = value
    return result


def relative_file(value):
    if not isinstance(value, str) or not SAFE_PATH.fullmatch(value):
        raise ValueError("Invalid build file path")
    path = PurePosixPath(value)
    if path.is_absolute() or str(path) != value or any(part in (".", "..") for part in path.parts):
        raise ValueError("Invalid build file path")
    return value


def route_path(value):
    if not isinstance(value, str) or not value.startswith("/") or not SAFE_PATH.fullmatch(value):
        raise ValueError("Invalid static route")
    parts = value.split("/")[1:]
    if value != "/" and (any(part in (".", "..") for part in parts) or any(not part for part in parts[:-1])):
        raise ValueError("Invalid static route")
    return value


def regular_file(path, root):
    if not path.is_file() or path.is_symlink() or root.is_symlink():
        raise ValueError("Build inventory requires regular files")
    if any(parent.is_symlink() for parent in path.parents if parent != root and root in parent.parents):
        raise ValueError("Build inventory forbids symlinks")


def read_build_manifest(directory):
    """Verify every output, not just the files declared by the build process."""
    directory = Path(directory)
    manifest_path = directory / BUILD_MANIFEST
    regular_file(manifest_path, directory)
    manifest = json.loads(manifest_path.read_text(), object_pairs_hook=unique_object)
    if not isinstance(manifest, dict) or set(manifest) != {"schemaVersion", "buildKind", "runtimeFiles", "staticRoutes"}:
        raise ValueError("Unsupported build manifest")
    if type(manifest["schemaVersion"]) is not int or manifest["schemaVersion"] != 1 or manifest["buildKind"] != BUILD_KIND:
        raise ValueError("Unsupported build manifest version or kind")
    files, routes = manifest["runtimeFiles"], manifest["staticRoutes"]
    if not isinstance(files, dict) or not isinstance(routes, dict) or not routes:
        raise ValueError("Invalid build inventory")
    if not {"server.js", "handler.js"}.issubset(files) or BUILD_MANIFEST in files:
        raise ValueError("Missing required Kit runtime files")
    for relative, expected in files.items():
        relative_file(relative)
        if not isinstance(expected, str) or not HASH.fullmatch(expected):
            raise ValueError("Invalid build file hash")
        path = directory / relative
        regular_file(path, directory)
        if file_digest(path) != expected:
            raise ValueError("Build file hash mismatch")
    actual = set()
    for path in directory.rglob("*"):
        if path.is_symlink() or (not path.is_dir() and not path.is_file()):
            raise ValueError("Build inventory forbids symlinks and special files")
        if path.is_file() and path != manifest_path:
            actual.add(path.relative_to(directory).as_posix())
    if actual != set(files):
        raise ValueError("Build output inventory differs from manifest")
    for route, item in routes.items():
        route_path(route)
        if not isinstance(item, dict) or set(item) != {"file", "sha256", "role"}:
            raise ValueError("Invalid static route declaration")
        relative_file(item["file"])
        if item["file"] not in files or item["sha256"] != files[item["file"]]:
            raise ValueError("Static route is not bound to a runtime file")
        role = item["role"]
        if role not in ("public", "dashboard", "both"):
            raise ValueError("Invalid static route role")
        if not item["file"].startswith(("static-contract/", "client/", "prerendered/")) and not (route == "/widget" and item["file"] == "mcp-observation.html"):
            raise ValueError("Runtime code cannot be declared as a static route")
        if item["file"].startswith("client/") and route != "/" + item["file"][len("client/"):]:
            raise ValueError("Client asset route does not match its build path")
        private = route in ("/dashboard", "/_app", "/camera-widget") or route.startswith(("/dashboard/", "/_app/"))
        if private and role != "dashboard":
            raise ValueError("Private static route cannot be public")
    if any(routes.get(route, {}).get("role") != role for route, role in REQUIRED_ROLES.items()):
        raise ValueError("Required static route or role missing")
    if routes["/widget"]["file"] != CURRENT_ASSET_FILES["mcp-observation.html"]:
        raise ValueError("Widget route must serve the current observation resource")
    if not set(CURRENT_ASSET_FILES.values()).issubset(files):
        raise ValueError("Required current resource asset missing")
    expected_links = {f"/dashboard/{view}" for view in VIEWS}
    for route in ("/dashboard", "/dashboard/"):
        directory_links = DirectoryLinks()
        directory_links.feed((directory / routes[route]["file"]).read_text())
        if set(directory_links.links) != expected_links or len(directory_links.links) != len(expected_links):
            raise ValueError("Dashboard directory links differ from the closed focused routes")
    # Every generated client/prerendered file must have an explicit served route;
    # extra outputs cannot escape verification by being omitted from staticRoutes.
    served_files = {item["file"] for item in routes.values()}
    for relative in files:
        if relative.startswith(("client/", "prerendered/")) and relative not in served_files:
            raise ValueError("Generated static file is missing its route")
    return manifest


def static_contract(manifest):
    result = {}
    for route, item in manifest["staticRoutes"].items():
        ports = (8787, 8788) if item["role"] == "both" else (8787,) if item["role"] == "public" else (8788,)
        for port in ports:
            result[f"{port}{route}"] = {"port": port, "route": route, "sha256": item["sha256"]}
    return result
