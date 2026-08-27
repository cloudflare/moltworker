import type { AllowedModel } from './types';
import { QWEN_MODEL } from './constants';

export interface ChatCompletionContext {
  id: string;
  created: number;
  model: AllowedModel;
}

export interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenAIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface OpenAIChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: AllowedModel;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string | null;
      reasoning_content?: string;
      tool_calls?: OpenAIToolCall[];
    };
    finish_reason: 'stop' | 'tool_calls';
  }>;
  usage?: OpenAIUsage;
}

interface OpenAIChatCompletionChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: AllowedModel;
  choices: Array<{
    index: number;
    delta: {
      role?: 'assistant';
      content?: string;
      reasoning_content?: string;
      tool_calls?: OpenAIStreamToolCall[];
    };
    finish_reason: 'stop' | 'tool_calls' | null;
  }>;
  usage?: OpenAIUsage;
}

interface OpenAIStreamToolCall {
  index: number;
  id?: string;
  type?: 'function';
  function?: {
    name?: string;
    arguments?: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function unwrapResult(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    return {};
  }

  return isRecord(value.result) ? value.result : value;
}

function serializeArguments(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value ?? {});
}

function normalizeToolCall(value: unknown, index: number): OpenAIToolCall | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const functionValue = isRecord(value.function) ? value.function : value;
  if (typeof functionValue.name !== 'string') {
    return undefined;
  }

  return {
    id: typeof value.id === 'string' && value.id.length > 0 ? value.id : `call_${index}`,
    type: 'function',
    function: {
      name: functionValue.name,
      arguments: serializeArguments(functionValue.arguments),
    },
  };
}

function normalizeToolCalls(value: unknown): OpenAIToolCall[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((toolCall, index) => {
    const normalized = normalizeToolCall(toolCall, index);
    return normalized === undefined ? [] : [normalized];
  });
}

function firstChoice(value: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!Array.isArray(value.choices)) {
    return undefined;
  }

  return value.choices.find(isRecord);
}

function normalizeStreamToolCalls(value: unknown): OpenAIStreamToolCall[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((toolCall, fallbackIndex) => {
    if (!isRecord(toolCall)) {
      return [];
    }

    const functionValue = isRecord(toolCall.function) ? toolCall.function : undefined;
    const id = typeof toolCall.id === 'string' ? toolCall.id : undefined;
    const type = toolCall.type === 'function' ? 'function' : undefined;
    const name = typeof functionValue?.name === 'string' ? functionValue.name : undefined;
    const argumentsValue =
      typeof functionValue?.arguments === 'string' ? functionValue.arguments : undefined;
    if (
      id === undefined &&
      type === undefined &&
      name === undefined &&
      argumentsValue === undefined
    ) {
      return [];
    }

    return [
      {
        index: typeof toolCall.index === 'number' ? toolCall.index : fallbackIndex,
        ...(id === undefined ? {} : { id }),
        ...(type === undefined ? {} : { type }),
        ...(functionValue === undefined
          ? {}
          : {
              function: {
                ...(name === undefined ? {} : { name }),
                ...(argumentsValue === undefined ? {} : { arguments: argumentsValue }),
              },
            }),
      },
    ];
  });
}

function normalizeUsage(value: unknown): OpenAIUsage | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const { prompt_tokens, completion_tokens, total_tokens } = value;
  if (
    typeof prompt_tokens !== 'number' ||
    typeof completion_tokens !== 'number' ||
    typeof total_tokens !== 'number'
  ) {
    return undefined;
  }

  return { prompt_tokens, completion_tokens, total_tokens };
}

function normalizeReasoning(value: unknown): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  if (typeof value.reasoning_content === 'string') {
    return value.reasoning_content;
  }

  return typeof value.reasoning === 'string' ? value.reasoning : undefined;
}

export function toOpenAIChatCompletion(
  result: unknown,
  context: ChatCompletionContext,
): OpenAIChatCompletionResponse {
  const unwrapped = unwrapResult(result);
  const choice = firstChoice(unwrapped);
  const message = choice !== undefined && isRecord(choice.message) ? choice.message : undefined;
  const toolCalls = normalizeToolCalls(message?.tool_calls ?? unwrapped.tool_calls);
  const reasoning = context.model === QWEN_MODEL ? normalizeReasoning(message) : undefined;
  const usage = normalizeUsage(unwrapped.usage);
  const response: OpenAIChatCompletionResponse = {
    id: context.id,
    object: 'chat.completion',
    created: context.created,
    model: context.model,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content:
            typeof message?.content === 'string'
              ? message.content
              : typeof unwrapped.response === 'string'
                ? unwrapped.response
                : null,
          ...(reasoning === undefined ? {} : { reasoning_content: reasoning }),
          ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {}),
        },
        finish_reason:
          toolCalls.length > 0 || choice?.finish_reason === 'tool_calls' ? 'tool_calls' : 'stop',
      },
    ],
    ...(usage === undefined ? {} : { usage }),
  };

  return response;
}

export function createOpenAIChatCompletionStream(
  source: ReadableStream<Uint8Array>,
  context: ChatCompletionContext,
  signal: AbortSignal,
): ReadableStream<Uint8Array> {
  const sourceReader = source.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let inputBuffer = '';
  let eventData: string[] = [];
  let sentFirstChunk = false;
  let sawToolCalls = false;
  let usage: OpenAIUsage | undefined;
  let terminated = false;
  let aborted = signal.aborted;

  function chunk(
    delta: OpenAIChatCompletionChunk['choices'][number]['delta'],
    finishReason: 'stop' | 'tool_calls' | null,
  ): OpenAIChatCompletionChunk {
    return {
      id: context.id,
      object: 'chat.completion.chunk',
      created: context.created,
      model: context.model,
      choices: [{ index: 0, delta, finish_reason: finishReason }],
    };
  }

  return new ReadableStream<Uint8Array>({
    start(controller): void {
      const enqueueRecord = (value: OpenAIChatCompletionChunk | '[DONE]'): void => {
        const data = value === '[DONE]' ? value : JSON.stringify(value);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      const finish = (): void => {
        if (terminated || aborted) {
          return;
        }

        terminated = true;
        const terminal = chunk(
          sentFirstChunk ? {} : { role: 'assistant' },
          sawToolCalls ? 'tool_calls' : 'stop',
        );
        if (usage !== undefined) {
          terminal.usage = usage;
        }
        enqueueRecord(terminal);
        enqueueRecord('[DONE]');
      };

      const processEvent = (): boolean => {
        if (eventData.length === 0) {
          return false;
        }

        const data = eventData.join('\n');
        eventData = [];
        if (data.trim() === '[DONE]') {
          finish();
          return true;
        }

        const parsed = unwrapResult(JSON.parse(data));
        const choice = firstChoice(parsed);
        const delta = choice !== undefined && isRecord(choice.delta) ? choice.delta : undefined;
        const text =
          typeof delta?.content === 'string'
            ? delta.content
            : typeof parsed.response === 'string'
              ? parsed.response
              : undefined;
        const reasoning = context.model === QWEN_MODEL ? normalizeReasoning(delta) : undefined;
        const toolCalls: OpenAIStreamToolCall[] =
          delta === undefined
            ? normalizeToolCalls(parsed.tool_calls).map((toolCall, index) =>
                Object.assign({ index }, toolCall),
              )
            : normalizeStreamToolCalls(delta.tool_calls);
        const parsedUsage = normalizeUsage(parsed.usage);
        if (parsedUsage !== undefined) {
          usage = parsedUsage;
        }

        if (text !== undefined || reasoning !== undefined || toolCalls.length > 0) {
          const outputDelta: OpenAIChatCompletionChunk['choices'][number]['delta'] = {
            ...(!sentFirstChunk || delta?.role === 'assistant'
              ? { role: 'assistant' as const }
              : {}),
            ...(text === undefined ? {} : { content: text }),
            ...(reasoning === undefined ? {} : { reasoning_content: reasoning }),
            ...(toolCalls.length === 0
              ? {}
              : {
                  tool_calls: toolCalls,
                }),
          };
          sawToolCalls ||= toolCalls.length > 0;
          sentFirstChunk = true;
          enqueueRecord(chunk(outputDelta, null));
        }

        if (choice?.finish_reason === 'tool_calls') {
          sawToolCalls = true;
        }

        return false;
      };

      const processLine = (line: string): boolean => {
        if (line === '') {
          return processEvent();
        }
        if (line.startsWith(':') || !line.startsWith('data:')) {
          return false;
        }

        const value = line.slice('data:'.length);
        eventData.push(value.startsWith(' ') ? value.slice(1) : value);
        return false;
      };

      const processText = (text: string): boolean => {
        inputBuffer += text;
        while (true) {
          const newlineIndex = inputBuffer.indexOf('\n');
          if (newlineIndex === -1) {
            return false;
          }

          let line = inputBuffer.slice(0, newlineIndex);
          inputBuffer = inputBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) {
            line = line.slice(0, -1);
          }
          if (processLine(line)) {
            return true;
          }
        }
      };

      const onAbort = (): void => {
        aborted = true;
        void sourceReader.cancel(signal.reason).finally(() => {
          signal.removeEventListener('abort', onAbort);
          try {
            controller.close();
          } catch {
            // The consumer may already have cancelled the output stream.
          }
        });
      };

      signal.addEventListener('abort', onAbort, { once: true });
      if (aborted) {
        onAbort();
        return;
      }

      void (async (): Promise<void> => {
        try {
          while (!aborted && !terminated) {
            // oxlint-disable-next-line no-await-in-loop -- Stream chunks must be read sequentially.
            const { done, value } = await sourceReader.read();
            if (done) {
              processText(decoder.decode());
              if (inputBuffer.length > 0) {
                processLine(inputBuffer.endsWith('\r') ? inputBuffer.slice(0, -1) : inputBuffer);
                inputBuffer = '';
              }
              processEvent();
              finish();
              break;
            }
            if (processText(decoder.decode(value, { stream: true }))) {
              void sourceReader.cancel();
              break;
            }
          }

          if (!aborted) {
            controller.close();
          }
        } catch (error) {
          if (!aborted) {
            controller.error(error);
          }
        } finally {
          signal.removeEventListener('abort', onAbort);
        }
      })();
    },
    cancel(reason): Promise<void> {
      aborted = true;
      return sourceReader.cancel(reason);
    },
  });
}
