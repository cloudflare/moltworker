import { mkdtemp, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runSmoke } from './smoke-workers-ai-model.mjs';

const workerUrl = 'https://worker.example.test';
const secret = 'proxy-secret-never-print';
const responseContent = 'response-body-never-print';
const accessJwt = 'access-jwt-never-print';
const toolArguments = '{"secret":"tool-argument-never-print"}';

const modelIds = [
  '@cf/zai-org/glm-4.7-flash',
  '@cf/moonshotai/kimi-k2.7-code',
  '@cf/qwen/qwen3.8-27b',
];

function responseHeaders(requestId: string): Headers {
  return new Headers({
    'content-type': 'application/json',
    'x-request-id': requestId,
    'cf-access-jwt-assertion': accessJwt,
  });
}

function jsonResponse(body: unknown, status: number, requestId: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(requestId),
  });
}

function completion(model: string, requestId: string, toolCalls: unknown[] = []): Response {
  return jsonResponse(
    {
      id: requestId,
      object: 'chat.completion',
      model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: toolCalls.length === 0 ? responseContent : null,
            ...(toolCalls.length === 0 ? {} : { tool_calls: toolCalls }),
          },
          finish_reason: toolCalls.length === 0 ? 'stop' : 'tool_calls',
        },
      ],
    },
    200,
    requestId,
  );
}

function streamResponse(requestId: string): Response {
  const records = [
    {
      id: requestId,
      object: 'chat.completion.chunk',
      model: '@cf/qwen/qwen3.8-27b',
      choices: [{ index: 0, delta: { role: 'assistant', content: responseContent } }],
    },
    {
      id: requestId,
      object: 'chat.completion.chunk',
      model: '@cf/qwen/qwen3.8-27b',
      choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
    },
  ];
  const body = `${records.map((record) => `data: ${JSON.stringify(record)}\n\n`).join('')}data: [DONE]\n\n`;
  return new Response(body, {
    status: 200,
    headers: new Headers({
      'content-type': 'text/event-stream',
      'x-request-id': requestId,
      'cf-access-jwt-assertion': accessJwt,
    }),
  });
}

describe('runSmoke', () => {
  it('runs every structural case with in-memory authorization and no secret-bearing output or artifact', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const output: string[] = [];
    const errors: string[] = [];
    const currentDirectory = await mkdtemp(join(tmpdir(), 'workers-ai-smoke-'));

    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      calls.push({ url, init });
      const request = init?.body === undefined ? undefined : JSON.parse(String(init.body));
      const path = new URL(url).pathname;

      expect(init?.headers).toMatchObject({ authorization: `Bearer ${secret}` });

      if (path.endsWith('/models')) {
        return jsonResponse(
          {
            object: 'list',
            data: modelIds.map((id) => ({ id, object: 'model' })),
            leaked: responseContent,
          },
          200,
          'models-request-id',
        );
      }

      if (request?.model === '@cf/unknown/model') {
        return jsonResponse(
          {
            error: { message: responseContent, code: 'model_not_allowed' },
            request_id: 'unknown-request-id',
            access_jwt: accessJwt,
          },
          400,
          'unknown-request-id',
        );
      }

      if (request?.stream === true) return streamResponse('stream-request-id');

      const toolCount = Array.isArray(request?.tools) ? request.tools.length : 0;
      if (toolCount > 0) {
        expect(request.tool_choice).toBe('required');
        expect(request.messages[0].content).toContain('exactly once');
        return completion(
          '@cf/qwen/qwen3.8-27b',
          toolCount === 1 ? 'single-tool-request-id' : 'parallel-tool-request-id',
          Array.from({ length: toolCount }, (_, index) => ({
            id: `call-${index}`,
            type: 'function',
            function: { name: `tool-${index}`, arguments: toolArguments },
          })),
        );
      }

      return completion('@cf/qwen/qwen3.8-27b', 'completion-request-id');
    };

    const status = await runSmoke({
      workerUrl,
      proxyToken: secret,
      fetchImpl,
      writeOut: (line: string) => output.push(line),
      writeErr: (line: string) => errors.push(line),
    });

    expect(status).toBe(0);
    expect(calls).toHaveLength(6);
    expect(output).toHaveLength(6);
    expect(errors).toHaveLength(0);
    expect(output.join('\n')).toContain('model-list');
    expect(output.join('\n')).toContain('unknown-model');
    expect(output.join('\n')).toContain('non-streaming');
    expect(output.join('\n')).toContain('streaming');
    expect(output.join('\n')).toContain('single-tool');
    expect(output.join('\n')).toContain('parallel-tool');

    const serializedOutput = `${output.join('\n')}\n${errors.join('\n')}`;
    expect(serializedOutput).not.toContain(secret);
    expect(serializedOutput).not.toContain(responseContent);
    expect(serializedOutput).not.toContain(accessJwt);
    expect(serializedOutput).not.toContain(toolArguments);
    expect(await readdir(currentDirectory)).toEqual([]);
  });

  it('reports malformed responses with only status and generic structural failure', async () => {
    const output: string[] = [];
    const status = await runSmoke({
      workerUrl,
      proxyToken: secret,
      fetchImpl: async () =>
        new Response(`malformed ${responseContent} ${accessJwt} ${toolArguments}`, {
          status: 503,
          headers: { 'x-request-id': 'malformed-request-id' },
        }),
      writeOut: (line: string) => output.push(line),
      writeErr: () => {},
    });

    expect(status).toBe(1);
    expect(output).toHaveLength(6);
    expect(output[0]).toContain('model-list status=503');
    expect(output[0]).toContain('structural=0/1');
    expect(output.join('\n')).not.toContain(responseContent);
    expect(output.join('\n')).not.toContain(accessJwt);
    expect(output.join('\n')).not.toContain(toolArguments);
  });
});
