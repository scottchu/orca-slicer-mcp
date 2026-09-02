"""Offline lifecycle tests: fake launchctl, builds and health; no service contact."""
import hashlib
import json
import json
import os
from pathlib import Path
import plistlib
import tempfile
import unittest
from unittest.mock import patch

from u1_service import ASSETS, HEALTH_KEYS, LABELS, ServiceManager, digest, json_bytes
from u1_build_contract import BUILD_KIND, BUILD_MANIFEST, LEGACY_ASSET_FILES, REQUIRED_ROLES, VIEWS, read_build_manifest


CONTRACT = dict(zip(HEALTH_KEYS, ("0.3.0", 5, "observation-v2", "camera-v4")))


def write_kit_build(directory):
    """Synthetic closed output, including client code and a prerendered page."""
    directory.mkdir(parents=True, exist_ok=True)
    contents = {"server.js": "fixture bootstrap", "handler.js": "fixture handler",
                "client/_app/immutable/start.fixture.js": "fixture client",
                "prerendered/dashboard/fans.html": "<main>Neutral Fans fixture</main>",
                "static-contract/fixture.html": "fixture compatibility page"}
    contents.update({relative: name for name, relative in LEGACY_ASSET_FILES.items()})
    contents["static-contract/dashboard-index.html"] = "".join(f'<a href="/dashboard/{view}">{view}</a>' for view in VIEWS)
    for relative, content in contents.items():
        file = directory / relative
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_text(content)
    files = {relative: digest(directory / relative) for relative in contents}
    routes = {}
    for route, role in REQUIRED_ROLES.items():
        relative = {"/widget": "static-contract/widget.html", "/camera-widget": "static-contract/camera-widget.html", "/dashboard/fans": "prerendered/dashboard/fans.html", "/dashboard": "static-contract/dashboard-index.html", "/dashboard/": "static-contract/dashboard-index.html"}.get(route, "static-contract/fixture.html")
        routes[route] = {"file": relative, "sha256": files[relative], "role": role}
    relative = "client/_app/immutable/start.fixture.js"
    routes["/_app/immutable/start.fixture.js"] = {"file": relative, "sha256": files[relative], "role": "dashboard"}
    manifest = {"schemaVersion": 1, "buildKind": BUILD_KIND, "runtimeFiles": files, "staticRoutes": routes}
    (directory / BUILD_MANIFEST).write_bytes(json_bytes(manifest))
    return manifest


class LifecycleTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="u1-service-test-")
        self.base = Path(self.temp.name).resolve()
        self.root = self.base / "state"
        self.plists = self.base / "LaunchAgents"
        self.plists.mkdir(mode=0o700)
        self.env_file = self.base / "private.env"
        self.env_file.write_text("PRIVATE_TEST_SENTINEL=not-repository-data\n")
        self.env_file.chmod(0o600)
        self.bun = self.base / "bun"
        self.bun.write_text("fixture executable")
        self.bun.chmod(0o700)
        self.loaded = set(LABELS)
        self.bootout_delay = 0
        self.removing = {}
        self.calls = []
        self.fail_bootstrap = None
        self.relative_state = False
        self.health_value = {"ok": True, **CONTRACT}
        self.manager = ServiceManager(self.root, self.plists, self.runner, lambda name: {**self.health_value, "auth": "personal-oauth" if name == "public" else "local-only"})
        self.originals = {}
        for name, label in LABELS.items():
            config = {"Label": label, "ProgramArguments": [str(self.bun), f"--env-file={self.env_file}", "run", "src/server.ts"], "WorkingDirectory": str(self.base), "RunAtLoad": True, "KeepAlive": True, "EnvironmentVariables": {"SENTINEL": "private", "PORT": "8787" if name == "public" else "8788"}, "StandardOutPath": str(self.base / "stdout.log"), "StandardErrorPath": str(self.base / "stderr.log")}
            data = plistlib.dumps(config)
            self.manager.plist_path(name).write_bytes(data)
            self.originals[name] = data
        self.manager.state_dirs()
        self.release = self.root / "releases" / "r1"
        self.release.mkdir(mode=0o700)
        (self.release / "dist").mkdir(mode=0o700)
        (self.release / "bin").mkdir(mode=0o700)
        (self.release / "public").mkdir(mode=0o700)
        for asset in ASSETS:
            (self.release / "public" / asset).write_text(asset)
        (self.release / "bin/bun").write_bytes(self.bun.read_bytes())
        (self.release / "bunfig.toml").write_text("")
        (self.release / "dist/server.js").write_text("fixture bundle")
        self.manifest = {"schemaVersion": 1, "release": "r1", "sourceRevision": "a" * 40, "bun": str(self.release / "bin/bun"), "bunVersion": "fixture", "bunSha256": digest(self.bun), "health": CONTRACT, "files": {str(p.relative_to(self.release)): digest(p) for p in self.release.rglob("*") if p.is_file()}}
        (self.release / "manifest.json").write_bytes(json_bytes(self.manifest))
        for file in self.release.rglob("*"):
            file.chmod(0o700 if file.is_dir() else 0o600)
        (self.release / "bin/bun").chmod(0o700)

    def tearDown(self):
        # Test fixtures only; production code deliberately keeps all releases.
        for path in self.base.rglob("*"):
            if path.is_dir() and not path.is_symlink():
                path.chmod(0o700)
        self.temp.cleanup()

    def runner(self, args, **kwargs):
        self.calls.append(args)
        if Path(args[0]).name == "bun":
            if "--eval" in args:
                return "false" if self.relative_state else "true"
            return "fixture"
        name = next((n for n, label in LABELS.items() if args[-1].endswith("/" + label) or args[-1].endswith("/" + label + ".plist")), None)
        command = args[1]
        if command == "print":
            if name in self.removing:
                if self.removing[name] > 0:
                    self.removing[name] -= 1
                else:
                    self.loaded.remove(name)
                    del self.removing[name]
            if name not in self.loaded:
                raise RuntimeError("not loaded")
        elif command == "bootout":
            if self.bootout_delay:
                self.removing[name] = self.bootout_delay
            else:
                self.loaded.remove(name)
        elif command == "bootstrap":
            if self.fail_bootstrap == name:
                self.fail_bootstrap = None
                raise RuntimeError("fixture bootstrap failure")
            self.loaded.add(name)
        return ""

    def test_install_preserves_private_config_and_lifecycle_fields(self):
        result = self.manager.install("r1")
        for name, data in self.originals.items():
            old = plistlib.loads(data)
            new = plistlib.loads(self.manager.plist_path(name).read_bytes())
            for key in old:
                if key not in ("ProgramArguments", "WorkingDirectory"):
                    self.assertEqual(new[key], old[key])
            self.assertEqual(new["ProgramArguments"][1], old["ProgramArguments"][1])
            self.assertEqual(new["ProgramArguments"][-1], str(self.release / "dist/server.js"))
        self.assertTrue(result["ready"])
        self.assertEqual(self.loaded, set(LABELS))
        self.assertNotIn("private", json.dumps(result))

    def test_dry_run_does_not_stop_or_rewrite_services(self):
        self.assertTrue(self.manager.install("r1", dry_run=True)["dryRun"])
        self.assertFalse(any(c[0] == "/bin/launchctl" for c in self.calls))
        self.assertEqual(list((self.root / "snapshots").iterdir()), [])
        for name, data in self.originals.items():
            self.assertEqual(self.manager.plist_path(name).read_bytes(), data)

    def test_second_bootstrap_failure_restores_both_original_bytes(self):
        self.fail_bootstrap = "dashboard"
        with self.assertRaisesRegex(RuntimeError, "previous plists/services restored"):
            self.manager.install("r1")
        for name, data in self.originals.items():
            self.assertEqual(self.manager.plist_path(name).read_bytes(), data)
        self.assertEqual(self.loaded, set(LABELS))

    def test_explicit_rollback_restores_exact_bytes(self):
        result = self.manager.install("r1")
        self.manager.rollback(result["rollbackSnapshot"])
        for name, data in self.originals.items():
            self.assertEqual(self.manager.plist_path(name).read_bytes(), data)

    def test_unknown_label_and_relative_state_fail_before_stop(self):
        self.relative_state = True
        with self.assertRaisesRegex(ValueError, "absolute"):
            self.manager.install("r1")
        self.assertFalse(any(c[0] == "/bin/launchctl" for c in self.calls))
        self.relative_state = False
        config = plistlib.loads(self.originals["public"])
        config["Label"] = "unexpected"
        self.manager.plist_path("public").write_bytes(plistlib.dumps(config))
        with self.assertRaisesRegex(ValueError, "label"):
            self.manager.install("r1")

    def test_hash_mismatch_and_inventory_fail_before_stop(self):
        (self.release / "dist/server.js").write_text("tampered")
        with self.assertRaisesRegex(ValueError, "changed"):
            self.manager.install("r1")
        self.assertEqual(self.calls, [])

    def test_bun_hash_mismatch_blocks_install(self):
        (self.release / "bin/bun").write_text("different executable")
        with self.assertRaisesRegex(ValueError, "Pinned Bun"):
            self.manager.install("r1")

    def test_symlink_state_and_path_traversal_rejected(self):
        alias = self.base / "alias"
        alias.symlink_to(self.root, target_is_directory=True)
        with self.assertRaisesRegex(ValueError, "Symlink"):
            ServiceManager(alias, self.plists).state_dirs()
        with self.assertRaisesRegex(ValueError, "identifier"):
            self.manager.verify_release("../outside")
        with self.assertRaisesRegex(ValueError, "Symlink"):
            ServiceManager(alias / "never-create", self.plists).state_dirs()
        self.assertFalse((self.root / "never-create").exists())

    def test_stop_start_restart_idempotent(self):
        self.manager.install("r1")
        self.manager.lifecycle("stop", LABELS)
        self.manager.lifecycle("stop", LABELS)
        self.assertEqual(self.loaded, set())
        self.manager.lifecycle("start", LABELS)
        self.manager.lifecycle("start", LABELS)
        self.manager.lifecycle("restart", LABELS)
        self.assertEqual(self.loaded, set(LABELS))

    def test_restart_waits_for_asynchronous_bootout_before_bootstrap(self):
        self.manager.install("r1")
        self.calls.clear()
        self.bootout_delay = 3
        with patch("u1_service.time.sleep"):
            self.manager.lifecycle("restart", LABELS)
        self.assertEqual(self.loaded, set(LABELS))
        self.assertEqual(self.removing, {})
        for name, label in LABELS.items():
            bootstrap = [c for c in self.calls if c[1] == "bootstrap" and c[-1].endswith(label + ".plist")]
            self.assertEqual(len(bootstrap), 1, name)

    def test_stop_timeout_fails_without_claiming_restart_or_bootstrap(self):
        self.bootout_delay = 100
        with patch("u1_service.BOOTOUT_WAIT_ATTEMPTS", 3), patch("u1_service.time.sleep"), self.assertRaisesRegex(RuntimeError, "stop did not complete"):
            self.manager.lifecycle("restart", ["public"])
        self.assertFalse(any(c[1] == "bootstrap" for c in self.calls))
        self.assertIn("dashboard", self.loaded)

    def test_status_reports_service_health_without_private_paths(self):
        status = self.manager.status()
        self.assertTrue(status["public"]["healthy"])
        self.assertEqual(status["dashboard"]["contract"], CONTRACT)
        self.assertNotIn(str(self.base), json.dumps(status))

    def test_readiness_requires_version_not_merely_ok(self):
        self.health_value = {"ok": True, **CONTRACT, "toolSchemaVersion": 999}
        with patch("u1_service.time.sleep"), self.assertRaisesRegex(RuntimeError, "readiness"):
            self.manager.wait_health("public", CONTRACT)

    def test_restart_validates_all_artifacts_before_stopping_anything(self):
        self.manager.install("r1")
        self.calls.clear()
        (self.release / "bin/bun").write_text("changed")
        with self.assertRaisesRegex(ValueError, "Pinned Bun"):
            self.manager.lifecycle("restart", LABELS)
        self.assertEqual(self.loaded, set(LABELS))
        self.assertEqual(self.calls, [])

    def test_invalid_rollback_does_not_restart_services(self):
        with self.assertRaises(FileNotFoundError):
            self.manager.rollback("missing")
        self.assertEqual(self.calls, [])

    def test_install_health_failure_recovers_previous_runtime(self):
        old = {**CONTRACT, "toolSchemaVersion": 4}
        def health(name):
            entry = plistlib.loads(self.manager.plist_path(name).read_bytes())["ProgramArguments"][-1]
            return {"ok": True, "auth": "personal-oauth" if name == "public" else "local-only", **(old if entry == "src/server.ts" else {**CONTRACT, "toolSchemaVersion": 999})}
        self.manager.health = health
        with patch("u1_service.time.sleep"), self.assertRaisesRegex(RuntimeError, "previous plists/services restored"):
            self.manager.install("r1")
        self.assertEqual(self.loaded, set(LABELS))
        for name, data in self.originals.items():
            self.assertEqual(self.manager.plist_path(name).read_bytes(), data)

    def test_active_state_write_failure_also_restores_originals(self):
        from u1_service import write_private
        fail = True
        def writer(path, data):
            nonlocal fail
            if path.name == "active.json" and fail:
                fail = False
                raise OSError("fixture disk failure")
            return write_private(path, data)
        with patch("u1_service.write_private", writer), self.assertRaisesRegex(RuntimeError, "previous plists/services restored"):
            self.manager.install("r1")
        self.assertEqual(self.loaded, set(LABELS))
        for name, data in self.originals.items():
            self.assertEqual(self.manager.plist_path(name).read_bytes(), data)

    def test_stopped_service_not_claimed_healthy_and_status_verifies_integrity(self):
        self.manager.install("r1")
        self.loaded.remove("public")
        self.assertFalse(self.manager.status()["public"]["healthy"])
        (self.release / "bin/bun").write_text("changed")
        status = self.manager.status()
        self.assertEqual(status["dashboard"]["integrity"], "unverified")
        self.assertFalse(status["dashboard"]["healthy"])

    def test_concurrent_lifecycle_lock_rejected(self):
        with self.manager.lock():
            with self.assertRaisesRegex(RuntimeError, "in progress"), self.manager.lock():
                pass

    def test_bun_explicit_env_and_plist_precedence(self):
        # Actual local Bun only, no server or private files. Skip when unavailable.
        import shutil
        import subprocess
        bun = shutil.which("bun")
        if not bun:
            self.skipTest("Bun unavailable")
        bun = subprocess.check_output([bun, "-p", "process.execPath"], text=True).strip()
        explicit = self.base / "explicit.env"
        explicit.write_text("U1_TEST_EXPLICIT=from_file\nU1_TEST_PRECEDENCE=from_file\n")
        (self.base / ".env").write_text("U1_TEST_AUTOLOAD=must_not_load\n")
        (self.base / "bunfig.toml").write_text('preload = ["./must-not-load.ts"]\n')
        (self.base / "must-not-load.ts").write_text('throw new Error("ambient config must not execute")\n')
        code = 'console.log(JSON.stringify({explicit:process.env.U1_TEST_EXPLICIT,precedence:process.env.U1_TEST_PRECEDENCE,autoload:process.env.U1_TEST_AUTOLOAD??null}))'
        result = subprocess.run([bun, f"--env-file={explicit}", "--no-env-file", "--config=/dev/null", "--eval", code], cwd=self.base, env={"PATH": os.environ.get("PATH", ""), "U1_TEST_PRECEDENCE": "from_plist"}, capture_output=True, text=True, check=True)
        self.assertEqual(json.loads(result.stdout), {"explicit": "from_file", "precedence": "from_plist", "autoload": None})

    def test_stage_builds_closed_kit_inventory_and_is_immutable(self):
        app = self.base / "plugins/u1-print-studio/app"
        (app / "public").mkdir(parents=True)
        (app / "src/lib/server").mkdir(parents=True)
        for asset in ASSETS:
            (app / "public" / asset).write_text(asset)
        (app / "public/private-recording.mp4").write_text("do not stage")
        (app / "src/lib/server/runtime-contract.ts").write_text('export const U1_RUNTIME_VERSION = "0.3.0";\nexport const U1_TOOL_SCHEMA_VERSION = 5;\nexport const U1_OBSERVATION_WIDGET_VERSION = "observation-v2";\nexport const U1_CAMERA_WIDGET_VERSION = "camera-v4";')
        def build_runner(args, **kwargs):
            if args[0] == "git":
                return "a" * 40 if "rev-parse" in args else ""
            if "build:server" in args:
                out = Path(args[args.index("--outdir") + 1])
                write_kit_build(out)
            return "fixture"
        manager = ServiceManager(self.root, self.plists, build_runner)
        result = manager.stage(self.base, self.bun, "r2")
        release, manifest = manager.verify_release("r2")
        self.assertEqual(result["health"], CONTRACT)
        self.assertEqual(manifest["schemaVersion"], 2)
        self.assertEqual(manifest["buildKind"], BUILD_KIND)
        self.assertIn("dist/handler.js", manifest["files"])
        self.assertIn("dist/client/_app/immutable/start.fixture.js", manifest["files"])
        self.assertIn("dist/prerendered/dashboard/fans.html", manifest["files"])
        self.assertIn("dist/build-manifest.json", manifest["files"])
        self.assertFalse((release / "public/private-recording.mp4").exists())
        self.assertEqual(release.stat().st_mode & 0o777, 0o500)

    def kit_release(self):
        release = self.root / "releases/r2"
        release.mkdir(mode=0o700)
        write_kit_build(release / "dist")
        (release / "bin").mkdir(mode=0o700)
        (release / "bin/bun").write_bytes(self.bun.read_bytes())
        (release / "bunfig.toml").write_text("")
        manifest = {"schemaVersion": 2, "buildKind": BUILD_KIND, "release": "r2",
                    "sourceRevision": "b" * 40, "bun": str(release / "bin/bun"),
                    "bunVersion": "fixture", "bunSha256": digest(self.bun), "health": CONTRACT,
                    "files": {p.relative_to(release).as_posix(): digest(p) for p in release.rglob("*") if p.is_file()}}
        (release / "manifest.json").write_bytes(json_bytes(manifest))
        for path in release.rglob("*"):
            path.chmod(0o700 if path.is_dir() or path == release / "bin/bun" else 0o600)
        return release, manifest

    def test_kit_install_can_rollback_to_verified_legacy_release(self):
        self.manager.install("r1")
        old = {name: self.manager.plist_path(name).read_bytes() for name in LABELS}
        self.kit_release()
        result = self.manager.install("r2")
        self.assertTrue(all(value["integrity"] == "verified" for value in self.manager.status().values()))
        self.manager.rollback(result["rollbackSnapshot"])
        self.assertEqual({name: self.manager.plist_path(name).read_bytes() for name in LABELS}, old)
        self.assertTrue(all(value["healthy"] for value in self.manager.status().values()))

    def test_kit_manifest_cannot_be_deleted_or_downgraded(self):
        release, manifest = self.kit_release()
        downgraded = {**manifest, "schemaVersion": 1}
        del downgraded["buildKind"]
        (release / "manifest.json").write_bytes(json_bytes(downgraded))
        with self.assertRaisesRegex(ValueError, "legacy schema"):
            self.manager.install("r2")
        (release / "dist" / BUILD_MANIFEST).unlink()
        del manifest["files"]["dist/" + BUILD_MANIFEST]
        (release / "manifest.json").write_bytes(json_bytes(manifest))
        with self.assertRaisesRegex(ValueError, "missing required"):
            self.manager.install("r2")
        self.assertEqual(self.calls, [])

    def test_missing_kit_handler_and_added_client_file_fail_before_stop(self):
        release, manifest = self.kit_release()
        extra = release / "dist/client/_app/unlisted.js"
        extra.write_text("unlisted output")
        with self.assertRaisesRegex(ValueError, "inventory changed"):
            self.manager.install("r2")
        extra.unlink()
        (release / "dist/handler.js").unlink()
        del manifest["files"]["dist/handler.js"]
        (release / "manifest.json").write_bytes(json_bytes(manifest))
        with self.assertRaisesRegex(ValueError, "missing required"):
            self.manager.install("r2")
        self.assertEqual(self.calls, [])


class BuildContractTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="u1-kit-contract-")
        self.directory = Path(self.temporary.name).resolve()
        self.manifest = write_kit_build(self.directory)

    def tearDown(self):
        self.temporary.cleanup()

    def write_manifest(self):
        (self.directory / BUILD_MANIFEST).write_bytes(json_bytes(self.manifest))

    def test_complete_build_is_readable_and_relocatable(self):
        import shutil
        with tempfile.TemporaryDirectory(prefix="u1-relocated-") as target:
            relocated = Path(target).resolve() / "dist"
            shutil.copytree(self.directory, relocated)
            self.assertEqual(read_build_manifest(relocated), self.manifest)

    def test_missing_route_cannot_reduce_security_inventory(self):
        del self.manifest["staticRoutes"]["/dashboard/overview"]
        self.write_manifest()
        with self.assertRaisesRegex(ValueError, "Required static route"):
            read_build_manifest(self.directory)

    def test_private_asset_cannot_become_public(self):
        self.manifest["staticRoutes"]["/_app/immutable/start.fixture.js"]["role"] = "both"
        self.write_manifest()
        with self.assertRaisesRegex(ValueError, "cannot be public"):
            read_build_manifest(self.directory)

    def test_file_hash_mismatch_and_undeclared_files_are_rejected(self):
        (self.directory / "private-recording.mp4").write_text("must not ship")
        with self.assertRaisesRegex(ValueError, "output inventory"):
            read_build_manifest(self.directory)
        (self.directory / "private-recording.mp4").unlink()
        (self.directory / "handler.js").write_text("changed")
        with self.assertRaisesRegex(ValueError, "hash mismatch"):
            read_build_manifest(self.directory)

    def test_generated_static_file_requires_a_declared_route(self):
        del self.manifest["staticRoutes"]["/_app/immutable/start.fixture.js"]
        self.write_manifest()
        with self.assertRaisesRegex(ValueError, "missing its route"):
            read_build_manifest(self.directory)

    def test_symlink_and_traversal_cannot_enter_runtime_inventory(self):
        original = self.directory / "handler.js"
        original.unlink()
        original.symlink_to(self.directory / "server.js")
        with self.assertRaisesRegex(ValueError, "regular files|symlinks"):
            read_build_manifest(self.directory)
        original.unlink()
        original.write_text("fixture handler")
        self.manifest["runtimeFiles"]["../outside"] = "0" * 64
        self.write_manifest()
        with self.assertRaisesRegex(ValueError, "Invalid build file path"):
            read_build_manifest(self.directory)

    def test_duplicate_keys_and_missing_build_kind_are_rejected(self):
        path = self.directory / BUILD_MANIFEST
        path.write_text('{"schemaVersion":1,"schemaVersion":1}')
        with self.assertRaisesRegex(ValueError, "Duplicate"):
            read_build_manifest(self.directory)
        del self.manifest["buildKind"]
        self.write_manifest()
        with self.assertRaisesRegex(ValueError, "Unsupported"):
            read_build_manifest(self.directory)

    def test_static_route_must_match_hashed_runtime_file(self):
        self.manifest["staticRoutes"]["/dashboard/fans"]["sha256"] = "0" * 64
        self.write_manifest()
        with self.assertRaisesRegex(ValueError, "not bound"):
            read_build_manifest(self.directory)

    def test_directory_rejects_foreign_empty_duplicate_and_missing_links(self):
        valid = (self.directory / "static-contract/dashboard-index.html").read_text()
        invalid_documents = {
            "foreign": '<a href="https://unexpected.invalid">Wrong</a>',
            "empty": "<main>No links</main>",
            "duplicate": valid + '<a href="/dashboard/fans">Duplicate</a>',
            "missing": valid.replace('<a href="/dashboard/fans">fans</a>', ""),
        }
        for name, html in invalid_documents.items():
            with self.subTest(case=name):
                relative = "static-contract/dashboard-index.html"
                (self.directory / relative).write_text(html)
                expected = digest(self.directory / relative)
                self.manifest["runtimeFiles"][relative] = expected
                for route in ("/dashboard", "/dashboard/"):
                    self.manifest["staticRoutes"][route]["sha256"] = expected
                self.write_manifest()
                with self.assertRaisesRegex(ValueError, "directory links"):
                    read_build_manifest(self.directory)

    def test_explicit_asset_paths_keep_both_legacy_resources_hashed(self):
        read_build_manifest(self.directory)
        for name in ("legacy-widget.html", "legacy-camera-widget.html"):
            self.assertEqual(LEGACY_ASSET_FILES[name], name)
            self.assertEqual(self.manifest["runtimeFiles"][name], digest(self.directory / name))
        (self.directory / "legacy-widget.html").write_text("tampered legacy resource")
        with self.assertRaisesRegex(ValueError, "hash mismatch"):
            read_build_manifest(self.directory)


if __name__ == "__main__":
    unittest.main()
