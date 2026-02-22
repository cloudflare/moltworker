/**
 * Tests for Task Complexity Classifier (Phase 7A.2)
 */

import { describe, it, expect } from 'vitest';
import { classifyTaskComplexity } from './task-classifier';

describe('classifyTaskComplexity', () => {
  describe('simple queries', () => {
    it('should classify weather queries as simple', () => {
      expect(classifyTaskComplexity("what's the weather?", 0)).toBe('simple');
    });

    it('should classify time queries as simple', () => {
      expect(classifyTaskComplexity('what time is it?', 0)).toBe('simple');
    });

    it('should classify greetings as simple', () => {
      expect(classifyTaskComplexity('hello', 0)).toBe('simple');
      expect(classifyTaskComplexity('hi there!', 0)).toBe('simple');
    });

    it('should classify crypto price queries as simple', () => {
      expect(classifyTaskComplexity('BTC price?', 0)).toBe('simple');
    });

    it('should classify currency conversion as simple', () => {
      expect(classifyTaskComplexity('100 USD to EUR', 0)).toBe('simple');
    });

    it('should classify short general questions as simple', () => {
      expect(classifyTaskComplexity('who is Elon Musk?', 0)).toBe('simple');
      expect(classifyTaskComplexity('how tall is Mt Everest?', 0)).toBe('simple');
    });

    it('should classify simple queries with short conversation as simple', () => {
      expect(classifyTaskComplexity('thanks!', 2)).toBe('simple');
    });
  });

  describe('complex queries — keywords', () => {
    it('should classify file-related queries as complex', () => {
      expect(classifyTaskComplexity('read the file', 0)).toBe('complex');
    });

    it('should classify function-related queries as complex', () => {
      expect(classifyTaskComplexity('show me that function', 0)).toBe('complex');
    });

    it('should classify bug reports as complex', () => {
      expect(classifyTaskComplexity('there is a bug here', 0)).toBe('complex');
    });

    it('should classify refactor requests as complex', () => {
      expect(classifyTaskComplexity('refactor this please', 0)).toBe('complex');
    });

    it('should classify build requests as complex', () => {
      expect(classifyTaskComplexity('build the project', 0)).toBe('complex');
    });

    it('should classify deploy requests as complex', () => {
      expect(classifyTaskComplexity('deploy to prod', 0)).toBe('complex');
    });

    it('should classify test requests as complex', () => {
      expect(classifyTaskComplexity('run the tests', 0)).toBe('complex');
    });

    it('should classify code-related queries as complex', () => {
      expect(classifyTaskComplexity('write me some code', 0)).toBe('complex');
    });

    it('should classify roadmap/orchestra queries as complex', () => {
      expect(classifyTaskComplexity('show the roadmap', 0)).toBe('complex');
      expect(classifyTaskComplexity('run orchestra init', 0)).toBe('complex');
    });

    it('should classify continuation references as complex', () => {
      expect(classifyTaskComplexity('continue from earlier', 0)).toBe('complex');
      expect(classifyTaskComplexity('as we discussed', 0)).toBe('complex');
      expect(classifyTaskComplexity('do you remember?', 0)).toBe('complex');
    });
  });

  describe('complex queries — patterns', () => {
    it('should classify messages with file paths as complex', () => {
      expect(classifyTaskComplexity('look at src/index.ts', 0)).toBe('complex');
    });

    it('should classify messages with URLs as complex', () => {
      expect(classifyTaskComplexity('check https://example.com', 0)).toBe('complex');
    });

    it('should classify messages with path separators as complex', () => {
      expect(classifyTaskComplexity('check /src/utils here', 0)).toBe('complex');
    });
  });

  describe('complex queries — length', () => {
    it('should classify messages over 100 chars as complex', () => {
      const longMessage = 'a'.repeat(101);
      expect(classifyTaskComplexity(longMessage, 0)).toBe('complex');
    });

    it('should classify messages at exactly 100 chars as simple', () => {
      const exactMessage = 'a'.repeat(100);
      expect(classifyTaskComplexity(exactMessage, 0)).toBe('simple');
    });
  });

  describe('complex queries — conversation length', () => {
    it('should classify as complex when conversation has 3+ messages', () => {
      expect(classifyTaskComplexity('ok', 3)).toBe('complex');
    });

    it('should classify as complex when conversation has many messages', () => {
      expect(classifyTaskComplexity('yes', 10)).toBe('complex');
    });

    it('should classify as simple when conversation has < 3 messages', () => {
      expect(classifyTaskComplexity('ok', 2)).toBe('simple');
      expect(classifyTaskComplexity('yes', 0)).toBe('simple');
    });
  });

  describe('edge cases', () => {
    it('should classify empty message as simple', () => {
      expect(classifyTaskComplexity('', 0)).toBe('simple');
    });

    it('should be case-insensitive for keywords', () => {
      expect(classifyTaskComplexity('FIX the Bug', 0)).toBe('complex');
      expect(classifyTaskComplexity('DEPLOY NOW', 0)).toBe('complex');
    });
  });
});
