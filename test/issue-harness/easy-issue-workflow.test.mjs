import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('easy-issue-workflow skill defines YAML frontmatter and triggering conditions', async () => {
  const content = await read('skills/easy-issue-workflow/SKILL.md');

  assert.match(content, /^---[\s\S]+name:\s*easy-issue-workflow[\s\S]+---/);
  assert.match(content, /description:\s*Use when/i);
  assert.match(content, /easy.*single-issue|single-issue.*easy/is);
});

test('easy-issue-workflow defines end-to-end 7-step lifecycle', async () => {
  const content = await read('skills/easy-issue-workflow/SKILL.md');

  assert.match(content, /Step 1: Discover & Select/i);
  assert.match(content, /Step 2: Start & Branch/i);
  assert.match(content, /Step 3: Investigate & Post Design/i);
  assert.match(content, /Step 4: Subtask Decomposition & Checklist Tracking/i);
  assert.match(content, /Step 5: TDD Implementation & Verification/i);
  assert.match(content, /Step 6: Pull Request & Issue Link/i);
  assert.match(content, /Step 7: Review, Squash Merge & Finalize/i);
});

test('easy-issue-workflow requires continuous visibility on GitHub Issues', async () => {
  const content = await read('skills/easy-issue-workflow/SKILL.md');

  assert.match(content, /Post the design directly to the GitHub Issue/i);
  assert.match(content, /add_issue_comment/);
  assert.match(content, /Subtask Decomposition & Checklist/i);
  assert.match(content, /Task Breakdown & Progress/i);
  assert.match(content, /Pull Request Created/i);
  assert.match(content, /Verification Evidence/i);
});

test('easy-issue-workflow enforces MCP-only and Fork Boundary rules', async () => {
  const content = await read('skills/easy-issue-workflow/SKILL.md');

  assert.match(content, /GitHub MCP Only/i);
  assert.match(content, /Fork Boundary/i);
  assert.match(content, /kyoneken\/moltworker/);
  assert.match(content, /cloudflare\/moltworker/);
  for (const forbidden of ['`gh`', '`curl`', 'direct APIs']) {
    assert.match(content, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
