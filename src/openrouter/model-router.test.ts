import { describe, it, expect } from 'vitest';
import { routeByComplexity, FAST_MODEL_CANDIDATES } from './model-router';
import { getModel } from './models';

describe('routeByComplexity', () => {
  describe('simple queries on default model', () => {
    it('routes to fast model when user is on auto', () => {
      const result = routeByComplexity('auto', 'simple', true);
      expect(result.wasRouted).toBe(true);
      expect(FAST_MODEL_CANDIDATES).toContain(result.modelAlias);
      expect(result.reason).toContain('Simple query');
    });

    it('picks mini as first choice (cheapest/fastest)', () => {
      const result = routeByComplexity('auto', 'simple', true);
      expect(result.modelAlias).toBe('mini');
    });
  });

  describe('complex queries', () => {
    it('does not route complex queries on auto', () => {
      const result = routeByComplexity('auto', 'complex', true);
      expect(result.wasRouted).toBe(false);
      expect(result.modelAlias).toBe('auto');
      expect(result.reason).toContain('Complex');
    });

    it('does not route complex queries on explicit model', () => {
      const result = routeByComplexity('opus', 'complex', true);
      expect(result.wasRouted).toBe(false);
      expect(result.modelAlias).toBe('opus');
    });
  });

  describe('explicit model selection', () => {
    it('does not override explicit model choice on simple query', () => {
      const result = routeByComplexity('opus', 'simple', true);
      expect(result.wasRouted).toBe(false);
      expect(result.modelAlias).toBe('opus');
      expect(result.reason).toContain('Explicit model');
    });

    it('does not override deep on simple query', () => {
      const result = routeByComplexity('deep', 'simple', true);
      expect(result.wasRouted).toBe(false);
      expect(result.modelAlias).toBe('deep');
    });

    it('does not override haiku on simple query', () => {
      const result = routeByComplexity('haiku', 'simple', true);
      expect(result.wasRouted).toBe(false);
      expect(result.modelAlias).toBe('haiku');
    });

    it('does not override free model on simple query', () => {
      const result = routeByComplexity('trinity', 'simple', true);
      expect(result.wasRouted).toBe(false);
      expect(result.modelAlias).toBe('trinity');
    });
  });

  describe('auto-route disabled', () => {
    it('does not route when auto-route is disabled', () => {
      const result = routeByComplexity('auto', 'simple', false);
      expect(result.wasRouted).toBe(false);
      expect(result.modelAlias).toBe('auto');
      expect(result.reason).toContain('disabled');
    });

    it('does not route complex queries when disabled either', () => {
      const result = routeByComplexity('auto', 'complex', false);
      expect(result.wasRouted).toBe(false);
      expect(result.modelAlias).toBe('auto');
    });
  });

  describe('routing result metadata', () => {
    it('includes reason in all results', () => {
      const routed = routeByComplexity('auto', 'simple', true);
      expect(routed.reason).toBeTruthy();

      const notRouted = routeByComplexity('opus', 'complex', true);
      expect(notRouted.reason).toBeTruthy();

      const disabled = routeByComplexity('auto', 'simple', false);
      expect(disabled.reason).toBeTruthy();
    });

    it('returns original model when not routing', () => {
      expect(routeByComplexity('sonnet', 'simple', true).modelAlias).toBe('sonnet');
      expect(routeByComplexity('grok', 'complex', true).modelAlias).toBe('grok');
      expect(routeByComplexity('auto', 'complex', true).modelAlias).toBe('auto');
    });
  });

  describe('FAST_MODEL_CANDIDATES', () => {
    it('has at least one candidate', () => {
      expect(FAST_MODEL_CANDIDATES.length).toBeGreaterThan(0);
    });

    it('candidates are ordered: mini first (cheapest)', () => {
      expect(FAST_MODEL_CANDIDATES[0]).toBe('mini');
    });

    it('all candidates are real models in the catalog', () => {
      for (const candidate of FAST_MODEL_CANDIDATES) {
        expect(getModel(candidate)).toBeTruthy();
      }
    });
  });
});
