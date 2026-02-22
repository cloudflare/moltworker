import { describe, it, expect } from 'vitest';
import { markdownToTelegramHtml } from './telegram-format';

describe('markdownToTelegramHtml', () => {
  it('should convert bold', () => {
    expect(markdownToTelegramHtml('**hello**')).toBe('<b>hello</b>');
  });

  it('should convert italic', () => {
    expect(markdownToTelegramHtml('*hello*')).toBe('<i>hello</i>');
  });

  it('should convert inline code', () => {
    expect(markdownToTelegramHtml('use `npm install`')).toBe('use <code>npm install</code>');
  });

  it('should convert code blocks', () => {
    const result = markdownToTelegramHtml('```js\nconsole.log("hi")\n```');
    expect(result).toContain('<pre>');
    expect(result).toContain('console.log');
    expect(result).toContain('</pre>');
  });

  it('should convert links', () => {
    expect(markdownToTelegramHtml('[click](https://example.com)')).toBe('<a href="https://example.com">click</a>');
  });

  it('should convert strikethrough', () => {
    expect(markdownToTelegramHtml('~~old~~')).toBe('<s>old</s>');
  });

  it('should escape HTML entities in text', () => {
    expect(markdownToTelegramHtml('a < b & c > d')).toBe('a &lt; b &amp; c &gt; d');
  });

  it('should handle mixed formatting', () => {
    const input = '**Bitcoin (BTC): $68,025.97**\n- **1h:** +0.04%';
    const output = markdownToTelegramHtml(input);
    expect(output).toContain('<b>Bitcoin (BTC): $68,025.97</b>');
    expect(output).toContain('<b>1h:</b>');
    expect(output).not.toContain('**');
  });

  it('should not convert bullet point asterisks to italic', () => {
    const input = '* item one\n* item two';
    const output = markdownToTelegramHtml(input);
    // Bullet asterisks followed by space should NOT become italic
    expect(output).not.toContain('<i>');
  });

  it('should preserve code block content from markdown transforms', () => {
    const input = '```\n**not bold** *not italic*\n```';
    const output = markdownToTelegramHtml(input);
    expect(output).toContain('<pre>');
    expect(output).not.toContain('<b>');
    expect(output).not.toContain('<i>');
  });

  it('should handle empty string', () => {
    expect(markdownToTelegramHtml('')).toBe('');
  });

  it('should handle plain text without markdown', () => {
    expect(markdownToTelegramHtml('hello world')).toBe('hello world');
  });
});
