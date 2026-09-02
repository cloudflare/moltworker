import json
import subprocess
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
GUARD = REPO_ROOT / ".codex" / "hooks" / "upstream_write_guard.py"


def run_guard(payload: object) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["/usr/bin/python3", str(GUARD)],
        input=json.dumps(payload),
        text=True,
        capture_output=True,
        cwd=REPO_ROOT,
        check=False,
    )


def payload(tool_name: str, tool_input: object) -> dict[str, object]:
    return {
        "session_id": "test-session",
        "turn_id": "test-turn",
        "cwd": str(REPO_ROOT),
        "hook_event_name": "PreToolUse",
        "tool_name": tool_name,
        "tool_use_id": "test-tool-use",
        "tool_input": tool_input,
    }


class UpstreamWriteGuardTests(unittest.TestCase):
    def assert_denied(self, tool_name: str, tool_input: object) -> None:
        result = run_guard(payload(tool_name, tool_input))
        self.assertEqual(result.returncode, 0, result.stderr)
        output = json.loads(result.stdout)
        decision = output["hookSpecificOutput"]
        self.assertEqual(decision["hookEventName"], "PreToolUse")
        self.assertEqual(decision["permissionDecision"], "deny")
        self.assertIn("cloudflare/moltworker", decision["permissionDecisionReason"])

    def assert_allowed(self, tool_name: str, tool_input: object) -> None:
        result = run_guard(payload(tool_name, tool_input))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout, "")

    def test_blocks_upstream_github_mcp_mutations(self) -> None:
        for tool_name, tool_input in (
            (
                "mcp__github__issue_write",
                {"method": "create", "owner": "cloudflare", "repo": "moltworker"},
            ),
            (
                "mcp__github__push_files",
                {"owner": "CLOUDFLARE", "repo": "MoltWorker", "branch": "main"},
            ),
            (
                "mcp__github__create_pull_request",
                {"owner": "cloudflare", "repo": "moltworker"},
            ),
        ):
            with self.subTest(tool_name=tool_name):
                self.assert_denied(tool_name, tool_input)

    def test_allows_upstream_github_mcp_reads(self) -> None:
        for tool_name in (
            "mcp__github__get_file_contents",
            "mcp__github__issue_read",
            "mcp__github__list_issues",
            "mcp__github__search_code",
            "mcp__github__pull_request_read",
        ):
            with self.subTest(tool_name=tool_name):
                self.assert_allowed(
                    tool_name, {"owner": "cloudflare", "repo": "moltworker"}
                )

    def test_blocks_nested_upstream_github_mcp_mutation_targets(self) -> None:
        for tool_input in (
            {"request": {"owner": "cloudflare", "repo": "moltworker"}},
            {"repository": {"owner": "cloudflare", "name": "moltworker"}},
            {"repo_name": "cloudflare/moltworker"},
        ):
            with self.subTest(tool_input=tool_input):
                self.assert_denied("mcp__github__future_write", tool_input)

    def test_allows_fork_github_mcp_mutations(self) -> None:
        self.assert_allowed(
            "mcp__github__issue_write",
            {"method": "create", "owner": "kyoneken", "repo": "moltworker"},
        )

    def test_blocks_git_push_to_upstream_remote_or_url(self) -> None:
        for command in (
            "git push upstream main",
            "git push https://github.com/cloudflare/moltworker.git HEAD:main",
            "git push git@github.com:cloudflare/moltworker.git HEAD:main",
            "bash -lc 'git push upstream HEAD:main'",
            "sh -lc 'git push https://github.com/cloudflare/moltworker.git HEAD:main'",
            "true; git push upstream main",
            "echo ok\ngit push upstream main",
            "echo $(git push upstream main)",
            "bash -lc 'echo ok; git push upstream main'",
        ):
            with self.subTest(command=command):
                self.assert_denied("Bash", {"command": command})

    def test_blocks_push_options_to_a_remote_that_resolves_to_upstream(self) -> None:
        with tempfile.TemporaryDirectory() as repository:
            subprocess.run(
                ["git", "init", "--quiet", repository], check=True, capture_output=True
            )
            subprocess.run(
                [
                    "git",
                    "-C",
                    repository,
                    "remote",
                    "add",
                    "source",
                    "git@github.com:cloudflare/moltworker.git",
                ],
                check=True,
                capture_output=True,
            )
            event = payload("Bash", {"command": "git push -u source main"})
            event["cwd"] = repository
            result = run_guard(event)

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(
            json.loads(result.stdout)["hookSpecificOutput"]["permissionDecision"],
            "deny",
        )

    def test_blocks_upstream_gh_and_direct_api_commands(self) -> None:
        for command in (
            "gh issue create -R cloudflare/moltworker --title unsafe",
            "env gh issue create -R cloudflare/moltworker --title unsafe",
            "sudo gh issue create -R cloudflare/moltworker --title unsafe",
            "/usr/local/bin/gh issue create -R cloudflare/moltworker --title unsafe",
            "bash -lc 'gh issue create -R cloudflare/moltworker --title unsafe'",
            "echo ok; gh issue create -R cloudflare/moltworker --title unsafe",
            "echo ok\ngh issue create -R cloudflare/moltworker --title unsafe",
            "echo $(gh issue create -R cloudflare/moltworker --title unsafe)",
            "printf x | xargs gh issue create -R cloudflare/moltworker --title unsafe",
            "bash -lc 'echo ok; gh issue create -R cloudflare/moltworker --title unsafe'",
            "gh api --method POST repos/cloudflare/moltworker/issues -f title=unsafe",
            "gh api graphql -f query='mutation { x }' -F owner=cloudflare -F name=moltworker",
            "curl -X POST https://api.github.com/repos/cloudflare/moltworker/issues",
            "curl -X POST https://api.github.com/graphql -d '{\"owner\":\"cloudflare\",\"name\":\"moltworker\"}'",
        ):
            with self.subTest(command=command):
                self.assert_denied("Bash", {"command": command})

    def test_allows_upstream_gh_reads(self) -> None:
        for command in (
            "gh repo view cloudflare/moltworker",
            "gh issue view 64 -R cloudflare/moltworker",
            "gh pr list -R cloudflare/moltworker",
            "gh api repos/cloudflare/moltworker",
            "gh api --method GET repos/cloudflare/moltworker/issues",
            "gh api --method GET repos/cloudflare/moltworker/issues -f per_page=1",
            "gh api graphql -f query='query { x }' -F owner=cloudflare -F name=moltworker",
        ):
            with self.subTest(command=command):
                self.assert_allowed("Bash", {"command": command})

    def test_allows_read_only_and_unrelated_shell_commands(self) -> None:
        for command in (
            "git fetch upstream",
            "git push origin main",
            "curl https://api.github.com/repos/cloudflare/moltworker",
            "printf '%s\\n' cloudflare/moltworker",
            "printf '%s\\n' 'gh issue create -R cloudflare/moltworker --title example'",
            "echo gh issue create -R cloudflare/moltworker --title example",
            "bash -lc 'echo gh issue create -R cloudflare/moltworker --title example'",
            "git push origin docs/cloudflare/moltworker-notes",
        ):
            with self.subTest(command=command):
                self.assert_allowed("Bash", {"command": command})

    def test_malformed_input_does_not_blanket_block(self) -> None:
        result = subprocess.run(
            ["/usr/bin/python3", str(GUARD)],
            input="not-json",
            text=True,
            capture_output=True,
            cwd=REPO_ROOT,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout, "")

    def test_checked_in_hook_command_executes_the_guard(self) -> None:
        config = json.loads((REPO_ROOT / ".codex" / "hooks.json").read_text())
        groups = config["hooks"]["PreToolUse"]
        github_group = next(
            group for group in groups if "mcp__github__" in group.get("matcher", "")
        )
        matcher = github_group["matcher"]
        self.assertIsNotNone(__import__("re").search(matcher, "Bash"))
        self.assertIsNotNone(
            __import__("re").search(matcher, "mcp__github__issue_write")
        )
        self.assertIsNone(__import__("re").search(matcher, "WebSearch"))
        command = next(
            hook["command"]
            for hook in github_group["hooks"]
            if "upstream_write_guard.py" in hook.get("command", "")
        )

        result = subprocess.run(
            command,
            input=json.dumps(
                payload(
                    "mcp__github__issue_write",
                    {"method": "create", "owner": "cloudflare", "repo": "moltworker"},
                )
            ),
            text=True,
            capture_output=True,
            cwd=REPO_ROOT,
            shell=True,
            check=False,
        )

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(
            json.loads(result.stdout)["hookSpecificOutput"]["permissionDecision"],
            "deny",
        )


if __name__ == "__main__":
    unittest.main()
