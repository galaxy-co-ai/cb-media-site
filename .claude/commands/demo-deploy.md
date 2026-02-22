Quick deploy a demo intro for client review. Handles build verification, git, push, and Vercel deployment check.

## Steps

1. **Pre-flight checks** (run in parallel):
   - `pnpm build` — must pass clean. If it fails, fix errors before proceeding.
   - `git -C "C:/Users/Owner/workspace/cb-media-site" status` — check for uncommitted changes
   - Verify the demo route exists:
     - Glob for `src/app/demo/intro-a/page.tsx` and/or `src/app/demo/intro-b/page.tsx`

2. **If build passes and there are uncommitted changes:**
   - Stage relevant files (intro components, shaders, demo routes)
   - Commit with message: `feat(intro): [description of what's new in this demo]`
   - Push to origin/main (Vercel auto-deploys)

3. **Wait for Vercel deployment:**
   - Check deployment status: `vercel ls --token $VERCEL_TOKEN 2>/dev/null` or `gh api repos/[owner]/cb-media-site/deployments --jq '.[0].state'`
   - If available, check build logs for errors

4. **Verify live demo:**
   - Navigate Chrome to `https://cb-media-site.vercel.app/demo/intro-a` (or intro-b)
   - Take a screenshot for verification
   - Check for WebGL errors in console

5. **Report to user:**
   ```
   Demo Deploy — Option [A/B]

   Build: ✓ Clean
   Commit: [hash] — [message]
   Pushed: ✓ origin/main
   Vercel: ✓ Deployed | ⏳ Building | ✗ Failed

   Client URL: https://cb-media-site.vercel.app/demo/intro-[a/b]

   Screenshot: [attached if taken]
   ```

6. **Do NOT push without explicit user approval.** Always show the commit message and changed files first.
