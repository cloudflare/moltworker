import { isIP } from 'node:net';
import { BrowserFetchRequestError, type BrowserFetchErrorCategory } from './contracts';

export type DnsResolver = (hostname: string, signal: AbortSignal) => Promise<string[]>;

const CLOUDFLARE_DNS_ENDPOINT = 'https://cloudflare-dns.com/dns-query';

const deniedIpv4Cidrs: ReadonlyArray<readonly [string, number]> = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
];

const deniedIpv6Cidrs: ReadonlyArray<readonly [string, number]> = [
  ['::', 96],
  ['::1', 128],
  ['::ffff:0:0', 96],
  ['100::', 64],
  ['100:0:0:1::', 64],
  ['64:ff9b::', 96],
  ['64:ff9b:1::', 48],
  ['2001::', 32],
  ['2001:1::', 48],
  ['2001:2::', 48],
  ['2001:3::', 32],
  ['2001:4:112::', 48],
  ['2001:10::', 28],
  ['2001:20::', 28],
  ['2001:30::', 28],
  ['2001:db8::', 32],
  ['2002::', 16],
  ['3ffe::', 16],
  ['3fff::', 20],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
];

function policyError(
  category: BrowserFetchErrorCategory,
  message: string,
): BrowserFetchRequestError {
  const status = category === 'timeout' ? 504 : category === 'dns_error' ? 502 : 403;
  return new BrowserFetchRequestError(status, category, message);
}

function parseIpv4(address: string): number | undefined {
  const parts = address.split('.');
  if (parts.length !== 4) return undefined;

  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return undefined;
    const octet = Number(part);
    if (octet > 255) return undefined;
    value = value * 256 + octet;
  }
  return value;
}

function parseIpv6(address: string): bigint | undefined {
  let value = address.toLowerCase();
  if (value.includes('.')) {
    const separator = value.lastIndexOf(':');
    if (separator < 0) return undefined;
    const ipv4 = parseIpv4(value.slice(separator + 1));
    if (ipv4 === undefined) return undefined;
    const high = ((ipv4 >>> 16) & 0xffff).toString(16);
    const low = (ipv4 & 0xffff).toString(16);
    value = `${value.slice(0, separator)}:${high}:${low}`;
  }

  const halves = value.split('::');
  if (halves.length > 2) return undefined;
  const left = halves[0] === '' ? [] : halves[0].split(':');
  const right = halves.length === 2 && halves[1] !== '' ? halves[1].split(':') : [];
  if (left.some((part) => !/^[0-9a-f]{1,4}$/.test(part))) return undefined;
  if (right.some((part) => !/^[0-9a-f]{1,4}$/.test(part))) return undefined;

  const groups =
    halves.length === 2
      ? [...left, ...Array(8 - left.length - right.length).fill('0'), ...right]
      : [...left];
  if (groups.length !== 8) return undefined;

  let result = 0n;
  for (const group of groups) {
    result = (result << 16n) | BigInt(Number.parseInt(group, 16));
  }
  return result;
}

function parseAddress(address: string): { version: 4 | 6; value: bigint } | undefined {
  const version = isIP(address);
  if (version === 4) {
    const value = parseIpv4(address);
    return value === undefined ? undefined : { version: 4, value: BigInt(value) };
  }
  if (version === 6) {
    const value = parseIpv6(address);
    return value === undefined ? undefined : { version: 6, value };
  }
  return undefined;
}

function cidrContains(
  value: bigint,
  network: bigint,
  prefixLength: number,
  bitLength: number,
): boolean {
  if (prefixLength === 0) return true;
  const shift = BigInt(bitLength - prefixLength);
  return value >> shift === network >> shift;
}

function ipv4ToBigInt(address: string): bigint {
  const value = parseIpv4(address);
  return BigInt(value ?? 0);
}

function isDeniedIpv4Value(value: bigint): boolean {
  return deniedIpv4Cidrs.some(([network, prefix]) =>
    cidrContains(value, ipv4ToBigInt(network), prefix, 32),
  );
}

function isDeniedAddress(address: string): boolean {
  const parsed = parseAddress(address);
  if (parsed === undefined) return true;

  if (parsed.version === 4) {
    return isDeniedIpv4Value(parsed.value);
  }

  // IPv4-mapped IPv6 addresses must receive the same policy as their embedded IPv4 value.
  // The mapped prefix remains reserved; only the embedded public IPv4 value may pass.
  if (parsed.value >> 32n === 0xffffn) {
    return isDeniedIpv4Value(parsed.value & 0xffffffffn);
  }

  return deniedIpv6Cidrs.some(([network, prefix]) =>
    cidrContains(parsed.value, parseIpv6(network) ?? 0n, prefix, 128),
  );
}

function isAbortOrDeadline(error: unknown, signal: AbortSignal): boolean {
  if (signal.aborted) return true;
  if (!(error instanceof Error)) return false;
  return error.name === 'AbortError' || error.name === 'TimeoutError';
}

function parseTargetUrl(rawUrl: string): URL {
  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    throw policyError('blocked', 'The URL is not allowed');
  }

  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    throw policyError('blocked', 'The URL is not allowed');
  }
  if (target.username !== '' || target.password !== '') {
    throw policyError('blocked', 'The URL is not allowed');
  }
  if (target.hash !== '') {
    throw policyError('blocked', 'The URL is not allowed');
  }
  if (target.port !== '' && target.port !== '80' && target.port !== '443') {
    throw policyError('blocked', 'The URL is not allowed');
  }
  return target;
}

function hostnameForPolicy(target: URL): string {
  return target.hostname.replace(/^\[|\]$/g, '').toLowerCase();
}

export const cloudflareDnsResolver: DnsResolver = async (hostname, signal) => {
  const answers = await Promise.all(
    (['A', 'AAAA'] as const).map(async (type) => {
      const endpoint = `${CLOUDFLARE_DNS_ENDPOINT}?name=${encodeURIComponent(hostname)}&type=${type}`;
      const response = await fetch(endpoint, {
        headers: { accept: 'application/dns-json' },
        signal,
      });
      if (!response.ok) {
        throw new Error('DNS request failed');
      }

      const payload: unknown = await response.json();
      if (payload === null || typeof payload !== 'object') {
        throw new Error('DNS response was invalid');
      }
      const record = payload as { Status?: unknown; Answer?: unknown };
      if (record.Status !== 0) {
        throw new Error('DNS response returned an error');
      }

      if (!Array.isArray(record.Answer)) return [];
      return record.Answer.flatMap((answer) => {
        if (answer === null || typeof answer !== 'object') return [];
        const dnsAnswer = answer as { type?: unknown; data?: unknown };
        if (dnsAnswer.type !== (type === 'A' ? 1 : 28)) return [];
        const data = dnsAnswer.data;
        return typeof data === 'string' ? [data] : [];
      });
    }),
  );
  return answers.flat();
};

export const defaultDnsResolver = cloudflareDnsResolver;

export async function validatePublicUrl(
  rawUrl: string,
  resolver: DnsResolver,
  signal: AbortSignal,
): Promise<URL> {
  if (signal.aborted) {
    throw policyError('timeout', 'URL validation timed out');
  }

  const target = parseTargetUrl(rawUrl);
  const hostname = hostnameForPolicy(target);
  const parsedAddress = parseAddress(hostname);
  if (parsedAddress !== undefined) {
    if (isDeniedAddress(hostname)) {
      throw policyError('blocked', 'The URL target is not public');
    }
    return target;
  }

  const canonicalHostname = hostname.replace(/\.$/, '');
  if (
    canonicalHostname === 'localhost' ||
    !canonicalHostname.includes('.') ||
    canonicalHostname.endsWith('.local')
  ) {
    throw policyError('blocked', 'The hostname is not public');
  }

  let addresses: string[];
  try {
    addresses = await resolver(hostname, signal);
  } catch (error) {
    if (isAbortOrDeadline(error, signal)) {
      throw policyError('timeout', 'URL validation timed out');
    }
    throw policyError('dns_error', 'The hostname could not be resolved');
  }

  if (signal.aborted) {
    throw policyError('timeout', 'URL validation timed out');
  }
  if (!Array.isArray(addresses) || addresses.length === 0) {
    throw policyError('dns_error', 'The hostname could not be resolved');
  }

  let hasPublicAddress = false;
  for (const address of addresses) {
    const parsed = parseAddress(address);
    if (parsed === undefined) {
      throw policyError('dns_error', 'The hostname could not be resolved');
    }
    if (isDeniedAddress(address)) {
      throw policyError('blocked', 'The hostname resolves to a non-public address');
    }
    hasPublicAddress = true;
  }

  if (!hasPublicAddress) {
    throw policyError('dns_error', 'The hostname could not be resolved');
  }
  return target;
}
