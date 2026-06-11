"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";

const CHECKS = [
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

// Total = 54 checks
const TOTAL = CHECKS.length;

interface CountdownProps {
  apiDone: boolean;           // flips true when API returns
  onZero: () => void;         // called the moment counter reaches 0
}

function CountdownTimer({ apiDone, onZero }: CountdownProps) {
  const [idx, setIdx] = useState(0);       // how many we've "checked off"
  const idxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onZeroRef = useRef(onZero);
  onZeroRef.current = onZero;

  const scheduleNext = useCallback((currentIdx: number, ms: number) => {
    timerRef.current = setTimeout(() => {
      const next = currentIdx + 1;
      idxRef.current = next;
      setIdx(next);
      if (next >= TOTAL) {
        onZeroRef.current();
      }
    }, ms);
  }, []);

  useEffect(() => {
    // Normal pace: spread first 80% of items over 25 seconds
    const normalMs = (25000 * 0.8) / (TOTAL * 0.8); // ~462ms per item for first ~43
    scheduleNext(0, normalMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When API returns, accelerate remaining items to finish in ~1.2 seconds
  useEffect(() => {
    if (!apiDone) return;
    if (idxRef.current >= TOTAL) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    const remaining = TOTAL - idxRef.current;
    const msEach = remaining <= 1 ? 100 : Math.min(1200 / remaining, 120);

    const tick = (currentIdx: number) => {
      timerRef.current = setTimeout(() => {
        const next = currentIdx + 1;
        idxRef.current = next;
        setIdx(next);
        if (next >= TOTAL) {
          onZeroRef.current();
        } else {
          tick(next);
        }
      }, msEach);
    };

    tick(idxRef.current);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiDone]);

  // Also keep normal pace ticking for items NOT yet done when API hasn't returned
  useEffect(() => {
    if (apiDone) return;
    if (idx >= TOTAL) return;

    const normalMs = (25000 * 0.8) / (TOTAL * 0.8);
    // Only schedule next if we just moved (prevents double-scheduling on first render)
    if (idx > 0 && idx < TOTAL) {
      // Slow down after 80% to make sure API has time
      const ms = idx >= Math.floor(TOTAL * 0.8) ? 2500 : normalMs;
      scheduleNext(idx, ms);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, apiDone]);

  const count = TOTAL - idx;        // 54 → 0
  const progress = (idx / TOTAL) * 100;
  const currentLabel = idx >= TOTAL
    ? "Building your report…"
    : CHECKS[idx];

  return (
    <div style={{ textAlign: "center" }}>

      {/* Big number */}
      <div style={{
        fontSize: "clamp(96px, 20vw, 140px)",
        fontWeight: 800,
        color: count === 0 ? "#10D9A0" : "#F1F5F9",
        lineHeight: 1,
        letterSpacing: "-4px",
        marginBottom: 8,
        fontVariantNumeric: "tabular-nums",
        transition: "color 0.3s",
      }}>
        {count}
      </div>

      {/* Static label */}
      <div style={{
        fontSize: 16,
        color: "#475569",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        marginBottom: 10,
      }}>
        Items Being Checked
      </div>

      {/* Current check name — teal flash */}
      <div style={{
        fontSize: 18,
        color: "#10D9A0",
        fontWeight: 600,
        minHeight: 28,
        marginBottom: 32,
      }}>
        {currentLabel}
      </div>

      {/* Progress bar */}
      <div style={{
        background: "#0D1528",
        border: "1px solid #1E3050",
        borderRadius: 8,
        height: 8,
        overflow: "hidden",
        marginBottom: 8,
      }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: "linear-gradient(90deg, #10D9A0, #60A5FA)",
          borderRadius: 8,
          transition: "width 0.4s linear",
        }} />
      </div>

      <div style={{ fontSize: 16, color: "#374151", textAlign: "right" }}>
        {idx} / {TOTAL}
      </div>

    </div>
  );
}

function CheckContent() {
  const params = useSearchParams();
  const duplicate = params.get("duplicate");
  const limit     = params.get("limit");
  const reportId  = params.get("id");
  const pendingUrl   = params.get("url");
  const pendingEmail = params.get("email");
  const pendingPhone = params.get("phone");
  const deliverySms  = params.get("sms")  === "1";
  const deliveryEmail = params.get("mail") === "1";

  // apiDone = true as soon as the fetch returns (success or handled error)
  const [apiDone, setApiDone]   = useState(false);
  const [apiResult, setApiResult] = useState<{
    type: "ready" | "duplicate" | "limit" | "error";
    id?: string;
    msg?: string;
  } | null>(null);

  // shown = true only AFTER the countdown reaches 0
  const [shown, setShown] = useState(false);

  // If we landed here with ?id= (e.g. from email link), skip straight to ready
  const [status] = useState<"skip" | "running">(
    duplicate ? "skip" : limit ? "skip" : reportId ? "skip" : "running"
  );

  useEffect(() => {
    if (status !== "running" || !pendingUrl) return;

    const run = async () => {
      try {
        const res  = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: pendingUrl,
            email: pendingEmail || null,
            phone: pendingPhone || null,
            deliverySms,
            deliveryEmail,
          }),
        });
        const data = await res.json();

        if (data.duplicate) { setApiResult({ type: "duplicate" }); }
        else if (data.limit) { setApiResult({ type: "limit" }); }
        else if (data.error) { setApiResult({ type: "error", msg: data.error }); }
        else                 { setApiResult({ type: "ready", id: data.reportId }); }
      } catch {
        setApiResult({ type: "error", msg: "Something went wrong. Please try again." });
      } finally {
        setApiDone(true);
      }
    };

    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When countdown hits 0, flip shown and reveal result
  const handleZero = useCallback(() => {
    setShown(true);
  }, []);

  // ── Skip path — direct links / legacy redirects ──────────────────
  if (status === "skip") {
    if (duplicate) return <DuplicateScreen />;
    if (limit)     return <LimitScreen />;
    if (reportId)  return <ReadyScreen id={reportId} />;
  }

  // ── Countdown path ───────────────────────────────────────────────
  // Show result only after countdown reaches zero
  if (shown && apiResult) {
    if (apiResult.type === "ready" && apiResult.id) return <ReadyScreen id={apiResult.id} />;
    if (apiResult.type === "duplicate")              return <DuplicateScreen />;
    if (apiResult.type === "limit")                  return <LimitScreen />;
    return <ErrorScreen msg={apiResult.msg} />;
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0B0E16 0%, #0D1528 50%, #0B0E16 100%)",
      color: "#F1F5F9",
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(#10D9A0 1px, transparent 1px), linear-gradient(90deg, #10D9A0 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div style={{ maxWidth: 480, width: "100%", position: "relative" }}>

        {/* Logo */}
        <div style={{ fontSize: 28, fontWeight: 800, color: "#10D9A0", marginBottom: 40, letterSpacing: "-1px", textAlign: "center" }}>
          Ping<span style={{ color: "#F1F5F9" }}>Close</span>
        </div>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.5px" }}>
            54 Items We&apos;re Checking.
          </h1>
          <p style={{ fontSize: 17, color: "#64748B", margin: 0 }}>
            Let&apos;s count down to your results.
          </p>
        </div>

        <CountdownTimer apiDone={apiDone} onZero={handleZero} />

        <p style={{ fontSize: 16, color: "#475569", textAlign: "center", marginTop: 24, marginBottom: 20 }}>
          {deliverySms && pendingPhone ? "📱 We'll text you the report link when it's ready." : "✉️ We'll email you the report link when it's ready."}
        </p>
        <div style={{ textAlign: "center" }}>
          <Link href="/" style={{ fontSize: 16, color: "#374151", textDecoration: "none" }}>← Cancel</Link>
        </div>
      </div>
    </main>
  );
}

// ── Shared result screens ────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0B0E16 0%, #0D1528 50%, #0B0E16 100%)",
      color: "#F1F5F9", fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(#10D9A0 1px, transparent 1px), linear-gradient(90deg, #10D9A0 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center", position: "relative" }}>
        {children}
      </div>
    </main>
  );
}

function ReadyScreen({ id }: { id: string }) {
  return (
    <Shell>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#10D9A0", marginBottom: 40, letterSpacing: "-1px" }}>
        Ping<span style={{ color: "#F1F5F9" }}>Close</span>
      </div>
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: "#10D9A015", border: "2px solid #10D9A040",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 28px", fontSize: 32,
      }}>✓</div>
      <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.5px" }}>
        Your report is ready.
      </h1>
      <p style={{ fontSize: 18, color: "#94A3B8", lineHeight: 1.6, margin: "0 0 36px" }}>
        We checked all 54 items and found everything — the good and the bad.
      </p>
      <a
        href={`/report/${id}`}
        style={{
          display: "inline-block", background: "#10D9A0", color: "#0B0E16",
          fontSize: 18, fontWeight: 700, padding: "16px 36px",
          borderRadius: 10, textDecoration: "none", marginBottom: 20,
        }}
      >
        View Your Full Report →
      </a>
      <p style={{ fontSize: 16, color: "#475569", margin: "0 0 40px" }}>
        We also sent it to your inbox — the link is permanent and shareable.
      </p>
      <div style={{
        background: "#0D1528", border: "1px solid #1E3050",
        borderRadius: 12, padding: "20px 24px", textAlign: "left", marginBottom: 32,
      }}>
        <div style={{ fontSize: 16, color: "#64748B", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 14, textTransform: "uppercase" }}>
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
      <Link href="/" style={{ fontSize: 16, color: "#475569", textDecoration: "none" }}>← Back to PingClose</Link>
    </Shell>
  );
}

function DuplicateScreen() {
  return (
    <Shell>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#10D9A0", marginBottom: 40, letterSpacing: "-1px" }}>
        Ping<span style={{ color: "#F1F5F9" }}>Close</span>
      </div>
      <div style={{ fontSize: 56, marginBottom: 20 }}>📬</div>
      <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.5px" }}>Already on its way!</h1>
      <p style={{ fontSize: 19, color: "#CBD5E1", lineHeight: 1.6, margin: "0 0 32px" }}>
        Your report is already in your inbox — check your email.
      </p>
      <Link href="/" style={{ fontSize: 16, color: "#475569", textDecoration: "none" }}>← Back to PingClose</Link>
    </Shell>
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
      <div style={{
        background: "#111827", border: "1px solid #1F2937", borderRadius: 12,
        padding: 20, marginBottom: 24,
      }}>
        <div style={{ fontSize: 16, color: "#64748B", marginBottom: 8 }}>Need more audits right now?</div>
        <div style={{ fontSize: 16, color: "#F1F5F9" }}>
          Call or text <a href="tel:+13145172533" style={{ color: "#10D9A0", fontWeight: 700 }}>(314) 517-2533</a> — Jim Fogal
        </div>
      </div>
      <Link href="/" style={{
        display: "inline-block", background: "#10D9A0", color: "#0B0E16",
        fontWeight: 700, fontSize: 16, padding: "12px 32px", borderRadius: 8, textDecoration: "none",
      }}>
        Back to PingClose
      </Link>
    </Shell>
  );
}

function ErrorScreen({ msg }: { msg?: string }) {
  return (
    <Shell>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Something went wrong</div>
      <div style={{ fontSize: 16, color: "#94A3B8", marginBottom: 28, lineHeight: 1.6 }}>
        {msg || "The audit couldn't complete. Please try again."}
      </div>
      <Link href="/" style={{
        display: "inline-block", background: "#10D9A0", color: "#0B0E16",
        fontWeight: 700, fontSize: 16, padding: "14px 32px", borderRadius: 8, textDecoration: "none",
      }}>
        ← Try Again
      </Link>
    </Shell>
  );
}

export default function CheckPage() {
  return (
    <Suspense>
      <CheckContent />
    </Suspense>
  );
}
