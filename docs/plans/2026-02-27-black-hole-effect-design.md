# Black Hole Effect — Design

**Goal:** Add a gravitational drain → singularity → explosion sequence to the glass galaxy intro. Particles spiral into a center point, pause, then blast back out to their resting positions before text reveals.

**Route:** `/intro-v2` (same test route)

**Stack:** Existing — GlassParticles.tsx (InstancedMesh), GSAP timeline, useFrame physics

---

## Full Sequence (~5–6s)

| Phase | Time | Event |
|-------|------|-------|
| Emerge | 0–1s | Particles scale in (existing depth-wave stagger) |
| Drain | 1–3s | Gravitational pull activates. Particles spiral inward toward center. Tangential velocity creates corkscrew. Far particles slower, near faster. |
| Collapse | 3–3.5s | All particles consumed into singularity point at center. Single emissive sphere pulses. |
| Pause | 3.5–4.5s | 1s tension build. Singularity glows. Screen nearly empty. |
| Explosion | 4.5–5s | Strong outward impulse. Particles blast radially, then damping + home-attraction pulls them to galaxy resting positions. |
| Settle + Text | 5–6s | Particles drift to rest. "CB.MEDIA" fades in. Tagline follows. Ambient drift + shooting stars resume. |

## Physics Model

All force math runs in GlassParticles useFrame. GSAP drives phase values — physics does the motion.

### Drain Phase

Each frame, per particle:
- `toCenter = normalize(center - position)` — gravitational pull direction
- `tangent = cross(toCenter, UP)` — perpendicular for spiral
- `velocity += toCenter * pullStrength + tangent * spinStrength`
- `velocity *= 0.92` — damping prevents overshoot
- `position += velocity`
- `pullStrength` ramps 0→max via animState.drainProgress (GSAP 0→1)

### Explosion Phase

- `fromCenter = normalize(position - center)` — radial push
- `velocity += fromCenter * explosionForce` — single strong impulse at trigger
- Then each frame: `toHome = normalize(home - position)`, `velocity += toHome * returnStrength`
- `velocity *= 0.88` — heavier damping for quick settle

### Key Technique: Home Positions

Each particle stores its original galaxy position. After explosion, particles naturally return to rest via attraction-to-home + damping. No per-particle GSAP tweens needed.

## AnimState Additions

```typescript
drainProgress: number      // 0→1 ramps gravitational pull strength
explodeProgress: number    // 0→1 triggers outward impulse
singularityScale: number   // 0→1→0 controls center point visibility/size
```

## Singularity Point

- Small sphere mesh (radius 0.05) at origin
- MeshBasicMaterial, emissive white with slight warm tint
- Scale driven by `singularityScale` — grows during collapse, pulses during pause, shrinks on explosion
- Lives in GalaxyScene.tsx alongside GlassParticles

## Files Changed

| File | Change |
|------|--------|
| `types.ts` | Add 3 new AnimState fields |
| `GlassParticles.tsx` | Add velocity arrays, home positions, phase-based force logic |
| `GalaxyScene.tsx` | Expand GSAP timeline (drain/pause/explode), add singularity mesh |

Everything else unchanged: Lighting, ShootingStars, GalaxyIntro, page.tsx.

## Performance

- 200 particles × vector math per frame = trivial CPU cost
- No new draw calls (singularity is 1 extra mesh)
- No shaders or GPGPU needed at this scale
- Target: 60fps maintained throughout sequence

## Key Decisions

- **CPU physics, not GSAP per-particle** — GSAP drives 3 phase values, useFrame does force math. More natural motion, cheaper.
- **Tangential velocity for spiral** — Cross product with UP vector. Without it, particles beeline to center (looks magnetic, not gravitational).
- **Multiplicative damping** — 0.92 drain, 0.88 explosion. Prevents overshoot, gives natural deceleration.
- **Home-position return** — Explosion particles self-organize back to galaxy layout via attraction. No coordinate choreography needed.
