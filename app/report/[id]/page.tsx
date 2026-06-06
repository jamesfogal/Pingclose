"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Audit {
  id: string;
  url: string;
  created_at: string;
  mobile_score: number;
  desktop_score: number;
  ttfb: number;
  lcp: number;
  fcp: number;
  cls: number;
  inp: number;
  total_page_size: number;
  total_requests: number;
  passes_one_second: boolean;
  cms: string;
  hosting: string;
  cdn: string;
  http_version: string;
  images_lazy_loaded: boolean;
  images_webp: boolean;
  largest_image_kb: number;
  render_blocking_scripts: number;
  top_issues: string[];
  top_fixes: string[];
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? "#10D9A0" : score >= 50 ? "#FBBF24" : "#F87171";
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        border: `4px solid ${color}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 8px",
        background: color + "15"
      }}>
        <span style={{ fontSize: 22, fontWeight: 800, color }}>{score}</span>
      </div>
      <div style={{ fontSize: 11, color: "#64748B" }}>{label}</div>
    </div>
  );
}

function Metric({ label, value, unit, good }: { label: string; value: string | number; unit?: string; good: boolean }) {
  return (
    <div style={{
      background: "#111827", border: "1px solid #1F2937",
      borderRadius: 8, padding: "12px 14px"
    }}>
      <div style={{ fontSize: 10, color: "#64748B", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: good ? "#10D9A0" : "#F87171" }}>
        {value}{unit && <span style={{ fontSize: 12, color: "#64748B", marginLeft: 2 }}>{unit}</span>}
      </div>
    </div>
  );
}

export default function ReportPage() {
  const params = useParams();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/report?id=${params.id}`)
      .then(r => r.json())
      .then(data => { setAudit(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "#0B0E16", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontFamily: "system-ui, sans-serif" }}>
      Loading your report...
    </main>
  );

  if (!audit) return (
    <main style={{ minHeight: "100vh", background: "#0B0E16", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontFamily: "system-ui, sans-serif" }}>
      Report not found. <a href="/" style={{ color: "#10D9A0", marginLeft: 8 }}>Run a new audit →</a>
    </main>
  );

  const hostname = (() => { try { return new URL(audit.url).hostname; } catch { return audit.url; } })();
  const verdictColor = audit.passes_one_second ? "#10D9A0" : "#F87171";
  const verdictText = audit.passes_one_second ? "✅ Passes the 1-second test" : "❌ Failing Google's first hurdle";

  return (
    <main style={{ minHeight: "100vh", background: "#0B0E16", color: "#F1F5F9", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#10D9A0", marginBottom: 8 }}>
            Ping<span style={{ color: "#F1F5F9" }}>Close</span>
          </div>
          <div style={{ fontSize: 13, color: "#475569" }}>Speed & SEO Audit Report</div>
          <div style={{ fontSize: 15, color: "#94A3B8", marginTop: 8, fontWeight: 600 }}>{hostname}</div>
          <div style={{ fontSize: 11, color: "#374151", marginTop: 4 }}>
            {new Date(audit.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {/* Verdict Banner */}
        <div style={{
          background: audit.passes_one_second ? "#10D9A015" : "#F8717115",
          border: `1px solid ${verdictColor}40`,
          borderRadius: 12, padding: "20px 24px",
          textAlign: "center", marginBottom: 24
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: verdictColor }}>{verdictText}</div>
          <div style={{ fontSize: 13, color: "#64748B", marginTop: 6 }}>
            {audit.passes_one_second
              ? "Your site is clearing Google's first hurdle. Now let's make sure you win the race."
              : "Your site is failing Google's most basic performance requirement. Your competitors are passing you on the first step."}
          </div>
        </div>

        {/* Score rings */}
        <div style={{
          background: "#111827", border: "1px solid #1F2937",
          borderRadius: 12, padding: "24px",
          display: "flex", justifyContent: "center", gap: 40,
          marginBottom: 24
        }}>
          <ScoreRing score={audit.mobile_score} label="Mobile Score" />
          <ScoreRing score={audit.desktop_score} label="Desktop Score" />
        </div>

        {/* Core Web Vitals */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", marginBottom: 12 }}>
            CORE WEB VITALS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
            <Metric label="TTFB" value={audit.ttfb} unit="ms" good={audit.ttfb < 600} />
            <Metric label="LCP" value={(audit.lcp / 1000).toFixed(1)} unit="s" good={audit.lcp < 2500} />
            <Metric label="FCP" value={(audit.fcp / 1000).toFixed(1)} unit="s" good={audit.fcp < 1800} />
            <Metric label="CLS" value={audit.cls} good={audit.cls < 0.1} />
            <Metric label="Page Size" value={audit.total_page_size} unit="KB" good={audit.total_page_size < 1500} />
            <Metric label="Requests" value={audit.total_requests} good={audit.total_requests < 50} />
          </div>
        </div>

        {/* Tech Stack */}
        <div style={{
          background: "#111827", border: "1px solid #1F2937",
          borderRadius: 12, padding: "20px 24px", marginBottom: 24
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", marginBottom: 14 }}>
            TECH STACK IDENTIFIED
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["CMS / Platform", audit.cms],
              ["Hosting Provider", audit.hosting],
              ["CDN", audit.cdn],
              ["HTTP Version", audit.http_version],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: "#475569", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9" }}>{value || "Unknown"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Image Analysis */}
        <div style={{
          background: "#111827", border: "1px solid #1F2937",
          borderRadius: 12, padding: "20px 24px", marginBottom: 24
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", marginBottom: 14 }}>
            IMAGE ANALYSIS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Images converted to WebP", pass: audit.images_webp },
              { label: "Lazy loading enabled", pass: audit.images_lazy_loaded },
              { label: `Render-blocking scripts: ${audit.render_blocking_scripts}`, pass: audit.render_blocking_scripts === 0 },
              { label: `Largest image: ${audit.largest_image_kb}KB`, pass: audit.largest_image_kb < 200 },
            ].map(({ label, pass }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: pass ? "#10D9A0" : "#F87171", fontSize: 14, flexShrink: 0 }}>
                  {pass ? "✓" : "✗"}
                </span>
                <span style={{ fontSize: 13, color: pass ? "#94A3B8" : "#F1F5F9" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Issues */}
        {audit.top_issues?.length > 0 && (
          <div style={{
            background: "#F8717108", border: "1px solid #F8717130",
            borderRadius: 12, padding: "20px 24px", marginBottom: 24
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#F87171", letterSpacing: "0.08em", marginBottom: 14 }}>
              TOP ISSUES FOUND
            </div>
            {audit.top_issues.map((issue, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <span style={{ color: "#F87171", flexShrink: 0 }}>→</span>
                <span style={{ fontSize: 13, color: "#F1F5F9" }}>{issue}</span>
              </div>
            ))}
          </div>
        )}

        {/* Top Fixes */}
        {audit.top_fixes?.length > 0 && (
          <div style={{
            background: "#10D9A008", border: "1px solid #10D9A030",
            borderRadius: 12, padding: "20px 24px", marginBottom: 32
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#10D9A0", letterSpacing: "0.08em", marginBottom: 14 }}>
              TOP FIXES TO WIN THE RACE
            </div>
            {audit.top_fixes.map((fix, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <span style={{ color: "#10D9A0", flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13, color: "#F1F5F9" }}>{fix}</span>
              </div>
            ))}
          </div>
        )}

        {/* Closing hook */}
        <div style={{
          background: "#0D1528", border: "1px solid #1E3050",
          borderRadius: 12, padding: "28px 24px", textAlign: "center"
        }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: "#F1F5F9", lineHeight: 1.6, marginBottom: 20 }}>
            We know exactly what it takes to get your site under 1 second.<br />
            We&apos;ve done it for dozens of local businesses in St. Louis.
          </div>
          <div style={{ fontSize: 15, color: "#94A3B8", marginBottom: 24 }}>
            Want us to take a look?
          </div>
          <a
            href="tel:+13145551234"
            style={{
              display: "inline-block",
              background: "#10D9A0", color: "#0B0E16",
              fontSize: 15, fontWeight: 700,
              padding: "12px 32px", borderRadius: 8,
              textDecoration: "none", marginBottom: 12
            }}
          >
            📞 Call Jim — (314) 555-1234
          </a>
          <div style={{ fontSize: 12, color: "#475569" }}>
            Jim Fogal · Local SEO & Web Performance · St. Louis, MO
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a href="/" style={{ fontSize: 13, color: "#374151", textDecoration: "none" }}>
            ← Run another audit at PingClose.com
          </a>
        </div>

      </div>
    </main>
  );
}
