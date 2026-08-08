// PingClose design tokens — single source of truth for color and type scale.
// See brand/pingclose-design-philosophy.md for the reasoning: color carries
// exactly two functions (teal = signal, white = language), plus a small,
// necessary set of status colors for a diagnostic tool's pass/fail/warn
// states. Nine colors total, replacing 115 accidental ones (2026-08-08).
export const colors = {
  // Structure — void, surface, and border. Unchanged values, just now a
  // single named source instead of scattered inline hex.
  void: '#0A1330',
  surface: '#0D1528',
  surfaceInset: '#111827',
  border: '#FFFFFF',

  // Signal — the one brand color. Live data, emphasis, primary CTAs, and
  // "good/passing" status all share this, since teal already means "good."
  signal: '#10D9A0',

  // Language — text, in two weights of the same white, not two unrelated
  // hues. Hierarchy comes from prominence, not from inventing new greys.
  textPrimary: '#F1F5F9',
  textSecondary: '#CBD5E1',

  // Status — functionally necessary for a tool whose entire job is showing
  // pass/fail/warn. Not decorative color choice.
  statusFail: '#F87171',
  statusWarn: '#FBBF24',
} as const;

// Type scale — matches CLAUDE.md's own non-negotiable font-size rule
// (nothing under 16px, body 17-18px, headings 22px+), applied consistently
// instead of the previous ad-hoc mix.
export const fontSize = {
  label: 18,   // uppercase captions/labels
  body: 19,    // description/paragraph text
  bodyLarge: 20,
  heading: 24,
} as const;
