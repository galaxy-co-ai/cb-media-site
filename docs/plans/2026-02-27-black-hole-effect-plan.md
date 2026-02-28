# Black Hole Effect Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add gravitational drain → singularity → explosion sequence to the glass galaxy intro so particles spiral into a center point, pause, then blast back out before text reveals.

**Architecture:** GSAP drives 3 new animState fields (`drainProgress`, `explodeProgress`, `singularityScale`). GlassParticles reads these in useFrame to apply per-particle gravitational forces, tangential spiral velocity, and explosion impulse. A small singularity mesh in GalaxyScene pulses at the center. Text reveals after particles settle.

**Tech Stack:** Existing — React Three Fiber 9, drei, GSAP, Three.js MeshPhysicalMaterial

**Known Gotchas:**
- drei `<Text>` hangs Suspense — text is already HTML overlay, don't touch it
- `@react-three/postprocessing` 3.x crashes with R3F 9 — do NOT add bloom post-processing
- rAF effects must check refs inside tick function
- Dev server: `pnpm dev` → http://localhost:3007/intro-v2

---

### Task 1: Update types.ts — add black hole AnimState fields

**Files:**
- Modify: `src/components/intro-v2/types.ts`

**Step 1: Replace types.ts**

```typescript
/** Shared mutable animation state — GSAP writes, R3F + HTML overlay read each frame */
export interface AnimState {
  particleScale: number     // 0→1 during intro emergence
  drainProgress: number     // 0→1 ramps gravitational pull strength
  explodeProgress: number   // 0→1 triggers outward impulse (use as one-shot flag)
  singularityScale: number  // 0→1→0 controls center point size
  textOpacity: number       // 0→1 headline
  taglineOpacity: number    // 0→1 tagline
  scrollInfluence: number   // reserved for production integration
}

export function createAnimState(): AnimState {
  return {
    particleScale: 0,
    drainProgress: 0,
    explodeProgress: 0,
    singularityScale: 0,
    textOpacity: 0,
    taglineOpacity: 0,
    scrollInfluence: 0,
  }
}
```

**Step 2: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | head -10`
Expected: Clean (new fields are additive, no breaking changes).

**Step 3: Commit**

```bash
git add src/components/intro-v2/types.ts
git commit -m "feat(intro-v2): add black hole AnimState fields (drain, explode, singularity)"
```

---

### Task 2: Rewrite GlassParticles.tsx — phase-based physics

**Files:**
- Modify: `src/components/intro-v2/GlassParticles.tsx`

This is the core change. Particles now store home positions and velocity vectors. The useFrame loop switches between phases based on animState: emerge → drain (spiral toward center) → collapsed (hidden) → explode (blast outward) → settle (drift to home).

**Step 1: Replace GlassParticles.tsx**

```tsx
'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { QualityConfig } from './quality'
import type { AnimState } from './types'

const _matrix = new THREE.Matrix4()
const _position = new THREE.Vector3()
const _quaternion = new THREE.Quaternion()
const _scale = new THREE.Vector3()
const _toCenter = new THREE.Vector3()
const _tangent = new THREE.Vector3()
const _UP = new THREE.Vector3(0, 1, 0)

interface Particle {
  // Current position
  x: number; y: number; z: number
  // Velocity
  vx: number; vy: number; vz: number
  // Home (resting) position — return target after explosion
  homeX: number; homeY: number; homeZ: number
  // Visual
  radius: number
  twinkleSpeed: number
  twinklePhase: number
}

interface GlassParticlesProps {
  quality: QualityConfig
  animState: AnimState
}

function generateParticles(count: number): Particle[] {
  const particles: Particle[] = []

  for (let i = 0; i < count; i++) {
    const tier = i < count * 0.05 ? 'hero'
      : i < count * 0.30 ? 'medium'
      : 'tiny'

    const radius = tier === 'hero'
      ? 0.15 + Math.random() * 0.1
      : tier === 'medium'
        ? 0.06 + Math.random() * 0.06
        : 0.02 + Math.random() * 0.02

    const x = (Math.random() - 0.5) * 14
    const y = (Math.random() - 0.5) * 9
    const z = -20 + Math.random() * 21

    particles.push({
      x, y, z,
      vx: 0, vy: 0, vz: 0,
      homeX: x, homeY: y, homeZ: z,
      radius,
      twinkleSpeed: 0.3 + Math.random() * 0.7,
      twinklePhase: Math.random() * Math.PI * 2,
    })
  }

  return particles
}

export function GlassParticles({ quality, animState }: GlassParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const count = quality.particleCount
  const explodedRef = useRef(false)

  const particles = useMemo(() => generateParticles(count), [count])

  const geometry = useMemo(() => new THREE.SphereGeometry(1, 16, 12), [])

  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      iridescence: 0.3,
      iridescenceIOR: 1.3,
      envMapIntensity: 1.2,
      transparent: true,
      opacity: 1,
      side: THREE.FrontSide,
    })

    if (quality.transmission) {
      mat.transmission = 0.92
      mat.thickness = 0.5
      mat.ior = 1.45
    } else {
      mat.opacity = 0.85
      mat.metalness = 0.1
    }

    return mat
  }, [quality.transmission])

  useFrame(({ clock }) => {
    if (!meshRef.current) return

    const time = clock.getElapsedTime()
    const {
      particleScale,
      drainProgress,
      explodeProgress,
      singularityScale,
    } = animState

    // Detect explosion trigger (one-shot: when explodeProgress crosses 0→positive)
    if (explodeProgress > 0 && !explodedRef.current) {
      explodedRef.current = true
      // Apply outward impulse to all particles from center
      for (let i = 0; i < count; i++) {
        const p = particles[i]
        const dx = p.homeX
        const dy = p.homeY
        const dz = p.homeZ
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
        const force = 0.8 + Math.random() * 0.4
        p.vx = (dx / dist) * force
        p.vy = (dy / dist) * force
        p.vz = (dz / dist) * force
        // Reset position near center for the blast
        p.x = (Math.random() - 0.5) * 0.1
        p.y = (Math.random() - 0.5) * 0.1
        p.z = (Math.random() - 0.5) * 0.1
      }
    }

    const isDraining = drainProgress > 0 && singularityScale < 0.95
    const isExploded = explodedRef.current

    for (let i = 0; i < count; i++) {
      const p = particles[i]

      if (isDraining && !isExploded) {
        // === DRAIN PHASE: spiral toward center ===
        _toCenter.set(-p.x, -p.y, -p.z)
        const dist = _toCenter.length()

        if (dist > 0.01) {
          _toCenter.normalize()
          // Tangential velocity for spiral (cross product with UP)
          _tangent.crossVectors(_toCenter, _UP).normalize()

          const pullStrength = drainProgress * 0.015
          const spinStrength = drainProgress * 0.008 * Math.max(0.2, 1 - drainProgress)

          p.vx += _toCenter.x * pullStrength + _tangent.x * spinStrength
          p.vy += _toCenter.y * pullStrength + _tangent.y * spinStrength
          p.vz += _toCenter.z * pullStrength + _tangent.z * spinStrength
        }

        // Damping
        p.vx *= 0.92
        p.vy *= 0.92
        p.vz *= 0.92

        p.x += p.vx
        p.y += p.vy
        p.z += p.vz

      } else if (isExploded) {
        // === EXPLOSION + SETTLE PHASE: blast out then return home ===
        const toHomeX = p.homeX - p.x
        const toHomeY = p.homeY - p.y
        const toHomeZ = p.homeZ - p.z
        const homeDist = Math.sqrt(toHomeX * toHomeX + toHomeY * toHomeY + toHomeZ * toHomeZ)

        if (homeDist > 0.01) {
          const returnStrength = 0.003
          p.vx += (toHomeX / homeDist) * returnStrength * homeDist
          p.vy += (toHomeY / homeDist) * returnStrength * homeDist
          p.vz += (toHomeZ / homeDist) * returnStrength * homeDist
        }

        // Heavier damping for quick settle
        p.vx *= 0.88
        p.vy *= 0.88
        p.vz *= 0.88

        p.x += p.vx
        p.y += p.vy
        p.z += p.vz

      } else {
        // === EMERGE / REST PHASE: ambient drift ===
        p.x += (Math.random() - 0.5) * 0.003
        p.y += (Math.random() - 0.5) * 0.002
        p.z += (Math.random() - 0.5) * 0.001

        // Wrap at bounds
        if (p.x > 7) p.x = -7
        if (p.x < -7) p.x = 7
        if (p.y > 4.5) p.y = -4.5
        if (p.y < -4.5) p.y = 4.5
      }

      _position.set(p.x, p.y, p.z)
      _quaternion.identity()

      // Scale: staggered intro during emerge, full during drain, 0 when collapsed, back during explode
      let s: number
      if (isDraining && !isExploded) {
        // During drain: shrink as they approach center
        const dist = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z)
        const shrink = Math.min(1, dist / 2)
        s = p.radius * shrink
      } else if (singularityScale > 0.9 && !isExploded) {
        // Collapsed: all particles hidden at center
        s = 0
      } else if (isExploded) {
        // Explosion: full size
        const twinkle = 0.85 + 0.15 * Math.sin(time * p.twinkleSpeed + p.twinklePhase)
        s = p.radius * twinkle
      } else {
        // Emerge: staggered scale-in
        const depthNorm = (p.z + 20) / 21
        const staggerDelay = depthNorm * 0.6
        const localScale = particleScale <= staggerDelay
          ? 0
          : Math.min(1, (particleScale - staggerDelay) / (1 - staggerDelay))
        const twinkle = 0.85 + 0.15 * Math.sin(time * p.twinkleSpeed + p.twinklePhase)
        s = p.radius * localScale * twinkle
      }

      _scale.set(s, s, s)
      _matrix.compose(_position, _quaternion, _scale)
      meshRef.current.setMatrixAt(i, _matrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  )
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | grep GlassParticles`
Expected: No errors for this file.

**Step 3: Commit**

```bash
git add src/components/intro-v2/GlassParticles.tsx
git commit -m "feat(intro-v2): phase-based physics — drain spiral, explosion, settle"
```

---

### Task 3: Rewrite GalaxyScene.tsx — full timeline + singularity mesh

**Files:**
- Modify: `src/components/intro-v2/GalaxyScene.tsx`

Expands GSAP timeline from 2s to ~6s with drain/collapse/pause/explode/settle phases. Adds a singularity mesh at origin that scales up during collapse and down after explosion. Delays ShootingStars until after settle. Text reveal moves to ~5.5s.

**Step 1: Replace GalaxyScene.tsx**

```tsx
'use client'

import { useRef, useEffect, useCallback, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'
import { GlassParticles } from './GlassParticles'
import { ShootingStars } from './ShootingStars'
import { Lighting } from './Lighting'
import type { QualityConfig } from './quality'
import type { AnimState } from './types'

interface GalaxySceneProps {
  quality: QualityConfig
  timelineRef: React.MutableRefObject<gsap.core.Timeline | null>
  animState: AnimState
  mouseRef: React.RefObject<{ x: number; y: number }>
  onAutoplayComplete: () => void
}

function Singularity({ animState }: { animState: AnimState }) {
  const meshRef = useRef<THREE.Mesh>(null)

  const geometry = useMemo(() => new THREE.SphereGeometry(0.05, 16, 12), [])
  const material = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color('#fffaf0'),
    transparent: true,
    opacity: 1,
  }), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const s = animState.singularityScale
    // Pulse effect during hold
    const pulse = s > 0.5 ? 1 + 0.15 * Math.sin(clock.getElapsedTime() * 8) : 1
    const scale = s * pulse
    meshRef.current.scale.set(scale, scale, scale)
    meshRef.current.visible = s > 0.01
  })

  return <mesh ref={meshRef} geometry={geometry} material={material} />
}

export function GalaxyScene({
  quality,
  timelineRef,
  animState,
  mouseRef,
  onAutoplayComplete,
}: GalaxySceneProps) {
  const { gl, camera } = useThree()

  // Configure renderer
  useEffect(() => {
    gl.toneMapping = THREE.AgXToneMapping
    gl.toneMappingExposure = 1.0
    gl.setClearColor(new THREE.Color('#0a0806'), 1)
  }, [gl])

  // Position camera
  useEffect(() => {
    camera.position.set(0, 0, 3)
    camera.lookAt(0, 0, 0)
  }, [camera])

  // Build GSAP timeline (~6s total)
  useEffect(() => {
    const tl = gsap.timeline({ paused: true })

    // Phase 1: Emerge (0–1s)
    tl.to(animState, {
      particleScale: 1,
      duration: 1.0,
      ease: 'power2.out',
    }, 0)

    // Phase 2: Drain — spiral toward center (1–3s)
    tl.to(animState, {
      drainProgress: 1,
      duration: 2.0,
      ease: 'power2.in',
    }, 1.0)

    // Phase 3: Collapse — singularity appears (2.5–3.2s)
    tl.to(animState, {
      singularityScale: 1,
      duration: 0.7,
      ease: 'power3.in',
    }, 2.5)

    // Phase 4: Pause — hold singularity (3.2–4.2s, implicit — no new tweens)

    // Phase 5: Explosion — blast particles outward (4.2s)
    tl.to(animState, {
      explodeProgress: 1,
      duration: 0.1,
      ease: 'none',
    }, 4.2)

    // Singularity shrinks after explosion (4.2–4.6s)
    tl.to(animState, {
      singularityScale: 0,
      duration: 0.4,
      ease: 'power2.out',
    }, 4.2)

    // Phase 6: Settle + Text (5–6s)
    tl.to(animState, {
      textOpacity: 1,
      duration: 0.8,
      ease: 'power2.out',
    }, 5.0)

    tl.to(animState, {
      taglineOpacity: 1,
      duration: 0.6,
      ease: 'power2.out',
    }, 5.4)

    // Autoplay complete at 6s
    tl.call(() => onAutoplayComplete(), [], 6.0)

    timelineRef.current = tl
    tl.play()

    return () => {
      tl.kill()
      timelineRef.current = null
    }
  }, [animState, timelineRef, onAutoplayComplete])

  // Cursor parallax
  useFrame(() => {
    if (!mouseRef.current) return
    const targetX = mouseRef.current.x * 0.3
    const targetY = mouseRef.current.y * 0.15
    camera.position.x += (targetX - camera.position.x) * 0.05
    camera.position.y += (targetY - camera.position.y) * 0.05
    camera.lookAt(0, 0, 0)
  })

  const handleDecline = useCallback(() => {
    gl.setPixelRatio(Math.max(0.75, window.devicePixelRatio * 0.5))
  }, [gl])

  const handleIncline = useCallback(() => {
    gl.setPixelRatio(Math.min(2, window.devicePixelRatio))
  }, [gl])

  return (
    <>
      <PerformanceMonitor onDecline={handleDecline} onIncline={handleIncline} />
      <fog attach="fog" args={['#0a0806', 10, 25]} />
      <Lighting />
      <GlassParticles quality={quality} animState={animState} />
      <Singularity animState={animState} />
      <ShootingStars delay={5} />
    </>
  )
}
```

**Step 2: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | head -10`
Expected: Clean.

**Step 3: Commit**

```bash
git add src/components/intro-v2/GalaxyScene.tsx
git commit -m "feat(intro-v2): black hole timeline — drain, singularity, explosion, text reveal"
```

---

### Task 4: Build verification + visual check

**Step 1: Full TypeScript check**

Run: `npx tsc --noEmit`
Expected: Clean.

**Step 2: Run existing tests**

Run: `npx vitest run src/components/intro-v2/ 2>&1`
Expected: All pass (quality.test.ts — only existing test file).

**Step 3: Dev server test**

Run: `pnpm dev` (if not running)
Navigate: http://localhost:3007/intro-v2

Expected sequence:
1. 0–1s: Glass spheres fade in (depth-wave stagger)
2. 1–3s: Particles spiral toward center — corkscrew motion
3. ~3s: Singularity point appears and glows at center, particles vanish
4. 3–4.2s: Singularity pulses alone on dark background
5. 4.2s: Explosion — particles blast outward from center
6. 4.2–5s: Particles drift back to galaxy resting positions
7. 5–6s: "CB.MEDIA" and tagline fade in
8. 6s+: Ambient drift, shooting stars, cursor parallax

**Step 4: Commit any fixes**

```bash
git commit -m "feat(intro-v2): black hole effect verified — drain, explode, settle"
```
