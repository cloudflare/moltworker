import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('skill triggers for preparing one Project Issue before implementation', async () => {
  const skill = await read('skills/prepare-issue-for-implementation/SKILL.md');
  assert.match(skill, /^---[\s\S]+name: prepare-issue-for-implementation[\s\S]+---/);
  assert.match(skill, /one parent Issue|exactly one Issue/i);
  assert.match(skill, /Project.*Priority.*order/is);
});

test('selection ranks configured Priority then Project order and excludes unsafe work', async () => {
  const selection = await read('skills/prepare-issue-for-implementation/references/selection.md');
  assert.match(selection, /priorityOrder/);
  assert.match(selection, /configured.*priorityOrder|priorityOrder.*configured/is);
  assert.match(selection, /same Priority.*Project order|Project order.*same Priority/is);
  assert.match(selection, /without Priority.*Project order|missing Priority.*Project order/is);
  for (const excluded of ['Ready', 'Closed', 'blocked', 'out of scope']) {
    assert.match(selection, new RegExp(excluded, 'i'));
  }
});

test('research precedes brainstorming and separates facts from inference', async () => {
  const skill = await read('skills/prepare-issue-for-implementation/SKILL.md');
  const research = await read('skills/prepare-issue-for-implementation/references/research.md');
  assert.ok(skill.indexOf('research') < skill.indexOf('superpowers:brainstorming'));
  for (const heading of ['Confirmed Facts', 'Inferences', 'Unknowns', 'Relevant Files', 'Related Work']) {
    assert.match(research, new RegExp(heading));
  }
  assert.match(research, /AGENTS\.md/);
  assert.match(research, /README/);
  assert.match(research, /tests?/i);
  assert.match(research, /related.*Issue.*PR/is);
});

test('freshly revalidates the default-branch SHA before planning and publication', async () => {
  const skill = await read('skills/prepare-issue-for-implementation/SKILL.md');
  const selection = await read('skills/prepare-issue-for-implementation/references/selection.md');
  const writingPlans = skill.indexOf('superpowers:writing-plans');
  const publication = skill.indexOf('8. **Publish.**');
  const freshSha = /fresh(?:ly)?[\s-]+(?:compare|revalidat|verify)[\s\S]{0,120}(?:default[\s-]+branch|SHA)/i;

  assert.ok(writingPlans > -1, 'writing-plans must remain an explicit gate');
  assert.ok(publication > -1, 'publication must remain an explicit gate');
  assert.match(skill.slice(0, writingPlans), freshSha);
  assert.match(skill, /Immediately before GitHub publication[\s\S]{0,180}compare/i);
  assert.match(`${skill}\n${selection}`, /drift|mismatch/i);
  assert.match(
    `${skill}\n${selection}`,
    /new(?:ly)? explicit(?:ly)? (?:approved|approval)[\s\S]{0,100}exact SHA|exact SHA[\s\S]{0,100}new(?:ly)? explicit(?:ly)? (?:approved|approval)/i,
  );
});

test('approval state enforces design, spec, plan, and proposal gates', async () => {
  const state = await read('skills/prepare-issue-for-implementation/references/approval-state.md');
  const phases = [
    'BRAINSTORM_DESIGN_APPROVED',
    'BRAINSTORM_SPEC_APPROVED',
    'PLAN_APPROVED',
    'SUBISSUES_APPROVED',
    'PUBLISHING',
    'VERIFIED',
    'READY',
  ];
  let previous = -1;
  for (const phase of phases) {
    const position = state.indexOf(phase);
    assert.ok(position > previous, `${phase} must occur in order`);
    previous = position;
  }
  assert.match(state, /SHA-256/);
  assert.match(state, /append-only/i);
  assert.match(state, /changed.*invalid|invalid.*changed/is);
});

test('conflicting checkpoints stop rather than merge approvals', async () => {
  const state = await read('skills/prepare-issue-for-implementation/references/approval-state.md');
  assert.match(state, /earliest.*GitHub.*creation time/is);
  assert.match(state, /conflict.*stop|stop.*conflict/is);
  assert.match(state, /serializ.*Project|Project.*serializ/is);
  assert.doesNotMatch(state, /conversation (body|text).*checkpoint/i);
});

test('checkpoint comments contain only the marker and allowed fields', async () => {
  const state = await read('skills/prepare-issue-for-implementation/references/approval-state.md');
  assert.match(state, /entire|whole.*comment/i);
  assert.match(state, /only.*marker.*allowed fields|allowed fields.*only/is);
  assert.match(state, /prose.*reject|reject.*prose|before or after.*marker/is);
  assert.match(state, /extra non-empty line|non-empty line.*reject/i);
});

test('checkpoint conflicts are scoped to refinement IDs and require a new run', async () => {
  const state = await read('skills/prepare-issue-for-implementation/references/approval-state.md');
  assert.match(state, /refinement-id/i);
  assert.match(state, /same refinement(?: ID)?.*(?:duplicate|conflict)|(?:duplicate|conflict).*same refinement(?: ID)?/is);
  assert.match(state, /different refinement(?: IDs?)?.*(?:separate|new run)|(?:separate|new run).*different refinement/is);
  assert.match(state, /latest.*(?:explicitly initiated|approved).*user|user.*(?:explicitly initiated|approved).*latest/is);
  assert.match(state, /concurrent.*(?:active runs?|stop)|active runs?.*concurrent.*stop/is);
});

test('resume selects the newest valid user-approved refinement run deterministically', async () => {
  const state = await read('skills/prepare-issue-for-implementation/references/approval-state.md');
  assert.match(state, /old(?:er)? invalidated run[\s\S]*newer valid\s+run|newer valid\s+run[\s\S]*old(?:er)? invalidated run/i);
  assert.match(state, /latest.*valid.*explicitly.*user-approved|explicitly.*user-approved.*latest.*valid/is);
  assert.match(state, /first\s+valid\s+design\s+approval\s+checkpoint[\s\S]*creation\s+time|creation\s+time[\s\S]*first\s+valid\s+design\s+approval\s+checkpoint/i);
  assert.match(state, /comment ID.*tie-breaker|tie-breaker.*comment ID/is);
  assert.match(state, /resume.*that refinement ID|that refinement ID.*resume/is);
  assert.doesNotMatch(state, /discover exactly one valid design checkpoint/i);
});

test('refinement ID is created from design approval and reused by later phases', async () => {
  const state = await read('skills/prepare-issue-for-implementation/references/approval-state.md');
  assert.match(state, /created exactly once.*BRAINSTORM_DESIGN_APPROVED/is);
  assert.match(
    state,
    /repository.*issue.*project.*researchRef.*designArtifact.*designSha256.*approvedAt/is,
  );
  for (const phase of ['BRAINSTORM_SPEC_APPROVED', 'PLAN_APPROVED', 'SUBISSUES_APPROVED']) {
    assert.match(
      state,
      new RegExp(`${phase}[\\s\\S]{0,180}Reuse the design-derived ID unchanged`, 'i'),
    );
  }
  assert.match(state, /later artifact hashes.*never mint a new ID/is);
  assert.match(state, /never derive or compare its ID.*later phase artifact or hash/is);
  assert.doesNotMatch(
    state,
    /derive[\\s\\S]{0,240}(?:specification|plan|proposal).*hash[\\s\\S]{0,120}(?:refinement ID|ID)/i,
  );
});

test('Sub-issue approval binds the proposal JSON hash to its plan anchor', async () => {
  const state = await read('skills/prepare-issue-for-implementation/references/approval-state.md');
  assert.match(state, /Artifact:\s+docs\/superpowers\/plans\/<plan>\.md#sub-issue-proposal/);
  assert.match(state, /SUBISSUES_APPROVED[\s\S]{0,800}canonical deterministic proposal JSON/i);
  assert.match(state, /spec(?:ification)?(?: and)? plan approvals?[\s\S]{0,160}normalized Markdown bytes/is);
  assert.match(state, /proposal JSON[\s\S]{0,160}UTF-8/i);
  assert.doesNotMatch(state, /\| `SUBISSUES_APPROVED` \|[^|]*docs\/superpowers\/specs\//i);
});

test('publication requires actionable child bodies and immutable markers', async () => {
  const publication = await read('skills/prepare-issue-for-implementation/references/github-publication.md');
  assert.match(publication, /issue-harness:parent=.*plan=.*task=/);
  for (const heading of ['Goal', 'Scope', 'Implementation', 'Acceptance Criteria', 'Tests', 'Dependencies']) {
    assert.match(publication, new RegExp(`## ${heading}`));
  }
  assert.match(publication, /Acceptance Criteria.*mandatory/is);
});

test('publication reconciles before create and Ready is last', async () => {
  const publication = await read('skills/prepare-issue-for-implementation/references/github-publication.md');
  assert.match(publication, /search.*marker.*read.*candidate/is);
  assert.match(publication, /reuse.*matching|matching.*reuse/is);
  assert.match(publication, /partial failure.*stop|stop.*partial failure/is);
  assert.match(publication, /tracking block.*before.*Ready/is);
  assert.match(publication, /Ready.*read back|read back.*Ready/is);
  assert.match(publication, /never.*delete|do not.*delete/is);
});

test('create attempts are written ahead to durable parent comments before issue_write', async () => {
  const publication = await read('skills/prepare-issue-for-implementation/references/github-publication.md');
  const workflow = publication.slice(publication.indexOf('Publication and retry use this exact order:'));
  const attempt = workflow.indexOf('CREATE_ATTEMPT');
  const create = workflow.indexOf('issue_write');
  assert.ok(attempt > -1, 'publication must define a CREATE_ATTEMPT comment');
  assert.ok(create > attempt, 'CREATE_ATTEMPT must be defined before issue_write');
  assert.match(publication, /parent Issue comment|comment.*parent Issue/is);
  assert.match(publication, /refinement-id.*task-id.*attempt-id.*timestamp/is);
  assert.match(publication, /append.*CREATE_ATTEMPT[\s\S]{0,220}re-read[\s\S]{0,220}issue_write/is);
  assert.match(publication, /CREATE_RESOLVED[\s\S]{0,180}Issue ID/is);
});

test('unresolved write-ahead attempts block scheduled creates until verified resolution', async () => {
  const publication = await read('skills/prepare-issue-for-implementation/references/github-publication.md');
  assert.match(publication, /marker search.*miss.*never.*(?:proves?|establishes?).*absen/is);
  assert.match(publication, /native-child.*enumeration.*miss.*never.*(?:proves?|establishes?).*absen/is);
  assert.match(publication, /Project-item.*enumeration.*miss.*never.*(?:proves?|establishes?).*absen/is);
  assert.match(publication, /read.*CREATE_ATTEMPT.*parent comments|parent comments.*CREATE_ATTEMPT/is);
  assert.match(publication, /unresolved CREATE_ATTEMPT.*never.*create|never.*create.*unresolved CREATE_ATTEMPT/is);
  assert.match(publication, /may reuse.*only after.*positively identifies.*Issue ID/is);
  assert.match(publication, /CREATE_CLEARED.*resolution evidence|resolution evidence.*CREATE_CLEARED/is);
  assert.match(publication, /no marker record.*no unresolved attempt|no unresolved attempt.*no marker record/is);
});

test('preparation hands stable plan and task ids to post-ready tracking', async () => {
  const publication = await read('skills/prepare-issue-for-implementation/references/github-publication.md');
  const tracking = await read('skills/issue-driven-development/references/tracking-format.md');
  for (const marker of ['issue-harness:start', 'Plan ID', 'Task ID', 'Parent Issue', 'Project']) {
    assert.match(publication, new RegExp(marker));
    assert.match(tracking, new RegExp(marker));
  }
});

test('publication uses the shared MCP operation contract without fallback', async () => {
  const skill = await read('skills/prepare-issue-for-implementation/SKILL.md');
  const publication = await read('skills/prepare-issue-for-implementation/references/github-publication.md');

  assert.match(skill, /\.\.\/issue-driven-development\/references\/mcp-tools\.md/);
  assert.match(publication, /\.\.\/\.\.\/issue-driven-development\/references\/mcp-tools\.md/);
  for (const operation of [
    'get_me',
    'search_issues',
    'issue_read',
    'issue_write',
    'sub_issue_write',
    'issue_read(method: get_sub_issues/get_parent)',
    'add_issue_comment',
    'projects_list(method: list_projects)',
    'projects_get(method: get_project)',
    'projects_get(method: get_project_fields)',
    'projects_get(method: get_project_items)',
    'projects_write(method: add_project_item)',
    'projects_write(method: update_project_item/update_project_items)',
  ]) {
    assert.match(publication, new RegExp(operation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(publication, /stop without fallback.*mandatory operation.*scope|mandatory operation.*scope.*stop without fallback/is);
});

test('required-reading paths resolve from their owning Skill files', async () => {
  await access(new URL('../../skills/issue-driven-development/references/mcp-tools.md', import.meta.url));
  await access(new URL('../../skills/prepare-issue-for-implementation/references/github-publication.md', import.meta.url));
});

test('repository policy permits only approval checkpoint comments before publication', async () => {
  const agents = await read('AGENTS.md');
  assert.match(agents, /only GitHub\s+write allowed.*approval gate.*append-only.*approval checkpoint comment/is);
  assert.match(agents, /does not publish.*Project\s+state.*create\/link a Sub-issue/is);
  assert.match(agents, /Publish only through\s+the GitHub MCP/is);
});

test('preparation and post-ready execution share canonical markers, proposal schema, and complete readback', async () => {
  const publication = await read('skills/prepare-issue-for-implementation/references/github-publication.md');
  const tracking = await read('skills/issue-driven-development/references/tracking-format.md');
  const state = await read('skills/prepare-issue-for-implementation/references/approval-state.md');
  const marker = 'issue-harness:parent=<parent-number>;plan=<plan-id>;task=<task-id>';
  assert.match(publication, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(tracking, /issue-harness:parent=101;plan=.*;role=parent/);
  assert.match(tracking, /issue-harness:parent=101;plan=.*;task=task-01/);
  assert.match(publication, /issue-harness:parent=<parent-number>;plan=<plan-id>;role=parent/);
  assert.match(publication, /installing a missing parent marker.*publication write/is);
  assert.match(publication, /append it once.*definitively absent.*read it back/is);
  assert.match(state, /\{"parent":\.\.\.,"plan":\.\.\.,"tasks":\[\.\.\.\]\}/);
  assert.match(state, /parent.*repository.*issue.*project/is);
  assert.match(state, /plan.*id.*artifact.*researchRef/is);
  assert.match(state, /task.*id.*order.*title.*goal.*scope.*implementation.*acceptanceCriteria.*tests.*dependencies/is);
  assert.match(state, /no additional\s+keys|exactly this root key order/is);
  assert.match(state, /unique\s+stable `id`.*positive integer `order`/is);
  assert.match(state, /non-empty ordered string\s+array `acceptanceCriteria`/is);
  assert.match(state, /refine-<16 lowercase hex>/);
  assert.match(state, /latest\s+run[\s\S]*resume that refinement ID|resume that refinement ID[\s\S]*latest\s+run/i);
  assert.match(state, /SHA-256 over the UTF-8, no-whitespace JSON tuple/i);
  assert.match(state, /first 16 lowercase hexadecimal characters/i);
  assert.match(
    state,
    /\{"repository":"\.\.\.","issue":17,"project":"\.\.\.","researchRef":"\.\.\.","designArtifact":"\.\.\.","designSha256":"\.\.\.","approvedAt":"[^" ]+"\}/,
  );
  assert.match(state, /no atomic Project lock|Do not invent one/is);
  assert.doesNotMatch(state, /Acquire the Project-scoped run lock/i);
  assert.match(publication, /single search\s+miss.*never.*absence/i);
  assert.match(publication, /enumeration.*miss.*never.*absence|miss.*never.*absence.*enumeration/is);
  assert.match(publication, /unknown\/timeout.*stop mutation|stop mutation.*unknown\/timeout/is);
  assert.match(publication, /field values/i);
  assert.match(publication, /projects_get\(method: get_project_items\)/);
  assert.match(publication, /issue_read\(method: get_sub_issues\/get_parent\)/);
});

test('evals cover gates, retry, missing Projects MCP, and no final extra approval', async () => {
  const evals = await read('skills/prepare-issue-for-implementation/evals/scenarios.md');
  const lines = evals
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'));
  assert.ok(lines.length >= 2, 'evaluation table must have a header and rows');

  const cells = (line) => line.split('|').slice(1, -1).map((cell) => cell.trim());
  const header = cells(lines[0]);
  assert.deepEqual(header, [
    'Case',
    'Setup',
    'Expected MCP/actions',
    'Expected local artifacts',
    'Forbidden behavior',
  ]);

  const dataRows = lines.slice(1).filter((line) => !/^\|\s*:?-{3,}/.test(line));
  assert.equal(dataRows.length, 16, 'evaluation table must contain exactly 16 data rows');
  const rows = dataRows.map((line) => {
    const row = cells(line);
    assert.equal(row.length, header.length, `row has ${row.length} columns: ${line}`);
    assert.match(row[0], /^\d+\./, `case must have a numeric identifier: ${row[0]}`);
    for (const [index, field] of row.entries()) {
      assert.ok(field.length > 0, `case ${row[0]} column ${header[index]} must not be empty`);
    }
    return { number: Number.parseInt(row[0], 10), text: row.join('\n') };
  });
  assert.deepEqual(rows.map((row) => row.number), Array.from({ length: 16 }, (_, index) => index + 1));
  for (const row of rows) {
    assert.match(row.text, /GitHub MCP|MCP/i, `case ${row.number} must state its MCP interaction`);
  }

  const rowText = (number) => rows.find((row) => row.number === number).text;
  assert.match(rowText(1), /explicit Priority/i);
  assert.match(rowText(1), /lowest configured explicit Priority/i);
  assert.match(rowText(1), /creating records|mutation/i);
  assert.match(rowText(2), /same Priority.*Project order|Project order.*same Priority/is);
  assert.match(rowText(3), /missing Priority.*Project order|Project order.*missing Priority/is);
  for (const [number, gate] of [
    [9, 'brainstorming approval'],
    [10, 'written-spec approval'],
    [11, 'plan approval'],
    [12, 'Sub-issue approval'],
  ]) {
    assert.match(rowText(number), new RegExp(gate, 'i'));
    assert.match(rowText(number), /stop/i, `case ${number} must stop at its approval gate`);
  }
  assert.match(rowText(14), /partial failure/i);
  assert.match(rowText(14), /resum/i);
  assert.match(rowText(15), /duplicate marker/i);
  assert.match(rowText(15), /missing Projects MCP/i);
  assert.match(rowText(15), /stop/i);
  assert.match(rowText(16), /without an additional approval/i);
  assert.match(rowText(16), /read(?: the)? Ready back|Ready back|read-back/i);
  assert.match(rowText(16), /Ready/i);

  const failureCaseNumbers = Array.from({ length: 12 }, (_, index) => index + 4);
  for (const number of failureCaseNumbers) {
    const failure = rowText(number);
    for (const forbidden of [
      /\bgh\b/i,
      /\bcurl\b/i,
      /direct (?:GitHub )?(?:REST|GraphQL)? ?APIs?/i,
      /blind retry/i,
      /deletion|delete/i,
      /premature Ready|Ready before/i,
    ]) {
      assert.match(failure, forbidden, `case ${number} must prohibit ${forbidden}`);
    }
  }
});
