/** Shared mutable animation state — GSAP writes, R3F + HTML overlay read each frame */
export interface AnimState {
  particleScale: number   // 0→1 during intro emergence
  textOpacity: number     // 0→1 headline
  taglineOpacity: number  // 0→1 tagline
  scrollInfluence: number // reserved for production integration
}

export function createAnimState(): AnimState {
  return {
    particleScale: 0,
    textOpacity: 0,
    taglineOpacity: 0,
    scrollInfluence: 0,
  }
}
