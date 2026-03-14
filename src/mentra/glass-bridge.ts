/**
 * Routes I/O between MentraOS glasses and the OpenClaw gateway.
 * The gateway runs inside the Cloudflare Sandbox on the same Worker.
 * Uses /api/chat endpoint with Bearer token auth.
 */

export interface BridgeConfig {
  gatewayUrl: string;
  gatewayToken: string;
}

export interface QueryOptions {
  message: string;
  imageData?: string;
}

export interface ChatResponse {
  response: string;
}

/**
 * Sends a query to the OpenClaw gateway and returns the text response.
 * Supports optional base64 imageData for vision queries.
 * 30 second timeout via AbortSignal.
 */
export async function queryOpenClaw(
  config: BridgeConfig,
  options: QueryOptions,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const body: Record<string, string> = { message: options.message };
    if (options.imageData) {
      body.imageData = options.imageData;
    }

    const res = await fetch(`${config.gatewayUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.gatewayToken}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Gateway returned ${res.status}: ${text}`);
    }

    const data = (await res.json()) as ChatResponse;
    return data.response;
  } finally {
    clearTimeout(timeout);
  }
}
