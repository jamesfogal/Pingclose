"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useRef } from "react";
import Link from "next/link";

const CHECKS = [
  // Speed signals
  "Mobile performance score",
  "Desktop performance score",
  "Server response time (TTFB)",
  "Largest Contentful Paint (LCP)",
  "First Contentful Paint (FCP)",
  "Cumulative Layout Shift (CLS)",
  "Interaction to Next Paint (INP)",
  "Total Blocking Time (TBT)",
  "Total page size",
  "Total network requests",
  "1-second load test",
  "Image count & WebP status",
  "Lazy loading detection",
  "Largest image size",
  "Render-blocking scripts",
  "Unused JavaScript",
  "Unused CSS",
  "Browser caching",
  "Font display issues",
  "Google Tag Manager bloat",
  "Rocket Loader conflict",
  "Video detection",
  "Missing image alt text",
  "Mobile vs desktop gap",
  "Speed improvement opportunities",
  // Tech stack
  "CMS / platform detection",
  "Page builder detection",
  "CDN detection",
  "Hosting provider",
  "Hosting speed verdict",
  "E-commerce platform",
  "HTTP version",
  "HTTPS status",
  "Title tag",
  "Meta description",
  "H1 tag",
  "Canonical tag",
  "Robots.txt",
  "Sitemap.xml",
  "Primary keyword",
  "FAQ schema markup",
  "Pricing schema markup",
  "LocalBusiness schema",
  "Review / rating schema",
  "Google Analytics 4",
  "Google Tag Manager",
  "Facebook Pixel",
  "TikTok Pixel",
  "Call tracking",
  "Uptime monitoring",
  "Backup detection",
  "Images missing alt text",
  "Video autoplay",
  "WordPress plugin issues",
];

function CountdownTimer() {
  const [current, setCurrent] = useState(CHECKS.length); // 54 → 0
  const [label, setLabel] = useState(CHECKS[0]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Spread 54 ticks across ~28 seconds → ~520ms per tick
    const msPerTick = 28000 / CHECKS.length;
    let idx = 0;

    intervalRef.current = setInterval(() => {
      idx++;
      if (idx >= CHECKS.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setCurrent(0);
        setLabel("Building your report…");
        return;
      }
      setCurrent(CHECKS.length - idx);
      setLabel(CHECKS[idx]);
    }, msPerTick);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const progress = ((CHECKS.length - current) / CHECKS.length) * 100;

  return (
    <div style={{ textAlign: "center" }}>

      {/* Big number */}
      <div style={{
        fontSize: "clamp(80px, 18vw, 120px)",
        fontWeight: 800,
        color: current === 0 ? "#10D9A0" : "#F1F5F9",
        lineHeight: 1,
        letterSpacing: "-4px",
        marginBottom: 8,
        fontVariantNumeric: "tabular-nums",
        transition: "color 0.3s",
      }}>
        {current}
      </div>

      {/* Label */}
      <div style={{ fontSize: 17, color: "#64748B", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.12em" }}>
        Items Being Checked
      </div>

      {/* Current check name */}
      <div style={{
        fontSize: 18,
        color: "#10D9A0",
        fontWeight: 600,
        minHeight: 28,
        marginBottom: 32,
        transition: "opacity 0.15s",
      }}>
        {label}
      </div>

      {/* Progress bar */}
      <div style={{
        background: "#0D1528",
        border: "1px solid #1E3050",
        borderRadius: 8, height: 8,
        overflow: "hidden", marginBottom: 20,
      }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #10D9A0, #60A5FA)",
          borderRadius: 8,
          transition: `width ${28000 / CHECKS.length}ms linear`,
        }} />
      </div>

    </div>
  );
}

function CheckContent() {
  const params = useSearchParams();
  const duplicate = params.get("duplicate");
  const limit = params.get("limit");
  const reportId = params.get("id");
  const pendingUrl = params.get("url");
  const pendingEmail = params.get("email");

  const [status, setStatus] = useState<"running" | "ready" | "duplicate" | "limit" | "error">(
    duplicate ? "duplicate" : limit ? "limit" : reportId ? "ready" : "running"
  );
  const [doneId, setDoneId] = useState<string | null>(reportId);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!pendingUrl || !pendingEmail) return;

    const run = async () => {
      try {
        const res = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: pendingUrl, email: pendingEmail })
        });
        const data = await res.json();

        if (data.duplicate) { setStatus("duplicate"); return; }
        if (data.limit)     { setStatus("limit");     return; }
        if (data.error)     { setStatus("error"); setErrorMsg(data.error); return; }

        setDoneId(data.reportId);
        setStatus("ready");
      } catch {
        setStatus("error");
        setErrorMsg("Something went wrong. Please try again.");
      }
    };

    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Report is ready ──────────────────────────────────────────────
  if (status === "ready" && doneId) {
    return (
      <main style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0B0E16 0%, #0D1528 50%, #0B0E16 100%)",
        color: "#F1F5F9",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px", position: "relative", overflow: "hidden"
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
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "#10D9A015", border: "2px solid #10D9A040",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px", fontSize: 32
          }}>✓</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.5px", color: "#F1F5F9" }}>
            Your report is ready.
          </h1>
          <p style={{ fontSize: 18, color: "#94A3B8", lineHeight: 1.6, margin: "0 0 36px" }}>
            We checked 54 items and found everything — the good and the bad.
          </p>
          <a
            href={`/report/${doneId}`}
            style={{
              display: "inline-block", background: "#10D9A0", color: "#0B0E16",
              fontSize: 18, fontWeight: 700, padding: "16px 36px",
              borderRadius: 10, textDecoration: "none", letterSpacing: "-0.3px", marginBottom: 20,
            }}
          >
            View Your Full Report →
          </a>
          <p style={{ fontSize: 16, color: "#475569", margin: "0 0 48px" }}>
            We also sent it to your inbox — the link is permanent and shareable.
          </p>
          <div style={{
            background: "#0D1528", border: "1px solid #1E3050",
            borderRadius: 12, padding: "20px 24px", textAlign: "left", marginBottom: 32
          }}>
            <div style={{ fontSize: 13, color: "#64748B", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 14, textTransform: "uppercase" }}>
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
                <span style={{ color: "#10D9A0", fontSize: 16, flexShrink: 0, marginTop: 2 }}>✓</span>
                <span style={{ fontSize: 16, color: "#94A3B8" }}>{item}</span>
              </div>
            ))}
          </div>
          <Link href="/" style={{ fontSize: 16, color: "#475569", textDecoration: "none" }}>
            ← Back to PingClose
          </Link>
        </div>
      </main>
    );
  }

  // ── Duplicate ────────────────────────────────────────────────────
  if (status === "duplicate") {
    return (
      <main style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0B0E16 0%, #0D1528 50%, #0B0E16 100%)",
        color: "#F1F5F9", fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px", position: "relative", overflow: "hidden"
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
          <Link href="/" style={{ fontSize: 16, color: "#475569", textDecoration: "none" }}>
            ← Back to PingClose
          </Link>
        </div>
      </main>
    );
  }

  // ── Rate limit ───────────────────────────────────────────────────
  if (status === "limit") {
    return (
      <main style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0B0E16 0%, #0D1528 50%, #0B0E16 100%)",
        color: "#F1F5F9", fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}>
        <div style={{ textAlign: "center", maxWidth: "480px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
          <div style={{ fontSize: "26px", fontWeight: 800, marginBottom: "12px" }}>You&apos;ve Been Busy!</div>
          <div style={{ fontSize: "16px", color: "#94A3B8", marginBottom: "24px", lineHeight: 1.6 }}>
            You&apos;ve run 5 free audits today — that&apos;s the daily limit. Come back tomorrow for more free audits.
          </div>
          <div style={{
            background: "#111827", border: "1px solid #1F2937", borderRadius: "12px",
            padding: "20px", marginBottom: "24px",
          }}>
            <div style={{ fontSize: "16px", color: "#64748B", marginBottom: "8px" }}>Need more audits right now?</div>
            <div style={{ fontSize: "16px", color: "#F1F5F9" }}>
              Call or text <a href="tel:+13145172533" style={{ color: "#10D9A0", fontWeight: 700 }}>(314) 517-2533</a> — Jim Fogal
            </div>
          </div>
          <Link href="/" style={{
            display: "inline-block", background: "#10D9A0", color: "#0B0E16",
            fontWeight: 700, fontSize: "16px", padding: "12px 32px",
            borderRadius: "8px", textDecoration: "none",
          }}>
            Back to PingClose
          </Link>
        </div>
      </main>
    );
  }

  // ── Error ────────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <main style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0B0E16 0%, #0D1528 50%, #0B0E16 100%)",
        color: "#F1F5F9", fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}>
        <div style={{ textAlign: "center", maxWidth: "480px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <div style={{ fontSize: "24px", fontWeight: 800, marginBottom: "12px" }}>Something went wrong</div>
          <div style={{ fontSize: "16px", color: "#94A3B8", marginBottom: "28px", lineHeight: 1.6 }}>
            {errorMsg || "The audit couldn't complete. Please try again."}
          </div>
          <Link href="/" style={{
            display: "inline-block", background: "#10D9A0", color: "#0B0E16",
            fontWeight: 700, fontSize: "16px", padding: "14px 32px",
            borderRadius: "8px", textDecoration: "none",
          }}>
            ← Try Again
          </Link>
        </div>
      </main>
    );
  }

  // ── Running — countdown ──────────────────────────────────────────
  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0B0E16 0%, #0D1528 50%, #0B0E16 100%)",
      color: "#F1F5F9",
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(#10D9A0 1px, transparent 1px), linear-gradient(90deg, #10D9A0 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />

      <div style={{ maxWidth: 480, width: "100%", position: "relative" }}>

        {/* Logo */}
        <div style={{ fontSize: 28, fontWeight: 800, color: "#10D9A0", marginBottom: 40, letterSpacing: "-1px", textAlign: "center" }}>
          Ping<span style={{ color: "#F1F5F9" }}>Close</span>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.5px", color: "#F1F5F9" }}>
            54 Items We&apos;re Checking.
          </h1>
          <p style={{ fontSize: 17, color: "#64748B", margin: 0 }}>
            Let&apos;s countdown to get your results.
          </p>
        </div>

        {/* The countdown */}
        <CountdownTimer />

        {/* Footer note */}
        <p style={{ fontSize: 16, color: "#475569", textAlign: "center", margin: "8px 0 24px" }}>
          Your report will also land in your inbox.
        </p>

        <div style={{ textAlign: "center" }}>
          <Link href="/" style={{ fontSize: 16, color: "#374151", textDecoration: "none" }}>
            ← Cancel
          </Link>
        </div>
      </div>
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
