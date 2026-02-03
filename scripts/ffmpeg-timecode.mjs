#!/usr/bin/env node
// Format a number of seconds into ffmpeg-friendly HH:MM:SS.mmm.
// Clamps invalid/negative values to 0 and rounds to milliseconds.

export function formatFfmpegTimestamp(input) {
  const value = Number(input);
  if (!Number.isFinite(value) || value <= 0) {
    return '00:00:00.000';
  }

  const totalMs = Math.round(value * 1000);
  const totalSeconds = Math.floor(totalMs / 1000);
  const ms = totalMs % 1000;
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const mmm = String(ms).padStart(3, '0');

  return `${hh}:${mm}:${ss}.${mmm}`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = process.argv[2];
  process.stdout.write(formatFfmpegTimestamp(input));
}
