import { describe, it, expect } from 'vitest';
import { formatFfmpegTimestamp } from './ffmpeg-timecode.mjs';

describe('formatFfmpegTimestamp', () => {
  it('formats sub-second values with leading zeros', () => {
    expect(formatFfmpegTimestamp(0.48)).toBe('00:00:00.480');
  });

  it('formats zero as all zeros', () => {
    expect(formatFfmpegTimestamp(0)).toBe('00:00:00.000');
  });

  it('rounds to milliseconds deterministically', () => {
    expect(formatFfmpegTimestamp(1.2345)).toBe('00:00:01.235');
  });

  it('formats minute+second values', () => {
    expect(formatFfmpegTimestamp(61.002)).toBe('00:01:01.002');
  });

  it('clamps invalid values to zero', () => {
    expect(formatFfmpegTimestamp(-5)).toBe('00:00:00.000');
    expect(formatFfmpegTimestamp(Number.NaN)).toBe('00:00:00.000');
    expect(formatFfmpegTimestamp(undefined)).toBe('00:00:00.000');
  });
});
