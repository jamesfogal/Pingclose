"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface ImageDetail {
  url: string; format: string; sizeKb: number;
  estimatedWebPSavingKb: number; hasAltText: boolean;
}
interface VideoDetail {
  url: string; format: string; isAutoPlay: boolean;
  hasPoster: boolean; isLazyLoaded: boolean; isEmbed: boolean; embedType: string;
}
interface Audit {
  id: string; url: string; created_at: string;
  mobile_score: number; desktop_score: number;
  ttfb: number; lcp: number; fcp: number; cls: number; inp: number;
  total_page_size: number; total_requests: number; passes_one_second: boolean;
  pagespeed_duration_ms?: number; pagespeed_status?: string;
  cms: string; hosting: string; cdn: string; http_version: string;
  images_lazy_loaded: boolean; images_webp: boolean;
  largest_image_kb: number; render_blocking_scripts: number;
  top_issues: string[]; top_fixes: string[];
  full_report?: {
    sitemap?: {
      pageCount: number; landingPageCount: number; cityPageCount: number;
      eventPageCount: number; archivePageCount: number; blogPostCount: number;
      standardPageCount: number; landingPageUrls: string[]; cityPageUrls: string[];
      blogPostUrls: string[]; hasSitemapIndex: boolean; hasImageSitemap: boolean; imageCount: number;
    };
    contentQuality?: {
      pagesSampled: number; avgWordCount: number; avgInternalLinks: number;
      recommendedLinksPerPost: number; qaPageCount: number;
    };
    lawFaq?: {
      isLawFirm: boolean; qaContentCount: number; faqSchemaCount: number;
      visibleFaqSchemaCount: number; hiddenFaqSchemaCount: number;
      properUseCount: number; missedOpportunityCount: number;
    };
    lawyerSchema?: {
      isLawFirm: boolean; opportunityCount: number; usedCount: number; pagesChecked: number;
    };
    schemaOpportunities?: {
      breakdown: { type: string; opportunities: number; used: number; missed: number }[];
      totalOpportunities: number; totalUsed: number; totalMissed: number;
    };
    speed?: {
      mobileDesktopGap: number; gapExplanation: string; tbt: number;
      totalImages: number; webpImages: number; nonWebpImages: number;
      nonWebpImageList: ImageDetail[]; estimatedWebPSavingKb: number;
      imagesMissingAltText: number; totalVideos: number; videoDetails: VideoDetail[];
      hasAutoPlayVideo: boolean; hasAboveFoldEmbed: boolean;
      renderBlockingDetails: Array<{ url: string; savingsMs: number }>;
      unusedJsKb: number; unusedCssKb: number; noBrowserCaching: boolean;
      hasFontDisplayIssue: boolean; hasGTMBloat: boolean;
      hasRocketLoaderConflict: boolean; renderBlockingScripts: number;
    };
    tech?: {
      hostingVerdict: string; hostingVerdictLabel: string; hostingVerdictMessage: string;
      pageBuilder: string; ecommerce: string; hasTitle: boolean; titleTag: string;
      titleLength: number; hasMetaDescription: boolean; metaDescriptionLength: number;
      hasH1: boolean; h1Text: string; multipleH1s: boolean; hasCanonical: boolean;
      hasRobotsTxt: boolean; hasSitemap: boolean; isHttps: boolean; primaryKeyword: string;
      hasFAQSchema: boolean; hasPricingSchema: boolean; hasLocalBusinessSchema: boolean;
      hasReviewSchema: boolean; hasGA4: boolean; hasGTM: boolean;
      hasFacebookPixel: boolean; hasTikTokPixel: boolean; hasCallTracking: boolean;
      imagesWithoutAlt: string[]; wordpressPluginIssues: string[];
    };
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function metricColor(ms: number, type: "ttfb" | "fcp" | "lcp") {
  if (type === "ttfb") return ms <= 800  ? "#10D9A0" : ms <= 1800 ? "#FBBF24" : "#F87171";
  if (type === "fcp")  return ms <= 1800 ? "#10D9A0" : ms <= 3000 ? "#FBBF24" : "#F87171";
  return ms < 1000 ? "#10D9A0" : ms <= 2500 ? "#FBBF24" : "#F87171";
}
function scoreColor(n: number) { return n >= 90 ? "#10D9A0" : n >= 50 ? "#FBBF24" : "#F87171"; }
function scoreLabel(n: number) { return n >= 90 ? "Fast" : n >= 50 ? "Needs Work" : "Slow"; }

function Metric({ label, value, unit, good, na }: { label: string; value: string | number; unit?: string; good: boolean; na?: boolean }) {
  return (
    <div style={{ background: "#0D1528", border: "1px solid #1E3050", borderRadius: 10, padding: "16px 18px" }}>
      <div style={{ fontSize: 16, color: "#64748B", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: na ? "#475569" : good ? "#10D9A0" : "#F87171" }}>
        {na ? <span style={{ fontSize: 16 }}>No data</span> : <>{value}{unit && <span style={{ fontSize: 16, color: "#64748B", marginLeft: 3 }}>{unit}</span>}</>}
      </div>
    </div>
  );
}

function CheckRow({ label, pass, detail, index = 0 }: { label: string; pass: boolean; detail?: string; index?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12, animation: `rowIn 280ms cubic-bezier(0.23,1,0.32,1) ${index * 35}ms both` }}>
      <span style={{ color: pass ? "#10D9A0" : "#F87171", fontSize: 18, flexShrink: 0, fontWeight: 700, marginTop: 1 }}>{pass ? "✓" : "✗"}</span>
      <div>
        <span style={{ fontSize: 17, color: pass ? "#CBD5E1" : "#F1F5F9" }}>{label}</span>
        {detail && <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4, lineHeight: 1.5 }}>{detail}</div>}
      </div>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "48px 0 24px" }}>
      <span style={{ fontSize: 16, fontWeight: 700, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "#1A2540" }} />
    </div>
  );
}

function Card({ children, variant = "default", style: extra }: { children: React.ReactNode; variant?: "default" | "red" | "green" | "yellow"; style?: React.CSSProperties }) {
  const v = {
    default: { bg: "#0D1528",    border: "#1E3050" },
    red:     { bg: "#F8717108",  border: "#F8717135" },
    green:   { bg: "#10D9A008",  border: "#10D9A035" },
    yellow:  { bg: "#FBBF2408",  border: "#FBBF2435" },
  }[variant];
  return (
    <div style={{ background: v.bg, border: `1px solid ${v.border}`, borderRadius: 12, padding: 24, marginBottom: 16, ...extra }}>
      {children}
    </div>
  );
}

function scoreH1Content(h1Text: string, titleTag: string, primaryKeyword: string): { pass: boolean; detail: string } {
  const trimmed = h1Text.trim();
  const lower   = trimmed.toLowerCase();
  const words   = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 4) return { pass: false, detail: `Your H1 is only ${words.length} word${words.length === 1 ? "" : "s"} long. It is not targeting any search term. This is costing you rankings every single day.` };
  const genericPatterns = [/^home$/i, /^welcome/i, /^about(\s+us)?$/i, /^(our )?services?$/i, /^contact(\s+us)?$/i, /^(get a )?(free )?(quote|estimate|consultation)$/i, /^(what we do)$/i, /^(who we are)$/i];
  if (genericPatterns.some(re => re.test(lower))) return { pass: false, detail: `Your H1 tag is a placeholder, not a keyword. It is not targeting any search term that a customer would actually type into Google.` };
  const hasLocation = /\b(st\.?\s*louis|springfield|kansas city|columbia|jefferson city|chicago|peoria|rockford|aurora|naperville|joliet|\bmo\b|\bil\b|missouri|illinois|texas|california|florida|ohio|georgia|colorado|tennessee|nevada|arizona|virginia|washington|oregon|minnesota|wisconsin|indiana|massachusetts|michigan|pennsylvania|new york|north carolina|south carolina|kentucky|alabama|oklahoma|louisiana|connecticut|iowa|arkansas|kansas|utah|nebraska|new mexico|idaho|montana|wyoming|delaware|vermont|rhode island|hawaii|alaska|atlanta|dallas|houston|phoenix|denver|seattle|portland|boston|miami|orlando|tampa|nashville|charlotte|raleigh|richmond|baltimore|philadelphia|detroit|minneapolis|milwaukee|cincinnati|cleveland|pittsburgh|indianapolis|louisville|memphis|new orleans|oklahoma city|tulsa|albuquerque|las vegas|sacramento|san diego|san jose|san francisco|los angeles)\b/i.test(trimmed);
  if (!hasLocation) return { pass: false, detail: `Your H1 tag has no city or region in it. Google cannot tell where you serve customers. Without a location signal, you will not rank for local searches.` };
  if (primaryKeyword) {
    const kw = primaryKeyword.toLowerCase().split(/\s+/);
    if (kw.filter(k => lower.includes(k)).length === 0) return { pass: false, detail: `Your H1 has a location but is missing the service keyword customers actually search for. Google does not know what you do.` };
  }
  return { pass: true, detail: "Contains a service keyword and location signal." };
}

function LoadTimeHero({ ttfb, fcp, lcp }: { ttfb: number; fcp: number; lcp: number }) {
  const lcpSec   = (lcp / 1000).toFixed(1);
  const fcpSec   = (fcp / 1000).toFixed(1);
  const lcpColor = metricColor(lcp,  "lcp");
  const fcpColor = metricColor(fcp,  "fcp");
  const ttfbColor= metricColor(ttfb, "ttfb");
  const ttfbPct  = lcp > 0 ? Math.min((ttfb / lcp) * 100, 98) : 5;
  const fcpPct   = lcp > 0 ? Math.min((fcp  / lcp) * 100, 98) : 50;

  return (
    <div style={{ marginBottom: 16, animation: "heroIn 500ms cubic-bezier(0.23,1,0.32,1) both" }}>
      <div style={{ textAlign: "center", padding: "44px 24px 36px", background: "#0D1528", border: "1px solid #1E3050", borderRadius: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#64748B", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>Your site took</div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4, marginBottom: 16 }}>
          {lcp > 5000 && <span style={{ fontSize: "clamp(40px,8vw,60px)", marginRight: 4, lineHeight: 1 }}>🔥</span>}
          <span style={{ fontSize: "clamp(72px,14vw,112px)", fontWeight: 900, color: lcpColor, letterSpacing: "-4px", lineHeight: 1, animation: "countIn 600ms cubic-bezier(0.23,1,0.32,1) 100ms both" }}>{lcpSec}</span>
          <span style={{ fontSize: "clamp(32px,6vw,52px)", fontWeight: 700, color: lcpColor, marginBottom: 8, opacity: 0.8 }}>s</span>
          {lcp > 5000 && <span style={{ fontSize: "clamp(40px,8vw,60px)", marginLeft: 4, lineHeight: 1 }}>🔥</span>}
        </div>
        <div style={{ fontSize: 18, fontWeight: 500, color: "#64748B" }}>to load the main content</div>
        <div style={{ marginTop: 36, padding: "0 8px" }}>
          <div style={{ position: "relative", height: 10, background: "#1E3050", borderRadius: 5 }}>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${ttfbColor} 0%, ${fcpColor} ${fcpPct}%, ${lcpColor} 100%)`, borderRadius: 5, opacity: 0.85 }} />
            <div style={{ position: "absolute", left: `${ttfbPct}%`, top: "50%", transform: "translate(-50%,-50%)", zIndex: 2 }}>
              <div style={{ width: 3, height: 24, background: "#fff", borderRadius: 2, opacity: 0.9 }} />
            </div>
            <div style={{ position: "absolute", left: `${fcpPct}%`, top: "50%", transform: "translate(-50%,-50%)", zIndex: 2 }}>
              <div style={{ width: 3, height: 24, background: "#fff", borderRadius: 2, opacity: 0.9 }} />
            </div>
            <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, borderRadius: "50%", background: lcpColor, border: "3px solid #0D1528", zIndex: 2 }} />
          </div>
          <div style={{ position: "relative", height: 48, marginTop: 8 }}>
            <div style={{ position: "absolute", left: `${ttfbPct}%`, transform: "translateX(-50%)", textAlign: "center", minWidth: 80 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: ttfbColor }}>{ttfb}ms</div>
              <div style={{ fontSize: 16, color: "#64748B", fontWeight: 600, letterSpacing: "0.06em" }}>SERVER</div>
            </div>
            <div style={{ position: "absolute", left: `${fcpPct}%`, transform: "translateX(-50%)", textAlign: "center", minWidth: 80 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: fcpColor }}>{fcpSec}s</div>
              <div style={{ fontSize: 16, color: "#64748B", fontWeight: 600, letterSpacing: "0.06em" }}>FIRST PAINT</div>
            </div>
            <div style={{ position: "absolute", right: 0, transform: "translateX(0%)", textAlign: "right", minWidth: 80 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: lcpColor }}>{lcpSec}s</div>
              <div style={{ fontSize: 16, color: "#64748B", fontWeight: 600, letterSpacing: "0.06em" }}>PAGE LOADED</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10 }}>
        {[
          { label: "Server Response", sub: "TTFB", value: `${ttfb}ms`,   color: ttfbColor, verdict: ttfb <= 800  ? "Fast" : ttfb <= 1800 ? "Slow" : "Very Slow" },
          { label: "First Content",   sub: "FCP",  value: `${fcpSec}s`,  color: fcpColor,  verdict: fcp  <= 1800 ? "Fast" : fcp  <= 3000 ? "Slow" : "Very Slow" },
          { label: "Page Loaded",     sub: "LCP",  value: `${lcpSec}s`,  color: lcpColor,  verdict: lcp  < 1000  ? "Fast" : lcp  <= 2500 ? "Slow" : "Very Slow" },
        ].map(({ label, sub, value, color, verdict }) => (
          <div key={sub} style={{ background: "#0D1528", border: `1px solid ${color}40`, borderRadius: 10, padding: "16px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#64748B", letterSpacing: "0.06em", textTransform: "uppercase" }}>{sub}</div>
            <div style={{ fontSize: 16, color: "#475569", marginTop: 4 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color, marginTop: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>{verdict}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function playDone() {
  try {
    new Audio("/sounds/ping.mp3").play();
    setTimeout(() => { try { new Audio("/sounds/ping.mp3").play(); } catch { /* ignore */ } }, 220);
  } catch { /* ignore */ }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const params  = useParams();
  const [audit, setAudit]   = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/report?id=${params.id}`)
      .then(r => r.json())
      .then(data => { setAudit(data); setLoading(false); playDone(); })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "#0B0E16", display: "flex", alignItems: "center", justifyContent: "center", color: "#CBD5E1", fontFamily: "system-ui, sans-serif", fontSize: 18 }}>
      <span style={{ animation: "pulse 1.8s ease-in-out infinite" }}>Loading your report…</span>
    </main>
  );
  if (!audit) return (
    <main style={{ minHeight: "100vh", background: "#0B0E16", display: "flex", alignItems: "center", justifyContent: "center", color: "#CBD5E1", fontFamily: "system-ui, sans-serif", fontSize: 18 }}>
      Report not found. <a href="/" style={{ color: "#10D9A0", marginLeft: 8 }}>Run a new audit →</a>
    </main>
  );

  const hostname     = (() => { try { return new URL(audit.url).hostname; } catch { return audit.url; } })();
  const speed        = audit.full_report?.speed;
  const tech         = audit.full_report?.tech;
  const speedTier    = audit.lcp > 0 && audit.lcp < 1000 ? "superstar" : audit.lcp > 0 && audit.lcp <= 2500 ? "pass" : "fail";
  const verdictColor = speedTier === "superstar" ? "#10D9A0" : speedTier === "pass" ? "#FBBF24" : "#F87171";

  const hostingVerdictColor = () => {
    switch (tech?.hostingVerdict) {
      case "dead-zone":     return "#F87171";
      case "speed-limiter": return "#FBBF24";
      case "acceptable":    return "#FCD34D";
      case "race-ready":    return "#10D9A0";
      default:              return "#64748B";
    }
  };

  return (
    <main className="report-shell" style={{ minHeight: "100vh", background: "#0B0E16", color: "#F1F5F9", fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 16 }}>

      {/* ── TOP BAR ──────────────────────────────────────────────────────────── */}
      <header style={{ borderBottom: "1px solid #1A2540", background: "#0B0E16", position: "sticky", top: 0, zIndex: 10, backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.5px" }}>
              <span style={{ color: "#10D9A0" }}>Ping</span><span style={{ color: "#F1F5F9" }}>Close</span>
            </span>
          </a>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#F1F5F9" }}>{hostname}</div>
            <div style={{ fontSize: 16, color: "#475569" }}>
              {new Date(audit.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
          </div>
        </div>
      </header>

      {/* ── VERDICT HERO BAND ────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(180deg, ${verdictColor}14 0%, transparent 100%)`,
        borderBottom: `1px solid ${verdictColor}20`,
        padding: "56px 24px 48px",
      }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${verdictColor}18`, border: `1px solid ${verdictColor}40`, borderRadius: 6, padding: "4px 12px", marginBottom: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: verdictColor, display: "inline-block" }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: verdictColor, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {speedTier === "superstar" ? "⭐ Under 1 Second — The Gold Standard" : speedTier === "pass" ? "Passes Google's 2.5-Second Test" : "Fails Google's 2.5-Second Test"}
            </span>
          </div>
          <div style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 900, color: "#F1F5F9", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 16 }}>
            {speedTier === "superstar"
              ? <>Your site hits the<br /><span style={{ color: "#10D9A0" }}>1-second gold standard.</span></>
              : speedTier === "pass"
              ? <>Your site clears<br /><span style={{ color: "#FBBF24" }}>Google&apos;s first hurdle.</span></>
              : <>Your site is failing<br /><span style={{ color: "#F87171" }}>Google&apos;s first hurdle.</span></>
            }
          </div>
          <div style={{ fontSize: 18, color: "#64748B", maxWidth: 520, lineHeight: 1.7 }}>
            {speedTier === "superstar"
              ? "Sites that load in 1 second see conversion rates up to 3–5× higher than slow sites. This report shows what else needs fixing to stay there."
              : speedTier === "pass"
              ? "You pass Google's 2.5-second bar — but 1 second is the gold standard, and bounce probability jumps 32% as load time goes from 1 to 3 seconds. Here's what's holding you back."
              : "53% of mobile visitors abandon a page that takes over 3 seconds — and competitors who pass this test outrank you before your page even loads."}
          </div>
          <div style={{ fontSize: 13, color: "#475569", marginTop: 14 }}>
            {speedTier === "superstar"
              ? <>Sources: <a href="https://www.thinkwithgoogle.com/marketing-strategies/app-and-mobile/mobile-page-speed-new-industry-benchmarks/" target="_blank" rel="noopener" style={{ color: "#475569" }}>Google</a> · <a href="https://www.portent.com/blog/analytics/research-site-speed-hurting-everyones-revenue.htm" target="_blank" rel="noopener" style={{ color: "#475569" }}>Portent</a></>
              : <>Source: <a href="https://www.thinkwithgoogle.com/marketing-strategies/app-and-mobile/mobile-page-speed-new-industry-benchmarks/" target="_blank" rel="noopener" style={{ color: "#475569" }}>Google research</a></>}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Load time hero + timeline */}
        {audit.lcp > 0 && <LoadTimeHero ttfb={audit.ttfb} fcp={audit.fcp} lcp={audit.lcp} />}

        {/* ── PERFORMANCE SCORES ───────────────────────────────────────────── */}
        <Divider label="Performance Scores" />

        {/* Mobile / Desktop score pair */}
        {(audit.mobile_score > 0 || audit.desktop_score > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            {[
              { label: "Mobile",  score: audit.mobile_score },
              { label: "Desktop", score: audit.desktop_score },
            ].map(({ label, score }) => (
              <div key={label} style={{ background: "#0D1528", border: `1px solid ${scoreColor(score)}30`, borderRadius: 14, padding: "32px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#475569", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>{label}</div>
                <div style={{ fontSize: "clamp(56px,10vw,84px)", fontWeight: 900, color: scoreColor(score), lineHeight: 1, letterSpacing: "-3px", animation: "countIn 600ms cubic-bezier(0.23,1,0.32,1) both" }}>{score}</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: scoreColor(score), marginTop: 10, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.8 }}>{scoreLabel(score)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Vitals grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 12 }}>
          <Metric label="TTFB"      value={audit.ttfb}                           unit="ms" good={audit.ttfb <= 6} />
          <Metric label="LCP"       value={(audit.lcp / 1000).toFixed(1)}        unit="s"  good={audit.lcp <= 99} />
          <Metric label="FCP"       value={(audit.fcp / 1000).toFixed(1)}        unit="s"  good={audit.fcp < 30} />
          <Metric label="CLS"       value={audit.cls}                                       good={audit.cls <= 0} />
          {speed && <Metric label="TBT" value={speed.tbt}                        unit="ms" good={speed.tbt < 30} />}
          <Metric label="Page Size" value={audit.total_page_size}                unit="KB" good={audit.total_page_size < 1500} />
          <Metric label="Requests"  value={audit.total_requests}                            good={audit.total_requests < 50} />
          {audit.pagespeed_duration_ms != null && audit.pagespeed_status === 'ok' && (
            <Metric label="PS API" value={(audit.pagespeed_duration_ms / 1000).toFixed(1)} unit="s" good={audit.pagespeed_duration_ms < 30000} />
          )}
        </div>

        {/* 1-second badge */}
        <div style={{ padding: "14px 20px", background: `${verdictColor}10`, border: `1px solid ${verdictColor}30`, borderRadius: 10, fontSize: 17, fontWeight: 600, color: verdictColor, marginBottom: 12 }}>
          {speedTier === "superstar" ? "⭐ Under 1 second — the gold standard" : speedTier === "pass" ? "✓ Passes Google's 2.5-second test — but not the 1-second gold standard" : "✗ Fails Google's 2.5-second speed test"}
        </div>

        {/* Mobile/Desktop gap */}
        {speed && speed.mobileDesktopGap >= 10 && (
          <Card variant="yellow">
            <div style={{ fontSize: 18, fontWeight: 700, color: "#FBBF24", marginBottom: 8 }}>⚠ Mobile vs Desktop Gap — {speed.mobileDesktopGap} Points</div>
            <div style={{ fontSize: 17, color: "#F1F5F9", lineHeight: 1.7 }}>{speed.gapExplanation}</div>
          </Card>
        )}

        {/* ── WHAT'S SLOWING YOU DOWN ───────────────────────────────────────── */}
        {speed && (speed.renderBlockingScripts > 0 || speed.unusedJsKb > 0 || speed.unusedCssKb > 0 || speed.noBrowserCaching || speed.hasFontDisplayIssue || speed.hasRocketLoaderConflict) && (
          <>
            <Divider label="What's Slowing You Down" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {speed.renderBlockingScripts > 0 && (
                <Card variant="red">
                  <div style={{ fontSize: 17, color: "#F87171", fontWeight: 700, marginBottom: 6 }}>🚫 {speed.renderBlockingScripts} Render-Blocking Scripts</div>
                  <div style={{ fontSize: 16, color: "#CBD5E1" }}>These scripts freeze your page before any content loads.</div>
                  {speed.renderBlockingDetails.slice(0, 3).map((r, i) => (
                    <div key={i} style={{ fontSize: 16, color: "#64748B", marginTop: 4, fontFamily: "monospace" }}>→ {r.url.split("/").pop()?.substring(0, 60)} ({r.savingsMs}ms)</div>
                  ))}
                </Card>
              )}
              {speed.unusedJsKb > 0 && (
                <Card variant="red">
                  <div style={{ fontSize: 17, color: "#F87171", fontWeight: 700, marginBottom: 6 }}>🗑 {speed.unusedJsKb}KB Unused JavaScript</div>
                  <div style={{ fontSize: 16, color: "#CBD5E1" }}>JavaScript your visitors download but never use. Pure waste on every page load.</div>
                </Card>
              )}
              {speed.unusedCssKb > 0 && (
                <Card variant="red">
                  <div style={{ fontSize: 17, color: "#F87171", fontWeight: 700, marginBottom: 6 }}>🗑 {speed.unusedCssKb}KB Unused CSS</div>
                  <div style={{ fontSize: 16, color: "#CBD5E1" }}>Style rules loading on every visit that are never applied to your page.</div>
                </Card>
              )}
              {speed.noBrowserCaching && (
                <Card variant="yellow">
                  <div style={{ fontSize: 17, color: "#FBBF24", fontWeight: 700, marginBottom: 6 }}>🔄 No Browser Caching</div>
                  <div style={{ fontSize: 16, color: "#CBD5E1" }}>Repeat visitors re-download the same files every single visit instead of loading from cache.</div>
                </Card>
              )}
              {speed.hasFontDisplayIssue && (
                <Card variant="yellow">
                  <div style={{ fontSize: 17, color: "#FBBF24", fontWeight: 700, marginBottom: 6 }}>🔤 Font Loading Issue</div>
                  <div style={{ fontSize: 16, color: "#CBD5E1" }}>Fonts blocking render — text is invisible to visitors until fonts fully download.</div>
                </Card>
              )}
              {speed.hasRocketLoaderConflict && (
                <Card variant="red">
                  <div style={{ fontSize: 17, color: "#F87171", fontWeight: 700, marginBottom: 6 }}>⚡ Cloudflare Rocket Loader Conflict</div>
                  <div style={{ fontSize: 16, color: "#CBD5E1" }}>Rocket Loader is adding load time instead of reducing it — a common WordPress conflict. Disable it.</div>
                </Card>
              )}
            </div>
          </>
        )}

        {/* ── IMAGE AUDIT ──────────────────────────────────────────────────── */}
        <Divider label="Image Audit" />
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Total Images", value: speed?.totalImages ?? 0,   color: "#F1F5F9" },
              { label: "WebP ✓",       value: speed?.webpImages  ?? 0,   color: "#10D9A0" },
              { label: "Not WebP ✗",   value: speed?.nonWebpImages ?? 0, color: (speed?.nonWebpImages ?? 0) > 0 ? "#F87171" : "#10D9A0" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "#111827", borderRadius: 10, padding: "18px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 900, color }}>{value}</div>
                <div style={{ fontSize: 16, color: "#475569", marginTop: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
              </div>
            ))}
          </div>
          {(speed?.estimatedWebPSavingKb ?? 0) > 0 && (
            <div style={{ background: "#10D9A010", border: "1px solid #10D9A030", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 17, color: "#10D9A0", fontWeight: 600 }}>💡 Converting to WebP would save approximately {speed!.estimatedWebPSavingKb}KB</div>
              <div style={{ fontSize: 16, color: "#CBD5E1", marginTop: 4 }}>WebP images are 25–35% smaller than JPG/PNG with identical visual quality.</div>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <CheckRow label="All images converted to WebP" pass={audit.images_webp} />
            <CheckRow label="Lazy loading enabled on off-screen images" pass={audit.images_lazy_loaded} />
            <CheckRow label={`Largest image: ${audit.largest_image_kb}KB`} pass={audit.largest_image_kb < 200} detail={audit.largest_image_kb >= 200 ? "Images over 200KB significantly slow mobile load times" : undefined} />
            {(speed?.imagesMissingAltText ?? 0) > 0 && (
              <CheckRow label={`${speed!.imagesMissingAltText} images missing alt text`} pass={false} detail="Alt text is required for SEO — Google cannot read images without it" />
            )}
          </div>
          {(speed?.nonWebpImageList?.length ?? 0) > 0 && (
            <div style={{ marginTop: 20, borderTop: "1px solid #1E3050", paddingTop: 16 }}>
              <div style={{ fontSize: 16, color: "#475569", marginBottom: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Images That Need Converting:</div>
              {speed!.nonWebpImageList.slice(0, 8).map((img, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #111827", fontSize: 16 }}>
                  <span style={{ color: "#CBD5E1", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "62%" }}>{img.url.split("/").pop()?.substring(0, 50) || img.url}</span>
                  <span style={{ color: "#F87171", flexShrink: 0, marginLeft: 8 }}>{img.format} · {img.sizeKb}KB{img.estimatedWebPSavingKb > 0 ? ` → save ${img.estimatedWebPSavingKb}KB` : ""}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ── VIDEO AUDIT ──────────────────────────────────────────────────── */}
        {(speed?.totalVideos ?? 0) > 0 && (
          <>
            <Divider label="Video Audit" />
            <Card>
              <CheckRow label={`${speed!.totalVideos} video${speed!.totalVideos > 1 ? "s" : ""} found on page`} pass={true} />
              {speed?.hasAutoPlayVideo && <CheckRow label="Autoplay video detected" pass={false} detail="Autoplay increases mobile data usage and delays page load significantly" />}
              {speed?.hasAboveFoldEmbed && <CheckRow label="Video embed above the fold" pass={false} detail="YouTube/Vimeo iframes block page rendering — use a facade/thumbnail until user clicks play" />}
            </Card>
          </>
        )}

        {/* ── TECH STACK ───────────────────────────────────────────────────── */}
        <Divider label="Tech Stack" />
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {([
              ["CMS / Platform",  audit.cms && audit.cms !== "Custom / Unknown" ? audit.cms : "Custom / No CMS"],
              ["Hosting",         audit.hosting && audit.hosting !== "Unknown" ? audit.hosting : "Identifying…"],
              ["CDN",             audit.cdn && audit.cdn !== "None detected" ? audit.cdn : "No CDN in use"],
              ["HTTP Version",    audit.http_version || "HTTP/1.1"],
              ["Page Builder",    tech?.pageBuilder && tech.pageBuilder !== "None detected" ? tech.pageBuilder : "None"],
              ["E-commerce",      tech?.ecommerce && tech.ecommerce !== "None detected" ? tech.ecommerce : "Not e-commerce"],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} style={{ borderBottom: "1px solid #111827", paddingBottom: 14 }}>
                <div style={{ fontSize: 16, color: "#475569", marginBottom: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: "#F1F5F9" }}>{value}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Hosting verdict */}
        {tech?.hostingVerdictLabel && (
          <Card style={{ border: `1px solid ${hostingVerdictColor()}35`, marginTop: -4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: hostingVerdictColor(), display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: 18, fontWeight: 700, color: hostingVerdictColor() }}>{tech.hostingVerdictLabel}</span>
            </div>
            <div style={{ fontSize: 17, color: "#F1F5F9", lineHeight: 1.7 }}>{tech.hostingVerdictMessage}</div>
          </Card>
        )}

        {/* WordPress issues */}
        {(tech?.wordpressPluginIssues?.length ?? 0) > 0 && (
          <Card variant="red">
            <div style={{ fontSize: 18, fontWeight: 700, color: "#F87171", marginBottom: 14 }}>🔌 WordPress Issues Detected</div>
            {tech!.wordpressPluginIssues.map((issue, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                <span style={{ color: "#F87171", flexShrink: 0, fontSize: 17 }}>→</span>
                <span style={{ fontSize: 17, color: "#F1F5F9", lineHeight: 1.5 }}>{issue}</span>
              </div>
            ))}
          </Card>
        )}

        {/* ── SEO FUNDAMENTALS ─────────────────────────────────────────────── */}
        {tech && (
          <>
            <Divider label="SEO Fundamentals" />
            <Card>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <CheckRow label={tech.hasTitle ? `Title tag (${tech.titleLength} chars): "${tech.titleTag.substring(0, 55)}${tech.titleTag.length > 55 ? "…" : ""}"` : "No title tag found"} pass={tech.hasTitle && tech.titleLength <= 60} detail={tech.titleLength > 60 ? "Google truncates titles at 60 characters" : undefined} />
                <CheckRow label={tech.hasMetaDescription ? `Meta description: ${tech.metaDescriptionLength} characters` : "No meta description"} pass={tech.hasMetaDescription} />
                <CheckRow label={tech.hasH1 ? "H1 Tag Present" : "H1 Tag Missing"} pass={tech.hasH1} detail={!tech.hasH1 ? "Every page needs exactly one H1 — this is the single strongest on-page SEO signal you control." : tech.multipleH1s ? "Multiple H1 tags detected — use only one per page" : undefined} />
                {tech.hasH1 && !tech.multipleH1s && (() => {
                  const result = scoreH1Content(tech.h1Text, tech.titleTag, tech.primaryKeyword);
                  return <CheckRow label={`H1 Content: "${tech.h1Text.substring(0, 50)}${tech.h1Text.length > 50 ? "…" : ""}"`} pass={result.pass} detail={result.pass ? undefined : result.detail} />;
                })()}
                <CheckRow label="Canonical tag"      pass={tech.hasCanonical}  detail={!tech.hasCanonical ? "Missing canonical — risk of duplicate content penalty" : undefined} />
                <CheckRow label="XML Sitemap"        pass={tech.hasSitemap} />
                <CheckRow label="HTTPS / SSL"        pass={tech.isHttps}       detail={!tech.isHttps ? "Google shows security warnings to all visitors on HTTP sites" : undefined} />
              </div>
              {tech.primaryKeyword && (
                <div style={{ marginTop: 20, padding: "12px 16px", background: "#111827", borderRadius: 8 }}>
                  <div style={{ fontSize: 16, color: "#475569", marginBottom: 4, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Primary Keyword Detected</div>
                  <div style={{ fontSize: 17, color: "#10D9A0", fontWeight: 600 }}>{tech.primaryKeyword}</div>
                </div>
              )}
            </Card>
          </>
        )}

        {/* ── SITE STRUCTURE ───────────────────────────────────────────────── */}
        {(() => {
          const sm = audit.full_report?.sitemap;
          if (!sm || sm.pageCount === 0) return null;
          return (
            <>
              <Divider label="Site Structure" />
              <Card>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Total Pages",   value: sm.pageCount.toLocaleString(), color: "#F1F5F9" },
                    { label: "Landing Pages", value: sm.landingPageCount,           color: sm.landingPageCount > 0 ? "#10D9A0" : "#475569" },
                    { label: "City Pages",    value: sm.cityPageCount,              color: sm.cityPageCount > 0 ? "#10D9A0" : "#F87171" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: "#111827", borderRadius: 10, padding: "18px 14px", textAlign: "center" }}>
                      <div style={{ fontSize: 32, fontWeight: 900, color }}>{value}</div>
                      <div style={{ fontSize: 16, color: "#475569", marginTop: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 16 }}>
                  {[
                    ["Standard / nav pages",     sm.standardPageCount],
                    ["Blog / article posts",      sm.blogPostCount],
                    ["Event pages",               sm.eventPageCount],
                    ["Category / tag archives",   sm.archivePageCount],
                  ].map(([label, val]) => (
                    <div key={String(label)} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #111827", fontSize: 16, color: "#CBD5E1" }}>
                      <span>{label}</span><span style={{ fontWeight: 700, color: "#F1F5F9" }}>{val}</span>
                    </div>
                  ))}
                </div>
                <CheckRow label={sm.hasImageSitemap ? `Image Sitemap (${sm.imageCount.toLocaleString()} images tagged)` : "Image Sitemap"} pass={sm.hasImageSitemap} detail={!sm.hasImageSitemap ? "No image sitemap entries — image search is a free, untapped discovery channel." : undefined} />
                {sm.cityPageCount === 0 && (
                  <div style={{ marginTop: 12, background: "#F8717110", border: "1px solid #F8717130", borderRadius: 8, padding: "14px 16px" }}>
                    <div style={{ fontSize: 17, color: "#F87171", fontWeight: 700, marginBottom: 6 }}>❌ No city pages detected</div>
                    <div style={{ fontSize: 16, color: "#CBD5E1", lineHeight: 1.6 }}>City pages targeting specific service areas are one of the highest-ROI pages a local business can build. Each city page ranks independently for "[service] in [city]" searches.</div>
                  </div>
                )}
                {sm.cityPageUrls.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 16, color: "#475569", marginBottom: 8, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>City / Location Pages:</div>
                    {sm.cityPageUrls.slice(0, 8).map((u, i) => {
                      let path = u; try { path = new URL(u).pathname; } catch { /* keep */ }
                      return <div key={i} style={{ fontSize: 16, color: "#CBD5E1", fontFamily: "monospace", padding: "4px 0", borderBottom: "1px solid #111827" }}>{path}</div>;
                    })}
                    {sm.cityPageCount > 8 && <div style={{ fontSize: 16, color: "#475569", marginTop: 6 }}>…and {sm.cityPageCount - 8} more</div>}
                  </div>
                )}
              </Card>
            </>
          );
        })()}

        {/* ── CONTENT QUALITY ──────────────────────────────────────────────── */}
        {(() => {
          const cq = audit.full_report?.contentQuality;
          if (!cq || cq.pagesSampled === 0) return null;
          const isRed    = cq.avgInternalLinks < cq.recommendedLinksPerPost * 0.5;
          const isYellow = !isRed && cq.avgInternalLinks < cq.recommendedLinksPerPost;
          return (
            <>
              <Divider label={`Content Quality — ${cq.pagesSampled} posts sampled`} />
              <Card>
                <div style={{ fontSize: 16, color: "#64748B", marginBottom: 16, lineHeight: 1.6 }}>Internal links spread authority across the site and give Google a path to crawl. Rule of thumb: about 1 internal link per 150 words.</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "Avg Words / Post",   value: cq.avgWordCount.toLocaleString(), color: "#F1F5F9" },
                    { label: "Avg Internal Links", value: cq.avgInternalLinks,              color: isRed ? "#F87171" : isYellow ? "#FBBF24" : "#10D9A0" },
                    { label: "Recommended",        value: cq.recommendedLinksPerPost,       color: "#64748B" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: "#111827", borderRadius: 10, padding: "18px 14px", textAlign: "center" }}>
                      <div style={{ fontSize: 32, fontWeight: 900, color }}>{value}</div>
                      <div style={{ fontSize: 16, color: "#475569", marginTop: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                    </div>
                  ))}
                </div>
                <CheckRow label={`Q&A content found on ${cq.qaPageCount} of ${cq.pagesSampled} sampled posts`} pass={cq.qaPageCount > 0} />
                {(isRed || isYellow) && (
                  <div style={{ marginTop: 12, background: isRed ? "#F8717110" : "#FBBF2410", border: `1px solid ${isRed ? "#F8717130" : "#FBBF2430"}`, borderRadius: 8, padding: "12px 16px" }}>
                    <div style={{ fontSize: 17, color: isRed ? "#F87171" : "#FBBF24", fontWeight: 700, marginBottom: 4 }}>
                      {isRed ? "❌" : "⚠️"} Averaging {cq.avgInternalLinks} internal link{cq.avgInternalLinks === 1 ? "" : "s"} per post — recommended is {cq.recommendedLinksPerPost}
                    </div>
                    <div style={{ fontSize: 16, color: "#CBD5E1", lineHeight: 1.6 }}>Posts with no internal links are dead ends for both readers and Google's crawler.</div>
                  </div>
                )}
              </Card>
            </>
          );
        })()}

        {/* ── SCHEMA ───────────────────────────────────────────────────────── */}
        {(() => {
          const so = audit.full_report?.schemaOpportunities;
          if (!so || so.totalOpportunities === 0) return null;
          return (
            <>
              <Divider label="Schema Opportunities" />
              <Card>
                <div style={{ fontSize: 16, color: "#64748B", marginBottom: 16, lineHeight: 1.6 }}>Every schema type this site is eligible for — LocalBusiness, Review, Pricing, FAQ, and (for law firms) Attorney/LegalService.</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "Opportunities", value: so.totalOpportunities, color: "#F1F5F9" },
                    { label: "Used",          value: so.totalUsed,          color: "#10D9A0" },
                    { label: "Missed",        value: so.totalMissed,        color: so.totalMissed > 0 ? "#F87171" : "#475569" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: "#111827", borderRadius: 10, padding: "18px 14px", textAlign: "center" }}>
                      <div style={{ fontSize: 32, fontWeight: 900, color }}>{value}</div>
                      <div style={{ fontSize: 16, color: "#475569", marginTop: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {so.breakdown.map((b, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < so.breakdown.length - 1 ? "1px solid #111827" : "none" }}>
                      <div style={{ fontSize: 16, color: "#CBD5E1" }}>{b.type}</div>
                      <div style={{ fontSize: 16, color: b.missed > 0 ? "#F87171" : "#10D9A0", fontWeight: 700 }}>{b.used} / {b.opportunities} used</div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          );
        })()}

        {tech && (
          <>
            <Divider label="Schema Markup" />
            <Card>
              <div style={{ fontSize: 16, color: "#64748B", marginBottom: 16, lineHeight: 1.6 }}>Schema markup tells Google exactly what your page contains and unlocks rich results — star ratings, FAQ answers, prices shown directly in search results.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <CheckRow label="LocalBusiness schema"           pass={tech.hasLocalBusinessSchema} detail={!tech.hasLocalBusinessSchema ? "Google has less confidence in your local signals without this" : undefined} />
                <CheckRow label="FAQ page with FAQPage schema"   pass={tech.hasFAQSchema}           detail={!tech.hasFAQSchema ? "Unlocks free FAQ rich results in Google search" : undefined} />
                <CheckRow label="Pricing schema"                 pass={tech.hasPricingSchema}       detail={!tech.hasPricingSchema ? "Can show your prices directly in search results" : undefined} />
                <CheckRow label="Review / Rating schema"         pass={tech.hasReviewSchema} />
                {audit.full_report?.lawyerSchema?.isLawFirm && (
                  <CheckRow label="Attorney / LegalService schema" pass={audit.full_report.lawyerSchema.usedCount >= audit.full_report.lawyerSchema.opportunityCount} detail={audit.full_report.lawyerSchema.usedCount < audit.full_report.lawyerSchema.opportunityCount ? `Found on ${audit.full_report.lawyerSchema.usedCount} of ${audit.full_report.lawyerSchema.opportunityCount} eligible pages` : undefined} />
                )}
              </div>
            </Card>
          </>
        )}

        {/* Law firm FAQ schema */}
        {(() => {
          const lf = audit.full_report?.lawFaq;
          if (!lf || !lf.isLawFirm) return null;
          const missedPct = lf.qaContentCount > 0 ? lf.missedOpportunityCount / lf.qaContentCount : 0;
          const isRed = missedPct > 0.10;
          return (
            <>
              <Divider label="Law Firm Q&A Schema" />
              <Card>
                <div style={{ fontSize: 16, color: "#64748B", marginBottom: 16, lineHeight: 1.6 }}>Law firm sites that answer legal questions should mark each one up with FAQPage/Question schema — free eligibility for Google's FAQ rich results.</div>
                {lf.hiddenFaqSchemaCount > 0 && (
                  <div style={{ background: "#F8717110", border: "1px solid #F8717130", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
                    <div style={{ fontSize: 17, color: "#F87171", fontWeight: 700 }}>❌ {lf.hiddenFaqSchemaCount} question{lf.hiddenFaqSchemaCount === 1 ? "" : "s"} tagged with FAQ schema but not visible on the page</div>
                    <div style={{ fontSize: 16, color: "#CBD5E1", marginTop: 6 }}>Google requires FAQ rich-result content to be visible to visitors. Hidden schema risks suppression — or a manual penalty.</div>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "Properly Tagged", value: lf.properUseCount,        color: lf.properUseCount > 0 ? "#10D9A0" : "#475569" },
                    { label: "Missed",          value: lf.missedOpportunityCount, color: isRed ? "#F87171" : lf.missedOpportunityCount > 0 ? "#FBBF24" : "#475569" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: "#111827", borderRadius: 10, padding: "20px", textAlign: "center" }}>
                      <div style={{ fontSize: 36, fontWeight: 900, color }}>{value}</div>
                      <div style={{ fontSize: 16, color: "#475569", marginTop: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                    </div>
                  ))}
                </div>
                {lf.missedOpportunityCount > 0 && (
                  <div style={{ background: isRed ? "#F8717110" : "#FBBF2410", border: `1px solid ${isRed ? "#F8717130" : "#FBBF2430"}`, borderRadius: 8, padding: "12px 16px" }}>
                    <div style={{ fontSize: 17, color: isRed ? "#F87171" : "#FBBF24", fontWeight: 700, marginBottom: 4 }}>{isRed ? "❌" : "⚠️"} {lf.missedOpportunityCount} question{lf.missedOpportunityCount === 1 ? "" : "s"} answered without FAQ schema ({Math.round(missedPct * 100)}% missed)</div>
                    <div style={{ fontSize: 16, color: "#CBD5E1" }}>Each one is a missed shot at a free rich result. Competitors who tag theirs win that real estate instead.</div>
                  </div>
                )}
              </Card>
            </>
          );
        })()}

        {/* Lawyer schema */}
        {(() => {
          const ls = audit.full_report?.lawyerSchema;
          if (!ls || !ls.isLawFirm) return null;
          const missing = ls.opportunityCount - ls.usedCount;
          return (
            <>
              <Divider label="Lawyer Schema" />
              <Card variant={missing > 0 ? "red" : "default"}>
                <div style={{ fontSize: 16, color: "#64748B", marginBottom: 16, lineHeight: 1.6 }}>Attorney / LegalService schema tells Google this is a law firm — separate from FAQ schema. Every practice-area page plus the homepage is an opportunity.</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "Opportunities", value: ls.opportunityCount, color: "#F1F5F9" },
                    { label: "Used",          value: ls.usedCount,        color: ls.usedCount > 0 ? "#10D9A0" : "#F87171" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: "#111827", borderRadius: 10, padding: "20px", textAlign: "center" }}>
                      <div style={{ fontSize: 36, fontWeight: 900, color }}>{value}</div>
                      <div style={{ fontSize: 16, color: "#475569", marginTop: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                    </div>
                  ))}
                </div>
                {missing > 0 && (
                  <div style={{ background: "#F8717110", border: "1px solid #F8717130", borderRadius: 8, padding: "12px 16px" }}>
                    <div style={{ fontSize: 17, color: "#F87171", fontWeight: 700, marginBottom: 4 }}>❌ Attorney / LegalService schema missing on {missing} of {ls.opportunityCount} eligible page{ls.opportunityCount === 1 ? "" : "s"}</div>
                    <div style={{ fontSize: 16, color: "#CBD5E1" }}>Without this, Google has no structured signal that this is a law firm.</div>
                  </div>
                )}
              </Card>
            </>
          );
        })()}

        {/* ── CONVERSION TRACKING ──────────────────────────────────────────── */}
        {tech && (
          <>
            <Divider label="Conversion Tracking" />
            <Card>
              <div style={{ fontSize: 16, color: "#64748B", marginBottom: 16, lineHeight: 1.6 }}>Without tracking you cannot know which ads are working, which pages are converting, or where visitors drop off. You are making marketing decisions completely blind.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <CheckRow label="Google Analytics 4 (GA4)" pass={tech.hasGA4} />
                <CheckRow label="Google Tag Manager"       pass={tech.hasGTM} />
                <CheckRow label="Facebook / Meta Pixel"    pass={tech.hasFacebookPixel} detail={!tech.hasFacebookPixel ? "Required to track Facebook and Instagram ad conversions" : undefined} />
                <CheckRow label="TikTok Pixel"             pass={tech.hasTikTokPixel} />
                <CheckRow label="Call Tracking"            pass={tech.hasCallTracking} />
              </div>
            </Card>
          </>
        )}

        {/* ── KEYWORD VISIBILITY ───────────────────────────────────────────── */}
        {(() => {
          const keyword  = audit.full_report?.tech?.primaryKeyword;
          const h1       = audit.full_report?.tech?.h1Text;
          const hasSchema= audit.full_report?.tech?.hasLocalBusinessSchema;
          const hasFAQ   = audit.full_report?.tech?.hasFAQSchema;
          const hasPricing=audit.full_report?.tech?.hasPricingSchema;
          if (!keyword && !h1) return null;
          const domain         = (() => { try { return new URL(audit.url).hostname; } catch { return audit.url; } })();
          const googleSearchUrl= `https://www.google.com/search?q=site:${domain}`;
          const rankCheckUrl   = keyword ? `https://www.google.com/search?q=${encodeURIComponent(keyword)}` : null;
          return (
            <>
              <Divider label="Keyword Visibility" />
              <Card>
                {keyword && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 16, color: "#475569", marginBottom: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Primary Keyword Detected</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ fontSize: 17, fontWeight: 600, color: "#F1F5F9", padding: "8px 14px", background: "#111827", border: "1px solid #1E3050", borderRadius: 8 }}>&ldquo;{keyword}&rdquo;</div>
                      {rankCheckUrl && (
                        <a href={rankCheckUrl} target="_blank" rel="noreferrer" style={{ fontSize: 16, color: "#F1F5F9", textDecoration: "none", padding: "8px 14px", border: "1px solid #1E3050", background: "#111827", borderRadius: 8 }}>Check Google Rankings →</a>
                      )}
                      <a href={googleSearchUrl} target="_blank" rel="noreferrer" style={{ fontSize: 16, color: "#F1F5F9", textDecoration: "none", padding: "8px 14px", border: "1px solid #1E3050", background: "#111827", borderRadius: 8 }}>Site: Index Check →</a>
                    </div>
                  </div>
                )}
                {h1 && (() => {
                  const result = scoreH1Content(h1, audit.full_report?.tech?.titleTag ?? "", audit.full_report?.tech?.primaryKeyword ?? "");
                  return (
                    <div style={{ marginBottom: 20, padding: "14px 16px", background: "#111827", borderRadius: 8, borderLeft: `3px solid ${result.pass ? "#10D9A0" : "#F87171"}` }}>
                      <div style={{ fontSize: 16, color: "#475569", marginBottom: 4, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Current H1 Tag</div>
                      <div style={{ fontSize: 17, color: "#F1F5F9", fontStyle: "italic", marginBottom: result.pass ? 6 : 10 }}>&ldquo;{h1}&rdquo;</div>
                      {result.pass
                        ? <div style={{ fontSize: 16, color: "#10D9A0" }}>✓ Contains service keyword and location signal</div>
                        : <div style={{ fontSize: 16, color: "#F87171", lineHeight: 1.6 }}>✗ {result.detail}</div>
                      }
                    </div>
                  );
                })()}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
                  {[
                    { label: "LocalBusiness Schema", value: hasSchema },
                    { label: "FAQ Schema",           value: hasFAQ },
                    { label: "Pricing Schema",       value: hasPricing },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: "12px 14px", background: "#111827", borderRadius: 8, border: `1px solid ${value ? "#10D9A030" : "#F8717120"}` }}>
                      <div style={{ fontSize: 16, color: "#475569", marginBottom: 4, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: value ? "#10D9A0" : "#F87171" }}>{value ? "✓ Detected" : "✗ Missing"}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          );
        })()}

        {/* ── ISSUES ───────────────────────────────────────────────────────── */}
        {audit.top_issues?.length > 0 && (() => {
          const parsed = audit.top_issues.map(raw => {
            const m = raw.match(/^\[(\d+)\]\s(.+)$/);
            return m ? { score: parseInt(m[1]), text: m[2] } : { score: 5, text: raw };
          });
          const iColor  = (s: number) => s >= 9 ? "#F87171" : s >= 7 ? "#FB923C" : s >= 5 ? "#FBBF24" : "#4ADE80";
          const iBg     = (s: number) => s >= 9 ? "#F8717115" : s >= 7 ? "#FB923C15" : s >= 5 ? "#FBBF2415" : "#4ADE8015";
          const iBorder = (s: number) => s >= 9 ? "#F8717135" : s >= 7 ? "#FB923C35" : s >= 5 ? "#FBBF2435" : "#4ADE8035";
          const iLabel  = (s: number) => s >= 9 ? "Critical" : s >= 7 ? "Serious" : s >= 5 ? "Moderate" : "Minor";
          return (
            <>
              <Divider label={`Issues Found — ${parsed.length} Total`} />
              <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
                {[{ label: "Critical", color: "#F87171" }, { label: "Serious", color: "#FB923C" }, { label: "Moderate", color: "#FBBF24" }, { label: "Minor", color: "#4ADE80" }].map(({ label, color }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 16, color: "#64748B", fontWeight: 600 }}>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {parsed.map((issue, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, background: iBg(issue.score), border: `1px solid ${iBorder(issue.score)}`, borderRadius: 10, padding: "14px 16px", animation: `rowIn 280ms cubic-bezier(0.23,1,0.32,1) ${i * 25}ms both` }}>
                    <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 8, background: iColor(issue.score) + "25", border: `2px solid ${iColor(issue.score)}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 17, fontWeight: 900, color: iColor(issue.score), lineHeight: 1 }}>{issue.score}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: iColor(issue.score), letterSpacing: "0.08em", marginBottom: 4, textTransform: "uppercase" }}>{iLabel(issue.score)}</div>
                      <div style={{ fontSize: 17, color: "#F1F5F9", lineHeight: 1.55 }}>{issue.text.replace(/^[🔴🟠🟡🟢]\s/, '')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          );
        })()}

        {/* ── TOP FIXES ────────────────────────────────────────────────────── */}
        {audit.top_fixes?.length > 0 && (
          <>
            <Divider label="Top Fixes to Win the Race" />
            <Card variant="green">
              {audit.top_fixes.map((fix, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <span style={{ color: "#10D9A0", flexShrink: 0, fontSize: 18, fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 17, color: "#F1F5F9", lineHeight: 1.55 }}>{fix}</span>
                </div>
              ))}
            </Card>
          </>
        )}

        {/* ── CLOSING CTA ──────────────────────────────────────────────────── */}
        <Divider label="Next Step" />
        <Card style={{ padding: "40px 36px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: "#F1F5F9", margin: "0 0 20px", letterSpacing: "-1px", lineHeight: 1.15 }}>
            We Find <span style={{ color: "#10D9A0" }}>Broken Websites.</span>
          </h2>
          {speedTier !== "fail" && audit.mobile_score >= 90 ? (
            <>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#10D9A0", lineHeight: 1.5, marginBottom: 10 }}>Your site is fast — but is the rest of the story this good?</div>
              <div style={{ fontSize: 17, color: "#CBD5E1", marginBottom: 32, lineHeight: 1.7 }}>Speed is just the first hurdle. Want to see how your Local SEO, Google Business Profile, citations, and conversion tracking stack up against your competitors?</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9", lineHeight: 1.5, marginBottom: 10 }}>We can have 49 of these problems fixed in 24 hours.</div>
              <div style={{ fontSize: 17, color: "#CBD5E1", marginBottom: 32, lineHeight: 1.7 }}>98% of the changes on this report are done within 48 hours.<br />Citations take longer — but everything else moves fast.<br /><strong style={{ color: "#F1F5F9" }}>Click the link below to get started at LocalSEOAEOPro.com.</strong></div>
            </>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 14 }}>
            <a href="https://localseoaeopro.com" target="_blank" rel="noreferrer"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "28px 24px", background: "#10D9A010", border: "2px solid #10D9A050", borderRadius: 12, textDecoration: "none" }}>
              <span style={{ fontSize: 32 }}>🚀</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#10D9A0", lineHeight: 1.3 }}>Fix These Problems at LocalSEOAEOPro.com →</span>
              <span style={{ fontSize: 17, color: "#CBD5E1", lineHeight: 1.6 }}>PingClose found them. LocalSEOAEOPro fixes them.</span>
            </a>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <a href="tel:+13145172533" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "24px 20px", background: "#10D9A0", borderRadius: 12, textDecoration: "none" }}>
                <span style={{ fontSize: 28 }}>📞</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#0B0E16" }}>Call or Text</span>
                <span style={{ fontSize: 17, color: "#0B0E16", opacity: 0.85, fontWeight: 600 }}>(314) 517-2533</span>
              </a>
              <a href="mailto:jim@pingclose.com?subject=PingClose%20Report%20Follow-Up" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "24px 20px", background: "#1E3050", border: "1px solid #2D4A70", borderRadius: 12, textDecoration: "none" }}>
                <span style={{ fontSize: 28 }}>✉️</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9" }}>Send an Email</span>
                <span style={{ fontSize: 16, color: "#CBD5E1" }}>jim@pingclose.com</span>
              </a>
            </div>
          </div>
        </Card>

        <div style={{ textAlign: "center", marginTop: 28 }}>
          <a href="/" style={{ fontSize: 16, color: "#475569", textDecoration: "none" }}>← Run another audit at PingClose.com</a>
        </div>
      </div>

      <style>{`
        @media (max-width: 480px) { .report-shell { --page-pad: 12px; } }
        @media (prefers-reduced-motion: no-preference) {
          @keyframes heroIn    { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
          @keyframes countIn   { from { opacity: 0; transform: scale(0.9); }       to { opacity: 1; transform: none; } }
          @keyframes rowIn     { from { opacity: 0; transform: translateY(6px); }  to { opacity: 1; transform: none; } }
          @keyframes pulse     { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes heroIn    { from { opacity: 0; } to { opacity: 1; } }
          @keyframes countIn   { from { opacity: 0; } to { opacity: 1; } }
          @keyframes rowIn     { from { opacity: 0; } to { opacity: 1; } }
          @keyframes pulse     { 50% { opacity: 0.6; } }
        }
      `}</style>
    </main>
  );
}
