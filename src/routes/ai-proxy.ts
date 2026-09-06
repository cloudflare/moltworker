import { Hono, type Context } from 'hono';
import { hasValidProxyAuthorization } from '../ai-proxy/auth';
import { runWorkersAi } from '../ai-proxy/inference';
import { createOpenAIModelList } from '../ai-proxy/models';
import { parseChatCompletionRequest } from '../ai-proxy/request';
import { ProxyRequestError, type AllowedModel } from '../ai-proxy/types';
import type { AppEnv } from '../types';

type ProxyErrorStatus = 400 | 401 | 405 | 413 | 500;
type ProxyStage = 'authentication' | 'method' | 'validation' | 'inference';

interface ProxyErrorLog {
  requestId: string;
  stage: ProxyStage;
  status: number;
  model?: AllowedModel;
  gatewayLogId?: string;
}

function errorType(status: ProxyErrorStatus): string {
  if (status === 401) return 'authentication_error';
  if (status === 500) return 'server_error';
  return 'invalid_request_error';
}

function gatewayLogId(ai: Ai): string | undefined {
  try {
    return ai.aiGatewayLogId ?? undefined;
  } catch {
    return undefined;
  }
}

function logProxyError(details: ProxyErrorLog): void {
  console.error('[AI_PROXY]', details);
}

export function openAIError(
  c: Context<AppEnv>,
  status: ProxyErrorStatus,
  code: string,
  message: string,
  requestId: string = crypto.randomUUID(),
): Response {
  c.header('x-request-id', requestId);
  return c.json(
    {
      error: {
        message,
        type: errorType(status),
        code,
      },
      request_id: requestId,
    },
    status,
  );
}

export const aiProxy = new Hono<AppEnv>();

const chatCompletionsPath = '/internal/ai/v1/chat/completions';
const modelsPath = '/internal/ai/v1/models';

function modelListMethodNotAllowed(c: Context<AppEnv>): Response {
  const requestId = crypto.randomUUID();
  logProxyError({ requestId, stage: 'method', status: 405 });
  c.header('allow', 'GET');
  return openAIError(c, 405, 'method_not_allowed', 'Method not allowed', requestId);
}

aiProxy.use(modelsPath, async (c, next) => {
  if (c.req.raw.method === 'HEAD') {
    return modelListMethodNotAllowed(c);
  }
  await next();
});

aiProxy.get(modelsPath, async (c) => {
  const requestId = crypto.randomUUID();
  const authorized = await hasValidProxyAuthorization(
    c.req.header('Authorization'),
    c.env.AI_PROXY_TOKEN,
  );
  if (!authorized) {
    logProxyError({ requestId, stage: 'authentication', status: 401 });
    return openAIError(c, 401, 'invalid_api_key', 'Unauthorized', requestId);
  }

  return c.json(createOpenAIModelList());
});

aiProxy.all(modelsPath, (c) => {
  return modelListMethodNotAllowed(c);
});

aiProxy.post(chatCompletionsPath, async (c) => {
  const requestId = crypto.randomUUID();
  let stage: ProxyStage = 'authentication';
  let model: AllowedModel | undefined;

  try {
    const authorized = await hasValidProxyAuthorization(
      c.req.header('Authorization'),
      c.env.AI_PROXY_TOKEN,
    );
    if (!authorized) {
      logProxyError({ requestId, stage, status: 401 });
      return openAIError(c, 401, 'invalid_api_key', 'Unauthorized', requestId);
    }

    stage = 'validation';
    const input = await parseChatCompletionRequest(c.req.raw, { bucket: c.env.BACKUP_BUCKET });
    model = input.model;

    stage = 'inference';
    const response = await runWorkersAi(
      c.env.AI,
      c.env.AI_GATEWAY_ID ?? '',
      input,
      c.req.raw.signal,
    );
    response.headers.set('x-request-id', requestId);

    if (!response.ok) {
      logProxyError({
        requestId,
        stage,
        status: response.status,
        model,
        gatewayLogId: gatewayLogId(c.env.AI),
      });
    }

    return response;
  } catch (error) {
    if (error instanceof ProxyRequestError) {
      logProxyError({ requestId, stage, status: error.status });
      return openAIError(c, error.status, error.code, error.message, requestId);
    }

    logProxyError({
      requestId,
      stage,
      status: 500,
      model,
      gatewayLogId: gatewayLogId(c.env.AI),
    });
    return openAIError(c, 500, 'internal_error', 'Internal server error', requestId);
  }
});

aiProxy.all(chatCompletionsPath, (c) => {
  const requestId = crypto.randomUUID();
  logProxyError({ requestId, stage: 'method', status: 405 });
  c.header('allow', 'POST');
  return openAIError(c, 405, 'method_not_allowed', 'Method not allowed', requestId);
});
