"use client";
import { useState } from "react";
import Link from "next/link";

const TEAL = "#10D9A0";
const NAVY = "#0D1528";
const BORDER = "#1E3050";

const faqs = [
  {
    q: "Why is my website slow?",
    schema: "The most common causes of a slow website are unoptimized images, cheap shared hosting, render-blocking JavaScript, no caching, and too many third-party scripts. Most local business websites fail on at least 3 of these simultaneously — and the business owner has no idea until a customer leaves and never comes back.",
    extended: "Every second your site takes to load, you lose 20% of your visitors. On mobile, 53% of people abandon a page that takes more than 3 seconds. The fix is rarely one thing — it's a combination of issues that compound each other. A proper site audit identifies all of them at once."
  },
  {
    q: "How do I check my website speed for free?",
    schema: "Google PageSpeed Insights is the most authoritative free tool for checking website speed — it uses the same data Google uses for ranking decisions. GTmetrix, Pingdom, and DebugBear also offer free speed tests. Enter your URL, run the test on mobile, and focus on Core Web Vitals scores rather than the overall performance number.",
    extended: "The mobile score is the one that matters most. Google uses mobile-first indexing, which means your mobile performance determines your search rankings — not how fast your site loads on a desktop computer in your office."
  },
  {
    q: "What is a good Google PageSpeed score?",
    schema: "A score of 90 or above is considered good by Google. Scores between 50–89 need improvement, and below 50 is poor. However, Google ranks based on Core Web Vitals — not the overall score. A site scoring 72 with good Core Web Vitals will outrank a site scoring 85 with poor ones.",
    extended: "Most local business websites score between 35–65 on mobile. The average WordPress site scores 42 on mobile. If your site is in that range, competitors with faster sites are outranking you before content even matters. The score is a symptom — Core Web Vitals are the actual diagnosis."
  },
  {
    q: "What is Core Web Vitals?",
    schema: "Core Web Vitals are three specific speed measurements Google uses as ranking factors: LCP (how fast the main content loads), INP (how fast the page responds to clicks), and CLS (how much the page jumps around while loading). Google confirmed these as official ranking signals in 2021.",
    extended: "Think of Core Web Vitals as Google's report card for your website's user experience. Failing any one of the three signals to Google that your site frustrates visitors — and Google will rank you below competitors who pass. Most local business sites fail at least one, usually LCP due to unoptimized images."
  },
  {
    q: "How fast should a website load in 2026?",
    schema: "Google's standard is under 2.5 seconds for LCP on mobile. The real competitive benchmark is under 1 second for initial page response. Websites loading in 1 second convert at 40%. By 3 seconds that drops to 29%. Every second costs you customers and search rankings simultaneously.",
    extended: "The 1-second benchmark isn't arbitrary — it's based on how human attention works. After 1 second, users notice the delay. After 3 seconds, over half leave. For local businesses where every phone call matters, a slow site is losing real revenue every single day it stays unfixed."
  },
  {
    q: "What is LCP and why does it matter?",
    schema: "LCP stands for Largest Contentful Paint — the time it takes for the biggest visible element on your page to fully load. Google considers under 2.5 seconds good, 2.5–4 seconds needs improvement, and over 4 seconds poor. It is one of three Core Web Vitals Google uses as ranking factors.",
    extended: "For most local business websites the LCP element is the hero image or main headline at the top of the page. A large uncompressed photo above the fold almost certainly causes a poor LCP score. Converting that one image to WebP format often moves LCP from poor to good in a single change."
  },
  {
    q: "What is TTFB?",
    schema: "TTFB stands for Time to First Byte — how long it takes a server to respond after a browser requests a page. Under 600ms is considered good. A high TTFB usually means hosting is too slow, the server is overloaded, or caching is not configured. It is the first speed measurement in the loading chain.",
    extended: "TTFB is the first thing that happens when someone visits your site. If your server is slow to respond, everything that follows is delayed regardless of how well everything else is optimized. Cheap shared hosting is the number one cause of high TTFB for local business websites."
  },
  {
    q: "What causes a slow loading website?",
    schema: "The top causes of slow websites are unoptimized images, cheap shared hosting, render-blocking JavaScript and CSS, no browser caching, too many third-party scripts, and a poorly configured content delivery network. Most slow local business sites have four to six of these problems simultaneously.",
    extended: "Images alone account for 60–70% of a typical webpage's total size. A single uncompressed hero image can add 2–3 seconds to load time. Combined with a slow host and render-blocking scripts, it's easy to see how local business sites accumulate 6–8 second load times without anyone noticing until rankings drop."
  },
  {
    q: "How do I fix a slow WordPress site?",
    schema: "To fix a slow WordPress site: convert images to WebP format, install a caching plugin, upgrade hosting, remove unused plugins, defer render-blocking JavaScript, and enable a CDN. These fixes together can improve a WordPress mobile score from 35 to 85 and cut load time in half.",
    extended: "WordPress sites are particularly vulnerable to slowness because of plugin bloat, unoptimized themes, and database overhead. The average WordPress site loads in 13.25 seconds on mobile — 13 times slower than the 1-second benchmark. A systematic cleanup targeting all issues at once produces the fastest measurable improvement."
  },
  {
    q: "Does website speed affect Google ranking?",
    schema: "Yes. Google confirmed page speed as a ranking factor in 2010 and made Core Web Vitals an official ranking signal in 2021. Slow sites rank below faster competitors when all other factors are equal. With mobile-first indexing, mobile speed is what Google judges first — not desktop.",
    extended: "Speed affects rankings both directly and indirectly. Directly through Core Web Vitals scores. Indirectly because slow sites have higher bounce rates and lower dwell time — both signals Google uses to judge whether a page satisfied the searcher. A slow site loses the ranking battle on two fronts simultaneously."
  },
  {
    q: "What is CLS in website performance?",
    schema: "CLS stands for Cumulative Layout Shift — a measure of how much a page visually jumps around while loading. A score under 0.1 is good. CLS happens when images load without defined dimensions, ads inject content, or fonts swap after render. It makes pages feel unstable and is a Core Web Vitals ranking factor.",
    extended: "You have experienced CLS when you go to click a button and the page shifts just as you tap — and you end up clicking the wrong thing. Google penalizes this because it creates a poor user experience. Setting explicit image dimensions and using font-display:swap fixes most CLS issues quickly."
  },
  {
    q: "How do I speed up my website on mobile?",
    schema: "To speed up a website on mobile: convert images to WebP and lazy load off-screen images, eliminate render-blocking scripts, use a CDN, minimize CSS and JavaScript, and upgrade to faster hosting. Mobile speed is judged separately from desktop and Google uses mobile speed first for ranking decisions.",
    extended: "Mobile optimization is different from desktop optimization. Mobile connections are slower, processors are weaker, and screens are smaller. An image that loads fine on desktop can destroy mobile performance. Google's mobile-first indexing means mobile score determines rankings — not desktop score."
  },
  {
    q: "What is lazy loading and does it help?",
    schema: "Lazy loading delays loading of off-screen images and videos until the user scrolls to them. It improves initial page load time because the browser only loads what is immediately visible. Enabling lazy loading on a typical local business website reduces initial page size by 40–60% and improves LCP scores significantly.",
    extended: "Without lazy loading, a browser tries to download every image on the page the moment someone visits — even images 10 scrolls below the fold that the visitor may never see. Lazy loading is one of the highest-impact, lowest-risk speed improvements available and should be standard on every local business website."
  },
  {
    q: "Does image size affect website speed?",
    schema: "Yes — images are the single biggest cause of slow websites, accounting for 60–70% of total page weight on most local business sites. An uncompressed hero image can be 2–5MB. The same image properly compressed to WebP format is typically 50–150KB — a 90% size reduction with no visible quality loss.",
    extended: "Most local business websites were built with images pulled straight from a phone camera or stock photo site — often 3–8MB each. A page with five of those images is asking visitors to download 20MB before they can read a single word. Converting to WebP and compressing properly is the single fastest performance win available."
  },
  {
    q: "What is WebP and should I use it?",
    schema: "WebP is a modern image format developed by Google that produces images 25–35% smaller than JPEG and 26% smaller than PNG with equal or better visual quality. Google recommends WebP for all web images. Using WebP instead of JPEG or PNG is one of the easiest ways to improve PageSpeed scores immediately.",
    extended: "All major browsers now support WebP including Chrome, Firefox, Safari, and Edge. There is no technical reason to use JPEG or PNG on a modern website. Every image should be WebP format. When old images are replaced with WebP versions, 301 redirects ensure no broken links and no link equity is lost."
  },
  {
    q: "How do I know if my hosting is slow?",
    schema: "Check TTFB (Time to First Byte) using Google PageSpeed Insights. A TTFB over 600ms indicates a slow server. Shared hosting from GoDaddy, Bluehost, or HostGator typically produces TTFB of 800ms–2000ms. Managed hosting providers like Kinsta or WP Engine typically produce TTFB under 200ms.",
    extended: "Hosting is the foundation everything else sits on. You can optimize every image and script perfectly but if the server takes 1.5 seconds just to respond, the site is already failing before the page even begins loading. Upgrading hosting is often the single highest-impact change a local business can make."
  },
  {
    q: "What is a render-blocking script?",
    schema: "A render-blocking script is a JavaScript or CSS file that forces the browser to stop building the page until the file fully downloads. Common culprits are Google Tag Manager, analytics scripts, chat widgets, and advertising pixels loaded in the page head. Each render-blocking script adds 100–500ms to load time.",
    extended: "Most local business websites accumulate render-blocking scripts over time — analytics, then a chat widget, then a Facebook pixel, then a heatmap tool. Each seems harmless alone but together they can add 2–3 seconds to every page load. Moving them to load after the page renders eliminates this completely."
  },
  {
    q: "How do I pass Core Web Vitals?",
    schema: "To pass Core Web Vitals: get LCP under 2.5 seconds by optimizing images and upgrading hosting, get INP under 200ms by reducing JavaScript execution, and get CLS under 0.1 by setting image dimensions and avoiding layout shifts. Most local business sites can pass all three with image optimization, hosting upgrades, and script cleanup.",
    extended: "Google Search Console shows your Core Web Vitals status for free — check it to see exactly where you are failing. The good news is that 80% of local business sites fail Core Web Vitals because of image issues alone. Fix the images and you often pass all three metrics in a single effort."
  },
  {
    q: "What is the difference between desktop and mobile speed scores?",
    schema: "Desktop and mobile scores are measured separately because mobile devices have slower processors and connections. A site can score 90 on desktop and 35 on mobile. Since Google uses mobile-first indexing, mobile score determines search rankings — not desktop score.",
    extended: "Many business owners feel good about their website speed because it loads fast on office WiFi on a desktop. That is not what Google measures. Google simulates a mid-range Android phone on a 4G connection. That test often reveals 3–4x worse performance than what you experience at your desk."
  },
  {
    q: "What is a CDN and do I need one?",
    schema: "A CDN (Content Delivery Network) stores copies of website files on servers worldwide so visitors load from the server closest to them. Cloudflare offers a free CDN that typically improves load times by 20–40% and adds DDoS protection. Most local business websites should be using a CDN.",
    extended: "Without a CDN, every visitor downloads files from one server in one location. A visitor loading a site hosted across the country adds unnecessary network latency to every single page load. Cloudflare's free tier takes minutes to set up and immediately improves speed for visitors anywhere in the country."
  },
  {
    q: "How much does it cost to fix website speed?",
    schema: "Professional website speed optimization costs $300–$2,000 for a comprehensive one-time fix at a boutique agency. Enterprise agencies charge $1,800–$4,800 per month. Freelancers charge $100–$500 for basic work. Pricing depends on site size, platform, and depth of work required. Always ask for a flat fee rather than hourly billing to avoid surprises.",
    extended: "The wide price range reflects the difference between someone installing a plugin and someone doing a comprehensive fix covering images, hosting, scripts, citations, and Google Business Profile. Ask any provider for before and after PageSpeed scores as proof of work before committing."
  },
  {
    q: "Who can fix my WordPress site speed?",
    schema: "WordPress speed specialists, local web agencies, and managed WordPress hosting providers all offer speed optimization services. Look for someone who addresses hosting, images, caching, and render-blocking scripts together — not just one issue in isolation. Ask for before and after PageSpeed scores as proof of results.",
    extended: "WordPress is the most common platform for local business websites and the most commonly broken one for speed. The combination of cheap hosting, unoptimized themes, plugin bloat, and uncompressed images creates a perfect storm. A specialist who addresses all of these together produces dramatically better results than fixing one at a time."
  },
  {
    q: "What does a website SEO cleanup include?",
    schema: "A comprehensive website SEO cleanup includes speed optimization, Core Web Vitals fixes, image conversion to WebP, 301 redirect cleanup, 404 error resolution, citation audit and correction, Google Business Profile optimization, and conversion tracking installation. The best cleanups also include FAQ and pricing pages built with schema markup to capture AI Overview and featured snippet traffic.",
    extended: "The FAQ and pricing pages are often the highest-ROI deliverable in any SEO cleanup. Most local businesses have no FAQ page — which means they are invisible to voice search, People Also Ask, and AI Overviews. A properly structured FAQ page can generate significant organic traffic within 60–90 days of indexing."
  },
  {
    q: "Why do citations matter for local SEO?",
    schema: "Citations — your business Name, Address, and Phone number listed across directories — must be identical everywhere for Google to trust your location data. Even small inconsistencies like 'St.' vs 'Street' or a missing suite number can prevent your business from appearing in Google's local 3-Pack. Citations are the number one reason local businesses fail to rank locally.",
    extended: "Google cross-references your business information across hundreds of directories to verify you are who you say you are. If Yelp says your phone number is one thing and YellowPages says another, Google gets confused and ranks you lower — or not at all. Fixing citations takes time because each directory must be contacted individually, but the ranking impact is significant and lasting."
  },
  {
    q: "Why is my business not showing up in Google Maps?",
    schema: "The top reasons a business does not appear in Google Maps are an incomplete or unverified Google Business Profile, inconsistent citations across directories, insufficient reviews, a slow website, and proximity factors. Google's 3-Pack favors businesses with complete profiles, consistent NAP data, and strong local signals across the web.",
    extended: "Getting into the Google 3-Pack is the most valuable real estate in local search — it appears above all organic results and captures the majority of local clicks. Most businesses that don't appear there are missing on multiple signals simultaneously. A full local SEO audit identifies exactly which signals are holding you back."
  },
  {
    q: "How long does it take to fix a slow website?",
    schema: "Most website speed fixes are completed within 24 hours of approval. Image optimization, script cleanup, caching configuration, and Core Web Vitals fixes are typically done same day. Citation corrections take 2–4 weeks because each directory must be contacted individually. Google's Core Web Vitals scores update on a 28-day rolling average.",
    extended: "PageSpeed score improvements are visible immediately after technical fixes. However, Google's ranking algorithm uses a 28-day average of real user data — so ranking improvements typically become visible 4–8 weeks after fixes are in place. Citations take longest because you are dealing with third-party directories on their own timelines."
  },
  {
    q: "What is the ROI of fixing website speed?",
    schema: "Every 1-second improvement in page load time increases conversions by 17%. A local business with 500 monthly visitors converting at 3% generates 15 leads per month. Improving speed by 2 seconds could increase that to 21 leads — 6 extra per month. At $200 average job value that is $1,200 per month in additional revenue.",
    extended: "Speed ROI compounds when combined with citation fixes, Google Business Profile optimization, and new keyword pages. Most local businesses see measurable ranking improvements within 60 days and additional inbound leads within 90. The question is not whether fixing your site generates ROI — it is how much you are currently losing by leaving it broken."
  },
  {
    q: "Do I need monthly SEO after the initial cleanup?",
    schema: "Yes — SEO requires ongoing maintenance. Competitors add pages weekly, Google updates its algorithm, citations drift over time, 404 errors accumulate, and new keyword opportunities emerge constantly. Monthly managed SEO typically costs $299–$500 per month and should include weekly site maintenance, Google Business Profile updates, and new page creation targeting keyword gaps.",
    extended: "Think of a one-time cleanup as getting your car fully serviced. Monthly management is the oil change and tune-up that keeps it winning. Most businesses that do monthly managed SEO pick up one to two additional jobs per month from improved rankings — which pays for the service many times over."
  },
  {
    q: "What conversion tracking should my website have?",
    schema: "Every local business website should have Google Analytics 4, Google Tag Manager, Facebook Pixel, and TikTok Pixel installed. This tracks exactly where visitors come from, which pages they visit, where they drop off, and which traffic sources generate actual calls and form submissions — data most local businesses are currently missing entirely.",
    extended: "Most local businesses spend money on advertising without knowing which ads actually generate phone calls. Conversion tracking answers that question definitively. Knowing that 60% of leads come from Google organic but 0% from Facebook — despite $500 per month in Facebook spend — changes business decisions immediately and permanently."
  },
  {
    q: "How is a speed audit tool different from a full SEO fix?",
    schema: "Speed audit tools like GTmetrix and Google PageSpeed Insights identify problems but do not fix them. A full SEO fix addresses speed, citations, Google Business Profile, conversion tracking, and content gaps in one engagement. The audit shows you the score — the fix changes it. Most local businesses need both to see real ranking improvements.",
    extended: "Running a speed audit and doing nothing with the results is like getting a medical diagnosis and not taking the medicine. The audit has value only when it leads to action. A comprehensive fix that addresses all identified issues at once produces faster and more durable improvements than fixing one issue at a time over many months."
  },
];

function CTAButton() {
  return (
    <div style={{
      textAlign: "center",
      margin: "32px 0",
      padding: "24px",
      background: NAVY,
      border: `1px solid ${BORDER}`,
      borderRadius: 12
    }}>
      <Link href="/#top" style={{
        display: "inline-block",
        background: "transparent",
        border: `2px solid ${TEAL}`,
        borderRadius: 8,
        padding: "12px 28px",
        color: TEAL,
        fontSize: 17,
        fontWeight: 600,
        textDecoration: "none"
      }}>
        Have you Pinged your site yet? →
      </Link>
    </div>
  );
}

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (i: number) => setOpen(open === i ? null : i);

  // FAQPage JSON-LD schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.schema
      }
    }))
  };

  return (
    <main style={{ minHeight: "100vh", background: "#0B0E16", color: "#F1F5F9", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Header */}
      <div style={{ background: NAVY, borderBottom: `1px solid ${BORDER}`, padding: "48px 24px 40px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <Link href="/" style={{ fontSize: 24, fontWeight: 800, color: TEAL, textDecoration: "none", letterSpacing: "-0.5px" }}>
            Ping<span style={{ color: "#F1F5F9" }}>Close</span>
          </Link>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, margin: "20px 0 12px", letterSpacing: "-1px" }}>
            Website Speed & SEO Questions
          </h1>
          <p style={{ fontSize: 18, color: "#94A3B8", margin: "0 0 16px", lineHeight: 1.6 }}>
            30 of the most common questions local business owners ask about website speed, Google rankings, and local SEO.
          </p>
          <div style={{
            display: "inline-block",
            fontSize: 16,
            color: TEAL,
            background: TEAL + "15",
            border: `1px solid ${TEAL}30`,
            borderRadius: 6,
            padding: "6px 16px"
          }}>
            ✓ Updated June 2026 — reviewed and updated monthly to reflect the latest changes in SEO, AEO, and Google ranking signals
          </div>
        </div>
      </div>

      {/* FAQ List */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 80px" }}>

        {faqs.map((faq, i) => (
          <div key={i}>
            {/* FAQ Item */}
            <div style={{
              borderBottom: `1px solid ${BORDER}`,
              padding: "4px 0"
            }}>
              {/* Question */}
              <button
                onClick={() => toggle(i)}
                style={{
                  width: "100%", background: "none", border: "none",
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  gap: 16, padding: "16px 0", cursor: "pointer", textAlign: "left"
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9", lineHeight: 1.4 }}>
                  {faq.q}
                </span>
                <span style={{
                  fontSize: 22, color: TEAL, flexShrink: 0, marginTop: 2,
                  transform: open === i ? "rotate(45deg)" : "none",
                  transition: "transform 0.2s"
                }}>+</span>
              </button>

              {/* Answer */}
              {open === i && (
                <div style={{ paddingBottom: 20 }}>
                  {/* Schema answer — direct box */}
                  <div style={{
                    borderLeft: `3px solid ${TEAL}`,
                    paddingLeft: 16,
                    marginBottom: 14,
                    background: TEAL + "08",
                    borderRadius: "0 8px 8px 0",
                    padding: "14px 16px"
                  }}>
                    <p style={{ fontSize: 17, color: "#F1F5F9", margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                      {faq.schema}
                    </p>
                  </div>
                  {/* Extended content */}
                  <p style={{ fontSize: 16, color: "#94A3B8", margin: 0, lineHeight: 1.7, paddingLeft: 4 }}>
                    {faq.extended}
                  </p>
                </div>
              )}
            </div>

            {/* CTA every 3-4 questions */}
            {(i === 2 || i === 6 || i === 10 || i === 14 || i === 18 || i === 22 || i === 26 || i === 29) && (
              <CTAButton />
            )}
          </div>
        ))}

        {/* Bottom CTA */}
        <div style={{
          marginTop: 48,
          background: NAVY,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          padding: "40px 32px",
          textAlign: "center"
        }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 12px", letterSpacing: "-0.5px" }}>
            Ready to hear that phone ring?
          </h2>
          <p style={{ fontSize: 18, color: "#94A3B8", margin: "0 0 28px", lineHeight: 1.6 }}>
            Find out exactly what's keeping your site from ranking.<br />
            Free. No account needed. Results in 60 seconds.
          </p>
          <Link href="/" style={{
            display: "inline-block",
            background: TEAL,
            color: "#0B0E16",
            fontSize: 18,
            fontWeight: 700,
            padding: "16px 40px",
            borderRadius: 10,
            textDecoration: "none"
          }}>
            Ping My Site — It&apos;s Free →
          </Link>
          <div style={{ marginTop: 16 }}>
            <Link href="/pricing" style={{ fontSize: 16, color: "#475569", textDecoration: "none" }}>
              See what it costs to fix it →
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
