"""Focused project-agent configuration checks; no client/model invocation."""

from pathlib import Path
import tomllib
import unittest


ROOT = Path(__file__).resolve().parents[1]
ROLES = ("ui_ux_designer", "printer_domain_expert", "agentic_architect", "maker_user")
FIELDS = {"name", "description", "developer_instructions"}


class ProjectAgentTests(unittest.TestCase):
    def test_exact_role_files_and_minimal_inherited_configuration(self):
        directory = ROOT / ".codex" / "agents"
        self.assertEqual({path.stem for path in directory.glob("*.toml")}, set(ROLES))
        for name in ROLES:
            with self.subTest(role=name):
                path = directory / f"{name}.toml"
                self.assertFalse(path.is_symlink())
                with path.open("rb") as stream:
                    role = tomllib.load(stream)
                self.assertEqual(set(role), FIELDS)
                self.assertEqual(role["name"], name)
                for value in role.values():
                    self.assertIsInstance(value, str)
                    self.assertTrue(value.strip())

    def test_routing_and_usage_link_each_canonical_role(self):
        rules = (ROOT / "AGENTS.md").read_text()
        guide = (ROOT / "docs" / "project-agents.md").read_text()
        for name in ROLES:
            with self.subTest(role=name):
                self.assertIn(f".codex/agents/{name}.toml", rules)
                self.assertIn(f"(../.codex/agents/{name}.toml)", guide)
        self.assertIn("docs/project-agents.md", rules)

    def test_instruction_context_and_privacy_are_portable(self):
        for name in ROLES:
            with self.subTest(role=name):
                with (ROOT / ".codex" / "agents" / f"{name}.toml").open("rb") as stream:
                    instructions = tomllib.load(stream)["developer_instructions"]
                for reference in ("AGENTS.md", "PROJECT_STATE.md", "NEXT_AGENT.md", "docs/requirements.md"):
                    self.assertIn(reference, instructions)
                    self.assertTrue((ROOT / reference).is_file())
                for private_location in ("/Users/", "/tmp/", ".ts.net", "localhost:"):
                    self.assertNotIn(private_location, instructions)
                self.assertIn("finally/teardown", instructions)


if __name__ == "__main__":
    unittest.main()
