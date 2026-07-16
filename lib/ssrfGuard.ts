import { lookup } from 'dns/promises';
import { isIPv4 } from 'net';

/**
 * Blocks the audit tool from being pointed at internal/private/cloud-metadata
 * addresses. Every public audit endpoint fetches a user-supplied URL server
 * side (htmlAgent, availabilityAgent) — without this check, a visitor could
 * submit a hostname that resolves to 169.254.169.254, 127.0.0.1, etc. and have
 * the server fetch it on their behalf.
 */
export class UnsafeHostnameError extends Error {}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  const [a, b] = parts;
  if (a === 0) return true;                                  // 0.0.0.0/8
  if (a === 10) return true;                                  // 10.0.0.0/8
  if (a === 100 && b >= 64 && b <= 127) return true;           // 100.64.0.0/10 (CGNAT)
  if (a === 127) return true;                                  // 127.0.0.0/8 (loopback)
  if (a === 169 && b === 254) return true;                     // 169.254.0.0/16 (link-local + cloud metadata)
  if (a === 172 && b >= 16 && b <= 31) return true;             // 172.16.0.0/12
  if (a === 192 && b === 0) return true;                        // 192.0.0.0/24, 192.0.2.0/24
  if (a === 192 && b === 168) return true;                      // 192.168.0.0/16
  if (a === 198 && (b === 18 || b === 19)) return true;         // 198.18.0.0/15 (benchmark)
  if (a === 198 && b === 51) return true;                       // 198.51.100.0/24 (TEST-NET-2)
  if (a === 203 && b === 0) return true;                        // 203.0.113.0/24 (TEST-NET-3)
  if (a >= 224) return true;                                    // multicast + reserved (224.0.0.0+)
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const norm = ip.toLowerCase();
  if (norm === '::1' || norm === '::') return true;                 // loopback / unspecified
  if (norm.startsWith('fc') || norm.startsWith('fd')) return true;   // fc00::/7 unique local
  if (norm.startsWith('fe8') || norm.startsWith('fe9') ||
      norm.startsWith('fea') || norm.startsWith('feb')) return true; // fe80::/10 link-local
  if (norm.startsWith('::ffff:')) return isPrivateIPv4(norm.slice(7)); // IPv4-mapped
  return false;
}

/**
 * Resolves the hostname and throws UnsafeHostnameError if it points at a
 * private/internal/cloud-metadata address. Callers should catch this the
 * same way they already catch "site unreachable" — as a generic 422, since
 * the visitor doesn't need to know why.
 *
 * Note: this checks the address at the time of this call. It does not pin
 * the connection to that address, so a determined attacker using DNS
 * rebinding (changing the DNS record between this check and the later
 * fetch) could still get around it. Closing that fully would mean pinning
 * the resolved IP for the actual fetch — a bigger change, flagged
 * separately rather than bundled in here.
 */
export async function assertPublicHostname(hostname: string): Promise<void> {
  const { address } = await lookup(hostname);
  const unsafe = isIPv4(address) ? isPrivateIPv4(address) : isPrivateIPv6(address);
  if (unsafe) throw new UnsafeHostnameError(`${hostname} resolves to a non-public address`);
}
