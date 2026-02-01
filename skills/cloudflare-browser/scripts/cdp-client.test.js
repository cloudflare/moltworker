import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';

// Mock WebSocket before requiring the module
class MockWebSocket extends EventEmitter {
  constructor(url) {
    super();
    this.url = url;
    this.readyState = 0; // CONNECTING
    this.CONNECTING = 0;
    this.OPEN = 1;
    this.CLOSING = 2;
    this.CLOSED = 3;

    // Simulate connection
    setTimeout(() => {
      this.readyState = 1; // OPEN
      this.emit('open');

      // Simulate target creation
      setTimeout(() => {
        const msg = {
          method: 'Target.targetCreated',
          params: {
            targetInfo: {
              type: 'page',
              targetId: 'mock-target-id-123',
            },
          },
        };
        this.emit('message', JSON.stringify(msg));
      }, 10);
    }, 10);
  }

  send(data) {
    if (this.readyState !== 1) {
      throw new Error('WebSocket is not open');
    }

    // Parse and auto-respond to CDP commands
    const msg = JSON.parse(data);
    setTimeout(() => {
      const response = { id: msg.id, result: {} };

      // Simulate specific responses
      if (msg.method === 'Page.captureScreenshot') {
        response.result = { data: Buffer.from('fake-image').toString('base64') };
      } else if (msg.method === 'Runtime.evaluate') {
        response.result = { result: { value: 'mock-result' } };
      }

      this.emit('message', JSON.stringify(response));
    }, 10);
  }

  close() {
    this.readyState = 2; // CLOSING
    setTimeout(() => {
      this.readyState = 3; // CLOSED
      this.emit('close');
    }, 10);
  }
}

vi.mock('ws', () => ({
  default: MockWebSocket,
}));

describe('cdp-client.js', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    process.env.CDP_SECRET = 'test-secret';
    process.env.WORKER_URL = 'https://test-worker.example.com';
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('throws error when CDP_SECRET is not set', async () => {
    delete process.env.CDP_SECRET;

    const { createClient } = await import('./cdp-client.js');

    await expect(createClient()).rejects.toThrow('CDP_SECRET');
  });

  it('creates client successfully', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    expect(client).toHaveProperty('ws');
    expect(client).toHaveProperty('targetId');
    expect(client).toHaveProperty('send');
    expect(client).toHaveProperty('navigate');
    expect(client).toHaveProperty('screenshot');
    expect(client).toHaveProperty('setViewport');
    expect(client).toHaveProperty('evaluate');
    expect(client).toHaveProperty('scroll');
    expect(client).toHaveProperty('click');
    expect(client).toHaveProperty('type');
    expect(client).toHaveProperty('getHTML');
    expect(client).toHaveProperty('getText');
    expect(client).toHaveProperty('close');
  });

  it('accepts custom options', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient({
      secret: 'custom-secret',
      workerUrl: 'https://custom-worker.example.com',
      timeout: 30000,
    });

    expect(client).toBeDefined();
  });

  it('creates WebSocket with correct URL', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    expect(client.ws.url).toContain('wss://');
    expect(client.ws.url).toContain('test-worker.example.com');
    expect(client.ws.url).toContain('cdp');
    expect(client.ws.url).toContain('secret=');
  });

  it('has valid targetId after connection', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    expect(client.targetId).toBe('mock-target-id-123');
  });

  it('navigate method works', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    await expect(client.navigate('https://example.com', 100)).resolves.toBeUndefined();
  });

  it('screenshot method returns buffer', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    const screenshot = await client.screenshot();

    expect(Buffer.isBuffer(screenshot)).toBe(true);
  });

  it('screenshot accepts format parameter', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    const screenshot = await client.screenshot('jpeg');

    expect(Buffer.isBuffer(screenshot)).toBe(true);
  });

  it('setViewport method works', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    await expect(client.setViewport(1920, 1080, 2, true)).resolves.toBeUndefined();
  });

  it('evaluate method works', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    const result = await client.evaluate('2 + 2');

    expect(result).toBeDefined();
  });

  it('scroll method works', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    await expect(client.scroll(500)).resolves.toBeUndefined();
  });

  it('click method works', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    await expect(client.click('#button')).resolves.toBeUndefined();
  });

  it('type method works', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    await expect(client.type('#input', 'test text')).resolves.toBeUndefined();
  });

  it('getHTML method returns string', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    const html = await client.getHTML();

    expect(typeof html).toBe('string');
  });

  it('getText method returns string', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    const text = await client.getText();

    expect(typeof text).toBe('string');
  });

  it('close method works', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    expect(() => client.close()).not.toThrow();
  });

  it('send method with no params', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    const result = await client.send('Page.enable');

    expect(result).toBeDefined();
  });

  it('send method with params', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    const result = await client.send('Page.navigate', { url: 'https://example.com' });

    expect(result).toBeDefined();
  });

  it('handles WORKER_URL with http://', async () => {
    process.env.WORKER_URL = 'http://test-worker.example.com';

    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    expect(client.ws.url).toContain('wss://');
    expect(client.ws.url).not.toContain('http://');
  });

  it('handles WORKER_URL with https://', async () => {
    process.env.WORKER_URL = 'https://test-worker.example.com';

    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    expect(client.ws.url).toContain('wss://');
    expect(client.ws.url).not.toContain('https://');
  });

  it('uses default timeout when not specified', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    expect(client).toBeDefined();
  });

  it('navigate with custom wait time', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    const start = Date.now();
    await client.navigate('https://example.com', 200);
    const duration = Date.now() - start;

    expect(duration).toBeGreaterThanOrEqual(200);
  });

  it('scroll with default distance', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    await expect(client.scroll()).resolves.toBeUndefined();
  });

  it('setViewport with default values', async () => {
    const { createClient } = await import('./cdp-client.js');

    const client = await createClient();

    await expect(client.setViewport()).resolves.toBeUndefined();
  });
});