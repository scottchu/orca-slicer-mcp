"""Ship one explicitly authorized, independently reviewed U1 PR; plan by default.

Run with uv run --no-project. No plugin installation, printer acquisition,
credentials provisioning, routing changes, or Mac settings are included.
"""
from __future__ import annotations

import argparse
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import shutil
import sys
import time
import urllib.error
import urllib.request

from u1_service import (
    ASSETS, LABELS, ServiceManager, digest, json_bytes,
    private_dir, run, write_private,
)

REPOSITORY = "scottchu/orca-slicer-mcp"
REMOTES = {f"https://github.com/{REPOSITORY}", f"https://github.com/{REPOSITORY}.git", f"git@github.com:{REPOSITORY}.git", f"ssh://git@github.com/{REPOSITORY}.git"}
SHA = re.compile(r"[0-9a-f]{40}\Z")
APP = Path("plugins/u1-print-studio/app")
PRIVATE_LAB_ROUTE = "/dashboard/lab"


class ShipError(RuntimeError):
    """Only closed, operator-safe messages are printed or recorded."""


def require(condition, message):
    if not condition:
        raise ShipError(message)


def fingerprint(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True).encode()).hexdigest()


def guard_pr(pr, number, reviewed_sha, branch):
    require(pr.get("number") == number and pr.get("state") == "open" and not pr.get("merged") and not pr.get("draft"), "PR must be open and ready for review")
    head, base = pr.get("head", {}), pr.get("base", {})
    require(head.get("repo", {}).get("full_name") == REPOSITORY and base.get("repo", {}).get("full_name") == REPOSITORY, "PR must belong to the canonical repository, without a fork")
    require(head.get("sha") == reviewed_sha and head.get("ref") == branch, "PR head no longer matches the reviewed checkout")
    require(base.get("ref") == "main" and SHA.fullmatch(base.get("sha", "")), "PR must target the canonical main branch")


def oauth_identity(path):
    # Refresh tokens, client registrations and authenticator counters legitimately
    # change during use. Check stable signing/passkey identity, never rewrite or
    # roll back the OAuth file to a stale copy.
    value = json.loads(path.read_text())
    credential = value.get("credential") or {}
    require(value.get("version") in (1, 2) and value.get("signingPrivateJwk") and value.get("signingPublicJwk"), "Unrecognized OAuth state; cannot establish preservation")
    return fingerprint({"privateKey": value["signingPrivateJwk"], "publicKey": value["signingPublicJwk"], "credential": {k: credential.get(k) for k in ("id", "publicKey")}})


class DirectoryLinks(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self.links.append(dict(attrs).get("href"))


def static_contract(source):
    """Parse only the source's explicit route list; never execute widget JS."""
    app = source / APP
    text = (app / "src/status-dashboard.ts").read_text()
    match = re.search(r"FOCUSED_DASHBOARD_PATHS = new Set\(\[(.*?)\]\)", text, re.S)
    require(match is not None, "Unsupported focused-route contract")
    routes = re.findall(r'"(/dashboard/[a-z_]+)"', match[1])
    require(routes and len(routes) == len(set(routes)), "Invalid focused-route inventory")
    lab_match = re.search(r"OBSERVATION_LAB_PATHS = new Set\(\[(.*?)\]\)", text, re.S)
    require(lab_match is not None, "Unsupported private-lab route contract")
    lab_routes = re.findall(r'"(/dashboard/lab(?:/[a-z_]+)?)"', lab_match[1])
    require(lab_routes and len(lab_routes) == len(set(lab_routes)) and PRIVATE_LAB_ROUTE in lab_routes,
            "Invalid private-lab route inventory")
    camera_lab_match = re.search(r'CAMERA_LAB_PATH = "(/dashboard/lab/camera)";', text)
    require(camera_lab_match is not None, "Unsupported private Camera lab route contract")
    directory = DirectoryLinks()
    directory.feed((app / "public/dashboard-index.html").read_text())
    require(set(directory.links) == set(routes) | {"/dashboard/camera"} and len(directory.links) == len(routes) + 1, "Directory links and focused routes disagree")
    files = {(8788, route): "status-dashboard-host.html" for route in routes}
    files.update({(8788, route): "svelte-observation-lab.html" for route in lab_routes})
    live_fans_match = re.search(r'LIVE_FANS_WIDGET_PATH = "(/dashboard/[a-z_]+)"', text)
    require("svelte-live-fans.html" not in text or live_fans_match is not None,
            "Unsupported live Fans route contract")
    if live_fans_match:
        require(live_fans_match[1] not in routes and live_fans_match[1] not in lab_routes,
                "Live Fans asset must have a distinct private route")
        files[(8788, live_fans_match[1])] = "svelte-live-fans.html"
    files[(8788, camera_lab_match[1])] = "svelte-camera-lab.html"
    live_camera_match = re.search(r'LIVE_CAMERA_WIDGET_PATH = "(/dashboard/[a-z_]+)"', text)
    require("svelte-live-camera.html" not in text or live_camera_match is not None,
            "Unsupported live Camera route contract")
    if live_camera_match:
        require(live_camera_match[1] not in routes and live_camera_match[1] not in lab_routes
                and (8788, live_camera_match[1]) not in files,
                "Live Camera asset must have a distinct private route")
        files[(8788, live_camera_match[1])] = "svelte-live-camera.html"
    files.update({(8788, "/dashboard"): "dashboard-index.html", (8788, "/dashboard/"): "dashboard-index.html", (8788, "/dashboard/camera"): "camera-dashboard-host.html", (8788, "/widget"): "widget.html", (8787, "/widget"): "widget.html", (8788, "/camera-widget"): "camera-widget.html"})
    return {f"{port}{route}": {"port": port, "route": route, "sha256": digest(app / "public" / name)} for (port, route), name in files.items()}


def http_read(port, route):
    require(port in (8787, 8788, 8789), "Unexpected verification port")
    require(route in ("/health", "/widget", "/camera-widget", "/mcp", "/auth/enroll", "/dashboard", "/dashboard/") or re.fullmatch(r"/dashboard/(?:lab/)?[a-z_]+", route), "Unexpected verification route")
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *args, **kwargs):
            return None
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())
    try:
        response = opener.open(f"http://127.0.0.1:{port}{route}", timeout=3)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        body = response.read(2_000_001)
        require(len(body) <= 2_000_000, "Verification response exceeded its bound")
        return response.code, body


def check_static(contract, reader=http_read, expected=True):
    actual = {}
    for key, item in contract.items():
        code, body = reader(item["port"], item["route"])
        sha = hashlib.sha256(body).hexdigest()
        if expected:
            require(code == 200 and sha == item["sha256"], "Served static assets do not match the shipped source")
        actual[key] = {"code": code, "sha256": sha}
    return actual


def check_security(contract, reader=http_read):
    paths = {item["route"] for item in contract.values() if item["route"].startswith("/dashboard")}
    checks = [(8787, path, 404) for path in sorted(paths)]
    checks += [(8787, "/auth/enroll", 404), (8787, "/mcp", 401), (8788, "/mcp", 404)]
    for port, route, expected in checks:
        require(reader(port, route)[0] == expected, "Public authentication or private-route isolation failed")
    code, body = reader(8789, "/health")
    require(code == 200 and json.loads(body) == {"ok": True, "surface": "passkey-enrollment"}, "Private enrollment listener is not healthy")
    return len(checks) + 1


class Operations:
    def __init__(self, source, bun, pr, reviewed):
        self.source = source
        self.bun = bun.resolve()
        self.pr, self.reviewed = pr, reviewed
        self.manager = ServiceManager(Path.home() / "Library/Application Support/U1 Print Studio/service", Path.home() / "Library/LaunchAgents")
        self.environment = {**os.environ, "PATH": str(self.bun.parent) + os.pathsep + os.environ.get("PATH", "")}
        self.bun_hash = digest(self.bun)
        self.contract = static_contract(source)

    def command(self, command, cwd=None, **kwargs):
        return run(command, cwd=cwd or self.source, env=kwargs.pop("env", self.environment), timeout=kwargs.pop("timeout", 180), **kwargs).strip()

    def git(self, *arguments, cwd=None):
        return self.command(["git", *arguments], cwd=cwd)

    def pr_info(self):
        return json.loads(self.command(["gh", "api", f"repos/{REPOSITORY}/pulls/{self.pr}"]))

    def preflight(self, ancestry=True):
        require(self.git("remote", "get-url", "origin") in REMOTES, "Origin is not the canonical repository")
        require(not self.git("status", "--porcelain", "--untracked-files=normal"), "Checkout must be clean, including untracked files")
        branch = self.git("symbolic-ref", "--quiet", "--short", "HEAD")
        require(branch and branch != "main", "Use a non-main candidate branch")
        require(self.git("rev-parse", "HEAD") == self.reviewed, "HEAD does not equal the independently reviewed SHA")
        require(digest(self.bun) == self.bun_hash and os.access(self.bun, os.X_OK), "Pinned Bun changed or is not executable")
        bare_bun = shutil.which("bun", path=self.environment["PATH"])
        require(bare_bun is not None and Path(bare_bun).resolve() == self.bun, "Repository gate must resolve bare bun to the pinned executable")
        version = self.command([str(self.bun), "--version"])
        pr = self.pr_info()
        guard_pr(pr, self.pr, self.reviewed, branch)
        remote = self.git("ls-remote", "--exit-code", "origin", "refs/heads/main").split()
        require(len(remote) == 2 and remote[0] == pr["base"]["sha"], "Main changed while reading the PR")
        if ancestry:
            self.git("merge-base", "--is-ancestor", remote[0], self.reviewed)
        return {"pr": self.pr, "reviewedSha": self.reviewed, "reviewedTree": self.git("rev-parse", f"{self.reviewed}^{{tree}}"), "baseSha": remote[0], "bunVersion": version, "bunSha256": self.bun_hash}

    def fetch_base(self):
        self.git("fetch", "origin", "main")

    def validate(self):
        app = self.source / APP
        self.command([str(self.bun), "--no-env-file", "--config=/dev/null", "install", "--frozen-lockfile", "--ignore-scripts"], cwd=app)
        self.command([str(self.bun), "--no-env-file", "--config=/dev/null", "install", "--frozen-lockfile", "--ignore-scripts"], cwd=app / "ui")
        try:
            self.command(["./scripts/check-repository.sh"], timeout=600)
        except Exception:
            raise ShipError("Local repository/app/TypeScript/operator test gate failed") from None
        for bundle in ("bundle", "bundle:server", "bundle:runtime"):
            try:
                self.command([str(self.bun), "--no-env-file", "--config=/dev/null", "run", bundle], cwd=app)
            except Exception:
                raise ShipError(f"Local production build failed: {bundle}") from None
        self.command(["codesign", "-vvv", "--verify", str(app / "dist/u1-print-studio")])
        for name in ASSETS:
            require(digest(app / "public" / name) == digest(app / "dist" / name), "Bundled public asset differs from source")
        self.git("diff", "--check")

    def merge(self, candidate):
        self.command(["gh", "pr", "merge", str(self.pr), "--repo", REPOSITORY, "--merge", "--match-head-commit", self.reviewed])
        pr = self.pr_info()
        merged = pr.get("merge_commit_sha", "")
        require(pr.get("merged") and SHA.fullmatch(merged), "Merge could not be confirmed; inspect the PR before retrying")
        return merged

    def checkout(self, merged, candidate, operation):
        self.git("fetch", "origin", "main")
        require(self.git("rev-parse", f"{merged}^{{tree}}") == candidate["reviewedTree"], "Merged tree differs from independently reviewed tree; merge remains, deployment stopped")
        parent = self.manager.root / "sources"
        private_dir(parent)
        source = parent / operation
        self.git("worktree", "add", "--detach", str(source), merged)
        require(self.git("rev-parse", "HEAD", cwd=source) == merged and not self.git("status", "--porcelain", cwd=source), "Isolated merged checkout is not exact and clean")
        self.command([str(self.bun), "--no-env-file", "--config=/dev/null", "install", "--frozen-lockfile", "--ignore-scripts"], cwd=source / APP)
        return source

    def preserve(self):
        result = {"services": {}}
        for name in LABELS:
            _, cfg = self.manager.read_plist(name)
            env = {"PATH": os.defpath, "HOME": str(Path.home()), **cfg.get("EnvironmentVariables", {})}
            code = 'import {homedir} from "node:os";console.log(JSON.stringify({home:homedir(),auth:process.env.U1_AUTH_STATE_DIR||null,config:process.env.U1_PRINT_STUDIO_CONFIG||null}))'
            values = json.loads(self.command([cfg["ProgramArguments"][0], cfg["ProgramArguments"][1], "--no-env-file", "--config=/dev/null", "--eval", code], cwd=cfg["WorkingDirectory"], env=env))
            home = Path(values["home"])
            auth = Path(values["auth"]) if values["auth"] else home / ".local/share/u1-print-studio"
            config = Path(values["config"]) if values["config"] else home / "Library/Application Support/U1 Print Studio/config.json"
            require(auth.is_absolute() and config.is_absolute(), "Private paths must remain absolute")
            result["services"][name] = {"fields": fingerprint({k: v for k, v in cfg.items() if k not in ("ProgramArguments", "WorkingDirectory")}), "envArgument": fingerprint(cfg["ProgramArguments"][1]), "env": digest(Path(cfg["ProgramArguments"][1].split("=", 1)[1])), "config": digest(config) if config.exists() else None, "oauthIdentity": oauth_identity(auth / "personal-oauth.json")}
        routes = self.command(["tailscale", "serve", "status", "--json"])
        result["routes"] = fingerprint(json.loads(routes))
        return result

    def baseline(self):
        status = self.manager.status()
        require(all(x["loaded"] and x["healthy"] and x["integrity"] == "verified" for x in status.values()), "Existing services must be healthy verified releases before shipping")
        return {"preserve": self.preserve(), "status": status, "static": check_static(self.contract, expected=False), "plists": {n: digest(self.manager.plist_path(n)) for n in LABELS}}

    def stage(self, source, release, merged):
        staged = self.manager.stage(source, self.bun, release)
        require(staged["sourceRevision"] == merged, "Staged source revision mismatch")
        path, manifest = self.manager.verify_release(release)
        require(manifest["sourceRevision"] == merged and static_contract(source) == self.contract, "Staged source/static contract mismatch")
        for name in ASSETS:
            require(digest(path / "public" / name) == digest(source / APP / "public" / name), "Staged asset does not match merged source")
        return manifest

    def dry_run(self, release):
        return self.manager.install(release, dry_run=True)

    def install(self, release):
        return self.manager.install(release)

    def restart(self):
        self.manager.lifecycle("restart", LABELS)

    def verify(self, release, manifest, baseline):
        _, installed = self.manager.verify_release(release)
        require(installed == manifest, "Installed release changed")
        status = self.manager.status()
        for name in LABELS:
            _, cfg = self.manager.read_plist(name)
            require(Path(cfg["ProgramArguments"][-1]) == self.manager.root / "releases" / release / "dist/server.js", "Service points to the wrong release")
            require(status[name]["loaded"] and status[name]["healthy"] and status[name]["integrity"] == "verified" and status[name]["contract"] == manifest["health"], "Service readiness or runtime contract mismatch")
        assets = check_static(self.contract)
        checks = check_security(self.contract)
        require(self.preserve() == baseline["preserve"], "Private configuration, OAuth identity or routing changed")
        return {"services": status, "staticAssets": assets, "securityChecks": checks, "preserved": True}

    def rollback(self, snapshot):
        return self.manager.rollback(snapshot)

    def verify_restored(self, baseline):
        require(self.manager.status() == baseline["status"], "Previous service readiness did not recover")
        require({n: digest(self.manager.plist_path(n)) for n in LABELS} == baseline["plists"], "Previous plists did not recover exactly")
        require(self.preserve() == baseline["preserve"], "Private configuration did not remain preserved")
        require(check_static(self.contract, expected=False) == baseline["static"], "Previous served assets did not recover")
        check_security(self.contract)

    def receipt(self, report):
        directory = self.manager.root / "shipments"
        private_dir(directory)
        write_private(directory / (report["operation"] + ".json"), json_bytes(report))


def ship(ops, execute=False, progress=lambda phase: None):
    """Orchestration is injected in tests; no real operations are used there."""
    report = {"operation": f"pr{ops.pr}-{time.strftime('%Y%m%dT%H%M%S')}-{os.urandom(3).hex()}", "ok": False, "merged": False, "installed": False, "rollback": "not-needed"}
    snapshot = None
    phase = "preflight"
    def step(name):
        nonlocal phase
        phase = name
        report["phase"] = name
        progress(name)
    try:
        if execute:
            step("identity-guards")
            ops.preflight(ancestry=False)
            step("fetch-base")
            ops.fetch_base()
        step("preflight")
        candidate = ops.preflight()
        report["candidate"] = candidate
        if not execute:
            return {**report, "ok": True, "planOnly": True, "steps": ["validate", "guarded-merge", "exact-merged-stage", "dry-run", "install-both", "restart-both", "verify", "rollback-on-postinstall-failure"]}
        step("validate")
        ops.validate()
        step("merge-edge-guards")
        require(ops.preflight() == candidate, "Reviewed candidate or base changed during validation")
        baseline = ops.baseline()
        step("merge")
        report["mergeAttempted"] = True
        merged = ops.merge(candidate)
        report.update(merged=True, mergedSha=merged)
        ops.receipt(report)
        step("isolate-merged-source")
        source = ops.checkout(merged, candidate, report["operation"])
        release = f"{time.strftime('%Y%m%d')}-{merged[:7]}-{report['operation']}"
        report["release"] = release
        step("stage")
        manifest = ops.stage(source, release, merged)
        step("install-dry-run")
        ops.dry_run(release)
        require(ops.preserve() == baseline["preserve"], "Private configuration changed before installation")
        step("install")
        result = ops.install(release)  # Existing lifecycle owns failed-install recovery.
        snapshot = result["rollbackSnapshot"]
        report.update(installed=True, rollbackSnapshot=snapshot)
        ops.receipt(report)
        step("restart-both")
        ops.restart()
        step("verify")
        report["verification"] = ops.verify(release, manifest, baseline)
        report.update(ok=True, phase="complete")
        ops.receipt(report)
    except Exception as error:
        report.update(ok=False, failedPhase=phase, error=str(error) if isinstance(error, ShipError) else "Shipping stopped; inspect the failed phase before another attempt")
        if phase == "merge":
            report["mergeState"] = "uncertain-check-pr"
        if snapshot is not None:
            try:
                report["rollback"] = "attempted"
                ops.rollback(snapshot)
                ops.verify_restored(baseline)
                report.update(rollback="verified", installed=False)
            except Exception:
                report["rollback"] = "needs-operator-attention"
        elif phase == "install":
            report["rollback"] = "install-helper-owned-check-snapshots"
        if execute:
            try:
                ops.receipt(report)
            except Exception:
                report["receipt"] = "unavailable"
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pr", required=True, type=int)
    parser.add_argument("--reviewed-sha", required=True)
    parser.add_argument("--bun", required=True, type=Path)
    parser.add_argument("--execute", action="store_true", help="Only with fresh shipping authorization and exact independent review")
    args = parser.parse_args()
    try:
        require(sys.platform == "darwin" and os.getuid() != 0, "Use the logged-in macOS owner, not root")
        require(args.pr > 0 and SHA.fullmatch(args.reviewed_sha) and args.bun.is_absolute() and args.bun.is_file(), "Require PR number, full reviewed SHA and absolute pinned Bun")
        source = Path(run(["git", "rev-parse", "--show-toplevel"]).strip())
        ops = Operations(source, args.bun, args.pr, args.reviewed_sha)
        def progress(phase):
            if args.execute:
                print(f"u1 ship: {phase}", file=sys.stderr, flush=True)
        if args.execute:
            with ops.manager.lock():
                report = ship(ops, True, progress)
        else:
            report = ship(ops)
        print(json.dumps(report, sort_keys=True))
        return 0 if report["ok"] else 1
    except Exception as error:
        print(json.dumps({"ok": False, "phase": "initialization", "error": str(error) if isinstance(error, ShipError) else "Cannot initialize shipping; check arguments, tools and repository"}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
