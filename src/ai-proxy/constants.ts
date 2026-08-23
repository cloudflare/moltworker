export const DEFAULT_MODEL = '@cf/zai-org/glm-4.7-flash' as const;
export const OPTIONAL_MODEL = '@cf/moonshotai/kimi-k2.7-code' as const;

export const ALLOWED_MODELS = Object.freeze([DEFAULT_MODEL, OPTIONAL_MODEL] as const);

export const MAX_PROXY_BODY_BYTES = 1_048_576;
