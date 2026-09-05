import { DEFAULT_MODEL, isAllowedModel, type AllowedModel } from '../ai-proxy/models';

export const SESSION_MODEL_OBJECT_KEY = 'admin/session-model.json';

export interface SessionModelState {
  model: AllowedModel;
  source: 'stored' | 'default';
  updatedAt: string | null;
}

interface StoredSessionModel {
  model: string;
  updatedAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function defaultSessionModelState(): SessionModelState {
  return {
    model: DEFAULT_MODEL,
    source: 'default',
    updatedAt: null,
  };
}

export async function readSessionModel(bucket: R2Bucket): Promise<SessionModelState> {
  const object = await bucket.get(SESSION_MODEL_OBJECT_KEY);
  if (object === null) {
    return defaultSessionModelState();
  }

  let payload: unknown;
  try {
    payload = await object.json();
  } catch {
    return defaultSessionModelState();
  }

  if (!isRecord(payload) || typeof payload.model !== 'string' || !isAllowedModel(payload.model)) {
    return defaultSessionModelState();
  }

  const updatedAt = typeof payload.updatedAt === 'string' ? payload.updatedAt : null;
  return {
    model: payload.model,
    source: 'stored',
    updatedAt,
  };
}

export async function writeSessionModel(
  bucket: R2Bucket,
  model: AllowedModel,
): Promise<SessionModelState> {
  const stored: StoredSessionModel = {
    model,
    updatedAt: new Date().toISOString(),
  };
  await bucket.put(SESSION_MODEL_OBJECT_KEY, JSON.stringify(stored), {
    httpMetadata: { contentType: 'application/json' },
  });
  return {
    model,
    source: 'stored',
    updatedAt: stored.updatedAt,
  };
}
