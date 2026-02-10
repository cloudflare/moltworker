import { describe, it, expect } from 'vitest';
import { ops } from './ops';

describe('ops routes', () => {
  it('exports ops router', () => {
    expect(ops).toBeTruthy();
  });
});
