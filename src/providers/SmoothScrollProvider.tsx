'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface SmoothScrollContextValue {
  lenis: Lenis | null
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({ lenis: null })

export function useSmoothScroll() {
  return useContext(SmoothScrollContext)
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [ctx, setCtx] = useState<SmoothScrollContextValue>({ lenis: null })

  useEffect(() => {
    // Don't hijack scrolling in Sanity Studio — it manages its own panes
    if (window.location.pathname.startsWith('/studio')) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 200)

    setCtx({ lenis })

    return () => {
      clearTimeout(refreshTimer)
      lenis.destroy()
      setCtx({ lenis: null })
    }
  }, [])

  return (
    <SmoothScrollContext.Provider value={ctx}>
      {children}
    </SmoothScrollContext.Provider>
  )
}
