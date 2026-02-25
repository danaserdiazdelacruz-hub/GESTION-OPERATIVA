// ============================================================================
//  CENTINELA — Crypto Utilities
// ============================================================================

const SALT = 'centinela_salt_v4.0.8';
const FALLBACK_SALT = 'centinela_salt_v4.0.8_fallback';

export async function hashPassword(password: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    console.error('Crypto API not available. Using fallback hash.');
    return btoa(password + FALLBACK_SALT);
  }
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === hash;
}

export function generateToken(): string {
  return `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
