"use client";
import { colors } from "@/lib/designTokens";

function playPing() {
  try { new Audio("/sounds/ping.mp3").play(); } catch { /* ignore */ }
}

// Isolated client component for the one interactive element in the
// (below-the-fold) hurdle section — keeps this section's JS out of the
// critical path entirely, it's not needed until well after first paint.
export default function PingCtaButton() {
  return (
    <button
      onClick={() => { playPing(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
      style={{ background: colors.signal, color: colors.void, fontSize: 18, fontWeight: 700, padding: "16px 40px", borderRadius: 10, border: "none", cursor: "pointer", transition: "transform 160ms cubic-bezier(0.23,1,0.32,1), box-shadow 160ms cubic-bezier(0.23,1,0.32,1)" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 10px 28px ${colors.signal}40`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
      onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
      onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
    >
      Ping My Site — It&apos;s Free →
    </button>
  );
}
