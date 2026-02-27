# Glass Galaxy Intro Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the crystal shard intro with a refractive glass particle galaxy — floating glass spheres as stars, shooting stars, warm atmosphere, cursor parallax, ~2s intro.

**Architecture:** InstancedMesh glass spheres (MeshPhysicalMaterial with transmission/iridescence) rendered via R3F 9. GSAP drives a mutable animState ref. HTML overlay for text (drei Text causes Suspense hang). Mouse position bridged to R3F via ref for camera parallax.

**Tech Stack:** React Three Fiber 9, drei 10.7, GSAP, Three.js MeshPhysicalMaterial, detect-gpu

**Known Gotchas (from debugging in this session):**
- drei `<Text>` (troika-three-text) hangs Suspense — use HTML overlay for text
- `@react-three/postprocessing` 3.x crashes with R3F 9 / React 19 — do NOT use
- rAF effects must check refs inside tick function (not at effect start) because refs are null during loading state
- Turbopack HMR can serve stale modules — if weird errors after deleting files, restart dev server

**Dev server:** `pnpm dev` → http://localhost:3007/intro-v2

---

### Task 1: Update types.ts — Galaxy AnimState

**Files:**
- Modify: `src/components/intro-v2/types.ts`

**Step 1: Replace types.ts with galaxy-specific AnimState**

```typescript
/** Shared mutable animation state — GSAP writes, R3F + HTML overlay read each frame */
export interface AnimState {
  particleScale: number   // 0→1 during intro emergence
  textOpacity: number     // 0→1 headline
  taglineOpacity: number  // 0→1 tagline
  scrollInfluence: number // reserved for production integration
}

export function createAnimState(): AnimState {
  return {
    particleScale: 0,
    textOpacity: 0,
    taglineOpacity: 0,
    scrollInfluence: 0,
  }
}
```

**Step 2: Verify types compile**

Run: `npx tsc --noEmit 2>&1 | head -20`
Expected: Type errors in files that import old AnimState fields (CrystalScene, etc) — that's fine, we're replacing those next.

**Step 3: Commit**

```bash
git add src/components/intro-v2/types.ts
git commit -m "refactor(intro-v2): simplify AnimState for glass galaxy"
```

---

### Task 2: Update quality.ts — particleCount

**Files:**
- Modify: `src/components/intro-v2/quality.ts`

**Step 1: Replace quality.ts**

```typescript
import { getGPUTier } from 'detect-gpu'

export interface QualityConfig {
  particleCount: number
  dpr: [number, number]
  transmission: boolean
  fallback: boolean
}

const TIERS: Record<number, QualityConfig> = {
  3: { particleCount: 200, dpr: [1, 2], transmission: true, fallback: false },
  2: { particleCount: 150, dpr: [1, 1.5], transmission: true, fallback: false },
  1: { particleCount: 100, dpr: [1, 1], transmission: false, fallback: false },
  0: { particleCount: 0, dpr: [1, 1], transmission: false, fallback: true },
}

export function getQualityConfig(tier: number): QualityConfig {
  return TIERS[Math.max(0, Math.min(3, tier))] ?? TIERS[0]
}

export async function detectQuality(): Promise<QualityConfig> {
  try {
    const gpuTier = await getGPUTier()
    return getQualityConfig(gpuTier.tier)
  } catch {
    return getQualityConfig(1)
  }
}
```

**Step 2: Commit**

```bash
git add src/components/intro-v2/quality.ts
git commit -m "refactor(intro-v2): quality config for glass galaxy particles"
```

---

### Task 3: Update Lighting.tsx — warm tones

**Files:**
- Modify: `src/components/intro-v2/Lighting.tsx`

**Step 1: Replace Lighting.tsx with warm galaxy lighting**

The key light is warm amber, rim is cool blue for contrast, fill is very subtle. Lower intensities than crystal version — glass particles need soft light to show refraction, not blast.

```tsx
'use client'

import { Environment, Lightformer } from '@react-three/drei'

export function Lighting() {
  return (
    <Environment resolution={256}>
      {/* Warm key — upper right, amber tone */}
      <Lightformer
        form="rect"
        intensity={1.5}
        color="#ffe0b0"
        position={[4, 5, -3]}
        scale={[4, 1.5, 1]}
        rotation-y={Math.PI / 4}
      />
      {/* Cool rim — left side, blue contrast */}
      <Lightformer
        form="rect"
        intensity={0.6}
        color="#b0c4ff"
        position={[-4, 2, 2]}
        scale={[2, 4, 1]}
        rotation-y={-Math.PI / 3}
      />
      {/* Subtle fill from below */}
      <Lightformer
        form="ring"
        intensity={0.2}
        color="#fff5e6"
        position={[0, -3, 0]}
        scale={3}
        rotation-x={Math.PI / 2}
      />
    </Environment>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/intro-v2/Lighting.tsx
git commit -m "feat(intro-v2): warm amber/cool blue lighting for glass galaxy"
```

---

### Task 4: Create GlassParticles.tsx

**Files:**
- Create: `src/components/intro-v2/GlassParticles.tsx`

This is the core visual component. ~150 glass spheres distributed in a deep 3D volume. Three size tiers (tiny/medium/hero). Staggered scale-in during intro. Ambient drift. Twinkle.

**Step 1: Create GlassParticles.tsx**

```tsx
'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { QualityConfig } from './quality'
import type { AnimState } from './types'

// Reusable math objects — allocated once
const _matrix = new THREE.Matrix4()
const _position = new THREE.Vector3()
const _quaternion = new THREE.Quaternion()
const _scale = new THREE.Vector3()

interface Particle {
  x: number; y: number; z: number
  vx: number; vy: number; vz: number
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
    // Size tiers: first 5% hero, next 25% medium, rest tiny
    const tier = i < count * 0.05 ? 'hero'
      : i < count * 0.30 ? 'medium'
      : 'tiny'

    const radius = tier === 'hero'
      ? 0.15 + Math.random() * 0.1
      : tier === 'medium'
        ? 0.06 + Math.random() * 0.06
        : 0.02 + Math.random() * 0.02

    particles.push({
      x: (Math.random() - 0.5) * 14,
      y: (Math.random() - 0.5) * 9,
      z: -20 + Math.random() * 21, // -20 to +1
      vx: (Math.random() - 0.5) * 0.003,
      vy: (Math.random() - 0.5) * 0.002,
      vz: (Math.random() - 0.5) * 0.001,
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
    const introScale = animState.particleScale

    for (let i = 0; i < count; i++) {
      const p = particles[i]

      // Ambient drift
      p.x += p.vx
      p.y += p.vy
      p.z += p.vz

      // Wrap at bounds for infinite field feel
      if (p.x > 7) p.x = -7
      if (p.x < -7) p.x = 7
      if (p.y > 4.5) p.y = -4.5
      if (p.y < -4.5) p.y = 4.5

      _position.set(p.x, p.y, p.z)
      _quaternion.identity()

      // Staggered intro: far particles (z=-20) appear first, near (z=+1) last
      const depthNorm = (p.z + 20) / 21 // 0=far, 1=near
      const staggerDelay = depthNorm * 0.6
      const localScale = introScale <= staggerDelay
        ? 0
        : Math.min(1, (introScale - staggerDelay) / (1 - staggerDelay))

      // Twinkle
      const twinkle = 0.85 + 0.15 * Math.sin(time * p.twinkleSpeed + p.twinklePhase)

      const s = p.radius * localScale * twinkle
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
Expected: No errors for this file (other files may have errors from old imports — ignored for now).

**Step 3: Commit**

```bash
git add src/components/intro-v2/GlassParticles.tsx
git commit -m "feat(intro-v2): glass particle starfield with staggered intro"
```

---

### Task 5: Create ShootingStars.tsx

**Files:**
- Create: `src/components/intro-v2/ShootingStars.tsx`

Pool of 3 reusable shooting star instances. Each fires on a random timer (3-5s interval), streaks diagonally, fades in/out. Uses color intensity for per-instance fade (white→black on black background = effective opacity).

**Step 1: Create ShootingStars.tsx**

```tsx
'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const POOL_SIZE = 3
const MIN_INTERVAL = 3
const MAX_INTERVAL = 5

interface Star {
  active: boolean
  x: number; y: number; z: number
  dx: number; dy: number
  speed: number
  life: number
  maxLife: number
}

function createInactivePool(): Star[] {
  return Array.from({ length: POOL_SIZE }, () => ({
    active: false,
    x: 0, y: 0, z: -5,
    dx: 0, dy: 0,
    speed: 0,
    life: 0,
    maxLife: 0,
  }))
}

function activateStar(star: Star) {
  const side = Math.random() > 0.5 ? 1 : -1
  star.x = side * (3 + Math.random() * 3)
  star.y = 2 + Math.random() * 2
  star.z = -5 - Math.random() * 10
  star.dx = -side * (0.15 + Math.random() * 0.1)
  star.dy = -(0.08 + Math.random() * 0.06)
  star.speed = 1
  star.life = 0
  star.maxLife = 0.8 + Math.random() * 0.4
  star.active = true
}

interface ShootingStarsProps {
  delay?: number
}

const _matrix = new THREE.Matrix4()
const _pos = new THREE.Vector3()
const _quat = new THREE.Quaternion()
const _scl = new THREE.Vector3()
const _color = new THREE.Color()

export function ShootingStars({ delay = 2 }: ShootingStarsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const starsRef = useRef<Star[]>(createInactivePool())
  const nextFireRef = useRef(delay)

  const geometry = useMemo(() => new THREE.SphereGeometry(1, 8, 4), [])
  const material = useMemo(() => new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
  }), [])

  useFrame((_, delta) => {
    if (!meshRef.current) return

    const stars = starsRef.current

    // Fire timer
    nextFireRef.current -= delta
    if (nextFireRef.current <= 0) {
      const inactive = stars.find(s => !s.active)
      if (inactive) activateStar(inactive)
      nextFireRef.current = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL)
    }

    for (let i = 0; i < POOL_SIZE; i++) {
      const star = stars[i]

      if (star.active) {
        star.life += delta
        star.x += star.dx * star.speed
        star.y += star.dy * star.speed

        const progress = star.life / star.maxLife
        // Fade in quickly, sustain, fade out
        const brightness = progress < 0.1 ? progress / 0.1
          : progress > 0.7 ? (1 - progress) / 0.3
          : 1

        _pos.set(star.x, star.y, star.z)
        _quat.identity()
        // Elongated in direction of travel
        _scl.set(0.04, 0.008, 0.008)
        _matrix.compose(_pos, _quat, _scl)
        meshRef.current.setMatrixAt(i, _matrix)

        // Per-instance brightness via instance color
        _color.setRGB(brightness, brightness, brightness * 0.95)
        meshRef.current.setColorAt(i, _color)

        if (star.life >= star.maxLife) star.active = false
      } else {
        // Hide offscreen
        _pos.set(0, 0, -100)
        _scl.set(0, 0, 0)
        _matrix.compose(_pos, _quat.identity(), _scl)
        meshRef.current.setMatrixAt(i, _matrix)
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, POOL_SIZE]}
      frustumCulled={false}
    />
  )
}
```

**Step 2: Commit**

```bash
git add src/components/intro-v2/ShootingStars.tsx
git commit -m "feat(intro-v2): shooting star pool with diagonal streaks"
```

---

### Task 6: Create GalaxyScene.tsx

**Files:**
- Create: `src/components/intro-v2/GalaxyScene.tsx`

Scene orchestrator. Configures renderer, camera, GSAP timeline (~2s), cursor parallax, assembles all scene components.

**Step 1: Create GalaxyScene.tsx**

```tsx
'use client'

import { useEffect, useCallback } from 'react'
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

export function GalaxyScene({
  quality,
  timelineRef,
  animState,
  mouseRef,
  onAutoplayComplete,
}: GalaxySceneProps) {
  const { gl, camera } = useThree()

  // Configure renderer — warm dark background
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

  // Build GSAP timeline (~2s)
  useEffect(() => {
    const tl = gsap.timeline({ paused: true })

    // 0–0.8s: Particles emerge (staggered per-particle in GlassParticles)
    tl.to(animState, {
      particleScale: 1,
      duration: 0.8,
      ease: 'power2.out',
    }, 0)

    // 0.5–1.5s: Headline fades in
    tl.to(animState, {
      textOpacity: 1,
      duration: 1.0,
      ease: 'power2.out',
    }, 0.5)

    // 1.2–2.0s: Tagline fades in
    tl.to(animState, {
      taglineOpacity: 1,
      duration: 0.8,
      ease: 'power2.out',
    }, 1.2)

    // 2.0s: Autoplay complete
    tl.call(() => onAutoplayComplete(), [], 2.0)

    timelineRef.current = tl
    tl.play()

    return () => {
      tl.kill()
      timelineRef.current = null
    }
  }, [animState, timelineRef, onAutoplayComplete])

  // Cursor parallax — smooth camera offset toward mouse
  useFrame(() => {
    if (!mouseRef.current) return
    const targetX = mouseRef.current.x * 0.3
    const targetY = mouseRef.current.y * 0.15
    camera.position.x += (targetX - camera.position.x) * 0.05
    camera.position.y += (targetY - camera.position.y) * 0.05
    camera.lookAt(0, 0, 0)
  })

  // PerformanceMonitor
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
      <ShootingStars delay={2} />
    </>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/intro-v2/GalaxyScene.tsx
git commit -m "feat(intro-v2): galaxy scene orchestrator with 2s timeline + cursor parallax"
```

---

### Task 7: Rewrite CrystalIntro → GalaxyIntro

**Files:**
- Create: `src/components/intro-v2/GalaxyIntro.tsx` (replaces CrystalIntro.tsx)
- Modify: `src/app/intro-v2/page.tsx` (update import)

Canvas wrapper + HTML text overlay + mouse tracking. No skip button (2s is too short to need one). No scroll controller for now.

**Step 1: Create GalaxyIntro.tsx**

```tsx
'use client'

import { useRef, useState, useEffect, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import { GalaxyScene } from './GalaxyScene'
import { detectQuality, type QualityConfig, getQualityConfig } from './quality'
import { createAnimState } from './types'

export default function GalaxyIntro() {
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const animState = useRef(createAnimState()).current
  const mouseRef = useRef({ x: 0, y: 0 })

  // DOM refs for HTML text overlay
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)

  const [quality, setQuality] = useState<QualityConfig | null>(null)

  // Detect GPU tier
  useEffect(() => {
    detectQuality().then(setQuality)
  }, [])

  // Reduced motion check
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      setQuality(getQualityConfig(0))
    }
  }, [])

  // Track mouse position (normalized -1 to 1)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  // rAF loop: sync HTML text overlay from mutable animState
  useEffect(() => {
    let rafId: number
    const tick = () => {
      const headline = headlineRef.current
      const tagline = taglineRef.current
      if (headline) {
        headline.style.opacity = String(animState.textOpacity)
      }
      if (tagline) {
        tagline.style.opacity = String(animState.taglineOpacity)
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [animState])

  const handleAutoplayComplete = useCallback(() => {
    // Intro done — placeholder for future scroll integration
  }, [])

  // Tier 0 fallback: static text
  if (quality?.fallback) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0806',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display, sans-serif)',
          fontSize: 'clamp(2rem, 8vw, 5rem)',
          letterSpacing: '0.08em',
          color: '#fff',
        }}>
          CB.MEDIA
        </h1>
      </div>
    )
  }

  // Loading while GPU detection runs
  if (!quality) {
    return <div style={{ minHeight: '100vh', background: '#0a0806' }} />
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Fixed Canvas */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
        <Canvas
          gl={{
            powerPreference: 'high-performance',
            antialias: false,
            stencil: false,
            alpha: false,
          }}
          dpr={quality.dpr}
          frameloop="always"
          flat
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            <GalaxyScene
              quality={quality}
              timelineRef={timelineRef}
              animState={animState}
              mouseRef={mouseRef}
              onAutoplayComplete={handleAutoplayComplete}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Brand text overlay — HTML for reliable rendering */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <h1
          ref={headlineRef}
          style={{
            fontFamily: 'var(--font-display, "Montserrat", sans-serif)',
            fontSize: 'clamp(2rem, 8vw, 5rem)',
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: '#fff',
            opacity: 0,
            margin: 0,
            textTransform: 'uppercase',
            willChange: 'opacity',
          }}
        >
          CB.MEDIA
        </h1>
        <p
          ref={taglineRef}
          style={{
            fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
            fontSize: 'clamp(0.55rem, 1.5vw, 0.85rem)',
            fontWeight: 300,
            letterSpacing: '0.15em',
            color: 'rgba(255, 255, 255, 0.6)',
            opacity: 0,
            margin: 0,
            marginTop: '1rem',
            textTransform: 'uppercase',
            willChange: 'opacity',
          }}
        >
          TURNING VISIBILITY INTO VALUE
        </p>
      </div>

      {/* Scroll spacer for testing — content would go here in production */}
      <div style={{ position: 'relative', zIndex: 0, height: '100vh' }} />
    </div>
  )
}
```

**Step 2: Update page.tsx import**

Read `src/app/intro-v2/page.tsx` first, then update the dynamic import from `CrystalIntro` to `GalaxyIntro`.

```tsx
'use client'

import dynamic from 'next/dynamic'

const GalaxyIntro = dynamic(
  () => import('../../components/intro-v2/GalaxyIntro'),
  { ssr: false },
)

export default function IntroV2Page() {
  return <GalaxyIntro />
}
```

**Step 3: Commit**

```bash
git add src/components/intro-v2/GalaxyIntro.tsx src/app/intro-v2/page.tsx
git commit -m "feat(intro-v2): galaxy intro wrapper with HTML overlay + mouse tracking"
```

---

### Task 8: Delete old crystal files

**Files:**
- Delete: `src/components/intro-v2/CrystalIntro.tsx`
- Delete: `src/components/intro-v2/CrystalScene.tsx`
- Delete: `src/components/intro-v2/CrystalShards.tsx`
- Delete: `src/components/intro-v2/CrystalGeometry.ts`
- Delete: `src/components/intro-v2/ScrollController.tsx`
- Delete: `src/components/intro-v2/PostFX.tsx`

**Step 1: Delete files**

```bash
rm src/components/intro-v2/CrystalIntro.tsx
rm src/components/intro-v2/CrystalScene.tsx
rm src/components/intro-v2/CrystalShards.tsx
rm src/components/intro-v2/CrystalGeometry.ts
rm src/components/intro-v2/ScrollController.tsx
rm src/components/intro-v2/PostFX.tsx
```

**Step 2: Verify build**

Run: `npx tsc --noEmit`
Expected: Clean (no errors). If errors, check imports.

**Step 3: Commit**

```bash
git add -A src/components/intro-v2/
git commit -m "chore(intro-v2): remove crystal shard files, replaced by glass galaxy"
```

---

### Task 9: Build verification + visual check

**Step 1: Full TypeScript check**

Run: `npx tsc --noEmit`
Expected: Clean

**Step 2: Dev server test**

Run: `pnpm dev` (if not running)
Navigate: http://localhost:3007/intro-v2
Expected:
- Warm dark background (#0a0806)
- Glass spheres fade in over ~0.8s (far ones first, depth wave)
- "CB.MEDIA" fades in at ~0.5s
- "TURNING VISIBILITY INTO VALUE" fades in at ~1.2s
- Particles drift slowly
- Mouse movement shifts camera subtly (parallax)
- Shooting stars start after ~2s
- Zero console errors

**Step 3: Commit any fixes, then final commit**

```bash
git commit -m "feat(intro-v2): glass galaxy intro complete — verified rendering"
```
