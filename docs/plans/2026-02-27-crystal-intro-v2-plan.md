# Crystal Intro V2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a studio-grade glass/refraction cinematic intro on `/intro-v2` — standalone hidden page, zero dependency on current intro code.

**Architecture:** Pre-shattered crystalline polyhedron (InstancedMesh, MeshPhysicalMaterial with transmission/clearcoat/iridescence), hybrid autoplay→scroll-driven pacing, WebGL text via drei `<Text>`, GSAP timeline + Lenis ScrollTrigger, detect-gpu adaptive quality.

**Tech Stack:** Three.js 0.183, R3F 9.5, drei 10.7, postprocessing 3.0.4, GSAP 3.14, Lenis 1.3, detect-gpu 5.0

**Design doc:** `docs/plans/2026-02-27-crystal-intro-v2-design.md`

---

## Task 0: Project Setup

**Files:**
- Create: `public/fonts/` (download Space Grotesk TTF)
- Create: `src/components/intro-v2/` (directory)
- Create: `src/app/intro-v2/` (directory)

**Step 1: Download Space Grotesk font for WebGL text**

drei's `<Text>` (troika-three-text internally) needs a direct font file URL. Next.js's `next/font/google` hashes fonts at build time — we can't use those. Download the TTF to `public/fonts/`.

```bash
curl -L -o public/fonts/SpaceGrotesk-Medium.ttf \
  "https://github.com/floriankarsten/space-grotesk/raw/master/fonts/ttf/SpaceGrotesk-Medium.ttf"
```

If curl fails, download manually from https://fonts.google.com/specimen/Space+Grotesk (Medium weight, TTF format).

**Step 2: Create directory structure**

```bash
mkdir -p src/components/intro-v2
mkdir -p src/app/intro-v2
```

**Step 3: Verify existing dependencies**

All required packages are already installed. Verify:

```bash
pnpm ls three @react-three/fiber @react-three/drei @react-three/postprocessing gsap lenis detect-gpu
```

Expected: all packages listed with versions. No installs needed.

**Step 4: Commit**

```bash
git add public/fonts/SpaceGrotesk-Medium.ttf
git commit -m "chore: add Space Grotesk font for WebGL text rendering"
```

---

## Task 1: GPU Quality Tiers

**Files:**
- Create: `src/components/intro-v2/quality.ts`
- Create: `src/components/intro-v2/__tests__/quality.test.ts`

**Step 1: Write the test**

```typescript
// src/components/intro-v2/__tests__/quality.test.ts
import { describe, it, expect } from 'vitest'
import { getQualityConfig, type QualityConfig } from '../quality'

describe('getQualityConfig', () => {
  it('returns full quality for tier 3', () => {
    const config = getQualityConfig(3)
    expect(config.shardCount).toBe(320)
    expect(config.dpr).toEqual([1, 2])
    expect(config.postFX.bloom).toBe(true)
    expect(config.postFX.chromaticAberration).toBe(true)
    expect(config.transmission).toBe(true)
  })

  it('returns reduced quality for tier 2', () => {
    const config = getQualityConfig(2)
    expect(config.shardCount).toBeLessThan(320)
    expect(config.postFX.chromaticAberration).toBe(false)
    expect(config.transmission).toBe(true)
  })

  it('returns minimal quality for tier 1', () => {
    const config = getQualityConfig(1)
    expect(config.shardCount).toBeLessThan(200)
    expect(config.transmission).toBe(false)
  })

  it('returns fallback for tier 0', () => {
    const config = getQualityConfig(0)
    expect(config.fallback).toBe(true)
  })

  it('clamps unknown tiers to 0', () => {
    const config = getQualityConfig(-1)
    expect(config.fallback).toBe(true)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
pnpm vitest run src/components/intro-v2/__tests__/quality.test.ts
```

Expected: FAIL — module not found.

**Step 3: Write implementation**

```typescript
// src/components/intro-v2/quality.ts
import { getGPUTier } from 'detect-gpu'

export interface QualityConfig {
  shardCount: number
  dpr: [number, number]
  transmission: boolean
  fallback: boolean
  postFX: {
    bloom: boolean
    chromaticAberration: boolean
    vignette: boolean
  }
}

const TIERS: Record<number, QualityConfig> = {
  3: {
    shardCount: 320,
    dpr: [1, 2],
    transmission: true,
    fallback: false,
    postFX: { bloom: true, chromaticAberration: true, vignette: true },
  },
  2: {
    shardCount: 200,
    dpr: [1, 1.5],
    transmission: true,
    fallback: false,
    postFX: { bloom: true, chromaticAberration: false, vignette: true },
  },
  1: {
    shardCount: 120,
    dpr: [1, 1],
    transmission: false,
    fallback: false,
    postFX: { bloom: true, chromaticAberration: false, vignette: false },
  },
  0: {
    shardCount: 0,
    dpr: [1, 1],
    transmission: false,
    fallback: true,
    postFX: { bloom: false, chromaticAberration: false, vignette: false },
  },
}

export function getQualityConfig(tier: number): QualityConfig {
  return TIERS[Math.max(0, Math.min(3, tier))] ?? TIERS[0]
}

export async function detectQuality(): Promise<QualityConfig> {
  try {
    const gpuTier = await getGPUTier()
    return getQualityConfig(gpuTier.tier)
  } catch {
    return getQualityConfig(1) // Safe fallback
  }
}
```

**Step 4: Run test to verify it passes**

```bash
pnpm vitest run src/components/intro-v2/__tests__/quality.test.ts
```

Expected: PASS — all 5 tests.

**Step 5: Commit**

```bash
git add src/components/intro-v2/quality.ts src/components/intro-v2/__tests__/quality.test.ts
git commit -m "feat(intro-v2): add GPU quality tier detection"
```

---

## Task 2: Crystal Geometry Generator

**Files:**
- Create: `src/components/intro-v2/CrystalGeometry.ts`
- Create: `src/components/intro-v2/__tests__/CrystalGeometry.test.ts`

**Step 1: Write the test**

```typescript
// src/components/intro-v2/__tests__/CrystalGeometry.test.ts
import { describe, it, expect } from 'vitest'
import { generateShardData, type ShardData } from '../CrystalGeometry'

describe('generateShardData', () => {
  it('generates correct number of shards for detail level 2', () => {
    const data = generateShardData({ detail: 2 })
    // IcosahedronGeometry(r, 2) = 20 * 4^2 = 320 faces
    expect(data.count).toBe(320)
  })

  it('generates correct number of shards for detail level 1', () => {
    const data = generateShardData({ detail: 1 })
    // IcosahedronGeometry(r, 1) = 20 * 4^1 = 80 faces
    expect(data.count).toBe(80)
  })

  it('returns Float32Arrays of correct length', () => {
    const data = generateShardData({ detail: 1 })
    expect(data.centroids).toBeInstanceOf(Float32Array)
    expect(data.centroids.length).toBe(data.count * 3)
    expect(data.normals.length).toBe(data.count * 3)
    expect(data.quaternions.length).toBe(data.count * 4)
    expect(data.scales.length).toBe(data.count)
  })

  it('generates normalized normals', () => {
    const data = generateShardData({ detail: 1 })
    for (let i = 0; i < data.count; i++) {
      const nx = data.normals[i * 3]
      const ny = data.normals[i * 3 + 1]
      const nz = data.normals[i * 3 + 2]
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
      expect(len).toBeCloseTo(1, 3)
    }
  })

  it('centroids are on the crystal surface (near radius)', () => {
    const radius = 1
    const data = generateShardData({ radius, detail: 1, noiseAmplitude: 0 })
    for (let i = 0; i < data.count; i++) {
      const cx = data.centroids[i * 3]
      const cy = data.centroids[i * 3 + 1]
      const cz = data.centroids[i * 3 + 2]
      const dist = Math.sqrt(cx * cx + cy * cy + cz * cz)
      expect(dist).toBeCloseTo(radius, 1)
    }
  })

  it('scales are positive', () => {
    const data = generateShardData({ detail: 1 })
    for (let i = 0; i < data.count; i++) {
      expect(data.scales[i]).toBeGreaterThan(0)
    }
  })
})
```

**Step 2: Run test to verify it fails**

```bash
pnpm vitest run src/components/intro-v2/__tests__/CrystalGeometry.test.ts
```

Expected: FAIL — module not found.

**Step 3: Write implementation**

```typescript
// src/components/intro-v2/CrystalGeometry.ts
import * as THREE from 'three'

export interface ShardData {
  centroids: Float32Array   // vec3 per shard: home position
  normals: Float32Array     // vec3 per shard: outward direction
  quaternions: Float32Array // vec4 per shard: rotation from Y-up to face normal
  scales: Float32Array      // float per shard: relative size
  count: number
}

interface GenerateOptions {
  radius?: number
  detail?: number
  noiseAmplitude?: number
}

/**
 * Generates shard placement data from a displaced icosahedron.
 * Pure function — no Three.js objects retained.
 */
export function generateShardData(options: GenerateOptions = {}): ShardData {
  const { radius = 1, detail = 2, noiseAmplitude = 0.05 } = options

  const ico = new THREE.IcosahedronGeometry(radius, detail)
  const nonIndexed = ico.toNonIndexed()
  const positions = nonIndexed.attributes.position.array as Float32Array
  const faceCount = positions.length / 9 // 3 verts × 3 components

  // Apply deterministic noise displacement for organic irregularity
  if (noiseAmplitude > 0) {
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      const z = positions[i + 2]
      // Deterministic pseudo-noise based on position
      const hash = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453
      const noise = hash - Math.floor(hash) // 0..1
      const scale = 1 + (noise - 0.5) * 2 * noiseAmplitude
      const len = Math.sqrt(x * x + y * y + z * z)
      if (len > 0) {
        const factor = (scale * radius) / len
        positions[i] = x * factor
        positions[i + 1] = y * factor
        positions[i + 2] = z * factor
      }
    }
  }

  const centroids = new Float32Array(faceCount * 3)
  const normals = new Float32Array(faceCount * 3)
  const quaternions = new Float32Array(faceCount * 4)
  const scales = new Float32Array(faceCount)

  const v0 = new THREE.Vector3()
  const v1 = new THREE.Vector3()
  const v2 = new THREE.Vector3()
  const centroid = new THREE.Vector3()
  const normal = new THREE.Vector3()
  const edge1 = new THREE.Vector3()
  const edge2 = new THREE.Vector3()
  const up = new THREE.Vector3(0, 1, 0)
  const quat = new THREE.Quaternion()

  for (let i = 0; i < faceCount; i++) {
    const base = i * 9

    v0.set(positions[base], positions[base + 1], positions[base + 2])
    v1.set(positions[base + 3], positions[base + 4], positions[base + 5])
    v2.set(positions[base + 6], positions[base + 7], positions[base + 8])

    // Centroid (average of 3 vertices)
    centroid.copy(v0).add(v1).add(v2).divideScalar(3)
    centroids[i * 3] = centroid.x
    centroids[i * 3 + 1] = centroid.y
    centroids[i * 3 + 2] = centroid.z

    // Face normal (cross product of edges)
    edge1.subVectors(v1, v0)
    edge2.subVectors(v2, v0)
    normal.crossVectors(edge1, edge2).normalize()
    normals[i * 3] = normal.x
    normals[i * 3 + 1] = normal.y
    normals[i * 3 + 2] = normal.z

    // Scale from face area
    // Recompute edges since crossVectors doesn't mutate inputs
    edge1.subVectors(v1, v0)
    edge2.subVectors(v2, v0)
    const crossVec = new THREE.Vector3().crossVectors(edge1, edge2)
    const area = crossVec.length() * 0.5
    scales[i] = Math.sqrt(area) * 2.5

    // Quaternion: rotate from Y-up to face normal
    quat.setFromUnitVectors(up, normal)
    quaternions[i * 4] = quat.x
    quaternions[i * 4 + 1] = quat.y
    quaternions[i * 4 + 2] = quat.z
    quaternions[i * 4 + 3] = quat.w
  }

  // Dispose Three.js geometries
  ico.dispose()
  nonIndexed.dispose()

  return { centroids, normals, quaternions, scales, count: faceCount }
}
```

**Step 4: Run test to verify it passes**

```bash
pnpm vitest run src/components/intro-v2/__tests__/CrystalGeometry.test.ts
```

Expected: PASS — all 6 tests.

**Step 5: Commit**

```bash
git add src/components/intro-v2/CrystalGeometry.ts src/components/intro-v2/__tests__/CrystalGeometry.test.ts
git commit -m "feat(intro-v2): add procedural crystal shard geometry generator"
```

---

## Task 3: Lighting Component

**Files:**
- Create: `src/components/intro-v2/Lighting.tsx`

No unit test — this is a declarative R3F component. Verified visually in Task 11.

**Step 1: Write implementation**

```tsx
// src/components/intro-v2/Lighting.tsx
'use client'

import { Environment, Lightformer } from '@react-three/drei'

export function Lighting() {
  return (
    <Environment resolution={256}>
      {/* Key light — warm white strip, upper-right */}
      <Lightformer
        form="rect"
        intensity={2}
        color="#fffaf0"
        position={[4, 5, -3]}
        scale={[4, 1.5, 1]}
        rotation-y={Math.PI / 4}
      />

      {/* Rim light — cool white, behind-left */}
      <Lightformer
        form="rect"
        intensity={0.8}
        color="#e0e8ff"
        position={[-4, 2, 2]}
        scale={[2, 4, 1]}
        rotation-y={-Math.PI / 3}
      />

      {/* Subtle fill — bottom, very dim */}
      <Lightformer
        form="ring"
        intensity={0.3}
        color="#ffffff"
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
git commit -m "feat(intro-v2): add programmatic studio lighting with lightformers"
```

---

## Task 4: Post-Processing Component

**Files:**
- Create: `src/components/intro-v2/PostFX.tsx`

No unit test — visual component. Verified in Task 11.

**Step 1: Write implementation**

```tsx
// src/components/intro-v2/PostFX.tsx
'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  ToneMapping,
} from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import type { ChromaticAberrationEffect } from 'postprocessing'
import * as THREE from 'three'
import type { QualityConfig } from './quality'

interface PostFXProps {
  quality: QualityConfig
  animState: {
    bloomIntensity: number
    caOffset: number
  }
}

export function PostFX({ quality, animState }: PostFXProps) {
  const caRef = useRef<ChromaticAberrationEffect>(null)

  useFrame(() => {
    if (caRef.current && quality.postFX.chromaticAberration) {
      const offset = animState.caOffset
      caRef.current.offset = new THREE.Vector2(offset, offset)
    }
  })

  return (
    <EffectComposer multisampling={0}>
      {quality.postFX.bloom && (
        <Bloom
          intensity={0.4}
          luminanceThreshold={0.8}
          luminanceSmoothing={0.3}
          radius={0.6}
          mipmapBlur
        />
      )}

      {quality.postFX.chromaticAberration && (
        <ChromaticAberration
          ref={caRef}
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0006, 0.0006)}
          radialModulation
          modulationOffset={0.2}
        />
      )}

      {quality.postFX.vignette && (
        <Vignette
          offset={0.3}
          darkness={0.7}
          blendFunction={BlendFunction.NORMAL}
        />
      )}

      <ToneMapping mode={ToneMappingMode.AGX} />
    </EffectComposer>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/intro-v2/PostFX.tsx
git commit -m "feat(intro-v2): add declarative post-processing pipeline"
```

---

## Task 5: Brand Text Component

**Files:**
- Create: `src/components/intro-v2/BrandText.tsx`

No unit test — visual component using drei `<Text>` (troika-three-text wrapper).

**Step 1: Write implementation**

```tsx
// src/components/intro-v2/BrandText.tsx
'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const FONT_URL = '/fonts/SpaceGrotesk-Medium.ttf'

interface BrandTextProps {
  animState: {
    textOpacity: number
    taglineOpacity: number
    scrollInfluence: number
  }
}

export function BrandText({ animState }: BrandTextProps) {
  const headlineRef = useRef<THREE.Mesh>(null)
  const taglineRef = useRef<THREE.Mesh>(null)

  const headlineMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.15,
        roughness: 0.08,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        envMapIntensity: 1.5,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.04,
        transparent: true,
        opacity: 0,
      }),
    [],
  )

  const taglineMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: 0x999999,
        metalness: 0.1,
        roughness: 0.15,
        clearcoat: 0.5,
        envMapIntensity: 1.0,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.02,
        transparent: true,
        opacity: 0,
      }),
    [],
  )

  useFrame(() => {
    const scrollScale = 1 + animState.scrollInfluence * 0.03

    headlineMaterial.opacity = animState.textOpacity
    if (headlineRef.current) {
      headlineRef.current.scale.setScalar(scrollScale)
    }

    taglineMaterial.opacity = animState.taglineOpacity
    if (taglineRef.current) {
      taglineRef.current.scale.setScalar(scrollScale)
    }
  })

  return (
    <group>
      <Text
        ref={headlineRef}
        font={FONT_URL}
        fontSize={0.45}
        letterSpacing={0.08}
        material={headlineMaterial}
        anchorX="center"
        anchorY="middle"
        position={[0, 0.05, 0]}
      >
        CB.MEDIA
      </Text>

      <Text
        ref={taglineRef}
        font={FONT_URL}
        fontSize={0.09}
        letterSpacing={0.15}
        material={taglineMaterial}
        anchorX="center"
        anchorY="middle"
        position={[0, -0.25, 0]}
      >
        TURNING VISIBILITY INTO VALUE
      </Text>
    </group>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/intro-v2/BrandText.tsx
git commit -m "feat(intro-v2): add WebGL brand text with chrome-glass material"
```

---

## Task 6: Crystal Shards Component

**Files:**
- Create: `src/components/intro-v2/CrystalShards.tsx`

This is the core visual component — InstancedMesh that reads animState every frame.

**Step 1: Write implementation**

```tsx
// src/components/intro-v2/CrystalShards.tsx
'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { generateShardData } from './CrystalGeometry'
import type { QualityConfig } from './quality'

// Reusable math objects — allocated once, used every frame
const _position = new THREE.Vector3()
const _quaternion = new THREE.Quaternion()
const _scale = new THREE.Vector3()
const _matrix = new THREE.Matrix4()
const _rotQuat = new THREE.Quaternion()
const _axis = new THREE.Vector3()

interface CrystalShardsProps {
  quality: QualityConfig
  animState: {
    crystalScale: number
    rotationSpeed: number
    dissolutionProgress: number
    scrollInfluence: number
  }
}

export function CrystalShards({ quality, animState }: CrystalShardsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  // Determine shard detail level from quality tier
  const detail = quality.shardCount >= 300 ? 2 : 1

  // Generate shard data (memoized — only regenerates if detail changes)
  const shardData = useMemo(() => generateShardData({ detail }), [detail])

  // Clamp to quality-appropriate count
  const count = Math.min(shardData.count, quality.shardCount)

  // Shard base geometry — thin box (glass chip)
  const shardGeometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(0.07, 0.07, 0.012)
    return geo
  }, [])

  // Glass material
  const shardMaterial = useMemo(() => {
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
      side: THREE.DoubleSide,
    })

    // Only enable transmission on capable GPUs
    if (quality.transmission) {
      mat.transmission = 0.92
      mat.thickness = 0.5
      mat.ior = 1.45
    } else {
      // Fallback: translucent glass look without transmission render pass
      mat.opacity = 0.85
      mat.metalness = 0.1
    }

    return mat
  }, [quality.transmission])

  // Per-shard random offsets for dissolution variety (computed once)
  const randomOffsets = useMemo(() => {
    const offsets = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Tangential drift during dissolution
      offsets[i * 3] = (Math.random() - 0.5) * 0.4
      offsets[i * 3 + 1] = (Math.random() - 0.5) * 0.4
      offsets[i * 3 + 2] = (Math.random() - 0.5) * 0.4
    }
    return offsets
  }, [count])

  // Per-shard rotation speeds for dissolution spin
  const rotationSpeeds = useMemo(() => {
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      speeds[i] = (Math.random() - 0.5) * Math.PI * 0.8
    }
    return speeds
  }, [count])

  // Initialize all instance matrices to identity
  useEffect(() => {
    if (!meshRef.current) return
    for (let i = 0; i < count; i++) {
      _matrix.identity()
      meshRef.current.setMatrixAt(i, _matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  }, [count])

  // Update every frame — reads animState, writes instance matrices
  useFrame((_, delta) => {
    if (!meshRef.current) return

    const { centroids, normals, quaternions, scales } = shardData
    const dissolution = animState.dissolutionProgress
    const scroll = animState.scrollInfluence
    const totalDissolution = dissolution + scroll * 0.5
    const globalScale = animState.crystalScale
    const rotation = animState.rotationSpeed * delta

    for (let i = 0; i < count; i++) {
      const ci = i * 3
      const qi = i * 4

      // Home position (centroid on crystal surface)
      const hx = centroids[ci]
      const hy = centroids[ci + 1]
      const hz = centroids[ci + 2]

      // Normal direction (dissolution direction)
      const nx = normals[ci]
      const ny = normals[ci + 1]
      const nz = normals[ci + 2]

      // Dissolution offset: along normal + random tangential drift
      const dissolveDistance = totalDissolution * (1.5 + scales[i] * 2)
      _position.set(
        hx + nx * dissolveDistance + randomOffsets[ci] * totalDissolution,
        hy + ny * dissolveDistance + randomOffsets[ci + 1] * totalDissolution,
        hz + nz * dissolveDistance + randomOffsets[ci + 2] * totalDissolution,
      )

      // Base rotation from shard data (face normal orientation)
      _quaternion.set(
        quaternions[qi],
        quaternions[qi + 1],
        quaternions[qi + 2],
        quaternions[qi + 3],
      )

      // Add dissolution spin
      if (totalDissolution > 0.01) {
        _axis.set(nx, ny, nz)
        _rotQuat.setFromAxisAngle(
          _axis,
          totalDissolution * rotationSpeeds[i],
        )
        _quaternion.premultiply(_rotQuat)
      }

      // Add slow global rotation (crystal tumble in assembled state)
      if (totalDissolution < 0.5) {
        _rotQuat.setFromAxisAngle(
          _axis.set(0, 1, 0),
          rotation * (1 - totalDissolution * 2),
        )
        _quaternion.premultiply(_rotQuat)
      }

      // Scale: base scale × global scale
      const s = scales[i] * globalScale
      _scale.set(s, s, s * 0.3) // Flatten Z for shard-like proportions

      _matrix.compose(_position, _quaternion, _scale)
      meshRef.current.setMatrixAt(i, _matrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true

    // Fade out at extreme scroll
    shardMaterial.opacity = quality.transmission
      ? 1 - scroll * 0.15
      : 0.85 - scroll * 0.2
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[shardGeometry, shardMaterial, count]}
      frustumCulled={false}
    />
  )
}
```

**Step 2: Commit**

```bash
git add src/components/intro-v2/CrystalShards.tsx
git commit -m "feat(intro-v2): add InstancedMesh crystal shards with dissolution"
```

---

## Task 7: Scene Graph + GSAP Timeline

**Files:**
- Create: `src/components/intro-v2/CrystalScene.tsx`

This is the orchestrator — owns animState, creates the GSAP master timeline, composes all scene children.

**Step 1: Write implementation**

```tsx
// src/components/intro-v2/CrystalScene.tsx
'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'
import { CrystalShards } from './CrystalShards'
import { BrandText } from './BrandText'
import { Lighting } from './Lighting'
import { PostFX } from './PostFX'
import type { QualityConfig } from './quality'

interface CrystalSceneProps {
  quality: QualityConfig
  timelineRef: React.MutableRefObject<gsap.core.Timeline | null>
  onAutoplayComplete: () => void
}

function createAnimState() {
  return {
    crystalScale: 0,
    rotationSpeed: 0.1,
    dissolutionProgress: 0,
    textOpacity: 0,
    taglineOpacity: 0,
    scrollInfluence: 0,
    bloomIntensity: 0,
    caOffset: 0.0006,
  }
}

export function CrystalScene({
  quality,
  timelineRef,
  onAutoplayComplete,
}: CrystalSceneProps) {
  const animState = useRef(createAnimState()).current
  const { gl, camera, set } = useThree()

  // Configure renderer
  useEffect(() => {
    gl.toneMapping = THREE.AgXToneMapping
    gl.toneMappingExposure = 1.0
    gl.setClearColor(0x000000, 1)
  }, [gl])

  // Position camera
  useEffect(() => {
    camera.position.set(0, 0, 3)
    camera.lookAt(0, 0, 0)
  }, [camera])

  // Build GSAP master timeline
  useEffect(() => {
    const tl = gsap.timeline({ paused: true })

    // Phase 1: Emergence (0–1.5s)
    tl.to(animState, {
      crystalScale: 1,
      duration: 1.5,
      ease: 'power3.out',
    }, 0)

    tl.to(animState, {
      bloomIntensity: 0.4,
      duration: 1.5,
      ease: 'power2.in',
    }, 0)

    // Phase 2: Dissolution (1.7–3s)
    // Brief pause at 1.5s (the stillness beat)
    tl.to(animState, {
      rotationSpeed: 0,
      duration: 0.2,
      ease: 'power2.out',
    }, 1.5)

    tl.to(animState, {
      dissolutionProgress: 1,
      duration: 1.3,
      ease: 'power2.out',
    }, 1.7)

    tl.to(animState, {
      caOffset: 0.0012,
      duration: 0.6,
      ease: 'power2.in',
    }, 1.7)

    tl.to(animState, {
      caOffset: 0.0006,
      duration: 0.7,
      ease: 'power2.out',
    }, 2.3)

    // Phase 3: Text reveal (3–4.5s)
    tl.to(animState, {
      textOpacity: 1,
      duration: 1.0,
      ease: 'power2.out',
    }, 3.0)

    tl.to(animState, {
      taglineOpacity: 1,
      duration: 1.0,
      ease: 'power2.out',
    }, 3.5)

    // Signal autoplay complete at 4.5s
    tl.call(() => {
      onAutoplayComplete()
    }, [], 4.5)

    timelineRef.current = tl
    tl.play()

    return () => {
      tl.kill()
      timelineRef.current = null
    }
  }, [animState, timelineRef, onAutoplayComplete])

  // PerformanceMonitor callbacks
  const handleDecline = useCallback(() => {
    set({ dpr: Math.max(0.75, window.devicePixelRatio * 0.5) })
  }, [set])

  const handleIncline = useCallback(() => {
    set({ dpr: Math.min(2, window.devicePixelRatio) })
  }, [set])

  return (
    <>
      <PerformanceMonitor
        onDecline={handleDecline}
        onIncline={handleIncline}
      />
      <color attach="background" args={[0x000000]} />
      <Lighting />
      <CrystalShards quality={quality} animState={animState} />
      <BrandText animState={animState} />
      {!quality.fallback && <PostFX quality={quality} animState={animState} />}
    </>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/intro-v2/CrystalScene.tsx
git commit -m "feat(intro-v2): add scene orchestrator with GSAP master timeline"
```

---

## Task 8: Scroll Controller

**Files:**
- Create: `src/components/intro-v2/ScrollController.tsx`

Bridges Lenis scroll position → animState. Runs outside the Canvas as a DOM component.

**Step 1: Write implementation**

```tsx
// src/components/intro-v2/ScrollController.tsx
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ScrollControllerProps {
  animState: {
    scrollInfluence: number
  }
  enabled: boolean
  triggerRef: React.RefObject<HTMLDivElement | null>
}

export function ScrollController({
  animState,
  enabled,
  triggerRef,
}: ScrollControllerProps) {
  const stRef = useRef<ScrollTrigger | null>(null)

  useEffect(() => {
    if (!enabled || !triggerRef.current) return

    // Small delay to let layout settle after autoplay
    const timer = setTimeout(() => {
      stRef.current = ScrollTrigger.create({
        trigger: triggerRef.current!,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5, // Smooth scroll → value mapping
        onUpdate: (self) => {
          animState.scrollInfluence = self.progress
        },
      })
      ScrollTrigger.refresh()
    }, 300)

    return () => {
      clearTimeout(timer)
      stRef.current?.kill()
      stRef.current = null
    }
  }, [enabled, animState, triggerRef])

  return null
}
```

**Step 2: Commit**

```bash
git add src/components/intro-v2/ScrollController.tsx
git commit -m "feat(intro-v2): add scroll controller bridging Lenis to animState"
```

---

## Task 9: Canvas Wrapper + Skip Logic

**Files:**
- Create: `src/components/intro-v2/CrystalIntro.tsx`

Top-level component: Canvas, Suspense, skip button, loading state, scroll spacer.

**Step 1: Write implementation**

```tsx
// src/components/intro-v2/CrystalIntro.tsx
'use client'

import { useRef, useState, useEffect, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import { CrystalScene } from './CrystalScene'
import { ScrollController } from './ScrollController'
import { detectQuality, type QualityConfig, getQualityConfig } from './quality'

export default function CrystalIntro() {
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const scrollSpacerRef = useRef<HTMLDivElement>(null)
  const animStateRef = useRef({ scrollInfluence: 0 })

  const [quality, setQuality] = useState<QualityConfig | null>(null)
  const [showSkip, setShowSkip] = useState(false)
  const [autoplayDone, setAutoplayDone] = useState(false)
  const [skipped, setSkipped] = useState(false)

  // Detect GPU tier on mount
  useEffect(() => {
    detectQuality().then(setQuality)
  }, [])

  // Check reduced motion
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      setQuality(getQualityConfig(0)) // Fallback
      setAutoplayDone(true)
      return
    }
    // Show skip after 1.5s
    const timer = setTimeout(() => setShowSkip(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleAutoplayComplete = useCallback(() => {
    setAutoplayDone(true)
  }, [])

  const handleSkip = useCallback(() => {
    if (!timelineRef.current || skipped) return
    setSkipped(true)
    // Jump to end of timeline
    gsap.to({}, {
      duration: 0.3,
      onUpdate() {
        if (timelineRef.current) {
          timelineRef.current.progress(
            gsap.utils.interpolate(
              timelineRef.current.progress(),
              1,
              this.progress(),
            ),
          )
        }
      },
      onComplete() {
        timelineRef.current?.progress(1)
      },
    })
  }, [skipped])

  // Fallback: static image (tier 0)
  if (quality?.fallback) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display, sans-serif)',
            fontSize: 'clamp(2rem, 8vw, 5rem)',
            letterSpacing: '0.08em',
            color: '#fff',
          }}
        >
          CB.MEDIA
        </h1>
      </div>
    )
  }

  // Loading state while detecting GPU
  if (!quality) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#000',
        }}
      />
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Fixed Canvas — stays in viewport while content scrolls */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
        }}
      >
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
            <CrystalScene
              quality={quality}
              timelineRef={timelineRef}
              onAutoplayComplete={handleAutoplayComplete}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Scroll spacer — provides scroll height for scroll-driven phase */}
      <div
        ref={scrollSpacerRef}
        style={{
          position: 'relative',
          zIndex: 0,
          height: '300vh',
          pointerEvents: autoplayDone ? 'auto' : 'none',
        }}
      >
        {/* First viewport: empty (canvas visible behind) */}
        <div style={{ height: '100vh' }} />

        {/* Remaining scroll: drives the shard spread + transition */}
        <div style={{ height: '200vh' }} />
      </div>

      {/* Skip button */}
      {showSkip && !skipped && !autoplayDone && (
        <button
          onClick={handleSkip}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            padding: '0.5rem 1.25rem',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-display, sans-serif)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.5)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '4px',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
            transition: 'color 0.2s, border-color 0.2s',
            zIndex: 60,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
          }}
        >
          Skip
        </button>
      )}

      {/* Scroll indicator */}
      {autoplayDone && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '0.7rem',
            fontFamily: 'var(--font-display, sans-serif)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          Scroll
        </div>
      )}

      {/* ScrollController — bridges scroll position to animState */}
      <ScrollController
        animState={animStateRef.current}
        enabled={autoplayDone}
        triggerRef={scrollSpacerRef}
      />
    </div>
  )
}
```

**Note:** The animState for scroll is separate from the scene's animState. Task 11 (tuning) will wire them together properly — the CrystalScene's animState needs to be lifted or shared via a ref. For the initial build, this gets the structure right.

**Step 2: Commit**

```bash
git add src/components/intro-v2/CrystalIntro.tsx
git commit -m "feat(intro-v2): add Canvas wrapper with skip, loading, and scroll spacer"
```

---

## Task 10: Hidden Route Page

**Files:**
- Create: `src/app/intro-v2/page.tsx`

**Step 1: Write implementation**

```tsx
// src/app/intro-v2/page.tsx
import dynamic from 'next/dynamic'

const CrystalIntro = dynamic(
  () => import('@/components/intro-v2/CrystalIntro'),
  { ssr: false },
)

export default function IntroV2Page() {
  return <CrystalIntro />
}
```

**Step 2: Commit**

```bash
git add src/app/intro-v2/page.tsx
git commit -m "feat(intro-v2): add hidden /intro-v2 route"
```

---

## Task 11: Build Verification + Visual Check

**Step 1: Run type check**

```bash
pnpm tsc --noEmit
```

Fix any TypeScript errors before proceeding.

**Step 2: Run tests**

```bash
pnpm vitest run src/components/intro-v2/
```

Expected: quality.test.ts and CrystalGeometry.test.ts pass.

**Step 3: Build check**

```bash
pnpm build
```

Fix any build errors. Common issues:
- Missing `'use client'` directives
- Three.js type mismatches
- postprocessing import paths

**Step 4: Start dev server and navigate to /intro-v2**

```bash
pnpm dev
# Open http://localhost:3007/intro-v2
```

**Visual verification checklist:**
- [ ] Black screen → crystal form emerges (Phase 1)
- [ ] Crystal dissolves into scattered shards (Phase 2)
- [ ] "CB.MEDIA" text appears through shard field (Phase 3)
- [ ] Shards respond to scroll after autoplay (Phase 4)
- [ ] Skip button works (jumps to settled state)
- [ ] Shards catch light from lightformers
- [ ] Bloom visible on bright edges
- [ ] No console errors or WebGL warnings

**Step 5: Commit verified build**

```bash
git add -A
git commit -m "feat(intro-v2): complete crystal intro v2 on hidden route

All components integrated: procedural crystal geometry, InstancedMesh
glass shards, WebGL brand text, GSAP timeline, programmatic lighting,
declarative post-processing. Visual verification passed on /intro-v2."
```

---

## Task 12: Visual Tuning Pass

This task is iterative — tune values until the intro feels right.

**Likely tuning targets:**

| Parameter | File | What to adjust |
|-----------|------|---------------|
| Crystal size / camera distance | CrystalScene.tsx | Camera Z position, crystal radius |
| Shard thickness / proportions | CrystalShards.tsx | BoxGeometry dimensions, Z scale |
| Dissolution speed / easing | CrystalScene.tsx | GSAP duration, ease strings |
| Dissolution distance | CrystalShards.tsx | `dissolveDistance` multiplier |
| Text size / position | BrandText.tsx | fontSize, position Y offset |
| Light positions / intensity | Lighting.tsx | Lightformer props |
| Material properties | CrystalShards.tsx, BrandText.tsx | transmission, IOR, roughness, iridescence |
| Post-FX intensity | PostFX.tsx | Bloom intensity/threshold, CA offset |
| Scroll mapping curve | ScrollController.tsx | ScrollTrigger scrub, start/end |
| Shard count / detail level | quality.ts | TIERS config |

**Process:** Adjust → save → hot reload → evaluate → repeat.

Commit tuning changes incrementally with descriptive messages.
