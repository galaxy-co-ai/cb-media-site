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
