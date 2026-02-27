import { getGPUTier } from 'detect-gpu'

export interface QualityConfig {
  shardCount: number
  dpr: [number, number]
  transmission: boolean
  fallback: boolean
  postFX: {
    bloom: boolean
    chromaticAberration: boolean
    vignette: boolean
  }
}

const TIERS: Record<number, QualityConfig> = {
  3: {
    shardCount: 320,
    dpr: [1, 2],
    transmission: true,
    fallback: false,
    postFX: { bloom: true, chromaticAberration: true, vignette: true },
  },
  2: {
    shardCount: 200,
    dpr: [1, 1.5],
    transmission: true,
    fallback: false,
    postFX: { bloom: true, chromaticAberration: false, vignette: true },
  },
  1: {
    shardCount: 120,
    dpr: [1, 1],
    transmission: false,
    fallback: false,
    postFX: { bloom: true, chromaticAberration: false, vignette: false },
  },
  0: {
    shardCount: 0,
    dpr: [1, 1],
    transmission: false,
    fallback: true,
    postFX: { bloom: false, chromaticAberration: false, vignette: false },
  },
}

export function getQualityConfig(tier: number): QualityConfig {
  return TIERS[Math.max(0, Math.min(3, tier))] ?? TIERS[0]
}

export async function detectQuality(): Promise<QualityConfig> {
  try {
    const gpuTier = await getGPUTier()
    return getQualityConfig(gpuTier.tier)
  } catch {
    return getQualityConfig(1)
  }
}
