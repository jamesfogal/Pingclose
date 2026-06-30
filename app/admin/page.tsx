"use client";
import { useState, useEffect } from "react";

interface Audit {
  id: string;
  url: string;
  email: string;
  created_at: string;
  mobile_score: number;
  desktop_score: number;
  passes_one_second: boolean;
  cms: string;
  hosting: string;
  contacted: boolean;
  agency_signal: boolean;
  top_issues: string[];
  notes: string;
  pipeline_stage: string;
  primary_keyword?: string;
}

const STAGES = [
  { id: "new",         label: "New Lead",        color: "#F87171", bg: "#F8717115" },
  { id: "contacted",   label: "Contacted",        color: "#FBBF24", bg: "#FBBF2415" },
  { id: "appointment", label: "Appt Set",         color: "#60A5FA", bg: "#60A5FA15" },
  { id: "quoted",      label: "Quoted",           color: "#A78BFA", bg: "#A78BFA15" },
  { id: "closed_won",  label: "Closed Won",       color: "#10D9A0", bg: "#10D9A015" },
  { id: "closed_lost", label: "Closed Lost",      color: "#475569", bg: "#47556915" },
];

const stageInfo = (id: string) => STAGES.find(s => s.id === id) || STAGES[0];
const scoreColor = (s: number) => s >= 70 ? "#10D9A0" : s >= 50 ? "#FBBF24" : "#F87171";

export default function AdminPage() {
  const [password, setPassword]   = useState("");
  const [authed, setAuthed]       = useState(false);
  const [authErr, setAuthErr]     = useState("");
  const [audits, setAudits]       = useState<Audit[]>([]);
  const [filter, setFilter]       = useState("all");
  const [loading, setLoading]     = useState(false);
  const [selected, setSelected]   = useState<Audit | null>(null);
  const [notes, setNotes]         = useState("");
  const [saving, setSaving]       = useState(false);
  const [view, setView]           = useState<"list" | "pipeline">("list");

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

  async function updateStage(audit: Audit, pipeline_stage: string) {
    setSaving(true);
    await fetch("/api/admin/audits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ id: audit.id, pipeline_stage, notes })
    });
    await loadAudits(filter);
    setSelected(prev => prev ? { ...prev, pipeline_stage, notes } : null);
    setSaving(false);
  }

  async function saveNotes(audit: Audit) {
    setSaving(true);
    await fetch("/api/admin/audits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ id: audit.id, pipeline_stage: audit.pipeline_stage, notes })
    });
    setSaving(false);
  }

  useEffect(() => {
    if (authed) loadAudits(filter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // ── Pipeline counts ──────────────────────────────────────────────
  const stageCounts = STAGES.reduce((acc, s) => {
    acc[s.id] = audits.filter(a => (a.pipeline_stage || "new") === s.id).length;
    return acc;
  }, {} as Record<string, number>);
  const totalAll = audits.length;

  if (!authed) return (
    <main style={{ minHeight: "100vh", background: "#0B0E16", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 360, width: "100%", padding: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#10D9A0", textAlign: "center", marginBottom: 32 }}>
          Ping<span style={{ color: "#F1F5F9" }}>Close</span>
          <div style={{ fontSize: 16, color: "#475569", fontWeight: 400, marginTop: 4 }}>Admin Dashboard</div>
        </div>
        <form onSubmit={login} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="password" placeholder="Admin password" value={password} onChange={e => setPassword(e.target.value)}
            style={{ padding: "12px 16px", background: "#111827", border: "1px solid #1F2937", borderRadius: 8, color: "#F1F5F9", fontSize: 16, outline: "none" }} />
          {authErr && <div style={{ fontSize: 16, color: "#F87171" }}>{authErr}</div>}
          <button type="submit" style={{ padding: 12, background: "#10D9A0", border: "none", borderRadius: 8, color: "#0B0E16", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
            Sign In →
          </button>
        </form>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#0B0E16", color: "#F1F5F9", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#10D9A0" }}>PingClose Admin</div>
            <div style={{ fontSize: 16, color: "#475569" }}>{totalAll} total leads</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setView("list")} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid", borderColor: view === "list" ? "#10D9A0" : "#1F2937", background: view === "list" ? "#10D9A015" : "transparent", color: view === "list" ? "#10D9A0" : "#64748B", fontSize: 16, cursor: "pointer" }}>List</button>
            <button onClick={() => setView("pipeline")} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid", borderColor: view === "pipeline" ? "#10D9A0" : "#1F2937", background: view === "pipeline" ? "#10D9A015" : "transparent", color: view === "pipeline" ? "#10D9A0" : "#64748B", fontSize: 16, cursor: "pointer" }}>Pipeline</button>
          </div>
        </div>

        {/* Pipeline stage summary bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 20 }}>
          {STAGES.map(s => (
            <button key={s.id} onClick={() => { setFilter(s.id); setView("list"); }} style={{ padding: "10px 8px", borderRadius: 8, border: `1px solid ${s.color}30`, background: filter === s.id ? s.bg : "#111827", cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{stageCounts[s.id] || 0}</div>
              <div style={{ fontSize: 16, color: "#64748B", marginTop: 2 }}>{s.label}</div>
            </button>
          ))}
        </div>

        {/* List filters */}
        {view === "list" && (
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {[{ id: "all", label: "All" }, { id: "failing", label: "🔴 Failing" }, { id: "agency", label: "🏢 Agency" }, ...STAGES.map(s => ({ id: s.id, label: s.label }))].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: "7px 12px", borderRadius: 5, border: "1px solid", borderColor: filter === f.id ? "#10D9A0" : "#1F2937", background: filter === f.id ? "#10D9A015" : "transparent", color: filter === f.id ? "#10D9A0" : "#64748B", fontSize: 16, cursor: "pointer" }}>
                {f.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ color: "#475569", textAlign: "center", padding: 40 }}>Loading...</div>
        ) : view === "pipeline" ? (

          /* ── Pipeline view ────────────────────────────────────── */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {STAGES.map(stage => {
              const stageAudits = audits.filter(a => (a.pipeline_stage || "new") === stage.id);
              return (
                <div key={stage.id} style={{ background: "#111827", border: `1px solid ${stage.color}30`, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", borderBottom: `1px solid ${stage.color}20`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: stage.color }}>{stage.label}</span>
                    <span style={{ fontSize: 16, color: "#475569" }}>{stageAudits.length}</span>
                  </div>
                  <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6, maxHeight: 400, overflowY: "auto" }}>
                    {stageAudits.length === 0 && <div style={{ fontSize: 16, color: "#374151", textAlign: "center", padding: 16 }}>Empty</div>}
                    {stageAudits.map(audit => (
                      <div key={audit.id} onClick={() => { setSelected(audit); setNotes(audit.notes || ""); }} style={{ padding: "10px 12px", background: "#0B0E16", borderRadius: 7, cursor: "pointer", border: selected?.id === audit.id ? `1px solid ${stage.color}60` : "1px solid transparent" }}>
                        <div style={{ fontSize: 16, color: "#F1F5F9", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {audit.url.replace(/^https?:\/\//, "")}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 16, color: "#64748B" }}>{audit.email.split("@")[1]}</span>
                          <span style={{ fontSize: 16, fontWeight: 700, color: scoreColor(audit.mobile_score) }}>{audit.mobile_score}</span>
                        </div>
                        {audit.agency_signal && <div style={{ fontSize: 16, color: "#FBBF24", marginTop: 2 }}>🏢 Agency</div>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        ) : (

          /* ── List view ────────────────────────────────────────── */
          <div style={{ border: "1px solid #1F2937", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2.5fr 2.5fr 90px 110px 140px 100px 140px", gap: 8, padding: "10px 16px", background: "#111827", borderBottom: "1px solid #1F2937" }}>
              {["URL", "Email", "Score", "CMS", "Hosting", "Agency", "Stage"].map(h => (
                <div key={h} style={{ fontSize: 16, fontWeight: 700, color: "#475569" }}>{h}</div>
              ))}
            </div>
            {audits.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#475569" }}>No audits yet.</div>}
            {audits.map((audit, i) => {
              const stage = stageInfo(audit.pipeline_stage || "new");
              return (
                <div key={audit.id} onClick={() => { setSelected(audit); setNotes(audit.notes || ""); }}
                  style={{ display: "grid", gridTemplateColumns: "2.5fr 2.5fr 90px 110px 140px 100px 140px", gap: 8, padding: "13px 16px", cursor: "pointer", borderBottom: i < audits.length - 1 ? "1px solid #1F2937" : "none", background: selected?.id === audit.id ? "#111827" : "transparent", transition: "background 0.15s" }}>
                  <div style={{ fontSize: 16, color: "#F1F5F9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{audit.url.replace(/^https?:\/\//, "")}</div>
                  <div style={{ fontSize: 16, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{audit.email}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: scoreColor(audit.mobile_score) }}>{audit.mobile_score}</div>
                  <div style={{ fontSize: 16, color: "#64748B" }}>{audit.cms || "—"}</div>
                  <div style={{ fontSize: 16, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{audit.hosting || "—"}</div>
                  <div style={{ fontSize: 16, color: audit.agency_signal ? "#FBBF24" : "#374151" }}>{audit.agency_signal ? "🏢 Yes" : "—"}</div>
                  <div>
                    <span style={{ fontSize: 16, padding: "4px 10px", borderRadius: 4, background: stage.bg, color: stage.color, border: `1px solid ${stage.color}30`, whiteSpace: "nowrap" }}>
                      {stage.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Detail panel ──────────────────────────────────────── */}
        {selected && (
          <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 460, background: "#111827", borderLeft: "1px solid #1F2937", padding: 24, overflowY: "auto", zIndex: 50 }}>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 20, marginBottom: 16 }}>×</button>

            <div style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9", marginBottom: 2, wordBreak: "break-all" }}>{selected.url}</div>
            <div style={{ fontSize: 16, color: "#64748B", marginBottom: 20 }}>
              {selected.email} · {new Date(selected.created_at).toLocaleDateString()}
              {selected.agency_signal && <span style={{ color: "#FBBF24", marginLeft: 8 }}>🏢 Agency</span>}
            </div>

            {/* Scores */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              <div style={{ background: "#0B0E16", borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: scoreColor(selected.mobile_score) }}>{selected.mobile_score}</div>
                <div style={{ fontSize: 16, color: "#475569" }}>Mobile Score</div>
              </div>
              <div style={{ background: "#0B0E16", borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: selected.passes_one_second ? "#10D9A0" : "#F87171" }}>
                  {selected.passes_one_second ? "✅ PASS" : "❌ FAIL"}
                </div>
                <div style={{ fontSize: 16, color: "#475569" }}>1-Second Test</div>
              </div>
            </div>

            {/* Pipeline stage selector */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#475569", marginBottom: 8 }}>PIPELINE STAGE</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {STAGES.map(s => (
                  <button key={s.id} onClick={() => updateStage(selected, s.id)} style={{ padding: "10px 10px", borderRadius: 6, border: `1px solid ${s.color}${(selected.pipeline_stage || "new") === s.id ? "80" : "30"}`, background: (selected.pipeline_stage || "new") === s.id ? s.bg : "transparent", color: s.color, fontSize: 16, fontWeight: (selected.pipeline_stage || "new") === s.id ? 700 : 400, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Top issues */}
            {selected.top_issues?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#475569", marginBottom: 8 }}>TOP ISSUES</div>
                {selected.top_issues.slice(0, 5).map((issue, i) => (
                  <div key={i} style={{ fontSize: 16, color: "#94A3B8", marginBottom: 5, display: "flex", gap: 6 }}>
                    <span style={{ color: "#F87171", flexShrink: 0 }}>→</span>{issue.replace(/^\[\d+\]\s*/, "")}
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#475569", marginBottom: 6 }}>NOTES</div>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes about this prospect..."
                style={{ width: "100%", height: 90, background: "#0B0E16", border: "1px solid #1F2937", borderRadius: 6, color: "#F1F5F9", fontSize: 16, padding: 10, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
              <button onClick={() => saveNotes(selected)} disabled={saving} style={{ marginTop: 6, padding: "8px 14px", background: "transparent", border: "1px solid #1F2937", borderRadius: 5, color: "#64748B", fontSize: 16, cursor: "pointer" }}>
                {saving ? "Saving..." : "Save Notes"}
              </button>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <a href={`/report/${selected.id}`} target="_blank" style={{ flex: 1, padding: 10, background: "transparent", border: "1px solid #1F2937", borderRadius: 6, color: "#94A3B8", fontSize: 16, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
                View Report →
              </a>
              <a href={`mailto:${selected.email}`} style={{ flex: 1, padding: 10, background: "#10D9A0", border: "none", borderRadius: 6, color: "#0B0E16", fontSize: 16, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                Email Lead →
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
