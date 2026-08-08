---
name: velocity-signal
description: Design philosophy for PingClose — speed measurement as visual precision instrument
---

# Velocity Signal

A design movement born from the discipline of measurement. Where most brands reach for energy and motion as aesthetic decoration, Velocity Signal treats speed as a scientific instrument — something to be calibrated, observed, and recorded with the precision of laboratory notation. The form language is borrowed from sonar, radar, and oscilloscope readouts: arcs that emanate from a single origin point carry the authority of data, not ornament. Every curve is functional. Every radius is chosen.

Space is the primary material. Negative space holds the invisible — the latency between signal sent and signal received, the milliseconds that determine whether a visitor stays or leaves. The composition breathes outward from a fixed origin: one small, certain dot from which all meaning radiates. This origin is the product itself — the ping, the measurement, the moment of contact. It is rendered with the confidence of someone who has labored over this single point for months, refining its weight, its placement, its relationship to the arcs that follow.

Color carries exactly two functions and no others. The primary teal (#10D9A0) belongs to signal — it marks where energy is, where measurement lives, where the technology speaks. The background (#0B0E16) is the void being measured. The secondary white holds language — the wordmark, the labels — as a secondary register that defers to the geometry. No gradients. No shadows. No decoration unearned by function. The palette is the product of obsessive reduction, each hue chosen after eliminating everything that was not essential.

Typography is the closing note of a composition that is primarily silent. The wordmark uses weight and contrast to split its meaning: the first word announces the action (teal, alive, present) while the second names the outcome (white, settled, complete). Letter spacing is tight — the words nearly touch — because precision leaves no waste. The typeface is grotesque in the truest sense: warm enough for a small business audience, structured enough to carry technical authority. This balance is the result of countless refinements, a painstaking calibration between approachability and expertise.

The whole system is built to function at extremes of scale: a 16x16 favicon that holds its meaning as a single arc and dot, and a full wordmark that reads at twenty feet. This range demands the kind of master-level execution where every stroke weight, every anchor point, every optical compensation is deliberate. The mark should look as though it was drawn by someone who has drawn ten thousand marks and knows exactly what makes this one right.

## Design Tokens

The philosophy above is enforced in code, not just prose. `lib/designTokens.ts` is the single source of truth for every color and font size on the site — no component should hardcode a hex value or a raw font-size number that duplicates one of these. This exists because, as of 2026-08-08, the site had drifted to 115 distinct hardcoded hex values across 649 occurrences in 10 files, which is exactly the kind of accidental variation this philosophy exists to prevent.

**Colors** (`colors` from `lib/designTokens.ts`):

| Token | Hex | Role |
| --- | --- | --- |
| `void` | `#0B0E16` | The background — the void being measured |
| `surface` | `#0D1528` | Card and panel backgrounds |
| `surfaceInset` | `#111827` | Nested/inset surfaces (stat tiles, input fields) |
| `border` | `#1E3050` | Hairline borders and dividers |
| `signal` | `#10D9A0` | The one brand color — live data, emphasis, primary CTAs, "pass" status |
| `textPrimary` | `#F1F5F9` | Language — headlines, primary copy |
| `textSecondary` | `#94A3B8` | Language — supporting copy, labels, captions |
| `statusFail` | `#F87171` | "Fail" / critical-severity status only |
| `statusWarn` | `#FBBF24` | "Warn" / moderate-severity status only |

Nine colors, not two, because a diagnostic tool has to show pass/fail/warn states — but every one of the nine still serves signal, language, or structure. Nothing is decorative. A handful of pages use one or two additional colors outside this set on purpose — e.g. a categorical severity scale (Critical/Serious/Moderate/Minor) or a Kanban pipeline stage list that genuinely needs more than nine distinguishable hues. Those are documented exceptions in the component itself, not drift.

**Type scale** (`fontSize` from `lib/designTokens.ts`), matching the 16px-minimum rule:

| Token | Size | Role |
| --- | --- | --- |
| `label` | 16px | Captions, labels, helper text — the floor, never smaller |
| `body` | 17px | Description and paragraph text |
| `bodyLarge` | 18px | Emphasized body copy |
| `heading` | 22px | Minimum heading size |

Large display numbers (hero stats, score counters) and responsive `clamp()` headings fall outside this four-value scale by design and stay as literals where they appear.
