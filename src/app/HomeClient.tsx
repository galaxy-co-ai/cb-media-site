'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { InterstellarBackground } from '@/components/InterstellarBackground'
import { Accordion } from '@/components/sections/Accordion'
import type { Section } from '@/sanity/lib/types'

interface HomeClientProps {
  sections: Section[]
}

// ── P1: Hero entrance choreography ──────────────────────────
const heroTitle = 'CB MEDIA'

const charVariants = {
  hidden: { clipPath: 'inset(100% 0 0 0)' },
  visible: (i: number) => ({
    clipPath: 'inset(0 0 0 0)',
    transition: { duration: 0.5, delay: i * 0.05, ease: [0.33, 1, 0.68, 1] as const },
  }),
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.33, 1, 0.68, 1] as const },
  }),
}

export function HomeClient({ sections }: HomeClientProps) {
  const heroRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion()

  // ── Intro state ───────────────────────────────────────────────
  const [introComplete] = useState(true)

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

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToHero = () => {
    heroRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Interstellar Background — fades on scroll */}
      <motion.div
        style={{ opacity: prefersReducedMotion ? 1 : skylineOpacity }}
        className="fixed inset-0 -z-10"
      >
        <InterstellarBackground />
      </motion.div>

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
      <main ref={mainRef} className="h-screen overflow-y-auto snap-y snap-mandatory">
        {/* Hero Section */}
        <section className="h-screen flex flex-col items-center justify-center px-6 pb-24 snap-start relative">
          {/* P3: Cursor gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={gradientStyle}
            aria-hidden="true"
          />

          {/* P7: Scroll-driven hero content wrapper */}
          <motion.div
            ref={heroRef}
            className="flex flex-col items-center justify-center relative z-[2]"
            style={{
              scale: prefersReducedMotion ? 1 : heroScale,
              opacity: prefersReducedMotion ? 1 : heroOpacity,
              filter: prefersReducedMotion ? 'none' : undefined,
            }}
          >
            {/* P1: Character-by-character mask reveal */}
            <motion.h1
              className="font-display text-6xl md:text-8xl lg:text-9xl text-center tracking-[0.08em]"
              initial="hidden"
              animate={introComplete ? 'visible' : 'hidden'}
            >
              {heroTitle.split('').map((char, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={charVariants}
                  style={{ display: 'inline-block', letterSpacing: '0.08em' }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </motion.h1>

            {/* Tagline — fades in at 650ms */}
            <motion.p
              className="mt-4 text-xl md:text-2xl text-muted-foreground tracking-widest"
              custom={0.65}
              variants={fadeUp}
              initial="hidden"
              animate={introComplete ? 'visible' : 'hidden'}
            >
              TURN VISIBILITY INTO VALUE
            </motion.p>

            {/* Subheading — fades in at 850ms */}
            <motion.p
              className="mt-4 text-base md:text-lg text-muted-foreground tracking-wide text-center max-w-2xl"
              custom={0.85}
              variants={fadeUp}
              initial="hidden"
              animate={introComplete ? 'visible' : 'hidden'}
            >
              Architects of culture, community, and impact.
            </motion.p>
          </motion.div>

          {/* Scroll Chevron — delay bumped to 1.5s */}
          <motion.button
            onClick={scrollToContent}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer z-[2]"
            initial={{ opacity: 0 }}
            animate={introComplete ? { opacity: 1, y: [0, 8, 0] } : { opacity: 0 }}
            transition={{
              opacity: { delay: 1.5, duration: 1 },
              y: { delay: 2.5, duration: 2, repeat: Infinity, ease: 'easeInOut' },
            }}
            aria-label="Scroll to content"
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
