Visual QA check for the cinematic intro. Takes a screenshot of the running intro and evaluates it against the plan.

## Steps

1. **Ensure dev server is running.** Check if port 3007 is active:
   ```
   curl -s -o /dev/null -w "%{http_code}" http://localhost:3007
   ```
   If not running, tell the user to start it with `pnpm dev` first.

2. **Navigate to the intro page** using Chrome MCP tools:
   - If building demos: navigate to `http://localhost:3007/demo/intro-a` or `http://localhost:3007/demo/intro-b` (ask which if unclear)
   - If wired into main site: navigate to `http://localhost:3007`

3. **Take a screenshot** using `mcp__claude-in-chrome__get_screenshot` or `mcp__claude-in-chrome__read_page`.

4. **Read the active plan** from Obsidian (the timeline breakdown table) to know what each phase should look like.

5. **Evaluate the screenshot** against the plan. Check for:
   - **Visual fidelity:** Do particles/effects look cinematic or amateur?
   - **Color accuracy:** Is the color palette matching (deep space blues/blacks, warm accretion whites/oranges)?
   - **Composition:** Are elements positioned correctly per the plan?
   - **Post-processing:** Is bloom visible? Vignette? Film grain? Chromatic aberration?
   - **Text rendering:** If hero text is visible, is typography correct (Montserrat 600, tracking 8%)?
   - **Performance:** Any visible jank, low framerate, or stuttering?

6. **Report format:**
   ```
   Visual QA — [Option A/B] — [Phase Name]

   Score: X/10

   Matches plan:
   - [what's working well]

   Issues:
   - [what needs attention, ranked by severity]

   Suggested fixes:
   - [specific code changes to address issues]
   ```

7. If the user provides a specific phase to check (e.g., "check the accretion phase"), use the browser console to manually advance the GSAP timeline to that timestamp before taking the screenshot.
