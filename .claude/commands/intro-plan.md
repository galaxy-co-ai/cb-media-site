Load the cinematic intro plan and current build status. Use this at the start of every session working on the intro.

Do these steps in parallel:

1. **Read the active intro plan** from Obsidian:
   - Read `C:\Users\Owner\workspace\Obsidian\projects\CBMedia\research\cinematic-intro-concepts.md` (master log)
   - Determine which option is being built (A or B). If unclear, ask the user.
   - Read the corresponding detailed plan file:
     - Option A: `C:\Users\Owner\workspace\Obsidian\projects\CBMedia\research\intro-option-a-astronaut-blackhole.md`
     - Option B: `C:\Users\Owner\workspace\Obsidian\projects\CBMedia\research\intro-option-b-event-horizon.md`

2. **Check current code state:**
   - `git -C "C:/Users/Owner/workspace/cb-media-site" status`
   - `git -C "C:/Users/Owner/workspace/cb-media-site" log --oneline -5`
   - Check which intro files exist: Glob for `src/components/intro/**/*` and `src/shaders/**/*`

3. **Read the project CLAUDE.md** if not already in context:
   - `C:\Users\Owner\workspace\cb-media-site\CLAUDE.md`

Report format (keep tight):
- **Building:** Option A or B (one-line summary)
- **Current phase:** Which timeline phase we're working on (Drift/Pull/Accretion/Collapse/Transition)
- **Files created:** List of intro-related files that exist
- **Last commit:** Message + how recent
- **Next up:** What the plan says we should build next based on what exists vs. what's planned
- **Blockers:** Any known issues from previous sessions

Then immediately proceed to the user's task. This is a 30-second context load, not an exploration.
