import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — Free Speed Test + LocalSEOAEOPro Fix Options",
  description: "PingClose speed tests are free. For full-site fixes — lazy loading, schema markup, and page optimization — see LocalSEOAEOPro pricing.",
  alternates: { canonical: "https://pingclose.com/pricing" },
  openGraph: {
    title: "PingClose Pricing",
    description: "Free above-the-fold speed test. Full-site fixes at LocalSEOAEOPro.",
    url: "https://pingclose.com/pricing",
  },
};

const TEAL = "#10D9A0";
const NAVY = "#0D1528";
const BORDER = "#1E3050";
const RED = "#F87171";

const schema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Web Page Speed Monitor by PingClose",
  "description": "PingClose tests your website's above-the-fold load speed for free. Goal: under 1 second. For full-site fixes, visit LocalSEOAEOPro.",
  "url": "https://pingclose.com/pricing"
};

export default function PricingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0B0E16", color: "#F1F5F9", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{`
        .btn-teal {
          transition: transform 160ms cubic-bezier(0.23,1,0.32,1), box-shadow 160ms cubic-bezier(0.23,1,0.32,1);
        }
        .btn-teal:hover { transform: translateY(-2px); box-shadow: 0 10px 28px #10D9A040; }
        .btn-teal:active { transform: scale(0.97); box-shadow: none; }

        .btn-purple {
          transition: transform 160ms cubic-bezier(0.23,1,0.32,1), box-shadow 160ms cubic-bezier(0.23,1,0.32,1);
        }
        .btn-purple:hover { transform: translateY(-2px); box-shadow: 0 10px 28px #A78BFA40; }
        .btn-purple:active { transform: scale(0.97); box-shadow: none; }

        .card-hover {
          transition: transform 200ms cubic-bezier(0.23,1,0.32,1), box-shadow 200ms cubic-bezier(0.23,1,0.32,1);
        }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 20px 48px rgba(0,0,0,0.35); }

        .link-subtle { transition: color 160ms cubic-bezier(0.23,1,0.32,1); }
        .link-subtle:hover { color: #94A3B8 !important; }

        .link-purple { transition: color 160ms cubic-bezier(0.23,1,0.32,1); }
        .link-purple:hover { color: #C4B5FD !important; }

        @media (prefers-reduced-motion: no-preference) {
          @keyframes featureIn {
            from { opacity: 0; transform: translateY(5px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .feature-item { animation: featureIn 280ms cubic-bezier(0.23,1,0.32,1) both; }
          .feature-item:nth-child(1) { animation-delay: 0ms; }
          .feature-item:nth-child(2) { animation-delay: 30ms; }
          .feature-item:nth-child(3) { animation-delay: 60ms; }
          .feature-item:nth-child(4) { animation-delay: 90ms; }
          .feature-item:nth-child(5) { animation-delay: 120ms; }
          .feature-item:nth-child(6) { animation-delay: 150ms; }
        }
        @media (prefers-reduced-motion: reduce) {
          .btn-teal, .btn-purple, .card-hover { transition: none !important; }
          .btn-teal:hover, .btn-purple:hover, .card-hover:hover { transform: none !important; box-shadow: none !important; }
        }
        @media (hover: hover) and (pointer: fine) {
          .btn-teal:focus-visible, .btn-purple:focus-visible { outline: 2px solid #10D9A0; outline-offset: 3px; }
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Header */}
      <div style={{ background: NAVY, borderBottom: `1px solid ${BORDER}`, padding: "48px 24px 48px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <Link href="/" style={{ fontSize: 24, fontWeight: 800, color: TEAL, textDecoration: "none" }}>
            Ping<span style={{ color: "#F1F5F9" }}>Close</span>
          </Link>

          {/* Hero H1 box */}
          <div style={{
            margin: "28px 0 0",
            padding: "36px 32px 32px",
            background: "linear-gradient(135deg, #10D9A012 0%, #0D1528 100%)",
            border: `2px solid ${TEAL}50`,
            borderRadius: 16,
            boxShadow: `0 0 40px ${TEAL}15`
          }}>
            <h1 style={{ fontSize: "clamp(28px, 4.5vw, 48px)", fontWeight: 800, margin: "0 0 16px", letterSpacing: "-1.5px", lineHeight: 1.15, color: "#F9FAFB" }}>
              Web Page Speed Monitor<br />
              <span style={{ color: TEAL }}>by PingClose</span>
            </h1>
            <p style={{ fontSize: 19, color: "#CBD5E1", margin: "0 auto 24px", maxWidth: 560, lineHeight: 1.6 }}>
              Free above-the-fold speed test. Goal: load in under 1 second.<br />
              PingClose finds the problems. LocalSEOAEOPro fixes them.
            </p>
            <Link href="/" className="btn-teal" style={{
              display: "inline-block",
              background: TEAL, color: "#0B0E16",
              fontSize: 17, fontWeight: 700,
              padding: "14px 32px", borderRadius: 10,
              textDecoration: "none"
            }}>
              Ping My Site Free →
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Pricing to test your website for speed */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, margin: "0 0 8px", textAlign: "center", letterSpacing: "-0.5px" }}>
            Pricing to Test Your Website for Speed
          </h2>
          <p style={{ fontSize: 18, color: "#64748B", textAlign: "center", margin: "0 0 32px", lineHeight: 1.6 }}>
            PingClose tells you your above-the-fold score. LocalSEOAEOPro makes it pass.
          </p>

          <div className="responsive-grid-2col" style={{ gap: 16, marginBottom: 24 }}>
            {/* Free audit column */}
            <div className="card-hover" style={{ background: TEAL + "08", border: `2px solid ${TEAL}40`, borderRadius: 12, padding: "28px 24px" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: TEAL, letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>Free — PingClose Audit</div>
              <div style={{ fontSize: 19, fontWeight: 700, color: "#F1F5F9", marginBottom: 4 }}>Above-the-Fold Speed Test</div>
              <div style={{ fontSize: 16, color: "#64748B", marginBottom: 20 }}>Goal: load in under 1 second</div>
              {[
                "Above-the-fold load time",
                "Mobile score (0–100)",
                "Core Web Vitals — LCP, CLS, INP",
                "Time to First Byte (TTFB)",
                "Render-blocking scripts detected",
                "Pass / fail vs. 1-second benchmark",
              ].map((text, i) => (
                <div key={i} className="feature-item" style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <span style={{ color: TEAL, flexShrink: 0, fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 16, color: "#94A3B8" }}>{text}</span>
                </div>
              ))}
              <Link href="/" className="btn-teal" style={{
                display: "block", textAlign: "center", marginTop: 20,
                background: TEAL, color: "#0B0E16",
                fontSize: 16, fontWeight: 700,
                padding: "12px 20px", borderRadius: 10,
                textDecoration: "none"
              }}>
                Run My Free Audit →
              </Link>
            </div>

            {/* Fix column — LocalSEOAEOPro */}
            <div className="card-hover" style={{ background: "#A78BFA10", border: "2px solid #A78BFA40", borderRadius: 12, padding: "28px 24px" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#A78BFA", letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>LocalSEOAEOPro — Full Fix</div>
              <div style={{ fontSize: 19, fontWeight: 700, color: "#F1F5F9", marginBottom: 4 }}>Above + Below the Fold</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#F1F5F9", marginBottom: 4 }}>$495</div>
              <div style={{ fontSize: 16, color: "#64748B", marginBottom: 20 }}>to correct your speed — additional fixes available à la carte</div>
              {[
                "All above-the-fold issues fixed",
                "Lazy loading on every page below the fold",
                "Images load only when the visitor reaches them",
                "Schema markup throughout the entire site",
                "Every page — not just the homepage",
                "Done in 24 hours — flat fee",
              ].map((text, i) => (
                <div key={i} className="feature-item" style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                  <span style={{ color: "#A78BFA", flexShrink: 0, fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 16, color: "#F1F5F9", fontWeight: 600 }}>{text}</span>
                </div>
              ))}
              <a href="https://localseoaeopro.com/pricing" className="btn-purple" style={{
                display: "block", textAlign: "center", marginTop: 20,
                background: "#A78BFA", color: "#0B0E16",
                fontSize: 16, fontWeight: 700,
                padding: "12px 20px", borderRadius: 10,
                textDecoration: "none"
              }}>
                See Fix Pricing at LocalSEOAEOPro →
              </a>
            </div>
          </div>

          {/* Below the fold callout */}
          <div style={{ background: NAVY, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px 28px" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#F1F5F9", marginBottom: 10 }}>
              Why below-the-fold matters as much as above it
            </div>
            <p style={{ fontSize: 16, color: "#94A3B8", margin: "0 0 12px", lineHeight: 1.7 }}>
              Free speed tools — including PingClose — measure what loads in your visitor&apos;s first screen. That&apos;s the above-the-fold benchmark. But your visitors scroll. Every image, section, and element below the fold needs to lazy load — meaning it should only load when the visitor reaches it, not all at once when the page opens.
            </p>
            <p style={{ fontSize: 16, color: "#94A3B8", margin: 0, lineHeight: 1.7 }}>
              When below-the-fold content loads all at once, your mobile data usage spikes, your score drops, and Google sees a slow site. LocalSEOAEOPro fixes lazy loading on every page and installs proper schema markup throughout your entire site — not just the homepage — so Google can read and rank every page correctly.
            </p>
          </div>
        </div>

        {/* What PingClose measures */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 24px", textAlign: "center" }}>
            What PingClose Measures
          </h2>
          <div className="responsive-grid-2col" style={{ gap: 16 }}>
            <div style={{ background: RED + "10", border: `1px solid ${RED}30`, borderRadius: 12, padding: "24px" }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: RED, marginBottom: 16 }}>❌ What Free Tools Give You</div>
              {[
                "A score",
                "A list of problems",
                "No explanation of what matters most",
                "No fix — just a report",
              ].map((item, i) => (
                <div key={i} style={{ fontSize: 16, color: "#94A3B8", marginBottom: 10, display: "flex", gap: 10 }}>
                  <span style={{ color: RED, flexShrink: 0 }}>→</span>{item}
                </div>
              ))}
            </div>
            <div style={{ background: TEAL + "10", border: `1px solid ${TEAL}30`, borderRadius: 12, padding: "24px" }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: TEAL, marginBottom: 16 }}>✅ What PingClose Gives You</div>
              {[
                "Your above-the-fold score",
                "Pass / fail vs. 1-second benchmark",
                "Every issue ranked by severity",
                "Your top 3 recommendations to clear the hurdle",
              ].map((item, i) => (
                <div key={i} style={{ fontSize: 16, color: "#94A3B8", marginBottom: 10, display: "flex", gap: 10 }}>
                  <span style={{ color: TEAL, flexShrink: 0 }}>✓</span>{item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{
          background: NAVY,
          border: `1px solid ${BORDER}`,
          borderRadius: 16, padding: "40px 32px",
          textAlign: "center"
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 12px", letterSpacing: "-0.5px" }}>
            Ready to hear that phone ring?
          </h2>
          <p style={{ fontSize: 18, color: "#94A3B8", margin: "0 0 28px", lineHeight: 1.6 }}>
            Ping your site. See your score. Know exactly what&apos;s holding you back.<br />
            Free. No account. No credit card. 60 seconds.
          </p>
          <Link href="/" className="btn-teal" style={{
            display: "inline-block",
            background: TEAL, color: "#0B0E16",
            fontSize: 18, fontWeight: 700,
            padding: "16px 40px", borderRadius: 10,
            textDecoration: "none"
          }}>
            Ping My Site — It&apos;s Free →
          </Link>
          <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            <Link href="/faq" className="link-subtle" style={{ fontSize: 16, color: "#475569", textDecoration: "none" }}>
              Have questions? Read our FAQ →
            </Link>
            <a href="https://localseoaeopro.com/pricing" className="link-purple" style={{ fontSize: 16, color: "#A78BFA", textDecoration: "none" }}>
              See fix pricing at LocalSEOAEOPro →
            </a>
          </div>
        </div>

      </div>
    </main>
  );
}
