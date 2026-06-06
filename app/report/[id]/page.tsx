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
        width: 90, height: 90, borderRadius: "50%",
        border: `5px solid ${color}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 10px",
        background: color + "15"
      }}>
        <span style={{ fontSize: 26, fontWeight: 800, color }}>{score}</span>
      </div>
      <div style={{ fontSize: 16, color: "#94A3B8" }}>{label}</div>
    </div>
  );
}

function Metric({ label, value, unit, good }: { label: string; value: string | number; unit?: string; good: boolean }) {
  return (
    <div style={{
      background: "#0D1528", border: "1px solid #1E3050",
      borderRadius: 8, padding: "14px 16px"
    }}>
      <div style={{ fontSize: 16, color: "#64748B", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: good ? "#10D9A0" : "#F87171" }}>
        {value}{unit && <span style={{ fontSize: 15, color: "#64748B", marginLeft: 3 }}>{unit}</span>}
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
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0B0E16 0%, #0D1528 50%, #0B0E16 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#CBD5E1", fontFamily: "system-ui, sans-serif", fontSize: 18 }}>
      Loading your report...
    </main>
  );

  if (!audit) return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0B0E16 0%, #0D1528 50%, #0B0E16 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#CBD5E1", fontFamily: "system-ui, sans-serif", fontSize: 18 }}>
      Report not found. <a href="/" style={{ color: "#10D9A0", marginLeft: 8 }}>Run a new audit →</a>
    </main>
  );

  const hostname = (() => { try { return new URL(audit.url).hostname; } catch { return audit.url; } })();
  const verdictColor = audit.passes_one_second ? "#10D9A0" : "#F87171";
  const verdictText = audit.passes_one_second ? "✅ Passes the 1-second test" : "❌ Failing Google's first hurdle";

  return (
    <main style={{ minHeight: "100vh", background: "#0B0E16", color: "#F1F5F9", fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 16 }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 60px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#10D9A0", marginBottom: 10, letterSpacing: "-0.5px" }}>
            Ping<span style={{ color: "#F1F5F9" }}>Close</span>
          </div>
          <div style={{ fontSize: 17, color: "#94A3B8" }}>Speed & SEO Audit Report</div>
          <div style={{ fontSize: 20, color: "#F1F5F9", marginTop: 8, fontWeight: 700 }}>{hostname}</div>
          <div style={{ fontSize: 16, color: "#64748B", marginTop: 4 }}>
            {new Date(audit.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {/* Verdict Banner */}
        <div style={{
          background: audit.passes_one_second ? "#10D9A015" : "#F8717115",
          border: `1px solid ${verdictColor}40`,
          borderRadius: 12, padding: "24px",
          textAlign: "center", marginBottom: 24
        }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: verdictColor }}>{verdictText}</div>
          <div style={{ fontSize: 17, color: "#94A3B8", marginTop: 8, lineHeight: 1.6 }}>
            {audit.passes_one_second
              ? "Your site is clearing Google's first hurdle. Now let's make sure you win the race."
              : "Your site is failing Google's most basic performance requirement. Your competitors are passing you on the first step."}
          </div>
        </div>

        {/* Score rings */}
        <div style={{
          background: "#0D1528", border: "1px solid #1E3050",
          borderRadius: 12, padding: "28px",
          display: "flex", justifyContent: "center", gap: 48,
          marginBottom: 24
        }}>
          <ScoreRing score={audit.mobile_score} label="Mobile Score" />
          <ScoreRing score={audit.desktop_score} label="Desktop Score" />
        </div>

        {/* Core Web Vitals */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em", marginBottom: 14 }}>
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
          background: "#0D1528", border: "1px solid #1E3050",
          borderRadius: 12, padding: "24px", marginBottom: 24
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em", marginBottom: 16 }}>
            TECH STACK IDENTIFIED
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              ["CMS / Platform", audit.cms],
              ["Hosting Provider", audit.hosting],
              ["CDN", audit.cdn],
              ["HTTP Version", audit.http_version],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 16, color: "#64748B", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#F1F5F9" }}>{value || "Unknown"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Image Analysis */}
        <div style={{
          background: "#0D1528", border: "1px solid #1E3050",
          borderRadius: 12, padding: "24px", marginBottom: 24
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em", marginBottom: 16 }}>
            IMAGE ANALYSIS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Images converted to WebP", pass: audit.images_webp },
              { label: "Lazy loading enabled", pass: audit.images_lazy_loaded },
              { label: `Render-blocking scripts: ${audit.render_blocking_scripts}`, pass: audit.render_blocking_scripts === 0 },
              { label: `Largest image: ${audit.largest_image_kb}KB`, pass: audit.largest_image_kb < 200 },
            ].map(({ label, pass }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: pass ? "#10D9A0" : "#F87171", fontSize: 18, flexShrink: 0, fontWeight: 700 }}>
                  {pass ? "✓" : "✗"}
                </span>
                <span style={{ fontSize: 17, color: pass ? "#94A3B8" : "#F1F5F9" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Issues */}
        {audit.top_issues?.length > 0 && (
          <div style={{
            background: "#F8717108", border: "1px solid #F8717130",
            borderRadius: 12, padding: "24px", marginBottom: 24
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#F87171", letterSpacing: "0.06em", marginBottom: 16 }}>
              TOP ISSUES FOUND
            </div>
            {audit.top_issues.map((issue, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <span style={{ color: "#F87171", flexShrink: 0, fontSize: 17 }}>→</span>
                <span style={{ fontSize: 17, color: "#F1F5F9", lineHeight: 1.5 }}>{issue}</span>
              </div>
            ))}
          </div>
        )}

        {/* Top Fixes */}
        {audit.top_fixes?.length > 0 && (
          <div style={{
            background: "#10D9A008", border: "1px solid #10D9A030",
            borderRadius: 12, padding: "24px", marginBottom: 32
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#10D9A0", letterSpacing: "0.06em", marginBottom: 16 }}>
              TOP FIXES TO WIN THE RACE
            </div>
            {audit.top_fixes.map((fix, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <span style={{ color: "#10D9A0", flexShrink: 0, fontSize: 17 }}>✓</span>
                <span style={{ fontSize: 17, color: "#F1F5F9", lineHeight: 1.5 }}>{fix}</span>
              </div>
            ))}
          </div>
        )}

        {/* Closing hook */}
        <div style={{
          background: "#0D1528", border: "1px solid #1E3050",
          borderRadius: 12, padding: "32px", textAlign: "center"
        }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#F1F5F9", lineHeight: 1.6, marginBottom: 12 }}>
            We know exactly what it takes to get your site under 1 second.<br />
            We&apos;ve done it for dozens of local businesses in St. Louis.
          </div>
          <div style={{ fontSize: 18, color: "#94A3B8", marginBottom: 28 }}>
            Want us to take a look?
          </div>
          <a
            href="tel:+13145172533"
            style={{
              display: "inline-block",
              background: "#10D9A0", color: "#0B0E16",
              fontSize: 18, fontWeight: 700,
              padding: "14px 36px", borderRadius: 8,
              textDecoration: "none", marginBottom: 14
            }}
          >
            📞 Call Jim — (314) 517-2533
          </a>
          <div style={{ fontSize: 17, color: "#64748B" }}>
            Jim Fogal · Local SEO & Web Performance · St. Louis, MO
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a href="/" style={{ fontSize: 17, color: "#64748B", textDecoration: "none" }}>
            ← Run another audit at PingClose.com
          </a>
        </div>

      </div>
    </main>
  );
}
