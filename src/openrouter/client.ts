/**
 * OpenRouter API Client
 * Direct integration with OpenRouter API using OpenAI-compatible format
 */

import { getModelId, isImageGenModel, DEFAULT_IMAGE_MODEL } from './models';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | ContentPart[];
}

export interface ContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string; // base64 data URL or regular URL
  };
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ImageGenerationRequest {
  model: string;
  prompt: string;
  n?: number;
  size?: string;
}

export interface ImageGenerationResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
  }>;
}

export interface OpenRouterError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

/**
 * OpenRouter API Client
 */
export class OpenRouterClient {
  private apiKey: string;
  private siteUrl?: string;
  private siteName?: string;

  constructor(apiKey: string, options?: { siteUrl?: string; siteName?: string }) {
    this.apiKey = apiKey;
    this.siteUrl = options?.siteUrl;
    this.siteName = options?.siteName || 'Moltworker Bot';
  }

  /**
   * Get headers for OpenRouter API
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': this.siteUrl || 'https://github.com/PetrAnto/moltworker',
      'X-Title': this.siteName || 'Moltworker Bot',
    };
    return headers;
  }

  /**
   * Send a chat completion request
   */
  async chatCompletion(
    modelAlias: string,
    messages: ChatMessage[],
    options?: {
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<ChatCompletionResponse> {
    const modelId = getModelId(modelAlias);

    const request: ChatCompletionRequest = {
      model: modelId,
      messages,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature ?? 0.7,
    };

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json() as OpenRouterError;
      throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
    }

    return response.json() as Promise<ChatCompletionResponse>;
  }

  /**
   * Send a chat completion with vision (image input)
   */
  async chatCompletionWithVision(
    modelAlias: string,
    textPrompt: string,
    imageBase64: string,
    mimeType: string = 'image/jpeg'
  ): Promise<ChatCompletionResponse> {
    const modelId = getModelId(modelAlias);

    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: [
          { type: 'text', text: textPrompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
            },
          },
        ],
      },
    ];

    const request: ChatCompletionRequest = {
      model: modelId,
      messages,
      max_tokens: 4096,
    };

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json() as OpenRouterError;
      throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
    }

    return response.json() as Promise<ChatCompletionResponse>;
  }

  /**
   * Generate an image using FLUX or other image models
   * OpenRouter uses chat completions for image generation
   */
  async generateImage(
    prompt: string,
    modelAlias?: string
  ): Promise<ImageGenerationResponse> {
    // Use specified model or default to fluxpro
    const alias = modelAlias || DEFAULT_IMAGE_MODEL;
    const modelId = getModelId(alias);

    // OpenRouter handles FLUX through chat completions
    // The model returns an image URL in the response
    const messages: ChatMessage[] = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    const request = {
      model: modelId,
      messages,
    };

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json() as OpenRouterError;
      throw new Error(`Image generation error: ${error.error?.message || response.statusText}`);
    }

    const result = await response.json() as ChatCompletionResponse;
    const content = result.choices[0]?.message?.content || '';

    // FLUX models return markdown image syntax: ![...](url)
    // Extract the URL from the response
    const urlMatch = content.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/);
    if (urlMatch) {
      return {
        created: Date.now(),
        data: [{ url: urlMatch[1] }],
      };
    }

    // Some models return just a URL
    const plainUrlMatch = content.match(/(https?:\/\/[^\s]+\.(png|jpg|jpeg|webp|gif))/i);
    if (plainUrlMatch) {
      return {
        created: Date.now(),
        data: [{ url: plainUrlMatch[1] }],
      };
    }

    // If no URL found, throw error with the actual response for debugging
    throw new Error(`No image URL in response. Model returned: ${content.slice(0, 200)}`);
  }

  /**
   * Stream a chat completion (returns ReadableStream)
   */
  async chatCompletionStream(
    modelAlias: string,
    messages: ChatMessage[],
    options?: {
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<ReadableStream<Uint8Array>> {
    const modelId = getModelId(modelAlias);

    const request: ChatCompletionRequest = {
      model: modelId,
      messages,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature ?? 0.7,
      stream: true,
    };

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json() as OpenRouterError;
      throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body for streaming');
    }

    return response.body;
  }

  /**
   * Get available models from OpenRouter
   */
  async listModels(): Promise<unknown> {
    const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to list models: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Check API key validity and get credits
   */
  async getCredits(): Promise<{ credits: number; usage: number }> {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get credits: ${response.statusText}`);
    }

    const data = await response.json() as { data: { label: string; usage: number; limit: number } };
    return {
      credits: data.data.limit - data.data.usage,
      usage: data.data.usage,
    };
  }
}

/**
 * Create an OpenRouter client from environment
 */
export function createOpenRouterClient(apiKey: string, workerUrl?: string): OpenRouterClient {
  return new OpenRouterClient(apiKey, {
    siteUrl: workerUrl,
    siteName: 'Moltworker Telegram Bot',
  });
}

/**
 * Extract text response from chat completion
 */
export function extractTextResponse(response: ChatCompletionResponse): string {
  return response.choices[0]?.message?.content || 'No response generated.';
}
