'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import {
  velocityShader,
  positionShader,
  renderVertexShader,
  renderFragmentShader,
} from './shaders';
import type { AnimState } from './EventHorizonScene';

interface GPGPUParticlesProps {
  animState: AnimState;
  size?: number; // texture dimension — 256 = 65K particles
}

export default function GPGPUParticles({
  animState,
  size = 128,
}: GPGPUParticlesProps) {
  const { gl } = useThree();
  const meshRef = useRef<THREE.Points>(null);

  // --- GPGPU setup (runs once) ---
  const gpgpu = useMemo(() => {
    const count = size * size;
    const gpuCompute = new GPUComputationRenderer(size, size, gl);

    // Check float texture support
    if (!gl.capabilities.isWebGL2) {
      console.warn('WebGL2 required for GPGPU particles');
    }

    // --- Initial position data: sphere volume distribution ---
    const posTexture = gpuCompute.createTexture();
    const posData = posTexture.image.data as Float32Array;
    for (let i = 0; i < count; i++) {
      const i4 = i * 4;
      // Uniform sphere distribution via cube-root radius
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random()) * 20;
      posData[i4 + 0] = r * Math.sin(phi) * Math.cos(theta);
      posData[i4 + 1] = r * Math.sin(phi) * Math.sin(theta);
      posData[i4 + 2] = r * Math.cos(phi);
      posData[i4 + 3] = 1.0; // lifecycle / spare channel
    }

    // --- Initial velocity data: near-zero with slight drift ---
    const velTexture = gpuCompute.createTexture();
    const velData = velTexture.image.data as Float32Array;
    for (let i = 0; i < count; i++) {
      const i4 = i * 4;
      velData[i4 + 0] = (Math.random() - 0.5) * 0.02;
      velData[i4 + 1] = (Math.random() - 0.5) * 0.02;
      velData[i4 + 2] = (Math.random() - 0.5) * 0.02;
      velData[i4 + 3] = 0;
    }

    // --- Create computation variables ---
    const posVar = gpuCompute.addVariable(
      'texturePosition',
      positionShader,
      posTexture,
    );
    const velVar = gpuCompute.addVariable(
      'textureVelocity',
      velocityShader,
      velTexture,
    );

    // Dependencies: both shaders read both textures
    gpuCompute.setVariableDependencies(posVar, [posVar, velVar]);
    gpuCompute.setVariableDependencies(velVar, [posVar, velVar]);

    // --- Set initial uniform values ---
    const velUniforms = velVar.material.uniforms;
    velUniforms.uDelta = { value: 0.016 };
    velUniforms.uGravity = { value: 0 };
    velUniforms.uDiskFlatten = { value: 0 };
    velUniforms.uCollapseForce = { value: 0 };
    velUniforms.uBrownian = { value: 0.02 };
    velUniforms.uMaxSpeed = { value: 0.1 };
    velUniforms.uTime = { value: 0 };
    velUniforms.uRepulsion = { value: 0 };
    velUniforms.uDrag = { value: 0.998 };

    const posUniforms = posVar.material.uniforms;
    posUniforms.uDelta = { value: 0.016 };

    // --- Initialize ---
    const error = gpuCompute.init();
    if (error !== null) {
      console.error('GPUComputationRenderer init error:', error);
    }

    return { gpuCompute, posVar, velVar, count };
  }, [gl, size]);

  // --- Reference UV attribute for each vertex → GPGPU texel ---
  const referenceAttr = useMemo(() => {
    const refs = new Float32Array(gpgpu.count * 2);
    for (let i = 0; i < gpgpu.count; i++) {
      const x = (i % size) / size + 0.5 / size;
      const y = Math.floor(i / size) / size + 0.5 / size;
      refs[i * 2] = x;
      refs[i * 2 + 1] = y;
    }
    return new THREE.BufferAttribute(refs, 2);
  }, [gpgpu.count, size]);

  // --- Render material ---
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: renderVertexShader,
        fragmentShader: renderFragmentShader,
        uniforms: {
          uPositionTexture: { value: null },
          uVelocityTexture: { value: null },
          uPointSize: { value: 3.0 },
          uColorTemp: { value: 4000 },
          uOpacity: { value: 1.0 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  // --- Dummy position buffer (required by Three.js, but overridden by shader) ---
  const positions = useMemo(() => {
    return new Float32Array(gpgpu.count * 3);
  }, [gpgpu.count]);

  // --- Frame loop: update GPGPU + render uniforms ---
  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.05); // cap at 50ms to avoid spiral on tab-back

    // Update GPGPU uniforms from animState
    const velUniforms = gpgpu.velVar.material.uniforms;
    velUniforms.uDelta.value = clampedDelta;
    velUniforms.uGravity.value = animState.gravity;
    velUniforms.uDiskFlatten.value = animState.diskFlatten;
    velUniforms.uCollapseForce.value = animState.collapseForce;
    velUniforms.uBrownian.value = animState.brownian;
    velUniforms.uMaxSpeed.value = animState.maxSpeed;
    velUniforms.uTime.value += clampedDelta;
    velUniforms.uRepulsion.value = animState.repulsion;
    velUniforms.uDrag.value = animState.drag;

    gpgpu.posVar.material.uniforms.uDelta.value = clampedDelta;

    // Compute next state
    gpgpu.gpuCompute.compute();

    // Push computed textures to render material
    material.uniforms.uPositionTexture.value =
      gpgpu.gpuCompute.getCurrentRenderTarget(gpgpu.posVar).texture;
    material.uniforms.uVelocityTexture.value =
      gpgpu.gpuCompute.getCurrentRenderTarget(gpgpu.velVar).texture;
    material.uniforms.uColorTemp.value = animState.colorTemp;
    material.uniforms.uOpacity.value = animState.particleOpacity;
  });

  // --- Cleanup ---
  useEffect(() => {
    return () => {
      gpgpu.gpuCompute.dispose();
      material.dispose();
    };
  }, [gpgpu, material]);

  return (
    <points ref={meshRef} material={material} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-reference"
          args={[referenceAttr.array as Float32Array, 2]}
        />
      </bufferGeometry>
    </points>
  );
}
