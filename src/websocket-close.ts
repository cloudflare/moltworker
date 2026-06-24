export function normalizeWebSocketCloseCode(code: number): number {
  if (
    code === 1000 ||
    code === 1001 ||
    code === 1002 ||
    code === 1003 ||
    (code >= 1007 && code <= 1014) ||
    (code >= 3000 && code <= 4999)
  ) {
    return code;
  }

  return 1011;
}
