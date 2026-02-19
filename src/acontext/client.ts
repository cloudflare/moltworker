/**
 * Lightweight Acontext REST client for Cloudflare Workers.
 *
 * This is a minimal client that uses fetch() directly instead of the
 * @acontext/acontext SDK, avoiding Node.js API dependencies (Buffer, streams)
 * that are incompatible with Cloudflare Workers.
 *
 * Phase 1: Observability layer — store completed task conversations as
 * Acontext Sessions for replay, analysis, and dashboard integration.
 */

const DEFAULT_BASE_URL = 'https://api.acontext.io';
const DEFAULT_TIMEOUT_MS = 10000; // 10s — keep it fast for non-blocking usage

// --- Types ---

export interface AcontextSession {
  id: string;
  project_id: string;
  user_id?: string | null;
  configs: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface AcontextMessage {
  id: string;
  session_id: string;
  role: string;
  created_at: string;
}

export interface ListSessionsResponse {
  items: AcontextSession[];
  next_cursor?: string | null;
  has_more: boolean;
}

export interface SessionSummary {
  sessionId: string;
  user: string;
  model: string;
  taskPrompt: string;
  toolsUsed: number;
  iterations: number;
  durationSec: number;
  success: boolean;
  createdAt: string;
}

/** Simplified message format for storage (OpenAI-compatible). */
export interface OpenAIMessage {
  role: string;
  content?: string | null;
  tool_calls?: Array<{
    id: string;
    type: string;
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
  name?: string;
}

// --- Client ---

export class AcontextClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor(apiKey: string, baseUrl?: string, timeout?: number) {
    this.apiKey = apiKey;
    this.baseUrl = (baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.timeout = timeout || DEFAULT_TIMEOUT_MS;
  }

  /**
   * Create a new Acontext session for a task.
   */
  async createSession(options: {
    user?: string;
    configs?: Record<string, unknown>;
  }): Promise<AcontextSession> {
    return this.request<AcontextSession>('POST', '/api/v1/sessions', {
      user: options.user || undefined,
      configs: options.configs || undefined,
    });
  }

  /**
   * Store a message (in OpenAI format) to a session.
   */
  async storeMessage(
    sessionId: string,
    blob: OpenAIMessage,
    meta?: Record<string, unknown>,
  ): Promise<AcontextMessage> {
    return this.request<AcontextMessage>('POST', `/api/v1/sessions/${sessionId}/messages`, {
      blob,
      format: 'openai',
      meta: meta || undefined,
    });
  }

  /**
   * Store multiple messages in sequence (batch helper).
   * Errors on individual messages are caught and logged — partial storage is fine.
   */
  async storeMessages(
    sessionId: string,
    messages: OpenAIMessage[],
    meta?: Record<string, unknown>,
  ): Promise<{ stored: number; errors: number }> {
    let stored = 0;
    let errors = 0;

    for (const msg of messages) {
      try {
        await this.storeMessage(sessionId, msg, meta);
        stored++;
      } catch (err) {
        errors++;
        console.error(`[Acontext] Failed to store message (role=${msg.role}):`, err);
      }
    }

    return { stored, errors };
  }

  /**
   * Update session configs (patch semantics — only updates keys present).
   */
  async updateConfigs(
    sessionId: string,
    configs: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('PATCH', `/api/v1/sessions/${sessionId}/configs`, {
      configs,
    });
  }

  /**
   * List sessions for a user.
   */
  async listSessions(options?: {
    user?: string;
    limit?: number;
    timeDesc?: boolean;
  }): Promise<ListSessionsResponse> {
    const params = new URLSearchParams();
    if (options?.user) params.set('user', options.user);
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.timeDesc !== undefined) params.set('time_desc', String(options.timeDesc));

    const query = params.toString();
    const path = query ? `/api/v1/sessions?${query}` : '/api/v1/sessions';
    return this.request<ListSessionsResponse>('GET', path);
  }

  /**
   * Get a session summary.
   */
  async getSessionSummary(sessionId: string): Promise<string> {
    return this.request<string>('GET', `/api/v1/sessions/${sessionId}/summary`);
  }

  /**
   * Delete a session.
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.request<void>('DELETE', `/api/v1/sessions/${sessionId}`);
  }

  /**
   * Low-level request helper.
   */
  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'moltworker/1.0',
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'unknown');
        throw new Error(`Acontext API ${method} ${path} failed: ${response.status} ${errorText}`);
      }

      // Handle no-content responses
      if (response.status === 204) {
        return undefined as T;
      }

      const text = await response.text();
      if (!text) return undefined as T;

      try {
        const json = JSON.parse(text);
        // Unwrap { data: ... } wrapper if present
        return (json.data !== undefined ? json.data : json) as T;
      } catch {
        return text as T;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// --- Factory ---

/**
 * Create an Acontext client if the API key is configured.
 * Returns null if no key is available (graceful degradation).
 */
export function createAcontextClient(
  apiKey?: string,
  baseUrl?: string,
): AcontextClient | null {
  if (!apiKey) return null;
  return new AcontextClient(apiKey, baseUrl);
}

// --- Helper: Convert ChatMessage[] to OpenAIMessage[] ---

/**
 * Convert the internal ChatMessage format to OpenAI-compatible format
 * for Acontext storage. Truncates large tool results to keep session size manageable.
 */
export function toOpenAIMessages(messages: Array<{
  role: string;
  content?: string | Array<{ type: string; text?: string; image_url?: { url: string } }> | null;
  tool_calls?: unknown[];
  tool_call_id?: string;
  name?: string;
}>): OpenAIMessage[] {
  const MAX_CONTENT_LENGTH = 4000; // Truncate large tool results

  return messages.map(msg => {
    const openaiMsg: OpenAIMessage = { role: msg.role };

    if (msg.content !== undefined && msg.content !== null) {
      // Flatten ContentPart[] to string (extract text parts, skip images)
      let content: string;
      if (Array.isArray(msg.content)) {
        content = msg.content
          .filter(p => p.type === 'text' && p.text)
          .map(p => p.text!)
          .join('\n');
      } else {
        content = typeof msg.content === 'string' ? msg.content : String(msg.content);
      }
      openaiMsg.content = content.length > MAX_CONTENT_LENGTH
        ? content.substring(0, MAX_CONTENT_LENGTH) + '... [truncated]'
        : content;
    }

    if (msg.tool_call_id) {
      openaiMsg.tool_call_id = msg.tool_call_id;
    }

    if (msg.name) {
      openaiMsg.name = msg.name;
    }

    return openaiMsg;
  });
}

// --- Helper: Format sessions for Telegram display ---

/**
 * Format a list of Acontext sessions for display in Telegram.
 */
export function formatSessionsList(sessions: AcontextSession[]): string {
  if (sessions.length === 0) {
    return '📋 No sessions found.';
  }

  const lines: string[] = ['📋 Recent Acontext Sessions\n'];

  for (const s of sessions) {
    const configs = s.configs || {};
    const model = (configs.model as string) || '?';
    const prompt = (configs.prompt as string) || 'No prompt';
    const success = configs.success === true ? '✓' : configs.success === false ? '✗' : '?';
    const toolCount = (configs.toolsUsed as number) || 0;
    const date = new Date(s.created_at);
    const age = formatSessionAge(date);

    lines.push(
      `${success} ${age} — /${model} | ${toolCount} tools`,
      `  "${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}"`,
      `  ID: ${s.id.substring(0, 8)}...`,
    );
  }

  return lines.join('\n');
}

function formatSessionAge(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}min ago`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}
