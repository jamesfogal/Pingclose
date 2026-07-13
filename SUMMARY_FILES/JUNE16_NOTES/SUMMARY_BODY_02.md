# SUMMARY BODY 02

Source file: `
C:\Projects\pingclose\JUNE16_NOTES.md
`
Source lines: `
181
-
207
`
Preservation mode: line-preserved original content

## Preserved body

 181: 
 182: ### Security Issues (Fix Before Showing Anyone)
 183: - platform_config table — RLS disabled, Resend API key exposed
 184: - email_verifications table — RLS disabled, verification codes exposed
 185: - Fix: `ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;`
 186: 
 187: ---
 188: 
 189: ## What Needs to Happen Next Session
 190: 
 191: ### PingClose (in order)
 192: 1. Log into vercel.com → PingClose → Settings → Environment Variables → confirm PAGESPEED_API_KEY is set for Production
 193: 2. Get legacy eyJ... JWT service role key from Supabase Settings → API → fix Supabase saves
 194: 3. Fix H1 typo: "Websiteon" → "Website on"
 195: 4. Switch DNS on Namecheap from Netlify to Vercel
 196: 5. Enable RLS on platform_config and email_verifications tables
 197: 
 198: ### LocalSEOAEOPro (Session 3)
 199: 1. Build 7 intelligence agents: SocialPresenceScanner, TrackingPixelDetector, TechStackIdentifier, NAPConsistencyChecker, SSLCertificateMonitor, RedirectChainDetector, ProspectQualificationScorer
 200: 2. Fix fake data in 6 modules before showing any client
 201: 3. Begin Phase 2 of AI OS — Data Source Gateway
 202: 
 203: ---
 204: 
 205: *File created: June 16, 2026*
 206: *Created because Claude's memory system failed to persist notes across sessions.*
 207: *Going forward: update this file at the end of every session and commit to git.*
