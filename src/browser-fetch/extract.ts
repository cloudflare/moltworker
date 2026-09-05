import type { Page } from '@cloudflare/puppeteer';
import {
  MIN_SEMANTIC_SNAPSHOT_CHARS,
  type BrowserFetchMode,
  type SemanticSnapshot,
} from './contracts';

export type ExtractedContent =
  | { mode: 'text' | 'markdown'; content: string; length: number; truncated: boolean }
  | { mode: 'snapshot'; content: SemanticSnapshot; length: number; truncated: boolean };

type EvaluatedContent = string | SemanticSnapshot;

function normalizeText(value: string): string {
  return value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t\f\v]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function truncate(value: string, maxChars: number): { content: string; truncated: boolean } {
  return value.length > maxChars
    ? { content: value.slice(0, maxChars), truncated: true }
    : { content: value, truncated: false };
}

function normalizeSnapshot(snapshot: SemanticSnapshot): SemanticSnapshot {
  return {
    title: normalizeText(snapshot.title),
    headings: snapshot.headings.map((heading) => ({
      level: heading.level,
      text: normalizeText(heading.text),
    })),
    landmarks: snapshot.landmarks.map((landmark) => ({
      role: landmark.role,
      text: normalizeText(landmark.text),
    })),
    links: snapshot.links.map((link) => ({
      text: normalizeText(link.text),
      href: link.href,
    })),
    text: normalizeText(snapshot.text),
  };
}

function serializedSnapshotLength(snapshot: SemanticSnapshot): number {
  return JSON.stringify(snapshot).length;
}

function truncateSnapshotText(
  snapshot: SemanticSnapshot,
  setValue: (value: string) => void,
  value: string,
  maxChars: number,
): boolean {
  if (value === '') return false;
  setValue(value);
  if (serializedSnapshotLength(snapshot) <= maxChars) return false;

  let low = 0;
  let high = value.length;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    setValue(value.slice(0, middle));
    if (serializedSnapshotLength(snapshot) <= maxChars) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }
  setValue(value.slice(0, low));
  return low !== value.length;
}

/** Preserves semantic fields in a stable order while enforcing the total JSON budget. */
function truncateSnapshot(
  snapshot: SemanticSnapshot,
  maxChars: number,
): {
  content: SemanticSnapshot;
  truncated: boolean;
} {
  const bounded: SemanticSnapshot = {
    title: '',
    headings: [],
    landmarks: [],
    links: [],
    text: '',
  };
  let truncated = false;

  truncated =
    truncateSnapshotText(
      bounded,
      (value) => {
        bounded.title = value;
      },
      snapshot.title,
      maxChars,
    ) || truncated;

  for (const heading of snapshot.headings) {
    const entry = { level: heading.level, text: '' };
    bounded.headings.push(entry);
    if (serializedSnapshotLength(bounded) > maxChars) {
      bounded.headings.pop();
      truncated = true;
      break;
    }
    truncated =
      truncateSnapshotText(
        bounded,
        (value) => {
          entry.text = value;
        },
        heading.text,
        maxChars,
      ) || truncated;
    if (entry.text !== heading.text) break;
  }
  if (bounded.headings.length !== snapshot.headings.length) truncated = true;

  for (const landmark of snapshot.landmarks) {
    const entry = { role: '', text: '' };
    bounded.landmarks.push(entry);
    if (serializedSnapshotLength(bounded) > maxChars) {
      bounded.landmarks.pop();
      truncated = true;
      break;
    }
    truncated =
      truncateSnapshotText(
        bounded,
        (value) => {
          entry.role = value;
        },
        landmark.role,
        maxChars,
      ) || truncated;
    if (entry.role !== landmark.role) break;
    truncated =
      truncateSnapshotText(
        bounded,
        (value) => {
          entry.text = value;
        },
        landmark.text,
        maxChars,
      ) || truncated;
    if (entry.text !== landmark.text) break;
  }
  if (bounded.landmarks.length !== snapshot.landmarks.length) truncated = true;

  for (const link of snapshot.links) {
    const entry = { text: '', href: '' };
    bounded.links.push(entry);
    if (serializedSnapshotLength(bounded) > maxChars) {
      bounded.links.pop();
      truncated = true;
      break;
    }
    truncated =
      truncateSnapshotText(
        bounded,
        (value) => {
          entry.text = value;
        },
        link.text,
        maxChars,
      ) || truncated;
    if (entry.text !== link.text) break;
    truncated =
      truncateSnapshotText(
        bounded,
        (value) => {
          entry.href = value;
        },
        link.href,
        maxChars,
      ) || truncated;
    if (entry.href !== link.href) break;
  }
  if (bounded.links.length !== snapshot.links.length) truncated = true;

  truncated =
    truncateSnapshotText(
      bounded,
      (value) => {
        bounded.text = value;
      },
      snapshot.text,
      maxChars,
    ) || truncated;

  return { content: bounded, truncated };
}

async function evaluateRenderedContent(
  page: Page,
  mode: BrowserFetchMode,
): Promise<EvaluatedContent> {
  return page.evaluate((selectedMode: BrowserFetchMode) => {
    const excludedTags = new Set([
      'SCRIPT',
      'STYLE',
      'NOSCRIPT',
      'TEMPLATE',
      'FORM',
      'INPUT',
      'SELECT',
      'TEXTAREA',
      'BUTTON',
      'OPTION',
    ]);
    const blockTags = new Set([
      'ADDRESS',
      'ARTICLE',
      'ASIDE',
      'BLOCKQUOTE',
      'DIV',
      'DL',
      'FIELDSET',
      'FIGCAPTION',
      'FIGURE',
      'FOOTER',
      'HEADER',
      'MAIN',
      'NAV',
      'OL',
      'P',
      'SECTION',
      'TABLE',
      'UL',
    ]);

    const isVisible = (element: Element): boolean => {
      for (
        let current: Element | null = element;
        current !== null;
        current = current.parentElement
      ) {
        if (
          excludedTags.has(current.tagName) ||
          current.hasAttribute('hidden') ||
          current.getAttribute('aria-hidden') === 'true'
        ) {
          return false;
        }
        const style = getComputedStyle(current);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return false;
        }
      }
      return true;
    };

    const textFrom = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
      if (node.nodeType !== Node.ELEMENT_NODE || !isVisible(node as Element)) return '';
      return Array.from(node.childNodes, textFrom).join('');
    };

    // eslint-disable-next-line unicorn/consistent-function-scoping -- This helper must remain in the serialized page-context extractor.
    const safeHref = (anchor: HTMLAnchorElement): string | undefined => {
      try {
        const href = new URL(anchor.href);
        return href.protocol === 'http:' || href.protocol === 'https:'
          ? href.username === '' && href.password === ''
            ? href.href
            : undefined
          : undefined;
      } catch {
        return undefined;
      }
    };

    const markdownFrom = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
      if (node.nodeType !== Node.ELEMENT_NODE || !isVisible(node as Element)) return '';

      const element = node as HTMLElement;
      const children = Array.from(element.childNodes, markdownFrom).join('');
      const tag = element.tagName;
      if (/^H[1-6]$/.test(tag)) return `${'#'.repeat(Number(tag.slice(1)))} ${children}\n\n`;
      if (tag === 'BR') return '\n';
      if (tag === 'LI') return `- ${children.trim()}\n`;
      if (tag === 'A') {
        const href = safeHref(element as HTMLAnchorElement);
        return href === undefined ? children : `[${children.trim()}](${href})`;
      }
      if (tag === 'TR') {
        const cells = Array.from(element.children)
          .filter((cell) => cell.tagName === 'TH' || cell.tagName === 'TD')
          .map((cell) => textFrom(cell).replace(/\s+/g, ' ').trim());
        if (cells.length === 0) return '';
        const row = `| ${cells.join(' | ')} |\n`;
        return element.querySelector('th') === null
          ? row
          : `${row}| ${cells.map(() => '---').join(' | ')} |\n`;
      }
      return blockTags.has(tag) ? `${children}\n\n` : children;
    };

    if (selectedMode === 'text') return textFrom(document.body);
    if (selectedMode === 'markdown') return markdownFrom(document.body);

    const visibleElements = Array.from(document.querySelectorAll('body *')).filter(isVisible);
    const headings = visibleElements
      .filter((element) => /^H[1-6]$/.test(element.tagName))
      .map((element) => ({ level: Number(element.tagName.slice(1)), text: textFrom(element) }));
    const landmarks = visibleElements
      .filter(
        (element) =>
          ['MAIN', 'NAV', 'HEADER', 'FOOTER', 'ASIDE'].includes(element.tagName) ||
          element.hasAttribute('role'),
      )
      .map((element) => ({
        role: element.getAttribute('role') ?? element.tagName.toLowerCase(),
        text: textFrom(element),
      }));
    const links = visibleElements
      .filter(
        (element): element is HTMLAnchorElement =>
          element.tagName === 'A' && element.hasAttribute('href'),
      )
      .flatMap((element) => {
        const href = safeHref(element);
        return href === undefined ? [] : [{ text: textFrom(element), href }];
      });

    return { title: document.title, headings, landmarks, links, text: textFrom(document.body) };
  }, mode);
}

export async function extractRenderedContent(
  page: Page,
  mode: BrowserFetchMode,
  maxChars: number,
): Promise<ExtractedContent> {
  const evaluated = await evaluateRenderedContent(page, mode);
  if (mode === 'snapshot') {
    if (maxChars < MIN_SEMANTIC_SNAPSHOT_CHARS) {
      throw new RangeError('Semantic snapshot budget is too small');
    }
    const content = normalizeSnapshot(evaluated as SemanticSnapshot);
    const truncated = truncateSnapshot(content, maxChars);
    return {
      mode,
      content: truncated.content,
      length: serializedSnapshotLength(truncated.content),
      truncated: truncated.truncated,
    };
  }

  const truncated = truncate(normalizeText(evaluated as string), maxChars);
  return {
    mode,
    content: truncated.content,
    length: truncated.content.length,
    truncated: truncated.truncated,
  };
}
