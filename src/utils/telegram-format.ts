/**
 * Convert common Markdown to Telegram HTML.
 *
 * Telegram's MarkdownV2 is extremely strict with escaping, so we convert
 * to HTML which is more forgiving. Handles:
 * - **bold** → <b>bold</b>
 * - *italic* (standalone, not inside **) → <i>italic</i>
 * - `inline code` → <code>inline code</code>
 * - ```code blocks``` → <pre>code blocks</pre>
 * - [text](url) → <a href="url">text</a>
 * - ~~strikethrough~~ → <s>strikethrough</s>
 *
 * HTML entities in content are escaped first to prevent injection.
 */

/**
 * Escape HTML entities in text content.
 * Must be called BEFORE inserting HTML tags.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Convert Markdown to Telegram-compatible HTML.
 * Returns the HTML string. If conversion produces invalid output,
 * callers should fall back to plain text (no parse_mode).
 */
export function markdownToTelegramHtml(md: string): string {
  // Step 1: Extract code blocks and inline code to protect them from other transformations
  const codeBlocks: string[] = [];
  const inlineCodes: string[] = [];

  // Replace fenced code blocks (```...```) with placeholders
  let result = md.replace(/```(\w*)\n?([\s\S]*?)```/g, (_match, _lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(escapeHtml(code.trimEnd()));
    return `\x00CB${idx}\x00`;
  });

  // Replace inline code (`...`) with placeholders
  result = result.replace(/`([^`\n]+)`/g, (_match, code) => {
    const idx = inlineCodes.length;
    inlineCodes.push(escapeHtml(code));
    return `\x00IC${idx}\x00`;
  });

  // Step 2: Escape HTML in remaining text
  result = escapeHtml(result);

  // Step 3: Apply markdown transformations (order matters)

  // Links: [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Bold: **text**
  result = result.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

  // Italic: *text* (but not inside bold tags, and not bullet points like "* item")
  result = result.replace(/(?<!\w)\*(?!\s)(.+?)(?<!\s)\*(?!\w)/g, '<i>$1</i>');

  // Strikethrough: ~~text~~
  result = result.replace(/~~(.+?)~~/g, '<s>$1</s>');

  // Step 4: Restore code blocks and inline code
  result = result.replace(/\x00CB(\d+)\x00/g, (_match, idx) => {
    return `<pre>${codeBlocks[parseInt(idx)]}</pre>`;
  });
  result = result.replace(/\x00IC(\d+)\x00/g, (_match, idx) => {
    return `<code>${inlineCodes[parseInt(idx)]}</code>`;
  });

  return result;
}
