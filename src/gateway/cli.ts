/**
 * Build a CLI command that prefers OpenClaw and falls back to legacy Clawdbot.
 * The fallback is command-availability based (not error-code based).
 */
export function buildCliCommand(args: string): string {
  return `if command -v openclaw >/dev/null 2>&1; then openclaw ${args}; elif command -v clawdbot >/dev/null 2>&1; then clawdbot ${args}; else echo "openclaw/clawdbot not found" >&2; exit 127; fi`;
}

/**
 * Escape a shell argument using single-quote wrapping.
 */
export function shellEscapeArg(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}
