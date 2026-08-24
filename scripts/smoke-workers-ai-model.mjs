const MODELS_PATH = '/internal/ai/v1/models';
const COMPLETIONS_PATH = '/internal/ai/v1/chat/completions';
const GLM_MODEL = '@cf/zai-org/glm-4.7-flash';
const QWEN_MODEL = '@cf/qwen/qwen3.8-27b';
const MODEL_IDS = [GLM_MODEL, '@cf/moonshotai/kimi-k2.7-code', QWEN_MODEL];

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function requestUrl(workerUrl, path) {
  return new URL(path, `${workerUrl.replace(/\/+$/, '')}/`).toString();
}

function requestId(response, body) {
  const headerId = response.headers.get('x-request-id');
  if (headerId) return headerId;
  return isRecord(body) && typeof body.request_id === 'string' ? body.request_id : 'unavailable';
}

function resultLine(name, response, body, passed, total, model) {
  return `${name} status=${response.status} request_id=${requestId(response, body)} model=${model ?? 'none'} structural=${passed}/${total}`;
}

async function readJson(response) {
  return JSON.parse(await response.text());
}

function hasErrorEnvelope(body) {
  return isRecord(body) && isRecord(body.error) && typeof body.request_id === 'string';
}

function hasModelList(body) {
  if (!isRecord(body) || body.object !== 'list' || !Array.isArray(body.data)) return false;
  const ids = body.data.filter(isRecord).map((model) => model.id);
  return ids.length === MODEL_IDS.length && MODEL_IDS.every((id, index) => ids[index] === id);
}

function hasCompletion(body, model, toolCount = 0) {
  if (!isRecord(body) || body.object !== 'chat.completion' || body.model !== model) return false;
  if (!Array.isArray(body.choices) || body.choices.length === 0) return false;
  const choice = body.choices[0];
  if (!isRecord(choice) || !isRecord(choice.message)) return false;
  const toolCalls = choice.message.tool_calls;
  if (toolCount === 0) return choice.finish_reason === 'stop' && toolCalls === undefined;
  return (
    choice.finish_reason === 'tool_calls' &&
    Array.isArray(toolCalls) &&
    toolCalls.length === toolCount
  );
}

function parseStream(text) {
  const records = [];
  let doneCount = 0;
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith('data:')) continue;
    const value = line.slice('data:'.length).trim();
    if (value === '[DONE]') {
      doneCount += 1;
      continue;
    }
    records.push(JSON.parse(value));
  }
  return { records, doneCount };
}

function hasCompletionStream(body) {
  if (!isRecord(body) || body.object !== 'chat.completion.chunk' || body.model !== QWEN_MODEL) {
    return false;
  }
  return Array.isArray(body.choices) && body.choices.length > 0;
}

function tools(count) {
  return Array.from({ length: count }, (_, index) => ({
    type: 'function',
    function: {
      name: `smoke_tool_${index}`,
      description: 'Smoke-test tool',
      parameters: { type: 'object' },
    },
  }));
}

const CASES = [
  {
    name: 'model-list',
    method: 'GET',
    path: MODELS_PATH,
    check: async (response) => {
      const body = await readJson(response);
      return { body, passed: response.status === 200 && hasModelList(body), total: 1, model: null };
    },
  },
  {
    name: 'unknown-model',
    method: 'POST',
    path: COMPLETIONS_PATH,
    body: { model: '@cf/unknown/model', messages: [{ role: 'user', content: 'smoke' }] },
    check: async (response) => {
      const body = await readJson(response);
      return {
        body,
        passed: response.status === 400 && hasErrorEnvelope(body),
        total: 1,
        model: '@cf/unknown/model',
      };
    },
  },
  {
    name: 'non-streaming',
    method: 'POST',
    path: COMPLETIONS_PATH,
    body: { model: QWEN_MODEL, messages: [{ role: 'user', content: 'Reply briefly.' }] },
    check: async (response) => {
      const body = await readJson(response);
      return {
        body,
        passed: response.status === 200 && hasCompletion(body, QWEN_MODEL),
        total: 1,
        model: QWEN_MODEL,
      };
    },
  },
  {
    name: 'streaming',
    method: 'POST',
    path: COMPLETIONS_PATH,
    body: {
      model: QWEN_MODEL,
      messages: [{ role: 'user', content: 'Stream briefly.' }],
      stream: true,
    },
    check: async (response) => {
      const parsed = parseStream(await response.text());
      const passed =
        response.status === 200 &&
        parsed.records.length > 0 &&
        parsed.records.every(hasCompletionStream) &&
        parsed.doneCount === 1;
      return { body: parsed.records[0], passed, total: 3, model: QWEN_MODEL };
    },
  },
  {
    name: 'single-tool',
    method: 'POST',
    path: COMPLETIONS_PATH,
    body: {
      model: QWEN_MODEL,
      messages: [{ role: 'user', content: 'Use the tool.' }],
      tools: tools(1),
    },
    check: async (response) => {
      const body = await readJson(response);
      return {
        body,
        passed: response.status === 200 && hasCompletion(body, QWEN_MODEL, 1),
        total: 1,
        model: QWEN_MODEL,
      };
    },
  },
  {
    name: 'parallel-tool',
    method: 'POST',
    path: COMPLETIONS_PATH,
    body: {
      model: QWEN_MODEL,
      messages: [{ role: 'user', content: 'Use both tools.' }],
      tools: tools(2),
      parallel_tool_calls: true,
    },
    check: async (response) => {
      const body = await readJson(response);
      return {
        body,
        passed: response.status === 200 && hasCompletion(body, QWEN_MODEL, 2),
        total: 1,
        model: QWEN_MODEL,
      };
    },
  },
];

export async function runSmoke({ workerUrl, proxyToken, fetchImpl, writeOut, writeErr }) {
  const out = typeof writeOut === 'function' ? writeOut : () => {};
  const err = typeof writeErr === 'function' ? writeErr : () => {};
  if (
    typeof workerUrl !== 'string' ||
    workerUrl.trim() === '' ||
    typeof proxyToken !== 'string' ||
    proxyToken.trim() === ''
  ) {
    err('smoke configuration failure');
    return 2;
  }
  if (typeof fetchImpl !== 'function') {
    err('smoke fetch unavailable');
    return 2;
  }

  let baseUrl;
  try {
    baseUrl = new URL(`${workerUrl.replace(/\/+$/, '')}/`);
  } catch {
    err('smoke configuration failure');
    return 2;
  }
  if (
    baseUrl.protocol !== 'https:' &&
    baseUrl.hostname !== 'localhost' &&
    baseUrl.hostname !== '127.0.0.1'
  ) {
    err('smoke configuration failure');
    return 2;
  }

  let failures = 0;
  for (const smokeCase of CASES) {
    const init = {
      method: smokeCase.method,
      headers: {
        authorization: `Bearer ${proxyToken}`,
        ...(smokeCase.body === undefined ? {} : { 'content-type': 'application/json' }),
      },
      ...(smokeCase.body === undefined ? {} : { body: JSON.stringify(smokeCase.body) }),
    };
    let response;
    try {
      response = await fetchImpl(requestUrl(workerUrl, smokeCase.path), init);
      const result = await smokeCase.check(response);
      if (!result.passed) failures += 1;
      out(
        resultLine(
          smokeCase.name,
          response,
          result.body,
          result.passed ? result.total : 0,
          result.total,
          result.model,
        ),
      );
    } catch {
      failures += 1;
      const status = response === undefined ? 'error' : response.status;
      const id = response === undefined ? 'unavailable' : requestId(response, undefined);
      const model = smokeCase.body?.model ?? 'none';
      out(`${smokeCase.name} status=${status} request_id=${id} model=${model} structural=0/1`);
    }
  }
  return failures === 0 ? 0 : 1;
}

async function main() {
  if (process.argv.slice(2).length > 0) {
    process.stderr.write('smoke runner accepts configuration through the environment only\n');
    process.exitCode = 2;
    return;
  }
  const status = await runSmoke({
    workerUrl: process.env.WORKER_URL,
    proxyToken: process.env.AI_PROXY_TOKEN,
    fetchImpl: globalThis.fetch,
    writeOut: (line) => process.stdout.write(`${line}\n`),
    writeErr: (line) => process.stderr.write(`${line}\n`),
  });
  process.exitCode = status;
}

if (process.argv[1] && new URL(`file://${process.argv[1]}`).href === import.meta.url) {
  await main();
}
