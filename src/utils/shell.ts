/**
 * Validates that a string is safe to use as a shell argument.
 * Only allows alphanumeric characters, hyphens, and underscores.
 * Throws an error if the input contains unsafe characters.
 */
export function validateShellArg(value: string, paramName: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
    throw new Error(`Invalid ${paramName}: contains unsafe characters`);
  }
  return value;
}
