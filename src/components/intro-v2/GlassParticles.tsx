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

        if (p.x > 7) p.x = -7
        if (p.x < -7) p.x = 7
        if (p.y > 4.5) p.y = -4.5
        if (p.y < -4.5) p.y = 4.5
      }

      _position.set(p.x, p.y, p.z)
      _quaternion.identity()

      // Scale logic per phase
      let s: number
      if (isDraining && !isExploded) {
        // During drain: shrink as they approach center
        const dist = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z)
        const shrink = Math.min(1, dist / 2)
        s = p.radius * shrink
      } else if (singularityScale > 0.9 && !isExploded) {
        // Collapsed: all particles hidden
        s = 0
      } else if (isExploded) {
        // Explosion: full size with twinkle
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
