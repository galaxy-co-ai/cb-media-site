'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import dynamic from 'next/dynamic'
import { SectionOrchestrator } from '@/components/sections/SectionOrchestrator'
import { useSmoothScroll } from '@/providers/SmoothScrollProvider'
import type { Section } from '@/sanity/lib/types'

const CinematicIntro = dynamic(
  () => import('@/components/intro/CinematicIntro'),
  { ssr: false },
)

interface HomeClientProps {
  sections: Section[]
}

export function HomeClient({ sections }: HomeClientProps) {
  const heroRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const [introComplete, setIntroComplete] = useState(false)
  const { lenis } = useSmoothScroll()

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
  }, [])

  // ── Scroll-based hero transition (window scroll, not container) ──
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.97])
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.8])
  // ── Cursor-aware hero gradient ──
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const smoothX = useSpring(mouseX, { stiffness: 100, damping: 20 })
  const smoothY = useSpring(mouseY, { stiffness: 100, damping: 20 })
  const [gradientStyle, setGradientStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    if (prefersReducedMotion) return

    const heroEl = heroRef.current
    if (!heroEl) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = heroEl.getBoundingClientRect()
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        mouseX.set((e.clientX - rect.left) / rect.width)
        mouseY.set((e.clientY - rect.top) / rect.height)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY, prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion) return

    const unsubX = smoothX.on('change', () => {
      setGradientStyle({
        background: `radial-gradient(600px circle at ${smoothX.get() * 100}% ${smoothY.get() * 100}%, rgba(80, 120, 200, 0.04), transparent 70%)`,
      })
    })
    const unsubY = smoothY.on('change', () => {
      setGradientStyle({
        background: `radial-gradient(600px circle at ${smoothX.get() * 100}% ${smoothY.get() * 100}%, rgba(80, 120, 200, 0.04), transparent 70%)`,
      })
    })

    return () => {
      unsubX()
      unsubY()
    }
  }, [smoothX, smoothY, prefersReducedMotion])

  const scrollToContent = () => {
    if (lenis) {
      lenis.scrollTo('#content', { duration: 1.8 })
    } else {
      document.getElementById('content')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToHero = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.8 })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Event Horizon — cinematic intro, stays as ambient background */}
      <CinematicIntro onComplete={handleIntroComplete} />

      {/* Film grain overlay */}
      <svg className="film-grain" aria-hidden="true">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Vignette overlay */}
      <div className="vignette" aria-hidden="true" />

      {/* Footer — fixed behind main, revealed as main scrolls away */}
      <footer className="footer-reveal border-t border-border px-6 md:px-12 lg:px-24 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-display text-2xl tracking-wider footer-logo">CB MEDIA</span>
          <span className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CB.Media. All rights reserved.
          </span>
        </div>
      </footer>

      {/* Main scrollable content — no snap, Lenis drives scroll */}
      <main className="main-content relative z-[51]">
        {/* Hero Section */}
        <section className="h-screen flex flex-col items-center justify-center px-6 pb-24 relative">
          {/* Cursor gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={gradientStyle}
            aria-hidden="true"
          />

          <div
            ref={heroRef}
            className="flex flex-col items-center justify-center relative z-[2]"
          >
            <AnimatePresence>
              {introComplete && (
                <motion.div
                  className="flex flex-col items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    scale: prefersReducedMotion ? 1 : heroScale,
                    opacity: prefersReducedMotion ? 1 : heroOpacity,
                    filter: prefersReducedMotion ? 'none' : undefined,
                  }}
                >
                  <motion.h1
                    className="font-display text-6xl md:text-8xl lg:text-9xl text-center tracking-[0.08em]"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 8, ease: [0.25, 0.1, 0.25, 1], delay: 0.5 }}
                  >
                    CB MEDIA
                  </motion.h1>

                  <motion.p
                    className="mt-4 text-[clamp(0.75rem,3.5vw,1.5rem)] text-muted-foreground tracking-widest whitespace-nowrap"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 8, ease: [0.25, 0.1, 0.25, 1], delay: 2.5 }}
                  >
                    TURNING VISIBILITY INTO VALUE
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {introComplete && (
              <motion.button
                onClick={scrollToContent}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer z-[2]"
                aria-label="Scroll to content"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 8, ease: [0.25, 0.1, 0.25, 1], delay: 2.5 }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </section>

        {/* Section content — orchestrated scroll-driven sections */}
        <div id="content">
          {/* Scroll to Top Chevron */}
          <div className="relative">
            <motion.button
              onClick={scrollToHero}
              className="absolute top-4 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer z-10"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Scroll to top"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </motion.button>
          </div>

          <SectionOrchestrator sections={sections} />
        </div>

      </main>
    </>
  )
}
