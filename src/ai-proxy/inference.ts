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

const RETRY_GUIDANCE =
  'Do not switch models automatically. Retry the same requested model after the limit resets, or pick a model explicitly in the Admin UI.';

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function upstreamError(status: number, model: AllowedModel): Response {
  const limited = status === 429;
  return jsonResponse(
    {
      error: {
        message: limited
          ? 'Model rate or spend limit reached. Retry later with the same model. Automatic fallback is disabled.'
          : 'Workers AI request failed',
        type: 'upstream_error',
        code: limited ? 'rate_or_spend_limited' : 'upstream_error',
        retry_guidance: RETRY_GUIDANCE,
        requested_model: model,
        fallback: false,
      },
    },
    status,
  );
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
    return upstreamError(upstream.status, request.model);
  }

  const contentType = upstream.headers.get('content-type')?.toLowerCase() ?? '';
  const context = createContext(request.model);
  if (contentType.includes('text/event-stream')) {
    if (upstream.body === null) {
      return upstreamError(502, request.model);
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
    return upstreamError(502, request.model);
  }

  let result: unknown;
  try {
    result = await upstream.json();
  } catch {
    return upstreamError(502, request.model);
  }

  return jsonResponse(toOpenAIChatCompletion(result, context), upstream.status);
}
