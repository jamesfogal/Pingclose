import Link from "next/link";

const TEAL = "#10D9A0";
const NAVY = "#0D1528";
const BORDER = "#1E3050";
const RED = "#F87171";

const schema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "PingClose Website Speed & SEO Service",
  "description": "Website speed optimization, local SEO cleanup, and monthly managed SEO for local businesses. Flat fee pricing starting at $495.",
  "url": "https://pingclose.com/pricing",
  "priceRange": "$495 - $299/month",
  "areaServed": "United States",
  "offers": [
    {
      "@type": "Offer",
      "name": "Clear the First Hurdle — Site Cleanup",
      "description": "Complete website speed and SEO cleanup for sites up to 10 pages. Includes Core Web Vitals fixes, image optimization, citation audit, Google Business Profile optimization, conversion tracking, FAQ page, and pricing page.",
      "price": "495",
      "priceCurrency": "USD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "495",
        "priceCurrency": "USD",
        "unitText": "one-time"
      }
    },
    {
      "@type": "Offer",
      "name": "Run the Full Race — Monthly Managed SEO",
      "description": "Monthly managed SEO including weekly site maintenance, Google Business Profile updates, keyword gap reports, and 2 new pages per month.",
      "price": "299",
      "priceCurrency": "USD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "299",
        "priceCurrency": "USD",
        "unitText": "month"
      }
    }
  ]
};

export default function PricingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0B0E16", color: "#F1F5F9", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Header */}
      <div style={{ background: NAVY, borderBottom: `1px solid ${BORDER}`, padding: "48px 24px 40px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <Link href="/" style={{ fontSize: 24, fontWeight: 800, color: TEAL, textDecoration: "none" }}>
            Ping<span style={{ color: "#F1F5F9" }}>Close</span>
          </Link>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, margin: "20px 0 16px", letterSpacing: "-1px" }}>
            We Don&apos;t Just Find the Problems.<br />
            <span style={{ color: TEAL }}>We Fix Them.</span>
          </h1>
          <p style={{ fontSize: 19, color: "#94A3B8", margin: "0 auto", maxWidth: 600, lineHeight: 1.6 }}>
            Every other speed tool gives you a score and leaves you alone with it.
            We fix the score — for a flat fee, in 24 hours.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* The Gap Section */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 24px", textAlign: "center" }}>
            The Problem With Every Other Tool
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: RED + "10", border: `1px solid ${RED}30`, borderRadius: 12, padding: "24px" }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: RED, marginBottom: 16 }}>❌ What Everyone Else Does</div>
              {[
                "Runs a speed test",
                "Gives you a score",
                "Shows you a list of problems",
                "Bills you $150/hour to fix them",
                "Fixes one thing at a time",
                "Leaves citations and GMB to someone else",
                "Never installs conversion tracking",
              ].map((item, i) => (
                <div key={i} style={{ fontSize: 16, color: "#94A3B8", marginBottom: 10, display: "flex", gap: 10 }}>
                  <span style={{ color: RED, flexShrink: 0 }}>→</span>{item}
                </div>
              ))}
            </div>
            <div style={{ background: TEAL + "10", border: `1px solid ${TEAL}30`, borderRadius: 12, padding: "24px" }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: TEAL, marginBottom: 16 }}>✅ What PingClose Does</div>
              {[
                "Runs a free audit",
                "Shows you the score",
                "Fixes everything — flat fee",
                "Done in 24 hours",
                "Speed, citations, GMB — all of it",
                "Installs full conversion tracking",
                "Builds FAQ + pricing pages with schema",
              ].map((item, i) => (
                <div key={i} style={{ fontSize: 16, color: "#94A3B8", marginBottom: 10, display: "flex", gap: 10 }}>
                  <span style={{ color: TEAL, flexShrink: 0 }}>✓</span>{item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 8px", textAlign: "center" }}>
          The Race Plans
        </h2>
        <p style={{ fontSize: 17, color: "#64748B", textAlign: "center", margin: "0 0 32px" }}>
          Transparent pricing. No hourly surprises. No hidden fees.
        </p>

        {/* Plan 1 — Clear the First Hurdle */}
        <div style={{
          background: NAVY, border: `2px solid ${TEAL}`,
          borderRadius: 16, padding: "32px", marginBottom: 20
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, letterSpacing: "0.08em", marginBottom: 6 }}>ONE-TIME CLEANUP</div>
              <h3 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>Clear the First Hurdle</h3>
              <p style={{ fontSize: 17, color: "#94A3B8", margin: 0 }}>Everything wrong with your site — fixed. Once.</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: TEAL, lineHeight: 1 }}>$495</div>
              <div style={{ fontSize: 16, color: "#64748B" }}>starting price</div>
              <div style={{ fontSize: 15, color: "#64748B" }}>sites up to 10 pages</div>
            </div>
          </div>

          {/* What's included */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", letterSpacing: "0.06em", marginBottom: 14, textTransform: "uppercase" }}>WHAT WE FIX</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                "Speed & Core Web Vitals",
                "All images converted to WebP",
                "Render-blocking scripts cleaned up",
                "404 errors identified & fixed",
                "301 redirects cleaned up",
                "Citation audit & correction started",
                "Google Business Profile optimized",
                "GA4 + Facebook + TikTok pixels installed",
                "FAQ page built with schema markup",
                "Pricing page built with schema markup",
                "Stock photos flagged & replaced",
                "Weekly 404 & redirect monitoring setup",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: TEAL, fontSize: 15, flexShrink: 0, marginTop: 2 }}>✓</span>
                  <span style={{ fontSize: 16, color: "#94A3B8" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Page count pricing */}
          <div style={{ background: "#080F1C", borderRadius: 10, padding: "20px", marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", letterSpacing: "0.06em", marginBottom: 14, textTransform: "uppercase" }}>PRICING BY SITE SIZE</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Pages", "Price", "Example"].map(h => (
                      <th key={h} style={{ fontSize: 13, fontWeight: 700, color: "#475569", textAlign: "left", padding: "6px 12px", borderBottom: `1px solid ${BORDER}`, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["1–10 pages", "$495 flat", "Small service business"],
                    ["11–50 pages", "$495 + $10/page over 10", "25 pages = $645"],
                    ["51–200 pages", "$795 + $8/page over 50", "100 pages = $1,275"],
                    ["201–1,000 pages", "$1,595 + $5/page over 200", "300 pages = $2,095"],
                    ["1,000+ pages", "Custom quote", "Call us"],
                  ].map(([pages, price, example], i) => (
                    <tr key={i}>
                      <td style={{ fontSize: 16, color: "#F1F5F9", padding: "10px 12px", borderBottom: `1px solid ${BORDER}` }}>{pages}</td>
                      <td style={{ fontSize: 16, color: TEAL, fontWeight: 600, padding: "10px 12px", borderBottom: `1px solid ${BORDER}` }}>{price}</td>
                      <td style={{ fontSize: 16, color: "#64748B", padding: "10px 12px", borderBottom: `1px solid ${BORDER}` }}>{example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Link href="/" style={{
            display: "block", textAlign: "center",
            background: TEAL, color: "#0B0E16",
            fontSize: 18, fontWeight: 700,
            padding: "16px", borderRadius: 10,
            textDecoration: "none"
          }}>
            Ping My Site First — It&apos;s Free →
          </Link>
        </div>

        {/* Plan 2 — Run the Full Race */}
        <div style={{
          background: NAVY, border: `1px solid ${BORDER}`,
          borderRadius: 16, padding: "32px", marginBottom: 20
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#A78BFA", letterSpacing: "0.08em", marginBottom: 6 }}>MONTHLY MANAGED SEO</div>
              <h3 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>Run the Full Race</h3>
              <p style={{ fontSize: 17, color: "#94A3B8", margin: 0 }}>Stay ahead of competitors every single week.</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: "#A78BFA", lineHeight: 1 }}>$299</div>
              <div style={{ fontSize: 16, color: "#64748B" }}>per month</div>
            </div>
          </div>

          <div style={{ background: "#080F1C", borderRadius: 10, padding: "20px", marginBottom: 20 }}>
            <p style={{ fontSize: 17, color: "#94A3B8", margin: "0 0 16px", lineHeight: 1.6 }}>
              <strong style={{ color: "#F1F5F9" }}>"If you've fixed everything, why do I need monthly service?"</strong>
            </p>
            <p style={{ fontSize: 16, color: "#94A3B8", margin: 0, lineHeight: 1.7 }}>
              Because your competitors are adding pages every week. Google updates its algorithm constantly.
              Citations drift. 404 errors appear. New keyword opportunities emerge. The $299 keeps you
              ahead of all of it — permanently. Most clients pick up one extra job per month from improved
              rankings. That one job pays for the next 12 months.
            </p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#64748B", letterSpacing: "0.06em", marginBottom: 14, textTransform: "uppercase" }}>WHAT HAPPENS EVERY MONTH</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                "Weekly 404 error cleanup",
                "Weekly 301 redirect maintenance",
                "Weekly Google Business Profile update",
                "Monthly keyword gap report",
                "2 new pages per month (keyword or city)",
                "Pages target only real ranking gaps",
                "Ongoing citation corrections",
                "Monthly performance report",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: "#A78BFA", fontSize: 15, flexShrink: 0, marginTop: 2 }}>✓</span>
                  <span style={{ fontSize: 16, color: "#94A3B8" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <Link href="/" style={{
            display: "block", textAlign: "center",
            background: "transparent", color: "#A78BFA",
            fontSize: 18, fontWeight: 700,
            padding: "16px", borderRadius: 10,
            border: "2px solid #A78BFA",
            textDecoration: "none"
          }}>
            Start with a Free Audit →
          </Link>
        </div>

        {/* White Label */}
        <div style={{
          background: NAVY, border: `1px solid ${BORDER}`,
          borderRadius: 16, padding: "32px", marginBottom: 48
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#FBBF24", letterSpacing: "0.08em", marginBottom: 6 }}>FOR WEB DEVELOPERS & AGENCIES</div>
              <h3 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>Own the Track</h3>
              <p style={{ fontSize: 17, color: "#94A3B8", margin: 0 }}>White label. Your brand. Our engine.</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: "#FBBF24", lineHeight: 1 }}>$199</div>
              <div style={{ fontSize: 16, color: "#64748B" }}>per cleanup</div>
              <div style={{ fontSize: 15, color: "#64748B" }}>you set your own price</div>
            </div>
          </div>
          <p style={{ fontSize: 17, color: "#94A3B8", lineHeight: 1.6, margin: "0 0 20px" }}>
            You build the website. We make it rank. Sell our SEO cleanup to your clients for whatever you want.
            Pay us $199. Keep the difference. You do nothing except have the conversation and send a link.
            One client per week is over $1,000 a month in your pocket doing zero extra work.
          </p>
          <Link href="/" style={{
            display: "inline-block",
            background: "transparent", color: "#FBBF24",
            fontSize: 17, fontWeight: 700,
            padding: "12px 28px", borderRadius: 10,
            border: "2px solid #FBBF24",
            textDecoration: "none"
          }}>
            Ask about white label →
          </Link>
        </div>

        {/* Pricing FAQ */}
        <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 24px", textAlign: "center" }}>
          Pricing Questions
        </h2>
        {[
          {
            q: "Why is the price based on page count?",
            a: "More pages means more images to optimize, more redirects to audit, more 404 errors to fix, and more content to review. A 5-page site takes a few hours. A 150-page site takes significantly longer. Tiered pricing ensures you only pay for the work your site actually requires."
          },
          {
            q: "What if my site doesn't improve?",
            a: "If we do the work and your PageSpeed scores don't improve measurably, we make it right. We stand behind the results. Before starting any engagement we run a baseline audit so you have before and after proof of exactly what changed."
          },
          {
            q: "How long does the cleanup take?",
            a: "Most cleanups are complete within 24 hours of approval and payment. Citation corrections take longer — 2 to 4 weeks — because each directory must be contacted individually. Speed and Core Web Vitals improvements are visible immediately after the technical work is done."
          },
          {
            q: "Do I need to give you access to my website?",
            a: "Yes — for WordPress sites we need admin credentials to make changes. For other platforms we work with you on the best method. All credentials are handled securely and removed from our systems upon project completion."
          },
          {
            q: "Can I do the cleanup without the monthly service?",
            a: "Yes — the one-time cleanup stands alone. Many clients start with the cleanup, see results, and add monthly management when they're ready. There is no obligation to continue and no contract on the monthly service."
          },
        ].map((item, i) => (
          <div key={i} style={{
            borderBottom: `1px solid ${BORDER}`,
            padding: "20px 0"
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9", marginBottom: 10 }}>{item.q}</div>
            <div style={{ fontSize: 16, color: "#94A3B8", lineHeight: 1.7 }}>{item.a}</div>
          </div>
        ))}

        {/* Bottom CTA */}
        <div style={{
          marginTop: 56, background: NAVY,
          border: `1px solid ${BORDER}`,
          borderRadius: 16, padding: "40px 32px",
          textAlign: "center"
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 12px", letterSpacing: "-0.5px" }}>
            Ready to hear that phone ring?
          </h2>
          <p style={{ fontSize: 18, color: "#94A3B8", margin: "0 0 28px", lineHeight: 1.6 }}>
            Ping your site first. See your score. Then decide.<br />
            Free. No account. No credit card. 60 seconds.
          </p>
          <Link href="/" style={{
            display: "inline-block",
            background: TEAL, color: "#0B0E16",
            fontSize: 18, fontWeight: 700,
            padding: "16px 40px", borderRadius: 10,
            textDecoration: "none"
          }}>
            Ping My Site — It&apos;s Free →
          </Link>
          <div style={{ marginTop: 16 }}>
            <Link href="/faq" style={{ fontSize: 16, color: "#475569", textDecoration: "none" }}>
              Have questions? Read our FAQ →
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
