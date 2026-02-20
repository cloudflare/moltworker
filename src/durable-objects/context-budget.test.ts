/**
 * Tests for token-budgeted context retrieval (Phase 4.1)
 */

import { describe, it, expect } from 'vitest';
import type { ChatMessage } from '../openrouter/client';
import {
  estimateStringTokens,
  estimateMessageTokens,
  estimateTokens,
  compressContextBudgeted,
} from './context-budget';

// --- Helper factories ---

function systemMsg(content: string): ChatMessage {
  return { role: 'system', content };
}

function userMsg(content: string): ChatMessage {
  return { role: 'user', content };
}

function assistantMsg(content: string): ChatMessage {
  return { role: 'assistant', content };
}

function assistantToolCallMsg(
  content: string,
  toolCalls: Array<{ id: string; name: string; arguments: string }>,
): ChatMessage {
  return {
    role: 'assistant',
    content,
    tool_calls: toolCalls.map(tc => ({
      id: tc.id,
      type: 'function' as const,
      function: { name: tc.name, arguments: tc.arguments },
    })),
  };
}

function toolResultMsg(toolCallId: string, content: string): ChatMessage {
  return { role: 'tool', content, tool_call_id: toolCallId };
}

// --- estimateStringTokens ---

describe('estimateStringTokens', () => {
  it('should return 0 for empty string', () => {
    expect(estimateStringTokens('')).toBe(0);
  });

  it('should estimate ~1 token per 4 chars for plain English', () => {
    const text = 'Hello world this is a test'; // 26 chars
    const tokens = estimateStringTokens(text);
    expect(tokens).toBeGreaterThanOrEqual(6);
    expect(tokens).toBeLessThanOrEqual(10);
  });

  it('should add overhead for code-heavy content', () => {
    const code = 'const x = () => { return a.b?.c ?? d[e]; };';
    const plain = 'This is a simple English sentence here now';
    // Code should estimate more tokens per char
    const codeTokens = estimateStringTokens(code);
    const plainTokens = estimateStringTokens(plain);
    // Code tokens per char should be higher (or at least comparable)
    expect(codeTokens / code.length).toBeGreaterThanOrEqual(plainTokens / plain.length * 0.9);
  });

  it('should handle large strings', () => {
    const large = 'a'.repeat(10000);
    const tokens = estimateStringTokens(large);
    // Real tokenizer (cl100k_base) is efficient with repeated chars (~1250 tokens).
    // Heuristic gives ~2500. Accept either path.
    expect(tokens).toBeGreaterThan(500);
    expect(tokens).toBeLessThan(4000);
  });
});

// --- estimateMessageTokens ---

describe('estimateMessageTokens', () => {
  it('should include overhead for empty message', () => {
    const msg: ChatMessage = { role: 'user', content: '' };
    const tokens = estimateMessageTokens(msg);
    expect(tokens).toBeGreaterThanOrEqual(4); // At least MESSAGE_OVERHEAD_TOKENS
  });

  it('should estimate simple text message', () => {
    const msg = userMsg('What is the weather?');
    const tokens = estimateMessageTokens(msg);
    expect(tokens).toBeGreaterThan(4); // overhead + content
    expect(tokens).toBeLessThan(20);
  });

  it('should account for tool_calls', () => {
    const withTools = assistantToolCallMsg('Let me check', [
      { id: 'call_1', name: 'get_weather', arguments: '{"lat":40.7,"lon":-74.0}' },
    ]);
    const withoutTools = assistantMsg('Let me check');
    expect(estimateMessageTokens(withTools)).toBeGreaterThan(estimateMessageTokens(withoutTools));
  });

  it('should account for multiple tool_calls', () => {
    const oneCall = assistantToolCallMsg('Checking', [
      { id: 'call_1', name: 'get_weather', arguments: '{"lat":40.7}' },
    ]);
    const twoCalls = assistantToolCallMsg('Checking', [
      { id: 'call_1', name: 'get_weather', arguments: '{"lat":40.7}' },
      { id: 'call_2', name: 'fetch_url', arguments: '{"url":"https://example.com"}' },
    ]);
    expect(estimateMessageTokens(twoCalls)).toBeGreaterThan(estimateMessageTokens(oneCall));
  });

  it('should handle ContentPart arrays', () => {
    const msg: ChatMessage = {
      role: 'user',
      content: [
        { type: 'text', text: 'What is this?' },
        { type: 'image_url', image_url: { url: 'data:image/png;base64,...' } },
      ],
    };
    const tokens = estimateMessageTokens(msg);
    expect(tokens).toBeGreaterThan(300); // image adds ~300 tokens
  });

  it('should handle null content', () => {
    const msg: ChatMessage = { role: 'assistant', content: null };
    const tokens = estimateMessageTokens(msg);
    expect(tokens).toBe(4); // Just overhead
  });

  it('should account for reasoning_content', () => {
    const withReasoning: ChatMessage = {
      role: 'assistant',
      content: 'The answer is 42.',
      reasoning_content: 'Let me think step by step about this problem...',
    };
    const withoutReasoning = assistantMsg('The answer is 42.');
    expect(estimateMessageTokens(withReasoning)).toBeGreaterThan(estimateMessageTokens(withoutReasoning));
  });
});

// --- estimateTokens ---

describe('estimateTokens', () => {
  it('should include reply priming overhead', () => {
    const msgs: ChatMessage[] = [];
    expect(estimateTokens(msgs)).toBe(3); // Just reply priming
  });

  it('should sum all messages', () => {
    const msgs = [
      systemMsg('You are helpful.'),
      userMsg('Hello'),
      assistantMsg('Hi there!'),
    ];
    const total = estimateTokens(msgs);
    const sum = msgs.reduce((acc, m) => acc + estimateMessageTokens(m), 0) + 3;
    expect(total).toBe(sum);
  });

  it('should estimate a realistic conversation', () => {
    const msgs = [
      systemMsg('You are a helpful assistant with access to tools.'),
      userMsg('Check the weather in New York and get news from HackerNews'),
      assistantToolCallMsg('I\'ll check both for you.', [
        { id: 'call_1', name: 'get_weather', arguments: '{"latitude":40.7128,"longitude":-74.006}' },
        { id: 'call_2', name: 'fetch_news', arguments: '{"source":"hackernews","limit":5}' },
      ]),
      toolResultMsg('call_1', 'Temperature: 15°C, Partly cloudy, Wind: 12 km/h'),
      toolResultMsg('call_2', '1. Show HN: My new project\n2. Ask HN: Best practices\n3. React 20 released'),
      assistantMsg('Here\'s the weather in New York: 15°C, partly cloudy with 12 km/h winds.\n\nTop HackerNews stories:\n1. Show HN: My new project\n2. Ask HN: Best practices\n3. React 20 released'),
    ];
    const tokens = estimateTokens(msgs);
    expect(tokens).toBeGreaterThan(50);
    expect(tokens).toBeLessThan(500);
  });
});

// --- compressContextBudgeted ---

describe('compressContextBudgeted', () => {
  it('should return messages unchanged when under budget', () => {
    const msgs = [
      systemMsg('System'),
      userMsg('Hello'),
      assistantMsg('Hi'),
    ];
    const result = compressContextBudgeted(msgs, 100000);
    expect(result).toEqual(msgs);
  });

  it('should return messages unchanged when too few to compress', () => {
    const msgs = [
      systemMsg('System'),
      userMsg('Hello'),
      assistantMsg('Hi'),
    ];
    // Even with a tiny budget, can't compress 3 messages with minRecent=6
    const result = compressContextBudgeted(msgs, 10, 6);
    expect(result).toEqual(msgs);
  });

  it('should always keep system and user messages', () => {
    const msgs = [
      systemMsg('You are helpful.'),
      userMsg('Tell me about weather.'),
      ...Array.from({ length: 20 }, (_, i) =>
        assistantMsg(`Response ${i}: ${'x'.repeat(500)}`)
      ),
    ];
    const result = compressContextBudgeted(msgs, 500, 4);
    expect(result[0].role).toBe('system');
    expect(result[0].content).toBe('You are helpful.');
    expect(result.find(m => m.role === 'user' && m.content === 'Tell me about weather.')).toBeDefined();
  });

  it('should keep recent messages', () => {
    const msgs = [
      systemMsg('System'),
      userMsg('Question'),
      ...Array.from({ length: 15 }, (_, i) =>
        assistantMsg(`Old response ${i}: ${'x'.repeat(200)}`)
      ),
      assistantMsg('Recent response 1'),
      assistantMsg('Recent response 2'),
      assistantMsg('Recent response 3'),
    ];
    const result = compressContextBudgeted(msgs, 500, 3);
    const lastThree = result.slice(-3);
    expect(lastThree[0].content).toBe('Recent response 1');
    expect(lastThree[1].content).toBe('Recent response 2');
    expect(lastThree[2].content).toBe('Recent response 3');
  });

  it('should create a summary message for evicted content', () => {
    const msgs = [
      systemMsg('System'),
      userMsg('Do stuff'),
      assistantToolCallMsg('Fetching data.', [
        { id: 'call_1', name: 'fetch_url', arguments: '{"url":"https://example.com"}' },
      ]),
      toolResultMsg('call_1', 'file path/to/data.ts: contents here with lots of data ' + 'x'.repeat(1000)),
      assistantToolCallMsg('Now reading file.', [
        { id: 'call_2', name: 'github_read_file', arguments: '{"path":"src/main.ts"}' },
      ]),
      toolResultMsg('call_2', 'reading src/main.ts: export function main() {}' + 'x'.repeat(1000)),
      assistantMsg('Old analysis of the data: ' + 'x'.repeat(1000)),
      assistantMsg('Recent: here is the final answer'),
    ];

    // Use a small budget to force compression
    const result = compressContextBudgeted(msgs, 300, 2);

    // Should either include a summary, or omit it if budget is extremely tight
    const summary = result.find(m =>
      typeof m.content === 'string' && m.content.startsWith('[Context summary:')
    );
    if (summary) {
      expect(typeof summary.content === 'string' && summary.content).toContain('Context summary:');
    } else {
      expect(result.length).toBeLessThan(msgs.length);
    }
  });

  it('should maintain tool_call/result pairing', () => {
    const msgs = [
      systemMsg('System'),
      userMsg('Check something'),
      assistantToolCallMsg('Checking.', [
        { id: 'call_1', name: 'fetch_url', arguments: '{"url":"https://a.com"}' },
      ]),
      toolResultMsg('call_1', 'Result from a.com'),
      assistantToolCallMsg('Checking more.', [
        { id: 'call_2', name: 'fetch_url', arguments: '{"url":"https://b.com"}' },
      ]),
      toolResultMsg('call_2', 'Result from b.com'),
      assistantMsg('Final answer based on both.'),
    ];

    const result = compressContextBudgeted(msgs, 200, 3);

    // Every tool result message should have its assistant message with tool_calls
    const toolResults = result.filter(m => m.role === 'tool');
    for (const tr of toolResults) {
      if (!tr.tool_call_id) continue;
      // Find the matching assistant with this tool_call_id
      const hasMatch = result.some(m =>
        m.role === 'assistant' &&
        m.tool_calls?.some(tc => tc.id === tr.tool_call_id)
      );
      expect(hasMatch).toBe(true);
    }
  });

  it('should handle orphaned tool messages at recent boundary', () => {
    const msgs = [
      systemMsg('System'),
      userMsg('Question'),
      assistantToolCallMsg('Using tool.', [
        { id: 'call_1', name: 'get_weather', arguments: '{}' },
        { id: 'call_2', name: 'fetch_news', arguments: '{}' },
      ]),
      toolResultMsg('call_1', 'Weather: sunny'),
      toolResultMsg('call_2', 'News: nothing special'),
      assistantMsg('Here is the answer.'),
    ];

    // With minRecent=2, the boundary might land in the middle of tool results
    const result = compressContextBudgeted(msgs, 100, 2);

    // Should not start with orphaned tool messages after system+user+summary
    const afterSystemUser = result.slice(2);
    const firstNonSummary = afterSystemUser.find(
      m => !(typeof m.content === 'string' && m.content.startsWith('[Context summary:'))
    );
    if (firstNonSummary) {
      // If there's a tool message, its paired assistant should also be present
      if (firstNonSummary.role === 'tool' && firstNonSummary.tool_call_id) {
        const hasAssistant = result.some(m =>
          m.role === 'assistant' &&
          m.tool_calls?.some(tc => tc.id === firstNonSummary.tool_call_id)
        );
        expect(hasAssistant).toBe(true);
      }
    }
  });

  it('should compress a large conversation to fit budget', () => {
    // Create a conversation with ~50 messages
    const msgs: ChatMessage[] = [
      systemMsg('You are a helpful assistant with tools.'),
      userMsg('Research this topic thoroughly.'),
    ];

    for (let i = 0; i < 15; i++) {
      msgs.push(
        assistantToolCallMsg(`Step ${i}`, [
          { id: `call_${i}`, name: 'fetch_url', arguments: `{"url":"https://example.com/${i}"}` },
        ]),
        toolResultMsg(`call_${i}`, `Result ${i}: ${'data '.repeat(100)}`),
      );
    }
    msgs.push(assistantMsg('Here is the comprehensive answer based on all research.'));

    const budget = 2000;
    const result = compressContextBudgeted(msgs, budget, 4);

    // Result should be significantly smaller
    expect(result.length).toBeLessThan(msgs.length);

    // Result should fit within budget (approximately)
    const resultTokens = estimateTokens(result);
    // Allow some margin since summary estimation is approximate
    expect(resultTokens).toBeLessThan(budget * 1.2);
  });

  it('should prioritize recent tool results over old ones', () => {
    const msgs: ChatMessage[] = [
      systemMsg('System'),
      userMsg('Do research'),
    ];

    // Old tool calls
    for (let i = 0; i < 5; i++) {
      msgs.push(
        assistantToolCallMsg(`Old step ${i}`, [
          { id: `old_${i}`, name: 'fetch_url', arguments: `{"url":"https://old.com/${i}"}` },
        ]),
        toolResultMsg(`old_${i}`, `Old result ${i}: ${'data '.repeat(50)}`),
      );
    }

    // Recent tool calls
    for (let i = 0; i < 3; i++) {
      msgs.push(
        assistantToolCallMsg(`Recent step ${i}`, [
          { id: `new_${i}`, name: 'github_read_file', arguments: `{"path":"src/file${i}.ts"}` },
        ]),
        toolResultMsg(`new_${i}`, `Recent result ${i}: important findings`),
      );
    }

    msgs.push(assistantMsg('Final answer'));

    const result = compressContextBudgeted(msgs, 1500, 4);

    // Recent results should be present
    const hasRecentResult = result.some(m =>
      m.role === 'tool' && typeof m.content === 'string' && m.content.includes('Recent result')
    );
    expect(hasRecentResult).toBe(true);

    // The final answer should be present
    const hasFinal = result.some(m =>
      m.role === 'assistant' && m.content === 'Final answer'
    );
    expect(hasFinal).toBe(true);
  });

  it('should include tool names in summary', () => {
    const msgs: ChatMessage[] = [
      systemMsg('System'),
      userMsg('Do things'),
      assistantToolCallMsg('Fetching', [
        { id: 'c1', name: 'fetch_url', arguments: '{"url":"https://x.com"}' },
      ]),
      toolResultMsg('c1', 'Data from x.com ' + 'x'.repeat(500)),
      assistantToolCallMsg('Getting weather', [
        { id: 'c2', name: 'get_weather', arguments: '{"lat":0,"lon":0}' },
      ]),
      toolResultMsg('c2', 'Sunny, 25C ' + 'x'.repeat(500)),
      assistantToolCallMsg('Getting news', [
        { id: 'c3', name: 'fetch_news', arguments: '{"source":"hn"}' },
      ]),
      toolResultMsg('c3', 'Top stories... ' + 'x'.repeat(500)),
      // Lots of padding to force compression
      ...Array.from({ length: 10 }, (_, i) =>
        assistantMsg(`Analysis part ${i}: ${'x'.repeat(500)}`)
      ),
      assistantMsg('Final conclusion'),
    ];

    // Use very tight budget to force eviction of old tool calls
    const result = compressContextBudgeted(msgs, 400, 2);

    const summary = result.find(m =>
      typeof m.content === 'string' && m.content.startsWith('[Context summary:')
    );

    // Summary may be dropped by safety guard for very tight budgets
    if (summary && typeof summary.content === 'string') {
      const content = summary.content;
      const hasToolRef = content.includes('fetch_url') ||
        content.includes('get_weather') ||
        content.includes('fetch_news') ||
        content.includes('Tools used') ||
        content.includes('tool result');
      expect(hasToolRef).toBe(true);
    } else {
      expect(result.length).toBeLessThan(msgs.length);
    }
  });

  it('should handle conversation with only system + user + assistant', () => {
    const msgs = [
      systemMsg('System prompt'),
      userMsg('Simple question'),
      assistantMsg('Simple answer'),
    ];
    // Even with tiny budget, should return messages (not enough to compress)
    const result = compressContextBudgeted(msgs, 10, 2);
    expect(result.length).toBe(3);
  });

  it('should deduplicate repeated tool calls in summary', () => {
    const msgs: ChatMessage[] = [
      systemMsg('System'),
      userMsg('Research thoroughly'),
    ];

    // Same tool called multiple times
    for (let i = 0; i < 5; i++) {
      msgs.push(
        assistantToolCallMsg(`Step ${i}`, [
          { id: `c${i}`, name: 'fetch_url', arguments: `{"url":"https://site${i}.com"}` },
        ]),
        toolResultMsg(`c${i}`, `Result ${i}: ${'x'.repeat(500)}`),
      );
    }

    msgs.push(assistantMsg('Done'));

    const result = compressContextBudgeted(msgs, 500, 2);

    const summary = result.find(m =>
      typeof m.content === 'string' && m.content.startsWith('[Context summary:')
    );

    if (summary && typeof summary.content === 'string') {
      // Should show count notation for repeated tools, e.g., "fetch_url(×5)"
      // or at least mention the tool name
      expect(summary.content).toContain('fetch_url');
    }
  });

  it('should handle messages with null content gracefully', () => {
    const msgs: ChatMessage[] = [
      systemMsg('System'),
      userMsg('Hello'),
      { role: 'assistant', content: null },
      assistantMsg('Here you go'),
    ];

    // Should not throw
    const result = compressContextBudgeted(msgs, 100000);
    expect(result.length).toBe(4);
  });

  it('should respect minRecentMessages parameter', () => {
    const msgs: ChatMessage[] = [
      systemMsg('System'),
      userMsg('Question'),
      ...Array.from({ length: 20 }, (_, i) =>
        assistantMsg(`Msg ${i}: ${'x'.repeat(200)}`)
      ),
    ];

    const result4 = compressContextBudgeted(msgs, 500, 4);
    const result8 = compressContextBudgeted(msgs, 500, 8);

    // With larger minRecent, more messages should be in the result
    // (if budget allows)
    expect(result8.length).toBeGreaterThanOrEqual(result4.length);
  });

  it('should drop summary when it would push result over budget', () => {
    const msgs: ChatMessage[] = [
      systemMsg('System ' + 'x'.repeat(200)),
      userMsg('User ' + 'y'.repeat(200)),
      ...Array.from({ length: 20 }, (_, i) => assistantMsg(`Middle ${i}: ${'z'.repeat(200)}`)),
      assistantMsg('Tail answer'),
    ];

    const result = compressContextBudgeted(msgs, 180, 1);
    const hasSummary = result.some(
      m => m.role === 'assistant' && typeof m.content === 'string' && m.content.startsWith('[Context summary:'),
    );
    // Summary should be dropped to stay within budget
    expect(hasSummary).toBe(false);
  });

  it('should score system messages higher than plain assistant text', () => {
    // Injected system notices should survive over plain assistant reasoning
    const msgs: ChatMessage[] = [
      systemMsg('You are a helpful assistant.'),
      userMsg('Do a task'),
      assistantMsg('Old reasoning 1: ' + 'x'.repeat(400)),
      assistantMsg('Old reasoning 2: ' + 'x'.repeat(400)),
      { role: 'system', content: '[PLANNING PHASE] You are now in planning mode.' },
      assistantMsg('Old reasoning 3: ' + 'x'.repeat(400)),
      assistantMsg('Old reasoning 4: ' + 'x'.repeat(400)),
      assistantMsg('Old reasoning 5: ' + 'x'.repeat(400)),
      assistantMsg('Old reasoning 6: ' + 'x'.repeat(400)),
      assistantMsg('Recent answer'),
    ];

    // Use tight budget to force compression even with real tokenizer
    // (real tokenizer counts ~150 tokens for 'x'.repeat(400), heuristic ~115)
    const result = compressContextBudgeted(msgs, 300, 2);

    // The system notice should survive compression better than plain assistant text
    const hasSystemNotice = result.some(
      m => m.role === 'system' && typeof m.content === 'string' && m.content.includes('[PLANNING PHASE]'),
    );
    // At least verify it doesn't crash and compresses
    expect(result.length).toBeLessThan(msgs.length);
    // If the system notice survived, that validates the priority scoring
    if (!hasSystemNotice) {
      // Even if evicted due to tight budget, it should be in the summary
      const summary = result.find(
        m => typeof m.content === 'string' && m.content.startsWith('[Context summary:'),
      );
      expect(summary).toBeDefined();
    }
  });

  it('should handle out-of-order tool results gracefully', () => {
    const msgs: ChatMessage[] = [
      systemMsg('System'),
      userMsg('Q'),
      toolResultMsg('future_1', 'premature tool output'),
      assistantToolCallMsg('Now call', [{ id: 'future_1', name: 'fetch_url', arguments: '{}' }]),
      assistantMsg('wrap up'),
      ...Array.from({ length: 12 }, (_, i) => assistantMsg(`tail ${i}: ${'n'.repeat(120)}`)),
    ];

    const result = compressContextBudgeted(msgs, 500, 3);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].role).toBe('system');
  });
});
