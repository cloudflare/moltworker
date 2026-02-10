/**
 * Tests for model utility functions
 */

import { describe, it, expect } from 'vitest';
import { detectToolIntent, getModel } from './models';

// --- detectToolIntent ---

describe('detectToolIntent', () => {
  // GitHub signals
  it('detects "create a PR" as tool-requiring', () => {
    const result = detectToolIntent('now create a PR with those changes');
    expect(result.needsTools).toBe(true);
    expect(result.reason).toContain('GitHub');
  });

  it('detects "create PR" without article', () => {
    const result = detectToolIntent('create PR for mainnet migration');
    expect(result.needsTools).toBe(true);
  });

  it('detects "pull request" mention', () => {
    const result = detectToolIntent('open a pull request with the fix');
    expect(result.needsTools).toBe(true);
  });

  it('detects "modify the repo"', () => {
    const result = detectToolIntent('fetch the info and modify the repo');
    expect(result.needsTools).toBe(true);
  });

  it('detects GitHub URL', () => {
    const result = detectToolIntent('look at https://github.com/PetrAnto/megaengage');
    expect(result.needsTools).toBe(true);
  });

  // Web fetch signals
  it('detects "fetch https://..." as tool-requiring', () => {
    const result = detectToolIntent('fetch https://example.com and summarize');
    expect(result.needsTools).toBe(true);
    expect(result.reason).toContain('Web');
  });

  it('detects plain URL in message', () => {
    const result = detectToolIntent('what is on http://example.com/page');
    expect(result.needsTools).toBe(true);
  });

  it('detects "browse the website"', () => {
    const result = detectToolIntent('browse the website at https://mega.petranto.com/');
    expect(result.needsTools).toBe(true);
  });

  it('detects "scrape the page"', () => {
    const result = detectToolIntent('scrape the page https://example.com');
    expect(result.needsTools).toBe(true);
  });

  // Data lookup signals
  it('detects "what\'s the weather in"', () => {
    const result = detectToolIntent("what's the weather in London");
    expect(result.needsTools).toBe(true);
    expect(result.reason).toContain('Real-time');
  });

  it('detects "what is the bitcoin price"', () => {
    const result = detectToolIntent('what is the bitcoin price for today');
    expect(result.needsTools).toBe(true);
  });

  it('detects "what is the crypto price"', () => {
    const result = detectToolIntent('what is the crypto price for ETH');
    expect(result.needsTools).toBe(true);
  });

  // Code execution signals
  it('detects "run this code"', () => {
    const result = detectToolIntent('run this code in a sandbox');
    expect(result.needsTools).toBe(true);
    expect(result.reason).toContain('Code');
  });

  it('detects "execute in sandbox"', () => {
    const result = detectToolIntent('execute in sandbox: ls -la');
    expect(result.needsTools).toBe(true);
  });

  // False positive avoidance
  it('does NOT flag generic questions', () => {
    const result = detectToolIntent('explain how REST APIs work');
    expect(result.needsTools).toBe(false);
  });

  it('does NOT flag "fetch" in non-URL context', () => {
    const result = detectToolIntent('how does JavaScript fetch API work');
    expect(result.needsTools).toBe(false);
  });

  it('does NOT flag "run" in generic context', () => {
    const result = detectToolIntent('how do I run a marathon');
    expect(result.needsTools).toBe(false);
  });

  it('does NOT flag "weather" in generic context', () => {
    const result = detectToolIntent('tell me about weather patterns');
    expect(result.needsTools).toBe(false);
  });

  it('does NOT flag "github" without action verb', () => {
    const result = detectToolIntent('what is github?');
    expect(result.needsTools).toBe(false);
  });

  it('does NOT flag empty message', () => {
    const result = detectToolIntent('');
    expect(result.needsTools).toBe(false);
  });

  it('does NOT flag simple greeting', () => {
    const result = detectToolIntent('hello how are you');
    expect(result.needsTools).toBe(false);
  });
});

// --- GLM supportsTools flag ---

describe('GLM model tools support', () => {
  it('glmfree has supportsTools enabled', () => {
    const model = getModel('glmfree');
    expect(model).toBeDefined();
    expect(model!.supportsTools).toBe(true);
  });
});
