R3F performance audit for the cinematic intro. Run before any client demo deployment.

## Steps

1. **Check GPU tier configuration:**
   - Read the intro component that calls `detect-gpu`
   - Verify all three tiers are handled:
     - Tier 3: Full experience (100K+ particles, all post-processing)
     - Tier 2: Reduced (25K particles, minimal post-processing)
     - Tier 1: CSS-only fallback (no WebGL)
   - Verify `prefers-reduced-motion` is respected

2. **Audit particle system:**
   - Check GPGPU texture dimensions vs particle count
   - Verify `THREE.Points` is used (not individual meshes)
   - Check that `depthWrite: false` and appropriate blending mode are set
   - Confirm particle count scales with GPU tier

3. **Audit post-processing:**
   - Are all effects in a single `<EffectComposer>`? (merges into one pass)
   - Is `multisampling` set appropriately?
   - Are effects disabled on lower tiers?

4. **Audit React rendering:**
   - Search for components inside `useFrame` callbacks (causes re-renders)
   - Check that materials/geometries are created outside render loop (useMemo)
   - Verify `dispose` is handled (R3F auto-disposes, but custom objects may not)
   - Check for state updates inside `useFrame` (kills performance)

5. **Audit canvas configuration:**
   ```tsx
   <Canvas
     gl={{
       powerPreference: "high-performance",  // ✓ required
       antialias: false,                      // ✓ handle in post-processing
       stencil: false,                        // ✓ skip if unused
       alpha: false,                          // ✓ skip if not needed
     }}
     dpr={Math.min(window.devicePixelRatio, 2)}  // ✓ cap DPR
     frameloop="always"                           // ✓ during intro, "demand" after
   />
   ```

6. **Check bundle impact:**
   - Is the intro dynamically imported? (`dynamic(() => import(...), { ssr: false })`)
   - Run `pnpm build` and check `.next/analyze` output size if available
   - Three.js tree-shaking: are we importing `three` or specific modules?

7. **Mobile checks:**
   - Is DPR capped at 1.5 on mobile?
   - Is particle count reduced?
   - Is intro duration shortened (4s vs 8s)?
   - Is there a timeout that skips intro if FPS drops below 24?

8. **Report format:**
   ```
   R3F Performance Audit

   Score: X/10

   GPU Tiers: ✓ All configured | ✗ Missing tier X
   Particles: [count] at [texture size] — OK/TOO HIGH for tier
   Post-processing: [N] effects in [N] passes — OK/NEEDS MERGE
   React: [N] issues found
   Bundle: Intro chunk ~[X]KB — OK/NEEDS SPLIT
   Mobile: ✓ Optimized | ✗ [issues]

   Action items:
   1. [fix, ranked by impact]
   ```
