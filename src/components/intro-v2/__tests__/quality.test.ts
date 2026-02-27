import { describe, it, expect } from 'vitest'
import { getQualityConfig } from '../quality'

describe('getQualityConfig', () => {
  it('returns full quality for tier 3', () => {
    const config = getQualityConfig(3)
    expect(config.particleCount).toBe(200)
    expect(config.dpr).toEqual([1, 2])
    expect(config.transmission).toBe(true)
  })

  it('returns reduced quality for tier 2', () => {
    const config = getQualityConfig(2)
    expect(config.particleCount).toBe(150)
    expect(config.transmission).toBe(true)
  })

  it('returns minimal quality for tier 1', () => {
    const config = getQualityConfig(1)
    expect(config.particleCount).toBe(100)
    expect(config.transmission).toBe(false)
  })

  it('returns fallback for tier 0', () => {
    const config = getQualityConfig(0)
    expect(config.fallback).toBe(true)
    expect(config.particleCount).toBe(0)
  })

  it('clamps unknown tiers to 0', () => {
    const config = getQualityConfig(-1)
    expect(config.fallback).toBe(true)
  })
})
