/**
 * aX Backend API calls
 */

/**
 * Send progress update to backend (fire-and-forget)
 */
export async function sendProgressUpdate(
  backendUrl: string,
  authToken: string,
  dispatchId: string,
  status: "processing" | "completed" | "error",
  tool?: string,
  message?: string
): Promise<void> {
  const progressUrl = `${backendUrl}/api/v1/webhooks/progress`;

  try {
    await fetch(progressUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        dispatch_id: dispatchId,
        status,
        tool,
        message,
      }),
    });
  } catch {
    // Fire-and-forget - don't fail dispatch if progress fails
  }
}

/**
 * Call aX MCP tool via backend API
 */
export async function callAxTool(
  mcpEndpoint: string,
  authToken: string,
  toolName: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const response = await fetch(`${mcpEndpoint}/tools/${toolName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${authToken}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`aX tool ${toolName} failed: ${response.status}`);
  }

  return response.json();
}
