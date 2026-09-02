import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('repository has one configured issue harness', async () => {
  const config = JSON.parse(await read('issue-harness.config.json'));
  assert.equal(config.repository, 'kyoneken/moltworker');
  assert.equal(config.project.owner, 'kyoneken');
  assert.equal(config.project.ownerType, 'user');
  assert.equal(typeof config.project.number, 'number');
});

test('harness config is repository-scoped and secret-free', async () => {
  const raw = await read('issue-harness.config.json');
  const config = JSON.parse(raw);

  assert.deepEqual(config, {
    version: 2,
    repository: 'kyoneken/moltworker',
    project: { owner: 'kyoneken', ownerType: 'user', number: 0, url: '' },
    status: { todo: 'Todo', inProgress: 'In Progress', done: 'Done' },
    refinement: {
      priorityField: 'Priority',
      priorityOrder: ['P0', 'P1', 'P2', 'P3'],
      statusField: 'Status',
      unstartedValues: ['Todo', 'Backlog'],
      readyValue: 'Ready',
      excludedValues: ['Not planned'],
      excludedLabels: ['no-refinement', 'wontfix'],
    },
  });
  assert.doesNotMatch(raw, /token|authorization|node.?id/i);
});

test('issue forms expose stable plan and task identities', async () => {
  const plan = await read('.github/ISSUE_TEMPLATE/plan.yml');
  const task = await read('.github/ISSUE_TEMPLATE/task.yml');

  assert.match(plan, /name: Plan/);
  assert.match(plan, /Plan ID/);
  assert.match(plan, /Plan path/);
  assert.match(plan, /Acceptance criteria/);
  assert.match(task, /name: Task/);
  assert.match(task, /Plan ID/);
  assert.match(task, /Task ID/);
  assert.match(task, /Parent Issue/);
  assert.match(task, /Validation/);
});

test('pull request template requires plan, issue, verification, and AI disclosure', async () => {
  const template = await read('.github/pull_request_template.md');

  for (const heading of ['Plan', 'Tracked Issues', 'Verification', 'AI Usage']) {
    assert.match(template, new RegExp(`## ${heading}`));
  }
  assert.match(template, /Closes #<parent>/);
  assert.match(template, /Closes #<sub-issue>/);
});

test('post-ready skill exposes MCP-only tracking procedures', async () => {
  const skill = await read('skills/issue-driven-development/SKILL.md');
  assert.match(skill, /sync-plan/);
  assert.match(skill, /start-task/);
  assert.match(skill, /GitHub MCP/i);
  assert.match(skill, /stop without fallback/i);
});

test('repository instructions route refinement and implementation separately', async () => {
  const agents = await read('AGENTS.md');
  const contributing = await read('CONTRIBUTING.md');
  assert.match(agents, /prepare-issue-for-implementation/);
  assert.match(agents, /issue-driven-development/);
  assert.match(agents, /brainstorming.*writing-plans/is);
  assert.match(agents, /GitHub MCP/i);
  assert.match(contributing, /Ready/i);
  assert.match(contributing, /Sub-issue/i);
});

test('preparation instructions require MCP for every GitHub operation', async () => {
  const agents = await read('AGENTS.md');
  for (const operation of ['preflight', 'selection', 'read', 'write', 'verification']) {
    assert.match(agents, new RegExp(operation, 'i'), `AGENTS.md must cover ${operation}`);
  }
  for (const forbidden of ['gh', 'curl', 'REST', 'GraphQL', 'fallback']) {
    assert.match(agents, new RegExp(`\\b${forbidden}\\b`, 'i'), `AGENTS.md must prohibit ${forbidden}`);
  }
});
