import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_MODEL, KIMI_MODEL } from '../ai-proxy/models';
import {
  defaultSessionModelState,
  readSessionModel,
  SESSION_MODEL_OBJECT_KEY,
  writeSessionModel,
} from './session-model';

describe('session model persistence', () => {
  it('defaults to GLM primary when nothing is stored', async () => {
    const bucket = {
      get: vi.fn().mockResolvedValue(null),
    } as unknown as R2Bucket;

    await expect(readSessionModel(bucket)).resolves.toEqual(defaultSessionModelState());
    expect(DEFAULT_MODEL).toBe('@cf/zai-org/glm-4.7-flash');
  });

  it('returns a stored allowlisted model including manual-only Kimi', async () => {
    const bucket = {
      get: vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          model: KIMI_MODEL,
          updatedAt: '2026-09-06T00:00:00.000Z',
        }),
      }),
    } as unknown as R2Bucket;

    await expect(readSessionModel(bucket)).resolves.toEqual({
      model: KIMI_MODEL,
      source: 'stored',
      updatedAt: '2026-09-06T00:00:00.000Z',
    });
  });

  it('ignores stored values outside the allowlist', async () => {
    const bucket = {
      get: vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ model: '@cf/unregistered/model' }),
      }),
    } as unknown as R2Bucket;

    await expect(readSessionModel(bucket)).resolves.toEqual(defaultSessionModelState());
  });

  it('writes only the selected model metadata', async () => {
    const put = vi.fn().mockResolvedValue(undefined);
    const bucket = { put } as unknown as R2Bucket;

    const state = await writeSessionModel(bucket, KIMI_MODEL);
    expect(state.model).toBe(KIMI_MODEL);
    expect(state.source).toBe('stored');
    expect(put).toHaveBeenCalledWith(
      SESSION_MODEL_OBJECT_KEY,
      expect.stringContaining(KIMI_MODEL),
      { httpMetadata: { contentType: 'application/json' } },
    );
  });
});
