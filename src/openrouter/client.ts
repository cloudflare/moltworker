/**
 * OpenRouter API Client
 * Direct integration with OpenRouter API using OpenAI-compatible format
 */

import { getModelId, isImageGenModel, DEFAULT_IMAGE_MODEL } from './models';
import { AVAILABLE_TOOLS, executeTool, type ToolDefinition, type ToolCall, type ToolResult, type ToolContext } from './tools';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | ContentPart[] | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
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
}

export interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: ToolCall[];
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
        conversationMessages.push({
          role: 'assistant',
          content: choice.message.content,
          tool_calls: choice.message.tool_calls,
        });

        // Execute each tool call
        for (const toolCall of choice.message.tool_calls) {
          const toolName = toolCall.function.name;
          toolsUsed.push(toolName);

          // Notify caller about tool call
          if (options?.onToolCall) {
            options.onToolCall(toolName, toolCall.function.arguments);
          }

          // Execute tool and get result (pass context with secrets)
          const result = await executeTool(toolCall, options?.toolContext);

          // Add tool result to conversation
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
    const request = {
      model: modelId,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      modalities: ['image', 'text'],
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
    }
  ): Promise<ChatCompletionResponse> {
    const modelId = getModelId(modelAlias);
    const idleTimeoutMs = options?.idleTimeoutMs ?? 30000;

    const controller = new AbortController();
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let chunksReceived = 0;

    const startIdleTimer = () => {
      if (idleTimer !== null) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => controller.abort(), idleTimeoutMs);
    };

    try {
      // Set a timeout for the initial fetch (in case connection hangs)
      const fetchTimeout = setTimeout(() => controller.abort(), 60000); // 60s for initial connection

      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        signal: controller.signal,
        body: JSON.stringify({
          model: modelId,
          messages,
          max_tokens: options?.maxTokens || 4096,
          temperature: options?.temperature ?? 0.7,
          tools: options?.tools,
          tool_choice: options?.toolChoice ?? 'auto',
          stream: true,
          stream_options: { include_usage: true },
        }),
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
      let content = '';
      const toolCalls: (ToolCall | undefined)[] = [];
      let finishReason: string | null = null;
      let usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | undefined;

      startIdleTimer(); // Start timer for first chunk

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          if (idleTimer !== null) clearTimeout(idleTimer);
          break;
        }

        // Progress received → reset idle timer and notify
        chunksReceived++;
        startIdleTimer();
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
      if (idleTimer !== null) clearTimeout(idleTimer);
      if (err instanceof Error && err.name === 'AbortError') {
        if (chunksReceived === 0) {
          throw new Error(`Streaming connection timeout (no response after 60s)`);
        } else {
          throw new Error(`Streaming idle timeout (no data for ${idleTimeoutMs / 1000}s after ${chunksReceived} chunks)`);
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
