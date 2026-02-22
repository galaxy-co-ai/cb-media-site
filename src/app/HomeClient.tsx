'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import dynamic from 'next/dynamic'
import { SectionOrchestrator } from '@/components/sections/SectionOrchestrator'
import type { Section, SiteSettings } from '@/sanity/lib/types'

const CinematicIntro = dynamic(
  () => import('@/components/intro/CinematicIntro'),
  { ssr: false },
)

interface HomeClientProps {
  sections: Section[]
  siteSettings: SiteSettings
}

export function HomeClient({ sections, siteSettings }: HomeClientProps) {
  const heroRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const [introComplete, setIntroComplete] = useState(false)

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
  }, [])

  // ── Scroll-based hero transition ──
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.97])
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.8])

  // ── Footer scroll-driven reveal ──
  const { scrollYProgress: pageProgress } = useScroll()
  const footerOpacity = useTransform(pageProgress, [0.85, 0.98], [0, 1])
  const footerY = useTransform(pageProgress, [0.85, 0.98], [20, 0])
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
        background: `radial-gradient(600px circle at ${smoothX.get() * 100}% ${smoothY.get() * 100}%, rgba(80, 120, 200, 0.07), transparent 70%)`,
      })
    })
    const unsubY = smoothY.on('change', () => {
      setGradientStyle({
        background: `radial-gradient(600px circle at ${smoothX.get() * 100}% ${smoothY.get() * 100}%, rgba(80, 120, 200, 0.07), transparent 70%)`,
      })
    })

    return () => {
      unsubX()
      unsubY()
    }
  }, [smoothX, smoothY, prefersReducedMotion])

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

      {/* Footer — fixed behind main, scroll-driven reveal */}
      <motion.footer
        style={{
          opacity: prefersReducedMotion ? 1 : footerOpacity,
          y: prefersReducedMotion ? 0 : footerY,
        }}
        className="footer-reveal px-6 md:px-10 lg:px-16 py-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-display text-xl tracking-wider footer-logo">{siteSettings.heroHeadline ?? 'CB MEDIA'}</span>
          <span className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CB.Media. All rights reserved.
          </span>
        </div>
      </motion.footer>

      {/* Main scrollable content — Lenis smooth scroll */}
      <main className="main-content relative z-[51]">
        {/* Hero Section */}
        <section id="hero" className="h-screen flex flex-col items-center justify-center px-6 pb-16 relative">
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
                    className="font-display text-5xl md:text-7xl lg:text-8xl text-center tracking-[0.08em]"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 8, ease: [0.25, 0.1, 0.25, 1], delay: 0.5 }}
                  >
                    {siteSettings.heroHeadline ?? 'CB MEDIA'}
                  </motion.h1>

                  <motion.p
                    className="mt-4 text-[clamp(0.625rem,2.5vw,1.125rem)] text-muted-foreground tracking-widest whitespace-nowrap"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 8, ease: [0.25, 0.1, 0.25, 1], delay: 2.5 }}
                  >
                    {siteSettings.heroTagline?.toUpperCase() ?? 'TURNING VISIBILITY INTO VALUE'}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Section content — orchestrated scroll-driven sections */}
        <div id="content">
          <SectionOrchestrator sections={sections} siteSettings={siteSettings} />
        </div>

      </main>
    </>
  )
}
