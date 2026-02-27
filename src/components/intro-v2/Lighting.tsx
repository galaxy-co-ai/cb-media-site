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
