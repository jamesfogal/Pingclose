import { createHmac } from 'crypto';

// RFC 6238 TOTP — no dependency needed, this is ~30 lines of well-defined crypto.
const STEP_SECONDS = 30;
const DIGITS = 6;

function base32Decode(secret: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = secret.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (const char of clean) {
    const val = alphabet.indexOf(char);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function hotp(secretBytes: Buffer, counter: number): string {
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(BigInt(counter));

  const hmac = createHmac('sha1', secretBytes).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (binary % 10 ** DIGITS).toString().padStart(DIGITS, '0');
}

/**
 * Verifies a 6-digit TOTP code against the current time step, allowing +/-1
 * step (90s total window) so a slow network request or minor clock drift
 * doesn't reject a code the authenticator app just showed.
 */
export function verifyTotpCode(base32Secret: string, code: string): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  const secretBytes = base32Decode(base32Secret);
  const currentStep = Math.floor(Date.now() / 1000 / STEP_SECONDS);

  for (const drift of [0, -1, 1]) {
    if (hotp(secretBytes, currentStep + drift) === code) return true;
  }
  return false;
}
