const modes = new Set(['markdown', 'text', 'snapshot']);
const failureCategories = new Set(['dns_error', 'timeout', 'blocked', 'not_found', 'parse_error']);
const minimumChars = 1;
const minimumSemanticSnapshotChars = JSON.stringify({
  title: '',
  headings: [],
  landmarks: [],
  links: [],
  text: '',
}).length;
const maximumChars = 50_000;
const minimumTimeoutMs = 1_000;
const maximumTimeoutMs = 45_000;

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasExactKeys(value, keys) {
  return isRecord(value) && Object.keys(value).length === keys.length && keys.every((key) => key in value);
}

function isBoundedInteger(value, minimum, maximum) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum;
}

function isSnapshot(value) {
  if (!hasExactKeys(value, ['title', 'headings', 'landmarks', 'links', 'text'])) return false;
  if (typeof value.title !== 'string' || typeof value.text !== 'string') return false;
  if (!Array.isArray(value.headings) || !Array.isArray(value.landmarks) || !Array.isArray(value.links)) {
    return false;
  }
  return (
    value.headings.every(
      (heading) =>
        hasExactKeys(heading, ['level', 'text']) &&
        Number.isSafeInteger(heading.level) &&
        typeof heading.text === 'string',
    ) &&
    value.landmarks.every(
      (landmark) =>
        hasExactKeys(landmark, ['role', 'text']) &&
        typeof landmark.role === 'string' &&
        typeof landmark.text === 'string',
    ) &&
    value.links.every(
      (link) =>
        hasExactKeys(link, ['text', 'href']) &&
        typeof link.text === 'string' &&
        typeof link.href === 'string',
    )
  );
}

function isBrowserFetchResult(value) {
  if (!isRecord(value)) return false;

  if (value.ok === true) {
    if (
      !hasExactKeys(value, [
        'ok',
        'sourceUrl',
        'finalUrl',
        'title',
        'status',
        'mode',
        'fetchedAt',
        'content',
        'length',
        'truncated',
      ])
    ) {
      return false;
    }
    return (
      typeof value.sourceUrl === 'string' &&
      typeof value.finalUrl === 'string' &&
      typeof value.title === 'string' &&
      Number.isSafeInteger(value.status) &&
      modes.has(value.mode) &&
      typeof value.fetchedAt === 'string' &&
      isBoundedInteger(value.length, 0, Number.MAX_SAFE_INTEGER) &&
      typeof value.truncated === 'boolean' &&
      (value.mode === 'snapshot' ? isSnapshot(value.content) : typeof value.content === 'string')
    );
  }

  return (
    value.ok === false &&
    hasExactKeys(value, ['ok', 'sourceUrl', 'error', 'message', 'fetchedAt']) &&
    typeof value.sourceUrl === 'string' &&
    failureCategories.has(value.error) &&
    typeof value.message === 'string' &&
    typeof value.fetchedAt === 'string'
  );
}

function parseInteger(value, minimum, maximum) {
  if (!/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return isBoundedInteger(parsed, minimum, maximum) ? parsed : undefined;
}

function parseArgs(args) {
  if (args.length === 0 || args[0].startsWith('--')) return undefined;
  const input = { url: args[0], mode: 'markdown' };

  try {
    const url = new URL(input.url);
    if (
      (url.protocol !== 'http:' && url.protocol !== 'https:') ||
      url.username !== '' ||
      url.password !== '' ||
      url.hash !== '' ||
      (url.port !== '' && url.port !== '80' && url.port !== '443')
    ) {
      return undefined;
    }
    input.url = url.href;
  } catch {
    return undefined;
  }

  for (let index = 1; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];
    if (value === undefined) return undefined;
    if (flag === '--mode' && !('modeSet' in input) && modes.has(value)) {
      input.mode = value;
      input.modeSet = true;
      continue;
    }
    if (flag === '--max-chars' && !('maxChars' in input)) {
      const maxChars = parseInteger(value, minimumChars, maximumChars);
      if (maxChars === undefined) return undefined;
      input.maxChars = maxChars;
      continue;
    }
    if (flag === '--timeout-ms' && !('timeoutMs' in input)) {
      const timeoutMs = parseInteger(value, minimumTimeoutMs, maximumTimeoutMs);
      if (timeoutMs === undefined) return undefined;
      input.timeoutMs = timeoutMs;
      continue;
    }
    return undefined;
  }

  if (input.mode === 'snapshot' && input.maxChars !== undefined && input.maxChars < minimumSemanticSnapshotChars) {
    return undefined;
  }

  delete input.modeSet;
  return input;
}

export async function main(args, env, dependencies = {}) {
  const input = parseArgs(args);
  const endpoint = env.BROWSER_FETCH_URL;
  const token = env.BROWSER_FETCH_TOKEN;
  if (input === undefined || typeof endpoint !== 'string' || endpoint === '' || typeof token !== 'string' || token === '') {
    return 1;
  }

  const fetchImpl = dependencies.fetchImpl ?? fetch;
  const stdout = dependencies.stdout ?? process.stdout;
  let response;
  try {
    response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(input),
    });
  } catch {
    return 1;
  }

  if (response.status === 401) return 1;

  let result;
  try {
    result = await response.json();
  } catch {
    return 1;
  }
  if (!isBrowserFetchResult(result)) return 1;

  stdout.write(`${JSON.stringify(result)}\n`);
  return 0;
}

if (process.argv[1] !== undefined && import.meta.url === new URL(process.argv[1], 'file:').href) {
  main(process.argv.slice(2), process.env).then((exitCode) => {
    process.exitCode = exitCode;
  });
}
