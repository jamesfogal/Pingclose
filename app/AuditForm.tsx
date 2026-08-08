"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Stage = "form" | "verifying" | "verified";

function playPing() {
  try { new Audio("/sounds/ping.mp3").play(); } catch { /* ignore */ }
}

function inputStyle(focused: boolean) {
  return {
    width: "100%", padding: "18px 22px",
    background: "#111827",
    border: `2px solid ${focused ? "#10D9A0" : "#374151"}`,
    borderRadius: 10, color: "#F1F5F9", fontSize: 19,
    outline: "none", boxSizing: "border-box" as const,
    transition: "border-color 180ms cubic-bezier(0.23,1,0.32,1), box-shadow 180ms cubic-bezier(0.23,1,0.32,1)",
    boxShadow: focused ? "0 0 0 3px #10D9A015" : "none",
  };
}

// Only the interactive audit form is a Client Component — the headline,
// hero copy, and everything else that doesn't need state stays in the
// Server Component parent so it can paint with zero JS dependency.
export default function AuditForm() {
  const router = useRouter();
  const [url,          setUrl]          = useState("");
  const [email,        setEmail]        = useState("");
  const [phone,        setPhone]        = useState("");
  const [code,         setCode]         = useState("");
  const [stage,        setStage]        = useState<Stage>("form");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [urlFocused,   setUrlFocused]   = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!url || !email) { setError("Please enter your website URL and email."); return; }
    setLoading(true);
    try {
      const res  = await fetch("/api/send-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, email }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      if (data.alreadyVerified) { playPing(); router.push(`/check?url=${encodeURIComponent(url)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`); return; }
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
      router.push(`/check?url=${encodeURIComponent(url)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  const canSubmit = !loading;
  const btnStyle = {
    width: "100%", padding: "20px",
    background: canSubmit ? "#10D9A0" : "#0D1528",
    border: "2px solid #10D9A0", borderRadius: 10,
    color: canSubmit ? "#0B0E16" : "#10D9A0",
    fontSize: 20, fontWeight: 700,
    cursor: canSubmit ? "pointer" : "not-allowed" as const,
    transition: "background 180ms cubic-bezier(0.23,1,0.32,1), box-shadow 180ms cubic-bezier(0.23,1,0.32,1), transform 160ms cubic-bezier(0.23,1,0.32,1)",
  };

  if (stage === "verifying") {
    return (
      <>
        <div style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 800, margin: "0 0 16px", letterSpacing: "-1px", color: "#F9FAFB" }}>
          Check Your Email
        </div>
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
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input type="text" placeholder="yourwebsite.com" value={url} onChange={e => setUrl(e.target.value)}
        onFocus={() => setUrlFocused(true)} onBlur={() => setUrlFocused(false)}
        style={inputStyle(urlFocused)} />
      <div>
        <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
          onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)}
          style={inputStyle(emailFocused)} />
        <div style={{ fontSize: 16, color: "#64748B", marginTop: 6 }}>Verify your email so we can send you your report.</div>
      </div>
      <div>
        <input type="tel" placeholder="Your cell phone number" value={phone} onChange={e => setPhone(e.target.value)}
          onFocus={() => setPhoneFocused(true)} onBlur={() => setPhoneFocused(false)}
          style={inputStyle(phoneFocused)} />
        <div style={{ fontSize: 16, color: "#64748B", marginTop: 6 }}>Verify your cell phone to receive your report as a link.</div>
      </div>
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
  );
}
