import type { AllowedModel } from './models';

export type { AllowedModel } from './models';

export interface OpenAIChatCompletionRequest {
  model: AllowedModel;
  messages: Array<Record<string, unknown>>;
  stream?: boolean;
  [key: string]: unknown;
}

export class ProxyRequestError extends Error {
  constructor(
    public readonly status: 400 | 413,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ProxyRequestError';
  }
}
