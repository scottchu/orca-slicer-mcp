"""Owner-local lifecycle for the two existing U1 LaunchAgents; run with uv run.

This is an operator CLI, never an MCP tool. It does not provision authentication,
change routing, contact printer endpoints, or change login/power settings.
"""
from __future__ import annotations

import argparse
from contextlib import contextmanager, nullcontext
import fcntl
import hashlib
import json
import os
from pathlib import Path
import plistlib
import re
import shutil
import stat
import subprocess
import sys
import tempfile
import time
import urllib.request

LABELS = {"public": "com.scottchu.u1-print-studio", "dashboard": "com.scottchu.u1-print-studio-dashboard"}
ASSETS = ("widget.html", "legacy-widget.html", "camera-widget.html", "legacy-camera-widget.html", "status-dashboard-host.html", "camera-dashboard-host.html")
ID = re.compile(r"[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}\Z")
HEALTH_KEYS = ("runtimeVersion", "toolSchemaVersion", "observationWidgetVersion", "cameraWidgetVersion")
BOOTOUT_WAIT_ATTEMPTS = 300


def run(args, **kwargs):
    # Never echo subprocess output: an existing plist or build environment can
    # contain private configuration. Commands are arrays, never shell strings.
    result = subprocess.run(args, capture_output=True, text=True, **kwargs)
    if result.returncode:
        raise RuntimeError(f"{Path(args[0]).name} failed (exit {result.returncode})")
    return result.stdout


def digest(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def safe_id(value):
    if not ID.fullmatch(value):
        raise ValueError("Invalid release/snapshot identifier")
    return value


def owned(path, *, directory=False, private=True):
    if any(p.is_symlink() for p in (path, *path.parents)):
        raise ValueError("Symlink targets are not supported")
    info = path.stat()
    if info.st_uid != os.getuid() or (private and info.st_mode & 0o077):
        raise ValueError("Target must be owner-only and owned by the current user")
    if directory != stat.S_ISDIR(info.st_mode):
        raise ValueError("Unexpected target type")


def private_dir(path):
    if any(p.is_symlink() for p in (path, *path.parents)):
        raise ValueError("Symlink targets are not supported")
    if not path.exists():
        path.mkdir(mode=0o700, parents=True)
    owned(path, directory=True)


def write_private(path, data):
    # Atomic same-directory replacement; callers resolve/validate exact paths.
    fd, temporary = tempfile.mkstemp(prefix=".u1-", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(data)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def json_bytes(value):
    return (json.dumps(value, sort_keys=True, indent=2) + "\n").encode()


class ServiceManager:
    def __init__(self, root, plist_dir, runner=run, health=None):
        self.root = Path(root).absolute()
        self.plist_dir = Path(plist_dir).absolute()
        self.runner = runner
        self.health = health or self.read_health
        self.domain = f"gui/{os.getuid()}"
        if self.root in (Path("/"), Path.home(), self.plist_dir):
            raise ValueError("A dedicated service state directory is required")

    def state_dirs(self):
        for path in (self.root, self.root / "releases", self.root / "snapshots"):
            private_dir(path)

    @contextmanager
    def lock(self):
        self.state_dirs()
        descriptor = os.open(self.root / ".lock", os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
        try:
            owned(self.root / ".lock")
            try:
                fcntl.flock(descriptor, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except BlockingIOError:
                raise RuntimeError("Another lifecycle operation is in progress") from None
            yield
        finally:
            os.close(descriptor)

    def preflight_environment(self, config, bun):
        # Bun parses its own dotenv syntax/overrides. Print only a boolean, never
        # environment contents. Relative private paths must not move with cwd.
        env = {"PATH": os.defpath, "HOME": str(Path.home()), **config.get("EnvironmentVariables", {})}
        code = 'console.log(JSON.stringify(["U1_AUTH_STATE_DIR","U1_PRINT_STUDIO_CONFIG"].every(k => !process.env[k] || process.env[k].startsWith("/"))))'
        result = self.runner([str(bun), config["ProgramArguments"][1], "--no-env-file", "--config=/dev/null", "--eval", code], cwd=config.get("WorkingDirectory"), env=env)
        if result.strip() != "true":
            raise ValueError("Private state/config paths must be absolute before changing runtime directory")

    def plist_path(self, name):
        return self.plist_dir / (LABELS[name] + ".plist")

    def read_plist(self, name):
        path = self.plist_path(name)
        owned(path, private=False)
        if path.stat().st_mode & 0o022:
            raise ValueError("LaunchAgent plist must not be writable by other users")
        data = path.read_bytes()
        value = plistlib.loads(data)
        if value.get("Label") != LABELS[name]:
            raise ValueError("Unexpected LaunchAgent label")
        args = value.get("ProgramArguments")
        if not isinstance(args, list) or not all(isinstance(x, str) for x in args):
            raise ValueError("Expected an existing ProgramArguments array")
        # Fail closed instead of guessing how a shell wrapper/private config works.
        env_args = [x for x in args if x.startswith("--env-file=")]
        original = len(args) == 4 and args[2] == "run"
        managed = len(args) == 6 and args[2] == "--no-env-file" and args[3].startswith("--config=") and args[4] == "run"
        if len(env_args) != 1 or args[1] != env_args[0] or not (original or managed):
            raise ValueError("Expected existing Bun --env-file=... run server layout")
        env_path = Path(env_args[0].split("=", 1)[1])
        if not env_path.is_absolute() or not env_path.is_file():
            raise ValueError("Existing absolute environment file is required")
        if not value.get("RunAtLoad") or value.get("KeepAlive") is not True:
            raise ValueError("Existing LaunchAgent must already enable RunAtLoad and KeepAlive")
        return data, value

    def loaded(self, name):
        try:
            self.runner(["/bin/launchctl", "print", f"{self.domain}/{LABELS[name]}"])
            return True
        except RuntimeError:
            return False

    def stop_one(self, name):
        if self.loaded(name):
            self.runner(["/bin/launchctl", "bootout", f"{self.domain}/{LABELS[name]}"])
            # bootout acknowledgement is not evidence that removal completed.
            # launchctl print can briefly still find the terminating job. Do not
            # let start_one interpret that transient registration as a running
            # service and skip bootstrap during restart/install/rollback.
            for attempt in range(BOOTOUT_WAIT_ATTEMPTS):
                if not self.loaded(name):
                    return
                if attempt != BOOTOUT_WAIT_ATTEMPTS - 1:
                    time.sleep(0.1)
            raise RuntimeError(f"{name} stop did not complete; service remains registered")

    def start_one(self, name):
        if not self.loaded(name):
            self.runner(["/bin/launchctl", "bootstrap", self.domain, str(self.plist_path(name))])

    @staticmethod
    def read_health(name):
        port = 8787 if name == "public" else 8788
        # Ignore proxy environment and never accept redirects to another endpoint.
        class NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, *args, **kwargs):
                return None
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())
        with opener.open(f"http://127.0.0.1:{port}/health", timeout=2) as response:
            if response.status != 200:
                raise RuntimeError("Service health unavailable")
            return json.loads(response.read(8192))

    def wait_health(self, name, expected):
        expected = {"auth": "personal-oauth" if name == "public" else "local-only", **expected}
        for attempt in range(15):
            try:
                actual = self.health(name)
                if actual.get("ok") is True and all(actual.get(k) == v for k, v in expected.items()):
                    return
            except Exception:
                pass
            if attempt != 14:
                time.sleep(1)
        raise RuntimeError(f"{name} readiness failed; runtime contract did not match")

    def stage(self, source, bun, release_id):
        self.state_dirs()
        release = self.root / "releases" / safe_id(release_id)
        if release.exists():
            raise ValueError("Release already exists; use a new identifier")
        if not Path(source).is_absolute() or not Path(bun).is_absolute():
            raise ValueError("Source and Bun paths must be absolute")
        source, bun = Path(source).resolve(), Path(bun).resolve()
        if not bun.is_file() or not os.access(bun, os.X_OK):
            raise ValueError("An existing absolute Bun executable is required")
        app = source / "plugins/u1-print-studio/app"
        revision = self.runner(["git", "-C", str(source), "rev-parse", "HEAD"]).strip()
        def assert_clean():
            if self.runner(["git", "-C", str(source), "status", "--porcelain", "--untracked-files=normal", "--", "plugins/u1-print-studio/app"]).strip():
                raise ValueError("Stage only a clean, committed app source")
        assert_clean()
        version = self.runner([str(bun), "--version"]).strip()
        bun_hash = digest(bun)
        release.mkdir(mode=0o700)
        # Failed staging stays quarantined at this unique path and cannot install:
        # manifest.json is written only after the build and all checks succeed.
        (release / "dist").mkdir(mode=0o700)
        (release / "public").mkdir(mode=0o700)
        (release / "bin").mkdir(mode=0o700)
        (release / "bunfig.toml").write_text("")
        shutil.copyfile(bun, release / "bin/bun")
        self.runner([str(bun), "--no-env-file", "--config=/dev/null", "build", "src/server.ts", "--target=bun", f"--outdir={release / 'dist'}", "--entry-naming=server.js", "--asset-naming=[name].[ext]"], cwd=app)
        for asset in ASSETS:
            shutil.copyfile(app / "public" / asset, release / "public" / asset)
        assert_clean()
        if revision != self.runner(["git", "-C", str(source), "rev-parse", "HEAD"]).strip() or digest(bun) != bun_hash:
            raise ValueError("Source or Bun changed during staging")
        contract = (app / "src/runtime-contract.ts").read_text()
        expected = {}
        for key, constant in zip(HEALTH_KEYS, ("U1_RUNTIME_VERSION", "U1_TOOL_SCHEMA_VERSION", "U1_OBSERVATION_WIDGET_VERSION", "U1_CAMERA_WIDGET_VERSION")):
            match = re.search(rf"export const {constant} = (\"[^\"]+\"|\d+);", contract)
            if not match:
                raise ValueError("Unsupported runtime contract")
            expected[key] = json.loads(match[1])
        files = {str(p.relative_to(release)): digest(p) for p in release.rglob("*") if p.is_file()}
        if "dist/server.js" not in files:
            raise ValueError("Build did not produce server.js")
        manifest = {"schemaVersion": 1, "release": release_id, "sourceRevision": revision, "bun": str(release / "bin/bun"), "bunVersion": version, "bunSha256": bun_hash, "health": expected, "files": files}
        write_private(release / "manifest.json", json_bytes(manifest))
        for path in release.rglob("*"):
            path.chmod(0o500 if path.is_dir() or path == release / "bin/bun" else 0o400)
        release.chmod(0o500)
        return {"release": release_id, "sourceRevision": revision, "files": len(files), "health": expected}

    def verify_release(self, release_id):
        release = self.root / "releases" / safe_id(release_id)
        owned(release, directory=True)
        owned(release / "manifest.json")
        manifest = json.loads((release / "manifest.json").read_text())
        if manifest.get("schemaVersion") != 1 or manifest.get("release") != release_id:
            raise ValueError("Unsupported release manifest")
        if Path(manifest["bun"]) != release / "bin/bun" or digest(Path(manifest["bun"])) != manifest["bunSha256"]:
            raise ValueError("Pinned Bun executable changed; stage a new release")
        actual_files = {str(p.relative_to(release)) for p in release.rglob("*") if p.is_file() and p.name != "manifest.json"}
        if actual_files != set(manifest["files"]):
            raise ValueError("Release inventory changed")
        required = {"dist/server.js", "bin/bun", "bunfig.toml", *("public/" + asset for asset in ASSETS)}
        if not required.issubset(actual_files) or set(manifest["health"]) != set(HEALTH_KEYS):
            raise ValueError("Release is missing required assets or health contract")
        if not os.access(release / "bin/bun", os.X_OK):
            raise ValueError("Pinned Bun executable is not executable")
        for relative, expected in manifest["files"].items():
            path = release / relative
            if Path(relative).is_absolute() or ".." in Path(relative).parts:
                raise ValueError("Invalid manifest file path")
            owned(path)
            if digest(path) != expected:
                raise ValueError("Release content changed")
        return release, manifest

    def snapshot(self, originals):
        stamp = time.strftime("%Y%m%dT%H%M%S") + "-" + os.urandom(3).hex()
        path = self.root / "snapshots" / stamp
        path.mkdir(mode=0o700)
        metadata = {"schemaVersion": 1, "services": {}}
        for name, (data, _) in originals.items():
            write_private(path / (name + ".plist"), data)
            loaded = self.loaded(name)
            current = self.health(name) if loaded else None
            metadata["services"][name] = {"loaded": loaded, "sha256": hashlib.sha256(data).hexdigest(), "health": {k: current[k] for k in HEALTH_KEYS if k in current} if current else {}}
        write_private(path / "snapshot.json", json_bytes(metadata))
        return stamp

    def read_snapshot(self, snapshot_id):
        path = self.root / "snapshots" / safe_id(snapshot_id)
        owned(path, directory=True)
        owned(path / "snapshot.json")
        metadata = json.loads((path / "snapshot.json").read_text())
        if metadata.get("schemaVersion") != 1 or set(metadata["services"]) != set(LABELS):
            raise ValueError("Invalid snapshot inventory")
        originals = {}
        for name in LABELS:
            file = path / (name + ".plist")
            owned(file)
            data = file.read_bytes()
            if hashlib.sha256(data).hexdigest() != metadata["services"][name]["sha256"] or plistlib.loads(data).get("Label") != LABELS[name]:
                raise ValueError("Snapshot content changed")
            originals[name] = data
            config = plistlib.loads(data)
            entry = Path(config["ProgramArguments"][-1])
            if entry.parent.parent.parent == self.root / "releases":
                self.verify_release(entry.parent.parent.name)
        return metadata, originals

    def restore(self, snapshot_id):
        metadata, originals = self.read_snapshot(snapshot_id)
        running = {name: self.loaded(name) for name in LABELS}
        stop_failures = []
        for name in LABELS:
            try:
                self.stop_one(name)
            except Exception:
                stop_failures.append(name)
        if stop_failures:
            for name in LABELS:
                if running[name]:
                    try:
                        self.start_one(name)
                    except Exception:
                        pass
            raise RuntimeError("Cannot stop all services safely; no plist was restored")
        for name, data in originals.items():
            write_private(self.plist_path(name), data)
        failures = []
        for name, state in metadata["services"].items():
            if state["loaded"]:
                try:
                    self.start_one(name)
                    self.wait_health(name, state["health"])
                except Exception:
                    failures.append(name)
        if failures:
            raise RuntimeError("Restored plists but some services need attention: " + ", ".join(failures))
        write_private(self.root / "active.json", json_bytes({"restoredSnapshot": snapshot_id}))

    def rollback(self, snapshot_id):
        self.state_dirs()
        self.read_snapshot(snapshot_id)
        originals = {name: self.read_plist(name) for name in LABELS}
        recovery = self.snapshot(originals)
        try:
            self.restore(snapshot_id)
        except Exception:
            try:
                self.restore(recovery)
            except Exception:
                raise RuntimeError(f"Rollback failed and recovery needs attention; snapshot {recovery}") from None
            raise RuntimeError(f"Rollback failed; current services restored from {recovery}") from None
        return {"restoredSnapshot": snapshot_id, "recoverySnapshot": recovery}

    def install(self, release_id, dry_run=False):
        self.state_dirs()
        release, manifest = self.verify_release(release_id)
        originals = {name: self.read_plist(name) for name in LABELS}
        for _, config in originals.values():
            self.preflight_environment(config, manifest["bun"])
        if dry_run:
            return {"dryRun": True, "release": release_id, "services": list(LABELS), "health": manifest["health"]}
        snapshot_id = self.snapshot(originals)
        replacements = {}
        for name, (_, config) in originals.items():
            config["ProgramArguments"] = [manifest["bun"], config["ProgramArguments"][1], "--no-env-file", f"--config={release / 'bunfig.toml'}", "run", str(release / "dist/server.js")]
            config["WorkingDirectory"] = str(release)
            replacements[name] = plistlib.dumps(config, sort_keys=False)
        try:
            for name in LABELS:
                self.stop_one(name)
            for name, data in replacements.items():
                write_private(self.plist_path(name), data)
            for name in LABELS:
                self.start_one(name)
                self.wait_health(name, manifest["health"])
            write_private(self.root / "active.json", json_bytes({"release": release_id, "rollbackSnapshot": snapshot_id}))
        except Exception:
            try:
                self.restore(snapshot_id)
            except Exception:
                raise RuntimeError(f"Install failed and recovery needs attention; snapshot {snapshot_id}") from None
            raise RuntimeError(f"Install failed; previous plists/services restored from {snapshot_id}") from None
        return {"release": release_id, "rollbackSnapshot": snapshot_id, "ready": True}

    def lifecycle(self, action, names):
        contracts = {}
        for name in names:
            _, config = self.read_plist(name)
            expected = {}
            if action in ("start", "restart"):
                # Validate staged bytes before every managed start.
                entry = Path(config["ProgramArguments"][-1])
                if entry.parent.parent.parent == self.root / "releases":
                    _, manifest = self.verify_release(entry.parent.parent.name)
                    expected = manifest["health"]
            contracts[name] = expected
        for name in names:
            if action in ("stop", "restart"):
                self.stop_one(name)
            if action in ("start", "restart"):
                self.start_one(name)
                self.wait_health(name, contracts[name])
        return {"action": action, "services": list(names)}

    def status(self):
        result = {}
        for name in LABELS:
            loaded = self.loaded(name)
            integrity = "unmanaged"
            try:
                _, config = self.read_plist(name)
                entry = Path(config["ProgramArguments"][-1])
                if entry.parent.parent.parent == self.root / "releases":
                    _, manifest = self.verify_release(entry.parent.parent.name)
                    integrity = "verified"
                    expected = manifest["health"]
                else:
                    expected = {}
                value = self.health(name)
                expected["auth"] = "personal-oauth" if name == "public" else "local-only"
                ready = loaded and value.get("ok") is True and all(value.get(k) == v for k, v in expected.items())
                contract = {key: value.get(key) for key in HEALTH_KEYS}
            except Exception:
                ready, contract = False, {}
                integrity = "unverified"
            result[name] = {"loaded": loaded, "healthy": ready, "integrity": integrity, "contract": contract}
        return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--state-root", type=Path, default=Path.home() / "Library/Application Support/U1 Print Studio/service")
    commands = parser.add_subparsers(dest="command", required=True)
    stage = commands.add_parser("stage")
    stage.add_argument("--source", required=True, type=Path)
    stage.add_argument("--bun", required=True, type=Path)
    stage.add_argument("--release", required=True)
    commands.add_parser("status")
    for command in ("start", "stop", "restart"):
        commands.add_parser(command).add_argument("--service", choices=("all", *LABELS), default="all")
    install = commands.add_parser("install")
    install.add_argument("--release", required=True)
    install.add_argument("--dry-run", action="store_true")
    commands.add_parser("rollback").add_argument("--snapshot", required=True)
    args = parser.parse_args()
    if sys.platform != "darwin" or os.getuid() == 0:
        parser.error("Run as the logged-in macOS user, not root")
    manager = ServiceManager(args.state_root, Path.home() / "Library/LaunchAgents")
    try:
        with manager.lock() if args.command != "status" else nullcontext():
            result = dispatch(manager, args)
        print(json.dumps(result, sort_keys=True))
        if args.command == "status" and any(not service["healthy"] for service in result.values()):
            return 1
    except Exception as error:
        # Paths, plist values, env, OAuth state, and raw subprocess errors are private.
        message = str(error) if isinstance(error, (ValueError, RuntimeError)) else "Local operation failed; inspect owner-local state"
        print(f"u1 service: {type(error).__name__}: {message}", file=sys.stderr)
        return 1
    return 0


def dispatch(manager, args):
    if args.command == "stage":
        return manager.stage(args.source, args.bun, args.release)
    if args.command == "install":
        return manager.install(args.release, args.dry_run)
    if args.command == "rollback":
        return manager.rollback(args.snapshot)
    if args.command == "status":
        return manager.status()
    return manager.lifecycle(args.command, LABELS if args.service == "all" else [args.service])


if __name__ == "__main__":
    raise SystemExit(main())
