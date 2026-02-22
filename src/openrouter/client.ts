/**
 * OpenRouter API Client
 * Direct integration with OpenRouter API using OpenAI-compatible format
 */

import { getModelId, isImageGenModel, DEFAULT_IMAGE_MODEL, getReasoningParam, detectReasoningLevel, type ReasoningLevel, type ReasoningParam } from './models';
import { AVAILABLE_TOOLS, executeTool, type ToolDefinition, type ToolCall, type ToolResult, type ToolContext } from './tools';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | ContentPart[] | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  /** Chain-of-thought from providers with thinking mode (e.g. Moonshot Kimi) */
  reasoning_content?: string;
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
  tools?: ToolDefinition[];
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  reasoning?: ReasoningParam;
  response_format?: ResponseFormat;
  transforms?: string[];
  plugins?: unknown[];
}

export type ResponseFormat =
  | { type: 'text' }
  | { type: 'json_object' }
  | { type: 'json_schema'; json_schema: { name: string; strict?: boolean; schema: Record<string, unknown> } };

export interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: ToolCall[];
      reasoning_content?: string;
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
      reasoningLevel?: ReasoningLevel;
      responseFormat?: ResponseFormat;
    }
  ): Promise<ChatCompletionResponse> {
    const modelId = getModelId(modelAlias);

    const request: ChatCompletionRequest = {
      model: modelId,
      messages,
      max_tokens: options?.maxTokens || 4096,
      temperature: options?.temperature ?? 0.7,
      transforms: [],
      plugins: [],
    };

    // Inject reasoning parameter for configurable models
    const level = options?.reasoningLevel ?? detectReasoningLevel(messages);
    const reasoning = getReasoningParam(modelAlias, level);
    if (reasoning) {
      request.reasoning = reasoning;
    }

    // Inject structured output format if requested
    if (options?.responseFormat) {
      request.response_format = options.responseFormat;
    }

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
   * Send a chat completion with tool calling support
   * Handles the tool call loop automatically with timeout protection
   */
  async chatCompletionWithTools(
    modelAlias: string,
    messages: ChatMessage[],
    options?: {
      maxTokens?: number;
      temperature?: number;
      maxToolCalls?: number; // Limit iterations to prevent infinite loops
      maxTimeMs?: number; // Maximum time in ms before returning partial result
      onToolCall?: (toolName: string, args: string) => void; // Callback for progress updates
      onIteration?: (iteration: number, totalTools: number) => void; // Callback for iteration progress
      toolContext?: ToolContext; // Context with secrets for tool execution
      reasoningLevel?: ReasoningLevel;
      responseFormat?: ResponseFormat;
    }
  ): Promise<{ response: ChatCompletionResponse; finalText: string; toolsUsed: string[]; hitLimit: boolean }> {
    const modelId = getModelId(modelAlias);
    const maxIterations = options?.maxToolCalls || 10;
    const maxTimeMs = options?.maxTimeMs || 120000; // Default 2 minutes for paid Workers plan
    const startTime = Date.now();
    const toolsUsed: string[] = [];
    let hitLimit = false;

    // Clone messages to avoid mutating the original
    const conversationMessages: ChatMessage[] = [...messages];

    // Pre-compute reasoning parameter (constant across iterations)
    const level = options?.reasoningLevel ?? detectReasoningLevel(messages);
    const toolLevel = level === 'off' ? 'medium' : level; // Tool-use benefits from reasoning
    const reasoningParam = getReasoningParam(modelAlias, toolLevel);

    let iterations = 0;
    let lastResponse: ChatCompletionResponse;

    while (iterations < maxIterations) {
      // Check time limit
      if (Date.now() - startTime > maxTimeMs) {
        hitLimit = true;
        break;
      }

      iterations++;

      // Notify about iteration
      if (options?.onIteration) {
        options.onIteration(iterations, toolsUsed.length);
      }

      const request: ChatCompletionRequest = {
        model: modelId,
        messages: conversationMessages,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature ?? 0.7,
        tools: AVAILABLE_TOOLS,
        tool_choice: 'auto',
        transforms: [],
        plugins: [],
      };

      // Inject reasoning parameter for configurable models
      if (reasoningParam) {
        request.reasoning = reasoningParam;
      }

      // Inject structured output format if requested
      if (options?.responseFormat) {
        request.response_format = options.responseFormat;
      }

      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json() as OpenRouterError;
        throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`);
      }

      lastResponse = await response.json() as ChatCompletionResponse;
      const choice = lastResponse.choices[0];

      // Check if the model wants to call tools
      if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
        // Check time before executing tools
        if (Date.now() - startTime > maxTimeMs - 5000) { // Leave 5s buffer
          hitLimit = true;
          break;
        }

        // Add assistant message with tool calls to conversation
        // Use placeholder for empty content — some providers reject empty assistant messages
        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: choice.message.content || '(calling tools)',
          tool_calls: choice.message.tool_calls,
        };
        if (choice.message.reasoning_content) {
          assistantMsg.reasoning_content = choice.message.reasoning_content;
        }
        conversationMessages.push(assistantMsg);

        // Collect tool names and notify caller
        for (const toolCall of choice.message.tool_calls) {
          toolsUsed.push(toolCall.function.name);
          if (options?.onToolCall) {
            options.onToolCall(toolCall.function.name, toolCall.function.arguments);
          }
        }

        // Execute all tool calls in parallel
        const results = await Promise.all(
          choice.message.tool_calls.map(tc => executeTool(tc, options?.toolContext))
        );

        // Add tool results to conversation (preserving order)
        for (const result of results) {
          conversationMessages.push({
            role: 'tool',
            content: result.content,
            tool_call_id: result.tool_call_id,
          });
        }

        // Continue the loop to get the model's response to tool results
        continue;
      }

      // No more tool calls, model has finished
      break;
    }

    // Check if we hit the iteration limit
    if (iterations >= maxIterations) {
      hitLimit = true;
    }

    // Extract final text response
    const finalText = lastResponse!.choices[0]?.message?.content || 'No response generated.';

    return {
      response: lastResponse!,
      finalText,
      toolsUsed,
      hitLimit,
    };
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
      transforms: [],
      plugins: [],
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
   * Uses OpenRouter's chat/completions with modalities: ["image", "text"]
   */
  async generateImage(
    prompt: string,
    modelAlias?: string,
    _options?: {
      aspectRatio?: string; // e.g., "1:1", "16:9", "9:16"
      imageSize?: string; // e.g., "1024x1024"
    }
  ): Promise<ImageGenerationResponse> {
    // Use specified model or default to fluxpro
    const alias = modelAlias || DEFAULT_IMAGE_MODEL;
    const modelId = getModelId(alias);

    // OpenRouter uses chat/completions with modalities for image generation
    // Image-only models (FLUX) must use ['image'], not ['image', 'text']
    const request = {
      model: modelId,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      modalities: ['image'],
      transforms: [] as string[],
      plugins: [] as unknown[],
    };

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      try {
        const error = JSON.parse(errorText) as OpenRouterError;
        errorMessage = error.error?.message || response.statusText;
      } catch {
        errorMessage = errorText || response.statusText;
      }
      throw new Error(`Image generation error: ${errorMessage}`);
    }

    // Response format: choices[0].message.images[].image_url.url
    const result = await response.json() as {
      choices: Array<{
        message: {
          content?: string;
          images?: Array<{
            image_url: { url: string };
          }>;
        };
      }>;
    };

    const images = result.choices[0]?.message?.images || [];

    return {
      created: Date.now(),
      data: images.map(img => ({ url: img.image_url.url })),
    };
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
      transforms: [],
      plugins: [],
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
   * Streaming chat completion with tool calls support
   * Uses SSE streaming to avoid response.text() hangs
   * Returns the same structure as non-streaming for easy integration
   *
   * @param idleTimeoutMs - Time without receiving data before aborting (default 30s)
   * @param onProgress - Callback when data is received (for heartbeat/watchdog updates)
   */
  async chatCompletionStreamingWithTools(
    modelAlias: string,
    messages: ChatMessage[],
    options?: {
      maxTokens?: number;
      temperature?: number;
      tools?: ToolDefinition[];
      toolChoice?: 'auto' | 'none';
      idleTimeoutMs?: number;
      onProgress?: () => void; // Called when chunks received - use for heartbeat
      reasoningLevel?: ReasoningLevel;
      responseFormat?: ResponseFormat;
    }
  ): Promise<ChatCompletionResponse> {
    const modelId = getModelId(modelAlias);
    const idleTimeoutMs = options?.idleTimeoutMs ?? 45000; // 45s default for network resilience

    const controller = new AbortController();
    let chunksReceived = 0;
    let content = ''; // Declare here for error reporting

    try {
      // Set a timeout for the initial fetch (in case connection hangs)
      const fetchTimeout = setTimeout(() => controller.abort(), 60000); // 60s for initial connection

      // Add unique query param to bypass stale pooled connections
      // Cloudflare Workers aggressively pool connections; stale ones cause hangs
      const url = new URL(`${OPENROUTER_BASE_URL}/chat/completions`);
      url.searchParams.append('_nc', crypto.randomUUID().slice(0, 8)); // no-cache bust

      // Compute reasoning parameter for configurable models
      const level = options?.reasoningLevel ?? detectReasoningLevel(messages);
      const reasoning = getReasoningParam(modelAlias, level);

      const requestBody: Record<string, unknown> = {
        model: modelId,
        messages,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature ?? 0.7,
        tools: options?.tools,
        tool_choice: options?.toolChoice ?? 'auto',
        stream: true,
        stream_options: { include_usage: true },
        transforms: [],
        plugins: [],
      };
      if (reasoning) {
        requestBody.reasoning = reasoning;
      }
      if (options?.responseFormat) {
        requestBody.response_format = options.responseFormat;
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: this.getHeaders(),
        signal: controller.signal,
        body: JSON.stringify(requestBody),
      });

      clearTimeout(fetchTimeout); // Clear fetch timeout once we have response

      if (!response.ok || !response.body) {
        const errorText = await response.text().catch(() => 'unknown');
        throw new Error(`OpenRouter API error (${response.status}): ${errorText.slice(0, 200)}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Accumulated state
      let id = '';
      let created = 0;
      let model = '';
      const toolCalls: (ToolCall | undefined)[] = [];
      let finishReason: string | null = null;
      let usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | undefined;

      // Helper to timeout reader.read() - AbortController only affects fetch(), not stream reading
      const readWithTimeout = async (): Promise<ReadableStreamReadResult<Uint8Array>> => {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('STREAM_READ_TIMEOUT')), idleTimeoutMs);
        });
        return Promise.race([reader.read(), timeoutPromise]);
      };

      while (true) {
        const { done, value } = await readWithTimeout();

        if (done) {
          break;
        }

        // Progress received - notify caller
        chunksReceived++;
        if (options?.onProgress) {
          options.onProgress();
        }

        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const parts = buffer.split('\n');
        buffer = parts.pop() || ''; // Last part may be incomplete

        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6).trim();

            if (data === '[DONE]') continue;

            try {
              const chunk: {
                id?: string;
                created?: number;
                model?: string;
                usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
                choices?: Array<{
                  finish_reason?: string | null;
                  delta?: {
                    content?: string;
                    tool_calls?: Array<{
                      index?: number;
                      id?: string;
                      type?: string;
                      function?: {
                        name?: string;
                        arguments?: string;
                      };
                    }>;
                  };
                }>;
              } = JSON.parse(data);

              // Top-level metadata
              if (chunk.id) id = chunk.id;
              if (chunk.created) created = chunk.created;
              if (chunk.model) model = chunk.model;
              if (chunk.usage) usage = chunk.usage;

              const choice = chunk.choices?.[0];
              if (choice?.finish_reason) finishReason = choice.finish_reason;

              const delta = choice?.delta;
              if (delta?.content) content += delta.content;

              if (delta?.tool_calls) {
                for (const tcDelta of delta.tool_calls) {
                  const index = tcDelta.index ?? toolCalls.length;
                  let tc = toolCalls[index];

                  if (!tc) {
                    tc = { id: '', type: 'function', function: { name: '', arguments: '' } };
                    toolCalls[index] = tc;
                  }

                  if (tcDelta.id) tc.id = tcDelta.id;
                  if (tcDelta.type) tc.type = tcDelta.type as 'function';
                  if (tcDelta.function?.name) tc.function.name = tcDelta.function.name;
                  if (tcDelta.function?.arguments !== undefined) {
                    tc.function.arguments += tcDelta.function.arguments;
                  }
                }
              }
            } catch (e) {
              console.error('[OpenRouterClient] Failed to parse SSE chunk:', data, e);
              // Continue — malformed chunks are rare but recoverable
            }
          }
        }
      }

      // Build final response matching ChatCompletionResponse structure
      const completion: ChatCompletionResponse = {
        id: id || 'unknown',
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: content || null,
            tool_calls: toolCalls.length > 0
              ? toolCalls.filter((tc): tc is ToolCall => tc !== undefined)
              : undefined,
          },
          finish_reason: finishReason ?? 'stop',
        }],
        usage,
      };

      console.log(`[OpenRouterClient] Streaming complete: ${chunksReceived} chunks received`);
      return completion;

    } catch (err: unknown) {
      // Handle different timeout scenarios
      if (err instanceof Error) {
        if (err.message === 'STREAM_READ_TIMEOUT') {
          // reader.read() hung - this is the new timeout mechanism
          throw new Error(`Streaming read timeout (no data for ${idleTimeoutMs / 1000}s after ${chunksReceived} chunks) - model: ${modelId}, content_length: ${content.length}`);
        }
        if (err.name === 'AbortError') {
          // Initial fetch timed out
          throw new Error(`Streaming connection timeout (no response after 60s) - model: ${modelId}`);
        }
      }
      throw err;
    }
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
