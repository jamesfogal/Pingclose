"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Stage = "form" | "verifying" | "verified";

function useCountUp(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - (1 - p) ** 3;
      setVal(Math.round(ease * target));
      if (p < 1) { raf = requestAnimationFrame(step); }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export default function Home() {
  const router = useRouter();
  const [url,          setUrl]          = useState("");
  const [email,        setEmail]        = useState("");
  const [code,         setCode]         = useState("");
  const [stage,        setStage]        = useState<Stage>("form");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [urlFocused,   setUrlFocused]   = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const mobileScore  = useCountUp(73,  1400);
  const desktopScore = useCountUp(89, 1700);

  function playPing() {
    try { new Audio("/sounds/ping.mp3").play(); } catch { /* ignore */ }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!url || !email) { setError("Please enter your website URL and email."); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/send-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, email }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      if (data.alreadyVerified) { playPing(); router.push(`/check?url=${encodeURIComponent(url)}&email=${encodeURIComponent(email)}`); return; }
      setStage("verifying");
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!code || code.length !== 6) { setError("Please enter the 6-digit code from your email."); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/verify-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid code."); return; }
      playPing();
      router.push(`/check?url=${encodeURIComponent(url)}&email=${encodeURIComponent(email)}`);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  function inputStyle(focused: boolean) {
    return {
      width: "100%", padding: "16px 20px",
      background: "#111827",
      border: `2px solid ${focused ? "#10D9A0" : "#374151"}`,
      borderRadius: 10, color: "#F1F5F9", fontSize: 18,
      outline: "none", boxSizing: "border-box" as const,
      transition: "border-color 180ms cubic-bezier(0.23,1,0.32,1), box-shadow 180ms cubic-bezier(0.23,1,0.32,1)",
      boxShadow: focused ? "0 0 0 3px #10D9A015" : "none",
    };
  }

  const canSubmit = !loading;
  const btnStyle = {
    width: "100%", padding: "18px",
    background: canSubmit ? "#10D9A0" : "#0D1528",
    border: "2px solid #10D9A0", borderRadius: 10,
    color: canSubmit ? "#0B0E16" : "#10D9A0",
    fontSize: 18, fontWeight: 700,
    cursor: canSubmit ? "pointer" : "not-allowed" as const,
    transition: "background 180ms cubic-bezier(0.23,1,0.32,1), box-shadow 180ms cubic-bezier(0.23,1,0.32,1), transform 160ms cubic-bezier(0.23,1,0.32,1)",
  };

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

  return (
    <main style={{ minHeight: "100vh", background: "#0B0E16", color: "#F1F5F9", fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 16 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ── ABOVE THE FOLD ──────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "60px 24px 40px",
        background: "linear-gradient(135deg, #0B0E16 0%, #0D1528 50%, #0B0E16 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "linear-gradient(#10D9A0 1px, transparent 1px), linear-gradient(90deg, #10D9A0 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* Logo + Nav */}
        <div style={{ marginBottom: 48, textAlign: "center", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ position: "relative", width: 12, height: 12, flexShrink: 0 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#10D9A0" }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#10D9A0", animation: "ping 1.8s cubic-bezier(0,0,0.2,1) infinite" }} />
            </div>
            <div style={{ fontSize: "clamp(44px, 7vw, 70px)", fontWeight: 800, color: "#10D9A0", letterSpacing: "-2px", lineHeight: 1 }}>
              Ping<span style={{ color: "#F1F5F9" }}>Close</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <a href="/faq"
              style={{ fontSize: 17, fontWeight: 600, color: "#F1F5F9", textDecoration: "none", background: "#10D9A015", border: "1px solid #10D9A040", borderRadius: 8, padding: "10px 22px", transition: "background 180ms cubic-bezier(0.23,1,0.32,1), transform 160ms cubic-bezier(0.23,1,0.32,1)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#10D9A025"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#10D9A015"; }}
            >Website Speed FAQ</a>
            <a href="/pricing"
              style={{ fontSize: 17, fontWeight: 600, color: "#10D9A0", textDecoration: "none", background: "#10D9A015", border: "1px solid #10D9A060", borderRadius: 8, padding: "10px 22px", transition: "background 180ms cubic-bezier(0.23,1,0.32,1), transform 160ms cubic-bezier(0.23,1,0.32,1)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#10D9A025"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#10D9A015"; }}
            >See Pricing →</a>
          </div>
        </div>

        {/* Hero grid: form left, preview right */}
        <div className="hero-grid" style={{ width: "100%", maxWidth: 1080, display: "grid", gap: 56, alignItems: "center", position: "relative" }}>

          {/* LEFT — headline + form */}
          <div>
            {stage === "form" && (
              <>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#10D9A010", border: "1px solid #10D9A030", borderRadius: 20, padding: "6px 14px", marginBottom: 24 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10D9A0", animation: "pulse 2s ease-in-out infinite" }} />
                  <span style={{ fontSize: 16, color: "#10D9A0", fontWeight: 600 }}>Live · 74 signals · 60 seconds · Free</span>
                </div>
                <h1 style={{ fontSize: "clamp(34px, 4.5vw, 56px)", fontWeight: 800, lineHeight: 1.05, margin: "0 0 20px", letterSpacing: "-1.5px", color: "#F9FAFB" }}>
                  Want the Fastest Website<br />
                  <span style={{ color: "#10D9A0" }}>on Your Block?</span>
                </h1>
                <p style={{ fontSize: 20, color: "#CBD5E1", margin: "0 0 28px", lineHeight: 1.6 }}>
                  Ping your site and find out right now. We check 74 signals and tell you exactly what&apos;s slowing you down.
                </p>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input type="text" placeholder="yourwebsite.com" value={url} onChange={e => setUrl(e.target.value)}
                    onFocus={() => setUrlFocused(true)} onBlur={() => setUrlFocused(false)}
                    style={inputStyle(urlFocused)} />
                  <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)}
                    style={inputStyle(emailFocused)} />
                  {error && <div style={{ fontSize: 16, color: "#F87171" }}>{error}</div>}
                  <button type="submit" disabled={loading} style={btnStyle}
                    onMouseEnter={e => { if (canSubmit) (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px #10D9A040"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; (e.currentTarget as HTMLElement).style.transform = ""; }}
                    onMouseDown={e => { if (canSubmit) (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
                    onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
                  >
                    {loading ? "Checking your site…" : "Ping My Site Free →"}
                  </button>
                </form>
                <div style={{ display: "flex", gap: 20, marginTop: 18, flexWrap: "wrap" }}>
                  {["No account needed", "No credit card", "Results in 60 seconds"].map(t => (
                    <span key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 16, color: "#64748B" }}>
                      <span style={{ color: "#10D9A0" }}>✓</span> {t}
                    </span>
                  ))}
                </div>
                <a href="#hurdles" style={{ display: "block", marginTop: 24, fontSize: 17, color: "#94A3B8", textDecoration: "none" }}>
                  Why does 1 second matter? ↓
                </a>
              </>
            )}

            {stage === "verifying" && (
              <>
                <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, margin: "0 0 16px", letterSpacing: "-1px" }}>
                  Check Your Email
                </h1>
                <p style={{ fontSize: 18, color: "#CBD5E1", margin: "0 0 8px", lineHeight: 1.6 }}>We sent a 6-digit code to</p>
                <p style={{ fontSize: 20, color: "#10D9A0", fontWeight: 700, margin: "0 0 24px" }}>{email}</p>
                <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input type="text" inputMode="numeric" placeholder="Enter 6-digit code"
                    value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    style={{ ...inputStyle(false), textAlign: "center", fontSize: 32, fontWeight: 800, letterSpacing: "12px" }}
                    autoFocus />
                  {error && <div style={{ fontSize: 16, color: "#F87171" }}>{error}</div>}
                  <button type="submit" disabled={loading || code.length !== 6} style={{
                    ...btnStyle,
                    background: (!loading && code.length === 6) ? "#10D9A0" : "#0D1528",
                    color: (!loading && code.length === 6) ? "#0B0E16" : "#10D9A0",
                    cursor: (!loading && code.length === 6) ? "pointer" : "not-allowed",
                  }}>
                    {loading ? "Verifying…" : "Confirm & Run My Audit →"}
                  </button>
                </form>
                <div style={{ marginTop: 20, display: "flex", gap: 24 }}>
                  <button onClick={() => { setStage("form"); setCode(""); setError(""); }}
                    style={{ fontSize: 16, color: "#64748B", background: "none", border: "none", cursor: "pointer" }}>
                    ← Change email
                  </button>
                  <button onClick={async () => {
                    setError(""); setCode("");
                    const res  = await fetch("/api/send-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, email }) });
                    const data = await res.json();
                    if (!res.ok) setError(data.error || "Could not resend."); else setError("New code sent!");
                  }} style={{ fontSize: 16, color: "#94A3B8", background: "none", border: "none", cursor: "pointer" }}>
                    Resend code
                  </button>
                </div>
              </>
            )}
          </div>

          {/* RIGHT — sample report preview (desktop only) */}
          {stage === "form" && (
            <div className="preview-card" style={{ position: "relative" }}>
              <div style={{ fontSize: 16, color: "#374151", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", textAlign: "center", marginBottom: 10 }}>
                Sample Report Preview
              </div>
              <div style={{ background: "#0D1528", border: "1px solid #1E3050", borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 60px #00000050, 0 0 0 1px #10D9A010" }}>
                {/* Browser chrome */}
                <div style={{ padding: "12px 16px", background: "#111827", borderBottom: "1px solid #1E3050", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F87171" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FBBF24" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#34D399" }} />
                  <span style={{ fontSize: 16, color: "#374151", marginLeft: 6, fontFamily: "monospace" }}>pingclose.com/report/abc123</span>
                </div>
                {/* Scores */}
                <div style={{ padding: "18px 20px", borderBottom: "1px solid #1E3050" }}>
                  <div style={{ fontSize: 16, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Performance Scores</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { label: "📱 Mobile", score: mobileScore, color: "#FBBF24" },
                      { label: "🖥️ Desktop", score: desktopScore, color: "#10D9A0" },
                    ].map(({ label, score, color }) => (
                      <div key={label} style={{ background: "#0B0E16", borderRadius: 10, padding: "14px 10px", textAlign: "center" }}>
                        <div style={{ fontSize: 16, color: "#64748B", marginBottom: 6 }}>{label}</div>
                        <div style={{ fontSize: 42, fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{score}</div>
                        <div style={{ fontSize: 16, color: "#475569", marginTop: 2 }}>/100</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Verdict */}
                <div style={{ padding: "12px 20px", borderBottom: "1px solid #1E3050", display: "flex", alignItems: "center", gap: 8, background: "#F8717108" }}>
                  <span>❌</span>
                  <span style={{ fontSize: 16, color: "#F87171", fontWeight: 600 }}>Failing Google&apos;s 1-second test</span>
                </div>
                {/* Top issues */}
                <div style={{ padding: "14px 20px" }}>
                  <div style={{ fontSize: 16, color: "#F87171", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Top Issues Found</div>
                  {[
                    "🔴 Images not in WebP format (4 files)",
                    "🔴 TTFB over 800ms — hosting is slow",
                    "🟠 Render-blocking JavaScript detected",
                    "🟡 No CDN — single-origin delivery",
                  ].map((issue, i) => (
                    <div key={i} style={{ fontSize: 16, color: "#CBD5E1", lineHeight: 1.5, marginBottom: 6, paddingLeft: 8, borderLeft: "2px solid #F8717140" }}>
                      {issue}
                    </div>
                  ))}
                </div>
                {/* Footer */}
                <div style={{ padding: "12px 20px", background: "#10D9A008", borderTop: "1px solid #1E3050" }}>
                  <span style={{ fontSize: 16, color: "#10D9A0", fontWeight: 600 }}>⚡ 74 signals analyzed · Report emailed instantly</span>
                </div>
              </div>
              <div style={{ position: "absolute", inset: -24, background: "radial-gradient(ellipse at center, #10D9A006 0%, transparent 70%)", pointerEvents: "none" }} />
            </div>
          )}
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────── */}
      <section style={{ padding: "36px 24px", background: "#080F1C", borderTop: "1px solid #1E2A40", borderBottom: "1px solid #1E2A40" }}>
        <div className="stats-grid" style={{ maxWidth: 900, margin: "0 auto", display: "grid", gap: 0, textAlign: "center" }}>
          {[
            ["53%", "of visitors leave if your page takes over 3 seconds"],
            ["74", "signals checked on every free audit"],
            ["<1s", "Google's target for above-the-fold load time"],
          ].map(([stat, label], i) => (
            <div key={stat} style={{ padding: "20px 24px", borderRight: i < 2 ? "1px solid #1E2A40" : "none" }}>
              <div style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#10D9A0", letterSpacing: "-1px", lineHeight: 1 }}>{stat}</div>
              <div style={{ fontSize: 16, color: "#64748B", marginTop: 8, lineHeight: 1.5 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HURDLE SECTION ──────────────────────────────────────── */}
      <section id="hurdles" style={{ padding: "80px 24px", background: "#080F1C", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, margin: "0 0 20px", letterSpacing: "-1px" }}>
            If You Can&apos;t Clear the First Hurdle,<br />
            <span style={{ color: "#F87171" }}>You Can&apos;t Win the Race</span>
          </h2>
          <p style={{ fontSize: 20, color: "#94A3B8", margin: "0 0 56px", lineHeight: 1.6 }}>
            Google&apos;s first hurdle is loading your website in under 1 second on a 4G phone.<br />
            Most local businesses fail it before the race even begins.
          </p>

          {/* Animated comparison bars */}
          <div style={{ background: "#0D1528", border: "1px solid #1E3050", borderRadius: 16, padding: "40px 32px", marginBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 80, alignItems: "flex-end", marginBottom: 28 }}>
              {[
                { label: "Fast Competitor", pct: 36,  color: "#10D9A0", verdict: "4 ft hurdle ✅",  delay: "0.2s" },
                { label: "Your Slow Site",  pct: 100, color: "#F87171", verdict: "10 ft hurdle 🔴", delay: "0.5s" },
              ].map(({ label, pct, color, verdict, delay }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 16, color, fontWeight: 700 }}>{label}</div>
                  <div style={{ width: 56, height: 160, background: "#0B0E16", borderRadius: 6, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                    <div style={{
                      width: "100%", height: `${pct}%`, background: color,
                      borderRadius: "4px 4px 0 0", transformOrigin: "bottom",
                      animation: `growUp 0.9s ${delay} cubic-bezier(0.34,1.56,0.64,1) both`,
                      boxShadow: `0 0 20px ${color}40`,
                    }} />
                  </div>
                  <div style={{ fontSize: 16, color: "#64748B" }}>{verdict}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 16, color: "#64748B", margin: 0, lineHeight: 1.6 }}>
              Every fast competitor sees a 4 ft hurdle. A slow site makes yours{" "}
              <strong style={{ color: "#F87171" }}>10 feet tall</strong> — before the race even starts.
            </p>
          </div>

          <p style={{ fontSize: 18, color: "#94A3B8", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 48px" }}>
            How difficult is it to win when you can&apos;t clear the first one?<br />
            PingClose shows you exactly where you stand — in 60 seconds.
          </p>

          {/* What We Check */}
          <div style={{ background: "#0D1528", border: "1px solid #1E3050", borderRadius: 16, padding: "32px 24px", textAlign: "left", maxWidth: 560, margin: "0 auto 48px" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", marginBottom: 24, textTransform: "uppercase" }}>
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
              <div key={String(title)}
                style={{ display: "flex", gap: 16, marginBottom: 16, padding: "10px 12px", borderRadius: 8, transition: "background 150ms cubic-bezier(0.23,1,0.32,1)", cursor: "default" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#10D9A008"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: "#F1F5F9", marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 16, color: "#94A3B8" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => { playPing(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            style={{ background: "#10D9A0", color: "#0B0E16", fontSize: 18, fontWeight: 700, padding: "16px 40px", borderRadius: 10, border: "none", cursor: "pointer", transition: "transform 160ms cubic-bezier(0.23,1,0.32,1), box-shadow 160ms cubic-bezier(0.23,1,0.32,1)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 28px #10D9A040"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
          >
            Ping My Site — It&apos;s Free →
          </button>
        </div>
      </section>

      <style>{`
        input::placeholder { color: #6B7280; }
        * { box-sizing: border-box; }
        .hero-grid  { grid-template-columns: 1fr 1fr; }
        .stats-grid { grid-template-columns: repeat(3, 1fr); }
        .preview-card { display: block; }
        @media (max-width: 768px) {
          .hero-grid    { grid-template-columns: 1fr !important; }
          .stats-grid   { grid-template-columns: 1fr !important; }
          .preview-card { display: none !important; }
        }
        @media (hover: hover) and (pointer: fine) {
          a:active { transform: scale(0.97); }
        }
        @media (prefers-reduced-motion: no-preference) {
          @keyframes ping {
            75%, 100% { transform: scale(2.5); opacity: 0; }
          }
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
          @keyframes ping   { 75%, 100% { opacity: 0; } }
          @keyframes pulse  { 50% { opacity: 0.6; } }
          @keyframes growUp { from { opacity: 0; } to { opacity: 1; } }
        }
      `}</style>
    </main>
  );
}
