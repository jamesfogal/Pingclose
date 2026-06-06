"use client";
import { useState, useEffect } from "react";

interface Audit {
  id: string;
  url: string;
  email: string;
  created_at: string;
  mobile_score: number;
  passes_one_second: boolean;
  cms: string;
  hosting: string;
  contacted: boolean;
  agency_signal: boolean;
  top_issues: string[];
  notes: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authErr, setAuthErr] = useState("");
  const [audits, setAudits] = useState<Audit[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Audit | null>(null);
  const [notes, setNotes] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.ok) { setAuthed(true); loadAudits("all"); }
    else setAuthErr("Wrong password.");
  }

  async function loadAudits(f: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/audits?filter=${f}`, {
      headers: { "x-admin-password": password }
    });
    const data = await res.json();
    setAudits(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function markContacted(audit: Audit) {
    await fetch("/api/admin/audits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ id: audit.id, contacted: !audit.contacted, notes })
    });
    loadAudits(filter);
    setSelected(null);
  }

  useEffect(() => {
    if (authed) loadAudits(filter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const scoreColor = (s: number) => s >= 70 ? "#10D9A0" : s >= 50 ? "#FBBF24" : "#F87171";

  if (!authed) return (
    <main style={{
      minHeight: "100vh", background: "#0B0E16", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "system-ui, sans-serif"
    }}>
      <div style={{ maxWidth: 360, width: "100%", padding: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#10D9A0", textAlign: "center", marginBottom: 32 }}>
          Ping<span style={{ color: "#F1F5F9" }}>Close</span>
          <div style={{ fontSize: 12, color: "#475569", fontWeight: 400, marginTop: 4 }}>Admin Dashboard</div>
        </div>
        <form onSubmit={login} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="password" placeholder="Admin password" value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ padding: "12px 16px", background: "#111827", border: "1px solid #1F2937", borderRadius: 8, color: "#F1F5F9", fontSize: 14, outline: "none" }}
          />
          {authErr && <div style={{ fontSize: 12, color: "#F87171" }}>{authErr}</div>}
          <button type="submit" style={{ padding: "12px", background: "#10D9A0", border: "none", borderRadius: 8, color: "#0B0E16", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Sign In →
          </button>
        </form>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#0B0E16", color: "#F1F5F9", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#10D9A0" }}>PingClose Admin</div>
            <div style={{ fontSize: 12, color: "#475569" }}>{audits.length} leads</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["all", "new", "failing", "agency", "contacted"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "6px 12px", borderRadius: 6, border: "1px solid",
                borderColor: filter === f ? "#10D9A0" : "#1F2937",
                background: filter === f ? "#10D9A015" : "transparent",
                color: filter === f ? "#10D9A0" : "#64748B",
                fontSize: 12, fontWeight: 500, cursor: "pointer", textTransform: "capitalize"
              }}>{f}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ color: "#475569", textAlign: "center", padding: 40 }}>Loading...</div>
        ) : (
          <div style={{ border: "1px solid #1F2937", borderRadius: 12, overflow: "hidden" }}>
            {/* Table header */}
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 2fr 80px 80px 100px 80px 80px",
              gap: 8, padding: "10px 16px", background: "#111827",
              borderBottom: "1px solid #1F2937"
            }}>
              {["URL", "Email", "Score", "CMS", "Hosting", "Agency", "Status"].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "#475569" }}>{h}</div>
              ))}
            </div>

            {audits.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: "#475569" }}>No audits yet.</div>
            )}

            {audits.map((audit, i) => (
              <div
                key={audit.id}
                onClick={() => { setSelected(audit); setNotes(audit.notes || ""); }}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 2fr 80px 80px 100px 80px 80px",
                  gap: 8, padding: "12px 16px", cursor: "pointer",
                  borderBottom: i < audits.length - 1 ? "1px solid #1F2937" : "none",
                  background: selected?.id === audit.id ? "#111827" : "transparent",
                  transition: "background 0.15s"
                }}
              >
                <div style={{ fontSize: 12, color: "#F1F5F9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {audit.url.replace(/^https?:\/\//, "")}
                </div>
                <div style={{ fontSize: 12, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {audit.email}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: scoreColor(audit.mobile_score) }}>
                  {audit.mobile_score}
                </div>
                <div style={{ fontSize: 11, color: "#64748B" }}>{audit.cms || "—"}</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>{audit.hosting || "—"}</div>
                <div style={{ fontSize: 11, color: audit.agency_signal ? "#FBBF24" : "#374151" }}>
                  {audit.agency_signal ? "🏢 Agency" : "—"}
                </div>
                <div>
                  <span style={{
                    fontSize: 10, padding: "2px 6px", borderRadius: 4,
                    background: audit.contacted ? "#10D9A015" : "#F8717115",
                    color: audit.contacted ? "#10D9A0" : "#F87171",
                    border: `1px solid ${audit.contacted ? "#10D9A030" : "#F8717130"}`
                  }}>
                    {audit.contacted ? "Contacted" : "New"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail panel */}
        {selected && (
          <div style={{
            position: "fixed", right: 0, top: 0, bottom: 0, width: 380,
            background: "#111827", borderLeft: "1px solid #1F2937",
            padding: 24, overflowY: "auto", zIndex: 50
          }}>
            <button onClick={() => setSelected(null)} style={{
              background: "none", border: "none", color: "#64748B",
              cursor: "pointer", fontSize: 20, marginBottom: 16
            }}>×</button>

            <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 4, wordBreak: "break-all" }}>
              {selected.url}
            </div>
            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20 }}>
              {selected.email} · {new Date(selected.created_at).toLocaleDateString()}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              <div style={{ background: "#0B0E16", borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: scoreColor(selected.mobile_score) }}>{selected.mobile_score}</div>
                <div style={{ fontSize: 10, color: "#475569" }}>Mobile Score</div>
              </div>
              <div style={{ background: "#0B0E16", borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: selected.passes_one_second ? "#10D9A0" : "#F87171" }}>
                  {selected.passes_one_second ? "✅ PASS" : "❌ FAIL"}
                </div>
                <div style={{ fontSize: 10, color: "#475569" }}>1-Second Test</div>
              </div>
            </div>

            {selected.top_issues?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", marginBottom: 8 }}>TOP ISSUES</div>
                {selected.top_issues.map((issue, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#94A3B8", marginBottom: 6, display: "flex", gap: 6 }}>
                    <span style={{ color: "#F87171" }}>→</span>{issue}
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", marginBottom: 6 }}>NOTES</div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add notes about this prospect..."
                style={{
                  width: "100%", height: 80, background: "#0B0E16",
                  border: "1px solid #1F2937", borderRadius: 6,
                  color: "#F1F5F9", fontSize: 12, padding: 10,
                  resize: "vertical", outline: "none", boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <a
                href={`/report/${selected.id}`}
                target="_blank"
                style={{
                  flex: 1, padding: "10px", background: "transparent",
                  border: "1px solid #1F2937", borderRadius: 6,
                  color: "#94A3B8", fontSize: 12, fontWeight: 600,
                  textDecoration: "none", textAlign: "center"
                }}
              >
                View Report →
              </a>
              <button
                onClick={() => markContacted(selected)}
                style={{
                  flex: 1, padding: "10px",
                  background: selected.contacted ? "#F8717115" : "#10D9A0",
                  border: `1px solid ${selected.contacted ? "#F87171" : "#10D9A0"}`,
                  borderRadius: 6,
                  color: selected.contacted ? "#F87171" : "#0B0E16",
                  fontSize: 12, fontWeight: 700, cursor: "pointer"
                }}
              >
                {selected.contacted ? "Mark Uncontacted" : "Mark Contacted ✓"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
