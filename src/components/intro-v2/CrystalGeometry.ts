import * as THREE from 'three'

export interface ShardData {
  centroids: Float32Array
  normals: Float32Array
  quaternions: Float32Array
  scales: Float32Array
  count: number
}

interface GenerateOptions {
  radius?: number
  detail?: number
  noiseAmplitude?: number
}

export function generateShardData(options: GenerateOptions = {}): ShardData {
  const { radius = 1, detail = 2, noiseAmplitude = 0.05 } = options

  const ico = new THREE.IcosahedronGeometry(radius, detail)
  const nonIndexed = ico.toNonIndexed()
  const positions = nonIndexed.attributes.position.array as Float32Array
  const faceCount = positions.length / 9

  if (noiseAmplitude > 0) {
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      const z = positions[i + 2]
      const hash = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453
      const noise = hash - Math.floor(hash)
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

    centroid.copy(v0).add(v1).add(v2).divideScalar(3)
    centroids[i * 3] = centroid.x
    centroids[i * 3 + 1] = centroid.y
    centroids[i * 3 + 2] = centroid.z

    edge1.subVectors(v1, v0)
    edge2.subVectors(v2, v0)
    normal.crossVectors(edge1, edge2).normalize()
    normals[i * 3] = normal.x
    normals[i * 3 + 1] = normal.y
    normals[i * 3 + 2] = normal.z

    const crossVec = new THREE.Vector3().crossVectors(
      new THREE.Vector3().subVectors(v1, v0),
      new THREE.Vector3().subVectors(v2, v0),
    )
    const area = crossVec.length() * 0.5
    scales[i] = Math.sqrt(area) * 2.5

    quat.setFromUnitVectors(up, normal)
    quaternions[i * 4] = quat.x
    quaternions[i * 4 + 1] = quat.y
    quaternions[i * 4 + 2] = quat.z
    quaternions[i * 4 + 3] = quat.w
  }

  ico.dispose()
  nonIndexed.dispose()

  return { centroids, normals, quaternions, scales, count: faceCount }
}
