"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Stage = "form" | "verifying" | "verified";

export default function Home() {
  const router = useRouter();
  const [url,     setUrl]     = useState("");
  const [email,   setEmail]   = useState("");
  const [code,    setCode]    = useState("");
  const [stage,   setStage]   = useState<Stage>("form");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const audioCtx = useRef<AudioContext | null>(null);

  function playPing() {
    try {
      if (!audioCtx.current) audioCtx.current = new AudioContext();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch { /* ignore audio errors */ }
  }

  // Step 1 — validate URL + email, send verification code
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!url || !email) { setError("Please enter your website URL and email."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      if (data.alreadyVerified) {
        // Already verified — skip straight to audit
        playPing();
        router.push(`/check?url=${encodeURIComponent(url)}&email=${encodeURIComponent(email)}`);
        return;
      }
      setStage("verifying");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2 — confirm the 6-digit code
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!code || code.length !== 6) { setError("Please enter the 6-digit code from your email."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid code."); return; }
      playPing();
      router.push(`/check?url=${encodeURIComponent(url)}&email=${encodeURIComponent(email)}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%", padding: "16px 20px",
    background: "#111827", border: "2px solid #374151",
    borderRadius: 10, color: "#F1F5F9", fontSize: 18,
    outline: "none", boxSizing: "border-box" as const,
  };

  const btnStyle = (active: boolean) => ({
    width: "100%", padding: "18px",
    background: active ? "#10D9A0" : "#0D1528",
    border: "2px solid #10D9A0", borderRadius: 10,
    color: active ? "#0B0E16" : "#10D9A0",
    fontSize: 18, fontWeight: 700,
    cursor: active ? "pointer" : "not-allowed" as const,
  });

  return (
    <main style={{ minHeight: "100vh", background: "#0B0E16", color: "#F1F5F9", fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 16 }}>

      {/* ABOVE THE FOLD */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "40px 24px",
        background: "linear-gradient(135deg, #0B0E16 0%, #0D1528 50%, #0B0E16 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "linear-gradient(#10D9A0 1px, transparent 1px), linear-gradient(90deg, #10D9A0 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* Logo + Nav */}
        <div style={{ marginBottom: 48, textAlign: "center", position: "relative" }}>
          <div style={{ fontSize: "clamp(52px, 8vw, 80px)", fontWeight: 800, color: "#10D9A0", letterSpacing: "-2px", marginBottom: 16, lineHeight: 1 }}>
            Ping<span style={{ color: "#F1F5F9" }}>Close</span>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
            <a href="/faq" style={{ fontSize: 16, color: "#94A3B8", textDecoration: "none" }}>FAQ</a>
            <a href="/pricing" style={{ fontSize: 16, color: "#94A3B8", textDecoration: "none" }}>Pricing</a>
          </div>
        </div>

        <div style={{ maxWidth: 600, width: "100%", textAlign: "center", position: "relative" }}>

          {stage === "form" && (
            <>
              <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 20px", letterSpacing: "-1.5px", color: "#F9FAFB" }}>
                Does Your Website Load<br />
                <span style={{ color: "#10D9A0" }}>in Under 1 Second?</span>
              </h1>
              <p style={{ fontSize: 22, color: "#CBD5E1", margin: "0 0 14px", lineHeight: 1.5 }}>Ping your site and find out right now</p>
              <p style={{ fontSize: 18, color: "#94A3B8", margin: "0 0 40px", lineHeight: 1.6 }}>
                Free.&nbsp;&nbsp;No account needed.&nbsp;&nbsp;No credit card.&nbsp;&nbsp;
                <span style={{ color: "#10D9A0", fontWeight: 700 }}>Yes — it&apos;s really free.</span>
              </p>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input type="text" placeholder="yourwebsite.com" value={url} onChange={e => setUrl(e.target.value)} style={inputStyle} />
                <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                {error && <div style={{ fontSize: 16, color: "#F87171", textAlign: "left" }}>{error}</div>}
                <button type="submit" disabled={loading} style={btnStyle(!loading)}>
                  {loading ? "Checking your site…" : "Ping My Site →"}
                </button>
              </form>
              <a href="#hurdles" style={{ display: "block", marginTop: 24, fontSize: 17, color: "#94A3B8", textDecoration: "none" }}>
                Why does 1 second matter? ↓
              </a>
            </>
          )}

          {stage === "verifying" && (
            <>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
              <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, margin: "0 0 16px", letterSpacing: "-1px" }}>
                Check Your Email
              </h1>
              <p style={{ fontSize: 18, color: "#CBD5E1", margin: "0 0 12px", lineHeight: 1.6 }}>
                We need to verify your email to make sure you receive your PingClose report.
              </p>
              <p style={{ fontSize: 18, color: "#94A3B8", margin: "0 0 4px", lineHeight: 1.6 }}>
                We sent a 6-digit code to
              </p>
              <p style={{ fontSize: 18, color: "#10D9A0", fontWeight: 700, margin: "0 0 12px" }}>{email}</p>
              <p style={{ fontSize: 17, color: "#64748B", margin: "0 0 28px", lineHeight: 1.6 }}>
                Enter it below to run your audit.
              </p>

              <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  style={{ ...inputStyle, textAlign: "center", fontSize: 32, fontWeight: 800, letterSpacing: "12px" }}
                  autoFocus
                />
                {error && <div style={{ fontSize: 16, color: "#F87171", textAlign: "left" }}>{error}</div>}
                <button type="submit" disabled={loading || code.length !== 6} style={btnStyle(!loading && code.length === 6)}>
                  {loading ? "Verifying…" : "Confirm & Run My Audit →"}
                </button>
              </form>

              <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 24 }}>
                <button
                  onClick={() => { setStage("form"); setCode(""); setError(""); }}
                  style={{ fontSize: 16, color: "#64748B", background: "none", border: "none", cursor: "pointer" }}
                >
                  ← Change email
                </button>
                <button
                  onClick={async () => {
                    setError("");
                    setCode("");
                    const res = await fetch("/api/send-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, email }) });
                    const data = await res.json();
                    if (!res.ok) setError(data.error || "Could not resend.");
                    else setError("New code sent!");
                  }}
                  style={{ fontSize: 16, color: "#94A3B8", background: "none", border: "none", cursor: "pointer" }}
                >
                  Resend code
                </button>
              </div>
            </>
          )}

        </div>
      </section>

      {/* HURDLE SECTION */}
      <section id="hurdles" style={{ padding: "80px 24px", background: "#080F1C", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, margin: "0 0 20px", letterSpacing: "-1px" }}>
            If You Can&apos;t Clear the First Hurdle,<br />
            <span style={{ color: "#F87171" }}>You Can&apos;t Win the Race</span>
          </h2>
          <p style={{ fontSize: 20, color: "#94A3B8", margin: "0 0 60px", lineHeight: 1.6 }}>
            Google&apos;s first hurdle is loading your website in under 1 second on a 4G phone.<br />
            Most local businesses fail it before the race even begins.
          </p>

          {/* Cinematic Track Visual */}
          <div style={{ background: "#0D1528", border: "1px solid #1E3050", borderRadius: 16, overflow: "hidden", marginBottom: 40, position: "relative" }}>
            <div style={{ background: "linear-gradient(180deg, #060d1a 0%, #0a1628 40%, #0d1f3a 100%)", padding: "40px 32px 0", position: "relative", minHeight: 280 }}>
              {[...Array(20)].map((_, i) => (
                <div key={i} style={{ position: "absolute", width: i % 3 === 0 ? 2 : 1, height: i % 3 === 0 ? 2 : 1, background: "#fff", borderRadius: "50%", opacity: 0.4 + (i % 5) * 0.1, top: `${5 + (i * 13) % 40}%`, left: `${(i * 17 + 7) % 95}%` }} />
              ))}
              <div style={{ position: "relative", height: 220 }}>
                {[0, 1, 2, 3, 4, 5].map((lane) => (
                  <div key={lane} style={{ position: "absolute", bottom: 0, left: `${14 + lane * 12}%`, width: 1, height: "100%", background: lane === 3 ? "#F8717130" : "#10D9A015", transform: "perspective(400px) rotateX(45deg)", transformOrigin: "bottom center" }} />
                ))}
                <div style={{ position: "absolute", bottom: "30%", left: 0, right: 0, display: "flex", justifyContent: "space-around", alignItems: "flex-end", padding: "0 8%" }}>
                  {[
                    { label: "Competitor 1", height: 48, color: "#10D9A0" },
                    { label: "Competitor 2", height: 48, color: "#10D9A0" },
                    { label: "Competitor 3", height: 48, color: "#10D9A0" },
                    { label: "YOUR SITE", height: 140, color: "#F87171", isYou: true },
                    { label: "Competitor 4", height: 48, color: "#10D9A0" },
                    { label: "Competitor 5", height: 48, color: "#10D9A0" },
                  ].map((lane, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ position: "relative", width: lane.isYou ? 28 : 20 }}>
                        <div style={{ width: lane.isYou ? 4 : 3, height: lane.height, background: lane.color, margin: "0 auto", borderRadius: "2px 2px 0 0", boxShadow: lane.isYou ? `0 0 12px ${lane.color}60` : "none" }} />
                        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: lane.isYou ? 28 : 20, height: lane.isYou ? 5 : 4, background: lane.color, borderRadius: 2, boxShadow: lane.isYou ? `0 0 8px ${lane.color}80` : "none" }} />
                      </div>
                      {lane.isYou && <div style={{ fontSize: 16, fontWeight: 800, color: lane.color, textAlign: "center", whiteSpace: "nowrap" }}>YOUR SITE</div>}
                    </div>
                  ))}
                </div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", background: "linear-gradient(180deg, #0d1f3a 0%, #152035 100%)", borderTop: "2px solid #1E3050" }} />
                <div style={{ position: "absolute", right: 16, bottom: "30%", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <div style={{ fontSize: 16, color: "#F87171", fontWeight: 700 }}>YOUR HURDLE: 10 ft 🔴</div>
                  <div style={{ fontSize: 16, color: "#10D9A0" }}>Competitors: 4 ft ✅</div>
                </div>
              </div>
            </div>
            <div style={{ background: "#080f1c", padding: "14px 24px", borderTop: "1px solid #1E3050", textAlign: "center", fontSize: 16, color: "#64748B" }}>
              Every competitor with a fast website sees a 4 ft hurdle. A slow site makes yours <strong style={{ color: "#F87171" }}>10 feet tall.</strong>
            </div>
          </div>

          <p style={{ fontSize: 19, color: "#94A3B8", lineHeight: 1.7, maxWidth: 580, margin: "0 auto 48px" }}>
            Every competitor with a fast website clears the first hurdle cleanly.<br />
            A slow site makes that hurdle <strong style={{ color: "#F87171" }}>10 feet tall</strong> — before the race even starts.<br />
            How difficult is it to win when you can&apos;t clear the first one?
          </p>

          <div style={{ background: "#0D1528", border: "1px solid #1E3050", borderRadius: 16, padding: "32px 24px", textAlign: "left", maxWidth: 560, margin: "0 auto 48px" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", marginBottom: 24 }}>WHAT WE CHECK IN THE BACKGROUND</div>
            {[
              ["⚡", "Speed Signals", "TTFB, LCP, FCP, CLS, INP — every Core Web Vital"],
              ["🖼️", "Image Analysis", "WebP format, lazy loading, render-blocking images"],
              ["🔧", "Tech Stack", "Who hosts it, what CMS, CDN, HTTP version"],
              ["📜", "Code Analysis", "Render-blocking scripts, unused JS/CSS, minification"],
              ["📱", "4G Mobile Test", "Real-world load speed on a mobile connection"],
              ["🏆", "The Verdict", "Pass/fail with your top 3 fixes to win the race"],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ display: "flex", gap: 16, marginBottom: 18 }}>
                <div style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: "#F1F5F9", marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 16, color: "#94A3B8" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ background: "#10D9A0", color: "#0B0E16", fontSize: 18, fontWeight: 700, padding: "16px 40px", borderRadius: 10, border: "none", cursor: "pointer" }}>
            Ping My Site — It&apos;s Free →
          </button>
        </div>
      </section>

      <style>{`
        input::placeholder { color: #6B7280; }
        * { box-sizing: border-box; }
      `}</style>
    </main>
  );
}
