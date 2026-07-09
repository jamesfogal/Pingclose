/**
 * Strips BOM (U+FEFF), zero-width and whitespace characters that sneak in
 * when API keys are pasted into dashboards. A BOM in RESEND_API_KEY caused
 * every verification email to fail with a ByteString error (Jul 2026).
 */
export function cleanSecret(value: string | undefined | null): string {
  if (!value) return '';
  return value.replace(/[\u{FEFF}\u{200B}-\u{200D}\u{2060}]/gu, '').trim();
}
