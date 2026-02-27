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
