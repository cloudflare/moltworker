#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd "$(dirname "$0")" && pwd)
HOOK="$SCRIPT_DIR/pre-push"

run_hook() {
  remote_name=$1
  remote_url=$2

  # The decision must come from the hook arguments, not the ref data on stdin.
  printf '%s\n' 'malformed ref data; command injection must remain inert' |
    "$HOOK" "$remote_name" "$remote_url" >/dev/null 2>&1
}

assert_allowed() {
  if run_hook "$1" "$2"; then
    return 0
  else
    status=$?
  fi

  printf 'FAIL: expected allowed push (%s, %s), got exit %s\n' \
    "$1" "$2" "$status" >&2
  exit 1
}

assert_blocked() {
  if run_hook "$1" "$2"; then
    printf 'FAIL: expected blocked push (%s, %s), got exit 0\n' \
      "$1" "$2" >&2
    exit 1
  else
    status=$?
  fi

  if [ "$status" -ne 1 ]; then
    printf 'FAIL: expected blocked push (%s, %s) to exit 1, got %s\n' \
      "$1" "$2" "$status" >&2
    exit 1
  fi
}

assert_allowed origin https://github.com/kyoneken/moltworker.git
assert_allowed backup https://example.com/moltworker.git
assert_allowed origin https://github.com/cloudflare/moltworker-fork.git
assert_allowed origin ssh://github.com/cloudflare/moltworker-fork.git
assert_allowed origin ssh://git@github.com:22/cloudflare/moltworker-fork.git

assert_blocked upstream https://example.com/moltworker.git
assert_blocked UpStReAm https://example.com/moltworker.git

assert_blocked origin https://github.com/cloudflare/moltworker.git
assert_blocked origin https://github.com/cloudflare/moltworker
assert_blocked origin https://github.com/cloudflare/moltworker.git/
assert_blocked origin https://GITHUB.COM/CLOUDFLARE/MOLtWORKER.GIT
assert_blocked origin git@github.com:cloudflare/moltworker.git
assert_blocked origin git@github.com:cloudflare/moltworker
assert_blocked origin git@github.com:cloudflare/moltworker.git/
assert_blocked origin ssh://git@github.com/cloudflare/moltworker.git
assert_blocked origin ssh://git@github.com/cloudflare/moltworker
assert_blocked origin ssh://git@github.com/cloudflare/moltworker.git/
assert_blocked origin ssh://github.com/cloudflare/moltworker.git
assert_blocked origin ssh://github.com/cloudflare/moltworker
assert_blocked origin ssh://GITHUB.COM/CLOUDFLARE/MOLTWORKER.GIT/
assert_blocked origin ssh://git@github.com:22/cloudflare/moltworker.git
assert_blocked origin ssh://git@github.com:22/cloudflare/moltworker
assert_blocked origin ssh://git@github.com:22/cloudflare/moltworker.git/

printf 'pre-push hook tests passed\n'
