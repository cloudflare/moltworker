import * as nativeFs from 'node:fs/promises'
import { join } from 'node:path'

const CHANNEL_ID = /^[CG][A-Z0-9]+$/
const ENDPOINT = 'https://slack.com/api/chat.postMessage'
const MAX_ATTEMPTS = 3
const RETRY_DELAYS = [500, 1000]
const MAX_RETRY_AFTER_MS = 2000
const REQUEST_TIMEOUT_MS = 3000

function readyTimestamp(event, now) {
  const value = new Date(event.timestamp)
  return Number.isNaN(value.getTime()) ? now() : value
}

function stableSlackCode(value) {
  return typeof value === 'string' && /^[a-z_]+$/.test(value) ? `slack_${value}` : 'slack_error'
}

function log(logger, category) {
  try {
    logger?.(`moltworker-slack-ready: ${category}`)
  } catch {
    // Logging must never affect gateway startup.
  }
}

async function exists(fs, path) {
  try {
    await fs.access(path)
    return true
  } catch (error) {
    if (error?.code === 'ENOENT') {
      return false
    }
    throw error
  }
}

function retryAfter(response, fallback) {
  const value = Number(response.headers?.get?.('retry-after'))
  return Number.isFinite(value) && value >= 0
    ? Math.min(value * 1000, MAX_RETRY_AFTER_MS)
    : fallback
}

async function fetchWithTimeout(fetch, request, timeoutMs, classifyResponse) {
  const controller = new AbortController()
  let timeout
  const timedOut = new Promise((_, reject) => {
    timeout = setTimeout(() => {
      controller.abort()
      const error = new Error('timeout')
      error.code = 'MOLTWORKER_SLACK_READY_TIMEOUT'
      reject(error)
    }, timeoutMs)
  })

  try {
    const response = await Promise.race([
      fetch(ENDPOINT, { ...request, signal: controller.signal }),
      timedOut,
    ])
    return await Promise.race([classifyResponse(response), timedOut])
  } finally {
    clearTimeout(timeout)
  }
}

async function sendAttempt(fetch, request, timeoutMs, fallbackDelay) {
  try {
    return await fetchWithTimeout(fetch, request, timeoutMs, async (response) => {
      if (!response || typeof response.status !== 'number') {
        return { category: 'malformed_response', retry: false }
      }
      if (response.status === 429) {
        return { category: 'http_429', retry: true, retryDelay: retryAfter(response, fallbackDelay) }
      }
      if (response.status >= 500 && response.status <= 599) {
        return { category: 'http_5xx', retry: true, retryDelay: fallbackDelay }
      }

      let payload
      try {
        payload = await response.json()
      } catch {
        return { category: 'malformed_response', retry: false }
      }
      if (response.ok && payload?.ok === true) {
        return { success: true }
      }
      return { category: stableSlackCode(payload?.error), retry: false }
    })
  } catch (error) {
    return {
      category: error?.code === 'MOLTWORKER_SLACK_READY_TIMEOUT' ? 'timeout' : 'network',
      retry: true,
      retryDelay: fallbackDelay,
    }
  }
}

async function removeLock(fs, lock, logger) {
  try {
    await fs.unlink(lock)
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      log(logger, 'filesystem_cleanup')
    }
  }
}

export async function notifySlackReady(event, dependencies = {}) {
  if (event?.type !== 'gateway' || event?.action !== 'startup') {
    return { status: 'ignored-event' }
  }

  const env = dependencies.env ?? process.env
  const channel = env.SLACK_READY_CHANNEL_ID?.trim()
  const botToken = env.SLACK_BOT_TOKEN
  if (!botToken || !channel || !CHANNEL_ID.test(channel)) {
    return { status: 'disabled' }
  }

  const fs = dependencies.fs ?? nativeFs
  const root = dependencies.markerRoot ?? '/tmp'
  const lock = join(root, 'moltworker-slack-ready.lock')
  const marker = join(root, 'moltworker-slack-ready.notified')
  const logger = dependencies.logger
  let lockAcquired = false

  try {
    if (await exists(fs, marker)) {
      return { status: 'already-notified' }
    }
    const handle = await fs.open(lock, 'wx')
    lockAcquired = true
    await handle.close()
    if (await exists(fs, marker)) {
      await removeLock(fs, lock, logger)
      return { status: 'already-notified' }
    }
  } catch (error) {
    if (error?.code === 'EEXIST') {
      return { status: 'in-progress' }
    }
    if (lockAcquired) {
      await removeLock(fs, lock, logger)
    }
    log(logger, 'filesystem')
    return { category: 'filesystem', status: 'failed' }
  }

  const now = dependencies.now ?? (() => new Date())
  const fetch = dependencies.fetch ?? globalThis.fetch
  const sleep = dependencies.sleep ?? ((delay) => new Promise((resolve) => setTimeout(resolve, delay)))
  const timeoutMs = dependencies.timeoutMs ?? REQUEST_TIMEOUT_MS
  const request = {
    body: JSON.stringify({
      channel,
      text: `OpenClaw is ready · ${readyTimestamp(event, now).toISOString()}`,
    }),
    headers: {
      Authorization: `Bearer ${botToken}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const result = await sendAttempt(fetch, request, timeoutMs, RETRY_DELAYS[attempt] ?? RETRY_DELAYS.at(-1))
    if (result.success) {
      try {
        await fs.rename(lock, marker)
        return { status: 'notified' }
      } catch {
        await removeLock(fs, lock, logger)
        log(logger, 'filesystem')
        return { category: 'filesystem', status: 'failed' }
      }
    }
    if (!result.retry || attempt === MAX_ATTEMPTS - 1) {
      await removeLock(fs, lock, logger)
      log(logger, result.category)
      return { category: result.category, status: 'failed' }
    }
    await sleep(result.retryDelay)
  }

  await removeLock(fs, lock, logger)
  return { status: 'failed' }
}

export default async function handler(event, dependencies = {}) {
  try {
    return await notifySlackReady(event, dependencies)
  } catch {
    return { status: 'failed' }
  }
}
