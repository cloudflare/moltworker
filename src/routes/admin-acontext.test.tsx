import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AcontextSessionsSection, formatAcontextAge, truncateAcontextPrompt } from '../client/pages/AdminPage';

describe('AcontextSessionsSection', () => {
  it('renders session row with dashboard link', () => {
    const html = renderToStaticMarkup(
      <AcontextSessionsSection
        loading={false}
        data={{
          configured: true,
          items: [{
            id: 'sess_abc',
            model: 'openai/gpt-4.1',
            prompt: 'Build a deployment checklist for the migration',
            toolsUsed: 3,
            success: true,
            createdAt: '2026-02-20T09:00:00.000Z',
          }],
        }}
      />
    );

    expect(html).toContain('Acontext Sessions');
    expect(html).toContain('openai/gpt-4.1');
    expect(html).toContain('3 tools');
    expect(html).toContain('https://platform.acontext.com/sessions/sess_abc');
  });

  it('renders unconfigured hint', () => {
    const html = renderToStaticMarkup(
      <AcontextSessionsSection loading={false} data={{ configured: false, items: [] }} />
    );

    expect(html).toContain('Acontext not configured');
  });

  it('renders loading state', () => {
    const html = renderToStaticMarkup(
      <AcontextSessionsSection loading={true} data={null} />
    );

    expect(html).toContain('Loading recent sessions');
  });

  it('renders empty state when configured with no sessions', () => {
    const html = renderToStaticMarkup(
      <AcontextSessionsSection loading={false} data={{ configured: true, items: [] }} />
    );

    expect(html).toContain('No recent sessions found');
  });
});

describe('formatAcontextAge', () => {
  const now = Date.parse('2026-02-20T12:00:00.000Z');

  it('formats seconds', () => {
    expect(formatAcontextAge('2026-02-20T11:59:30.000Z', now)).toBe('30s ago');
  });

  it('formats minutes', () => {
    expect(formatAcontextAge('2026-02-20T11:58:00.000Z', now)).toBe('2m ago');
  });

  it('formats hours', () => {
    expect(formatAcontextAge('2026-02-20T09:00:00.000Z', now)).toBe('3h ago');
  });

  it('formats days', () => {
    expect(formatAcontextAge('2026-02-18T12:00:00.000Z', now)).toBe('2d ago');
  });

  it('returns Unknown for invalid date', () => {
    expect(formatAcontextAge('not-a-date', now)).toBe('Unknown');
  });
});

describe('truncateAcontextPrompt', () => {
  it('returns short prompts unchanged', () => {
    expect(truncateAcontextPrompt('Hello world')).toBe('Hello world');
  });

  it('truncates long prompts with ellipsis', () => {
    const long = 'a'.repeat(80);
    const result = truncateAcontextPrompt(long, 60);
    expect(result).toHaveLength(60);
    expect(result.endsWith('…')).toBe(true);
  });
});
