# SUMMARY BODY 02

Source file: `
C:\Projects\pingclose\CLAUDE.md
`
Source lines: `
181
-
267
`
Preservation mode: line-preserved original content

## Preserved body

 181: - Layout balance
 182: - Visual rhythm
 183: - CTA prominence
 184: 
 185: ## Executive Design Critic (Run Before Approval)
 186: 
 187: Ask before finalizing any page:
 188: - How would Stripe improve this?
 189: - How would Linear improve this?
 190: - How would Vercel improve this?
 191: 
 192: Revise accordingly.
 193: 
 194: ## Messaging Strategy
 195: 
 196: Show: what was found
 197: Hide: how the proprietary analysis works
 198: 
 199: Create curiosity while maintaining authority.
 200: 
 201: ## Primary Conversion Goal
 202: 
 203: The visitor must think:
 204: "These people found problems I didn't know existed."
 205: 
 206: - Primary CTA: **Request Deep Analysis**
 207: - Secondary CTA: **See Sample Findings**
 208: 
 209: ## Phone & Contact
 210: 
 211: Jim Fogal · (314) 517-2533 · St. Louis, MO
 212: Closing line: "Ready to hear that phone ring?"
 213: 
 214: ---
 215: 
 216: # FOGAL'S FIRST LAW OF DEBUGGING
 217: 
 218: Before proposing any solution, list the five simplest explanations first.
 219: 
 220: Examples:
 221: - typo / bad input / missing config / permission problem / timeout setting
 222: - stale deployment / cache issue / null data / wrong environment / API limit
 223: 
 224: Prove or eliminate these first. The probability that the simple explanation is correct must be driven to zero before considering a more complex explanation.
 225: 
 226: No architecture changes may be proposed until simple explanations are eliminated.
 227: 
 228: ---
 229: 
 230: # PRE-COMMIT VERIFICATION STANDARD
 231: 
 232: Every task will be challenged and verified. Do not ask for commit approval until:
 233: 
 234: 1. Change is implemented
 235: 2. TypeScript passes (npx tsc --noEmit)
 236: 3. Build passes (npm run build)
 237: 4. Actual behavior is tested
 238: 5. Evidence is collected
 239: 
 240: Required proof before every commit request:
 241: - Exact files changed
 242: - Exact lines/functions changed
 243: - TypeScript result
 244: - Build result
 245: - Test performed
 246: - Proof the bug is fixed
 247: - Proof existing behavior still works
 248: - What could still fail
 249: - What cannot be proven without deployment
 250: 
 251: HARD STOP — justify in writing before proceeding if the solution:
 252: - adds a migration or new table
 253: - adds more than 3 files
 254: - adds more than 100 lines of code
 255: - adds a new service
 256: - changes architecture
 257: 
 258: ---
 259: 
 260: # DATABASE MIGRATION RULE
 261: 
 262: Never run ALTER TABLE, CREATE TABLE, or any schema change without:
 263: 1. Showing the exact SQL first
 264: 2. Explaining every column and why it is needed
 265: 3. Getting explicit written approval from Jim
 266: 
 267: No exceptions. Not even for additive, nullable changes.
