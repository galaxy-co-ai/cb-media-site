import { describe, it, expect } from 'vitest'
import { getQualityConfig } from '../quality'

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
