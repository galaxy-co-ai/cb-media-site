'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { Accordion } from '@/components/sections/Accordion'
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
  const contentRef = useRef<HTMLElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const [introComplete, setIntroComplete] = useState(false)

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
  }, [])

  // ── P7: Scroll-based hero transition ──────────────────────────
  const { scrollYProgress } = useScroll({
    container: mainRef,
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.97])
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.8])
  const heroBlur = useTransform(scrollYProgress, [0, 1], [0, 2])
  const skylineOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.6])

  // ── P3: Cursor-aware hero gradient ──────────────────────────
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
      // Only track if cursor is within the hero section
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

  // Subscribe to spring values and update gradient
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

  const smoothScroll = (target: number) => {
    const main = mainRef.current
    if (!main) return
    main.style.scrollSnapType = 'none'
    gsap.to(main, {
      scrollTop: target,
      duration: 1.8,
      ease: 'power2.inOut',
      onComplete: () => { main.style.scrollSnapType = '' },
    })
  }

  const scrollToContent = () => {
    const target = contentRef.current
    if (!target) return
    smoothScroll(target.offsetTop)
  }

  const scrollToHero = () => {
    smoothScroll(0)
  }

  return (
    <>
      {/* Event Horizon — cinematic intro, stays as ambient background */}
      <CinematicIntro onComplete={handleIntroComplete} />

      {/* P6: Film grain overlay */}
      <svg className="film-grain" aria-hidden="true">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* P6: Vignette overlay */}
      <div className="vignette" aria-hidden="true" />

      {/* Main Content */}
      <main ref={mainRef} className="h-screen overflow-y-auto snap-y snap-mandatory relative z-[51]">
        {/* Hero Section */}
        <section className="h-screen flex flex-col items-center justify-center px-6 pb-24 snap-start relative">
          {/* P3: Cursor gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={gradientStyle}
            aria-hidden="true"
          />

          {/* Scroll target ref — always mounted for useScroll */}
          <div
            ref={heroRef}
            className="flex flex-col items-center justify-center relative z-[2]"
          >
            {/* Hero content — fades in gracefully after intro */}
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

        {/* Accordion Sections */}
        <section ref={contentRef} className="min-h-screen flex flex-col snap-start relative">
          {/* Scroll to Top Chevron */}
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

          <div className="flex-1 px-6 md:px-12 lg:px-24 pt-12 pb-8">
            <Accordion sections={sections} />
          </div>

          {/* Footer */}
          <footer className="border-t border-border px-6 md:px-12 lg:px-24 py-8 mt-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="font-display text-2xl tracking-wider footer-logo">CB MEDIA</span>
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} CB.Media. All rights reserved.
              </span>
            </div>
          </footer>
        </section>
      </main>
    </>
  )
}
