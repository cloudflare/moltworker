import { describe, expect, it, vi } from 'vitest';
import { cloudflareDnsResolver, validatePublicUrl } from './url-policy';

const neverCalledResolver = async (): Promise<string[]> => {
  throw new Error('resolver should not be called');
};

const abortingResolver = async (): Promise<string[]> => {
  const error = new Error('deadline exceeded');
  error.name = 'AbortError';
  throw error;
};

function requestSignal(): AbortSignal {
  return new AbortController().signal;
}

describe('validatePublicUrl', () => {
  it.each(['localhost', 'intranet', 'printer.local'])(
    'rejects internal hostname %s',
    async (hostname) => {
      await expect(
        validatePublicUrl(`https://${hostname}/`, neverCalledResolver, requestSignal()),
      ).rejects.toMatchObject({ category: 'blocked' });
    },
  );

  it.each([
    'https://user:pass@example.com/',
    'https://example.com/#fragment',
    'https://example.com:444/',
    'ftp://example.com/',
  ])('rejects malformed or unsupported URL %s', async (url) => {
    await expect(
      validatePublicUrl(url, neverCalledResolver, requestSignal()),
    ).rejects.toMatchObject({
      category: 'blocked',
    });
  });

  it.each([
    '127.0.0.1',
    '10.42.0.1',
    '100.64.0.1',
    '169.254.169.254',
    '172.16.0.1',
    '192.0.2.1',
    '192.168.1.1',
    '198.18.0.1',
    '203.0.113.1',
    '224.0.0.1',
    '240.0.0.1',
    '0.0.0.0',
  ])('rejects denied IPv4 destination %s', async (address) => {
    await expect(
      validatePublicUrl(`https://${address}/`, neverCalledResolver, requestSignal()),
    ).rejects.toMatchObject({ category: 'blocked' });
  });

  it.each([
    '::',
    '::1',
    '::ffff:127.0.0.1',
    'fc00::1',
    'fe80::1',
    'ff02::1',
    '2001:db8::1',
    '2001:2::1',
    '2001:3::1',
    '2001:4:112::1',
    '2001:30::1',
    '64:ff9b:1::1',
    '100:0:0:1::1',
  ])('rejects denied IPv6 destination %s', async (address) => {
    await expect(
      validatePublicUrl(`https://[${address}]/`, neverCalledResolver, requestSignal()),
    ).rejects.toMatchObject({ category: 'blocked' });
  });

  it('accepts a public IPv4 control without DNS resolution', async () => {
    await expect(
      validatePublicUrl('https://93.184.216.34/', neverCalledResolver, requestSignal()),
    ).resolves.toEqual(new URL('https://93.184.216.34/'));
  });

  it('accepts a public IPv4-mapped IPv6 destination', async () => {
    await expect(
      validatePublicUrl('https://[::ffff:93.184.216.34]/', neverCalledResolver, requestSignal()),
    ).resolves.toEqual(new URL('https://[::ffff:93.184.216.34]/'));
  });

  it.each(['::ffff:10.0.0.1', '::ffff:169.254.169.254'])(
    'rejects a private or metadata IPv4-mapped IPv6 destination %s',
    async (address) => {
      await expect(
        validatePublicUrl(`https://[${address}]/`, neverCalledResolver, requestSignal()),
      ).rejects.toMatchObject({ category: 'blocked' });
    },
  );

  it('accepts a hostname when all DNS answers are public', async () => {
    const resolvedHostnames: string[] = [];
    const resolver = async (hostname: string): Promise<string[]> => {
      resolvedHostnames.push(hostname);
      return ['93.184.216.34', '2606:4700:4700::1111'];
    };

    await expect(
      validatePublicUrl('https://example.com/path', resolver, requestSignal()),
    ).resolves.toEqual(new URL('https://example.com/path'));
    expect(resolvedHostnames).toEqual(['example.com']);
  });

  it('rejects a hostname with no DNS answers as dns_error', async () => {
    await expect(
      validatePublicUrl('https://missing.example', async () => [], requestSignal()),
    ).rejects.toMatchObject({ category: 'dns_error' });
  });

  it('rejects mixed public and private DNS answers as blocked', async () => {
    await expect(
      validatePublicUrl(
        'https://mixed.example',
        async () => ['93.184.216.34', '10.0.0.8'],
        requestSignal(),
      ),
    ).rejects.toMatchObject({ category: 'blocked' });
  });

  it('classifies resolver failure as dns_error', async () => {
    await expect(
      validatePublicUrl(
        'https://failure.example',
        async () => {
          throw new Error('resolver unavailable');
        },
        requestSignal(),
      ),
    ).rejects.toMatchObject({ category: 'dns_error' });
  });

  it('classifies an abort/deadline as timeout', async () => {
    await expect(
      validatePublicUrl('https://slow.example', abortingResolver, requestSignal()),
    ).rejects.toMatchObject({ category: 'timeout' });
  });

  it('classifies an already-aborted signal as timeout', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      validatePublicUrl('https://aborted.example', neverCalledResolver, controller.signal),
    ).rejects.toMatchObject({ category: 'timeout' });
  });

  it('filters CNAME records while retaining public terminal A and AAAA answers', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const isA = url.endsWith('type=A');
      const answer = isA
        ? [
            { type: 5, data: 'alias.example.' },
            { type: 1, data: '93.184.216.34' },
          ]
        : [
            { type: 5, data: 'alias.example.' },
            { type: 28, data: '2606:4700:4700::1111' },
          ];
      return new Response(JSON.stringify({ Status: 0, Answer: answer }), {
        status: 200,
        headers: { 'content-type': 'application/dns-json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    try {
      await expect(
        validatePublicUrl('https://alias-target.example/', cloudflareDnsResolver, requestSignal()),
      ).resolves.toEqual(new URL('https://alias-target.example/'));
    } finally {
      vi.unstubAllGlobals();
    }

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
