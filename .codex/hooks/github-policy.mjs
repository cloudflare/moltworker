import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const freezeSet = (values) => {
  const contents = new Set(values);
  return Object.freeze({
    has: (value) => contents.has(value),
    get size() {
      return contents.size;
    },
    [Symbol.iterator]: () => contents[Symbol.iterator](),
  });
};

// Keep this list explicit: an unfamiliar GitHub MCP tool is a mutation by default.
export const READ_ONLY_GITHUB_TOOLS = freezeSet([
  'get_branch',
  'get_commit',
  'get_file_contents',
  'get_issue',
  'get_issue_comments',
  'get_label',
  'get_latest_release',
  'get_me',
  'get_pull_request',
  'get_pull_request_comments',
  'get_pull_request_diff',
  'get_pull_request_files',
  'get_pull_request_reviews',
  'get_pull_request_status',
  'get_repository',
  'get_release',
  'get_release_by_tag',
  'get_tag',
  'get_team',
  'get_team_members',
  'get_teams',
  'get_user',
  'issue_read',
  'list_issue_types',
  'list_branches',
  'list_commits',
  'list_issue_comments',
  'list_issue_fields',
  'list_issues',
  'list_labels',
  'list_pull_request_comments',
  'list_pull_request_files',
  'list_pull_request_reviews',
  'list_pull_requests',
  'list_releases',
  'list_repository_collaborators',
  'list_tags',
  'list_teams',
  'pull_request_read',
  'projects_get',
  'projects_list',
  'search_code',
  'search_commits',
  'search_issues',
  'search_pull_requests',
  'search_repositories',
  'search_users',
]);

export const CLOUDFLARE_ISSUE_PR_TOOLS = freezeSet([
  'add_issue_comment',
  'add_sub_issue',
  'create_issue',
  'create_pull_request',
  'get_issue',
  'get_issue_comments',
  'get_pull_request',
  'get_pull_request_comments',
  'get_pull_request_diff',
  'get_pull_request_files',
  'get_pull_request_reviews',
  'get_pull_request_status',
  'issue_read',
  'issue_write',
  'list_issue_comments',
  'list_issues',
  'list_pull_request_comments',
  'list_pull_request_files',
  'list_pull_request_reviews',
  'list_pull_requests',
  'pull_request_read',
  'pull_request_write',
  'search_issues',
  'search_pull_requests',
  'sub_issue_write',
  'update_issue',
  'update_pull_request',
]);

export const ALWAYS_DENIED_GITHUB_MUTATIONS = freezeSet([
  'create_repository',
  'fork_repository',
]);

const OPERATORS = new Set([';', '&&', '||', '|', '(', ')', '\n']);
const ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*=/;

class MalformedShellInput extends Error {
  constructor() {
    super('malformed Bash input');
  }
}

/**
 * Tokenize only the shell syntax needed by this policy. This deliberately does
 * not perform expansion, command substitution, globbing, or execution.
 */
export function tokenizeShell(command) {
  if (typeof command !== 'string') {
    throw new MalformedShellInput();
  }

  const tokens = [];
  let word = '';
  let hasWordContent = false;
  let quote = null;

  const flushWord = () => {
    if (hasWordContent) {
      tokens.push({ kind: 'word', value: word });
      word = '';
      hasWordContent = false;
    }
  };

  for (let index = 0; index < command.length; index += 1) {
    const character = command[index];

    if (quote === "'") {
      if (character === "'") {
        quote = null;
      } else {
        word += character;
      }
      hasWordContent = true;
      continue;
    }

    if (quote === '"') {
      if (character === '"') {
        quote = null;
        hasWordContent = true;
      } else if (character === '\\') {
        if (index + 1 >= command.length) {
          throw new MalformedShellInput();
        }
        index += 1;
        if (command[index] !== '\n') {
          word += command[index];
        }
        hasWordContent = true;
      } else {
        word += character;
        hasWordContent = true;
      }
      continue;
    }

    if (character === "'" || character === '"') {
      quote = character;
      hasWordContent = true;
      continue;
    }

    if (character === '\\') {
      if (index + 1 >= command.length) {
        throw new MalformedShellInput();
      }
      index += 1;
      if (command[index] !== '\n') {
        word += command[index];
      }
      hasWordContent = true;
      continue;
    }

    if (/\s/.test(character)) {
      flushWord();
      if (character === '\n') {
        tokens.push({ kind: 'operator', value: '\n' });
      }
      continue;
    }

    const twoCharacterOperator = command.slice(index, index + 2);
    if (twoCharacterOperator === '&&' || twoCharacterOperator === '||') {
      flushWord();
      tokens.push({ kind: 'operator', value: twoCharacterOperator });
      index += 1;
      continue;
    }

    if (OPERATORS.has(character)) {
      flushWord();
      tokens.push({ kind: 'operator', value: character });
      continue;
    }

    word += character;
    hasWordContent = true;
  }

  if (quote !== null) {
    throw new MalformedShellInput();
  }
  flushWord();
  return tokens;
}

const basename = (executable) => executable.slice(executable.lastIndexOf('/') + 1);

const skipEnvPrefix = (words, start) => {
  let index = start;
  while (index < words.length) {
    const word = words[index];
    if (word === '--') {
      return index + 1;
    }
    if (ASSIGNMENT.test(word)) {
      index += 1;
      continue;
    }
    if (word === '-u' || word === '--unset' || word === '-C' || word === '--chdir') {
      index += 2;
      continue;
    }
    if (word.startsWith('--unset=') || word.startsWith('--chdir=')) {
      index += 1;
      continue;
    }
    if (word.startsWith('-')) {
      index += 1;
      continue;
    }
    return index;
  }
  return index;
};

const findEnvSplitOption = (words, start) => {
  let index = start;
  while (index < words.length) {
    const word = words[index];
    if (ASSIGNMENT.test(word)) {
      index += 1;
      continue;
    }
    if (word === '--') {
      return -1;
    }
    if (word === '-S' || word === '--split-string' || word.startsWith('--split-string=')) {
      return index;
    }
    if (word === '-u' || word === '--unset' || word === '-C' || word === '--chdir') {
      index += 2;
      continue;
    }
    if (word.startsWith('--unset=') || word.startsWith('--chdir=')) {
      index += 1;
      continue;
    }
    if (word.startsWith('-')) {
      index += 1;
      continue;
    }
    return -1;
  }
  return -1;
};

const unwrapCommand = (words) => {
  let index = 0;
  while (index < words.length && ASSIGNMENT.test(words[index])) {
    index += 1;
  }

  while (index < words.length) {
    if (ASSIGNMENT.test(words[index])) {
      index += 1;
      continue;
    }
    const executable = basename(words[index]);
    if (executable === 'env') {
      const splitOptionIndex = findEnvSplitOption(words, index + 1);
      if (splitOptionIndex >= 0) {
        const splitOption = words[splitOptionIndex];
        const splitTextParts = splitOption.startsWith('--split-string=')
          ? [splitOption.slice('--split-string='.length), ...words.slice(splitOptionIndex + 1)]
          : words.slice(splitOptionIndex + 1);
        const splitText = splitTextParts.join(' ');
        if (splitText.length === 0) {
          throw new MalformedShellInput();
        }
        const splitTokens = tokenizeShell(splitText);
        if (splitTokens.length === 0) {
          throw new MalformedShellInput();
        }
        const splitCommands = findCommands([
          { kind: 'word', value: 'env' },
          ...splitTokens,
        ]);
        if (splitCommands.length === 0) {
          throw new MalformedShellInput();
        }
        return splitCommands;
      }
      index = skipEnvPrefix(words, index + 1);
      continue;
    }
    if (executable === 'command') {
      index += 1;
      while (index < words.length && words[index] !== '--' && words[index].startsWith('-')) {
        index += 1;
      }
      if (words[index] === '--') {
        index += 1;
      }
      continue;
    }
    break;
  }

  return [words.slice(index)];
};

/** Return one command's words for each shell command position. */
export function findCommands(tokens) {
  if (!Array.isArray(tokens)) {
    throw new MalformedShellInput();
  }

  const commands = [];
  let words = [];
  let expectingCommand = true;
  let parenthesisDepth = 0;
  let lastOperator = null;
  let sawToken = false;
  const flushCommand = () => {
    if (words.length > 0) {
      const unwrappedCommands = unwrapCommand(words);
      if (unwrappedCommands.some((command) => command.length === 0)) {
        throw new MalformedShellInput();
      }
      if (unwrappedCommands.length > 0) {
        commands.push(...unwrappedCommands);
      }
      words = [];
    }
  };

  for (const token of tokens) {
    if (!token || (token.kind !== 'word' && token.kind !== 'operator') || typeof token.value !== 'string') {
      throw new MalformedShellInput();
    }
    if (token.kind === 'operator') {
      if (!OPERATORS.has(token.value)) {
        throw new MalformedShellInput();
      }
      if (token.value === '\n' && expectingCommand && (lastOperator === null || lastOperator === '\n')) {
        continue;
      }
      sawToken = true;
      if (token.value === '(') {
        if (!expectingCommand) {
          throw new MalformedShellInput();
        }
        parenthesisDepth += 1;
        lastOperator = token.value;
        continue;
      }
      if (token.value === ')') {
        if ((expectingCommand && lastOperator !== ';' && lastOperator !== '\n')
          || parenthesisDepth === 0) {
          throw new MalformedShellInput();
        }
        flushCommand();
        parenthesisDepth -= 1;
        expectingCommand = false;
        lastOperator = token.value;
        continue;
      }
      if (token.value === ';' && expectingCommand) {
        throw new MalformedShellInput();
      }
      if (expectingCommand && (token.value !== ';' && token.value !== '\n'
        || (lastOperator !== ';' && lastOperator !== '\n'))) {
        throw new MalformedShellInput();
      }
      flushCommand();
      expectingCommand = true;
      lastOperator = token.value;
    } else {
      sawToken = true;
      if (words.length === 0 && !expectingCommand) {
        throw new MalformedShellInput();
      }
      words.push(token.value);
      expectingCommand = false;
      lastOperator = null;
    }
  }
  if (parenthesisDepth !== 0 || (expectingCommand && sawToken
    && lastOperator !== ';' && lastOperator !== '\n')) {
    throw new MalformedShellInput();
  }
  flushCommand();
  return commands;
}

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

const isGitHubApiTarget = (argument) => {
  if (typeof argument !== 'string') {
    return false;
  }
  return /(?:^|:\/\/|@)api\.github\.com(?::\d+)?(?:[/?#]|$)/i.test(argument)
    || /(?:^|:\/\/)(?:www\.)?github\.com(?::\d+)?\/graphql(?:[/?#]|$)/i.test(argument);
};

const hasCloudflareSelector = (query) => typeof query === 'string'
  && /(?:^|\s)(?:org|user):cloudflare(?:\s|$)/i.test(query)
  || typeof query === 'string' && /(?:^|\s)repo:cloudflare\/\S*/i.test(query);

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const sameIdentity = (actual, expected) => typeof actual === 'string' && actual.toLowerCase() === expected;

const deny = (reason) => ({ allowed: false, reason });

function evaluateBash(toolInput) {
  if (!isRecord(toolInput) || typeof toolInput.command !== 'string') {
    return deny('malformed Bash input');
  }

  let commands;
  try {
    commands = findCommands(tokenizeShell(toolInput.command));
  } catch {
    return deny('malformed Bash input');
  }

  for (const command of commands) {
    const executable = basename(command[0]);
    const args = command.slice(1);
    if (executable === 'gh') {
      return deny('GitHub CLI use is forbidden');
    }
    if (executable === 'git' && ['push', 'send-pack'].includes(firstNonOptionArgument(args))) {
      return deny('Git push is forbidden');
    }
    if (['curl', 'wget', 'http', 'https'].includes(executable) && args.some(isGitHubApiTarget)) {
      return deny('direct GitHub API access is forbidden');
    }
  }
  return { allowed: true };
}

function evaluateGitHubMcp(toolName, toolInput) {
  const shortName = toolName.slice('mcp__github__'.length);
  if (!isRecord(toolInput)) {
    return deny('malformed GitHub MCP input');
  }

  const cloudflareIssuePrTarget = CLOUDFLARE_ISSUE_PR_TOOLS.has(shortName)
    && sameIdentity(toolInput.owner, 'cloudflare');
  const cloudflareSearchTarget = (shortName === 'search_issues' || shortName === 'search_pull_requests')
    && hasCloudflareSelector(toolInput.query);
  if (cloudflareIssuePrTarget || cloudflareSearchTarget) {
    return deny('Cloudflare Issue/PR access is forbidden');
  }

  if (READ_ONLY_GITHUB_TOOLS.has(shortName)) {
    return { allowed: true };
  }
  if (ALWAYS_DENIED_GITHUB_MUTATIONS.has(shortName)) {
    return deny('GitHub mutation is forbidden');
  }
  if (!sameIdentity(toolInput.owner, 'kyoneken') || !sameIdentity(toolInput.repo, 'moltworker')) {
    return deny('GitHub mutation is forbidden outside the canonical repository');
  }
  return { allowed: true };
}

export function evaluateEvent(event) {
  if (!isRecord(event) || event.hook_event_name !== 'PreToolUse'
    || typeof event.tool_name !== 'string' || event.tool_name.trim().length === 0
    || !isRecord(event.tool_input)) {
    return deny('malformed Hook input');
  }
  if (event.tool_name === 'Bash') {
    return evaluateBash(event.tool_input);
  }
  if (event.tool_name.startsWith('mcp__github__')) {
    return evaluateGitHubMcp(event.tool_name, event.tool_input);
  }
  return { allowed: true };
}

const isMalformedHookEvent = (event, result) => {
  if (result.reason?.startsWith('malformed ')) {
    return true;
  }
  if (!isRecord(event) || !isRecord(event.tool_input)) {
    return true;
  }
  if (event.tool_name === 'Bash') {
    return typeof event.tool_input.command !== 'string';
  }
  if (typeof event.tool_name !== 'string' || !event.tool_name.startsWith('mcp__github__')) {
    return false;
  }

  const shortName = event.tool_name.slice('mcp__github__'.length);
  return !READ_ONLY_GITHUB_TOOLS.has(shortName)
    && !Object.hasOwn(event.tool_input, 'owner');
};

const reportMalformedHookInput = () => {
  process.stderr.write('Malformed GitHub policy Hook input\n');
  process.exitCode = 2;
};

export async function main() {
  try {
    process.stdin.setEncoding('utf8');
    let input = '';
    for await (const chunk of process.stdin) {
      input += chunk;
    }

    const event = JSON.parse(input);
    const result = evaluateEvent(event);
    if (isMalformedHookEvent(event, result)) {
      reportMalformedHookInput();
      return;
    }
    if (!result.allowed) {
      process.stdout.write(`${JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: `Blocked by moltworker repository GitHub policy: ${result.reason}`,
        },
      })}\n`);
    }
  } catch {
    reportMalformedHookInput();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  void main();
}
