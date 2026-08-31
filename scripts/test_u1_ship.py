"""Shipping fixtures only: never invoke GitHub, launchctl or printer endpoints."""
from copy import deepcopy
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import Mock, patch

from u1_service import ASSETS, digest
from u1_ship import (
    APP, Operations, REPOSITORY, ShipError, check_security, check_static,
    guard_pr, oauth_identity, ship, static_contract,
)

HEAD = "a" * 40
BASE = "b" * 40
MERGED = "c" * 40


def pr_fixture():
    return {"number": 34, "state": "open", "draft": False, "merged": False,
            "head": {"sha": HEAD, "ref": "feature", "repo": {"full_name": REPOSITORY}},
            "base": {"sha": BASE, "ref": "main", "repo": {"full_name": REPOSITORY}}}


class FakeOperations:
    def __init__(self, fail=None):
        self.pr = 34
        self.fail = fail
        self.events = []
        self.receipts = []
        self.preflights = 0

    def event(self, name):
        self.events.append(name)
        if self.fail == name:
            raise RuntimeError("private secret must never appear in reports")

    def fetch_base(self): self.event("fetch")

    def preflight(self, ancestry=True):
        self.event("preflight")
        self.preflights += 1
        candidate = {"reviewedSha": HEAD, "reviewedTree": "tree", "baseSha": BASE}
        if self.fail == "race" and self.preflights > 2:
            candidate["baseSha"] = "d" * 40
        return candidate

    def validate(self): self.event("validate")
    def baseline(self):
        self.event("baseline")
        return {"preserve": "original"}
    def preserve(self):
        self.event("preserve")
        return "changed" if self.fail == "changed-before-install" else "original"
    def merge(self, candidate):
        self.event("merge")
        return MERGED
    def checkout(self, merged, candidate, operation):
        self.event("checkout")
        assert merged == MERGED and candidate["reviewedTree"] == "tree"
        return Path("/fixture/exact-merged")
    def stage(self, source, release, merged):
        self.event("stage")
        assert source == Path("/fixture/exact-merged") and merged == MERGED
        return {"sourceRevision": merged}
    def dry_run(self, release): self.event("dry-run")
    def install(self, release):
        self.event("install")
        return {"rollbackSnapshot": "exact-pre-install"}
    def restart(self): self.event("restart-both")
    def verify(self, release, manifest, baseline):
        self.event("verify")
        assert manifest["sourceRevision"] == MERGED
        return {"healthy": True}
    def rollback(self, snapshot):
        self.event("rollback")
        assert snapshot == "exact-pre-install"
        if self.fail == "rollback-failure":
            raise RuntimeError("fixture rollback failure")
    def verify_restored(self, baseline): self.event("verify-restored")
    def receipt(self, report):
        self.receipts.append(deepcopy(report))


class ShipWorkflowTests(unittest.TestCase):
    def test_default_plan_is_read_only(self):
        ops = FakeOperations()
        report = ship(ops)
        self.assertTrue(report["ok"])
        self.assertTrue(report["planOnly"])
        self.assertEqual(ops.events, ["preflight"])
        self.assertEqual(ops.receipts, [])

    def test_authorized_success_orders_full_sequence_and_captures_snapshot(self):
        ops = FakeOperations()
        report = ship(ops, True)
        self.assertTrue(report["ok"])
        self.assertEqual(ops.events, ["preflight", "fetch", "preflight", "validate", "preflight", "baseline", "merge", "checkout", "stage", "dry-run", "preserve", "install", "restart-both", "verify"])
        self.assertEqual(report["mergedSha"], MERGED)
        self.assertEqual(report["rollbackSnapshot"], "exact-pre-install")
        self.assertTrue(report["installed"])
        self.assertNotIn("rollback", ops.events)

    def test_failed_premerge_phases_never_merge_or_install(self):
        for fail in ("fetch", "preflight", "validate", "race", "baseline"):
            with self.subTest(fail=fail):
                ops = FakeOperations(fail)
                report = ship(ops, True)
                self.assertFalse(report["ok"])
                self.assertNotIn("merge", ops.events)
                self.assertNotIn("install", ops.events)
                self.assertNotIn("private secret", json.dumps(report))

    def test_merge_error_reports_uncertain_without_repeating_it(self):
        ops = FakeOperations("merge")
        report = ship(ops, True)
        self.assertFalse(report["ok"])
        self.assertEqual(report["mergeState"], "uncertain-check-pr")
        self.assertEqual(ops.events.count("merge"), 1)
        self.assertNotIn("stage", ops.events)

    def test_failed_merged_tree_stage_dryrun_never_touch_services(self):
        for fail in ("checkout", "stage", "dry-run", "changed-before-install"):
            with self.subTest(fail=fail):
                ops = FakeOperations(fail)
                report = ship(ops, True)
                self.assertFalse(report["ok"])
                self.assertTrue(report["merged"])
                self.assertNotIn("install", ops.events)
                self.assertNotIn("rollback", ops.events)

    def test_failed_install_leaves_recovery_to_existing_lifecycle(self):
        ops = FakeOperations("install")
        report = ship(ops, True)
        self.assertFalse(report["ok"])
        self.assertEqual(report["rollback"], "install-helper-owned-check-snapshots")
        self.assertNotIn("rollback", ops.events)

    def test_restart_or_verification_failure_rolls_back_exactly_once(self):
        for fail in ("restart-both", "verify"):
            with self.subTest(fail=fail):
                ops = FakeOperations(fail)
                report = ship(ops, True)
                self.assertFalse(report["ok"])
                self.assertTrue(report["merged"])
                self.assertFalse(report["installed"])
                self.assertEqual(report["rollback"], "verified")
                self.assertEqual(ops.events.count("rollback"), 1)
                self.assertEqual(ops.events[-1], "verify-restored")

    def test_rollback_failure_never_loops_or_claims_success(self):
        ops = FakeOperations("rollback-failure")
        def fail_verify(*args):
            ops.event("verify")
            raise RuntimeError("failed verification")
        ops.verify = fail_verify
        report = ship(ops, True)
        self.assertFalse(report["ok"])
        self.assertEqual(report["rollback"], "needs-operator-attention")
        self.assertEqual(ops.events.count("rollback"), 1)
        self.assertNotIn("verify-restored", ops.events)

    def test_receipt_failure_after_install_rolls_back_once(self):
        ops = FakeOperations()
        def receipt(report):
            if report["installed"]:
                raise OSError("private path omitted")
        ops.receipt = receipt
        report = ship(ops, True)
        self.assertFalse(report["ok"])
        self.assertEqual(report["rollback"], "verified")
        self.assertEqual(ops.events.count("rollback"), 1)
        self.assertNotIn("restart-both", ops.events)


class MechanicalGuardTests(unittest.TestCase):
    def test_same_repo_reviewed_head_and_main_are_required(self):
        guard_pr(pr_fixture(), 34, HEAD, "feature")
        changes = [("head", "sha", BASE), ("head", "ref", "other"), ("base", "ref", "other")]
        for section, key, value in changes:
            pr = pr_fixture()
            pr[section][key] = value
            with self.assertRaises(ShipError): guard_pr(pr, 34, HEAD, "feature")
        for change in ({"draft": True}, {"state": "closed"}, {"merged": True}, {"number": 1}):
            with self.assertRaises(ShipError): guard_pr({**pr_fixture(), **change}, 34, HEAD, "feature")
        pr = pr_fixture()
        pr["head"]["repo"]["full_name"] = "other/repository"
        with self.assertRaises(ShipError): guard_pr(pr, 34, HEAD, "feature")

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="u1-ship-fixture-")
        self.root = Path(self.temp.name).resolve()
        self.bun = self.root / "bun"
        self.bun.write_text("fixture only")
        self.bun.chmod(0o700)

    def tearDown(self): self.temp.cleanup()

    def preflight_ops(self, override=None):
        ops = object.__new__(Operations)
        ops.bun, ops.pr, ops.reviewed = self.bun, 34, HEAD
        ops.environment = {"PATH": str(self.root)}
        ops.bun_hash = digest(self.bun)
        defaults = {("remote", "get-url", "origin"): f"git@github.com:{REPOSITORY}.git", ("status", "--porcelain", "--untracked-files=normal"): "", ("symbolic-ref", "--quiet", "--short", "HEAD"): "feature", ("rev-parse", "HEAD"): HEAD, ("ls-remote", "--exit-code", "origin", "refs/heads/main"): BASE + "\trefs/heads/main", ("merge-base", "--is-ancestor", BASE, HEAD): "", ("rev-parse", HEAD + "^{tree}"): "tree"}
        defaults.update(override or {})
        def git(*args, **kwargs):
            value = defaults[args]
            if isinstance(value, Exception): raise value
            return value
        ops.git, ops.command, ops.pr_info = git, lambda *a, **kw: "1.3.12", pr_fixture
        return ops

    def test_local_wrong_repo_dirty_head_branch_and_stale_base_fail(self):
        self.assertEqual(self.preflight_ops().preflight()["reviewedSha"], HEAD)
        changes = {("remote", "get-url", "origin"): "https://other.invalid/repo", ("status", "--porcelain", "--untracked-files=normal"): "?? private-file", ("symbolic-ref", "--quiet", "--short", "HEAD"): "main", ("rev-parse", "HEAD"): BASE, ("ls-remote", "--exit-code", "origin", "refs/heads/main"): HEAD + "\trefs/heads/main", ("merge-base", "--is-ancestor", BASE, HEAD): RuntimeError("not ancestor")}
        for key, value in changes.items():
            with self.subTest(key=key), self.assertRaises(RuntimeError): self.preflight_ops({key: value}).preflight()

    def test_pinned_bun_content_change_fails(self):
        ops = self.preflight_ops()
        self.bun.write_text("modified")
        with self.assertRaisesRegex(ShipError, "Bun"): ops.preflight()

    def test_bare_bun_must_be_the_pinned_executable(self):
        ops = self.preflight_ops()
        other = self.root / "bun-1.3.12"
        other.write_bytes(self.bun.read_bytes())
        other.chmod(0o700)
        ops.bun = other
        with self.assertRaisesRegex(ShipError, "bare bun"): ops.preflight()

    def test_bun_compile_scratch_ignore_is_narrow_and_clean_guard_remains(self):
        # Real Git semantics in an isolated local fixture; no remote or services.
        def git(*args):
            return subprocess.run(["git", *args], cwd=self.root, check=True, capture_output=True, text=True).stdout.strip()
        git("init", "--quiet")
        (self.root / ".gitignore").write_bytes((Path(__file__).resolve().parent.parent / ".gitignore").read_bytes())
        app = self.root / APP
        app.mkdir(parents=True)
        tracked = app / "tracked.ts"
        tracked.write_text("original")
        git("add", ".gitignore", "bun", str(APP / "tracked.ts"))
        git("-c", "user.name=Fixture", "-c", "user.email=fixture@example.invalid", "commit", "--quiet", "-m", "fixture")
        scratch = app / ".18d0efb87e9ffd7a-00000000.bun-build"
        scratch.write_bytes(self.bun.read_bytes())
        self.assertEqual(git("check-ignore", str(scratch.relative_to(self.root))), str(scratch.relative_to(self.root)))
        self.assertEqual(git("status", "--porcelain", "--untracked-files=normal"), "")
        unrelated = app / ".unrelated-local-file"
        unrelated.write_text("must block")
        outside = self.root / ".elsewhere.bun-build"
        outside.write_text("must also block")
        malformed = app / ".not-a-runtime.bun-build"
        malformed.write_text("must also block")
        tracked.write_text("changed")
        status = git("status", "--porcelain", "--untracked-files=normal")
        self.assertIn(".unrelated-local-file", status)
        self.assertIn(".elsewhere.bun-build", status)
        self.assertIn(".not-a-runtime.bun-build", status)
        self.assertIn("tracked.ts", status)
        with self.assertRaisesRegex(ShipError, "clean"):
            self.preflight_ops({("status", "--porcelain", "--untracked-files=normal"): status}).preflight()

    def test_stage_rejects_wrong_revision_or_asset(self):
        ops = self.preflight_ops()
        ops.contract = {"fixture": True}
        release = self.root / "release"
        for directory in (release / "public", self.root / APP / "public"):
            directory.mkdir(parents=True)
            for name in ASSETS: (directory / name).write_text(name)
        ops.manager = Mock()
        ops.manager.stage.return_value = {"sourceRevision": MERGED}
        manifest = {"sourceRevision": MERGED}
        ops.manager.verify_release.return_value = (release, manifest)
        with patch("u1_ship.static_contract", return_value=ops.contract):
            self.assertEqual(ops.stage(self.root, "fixture", MERGED), manifest)
            ops.manager.stage.return_value = {"sourceRevision": HEAD}
            with self.assertRaisesRegex(ShipError, "revision"): ops.stage(self.root, "fixture", MERGED)
            ops.manager.stage.return_value = {"sourceRevision": MERGED}
            (release / "public/widget.html").write_text("wrong")
            with self.assertRaisesRegex(ShipError, "asset"): ops.stage(self.root, "fixture", MERGED)

    def test_merge_uses_only_matching_head_no_bypass_flags(self):
        ops = self.preflight_ops()
        calls = []
        ops.command = lambda args, **kwargs: calls.append(args) or ""
        ops.pr_info = lambda: {"merged": True, "merge_commit_sha": MERGED}
        self.assertEqual(ops.merge({}), MERGED)
        self.assertEqual(calls[0], ["gh", "pr", "merge", "34", "--repo", REPOSITORY, "--merge", "--match-head-commit", HEAD])

    def test_merged_tree_mismatch_stops_before_checkout(self):
        ops = self.preflight_ops()
        calls = []
        ops.git = lambda *args, **kwargs: calls.append(args) or ("different" if args[0] == "rev-parse" else "")
        with self.assertRaisesRegex(ShipError, "Merged tree"):
            ops.checkout(MERGED, {"reviewedTree": "tree"}, "fixture")
        self.assertFalse(any(c[0] == "worktree" for c in calls))

    def test_local_validation_runs_full_gate_three_bundles_and_signature(self):
        app = self.root / APP
        for directory in (app / "public", app / "dist"):
            directory.mkdir(parents=True)
            for name in ASSETS: (directory / name).write_text(name)
        ops = self.preflight_ops()
        ops.source = self.root
        calls = []
        ops.command = lambda args, **kwargs: calls.append(args) or ""
        ops.git = lambda *args, **kwargs: ""
        ops.validate()
        self.assertIn(["./scripts/check-repository.sh"], calls)
        self.assertEqual([c[-1] for c in calls if len(c) > 3 and c[-2] == "run"], ["bundle", "bundle:server", "bundle:runtime"])
        self.assertTrue(any(c[0] == "codesign" for c in calls))
        (app / "dist/widget.html").write_text("different")
        with self.assertRaisesRegex(ShipError, "asset"): ops.validate()

    def test_oauth_refresh_registration_and_counter_changes_are_allowed(self):
        path = self.root / "oauth.json"
        state = {"version": 2, "signingPrivateJwk": {"private": "fixture"}, "signingPublicJwk": {"public": "fixture"}, "credential": {"id": "fixture", "publicKey": "fixture", "counter": 1}, "clients": {}, "refreshTokens": {}}
        path.write_text(json.dumps(state))
        original = oauth_identity(path)
        state["credential"]["counter"] = 2
        state["clients"]["fixture"] = "registered"
        state["refreshTokens"]["fixture"] = "rotated"
        path.write_text(json.dumps(state))
        self.assertEqual(oauth_identity(path), original)
        state["credential"]["publicKey"] = "changed"
        path.write_text(json.dumps(state))
        self.assertNotEqual(oauth_identity(path), original)


class StaticContractTests(unittest.TestCase):
    def test_directory_source_routes_are_dynamic_not_fixed_count(self):
        with tempfile.TemporaryDirectory(prefix="u1-static-fixture-") as temporary:
            root = Path(temporary)
            app = root / APP
            (app / "src").mkdir(parents=True)
            (app / "public").mkdir()
            (app / "src/status-dashboard.ts").write_text('const FOCUSED_DASHBOARD_PATHS = new Set(["/dashboard/progress", "/dashboard/new_view"]);')
            for name in ASSETS: (app / "public" / name).write_text(name)
            index = app / "public/dashboard-index.html"
            index.write_text('<a href="/dashboard/progress">Progress</a><a href="/dashboard/new_view">New</a><a href="/dashboard/camera">Camera</a>')
            contract = static_contract(root)
            self.assertIn("8788/dashboard/new_view", contract)
            index.write_text('<a href="https://unexpected.invalid">Wrong</a>')
            with self.assertRaises(ShipError): static_contract(root)

    def test_served_hash_mismatch_fails_without_followup_acquisition(self):
        calls = []
        def read(port, route):
            calls.append((port, route))
            return 200, b"different"
        with self.assertRaisesRegex(ShipError, "static"):
            check_static({"widget": {"port": 8788, "route": "/widget", "sha256": "expected"}}, read)
        self.assertEqual(calls, [(8788, "/widget")])

    def test_security_checks_are_get_only_closed_routes(self):
        calls = []
        def read(port, route):
            calls.append((port, route))
            if port == 8789: return 200, b'{"ok":true,"surface":"passkey-enrollment"}'
            return (401 if port == 8787 and route == "/mcp" else 404), b""
        contract = {"index": {"port": 8788, "route": "/dashboard", "sha256": "fixture"}}
        self.assertEqual(check_security(contract, read), 6)
        self.assertFalse(any("tools" in path or "camera" in path or "status" in path for _, path in calls))
        with self.assertRaisesRegex(ShipError, "authentication"):
            check_security(contract, lambda *args: (200, b""))


if __name__ == "__main__":
    unittest.main()
