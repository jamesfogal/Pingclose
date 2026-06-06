"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!url || !email) { setError("Please enter your website URL and email."); return; }
    setLoading(true);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, email })
      });
      const data = await res.json();

      if (data.duplicate) {
        router.push("/check?duplicate=true");
        return;
      }
      if (data.error) { setError(data.error); setLoading(false); return; }

      router.push(`/check?id=${data.reportId}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0B0E16", color: "#F1F5F9", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ABOVE THE FOLD */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: "linear-gradient(135deg, #0B0E16 0%, #0D1528 50%, #0B0E16 100%)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Subtle grid background */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: "linear-gradient(#10D9A0 1px, transparent 1px), linear-gradient(90deg, #10D9A0 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        {/* Logo */}
        <div style={{ marginBottom: 48, textAlign: "center", position: "relative" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#10D9A0", letterSpacing: "-1px" }}>
            Ping<span style={{ color: "#F1F5F9" }}>Close</span>
          </div>
        </div>

        <div style={{ maxWidth: 600, width: "100%", textAlign: "center", position: "relative" }}>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 800,
            lineHeight: 1.1,
            margin: "0 0 16px",
            letterSpacing: "-1.5px",
            color: "#F9FAFB"
          }}>
            Does Your Website Load<br />
            <span style={{ color: "#10D9A0" }}>in Under 1 Second?</span>
          </h1>

          {/* Subheadline */}
          <p style={{ fontSize: 20, color: "#CBD5E1", margin: "0 0 12px", lineHeight: 1.5 }}>
            Ping your site and find out right now
          </p>

          {/* Trust line */}
          <p style={{ fontSize: 16, color: "#94A3B8", margin: "0 0 36px" }}>
            Free.&nbsp;&nbsp;No account needed.&nbsp;&nbsp;No credit card.&nbsp;&nbsp;
            <span style={{ color: "#10D9A0", fontWeight: 700 }}>Yes — it&apos;s really free.</span>
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="text"
              placeholder="yourwebsite.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              style={{
                width: "100%", padding: "14px 18px",
                background: "#111827", border: "1.5px solid #1F2937",
                borderRadius: 10, color: "#F1F5F9", fontSize: 16,
                outline: "none", boxSizing: "border-box"
              }}
            />
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: "100%", padding: "14px 18px",
                background: "#111827", border: "1.5px solid #1F2937",
                borderRadius: 10, color: "#F1F5F9", fontSize: 16,
                outline: "none", boxSizing: "border-box"
              }}
            />

            {error && <div style={{ fontSize: 13, color: "#F87171", textAlign: "left" }}>{error}</div>}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "16px",
                background: loading ? "#0D1528" : "#10D9A0",
                border: "2px solid #10D9A0",
                borderRadius: 10,
                color: loading ? "#10D9A0" : "#0B0E16",
                fontSize: 16, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Analyzing your site..." : "Ping My Site →"}
            </button>
          </form>

          <a
            href="#hurdles"
            style={{ display: "block", marginTop: 20, fontSize: 16, color: "#94A3B8", textDecoration: "none" }}
          >
            Why does 1 second matter? &#8595;
          </a>
        </div>
      </section>

      {/* HURDLE SECTION */}
      <section id="hurdles" style={{ padding: "80px 24px", background: "#080F1C", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>

          <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, margin: "0 0 16px", letterSpacing: "-1px" }}>
            If You Can&apos;t Clear the First Hurdle,<br />
            <span style={{ color: "#F87171" }}>You Can&apos;t Win the Race</span>
          </h2>

          <p style={{ fontSize: 16, color: "#64748B", margin: "0 0 60px", lineHeight: 1.6 }}>
            Google&apos;s first hurdle is loading your website in under 1 second on a 4G phone.<br />
            Most local businesses fail it before the race even begins.
          </p>

          {/* CSS Race Track */}
          <div style={{
            background: "#0D1528", border: "1px solid #1E3050",
            borderRadius: 16, padding: "32px 24px", marginBottom: 40
          }}>
            {[
              { label: "Competitor 1", isYou: false },
              { label: "Competitor 2", isYou: false },
              { label: "YOUR SITE", isYou: true },
              { label: "Competitor 3", isYou: false },
              { label: "Competitor 4", isYou: false },
              { label: "Competitor 5", isYou: false },
            ].map((runner, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-end", gap: 12,
                marginBottom: i < 5 ? 12 : 0,
                paddingBottom: i < 5 ? 12 : 0,
                borderBottom: i < 5 ? "1px solid #152035" : "none"
              }}>
                <div style={{ width: 90, textAlign: "right", flexShrink: 0, paddingBottom: 4 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: runner.isYou ? "#F87171" : "#10D9A0", marginBottom: 2 }}>
                    {runner.label}
                  </div>
                  <div style={{ fontSize: 20 }}>{runner.isYou ? "😰" : "🏃"}</div>
                </div>

                <div style={{ flex: 1, position: "relative", height: runner.isYou ? 90 : 30, display: "flex", alignItems: "flex-end" }}>
                  {/* track line */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: "#152035", borderRadius: 3 }} />
                  {/* hurdle post */}
                  <div style={{
                    position: "absolute", left: "40%", bottom: 0,
                    width: runner.isYou ? 6 : 4,
                    height: runner.isYou ? 90 : 30,
                    background: runner.isYou ? "#F87171" : "#10D9A0",
                    borderRadius: "2px 2px 0 0"
                  }} />
                  {/* hurdle bar */}
                  <div style={{
                    position: "absolute",
                    left: "calc(40% - 10px)",
                    bottom: runner.isYou ? 84 : 24,
                    width: runner.isYou ? 26 : 24,
                    height: runner.isYou ? 6 : 5,
                    background: runner.isYou ? "#F87171" : "#10D9A0",
                    borderRadius: 2
                  }} />
                </div>

                <div style={{ width: 36, flexShrink: 0, paddingBottom: 8 }}>
                  <div style={{ fontSize: 10, color: runner.isYou ? "#F87171" : "#475569", fontWeight: runner.isYou ? 700 : 400 }}>
                    {runner.isYou ? "10 ft" : "4 ft"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 15, color: "#64748B", lineHeight: 1.7, maxWidth: 580, margin: "0 auto 48px" }}>
            Every competitor with a fast website clears the first hurdle cleanly.<br />
            A slow site makes that hurdle <strong style={{ color: "#F87171" }}>10 feet tall</strong> — before the race even starts.<br />
            How difficult is it to win when you can&apos;t clear the first one?
          </p>

          {/* What we check */}
          <div style={{
            background: "#0D1528", border: "1px solid #1E3050",
            borderRadius: 16, padding: "32px 24px", textAlign: "left",
            maxWidth: 560, margin: "0 auto 48px"
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", marginBottom: 20 }}>
              WHAT WE CHECK IN THE BACKGROUND
            </div>
            {[
              ["⚡", "Speed Signals", "TTFB, LCP, FCP, CLS, INP — every Core Web Vital"],
              ["🖼️", "Image Analysis", "WebP format, lazy loading, render-blocking images"],
              ["🔧", "Tech Stack", "Who hosts it, what CMS, CDN, HTTP version"],
              ["📜", "Code Analysis", "Render-blocking scripts, unused JS/CSS, minification"],
              ["📱", "4G Mobile Test", "Real-world load speed on a mobile connection"],
              ["🏆", "The Verdict", "Pass/fail with your top 3 fixes to win the race"],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9", marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 12, color: "#64748B" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            style={{
              background: "#10D9A0", color: "#0B0E16",
              fontSize: 16, fontWeight: 700,
              padding: "14px 36px", borderRadius: 10,
              border: "none", cursor: "pointer"
            }}
          >
            Ping My Site — It&apos;s Free &#8594;
          </button>
        </div>
      </section>

      <style>{`
        input::placeholder { color: #374151; }
        * { box-sizing: border-box; }
      `}</style>
    </main>
  );
}
