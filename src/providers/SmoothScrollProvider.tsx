'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import Snap from 'lenis/snap'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface SmoothScrollContextValue {
  lenis: Lenis | null
  snap: Snap | null
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({ lenis: null, snap: null })

export function useSmoothScroll() {
  return useContext(SmoothScrollContext)
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [ctx, setCtx] = useState<SmoothScrollContextValue>({ lenis: null, snap: null })

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    // Bridge Lenis scroll events to ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    // Drive Lenis from GSAP ticker for frame-perfect sync
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    // Snap: mandatory snap to viewport-sized sections
    const snap = new Snap(lenis, {
      type: 'mandatory',
      duration: 0.8,
      debounce: 100,
    })

    // Register snap sections after DOM settles
    const registerTimer = setTimeout(() => {
      const sections = document.querySelectorAll<HTMLElement>('[data-snap-section]')
      if (sections.length) {
        snap.addElements(Array.from(sections), { align: ['start'] })
      }
      ScrollTrigger.refresh()
    }, 200)

    setCtx({ lenis, snap })

    return () => {
      clearTimeout(registerTimer)
      snap.destroy()
      lenis.destroy()
      setCtx({ lenis: null, snap: null })
    }
  }, [])

  return (
    <SmoothScrollContext.Provider value={ctx}>
      {children}
    </SmoothScrollContext.Provider>
  )
}
