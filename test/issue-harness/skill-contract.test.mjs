import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('skill triggers for plan execution and requires MCP preflight', async () => {
  const skill = await read('skills/issue-driven-development/SKILL.md');

  assert.match(skill, /^---[\s\S]+name: issue-driven-development[\s\S]+---/);
  assert.match(skill, /multi-task implementation plan/i);
  assert.match(skill, /MCP preflight/i);
  assert.match(skill, /before changing implementation files/i);
});

test('skill forbids non-MCP GitHub fallbacks', async () => {
  const skill = await read('skills/issue-driven-development/SKILL.md');
  const tools = await read('skills/issue-driven-development/references/mcp-tools.md');
  const combined = `${skill}\n${tools}`;

  for (const forbidden of ['`gh`', '`curl`', 'direct REST', 'direct GraphQL']) {
    assert.match(combined, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(combined, /stop without fallback/i);
});

test('references define stable tracking and guarded transitions', async () => {
  const lifecycle = await read('skills/issue-driven-development/references/lifecycle.md');
  const tracking = await read('skills/issue-driven-development/references/tracking-format.md');

  assert.match(lifecycle, /Todo.*In Progress.*Done/s);
  assert.match(lifecycle, /unmerged.*must not.*Done/is);
  assert.match(tracking, /issue-harness:start/);
  assert.match(tracking, /issue-harness:end/);
  assert.match(tracking, /Plan ID/);
  assert.match(tracking, /Task ID/);
});

test('tracking handoff keeps Project Status authoritative until Ready is read back', async () => {
  const tracking = await read('skills/issue-driven-development/references/tracking-format.md');

  assert.match(tracking, /complete block.*after topology.*before.*Ready/is);
  assert.match(tracking, /Project Status.*authoritative/is);
  assert.match(tracking, /without `Ready`.*does not authorize `start-task`/is);
  assert.match(tracking, /Ready.*read back.*last/is);
});

test('lifecycle defines one-to-one synchronization and a complete plan PR body', async () => {
  const lifecycle = await read('skills/issue-driven-development/references/lifecycle.md');

  assert.match(lifecycle, /exactly one parent Issue/i);
  assert.match(lifecycle, /exactly one\s+Sub-issue per task/i);
  assert.match(lifecycle, /reuse.*repair|repair.*reuse/is);
  assert.match(lifecycle, /one PR per Plan/i);
  assert.match(lifecycle, /Plan ID/i);
  assert.match(lifecycle, /plan path/i);
  assert.match(lifecycle, /Closes #<parent>/);
  assert.match(lifecycle, /Closes #<sub-issue>.*every task|every task.*Closes #<sub-issue>/is);
  assert.match(lifecycle, /verification results/i);
  assert.match(lifecycle, /AI-use disclosure/i);
  assert.match(lifecycle, /Plan ID.*branch marker|branch marker.*Plan ID/is);
  assert.match(lifecycle, /`search_issues`.*`pull_request_read`/s);
});

test('migration preserves the verified Workers AI records without lifecycle rewrites', async () => {
  const lifecycle = await read('skills/issue-driven-development/references/lifecycle.md');

  assert.match(lifecycle, /docs\/superpowers\/plans\/2026-08-15-cloudflare-workers-ai-proxy\.md/);
  assert.match(lifecycle, /2026-08-15-cloudflare-workers-ai-proxy/);
  assert.match(lifecycle, /Issue #1\s+as the\s+parent/i);
  assert.match(lifecycle, /Issues #2.*#8.*task-01.*task-07/is);
  assert.match(lifecycle, /PR #9/);
  assert.match(lifecycle, /not.*recreate.*reopen.*re-close/is);
});

test('MCP preflight names concrete repository and Project field calls', async () => {
  const tools = await read('skills/issue-driven-development/references/mcp-tools.md');

  assert.match(tools, /`search_issues`/);
  assert.match(tools, /`issue_read`/);
  assert.match(tools, /projects_get\(method: get_project_fields\)/);
});
