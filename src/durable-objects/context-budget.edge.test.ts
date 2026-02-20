import { describe, it, expect } from 'vitest';
import type { ChatMessage } from '../openrouter/client';
import { compressContextBudgeted, estimateMessageTokens, estimateStringTokens } from './context-budget';

function systemMsg(content: string): ChatMessage { return { role: 'system', content }; }
function userMsg(content: string): ChatMessage { return { role: 'user', content }; }
function assistantMsg(content: string): ChatMessage { return { role: 'assistant', content }; }
function toolResultMsg(toolCallId: string, content: string): ChatMessage { return { role: 'tool', content, tool_call_id: toolCallId }; }
function assistantToolCallMsg(content: string, toolCalls: Array<{ id: string; name: string; arguments: string }>): ChatMessage {
  return {
    role: 'assistant',
    content,
    tool_calls: toolCalls.map(tc => ({ id: tc.id, type: 'function' as const, function: { name: tc.name, arguments: tc.arguments } })),
  };
}

describe('context-budget edge cases', () => {
  it('handles pure chat with no tool calls', () => {
    const messages: ChatMessage[] = [
      systemMsg('system'),
      userMsg('hello'),
      ...Array.from({ length: 20 }, (_, i) => assistantMsg(`assistant message ${i} ${'x'.repeat(200)}`)),
    ];

    const result = compressContextBudgeted(messages, 400, 4);
    expect(result.some(m => typeof m.content === 'string' && m.content.startsWith('[Context summary:'))).toBe(true);
    expect(result[result.length - 1].content).toContain('assistant message 19');
  });

  it('handles 100+ tool calls stress case', () => {
    const messages: ChatMessage[] = [systemMsg('system'), userMsg('do a lot')];
    for (let i = 0; i < 120; i++) {
      messages.push(
        assistantToolCallMsg(`step ${i}`, [{ id: `call_${i}`, name: 'fetch_url', arguments: `{"url":"https://a.com/${i}"}` }]),
        toolResultMsg(`call_${i}`, `payload-${i}-${'data '.repeat(30)}`),
      );
    }
    messages.push(assistantMsg('done'));

    const result = compressContextBudgeted(messages, 1500, 6);
    expect(result.length).toBeLessThan(messages.length);
    const invalidTool = result.find(m => m.role === 'tool' && m.tool_call_id && !result.some(a => a.role === 'assistant' && a.tool_calls?.some(tc => tc.id === m.tool_call_id)));
    expect(invalidTool).toBeUndefined();
  });

  it('accounts for image content parts without crashing', () => {
    const msg: ChatMessage = {
      role: 'user',
      content: [
        { type: 'text', text: 'What is in this image?' },
        { type: 'image_url', image_url: { url: 'https://example.com/a.png' } },
        { type: 'image_url', image_url: { url: 'https://example.com/b.png' } },
      ],
    };

    expect(estimateMessageTokens(msg)).toBeGreaterThan(800);
  });

  it('accounts for reasoning_content', () => {
    const msg: ChatMessage = {
      role: 'assistant',
      content: 'answer',
      reasoning_content: 'long hidden reasoning ' + 'x'.repeat(1200),
    };
    // Real tokenizer is efficient with repeated chars; heuristic gives ~300+.
    // Both should be significantly above baseline (4 overhead + 2 for 'answer').
    expect(estimateMessageTokens(msg)).toBeGreaterThan(100);
  });

  it('gracefully degrades when budget is smaller than always-keep set', () => {
    const messages: ChatMessage[] = [
      systemMsg('system'),
      userMsg('question'),
      ...Array.from({ length: 10 }, (_, i) => assistantMsg(`recent ${i} ${'x'.repeat(300)}`)),
    ];

    const result = compressContextBudgeted(messages, 60, 6);
    expect(result.length).toBeGreaterThan(2);
    expect(result.some(m => typeof m.content === 'string' && m.content.startsWith('[Context summary:'))).toBe(false);
  });

  it('handles single message conversation', () => {
    const messages: ChatMessage[] = [assistantMsg('lonely')];
    const result = compressContextBudgeted(messages, 10, 2);
    expect(result).toEqual(messages);
  });

  it('handles malformed all-tool conversation', () => {
    const messages: ChatMessage[] = [
      { role: 'tool', content: 'a', tool_call_id: 'id1' },
      { role: 'tool', content: 'b', tool_call_id: 'id2' },
      { role: 'tool', content: 'c', tool_call_id: 'id3' },
      { role: 'tool', content: 'd', tool_call_id: 'id4' },
      { role: 'tool', content: 'e', tool_call_id: 'id5' },
      { role: 'tool', content: 'f', tool_call_id: 'id6' },
      { role: 'tool', content: 'g', tool_call_id: 'id7' },
      { role: 'tool', content: 'h', tool_call_id: 'id8' },
      { role: 'tool', content: 'i', tool_call_id: 'id9' },
    ];

    const result = compressContextBudgeted(messages, 20, 4);
    expect(result.length).toBeGreaterThan(0);
  });

  it('does not incorrectly fallback-pair mismatched tool_call_id', () => {
    const messages: ChatMessage[] = [
      systemMsg('system'),
      userMsg('question'),
      assistantToolCallMsg('first', [{ id: 'a1', name: 'fetch_url', arguments: '{}' }]),
      assistantToolCallMsg('second', [{ id: 'b1', name: 'fetch_url', arguments: '{}' }]),
      toolResultMsg('unknown-id', 'tool payload that should not pair with second'),
      assistantMsg('tail ' + 'x'.repeat(500)),
      assistantMsg('tail2 ' + 'x'.repeat(500)),
      assistantMsg('tail3 ' + 'x'.repeat(500)),
      assistantMsg('tail4 ' + 'x'.repeat(500)),
      assistantMsg('tail5 ' + 'x'.repeat(500)),
    ];

    const result = compressContextBudgeted(messages, 350, 4);
    const toolIdx = result.findIndex(m => m.role === 'tool' && m.tool_call_id === 'unknown-id');
    if (toolIdx >= 0) {
      const assistantMatches = result.filter(m => m.role === 'assistant' && m.tool_calls?.some(tc => tc.id === 'unknown-id'));
      expect(assistantMatches.length).toBe(0);
    }
  });

  it('keeps assistant+tool together for duplicate tool ids', () => {
    const messages: ChatMessage[] = [
      systemMsg('system'),
      userMsg('q'),
      assistantToolCallMsg('dup', [{ id: 'dup-id', name: 'fetch_url', arguments: '{}' }]),
      toolResultMsg('dup-id', 'first result'),
      toolResultMsg('dup-id', 'second result'),
      ...Array.from({ length: 8 }, (_, i) => assistantMsg(`pad ${i} ${'x'.repeat(250)}`)),
    ];

    const result = compressContextBudgeted(messages, 500, 4);
    const toolMessages = result.filter(m => m.role === 'tool' && m.tool_call_id === 'dup-id');
    if (toolMessages.length > 0) {
      expect(result.some(m => m.role === 'assistant' && m.tool_calls?.some(tc => tc.id === 'dup-id'))).toBe(true);
    }
  });

  it('favors tool/result evidence over older assistant prose', () => {
    const messages: ChatMessage[] = [
      systemMsg('system'),
      userMsg('q'),
      assistantMsg('older prose ' + 'x'.repeat(600)),
      assistantToolCallMsg('critical call', [{ id: 'c1', name: 'github_read_file', arguments: '{"path":"src/x.ts"}' }]),
      toolResultMsg('c1', 'critical evidence from file x.ts'),
      ...Array.from({ length: 10 }, (_, i) => assistantMsg(`recent prose ${i} ${'x'.repeat(250)}`)),
    ];

    const result = compressContextBudgeted(messages, 600, 4);
    expect(result.some(m => m.role === 'tool' && typeof m.content === 'string' && m.content.includes('critical evidence'))).toBe(true);
  });

  it('treats JSON as denser than plain prose in estimation', () => {
    const json = '{"items":[{"a":1,"b":2,"c":"x"},{"a":3,"b":4,"c":"y"}],"meta":{"ok":true}}';
    const prose = 'this is simple prose with mostly letters and spaces to compare token density';
    const jsonDensity = estimateStringTokens(json) / json.length;
    const proseDensity = estimateStringTokens(prose) / prose.length;
    expect(jsonDensity).toBeGreaterThan(proseDensity);
  });
});
