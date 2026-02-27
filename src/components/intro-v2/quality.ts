import { getGPUTier } from 'detect-gpu'

export interface QualityConfig {
  particleCount: number
  dpr: [number, number]
  transmission: boolean
  fallback: boolean
}

const TIERS: Record<number, QualityConfig> = {
  3: { particleCount: 200, dpr: [1, 2], transmission: true, fallback: false },
  2: { particleCount: 150, dpr: [1, 1.5], transmission: true, fallback: false },
  1: { particleCount: 100, dpr: [1, 1], transmission: false, fallback: false },
  0: { particleCount: 0, dpr: [1, 1], transmission: false, fallback: true },
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
