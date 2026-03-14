/**
 * Formats OpenClaw text responses for Mentra Live glasses HUD.
 * Glasses display: ~40 chars wide, ~6 lines, 220 char safe limit.
 */
export function formatForGlasses(text: string): string {
  let clean = text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '[code]')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (clean.length > 220) clean = clean.substring(0, 217) + '...';
  return clean;
}
