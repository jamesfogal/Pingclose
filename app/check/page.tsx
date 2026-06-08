"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function CheckContent() {
  const params = useSearchParams();
  const duplicate = params.get("duplicate");
  const reportId = params.get("id");

  // ── Report is ready — show CTA ──────────────────────────────────
  if (reportId) {
    return (
      <main style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0B0E16 0%, #0D1528 50%, #0B0E16 100%)",
        color: "#F1F5F9",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: "linear-gradient(#10D9A0 1px, transparent 1px), linear-gradient(90deg, #10D9A0 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        <div style={{ maxWidth: 520, width: "100%", textAlign: "center", position: "relative" }}>

          <div style={{ fontSize: 32, fontWeight: 800, color: "#10D9A0", marginBottom: 40, letterSpacing: "-1px" }}>
            Ping<span style={{ color: "#F1F5F9" }}>Close</span>
          </div>

          {/* Success icon */}
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "#10D9A015", border: "2px solid #10D9A040",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px", fontSize: 32
          }}>
            ✓
          </div>

          <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.5px", color: "#F1F5F9" }}>
            Your report is ready.
          </h1>
          <p style={{ fontSize: 18, color: "#94A3B8", lineHeight: 1.6, margin: "0 0 36px" }}>
            We&apos;ve analyzed your site and found everything — the good and the bad.
          </p>

          {/* Primary CTA */}
          <a
            href={`/report/${reportId}`}
            style={{
              display: "inline-block",
              background: "#10D9A0",
              color: "#0B0E16",
              fontSize: 18,
              fontWeight: 700,
              padding: "16px 36px",
              borderRadius: 10,
              textDecoration: "none",
              letterSpacing: "-0.3px",
              marginBottom: 20,
            }}
          >
            View Your Full Report →
          </a>

          {/* Email note */}
          <p style={{ fontSize: 15, color: "#475569", margin: "0 0 48px" }}>
            We also sent it to your inbox — the link is permanent and shareable.
          </p>

          {/* What&apos;s in the report */}
          <div style={{
            background: "#0D1528",
            border: "1px solid #1E3050",
            borderRadius: 12,
            padding: "20px 24px",
            textAlign: "left",
            marginBottom: 32
          }}>
            <div style={{ fontSize: 11, color: "#64748B", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 14, textTransform: "uppercase" }}>
              Your report includes
            </div>
            {[
              "Mobile & desktop performance scores",
              "Core Web Vitals — LCP, FCP, TTFB, CLS",
              "Hosting verdict — is your host holding you back?",
              "Every image checked for WebP & lazy loading",
              "GA4, Facebook Pixel, TikTok Pixel status",
              "Exactly what to fix and in what order",
            ].map(item => (
              <div key={item} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
                <span style={{ color: "#10D9A0", fontSize: 14, flexShrink: 0, marginTop: 2 }}>✓</span>
                <span style={{ fontSize: 15, color: "#94A3B8" }}>{item}</span>
              </div>
            ))}
          </div>

          <Link href="/" style={{ fontSize: 15, color: "#475569", textDecoration: "none" }}>
            ← Back to PingClose
          </Link>
        </div>
      </main>
    );
  }

  // ── Duplicate — already sent ─────────────────────────────────────
  if (duplicate) {
    return (
      <main style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0B0E16 0%, #0D1528 50%, #0B0E16 100%)",
        color: "#F1F5F9",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: "linear-gradient(#10D9A0 1px, transparent 1px), linear-gradient(90deg, #10D9A0 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        <div style={{ maxWidth: 520, width: "100%", textAlign: "center", position: "relative" }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#10D9A0", marginBottom: 40, letterSpacing: "-1px" }}>
            Ping<span style={{ color: "#F1F5F9" }}>Close</span>
          </div>
          <div style={{ fontSize: 56, marginBottom: 20 }}>📬</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.5px" }}>
            Already on its way!
          </h1>
          <p style={{ fontSize: 19, color: "#CBD5E1", lineHeight: 1.6, margin: "0 0 32px" }}>
            Your report is already in your inbox — check your email.
          </p>
          <Link href="/" style={{ fontSize: 15, color: "#475569", textDecoration: "none" }}>
            ← Back to PingClose
          </Link>
        </div>
      </main>
    );
  }

  // ── Fallback — landed here directly, no id or duplicate ─────────
  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0B0E16 0%, #0D1528 50%, #0B0E16 100%)",
      color: "#F1F5F9",
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(#10D9A0 1px, transparent 1px), linear-gradient(90deg, #10D9A0 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />

      <div style={{ maxWidth: 520, width: "100%", textAlign: "center", position: "relative" }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: "#10D9A0", marginBottom: 40, letterSpacing: "-1px" }}>
          Ping<span style={{ color: "#F1F5F9" }}>Close</span>
        </div>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🔍</div>
        <h1 style={{ fontSize: 34, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.5px" }}>
          Analyzing your site...
        </h1>
        <p style={{ fontSize: 19, color: "#CBD5E1", lineHeight: 1.6, margin: "0 0 40px" }}>
          We&apos;re running your full speed audit right now.<br />
          Your report will land in your inbox in about 60 seconds.
        </p>

        {/* Animated progress bar */}
        <div style={{
          background: "#0D1528",
          border: "1px solid #1E3050",
          borderRadius: 10, height: 10,
          overflow: "hidden", marginBottom: 28
        }}>
          <div style={{
            height: "100%",
            background: "linear-gradient(90deg, #10D9A0, #60A5FA)",
            borderRadius: 10,
            animation: "progress 12s ease-in-out forwards"
          }} />
        </div>

        <div style={{
          background: "#0D1528",
          border: "1px solid #1E3050",
          borderRadius: 12,
          padding: "24px",
          marginBottom: 32,
          textAlign: "left"
        }}>
          {[
            ["⚡", "Running Google PageSpeed analysis..."],
            ["🔧", "Identifying your tech stack and hosting..."],
            ["🖼️", "Auditing images and lazy loading..."],
            ["📜", "Checking for render-blocking scripts..."],
            ["📱", "Simulating 4G mobile load speed..."],
            ["🏆", "Building your report..."],
          ].map(([icon, text]) => (
            <div key={String(text)} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "center" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
              <span style={{ fontSize: 17, color: "#94A3B8" }}>{text}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 17, color: "#64748B", margin: "0 0 32px" }}>
          Check your email — your report link is permanent and shareable.
        </p>

        <Link href="/" style={{ fontSize: 15, color: "#475569", textDecoration: "none" }}>
          ← Back to PingClose
        </Link>
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          15% { width: 20%; }
          35% { width: 45%; }
          60% { width: 68%; }
          80% { width: 85%; }
          95% { width: 96%; }
          100% { width: 100%; }
        }
      `}</style>
    </main>
  );
}

export default function CheckPage() {
  return (
    <Suspense>
      <CheckContent />
    </Suspense>
  );
}
