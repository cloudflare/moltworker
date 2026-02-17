/**
 * Durable Object fetch with retry logic.
 *
 * Per Cloudflare best practices, DO stub.fetch() errors may include
 * `.retryable` (transient — safe to retry) and `.overloaded` (DO is
 * overwhelmed — back off aggressively) properties.
 *
 * @see https://developers.cloudflare.com/durable-objects/best-practices/error-handling/
 */

interface DOError extends Error {
  /** True if the error is transient and the request can be retried */
  retryable?: boolean;
  /** True if the Durable Object is overloaded */
  overloaded?: boolean;
}

/**
 * Fetch from a Durable Object stub with automatic retry on transient errors.
 *
 * Retries up to `maxRetries` times with exponential backoff when the error
 * has `.retryable === true`.  When `.overloaded === true` the base delay is
 * doubled so the DO gets breathing room.
 */
export async function fetchDOWithRetry(
  stub: { fetch: (request: Request | string) => Promise<Response> },
  request: Request,
  maxRetries = 3,
  baseDelayMs = 100,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Clone the request for each retry (body may have been consumed)
      const req = attempt === 0 ? request : new Request(request);
      return await stub.fetch(req);
    } catch (err) {
      lastError = err;
      const doErr = err as DOError;

      // Only retry if the error is explicitly marked retryable
      if (!doErr.retryable && !doErr.overloaded) {
        throw err;
      }

      // Don't retry after exhausting attempts
      if (attempt >= maxRetries) {
        break;
      }

      // Exponential backoff: 100ms, 200ms, 400ms (doubled if overloaded)
      const multiplier = doErr.overloaded ? 2 : 1;
      const delay = baseDelayMs * Math.pow(2, attempt) * multiplier;
      console.warn(
        `[DO-Retry] Attempt ${attempt + 1}/${maxRetries} failed` +
        `${doErr.retryable ? ' (retryable)' : ''}` +
        `${doErr.overloaded ? ' (overloaded)' : ''}` +
        `, retrying in ${delay}ms`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
