import type { Page } from '@cloudflare/puppeteer';
import { describe, expect, it, vi } from 'vitest';
import { extractRenderedContent } from './extract';

type EvaluatedContent =
  | string
  | {
      title: string;
      headings: Array<{ level: number; text: string }>;
      landmarks: Array<{ role: string; text: string }>;
      links: Array<{ text: string; href: string }>;
      text: string;
    };

function pageReturning(value: EvaluatedContent): Page {
  return {
    evaluate: vi.fn().mockResolvedValue(value),
  } as unknown as Page;
}

interface FakeElement {
  nodeType: number;
  tagName: string;
  childNodes: FakeNode[];
  children: FakeElement[];
  parentElement: FakeElement | null;
  attributes: Map<string, string>;
  textContent: string;
  hasAttribute(name: string): boolean;
  getAttribute(name: string): string | null;
  querySelector(selector: string): FakeElement | null;
}

type FakeNode = FakeElement | { nodeType: number; textContent: string };

function text(value: string): FakeNode {
  return { nodeType: 3, textContent: value };
}

function element(
  tagName: string,
  children: FakeNode[] = [],
  attributes: Record<string, string> = {},
): FakeElement {
  const node: FakeElement = {
    nodeType: 1,
    tagName,
    childNodes: children,
    children: children.filter((child): child is FakeElement => child.nodeType === 1),
    parentElement: null,
    attributes: new Map(Object.entries(attributes)),
    textContent: '',
    hasAttribute(name: string): boolean {
      return this.attributes.has(name);
    },
    getAttribute(name: string): string | null {
      return this.attributes.get(name) ?? null;
    },
    querySelector(selector: string): FakeElement | null {
      return this.children.find((child) => child.tagName === selector.toUpperCase()) ?? null;
    },
  };
  for (const child of node.children) child.parentElement = node;
  return node;
}

function allElements(node: FakeNode): FakeElement[] {
  return 'children' in node ? [node, ...node.children.flatMap(allElements)] : [];
}

function pageEvaluatingDom(body: FakeElement): Page {
  vi.stubGlobal('Node', { TEXT_NODE: 3, ELEMENT_NODE: 1 });
  vi.stubGlobal('document', {
    body,
    title: 'Example',
    querySelectorAll: (): FakeElement[] => allElements(body).slice(1),
  });
  vi.stubGlobal('getComputedStyle', (node: FakeElement) => ({
    display: node.getAttribute('data-display') ?? 'block',
    visibility: node.getAttribute('data-visibility') ?? 'visible',
  }));
  return {
    evaluate: vi.fn(async (callback: (...args: never[]) => unknown, ...args: never[]) =>
      callback(...args),
    ),
  } as unknown as Page;
}

describe('extractRenderedContent', () => {
  it('normalizes rendered text and truncates it deterministically', async () => {
    const page = pageReturning('  Welcome\n\n\n  to   the\tweb  ');

    await expect(extractRenderedContent(page, 'text', 14)).resolves.toEqual({
      mode: 'text',
      content: 'Welcome\n\nto th',
      length: 14,
      truncated: true,
    });
    expect(page.evaluate).toHaveBeenCalledTimes(1);
  });

  it('preserves rendered Markdown structure while excluding unsafe page content', async () => {
    const page = pageReturning(
      '# Guide\n\n- first item\n- second item\n\n[Read more](https://example.com/docs)\n\n| Name | Value |\n| --- | --- |\n| safe | yes |',
    );

    await expect(extractRenderedContent(page, 'markdown', 500)).resolves.toEqual({
      mode: 'markdown',
      content:
        '# Guide\n\n- first item\n- second item\n\n[Read more](https://example.com/docs)\n\n| Name | Value |\n| --- | --- |\n| safe | yes |',
      length: 121,
      truncated: false,
    });
    expect(page.evaluate).toHaveBeenCalledTimes(1);
  });

  it('returns semantic snapshot fields and measures its canonical JSON representation', async () => {
    const page = pageReturning({
      title: '  Example  ',
      headings: [{ level: 1, text: '  Intro\n' }],
      landmarks: [{ role: 'main', text: ' Main   text ' }],
      links: [{ text: ' Docs ', href: 'https://example.com/docs' }],
      text: ' Example\n\n content ',
    });
    const content = {
      title: 'Example',
      headings: [{ level: 1, text: 'Intro' }],
      landmarks: [{ role: 'main', text: 'Main text' }],
      links: [{ text: 'Docs', href: 'https://example.com/docs' }],
      text: 'Example\n\ncontent',
    };

    await expect(extractRenderedContent(page, 'snapshot', 500)).resolves.toEqual({
      mode: 'snapshot',
      content,
      length: JSON.stringify(content).length,
      truncated: false,
    });
    expect(page.evaluate).toHaveBeenCalledTimes(1);
  });

  it('truncates the complete semantic snapshot before calculating its canonical content length', async () => {
    const page = pageReturning({
      title: 'Example',
      headings: [],
      landmarks: [],
      links: [],
      text: 'abcdefghijklmnop',
    });
    const content = {
      title: '',
      headings: [],
      landmarks: [],
      links: [],
      text: '',
    };

    await expect(extractRenderedContent(page, 'snapshot', 62)).resolves.toEqual({
      mode: 'snapshot',
      content,
      length: JSON.stringify(content).length,
      truncated: true,
    });
  });

  it('keeps the complete serialized snapshot within the output budget when a page has many links', async () => {
    const page = pageReturning({
      title: 'Example',
      headings: [{ level: 1, text: 'Heading' }],
      landmarks: [{ role: 'main', text: 'Landmark' }],
      links: Array.from({ length: 50 }, (_, index) => ({
        text: `Link ${index}`,
        href: `https://example.com/path/${index}`,
      })),
      text: 'Rendered text',
    });

    const result = await extractRenderedContent(page, 'snapshot', 200);

    expect(result.mode).toBe('snapshot');
    expect(result.truncated).toBe(true);
    expect(result.length).toBeLessThanOrEqual(200);
    expect(JSON.stringify(result.content).length).toBeLessThanOrEqual(200);
  });

  it('rejects a snapshot budget that cannot contain its required semantic shape', async () => {
    await expect(
      extractRenderedContent(
        pageReturning({ title: '', headings: [], landmarks: [], links: [], text: '' }),
        'snapshot',
        61,
      ),
    ).rejects.toThrow('Semantic snapshot budget is too small');
  });

  it('executes the DOM walker without exposing hidden descendants or link credentials', async () => {
    const privateLink = element('A', [text('Private')], {
      href: 'https://user:password@example.com/private',
    });
    Object.assign(privateLink, { href: 'https://user:password@example.com/private' });
    const publicLink = element('A', [text('Public')], { href: 'https://example.com/public' });
    Object.assign(publicLink, { href: 'https://example.com/public' });
    const page = pageEvaluatingDom(
      element('BODY', [
        element('DIV', [element('H1', [text('Secret')])], { hidden: '' }),
        element('MAIN', [element('H1', [text('Visible')]), privateLink, publicLink]),
      ]),
    );

    await expect(extractRenderedContent(page, 'snapshot', 500)).resolves.toMatchObject({
      content: {
        headings: [{ level: 1, text: 'Visible' }],
        links: [{ text: 'Public', href: 'https://example.com/public' }],
        text: 'VisiblePrivatePublic',
      },
    });
    await expect(extractRenderedContent(page, 'markdown', 500)).resolves.toMatchObject({
      content: '# Visible\n\nPrivate[Public](https://example.com/public)',
    });
    vi.unstubAllGlobals();
  });

  it('excludes descendants of CSS-hidden ancestors in the executed DOM walker', async () => {
    const page = pageEvaluatingDom(
      element('BODY', [
        element('DIV', [element('H1', [text('Display secret')])], { 'data-display': 'none' }),
        element('DIV', [element('H2', [text('Visibility secret')])], {
          'data-visibility': 'hidden',
        }),
        element('MAIN', [element('H1', [text('Visible')])]),
      ]),
    );

    await expect(extractRenderedContent(page, 'snapshot', 500)).resolves.toMatchObject({
      content: {
        headings: [{ level: 1, text: 'Visible' }],
        text: 'Visible',
      },
    });
    vi.unstubAllGlobals();
  });
});
