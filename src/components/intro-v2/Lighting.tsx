'use client'

import { Environment, Lightformer } from '@react-three/drei'

export function Lighting() {
  return (
    <Environment resolution={256}>
      <Lightformer
        form="rect"
        intensity={2}
        color="#fffaf0"
        position={[4, 5, -3]}
        scale={[4, 1.5, 1]}
        rotation-y={Math.PI / 4}
      />
      <Lightformer
        form="rect"
        intensity={0.8}
        color="#e0e8ff"
        position={[-4, 2, 2]}
        scale={[2, 4, 1]}
        rotation-y={-Math.PI / 3}
      />
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
