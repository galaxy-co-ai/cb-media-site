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
