#!/usr/bin/env python3
"""Block Codex tool calls that would write to cloudflare/moltworker."""

import json
import re
import shlex
import subprocess
import sys
from pathlib import Path
from typing import Any, Mapping, Optional


UPSTREAM_OWNER = "cloudflare"
UPSTREAM_REPO = "moltworker"
DENIAL_REASON = (
    "Blocked by repository policy: cloudflare/moltworker is read-only; "
    "write to kyoneken/moltworker instead."
)

READ_ONLY_GITHUB_PREFIXES = ("get_", "list_", "search_")
READ_ONLY_GITHUB_TOOLS = {"issue_read", "pull_request_read"}

READ_ONLY_GH_ACTIONS = {
    "browse": {None},
    "issue": {"list", "status", "view"},
    "label": {"list"},
    "pr": {"checks", "diff", "list", "status", "view"},
    "release": {"download", "list", "view", "verify", "verify-asset"},
    "repo": {"list", "view"},
    "run": {"list", "view", "watch"},
    "search": {"code", "commits", "issues", "prs", "repos"},
    "workflow": {"list", "view"},
}

UPSTREAM_REPOSITORY = re.compile(
    r"(?<![a-z0-9_.-])cloudflare/moltworker(?:\.git)?(?![a-z0-9_.-])",
    re.IGNORECASE,
)
UPSTREAM_GITHUB_URL = re.compile(
    r"(?:github\.com[:/]|api\.github\.com/repos/)"
    r"cloudflare/moltworker(?:\.git)?(?![a-z0-9_.-])",
    re.IGNORECASE,
)
UPSTREAM_OWNER_ARGUMENT = re.compile(
    r"\b(?:owner|login)\b[\"']?\s*[:=]\s*[\"']?cloudflare\b", re.IGNORECASE
)
UPSTREAM_REPO_ARGUMENT = re.compile(
    r"\b(?:repo|name)\b[\"']?\s*[:=]\s*[\"']?moltworker\b", re.IGNORECASE
)
CURL_COMMAND = re.compile(r"(?:^|[;&|]\s*)curl\s", re.IGNORECASE)
HTTP_WRITE = re.compile(
    r"(?:--request|-X)\s*(?:POST|PUT|PATCH|DELETE)\b|"
    r"(?:--data(?:-[a-z-]+)?|-d|--form|-F|--upload-file|-T)\b|"
    r"\b(?:post|put|patch|delete)\s*\(",
    re.IGNORECASE,
)


def deny() -> None:
    json.dump(
        {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": DENIAL_REASON,
            }
        },
        sys.stdout,
        separators=(",", ":"),
    )


def repository_name_is_upstream(value: Any) -> bool:
    if not isinstance(value, str):
        return False
    normalized = value.casefold().rstrip("/").removesuffix(".git")
    return normalized == f"{UPSTREAM_OWNER}/{UPSTREAM_REPO}" or bool(
        UPSTREAM_GITHUB_URL.search(normalized)
    )


def owner_name(value: Any) -> Optional[str]:
    if isinstance(value, str):
        return value
    if isinstance(value, Mapping):
        for key in ("login", "name"):
            candidate = value.get(key)
            if isinstance(candidate, str):
                return candidate
    return None


def is_upstream_target(tool_input: Any) -> bool:
    if isinstance(tool_input, list):
        return any(is_upstream_target(item) for item in tool_input)
    if not isinstance(tool_input, Mapping):
        return repository_name_is_upstream(tool_input)

    owner = owner_name(tool_input.get("owner"))
    repo = tool_input.get("repo", tool_input.get("name"))
    if isinstance(owner, str) and isinstance(repo, str):
        if owner.casefold() == UPSTREAM_OWNER and repo.casefold().removesuffix(".git") == UPSTREAM_REPO:
            return True

    for key in ("repository", "repository_name", "repository_url", "repo_name", "full_name"):
        value = tool_input.get(key)
        if repository_name_is_upstream(value):
            return True

    return any(is_upstream_target(value) for value in tool_input.values())


def github_tool_is_read_only(tool_name: str) -> bool:
    action = tool_name.removeprefix("mcp__github__")
    return action.startswith(READ_ONLY_GITHUB_PREFIXES) or action in READ_ONLY_GITHUB_TOOLS


def tokenize_shell(command: str) -> list[str]:
    try:
        lexer = shlex.shlex(command, posix=True, punctuation_chars=";&|\n")
        lexer.whitespace = " \t\r"
        lexer.whitespace_split = True
        lexer.commenters = ""
        return list(lexer)
    except ValueError:
        return []


def shell_tokens(command: str) -> list[list[str]]:
    outer = tokenize_shell(command)

    token_sets = [outer]
    for index, token in enumerate(outer):
        if index < 2 or outer[index - 1] not in {"-c", "-lc"}:
            continue
        if Path(outer[index - 2]).name.casefold() not in {"bash", "sh", "zsh"}:
            continue
        nested = tokenize_shell(token)
        if nested != outer:
            token_sets.append(nested)

    for pattern in (r"\$\(([^()]*)\)", r"`([^`]*)`"):
        for nested_command in re.findall(pattern, command, re.DOTALL):
            nested = tokenize_shell(nested_command)
            if nested:
                token_sets.append(nested)
    return token_sets


def gh_invocations(command: str) -> list[list[str]]:
    invocations = []
    for tokens in shell_tokens(command):
        for index, token in enumerate(tokens):
            if Path(token).name.casefold() == "gh" and is_executable_position(tokens, index):
                invocations.append(tokens[index:])
    return invocations


def is_executable_position(tokens: list[str], index: int) -> bool:
    segment_start = 0
    for position in range(index - 1, -1, -1):
        if re.fullmatch(r"[;&|\n]+", tokens[position]):
            segment_start = position + 1
            break

    prefix = tokens[segment_start:index]
    while prefix and re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*=.*", prefix[0]):
        prefix = prefix[1:]
    if not prefix:
        return True

    wrapper = Path(prefix[0]).name.casefold()
    return wrapper in {"command", "env", "nohup", "sudo", "xargs"}


def git_push_targets(command: str) -> list[str]:
    targets = []
    options_with_values = {"--exec", "--push-option", "--receive-pack", "-o"}
    for tokens in shell_tokens(command):
        for git_index, token in enumerate(tokens):
            if Path(token).name.casefold() != "git" or not is_executable_position(
                tokens, git_index
            ):
                continue
            try:
                push_index = next(
                    index
                    for index in range(git_index + 1, len(tokens))
                    if tokens[index].casefold() == "push"
                )
            except StopIteration:
                continue

            index = push_index + 1
            while index < len(tokens):
                argument = tokens[index]
                if argument == "--":
                    index += 1
                    break
                if argument == "--repo" and index + 1 < len(tokens):
                    targets.append(tokens[index + 1])
                    break
                if argument.startswith("--repo="):
                    targets.append(argument.split("=", 1)[1])
                    break
                if argument in options_with_values:
                    index += 2
                    continue
                if argument.startswith("-"):
                    index += 1
                    continue
                break
            if index < len(tokens):
                targets.append(tokens[index])
    return targets


def option_value(arguments: list[str], names: tuple[str, ...]) -> Optional[str]:
    for index, argument in enumerate(arguments):
        if argument in names and index + 1 < len(arguments):
            return arguments[index + 1]
        for name in names:
            if argument.startswith(f"{name}="):
                return argument.split("=", 1)[1]
    return None


def gh_invocation_is_mutating(arguments: list[str]) -> bool:
    if len(arguments) < 2:
        return True

    group = arguments[1].casefold()
    if group == "api":
        method = option_value(arguments[2:], ("--method", "-X"))
        has_write_fields = any(
            argument in {"-f", "--raw-field", "-F", "--field", "--input"}
            or argument.startswith(("-f=", "--raw-field=", "-F=", "--field=", "--input="))
            for argument in arguments[2:]
        )
        if "graphql" in (argument.casefold() for argument in arguments[2:]):
            return "mutation" in " ".join(arguments[2:]).casefold()
        if method is not None and method.casefold() == "get":
            return False
        return has_write_fields or (method is not None and method.casefold() != "get")

    action = next(
        (argument.casefold() for argument in arguments[2:] if not argument.startswith("-")),
        None,
    )
    return action not in READ_ONLY_GH_ACTIONS.get(group, set())


def gh_command_writes_upstream(command: str) -> bool:
    invocations = gh_invocations(command)
    return bool(invocations) and any(gh_invocation_is_mutating(args) for args in invocations)


def remote_url(remote: str, cwd: str) -> Optional[str]:
    cleaned = remote.strip("'\"")
    if not re.fullmatch(r"[A-Za-z0-9._/-]+", cleaned):
        return None

    for args in (
        ["git", "-C", cwd, "remote", "get-url", "--push", cleaned],
        ["git", "-C", cwd, "remote", "get-url", cleaned],
    ):
        result = subprocess.run(args, text=True, capture_output=True, check=False)
        if result.returncode == 0:
            return result.stdout.strip()
    return None


def bash_writes_upstream(command: Any, cwd: Any) -> bool:
    if not isinstance(command, str):
        return False

    push_targets = git_push_targets(command)
    if push_targets:
        if any(target.casefold().strip("'\"") == "upstream" for target in push_targets):
            return True
        if any(UPSTREAM_GITHUB_URL.search(target) for target in push_targets):
            return True
        if isinstance(cwd, str):
            for target in push_targets:
                resolved = remote_url(target, cwd)
                if resolved and UPSTREAM_GITHUB_URL.search(resolved):
                    return True

    upstream_reference = bool(
        UPSTREAM_REPOSITORY.search(command) or UPSTREAM_GITHUB_URL.search(command)
        or (
            UPSTREAM_OWNER_ARGUMENT.search(command)
            and UPSTREAM_REPO_ARGUMENT.search(command)
        )
    )
    if not upstream_reference:
        return False

    if gh_command_writes_upstream(command):
        return True

    # Direct API reads remain usable, but any HTTP write signal is denied.
    if CURL_COMMAND.search(command) and "api.github.com" in command.casefold():
        return bool(HTTP_WRITE.search(command))

    # Catch direct API writes performed from an inline language runtime.
    if "api.github.com" in command.casefold() and HTTP_WRITE.search(command):
        return True

    return False


def should_deny(event: Any) -> bool:
    if not isinstance(event, Mapping):
        return False

    tool_name = event.get("tool_name")
    tool_input = event.get("tool_input")
    if not isinstance(tool_name, str):
        return False

    if tool_name.startswith("mcp__github__"):
        return is_upstream_target(tool_input) and not github_tool_is_read_only(tool_name)

    if tool_name == "Bash" and isinstance(tool_input, Mapping):
        return bash_writes_upstream(
            tool_input.get("command"), event.get("cwd", str(Path.cwd()))
        )

    return False


def main() -> int:
    try:
        event = json.load(sys.stdin)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return 0

    if should_deny(event):
        deny()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
