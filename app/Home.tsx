import AuditForm from "./AuditForm";
import PingCtaButton from "./PingCtaButton";
import StickyNav from "./StickyNav";
import { colors, fontSize } from "@/lib/designTokens";

const schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "PingClose",
  "url": "https://pingclose.com",
  "description": "Free above-the-fold website speed test for local businesses. Checks 74 signals and identifies exactly what is slowing your site down.",
  "applicationCategory": "BusinessApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "operatingSystem": "Web"
};

// Server Component: the headline, hero copy, preview card, and everything
// below the fold ship as plain HTML with zero JS dependency for paint.
// Only AuditForm and PingCtaButton are Client Components, isolated so their
// JS never gates the LCP element's render.
export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: colors.void, color: colors.textPrimary, fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 16 }}>
      <style>{`
        input::placeholder { color: ${colors.textSecondary}; }
        * { box-sizing: border-box; }
        .stats-grid { grid-template-columns: repeat(3, 1fr); }
        .nav-btn { transition: background 180ms cubic-bezier(0.23,1,0.32,1), transform 160ms cubic-bezier(0.23,1,0.32,1); }
        .nav-btn:hover { background: ${colors.signal}25; }
        .check-item { transition: background 150ms cubic-bezier(0.23,1,0.32,1); }
        .check-item:hover { background: ${colors.signal}08; }
        .footer-link, .footer-link-teal { transition: color 160ms cubic-bezier(0.23,1,0.32,1); }
        .footer-link:hover { color: ${colors.textPrimary}; }
        .footer-link-teal:hover { color: ${colors.signal}; }
        @media (max-width: 768px) {
          .stats-grid   { grid-template-columns: 1fr !important; }
          .site-pad     { padding-left: 28px !important; padding-right: 28px !important; }
        }
        @media (hover: hover) and (pointer: fine) {
          a:active { transform: scale(0.97); }
        }
        @media (prefers-reduced-motion: no-preference) {
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.4; }
          }
          @keyframes growUp {
            from { transform: scaleY(0.92); opacity: 0; }
            to   { transform: scaleY(1);    opacity: 1; }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes pulse  { 50% { opacity: 0.6; } }
          @keyframes growUp { from { opacity: 0; } to { opacity: 1; } }
        }
      `}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <StickyNav />

      {/* ── ABOVE THE FOLD ──────────────────────────────────────── */}
      <section className="site-pad" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "60px 24px 40px",
        background: `linear-gradient(135deg, ${colors.void} 0%, ${colors.surface} 50%, ${colors.void} 100%)`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: `linear-gradient(${colors.signal} 1px, transparent 1px), linear-gradient(90deg, ${colors.signal} 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />

        {/* Logo + Nav */}
        <div style={{ marginBottom: 48, textAlign: "center", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 14, marginBottom: 20 }}>
            {/* CSS radar icon — zero image requests */}
            <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
              <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                <div style={{ position: "absolute", width: 88, height: 88, bottom: -44, left: -44, borderRadius: "50%", border: `1.5px solid ${colors.signal}`, opacity: 0.28 }} />
                <div style={{ position: "absolute", width: 60, height: 60, bottom: -30, left: -30, borderRadius: "50%", border: `2px solid ${colors.signal}`, opacity: 0.58 }} />
                <div style={{ position: "absolute", width: 34, height: 34, bottom: -17, left: -17, borderRadius: "50%", border: `2.5px solid ${colors.signal}`, opacity: 1 }} />
              </div>
              <div style={{ position: "absolute", bottom: -4, left: -4, width: 8, height: 8, background: colors.signal, borderRadius: "50%", boxShadow: "0 0 0 4px rgba(16,217,160,0.1), 0 0 0 8px rgba(16,217,160,0.05)" }} />
            </div>
            <div style={{ fontSize: "clamp(48px, 8vw, 84px)", fontWeight: 800, color: colors.signal, letterSpacing: "-2px", lineHeight: 1, fontFamily: "var(--font-geist-sans)" }}>
              Ping<span style={{ color: colors.textPrimary }}>Close</span>
            </div>
          </div>
          <p style={{ fontSize: fontSize.body, color: colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
            We are a click monitor. The faster you are, the more clicks you receive.
          </p>
        </div>

        {/* Hero: headline + form, single centered column */}
        <div style={{ width: "100%", maxWidth: 640, position: "relative", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${colors.signal}10`, border: `1px solid ${colors.signal}30`, borderRadius: 20, padding: "6px 14px", marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: colors.signal, animation: "pulse 2s ease-in-out infinite" }} />
            <span style={{ fontSize: 16, color: colors.signal, fontWeight: 600 }}>Live · 74 signals · 60 seconds · Free</span>
          </div>
          <h1 style={{ fontSize: "clamp(36px, 5.5vw, 68px)", fontWeight: 800, lineHeight: 1.05, margin: "0 0 24px", letterSpacing: "-1.5px", color: colors.textPrimary }}>
            Ping Your Website to See How Many<br />
            <span style={{ color: colors.signal }}>Clicks You Are Losing.</span>
          </h1>
          <p style={{ fontSize: fontSize.bodyLarge, color: colors.textPrimary, margin: "0 0 32px", lineHeight: 1.6 }}>
            Ping your site and find out right now. We check 74 signals and tell you exactly what&apos;s slowing you down.
          </p>

          <div style={{ textAlign: "left" }}>
            <AuditForm />
          </div>

          <div style={{ display: "flex", gap: 20, marginTop: 18, flexWrap: "wrap", justifyContent: "center" }}>
            {["No account needed", "No credit card", "Results in 60 seconds"].map(t => (
              <span key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: fontSize.label, color: colors.textSecondary }}>
                <span style={{ color: colors.signal }}>✓</span> {t}
              </span>
            ))}
          </div>
          <a href="#hurdles" style={{ display: "block", marginTop: 24, fontSize: fontSize.body, color: colors.textSecondary, textDecoration: "none" }}>
            Why does 1 second matter? ↓
          </a>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────── */}
      <section className="site-pad" style={{ padding: "36px 24px", background: colors.void, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
        <div className="stats-grid" style={{ maxWidth: 1040, margin: "0 auto", display: "grid", gap: 0, textAlign: "center" }}>
          {[
            ["53%", "of visitors leave if your page takes over 3 seconds"],
            ["74", "signals checked on every free audit"],
            ["<1s", "Google's target for above-the-fold load time"],
          ].map(([stat, label], i) => (
            <div key={stat} style={{ padding: "20px 24px", borderRight: i < 2 ? `1px solid ${colors.border}` : "none" }}>
              <div style={{ fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 800, color: colors.signal, letterSpacing: "-1px", lineHeight: 1 }}>{stat}</div>
              <div style={{ fontSize: fontSize.label, color: colors.textSecondary, marginTop: 8, lineHeight: 1.5 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HURDLE SECTION ──────────────────────────────────────── */}
      <section id="hurdles" className="site-pad" style={{ padding: "90px 24px", background: colors.void, textAlign: "center" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 800, margin: "0 0 20px", letterSpacing: "-1px" }}>
            If You Can&apos;t Clear the First Hurdle,<br />
            <span style={{ color: colors.statusFail }}>You Can&apos;t Win the Race</span>
          </h2>
          <p style={{ fontSize: fontSize.bodyLarge, color: colors.textSecondary, margin: "0 0 56px", lineHeight: 1.6 }}>
            Google&apos;s first hurdle is loading your website in under 1 second on a 4G phone.<br />
            Most local businesses fail it before the race even begins.
          </p>

          {/* Animated comparison bars */}
          <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 16, padding: "40px 32px", marginBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 80, alignItems: "flex-end", marginBottom: 28 }}>
              {[
                { label: "Fast Competitor", pct: 36,  color: colors.signal, verdict: "4 ft hurdle ✅",  delay: "0.2s" },
                { label: "Your Slow Site",  pct: 100, color: colors.statusFail, verdict: "10 ft hurdle 🔴", delay: "0.5s" },
              ].map(({ label, pct, color, verdict, delay }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: fontSize.label, color, fontWeight: 700 }}>{label}</div>
                  <div style={{ width: 56, height: 160, background: colors.void, borderRadius: 6, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                    <div style={{
                      width: "100%", height: `${pct}%`, background: color,
                      borderRadius: "4px 4px 0 0", transformOrigin: "bottom",
                      animation: `growUp 0.9s ${delay} cubic-bezier(0.34,1.56,0.64,1) both`,
                      boxShadow: `0 0 20px ${color}40`,
                    }} />
                  </div>
                  <div style={{ fontSize: fontSize.label, color: colors.textSecondary }}>{verdict}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: fontSize.label, color: colors.textSecondary, margin: 0, lineHeight: 1.6 }}>
              Every fast competitor sees a 4 ft hurdle. A slow site makes yours{" "}
              <strong style={{ color: colors.statusFail }}>10 feet tall</strong> — before the race even starts.
            </p>
          </div>

          <p style={{ fontSize: fontSize.bodyLarge, color: colors.textSecondary, lineHeight: 1.7, maxWidth: 560, margin: "0 auto 48px" }}>
            How difficult is it to win when you can&apos;t clear the first one?<br />
            PingClose shows you exactly where you stand — in 60 seconds.
          </p>

          {/* What We Check */}
          <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 16, padding: "32px 24px", textAlign: "left", maxWidth: 560, margin: "0 auto 48px" }}>
            <div style={{ fontSize: fontSize.label, fontWeight: 700, color: colors.textSecondary, letterSpacing: "0.08em", marginBottom: 24, textTransform: "uppercase" }}>
              What We Check in 60 Seconds
            </div>
            {[
              ["⚡", "Speed Signals",  "TTFB, LCP, FCP, CLS, INP — every Core Web Vital"],
              ["🖼️", "Image Analysis", "WebP format, lazy loading, render-blocking images"],
              ["🔧", "Tech Stack",     "Who hosts it, what CMS, CDN, HTTP version"],
              ["📜", "Code Analysis",  "Render-blocking scripts, unused JS/CSS, minification"],
              ["📱", "4G Mobile Test", "Real-world load speed on a mobile connection"],
              ["🏆", "The Verdict",    "Pass/fail with your top issues to fix first"],
            ].map(([icon, title, desc]) => (
              <div key={String(title)} className="check-item"
                style={{ display: "flex", gap: 16, marginBottom: 16, padding: "10px 12px", borderRadius: 8, cursor: "default" }}
              >
                <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: fontSize.body, fontWeight: 600, color: colors.textPrimary, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: fontSize.label, color: colors.textSecondary }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <PingCtaButton />

          <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            <a href="/faq" className="footer-link" style={{ fontSize: fontSize.label, color: colors.textSecondary, textDecoration: "none" }}>
              Have questions? Read our FAQ →
            </a>
            <a href="/pricing" className="footer-link-teal" style={{ fontSize: fontSize.label, color: colors.textSecondary, textDecoration: "none" }}>
              See Pricing →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
