# Crystal Intro V2 — Design Document

**Date:** 2026-02-27
**Route:** `/intro-v2` (hidden page, standalone)
**Goal:** Replace the current "Event Horizon" intro with a studio-grade glass/refraction experience

---

## Concept

An irregular crystalline polyhedron made of refractive glass emerges from darkness, pauses, then dissolves into hundreds of glass shards that scatter and settle around the "CB.MEDIA" brand name. After a ~4.5s autoplay brand moment, the shard field becomes scroll-driven — the user explores the glass world at their own pace before transitioning into site content.

**Visual world:** Liquid / glass / refraction
**Emotion arc:** Curiosity → awe → recognition → control
**Reference energy:** igloo.inc — tactile, physical, mesmerizing

---

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Visual theme | Glass / refraction | Premium materials, igloo.inc energy |
| Narrative | Controlled fragmentation | Precision → expansion → resolution |
| Pacing | Hybrid: ~2s autoplay → scroll-driven | Award-winner standard, no passive waiting |
| Text rendering | WebGL (troika-three-text) | Same lighting/post-FX, no DOM seam |
| Text material | Chrome-glass MeshPhysicalMaterial | Readable but physically lit |
| Color | Monochrome + prismatic accents | Color earned through refraction, not forced |
| Hero form | Irregular crystalline polyhedron | Natural fracture planes, best refraction |
| Dissolution | Pre-shattered (Approach A) | 1 InstancedMesh, 1 draw call, proven pattern |
| Mobile | Full 3D, detect-gpu adaptive tiers | Same experience, scaled quality |
| Post-FX | Declarative @react-three/postprocessing v3.0.4 | React 19 compatible |

---

## Visual Sequence

### Phase 1: Emergence (0–1.5s) — Autoplay

Black screen → point of light → crystalline form materializes. Camera starts tight, pulls back. Crystal rotates slowly (~0.1 rad/s). Bloom ramps from 0 → peak.

The crystal is secretly 300-500 shards assembled at zero gap (InstancedMesh).

### Phase 2: Dissolution (1.5–3s) — Autoplay

Rotation pauses. 200ms stillness beat. Shards separate outward — not an explosion, a bloom. Center-out radial stagger (~0.002s per shard). Each shard catches light at its unique angle, prismatic edges flash. Easing: `power2.out`.

### Phase 3: Reveal (3–4.5s) — Autoplay bleeds into scroll

Shards settle into dispersed field. "CB.MEDIA" materializes through the gaps — text was always there, crystal was blocking it. Tagline appears 0.5s after. Scroll indicator fades in. Autoplay ends.

### Phase 4: Scroll Depth (scroll-driven)

Scroll → shards drift further apart (parallax), camera moves through field (z-translation), text scales subtly. At ~100vh: shards dispersed to edges, seamless transition to dark content sections.

---

## Geometry & Materials

### Crystal Generation (Procedural, Runtime)

1. `IcosahedronGeometry(1, 1)` → 80 triangular faces
2. Perlin noise vertex displacement (amplitude ~0.05) → organic irregularity
3. Subdivide faces into 3-6 sub-triangles → 300-500 shard shapes
4. Each shard: BufferGeometry with centroid, normal, "home" position
5. Pack into single `InstancedMesh(shardGeo, material, count)`

### Shard Material

```typescript
new MeshPhysicalMaterial({
  transmission: 0.92,
  thickness: 0.5,
  roughness: 0.05,
  ior: 1.45,
  clearcoat: 1.0,
  clearcoatRoughness: 0.03,
  iridescence: 0.3,
  iridescenceIOR: 1.3,
  envMapIntensity: 1.2,
  color: 0xffffff,
})
```

### Text Material (Chrome-Glass)

```typescript
new MeshPhysicalMaterial({
  metalness: 0.15,
  roughness: 0.08,
  clearcoat: 1.0,
  clearcoatRoughness: 0.02,
  envMapIntensity: 1.5,
  emissive: 0xffffff,
  emissiveIntensity: 0.04,
})
```

---

## Lighting

- **HDR environment map** — dark studio HDRI, self-hosted
- `scene.environmentIntensity = 0.8`
- **Key lightformer** — warm white strip, upper-right, primary specular
- **Rim lightformer** — cool white rect, behind-left, edge separation
- No DirectionalLight/PointLight — studio photography approach (light the environment)

---

## Post-Processing

| Effect | Settings | Mobile |
|--------|----------|--------|
| Bloom | intensity 0.4, threshold 0.8, radius 0.6 | Yes (reduced) |
| ChromaticAberration | offset [0.0006, 0.0006], radial | Desktop only |
| Vignette | offset 0.3, darkness 0.7 | Yes |
| ToneMapping | AgX (built-in) | Yes (free) |

Declarative `<EffectComposer>` via `@react-three/postprocessing` v3.0.4.

---

## Animation Architecture

### AnimState Pattern (Mutable, No React State)

```typescript
const animState = {
  crystalScale: 0,
  rotationSpeed: 0.1,
  dissolutionProgress: 0,
  textOpacity: 0,
  taglineOpacity: 0,
  scrollInfluence: 0,
  bloomIntensity: 0,
  caOffset: 0,
}
```

GSAP drives values. `useFrame` reads every frame. Zero React re-renders.

### Scroll Integration

Lenis for smooth scroll normalization. ScrollTrigger maps scroll position to animState:
- Shard spread: `baseDissolution + scrollProgress * 0.5`
- Camera Z: `baseZ + scrollProgress * 2`
- Text scale: `1 + scrollProgress * 0.03`
- Shard opacity: `1 - scrollProgress * 0.3`

### Skip Mechanism

Click/keypress during autoplay → `timeline.progress(1)` → 300ms ease to settled state.

---

## Adaptive Quality

```
Tier 3 (flagship):  500 shards, DPR 2, full post-FX
Tier 2 (mid):       300 shards, DPR 1.5, bloom + vignette only
Tier 1 (low):       150 shards, DPR 1, bloom only, no transmission
Tier 0 (blocked):   Static image fallback
```

Runtime: `<PerformanceMonitor>` reduces DPR and shard count if FPS < 30.

---

## File Architecture

```
src/
├── app/intro-v2/
│   └── page.tsx                  # Hidden route, server component
├── components/intro-v2/
│   ├── CrystalIntro.tsx          # Canvas + orchestrator
│   ├── CrystalScene.tsx          # Scene graph, animState, GSAP timeline
│   ├── CrystalGeometry.ts        # Procedural crystal → shard data
│   ├── CrystalShards.tsx         # InstancedMesh + dissolution
│   ├── BrandText.tsx             # troika-three-text + chrome-glass
│   ├── Lighting.tsx              # HDR env + lightformers
│   ├── PostFX.tsx                # Declarative EffectComposer
│   ├── ScrollController.tsx      # Lenis + ScrollTrigger → animState
│   └── quality.ts                # detect-gpu tiers + perf config
```

8 files, single responsibility each, no file over ~200 lines.

---

## Integration Path

1. Build and tune on `/intro-v2` (standalone, no site dependencies)
2. When approved: swap dynamic import in `HomeClient.tsx`
3. Wire `onComplete` callback for hero text reveal
4. Remove old `src/components/intro/` directory
5. Future: potentially rebuild full site sections on this hidden page
