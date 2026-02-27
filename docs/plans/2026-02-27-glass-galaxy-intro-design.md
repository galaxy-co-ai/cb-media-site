# Glass Galaxy Intro — Design

**Goal:** Replace the canvas 2D starfield intro with a Three.js glass particle galaxy — same scene concept (starfield, parallax, shooting stars, luxury mood) but with high-quality refractive glass spheres instead of flat dots.

**Route:** `/intro-v2` (test route, swap to production when polished)

**Stack:** React Three Fiber 9, drei, GSAP, Three.js MeshPhysicalMaterial

---

## Scene Overview

A dark, warm-toned galaxy of ~150 floating glass spheres. Refractive orbs at varying depths create an infinite starfield effect. Occasional glass fragments streak across as shooting stars. Text reveals quickly (~2s) as an HTML overlay. Subtle camera parallax on mouse move.

## Particle System

- **InstancedMesh** with SphereGeometry (16 segments — smooth enough for refraction)
- **3 size tiers:**
  - Tiny distant stars (70%) — radius ~0.02–0.04
  - Medium mid-field (25%) — radius ~0.06–0.12
  - Hero orbs near camera (5%) — radius ~0.15–0.25
- **MeshPhysicalMaterial:** transmission 0.92, iridescence 0.3, clearcoat 1.0, IOR 1.45, thickness 0.5
- **Depth distribution:** z from -20 (far) to +1 (near camera) — natural parallax layers
- **Ambient drift:** Each particle has slow random velocity vector, gently floating

## Shooting Stars

- Separate small pool (~3 instances), reused on timer
- Elongated sphere geometry, high emissive white + slight warm tint
- Streak diagonally across at speed, fade via opacity
- Fire every 3–5 seconds (randomized interval)

## Atmosphere

- **Background:** Near-black with warm undertone (`#0a0806`)
- **Fog:** Dark warm amber, creates depth fade on distant particles
- **Environment lighting:** Low-key Lightformers — warm key light, cool rim — just enough for glass to catch reflections

## Animation Flow (~2s total)

| Time | Event |
|------|-------|
| 0–0.8s | Particles scale 0→1, staggered (far first, near last = depth wave) |
| 0.5–1.5s | "CB.MEDIA" headline fades in (HTML overlay) |
| 1.2–2.0s | Tagline fades in |
| 2.0s+ | Ambient drift begins, shooting stars activate |

## Cursor Interaction

- Mouse position → subtle camera offset (±0.3 units max)
- Near particles shift more than far (natural 3D parallax)
- Smooth lerp (0.05 factor per frame) — no snapping

## Scroll Behavior

- Content rises over the scene (z-index layering, same as current)
- Particles continue drifting behind content
- No scroll-driven particle effects — clean transition

## Performance Tiers

| Tier | GPU | Behavior |
|------|-----|----------|
| 0 | Fallback | Static HTML "CB.MEDIA" on black |
| 1 | Low | Particles without transmission (opaque glass) |
| 2–3 | Mid–High | Full transmission + iridescence |

Target: 60fps on mid-range laptops.

## Text Rendering

- HTML overlay (not WebGL — proven reliable from v2 debugging)
- Same fonts/sizing as current hero (Montserrat 600 headline, Space Grotesk tagline)
- Driven by GSAP timeline opacity animation
- `pointer-events: none` — doesn't block scroll or click

## Files (Expected)

```
src/components/intro-v2/
├── types.ts              # AnimState interface (exists)
├── quality.ts            # GPU tier detection (exists)
├── GlassParticles.tsx    # InstancedMesh glass starfield (NEW)
├── ShootingStars.tsx     # Shooting star pool (NEW)
├── Lighting.tsx          # Environment + Lightformers (modify)
├── GalaxyScene.tsx       # Scene orchestrator (replaces CrystalScene)
├── CrystalIntro.tsx      # Canvas wrapper + HTML overlay (modify)
└── CrystalGeometry.ts    # DELETE (no longer needed)
```

## Key Decisions

- **Glass spheres, not shards** — reads as galaxy stars, not broken glass
- **HTML text overlay** — drei Text/troika hangs Suspense; HTML is reliable
- **No per-particle cursor tracking** — camera shift gives parallax cheaply; glass materials are already visually rich
- **~2s intro** — client wants shorter than current; depth-wave stagger + text fade is tight and premium
- **Warm dark atmosphere** — premium, less techy than navy void
