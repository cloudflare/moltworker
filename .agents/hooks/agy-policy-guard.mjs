import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ALWAYS_DENIED_GITHUB_MUTATIONS,
  CLOUDFLARE_ISSUE_PR_TOOLS,
  findCommands,
  READ_ONLY_GITHUB_TOOLS,
  tokenizeShell,
} from '../../.codex/hooks/github-policy.mjs';

const UPSTREAM_GITHUB_URL = /(?:github\.com[:/]|api\.github\.com\/repos\/)cloudflare\/moltworker(?:\.git)?(?![a-z0-9_.-])/i;
const UPSTREAM_REMOTE_NAME = /^upstream$/i;
const HTTP_WRITE = /(?:--request|-X)\s*(?:POST|PUT|PATCH|DELETE)\b|(?:--data(?:-[a-z-]+)?|-d|--form|-F|--upload-file|-T)\b|\b(?:post|put|patch|delete)\s*\(/i;

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const sameIdentity = (actual, expected) => typeof actual === 'string' && actual.toLowerCase() === expected;

const deny = (reason) => ({ allowed: false, reason });

const firstNonOptionArgument = (args) => {
  const optionsWithValues = new Set(['-C', '-c', '--config', '--config-env', '--exec-path', '--git-dir', '--namespace', '--super-prefix', '--work-tree']);
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--') {
      return args[index + 1];
    }
    if (optionsWithValues.has(argument)) {
      index += 1;
      continue;
    }
    if (argument.startsWith('-')) {
      continue;
    }
    return argument;
  }
  return undefined;
};

const getGitPushTarget = (args) => {
  const optionsWithValues = new Set(['--exec', '--push-option', '--receive-pack', '-o', '--repo']);
  let index = 0;
  while (index < args.length) {
    const arg = args[index];
    if (arg === '--') {
      return args[index + 1];
    }
    if (arg === '--repo' && index + 1 < args.length) {
      return args[index + 1];
    }
    if (arg.startsWith('--repo=')) {
      return arg.split('=', 2)[1];
    }
    if (optionsWithValues.has(arg)) {
      index += 2;
      continue;
    }
    if (arg.startsWith('-')) {
      index += 1;
      continue;
    }
    return arg;
  }
  return undefined;
};

export function evaluateRunCommand(commandLine) {
  if (typeof commandLine !== 'string') {
    return deny('malformed command');
  }

  let commands;
  try {
    commands = findCommands(tokenizeShell(commandLine));
  } catch {
    return deny('malformed shell input');
  }

  for (const command of commands) {
    const executable = command[0].slice(command[0].lastIndexOf('/') + 1);
    const args = command.slice(1);

    if (executable === 'gh') {
      return deny('GitHub CLI use is forbidden');
    }

    if (executable === 'git') {
      const gitSubcommand = firstNonOptionArgument(args);
      if (gitSubcommand === 'push' || gitSubcommand === 'send-pack') {
        const pushIndex = args.indexOf(gitSubcommand);
        const pushArgs = args.slice(pushIndex + 1);
        const target = getGitPushTarget(pushArgs);
        if (target) {
          if (UPSTREAM_REMOTE_NAME.test(target) || UPSTREAM_GITHUB_URL.test(target)) {
            return deny('Push to upstream repository cloudflare/moltworker is forbidden');
          }
        }
      }
    }

    if (['curl', 'wget', 'http', 'https'].includes(executable)) {
      const commandStr = command.join(' ');
      if (commandStr.includes('api.github.com') && (UPSTREAM_GITHUB_URL.test(commandStr) || HTTP_WRITE.test(commandStr))) {
        if (UPSTREAM_GITHUB_URL.test(commandStr) || commandStr.includes('cloudflare/moltworker')) {
          return deny('Direct HTTP write to upstream cloudflare/moltworker is forbidden');
        }
      }
    }
  }

  return { allowed: true };
}

export function evaluateGitHubMcpCall(toolName, toolInput) {
  if (!isRecord(toolInput)) {
    return deny('malformed GitHub MCP input');
  }

  const cloudflareIssuePrTarget = CLOUDFLARE_ISSUE_PR_TOOLS.has(toolName)
    && sameIdentity(toolInput.owner, 'cloudflare');
  const cloudflareSearchTarget = (toolName === 'search_issues' || toolName === 'search_pull_requests')
    && (typeof toolInput.query === 'string' && (
      /(?:^|\s)(?:org|user):cloudflare(?:\s|$)/i.test(toolInput.query)
      || /(?:^|\s)repo:cloudflare\/\S*/i.test(toolInput.query)
    ));

  if (cloudflareIssuePrTarget || cloudflareSearchTarget) {
    return deny('Cloudflare Issue/PR access is forbidden');
  }

  if (READ_ONLY_GITHUB_TOOLS.has(toolName)) {
    return { allowed: true };
  }

  if (ALWAYS_DENIED_GITHUB_MUTATIONS.has(toolName)) {
    return deny('GitHub mutation is forbidden');
  }

  if (!sameIdentity(toolInput.owner, 'kyoneken') || !sameIdentity(toolInput.repo, 'moltworker')) {
    return deny('GitHub mutation is forbidden outside the canonical repository');
  }

  return { allowed: true };
}

export function evaluateAgyEvent(event) {
  if (!isRecord(event) || !isRecord(event.toolCall) || typeof event.toolCall.name !== 'string') {
    return deny('malformed AGY Hook event');
  }

  const toolName = event.toolCall.name;
  const toolArgs = event.toolCall.args || {};

  if (toolName === 'run_command') {
    return evaluateRunCommand(toolArgs.CommandLine);
  }

  if (toolName === 'call_mcp_tool') {
    if (toolArgs.ServerName === 'github' && typeof toolArgs.ToolName === 'string') {
      return evaluateGitHubMcpCall(toolArgs.ToolName, toolArgs.Arguments || {});
    }
    return { allowed: true };
  }

  if (toolName.startsWith('mcp_github_') || toolName.startsWith('mcp__github__')) {
    const shortName = toolName.replace(/^mcp_github_|^mcp__github__/, '');
    return evaluateGitHubMcpCall(shortName, toolArgs);
  }

  return { allowed: true };
}

export async function main() {
  try {
    process.stdin.setEncoding('utf8');
    let input = '';
    for await (const chunk of process.stdin) {
      input += chunk;
    }

    if (!input.trim()) {
      process.stdout.write(JSON.stringify({ decision: 'allow' }) + '\n');
      return;
    }

    const event = JSON.parse(input);
    const result = evaluateAgyEvent(event);

    if (!result.allowed) {
      process.stdout.write(JSON.stringify({
        decision: 'deny',
        reason: `Blocked by moltworker repository policy: ${result.reason}`,
      }) + '\n');
    } else {
      process.stdout.write(JSON.stringify({
        decision: 'allow',
      }) + '\n');
    }
  } catch (err) {
    process.stderr.write('Malformed AGY policy Hook input\n');
    process.exitCode = 2;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  void main();
}
