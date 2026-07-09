"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────

interface FastData {
  cms: string; pageBuilder: string | null; ecommerce: string | null;
  cdn: string | null; httpVersion: string; isHttps: boolean;
  hosting: string; hostingVerdict: string; hostingVerdictLabel: string;
  hasTitle: boolean; titleTag: string; titleLength: number;
  hasMetaDescription: boolean; metaDescriptionLength: number;
  hasH1: boolean; h1Text: string; multipleH1s: boolean;
  hasCanonical: boolean; hasRobotsTxt: boolean; hasSitemap: boolean;
  primaryKeyword: string;
  hasFAQSchema: boolean; hasPricingSchema: boolean;
  hasLocalBusinessSchema: boolean; hasReviewSchema: boolean;
  hasGA4: boolean; hasGTM: boolean; hasFacebookPixel: boolean;
  hasTikTokPixel: boolean; hasCallTracking: boolean;
  imagesWithoutAlt: string[]; wordpressPluginIssues: string[];
}

interface SpeedData {
  mobileScore: number; desktopScore: number;
  ttfb: number; lcp: number; fcp: number; cls: number;
  passesOneSecond: boolean; reportId: string;
  pageSpeedStatus: string;
}

interface Signal { label: string; value: string; status: "pass" | "fail" | "warn" | "info"; }

// ── Signal builder ────────────────────────────────────────────────────────────

function buildSignals(d: FastData): Signal[] {
  const s: Signal[] = [];
  const add = (label: string, value: string, status: Signal["status"]) => s.push({ label, value, status });

  add("CMS / Platform",       d.cms || "Unknown",                           "info");
  if (d.pageBuilder)  add("Page Builder",    d.pageBuilder,                 "info");
  if (d.ecommerce)    add("E-commerce",      d.ecommerce,                   "info");
  add("Hosting",     `${d.hosting}${d.hostingVerdictLabel ? ` — ${d.hostingVerdictLabel}` : ""}`,
    d.hostingVerdict === "fast" ? "pass" : d.hostingVerdict === "slow" ? "fail" : "warn");
  add("CDN",          d.cdn || "None detected",                             d.cdn ? "pass" : "warn");
  add("HTTP Version", d.httpVersion || "HTTP/1.1",
    (d.httpVersion === "HTTP/2" || d.httpVersion === "HTTP/3") ? "pass" : "warn");
  add("HTTPS",        d.isHttps ? "Secure" : "Not secure — missing SSL",   d.isHttps ? "pass" : "fail");
  add("Canonical tag",d.hasCanonical ? "Present" : "Missing",              d.hasCanonical ? "pass" : "warn");
  add("Robots.txt",   d.hasRobotsTxt ? "Found" : "Not found",              d.hasRobotsTxt ? "pass" : "warn");
  add("Sitemap.xml",  d.hasSitemap   ? "Found" : "Not found",              d.hasSitemap   ? "pass" : "warn");
  add("Title tag",    d.hasTitle
    ? `${(d.titleTag || "").slice(0, 48)}${d.titleLength > 48 ? "…" : ""} (${d.titleLength} chars)`
    : "Missing",
    d.hasTitle ? (d.titleLength >= 50 && d.titleLength <= 60 ? "pass" : "warn") : "fail");
  add("Meta description", d.hasMetaDescription ? `${d.metaDescriptionLength} chars` : "Missing",
    d.hasMetaDescription ? "pass" : "fail");
  if (d.multipleH1s) add("H1 tag", "Multiple H1s detected", "warn");
  else add("H1 tag", d.hasH1 ? ((d.h1Text || "").slice(0, 55) || "Present") : "Missing", d.hasH1 ? "pass" : "fail");
  if (d.primaryKeyword) add("Primary keyword", d.primaryKeyword, "info");
  add("LocalBusiness schema", d.hasLocalBusinessSchema ? "Detected" : "Missing", d.hasLocalBusinessSchema ? "pass" : "warn");
  add("FAQ schema",    d.hasFAQSchema    ? "Detected" : "Not found", d.hasFAQSchema    ? "pass" : "info");
  add("Pricing schema",d.hasPricingSchema? "Detected" : "Not found", d.hasPricingSchema? "pass" : "info");
  add("Review schema", d.hasReviewSchema ? "Detected" : "Not found", d.hasReviewSchema ? "pass" : "info");
  add("Google Analytics 4", d.hasGA4           ? "Detected" : "Missing", d.hasGA4           ? "pass" : "warn");
  add("Google Tag Manager", d.hasGTM           ? "Detected" : "Not found", d.hasGTM           ? "pass" : "info");
  add("Facebook Pixel",     d.hasFacebookPixel ? "Detected" : "Not found", d.hasFacebookPixel ? "pass" : "info");
  add("TikTok Pixel",       d.hasTikTokPixel   ? "Detected" : "Not found", d.hasTikTokPixel   ? "pass" : "info");
  add("Call tracking",      d.hasCallTracking  ? "Detected" : "Not found", d.hasCallTracking  ? "pass" : "info");
  if (d.imagesWithoutAlt?.length   > 0) add("Images missing alt text",   `${d.imagesWithoutAlt.length} images`,  "warn");
  if (d.wordpressPluginIssues?.length > 0) add("WordPress plugin issues", `${d.wordpressPluginIssues.length} found`, "warn");
  return s;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusColor(s: Signal["status"]) {
  return s === "pass" ? "#10D9A0" : s === "fail" ? "#F87171" : s === "warn" ? "#FBBF24" : "#475569";
}
function statusIcon(s: Signal["status"]) {
  return s === "pass" ? "✓" : s === "fail" ? "✗" : s === "warn" ? "!" : "·";
}
function fmt(ms: number) { return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`; }
function scoreColor(n: number) { return n >= 90 ? "#10D9A0" : n >= 50 ? "#FBBF24" : "#F87171"; }
function metricColor(ms: number, good: number, poor: number) {
  return ms <= good ? "#10D9A0" : ms <= poor ? "#FBBF24" : "#F87171";
}

// ── Logo ─────────────────────────────────────────────────────────────────────

function Logo({ size = 24 }: { size?: number }) {
  const arc = size * 0.67;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 9, lineHeight: 1 }}>
      <div style={{ position: "relative", width: arc, height: arc, flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {[0.58, 0.78, 1].map((scale, i) => (
            <div key={i} style={{
              position: "absolute",
              width: arc * scale * 2, height: arc * scale * 2,
              bottom: -(arc * scale), left: -(arc * scale),
              borderRadius: "50%", border: `${1.4 + i * 0.5}px solid #10D9A0`,
              opacity: 0.28 + i * 0.3,
            }} />
          ))}
        </div>
        <div style={{ position: "absolute", bottom: -3, left: -3, width: 6, height: 6, background: "#10D9A0", borderRadius: "50%", boxShadow: "0 0 0 4px rgba(16,217,160,0.1)" }} />
      </div>
      <div style={{ fontSize: size, fontWeight: 800, letterSpacing: "-0.5px", fontFamily: "var(--font-geist-sans)" }}>
        <span style={{ color: "#10D9A0" }}>Ping</span><span style={{ color: "#F1F5F9" }}>Close</span>
      </div>
    </div>
  );
}

// ── Main check content ────────────────────────────────────────────────────────

function CheckContent() {
  const params       = useSearchParams();
  const pendingUrl   = params.get("url")   || "";
  const pendingEmail = params.get("email") || "";
  const pendingPhone = params.get("phone") || "";
  const duplicate    = params.get("duplicate");
  const limit        = params.get("limit");
  const reportId     = params.get("id");

  const [fastData,      setFastData]      = useState<FastData | null>(null);
  const [speedData,     setSpeedData]     = useState<SpeedData | null>(null);
  const [reportReady,   setReportReady]   = useState<string | null>(reportId || null);
  const [error,         setError]         = useState("");
  const [visibleCount,  setVisible]       = useState(0);
  const [elapsedSeconds,setElapsedSeconds]= useState(0);

  const signals = fastData ? buildSignals(fastData) : [];

  // Stagger signal rows appearing after fast data arrives
  useEffect(() => {
    if (!fastData) return;
    const total = buildSignals(fastData).length;
    for (let i = 0; i < total; i++) {
      setTimeout(() => setVisible(i + 1), i * 52);
    }
  }, [fastData]); // eslint-disable-line

  // Elapsed-time tracker for pending PageSpeed state
  useEffect(() => {
    if (!reportReady || speedData) return;
    setElapsedSeconds(0);
    const id = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [reportReady, speedData]); // eslint-disable-line

  // Poll Supabase every 3s until pagespeed_status leaves 'pending' — hard stop at 90s
  useEffect(() => {
    if (!reportReady || speedData) return;
    let polls = 0;
    const id = setInterval(async () => {
      polls++;
      try {
        const r = await fetch(`/api/report?id=${reportReady}`);
        const data = await r.json();
        if (data.pagespeed_status && data.pagespeed_status !== 'pending') {
          setSpeedData({
            mobileScore: data.mobile_score ?? 0,
            desktopScore: data.desktop_score ?? 0,
            ttfb: data.ttfb ?? 0, lcp: data.lcp ?? 0,
            fcp: data.fcp ?? 0, cls: data.cls ?? 0,
            passesOneSecond: data.passes_one_second ?? false,
            reportId: reportReady,
            pageSpeedStatus: (data.pagespeed_status as string).toUpperCase(),
          });
          clearInterval(id);
          return;
        }
      } catch { /* ignore network blips */ }
      // After 30 polls (90s) give up — treat as timeout
      if (polls >= 30) {
        setSpeedData({
          mobileScore: 0, desktopScore: 0,
          ttfb: 0, lcp: 0, fcp: 0, cls: 0,
          passesOneSecond: false,
          reportId: reportReady,
          pageSpeedStatus: 'TIMEOUT',
        });
        clearInterval(id);
      }
    }, 3000);
    return () => clearInterval(id);
  }, [reportReady, speedData]); // eslint-disable-line

  // Fire both requests simultaneously
  useEffect(() => {
    if (!pendingUrl || duplicate || limit || reportId) return;

    // Fast scan — tech signals only (~2 seconds)
    fetch("/api/audit/fast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: pendingUrl }),
    })
      .then(r => r.json())
      .then(data => { if (!data.error) setFastData(data); })
      .catch(() => {});

    // Full audit — tech + PageSpeed + DB + email (~15-45 seconds)
    fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: pendingUrl,
        email: pendingEmail || null,
        phone: pendingPhone || null,
        deliveryEmail: true,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return; }
        if (data.limit) { return; }
        setReportReady(data.reportId);
        if (data.pageSpeedStatus !== 'PENDING') {
          setSpeedData({
            mobileScore: data.mobileScore, desktopScore: data.desktopScore,
            ttfb: data.ttfb, lcp: data.lcp, fcp: data.fcp, cls: data.cls,
            passesOneSecond: data.passesOneSecond, reportId: data.reportId,
            pageSpeedStatus: data.pageSpeedStatus,
          });
        }
      })
      .catch(() => setError("Audit failed. Please try again."));
  }, []); // eslint-disable-line

  // Skip screens
  if (duplicate) return <Shell><SkipMsg icon="📬" title="Already on its way!" body="Your report is already in your inbox." /></Shell>;
  if (limit)     return <LimitScreen />;

  const hostname = (() => { try { return new URL(pendingUrl.startsWith("http") ? pendingUrl : `https://${pendingUrl}`).hostname; } catch { return pendingUrl; } })();

  const speedMetrics = [
    { label: "Mobile",  value: speedData ? String(speedData.mobileScore)  : null, color: speedData ? scoreColor(speedData.mobileScore)  : null },
    { label: "Desktop", value: speedData ? String(speedData.desktopScore) : null, color: speedData ? scoreColor(speedData.desktopScore) : null },
    { label: "TTFB",    value: speedData ? fmt(speedData.ttfb) : null,            color: speedData ? metricColor(speedData.ttfb, 6, 10) : null },
    { label: "LCP",     value: speedData ? fmt(speedData.lcp)  : null,            color: speedData ? metricColor(speedData.lcp,  99, 999) : null },
    { label: "FCP",     value: speedData ? fmt(speedData.fcp)  : null,            color: speedData ? metricColor(speedData.fcp,  29, 39) : null },
    { label: "CLS",     value: speedData ? speedData.cls.toFixed(2) : null,       color: speedData ? metricColor(speedData.cls * 1000, 100, 250) : null },
  ];

  return (
    <main style={{
      minHeight: "100vh", background: "#0B0E16",
      color: "#F1F5F9", fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: 16, padding: "40px 24px 80px",
    }}>
      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { from { transform: translateX(-200%); } to { transform: translateX(200%); } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>

      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {/* Logo */}
        <div style={{ marginBottom: 40 }}><Logo size={26} /></div>

        {/* Scanning header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.5px" }}>
            Scanning <span style={{ color: "#10D9A0" }}>{hostname}</span>
          </h1>
          <p style={{ fontSize: 16, color: "#475569", margin: 0 }}>
            {fastData
              ? `${signals.length} signals analyzed — performance scores ${speedData ? (speedData.pageSpeedStatus === 'OK' ? "complete" : "unavailable") : "loading…"}`
              : <span style={{ animation: "blink 1.4s ease-in-out infinite", display: "inline-block" }}>Scanning signals now…</span>
            }
          </p>
        </div>

        {/* ── Tech signals ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.1em", color: "#374151", textTransform: "uppercase", marginBottom: 14 }}>
            Tech Signals
          </div>

          <div style={{ background: "#0D1528", border: "1px solid #1E3050", borderRadius: 12, overflow: "hidden" }}>
            {signals.length === 0 && (
              <div style={{ padding: "20px 20px", color: "#374151", fontSize: 16 }}>
                <span style={{ animation: "blink 1.4s ease-in-out infinite", display: "inline-block" }}>Scanning…</span>
              </div>
            )}
            {signals.slice(0, visibleCount).map((sig, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "baseline", gap: 14, padding: "10px 20px",
                borderBottom: i < signals.length - 1 ? "1px solid #0B1020" : "none",
                animation: "fadeSlideIn 0.18s ease-out",
              }}>
                <span style={{
                  width: 22, height: 22, flexShrink: 0, marginTop: 1,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: `${statusColor(sig.status)}15`, borderRadius: 4,
                  fontSize: 16, fontWeight: 800, color: statusColor(sig.status),
                }}>
                  {statusIcon(sig.status)}
                </span>
                <span style={{ fontSize: 16, color: "#64748B", width: 200, flexShrink: 0 }}>{sig.label}</span>
                <span style={{ fontSize: 16, color: sig.status === "fail" ? "#F87171" : sig.status === "warn" ? "#FBBF24" : "#CBD5E1", fontWeight: 500 }}>
                  {sig.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Performance scores ───────────────────────────────────────── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.1em", color: "#374151", textTransform: "uppercase" }}>
              Performance Scores
            </div>
            {!speedData && (() => {
              const msg = elapsedSeconds < 10
                ? "Waiting on Google for your performance data..."
                : elapsedSeconds < 30
                ? "We're almost done analyzing your website..."
                : "Google is taking longer than usual today. Your report is still being prepared.";
              return (
                <div style={{ fontSize: 16, color: "#94A3B8", display: "flex", alignItems: "center", gap: 6, animation: "blink 1.6s ease-in-out infinite" }}>
                  <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#FBBF24", flexShrink: 0 }} />
                  {msg}
                </div>
              );
            })()}
            {speedData && speedData.pageSpeedStatus === 'OK' && (
              <div style={{ fontSize: 16, color: "#10D9A0", display: "flex", alignItems: "center", gap: 6, animation: "fadeSlideIn 0.3s ease-out" }}>
                <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#10D9A0", flexShrink: 0 }} />
                Performance analysis complete.
              </div>
            )}
            {speedData && speedData.pageSpeedStatus === 'TIMEOUT' && (
              <div style={{ fontSize: 16, color: "#FBBF24", display: "flex", alignItems: "center", gap: 6, animation: "fadeSlideIn 0.3s ease-out" }}>
                <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#F87171", flexShrink: 0 }} />
                {"Google's performance service timed out. Your report is still available."}
              </div>
            )}
            {speedData && speedData.pageSpeedStatus === 'ERROR' && (
              <div style={{ fontSize: 16, color: "#F87171", display: "flex", alignItems: "center", gap: 6, animation: "fadeSlideIn 0.3s ease-out" }}>
                <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#F87171", flexShrink: 0 }} />
                Performance analysis unavailable. Your report is still available.
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {speedMetrics.map(m => (
              <div key={m.label} style={{ background: "#0D1528", border: "1px solid #1E3050", borderRadius: 10, padding: "16px 18px" }}>
                <div style={{ fontSize: 16, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.label}</div>
                {m.value !== null ? (
                  <div style={{ fontSize: 30, fontWeight: 800, color: m.color || "#F1F5F9", lineHeight: 1, animation: "fadeSlideIn 0.3s ease-out" }}>
                    {m.value}
                  </div>
                ) : (
                  <div style={{ height: 30, display: "flex", alignItems: "center" }}>
                    <div style={{ width: 52, height: 5, background: "#1E3050", borderRadius: 3, overflow: "hidden", position: "relative" }}>
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 0%, #10D9A025 50%, transparent 100%)", animation: "shimmer 1.8s linear infinite" }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {speedData && speedData.pageSpeedStatus === 'OK' && (() => {
            const tier = speedData.lcp > 0 && speedData.lcp < 1000 ? "superstar" : speedData.lcp > 0 && speedData.lcp <= 2500 ? "pass" : "fail";
            const tierColor = tier === "superstar" ? "#10D9A0" : tier === "pass" ? "#FBBF24" : "#F87171";
            return (
            <div style={{
              marginTop: 12, padding: "10px 16px",
              background: `${tierColor}10`,
              border: `1px solid ${tierColor}30`,
              borderRadius: 8, fontSize: 16,
              color: tierColor,
              fontWeight: 600,
              animation: "fadeSlideIn 0.3s ease-out",
            }}>
              {tier === "superstar" ? "⭐ Loads in under 1 second — fastest 10% of the web" : tier === "pass" ? "✓ Passes Google's 2.5-second test — but not under 1 second" : "✗ Fails Google's 2.5-second speed test"}
            </div>
            );
          })()}
          {speedData && speedData.pageSpeedStatus === 'TIMEOUT' && (
            <div style={{ marginTop: 12, padding: "10px 16px", background: "#FBBF2410", border: "1px solid #FBBF2430", borderRadius: 8, fontSize: 16, color: "#FBBF24", fontWeight: 600, animation: "fadeSlideIn 0.3s ease-out" }}>
              ⚠ Performance scores unavailable — site took too long to respond
            </div>
          )}
          {speedData && speedData.pageSpeedStatus === 'ERROR' && (
            <div style={{ marginTop: 12, padding: "10px 16px", background: "#F8717110", border: "1px solid #F8717130", borderRadius: 8, fontSize: 16, color: "#F87171", fontWeight: 600, animation: "fadeSlideIn 0.3s ease-out" }}>
              ✗ Performance analysis failed — check the full report for details
            </div>
          )}
        </div>

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        {reportReady ? (
          <div>
            <a href={`/report/${reportReady}`} style={{
              display: "block",
              background: speedData ? "#10D9A0" : "#0D9E75",
              color: "#0B0E16",
              fontSize: 18, fontWeight: 700, padding: "18px",
              borderRadius: 10, textDecoration: "none", textAlign: "center",
              animation: "fadeSlideIn 0.4s ease-out",
              border: speedData ? "2px solid #10D9A0" : "2px solid transparent",
            }}>
              {speedData ? "PageSpeed Complete — View Full Report →" : "View Your Full Report →"}
            </a>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 10, fontSize: 16, color: "#64748B" }}>
              {!speedData && (
                <><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#FBBF24", flexShrink: 0, animation: "blink 1.6s ease-in-out infinite" }} />
                Waiting on Google...</>
              )}
              {speedData && speedData.pageSpeedStatus === 'OK' && (
                <><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#10D9A0", flexShrink: 0 }} />
                <span style={{ color: "#10D9A0" }}>Performance analysis complete</span></>
              )}
              {speedData && (speedData.pageSpeedStatus === 'TIMEOUT' || speedData.pageSpeedStatus === 'ERROR') && (
                <><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#F87171", flexShrink: 0 }} />
                <span style={{ color: "#F87171" }}>Performance analysis unavailable</span></>
              )}
            </div>
          </div>
        ) : (
          <div style={{ padding: "18px", background: "#0D1528", border: "1px solid #1E3050", borderRadius: 10, textAlign: "center", color: "#374151", fontSize: 16 }}>
            {fastData ? "Getting performance scores from Google Lighthouse…" : "Scanning your site…"}
          </div>
        )}

        {error && (
          <div style={{ marginTop: 16, padding: "14px 18px", background: "#F8717110", border: "1px solid #F8717130", borderRadius: 8, color: "#F87171", fontSize: 16 }}>
            {error}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 28 }}>
          <Link href="/" style={{ fontSize: 16, color: "#374151", textDecoration: "none" }}>← Cancel</Link>
        </div>
      </div>
    </main>
  );
}

// ── Helper screens ────────────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{
      minHeight: "100vh", background: "#0B0E16", color: "#F1F5F9",
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>{children}</div>
    </main>
  );
}

function SkipMsg({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <>
      <div style={{ fontSize: 52, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>{title}</div>
      <div style={{ fontSize: 18, color: "#94A3B8", marginBottom: 28 }}>{body}</div>
      <Link href="/" style={{ fontSize: 16, color: "#475569", textDecoration: "none" }}>← Back to PingClose</Link>
    </>
  );
}

function LimitScreen() {
  return (
    <Shell>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
      <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>You&apos;ve Been Busy!</div>
      <div style={{ fontSize: 16, color: "#94A3B8", marginBottom: 24, lineHeight: 1.6 }}>
        You&apos;ve run 5 free audits today — that&apos;s the daily limit. Come back tomorrow for more.
      </div>
      <div style={{ background: "#111827", border: "1px solid #1F2937", borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 16, color: "#64748B", marginBottom: 8 }}>Need more audits right now?</div>
        <div style={{ fontSize: 16, color: "#F1F5F9" }}>
          Call or text <a href="tel:+13145172533" style={{ color: "#10D9A0", fontWeight: 700 }}>(314) 517-2533</a> — Jim Fogal
        </div>
      </div>
      <Link href="/" style={{ display: "inline-block", background: "#10D9A0", color: "#0B0E16", fontWeight: 700, fontSize: 16, padding: "12px 32px", borderRadius: 8, textDecoration: "none" }}>
        Back to PingClose
      </Link>
    </Shell>
  );
}

export default function CheckPage() {
  return <Suspense><CheckContent /></Suspense>;
}
