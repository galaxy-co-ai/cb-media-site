/** Shared mutable animation state — GSAP writes, R3F + HTML overlay read each frame */
export interface AnimState {
  crystalScale: number
  rotationSpeed: number
  dissolutionProgress: number
  textOpacity: number
  taglineOpacity: number
  scrollInfluence: number
  bloomIntensity: number
  caOffset: number
}

export function createAnimState(): AnimState {
  return {
    crystalScale: 0,
    rotationSpeed: 0.1,
    dissolutionProgress: 0,
    textOpacity: 0,
    taglineOpacity: 0,
    scrollInfluence: 0,
    bloomIntensity: 0,
    caOffset: 0.0006,
  }
}
