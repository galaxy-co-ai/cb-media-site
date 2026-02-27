import { describe, it, expect } from 'vitest'
import { generateShardData } from '../CrystalGeometry'

describe('generateShardData', () => {
  it('generates correct number of shards for detail level 2', () => {
    const data = generateShardData({ detail: 2 })
    expect(data.count).toBe(180)
  })

  it('generates correct number of shards for detail level 1', () => {
    const data = generateShardData({ detail: 1 })
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
      expect(dist).toBeCloseTo(radius, 0)
    }
  })

  it('scales are positive', () => {
    const data = generateShardData({ detail: 1 })
    for (let i = 0; i < data.count; i++) {
      expect(data.scales[i]).toBeGreaterThan(0)
    }
  })
})
