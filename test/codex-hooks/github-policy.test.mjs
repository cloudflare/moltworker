import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

import {
  CLOUDFLARE_ISSUE_PR_TOOLS,
  evaluateEvent,
  findCommands,
  READ_ONLY_GITHUB_TOOLS,
  tokenizeShell,
} from '../../.codex/hooks/github-policy.mjs';

const eventFor = (toolName, toolInput) => ({
  hook_event_name: 'PreToolUse',
  tool_name: toolName,
  tool_input: toolInput,
});

const hookPath = '.codex/hooks/github-policy.mjs';
const malformedHookInputMessage = 'Malformed GitHub policy Hook input\n';

const runHook = (input) => spawnSync(process.execPath, [hookPath], {
  cwd: process.cwd(),
  input,
  encoding: 'utf8',
});

test('CLI adapter permits allowed Bash calls without output', () => {
  const result = runHook(JSON.stringify(eventFor('Bash', { command: 'git status --short' })));

  assert.equal(result.status, 0);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, '');
});

test('CLI adapter permits allowed Bash calls after leading blank lines', () => {
  const result = runHook(JSON.stringify(eventFor('Bash', { command: '\n\n\ngit status --short' })));

  assert.equal(result.status, 0);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, '');
});

test('CLI adapter denies hidden GitHub CLI calls after blank lines', () => {
  const result = runHook(JSON.stringify(eventFor('Bash', { command: '\n\n\nprintf ok\n\n\ngh api repos/kyoneken/moltworker' })));

  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
  assert.deepEqual(JSON.parse(result.stdout), {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: 'Blocked by moltworker repository GitHub policy: GitHub CLI use is forbidden',
    },
  });
});

test('CLI adapter emits a PreToolUse denial without exposing the Bash command', () => {
  const result = runHook(JSON.stringify(eventFor('Bash', {
    command: 'curl -H "Authorization: Bearer test-secret" https://api.github.com/graphql',
  })));

  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
  assert.deepEqual(JSON.parse(result.stdout), {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: 'Blocked by moltworker repository GitHub policy: direct GitHub API access is forbidden',
    },
  });
  assert.doesNotMatch(result.stdout, /test-secret/);
});

test('CLI adapter permits canonical GitHub MCP mutations without output', () => {
  const result = runHook(JSON.stringify(eventFor('mcp__github__push_files', {
    owner: 'kyoneken',
    repo: 'moltworker',
    branch: 'feature',
    files: [],
  })));

  assert.equal(result.status, 0);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, '');
});

test('CLI adapter emits a PreToolUse denial for Cloudflare Issue reads', () => {
  const result = runHook(JSON.stringify(eventFor('mcp__github__issue_read', {
    owner: 'cloudflare',
    repo: 'moltworker',
    issue_number: 1,
    method: 'get',
  })));

  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
  assert.deepEqual(JSON.parse(result.stdout), {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: 'Blocked by moltworker repository GitHub policy: Cloudflare Issue/PR access is forbidden',
    },
  });
});

test('CLI adapter reports invalid JSON with one fixed secret-safe category', () => {
  const result = runHook('{"tool_input":{"command":"test-secret"}');

  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, malformedHookInputMessage);
  assert.doesNotMatch(result.stderr, /test-secret/);
});

test('CLI adapter reports malformed matched Bash input with one fixed secret-safe category', () => {
  const result = runHook(JSON.stringify(eventFor('Bash', {})));

  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, malformedHookInputMessage);
});

test('CLI adapter reports GitHub mutations without an owner with one fixed secret-safe category', () => {
  const result = runHook(JSON.stringify(eventFor('mcp__github__future_write_tool', {
    repo: 'moltworker',
    body: 'test-secret',
  })));

  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, malformedHookInputMessage);
  assert.doesNotMatch(result.stderr, /test-secret/);
});

test('project Hook configuration invokes the checked-in policy script once', () => {
  const config = JSON.parse(readFileSync('.codex/hooks.json', 'utf8'));
  const groups = config.hooks.PreToolUse;
  const topLevel = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();

  assert.equal(groups.length, 1);
  assert.equal(groups[0].matcher, '^Bash$|^mcp__github__.*');
  assert.equal(groups[0].hooks.length, 1);
  assert.deepEqual(groups[0].hooks[0], {
    type: 'command',
    command: '/usr/bin/env node "$(git rev-parse --show-toplevel)/.codex/hooks/github-policy.mjs"',
    timeout: 10,
    statusMessage: 'Checking repository GitHub policy',
  });
  assert.equal(
    groups[0].hooks[0].command.replace('$(git rev-parse --show-toplevel)', topLevel),
    `/usr/bin/env node "${topLevel}/.codex/hooks/github-policy.mjs"`,
  );
  assert.equal(typeof groups[0].hooks[0].timeout, 'number');
  assert.ok(groups[0].hooks[0].timeout > 0 && groups[0].hooks[0].timeout <= 10);
  assert.equal(existsSync('.codex/config.toml'), false);
});

test('documents project Hook trust, policy scope, and fallback authority', () => {
  const agents = readFileSync('AGENTS.md', 'utf8');
  const heading = '### Project Codex Hook';
  const sectionStart = agents.indexOf(heading);
  const sectionEnd = agents.indexOf('\n## ', sectionStart + heading.length);

  assert.notEqual(sectionStart, -1, 'Project Codex Hook heading must exist');
  assert.notEqual(sectionEnd, -1, 'Project Codex Hook section must have a boundary');

  const section = agents.slice(sectionStart, sectionEnd).replace(/\s+/g, ' ').trim();

  assert.match(section, /project-local Hook[^.]*\.codex\/hooks\.json[^.]*review[^.]*trust[^.]*\/hooks/i);
  assert.match(section, /changed definition[^.]*skipped[^.]*re-reviewed[^.]*re-trusted/i);
  assert.match(section, /Hook blocks[^.]*forbidden Bash GitHub paths[^.]*Cloudflare Issue\/PR lookups[^.]*non-canonical GitHub MCP mutations/i);
  assert.match(section, /(?:Hook|It) (?:deliberately )?permits[^.]*Cloudflare code\/repository research/i);
  assert.match(section, /AGENTS\.md remains authoritative if the Hook is disabled, untrusted, unavailable, or unable to parse/i);
});

const deniedBash = [
  'gh issue list',
  'GH_HOST=github.com gh pr view 33',
  'echo ok && /usr/local/bin/gh api repos/kyoneken/moltworker',
  'git push origin HEAD',
  'env GIT_TRACE=1 git send-pack origin HEAD',
  'curl -H "Authorization: Bearer test-secret" https://api.github.com/repos/kyoneken/moltworker',
  'wget -qO- https://api.github.com/graphql',
  'http POST https://api.github.com/graphql query=test-secret',
];

test('denies forbidden Bash invocations with secret-safe category reasons', () => {
  for (const command of deniedBash) {
    const result = evaluateEvent(eventFor('Bash', { command }));

    assert.equal(result.allowed, false, command);
    assert.match(result.reason, /GitHub CLI|Git push|direct GitHub API/);
    assert.doesNotMatch(result.reason, /test-secret/);
    assert.doesNotMatch(result.reason, new RegExp(command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

const allowedBash = [
  'git status --short',
  'git diff --check',
  'git commit -m "docs: mention gh and git push"',
  'rg -n "gh|git push" AGENTS.md',
  'curl https://developers.openai.com/codex/hooks',
  'npm test',
];

test('allows ordinary Bash commands and non-GitHub network access', () => {
  for (const command of allowedBash) {
    assert.deepEqual(evaluateEvent(eventFor('Bash', { command })), { allowed: true }, command);
  }
});

test('ignores leading and repeated blank lines without hiding forbidden commands', () => {
  assert.deepEqual(evaluateEvent(eventFor('Bash', { command: '\n\n\ngit status --short' })), { allowed: true });
  assert.deepEqual(evaluateEvent(eventFor('Bash', { command: '\n\n\necho ok\n\n\ngh api x' })), {
    allowed: false,
    reason: 'GitHub CLI use is forbidden',
  });
});

test('does not classify ordinary GitHub web links or non-GitHub API hosts as GitHub APIs', () => {
  for (const command of [
    'curl https://github.com/cloudflare/moltworker/issues/1',
    'curl https://github.com/graphqlity',
    'curl https://api.github.com.evil.example/graphql',
    'curl https://example.test/api.github.com/graphql',
  ]) {
    assert.deepEqual(evaluateEvent(eventFor('Bash', { command })), { allowed: true }, command);
  }
});

test('fails closed on malformed Bash input without exposing submitted data', () => {
  const result = evaluateEvent(eventFor('Bash', { command: 'echo "unterminated test-secret' }));

  assert.deepEqual(result, { allowed: false, reason: 'malformed Bash input' });
  assert.doesNotMatch(result.reason, /test-secret|unterminated/);
});

test('evaluates commands passed through env -S', () => {
  assert.deepEqual(evaluateEvent(eventFor('Bash', { command: "env -S 'gh api x'" })), {
    allowed: false,
    reason: 'GitHub CLI use is forbidden',
  });
  assert.deepEqual(evaluateEvent(eventFor('Bash', { command: 'env -S' })), {
    allowed: false,
    reason: 'malformed Bash input',
  });
});

test('evaluates equivalent env split-string spellings and rejects empty wrappers', () => {
  for (const command of ["env --split-string=gh api x", "env -S '--ignore-environment gh api x'"]) {
    const result = evaluateEvent(eventFor('Bash', { command }));
    assert.equal(result.allowed, false, command);
    assert.match(result.reason, /GitHub CLI/);
  }
  for (const command of ['env', 'command', 'env --']) {
    assert.deepEqual(evaluateEvent(eventFor('Bash', { command })), {
      allowed: false,
      reason: 'malformed Bash input',
    }, command);
  }
});

test('does not interpret split-string-looking arguments after an env command starts', () => {
  for (const command of ["env echo --split-string=gh", "env -S 'echo --split-string=gh'"]) {
    assert.deepEqual(evaluateEvent(eventFor('Bash', { command })), { allowed: true }, command);
  }
});

test('removes backslash-newline continuations before finding commands', () => {
  assert.deepEqual(evaluateEvent(eventFor('Bash', { command: '\\\ngh api x' })).allowed, false);
  assert.deepEqual(tokenizeShell('echo \\\ngh'), [
    { kind: 'word', value: 'echo' },
    { kind: 'word', value: 'gh' },
  ]);
});

test('denies malformed command structure without exposing the command', () => {
  for (const command of ['echo ok &&', '(echo ok', 'echo && && true', 'echo ok )', '(echo ok) gh', 'echo ok ;; true']) {
    const result = evaluateEvent(eventFor('Bash', { command }));
    assert.deepEqual(result, { allowed: false, reason: 'malformed Bash input' }, command);
  }
});

test('tokenizes shell words and supported operators without expanding input', () => {
  assert.deepEqual(tokenizeShell(`A=1 echo "a b" && printf '%s' a\\ b | cat; (gh api x)`), [
    { kind: 'word', value: 'A=1' },
    { kind: 'word', value: 'echo' },
    { kind: 'word', value: 'a b' },
    { kind: 'operator', value: '&&' },
    { kind: 'word', value: 'printf' },
    { kind: 'word', value: '%s' },
    { kind: 'word', value: 'a b' },
    { kind: 'operator', value: '|' },
    { kind: 'word', value: 'cat' },
    { kind: 'operator', value: ';' },
    { kind: 'operator', value: '(' },
    { kind: 'word', value: 'gh' },
    { kind: 'word', value: 'api' },
    { kind: 'word', value: 'x' },
    { kind: 'operator', value: ')' },
  ]);
});

test('finds commands after separators and removes assignments and wrappers', () => {
  assert.deepEqual(
    findCommands(tokenizeShell('A=1 env -- FOO=2 command -- gh api x && /bin/git push origin main')),
    [
      ['gh', 'api', 'x'],
      ['/bin/git', 'push', 'origin', 'main'],
    ],
  );
});

const deniedMcp = [
  ['mcp__github__issue_read', { owner: 'cloudflare', repo: 'moltworker', issue_number: 1, method: 'get' }],
  ['mcp__github__pull_request_read', { owner: 'CloudFlare', repo: 'workers-sdk', pullNumber: 2, method: 'get' }],
  ['mcp__github__list_issues', { owner: 'cloudflare', repo: 'moltworker' }],
  ['mcp__github__search_issues', { query: 'org:cloudflare is:issue state:open' }],
  ['mcp__github__search_pull_requests', { query: 'repo:cloudflare/moltworker is:pr' }],
  ['mcp__github__issue_write', { owner: 'cloudflare', repo: 'moltworker', method: 'update', issue_number: 1 }],
  ['mcp__github__push_files', { owner: 'someone-else', repo: 'moltworker', branch: 'main', files: [] }],
  ['mcp__github__create_repository', { name: 'unexpected' }],
  ['mcp__github__future_write_tool', { owner: 'kyoneken', repo: 'other' }],
];

const allowedMcp = [
  ['mcp__github__get_file_contents', { owner: 'cloudflare', repo: 'moltworker', path: 'README.md' }],
  ['mcp__github__search_code', { query: 'org:cloudflare DurableObject' }],
  ['mcp__github__list_commits', { owner: 'cloudflare', repo: 'moltworker' }],
  ['mcp__github__list_branches', { owner: 'cloudflare', repo: 'moltworker' }],
  ['mcp__github__issue_read', { owner: 'kyoneken', repo: 'moltworker', issue_number: 1, method: 'get' }],
  ['mcp__github__search_issues', { query: 'repo:kyoneken/moltworker is:issue' }],
  ['mcp__github__push_files', { owner: 'kyoneken', repo: 'moltworker', branch: 'feature', files: [] }],
];

test('denies Cloudflare Issue/PR operations and out-of-scope GitHub mutations', () => {
  for (const [toolName, toolInput] of deniedMcp) {
    const result = evaluateEvent(eventFor(toolName, toolInput));

    assert.equal(result.allowed, false, toolName);
    assert.match(result.reason, /Cloudflare Issue\/PR|GitHub mutation/);
    assert.doesNotMatch(result.reason, /unexpected|someone-else|other/i);
  }
});

test('denies Cloudflare organization selectors in Issue and PR searches', () => {
  for (const toolName of ['mcp__github__search_issues', 'mcp__github__search_pull_requests']) {
    for (const query of ['user:cloudflare is:open', 'ORG:CloudFlare is:issue', 'repo:CloudFlare/moltworker is:pr']) {
      const result = evaluateEvent(eventFor(toolName, { query }));
      assert.equal(result.allowed, false, `${toolName}: ${query}`);
    }
  }
});

test('allows Cloudflare code/repository reads and canonical repository operations', () => {
  for (const [toolName, toolInput] of allowedMcp) {
    assert.deepEqual(evaluateEvent(eventFor(toolName, toolInput)), { allowed: true }, toolName);
  }
});

test('requires an exact canonical owner and repository for GitHub mutations', () => {
  for (const toolInput of [{ owner: 'kyoneken' }, { repo: 'moltworker' }, {}, { owner: 'KYONEKEN', repo: 'MOLtWorker' }]) {
    const result = evaluateEvent(eventFor('mcp__github__future_write_tool', {
      ...toolInput,
      body: 'Discuss cloudflare without changing the target',
    }));
    assert.equal(result.allowed, toolInput.owner === 'KYONEKEN' && toolInput.repo === 'MOLtWorker');
    assert.doesNotMatch(result.reason ?? '', /cloudflare|Discuss/i);
  }
});

test('exports frozen GitHub tool classification sets', () => {
  assert.equal(Object.isFrozen(READ_ONLY_GITHUB_TOOLS), true);
  assert.equal(Object.isFrozen(CLOUDFLARE_ISSUE_PR_TOOLS), true);
  assert.equal(typeof READ_ONLY_GITHUB_TOOLS.add, 'undefined');
  assert.equal(typeof READ_ONLY_GITHUB_TOOLS.delete, 'undefined');
  assert.equal(READ_ONLY_GITHUB_TOOLS.has('get_file_contents'), true);
  assert.equal([...READ_ONLY_GITHUB_TOOLS].includes('get_file_contents'), true);
});

test('allows the complete current set of GitHub read tools regardless of target', () => {
  for (const toolName of [
    'get_release_by_tag',
    'get_team_members',
    'get_teams',
    'list_issue_fields',
    'list_repository_collaborators',
    'search_commits',
    'search_users',
  ]) {
    assert.equal(
      evaluateEvent(eventFor(`mcp__github__${toolName}`, { owner: 'someone-else', repo: 'somewhere-else' })).allowed,
      true,
      toolName,
    );
  }
});
