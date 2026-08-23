import {
  createOpenAIChatCompletionStream,
  toOpenAIChatCompletion,
  type ChatCompletionContext,
} from './response';
import type { AllowedModel, OpenAIChatCompletionRequest } from './types';

interface WorkersAiRunOptions {
  gateway: {
    id: string;
    collectLog: true;
  };
  returnRawResponse: true;
}

type WorkersAiRun = (
  model: AllowedModel,
  inputs: Record<string, unknown>,
  options: WorkersAiRunOptions,
) => Promise<Response>;

const upstreamErrorBody = {
  error: {
    message: 'Workers AI request failed',
    type: 'upstream_error',
    code: 'upstream_error',
  },
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function upstreamError(status: number): Response {
  return jsonResponse(upstreamErrorBody, status);
}

function createContext(model: AllowedModel): ChatCompletionContext {
  return {
    id: `chatcmpl-${crypto.randomUUID()}`,
    created: Math.floor(Date.now() / 1000),
    model,
  };
}

export async function runWorkersAi(
  ai: Ai,
  gatewayId: string,
  request: OpenAIChatCompletionRequest,
  signal: AbortSignal,
): Promise<Response> {
  const normalizedGatewayId = gatewayId.trim();
  if (normalizedGatewayId.length === 0) {
    throw new Error('AI Gateway ID is required');
  }

  const inputs: Record<string, unknown> = {
    ...request,
    stream: request.stream === true,
  };
  delete inputs.model;

  const run = ai.run as unknown as WorkersAiRun;
  const upstream = await run.call(ai, request.model, inputs, {
    gateway: { id: normalizedGatewayId, collectLog: true },
    returnRawResponse: true,
  });

  if (!upstream.ok) {
    return upstreamError(upstream.status);
  }

  const contentType = upstream.headers.get('content-type')?.toLowerCase() ?? '';
  const context = createContext(request.model);
  if (contentType.includes('text/event-stream')) {
    if (upstream.body === null) {
      return upstreamError(502);
    }

    return new Response(createOpenAIChatCompletionStream(upstream.body, context, signal), {
      status: upstream.status,
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'text/event-stream',
      },
    });
  }

  if (!contentType.includes('application/json')) {
    return upstreamError(502);
  }

  let result: unknown;
  try {
    result = await upstream.json();
  } catch {
    return upstreamError(502);
  }

  return jsonResponse(toOpenAIChatCompletion(result, context), upstream.status);
}
