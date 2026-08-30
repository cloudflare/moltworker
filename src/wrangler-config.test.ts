import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const wranglerConfigPath = resolve(process.cwd(), 'wrangler.jsonc');

describe('wrangler configuration', () => {
  it('does not configure autonomous cron triggers', () => {
    const wranglerConfig = readFileSync(wranglerConfigPath, 'utf8');

    expect(wranglerConfig).not.toMatch(/"triggers"\s*:/);
    expect(wranglerConfig).not.toMatch(/"crons"\s*:/);
  });
});
