const bearerAuthorizationPattern = /^Bearer (.+)$/;
const textEncoder = new TextEncoder();

export async function hasValidProxyAuthorization(
  authorization: string | undefined,
  expectedToken: string | undefined,
): Promise<boolean> {
  if (!expectedToken) {
    return false;
  }

  const presentedToken = authorization?.match(bearerAuthorizationPattern)?.[1];
  if (!presentedToken) {
    return false;
  }

  const [presentedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', textEncoder.encode(presentedToken)),
    crypto.subtle.digest('SHA-256', textEncoder.encode(expectedToken)),
  ]);

  const presentedBytes = new Uint8Array(presentedHash);
  const expectedBytes = new Uint8Array(expectedHash);
  let difference = 0;

  for (let index = 0; index < presentedBytes.length; index += 1) {
    difference |= presentedBytes[index] ^ expectedBytes[index];
  }

  return difference === 0;
}
