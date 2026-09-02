import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

import { evaluateAgyEvent } from '../../.agents/hooks/agy-policy-guard.mjs';

const hookPath = '.agents/hooks/agy-policy-guard.mjs';

const runHook = (input) => spawnSync(process.execPath, [hookPath], {
  cwd: process.cwd(),
  input,
  encoding: 'utf8',
});

const agyEventFor = (toolName, toolArgs) => ({
  toolCall: {
    name: toolName,
    args: toolArgs,
  },
  stepIdx: 1,
  conversationId: 'test-convo-id',
});

test('AGY hook permits allowed run_command calls', () => {
  for (const cmd of [
    'git status --short',
    'git diff --check',
    'npm test',
    'npm run typecheck',
    'git commit -m "feat: test"',
    'git push origin main',
    'git push origin feature-branch',
  ]) {
    const event = agyEventFor('run_command', { CommandLine: cmd, Cwd: process.cwd() });
    const result = evaluateAgyEvent(event);
    assert.equal(result.allowed, true, `Expected allowed for: ${cmd}`);
  }
});

test('AGY hook denies forbidden run_command targeting upstream or forbidden tools', () => {
  const deniedCommands = [
    'git push upstream main',
    'git push UpStReAm HEAD',
    'git push https://github.com/cloudflare/moltworker.git main',
    'git push git@github.com:cloudflare/moltworker.git HEAD',
    'git push ssh://git@github.com/cloudflare/moltworker.git',
    'gh issue create --title "test"',
    'gh pr create --repo cloudflare/moltworker',
    'curl -X POST https://api.github.com/repos/cloudflare/moltworker/issues',
    'curl -d "test" https://api.github.com/repos/cloudflare/moltworker/pulls',
  ];

  for (const cmd of deniedCommands) {
    const event = agyEventFor('run_command', { CommandLine: cmd, Cwd: process.cwd() });
    const result = evaluateAgyEvent(event);
    assert.equal(result.allowed, false, `Expected denied for: ${cmd}`);
    assert.ok(result.reason.length > 0);
  }
});

test('AGY hook permits allowed call_mcp_tool for github read operations', () => {
  const allowedCalls = [
    { ServerName: 'github', ToolName: 'get_file_contents', Arguments: { owner: 'cloudflare', repo: 'moltworker', path: 'README.md' } },
    { ServerName: 'github', ToolName: 'list_commits', Arguments: { owner: 'cloudflare', repo: 'moltworker' } },
    { ServerName: 'github', ToolName: 'issue_read', Arguments: { owner: 'kyoneken', repo: 'moltworker', issue_number: 1, method: 'get' } },
    { ServerName: 'github', ToolName: 'search_issues', Arguments: { query: 'repo:kyoneken/moltworker is:issue' } },
  ];

  for (const call of allowedCalls) {
    const event = agyEventFor('call_mcp_tool', call);
    const result = evaluateAgyEvent(event);
    assert.equal(result.allowed, true, `Expected allowed for tool: ${call.ToolName}`);
  }
});

test('AGY hook permits canonical kyoneken/moltworker MCP mutations', () => {
  const canonicalMutations = [
    { ServerName: 'github', ToolName: 'create_pull_request', Arguments: { owner: 'kyoneken', repo: 'moltworker', title: 'test', head: 'feat', base: 'main' } },
    { ServerName: 'github', ToolName: 'add_issue_comment', Arguments: { owner: 'kyoneken', repo: 'moltworker', issue_number: 1, body: 'test' } },
    { ServerName: 'github', ToolName: 'push_files', Arguments: { owner: 'kyoneken', repo: 'moltworker', branch: 'feat', files: [] } },
  ];

  for (const call of canonicalMutations) {
    const event = agyEventFor('call_mcp_tool', call);
    const result = evaluateAgyEvent(event);
    assert.equal(result.allowed, true, `Expected allowed for canonical mutation: ${call.ToolName}`);
  }
});

test('AGY hook denies MCP mutations targeting cloudflare/moltworker or non-canonical repositories', () => {
  const deniedCalls = [
    { ServerName: 'github', ToolName: 'issue_write', Arguments: { owner: 'cloudflare', repo: 'moltworker', method: 'create', title: 'test' } },
    { ServerName: 'github', ToolName: 'create_pull_request', Arguments: { owner: 'cloudflare', repo: 'moltworker', title: 'test' } },
    { ServerName: 'github', ToolName: 'add_issue_comment', Arguments: { owner: 'cloudflare', repo: 'moltworker', issue_number: 1, body: 'test' } },
    { ServerName: 'github', ToolName: 'push_files', Arguments: { owner: 'cloudflare', repo: 'moltworker', branch: 'main', files: [] } },
    { ServerName: 'github', ToolName: 'push_files', Arguments: { owner: 'other-user', repo: 'moltworker', branch: 'main', files: [] } },
    { ServerName: 'github', ToolName: 'create_repository', Arguments: { name: 'test' } },
    { ServerName: 'github', ToolName: 'search_issues', Arguments: { query: 'org:cloudflare is:open' } },
  ];

  for (const call of deniedCalls) {
    const event = agyEventFor('call_mcp_tool', call);
    const result = evaluateAgyEvent(event);
    assert.equal(result.allowed, false, `Expected denied for: ${call.ToolName}`);
  }
});

test('AGY CLI hook process stdout outputs correct decision JSON format', () => {
  // Allowed command -> decision: allow
  const allowedRes = runHook(JSON.stringify(agyEventFor('run_command', { CommandLine: 'npm test' })));
  assert.equal(allowedRes.status, 0);
  assert.deepEqual(JSON.parse(allowedRes.stdout), { decision: 'allow' });

  // Denied command -> decision: deny with reason
  const deniedRes = runHook(JSON.stringify(agyEventFor('run_command', { CommandLine: 'git push upstream main' })));
  assert.equal(deniedRes.status, 0);
  const parsed = JSON.parse(deniedRes.stdout);
  assert.equal(parsed.decision, 'deny');
  assert.match(parsed.reason, /Blocked by moltworker repository policy/);
});

test('AGY hook requires explicit human confirmation (force_ask) for merge_pull_request', () => {
  const event = agyEventFor('call_mcp_tool', {
    ServerName: 'github',
    ToolName: 'merge_pull_request',
    Arguments: { owner: 'kyoneken', repo: 'moltworker', pullNumber: 1 },
  });
  const result = evaluateAgyEvent(event);
  assert.equal(result.decision, 'force_ask');
  assert.match(result.reason, /human confirmation/i);

  const cliRes = runHook(JSON.stringify(event));
  assert.equal(cliRes.status, 0);
  const parsed = JSON.parse(cliRes.stdout);
  assert.equal(parsed.decision, 'force_ask');
});

test('AGY hooks configuration is valid and matches specification', () => {
  assert.ok(existsSync('.agents/hooks.json'), '.agents/hooks.json must exist');
  const config = JSON.parse(readFileSync('.agents/hooks.json', 'utf8'));

  assert.ok(config['upstream-guard'] || config['moltworker-guard']);
  const hookDef = config['upstream-guard'] || config['moltworker-guard'];
  assert.ok(Array.isArray(hookDef.PreToolUse));
  assert.equal(hookDef.PreToolUse.length, 1);
  assert.match(hookDef.PreToolUse[0].matcher, /run_command/);
  assert.match(hookDef.PreToolUse[0].matcher, /call_mcp_tool/);
});
