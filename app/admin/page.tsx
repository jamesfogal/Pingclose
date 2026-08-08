"use client";
import { useState, useEffect } from "react";
import { colors, fontSize } from "@/lib/designTokens";

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

// Six pipeline stages need six visually distinct colors to work as a Kanban
// board — this is categorical status coding (like a chart legend), not the
// decorative palette drift the design-token migration targets, so it stays
// outside the 9-color brand palette on purpose.
const STAGES = [
  { id: "new",         label: "New Lead",        color: colors.statusFail, bg: colors.statusFail + "15" },
  { id: "contacted",   label: "Contacted",        color: colors.statusWarn, bg: colors.statusWarn + "15" },
  { id: "appointment", label: "Appt Set",         color: "#60A5FA",         bg: "#60A5FA15" },
  { id: "quoted",      label: "Quoted",           color: "#A78BFA",         bg: "#A78BFA15" },
  { id: "closed_won",  label: "Closed Won",       color: colors.signal,     bg: colors.signal + "15" },
  { id: "closed_lost", label: "Closed Lost",      color: "#475569",         bg: "#47556915" },
];

const stageInfo = (id: string) => STAGES.find(s => s.id === id) || STAGES[0];
const scoreColor = (s: number) => s >= 70 ? colors.signal : s >= 50 ? colors.statusWarn : colors.statusFail;

export default function AdminPage() {
  const [password, setPassword]   = useState("");
  const [totpCode, setTotpCode]   = useState("");
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
      body: JSON.stringify({ password, totpCode })
    });
    const data = await res.json();
    if (data.ok) { setAuthed(true); loadAudits("all"); }
    else setAuthErr("Wrong password or code.");
  }

  async function loadAudits(f: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/audits?filter=${f}`, {
      headers: { "x-admin-password": password, "x-admin-totp": totpCode }
    });
    const data = await res.json();
    setAudits(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function updateStage(audit: Audit, pipeline_stage: string) {
    setSaving(true);
    await fetch("/api/admin/audits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password, "x-admin-totp": totpCode },
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
      headers: { "Content-Type": "application/json", "x-admin-password": password, "x-admin-totp": totpCode },
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
    <main style={{ minHeight: "100vh", background: colors.void, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 360, width: "100%", padding: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: colors.signal, textAlign: "center", marginBottom: 32 }}>
          Ping<span style={{ color: colors.textPrimary }}>Close</span>
          <div style={{ fontSize: fontSize.label, color: colors.textSecondary, fontWeight: 400, marginTop: 4 }}>Admin Dashboard</div>
        </div>
        <form onSubmit={login} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="password" placeholder="Admin password" value={password} onChange={e => setPassword(e.target.value)}
            style={{ padding: "12px 16px", background: colors.surfaceInset, border: `1px solid ${colors.border}`, borderRadius: 8, color: colors.textPrimary, fontSize: fontSize.label, outline: "none" }} />
          <input type="text" inputMode="numeric" placeholder="6-digit authenticator code" value={totpCode} onChange={e => setTotpCode(e.target.value)} maxLength={6}
            style={{ padding: "12px 16px", background: colors.surfaceInset, border: `1px solid ${colors.border}`, borderRadius: 8, color: colors.textPrimary, fontSize: fontSize.label, outline: "none", letterSpacing: 4 }} />
          {authErr && <div style={{ fontSize: fontSize.label, color: colors.statusFail }}>{authErr}</div>}
          <button type="submit" style={{ padding: 12, background: colors.signal, border: "none", borderRadius: 8, color: colors.void, fontSize: fontSize.label, fontWeight: 700, cursor: "pointer" }}>
            Sign In →
          </button>
        </form>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: colors.void, color: colors.textPrimary, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: colors.signal }}>PingClose Admin</div>
            <div style={{ fontSize: fontSize.label, color: colors.textSecondary }}>{totalAll} total leads</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setView("list")} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid", borderColor: view === "list" ? colors.signal : colors.border, background: view === "list" ? colors.signal + "15" : "transparent", color: view === "list" ? colors.signal : colors.textSecondary, fontSize: fontSize.label, cursor: "pointer" }}>List</button>
            <button onClick={() => setView("pipeline")} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid", borderColor: view === "pipeline" ? colors.signal : colors.border, background: view === "pipeline" ? colors.signal + "15" : "transparent", color: view === "pipeline" ? colors.signal : colors.textSecondary, fontSize: fontSize.label, cursor: "pointer" }}>Pipeline</button>
          </div>
        </div>

        {/* Pipeline stage summary bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 20 }}>
          {STAGES.map(s => (
            <button key={s.id} onClick={() => { setFilter(s.id); setView("list"); }} style={{ padding: "10px 8px", borderRadius: 8, border: `1px solid ${s.color}30`, background: filter === s.id ? s.bg : colors.surfaceInset, cursor: "pointer", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{stageCounts[s.id] || 0}</div>
              <div style={{ fontSize: fontSize.label, color: colors.textSecondary, marginTop: 2 }}>{s.label}</div>
            </button>
          ))}
        </div>

        {/* List filters */}
        {view === "list" && (
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {[{ id: "all", label: "All" }, { id: "failing", label: "🔴 Failing" }, { id: "agency", label: "🏢 Agency" }, ...STAGES.map(s => ({ id: s.id, label: s.label }))].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: "7px 12px", borderRadius: 5, border: "1px solid", borderColor: filter === f.id ? colors.signal : colors.border, background: filter === f.id ? colors.signal + "15" : "transparent", color: filter === f.id ? colors.signal : colors.textSecondary, fontSize: fontSize.label, cursor: "pointer" }}>
                {f.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ color: colors.textSecondary, textAlign: "center", padding: 40 }}>Loading...</div>
        ) : view === "pipeline" ? (

          /* ── Pipeline view ────────────────────────────────────── */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {STAGES.map(stage => {
              const stageAudits = audits.filter(a => (a.pipeline_stage || "new") === stage.id);
              return (
                <div key={stage.id} style={{ background: colors.surfaceInset, border: `1px solid ${stage.color}30`, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", borderBottom: `1px solid ${stage.color}20`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: fontSize.label, fontWeight: 700, color: stage.color }}>{stage.label}</span>
                    <span style={{ fontSize: fontSize.label, color: colors.textSecondary }}>{stageAudits.length}</span>
                  </div>
                  <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6, maxHeight: 400, overflowY: "auto" }}>
                    {stageAudits.length === 0 && <div style={{ fontSize: fontSize.label, color: colors.textSecondary, textAlign: "center", padding: 16 }}>Empty</div>}
                    {stageAudits.map(audit => (
                      <div key={audit.id} onClick={() => { setSelected(audit); setNotes(audit.notes || ""); }} style={{ padding: "10px 12px", background: colors.void, borderRadius: 7, cursor: "pointer", border: selected?.id === audit.id ? `1px solid ${stage.color}60` : "1px solid transparent" }}>
                        <div style={{ fontSize: fontSize.label, color: colors.textPrimary, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {audit.url.replace(/^https?:\/\//, "")}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: fontSize.label, color: colors.textSecondary }}>{audit.email.split("@")[1]}</span>
                          <span style={{ fontSize: fontSize.label, fontWeight: 700, color: scoreColor(audit.mobile_score) }}>{audit.mobile_score}</span>
                        </div>
                        {audit.agency_signal && <div style={{ fontSize: fontSize.label, color: colors.statusWarn, marginTop: 2 }}>🏢 Agency</div>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        ) : (

          /* ── List view ────────────────────────────────────────── */
          <div style={{ border: `1px solid ${colors.border}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2.5fr 2.5fr 90px 110px 140px 100px 140px", gap: 8, padding: "10px 16px", background: colors.surfaceInset, borderBottom: `1px solid ${colors.border}` }}>
              {["URL", "Email", "Score", "CMS", "Hosting", "Agency", "Stage"].map(h => (
                <div key={h} style={{ fontSize: fontSize.label, fontWeight: 700, color: colors.textSecondary }}>{h}</div>
              ))}
            </div>
            {audits.length === 0 && <div style={{ textAlign: "center", padding: 40, color: colors.textSecondary }}>No audits yet.</div>}
            {audits.map((audit, i) => {
              const stage = stageInfo(audit.pipeline_stage || "new");
              return (
                <div key={audit.id} onClick={() => { setSelected(audit); setNotes(audit.notes || ""); }}
                  style={{ display: "grid", gridTemplateColumns: "2.5fr 2.5fr 90px 110px 140px 100px 140px", gap: 8, padding: "13px 16px", cursor: "pointer", borderBottom: i < audits.length - 1 ? `1px solid ${colors.border}` : "none", background: selected?.id === audit.id ? colors.surfaceInset : "transparent", transition: "background 0.15s" }}>
                  <div style={{ fontSize: fontSize.label, color: colors.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{audit.url.replace(/^https?:\/\//, "")}</div>
                  <div style={{ fontSize: fontSize.label, color: colors.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{audit.email}</div>
                  <div style={{ fontSize: fontSize.label, fontWeight: 700, color: scoreColor(audit.mobile_score) }}>{audit.mobile_score}</div>
                  <div style={{ fontSize: fontSize.label, color: colors.textSecondary }}>{audit.cms || "—"}</div>
                  <div style={{ fontSize: fontSize.label, color: colors.textSecondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{audit.hosting || "—"}</div>
                  <div style={{ fontSize: fontSize.label, color: audit.agency_signal ? colors.statusWarn : colors.textSecondary }}>{audit.agency_signal ? "🏢 Yes" : "—"}</div>
                  <div>
                    <span style={{ fontSize: fontSize.label, padding: "4px 10px", borderRadius: 4, background: stage.bg, color: stage.color, border: `1px solid ${stage.color}30`, whiteSpace: "nowrap" }}>
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
          <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 460, background: colors.surfaceInset, borderLeft: `1px solid ${colors.border}`, padding: 24, overflowY: "auto", zIndex: 50 }}>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: colors.textSecondary, cursor: "pointer", fontSize: 20, marginBottom: 16 }}>×</button>

            <div style={{ fontSize: fontSize.bodyLarge, fontWeight: 700, color: colors.textPrimary, marginBottom: 2, wordBreak: "break-all" }}>{selected.url}</div>
            <div style={{ fontSize: fontSize.label, color: colors.textSecondary, marginBottom: 20 }}>
              {selected.email} · {new Date(selected.created_at).toLocaleDateString()}
              {selected.agency_signal && <span style={{ color: colors.statusWarn, marginLeft: 8 }}>🏢 Agency</span>}
            </div>

            {/* Scores */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              <div style={{ background: colors.void, borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: scoreColor(selected.mobile_score) }}>{selected.mobile_score}</div>
                <div style={{ fontSize: fontSize.label, color: colors.textSecondary }}>Mobile Score</div>
              </div>
              <div style={{ background: colors.void, borderRadius: 8, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: fontSize.label, fontWeight: 700, color: selected.passes_one_second ? colors.signal : colors.statusFail }}>
                  {selected.passes_one_second ? "✅ PASS" : "❌ FAIL"}
                </div>
                <div style={{ fontSize: fontSize.label, color: colors.textSecondary }}>1-Second Test</div>
              </div>
            </div>

            {/* Pipeline stage selector */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: fontSize.label, fontWeight: 700, color: colors.textSecondary, marginBottom: 8 }}>PIPELINE STAGE</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {STAGES.map(s => (
                  <button key={s.id} onClick={() => updateStage(selected, s.id)} style={{ padding: "10px 10px", borderRadius: 6, border: `1px solid ${s.color}${(selected.pipeline_stage || "new") === s.id ? "80" : "30"}`, background: (selected.pipeline_stage || "new") === s.id ? s.bg : "transparent", color: s.color, fontSize: fontSize.label, fontWeight: (selected.pipeline_stage || "new") === s.id ? 700 : 400, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Top issues */}
            {selected.top_issues?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: fontSize.label, fontWeight: 700, color: colors.textSecondary, marginBottom: 8 }}>TOP ISSUES</div>
                {selected.top_issues.slice(0, 5).map((issue, i) => (
                  <div key={i} style={{ fontSize: fontSize.label, color: colors.textSecondary, marginBottom: 5, display: "flex", gap: 6 }}>
                    <span style={{ color: colors.statusFail, flexShrink: 0 }}>→</span>{issue.replace(/^\[\d+\]\s*/, "")}
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: fontSize.label, fontWeight: 700, color: colors.textSecondary, marginBottom: 6 }}>NOTES</div>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes about this prospect..."
                style={{ width: "100%", height: 90, background: colors.void, border: `1px solid ${colors.border}`, borderRadius: 6, color: colors.textPrimary, fontSize: fontSize.label, padding: 10, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
              <button onClick={() => saveNotes(selected)} disabled={saving} style={{ marginTop: 6, padding: "8px 14px", background: "transparent", border: `1px solid ${colors.border}`, borderRadius: 5, color: colors.textSecondary, fontSize: fontSize.label, cursor: "pointer" }}>
                {saving ? "Saving..." : "Save Notes"}
              </button>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <a href={`/report/${selected.id}`} target="_blank" style={{ flex: 1, padding: 10, background: "transparent", border: `1px solid ${colors.border}`, borderRadius: 6, color: colors.textSecondary, fontSize: fontSize.label, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
                View Report →
              </a>
              <a href={`mailto:${selected.email}`} style={{ flex: 1, padding: 10, background: colors.signal, border: "none", borderRadius: 6, color: colors.void, fontSize: fontSize.label, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                Email Lead →
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
