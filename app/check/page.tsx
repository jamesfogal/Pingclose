"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CheckContent() {
  const params = useSearchParams();
  const duplicate = params.get("duplicate");

  return (
    <main style={{
      minHeight: "100vh", background: "#0B0E16", color: "#F1F5F9",
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px"
    }}>
      <div style={{ maxWidth: 480, textAlign: "center" }}>

        <div style={{ fontSize: 28, fontWeight: 800, color: "#10D9A0", marginBottom: 32 }}>
          Ping<span style={{ color: "#F1F5F9" }}>Close</span>
        </div>

        {duplicate ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 12px" }}>
              Already on its way!
            </h1>
            <p style={{ fontSize: 15, color: "#94A3B8", lineHeight: 1.6 }}>
              Your report is already on its way — check your inbox.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 12px", letterSpacing: "-0.5px" }}>
              Analyzing your site...
            </h1>
            <p style={{ fontSize: 15, color: "#94A3B8", lineHeight: 1.6, margin: "0 0 32px" }}>
              We&apos;re running your full speed audit right now.<br />
              Your report will land in your inbox in about 60 seconds.
            </p>

            {/* Animated progress bar */}
            <div style={{ background: "#111827", borderRadius: 8, height: 6, overflow: "hidden", marginBottom: 24 }}>
              <div style={{
                height: "100%", background: "#10D9A0", borderRadius: 8,
                animation: "progress 8s ease-in-out forwards"
              }} />
            </div>

            <div style={{ fontSize: 12, color: "#475569" }}>
              Checking PageSpeed · Analyzing tech stack · Building your report
            </div>
          </>
        )}

        <a href="/" style={{
          display: "inline-block", marginTop: 40,
          fontSize: 13, color: "#475569", textDecoration: "none"
        }}>
          ← Back to PingClose
        </a>
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          20% { width: 25%; }
          50% { width: 60%; }
          80% { width: 85%; }
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
