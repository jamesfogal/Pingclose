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
      landingPageUrls: string[];
      cityPageUrls: string[];
      hasSitemapIndex: boolean;
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
      hasUptimeMonitoring: boolean;
      uptimeService: string;
      hasBackup: boolean;
      backupService: string;
      backupCoveredByHost: boolean;
      backupMessage: string;
      imagesWithoutAlt: string[];
      wordpressPluginIssues: string[];
    };
  };
}

const DARK_CARD: React.CSSProperties = { background: "#0D1528", border: "1px solid #1E3050", borderRadius: 12, padding: "24px", marginBottom: 20 };
const SECTION_LABEL: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: "#64748B", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 };

function ScoreRing({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? "#10D9A0" : score >= 50 ? "#FBBF24" : "#F87171";
  return (
    <div style={{ textAlign: "center", animation: "scoreReveal 400ms cubic-bezier(0.23,1,0.32,1) both" }}>
      <div style={{ width: 90, height: 90, borderRadius: "50%", border: `5px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", background: color + "15" }}>
        <span style={{ fontSize: 26, fontWeight: 800, color }}>{score}</span>
      </div>
      <div style={{ fontSize: 16, color: "#94A3B8" }}>{label}</div>
    </div>
  );
}

function Metric({ label, value, unit, good, na }: { label: string; value: string | number; unit?: string; good: boolean; na?: boolean }) {
  return (
    <div style={{ background: "#0D1528", border: "1px solid #1E3050", borderRadius: 8, padding: "14px 16px" }}>
      <div style={{ fontSize: 16, color: "#64748B", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: na ? "#475569" : good ? "#10D9A0" : "#F87171" }}>
        {na ? <span style={{ fontSize: 16 }}>No field data</span> : <>{value}{unit && <span style={{ fontSize: 16, color: "#64748B", marginLeft: 3 }}>{unit}</span>}</>}
      </div>
    </div>
  );
}

function CheckRow({ label, pass, detail, index = 0 }: { label: string; pass: boolean; detail?: string; index?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12, animation: `checkRowIn 300ms cubic-bezier(0.23,1,0.32,1) ${index * 40}ms both` }}>
      <span style={{ color: pass ? "#10D9A0" : "#F87171", fontSize: 18, flexShrink: 0, fontWeight: 700, marginTop: 1 }}>{pass ? "✓" : "✗"}</span>
      <div>
        <span style={{ fontSize: 17, color: pass ? "#94A3B8" : "#F1F5F9" }}>{label}</span>
        {detail && <div style={{ fontSize: 16, color: "#64748B", marginTop: 3 }}>{detail}</div>}
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
      case "dead-zone": return "#F87171";
      case "speed-limiter": return "#FBBF24";
      case "acceptable": return "#FCD34D";
      case "race-ready": return "#10D9A0";
      default: return "#64748B";
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#0B0E16", color: "#F1F5F9", fontFamily: "system-ui, -apple-system, sans-serif", fontSize: 16 }}>
      <div style={{ maxWidth: 740, margin: "0 auto", padding: "40px 24px 80px" }}>

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
          <div style={{ fontSize: 17, color: "#94A3B8", marginTop: 8, lineHeight: 1.6 }}>
            {audit.passes_one_second
              ? "Your site is clearing Google's first hurdle. Now let's make sure you win the full race."
              : "Your site is failing Google's most basic performance requirement. Your competitors are passing you on the very first step."}
          </div>
        </div>

        {/* 2. SCORE RINGS */}
        <div style={{ ...DARK_CARD, display: "flex", justifyContent: "center", gap: 48 }}>
          <ScoreRing score={audit.mobile_score} label="Mobile Score" />
          <ScoreRing score={audit.desktop_score} label="Desktop Score" />
        </div>

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
            <Metric label="TTFB" value={audit.ttfb} unit="ms" good={audit.ttfb < 600} />
            <Metric label="LCP" value={(audit.lcp / 1000).toFixed(1)} unit="s" good={audit.lcp < 2500} />
            <Metric label="FCP" value={(audit.fcp / 1000).toFixed(1)} unit="s" good={audit.fcp < 1800} />
            <Metric label="CLS" value={audit.cls} good={audit.cls < 0.1} />
            <Metric label="INP" value={audit.inp} unit="ms" good={audit.inp < 200} na={!audit.inp} />
            {speed && <Metric label="TBT" value={speed.tbt} unit="ms" good={speed.tbt < 200} />}
            <Metric label="Page Size" value={audit.total_page_size} unit="KB" good={audit.total_page_size < 1500} />
            <Metric label="Requests" value={audit.total_requests} good={audit.total_requests < 50} />
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
                  <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4 }}>These scripts freeze your page before any content loads.</div>
                  {speed.renderBlockingDetails.slice(0, 3).map((r, i) => (
                    <div key={i} style={{ fontSize: 16, color: "#64748B", marginTop: 4, fontFamily: "monospace" }}>→ {r.url.split("/").pop()?.substring(0, 60)} ({r.savingsMs}ms)</div>
                  ))}
                </div>
              )}
              {speed.unusedJsKb > 0 && (
                <div style={{ background: "#F8717110", border: "1px solid #F8717130", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: 17, color: "#F87171", fontWeight: 600 }}>🗑️ {speed.unusedJsKb}KB Unused JavaScript</div>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4 }}>JavaScript your visitors download but never use. Pure waste on every page load.</div>
                </div>
              )}
              {speed.unusedCssKb > 0 && (
                <div style={{ background: "#F8717110", border: "1px solid #F8717130", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: 17, color: "#F87171", fontWeight: 600 }}>🗑️ {speed.unusedCssKb}KB Unused CSS</div>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4 }}>Style rules loading on every visit that are never applied to your page.</div>
                </div>
              )}
              {speed.noBrowserCaching && (
                <div style={{ background: "#FBBF2410", border: "1px solid #FBBF2430", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: 17, color: "#FBBF24", fontWeight: 600 }}>🔄 No Browser Caching</div>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4 }}>Repeat visitors re-download the same files every single visit instead of loading from cache.</div>
                </div>
              )}
              {speed.hasFontDisplayIssue && (
                <div style={{ background: "#FBBF2410", border: "1px solid #FBBF2430", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: 17, color: "#FBBF24", fontWeight: 600 }}>🔤 Font Loading Issue</div>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4 }}>Fonts blocking render — text is invisible to visitors until fonts fully download.</div>
                </div>
              )}
              {speed.hasRocketLoaderConflict && (
                <div style={{ background: "#F8717110", border: "1px solid #F8717130", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ fontSize: 17, color: "#F87171", fontWeight: 600 }}>⚡ Cloudflare Rocket Loader Conflict</div>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4 }}>Rocket Loader is adding load time instead of reducing it — a common WordPress conflict. Disable it.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. IMAGE AUDIT */}
        <div style={DARK_CARD}>
          <div style={SECTION_LABEL}>🖼️ Image Audit</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ background: "#111827", borderRadius: 8, padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#F1F5F9" }}>{speed?.totalImages ?? 0}</div>
              <div style={{ fontSize: 16, color: "#64748B", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Images</div>
            </div>
            <div style={{ background: "#111827", borderRadius: 8, padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#10D9A0" }}>{speed?.webpImages ?? 0}</div>
              <div style={{ fontSize: 16, color: "#64748B", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>WebP ✓</div>
            </div>
            <div style={{ background: "#111827", borderRadius: 8, padding: "14px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: (speed?.nonWebpImages ?? 0) > 0 ? "#F87171" : "#10D9A0" }}>{speed?.nonWebpImages ?? 0}</div>
              <div style={{ fontSize: 16, color: "#64748B", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Not WebP ✗</div>
            </div>
          </div>

          {(speed?.estimatedWebPSavingKb ?? 0) > 0 && (
            <div style={{ background: "#10D9A010", border: "1px solid #10D9A030", borderRadius: 8, padding: "12px 16px", marginBottom: 14 }}>
              <div style={{ fontSize: 17, color: "#10D9A0", fontWeight: 600 }}>💡 Converting to WebP would save approximately {speed!.estimatedWebPSavingKb}KB</div>
              <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4 }}>WebP images are 25–35% smaller than JPG/PNG with identical visual quality.</div>
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
              <div style={{ fontSize: 16, color: "#64748B", marginBottom: 8, fontWeight: 600, letterSpacing: "0.06em" }}>IMAGES THAT NEED CONVERTING TO WEBP:</div>
              {speed!.nonWebpImageList.slice(0, 8).map((img, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1E3050", fontSize: 16 }}>
                  <span style={{ color: "#94A3B8", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%" }}>
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

        {/* 8. UPTIME MONITORING */}
        <div style={{ background: tech?.hasUptimeMonitoring ? "#10D9A010" : "#FBBF2410", border: `1px solid ${tech?.hasUptimeMonitoring ? "#10D9A040" : "#FBBF2440"}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
          <div style={SECTION_LABEL}>🔔 Uptime Monitoring</div>
          {tech?.hasUptimeMonitoring ? (
            <div style={{ fontSize: 17, color: "#10D9A0" }}>✓ {tech.uptimeService} detected — you will be notified if your site goes down</div>
          ) : (
            <>
              <div style={{ fontSize: 17, color: "#FBBF24", fontWeight: 600, marginBottom: 8 }}>❓ Cannot verify uptime monitoring</div>
              <div style={{ fontSize: 17, color: "#F1F5F9", lineHeight: 1.7 }}>
                External monitoring tools like UptimeRobot and Pingdom ping your site from outside — they leave no detectable code on your page. If you do not have any monitoring set up, your site could go down without you knowing for hours. Free tools like UptimeRobot take 2 minutes to configure and send an email the moment your site goes offline.
              </div>
            </>
          )}
        </div>

        {/* 8b. BACKUP DETECTION */}
        {tech && (
          <div style={{ background: tech.hasBackup ? "#10D9A010" : "#F8717110", border: `1px solid ${tech.hasBackup ? "#10D9A040" : "#F8717140"}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
            <div style={SECTION_LABEL}>💾 Backup Status</div>
            {tech.hasBackup ? (
              <>
                <div style={{ fontSize: 17, color: "#10D9A0", fontWeight: 600, marginBottom: 8 }}>
                  ✓ {tech.backupService}{tech.backupCoveredByHost ? " — Included with your host" : " — Plugin detected"}
                </div>
                <div style={{ fontSize: 17, color: "#94A3B8", lineHeight: 1.7 }}>{tech.backupMessage}</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 17, color: "#F87171", fontWeight: 600, marginBottom: 8 }}>☠️ No backup software detected</div>
                <div style={{ fontSize: 17, color: "#F1F5F9", lineHeight: 1.7 }}>{tech.backupMessage}</div>
              </>
            )}
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
                <div style={{ fontSize: 16, color: "#64748B", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
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
              <CheckRow label={tech.hasH1 ? `H1: "${tech.h1Text.substring(0, 55)}${tech.h1Text.length > 55 ? "…" : ""}"` : "No H1 tag found"} pass={tech.hasH1 && !tech.multipleH1s} detail={tech.multipleH1s ? "Multiple H1 tags — use only one per page" : undefined} />
              <CheckRow label="Canonical tag" pass={tech.hasCanonical} detail={!tech.hasCanonical ? "Missing canonical — risk of duplicate content penalty" : undefined} />
              <CheckRow label="XML Sitemap" pass={tech.hasSitemap} />
              <CheckRow label="HTTPS / SSL Security" pass={tech.isHttps} detail={!tech.isHttps ? "Google shows security warnings to all visitors on HTTP sites" : undefined} />
            </div>
            {tech.primaryKeyword && (
              <div style={{ marginTop: 16, padding: "12px 16px", background: "#111827", borderRadius: 8 }}>
                <div style={{ fontSize: 16, color: "#64748B", marginBottom: 4, fontWeight: 600, letterSpacing: "0.06em" }}>PRIMARY KEYWORD DETECTED</div>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                <div style={{ background: "#111827", borderRadius: 8, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#F1F5F9" }}>{sm.pageCount.toLocaleString()}</div>
                  <div style={{ fontSize: 16, color: "#64748B", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Pages</div>
                </div>
                <div style={{ background: "#111827", borderRadius: 8, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: sm.landingPageCount > 0 ? "#10D9A0" : "#475569" }}>{sm.landingPageCount}</div>
                  <div style={{ fontSize: 16, color: "#64748B", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Landing Pages</div>
                </div>
                <div style={{ background: "#111827", borderRadius: 8, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: sm.cityPageCount > 0 ? "#10D9A0" : "#F87171" }}>{sm.cityPageCount}</div>
                  <div style={{ fontSize: 16, color: "#64748B", marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>City Pages</div>
                </div>
              </div>

              {sm.cityPageCount === 0 && (
                <div style={{ background: "#F8717110", border: "1px solid #F8717130", borderRadius: 8, padding: "12px 16px", marginBottom: 12 }}>
                  <div style={{ fontSize: 17, color: "#F87171", fontWeight: 600 }}>❌ No city pages detected</div>
                  <div style={{ fontSize: 16, color: "#94A3B8", marginTop: 4 }}>City pages targeting specific service areas are one of the highest-ROI pages a local business can build. Each city page ranks independently for "[service] in [city]" searches.</div>
                </div>
              )}

              {sm.cityPageUrls.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 16, color: "#64748B", marginBottom: 8, fontWeight: 600, letterSpacing: "0.06em" }}>CITY / LOCATION PAGES DETECTED:</div>
                  {sm.cityPageUrls.slice(0, 8).map((u, i) => {
                    let path = u;
                    try { path = new URL(u).pathname; } catch { /* use full url */ }
                    return (
                      <div key={i} style={{ fontSize: 16, color: "#94A3B8", fontFamily: "monospace", padding: "4px 0", borderBottom: "1px solid #1E3050" }}>
                        {path}
                      </div>
                    );
                  })}
                  {sm.cityPageCount > 8 && (
                    <div style={{ fontSize: 16, color: "#475569", marginTop: 6 }}>…and {sm.cityPageCount - 8} more</div>
                  )}
                </div>
              )}

              {sm.landingPageUrls.length > 0 && (
                <div>
                  <div style={{ fontSize: 16, color: "#64748B", marginBottom: 8, fontWeight: 600, letterSpacing: "0.06em" }}>LANDING PAGES DETECTED:</div>
                  {sm.landingPageUrls.slice(0, 5).map((u, i) => {
                    let path = u;
                    try { path = new URL(u).pathname; } catch { /* use full url */ }
                    return (
                      <div key={i} style={{ fontSize: 16, color: "#94A3B8", fontFamily: "monospace", padding: "4px 0", borderBottom: "1px solid #1E3050" }}>
                        {path}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* 13. SCHEMA CHECK */}
        {tech && (
          <div style={DARK_CARD}>
            <div style={SECTION_LABEL}>📋 Schema Markup</div>
            <div style={{ fontSize: 16, color: "#64748B", marginBottom: 14, lineHeight: 1.6 }}>
              Schema markup tells Google exactly what your page contains and unlocks rich results — star ratings, FAQ answers, and prices shown directly in search results. Most local businesses have none.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <CheckRow label="LocalBusiness schema" pass={tech.hasLocalBusinessSchema} detail={!tech.hasLocalBusinessSchema ? "Google has less confidence in your local signals without this" : undefined} />
              <CheckRow label="FAQ page with FAQPage schema" pass={tech.hasFAQSchema} detail={!tech.hasFAQSchema ? "Unlocks free FAQ rich results in Google search" : undefined} />
              <CheckRow label="Pricing page with PriceSpecification schema" pass={tech.hasPricingSchema} detail={!tech.hasPricingSchema ? "Can show your prices directly in search results" : undefined} />
              <CheckRow label="Review / Rating schema" pass={tech.hasReviewSchema} />
            </div>
          </div>
        )}

        {/* 14. CONVERSION TRACKING */}
        {tech && (
          <div style={DARK_CARD}>
            <div style={SECTION_LABEL}>📊 Conversion Tracking</div>
            <div style={{ fontSize: 16, color: "#64748B", marginBottom: 14, lineHeight: 1.6 }}>
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
          // Parse scored issues: format is "[10] 🔴 message"
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
                    <span style={{ fontSize: 16, color: "#64748B", fontWeight: 600 }}>{label} ({range})</span>
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
                    {/* Score badge */}
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
            <div style={{ background: "#0D152808", border: "1px solid #1E3050", borderRadius: 12, padding: "24px", marginBottom: 20 }}>
              <div style={{ ...SECTION_LABEL }}>🔍 Keyword Visibility</div>
              {keyword && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 16, color: "#64748B", marginBottom: 6, fontWeight: 700, letterSpacing: "0.08em" }}>PRIMARY KEYWORD DETECTED FROM PAGE</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 17, fontWeight: 600, color: "#F1F5F9", padding: "8px 14px", background: "#111827", border: "1px solid #1E3050", borderRadius: 8 }}>
                      &ldquo;{keyword}&rdquo;
                    </div>
                    {rankCheckUrl && (
                      <a href={rankCheckUrl} target="_blank" rel="noreferrer"
                        style={{ fontSize: 16, color: "#60A5FA", textDecoration: "none", padding: "8px 14px", border: "1px solid #60A5FA30", borderRadius: 8, transition: "border-color 160ms cubic-bezier(0.23,1,0.32,1), transform 160ms cubic-bezier(0.23,1,0.32,1)" }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#60A5FA80"; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#60A5FA30"; el.style.transform = ""; }}
                        onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
                        onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
                      >
                        Check Google Rankings →
                      </a>
                    )}
                    <a href={googleSearchUrl} target="_blank" rel="noreferrer"
                      style={{ fontSize: 16, color: "#94A3B8", textDecoration: "none", padding: "8px 14px", border: "1px solid #1E3050", borderRadius: 8, transition: "border-color 160ms cubic-bezier(0.23,1,0.32,1), transform 160ms cubic-bezier(0.23,1,0.32,1)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#374151"; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#1E3050"; el.style.transform = ""; }}
                      onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
                      onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
                    >
                      Site: Index Check →
                    </a>
                  </div>
                </div>
              )}
              {h1 && (
                <div style={{ marginBottom: 16, padding: "12px 16px", background: "#111827", borderRadius: 8, borderLeft: "3px solid #FBBF24" }}>
                  <div style={{ fontSize: 16, color: "#64748B", marginBottom: 4, fontWeight: 700, letterSpacing: "0.08em" }}>CURRENT H1 TAG</div>
                  <div style={{ fontSize: 16, color: "#F1F5F9", fontStyle: "italic" }}>&ldquo;{h1}&rdquo;</div>
                  {h1 && !h1.match(/[A-Z][a-z]+ (MO|Missouri|IL|Illinois|St\. Louis)/i) && (
                    <div style={{ fontSize: 16, color: "#FBBF24", marginTop: 6 }}>
                      ⚠ No city or state detected in H1 — missing local keyword signal
                    </div>
                  )}
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
                {[
                  { label: "LocalBusiness Schema", value: hasSchema, good: true },
                  { label: "FAQ Schema", value: hasFAQ, good: true },
                  { label: "Pricing Schema", value: hasPricing, good: true },
                ].map(({ label, value, good }) => (
                  <div key={label} style={{ padding: "10px 12px", background: "#111827", borderRadius: 8, border: `1px solid ${value ? "#10D9A030" : "#F8717120"}` }}>
                    <div style={{ fontSize: 16, color: "#64748B", marginBottom: 3, fontWeight: 700, letterSpacing: "0.06em" }}>{label}</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: value ? "#10D9A0" : "#F87171" }}>
                      {value ? `✓ Detected` : `✗ Missing`}
                    </div>
                  </div>
                ))}
              </div>
              {(!hasSchema || !hasFAQ) && (
                <div style={{ marginTop: 12, fontSize: 16, color: "#64748B", lineHeight: 1.6 }}>
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

        {/* CLOSING CTA — conditional based on score */}
        <div style={{ background: "#0D1528", border: "1px solid #1E3050", borderRadius: 12, padding: "36px", marginBottom: 12 }}>
          <h1 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800, color: "#F1F5F9", textAlign: "center", margin: "0 0 24px", letterSpacing: "-1px", lineHeight: 1.15 }}>
            We Find <span style={{ color: "#10D9A0" }}>Broken Websites</span>
          </h1>
          {audit.passes_one_second && audit.mobile_score >= 90 ? (
            // PASSING — curiosity pitch
            <>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#10D9A0", lineHeight: 1.4, marginBottom: 10, textAlign: "center" }}>
                Your site is fast — but is the rest of the story this good?
              </div>
              <div style={{ fontSize: 17, color: "#94A3B8", marginBottom: 28, lineHeight: 1.6, textAlign: "center" }}>
                Speed is just the first hurdle. Want to see how your Local SEO, Google Business Profile,<br />
                citations, and conversion tracking stack up against your competitors?
              </div>
            </>
          ) : (
            // FAILING — send to LocalSEOAEOPro
            <>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#F1F5F9", lineHeight: 1.4, marginBottom: 10, textAlign: "center" }}>
                We can have 49 of these problems fixed in 24 hours.
              </div>
              <div style={{ fontSize: 17, color: "#94A3B8", marginBottom: 28, lineHeight: 1.6, textAlign: "center" }}>
                98% of the changes on this report are done within 48 hours.<br />
                Citations take longer — but everything else moves fast.<br />
                <strong style={{ color: "#F1F5F9" }}>Click the link below to get started at LocalSEOAEOPro.com.</strong>
              </div>
            </>
          )}

          {/* Three contact options — LocalSEOAEOPro first, full width */}
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
                <span style={{ fontSize: 16, color: "#94A3B8" }}>jim@pingclose.com</span>
              </a>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <a href="/" style={{ fontSize: 16, color: "#475569", textDecoration: "none", transition: "color 160ms cubic-bezier(0.23,1,0.32,1)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#94A3B8"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#475569"; }}
          >← Run another audit at PingClose.com</a>
        </div>

      </div>

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes scoreReveal {
            from { opacity: 0; transform: scale(0.9); }
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
          @keyframes scoreReveal { from { opacity: 0; } to { opacity: 1; } }
          @keyframes checkRowIn  { from { opacity: 0; } to { opacity: 1; } }
          @keyframes pulse       { 50% { opacity: 0.6; } }
        }
        @media (hover: hover) and (pointer: fine) {
          a:active { opacity: 0.85; }
        }
      `}</style>
    </main>
  );
}
