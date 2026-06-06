"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function CheckContent() {
  const params = useSearchParams();
  const duplicate = params.get("duplicate");

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

      {/* Subtle grid background */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(#10D9A0 1px, transparent 1px), linear-gradient(90deg, #10D9A0 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />

      <div style={{ maxWidth: 520, width: "100%", textAlign: "center", position: "relative" }}>

        {/* Logo */}
        <div style={{ fontSize: 32, fontWeight: 800, color: "#10D9A0", marginBottom: 40, letterSpacing: "-1px" }}>
          Ping<span style={{ color: "#F1F5F9" }}>Close</span>
        </div>

        {duplicate ? (
          <>
            <div style={{ fontSize: 56, marginBottom: 20 }}>📬</div>
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 16px", letterSpacing: "-0.5px" }}>
              Already on its way!
            </h1>
            <p style={{ fontSize: 19, color: "#CBD5E1", lineHeight: 1.6, margin: 0 }}>
              Your report is already on its way — check your inbox.
            </p>
          </>
        ) : (
          <>
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

            {/* What we're checking */}
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
                <div key={text} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "center" }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: 17, color: "#94A3B8" }}>{text}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 17, color: "#64748B", margin: 0 }}>
              Check your email — your report link is permanent and shareable.
            </p>
          </>
        )}

        <Link href="/" style={{
          display: "inline-block", marginTop: 40,
          fontSize: 17, color: "#64748B", textDecoration: "none"
        }}>
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
