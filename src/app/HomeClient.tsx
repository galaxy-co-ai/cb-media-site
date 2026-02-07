'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { GridSkylineBackground } from '@/components/GridSkylineBackground'
import { Accordion } from '@/components/sections/Accordion'
import type { Section } from '@/sanity/lib/types'

interface HomeClientProps {
  sections: Section[]
}

export function HomeClient({ sections }: HomeClientProps) {
  const heroRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLElement>(null)

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToHero = () => {
    heroRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Animated Grid Skyline Background */}
      <GridSkylineBackground />

      {/* Main Content */}
      <main className="h-screen overflow-y-auto snap-y snap-proximity">
        {/* Hero Section */}
        <section ref={heroRef} className="h-screen flex flex-col items-center justify-center px-6 pb-24 snap-start relative">
          <h1 className="font-hero text-6xl md:text-8xl lg:text-9xl text-center">
            CB MEDIA
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-muted-foreground tracking-widest">
            TURN VISIBILITY INTO VALUE
          </p>
          <p className="mt-4 text-base md:text-lg text-muted-foreground tracking-wide text-center max-w-2xl">
            Architects of culture, community, and impact.
          </p>

          {/* Scroll Chevron */}
          <motion.button
            onClick={scrollToContent}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 8, 0] }}
            transition={{
              opacity: { delay: 1, duration: 1 },
              y: { delay: 2, duration: 2, repeat: Infinity, ease: 'easeInOut' }
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
              <span className="font-display text-2xl tracking-wider">CB MEDIA</span>
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
