import { access, mkdtemp, open as openFile, readFile, rename, rm, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import handler, { notifySlackReady } from './handler.js'

const READY_TIME = new Date('2026-08-29T07:00:00.000Z')
const BOT_TOKEN = 'xoxb-secret-bot-token'
const APP_TOKEN = 'xapp-secret-app-token'
const CHANNEL_ID = 'C012READY'
const createdRoots: string[] = []

async function markerRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'moltworker-slack-ready-'))
  createdRoots.push(root)
  return root
}

function response(payload: unknown = { ok: true }, status = 200, headers?: HeadersInit): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })
}

function dependencies(root: string, fetch = vi.fn().mockResolvedValue(response())) {
  return {
    env: {
      SLACK_BOT_TOKEN: BOT_TOKEN,
      SLACK_APP_TOKEN: APP_TOKEN,
      SLACK_READY_CHANNEL_ID: CHANNEL_ID,
    },
    fetch,
    logger: vi.fn(),
    markerRoot: root,
    now: () => READY_TIME,
    sleep: vi.fn().mockResolvedValue(undefined),
  }
}

afterEach(async () => {
  await Promise.all(createdRoots.splice(0).map((root) => rm(root, { force: true, recursive: true })))
})

describe('notifySlackReady', () => {
  it('posts one minimal ready message after gateway startup', async () => {
    const root = await markerRoot()
    const fetch = vi.fn().mockResolvedValue(response())
    const options = dependencies(root, fetch)

    await notifySlackReady({ action: 'startup', type: 'gateway' }, options)

    expect(fetch).toHaveBeenCalledOnce()
    const [url, request] = fetch.mock.calls[0]
    expect(url).toBe('https://slack.com/api/chat.postMessage')
    expect(request).toMatchObject({
      body: JSON.stringify({
        channel: CHANNEL_ID,
        text: 'OpenClaw is ready · 2026-08-29T07:00:00.000Z',
      }),
      headers: {
        Authorization: `Bearer ${BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    expect(JSON.parse(request.body)).toEqual({
      channel: CHANNEL_ID,
      text: 'OpenClaw is ready · 2026-08-29T07:00:00.000Z',
    })
    expect(request.body).not.toContain(BOT_TOKEN)
    expect(request.body).not.toContain(APP_TOKEN)
    expect(options.logger).not.toHaveBeenCalledWith(expect.stringContaining(BOT_TOKEN))
    expect(options.logger).not.toHaveBeenCalledWith(expect.stringContaining(APP_TOKEN))
    expect(await readFile(join(root, 'moltworker-slack-ready.notified'), 'utf8')).not.toContain(BOT_TOKEN)
  })

  it('ignores events other than gateway startup', async () => {
    const root = await markerRoot()
    const fetch = vi.fn().mockResolvedValue(response())

    await notifySlackReady({ action: 'shutdown', type: 'gateway' }, dependencies(root, fetch))
    await notifySlackReady({ action: 'startup', type: 'message' }, dependencies(root, fetch))

    expect(fetch).not.toHaveBeenCalled()
  })

  it('sends nothing after a successful marker exists, including concurrent starts', async () => {
    const root = await markerRoot()
    const fetch = vi.fn().mockResolvedValue(response())
    const options = dependencies(root, fetch)
    const event = { action: 'startup', type: 'gateway' }

    await Promise.all([
      notifySlackReady(event, options),
      notifySlackReady(event, options),
    ])
    await notifySlackReady(event, options)

    expect(fetch).toHaveBeenCalledOnce()
  })

  // Fails if notifySlackReady omits the marker recheck after acquiring its lock.
  it('does not post when another invocation marks success after lock acquisition', async () => {
    const root = await markerRoot()
    const marker = join(root, 'moltworker-slack-ready.notified')
    const winningLock = join(root, 'other-invocation.lock')
    const fetch = vi.fn().mockResolvedValue(response())
    let markerCreated = false
    const fs = {
      access,
      open: async (path: string, flags: string) => {
        const handle = await openFile(path, flags)
        if (flags === 'wx' && !markerCreated) {
          markerCreated = true
          const winner = await openFile(winningLock, 'wx')
          await winner.close()
          await rename(winningLock, marker)
        }
        return handle
      },
      rename,
      unlink,
    }

    await expect(notifySlackReady(
      { action: 'startup', type: 'gateway' },
      { ...dependencies(root, fetch), fs },
    )).resolves.toMatchObject({ status: 'already-notified' })

    expect(fetch).not.toHaveBeenCalled()
    await expect(readFile(join(root, 'moltworker-slack-ready.lock'))).rejects.toMatchObject({ code: 'ENOENT' })
    await expect(readFile(marker, 'utf8')).resolves.toBe('')
  })

  // Fails if the post-lock marker-check error path returns without removing its acquired lock.
  it('cleans up and recovers when the post-lock marker check has a filesystem failure', async () => {
    const root = await markerRoot()
    const lock = join(root, 'moltworker-slack-ready.lock')
    const marker = join(root, 'moltworker-slack-ready.notified')
    let markerChecks = 0
    const fs = {
      access: async (path: string) => {
        if (path === marker) {
          markerChecks += 1
          if (markerChecks === 1) {
            throw Object.assign(new Error('marker is absent'), { code: 'ENOENT' })
          }
          throw Object.assign(new Error('marker I/O failure'), { code: 'EIO' })
        }
        return access(path)
      },
      open: openFile,
      rename,
      unlink,
    }
    const event = { action: 'startup', type: 'gateway' }

    const failed = await handler(event, { ...dependencies(root), fs })
    const lockIsGone = await readFile(lock).then(() => false, (error) => error?.code === 'ENOENT')
    const markerIsAbsent = await readFile(marker).then(() => false, (error) => error?.code === 'ENOENT')
    const recoveryFetch = vi.fn().mockResolvedValue(response())
    const recovered = await handler(event, dependencies(root, recoveryFetch))

    expect(failed).toMatchObject({ category: 'filesystem', status: 'failed' })
    expect(lockIsGone).toBe(true)
    expect(markerIsAbsent).toBe(true)
    expect(recovered).toMatchObject({ status: 'notified' })
    expect(recoveryFetch).toHaveBeenCalledOnce()
  })

  it.each([
    ['', 'blank'],
    ['   ', 'whitespace-only'],
    ['c012READY', 'lowercase'],
    ['D012READY', 'direct-message'],
    ['C012-READY', 'malformed'],
  ])('does not post for a %s channel ID', async (channel, _description) => {
    const root = await markerRoot()
    const fetch = vi.fn().mockResolvedValue(response())
    const options = dependencies(root, fetch)
    options.env.SLACK_READY_CHANNEL_ID = channel

    await expect(notifySlackReady({ action: 'startup', type: 'gateway' }, options)).resolves.toMatchObject({
      status: 'disabled',
    })

    expect(fetch).not.toHaveBeenCalled()
  })

  it.each(['C012READY', 'G012READY'])('posts for a valid %s channel ID', async (channel) => {
    const root = await markerRoot()
    const fetch = vi.fn().mockResolvedValue(response())
    const options = dependencies(root, fetch)
    options.env.SLACK_READY_CHANNEL_ID = channel

    await notifySlackReady({ action: 'startup', type: 'gateway' }, options)

    expect(fetch).toHaveBeenCalledOnce()
  })

  it('uses a valid event timestamp instead of the clock', async () => {
    const root = await markerRoot()
    const fetch = vi.fn().mockResolvedValue(response())

    await notifySlackReady(
      { action: 'startup', timestamp: '2026-08-29T08:00:00.000Z', type: 'gateway' },
      dependencies(root, fetch),
    )

    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      channel: CHANNEL_ID,
      text: 'OpenClaw is ready · 2026-08-29T08:00:00.000Z',
    })
  })

  it('does not retry a Slack API failure and removes its lock', async () => {
    const root = await markerRoot()
    const fetch = vi.fn().mockResolvedValue(response({ error: 'invalid_auth', ok: false }))

    await expect(notifySlackReady({ action: 'startup', type: 'gateway' }, dependencies(root, fetch))).resolves.toMatchObject({
      status: 'failed',
    })

    expect(fetch).toHaveBeenCalledOnce()
    await expect(readFile(join(root, 'moltworker-slack-ready.lock'))).rejects.toMatchObject({ code: 'ENOENT' })
    await expect(readFile(join(root, 'moltworker-slack-ready.notified'))).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('does not retry a malformed Slack response', async () => {
    const root = await markerRoot()
    const fetch = vi.fn().mockResolvedValue(new Response('<html>bad gateway</html>', { status: 200 }))

    await expect(notifySlackReady({ action: 'startup', type: 'gateway' }, dependencies(root, fetch))).resolves.toMatchObject({
      status: 'failed',
    })

    expect(fetch).toHaveBeenCalledOnce()
  })

  it('retries network failures at most three times before succeeding', async () => {
    const root = await markerRoot()
    const fetch = vi.fn()
      .mockRejectedValueOnce(new Error('socket closed'))
      .mockRejectedValueOnce(new Error('connection reset'))
      .mockResolvedValueOnce(response())
    const options = dependencies(root, fetch)

    await expect(notifySlackReady({ action: 'startup', type: 'gateway' }, options)).resolves.toMatchObject({
      status: 'notified',
    })

    expect(fetch).toHaveBeenCalledTimes(3)
    expect(options.sleep).toHaveBeenNthCalledWith(1, 500)
    expect(options.sleep).toHaveBeenNthCalledWith(2, 1000)
  })

  it('retries 429 and caps Retry-After at two seconds', async () => {
    const root = await markerRoot()
    const fetch = vi.fn()
      .mockResolvedValueOnce(response({ ok: false }, 429, { 'Retry-After': '99' }))
      .mockResolvedValueOnce(response())
    const options = dependencies(root, fetch)

    await notifySlackReady({ action: 'startup', type: 'gateway' }, options)

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(options.sleep).toHaveBeenCalledWith(2000)
  })

  it.each([429, 500, 503])('retries transient HTTP %s failures at most three times', async (status) => {
    const root = await markerRoot()
    const fetch = vi.fn().mockResolvedValue(response({ ok: false }, status))

    await expect(notifySlackReady({ action: 'startup', type: 'gateway' }, dependencies(root, fetch))).resolves.toMatchObject({
      status: 'failed',
    })

    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it('cleans up after final failure so a later event can recover', async () => {
    const root = await markerRoot()
    const failedFetch = vi.fn().mockRejectedValue(new Error('network unavailable'))
    const recoveredFetch = vi.fn().mockResolvedValue(response())
    const event = { action: 'startup', type: 'gateway' }

    await expect(notifySlackReady(event, dependencies(root, failedFetch))).resolves.toMatchObject({ status: 'failed' })
    await expect(notifySlackReady(event, dependencies(root, recoveredFetch))).resolves.toMatchObject({ status: 'notified' })

    expect(failedFetch).toHaveBeenCalledTimes(3)
    expect(recoveredFetch).toHaveBeenCalledOnce()
  })

  it('sends once for each independent marker root', async () => {
    const firstRoot = await markerRoot()
    const secondRoot = await markerRoot()
    const fetch = vi.fn().mockImplementation(() => response())
    const event = { action: 'startup', type: 'gateway' }

    await notifySlackReady(event, dependencies(firstRoot, fetch))
    await notifySlackReady(event, dependencies(secondRoot, fetch))

    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it.each([
    ['network', vi.fn().mockRejectedValue(new Error(`network failure ${BOT_TOKEN}`))],
    ['malformed response', vi.fn().mockResolvedValue(new Response('not json', { status: 200 }))],
    ['permanent Slack failure', vi.fn().mockResolvedValue(response({ error: 'invalid_auth', ok: false }))],
  ])('default handler resolves without leaking secrets for a %s failure', async (_name, fetch) => {
    const root = await markerRoot()
    const options = dependencies(root, fetch)

    await expect(handler({ action: 'startup', type: 'gateway' }, options)).resolves.toBeDefined()

    const logText = options.logger.mock.calls.flat().join(' ')
    expect(logText).not.toContain(BOT_TOKEN)
    expect(logText).not.toContain(APP_TOKEN)
  })

  it('times out a noncooperative fetch within the injected budget', async () => {
    const root = await markerRoot()
    const fetch = vi.fn(() => new Promise(() => undefined))
    const options = { ...dependencies(root, fetch), timeoutMs: 5 }
    const budget = new Promise((_, reject) => setTimeout(() => reject(new Error('handler exceeded budget')), 100))

    await expect(Promise.race([handler({ action: 'startup', type: 'gateway' }, options), budget])).resolves.toBeDefined()
  })

  // Fails if fetchWithTimeout clears its timeout before response.json() settles.
  it('bounds noncooperative response JSON parsing within the injected attempt budget', async () => {
    const root = await markerRoot()
    const fetch = vi.fn().mockImplementation(() => ({
      headers: new Headers(),
      json: () => new Promise(() => undefined),
      ok: true,
      status: 200,
    }))
    const options = { ...dependencies(root, fetch), timeoutMs: 5 }
    const budget = new Promise((_, reject) => setTimeout(() => reject(new Error('handler exceeded JSON budget')), 100))

    await expect(Promise.race([handler({ action: 'startup', type: 'gateway' }, options), budget])).resolves.toMatchObject({
      status: 'failed',
    })

    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it('default handler resolves after a filesystem failure', async () => {
    const root = await markerRoot()
    const blockedRoot = join(root, 'missing', 'markers')
    const options = dependencies(blockedRoot)

    await expect(handler({ action: 'startup', type: 'gateway' }, options)).resolves.toBeDefined()

    const logText = options.logger.mock.calls.flat().join(' ')
    expect(logText).not.toContain(BOT_TOKEN)
    expect(logText).not.toContain(APP_TOKEN)
  })
})
