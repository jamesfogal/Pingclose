"use client";
import { useEffect, useRef, useState } from "react";
import { colors } from "@/lib/designTokens";

// Invisible at load (an IntersectionObserver watching a 1px sentinel can't
// affect first paint), so this never competes with the form for attention
// above the fold — it only appears once the visitor has scrolled past the
// hero and the "get them to fill out the form" moment has passed.
export default function StickyNav() {
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} style={{ position: "absolute", top: "100vh", left: 0, height: 1, width: 1 }} />
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: `${colors.void}E6`, backdropFilter: "blur(8px)",
        borderBottom: `1px solid ${colors.border}`,
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 28,
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        opacity: visible ? 1 : 0,
        transition: "transform 220ms cubic-bezier(0.23,1,0.32,1), opacity 220ms cubic-bezier(0.23,1,0.32,1)",
        pointerEvents: visible ? "auto" : "none",
      }}>
        <a href="/faq" style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary, textDecoration: "none" }}>Website Speed FAQ</a>
        <a href="/pricing" style={{ fontSize: 16, fontWeight: 600, color: colors.signal, textDecoration: "none" }}>See Pricing →</a>
      </header>
    </>
  );
}
