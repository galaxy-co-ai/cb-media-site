'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ScrollControllerProps {
  animState: {
    scrollInfluence: number
  }
  enabled: boolean
  triggerRef: React.RefObject<HTMLDivElement | null>
}

export function ScrollController({
  animState,
  enabled,
  triggerRef,
}: ScrollControllerProps) {
  const stRef = useRef<ScrollTrigger | null>(null)

  useEffect(() => {
    if (!enabled || !triggerRef.current) return

    // Small delay to let layout settle after autoplay
    const timer = setTimeout(() => {
      stRef.current = ScrollTrigger.create({
        trigger: triggerRef.current!,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5, // Smooth scroll → value mapping
        onUpdate: (self) => {
          animState.scrollInfluence = self.progress
        },
      })
      ScrollTrigger.refresh()
    }, 300)

    return () => {
      clearTimeout(timer)
      stRef.current?.kill()
      stRef.current = null
    }
  }, [enabled, animState, triggerRef])

  return null
}
