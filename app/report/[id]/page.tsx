"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface ImageDetail {
  url: string;
  format: string;
  sizeKb: number;
  estimatedWebPSavingKb: number;
  hasAltText: boolean;
}

interface VideoDetail {
  url: string;
  format: string;
  isAutoPlay: boolean;
  hasPoster: boolean;
  isLazyLoaded: boolean;
  isEmbed: boolean;
  embedType: string;
}

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
  pagespeed_duration_ms?: number;
  pagespeed_status?: string;
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
  full_report?: {
    sitemap?: {
      pageCount: number;
      landingPageCount: number;
      cityPageCount: number;
      eventPageCount: number;
      archivePageCount: number;
      blogPostCount: number;
      standardPageCount: number;
      landingPageUrls: string[];
      cityPageUrls: string[];
      blogPostUrls: string[];
      hasSitemapIndex: boolean;
      hasImageSitemap: boolean;
      imageCount: number;
    };
    contentQuality?: {
      pagesSampled: number;
      avgWordCount: number;
      avgInternalLinks: number;
      recommendedLinksPerPost: number;
      qaPageCount: number;
    };
    lawFaq?: {
      isLawFirm: boolean;
      qaContentCount: number;
      faqSchemaCount: number;
      visibleFaqSchemaCount: number;
      hiddenFaqSchemaCount: number;
      properUseCount: number;
      missedOpportunityCount: number;
    };
    lawyerSchema?: {
      isLawFirm: boolean;
      opportunityCount: number;
      usedCount: number;
      pagesChecked: number;
    };
    schemaOpportunities?: {
      breakdown: { type: string; opportunities: number; used: number; missed: number }[];
      totalOpportunities: number;
      totalUsed: number;
      totalMissed: number;
    };
    speed?: {
      mobileDesktopGap: number;
      gapExplanation: string;
      tbt: number;
      totalImages: number;
      webpImages: number;
      nonWebpImages: number;
      nonWebpImageList: ImageDetail[];
      estimatedWebPSavingKb: number;
      imagesMissingAltText: number;
      totalVideos: number;
      videoDetails: VideoDetail[];
      hasAutoPlayVideo: boolean;
      hasAboveFoldEmbed: boolean;
      renderBlockingDetails: Array<{ url: string; savingsMs: number }>;
      unusedJsKb: number;
      unusedCssKb: number;
      noBrowserCaching: boolean;
      hasFontDisplayIssue: boolean;
      hasGTMBloat: boolean;
      hasRocketLoaderConflict: boolean;
      renderBlockingScripts: number;
    };
    tech?: {
      hostingVerdict: string;
      hostingVerdictLabel: string;
      hostingVerdictMessage: string;
      pageBuilder: string;
      ecommerce: string;
      hasTitle: boolean;
      titleTag: string;
      titleLength: number;
      hasMetaDescription: boolean;
      metaDescriptionLength: number;
      hasH1: boolean;
      h1Text: string;
      multipleH1s: boolean;
      hasCanonical: boolean;
      hasRobotsTxt: boolean;
      hasSitemap: boolean;
      isHttps: boolean;
      primaryKeyword: string;
      hasFAQSchema: boolean;
      hasPricingSchema: boolean;
      hasLocalBusinessSchema: boolean;
      hasReviewSchema: boolean;
      hasGA4: boolean;
      hasGTM: boolean;
      hasFacebookPixel: boolean;
      hasTikTokPixel: boolean;
      hasCallTracking: boolean;
      imagesWithoutAlt: string[];
      wordpressPluginIssues: string[];
    };
  };
}

const DARK_CARD: React.CSSProperties = {
  background: "#0D1528",
  border: "1px solid #1E3050",
  borderRadius: 12,
  padding: "var(--card-pad, 24px)",
  marginBottom: 20,
};

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  color: "#CBD5E1",
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  marginBottom: 16,
};

function metricColor(ms: number, type: "ttfb" | "fcp" | "lcp") {
  if (type === "ttfb") return ms <= 6 ? "#10D9A0" : ms <= 10 ? "#FBBF24" : "#F87171";
  if (type === "fcp")  return ms < 30 ? "#10D9A0" : ms < 40 ? "#FBBF24" : "#F87171";
  return ms <= 99 ? "#10D9A0" : ms < 1000 ? "#FBBF24" : "#F87171";
}

function LoadTimeHero({ ttfb, fcp, lcp }: { ttfb: number; fcp: number; lcp: number }) {
  const lcpSec = (lcp / 1000).toFixed(1);
  const fcpSec = (fcp / 1000).toFixed(1);
  const ttfbMs = ttfb;
  const lcpColor = metricColor(lcp, "lcp");
  const fcpColor = metricColor(fcp, "fcp");
  const ttfbColor = metricColor(ttfb, "ttfb");

  const ttfbPct = lcp > 0 ? Math.min((ttfb / lcp) * 100, 98) : 5;
  const fcpPct  = lcp > 0 ? Math.min((fcp  / lcp) * 100, 98) : 50;

  return (
    <div style={{ marginBottom: 24, animation: "heroIn 500ms cubic-bezier(0.23,1,0.32,1) both" }}>
      {/* Big load time number */}
      <div style={{ textAlign: "center", padding: "40px 24px 32px", background: "#0D1528", border: "1px solid #1E3050", borderRadius: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>
          Your site took
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4, marginBottom: 16 }}>
          {lcp > 5000 && (
            <span style={{ fontSize: "clamp(40px, 8vw, 60px)", marginRight: 4, lineHeight: 1 }} aria-label="Critically slow">🔥</span>
          )}
          <span style={{ fontSize: "clamp(72px, 14vw, 112px)", fontWeight: 900, color: lcpColor, letterSpacing: "-4px", lineHeight: 1, animation: "countIn 600ms cubic-bezier(0.23,1,0.32,1) 100ms both" }}>
            {lcpSec}
          </span>
          <span style={{ fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 700, color: lcpColor, marginBottom: 8, opacity: 0.8 }}>s</span>
          {lcp > 5000 && (
            <span style={{ fontSize: "clamp(40px, 8vw, 60px)", marginLeft: 4, lineHeight: 1 }} aria-label="Critically slow">🔥</span>
          )}
        </div>
        <div style={{ fontSize: 18, fontWeight: 500, color: "#94A3B8" }}>
          to load the main content
        </div>

        {/* Milestone timeline bar */}
        <div style={{ marginTop: 36, padding: "0 8px" }}>
          <div style={{ position: "relative", height: 10, background: "#1E3050", borderRadius: 5 }}>
            {/* Full bar fill — color = LCP verdict */}
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${ttfbColor} 0%, ${fcpColor} ${fcpPct}%, ${lcpColor} 100%)`, borderRadius: 5, opacity: 0.85 }} />

            {/* TTFB marker */}
            <div style={{ position: "absolute", left: `${ttfbPct}%`, top: "50%", transform: "translate(-50%, -50%)", zIndex: 2 }}>
              <div style={{ width: 3, height: 24, background: "#fff", borderRadius: 2, opacity: 0.9 }} />
            </div>

            {/* FCP marker */}
            <div style={{ position: "absolute", left: `${fcpPct}%`, top: "50%", transform: "translate(-50%, -50%)", zIndex: 2 }}>
              <div style={{ width: 3, height: 24, background: "#fff", borderRadius: 2, opacity: 0.9 }} />
            </div>

            {/* LCP end dot */}
            <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, borderRadius: "50%", background: lcpColor, border: "3px solid #0D1528", zIndex: 2 }} />
          </div>

          {/* Timeline labels */}
          <div style={{ position: "relative", height: 48, marginTop: 8 }}>
            {/* TTFB label */}
            <div style={{ position: "absolute", left: `${ttfbPct}%`, transform: "translateX(-50%)", textAlign: "center", minWidth: 80 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: ttfbColor }}>{ttfbMs}ms</div>
              <div style={{ fontSize: 16, color: "#94A3B8", fontWeight: 600, letterSpacing: "0.06em" }}>SERVER</div>
            </div>

            {/* FCP label */}
            <div style={{ position: "absolute", left: `${fcpPct}%`, transform: "translateX(-50%)", textAlign: "center", minWidth: 80 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: fcpColor }}>{fcpSec}s</div>
              <div style={{ fontSize: 16, color: "#94A3B8", fontWeight: 600, letterSpacing: "0.06em" }}>FIRST PAINT</div>
            </div>

            {/* LCP label */}
            <div style={{ position: "absolute", right: 0, transform: "translateX(0%)", textAlign: "right", minWidth: 80 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: lcpColor }}>{lcpSec}s</div>
              <div style={{ fontSize: 16, color: "#94A3B8", fontWeight: 600, letterSpacing: "0.06em" }}>PAGE LOADED</div>
            </div>
          </div>
        </div>
      </div>

      {/* Three milestone pills */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10 }}>
        {[
          { label: "Server Response", sublabel: "TTFB", value: `${ttfbMs}ms`, color: ttfbColor, verdict: ttfb <= 6 ? "Fast" : ttfb <= 10 ? "Slow" : "Very Slow" },
          { label: "First Content", sublabel: "FCP", value: `${fcpSec}s`, color: fcpColor, verdict: fcp < 30 ? "Fast" : fcp < 40 ? "Slow" : "Very Slow" },
          { label: "Page Loaded", sublabel: "LCP", value: `${lcpSec}s`, color: lcpColor, verdict: lcp <= 99 ? "Fast" : lcp < 1000 ? "Slow" : "Very Slow" },
        ].map(({ label, sublabel, value, color, verdict }) => (
          <div key={sublabel} style={{ background: "#0D1528", border: `1px solid ${color}40`, borderRadius: 10, padding: "16px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color, marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase" }}>{sublabel}</div>
            <div style={{ fontSize: 16, color: "#64748B", marginTop: 4 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color, marginTop: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>{verdict}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, unit, good, na }: { label: string; value: string | number; unit?: string; good: boolean; na?: boolean }) {
  return (
    <div style={{ background: "#0D1528", border: "1px solid #1E3050", borderRadius: 8, padding: "14px 16px" }}>
      <div style={{ fontSize: 16, color: "#94A3B8", marginBottom: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: na ? "#475569" : good ? "#10D9A0" : "#F87171" }}>
        {na
          ? <span style={{ fontSize: 16 }}>No field data</span>
          : <>{value}{unit && <span style={{ fontSize: 16, color: "#94A3B8", marginLeft: 3 }}>{unit}</span>}</>
        }
      </div>
    </div>
  );
}

function CheckRow({ label, pass, detail, index = 0 }: { label: string; pass: boolean; detail?: string; index?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12, animation: `checkRowIn 300ms cubic-bezier(0.23,1,0.32,1) ${index * 40}ms both` }}>
      <span style={{ color: pass ? "#10D9A0" : "#F87171", fontSize: 18, flexShrink: 0, fontWeight: 700, marginTop: 1 }}>{pass ? "✓" : "✗"}</span>
      <div>
        <span style={{ fontSize: 17, color: pass ? "#CBD5E1" : "#F1F5F9" }}>{label}</span>
        {detail && <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 3 }}>{detail}</div>}
      </div>
    </div>
  );
}

function scoreH1Content(h1Text: string, titleTag: string, primaryKeyword: string): { pass: boolean; detail: string } {
  const trimmed = h1Text.trim();
  const lower = trimmed.toLowerCase();
  const words = trimmed.split(/\s+/).filter(Boolean);

  // Too short to mean anything
  if (words.length < 4) {
    return { pass: false, detail: `Your H1 is only ${words.length} word${words.length === 1 ? "" : "s"} long. It is not targeting any search term. This is costing you rankings every single day.` };
  }

  // Generic / placeholder patterns that rank for nothing
  const genericPatterns = [
    /^home$/i,
    /^welcome/i,
    /^about(\s+us)?$/i,
    /^(our )?services?$/i,
    /^contact(\s+us)?$/i,
    /^(get a )?(free )?(quote|estimate|consultation)$/i,
    /^(what we do)$/i,
    /^(who we are)$/i,
  ];
  if (genericPatterns.some(re => re.test(lower))) {
    return { pass: false, detail: `Your H1 tag is a placeholder, not a keyword. It is not targeting any search term that a customer would actually type into Google.` };
  }

  // No location signal — biggest miss for local businesses
  const hasLocation = /\b(st\.?\s*louis|springfield|kansas city|columbia|jefferson city|chicago|peoria|rockford|aurora|naperville|joliet|\bmo\b|\bil\b|missouri|illinois|texas|california|florida|ohio|georgia|colorado|tennessee|nevada|arizona|virginia|washington|oregon|minnesota|wisconsin|indiana|massachusetts|michigan|pennsylvania|new york|north carolina|south carolina|kentucky|alabama|oklahoma|louisiana|connecticut|iowa|arkansas|kansas|utah|nebraska|new mexico|idaho|montana|wyoming|delaware|vermont|rhode island|hawaii|alaska|atlanta|dallas|houston|phoenix|denver|seattle|portland|boston|miami|orlando|tampa|nashville|charlotte|raleigh|richmond|baltimore|philadelphia|detroit|minneapolis|milwaukee|cincinnati|cleveland|pittsburgh|indianapolis|louisville|memphis|new orleans|oklahoma city|tulsa|albuquerque|las vegas|sacramento|san diego|san jose|san francisco|los angeles)\b/i.test(trimmed);

  if (!hasLocation) {
    return { pass: false, detail: `Your H1 tag has no city or region in it. Google cannot tell where you serve customers. Without a location signal, you will not rank for local searches.` };
  }

  // Check for at least some keyword alignment with title or detected keyword
  if (primaryKeyword) {
    const keywordWords = primaryKeyword.toLowerCase().split(/\s+/);
    const matchCount = keywordWords.filter(kw => lower.includes(kw)).length;
    if (matchCount === 0) {
      return { pass: false, detail: `Your H1 has a location but is missing the service keyword customers actually search for. Google does not know what you do.` };
    }
  }

  return { pass: true, detail: "Contains a service keyword and location signal." };
}

function playDone() {
  try {
    new Audio("/sounds/ping.mp3").play();
    setTimeout(() => { try { new Audio("/sounds/ping.mp3").play(); } catch { /* ignore */ } }, 220);
  } catch { /* ignore */ }
}

export default function ReportPage() {
  const params = useParams();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/report?id=${params.id}`)
      .then(r => r.json())
      .then(data => { setAudit(data); setLoading(false); playDone(); })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0B0E16 0%, #0D1528 50%, #0B0E16 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#CBD5E1", fontFamily: "system-ui, sans-serif", fontSize: 18 }}>
      <span style={{ animation: "pulse 1.8s ease-in-out infinite" }}>Loading your report…</span>
    </main>
  );

  if (!audit) return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0B0E16 0%, #0D1528 50%, #0B0E16 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#CBD5E1", fontFamily: "system-ui, sans-serif", fontSize: 18 }}>
      Report not found. <a href="/" style={{ color: "#10D9A0", marginLeft: 8 }}>Run a new audit →</a>
    </main>
  );

  const hostname = (() => { try { return new URL(audit.url).hostname; } catch { return audit.url; } })();
  const speed = audit.full_report?.speed;
  const tech = audit.full_report?.tech;
  const verdictColor = audit.passes_one_second ? "#10D9A0" : "#F87171";

  const hostingVerdictColor = () => {
    switch (tech?.hostingVerdict) {
      case "dead-zone":     return "#F87171";
      case "speed-limiter": return "#FBBF24";
      case "acceptable":    return "#FCD34D";
      case "race-ready":    return "#10D9A0";
      default:              return "#94A3B8";
    }
  };

  return (
    <main className="report-shell" style={{ minHeight: "100vh", background: "#0B0E16", color: "#F1F5F9", fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 16 }}>
      <div style={{ maxWidth: 740, margin: "0 auto", padding: "40px var(--page-pad, 24px) 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#10D9A0", letterSpacing: "-0.5px" }}>
              Ping<span style={{ color: "#F1F5F9" }}>Close</span>
            </div>
          </a>
          <div style={{ fontSize: 17, color: "#94A3B8", marginTop: 4 }}>Speed & SEO Diagnostic Report</div>
          <div style={{ fontSize: 20, color: "#F1F5F9", marginTop: 8, fontWeight: 700 }}>{hostname}</div>
          <div style={{ fontSize: 16, color: "#64748B", marginTop: 4 }}>
            {new Date(audit.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {/* 1. VERDICT */}
        <div style={{ background: audit.passes_one_second ? "#10D9A015" : "#F8717115", border: `1px solid ${verdictColor}40`, borderRadius: 12, padding: "24px", textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: verdictColor }}>
            {audit.passes_one_second ? "✅ Passes the 1-second test" : "❌ Failing Google's first hurdle"}
          </div>
          <div style={{ fontSize: 17, color: "#CBD5E1", marginTop: 8, lineHeight: 1.6 }}>
            {audit.passes_one_second
              ? "Your site is clearing Google's first hurdle. Now let's make sure you win the full race."
              : "Your site is failing Google's most basic performance requirement. Your competitors are passing you on the very first step."}
          </div>
        </div>

        {/* 2. LOAD TIME HERO + TIMELINE */}
        {audit.lcp > 0 && (
          <LoadTimeHero ttfb={audit.ttfb} fcp={audit.fcp} lcp={audit.lcp} />
        )}

        {/* 3. MOBILE vs DESKTOP GAP */}
        {speed && speed.mobileDesktopGap >= 10 && (
          <div style={{ background: "#FBBF2410", border: "1px solid #FBBF2440", borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
            <div style={SECTION_LABEL}>⚠️ Mobile vs Desktop Gap — {speed.mobileDesktopGap} Points</div>
            <div style={{ fontSize: 17, color: "#F1F5F9", lineHeight: 1.7 }}>{speed.gapExplanation}</div>
          </div>
        )}

        {/* 4. CORE WEB VITALS */}
        <div style={{ marginBottom: 20 }}>
          <div style={SECTION_LABEL}>Core Web Vitals</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
            <Metric label="TTFB" value={audit.ttfb} unit="ms" good={audit.ttfb <= 6} />
            <Metric label="LCP" value={(audit.lcp / 1000).toFixed(1)} unit="s" good={audit.lcp <= 99} />
            <Metric label="FCP" value={(audit.fcp / 1000).toFixed(1)} unit="s" good={audit.fcp < 30} />
            <Metric label="CLS" value={audit.cls} good={audit.cls <= 0} />
            {speed && <Metric label="TBT" value={speed.tbt} unit="ms" good={speed.tbt < 30} />}
            <Metric label="Page Size" value={audit.total_page_size} unit="KB" good={audit.total_page_size < 1500} />
            <Metric label="Requests" value={audit.total_requests} good={audit.total_requests < 50} />
            {audit.pagespeed_duration_ms != null && audit.pagespeed_status === 'ok' && (
              <Metric label="PS API" value={(audit.pagespeed_duration_ms / 1000).toFixed(1)} unit="s" good={audit.pagespeed_duration_ms < 30000} />
            )}
          </div>
        </div>

        {/* 5. WHAT'S SLOWING YOU DOWN */}
        {speed && (speed.renderBlockingScripts > 0 || speed.unusedJsKb > 0 || speed.unusedCssKb > 0 || speed.noBrowserCaching || speed.hasFontDisplayIssue || speed.hasRocketLoaderConflict) && (
          <div style={DARK_CARD}>
            <div style={SECTION_LABEL}>🐢 What&apos;s Slowing You Down</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {speed.renderBlockingScripts > 0 && (
                <div style={{ background: "#F8717110", border: "1px solid #F8717130", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: 17, color: "#F87171", fontWeight: 600 }}>🚫 {speed.renderBlockingScripts} Render-Blocking Scripts</div>
                  <div style={{ fontSize: 16, color: "#CBD5E1", marginTop: 4 }}>These scripts freeze your page before any content loads.</div>
                  {speed.renderBlockingDetails.slice(0, 3).map((r, i) => (
                    <div key={i} style={{ fontSize: 16, color: "#94A3B8", marginTop: 4, fontFamily: "monospace" }}>→ {r.url.split("/").pop()?.substring(0, 60)} ({r.savingsMs}ms)</div>
                  ))}
                </div>
              )}
              {speed.unusedJsKb > 0 && (
                <div style={{ background: "#F8717110", border: "1px solid #F8717130", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: 17, color: "#F87171", fontWeight: 600 }}>🗑️ {speed.unusedJsKb}KB Unused JavaScript</div>
                  <div style={{ fontSize: 16, color: "#CBD5E1", marginTop: 4 }}>JavaScript your visitors download but never use. Pure waste on every page load.</div>
                </div>
              )}
              {speed.unusedCssKb > 0 && (
                <div style={{ background: "#F8717110", border: "1px solid #F8717130", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: 17, color: "#F87171", fontWeight: 600 }}>🗑️ {speed.unusedCssKb}KB Unused CSS</div>
                  <div style={{ fontSize: 16, color: "#CBD5E1", marginTop: 4 }}>Style rules loading on every visit that are never applied to your page.</div>
                </div>
              )}
              {speed.noBrowserCaching && (
                <div style={{ background: "#FBBF2410", border: "1px solid #FBBF2430", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: 17, color: "#FBBF24", fontWeight: 600 }}>🔄 No Browser Caching</div>
                  <div style={{ fontSize: 16, color: "#CBD5E1", marginTop: 4 }}>Repeat visitors re-download the same files every single visit instead of loading from cache.</div>
                </div>
              )}
              {speed.hasFontDisplayIssue && (
                <div style={{ background: "#FBBF2410", border: "1px solid #FBBF2430", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: 17, color: "#FBBF24", fontWeight: 600 }}>🔤 Font Loading Issue</div>
                  <div style={{ fontSize: 16, color: "#CBD5E1", marginTop: 4 }}>Fonts blocking render — text is invisible to visitors until fonts fully download.</div>
                </div>
              )}
              {speed.hasRocketLoaderConflict && (
                <div style={{ background: "#F8717110", border: "1px solid #F8717130", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: 17, color: "#F87171", fontWeight: 600 }}>⚡ Cloudflare Rocket Loader Conflict</div>
                  <div style={{ fontSize: 16, color: "#CBD5E1", marginTop: 4 }}>Rocket Loader is adding load time instead of reducing it — a common WordPress conflict. Disable it.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. IMAGE AUDIT */}
        <div style={DARK_CARD}>
          <div style={SECTION_LABEL}>🖼️ Image Audit</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12, marginBottom: 16 }}>
            <div style={{ background: "#111827", borderRadius: 8, padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#F1F5F9" }}>{speed?.totalImages ?? 0}</div>
              <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Images</div>
            </div>
            <div style={{ background: "#111827", borderRadius: 8, padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#10D9A0" }}>{speed?.webpImages ?? 0}</div>
              <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>WebP ✓</div>
            </div>
            <div style={{ background: "#111827", borderRadius: 8, padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: (speed?.nonWebpImages ?? 0) > 0 ? "#F87171" : "#10D9A0" }}>{speed?.nonWebpImages ?? 0}</div>
              <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Not WebP ✗</div>
            </div>
          </div>

          {(speed?.estimatedWebPSavingKb ?? 0) > 0 && (
            <div style={{ background: "#10D9A010", border: "1px solid #10D9A030", borderRadius: 8, padding: "12px 16px", marginBottom: 14 }}>
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
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 16, color: "#94A3B8", marginBottom: 8, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Images That Need Converting to WebP:</div>
              {speed!.nonWebpImageList.slice(0, 8).map((img, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1E3050", fontSize: 16 }}>
                  <span style={{ color: "#CBD5E1", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%" }}>
                    {img.url.split("/").pop()?.substring(0, 50) || img.url}
                  </span>
                  <span style={{ color: "#F87171", flexShrink: 0, marginLeft: 8 }}>
                    {img.format} · {img.sizeKb}KB{img.estimatedWebPSavingKb > 0 ? ` → save ${img.estimatedWebPSavingKb}KB` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 7. VIDEO AUDIT */}
        {(speed?.totalVideos ?? 0) > 0 && (
          <div style={DARK_CARD}>
            <div style={SECTION_LABEL}>🎬 Video Audit</div>
            <CheckRow label={`${speed!.totalVideos} video${speed!.totalVideos > 1 ? "s" : ""} found on page`} pass={true} />
            {speed?.hasAutoPlayVideo && <CheckRow label="Autoplay video detected" pass={false} detail="Autoplay increases mobile data usage and delays page load significantly" />}
            {speed?.hasAboveFoldEmbed && <CheckRow label="Video embed above the fold" pass={false} detail="YouTube/Vimeo iframes block page rendering — use a facade/thumbnail until user clicks play" />}
          </div>
        )}

        {/* 9. TECH STACK */}
        <div style={DARK_CARD}>
          <div style={SECTION_LABEL}>🔧 Tech Stack Identified</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {([
              ["CMS / Platform", audit.cms && audit.cms !== "Custom / Unknown" ? audit.cms : "Custom / No CMS"],
              ["Hosting Provider", audit.hosting && audit.hosting !== "Unknown" ? audit.hosting : "Identifying…"],
              ["CDN", audit.cdn && audit.cdn !== "None detected" ? audit.cdn : "No CDN in use"],
              ["HTTP Version", audit.http_version || "HTTP/1.1"],
              ["Page Builder", tech?.pageBuilder && tech.pageBuilder !== "None detected" ? tech.pageBuilder : "No page builder"],
              ["E-commerce", tech?.ecommerce && tech.ecommerce !== "None detected" ? tech.ecommerce : "Not an e-commerce site"],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 16, color: "#94A3B8", marginBottom: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: "#F1F5F9" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 10. HOSTING VERDICT */}
        {tech?.hostingVerdictLabel && (
          <div style={{ background: "#0D1528", border: `2px solid ${hostingVerdictColor()}40`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
            <div style={SECTION_LABEL}>🏠 Hosting Verdict</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: hostingVerdictColor(), marginBottom: 10 }}>{tech.hostingVerdictLabel}</div>
            <div style={{ fontSize: 17, color: "#F1F5F9", lineHeight: 1.7 }}>{tech.hostingVerdictMessage}</div>
          </div>
        )}

        {/* 11. WORDPRESS ISSUES */}
        {(tech?.wordpressPluginIssues?.length ?? 0) > 0 && (
          <div style={{ background: "#F8717108", border: "1px solid #F8717130", borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
            <div style={SECTION_LABEL}>🔌 WordPress Issues Detected</div>
            {tech!.wordpressPluginIssues.map((issue, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <span style={{ color: "#F87171", flexShrink: 0, fontSize: 17 }}>→</span>
                <span style={{ fontSize: 17, color: "#F1F5F9", lineHeight: 1.5 }}>{issue}</span>
              </div>
            ))}
          </div>
        )}

        {/* 12. SEO FUNDAMENTALS */}
        {tech && (
          <div style={DARK_CARD}>
            <div style={SECTION_LABEL}>🔍 SEO Fundamentals</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <CheckRow label={tech.hasTitle ? `Title tag (${tech.titleLength} chars): "${tech.titleTag.substring(0, 55)}${tech.titleTag.length > 55 ? "…" : ""}"` : "No title tag found"} pass={tech.hasTitle && tech.titleLength <= 60} detail={tech.titleLength > 60 ? "Google truncates titles at 60 characters" : undefined} />
              <CheckRow label={tech.hasMetaDescription ? `Meta description: ${tech.metaDescriptionLength} characters` : "No meta description"} pass={tech.hasMetaDescription} />
              <CheckRow label={tech.hasH1 ? "H1 Tag Present" : "H1 Tag Present"} pass={tech.hasH1} detail={!tech.hasH1 ? "No H1 tag found — every page needs exactly one. This is the single strongest on-page SEO signal you control." : tech.multipleH1s ? "Multiple H1 tags detected — use only one per page" : undefined} />
              {tech.hasH1 && !tech.multipleH1s && (() => {
                const result = scoreH1Content(tech.h1Text, tech.titleTag, tech.primaryKeyword);
                return <CheckRow label={`H1 Tag Content: "${tech.h1Text.substring(0, 50)}${tech.h1Text.length > 50 ? "…" : ""}"`} pass={result.pass} detail={result.pass ? undefined : result.detail} />;
              })()}
              <CheckRow label="Canonical tag" pass={tech.hasCanonical} detail={!tech.hasCanonical ? "Missing canonical — risk of duplicate content penalty" : undefined} />
              <CheckRow label="XML Sitemap" pass={tech.hasSitemap} />
              <CheckRow label="HTTPS / SSL Security" pass={tech.isHttps} detail={!tech.isHttps ? "Google shows security warnings to all visitors on HTTP sites" : undefined} />
            </div>
            {tech.primaryKeyword && (
              <div style={{ marginTop: 16, padding: "12px 16px", background: "#111827", borderRadius: 8 }}>
                <div style={{ fontSize: 16, color: "#94A3B8", marginBottom: 4, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Primary Keyword Detected</div>
                <div style={{ fontSize: 17, color: "#10D9A0", fontWeight: 600 }}>{tech.primaryKeyword}</div>
              </div>
            )}
          </div>
        )}

        {/* 12b. SITE STRUCTURE */}
        {(() => {
          const sm = audit.full_report?.sitemap;
          if (!sm || sm.pageCount === 0) return null;
          return (
            <div style={DARK_CARD}>
              <div style={SECTION_LABEL}>🗺️ Site Structure</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12, marginBottom: 20 }}>
                <div style={{ background: "#111827", borderRadius: 8, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#F1F5F9" }}>{sm.pageCount.toLocaleString()}</div>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Pages</div>
                </div>
                <div style={{ background: "#111827", borderRadius: 8, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: sm.landingPageCount > 0 ? "#10D9A0" : "#475569" }}>{sm.landingPageCount}</div>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Landing Pages</div>
                </div>
                <div style={{ background: "#111827", borderRadius: 8, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: sm.cityPageCount > 0 ? "#10D9A0" : "#F87171" }}>{sm.cityPageCount}</div>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>City Pages</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14, fontSize: 16, color: "#CBD5E1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1E3050" }}><span>Standard / nav pages</span><span style={{ fontWeight: 700 }}>{sm.standardPageCount}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1E3050" }}><span>Blog / article posts</span><span style={{ fontWeight: 700 }}>{sm.blogPostCount}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1E3050" }}><span>Event pages</span><span style={{ fontWeight: 700 }}>{sm.eventPageCount}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}><span>Category / tag archive pages</span><span style={{ fontWeight: 700 }}>{sm.archivePageCount}</span></div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <CheckRow
                  label={sm.hasImageSitemap ? `Image Sitemap (${sm.imageCount.toLocaleString()} images tagged)` : "Image Sitemap"}
                  pass={sm.hasImageSitemap}
                  detail={!sm.hasImageSitemap ? "No image sitemap entries found — image search is a free, untapped discovery channel for local businesses with photos of work, locations, or staff." : undefined}
                />
              </div>

              {sm.cityPageCount === 0 && (
                <div style={{ background: "#F8717110", border: "1px solid #F8717130", borderRadius: 8, padding: "12px 16px", marginBottom: 12 }}>
                  <div style={{ fontSize: 17, color: "#F87171", fontWeight: 600 }}>❌ No city pages detected</div>
                  <div style={{ fontSize: 16, color: "#CBD5E1", marginTop: 4 }}>City pages targeting specific service areas are one of the highest-ROI pages a local business can build. Each city page ranks independently for "[service] in [city]" searches.</div>
                </div>
              )}

              {sm.cityPageUrls.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginBottom: 8, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>City / Location Pages Detected:</div>
                  {sm.cityPageUrls.slice(0, 8).map((u, i) => {
                    let path = u;
                    try { path = new URL(u).pathname; } catch { /* use full url */ }
                    return (
                      <div key={i} style={{ fontSize: 16, color: "#CBD5E1", fontFamily: "monospace", padding: "4px 0", borderBottom: "1px solid #1E3050" }}>
                        {path}
                      </div>
                    );
                  })}
                  {sm.cityPageCount > 8 && (
                    <div style={{ fontSize: 16, color: "#64748B", marginTop: 6 }}>…and {sm.cityPageCount - 8} more</div>
                  )}
                </div>
              )}

              {sm.landingPageUrls.length > 0 && (
                <div>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginBottom: 8, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Landing Pages Detected:</div>
                  {sm.landingPageUrls.slice(0, 5).map((u, i) => {
                    let path = u;
                    try { path = new URL(u).pathname; } catch { /* use full url */ }
                    return (
                      <div key={i} style={{ fontSize: 16, color: "#CBD5E1", fontFamily: "monospace", padding: "4px 0", borderBottom: "1px solid #1E3050" }}>
                        {path}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* 12b2. CONTENT QUALITY */}
        {(() => {
          const cq = audit.full_report?.contentQuality;
          if (!cq || cq.pagesSampled === 0) return null;
          const isRed = cq.avgInternalLinks < cq.recommendedLinksPerPost * 0.5;
          const isYellow = !isRed && cq.avgInternalLinks < cq.recommendedLinksPerPost;
          return (
            <div style={DARK_CARD}>
              <div style={SECTION_LABEL}>🔗 Content Quality (sampled {cq.pagesSampled} posts)</div>
              <div style={{ fontSize: 16, color: "#CBD5E1", marginBottom: 14, lineHeight: 1.6 }}>
                Internal links spread authority across the site and give Google a path to crawl. Rule of thumb: about 1 internal link per 150 words of content.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12, marginBottom: 14 }}>
                <div style={{ background: "#111827", borderRadius: 8, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#F1F5F9" }}>{cq.avgWordCount.toLocaleString()}</div>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Avg Words / Post</div>
                </div>
                <div style={{ background: "#111827", borderRadius: 8, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: isRed ? "#F87171" : isYellow ? "#FBBF24" : "#10D9A0" }}>{cq.avgInternalLinks}</div>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Avg Internal Links</div>
                </div>
                <div style={{ background: "#111827", borderRadius: 8, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#94A3B8" }}>{cq.recommendedLinksPerPost}</div>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Recommended</div>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <CheckRow
                  label={`Q&A content found on ${cq.qaPageCount} of ${cq.pagesSampled} sampled posts`}
                  pass={cq.qaPageCount > 0}
                />
              </div>
              {(isRed || isYellow) && (
                <div style={isRed
                  ? { background: "#F8717110", border: "1px solid #F8717130", borderRadius: 8, padding: "12px 16px" }
                  : { background: "#FBBF2410", border: "1px solid #FBBF2430", borderRadius: 8, padding: "12px 16px" }
                }>
                  <div style={{ fontSize: 17, color: isRed ? "#F87171" : "#FBBF24", fontWeight: 600 }}>
                    {isRed ? "❌" : "⚠️"} Averaging {cq.avgInternalLinks} internal link{cq.avgInternalLinks === 1 ? "" : "s"} per post — recommended is {cq.recommendedLinksPerPost} for ~{cq.avgWordCount}-word content
                  </div>
                  <div style={{ fontSize: 16, color: "#CBD5E1", marginTop: 4 }}>Posts with no internal links are dead ends for both readers and Google's crawler — no path to related pages, practice areas, or a conversion page.</div>
                </div>
              )}
            </div>
          );
        })()}

        {/* 12c. SCHEMA OPPORTUNITIES OVERVIEW */}
        {(() => {
          const so = audit.full_report?.schemaOpportunities;
          if (!so || so.totalOpportunities === 0) return null;
          return (
            <div style={DARK_CARD}>
              <div style={SECTION_LABEL}>🧩 Schema Opportunities</div>
              <div style={{ fontSize: 16, color: "#CBD5E1", marginBottom: 14, lineHeight: 1.6 }}>
                Every schema type this site is eligible for, rolled up into one number — opportunities found across LocalBusiness, Review, Pricing, FAQ, and (for law firms) Attorney/LegalService schema.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 12, marginBottom: 16 }}>
                <div style={{ background: "#111827", borderRadius: 8, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#F1F5F9" }}>{so.totalOpportunities}</div>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Opportunities</div>
                </div>
                <div style={{ background: "#111827", borderRadius: 8, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#10D9A0" }}>{so.totalUsed}</div>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Used</div>
                </div>
                <div style={{ background: "#111827", borderRadius: 8, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: so.totalMissed > 0 ? "#F87171" : "#475569" }}>{so.totalMissed}</div>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Missed</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {so.breakdown.map((b, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < so.breakdown.length - 1 ? "1px solid #1E3050" : "none" }}>
                    <div style={{ fontSize: 16, color: "#CBD5E1" }}>{b.type}</div>
                    <div style={{ fontSize: 16, color: b.missed > 0 ? "#F87171" : "#10D9A0", fontWeight: 600 }}>{b.used} / {b.opportunities} used</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 13. SCHEMA CHECK */}
        {tech && (
          <div style={DARK_CARD}>
            <div style={SECTION_LABEL}>📋 Schema Markup</div>
            <div style={{ fontSize: 16, color: "#CBD5E1", marginBottom: 14, lineHeight: 1.6 }}>
              Schema markup tells Google exactly what your page contains and unlocks rich results — star ratings, FAQ answers, and prices shown directly in search results. Most local businesses have none.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <CheckRow label="LocalBusiness schema" pass={tech.hasLocalBusinessSchema} detail={!tech.hasLocalBusinessSchema ? "Google has less confidence in your local signals without this" : undefined} />
              <CheckRow label="FAQ page with FAQPage schema" pass={tech.hasFAQSchema} detail={!tech.hasFAQSchema ? "Unlocks free FAQ rich results in Google search" : undefined} />
              <CheckRow label="Pricing page with PriceSpecification schema" pass={tech.hasPricingSchema} detail={!tech.hasPricingSchema ? "Can show your prices directly in search results" : undefined} />
              <CheckRow label="Review / Rating schema" pass={tech.hasReviewSchema} />
              {audit.full_report?.lawyerSchema?.isLawFirm && (
                <CheckRow
                  label="Attorney / LegalService schema"
                  pass={audit.full_report.lawyerSchema.usedCount >= audit.full_report.lawyerSchema.opportunityCount}
                  detail={audit.full_report.lawyerSchema.usedCount < audit.full_report.lawyerSchema.opportunityCount
                    ? `Found on ${audit.full_report.lawyerSchema.usedCount} of ${audit.full_report.lawyerSchema.opportunityCount} eligible pages — see Lawyer Schema below for detail`
                    : undefined}
                />
              )}
            </div>
          </div>
        )}

        {/* 13b. LAW FIRM FAQ SCHEMA */}
        {(() => {
          const lf = audit.full_report?.lawFaq;
          if (!lf || !lf.isLawFirm) return null;
          const missedPercent = lf.qaContentCount > 0 ? lf.missedOpportunityCount / lf.qaContentCount : 0;
          const isRed = missedPercent > 0.10;
          return (
            <div style={DARK_CARD}>
              <div style={SECTION_LABEL}>⚖️ Law Firm Q&A Schema</div>
              <div style={{ fontSize: 16, color: "#CBD5E1", marginBottom: 14, lineHeight: 1.6 }}>
                Law firm sites that answer legal questions should mark each one up with FAQPage/Question schema — it's free eligibility for Google's FAQ rich results, shown directly in search.
              </div>
              {lf.hiddenFaqSchemaCount > 0 && (
                <div style={{ background: "#F8717110", border: "1px solid #F8717130", borderRadius: 8, padding: "12px 16px", marginBottom: 14 }}>
                  <div style={{ fontSize: 17, color: "#F87171", fontWeight: 600 }}>❌ {lf.hiddenFaqSchemaCount} question{lf.hiddenFaqSchemaCount === 1 ? "" : "s"} tagged with FAQ schema but not visible anywhere on the page</div>
                  <div style={{ fontSize: 16, color: "#CBD5E1", marginTop: 4 }}>Google requires FAQ rich-result content to actually be visible to visitors. Hidden schema like this risks the rich result being suppressed — or a manual penalty for spammy structured data.</div>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 14 }}>
                <div style={{ background: "#111827", borderRadius: 8, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: lf.properUseCount > 0 ? "#10D9A0" : "#475569" }}>{lf.properUseCount}</div>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Questions Properly Tagged</div>
                </div>
                <div style={{ background: "#111827", borderRadius: 8, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: isRed ? "#F87171" : lf.missedOpportunityCount > 0 ? "#FBBF24" : "#475569" }}>{lf.missedOpportunityCount}</div>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Missed Opportunities</div>
                </div>
              </div>
              {lf.missedOpportunityCount > 0 && (
                <div style={isRed
                  ? { background: "#F8717110", border: "1px solid #F8717130", borderRadius: 8, padding: "12px 16px" }
                  : { background: "#FBBF2410", border: "1px solid #FBBF2430", borderRadius: 8, padding: "12px 16px" }
                }>
                  <div style={{ fontSize: 17, color: isRed ? "#F87171" : "#FBBF24", fontWeight: 600 }}>
                    {isRed ? "❌" : "⚠️"} {lf.missedOpportunityCount} question{lf.missedOpportunityCount === 1 ? "" : "s"} answered on the page without FAQ schema ({Math.round(missedPercent * 100)}% missed)
                  </div>
                  <div style={{ fontSize: 16, color: "#CBD5E1", marginTop: 4 }}>Each one is a missed shot at a free rich result in Google search — competitors who tag theirs win that real estate instead.</div>
                </div>
              )}
            </div>
          );
        })()}

        {/* 13c. LAWYER SCHEMA */}
        {(() => {
          const ls = audit.full_report?.lawyerSchema;
          if (!ls || !ls.isLawFirm) return null;
          const missingCount = ls.opportunityCount - ls.usedCount;
          const isRed = missingCount > 0;
          return (
            <div style={DARK_CARD}>
              <div style={SECTION_LABEL}>⚖️ Lawyer Schema</div>
              <div style={{ fontSize: 16, color: "#CBD5E1", marginBottom: 14, lineHeight: 1.6 }}>
                Attorney / LegalService schema is what actually tells Google this is a law firm — separate from FAQ schema above. Every practice-area page, plus the homepage, is an opportunity to use it.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 14 }}>
                <div style={{ background: "#111827", borderRadius: 8, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#F1F5F9" }}>{ls.opportunityCount}</div>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Opportunities to Use It</div>
                </div>
                <div style={{ background: "#111827", borderRadius: 8, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: ls.usedCount > 0 ? "#10D9A0" : "#F87171" }}>{ls.usedCount}</div>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Times Actually Used</div>
                </div>
              </div>
              {isRed && (
                <div style={{ background: "#F8717110", border: "1px solid #F8717130", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: 17, color: "#F87171", fontWeight: 600 }}>❌ Attorney / LegalService schema missing on {missingCount} of {ls.opportunityCount} eligible page{ls.opportunityCount === 1 ? "" : "s"}</div>
                  <div style={{ fontSize: 16, color: "#CBD5E1", marginTop: 4 }}>Without this schema type, Google has no structured signal that this is a law firm — generic LocalBusiness schema doesn't carry that meaning.</div>
                </div>
              )}
            </div>
          );
        })()}

        {/* 14. CONVERSION TRACKING */}
        {tech && (
          <div style={DARK_CARD}>
            <div style={SECTION_LABEL}>📊 Conversion Tracking</div>
            <div style={{ fontSize: 16, color: "#CBD5E1", marginBottom: 14, lineHeight: 1.6 }}>
              Without tracking you cannot know which ads are working, which pages are converting, or where visitors are dropping off. You are making marketing decisions completely blind.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <CheckRow label="Google Analytics 4 (GA4)" pass={tech.hasGA4} />
              <CheckRow label="Google Tag Manager" pass={tech.hasGTM} />
              <CheckRow label="Facebook / Meta Pixel" pass={tech.hasFacebookPixel} detail={!tech.hasFacebookPixel ? "Required to track Facebook and Instagram ad conversions" : undefined} />
              <CheckRow label="TikTok Pixel" pass={tech.hasTikTokPixel} />
              <CheckRow label="Call Tracking" pass={tech.hasCallTracking} />
            </div>
          </div>
        )}

        {/* 15. ALL ISSUES — scored red to green */}
        {audit.top_issues?.length > 0 && (() => {
          const parsed = audit.top_issues.map(raw => {
            const match = raw.match(/^\[(\d+)\]\s(.+)$/);
            if (match) return { score: parseInt(match[1]), text: match[2] };
            return { score: 5, text: raw };
          });

          const scoreColor = (s: number) =>
            s >= 9 ? "#F87171" : s >= 7 ? "#FB923C" : s >= 5 ? "#FBBF24" : "#4ADE80";
          const scoreBg = (s: number) =>
            s >= 9 ? "#F8717120" : s >= 7 ? "#FB923C20" : s >= 5 ? "#FBBF2420" : "#4ADE8020";
          const scoreBorder = (s: number) =>
            s >= 9 ? "#F8717140" : s >= 7 ? "#FB923C40" : s >= 5 ? "#FBBF2440" : "#4ADE8040";
          const scoreLabel = (s: number) =>
            s >= 9 ? "CRITICAL" : s >= 7 ? "SERIOUS" : s >= 5 ? "MODERATE" : "MINOR";

          return (
            <div style={{ marginBottom: 20 }}>
              <div style={{ ...SECTION_LABEL, color: "#F87171" }}>
                🚨 Issues Found — {parsed.length} Total
              </div>

              {/* Legend */}
              <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                {[
                  { label: "Critical", color: "#F87171", range: "9-10" },
                  { label: "Serious", color: "#FB923C", range: "7-8" },
                  { label: "Moderate", color: "#FBBF24", range: "5-6" },
                  { label: "Minor", color: "#4ADE80", range: "3-4" },
                ].map(({ label, color, range }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 16, color: "#CBD5E1", fontWeight: 600 }}>{label} ({range})</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {parsed.map((issue, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    background: scoreBg(issue.score),
                    border: `1px solid ${scoreBorder(issue.score)}`,
                    borderRadius: 8, padding: "12px 14px",
                    transition: "background 150ms cubic-bezier(0.23,1,0.32,1)",
                    animation: `checkRowIn 300ms cubic-bezier(0.23,1,0.32,1) ${i * 30}ms both`,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = scoreColor(issue.score) + "18"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = scoreBg(issue.score); }}
                  >
                    <div style={{
                      flexShrink: 0, width: 36, height: 36,
                      borderRadius: 8,
                      background: scoreColor(issue.score) + "30",
                      border: `2px solid ${scoreColor(issue.score)}`,
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center"
                    }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: scoreColor(issue.score), lineHeight: 1 }}>{issue.score}</span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: scoreColor(issue.score), letterSpacing: "0.08em", marginBottom: 3, textTransform: "uppercase" }}>
                        {scoreLabel(issue.score)}
                      </div>
                      <div style={{ fontSize: 16, color: "#F1F5F9", lineHeight: 1.5 }}>
                        {issue.text.replace(/^[🔴🟠🟡🟢]\s/, '')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 16. KEYWORD VISIBILITY */}
        {(() => {
          const keyword = audit.full_report?.tech?.primaryKeyword;
          const h1 = audit.full_report?.tech?.h1Text;
          const hasSchema = audit.full_report?.tech?.hasLocalBusinessSchema;
          const hasFAQ = audit.full_report?.tech?.hasFAQSchema;
          const hasPricing = audit.full_report?.tech?.hasPricingSchema;
          if (!keyword && !h1) return null;
          const domain = (() => { try { return new URL(audit.url).hostname; } catch { return audit.url; } })();
          const googleSearchUrl = `https://www.google.com/search?q=site:${domain}`;
          const rankCheckUrl = keyword ? `https://www.google.com/search?q=${encodeURIComponent(keyword)}` : null;
          return (
            <div style={{ background: "#0D1528", border: "1px solid #1E3050", borderRadius: 12, padding: "24px", marginBottom: 20 }}>
              <div style={SECTION_LABEL}>🔍 Keyword Visibility</div>
              {keyword && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginBottom: 6, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Primary Keyword Detected From Page</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 17, fontWeight: 600, color: "#F1F5F9", padding: "8px 14px", background: "#111827", border: "1px solid #1E3050", borderRadius: 8 }}>
                      &ldquo;{keyword}&rdquo;
                    </div>
                    {rankCheckUrl && (
                      <a href={rankCheckUrl} target="_blank" rel="noreferrer"
                        style={{ fontSize: 16, color: "#F1F5F9", textDecoration: "none", padding: "8px 14px", border: "1px solid #1E3050", background: "#111827", borderRadius: 8, transition: "border-color 160ms cubic-bezier(0.23,1,0.32,1), transform 160ms cubic-bezier(0.23,1,0.32,1)" }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#10D9A060"; el.style.color = "#10D9A0"; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#1E3050"; el.style.color = "#F1F5F9"; el.style.transform = ""; }}
                        onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
                        onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
                      >
                        Check Google Rankings →
                      </a>
                    )}
                    <a href={googleSearchUrl} target="_blank" rel="noreferrer"
                      style={{ fontSize: 16, color: "#F1F5F9", textDecoration: "none", padding: "8px 14px", border: "1px solid #1E3050", background: "#111827", borderRadius: 8, transition: "border-color 160ms cubic-bezier(0.23,1,0.32,1), transform 160ms cubic-bezier(0.23,1,0.32,1)" }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#374151"; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#1E3050"; el.style.transform = ""; }}
                      onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
                      onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
                    >
                      Site: Index Check →
                    </a>
                  </div>
                </div>
              )}
              {h1 && (() => {
                const contentResult = scoreH1Content(h1, audit.full_report?.tech?.titleTag ?? "", audit.full_report?.tech?.primaryKeyword ?? "");
                const borderColor = contentResult.pass ? "#10D9A0" : "#F87171";
                return (
                  <div style={{ marginBottom: 16, padding: "12px 16px", background: "#111827", borderRadius: 8, borderLeft: `3px solid ${borderColor}` }}>
                    <div style={{ fontSize: 16, color: "#94A3B8", marginBottom: 4, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Current H1 Tag</div>
                    <div style={{ fontSize: 16, color: "#F1F5F9", fontStyle: "italic" }}>&ldquo;{h1}&rdquo;</div>
                    {!contentResult.pass && (
                      <div style={{ fontSize: 16, color: "#F87171", marginTop: 8, lineHeight: 1.6 }}>
                        ✗ {contentResult.detail}
                      </div>
                    )}
                    {contentResult.pass && (
                      <div style={{ fontSize: 16, color: "#10D9A0", marginTop: 6 }}>✓ Contains service keyword and location signal</div>
                    )}
                  </div>
                );
              })()}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
                {[
                  { label: "LocalBusiness Schema", value: hasSchema },
                  { label: "FAQ Schema", value: hasFAQ },
                  { label: "Pricing Schema", value: hasPricing },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: "10px 12px", background: "#111827", borderRadius: 8, border: `1px solid ${value ? "#10D9A030" : "#F8717120"}` }}>
                    <div style={{ fontSize: 16, color: "#94A3B8", marginBottom: 3, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: value ? "#10D9A0" : "#F87171" }}>
                      {value ? `✓ Detected` : `✗ Missing`}
                    </div>
                  </div>
                ))}
              </div>
              {(!hasSchema || !hasFAQ) && (
                <div style={{ marginTop: 12, fontSize: 16, color: "#CBD5E1", lineHeight: 1.6 }}>
                  {!hasSchema && <div>→ Missing LocalBusiness schema — Google has less confidence in your local signals and NAP data.</div>}
                  {!hasFAQ && <div>→ Missing FAQ schema — competitors with FAQ pages get free rich results above your listing.</div>}
                </div>
              )}
            </div>
          );
        })()}

        {/* 17. TOP FIXES */}
        {audit.top_fixes?.length > 0 && (
          <div style={{ background: "#10D9A008", border: "1px solid #10D9A030", borderRadius: 12, padding: "24px", marginBottom: 20 }}>
            <div style={{ ...SECTION_LABEL, color: "#10D9A0" }}>✅ Top Fixes to Win the Race</div>
            {audit.top_fixes.map((fix, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <span style={{ color: "#10D9A0", flexShrink: 0, fontSize: 17 }}>✓</span>
                <span style={{ fontSize: 17, color: "#F1F5F9", lineHeight: 1.5 }}>{fix}</span>
              </div>
            ))}
          </div>
        )}

        {/* CLOSING CTA */}
        <div style={{ background: "#0D1528", border: "1px solid #1E3050", borderRadius: 12, padding: "36px", marginBottom: 12 }}>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: "#F1F5F9", textAlign: "center", margin: "0 0 24px", letterSpacing: "-1px", lineHeight: 1.15 }}>
            We Find <span style={{ color: "#10D9A0" }}>Broken Websites</span>
          </h1>
          {audit.passes_one_second && audit.mobile_score >= 90 ? (
            <>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#10D9A0", lineHeight: 1.4, marginBottom: 10, textAlign: "center" }}>
                Your site is fast — but is the rest of the story this good?
              </div>
              <div style={{ fontSize: 17, color: "#CBD5E1", marginBottom: 28, lineHeight: 1.6, textAlign: "center" }}>
                Speed is just the first hurdle. Want to see how your Local SEO, Google Business Profile,<br />
                citations, and conversion tracking stack up against your competitors?
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#F1F5F9", lineHeight: 1.4, marginBottom: 10, textAlign: "center" }}>
                We can have 49 of these problems fixed in 24 hours.
              </div>
              <div style={{ fontSize: 17, color: "#CBD5E1", marginBottom: 28, lineHeight: 1.6, textAlign: "center" }}>
                98% of the changes on this report are done within 48 hours.<br />
                Citations take longer — but everything else moves fast.<br />
                <strong style={{ color: "#F1F5F9" }}>Click the link below to get started at LocalSEOAEOPro.com.</strong>
              </div>
            </>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
            <a href="https://localseoaeopro.com" target="_blank" rel="noreferrer"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "28px 24px", background: "#10D9A010", border: "2px solid #10D9A060", borderRadius: 12, textDecoration: "none", transition: "transform 160ms cubic-bezier(0.23,1,0.32,1), box-shadow 160ms cubic-bezier(0.23,1,0.32,1), border-color 160ms cubic-bezier(0.23,1,0.32,1)" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 12px 32px #10D9A030"; el.style.borderColor = "#10D9A0"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = ""; el.style.borderColor = "#10D9A060"; }}
              onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            >
              <span style={{ fontSize: 32 }}>🚀</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#10D9A0", textAlign: "center", lineHeight: 1.3 }}>Fix These Problems at LocalSEOAEOPro.com →</span>
              <span style={{ fontSize: 17, color: "#CBD5E1", textAlign: "center", lineHeight: 1.6 }}>PingClose found them. LocalSEOAEOPro fixes them.</span>
            </a>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              <a href="tel:+13145172533"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "24px 20px", background: "#10D9A0", borderRadius: 12, textDecoration: "none", transition: "transform 160ms cubic-bezier(0.23,1,0.32,1), box-shadow 160ms cubic-bezier(0.23,1,0.32,1), opacity 160ms" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 10px 28px #10D9A050"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = ""; }}
                onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
                onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              >
                <span style={{ fontSize: 28 }}>📞</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#0B0E16" }}>Call or Text</span>
                <span style={{ fontSize: 17, color: "#0B0E16", opacity: 0.85, fontWeight: 600 }}>(314) 517-2533</span>
              </a>
              <a href="mailto:jim@pingclose.com?subject=PingClose%20Report%20Follow-Up"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "24px 20px", background: "#1E3050", border: "1px solid #2D4A70", borderRadius: 12, textDecoration: "none", transition: "transform 160ms cubic-bezier(0.23,1,0.32,1), box-shadow 160ms cubic-bezier(0.23,1,0.32,1), border-color 160ms" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 10px 28px #1E305060"; el.style.borderColor = "#3D6A90"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ""; el.style.boxShadow = ""; el.style.borderColor = "#2D4A70"; }}
                onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
                onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              >
                <span style={{ fontSize: 28 }}>✉️</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9" }}>Send an Email</span>
                <span style={{ fontSize: 16, color: "#CBD5E1" }}>jim@pingclose.com</span>
              </a>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <a href="/" style={{ fontSize: 16, color: "#64748B", textDecoration: "none", transition: "color 160ms cubic-bezier(0.23,1,0.32,1)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#94A3B8"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#64748B"; }}
          >← Run another audit at PingClose.com</a>
        </div>

      </div>

      <style>{`
        @media (max-width: 480px) {
          .report-shell { --page-pad: 12px; --card-pad: 16px; }
        }
        @media (prefers-reduced-motion: no-preference) {
          @keyframes heroIn {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes countIn {
            from { opacity: 0; transform: scale(0.92); }
            to   { opacity: 1; transform: scale(1); }
          }
          @keyframes checkRowIn {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.4; }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes heroIn    { from { opacity: 0; } to { opacity: 1; } }
          @keyframes countIn   { from { opacity: 0; } to { opacity: 1; } }
          @keyframes checkRowIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes pulse     { 50% { opacity: 0.6; } }
        }
        @media (hover: hover) and (pointer: fine) {
          a:active { opacity: 0.85; }
        }
      `}</style>
    </main>
  );
}
